"use client";

import * as React from "react";

/**
 * Registers the service worker on mount. Renders nothing — purely a side-effect.
 * Safe in dev (only registers in production unless explicitly enabled).
 */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Register the SW in both production and dev so the PWA stays
    // installable during development. Next.js dev reuses _next/static chunks
    // so the SW's stale-while-revalidate cache is safe.
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        if (reg.waiting) {
          // Activate the new SW immediately if one is waiting
          reg.waiting.postMessage("SKIP_WAITING");
        }
        // Listen for future updates
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // A new SW has taken over — reload once so the user gets the new shell
              // (silent reload, no UI prompt to keep things minimal)
              window.location.reload();
            }
          });
        });
      } catch (err) {
        // SW registration is best-effort; never crash the app over it.
        console.warn("[Life OS] SW registration failed:", err);
      }
    };

    // Register after window load to avoid competing with first paint
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
