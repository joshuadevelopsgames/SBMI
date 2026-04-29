# SBMI Member Portal RFP Response (Intoria) – Mermaid Diagrams

---

## 1. Project Phases

```mermaid
flowchart LR
    subgraph M1["Month 1"]
        A[Discovery & Design] --> B[Core Development Begins]
    end
    subgraph M2["Months 1–2"]
        B --> C[Core Development]
        C --> D[Financial & Logic Workflows]
    end
    subgraph M3["Month 3"]
        D --> E[Compliance & Security]
        E --> F[Reporting Module]
    end
    subgraph Launch["Launch Phase"]
        F --> G[Soft Launch]
        G --> H[Training & Knowledge Transfer]
        H --> I[Full Launch\nJuly 1, 2026]
    end

    style A fill:#4a90d9,color:#fff
    style B fill:#4a90d9,color:#fff
    style C fill:#5ba85b,color:#fff
    style D fill:#5ba85b,color:#fff
    style E fill:#e8a838,color:#fff
    style F fill:#e8a838,color:#fff
    style G fill:#d94a4a,color:#fff
    style H fill:#d94a4a,color:#fff
    style I fill:#8e44ad,color:#fff
```

---

## 2. User Roles & RBAC

```mermaid
flowchart TD
    RBAC[RBAC Permission Matrix]
    RBAC --> MR[Member Role]
    RBAC --> AR[Admin Role]

    MR --> M1[View/Update Profile]
    MR --> M2[View Household]
    MR --> M3[Pay Dues & Fees]
    MR --> M4[View Payment History]
    MR --> M5[Submit Claims]
    MR --> M6[View Claim Status]

    AR --> A1[Manage Members]
    AR --> A2[Approval Queue]
    AR --> A3[Configure Rules]
    AR --> A4[View Reports]
    AR --> A5[Waive Penalties]
    AR --> A6[Audit Logs Access]

    subgraph Permissions["Permission Matrix"]
        direction LR
        P1["Any Admin"] --- P2["Multiple Admins"]
        P2 --- P3["Specific Admin"]
    end
    A2 --> Permissions

    style RBAC fill:#8e44ad,color:#fff
    style MR fill:#4a90d9,color:#fff
    style AR fill:#d94a4a,color:#fff
```

---

## 3. Member Journey

```mermaid
flowchart TD
    START([New Member]) --> REG{Registration Method}
    REG -->|Online| SELF[Self-Registration Form]
    REG -->|By Admin| ADMIN_REG[Admin Creates Account]

    SELF --> PENDING[Pending Approval]
    ADMIN_REG --> ACTIVE[Active Member]
    PENDING --> APPROVE{Admin Reviews}
    APPROVE -->|Approved| ACTIVE
    APPROVE -->|Rejected| REJECTED[Registration Rejected\nReason Provided]

    ACTIVE --> LOGIN[Secure Login]
    LOGIN --> DASHBOARD[Member Dashboard]

    DASHBOARD --> PROFILE[View/Update Profile]
    DASHBOARD --> HOUSEHOLD[Manage Household]
    DASHBOARD --> PAYMENTS[Payment History]
    DASHBOARD --> CLAIMS[Claim Status]
    DASHBOARD --> PAY[Pay Dues/Fees]
    DASHBOARD --> RECEIPTS[View Receipts & Alerts]

    PAY --> STRIPE[Stripe Payment\nMonthly / Weekly / Bi-weekly]
    STRIPE --> RECEIPT_GEN[Receipt Generated]
    RECEIPT_GEN --> EMAIL_RECEIPT[Email Receipt Sent]

    style START fill:#8e44ad,color:#fff
    style ACTIVE fill:#5ba85b,color:#fff
    style REJECTED fill:#d94a4a,color:#fff
    style STRIPE fill:#635bff,color:#fff
```

---

## 4. Admin Approval Workflow

