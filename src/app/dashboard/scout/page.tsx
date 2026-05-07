'use client'

import { useState, useEffect } from 'react'
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
  CheckCircle2,
  Circle
} from 'lucide-react'

const INDUSTRIES = [
  'Electrician', 'Plumber', 'Builder', 'Hair Salon', 'Barber', 'Beauty Salon',
  'Restaurant', 'Cafe', 'Takeaway', 'Gym', 'Personal Trainer', 'Dentist',
  'Accountant', 'Estate Agent', 'Photographer', 'Florist', 'Mechanic',
  'Veterinarian', 'Solicitor', 'Architect'
]

const PROGRESS_PHASES = [
  { id: 'searching', label: 'Finding businesses...', icon: Search },
  { id: 'details', label: 'Discovering contact details...', icon: Globe },
  { id: 'drafting', label: 'Drafting personalized emails...', icon: Mail },
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
  const [showFallbackButton, setShowFallbackButton] = useState(false)
  
  const [billingInfo, setBillingInfo] = useState<any>(null)
  const [fetchingBilling, setFetchingBilling] = useState(true)
  const [existingCampaigns, setExistingCampaigns] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/billing/info').then(res => res.json()),
      fetch('/api/campaigns').then(res => res.json())
    ]).then(([billingData, campaignsData]) => {
      if (billingData) setBillingInfo(billingData)
      if (campaignsData) setExistingCampaigns(campaignsData)
      setFetchingBilling(false)
    }).catch(() => setFetchingBilling(false))
  }, [])

  useEffect(() => {
    const currentIndustry = industry === 'Custom' ? customIndustry : industry
    if (currentIndustry && location) {
      const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      setCampaignName(`${currentIndustry}s in ${location} — ${month}`)
    }
  }, [industry, customIndustry, location])

  useEffect(() => {
    if (status !== 'running' || !activeCampaignId) {
      setShowFallbackButton(false)
      return
    }

    setCurrentPhase(1) // "Finding businesses..." complete immediately
    const startTime = Date.now()

    const interval = setInterval(async () => {
      try {
        const timeElapsed = Date.now() - startTime
        if (timeElapsed > 30000) {
          setShowFallbackButton(true)
        }

        const res = await fetch(`/api/campaigns/${activeCampaignId}`)
        if (!res.ok) throw new Error('Failed to fetch campaign status')
        const data = await res.json()
        
        const currentLeads = data.leads || []
        setLeadsFound(currentLeads.length)
        
        const campaign = data.campaign
          
        // "Drafting personalized emails..." active once leads exist and some have draft_body populated
        const hasDrafts = currentLeads.some((l: any) => l.draft_body)
        if (hasDrafts) {
          setCurrentPhase(prev => Math.max(prev, 2))
        }

        const maxLeads = campaign?.lead_count || leadCount
        const isTimeout = timeElapsed > 3 * 60 * 1000 // 3 minutes timeout
        const isComplete = campaign?.status === 'completed' || currentLeads.length >= maxLeads || isTimeout

        if (isComplete) {
          clearInterval(interval)
          setCurrentPhase(3) // All phases complete
          setTimeout(() => {
            toast.success('✓ Campaign ready!')
            router.push(`/dashboard/campaigns/${activeCampaignId}`)
          }, 2000)
        } else if (campaign?.status === 'failed') {
          clearInterval(interval)
          toast.error('Scout run failed.')
          setStatus('idle')
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status, activeCampaignId, router, leadCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const currentLocation = location.trim()
    const currentIndustry = (industry === 'Custom' ? customIndustry : industry).trim()

    // 1. Check for total credit limits
    if (billingInfo) {
      if (billingInfo.credits_used >= billingInfo.credits_limit) {
        if (confirm("You've used all your leads this month. Upgrade your plan for more?")) {
          router.push('/dashboard/settings')
        }
        return
      }

      // 2. Check for lead count vs remaining credits
      const remainingCredits = billingInfo.credits_limit - billingInfo.credits_used
      if (leadCount > remainingCredits) {
        toast.error(`Not enough leads remaining. You have ${remainingCredits} remaining.`)
        return
      }

      // 3. Check for free plan scout limits (3 max)
      if (billingInfo.plan === 'free' && existingCampaigns.length >= 3) {
        if (confirm("Free plan is limited to 3 scout campaigns. Upgrade to continue?")) {
          router.push('/dashboard/settings')
        }
        return
      }
    }

    const duplicate = existingCampaigns.find((c: any) => 
      c.status === 'running' && 
      c.target_industry?.toLowerCase() === currentIndustry.toLowerCase() && 
      c.location?.toLowerCase() === currentLocation.toLowerCase() &&
      new Date(c.created_at).getTime() > Date.now() - 10 * 60 * 1000
    )

    if (duplicate) {
      toast.warning(`Running campaign found for this criteria.`)
      if (confirm(`You already have a running campaign for ${currentIndustry} in ${currentLocation}. View it instead?`)) {
        router.push(`/dashboard/campaigns/${duplicate.id}`)
        return
      }
    }

    setStatus('running')
    setCurrentPhase(0)
    setLeadsFound(0)

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
      toast.error(error.message || 'Error starting scout.')
    }
  }

  return (
    <div className="max-w-xl mx-auto pb-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">New Lead Scout</h2>
        <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-[0.2em] mt-1 opacity-60">AI-Powered Lead Discovery</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest ml-1">Target Industry</label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="" disabled>Select industry...</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                <option value="Custom">Custom niche...</option>
              </select>
              
              {industry === 'Custom' && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                   <input
                     type="text"
                     required
                     placeholder="e.g. Roofers, SaaS Founders..."
                     value={customIndustry}
                     onChange={(e) => setCustomIndustry(e.target.value)}
                     className="w-full px-4 py-3 bg-white border-2 border-[#3B82F6] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none"
                   />
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest ml-1">Location</label>
              <input
                type="text"
                required
                placeholder="e.g. London, UK"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest ml-1">Max Results</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLeadCount(num)}
                    className={`py-2.5 text-[11px] font-black rounded-xl border-2 transition-all ${
                      leadCount === num
                        ? 'bg-[#0F172A] border-[#0F172A] text-white'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-slate-300'
                    }`}
                  >
                    Up to {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Campaign Name</label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none italic opacity-80"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!fetchingBilling && billingInfo && leadCount > (billingInfo.credits_limit - billingInfo.credits_used)}
                className="w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-base"
              >
                Start AI Scout <Sparkles className="w-4 h-4" />
              </button>
              {!fetchingBilling && billingInfo && (
                <p className="text-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-4">
                   {leadCount > (billingInfo.credits_limit - billingInfo.credits_used) 
                     ? `Insufficient leads (${billingInfo.credits_limit - billingInfo.credits_used} remaining)` 
                     : `Up to ${leadCount} leads · ${billingInfo.credits_limit - billingInfo.credits_used} leads remaining this month`}
                </p>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-[#E2E8F0] p-10 shadow-sm flex flex-col items-center space-y-8"
          >
            {/* Animated Radar - Scaled Down */}
            <div className="relative">
              <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-md">
                 <Search className="w-8 h-8 text-[#3B82F6] animate-pulse" />
              </div>
              <motion.div
                animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-[#3B82F6] rounded-full z-0"
              />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-[#0F172A] tracking-tight">AI Scout in Progress</h3>
              <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Scanning the deep web for leads...</p>
            </div>

            {/* Compact Stepper Layout */}
            <div className="w-full space-y-3 pt-2">
               {PROGRESS_PHASES.map((phase, idx) => {
                  const isActive = currentPhase === idx;
                  const isCompleted = currentPhase > idx;
                  
                  return (
                    <div 
                      key={phase.id} 
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                        isActive ? 'bg-blue-50/50 border-blue-100' : 'bg-transparent border-transparent'
                      }`}
                    >
                       <div className={`shrink-0 ${isActive ? 'text-[#3B82F6]' : isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <div className="w-5 h-5 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin" /></div> : <Circle className="w-5 h-5 fill-slate-100" />}
                       </div>
                       <span className={`text-xs font-bold tracking-tight ${isActive ? 'text-[#0F172A]' : isCompleted ? 'text-[#0F172A] opacity-80' : 'text-slate-400'}`}>
                          {phase.label}
                       </span>
                       {isActive && (
                         <div className="ml-auto text-[10px] font-black text-[#3B82F6] bg-white px-2 py-1 rounded-lg border border-blue-100 shadow-sm">
                            {leadsFound} FOUND
                         </div>
                       )}
                    </div>
                  )
               })}
            </div>

            {/* Fallback Button */}
            {showFallbackButton && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center pb-2">
                <button 
                  onClick={() => router.push(`/dashboard/campaigns/${activeCampaignId}`)}
                  className="text-xs font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100"
                >
                  Taking longer than expected? View your campaign &rarr;
                </button>
              </motion.div>
            )}

            {/* Subtle Credits Footer */}
            {!fetchingBilling && billingInfo && (
               <div className="pt-4 border-t border-slate-100 w-full text-center">
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                     Up to {leadCount} leads · {billingInfo.credits_limit - billingInfo.credits_used} leads remaining this month
                  </p>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
