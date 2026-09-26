"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type GlassVariant = "default" | "strong" | "soft";

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  as?: React.ElementType;
  /** Adds a 1px illuminated top-edge highlight */
  highlight?: boolean;
  /** Optional hover lift */
  interactive?: boolean;
  /** Disable padding override */
  flush?: boolean;
}

const variantClass: Record<GlassVariant, string> = {
  default: "glass",
  strong: "glass-strong",
  soft: "glass-soft",
};

/**
 * Frosted glass surface used as the base layer for every card, panel,
 * and floating element in the Life OS dashboard.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      className,
      variant = "default",
      as: Comp = "div",
      highlight = true,
      interactive = false,
      flush = false,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <Comp
        ref={ref as never}
        className={cn(
          variantClass[variant],
          "rounded-3xl text-white",
          highlight && "glass-highlight",
          interactive &&
            "transition-transform duration-300 will-change-transform hover:-translate-y-0.5",
          !flush && "p-5 md:p-6",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