```mermaid
flowchart TD
    TRIGGER([New Item Enters Queue]) --> QUEUE[Approval Queue]

    QUEUE --> TYPE{Item Type}
    TYPE --> MEMBERSHIP[Pending Membership]
    TYPE --> CLAIM[Pending Claim]

    MEMBERSHIP --> RULE_CHECK{Check Configurable Rules}
    CLAIM --> RULE_CHECK

    RULE_CHECK --> ASSIGN{Assignment Rule}
    ASSIGN -->|Any Admin| ANY[Any Available Admin]
    ASSIGN -->|Multiple Admins| MULTI[Requires Multiple Approvals]
    ASSIGN -->|Specific Admin| SPEC[Assigned to Specific Admin]

    ANY --> REVIEW[Admin Reviews]
    MULTI --> REVIEW
    SPEC --> REVIEW

    REVIEW --> DECISION{Decision}
    DECISION -->|Approve| APPROVED[Approved ✓]
    DECISION -->|Reject| REJECTED[Rejected ✗\nReason Required]

    APPROVED --> LOG_A[Action Logged to Audit]
    REJECTED --> LOG_R[Action Logged to Audit]

    LOG_A --> NOTIFY_A[Notification Sent\nto Member]
    LOG_R --> NOTIFY_R[Notification Sent\nto Member]

    style TRIGGER fill:#8e44ad,color:#fff
    style APPROVED fill:#5ba85b,color:#fff
    style REJECTED fill:#d94a4a,color:#fff
    style LOG_A fill:#e8a838,color:#fff
    style LOG_R fill:#e8a838,color:#fff
```

---

## 5. Payment Flow

```mermaid
flowchart TD
    MEMBER([Member]) --> SCHEDULE[Set Payment Schedule\nMonthly / Weekly / Bi-weekly]
    SCHEDULE --> CALC[System Calculates Dues\nBased on Fee Categories & Rates]
    CALC --> RECURRING[Recurring Stripe Charge Created]

    RECURRING --> CHARGE{Charge Attempt}
    CHARGE -->|Success| RECEIPT[Receipt Generated]
    RECEIPT --> EMAIL[Email Receipt to Member]
    EMAIL --> RECORD[Payment Recorded in DB]

    CHARGE -->|Failed| MISSED[Missed Payment Detected]
    MISSED --> ALERT[Alert Sent to Member]
    MISSED --> LATE_FEE[Late Fee Applied\nPer Configurable Penalty Rules]

    LATE_FEE --> ADMIN_REVIEW{Admin Review}
    ADMIN_REVIEW -->|Waive| WAIVE[Penalty Waived\nLogged in Audit]
    ADMIN_REVIEW -->|Enforce| ENFORCE[Penalty Stands]

    ENFORCE --> RETRY[Next Scheduled Charge\nIncludes Late Fee]

    subgraph OUT_OF_SCOPE["Out of Base Scope"]
        CASH[Cash/Cheque Recording]
    end

    style MEMBER fill:#8e44ad,color:#fff
    style RECEIPT fill:#5ba85b,color:#fff
    style MISSED fill:#d94a4a,color:#fff
    style RECURRING fill:#635bff,color:#fff
    style CASH fill:#999,color:#fff
```

---

## 6. Payment Flow – Sequence Diagram

```mermaid
sequenceDiagram
    actor Member
    participant Portal as Member Portal
    participant Stripe
    participant DB as Database
    participant Admin
    participant Email as Email Service

    Member->>Portal: Set payment schedule
    Portal->>DB: Save schedule & calculate dues

    loop Recurring Payment Cycle
        Portal->>Stripe: Initiate charge
        alt Payment Successful
            Stripe-->>Portal: Payment confirmed
            Portal->>DB: Record payment
            Portal->>Email: Send receipt
            Email-->>Member: Payment receipt
        else Payment Failed
            Stripe-->>Portal: Payment failed
            Portal->>DB: Record missed payment
            Portal->>DB: Apply late fee
            Portal->>Email: Send missed payment alert
            Email-->>Member: Missed payment alert
            Portal->>Email: Notify admin
            Email-->>Admin: Missed payment notification
            Admin->>Portal: Review penalty
            alt Waive Penalty
                Admin->>Portal: Waive late fee
                Portal->>DB: Remove penalty & log action
            end
        end
    end
```

