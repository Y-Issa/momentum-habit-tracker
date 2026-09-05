"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Snowflake, Trash2 } from "lucide-react";
import Modal from "@/components/common/Modal";
import { useUIStore } from "@/lib/store";
import { createHabit, deleteHabit, updateHabit, type HabitDraft } from "@/lib/actions";
import {
  CATEGORIES,
  HABIT_COLORS,
  HABIT_EMOJIS,
  type Frequency,
  type FrequencyType,
  type Habit,
} from "@/lib/types";
import { WEEKDAY_LABELS_SHORT } from "@/lib/date";
import { notificationPermission, requestNotificationPermission } from "@/lib/notifications";

const DEFAULT_DRAFT: HabitDraft = {
  name: "",
  emoji: "🎯",
  color: HABIT_COLORS[6],
  category: "health",
  kind: "check",
  targetCount: 1,
  unit: "",
  frequency: { type: "daily" },
  reminderEnabled: false,
  reminderTime: "08:00",
  freezesAllowedPerMonth: 2,
  motivation: "",
};

function draftFromHabit(habit: Habit | null): HabitDraft {
  if (!habit) return DEFAULT_DRAFT;
  const { name, emoji, color, category, kind, targetCount, unit, frequency, reminderEnabled, reminderTime, freezesAllowedPerMonth, motivation } = habit;
  return { name, emoji, color, category, kind, targetCount, unit, frequency, reminderEnabled, reminderTime, freezesAllowedPerMonth, motivation };
}

export default function HabitFormModal() {
  const open = useUIStore((s) => s.habitModalOpen);
  const editingHabit = useUIStore((s) => s.editingHabit);
  const closeHabitModal = useUIStore((s) => s.closeHabitModal);

  return (
    <Modal
      open={open}
      onClose={closeHabitModal}
      title={editingHabit ? "Edit Habit" : "New Habit"}
      description={editingHabit ? "Update the details of this habit." : "Set it up once — track it forever."}
      maxWidth="max-w-xl"
    >
      {open && (
        <HabitFormFields
          key={editingHabit?.id ?? "new"}
          editingHabit={editingHabit}
          onClose={closeHabitModal}
        />
      )}
    </Modal>
  );
}

