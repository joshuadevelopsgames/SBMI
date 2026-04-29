# Two-Factor Authentication

**Phase:** 1a — Foundation
**Route:** `/login/2fa`
**Source files:**
- UI: [src/app/login/2fa/page.tsx](../../../src/app/login/2fa/page.tsx)
- API: [src/app/api/auth/2fa/route.ts](../../../src/app/api/auth/2fa/route.ts), [src/app/api/auth/2fa/resend/route.ts](../../../src/app/api/auth/2fa/resend/route.ts)

## Purpose

Require a second factor (email-delivered 6-character code) after successful password validation, before granting access to the secure back-end. Required for both members and Executive Committee users.

## Source user stories

- **US15** — Two-factor authentication code entry.

## Acceptance criteria

- After successful username/password validation, the user is routed to the 2FA page.
- The page states a verification code has been sent by email.
- A **Resend 2FA code** link is provided, with a note that delivery may take up to two minutes and to check spam.
- A **single input field** is displayed for the authentication code.
- The input does not accept more than **6 characters** for submission.
- The input uses large, spacious typography suitable for copy/paste.
- When text is pasted, **non-accepted characters are stripped automatically**.
- If more than 6 valid characters are pasted, only the **first 6** are retained.
- Entering an incorrect code displays an error and reloads the page.
- Entering the correct code grants role-appropriate access (member → `/dashboard`, EC → `/admin`).
- May link to additional SBMI-provided resources (links only).
- **Excluded:** SMS codes, authenticator apps, backup codes, recovery codes.

## Numeric vs alphanumeric

The current code generator produces alphanumeric codes; Mollalign (Apr 14) prefers numeric only. **`[ CONFIRM ]`** before Phase 1a sign-off (SOW Section 11). If the choice is numeric, the input gets `inputmode="numeric"` and the regex strips letters on paste.

## Routes / surfaces

- `GET /login/2fa` — code entry page (requires a `pre-2FA` session cookie).
- `POST /api/auth/2fa` — body: `{ code }`. Promotes pre-2FA session to a full session and updates `lastSuccessfulLoginAt`.
- `POST /api/auth/2fa/resend` — issues a new code; old code is invalidated.

## Implementation notes

- The pre-2FA session is marked `isPre2FA = true` on the `Session` row; promotion clears that flag.
- `updateLastSuccessfulLogin(userId)` is called only **after** 2FA succeeds (or directly after password if 2FA is bypassed in dev).
- The OTP UI uses 6 visual cells over a single hidden input, satisfying the "single input field" criterion while preserving paste behaviour.

## Open questions / placeholders

- `[ CONFIRM ]` numeric vs alphanumeric (SOW Section 11). Default in code is alphanumeric; flip to digits-only if Mollalign confirms.
