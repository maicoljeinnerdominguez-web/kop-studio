import crypto from 'crypto';

export function getWompiBaseUrl(): string {
  const env = process.env.WOMPI_ENVIRONMENT || 'test';
  return env === 'production'
    ? 'https://production.wompi.co'
    : 'https://sandbox.wompi.co';
}

export function getWompiPublicKey(): string {
  return process.env.WOMPI_PUBLIC_KEY || '';
}

export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
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

export function verifyWompiSignature(event: any): boolean {
  const signature = event.signature;
  if (!signature) return false;

  const integrityKey = process.env.WOMPI_EVENTS_SECRET || '';
  // Wompi webhook signature verification
  const data = JSON.stringify(event.data || event);
  const expectedSignature = crypto
    .createHmac('sha256', integrityKey)
    .update(data)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export interface WompiCheckoutConfig {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: string;
  redirectUrl: string;
  signature: string;
  testMode: boolean;
  customerEmail: string;
  customerName: string;
}

export function createWompiCheckoutConfig(
  orderReference: string,
  totalInCents: number,
  customerEmail: string,
  customerName: string
): WompiCheckoutConfig {
  return {
    publicKey: getWompiPublicKey(),
    reference: orderReference,
    amountInCents: totalInCents,
    currency: 'COP',
    redirectUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/?view=order-confirmation`,
    signature: generateWompiSignature(orderReference, totalInCents),
    testMode: process.env.WOMPI_ENVIRONMENT !== 'production',
    customerEmail,
    customerName,
  };
}