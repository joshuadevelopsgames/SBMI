# Iddir Bylaws (Samuel Bete's Memorial Iddir) – Mermaid Diagrams

---

## 1. Organizational Structure

```mermaid
flowchart TD
    GA["General Assembly\n(Quorum: 2/3 members)\nMeets 3×/year"]

    GA -->|Elects / Monitors / Dismisses| EC["Executive Committee\n(2-year term, max 2 terms)"]
    GA -->|Elects / Monitors / Dismisses| AC["Advisory Council\n(5 members: 3 ex-exec + 2 new)\n3-year term"]
    GA -->|Elects / Monitors / Dismisses| AUD["Auditor"]

    EC --> CHAIR[Chairperson]
    EC --> SEC[Secretary]

    EC --> FRM["Finance & Resources\nManagement"]
    EC --> SACD["Social Affairs &\nCommunity Development"]
    EC --> AID["Aid Provision"]

    FRM --> TREAS[Treasurer]
    FRM --> ACCT[Accountant]
    FRM --> STORE[Store Administrator]

    SACD --> EVENTS["Social Events &\nEntertainment"]
    SACD --> PROG["Programs &\nServices"]
    SACD --> FUNERAL["Funeral Executive"]

    AID --> DON_ADMIN["Donations\nAdministration"]
    AID --> AID_DEL["Aid Delivery"]

    style GA fill:#8e44ad,color:#fff
    style EC fill:#4a90d9,color:#fff
    style AC fill:#e8a838,color:#fff
    style AUD fill:#5ba85b,color:#fff
    style CHAIR fill:#2c6fbb,color:#fff
    style SEC fill:#2c6fbb,color:#fff
```

---

## 2. Membership Lifecycle

```mermaid
flowchart TD
    ELIG{Eligibility Check}
    ELIG -->|Calgary or\nneighboring city| E1[Location ✓]
    ELIG -->|Age 18+| E2[Age ✓]
    ELIG -->|Accepts objectives\n& bylaws| E3[Agreement ✓]

    E1 & E2 & E3 --> APPLY[Submit Application\n+ Pay Registration Fee]

    APPLY --> FEE_TYPE{Membership Type}
    FEE_TYPE -->|Family / Full| FULL_FEE[100% Registration Fee]
    FEE_TYPE -->|Unmarried| PARTIAL_FEE["60% Registration Fee\n(+40% on status change)"]

    FULL_FEE & PARTIAL_FEE --> WAIT["Wait 3 Months"]
    WAIT --> ID_CARD["Receive ID Card\n→ Active Member"]

    ID_CARD --> ACTIVE[Active Member]

    ACTIVE --> EXIT{Exit Path}
    EXIT --> RESIGN[Voluntary Resignation]
    EXIT --> AUTO_TERM[Auto-Termination]
    EXIT --> EXPULSION[Termination / Expulsion]

    RESIGN --> WRITE_SEC["Written Notice\nto Secretary"]
    WRITE_SEC --> CHECK_48["Secretary checks within 48h\nReturns association property"]
    CHECK_48 --> RESIGN_ACCEPTED[Resignation Accepted]

    AUTO_TERM --> UNPAID["6 Months Unpaid\nContributions"]
    AUTO_TERM --> ABSENT["2 Consecutive GA Meetings\nAbsent Without Reason"]
    UNPAID & ABSENT --> TERMINATED[Membership Terminated]

    TERMINATED --> RETURN{Wishes to Return?}
    RETURN -->|Yes| EC_REVIEW["EC Reviews\nMay require full new-member\nprocess + registration fee"]

    EXPULSION --> BREACH["Bylaws Breach /\nThreat to Integrity /\nNo Cooperation with AC"]
    BREACH --> SPECIAL_MTG["Case Brought to\nSpecial Meeting"]
    SPECIAL_MTG --> EXPELLED[Expelled]

    subgraph Relocation["Relocation-Only Termination"]
        RELOC_RETURN["Rejoin: No registration fee\nEligible for 50% past contributions\n+ Certificate (EC implements)"]
    end

    style ELIG fill:#8e44ad,color:#fff
    style ACTIVE fill:#5ba85b,color:#fff
    style RESIGN_ACCEPTED fill:#e8a838,color:#fff
    style TERMINATED fill:#d94a4a,color:#fff
    style EXPELLED fill:#d94a4a,color:#fff
    style RELOC_RETURN fill:#4a90d9,color:#fff
```

---

## 3. Family Definition (for Membership & Benefits)

