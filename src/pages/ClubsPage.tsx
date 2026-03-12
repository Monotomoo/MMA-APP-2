import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClubs } from "@/hooks/useClubs";
import { useAuth } from "@/hooks/useAuth";
import { PROFILES } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, Users, Plus, Pencil, MapPin } from "lucide-react";
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
      name:     data.name,
      city:     data.city || null,
      coach_id: data.coach_id || null,
      logo_url: null,
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-widest">Svi klubovi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clubs.length} registriranih klubova</p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 shadow-glow-primary cursor-pointer transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" /> Novi klub
          </Button>
        )}
      </div>

      {/* Club cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clubs.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-2">Nema registriranih klubova.</p>
        ) : (
          clubs.map((c, idx) => (
            <div
              key={c.id}
              className={`card-hover-glow border border-border/60 rounded-xl overflow-hidden bg-card animate-fade-up ${
                idx === 1 ? "animate-fade-up-delay-1" :
                idx === 2 ? "animate-fade-up-delay-2" :
                idx === 3 ? "animate-fade-up-delay-3" : ""
              }`}
            >
              <Link to={`/app/clubs/${c.id}`} className="block p-5 cursor-pointer">
                <div className="flex items-center gap-4">
                  {/* Club icon / logo */}
                  <div className="h-12 w-12 rounded-xl border border-border/60 bg-secondary/60 flex items-center justify-center shrink-0 overflow-hidden">
                    {c.logo_url ? (
                      <img src={c.logo_url} alt={c.name} className="h-10 w-10 object-contain" />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xl font-bold tracking-wide truncate">{c.name}</p>
                    {c.description && (
                      <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5 leading-tight">
                        {c.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                      {c.city && (
                        <span className="flex items-center gap-1 text-accent/80 font-medium">
                          <MapPin className="h-3 w-3" />{c.city}
                        </span>
                      )}
                      {c.city && c.coach_name && <span className="text-muted-foreground/40">·</span>}
                      {c.coach_name && <span>Trener: {c.coach_name}</span>}
                    </div>
                  </div>

                  {/* Fighter count + edit */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-secondary/60 border border-border/40 rounded-full px-3 py-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold">{c.fighter_count}</span>
                    </div>
                    {isAdmin && (
                      <Button
                        size="icon" variant="ghost"
                        className="h-8 w-8 hover:bg-secondary hover:text-primary cursor-pointer transition-colors"
                        onClick={(e) => { e.preventDefault(); openEdit(c.id, c.name, c.city, c.coach_id); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="bg-card border-border/60">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">{editing === "new" ? "Novi klub" : "Uredi klub"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Naziv kluba</FormLabel>
                  <FormControl><Input placeholder="npr. Antigravity MMA" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Grad <span className="text-muted-foreground/60">(opcionalno)</span></FormLabel>
                  <FormControl><Input placeholder="npr. Zagreb" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="coach_id" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Trener <span className="text-muted-foreground/60">(opcionalno)</span></FormLabel>
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
                <Button type="button" variant="outline" onClick={() => setEditing(null)} className="cursor-pointer">Odustani</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 cursor-pointer">Spremi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
