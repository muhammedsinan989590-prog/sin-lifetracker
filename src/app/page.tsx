"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import {
  FloatingNav,
  ViewTransition,
  type ViewKey,
} from "@/components/lifeos/floating-nav";
import { TodayView } from "@/components/lifeos/today-view";
import { ProgressView } from "@/components/lifeos/progress-view";
import { HistoryView } from "@/components/lifeos/history-view";
import { ProfileView } from "@/components/lifeos/profile-view";
import { useLifeOSStore } from "@/lib/store";

export default function Home() {
  const [view, setView] = React.useState<ViewKey>("today");
  const hydrated = useLifeOSStore((s) => s.hydrated);

  const handleNavigate = (v: ViewKey) => {
    setView(v);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen">
      <FloatingNav active={view} onChange={handleNavigate} />

      <main className="relative mx-auto w-full max-w-[1100px] px-4 pb-32 pt-8 sm:px-6 lg:px-8 lg:pl-[112px] lg:pb-12 lg:pt-10">
        {!hydrated ? (
          <LoadingState />
        ) : (
          <ViewTransition viewKey={view}>
            {view === "today" && (
              <TodayView onNavigate={(v) => handleNavigate(v)} />
            )}
            {view === "progress" && (
              <ProgressView onNavigate={(v) => handleNavigate(v)} />
            )}
            {view === "history" && (
              <HistoryView onNavigate={(v) => handleNavigate(v)} />
            )}
            {view === "profile" && <ProfileView />}
          </ViewTransition>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-9 w-48 animate-pulse rounded-full bg-white/10" />
      <div className="h-4 w-72 animate-pulse rounded-full bg-white/8" />
      <div className="h-12 w-full animate-pulse rounded-2xl bg-white/8" />
      <div className="h-56 w-full animate-pulse rounded-3xl bg-white/8" />
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-48 w-full animate-pulse rounded-3xl bg-white/8" />
        ))}
      </div>
    </div>
  );
}
