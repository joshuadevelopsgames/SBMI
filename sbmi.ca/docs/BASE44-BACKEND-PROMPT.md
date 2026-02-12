# Prompt for base44: Backend in One-Pager Theme

Use this (or paste the section below) when asking base44 to build or extend a backend that matches the SBMI one-pager’s theme and stack.

---

## What to give base44

1. **This repo (or a minimal clone)**  
   So it can see the one-pager implementation and the existing backend shape.

2. **The prompt below**  
   Copy the "Prompt to paste" block into your base44 request.

---

## Prompt to paste

```
We have a public one-pager (single-page marketing site) with a clear visual and UX theme. Build [or extend] the backend so it matches that theme in spirit: same stack, naming, and structure.

**One-pager theme (match this):**
- **Stack:** Next.js App Router, TypeScript, Prisma, server-side auth. No CMS; content is fixed.
- **Colours (for any API docs or minimal admin UI):** Primary green #1B4332, gold #C9A227, cream #FAF8F5, border #E8E4DE. Sharp corners (no rounded buttons/cards).
- **Tone:** Calm, structured, accessible. Clear hierarchy; no clutter.
- **Naming:** Consistent, readable (e.g. `member`, `household`, `application`, `claim`). Prefer kebab-case for routes, camelCase for code.
- **Reference files in this repo:**
  - `docs/ONE-PAGER-STYLE-GUIDE.md` — full palette, typography, layout (use for any generated docs or UI).
  - `src/app/page.tsx` and `src/components/landing/*` — one-pager implementation.
  - `prisma/schema.prisma` — current data model (extend or align; do not break existing migrations).

**Scope for the backend:**
- [Fill in: e.g. "Add an API for X" or "Build the full backend for membership, payments, and assistance requests" or "Only add OpenAPI docs styled like the one-pager".]
- Keep auth/session approach consistent with what’s already here (see `src/lib/auth`, `src/middleware.ts`).
- Responses: JSON; clear error shapes; no unnecessary fields.

Output backend code, Prisma changes (if any), and a short note on how the API/docs follow the one-pager theme.
```

---

## Prompt: Backend design only (no functionality)

Use this when base44 already has the one-pager and style guide. You want **design only**: route map, request/response shapes, data model outline. No implementation.

```
Design the backend for this app — design only, no implementation or functionality.

You have the one-pager and ONE-PAGER-STYLE-GUIDE (stack: Next.js App Router, TypeScript, Prisma; palette green/gold/cream; sharp corners; calm, structured tone).

Produce:

1. **Route map** — List every API route (method + path), one line each, with a single-line purpose (e.g. POST /api/apply — submit membership application).

2. **Request/response shapes** — For each route: body/query params (names and types), response body (success and error). Use concise TypeScript-style types or a short table; no code.

3. **Data model outline** — Main entities and relations only (e.g. Member, Household, Application, Claim, Payment). List fields that matter for the API; no Prisma schema.

4. **Error and auth** — How errors are returned (status codes, JSON shape). How auth works (session cookie, which routes are protected).

Match naming and structure to the one-pager theme: kebab-case routes, camelCase in JSON, clear hierarchy. Do not write handlers, middleware, or database code — only the design.
```

---

## Prompt: Show a preview of the backend

Use this **after** base44 has produced the backend design. You want one document you can open and read (and optionally render as a page).

```
Produce a single backend preview document I can view.

Take the backend design you just gave me (auth, routes, request/response shapes, data model, authorization rules) and output it as one consolidated markdown file that includes:

1. **Title and one-paragraph summary** of what the backend does.
2. **Authentication** — Method, session store, login flow, how current user is available, which routes are public vs protected. Role and member checks (admin, active member, own resources, household).
3. **Route map** — Table or list: Method, Path, Purpose, Auth required (public / member / admin).
4. **Data model** — Main entities and relations (names and key fields). Optionally a Mermaid ER diagram (e.g. Application --> Member --> Household, etc.) so I can preview the structure.
5. **Error and response** — Status codes and JSON error shape; success response conventions.

Format so it renders well in a markdown viewer (e.g. GitHub, VS Code). I want to open this one file and see the full backend design at a glance. No code — design and structure only.
```

---

## Prompt: Make the backend entirely functional

Use this when you have the backend design (and optionally the preview doc) and want **full implementation**: working routes, database, auth, and validation.

```
Implement the backend fully — make it entirely functional. No placeholders or stubs.

You have the backend design (route map, auth rules, data model, request/response shapes, error conventions). Implement all of it:

1. **Database** — Prisma schema that matches the data model. Include migrations (or clear instructions to generate them). Seed data only if the design specifies it; otherwise omit or minimal.

2. **Auth** — Session store (DB table if design says so), login/logout endpoints, middleware that attaches the current user and enforces protected routes. Role check for admin routes; member check (active Member record) for member routes. Public routes: only those listed in the design (e.g. POST /api/applications, GET /api/events/public).

3. **API routes** — Every route from the route map. Real handlers: read/write DB, validate input, return the response shapes from the design. Use kebab-case paths, camelCase in JSON. Enforce authorization: members only access their own or household data; admins per role.

4. **Errors** — Consistent error responses (status codes and JSON shape from the design). Validation errors (e.g. Zod) return 400 with a clear message; 401/403 for auth; 404 when resource missing.

5. **Stack** — Next.js App Router (route handlers in app/api/...), TypeScript, Prisma. No CMS. Match the one-pager theme in naming and structure.

Do not leave TODOs or “implement later.” Deliver working code I can run: migrations apply, server starts, and each designed route behaves as specified. If the design is in a preview doc or earlier message, use that as the single source of truth.
```

---

## Prompt: Backend from our specs, same way you built the one-pager

Use this when you want base44 to implement the **full backend from our spec files**, using the same approach and quality it used for the one-pager.

**If base44 does not have repo access:** Paste or attach the spec content in the same chat. Give it at least: `specs/README.md`, `00-SOW-Master-Spec.md`, and specs `02` through `08` (Login, Member Dashboard, Family, Bylaws, Payments, Profile, Request Assistance). Optionally add `docs/ONE-PAGER-STYLE-GUIDE.md` (or a short note: stack = Next.js App Router, TypeScript, Prisma; routes kebab-case, JSON camelCase; green/gold/cream palette, sharp corners). Then use the prompt below and say the specs are “in the messages above” or “in the attached files.”

```
Build the backend so it is fully functional and driven only by the spec files I’m providing — the same way you built the one-pager from the style guide and requirements.

**Source of truth:** The spec documents I’ve pasted/attached (or listed above). They include:
- Master scope (SOW): modules, roles, flows, exclusions.
- 01 = One-pager (you already did the front-end).
- 02 = Login, forgot password, reset, 2FA, session, auth storage.
- 03 = Member dashboard, header, profile menu, footer.
- 04 = Family members screen and API.
- 05 = Bylaws PDF.
- 06 = Payments: summary, make payment, history, reminders, penalties.
- 07 = Profile edit, password change, email change request/approval.
- 08 = Request assistance flow.
- Specs README: only what’s in acceptance criteria is in scope; gaps are out of scope unless decided.

**How to build it:** The same way you built the one-pager.
- Stack: Next.js App Router, TypeScript, Prisma. Naming: routes kebab-case, JSON camelCase. Tone: calm, structured, no clutter. (If I provided ONE-PAGER-STYLE-GUIDE, use it for palette and structure.)
- Implement only what the specs require. No invented features.
- Match the quality and consistency of the one-pager: clear boundaries, same patterns for auth and errors.

**Deliver:** A fully working backend: Prisma schema and migrations, session/auth per the login spec, every API route and behaviour required by the specs (02–08), validation and error responses consistent with the style. No stubs or TODOs. The backend should support the front-end flows exactly as the specs describe.
```

---

## After you paste

- Replace the **Scope for the backend** bullet with your actual ask (e.g. “Add endpoint for X”, “Generate OpenAPI spec”, “Refactor routes to match naming in ONE-PAGER-STYLE-GUIDE”).
- If base44 can read the repo, you can say: “Use `docs/ONE-PAGER-STYLE-GUIDE.md` and the existing `prisma/schema` and API routes as the reference.”
