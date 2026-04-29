# Spec: Family Management

**SOW:** SOW (3) — Family Management, US25–US30.  
**Amendment (2026-02-19):** Add/remove household-member actions now require admin approval before changes are applied.

---

## 1. Product Summary (from SOW)

- **User roles:** Member.
- **Screens:** Family Members screen (list + Add / Edit / Delete + pending approval requests).
- **Flows:** View list; request Add (full name, birth date; age ≤25 at request entry); Edit (e.g. birth date); request Delete (with confirmation); admin approves add/remove requests.
- **System states:** Per member: eligible (≤25) or greyed-out inactive (>25); pending add/remove requests; no auto-removal.
- **Exclusions:** Benefit approval, entitlement calculation, age overrides, archival/recovery, enforcement.

---

## 2. Functional Specification

### 2.1 UI States

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| List | Screen loaded | List of family members; Add, Edit, Delete actions | US25 |
| Member ≤25 | Current age ≤25 | Normal display; current age shown | US26, US27 |
| Member >25 | Current age >25 (after being added when ≤25) | Greyed-out, inactive style; name and birth date visible; italic note that age now invalidates eligibility for Iddir benefits | US27 |
| Add form | Adding | Fields: full name, birth date (required, valid calendar date); age calculated; block add if age >25 at request entry; submit as pending admin approval request | US26 (amended) |
| Edit form | Editing | Can edit birth date; save; age recalculated | US28 |
| Delete | Confirm step | Deletion request requires confirmation; submit as pending admin approval request | US29 (amended) |
| Pending requests | Request submitted | Show submitted add/remove requests awaiting admin decision | Amendment |

### 2.2 Validation Rules

- **Birth date:** Required; valid calendar date. (US26, US28.)
- **Add:** System calculates age from birth date; prevent adding if age >25 at time of entry. Clear validation message if over limit. No overrides or exceptions. (US26.)
- **Edit:** Birth date editable; age recalculated on save. (US28.)

### 2.3 Error States

- Add: clear validation message when age exceeds 25. (US26.)
- Add/remove: clear error when duplicate pending request already exists.
- No other error states specified (e.g. save failure, duplicate name).

### 2.4 Edge Cases

- **Marital status:** Bylaw reference mentions “age and marital status” (US30); no field or logic for marital status in AC. [UNSPECIFIED – REQUIRES PRODUCT DECISION]
- **“Family” definition:** Aligns with Article 2.5; no system enforcement of who counts as family beyond age at entry. (US25, US26.)
- **Over 25 after entry:** Display only; no automatic removal, no notification to admins, no benefit enforcement. (US27.)
- **Pending remove request:** Member remains visible until admin approval is completed.

### 2.5 Explicit Inclusions

- Dedicated Family Members screen from member dashboard. (US25.)
- List of family members; Add, Edit, Delete actions. (US25.)
- Add: full name, birth date; age calculated; block age >25 at request entry; submit pending admin approval request; validation message. (US26, amended.)
- Display current age; when >25 show greyed-out + italic note; do not auto-remove. (US27.)
- Edit birth date; save; recalculate age. (US28.)
- Delete with confirmation; submit pending admin approval request; remove from view only after approval. (US29, amended.)
- Brief bylaw reference (age and marital status); informational only. (US30.)

### 2.6 Explicit Exclusions

- Benefit approval, entitlement calculation, eligibility decisions. (US25.)
- Overrides or exceptions for age at entry. (US26.)
- Automatic removal when >25; enforcement or admin notification. (US27.)
- Historical tracking requirements beyond request status and approval decision metadata.
- Archival or recovery after approved deletion. (US29.)
- System interpretation, enforcement, or adjudication of bylaws. (US30.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **Family member:** full name, birth date; association to member (user) account. Current age derived (not necessarily stored).
- Optional: flag or computed “isEligibleByAge” for display (≤25 vs >25).
- **Family member change request:** memberId, action (ADD/REMOVE), status (PENDING/APPROVED/REJECTED), fullName, birthDate snapshot, optional familyMemberId (for remove), processed metadata.

### 3.2 Required Tables

- FamilyMember (or equivalent): memberId (FK to user), fullName, birthDate; scoped to logged-in member only.
- FamilyMemberChangeRequest: tracks member-submitted add/remove requests requiring admin decision before data mutation.

### 3.3 API Endpoints

- GET family-members → list for current member (with current age / eligibility display state).
- POST family-members → submit add request (full name, birth date); validate age ≤25; return pending-request confirmation or error.
- PATCH family-members/:id → update (e.g. birth date); recalculate age.
- DELETE family-members/:id → submit remove request with confirmation; return pending-request confirmation or error.
- GET family-member-change-requests → list pending add/remove requests for current member.
- POST admin/family-member-change-requests/:id/decision → approve/reject pending request; on approve apply add/remove mutation.

### 3.4 Background Jobs

- None.

### 3.5 External Integrations

- None.

### 3.6 Security Boundaries

- All operations scoped to current member; no access to other members’ family records. (US25, Member Dashboard US24.)

---

## 4. SOW Citation Index

- US25: Family Members screen — dedicated screen, list, Add/Edit/Delete, informational only, Article 2.5.
- US26: Adding with age validation — full name, birth date, age calculated, block >25, message, no overrides, Article 2.5.3; add request requires admin approval (amendment).
- US27: Age-based status — current age; >25 greyed-out, italic note; no auto-remove, no enforcement.
- US28: Editing — edit birth date, save, recalculate; no history/audit/approval.
- US29: Deleting — confirm, submit remove request, remove from view after admin approval; no archival/recovery.
- US30: Bylaw context — brief reference, age and marital status; informational only.
