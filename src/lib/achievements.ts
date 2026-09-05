import type { Habit, HabitLog } from "./types";
import { computeStreak } from "./streak";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", title: "First Step", description: "Complete a habit for the first time", icon: "🌱", tier: "bronze" },
  { id: "streak-3", title: "Warming Up", description: "Reach a 3-day streak on any habit", icon: "🔥", tier: "bronze" },
  { id: "streak-7", title: "Week Warrior", description: "Reach a 7-day streak on any habit", icon: "⚡", tier: "silver" },
  { id: "streak-14", title: "Fortnight Focus", description: "Reach a 14-day streak on any habit", icon: "💫", tier: "silver" },
  { id: "streak-30", title: "Monthly Master", description: "Reach a 30-day streak on any habit", icon: "🏆", tier: "gold" },
  { id: "streak-60", title: "Momentum", description: "Reach a 60-day streak on any habit", icon: "🚀", tier: "gold" },
  { id: "streak-100", title: "Centurion", description: "Reach a 100-day streak on any habit", icon: "💎", tier: "platinum" },
  { id: "streak-365", title: "Year of You", description: "Reach a 365-day streak on any habit", icon: "👑", tier: "platinum" },
  { id: "collector-3", title: "Habit Builder", description: "Track 3 habits at once", icon: "🧱", tier: "bronze" },
  { id: "collector-8", title: "Habit Architect", description: "Track 8 habits at once", icon: "🏗️", tier: "silver" },
  { id: "early-bird", title: "Early Bird", description: "Complete a habit before 8am", icon: "🌅", tier: "bronze" },
  { id: "night-owl", title: "Night Owl", description: "Complete a habit after 10pm", icon: "🦉", tier: "bronze" },
  { id: "perfect-day", title: "Perfect Day", description: "Complete every scheduled habit in one day", icon: "✨", tier: "silver" },
  { id: "perfect-week", title: "Perfect Week", description: "Complete every scheduled habit for 7 days straight", icon: "🌟", tier: "gold" },
  { id: "journalist", title: "Journalist", description: "Add notes to 10 check-ins", icon: "📝", tier: "bronze" },
  { id: "freeze-saver", title: "Freeze Saver", description: "Use a streak freeze to protect a streak", icon: "🧊", tier: "bronze" },
  { id: "comeback", title: "The Comeback", description: "Resume a habit after a 3+ day break", icon: "🔁", tier: "bronze" },
  { id: "century-club", title: "Century Club", description: "Log 100 total completions", icon: "🎖️", tier: "gold" },
];

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

interface EvaluateInput {
  habits: Habit[];
  logsByHabit: Map<string, HabitLog[]>;
  allLogs: HabitLog[];
  weekStartsOn: 0 | 1;
}

/** Returns the set of achievement ids that are currently satisfied. */
export function evaluateAchievements({
  habits,
  logsByHabit,
  allLogs,
  weekStartsOn,
}: EvaluateInput): Set<string> {
  const unlocked = new Set<string>();
  const activeHabits = habits.filter((h) => !h.archived);

  if (allLogs.some((l) => l.completed)) unlocked.add("first-step");
  if (allLogs.filter((l) => l.completed).length >= 100) unlocked.add("century-club");
  if (allLogs.filter((l) => l.note && l.note.trim().length > 0).length >= 10) {
    unlocked.add("journalist");
  }
  if (allLogs.some((l) => l.frozen)) unlocked.add("freeze-saver");

  if (activeHabits.length >= 3) unlocked.add("collector-3");
  if (activeHabits.length >= 8) unlocked.add("collector-8");

  for (const l of allLogs) {
    if (!l.completed) continue;
    const hour = new Date(l.updatedAt).getHours();
    if (hour < 8) unlocked.add("early-bird");
    if (hour >= 22) unlocked.add("night-owl");
  }

  let maxStreak = 0;
  for (const habit of activeHabits) {
    const logs = logsByHabit.get(habit.id) ?? [];
    const { current, longest } = computeStreak(habit, logs, weekStartsOn);
    maxStreak = Math.max(maxStreak, current, longest);

    // Comeback: a completed day preceded by a gap of 3+ scheduled-but-missed days
    const sorted = [...logs].filter((l) => l.completed).sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date + "T00:00:00");
      const cur = new Date(sorted[i].date + "T00:00:00");
      const gapDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      if (gapDays >= 4) unlocked.add("comeback");
    }
  }
  for (const threshold of [3, 7, 14, 30, 60, 100, 365]) {
    if (maxStreak >= threshold) unlocked.add(`streak-${threshold}`);
  }

  // Perfect day / perfect week across all active habits
  const byDate = new Map<string, HabitLog[]>();
  for (const l of allLogs) {
    if (!byDate.has(l.date)) byDate.set(l.date, []);
    byDate.get(l.date)!.push(l);
  }
  const dateKeys = [...byDate.keys()].sort();
  let perfectStreak = 0;
  for (const date of dateKeys) {
    const dayObj = new Date(date + "T00:00:00");
    const scheduled = activeHabits.filter((h) => {
      if (h.createdAt > dayObj.getTime() + 86400000) return false;
      return h.frequency.type === "daily" || h.frequency.type === "weekly"
        ? true
        : (h.frequency.days ?? []).includes(dayObj.getDay());
    });
    if (scheduled.length === 0) continue;
    const logs = byDate.get(date) ?? [];
    const doneIds = new Set(logs.filter((l) => l.completed || l.frozen).map((l) => l.habitId));
    const allDone = scheduled.every((h) => doneIds.has(h.id));
    if (allDone) {
      unlocked.add("perfect-day");
      perfectStreak++;
      if (perfectStreak >= 7) unlocked.add("perfect-week");
    } else {
      perfectStreak = 0;
    }
  }

  return unlocked;
}
