import React from 'react'
import { Check, X, Clock } from 'lucide-react'

export function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''

  // Campaign specific statuses
  if (s === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
        Pending
      </span>
    )
  }

  if (s === 'running') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Running
      </span>
    )
  }

  if (s === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <Check className="w-3 h-3" />
        Completed
      </span>
    )
  }

  if (s === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-200">
        <X className="w-3 h-3" />
        Failed
      </span>
    )
  }

  // Lead specific statuses
  const leadStyles: Record<string, string> = {
    new: "bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm shadow-amber-200/50 font-semibold",
    contacted: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 font-medium",
    replied: "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-200 font-medium",
    qualified: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 font-medium",
    won: "bg-gradient-to-r from-emerald-500 to-green-400 text-white shadow-sm shadow-emerald-300/50 font-semibold",
    lost: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200 font-medium",
  }

  const style = leadStyles[s] || "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200 font-medium"

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap inline-block ${style}`}>
      {status}
    </span>
  )
}
