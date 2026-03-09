import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTournaments } from "@/hooks/useTournaments";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import {
  PROFILES, CLUBS, Tournament, Profile,
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
  name:         z.string().min(1, "Naziv je obavezan"),
  date:         z.string().optional(),
  location:     z.string().optional(),
  weight_class: z.string().optional(),
  status:       z.enum(["upcoming", "active", "completed"]),
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

  const form = useForm<TournamentForm>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: { name: "", date: "", location: "", weight_class: "", status: "upcoming" },
  });

  function openCreate() {
    form.reset({ name: "", date: "", location: "", weight_class: "", status: "upcoming" });
    setEditingTournament("new");
  }

  function openEdit(t: Tournament) {
    form.reset({
      name:         t.name,
      date:         t.date ?? "",
      location:     t.location ?? "",
      weight_class: t.weight_class ?? "",
      status:       t.status,
    });
    setEditingTournament(t);
  }

  function onSubmit(data: TournamentForm) {
    const payload = {
      name:         data.name,
      date:         data.date || null,
      location:     data.location || null,
      weight_class: data.weight_class || null,
      status:       data.status,
      created_by:   null,
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTournament === "new" ? "Novi turnir" : "Uredi turnir"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <FormLabel>Lokacija <span className="text-muted-foreground">(opcionalno)</span></FormLabel>
                  <FormControl><Input placeholder="npr. Zagreb, Hrvatska" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="weight_class" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorija <span className="text-muted-foreground">(opcionalno)</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sve kategorije" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {WEIGHT_CLASSES.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingTournament(null)}>Odustani</Button>
                <Button type="submit">Spremi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
