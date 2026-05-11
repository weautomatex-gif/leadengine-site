"use client";

import React from "react";

interface TextMarqueeProps {
  items: string[];
  speed?: number;
  className?: string;
  prefix?: string;
}

export function TextMarquee({
  items,
  speed = 1,
  prefix,
  className = "",
}: TextMarqueeProps) {
  const count = items.length;

  return (
    <>
      <style>{`
        @keyframes slide-vertical {
          to { translate: 0 var(--destination); }
        }
      `}</style>
      <div className={`flex items-center gap-2 ${className}`}>
        {prefix && (
          <span className="text-[#64748B] font-medium whitespace-nowrap">
            {prefix}
          </span>
        )}
        <div
          className="overflow-hidden relative"
          style={{
            height: "1.6em",
            maskImage: "linear-gradient(transparent 0%, black 30%, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(transparent 0%, black 30%, black 70%, transparent 100%)",
          }}
        >
          <div className="relative h-full">
            {items.map((item, index) => (
              <div
                key={index}
                className="h-[1.6em] flex items-center"
                style={{
                  translate: `0 calc((${count} - ${index}) * 100%)`,
                  animation: `slide-vertical calc(${speed} * ${count}s) calc((${speed} * ${count}s / ${count}) * ${index} - ${speed} * ${count}s) infinite linear`,
                  // @ts-ignore
                  "--destination": `calc((${index} + 1) * -100%)`,
                } as React.CSSProperties}
              >
                <span className="text-[#3B82F6] font-bold whitespace-nowrap">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
