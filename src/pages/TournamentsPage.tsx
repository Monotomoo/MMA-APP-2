import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTournaments } from "@/hooks/useTournaments";
import { useAuth } from "@/hooks/useAuth";
import { getRegistration } from "@/lib/demo-data";
import { Tournament, RegistrationStatus } from "@/lib/demo-data";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  return (
    <Link to={`/app/tournaments/${t.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{t.name}</CardTitle>
              <CardDescription className="flex flex-wrap gap-3 mt-1">
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
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {t.weight_class && <Badge variant="outline">{t.weight_class}</Badge>}
              <Badge className={STATUS_COLORS[t.status]} variant="outline">
                {STATUS_LABELS[t.status] ?? t.status}
              </Badge>
              {myRegStatus && (
                <Badge className={REG_COLORS[myRegStatus]} variant="outline">
                  {REG_LABELS[myRegStatus] ?? myRegStatus}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Turniri</h1>
          <p className="text-muted-foreground">Događaji i natjecanja</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => { form.reset(); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novi turnir
          </Button>
        )}
      </div>

      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Aktivni</h2>
          {active.map((t) => <TournamentCard key={t.id} t={t} myRegStatus={myReg(t.id)} />)}
        </section>
      )}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Nadolazeći</h2>
          {upcoming.map((t) => <TournamentCard key={t.id} t={t} myRegStatus={myReg(t.id)} />)}
        </section>
      )}
      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Završeni</h2>
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
