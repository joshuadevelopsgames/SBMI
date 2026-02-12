# Spec: Request Assistance

**SOW:** SOW (3) — Request Assistance, US51. This spec is the rule set for the Request Assistance screen and flow; no behavior beyond cited AC.

---

## 1. Product Summary (from SOW)

- **User roles:** Member.
- **Screens:** Dedicated Request Assistance screen: select “for myself” or “for someone else”; for self: dropdown of family members + “Manage Family” link; for other: name field + phone field; in both cases: text area for description; submit.
- **Flows:** Access from member area → select for self or other → (if self) select family member or go to Manage Family and return; (if other) enter name and phone (no validation that person exists); enter description (free-form) → submit → notification to all designated administrators with details and request type; no status/resolution/history or admin responses shown to member.
- **Exclusions:** Validation that named person exists; display of admin responses/decisions/outcomes; request status/resolution/history for member; eligibility/entitlement checks (US51).

---

## 2. Functional Specification

### 2.1 UI States

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| Screen load | Member on Request Assistance | Prompt to select: “Requesting assistance for myself” or “Requesting assistance for someone else” | US51 |
| For myself | Option selected | Dropdown list of family members associated with member account; member selects family member; “Manage Family” link (navigates to Family section); member can return to Request Assistance after managing family | US51 |
| For someone else | Option selected | Single text field for name of person needing assistance; second field for phone number of that person; no validation that person exists in system | US51 |
| Description | Both cases | Text area: describe what is happening and what type of assistance is required; free-form text only | US51 |
| Submit | Form submitted | Notification sent to all users designated as administrators; notification includes submitted details and request type | US51 |
| After submit | — | System does not display administrator responses, decisions, or outcomes to member; does not track request status, resolution, or history for member | US51 |

### 2.2 Validation Rules

- **For other:** Name and phone fields; no validation that named person exists. (US51.)
- **Description:** Free-form text; no format specified beyond “describe what is happening and what type of assistance is required.”

### 2.3 Error States

- No specific error states defined (e.g. required fields, submit failure). [UNSPECIFIED – REQUIRES PRODUCT DECISION for required vs optional fields]

### 2.4 Edge Cases

- **No family members (for myself):** Dropdown may be empty; “Manage Family” allows adding then returning. (US51.)
- **“Designated as administrators”:** Who receives the notification (role, list, or config) not defined. [UNSPECIFIED – REQUIRES PRODUCT DECISION]
- **Notification channel:** Email, in-app, or both not specified. [UNSPECIFIED – REQUIRES PRODUCT DECISION]

### 2.5 Explicit Inclusions

- Dedicated Request Assistance screen accessible from member area. (US51.)
- Select one of: Requesting assistance for myself | Requesting assistance for someone else. (US51.)
- For myself: dropdown of family members; select one; “Manage Family” link → Family section; can return to Request Assistance. (US51.)
- For someone else: one text field (name of person needing assistance); one field (phone number for that person); no validation that person exists. (US51.)
- In both cases: text area for description (what is happening, what type of assistance required); free-form text only. (US51.)
- Submit → notification to all designated administrators; includes submitted details and request type. (US51.)
- No display of admin responses, decisions, or outcomes to member; no request status, resolution, or history for member. (US51.)
- Assistance requests informational only; no approval, eligibility, or entitlement check; evaluation/decision/follow-up outside system per bylaws. (US51.)

### 2.6 Explicit Exclusions

- Validation that named person exists. (US51.)
- Display of administrator responses, decisions, or outcomes. (US51.)
- Request status, resolution, or history for member. (US51.)
- Eligibility or entitlement checks. (US51.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **AssistanceRequest (or equivalent):** memberId, requestType (SELF | OTHER), familyMemberId? (if self), otherName?, otherPhone?, description, createdAt; optional: id for admin reference. No status/resolution/history exposed to member.
- Family members already in FamilyMember table; dropdown sourced from there.

### 3.2 Required Tables

- AssistanceRequest (or similar): memberId, requestType, familyMemberId?, otherName?, otherPhone?, description, createdAt. Optional: notifiedAdminIds or notification log for “sent to all designated administrators.”

### 3.3 API Endpoints

- GET request-assistance (or page load): return family members for dropdown if “for myself.”
- POST request-assistance: body { requestType, familyMemberId?, otherName?, otherPhone?, description }; create record; send notification to all designated administrators.

### 3.4 Background Jobs

- Optional: job to send notification (email/in-app) to administrators when request is submitted; or synchronous send on POST.

### 3.5 External Integrations

- Email or in-app notification to administrators; “designated as administrators” source [UNSPECIFIED].

### 3.6 Security Boundaries

- Only logged-in member can submit; request associated with memberId; no access to other members’ requests; administrators receive notification per SOW (admin implementation out of scope in this spec).

---

## 4. SOW Citation Index (SOW 3)

- US51: Requesting assistance — dedicated screen; select for self or other; for self: family dropdown + Manage Family link; for other: name + phone (no existence validation); description text area (free-form); submit → notify all designated admins with details and type; no responses/status/resolution/history to member; informational only, no eligibility check.
