import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { useAuth } from "@/hooks/useAuth";
import { CLUBS, FIGHTERS, PROFILES, updateFighter } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Users, Clock, MapPin, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

const WEEK_DAYS = [
  { label: "Pon", idx: 1 },
  { label: "Uto", idx: 2 },
  { label: "Sri", idx: 3 },
  { label: "Čet", idx: 4 },
  { label: "Pet", idx: 5 },
  { label: "Sub", idx: 6 },
  { label: "Ned", idx: 0 },
];

const TYPE_COLORS: Record<string, string> = {
  striking:     "border-red-300    bg-red-500/5",
  grappling:    "border-blue-300   bg-blue-500/5",
  sparring:     "border-orange-300 bg-orange-500/5",
  conditioning: "border-green-300  bg-green-500/5",
  open_mat:     "border-purple-300 bg-purple-500/5",
  other:        "border-gray-300   bg-gray-500/5",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Enrich all fighters with profile data once
const ALL_FIGHTERS = FIGHTERS.map((f) => {
  const p = PROFILES.find((p) => p.id === f.id);
  return { ...f, full_name: p?.full_name ?? "Unknown", avatar_url: p?.avatar_url ?? null };
});

const addFighterSchema = z.object({
  fighter_id: z.string().min(1, "Odaberi borca"),
});
type AddFighterForm = z.infer<typeof addFighterSchema>;

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>();
  const club   = CLUBS.find((c) => c.id === id) ?? null;
  const coach  = club ? PROFILES.find((p) => p.id === club.coach_id) : null;
  const { profile, isAdmin, isCoach } = useAuth();
  const canManage = isAdmin || (isCoach && club?.coach_id === profile?.id);

  const { sessions } = useTrainingSessions(id ?? "");

  // Local fighter list so adding fighters is reactive
  const [allFighters, setAllFighters] = useState(() => [...ALL_FIGHTERS]);
  const fighters  = allFighters.filter((f) => f.club_id === id);
  const available = allFighters.filter((f) => f.club_id !== id);

  const [addOpen, setAddOpen] = useState(false);
  const form = useForm<AddFighterForm>({
    resolver: zodResolver(addFighterSchema),
    defaultValues: { fighter_id: "" },
  });

  function onAddFighter(data: AddFighterForm) {
    const name = allFighters.find((f) => f.id === data.fighter_id)?.full_name ?? "";
    updateFighter(data.fighter_id, { club_id: id! });
    setAllFighters((prev) =>
      prev.map((f) => (f.id === data.fighter_id ? { ...f, club_id: id! } : f))
    );
    toast.success(`${name} dodan u klub.`);
    setAddOpen(false);
    form.reset();
  }

  if (!club) {
    return (
      <div className="space-y-4">
        <Link to="/app/clubs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Svi klubovi
        </Link>
        <p className="text-muted-foreground">Klub nije pronađen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/app/clubs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Svi klubovi
      </Link>

      {/* Header with logo */}
      <div className="flex items-center gap-4">
        {club.logo_url ? (
          <img
            src={club.logo_url}
            alt={club.name}
            className="h-20 w-20 rounded-lg object-contain border border-border shrink-0"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{club.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
            {club.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {club.city}
              </span>
            )}
            {coach && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> Trener: {coach.full_name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sastav ({fighters.length})
            </CardTitle>
            {canManage && (
              <Button size="sm" variant="outline" onClick={() => { form.reset(); setAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Dodaj borca
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {fighters.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema boraca u klubu.</p>
          ) : (
            <div className="divide-y">
              {fighters.map((f) => (
                <Link
                  key={f.id}
                  to={`/app/fighters/${f.id}`}
                  className="flex items-center justify-between py-3 -mx-2 px-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={f.avatar_url ?? undefined} alt={f.full_name} />
                      <AvatarFallback className="text-xs font-semibold">
                        {initials(f.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{f.full_name}</p>
                      <p className="text-sm text-muted-foreground">{f.weight_class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600 font-medium">{f.wins}W</span>
                    <span className="text-red-500 font-medium">{f.losses}L</span>
                    <span className="text-muted-foreground">{f.draws}D</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training schedule — read-only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Raspored treninga
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema aktivnih treninga.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[420px]">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEK_DAYS.map(({ label }) => (
                    <div key={label} className="text-center text-xs font-semibold text-muted-foreground py-1">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {WEEK_DAYS.map(({ idx }) => (
                    <div key={idx} className="space-y-1 min-h-[48px]">
                      {sessions
                        .filter((s) => s.day_of_week === idx)
                        .map((s) => (
                          <div
                            key={s.id}
                            className={`rounded border p-1.5 text-xs ${TYPE_COLORS[s.session_type] ?? TYPE_COLORS.other}`}
                          >
                            <p className="font-medium leading-tight truncate">{s.title}</p>
                            <p className="text-muted-foreground leading-tight">{s.time_range}</p>
                            {s.location && (
                              <p className="text-muted-foreground leading-tight truncate">{s.location}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Fighter Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) setAddOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj borca u klub</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddFighter)} className="space-y-4">
              <FormField control={form.control} name="fighter_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Borac</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberi borca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {available.length === 0 ? (
                        <SelectItem value="__none__" disabled>Nema dostupnih boraca</SelectItem>
                      ) : (
                        available.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.full_name}{f.weight_class ? ` · ${f.weight_class}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Odustani</Button>
                <Button type="submit" disabled={available.length === 0}>Dodaj</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
