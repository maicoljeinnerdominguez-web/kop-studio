import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { rewriteOrderImages } from '@/lib/rewriteImages';
import { requireAdmin } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/orders';

const VALID_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: {
        include: {
          productVariant: {
            include: {
              product: {
                select: {
                  title: true,
                  slug: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(rewriteOrderImages(order as unknown as Record<string, unknown>) as typeof order);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED' },
        { status: 400 }
      );
    }

    // Also returns/takes back stock when the order is cancelled/reopened
    const changed = await updateOrderStatus(id, status);
    if (!changed) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await db.order.findUniqueOrThrow({
      where: { id },
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
    });

    return NextResponse.json(rewriteOrderImages(updatedOrder as unknown as Record<string, unknown>) as typeof updatedOrder);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}