import { currentUser, auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'

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
  const { data: dbUser } = await supabase
    .from('users')
    .select('plan, credits_used, credits_limit')
    .eq('clerk_id', clerkId)
    .single()

  const plan = dbUser?.plan || 'Starter Plan'
  const creditsUsed = dbUser?.credits_used || 0
  const creditsTotal = dbUser?.credits_limit || 100
  const creditsPercentage = Math.min(Math.round((creditsUsed / creditsTotal) * 100), 100)

  const capitalizedPlan = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Settings</h2>
        <p className="text-[#64748B]">Manage your profile and billing preferences.</p>
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
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Full Name</label>
                <div className="px-4 py-2.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A]">
                  {name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Email Address</label>
                <div className="px-4 py-2.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A]">
                  {primaryEmail}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-xs text-[#64748B]">
                Your profile information is managed through Clerk. To update your name or email, use the account menu in the top right.
              </p>
            </div>
          </div>
        </section>

        {/* Plan & Usage Section */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
            <h3 className="font-bold text-[#0F172A]">Plan &amp; Usage</h3>
            <span className="px-2.5 py-1 bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-bold uppercase rounded-full">
              {capitalizedPlan} Plan
            </span>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">Monthly Lead Credits</p>
                  <p className="text-xs text-[#64748B]">Renews on the 1st of next month</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#0F172A]">{creditsUsed}</span>
                  <span className="text-[#94A3B8]"> / {creditsTotal}</span>
                </div>
              </div>
              <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${creditsPercentage > 90 ? 'bg-red-500' : 'bg-[#3B82F6]'}`} 
                  style={{ width: `${creditsPercentage}%` }} 
                />
              </div>
              <p className="text-xs font-semibold text-[#64748B] mt-2 text-right">
                {creditsPercentage}% used
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E2E8F0]">
              <button className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                Upgrade Plan
              </button>
              <button className="px-5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-semibold rounded-xl transition-colors shadow-sm">
                Manage Billing
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
