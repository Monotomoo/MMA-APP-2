# Antigravity MMA — Project Constitution

> This file is law. Update it when schemas change, rules are added, or architecture is modified.
> Tech stack: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase

---

## 🏛️ Architectural Invariants

1. **Never** write business logic inside UI components. Pages fetch data; components display it.
2. **Never** bypass Supabase RLS. All data access is controlled at the database level.
3. **Never** store sensitive data in localStorage beyond what Supabase Auth requires.
4. **Always** use TanStack Query for data fetching (never raw useEffect for API calls).
5. **Always** use React Hook Form + Zod for form validation.
6. **Always** check role from `profiles` table before rendering admin/coach UI.

---

## 👤 Roles

| Role    | Value     | Capabilities                                                                      |
| ------- | --------- | --------------------------------------------------------------------------------- |
| Admin   | `admin`   | Full CRUD on all entities. User management.                                       |
| Coach   | `coach`   | Manage own club, manage fighters in their club, register fighters for tournaments |
| Fighter | `fighter` | View/edit own profile.                                                            |

---

## 🗄️ Data Schema

### `profiles` (extends Supabase Auth users)

```
id          uuid PRIMARY KEY (= auth.uid())
full_name   text NOT NULL
role        text CHECK (role IN ('admin', 'coach', 'fighter')) DEFAULT 'fighter'
avatar_url  text
created_at  timestamptz DEFAULT now()
```

### `clubs`

```
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text NOT NULL
city        text
logo_url    text
coach_id    uuid REFERENCES profiles(id)
created_at  timestamptz DEFAULT now()
```

### `fighters`

```
id          uuid PRIMARY KEY (= profiles.id)
club_id     uuid REFERENCES clubs(id)
weight_class text CHECK (weight_class IN (
              'Strawweight','Flyweight','Bantamweight','Featherweight',
              'Lightweight','Welterweight','Middleweight','Light Heavyweight','Heavyweight'))
wins        int DEFAULT 0
losses      int DEFAULT 0
draws       int DEFAULT 0
date_of_birth date
nationality text
bio         text
```

### `tournaments`

```
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
name         text NOT NULL
date         date
location     text
weight_class text
status       text CHECK (status IN ('upcoming','active','completed')) DEFAULT 'upcoming'
created_by   uuid REFERENCES profiles(id)
created_at   timestamptz DEFAULT now()
```

### `tournament_registrations`

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
tournament_id   uuid REFERENCES tournaments(id)
fighter_id      uuid REFERENCES fighters(id)
status          text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending'
registered_at   timestamptz DEFAULT now()
UNIQUE(tournament_id, fighter_id)
```

### `bouts`

```
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
tournament_id   uuid REFERENCES tournaments(id)
fighter_a_id    uuid REFERENCES fighters(id)
fighter_b_id    uuid REFERENCES fighters(id)
winner_id       uuid REFERENCES fighters(id) NULLABLE
method          text  -- e.g. 'KO', 'Submission', 'Decision'
round           int
bout_order      int
status          text CHECK (status IN ('scheduled','completed')) DEFAULT 'scheduled'
```

### `weight_classes` (lookup table — optional, all fields nullable on fighters)

```
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text NOT NULL UNIQUE  -- e.g. 'Lightweight'
gender      text CHECK (gender IN ('male','female','open')) DEFAULT 'open'
limit_kg    numeric(5,2)          -- weight limit in kg
sort_order  int                   -- for display ordering
```

Seed data (male):
Strawweight(52.2kg), Flyweight(56.7kg), Bantamweight(61.2kg), Featherweight(65.8kg),
Lightweight(70.3kg), Welterweight(77.1kg), Middleweight(83.9kg), Light Heavyweight(93.0kg), Heavyweight(120.2kg)

### `announcements` (optional — powers Dashboard news feed)

```
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
title       text NOT NULL
body        text NOT NULL
author_id   uuid REFERENCES profiles(id)
club_id     uuid REFERENCES clubs(id) NULLABLE  -- null = global/federation-wide
status      text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending'
approved_by uuid REFERENCES profiles(id) NULLABLE
approved_at timestamptz NULLABLE
created_at  timestamptz DEFAULT now()
```

Rules:
- Coaches and admins can submit announcements
- Only admins can approve/reject
- Dashboard shows only `status = 'approved'` to all users

### `training_sessions` (optional — club schedule)

```
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
club_id      uuid REFERENCES clubs(id)
title        text NOT NULL               -- e.g. 'Tuesday Sparring'
session_type text CHECK (session_type IN ('striking','grappling','sparring','conditioning','open_mat','other'))
day_of_week  int CHECK (day_of_week BETWEEN 0 AND 6)  -- 0=Sun, 6=Sat
start_time   time NOT NULL
end_time     time NOT NULL
location     text                        -- e.g. 'Main Gym', 'Room B'
notes        text
is_active    boolean DEFAULT true
```

---

## 🔐 RLS Rules (Supabase Row Level Security)

| Table                    | SELECT                  | INSERT/UPDATE/DELETE         |
| ------------------------ | ----------------------- | ---------------------------- |
| profiles                 | own row OR admin        | own row only                 |
| clubs                    | public                  | admin or coach (own club)    |
| fighters                 | public                  | admin or own fighter         |
| tournaments              | public                  | admin only                   |
| tournament_registrations | public                  | fighter (own) or admin       |
| bouts                    | public                  | admin only                   |
| weight_classes           | public                  | admin only                   |
| announcements            | approved only (public)  | coach/admin submit; admin approves |
| training_sessions        | public                  | coach (own club) or admin    |

---

## 📁 Folder Conventions

```
src/
  pages/          Route-level components (data fetching here)
  components/     Reusable UI components (no data fetching)
  components/ui/  shadcn/ui primitives (never modify)
  hooks/          Custom hooks (useAuth, useProfile, etc.)
  integrations/supabase/  Supabase client + types
  lib/            Pure utilities (no side effects)
```

---

## 🛤️ Routes

| Path             | Component       | Access        |
| ---------------- | --------------- | ------------- |
| /login           | LoginPage       | Public        |
| /app/dashboard   | DashboardPage   | Authenticated |
| /app/my-club     | MyClubPage      | Coach/Admin   |
| /app/tournaments | TournamentsPage | Authenticated |
| /app/admin       | AdminPage       | Admin only    |
