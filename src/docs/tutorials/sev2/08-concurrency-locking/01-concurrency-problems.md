# Tutorial 1: Concurrency Problems

## Introduction

When multiple users access the same data simultaneously, **race conditions** can corrupt data. This tutorial explains the problems and solutions.

---

## Part 1: The Race Condition Problem

### 1.1 Scenario: Lost Update

**Two users edit the same Part simultaneously:**

```
Time    User A                      User B
----    ------                      ------
T1      Read Part (name="Widget")   
T2                                  Read Part (name="Widget")
T3      Change name to "Gadget"     
T4                                  Change description to "New desc"
T5      Save Part (name="Gadget")   
T6                                  Save Part (description="New desc")
                                    ← OVERWRITES name back to "Widget"!
```

**Result:** User A's change is lost!

### 1.2 Why This Happens

Without concurrency control:
1. Both users read the same state
2. Both make changes in memory
3. Last write wins, overwriting earlier changes

### 1.3 Real-World Consequences

| Scenario | Consequence |
|----------|-------------|
| Lost update | User work disappears |
| Inconsistent read | User sees partial state |
| Write skew | Business rules violated |

---

## Part 2: Concurrency Control Strategies

### 2.1 Strategy Comparison

| Strategy | How It Works | Use When |
|----------|--------------|----------|
| **Optimistic** | Detect conflicts at save time | Conflicts rare |
| **Pessimistic** | Lock before editing | Conflicts common |
| **Check-in/out** | Explicit lock ownership | Long edits, few users |

### 2.2 Our Choice: Check-in/Check-out

For PartFlow, we use **explicit locking** because:
- Manufacturing data edits take time
- Users need to know if someone else is editing
- Clear ownership prevents confusion

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Check     │────▶│    Edit      │────▶│   Check      │
│     Out      │     │    Part      │     │    In        │
└──────────────┘     └──────────────┘     └──────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
   Part locked       Only owner can edit    Lock released
```

---

## Part 3: Lock Requirements

### 3.1 Domain Requirements

| Requirement | Reason |
|-------------|--------|
| Only one lock per Part | Prevent conflicts |
| Lock has owner | Know who has it |
| Lock has expiration | Prevent abandoned locks |
| Owner can unlock | Release when done |
| Admin can force unlock | Handle emergencies |

### 3.2 Lock States

```
┌─────────────┐
│  Unlocked   │
└──────┬──────┘
       │ check_out
       ▼
┌─────────────┐
│   Locked    │──── auto-expire ────┐
└──────┬──────┘                     │
       │ check_in                   │
       ▼                            │
┌─────────────┐◀────────────────────┘
│  Unlocked   │
└─────────────┘
```

---

## Part 4: Design Decisions

### 4.1 Lock Storage

| Option | Pros | Cons |
|--------|------|------|
| Field on Part | Simple | Couples lock to entity |
| **Separate Lock entity** | Clean separation | Extra table |
| In-memory only | Fast | Lost on restart |

**Decision:** Separate Lock entity for clean separation.

### 4.2 Lock Duration

| Duration | Use Case |
|----------|----------|
| 30 minutes | Quick edits |
| 2 hours | Normal work |
| 8 hours | Full day work |

**Default:** 2 hours with option to extend.

---

## Part 5: Invariants

### 5.1 Lock Invariants

| Invariant | Enforcement |
|-----------|-------------|
| At most one lock per Part | Database UNIQUE(part_id) |
| Lock must have owner | NOT NULL user_id |
| Lock expires automatically | Checked on access |
| Only owner can modify locked Part | Service layer |

### 5.2 Consequences of Violation

| Violation | Consequence |
|-----------|-------------|
| Multiple locks | Race condition returns |
| No owner | Can't release/extend |
| No expiration | Abandoned locks block forever |
| Anyone can edit locked | Defeats purpose |

---

## Summary

### Key Concepts

| Term | Meaning |
|------|---------|
| **Race condition** | Concurrent access causing bugs |
| **Lost update** | One user's changes overwritten |
| **Pessimistic locking** | Lock before edit |
| **Check-in/out** | Explicit lock ownership |
| **Lock expiration** | Auto-release abandoned locks |

### Next Steps

We will implement:
1. Lock entity
2. Lock repository
3. Lock service
4. UI indicators

---

## Next Tutorial

[Tutorial 2: Locking Strategies →](./02-locking-strategies.md)
