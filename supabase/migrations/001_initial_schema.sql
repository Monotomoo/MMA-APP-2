-- ============================================================
-- Antigravity MMA — Initial Schema Migration
-- Run this in Supabase → SQL Editor
-- ============================================================

-- ─── PROFILES ───────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null default 'fighter' check (role in ('admin','coach','fighter')),
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── CLUBS ──────────────────────────────────────────────────
create table public.clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  country     text,
  logo_url    text,
  coach_id    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- ─── WEIGHT CLASSES ─────────────────────────────────────────
create table public.weight_classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  gender      text default 'open' check (gender in ('male','female','open')),
  limit_kg    numeric(5,2),
  sort_order  int
);

-- Seed standard MMA weight classes
insert into public.weight_classes (name, gender, limit_kg, sort_order) values
  ('Strawweight',       'male',   52.2,  1),
  ('Flyweight',         'male',   56.7,  2),
  ('Bantamweight',      'male',   61.2,  3),
  ('Featherweight',     'male',   65.8,  4),
  ('Lightweight',       'male',   70.3,  5),
  ('Welterweight',      'male',   77.1,  6),
  ('Middleweight',      'male',   83.9,  7),
  ('Light Heavyweight', 'male',   93.0,  8),
  ('Heavyweight',       'male',  120.2,  9),
  ('Strawweight',       'female', 52.2, 10),
  ('Flyweight',         'female', 56.7, 11),
  ('Bantamweight',      'female', 61.2, 12),
  ('Featherweight',     'female', 65.8, 13),
  ('Atomweight',        'female', 47.6, 14)
on conflict (name) do nothing;

-- ─── FIGHTERS ───────────────────────────────────────────────
create table public.fighters (
  id            uuid primary key references public.profiles(id) on delete cascade,
  club_id       uuid references public.clubs(id) on delete set null,
  weight_class  text,
  wins          int not null default 0,
  losses        int not null default 0,
  draws         int not null default 0,
  date_of_birth date,
  nationality   text,
  bio           text
);

-- ─── TOURNAMENTS ────────────────────────────────────────────
create table public.tournaments (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  date         date,
  location     text,
  weight_class text,
  status       text not null default 'upcoming' check (status in ('upcoming','active','completed')),
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz default now()
);

-- ─── TOURNAMENT REGISTRATIONS ────────────────────────────────
create table public.tournament_registrations (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid not null references public.tournaments(id) on delete cascade,
  fighter_id     uuid not null references public.fighters(id) on delete cascade,
  status         text not null default 'pending' check (status in ('pending','approved','rejected')),
  registered_at  timestamptz default now(),
  unique(tournament_id, fighter_id)
);

-- ─── BOUTS ──────────────────────────────────────────────────
create table public.bouts (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid references public.tournaments(id) on delete cascade,
  fighter_a_id   uuid references public.fighters(id) on delete set null,
  fighter_b_id   uuid references public.fighters(id) on delete set null,
  winner_id      uuid references public.fighters(id) on delete set null,
  method         text,
  round          int,
  bout_order     int,
  status         text not null default 'scheduled' check (status in ('scheduled','completed'))
);

-- ─── ANNOUNCEMENTS ──────────────────────────────────────────
create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  author_id    uuid references public.profiles(id) on delete set null,
  club_id      uuid references public.clubs(id) on delete cascade,  -- null = global
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_by  uuid references public.profiles(id) on delete set null,
  approved_at  timestamptz,
  created_at   timestamptz default now()
);

-- ─── TRAINING SESSIONS ──────────────────────────────────────
create table public.training_sessions (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references public.clubs(id) on delete cascade,
  title         text not null,
  session_type  text check (session_type in ('striking','grappling','sparring','conditioning','open_mat','other')),
  day_of_week   int check (day_of_week between 0 and 6),  -- 0=Sun, 6=Sat
  start_time    time not null,
  end_time      time not null,
  location      text,
  notes         text,
  is_active     boolean not null default true
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles            enable row level security;
alter table public.clubs               enable row level security;
alter table public.weight_classes      enable row level security;
alter table public.fighters            enable row level security;
alter table public.tournaments         enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.bouts               enable row level security;
alter table public.announcements       enable row level security;
alter table public.training_sessions   enable row level security;

-- Helper function: get current user's role
create or replace function public.my_role()
returns text language sql security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES
create policy "Users can view own profile"    on public.profiles for select using (id = auth.uid() or public.my_role() = 'admin');
create policy "Users can update own profile"  on public.profiles for update using (id = auth.uid());

-- CLUBS (public read, coach/admin write)
create policy "Clubs are public"              on public.clubs for select using (true);
create policy "Admins manage clubs"           on public.clubs for all using (public.my_role() = 'admin');
create policy "Coaches manage own club"       on public.clubs for update using (coach_id = auth.uid());

-- WEIGHT CLASSES (public read, admin write)
create policy "Weight classes are public"     on public.weight_classes for select using (true);
create policy "Admins manage weight classes"  on public.weight_classes for all using (public.my_role() = 'admin');

-- FIGHTERS (public read, own row or admin write)
create policy "Fighters are public"           on public.fighters for select using (true);
create policy "Fighters update own profile"   on public.fighters for update using (id = auth.uid());
create policy "Admins manage fighters"        on public.fighters for all using (public.my_role() = 'admin');

-- TOURNAMENTS (public read, admin write)
create policy "Tournaments are public"        on public.tournaments for select using (true);
create policy "Admins manage tournaments"     on public.tournaments for all using (public.my_role() = 'admin');

-- TOURNAMENT REGISTRATIONS
create policy "Registrations are public"      on public.tournament_registrations for select using (true);
create policy "Fighters register themselves"  on public.tournament_registrations for insert with check (fighter_id = auth.uid());
create policy "Admins manage registrations"   on public.tournament_registrations for all using (public.my_role() = 'admin');

-- BOUTS (public read, admin write)
create policy "Bouts are public"              on public.bouts for select using (true);
create policy "Admins manage bouts"           on public.bouts for all using (public.my_role() = 'admin');

-- ANNOUNCEMENTS (approved=public, pending=author+admin, admin approves)
create policy "Approved announcements are public"  on public.announcements for select using (status = 'approved' or author_id = auth.uid() or public.my_role() = 'admin');
create policy "Coaches and admins can post"        on public.announcements for insert with check (public.my_role() in ('coach','admin'));
create policy "Admins approve announcements"       on public.announcements for update using (public.my_role() = 'admin');
create policy "Authors delete own pending"         on public.announcements for delete using (author_id = auth.uid() and status = 'pending');

-- TRAINING SESSIONS (public read, coach of own club or admin write)
create policy "Sessions are public"           on public.training_sessions for select using (true);
create policy "Admins manage sessions"        on public.training_sessions for all using (public.my_role() = 'admin');
create policy "Coaches manage own club sessions" on public.training_sessions for all
  using (exists (select 1 from public.clubs where id = training_sessions.club_id and coach_id = auth.uid()));
