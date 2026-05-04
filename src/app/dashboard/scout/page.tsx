'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  Target, 
  Search, 
  Loader2, 
  Sparkles, 
  Mail, 
  Globe, 
  Users, 
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  ArrowRight
} from 'lucide-react'

const INDUSTRIES = [
  'Electrician', 'Plumber', 'Builder', 'Hair Salon', 'Barber', 'Beauty Salon',
  'Restaurant', 'Cafe', 'Takeaway', 'Gym', 'Personal Trainer', 'Dentist',
  'Accountant', 'Estate Agent', 'Photographer', 'Florist', 'Mechanic',
  'Veterinarian', 'Solicitor', 'Architect'
]

const PROGRESS_PHASES = [
  { id: 'searching', label: '🔍 Finding businesses...', icon: Search, color: 'text-blue-500' },
  { id: 'details', label: '📧 Discovering contact details...', icon: Globe, color: 'text-emerald-500' },
  { id: 'drafting', label: '✍️ Drafting personalized emails...', icon: Mail, color: 'text-purple-500' },
  { id: 'finishing', label: '✅ Complete! Redirecting to your campaign...', icon: ShieldCheck, color: 'text-indigo-500' },
]

export default function ScoutRunPage() {
  const router = useRouter()
  
  const [industry, setIndustry] = useState('')
  const [customIndustry, setCustomIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [leadCount, setLeadCount] = useState<number>(25)
  const [status, setStatus] = useState<'idle' | 'running'>('idle')
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [leadsFound, setLeadsFound] = useState(0)
  const [currentPhase, setCurrentPhase] = useState(0)
  
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null)
  const [fetchingCredits, setFetchingCredits] = useState(true)
  const [existingCampaigns, setExistingCampaigns] = useState<any[]>([])

  useEffect(() => {
    // Fetch both stats and existing campaigns
    Promise.all([
      fetch('/api/dashboard/stats').then(res => res.json()),
      fetch('/api/campaigns').then(res => res.json())
    ]).then(([statsData, campaignsData]) => {
      if (statsData.stats) setCreditsLeft(statsData.stats.creditsLeft)
      if (campaignsData) setExistingCampaigns(campaignsData)
      setFetchingCredits(false)
    }).catch(() => setFetchingCredits(false))
  }, [])

  // Auto-generate campaign name
  useEffect(() => {
    const currentIndustry = industry === 'Custom' ? customIndustry : industry
    if (currentIndustry && location) {
      const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      setCampaignName(`${currentIndustry}s in ${location} — ${month}`)
    }
  }, [industry, customIndustry, location])

  // Phase transition logic
  useEffect(() => {
    if (status !== 'running') return
    
    // Simulate phases based on leads found or time
    if (leadsFound > 0 && currentPhase === 0) setCurrentPhase(1)
    if (leadsFound > 5 && currentPhase === 1) setCurrentPhase(2)
  }, [leadsFound, status, currentPhase])

  // Polling logic when running
  useEffect(() => {
    if (status !== 'running' || !activeCampaignId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/campaigns/${activeCampaignId}`)
        if (res.ok) {
          const data = await res.json()
          setLeadsFound(data.campaign.leads_found || 0)
          
          if (data.campaign.status === 'completed') {
            setCurrentPhase(3)
            setTimeout(() => {
              clearInterval(interval)
              toast.success('✓ Campaign ready! View your new leads below.')
              router.push(`/dashboard/campaigns/${activeCampaignId}`)
            }, 1500)
          } else if (data.campaign.status === 'failed') {
            clearInterval(interval)
            toast.error('Scout run failed. Please try again.')
            setStatus('idle')
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [status, activeCampaignId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const currentIndustry = (industry === 'Custom' ? customIndustry : industry).trim()
    const currentLocation = location.trim()

    // 1. Check Credits
    if (creditsLeft !== null && leadCount > creditsLeft) {
      toast.error(`Not enough credits. You have ${creditsLeft} remaining.`)
      return
    }

    // 2. Check for Duplicate Running Campaigns
    const duplicate = existingCampaigns.find(c => 
      c.status === 'running' && 
      c.target_industry?.toLowerCase() === currentIndustry.toLowerCase() && 
      c.location?.toLowerCase() === currentLocation.toLowerCase()
    )

    if (duplicate) {
      toast.warning(`You already have a campaign running for ${currentIndustry} in ${currentLocation}.`)
      if (confirm(`You already have a running campaign for ${currentIndustry} in ${currentLocation}. Would you like to view it instead?`)) {
        router.push(`/dashboard/campaigns/${duplicate.id}`)
        return
      }
    }

    setStatus('running')
    setCurrentPhase(0)
    setLeadsFound(0)
    toast.success('🚀 Scout run started! Preparing AI models...')

    try {
      const response = await fetch('/api/scout/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName || 'New Campaign',
          target_industry: currentIndustry,
          location: currentLocation,
          lead_count: leadCount,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to start scout run')
      }

      const data = await response.json()
      setActiveCampaignId(data.campaignId)
    } catch (error: any) {
      console.error(error)
      setStatus('idle')
      toast.error(error.message || 'Error starting scout. Please try again.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-10 text-center space-y-2">
        <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter">New Lead Scout</h2>
        <p className="text-[#64748B] font-bold text-sm uppercase tracking-widest">Our AI will find, audit, and draft personalized outreach for you.</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[32px] border border-[#E2E8F0] p-10 shadow-xl space-y-8"
            onSubmit={handleSubmit}
          >
            {/* Target Industry */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-widest">
                 <Target className="w-4 h-4 text-[#3B82F6]" /> Target Industry
              </label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a niche industry...</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
                <option value="Custom">Custom (Type your own)</option>
              </select>
              
              {industry === 'Custom' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                   <input
                     type="text"
                     required
                     placeholder="e.g. Roofers, SaaS Founders, Dentists..."
                     value={customIndustry}
                     onChange={(e) => setCustomIndustry(e.target.value)}
                     className="w-full px-5 py-4 bg-white border-2 border-[#3B82F6] rounded-2xl text-sm font-bold text-[#0F172A] focus:outline-none shadow-sm"
                   />
                </motion.div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-widest">
                 📍 Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. London, UK or Leeds"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>

            {/* Number of Leads */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-[#0F172A] uppercase tracking-widest">
                 <Users className="w-4 h-4 text-[#3B82F6]" /> Max Results to Find
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[10, 25, 50, 100].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLeadCount(num)}
                    className={`py-3 text-xs font-black rounded-2xl border-2 transition-all active:scale-95 ${
                      leadCount === num
                        ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#3B82F6]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {!fetchingCredits && creditsLeft !== null && (
                <div className={`p-3 rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${leadCount > creditsLeft ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-[#64748B] border border-slate-100'}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  {leadCount > creditsLeft 
                    ? `Not enough credits. You need ${leadCount} but only have ${creditsLeft}.` 
                    : `This run will use ${leadCount} of your ${creditsLeft} remaining credits.`}
                </div>
              )}
            </div>

            {/* Campaign Name */}
            <div className="space-y-3">
              <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest ml-1">Campaign Name (Auto-generated)</label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-sm font-bold text-[#0F172A] focus:outline-none italic"
              />
            </div>

            <button
              type="submit"
              disabled={!fetchingCredits && creditsLeft !== null && leadCount > creditsLeft}
              className="w-full py-5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
            >
              Start Scouting <Sparkles className="w-5 h-5" />
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] border border-[#E2E8F0] p-12 shadow-2xl flex flex-col items-center justify-center text-center space-y-8"
          >
            {/* Animated Radar */}
            <div className="relative">
              <div className="w-32 h-32 bg-[#EFF6FF] rounded-full flex items-center justify-center relative z-10 border-8 border-white shadow-xl">
                 <Search className="w-12 h-12 text-[#3B82F6] animate-pulse" />
              </div>
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-[#3B82F6] rounded-full z-0"
              />
              <motion.div
                animate={{ scale: [1, 3], opacity: [0.3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
                className="absolute inset-0 bg-[#3B82F6] rounded-full z-0"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">AI Scout in Progress</h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Scanning the deep web for leads...</p>
            </div>

            {/* Phases List */}
            <div className="w-full max-w-sm space-y-4 text-left">
               {PROGRESS_PHASES.map((phase, idx) => {
                  const isActive = currentPhase === idx;
                  const isCompleted = currentPhase > idx;
                  const Icon = phase.icon;
                  
                  return (
                    <div 
                      key={phase.id} 
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                        isActive ? 'bg-blue-50 border-blue-100 shadow-sm' : isCompleted ? 'bg-white border-transparent opacity-60' : 'bg-white border-transparent opacity-20'
                      }`}
                    >
                       <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {isCompleted ? <ShieldCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                       </div>
                       <span className={`text-sm font-bold ${isActive ? 'text-[#0F172A]' : 'text-slate-500'}`}>
                          {phase.label}
                       </span>
                       {isActive && <Loader2 className="w-4 h-4 ml-auto animate-spin text-blue-600" />}
                    </div>
                  )
               })}
            </div>

            {/* Counter Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-[#0F172A] rounded-3xl p-8 w-full shadow-2xl relative overflow-hidden group"
            >
              <div className="relative z-10 flex flex-col items-center">
                 <span className="text-6xl font-black text-white tracking-tighter mb-1">{leadsFound}</span>
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Leads found so far</span>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                 <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
