import type { Habit } from "./types";
import { WEEKDAY_LABELS_SHORT } from "./date";

export function frequencyLabel(habit: Habit): string {
  if (habit.frequency.type === "daily") return "Every day";
  if (habit.frequency.type === "weekdays") {
    const days = habit.frequency.days ?? [];
    if (days.length === 7) return "Every day";
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Weekdays";
    if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
    return days.map((d) => WEEKDAY_LABELS_SHORT[d]).join(" ");
  }
  return `${habit.frequency.timesPerWeek ?? 1}x per week`;
}

export function categoryColor(categoryId: string, categories: readonly { id: string; color: string }[]): string {
  return categories.find((c) => c.id === categoryId)?.color ?? "#64748b";
}
