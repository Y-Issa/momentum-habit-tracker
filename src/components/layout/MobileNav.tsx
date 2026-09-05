"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useUIStore } from "@/lib/store";

export default function MobileNav() {
  const pathname = usePathname();
  const openCreateHabit = useUIStore((s) => s.openCreateHabit);
  const primaryItems = NAV_ITEMS.slice(0, 2);
  const secondaryItems = NAV_ITEMS.slice(2);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-bg-elevated/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5 items-center">
        {primaryItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={pathname === item.href} />
        ))}
        <div className="flex items-center justify-center">
          <button
            onClick={openCreateHabit}
            aria-label="Create new habit"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg shadow-accent/30 -translate-y-3 transition-transform active:scale-95"
          >
            <Plus size={22} aria-hidden="true" />
          </button>
        </div>
        {secondaryItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
        active ? "text-accent" : "text-text-faint"
      }`}
    >
      <Icon size={20} aria-hidden="true" />
      {label}
    </Link>
  );
}
