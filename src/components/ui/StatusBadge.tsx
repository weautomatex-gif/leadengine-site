import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || 'new'

  // Campaign specific statuses
  if (s === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
        Pending
      </span>
    )
  }

  if (s === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        Running
      </span>
    )
  }

  if (s === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle className="w-3.5 h-3.5" />
        Completed
      </span>
    )
  }

  if (s === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="w-3.5 h-3.5" />
        Failed
      </span>
    )
  }

  // Lead specific statuses
  const leadStyles: Record<string, string> = {
    new: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm shadow-amber-200/50',
    contacted: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200',
    replied: 'bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200',
    qualified: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    won: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white shadow-sm shadow-emerald-300/50',
    lost: 'bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200',
  }

  const style = leadStyles[s] || leadStyles.new

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
    </span>
  )
}
