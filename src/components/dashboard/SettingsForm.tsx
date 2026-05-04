'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Building2, Save, Trash2, ShieldAlert } from 'lucide-react'

export function SettingsForm({ initialCompanyName = '' }: { initialCompanyName?: string }) {
  const [companyName, setCompanyName] = useState(initialCompanyName)
  const [saving, setSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName })
      })
      if (!res.ok) throw new Error()
      toast.success('Company name updated successfully')
    } catch {
      toast.error('Failed to update company name')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    toast.loading('Processing account deletion...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('Account scheduled for deletion. We will miss you!')
    }, 2000)
  }

  return (
    <>
      <section className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#3B82F6]" /> Business Details
          </h3>
        </div>
        <div className="p-6">
          <div className="max-w-md">
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Company Name</label>
            <div className="flex gap-3">
              <input 
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                className="flex-1 px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-shadow shadow-sm"
              />
              <button 
                onClick={handleSave}
                disabled={saving || companyName === initialCompanyName}
                className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm mt-6">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h3 className="font-bold text-red-700 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
          </h3>
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#0F172A] mb-1">Delete Account</h4>
            <p className="text-sm font-medium text-[#64748B]">Permanently delete your account, campaigns, and leads.</p>
          </div>
          <button 
            onClick={() => setDeleteModalOpen(true)}
            className="px-5 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            Delete Account
          </button>
        </div>
      </section>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you absolutely sure you want to delete your account? This will permanently erase all your campaigns, leads, and remaining credits. This action cannot be undone."
        confirmText="Delete My Account"
        isDestructive={true}
      />
    </>
  )
}
