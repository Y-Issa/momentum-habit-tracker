"use client";

import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
