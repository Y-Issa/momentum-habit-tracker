export type HabitKind = "check" | "count";

export type FrequencyType = "daily" | "weekdays" | "weekly";

export interface Frequency {
  type: FrequencyType;
  /** For "weekdays": 0 = Sunday .. 6 = Saturday */
  days?: number[];
  /** For "weekly": how many days per week the habit must be done */
  timesPerWeek?: number;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: string;
  kind: HabitKind;
  targetCount: number;
  unit: string;
  frequency: Frequency;
  reminderEnabled: boolean;
  reminderTime: string | null;
  freezesAllowedPerMonth: number;
  motivation: string;
  archived: boolean;
  createdAt: number;
  order: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  /** YYYY-MM-DD (local) */
  date: string;
  value: number;
  completed: boolean;
  frozen: boolean;
  note: string | null;
  updatedAt: number;
}

export interface UnlockedAchievement {
  id: string;
  achievementId: string;
  habitId: string | null;
  unlockedAt: number;
  seen: boolean;
}

export type ThemeMode = "light" | "dark" | "system";

export interface AppSettings {
  id: "app";
  theme: ThemeMode;
  weekStartsOn: 0 | 1;
  soundEnabled: boolean;
  accent: string;
}

export const CATEGORIES = [
  { id: "health", label: "Health", color: "#22c55e" },
  { id: "fitness", label: "Fitness", color: "#f97316" },
  { id: "mind", label: "Mind", color: "#8b5cf6" },
  { id: "learning", label: "Learning", color: "#3b82f6" },
  { id: "productivity", label: "Productivity", color: "#eab308" },
  { id: "social", label: "Social", color: "#ec4899" },
  { id: "finance", label: "Finance", color: "#14b8a6" },
  { id: "other", label: "Other", color: "#64748b" },
] as const;

export const HABIT_COLORS = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export const HABIT_EMOJIS = [
  "💧", "🏃", "🧘", "📚", "💪", "🥗", "😴", "🧹",
  "✍️", "🎯", "🚭", "💰", "🎨", "🎸", "🧠", "🌱",
  "☕", "🚴", "🍎", "🦷", "☀️", "🙏", "📵", "🩺",
];
