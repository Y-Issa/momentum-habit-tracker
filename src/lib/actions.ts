import { nanoid } from "nanoid";
import { db } from "./db";
import type { Frequency, Habit, HabitKind, HabitLog } from "./types";
import { todayKey } from "./date";

export interface HabitDraft {
  name: string;
  emoji: string;
  color: string;
  category: string;
  kind: HabitKind;
  targetCount: number;
  unit: string;
  frequency: Frequency;
  reminderEnabled: boolean;
  reminderTime: string | null;
  freezesAllowedPerMonth: number;
  motivation: string;
}

export async function createHabit(draft: HabitDraft): Promise<Habit> {
  const count = await db.habits.count();
  const habit: Habit = {
    id: nanoid(),
    ...draft,
    archived: false,
    createdAt: Date.now(),
    order: count,
  };
  await db.habits.add(habit);
  return habit;
}

export async function updateHabit(id: string, patch: Partial<HabitDraft>): Promise<void> {
  await db.habits.update(id, patch);
}

export async function archiveHabit(id: string, archived: boolean): Promise<void> {
  await db.habits.update(id, { archived });
}

export async function deleteHabit(id: string): Promise<void> {
  await db.transaction("rw", db.habits, db.logs, db.achievements, async () => {
    await db.habits.delete(id);
    await db.logs.where("habitId").equals(id).delete();
    await db.achievements.where("habitId").equals(id).delete();
  });
}

export async function reorderHabits(orderedIds: string[]): Promise<void> {
  await db.transaction("rw", db.habits, async () => {
    await Promise.all(orderedIds.map((id, index) => db.habits.update(id, { order: index })));
  });
}

/**
 * One log per (habit, day) is enforced by deriving its primary key from both, rather than
 * generating a random id. That makes every write to a given day an upsert of the same row —
 * so two writes racing each other (e.g. rapid taps) can never fork into duplicate rows; the
 * later one simply wins.
 */
function logId(habitId: string, date: string): string {
  return `${habitId}_${date}`;
}

async function getLog(habitId: string, date: string): Promise<HabitLog | undefined> {
  return db.logs.get(logId(habitId, date));
}

export async function toggleCheckHabit(habit: Habit, date: string = todayKey()): Promise<HabitLog> {
  return db.transaction("rw", db.logs, async () => {
    const existing = await getLog(habit.id, date);
    const turningOff = existing?.completed || existing?.frozen;
    const log: HabitLog = {
      id: logId(habit.id, date),
      habitId: habit.id,
      date,
      value: turningOff ? 0 : 1,
      completed: !turningOff,
      frozen: false,
      note: existing?.note ?? null,
      updatedAt: Date.now(),
    };
    await db.logs.put(log);
    return log;
  });
}

/**
 * Reads and writes inside one transaction so rapid clicks each apply on top of the
 * latest committed value instead of racing against a stale value read from render state.
 */
export async function incrementCount(habit: Habit, delta: number, date: string = todayKey()): Promise<HabitLog> {
  return db.transaction("rw", db.logs, async () => {
    const existing = await getLog(habit.id, date);
    const clamped = Math.max(0, (existing?.value ?? 0) + delta);
    const log: HabitLog = {
      id: logId(habit.id, date),
      habitId: habit.id,
      date,
      value: clamped,
      completed: clamped >= habit.targetCount,
      frozen: false,
      note: existing?.note ?? null,
      updatedAt: Date.now(),
    };
    await db.logs.put(log);
    return log;
  });
}

export async function setNote(habit: Habit, date: string, note: string): Promise<void> {
  return db.transaction("rw", db.logs, async () => {
    const existing = await getLog(habit.id, date);
    const log: HabitLog = {
      id: logId(habit.id, date),
      habitId: habit.id,
      date,
      value: existing?.value ?? 0,
      completed: existing?.completed ?? false,
      frozen: existing?.frozen ?? false,
      note: note || null,
      updatedAt: Date.now(),
    };
    await db.logs.put(log);
  });
}

export async function freezeDay(habit: Habit, date: string): Promise<HabitLog> {
  return db.transaction("rw", db.logs, async () => {
    const existing = await getLog(habit.id, date);
    const log: HabitLog = {
      id: logId(habit.id, date),
      habitId: habit.id,
      date,
      value: existing?.value ?? 0,
      completed: false,
      frozen: true,
      note: existing?.note ?? null,
      updatedAt: Date.now(),
    };
    await db.logs.put(log);
    return log;
  });
}

export async function clearDay(habit: Habit, date: string): Promise<void> {
  await db.logs.delete(logId(habit.id, date));
}
