"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "@/lib/db";
import type { AppSettings, Habit, HabitLog } from "@/lib/types";

export function useHabits(includeArchived = false): Habit[] {
  const habits = useLiveQuery<Habit[], Habit[]>(() => db.habits.orderBy("order").toArray(), [], []);
  return useMemo(
    () => (includeArchived ? habits : habits.filter((h) => !h.archived)),
    [habits, includeArchived]
  );
}

export function useAllLogs(): HabitLog[] {
  return useLiveQuery<HabitLog[], HabitLog[]>(() => db.logs.toArray(), [], []);
}

export function useHabitLogs(habitId: string | null | undefined): HabitLog[] {
  return useLiveQuery<HabitLog[], HabitLog[]>(
    () => (habitId ? db.logs.where("habitId").equals(habitId).toArray() : Promise.resolve([])),
    [habitId],
    []
  );
}

export function useLogsByHabit(): Map<string, HabitLog[]> {
  const logs = useAllLogs();
  return useMemo(() => {
    const map = new Map<string, HabitLog[]>();
    for (const l of logs) {
      if (!map.has(l.habitId)) map.set(l.habitId, []);
      map.get(l.habitId)!.push(l);
    }
    return map;
  }, [logs]);
}

const DEFAULT_SETTINGS: AppSettings = {
  id: "app",
  theme: "system",
  weekStartsOn: 1,
  soundEnabled: true,
  accent: "#6366f1",
};

export function useSettings(): AppSettings {
  const settings = useLiveQuery(() => db.settings.get("app"), [], undefined);
  return settings ?? DEFAULT_SETTINGS;
}
