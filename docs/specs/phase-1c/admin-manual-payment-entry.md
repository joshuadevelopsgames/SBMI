# Admin Manual Payment Entry

**Phase:** 1c — Payments
**Route:** `/admin/payments/new` (admin-only)
**Source files:**
- *(Not yet implemented — Phase 1c work)*
- Schema: [prisma/schema.prisma](../../../prisma/schema.prisma) (`Payment` already supports `method` = CASH | CHEQUE | ETRANSFER)

## Purpose

Let an authorized Executive Committee user **record** a cash, cheque, or e-transfer payment that didn't go through Stripe — reflecting payments that members handed over in person, dropped off, or sent via Interac. A second EC user must confirm the entry before it is finalized.

## Source

- **SOW Section 4.1, in scope** — Manual payment entry (admin), added per RFP Clarification #4. Priced at **$1,265**.
- **SOW Section 8** — Phase 1c includes Admin manual payment entry alongside Stripe integration.
- **SOW Section 14** — itemized as 11 hours @ $115/hour.

## Why this is separate from US44

US44 (one-time payment processing) is **member-side, Stripe-driven**. Manual entry is a separate workflow because:

1. The actor is the EC, not the member.
2. There is no Stripe authorization, charge, or receipt — Stripe is bypassed.
3. The bylaw governance framework requires a **second-EC-user confirmation** so that a single administrator cannot post arbitrary payments to a member's account (Clarification #4).
4. The recorded payment must still flow through the same coverage / credit / penalty allocation logic (US47, US51) once finalized.

## Acceptance criteria

### Entry form
- Authorized EC users (subset configured in Rules per US79) can access **Record manual payment** from the admin nav (alongside Approvals, Members, Reports).
- The form requires:
  - **Member** — searchable picker (uses the same Users search as US84).
  - **Method** — radio: Cash · Cheque · E-transfer. (No Card / Bank — those go through Stripe.)
  - **Amount** — required, positive, two decimal places.
  - **Category** — radio: Monthly dues · Registration installment · Penalty · Other.
  - **Paid date** — defaults to today (in MST per universal Time-Zone Authority); cannot be in the future.
  - **Reference** — free-text (cheque number, e-transfer reference, etc.). Optional.
  - **Note** — free-text reason. Optional.
- The submitting EC user clicks **Submit for confirmation**. A `Payment` row is created with `status = "PENDING_CONFIRMATION"`.
- The submitting EC user is **excluded** from confirming their own entry (conflict-of-interest, mirrors US71).

### Confirmation step
- A separate authorized EC user opens the Pending Confirmations queue and clicks **Confirm** or **Reject**.
- On **Confirm**:
  - `Payment.status` flips to `COMPLETED`.
  - `Payment.paidAt` is set (if not already).
  - The payment is included in coverage / credit / penalty allocation just like a Stripe payment.
  - The member sees the entry in their payment history (with the appropriate Method label).
  - An `AuditLog` row records both the submitter and the confirmer.
- On **Reject**:
  - `Payment.status` flips to `FAILED`; rejection reason is stored.
  - The payment does **not** appear in the member's coverage / credit calculations.
  - An `AuditLog` row records the rejection.

### Receipts
- No Stripe receipt exists. The system does not generate a receipt PDF for manual payments. The `receiptUrl` field is null.
- (Out of scope: server-side receipt-generation. Listed as Appendix B if SBMI ever wants it.)

### Display
- Member's Payment History (US52) shows the row with method "Cash" / "Cheque" / "E-transfer" — no card brand/last4.
- EC Payments Report (US81) lists manual-entry rows alongside Stripe rows. The Apr 14 type filter (Stripe vs manual entry) drives the segmentation.

## Routes / surfaces

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/admin/payments/new` *(TBD)* | Entry form. |
| POST   | `/api/admin/payments/manual` *(TBD)* | Body: `{ memberId, method, amount, category, paidAt, reference?, note? }`. Creates a `Payment` row with `status = "PENDING_CONFIRMATION"`. |
| GET    | `/admin/payments/pending` *(TBD)* | Queue of unconfirmed manual entries. |
| POST   | `/api/admin/payments/manual/{id}/decision` *(TBD)* | Body: `{ action: "confirm" \| "reject", rejectionReason? }`. The submitting EC user is rejected by 403. |

## Data model addendum

`Payment` already has the necessary fields. Add a single status value:

- `PENDING` (existing — used for Stripe attempts in flight).
- `PENDING_CONFIRMATION` (**new** — for manual entries awaiting second-EC confirmation).
- `COMPLETED` (existing).
- `FAILED` (existing).

A small extension stores who submitted vs. confirmed:

```
Payment {
  …
  enteredById          String?  // EC user who submitted the manual entry; null for Stripe rows
  confirmedById        String?  // EC user who confirmed the manual entry
  reference            String?  // free-text — cheque #, e-transfer ref
  note                 String?  // free-text reason
}
```

Both new fields are nullable so existing Stripe-driven rows are unaffected.

## Implementation notes

- This work is not yet implemented. Schema migration + admin form + decision queue are the bulk of the 11 hours.
- Reuse the existing `/admin/approvals` pattern (queue, approve, reject, rejection reason input) — consistent UX with applications, family changes, and name changes.
- **Coverage allocation must run on confirmation, not submission.** Otherwise a single EC user could move a member into "Paid Ahead" by submitting a fake $5,000 cheque. The double-key flow gates that.

## Open questions / placeholders

- `[ LIST ]` Which EC users are authorized to **submit** manual entries? Per US79, the Rules screen defines authorized rule managers; the same setting can govern manual-entry authorization. Confirm with SBMI.
- `[ LIST ]` Which EC users are authorized to **confirm** manual entries? Recommend: any EC user except the submitter.
- `[ DECIDE ]` Should the member receive an email when a manual entry is confirmed? Recommend yes (transactional "We received your $X cheque on Y") — small content add to the existing "payment recorded" email template.
- `[ DECIDE ]` What happens if the cheque later bounces or the e-transfer is reversed? The SOW does not currently address reversals. Recommend a separate reversal workflow as a Change Order (mirrors Stripe refund handling, which is also out of scope).
