"use client";

import React from "react";

interface ButtonShimmerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export function ButtonShimmer({ 
  children, 
  href, 
  className = "", 
  ...props 
}: ButtonShimmerProps) {
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2 
    px-6 py-3 text-sm font-semibold text-white rounded-xl 
    bg-[#0F172A] overflow-hidden transition-all duration-200 
    active:scale-[0.98] group
    ${className}
  `.trim();

  const shimmerOverlay = (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
  );

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {shimmerOverlay}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </a>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {shimmerOverlay}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
