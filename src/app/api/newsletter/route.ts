import { NextResponse } from 'next/server'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'El correo electrónico es obligatorio.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Ingresa un correo electrónico válido.' },
        { status: 400 }
      )
    }

    // Simulate a real API call with a small delay
    await delay(300)

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