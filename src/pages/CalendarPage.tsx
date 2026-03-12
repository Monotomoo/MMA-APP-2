import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trophy, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRAINING_SESSIONS, TOURNAMENTS, CLUBS, FIGHTERS } from "@/lib/demo-data";
import { useAuth } from "@/hooks/useAuth";

const WEEK_HEADERS = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

const CROATIAN_MONTHS = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac",
];

const SESSION_COLORS: Record<string, string> = {
  striking:     "bg-red-500/10 text-red-400 border-red-500/20",
  grappling:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  sparring:     "bg-orange-500/10 text-orange-400 border-orange-500/20",
  conditioning: "bg-green-500/10 text-green-400 border-green-500/20",
  open_mat:     "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other:        "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const SESSION_LABELS: Record<string, string> = {
  striking:     "Striking",
  grappling:    "Grappling",
  sparring:     "Sparring",
  conditioning: "Kondicija",
  open_mat:     "Open Mat",
  other:        "Ostalo",
};

export default function CalendarPage() {
  const { profile, isAdmin } = useAuth();
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Resolve the current user's club
  const userClubId: string | null = (() => {
    if (!profile || isAdmin) return null; // admin sees all clubs
    if (profile.role === "coach") return CLUBS.find((c) => c.coach_id === profile.id)?.id ?? null;
    return FIGHTERS.find((f) => f.id === profile.id)?.club_id ?? null;
  })();

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth()  { setCurrentDate(new Date(year, month + 1, 1)); }

  // Monday-first grid offset
  const firstDay       = new Date(year, month, 1);
  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon...
  const offset         = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const totalCells     = Math.ceil((offset + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= daysInMonth ? d : null;
  });

  const today = new Date();

  function getEvents(dayNum: number | null) {
    if (!dayNum) return { sessions: [], tournaments: [] };
    const jsDay  = new Date(year, month, dayNum).getDay();
    const isoStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    return {
      sessions:    TRAINING_SESSIONS.filter((s) => s.is_active && s.day_of_week === jsDay && (userClubId === null || s.club_id === userClubId)),
      tournaments: TOURNAMENTS.filter((t) => t.date === isoStr),
    };
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-display font-bold tracking-widest">Kalendar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pregled treninga i turnira</p>
      </div>

      <Card className="border-border/60 bg-card shadow-xl overflow-hidden animate-fade-up animate-fade-up-delay-1">
        <CardHeader className="bg-secondary/30 border-b border-border/40 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 shadow-glow-primary">
                <CalendarIcon className="h-4.5 w-4.5 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl font-black tracking-widest uppercase text-foreground">
                {CROATIAN_MONTHS[month]} <span className="text-primary">{year}</span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevMonth} 
                className="h-8 w-8 border-border/60 hover:bg-secondary cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth} 
                className="h-8 w-8 border-border/60 hover:bg-secondary cursor-pointer transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-border/40 bg-secondary/10">
            {WEEK_HEADERS.map((h) => (
              <div key={h} className="text-center py-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{h}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border/30">
            {cells.map((dayNum, i) => {
              const { sessions, tournaments } = getEvents(dayNum);
              const isToday =
                dayNum !== null &&
                year  === today.getFullYear() &&
                month === today.getMonth() &&
                dayNum === today.getDate();

              return (
                <div
                  key={i}
                  className={`min-h-[110px] p-2 transition-colors duration-200 ${
                    !dayNum ? "bg-secondary/5 opacity-50" : "hover:bg-primary/5 group"
                  }`}
                >
                  {dayNum && (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-xs font-black h-6 w-6 flex items-center justify-center rounded-lg transition-all duration-200 ${
                            isToday
                              ? "bg-primary text-primary-foreground shadow-glow-primary scale-110"
                              : "text-muted-foreground/70 group-hover:text-foreground"
                          }`}
                        >
                          {dayNum}
                        </span>
                        {tournaments.length > 0 && (
                          <Trophy className="h-3 w-3 text-accent animate-pulse" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {tournaments.map((t) => (
                          <div
                            key={t.id}
                            className="bg-accent/15 text-accent text-[9px] px-1.5 py-1 rounded-md font-bold tracking-tight border border-accent/20 flex items-center gap-1 shadow-glow-gold/10"
                            title={t.name}
                          >
                            <Trophy className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate uppercase">{t.name}</span>
                          </div>
                        ))}
                        {sessions.map((s) => (
                          <div
                            key={s.id}
                            className={`${SESSION_COLORS[s.session_type] ?? SESSION_COLORS.other} text-[9px] px-1.5 py-1 rounded-md font-bold tracking-tight border flex items-center gap-1`}
                            title={`${s.title} (${s.start_time})`}
                          >
                            <Zap className="h-2.5 w-2.5 shrink-0 opacity-70" />
                            <span className="truncate">{s.title}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="bg-secondary/20 p-4 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-accent shadow-glow-gold" />
                <span className="text-[10px] font-black uppercase tracking-wider text-accent/90">Turnir</span>
              </div>
              <div className="h-4 w-px bg-border/40 mx-2 hidden sm:block" />
              {Object.entries(SESSION_COLORS).map(([type, cls]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${cls.split(" ")[0]} border ${cls.split(" ")[2]}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{SESSION_LABELS[type]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick view side info - Optional for later */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up animate-fade-up-delay-2">
         <Card className="border-border/60 bg-card p-4 flex items-center gap-4 card-hover-glow">
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Treninzi danas</p>
              <p className="text-xl font-display font-black tracking-tight">{getEvents(today.getDate()).sessions.length}</p>
            </div>
         </Card>
         <Card className="border-border/60 bg-card p-4 flex items-center gap-4 card-hover-glow-gold">
            <div className="h-10 w-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Turniri ovaj mjesec</p>
              <p className="text-xl font-display font-black tracking-tight">
                {TOURNAMENTS.filter(t => {
                   const d = t.date ? new Date(t.date) : null;
                   return d && d.getMonth() === month && d.getFullYear() === year;
                }).length}
              </p>
            </div>
         </Card>
         <Card className="border-border/60 bg-card p-4 flex items-center gap-4 card-hover-glow">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Lokacija</p>
              <p className="text-xl font-display font-black tracking-tight truncate">{userClubId ? CLUBS.find(c => c.id === userClubId)?.city : "Svi klubovi"}</p>
            </div>
         </Card>
      </div>
    </div>
  );
}
