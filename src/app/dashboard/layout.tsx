'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  Target, 
  FolderOpen, 
  Users, 
  Settings, 
  ChevronLeft, 
  Menu, 
  X,
  ChevronRight,
  CheckCircle2
} from 'lucide-react'

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Scout', href: '/dashboard/scout', icon: Target },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: FolderOpen },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface BillingInfo {
  plan: string;
  credits_limit: number;
  credits_used: number;
  plan_period_end: string | null;
  has_subscription: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useUser()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)

  // Fetch billing info
  const fetchBillingInfo = async () => {
    try {
      const res = await fetch('/api/billing/info')
      if (res.ok) {
        const data = await res.json()
        setBillingInfo(data)
      }
    } catch (error) {
      console.error('Error fetching billing info:', error)
    }
  }

  // Persist collapse state and fetch billing
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(saved === 'true')
    }
    setIsLoaded(true)
    fetchBillingInfo()
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  if (!isLoaded) return null // Prevent hydration mismatch

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-x-hidden">
      <Toaster position="top-right" richColors />
      
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 z-50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-black text-[#0F172A] tracking-tight">Lead<span className="text-[#3B82F6]">Engine</span></span>
        </Link>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] flex flex-col border-r border-[#E2E8F0]"
          >
            <div className="p-6 flex items-center justify-between border-b border-[#E2E8F0]">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-black text-[#0F172A] tracking-tight">Lead<span className="text-[#3B82F6]">Engine</span></span>
              </Link>
              <button onClick={() => setIsMobileOpen(false)} className="p-2 text-[#64748B] hover:bg-[#F8FAFC] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {sidebarLinks.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive ? 'bg-[#EFF6FF] text-[#3B82F6] border-l-4 border-[#3B82F6]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-[#E2E8F0] space-y-4">
              <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">
                  {billingInfo?.plan ? `${billingInfo.plan} Plan` : 'Loading...'}
                </p>
                {(!billingInfo || billingInfo.plan === 'free') ? (
                  <>
                    <p className="text-xs text-[#64748B] mb-3 leading-relaxed">Upgrade to unlock more leads and premium features.</p>
                    <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)} className="w-full block py-2 text-center text-xs font-bold text-[#3B82F6] bg-white border border-[#E2E8F0] rounded-xl hover:bg-[#F8FAFC] transition-colors shadow-sm">
                      Upgrade Plan
                    </Link>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs py-1">
                    <CheckCircle2 className="w-4 h-4" /> Professional Account
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 px-2">
                <UserButton afterSignOutUrl="/" />
                <span className="text-sm font-bold text-[#0F172A]">{user?.fullName || 'My Account'}</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-[#E2E8F0] transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo Section */}
        <div className={`p-4 h-16 flex items-center border-b border-[#E2E8F0] ${isCollapsed ? 'justify-center' : 'px-6'}`}>
          <Link href="/" className="flex items-center gap-3">
            {isCollapsed ? (
              <span className="text-lg font-black text-[#0F172A] tracking-tighter">LE</span>
            ) : (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-xl font-black text-[#0F172A] tracking-tight whitespace-nowrap"
              >
                Lead<span className="text-[#3B82F6]">Engine</span>
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : ''}
                className={`flex items-center rounded-xl transition-all relative group h-11 ${
                  isActive ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                } ${isCollapsed ? 'justify-center mx-1' : 'px-4 mx-2'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-accent"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#3B82F6] rounded-r-full" 
                  />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#3B82F6]' : 'text-[#94A3B8] group-hover:text-[#0F172A]'}`} />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-bold whitespace-nowrap">{item.name}</span>
                )}
                
                {/* Custom Tooltip for Collapsed State */}
                {isCollapsed && (
                  <div className="absolute left-14 px-2.5 py-1.5 bg-[#0F172A] text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700 uppercase tracking-widest">
                    {item.name}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-2 border-t border-[#E2E8F0]">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="mb-4 p-4 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border border-[#E2E8F0] rounded-2xl shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">
                {billingInfo?.plan ? `${billingInfo.plan} Plan` : 'Loading...'}
              </p>
              {(!billingInfo || billingInfo.plan === 'free') ? (
                <>
                  <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">Upgrade to unlock more leads and premium features.</p>
                  <Link href="/dashboard/settings" className="w-full block py-2 text-center text-[11px] font-bold text-[#3B82F6] bg-white border border-[#E2E8F0] rounded-xl hover:border-[#3B82F6] transition-all shadow-sm active:scale-95">
                    Upgrade Plan
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-[11px] py-1">
                  <CheckCircle2 className="w-4 h-4" /> Professional Account
                </div>
              )}
            </motion.div>
          )}

          {/* User Info */}
          <div className={`flex items-center p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors ${isCollapsed ? 'justify-center' : 'gap-3 px-3'}`}>
            <UserButton afterSignOutUrl="/" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-[#0F172A] truncate">{user?.fullName || 'Account'}</span>
                <span className="text-[10px] text-[#64748B] font-medium truncate uppercase tracking-tighter">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            className={`w-full mt-2 flex items-center p-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all ${isCollapsed ? 'justify-center' : 'px-4'}`}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
              <div className="flex items-center gap-3">
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">Hide Menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen pt-16 lg:pt-0 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 md:p-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
