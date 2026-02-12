# Spec: Profile

**SOW:** SOW (3) — Profile, US46–US50. This spec is the rule set for member profile viewing, editing, password change, and email change; no behavior beyond cited AC.

---

## 1. Product Summary (from SOW)

- **User roles:** Member.
- **Screens:** Profile screen (first name, last name, email); change password (same flow as reset); request email change (new email input); approve email change (secure link from confirmation email); confirmation screen after approval.
- **Flows:** View/edit first name and last name (save immediately, no approval); change password (existing reset logic → logout + message on login page); request email change → confirmation email to current address with approval link; approve via link → email updated, logout, confirm screen (future logins use new email); no history of prior emails.
- **Exclusions:** Approval workflow for name changes; history of name changes; history of email addresses; audit of email changes; notify administrators of email change (US50).

---

## 2. Functional Specification

### 2.1 UI States

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Profile loaded | Member on profile screen | Display first name, last name, email address | US46 |
| Edit name | Member edits first/last name and submits | Changes saved immediately upon submission; no approval workflow | US46 |
| Change password | Member selects change password | Same logic and flow as existing password reset; no additional strength rules | US47 |
| After password change | Success | User logged out automatically; login page shows message explaining why they were logged out | US47 |
| Request email change | Member enters new email | Validate format only; do not change email immediately; send confirmation email to **existing** email address | US48 |
| Approve email change | Member clicks secure link in confirmation email | Route to system to confirm approval; upon approval update email to new value; show confirmation screen (new email, future logins must use it, recommend log out and log back in); old email stops working immediately; user logged out automatically; login page shows message explaining why logged out | US49 |
| Email change data | — | No history of previous email addresses; no log/audit of email changes; previous emails may be reused by other accounts; no notification to administrators | US50 |

### 2.2 Validation Rules

- **Name:** First name and last name editable; saved on submission. (US46.)
- **New email (change request):** Valid email format only. (US48.)
- **Password change:** Same as existing reset (e.g. 8-char minimum); no additional strength rules. (US47.)

### 2.3 Error States

- Invalid email format on request: validation error. (US48.)
- No other error states specified (e.g. approval link expired, duplicate new email).

### 2.4 Edge Cases

- **Approval link expiration:** Not specified. [UNSPECIFIED – REQUIRES PRODUCT DECISION]
- **New email already in use:** Not specified. [UNSPECIFIED – REQUIRES PRODUCT DECISION]

### 2.5 Explicit Inclusions

- Profile displays first name, last name, email. (US46.)
- Member may edit first name and last name; save immediately; no approval; no historical tracking of name changes. (US46.)
- Option to change password; same logic/flow as existing password reset; no extra strength rules. (US47.)
- Successful password change → logout automatically; login page message explaining why logged out. (US47.)
- Option to request email change; member enters new email; format validated; no immediate change; confirmation email sent to existing email. (US48.)
- Confirmation email contains secure approval link. (US49.)
- Clicking link → confirm approval → update email to new value; confirmation screen (new email, future logins use it, recommend log out and back in); old email stops working immediately; logout automatically; login page message. (US49.)
- No retention of previous email addresses; no log/audit of email changes; previous emails may be reused; no notify admins; handling limited to approval and replacement. (US50.)

### 2.6 Explicit Exclusions

- Approval workflow for name changes. (US46.)
- Historical tracking of name changes. (US46.)
- Additional password strength rules beyond those already defined. (US47.)
- History of previous email addresses. (US50.)
- Log or audit of email address changes. (US50.)
- Notify administrators of email change. (US50.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **User:** firstName, lastName, email (plain); no history table for email or name.
- **Email change request (if stored):** token, userId, newEmail, createdAt; consumed on approval; no retention of old email in history.

### 3.2 Required Tables

- User (firstName, lastName, email). Optional: EmailChangeRequest (token, userId, newEmail, expiresAt?) for approval flow; no EmailHistory or AuditLog for email changes.

### 3.3 API Endpoints

- GET/PATCH profile (view/update first name, last name).
- POST profile/change-password (same as reset flow; then invalidate sessions).
- POST profile/request-email-change (body: newEmail; send confirmation to current email).
- GET profile/approve-email-change?token= (consume token, update email, invalidate sessions, redirect to confirmation screen then login with message).

### 3.4 Background Jobs

- Send confirmation email to current address when email change is requested. (US48.)

### 3.5 External Integrations

- Email delivery for confirmation (and approval link).

### 3.6 Security Boundaries

- All profile actions scoped to logged-in member; secure approval link (single-use token); old email invalid for login immediately after approval. (US49, US50.)

---

## 4. SOW Citation Index (SOW 3)

- US46: Viewing and editing profile — first name, last name, email displayed; edit first/last name; save immediately; no approval; no history of name changes.
- US47: Changing password — same as reset flow; logout on success; login page message.
- US48: Requesting email change — option on profile; enter new email; validate format; no immediate change; send confirmation to existing email.
- US49: Approving email change — secure link in email; confirm → update email; confirmation screen; old email stops working; logout; login page message.
- US50: Email change data — no history of previous emails; no log/audit; previous emails may be reused; no notify admins; approval and replacement only.
