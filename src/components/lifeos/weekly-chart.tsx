"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts";
import { GlassCard } from "./glass-card";
import { useLifeOSStore } from "@/lib/store";
import {
  completionRate,
  lastNDays,
  dateFromKey,
  weekdayShort,
  todayKey,
} from "@/lib/lifeos";
import { motion } from "framer-motion";

interface WeeklyChartProps {
  className?: string;
}

/** Rounded bar chart of last 7 days completion %. */
export function WeeklyChart({ className }: WeeklyChartProps) {
  const store = useLifeOSStore();
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  const data = React.useMemo(() => {
    const days = lastNDays(7);
    return days.map((k, i) => {
      const d = dateFromKey(k);
      return {
        key: k,
        label: weekdayShort(d),
        rate: completionRate(store, k),
        isToday: k === todayKey(),
        idx: i,
      };
    });
  }, [store]);

  const avg = Math.round(
    data.reduce((s, d) => s + d.rate, 0) / (data.length || 1),
  );

  return (
    <GlassCard className={className} interactive>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">
            This week
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Daily completion
          </h3>
        </div>
        <div className="rounded-full glass-pill px-3 py-1.5 text-xs text-white/75">
          Avg <span className="ml-1 font-semibold text-[#B7D6D2]">{avg}%</span>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 0, left: -16, bottom: 0 }}
            barCategoryGap="22%"
            onMouseLeave={() => setHoverIdx(null)}
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
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="0"
            />
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
                  rate: number;
                  key: string;
                };
                return (
                  <div className="rounded-2xl glass-strong glass-highlight px-3 py-2 text-xs">
                    <p className="font-medium text-white">{d.label}</p>
                    <p className="mt-0.5 text-[#B7D6D2]">{d.rate}% complete</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="rate"
              radius={[10, 10, 4, 4]}
              maxBarSize={36}
              onMouseEnter={(_, idx) => setHoverIdx(idx)}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={
                    entry.isToday || hoverIdx === entry.idx
                      ? "url(#bar-fill-active)"
                      : "url(#bar-fill)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
