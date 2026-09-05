"use client";

import { useMemo } from "react";
import { Sparkles, Flame } from "lucide-react";
import { useHabits, useLogsByHabit, useSettings } from "@/hooks/useHabitData";
import { isDueToday, computeStreak } from "@/lib/streak";
import { todayKey } from "@/lib/date";
import HabitCard from "@/components/habits/HabitCard";
import ProgressRing from "@/components/common/ProgressRing";
import EmptyState from "@/components/common/EmptyState";
import { useUIStore } from "@/lib/store";

export default function TodayPage() {
  const habits = useHabits();
  const logsByHabit = useLogsByHabit();
  const settings = useSettings();
  const openCreateHabit = useUIStore((s) => s.openCreateHabit);
  const date = todayKey();

  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);

  const dueHabits = useMemo(
    () => habits.filter((h) => isDueToday(h, today)).sort((a, b) => a.order - b.order),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [habits]
  );

  const { doneCount, totalCount, bestStreak } = useMemo(() => {
    let done = 0;
    let best = 0;
    for (const h of dueHabits) {
      const logs = logsByHabit.get(h.id) ?? [];
      const log = logs.find((l) => l.date === date);
      if (log?.completed || log?.frozen) done++;
      const { current } = computeStreak(h, logs, settings.weekStartsOn, today);
      best = Math.max(best, current);
    }
    return { doneCount: done, totalCount: dueHabits.length, bestStreak: best };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueHabits, logsByHabit, date, settings.weekStartsOn]);

  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-faint">{dateLabel}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {progress === 100 && totalCount > 0 ? "All done for today! 🎉" : "Today"}
          </h1>
        </div>

        {habits.length > 0 && (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-bg-elevated px-4 py-3">
            <ProgressRing progress={progress} size={56} strokeWidth={6}>
              <span className="text-xs font-bold tabular-nums">{progress}%</span>
            </ProgressRing>
            <div className="text-sm">
              <p className="font-medium tabular-nums">
                {doneCount} / {totalCount} habits
              </p>
              {bestStreak > 0 && (
                <p className="flex items-center gap-1 text-xs text-text-faint">
                  <Flame size={12} className="text-warning" aria-hidden="true" />
                  Best streak today: {bestStreak}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {habits.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={26} aria-hidden="true" />}
          title="No habits yet"
          description="Create your first habit to start building a streak. Small, consistent steps compound into real change."
          action={
            <button
              onClick={openCreateHabit}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
            >
              Create your first habit
            </button>
          }
        />
      ) : dueHabits.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={26} aria-hidden="true" />}
          title="Nothing scheduled today"
          description="Enjoy the rest of your day — your other habits will show up on their scheduled days."
        />
      ) : (
        <div className="space-y-2">
          {dueHabits.map((habit) => {
            const logs = logsByHabit.get(habit.id) ?? [];
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayLog={logs.find((l) => l.date === date)}
                logs={logs}
                weekStartsOn={settings.weekStartsOn}
                date={date}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
