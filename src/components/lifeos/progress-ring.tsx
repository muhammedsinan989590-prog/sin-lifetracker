"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  glow?: boolean;
}

/**
 * Animated circular progress indicator. Used on the dashboard as the
 * main "today's progress" ring and on habit cards for streaks.
 */
export function ProgressRing({
  value,
  size = 132,
  stroke = 10,
  color = "#B7D6D2",
  trackColor = "rgba(255,255,255,0.12)",
  className,
  showLabel = true,
  label,
  sublabel,
  glow = true,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={`ring-${color.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#ring-${color.replace("#", "")})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={glow ? { filter: `drop-shadow(0 0 8px ${color}55)` } : undefined}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-semibold tracking-tight text-white">
            {label ?? `${Math.round(clamped)}%`}
          </span>
          {sublabel && (
            <span className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-white/55">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
