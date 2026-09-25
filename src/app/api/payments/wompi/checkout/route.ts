import { NextResponse } from 'next/server';
import { createWompiCheckoutConfig, generateOrderReference } from '@/lib/wompi';
import { getSession } from '@/lib/auth';
import { createOrder, orderErrorResponse } from '@/lib/orders';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const limited = rateLimit(request, 'orders', 10, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { items, shippingAddress, customerEmail, customerName, promoCode, upsell } = body;

    if (!customerEmail || !customerName) {
      return NextResponse.json({ error: 'Datos del cliente requeridos' }, { status: 400 });
    }

    const session = await getSession();
    const reference = generateOrderReference();

    // Total is computed server-side from DB prices (client totalAmount is ignored)
    const order = await createOrder({
      items,
      shippingAddress,
      customerEmail,
      promoCode,
      upsell,
      userId: session?.id ?? null,
      reference,
      paymentStatus: 'PENDING',
    });

    const checkoutConfig = createWompiCheckoutConfig(
      reference,
      Math.round(order.totalAmount * 100),
      order.customerEmail!,
      String(customerName)
    );

    return NextResponse.json({
      orderId: order.id,
      reference: order.reference,
      checkout: checkoutConfig,
    });
  } catch (error) {
    const { message, status } = orderErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
