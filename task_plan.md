# Antigravity MMA — Task Plan

## Mission
All-in-one MMA platform: Club management + Tournament organization + Fighter tracking.

---

## Phases & Checklist

### ✅ Phase 0 — Initialization
- [x] Discovery questions answered
- [x] Memory files created
- [x] CLAUDE.md Project Constitution written
- [ ] Data schema approved

### 🔲 Phase 1 — Blueprint
- [ ] Core data schema defined in CLAUDE.md
- [ ] Supabase tables designed
- [ ] Role-based access rules defined

### 🔲 Phase 2 — Link (Connectivity)
- [ ] Supabase connection verified
- [ ] Auth flow working (login/logout)
- [ ] Role detection working

### 🔲 Phase 3 — Architect (Build)
- [ ] Supabase migrations written and applied
- [ ] Auth: login, session, role-based routing
- [ ] Dashboard page (news/announcements)
- [ ] My Club page (club profile, roster)
- [ ] Fighters page (profiles, records, stats)
- [ ] Tournaments page (bracket, registration)
- [ ] Admin page (user management, club management)

### 🔲 Phase 4 — Stylize
- [ ] UI polish pass
- [ ] Mobile responsiveness
- [ ] User feedback incorporated

### 🔲 Phase 5 — Trigger (Deploy)
- [ ] Production Supabase env configured
- [ ] Vercel/Netlify deployment set up
- [ ] Final documentation

---

## Roles
| Role    | Access                                              |
|---------|-----------------------------------------------------|
| Admin   | Full access — manage all clubs, fighters, tournaments |
| Coach   | Manage own club's fighters, submit to tournaments   |
| Fighter | View own profile, register for tournaments          |

---

## Tech Stack
- Frontend: React 18 + TypeScript + Vite
- UI: Tailwind CSS + shadcn/ui
- Backend: Supabase (Auth + PostgreSQL)
- Routing: React Router v6
- Forms: React Hook Form + Zod
- Data: TanStack Query (React Query)
