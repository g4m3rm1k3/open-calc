# Phase 05: Parts Domain

## Overview

This is your first **real feature**. You'll implement the Parts domain entity using TDD, following the Red-Green-Refactor cycle from Phase 04.

> **This is where engineering becomes real. Every line justified. Every test first.**

---

## What You Will Build

A complete Parts feature:
- Part entity with validation
- PartNumber value object
- Repository interface and SQLite implementation
- Service layer with business logic
- Web routes and templates

---

## Architecture Constraint

**Phase 05 Constraints:**
- No relationships to other entities yet
- No authentication/authorization yet
- No workflows yet
- Focus on one complete vertical slice

---

## Prerequisites

- Complete [Phase 04: Testing Discipline](../04-testing-discipline/README.md)
- Virtual environment activated
- pytest installed

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Part Entity (TDD)](./01-part-entity.md) | 60 min |
| 2 | [PartNumber Value Object](./02-part-number.md) | 45 min |
| 3 | [Repository Interface](./03-repository-interface.md) | 30 min |
| 4 | [SQLite Repository](./04-sqlite-repository.md) | 60 min |
| 5 | [Part Service](./05-part-service.md) | 45 min |
| 6 | [Web Routes and Templates](./06-web-layer.md) | 60 min |

---

## The TDD Lock in Action

Every implementation tutorial follows this structure:

1. **Write failing test** (Red)
2. **See it fail** (verify test is valid)
3. **Write minimal code** (Green)
4. **Refactor** (if needed)
5. **Repeat**

---

## Intentional Mistakes

This phase intentionally makes some mistakes that will be fixed in later phases:
- No proper error handling in web layer
- No pagination (will hurt at scale)
- No authorization checks

These are left as exercises in later refactoring phases.

---

## Verification Checklist

After this phase:

- [ ] All Part tests pass
- [ ] Can create Part via web UI
- [ ] Can list Parts
- [ ] Can view Part detail
- [ ] Repository correctly persists

---

## Next Phase

[Phase 06: Machines & Relationships →](../06-machines-relationships/README.md)
