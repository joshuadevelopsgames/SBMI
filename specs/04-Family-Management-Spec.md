# Spec: Family Management

**SOW:** SOW (3) — Family Management, US25–US30. This spec is the rule set for the Family Members screen; no behavior beyond cited AC.

---

## 1. Product Summary (from SOW)

- **User roles:** Member.
- **Screens:** Family Members screen (list + Add / Edit / Delete).
- **Flows:** View list; Add (full name, birth date; age ≤25 at entry); Edit (e.g. birth date); Delete (with confirmation).
- **System states:** Per member: eligible (≤25) or greyed-out inactive (>25); no auto-removal.
- **Exclusions:** Benefit approval, entitlement calculation, age overrides, historical/audit/approval workflows, archival/recovery, enforcement.

---

## 2. Functional Specification

### 2.1 UI States

| State | Condition | Behavior | SOW |
|-------|-----------|----------|-----|
| List | Screen loaded | List of family members; Add, Edit, Delete actions | US25 |
| Member ≤25 | Current age ≤25 | Normal display; current age shown | US26, US27 |
| Member >25 | Current age >25 (after being added when ≤25) | Greyed-out, inactive style; name and birth date visible; italic note that age now invalidates eligibility for Iddir benefits | US27 |
| Add form | Adding | Fields: full name, birth date (required, valid calendar date); age calculated; block add if age >25 at entry | US26 |
| Edit form | Editing | Can edit birth date; save; age recalculated | US28 |
| Delete | Confirm step | Deletion requires confirmation; then remove from view | US29 |

### 2.2 Validation Rules

- **Birth date:** Required; valid calendar date. (US26, US28.)
- **Add:** System calculates age from birth date; prevent adding if age >25 at time of entry. Clear validation message if over limit. No overrides or exceptions. (US26.)
- **Edit:** Birth date editable; age recalculated on save. (US28.)

### 2.3 Error States

- Add: clear validation message when age exceeds 25. (US26.)
- No other error states specified (e.g. save failure, duplicate name).

### 2.4 Edge Cases

- **Marital status:** Bylaw reference mentions “age and marital status” (US30); no field or logic for marital status in AC. [UNSPECIFIED – REQUIRES PRODUCT DECISION]
- **“Family” definition:** Aligns with Article 2.5; no system enforcement of who counts as family beyond age at entry. (US25, US26.)
- **Over 25 after entry:** Display only; no automatic removal, no notification to admins, no benefit enforcement. (US27.)

### 2.5 Explicit Inclusions

- Dedicated Family Members screen from member dashboard. (US25.)
- List of family members; Add, Edit, Delete. (US25.)
- Add: full name, birth date; age calculated; block age >25 at entry; validation message. (US26.)
- Display current age; when >25 show greyed-out + italic note; do not auto-remove. (US27.)
- Edit birth date; save; recalculate age; no historical/audit/approval. (US28.)
- Delete with confirmation; remove from view; no archival/recovery. (US29.)
- Brief bylaw reference (age and marital status); informational only. (US30.)

### 2.6 Explicit Exclusions

- Benefit approval, entitlement calculation, eligibility decisions. (US25.)
- Overrides or exceptions for age at entry. (US26.)
- Automatic removal when >25; enforcement or admin notification. (US27.)
- Historical tracking, audit logs, approval workflows. (US28.)
- Archival, recovery, administrator review of deletions. (US29.)
- System interpretation, enforcement, or adjudication of bylaws. (US30.)

---

## 3. Technical Specification

### 3.1 Data Models and Fields

- **Family member:** full name, birth date; association to member (user) account. Current age derived (not necessarily stored).
- Optional: flag or computed “isEligibleByAge” for display (≤25 vs >25).

### 3.2 Required Tables

- FamilyMember (or equivalent): memberId (FK to user), fullName, birthDate; scoped to logged-in member only.

### 3.3 API Endpoints

- GET family-members → list for current member (with current age / eligibility display state).
- POST family-members → add (full name, birth date); validate age ≤25; return list or error.
- PATCH family-members/:id → update (e.g. birth date); recalculate age.
- DELETE family-members/:id → delete with confirmation; no soft-delete required by SOW.

### 3.4 Background Jobs

- None.

### 3.5 External Integrations

- None.

### 3.6 Security Boundaries

- All operations scoped to current member; no access to other members’ family records. (US25, Member Dashboard US24.)

---

## 4. SOW Citation Index

- US25: Family Members screen — dedicated screen, list, Add/Edit/Delete, informational only, Article 2.5.
- US26: Adding with age validation — full name, birth date, age calculated, block >25, message, no overrides, Article 2.5.3.
- US27: Age-based status — current age; >25 greyed-out, italic note; no auto-remove, no enforcement.
- US28: Editing — edit birth date, save, recalculate; no history/audit/approval.
- US29: Deleting — confirm, remove from view; no archival/recovery.
- US30: Bylaw context — brief reference, age and marital status; informational only.
