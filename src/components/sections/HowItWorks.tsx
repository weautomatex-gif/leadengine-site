'use client'

import AnimatedSection from '@/components/ui/AnimatedSection'

const steps = [
  {
    number: '01',
    icon: '🎯',
    title: 'Pick your target',
    description:
      'Choose any industry and location. Gyms in Leeds? Restaurants in Bristol? Hair salons in London? You decide who you want to reach.',
  },
  {
    number: '02',
    icon: '🤖',
    title: 'AI finds and qualifies leads',
    description:
      'We scan Google Maps, verify contact details, gather business intelligence, and draft personalised outreach emails. Takes about 3 minutes.',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Start closing deals',
    description:
      'Review your leads, tweak the emails if you want, and start reaching out. Your pipeline fills itself while you focus on closing.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight">
              Get your first leads in 3 minutes
            </h2>
          </div>
        </AnimatedSection>

        {/* Steps */}
        <div className="relative">
          {/* Desktop dotted connector */}
          <div className="hidden lg:block absolute top-10 left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] border-t-2 border-dashed border-[#E2E8F0] z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
            {steps.map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 0.12}>
                <div className="flex flex-col items-center text-center group">
                  {/* Circle */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#E2E8F0] shadow-card flex flex-col items-center justify-center group-hover:border-[#3B82F6] group-hover:shadow-card-lg transition-all duration-300">
                      <span className="text-2xl mb-0.5">{step.icon}</span>
                      <span className="text-[10px] font-bold text-[#3B82F6] tracking-widest">{step.number}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#0F172A] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed max-w-xs">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Bottom CTA hint */}
        <AnimatedSection delay={0.3}>
          <div className="mt-14 text-center">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            >
              See pricing plans →
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
