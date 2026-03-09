import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClubs } from "@/hooks/useClubs";
import { useAuth } from "@/hooks/useAuth";
import { PROFILES } from "@/lib/demo-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, Users, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

const clubSchema = z.object({
  name:     z.string().min(1, "Naziv je obavezan"),
  city:     z.string().optional(),
  coach_id: z.string().optional(),
});

type ClubForm = z.infer<typeof clubSchema>;

const coaches = PROFILES.filter((p) => p.role === "coach" || p.role === "admin");

export default function ClubsPage() {
  const { clubs, addClub, editClub } = useClubs();
  const { isAdmin } = useAuth();

  type EditTarget = "new" | string | null;
  const [editing, setEditing] = useState<EditTarget>(null);

  const form = useForm<ClubForm>({
    resolver: zodResolver(clubSchema),
    defaultValues: { name: "", city: "", coach_id: "" },
  });

  function openCreate() {
    form.reset({ name: "", city: "", coach_id: "" });
    setEditing("new");
  }

  function openEdit(id: string, name: string, city: string | null, coach_id: string | null) {
    form.reset({ name, city: city ?? "", coach_id: coach_id ?? "" });
    setEditing(id);
  }

  function onSubmit(data: ClubForm) {
    const payload = {
      name:      data.name,
      city:      data.city || null,
      coach_id:  data.coach_id || null,
      logo_url:  null,
    };
    if (editing === "new") {
      addClub(payload);
      toast.success(`${data.name} kreiran.`);
    } else if (editing) {
      editClub(editing, { name: data.name, city: data.city || null, coach_id: data.coach_id || null });
      toast.success("Klub ažuriran.");
    }
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Svi klubovi</h1>
          <p className="text-muted-foreground">Popis svih registriranih klubova</p>
        </div>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Novi klub
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Klubovi ({clubs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clubs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema registriranih klubova.</p>
          ) : (
            <div className="divide-y">
              {clubs.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-4">
                  <Link
                    to={`/app/clubs/${c.id}`}
                    className="flex-1 min-w-0 flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {c.logo_url ? (
                      <img src={c.logo_url} alt={c.name} className="h-10 w-10 rounded-md object-contain border border-border shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded-md border border-border bg-muted flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.city ? `${c.city} · ` : ""}
                        {c.coach_name ? `Trener: ${c.coach_name}` : "Bez trenera"}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" /> {c.fighter_count}
                    </span>
                    {isAdmin && (
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        onClick={() => openEdit(c.id, c.name, c.city, c.coach_id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Novi klub" : "Uredi klub"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Naziv kluba</FormLabel>
                  <FormControl><Input placeholder="npr. Antigravity MMA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grad <span className="text-muted-foreground">(opcionalno)</span></FormLabel>
                  <FormControl><Input placeholder="npr. Zagreb" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="coach_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Trener <span className="text-muted-foreground">(opcionalno)</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Odaberi trenera" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coaches.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Odustani</Button>
                <Button type="submit">Spremi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
