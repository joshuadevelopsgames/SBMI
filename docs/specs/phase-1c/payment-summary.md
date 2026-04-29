# Payment Information Summary

**Phase:** 1c — Payments
**Surface:** Hero card on the dashboard + summary strip on the payments page.
**Source files:**
- Dashboard: [src/app/dashboard/page.tsx](../../../src/app/dashboard/page.tsx)
- Payments: [src/app/dashboard/payments/page.tsx](../../../src/app/dashboard/payments/page.tsx)
- Calculation: [src/lib/payment-summary.ts](../../../src/lib/payment-summary.ts), [src/lib/payment-config.ts](../../../src/lib/payment-config.ts)

## Purpose

Surface a single, opinionated summary of what the member owes and why — separating registration obligations, monthly dues, and penalties — without interpreting bylaw consequences.

## Source user stories

- **US41** — Payment information summary.
- **US42** — Time and date authority. (Universal: covered by Time-Zone Authority principle.)

## Acceptance criteria

### Sections shown
The summary shows obligations separately for:
- **Registration fee** — only if not fully paid.
- **Monthly dues** — only for Active Members.
- **Penalties** — only when applicable (US50/US51).

### State display

#### If `Pending Registration Completion`
- Display:
  - Remaining registration balance.
  - Installment schedule (if installments selected).
- **Coverage status is not displayed.**
- **No penalties** are shown for missed registration installments.

#### If `Active Member`
- Display **exactly one** of three states:
  - `Up to Date`
  - `Paid Ahead`
  - `Overdue`
- State is determined **solely** by recorded dues payments, credits, and penalties.
- Show:
  - Last paid-through date.
  - Last payment amount and date.
  - Next due date.
  - Minimum amount due.

### What is NOT shown
- Registration status once fully satisfied.
- Bylaw consequences (universal: covered by Authoritative Source principle).
- Future eligibility or membership changes.

## Implementation notes

- The current implementation derives state in `getPaymentSummary()` ([src/lib/payment-summary.ts](../../../src/lib/payment-summary.ts)). The dashboard hero card maps the state into the pill (`pill-ok` / `pill-warn` / `pill-danger`).
- Display copy is hard-coded in English per the universal Language principle.
- Mollalign's Apr 14 concern that coverage shouldn't auto-terminate on missed payments is already aligned: `Overdue` is a display flag only; membership is never auto-terminated.

## Open questions / placeholders

- The "Paid Ahead" state copy varies in the design ("Ahead" / "Paid ahead") — pick one canonical label and use everywhere. Current implementation uses "Paid ahead" on the dashboard.
