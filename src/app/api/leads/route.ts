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
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const from = (page - 1) * limit
    const to = from + limit - 1

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

    // 2. Get user's campaigns (for filtering and for the dropdown)
    const { data: allUserCampaigns } = await supabase
      .from('campaigns')
      .select('id, name')
      .eq('user_id', user.id)

    if (!allUserCampaigns || allUserCampaigns.length === 0) {
      return NextResponse.json({ leads: [], campaigns: [], totalCount: 0 })
    }

    const campaignIds = allUserCampaigns.map(c => c.id)

    // 3. Build Leads Query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'All') {
      query = query.eq('status', statusFilter)
    }
    if (verdictFilter && verdictFilter !== 'All') {
      query = query.eq('audit_verdict', verdictFilter)
    }
    if (campaignFilter && campaignFilter !== 'All') {
      query = query.eq('campaign_id', campaignFilter)
    }
    if (searchFilter) {
      query = query.ilike('business_name', `%${searchFilter}%`)
    }

    // Apply pagination
    const { data: leads, error: leadsError, count } = await query.range(from, to)

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ 
      leads, 
      campaigns: allUserCampaigns, 
      totalCount: count || 0 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
