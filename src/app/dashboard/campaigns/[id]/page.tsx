'use client'

import Link from 'next/link'
import { useState, useEffect, use } from 'react'

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [campaign, setCampaign] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      })
  }, [id])

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

  if (loading) return <div className="p-12 text-center text-[#64748B] text-sm animate-pulse">Loading campaign details...</div>
  if (!campaign) return <div className="p-12 text-center text-[#64748B] text-sm">Campaign not found.</div>

  const stats = [
    { label: 'Leads Found', value: campaign.leads_found || (leads?.length || 0) },
    { label: 'Emails Found', value: leads?.filter(l => l.email).length || 0 },
    { label: 'Drafts Ready', value: leads?.filter(l => l.email_draft).length || 0 },
    { label: 'Qualified Leads', value: leads?.filter(l => l.status === 'Qualified').length || 0 },
  ]

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/campaigns" className="text-[#94A3B8] hover:text-[#0F172A] transition-colors">
              ← Back
            </Link>
            <h2 className="text-2xl font-bold text-[#0F172A]">{campaign.name}</h2>
            {campaign.status === 'running' && (
              <span className="px-2 py-1 bg-[#DBEAFE] text-[#1E40AF] text-[10px] font-bold uppercase tracking-wide rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                Running
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-[#64748B]">
            <span>🎯 {campaign.target_industry}</span>
            <span>📍 {campaign.location}</span>
            <span>📅 {new Date(campaign.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <button className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-semibold rounded-lg transition-colors shadow-sm">
          Export CSV ↓
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
            <p className="text-sm font-medium text-[#64748B] mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-[#0F172A]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
          <h3 className="font-bold text-[#0F172A]">Discovered Leads</h3>
          <span className="text-xs text-[#64748B]">{leads?.length || 0} results</span>
        </div>
        
        {(!leads || leads.length === 0) ? (
          <div className="p-12 text-center text-[#64748B] text-sm">
            {campaign.status === 'running' ? 'Finding leads... this may take a few minutes.' : 'No leads found for this campaign.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-white">
                  <th className="px-5 py-3 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Business Name</th>
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
                        <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors truncate max-w-[200px] block">
                          {lead.business_name}
                        </span>
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
                        onClick={(e) => e.stopPropagation()} // Prevent row click
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
        )}
      </div>
    </div>
  )
}
