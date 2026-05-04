import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // 2. Get Campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // 3. Get Leads for Campaign
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('created_at', { ascending: false })

    if (leadsError) {
      console.error('Error fetching leads:', leadsError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ campaign, leads })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data: user } = await supabase.from('users').select('id').eq('clerk_id', clerkId).single()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: campaign } = await supabase.from('campaigns').select('id').eq('id', id).eq('user_id', user.id).single()
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    // Delete leads first (if not cascading)
    await supabase.from('leads').delete().eq('campaign_id', id)
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
