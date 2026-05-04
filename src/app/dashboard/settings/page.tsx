import { currentUser, auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { SettingsForm } from '@/components/dashboard/SettingsForm'
import { ProfileActions, BillingActions } from '@/components/dashboard/SettingsActionButtons'

export default async function SettingsPage() {
  const { userId: clerkId } = await auth()
  const user = await currentUser()
  
  if (!user || !clerkId) {
    redirect('/sign-in')
  }

  const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || 'No email'
  const name = user.fullName || user.firstName || 'User'

  // Fetch billing info from Supabase
  const supabase = createServerClient()
  let dbUser: any = null
  
  try {
    // Check if company_name exists by trying to select it. Fallback if it fails.
    const res1 = await supabase
      .from('users')
      .select('plan, credits_used, credits_limit, company_name')
      .eq('clerk_id', clerkId)
      .single()
      
    if (res1.error) {
      const res2 = await supabase
        .from('users')
        .select('plan, credits_used, credits_limit')
        .eq('clerk_id', clerkId)
        .single()
      dbUser = res2.data
    } else {
      dbUser = res1.data
    }
  } catch (err) {
    console.error(err)
  }

  const plan = dbUser?.plan || 'Starter'
  const creditsUsed = dbUser?.credits_used || 0
  const creditsTotal = dbUser?.credits_limit || 100
  const creditsPercentage = Math.min(Math.round((creditsUsed / creditsTotal) * 100), 100)

  const capitalizedPlan = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <div className="max-w-4xl pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Settings</h2>
        <p className="text-[#64748B]">Manage your profile, business details, and billing preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Profile Section */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <h3 className="font-bold text-[#0F172A]">Profile Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Full Name</label>
                <div className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] shadow-inner">
                  {name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Email Address</label>
                <div className="px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] shadow-inner">
                  {primaryEmail}
                </div>
              </div>
            </div>
            <ProfileActions />
          </div>
        </section>

        {/* Plan & Usage Section */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
            <h3 className="font-bold text-[#0F172A]">Plan &amp; Usage</h3>
            <span className="px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm border border-[#BFDBFE]">
              {capitalizedPlan} Plan
            </span>
          </div>
          <div className="p-6">
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm font-extrabold text-[#0F172A]">Monthly Lead Credits</p>
                  <p className="text-xs font-medium text-[#64748B]">Renews on the 1st of next month</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{creditsUsed}</span>
                  <span className="text-[#94A3B8] font-semibold text-lg"> / {creditsTotal}</span>
                </div>
              </div>
              <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${creditsPercentage > 90 ? 'bg-red-500' : 'bg-[#3B82F6]'}`} 
                  style={{ width: `${creditsPercentage}%` }} 
                />
              </div>
              <p className="text-xs font-bold text-[#64748B] mt-2 text-right">
                {creditsPercentage}% used
              </p>
            </div>

            <BillingActions />
          </div>
        </section>

        <SettingsForm initialCompanyName={dbUser?.company_name} />

      </div>
    </div>
  )
}
