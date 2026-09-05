"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { ThemeMode } from "@/lib/types";

const STORAGE_KEY = "habit-theme";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>("system");

  useEffect(() => {
    // Read the real value from localStorage only after mount so the client's first
    // render matches the server-rendered "system" default and avoids a hydration mismatch.
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    applyTheme(mode);
    db.settings.update("app", { theme: mode }).catch(() => {
      db.settings.put({ id: "app", theme: mode, weekStartsOn: 1, soundEnabled: true, accent: "#6366f1" });
    });
  }, []);

  return { theme, setTheme };
}
