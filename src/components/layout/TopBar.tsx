"use client";

import { Search, Flame } from "lucide-react";
import { useUIStore } from "@/lib/store";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-bg/80 backdrop-blur px-4 py-3 md:px-8">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-fg">
          <Flame size={14} strokeWidth={2.5} />
        </div>
        <span className="font-semibold tracking-tight">Momentum</span>
      </div>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 py-1.5 text-sm text-text-faint hover:border-border-strong hover:text-text-muted transition-colors w-64"
      >
        <Search size={14} aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Search"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-elevated text-text-muted"
        >
          <Search size={16} aria-hidden="true" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
