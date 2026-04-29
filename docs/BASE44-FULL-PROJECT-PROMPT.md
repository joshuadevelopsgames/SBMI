# Base44 — Full Project Regeneration Prompt (SBMI.ca)

Use this when you want Base44 to **regenerate the entire SBMI.ca project** (public one-pager + member/admin app + API + Prisma) from this repository.

## What to give Base44

### Option A (best): upload the project folder

- Upload **only** the `sbmi.ca/` directory from this repo (it is the Vercel root directory).

#### Create a safe zip (no secrets)

From the **repo root** (so `HEAD:sbmi.ca` exists):

```bash
git archive --format=zip --output sbmi.ca.zip HEAD:sbmi.ca
```

### Option B: paste key specs + prompts (if Base44 can’t ingest the repo)

Provide these files (copy/paste contents or attach them):

- `specs/00-SOW-Master-Spec.md` (scope + exclusions)
- `specs/01-Welcome-Page-Spec.md` (one-pager rules)
- `specs/02-Login-Spec.md`
- `specs/03-Member-Dashboard-Spec.md`
- `specs/04-Family-Management-Spec.md`
- `specs/05-Download-Bylaws-Spec.md`
- `specs/06-Payments-Spec.md`
- `specs/07-Profile-Spec.md`
- `specs/08-Request-Assistance-Spec.md`
- `docs/ONE-PAGER-STYLE-GUIDE.md` (public site palette + component rules)
- `docs/FRAMER-PORTAL-PROMPT.md` (portal palette + layout rules)
- `docs/VERCEL-SUPABASE-SETUP.md` and `docs/LOCAL-SETUP.md` (runtime + env expectations)

## What NOT to give Base44 (secrets)

Do not include:

- `.env`, `.env.*`
- Vercel env exports
- Supabase passwords / connection strings with credentials
- API keys (Resend, Stripe, Framer, etc.)

If you upload the repo, Base44 should treat env vars as “provided at deploy time” (see “Environment variables” below).

## Project stack (must match)

- **Framework**: Next.js App Router (Next `16.1.6`), TypeScript
- **UI**: React `19.2.3`, Tailwind `v4`, `framer-motion`, `lucide-react`
- **DB**: Postgres + Prisma (`@prisma/client` `7.3.x`)
- **Hosting**: Vercel (Root Directory must be `sbmi.ca`)
- **DB hosting**: Supabase Postgres (pooler/pgbouncer in transaction mode supported; code uses raw SQL in a few auth/session paths)

## Specs are the source of truth

- This project is governed by `specs/*` and the SOW rules:
  - **No invented features**
  - **Unspecified = does not exist**
  - Implement **only** acceptance criteria behavior
  - If a spec conflicts with the current repo, **do not guess**; keep repo behavior and surface the conflict as an explicit question/decision.

## App surfaces to regenerate

### Public one-pager

- **Route**: `/`
- **Rules**: single page only, no CMS, application form is always at bottom (see `specs/01-Welcome-Page-Spec.md` and `docs/ONE-PAGER-STYLE-GUIDE.md`)

### Auth + portals (member + admin)

Pages (App Router):

- `/login`
- `/login/2fa`
- `/login/forgot-password`
- `/login/reset-password`
- `/dashboard`
- `/dashboard/family`
- `/dashboard/claims`
- `/dashboard/reports`
- `/dashboard/payments`
- `/dashboard/assistance`
- `/dashboard/profile`
- `/admin`
- `/admin/members`
- `/admin/approvals`
- `/admin/reports`

### API routes (App Router route handlers)

- **Do not invent endpoints.** Only implement what exists in the repo under `src/app/api/**/route.ts` and what the specs explicitly require.
- If Base44 needs a route map, derive it strictly from the uploaded code and/or the specs (no guesses).

## Data model (must match existing shape)

- Prisma schema: `prisma/schema.prisma`
- Keep the existing entities and semantics (roles, users, sessions, members/households, applications, payments, claims, family members, assistance requests).
- Do not break existing migrations; if changes are required, add migrations cleanly.

## Environment variables (provided at deploy/runtime)

Required:

- `DATABASE_URL` (Postgres; Supabase pooler supported)
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

Optional/feature flags:

- `RESEND_API_KEY` (when set, 2FA email is enabled; when unset, dev can skip 2FA)
- `EMAIL_FROM`
- `MONTHLY_CONTRIBUTION_CENTS`
- `PENALTY_AMOUNT_CENTS`
- `DEMO_MODE`

## Prompt to paste into Base44 (full regeneration)

```
You are regenerating an existing product from a repository upload (Root Directory: sbmi.ca).

Hard rules:
- The spec files under `specs/` are the source of truth. Implement only what acceptance criteria require.
- No invented features; anything unspecified in specs does not exist.
- Do not “fill gaps” with assumptions. If a required decision is missing, surface it as a question instead of implementing behavior.
- Do not introduce a CMS.
- Preserve the current stack and structure: Next.js App Router + TypeScript + Prisma + Postgres (Supabase/Vercel deployment).

Your tasks:
1) Recreate the public one-pager at `/` using `docs/ONE-PAGER-STYLE-GUIDE.md` and `specs/01-Welcome-Page-Spec.md`. Single page only; application form always present at bottom; clear validation + success confirmation; login link to `/login`.
2) Recreate the auth flow per `specs/02-Login-Spec.md` (login, forgot password, reset password, 2FA, stay-logged-in behavior).
3) Recreate the member portal per specs 03–08 (dashboard, family, bylaws PDF, payments summary/history, request assistance, profile flows).
4) Recreate the admin portal pages that exist in the repository, but do not invent admin features beyond what specs/AC explicitly cover.
5) Recreate/align the API routes strictly from the code under `src/app/api/**/route.ts` and the specs (no new endpoints).
6) Recreate/align the Prisma schema at `prisma/schema.prisma` and keep DB semantics consistent.

Constraints:
- Env vars are injected at runtime; do not hardcode secrets.
- Vercel deploy uses Root Directory = `sbmi.ca`.
- Supabase pooler/pgbouncer transaction mode may be used; avoid prepared statements where necessary (existing code uses Prisma raw SQL in auth/session paths).

Deliverables:
- A complete, runnable project matching the repo: pages, components, API routes, and Prisma schema/migrations.
- Short “how to run” notes: required env vars + dev commands.
```

