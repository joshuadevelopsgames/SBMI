
**Scope: design only.** We want **static designs, wireframes, and high-fidelity frames** for the Member and Admin portals—**not** full functionality. Do not implement authentication, databases, forms that submit to a backend, 2FA verification, or dynamic data. Create the **layout, navigation, and UI** so we can hand the designs off to developers. Links and buttons can navigate between frames; forms and lists can use placeholder or sample content.

**Context:** Samuel Bete Iddir (SBMI) is an Ethiopian mutual aid association in Calgary. We need **designs** for two authenticated web apps: a **Member Portal** (for members) and an **Admin Portal** (for administrators). Design and structure the pages and flows below. Use the **Ethiopian flag colours** for both portals: green `#078930`, yellow `#FCDD09`, red `#DA121A`. Use these only for the portals (not the public one-pager). Prefer sharp corners (no rounded buttons/cards), clear hierarchy, and accessible contrast.

---

### A. Shared: Login flow (both portals)

- **Login page:** Email (max 50 chars), password, “Stay logged in” checkbox, Sign in button. Links: Forgot password?, Back to home. Show password (eye) toggle on password field.
- **Forgot password:** Email input, submit → “Check your email” message (no ReCAPTCHA in prototype).
- **Reset password (magic link):** Token in URL; New password + Confirm password (min 8 chars); Submit → “Password reset. Redirecting to login.”
- **2FA page (optional in prototype):** 6-character code input; Resend code link; Verify button. After success → redirect to Member Dashboard or Admin Dashboard depending on role.
- **Post–password change / post–email change:** Redirect to login with a short message (e.g. “Your password was changed. Please sign in with your new password.”).

---

### B. Member Portal (after login as member)

**Layout (every member page):**
- **Header:** Dark green background (`#078930`). Left: “SBMI Portal” (link to dashboard). Centre/right: nav links — Dashboard, Manage family, View reports, Bylaws (PDF), Make payment, Request assistance. Right: **Profile icon** → dropdown with “Edit profile” and “Logout.”
- **Footer:** Same nav links (summary); “SBMI” branding (decorative); line of copy: “For assistance, email [mailto link].” Use red `#DA121A` for the mailto link so all three flag colours appear.
- **Main content:** Max width ~1024px, centred; cream/off-white page background.

**Pages:**

1. **Dashboard (home after login)**  
   - Welcome with member’s first name.  
   - Membership duration (e.g. “Member since [date]”).  
   - Payment summary: next payment due date and amount; status (Overdue / Up to date / Paid ahead).  
   - Prominent “Make a Payment” button.  
   - Short payment info blurb.  
   - Quick links (cards or list): Manage family, View reports, Bylaws, Make payment, Request assistance, Profile.  
   - Each link goes to the corresponding page.

2. **Manage family**  
   - List of family members: full name, current age, birth date.  
   - Members over 25: show greyed out + italic note (e.g. “Over 25 — bylaw reference”).  
   - Buttons: Add family member, and per row: Edit (birth date only), Delete (with confirm).  
   - Add/Edit: Full name (required), Birth date (required). Age at entry must be ≤25 for add.  
   - “Manage family” is only for the member’s own household list.

3. **View reports**  
   - For members, this is **Payment History only**.  
   - One view: table or list of payments — Date, Amount, Status, Receipt (link when available).  
   - No other report types for members.

4. **Bylaws (PDF)**  
   - Single link/button that opens the current bylaws PDF in a new tab. No in-app PDF viewer required.

5. **Make payment**  
   - Payment information summary (same status as dashboard).  
   - “Make a payment” section: radio — **One-Time Payment** or **Recurring Monthly Payment**.  
   - Minimum amount shown (e.g. monthly contribution).  
   - Note that payment is processed via Stripe (no Stripe in prototype; show “Payment would be processed here”).  
   - Below: **Payment history** (same as View reports) — date, amount, status, receipt link.

6. **Request assistance**  
   - Two options: “Requesting assistance for **myself**” or “for **someone else**”.  
   - **Myself:** Short line of copy (“You are requesting assistance for yourself.”). No dropdown.  
   - **Someone else:** One dropdown — “Family member needing assistance” (list of family members from Manage family). Link: “Manage family” to add/edit, then return.  
   - Both: **Description** (required text area).  
   - Submit button. After submit: success message; no status/resolution/history shown to member.

7. **Profile (Edit profile)**  
   - **Your details:** First name, Last name (editable); **Email** (read-only, with note that email change is separate). Save button.  
   - **Change password:** Short blurb; button “Send me a link to change my password” (same flow as forgot password; after reset, user is logged out and sees message on login).  
   - **Request email change:** New email input + “Request email change.” Message: “Check your current email for an approval link.” (No approval flow in prototype; just show the copy.)  
   - **Household (read-only):** Member number, status, payment schedule, household name/address if available.

---

### C. Admin Portal (after login as admin)

**Layout (every admin page):**
- **Header:** Dark green (e.g. `#034d1a` or `#078930`). “SBMI Admin” or similar; nav: Dashboard, Members, Approvals, Reports; Sign out.
- **Main content:** Same max width and cream background convention as member portal.

**Pages:**

1. **Admin dashboard**  
   - Summary cards: Total members, Pending approvals (members), Pending claims, Payments recorded.  
   - Links: Members, Approvals (applications), Approvals (claims), Reports.

2. **Members**  
   - List/table: Name, Member #, Household, Status, Schedule.  
   - Action: Add member (opens form or modal).  
   - Add member form: First name, Last name, Email, Phone; optional “Create login account” with password. (No backend; show layout only.)

3. **Approvals**  
   - **Applications:** List of pending membership applications — name, email, phone, message. Buttons: Approve, Reject (no backend).  
   - **Claims:** List of pending claims — member, reason, amount, description. Buttons: Approve, Reject (no backend).

4. **Reports**  
   - Placeholder or simple text: “Admin reports (e.g. payments, members).” No specific report types required for prototype.

---

### D. Behavioural and UX notes

- **Roles:** One login; after 2FA, redirect to Member Dashboard or Admin Dashboard by role. Member never sees admin nav; admin never sees member “Manage family” or “Request assistance” in the member app.
- **Session:** “Stay logged in” = longer-lived session; otherwise session or 24h. Logout ends session immediately.
- **No CMS:** All copy and structure are fixed; no in-app content editing.
- **Bylaws:** Informational only; link out to PDF.
- **Payments:** Prototype shows layout and flow only; Stripe and webhooks are out of scope for Framer.
- **Assistance:** Submit sends notification to admins (email); member sees no status or resolution. Use the family dropdown for “someone else” (no name/phone/email fields).
- **Profile:** Email is read-only on profile; change is via separate “Request email change” and approval link (mock in prototype).

Use this to build **design-only** high-fidelity frames and flows in Framer for the Member Portal and Admin Portal (no backend, no real auth, no live data). Keep the one-pager style separate (see ONE-PAGER-STYLE-GUIDE.md for the public site palette).

**Design reference:** [Framer project (Portal designs)](https://framer.com/projects/Untitled--rrFRecxEae6GktEubyQj-3BSrJ?node=GFKtcZcw7) — Login and related frames.

**API key:** For programmatic access to Framer (e.g. to inspect layout/structure), set `FRAMER_API_KEY` in `.env` (see `.env.example`). Do not commit the key.
