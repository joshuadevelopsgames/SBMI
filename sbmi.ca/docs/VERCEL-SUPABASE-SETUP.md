# Vercel + Supabase setup

Deploy the SBMI app on Vercel with Postgres on Supabase.

**Current setup (via CLI):**
- **Supabase:** Project `sbmi-ca` (ref `wuahhpkrzkcydxezczgz`), region Canada (Central). Linked with `supabase link --project-ref wuahhpkrzkcydxezczgz`.
- **Vercel:** Project `sbmi.ca` linked with `vercel link`. Production: https://sbmica.vercel.app. Env: `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` added; **you must add `DATABASE_URL`** (see below).

## 1. Supabase project (already created)

1. Project created via CLI: `supabase projects create sbmi-ca --org-id ... --region ca-central-1`.
2. In **Project Settings → Database** ([dashboard](https://supabase.com/dashboard/project/wuahhpkrzkcydxezczgz/settings/database)):
   - Copy the **Connection string** and choose **URI**.
   - For serverless (Vercel), use the **Connection pooling** string (Transaction mode, port **6543**) to avoid exhausting connections:
     - **Connection pooling → Transaction → URI**.
   - Add `?pgbouncer=true&sslmode=require` if not already present.
   - Example format:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
     ```
   - Replace `[YOUR-PASSWORD]` with the database password (or create a dedicated DB user and use that).

## 2. Run migrations and seed (one-time)

The project was created with a random DB password. Reset it in [Database settings](https://supabase.com/dashboard/project/wuahhpkrzkcydxezczgz/settings/database), then from this repo:

```bash
export SUPABASE_DB_PASSWORD='your-new-password'
./scripts/setup-supabase-db.sh
```

The script builds the pooler `DATABASE_URL`, runs `prisma migrate deploy` and `db:seed`, and prints the URL. Then add it to Vercel:

```bash
vercel env add DATABASE_URL production
# Paste the DATABASE_URL the script printed.
```

Alternatively, set `DATABASE_URL` in `.env` to the pooler URI and run `npx prisma migrate deploy && npm run db:seed` yourself.

## 3. Vercel project (already linked)

1. Linked via CLI: `vercel link` (project `sbmi.ca`).
2. **Root Directory**: if the repo root is the monorepo parent, set root to `sbmi.ca` in Vercel Project Settings.
3. **Environment variables**: `SESSION_SECRET` and `NEXT_PUBLIC_APP_URL` are set. Add **`DATABASE_URL`** (see step 2). Optional: `MONTHLY_CONTRIBUTION_CENTS`, `PENALTY_AMOUNT_CENTS`, `RESEND_API_KEY`, `EMAIL_FROM`, `DEMO_MODE`.

4. Deploy: `vercel --prod` (or push to Git if connected). First deploy already done; add `DATABASE_URL` and redeploy for DB access.

## 4. Custom domain (optional)

In Vercel: Project → Settings → Domains. Add your domain and set DNS as instructed. Then set `NEXT_PUBLIC_APP_URL` to that URL.

## 5. Future migrations

After adding or changing Prisma migrations:

1. Locally: `DATABASE_URL` pointing at Supabase pooler, run `npx prisma migrate deploy`.
2. Redeploy on Vercel (or let Git push trigger a new deploy). No need to run migrations in Vercel; the app uses the same Supabase DB.

## Troubleshooting

- **"DATABASE_URL is required"** → Ensure the variable is set in Vercel (Production and/or Preview) and redeploy.
- **Too many connections** → Use the **pooler** URI (port 6543, Transaction mode) and `?pgbouncer=true`, not the direct DB URL.
- **SSL errors** → Add `sslmode=require` to `DATABASE_URL`.
- **500 on demo-login or Prisma errors** → If using Transaction mode (port 6543), try **Session mode** instead: use port **5432** on the pooler (same host), e.g. `...pooler.supabase.com:5432/postgres?sslmode=require`. Session mode supports prepared statements; the app uses raw SQL for demo-login to work with transaction mode.
