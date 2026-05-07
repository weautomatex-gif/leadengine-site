import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase'

export async function POST() {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()
    
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    if (existing) {
      return NextResponse.json({ exists: true })
    }

    // Get user details from Clerk
    const user = await currentUser()

    // Create new user with free plan defaults
    const { error } = await supabase.from('users').insert({
      clerk_id: clerkId,
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      plan: 'free',
      credits_limit: 50,
      credits_used: 0,
    })

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ created: true })
  } catch (error) {
    console.error('Ensure user error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
