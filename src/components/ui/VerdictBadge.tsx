import React from 'react'

export function VerdictBadge({ verdict }: { verdict: string }) {
  const v = verdict?.toUpperCase() || ''
  
  const styles: Record<string, string> = {
    NO_SITE: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
    OUTDATED: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200',
    DATED: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200',
    BROKEN: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
    ACCEPTABLE: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200',
    MODERN: 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[v] || 'bg-gray-100 text-gray-500'}`}>
      {verdict?.replace('_', ' ')}
    </span>
  )
}
