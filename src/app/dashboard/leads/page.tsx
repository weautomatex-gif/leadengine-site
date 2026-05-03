'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [statusFilter, setStatusFilter] = useState('')
  const [verdictFilter, setVerdictFilter] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

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

    // Debounce search query
    const timeoutId = setTimeout(() => {
      fetchLeads()
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
      // Optimistically update UI
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    } catch (err) {
      console.error('Failed to update status', err)
      alert('Failed to update status')
    }
  }

  const campaignMap = new Map(campaigns.map(c => [c.id, c.name]))

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'OUTDATED': return 'bg-orange-100 text-orange-700'
      case 'DATED': return 'bg-yellow-100 text-yellow-700'
      case 'BROKEN': return 'bg-red-100 text-red-700'
      case 'NO_SITE': return 'bg-purple-100 text-purple-700'
      case 'MODERN': return 'bg-green-100 text-green-700'
      default: return 'bg-[#F1F5F9] text-[#64748B]'
    }
  }

  const statusOptions = ['New', 'Contacted', 'Replied', 'Qualified', 'Won', 'Lost']

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-1">All Leads</h2>
          <p className="text-[#64748B] text-sm">Master view of all leads across your campaigns.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-semibold rounded-lg transition-colors shadow-sm">
          Export CSV ↓
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search business name..." 
          className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        />
        <select 
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
        >
          <option value="">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select 
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-white"
        >
          <option value="">All Verdicts</option>
          <option value="OUTDATED">Outdated</option>
          <option value="DATED">Dated</option>
          <option value="NO_SITE">No Site</option>
          <option value="BROKEN">Broken</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#64748B] text-sm animate-pulse">Loading leads...</div>
      ) : (!leads || leads.length === 0) ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
            <span className="text-xl">👥</span>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-2">No leads found</h3>
          <p className="text-[#64748B] text-sm max-w-sm mb-6">
            You don&apos;t have any leads matching these filters yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Business Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Campaign</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">City</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Verdict</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/leads/${lead.id}`} className="block">
                        <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors truncate max-w-[180px] block">
                          {lead.business_name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-[#3B82F6] truncate max-w-[150px]">
                      <Link href={`/dashboard/campaigns/${lead.campaign_id}`} className="hover:underline">
                        {campaignMap.get(lead.campaign_id) || 'Unknown Campaign'}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#64748B]">{lead.category}</td>
                    <td className="px-5 py-3 text-sm text-[#64748B]">{lead.city}</td>
                    <td className="px-5 py-3 text-sm text-[#64748B] truncate max-w-[150px]">{lead.email || '—'}</td>
                    <td className="px-5 py-3">
                      {lead.audit_verdict ? (
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getVerdictBadge(lead.audit_verdict)}`}>
                          {lead.audit_verdict}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <select 
                        value={lead.status || 'New'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="text-xs font-semibold border border-[#E2E8F0] rounded-md px-2 py-1 bg-white text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
