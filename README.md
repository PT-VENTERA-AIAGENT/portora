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
#    Create a NEW dedicated project at https://app.supabase.com, paste URL + anon key into .env.local
#    Then apply migrations (dedicated project only — for the shared TalentRank project use the SQL editor):
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

> ⚠️ **Shared Supabase project.** Portora shares a Supabase project with TalentRank, so Portora tables are prefixed
> `portora_` (exception: `blog_posts` from `0002`; check that TalentRank has no `blog_posts` table before applying it,
> otherwise `0002` either fails or writes its seed posts and policy into TalentRank's table). On the shared project
> apply migrations with the SQL editor, not `supabase db push`, and run `supabase link` yourself (the link state in
> `supabase/.temp/` is not committed).
> `supabase/legacy/001_portora_schema.sql` is kept for history only: it creates a generic `public.profiles` table and
> replaces the `on_auth_user_created` trigger on `auth.users`, which can break TalentRank signups. The app only uses
> the `portora_*` tables from `0003_portora_core.sql`.

## Go-live checklist

**Database (Supabase project owner)**
- [ ] Run `supabase/migrations/0003_portora_core.sql` on the production project **via the SQL editor** (apply `0002_blog_and_leads.sql` first if it is not there yet). Do **not** use `supabase db push` on the shared TalentRank project: its migration history belongs to TalentRank.
- [ ] Never run `supabase/legacy/001_portora_schema.sql` there (it replaces `handle_new_user` / `on_auth_user_created` on `auth.users`).
- [ ] Add at least one admin: `insert into portora_admins (user_id) select id from auth.users where email = '...';`

**Supabase Auth settings**
- [ ] Site URL = production domain; add `https://<domain>/auth/callback` to Redirect URLs.
- [ ] Google provider (client ID/secret) if "Lanjut dengan Google" stays enabled.
- [ ] Custom SMTP (e.g. Resend SMTP). The built-in Supabase mailer is rate-limited and not meant for production; confirmation and reset-password emails depend on it.

**Environment variables (hosting, e.g. Vercel)**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only; needed for account deletion and email lookups)
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://<domain>` (canonical URLs, sitemap, email links)
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` on a domain verified in Resend (invite / accepted / review emails)
- [ ] `ANTHROPIC_API_KEY` with active credits (AI summary; optional)
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` (shown on Privacy & Terms)
- [ ] Do **not** set `EMAIL_API_URL` in production (local demo only).

**Content & legal**
- [ ] Legal review of `/privacy` and `/terms`.
- [ ] Confirm or remove unverified marketing claims (landing "Dipercaya 180+ perusahaan" and logo strip, for-recruiters stats, for-talent counts, "AI fit scoring" announcement) and seeded blog statistics.

**After deploy**
- [ ] Smoke test: register talent → admin approve → recruiter invite → accept → WhatsApp visible; forgot password email arrives.
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console.

## Product flow

```
Talent:     /register?role=talent → /onboarding (5 steps) → status "pending"
            → admin approves in /admin → listed in /discover
            → /dashboard: accept/decline invites, manage work samples, toggle open-to-work
Recruiter:  /register?role=recruiter → /company (company profile, 14-day Growth trial)
            → /discover (filters, fit score) → save to /shortlists → send invite
            → talent accepts → WhatsApp/email unlocked on the profile and in /invites
Admin:      /admin → moderation, featured, AI summary, recruiter plans, leads, audit log
```

Google sign-ups without a role land on `/welcome` to pick talent or recruiter.

## Plans (from /pricing)

| Feature              | Starter (free) | Growth / Enterprise |
| -------------------- | -------------- | ------------------- |
| Text searches        | 5 / month      | Unlimited           |
| Shortlists           | 1              | Unlimited           |
| Fit score            | —              | ✓                   |
| Work-sample preview  | 3 items        | All                 |
| Export (CSV)         | —              | ✓                   |

New recruiters get a 14-day Growth trial. There is no payment gateway yet: "upgrade" creates an `upgrade-request`
lead and an admin activates the plan from the **Recruiter** tab in `/admin`.

## Admin

Admins are listed in `portora_admins`:

