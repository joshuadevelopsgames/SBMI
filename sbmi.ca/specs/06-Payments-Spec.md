# Spec: Payments

**SOW:** SOW (3) — Payments, US32–US45. This spec is the rule set for payment summary, make payment, and payment history; no behavior beyond cited AC.

---

## 1. Product Summary (from SOW)

- **User roles:** Member; SBMI (time/date authority).
- **Screens:** Payment Information Summary (on dashboard); Make Payment (type selection → one-time or recurring Stripe); Payment History (paginated list with receipt links).
- **Flows:** View summary → Make Payment → One-Time or Recurring (radio) → Stripe; View Payment History → list, receipt in new tab. Reminder emails (3) for non-recurring; one decline email; penalty on non-payment/decline.
- **Exclusions:** Refunds, chargebacks, disputes; retries; pre-payment notifications for recurring; totals/exports/filters on history; user timezone; enforcement of standing beyond display.

---

## 2. Functional Specification

### 2.1 UI States — Payment Information Summary

| State | Condition | Display | SOW |
|-------|------------|---------|-----|
| Overdue | Payment not made by due date | Overdue message; last paid-through; total past due (incl. penalties); date became overdue; last payment amount and date; Make Payment; View Payment History | US32 |
| Up to date (current) | Standard monthly, current | Up to date message; paid-through (current month); next min = monthly contribution; next due date; last payment amount and date; Make Payment; View Payment History | US32 |
| Paid ahead | Prepaid >1 month | Up to date message; paid-through (full prepaid period); next min amount; next due date; last payment amount and date; Make Payment; View Payment History | US32 |

- Only these three states. All amounts use coverage and penalty logic. No bylaw enforcement/disciplinary explanation. Visual styling may differ by state; content structure consistent. (US32.)
- All dates/times in Mountain Standard Time (MST); no user-selectable timezone. (US33.)

### 2.2 UI States — Make Payment

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Type selection | Make Payment clicked | Radio: “One-Time Payment” | “Recurring Monthly Payment”; one at a time; selection drives Stripe flow | US34 |
| One-time | One-Time selected | Stripe interface; minimum preselected, uneditable (= monthly contribution); member may increase; card and bank debit; Stripe success/error; no retry | US35 |
| Recurring | Recurring selected | Stripe recurring form; amount = monthly fee, not editable; charge first of month; Stripe manages schedule; no retry; no pre-payment notifications | US38 |
| Fee change | Membership fee changed | Existing recurring not auto-updated; member must re-authorize new amount through Stripe | US39 |
| Penalty | Paying fines/penalties | One-time only; penalty = minimum required; cannot reduce; may pay more; excess credited to future dues | US43 |

### 2.3 UI States — Payment History

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| List | View Payment History | Paginated list; each entry: payment date, amount, link to Stripe receipt; receipt opens new tab; read-only; no totals, exports, filters, summaries; layout follows SBMI administrative spreadsheet as practical | US44 |

### 2.4 Validation Rules

- One-time: minimum = monthly contribution (uneditable); member may only increase. (US35.)
- Recurring: amount fixed to monthly fee, not editable. (US38.)
- Penalty: minimum = penalty amount; cannot reduce. (US43.)
- Email/ReCAPTCHA: not in Payments; covered in Login/Forgot.

### 2.5 Error States

- Stripe default success and error messaging; system does not retry; system assumes no responsibility for Stripe failures. (US35, US45.)
- No custom error states specified for “payment failed after return” beyond Stripe messaging.

### 2.6 Edge Cases

- **Recording (US36):** Successful payments: amount, timestamp, receipt URL returned and stored in database associated with member. Failed, cancelled, or declined payments are **recorded** and associated with the member (for reporting and support of possible penalties). No Stripe metadata beyond amount, timestamp, receipt URL persisted.
- **Recurring “automatically resume” (US42):** “Once paid, the recurring membership charge will automatically resume… set up like a brand new recurring payment agreement with Stripe.” [UNSPECIFIED – REQUIRES PRODUCT DECISION: exact flow]
- **Monthly contribution / penalty amount source:** Bylaws (Article 8.2); “may change if bylaws change.” Where config lives (DB, env, admin) not specified. [UNSPECIFIED – REQUIRES PRODUCT DECISION]
- **“Supplied SBMI administrative spreadsheet”:** Layout reference for payment report; artifact not in SOW. [UNSPECIFIED – REQUIRES PRODUCT DECISION]

### 2.7 Explicit Inclusions

