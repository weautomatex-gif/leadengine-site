'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

const leads = [
  { business: 'The Amber Kitchen', industry: 'Restaurant', city: 'Manchester', email: 'hello@amberkitchen.co.uk', status: 'New' },
  { business: 'Ironworks Gym', industry: 'Fitness', city: 'Leeds', email: 'info@ironworksgym.co.uk', status: 'Contacted' },
  { business: 'Bella Hair Studio', industry: 'Hair Salon', city: 'Birmingham', email: 'bella@bellahair.co.uk', status: 'Replied' },
  { business: 'Thornton Roofing Ltd', industry: 'Roofing', city: 'Bristol', email: 'contact@thorntonroofing.co.uk', status: 'New' },
  { business: 'Prime Estates UK', industry: 'Estate Agency', city: 'London', email: 'sales@primeestates.co.uk', status: 'Won' },
]

const statusStyles: Record<string, string> = {
  New: 'bg-[#DBEAFE] text-[#1E40AF]',
  Contacted: 'bg-amber-100 text-amber-700',
  Replied: 'bg-purple-100 text-purple-700',
  Won: 'bg-emerald-100 text-emerald-700',
}

function LeadDashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 1.5 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: 0.5, y: -4, transition: { duration: 0.3 } }}
      className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_20px_48px_-8px_rgba(0,0,0,0.12)] overflow-hidden w-full max-w-[580px]"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-[#94A3B8] font-medium">LeadEngine — Lead Dashboard</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#0F172A]">My Leads</span>
          <span className="px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold">312</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC]">
            Filter
          </button>
          <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#3B82F6] rounded-lg">
            + New Campaign
          </button>
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        {['Business', 'Industry', 'City', 'Email', 'Status'].map((h) => (
          <span key={h} className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide truncate">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {leads.map((lead, i) => (
        <div
          key={i}
          className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC] transition-colors"
        >
          <span className="text-xs font-semibold text-[#0F172A] truncate">{lead.business}</span>
          <span className="text-xs text-[#64748B] truncate">{lead.industry}</span>
          <span className="text-xs text-[#64748B] truncate">{lead.city}</span>
          <span className="text-[10px] text-[#64748B] truncate">{lead.email}</span>
          <span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyles[lead.status]}`}>
              {lead.status}
            </span>
          </span>
        </div>
      ))}

      {/* Footer stat bar */}
      <div className="px-4 py-2.5 bg-[#F8FAFC] flex items-center gap-4">
        <span className="text-xs text-[#94A3B8]">Showing 5 of 312 leads</span>
        <span className="ml-auto text-xs text-[#10B981] font-semibold">↑ 18 new today</span>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const [email, setEmail] = useState('')

  const bullets = [
    'AI-powered business discovery',
    'Verified emails and phone numbers',
    'Personalised outreach drafts',
    'Real-time lead dashboard',
  ]

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-white overflow-hidden">
      {/* Subtle background radial */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, #DBEAFE 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left — text */}
          <div>
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                Find Leads in Any Industry
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[#0F172A] leading-[1.12] tracking-tight mb-6">
                Find your next customer{' '}
                <span className="text-[#3B82F6]">before they find someone else.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <p className="text-lg text-[#64748B] leading-relaxed mb-7 max-w-xl">
                LeadEngine uses AI to find businesses in any niche and location, verifies their contact details, and drafts personalised outreach emails — all on autopilot.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <ul className="space-y-3 mb-9">
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-sm font-medium text-[#0F172A]">
                    <svg className="w-5 h-5 text-[#3B82F6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.2} id="hero-cta">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <a 
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm"
                >
                  Get Started Free →
                </a>
              </div>
              <p className="text-sm text-[#94A3B8]">
                No credit card required · 50 free leads to start
              </p>
            </AnimatedSection>
          </div>

          {/* Right — dashboard mockup */}
          <div className="flex justify-center lg:justify-end">
            <LeadDashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
