import { NextRequest } from 'next/server'
import { stripe } from '@/services/stripe'
import Stripe from 'stripe'
import { saveOrder } from '@/lib/orderStore'
import { Order } from '@/types/order'
import { calculatePrice } from '@/lib/pricing'
import { calculateShipping } from '@/services/shipping'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    await handleOrderPaid(session)
  }

  return Response.json({ received: true })
}

async function handleOrderPaid(session: Stripe.Checkout.Session) {
  const cardsRaw = session.metadata?.cards_json
  const shippingCountry = session.metadata?.shipping_country ?? 'ES'
  const userId = session.metadata?.user_id ?? undefined
  const cards = cardsRaw ? JSON.parse(cardsRaw) : []
  const totalCards = cards.reduce((s: number, c: { quantity: number }) => s + c.quantity, 0)
  const foilCount = cards
    .filter((c: { finish: string }) => c.finish === 'foil')
    .reduce((s: number, c: { quantity: number }) => s + c.quantity, 0)

  const subtotal = calculatePrice(totalCards, foilCount)
  const shippingCost = calculateShipping(shippingCountry)
  const shipping = session.collected_information?.shipping_details

  const order: Order = {
    id: session.id,
    userId,
    cards,
    totalCards,
    subtotal,
    shippingCost,
    totalPrice: Math.round((subtotal + shippingCost) * 100) / 100,
    shippingAddress: {
      name: shipping?.name ?? '',
      street: shipping?.address?.line1 ?? '',
      city: shipping?.address?.city ?? '',
      postalCode: shipping?.address?.postal_code ?? '',
      country: shippingCountry,
    },
    status: 'paid',
    stripeSessionId: session.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveOrder(order)
  console.log('Order saved:', order.id)
}
