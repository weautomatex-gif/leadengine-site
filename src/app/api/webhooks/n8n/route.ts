import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    // Verify webhook secret
    const secret = req.headers.get('x-webhook-secret')
    if (secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { campaign_id, lead } = body

    if (!campaign_id || !lead) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get the campaign to find the user
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('user_id, leads_found, lead_count')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError)
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Insert the lead
    const { error: leadError } = await supabase
      .from('leads')
      .insert({
        campaign_id,
        ...lead, // Includes place_id, business_name, category, email, etc.
        status: lead.status || 'new',
      })

    if (leadError) {
      console.error('Error inserting lead:', leadError)
      return NextResponse.json({ error: 'Failed to insert lead' }, { status: 500 })
    }

    // Increment leads_found on campaign
    const newLeadsFound = (campaign.leads_found || 0) + 1
    const updateData: any = { leads_found: newLeadsFound }
    
    if (newLeadsFound >= campaign.lead_count) {
      updateData.status = 'completed'
    }

    await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaign_id)

    // Increment credits_used on user
    const { data: user } = await supabase
      .from('users')
      .select('credits_used')
      .eq('id', campaign.user_id)
      .single()

    if (user) {
      await supabase
        .from('users')
        .update({ credits_used: (user.credits_used || 0) + 1 })
        .eq('id', campaign.user_id)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
