import { NextResponse } from 'next/server';
import { applyWompiTransaction, verifyWompiSignature } from '@/lib/wompi';

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

    const order = await applyWompiTransaction(transaction);
    if (!order) {
      console.error(`Order not found for reference: ${transaction.reference}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`Order ${order.reference} updated: ${transaction.status} (${transaction.payment_method_type})`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
