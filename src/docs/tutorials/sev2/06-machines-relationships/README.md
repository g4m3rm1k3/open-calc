# Phase 06: Machines & Relationships

## Overview

This phase adds the **Machine** entity and introduces **relationships between entities**—a Part can be associated with multiple Machines.

> **Relationships are where complexity lives. Handle them carefully.**

---

## What You Will Build

- Machine entity with validation
- Part-Machine relationship (many-to-many)
- Extended repository operations
- Joint queries and eager loading

---

## Architecture Constraints

**Phase 06 Constraints:**
- No authentication yet
- No workflows yet
- Focus on entity relationships
- Association table pattern for many-to-many

---

## Prerequisites

- Complete [Phase 05: Parts Domain](../05-parts-domain/README.md)
- All Phase 05 tests passing

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Machine Entity](./01-machine-entity.md) | 45 min |
| 2 | [Association Tables](./02-association-tables.md) | 45 min |
| 3 | [Machine Repository](./03-machine-repository.md) | 45 min |
| 4 | [Part-Machine Service](./04-part-machine-service.md) | 45 min |
| 5 | [Machine Web Layer](./05-machine-web.md) | 45 min |

---

## Domain Model Update

```
┌──────────────┐         ┌───────────────────┐         ┌──────────────┐
│     Part     │─────────│   PartMachine     │─────────│   Machine    │
│              │   *     │ (Association)     │     *   │              │
│ - id         │         │ - part_id         │         │ - id         │
│ - part_number│         │ - machine_id      │         │ - machine_id │
│ - name       │         │ - setup_time      │         │ - name       │
│ - status     │         │ - is_primary      │         │ - controller │
└──────────────┘         └───────────────────┘         └──────────────┘
```

---

## New Invariants

| Invariant | Enforcement |
|-----------|-------------|
| Machine ID unique | Database constraint |
| Part can run on multiple machines | Association table |
| One primary machine per Part | Domain validation |

---

## Verification Checklist

After this phase:

- [ ] Machine CRUD working
- [ ] Can associate Parts with Machines
- [ ] Can query parts by machine
- [ ] Association metadata (setup_time) stored
- [ ] All tests pass

---

## Refactoring Preview

After this phase: **REFACTOR CHECKPOINT #1**
- Review and clean up code
- Apply lessons learned
- Improve test coverage

---

## Next Phase

[Refactor Checkpoint #1 →](../07-refactor-checkpoint-1/README.md)
