"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { ACHIEVEMENTS } from "@/lib/achievements";
import AchievementCard from "@/components/achievements/AchievementCard";

export default function AchievementsPage() {
  const unlocked = useLiveQuery(() => db.achievements.toArray(), [], []);
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
        <p className="text-sm text-text-muted">
          {unlocked.length} of {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedMap.has(achievement.id)}
            unlockedAt={unlockedMap.get(achievement.id)}
          />
        ))}
      </div>
    </div>
  );
}
