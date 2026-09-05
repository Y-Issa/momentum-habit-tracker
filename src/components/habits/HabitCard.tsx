"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Minus, Plus, MoreHorizontal } from "lucide-react";
import type { Habit, HabitLog } from "@/lib/types";
import { computeStreak } from "@/lib/streak";
import { toggleCheckHabit, incrementCount } from "@/lib/actions";
import { frequencyLabel } from "@/lib/habit-helpers";
import StreakBadge from "./StreakBadge";
import { useUIStore } from "@/lib/store";

export default function HabitCard({
  habit,
  todayLog,
  logs,
  weekStartsOn,
  date,
}: {
  habit: Habit;
  todayLog: HabitLog | undefined;
  logs: HabitLog[];
  weekStartsOn: 0 | 1;
  date: string;
}) {
  const openEditHabit = useUIStore((s) => s.openEditHabit);
  const [menuOpen, setMenuOpen] = useState(false);
  const { current } = computeStreak(habit, logs, weekStartsOn);
  const isDone = todayLog?.completed ?? false;
  const isFrozen = todayLog?.frozen ?? false;
  const value = todayLog?.value ?? 0;

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
        isDone ? "border-border bg-bg-elevated" : "border-border bg-bg-elevated hover:border-border-strong"
      }`}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: `${habit.color}22` }}
        aria-hidden="true"
      >
        {habit.emoji}
      </div>

      <Link href={`/habits/${habit.id}`} className="min-w-0 flex-1 group/link">
        <p className={`truncate text-sm font-medium ${isDone ? "text-text-muted line-through decoration-text-faint" : "text-text"} group-hover/link:underline`}>
          {habit.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-text-faint">
          <span>{frequencyLabel(habit)}</span>
          <StreakBadge streak={current} />
          {isFrozen && <span className="text-accent">❄ frozen</span>}
        </div>
      </Link>

      {habit.kind === "check" ? (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleCheckHabit(habit, date)}
          aria-pressed={isDone}
          aria-label={isDone ? `Mark ${habit.name} as not done` : `Mark ${habit.name} as done`}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isDone
              ? "border-transparent text-white"
              : "border-border-strong text-transparent hover:border-accent"
          }`}
          style={{ backgroundColor: isDone ? habit.color : "transparent" }}
        >
          <Check size={18} strokeWidth={3} aria-hidden="true" />
        </motion.button>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => incrementCount(habit, -1, date)}
            disabled={value <= 0}
            aria-label={`Decrease ${habit.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-subtle text-text-muted hover:bg-bg-hover disabled:opacity-40"
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="w-14 text-center text-sm font-semibold tabular-nums">
            {value}
            <span className="text-text-faint">/{habit.targetCount}</span>
          </span>
          <button
            onClick={() => incrementCount(habit, 1, date)}
            aria-label={`Increase ${habit.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:opacity-90"
            style={{ backgroundColor: habit.color }}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={`More options for ${habit.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-faint opacity-0 transition-opacity hover:bg-bg-hover group-hover:opacity-100 focus-visible:opacity-100"
        >
          <MoreHorizontal size={16} aria-hidden="true" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-lg border border-border bg-bg-elevated py-1 shadow-xl">
              <button
                onClick={() => {
                  openEditHabit(habit);
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-bg-hover"
              >
                Edit habit
              </button>
              <Link
                href={`/habits/${habit.id}`}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-bg-hover"
                onClick={() => setMenuOpen(false)}
              >
                View details
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
