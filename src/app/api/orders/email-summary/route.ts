import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const maxDuration = 60; // Increase Vercel timeout just in case the PDF is large

export async function POST(request: Request) {
  try {
    const { email, orderDetails, pdfBase64 } = await request.json();

    if (!email || !orderDetails || !pdfBase64) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const { totalCards, subtotal, shippingCost, total, shippingDetails, cards } = orderDetails;

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const logoUrl = `${protocol}://${host}/favicon.png`;

    const cardsHtml = cards.map((c: any) => 
      `<li>${c.quantity}x ${c.name || 'Carta'} (${c.game.toUpperCase()})</li>`
    ).join('');

    const htmlContent = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa; border-radius: 12px; border: 1px solid #eaeaea;">
        <h2 style="color: #7c3aed; margin-top: 0;">¡Tu pedido en EuroProxy está casi listo!</h2>
        <p>Hola <strong>${shippingDetails.fullName}</strong>,</p>
        <p>Hemos generado con éxito el documento con tus proxies. Adjunto a este correo encontrarás el PDF listo para impresión con todas tus cartas generadas.</p>
        
        <div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #eaeaea; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #444;">Resumen del Pedido</h3>
          <p><strong>Total de cartas:</strong> ${totalCards}</p>
          <ul style="margin-top: 8px; margin-bottom: 16px;">
            ${cardsHtml}
          </ul>
          
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 16px 0;" />
          
          <h3 style="margin-top: 0; color: #444;">Desglose de precio</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Cartas:</span>
            <strong>${subtotal.toFixed(2)} €</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Envío:</span>
            <strong>${shippingCost.toFixed(2)} €</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.2rem; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eaeaea;">
            <span><strong>Total:</strong></span>
            <strong style="color: #7c3aed;">${total.toFixed(2)} €</strong>
          </div>
        </div>

        <div style="background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #eaeaea; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #444;">Dirección de Envío</h3>
          <p style="margin: 0;">
            ${shippingDetails.fullName}<br />
            ${shippingDetails.address}, Nº ${shippingDetails.number}
            ${shippingDetails.floor ? `, Piso ${shippingDetails.floor}` : ''}
            ${shippingDetails.door ? `, Puerta ${shippingDetails.door}` : ''}<br />
            ${shippingDetails.city}, ${shippingDetails.province}
          </p>
        </div>

        <p style="font-size: 0.9em; color: #666;">
          Este es un correo automático. El PDF adjunto contiene tus cartas configuradas. Por favor, procede con el pago en nuestra web para finalizar el pedido.
        </p>
      </div>
    `;

    // The pdfBase64 is passed from the client, likely containing the base64 string directly
    const attachmentBuffer = Buffer.from(pdfBase64, 'base64');

    await transporter.sendMail({
      from: `"EuroProxy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Resumen de Pedido y PDF - EuroProxy`,
      html: htmlContent,
      attachments: [
        {
          filename: 'europroxy-print.pdf',
          content: attachmentBuffer,
          contentType: 'application/pdf',
        }
      ]
    });

    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error: any) {
    console.error('Error sending order summary email:', error);
    return NextResponse.json({ error: 'Error interno del servidor al enviar el correo', details: error.message }, { status: 500 });
  }
}
