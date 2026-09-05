"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CATEGORIES } from "@/lib/types";

export default function CategoryDonutChart({ data }: { data: { category: string; count: number }[] }) {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: CATEGORIES.find((c) => c.id === d.category)?.label ?? d.category,
      value: d.count,
      color: CATEGORIES.find((c) => c.id === d.category)?.color ?? "#64748b",
    }));

  if (chartData.length === 0) {
    return <p className="py-10 text-center text-sm text-text-faint">No completions yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2} strokeWidth={0}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
