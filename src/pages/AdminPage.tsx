import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTournaments } from "@/hooks/useTournaments";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import {
  PROFILES, CLUBS, Tournament, Profile,
  TournamentCategory, AGE_GROUPS, WEIGHT_CLASS_DATA, TIER_DATA, TournamentTier,
  createProfile as createProfileData,
  updateProfile as updateProfileData,
  deleteProfile as deleteProfileData,
} from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Users, Building2, Trophy, Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  admin:   "bg-red-500/10 text-red-600 border-red-500/30",
  coach:   "bg-blue-500/10 text-blue-600 border-blue-500/30",
  fighter: "bg-gray-500/10 text-gray-500 border-gray-500/30",
};

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

const WEIGHT_CLASSES = [
  "Strawweight", "Flyweight", "Bantamweight", "Featherweight",
  "Lightweight", "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight",
];

const tournamentSchema = z.object({
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

type TournamentForm = z.infer<typeof tournamentSchema>;

const inviteSchema = z.object({
  full_name: z.string().min(1, "Ime je obavezno"),
  role:      z.enum(["admin", "coach", "fighter"]),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function AdminPage() {
  const { tournaments, createTournament, updateTournament, deleteTournament } = useTournaments();
  const { pending, approve, reject } = useAnnouncements();
  const { profile } = useAuth();
  const [localUsers, setLocalUsers] = useState<Profile[]>(() => [...PROFILES]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const inviteForm = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { full_name: "", role: "fighter" },
  });

  function handleRoleChange(userId: string, role: "admin" | "coach" | "fighter") {
    updateProfileData(userId, { role });
    setLocalUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    toast.success("Uloga ažurirana.");
  }

  function handleDeleteUser(u: Profile) {
    deleteProfileData(u.id);
    setLocalUsers((prev) => prev.filter((p) => p.id !== u.id));
    toast.success(`${u.full_name} uklonjen.`);
  }

  function onInvite(data: InviteForm) {
    const p = createProfileData({ full_name: data.full_name, role: data.role, avatar_url: null });
    setLocalUsers((prev) => [...prev, p]);
    toast.success(`${data.full_name} dodan.`);
    setInviteOpen(false);
    inviteForm.reset();
  }

  const [editingTournament, setEditingTournament] = useState<Tournament | null | "new">(null);
  const [editCategories, setEditCategories] = useState<TournamentCategory[]>([]);

  const form = useForm<TournamentForm>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: { name: "", date: "", location: "", status: "upcoming", description: "", registration_deadline: "", max_fighters: "", rules: "", gender: undefined, tier: undefined },
  });

  function openCreate() {
    form.reset({ name: "", date: "", location: "", status: "upcoming", description: "", registration_deadline: "", max_fighters: "", rules: "", gender: undefined, tier: undefined });
    setEditCategories([]);
    setEditingTournament("new");
  }

  function openEdit(t: Tournament) {
    form.reset({
      name:                  t.name,
      date:                  t.date ?? "",
      location:              t.location ?? "",
      status:                t.status,
      description:           t.description ?? "",
      registration_deadline: t.registration_deadline ?? "",
      max_fighters:          t.max_fighters ?? "",
      rules:                 t.rules ?? "",
      gender:                t.gender ?? undefined,
      tier:                  t.tier ?? undefined,
    });
    setEditCategories(t.categories ?? []);
    setEditingTournament(t);
  }

  function toggleCategory(age_group: TournamentCategory["age_group"], weight_class: string, weight_limit_kg: number) {
    setEditCategories((prev) => {
      const exists = prev.some((c) => c.age_group === age_group && c.weight_class === weight_class);
      return exists
        ? prev.filter((c) => !(c.age_group === age_group && c.weight_class === weight_class))
        : [...prev, { age_group, weight_class, weight_limit_kg }];
    });
  }

  function onSubmit(data: TournamentForm) {
    const payload = {
      name:                  data.name,
      date:                  data.date || null,
      location:              data.location || null,
      categories:            editCategories,
      status:                data.status,
      created_by:            null,
      description:           data.description || null,
      registration_deadline: data.registration_deadline || null,
      max_fighters:          data.max_fighters ? Number(data.max_fighters) : null,
      rules:                 data.rules || null,
      gender:                data.gender ?? null,
      tier:                  (data.tier as TournamentTier) ?? null,
    };

    if (editingTournament === "new") {
      createTournament(payload);
      toast.success("Turnir kreiran.");
    } else if (editingTournament) {
      updateTournament(editingTournament.id, payload);
      toast.success("Turnir ažuriran.");
    }
    setEditingTournament(null);
  }

  function handleDelete(t: Tournament) {
    deleteTournament(t.id);
    toast.success(`${t.name} obrisan.`);
  }

  const dialogOpen = editingTournament !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-muted-foreground">Upravljanje korisnicima i klubovima</p>
      </div>

      {/* Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Korisnici ({localUsers.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => { inviteForm.reset(); setInviteOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Pozovi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {localUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-3">
                <p className="font-medium flex-1">{u.full_name}</p>
                <Select
                  value={u.role}
                  onValueChange={(v) => handleRoleChange(u.id, v as "admin" | "coach" | "fighter")}
                >
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="coach">trener</SelectItem>
                    <SelectItem value="fighter">borac</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon" variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  disabled={u.id === profile?.id}
                  onClick={() => handleDeleteUser(u)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clubs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Klubovi ({CLUBS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {CLUBS.map((c) => {
              const coach = PROFILES.find((p) => p.id === c.coach_id);
              return (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.city}, Hrvatska</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{coach?.full_name ?? "—"}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tournaments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Turniri ({tournaments.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> Novi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema turnira.</p>
          ) : (
            <div className="divide-y">
              {tournaments.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.date ?? "Bez datuma"}{t.location ? ` · ${t.location}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[t.status]} variant="outline">
                      {STATUS_LABELS[t.status] ?? t.status}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(t)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Objave na čekanju ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema objava na čekanju.</p>
          ) : (
            <div className="divide-y">
              {pending.map((a) => (
                <div key={a.id} className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">{a.author_name}</p>
                      <p className="text-sm mt-1 line-clamp-2 text-muted-foreground">{a.body}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm" variant="outline"
                        className="text-green-600 border-green-500/30 hover:bg-green-500/10"
                        onClick={() => { approve(a.id, profile?.id ?? "1"); toast.success("Objava odobrena."); }}
                      >
                        Odobri
                      </Button>
                      <Button
                        size="sm" variant="outline"
                        className="text-red-600 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => { reject(a.id, profile?.id ?? "1"); toast.success("Objava odbijena."); }}
                      >
                        Odbij
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { if (!open) setInviteOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pozovi korisnika</DialogTitle>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onInvite)} className="space-y-4">
              <FormField control={inviteForm.control} name="full_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ime i prezime</FormLabel>
                  <FormControl><Input placeholder="Ime i prezime" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={inviteForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Uloga</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="coach">trener</SelectItem>
                      <SelectItem value="fighter">borac</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Odustani</Button>
                <Button type="submit">Dodaj</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setEditingTournament(null); }}>
        <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh] gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
              <DialogTitle className="font-display text-xl tracking-widest uppercase">
                {editingTournament === "new" ? "Novi turnir" : "Uredi turnir"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naziv</FormLabel>
                    <FormControl><Input placeholder="Naziv turnira" {...field} /></FormControl>
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
                          <SelectItem value="upcoming">nadolazeći</SelectItem>
                          <SelectItem value="active">aktivan</SelectItem>
                          <SelectItem value="completed">završen</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokacija <span className="text-muted-foreground font-normal">(opcionalno)</span></FormLabel>
                    <FormControl><Input placeholder="npr. Zagreb, Hrvatska" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Categories matrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kategorije</p>
                    {editCategories.length > 0 && (
                      <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5">
                        {editCategories.length} odabrano
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
                              const active = editCategories.some((c) => c.age_group === ag.id && c.weight_class === wc.name);
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
                <Button type="button" variant="outline" onClick={() => setEditingTournament(null)}>Odustani</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 shadow-glow-primary">Spremi</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
