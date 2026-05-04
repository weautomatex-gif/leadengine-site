'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Trash2, Eye, Folder, Target, ArrowUpDown, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableRowSkeleton } from '@/components/ui/SkeletonLoader'

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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
      setDeleteId(null)
    }
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
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-1">Your Campaigns</h2>
          <p className="text-[#64748B] text-sm font-bold uppercase tracking-widest opacity-60">Manage your scout runs and view their progress.</p>
        </div>
        <Link
          href="/dashboard/scout"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-black rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <Target className="w-4 h-4" />
          New Scout Run
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-8 h-8" />}
          title="No campaigns yet"
          description="You haven't run any campaigns. Start a new scout run to find leads in your target industry."
          action={
            <Link href="/dashboard/scout" className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-black rounded-2xl transition-all shadow-lg mt-4">
              Start your first scout run →
            </Link>
          }
        />
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

          <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Campaign Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Target</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Progress</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-right">Created</th>
                    <th className="px-4 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {sortedCampaigns.map((campaign) => {
                    const maxLeads = campaign.lead_count || 25
                    const found = campaign.leads_found || 0
                    const percent = Math.min(100, Math.round((found / maxLeads) * 100))
                    
                    return (
                      <tr key={campaign.id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="px-8 py-6">
                          <Link href={`/dashboard/campaigns/${campaign.id}`} className="block">
                            <span className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors">
                              {campaign.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-100 text-slate-600">
                              {campaign.target_industry}
                            </span>
                            <span className="text-[#64748B] text-xs font-bold">{campaign.location}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="w-full max-w-[150px]">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                              <span className="text-[#0F172A]">{found} <span className="text-[#94A3B8]">/ {maxLeads}</span></span>
                              <span className="text-[#64748B]">{percent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${percent === 100 ? 'bg-emerald-500' : 'bg-[#3B82F6]'}`} 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="px-8 py-6 text-xs font-bold text-[#64748B] text-right uppercase tracking-widest">
                          {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-6 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)
                            }}
                            className="p-2 text-slate-400 hover:text-[#0F172A] rounded-xl hover:bg-slate-100 transition-all focus:outline-none"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {openMenuId === campaign.id && (
                            <div 
                              className="absolute right-0 top-12 z-50 w-48 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] py-2 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button 
                                onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors text-left"
                              >
                                <Eye className="w-4 h-4 text-[#64748B]" />
                                View Details
                              </button>
                              <div className="h-px bg-[#E2E8F0] mx-2" />
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  setDeleteId(campaign.id)
                                }}
                                className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                              >
                                <Trash2 className="w-4 h-4" />
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
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0]"
          >
            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight mb-3">Delete Campaign</h3>
            <p className="text-[#64748B] text-sm font-bold leading-relaxed mb-8">
              Are you sure you want to delete this campaign? All leads in this campaign will also be deleted. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                className="px-6 py-3 text-sm font-black text-[#64748B] bg-slate-50 border border-[#E2E8F0] rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteId)} 
                className="px-6 py-3 text-sm font-black text-white bg-red-500 rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
