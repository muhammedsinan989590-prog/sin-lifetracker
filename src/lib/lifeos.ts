/**
 * Life OS — types, defaults, and calculation utilities.
 * Pure logic only — no React, no IO. Safe to use from server + client.
 */

export type HabitFrequency = "daily" | "weekdays" | "weekends";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string; // lucide icon name
  accent: string; // hex color used for icon tint / progress
  frequency: HabitFrequency;
  targetPerDay?: number; // for quantity-based habits (e.g. drink 8 glasses)
  unit?: string;
  createdAt: string; // ISO date
  archived?: boolean;
}

/** Map of `YYYY-MM-DD` -> { [habitId]: number } where the number is the count completed (1 = done). */
export type CompletionMap = Record<string, Record<string, number>>;

export interface LifeOSState {
  habits: Habit[];
  completions: CompletionMap;
  userName: string;
  focusMinutesToday: number;
  lastResetDate: string; // YYYY-MM-DD, used to auto-reset daily focus counter
}

/* ------------------------------------------------------------------ */
/* Date helpers (local-time based to avoid TZ drift)                   */
/* ------------------------------------------------------------------ */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Last `n` days as YYYY-MM-DD keys, oldest first. */
export function lastNDays(n: number, end: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(todayKey(addDays(end, -i)));
  return out;
}

