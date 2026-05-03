'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        setCampaigns(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Completed</span>
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            Running
          </span>
        )
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Failed</span>
      default:
        return <span className="px-2 py-1 bg-[#F1F5F9] text-[#64748B] text-xs font-semibold rounded-full">Pending</span>
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Campaigns</h2>
          <p className="text-[#64748B] text-sm">Manage your scout runs and view their progress.</p>
        </div>
        <Link
          href="/dashboard/scout"
          className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          + New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#64748B] text-sm animate-pulse">Loading campaigns...</div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
            <span className="text-xl">📁</span>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-2">No campaigns yet</h3>
          <p className="text-[#64748B] text-sm max-w-sm mb-6">
            You haven&apos;t run any campaigns. Start a new scout run to find leads in your target industry.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Campaign Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Target</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Location</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Leads</th>
                  <th className="px-5 py-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/campaigns/${campaign.id}`} className="block">
                        <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors">
                          {campaign.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#64748B]">{campaign.target_industry}</td>
                    <td className="px-5 py-4 text-sm text-[#64748B]">{campaign.location}</td>
                    <td className="px-5 py-4">{getStatusBadge(campaign.status)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0F172A]">{campaign.leads_found || 0}</td>
                    <td className="px-5 py-4 text-sm text-[#64748B]">
                      {new Date(campaign.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
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
