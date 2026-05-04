'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Search, Download, Filter, Users, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'
import { downloadCSV } from '@/lib/csv-export'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { TableRowSkeleton } from '@/components/ui/SkeletonLoader'
import { EmptyState } from '@/components/ui/EmptyState'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [statusFilter, setStatusFilter] = useState('')
  const [verdictFilter, setVerdictFilter] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())

  const itemsPerPage = 25

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.append('status', statusFilter)
        if (verdictFilter) params.append('verdict', verdictFilter)
        if (campaignFilter) params.append('campaign_id', campaignFilter)
        if (searchQuery) params.append('search', searchQuery)

        const res = await fetch(`/api/leads?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setLeads(data.leads || [])
          setCampaigns(data.campaigns || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchLeads()
      setCurrentPage(1) // Reset to page 1 on filter
      setSelectedLeadIds(new Set()) // Clear selection on filter
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [statusFilter, verdictFilter, campaignFilter, searchQuery])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
      toast.success('Status updated')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedLeadIds.size === 0) return
    const ids = Array.from(selectedLeadIds)
    const toastId = toast.loading(`Updating ${ids.length} leads...`)
    
    try {
      // Basic Promise.all since we don't have a bulk patch endpoint
      await Promise.all(ids.map(id => 
        fetch(`/api/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      ))
      
      setLeads(leads.map(l => selectedLeadIds.has(l.id) ? { ...l, status: newStatus } : l))
      toast.success(`Successfully updated ${ids.length} leads to ${newStatus}`, { id: toastId })
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
    downloadCSV(dataToExport, 'leadengine_export')
    toast.success('Export completed')
  }

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === paginatedLeads.length) {
      setSelectedLeadIds(new Set())
    } else {
      setSelectedLeadIds(new Set(paginatedLeads.map(l => l.id)))
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

  // Pagination logic
  const totalPages = Math.ceil((leads?.length || 0) / itemsPerPage)
  const paginatedLeads = leads?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || []

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1">All Leads</h2>
          <p className="text-[#64748B] text-sm">Master view of all leads across your campaigns.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-bold rounded-xl transition-all shadow-sm h-fit"
        >
          <Download className="w-4 h-4" /> 
          {selectedLeadIds.size > 0 ? `Export Selected (${selectedLeadIds.size})` : 'Export All'}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business name..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-shadow"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white cursor-pointer shadow-sm"
          >
            <option value="">All Campaigns</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white cursor-pointer shadow-sm"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select 
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-xl text-[#0F172A] font-medium focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white cursor-pointer shadow-sm"
          >
            <option value="">All Verdicts</option>
            <option value="OUTDATED">Outdated</option>
            <option value="DATED">Dated</option>
            <option value="NO_SITE">No Site</option>
            <option value="BROKEN">Broken</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedLeadIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3 mb-6 flex items-center justify-between shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 text-[#0369A1] text-sm font-bold pl-2">
              <CheckSquare className="w-4 h-4" />
              {selectedLeadIds.size} Leads Selected
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#0284C7] font-semibold uppercase tracking-wider">Bulk Update Status:</span>
              <select 
                onChange={(e) => {
                  if (e.target.value) handleBulkStatusUpdate(e.target.value)
                  e.target.value = "" // Reset
                }}
                className="px-3 py-1.5 text-sm border border-[#BAE6FD] rounded-lg text-[#0369A1] font-bold focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white cursor-pointer shadow-sm"
              >
                <option value="">Select...</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map(i => <TableRowSkeleton key={i} />)}
        </div>
      ) : (!leads || leads.length === 0) ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No leads found"
          description="You don't have any leads matching these filters yet. Try adjusting your search criteria."
          action={
            <button onClick={() => { setStatusFilter(''); setVerdictFilter(''); setCampaignFilter(''); setSearchQuery('') }} className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#0F172A] text-sm font-bold rounded-xl shadow-sm hover:bg-[#F8FAFC] mt-2">
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-5 py-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      checked={paginatedLeads.length > 0 && selectedLeadIds.size === paginatedLeads.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-[#3B82F6] rounded border-[#CBD5E1] focus:ring-[#3B82F6] cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Business Name</th>
                  <th className="px-4 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Category</th>
                  <th className="px-4 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">City</th>
                  <th className="px-4 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Verdict</th>
                  <th className="px-4 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {paginatedLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className={`transition-colors group cursor-pointer ${selectedLeadIds.has(lead.id) ? 'bg-[#F0F9FF]' : 'hover:bg-[#F8FAFC]'}`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).tagName !== 'SELECT' && (e.target as HTMLElement).tagName !== 'INPUT') {
                        toggleSelectLead(lead.id)
                      }
                    }}
                  >
                    <td className="px-5 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedLeadIds.has(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        onClick={e => e.stopPropagation()}
                        className="w-4 h-4 text-[#3B82F6] rounded border-[#CBD5E1] focus:ring-[#3B82F6] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/leads/${lead.id}`} className="block">
                        <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors truncate max-w-[180px] block">
                          {lead.business_name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-[#3B82F6] truncate max-w-[150px]">
                      <Link href={`/dashboard/campaigns/${lead.campaign_id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                        {campaignMap.get(lead.campaign_id) || 'Unknown Campaign'}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-[#64748B]">{lead.category}</td>
                    <td className="px-4 py-4 text-sm font-medium text-[#64748B]">{lead.city}</td>
                    <td className="px-4 py-4">
                      {lead.audit_verdict ? <VerdictBadge verdict={lead.audit_verdict} /> : <span className="text-[#94A3B8]">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <select 
                        value={lead.status || 'New'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-bold border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] shadow-sm cursor-pointer"
                      >
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <span className="text-sm text-[#64748B] font-medium">
                Showing <span className="font-bold text-[#0F172A]">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-[#0F172A]">{Math.min(currentPage * itemsPerPage, leads.length)}</span> of <span className="font-bold text-[#0F172A]">{leads.length}</span> results
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-sm font-bold text-[#0F172A] shadow-sm">
                  {currentPage} <span className="text-[#94A3B8] font-medium">/ {totalPages}</span>
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
