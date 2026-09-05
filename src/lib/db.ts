import Dexie, { type EntityTable } from "dexie";
import type { Habit, HabitLog, UnlockedAchievement, AppSettings } from "./types";

class HabitDatabase extends Dexie {
  habits!: EntityTable<Habit, "id">;
  logs!: EntityTable<HabitLog, "id">;
  achievements!: EntityTable<UnlockedAchievement, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor() {
    super("habit-tracker-db");
    this.version(1).stores({
      habits: "id, order, archived, category",
      logs: "id, habitId, date, [habitId+date]",
      achievements: "id, achievementId, habitId",
      settings: "id",
    });

    // v2: log rows are now keyed as `${habitId}_${date}` so a given habit/day can only ever
    // have one row (upserts replace it instead of racing to create duplicates). This upgrade
    // re-keys existing rows onto that scheme and merges away any duplicates that were created
    // by the old random-id scheme, keeping the most recently updated entry per habit/day.
    this.version(2)
      .stores({
        habits: "id, order, archived, category",
        logs: "id, habitId, date",
        achievements: "id, achievementId, habitId",
        settings: "id",
      })
      .upgrade(async (tx) => {
        const logs = await tx.table<HabitLog>("logs").toArray();
        const byKey = new Map<string, HabitLog>();
        for (const log of logs) {
          const key = `${log.habitId}_${log.date}`;
          const current = byKey.get(key);
          if (!current || log.updatedAt > current.updatedAt) byKey.set(key, log);
        }
        await tx.table("logs").clear();
        const deduped = [...byKey.entries()].map(([key, log]) => ({ ...log, id: key }));
        if (deduped.length) await tx.table("logs").bulkAdd(deduped);
      });
  }
}

export const db = new HabitDatabase();

export async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.settings.get("app");
  if (existing) return existing;
  const defaults: AppSettings = {
    id: "app",
    theme: "system",
    weekStartsOn: 1,
    soundEnabled: true,
    accent: "#6366f1",
  };
  await db.settings.put(defaults);
  return defaults;
}
