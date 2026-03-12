import { ShieldCheck, FileText, Download, User, Users, Briefcase, Info, ExternalLink, Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LEADERSHIP = [
  { role: "Predsjednik", name: "Željko Banić", title: "mag.kin.", type: "primary" },
  { role: "Počasni predsjednik", name: "Alen Klabot", title: "", type: "primary" },
  { role: "Potpredsjednik", name: "Gordan Vatavuk", title: "", type: "primary" },
  { role: "Glavni tajnik", name: "Mario Jurković", title: "", type: "primary" },
];

const BOARD_MEMBERS = [
  "Željko Banić (predsjednik)",
  "Hrvoje Petranović",
  "Jadranko Čačić",
];

const COMMISSIONS = [
  { 
    name: "Nadzorni odbor", 
    members: ["Dejan Gunjavić", "Sana Višnjić", "Dino Dominic Sumpor"] 
  },
  { 
    name: "Stegovna komisija", 
    members: ["Ivan Sekol", "Domagoj Tonaj oec."] 
  }
];

const DOCUMENTS = [
  "GAMMA PRAVILNIK",
  "BODOVNI PRAVILNIK ZA MMA CHALLENGE 2018",
  "PRIJAVNICA ZA MMA CHALLENGE 2018",
  "Priručnik za MMA suce 2016",
  "IZJAVA NATJECATELJI",
  "PRIJAVA KLUBA",
  "PRIJAVNICA NATJECATELJ",
  "KATEGORIJE I DOBNE SKUPINE 2016.",
  "ODLUKA ZA BORBU PROTIV DOPINGA",
  "Pravilnik za borbu protiv dopinga",
];

export default function MMASavezPage() {
  return (
    <div className="space-y-10 pb-12">
      {/* ── Hero section ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-secondary/30 border border-border/40 p-8 md:p-12 animate-fade-up">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="relative shrink-0 group">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative h-32 w-32 md:h-40 md:w-40 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1 shadow-2xl">
                <img 
                  src="/assets/hrvatski_mma_savez_logo.png" 
                  alt="Hrvatski MMA Savez Logo" 
                  className="h-full w-full object-contain drop-shadow-glow-primary animate-fade-in"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-widest uppercase text-white">
                  Hrvatski <span className="text-primary">MMA</span> Savez
                </h1>
                <Badge variant="outline" className="border-primary/40 text-primary font-display uppercase tracking-wider px-3 py-1">
                  Osnovan 2006.
                </Badge>
              </div>
              <p className="max-w-2xl text-muted-foreground text-sm uppercase tracking-widest font-medium">
                Službeno krovno tijelo mješovitih borilačkih vještina u Republici Hrvatskoj
              </p>
            </div>
          </div>
          
          <div className="hidden xl:block text-right">
            <p className="font-display text-2xl font-black uppercase tracking-[0.3em] text-foreground/10 select-none">
              Hrvatski <span className="text-primary/10">MMA</span> Savez
            </p>
          </div>
        </div>
        {/* Background decorative stripe */}
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left column: Leadership ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="space-y-4 animate-fade-up animate-fade-up-delay-1">
            <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl font-black uppercase tracking-widest italic">Rukovodstvo</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LEADERSHIP.map((p) => (
                <Card key={p.role} className={`border-border/60 ${p.type === 'gold' ? 'border-l-accent-glow' : 'border-l-primary/40 border-l-[3px]'} card-hover-glow transition-all`}>
                  <CardHeader className="p-4">
                    <CardDescription className={`text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 ${p.name === 'Alen Klabot' ? 'font-bold' : 'font-black'}`}>{p.role}</CardDescription>
                    <CardTitle className={`font-display text-xl tracking-tight mt-1 group-hover:text-primary ${p.name === 'Alen Klabot' ? 'font-semibold text-foreground/80' : ''}`}>
                        {p.name} {p.title && <span className="text-sm font-body font-medium text-muted-foreground/80 lowercase italic">, {p.title}</span>}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="animate-fade-up animate-fade-up-delay-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Board */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                        <Briefcase className="h-4 w-4 text-accent" />
                        <h3 className="font-display text-xl font-bold uppercase tracking-wider">Upravni odbor</h3>
                    </div>
                    <ul className="space-y-2">
                        {BOARD_MEMBERS.map(m => (
                            <li key={m} className="flex items-center gap-3 text-sm text-foreground/80 bg-secondary/20 p-2 rounded-lg border border-border/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-accent" /> {m}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Committees */}
                <div className="space-y-6">
                    {COMMISSIONS.map(c => (
                        <div key={c.name} className="space-y-3">
                            <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                                <ShieldCheck className="h-4 w-4 text-primary/60" />
                                <h3 className="font-display text-xl font-bold uppercase tracking-wider">{c.name}</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {c.members.map(m => (
                                    <Badge key={m} variant="secondary" className="bg-secondary/40 text-[11px] py-1 border-border/40 font-medium">{m}</Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* Important News */}
          <section className="space-y-4 animate-fade-up animate-fade-up-delay-3 pt-4">
              <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-2xl font-black uppercase tracking-widest italic">Važne Vijesti</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-secondary/20 border-border/60 card-hover-glow-gold border-l-accent-glow">
                      <CardHeader className="p-4 pb-2">
                          <Badge className="w-fit mb-2 bg-accent text-accent-foreground text-[9px] uppercase tracking-tighter font-black">Hitno</Badge>
                          <CardTitle className="font-display text-lg leading-tight uppercase tracking-tight text-white">Obavezni liječnički pregledi za 2026.</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground leading-relaxed">Svi klubovi moraju dostaviti potvrde o obavljenim pregledima do 01.04.2026.</p>
                      </CardContent>
                  </Card>
                  <Card className="bg-secondary/10 border-border/40 hover:border-primary/30 transition-colors">
                      <CardHeader className="p-4 pb-2">
                          <CardTitle className="font-display text-base uppercase tracking-tight text-white/90">Novi GAMMA sudački seminar</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                          <p className="text-xs text-muted-foreground">Prijave za seminar u lipnju su službeno otvorene za sve licencirane suce.</p>
                      </CardContent>
                  </Card>
              </div>
          </section>
        </div>

        {/* ── Right column: Documents & News ─────────────────────────────── */}
        <div className="space-y-8">
            
            {/* Documents */}
            <section className="space-y-4 animate-fade-up animate-fade-up-delay-3">
                <div className="flex items-center gap-3 border-b border-border/40 pb-2">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <h2 className="font-display text-2xl font-black uppercase tracking-widest italic">Dokumenti</h2>
                </div>
                <div className="bg-card/50 rounded-2xl border border-border/40 divide-y divide-border/30 overflow-hidden shadow-xl">
                    {DOCUMENTS.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 hover:bg-secondary/40 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-tight truncate group-hover:text-emerald-400 transition-colors">{doc}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-400 hover:bg-transparent">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button className="w-full bg-secondary/50 text-muted-foreground hover:bg-secondary border border-border/40 font-display uppercase tracking-widest text-xs py-5">
                   Prikaži sve dokumente
                </Button>
            </section>


            {/* Info card */}
            <Card className="bg-primary/5 border-primary/20 p-6 animate-pulse-glow">
                <div className="flex items-start gap-4">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                        <h4 className="font-display font-bold uppercase tracking-wider text-primary mb-1 text-sm">Važna obavijest</h4>
                        <p className="text-xs text-foreground/70 leading-relaxed">
                            Sve prijave klubova i natjecatelja za sezonu 2026. se vrše isključivo putem službenih obrazaca objavljenih u sekciji "Dokumenti".
                        </p>
                    </div>
                </div>
            </Card>

        </div>
      </div>
    </div>
  );
}
