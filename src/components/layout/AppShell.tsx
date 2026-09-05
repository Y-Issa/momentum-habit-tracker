"use client";

import { useEffect, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import CommandPalette from "./CommandPalette";
import HabitFormModal from "@/components/habits/HabitFormModal";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAchievementWatcher } from "@/hooks/useAchievementWatcher";
import { useReminderSync } from "@/hooks/useReminderSync";
import { ensureSettings } from "@/lib/db";

export default function AppShell({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  useAchievementWatcher();
  useReminderSync();

  useEffect(() => {
    ensureSettings();
  }, []);

  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar />
      <div className="flex min-h-dvh flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
      <HabitFormModal />
      <ServiceWorkerRegister />
    </div>
  );
}
