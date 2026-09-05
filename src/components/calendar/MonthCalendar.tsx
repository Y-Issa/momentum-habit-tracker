"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Habit, HabitLog } from "@/lib/types";
import {
  addDays,
  daysInMonthGrid,
  formatMonthYear,
  toDateKey,
  WEEKDAY_LABELS_SHORT,
} from "@/lib/date";
import { indexLogsByDate, isScheduledOn, logIsDone } from "@/lib/streak";

export default function MonthCalendar({
  habit,
  logs,
  weekStartsOn,
  selectedDate,
  onSelectDate,
}: {
  habit: Habit;
  logs: HabitLog[];
  weekStartsOn: 0 | 1;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const byDate = useMemo(() => indexLogsByDate(logs), [logs]);
  const grid = useMemo(() => daysInMonthGrid(monthCursor, weekStartsOn), [monthCursor, weekStartsOn]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKeyStr = toDateKey(today);

  const weekdayLabels = useMemo(() => {
    const arr = [...WEEKDAY_LABELS_SHORT];
    return weekStartsOn === 1 ? [...arr.slice(1), arr[0]] : arr;
  }, [weekStartsOn]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{formatMonthYear(monthCursor)}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setMonthCursor((d) => addDays(d, -1 * new Date(d.getFullYear(), d.getMonth(), 0).getDate()))}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-faint hover:bg-bg-hover hover:text-text"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button
            onClick={() => setMonthCursor((d) => addDays(d, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-faint hover:bg-bg-hover hover:text-text"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-text-faint">
        {weekdayLabels.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((date) => {
          const key = toDateKey(date);
          const inMonth = date.getMonth() === monthCursor.getMonth();
          const log = byDate.get(key);
          const scheduled = isScheduledOn(habit, date);
          const done = logIsDone(log);
          const isFuture = key > todayKeyStr;
          const isSelected = key === selectedDate;

          let bg = "transparent";
          let textColor = inMonth ? "var(--text-muted)" : "var(--text-faint)";
          if (inMonth && scheduled && !isFuture) {
            if (done) {
              bg = log?.frozen ? "var(--accent-soft)" : habit.color;
              textColor = log?.frozen ? "var(--accent)" : "#fff";
            } else {
              bg = "var(--bg-subtle)";
            }
          }

          return (
            <button
              key={key}
              onClick={() => !isFuture && onSelectDate(key)}
              disabled={isFuture}
              aria-label={key}
              aria-pressed={isSelected}
              className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-medium transition-transform disabled:cursor-default ${
                isFuture ? "opacity-30" : "hover:scale-105"
              } ${isSelected ? "ring-2 ring-accent" : ""}`}
              style={{ backgroundColor: bg, color: textColor }}
            >
              {date.getDate()}
              {key === todayKeyStr && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-current" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
