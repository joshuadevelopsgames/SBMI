# Changelog — 2025-02-11

All changes made on this date (member/admin portal UX, typography, and copy).

---

## Gold button text → black

- **Goal:** Improve contrast on gold buttons; avoid green-on-gold.
- **Change:** Replaced `text-[#0F3D2C]` / `text-[#1B5E3B]` with `text-[#171717]` on all gold primary buttons.
- **Files:**
  - `src/app/page.tsx` (main Login)
  - `src/app/login/page.tsx`, `src/app/login/2fa/page.tsx`, `src/app/login/forgot-password/page.tsx`, `src/app/login/reset-password/page.tsx`
  - `src/components/landing/HeroSection.tsx` (Apply to Join)
  - `src/components/landing/ApplicationForm.tsx`
  - `src/app/dashboard/page.tsx` (Pay now)
  - `src/app/dashboard/profile/ProfileForm.tsx` (Save changes)
  - `src/app/dashboard/claims/SubmitClaimForm.tsx` (Submit claim)
  - `src/app/dashboard/assistance/page.tsx` (Submit request)
  - `src/app/dashboard/family/page.tsx` (Add / Save in modals)
  - `src/app/admin/approvals/ApprovalQueue.tsx` (Approve)
  - `src/app/admin/members/AddMemberForm.tsx` (Add member)

---

## Breadcrumbs and “Back” link

- **Goal:** Clear wayfinding without a sidebar; easy “back” for less tech-savvy users.
- **Changes:**
  - Added `src/components/navigation/Breadcrumbs.tsx`: path-based breadcrumbs with optional “← Back” link to parent segment.
  - **Admin:** Breadcrumbs in layout at top of `<main>`, above page content; theme `light`.
  - **Member:** Breadcrumbs in dashboard layout at top of `<main>`, above page content; theme `light`.
  - Removed breadcrumbs from the header bar (admin layout and `MemberHeader`).
- **Files:** `src/components/navigation/Breadcrumbs.tsx`, `src/app/admin/layout.tsx`, `src/app/dashboard/layout.tsx`, `src/app/dashboard/MemberHeader.tsx`

---

## Title font: Plus Jakarta Sans (display)

- **Goal:** Bolder, clearer sans-serif for titles; better for older users.
- **Changes:**
  - Loaded **Plus Jakarta Sans** (500, 600, 700) as `--font-display` in `src/app/layout.tsx`.
  - Added `.font-display` in `src/app/globals.css`; updated `.sbmi-heading` to use it.
  - Replaced `font-serif` (and `font-light`) with `font-display font-semibold` for all portal titles (admin, dashboard, login).
- **Files:** `src/app/layout.tsx`, `src/app/globals.css`, and all admin/dashboard/login pages that used `font-serif` for headings.

---

## Admin: remove “Member view”

- **Goal:** Remove member-view entry from admin UI.
- **Changes:**
  - Removed “Member view” link from admin header nav.
  - Removed “Member view” from Quick links on admin dashboard.
