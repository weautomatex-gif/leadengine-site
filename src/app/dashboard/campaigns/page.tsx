'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Trash2, Eye, Folder, Target, ArrowUpDown, ChevronRight, CheckCircle, Search, Zap } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableRowSkeleton } from '@/components/ui/SkeletonLoader'
import { ButtonShimmer } from '@/components/ui/ButtonShimmer'
import { InteractiveEmptyState } from '@/components/ui/InteractiveEmptyState'

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const fetchCampaigns = () => {
    setLoading(true)
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        setCampaigns(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
        toast.error('Failed to load campaigns')
      })
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Close dropdown when clicking outside — ONLY active when a menu is open
  useEffect(() => {
    if (!openMenuId) return
    const handleClickOutside = () => setOpenMenuId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openMenuId])

  const handleDelete = async (id: string) => {
    const toastId = toast.loading('Deleting campaign...')

    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete campaign')

      setCampaigns(prev => prev.filter(c => c.id !== id))
      toast.success('Campaign deleted', { id: toastId })
    } catch (error) {
      toast.error('Error deleting campaign', { id: toastId })
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleMarkCompleted = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      if (!res.ok) throw new Error('Failed to update campaign')

      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c))
      toast.success('Campaign marked as completed')
    } catch (error) {
      toast.error('Error updating campaign')
    }
    setOpenMenuId(null)
  }

  const sortedCampaigns = useMemo(() => {
    const sorted = [...campaigns]
    if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    if (sortBy === 'most_leads') sorted.sort((a, b) => (b.leads_found || 0) - (a.leads_found || 0))
    return sorted
  }, [campaigns, sortBy])

  return (
    <div className="pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1">Your Campaigns</h2>
          <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-widest">Manage your scout runs and view their progress.</p>
        </div>
        <ButtonShimmer
          href="/dashboard/scout"
          className="shadow-lg"
        >
          <Target className="w-4 h-4" />
          New Scout Run
        </ButtonShimmer>
      </div>

      {loading ? (
        <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <div className="p-6 bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm">
          <InteractiveEmptyState
            title="No campaigns yet"
            description="Create your first campaign to start discovering leads in your target industry and location."
            icons={[
              <Folder key="f" className="w-5 h-5" />,
              <Search key="s" className="w-6 h-6" />,
              <Zap key="z" className="w-5 h-5" />,
            ]}
            actionLabel="New Scout Run →"
            actionHref="/dashboard/scout"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="relative inline-flex items-center">
              <ArrowUpDown className="w-4 h-4 absolute left-3 text-[#94A3B8]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-xs font-black uppercase tracking-widest text-[#0F172A] bg-white border border-[#E2E8F0] rounded-2xl focus:ring-4 focus:ring-blue-50 focus:outline-none appearance-none cursor-pointer hover:border-[#CBD5E1] transition-all shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_leads">Most Leads</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm">
            <div className="overflow-visible">
              <table className="w-full text-left whitespace-nowrap table-fixed">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-4 py-3 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider w-[35%]">Campaign Name</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider w-[20%]">Target</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider w-[15%]">Progress</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider w-[12%]">Status</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider text-right w-[13%]">Created</th>
                    <th className="px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] overflow-visible">
                  {sortedCampaigns.map((campaign) => {
                    const maxLeads = campaign.lead_count || 25
                    const found = campaign.leads_found || 0
                    const percent = Math.min(100, Math.round((found / maxLeads) * 100))

                    const isStale = campaign.status === 'running' && found === 0 && (new Date().getTime() - new Date(campaign.created_at).getTime()) > 10 * 60 * 1000
                    const displayStatus = isStale ? 'failed' : campaign.status

                    return (
                      <tr key={campaign.id} className="hover:bg-[#F8FAFC] transition-colors group overflow-visible">
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/campaigns/${campaign.id}`} className="block">
                            <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors max-w-[280px] truncate block">
                              {campaign.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 max-w-[150px] truncate">
                            <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-600 truncate">
                              {campaign.target_industry}
                            </span>
                            <span className="text-[#64748B] text-sm truncate">{campaign.location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-[#0F172A]">
                            {found} {found === 1 ? 'lead' : 'leads'} found
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={displayStatus} />
                        </td>
                        <td className="px-4 py-3 text-sm text-[#64748B] text-right">
                          {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-3 text-right relative overflow-visible">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)
                            }}
                            className="p-2 text-slate-400 hover:text-[#0F172A] rounded-xl hover:bg-slate-100 transition-all focus:outline-none"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {openMenuId === campaign.id && (
                            <div
                              className="absolute right-4 top-12 z-[200] w-48 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/dashboard/campaigns/${campaign.id}`)
                                  setOpenMenuId(null)
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors"
                              >
                                <Eye className="h-4 w-4 text-[#64748B]" />
                                View Details
                              </button>
                              {campaign.status === 'running' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkCompleted(campaign.id)
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Mark Completed
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteTarget({ id: campaign.id, name: campaign.name })
                                  setOpenMenuId(null)
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Campaign
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">Delete Campaign</h3>
            </div>
            <p className="text-sm text-[#64748B] mb-6">
              Are you sure you want to delete <span className="font-semibold text-[#0F172A]">&ldquo;{deleteTarget.name}&rdquo;</span>?
              All leads in this campaign will also be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
