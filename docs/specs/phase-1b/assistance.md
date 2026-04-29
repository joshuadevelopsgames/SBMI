# Request Assistance

**Phase:** 1b — Member experience
**Route:** `/dashboard/assistance`
**Source files:**
- UI: [src/app/dashboard/assistance/page.tsx](../../../src/app/dashboard/assistance/page.tsx)
- API: [src/app/api/dashboard/assistance/route.ts](../../../src/app/api/dashboard/assistance/route.ts)
- Notification (Phase 2a): see also `phase-2a/notifications.md` (US68 / US69 / US70)

## Purpose

Let an Active Member submit a confidential assistance request — for themselves, a household member, or someone else in the community. Submission creates a governance notification visible to all EC users except the submitter.

## Source user stories

- **US60** — Requesting assistance.
- (Downstream: US68 notification creation, US69 approval threshold, US70 rejection threshold — Phase 2a.)

## Acceptance criteria

### Access
- A dedicated **Request Assistance** screen is reachable from the member area.
- Only **Active Members** may submit. Users in Pending Registration Completion see an explanatory state and cannot submit.

### Form
- Beneficiary selection (radio):
  - **For myself** (and a family member) — opens a dropdown listing the member's family members; includes a **Manage Family** link that navigates to the family screen with a way to return.
  - **For someone else in the community** — displays a text field for the person's name and a phone number field; **no validation** confirms whether the person exists in the system.
- Type of support: select with options Bereavement / Medical hardship / Financial hardship / Other.
- Description: required textarea.
- Supporting documents: optional, up to 3 files (PDF / JPG / PNG, ≤ 5 MB each).
- Save-as-draft button is shown but persistence of drafts is not in scope (UX affordance only).

### Submission behavior
- Submitting creates an `AssistanceRequest` record.
- Submitting also creates a governance notification (US68 — Phase 2a) visible to all EC users **except the submitter** if the submitter is themselves an EC user (conflict-of-interest, US71).
- A confirmation screen / inline state is shown after submission; the member is told SBMI will be in touch as needed.

### Privacy
- Description text is visible only to authorized EC reviewers.
- The system does not currently surface a status to the member (pending review / resolved). Mollalign's Apr 14 ask for member-visible status is in **Appendix B.3** as a Change Order.

## Routes / surfaces

- `GET /dashboard/assistance` — page.
- `POST /api/dashboard/assistance` — body: `{ requestType: "SELF" | "OTHER", familyMemberId?, otherName?, otherPhone?, description }`.

## Implementation notes

- The current form composes the description with a `[Type] ` prefix (e.g. `"[Medical hardship] …"`) before storing — keep this until support type gets its own column.
- **OTHER / community:** `/dashboard/assistance` submits `requestType: "OTHER"` with optional name + phone when not scoped to household; API rejects non-`ACTIVE` members.
- Document upload is **not yet wired** — placeholder dropzone only.
- **Pending registration:** dashboard quick action is disabled for `PENDING_REGISTRATION`; API returns 403 for non-Active submissions.

## Open questions / placeholders

- Member-visible status (Submitted / Under Review / Resolved) — Appendix B.3, **Change Order required**.
- Maximum description length: **4000 characters** on the stored description string (includes `[Support type] ` prefix); enforced in API + textarea limits — confirm cap with SBMI if policies change.
