'use client'

import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'
import { ArrowLeft, Copy, ExternalLink, CheckCircle2, Mail, Phone, MapPin, Star, Lock } from 'lucide-react'

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState<string>('free')

  const isPremium = plan === 'growth' || plan === 'agency'

  useEffect(() => {
    fetch('/api/billing/info')
      .then(res => res.json())
      .then(data => setPlan(data.plan || 'free'))
      .catch(() => setPlan('free'))
  }, [])

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

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      toast.success(`Status updated to ${newStatus}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleNotesBlur = async () => {
    if (notes === lead.notes) return // No change
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      setLead({ ...lead, notes })
      toast.success('Notes auto-saved')
    } catch (err) {
      toast.error('Failed to save notes')
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
  
  if (!lead) return null

  const statusOptions = ['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost']

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-[#64748B] font-medium">Back</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">{lead.business_name}</h1>
                <p className="text-[#64748B] font-medium">{lead.category} &bull; {lead.city}</p>
              </div>
              {lead.rating && (
                <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#D97706] px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">
                  <Star className="w-4 h-4 fill-current" /> {lead.rating} 
                  {lead.reviews_count && <span className="text-[#B45309] font-semibold text-xs ml-1">({lead.reviews_count})</span>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-bold text-[#0F172A] truncate">
                      {lead.email || <span className="text-[#94A3B8] italic font-normal">Not found</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-sm font-bold text-[#0F172A]">{lead.phone || <span className="text-[#94A3B8] italic font-normal">Not found</span>}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Website</p>
                    {lead.website ? (
                      <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#3B82F6] hover:underline truncate block">
                        {lead.website.replace('https://', '').replace('http://', '')}
                      </a>
                    ) : (
                      <p className="text-sm font-normal text-[#94A3B8] italic">Not found</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#94A3B8] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Full Address</p>
                    <p className="text-sm font-medium text-[#0F172A] leading-relaxed">
                      {lead.address || 'Address not listed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Draft Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#3B82F6]" /> Personalised Email Draft
              </h3>
              {isPremium && lead.draft_body && (
                <span className="px-2.5 py-1 bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-bold uppercase tracking-wider rounded-md">Ready to send</span>
              )}
            </div>
            <div className="p-8">
              {isPremium ? (
                lead.draft_body ? (
                  <>
                    <div className="mb-6 pb-6 border-b border-[#E2E8F0]">
                      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Subject</p>
                      <div className="flex justify-between items-center group">
                        <p className="text-base font-bold text-[#0F172A]">{lead.draft_subject || `A quick idea for ${lead.business_name}`}</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(lead.draft_subject || `A quick idea for ${lead.business_name}`)
                            toast.success('Subject copied')
                          }}
                          className="text-xs px-2 py-1 bg-white border border-[#E2E8F0] rounded-md text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-all font-bold shadow-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Body</p>
                      <div className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap font-medium">
                        {lead.draft_body}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#64748B] text-sm">Draft not available. If this is a new lead, the AI might still be generating it.</p>
                  </div>
                )
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="mb-6 pb-6 border-b border-[#E2E8F0]">
                      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Subject</p>
                      <p className="text-base font-bold text-[#0F172A]">Personalised email for your business</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Body</p>
                      <p className="text-sm text-[#334155] leading-relaxed">
                        Hi there, We noticed your business could benefit from a modern website that converts visitors into customers. We specialise in building fast, professional websites for businesses just like yours...
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl">
                    <Lock className="w-6 h-6 text-[#94A3B8] mb-2" />
                    <p className="text-sm font-semibold text-[#0F172A] mb-1">AI Email Drafts</p>
                    <p className="text-xs text-[#64748B] mb-3">Available on Growth plan and above</p>
                    <a href="/dashboard/settings" className="text-xs font-semibold text-[#3B82F6] hover:underline">
                      Upgrade Plan →
                    </a>
                  </div>
                </div>
              )}
            </div>
            {isPremium && lead.draft_body && (
              <div className="px-8 py-5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex gap-3">
                <button 
                  onClick={() => {
                    const text = `Subject: ${lead.draft_subject}\n\n${lead.draft_body}`
                    navigator.clipboard.writeText(text)
                    toast.success('Full email copied to clipboard')
                  }}
                  className="w-full py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy Full Email
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar actions) */}
        <div className="space-y-6">
          
          {/* Status & Actions */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <h3 className="font-bold text-[#0F172A] mb-4">Pipeline Status</h3>
            <select 
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full mb-6 px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white shadow-sm cursor-pointer"
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            
            <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Internal Notes</label>
            <textarea 
              rows={5}
              placeholder="Add notes about this lead... (auto-saves)"
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[#F8FAFC] focus:bg-white transition-colors shadow-inner resize-none mb-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
            />
            <p className="text-[10px] text-[#94A3B8] text-right font-medium">Notes save automatically</p>
          </div>

          {/* Audit Result */}
          {lead.audit_verdict && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <h3 className="font-bold text-[#0F172A] mb-4">AI Audit Result</h3>
              {lead.audit_verdict === 'NO_SITE' ? (
                <div className="flex items-center justify-between">
                  <VerdictBadge verdict={lead.audit_verdict} />
                  <span className="text-sm font-semibold text-[#64748B]">No website found</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#E2E8F0]">
                    <VerdictBadge verdict={lead.audit_verdict} />
                    <span className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{lead.audit_score ?? '35'}<span className="text-sm font-semibold text-[#94A3B8]">/100</span></span>
                  </div>
                  <ul className="space-y-3 text-sm text-[#64748B] font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span> 
                      <span className="leading-snug">{lead.audit_reason_1 || 'Website not mobile responsive'}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span> 
                      <span className="leading-snug">{lead.audit_reason_2 || 'No clear call to action on homepage'}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">!</span> 
                      <span className="leading-snug">{lead.audit_reason_3 || 'Slow page load speed detected'}</span>
                    </li>
                  </ul>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
