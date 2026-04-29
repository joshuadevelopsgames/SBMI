# Changelog — 2026-04-29

Session notes: spec drift fixes and Phase 1c scaffolding without live Stripe.

## Spec drift + onboarding status

**Goal:** Align implementation with Phase 1a/1b/1c specs: pending registration after approval, complete apply form, US60 assistance, bylaws asset, footer contact.

**What changed**

- EC application approval creates `Member.status = PENDING_REGISTRATION`, copies address to `Household`, stores `membershipCategoryCode` from application.
- `Application` gains `address` and `proposedCategory`; `/api/apply` validates address, household composition, and category code.
- Welcome apply form: required address, family composition, real category `<select>`, required phone.
- Login + 2FA success redirect: `/registration-payment` when status is `PENDING_REGISTRATION`, else `/dashboard` or `/admin`.
- `registration-payment` layout: must be logged-in member in `PENDING_REGISTRATION`; `ACTIVE` users redirected to dashboard.
- Registration payment page: pay button disabled with Stripe-pending copy; amounts from shared `registration-fee` helper; link back to dashboard.
- Dashboard: banner + payment card copy for pending registration; assistance quick action disabled until Active; household status label.
- Assistance (US60): household vs community radios; community requires name + phone; household optional approved family member; API rejects non-`ACTIVE` members; EC email payload updated.
- `GET /api/dashboard/me` for client status gating.
- `getPaymentSummary` skips monthly summary while `PENDING_REGISTRATION`.
- `public/bylaws.pdf`: minimal placeholder PDF (replace with SBMI-approved file).
- Footer: `ShellFoot` Contact + `MemberFooter` Contact EC use `mailto:` (`NEXT_PUBLIC_SUPPORT_EMAIL` or `info@sbmi.ca`).
- Admin members: counts and pills treat `PENDING_REGISTRATION` as pending.
- Demo login uses the same post-auth redirect as password login.

**Files:** `prisma/schema.prisma`, `prisma/migrations/20260429180000_application_address_and_member_pending_reg/migration.sql`, `src/app/api/admin/applications/[id]/decision/route.ts`, `src/app/api/apply/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/2fa/route.ts`, `src/app/api/auth/demo-login/route.ts`, `src/app/api/dashboard/assistance/route.ts`, `src/app/api/dashboard/me/route.ts`, `src/app/dashboard/page.tsx`, `src/app/dashboard/assistance/page.tsx`, `src/app/page.tsx`, `src/app/registration-payment/page.tsx`, `src/app/registration-payment/layout.tsx`, `src/app/admin/members/page.tsx`, `src/lib/payment-summary.ts`, `src/lib/email.ts`, `src/lib/membership-categories.ts`, `src/lib/post-auth-redirect.ts`, `src/lib/registration-fee.ts`, `src/components/portal/Chrome.tsx`, `public/bylaws.pdf`, `.env.example`, `docs/CHANGELOG-2026-04-29.md`.

## Sidenav “Need a hand?” layout

**Goal:** Stop the help card from pinning to the viewport bottom; keep sidebar stack independent of main column height.

**What changed:** Removed `margin-top: auto` from `.sidenav-foot` (replaced with fixed top margin + `flex-shrink: 0`); set `.sidenav` to `justify-content: flex-start`.

**Files:** `src/app/globals.css`, `docs/CHANGELOG-2026-04-29.md`.

## Dashboard “Add member” link

**Goal:** Keep the plus icon inline with “Add member” in the household card footer.

**What changed:** `.house-foot a` is `inline-flex` row with gap; icon `flex-shrink: 0`. Removed obsolete inline margin on `Plus` in `dashboard/page.tsx`.

**Files:** `src/app/globals.css`, `src/app/dashboard/page.tsx`, `docs/CHANGELOG-2026-04-29.md`.

## Public landing + admin copy

**Goal:** Restore Manus-style marketing one-pager at `/` with Sign in + Bylaws; keep `/login` and `/dashboard` unchanged. Admin reports and queue hints: no phase/SOW labels in user-facing text; convey fixed layouts and export scope plainly.

