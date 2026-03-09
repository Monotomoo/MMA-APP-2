import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClub } from "@/hooks/useClub";
import { useFighters } from "@/hooks/useFighters";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Clock, Pencil, Trash2, Plus, ClipboardList, CheckCircle, XCircle } from "lucide-react";
import { SessionType } from "@/lib/demo-data";
import { toast } from "sonner";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const clubSchema = z.object({
  name: z.string().min(1, "Naziv je obavezan"),
  city: z.string().optional(),
});

const SESSION_TYPES: SessionType[] = [
  "striking", "grappling", "sparring", "conditioning", "open_mat", "other",
];

const SESSION_TYPE_LABELS: Record<string, string> = {
  striking:     "udarački",
  grappling:    "hrvački",
  sparring:     "sparring",
  conditioning: "kondicija",
  open_mat:     "slobodni trening",
  other:        "ostalo",
};

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

const DAY_OPTIONS = [
  { value: "0", label: "Nedjelja" },
  { value: "1", label: "Ponedjeljak" },
  { value: "2", label: "Utorak" },
  { value: "3", label: "Srijeda" },
  { value: "4", label: "Četvrtak" },
  { value: "5", label: "Petak" },
  { value: "6", label: "Subota" },
];

const sessionSchema = z.object({
  title:        z.string().min(1, "Naziv je obavezan"),
  session_type: z.enum(["striking", "grappling", "sparring", "conditioning", "open_mat", "other"]),
  day_of_week:  z.coerce.number().int().min(0).max(6),
  start_time:   z.string().min(1, "Početak je obavezan"),
  end_time:     z.string().min(1, "Kraj je obavezan"),
  location:     z.string().optional(),
});

type ClubForm    = z.infer<typeof clubSchema>;
type SessionForm = z.infer<typeof sessionSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyClubPage() {
  const { club, coach, updateClub, pendingRegs, approveRegistration, rejectRegistration } = useClub();
  const { fighters }                       = useFighters();
  const { sessions, addSession, removeSession } = useTrainingSessions();
  const { isCoach }                        = useAuth();

  const [editClubOpen,   setEditClubOpen]   = useState(false);
  const [addSessionOpen, setAddSessionOpen] = useState(false);

  // Edit club form
  const clubForm = useForm<ClubForm>({
    resolver: zodResolver(clubSchema),
    defaultValues: { name: club?.name ?? "", city: club?.city ?? "" },
  });

  // Add session form
  const sessionForm = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "", session_type: "striking", day_of_week: 1,
      start_time: "18:00", end_time: "19:30", location: "",
    },
  });

  function onEditClub(data: ClubForm) {
    updateClub({ name: data.name, city: data.city ?? null });
    setEditClubOpen(false);
    toast.success("Klub ažuriran.");
  }

  function onAddSession(data: SessionForm) {
    addSession({
      club_id:      club!.id,
      title:        data.title,
      session_type: data.session_type,
      day_of_week:  data.day_of_week,
      start_time:   data.start_time,
      end_time:     data.end_time,
      location:     data.location || null,
      notes:        null,
      is_active:    true,
    });
    sessionForm.reset();
    setAddSessionOpen(false);
    toast.success("Trening dodan.");
  }

  if (!club) return <p className="text-muted-foreground">Klub nije pronađen.</p>;

  return (
    <div className="space-y-6">
      {/* Club header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{club.name}</h1>
          <p className="text-muted-foreground">
            {club.city && `${club.city}, `}Hrvatska{coach ? ` · Trener: ${coach}` : ""}
          </p>
        </div>
        {isCoach && (
          <Button size="sm" variant="outline" onClick={() => {
            clubForm.reset({ name: club.name, city: club.city ?? "" });
            setEditClubOpen(true);
          }}>
            <Pencil className="h-4 w-4 mr-1" /> Uredi
          </Button>
        )}
      </div>

      {/* Roster */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sastav ({fighters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                      {f.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
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
        </CardContent>
      </Card>

      {/* Training schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Raspored treninga
            </CardTitle>
            {isCoach && (
              <Button size="sm" variant="outline" onClick={() => setAddSessionOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Dodaj
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema aktivnih treninga.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[420px]">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEK_DAYS.map(({ label }) => (
                    <div key={label} className="text-center text-xs font-semibold text-muted-foreground py-1">
                      {label}
                    </div>
                  ))}
                </div>
                {/* Session columns */}
                <div className="grid grid-cols-7 gap-1">
                  {WEEK_DAYS.map(({ idx }) => (
                    <div key={idx} className="space-y-1 min-h-[48px]">
                      {sessions
                        .filter((s) => s.day_of_week === idx)
                        .map((s) => (
                          <div
                            key={s.id}
                            className={`rounded border p-1.5 text-xs group relative ${TYPE_COLORS[s.session_type] ?? TYPE_COLORS.other}`}
                          >
                            <p className="font-medium leading-tight truncate pr-3">{s.title}</p>
                            <p className="text-muted-foreground leading-tight">{s.time_range}</p>
                            {s.location && (
                              <p className="text-muted-foreground leading-tight truncate">{s.location}</p>
                            )}
                            {isCoach && (
                              <button
                                type="button"
                                aria-label="Remove session"
                                onClick={() => { removeSession(s.id); toast.success("Trening uklonjen."); }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
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

      {/* Pending Registrations — coach only */}
      {isCoach && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Prijave na čekanju ({pendingRegs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRegs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema prijava na čekanju.</p>
            ) : (
              <div className="divide-y">
                {pendingRegs.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{r.fighter_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.fighter_weight && `${r.fighter_weight} · `}{r.tournament_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-500/40 hover:bg-green-500/10"
                        onClick={() => { approveRegistration(r.id); toast.success(`${r.fighter_name} odobren.`); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Odobri
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-500/40 hover:bg-red-500/10"
                        onClick={() => { rejectRegistration(r.id); toast.success(`${r.fighter_name} odbijen.`); }}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Odbij
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit club dialog */}
      <Dialog open={editClubOpen} onOpenChange={setEditClubOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uredi klub</DialogTitle>
          </DialogHeader>
          <Form {...clubForm}>
            <form onSubmit={clubForm.handleSubmit(onEditClub)} className="space-y-4">
              <FormField control={clubForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Naziv kluba</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={clubForm.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grad</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditClubOpen(false)}>
                  Odustani
                </Button>
                <Button type="submit">Spremi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add session dialog */}
      <Dialog open={addSessionOpen} onOpenChange={setAddSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj trening</DialogTitle>
          </DialogHeader>
          <Form {...sessionForm}>
            <form onSubmit={sessionForm.handleSubmit(onAddSession)} className="space-y-4">
              <FormField control={sessionForm.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Naziv</FormLabel>
                  <FormControl><Input placeholder="npr. Jutarnji BJJ" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={sessionForm.control} name="session_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vrsta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SESSION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{SESSION_TYPE_LABELS[t] ?? t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={sessionForm.control} name="day_of_week" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DAY_OPTIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={sessionForm.control} name="start_time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Početak</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={sessionForm.control} name="end_time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kraj</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={sessionForm.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dvorana <span className="text-muted-foreground">(opcionalno)</span></FormLabel>
                  <FormControl><Input placeholder="npr. Glavna dvorana" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddSessionOpen(false)}>
                  Odustani
                </Button>
                <Button type="submit">Dodaj trening</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
