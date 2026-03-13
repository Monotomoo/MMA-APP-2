import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";
import { getRegistration, TournamentCategory, AGE_GROUPS, WEIGHT_CLASS_DATA, TIER_DATA } from "@/lib/demo-data";
import { Tournament, RegistrationStatus, TournamentTier } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, MapPin, Plus } from "lucide-react";

const WEIGHT_CLASSES = [
  "Strawweight","Flyweight","Bantamweight","Featherweight",
  "Lightweight","Welterweight","Middleweight","Light Heavyweight","Heavyweight",
];

const newTournamentSchema = z.object({
  name:                  z.string().min(1, "Naziv je obavezan"),
  date:                  z.string().optional(),
  location:              z.string().optional(),
  status:                z.enum(["upcoming", "active", "completed"]),
  description:           z.string().optional(),
  registration_deadline: z.string().optional(),
  max_fighters:          z.coerce.number().int().min(1).optional().or(z.literal("")),
  rules:                 z.string().optional(),
  gender:                z.enum(["male", "female", "open"]).optional(),
  tier:                  z.string().optional(),
});
type NewTournamentForm = z.infer<typeof newTournamentSchema>;

function tierBadgeClass(tier: string) {
  if (tier === "prva_borba") return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  if (tier === "b_turnir")   return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  return "bg-accent/20 text-accent border border-accent/30";
}

const STATUS_COLORS: Record<string, string> = {
  upcoming:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming:  "nadolazeći",
  active:    "aktivan",
  completed: "završen",
};

const REG_COLORS: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
};

