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
    const { campaign_id, leads, lead } = body

    // Support either an array of leads or a single lead for backward compatibility
    const leadsToInsert = leads || (lead ? [lead] : [])

    if (!campaign_id || leadsToInsert.length === 0) {
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

    // Format leads for bulk insert
    const formattedLeads = leadsToInsert.map((l: any) => ({
      campaign_id,
      ...l,
      status: l.status || 'new',
    }))

    // Insert all leads
    const { error: leadsError, data: insertedLeads } = await supabase
      .from('leads')
      .insert(formattedLeads)
      .select('id')

    if (leadsError) {
      console.error('Error inserting leads:', leadsError)
      return NextResponse.json({ error: 'Failed to insert leads' }, { status: 500 })
    }

    const insertedLeadsCount = insertedLeads?.length || leadsToInsert.length

    // Update campaign status to completed and set leads_found count
    await supabase
      .from('campaigns')
      .update({ 
        status: 'completed', 
        leads_found: insertedLeadsCount 
      })
      .eq('id', campaign_id)

    // Increment credits_used on user by the number of inserted leads
    const { data: user } = await supabase
      .from('users')
      .select('credits_used')
      .eq('id', campaign.user_id)
      .single()

    if (user) {
      await supabase
        .from('users')
        .update({ credits_used: (user.credits_used || 0) + insertedLeadsCount })
        .eq('id', campaign.user_id)
    }

    return NextResponse.json({ success: true, inserted: insertedLeadsCount }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
