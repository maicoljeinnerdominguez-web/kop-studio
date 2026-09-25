import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applyWompiTransaction, fetchWompiTransaction } from '@/lib/wompi';
import { rateLimit } from '@/lib/rateLimit';

// GET /api/payments/wompi/status?ref=KOP-...&id=<wompi transaction id>
// Called by the confirmation page after Wompi redirects back. If the webhook
// hasn't arrived yet, the transaction is read from Wompi's API directly.
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'payment-status', 60, 10 * 60 * 1000);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('ref');
  const transactionId = searchParams.get('id');
  if (!reference) {
    return NextResponse.json({ error: 'Referencia requerida' }, { status: 400 });
  }

  let order = await db.order.findUnique({ where: { reference } });
  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  if (order.status === 'PENDING' && transactionId) {
    const transaction = await fetchWompiTransaction(transactionId);
    // Only trust the transaction if it belongs to this order
    if (transaction && transaction.reference === reference) {
      order = (await applyWompiTransaction(transaction)) ?? order;
    }
  }

  return NextResponse.json(
    {
      reference: order.reference,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
