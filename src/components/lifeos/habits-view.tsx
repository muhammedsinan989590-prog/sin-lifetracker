"use client";

import * as React from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { GlassCard } from "./glass-card";
import { HabitCard } from "./habit-card";
import { Input } from "@/components/ui/input";
import { useLifeOSStore } from "@/lib/store";
import { type Habit, todayKey } from "@/lib/lifeos";

interface HabitsViewProps {
  onOpenAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
}

export function HabitsView({
  onOpenAddHabit,
  onEditHabit,
}: HabitsViewProps) {
  const store = useLifeOSStore();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<
    "all" | "today" | "done" | "todo"
  >("all");

  const habits = store.habits.filter((h) => !h.archived);
  const today = todayKey();

  const filtered = React.useMemo(() => {
    let list = habits;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description?.toLowerCase().includes(q),
      );
    }
    if (filter === "done") {
      list = list.filter((h) => store.getCompletion(today, h.id) > 0);
    } else if (filter === "todo") {
      list = list.filter((h) => store.getCompletion(today, h.id) === 0);
    }
    return list;
  }, [habits, query, filter, store, today]);

  const doneCount = habits.filter(
    (h) => store.getCompletion(today, h.id) > 0,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/55">
            Manage
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Your habits
          </h1>
          <p className="mt-1.5 text-sm text-white/65">
            {doneCount} of {habits.length} completed today. Each tap is a vote
            for who you become.
          </p>
        </div>
        <button
          onClick={onOpenAddHabit}
          className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] px-5 py-2.5 text-sm font-medium text-[#0d1c1c] shadow-[0_10px_24px_-8px_rgba(183,214,210,0.6)] transition-all hover:brightness-110"
        >
          <Plus size={16} strokeWidth={2.2} />
          New habit
        </button>
      </div>

      {/* Search + filters */}
      <GlassCard variant="soft" flush className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search habits…"
            className="glass-pill border-white/15 bg-white/5 pl-9 text-white placeholder:text-white/40"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { v: "all", l: "All" },
              { v: "today", l: "Today" },
              { v: "done", l: "Done" },
              { v: "todo", l: "To do" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setFilter(opt.v)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === opt.v
                  ? "bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] text-[#0d1c1c]"
                  : "glass-pill text-white/70 hover:text-white"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Habits grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((h, i) => (
            <HabitCard
              key={h.id}
              habit={h}
              delay={i * 0.04}
              onEdit={onEditHabit}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="py-12 text-center">
          <p className="text-sm text-white/60">
            No habits match. Try a different filter or create a new one.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
