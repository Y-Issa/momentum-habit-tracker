"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Plus } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useUIStore } from "@/lib/store";

export default function Sidebar() {
  const pathname = usePathname();
  const openCreateHabit = useUIStore((s) => s.openCreateHabit);

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-border bg-bg-elevated h-dvh sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-fg">
          <Flame size={18} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-semibold tracking-tight">Momentum</span>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-muted hover:bg-bg-hover hover:text-text"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={openCreateHabit}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          <Plus size={18} aria-hidden="true" />
          New Habit
        </button>
      </div>
    </aside>
  );
}
