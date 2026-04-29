# Login

**Phase:** 1a — Foundation
**Route:** `/login`
**Source files:**
- UI: [src/app/login/page.tsx](../../../src/app/login/page.tsx)
- API: [src/app/api/auth/login/route.ts](../../../src/app/api/auth/login/route.ts)

## Purpose

Authenticate members and Executive Committee users with email + password. Route to 2FA on success when 2FA is configured (`RESEND_API_KEY` present), otherwise to the role-appropriate dashboard.

## Source user stories

- **US10** — Accessing the login page.
- **US11** — Login validation and privacy-safe errors.
- **US12** — Stay-logged-in option.

## Acceptance criteria

### Page composition (US10)
- Reachable via direct URL and via the visible link on the welcome page.
- Displays:
  - Email field
  - Password field
  - **Keep me logged in** checkbox
- Layout uses standard form controls only.
- No SSO, no social login, no third-party identity providers.

### Validation and errors (US11)
- Email field accepts email format only; max length **50 characters**.
- Email format validation occurs **only after** the field loses focus (blur).
- If email format is invalid, show a clear and specific validation error.
- If username/password is incorrect, show a **single generic error message** ("Email or password is incorrect").
- Error message must NOT reveal whether the email exists in the system (no enumeration).
- On login failure, the page reloads and **preserves the entered email** in the field.
- No diagnostic or debug messaging is exposed.

### Stay-logged-in (US12)
- Checkbox: when selected, session persists across browser restarts via a non-expiring cookie.
- Session duration and behaviour are fixed; not configurable by SBMI.
- No device management, session listing, or remote session invalidation.

### Success redirect
- Successful password verification + 2FA (when applicable):
  - Member → `/dashboard`
  - Executive Committee → `/admin`

### Footnote (per design)
- "2-step verification protects your account. We'll email a code on new devices."

## Routes / surfaces

- `GET /login` — page.
- `POST /api/auth/login` — body: `{ email, password, stayLoggedIn }`. Response: `{ ok, role, redirect }` or `{ error }` with HTTP 401 on invalid credentials.

## Implementation notes

- The login API uses a raw query (`prisma.$queryRaw`) for compatibility with Supabase's transaction-mode pooler.
- `EMAIL_MAX_LENGTH = 50` is enforced server-side at [src/app/api/auth/login/route.ts:15](../../../src/app/api/auth/login/route.ts#L15).
- 2FA is skipped when `RESEND_API_KEY` is absent (dev/demo path), so the flow lands on the dashboard directly.
- Demo login buttons on the page POST the same endpoint with seeded credentials (`demo@sbmi.ca` / `demo123`, `admin@sbmi.ca` / `admin123`). These are dev-mode affordances, not part of the SOW.

## Open questions / placeholders

- None for this screen. Behaviour is fully specified.
