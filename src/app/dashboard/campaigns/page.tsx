'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Trash2, Eye, Folder, Target, ArrowUpDown } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { TableRowSkeleton } from '@/components/ui/SkeletonLoader'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

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
    const handleClickOutside = () => setActiveDropdown(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleDelete = async () => {
    if (!campaignToDelete) return
    const toastId = toast.loading('Deleting campaign...')
    
    try {
      const res = await fetch(`/api/campaigns/${campaignToDelete}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete campaign')
      
      setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete))
      toast.success('Campaign deleted successfully', { id: toastId })
    } catch (error) {
      toast.error('Error deleting campaign', { id: toastId })
    } finally {
      setCampaignToDelete(null)
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
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1">Your Campaigns</h2>
          <p className="text-[#64748B] text-sm">Manage your scout runs and view their progress.</p>
        </div>
        <Link
          href="/dashboard/scout"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <Target className="w-4 h-4" />
          New Scout Run
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-8 h-8" />}
          title="No campaigns yet"
          description="You haven't run any campaigns. Start a new scout run to find leads in your target industry."
          action={
            <Link href="/dashboard/scout" className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl transition-all shadow-sm mt-2">
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
                className="pl-9 pr-8 py-2 text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:outline-none appearance-none cursor-pointer hover:border-[#CBD5E1] transition-colors shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_leads">Most Leads</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Target</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Created</th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {sortedCampaigns.map((campaign) => {
                    const maxLeads = campaign.lead_count || 25
                    const found = campaign.leads_found || 0
                    const percent = Math.min(100, Math.round((found / maxLeads) * 100))
                    
                    return (
                      <tr key={campaign.id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="px-6 py-5">
                          <Link href={`/dashboard/campaigns/${campaign.id}`} className="block">
                            <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#3B82F6] transition-colors">
                              {campaign.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-slate-100 text-slate-600">
                              {campaign.target_industry}
                            </span>
                            <span className="text-[#64748B] text-sm">{campaign.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="w-full max-w-[150px]">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-semibold text-[#0F172A]">{found} <span className="text-[#94A3B8] font-normal">/ {maxLeads}</span></span>
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
                        <td className="px-6 py-5">
                          <StatusBadge status={campaign.status} />
                        </td>
                        <td className="px-6 py-5 text-sm text-[#64748B] text-right">
                          {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                        </td>
                        <td className="px-4 py-5 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveDropdown(activeDropdown === campaign.id ? null : campaign.id)
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {activeDropdown === campaign.id && (
                            <div 
                              className="absolute right-8 top-10 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-10 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link 
                                href={`/dashboard/campaigns/${campaign.id}`}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                              >
                                <Eye className="w-4 h-4 text-[#64748B]" />
                                View Details
                              </Link>
                              <div className="h-px bg-[#E2E8F0]" />
                              <button
                                onClick={() => {
                                  setActiveDropdown(null)
                                  setCampaignToDelete(campaign.id)
                                  setDeleteModalOpen(true)
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This will permanently delete the campaign and all of its leads. This action cannot be undone."
        confirmText="Delete Campaign"
        isDestructive={true}
      />
    </div>
  )
}
