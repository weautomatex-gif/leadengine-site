'use client'

import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

/* ─── Mockup: Lead Discovery ───────────────────────────────────────── */
function LeadDiscoveryMockup() {
  const results = [
    { name: 'Harvest Table Restaurant', niche: 'Restaurant', city: 'Bristol', score: 'Strong Match' },
    { name: 'FitLife Gym & Studio', niche: 'Fitness', city: 'Leeds', score: 'Strong Match' },
    { name: 'Glow Beauty Salon', niche: 'Hair & Beauty', city: 'Manchester', score: 'Good Match' },
    { name: 'CoreFit Personal Training', niche: 'Fitness', city: 'Leeds', score: 'Good Match' },
  ]

  const scoreStyle: Record<string, string> = {
    'Strong Match': 'bg-emerald-100 text-emerald-700',
    'Good Match': 'bg-[#DBEAFE] text-[#1E40AF]',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: -0.5, y: -4, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.10)] overflow-hidden w-full max-w-[460px] -rotate-1"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-[#94A3B8] mb-0.5">Campaign</p>
            <h3 className="text-base font-bold text-[#0F172A]">Fitness Studios — Leeds</h3>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide">
            Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full w-[68%] bg-gradient-to-r from-[#3B82F6] to-[#10B981] rounded-full" />
          </div>
          <span className="text-xs font-semibold text-[#0F172A]">68 / 100 leads</span>
        </div>
      </div>

      {/* Results */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">Latest Discoveries</p>
        <ul className="space-y-2.5">
          {results.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🏢</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0F172A] leading-none">{r.name}</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{r.niche} · {r.city}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${scoreStyle[r.score]}`}>
                {r.score}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 pb-5">
        <button className="w-full py-2.5 bg-[#3B82F6] text-white text-xs font-semibold rounded-xl hover:bg-[#2563EB] transition-colors">
          View All Leads →
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Mockup: Email Draft ──────────────────────────────────────────── */
function EmailDraftMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: 1.5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: 0.5, y: -4, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.10)] overflow-hidden w-full max-w-[460px] rotate-1"
    >
      {/* Email chrome */}
      <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
        <span className="text-xs font-semibold text-[#64748B]">AI Email Draft — Ready to send</span>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">Personalised</span>
      </div>

      <div className="px-5 py-4">
        {/* Subject */}
        <div className="mb-4 pb-3 border-b border-[#E2E8F0]">
          <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">Subject</p>
          <p className="text-sm font-semibold text-[#0F172A]">
            A quick idea for FitLife Gym &amp; Studio 💪
          </p>
        </div>

        {/* Body */}
        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">Email Body</p>
        <div className="text-xs text-[#64748B] leading-relaxed space-y-2">
          <p>Hi there,</p>
          <p>
            I came across FitLife Gym while researching fitness studios in Leeds — you&apos;ve got a
            brilliant reputation (4.9 ★, 112 reviews). I supply commercial gym equipment and
            I&apos;d love to show you our latest range of functional training kit.
          </p>
          <p>
            Happy to drop by for a quick demo, or send over a catalogue — whatever works best for you.
          </p>
          <p>Worth a chat?</p>
          <p className="text-[#0F172A] font-medium">Best,<br />Amir at ProFit Equipment</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <button className="flex-1 py-2 border border-[#E2E8F0] text-xs font-semibold text-[#64748B] rounded-xl hover:bg-[#F8FAFC] transition-colors">
          📋 Copy
        </button>
        <button className="flex-1 py-2 border border-[#E2E8F0] text-xs font-semibold text-[#64748B] rounded-xl hover:bg-[#F8FAFC] transition-colors">
          🔄 Regenerate
        </button>
        <button className="flex-1 py-2 bg-[#3B82F6] text-white text-xs font-semibold rounded-xl hover:bg-[#2563EB] transition-colors">
          Send →
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Mockup: Kanban Board ─────────────────────────────────────────── */
function KanbanMockup() {
  const columns = [
    {
      label: 'New',
      color: '#3B82F6',
      bg: '#DBEAFE',
      cards: ['The Amber Kitchen', 'CoreFit Studio'],
    },
    {
      label: 'Contacted',
      color: '#F59E0B',
      bg: '#FEF3C7',
      cards: ['Glow Beauty Salon', 'Ironworks Gym'],
    },
    {
      label: 'Replied',
      color: '#8B5CF6',
      bg: '#EDE9FE',
      cards: ['FitLife Gym'],
    },
    {
      label: 'Won',
      color: '#10B981',
      bg: '#D1FAE5',
      cards: ['Harvest Table', 'Prime Estates UK'],
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ rotate: -0.5, y: -4, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.10)] overflow-hidden w-full max-w-[500px] -rotate-1"
    >
      {/* Chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-[#94A3B8] font-medium">Pipeline View</span>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-2 p-3">
        {columns.map((col) => (
          <div key={col.label}>
            <div className="flex items-center gap-1 mb-2 px-1">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
              <span className="text-[10px] font-semibold text-[#64748B]">{col.label}</span>
              <span
                className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: col.bg, color: col.color }}
              >
                {col.cards.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {col.cards.map((card) => (
                <div
                  key={card}
                  className="rounded-lg bg-white border border-[#E2E8F0] p-2 shadow-sm text-[9px] font-semibold text-[#0F172A] leading-tight"
                  style={{ borderLeft: `3px solid ${col.color}` }}
                >
                  {card}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3 pt-1 flex items-center gap-2">
        <span className="text-[10px] text-[#94A3B8]">7 active leads</span>
        <button className="ml-auto text-[10px] text-[#3B82F6] font-semibold hover:underline">
          Export CSV →
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Testimonial ──────────────────────────────────────────────────── */
function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <div className="mt-8 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
      <svg className="w-6 h-6 text-[#3B82F6] mb-3 opacity-60" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-sm text-[#64748B] leading-relaxed italic mb-4">{quote}</p>
      <div>
        <p className="text-sm font-semibold text-[#0F172A]">{name}</p>
        <p className="text-xs text-[#94A3B8]">{role}</p>
      </div>
    </div>
  )
}

/* ─── Feature block ────────────────────────────────────────────────── */
interface FeatureBlockProps {
  tag: string
  headline: string
  description: string
  mockup: React.ReactNode
  reversed?: boolean
  bg?: string
  testimonialQuote: string
  testimonialName: string
  testimonialRole: string
}

function FeatureBlock({
  tag, headline, description, mockup, reversed = false, bg = 'bg-white',
  testimonialQuote, testimonialName, testimonialRole,
}: FeatureBlockProps) {
  return (
    <section className={`py-20 md:py-28 ${bg}`} id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center ${reversed ? 'lg:flex lg:flex-row-reverse' : ''}`}>
          <AnimatedSection delay={0}>
            <div className="max-w-lg">
              <span className="inline-block px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold mb-4">
                {tag}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-5">{headline}</h2>
              <p className="text-base text-[#64748B] leading-relaxed">{description}</p>
              <Testimonial quote={testimonialQuote} name={testimonialName} role={testimonialRole} />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className={`flex ${reversed ? 'justify-start lg:justify-end' : 'justify-center lg:justify-end'}`}>
              {mockup}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

/* ─── Main export ──────────────────────────────────────────────────── */
export default function FeatureSections() {
  return (
    <>
      <FeatureBlock
        tag="Lead Discovery"
        headline="Smart Lead Discovery for Any Industry"
        description="Tell LeadEngine who you&apos;re targeting — and it finds them. A food supplier looking for restaurants? A gym equipment brand targeting fitness studios? A SaaS company hunting for salons? Just pick your niche and location, and our AI does the rest — identifying verified, qualified leads across any industry in minutes."
        mockup={<LeadDiscoveryMockup />}
        bg="bg-white"
        testimonialQuote="We supply catering equipment and finding qualified restaurant leads used to take our team days of manual research. LeadEngine finds better leads in minutes. We&apos;ve completely changed how we prospect."
        testimonialName="Sarah Mitchell"
        testimonialRole="Head of Sales, CaterDirect UK"
      />

      <FeatureBlock
        tag="AI Outreach"
        headline="Every Email, Written for Your Pitch"
        description="No more generic copy-paste templates. LeadEngine drafts a personalised outreach email for every single lead — referencing their specific business, their location, their Google reviews, and exactly how your product or service fits their world. Every email is unique, warm, and ready to send."
        mockup={<EmailDraftMockup />}
        reversed
        bg="bg-[#F8FAFC]"
        testimonialQuote="The emails are genuinely impressive. They reference the actual business, their location, even their review scores. My reply rate more than tripled in the first month. I honestly couldn&apos;t tell the difference from a hand-written email."
        testimonialName="Tom Gallagher"
        testimonialRole="Sales Lead, Apex Growth Partners"
      />

      <FeatureBlock
        tag="Lead Pipeline"
        headline="Your Complete Lead Pipeline"
        description="Track every lead from discovery to deal. See who you&apos;ve contacted, who&apos;s replied, and who&apos;s ready to close. Filter by niche, city, or status. Export to CSV anytime."
        mockup={<KanbanMockup />}
        bg="bg-white"
        testimonialQuote="Having everything in one place changed how we work. We went from spreadsheets and sticky notes to a proper pipeline. We closed 3 new clients in the first two weeks."
        testimonialName="Priya Sharma"
        testimonialRole="Director, BlueSky Marketing Ltd"
      />
    </>
  )
}
