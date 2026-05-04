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
    const { data: user } = await supabase.from('users').select('id, credits_limit, credits_used').eq('clerk_id', clerkId).single()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name, target_industry, location, leads_found, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    const campaignIds = campaigns?.map(c => c.id) || []
    
    let totalLeads = 0
    let emailsFound = 0
    let draftsReady = 0

    if (campaignIds.length > 0) {
      const { data: allLeads } = await supabase
        .from('leads')
        .select('id, email, draft_body')
        .in('campaign_id', campaignIds)

      if (allLeads) {
        totalLeads = allLeads.length
        emailsFound = allLeads.filter(l => !!l.email).length
        draftsReady = allLeads.filter(l => !!l.draft_body).length
      }
    }

    const creditsLeft = Math.max(0, (user.credits_limit || 0) - (user.credits_used || 0))

    return NextResponse.json({
      stats: { totalLeads, emailsFound, draftsReady, creditsLeft },
      recentCampaigns: campaigns?.slice(0, 5) || []
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
