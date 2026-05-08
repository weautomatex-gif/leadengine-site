'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Loader2, CreditCard, Sparkles } from 'lucide-react'

const plans = [
  {
    key: 'starter',
    name: 'Starter',
    price: '£29',
    features: [
      '100 leads per month',
      '5 scout campaigns',
      'AI lead qualification',
      'Email & phone finding',
    ],
    popular: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '£59',
    features: [
      '300 leads per month',
      '50 scout campaigns',
      'AI lead qualification',
      'Email & phone finding',
      'AI email drafts',
      'CSV export',
      'Priority support',
    ],
    popular: true,
  },
  {
    key: 'agency',
    name: 'Agency',
    price: '£149',
    features: [
      '1,000 leads per month',
      'Unlimited scout campaigns',
      'Everything in Growth',
      'API access (coming soon)',
    ],
    popular: false,
  },
]

interface BillingInfo {
  plan: string;
  credits_limit: number;
  credits_used: number;
  plan_period_end: string | null;
  has_subscription: boolean;
}

export function BillingSection() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [managing, setManaging] = useState(false)

  const fetchBillingInfo = async () => {
    try {
      const res = await fetch('/api/billing/info')
      const data = await res.json()
      setBillingInfo(data)
    } catch (error) {
      console.error('Error fetching billing info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBillingInfo()

    if (searchParams.get('billing') === 'success') {
      toast.success('Subscription activated! Your plan has been upgraded.')
    } else if (searchParams.get('billing') === 'cancelled') {
      toast.info('Checkout cancelled.')
    }
  }, [searchParams])

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to create checkout session')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setUpgrading(null)
    }
  }

  const handleManageSubscription = async () => {
    setManaging(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to open billing portal')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setManaging(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  const isPaidPlan = billingInfo?.plan && billingInfo.plan !== 'free'

  return (
    <div className="space-y-6">
      {isPaidPlan ? (
        <section className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
            <h3 className="font-bold text-[#0F172A]">Current Subscription</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3" />
              {billingInfo.plan} Plan
            </span>
          </div>
          <div className="p-6">
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm font-extrabold text-[#0F172A]">Monthly Lead Credits</p>
                  <p className="text-xs font-medium text-[#64748B]">
                    {billingInfo.plan_period_end 
                      ? `Renews on ${new Date(billingInfo.plan_period_end).toLocaleDateString()}` 
                      : 'Renews next month'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{billingInfo.credits_used}</span>
                  <span className="text-[#94A3B8] font-semibold text-lg"> / {billingInfo.credits_limit}</span>
                </div>
              </div>
              <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (billingInfo.credits_used / billingInfo.credits_limit) > 0.9 ? 'bg-red-500' : 'bg-[#3B82F6]'
                  }`} 
                  style={{ width: `${Math.min(100, (billingInfo.credits_used / billingInfo.credits_limit) * 100)}%` }} 
                />
              </div>
            </div>

            <button
              onClick={handleManageSubscription}
              disabled={managing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {managing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Manage Subscription
            </button>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.key}
              className={`relative flex flex-col bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                plan.popular ? 'border-[#3B82F6] ring-4 ring-blue-50' : 'border-[#E2E8F0]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-0.5 rounded-full bg-[#3B82F6] text-white text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h4 className="font-bold text-[#0F172A] mb-1">{plan.name}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#0F172A]">{plan.price}</span>
                  <span className="text-xs font-bold text-[#94A3B8]">/mo</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-semibold text-[#64748B]">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-[-1px]" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={!!upgrading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white' 
                    : 'bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]'
                } disabled:opacity-50`}
              >
                {upgrading === plan.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Upgrade to {plan.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