```mermaid
flowchart TD
    FAM["Family Definition\nfor Membership & Benefits"]

    FAM --> REL["Relationship:\nBlood / Marriage /\nAdoption / Legal Obligation"]
    FAM --> HOUSE["Same Household"]
    FAM --> LEGAL["All with Legal Status\nin Canada"]

    FAM --> CHILDREN["Parents + Children\n(incl. grand/adopted)\nUnder 25 & Unmarried"]
    FAM --> TEMP["Temporary Absence OK\n(Work / Education)"]

    FAM --> SEP["Separated Parents\nin Two Residences\n= One Family"]

    SEP --> OUTSIDE{One Parent Moves\nOutside Area?}
    OUTSIDE -->|Yes| CALGARY_SIDE["Only Calgary-side\nParent & Dependents\nContinue"]

    FAM --> DIVORCE["Divorce → Continuing Parent\nCompletes New Form"]

    FAM --> DEATH_SUPPORT["Death Support → Goes to\nFamily That Had the Death"]

    style FAM fill:#8e44ad,color:#fff
```

---

## 4. Aid (Funeral) Procedure

```mermaid
flowchart TD
    DEATH([Member Family Death\nin Calgary])

    DEATH --> NOTIFY["Notify Executive Committee"]

    NOTIFY --> FUNERAL_PAY["Association Pays\nFuneral Home Directly\n(Calgary Standard Rate Only)"]
    NOTIFY --> RECEPTION_PAY["Association Pays\nReception Provider Directly"]

    FUNERAL_PAY --> LAST_DAY["Last Day of Mourning"]
    RECEPTION_PAY --> LAST_DAY

    LAST_DAY --> SYMPATHY["Sympathy Support:\n$5 per Member Family"]
    SYMPATHY --> COLLECT["EC Collects by Monthly\nPayment Day After Funeral"]

    DEATH --> LOCATION{Funeral Location}

    LOCATION -->|In Calgary| STANDARD["Standard Procedure\n(as above)"]

    LOCATION -->|Outside Calgary| OUTSIDE["Same Amounts\n(Calgary Standard Rate)\nReception + Sympathy\nFuneral Cost Cover:\nMax 1 Week"]

    subgraph Visitor["Visitor Death at Member's Home"]
        V_DEATH["Visitor Dies at\nMember's Home"]
        V_SUPPORT["$15 per Member\nto Aggrieved Family\n+ Coordination / Commiseration"]
        V_REPORT{"Member Reported\nVisitor In/Out\nto EC in Writing?"}
        V_REPORT -->|Yes, Timely| V_SUPPORT
        V_REPORT -->|Late / No Report| V_NONE["No Support Provided"]
    end

    style DEATH fill:#d94a4a,color:#fff
    style FUNERAL_PAY fill:#4a90d9,color:#fff
    style RECEPTION_PAY fill:#4a90d9,color:#fff
    style SYMPATHY fill:#5ba85b,color:#fff
    style V_NONE fill:#999,color:#fff
```

---

## 5. Humanitarian Support (Health / Catastrophe)

```mermaid
flowchart TD
    APPLICANT([Applicant / Member])

    APPLICANT --> SUBMIT["Submit Written Case\nto EC with Evidence"]

    SUBMIT --> EC_ASSESS["EC Assesses Case"]

    EC_ASSESS --> TYPE{Type of Support}

    TYPE --> HEALTH["Health:\nUnable to Work Long-Term"]
    TYPE --> CATASTROPHE["Catastrophe / Accident:\nSerious Impact on Livelihood"]

    HEALTH --> CONFIRM_H{"Confirm:\nNo Other Income?"}
    CATASTROPHE --> CONFIRM_C{"Confirm:\nNo Other Income?"}

    CONFIRM_H -->|Yes| CONVINCED{EC Convinced?}
    CONFIRM_C -->|Yes| CONVINCED

    CONFIRM_H -->|No| DENIED[Application Denied]
    CONFIRM_C -->|No| DENIED

    CONVINCED -->|Yes| GA_SUBMIT["EC Takes Case to\nGeneral Assembly\nwith Documents"]
    CONVINCED -->|No| DENIED

    GA_SUBMIT --> GA_DECISION{GA Approves?}
    GA_DECISION -->|Yes| APPROVED["Approved\nGA Sets Amount\n(One-Time Only)"]
    GA_DECISION -->|No| DENIED

    APPROVED --> PRIORITY["Members Prioritized\nOver Non-Members"]

    style APPLICANT fill:#8e44ad,color:#fff
    style APPROVED fill:#5ba85b,color:#fff
    style DENIED fill:#d94a4a,color:#fff
    style PRIORITY fill:#e8a838,color:#fff
```

---

## 6. Income & Property

