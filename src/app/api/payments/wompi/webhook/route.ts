import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const event = await request.json();

    // Validate the event has required fields
    if (!event.event || !event.data) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { data } = event;
    const transaction = data.transaction;

    if (!transaction || !transaction.reference) {
      return NextResponse.json({ error: 'Missing transaction data' }, { status: 400 });
    }

    // Find the order by reference
    const order = await db.order.findUnique({
      where: { reference: transaction.reference },
    });

    if (!order) {
      console.error(`Order not found for reference: ${transaction.reference}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Map Wompi status to our status
    const statusMap: Record<string, string> = {
      'APPROVED': 'APPROVED',
      'PENDING': 'PENDING',
      'DECLINED': 'DECLINED',
      'VOIDED': 'CANCELLED',
      'ERROR': 'FAILED',
    };

    const newStatus = statusMap[transaction.status] || 'PENDING';
    const newPaymentStatus = transaction.status === 'APPROVED' ? 'PAID' : transaction.status;

    // Update order
    await db.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        wompiTransactionId: transaction.id,
        paymentMethodType: transaction.payment_method_type || null,
      },
    });

    console.log(`Order ${order.reference} updated: ${transaction.status} (${transaction.payment_method_type})`);

    // If payment declined, restore stock
    if (transaction.status === 'DECLINED' || transaction.status === 'VOIDED') {
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