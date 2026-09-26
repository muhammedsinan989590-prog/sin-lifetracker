"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Flame, Target, Clock, TrendingUp, Trophy, Zap, Calendar,
} from "lucide-react";
import { WelcomeHeader } from "./welcome-header";
import { StatCard } from "./stat-card";
import { ProgressRing } from "./progress-ring";
import { WeeklyChart } from "./weekly-chart";
import { MonthlyChart } from "./monthly-chart";
import { InsightCard } from "./insight-card";
import { HabitCard } from "./habit-card";
import { GlassCard } from "./glass-card";
import { useLifeOSStore } from "@/lib/store";
import {
  completionRate,
  currentStreak,
  longestStreak,
  averageCompletion,
  habitStreak,
  isHabitScheduled,
  isHabitDone,
  todayKey,
  dateFromKey,
} from "@/lib/lifeos";

interface DashboardViewProps {
  onOpenAddHabit: () => void;
  onEditHabit: (habit: {
    id: string;
    name: string;
    description?: string;
    icon: string;
    accent: string;
    frequency: "daily" | "weekdays" | "weekends";
    targetPerDay?: number;
    unit?: string;
  }) => void;
  onNavigate: (v: "habits" | "insights" | "profile") => void;
}

export function DashboardView({
  onOpenAddHabit,
  onEditHabit,
  onNavigate,
}: DashboardViewProps) {
  const habits = useLifeOSStore((s) => s.habits);
  const completions = useLifeOSStore((s) => s.completions);
  const focusMin = useLifeOSStore((s) => s.focusMinutesToday);
  const userName = useLifeOSStore((s) => s.userName);
  // Snapshot the full store object once for use in pure helper functions.
  // We rely on habits + completions as the actual memo deps below.
  const store = { habits, completions, userName, focusMinutesToday: focusMin } as const;

  const today = todayKey();
  const todayRate = completionRate(store, today);
  const streak = currentStreak(store);
  const longest = longestStreak(store);
  const weeklyAvg = averageCompletion(store, 7);

  const activeHabits = habits.filter((h) => !h.archived);
  const scheduledToday = activeHabits.filter((h) =>
    isHabitScheduled(h, dateFromKey(today)),
  );
  const doneToday = scheduledToday.filter((h) =>
    isHabitDone(store, today, h),
  ).length;

  // Best day of week (avg completion by weekday for last 56 days)
  const weekdayAvg = (() => {
    const sums = new Array(7).fill(0);
    const counts = new Array(7).fill(0);
    const cursor = new Date();
    for (let i = 0; i < 56; i++) {
      const k = todayKey(cursor);
      const wd = cursor.getDay();
      sums[wd] += completionRate(store, k);
      counts[wd] += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    let bestIdx = 0;
    let bestAvg = 0;
    for (let i = 0; i < 7; i++) {
      if (counts[i] === 0) continue;
      const avg = sums[i] / counts[i];
      if (avg > bestAvg) {
        bestAvg = avg;
        bestIdx = i;
      }
    }
    const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return { name: names[bestIdx], rate: Math.round(bestAvg) };
  })();

  // Most consistent habit (highest per-habit streak)
  const consistency = (() => {
    let bestHabit = activeHabits[0];
    let bestStreak = 0;
    activeHabits.forEach((h) => {
      const s = habitStreak(store, h.id);
      if (s > bestStreak) {
        bestStreak = s;
        bestHabit = h;
      }
    });
    return { habit: bestHabit, streak: bestStreak };
  })();

  // Top 3 habits for today preview
  const todayHabits = scheduledToday.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader />

      {/* Hero row: progress ring + key stats */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Today's progress hero */}
        <GlassCard variant="strong" className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full blur-3xl"
            style={{ background: "rgba(183, 214, 210, 0.18)" }}
          />
          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-center">
            <ProgressRing
              value={todayRate}
              size={156}
              stroke={12}
              sublabel="Today"
            />
            <div className="flex-1 space-y-3 sm:pl-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                  Daily progress
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {doneToday} of {scheduledToday.length} habits done
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {todayRate === 100
                    ? "Perfect day. Every habit honored. 🌙"
                    : todayRate >= 60
                    ? "You're flowing — keep the rhythm going."
                    : todayRate > 0
                    ? "A small start still counts. One more?"
                    : "Tap your first habit to begin today."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onOpenAddHabit}
                  className="rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] px-4 py-2 text-sm font-medium text-[#0d1c1c] shadow-[0_10px_24px_-8px_rgba(183,214,210,0.6)] transition-all hover:brightness-110"
                >
                  + New habit
                </button>
                <button
                  onClick={() => onNavigate("habits")}
                  className="rounded-full glass-pill px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
                >
                  Open habits
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Stat cards grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Active streak"
            value={streak}
            unit="days"
            icon={Flame}
            accent="#E8B894"
            trend={{ delta: streak > 0 ? "Live" : "Start", positive: streak > 0 }}
            delay={0.05}
          />
          <StatCard
            label="Completion (7d)"
            value={weeklyAvg}
            unit="%"
            icon={TrendingUp}
            accent="#B7D6D2"
            trend={{
              delta: weeklyAvg >= 70 ? "Strong" : "Building",
              positive: weeklyAvg >= 70,
            }}
            delay={0.1}
          />
          <StatCard
            label="Focus today"
            value={Math.floor(focusMin / 60) || focusMin}
            unit={focusMin >= 60 ? "h" : "min"}
            icon={Clock}
            accent="#8BB0AE"
            trend={{ delta: "+12%", positive: true }}
            delay={0.15}
          />
          <StatCard
            label="Longest streak"
            value={longest}
            unit="days"
            icon={Trophy}
            accent="#D5E0DF"
            delay={0.2}
          />
        </div>
      </div>

      {/* Today's habits row */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Today&apos;s focus
          </h2>
          <button
            onClick={() => onNavigate("habits")}
            className="text-xs font-medium uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-[#B7D6D2]"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {todayHabits.length > 0 ? (
            todayHabits.map((h, i) => (
              <HabitCard
                key={h.id}
                habit={h}
                delay={i * 0.04}
                onEdit={(habit) => onEditHabit(habit)}
              />
            ))
          ) : (
            <GlassCard className="md:col-span-2">
              <p className="text-sm text-white/60">
                No habits scheduled for today. Create one to get started.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WeeklyChart />
        <MonthlyChart />
      </div>

      {/* Insights row */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-semibold tracking-tight text-white">
          Productivity insights
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InsightCard
            title="Best day of week"
            value={weekdayAvg.name}
            description={`You complete ${weekdayAvg.rate}% of your habits on average on ${weekdayAvg.name}s. Schedule your hardest tasks there.`}
            icon={Calendar}
            accent="#B7D6D2"
            delay={0.05}
          />
          <InsightCard
            title="Most consistent"
            value={consistency.habit?.name ?? "—"}
            description={
              consistency.streak > 0
                ? `${consistency.streak}-day streak — your most disciplined ritual.`
                : "Complete it today to start a streak."
            }
            icon={Zap}
            accent="#E8B894"
            delay={0.1}
          />
          <InsightCard
            title="Monthly average"
            value={`${averageCompletion(store, 30)}%`}
            description="Your 30-day completion rate. Aim for slow, sustainable growth — not perfection."
            icon={Target}
            accent="#8BB0AE"
            delay={0.15}
          />
        </div>
      </div>

      {/* All-time stat strip */}
      <GlassCard variant="soft" className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <CheckCircle2 size={18} className="text-[#B7D6D2]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Total habits tracked
            </p>
            <p className="text-lg font-semibold text-white">
              {activeHabits.length} active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">
              Today
            </p>
            <p className="font-semibold text-white">{todayRate}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">
              This week
            </p>
            <p className="font-semibold text-white">{weeklyAvg}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">
              30 days
            </p>
            <p className="font-semibold text-white">
              {averageCompletion(store, 30)}%
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
