import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
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
    scouts_limit: 5,
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  growth: {
    name: 'Growth',
    leads_limit: 300,
    scouts_limit: 999,
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
