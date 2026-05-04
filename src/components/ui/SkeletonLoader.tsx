import React from 'react'

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm w-full">
      <div className="h-5 bg-slate-200 rounded animate-pulse w-1/3 mb-4"></div>
      <div className="h-10 bg-slate-200 rounded animate-pulse w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4"></div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
      <div className="flex items-center gap-4 w-1/3">
        <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
        <div className="space-y-2 w-full">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
      <div className="h-6 bg-slate-200 rounded-full animate-pulse w-20"></div>
      <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-24"></div>
    </div>
  )
}
