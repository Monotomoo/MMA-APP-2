import { useState } from "react";
import {
  CLUBS, PROFILES, FIGHTERS, TOURNAMENTS, REGISTRATIONS,
  Club,
  updateClub as updateClubData,
  updateRegistrationStatus,
} from "@/lib/demo-data";

export function useClub(clubId = "club-2") {
  const [club, setClub] = useState<Club | null>(
    () => CLUBS.find((c) => c.id === clubId) ?? null,
  );

  const coach = club
    ? (PROFILES.find((p) => p.id === club.coach_id)?.full_name ?? null)
    : null;

  const [pendingRegs, setPendingRegs] = useState(() => {
    const clubFighterIds = FIGHTERS
      .filter((f) => f.club_id === clubId)
      .map((f) => f.id);
    return REGISTRATIONS
      .filter((r) => clubFighterIds.includes(r.fighter_id) && r.status === "pending")
      .map((r) => ({
        ...r,
        fighter_name:    PROFILES.find((p) => p.id === r.fighter_id)?.full_name ?? "Unknown",
        fighter_weight:  FIGHTERS.find((f) => f.id === r.fighter_id)?.weight_class ?? null,
        tournament_name: TOURNAMENTS.find((t) => t.id === r.tournament_id)?.name ?? "Unknown",
      }));
  });

  function updateClub(updates: { name?: string; city?: string | null }) {
    if (!club) return;
    updateClubData(club.id, updates);
    setClub((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  function approveRegistration(id: string) {
    updateRegistrationStatus(id, "approved");
    setPendingRegs((prev) => prev.filter((r) => r.id !== id));
  }

  function rejectRegistration(id: string) {
    updateRegistrationStatus(id, "rejected");
    setPendingRegs((prev) => prev.filter((r) => r.id !== id));
  }

  return { club, coach, updateClub, pendingRegs, approveRegistration, rejectRegistration };
}
