# Reminder Notifications & Non-Payment Penalties

**Phase:** 1c — Payments
**Surface:** Backend (cron / scheduled jobs) + transactional emails. No dedicated screen; the resulting state is visible in the Payment Summary.
**Source files:**
- Email helpers: [src/lib/auth.ts](../../../src/lib/auth.ts) (existing transactional `sendEmail` infra)
- Cron / scheduled jobs: TBD (Phase 1c)

## Purpose

Send reminder emails before obligations are due, and apply the bylaw-defined $5 penalty to delinquent monthly dues — without auto-terminating coverage.

## Source user stories

- **US49** — Upcoming obligation reminder notifications.
- **US50** — Non-payment penalty assignment (monthly dues only).

## Acceptance criteria

### Reminder emails (US49)
- Reminders apply to:
  - **Monthly dues** for Active Members.
  - **Registration installments** for Pending Registration Completion users.
- Reminders are **not** sent to users with active, non-declined recurring payments.
- For monthly dues:
  - **5 days before** the first of the month → reminder if coverage will expire at month-end.
  - **3 days before** → second reminder if still unpaid.
  - **Final day of coverage** → third and final reminder.
- Email states that payment is due by/before the first of the month and that a penalty will apply if unpaid (monthly dues only).
- For registration installments: same schedule, but emails clearly state this is a **friendly installment reminder** and that **no penalties apply** to missed installments.
- No additional reminders beyond the defined schedule.

### Penalty rules (US50)
- Penalties apply **only** to delinquent monthly dues for Active Members.
- **No penalties** apply to missed registration installments.
- Monthly dues must be paid by/before the first day of the new month. **There is no grace period.**
- If monthly dues are unpaid on the first day of the new month, a penalty is added.
- Default penalty: **$5** (bylaws Article 9.2). Stored in config so SBMI can change it; prospective only.
- The penalty amount **derives from the bylaws** and may change with future bylaw updates.
- The penalty increases the total amount due shown in the Payment Information Summary.

### Coverage handling on missed payment
- Coverage status flips to `Overdue` on the first of the month if dues are unpaid.
- Membership is **never auto-terminated** by missed payments (Mollalign Apr 14 alignment, parked termination workflow in Appendix B).

## Implementation notes

- **`GET /api/cron/reminders`** (secured with `CRON_SECRET`) is stubbed; **`vercel.json`** schedules it daily as a placeholder. Scheduled jobs (T-5, T-3, T-0 emails + penalties) still need full logic per this spec.
- Use **idempotent** job logic — store last-sent reminder per member per cycle in a small `ReminderLog` table or use a unique constraint on (memberId, cycle, kind). This prevents duplicate sends if a job runs twice.
- Email templates are hard-coded transactional templates (universal Email Delivery principle). Two variants:
  - "Dues reminder (with penalty warning)"
  - "Friendly installment reminder (no penalty)"
- Penalty creation is a single `Payment` row written with `category = "PENALTY"`, `amount = penaltyAmount`, `status = "PENDING"`, `dueAt = first-of-next-month`. The same allocation order applies (penalty → registration → dues → credit).

## Open questions / placeholders

- `[ CONFIRM ]` Does SBMI want a separate `ReminderLog` row in audit, or is the email transcript enough? The universal No-Audit-Log principle says the latter; but cycle-level idempotency benefits from a tiny key table even if it's invisible to users. Recommended: keep a small dedupe table without surfacing it.
- `[ CONFIRM ]` Penalty stacking: if a member is delinquent two months running, do the $5 penalties stack? Default = yes (one penalty per missed month). Confirm with Gemechu.
