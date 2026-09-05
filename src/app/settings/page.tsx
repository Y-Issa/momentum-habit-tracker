"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Bell, Trash2, Flame } from "lucide-react";
import { db } from "@/lib/db";
import { useSettings } from "@/hooks/useHabitData";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { exportBackup, downloadBackup, importBackup } from "@/lib/export";
import { notificationPermission, requestNotificationPermission } from "@/lib/notifications";

export default function SettingsPage() {
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  // "default" matches the server-rendered copy; the real permission is a browser-only
  // API, so it's read after mount to avoid a hydration mismatch.
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPermission(notificationPermission());
  }, []);

  async function handleExport() {
    const backup = await exportBackup();
    downloadBackup(backup);
    toast.success("Backup downloaded");
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file, "merge");
      toast.success("Backup imported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      e.target.value = "";
    }
  }

  async function handleResetAll() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await Promise.all([db.habits.clear(), db.logs.clear(), db.achievements.clear()]);
    toast.success("All data cleared");
    setConfirmReset(false);
  }

  async function handleEnableNotifications() {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === "granted") toast.success("Notifications enabled");
    else toast.error("Notifications were not granted");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-text-muted">Personalize Momentum and manage your data.</p>
      </div>

      <Section title="Appearance">
        <Row label="Theme" description="Match your system, or choose light / dark.">
          <ThemeToggle />
        </Row>
        <Row label="Week starts on" description="Used for weekly goals and streak calculations.">
          <div className="flex rounded-lg border border-border p-0.5">
            {[
              { value: 0, label: "Sunday" },
              { value: 1, label: "Monday" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => db.settings.update("app", { weekStartsOn: opt.value as 0 | 1 })}
                aria-pressed={settings.weekStartsOn === opt.value}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  settings.weekStartsOn === opt.value ? "bg-accent text-accent-fg" : "text-text-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section title="Notifications">
        <Row
          label="Browser notifications"
          description={
            permission === "granted"
              ? "Enabled — reminders will notify you while the app is open."
              : permission === "denied"
                ? "Blocked in your browser settings. Enable them from your browser's site settings."
                : "Allow notifications to receive per-habit reminders."
          }
        >
          {permission !== "granted" && permission !== "unsupported" && (
            <button
              onClick={handleEnableNotifications}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent-hover"
            >
              <Bell size={13} aria-hidden="true" />
              Enable
            </button>
          )}
        </Row>
      </Section>

      <Section title="Backup & restore">
        <Row label="Export data" description="Download everything as a JSON file you can keep or restore later.">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-bg-hover"
          >
            <Download size={13} aria-hidden="true" />
            Export
          </button>
        </Row>
        <Row label="Import data" description="Merge a previously exported backup into this device.">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-bg-hover"
          >
            <Upload size={13} aria-hidden="true" />
            Import
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
        </Row>
      </Section>

      <Section title="Danger zone">
        <Row label="Clear all data" description="Permanently delete every habit, log, and achievement on this device.">
          <button
            onClick={handleResetAll}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              confirmReset ? "bg-danger text-white" : "border border-danger/40 text-danger hover:bg-danger-soft"
            }`}
          >
            <Trash2 size={13} aria-hidden="true" />
            {confirmReset ? "Confirm clear all data" : "Clear all data"}
          </button>
        </Row>
      </Section>

      <div className="flex items-center gap-2 pt-2 text-xs text-text-faint">
        <Flame size={13} aria-hidden="true" />
        Momentum stores everything locally in your browser — nothing leaves your device.
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">{title}</h2>
      <div className="divide-y divide-border rounded-xl border border-border bg-bg-elevated">{children}</div>
    </section>
  );
}

function Row({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-text-faint">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}
