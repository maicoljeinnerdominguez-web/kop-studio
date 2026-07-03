import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { createWompiCheckoutConfig, generateOrderReference } from '@/lib/wompi';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, totalAmount, shippingAddress, customerEmail, customerName, userId, promoCode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No hay items en el pedido' }, { status: 400 });
    }

    if (!customerEmail || !customerName) {
      return NextResponse.json({ error: 'Datos del cliente requeridos' }, { status: 400 });
    }

    const reference = generateOrderReference();
    const amountInCents = Math.round(totalAmount * 100);

    // Create order
    const order = await db.order.create({
      data: {
        userId: userId || null,
        reference,
        totalAmount,
        shippingAddress,
        customerEmail: customerEmail.toLowerCase().trim(),
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: { variantId: string; quantity: number; price: number }) => ({
            productVariantId: item.variantId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of items) {
      try {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      } catch {
        // Stock decrement failed but order is created - will be handled by admin
      }
    }

    // Create Wompi checkout config
    const checkoutConfig = createWompiCheckoutConfig(
      reference,
      amountInCents,
      customerEmail,
      customerName
    );

    return NextResponse.json({
      orderId: order.id,
      reference: order.reference,
      checkout: checkoutConfig,
    });
  } catch (error) {
    console.error('Wompi checkout error:', error);
    return NextResponse.json(
      { error: 'Error al crear la transacción de pago' },
      { status: 500 }
    );
  }
}