---

## 7. Claims / Benefits Flow

```mermaid
flowchart TD
    MEMBER([Member]) --> SUBMIT[Submit Claim\nWith Supporting Details]
    SUBMIT --> QUEUE[Claim Enters Approval Queue]

    QUEUE --> CONFIG{Approval Configuration}
    CONFIG -->|Single Approver| SINGLE[One Admin Reviews]
    CONFIG -->|Multi Approver| MULTI[Multiple Admins Review]

    SINGLE --> DECISION{Decision}
    MULTI --> ALL_APPROVE{All Approved?}
    ALL_APPROVE -->|Yes| DECISION
    ALL_APPROVE -->|No, Rejected by Any| CLAIM_REJECTED

    DECISION -->|Approve| CLAIM_APPROVED[Claim Approved ✓]
    DECISION -->|Reject| CLAIM_REJECTED[Claim Rejected ✗\nReason Provided]

    CLAIM_APPROVED --> RECORD[Record for Payment]
    CLAIM_APPROVED --> NOTIFY_M[Notify Member: Approved]
    CLAIM_REJECTED --> NOTIFY_R[Notify Member: Rejected]

    RECORD --> EXTERNAL[Payment Handled\nOutside System]

    subgraph OUT["Out of Scope"]
        CHEQUE[Cheque Issuance]
    end

    RECORD -.->|Not in system| OUT

    style MEMBER fill:#8e44ad,color:#fff
    style CLAIM_APPROVED fill:#5ba85b,color:#fff
    style CLAIM_REJECTED fill:#d94a4a,color:#fff
    style EXTERNAL fill:#e8a838,color:#fff
    style CHEQUE fill:#999,color:#fff
```

---

## 8. Data Architecture

```mermaid
flowchart TD
    subgraph AWS["AWS Calgary Region"]
        subgraph DB["MySQL Database"]
            T1[(Members)]
            T2[(Payments)]
            T3[(Claims)]
            T4[(Household / Family)]
            T5[(Roles)]
            T6[(User Accounts)]
            T7[(Audit Logs)]
        end

        subgraph Security["Security Layer"]
            ENC[Encrypted PII\nAES-256]
            HASH[Hashed Passwords\nbcrypt]
        end

        subgraph Backup["Backup Policy"]
            DAILY[Daily Automated Backups]
            RET[30-Day Retention]
        end
    end

    T1 --- T4
    T1 --- T2
    T1 --- T3
    T6 --- T5
    T6 --- T1

    DB --> Security
    DB --> Backup

    style AWS fill:#f0f0f0,color:#333
    style DB fill:#4a90d9,color:#fff
    style Security fill:#d94a4a,color:#fff
    style Backup fill:#5ba85b,color:#fff
```

---

## 9. Notification System

```mermaid
flowchart LR
    subgraph Triggers["Notification Triggers"]
        N1[Payment Reminder]
        N2[Payment Receipt]
        N3[Membership Renewal]
        N4[Claim Status Change]
        N5[New Registration]
        N6[Approval Needed]
    end

    subgraph Channels["Delivery Channels"]
        EMAIL[Email\nIncluded in Scope]
        SMS[SMS\nOptional / Extra Scope]
    end

    N1 --> EMAIL
    N2 --> EMAIL
    N3 --> EMAIL
    N4 --> EMAIL
    N5 --> EMAIL
    N6 --> EMAIL

    N1 -.->|Extra scope| SMS
    N2 -.->|Extra scope| SMS

    style EMAIL fill:#5ba85b,color:#fff
    style SMS fill:#999,color:#fff
```

---

## 10. Reporting Module

