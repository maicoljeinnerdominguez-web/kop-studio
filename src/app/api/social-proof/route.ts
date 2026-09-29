import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Recent REAL purchases for the "alguien en X compró Y" notification.
// Only city + product + time are exposed — never names, emails or addresses.
const PAID_STATUSES = ["PAID", "SHIPPED", "DELIVERED"];
const MAX_AGE_DAYS = 30;

/** Orders store "address, neighborhood, city - department, CP: ..." */
function cityFrom(shippingAddress: string): string | null {
  const beforeDept = shippingAddress.split(" - ")[0] ?? "";
  const city = beforeDept.split(",").pop()?.trim();
  return city && city.length <= 40 ? city : null;
}

export async function GET() {
  try {
    const since = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
    const orders = await db.order.findMany({
      where: { status: { in: PAID_STATUSES }, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        createdAt: true,
        shippingAddress: true,
        items: {
          take: 1,
          select: { productVariant: { select: { product: { select: { title: true, isActive: true } } } } },
        },
      },
    });

    const items = orders
      .map((o) => {
        const product = o.items[0]?.productVariant.product;
        const city = cityFrom(o.shippingAddress);
        if (!product?.isActive || !city) return null;
        return { city, product: product.title, at: o.createdAt.toISOString() };
      })
      .filter(Boolean);

    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json({ items: [] });
  }
}
