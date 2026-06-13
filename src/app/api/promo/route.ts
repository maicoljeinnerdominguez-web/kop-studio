import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body as { code?: string; subtotal?: number };

    if (!code || typeof subtotal !== 'number' || subtotal <= 0) {
      return NextResponse.json(
        { valid: false, error: 'Código y monto requeridos' },
        { status: 400 }
      );
    }

    const promo = await db.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json(
        { valid: false, error: 'Código no encontrado' },
        { status: 200 }
      );
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Este código ha expirado' },
        { status: 200 }
      );
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json(
        { valid: false, error: 'Este código ya no está disponible' },
        { status: 200 }
      );
    }

    if (promo.minPurchase !== null && subtotal < promo.minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          error: `El monto mínimo de compra es $${Math.round(promo.minPurchase).toLocaleString('es-CO')}`,
        },
        { status: 200 }
      );
    }

    const discountAmount =
      promo.type === 'PERCENTAGE'
        ? Math.round((subtotal * promo.value) / 100)
        : promo.value;

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discountAmount,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: 'Error al validar el código' },
      { status: 500 }
    );
  }
}