"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { DateNavigator, useSelectedDateLabel } from "./date-navigator";
import { TodayProgressCard } from "./today-progress-card";
import { CategorySection } from "./habit-row";
import { GlassCard } from "./glass-card";
import { CATEGORIES, currentStreak, greeting, prettyDate, todayKey } from "@/lib/lifeos";
import { useLifeOSStore } from "@/lib/store";

interface TodayViewProps {
  onNavigate?: (v: "progress" | "history") => void;
}

export function TodayView({ onNavigate }: TodayViewProps) {
  const userName = useLifeOSStore((s) => s.userName);
  const completions = useLifeOSStore((s) => s.completions);
  const { dateKey, isTodayDate, isFutureDate } = useSelectedDateLabel();

  const streak = currentStreak(completions);
  const hello = greeting(new Date());

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/55">
            {isTodayDate ? prettyDate() : "Reviewing past day"}
          </p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {hello},{" "}
            <span className="bg-gradient-to-r from-[#B7D6D2] to-[#D5E0DF] bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-white/65">Today&apos;s habits</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 self-start rounded-full glass-pill px-3.5 py-2 text-sm md:self-end">
            <Flame size={14} className="text-[#E8B894]" />
            <span className="font-semibold text-white">{streak}</span>
            <span className="text-white/60">day streak</span>
          </div>
        )}
      </motion.header>

      {/* Date navigation */}
      <DateNavigator />

      {/* Progress card */}
      <TodayProgressCard
        dateKey={dateKey}
        isTodayDate={isTodayDate}
        isFutureDate={isFutureDate}
      />

      {/* Future-date notice */}
      {isFutureDate && (
        <GlassCard variant="soft" className="text-center">
          <p className="text-sm text-white/70">
            This day hasn&apos;t arrived yet. Future dates are read-only.
          </p>
        </GlassCard>
      )}

      {/* Category sections */}
      <div className="flex flex-col gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <CategorySection
              categoryId={cat.id}
              dateKey={dateKey}
              readOnly={isFutureDate}
            />
          </motion.div>
        ))}
      </div>

      {/* Quick links to other views */}
      {onNavigate && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("progress")}
            className="rounded-2xl glass-pill px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            View weekly progress →
          </button>
          <button
            onClick={() => onNavigate("history")}
            className="rounded-2xl glass-pill px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-white/15"
          >
            Open history calendar →
          </button>
        </div>
      )}
    </div>
  );
}
