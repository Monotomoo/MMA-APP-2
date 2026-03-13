import { useState, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTournament } from "@/hooks/useTournament";
import { useFighters } from "@/hooks/useFighters";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, MapPin, Users, Activity, UserPlus, Plus, Clock, ShieldCheck, Users2 } from "lucide-react";

function initials(name: string) {
  if (name === "TBD") return "?";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
import { CLUBS, FIGHTERS, getFighterName, AGE_GROUPS } from "@/lib/demo-data";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  upcoming:  "bg-blue-500/10 text-blue-600 border-blue-500/30",
  active:    "bg-green-500/10 text-green-600 border-green-500/30",
  completed: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming:  "nadolazeći",
  active:    "aktivan",
  completed: "završen",
};

const REG_COLORS: Record<string, string> = {
  approved: "bg-green-500/10 text-green-600 border-green-500/30",
  pending:  "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  rejected: "bg-red-500/10 text-red-600 border-red-500/30",
};

const REG_LABELS: Record<string, string> = {
  approved: "odobren",
  pending:  "na čekanju",
  rejected: "odbijen",
};

const METHODS = ["KO", "TKO", "Submission", "Decision"];

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("hr-HR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

// ── Bracket tree helpers ──────────────────────────────────────────────────────
const CARD_H = 100; // px — must match bout card height exactly
const CONN_W = 24;

type BoutRow = {
  id: string; bout_order: number; status: string;
  fighter_a_id: string; fighter_b_id: string | null;
  winner_id: string | null; method: string | null; round: number | null;
  fighter_a_name: string; fighter_b_name: string;
  fighter_a_avatar: string | null; fighter_b_avatar: string | null;
};

function buildRounds(bouts: BoutRow[]): BoutRow[][] {
  if (!bouts.length) return [];
  const sorted = [...bouts].sort((a, b) => a.bout_order - b.bout_order);
  const rounds: BoutRow[][] = [];
  let rem = sorted;
  while (rem.length > 0) {
    const sz = Math.pow(2, Math.floor(Math.log2(rem.length)));
    rounds.push(rem.slice(0, sz));
    rem = rem.slice(sz);
  }
  return rounds;
}

function getRoundLabel(nRounds: number, ri: number): string {
  const f = nRounds - 1 - ri;
  if (f === 0) return "Finale";
  if (f === 1) return "Polufinale";
  if (f === 2) return "Četvrtfinale";
  const sz = Math.pow(2, nRounds - 1 - ri + 1);
  return `1/${sz} Finala`;
}

const addMatchSchema = z.object({
  fighter_a_id: z.string().min(1, "Odaberi borca A"),
  fighter_b_id: z.string(),
});

const recordResultSchema = z.object({
  winner_id: z.string().min(1, "Odaberi pobjednika"),
  method:    z.string().min(1, "Odaberi metodu"),
  round:     z.coerce.number().int().min(1).max(10),
});

type AddMatchForm = z.infer<typeof addMatchSchema>;
type RecordResultForm = z.infer<typeof recordResultSchema>;

interface RecordingMatch {
  id: string;
  fighter_a_id: string;
  fighter_b_id: string | null;
  fighter_a_name: string;
  fighter_b_name: string;
}

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, registrations, bouts, register, addMatch, recordResult } = useTournament(id!);
  const { profile, role, isCoach, isAdmin } = useAuth();

  const isFighter = role === "fighter";
  const canManageRegs = isCoach || isAdmin;

  // Fighter's own registration (read-only display)
  const myReg = isFighter && profile
    ? registrations.find((r) => r.fighter_id === profile.id) ?? null
    : null;

  // Coach/admin: get their club's fighters for registration management
  const coachClubId = canManageRegs && profile
    ? CLUBS.find((c) => c.coach_id === profile.id)?.id ?? "club-1"
    : "club-1";
  const { fighters: clubFighters } = useFighters(coachClubId);

  function handleRegisterFighter(fighterId: string, fighterName: string) {
    register(fighterId);
    toast.success(`${fighterName} prijavljen — čeka odobrenje.`);
  }

  // ── Bout view toggle ─────────────────────────────────────────────────────
  const [boutView, setBoutView] = useState<"list" | "bracket">("bracket");

  // ── Add Match dialog ──────────────────────────────────────────────────────
  const [addMatchOpen, setAddMatchOpen] = useState(false);
  const addMatchForm = useForm<AddMatchForm>({
    resolver: zodResolver(addMatchSchema),
    defaultValues: { fighter_a_id: "", fighter_b_id: "" },
  });

  function onAddMatch(data: AddMatchForm) {
    addMatch({
      tournament_id: id!,
      fighter_a_id:  data.fighter_a_id,
      fighter_b_id:  data.fighter_b_id || null,
      winner_id:     null,
      method:        null,
      round:         null,
      bout_order:    bouts.length + 1,
      status:        "scheduled",
    });
    toast.success("Meč dodan.");
    setAddMatchOpen(false);
    addMatchForm.reset();
  }

  // ── Record Result dialog ──────────────────────────────────────────────────
  const [recordingMatch, setRecordingMatch] = useState<RecordingMatch | null>(null);
  const resultForm = useForm<RecordResultForm>({
    resolver: zodResolver(recordResultSchema),
    defaultValues: { winner_id: "", method: "", round: 3 },
  });

  function openRecordResult(b: RecordingMatch) {
    resultForm.reset({ winner_id: "", method: "", round: 3 });
    setRecordingMatch(b);
  }

  function onRecordResult(data: RecordResultForm) {
    if (!recordingMatch) return;
    recordResult(recordingMatch.id, {
      winner_id: data.winner_id,
      method:    data.method,
      round:     data.round,
    });
    toast.success("Rezultat unesen.");
    setRecordingMatch(null);
  }

  // ── Pre-compute bracket tree JSX ─────────────────────────────────────────
  const bracketView = (() => {
    const rounds = buildRounds(bouts);
    if (!rounds.length) return <p className="text-sm text-muted-foreground">Nema mečeva.</p>;
    const nRounds = rounds.length;
    const CARD_W = 210;
    const rowH   = Math.floor(CARD_H * 0.41);
    const vsH    = CARD_H - rowH * 2;
    return (
      <div className="overflow-x-auto pb-2">
        {/* Round labels */}
        <div className="flex mb-4">
          {rounds.map((_, ri) => {
            const isFinal = ri === nRounds - 1;
            const colW = CARD_W + (ri < nRounds - 1 ? CONN_W : 0);
            return (
              <div key={ri} className="text-center shrink-0" style={{ width: colW }}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isFinal ? "text-primary" : "text-muted-foreground/70"}`}>
                  {getRoundLabel(nRounds, ri)}
                </span>
                {isFinal && <div className="h-0.5 w-8 bg-primary rounded mx-auto mt-0.5" />}
              </div>
            );
          })}
        </div>
        {/* Bracket columns */}
        <div className="flex items-start min-w-max">
          {rounds.map((round, ri) => {
            const gapR   = (Math.pow(2, ri) - 1) * CARD_H;
            const topOff = (Math.pow(2, ri) - 1) * CARD_H / 2;
            const connH  = CARD_H + gapR;
            const nConns = Math.floor(round.length / 2);
            const isFinalRound = ri === nRounds - 1;
            return (
              <Fragment key={ri}>
                <div className="flex flex-col shrink-0" style={{ width: CARD_W, marginTop: topOff }}>
                  <div className="flex flex-col" style={{ gap: gapR }}>
                    {round.map((b) => {
                      const aWins = b.winner_id === b.fighter_a_id;
                      const bWins = b.winner_id === b.fighter_b_id;
                      const done  = b.status === "completed";
                      const isTbd = !b.fighter_b_id || b.fighter_a_id.startsWith("tbd-");
                      return (
                        <div
                          key={b.id}
                          className={`overflow-hidden shrink-0 rounded-lg border ${
                            isFinalRound
                              ? "border-primary/40 shadow-glow-primary bg-card"
                              : done
                                ? "border-border/80 bg-card"
                                : isTbd
                                  ? "border-border/30 bg-muted/20"
                                  : "border-border/60 bg-card"
                          }`}
                          style={{ height: CARD_H, width: CARD_W }}
                        >
                          {/* Fighter A row */}
                          <div
                            className={`flex items-center gap-1.5 px-2.5 border-b ${
                              aWins ? "bg-primary/10" : done && b.winner_id ? "opacity-40" : ""
                            }`}
                            style={{ height: rowH }}
                          >
                            <Avatar className="h-5 w-5 shrink-0">
                              <AvatarImage src={b.fighter_a_avatar ?? undefined} />
                              <AvatarFallback className="text-[8px] font-bold">{initials(b.fighter_a_name)}</AvatarFallback>
                            </Avatar>
                            <span className={`flex-1 truncate text-[11px] leading-tight ${
                              aWins ? "font-bold text-primary" : isTbd ? "italic text-muted-foreground/60 text-[10px]" : ""
                            }`}>
                              {b.fighter_a_name}
                            </span>
                            {aWins && <span className="text-primary text-[10px] shrink-0 font-bold">✓</span>}
                          </div>
                          {/* VS bar */}
                          <div className="flex items-center justify-between border-b px-2.5 bg-muted/30" style={{ height: vsH }}>
                            <span className="text-[8px] text-muted-foreground/50 font-black tracking-[0.2em]">VS</span>
                            {done && b.method && (
                              <span className="text-[9px] text-muted-foreground font-semibold">
                                {b.method} · R{b.round}
                              </span>
                            )}
                            {!done && !isTbd && (
                              <span className="text-[8px] text-blue-400/60 font-medium tracking-wide">Zakazano</span>
                            )}
                          </div>
                          {/* Fighter B row */}
                          <div
                            className={`flex items-center gap-1.5 px-2.5 ${
                              bWins ? "bg-primary/10" : done && b.winner_id ? "opacity-40" : ""
                            }`}
                            style={{ height: rowH }}
                          >
                            <Avatar className="h-5 w-5 shrink-0">
                              <AvatarImage src={b.fighter_b_avatar ?? undefined} />
                              <AvatarFallback className="text-[8px] font-bold">{initials(b.fighter_b_name)}</AvatarFallback>
                            </Avatar>
                            <span className={`flex-1 truncate text-[11px] leading-tight ${
                              bWins ? "font-bold text-primary"
                              : !b.fighter_b_id || b.fighter_b_id.startsWith("tbd-") ? "italic text-muted-foreground/60 text-[10px]"
                              : ""
                            }`}>
                              {b.fighter_b_name}
                            </span>
                            {bWins && <span className="text-primary text-[10px] shrink-0 font-bold">✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Connectors */}
                {ri < nRounds - 1 && nConns > 0 && (
                  <div
                    className="flex flex-col shrink-0"
                    style={{ width: CONN_W, marginTop: topOff + CARD_H / 2, gap: connH }}
                  >
                    {Array.from({ length: nConns }).map((_, ci) => (
                      <div key={ci} style={{ height: connH }}>
                        <div className="border-r-2 border-b-2 border-primary/20 rounded-br" style={{ height: connH / 2 }} />
                        <div className="border-r-2 border-t-2 border-primary/20 rounded-tr" style={{ height: connH / 2 }} />
                      </div>
                    ))}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  })();

  if (!tournament) {
    return (
      <div className="space-y-4">
        <Link to="/app/tournaments" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Turniri
        </Link>
        <p className="text-muted-foreground">Turnir nije pronađen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/tournaments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Turniri
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <Badge className={STATUS_COLORS[tournament.status]} variant="outline">
            {STATUS_LABELS[tournament.status] ?? tournament.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
          {tournament.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />{fmt(tournament.date)}
            </span>
          )}
          {tournament.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />{tournament.location}
            </span>
          )}
          {tournament.registration_deadline && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />Rok: {fmt(tournament.registration_deadline)}
            </span>
          )}
          {tournament.max_fighters && (
            <span className="flex items-center gap-1">
              <Users2 className="h-4 w-4" />Maks. {tournament.max_fighters} boraca
            </span>
          )}
          {tournament.rules && (
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />{tournament.rules}
            </span>
          )}
        </div>
        {tournament.categories?.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded border border-border/60">
            <table className="text-xs w-full min-w-max">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Dobna skupina</th>
                  <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Kategorije (kg limit)</th>
                </tr>
              </thead>
              <tbody>
                {AGE_GROUPS.filter((ag) => tournament.categories.some((c) => c.age_group === ag.id)).map((ag, ri) => {
                  const cats = tournament.categories.filter((c) => c.age_group === ag.id).sort((a, b) => a.weight_limit_kg - b.weight_limit_kg);
                  return (
                    <tr key={ag.id} className={ri % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                      <td className="px-3 py-2 font-medium whitespace-nowrap">
                        {ag.label} <span className="text-muted-foreground font-normal">({ag.min_age}–{ag.max_age ?? "+"})</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {cats.map((c) => (
                            <span key={c.weight_class} className="inline-flex items-center gap-1 border border-border/60 rounded px-1.5 py-0.5 bg-muted/30 text-foreground">
                              {c.weight_class}
                              <span className="text-muted-foreground">do {c.weight_limit_kg} kg</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {tournament.gender && tournament.gender !== "open" && (
          <Badge variant="outline" className="border-border/60 mt-2">
            {tournament.gender === "male" ? "Muško" : "Žensko"}
          </Badge>
        )}
        {tournament.description && (
          <p className="mt-3 text-sm text-muted-foreground">{tournament.description}</p>
        )}

        {/* Fighter: read-only registration status */}
        {isFighter && myReg && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Vaša prijava:</span>
            <Badge className={REG_COLORS[myReg.status]} variant="outline">
              {REG_LABELS[myReg.status] ?? myReg.status}
            </Badge>
          </div>
        )}
      </div>

      {/* Matches */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Mečevi ({bouts.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              {bouts.length > 0 && (
                <div className="flex rounded-md border overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => setBoutView("list")}
                    className={`px-3 py-1 transition-colors ${boutView === "list" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                  >
                    Mečevi
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoutView("bracket")}
                    className={`px-3 py-1 border-l transition-colors ${boutView === "bracket" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                  >
                    Bracket
                  </button>
                </div>
              )}
              {isAdmin && (
                <Button
                  size="sm" variant="outline"
                  onClick={() => { addMatchForm.reset({ fighter_a_id: "", fighter_b_id: "" }); setAddMatchOpen(true); }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Dodaj meč
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema zakazanih mečeva.</p>
          ) : boutView === "bracket" ? bracketView : (
            <div className="space-y-3">
              {bouts.map((b) => {
                const isCompleted = b.status === "completed";
                const aWins = b.winner_id === b.fighter_a_id;
                const bWins = b.winner_id === b.fighter_b_id;
                const aWeight = FIGHTERS.find((f) => f.id === b.fighter_a_id)?.weight_class;
                const bWeight = b.fighter_b_id ? FIGHTERS.find((f) => f.id === b.fighter_b_id)?.weight_class : null;
                return (
                  <div key={b.id} className="rounded-lg border bg-card p-4 space-y-3">
                    {/* Card header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Meč {b.bout_order}</span>
                      <Badge
                        variant="outline"
                        className={isCompleted
                          ? "bg-gray-500/10 text-gray-500 border-gray-500/30"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/30"}
                      >
                        {isCompleted ? "Završeno" : "Zakazano"}
                      </Badge>
                    </div>

                    {/* Fighters row */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                      {/* Fighter A */}
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className={`h-14 w-14 ${aWins ? "ring-2 ring-green-500 ring-offset-2" : ""}`}>
                          <AvatarImage src={b.fighter_a_avatar ?? undefined} alt={b.fighter_a_name} />
                          <AvatarFallback className="text-sm font-bold">{initials(b.fighter_a_name)}</AvatarFallback>
                        </Avatar>
                        <p className={`font-semibold text-center text-sm ${aWins ? "text-green-600" : isCompleted && b.winner_id ? "text-muted-foreground" : ""}`}>
                          {b.fighter_a_name}
                        </p>
                        {aWeight && <p className="text-xs text-muted-foreground text-center">{aWeight}</p>}
                        {aWins && <p className="text-xs font-medium text-green-600 text-center">🏆 Pobjednik</p>}
                      </div>

                      {/* VS */}
                      <div className="text-center px-2">
                        <span className="text-base font-black tracking-widest text-muted-foreground">VS</span>
                      </div>

                      {/* Fighter B */}
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className={`h-14 w-14 ${bWins ? "ring-2 ring-green-500 ring-offset-2" : ""}`}>
                          <AvatarImage src={b.fighter_b_avatar ?? undefined} alt={b.fighter_b_name} />
                          <AvatarFallback className="text-sm font-bold">{initials(b.fighter_b_name)}</AvatarFallback>
                        </Avatar>
                        <p className={`font-semibold text-center text-sm ${bWins ? "text-green-600" : isCompleted && b.winner_id ? "text-muted-foreground" : !b.fighter_b_id ? "italic text-muted-foreground" : ""}`}>
                          {b.fighter_b_name}
                        </p>
                        {bWeight && <p className="text-xs text-muted-foreground text-center">{bWeight}</p>}
                        {bWins && <p className="text-xs font-medium text-green-600 text-center">🏆 Pobjednik</p>}
                      </div>
                    </div>

                    {/* Footer */}
                    {isCompleted && b.method ? (
                      <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{b.winner_name}</span>
                        <span>·</span>
                        <Badge variant="secondary" className="text-xs h-5">{b.method}</Badge>
                        <span>·</span>
                        <span>Runda {b.round}</span>
                      </div>
                    ) : isAdmin && !isCompleted && b.fighter_b_id ? (
                      <div className="pt-2 border-t">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openRecordResult(b)}>
                          Unesi rezultat
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registered fighters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registrirani borci ({registrations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema registriranih boraca.</p>
          ) : (
            <div className="divide-y">
              {registrations.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{r.fighter_name}</p>
                    {r.weight_class && (
                      <p className="text-sm text-muted-foreground">{r.weight_class}</p>
                    )}
                  </div>
                  <Badge className={REG_COLORS[r.status]} variant="outline">
                    {REG_LABELS[r.status] ?? r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coach / Admin: register club fighters */}
      {canManageRegs && tournament.status !== "completed" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Prijavi borce kluba
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clubFighters.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema boraca u klubu.</p>
            ) : (
              <div className="divide-y">
                {clubFighters.map((f) => {
                  const reg = registrations.find((r) => r.fighter_id === f.id);
                  return (
                    <div key={f.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{f.full_name}</p>
                        {f.weight_class && (
                          <p className="text-sm text-muted-foreground">{f.weight_class}</p>
                        )}
                      </div>
                      {reg ? (
                        <Badge className={REG_COLORS[reg.status]} variant="outline">
                          {REG_LABELS[reg.status] ?? reg.status}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRegisterFighter(f.id, f.full_name)}
                        >
                          Prijavi
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Match Dialog */}
      <Dialog open={addMatchOpen} onOpenChange={(open) => { if (!open) setAddMatchOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj meč</DialogTitle>
          </DialogHeader>
          <Form {...addMatchForm}>
            <form onSubmit={addMatchForm.handleSubmit(onAddMatch)} className="space-y-4">
              <FormField control={addMatchForm.control} name="fighter_a_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Borac A</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Odaberi borca" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {FIGHTERS.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{getFighterName(f.id)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={addMatchForm.control} name="fighter_b_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Borac B <span className="text-muted-foreground">(opcionalno)</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="TBD" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {FIGHTERS.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{getFighterName(f.id)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddMatchOpen(false)}>Odustani</Button>
                <Button type="submit">Dodaj</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Record Result Dialog */}
      <Dialog open={!!recordingMatch} onOpenChange={(open) => { if (!open) setRecordingMatch(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unesi rezultat</DialogTitle>
          </DialogHeader>
          <Form {...resultForm}>
            <form onSubmit={resultForm.handleSubmit(onRecordResult)} className="space-y-4">
              <FormField control={resultForm.control} name="winner_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pobjednik</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Odaberi pobjednika" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {recordingMatch && (
                        <>
                          <SelectItem value={recordingMatch.fighter_a_id}>
                            {recordingMatch.fighter_a_name}
                          </SelectItem>
                          {recordingMatch.fighter_b_id && (
                            <SelectItem value={recordingMatch.fighter_b_id}>
                              {recordingMatch.fighter_b_name}
                            </SelectItem>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={resultForm.control} name="method" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metoda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {METHODS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={resultForm.control} name="round" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Runda</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={10} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRecordingMatch(null)}>Odustani</Button>
                <Button type="submit">Spremi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
