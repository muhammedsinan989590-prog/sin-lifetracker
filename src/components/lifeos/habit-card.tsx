"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Minus, Plus } from "lucide-react";
import { GlassCard } from "./glass-card";
import { HabitIcon } from "./habit-icon";
import {
  type Habit,
  type LifeOSState,
  isHabitDone,
  isHabitScheduled,
  habitStreak,
  todayKey,
  dateFromKey,
} from "@/lib/lifeos";
import { useLifeOSStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  dateKey?: string;
  /** Show last 7 day mini progress strip */
  showHistory?: boolean;
  delay?: number;
  onEdit?: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  dateKey,
  showHistory = true,
  delay = 0,
  onEdit,
}: HabitCardProps) {
  const store = useLifeOSStore();
  const resolvedDateKey = dateKey ?? todayKey();
  const day = dateFromKey(resolvedDateKey);
  const scheduled = isHabitScheduled(habit, day);
  const isQuantity = (habit.targetPerDay ?? 1) > 1;
  const count = store.getCompletion(resolvedDateKey, habit.id);
  const target = habit.targetPerDay ?? 1;
  const done = isHabitDone(store as LifeOSState, resolvedDateKey, habit);
  const streak = habitStreak(store as LifeOSState, habit.id);

  const handleToggle = () => {
    if (!scheduled) return;
    if (isQuantity) {
      if (done) {
        store.setHabitCount(habit.id, 0, resolvedDateKey);
      } else {
        store.setHabitCount(habit.id, target, resolvedDateKey);
      }
    } else {
      store.toggleHabit(habit.id, resolvedDateKey);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard
        interactive
        flush
        className={cn(
          "group relative overflow-hidden p-5",
          !scheduled && "opacity-55",
        )}
      >
        {/* subtle accent stripe on completion */}
        <AnimatePresence>
          {done && (
            <motion.div
              key="glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(420px 100px at 0% 0%, ${habit.accent}26, transparent 65%)`,
              }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-center gap-4">
          {/* Icon */}
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",
              done
                ? "border-transparent"
                : "border-white/15 bg-white/5",
            )}
            style={
              done
                ? {
                    background: `linear-gradient(135deg, ${habit.accent}, ${habit.accent}99)`,
                    boxShadow: `0 10px 24px -8px ${habit.accent}80`,
                  }
                : undefined
            }
          >
            <HabitIcon
              name={habit.icon}
              size={20}
              strokeWidth={1.75}
              className={done ? "text-[#0d1c1c]" : "text-white"}
              style={done ? { color: "#0d1c1c" } : { color: habit.accent }}
            />
          </div>

          {/* Text */}
          <button
            type="button"
            onClick={() => onEdit?.(habit)}
            className="flex flex-1 flex-col items-start text-left"
          >
            <span className="text-[15px] font-medium leading-tight text-white">
              {habit.name}
            </span>
            {habit.description && (
              <span className="mt-0.5 line-clamp-1 text-xs text-white/55">
                {habit.description}
              </span>
            )}
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-white/55">
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[#E8B894]">
                  <Flame size={11} strokeWidth={2} />
                  {streak} day{streak > 1 ? "s" : ""}
                </span>
              )}
              {isQuantity && (
                <span className="rounded-full bg-white/8 px-2 py-0.5">
                  {count}/{target} {habit.unit}
                </span>
              )}
              {!scheduled && (
                <span className="rounded-full bg-white/8 px-2 py-0.5">
                  Not scheduled
                </span>
              )}
            </div>
          </button>

          {/* Action */}
          {isQuantity ? (
            <div className="flex items-center gap-1.5">
              <QtyButton
                ariaLabel="decrement"
                onClick={() =>
                  store.incrementHabit(habit.id, -1, resolvedDateKey)
                }
                disabled={!scheduled || count === 0}
              >
                <Minus size={14} />
              </QtyButton>
              <QtyButton
                ariaLabel="increment"
                onClick={() =>
                  store.incrementHabit(habit.id, 1, resolvedDateKey)
                }
                disabled={!scheduled || done}
              >
                <Plus size={14} />
              </QtyButton>
            </div>
          ) : (
            <motion.button
              type="button"
              onClick={handleToggle}
              whileTap={{ scale: 0.9 }}
              disabled={!scheduled}
              aria-pressed={done}
              aria-label={done ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300",
                done
                  ? "border-transparent"
                  : "border-white/25 bg-white/5 hover:border-white/40",
                !scheduled && "cursor-not-allowed opacity-40",
              )}
              style={
                done
                  ? {
                      background: `linear-gradient(135deg, ${habit.accent}, ${habit.accent}99)`,
                      boxShadow: `0 10px 24px -8px ${habit.accent}80`,
                    }
                  : undefined
              }
            >
              <AnimatePresence>
                {done && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                    className="text-[#0d1c1c]"
                  >
                    <Check size={18} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>

        {/* Last 7 days history strip */}
        {showHistory && (
          <div className="mt-4 flex items-center gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              const dk = todayKey(d);
              const wasScheduled = isHabitScheduled(habit, d);
              const wasDone = isHabitDone(
                store as LifeOSState,
                dk,
                habit,
              );
              const isToday = dk === todayKey();
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      "h-7 w-full rounded-md border transition-all",
                      wasDone
                        ? "border-transparent"
                        : wasScheduled
                        ? "border-white/10 bg-white/5"
                        : "border-white/5 bg-white/[0.02]",
                    )}
                    style={
                      wasDone
                        ? {
                            background: `linear-gradient(180deg, ${habit.accent}cc, ${habit.accent}88)`,
                          }
                        : undefined
                    }
                  >
                    {isQuantity && wasDone && (
                      <div className="flex h-full items-center justify-center text-[9px] font-semibold text-[#0d1c1c]">
                        {store.getCompletion(dk, habit.id)}
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] uppercase tracking-wider",
                      isToday ? "text-white" : "text-white/40",
                    )}
                  >
                    {["S", "M", "T", "W", "T", "F", "S"][d.getDay()]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function QtyButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:bg-white/15 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
