import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
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
      user: { select: { name: true, email: true } },
      items: {
        include: {
          productVariant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
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
              include: { product: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
