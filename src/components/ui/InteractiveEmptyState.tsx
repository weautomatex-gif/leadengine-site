"use client";

import React from "react";
import { motion } from "framer-motion";

interface InteractiveEmptyStateProps {
  title: string;
  description: string;
  icons: React.ReactNode[];
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function InteractiveEmptyState({
  title,
  description,
  icons,
  actionLabel,
  actionHref,
  onAction,
}: InteractiveEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-[#E2E8F0] hover:border-[#3B82F6]/30 transition-all duration-300 bg-white hover:bg-[#F8FAFC]/50"
    >
      {/* Triple icon display */}
      {icons.length >= 3 && (
        <div className="flex justify-center items-center gap-0 mb-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileHover={{ x: -16, rotate: -12, scale: 1.1 }}
            className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] shadow-md flex items-center justify-center text-[#94A3B8] group-hover:text-[#64748B] group-hover:border-[#CBD5E1] group-hover:shadow-lg transition-all duration-300 z-10 relative -mr-2"
          >
            {icons[0]}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ y: -8, scale: 1.15 }}
            className="w-14 h-14 rounded-xl bg-white border border-[#E2E8F0] shadow-lg flex items-center justify-center text-[#64748B] group-hover:text-[#3B82F6] group-hover:border-[#3B82F6]/20 group-hover:shadow-xl transition-all duration-300 z-20 relative"
          >
            {icons[1]}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, rotate: 6 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ x: 16, rotate: 12, scale: 1.1 }}
            className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] shadow-md flex items-center justify-center text-[#94A3B8] group-hover:text-[#64748B] group-hover:border-[#CBD5E1] group-hover:shadow-lg transition-all duration-300 z-10 relative -ml-2"
          >
            {icons[2]}
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{title}</h3>
        <p className="text-sm text-[#64748B] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {(actionLabel && (actionHref || onAction)) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm"
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
