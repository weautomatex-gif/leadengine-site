import { currentUser, auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { SettingsForm } from '@/components/dashboard/SettingsForm'
import { ProfileActions } from '@/components/dashboard/SettingsActionButtons'
import { BillingSection } from '@/components/dashboard/BillingSection'

export default async function SettingsPage() {
  const { userId: clerkId } = await auth()
  const user = await currentUser()
  
  if (!user || !clerkId) {
    redirect('/sign-in')
  }

  const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || 'No email'
  const name = user.fullName || user.firstName || 'User'

  // Fetch company info from Supabase
  const supabase = createServerClient()
  const { data: dbUser } = await supabase
    .from('users')
    .select('company_name')
    .eq('clerk_id', clerkId)
    .single()

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Settings</h2>
        <p className="text-[#64748B]">Manage your profile, business details, and billing preferences.</p>
      </div>

      <div className="space-y-8">
        
        {/* Profile Section */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-bold text-[#0F172A]">Profile Information</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              {user.imageUrl && (
                <img src={user.imageUrl} alt={name} className="w-16 h-16 rounded-full border-2 border-blue-50 shadow-sm" />
              )}
              <div>
                <h4 className="text-lg font-bold text-[#0F172A]">{name}</h4>
                <p className="text-sm font-medium text-[#64748B]">{primaryEmail}</p>
              </div>
            </div>
            <ProfileActions />
          </div>
        </section>

        {/* Billing Section */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-[#0F172A]">Plan & Billing</h3>
          </div>
          <BillingSection />
        </div>

        <SettingsForm initialCompanyName={dbUser?.company_name} />

      </div>
    </div>
  )
}
