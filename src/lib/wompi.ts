import crypto from 'crypto';
import { db } from '@/lib/db';

export function getWompiBaseUrl(): string {
  const env = process.env.WOMPI_ENVIRONMENT || 'test';
  return env === 'production'
    ? 'https://production.wompi.co'
    : 'https://sandbox.wompi.co';
}

export function getWompiPublicKey(): string {
  return process.env.WOMPI_PUBLIC_KEY || '';
}

/** Online payment is offered only when both the public and integrity keys are set. */
export function isWompiEnabled(): boolean {
  return !!process.env.WOMPI_PUBLIC_KEY && !!process.env.WOMPI_INTEGRITY_KEY;
}

export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `KOP-${timestamp}-${random}`;
}

export function generateWompiSignature(
  reference: string,
  amountInCents: number,
  currency: string = 'COP'
): string {
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY || '';
  const stringToSign = `${reference}${amountInCents}${currency}${integrityKey}`;
  return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

/**
 * Verifies a Wompi event per https://docs.wompi.co/docs/colombia/eventos/ :
 * SHA256( values of signature.properties (paths inside event.data) + timestamp + WOMPI_EVENTS_SECRET )
 * must equal signature.checksum. Returns false if the secret is not configured.
 */
export function verifyWompiSignature(event: any): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  const properties = event?.signature?.properties;
  const checksum = event?.signature?.checksum;
  if (!secret || !Array.isArray(properties) || typeof checksum !== 'string' || !event.timestamp) {
    return false;
  }

  const values = properties.map((prop: string) =>
    String(prop.split('.').reduce((obj: any, key: string) => obj?.[key], event.data) ?? '')
  );
  const expected = crypto
    .createHash('sha256')
    .update(values.join('') + event.timestamp + secret)
    .digest('hex');

  const a = Buffer.from(expected.toLowerCase());
  const b = Buffer.from(checksum.toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** URL of Wompi's hosted Web Checkout (card, PSE, Nequi, Bancolombia...). */
export function buildWompiCheckoutUrl(opts: {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  customerEmail: string;
}): string {
  const params = new URLSearchParams({
    'public-key': getWompiPublicKey(),
    currency: 'COP',
    'amount-in-cents': String(opts.amountInCents),
    reference: opts.reference,
    'signature:integrity': generateWompiSignature(opts.reference, opts.amountInCents),
    'redirect-url': opts.redirectUrl,
    'customer-data:email': opts.customerEmail,
  });
  return `https://checkout.wompi.co/p/?${params.toString()}`;
}

export interface WompiTransaction {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  payment_method_type?: string;
}

/** Reads a transaction from Wompi's public API (used when the customer returns). */
export async function fetchWompiTransaction(id: string): Promise<WompiTransaction | null> {
  try {
    const res = await fetch(`${getWompiBaseUrl()}/v1/transactions/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as WompiTransaction) ?? null;
  } catch {
    return null;
  }
}

/**
 * Applies a (verified) Wompi transaction to its order. Idempotent: safe to call
 * from both the webhook and the customer's return redirect.
 */
export async function applyWompiTransaction(transaction: WompiTransaction) {
  const order = await db.order.findUnique({
    where: { reference: transaction.reference },
  });
  if (!order) return null;

  // An approved payment must match the order total exactly
  const expectedCents = Math.round(order.totalAmount * 100);
  if (transaction.status === 'APPROVED' && transaction.amount_in_cents !== expectedCents) {
    console.error(
      `Amount mismatch for ${order.reference}: got ${transaction.amount_in_cents}, expected ${expectedCents}`
    );
    return db.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'AMOUNT_MISMATCH', wompiTransactionId: transaction.id },
    });
  }

  // Map Wompi status to the order statuses used by the admin panel
  const statusMap: Record<string, string> = {
    APPROVED: 'PAID',
    DECLINED: 'CANCELLED',
    VOIDED: 'CANCELLED',
    ERROR: 'CANCELLED',
  };
  // Never move an order backwards (e.g. SHIPPED -> PAID on a webhook retry)
  const newStatus = order.status === 'PENDING' ? statusMap[transaction.status] ?? order.status : order.status;

  return db.$transaction(async (tx) => {
    // Payment failed: return stock once
    if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paymentStatus: transaction.status === 'APPROVED' ? 'PAID' : transaction.status,
        wompiTransactionId: transaction.id,
        paymentMethodType: transaction.payment_method_type || null,
      },
    });
  });
}
