"use client";

import { useState } from "react";
import { Snowflake, Check, Trash2 } from "lucide-react";
import type { Habit, HabitLog } from "@/lib/types";
import { formatFriendlyDate, parseDateKey, todayKey } from "@/lib/date";
import { toggleCheckHabit, incrementCount, setNote, freezeDay, clearDay } from "@/lib/actions";
import { freezesUsedThisMonth } from "@/lib/streak";

export default function DayDetailPanel({
  habit,
  date,
  log,
  allLogs,
}: {
  habit: Habit;
  date: string;
  log: HabitLog | undefined;
  allLogs: HabitLog[];
}) {
  const [note, setNoteText] = useState(log?.note ?? "");

  const isToday = date === todayKey();
  const done = log?.completed ?? false;
  const frozen = log?.frozen ?? false;
  const value = log?.value ?? 0;
  const usedFreezes = freezesUsedThisMonth(habit, allLogs);
  const freezesLeft = Math.max(0, habit.freezesAllowedPerMonth - usedFreezes);

  return (
    <div className="rounded-xl border border-border bg-bg-elevated p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{isToday ? "Today" : formatFriendlyDate(parseDateKey(date))}</h4>
        {(done || frozen || value > 0) && (
          <button
            onClick={() => clearDay(habit, date)}
            className="flex items-center gap-1 text-xs text-text-faint hover:text-danger"
          >
            <Trash2 size={12} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {habit.kind === "check" ? (
          <button
            onClick={() => toggleCheckHabit(habit, date)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              done ? "text-white" : "border border-border-strong text-text-muted hover:border-accent"
            }`}
            style={{ backgroundColor: done ? habit.color : "transparent" }}
          >
            <Check size={14} aria-hidden="true" />
            {done ? "Completed" : "Mark done"}
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-border px-2 py-1">
            <button
              onClick={() => incrementCount(habit, -1, date)}
              className="px-1.5 text-text-muted"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="text-sm tabular-nums">
              {value}/{habit.targetCount} {habit.unit}
            </span>
            <button
              onClick={() => incrementCount(habit, 1, date)}
              className="px-1.5 text-text-muted"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={() => freezeDay(habit, date)}
          disabled={freezesLeft <= 0 && !frozen}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            frozen ? "border-accent bg-accent-soft text-accent" : "border-border text-text-muted hover:border-accent"
          }`}
          title={`${freezesLeft} freeze${freezesLeft === 1 ? "" : "s"} left this month`}
        >
          <Snowflake size={14} aria-hidden="true" />
          {frozen ? "Frozen" : `Freeze (${freezesLeft} left)`}
        </button>
      </div>

      <div className="mt-3">
        <label htmlFor="day-note" className="mb-1 block text-xs text-text-faint">
          Note
        </label>
        <textarea
          id="day-note"
          value={note}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={() => setNote(habit, date, note)}
          placeholder="How did it go…"
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-accent"
          maxLength={300}
        />
      </div>
    </div>
  );
}
