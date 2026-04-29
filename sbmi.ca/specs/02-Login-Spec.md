# Spec: Login (Login Page, Forgot Password, Reset Password, 2FA, Session, Auth Storage)

**SOW:** SOW (3) — Login, US6–US13. This spec is the rule set for login-related pages and auth behavior; no behavior beyond cited AC. US11: 2FA for both members and administrators; access to secure dashboard back-end.

---

## 1. Product Summary (from SOW)

- **User roles:** User (member or administrator).
- **Screens:** Login page; Forgot password (request) page; Password reset (magic link) page; 2FA code entry page.
- **Flows:** Login → (success) → 2FA → dashboard (member vs admin). Forgot → email + ReCAPTCHA → magic link. Magic link → new password (min 8 chars). Session: “stay logged in” = non-expiring cookie; else session until browser close or 24h; password/email change invalidates all sessions.
- **Exclusions:** SSO, social login, third-party identity, user enumeration, device/session management UI, resend throttling UI, magic link expiration (docx: “no expiration”), password strength beyond 8-char min, admin reset, SMS/authenticator/backup codes, audit beyond last successful login, session timers/countdowns.

---

## 2. Functional Specification

### 2.1 UI States — Login Page

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Default | Page load | Email field, password field, “stay logged in” checkbox; fixed layout, standard controls | US6 |
| Email invalid (on blur) | Format invalid | Clear, specific validation error | US7 |
| Submit fail | Wrong username or password | Generic error; page reload; preserve entered email; do not reveal if email exists | US7 |
| Submit success | Credentials valid | Redirect to 2FA page | US11 |

### 2.2 UI States — Forgot Password Page

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Default | Page load | Single email field, ReCAPTCHA; submit sends magic link | US9 |
| Email invalid (on blur) | Format invalid | Validation error | US9 |
| After submit | Any | Same confirmation message whether email exists or not; message: delivery may take time, check spam | US9 |
| No resend/countdown | — | No resend button, countdown, or throttling UI; reload allows re-entry | US9 |

### 2.3 UI States — Password Reset (Magic Link) Page

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Valid token | User follows magic link | Show form to set new password | US10 |
| Success | New password set | [UNSPECIFIED – REQUIRES PRODUCT DECISION: redirect target] | — |
| Single-use | After use | Magic link invalidated | US10 |

### 2.4 UI States — 2FA Page

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Default | Arrival from login | Message: verification code sent by email; paragraph: email may take up to two minutes, check spam before Resend; link to resend 2FA code; single code input (6 alphanumeric) | US11 |
| Paste | User pastes | Strip non-alphanumeric; keep first 6 chars | US11 |
| Wrong code | Submit incorrect code | Error message; reload page | US11 |
| Correct code | Submit correct code | Grant access to secure dashboard back-end (member or admin per role) | US11 |

### 2.5 Validation Rules

- **Login:** Email only; max 50 chars; email format validated on blur only. (US7.)
- **Forgot password:** Email only; max 50 chars; format on blur. ReCAPTCHA must be passed to send. (US9.)
- **Reset password:** Minimum 8 characters; no other strength rules unless defined elsewhere. (US10.)
- **2FA:** Exactly 6 alphanumeric; letters and numbers only; max 6 chars for submission; large, spacious typography; paste strips non-alphanumeric, first 6 retained. (US11.)

### 2.6 Error States

- Login: generic message on wrong credentials; specific message on invalid email format (on blur). (US7.)
- Forgot: same confirmation regardless of email existence; no user enumeration. (US9.)
- 2FA: error on wrong code; page reload. (US11.)
- No diagnostic/debug messaging to user. (US7.)

### 2.7 Session (US13)

- “Stay logged in” checked: persistent, non-expiring cookie; logged in until explicit logout.
- “Stay logged in” unchecked: session expires on browser close or after 24 hours, whichever first.
- Password change: all sessions invalidated; must log in again.
- Email change: all sessions invalidated upon approval of change; must log in with new email.
- No session timers, warnings, countdowns; no session management UI beyond login/logout.

### 2.8 Explicit Inclusions