- Summary: Overdue / Up to date / Paid ahead only; fields as above; MST; Make Payment + View Payment History. (US32, US33.)
- Make Payment: radio One-Time | Recurring; one-time min fixed, may increase; Stripe card/bank; no retry. (US34, US35.)
- Record (US36): amount, timestamp, receipt URL returned and stored for successful payments; failed, cancelled, or declined payments also recorded and associated with member (reporting/support of possible penalties). No Stripe metadata beyond amount, timestamp, receipt URL.
- Coverage: full contribution = one calendar month; partial = credit; overpayment = future credit; example ($100→Jan–May 31; $32→Jan + $12 credit, Feb 1 due $8). Display only. (US37.)
- Recurring: Stripe form, fixed amount, first of month; Stripe manages; no retries, no pre-payment emails. (US38.)
- Fee change: no auto-update; member re-authorize. (US39.)
- Reminders: only for members without active recurring; 5 days before 1st, 3 days before 1st, final day of coverage; each states penalty if not paid, due date and amount; max 3. (US40.)
- Penalty: if not paid by first of new month, add penalty ($5 default, bylaw-derived); increases amount due; no disciplinary explanation. (US41.)
- Decline: webhook; no retry; cancel recurring; one email; add penalty; member resolves; to resume, pay missed + penalty then new recurring agreement with Stripe. (US42.)
- Penalties paid one-time only; penalty min required; excess credited. (US43.)
- History: link on dashboard; list date + amount + receipt link; new tab; paginated; read-only; no totals/exports/filters; layout per spreadsheet. (US44.)
- Stripe for security/PCI; no refunds/chargebacks/disputes; bylaw refs informational. (US45.)

### 2.8 Explicit Exclusions

- Retries for failed payments. (US35, US38, US42.)
- Pre-payment notifications for recurring. (US38, US40.)
- Totals, exports, filters, summaries on history. (US44.)
- Refunds, chargebacks, disputes. (US45.)
- Additional compliance, audits, tax reporting. (US45.)
- Enforcement of standing beyond displaying amount due. (US37, US41.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **Payment record:** memberId, amount, paymentDate, receiptUrl (and status/outcome); successful payments store amount, timestamp, receipt URL; failed/cancelled/declined also recorded, associated with member. (US36, US44.)
- **Coverage/balance:** Derived or stored: paid-through date, credit, penalties; monthly contribution amount; penalty amount. (US32, US37, US41.)
- **Recurring:** Stripe-managed; system may store subscription/customer id for “active recurring” and “resume” logic. (US38, US42.)
- **Config:** Monthly contribution amount; default penalty amount ($5); source [UNSPECIFIED]. (US35, US41.)

### 3.2 Required Tables

- Payments (memberId, amount, paymentDate, receiptUrl, status/outcome) — successful and failed/cancelled/declined recorded per US36.
- Penalties (or embedded in balance): amount, applied date, memberId.
- Optional: MemberBalance/Coverage (paidThrough, credit, etc.) or computed on read.
- Optional: StripeCustomer/Subscription for “active recurring” and resume behavior.

### 3.3 API Endpoints

- GET payment summary (state, last paid-through, amount due, next due, last payment, etc.).
- GET payment history (paginated; date, amount, receipt link).
- POST create one-time payment intent (min amount, optional higher).
- POST create recurring / subscription (fixed amount, first of month).
- Webhook: Stripe recurring payment declined → cancel subscription, add penalty, send email. (US42.)
- No refund/chargeback/dispute endpoints. (US45.)

### 3.4 Background Jobs

- Reminder emails: 5 days before 1st, 3 days before 1st, final day of coverage (members without active recurring). (US40.)
- Penalty assignment: first day of new month if payment not made. (US41.)
- Webhook handler: on decline, cancel recurring, add penalty, send one email. (US42.)
- No retry jobs. (US35, US38, US42.)

### 3.5 External Integrations

- Stripe: payment processing, receipts, recurring billing, webhooks for declined recurring. (US35, US36, US38, US42, US44, US45.)
- Email: reminder and decline notifications. (US40, US42.)

### 3.6 Security Boundaries

- All payment and history scoped to logged-in member. (US36, US44.)
- Stripe for PCI; no card data stored. (US45.)
- Timestamps interpreted as MST server-side. (US33.)

---

## 4. SOW Citation Index (SOW 3)

- US32: Payment Information Summary states (Overdue, Up to date, Paid ahead) and fields.
- US33: Time and date authority — MST, no user timezone.
- US34: Payment type selection — radio, One-Time | Recurring.
- US35: One-time — Stripe, min preselected, may increase, no retry.
- US36: Recording — amount, timestamp, receipt URL stored for successful payments; failed/cancelled/declined also recorded, associated with member (reporting/support of penalties); no extra Stripe metadata.
- US37: Coverage logic — full/partial/overpayment; display only.
- US38: Recurring — Stripe, fixed amount, first of month; no retries, no pre-payment emails.
- US39: Fee change — no auto-update; re-authorize.
- US40: Reminders — 3 emails, only non-recurring; penalty stated.
- US41: Non-payment penalty — $5 default, bylaw-derived; increases amount due.
- US42: Declined recurring — webhook, cancel, one email, penalty; member pays then new recurring agreement with Stripe.
- US43: Paying penalties — one-time only; min = penalty; excess credited.
- US44: Payment history — list, date, amount, receipt link, new tab, paginated, read-only, layout per spreadsheet.
- US45: Scope — Stripe PCI; no refunds/chargebacks/disputes; bylaw informational.
