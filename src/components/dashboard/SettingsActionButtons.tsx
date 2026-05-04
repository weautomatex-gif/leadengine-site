'use client'

import { toast } from 'sonner'
import { UserButton } from '@clerk/nextjs'

export function ProfileActions() {
  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-xs font-medium text-[#64748B]">
        Manage your secure authentication details via Clerk.
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-[#0F172A]">Manage Account:</span>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  )
}

export function BillingActions() {
  return (
    <div className="flex flex-wrap gap-3 pt-6 border-t border-[#E2E8F0]">
      <button 
        onClick={() => toast.info('Billing portal coming soon')}
        className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
      >
        Upgrade to Pro
      </button>
      <button 
        onClick={() => toast.info('Billing portal coming soon')}
        className="px-5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-bold rounded-xl transition-colors shadow-sm"
      >
        Manage Billing
      </button>
    </div>
  )
}
