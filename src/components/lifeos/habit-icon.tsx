"use client";

import * as React from "react";
import {
  Sunrise, Compass, Shield, BookOpen, NotebookPen,
  GraduationCap, CheckSquare, Dumbbell, Palette, Sparkles,
  Droplets, Apple, Moon,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Sunrise, Compass, Shield, BookOpen, NotebookPen,
  GraduationCap, CheckSquare, Dumbbell, Palette, Sparkles,
  Droplets, Apple, Moon,
};

export interface HabitIconProps
  extends React.SVGAttributes<SVGSVGElement> {
  name: string;
  size?: number;
  strokeWidth?: number;
}

export function HabitIcon({
  name,
  size = 18,
  strokeWidth = 1.75,
  ...props
}: HabitIconProps) {
  const Comp = ICON_MAP[name] ?? Sparkles;
  return <Comp size={size} strokeWidth={strokeWidth} {...props} />;
}
