import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import {
  CLUBS, FIGHTERS, BOUTS, TRAINING_SESSIONS, TOURNAMENTS, REGISTRATIONS,
  getFighterName,
} from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Trophy, Users, Calendar, Dumbbell, TrendingUp, ClipboardList } from "lucide-react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

const TYPE_COLORS: Record<string, string> = {
  striking:     "bg-red-500/10    text-red-600    border-red-500/20",
  grappling:    "bg-blue-500/10   text-blue-600   border-blue-500/20",
  sparring:     "bg-orange-500/10 text-orange-600 border-orange-500/20",
  conditioning: "bg-green-500/10  text-green-600  border-green-500/20",
  open_mat:     "bg-purple-500/10 text-purple-600 border-purple-500/20",
  other:        "bg-gray-500/10   text-gray-600   border-gray-500/20",
};

const TYPE_LABELS: Record<string, string> = {
  striking: "Udarački", grappling: "Hrvački", sparring: "Sparring",
  conditioning: "Kondicija", open_mat: "Open Mat", other: "Ostalo",
};

const announcementSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  body:  z.string().min(1, "Sadržaj je obavezan"),
});
type AnnouncementForm = z.infer<typeof announcementSchema>;

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { announcements, create } = useAnnouncements();
  const { profile, isCoach, isAdmin } = useAuth();
  const canPost = isCoach || isAdmin;

  // ── Derive user's club ───────────────────────────────────────────────────
  const userClubId = (() => {
    if (!profile) return null;
    if (profile.role === "coach")   return CLUBS.find((c) => c.coach_id === profile.id)?.id ?? null;
    if (profile.role === "fighter") return FIGHTERS.find((f) => f.id === profile.id)?.club_id ?? null;
    return null; // admin: all clubs
  })();

  // ── Stats ────────────────────────────────────────────────────────────────
  const myFighter   = profile?.role === "fighter" ? FIGHTERS.find((f) => f.id === profile.id) : null;
  const myClub      = userClubId ? CLUBS.find((c) => c.id === userClubId) : null;
  const clubFighters = userClubId ? FIGHTERS.filter((f) => f.club_id === userClubId) : FIGHTERS;
  const pendingCount = REGISTRATIONS.filter((r) => {
    if (r.status !== "pending") return false;
    if (!userClubId) return true;
    return FIGHTERS.find((f) => f.id === r.fighter_id)?.club_id === userClubId;
  }).length;

  // ── Upcoming training this week ──────────────────────────────────────────
  const todayDow  = new Date().getDay(); // 0=Sun … 6=Sat
  const sessions  = TRAINING_SESSIONS.filter((s) => {
    if (!s.is_active) return false;
    if (userClubId) return s.club_id === userClubId;
    return true;
  });
  // Sort sessions by their distance from today (upcoming days first, wrap around)
  const upcomingSessions = [...sessions].sort((a, b) => {
    const da = (a.day_of_week - todayDow + 7) % 7 || 7;
    const db = (b.day_of_week - todayDow + 7) % 7 || 7;
    return da !== db ? da - db : a.start_time.localeCompare(b.start_time);
  }).slice(0, 5);

  // ── Next tournament ──────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const nextTournament = TOURNAMENTS
    .filter((t) => t.status === "upcoming" && t.date && t.date >= today)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))[0] ?? null;

  // ── Recent results ───────────────────────────────────────────────────────
  const recentResults = BOUTS
    .filter((b) => b.status === "completed")
    .map((b) => ({
      ...b,
      fighter_a_name: getFighterName(b.fighter_a_id),
      fighter_b_name: getFighterName(b.fighter_b_id),
      winner_name:    b.winner_id ? getFighterName(b.winner_id) : null,
      loser_name:     b.winner_id
        ? getFighterName(b.winner_id === b.fighter_a_id ? b.fighter_b_id : b.fighter_a_id)
        : null,
      tournament_name: TOURNAMENTS.find((t) => t.id === b.tournament_id)?.name ?? "",
      a_avatar: CLUBS.find(() => true)?.logo_url ?? null, // placeholder
    }))
    .slice(-4)
    .reverse();

  // ── Announcement dialog ──────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<AnnouncementForm>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: "", body: "" },
  });

  function onSubmit(data: AnnouncementForm) {
    create({ title: data.title, body: data.body, author_id: profile?.id ?? "1", club_id: null });
    toast.success("Objava poslana na odobrenje.");
    setDialogOpen(false);
    form.reset();
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Početna</h1>
          <p className="text-muted-foreground">
            {profile ? `Dobrodošli, ${profile.full_name.split(" ")[0]}` : "Vijesti i najave"}
          </p>
        </div>
        {canPost && (
          <Button size="sm" variant="outline" onClick={() => { form.reset(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Nova objava
          </Button>
        )}
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Fighter: record */}
        {myFighter && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" /> Rekord
              </div>
              <p className="text-2xl font-bold">
                <span className="text-green-600">{myFighter.wins}</span>
                <span className="text-muted-foreground text-base font-normal mx-1">-</span>
                <span className="text-red-500">{myFighter.losses}</span>
                <span className="text-muted-foreground text-base font-normal mx-1">-</span>
                <span>{myFighter.draws}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{myFighter.weight_class}</p>
            </CardContent>
          </Card>
        )}

        {/* Club fighters / total fighters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="h-3.5 w-3.5" /> {isAdmin ? "Borci" : "Borci kluba"}
            </div>
            <p className="text-2xl font-bold">{clubFighters.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAdmin ? `${CLUBS.length} kluba` : (myClub?.name ?? "")}
            </p>
          </CardContent>
        </Card>

        {/* Tournaments / pending regs */}
        {isAdmin ? (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Trophy className="h-3.5 w-3.5" /> Turniri
              </div>
              <p className="text-2xl font-bold">{TOURNAMENTS.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {TOURNAMENTS.filter((t) => t.status === "upcoming").length} nadolazećih
              </p>
            </CardContent>
          </Card>
        ) : isCoach ? (
          <Card className={pendingCount > 0 ? "border-yellow-500/40" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <ClipboardList className="h-3.5 w-3.5" /> Prijave
              </div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pendingCount > 0 ? (
                  <Link to="/app/my-club" className="text-yellow-600 hover:underline">na čekanju →</Link>
                ) : "nema na čekanju"}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* ── Upcoming training + Next tournament ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Upcoming training this week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Dumbbell className="h-4 w-4" /> Nadolazeći treninzi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema zakazanih treninga.</p>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${TYPE_COLORS[s.session_type] ?? TYPE_COLORS.other}`}>
                    <div>
                      <span className="font-semibold">{DAYS[s.day_of_week]}</span>
                      <span className="mx-1.5 text-muted-foreground">·</span>
                      <span>{s.title}</span>
                    </div>
                    <span className="shrink-0 text-muted-foreground">{s.start_time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next tournament */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Sljedeći turnir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!nextTournament ? (
              <p className="text-sm text-muted-foreground">Nema najavljenih turnira.</p>
            ) : (
              <Link to={`/app/tournaments/${nextTournament.id}`} className="block group">
                <p className="font-semibold group-hover:text-primary transition-colors leading-snug">
                  {nextTournament.name}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                  {nextTournament.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Intl.DateTimeFormat("hr-HR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(nextTournament.date))}
                    </span>
                  )}
                  {nextTournament.location && <span>{nextTournament.location}</span>}
                </div>
                {nextTournament.weight_class && (
                  <Badge variant="outline" className="mt-2 text-xs">{nextTournament.weight_class}</Badge>
                )}
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent results ────────────────────────────────────────────────── */}
      {recentResults.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nedavni rezultati</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentResults.map((b) => {
              const aWins = b.winner_id === b.fighter_a_id;
              return (
                <Card key={b.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-2 truncate">{b.tournament_name}</p>
                    <div className="flex items-center gap-2">
                      {/* Fighter A */}
                      <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${aWins ? "" : "opacity-40"}`}>
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[9px] font-bold">{initials(b.fighter_a_name)}</AvatarFallback>
                        </Avatar>
                        <span className={`text-xs truncate ${aWins ? "font-semibold" : ""}`}>{b.fighter_a_name}</span>
                        {aWins && <span className="text-green-500 text-[10px] shrink-0">✓</span>}
                      </div>
                      {/* VS + method */}
                      <div className="text-center shrink-0 px-1">
                        <div className="text-[9px] font-bold text-muted-foreground">VS</div>
                        {b.method && <div className="text-[9px] text-muted-foreground">{b.method}</div>}
                      </div>
                      {/* Fighter B */}
                      <div className={`flex items-center gap-1.5 flex-1 min-w-0 justify-end ${!aWins ? "" : "opacity-40"}`}>
                        {!aWins && <span className="text-green-500 text-[10px] shrink-0">✓</span>}
                        <span className={`text-xs truncate text-right ${!aWins ? "font-semibold" : ""}`}>{b.fighter_b_name}</span>
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[9px] font-bold">{initials(b.fighter_b_name)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Announcements ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Vijesti</h2>
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">Nema objava.</p>
        )}
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{a.title}</CardTitle>
              <CardDescription>
                {a.author_name} · {new Intl.DateTimeFormat("hr-HR", {
                  day: "numeric", month: "long", year: "numeric",
                }).format(new Date(a.created_at))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{a.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Post announcement dialog ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova objava</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Naslov</FormLabel>
                  <FormControl><Input placeholder="Naslov objave" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="body" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sadržaj</FormLabel>
                  <FormControl><Textarea placeholder="Napišite objavu..." rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Odustani</Button>
                <Button type="submit">Objavi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
