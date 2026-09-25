import { NextResponse } from 'next/server';
import { buildWompiCheckoutUrl, generateOrderReference, isWompiEnabled } from '@/lib/wompi';
import { getSession } from '@/lib/auth';
import { createOrder, orderErrorResponse } from '@/lib/orders';
import { rateLimit } from '@/lib/rateLimit';

// GET — lets the checkout know whether online payment is available
export async function GET() {
  return NextResponse.json({ enabled: isWompiEnabled() });
}

// POST — creates the order (server-priced) and returns the Wompi checkout URL
export async function POST(request: Request) {
  if (!isWompiEnabled()) {
    return NextResponse.json({ error: 'El pago en línea no está disponible' }, { status: 503 });
  }

  const limited = rateLimit(request, 'orders', 10, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { items, shippingAddress, customerEmail, promoCode, upsell, acceptPrivacy } = body;

    const session = await getSession();
    const reference = generateOrderReference();

    // Total is computed server-side from DB prices (client totals are ignored)
    const order = await createOrder({
      items,
      shippingAddress,
      customerEmail,
      promoCode,
      upsell,
      acceptPrivacy,
      userId: session?.id ?? null,
      reference,
      paymentStatus: 'PENDING',
    });

    const origin = process.env.SITE_URL || new URL(request.url).origin;
    const checkoutUrl = buildWompiCheckoutUrl({
      reference,
      amountInCents: Math.round(order.totalAmount * 100),
      redirectUrl: `${origin.replace(/\/$/, '')}/?view=order-confirmation&ref=${reference}`,
      customerEmail: order.customerEmail!,
    });

    return NextResponse.json({ orderId: order.id, reference, checkoutUrl });
  } catch (error) {
    const { message, status } = orderErrorResponse(error);
    return NextResponse.json({ error: message }, { status });
  }
}
