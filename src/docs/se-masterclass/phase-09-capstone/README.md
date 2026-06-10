# Phase 9 — Architecture Capstone

**Goal:** Combine skills from all phases into one coherent system.
**Time estimate:** ~30 hours
**Prerequisites:** All of Phase 8

## What this phase builds

The capstone project is a **distributed task runner**.

It is a real system with:
- A DSL for defining task pipelines (Phase 7 skills)
- A REST API with WebSocket progress feed (Phase 4 skills)
- A frontend dashboard with live updates (Phase 3 skills)
- SQLite persistence with a migration system (Phase 5 skills)
- An ECS-style worker architecture (Phase 6 skills)

## Why this project

Every skill from every phase is used. The project is large enough to require
real architectural decisions but small enough to complete in 30 hours.

The capstone is not about getting it right the first time. It is about:
- Making architectural decisions with real trade-offs
- Discovering which abstractions from earlier phases transfer cleanly
- Identifying what you would do differently
- Having something real to show and discuss

## Labs

| Lab | Description |
|-----|-------------|
| [LAB-101 — Design](LAB-101-capstone-design.md) | Architecture decisions, component map, interface contracts |
| [LAB-102 — Build](LAB-102-capstone-build.md) | Full implementation across all layers |
| [LAB-103 — Review](LAB-103-capstone-review.md) | Trade-offs, extension ideas, what to study next |

## Start here

[LAB-101 — Capstone Design](LAB-101-capstone-design.md)
