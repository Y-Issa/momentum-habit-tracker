export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

/** ISO-ish week key using a configurable week start (0=Sun,1=Mon) */
export function weekKey(d: Date, weekStartsOn: 0 | 1 = 1): string {
  const start = startOfWeek(d, weekStartsOn);
  return toDateKey(start);
}

export function startOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  return addDays(startOfWeek(d, weekStartsOn), 6);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function daysInMonthGrid(d: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const first = startOfMonth(d);
  const last = endOfMonth(d);
  const gridStart = startOfWeek(first, weekStartsOn);
  const gridEnd = endOfWeek(last, weekStartsOn);
  const days: Date[] = [];
  let cur = gridStart;
  while (cur <= gridEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAY_LABELS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];
export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatMonthYear(d: Date): string {
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatFriendlyDate(d: Date): string {
  const today = new Date();
  if (isSameDay(d, today)) return "Today";
  const yesterday = addDays(today, -1);
  if (isSameDay(d, yesterday)) return "Yesterday";
  const tomorrow = addDays(today, 1);
  if (isSameDay(d, tomorrow)) return "Tomorrow";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function lastNDays(n: number, from: Date = new Date()): Date[] {
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(from, -i));
  return out;
}
