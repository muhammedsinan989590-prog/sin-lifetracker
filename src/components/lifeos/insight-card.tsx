"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { GlassCard } from "./glass-card";

export interface InsightCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accent?: string;
  delay?: number;
}

export function InsightCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "#B7D6D2",
  delay = 0,
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard interactive flush className="h-full p-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15"
            style={{
              background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
            }}
          >
            <Icon size={16} strokeWidth={1.75} style={{ color: accent }} />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">
              {title}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-white">
              {value}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/65">
              {description}
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
