# SBMI Member Portal

Web application for Samuel Bete Mutual Aid Association — membership, contributions, and support (per RFP and Iddir bylaws).

## Stack

- **Next.js 16** (App Router), TypeScript, Tailwind CSS
- **Prisma** (SQLite for dev; switch to MySQL for production per RFP)
- **Auth**: session cookies + bcrypt

## Setup

```bash
npm install
cp .env.example .env   # if present; else set DATABASE_URL="file:./dev.db"
npx prisma migrate dev
npm run db:seed
npm run dev
```

- **Login**: `http://localhost:3000/login` — demo admin `admin@sbmi.ca` / `admin123`
- **Public**: `/` (home), `/login`
- **Member**: `/dashboard`, `/dashboard/profile`, `/dashboard/payments`, `/dashboard/claims`
- **Admin**: `/admin`, `/admin/members`, `/admin/approvals`, `/admin/reports`

## Implemented

- Auth (login, logout, session, role-based redirect)
- Member dashboard (placeholder when no member linked; counts when linked)
- Admin dashboard (member/claim/payment counts)
- Placeholder pages: profile, payments, claims, members, approvals, reports
- Prisma schema: User, Role, Session, Member, Household, Payment, Claim, AuditLog

## Next steps

- Stripe integration for payments
- Approval workflows (membership, claims)
- Configurable rules and reporting
- Member registration and profile CRUD
