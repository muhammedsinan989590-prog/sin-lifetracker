"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Flame, Target, Award, Clock } from "lucide-react";
import { GlassCard } from "./glass-card";
import { WeeklyChart } from "./weekly-chart";
import { MonthlyChart } from "./monthly-chart";
import { InsightCard } from "./insight-card";
import { ProgressRing } from "./progress-ring";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
} from "recharts";
import { useLifeOSStore } from "@/lib/store";
import {
  averageCompletion,
  completionRate,
  habitStreak,
  longestStreak,
  todayKey,
  lastNDays,
  dateFromKey,
  isHabitScheduled,
} from "@/lib/lifeos";

export function InsightsView() {
  const store = useLifeOSStore();
  const activeHabits = store.habits.filter((h) => !h.archived);

  const weeklyAvg = averageCompletion(store, 7);
  const monthlyAvg = averageCompletion(store, 30);
  const longest = longestStreak(store);

  // Per-habit 30-day completion radar
  const radarData = React.useMemo(() => {
    return activeHabits.slice(0, 6).map((h) => {
      const days = lastNDays(30);
      const scheduledDays = days.filter((k) =>
        isHabitScheduled(h, dateFromKey(k)),
      );
      const doneDays = scheduledDays.filter((k) =>
        store.getCompletion(k, h.id) >= (h.targetPerDay ?? 1),
      );
      const rate =
        scheduledDays.length === 0
          ? 0
          : Math.round((doneDays.length / scheduledDays.length) * 100);
      return { habit: h.name.length > 14 ? h.name.slice(0, 12) + "…" : h.name, rate };
    });
  }, [store, activeHabits]);

  // Per-habit streak ranking
  const ranking = React.useMemo(() => {
    return activeHabits
      .map((h) => ({
        habit: h,
        streak: habitStreak(store, h.id),
        rate: (() => {
          const days = lastNDays(30);
          const sched = days.filter((k) =>
            isHabitScheduled(h, dateFromKey(k)),
          );
          const done = sched.filter((k) =>
            store.getCompletion(k, h.id) >= (h.targetPerDay ?? 1),
          );
          return sched.length === 0
            ? 0
            : Math.round((done.length / sched.length) * 100);
        })(),
      }))
      .sort((a, b) => b.streak - a.streak);
  }, [store, activeHabits]);

  // Day-of-week distribution (last 56 days)
  const weekdayData = React.useMemo(() => {
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
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return labels.map((label, i) => ({
      label,
      rate: counts[i] ? Math.round(sums[i] / counts[i]) : 0,
    }));
  }, [store]);

  const bestDay = weekdayData.reduce(
    (best, d) => (d.rate > best.rate ? d : best),
    weekdayData[0],
  );
  const worstDay = weekdayData.reduce(
    (worst, d) => (d.rate < worst.rate ? d : worst),
    weekdayData[0],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/55">
          Analytics
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Insights
        </h1>
        <p className="mt-1.5 text-sm text-white/65">
          Patterns from your data. Use them to design better days.
        </p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricMini
          label="7-day average"
          value={`${weeklyAvg}%`}
          icon={TrendingUp}
          accent="#B7D6D2"
        />
        <MetricMini
          label="30-day average"
          value={`${monthlyAvg}%`}
          icon={Target}
          accent="#8BB0AE"
        />
        <MetricMini
          label="Longest streak"
          value={`${longest}d`}
          icon={Award}
          accent="#E8B894"
        />
        <MetricMini
          label="Active habits"
          value={String(activeHabits.length)}
          icon={Flame}
          accent="#D5E0DF"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <WeeklyChart />
        <MonthlyChart />
      </div>

      {/* Radar + ranking */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
        <GlassCard interactive>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Habit consistency
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              30-day radar
            </h3>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="78%">
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis
                  dataKey="habit"
                  tick={{ fill: "rgba(213,224,223,0.7)", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="rate"
                  stroke="#B7D6D2"
                  strokeWidth={2}
                  fill="#B7D6D2"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard interactive>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Leaderboard
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Habit streaks
            </h3>
          </div>
          <div className="space-y-2.5">
            {ranking.slice(0, 6).map((r, i) => (
              <motion.div
                key={r.habit.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-2xl glass-pill p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {r.habit.name}
                  </p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${r.rate}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#B7D6D2] to-[#8BB0AE]"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#B7D6D2]">
                    {r.streak}d
                  </p>
                  <p className="text-[10px] text-white/55">{r.rate}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Day-of-week distribution */}
      <GlassCard interactive>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Last 8 weeks
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Day of week performance
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#B7D6D2]" />
              <span className="text-white/60">Best: {bestDay.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/40" />
              <span className="text-white/60">Toughest: {worstDay.label}</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 sm:gap-4">
          {weekdayData.map((d, i) => (
            <motion.div
              key={d.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-32 w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(d.rate, 4)}%` }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full max-w-[36px] rounded-t-xl rounded-b-sm"
                  style={{
                    background:
                      d.rate >= 70
                        ? "linear-gradient(180deg, #B7D6D2, #8BB0AE)"
                        : d.rate >= 40
                        ? "linear-gradient(180deg, rgba(183,214,210,0.7), rgba(139,176,174,0.5))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
                  }}
                />
              </div>
              <span className="text-xs text-white/55">{d.label}</span>
              <span className="text-xs font-semibold text-white">
                {d.rate}%
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Insights cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightCard
          title="Best weekday"
          value={bestDay.label}
          description={`You complete ${bestDay.rate}% of your habits on ${bestDay.label}s. Protect this day from meetings.`}
          icon={Calendar}
          accent="#B7D6D2"
        />
        <InsightCard
          title="Toughest weekday"
          value={worstDay.label}
          description={`Only ${worstDay.rate}% completion on ${worstDay.label}s. Consider scheduling fewer habits that day.`}
          icon={Clock}
          accent="#E8B894"
        />
        <InsightCard
          title="Longest streak ever"
          value={`${longest} days`}
          description="Your personal best. Beats it one day at a time."
          icon={Award}
          accent="#8BB0AE"
        />
      </div>
    </div>
  );
}

function MetricMini({
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
    <GlassCard interactive flush className="p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15"
          style={{
            background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
          }}
        >
          <Icon size={16} className="" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">
            {label}
          </p>
          <p className="text-xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}
