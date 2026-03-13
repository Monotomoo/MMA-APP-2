import { useState } from "react";
import { Link } from "react-router-dom";
import { Medal } from "lucide-react";
import { FIGHTERS, PROFILES, CLUBS, WEIGHT_CLASS_DATA } from "@/lib/demo-data";

// ─── Build enriched fighter list ─────────────────────────────────────────────
const enriched = FIGHTERS.map((f) => {
  const profile = PROFILES.find((p) => p.id === f.id);
  const club    = CLUBS.find((c) => c.id === f.club_id);
  return {
    ...f,
    full_name:  profile?.full_name  ?? "Nepoznat",
    avatar_url: profile?.avatar_url ?? null,
    club_name:  club?.name          ?? "—",
  };
});

// Only weight classes that actually have fighters, in canonical order
const PRESENT_CLASSES = WEIGHT_CLASS_DATA.filter((wc) =>
  enriched.some((f) => f.weight_class === wc.name),
);

function sortFighters(fighters: typeof enriched) {
  return [...fighters].sort((a, b) => {
    if (b.wins !== a.wins)     return b.wins   - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    return b.draws - a.draws;
  });
}

const MEDAL_STYLE: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

export default function RankingsPage() {
  const [activeClass, setActiveClass] = useState<string>(PRESENT_CLASSES[0]?.name ?? "");

  const fighters = sortFighters(
    enriched.filter((f) => f.weight_class === activeClass),
  );

  const wc = WEIGHT_CLASS_DATA.find((w) => w.name === activeClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-display font-bold tracking-widest flex items-center gap-3">
          <Medal className="h-7 w-7 text-accent" />
          Rang lista
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ljestvica boraca po kategorijama — sortirano po pobjedama
        </p>
      </div>

      {/* Weight class tabs */}
      <div className="flex flex-wrap gap-2 animate-fade-up-delay-1">
        {PRESENT_CLASSES.map((wc) => {
          const active = wc.name === activeClass;
          return (
            <button
              key={wc.name}
              onClick={() => setActiveClass(wc.name)}
              className={`font-display text-xs uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-primary border-primary text-white shadow-glow-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {wc.short}
            </button>
          );
        })}
      </div>

      {/* Category label */}
      <div className="animate-fade-up-delay-2">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-xl font-bold tracking-widest">{activeClass}</h2>
          {wc && (
            <span className="text-xs text-muted-foreground border border-border/40 rounded-full px-2 py-0.5">
              do {wc.limit_kg} kg
            </span>
          )}
        </div>
      </div>

      {/* Rankings table */}
      <div className="border border-border/60 rounded-xl overflow-hidden animate-fade-up-delay-2">
        {/* Table header */}
        <div className="grid grid-cols-[48px_1fr_auto_auto] gap-4 px-5 py-2.5 bg-secondary/40 border-b border-border/40">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-center">#</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Borac</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Klub</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right pr-1">Rekord</span>
        </div>

        {fighters.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nema registriranih boraca u ovoj kategoriji.
          </div>
        ) : (
          fighters.map((f, idx) => {
            const rank   = idx + 1;
            const isTop  = rank <= 3;
            const total  = f.wins + f.losses + f.draws;
            const winPct = total > 0 ? Math.round((f.wins / total) * 100) : 0;

            return (
              <Link
                key={f.id}
                to={`/app/fighters/${f.id}`}
                className={`grid grid-cols-[48px_1fr_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-border/30 last:border-b-0 transition-all duration-150 hover:bg-secondary/40 cursor-pointer group ${
                  rank === 1 ? "bg-yellow-500/5" :
                  rank === 2 ? "bg-slate-500/5"  :
                  rank === 3 ? "bg-amber-700/5"  : ""
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  {isTop ? (
                    <span className={`font-display text-lg font-black ${MEDAL_STYLE[rank]}`}>
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span className="font-display text-sm font-bold text-muted-foreground/60 text-center w-full">
                      {rank}
                    </span>
                  )}
                </div>

                {/* Fighter */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full border border-border/50 bg-secondary/60 shrink-0 overflow-hidden">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} alt={f.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[13px] font-bold text-muted-foreground">
                        {f.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {f.full_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {winPct}% pobjeda
                    </p>
                  </div>
                </div>

                {/* Club */}
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {f.club_name}
                </span>

                {/* Record */}
                <div className="flex items-center gap-1 text-sm font-mono font-bold text-right">
                  <span className="text-green-400">{f.wins}</span>
                  <span className="text-muted-foreground/40">-</span>
                  <span className="text-primary">{f.losses}</span>
                  <span className="text-muted-foreground/40">-</span>
                  <span className="text-muted-foreground">{f.draws}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground animate-fade-up-delay-3">
        <span className="flex items-center gap-1.5"><span className="text-green-400 font-bold">P</span> Pobjede</span>
        <span className="flex items-center gap-1.5"><span className="text-primary font-bold">P</span> Porazi</span>
        <span className="flex items-center gap-1.5"><span className="text-muted-foreground font-bold">N</span> Neriješeno</span>
      </div>
    </div>
  );
}
