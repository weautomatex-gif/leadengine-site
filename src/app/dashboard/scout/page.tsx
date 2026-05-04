'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Target, Search, Loader2 } from 'lucide-react'

const INDUSTRIES = [
  'Electrician', 'Plumber', 'Builder', 'Hair Salon', 'Barber', 'Beauty Salon',
  'Restaurant', 'Cafe', 'Takeaway', 'Gym', 'Personal Trainer', 'Dentist',
  'Accountant', 'Estate Agent', 'Photographer', 'Florist', 'Mechanic',
  'Veterinarian', 'Solicitor', 'Architect'
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
  
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null)
  const [fetchingCredits, setFetchingCredits] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setCreditsLeft(data.stats.creditsLeft)
        }
        setFetchingCredits(false)
      })
      .catch(() => setFetchingCredits(false))
  }, [])

  // Auto-generate campaign name
  useEffect(() => {
    const currentIndustry = industry === 'Custom' ? customIndustry : industry
    if (currentIndustry && location) {
      const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      setCampaignName(`${currentIndustry}s in ${location} — ${month}`)
    }
  }, [industry, customIndustry, location])

  // Polling logic when running
  useEffect(() => {
    if (status !== 'running' || !activeCampaignId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/campaigns/${activeCampaignId}`)
        if (res.ok) {
          const data = await res.json()
          setLeadsFound(data.campaign.leads_found || 0)
          
          if (data.campaign.status === 'completed' || data.campaign.status === 'failed') {
            clearInterval(interval)
            toast.success('Scout run completed!')
            router.push(`/dashboard/campaigns/${activeCampaignId}`)
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status, activeCampaignId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (creditsLeft !== null && leadCount > creditsLeft) {
      toast.error(`Not enough credits. You have ${creditsLeft} credits remaining.`)
      return
    }

    setStatus('running')
    const currentIndustry = industry === 'Custom' ? customIndustry : industry

    try {
      const response = await fetch('/api/scout/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName || 'New Campaign',
          target_industry: currentIndustry,
          location,
          lead_count: leadCount,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to start scout run')
      }

      const data = await response.json()
      setActiveCampaignId(data.campaignId)
      toast.info('Scout run started! AI is now searching...')
    } catch (error: any) {
      console.error(error)
      setStatus('idle')
      toast.error(error.message || 'There was an error starting the scout run. Please try again.')
    }
  }

  return (
    <div className="max-w-xl mx-auto pb-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight mb-2">New Scout Run</h2>
        <p className="text-[#64748B]">Tell our AI who you&apos;re looking for, and we&apos;ll find them.</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm"
            onSubmit={handleSubmit}
          >
            {/* Target Industry */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Target Industry</label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent bg-white transition-shadow"
              >
                <option value="" disabled>Select an industry...</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
                <option value="Custom">Custom (Type your own)</option>
              </select>
              
              {industry === 'Custom' && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  type="text"
                  required
                  placeholder="e.g. Roofers, SaaS Founders..."
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="w-full mt-3 px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-shadow"
                />
              )}
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Leeds, UK"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-shadow"
              />
            </div>

            {/* Number of Leads */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Number of Leads</label>
              <div className="grid grid-cols-4 gap-3 mb-2">
                {[10, 25, 50, 100].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLeadCount(num)}
                    className={`py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                      leadCount === num
                        ? 'bg-[#DBEAFE] border-[#3B82F6] text-[#1E40AF] shadow-sm'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {!fetchingCredits && creditsLeft !== null && (
                <p className={`text-xs ${leadCount > creditsLeft ? 'text-red-500 font-semibold' : 'text-[#64748B]'}`}>
                  This will use <span className="font-bold">{leadCount}</span> of your <span className="font-bold">{creditsLeft}</span> remaining credits.
                </p>
              )}
            </div>

            {/* Campaign Name */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Campaign Name</label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Auto-generated"
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] bg-[#F8FAFC] transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={!fetchingCredits && creditsLeft !== null && leadCount > creditsLeft}
              className="w-full py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Start Scouting <Target className="w-4 h-4" />
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-12 shadow-sm flex flex-col items-center justify-center text-center"
          >
            <div className="relative mb-8 mt-4">
              <div className="w-24 h-24 bg-[#DBEAFE] rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-sm">
                <Search className="w-10 h-10 text-[#3B82F6] animate-pulse" />
              </div>
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-[#3B82F6] rounded-full z-0"
              />
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1, ease: "easeOut" }}
                className="absolute inset-0 bg-[#3B82F6] rounded-full z-0"
              />
            </div>
            <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Scouting in progress...</h3>
            <p className="text-[#64748B] mb-8">
              Scanning for <span className="font-semibold text-[#0F172A]">{industry === 'Custom' ? customIndustry : industry}s</span> in <span className="font-semibold text-[#0F172A]">{location}</span>...<br/>This usually takes 2-3 minutes.
            </p>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-8 py-5 flex flex-col items-center shadow-sm w-full max-w-xs">
              <span className="text-5xl font-extrabold text-[#3B82F6] mb-1 tracking-tight">{leadsFound}</span>
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Leads Found</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