```mermaid
flowchart TD
    INCOME[Association Income]

    INCOME --> REG_FEE["Registration Fee\n(Set by Association;\nUnmarried = 60%)"]
    INCOME --> MONTHLY["Monthly Contribution: $20\n(Changeable by GA)"]
    INCOME --> FINES["Fines"]
    INCOME --> RENTALS["Rentals"]
    INCOME --> FUNDRAISE["Fundraising"]
    INCOME --> DONATIONS["Donations"]

    INCOME --> BORROW["Borrowing:\nSpecial Meeting Resolution\n+ Debentures"]

    PROPERTY[Association Property]
    PROPERTY --> ACQUIRE["Acquire by\nPurchase / Donation"]
    PROPERTY --> USE["Use for Objectives\n& Member Events"]
    PROPERTY --> DISPOSE["Sell / Mortgage /\nDevelop / Lease"]

    style INCOME fill:#4a90d9,color:#fff
    style PROPERTY fill:#5ba85b,color:#fff
```

---

## 7. Election Process

```mermaid
flowchart TD
    GA([General Assembly]) --> ELECT_COMM["GA Elects Ad Hoc\nElection Committee"]

    ELECT_COMM --> MEETING["Election Meeting Called"]

    MEETING --> QUORUM1{Quorum: 2/3\nPresent?}

    QUORUM1 -->|Yes| VOTE["Vote by Show of Hands\n(In-Person Only)"]
    QUORUM1 -->|No| POSTPONE["Postpone 1 Month"]

    POSTPONE --> MEETING2["Second Election Meeting"]
    MEETING2 --> QUORUM2["Those Present = Quorum\n(2/3 Majority Required)"]
    QUORUM2 --> VOTE

    VOTE --> RESULTS{Positions Filled}

    RESULTS --> EXEC["Executive Committee\n2-Year Term\nMax 2 Terms"]
    RESULTS --> SUB["Subcommittees\n3-Year Term\nMax 2 Terms"]

    subgraph Extraordinary["Extraordinary Elections"]
        EX1["EC Disagreement\n(Advisory Can't Resolve)"]
        EX2["EC Member\nMoves Away"]
        EX3["EC Too Few\nto Function"]
    end

    Extraordinary --> ELECT_COMM

    style GA fill:#8e44ad,color:#fff
    style VOTE fill:#4a90d9,color:#fff
    style EXEC fill:#5ba85b,color:#fff
    style SUB fill:#5ba85b,color:#fff
```

---

## 8. Decision Rules & Quorum Thresholds

```mermaid
flowchart TD
    DECISIONS["Decision Rules"]

    DECISIONS --> REG_GA["Regular GA Meeting"]
    DECISIONS --> EX_GA["Extraordinary Meeting"]
    DECISIONS --> EC_AC["EC & Advisory Council"]
    DECISIONS --> SUBCOMM["Subcommittees"]
    DECISIONS --> BYLAW["Bylaw Amendment"]

    REG_GA --> RG_Q["Quorum: 2/3 Members"]
    REG_GA --> RG_R["Resolution: 2/3 Majority"]

    EX_GA --> EX_Q["Quorum: 3/4 Members"]
    EX_GA --> EX_R["Resolution: 3/4 Majority"]

    EC_AC --> EA_Q["Quorum: 3 of 5"]

    SUBCOMM --> SC_Q["Quorum: 2 of 3"]

    BYLAW --> BY_N["Notice: 21 Days"]
    BYLAW --> BY_M["Special Meeting Required"]
    BYLAW --> BY_V["Vote: 75%+ to Pass"]

    style DECISIONS fill:#8e44ad,color:#fff
    style REG_GA fill:#4a90d9,color:#fff
    style EX_GA fill:#e8a838,color:#fff
    style BYLAW fill:#d94a4a,color:#fff
```

---

## 9. Fines & Disciplinary Escalation

```mermaid
flowchart TD
    OFFENSE([Offense Committed])

    OFFENSE --> TYPE{Offense Type}

    TYPE --> MINOR["Minor Infractions"]
    TYPE --> SERIOUS["Serious Infractions"]
    TYPE --> CRIMINAL["Criminal Acts"]

    MINOR --> MISS_MTG["Miss Meeting: $5"]
    MINOR --> LATE_CONTRIB["Late Contribution: $5"]
    MINOR --> MISS_FUNERAL["Miss Funeral /\nAssigned Duties / Reports"]

    MISS_FUNERAL --> ESCALATION["Escalation by EC\n(Progressive Discipline)"]

    SERIOUS --> DEFAMATION["Defamation"]
    DEFAMATION --> STEP1["Step 1: Reproach"]
    STEP1 --> STEP2["Step 2: Written Warning"]
    STEP2 --> STEP3["Step 3: GA Final Decision"]

    CRIMINAL --> FRAUD["Fraud / Embezzlement /\nMisappropriation"]
    FRAUD --> COURT["Referred to Court"]

    style OFFENSE fill:#8e44ad,color:#fff
    style MINOR fill:#e8a838,color:#fff
    style SERIOUS fill:#d94a4a,color:#fff
    style CRIMINAL fill:#800,color:#fff
    style COURT fill:#800,color:#fff
```