```mermaid
flowchart TD
    REPORTS[Reporting Dashboard]

    REPORTS --> FIN[Financial Reports]
    REPORTS --> MEM[Membership Reports]

    FIN --> F1[Contributions Summary]
    FIN --> F2[Payouts Summary]
    FIN --> F3[Member Statements]

    MEM --> M1[Active Member List]
    MEM --> M2[New / Left Members]
    MEM --> M3[Household Registry]
    MEM --> M4[Payment Status Report]

    subgraph Export["Export Formats"]
        CSV[CSV]
        PDF[PDF]
    end

    F1 --> Export
    F2 --> Export
    F3 --> Export
    M1 --> Export
    M2 --> Export
    M3 --> Export
    M4 --> Export

    style REPORTS fill:#8e44ad,color:#fff
    style FIN fill:#4a90d9,color:#fff
    style MEM fill:#5ba85b,color:#fff
```

---

## 11. Configurable Rules

```mermaid
flowchart TD
    CONFIG[Admin Settings Panel\nNo Code Changes Required]

    CONFIG --> FEE[Fee Categories]
    CONFIG --> CLAIM_R[Claim Reasons]
    CONFIG --> THRESH[Approval Thresholds\nBy Type or Amount]
    CONFIG --> CONTRIB[Contribution Rates]
    CONFIG --> PEN[Penalty Rules\nLate Fees & Waivers]

    FEE --> APPLY1[Applied to\nPayment Calculations]
    CLAIM_R --> APPLY2[Applied to\nClaim Submissions]
    THRESH --> APPLY3[Applied to\nApproval Workflows]
    CONTRIB --> APPLY4[Applied to\nDues Calculations]
    PEN --> APPLY5[Applied to\nMissed Payments]

    style CONFIG fill:#8e44ad,color:#fff
```

---

## 12. Out of Scope

```mermaid
flowchart TD
    OOS[Out of Scope\nfor MVP & v1.0]

    OOS --> O1[Full Accounting System]
    OOS --> O2[Cheque Issuance]
    OOS --> O3[QuickBooks Sync]
    OOS --> O4[Custom Report Builder]
    OOS --> O5[Template Manager]
    OOS --> O6[SSO Integration]
    OOS --> O7[Formal PIPEDA Certification]

    style OOS fill:#999,color:#fff
    style O1 fill:#ccc,color:#333
    style O2 fill:#ccc,color:#333
    style O3 fill:#ccc,color:#333
    style O4 fill:#ccc,color:#333
    style O5 fill:#ccc,color:#333
    style O6 fill:#ccc,color:#333
    style O7 fill:#ccc,color:#333
```

---

## 13. High-Level Solution Context

```mermaid
flowchart LR
    subgraph Users["Users"]
        MEMBERS[Members]
        ADMINS[Admins]
    end

    subgraph Portal["Web Portal\n(React/Vue + Node/Django)"]
        MEM_UI[Member Self-Service]
        ADMIN_UI[Admin Backend]
    end

    subgraph External["External"]
        STRIPE[Stripe\nPayments]
    end

    subgraph Backend["Backend"]
        DB[(MySQL\nAWS Calgary)]
    end

    MEMBERS --> MEM_UI
    ADMINS --> ADMIN_UI
    MEM_UI --> DB
    ADMIN_UI --> DB
    MEM_UI <--> STRIPE
    ADMIN_UI --> STRIPE

    style Portal fill:#4a90d9,color:#fff
    style DB fill:#5ba85b,color:#fff
    style STRIPE fill:#635bff,color:#fff
```

---

## 14. Month 1 Discovery Checklist

```mermaid
flowchart TD
    M1[Month 1: Discovery & Design]

    M1 --> DB_SCHEMA[Finalize DB Schema\n& System Architecture]
    M1 --> BYLAWS[Understand Bylaws\n& Workflow Possibilities]
    M1 --> DATA[Receive Membership Data\nfor Initial Transfer]
    M1 --> STRIPE_SETUP[SBMI Obtains & Sets Up\nStripe Account]
    M1 --> WIREFRAMES[Finalize UI/UX\nWireframes & Design]

    STRIPE_SETUP --> NOTE[If not done in Month 1\n→ Project Delayed]

    style M1 fill:#8e44ad,color:#fff
    style NOTE fill:#e8a838,color:#fff
```
