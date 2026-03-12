import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";
import { getRegistration } from "@/lib/demo-data";
import { Tournament, RegistrationStatus } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Plus } from "lucide-react";

const WEIGHT_CLASSES = [
  "Strawweight","Flyweight","Bantamweight","Featherweight",
  "Lightweight","Welterweight","Middleweight","Light Heavyweight","Heavyweight",
];

const newTournamentSchema = z.object({
  name:         z.string().min(1, "Naziv je obavezan"),
  date:         z.string().optional(),
  location:     z.string().optional(),
  weight_class: z.string().optional(),
  status:       z.enum(["upcoming", "active", "completed"]),
});
type NewTournamentForm = z.infer<typeof newTournamentSchema>;

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
            {t.weight_class && (
              <Badge variant="outline" className="border-border/60 text-xs">{t.weight_class}</Badge>
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
  const form = useForm<NewTournamentForm>({
    resolver: zodResolver(newTournamentSchema),
    defaultValues: { name: "", date: "", location: "", weight_class: "", status: "upcoming" },
  });

  function onSubmit(data: NewTournamentForm) {
    createTournament({
      name:         data.name,
      date:         data.date || null,
      location:     data.location || null,
      weight_class: data.weight_class || null,
      status:       data.status,
      created_by:   profile?.id ?? null,
    });
    setCreateOpen(false);
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novi turnir</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField control={form.control} name="weight_class" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorija</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sve kategorije" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {WEIGHT_CLASSES.map((wc) => (
                        <SelectItem key={wc} value={wc}>{wc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Odustani</Button>
                <Button type="submit">Stvori turnir</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
