'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { formatDistanceToNow } from 'date-fns'
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
  const [data, setData] = useState<{ stats: any; recentCampaigns: any[]; recentLeads: any[] } | null>(null)
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
    { label: 'Total Leads', value: data?.stats.totalLeads || 0, icon: Users, color: '#3B82F6', bg: 'bg-blue-50', border: 'border-l-[#3B82F6]', trend: '+12% this month' },
    { label: 'Emails Found', value: data?.stats.emailsFound || 0, icon: Mail, color: '#10B981', bg: 'bg-emerald-50', border: 'border-l-[#10B981]', trend: '84% success rate' },
    { label: 'Drafts Ready', value: data?.stats.draftsReady || 0, icon: FileText, color: '#8B5CF6', bg: 'bg-purple-50', border: 'border-l-[#8B5CF6]', trend: 'Ready to send' },
    { label: 'Credits Left', value: data?.stats.creditsLeft || 0, icon: Zap, color: '#F59E0B', bg: 'bg-amber-50', border: 'border-l-[#F59E0B]', trend: 'Renews in 12 days' },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight text-left">Dashboard Overview</h2>
          <p className="text-[#64748B] text-sm font-bold uppercase tracking-widest mt-1 opacity-60 text-left">Here&apos;s your scouting performance at a glance.</p>
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
              className={`bg-white rounded-3xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-[4px] group ${stat.border}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" /> Growth
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1 text-left">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0F172A] tracking-tighter">
                    <CountUp end={stat.value} duration={0.6} separator="," />
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-2 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-[#10B981]" /> {stat.trend}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Leads Section */}
      <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Recent Leads</h3>
          <Link href="/dashboard/leads" className="text-[10px] font-black text-[#3B82F6] hover:text-[#2563EB] uppercase tracking-widest flex items-center gap-1 group">
            View All Leads
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {(!data?.recentLeads || data.recentLeads.length === 0) ? (
          <div className="p-16">
            <EmptyState
              icon={<Users className="w-10 h-10" />}
              title="No leads discovered yet"
              description="Start your first scout run to find high-quality leads in your target industry."
              action={
                <Link href="/dashboard/scout" className="px-8 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-black rounded-2xl transition-all shadow-lg mt-4">
                  Find Your First Leads →
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">
                <tr>
                  <th className="px-8 py-5">Business Name</th>
                  <th className="px-8 py-5">Campaign</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">City</th>
                  <th className="px-8 py-5">Verdict</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {data.recentLeads.map((lead: any) => (
                  <tr 
                    key={lead.id}
                    onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    className="hover:bg-[#F8FAFC] transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <span className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors">
                        {lead.business_name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black text-[#3B82F6] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">
                          {lead.campaign_name}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-[#64748B] uppercase tracking-wider">{lead.category}</td>
                    <td className="px-8 py-6 text-xs font-bold text-[#64748B] uppercase tracking-wider">{lead.city}</td>
                    <td className="px-8 py-6">
                      {lead.audit_verdict ? <VerdictBadge verdict={lead.audit_verdict} /> : <span className="text-slate-200">—</span>}
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Campaigns Section */}
      <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Recent Campaigns</h3>
          <Link href="/dashboard/campaigns" className="text-[10px] font-black text-[#3B82F6] hover:text-[#2563EB] uppercase tracking-widest flex items-center gap-1 group">
            View All Campaigns
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {(!data?.recentCampaigns || data.recentCampaigns.length === 0) ? (
          <div className="p-12">
            <EmptyState
              icon={<FolderOpen className="w-10 h-10" />}
              title="No campaigns yet"
              description="Create a campaign to start organizing your leads and tracking your progress."
              action={
                <Link href="/dashboard/scout" className="px-8 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-black rounded-2xl transition-all shadow-lg mt-4">
                  New Campaign
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">
                <tr>
                  <th className="px-8 py-5">Campaign Name</th>
                  <th className="px-8 py-5">Target Audience</th>
                  <th className="px-8 py-5 text-center">Leads Found</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Run Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {data.recentCampaigns.map((campaign: any) => (
                  <tr 
                    key={campaign.id}
                    onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                    className="hover:bg-[#F8FAFC] transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <span className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors">
                        {campaign.name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-100 text-slate-600">
                          {campaign.target_industry}
                        </span>
                        <span className="text-[#64748B] text-xs font-bold">{campaign.location}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black text-[#0F172A] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        {campaign.leads_found}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-8 py-6 text-right text-[10px] font-black text-[#64748B] uppercase tracking-widest">
                      {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
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
