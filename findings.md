# Antigravity MMA — Findings & Research

## Project State (as of init)
- React + Vite + TypeScript shell is set up and running
- Supabase project: `shxpxclefncbcmimdzsn`
- Database is EMPTY — no tables created yet
- Auth: Supabase Auth is configured but login page has no logic (bypassed for now)
- All pages are placeholders (`<PlaceholderPage />`)
- shadcn/ui component library fully available
- React Hook Form + Zod available for forms
- TanStack Query available for data fetching

## Key File Paths
- App entry: `src/App.tsx`
- Login page: `src/pages/LoginPage.tsx`
- Supabase client: `src/integrations/supabase/client.ts`
- Supabase types: `src/integrations/supabase/types.ts`
- Pages: `src/pages/`
- Components: `src/components/`

## Auth Notes
- Supabase Auth uses email + password
- Test user: tomo@tomo.com (created in Supabase dashboard)
- Login bypassed temporarily (redirects to /app/dashboard)
- Need: role column in profiles table, RLS policies, protected routes

## Constraints
- Supabase anon key only (no service role key in .env)
- All sensitive business logic must be protected by RLS (Row Level Security)

## Supabase RLS Strategy
- Use `auth.uid()` to scope data access
- `profiles` table stores role (admin | coach | fighter)
- All tables reference `profiles.id` for ownership
