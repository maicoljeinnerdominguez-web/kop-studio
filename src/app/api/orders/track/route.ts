import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { rewriteOrderImagesList } from '@/lib/rewriteImages';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'track', 20, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    // Public lookup by email: never expose address or contact data
    const orders = await db.order.findMany({
      where: { userId: user.id },
      omit: { shippingAddress: true, customerEmail: true, userId: true },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    category: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders: rewriteOrderImagesList(orders as unknown as Record<string, unknown>[]) as typeof orders });
  } catch {
    return NextResponse.json(
      { error: 'Error al buscar pedidos' },
      { status: 500 }
    );
  }
}