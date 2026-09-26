"use client";

import * as React from "react";
import { User, Download, Upload, Trash2, Info } from "lucide-react";
import { GlassCard } from "./glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLifeOSStore } from "@/lib/store";

interface SettingsViewProps {
  onNavigateProfile: () => void;
}

export function SettingsView({ onNavigateProfile }: SettingsViewProps) {
  const store = useLifeOSStore();
  const [name, setName] = React.useState(store.userName);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    store.setUserName(name.trim() || "Friend");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleExport = () => {
    const data = {
      habits: store.habits,
      completions: store.completions,
      userName: store.userName,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "This will permanently delete all your habits and completions. Continue?",
      )
    ) {
      try {
        window.localStorage.removeItem("life-os-tracker-v1");
      } catch {}
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/55">
          Preferences
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-white/65">
          Customize your Life OS experience. Changes are saved locally.
        </p>
      </div>

      {/* Profile */}
      <GlassCard interactive>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <User size={18} className="text-[#B7D6D2]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Profile
            </h3>
            <p className="text-xs text-white/55">
              Your name is used in greetings.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label
              htmlFor="user-name"
              className="text-xs uppercase tracking-wider text-white/65"
            >
              Display name
            </Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-pill border-white/15 bg-white/5 text-white placeholder:text-white/40"
              placeholder="Your name"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="rounded-full bg-gradient-to-br from-[#B7D6D2] to-[#8BB0AE] px-6 text-sm font-medium text-[#0d1c1c] shadow-[0_10px_24px_-8px_rgba(183,214,210,0.6)] hover:brightness-110"
            >
              {saved ? "Saved ✓" : "Save"}
            </Button>
            <Button
              variant="ghost"
              onClick={onNavigateProfile}
              className="rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            >
              Back to profile
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Data management */}
      <GlassCard interactive>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
            <Download size={18} className="text-[#B7D6D2]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Data
            </h3>
            <p className="text-xs text-white/55">
              Export your data or reset the tracker.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleExport}
            className="rounded-full glass-pill border border-white/15 bg-white/5 px-5 text-sm font-medium text-white hover:bg-white/10"
          >
            <Download size={14} className="mr-1.5" />
            Export JSON
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
            className="rounded-full border border-[#E08585]/30 bg-[#E08585]/10 px-5 text-sm font-medium text-[#E08585] hover:bg-[#E08585]/20"
          >
            <Trash2 size={14} className="mr-1.5" />
            Reset all data
          </Button>
        </div>
      </GlassCard>

      {/* About */}
      <GlassCard variant="soft">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <Info size={18} className="text-[#B7D6D2]" />
          </div>
          <div className="text-sm text-white/70">
            <p className="font-medium text-white">About Life OS</p>
            <p className="mt-1 leading-relaxed">
              A premium glassmorphism productivity dashboard. Your data is
              stored locally in your browser via the{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                localStorage
              </code>{" "}
              API — nothing leaves your device. No accounts, no servers, no
              tracking.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
