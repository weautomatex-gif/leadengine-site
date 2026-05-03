'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'How it Works', href: '#how-it-works' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? 'border-b border-[#E2E8F0] shadow-sm' : 'border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">
            Lead<span className="text-[#3B82F6]">Engine</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="#"
            className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors duration-200"
          >
            Log in
          </Link>
          <motion.a
            href="#hero-cta"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm"
          >
            Get Started Free
          </motion.a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 focus:outline-none"
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          <span
            className={`block h-0.5 w-5 bg-[#0F172A] transition-all duration-300 origin-center ${
              mobileOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-[#0F172A] transition-all duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-[#0F172A] transition-all duration-300 origin-center ${
              mobileOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-[#E2E8F0] bg-white"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
                <Link href="#" className="text-sm font-medium text-[#64748B]">
                  Log in
                </Link>
                <a
                  href="#hero-cta"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-[#3B82F6] text-white text-sm font-semibold rounded-lg"
                >
                  Get Started Free
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
