"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, MessageSquare } from "lucide-react";
import { useHabits, useHabitLogs, useSettings } from "@/hooks/useHabitData";
import { computeStreak, completionRateInRange } from "@/lib/streak";
import { lastNDays, formatFriendlyDate, parseDateKey, todayKey } from "@/lib/date";
import { frequencyLabel } from "@/lib/habit-helpers";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import HeatmapCalendar from "@/components/calendar/HeatmapCalendar";
import CompletionTrendChart from "@/components/charts/CompletionTrendChart";
import DayDetailPanel from "@/components/habits/DayDetailPanel";
import { useUIStore } from "@/lib/store";

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const habits = useHabits(true);
  const habit = habits.find((h) => h.id === id);
  const logs = useHabitLogs(id);
  const settings = useSettings();
  const openEditHabit = useUIStore((s) => s.openEditHabit);
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const stats = useMemo(() => {
    if (!habit) return null;
    const { current, longest, totalCompletions } = computeStreak(habit, logs, settings.weekStartsOn);
    const days30 = lastNDays(30);
    const rate30 = completionRateInRange(habit, logs, days30[0], days30[days30.length - 1]);
    return { current, longest, totalCompletions, rate30 };
  }, [habit, logs, settings.weekStartsOn]);

  const notes = useMemo(
    () =>
      [...logs]
        .filter((l) => l.note && l.note.trim())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 20),
    [logs]
  );

  if (habits.length > 0 && !habit) {
    notFound();
  }
  if (!habit || !stats) {
    return <div className="text-sm text-text-faint">Loading…</div>;
  }

  const selectedLog = logs.find((l) => l.date === selectedDate);

  return (
    <div className="space-y-6">
      <Link href="/habits" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={15} aria-hidden="true" />
        All habits
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: `${habit.color}22` }}
            aria-hidden="true"
          >
            {habit.emoji}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{habit.name}</h1>
            <p className="text-sm text-text-muted">{frequencyLabel(habit)}</p>
            {habit.motivation && (
              <p className="mt-1 max-w-md text-sm italic text-text-faint">&ldquo;{habit.motivation}&rdquo;</p>
            )}
          </div>
        </div>
        <button
          onClick={() => openEditHabit(habit)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-muted hover:bg-bg-hover"
        >
          <Pencil size={14} aria-hidden="true" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Current streak" value={stats.current} suffix="days" highlight />
        <StatCard label="Longest streak" value={stats.longest} suffix="days" />
        <StatCard label="Last 30 days" value={stats.rate30} suffix="%" />
        <StatCard label="Total completions" value={stats.totalCompletions} suffix="" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <MonthCalendar
              habit={habit}
              logs={logs}
              weekStartsOn={settings.weekStartsOn}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
          <DayDetailPanel key={selectedDate} habit={habit} date={selectedDate} log={selectedLog} allLogs={logs} />
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <h3 className="mb-3 text-sm font-semibold">6-month activity</h3>
            <HeatmapCalendar habit={habit} logs={logs} weekStartsOn={settings.weekStartsOn} />
          </div>

          <div className="rounded-xl border border-border bg-bg-elevated p-4">
            <h3 className="mb-1 text-sm font-semibold">Last 30 days</h3>
            <CompletionTrendChart habit={habit} logs={logs} />
          </div>

          {notes.length > 0 && (
            <div className="rounded-xl border border-border bg-bg-elevated p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                <MessageSquare size={14} aria-hidden="true" />
                Journal
              </h3>
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className="text-xs font-medium text-text-faint">
                      {formatFriendlyDate(parseDateKey(n.date))}
                    </p>
                    <p className="text-text-muted">{n.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, highlight }: { label: string; value: number; suffix: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-accent/40 bg-accent-soft" : "border-border bg-bg-elevated"}`}>
      <p className={`text-xl font-bold tabular-nums ${highlight ? "text-accent" : ""}`}>
        {value}
        {suffix && <span className="ml-0.5 text-xs font-medium text-text-faint">{suffix}</span>}
      </p>
      <p className="text-xs text-text-faint">{label}</p>
    </div>
  );
}
