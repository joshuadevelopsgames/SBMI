# SOW Master Product Specification

**Source:** SOW User Stories and Acceptance Criteria (3).docx — single source of truth. Legally binding scope.

**Rules:** No invented features, no scope extension, no assumptions. Unspecified = does not exist.

**Story numbering:** SOW (3) uses global numbering US1–US51.

---

## 1. One-Page Welcome Website (US1–US5)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | Public visitor, prospective member, existing member | US1, US2, US4, US5 |
| **Screens** | Single public page (no subpages) | US1 AC |
| **User flows** | View content → submit application → (optional) go to login | US1, US4, US5 |
| **System states** | Public (unauthenticated); no CMS | US1 AC |
| **Inputs** | Application form (required fields); no other inputs | US4 AC |
| **Outputs** | Rendered content; form → confirmation or validation errors; login link → login destination | US4, US5 |

**Change from prior SOW:** US4 "Membership application" — form is always present at bottom of page (no "if included in scope").

**Explicit exclusions:** CMS, inline editing, post-launch content tooling, copywriting, historical research, content creation beyond formatting, content revisions beyond one review cycle, benefit comparison/personalization/dynamic content, editing/reordering benefits without change request.

---

## 2. Login (US6–US13)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | User (member or administrator) | US6 |
| **Screens** | Login page; Forgot password (request) page; Password reset (magic link) page; 2FA code entry page | US6, US9, US10, US11 |
| **User flows** | Direct URL or welcome link → login → email + password → 2FA page → code → dashboard (member or admin); Forgot → email + ReCAPTCHA → magic link; Magic link → new password | US6, US9, US10, US11 |
| **System states** | Unauthenticated; credential-validated (pre-2FA); 2FA pending; authenticated (member vs admin) | US11, US14 |
| **Inputs** | Email (max 50), password, stay logged in checkbox; 2FA: 6 alphanumeric; Forgot: email + ReCAPTCHA; Reset: new password (min 8 chars) | US7, US8, US9, US10, US11 |
| **Outputs** | Generic login error; validation (email on blur); 2FA resend; same confirmation for forgot; session cookie (persistent or session). 2FA protects secure dashboard back-end (US11: both members and administrators). | US7, US9, US11, US13 |

**Explicit exclusions:** SSO, social login, third-party identity; user enumeration; device/session management; resend throttling UI; magic link expiration (no expiration per US10); password strength beyond 8-char min; admin password reset; SMS/authenticator/backup codes; audit beyond last successful login; session timers/countdowns.

---

## 3. Member Dashboard (non-Admin) (US14–US19, US20–US24)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | Member (non-admin) | US14 |
| **Screens** | Member dashboard; persistent header (all member pages); profile dropdown (profile + logout); footer (nav summary, branding, support contact) | US14–US18, US20–US23 |
| **User flows** | Post-auth → member dashboard; nav: Manage family, View reports (limited to Payment History), Bylaws PDF, Make payment, Request assistance, Change Profile; header with profile icon → dropdown (edit profile, logout); footer mirrors header nav | US18, US20, US21, US22, US23 |
| **System states** | Member authenticated; dashboard shows one of payment states | US16, Payments US32 |
| **Inputs** | Navigation only on main dashboard | — |
| **Outputs** | Welcome + first name; membership duration (from start date); next payment due date/amount; Make Payment; nav links; header; footer with SBMI logo and mailto for assistance | US15, US16, US20–US23 |

**New in SOW (3):** US20 Global Header Navigation; US21 Profile Menu in Header (profile icon, dropdown: edit profile, logout); US22 Global Footer Content (nav summary, mirrors header); US23 Footer Branding and Support Contact (SBMI logo, mailto for assistance). US18: "View reports" for non-administrators limited to Payment History; adds "Change Profile information".

**Explicit exclusions:** Admin features; role management; eligibility decisions; theme/customization; admin workflows; other members’ data; governance (US24).

---

## 4. Family Management (US25–US30)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | Member | US25 |
| **Screens** | Family Members screen (list + Add/Edit/Delete) | US25 |
| **User flows** | View list → Add (name, DOB; age ≤25) / Edit (DOB) / Delete (with confirm) | US25–US29 |
| **System states** | Family list; per-member eligible (≤25) or greyed-out (>25); no auto-removal | US26, US27 |
| **Inputs** | Full name, birth date (required, valid date); edit birth date | US26, US28 |
| **Outputs** | List with current age; greyed-out + italic note when >25; bylaw reference | US27, US30 |

