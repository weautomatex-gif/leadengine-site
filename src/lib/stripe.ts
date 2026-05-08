import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  free: {
    name: 'Free',
    leads_limit: 50,
    scouts_limit: 3,
    price: 0,
  },
  starter: {
    name: 'Starter',
    leads_limit: 100,
    scouts_limit: 15,
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  growth: {
    name: 'Growth',
    leads_limit: 300,
    scouts_limit: 50,
    price: 59,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
  },
  agency: {
    name: 'Agency',
    leads_limit: 1000,
    scouts_limit: 999,
    price: 149,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
  },
} as const

export type PlanKey = keyof typeof PLANS
