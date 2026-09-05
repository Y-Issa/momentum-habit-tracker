"use client";

import { useMemo, useState } from "react";
import type { Habit, HabitLog } from "@/lib/types";
import { addDays, startOfWeek, toDateKey, formatFriendlyDate, MONTH_LABELS } from "@/lib/date";
import { indexLogsByDate, logIsDone, isScheduledOn } from "@/lib/streak";

const WEEKS = 26;

export default function HeatmapCalendar({
  habit,
  logs,
  weekStartsOn,
}: {
  habit: Habit;
  logs: HabitLog[];
  weekStartsOn: 0 | 1;
}) {
  const byDate = useMemo(() => indexLogsByDate(logs), [logs]);
  const [hovered, setHovered] = useState<string | null>(null);

  const { columns, monthMarkers } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = startOfWeek(today, weekStartsOn);
    const start = addDays(end, -(WEEKS - 1) * 7);
    const cols: Date[][] = [];
    const markers: { index: number; label: string }[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const weekStart = addDays(start, w * 7);
      const col: Date[] = [];
      for (let d = 0; d < 7; d++) col.push(addDays(weekStart, d));
      cols.push(col);
      const m = weekStart.getMonth();
      if (m !== lastMonth) {
        markers.push({ index: w, label: MONTH_LABELS[m].slice(0, 3) });
        lastMonth = m;
      }
    }
    return { columns: cols, monthMarkers: markers };
  }, [weekStartsOn]);

  function intensity(date: Date): number {
    const key = toDateKey(date);
    const log = byDate.get(key);
    if (!isScheduledOn(habit, date)) return -1;
    if (!logIsDone(log)) return 0;
    if (habit.kind === "count" && log) {
      return Math.min(1, log.value / Math.max(1, habit.targetCount));
    }
    return 1;
  }

  function colorFor(level: number): string {
    if (level < 0) return "transparent";
    if (level === 0) return "var(--bg-subtle)";
    const alpha = Math.round(30 + level * 70);
    return `${habit.color}${alpha.toString(16).padStart(2, "0")}`;
  }

  const today = toDateKey(new Date());

  return (
    <div className="overflow-x-auto pb-1">
      <div className="relative mb-1 h-4 min-w-max" style={{ width: WEEKS * 14 }}>
        {monthMarkers.map((m) => (
          <span
            key={m.index}
            className="absolute text-[10px] text-text-faint"
            style={{ left: m.index * 14 }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex gap-[3px] min-w-max">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((date) => {
              const key = toDateKey(date);
              const level = intensity(date);
              const isFuture = key > today;
              return (
                <div
                  key={key}
                  role="img"
                  aria-label={`${formatFriendlyDate(date)}: ${level < 0 ? "not scheduled" : level > 0 ? "done" : "missed"}`}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered((h) => (h === key ? null : h))}
                  className="h-[11px] w-[11px] rounded-[2px]"
                  style={{
                    backgroundColor: isFuture ? "transparent" : colorFor(level),
                    outline: hovered === key ? "1.5px solid var(--text-faint)" : undefined,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {hovered && (
        <p className="mt-1.5 text-xs text-text-faint">{formatFriendlyDate(new Date(hovered + "T00:00:00"))}</p>
      )}
    </div>
  );
}
