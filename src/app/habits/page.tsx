"use client";

import { useMemo, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Search, ListChecks } from "lucide-react";
import { useHabits, useLogsByHabit, useSettings } from "@/hooks/useHabitData";
import { CATEGORIES } from "@/lib/types";
import { reorderHabits } from "@/lib/actions";
import SortableHabitRow from "@/components/habits/SortableHabitRow";
import EmptyState from "@/components/common/EmptyState";
import { useUIStore } from "@/lib/store";

export default function HabitsPage() {
  const habits = useHabits(true);
  const logsByHabit = useLogsByHabit();
  const settings = useSettings();
  const openCreateHabit = useUIStore((s) => s.openCreateHabit);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(() => {
    return habits
      .filter((h) => (showArchived ? true : !h.archived))
      .filter((h) => (category ? h.category === category : true))
      .filter((h) => h.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.order - b.order);
  }, [habits, category, query, showArchived]);

  const orderedIds = filtered.map((h) => h.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    const newOrder = arrayMove(orderedIds, oldIndex, newIndex);
    reorderHabits(newOrder);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="text-sm text-text-muted">Manage, reorder, and organize everything you track.</p>
        </div>
        <button
          onClick={openCreateHabit}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          New Habit
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search habits…"
            aria-label="Search habits"
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-bg-elevated py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-accent"
          />
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded accent-[var(--accent)]"
          />
          Show archived
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory(null)}
          aria-pressed={category === null}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            category === null ? "border-accent bg-accent-soft text-accent" : "border-border text-text-muted"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              category === c.id ? "border-accent bg-accent-soft text-accent" : "border-border text-text-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={24} aria-hidden="true" />}
          title={habits.length === 0 ? "No habits yet" : "No matches"}
          description={
            habits.length === 0
              ? "Create your first habit and it will show up here."
              : "Try a different search term or category filter."
          }
          action={
            habits.length === 0 ? (
              <button
                onClick={openCreateHabit}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
              >
                Create a habit
              </button>
            ) : undefined
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((habit) => (
                <SortableHabitRow
                  key={habit.id}
                  habit={habit}
                  logs={logsByHabit.get(habit.id) ?? []}
                  weekStartsOn={settings.weekStartsOn}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
