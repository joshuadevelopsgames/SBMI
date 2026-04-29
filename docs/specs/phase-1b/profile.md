# Profile & Settings

**Phase:** 1b — Member experience
**Route:** `/dashboard/profile`
**Source files:**
- UI: [src/app/dashboard/profile/page.tsx](../../../src/app/dashboard/profile/page.tsx), [src/app/dashboard/profile/ProfileForm.tsx](../../../src/app/dashboard/profile/ProfileForm.tsx)
- Member API: [src/app/api/dashboard/profile/request-name-change/route.ts](../../../src/app/api/dashboard/profile/request-name-change/route.ts), [src/app/api/dashboard/profile/request-email-change/route.ts](../../../src/app/api/dashboard/profile/request-email-change/route.ts), [src/app/api/dashboard/profile/send-password-reset/route.ts](../../../src/app/api/dashboard/profile/send-password-reset/route.ts)
- Admin API: [src/app/api/admin/profile-changes/[id]/decision/route.ts](../../../src/app/api/admin/profile-changes/[id]/decision/route.ts)

## Purpose

Let a member view their profile, request name and email changes through the appropriate governance flow, and rotate their password.

## Source user stories

- **US54** — Viewing profile information.
- **US55** — Requesting profile updates (name).
- **US56** — Changing password from profile.
- **US57** — Requesting an email address change.
- **US58** — Approving an email address change.
- **US59** — Email change data handling.

## Acceptance criteria

### View (US54)
- Profile screen displays first name, last name, and email address.
- Family relationship information is shown as stored (informational only).
- No historical versions of profile information are displayed.

### Name change (US55) — Executive Committee approval workflow
- Member can submit a request to change first name **and** last name.
- The request **does not immediately change** stored profile data.
- Submission creates an EC workflow item for review.
- Each field has at most **one outstanding request** at a time (subsequent submissions are blocked while one is pending).
- On approval, the new value is written to `Member.firstName` / `Member.lastName`.
- On rejection, the canonical value is unchanged; rejection reason is stored on the request.

### Password change (US56)
- Profile includes a **Change Password** action.
- Uses the same logic and flow as the password-reset functionality (US14): an emailed magic-link.
- Successful password change logs the user out and requires a new login.
- The login page informs the member they were logged out due to a password change.

### Email change (US57, US58)
- Profile includes an option to request an email address change.
- Member enters a new email; format validated on blur.
- The system **does not** immediately change the email address.
- A confirmation email is sent **to the existing email address** containing a secure approval link.
- Clicking the link routes the member back to the system to confirm.
- Upon confirmation, the new email replaces the old; a confirmation screen is shown.
- The screen informs the member that future logins must use the new email.
- The old email **stops working for login immediately** after approval.
- All active sessions are invalidated (per US17); user must log in again with the new email.

### Email change data handling (US59)
- Previous email addresses **may be reused** by other accounts in the future.
- No history of previous emails is retained (covered by universal No Audit Log principle).

## Routes / surfaces

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/dashboard/profile` | View profile + pending requests. |
| POST   | `/api/dashboard/profile/request-name-change` | Body `{ fieldName: "firstName" \| "lastName", newValue }`. |
| GET    | `/api/dashboard/profile/request-name-change` | List the user's pending name requests. |
| POST   | `/api/dashboard/profile/request-email-change` | Body `{ newEmail }`. Sends confirmation to current email. |
| GET    | `/api/auth/approve-email-change?token=…` | Magic-link consume; flips the email and invalidates sessions. |
| POST   | `/api/dashboard/profile/send-password-reset` | Sends the magic-link reset email. |
| POST   | `/api/admin/profile-changes/{id}/decision` | EC approves/rejects a name request. |

## Implementation notes

- Both first name **and** last name use the locked-input + "Request change" pattern. The legacy `PATCH /api/dashboard/profile` route is intentionally returning 405 to prevent direct updates (it predated the SOW US55 reading).
- Pending name requests are surfaced inline ("Pending request: New value") so members can see their request is in-flight.
- The design's "Editable · saved instantly" hint that previously appeared on first name has been **removed** to match the SOW; the design page should be updated to reflect this when the next handoff cut is taken.

## Open questions / placeholders

- Mollalign's Apr 14 ask for Secretary email notifications + a member-provided reason field on every profile change is parked in **Appendix B.3** for a Change Order. Not in scope here.
