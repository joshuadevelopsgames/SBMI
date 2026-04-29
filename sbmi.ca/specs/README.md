# SBMI.ca Specifications

**Single source of truth:** SOW User Stories and Acceptance Criteria (3).docx. All specs are legally binding scope; no invented features.

**Story numbering:** SOW (3) uses global numbering US1–US51.

## Index

| File | Purpose |
|------|--------|
| **00-SOW-Master-Spec.md** | Parsed SOW: modules, roles, screens, flows, states, inputs/outputs, exclusions |
| **01-Welcome-Page-Spec.md** | One-page welcome (US1–US5): functional + technical + page rules |
| **02-Login-Spec.md** | Login, forgot password, reset password, 2FA, session, auth storage (US6–US13) |
| **03-Member-Dashboard-Spec.md** | Member dashboard, header, profile menu, footer (US14–US24) |
| **04-Family-Management-Spec.md** | Family Members screen (US25–US30) |
| **05-Download-Bylaws-Spec.md** | Bylaws PDF download (US31) |
| **06-Payments-Spec.md** | Payment summary, make payment, history, reminders, penalties (US32–US45) |
| **07-Profile-Spec.md** | Profile view/edit, password change, email change request/approval (US46–US50) |
| **08-Request-Assistance-Spec.md** | Request Assistance screen and flow (US51) |
| **97-Consistency-Audit.md** | Summary of contradictions, ambiguities, assumptions, missing items |
| **99-Spec-Gap-Report.md** | Full gap report: SOW line/section, insufficiency/conflict, decision required, risk |

## Use

- **Implementation:** Each numbered spec (01–08) is the rule set for that page/function. Every requirement cites SOW story or AC.
- **Gaps:** Unspecified behavior is marked `[UNSPECIFIED – REQUIRES PRODUCT DECISION]`. Resolve via 99-Spec-Gap-Report.md before implementing.
- **Audit:** 97 + 99 list contradictions, ambiguities, and blockers; use for change requests or product decisions.

## Rules (from SOW)

- Only what is in the acceptance criteria is in scope.
- No content creation, copywriting, translation, image licensing (beyond SBMI-provided), auth *system* development, back-end workflow automation, or ongoing content management — unless explicitly in an AC.
