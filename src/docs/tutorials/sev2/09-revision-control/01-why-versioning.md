# Tutorial 1: Why Versioning

## Introduction

Manufacturing data must be **versioned**. When a Part changes, you need to know what it looked like before, who changed it, and why.

> **In manufacturing, the question "What was this Part like last month?" must always be answerable.**

---

## Part 1: The Business Need

### 1.1 Legal and Compliance Requirements

| Industry | Requirement |
|----------|-------------|
| Aerospace | AS9100 - Full traceability |
| Medical | FDA 21 CFR Part 11 - Audit trails |
| Automotive | IATF 16949 - Document control |

Manufacturing software MUST track changes for compliance.

### 1.2 Practical Scenarios

| Scenario | Why Versioning Matters |
|----------|------------------------|
| Part failure | Which revision was used? |
| Customer complaint | What was shipped? |
| Process change | What did we do before? |
| Rollback needed | Go back to working version |
| Audit | Prove what happened when |

### 1.3 Questions Versioning Answers

1. What did this Part look like on date X?
2. Who made this change?
3. Why was it changed?
4. What exactly changed between versions?
5. Can we revert to a previous version?

---

## Part 2: Versioning Strategies

### 2.1 Strategy Comparison

| Strategy | How It Works | Pros | Cons |
|----------|--------------|------|------|
| **Overwrite** | Just update | Simple | No history |
| **Append-only log** | Never update, only insert | Complete history | Complex queries |
| **Snapshot** | Store complete state | Easy restore | Storage cost |
| **Delta** | Store only changes | Space efficient | Complex restore |
| **Hybrid** | Snapshot + delta | Balanced | More complex |

### 2.2 Our Choice: Snapshot

We use **full snapshots** because:
1. Easy to restore any version
2. Easy to understand
3. Storage is cheap
4. Manufacturing data isn't huge

---

## Part 3: Version Numbering

### 3.1 Semantic Versioning

| Version | Meaning | Example Change |
|---------|---------|----------------|
| 1.0 → 1.1 | Minor change | Description update |
| 1.1 → 2.0 | Major change | Name change, process change |

### 3.2 When to Increment

| Change Type | Version Change | Why |
|-------------|---------------|-----|
| Fix typo in description | Minor (1.0 → 1.1) | Cosmetic |
| Update name | Major (1.x → 2.0) | Significant |
| Change machine assignments | Major | Process impact |
| Add tool requirements | Major | Manufacturing impact |
| Update approval status | Minor | Administrative |

### 3.3 Revision vs Version

In manufacturing:
- **Revision** = External identifier (shown on drawings: Rev A, Rev B)
- **Version** = Internal tracking (1.0, 1.1, 2.0)

We track **both**.

---

## Part 4: Audit Trail Requirements

### 4.1 What Must Be Recorded

| Field | Description |
|-------|-------------|
| Who | User who made change |
| When | Timestamp of change |
| What | Full snapshot of state |
| Why | Reason for change (required) |

### 4.2 Audit Trail Invariants

| Invariant | Reason |
|-----------|--------|
| Revisions are immutable | History can't change |
| Every change has a reason | Compliance requirement |
| Timestamps are UTC | No timezone confusion |
| User is authenticated | Accountability |

---

## Part 5: Domain Model

### 5.1 Revision Entity

```
┌─────────────────────────────────────────────────┐
│                    Revision                      │
├─────────────────────────────────────────────────┤
│ id: UUID                    (internal)          │
│ part_id: UUID               (parent Part)       │
│ major: int                  (major version)     │
│ minor: int                  (minor version)     │
│ snapshot: JSON              (complete state)    │
│ changed_by: str             (user who changed)  │
│ changed_at: datetime        (when changed)      │
│ change_reason: str          (why changed)       │
│ external_revision: str      (Rev A, Rev B)      │
└─────────────────────────────────────────────────┘
```

### 5.2 Relationship to Part

```
Part (1) ────────── (*) Revision
  │                      │
  │                      ├── 1.0 (initial)
  │                      ├── 1.1 (minor fix)
  │                      ├── 2.0 (major change)
  │                      └── 2.1 (current)
  │
  └── current_revision_id ──► points to latest
```

---

## Part 6: Implementation Preview

### 6.1 Key Operations

| Operation | Description |
|-----------|-------------|
| create_revision | Save new version |
| get_revision | Get specific version |
| get_history | Get all versions |
| diff_revisions | Compare two versions |
| restore_revision | Create new from old |

### 6.2 NOT Rollback

We don't "rollback" - we **create a new revision from an old one**. History is always preserved.

```
Before "rollback":
1.0 → 1.1 → 2.0 (current, has problems)

After "restore to 1.1":
1.0 → 1.1 → 2.0 → 3.0 (content from 1.1)

History preserved. New revision created.
```

---

## Summary

### Key Concepts

| Concept | Meaning |
|---------|---------|
| **Versioning** | Track all changes over time |
| **Snapshot** | Store complete state |
| **Major/Minor** | Semantic version numbers |
| **Audit trail** | Who, when, what, why |
| **Immutable history** | Never delete revisions |

---

## Next Tutorial

[Tutorial 2: Revision Entity →](./02-revision-entity.md)
