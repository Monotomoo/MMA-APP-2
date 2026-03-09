import { FIGHTERS, PROFILES } from "@/lib/demo-data";

export function useFighters(clubId = "club-2") {
  const fighters = FIGHTERS
    .filter((f) => f.club_id === clubId)
    .map((f) => {
      const profile = PROFILES.find((p) => p.id === f.id);
      return {
        ...f,
        full_name:  profile?.full_name  ?? "Unknown",
        avatar_url: profile?.avatar_url ?? null,
      };
    });

  return { fighters };
}

// TODO (Supabase): replace body with:
// const q = useQuery({ queryKey: ["fighters", clubId], queryFn: () =>
//   supabase.from("fighters")
//     .select("*, profile:profiles(full_name)")
//     .eq("club_id", clubId) });
// return { fighters: (q.data ?? []).map(f => ({ ...f, full_name: f.profile?.full_name ?? "" })) };
