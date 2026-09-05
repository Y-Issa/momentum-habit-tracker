"use client";

import { useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { db } from "@/lib/db";
import { evaluateAchievements, achievementById } from "@/lib/achievements";
import { useHabits, useAllLogs, useLogsByHabit, useSettings } from "./useHabitData";

export function useAchievementWatcher() {
  const habits = useHabits(true);
  const allLogs = useAllLogs();
  const logsByHabit = useLogsByHabit();
  const settings = useSettings();
  const initialized = useRef(false);

  useEffect(() => {
    if (habits.length === 0 && allLogs.length === 0) return;

    let cancelled = false;
    (async () => {
      const unlockedNow = evaluateAchievements({
        habits,
        logsByHabit,
        allLogs,
        weekStartsOn: settings.weekStartsOn,
      });
      const existing = await db.achievements.toArray();
      if (cancelled) return;
      const existingIds = new Set(existing.map((a) => a.achievementId));
      const newlyUnlocked = [...unlockedNow].filter((id) => !existingIds.has(id));

      if (newlyUnlocked.length === 0) {
        initialized.current = true;
        return;
      }

      await db.achievements.bulkPut(
        newlyUnlocked.map((achievementId) => ({
          id: nanoid(),
          achievementId,
          habitId: null,
          unlockedAt: Date.now(),
          seen: !initialized.current, // don't celebrate on first load / import
        }))
      );

      if (initialized.current) {
        for (const id of newlyUnlocked) {
          const achievement = achievementById(id);
          if (!achievement) continue;
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.7 },
            colors: ["#6366f1", "#22c55e", "#f97316", "#ec4899"],
          });
          toast.success(`${achievement.icon} Achievement unlocked: ${achievement.title}`, {
            description: achievement.description,
            duration: 5000,
          });
        }
      }
      initialized.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [habits, allLogs, logsByHabit, settings.weekStartsOn]);
}
