# SBMI Member Portal — Specification Index

This directory contains the per-screen and per-feature specifications that govern the SBMI Member Portal through Phase 1c. Specs are derived from:

- **Intoria SOW v1.4 DRAFT (April 24, 2026)** — Section 4 Scope, Section 5 Universal Design Principles, and Appendix A user stories.
- **Design handoff: `design_handoff_sbmi_member_portal/`** — visual + structural reference (high-fidelity).
- **SBMI Wireframes — Low Fidelity DRAFT** — original layout intent.

When the SOW and the design handoff disagree, **the SOW governs** — the design is a visualization of the SOW, not a parallel source of truth. The handoff intentionally documents both V1 (top-nav) and V2 (sidebar) chrome variants; both must be implementable from the same screen specs.

## Spec organization

```
docs/specs/
├── INDEX.md                          (this file)
├── foundation-backlog.md             prioritized gaps vs specs (pre-integration + hygiene)
├── implementation-extras.md          features present in-repo but outside formal Phase 1a–1c AC lists
├── universal-principles.md           SOW Section 5 — applies to all screens
├── phase-1a/                         Foundation: welcome, auth, 2FA
│   ├── welcome.md                    US1–US5
│   ├── login.md                      US10–US12
│   ├── forgot-password.md            US13, US14
│   ├── two-factor.md                 US15
│   ├── auth-data.md                  US16, US17 (cross-cutting)
├── phase-1b/                         Member experience
│   ├── dashboard.md                  US18–US26
│   ├── family.md                     US27–US32, US87
│   ├── bylaws-download.md            US33
│   ├── profile.md                    US54–US59
│   ├── assistance.md                 US60
├── phase-1c/                         Payments
│   ├── onboarding.md                 US6–US9
│   ├── categories-and-fees.md        US34–US40
│   ├── payment-summary.md            US41
│   ├── make-payment.md               US43–US45, US48
│   ├── payment-records.md            US46, US52
│   ├── coverage-credit.md            US47, US51
│   ├── reminders-and-penalties.md    US49–US51
│   ├── admin-manual-payment-entry.md SOW Section 4.1 (Clarification #4)
```

## How to read a spec file

Every spec file follows the same structure:

1. **Purpose** — single-sentence intent, lifted from the SOW user story.
2. **Source user stories** — bullet list of SOW user-story IDs this screen implements, with the SOW one-line title.
3. **Acceptance criteria** — the cleaned criteria from SOW Appendix A. SOW is the authoritative wording; cuts that the SOW marked as "covered by universal principle" are not repeated here (see [universal-principles.md](universal-principles.md)).
4. **Routes / surfaces** — the URL(s) and any API endpoints involved.
5. **Implementation notes** — current implementation pointers (file paths) and any known deviations from the spec.
6. **Open questions** — `[ DECIDE: ]` and `[ CONFIRM: ]` items left in the SOW that are still outstanding.

## Phase scope summary (from SOW Section 8)

| Phase | Weeks | Scope                                                                                  |
|-------|-------|----------------------------------------------------------------------------------------|
| 1a    | 3–5   | Hosting, schema, welcome page, authentication, 2FA, role model, global header/footer.  |
| 1b    | 6–8   | Member dashboard, family management with EC approval workflow, bylaws download, profile, request assistance. |
| 1c    | 9–12  | Stripe integration, one-time and recurring payments, registration installments, payment summary, coverage and credit logic, penalties, payment history. Admin manual payment entry. |

## Critical scope boundaries (from SOW Section 4.2)

- No Amharic UI.
- No dynamic email-template management; templates are hard-coded.
- No configurable dashboards or configurable reports.
- No meeting attendance, voting, donations, loans, property, training scheduling.
- No retroactive recalculation; **all changes apply prospectively only**.
- No SMS, push, authenticator-app, social login, or single sign-on.
- No refund/chargeback/dispute handling — Stripe owns these.
- No super-user role administration; only Member and Executive Committee roles.
- No formal WCAG conformance audit; reasonable practice only.
