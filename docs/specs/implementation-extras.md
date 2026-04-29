# Implementation extras (not enumerated as Phase 1a–1c acceptance criteria)

Features or tooling added in-repo that extend or operationalize the SOW baseline without replacing formal specs. Use this list when updating `**INDEX.md**` or writing stakeholder scope decks.


| Extra                                                                                    | Purpose                                                                                                                                                     |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V2 marketing one-pager** (`HomeWelcomeV2`, `home-v2.css`)                              | Manus/V2-aligned public home with full-bleed hero and long-form sections — broader than minimal “welcome” wireframes                                        |
| **Middleware bypass for `/images/*`, `/bylaws.pdf`**                                     | Avoids auth redirect breaking static assets referenced by marketing `next/image`                                                                            |
| **Marketing ↔ portal tokens** (`--marketing-green`, `--marketing-gold` in `globals.css`) | Visual continuity between `/`, `/login`, dashboard                                                                                                          |
| **Notification bell (derived inbox)**                                                    | Header bell + `GET /api/dashboard/notifications` / `GET /api/admin/notifications` — aggregates pending EC/member states; **not** full US68 governance inbox |
| **Demo login buttons**                                                                   | Seeded credentials on `/login` for QA — dev/demo affordance, not SOW                                                                                        |
| **reCAPTCHA** on forgot-password                                                         | Bot friction — spec updated; keys are deploy obligations                                                                                                    |
| `**GET /api/cron/reminders` stub + `vercel.json` cron**                                  | Placeholder slot for US49–US51 automation                                                                                                                   |
| `**GET /api/dashboard/me`**                                                              | Lightweight client gating for assistance and flows needing status                                                                                           |
| **Registration fee helper** (`registration-fee.ts`)                                      | Placeholder amounts until Stripe + category fees                                                                                                            |
| **radio-card / `.rd-fill` experiment**                                                   | Payments/assistance UX polish beyond wireframe fidelity                                                                                                     |


When an extra becomes product-canonical, **promote it**: add acceptance language to the relevant `phase-1`* spec and trim or footnote it here.