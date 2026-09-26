"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HabitIcon, ICON_NAMES } from "./habit-icon";
import { useLifeOSStore } from "@/lib/store";
import { type HabitFrequency } from "@/lib/lifeos";
import { cn } from "@/lib/utils";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialHabit?: {
    id: string;
    name: string;
    description?: string;
    icon: string;
    accent: string;
    frequency: HabitFrequency;
    targetPerDay?: number;
    unit?: string;
  };
}

const ACCENT_SWATCHES = [
  "#B7D6D2", "#8BB0AE", "#D5E0DF", "#E8B894",
  "#E08585", "#A8C7E8", "#C7A8E8", "#9DD9A8",
];

const FREQ_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays only" },
  { value: "weekends", label: "Weekends only" },
];

export function AddHabitDialog({
  open,
  onOpenChange,
  initialHabit,
}: AddHabitDialogProps) {
  const store = useLifeOSStore();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState("Sparkles");
  const [accent, setAccent] = React.useState(ACCENT_SWATCHES[0]);
  const [frequency, setFrequency] = React.useState<HabitFrequency>("daily");
  const [isQuantity, setIsQuantity] = React.useState(false);
  const [target, setTarget] = React.useState(8);
  const [unit, setUnit] = React.useState("glasses");

  React.useEffect(() => {
    if (open) {
      setName(initialHabit?.name ?? "");
      setDescription(initialHabit?.description ?? "");
      setIcon(initialHabit?.icon ?? "Sparkles");
      setAccent(initialHabit?.accent ?? ACCENT_SWATCHES[0]);
      setFrequency(initialHabit?.frequency ?? "daily");
      const t = initialHabit?.targetPerDay ?? 1;
      setIsQuantity(t > 1);
      setTarget(t > 1 ? t : 8);
      setUnit(initialHabit?.unit ?? "glasses");
    }
  }, [open, initialHabit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      accent,
      frequency,
      targetPerDay: isQuantity ? target : 1,
      unit: isQuantity ? unit : undefined,
    };
    if (initialHabit) {
      store.updateHabit(initialHabit.id, payload);
    } else {
      store.addHabit(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong glass-highlight max-h-[90vh] overflow-y-auto rounded-3xl border-white/20 p-0 text-white scroll-glass">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {initialHabit ? "Edit habit" : "New habit"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {initialHabit
                ? "Update the details of your habit."
                : "Design a small ritual you want to keep daily."}
            </DialogDescription>
          </DialogHeader>

          {/* Live preview */}
          <div className="glass-soft glass-highlight flex items-center gap-3 rounded-2xl p-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15"
              style={{
                background: `linear-gradient(135deg, ${accent}40, ${accent}10)`,
              }}
            >
              <HabitIcon
                name={icon}
                size={20}
                strokeWidth={1.75}
                style={{ color: accent }}
              />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-medium text-white">
                {name || "Habit name"}
              </p>
              <p className="text-xs text-white/55">
                {description || "Optional description"}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="habit-name" className="text-xs uppercase tracking-wider text-white/65">
              Name
            </Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning meditation"
              autoFocus
              required
              className="glass-pill border-white/15 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="habit-desc" className="text-xs uppercase tracking-wider text-white/65">
              Description
            </Label>
            <Textarea
              id="habit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — a short reminder of why it matters"
              rows={2}
              className="glass-pill resize-none border-white/15 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          {/* Icon picker */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wider text-white/65">
              Icon
            </Label>
            <div className="grid grid-cols-7 gap-1.5">
              {ICON_NAMES.map((n) => {
                const selected = n === icon;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setIcon(n)}
                    aria-label={n}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-xl border transition-all",
                      selected
                        ? "border-transparent"
                        : "border-white/10 bg-white/5 hover:bg-white/10",
                    )}
                    style={
                      selected
                        ? {
                            background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                            boxShadow: `0 8px 18px -6px ${accent}80`,
                          }
                        : undefined
                    }
                  >
                    <HabitIcon
                      name={n}
                      size={16}
                      strokeWidth={1.75}
                      style={{
                        color: selected ? "#0d1c1c" : "rgba(255,255,255,0.7)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wider text-white/65">
              Accent
            </Label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  aria-label={`accent ${c}`}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all",
                    accent === c
                      ? "border-white scale-110"
                      : "border-white/20 hover:border-white/40",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs uppercase tracking-wider text-white/65">
              Frequency
            </Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as HabitFrequency)}
            >
              <SelectTrigger className="glass-pill border-white/15 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong glass-highlight border-white/15 text-white">
                {FREQ_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-white focus:bg-white/10 focus:text-white">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">Quantity tracking</p>
              <p className="text-xs text-white/55">
                Track count instead of yes/no (e.g. 8 glasses of water)
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isQuantity}
              onClick={() => setIsQuantity((v) => !v)}
              className={cn(
                "relative h-7 w-12 rounded-full border border-white/15 transition-all",
                isQuantity ? "bg-[#B7D6D2]" : "bg-white/10",
              )}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "absolute top-1 h-5 w-5 rounded-full bg-white shadow",
                  isQuantity ? "left-6" : "left-1",
                )}
              />
            </button>
          </div>

          {isQuantity && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wider text-white/65">
                  Daily target
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value) || 1)}
                  className="glass-pill border-white/15 bg-white/5 text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs uppercase tracking-wider text-white/65">
                  Unit
                </Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="glasses"
                  className="glass-pill border-white/15 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
            </motion.div>
          )}

          {/* Footer actions */}
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] px-6 py-2.5 text-sm font-medium text-[#0d1c1c] shadow-[0_10px_24px_-8px_rgba(183,214,210,0.6)] transition-all hover:brightness-110"
            >
              {initialHabit ? "Save changes" : "Create habit"}
            </motion.button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
