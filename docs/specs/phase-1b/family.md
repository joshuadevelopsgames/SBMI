# Family Management

**Phase:** 1b — Member experience
**Route:** `/dashboard/family`
**Source files:**
- UI: [src/app/dashboard/family/page.tsx](../../../src/app/dashboard/family/page.tsx)
- Member API: [src/app/api/dashboard/family-members/route.ts](../../../src/app/api/dashboard/family-members/route.ts), [src/app/api/dashboard/family-members/[id]/route.ts](../../../src/app/api/dashboard/family-members/[id]/route.ts)
- Admin API: [src/app/api/admin/family-changes/route.ts](../../../src/app/api/admin/family-changes/route.ts), [src/app/api/admin/family-changes/[id]/decision/route.ts](../../../src/app/api/admin/family-changes/[id]/decision/route.ts)
- Admin queue: [src/app/admin/approvals/ApprovalQueue.tsx](../../../src/app/admin/approvals/ApprovalQueue.tsx)

## Purpose

Let a member view their household roster and **request** changes (Add, Edit, Delete). All changes flow through Executive Committee approval before they take effect. Eligibility (age, marital status) is enforced as stored values per current bylaws Article 2.5.

## Source user stories

- **US27** — Family members management screen.
- **US28** — Requesting a family member addition with validation.
- **US29** — Ongoing ineligibility status display.
- **US30** — Requesting an edit to a family member.
- **US31** — Requesting deletion of a family member.
- **US32** — Informational bylaw context on family screen.
- **US87** — Managing family change requests (admin side).

## Acceptance criteria

### List view (US27)
- A dedicated Family Members screen is reachable from the member dashboard.
- The list shows columns: Member · Date of birth · Age · **Relationship** · Status.
- Members **cannot directly modify** family records.
- Add, Edit (and Delete per the SOW's strict reading) **require Executive Committee approval**.
- Until EC approves, the **existing data remains unchanged**.
- A confirmation is shown to the member that the request is pending approval (Apr 14).
- Members may optionally attach a supporting document with each request (Apr 14, shared engineering with US88).
- Bylaw context line: "Age and marital-status restrictions apply per bylaws (Article 2.5)."

### Add request (US28)
- Form fields: full name, birth date, relationship, marital status.
- Birth date is required and must be a valid calendar date.
- Marital status options: **Unmarried**, **Married**.
- Age is calculated from the entered birth date.
- **Block submission** if age > 25 at time of request (bylaws Article 2.5.3).
- **Block submission** if marital status is Married (dependents must be unmarried).
- A clear validation message is shown when the request is blocked.
- Upon submission, the request enters status `PENDING_APPROVAL` and **does not appear** in the member's *active* household list (it is shown with a "Pending review" pill).

### Ongoing ineligibility (US29)
- Family members over age 25 are displayed in a greyed-out, inactive style.
- Family members marked Married are displayed in a greyed-out, inactive style.
- Name and birth date remain visible.
- A small italicized note appears stating that age or marital status invalidates eligibility under the bylaws.
- The system **does not** automatically remove or notify based on age or marital status.

### Edit request (US30)
- Member can submit an edit (birth date, marital status, relationship, name).
- The system **prevents** edits that would put the person over 25 at time of edit (data-integrity guard against typos in birth date).
- **Editing marital status to Married is allowed.** Per US29, marital status is a recordable state — once approved, the entry transitions to *Ineligible* and is greyed-out. This is the path for capturing life events (a previously eligible dependent gets married). The original blanket prevention in US30 reads "if that would invalidate eligibility"; US29 makes it clear that "becoming ineligible" *is* the supported outcome, not a reason to reject.
- The existing record stays unchanged until EC approval; the proposed values are stored in `pendingFullName / pendingBirthDate / pendingRelationship / pendingMaritalStatus`.
- The row shows an "Edit awaiting EC review" hint, and the edit modal shows an inline notice when the user picks Married telling them the dependent will become Ineligible after approval.

### Delete request (US31)
- Member can submit a deletion request.
- A confirmation step is required before submission.
- The record stays visible until EC approval; `pendingDeletion = true` flips the row's pill to "Pending deletion".
- Upon approval, the family member is removed.
- A pending-add can be cancelled directly by the requesting member without EC review (the record was never approved).

### Bylaw context (US32)
- The screen shows a brief informational reference to the bylaws.
- The screen does NOT calculate or display projected dues changes (financial impact lives in the Payments section).

### Admin queue (US87)
- Pending Add/Edit/Delete requests appear in the EC `Active` workflow at `/admin/approvals`.
- EC can **approve** or **decline**. On approve, the change is applied (Add → `APPROVED`; Edit → pending fields applied to canonical fields; Delete → record removed). On decline, change is not applied; rejection reason is recorded on the FamilyMember record (or the row hard-rejects for Add requests).
- Underlying request records are immutable after submission (the original add data is preserved in the pending fields until decided).
- If supporting documents were attached (US28 new), reviewer sees them on the review screen.

## Routes / surfaces

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/api/dashboard/family-members` | List requester's family members (excludes `REJECTED`). |
| POST   | `/api/dashboard/family-members` | Submit Add request (status `PENDING_APPROVAL`). |
| PATCH  | `/api/dashboard/family-members/{id}` | Submit Edit request (writes `pending*` fields). |
| DELETE | `/api/dashboard/family-members/{id}` | Submit Delete request (`pendingDeletion=true`); cancels in place if record was still pending Add. |
| GET    | `/api/admin/family-changes` | List pending Add/Edit/Delete items for EC. |
| POST   | `/api/admin/family-changes/{id}/decision` | Body `{ action: "approve" \| "reject", rejectionReason? }`. |

## Implementation notes

- **Schema (`FamilyMember`)** carries: `status` (`PENDING_APPROVAL` | `APPROVED` | `REJECTED`), `relationship`, `maritalStatus` (`UNMARRIED` | `MARRIED`), and the `pendingFullName / pendingBirthDate / pendingRelationship / pendingMaritalStatus / pendingDeletion` set used for in-flight edit/delete requests.
- The dashboard household preview ([src/app/dashboard/page.tsx](../../../src/app/dashboard/page.tsx)) filters to `status = APPROVED`; the family page itself shows everything except `REJECTED` so members see their own pending requests.
- Document upload (Apr 14) is **not yet wired** — UI placeholder only. Schema work needed before implementing.
- Deletion UI label changes based on state: "Cancel request" if `PENDING_APPROVAL`, otherwise "Request removal".

## Decision points

- `[ DECIDE ]` US27 / US31 — does **Delete** require EC approval, or is direct delete allowed (Mollalign's Apr 14 preference)? **Current implementation = require approval** for Delete (strict SOW reading). If SBMI flips this, simplify the DELETE handler to `prisma.familyMember.delete(...)` immediately and add a small audit row instead.

## Open questions / placeholders

- Combined age-and-marital row hint copy: currently "Over age and married" / "Age limit per bylaws" / "Married per bylaws" — confirm with SBMI.
