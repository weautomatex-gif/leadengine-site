'use client'

const agencies = [
  'GrowthPulse Agency',
  'NorthStar Digital',
  'Apex Leads Co.',
  'BlueSky Marketing',
  'Vantage Sales Group',
  'Momentum Media',
  'Clearwater Agency',
  'Peak Digital Studio',
]

// Duplicate for seamless loop
const allAgencies = [...agencies, ...agencies]

export default function TrustBar() {
  return (
    <section className="py-14 bg-[#F8FAFC] border-y border-[#E2E8F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-medium text-[#94A3B8] uppercase tracking-widest">
          Trusted by agencies and sales teams across the UK
        </p>
      </div>

      {/* Marquee wrapper */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #F8FAFC, transparent)' }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #F8FAFC, transparent)' }}
        />

        <div className="marquee-track">
          {allAgencies.map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-5 px-7 py-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm"
            >
              <span className="text-sm font-semibold text-[#94A3B8] whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
