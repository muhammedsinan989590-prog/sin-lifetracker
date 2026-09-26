"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { HabitIcon } from "./habit-icon";
import { GlassCard } from "./glass-card";
import { CATEGORIES, FIXED_HABITS, type Habit } from "@/lib/lifeos";
import { useLifeOSStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface HabitRowProps {
  habit: Habit;
  dateKey: string;
  /** When true, the row cannot be toggled (e.g. future date) */
  readOnly?: boolean;
  delay?: number;
}

/**
 * A single habit row: icon + name + animated checkbox.
 * Completion reads from the persisted store; toggling writes back immediately.
 */
export function HabitRow({
  habit,
  dateKey,
  readOnly,
  delay = 0,
}: HabitRowProps) {
  const isCompleted = useLifeOSStore((s) =>
    (s.completions[dateKey]?.[habit.id] ?? 0) >= 1,
  );
  const toggleHabit = useLifeOSStore((s) => s.toggleHabit);

  const category = CATEGORIES.find((c) => c.id === habit.category);
  const accent = category?.accent ?? "#B7D6D2";

  const handleToggle = () => {
    if (readOnly) return;
    toggleHabit(habit.id, dateKey);
  };

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleToggle}
      disabled={readOnly}
      aria-pressed={isCompleted}
      aria-label={isCompleted ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all",
        readOnly ? "cursor-default" : "hover:bg-white/8",
        isCompleted && "bg-white/[0.04]",
      )}
    >
      {/* subtle accent glow when completed */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(90deg, ${accent}1f, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <div
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
          isCompleted
            ? "border-transparent"
            : "border-white/12 bg-white/5",
        )}
        style={
          isCompleted
            ? {
                background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                boxShadow: `0 8px 18px -6px ${accent}80`,
              }
            : undefined
        }
      >
        <HabitIcon
          name={habit.icon}
          size={16}
          strokeWidth={1.75}
          style={{
            color: isCompleted ? "#0d1c1c" : accent,
          }}
        />
      </div>

      {/* Name */}
      <span
        className={cn(
          "relative flex-1 text-[15px] font-medium leading-tight transition-colors",
          isCompleted ? "text-white/55 line-through decoration-white/30" : "text-white",
        )}
      >
        {habit.name}
      </span>

      {/* Checkbox */}
      <div
        className={cn(
          "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
          isCompleted
            ? "border-transparent"
            : "border-white/25 bg-white/5 group-hover:border-white/40",
          readOnly && !isCompleted && "opacity-40",
        )}
        style={
          isCompleted
            ? {
                background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                boxShadow: `0 8px 18px -6px ${accent}80`,
              }
            : undefined
        }
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.span
              key="check"
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className="text-[#0d1c1c]"
            >
              <Check size={16} strokeWidth={3.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

/**
 * A single category section: emoji + name header, then habit rows.
 */
export function CategorySection({
  categoryId,
  dateKey,
  readOnly,
}: {
  categoryId: typeof CATEGORIES[number]["id"];
  dateKey: string;
  readOnly?: boolean;
}) {
  const meta = CATEGORIES.find((c) => c.id === categoryId)!;
  const habits = useLifeOSStore((s) => s.completions[dateKey]);

  const categoryHabits = React.useMemo(
    () => FIXED_HABITS.filter((h) => h.category === categoryId),
    [categoryId],
  );

  const completedCount = categoryHabits.filter(
    (h) => (habits?.[h.id] ?? 0) >= 1,
  ).length;

  return (
    <GlassCard interactive flush className="p-4">
      {/* Section header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.emoji}</span>
          <h3 className="text-sm font-semibold tracking-tight text-white">
            {meta.name}
          </h3>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            color: meta.accent,
            background: `${meta.accent}1f`,
          }}
        >
          {completedCount} / {categoryHabits.length}
        </span>
      </div>
      {/* Habit rows */}
      <div className="flex flex-col gap-0.5">
        {categoryHabits.map((h, i) => (
          <HabitRow
            key={h.id}
            habit={h}
            dateKey={dateKey}
            readOnly={readOnly}
            delay={i * 0.03}
          />
        ))}
      </div>
    </GlassCard>
  );
}
