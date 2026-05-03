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

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Verify campaign ownership
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', lead.campaign_id)
      .eq('user_id', user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, notes } = body

    const supabase = createServerClient()

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get lead to verify ownership
    const { data: lead } = await supabase
      .from('leads')
      .select('campaign_id')
      .eq('id', id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', lead.campaign_id)
      .eq('user_id', user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Update lead
    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (notes !== undefined) updates.notes = notes

    const { error: updateError } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating lead:', updateError)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
