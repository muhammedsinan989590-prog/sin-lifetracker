"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ProgressRing } from "./progress-ring";
import { GlassCard } from "./glass-card";
import { TOTAL_HABITS, snapshotForDate } from "@/lib/lifeos";
import { useLifeOSStore } from "@/lib/store";

interface TodayProgressCardProps {
  dateKey: string;
  isTodayDate: boolean;
  isFutureDate: boolean;
}

/**
 * Prominent "Today's Progress" card with animated ring, count, and
 * a contextual motivational status. Purely derived from store state —
 * not manually editable.
 */
export function TodayProgressCard({
  dateKey,
  isTodayDate,
  isFutureDate,
}: TodayProgressCardProps) {
  const completions = useLifeOSStore((s) => s.completions);
  const snap = snapshotForDate(completions, dateKey);

  const status = (() => {
    if (isFutureDate) return { title: "Not yet", subtitle: "Future days can't be completed ahead of time." };
    if (snap.percent === 100)
      return { title: "All done", subtitle: "Perfect day. Every habit honored." };
    if (snap.percent >= 70)
      return { title: "Great progress", subtitle: "You're flowing — keep the rhythm going." };
    if (snap.percent >= 30)
      return { title: "Keep going", subtitle: "Momentum is building. One more?" };
    if (snap.percent > 0)
      return { title: "Good start", subtitle: "A small step still counts." };
    if (isTodayDate)
      return { title: "Today awaits", subtitle: "Tap your first habit to begin." };
    return { title: "Nothing checked", subtitle: "No habits were completed on this day." };
  })();

  return (
    <GlassCard variant="strong" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
        style={{ background: "rgba(183, 214, 210, 0.18)" }}
      />
      <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
        <ProgressRing
          value={snap.percent}
          size={156}
          stroke={12}
          sublabel={isTodayDate ? "Today" : "Progress"}
        />
        <div className="flex-1 space-y-3 sm:pl-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">
              {isTodayDate ? "Today's progress" : "Day progress"}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
              <motion.span
                key={snap.completed}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {snap.completed}
              </motion.span>
              <span className="text-white/45"> / {TOTAL_HABITS} completed</span>
            </p>
            <p className="mt-1.5 text-sm text-white/65">{status.subtitle}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full glass-pill px-3 py-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background:
                  snap.percent === 100
                    ? "#9DD9A8"
                    : snap.percent >= 50
                    ? "#B7D6D2"
                    : snap.percent > 0
                    ? "#E8B894"
                    : "rgba(255,255,255,0.35)",
              }}
            />
            <span className="text-xs font-medium text-white/85">
              {status.title}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
