# Portora.id — Web App

> **Portora.id** by TalentRank — portfolio-first creative talent discovery platform for Indonesian recruiters.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · Supabase (auth, Postgres, storage)

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (for local dev + migrations)
- Docker Desktop (for `supabase start` locally)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template + fill in your Supabase project keys
cp .env.local.example .env.local

# 3. (Option A) Run against hosted Supabase
#    Create project at https://app.supabase.com, paste URL + anon key into .env.local
#    Then apply migration:
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push

# 3. (Option B) Run Supabase locally
npx supabase start
# Anon key + URL will print — paste into .env.local as http://localhost:54321
npx supabase db reset   # applies migrations + runs seed.sql

# 4. Generate TypeScript types from DB
npm run db:types

# 5. Start dev server
npm run dev
# → http://localhost:3000
```

## Storage buckets

Create these via Supabase Dashboard → Storage (or CLI):

| Bucket          | Visibility | Used for                        |
| --------------- | ---------- | ------------------------------- |
| `avatars`       | Public     | Candidate profile photos        |
| `portfolio`     | Public     | Portfolio item media            |
| `company-logos` | Public     | Recruiter company logos         |

---

## Project structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout + fonts (Inter, Fraunces, JetBrains Mono)
│   │   ├── page.tsx               # Landing page (/)
│   │   ├── globals.css            # Tailwind + corporate theme tokens
│   │   ├── (marketing)/           # Public marketing pages
│   │   │   ├── for-recruiters/
│   │   │   ├── for-talent/
│   │   │   └── pricing/
│   │   ├── (app)/                 # Authenticated app
│   │   │   ├── discover/          # Recruiter candidate search
│   │   │   ├── talent/[slug]/     # Public talent profile
│   │   │   ├── shortlists/
│   │   │   ├── dashboard/         # Candidate dashboard
│   │   │   └── onboarding/        # 5-step candidate onboarding
│   │   ├── (auth)/                # Login / signup
│   │   └── admin/                 # Admin moderation panel
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives (button, card, input…)
│   │   ├── brand/                 # Logo, nav, footer
│   │   └── candidate/             # CandidateCard, FitScoreBreakdown
│   └── lib/
│       ├── supabase/              # client.ts, server.ts, middleware.ts, database.types.ts
│       └── utils.ts               # cn(), formatRp(), slugify(), timeAgoId()
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql   # All tables + RLS + triggers
├── middleware.ts                  # Auth session refresh + route protection
├── tailwind.config.ts             # Corporate theme (navy, amber, accent)
├── components.json                # shadcn/ui config
└── package.json
```

## Database schema

See `supabase/migrations/0001_initial_schema.sql`. Tables map to PRD §16:

- `users` — mirrors `auth.users` with role (candidate / recruiter / admin)
- `candidate_profiles` + `candidate_skills` / `_tools` / `_industries`
- `portfolio_items` — with AI embedding column for semantic search
- `recruiter_profiles` — subscription tier tracked here
- `saved_candidates`, `shortlists`, `shortlist_items`
- `fit_scores` — AI-generated per role template
- `invites` — outreach tracking
- `moderation_logs` — admin audit trail

**RLS enabled on all tables.** Public can read approved candidate profiles; recruiters see full candidate DB when authenticated; candidates manage their own data; admins bypass via `current_user_role()`.

## Routing (from PRD §15)

| URL                        | File                                             | Access            |
| -------------------------- | ------------------------------------------------ | ----------------- |
| `/`                        | `src/app/page.tsx`                               | Public            |
| `/for-recruiters`          | `src/app/(marketing)/for-recruiters/page.tsx`    | Public            |
| `/for-talent`              | `src/app/(marketing)/for-talent/page.tsx`        | Public            |
| `/pricing`                 | `src/app/(marketing)/pricing/page.tsx`           | Public            |
| `/login`, `/signup`        | `src/app/(auth)/…`                               | Public (redirects if logged in) |
| `/discover`                | `src/app/(app)/discover/page.tsx`                | Recruiter only    |
| `/talent/[slug]`           | `src/app/(app)/talent/[slug]/page.tsx`           | Public (approved profiles) |
| `/shortlists`              | `src/app/(app)/shortlists/page.tsx`              | Recruiter only    |
| `/dashboard`               | `src/app/(app)/dashboard/page.tsx`               | Candidate only    |
| `/onboarding`              | `src/app/(app)/onboarding/page.tsx`              | Candidate only    |
| `/admin`                   | `src/app/admin/page.tsx`                         | Admin only        |

Route protection handled by `middleware.ts` → `src/lib/supabase/middleware.ts`.

## Adding shadcn/ui components

```bash
npx shadcn@latest add dialog dropdown-menu tabs select popover
```

## Design tokens

The corporate theme uses these brand tokens (in `globals.css`):

| Token       | Value      | Usage                           |
| ----------- | ---------- | ------------------------------- |
| `--navy`    | `#1A365D`  | Primary brand, CTAs, active nav |
| `--accent`  | `#0D9488`  | Success, "open to work" badges  |
| `--amber`   | `#D97706`  | Featured, warnings, highlights  |
| `--base`    | `#FAFAF7`  | Page background                 |
| `--surface` | `#FFFFFF`  | Card background                 |
| `--ink`     | `#0A0E1A`  | Body text                       |

Use via Tailwind: `bg-navy`, `text-accent`, `border-line`, etc.

## Available pages

- ✅ **Landing** (`/`) — Hero, stats, features, CTA
- ✅ **Discover** (`/discover`) — Candidate search with real Supabase query (+ demo fallback)
- ✅ **Talent profile** (`/talent/[slug]`) — Portfolio, AI summary, fit score
- ✅ **Onboarding** (`/onboarding`) — 5-step stepper (Step 3 implemented)

## To be ported from `ui-corporate/`

These static pages exist as HTML references in `../ui-corporate/` — port to Next.js as needed:

- `for-talent.html` → `(marketing)/for-talent/page.tsx`
- `for-recruiters.html` → `(marketing)/for-recruiters/page.tsx`
- `pricing.html` → `(marketing)/pricing/page.tsx`
- `shortlist.html` → `(app)/shortlists/page.tsx`
- `dashboard.html` → `(app)/dashboard/page.tsx`
- `admin.html` → `admin/page.tsx`

## Common tasks

```bash
# Dev
npm run dev                    # Next.js dev server with Turbopack
npm run typecheck              # Validate TypeScript

# Database
npm run db:types               # Regenerate Supabase TypeScript types
npm run db:reset               # Reset local DB + reapply migrations
npm run db:push                # Push migrations to remote Supabase

# Build
npm run build                  # Production build
npm start                      # Serve production build
```

## Seed data (optional)

Create `supabase/seed.sql` with fixture candidates to populate local dev:

```sql
-- Example: insert 3 demo candidates (user_id from auth.users must exist first)
-- See docs/seed-example.sql for full fixtures
```

Run `npx supabase db reset` to apply.

---

**PRD reference:** `../PRD-TalentRankCreative.md.md`
**HTML design reference:** `../ui-corporate/` (10 static pages with final design)
