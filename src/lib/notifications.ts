import type { Habit } from "./types";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  return Notification.requestPermission();
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function msUntil(time: string): number {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function fire(habit: Habit) {
  if (notificationPermission() !== "granted") return;
  const title = `${habit.emoji} ${habit.name}`;
  const body = habit.motivation || "Time to check in on this habit.";
  try {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.showNotification(title, { body, tag: `habit-${habit.id}`, icon: "/icons/icon-192" });
        } else {
          new Notification(title, { body });
        }
      });
    } else {
      new Notification(title, { body });
    }
  } catch {
    // Notifications can throw in some contexts (e.g. no user gesture yet); ignore.
  }
}

/** Schedules an in-tab reminder that re-arms itself daily while the app stays open. */
export function scheduleReminder(habit: Habit) {
  clearReminder(habit.id);
  if (!habit.reminderEnabled || !habit.reminderTime) return;
  const delay = msUntil(habit.reminderTime);
  const timer = setTimeout(function tick() {
    fire(habit);
    const next = setTimeout(tick, 24 * 60 * 60 * 1000);
    timers.set(habit.id, next);
  }, delay);
  timers.set(habit.id, timer);
}

export function clearReminder(habitId: string) {
  const existing = timers.get(habitId);
  if (existing) {
    clearTimeout(existing);
    timers.delete(habitId);
  }
}

export function syncReminders(habits: Habit[]) {
  for (const id of [...timers.keys()]) {
    if (!habits.find((h) => h.id === id)) clearReminder(id);
  }
  for (const habit of habits) {
    if (habit.archived) {
      clearReminder(habit.id);
      continue;
    }
    scheduleReminder(habit);
  }
}
