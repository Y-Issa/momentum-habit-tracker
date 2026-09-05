"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";
import { useHabits, useLogsByHabit, useSettings } from "@/hooks/useHabitData";
import { computeStreak } from "@/lib/streak";
import { lastNDays, toDateKey } from "@/lib/date";
import { buildInsights } from "@/lib/insights";
import WeekdayBarChart from "@/components/charts/WeekdayBarChart";
import CategoryDonutChart from "@/components/charts/CategoryDonutChart";
import StreakBadge from "@/components/habits/StreakBadge";
import EmptyState from "@/components/common/EmptyState";
import { useUIStore } from "@/lib/store";

export default function StatsPage() {
  const habits = useHabits();
  const logsByHabit = useLogsByHabit();
  const settings = useSettings();
  const openCreateHabit = useUIStore((s) => s.openCreateHabit);

  const insights = useMemo(
    () => buildInsights(habits, logsByHabit, settings.weekStartsOn),
    [habits, logsByHabit, settings.weekStartsOn]
  );

  const trendData = useMemo(() => {
    const days = lastNDays(60);
    return days.map((date) => {
      const key = toDateKey(date);
      let scheduled = 0;
      let done = 0;
      for (const habit of habits) {
        const dayOfWeek = date.getDay();
        const isSched =
          habit.frequency.type === "daily" ||
          habit.frequency.type === "weekly" ||
          (habit.frequency.days ?? []).includes(dayOfWeek);
        if (!isSched) continue;
        if (habit.createdAt > date.getTime() + 86400000) continue;
        scheduled++;
        const log = (logsByHabit.get(habit.id) ?? []).find((l) => l.date === key);
        if (log?.completed || log?.frozen) done++;
      }
      return {
        date: key.slice(5),
        value: scheduled ? Math.round((done / scheduled) * 100) : 0,
      };
    });
  }, [habits, logsByHabit]);

  const weekdayTotals = useMemo(() => {
    const totals = new Array(7).fill(0);
    for (const logs of logsByHabit.values()) {
      for (const log of logs) {
        if (!log.completed) continue;
        totals[new Date(log.date + "T00:00:00").getDay()]++;
      }
    }
    return totals;
  }, [logsByHabit]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const habit of habits) {
      const logs = logsByHabit.get(habit.id) ?? [];
      const completions = logs.filter((l) => l.completed).length;
      map.set(habit.category, (map.get(habit.category) ?? 0) + completions);
    }
    return [...map.entries()].map(([category, count]) => ({ category, count }));
  }, [habits, logsByHabit]);

  const leaderboard = useMemo(() => {
    return habits
      .map((habit) => ({
        habit,
        streak: computeStreak(habit, logsByHabit.get(habit.id) ?? [], settings.weekStartsOn),
      }))
      .sort((a, b) => b.streak.current - a.streak.current);
  }, [habits, logsByHabit, settings.weekStartsOn]);

  if (habits.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={24} aria-hidden="true" />}
        title="Nothing to analyze yet"
        description="Once you start checking off habits, insights and charts will appear here."
        action={
          <button
            onClick={openCreateHabit}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
          >
            Create a habit
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="text-sm text-text-muted">A look at your patterns across every habit.</p>
      </div>

      {insights.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-bg-elevated p-3.5">
              <span className="text-xl" aria-hidden="true">
                {insight.icon}
              </span>
              <p className="text-sm text-text-muted">{insight.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg-elevated p-4">
        <h3 className="mb-1 text-sm font-semibold">Overall completion rate — last 60 days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="overall-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={7} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v}%`, "Completion"]}
            />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fill="url(#overall-trend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-elevated p-4">
          <h3 className="mb-1 text-sm font-semibold">Completions by weekday</h3>
          <WeekdayBarChart data={weekdayTotals} />
        </div>
        <div className="rounded-xl border border-border bg-bg-elevated p-4">
          <h3 className="mb-1 text-sm font-semibold">Completions by category</h3>
          <CategoryDonutChart data={categoryTotals} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-elevated p-4">
        <h3 className="mb-3 text-sm font-semibold">Streak leaderboard</h3>
        <ul className="space-y-2">
          {leaderboard.map(({ habit, streak }) => (
            <li key={habit.id} className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">
                {habit.emoji}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{habit.name}</span>
              <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-bg-subtle sm:block">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (streak.current / Math.max(streak.longest, 1)) * 100)}%`,
                    backgroundColor: habit.color,
                  }}
                />
              </div>
              <StreakBadge streak={streak.current} size="lg" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
