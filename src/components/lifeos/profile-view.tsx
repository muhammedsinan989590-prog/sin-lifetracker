"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Target, Award, TrendingUp, Pencil, Sparkles } from "lucide-react";
import { GlassCard } from "./glass-card";
import { ProgressRing } from "./progress-ring";
import { useLifeOSStore } from "@/lib/store";
import {
  averageCompletion,
  completionRate,
  currentStreak,
  longestStreak,
  todayKey,
  lastNDays,
  dateFromKey,
  isHabitScheduled,
  isHabitDone,
  habitStreak,
} from "@/lib/lifeos";

interface ProfileViewProps {
  onOpenSettings: () => void;
}

export function ProfileView({ onOpenSettings }: ProfileViewProps) {
  const store = useLifeOSStore();
  const activeHabits = store.habits.filter((h) => !h.archived);

  // All-time completion heatmap (last 12 weeks)
  const heatmap = React.useMemo(() => {
    const weeks: { date: Date; rate: number; key: string }[][] = [];
    const cursor = new Date();
    // align to start of week (Sun)
    cursor.setDate(cursor.getDate() - cursor.getDay());
    for (let w = 0; w < 12; w++) {
      const week: { date: Date; rate: number; key: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(cursor);
        day.setDate(cursor.getDate() - (11 - w) * 7 - (6 - d));
        const k = todayKey(day);
        const rate = completionRate(store, k);
        week.push({ date: day, rate, key: k });
      }
      weeks.push(week);
    }
    return weeks;
  }, [store]);

  const streak = currentStreak(store);
  const longest = longestStreak(store);
  const weeklyAvg = averageCompletion(store, 7);
  const monthlyAvg = averageCompletion(store, 30);
  const todayRate = completionRate(store, todayKey());

  // Per-habit all-time best streak
  const topHabit = React.useMemo(() => {
    let bestHabit = activeHabits[0];
    let best = 0;
    activeHabits.forEach((h) => {
      const s = habitStreak(store, h.id);
      if (s > best) {
        best = s;
        bestHabit = h;
      }
    });
    return { habit: bestHabit, streak: best };
  }, [store, activeHabits]);

  return (
    <div className="flex flex-col gap-6">
      {/* Profile header */}
      <GlassCard variant="strong" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full blur-3xl"
          style={{ background: "rgba(183, 214, 210, 0.18)" }}
        />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#5E8C8A] text-3xl font-semibold text-[#0d1c1c] shadow-[0_18px_40px_-12px_rgba(183,214,210,0.6)]">
              {store.userName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full glass-strong text-[#B7D6D2]">
              <Sparkles size={14} />
            </span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
              Life OS profile
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              {store.userName}
            </h1>
            <p className="mt-1.5 text-sm text-white/65">
              Tracking {activeHabits.length} habits · {streak}-day active streak
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 self-center rounded-full glass-pill px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 sm:self-end"
          >
            <Pencil size={14} />
            Edit profile
          </button>
        </div>
      </GlassCard>

      {/* Profile stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GlassCard flush className="flex items-center gap-4 p-4">
          <ProgressRing
            value={todayRate}
            size={64}
            stroke={6}
            showLabel
            label={`${todayRate}%`}
            glow={false}
          />
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">
              Today
            </p>
            <p className="text-sm font-medium text-white">Completion</p>
          </div>
        </GlassCard>
        <StatBox label="Streak" value={`${streak}d`} icon={Flame} accent="#E8B894" />
        <StatBox
          label="7-day avg"
          value={`${weeklyAvg}%`}
          icon={TrendingUp}
          accent="#B7D6D2"
        />
        <StatBox
          label="Longest"
          value={`${longest}d`}
          icon={Award}
          accent="#8BB0AE"
        />
      </div>

      {/* Heatmap */}
      <GlassCard interactive>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Last 12 weeks
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Activity heatmap
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/55">
            Less
            <div className="flex items-center gap-1">
              {[10, 30, 55, 80, 100].map((v) => (
                <span
                  key={v}
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{
                    background:
                      v === 0
                        ? "rgba(255,255,255,0.05)"
                        : `rgba(183,214,210,${0.18 + v * 0.008})`,
                  }}
                />
              ))}
            </div>
            More
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2 scroll-glass no-scrollbar">
          {heatmap.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => {
                const rate = day.rate;
                const isFuture = day.date.getTime() > Date.now();
                return (
                  <div
                    key={day.key}
                    title={`${day.key}: ${rate}%`}
                    className="h-3.5 w-3.5 rounded-[3px]"
                    style={{
                      background: isFuture
                        ? "transparent"
                        : rate === 0
                        ? "rgba(255,255,255,0.06)"
                        : `rgba(183,214,210,${0.2 + rate * 0.008})`,
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Per-habit summary */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-semibold tracking-tight text-white">
          Habit summary
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {activeHabits.slice(0, 6).map((h, i) => {
            const days = lastNDays(30);
            const sched = days.filter((k) =>
              isHabitScheduled(h, dateFromKey(k)),
            );
            const done = sched.filter((k) => isHabitDone(store, k, h));
            const rate =
              sched.length === 0
                ? 0
                : Math.round((done.length / sched.length) * 100);
            const s = habitStreak(store, h.id);
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard flush className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15"
                        style={{
                          background: `linear-gradient(135deg, ${h.accent}30, ${h.accent}10)`,
                        }}
                      >
                        <Sparkles size={14} style={{ color: h.accent }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {h.name}
                        </p>
                        <p className="text-[11px] text-white/55">
                          {s}-day streak · {rate}% / 30d
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-lg font-semibold"
                        style={{ color: h.accent }}
                      >
                        {rate}%
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
}) {
  return (
    <GlassCard flush interactive className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15"
          style={{
            background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">
            {label}
          </p>
          <p className="text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}
