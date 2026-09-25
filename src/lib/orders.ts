import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, UPSELL_PRICE } from "@/lib/pricing";
import { generateOrderReference } from "@/lib/wompi";

// Server-side order creation. Prices, shipping and discounts are always
// recomputed from the database — totals sent by the browser are ignored.

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export interface CreateOrderInput {
  items: unknown;
  shippingAddress: unknown;
  customerEmail: unknown;
  promoCode?: unknown;
  upsell?: unknown;
  userId?: string | null;
  reference?: string;
  paymentStatus?: string;
  /** Customer ticked the data-processing authorization (Ley 1581) */
  acceptPrivacy?: unknown;
}

const MAX_QTY_PER_ITEM = 20;
const MAX_ITEMS = 50;

function parseItems(raw: unknown): Map<string, number> {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ITEMS) {
    throw new OrderError("El pedido no tiene productos válidos");
  }
  const quantities = new Map<string, number>();
  for (const item of raw) {
    const variantId = (item as { variantId?: unknown })?.variantId;
    const quantity = (item as { quantity?: unknown })?.quantity;
    if (typeof variantId !== "string" || !Number.isInteger(quantity) || (quantity as number) < 1) {
      throw new OrderError("Producto inválido en el pedido");
    }
    const total = (quantities.get(variantId) ?? 0) + (quantity as number);
    if (total > MAX_QTY_PER_ITEM) {
      throw new OrderError(`Máximo ${MAX_QTY_PER_ITEM} unidades por producto`);
    }
    quantities.set(variantId, total);
  }
  return quantities;
}

export async function createOrder(input: CreateOrderInput) {
  const quantities = parseItems(input.items);

  if (input.acceptPrivacy !== true) {
    throw new OrderError("Debes autorizar el tratamiento de tus datos personales para continuar");
  }

  const email = typeof input.customerEmail === "string" ? input.customerEmail.toLowerCase().trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw new OrderError("Correo electrónico inválido");
  }
  const shippingAddress = typeof input.shippingAddress === "string" ? input.shippingAddress.trim() : "";
  if (shippingAddress.length < 5 || shippingAddress.length > 500) {
    throw new OrderError("Dirección de envío inválida");
  }

  return db.$transaction(async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { id: { in: [...quantities.keys()] } },
      include: { product: { select: { price: true, isActive: true, title: true } } },
    });
    if (variants.length !== quantities.size) {
      throw new OrderError("Uno de los productos ya no está disponible");
    }

    let itemsSubtotal = 0;
    for (const v of variants) {
      if (!v.product.isActive) {
        throw new OrderError(`"${v.product.title}" ya no está disponible`);
      }
      itemsSubtotal += v.product.price * quantities.get(v.id)!;
    }

    const upsell = input.upsell === true ? UPSELL_PRICE : 0;
    const subtotal = itemsSubtotal + upsell;
    const shipping = itemsSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    // Promo code: same rules as /api/promo, usage counted atomically
    let discount = 0;
    if (typeof input.promoCode === "string" && input.promoCode.trim()) {
      const promo = await tx.promoCode.findUnique({
        where: { code: input.promoCode.toUpperCase().trim() },
      });
      if (
        !promo ||
        !promo.isActive ||
        (promo.expiresAt && promo.expiresAt < new Date()) ||
        (promo.minPurchase !== null && subtotal < promo.minPurchase)
      ) {
        throw new OrderError("El código de descuento no es válido para este pedido");
      }
      const used = await tx.promoCode.updateMany({
        where: {
          id: promo.id,
          ...(promo.maxUses !== null ? { usedCount: { lt: promo.maxUses } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (used.count === 0) {
        throw new OrderError("Este código ya no está disponible");
      }
      discount =
        promo.type === "PERCENTAGE" ? Math.round((subtotal * promo.value) / 100) : promo.value;
    }

    const totalAmount = Math.max(0, subtotal + shipping - discount);

    // Decrement stock only if enough units remain (prevents negative stock)
    for (const v of variants) {
      const qty = quantities.get(v.id)!;
      const updated = await tx.productVariant.updateMany({
        where: { id: v.id, stockQuantity: { gte: qty } },
        data: { stockQuantity: { decrement: qty } },
      });
      if (updated.count === 0) {
        throw new OrderError(
          `No hay suficiente stock de "${v.product.title}" (${v.size}/${v.color})`,
          409
        );
      }
    }

    return tx.order.create({
      data: {
        userId: input.userId ?? null,
        totalAmount,
        shippingAddress,
        customerEmail: email,
        status: "PENDING",
        // Every order gets a public reference the customer can quote/track
        reference: input.reference ?? generateOrderReference(),
        paymentStatus: input.paymentStatus,
        privacyAcceptedAt: new Date(),
        items: {
          create: variants.map((v) => ({
            productVariantId: v.id,
            quantity: quantities.get(v.id)!,
            priceAtPurchase: v.product.price,
          })),
        },
      },
      include: { items: true },
    });
  });
}

/** Maps any error from createOrder to a JSON-friendly { message, status }. */
export function orderErrorResponse(error: unknown): { message: string; status: number } {
  if (error instanceof OrderError) return { message: error.message, status: error.status };
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Order creation DB error:", error.code, error.message);
  } else {
    console.error("Order creation error:", error);
  }
  return { message: "Error al procesar el pedido", status: 500 };
}

/**
 * Updates an order's status, returning stock to inventory when it becomes
 * CANCELLED and taking it back if a cancelled order is reopened.
 */
export async function updateOrderStatus(id: string, status: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return null;

    const wasCancelled = order.status === "CANCELLED";
    const isCancelled = status === "CANCELLED";
    if (wasCancelled !== isCancelled) {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stockQuantity: isCancelled ? { increment: item.quantity } : { decrement: item.quantity },
          },
        });
      }
    }

    return tx.order.update({ where: { id }, data: { status } });
  });
}
