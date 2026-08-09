# Phase 10: Workflows & Governance

## Overview

Before adding CAM imports, we establish **workflows and governance**—rules that control how data moves through the system.

> **Governance ensures data quality and process compliance.**

---

## What You Will Build

- Approval workflows for Part changes
- State machine for Part lifecycle
- Audit logging
- Approval chains

---

## Domain Concepts

### Part Lifecycle State Machine

```
                    ┌──────────────┐
                    │    DRAFT     │
                    └──────┬───────┘
                           │ submit_for_approval
                           ▼
                    ┌──────────────┐
              ┌─────│   PENDING    │─────┐
              │     └──────────────┘     │
        reject│                          │approve
              ▼                          ▼
       ┌──────────────┐           ┌──────────────┐
       │   REJECTED   │           │    ACTIVE    │
       └──────────────┘           └──────┬───────┘
                                         │ obsolete
                                         ▼
                                  ┌──────────────┐
                                  │   OBSOLETE   │
                                  └──────────────┘
```

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Workflow Concepts](./01-workflow-concepts.md) | 30 min |
| 2 | [State Machines](./02-state-machines.md) | 45 min |
| 3 | [Approval Entity](./03-approval-entity.md) | 45 min |
| 4 | [Workflow Service](./04-workflow-service.md) | 45 min |
| 5 | [Audit Logging](./05-audit-logging.md) | 30 min |

---

## Workflow Invariants

| Invariant | Enforcement |
|-----------|-------------|
| Only DRAFT → PENDING allowed | State machine |
| Approval requires approver | Domain validation |
| Cannot edit ACTIVE parts | Service layer |
| All changes logged | Audit service |

---

## Verification Checklist

After this phase:

- [ ] Part follows state machine
- [ ] Can submit for approval
- [ ] Approvals recorded
- [ ] All changes audited
- [ ] Invalid transitions blocked

---

## Next Phase

[Phase 11: CAM Import →](../11-cam-import/README.md)
