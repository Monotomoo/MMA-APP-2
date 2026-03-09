// src/lib/demo-data.ts
// Central data layer — mirrors the Supabase schema exactly.
// To connect to Supabase: replace hook bodies in src/hooks/ — pages stay untouched.

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role               = "admin" | "coach" | "fighter";
export type TournamentStatus   = "upcoming" | "active" | "completed";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type BoutStatus         = "scheduled" | "completed";
export type SessionType        = "striking" | "grappling" | "sparring" | "conditioning" | "open_mat" | "other";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  city: string | null;
  logo_url: string | null;
  coach_id: string | null;
  created_at: string;
}

export interface Fighter {
  id: string;              // = profiles.id
  club_id: string | null;
  weight_class: string | null;
  wins: number;
  losses: number;
  draws: number;
  date_of_birth: string | null;   // "YYYY-MM-DD"
  nationality: string | null;
  bio: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  date: string | null;            // "YYYY-MM-DD"
  location: string | null;
  weight_class: string | null;
  status: TournamentStatus;
  created_by: string | null;
  created_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  fighter_id: string;
  status: RegistrationStatus;
  registered_at: string;
}

export interface Bout {
  id: string;
  tournament_id: string;
  fighter_a_id: string;
  fighter_b_id: string | null;   // null = TBD; "ext-*" = external opponent
  winner_id: string | null;
  method: string | null;
  round: number | null;
  bout_order: number;
  status: BoutStatus;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author_id: string;
  club_id: string | null;
  status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface TrainingSession {
  id: string;
  club_id: string;
  title: string;
  session_type: SessionType;
  day_of_week: number;     // 0 = Sun … 6 = Sat
  start_time: string;      // "HH:MM"
  end_time: string;        // "HH:MM"
  location: string | null;
  notes: string | null;
  is_active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Names for fighters not in the club (external opponents in bouts)
export const EXT_NAMES: Record<string, string> = {
  "ext-1": "Alen Novaković",
  "ext-2": "Stjepan Blažević",
  "ext-3": "Karlo Vujanović",
  "ext-4": "Mirko Grgić",
  "ext-5": "Luka Stanković",
};

export function getFighterName(id: string | null): string {
  if (!id) return "TBD";
  const p = PROFILES.find((p) => p.id === id);
  if (p) return p.full_name;
  return EXT_NAMES[id] ?? "Nepoznat";
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

export const PROFILES: Profile[] = [
  { id: "1",  full_name: "Tomo (Admin)",      role: "admin",   avatar_url: null,                  created_at: "2026-02-28T10:00:00Z" },
  { id: "2",  full_name: "Dejan Gunjavić",   role: "coach",   avatar_url: null,                  created_at: "2026-02-28T10:01:00Z" },
  { id: "3",  full_name: "Ivan Horvat",       role: "fighter", avatar_url: "/fighters/ivan.png",  created_at: "2026-02-28T10:02:00Z" },
  { id: "4",  full_name: "Marko Perić",       role: "fighter", avatar_url: "/fighters/marko.png", created_at: "2026-02-28T10:03:00Z" },
  { id: "5",  full_name: "Ante Bušić",        role: "fighter", avatar_url: "/fighters/ante.png",  created_at: "2026-02-28T10:04:00Z" },
  { id: "6",  full_name: "Luka Šimunić",      role: "fighter", avatar_url: "/fighters/luka.png",  created_at: "2026-02-28T10:05:00Z" },
  { id: "7",  full_name: "Domagoj Kovač",     role: "fighter", avatar_url: null,                  created_at: "2026-02-28T10:06:00Z" },
  { id: "8",  full_name: "Josip Blažević",    role: "fighter", avatar_url: null,                  created_at: "2026-02-28T10:07:00Z" },
  { id: "9",  full_name: "Nikola Rukavina",   role: "fighter", avatar_url: null,                  created_at: "2026-02-28T10:08:00Z" },
  { id: "10", full_name: "Bruno Šarić",       role: "fighter", avatar_url: null,                  created_at: "2026-02-28T10:09:00Z" },
];

export const CLUBS: Club[] = [
  { id: "club-1", name: "Antigravity MMA", city: "Zagreb", logo_url: "/clubs/antigravity-mma.png", coach_id: null, created_at: "2026-02-28T10:00:00Z" },
  { id: "club-2", name: "Crows",           city: "Zagreb", logo_url: "/clubs/crows.png",            coach_id: "2",  created_at: "2026-02-28T10:10:00Z" },
];

export const FIGHTERS: Fighter[] = [
  { id: "3",  club_id: "club-2", weight_class: "Middleweight", wins: 8,  losses: 2, draws: 0, date_of_birth: "1998-04-15", nationality: "Croatia", bio: "Dinamičan striker s odličnim clinch radom. Trenira u Antigravity MMA od 2021. godine." },
  { id: "4",  club_id: "club-2", weight_class: "Lightweight",  wins: 12, losses: 1, draws: 1, date_of_birth: "1996-09-22", nationality: "Croatia", bio: "Veteran domaće scene, bivši prvak regije u Lightweightu. Specijalist za takedowne i ground and pound." },
  { id: "5",  club_id: "club-2", weight_class: "Welterweight", wins: 5,  losses: 3, draws: 0, date_of_birth: "2001-02-08", nationality: "Croatia", bio: "Mladi Welterweight s velikim potencijalom. Dolazi iz BJJ background-a, radi na striking igri." },
  { id: "6",  club_id: "club-2", weight_class: "Bantamweight", wins: 7,  losses: 0, draws: 0, date_of_birth: "2000-11-30", nationality: "Croatia", bio: "Neporaženi Bantamweight i ponos kluba. Brz, eksplozivan i precizan — završava borbe rano." },
  { id: "7",  club_id: "club-2", weight_class: "Heavyweight",  wins: 3,  losses: 4, draws: 1, date_of_birth: "1994-07-19", nationality: "Croatia", bio: "Iskusan Heavyweight koji uči i raste iz svake borbe. Jači grappler, radi na kondicioniranju." },
  { id: "8",  club_id: "club-1", weight_class: "Featherweight", wins: 6, losses: 2, draws: 0, date_of_birth: "1999-03-12", nationality: "Croatia", bio: "Brz i tehnički Featherweight iz Crows kluba. Odličan u stand-up borbi, radi na ground igri." },
  { id: "9",  club_id: "club-1", weight_class: "Lightweight",   wins: 4, losses: 3, draws: 1, date_of_birth: "2000-08-25", nationality: "Croatia", bio: "Borbeni Lightweight koji nikad ne odustaje. Odlična izdržljivost i čvrsta brada." },
  { id: "10", club_id: "club-1", weight_class: "Welterweight",  wins: 9, losses: 1, draws: 0, date_of_birth: "1997-05-18", nationality: "Croatia", bio: "Dominantni Welterweight i ponos Crows kluba. Specijalist za grappling i rear-naked choke." },
];

export const TOURNAMENTS: Tournament[] = [
  { id: "t-1", name: "Otvoreno Prvenstvo Hrvatske u MMA", date: "2026-04-15", location: "Osijek, Hrvatska",  weight_class: "Lightweight",  status: "upcoming",  created_by: "1", created_at: "2026-03-01T08:00:00Z" },
  { id: "t-2", name: "Zagreb Fight Night #3",             date: "2025-11-22", location: "Zagreb, Hrvatska",  weight_class: "Middleweight", status: "completed", created_by: "1", created_at: "2025-10-01T08:00:00Z" },
];

export const REGISTRATIONS: TournamentRegistration[] = [
  { id: "reg-1", tournament_id: "t-1", fighter_id: "6", status: "approved", registered_at: "2026-03-02T09:00:00Z" },
  { id: "reg-2", tournament_id: "t-1", fighter_id: "4", status: "approved", registered_at: "2026-03-03T10:00:00Z" },
  { id: "reg-3", tournament_id: "t-1", fighter_id: "3", status: "pending",  registered_at: "2026-03-06T14:00:00Z" },
  { id: "reg-4", tournament_id: "t-2", fighter_id: "6", status: "approved", registered_at: "2025-11-01T09:00:00Z" },
  { id: "reg-5", tournament_id: "t-2", fighter_id: "4", status: "approved", registered_at: "2025-11-01T10:00:00Z" },
  { id: "reg-6", tournament_id: "t-2", fighter_id: "3", status: "approved", registered_at: "2025-11-01T11:00:00Z" },
  { id: "reg-7", tournament_id: "t-2", fighter_id: "5", status: "approved", registered_at: "2025-11-01T12:00:00Z" },
  { id: "reg-8", tournament_id: "t-2", fighter_id: "7", status: "approved", registered_at: "2025-11-01T13:00:00Z" },
];

export const BOUTS: Bout[] = [
  // Zagreb Fight Night #3 (t-2) — completed
  { id: "b-1", tournament_id: "t-2", fighter_a_id: "6", fighter_b_id: "ext-1", winner_id: "6",     method: "TKO",        round: 1, bout_order: 1, status: "completed" },
  { id: "b-2", tournament_id: "t-2", fighter_a_id: "4", fighter_b_id: "ext-2", winner_id: "4",     method: "Decision",   round: 3, bout_order: 2, status: "completed" },
  { id: "b-3", tournament_id: "t-2", fighter_a_id: "3", fighter_b_id: "ext-3", winner_id: "3",     method: "Submission", round: 2, bout_order: 3, status: "completed" },
  { id: "b-4", tournament_id: "t-2", fighter_a_id: "7", fighter_b_id: "ext-4", winner_id: "ext-4", method: "TKO",        round: 2, bout_order: 4, status: "completed" },
  { id: "b-5", tournament_id: "t-2", fighter_a_id: "5", fighter_b_id: "ext-5", winner_id: "5",     method: "Decision",   round: 3, bout_order: 5, status: "completed" },
  // Otvoreno Prvenstvo (t-1) — upcoming, opponents TBD
  { id: "b-6", tournament_id: "t-1", fighter_a_id: "6", fighter_b_id: null, winner_id: null, method: null, round: null, bout_order: 1, status: "scheduled" },
  { id: "b-7", tournament_id: "t-1", fighter_a_id: "4", fighter_b_id: null, winner_id: null, method: null, round: null, bout_order: 2, status: "scheduled" },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a-1",
    title: "Prijave otvorene — Otvoreno Prvenstvo Hrvatske u MMA",
    body: "Turnir se održava 15. travnja u Osijeku. Vaganje dan ranije, 14. travnja. Sve kategorije. Prijavite se kod trenera do kraja tjedna — mjesta su ograničena!",
    author_id: "1", club_id: "club-1", status: "approved", approved_by: "1",
    approved_at: "2026-03-06T12:00:00Z", created_at: "2026-03-06T11:00:00Z",
  },
  {
    id: "a-2",
    title: "Luka Šimunić ostaje neporažen — TKO u 1. rundi!",
    body: "Čestitamo Luki koji je u subotu u Splitu zaustavio protivnika u prvoj rundi. Rekord sada stoji na impresivnih 7-0. Mladi bantamweight je pravi ponos kluba!",
    author_id: "1", club_id: "club-1", status: "approved", approved_by: "1",
    approved_at: "2026-03-04T10:00:00Z", created_at: "2026-03-04T09:00:00Z",
  },
  {
    id: "a-3",
    title: "Dobrodošli u Antigravity MMA!",
    body: "Dragi borci i navijači, dobrodošli u naš novi sustav upravljanja klubom. Ovdje ćete pratiti raspored treninga, vijesti o turnirima i najave kluba. Jačamo zajedno!",
    author_id: "1", club_id: null, status: "approved", approved_by: "1",
    approved_at: "2026-02-28T12:00:00Z", created_at: "2026-02-28T11:00:00Z",
  },
];

export const TRAINING_SESSIONS: TrainingSession[] = [
  { id: "ts-1", club_id: "club-1", title: "Muay Thai Striking",      session_type: "striking",     day_of_week: 1, start_time: "18:00", end_time: "19:30", location: "Main Gym",    notes: null, is_active: true },
  { id: "ts-2", club_id: "club-1", title: "BJJ & Grappling",         session_type: "grappling",    day_of_week: 2, start_time: "19:00", end_time: "20:30", location: "Mat Room",    notes: null, is_active: true },
  { id: "ts-3", club_id: "club-1", title: "MMA Sparring",            session_type: "sparring",     day_of_week: 3, start_time: "18:30", end_time: "20:00", location: "Main Gym",    notes: null, is_active: true },
  { id: "ts-4", club_id: "club-1", title: "Strength & Conditioning", session_type: "conditioning", day_of_week: 4, start_time: "07:00", end_time: "08:30", location: "Weight Room", notes: null, is_active: true },
  { id: "ts-5", club_id: "club-1", title: "Open Mat",                session_type: "open_mat",     day_of_week: 5, start_time: "10:00", end_time: "12:00", location: "Mat Room",    notes: null, is_active: true },
  { id: "ts-6", club_id: "club-1", title: "Wrestling & Takedowns",   session_type: "grappling",    day_of_week: 6, start_time: "10:00", end_time: "11:30", location: "Main Gym",    notes: null, is_active: true },
  // Crows (club-2) — same weekly schedule
  { id: "ts-7", club_id: "club-2", title: "Muay Thai Striking",      session_type: "striking",     day_of_week: 1, start_time: "18:00", end_time: "19:30", location: "Main Gym",    notes: null, is_active: true },
  { id: "ts-8", club_id: "club-2", title: "BJJ & Grappling",         session_type: "grappling",    day_of_week: 2, start_time: "19:00", end_time: "20:30", location: "Mat Room",    notes: null, is_active: true },
  { id: "ts-9", club_id: "club-2", title: "MMA Sparring",            session_type: "sparring",     day_of_week: 3, start_time: "18:30", end_time: "20:00", location: "Main Gym",    notes: null, is_active: true },
  { id: "ts-10", club_id: "club-2", title: "Strength & Conditioning", session_type: "conditioning", day_of_week: 4, start_time: "07:00", end_time: "08:30", location: "Weight Room", notes: null, is_active: true },
  { id: "ts-11", club_id: "club-2", title: "Open Mat",                session_type: "open_mat",     day_of_week: 5, start_time: "10:00", end_time: "12:00", location: "Mat Room",    notes: null, is_active: true },
  { id: "ts-12", club_id: "club-2", title: "Wrestling & Takedowns",   session_type: "grappling",    day_of_week: 6, start_time: "10:00", end_time: "11:30", location: "Main Gym",    notes: null, is_active: true },
];

export function getRegistration(
  tournamentId: string,
  fighterId: string,
): TournamentRegistration | null {
  return REGISTRATIONS.find(
    (r) => r.tournament_id === tournamentId && r.fighter_id === fighterId,
  ) ?? null;
}

export function addRegistration(
  tournamentId: string,
  fighterId: string,
): TournamentRegistration {
  const existing = getRegistration(tournamentId, fighterId);
  if (existing) return existing;
  const reg: TournamentRegistration = {
    id: `reg-${Date.now()}`,
    tournament_id: tournamentId,
    fighter_id: fighterId,
    status: "pending",
    registered_at: new Date().toISOString(),
  };
  REGISTRATIONS.push(reg);
  return reg;
}
export function updateFighter(id: string, updates: Partial<Pick<Fighter, "club_id">>): void {
  const f = FIGHTERS.find((f) => f.id === id);
  if (f) Object.assign(f, updates);
}

export function createClub(data: Omit<Club, "id" | "created_at">): Club {
  const c: Club = { ...data, id: `club-${Date.now()}`, created_at: new Date().toISOString() };
  CLUBS.push(c);
  return c;
}

export function updateClub(
  id: string,
  updates: { name?: string; city?: string | null; coach_id?: string | null },
): void {
  const club = CLUBS.find((c) => c.id === id);
  if (club) Object.assign(club, updates);
}

export function addTrainingSession(
  data: Omit<TrainingSession, "id">,
): TrainingSession {
  const session: TrainingSession = { ...data, id: `ts-${Date.now()}` };
  TRAINING_SESSIONS.push(session);
  return session;
}

export function removeTrainingSession(id: string): void {
  const idx = TRAINING_SESSIONS.findIndex((s) => s.id === id);
  if (idx !== -1) TRAINING_SESSIONS.splice(idx, 1);
}

export function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus,
): void {
  const reg = REGISTRATIONS.find((r) => r.id === id);
  if (reg) reg.status = status;
}

export function createTournament(
  data: Omit<Tournament, "id" | "created_at">,
): Tournament {
  const t: Tournament = {
    ...data,
    id: `t-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  TOURNAMENTS.push(t);
  return t;
}

export function updateTournament(
  id: string,
  updates: Partial<Omit<Tournament, "id" | "created_at">>,
): void {
  const t = TOURNAMENTS.find((t) => t.id === id);
  if (t) Object.assign(t, updates);
}

export function deleteTournament(id: string): void {
  const idx = TOURNAMENTS.findIndex((t) => t.id === id);
  if (idx !== -1) TOURNAMENTS.splice(idx, 1);
}

export function addBout(data: Omit<Bout, "id">): Bout {
  const b: Bout = { ...data, id: `b-${Date.now()}` };
  BOUTS.push(b);
  return b;
}

export function updateBout(
  id: string,
  updates: Partial<Omit<Bout, "id" | "tournament_id">>,
): void {
  const b = BOUTS.find((b) => b.id === id);
  if (b) Object.assign(b, updates);
}

export function createAnnouncement(
  data: Omit<Announcement, "id" | "created_at" | "approved_by" | "approved_at">,
): Announcement {
  const a: Announcement = {
    ...data,
    id: `a-${Date.now()}`,
    approved_by: null,
    approved_at: null,
    created_at: new Date().toISOString(),
  };
  ANNOUNCEMENTS.push(a);
  return a;
}

export function updateAnnouncementStatus(
  id: string,
  status: "approved" | "rejected",
  approvedBy: string,
): void {
  const a = ANNOUNCEMENTS.find((a) => a.id === id);
  if (a) {
    a.status = status;
    a.approved_by = approvedBy;
    a.approved_at = new Date().toISOString();
  }
}

export function createProfile(
  data: Omit<Profile, "id" | "created_at">,
): Profile {
  const p: Profile = {
    ...data,
    id: `u-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  PROFILES.push(p);
  return p;
}

export function updateProfile(
  id: string,
  updates: Partial<Pick<Profile, "full_name" | "role">>,
): void {
  const p = PROFILES.find((p) => p.id === id);
  if (p) Object.assign(p, updates);
}

export function deleteProfile(id: string): void {
  const idx = PROFILES.findIndex((p) => p.id === id);
  if (idx !== -1) PROFILES.splice(idx, 1);
}
