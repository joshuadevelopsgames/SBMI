# Spec: Member Dashboard (non-Admin)

**SOW:** SOW (3) — Member Dashboard (non-Admin), US14–US24. This spec is the rule set for the member dashboard, header, footer, and profile menu; no behavior beyond cited AC.

---

## 1. Product Summary (from SOW)

- **User roles:** Member (non-admin).
- **Screens:** Member dashboard; persistent header on all member pages (primary member nav links); profile icon with dropdown (edit profile, logout); footer on all member pages (nav summary, SBMI logo, mailto for assistance).
- **Flows:** Post-2FA → member dashboard; nav: Manage family, View reports (limited to Payment History for non-administrators), Bylaws PDF, Make payment, Request assistance, Change Profile information; header fixed; profile icon → dropdown → edit profile or logout; footer mirrors header nav.
- **Exclusions:** Admin features; role management; eligibility decisions; theme/customization; administrative workflows; other members’ data; governance (US24).

---

## 2. Functional Specification

### 2.1 UI States

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Loaded | Member authenticated | Welcome with first name; membership duration (from start date); next payment due date and amount; prominent “Make a Payment”; nav: Manage family, View reports (Payment History), Bylaws PDF, Make payment, Request assistance, Change Profile | US14–US18 |
| Payment status | — | Informational only; states (Overdue / Up to date / Paid ahead) and fields per Payments spec | US16, US32 |
| Cultural design | — | Three colors of Ethiopian flag; fixed layout and palette; decorative only | US17 |
| Header | All member pages | Persistent header; primary member navigation links only; no admin links; fixed layout, not configurable by member | US20 |
| Profile menu | Profile icon top-right | Selecting icon opens dropdown: link to edit profile, logout; no additional actions; logout ends session immediately | US21 |
| Footer | All member pages | Footer with summary of member nav links; mirrors header nav; no additional nav options; read-only, non-configurable | US22 |
| Footer branding | — | SBMI logo (decorative, not navigation); short text directing members to email SBMI for assistance; mailto link; no contact forms, chat, or ticketing | US23 |

### 2.2 Validation Rules

- No form validation on main dashboard; display only.

### 2.3 Error States

- No specific error states defined for dashboard. Auth/session errors per Login spec.

### 2.4 Edge Cases

- **Membership duration:** Calculated from “membership start date stored in the system.” (US15.) Source of start date not defined. [UNSPECIFIED – REQUIRES PRODUCT DECISION if multiple possible sources]
- **“View reports”:** For non-administrators limited to Payment History. (US18.)

### 2.5 Explicit Inclusions

- Role distinction at login; member routed to member dashboard. (US14.)
- Reduced options vs admin; no admin features visible/accessible. (US14.)
- Welcome message with member’s first name. (US15.)
- Text indicating how long member has been active (from membership start date). (US15.)
- Next payment due date and amount; prominent “Make a Payment”; payment option routes to payment area. (US16.)
- Payment status informational only; bylaw-aligned contribution concepts. (US16.)
- Three colors of Ethiopian flag; consistent; fixed layout and palette; no theme/customization. (US17.)
- Nav: Manage family members, View reports (limited to Payment History), Bylaws PDF, Make payment, Request assistance, Change Profile information; each routes to corresponding section. (US18.)
- Nav does not imply approval, eligibility, or entitlement; no admin workflows. (US18.)
- Bylaw references allowed; informational, read-only; no enforcement/interpretation. (US19.)
- Persistent header on all member pages; primary member nav links only; no admin links; fixed, not configurable. (US20.)
- Profile icon top-right; dropdown with edit profile link and logout; logout ends session immediately. (US21.)
- Footer on all member pages; nav summary mirroring header; no extra nav; read-only, non-configurable. (US22.)
- Footer: SBMI logo (decorative); text + mailto for assistance; no contact forms, chat, ticketing. (US23.)
- Members cannot access executive/finance/audit/admin tools, other members’ data, or governance actions. (US24.)

### 2.6 Explicit Exclusions

- Role management, role editing, permission configuration. (US14.)
- Eligibility decisions or interpretations of membership rights. (US15.)
- Theme selection, user customization, branding controls. (US17.)
- Administrative workflows, reviews, approvals. (US18.)
- System enforcement or adjudication of bylaws. (US19.)
- Administrator links or tools in header. (US20.)
- Additional actions/links in profile dropdown. (US21.)
- Additional navigation options in footer. (US22.)
- Contact forms, chat tools, ticketing in footer. (US23.)
- Access to other members’ data; governance (voting, disciplinary). (US24.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **User/Member:** first name, membership start date (for duration), role (member vs admin). Next payment due date and amount derived from Payments logic.

### 3.2 Required Tables

- User (or Member) with role, first name, membership start date. Payment-related data per Payments spec.

### 3.3 API Endpoints

- Dashboard data: next payment due, amount due, member name, membership start date, payment summary state. May be combined with Payments APIs or page load.

### 3.4 Background Jobs

- None specified for dashboard itself. Payment reminders per Payments spec.

### 3.5 External Integrations

- None.

### 3.6 Security Boundaries

- Route protection: member-only; role check; no access to admin routes or other members’ data. (US14, US24.)

---

## 4. SOW Citation Index (SOW 3)

- US14: Access and scope — role distinction, member route, reduced options, no admin features, no role management.
- US15: Welcome and status — first name, membership duration from start date, informational only, no eligibility decisions.
- US16: Payment status — next due date/amount, Make Payment prominent, routes to payment area, informational, bylaw-aligned.
- US17: Cultural design — Ethiopian flag colors, consistent, fixed layout/palette, decorative only.
- US18: Navigation — Manage family, View reports (Payment History for non-admin), Bylaws, Make payment, Request assistance, Change Profile; no approval/eligibility implication; no admin workflows.
- US19: Bylaw references — informational, read-only, no enforcement.
- US20: Global header — persistent on all member pages; primary member nav only; no admin links; fixed layout.
- US21: Profile menu — profile icon top-right; dropdown: edit profile, logout; logout ends session immediately.
- US22: Global footer — on all member pages; nav summary mirroring header; read-only, non-configurable.
- US23: Footer branding — SBMI logo (decorative); mailto for assistance; no forms/chat/ticketing.
- US24: Restrictions — no executive/finance/audit/admin, no other members’ data, no governance.
