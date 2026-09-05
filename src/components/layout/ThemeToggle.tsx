"use client";

import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/lib/types";

const OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light theme", icon: Sun },
  { mode: "system", label: "System theme", icon: Laptop },
  { mode: "dark", label: "Dark theme", icon: Moon },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-lg border border-border bg-bg-elevated p-0.5"
    >
      {OPTIONS.map(({ mode, label, icon: Icon }) => {
        const active = theme === mode;
        return (
          <button
            key={mode}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(mode)}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              active ? "bg-accent text-accent-fg" : "text-text-faint hover:text-text"
            }`}
          >
            <Icon size={14} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