- Login: direct URL + link from welcome; email, password, stay logged in; fixed layout, standard controls. (US1.)
- Privacy-safe errors; preserve email on fail. (US2.)
- Forgot: link on login page; one email field + ReCAPTCHA; magic link email; messaging re delivery/spam; same message whether email exists. (US4.)
- Reset: single-use magic link; no expiration (docx); 8-char minimum. (US10.)
- 2FA: after credential success; code by email; resend link; 6 alphanumeric input; paste handling; wrong → error + reload; correct → secure dashboard back-end. (US11.)
- Auth storage: email may be plain in user table; separate auth table with email/password encrypted at rest; encrypted in transit; secure comparison; last successful login date in user table, updated only after 2FA complete. (US12.)
- Session rules as above. (US13.)

### 2.9 Explicit Exclusions

- SSO, social login, third-party identity. (US6.)
- User enumeration, diagnostic/debug. (US7.)
- Device management, session listing, remote invalidation. (US8.)
- Resend button/countdown/throttling on forgot. (US9.)
- Admin password reset/override. (US10.)
- SMS, authenticator app, backup/recovery codes. (US11.)
- Audit beyond last successful login; reporting/analytics on login history. (US12.)
- Session timers, countdowns, session management controls. (US13.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **User table:** Includes last successful login date (updated only after 2FA success). Email may be stored in plain text. (US7 — docx: “Email addresses may be stored in plain text in a user table.”)
- **Authentication table (separate):** Username (email) and password; encrypted at rest. (US7 docx.)
- **Password reset token:** Single-use magic key; no expiration per docx. (US5.)
- **2FA code:** One-time, 6 alphanumeric; sent by email; resend creates new code.

### 3.2 Required Tables

- User (with last successful login date, role for member vs admin).
- Authentication (credentials, encrypted at rest).
- Password reset tokens (magic key, single-use).
- [UNSPECIFIED – REQUIRES PRODUCT DECISION: 2FA code storage and expiry for “resend”]

### 3.3 API Endpoints

- POST login (email, password, stayLoggedIn) → session + redirect to 2FA or error.
- POST forgot-password (email, ReCAPTCHA token) → same response regardless of email.
- GET/POST reset-password (token) → set new password.
- POST 2fa (code) → validate; update last login; redirect to dashboard or error.
- POST 2fa/resend → send new code by email. (US6: “link to resend a new 2FA code.”)
- POST logout.

### 3.4 Background Jobs

- Sending magic link email (forgot password).
- Sending 2FA code email (on redirect to 2FA and on resend).
- Sending “email change approved” or similar if email change exists. [UNSPECIFIED – REQUIRES PRODUCT DECISION: email change approval flow not detailed in SOW]

### 3.5 External Integrations

- ReCAPTCHA on forgot-password page. (US4 docx.)
- Email delivery for magic link and 2FA codes.

### 3.6 Security Boundaries

- Credentials encrypted at rest (auth table); encrypted in transit.
- Credential comparison secure (e.g. constant-time, hashed).
- No user enumeration on login or forgot.
- Session: persistent cookie vs session cookie; invalidation on password/email change.
- Role (member vs admin) determines post-2FA redirect.

---

## 4. SOW Citation Index (SOW 3)

- US6: Accessing login page — URL, link from welcome, email/password/stay logged in, fixed layout, no SSO.
- US7: Validation and privacy-safe errors — email only, max 50, validate on blur, generic fail message, preserve email, no enumeration.
- US8: Stay logged in — checkbox, non-expiring cookie when selected, no device/session management.
- US9: Forgot password — link, page, email + ReCAPTCHA, magic link email, messaging, no resend UI, same confirmation.
- US10: Password reset security — single-use magic link, no expiration (docx), 8-char min, no admin reset.
- US11: 2FA (members and administrators) — after success to 2FA page, code by email, resend link, 2-min/spam text, 6 alphanumeric, paste handling, wrong→reload, correct→secure dashboard back-end, no SMS/authenticator/backup.
- US12: Auth storage — plain email in user table; auth table encrypted; transit encrypted; last login after 2FA; no other audit.
- US13: Session length — persistent vs 24h/browser close; invalidation on password/email change; no timers/countdowns/session UI.
