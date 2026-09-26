"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { greeting, prettyDate } from "@/lib/lifeos";
import { useLifeOSStore } from "@/lib/store";

export function WelcomeHeader() {
  const userName = useLifeOSStore((s) => s.userName);
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const hello = now ? greeting(now) : "Hello";
  const dateStr = now ? prettyDate(now) : "";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/55">
          {dateStr}
        </p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {hello},{" "}
          <span className="bg-gradient-to-r from-[#B7D6D2] to-[#D5E0DF] bg-clip-text text-transparent">
            {userName}
          </span>
        </h1>
        <p className="mt-1.5 max-w-md text-sm text-white/65">
          Small steps, consistently taken, become the life you live.
        </p>
      </div>
    </motion.header>
  );
}
