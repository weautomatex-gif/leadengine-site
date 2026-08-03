import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'
import { PLANS, PlanKey } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    const userObj = await currentUser()
    
    if (!clerkId || !userObj) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const primaryEmail = userObj.emailAddresses.find(e => e.id === userObj.primaryEmailAddressId)?.emailAddress || ''

    const body = await req.json()
    const { name, target_industry, location, lead_count } = body

    const supabase = createServerClient()
    
    // Look up the user in Supabase by clerk_id, create if not exists
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', clerkId)
      .single()

    if (!user && userError?.code === 'PGRST116') {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: clerkId,
          email: primaryEmail,
          credits_used: 0,
          credits_limit: 100,
          plan: 'starter'
        })
        .select()
        .single()
        
      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
      }
      user = newUser
    } else if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'Failed to fetch user record' }, { status: 500 })
    }

    // Check credits
    if (user.credits_used >= user.credits_limit) {
      return NextResponse.json({ error: 'Credit limit reached' }, { status: 403 })
    }

    // Enforce plan scout/campaign limit
    const planKey = (user.plan in PLANS ? user.plan : 'free') as PlanKey
    const scoutsLimit = PLANS[planKey].scouts_limit
    const { count: campaignCount, error: countError } = await supabase
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting campaigns:', countError)
      return NextResponse.json({ error: 'Failed to verify scout limit' }, { status: 500 })
    }

    if ((campaignCount ?? 0) >= scoutsLimit) {
      return NextResponse.json(
        {
          error: `Scout limit reached. Your ${PLANS[planKey].name} plan allows ${scoutsLimit} scout campaigns.`,
        },
        { status: 403 }
      )
    }

    // Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id, // Using the Supabase internal user ID, or we can use clerkId if the schema uses it. We use user.id based on standard setup
        name,
        target_industry,
        location,
        lead_count,
        status: 'running',
        leads_found: 0,
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Supabase error creating campaign:', campaignError)
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    // Fire a POST request to N8N_WEBHOOK_URL
    const n8nUrl = process.env.N8N_WEBHOOK_URL
    if (n8nUrl) {
      console.log('Firing n8n webhook to:', n8nUrl)
      // Fire and forget (don't await)
      fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': process.env.N8N_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          user_id: user.id,
          niche: target_industry,
          location,
          max_leads: lead_count,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n`
        })
      }).catch(err => console.error('Failed to trigger n8n webhook:', err))
    } else {
      console.warn('N8N_WEBHOOK_URL is not set.')
    }

    return NextResponse.json({ campaignId: campaign.id, status: 'running' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
