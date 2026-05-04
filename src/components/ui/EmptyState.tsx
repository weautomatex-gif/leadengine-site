import React from 'react'

export function EmptyState({ icon, title, description, action }: { icon: React.ReactNode, title: string, description: string, action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] border-dashed p-12 flex flex-col items-center justify-center text-center w-full">
      <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4 text-[#3B82F6]">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-[#64748B] text-sm max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  )
}
