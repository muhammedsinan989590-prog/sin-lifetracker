"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { GlassCard } from "./glass-card";
import { ProgressRing } from "./progress-ring";
import { useLifeOSStore } from "@/lib/store";
import {
  TOTAL_HABITS,
  CATEGORIES,
  FIXED_HABITS,
  currentStreak,
  longestStreak,
  averageCompletion,
  totalCompleted,
  snapshotForDate,
  lastNDays,
  dateFromKey,
  weekdayShort,
  todayKey,
} from "@/lib/lifeos";

interface ProgressViewProps {
  onNavigate?: (v: "today" | "history") => void;
}

export function ProgressView({ onNavigate }: ProgressViewProps) {
  const completions = useLifeOSStore((s) => s.completions);

  const today = todayKey();
  const todaySnap = snapshotForDate(completions, today);
  const streak = currentStreak(completions);
  const longest = longestStreak(completions);
  const weeklyAvg = averageCompletion(completions, 7);
  const monthlyAvg = averageCompletion(completions, 30);
  const weeklyCompleted = totalCompleted(completions, 7);
  const monthlyCompleted = totalCompleted(completions, 30);

  // Weekly chart data: last 7 days
  const weeklyData = React.useMemo(() => {
    return lastNDays(7).map((k) => {
      const d = dateFromKey(k);
      const snap = snapshotForDate(completions, k);
      return {
        key: k,
        label: weekdayShort(d),
        percent: snap.percent,
        completed: snap.completed,
        isToday: k === today,
      };
    });
  }, [completions, today]);

  // Monthly chart data: last 30 days
  const monthlyData = React.useMemo(() => {
    return lastNDays(30).map((k) => {
      const d = dateFromKey(k);
      const snap = snapshotForDate(completions, k);
      return {
        key: k,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        percent: snap.percent,
        isToday: k === today,
      };
    });
  }, [completions, today]);

  // Category breakdown for last 30 days
  const categoryData = React.useMemo(() => {
    const days = lastNDays(30);
    return CATEGORIES.map((cat) => {
      const catHabits = FIXED_HABITS.filter((h) => h.category === cat.id);
      const totalPossible = days.length * catHabits.length;
      const done = days.reduce((sum, k) => {
        const dayMap = completions[k] ?? {};
        return sum + catHabits.filter((h) => (dayMap[h.id] ?? 0) >= 1).length;
      }, 0);
      return {
        ...cat,
        completed: done,
        total: totalPossible,
        percent: totalPossible === 0 ? 0 : Math.round((done / totalPossible) * 100),
      };
    });
  }, [completions]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/55">
          Stats
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Progress
        </h1>
        <p className="mt-1.5 text-sm text-white/65">
          Your consistency over time. Small steps, repeated daily.
        </p>
      </div>

      {/* Daily snapshot — most prominent */}
      <GlassCard variant="strong" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl"
          style={{ background: "rgba(183, 214, 210, 0.16)" }}
        />
        <div className="relative flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-center">
          <ProgressRing
            value={todaySnap.percent}
            size={128}
            stroke={10}
            sublabel="Today"
          />
          <div className="flex-1 space-y-2 sm:pl-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">
              Daily
            </p>
            <p className="text-3xl font-semibold tracking-tight text-white">
              {todaySnap.completed}{" "}
              <span className="text-white/45">/ {TOTAL_HABITS} completed</span>
            </p>
            <p className="text-sm text-white/65">
              {todaySnap.percent === 100
                ? "Perfect day — every habit honored."
                : `${TOTAL_HABITS - todaySnap.completed} left to complete today.`}
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("today")}
              className="rounded-full glass-pill px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15"
            >
              Open today →
            </button>
          )}
        </div>
      </GlassCard>

      {/* Weekly summary row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox
          label="7-day avg"
          value={`${weeklyAvg}%`}
          icon={TrendingUp}
          accent="#B7D6D2"
        />
        <StatBox
          label="Habits this week"
          value={String(weeklyCompleted)}
          icon={CheckCircle2}
          accent="#8BB0AE"
        />
        <StatBox
          label="Current streak"
          value={`${streak}d`}
          icon={Flame}
          accent="#E8B894"
        />
        <StatBox
          label="Longest streak"
          value={`${longest}d`}
          icon={Target}
          accent="#9DD9A8"
        />
      </div>

      {/* Weekly bar chart */}
      <GlassCard interactive>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Last 7 days
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Weekly completion
            </h3>
          </div>
          <div className="rounded-full glass-pill px-3 py-1.5 text-xs text-white/75">
            Avg <span className="font-semibold text-[#B7D6D2]">{weeklyAvg}%</span>
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 8, right: 0, left: -16, bottom: 0 }}
              barCategoryGap="22%"
            >
              <defs>
                <linearGradient id="bar-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D5E0DF" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#8BB0AE" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="bar-fill-active" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B7D6D2" stopOpacity="1" />
                  <stop offset="100%" stopColor="#5E8C8A" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(213,224,223,0.7)", fontSize: 11 }}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(213,224,223,0.5)", fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                width={42}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.06)", radius: 8 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as {
                    label: string;
                    percent: number;
                    completed: number;
                  };
                  return (
                    <div className="rounded-2xl glass-strong glass-highlight px-3 py-2 text-xs">
                      <p className="font-medium text-white">{d.label}</p>
                      <p className="mt-0.5 text-[#B7D6D2]">
                        {d.completed} / {TOTAL_HABITS} · {d.percent}%
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="percent" radius={[10, 10, 4, 4]} maxBarSize={36}>
                {weeklyData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={entry.isToday ? "url(#bar-fill-active)" : "url(#bar-fill)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Monthly area chart */}
      <GlassCard interactive>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Last 30 days
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Monthly trend
            </h3>
          </div>
          <div className="rounded-full glass-pill px-3 py-1.5 text-xs text-white/75">
            Avg <span className="font-semibold text-[#B7D6D2]">{monthlyAvg}%</span>
            <span className="mx-2 text-white/30">·</span>
            <span className="text-white/60">{monthlyCompleted} checks</span>
          </div>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="area-stroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B7D6D2" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8BB0AE" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B7D6D2" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#B7D6D2" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(213,224,223,0.55)", fontSize: 10 }}
                interval={5}
                dy={8}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(213,224,223,0.5)", fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                width={42}
              />
              <Tooltip
                cursor={{ stroke: "rgba(183,214,210,0.4)", strokeWidth: 1, strokeDasharray: "4 4" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as { label: string; percent: number };
                  return (
                    <div className="rounded-2xl glass-strong glass-highlight px-3 py-2 text-xs">
                      <p className="font-medium text-white">{d.label}</p>
                      <p className="mt-0.5 text-[#B7D6D2]">{d.percent}% complete</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="percent"
                stroke="url(#area-stroke)"
                strokeWidth={2.5}
                fill="url(#area-fill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#B7D6D2",
                  stroke: "#0d1c1c",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Category breakdown */}
      <GlassCard interactive>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">
            Last 30 days
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            By category
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          {categoryData.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-base">
                {cat.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {cat.name}
                  </span>
                  <span className="text-xs text-white/55">
                    {cat.completed} / {cat.total} · {cat.percent}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${cat.accent}, ${cat.accent}99)` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
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
  icon: React.ComponentType<{ size?: number }>;
  accent: string;
}) {
  return (
    <GlassCard interactive flush className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15"
          style={{ background: `linear-gradient(135deg, ${accent}30, ${accent}10)` }}
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
