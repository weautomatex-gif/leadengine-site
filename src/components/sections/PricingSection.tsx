import Link from 'next/link'

function PricingCard({ name, price, features, highlighted, ctaLabel, ctaStyle, delay = 0 }: PricingCardProps) {
  return (
    <AnimatedSection delay={delay}>
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
        className={`relative flex flex-col rounded-2xl p-7 h-full transition-all duration-200 ${
          highlighted
            ? 'bg-white border-2 border-[#3B82F6] shadow-[0_20px_48px_-8px_rgba(59,130,246,0.18)]'
            : 'bg-white border border-[#E2E8F0] shadow-card'
        }`}
      >
        {/* Most popular badge */}
        {highlighted && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 rounded-full bg-[#3B82F6] text-white text-xs font-bold shadow-sm whitespace-nowrap">
              Most Popular
            </span>
          </div>
        )}

        {/* Plan name + price */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#64748B] mb-2">{name}</p>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold text-[#0F172A]">{price}</span>
            <span className="text-sm text-[#94A3B8] mb-1">/mo</span>
          </div>
        </div>

        {/* Features list */}
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5">
              {f.included ? (
                <svg className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#E2E8F0] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              )}
              <span className={`text-sm leading-snug flex items-center gap-2 ${f.included ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>
                {f.text}
                {f.comingSoon && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F1F5F9] text-[#94A3B8] uppercase tracking-wide">
                    soon
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <Link
          href="/sign-up"
          className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 active:scale-[0.98] ${
            ctaStyle === 'filled'
              ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-sm'
              : 'border border-[#E2E8F0] hover:border-[#3B82F6] text-[#0F172A] hover:text-[#3B82F6]'
          }`}
        >
          {ctaLabel}
        </Link>
      </motion.div>
    </AnimatedSection>
  )
}

const plans: PricingCardProps[] = [
  {
    name: 'Starter',
    price: '£29',
    ctaLabel: 'Get Started',
    ctaStyle: 'outline',
    delay: 0,
    features: [
      { text: '100 leads per month', included: true },
      { text: '5 scout campaigns', included: true },
      { text: 'AI lead qualification', included: true },
      { text: 'Email & phone finding', included: true },
      { text: 'AI email drafts', included: true },
      { text: 'CSV export', included: true },
    ],
  },
  {
    name: 'Growth',
    price: '£59',
    ctaLabel: 'Get Started',
    ctaStyle: 'filled',
    highlighted: true,
    delay: 0.08,
    features: [
      { text: '300 leads per month', included: true },
      { text: 'Unlimited scout campaigns', included: true },
      { text: 'AI lead qualification', included: true },
      { text: 'Email & phone finding', included: true },
      { text: 'AI email drafts', included: true },
      { text: 'CSV export', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    name: 'Agency',
    price: '£149',
    ctaLabel: 'Get Started',
    ctaStyle: 'outline',
    delay: 0.16,
    features: [
      { text: '1,000 leads per month', included: true },
      { text: 'Unlimited scout campaigns', included: true },
      { text: 'AI lead qualification', included: true },
      { text: 'Email & phone finding', included: true },
      { text: 'AI email drafts', included: true },
      { text: 'CSV export', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true, comingSoon: true },
    ],
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold mb-4">
              Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-base text-[#64748B]">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>
        </AnimatedSection>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        {/* Footer note */}
        <AnimatedSection delay={0.3}>
          <p className="text-center text-sm text-[#94A3B8] mt-10">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
