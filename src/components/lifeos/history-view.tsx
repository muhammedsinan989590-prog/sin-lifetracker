"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "./glass-card";
import { useLifeOSStore } from "@/lib/store";
import {
  snapshotForDate,
  todayKey,
  dateFromKey,
  addDays,
  isFuture,
  isToday,
  weekdayVeryShort,
  monthShort,
  MS_PER_DAY,
} from "@/lib/lifeos";
import { cn } from "@/lib/utils";

interface HistoryViewProps {
  onNavigate?: (v: "today") => void;
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HistoryView({ onNavigate }: HistoryViewProps) {
  const completions = useLifeOSStore((s) => s.completions);
  const setSelectedDate = useLifeOSStore((s) => s.setSelectedDate);
  const goToday = useLifeOSStore((s) => s.goToday);

  const [viewMonth, setViewMonth] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Build calendar grid for the month in view
  const grid = React.useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    // Pad to multiple of 7
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const monthLabel = `${monthShort(viewMonth)} ${viewMonth.getFullYear()}`;

  const handleSelectDate = (d: Date) => {
    setSelectedDate(d);
    onNavigate?.("today");
  };

  const goPrevMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  // Last 8 weeks strip (mini heatmap)
  const weekStrip = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Start from Sunday of this week
    const start = addDays(today, -today.getDay());
    const weeks: { date: Date; key: string; percent: number }[][] = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = addDays(start, -w * 7);
      const week: { date: Date; key: string; percent: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const day = addDays(weekStart, d);
        const k = todayKey(day);
        const snap = snapshotForDate(completions, k);
        week.push({ date: day, key: k, percent: snap.percent });
      }
      weeks.push(week);
    }
    return weeks;
  }, [completions]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/55">
          Calendar
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          History
        </h1>
        <p className="mt-1.5 text-sm text-white/65">
          Tap any past day to review its habits. Future dates are read-only.
        </p>
      </div>

      {/* Last 8 weeks strip — quick visual */}
      <GlassCard interactive>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Recent
            </p>
            <h3 className="mt-1 text-base font-semibold text-white">
              Last 8 weeks
            </h3>
          </div>
          <button
            onClick={goToday}
            className="rounded-full glass-pill px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
          >
            Jump to today
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scroll-glass no-scrollbar">
          {/* Weekday header column */}
          <div className="flex flex-col gap-1 pr-1">
            {WEEKDAY_HEADERS.map((d) => (
              <div
                key={d}
                className="flex h-7 w-7 items-center justify-center text-[9px] uppercase tracking-wider text-white/40"
              >
                {weekdayVeryShort(new Date(2024, 0, 7 + WEEKDAY_HEADERS.indexOf(d)))}
              </div>
            ))}
          </div>
          {weekStrip.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => {
                const isFutureDay = isFuture(day.date);
                const isTodayDay = isToday(day.date);
                return (
                  <button
                    key={day.key}
                    onClick={() => !isFutureDay && handleSelectDate(day.date)}
                    disabled={isFutureDay}
                    title={`${day.key} · ${day.percent}%`}
                    className={cn(
                      "h-7 w-7 rounded-md border transition-all",
                      isFutureDay
                        ? "border-transparent bg-transparent cursor-default"
                        : "border-white/5 hover:scale-110 hover:border-white/30",
                      isTodayDay && "ring-1 ring-[#B7D6D2] ring-offset-1 ring-offset-transparent",
                    )}
                    style={{
                      background: isFutureDay
                        ? "transparent"
                        : day.percent === 0
                        ? "rgba(255,255,255,0.06)"
                        : `rgba(183,214,210,${0.2 + day.percent * 0.008})`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Month calendar */}
      <GlassCard interactive>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">
            {monthLabel}
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center rounded-xl glass-pill text-white transition-colors hover:bg-white/15"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              onClick={goNextMonth}
              aria-label="Next month"
              className="flex h-9 w-9 items-center justify-center rounded-xl glass-pill text-white transition-colors hover:bg-white/15"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {WEEKDAY_HEADERS.map((d) => (
            <div
              key={d}
              className="flex h-7 items-center justify-center text-[10px] font-medium uppercase tracking-wider text-white/40"
            >
              {d.slice(0, 2)}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((d, i) => {
            if (!d) {
              return <div key={i} className="aspect-square" />;
            }
            const k = todayKey(d);
            const snap = snapshotForDate(completions, k);
            const isFutureDay = isFuture(d);
            const isTodayDay = isToday(d);
            return (
              <motion.button
                key={k}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.005, 0.2) }}
                whileHover={!isFutureDay ? { scale: 1.06 } : undefined}
                whileTap={!isFutureDay ? { scale: 0.95 } : undefined}
                onClick={() => !isFutureDay && handleSelectDate(d)}
                disabled={isFutureDay}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl border transition-colors",
                  isFutureDay
                    ? "cursor-default border-transparent bg-transparent"
                    : "border-white/8 hover:border-white/25",
                  isTodayDay && "ring-1 ring-[#B7D6D2]",
                )}
                style={{
                  background: isFutureDay
                    ? "transparent"
                    : snap.percent === 0
                    ? "rgba(255,255,255,0.04)"
                    : `rgba(183,214,210,${0.18 + snap.percent * 0.007})`,
                }}
              >
                <span
                  className={cn(
                    "text-xs font-medium",
                    isFutureDay
                      ? "text-white/30"
                      : snap.percent > 0
                      ? "text-[#0d1c1c]"
                      : "text-white/65",
                  )}
                >
                  {d.getDate()}
                </span>
                {snap.percent > 0 && (
                  <span
                    className="mt-0.5 text-[9px] font-semibold text-[#0d1c1c]/70"
                  >
                    {snap.percent}%
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-white/55">
          Less
          {[0, 25, 50, 75, 100].map((v) => (
            <span
              key={v}
              className="h-3 w-3 rounded"
              style={{
                background:
                  v === 0
                    ? "rgba(255,255,255,0.06)"
                    : `rgba(183,214,210,${0.18 + v * 0.007})`,
              }}
            />
          ))}
          More
        </div>
      </GlassCard>
    </div>
  );
}
