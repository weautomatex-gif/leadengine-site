'use client'

const brands = [
  'Google Maps', 'Gmail', 'Google Calendar', 'ChatGPT', 'Claude AI', 
  'Slack', 'Zapier', 'HubSpot', 'Notion', 'Stripe'
]

// Duplicate for seamless loop
const allBrands = [...brands, ...brands]

export default function TrustBar() {
  return (
    <section className="py-14 bg-[#F8FAFC] border-y border-[#E2E8F0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-sm font-medium text-[#94A3B8] uppercase tracking-widest">
          INTEGRATES WITH YOUR FAVOURITE TOOLS
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

        <div className="marquee-track flex gap-12 sm:gap-20 py-2">
          {allBrands.map((brand, i) => (
            <span
              key={i}
              className="text-lg font-semibold text-[#CBD5E1] hover:text-[#64748B] transition-colors duration-300 tracking-tight whitespace-nowrap cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
