import { useParams, Link } from "react-router-dom";
import { useFighter } from "@/hooks/useFighter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Calendar } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function calcAge(dob: string): number {
  const today = new Date();
  const d     = new Date(dob);
  let age     = today.getFullYear() - d.getFullYear();
  if (today < new Date(today.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

const REG_COLORS: Record<string, string> = {
  approved: "bg-green-500/10 text-green-600 border-green-500/30",
  pending:  "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  rejected: "bg-red-500/10 text-red-600 border-red-500/30",
};

const REG_LABELS: Record<string, string> = {
  approved: "odobren",
  pending:  "na čekanju",
  rejected: "odbijen",
};

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("hr-HR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function FighterPage() {
  const { id } = useParams<{ id: string }>();
  const { fighter, profile, bouts, registrations } = useFighter(id!);
  const { profile: authProfile } = useAuth();
  const isOwnProfile = authProfile?.id === id;

  if (!fighter || !profile) {
    return (
      <div className="space-y-4">
        <Link to="/app/my-club" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Moj klub
        </Link>
        <p className="text-muted-foreground">Borac nije pronađen.</p>
      </div>
    );
  }

  const completedBouts = bouts.filter((b) => b.status === "completed");

  return (
    <div className="space-y-6">
      <Link
        to="/app/my-club"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Moj klub
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
            <AvatarFallback className="text-xl font-bold">
              {initials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground">
              {fighter.weight_class}
              {fighter.nationality && ` · ${fighter.nationality}`}
              {fighter.date_of_birth && ` · ${calcAge(fighter.date_of_birth)} god.`}
            </p>
          </div>
        </div>
        <div className="flex gap-5 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{fighter.wins}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">W</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{fighter.losses}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">L</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-foreground">{fighter.draws}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">D</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {fighter.bio && (
        <Card>
          <CardHeader><CardTitle className="text-base">Bio</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{fighter.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Fight history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Borbe ({completedBouts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedBouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nema zabilježenih borbi.</p>
          ) : (
            <div className="divide-y">
              {completedBouts.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">vs. {b.opponent_name}</p>
                    <p className="text-sm text-muted-foreground">{b.tournament_name}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge
                      variant={
                        b.result === "W" ? "default"
                        : b.result === "L" ? "destructive"
                        : "secondary"
                      }
                    >
                      {b.result}
                    </Badge>
                    {b.method && (
                      <span className="text-muted-foreground">
                        {b.method} R{b.round}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Registrations — own profile only */}
      {isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Moje prijave ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema prijava na turnire.</p>
            ) : (
              <div className="divide-y">
                {registrations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{r.tournament_name}</p>
                      {r.tournament_date && (
                        <p className="text-sm text-muted-foreground">{fmt(r.tournament_date)}</p>
                      )}
                    </div>
                    <Badge className={REG_COLORS[r.status]} variant="outline">
                      {REG_LABELS[r.status] ?? r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
