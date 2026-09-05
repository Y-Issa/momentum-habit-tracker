import type { Habit, HabitLog } from "./types";
import { computeStreak, completionRateInRange } from "./streak";
import { lastNDays, WEEKDAY_LABELS } from "./date";

export interface Insight {
  icon: string;
  text: string;
}

export function buildInsights(
  habits: Habit[],
  logsByHabit: Map<string, HabitLog[]>,
  weekStartsOn: 0 | 1
): Insight[] {
  const active = habits.filter((h) => !h.archived);
  const insights: Insight[] = [];
  if (active.length === 0) return insights;

  let bestHabit: { habit: Habit; current: number } | null = null;
  let mostConsistent: { habit: Habit; rate: number } | null = null;
  const days30 = lastNDays(30);

  for (const habit of active) {
    const logs = logsByHabit.get(habit.id) ?? [];
    const { current } = computeStreak(habit, logs, weekStartsOn);
    if (!bestHabit || current > bestHabit.current) bestHabit = { habit, current };

    const rate = completionRateInRange(habit, logs, days30[0], days30[days30.length - 1]);
    if (!mostConsistent || rate > mostConsistent.rate) mostConsistent = { habit, rate };
  }

  if (bestHabit && bestHabit.current > 0) {
    insights.push({
      icon: bestHabit.habit.emoji,
      text: `${bestHabit.habit.name} is your hottest streak right now — ${bestHabit.current} day${bestHabit.current === 1 ? "" : "s"} strong.`,
    });
  }

  if (mostConsistent && mostConsistent.rate >= 60) {
    insights.push({
      icon: "🎯",
      text: `You're ${mostConsistent.rate}% consistent with ${mostConsistent.habit.name} over the last 30 days.`,
    });
  }

  const weekdayTotals = new Array(7).fill(0);
  for (const logs of logsByHabit.values()) {
    for (const log of logs) {
      if (!log.completed) continue;
      const day = new Date(log.date + "T00:00:00").getDay();
      weekdayTotals[day]++;
    }
  }
  const maxDay = weekdayTotals.indexOf(Math.max(...weekdayTotals));
  if (weekdayTotals[maxDay] > 0) {
    insights.push({
      icon: "📅",
      text: `${WEEKDAY_LABELS[maxDay]} is your most productive day of the week.`,
    });
  }

  const thisWeek = lastNDays(7);
  const lastWeek = lastNDays(14).slice(0, 7);
  let thisWeekCount = 0;
  let lastWeekCount = 0;
  const thisWeekKeys = new Set(thisWeek.map((d) => d.toISOString().slice(0, 10)));
  const lastWeekKeys = new Set(lastWeek.map((d) => d.toISOString().slice(0, 10)));
  for (const logs of logsByHabit.values()) {
    for (const log of logs) {
      if (!log.completed) continue;
      if (thisWeekKeys.has(log.date)) thisWeekCount++;
      else if (lastWeekKeys.has(log.date)) lastWeekCount++;
    }
  }
  if (lastWeekCount > 0) {
    const delta = Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);
    if (Math.abs(delta) >= 10) {
      insights.push({
        icon: delta > 0 ? "📈" : "📉",
        text: `Completions are ${delta > 0 ? "up" : "down"} ${Math.abs(delta)}% vs. last week.`,
      });
    }
  }

  if (active.length >= 3) {
    insights.push({
      icon: "🧩",
      text: `You're actively tracking ${active.length} habits across ${new Set(active.map((h) => h.category)).size} categories.`,
    });
  }

  return insights.slice(0, 4);
}
