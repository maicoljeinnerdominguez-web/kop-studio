import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

const VALID_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where: Record<string, string> = {};
  if (status && VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    where.status = status;
  }

  const orders = await db.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          productVariant: {
            include: {
              product: {
                select: {
                  title: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}