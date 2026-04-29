# Coverage & Credit Logic

**Phase:** 1c — Payments
**Surface:** Calculations powering the dashboard hero card and the payment summary.
**Source files:**
- Calculation: [src/lib/payment-summary.ts](../../../src/lib/payment-summary.ts), [src/lib/payment-config.ts](../../../src/lib/payment-config.ts)

## Purpose

Define the rules the system uses to compute each Active Member's coverage period (paid-through date), credits, and Up-to-Date / Overdue / Paid-Ahead state — without modifying historical payment records.

## Source user stories

- **US47** — Coverage and credit calculation logic.
- **US48** — Changes to dues or fee amounts. *(See [make-payment.md](make-payment.md).)*
- **US51** — Paying fines and penalties.

## Acceptance criteria

### Coverage (US47)
- Coverage logic applies **only** to Active Members.
- Each full month of satisfied dues extends coverage by **one full calendar month**.
- Partial payments generate **credit toward the next month** (do not extend coverage by a fractional month).
- Overpayments generate **future payment credit**.
- If recurring payments continue at a higher amount **after** required dues decrease, the extra is credited forward to future dues.
- **Registration payments do not generate coverage periods.**
- Coverage extension begins **only after activation**.

### Penalties (US50, summarized — full spec in `reminders-and-penalties.md`)
- Penalties apply only to delinquent **monthly dues** for Active Members.
- The default penalty is $5 (bylaws Article 9.2).
- Penalties are derived from the bylaws and may change if updated (prospectively).

### Paying fines and penalties (US51)
- Penalties **must be paid via one-time payment** (no recurring).
- The penalty amount is the **minimum required payment** and cannot be reduced.
- Additional payment above the penalty amount is allowed.
- Any excess payment is credited toward future dues or registration balance per SBMI allocation rules.

## Allocation order

When a payment is greater than the immediate required obligation, the system allocates in this order:

1. Outstanding **penalties** (oldest first).
2. Outstanding **registration installments** (if any remain).
3. Outstanding **monthly dues** for the current cycle.
4. Future **monthly dues** as credit (advances coverage by full months only).

Partial-month leftovers stay as credit and are applied to the next calendar month.

## Implementation notes

- The current `getPaymentSummary()` computes Up-to-Date / Overdue / Paid-Ahead from `paidAt` timestamps and `amount` totals. The full coverage allocation algorithm above is partially implemented — confirm during Phase 1c QA.
- All date math runs in **America/Edmonton** per the universal Time-Zone Authority principle.
- Historical payment records are never modified; coverage is **derived** from the immutable history.

## Open questions / placeholders

- Edge case: a member underpays a penalty plus dues in a single transaction. Per US51, the penalty is the minimum required, and any excess goes to future dues — i.e. underpayments below the penalty amount should be **rejected** at the Stripe layer (preselected minimum is the obligation). Confirm rejection behaviour during integration.