```sql
insert into portora_admins (user_id) select id from auth.users where email = 'admin@example.com';
```

## Email notifications (optional)

With `RESEND_API_KEY` and `EMAIL_FROM` set, the app emails talents about new invites and review results, and
recruiters when an invite is accepted. Without them, notifications are skipped. Auth emails (confirmation, reset
password) are sent by Supabase Auth, not by the app.

## AI summary (optional)

Set `ANTHROPIC_API_KEY` in `.env.local`. A Claude-generated summary is created when an admin approves a profile
(or via "Buat ringkasan AI" in the Talent tab) and is shown to recruiters. Without a key the feature is off and
everything else keeps working.

## Storage buckets

Created by `0003_portora_core.sql`; files live under a `<user id>/` folder:

| Bucket              | Visibility | Used for                    |
| ------------------- | ---------- | --------------------------- |
| `portora-avatars`   | Public     | Talent profile photos (2 MB) |
| `portora-portfolio` | Public     | Work-sample images (5 MB)   |

## Project structure

```
src/
├── middleware.ts                  # Auth + role guard (must live in src/, next to app/)
├── app/
│   ├── page.tsx                   # Landing
│   ├── login/, register/, welcome/ # Auth + role picker
│   ├── auth/callback, auth/logout
│   ├── (marketing)/               # for-recruiters, for-talent, pricing, blog
│   ├── (app)/
│   │   ├── discover/              # Recruiter search + filters + fit score
│   │   ├── talent/[username]/     # Public talent profile
│   │   ├── shortlists/, invites/, company/   # Recruiter
│   │   ├── onboarding/, dashboard/            # Talent
│   │   └── admin/                 # Moderation, plans, leads, log
│   └── actions/                   # Server actions: talent, recruiter, admin, account
├── components/portora/            # Avatar, work tile, fit score, profile form, invite dialog
└── lib/
    ├── portora/                   # constants, plan, fit-score, validation, session, upload, ai-summary
    └── supabase/                  # client.ts, server.ts, types.ts
supabase/migrations/0003_portora_core.sql   # All portora_* tables + RLS + triggers + storage
```

## Database schema

`supabase/migrations/0003_portora_core.sql` (idempotent):

- `portora_talent_profiles`: profile + moderation status (`pending`/`approved`/`rejected`), featured, AI summary
- `portora_talent_contacts`: WhatsApp/email, readable only by the owner, admins, and recruiters whose invite was accepted
- `portora_portfolio_items`: work samples (image/video/link)
- `portora_recruiter_profiles`: company profile + plan/trial + search quota
- `portora_shortlists`: named shortlists per recruiter
- `portora_invites`: recruiter → talent invites (`sent`/`accepted`/`declined`)
- `portora_admins`, `portora_moderation_logs`
- `portora_leads`, `portora_recruiter_leads`, `blog_posts` (earlier migrations)

Triggers protect moderation columns, plans, and invite answers from direct client writes.

## Routing

| URL                                                | Access                                         |
| -------------------------------------------------- | ---------------------------------------------- |
| `/`, `/for-*`, `/pricing`, `/blog`                 | Public                                         |
| `/login`, `/register`                              | Public (signed-in users go to their home page) |
| `/welcome`                                         | Signed in, no role yet                         |
| `/talent/[username]`                               | Public for approved profiles; owner & admin can preview |
| `/privacy`, `/terms`                               | Public                                         |
| `/forgot-password`                                 | Public                                         |
| `/reset-password`, `/account`                      | Signed in                                      |
| `/discover`, `/shortlists`, `/invites`, `/company` | Recruiter                                      |
| `/onboarding`, `/dashboard`, `/dashboard/profile`  | Talent                                         |
| `/admin`                                           | Admin (`portora_admins`)                       |

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

## Common tasks

```bash
# Dev
npm run dev                    # Next.js dev server with Turbopack
npm run typecheck              # Validate TypeScript

# Database
npm run db:types               # Generate DB types into database.types.ts (app code uses hand-written types.ts)
npm run db:reset               # Reset local DB + reapply migrations
npm run db:push                # Push migrations — dedicated Supabase project only, never the shared TalentRank one

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
