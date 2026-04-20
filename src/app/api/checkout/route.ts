import { NextRequest } from 'next/server'
import { createCheckoutSession, CheckoutPayload } from '@/services/stripe'

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPayload = await request.json()

    if (!body.cards?.length) {
      return Response.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    if (body.total <= 0) {
      return Response.json({ error: 'Total inválido' }, { status: 400 })
    }

    const session = await createCheckoutSession(body)
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return Response.json({ error: 'Error al crear la sesión de pago' }, { status: 500 })
  }
}
