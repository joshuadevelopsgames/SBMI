# Flames.blue prompt: Member & Admin portals

Copy the block below into Flames.blue to build the member/admin side of the SBMI app. Adjust the first line (scope) if you want design-only vs full UI + flows.

---

## Prompt to paste

```
Build the Member Portal and Admin Portal for an Ethiopian mutual aid association (SBMI) in Calgary. I need both apps: layout, navigation, and all pages/flows below. [Design and UI only — no real auth or database; use placeholders. OR: Build the full UI and navigation; backend will be wired separately.]

**Branding for both portals:** Ethiopian flag colours only — green `#078930`, yellow `#FCDD09`, red `#DA121A`. Sharp corners (no rounded buttons/cards). Clear hierarchy, accessible contrast. Cream/off-white content background.

---

**A. Shared: Login flow (both portals)**

- Login: Email (max 50 chars), password, “Stay logged in” checkbox, Sign in. Links: Forgot password?, Back to home. Password field has show/hide (eye) toggle.
- Forgot password: Email input → submit → “Check your email.”
- Reset password (magic link): Token in URL; New password + Confirm (min 8 chars) → “Password reset. Redirecting to login.”
- 2FA: 6-character code, Resend code, Verify. On success → Member Dashboard or Admin Dashboard by role.
- After password/email change: redirect to login with message (e.g. “Your password was changed. Please sign in with your new password.”).

---

**B. Member Portal (after login as member)**

**Layout (every page):** Header dark green `#078930`: left “SBMI Portal” (→ dashboard); centre/right nav: Dashboard, Manage family, View reports, Bylaws (PDF), Make payment, Request assistance; right: Profile icon → “Edit profile”, “Logout”. Footer: same nav summary, SBMI branding, “For assistance, email [mailto]” — use red `#DA121A` for the mailto. Main: max width ~1024px, centred, cream background.

**Pages:**
1. **Dashboard** — Welcome {firstName}. Member since {date}. Payment summary: next due, amount, status (Overdue / Up to date / Paid ahead). “Make a Payment” button. Short payment blurb. Quick links (cards or list): Manage family, View reports, Bylaws, Make payment, Request assistance, Profile.
2. **Manage family** — List: full name, age, birth date. Rows over 25: greyed + italic “Over 25 — bylaw reference.” Add family member; per row: Edit (birth date only), Delete (with confirm). Add/Edit: Full name, Birth date (required); age at entry ≤25 for add. Only member’s household.
3. **View reports** — Payment history only: table/list — Date, Amount, Status, Receipt (link when available).
4. **Bylaws** — One link/button → open bylaws PDF in new tab.
5. **Make payment** — Same payment summary as dashboard. Section: radio One-Time vs Recurring Monthly; minimum amount shown; note “Payment processed via Stripe.” Below: Payment history (same as View reports).
6. **Request assistance** — “Myself” or “Someone else”. Myself: short copy only. Someone else: one dropdown “Family member needing assistance” (from Manage family); link to Manage family. Both: Description (required text area). Submit → success message; no status/history.
7. **Profile** — Your details: First name, Last name (editable), Email (read-only; email change is separate). Save. Change password: “Send me a link to change my password.” Request email change: new email + “Request email change” → “Check your current email for approval link.” Household (read-only): member #, status, payment schedule, household name/address if available.

---

**C. Admin Portal (after login as admin)**

**Layout:** Header dark green; “SBMI Admin”; nav: Dashboard, Members, Approvals, Reports; Sign out. Main: same max width, cream.

**Pages:**
1. **Dashboard** — Summary cards: Total members, Pending approvals (members), Pending claims, Payments recorded. Links: Members, Approvals (applications), Approvals (claims), Reports.
2. **Members** — Table: Name, Member #, Household, Status, Schedule. Add member (form/modal): First name, Last name, Email, Phone; optional “Create login account” + password.
3. **Approvals** — Applications: list pending — name, email, phone, message; Approve / Reject. Claims: list pending — member, reason, amount, description; Approve / Reject.
4. **Reports** — Placeholder: “Admin reports (e.g. payments, members).”

---

**D. Rules**

- One login; 2FA redirects to Member or Admin dashboard by role. Members never see admin nav; admins never see member “Manage family” / “Request assistance” in member app.
- Logout ends session. “Stay logged in” = longer session.
- No CMS; fixed copy. Bylaws = link out only. Payments/Stripe out of scope for this build; show layout only. Assistance: family dropdown for “someone else” only (no extra name/phone/email fields).
```

---

## Notes

- Flames.blue builds from conversation; you can follow up with “add the 2FA screen” or “match the header to #078930” if needed.
- Public one-pager uses a different palette (see `ONE-PAGER-STYLE-GUIDE.md`); keep portals and one-pager visually separate.
