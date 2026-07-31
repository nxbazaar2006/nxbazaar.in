"use client";

import React from "react";

export function AntigravityBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
    >
      <svg
        className="h-full w-full opacity-60 dark:opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Radial & Linear Gradients */}
          <radialGradient id="blob-grad-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#818cf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="blob-grad-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#fb923c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="blob-grad-3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
          </linearGradient>

          {/* SVG Glow & Blur Filter */}
          <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="40" result="blur" />
          </filter>
        </defs>

        {/* Ambient Orbit / Grid Lines */}
        <g stroke="url(#orbit-grad)" strokeWidth="0.75" fill="none" opacity="0.4">
          <ellipse cx="400" cy="300" rx="340" ry="220" transform="rotate(-15 400 300)" />
          <ellipse cx="400" cy="300" rx="260" ry="160" transform="rotate(25 400 300)" />
          <path d="M 50,300 Q 400,100 750,300" strokeDasharray="4 6" />
          <path d="M 50,300 Q 400,500 750,300" strokeDasharray="6 8" />
        </g>

        {/* Floating Gradient Glowing Shapes with Keyframe Animations */}
        <g filter="url(#glow-blur)">
          <circle
            cx="250"
            cy="180"
            r="160"
            fill="url(#blob-grad-1)"
            className="animate-antigravity-slow"
          />
          <circle
            cx="580"
            cy="400"
            r="180"
            fill="url(#blob-grad-2)"
            className="animate-antigravity-reverse"
          />
          <ellipse
            cx="400"
            cy="280"
            rx="140"
            ry="110"
            fill="url(#blob-grad-3)"
            className="animate-antigravity-float"
          />
        </g>
      </svg>

      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(18px, -24px) scale(1.08); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-22px, 20px) scale(0.95); }
        }
        @keyframes floatMid {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(14px, 16px) rotate(6deg); }
        }
        .animate-antigravity-slow {
          animation: floatSlow 18s ease-in-out infinite;
        }
        .animate-antigravity-reverse {
          animation: floatReverse 22s ease-in-out infinite;
        }
        .animate-antigravity-float {
          animation: floatMid 14s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-antigravity-slow,
          .animate-antigravity-reverse,
          .animate-antigravity-float {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
