import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    // 1. Get the user's internal ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2. Fetch campaigns for this user
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json([])
    }

    // 3. Get real lead counts from the leads table in a single aggregation query
    const campaignIds = campaigns.map((c: any) => c.id)
    const { data: leadCounts } = await supabase
      .from('leads')
      .select('campaign_id')
      .in('campaign_id', campaignIds)

    // Build a map of campaign_id -> actual count
    const countMap = new Map<string, number>()
    for (const row of (leadCounts || [])) {
      countMap.set(row.campaign_id, (countMap.get(row.campaign_id) ?? 0) + 1)
    }

    // 4. Merge accurate counts into each campaign (overrides unreliable leads_found column)
    const campaignsWithRealCounts = campaigns.map((c: any) => ({
      ...c,
      leads_found: countMap.get(c.id) ?? 0,
    }))

    return NextResponse.json(campaignsWithRealCounts)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
