"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useHabits } from "@/hooks/useHabitData";
import { NAV_ITEMS } from "@/lib/nav";

interface Item {
  id: string;
  label: string;
  hint?: string;
  emoji?: string;
  action: () => void;
}

export default function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);

  if (!open) return null;
  return <CommandPaletteDialog onClose={() => setOpen(false)} />;
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const openEditHabit = useUIStore((s) => s.openEditHabit);
  const openCreateHabit = useUIStore((s) => s.openCreateHabit);
  const router = useRouter();
  const habits = useHabits();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const items: Item[] = useMemo(() => {
    const navItems: Item[] = NAV_ITEMS.map((n) => ({
      id: `nav-${n.href}`,
      label: `Go to ${n.label}`,
      action: () => router.push(n.href),
    }));
    const habitItems: Item[] = habits.map((h) => ({
      id: `habit-${h.id}`,
      label: h.name,
      emoji: h.emoji,
      hint: "Edit habit",
      action: () => openEditHabit(h),
    }));
    const actionItems: Item[] = [
      { id: "new-habit", label: "Create a new habit", action: openCreateHabit },
    ];
    const all = [...actionItems, ...navItems, ...habitItems];
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((i) => i.label.toLowerCase().includes(q));
  }, [habits, query, router, openEditHabit, openCreateHabit]);

  const runItem = (item: Item | undefined) => {
    if (!item) return;
    item.action();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 pt-[15vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-2xl animate-pop-in"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-text-faint" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                runItem(items[index]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search habits, jump to a page…"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
          />
          <kbd className="hidden sm:inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-text-faint">
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
          {items.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-text-faint">No matches.</li>
          )}
          {items.map((item, i) => (
            <li key={item.id} role="option" aria-selected={i === index}>
              <button
                onClick={() => runItem(item)}
                onMouseEnter={() => setIndex(i)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                  i === index ? "bg-accent-soft text-accent" : "text-text hover:bg-bg-hover"
                }`}
              >
                {item.emoji && <span aria-hidden="true">{item.emoji}</span>}
                <span className="flex-1 truncate">{item.label}</span>
                {item.hint && <span className="text-xs text-text-faint">{item.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
