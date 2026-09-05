import type { Habit, HabitLog } from "./types";
import { addDays, startOfWeek, toDateKey, todayKey } from "./date";

export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (habit.frequency.type === "daily") return true;
  if (habit.frequency.type === "weekdays") {
    return (habit.frequency.days ?? []).includes(date.getDay());
  }
  // weekly (X times per week): every day is a valid opportunity
  return true;
}

export function logIsDone(log: HabitLog | undefined): boolean {
  if (!log) return false;
  return log.completed || log.frozen;
}

export interface StreakResult {
  current: number;
  longest: number;
  totalCompletions: number;
}

/** Build a quick lookup map of date -> log for a single habit */
export function indexLogsByDate(logs: HabitLog[]): Map<string, HabitLog> {
  const map = new Map<string, HabitLog>();
  for (const l of logs) map.set(l.date, l);
  return map;
}

export function computeStreak(
  habit: Habit,
  logs: HabitLog[],
  weekStartsOn: 0 | 1 = 1,
  today: Date = new Date()
): StreakResult {
  const byDate = indexLogsByDate(logs);
  const totalCompletions = logs.filter((l) => l.completed).length;

  if (habit.frequency.type === "weekly") {
    return computeWeeklyStreak(habit, byDate, weekStartsOn, today, totalCompletions);
  }
  return computeDailyStreak(habit, byDate, today, totalCompletions);
}

function computeDailyStreak(
  habit: Habit,
  byDate: Map<string, HabitLog>,
  today: Date,
  totalCompletions: number
): StreakResult {
  const createdDate = new Date(habit.createdAt);
  createdDate.setHours(0, 0, 0, 0);

  // Current streak: walk backward from today. If today is scheduled but not
  // yet done, skip it (day isn't over) and start counting from yesterday.
  let cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  const todaysLog = byDate.get(toDateKey(cursor));
  if (isScheduledOn(habit, cursor) && !logIsDone(todaysLog)) {
    cursor = addDays(cursor, -1);
  }

  let current = 0;
  while (cursor >= createdDate) {
    if (!isScheduledOn(habit, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    const log = byDate.get(toDateKey(cursor));
    if (logIsDone(log)) {
      current++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  // Longest streak: scan forward across the entire history.
  let longest = 0;
  let running = 0;
  let scan = new Date(createdDate);
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);
  while (scan <= end) {
    if (isScheduledOn(habit, scan)) {
      const log = byDate.get(toDateKey(scan));
      if (logIsDone(log)) {
        running++;
        longest = Math.max(longest, running);
      } else if (toDateKey(scan) !== toDateKey(today)) {
        running = 0;
      }
    }
    scan = addDays(scan, 1);
  }
  longest = Math.max(longest, current);

  return { current, longest, totalCompletions };
}

function computeWeeklyStreak(
  habit: Habit,
  byDate: Map<string, HabitLog>,
  weekStartsOn: 0 | 1,
  today: Date,
  totalCompletions: number
): StreakResult {
  const target = habit.frequency.timesPerWeek ?? 1;
  const createdDate = new Date(habit.createdAt);
  createdDate.setHours(0, 0, 0, 0);

  const countInWeek = (weekStart: Date): number => {
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const log = byDate.get(toDateKey(addDays(weekStart, i)));
      if (logIsDone(log)) n++;
    }
    return n;
  };

  const thisWeekStart = startOfWeek(today, weekStartsOn);
  let current = 0;
  let cursor = new Date(thisWeekStart);
  const thisWeekCount = countInWeek(thisWeekStart);
  if (thisWeekCount < target) {
    // Current (in-progress) week doesn't count yet; look at previous week.
    cursor = addDays(thisWeekStart, -7);
  }
  while (cursor >= createdDate) {
    if (countInWeek(cursor) >= target) {
      current++;
      cursor = addDays(cursor, -7);
    } else {
      break;
    }
  }

  let longest = 0;
  let running = 0;
  let scan = startOfWeek(createdDate, weekStartsOn);
  const lastFullWeek =
    thisWeekCount >= target ? thisWeekStart : addDays(thisWeekStart, -7);
  while (scan <= lastFullWeek) {
    if (countInWeek(scan) >= target) {
      running++;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
    scan = addDays(scan, 7);
  }
  longest = Math.max(longest, current);

  return { current, longest, totalCompletions };
}

/** Percentage of scheduled days completed within [from, to] inclusive */
export function completionRateInRange(
  habit: Habit,
  logs: HabitLog[],
  from: Date,
  to: Date
): number {
  const byDate = indexLogsByDate(logs);
  let scheduled = 0;
  let done = 0;
  let cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    if (isScheduledOn(habit, cursor)) {
      scheduled++;
      if (logIsDone(byDate.get(toDateKey(cursor)))) done++;
    }
    cursor = addDays(cursor, 1);
  }
  if (scheduled === 0) return 0;
  return Math.round((done / scheduled) * 100);
}

export function freezesUsedThisMonth(habit: Habit, logs: HabitLog[], today: Date = new Date()): number {
  const y = today.getFullYear();
  const m = today.getMonth();
  return logs.filter((l) => {
    if (!l.frozen) return false;
    const d = new Date(l.date + "T00:00:00");
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

export function isDueToday(habit: Habit, today: Date = new Date()): boolean {
  return isScheduledOn(habit, today) || habit.frequency.type === "weekly";
}

export { todayKey };
