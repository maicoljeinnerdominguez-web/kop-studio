import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'

// Stores subscribers with the date of their express consent (Ley 1581).
// Export them from Admin → Configuración to send campaigns.
export async function POST(request: Request) {
  const limited = rateLimit(request, 'newsletter', 5, 60 * 60 * 1000)
  if (limited) return limited

  try {
    const body = await request.json()
    const { email, acceptPrivacy } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'El correo electrónico es obligatorio.' },
        { status: 400 }
      )
    }

    const normalized = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalized) || normalized.length > 254) {
      return NextResponse.json(
        { success: false, message: 'Ingresa un correo electrónico válido.' },
        { status: 400 }
      )
    }

    if (acceptPrivacy !== true) {
      return NextResponse.json(
        { success: false, message: 'Debes autorizar el envío de comunicaciones.' },
        { status: 400 }
      )
    }

    await db.newsletterSubscriber.upsert({
      where: { email: normalized },
      update: { consentAt: new Date() },
      create: { email: normalized, consentAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: '¡Suscripción exitosa!',
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error del servidor. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
