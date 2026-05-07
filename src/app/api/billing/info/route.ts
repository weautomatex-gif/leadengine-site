export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data: user } = await supabase
      .from('users')
      .select('plan, credits_limit, credits_used, plan_period_end, stripe_subscription_id')
      .eq('clerk_id', clerkId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      plan: user.plan || 'free',
      credits_limit: user.credits_limit || 50,
      credits_used: user.credits_used || 0,
      plan_period_end: user.plan_period_end,
      has_subscription: !!user.stripe_subscription_id,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
