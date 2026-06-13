import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await db.order.findMany({
    include: {
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { items, totalAmount, shippingAddress, userId } = body;

  const order = await db.order.create({
    data: {
      userId,
      totalAmount,
      shippingAddress,
      status: "PENDING",
      items: {
        create: items.map(
          (item: { variantId: string; quantity: number; price: number }) => ({
            productVariantId: item.variantId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          })
        ),
      },
    },
    include: { items: true },
  });

  // Decrease stock
  for (const item of items) {
    await db.productVariant.update({
      where: { id: item.variantId },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }

  return NextResponse.json(order, { status: 201 });
}