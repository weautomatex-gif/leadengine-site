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
  Circle,
  Info
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

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
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

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [hasFailed, setHasFailed] = useState(false)
  
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

  // Elapsed timer — counts up while running and not failed
  useEffect(() => {
    if (status !== 'running' || hasFailed) return
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [status, hasFailed])

  // Timeout after 5 minutes
  useEffect(() => {
    if (elapsedSeconds >= 300 && !hasFailed && status === 'running') {
      setHasFailed(true)
    }
  }, [elapsedSeconds, hasFailed, status])

  // Polling
  useEffect(() => {
    if (status !== 'running' || !activeCampaignId || hasFailed) {
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

        // Check for failed status from API
        if (campaign?.status === 'failed') {
          clearInterval(interval)
          setHasFailed(true)
          return
        }
          
        // "Drafting personalized emails..." active once some have draft_body populated
        const hasDrafts = currentLeads.some((l: any) => l.draft_body)
        if (hasDrafts) {
          setCurrentPhase(prev => Math.max(prev, 2))
        }

        const maxLeads = campaign?.lead_count || leadCount
        const isComplete = campaign?.status === 'completed' || currentLeads.length >= maxLeads

        if (isComplete) {
          clearInterval(interval)
          setCurrentPhase(3) // All phases complete
          localStorage.removeItem('active_scout') // Layout polling no longer needed

          // Fire browser notification if tab is hidden
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Scout Complete! 🎯', {
              body: `Your campaign found ${currentLeads.length} leads. Click to view.`,
              icon: '/favicon.svg',
              tag: 'scout-complete',
            })
            notification.onclick = () => {
              window.focus()
              window.location.href = `/dashboard/campaigns/${activeCampaignId}`
              notification.close()
            }
          }

          setTimeout(() => {
            toast.success('✓ Campaign ready!')
            router.push(`/dashboard/campaigns/${activeCampaignId}`)
          }, 2000)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status, activeCampaignId, router, leadCount, hasFailed])

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

    // Request notification permission when scout starts
    await requestNotificationPermission()

    setStatus('running')
    setCurrentPhase(0)
    setLeadsFound(0)
    setElapsedSeconds(0)
    setHasFailed(false)

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

      // Persist active scout so the layout can poll from any dashboard page
      localStorage.setItem('active_scout', JSON.stringify({
        campaignId: data.campaignId,
        campaignName: campaignName || 'New Campaign',
        startedAt: Date.now(),
      }))
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

              {/* Website Agency info box */}
              {businessType === 'website_agency' && (
                <div className="mt-2 p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#1E40AF] mb-1">Filtered Results</p>
                    <p className="text-xs text-[#3B82F6] leading-relaxed">
                      This scout type only returns businesses with a poor or missing website — perfect for web agency outreach. If you request 50 leads but only 15 are returned, it means the remaining businesses already have a strong web presence and were filtered out. You are only charged for leads actually returned.
                    </p>
                  </div>
                </div>
              )}
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
            className="bg-white rounded-3xl border border-[#E2E8F0] p-10 shadow-sm flex flex-col items-center space-y-6"
          >
            {hasFailed ? (
              /* Error State */
              <div className="text-center py-4 w-full">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Scout Run Failed</h3>
                <p className="text-sm text-[#64748B] mb-6 max-w-sm mx-auto leading-relaxed">
                  The workflow didn't return results. This could be due to the niche/location combination or a temporary issue. Please try a different search or try again later.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setHasFailed(false)
                      setElapsedSeconds(0)
                      setStatus('idle')
                      localStorage.removeItem('active_scout')
                    }}
                    className="px-5 py-2.5 text-sm font-semibold border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] text-[#0F172A] transition-colors"
                  >
                    Try Again
                  </button>
                  <a
                    href="/dashboard/campaigns"
                    className="px-5 py-2.5 text-sm font-semibold bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl transition-colors"
                  >
                    View Campaigns
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Animated Radar */}
                <GooeyLoader className="mb-2" />

                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-[#0F172A] tracking-tight">AI Scout in Progress</h3>
                  <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Scanning the deep web for leads...</p>
                </div>

                {/* Progress messages */}
                <div className="text-center">
                  <p className="text-sm text-[#64748B] mb-1">Sit tight — this usually takes 2–3 minutes</p>
                  <p className="text-xs text-[#94A3B8]">
                    We're scanning Google Maps, verifying contacts, and drafting personalised emails for each lead.
                  </p>
                </div>

                {/* Compact Stepper Layout */}
                <div className="w-full space-y-3">
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

                {/* Elapsed timer */}
                <p className="text-xs text-[#94A3B8] text-center">
                  Running for {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
                </p>

                {/* Navigate away message */}
                <p className="text-xs text-[#94A3B8] text-center italic">
                  You can navigate away — we'll notify you when your scout is complete.
                </p>

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
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
