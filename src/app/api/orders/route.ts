import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createOrder, orderErrorResponse } from "@/lib/orders";
import { rateLimit } from "@/lib/rateLimit";

// GET /api/orders — admins see all orders; customers only see their own.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const where =
    session.role === "ADMIN"
      ? {}
      : { OR: [{ userId: session.id }, { customerEmail: session.email.toLowerCase() }] };

  const orders = await db.order.findMany({
    where,
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
  return NextResponse.json(orders, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, "orders", 10, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const session = await getSession();

    const order = await createOrder({
      items: body.items,
      shippingAddress: body.shippingAddress,
      customerEmail: body.customerEmail,
      promoCode: body.promoCode,
      upsell: body.upsell,
      acceptPrivacy: body.acceptPrivacy,
      userId: session?.id ?? null,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const { message, status } = orderErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
