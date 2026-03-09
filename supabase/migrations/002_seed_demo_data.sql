-- ============================================================
-- Antigravity MMA — Demo Seed Data (Croatian club)
-- Run in Supabase → SQL Editor
-- ============================================================

do $$
declare
  club_id   uuid := gen_random_uuid();
  tomo_id   uuid;
  f1        uuid := gen_random_uuid();
  f2        uuid := gen_random_uuid();
  f3        uuid := gen_random_uuid();
  f4        uuid := gen_random_uuid();
  f5        uuid := gen_random_uuid();
begin

  -- Get Tomo's profile ID
  select id into tomo_id from public.profiles
  where id = (select id from auth.users where email = 'tomo@tomo.com')
  limit 1;

  -- ── Create auth users for the 5 fighters ──────────────────
  insert into auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) values
    (f1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ivan.horvat@antigravity.mma', '',
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"full_name":"Ivan Horvat"}'),

    (f2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'marko.peric@antigravity.mma', '',
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"full_name":"Marko Perić"}'),

    (f3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'ante.busic@antigravity.mma', '',
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"full_name":"Ante Bušić"}'),

    (f4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'luka.simunic@antigravity.mma', '',
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"full_name":"Luka Šimunić"}'),

    (f5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'domagoj.kovac@antigravity.mma', '',
     now(), now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"full_name":"Domagoj Kovač"}');

  -- Profiles are auto-created by the trigger.
  -- Set roles to fighter explicitly.
  update public.profiles set role = 'fighter'
  where id in (f1, f2, f3, f4, f5);

  -- ── Create the club ───────────────────────────────────────
  insert into public.clubs (id, name, city, country, coach_id)
  values (club_id, 'Antigravity MMA', 'Zagreb', 'Croatia', tomo_id);

  -- ── Create fighter records ────────────────────────────────
  insert into public.fighters (id, club_id, weight_class, wins, losses, draws, nationality, date_of_birth, bio)
  values
    (f1, club_id, 'Middleweight',   8,  2, 0, 'Croatian', '1997-03-14',
     'Veteran of the Zagreb circuit. Known for relentless pressure and knockout power.'),

    (f2, club_id, 'Lightweight',   12,  1, 1, 'Croatian', '1995-07-22',
     'Submission specialist and BJJ black belt. Holds the club record for most finishes.'),

    (f3, club_id, 'Welterweight',   5,  3, 0, 'Croatian', '2000-11-05',
     'Young contender with heavy hands. Has stopped 4 of his 5 wins inside the distance.'),

    (f4, club_id, 'Bantamweight',   7,  0, 0, 'Croatian', '2001-02-28',
     'Undefeated prospect. Dominated the amateur circuit before turning pro in 2023.'),

    (f5, club_id, 'Heavyweight',    3,  4, 1, 'Croatian', '1993-09-17',
     'Iron-chinned brawler working his way back up the rankings after a tough stretch.');

  -- ── Training schedule ─────────────────────────────────────
  insert into public.training_sessions (club_id, title, session_type, day_of_week, start_time, end_time, location)
  values
    (club_id, 'Muay Thai Striking',    'striking',     1, '18:00', '19:30', 'Main Gym'),
    (club_id, 'BJJ & Grappling',       'grappling',    2, '19:00', '20:30', 'Mat Room'),
    (club_id, 'MMA Sparring',          'sparring',     3, '18:30', '20:00', 'Main Gym'),
    (club_id, 'Strength & Conditioning','conditioning', 4, '07:00', '08:30', 'Weight Room'),
    (club_id, 'Open Mat',              'open_mat',     5, '10:00', '12:00', 'Mat Room'),
    (club_id, 'Wrestling & Takedowns', 'grappling',    6, '10:00', '11:30', 'Main Gym');

  -- ── Announcements (pre-approved) ──────────────────────────
  insert into public.announcements (title, body, author_id, status, approved_by, approved_at, created_at)
  values
    (
      'Dobrodošli u Antigravity MMA!',
      'Dragi borci i navijači, dobrodošli u naš novi sustav upravljanja klubom. Ovdje ćete pratiti raspored treninga, vijesti o turnirima i najave kluba. Jačamo zajedno!',
      tomo_id, 'approved', tomo_id, now(), now() - interval '7 days'
    ),
    (
      'Luka Šimunić ostaje neporažen — TKO u 1. rundi!',
      'Čestitamo Luki koji je u subotu u Splitu zaustavio protivnika u prvoj rundi. Rekord sada stoji na impresivnih 7-0. Mladi bantamweight je pravi ponos kluba!',
      tomo_id, 'approved', tomo_id, now(), now() - interval '3 days'
    ),
    (
      'Prijave otvorene — Otvoreno Prvenstvo Hrvatske u MMA',
      'Turnir se održava 15. travnja u Osijeku. Vaganje dan ranije, 14. travnja. Sve kategorije. Prijavite se kod trenera do kraja tjedna — mjesta su ograničena!',
      tomo_id, 'approved', tomo_id, now(), now() - interval '1 day'
    );

  -- ── One tournament ────────────────────────────────────────
  insert into public.tournaments (name, date, location, weight_class, status, created_by)
  values
    ('Otvoreno Prvenstvo Hrvatske u MMA', '2026-04-15', 'Osijek, Hrvatska', 'Lightweight', 'upcoming', tomo_id),
    ('Zagreb Fight Night #3',             '2025-11-22', 'Zagreb, Hrvatska',  'Middleweight', 'completed', tomo_id);

end $$;
