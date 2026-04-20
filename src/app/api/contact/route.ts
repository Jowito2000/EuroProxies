import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { subject, email, message } = await request.json();

    if (!subject || !email || !message) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App password recommended
      },
    });

    const targetEmail = process.env.CONTACT_EMAIL_DESTINATION || 'jowito2000@gmail.com';

    await transporter.sendMail({
      from: `"EuroProxy ContactForm" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      replyTo: email,
      subject: `[Contacto EuroProxy] ${subject}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>De:</strong> ${email}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <hr />
        <div style="white-space: pre-wrap;">${message}</div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
