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
import { GooeyLoader } from '@/components/ui/GooeyLoader'

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

interface BillingInfo {
  plan: string;
  credits_limit: number;
  credits_used: number;
  plan_period_end: string | null;
  has_subscription: boolean;
}

export default function ScoutRunPage() {
  const router = useRouter()
  
  const [businessType, setBusinessType] = useState<'website_agency' | 'general_b2b' | 'marketing_agency' | 'recruitment'>('website_agency')
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
  
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
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
    if (!businessType) {
      toast.error('Please select a business type.')
      return
    }
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
          business_type: businessType,
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
            {/* Business Type Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest ml-1">
                WHAT ARE YOU LOOKING FOR LEADS FOR?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Website Agency - Enabled */}
                <div
                  onClick={() => setBusinessType('website_agency')}
                  className="relative flex flex-col justify-between rounded-xl p-4 cursor-pointer transition-all border-2 border-[#3B82F6] bg-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">Website Agency</h4>
                      <p className="text-xs text-[#64748B] mt-1 font-medium leading-relaxed">
                        Find businesses that need a website or redesign
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-[#3B82F6] shrink-0" />
                  </div>
                </div>

                {/* General B2B - Disabled */}
                <div className="flex flex-col justify-between rounded-xl p-4 bg-[#F8FAFC] border border-[#E2E8F0] opacity-60 cursor-not-allowed">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#0F172A]">General B2B</h4>
                        <span className="text-[9px] font-bold bg-[#F1F5F9] text-[#94A3B8] px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 font-medium leading-relaxed">
                        Find any business in your target market
                      </p>
                    </div>
                  </div>
                </div>

                {/* Marketing Agency - Disabled */}
                <div className="flex flex-col justify-between rounded-xl p-4 bg-[#F8FAFC] border border-[#E2E8F0] opacity-60 cursor-not-allowed">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#0F172A]">Marketing Agency</h4>
                        <span className="text-[9px] font-bold bg-[#F1F5F9] text-[#94A3B8] px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 font-medium leading-relaxed">
                        Find businesses that need marketing help
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recruitment - Disabled */}
                <div className="flex flex-col justify-between rounded-xl p-4 bg-[#F8FAFC] border border-[#E2E8F0] opacity-60 cursor-not-allowed">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#0F172A]">Recruitment</h4>
                        <span className="text-[9px] font-bold bg-[#F1F5F9] text-[#94A3B8] px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 font-medium leading-relaxed">
                        Find businesses that are hiring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                disabled={!!(!fetchingBilling && billingInfo && leadCount > ((billingInfo?.credits_limit ?? 0) - (billingInfo?.credits_used ?? 0)))}
                className="w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 text-base"
              >
                Start AI Scout <Sparkles className="w-4 h-4" />
              </button>
              {!fetchingBilling && billingInfo ? (
                <p className="text-center text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-4">
                   {leadCount > ((billingInfo?.credits_limit ?? 0) - (billingInfo?.credits_used ?? 0)) 
                     ? `Insufficient leads (${(billingInfo?.credits_limit ?? 0) - (billingInfo?.credits_used ?? 0)} remaining)` 
                     : `Up to ${leadCount} leads · ${(billingInfo?.credits_limit ?? 0) - (billingInfo?.credits_used ?? 0)} leads remaining this month`}
                </p>
              ) : (
                <div className="flex justify-center mt-4">
                  <div className="h-2 w-48 bg-[#F1F5F9] rounded animate-pulse" />
                </div>
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
            <GooeyLoader className="mb-6" />

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
            {!fetchingBilling && billingInfo ? (
               <div className="pt-4 border-t border-slate-100 w-full text-center">
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                     Up to {leadCount} leads · {(billingInfo?.credits_limit ?? 0) - (billingInfo?.credits_used ?? 0)} leads remaining this month
                  </p>
               </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 w-full flex justify-center">
                 <div className="h-2 w-48 bg-slate-50 rounded animate-pulse" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
