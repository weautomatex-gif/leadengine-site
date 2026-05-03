import Link from 'next/link'

const productLinks = ['Features', 'Pricing', 'Dashboard']
const companyLinks = ['About', 'Blog', 'Contact']

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Wordmark + tagline */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl font-bold text-[#0F172A] tracking-tight">
                Lead<span className="text-[#3B82F6]">Engine</span>
              </span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed">
              AI-powered lead generation for agencies and sales teams across the UK.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="text-sm font-semibold text-[#0F172A] mb-4 uppercase tracking-wider">
              Product
            </p>
            <ul className="space-y-2.5">
              {productLinks.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="text-sm font-semibold text-[#0F172A] mb-4 uppercase tracking-wider">
              Company
            </p>
            <ul className="space-y-2.5">
              {companyLinks.map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E2E8F0] pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#94A3B8]">
            © 2026 LeadEngine. All rights reserved.
          </p>
          <p className="text-sm text-[#94A3B8]">
            Built by{' '}
            <span className="text-[#64748B] font-medium">AutomateX</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
