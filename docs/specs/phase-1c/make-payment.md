# Make a Payment

**Phase:** 1c — Payments
**Surface:** `/dashboard/payments#make` (currently embedded; design specs a separate `/dashboard/payments/make` route — both are acceptable per universal scope-discipline)
**Source files:**
- UI: [src/app/dashboard/payments/MakePaymentSection.tsx](../../../src/app/dashboard/payments/MakePaymentSection.tsx), [src/app/dashboard/payments/page.tsx](../../../src/app/dashboard/payments/page.tsx)
- Stripe integration: (Phase 1c work) — TBD `/api/payments/intent`, `/api/payments/recurring`

## Purpose

Allow Active Members and approved applicants to make a one-time payment or set up recurring monthly contributions via Stripe.

## Source user stories

- **US43** — Selecting payment type.
- **US44** — One-time payment processing.
- **US45** — Recurring payment setup.
- **US48** — Changes to dues or fee amounts.

## Acceptance criteria

### Payment type selection (US43)
- The Make-a-Payment screen presents a payment type selection as **radio buttons**:
  - **One-Time Payment**
  - **Recurring Payment**
- The selection determines which Stripe payment flow is shown.

### One-time payments (US44)
- Selecting One-Time opens the Stripe payment interface (Payment Element).
- The minimum payment amount is **preselected by default** to the outstanding required obligation (registration balance, dues, or penalties — whichever applies).
- The user **may increase** the payment amount above the minimum.
- Stripe supports **credit card** and **direct bank account debit**.
- Payments are processed using the SBMI Stripe account.
- Stripe default success and error messaging is used.
- The system does **not** retry failed payments (universal: covered by Stripe Source of Truth principle).

### Recurring setup (US45)
- Recurring payments may be used for monthly dues and for registration installments.
- The recurring amount **defaults to the required obligation** and **is not editable**.
- The recurring amount is **never changed by the system** — to change it, the member cancels and re-authorizes a new amount.
- For monthly dues: recurring charges occur on the **first day of each month**.
- For registration installments: recurring charges follow the six-month equal installment schedule.
- Stripe manages billing schedules.
- The system does **not** retry failed payments.
- If a recurring payment is **declined**:
  - The recurring arrangement is cancelled immediately.
  - A single email notification is sent.
  - No automatic retry occurs.
- If the declined obligation is monthly dues, a **$5 penalty applies** (US50). If the obligation is a registration installment, **no penalty**.

### Re-authorization (US48)
- If dues amount changes due to category or family-composition changes, existing recurring payments are not automatically updated (Stripe authorization model).
- The member is responsible to cancel and re-authorize a new recurring amount through Stripe.
- Any overpayment resulting from an unchanged recurring amount becomes account credit per coverage logic (US47).

## Routes / surfaces

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/dashboard/payments#make` | Make-a-payment section. |
| POST   | `/api/payments/intent` *(TBD)* | Create a Stripe PaymentIntent for a one-time amount. |
| POST   | `/api/payments/recurring` *(TBD)* | Create a Stripe Subscription for monthly dues or installments. |
| POST   | `/api/stripe/webhook` *(TBD)* | Webhook listeners for `payment_intent.succeeded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`. |

## Implementation notes

- The current `MakePaymentSection` is **UI scaffold only** — radio cards, amount input with quick-amount chips, and a Stripe-mock card input. Full Stripe wiring (Payment Element, SetupIntent for recurring, webhooks) is the bulk of Phase 1c work.
- Quick-amount chips ($25 / $50 / $100 / $250) are display-only until Stripe wiring lands.
- The "saved payment method" row currently shows a hardcoded Visa •• 4242 placeholder — replace with the member's default Stripe payment method when wired.

## Open questions / placeholders

- Stripe onboarding: SBMI must complete Stripe account setup before payment integration can be validated end-to-end (SOW Section 11).
- Receipt PDF template ownership: assumed Stripe-generated receipts; confirm with SBMI before go-live (handoff README question 6).
