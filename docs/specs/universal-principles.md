# Universal Design Principles

Source: Intoria SOW v1.4 DRAFT, Section 5.

These principles apply to **every** screen, workflow, and user story. Where any spec file is silent on a topic covered here, this principle still applies. Acceptance-criteria items in Appendix A that the SOW explicitly marked "removed: covered by universal X principle" are absorbed here.

---

## Cultural and religious sensitivity

The Iddir membership is multi-ethnic and interfaith. All culturally or religiously sensitive elements — imagery, colour palette, symbolism, language, phrasing — are submitted to SBMI for review and approval before implementation. The default visual language is inclusive rather than tied to any one community.

The high-fidelity design intentionally uses the Ethiopian flag tricolor only as a 3px decorative top stripe, not as a background fill or theme. Do not extend it.

## Authoritative source: current bylaws

The system stores and applies bylaw-derived values (registration fees, monthly dues, penalty amounts, age thresholds, marital-status rules, support amounts, approval thresholds) using the values SBMI records. The system does not interpret, enforce, or adjudicate bylaw rules. Any governance decision referenced in a user story is made by a person; the system records the decision.

## Prospective-only changes

Category changes, fee changes, family-composition changes, and rule changes apply prospectively only. Historical payment records, historical notifications, and completed approvals are never modified as a side effect of a later rule change. Retroactive recalculation is out of scope and is a Change Order if requested.

## Time-zone authority

All payment dates, coverage calculations, due dates, and timestamps are recorded and displayed in **Mountain Standard Time (America/Edmonton)**. User-selectable time zones are not supported.

## Language

All user-visible content (page labels, headings, help text, emails) is **English only**. Amharic and other languages are out of scope (Appendix B).

## Responsive layout

All pages render on current versions of Chrome, Edge, Safari, and Firefox on desktop and mobile, using standard responsive web techniques. Device-specific behaviour, native mobile apps, and legacy browser support are out of scope.

## Content provision

SBMI provides all text, images, and bylaw content in final form. Copywriting, editorial, historical research, translation, and image licensing beyond royalty-free assets are out of scope. One review cycle is included per content block; additional revisions are a Change Order.

## No audit log by default

Audit trails, change history, login history beyond `lastSuccessfulLoginAt`, and user-activity reporting are not included unless an acceptance criterion explicitly requires them. Governance decisions visible in Notifications are the recorded record.

## Role-based access

Two roles only: **Member** and **Executive Committee** (Admin). Members see the member dashboard only. Executive Committee users see the member dashboard plus the governance area. Role changes happen in Users and are Executive-Committee-only. Super-user management of administrators' permissions is out of scope.

## Stripe is the payment source of truth

Stripe handles authorization, PCI compliance, card storage, and retries. The system records amount, timestamp, and receipt URL only (per US46). Refunds, disputes, chargebacks, and tax reporting are handled outside the system. Stripe-amount changes require member re-authorization (US48).

## Approval workflows surface as Notifications

All approval/rejection workflows (family requests, membership applications, assistance and support requests, category changes, profile name changes) surface as items in the Executive Committee Notifications inbox. Resolution is automatic when thresholds are reached; resolved items are not manually dismissable.

## Scope discipline

Any requirement introduced after this SOW is signed is handled through the Change Order process (SOW Section 12, MSA 3(b)). Small (≤3 hours) informal adjustments remain available; anything larger is quoted and agreed in writing.

## Email delivery

Email uses standard SMTP infrastructure on best-effort basis. Users are reminded that messages may take time and to check spam folders. Resend-throttling UI, delivery analytics, bounce handling, and suppression lists are out of scope.

## Accessibility

Reasonable web accessibility practices: semantic HTML, sufficient colour contrast, keyboard focus rings, single-character OTP inputs with `inputmode="numeric"` and `autocomplete="one-time-code"`. No WCAG 2.x conformance audit.

## Security baseline

SSL/TLS on all pages, encrypted authentication data at rest and in transit, hashed password comparison (bcrypt), CSRF protection on all mutating forms, reasonable server hardening. External penetration testing and compliance certifications (SOC 2, ISO 27001) are out of scope.

---

## Implications for spec files

When you write or read a spec file, **omit acceptance criteria that are pure restatements of these principles** (responsive layout, role-gating, prospective-only, no audit log, etc.). They are inherited. Repeat them only when a screen has a non-default behaviour worth calling out.
