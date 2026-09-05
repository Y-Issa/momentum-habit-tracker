"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { GripVertical, Archive, ArchiveRestore, Pencil } from "lucide-react";
import type { Habit, HabitLog } from "@/lib/types";
import { computeStreak, completionRateInRange } from "@/lib/streak";
import { lastNDays } from "@/lib/date";
import { frequencyLabel } from "@/lib/habit-helpers";
import StreakBadge from "./StreakBadge";
import { archiveHabit } from "@/lib/actions";
import { useUIStore } from "@/lib/store";

export default function SortableHabitRow({
  habit,
  logs,
  weekStartsOn,
}: {
  habit: Habit;
  logs: HabitLog[];
  weekStartsOn: 0 | 1;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  const openEditHabit = useUIStore((s) => s.openEditHabit);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const { current, longest } = computeStreak(habit, logs, weekStartsOn);
  const days = lastNDays(30);
  const rate = completionRateInRange(habit, logs, days[0], days[days.length - 1]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 py-3 ${
        habit.archived ? "opacity-60" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${habit.name}`}
        className="cursor-grab touch-none text-text-faint hover:text-text-muted active:cursor-grabbing"
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: `${habit.color}22` }}
        aria-hidden="true"
      >
        {habit.emoji}
      </div>

      <Link href={`/habits/${habit.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium hover:underline">{habit.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-faint">
          <span>{frequencyLabel(habit)}</span>
          <StreakBadge streak={current} />
          <span>Best {longest}</span>
          <span className="tabular-nums">{rate}% / 30d</span>
        </div>
      </Link>

      <button
        onClick={() => openEditHabit(habit)}
        aria-label={`Edit ${habit.name}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-faint hover:bg-bg-hover hover:text-text"
      >
        <Pencil size={15} aria-hidden="true" />
      </button>
      <button
        onClick={() => archiveHabit(habit.id, !habit.archived)}
        aria-label={habit.archived ? `Unarchive ${habit.name}` : `Archive ${habit.name}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-faint hover:bg-bg-hover hover:text-text"
      >
        {habit.archived ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
      </button>
    </div>
  );
}