**What changed**

- `src/app/page.tsx` composes `src/components/landing/*` + fixed header (`/login`, `/bylaws.pdf`).
- `ApplicationForm.tsx` aligned with `/api/apply` (address, family composition, category, errors).
- `admin/reports/page.tsx`: neutral intro and callout about three fixed layouts and PDF/CSV vs other exports; removed per-card spec tags.
- `ApprovalQueue` section hints and `admin/members` table footnote de-SOW’d for display copy.

**Files:** `src/app/page.tsx`, `src/components/landing/ApplicationForm.tsx`, `src/app/admin/reports/page.tsx`, `src/app/admin/approvals/ApprovalQueue.tsx`, `src/app/admin/members/page.tsx`, `docs/CHANGELOG-2026-04-29.md`.

## Public home = login V2 split (not Manus green landing)

**Goal:** Match the marketing shell from `login/page.tsx` (`login-stage` / `login-narrative` / `login-panel`) on `/`; Manus path `V2/src/app/login/page.tsx` is not in-repo — this implements the same layout here.

**What changed:** `LoginNarrative` shared component (left column + foot with Contact mailto + Bylaws); `/` uses `login-stage` + apply card + `ApplyMembershipForm`; login page uses `LoginNarrative`; `login-panel-tall` / `login-card-apply` for scroll + width. Green `src/components/landing/*` stack no longer used on `/` (files remain for reference).

**Files:** `src/components/portal/LoginNarrative.tsx`, `src/components/portal/ApplyMembershipForm.tsx`, `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/globals.css`, `docs/CHANGELOG-2026-04-29.md`.

## Public home = upstream V2 (`joshuadevelopsgames/SBMI` `V2/src/app/page.tsx`)

**Goal:** Match the Manus V2 marketing page from the GitHub repo; keep `/api/apply`, `/login`, and dashboard behavior.

**What changed:** Ported `V2/src/app/page.tsx` as `src/app/HomeWelcomeV2.tsx` with `POST /api/apply` (combined full name + mailing line from address fields; added required family composition + membership category). Added scoped `src/app/home-v2.css` (no `@tailwind` duplicate; `.home-v2-root` instead of global `body` reset). Pulled `V2/public/images/*` into `public/images/`. Root layout loads **Inter** + **Playfair Display** for V2 CSS variables. `src/app/page.tsx` wraps the component in `.home-v2-root` and imports `home-v2.css`.

**Files:** `src/app/HomeWelcomeV2.tsx`, `src/app/home-v2.css`, `src/app/page.tsx`, `src/app/layout.tsx`, `public/images/*.jpeg` / `*.jpg`, `docs/CHANGELOG-2026-04-29.md`.

## V2 image placeholders (full set)

