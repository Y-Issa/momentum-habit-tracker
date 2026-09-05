import type { LucideIcon } from "lucide-react";
import { Home, ListChecks, BarChart3, Trophy, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Today", icon: Home },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/stats", label: "Insights", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];
