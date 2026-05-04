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

    // Fetch campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name, target_industry, location, leads_found, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    const campaignIds = campaigns?.map(c => c.id) || []
    
    let totalLeads = 0
    let emailsFound = 0
    let draftsReady = 0
    let recentLeads: any[] = []
    let chartData: any[] = []

    if (campaignIds.length > 0) {
      // Get all leads for summary stats
      const { data: allLeads } = await supabase
        .from('leads')
        .select('id, email, draft_body, created_at, category')
        .in('campaign_id', campaignIds)

      let topNiche = ''

      if (allLeads) {
        totalLeads = allLeads.length
        emailsFound = allLeads.filter(l => !!l.email).length
        draftsReady = allLeads.filter(l => !!l.draft_body).length
        
        // Compute chart data for current month
        const chartDataMap = new Map<string, number>()
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const categoryCounts = new Map<string, number>()

        allLeads.forEach(lead => {
          const date = new Date(lead.created_at)
          if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            chartDataMap.set(dateString, (chartDataMap.get(dateString) || 0) + 1)
          }

          if (lead.category) {
            categoryCounts.set(lead.category, (categoryCounts.get(lead.category) || 0) + 1)
          }
        })

        const today = new Date()
        for (let i = 1; i <= today.getDate(); i++) {
          const d = new Date(today.getFullYear(), today.getMonth(), i)
          const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          chartData.push({
            date: dateString,
            leads: chartDataMap.get(dateString) || 0
          })
        }

        // Find top niche
        let maxCount = 0
        categoryCounts.forEach((count, cat) => {
          if (count > maxCount) {
            maxCount = count
            topNiche = cat
          }
        })
      }

      // Get 10 most recent leads with campaign names
      const { data: latestLeads } = await supabase
        .from('leads')
        .select(`
          id, 
          business_name, 
          category, 
          city, 
          audit_verdict, 
          status, 
          created_at,
          campaign_id,
          campaigns (name)
        `)
        .in('campaign_id', campaignIds)
        .order('created_at', { ascending: false })
        .limit(10)

      recentLeads = latestLeads?.map(l => ({
        ...l,
        campaign_name: (l.campaigns as any)?.name
      })) || []
    }

    const creditsLeft = Math.max(0, (user.credits_limit || 0) - (user.credits_used || 0))

    return NextResponse.json({
      stats: { totalLeads, emailsFound, draftsReady, creditsLeft },
      recentCampaigns: campaigns?.slice(0, 5) || [],
      recentLeads,
      chartData,
      topNiche: topNiche || '—',
      totalScouts: campaigns?.length || 0
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
