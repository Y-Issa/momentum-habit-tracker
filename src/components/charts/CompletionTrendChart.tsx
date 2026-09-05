"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Habit, HabitLog } from "@/lib/types";
import { indexLogsByDate, isScheduledOn, logIsDone } from "@/lib/streak";
import { lastNDays, toDateKey } from "@/lib/date";

export default function CompletionTrendChart({
  habit,
  logs,
  days = 30,
}: {
  habit: Habit;
  logs: HabitLog[];
  days?: number;
}) {
  const byDate = indexLogsByDate(logs);
  const range = lastNDays(days);

  const data = range.map((date) => {
    const key = toDateKey(date);
    const log = byDate.get(key);
    const scheduled = isScheduledOn(habit, date);
    let pct = 0;
    if (scheduled) {
      if (habit.kind === "count") {
        pct = log ? Math.min(100, Math.round((log.value / Math.max(1, habit.targetCount)) * 100)) : 0;
      } else {
        pct = logIsDone(log) ? 100 : 0;
      }
    }
    return {
      date: key.slice(5),
      value: scheduled ? pct : null,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`trend-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={habit.color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={habit.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--text-faint)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          interval={Math.ceil(days / 8)}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "var(--text-faint)" }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => (v === null || v === undefined ? ["Not scheduled", ""] : [`${v}%`, "Completion"])}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={habit.color}
          strokeWidth={2}
          fill={`url(#trend-${habit.id})`}
          connectNulls
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
