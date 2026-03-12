import { useState } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Newspaper, Plus, Star } from "lucide-react";
import { toast } from "sonner";

const announcementSchema = z.object({
  title: z.string().min(1, "Naslov je obavezan"),
  body:  z.string().min(1, "Sadržaj je obavezan"),
});
type AnnouncementForm = z.infer<typeof announcementSchema>;

export default function NewsPage() {
  const { announcements, create } = useAnnouncements();
  const { profile, isCoach, isAdmin } = useAuth();
  const canPost = isCoach || isAdmin;

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-widest">Vijesti</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Sve najave i obavijesti saveza</p>
        </div>
        {canPost && (
          <Button
            onClick={() => { form.reset(); setDialogOpen(true); }}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-glow-primary cursor-pointer transition-all duration-200 shrink-0 font-display tracking-wider uppercase text-sm"
          >
            <Plus className="h-4 w-4" /> Nova objava
          </Button>
        )}
      </div>

      <div className="space-y-4 animate-fade-up animate-fade-up-delay-1">
        {announcements.length === 0 && (
          <Card className="border-border/60 bg-card p-8 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">Trenutno nema novih vijesti.</p>
          </Card>
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
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap">{a.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post announcement dialog */}
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
                  <FormControl><Textarea placeholder="Napišite objavu..." rows={6} {...field} /></FormControl>
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
