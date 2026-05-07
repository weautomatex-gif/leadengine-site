'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Target, Search, Rocket } from 'lucide-react'

const steps = [
  {
    number: 'Step 01',
    icon: Target,
    title: 'Pick your target',
    description:
      'Choose any industry and location. Gyms in Leeds? Restaurants in Bristol? Hair salons in London? You decide who you want to reach.',
  },
  {
    number: 'Step 02',
    icon: Search,
    title: 'AI finds and qualifies leads',
    description:
      'We scan Google Maps, verify contact details, gather business intelligence, and draft personalised outreach emails. Takes about 3 minutes.',
  },
  {
    number: 'Step 03',
    icon: Rocket,
    title: 'Start closing deals',
    description:
      'Review your leads, tweak the emails if you want, and start reaching out. Your pipeline fills itself while you focus on closing.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 md:py-32 bg-gradient-to-b from-[#F8FAFC] to-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight tracking-tight">
            Get your first leads in 3 minutes
          </h2>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Desktop Gradient Connector */}
          <div className="hidden lg:block absolute top-[45%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-lg hover:border-[#3B82F6]/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Step Number Pill */}
                <div className="mb-6">
                  <span className="text-[10px] font-bold text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                    {step.number}
                  </span>
                </div>

                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-blue-500/20 mb-8 group-hover:scale-110 transition-transform duration-500">
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-[#0F172A] mb-4">{step.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/dashboard/scout"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            Start Finding Leads →
          </Link>
        </div>
      </div>
    </section>
  )
}
