"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Target, Award, TrendingUp, Sparkles, Trash2, Pencil, Check } from "lucide-react";
import { GlassCard } from "./glass-card";
import { ProgressRing } from "./progress-ring";
import { ResetButton } from "./reset-button";
import { Input } from "@/components/ui/input";
import { useLifeOSStore } from "@/lib/store";
import {
  TOTAL_HABITS,
  currentStreak,
  longestStreak,
  averageCompletion,
  totalCompleted,
  snapshotForDate,
  todayKey,
} from "@/lib/lifeos";

export function ProfileView() {
  const userName = useLifeOSStore((s) => s.userName);
  const completions = useLifeOSStore((s) => s.completions);
  const setUserName = useLifeOSStore((s) => s.setUserName);

  const [editingName, setEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(userName);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setNameDraft(userName);
  }, [userName]);

  const streak = currentStreak(completions);
  const longest = longestStreak(completions);
  const weeklyAvg = averageCompletion(completions, 7);
  const monthlyCompleted = totalCompleted(completions, 30);
  const todaySnap = snapshotForDate(completions, todayKey());

  const handleSave = () => {
    setUserName(nameDraft.trim() || "Friend");
    setEditingName(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

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
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full glass-strong text-[#B7D6D2]">
              <Sparkles size={14} />
            </span>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
              Daily discipline
            </p>
            {editingName ? (
              <div className="mt-1 flex items-center gap-2">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  autoFocus
                  className="glass-pill border-white/15 bg-white/5 text-white placeholder:text-white/40"
                  placeholder="Your name"
                />
                <button
                  onClick={handleSave}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] text-[#0d1c1c]"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  {userName}
                </h1>
                <button
                  onClick={() => setEditingName(true)}
                  aria-label="Edit name"
                  className="flex h-9 w-9 items-center justify-center rounded-full glass-pill text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <Pencil size={14} />
                </button>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-[#B7D6D2]"
                  >
                    Saved
                  </motion.span>
                )}
              </div>
            )}
            <p className="mt-1.5 text-sm text-white/65">
              {streak > 0
                ? `${streak}-day active streak · ${todaySnap.completed} / ${TOTAL_HABITS} done today`
                : `${todaySnap.completed} / ${TOTAL_HABITS} done today`}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GlassCard flush className="flex items-center gap-4 p-4">
          <ProgressRing
            value={todaySnap.percent}
            size={64}
            stroke={6}
            showLabel
            label={`${todaySnap.percent}%`}
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

      {/* 30-day total */}
      <GlassCard variant="soft">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Target size={18} className="text-[#B7D6D2]" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Last 30 days
            </p>
            <p className="text-lg font-semibold text-white">
              {monthlyCompleted} habit checks completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-[#B7D6D2]">
              {averageCompletion(completions, 30)}%
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/50">
              avg
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard variant="soft" flush className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E08585]/15">
            <Trash2 size={16} className="text-[#E08585]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Reset all data</h3>
            <p className="text-xs text-white/55">
              Wipes every habit completion and snaps back to today. Your name is kept. Cannot be undone.
            </p>
          </div>
        </div>
        <ResetButton variant="danger" label="Reset everything" />
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
    <GlassCard flush interactive className="p-4">
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
