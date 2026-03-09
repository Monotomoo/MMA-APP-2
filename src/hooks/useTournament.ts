import { useState } from "react";
import {
  TOURNAMENTS, REGISTRATIONS, BOUTS, FIGHTERS, PROFILES,
  getFighterName, addRegistration, addBout, updateBout,
  TournamentRegistration, Bout,
} from "@/lib/demo-data";

export function useTournament(id: string) {
  const tournament = TOURNAMENTS.find((t) => t.id === id) ?? null;

  const [localRegs, setLocalRegs] = useState<TournamentRegistration[]>(
    () => REGISTRATIONS.filter((r) => r.tournament_id === id),
  );

  const registrations = localRegs.map((r) => ({
    ...r,
    fighter_name: getFighterName(r.fighter_id),
    weight_class: FIGHTERS.find((f) => f.id === r.fighter_id)?.weight_class ?? null,
  }));

  function register(fighterId: string) {
    const reg = addRegistration(id, fighterId);
    setLocalRegs((prev) => {
      if (prev.find((r) => r.id === reg.id)) return prev;
      return [...prev, reg];
    });
  }

  const [localBouts, setLocalBouts] = useState<Bout[]>(
    () => BOUTS.filter((b) => b.tournament_id === id),
  );

  const bouts = [...localBouts]
    .sort((a, b) => a.bout_order - b.bout_order)
    .map((b) => ({
      ...b,
      fighter_a_name:   getFighterName(b.fighter_a_id),
      fighter_b_name:   getFighterName(b.fighter_b_id),
      winner_name:      b.winner_id ? getFighterName(b.winner_id) : null,
      fighter_a_avatar: PROFILES.find((p) => p.id === b.fighter_a_id)?.avatar_url ?? null,
      fighter_b_avatar: b.fighter_b_id ? PROFILES.find((p) => p.id === b.fighter_b_id)?.avatar_url ?? null : null,
    }));

  function addMatch(data: Omit<Bout, "id">) {
    const b = addBout(data);
    setLocalBouts((prev) => [...prev, b]);
  }

  function recordResult(
    boutId: string,
    updates: { winner_id: string; method: string; round: number },
  ) {
    updateBout(boutId, { ...updates, status: "completed" });
    setLocalBouts((prev) =>
      prev.map((b) => (b.id === boutId ? { ...b, ...updates, status: "completed" } : b)),
    );
  }

  return { tournament, registrations, bouts, register, addMatch, recordResult };
}