function HabitFormFields({ editingHabit, onClose }: { editingHabit: Habit | null; onClose: () => void }) {
  const [draft, setDraft] = useState<HabitDraft>(() => draftFromHabit(editingHabit));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (p: Partial<HabitDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchFrequency = (p: Partial<Frequency>) =>
    setDraft((d) => ({ ...d, frequency: { ...d.frequency, ...p } }));

  const setFrequencyType = (type: FrequencyType) => {
    if (type === "weekdays") patchFrequency({ type, days: draft.frequency.days ?? [1, 2, 3, 4, 5] });
    else if (type === "weekly") patchFrequency({ type, timesPerWeek: draft.frequency.timesPerWeek ?? 3 });
    else patchFrequency({ type });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error("Give your habit a name first.");
      return;
    }
    setSaving(true);
    try {
      if (draft.reminderEnabled && notificationPermission() === "default") {
        await requestNotificationPermission();
      }
      if (editingHabit) {
        await updateHabit(editingHabit.id, draft);
        toast.success(`${draft.emoji} ${draft.name} updated`);
      } else {
        await createHabit(draft);
        toast.success(`${draft.emoji} ${draft.name} created — let's build momentum!`);
      }
      onClose();
    } catch (err) {
      toast.error("Something went wrong saving this habit.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingHabit) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteHabit(editingHabit.id);
    toast.success(`${editingHabit.name} deleted`);
    onClose();
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-3">
          <EmojiPickerButton value={draft.emoji} onChange={(emoji) => patch({ emoji })} />
          <div className="flex-1">
            <label htmlFor="habit-name" className="mb-1 block text-xs font-medium text-text-muted">
              Name
            </label>
            <input
              id="habit-name"
              name="name"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Drink water…"
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-accent"
              maxLength={60}
            />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-text-muted">Color</span>
          <div className="flex flex-wrap gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                aria-label={`Color ${c}`}
                aria-pressed={draft.color === c}
                onClick={() => patch({ color: c })}
                className="h-7 w-7 rounded-full ring-offset-2 ring-offset-bg-elevated transition-transform hover:scale-110"
                style={{ backgroundColor: c, boxShadow: draft.color === c ? `0 0 0 2px ${c}` : undefined }}
              />
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-text-muted">Category</span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => patch({ category: c.id })}
                aria-pressed={draft.category === c.id}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  draft.category === c.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-text-muted hover:border-border-strong"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-text-muted">Type</span>
          <div className="grid grid-cols-2 gap-2">
            <KindOption
              active={draft.kind === "check"}
              onClick={() => patch({ kind: "check" })}
              title="Yes / No"
              subtitle="Simple daily check-in"
            />
            <KindOption
              active={draft.kind === "count"}
              onClick={() => patch({ kind: "count" })}
              title="Count / Goal"
              subtitle="e.g. 8 glasses of water"
            />
          </div>
          {draft.kind === "count" && (
            <div className="mt-2 flex gap-2">
              <div className="flex-1">
                <label htmlFor="target-count" className="mb-1 block text-xs text-text-faint">
                  Daily goal
                </label>
                <input
                  id="target-count"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={draft.targetCount}
                  onChange={(e) => patch({ targetCount: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-accent"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="unit" className="mb-1 block text-xs text-text-faint">
                  Unit (optional)
                </label>
                <input
                  id="unit"
                  value={draft.unit}
                  onChange={(e) => patch({ unit: e.target.value })}
                  placeholder="glasses…"
                  autoComplete="off"
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-accent"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-text-muted">Frequency</span>
          <div className="grid grid-cols-3 gap-2">
            <FreqOption active={draft.frequency.type === "daily"} onClick={() => setFrequencyType("daily")} label="Every day" />
            <FreqOption active={draft.frequency.type === "weekdays"} onClick={() => setFrequencyType("weekdays")} label="Specific days" />
            <FreqOption active={draft.frequency.type === "weekly"} onClick={() => setFrequencyType("weekly")} label="X per week" />
          </div>
          {draft.frequency.type === "weekdays" && (
            <div className="mt-2 flex justify-between gap-1">
              {WEEKDAY_LABELS_SHORT.map((label, i) => {
                const active = draft.frequency.days?.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    aria-pressed={active}
                    aria-label={label}
                    onClick={() => {
                      const days = new Set(draft.frequency.days ?? []);
                      if (days.has(i)) days.delete(i);
                      else days.add(i);
                      patchFrequency({ days: [...days].sort() });
                    }}
                    className={`h-9 w-9 rounded-full text-xs font-semibold transition-colors ${
                      active ? "bg-accent text-accent-fg" : "bg-bg-subtle text-text-faint hover:text-text"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
          {draft.frequency.type === "weekly" && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={7}
                value={draft.frequency.timesPerWeek ?? 3}
                onChange={(e) => patchFrequency({ timesPerWeek: Number(e.target.value) })}
                className="flex-1 accent-[var(--accent)]"
              />
              <span className="w-24 text-sm tabular-nums text-text-muted">
                {draft.frequency.timesPerWeek ?? 3}x / week
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">Daily reminder</p>
            <p className="text-xs text-text-faint">Get a browser notification while the app is open</p>
          </div>
          <div className="flex items-center gap-2">
            {draft.reminderEnabled && (
              <input
                type="time"
                value={draft.reminderTime ?? "08:00"}
                onChange={(e) => patch({ reminderTime: e.target.value })}
                className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm tabular-nums outline-none focus-visible:border-accent"
                aria-label="Reminder time"
              />
            )}
            <Switch
              checked={draft.reminderEnabled}
              onChange={(checked) => patch({ reminderEnabled: checked })}
              label="Toggle daily reminder"
            />
          </div>
        </div>

        <div>
          <label htmlFor="motivation" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-text-muted">
            <Snowflake size={13} aria-hidden="true" />
            Why this habit matters (optional)
          </label>
          <textarea
            id="motivation"
            value={draft.motivation}
            onChange={(e) => patch({ motivation: e.target.value })}
            placeholder="A short reminder of why you started…"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-accent"
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="freezes" className="mb-1.5 block text-xs font-medium text-text-muted">
            Streak freezes allowed per month
          </label>
          <input
            id="freezes"
            type="number"
            inputMode="numeric"
            min={0}
            max={31}
            value={draft.freezesAllowedPerMonth}
            onChange={(e) => patch({ freezesAllowedPerMonth: Math.max(0, Number(e.target.value) || 0) })}
            className="w-24 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:border-accent"
          />
          <p className="mt-1 text-xs text-text-faint">
            Freezes protect your streak on days you can&rsquo;t complete the habit.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          {editingHabit ? (
            <button
              type="button"
              onClick={handleDelete}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                confirmDelete
                  ? "bg-danger text-white"
                  : "text-danger hover:bg-danger-soft"
              }`}
            >
              <Trash2 size={15} aria-hidden="true" />
              {confirmDelete ? "Confirm delete" : "Delete"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:bg-bg-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
            >
              {editingHabit ? "Save changes" : "Create habit"}
            </button>
          </div>
        </div>
      </form>
  );
}

function EmojiPickerButton({ value, onChange }: { value: string; onChange: (emoji: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-text-muted">Icon</label>
      <button
        type="button"
        onClick={() => setPickerOpen((o) => !o)}
        aria-label="Choose an icon"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-border bg-bg text-lg hover:border-border-strong"
      >
        <span aria-hidden="true">{value}</span>
      </button>
      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
          <div className="absolute left-0 top-[46px] z-20 grid w-56 grid-cols-6 gap-1 rounded-lg border border-border bg-bg-elevated p-2 shadow-xl">
            {HABIT_EMOJIS.map((emoji) => (
              <button
                type="button"
                key={emoji}
                onClick={() => {
                  onChange(emoji);
                  setPickerOpen(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-base hover:bg-bg-hover"
                aria-label={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function KindOption({ active, onClick, title, subtitle }: { active: boolean; onClick: () => void; title: string; subtitle: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-2 text-left transition-colors ${
        active ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong"
      }`}
    >
      <p className={`text-sm font-medium ${active ? "text-accent" : "text-text"}`}>{title}</p>
      <p className="text-xs text-text-faint">{subtitle}</p>
    </button>
  );
}

function FreqOption({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
        active ? "border-accent bg-accent-soft text-accent" : "border-border text-text-muted hover:border-border-strong"
      }`}
    >
      {label}
    </button>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-bg-subtle"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
