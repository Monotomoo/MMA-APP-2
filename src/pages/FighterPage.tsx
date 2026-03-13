import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useFighter } from "@/hooks/useFighter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Calendar, FileText, Upload, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { DOC_LABELS, DOC_DESC, DocType, FighterDocument, uploadFighterDoc, updateDocStatus } from "@/lib/demo-data";

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

const DOC_STATUS_CONFIG = {
  approved: { label: "Odobreno",    icon: CheckCircle,   className: "text-green-600 bg-green-500/10 border-green-500/30" },
  pending:  { label: "Na čekanju",  icon: Clock,         className: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30" },
  rejected: { label: "Odbijeno",    icon: XCircle,       className: "text-red-500 bg-red-500/10 border-red-500/30" },
  missing:  { label: "Nedostaje",   icon: AlertCircle,   className: "text-muted-foreground bg-muted/50 border-border" },
};

export default function FighterPage() {
  const { id } = useParams<{ id: string }>();
  const { fighter, profile, bouts, registrations, documents: initialDocs } = useFighter(id!);
  const { profile: authProfile } = useAuth();
  const isOwnProfile = authProfile?.id === id;
  const isAdmin = authProfile?.role === "admin";
  const isCoach = authProfile?.role === "coach";
  const canUpload = isOwnProfile || isCoach || isAdmin;

  const [docs, setDocs] = useState(initialDocs);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  function handleUpload(doc_type: DocType) {
    const fakeName = `${doc_type}_${profile?.full_name?.split(" ")[1]?.toLowerCase() ?? "borac"}.pdf`;
    uploadFighterDoc(id!, doc_type, fakeName);
    setDocs((prev) => prev.map((d) =>
      d.doc_type === doc_type
        ? { ...d, file_name: fakeName, uploaded_at: new Date().toISOString(), status: "pending", approved_by: null, approved_at: null, notes: null }
        : d
    ));
  }

  function handleApprove(doc: FighterDocument) {
    updateDocStatus(doc.id.startsWith("doc-missing") ? `doc-${Date.now()}` : doc.id, "approved", authProfile!.id);
    setDocs((prev) => prev.map((d) =>
      d.doc_type === doc.doc_type ? { ...d, status: "approved", approved_by: authProfile!.id, approved_at: new Date().toISOString(), notes: null } : d
    ));
  }

  function handleReject(doc: FighterDocument) {
    const note = rejectNotes[doc.doc_type] || "Dokument nije ispravan.";
    updateDocStatus(doc.id, "rejected", authProfile!.id, note);
    setDocs((prev) => prev.map((d) =>
      d.doc_type === doc.doc_type ? { ...d, status: "rejected", approved_by: authProfile!.id, approved_at: new Date().toISOString(), notes: note } : d
    ));
  }

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

      {/* OIB / sensitive info — admin and coach only */}
      {(isAdmin || isCoach) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Osobni podaci</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">OIB</p>
              <p className="font-mono font-medium">{fighter.oib ?? <span className="text-muted-foreground italic">nije unesen</span>}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Datum rođenja</p>
              <p className="font-medium">{fighter.date_of_birth ? fmt(fighter.date_of_birth) : <span className="text-muted-foreground italic">nije unesen</span>}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Nacionalnost</p>
              <p className="font-medium">{fighter.nationality ?? <span className="text-muted-foreground italic">—</span>}</p>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Documents */}
      {(canUpload || isAdmin) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dokumenti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {docs.map((doc) => {
              const cfg = DOC_STATUS_CONFIG[doc.status];
              const Icon = cfg.icon;
              return (
                <div key={doc.doc_type} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{DOC_LABELS[doc.doc_type]}</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.className}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{DOC_DESC[doc.doc_type]}</p>
                      {doc.file_name && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          📎 {doc.file_name}
                        </p>
                      )}
                      {doc.notes && (
                        <p className="text-xs text-red-500 mt-1">{doc.notes}</p>
                      )}
                    </div>
                    {/* Upload button — fighter/coach */}
                    {canUpload && (doc.status === "missing" || doc.status === "rejected") && (
                      <Button size="sm" variant="outline" onClick={() => handleUpload(doc.doc_type)} className="shrink-0">
                        <Upload className="h-3.5 w-3.5 mr-1" />
                        Učitaj
                      </Button>
                    )}
                  </div>
                  {/* Admin approve/reject */}
                  {isAdmin && doc.status === "pending" && (
                    <div className="flex items-center gap-2 pt-1 border-t">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-500/40 hover:bg-green-500/10" onClick={() => handleApprove(doc)}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Odobri
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-500 border-red-500/40 hover:bg-red-500/10" onClick={() => handleReject(doc)}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Odbij
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

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
