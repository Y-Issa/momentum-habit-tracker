"use client";

import { Lock } from "lucide-react";
import type { Achievement } from "@/lib/achievements";

const TIER_STYLES: Record<Achievement["tier"], string> = {
  bronze: "from-[#b45309]/20 to-transparent border-[#b45309]/30",
  silver: "from-[#64748b]/20 to-transparent border-[#64748b]/30",
  gold: "from-[#eab308]/20 to-transparent border-[#eab308]/30",
  platinum: "from-[#8b5cf6]/25 to-transparent border-[#8b5cf6]/40",
};

export default function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
}: {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 ${
        unlocked ? `bg-gradient-to-br ${TIER_STYLES[achievement.tier]}` : "border-border bg-bg-elevated opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
            unlocked ? "bg-bg-elevated" : "bg-bg-subtle grayscale"
          }`}
          aria-hidden="true"
        >
          {unlocked ? achievement.icon : <Lock size={16} className="text-text-faint" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{achievement.title}</p>
          <p className="text-xs text-text-faint">{achievement.description}</p>
          {unlocked && unlockedAt && (
            <p className="mt-1 text-[10px] uppercase tracking-wide text-text-faint">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
