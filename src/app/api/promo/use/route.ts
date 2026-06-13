import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code?: string };

    if (!code) {
      return NextResponse.json(
        { error: 'Código es requerido' },
        { status: 400 }
      );
    }

    const promo = await db.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo) {
      return NextResponse.json(
        { error: 'Código no encontrado' },
        { status: 404 }
      );
    }

    await db.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Error al registrar uso del código' },
      { status: 500 }
    );
  }
}