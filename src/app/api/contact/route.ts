import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'El correo electrónico es obligatorio' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Correo electrónico no válido' },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: 'El asunto es obligatorio' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'El mensaje es obligatorio' },
        { status: 400 }
      );
    }

    if (message.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'El mensaje no puede superar los 2000 caracteres' },
        { status: 400 }
      );
    }

    // In a production app, you would send an email here via a service like Resend, SendGrid, etc.
    // For now, we just log and return success.
    console.log('[Contact Form]', {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Mensaje recibido correctamente' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}