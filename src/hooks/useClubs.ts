import { useState } from "react";
import { CLUBS, PROFILES, FIGHTERS, Club, createClub, updateClub } from "@/lib/demo-data";

export function useClubs() {
  const [localClubs, setLocalClubs] = useState<Club[]>(() => [...CLUBS]);

  const clubs = localClubs.map((c) => ({
    ...c,
    coach_name:    PROFILES.find((p) => p.id === c.coach_id)?.full_name ?? null,
    fighter_count: FIGHTERS.filter((f) => f.club_id === c.id).length,
  }));

  function addClub(data: Omit<Club, "id" | "created_at">) {
    const c = createClub(data);
    setLocalClubs((prev) => [...prev, c]);
    return c;
  }

  function editClub(id: string, updates: { name?: string; city?: string | null; coach_id?: string | null }) {
    updateClub(id, updates);
    setLocalClubs((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  return { clubs, addClub, editClub };
}
