# Authentication data, sessions, audit fields

**Phase:** 1a — Foundation (cross-cutting; no single screen)
**Source files:**
- Schema: [prisma/schema.prisma](../../../prisma/schema.prisma) (`User`, `Session`, `PasswordResetToken`, `EmailChangeRequest`, `TwoFactorCode`)
- Helpers: [src/lib/auth.ts](../../../src/lib/auth.ts)

## Purpose

Define how authentication data is stored, how sessions behave, and what login-related audit fields are kept. Cross-cutting requirements for Phase 1a.

## Source user stories

- **US16** — Authentication data storage and audit fields.
- **US17** — Session length.

## Acceptance criteria

### Storage (US16)
- Email addresses **may** be stored in plain text in the user table (the `User.email` column).
- A separate "authentication" representation: emails are also hashed (`User.emailHash` — unique index used for lookup) so direct lookup never queries plaintext.
- Passwords are stored only as bcrypt hashes (`passwordHash`).
- Authentication data is encrypted in transit (TLS).
- Credential comparison uses secure, hashed methods (bcrypt verify).
- The user table includes `lastSuccessfulLoginAt`.
- `lastSuccessfulLoginAt` updates **only** after successful completion of 2FA (or after password-only auth when 2FA is intentionally skipped in dev).
- **No audit logs** beyond `lastSuccessfulLoginAt`.

### Session length (US17)
- If **Keep me logged in** is selected: a persistent, non-expiring cookie is created.
  - Member remains logged in indefinitely until explicit logout.
- If **Keep me logged in** is **not** selected:
  - Session expires when the browser is closed **or** after 24 hours, whichever occurs first.
- If the member changes their password: **all active sessions are invalidated** and the user must log in again.
- If the member changes their email address: all active sessions are invalidated upon EC approval and the user must log in again with the new email.
- The system does **not** display session timers, warnings, or countdowns.

## Routes / surfaces

This is data-layer + cookie behaviour, not a screen. It is consumed by:

- `POST /api/auth/login` — issues `Session`, sets the cookie.
- `POST /api/auth/2fa` — promotes pre-2FA session; updates `lastSuccessfulLoginAt`.
- `POST /api/auth/logout` — destroys the session row and clears the cookie.

## Implementation notes

- Cookie options are produced by `getSessionCookieOptions(longLived)` ([src/lib/auth.ts](../../../src/lib/auth.ts)):
  - `longLived = true` → `Max-Age` set to a large value (effectively non-expiring).
  - `longLived = false` → no `Max-Age`/`Expires` (session cookie); the API also enforces a 24h server-side expiry on the `Session` row.
- Password change handler must `DELETE FROM "Session" WHERE "userId" = ?` before logging the user out, satisfying the "all sessions invalidated" criterion.
- Email-change approval handler does the same.

## Open questions / placeholders

- None for this story. Implementation is fully specified by US16 + US17.
