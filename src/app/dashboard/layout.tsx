'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { BarChart3, Target, Folder, Users, Settings, Menu, X } from 'lucide-react'

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Scout', href: '/dashboard/scout', icon: Target },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Folder },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">
      <Toaster position="top-right" richColors />
      
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
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Lead<span className="text-[#3B82F6]">Engine</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 md:py-0 space-y-1.5 overflow-y-auto mt-16 md:mt-0">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                  isActive
                    ? 'bg-[#F0F9FF] text-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#3B82F6] rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Upgrade Badge Placeholder & User Info */}
        <div className="p-4 border-t border-[#E2E8F0] mt-auto">
          <div className="bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Starter Plan</span>
            </div>
            <p className="text-xs text-[#64748B] mb-3">Upgrade to unlock more leads and premium features.</p>
            <Link href="/dashboard/settings" className="w-full block text-center py-2 text-xs font-bold text-[#3B82F6] bg-white border border-[#E2E8F0] rounded-lg shadow-sm hover:border-[#3B82F6] transition-colors">
              Upgrade Plan
            </Link>
          </div>
          <div className="flex items-center gap-3 px-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-semibold text-[#0F172A]">My Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
          <h1 className="text-xl font-bold text-[#0F172A]">
            {sidebarLinks.find((l) => l.href === pathname || (l.href !== '/dashboard' && pathname.startsWith(l.href)))?.name || 'Dashboard'}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
