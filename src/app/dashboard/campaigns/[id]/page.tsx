'use client'

import Link from 'next/link'
import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { downloadCSV } from '@/lib/csv-export'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { CardSkeleton, TableRowSkeleton } from '@/components/ui/SkeletonLoader'
import { ArrowLeft, Download, Eye, ExternalLink, Copy, CheckCircle2, X, Target, Search } from 'lucide-react'

// Slide-over Panel Component
function LeadDetailPanel({ lead, isOpen, onClose, onUpdateStatus, onUpdateNotes }: any) {
  const [notes, setNotes] = useState(lead?.notes || '')
  
  useEffect(() => {
    setNotes(lead?.notes || '')
  }, [lead])

  if (!isOpen || !lead) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto border-l border-[#E2E8F0]"
      >
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-[#0F172A] text-lg truncate pr-4">{lead.business_name}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 pb-24">
          {/* Quick Info */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Category & Location</p>
              <p className="text-[#0F172A] font-medium">{lead.category} &bull; {lead.city}</p>
              <p className="text-sm text-[#64748B] mt-1">{lead.address}</p>
            </div>
            
            {lead.website && (
              <div>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">Website</p>
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3B82F6] hover:underline">
                  {lead.website} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">Audit Verdict</p>
              <VerdictBadge verdict={lead.audit_verdict} />
            </div>
          </div>

          <div className="h-px bg-[#E2E8F0]" />

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-[#0F172A] mb-3">Contact Information</h4>
            <div className="space-y-3">
              {lead.email ? (
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="truncate pr-2">
                    <p className="text-sm font-bold text-[#0F172A] truncate">{lead.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(lead.email)
                      toast.success('Email copied to clipboard')
                    }}
                    className="p-1.5 text-[#64748B] hover:text-[#3B82F6] bg-white rounded-lg border border-[#E2E8F0] shadow-sm transition-colors shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#94A3B8] italic">No email found.</p>
              )}
              {lead.phone && <p className="text-sm font-medium text-[#0F172A]">📞 {lead.phone}</p>}
            </div>
          </div>

          <div className="h-px bg-[#E2E8F0]" />

          {/* Draft Email */}
          {lead.draft_body && (
            <div>
              <h4 className="font-bold text-[#0F172A] mb-3">Suggested Email Draft</h4>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                {lead.draft_subject && (
                  <p className="text-sm font-bold text-[#0F172A] mb-3 border-b border-[#E2E8F0] pb-3">Subject: {lead.draft_subject}</p>
                )}
                <div className="text-sm text-[#64748B] whitespace-pre-wrap font-medium leading-relaxed">{lead.draft_body}</div>
                <button 
                  onClick={() => {
                    const text = lead.draft_subject ? `Subject: ${lead.draft_subject}\n\n${lead.draft_body}` : lead.draft_body;
                    navigator.clipboard.writeText(text)
                    toast.success('Draft copied to clipboard')
                  }}
                  className="mt-4 w-full py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] text-sm font-bold rounded-xl shadow-sm hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy Draft
                </button>
              </div>
            </div>
          )}

          <div className="h-px bg-[#E2E8F0]" />

          {/* Status & Actions */}
          <div>
            <h4 className="font-bold text-[#0F172A] mb-3">Lead Status</h4>
            <select 
              value={lead.status || 'New'}
              onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] mb-4 shadow-sm"
            >
              {['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  onUpdateStatus(lead.id, 'Contacted')
                  toast.success('Marked as Contacted')
                }}
                className="py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-bold rounded-xl transition-colors border border-blue-200"
              >
                Mark Contacted
              </button>
              <button 
                onClick={() => {
                  onUpdateStatus(lead.id, 'Won')
                  toast.success('Awesome! Lead marked as Won 🎉')
                }}
                className="py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-sm font-bold rounded-xl transition-colors border border-emerald-200 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Won 🎉
              </button>
            </div>
          </div>

          <div className="h-px bg-[#E2E8F0]" />

          {/* Notes */}
          <div>
            <h4 className="font-bold text-[#0F172A] mb-2">Internal Notes</h4>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdateNotes(lead.id, notes)}
              placeholder="Add notes about this lead..."
              className="w-full h-32 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:bg-white transition-all resize-none shadow-inner"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [campaign, setCampaign] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedLead, setSelectedLead] = useState<any | null>(null)

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => {
        setCampaign(data.campaign)
        setLeads(data.leads || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
        toast.error('Failed to load campaign')
      })
  }, [id])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: newStatus })
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleNotesChange = async (leadId: string, newNotes: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNotes })
      })
      setLeads(leads.map(l => l.id === leadId ? { ...l, notes: newNotes } : l))
      toast.success('Notes saved')
    } catch (err) {
      toast.error('Failed to save notes')
    }
  }

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return toast.error('No leads to export')
    downloadCSV(leads, `${campaign.name.replace(/\s+/g, '_')}_leads`)
    toast.success('Export completed')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!campaign) return (
    <div className="p-12 text-center">
      <h3 className="text-xl font-bold text-[#0F172A] mb-2">Campaign Not Found</h3>
      <Link href="/dashboard/campaigns" className="text-[#3B82F6] hover:underline">Return to Campaigns</Link>
    </div>
  )

  const stats = [
    { label: 'Leads Found', value: campaign.leads_found || (leads?.length || 0) },
    { label: 'Emails Found', value: leads?.filter(l => !!l.email).length || 0 },
    { label: 'Drafts Ready', value: leads?.filter(l => !!l.draft_body).length || 0 },
    { label: 'Qualified Leads', value: leads?.filter(l => l.status === 'Qualified').length || 0 },
  ]

  const statusOptions = ['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost']

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/campaigns" className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">{campaign.name}</h2>
            {campaign.status === 'running' && (
              <span className="px-2.5 py-1 bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5 ml-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                Running
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-[#64748B] ml-11 font-medium">
            <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {campaign.target_industry}</span>
            <span>&bull;</span>
            <span>📍 {campaign.location}</span>
          </div>
        </div>
        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] text-[#0F172A] text-sm font-bold rounded-xl transition-all shadow-sm h-fit"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-extrabold text-[#0F172A]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
          <h3 className="font-bold text-[#0F172A]">Discovered Leads</h3>
          <span className="text-xs font-bold text-[#64748B] bg-white px-2.5 py-1 rounded-full border border-[#E2E8F0] shadow-sm">{leads?.length || 0} results</span>
        </div>
        
        {(!leads || leads.length === 0) ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4 text-[#64748B]">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-[#0F172A] font-bold mb-1 text-lg">
              {campaign.status === 'running' ? 'AI is scanning the web...' : 'No leads found.'}
            </p>
            <p className="text-[#64748B] text-sm max-w-sm font-medium">
              {campaign.status === 'running' ? 'This usually takes a few minutes. Leads will appear here automatically.' : 'Try adjusting your search criteria and running a new scout.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white">
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Verdict</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {leads.map((lead) => (
                  <tr key={lead.id} onClick={() => setSelectedLead(lead)} className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors truncate max-w-[200px] block">
                        {lead.business_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#64748B] truncate max-w-[150px]">{lead.category}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#64748B]">{lead.city}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#64748B] truncate max-w-[150px]">
                      {lead.email ? (
                        <span className="text-[#0F172A] font-bold">{lead.email}</span>
                      ) : (
                        <span className="text-[#94A3B8] italic">Not found</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.audit_verdict ? <VerdictBadge verdict={lead.audit_verdict} /> : <span className="text-[#94A3B8]">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={lead.status || 'New'}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusChange(lead.id, e.target.value)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] shadow-sm cursor-pointer"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#3B82F6] rounded-lg hover:bg-blue-50 transition-colors focus:outline-none">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeadDetailPanel 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        onUpdateStatus={handleStatusChange}
        onUpdateNotes={handleNotesChange}
      />
    </div>
  )
}
