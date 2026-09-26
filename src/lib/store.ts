"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FIXED_HABITS,
  TOTAL_HABITS,
  defaultCompletions,
  todayKey,
  addDays,
  isFuture,
  isToday,
  type CompletionMap,
  type HabitCategory,
} from "./lifeos";

interface LifeOSStore {
  /* user */
  userName: string;
  setUserName: (name: string) => void;

  /* completions: YYYY-MM-DD -> { [habitId]: 1 } */
  completions: CompletionMap;
  toggleHabit: (habitId: string, dateKey?: string) => void;
  isCompleted: (dateKey: string, habitId: string) => boolean;
  clearDate: (dateKey: string) => void;
  resetAll: () => void;

  /* date navigation */
  selectedDateKey: string; // YYYY-MM-DD, defaults to today
  setSelectedDate: (d: Date) => void;
  goToday: () => void;
  goPrevDay: () => void;
  goNextDay: () => void;

  /* utilities */
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
}

export const useLifeOSStore = create<LifeOSStore>()(
  persist(
    (set, get) => ({
      userName: "Sinan",
      completions: defaultCompletions(),

      setUserName: (name) => set({ userName: name.trim() || "Friend" }),

      toggleHabit: (habitId, dateKey) => {
        const dk = dateKey ?? get().selectedDateKey;
        // Never allow toggling on a future date
        if (isFuture(new Date(dk))) return;
        const current = get().completions[dk] ?? {};
        const dayMap: Record<string, number> = { ...current };
        if (dayMap[habitId] >= 1) {
          delete dayMap[habitId];
        } else {
          dayMap[habitId] = 1;
        }
        set((s) => ({
          completions: {
            ...s.completions,
            [dk]: dayMap,
          },
        }));
      },

      isCompleted: (dateKey, habitId) =>
        (get().completions[dateKey]?.[habitId] ?? 0) >= 1,

      clearDate: (dateKey) =>
        set((s) => {
          const next = { ...s.completions };
          delete next[dateKey];
          return { completions: next };
        }),

      /**
       * Wipe ALL completion history and snap back to today.
       * The user name is preserved. This is the "start over" action
       * triggered by the Reset button.
       */
      resetAll: () =>
        set({
          completions: {},
          selectedDateKey: todayKey(),
        }),

      selectedDateKey: todayKey(),

      setSelectedDate: (d) => {
        // Block future dates — silently clamp to today
        if (isFuture(d)) {
          set({ selectedDateKey: todayKey() });
          return;
        }
        set({ selectedDateKey: todayKey(d) });
      },

      goToday: () => set({ selectedDateKey: todayKey() }),

      goPrevDay: () => {
        const d = new Date(get().selectedDateKey + "T00:00:00");
        set({ selectedDateKey: todayKey(addDays(d, -1)) });
      },

      goNextDay: () => {
        const d = new Date(get().selectedDateKey + "T00:00:00");
        const next = addDays(d, 1);
        if (isFuture(next)) return; // never navigate into the future
        set({ selectedDateKey: todayKey(next) });
      },

      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "life-os-daily-v1",
      version: 1,
      partialize: (s) => ({
        userName: s.userName,
        completions: s.completions,
        selectedDateKey: s.selectedDateKey,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        // After rehydration, if the persisted selected date is in the future
        // (e.g. user was on yesterday then slept past midnight), snap to today.
        if (state?.selectedDateKey && isFuture(new Date(state.selectedDateKey + "T00:00:00"))) {
          state.selectedDateKey = todayKey();
        }
      },
      // If no persisted data exists, keep the default seed state intact.
      merge: (persisted, current) => {
        if (!persisted) return current;
        const p = persisted as Partial<LifeOSStore>;
        return {
          ...current,
          ...p,
          userName: p.userName ?? current.userName,
          completions: p.completions ?? current.completions,
          selectedDateKey: p.selectedDateKey ?? current.selectedDateKey,
        };
      },
    },
  ),
);

/* Convenience re-exports so other modules don't need to import from two places. */
export {
  FIXED_HABITS,
  TOTAL_HABITS,
  todayKey,
  addDays,
  isFuture,
  isToday,
  type HabitCategory,
};