- **Files:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`

---

## Remove bottom back links and Quick links

- **Goal:** Simplify pages; rely on header and breadcrumbs for navigation.
- **Changes:**
  - Removed “← Back to dashboard” from Assistance, Payments, and Family pages.
  - Removed “← Back to login” / “← Back to home” from Login, 2FA, Forgot password, Reset password.
  - Removed **Quick links** section from member dashboard and admin dashboard.
  - Removed unused `Link` import from `src/app/dashboard/payments/page.tsx`.
- **Files:** `src/app/dashboard/page.tsx`, `src/app/admin/page.tsx`, `src/app/dashboard/assistance/page.tsx`, `src/app/dashboard/payments/page.tsx`, `src/app/dashboard/family/page.tsx`, `src/app/login/page.tsx`, `src/app/login/2fa/page.tsx`, `src/app/login/forgot-password/page.tsx`, `src/app/login/reset-password/page.tsx`

---

## Admin members: empty state and table

- **Goal:** Clear empty state and better table behavior.
- **Changes:**
  - When there are no members, show “No members found.” instead of an empty table.
  - Members table thead made sticky (`sticky top-0 z-10`) for long lists.
- **Files:** `src/app/admin/members/page.tsx`

---

## Edit household member: first and last name

- **Goal:** Allow editing name when editing a family/household member.
- **Changes:**
  - Edit modal now has **First name** and **Last name** (in addition to Birth date).
  - Existing `fullName` is split on first space for initial values; on save, first + last are recombined into `fullName` and sent in PATCH. API already supported `fullName`.
  - Modal title set to “Edit household member”; added `parseFullName` helper.
- **Files:** `src/app/dashboard/family/page.tsx` (EditForm only; no API change)

---

## Section line + label: line full width, label on right

- **Goal:** Keep the gold line + uppercase label, but put the label on the right with the line extending across.
- **Changes:**
  - Replaced fixed-width line (`w-8`) with `flex-1 min-w-0` so the line fills the row.
  - Added `shrink-0` to the label span so it stays on the right.
  - Applied everywhere this pattern was used: Family, Finances, Assistance, Account, Benefits (dashboard); Reports, Queue, Management (admin); Member Portal and Two-factor authentication (login). On login/2fa, removed the second (right) short line so it’s one full line + label on right.
- **Files:** `src/app/dashboard/family/page.tsx`, `src/app/dashboard/payments/page.tsx`, `src/app/dashboard/assistance/page.tsx`, `src/app/dashboard/profile/page.tsx`, `src/app/dashboard/claims/page.tsx`, `src/app/admin/reports/page.tsx`, `src/app/admin/approvals/page.tsx`, `src/app/admin/members/page.tsx`, `src/app/login/page.tsx`, `src/app/login/2fa/page.tsx`

---

## Profile dropdown (member header)

- **Goal:** Make the profile dropdown a simple account menu: show who’s logged in, then Edit profile and Log out.
- **Changes:**
  - Dropdown now shows **name** (firstName + lastName) and **Member since [year]** at the top (data from layout; `memberInfo` passed as props).
  - Removed Dashboard and Make payment links; kept **Edit profile** and **Log out** only.
  - Layout fetches member `firstName`, `lastName`, `joinedAt` and passes `memberInfo` (with `memberSinceYear`) to `MemberHeader`.
  - If no member info, dropdown shows fallback “Account” label.
- **Files:** `src/app/dashboard/MemberHeader.tsx`, `src/app/dashboard/layout.tsx`

---

## Summary

| Area | Changes |
|------|--------|
| **Buttons** | Gold buttons use black text (#171717) everywhere. |
| **Navigation** | Breadcrumbs + “Back” above page content (no sidebar); removed bottom back links and Quick links; removed Member view from admin. |
| **Typography** | Plus Jakarta Sans as display font for portal titles (font-display, font-semibold). |
| **Admin** | Members: empty state + sticky table header. |
| **Family** | Edit household member: first name, last name, birth date. |
| **Visual** | Section line extends full width with label on the right (dashboard, admin, login). |
| **Profile dropdown** | Name + “Member since” year at top; Edit profile and Log out only. |
| **Login page** | Decorative “Member Portal” line reverted to centered short-line / text / short-line (not full-width). |
| **Add family member** | Single “Full name” field replaced with separate First name and Last name; still sent as fullName to API. |
| **Birth date picker** | Family Add/Edit: native date input replaced with Year → Month → Day dropdowns (year-first, 1920–current) for faster selection. |
| **Birth date display** | Family list: show birth date from calendar date (YYYY-MM-DD) only to avoid timezone off-by-one; added `formatBirthDateDisplay`. |
| **Timezone: Calgary** | Site-wide all dates shown in Calgary (America/Edmonton). Added `src/lib/date.ts` with `SITE_TIMEZONE`, `formatDate`, `formatDateShort`, `formatCalendarDate`; replaced all `toLocaleDateString` usages in dashboard, claims, payments, admin approvals, family. |
| **Landing hero** | Removed “Contact Us” button from main page hero; contact info remains in footer only. |
