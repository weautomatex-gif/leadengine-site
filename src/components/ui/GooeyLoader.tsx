"use client";

import React from "react";

interface GooeyLoaderProps {
  primaryColor?: string;
  secondaryColor?: string;
  borderColor?: string;
  className?: string;
}

export function GooeyLoader({
  primaryColor = "#3B82F6",
  secondaryColor = "#93C5FD",
  borderColor = "#E2E8F0",
  className = "",
}: GooeyLoaderProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="gooey-loader-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation={12} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 48 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <style>{`
        .gooey-loader {
          width: 10em;
          height: 2.5em;
          position: relative;
          overflow: hidden;
          border-bottom: 6px solid ${borderColor};
          filter: url(#gooey-loader-filter);
        }
        .gooey-loader::before,
        .gooey-loader::after {
          content: '';
          position: absolute;
          border-radius: 50%;
        }
        .gooey-loader::before {
          width: 18em;
          height: 14em;
          background-color: ${primaryColor};
          left: -2em;
          bottom: -14em;
          animation: gooey1 2s linear infinite;
        }
        .gooey-loader::after {
          width: 12em;
          height: 10em;
          background-color: ${secondaryColor};
          left: -3em;
          bottom: -10em;
          animation: gooey2 2s linear infinite 0.75s;
        }
        @keyframes gooey1 {
          0% { transform: translateX(-8em) rotate(0deg); }
          100% { transform: translateX(6em) rotate(180deg); }
        }
        @keyframes gooey2 {
          0% { transform: translateX(-6em) rotate(0deg); }
          100% { transform: translateX(7em) rotate(180deg); }
        }
      `}</style>
      <div className="gooey-loader" />
    </div>
  );
}
