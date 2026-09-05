# Momentum — Habit Tracker

> 🤖 **Vibe coded with [Claude](https://claude.com/claude-code).** Every line of this app — architecture, UI, and bug fixes — was written by Claude (Sonnet 5) in an agentic coding session, from an empty folder to a working, tested, production-built app.

A full-featured, local-first habit tracker built with Next.js 16. Track daily habits, build streaks, and see your progress — with no backend, no account, and no data ever leaving your browser.

## Features

- **Flexible scheduling** — daily, specific weekdays, or "X times per week" habits
- **Two habit types** — simple yes/no check-ins, or count-based goals (e.g. "8 glasses of water")
- **Streaks that hold up** — current/longest streak tracking with streak freezes to protect a streak on off days
- **Calendars** — a GitHub-style 6-month activity heatmap and an interactive month view with per-day notes
- **Insights** — completion trend, weekday, and category charts, plus auto-generated text insights
- **18 achievements** — unlocked in real time with confetti celebrations
- **Reminders** — per-habit browser notifications
- **Command palette** — `⌘K` to jump anywhere or search habits
- **Drag-to-reorder**, search/filter/archive, and light/dark/system theming
- **Your data, your device** — everything lives in IndexedDB; export/import a JSON backup anytime
- Installable as a **PWA** with offline support

## Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · Dexie (IndexedDB) · Zustand · Recharts · Framer Motion · dnd-kit

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
```
