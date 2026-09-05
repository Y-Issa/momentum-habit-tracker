import { db } from "./db";
import type { Habit, HabitLog, UnlockedAchievement, AppSettings } from "./types";

interface Backup {
  version: 1;
  exportedAt: number;
  habits: Habit[];
  logs: HabitLog[];
  achievements: UnlockedAchievement[];
  settings: AppSettings | null;
}

export async function exportBackup(): Promise<Backup> {
  const [habits, logs, achievements, settings] = await Promise.all([
    db.habits.toArray(),
    db.logs.toArray(),
    db.achievements.toArray(),
    db.settings.get("app"),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    habits,
    logs,
    achievements,
    settings: settings ?? null,
  };
}

export function downloadBackup(backup: Backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `habit-tracker-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File, mode: "merge" | "replace"): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as Backup;
  if (!data || !Array.isArray(data.habits) || !Array.isArray(data.logs)) {
    throw new Error("This file doesn't look like a valid habit tracker backup.");
  }

  await db.transaction("rw", db.habits, db.logs, db.achievements, db.settings, async () => {
    if (mode === "replace") {
      await Promise.all([
        db.habits.clear(),
        db.logs.clear(),
        db.achievements.clear(),
      ]);
    }
    if (data.habits.length) await db.habits.bulkPut(data.habits);
    if (data.logs.length) await db.logs.bulkPut(data.logs);
    if (data.achievements?.length) await db.achievements.bulkPut(data.achievements);
    if (data.settings) await db.settings.put(data.settings);
  });
}
