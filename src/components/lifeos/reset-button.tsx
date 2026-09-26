"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trash2 } from "lucide-react";
import { useLifeOSStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ResetButtonProps {
  /** Visual style: "soft" = subtle pill (Today header), "danger" = red-tinted (Profile) */
  variant?: "soft" | "danger";
  /** Label text */
  label?: string;
  className?: string;
}

/**
 * Resets the tracker: wipes ALL completion history (preserves user name)
 * and snaps back to today. Asks for confirmation first.
 *
 * The reset is done in-memory via the store action — no page reload
 * needed, so the empty state appears instantly.
 */
export function ResetButton({
  variant = "soft",
  label = "Reset",
  className,
}: ResetButtonProps) {
  const resetAll = useLifeOSStore((s) => s.resetAll);
  const [confirming, setConfirming] = React.useState(false);

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel after 4 seconds if no action taken
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    resetAll();
    setConfirming(false);
  };

  const Icon = variant === "danger" ? Trash2 : RotateCcw;

  return (
    <AnimatePresence mode="wait">
      {confirming ? (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium",
            variant === "danger"
              ? "border border-[#E08585]/40 bg-[#E08585]/15 text-[#E08585]"
              : "border border-[#E08585]/40 bg-[#E08585]/15 text-[#E08585]",
            className,
          )}
        >
          <span className="px-1">Erase all history?</span>
          <button
            type="button"
            onClick={() => {
              resetAll();
              setConfirming(false);
            }}
            className="rounded-full bg-[#E08585] px-2.5 py-0.5 text-white transition-colors hover:bg-[#d07070]"
          >
            Yes, reset
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full px-2 py-0.5 text-[#E08585]/70 transition-colors hover:text-[#E08585]"
          >
            Cancel
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="idle"
          type="button"
          onClick={handleReset}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Reset tracker"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors",
            variant === "danger"
              ? "border border-[#E08585]/30 bg-[#E08585]/10 text-[#E08585] hover:bg-[#E08585]/20"
              : "glass-pill text-white/70 hover:bg-white/15 hover:text-white",
            className,
          )}
        >
          <Icon size={13} strokeWidth={2} />
          {label}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
