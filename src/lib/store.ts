"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_HABITS,
  type Habit,
  type LifeOSState,
  type CompletionMap,
  todayKey,
  addDays,
  defaultState,
  getCompletion,
} from "./lifeos";

interface LifeOSStore extends LifeOSState {
  /* habit management */
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  archiveHabit: (id: string, archived: boolean) => void;
  /* completions */
  toggleHabit: (habitId: string, dateKey?: string) => void;
  setHabitCount: (habitId: string, count: number, dateKey?: string) => void;
  incrementHabit: (habitId: string, step?: number, dateKey?: string) => void;
  /* profile & misc */
  setUserName: (name: string) => void;
  addFocusMinutes: (minutes: number) => void;
  resetTodayIfStale: () => void;
  /* utilities */
  getCompletion: (dateKey: string, habitId: string) => number;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
}

export const useLifeOSStore = create<LifeOSStore>()(
  persist(
    (set, get) => ({
      ...defaultState(),

      addHabit: (habit) =>
        set((s) => ({
          habits: [
            ...s.habits,
            {
              ...habit,
              id:
                habit.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")
                  .slice(0, 32) +
                "-" +
                Math.random().toString(36).slice(2, 6),
              createdAt: todayKey(),
            },
          ],
        })),

      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      removeHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
        })),

      archiveHabit: (id, archived) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archived } : h,
          ),
        })),

      toggleHabit: (habitId, dateKey = todayKey()) =>
        set((s) => {
          const habit = s.habits.find((h) => h.id === habitId);
          if (!habit) return s;
          const target = habit.targetPerDay ?? 1;
          const current = getCompletion(s, dateKey, habitId);
          const dayMap: Record<string, number> = {
            ...(s.completions[dateKey] ?? {}),
          };
          if (current >= target) {
            delete dayMap[habitId];
          } else {
            dayMap[habitId] = target; // mark full completion
          }
          const completions: CompletionMap = {
            ...s.completions,
            [dateKey]: dayMap,
          };
          return { completions };
        }),

      setHabitCount: (habitId, count, dateKey = todayKey()) =>
        set((s) => {
          const dayMap: Record<string, number> = {
            ...(s.completions[dateKey] ?? {}),
          };
          if (count <= 0) delete dayMap[habitId];
          else dayMap[habitId] = count;
          return {
            completions: { ...s.completions, [dateKey]: dayMap },
          };
        }),

      incrementHabit: (habitId, step = 1, dateKey = todayKey()) =>
        set((s) => {
          const habit = s.habits.find((h) => h.id === habitId);
          if (!habit) return s;
          const target = habit.targetPerDay ?? 1;
          const current = getCompletion(s, dateKey, habitId);
          const next = Math.min(target, current + step);
          const dayMap: Record<string, number> = {
            ...(s.completions[dateKey] ?? {}),
          };
          dayMap[habitId] = next;
          return {
            completions: { ...s.completions, [dateKey]: dayMap },
          };
        }),

      setUserName: (name) => set({ userName: name }),

      addFocusMinutes: (minutes) =>
        set((s) => ({ focusMinutesToday: s.focusMinutesToday + minutes })),

      resetTodayIfStale: () => {
        const today = todayKey();
        if (get().lastResetDate !== today) {
          set({ focusMinutesToday: 0, lastResetDate: today });
        }
      },

      getCompletion: (dateKey, habitId) =>
        getCompletion(get(), dateKey, habitId),

      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "life-os-tracker-v1",
      version: 1,
      partialize: (s) => ({
        habits: s.habits,
        completions: s.completions,
        userName: s.userName,
        focusMinutesToday: s.focusMinutesToday,
        lastResetDate: s.lastResetDate,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        state?.resetTodayIfStale();
      },
      // If no persisted data exists, keep the default seed state intact.
      // Otherwise merge persisted values over current defaults.
      merge: (persisted, current) => {
        if (!persisted) return current;
        const p = persisted as Partial<LifeOSState>;
        return {
          ...current,
          ...p,
          // Fall back to defaults ONLY when the persisted field is missing,
          // not when it's an empty array (user may have intentionally cleared habits).
          habits: p.habits ?? current.habits,
          completions: p.completions ?? current.completions,
          userName: p.userName ?? current.userName,
          focusMinutesToday: p.focusMinutesToday ?? current.focusMinutesToday,
          lastResetDate: p.lastResetDate ?? current.lastResetDate,
        };
      },
    },
  ),
);

/** Convenience hook for the seed date helpers (re-exported to keep imports tight). */
export { todayKey, addDays };
