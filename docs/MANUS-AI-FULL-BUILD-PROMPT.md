# Manus AI — Full Build from Scratch (SBMI.ca)

Use this when asking **Manus AI** to build the entire SBMI.ca project from scratch. Manus should create **its own style guide** (colours, typography, components) while implementing the functional scope from the attached specs.

---

## Files to provide Manus AI

Attach or paste these (in order). Do **not** include `.env`, secrets, or API keys.

| Order | Path | Purpose |
|-------|------|---------|
| 1 | `specs/00-SOW-Master-Spec.md` | Scope, modules, exclusions, single source of truth |
| 2 | `specs/README.md` | Spec index and rules |
| 3 | `specs/01-Welcome-Page-Spec.md` | One-page welcome (US1–US5) |
| 4 | `specs/02-Login-Spec.md` | Login, forgot/reset, 2FA, session (US6–US13) |
| 5 | `specs/03-Member-Dashboard-Spec.md` | Member dashboard, header, footer (US14–US24) |
| 6 | `specs/04-Family-Management-Spec.md` | Family members (US25–US30) |
| 7 | `specs/05-Download-Bylaws-Spec.md` | Bylaws PDF (US31) |
| 8 | `specs/06-Payments-Spec.md` | Payment summary, make payment, history (US32–US45) |
| 9 | `specs/07-Profile-Spec.md` | Profile, password/email change (US46–US50) |
| 10 | `specs/08-Request-Assistance-Spec.md` | Request Assistance (US51) |
| 11 | `specs/97-Consistency-Audit.md` | Contradictions/ambiguities (optional) |
| 12 | `specs/99-Spec-Gap-Report.md` | Gaps requiring product decisions (optional) |
| 13 | `docs/SOW-User-Stories-and-Acceptance-Criteria.md` | Full user stories + AC (reference) |
| 14 | `docs/VERCEL-SUPABASE-SETUP.md` | Deploy + DB expectations |
| 15 | `docs/LOCAL-SETUP.md` | Dev run + env (optional) |

**Optional design reference (do not require Manus to copy):** `docs/ONE-PAGER-STYLE-GUIDE.md`, `docs/FRAMER-PORTAL-PROMPT.md` — only if you want Manus to take inspiration; otherwise omit so Manus invents its own style.

---

## Prompt to paste into Manus AI

Copy the block below. Paste it **after** attaching the files listed above.

```
You are building the SBMI.ca product from scratch. I have attached the full specification set (SOW master spec, numbered feature specs 01–08, and setup docs). Your job is to produce a complete, runnable application and your own style guide.

**Scope rules (non-negotiable)**  
- Implement only what the acceptance criteria in the specs describe. No invented features.  
- If something is unspecified or marked [UNSPECIFIED – REQUIRES PRODUCT DECISION], do not implement it; either omit it or list it as a decision needed.  
- “Explicit exclusions” in each spec are out of scope.  
- Single source of truth: SOW User Stories and Acceptance Criteria; the numbered specs (00–08) are the implementation rule set.

**Style guide (you create it)**  
- Define your own style guide for the project: colour palette, typography, spacing, and component rules.  
- Create two coherent surfaces: (1) the public one-page welcome site, (2) the authenticated member portal (and admin portal if in scope).  
- Ensure WCAG AA contrast and sharp corners (no rounded buttons/cards) unless you document a deliberate exception.  
- Deliver the style guide as a markdown document (e.g. STYLE-GUIDE.md) in the repo so future work stays consistent.

**Product surfaces to build**  
1. **Public one-pager** — Single page at `/`. Content: Iddir explanation, Samuel Bete section, membership benefits list, at least one Ethiopian-themed image, membership application form at bottom (required fields, validation, confirmation), login link. No CMS; no subpages.  
2. **Login flow** — Login page (email, password, stay logged in), Forgot password, Reset password (magic link), 2FA code entry. Session handling and redirect to member or admin dashboard by role.  
3. **Member portal** — After login: dashboard (welcome, membership duration, payment summary, next due, Make Payment, nav); persistent header (nav + profile dropdown: edit profile, logout); footer (nav summary, branding, assistance mailto). Pages: Manage family (list, add/edit/delete, age ≤25 rule, greyed + note when >25); View reports (Payment History only); Bylaws (link opens PDF in new tab); Make payment (one-time vs recurring, Stripe); Request assistance (for self vs other, family dropdown or name+phone, description, submit → notify admins); Profile (edit name, change password, request/approve email change).  
4. **Admin portal** — Only what the specs explicitly describe (e.g. approvals, members, reports). Do not add admin features not in the specs.  
5. **Payments** — Summary states (Overdue / Up to date / Paid ahead); one-time and recurring; Stripe integration; payment history with receipt links; all dates/times in MST.  
6. **Profile** — First/last name edit; change password (flow like reset → logout + message on next login); request email change → approval link in email → update email, logout, confirmation screen.

**Tech stack**  
- Next.js App Router, TypeScript.  
- React 19, Tailwind CSS (v4 if available), a minimal motion/icon library as needed.  
- Postgres database (e.g. Supabase); use an ORM (e.g. Prisma). Schema must support: users, sessions, roles (member/admin), members/households, family members, applications, payments, assistance requests, and any entities the specs require.  
- Hosting assumptions: Vercel (root directory = project folder); DB via connection string (e.g. Supabase). Env vars: DATABASE_URL, SESSION_SECRET, NEXT_PUBLIC_APP_URL; add RESEND_API_KEY, Stripe keys, etc. as required by the specs. Do not hardcode secrets.

**Deliverables**  
1. Full codebase: app routes, API routes, components, Prisma schema (and migrations if applicable).  
2. STYLE-GUIDE.md: your chosen palette, type scale, components, and rules for the public site and portals.  
3. README or SETUP: required env vars, install and run commands, and note that Root Directory for Vercel is the project folder.  
4. No CMS; no content-creation tooling; copy is placeholder or from spec examples. Bylaws = link to PDF (file or URL as configured).
```

---

## After Manus delivers

- Replace placeholders (e.g. `NEXT_PUBLIC_APP_URL`, Stripe/Resend keys) at deploy time.  
- If you later align with the existing ONE-PAGER-STYLE-GUIDE or FRAMER-PORTAL-PROMPT, do it as a separate design pass; the Manus style guide remains the reference for what Manus built.
