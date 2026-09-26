"use client";

import * as React from "react";
import {
  Sunrise, Droplets, BookOpen, Dumbbell, NotebookPen, Candy, Moon,
  Activity, Footprints, Apple, Brain, Coffee, Heart, Leaf, Music,
  PencilLine, Bike, Flower2, Sparkles, Star, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Sunrise, Droplets, BookOpen, Dumbbell, NotebookPen, Candy, Moon,
  Activity, Footprints, Apple, Brain, Coffee, Heart, Leaf, Music,
  PencilLine, Bike, Flower2, Sparkles, Star,
};

export interface HabitIconProps extends React.SVGAttributes<SVGSVGElement> {
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

export const ICON_NAMES = Object.keys(ICON_MAP);
