"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useLifeOSStore } from "@/lib/store";
import {
  isFuture,
  isToday,
  longDate,
  todayKey,
} from "@/lib/lifeos";
import { cn } from "@/lib/utils";

/**
 * Date navigation bar: ← Prev | Today label | Next →
 * Future dates are blocked — Next is disabled when the selected date is today.
 */
export function DateNavigator() {
  const selectedDateKey = useLifeOSStore((s) => s.selectedDateKey);
  const goPrevDay = useLifeOSStore((s) => s.goPrevDay);
  const goNextDay = useLifeOSStore((s) => s.goNextDay);
  const goToday = useLifeOSStore((s) => s.goToday);

  const selectedDate = new Date(selectedDateKey + "T00:00:00");
  const today = isToday(selectedDate);
  const canGoNext = !isFuture(new Date(selectedDate.getTime() + 86400000));

  return (
    <div className="flex items-center justify-between gap-3">
      <NavArrow
        label="Previous day"
        onClick={goPrevDay}
        icon={ChevronLeft}
      />

      <motion.button
        type="button"
        onClick={goToday}
        whileTap={{ scale: 0.97 }}
        className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl glass-pill px-4 py-2.5 text-center transition-colors hover:bg-white/15"
      >
        <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/55">
          <CalendarDays size={12} strokeWidth={1.75} />
          {today ? "Today" : "Viewing"}
        </span>
        <span className="truncate text-sm font-medium text-white">
          {longDate(selectedDate)}
        </span>
      </motion.button>

      <NavArrow
        label="Next day"
        onClick={goNextDay}
        icon={ChevronRight}
        disabled={!canGoNext}
      />
    </div>
  );
}

function NavArrow({
  label,
  onClick,
  icon: Icon,
  disabled,
}: {
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl glass-pill transition-all",
        disabled
          ? "cursor-not-allowed opacity-30"
          : "text-white hover:bg-white/15",
      )}
    >
      <Icon size={20} strokeWidth={1.75} />
    </motion.button>
  );
}

/**
 * Returns "Today" or "Day in the past" label — useful for showing
 * contextual info next to the habit list.
 */
export function useSelectedDateLabel() {
  const selectedDateKey = useLifeOSStore((s) => s.selectedDateKey);
  const date = new Date(selectedDateKey + "T00:00:00");
  return {
    dateKey: selectedDateKey,
    date,
    isTodayDate: isToday(date),
    isFutureDate: isFuture(date),
    todayKey: todayKey(),
  };
}
