"use client";

import { useEffect } from "react";
import { syncReminders } from "@/lib/notifications";
import { useHabits } from "./useHabitData";

export function useReminderSync() {
  const habits = useHabits();
  useEffect(() => {
    syncReminders(habits);
  }, [habits]);
}
