'use client'

import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => {
        setLead(data)
        setNotes(data.notes || '')
        setStatus(data.status || 'New')
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        router.push('/dashboard/leads')
      })
  }, [id, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })
      // Success flash could go here
    } catch (err) {
      console.error('Failed to update lead', err)
      alert('Failed to update lead')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-[#64748B] text-sm animate-pulse">Loading lead details...</div>
  if (!lead) return null

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'OUTDATED': return 'bg-orange-100 text-orange-700'
      case 'DATED': return 'bg-yellow-100 text-yellow-700'
      case 'BROKEN': return 'bg-red-100 text-red-700'
      case 'NO_SITE': return 'bg-purple-100 text-purple-700'
      default: return 'bg-[#F1F5F9] text-[#64748B]'
    }
  }

  const statusOptions = ['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost']

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/leads" className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
          ← Back to Leads
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A] mb-1">{lead.business_name}</h1>
                <p className="text-[#64748B]">{lead.category} · {lead.city}</p>
              </div>
              <div className="flex items-center gap-1 bg-[#FEF3C7] text-[#D97706] px-2 py-1 rounded text-sm font-bold">
                ★ {lead.rating || '4.8'} <span className="text-[#B45309] font-normal text-xs ml-1">({lead.reviews_count || '12'} reviews)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Contact Details</p>
                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium text-[#0F172A] break-all">📧 {lead.email || 'No email found'}</p>
                  <p className="text-sm font-medium text-[#0F172A]">📞 {lead.phone || 'No phone found'}</p>
                  <p className="text-sm font-medium text-[#3B82F6] truncate">
                    <a href={lead.website_url || '#'} target="_blank" rel="noreferrer">
                      🌐 {lead.website_url ? lead.website_url.replace('https://', '').replace('http://', '') : 'No website'}
                    </a>
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm font-medium text-[#0F172A] mt-3 leading-relaxed">
                  {lead.address || 'Address not listed'}
                </p>
              </div>
            </div>
          </div>

          {/* Email Draft Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                <span className="text-xl">✉️</span> Personalised Email Draft
              </h3>
              <span className="px-2.5 py-1 bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-bold uppercase rounded-full">Ready to send</span>
            </div>
            <div className="p-6">
              <div className="mb-4 pb-4 border-b border-[#E2E8F0]">
                <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">Subject</p>
                <div className="flex justify-between items-center group">
                  <p className="text-sm font-bold text-[#0F172A]">{lead.email_subject || `A quick idea for ${lead.business_name}`}</p>
                  <button className="text-xs text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Copy</button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">Body</p>
                <div className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap font-sans">
                  {lead.email_draft || "Draft not available yet. If this is a new lead, the AI is currently writing the draft."}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex gap-3">
              <button className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] text-sm font-semibold rounded-lg transition-colors">
                Regenerate Draft
              </button>
              <button className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-lg transition-colors ml-auto shadow-sm">
                Copy Full Email
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar actions) */}
        <div className="space-y-6">
          
          {/* Status & Actions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Pipeline Status</h3>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[#F8FAFC]"
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Internal Notes</label>
            <textarea 
              rows={4}
              placeholder="Add notes about this lead..."
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] mb-4 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Audit Result */}
          {lead.audit_verdict && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <h3 className="font-bold text-[#0F172A] mb-4">AI Audit Result</h3>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E2E8F0]">
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md ${getVerdictBadge(lead.audit_verdict)}`}>
                  {lead.audit_verdict}
                </span>
                <span className="text-xl font-bold text-[#0F172A]">{lead.audit_score || '35'}/100</span>
              </div>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✖</span> 
                  {lead.audit_reason_1 || 'Website not mobile responsive'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✖</span> 
                  {lead.audit_reason_2 || 'No clear call to action on homepage'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">!</span> 
                  {lead.audit_reason_3 || 'Slow page load speed detected'}
                </li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
