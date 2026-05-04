'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', style: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900' },
  { value: 'contacted', label: 'Contacted', style: 'bg-blue-100 text-blue-700' },
  { value: 'replied', label: 'Replied', style: 'bg-purple-100 text-purple-700' },
  { value: 'qualified', label: 'Qualified', style: 'bg-emerald-100 text-emerald-700' },
  { value: 'won', label: 'Won', style: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white' },
  { value: 'lost', label: 'Lost', style: 'bg-gray-100 text-gray-500' },
]

interface StatusSelectProps {
  leadId: string
  currentStatus: string
  onStatusChange?: (leadId: string, newStatus: string) => void
}

export function StatusSelect({ leadId, currentStatus, onStatusChange }: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState(currentStatus?.toLowerCase() || 'new')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentOption = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0]

  const handleSelect = async (newStatus: string) => {
    const oldStatus = status
    setStatus(newStatus) // Optimistic update
    setIsOpen(false)

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`)
        onStatusChange?.(leadId, newStatus)
      } else {
        setStatus(oldStatus) // Revert
        toast.error('Failed to update status')
      }
    } catch {
      setStatus(oldStatus)
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:opacity-80 ${currentOption.style}`}
      >
        {currentOption.label}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-[100] w-36 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={(e) => { e.stopPropagation(); handleSelect(option.value) }}
              className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-[#F8FAFC] transition-colors flex items-center gap-2 ${
                status === option.value ? 'bg-[#F8FAFC]' : ''
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${option.style}`} />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
