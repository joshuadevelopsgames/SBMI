# Foundation backlog (Phase 1a–1c, integration-ready)

Work ordered to align `**docs/specs/**` with the codebase **before or alongside** large integrations (Stripe, full cron/email automation). “Foundation” = durable schema, honest UX, spec-accurate copy/gates, and documented placeholders.

## Quick wins (done / partial)

- Assistance description **max length** (4000 chars incl. type prefix) — API + UI (`assistance-constants.ts`).
- **Stripe UI gating** — publishable-key check (`stripe-ui.ts`) drives disabled “Process payment” + callouts on `/dashboard/payments` and `/registration-payment`.
- Canonical payment-state label **“Paid ahead”** on dashboard — already unified; payments page uses summary elsewhere.

## Tier A — Close gaps called out in specs


| Area                              | Spec reference                           | Action                                                                                                           |
| --------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Dashboard assistance quick action | `phase-1b/dashboard.md`                  | ~~Gate “Request assistance” when `PENDING_REGISTRATION~~` — done in code; keep spec in sync                      |
| Assistance OTHER / community      | `phase-1b/assistance.md`                 | ~~OTHER branch + API ACTIVE gate~~ — verify spec text updated                                                    |
| Upload surfaces                   | welcome / family / assistance            | Decide minimal MVP (metadata-only vs Supabase Blob): schema + one vertical slice                                 |
| Registration onboarding           | `phase-1c/onboarding.md`                 | ~~`PENDING_REGISTRATION` + `/registration-payment` shell~~ — keep spec updated; Stripe remains integration phase |
| Payment UI                        | `phase-1c/make-payment.md`               | Keep scaffold honest (“connect Stripe”); optional env flag to hide pay CTA in demos                              |
| Reminders / penalties             | `phase-1c/reminders-and-penalties.md`    | Expand cron stub: idempotency model → then email content → penalty rows                                          |
| Manual EC payments                | `phase-1c/admin-manual-payment-entry.md` | Schema + dual-key queue when Stripe is stable                                                                    |


## Tier B — Content / product confirmations (blocks “done”, not code)

- `**[ LIST ]` / `[ CONFIRM ]`** membership categories, fees, support email, footer mailto — capture decisions in spec tables when SBMI confirms.
- **Wireframes PDF** vs implementation — periodic reconciliation (see internal gap notes).

## Tier C — Spec hygiene

- After each milestone, refresh **Implementation notes** in each `phase-1`* file so INDEX-driven reviewers see truth.
- Track **implementation extras** separately ([implementation-extras.md](./implementation-extras.md)) so they are not mistaken for SOW obligations.

