/**
 * Life OS Daily — fixed-habit checklist logic.
 *
 * The app has exactly 14 fixed habits across 5 categories. There is no
 * add / edit / delete flow. Each habit is a simple boolean checkbox per day.
 */

export type HabitCategory =
  | "discipline"
  | "study"
  | "fitness"
  | "creative"
  | "personal";

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  icon: string; // lucide icon name
}

export interface CategoryMeta {
  id: HabitCategory;
  name: string;
  emoji: string;
  accent: string; // hex
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "discipline", name: "Discipline", emoji: "🧠", accent: "#B7D6D2" },
  { id: "study", name: "Study", emoji: "📚", accent: "#8BB0AE" },
  { id: "fitness", name: "Fitness", emoji: "💪", accent: "#E8B894" },
  { id: "creative", name: "Creative", emoji: "🎨", accent: "#C7A8E8" },
  { id: "personal", name: "Personal", emoji: "🌱", accent: "#9DD9A8" },
];

/**
 * The 14 fixed daily habits. Order within a category is preserved in the UI.
 * "Creative work & Personal project" is split into two habits to reach 14
 * total — this matches the user's stated total of 14 daily habits.
 */
export const FIXED_HABITS: Habit[] = [
  // 🧠 Discipline (5)
  { id: "wake-up", name: "Wake up on time", category: "discipline", icon: "Sunrise" },
  { id: "movers", name: "Follow MOVERS", category: "discipline", icon: "Compass" },
  { id: "no-scroll", name: "Avoid unnecessary scrolling", category: "discipline", icon: "Shield" },
  { id: "read", name: "Read / learn", category: "discipline", icon: "BookOpen" },
  { id: "journal", name: "Journal / self-reflection", category: "discipline", icon: "NotebookPen" },
  // 📚 Study (2)
  { id: "study-session", name: "Daily study session", category: "study", icon: "GraduationCap" },
  { id: "planned-tasks", name: "Complete planned tasks", category: "study", icon: "CheckSquare" },
  // 💪 Fitness (1)
  { id: "exercise", name: "Exercise / workout", category: "fitness", icon: "Dumbbell" },
  // 🎨 Creative (2)
  { id: "creative-work", name: "Creative work", category: "creative", icon: "Palette" },
  { id: "personal-project", name: "Personal project", category: "creative", icon: "Sparkles" },
  // 🌱 Personal (4)
  { id: "water", name: "Drink enough water", category: "personal", icon: "Droplets" },
  { id: "eat", name: "Eat properly", category: "personal", icon: "Apple" },
  { id: "hygiene", name: "Personal hygiene", category: "personal", icon: "Sparkles" },
  { id: "sleep", name: "Sleep on time", category: "personal", icon: "Moon" },
];

export const TOTAL_HABITS = FIXED_HABITS.length; // 14

export function habitsByCategory(cat: HabitCategory): Habit[] {
  return FIXED_HABITS.filter((h) => h.category === cat);
}

export function habitById(id: string): Habit | undefined {
  return FIXED_HABITS.find((h) => h.id === id);
}

/* ------------------------------------------------------------------ */
/* Date helpers                                                         */
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

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isFuture(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return target.getTime() > today.getTime();
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
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

export function weekdayVeryShort(d: Date): string {
  return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
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

export function longDate(d: Date): string {
  return `${weekdayShort(d)}, ${monthShort(d)} ${d.getDate()}, ${d.getFullYear()}`;
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

/* ------------------------------------------------------------------ */
/* Completion map & calculations                                        */
/* ------------------------------------------------------------------ */

/** Map of `YYYY-MM-DD` -> { [habitId]: 1 } where 1 means completed. */
export type CompletionMap = Record<string, Record<string, number>>;

export interface CompletionSnapshot {
  dateKey: string;
  completed: number; // count
  total: number; // always 14
  percent: number; // 0..100
  habitIds: string[]; // ids completed on this date
}

export function getCompletion(
  completions: CompletionMap,
  dateKey: string,
  habitId: string,
): boolean {
  return (completions[dateKey]?.[habitId] ?? 0) >= 1;
}

export function snapshotForDate(
  completions: CompletionMap,
  dateKey: string,
): CompletionSnapshot {
  const day = completions[dateKey] ?? {};
  const habitIds = FIXED_HABITS.filter((h) => (day[h.id] ?? 0) >= 1).map(
    (h) => h.id,
  );
  const completed = habitIds.length;
  return {
    dateKey,
    completed,
    total: TOTAL_HABITS,
    percent: Math.round((completed / TOTAL_HABITS) * 100),
    habitIds,
  };
}

export function dailyPercent(
  completions: CompletionMap,
  dateKey: string,
): number {
  return snapshotForDate(completions, dateKey).percent;
}

/**
 * Current streak — consecutive days (ending today or yesterday) where at
 * least one habit was completed. A "streak day" is any day with >= 1
 * completed habit. Today counts only if at least one habit is checked.
 */
export function currentStreak(completions: CompletionMap): number {
  let streak = 0;
  let cursor = new Date();
  // Allow today to be empty without breaking the streak (count from yesterday)
  if (dailyPercent(completions, todayKey(cursor)) === 0) {
    cursor = addDays(cursor, -1);
  }
  while (dailyPercent(completions, todayKey(cursor)) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
    if (streak > 365 * 3) break;
  }
  return streak;
}

/** Longest streak in recorded history. */
export function longestStreak(completions: CompletionMap): number {
  // Collect all date keys with >= 1 completion, sort ascending.
  const days = Object.keys(completions)
    .filter((k) => dailyPercent(completions, k) > 0)
    .sort();
  if (days.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = dateFromKey(days[i - 1]);
    const curr = dateFromKey(days[i]);
    const diff = Math.round(
      (curr.getTime() - prev.getTime()) / MS_PER_DAY,
    );
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

/** Average completion percentage across the last `n` days (0 if no data). */
export function averageCompletion(
  completions: CompletionMap,
  n: number,
  end: Date = new Date(),
): number {
  const days = lastNDays(n, end);
  const total = days.reduce(
    (sum, k) => sum + dailyPercent(completions, k),
    0,
  );
  return Math.round(total / days.length);
}

/** Total completed habit-checkmarks across the last `n` days. */
export function totalCompleted(
  completions: CompletionMap,
  n: number,
  end: Date = new Date(),
): number {
  const days = lastNDays(n, end);
  return days.reduce(
    (sum, k) => sum + snapshotForDate(completions, k).completed,
    0,
  );
}

/* ------------------------------------------------------------------ */
/* Default state — empty. The tracker starts fresh from today.        */
/* ------------------------------------------------------------------ */

/**
 * Returns an empty completion map. The tracker starts with no history
 * so the user builds their own progress from day one. Use the Reset
 * button in the app to wipe localStorage and return to this state.
 */
export function defaultCompletions(): CompletionMap {
  return {};
}
