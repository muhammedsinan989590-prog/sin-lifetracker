"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, BarChart3, Calendar, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewKey = "today" | "progress" | "history" | "profile";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: "today", label: "Today", icon: CheckCircle2 },
  { key: "progress", label: "Progress", icon: BarChart3 },
  { key: "history", label: "History", icon: Calendar },
  { key: "profile", label: "Profile", icon: User },
];

interface FloatingNavProps {
  active: ViewKey;
  onChange: (v: ViewKey) => void;
}

/** Desktop floating sidebar (lg+). */
export function DesktopNav({ active, onChange }: FloatingNavProps) {
  return (
    <aside className="pointer-events-none fixed left-0 top-0 z-30 hidden h-full w-[88px] items-center justify-center px-3 lg:flex">
      <nav className="glass-strong glass-highlight pointer-events-auto flex w-full flex-col items-center gap-1 rounded-[28px] py-5">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white shadow-inner">
          <span className="text-sm font-semibold tracking-tight">S</span>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                isActive ? "text-[#0d1c1c]" : "text-white/70 hover:text-white",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] shadow-[0_8px_24px_-6px_rgba(183,214,210,0.6)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={20} strokeWidth={1.75} className="relative z-10" />
              <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 whitespace-nowrap rounded-full glass-pill px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

/** Mobile / tablet floating bottom navigation. */
export function MobileNav({ active, onChange }: FloatingNavProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <nav className="glass-strong glass-highlight pointer-events-auto flex items-center gap-1 rounded-full px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                isActive ? "text-[#0d1c1c]" : "text-white/75",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill-mobile"
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon size={20} strokeWidth={1.75} className="relative z-10" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function FloatingNav(props: FloatingNavProps) {
  return (
    <>
      <DesktopNav {...props} />
      <MobileNav {...props} />
    </>
  );
}

/** Wraps view content with a soft fade/slide animation between views. */
export function ViewTransition({
  viewKey,
  children,
}: {
  viewKey: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
