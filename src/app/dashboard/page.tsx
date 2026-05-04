'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { formatDistanceToNow } from 'date-fns'
import { Users, Mail, FileText, Zap, Target } from 'lucide-react'
import { CardSkeleton, TableRowSkeleton } from '@/components/ui/SkeletonLoader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'

export default function DashboardPage() {
  const [data, setData] = useState<{ stats: any; recentCampaigns: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((resData) => {
        if (!resData.error) {
          setData(resData)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Welcome back</h2>
          <p className="text-[#64748B]">Here&apos;s what&apos;s happening with your lead generation today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const statsList = [
    { label: 'Total Leads', value: data?.stats.totalLeads || 0, icon: Users, color: '#3B82F6', bg: 'bg-blue-50', border: 'border-l-blue-500' },
    { label: 'Emails Found', value: data?.stats.emailsFound || 0, icon: Mail, color: '#10B981', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
    { label: 'Drafts Ready', value: data?.stats.draftsReady || 0, icon: FileText, color: '#8B5CF6', bg: 'bg-purple-50', border: 'border-l-purple-500' },
    { label: 'Credits Left', value: data?.stats.creditsLeft || 0, icon: Zap, color: '#F59E0B', bg: 'bg-amber-50', border: 'border-l-amber-500' },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Welcome back</h2>
          <p className="text-[#64748B] text-sm mt-1">Here&apos;s your scouting overview for today.</p>
        </div>
        <Link
          href="/dashboard/scout"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Target className="w-4 h-4" />
          New Scout Run
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-all duration-200 border-l-[3px] ${stat.border}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[#64748B] mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#0F172A]">
                    <CountUp end={stat.value} duration={2} separator="," />
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0F172A]">Recent Campaigns</h3>
          {data?.recentCampaigns && data.recentCampaigns.length > 0 && (
            <Link href="/dashboard/campaigns" className="text-sm font-semibold text-[#3B82F6] hover:underline">
              View All →
            </Link>
          )}
        </div>

        {(!data?.recentCampaigns || data.recentCampaigns.length === 0) ? (
          <EmptyState
            icon={<Target className="w-8 h-8" />}
            title="No campaigns yet"
            description="Start your first scout run to find high-quality leads in seconds."
            action={
              <Link href="/dashboard/scout" className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                Start Scouting →
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Campaign Name</th>
                    <th className="px-6 py-4 font-semibold">Target</th>
                    <th className="px-6 py-4 font-semibold">Leads</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {data.recentCampaigns.map((campaign: any, i: number) => (
                    <motion.tr 
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/campaigns/${campaign.id}`} className="font-semibold text-[#0F172A] hover:text-[#3B82F6] transition-colors flex items-center gap-2">
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-slate-100 text-slate-600">
                            {campaign.target_industry}
                          </span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-[#64748B]">{campaign.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#0F172A]">
                        {campaign.leads_found}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-[#64748B]">
                        {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
