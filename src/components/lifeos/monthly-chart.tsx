"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { GlassCard } from "./glass-card";
import { useLifeOSStore } from "@/lib/store";
import {
  completionRate,
  lastNDays,
  dateFromKey,
  todayKey,
} from "@/lib/lifeos";

interface MonthlyChartProps {
  className?: string;
  days?: number;
}

/** Smooth area chart of last N days completion %. */
export function MonthlyChart({
  className,
  days = 30,
}: MonthlyChartProps) {
  const store = useLifeOSStore();

  const data = React.useMemo(() => {
    const keys = lastNDays(days);
    return keys.map((k) => {
      const d = dateFromKey(k);
      return {
        key: k,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        rate: completionRate(store, k),
        isToday: k === todayKey(),
      };
    });
  }, [store, days]);

  const trend =
    data.length > 7
      ? Math.round(
          data.slice(-7).reduce((s, d) => s + d.rate, 0) / 7 -
            data.slice(-14, -7).reduce((s, d) => s + d.rate, 0) / 7,
        )
      : 0;

  return (
    <GlassCard className={className} interactive>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/55">
            Last {days} days
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Monthly trend
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full glass-pill px-3 py-1.5 text-xs text-white/75">
            {trend >= 0 ? "▲" : "▼"}{" "}
            <span
              className={
                trend >= 0 ? "text-[#B7D6D2]" : "text-[#E08585]"
              }
            >
              {Math.abs(trend)}%
            </span>{" "}
            vs prev week
          </span>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.07)"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(213,224,223,0.55)", fontSize: 10 }}
              interval={Math.floor(data.length / 6)}
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
              cursor={{
                stroke: "rgba(183,214,210,0.4)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as {
                  label: string;
                  rate: number;
                };
                return (
                  <div className="rounded-2xl glass-strong glass-highlight px-3 py-2 text-xs">
                    <p className="font-medium text-white">{d.label}</p>
                    <p className="mt-0.5 text-[#B7D6D2]">{d.rate}% complete</p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
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
  );
}
