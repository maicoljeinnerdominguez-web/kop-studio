import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      reference: true,
      status: true,
      paymentStatus: true,
      paymentMethodType: true,
      totalAmount: true,
      createdAt: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  return NextResponse.json(order);
}