export function weekdayShort(d: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

export function monthShort(d: Date): string {
  return [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][d.getMonth()];
}

export function prettyDate(d: Date = new Date()): string {
  return `${weekdayShort(d)}, ${monthShort(d)} ${d.getDate()}`;
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

/* ------------------------------------------------------------------ */
/* Habit filtering & completion logic                                  */
/* ------------------------------------------------------------------ */
export function isHabitScheduled(habit: Habit, d: Date): boolean {
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekdays") return !isWeekend(d);
  return isWeekend(d);
}

export function getCompletion(
  state: Pick<LifeOSState, "completions">,
  dateKey: string,
  habitId: string,
): number {
  return state.completions[dateKey]?.[habitId] ?? 0;
}

export function isHabitDone(
  state: Pick<LifeOSState, "completions">,
  dateKey: string,
  habit: Habit,
): boolean {
  const count = getCompletion(state, dateKey, habit.id);
  return count >= (habit.targetPerDay ?? 1);
}

export function completionRate(
  state: Pick<LifeOSState, "completions" | "habits">,
  dateKey: string,
): number {
  const day = dateFromKey(dateKey);
  const scheduled = state.habits.filter(
    (h) => !h.archived && isHabitScheduled(h, day),
  );
  if (scheduled.length === 0) return 0;
  const done = scheduled.filter((h) =>
    isHabitDone(state, dateKey, h),
  ).length;
  return Math.round((done / scheduled.length) * 100);
}

/** Current streak (consecutive days up to today with >=1 habit completed). */
export function currentStreak(state: LifeOSState): number {
  let streak = 0;
  let cursor = new Date();
  // Allow today to be incomplete without breaking the streak
  if (completionRate(state, todayKey(cursor)) === 0) {
    cursor = addDays(cursor, -1);
  }
  while (completionRate(state, todayKey(cursor)) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
    if (streak > 365) break;
  }
  return streak;
}

export function longestStreak(state: LifeOSState): number {
  let best = 0;
  let cursor = new Date();
  // look back up to 365 days
  for (let i = 0; i < 365; i++) {
    if (completionRate(state, todayKey(cursor)) > 0) {
      // count consecutive
      let run = 0;
      let c = cursor;
      while (completionRate(state, todayKey(c)) > 0) {
        run += 1;
        c = addDays(c, -1);
        if (run > 365) break;
      }
      best = Math.max(best, run);
      cursor = addDays(cursor, -(run + 1));
    } else {
      cursor = addDays(cursor, -1);
    }
  }
  return best;
}

/** Average completion across the last `n` days. */
export function averageCompletion(
  state: LifeOSState,
  n: number,
  end: Date = new Date(),
): number {
  const days = lastNDays(n, end);
  if (days.length === 0) return 0;
  const total = days.reduce(
    (sum, k) => sum + completionRate(state, k),
    0,
  );
  return Math.round(total / days.length);
}

/** Per-habit streak (consecutive scheduled days completed up to today). */
export function habitStreak(state: LifeOSState, habitId: string): number {
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return 0;
  let streak = 0;
  let cursor = new Date();
  // if today not done yet but still scheduled, allow yesterday
  if (
    isHabitScheduled(habit, cursor) &&
    !isHabitDone(state, todayKey(cursor), habit)
  ) {
    cursor = addDays(cursor, -1);
  }
  // walk back through scheduled days
  while (true) {
    if (!isHabitScheduled(habit, cursor)) {
      cursor = addDays(cursor, -1);
      if (streak > 0 && !isHabitScheduled(habit, cursor)) break;
      continue;
    }
    if (isHabitDone(state, todayKey(cursor), habit)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
    if (streak > 365) break;
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/* Default seed data — gives the dashboard a rich first-run experience */
/* ------------------------------------------------------------------ */
export const DEFAULT_HABITS: Habit[] = [
  {
    id: "morning-meditation",
    name: "Morning Meditation",
    description: "10 minutes of mindful breathing",
    icon: "Sunrise",
    accent: "#B7D6D2",
    frequency: "daily",
    createdAt: todayKey(addDays(new Date(), -90)),
  },
  {
    id: "drink-water",
    name: "Drink Water",
    description: "Stay hydrated through the day",
    icon: "Droplets",
    accent: "#8BB0AE",
    frequency: "daily",
    targetPerDay: 8,
    unit: "glasses",
    createdAt: todayKey(addDays(new Date(), -90)),
  },
  {
    id: "read",
    name: "Read 30 Minutes",
    description: "Books, articles, anything thoughtful",
    icon: "BookOpen",
    accent: "#D5E0DF",
    frequency: "daily",
    createdAt: todayKey(addDays(new Date(), -90)),
  },
  {
    id: "workout",
    name: "Workout",
    description: "Move your body for 30+ minutes",
    icon: "Dumbbell",
    accent: "#E8B894",
    frequency: "weekdays",
    createdAt: todayKey(addDays(new Date(), -90)),
  },
  {
    id: "journal",
    name: "Journal",
    description: "Three lines about your day",
    icon: "NotebookPen",
    accent: "#B7D6D2",
    frequency: "daily",
    createdAt: todayKey(addDays(new Date(), -90)),
  },
  {
    id: "no-sugar",
    name: "No Refined Sugar",
    description: "Skip the sweets for today",
    icon: "Candy",
    accent: "#E08585",
    frequency: "daily",
    createdAt: todayKey(addDays(new Date(), -90)),
  },
  {
    id: "sleep-early",
    name: "Sleep Before 11pm",
    description: "Protect your tomorrow with rest tonight",
    icon: "Moon",
    accent: "#8BB0AE",
    frequency: "daily",
    createdAt: todayKey(addDays(new Date(), -90)),
  },
];

/** Deterministic pseudo-random so the seed history looks realistic and is stable across reloads. */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSeedCompletions(habits: Habit[]): CompletionMap {
  const completions: CompletionMap = {};
  const rng = seededRandom(42);
  const days = lastNDays(60);
  days.forEach((dateKey) => {
    const d = dateFromKey(dateKey);
    completions[dateKey] = {};
    habits.forEach((h) => {
      if (!isHabitScheduled(h, d)) return;
      // recent days are more likely complete, weekends slightly lower for workout
      const daysAgo = Math.floor(
        (Date.now() - d.getTime()) / MS_PER_DAY,
      );
      const recencyBoost = Math.max(0, 1 - daysAgo / 45);
      const baseRate = 0.55 + 0.25 * recencyBoost;
      const adj = h.id === "workout" && isWeekend(d) ? -0.15 : 0;
      const prob = Math.min(0.92, Math.max(0.25, baseRate + adj));
      if (h.targetPerDay && h.targetPerDay > 1) {
        const count = Math.floor(rng() * (h.targetPerDay + 1));
        completions[dateKey][h.id] =
          rng() < prob ? Math.max(count, h.targetPerDay) : count;
      } else {
        if (rng() < prob) completions[dateKey][h.id] = 1;
      }
    });
  });
  return completions;
}

export function defaultState(): LifeOSState {
  const habits = DEFAULT_HABITS;
  const completions = generateSeedCompletions(habits);
  return {
    habits,
    completions,
    userName: "Alex",
    focusMinutesToday: 145,
    lastResetDate: todayKey(),
  };
}

/* ------------------------------------------------------------------ */
/* Icon registry — maps string names to lucide components              */
/* ------------------------------------------------------------------ */
export const HABIT_ICON_NAMES = [
  "Sunrise", "Droplets", "BookOpen", "Dumbbell", "NotebookPen",
  "Candy", "Moon", "Activity", "Footprints", "Apple",
  "Brain", "Coffee", "Heart", "Leaf", "Music", "PencilLine",
  "Bike", "Flower2", "Sparkles", "Star",
] as const;
