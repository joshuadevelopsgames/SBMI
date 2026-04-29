# Forgot password & reset

**Phase:** 1a — Foundation
**Routes:** `/login/forgot-password`, `/login/reset-password`
**Source files:**
- UI: [src/app/login/forgot-password/page.tsx](../../../src/app/login/forgot-password/page.tsx), [src/app/login/reset-password/page.tsx](../../../src/app/login/reset-password/page.tsx)
- API: [src/app/api/auth/forgot-password/route.ts](../../../src/app/api/auth/forgot-password/route.ts), [src/app/api/auth/reset-password/route.ts](../../../src/app/api/auth/reset-password/route.ts)

## Purpose

Allow a user to request and consume a magic-key link that lets them choose a new password without contacting an administrator.

## Source user stories

- **US13** — Forgot password request.
- **US14** — Password reset security.

## Acceptance criteria

### Request page (US13)
- A **Forgot password** link is visible on the login page.
- The forgot-password page contains:
  - A single **email** input.
  - A **reCAPTCHA** that must be passed before the magic link is sent.
- Email validation runs on blur only.
- Email max length is **50 characters**.
- Submitting the form triggers a transactional email containing the password-reset magic link.
- The page displays messaging that delivery may take time and to check the spam folder.
- **No** resend button, countdown timer, or resend throttling UI is shown.
- The same confirmation message is displayed regardless of whether the email exists in the system (no enumeration).

### Magic link (US14)
- The reset uses a **single-use** magic-key link.
- The reset link **does not expire** (per SOW — explicit choice for community usability).
- Password rules: minimum 8 characters; no other strength requirements unless defined elsewhere.
- No EC password-reset tools or override mechanisms.

### Reset page
- Lands the user on a "Set a new password" form.
- After successful reset, all active sessions for that user are invalidated (per US17) and the user must log in again.

## Routes / surfaces

- `GET /login/forgot-password` — request form.
- `POST /api/auth/forgot-password` — body: `{ email }`. Always returns 200 (no enumeration).
- `GET /login/reset-password?token=…` — reset form (consumes token).
- `POST /api/auth/reset-password` — body: `{ token, newPassword }`.

## Implementation notes

- reCAPTCHA v2 checkbox is wired on `/login/forgot-password`; server verifies via `src/lib/recaptcha.ts`. Production requires `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY` (returns 503 until configured).
- Single-use enforcement uses the `usedAt` field on `PasswordResetToken` (already in schema).
- The "no expiry" choice is intentional per US14; do not add token expiration without a Change Order.

## Open questions / placeholders

- SBMI to provide Google reCAPTCHA **v2 checkbox** site key + secret in deployment env (implemented against v2).
