'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Scout', href: '/dashboard/scout', icon: '🎯' },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: '📁' },
  { name: 'Leads', href: '/dashboard/leads', icon: '👥' },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white px-4 py-3 border-b border-[#E2E8F0] z-20">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-lg font-bold text-[#0F172A] tracking-tight">
            Lead<span className="text-[#3B82F6]">Engine</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 text-[#64748B] focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-white border-r border-[#E2E8F0] transform transition-transform duration-300 ease-in-out flex flex-col ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 hidden md:block">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-[#0F172A] tracking-tight">
              Lead<span className="text-[#3B82F6]">Engine</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 md:py-0 space-y-1 overflow-y-auto mt-16 md:mt-0">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#DBEAFE] text-[#1E40AF]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
          <h1 className="text-lg font-bold text-[#0F172A]">
            {sidebarLinks.find((l) => l.href === pathname)?.name || 'Dashboard'}
          </h1>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
