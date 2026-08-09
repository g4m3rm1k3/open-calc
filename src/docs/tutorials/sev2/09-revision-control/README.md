# Phase 09: Revision Control

## Overview

Manufacturing data must be versioned. This phase adds **revision tracking** so changes can be audited and rolled back.

> **In manufacturing, knowing what changed and when can be a legal requirement.**

---

## What You Will Build

- Revision entity with major.minor versioning
- History of all Part changes
- Diff generation between revisions
- Rollback capability

---

## Domain Model Update

```
┌──────────────────────┐
│   Part               │
│   └─► Revisions[]    │
│                      │
│   ┌──────────────────┤
│   │  Revision        │
│   ├──────────────────┤
│   │ - id             │
│   │ - part_id        │
│   │ - major          │
│   │ - minor          │
│   │ - snapshot       │
│   │ - changed_by     │
│   │ - changed_at     │
│   │ - change_reason  │
│   └──────────────────┘
```

---

## Versioning Rules

| Scenario | Version Change |
|----------|---------------|
| Minor edit (description) | 1.0 → 1.1 |
| Major edit (name, status) | 1.1 → 2.0 |
| New Part | 1.0 |

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Why Versioning](./01-why-versioning.md) | 20 min |
| 2 | [Revision Entity](./02-revision-entity.md) | 45 min |
| 3 | [Snapshot Strategy](./03-snapshot-strategy.md) | 45 min |
| 4 | [Revision Service](./04-revision-service.md) | 45 min |
| 5 | [History UI](./05-history-ui.md) | 30 min |

---

## Verification Checklist

After this phase:

- [ ] Part changes create new revisions
- [ ] Can view revision history
- [ ] Can view specific revision
- [ ] Can diff between revisions
- [ ] Version numbers increment correctly

---

## Next Phase

[Phase 10: Workflows & Governance →](../10-workflows-governance/README.md)
