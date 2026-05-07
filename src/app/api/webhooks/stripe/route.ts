import { NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const plan = session.metadata?.plan
        const userId = session.metadata?.user_id
        const subscriptionId = session.subscription

        if (userId && plan && PLANS[plan as keyof typeof PLANS]) {
          const planConfig = PLANS[plan as keyof typeof PLANS]
          await supabase
            .from('users')
            .update({
              plan,
              stripe_subscription_id: subscriptionId,
              credits_limit: planConfig.leads_limit,
              credits_used: 0,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.user_id

        if (userId) {
          const status = subscription.status
          if (status === 'active') {
            await supabase
              .from('users')
              .update({
                plan_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.user_id

        if (userId) {
          await supabase
            .from('users')
            .update({
              plan: 'free',
              stripe_subscription_id: null,
              credits_limit: 50,
            })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        console.error('Payment failed for customer:', invoice.customer)
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
