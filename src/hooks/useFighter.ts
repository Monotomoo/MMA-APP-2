import { FIGHTERS, PROFILES, BOUTS, TOURNAMENTS, REGISTRATIONS, getFighterName, getFighterDocs } from "@/lib/demo-data";

export function useFighter(id: string) {
  const fighter = FIGHTERS.find((f) => f.id === id) ?? null;
  const profile = PROFILES.find((p) => p.id === id) ?? null;

  const bouts = BOUTS
    .filter((b) => b.fighter_a_id === id || b.fighter_b_id === id)
    .map((b) => {
      const tournament  = TOURNAMENTS.find((t) => t.id === b.tournament_id);
      const opponentId  = b.fighter_a_id === id ? b.fighter_b_id : b.fighter_a_id;
      const result =
        b.status === "completed"
          ? b.winner_id === id ? "W" : b.winner_id ? "L" : "NC"
          : "–";
      return {
        ...b,
        tournament_name: tournament?.name ?? "Unknown",
        tournament_date: tournament?.date ?? null,
        opponent_name:   getFighterName(opponentId),
        result,
      };
    })
    .sort((a, b) => (b.tournament_date ?? "").localeCompare(a.tournament_date ?? ""));

  const registrations = REGISTRATIONS
    .filter((r) => r.fighter_id === id)
    .map((r) => {
      const t = TOURNAMENTS.find((t) => t.id === r.tournament_id);
      return {
        ...r,
        tournament_name:   t?.name   ?? "Unknown",
        tournament_date:   t?.date   ?? null,
        tournament_status: t?.status ?? null,
      };
    })
    .sort((a, b) => (b.tournament_date ?? "").localeCompare(a.tournament_date ?? ""));

  const documents = getFighterDocs(id);

  return { fighter, profile, bouts, registrations, documents };
}
