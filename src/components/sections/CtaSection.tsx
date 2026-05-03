'use client'

import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function CtaSection() {
  return (
    <section className="py-20 md:py-28" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <AnimatedSection delay={0}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[#BFDBFE] text-[#1E40AF] text-xs font-semibold mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
            No credit card required
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.06}>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] leading-tight mb-5">
            Ready to find your next customer?
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.12}>
          <p className="text-lg text-[#64748B] mb-9">
            Start with 50 free leads. No credit card required.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.18}>
          <motion.a
            href="#hero-cta"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-[#F8FAFC] text-[#0F172A] text-base font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-all duration-200"
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.a>
        </AnimatedSection>

        <AnimatedSection delay={0.24}>
          <p className="mt-5 text-sm text-[#94A3B8]">
            Join 500+ agencies already generating leads with LeadEngine
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
