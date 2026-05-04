import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, description, confirmText = 'Confirm', isDestructive = false }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">{title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{description}</p>
            </div>
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex gap-3 justify-end">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-colors ${
                  isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
