'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Search, 
  Download, 
  Filter, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare,
  ChevronDown,
  X,
  Target,
  ArrowUpRight,
  MoreVertical,
  Eye
} from 'lucide-react'
import { StatusSelect } from '@/components/ui/StatusSelect'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  const [statusFilter, setStatusFilter] = useState('All')
  const [verdictFilter, setVerdictFilter] = useState('All')
  const [campaignFilter, setCampaignFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())

  const limit = 25

  const fetchLeads = async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'All') params.append('status', statusFilter)
      if (verdictFilter !== 'All') params.append('verdict', verdictFilter)
      if (campaignFilter !== 'All') params.append('campaign_id', campaignFilter)
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', page.toString())
      params.append('limit', limit.toString())

      const res = await fetch(`/api/leads?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
        setCampaigns(data.campaigns || [])
        setTotalCount(data.totalCount || 0)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  // Effect for search debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchLeads(1)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, verdictFilter, campaignFilter])

  // Effect for pagination
  useEffect(() => {
    if (currentPage !== 1) {
      fetchLeads(currentPage)
    }
  }, [currentPage])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Optimistic
    const oldLeads = [...leads]
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error()
      toast.success(`✓ Lead status updated to ${newStatus}`)
    } catch (err) {
      setLeads(oldLeads)
      toast.error('Failed to update status')
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedLeadIds.size === 0) return
    const ids = Array.from(selectedLeadIds)
    const toastId = toast.loading(`Updating ${ids.length} leads...`)
    
    try {
      await Promise.all(ids.map(id => 
        fetch(`/api/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      ))
      
      setLeads(leads.map(l => selectedLeadIds.has(l.id) ? { ...l, status: newStatus } : l))
      toast.success(`✓ Successfully updated ${ids.length} leads to ${newStatus}`, { id: toastId })
      setSelectedLeadIds(new Set())
    } catch (error) {
      toast.error('Failed to update some leads', { id: toastId })
    }
  }

  const handleExportCSV = () => {
    const dataToExport = selectedLeadIds.size > 0 
      ? leads.filter(l => selectedLeadIds.has(l.id))
      : leads

    if (dataToExport.length === 0) return toast.error('No leads to export')
    
    const csvRows = [
      ['Business Name', 'Category', 'City', 'Email', 'Phone', 'Website', 'Verdict', 'Status', 'Draft Subject', 'Draft Body'],
      ...dataToExport.map(lead => [
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

    const csvContent = csvRows.map(row => row.map(cell => `"${(String(cell || '')).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`📥 CSV downloaded — ${dataToExport.length} leads`)
  }

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === leads.length) {
      setSelectedLeadIds(new Set())
    } else {
      setSelectedLeadIds(new Set(leads.map(l => l.id)))
    }
  }

  const toggleSelectLead = (id: string) => {
    const newSet = new Set(selectedLeadIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedLeadIds(newSet)
  }

  const campaignMap = useMemo(() => new Map(campaigns.map(c => [c.id, c.name])), [campaigns])
  const statusOptions = ['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost']
  const verdictOptions = ['NO_SITE', 'OUTDATED', 'DATED', 'BROKEN', 'ACCEPTABLE', 'MODERN']

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="pb-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Master Leads Database</h2>
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mt-1">Manage and filter leads across all your campaigns</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] text-white text-sm font-bold rounded-xl transition-all shadow-lg hover:bg-slate-800 active:scale-[0.98]"
        >
          <Download className="w-4 h-4" /> 
          {selectedLeadIds.size > 0 ? `Export Selected (${selectedLeadIds.size})` : 'Export All Results'}
        </button>
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business name..." 
              className="w-full h-10 pl-10 pr-4 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-[#0F172A] placeholder-[#94A3B8]"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Campaign</label>
               <select 
                 value={campaignFilter}
                 onChange={(e) => setCampaignFilter(e.target.value)}
                 className="h-10 px-4 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-[#0F172A] min-w-[160px] cursor-pointer appearance-none"
               >
                 <option value="All">All Campaigns</option>
                 {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Status</label>
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="h-10 px-4 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-[#0F172A] min-w-[140px] cursor-pointer appearance-none"
               >
                 <option value="All">All Statuses</option>
                 {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
               </select>
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Verdict</label>
               <select 
                 value={verdictFilter}
                 onChange={(e) => setVerdictFilter(e.target.value)}
                 className="h-10 px-4 text-sm border border-[#E2E8F0] rounded-xl bg-white focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all text-[#0F172A] min-w-[140px] cursor-pointer appearance-none"
               >
                 <option value="All">All Verdicts</option>
                 {verdictOptions.map(opt => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
               </select>
            </div>
            <button 
              onClick={() => { setStatusFilter('All'); setVerdictFilter('All'); setCampaignFilter('All'); setSearchQuery('') }}
              className="self-end p-3 bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"
              title="Clear all filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Contextual Bar */}
      <AnimatePresence>
        {selectedLeadIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-4 rounded-3xl shadow-2xl z-50 flex items-center gap-8 border border-slate-700 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg shadow-blue-500/20">
                {selectedLeadIds.size}
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Leads Selected</span>
            </div>
            
            <div className="h-6 w-px bg-slate-700" />
            
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulk Update:</span>
               <div className="flex gap-2">
                 {['Qualified', 'Won', 'Lost'].map(status => (
                   <button
                     key={status}
                     onClick={() => handleBulkStatusUpdate(status)}
                     className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-600 active:scale-95"
                   >
                     {status}
                   </button>
                 ))}
               </div>
            </div>
            
            <button 
              onClick={() => setSelectedLeadIds(new Set())}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-14 w-full bg-slate-50 animate-pulse rounded-2xl" />)}
          </div>
        ) : (!leads || leads.length === 0) ? (
          <div className="p-20 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 ring-8 ring-slate-50/50">
               <Users className="w-10 h-10" />
             </div>
             <p className="text-[#0F172A] text-xl font-black mb-2 tracking-tight">No leads found.</p>
             <p className="text-[#64748B] text-sm max-w-sm font-bold leading-relaxed mb-8">We couldn't find any leads matching your current filter settings. Try clearing them to see more.</p>
             <button 
               onClick={() => { setStatusFilter('All'); setVerdictFilter('All'); setCampaignFilter('All'); setSearchQuery('') }}
               className="px-8 py-3 bg-[#3B82F6] text-white font-bold rounded-xl shadow-lg hover:bg-[#2563EB] transition-all active:scale-95"
             >
               Clear All Filters
             </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-left whitespace-nowrap table-fixed">
              <thead className="bg-[#F8FAFC]/50 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <div className="flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={leads.length > 0 && selectedLeadIds.size === leads.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-[#3B82F6] rounded border-[#E2E8F0] focus:ring-[#3B82F6] cursor-pointer transition-all shadow-sm"
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 w-[25%]">Business Name</th>
                  <th className="px-4 py-3 w-[20%]">Campaign</th>
                  <th className="px-4 py-3 w-[15%]">Industry</th>
                  <th className="px-4 py-3 w-[15%]">Verdict</th>
                  <th className="px-4 py-3 w-[15%]">Status</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={`transition-all duration-200 group cursor-pointer ${selectedLeadIds.has(lead.id) ? 'bg-[#F0F9FF]' : 'hover:bg-[#F8FAFC]'}`}
                    onClick={() => toggleSelectLead(lead.id)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={selectedLeadIds.has(lead.id)}
                          onChange={() => toggleSelectLead(lead.id)}
                          className="w-4 h-4 text-[#3B82F6] rounded border-[#E2E8F0] focus:ring-[#3B82F6] cursor-pointer transition-all shadow-sm"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/leads/${lead.id}`} className="block" onClick={e => e.stopPropagation()}>
                        <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors truncate max-w-[200px] block">
                          {lead.business_name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/dashboard/campaigns/${lead.campaign_id}`} 
                        className="text-[10px] font-semibold text-[#3B82F6] bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest inline-block truncate max-w-[180px]" 
                        onClick={(e) => e.stopPropagation()}
                        title={campaignMap.get(lead.campaign_id) || 'Unknown'}
                      >
                        {campaignMap.get(lead.campaign_id) || 'Unknown'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B] truncate max-w-[120px]">{lead.category}</td>
                    <td className="px-4 py-3">
                      {lead.audit_verdict ? <VerdictBadge verdict={lead.audit_verdict} /> : <span className="text-slate-200">—</span>}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                       <StatusSelect leadId={lead.id} currentStatus={lead.status || 'new'} onStatusChange={(id, newStatus) => handleStatusChange(id, newStatus)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                       <Link 
                         href={`/dashboard/leads/${lead.id}`}
                         className="p-1.5 text-slate-300 group-hover:text-[#3B82F6] group-hover:bg-blue-50 rounded transition-all inline-block"
                         onClick={e => e.stopPropagation()}
                       >
                         <ArrowUpRight className="w-4 h-4" />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-[#E2E8F0] bg-[#F8FAFC]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest">
                 Page <span className="text-[#0F172A]">{currentPage}</span> of {totalPages}
               </p>
               <span className="text-[#E2E8F0] mx-2">|</span>
               <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                 Showing {leads.length} of {totalCount} total leads
               </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1.5">
                 {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all border shadow-sm ${
                          currentPage === pageNum 
                          ? 'bg-[#0F172A] text-white border-[#0F172A]' 
                          : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#3B82F6]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                 })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
