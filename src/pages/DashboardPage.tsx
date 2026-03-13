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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus, Trophy, Users, Calendar, Dumbbell, TrendingUp,
  ClipboardList, Zap, Flame, ChevronRight, Star
} from "lucide-react";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

const TYPE_COLORS: Record<string, string> = {
  striking:     "bg-red-500/10    text-red-400    border-red-500/25",
  grappling:    "bg-blue-500/10   text-blue-400   border-blue-500/25",
  sparring:     "bg-orange-500/10 text-orange-400 border-orange-500/25",
  conditioning: "bg-green-500/10  text-green-400  border-green-500/25",
  open_mat:     "bg-purple-500/10 text-purple-400 border-purple-500/25",
  other:        "bg-gray-500/10   text-gray-400   border-gray-500/25",
};

const TYPE_ICON_COLOR: Record<string, string> = {
  striking:     "text-red-400",
  grappling:    "text-blue-400",
  sparring:     "text-orange-400",
  conditioning: "text-green-400",
  open_mat:     "text-purple-400",
  other:        "text-gray-400",
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

// ─── Hero Banner ─────────────────────────────────────────────────────────────

function HeroBanner({ name, canPost, onPost }: {
  name: string | null;
  canPost: boolean;
  onPost: () => void;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card animate-fade-up">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 100% at -10% 50%, rgba(220,38,38,0.18) 0%, transparent 65%), radial-gradient(ellipse 60% 80% at 110% 50%, rgba(202,138,4,0.10) 0%, transparent 60%)",
        }}
      />
      {/* Diagonal accent stripe */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5"
        style={{ background: "linear-gradient(180deg, hsl(0 85% 52%), hsl(40 100% 46%))" }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4 px-8 py-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary/80 font-semibold">Dashboard</span>
          </div>
          <h1 className="font-display text-4xl font-black tracking-widest text-foreground leading-none">
            {name ? `Dobrodošli, ${name}` : "Početna"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Pregled aktivnosti, treninga i turnira
          </p>
        </div>
        {canPost && (
          <Button
            onClick={onPost}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary hover:shadow-glow-primary-strong cursor-pointer transition-all duration-200 shrink-0 font-display tracking-wider uppercase text-sm"
          >
            <Plus className="h-4 w-4" /> Nova objava
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Big Stat Card ────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accentColor = "primary", delay = "", pulse = false,
}: {
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  icon: React.ElementType;
  accentColor?: "primary" | "gold" | "green";
  delay?: string;
  pulse?: boolean;
}) {
  const colors = {
    primary: { bg: "bg-primary/15",    text: "text-primary",      glow: "card-hover-glow"      },
    gold:    { bg: "bg-accent/15",     text: "text-accent",       glow: "card-hover-glow-gold" },
    green:   { bg: "bg-emerald-500/15", text: "text-emerald-400", glow: "card-hover-glow"      },
  };
  const c = colors[accentColor];

  return (
    <Card className={`${c.glow} ${pulse ? "animate-border-pulse animate-pulse-glow" : ""} animate-fade-up ${delay} border-border/60 bg-card relative overflow-hidden`}>
      {/* Subtle corner accent */}
      <div className={`absolute top-0 right-0 h-16 w-16 opacity-10 rounded-bl-full ${accentColor === "gold" ? "bg-accent" : accentColor === "green" ? "bg-emerald-400" : "bg-primary"}`} />
      <CardContent className="pt-5 pb-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg}`}>
            <Icon className={`h-4 w-4 ${c.text}`} />
          </div>
        </div>
        <p className="text-4xl font-display font-black tracking-wide leading-none stat-underline">{value}</p>
        <p className="text-xs text-muted-foreground mt-3">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { announcements, create } = useAnnouncements();
  const { profile, isCoach, isAdmin } = useAuth();
  const canPost = isCoach || isAdmin;

  const userClubId = (() => {
    if (!profile) return null;
    if (profile.role === "coach")   return CLUBS.find((c) => c.coach_id === profile.id)?.id ?? null;
    if (profile.role === "fighter") return FIGHTERS.find((f) => f.id === profile.id)?.club_id ?? null;
    return null;
  })();

  const myFighter    = profile?.role === "fighter" ? FIGHTERS.find((f) => f.id === profile.id) : null;
  const myClub       = userClubId ? CLUBS.find((c) => c.id === userClubId) : null;
  const clubFighters = userClubId ? FIGHTERS.filter((f) => f.club_id === userClubId) : FIGHTERS;
  const pendingCount = REGISTRATIONS.filter((r) => {
    if (r.status !== "pending") return false;
    if (!userClubId) return true;
    return FIGHTERS.find((f) => f.id === r.fighter_id)?.club_id === userClubId;
  }).length;

  const todayDow = new Date().getDay();
  const sessions = TRAINING_SESSIONS.filter((s) => {
    if (!s.is_active) return false;
    return userClubId ? s.club_id === userClubId : true;
  });
  const upcomingSessions = [...sessions].sort((a, b) => {
    const da = (a.day_of_week - todayDow + 7) % 7 || 7;
    const db = (b.day_of_week - todayDow + 7) % 7 || 7;
    return da !== db ? da - db : a.start_time.localeCompare(b.start_time);
  }).slice(0, 5);

  const today = new Date().toISOString().slice(0, 10);
  const nextTournament = TOURNAMENTS
    .filter((t) => t.status === "upcoming" && t.date && t.date >= today)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))[0] ?? null;

  const recentResults = BOUTS
    .filter((b) => b.status === "completed")
    .map((b) => ({
      ...b,
      fighter_a_name: getFighterName(b.fighter_a_id),
      fighter_b_name: getFighterName(b.fighter_b_id),
      tournament_name: TOURNAMENTS.find((t) => t.id === b.tournament_id)?.name ?? "",
    }))
    .slice(-4).reverse();

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

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <HeroBanner
        name={profile?.full_name.split(" ")[0] ?? null}
        canPost={canPost}
        onPost={() => { form.reset(); setDialogOpen(true); }}
      />

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {myFighter && (
          <StatCard
            label="Rekord"
            value={
              <span>
                <span className="text-emerald-400">{myFighter.wins}</span>
                <span className="text-muted-foreground/40 text-2xl font-normal mx-1">-</span>
                <span className="text-primary">{myFighter.losses}</span>
                <span className="text-muted-foreground/40 text-2xl font-normal mx-1">-</span>
                <span className="text-muted-foreground">{myFighter.draws}</span>
              </span>
            }
            sub={<span className="font-medium text-accent/80">{myFighter.weight_class}</span>}
            icon={TrendingUp}
            delay="animate-fade-up-delay-1"
          />
        )}

        <StatCard
          label={isAdmin ? "Ukupno boraca" : "Borci kluba"}
          value={clubFighters.length}
          sub={isAdmin ? `${CLUBS.length} kluba registrirano` : (myClub?.name ?? "")}
          icon={Users}
          delay="animate-fade-up-delay-1"
        />

        {isAdmin && (
          <StatCard
            label="Turniri"
            value={TOURNAMENTS.length}
            sub={`${TOURNAMENTS.filter((t) => t.status === "upcoming").length} nadolazećih`}
            icon={Trophy}
            accentColor="gold"
            delay="animate-fade-up-delay-2"
          />
        )}

        {isCoach && (
          <StatCard
            label="Prijave"
            value={pendingCount}
            sub={pendingCount > 0
              ? <Link to="/app/my-club" className="text-accent hover:text-accent/80 transition-colors cursor-pointer font-semibold">na čekanju →</Link>
              : "nema na čekanju"
            }
            icon={ClipboardList}
            accentColor={pendingCount > 0 ? "gold" : "primary"}
            pulse={pendingCount > 0}
            delay="animate-fade-up-delay-2"
          />
        )}
      </div>

      {/* ── Training + Tournament ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Upcoming sessions */}
        <Card className="card-hover-glow animate-fade-up animate-fade-up-delay-2 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg tracking-wider flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              Nadolazeći treninzi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema zakazanih treninga.</p>
            ) : upcomingSessions.map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all duration-150 ${TYPE_COLORS[s.session_type] ?? TYPE_COLORS.other}`}
              >
                <div className="flex items-center gap-2.5">
                  <Zap className={`h-3.5 w-3.5 shrink-0 ${TYPE_ICON_COLOR[s.session_type] ?? "text-gray-400"}`} />
                  <div>
                    <span className="font-bold">{DAYS[s.day_of_week]}</span>
                    <span className="mx-1.5 text-muted-foreground opacity-50">·</span>
                    <span className="font-medium">{s.title}</span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs opacity-70">{s.start_time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next tournament */}
        <Card className="card-hover-glow card-hover-glow-gold animate-fade-up animate-fade-up-delay-3 border-border/60 relative overflow-hidden">
          {/* Gold corner glow */}
          <div className="absolute bottom-0 right-0 h-24 w-24 opacity-10 bg-accent rounded-tl-full pointer-events-none" />
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg tracking-wider flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
                <Trophy className="h-4 w-4 text-accent" />
              </div>
              Sljedeći turnir
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!nextTournament ? (
              <p className="text-sm text-muted-foreground">Nema najavljenih turnira.</p>
            ) : (
              <Link to={`/app/tournaments/${nextTournament.id}`} className="block group cursor-pointer">
                <p className="font-display font-black text-2xl tracking-wide group-hover:text-accent transition-colors leading-snug">
                  {nextTournament.name}
                </p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                  {nextTournament.date && (
                    <span className="flex items-center gap-1.5 bg-secondary/60 border border-border/40 rounded-full px-3 py-1">
                      <Calendar className="h-3 w-3" />
                      {new Intl.DateTimeFormat("hr-HR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(nextTournament.date))}
                    </span>
                  )}
                  {nextTournament.location && (
                    <span className="flex items-center gap-1.5 bg-secondary/60 border border-border/40 rounded-full px-3 py-1">
                      {nextTournament.location}
                    </span>
                  )}
                </div>
                {nextTournament.categories?.length > 0 && (
                  <Badge variant="outline" className="mt-3 border-accent/40 text-accent text-xs">
                    {nextTournament.categories.length} {nextTournament.categories.length === 1 ? "kategorija" : "kategorije"}
                  </Badge>
                )}
                <div className="mt-4 flex items-center gap-1 text-xs text-accent/70 group-hover:text-accent transition-colors font-semibold">
                  Detalji <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent results ───────────────────────────────────────────────────── */}
      {recentResults.length > 0 && (
        <section className="space-y-3 animate-fade-up animate-fade-up-delay-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest">Nedavni rezultati</h2>
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentResults.map((b) => {
              const aWins = b.winner_id === b.fighter_a_id;
              return (
                <Card key={b.id} className="overflow-hidden card-hover-glow border-border/60">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-widest truncate">{b.tournament_name}</p>
                    <div className="flex items-center gap-2">
                      {/* Fighter A */}
                      <div className={`flex items-center gap-2 flex-1 min-w-0 ${aWins ? "" : "opacity-30"}`}>
                        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/50">
                          <AvatarFallback className="text-[10px] font-black bg-secondary">{initials(b.fighter_a_name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${aWins ? "text-foreground" : "text-muted-foreground"}`}>{b.fighter_a_name}</p>
                          {aWins && <p className="text-[10px] text-emerald-400 font-bold uppercase">WIN</p>}
                        </div>
                      </div>

                      {/* VS pill */}
                      <div className="shrink-0 px-2 text-center">
                        <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest bg-secondary/60 border border-border/40 rounded-full px-2 py-0.5">VS</div>
                        {b.method && <div className="text-[9px] text-primary/80 font-bold uppercase mt-1">{b.method}</div>}
                      </div>

                      {/* Fighter B */}
                      <div className={`flex items-center gap-2 flex-1 min-w-0 justify-end ${!aWins ? "" : "opacity-30"}`}>
                        <div className="min-w-0 text-right">
                          <p className={`text-xs font-bold truncate ${!aWins ? "text-foreground" : "text-muted-foreground"}`}>{b.fighter_b_name}</p>
                          {!aWins && <p className="text-[10px] text-emerald-400 font-bold uppercase">WIN</p>}
                        </div>
                        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border/50">
                          <AvatarFallback className="text-[10px] font-black bg-secondary">{initials(b.fighter_b_name)}</AvatarFallback>
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

      {/* ── Announcements ────────────────────────────────────────────────────── */}
      <section className="space-y-4 animate-fade-up animate-fade-up-delay-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest">Vijesti</h2>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">Nema objava.</p>
        )}
        {announcements.map((a) => (
          <Card key={a.id} className="border-l-accent-glow card-hover-glow border-border/60 group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="font-display text-xl tracking-wide leading-tight group-hover:text-primary transition-colors">
                  {a.title}
                </CardTitle>
                <Star className="h-4 w-4 text-accent/50 shrink-0 mt-0.5" />
              </div>
              <CardDescription className="text-xs">
                <span className="text-accent/80 font-semibold">{a.author_name}</span>
                {" · "}
                {new Intl.DateTimeFormat("hr-HR", {
                  day: "numeric", month: "long", year: "numeric",
                }).format(new Date(a.created_at))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/85">{a.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Post announcement dialog ─────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent className="bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider text-xl">Nova objava</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Naslov</FormLabel>
                  <FormControl><Input placeholder="Naslov objave" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="body" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Sadržaj</FormLabel>
                  <FormControl><Textarea placeholder="Napišite objavu..." rows={4} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">Odustani</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-glow-primary cursor-pointer font-display tracking-wider uppercase">Objavi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