const REG_LABELS: Record<string, string> = {
  approved: "odobren",
  pending:  "na čekanju",
  rejected: "odbijen",
};

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("hr-HR", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

function TournamentCard({
  t,
  myRegStatus,
}: {
  t: Tournament;
  myRegStatus: RegistrationStatus | null;
}) {
  const isActive = t.status === "active";
  return (
    <Link to={`/app/tournaments/${t.id}`}>
      <div className={`card-hover-glow border rounded-xl p-4 bg-card transition-all duration-200 cursor-pointer ${isActive ? "border-emerald-500/30 animate-border-pulse" : "border-border/60"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl font-bold tracking-wide truncate">{t.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              {t.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />{fmt(t.date)}
                </span>
              )}
              {t.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{t.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {t.categories?.length > 0 && (
              <Badge variant="outline" className="border-border/60 text-xs">
                {t.categories.length} {t.categories.length === 1 ? "kategorija" : "kategorije"}
              </Badge>
            )}
            {t.tier && (
              <Badge className={`${tierBadgeClass(t.tier)} text-xs`} variant="outline">
                {TIER_DATA.find((d) => d.id === t.tier)?.label}
              </Badge>
            )}
            <Badge className={`${STATUS_COLORS[t.status]} text-xs`} variant="outline">
              {STATUS_LABELS[t.status] ?? t.status}
            </Badge>
            {myRegStatus && (
              <Badge className={`${REG_COLORS[myRegStatus]} text-xs`} variant="outline">
                {REG_LABELS[myRegStatus] ?? myRegStatus}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TournamentsPage() {
  const { upcoming, active, completed, createTournament } = useTournaments();
  const { profile, role, isAdmin } = useAuth();
  const isFighter = role === "fighter";

  function myReg(tournamentId: string): RegistrationStatus | null {
    if (!isFighter || !profile) return null;
    return getRegistration(tournamentId, profile.id)?.status ?? null;
  }

  const [createOpen, setCreateOpen] = useState(false);
  const [newCategories, setNewCategories] = useState<TournamentCategory[]>([]);

  const form = useForm<NewTournamentForm>({
    resolver: zodResolver(newTournamentSchema),
    defaultValues: { name: "", date: "", location: "", status: "upcoming", description: "", registration_deadline: "", max_fighters: "", rules: "", gender: undefined },
  });

  function toggleCategory(age_group: TournamentCategory["age_group"], weight_class: string, weight_limit_kg: number) {
    setNewCategories((prev) => {
      const exists = prev.some((c) => c.age_group === age_group && c.weight_class === weight_class);
      return exists
        ? prev.filter((c) => !(c.age_group === age_group && c.weight_class === weight_class))
        : [...prev, { age_group, weight_class, weight_limit_kg }];
    });
  }

  function onSubmit(data: NewTournamentForm) {
    createTournament({
      name:                  data.name,
      date:                  data.date || null,
      location:              data.location || null,
      categories:            newCategories,
      status:                data.status,
      created_by:            profile?.id ?? null,
      description:           data.description || null,
      registration_deadline: data.registration_deadline || null,
      max_fighters:          data.max_fighters ? Number(data.max_fighters) : null,
      rules:                 data.rules || null,
      gender:                data.gender ?? null,
      tier:                  (data.tier as TournamentTier) ?? null,
    });
    setCreateOpen(false);
    setNewCategories([]);
    form.reset();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-widest">Turniri</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Događaji i natjecanja</p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => { form.reset(); setCreateOpen(true); }}
            className="bg-primary hover:bg-primary/90 shadow-glow-primary cursor-pointer transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" /> Novi turnir
          </Button>
        )}
      </div>

      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-display font-bold text-emerald-400 uppercase tracking-widest">Aktivni</h2>
          {active.map((t) => <TournamentCard key={t.id} t={t} myRegStatus={myReg(t.id)} />)}
        </section>
      )}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-display font-bold text-muted-foreground uppercase tracking-widest">Nadolazeći</h2>
          {upcoming.map((t) => <TournamentCard key={t.id} t={t} myRegStatus={myReg(t.id)} />)}
        </section>
      )}
      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-display font-bold text-muted-foreground/60 uppercase tracking-widest">Završeni</h2>
          {completed.map((t) => <TournamentCard key={t.id} t={t} myRegStatus={null} />)}
        </section>
      )}

      {/* Create Tournament Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false); }}>
        <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh] gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
              <DialogTitle className="font-display text-xl tracking-widest uppercase">Novi turnir</DialogTitle>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naziv *</FormLabel>
                    <FormControl><Input placeholder="npr. Otvoreno Državno Natjecanje" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="upcoming">Nadolazeći</SelectItem>
                          <SelectItem value="active">Aktivan</SelectItem>
                          <SelectItem value="completed">Završen</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokacija</FormLabel>
                    <FormControl><Input placeholder="npr. Zagreb Arena" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Categories matrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kategorije</p>
                    {newCategories.length > 0 && (
                      <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5">
                        {newCategories.length} odabrano
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-border/60 bg-muted/10">
                    <table className="text-xs w-full min-w-max">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40">
                          <th className="text-left px-3 py-2 font-semibold text-muted-foreground w-28">Dob</th>
                          {WEIGHT_CLASS_DATA.map((wc) => (
                            <th key={wc.name} className="px-2 py-2 font-semibold text-center text-muted-foreground whitespace-nowrap">
                              <div className="font-bold">{wc.short}</div>
                              <div className="font-normal text-muted-foreground/50 text-[10px]">≤{wc.limit_kg}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {AGE_GROUPS.map((ag, ri) => (
                          <tr key={ag.id} className={`border-b border-border/30 last:border-0 ${ri % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
                            <td className="px-3 py-2 font-medium whitespace-nowrap">
                              <div className="font-semibold">{ag.label}</div>
                              <div className="text-muted-foreground/50 font-normal text-[10px]">{ag.min_age}–{ag.max_age ?? "+"}g</div>
                            </td>
                            {WEIGHT_CLASS_DATA.map((wc) => {
                              const active = newCategories.some((c) => c.age_group === ag.id && c.weight_class === wc.name);
                              return (
                                <td key={wc.name} className="px-2 py-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleCategory(ag.id, wc.name, wc.limit_kg)}
                                    className={`w-7 h-7 rounded-md transition-all text-xs font-bold ${active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "border border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"}`}
                                  >
                                    {active ? "✓" : "+"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="registration_deadline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rok prijave</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="max_fighters" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maks. boraca</FormLabel>
                      <FormControl><Input type="number" min={2} placeholder="npr. 32" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="tier" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razina turnira</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Odaberi razinu" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TIER_DATA.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.label} — {t.description}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="rules" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pravila</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="IMMAF Rules">IMMAF Rules</SelectItem>
                          <SelectItem value="Local Rules">Local Rules</SelectItem>
                          <SelectItem value="WMMAA Rules">WMMAA Rules</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Otvoreno" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="open">Otvoreno</SelectItem>
                          <SelectItem value="male">Muško</SelectItem>
                          <SelectItem value="female">Žensko</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis <span className="text-muted-foreground font-normal">(opcionalno)</span></FormLabel>
                    <FormControl><Input placeholder="Kratki opis turnira..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

              </div>
              <div className="shrink-0 border-t border-border/60 px-6 py-4 flex justify-end gap-2 bg-background">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Odustani</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-glow-primary">Stvori turnir</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
