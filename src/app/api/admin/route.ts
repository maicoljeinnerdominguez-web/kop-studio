import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [totalSales, pendingOrders, activeProducts, totalOrders, recentOrders] =
    await Promise.all([
      db.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      }),
      db.order.count({ where: { status: "PENDING" } }),
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              productVariant: {
                include: {
                  product: { select: { title: true } },
                },
              },
            },
          },
        },
      }),
    ]);

  return NextResponse.json({
    totalSales: totalSales._sum.totalAmount || 0,
    pendingOrders,
    activeProducts,
    totalOrders,
    recentOrders,
  });
}