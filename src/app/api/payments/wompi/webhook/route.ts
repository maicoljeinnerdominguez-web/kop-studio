import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyWompiSignature } from '@/lib/wompi';

export async function POST(request: Request) {
  try {
    const event = await request.json();

    // Reject anything not signed by Wompi (prevents faking "APPROVED" payments)
    if (!verifyWompiSignature(event)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const transaction = event.data?.transaction;
    if (!transaction || !transaction.reference) {
      return NextResponse.json({ error: 'Missing transaction data' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { reference: transaction.reference },
    });

    if (!order) {
      console.error(`Order not found for reference: ${transaction.reference}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // An approved payment must match the order total exactly
    const expectedCents = Math.round(order.totalAmount * 100);
    if (transaction.status === 'APPROVED' && transaction.amount_in_cents !== expectedCents) {
      console.error(
        `Amount mismatch for ${order.reference}: got ${transaction.amount_in_cents}, expected ${expectedCents}`
      );
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'AMOUNT_MISMATCH', wompiTransactionId: transaction.id },
      });
      return NextResponse.json({ received: true });
    }

    // Map Wompi status to the order statuses used by the admin panel
    const statusMap: Record<string, string> = {
      APPROVED: 'PAID',
      DECLINED: 'CANCELLED',
      VOIDED: 'CANCELLED',
      ERROR: 'CANCELLED',
    };
    const newStatus = statusMap[transaction.status] ?? order.status;
    const wasCancelled = order.status === 'CANCELLED';

    await db.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentStatus: transaction.status === 'APPROVED' ? 'PAID' : transaction.status,
        wompiTransactionId: transaction.id,
        paymentMethodType: transaction.payment_method_type || null,
      },
    });

    console.log(`Order ${order.reference} updated: ${transaction.status} (${transaction.payment_method_type})`);

    // Payment failed: restore stock once (webhooks may be retried)
    if (newStatus === 'CANCELLED' && !wasCancelled) {
      const orderItems = await db.orderItem.findMany({
        where: { orderId: order.id },
      });
      for (const item of orderItems) {
        try {
          await db.productVariant.update({
            where: { id: item.productVariantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        } catch { /* ignore */ }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