**Goal:** Mirror all `V2/public/images` assets from [SBMI](https://github.com/joshuadevelopsgames/SBMI) for local use / future sections.

**What changed:** Added `community-portrait.jpg`, `ethiopian-family.jpg`, `mother-child.jpg`, `mutual-aid.jpeg` under `public/images/` (the other five were already present). Current `HomeWelcomeV2` only references the original five paths; the rest are available for swaps or new blocks.

**Files:** `public/images/community-portrait.jpg`, `public/images/ethiopian-family.jpg`, `public/images/mother-child.jpg`, `public/images/mutual-aid.jpeg`, `docs/CHANGELOG-2026-04-29.md`.

## V2 home: images, typography, buttons

**Goal:** Fix missing hero/apply images, unify type with the member portal (Manrope + Inter Tight), and use the same `.btn` shape as login/dashboard while keeping V2 green/gold accents.

**What changed:** Hero `next/image` `fill` now sits in a `position: relative` full-size wrapper; apply section image column gets `min-height` on mobile + desktop so the flex stack does not collapse; all section images pass `sizes`. Removed duplicate global `.btn-primary` / legacy submit rules from `home-v2.css`; scoped form + `.form-input` rules under `.home-v2-root`. Added `.btn-v2-*` modifiers (gold CTA, light outline, nav variants, full-width submit). Dropped extra Google fonts from root layout; `home-v2` `--font-sans` / `--font-serif` map to portal stacks.

**Files:** `src/app/HomeWelcomeV2.tsx`, `src/app/home-v2.css`, `src/app/layout.tsx`, `docs/CHANGELOG-2026-04-29.md`.

## Middleware vs `/public/images`

**Goal:** Fix broken marketing images when the user is not logged in.

**What changed:** `middleware.ts` only treated `/`, `/login`, and `/dashboard` as public; `/images/*` matched the default branch and redirected to login, so `<Image src="/images/...">` received HTML instead of bytes. Early-return `next()` for `/images/` and `/bylaws.pdf`.

**Files:** `src/middleware.ts`, `docs/CHANGELOG-2026-04-29.md`.

## Login + landing visual unity

**Goal:** Make `/login` feel like the same brand as the public home (SBMI mark, gold eyebrow, headline, greens/golds, atmosphere).

**What changed:** Shared `--marketing-green` / `--marketing-gold` in `globals.css`; login stage background uses matching radial washes; narrative column adds a soft green vignette; stats numerals use marketing green; login card gets a hairline green tint. `LoginNarrative` uses the flat SBMI mark, “Samuel Bete Mutual Iddir”, gold eyebrow line (“Calgary, Alberta · Est. 2012”), and the same hero headline/gold italic as the landing. `home-v2.css` maps `--color-green` / `--color-gold` to those tokens.

**Files:** `src/app/globals.css`, `src/components/portal/LoginNarrative.tsx`, `src/app/home-v2.css`, `docs/CHANGELOG-2026-04-29.md`.

## Spec checklist: reCAPTCHA, reset expiry, cron stub, payments UI

**Goal:** Chip away at Phase 1a/1c gaps: forgot-password bot gate, password-reset longevity vs US14, placeholder for reminder cron, align member payment history with US52 (no export).

**What changed:** Added `react-google-recaptcha` + `verifyRecaptchaToken` (`src/lib/recaptcha.ts`); forgot-password UI renders checkbox when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set; API requires verification when keys exist and returns 503 in production until configured. Password reset tokens use ~100-year `expiresAt` instead of 60 minutes (SOW US14). Stub `GET /api/cron/reminders` + `vercel.json` daily cron. Removed non-functional **Export CSV** from `/dashboard/payments`. Documented env vars in `.env.example`; updated `docs/specs/phase-1a/forgot-password.md` and `phase-1c/reminders-and-penalties.md`.

**Files:** `src/app/login/forgot-password/page.tsx`, `src/app/api/auth/forgot-password/route.ts`, `src/lib/recaptcha.ts`, `src/lib/auth.ts`, `src/app/api/cron/reminders/route.ts`, `vercel.json`, `src/app/dashboard/payments/page.tsx`, `.env.example`, `package.json`, `package-lock.json`, `docs/specs/phase-1a/forgot-password.md`, `docs/specs/phase-1c/reminders-and-penalties.md`, `docs/specs/phase-1c/payment-records.md`, `docs/CHANGELOG-2026-04-29.md`.

## Radio card controls (payments / assistance / registration)

**Goal:** Center selected-state indicator in `.radio-card` circles and align styling with current portal chrome.

**What changed:** Reset `button.radio-card` browser defaults; use `position` + `transform: translate(-50%, -50%)` for inner dot; `align-items: flex-start` + tighter inset shadow when selected; `:disabled` + `:focus-visible` treatments.

**Files:** `src/app/globals.css`, `docs/CHANGELOG-2026-04-29.md`.

## Profile copy — remove US tags from member-facing lines

**Goal:** Keep EC approval messaging without SOW reference IDs in the UI.

**What changed:** Removed “(SOW US55)” from first-name and last-name approval hints on the profile form.

**Files:** `src/app/dashboard/profile/ProfileForm.tsx`, `docs/CHANGELOG-2026-04-29.md`.

## Radio-card dot — flex-centered inner fill

**Goal:** Stop the selected-state circle from looking off-center (border + `::after` + translate often drift at fractional device-pixel ratios).

**What changed:** Replaced the pseudo-element dot with a real `.rd-fill` child on `.rd`; the ring uses `inline-flex` alignment so the dot sits dead-center. Ring bumped slightly (22px) for optical balance with the new markup.

**Files:** `src/app/globals.css`, `src/app/dashboard/payments/MakePaymentSection.tsx`, `src/app/dashboard/assistance/page.tsx`, `src/app/registration-payment/page.tsx`, `docs/CHANGELOG-2026-04-29.md`.

## Notification bell (member + EC)

**Goal:** Make header bell actionable: open a panel with real items derived from existing data (no separate inbox table yet).

**What changed:** Added `NotificationBell` in `Chrome.tsx` (dropdown, Escape/outside click, loading/empty/error states; badge only when there is at least one item). `GET /api/dashboard/notifications` aggregates registration pending, overdue payment summary, pending profile name requests, pending family workflow rows, and pending mutual-aid claims. `GET /api/admin/notifications` mirrors EC approval-queue counts with links to `/admin/approvals`. Member shell uses dashboard endpoint; admin shell uses admin endpoint; unused `TopHeader` utility uses dashboard endpoint for consistency.

**Files:** `src/components/portal/Chrome.tsx`, `src/app/api/dashboard/notifications/route.ts`, `src/app/api/admin/notifications/route.ts`, `docs/CHANGELOG-2026-04-29.md`.

## Home `#apply` scroll + spec backlog docs

**Goal:** Restore reliable scroll-to-section on the V2 landing page (fixed nav + hash links); send login “Apply” to `/#apply`; document foundation backlog and non-spec extras; refresh a few stale spec Implementation notes.

**What changed:** `HomeWelcomeV2` uses `preventDefault` + `scrollIntoView` + `history.replaceState` for `#about` / `#memorial` / `#benefits` / `#apply`; `hashchange` + initial hash scroll for `/ #apply` navigations; `.home-v2-root section[id] { scroll-margin-top: 88px }`. Login link → `/#apply`. Added `docs/specs/foundation-backlog.md`, `docs/specs/implementation-extras.md`; updated `INDEX.md`, `welcome.md`, `dashboard.md`, `assistance.md`, `onboarding.md`.

**Files:** `src/app/HomeWelcomeV2.tsx`, `src/app/home-v2.css`, `src/app/login/page.tsx`, `docs/specs/INDEX.md`, `docs/specs/foundation-backlog.md`, `docs/specs/implementation-extras.md`, `docs/specs/phase-1a/welcome.md`, `docs/specs/phase-1b/dashboard.md`, `docs/specs/phase-1b/assistance.md`, `docs/specs/phase-1c/onboarding.md`, `docs/CHANGELOG-2026-04-29.md`.

## Low-hanging spec alignment + Stripe UX + `~/SBMI` git repo

**Goal:** Assistance description cap (4000), consistent Stripe-not-ready messaging, document Stripe env vars; maintain a clean standalone repo at `/Users/joshua/SBMI` for ongoing work.

**What changed:** Added `assistance-constants.ts` + API/body validation; assistance page character hint and `maxLength`. Added `stripe-ui.ts` (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` check); callouts + disabled **Process payment** when unset; registration-payment messaging branches on key presence. `.env.example` documents Stripe keys. `.gitignore` ignores `dev.db`. `foundation-backlog.md` / `assistance.md` updated. Copied `sbmi.ca/` → `/Users/joshua/SBMI`, `git init`, initial commit (excluding `dev.db`, `node_modules`, `.next`).

**Files:** `src/lib/assistance-constants.ts`, `src/lib/stripe-ui.ts`, `src/app/api/dashboard/assistance/route.ts`, `src/app/dashboard/assistance/page.tsx`, `src/app/dashboard/payments/MakePaymentSection.tsx`, `src/app/registration-payment/page.tsx`, `.env.example`, `.gitignore`, `docs/specs/foundation-backlog.md`, `docs/specs/phase-1b/assistance.md`, `docs/CHANGELOG-2026-04-29.md`; repo `/Users/joshua/SBMI/.git` (outside `sbmi.ca/` tree).
