import React from 'react'
import { AlertTriangle } from 'lucide-react'

export function VerdictBadge({ verdict }: { verdict: string }) {
  switch (verdict?.toUpperCase()) {
    case 'NO_SITE':
      return <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-red-100 text-red-700 ring-1 ring-red-200">No Site</span>
    case 'OUTDATED':
      return <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-orange-100 text-orange-700 ring-1 ring-orange-200">Outdated</span>
    case 'DATED':
      return <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-amber-100 text-amber-700 ring-1 ring-amber-200">Dated</span>
    case 'BROKEN':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-red-100 text-red-700 ring-1 ring-red-200">
          <AlertTriangle className="w-3 h-3" /> Broken
        </span>
      )
    case 'ACCEPTABLE':
      return <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-blue-100 text-blue-700">Acceptable</span>
    case 'MODERN':
      return <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-emerald-100 text-emerald-700">Modern</span>
    default:
      return <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-[#F1F5F9] text-[#64748B]">{verdict || 'Unknown'}</span>
  }
}
