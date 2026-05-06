'use client'

import { 
  MapPin, 
  Search, 
  Mail, 
  Calendar, 
  Bot, 
  Zap, 
  MessageSquare, 
  BarChart3, 
  FileText 
} from 'lucide-react'

const tools = [
  { name: 'Google Maps', icon: MapPin },
  { name: 'Google', icon: Search },
  { name: 'Gmail', icon: Mail },
  { name: 'Google Calendar', icon: Calendar },
  { name: 'ChatGPT', icon: Bot },
  { name: 'Claude AI', icon: Zap },
  { name: 'Slack', icon: MessageSquare },
  { name: 'Zapier', icon: Zap },
  { name: 'HubSpot', icon: BarChart3 },
  { name: 'Notion', icon: FileText },
]

// Duplicate for seamless loop
const allTools = [...tools, ...tools]

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

        <div className="marquee-track">
          {allTools.map((tool, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-5 px-6 py-3 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center gap-3 transition-all duration-300 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 min-w-[140px] justify-center"
            >
              <tool.icon className="w-4 h-4 text-[#64748B]" />
              <span className="text-sm font-semibold text-[#0F172A] whitespace-nowrap">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
