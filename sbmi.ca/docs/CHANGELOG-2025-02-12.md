# Changelog — 2025-02-12

---

## Vercel + Supabase deployment

- **Goal:** Deploy the app on Vercel with Postgres on Supabase.
- **Changes:**
  - Added `postinstall`: `prisma generate` in `package.json` so Vercel builds get the Prisma client.
  - Added `docs/VERCEL-SUPABASE-SETUP.md`: Supabase project (pooler URL), migrations/seed, Vercel env vars, custom domain, troubleshooting.
  - Updated `.env.example` with Supabase pooler `DATABASE_URL` example and comment.
- **Files:** `package.json`, `docs/VERCEL-SUPABASE-SETUP.md`, `.env.example`.

---

## Vercel + Supabase via CLI

- **Goal:** Set up Vercel and Supabase through the CLI.
- **Changes:**
  - Created Supabase project `sbmi-ca` (ref `wuahhpkrzkcydxezczgz`), region Canada Central: `supabase projects create sbmi-ca --org-id afaewthbnbinpvlhojag --db-password ... --region ca-central-1`.
  - Ran `supabase init` and `supabase link --project-ref wuahhpkrzkcydxezczgz`.
  - Linked Vercel: `vercel link` (project `sbmi.ca`). Added env: `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`; **`DATABASE_URL` must be added** after resetting DB password in Supabase dashboard.
  - Added `scripts/setup-supabase-db.sh`: builds pooler URL from `SUPABASE_DB_PASSWORD`, runs `prisma migrate deploy` and `db:seed`; user resets password in dashboard then runs script and `vercel env add DATABASE_URL production`.
  - Deployed: `vercel --prod`. Production: https://sbmica.vercel.app (app will error on DB routes until `DATABASE_URL` is set and redeployed).
  - Updated `docs/VERCEL-SUPABASE-SETUP.md` with concrete project ref, CLI steps, and script usage.
- **Files:** `supabase/config.toml`, `scripts/setup-supabase-db.sh`, `docs/VERCEL-SUPABASE-SETUP.md`.

---

## SBMI logo on portal only

- **Goal:** Use sbmi-logo.png on the portal (login, dashboard, admin); not on the main landing page.
- **Changes:**
  - Copied logo to `public/sbmi-logo.png`.
  - Login, 2FA, forgot-password, reset-password: logo above card content (80×80, rounded).
  - Member header (dashboard): logo + “SBMI Portal” in header (36×36).
  - Admin layout: logo + “SBMI Admin” in header (36×36).
- **Files:** `public/sbmi-logo.png`, `src/app/login/page.tsx`, `src/app/login/2fa/page.tsx`, `src/app/login/forgot-password/page.tsx`, `src/app/login/reset-password/page.tsx`, `src/app/dashboard/MemberHeader.tsx`, `src/app/admin/layout.tsx`.

---

## Demo login 500 fix

- **Goal:** Fix demo login returning 500 on Vercel.
- **Cause:** Demo login used raw SQL (`$queryRaw` / `$executeRaw`); with the Prisma pg adapter in serverless this could fail. Session creation also used raw INSERT.
- **Changes:**
  - `api/auth/demo-login`: Use `prisma.user.findFirst` + `prisma.user.update` instead of raw SQL; allow demo when `DEMO_MODE=true` or on Vercel (`VERCEL=1`).
  - `lib/auth.ts` `createSession`: Use `prisma.session.create()` instead of raw INSERT.
  - Set `DEMO_MODE=true` on Vercel production; redeployed.
- **Files:** `src/app/api/auth/demo-login/route.ts`, `src/lib/auth.ts`.

---

## Logo display and login back button

- **Goal:** Fix logo not showing; add back button on login page.
- **Changes:**
  - Replaced logo in `public/sbmi-logo.png` with file from Downloads.
  - All logo `<Image>` components: added `unoptimized` and set size to 96×96 on auth cards (36×36 in headers) so the PNG displays reliably.
  - Login page: added “← Back to home” link (absolute top-left) to `/`.
- **Files:** `public/sbmi-logo.png`, `src/app/login/page.tsx`, `src/app/login/2fa/page.tsx`, `src/app/login/forgot-password/page.tsx`, `src/app/login/reset-password/page.tsx`, `src/app/dashboard/MemberHeader.tsx`, `src/app/admin/layout.tsx`.

---

## Demo login buttons use regular login API

- **Goal:** Stop demo login from failing by using the same path as normal login.
- **Changes:**
  - “Enter as member” and “Enter as admin” now call `/api/auth/login` with fixed credentials (demo@sbmi.ca / demo123, admin@sbmi.ca / admin123) instead of `/api/auth/demo-login`.
  - One code path for both real and demo logins; no DEMO_MODE or separate raw-SQL route needed for the buttons.
  - Removed debug instrumentation from `api/auth/demo-login/route.ts` and `lib/auth.ts`. Left demo-login route in place but unused by the UI.
- **Files:** `src/app/login/page.tsx`, `src/app/api/auth/demo-login/route.ts`, `src/lib/auth.ts`.
