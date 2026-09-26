"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "lifeos-install-dismissed";

/**
 * Subtle floating "Install app" banner shown when the browser signals
 * that the PWA is installable (Chrome/Edge/Android). Stays hidden after
 * the user dismisses or installs.
 *
 * iOS Safari does not fire beforeinstallprompt — there the user must use
 * Share → Add to Home Screen, so we don't show this banner there.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect prior dismissal for 7 days
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const ts = parseInt(dismissed, 10);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - ts < sevenDays) return;
      }
    } catch {}

    const onBeforeInstall = (e: Event) => {
      // Prevent the mini-infobar from showing on mobile Chrome
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {}
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "dismissed") {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {}
    }
    setVisible(false);
    setDeferred(null);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 24, x: "-50%" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-24 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md lg:bottom-8 lg:left-[calc(50%+56px)]"
        >
          <div className="glass-strong glass-highlight flex items-center gap-3 rounded-2xl p-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] text-[#0d1c1c]">
              <Download size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Install Life OS</p>
              <p className="text-xs text-white/65">
                Add to your home screen for a faster, full-screen experience.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] px-3.5 py-1.5 text-xs font-semibold text-[#0d1c1c] shadow-[0_8px_18px_-6px_rgba(183,214,210,0.6)] transition-all hover:brightness-110"
            >
              Install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