---

## 10. Visitor at Member's Home – Support Eligibility

```mermaid
flowchart TD
    VISITOR([Visitor Stays at\nMember's Home])

    VISITOR --> REPORT_IN["Member Must Report\nVisitor to EC in Writing\n(Length of Stay)"]

    REPORT_IN --> STAY[Visitor Stays]
    STAY --> REPORT_OUT["Member Must Report\nVisitor Departure\nto EC in Writing"]

    REPORT_OUT --> DEATH{Death Occurs\nWhile Visiting?}

    DEATH -->|Yes, Reported On Time| SUPPORT["Support: $15 per Member\n+ Coordination / Commiseration\n+ Seeing Off"]
    DEATH -->|Yes, Late/No Report| NO_SUPPORT["No Support Package\n(Article 7.4.1.10)"]
    DEATH -->|No| END([End])

    style SUPPORT fill:#5ba85b,color:#fff
    style NO_SUPPORT fill:#d94a4a,color:#fff
    style REPORT_IN fill:#e8a838,color:#fff
    style REPORT_OUT fill:#e8a838,color:#fff
```

---

## 11. Death Support – Child Over 25 & Divorce Cases

```mermaid
flowchart TD
    DEATH([Death in Member Family])

    DEATH --> WHO{Who Died?}

    WHO -->|Child Under 25\nor Standard Family| FULL["Full Financial Support\n(Funeral / Reception / Sympathy)\nPer GA Amounts"]

    WHO -->|Child Over 25| CHECK{EC Confirms:\nNot Own Family?\nWithin Iddir Area?}
    CHECK -->|Yes, No Own Family\nIn Area| HALF["50% Regular Financial Support\n+ Sympathy Card"]
    CHECK -->|Own Family or\nOutside Area| MESSAGE["Message of Sympathy\n+ Encourage Member Support\nOnly"]

    WHO -->|Divorce: Two Residences| REP["Family Provides Representative\nto Coordinate with Association"]
    REP --> ONE_REQ["One Parent Can Request\nSupport (7.4.1.4)"]
    ONE_REQ --> NO_AGREE{Agreement\nBetween Parents?}
    NO_AGREE -->|No| SPLIT["Support Divided Equally\n(7.1.3 & 7.4.1.7)"]
    NO_AGREE -->|Yes| FULL

    style FULL fill:#5ba85b,color:#fff
    style HALF fill:#e8a838,color:#fff
    style MESSAGE fill:#999,color:#fff
    style SPLIT fill:#4a90d9,color:#fff
```

---

## 12. Meeting Notice & Call Rules

```mermaid
flowchart TD
    MEETING[Meeting Type]

    MEETING --> REGULAR[Regular General Meeting]
    MEETING --> EXTRA[Extraordinary Meeting]
    MEETING --> URGENT[Urgent Meeting]

    REGULAR --> R_CALL["Call + Agenda\n≥ 14 Days Before"]
    EXTRA --> E_CALL["Call + Agenda\n≥ 21 Days Before"]
    URGENT --> U_CALL["Notification\n≥ 1 Week"]

    R_CALL --> CHANNELS["Phone / Email /\nOther Convenient Methods"]
    E_CALL --> CHANNELS
    U_CALL --> CHANNELS

    style MEETING fill:#8e44ad,color:#fff
    style REGULAR fill:#4a90d9,color:#fff
    style EXTRA fill:#e8a838,color:#fff
    style URGENT fill:#d94a4a,color:#fff
```

---

## 13. Resignation Flow (Secretary 48h Check)

```mermaid
flowchart TD
    MEMBER([Member Wishes to Resign])

    MEMBER --> WRITE[Submit Written Resignation\nto Secretary\n(Mail / Email / In Person)]

    WRITE --> T0[Receipt by Secretary]
    T0 --> T48[Within 48 Hours]

    T48 --> CHECK{Association Property\nin Member's Possession?}

    CHECK -->|Yes| RETURN[Secretary Ensures\nProperty Returned]
    CHECK -->|No| ACCEPT[Resignation Accepted]

    RETURN --> ACCEPT

    style MEMBER fill:#8e44ad,color:#fff
    style ACCEPT fill:#5ba85b,color:#fff
```
