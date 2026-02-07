# SBMI Member Portal

Web application for Samuel Bete Mutual Aid Association — membership, contributions, and support (per RFP and Iddir bylaws).

## Stack

- **Next.js 16** (App Router), TypeScript, Tailwind CSS
- **Prisma** + **PostgreSQL** (AWS RDS/Aurora)
- **Auth**: session cookies (HMAC-signed), bcrypt, 2FA for admin, forgot password (magic link)
- **Deploy**: Docker on AWS (App Runner / ECS), health check at `/api/health`

## AWS deployment

The app is built to run on AWS. Database and secrets are supplied by the host (e.g. Secrets Manager, Parameter Store, or deployment environment).

1. **Build and run with Docker**
   ```bash
   docker build -t sbmi-ca .
   ```
   Run the container with env (or inject from Secrets Manager):
   - `DATABASE_URL` — Postgres (RDS/Aurora) connection string; use `?sslmode=require` for AWS.
   - `SESSION_SECRET` — Cookie signing secret (e.g. `openssl rand -hex 32`).
   - `NEXT_PUBLIC_APP_URL` — Public URL of the app (for reset/2FA links).
   - Optional: `RESEND_API_KEY`, `EMAIL_FROM` for 2FA and password-reset emails.

2. **Database**
   - Run migrations in your pipeline or once per environment:
     ```bash
     npx prisma migrate deploy
     ```
   - Seed initial roles and admin (once):
     ```bash
     npm run db:seed
     ```

3. **Health check**  
   Configure your load balancer or App Runner to use `GET /api/health`.

## Optional: local development

If you need to run locally against a database, set `DATABASE_URL` (and optionally `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`) in `.env`, then:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

See `docs/LOCAL-SETUP.md` for local Postgres (e.g. Docker) if you don’t use a shared dev database.

## Routes

- **Public**: `/`, `/login`, `/login/forgot-password`, `/login/reset-password`, `/login/2fa`
- **Member**: `/dashboard`, `/dashboard/profile`, `/dashboard/payments`, `/dashboard/claims`
- **Admin**: `/admin`, `/admin/members`, `/admin/approvals`, `/admin/reports`

## Scope

See `docs/SOW-User-Stories-and-Acceptance-Criteria.md` for in-scope user stories and acceptance criteria.
