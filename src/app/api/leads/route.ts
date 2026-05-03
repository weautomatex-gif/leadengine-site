import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status')
    const verdictFilter = searchParams.get('verdict')
    const searchFilter = searchParams.get('search')
    const campaignFilter = searchParams.get('campaign_id')

    const supabase = createServerClient()

    // 1. Get user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2. Get user's campaigns
    let campaignQuery = supabase.from('campaigns').select('id, name').eq('user_id', user.id)
    if (campaignFilter) {
      campaignQuery = campaignQuery.eq('id', campaignFilter)
    }
    const { data: campaigns } = await campaignQuery

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ leads: [], campaigns: [] })
    }

    const campaignIds = campaigns.map(c => c.id)

    // 3. Build Leads Query
    let query = supabase
      .from('leads')
      .select('*')
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }
    if (verdictFilter) {
      query = query.eq('audit_verdict', verdictFilter)
    }
    if (searchFilter) {
      query = query.ilike('business_name', `%${searchFilter}%`)
    }

    const { data: leads, error: leadsError } = await query

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ leads, campaigns })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
