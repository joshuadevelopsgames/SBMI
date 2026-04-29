# Consistency and Completeness Audit

**Source:** SOW User Stories and Acceptance Criteria (3).docx. This audit summarizes contradictions, ambiguities, assumptions, missing requirements, missing failure modes, and areas requiring decisions. Detail is in **99-Spec-Gap-Report.md**.

---

## 1. Contradictions

- **Password reset expiration (US10):** SOW states “no expiration” for magic link; conflicts with typical security practice. **Decision:** Confirm or change request.
- **Payment recording (US36):** Successful: amount, timestamp, receipt URL stored. Failed/cancelled/declined **are** recorded (for reporting and support of possible penalties). Resolved in SOW (3).
- **2FA (US11):** 2FA for both members and administrators; access to secure dashboard back-end. Resolved in SOW (3).
- **US11 wording:** “grants access to the secure **administrator** back-end” in one line vs “secure dashboard back-end” and “both members and administrators” in intro — treat as dashboard back-end for both roles.

---

## 2. Ambiguous Statements

- **Welcome:** “Designated destination” (form data); “designated login destination.” (Application form now always present in SOW (3).)
- **Member Dashboard US18:** “View reports (for non-administrators, this is limited to Payment History)” — clarifies scope; “Request assistance” and “Change Profile” now have full sections (US51, US46–US50).
- **Family US30:** Bylaw reference to “marital status”; no marital status field in AC.
- **Bylaws US31:** “Management tools in the administrator” for PDF replacement; no Admin section in SOW.
- **Payments:** Where monthly contribution and penalty are configured; “automatically resume” (US42) — “brand new recurring payment agreement with Stripe”; which “SBMI administrative spreadsheet” for history layout.
- **Request Assistance US51:** “All users designated as administrators” — how designated (role, list, config) not defined.

---

## 3. Implicit Assumptions

- Roles (member vs admin) exist and are assigned outside the system; no role management UI.
- 2FA required for all authenticated users (members and administrators). (US11.)
- ReCAPTCHA only on forgot-password.
- Single Stripe account (SBMI).
- “Mountain Standard Time” = fixed offset; DST handling not specified.
- Profile menu (US21): “profile icon” — exact icon/placement per design.

---

## 4. Missing System Requirements

- **Admin area:** Referenced (management tools, spreadsheet) but no Admin project section — no list of admin screens or flows.
- **Application handling:** Where welcome form data goes and who views/approves applications.
- **Failure handling:** No defined behavior for Stripe down, email failure, missing PDF, save failures, webhook/save mismatch.
- **Email change approval link expiry:** Not specified in US48/US49.

---

## 5. Missing Failure Modes

- Stripe unavailable: only “no responsibility” and “no retry” specified; no user-facing message standard.
- Magic link / 2FA email not received: 2FA has resend; forgot has no resend; no “contact support” or timeout.
- Bylaws PDF 404/missing: not specified.
- Family save failure: not specified.
- Payment success in Stripe but system save fails: no reconciliation or idempotency specified.
- Profile/email change approval token expired or invalid: not specified.

---

## 6. Implementation Blockers Without Decisions

1. Application form designated destination.
2. Login / forgot destination URLs.
3. Admin: scope and screens (members, applications, bylaws file, config).
4. Recurring “resume” (US42): implement as new Stripe agreement; exact flow.
5. Contribution and penalty config source.
6. Magic link expiration (yes/no).
7. “Designated as administrators” for Request Assistance notifications (who receives, channel).
8. Email change approval link expiration.

---

**Full detail and SOW references:** see **99-Spec-Gap-Report.md**.
