import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  striking:     "bg-red-500/20 text-red-700",
  grappling:    "bg-blue-500/20 text-blue-700",
  sparring:     "bg-orange-500/20 text-orange-700",
  conditioning: "bg-green-500/20 text-green-700",
  open_mat:     "bg-purple-500/20 text-purple-700",
  other:        "bg-gray-500/20 text-gray-600",
};

const SESSION_LABELS: Record<string, string> = {
  striking:     "Striking",
  grappling:    "Grappling",
  sparring:     "Sparring",
  conditioning: "Conditioning",
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
      <div>
        <h1 className="text-2xl font-bold">Kalendar</h1>
        <p className="text-muted-foreground">Treninzi i turniri</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg">
              {CROATIAN_MONTHS[month]} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_HEADERS.map((h) => (
              <div key={h} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {h}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
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
                  className={`bg-background min-h-[88px] p-1.5 ${!dayNum ? "bg-muted/20" : ""}`}
                >
                  {dayNum && (
                    <>
                      <span
                        className={`text-xs font-medium inline-flex h-5 w-5 items-center justify-center rounded-full mb-1 ${
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {dayNum}
                      </span>
                      <div className="space-y-0.5">
                        {sessions.map((s) => (
                          <div
                            key={s.id}
                            className={`text-[10px] px-1 py-0.5 rounded truncate font-medium leading-tight ${SESSION_COLORS[s.session_type] ?? SESSION_COLORS.other}`}
                          >
                            {s.title}
                          </div>
                        ))}
                        {tournaments.map((t) => (
                          <div
                            key={t.id}
                            className="text-[10px] px-1 py-0.5 rounded truncate font-medium leading-tight bg-amber-500/20 text-amber-700"
                          >
                            🏆 {t.name}
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
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-4 border-t">
            {Object.entries(SESSION_COLORS).map(([type, cls]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-sm ${cls.split(" ")[0]}`} />
                <span className="text-xs text-muted-foreground">{SESSION_LABELS[type]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-amber-500/20" />
              <span className="text-xs text-muted-foreground">Turnir</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
