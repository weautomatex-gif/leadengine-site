import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://findmealead.com'),
  title: 'LeadEngine — AI-Powered Lead Generation for Agencies',
  description:
    'FindMeALead uses AI to discover businesses in any niche, verify contact details, and draft personalised outreach emails — all on autopilot. Start free at findmealead.com',
  keywords: ['lead generation', 'AI leads', 'agency tools', 'email outreach', 'local business leads'],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'LeadEngine — AI-Powered Lead Generation',
    description: 'Find businesses that need you. Before they find someone else.',
    type: 'website',
    url: 'https://findmealead.com',
    siteName: 'FindMeALead',
  },
  alternates: {
    canonical: 'https://findmealead.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`scroll-smooth ${plusJakartaSans.variable}`}>
        <body className={`${plusJakartaSans.className} antialiased bg-white text-[#0F172A]`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
