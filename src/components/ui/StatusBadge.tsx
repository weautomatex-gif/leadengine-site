import React from 'react'

export function StatusBadge({ status }: { status: string }) {
  switch (status?.toLowerCase()) {
    case 'new':
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-[0_0_10px_rgba(251,191,36,0.3)]">New</span>
    case 'contacted':
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700 ring-1 ring-blue-200">Contacted</span>
    case 'replied':
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-700 ring-1 ring-purple-200">Replied</span>
    case 'qualified':
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">Qualified</span>
    case 'won':
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gradient-to-r from-emerald-500 to-green-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]">Won</span>
    case 'lost':
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-500 ring-1 ring-gray-200">Lost</span>
    default:
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#F1F5F9] text-[#64748B]">{status || 'Unknown'}</span>
  }
}
