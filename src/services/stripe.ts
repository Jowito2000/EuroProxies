import Stripe from 'stripe'

const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_to_allow_build'

export const stripe = new Stripe(apiKey, {
  apiVersion: '2026-03-25.dahlia',
})

export interface CheckoutPayload {
  cards: Array<{
    id: string
    imageUrl: string
    name?: string
    game: string
    quantity: number
    finish: string
  }>
  shippingCountry: string
  subtotal: number
  shippingCost: number
  total: number
}

export async function createCheckoutSession(payload: CheckoutPayload) {
  const lineItems: Stripe.Checkout.SessionCreateParams['line_items'] = [
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${payload.cards.reduce((s, c) => s + c.quantity, 0)} Proxies TCG`,
          description: `Proxies para uso casual. No válidas para torneos oficiales.`,
        },
        unit_amount: Math.round(payload.subtotal * 100),
      },
      quantity: 1,
    },
    {
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Envío',
          description: `Envío a ${payload.shippingCountry}`,
        },
        unit_amount: Math.round(payload.shippingCost * 100),
      },
      quantity: 1,
    },
  ]

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'paypal'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    metadata: {
      cards_json: JSON.stringify(payload.cards.map(c => ({
        id: c.id,
        game: c.game,
        quantity: c.quantity,
        finish: c.finish,
      }))),
      shipping_country: payload.shippingCountry,
    },
    shipping_address_collection: {
      allowed_countries: ['ES', 'DE', 'FR', 'IT', 'PT', 'NL', 'BE', 'PL', 'GB', 'US', 'MX', 'AR'],
    },
  })

  return session
}
