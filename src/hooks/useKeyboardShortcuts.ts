"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function useKeyboardShortcuts() {
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const openCreateHabit = useUIStore((s) => s.openCreateHabit);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (metaK) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.key === "/") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        openCreateHabit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandPaletteOpen, openCreateHabit]);
}
