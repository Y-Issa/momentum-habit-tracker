import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    name: "Momentum — Habit Tracker",
    short_name: "Momentum",
    description: "Build lasting habits with streaks, calendars, charts and achievements.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c0c12",
    theme_color: "#0c0c12",
    icons: [
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  });
}
