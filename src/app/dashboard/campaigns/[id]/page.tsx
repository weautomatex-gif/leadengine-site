'use client'

import Link from 'next/link'
import { useState, useEffect, use, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { CardSkeleton, TableRowSkeleton } from '@/components/ui/SkeletonLoader'
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  X, 
  Target, 
  Search,
  ChevronDown,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  FileText,
  Users
} from 'lucide-react'

// Custom Status Dropdown Component
function StatusDropdown({ status, onUpdate }: { status: string, onUpdate: (s: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const options = ['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost']

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <StatusBadge status={status} />
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute left-0 mt-2 w-40 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-20 overflow-hidden p-1"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate(opt)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  status === opt ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto border-l border-[#E2E8F0] flex flex-col"
      >
        {/* Panel Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-5 flex items-center justify-between z-10 shadow-sm">
          <div className="flex flex-col min-w-0">
            <h3 className="font-extrabold text-[#0F172A] text-lg truncate leading-tight">{lead.business_name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{lead.category}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{lead.city}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-6 space-y-8 pb-12">
          {/* Business Details Card */}
          <div className="space-y-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 shadow-inner">
             <div className="flex items-start gap-3">
               <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] shadow-sm"><MapPin className="w-4 h-4 text-[#3B82F6]" /></div>
               <div>
                 <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Full Address</p>
                 <p className="text-sm font-bold text-[#0F172A] leading-relaxed">{lead.address || 'Not listed'}</p>
               </div>
             </div>
             
             <div className="flex items-start gap-3">
               <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] shadow-sm"><Globe className="w-4 h-4 text-[#3B82F6]" /></div>
               <div className="min-w-0">
                 <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Website</p>
                 {lead.website ? (
                   <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#3B82F6] hover:underline flex items-center gap-1.5 truncate">
                     {lead.website.replace('https://', '').replace('http://', '')} <ExternalLink className="w-3.5 h-3.5" />
                   </a>
                 ) : <p className="text-sm font-bold text-[#94A3B8] italic">No website found</p>}
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] shadow-sm"><Mail className="w-4 h-4 text-[#3B82F6]" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-bold text-[#0F172A] truncate">{lead.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] shadow-sm"><Phone className="w-4 h-4 text-[#3B82F6]" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-sm font-bold text-[#0F172A] truncate">{lead.phone || '—'}</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Audit Results */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest">AI Website Audit</h4>
                <div className="flex items-center gap-1 bg-[#FEF3C7] px-2 py-1 rounded-lg">
                   <Star className="w-3.5 h-3.5 text-[#D97706] fill-current" />
                   <span className="text-[11px] font-bold text-[#D97706]">{lead.rating || '4.0'}</span>
                </div>
             </div>
             <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <VerdictBadge verdict={lead.audit_verdict} />
                <span className="text-lg font-black text-[#0F172A]">{lead.audit_score || '35'}<span className="text-[10px] font-bold text-[#94A3B8]">/100</span></span>
             </div>
             <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Key Observations</p>
                <div className="text-xs text-[#64748B] font-medium leading-relaxed italic border-l-2 border-[#E2E8F0] pl-3">
                   "{lead.audit_reason_1 || 'The website lacks a clear call-to-action and appears outdated, which may be costing them potential bookings.'}"
                </div>
             </div>
          </div>

          {/* Email Draft Section */}
          {lead.draft_body && (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-[#DBEAFE] border-b border-[#BFDBFE] flex items-center justify-between">
                <h4 className="text-[10px] font-extrabold text-[#1E40AF] uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Personalized Draft
                </h4>
                <button 
                  onClick={() => {
                    const text = lead.draft_subject ? `Subject: ${lead.draft_subject}\n\n${lead.draft_body}` : lead.draft_body;
                    navigator.clipboard.writeText(text)
                    toast.success('📋 Draft copied to clipboard')
                  }}
                  className="text-[10px] font-bold text-[#3B82F6] bg-white px-2 py-1 rounded-lg border border-[#BFDBFE] shadow-sm hover:bg-[#3B82F6] hover:text-white transition-all active:scale-95 uppercase"
                >
                  Copy All
                </button>
              </div>
              <div className="p-5">
                {lead.draft_subject && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider mb-1">Subject Line</p>
                    <p className="text-sm font-bold text-[#0F172A] leading-tight">{lead.draft_subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider mb-1">Email Body</p>
                  <div className="text-sm text-[#0F172A] whitespace-pre-wrap font-medium leading-relaxed">{lead.draft_body}</div>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Status */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest">Pipeline Status</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onUpdateStatus(lead.id, 'Contacted')}
                className={`py-2.5 text-sm font-bold rounded-xl transition-all border shadow-sm ${
                  lead.status === 'Contacted' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                }`}
              >
                Mark Contacted
              </button>
              <button 
                onClick={() => onUpdateStatus(lead.id, 'Won')}
                className={`py-2.5 text-sm font-bold rounded-xl transition-all border shadow-sm flex items-center justify-center gap-1.5 ${
                  lead.status === 'Won' 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Won 🎉
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-3 pb-8">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest">Internal Notes</h4>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdateNotes(lead.id, notes)}
              placeholder="Add private notes about this lead... (auto-saves)"
              className="w-full h-32 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:bg-white transition-all resize-none shadow-inner"
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
    // Optimistic Update
    const oldLeads = [...leads]
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status: newStatus })

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      toast.success(`✓ Lead status updated to ${newStatus}`)
    } catch (err) {
      setLeads(oldLeads) // Rollback
      toast.error('Failed to update status')
    }
  }

  const handleNotesChange = async (leadId: string, newNotes: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNotes })
      })
      if (!res.ok) throw new Error()
      setLeads(leads.map(l => l.id === leadId ? { ...l, notes: newNotes } : l))
      toast.success('✓ Notes saved')
    } catch (err) {
      toast.error('Failed to save notes')
    }
  }

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return toast.error('No leads to export')
    
    // Custom CSV Generation logic
    const csvRows = [
      ['Business Name', 'Category', 'City', 'Email', 'Phone', 'Website', 'Verdict', 'Status', 'Draft Subject', 'Draft Body'],
      ...leads.map(lead => [
        lead.business_name,
        lead.category,
        lead.city,
        lead.email || '',
        lead.phone || '',
        lead.website || '',
        lead.audit_verdict || '',
        lead.status,
        lead.draft_subject || '',
        lead.draft_body || '',
      ])
    ]

    const csvContent = csvRows
      .map(row => row.map(cell => `"${(String(cell || '')).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${campaign.name.replace(/\s+/g, '_')}_leads.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`📥 CSV downloaded — ${leads.length} leads`)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
           <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-xl" />
           <div className="h-4 w-48 bg-slate-100 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white border border-slate-100 animate-pulse rounded-2xl" />)}
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 w-full bg-slate-50 animate-pulse rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!campaign) return (
    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto mt-12">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-slate-400" /></div>
      <h3 className="text-xl font-bold text-[#0F172A] mb-2">Campaign Not Found</h3>
      <p className="text-slate-500 mb-6 font-medium">The campaign you're looking for doesn't exist or has been deleted.</p>
      <Link href="/dashboard/campaigns" className="px-6 py-3 bg-[#3B82F6] text-white font-bold rounded-xl shadow-sm hover:bg-[#2563EB] transition-all">Return to Campaigns</Link>
    </div>
  )

  return (
    <div className="pb-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/campaigns" className="p-2.5 bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all shadow-sm active:scale-95">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">{campaign.name}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#64748B] ml-14 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg"><Target className="w-4 h-4 text-[#3B82F6]" /> {campaign.target_industry}</span>
            <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">📍 {campaign.location}</span>
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:bg-slate-800 active:scale-[0.98] w-full lg:w-auto"
        >
          <Download className="w-4 h-4" /> Export Leads to CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Emails Found', value: leads.filter(l => !!l.email).length, icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Drafts Ready', value: leads.filter(l => !!l.draft_body).length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shrink-0`}><stat.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-2xl font-black text-[#0F172A]">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leads Table Container */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E2E8F0] bg-[#F8FAFC]/50 flex justify-between items-center">
          <h3 className="font-extrabold text-[#0F172A] text-lg">Discovered Business Leads</h3>
          <span className="text-[10px] font-extrabold text-[#64748B] bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-sm uppercase tracking-widest">{leads.length} results</span>
        </div>
        
        {(!leads || leads.length === 0) ? (
          <div className="p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 ring-8 ring-slate-50/50">
              <Search className="w-10 h-10" />
            </div>
            <p className="text-[#0F172A] text-xl font-black mb-2 tracking-tight">
              {campaign.status === 'running' ? 'AI is scanning the web...' : 'No leads found yet.'}
            </p>
            <p className="text-[#64748B] text-sm max-w-sm font-bold leading-relaxed">
              {campaign.status === 'running' ? 'Sit tight! We are finding high-quality businesses for you. This usually takes 2-3 minutes.' : 'We couldn\'t find any businesses matching your criteria. Try adjusting the location or industry.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#F8FAFC]/50 text-[10px] uppercase tracking-widest text-[#94A3B8] font-black border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-8 py-5">Business Name</th>
                  <th className="px-8 py-5">Industry</th>
                  <th className="px-8 py-5">Location</th>
                  <th className="px-8 py-5">Email Status</th>
                  <th className="px-8 py-5">Website Audit</th>
                  <th className="px-8 py-5">Lead Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)} 
                    className="hover:bg-[#F8FAFC] transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <span className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors truncate max-w-[200px] block">
                        {lead.business_name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-[#64748B] uppercase tracking-wider">{lead.category}</td>
                    <td className="px-8 py-6 text-xs font-bold text-[#64748B] uppercase tracking-wider">{lead.city}</td>
                    <td className="px-8 py-6">
                      {lead.email ? (
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500" />
                           <span className="text-sm font-bold text-[#0F172A]">{lead.email}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-300 italic uppercase tracking-widest">Not Found</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {lead.audit_verdict ? <VerdictBadge verdict={lead.audit_verdict} /> : <span className="text-slate-200">—</span>}
                    </td>
                    <td className="px-8 py-6">
                      <StatusDropdown status={lead.status || 'New'} onUpdate={(s) => handleStatusChange(lead.id, s)} />
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="p-2 text-slate-300 group-hover:text-[#3B82F6] group-hover:bg-blue-50 rounded-xl transition-all inline-block"><Eye className="w-5 h-5" /></div>
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
