# Phase 08: Concurrency & Locking

## Overview

Multiple users accessing the same data creates **race conditions**. This phase implements check-in/check-out locking to prevent conflicts.

> **Concurrent access without locking leads to data corruption.**

---

## The Problem

### Without Locking

```
User A reads Part ──────┐
                        │
User B reads Part ──────┼──┐
                        │  │
User A saves changes ───┘  │   User B's changes overwrite A's!
                           │
User B saves changes ──────┘
```

### With Locking

```
User A checks out Part ─────┐
                            │  User B sees "Locked by User A"
User B tries to edit ───────X  (blocked)
                            │
User A saves and checks in ─┘
                            
User B can now edit ────────→
```

---

## What You Will Build

- Locking mechanism for Parts
- Lock ownership and expiration
- Force-unlock for administrators
- UI indicators for locked status

---

## Domain Model Update

```
┌──────────────────────┐
│     PartLock         │
├──────────────────────┤
│ - part_id (FK)       │
│ - locked_by          │
│ - locked_at          │
│ - expires_at         │
│ - reason             │
└──────────────────────┘
```

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Concurrency Problems](./01-concurrency-problems.md) | 30 min |
| 2 | [Locking Strategies](./02-locking-strategies.md) | 30 min |
| 3 | [Lock Entity & Repository](./03-lock-implementation.md) | 60 min |
| 4 | [Lock Service](./04-lock-service.md) | 45 min |
| 5 | [UI Lock Indicators](./05-lock-ui.md) | 30 min |

---

## Locking Invariants

| Invariant | Enforcement |
|-----------|-------------|
| Only one lock per Part | Database constraint |
| Lock must have owner | Domain validation |
| Lock must expire | Default expiration |
| Owner can always unlock | Service logic |

---

## Verification Checklist

After this phase:

- [ ] Can check out a Part
- [ ] Checked-out Part blocks other users
- [ ] Owner can check in
- [ ] Locks expire automatically
- [ ] Admin can force unlock

---

## Next Phase

[Phase 09: Revision Control →](../09-revision-control/README.md)
