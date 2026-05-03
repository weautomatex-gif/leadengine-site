import Link from 'next/link'

export default function DashboardPage() {
  const stats = [
    { label: 'Total Leads', value: '0' },
    { label: 'Emails Found', value: '0' },
    { label: 'Drafts Ready', value: '0' },
    { label: 'Credits Left', value: '100' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Welcome back</h2>
        <p className="text-[#64748B]">Here&apos;s what&apos;s happening with your lead generation today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-[#64748B] mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-[#0F172A]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] border-dashed p-12 flex flex-col items-center justify-center text-center shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="w-16 h-16 bg-[#DBEAFE] rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h3 className="text-xl font-bold text-[#0F172A] mb-2">No campaigns yet</h3>
        <p className="text-[#64748B] max-w-md mb-6">
          Start your first scout run to find leads. Choose your target industry and location, and let our AI do the heavy lifting.
        </p>
        <Link
          href="/dashboard/scout"
          className="inline-flex items-center px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          Start Scouting →
        </Link>
      </div>
    </div>
  )
}
