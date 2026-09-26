"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: { delta: string; positive?: boolean };
  accent?: string; // hex color
  className?: string;
  delay?: number;
}

/**
 * Rounded statistic card inspired by the reference image:
 * translucent surface, outline icon, large value, subtle trend line.
 */
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  accent = "#B7D6D2",
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <GlassCard
        interactive
        className="relative h-full overflow-hidden p-5"
      >
        {/* glow blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl"
          style={{ background: `${accent}40` }}
        />
        <div className="relative flex items-start justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15"
            style={{
              background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
            }}
          >
            <Icon size={18} strokeWidth={1.75} style={{ color: accent }} />
          </div>
          {trend && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                trend.positive
                  ? "bg-[#B7D6D2]/15 text-[#B7D6D2]"
                  : "bg-white/10 text-white/70",
              )}
            >
              {trend.delta}
            </span>
          )}
        </div>
        <div className="relative mt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">
            {label}
          </p>
          <p className="mt-1.5 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight text-white">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-white/55">{unit}</span>
            )}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
