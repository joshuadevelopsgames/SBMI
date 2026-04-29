# Spec Gap Report

**Source:** SOW User Stories and Acceptance Criteria (3).docx. This report lists contradictions, ambiguities, implicit assumptions, missing requirements, missing failure modes, and areas requiring product decisions. No behavior was invented; gaps are marked per SOW.

**Story numbering:** SOW (3) uses global US1–US51.

---

## 1. Contradictions in the SOW

| SOW location | Issue | Decision required | Risk if undefined |
|--------------|--------|-------------------|--------------------|
| **US10** | “There is no expiration for the password reset link” vs common security practice. | Confirm: magic link never expires, or add expiry in change request? | Security vs usability. |
| **US11** | One AC line says “grants access to the secure **administrator** back-end”; intro says “As a user (both members and administrators)” and “secure dashboard back-end.” | Treat as dashboard back-end for both roles. | — |
| **US36** | **Resolved in SOW (3):** Successful payments store amount, timestamp, receipt URL; failed, cancelled, or declined are **recorded** and associated with member for reporting/support of possible penalties. | — | — |

---

## 2. Ambiguous Statements

| SOW location | Ambiguity | Decision required | Risk if undefined |
|--------------|------------|-------------------|--------------------|
| **US4** | “Stored or delivered to the **designated destination**.” | Define destination: DB, email, webhook, admin queue? | Form handling incomplete. |
| **US5** | “Designated **login destination**.” | Confirm login URL/path. | Link may point nowhere. |
| **US18** | “View reports (for non-administrators, this is limited to Payment History)” — clear. “Request assistance” and “Change Profile” now have US51 and US46–US50. | None for View reports scope. | — |
| **US30** | “age and **marital status** are defined by the bylaws.” | No marital status field in Add/Edit. Add field or document that system does not collect it? | Mismatch with bylaw reference. |
| **US31** | “manual replacement of the file by SBMI using **management tools in the administrator**.” | Admin section not in SOW. Define admin file-replacement flow or exclude. | No way to “update” PDF per SOW. |
| **US42** | “set up like a **brand new recurring payment agreement** with Stripe.” | Exact flow (re-create subscription, etc.). | Recurring may not resume as intended. |
| **US32–US45** | **Monthly contribution** and **penalty amount** “derived from bylaws” / “may change.” | Where configured? (DB, env, admin UI.) | Hardcoded vs configurable. |
| **US44** | “Payment report layout follows the **supplied SBMI administrative spreadsheet**.” | Which spreadsheet, columns/order? | Layout cannot be verified. |
| **US51** | “**all users designated as administrators**” receive notification. | How designated (role, list, config)? Notification channel (email, in-app)? | Cannot implement notification. |
| **US48/US49** | Email change: confirmation email with approval link. | Approval link expiration? New email already in use? | Security and UX. |

---

## 3. Implicit Assumptions

| Area | Assumption | SOW says | Risk |
|------|------------|----------|------|
| **Role assignment** | Users pre-assigned member vs admin; no role management UI. | US14: “Role determination is based on existing user role data”; no role management. | Document explicitly. |
| **2FA** | Required for all (members and administrators). | US11: “As a user (both members and administrators).” | — |
| **ReCAPTCHA** | Forgot-password only. | US9: ReCAPTCHA on password reset request page. | — |
| **Stripe** | Single SBMI Stripe account. | US35: “SBMI Stripe account.” | — |
| **MST** | Fixed offset (e.g. UTC-7). | US33: “Mountain Standard Time.” | Confirm MST vs MDT. |

---

## 4. Missing System Requirements

| Gap | Needed | Risk |
|-----|--------|------|
| **Admin area** | SOW references “management tools,” “administrative spreadsheet,” but no Admin project section. | Admin screens undefined; scope creep or incomplete product. |
| **Application handling** | Welcome form “stored or delivered”; no SOW for admin viewing or approving applications. | Application queue and destination undefined. |
| **Failure modes** | No defined behavior for: Stripe down, email failure, 2FA email not received (besides resend), PDF missing, profile/email approval link invalid. | Inconsistent error handling. |

---

## 5. Missing Failure Modes

| Scenario | SOW coverage | Decision required | Risk |
|----------|--------------|-------------------|------|
| Stripe unavailable | “System assumes no responsibility for Stripe failures.” | User message and retry policy (no retry per US35). | Generic error only. |
| Magic link / 2FA email not delivered | 2FA has resend (US11); forgot has no resend. | Timeout or “contact support”? | Users may never receive link/code. |
| Bylaws PDF missing or 404 | Not specified. | Show error, hide link, or redirect? | Broken link. |
| Family member save failure | Not specified. | Show error, retry, rollback? | Data loss or confusing state. |
| Payment in Stripe but system save fails | Not specified. | Reconciliation? Idempotency? | Duplicate or missing records. |
| Email change approval link expired/invalid | Not specified. | Message and behavior. | Poor UX or security. |

---

## 6. Implementation Impossible Without New Decisions

| Item | Why | Decision needed |
|------|-----|----------------|
| Application form destination | “Designated destination” not defined. | Storage (table + admin list) vs email vs external URL. |
| Login and Forgot URLs | “Designated login destination” not defined. | Base path / domain. |
| Admin: members, applications, bylaws file, config | Referenced but no Admin section. | Full admin scope or “phase 2” and stub. |
| Recurring “resume” (US42) | “Brand new recurring payment agreement” — exact flow. | Stripe subscription create after pay-off. |
| Monthly contribution and penalty config | “Bylaws” only. | Config source (env, DB, admin UI). |
| Password reset link expiration (US10) | No expiration stated. | Confirm or change request. |
| Request Assistance: designated administrators | Who receives notification, and how. | Role, list, or config; email vs in-app. |
| Email change approval link expiry | Not in SOW. | Expiry duration and invalid-link behavior. |

---

## 7. SOW Section / Line Reference Summary (SOW 3)

- **Intro:** Out-of-scope unless in AC: content creation, copywriting, translation, image licensing (beyond SBMI), auth system development, back-end workflow automation, ongoing content management.
- **US1–US5:** Welcome; US4 membership application form always at bottom; designated destination and login destination.
- **US6–US13:** Login, validation, stay logged in, forgot password, reset (no expiration), 2FA (both roles), auth storage, session length; email change invalidation (US13) now has flow in US46–US50.
- **US14–US24:** Member dashboard, welcome, payment status, cultural design, nav (View reports = Payment History for non-admin, Change Profile), bylaw refs, header, profile menu, footer, footer branding, restrictions.
- **US25–US30:** Family management; US30 marital status reference, no field.
- **US31:** Download bylaws; management tools in administrator.
- **US32–US45:** Payments; US36 records failed/cancelled/declined; US42 resume as new recurring agreement; config and spreadsheet layout.
- **US46–US50:** Profile (view/edit name, change password, request/approve email change, no history/audit).
- **US51:** Request assistance (for self / other, family dropdown, Manage Family link, description, notify designated admins; no status/resolution to member).

---

**End of Spec Gap Report.** All spec files (00–08) and this report are traceable to SOW (3); no behavior was added without citation or [UNSPECIFIED] marking.
