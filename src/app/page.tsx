"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { FloatingNav, ViewTransition, type ViewKey } from "@/components/lifeos/floating-nav";
import { DashboardView } from "@/components/lifeos/dashboard-view";
import { HabitsView } from "@/components/lifeos/habits-view";
import { InsightsView } from "@/components/lifeos/insights-view";
import { ProfileView } from "@/components/lifeos/profile-view";
import { SettingsView } from "@/components/lifeos/settings-view";
import { AddHabitDialog } from "@/components/lifeos/add-habit-dialog";
import { useLifeOSStore } from "@/lib/store";
import { type Habit } from "@/lib/lifeos";

export default function Home() {
  const [view, setView] = React.useState<ViewKey>("dashboard");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<Habit | null>(null);

  // Ensure hydration has happened before rendering data-heavy views.
  // Falls back to a soft loading state if persisted state hasn't rehydrated.
  const hydrated = useLifeOSStore((s) => s.hydrated);
  // Make sure stale daily counters reset on first mount.
  React.useEffect(() => {
    useLifeOSStore.getState().resetTodayIfStale();
  }, []);

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setDialogOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setDialogOpen(true);
  };

  const handleNavigate = (v: ViewKey) => {
    setView(v);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Floating navigation (responsive) */}
      <FloatingNav
        active={view}
        onChange={handleNavigate}
        onAddHabit={handleOpenAdd}
      />

      {/* Main content area — offset for desktop sidebar */}
      <main className="relative mx-auto w-full max-w-[1280px] px-4 pb-32 pt-8 sm:px-6 lg:px-8 lg:pl-[112px] lg:pb-12 lg:pt-10">
        {!hydrated ? (
          <LoadingState />
        ) : (
          <ViewTransition viewKey={view}>
            {view === "dashboard" && (
              <DashboardView
                onOpenAddHabit={handleOpenAdd}
                onEditHabit={handleEditHabit}
                onNavigate={(v) => handleNavigate(v)}
              />
            )}
            {view === "habits" && (
              <HabitsView
                onOpenAddHabit={handleOpenAdd}
                onEditHabit={handleEditHabit}
              />
            )}
            {view === "insights" && <InsightsView />}
            {view === "profile" && (
              <ProfileView onOpenSettings={() => handleNavigate("settings")} />
            )}
            {view === "settings" && (
              <SettingsView
                onNavigateProfile={() => handleNavigate("profile")}
              />
            )}
          </ViewTransition>
        )}
      </main>

      {/* Add / Edit habit dialog */}
      <AddHabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialHabit={editingHabit ?? undefined}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-9 w-48 animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-72 animate-pulse rounded-full bg-white/8" />
      <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="h-56 animate-pulse rounded-3xl bg-white/8" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-white/8" />
          ))}
        </div>
      </div>
    </div>
  );
}
