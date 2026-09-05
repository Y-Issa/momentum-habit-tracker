"use client";

import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "default" | "ghost";
}

export default function IconButton({ label, variant = "default", className, children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        variant === "default" && "border border-border bg-bg-elevated text-text-muted hover:bg-bg-hover hover:text-text",
        variant === "ghost" && "text-text-muted hover:bg-bg-hover hover:text-text",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
