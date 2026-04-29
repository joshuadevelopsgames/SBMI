# Payment Recording & History

**Phase:** 1c — Payments
**Routes:** `/dashboard/payments#history`
**Source files:**
- UI: [src/app/dashboard/payments/page.tsx](../../../src/app/dashboard/payments/page.tsx), [src/app/dashboard/payments/PaymentHistory.tsx](../../../src/app/dashboard/payments/PaymentHistory.tsx)
- Schema: [prisma/schema.prisma](../../../prisma/schema.prisma) (`Payment`)

## Purpose

After a successful payment, store a minimal record (amount, timestamp, receipt URL, method) and surface it on the member's history page with simple filters and downloadable receipts.

## Source user stories

- **US46** — Recording payments and receipts.
- **US52** — Payment history and receipts.
- (Closely related: **US81** EC payments report, Phase 2a — same column shape with `member name` column added.)

## Acceptance criteria

### Recording (US46)
- After a successful Stripe payment, the system stores:
  - `amount`
  - `timestamp` (`paidAt`)
  - `receiptUrl`
  - `method` (`CARD` | `BANK` | `CASH` | `CHEQUE` | `ETRANSFER`)
  - `cardBrand` and `cardLast4` (when method is `CARD`) — for display only.
- These are associated with the member via `Payment.memberId`.
- **No** other Stripe metadata is persisted.
- Failed, cancelled, or declined payments are **not** recorded as successful payments (they may exist as `FAILED` / `PENDING` rows but never as `COMPLETED`).

### Member-side history page (US52)
- The dashboard includes a **View Payment History** link.
- The report lists recorded payments.
- Each entry shows: payment date, type (category), method, status, amount, receipt link.
- Receipt links open in a new browser tab (`target="_blank" rel="noopener noreferrer"`).
- The report is paginated.
- The report is **read-only**: no totals, exports, filters, or summaries on the member side.
- *(SOW US81 Apr 14 add)* On the EC-side equivalent, **From / To date filter** and **payment type filter** are required. Member side per US52 is plain.

> Note: The member-facing implementation here also provides the From/To/type filter UI for usability. Per the universal Scope Discipline principle this is treated as a small UX add aligned with the EC report's specified behaviour; if SBMI considers it scope creep, it can be removed without affecting US52 acceptance.

## Routes / surfaces

- `GET /dashboard/payments?page=&from=&to=&type=` — server-rendered page; query params drive the history filter.
- `Payment` rows are written by the Stripe webhook handler (Phase 1c work) on `payment_intent.succeeded` / `invoice.paid`.

## Implementation notes

- The history table now shows columns: **Date / Type / Method / Status / Amount / Receipt** ([src/app/dashboard/payments/PaymentHistory.tsx](../../../src/app/dashboard/payments/PaymentHistory.tsx)).
- Method label is derived from `method` + `cardBrand` + `cardLast4`. `BANK` → "Bank debit"; `CASH` → "Cash" (admin-entered); etc.
- Date filter passes ISO `from` / `to` query params; server interprets the range as `paidAt: { gte, lte }` with the to-date set to end-of-day in MST.
- The **Search by amount or type** input is currently `disabled` (placeholder). Plain-text search across amounts is out of scope per US52 ("read-only with no … filters"); leaving it disabled keeps the design intent without adding a filter that wasn't authorized.

## Open questions / placeholders

- Member-facing **Export CSV** control was removed from `/dashboard/payments` (US52: read-only history without exports).
- Receipt URL ownership: Stripe-hosted receipts are assumed (handoff README open question 6). Confirm.
