# Membership Onboarding & Registration

**Phase:** 1c — Payments
**Routes:** `/registration-payment` (and email-driven password setup)
**Source files:**
- Page: [src/app/registration-payment/page.tsx](../../../src/app/registration-payment/page.tsx)
- Application API: [src/app/api/apply/route.ts](../../../src/app/api/apply/route.ts)
- Admin decision API: [src/app/api/admin/applications/[id]/decision/route.ts](../../../src/app/api/admin/applications/[id]/decision/route.ts)

## Purpose

Take an applicant from approved application through to **Active Member** status by collecting the registration fee. Lump sum or six equal installments. Activation happens when the registration is fully paid.

## Source user stories

- **US6** — Prospect application and Executive Committee approval.
- **US7** — Registration fee determination by category.
- **US8** — Registration payment options.
- **US9** — Approved applicant portal access.

## Acceptance criteria

### EC approval (US6)
- A public applicant submits the welcome-page form (US4); status begins as `PENDING` (Pending Executive Committee Review).
- The EC approves or modifies the proposed membership category (thresholds per US69, Phase 2a).
- On approval: applicant status becomes `Approved — Pending Registration Payment`. **They are not yet an Active Member.**
- The system generates a registration invitation email.

### Fee determination (US7)
- Each membership category has a defined registration fee recorded by SBMI (`[ CONFIRM: registration fees by category at go-live ]`).
- Fee values are stored in the system and associated with each category.
- If registration fees vary by family size, the calculation incorporates approved family composition (per US35).
- Fee amounts are not member-configurable.
- Registration fees are **separate from monthly dues**.

### Payment options (US8)
- Welcome email explains:
  - The calculated total registration fee.
  - Two options: pay in full, or six equal installments.
  - A secure link to set up a password.
- After password setup and login, the applicant lands on the **Registration Payment** screen.
- The screen displays:
  - Total registration amount.
  - Remaining balance.
  - Installment schedule (if installments selected).
- Installment plans are **exactly six equal payments**; not customizable.
- Applicant may pay the remaining balance in full at any time without penalty.
- **No** $5 penalty applies to missed installments (US50 explicitly excludes registration installments).
- Applicant remains in `Pending Registration Completion` status until full registration is paid.
- On final required payment, status auto-transitions to **Active Member** immediately.
- Monthly dues are not due until the **first of the following month** after activation, regardless of activation date within the current month.
- No pro-rated dues for the partial month between activation and the next first.

### Portal access while pending (US9)
- Approved applicants can log in.
- Status displayed as "Pending Registration Completion".
- Standard member dashboard interface is accessible.
- Dashboard clearly displays remaining registration balance.
- Applicant can view bylaws, family section, profile, and payment area.
- **Cannot submit** a Request for Assistance while registration is incomplete (US20).
- Applicants remain in this status indefinitely until full registration is paid.

## Routes / surfaces

| Method | Path | Purpose |
|--------|------|---------|
| POST   | `/api/apply` | Public application submission. |
| POST   | `/api/admin/applications/{id}/decision` | EC approve/reject (sets registration fee on Member). |
| GET    | `/registration-payment` | Standalone screen for completing registration (post-login). |
| (TBD)  | `/api/payments/registration` | Stripe SetupIntent + initial charge for registration. |

## Implementation notes

- EC approval sets **`Member.status = PENDING_REGISTRATION`** until registration is paid; login redirects new members to **`/registration-payment`** ([decision route](../../../src/app/api/admin/applications/[id]/decision/route.ts), [post-auth redirect](../../../src/lib/post-auth-redirect.ts)).
- **`/registration-payment`** is **UI-only for Stripe** — mock checkout, disabled primary button until gateway ships; amounts use shared registration-fee helper.
- Activating to **`ACTIVE`** after payment remains tied to Stripe webhook / confirmation work (Phase 1c integration).
- Email templates for "approval + setup link" and "registration receipt" are hard-coded transactional templates per the universal Email Delivery principle.

## Open questions / placeholders

- `[ CONFIRM ]` registration fees by category at go-live (US7). Bylaws Article 8.1.2 reference: Family $1,105 / Individual or Youth $663 (60% of Family). Confirm with Gemechu.
- `[ CONFIRM ]` First-of-month dues alignment per Gemechu Feb 27 (Mollalign may have differed). Implementation defaults to first-of-month.
- `[ DECIDE ]` Upgraded-active-member registration top-up (US40) — does upgrading category trigger a delta? Default = no, current Active members never owe additional registration after activation.