**Explicit exclusions:** Benefit approval/entitlement; age overrides; historical/audit/approval; archival/recovery; enforcement (US25–US30).

---

## 5. Download Bylaws (US31)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | Member | US31 |
| **Screens** | Link opens PDF in new tab | US31 AC |
| **User flows** | Click bylaws link → open current bylaws PDF in new tab | US31 |
| **System states** | Read-only PDF; manual replacement via admin | US31 |
| **Inputs** | None | — |
| **Outputs** | PDF in new tab | US31 |

**Explicit exclusions:** Modify/annotate/version; track downloads/views/acknowledgements.

---

## 6. Payments (US32–US45)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | Member, SBMI | US32, US33 |
| **Screens** | Payment Information Summary; Make Payment (One-Time | Recurring); Payment History (paginated, receipt links) | US32, US34, US35, US38, US44 |
| **User flows** | View summary → Make Payment → radio One-Time or Recurring → Stripe; View Payment History | US34, US35, US38, US44 |
| **System states** | Overdue / Up to date / Paid ahead; MST; recurring active or not | US32, US33, US38, US40–US42 |
| **Inputs** | Payment type (radio); one-time (min fixed, may increase); recurring (fixed monthly, first of month); penalty via one-time only | US34, US35, US38, US43 |
| **Outputs** | Summary fields; Stripe success/error; payment history (date, amount, receipt link); reminder emails (3); decline email | US32, US36, US40, US42, US44 |

**Change from prior SOW:** US36 — Failed, cancelled, or declined payments are **recorded** and associated with the member (for reporting and support of possible penalties). Successful payments store amount, timestamp, receipt URL.

**Explicit exclusions:** Refunds, chargebacks, disputes; retries; pre-payment notifications for recurring; totals/exports/filters on history; user timezone; enforcement beyond display (US45).

---

## 7. Profile (US46–US50)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | Member | US46–US50 |
| **Screens** | Profile screen (view/edit first name, last name, email); change password; request email change; approve email change (link from email); confirmation screen after email change | US46–US49 |
| **User flows** | View/edit name (save immediately, no approval); change password (same as reset flow → logout + message on login); request email change → confirmation email to current email; approve via link → email updated, logout, confirm screen; no history of prior emails | US46–US50 |
| **System states** | Profile displayed; password changed (logout); email change requested; email change approved (logout, new email) | US47, US49 |
| **Inputs** | First name, last name (editable); new password; new email (for change request) | US46, US47, US48 |
| **Outputs** | Saved name; password change → logout + login message; email change request → email to current address; approval → update email, logout, confirm screen; no audit/history of email changes | US47, US48, US49, US50 |

**Explicit exclusions:** Approval workflow for name; history of name changes; history of email addresses; audit of email changes; notify admins of email change (US46, US50).

---

## 8. Request Assistance (US51)

| Element | Specification | SOW Reference |
|--------|----------------|---------------|
| **User roles** | Member | US51 |
| **Screens** | Dedicated Request Assistance screen: choose "for myself" or "for someone else"; for self: family dropdown + Manage Family link; for other: name + phone fields; text area for description; submit | US51 |
| **User flows** | Select for self → choose family member (or Manage Family → Family section, return); or for other → enter name + phone (no validation); enter description (free-form) → submit → notification to all designated administrators; no status/resolution/history shown to member | US51 |
| **System states** | Form completed and submitted; notification sent | US51 |
| **Inputs** | Request type (self / other); family member (if self); name + phone (if other); description (text area) | US51 |
| **Outputs** | Notification to administrators with submitted details and request type; no responses/decisions/outcomes or request status/resolution/history to member | US51 |

**Explicit exclusions:** Validation that named person exists; display of admin responses/decisions/outcomes; request status/resolution/history for member; eligibility/entitlement checks (US51).

---

## Cross-Cutting

- **Time:** All payment dates/times in MST. No user-selectable timezone. (US33.)
- **Bylaws:** All bylaw references informational only; no system enforcement. (Multiple.)
- **Out of scope (unless in AC):** Content creation, copywriting, translation, image licensing beyond SBMI-provided, auth system development, back-end workflow automation, ongoing content management. (SOW intro.)
