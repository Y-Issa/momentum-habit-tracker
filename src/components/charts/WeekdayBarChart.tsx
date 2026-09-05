"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { WEEKDAY_LABELS_SHORT } from "@/lib/date";

export default function WeekdayBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const chartData = data.map((v, i) => ({ day: WEEKDAY_LABELS_SHORT[i], value: v }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "var(--bg-hover)" }}
          contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          formatter={(v) => [v, "Completions"]}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.value === max && max > 0 ? "var(--accent)" : "var(--accent-soft)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
