"use client";

import { Flame } from "lucide-react";

export default function StreakBadge({ streak, size = "sm" }: { streak: number; size?: "sm" | "lg" }) {
  if (streak <= 0) return null;
  const isHot = streak >= 7;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tabular-nums ${
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1 text-sm"
      } ${isHot ? "bg-warning-soft text-warning" : "bg-bg-subtle text-text-muted"}`}
    >
      <Flame size={size === "sm" ? 11 : 14} className={isHot ? "animate-flame" : ""} aria-hidden="true" />
      {streak}
    </span>
  );
}
