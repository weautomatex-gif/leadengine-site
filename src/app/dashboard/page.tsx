'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { formatDistanceToNow, format } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Users,
  Mail,
  FileText,
  Zap,
  Target,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Search,
  FolderOpen
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { EmptyState } from '@/components/ui/EmptyState'

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<{ stats: any; recentCampaigns: any[]; recentLeads: any[]; chartData?: any[]; topNiche?: string; totalScouts?: number } | null>(null)
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
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2 text-left">Dashboard Overview</h2>
          <p className="text-[#64748B] font-medium text-left">Loading your latest results...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const statsList = [
    { label: 'Total Leads', value: data?.stats?.totalLeads || 0, icon: Users, color: '#3B82F6', bg: 'bg-blue-50', border: 'border-l-[#3B82F6]', trend: '+12% this month' },
    { label: 'Emails Found', value: data?.stats?.emailsFound || 0, icon: Mail, color: '#10B981', bg: 'bg-emerald-50', border: 'border-l-[#10B981]', trend: '84% success rate' },
    { label: 'Drafts Ready', value: data?.stats?.draftsReady || 0, icon: FileText, color: '#8B5CF6', bg: 'bg-purple-50', border: 'border-l-[#8B5CF6]', trend: 'Ready to send' },
    { label: 'Credits Left', value: data?.stats?.creditsLeft || 0, icon: Zap, color: '#F59E0B', bg: 'bg-amber-50', border: 'border-l-[#F59E0B]', trend: 'Renews in 12 days' },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight text-left">Dashboard Overview</h2>
          <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest mt-1 text-left">Here&apos;s your scouting performance at a glance.</p>
        </div>
        <Link
          href="/dashboard/scout"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-black rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <Target className="w-4 h-4" />
          New Scout Run
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-[3px] group ${stat.border} relative`}
            >
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{stat.label}</p>
                <span className="text-2xl font-bold text-[#0F172A]">
                  <CountUp end={stat.value} duration={1} separator="," />
                </span>
                <p className="text-[11px] text-[#64748B] font-medium mt-1">{stat.trend}</p>
              </div>
              <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#0F172A]">Lead Activity</h3>
          <p className="text-sm text-[#64748B]">Leads captured this month</p>
        </div>

        <div className="h-[200px] w-full">
          {(!data?.chartData || data.chartData.length === 0 || data.chartData.every(d => d.leads === 0)) ? (
            <div className="h-full flex items-center justify-center text-sm font-medium text-[#94A3B8] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
              No leads this month — start a scout to see activity here
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748B', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#0F172A', fontSize: '14px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Leads Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
            <h3 className="text-lg font-semibold text-[#0F172A]">Recent Leads</h3>
            <Link href="/dashboard/leads" className="text-xs font-semibold text-[#3B82F6] hover:text-[#2563EB] flex items-center gap-1 group">
              View All Leads <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex-1">
            {(!data?.recentLeads || data.recentLeads.length === 0) ? (
              <div className="p-12 flex flex-col items-center justify-center h-full text-center">
                <Users className="w-10 h-10 text-slate-300 mb-4" />
                <h4 className="text-[#0F172A] font-semibold mb-1">No leads yet</h4>
                <p className="text-sm text-[#64748B] mb-4">You haven&apos;t captured any leads.</p>
                <Link href="/dashboard/scout" className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] flex items-center gap-1">
                  Start Scouting <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Business Name</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Category</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">City</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Verdict</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {data.recentLeads.map((lead: any) => (
                      <tr
                        key={lead.id}
                        onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                        className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-[#0F172A] truncate max-w-[200px] block">{lead.business_name}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B] truncate max-w-[120px]">{lead.category}</td>
                        <td className="px-4 py-3 text-sm text-[#64748B]">{lead.city}</td>
                        <td className="px-4 py-3">
                          {lead.audit_verdict ? <VerdictBadge verdict={lead.audit_verdict} /> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={lead.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Summary Section */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">
            {format(new Date(), 'MMMM yyyy')}
          </h3>

          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-[#64748B]">Scouts run</span>
              <span className="text-sm font-semibold text-[#0F172A]">{data?.totalScouts || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-[#64748B]">Leads captured</span>
              <span className="text-sm font-semibold text-[#0F172A]">{data?.stats?.totalLeads || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-[#64748B]">Emails found</span>
              <span className="text-sm font-semibold text-[#0F172A]">{data?.stats?.emailsFound || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-[#64748B]">Response rate</span>
              <span className="text-sm font-semibold text-[#0F172A]">
                {(data?.stats?.totalLeads || 0) > 0
                  ? `${Math.round(((data?.stats?.emailsFound || 0) / (data?.stats?.totalLeads || 1)) * 100)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-[#64748B]">Top niche</span>
              <span className="text-sm font-semibold text-[#0F172A]">{data?.topNiche || '—'}</span>
            </div>
          </div>

          <div className="pt-6 mt-2">
            <Link href="/dashboard/campaigns" className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] flex items-center justify-center gap-1 group w-full bg-[#F8FAFC] py-2.5 rounded-xl border border-[#E2E8F0] transition-colors hover:border-[#3B82F6]">
              View Campaigns <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
