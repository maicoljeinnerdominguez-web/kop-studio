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