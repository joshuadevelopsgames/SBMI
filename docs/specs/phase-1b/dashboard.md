# Member Dashboard

**Phase:** 1b — Member experience
**Route:** `/dashboard`
**Source files:**
- UI: [src/app/dashboard/page.tsx](../../../src/app/dashboard/page.tsx), [src/components/portal/Chrome.tsx](../../../src/components/portal/Chrome.tsx)

## Purpose

The member's home — personalized welcome, current payment status, household summary, navigation entry points, and recent activity. (SOW Section 4.1.)

## Source user stories

- **US18** — Member dashboard access and scope.
- **US19** — Member welcome and status information (incl. household summary).
- **US20** — Member dashboard navigation options.
- **US21** — Cultural design presentation (palette decided by SBMI).
- **US22** — Global header navigation (persistent on all member pages).
- **US23** — Profile menu in header.
- **US24** — Global footer content.
- **US25** — Footer branding and support contact.
- **US26** — Member restrictions from governance.

## Acceptance criteria

### Routing (US18)
- After authentication, members are routed to the member dashboard.
- The member dashboard displays a reduced set of options compared to the EC dashboard.
- Role determination uses the stored role on the user record.

### Welcome & status (US19)
- Welcome message includes the member's **first name**.
- "Member since {Month YYYY}" calculated from `Member.joinedAt`.
- A compact household summary appears below the welcome: spouse (if any) and currently eligible dependent family members (name + age) — only `APPROVED` and currently-eligible records (Apr 14).
- Last sign-in pill: `Last sign-in · {Month D, h:mm A}` from `User.lastSuccessfulLoginAt` (per US16).

### Navigation (US20)
- Visible options:
  - Manage family members
  - View Payment History
  - View bylaws (PDF)
  - Make a payment
  - Request assistance
  - Edit profile
- Each option routes to its corresponding section.
- **Request Assistance is disabled or hidden** for users in `Pending Registration Completion` status.
- No EC workflows in member navigation.

### Global header (US22) and profile menu (US23)
- Persistent header on all member pages.
- Profile icon top-right opens a dropdown with:
  - Edit profile
  - Logout

### Global footer (US24, US25)
- Footer mirrors the member header navigation.
- Displays the SBMI logo (decorative).
- Includes a `mailto:` link directing members to email SBMI for assistance.

### Restrictions (US26)
- Members cannot access EC, finance, audit, or governance tools (universal: covered by Role-Based Access principle).

### Design treatment
- Hero "payment card" with status pill (`Up to date` / `Paid ahead` / `Overdue`), large amount, due date, year-to-date progress bar, and CTAs to **Make payment** + **View history**.
- Quick actions row: Update profile, Manage family, Request assistance, Download bylaws.
- Recent activity feed (last 4 records).

## Routes / surfaces

- `GET /dashboard` — server component reading `Member`, `FamilyMember[]` (filtered to `status = APPROVED`), `Payment[]`, and `User.lastSuccessfulLoginAt`.

## Implementation notes

- The household preview filters by `status = APPROVED` so pending requests don't leak into the public-feeling preview ([src/app/dashboard/page.tsx](../../../src/app/dashboard/page.tsx)).
- Last-sign-in label uses `Intl.DateTimeFormat` with `timeZone: "America/Edmonton"` per the universal Time-Zone Authority principle.
- The "Request assistance" quick action is **disabled** when `member.status === 'PENDING_REGISTRATION'` (opacity + no navigation); EC-facing banner prompts registration payment ([`dashboard/page.tsx`](../../../src/app/dashboard/page.tsx)).
- Footer / shell mailto should follow **`NEXT_PUBLIC_SUPPORT_EMAIL`** when set — confirm canonical SBMI address for production ([ShellFoot](../../../src/components/portal/Chrome.tsx)).

## Open questions / placeholders

- `[ CONFIRM ]` final palette per US21 and Section 11 (default is a warm-neutral with single non-flag accent).
- `[ CONFIRM ]` SBMI's official support email for the footer mailto.
- Mollalign's Apr 14 ask for an "announcements / activities" non-personal area is parked in Appendix B; not in scope for this dashboard.
