# Phase 01: Engineering Foundation

## Overview

This phase applies the mindset from Phase 00 to the Manufacturing Engineering Platform. You will produce concrete engineering artifacts **before writing any code**.

By the end of this phase, you will have:
- A complete domain model
- Documented architectural decisions (ADRs)
- Defined invariants for your system
- Architecture rules for dependencies
- Change impact analysis
- Error taxonomy

> **This is the phase where we answer: "What are we building?"—not yet "How do we build it?"**

---

## What You Will Learn

| Topic | Why It Matters |
|-------|----------------|
| Domain modeling | Understand the "things" and relationships before coding |
| Invariants | Know what must NEVER be violated |
| ADRs for PartFlow | Document technology and architecture decisions |
| Dependency rules | Prevent spaghetti architecture |
| Change analysis | Design for resilience |
| Error taxonomy | Know how to handle different failures |

---

## Prerequisites

- Complete [Phase 00: Engineering Mindset](../00-engineering-mindset/README.md)
- Read the [Business Requirements Document](../../docs/brd.md)

---

## Tutorials in This Phase

| # | Tutorial | Duration |
|---|----------|----------|
| 1 | [Domain Modeling](./01-domain-modeling.md) | 60 min |
| 2 | [Invariants and Business Rules](./02-invariants.md) | 45 min |
| 3 | [Architectural Decisions](./03-architectural-decisions.md) | 60 min |
| 4 | [Dependency Rules](./04-dependency-rules.md) | 45 min |
| 5 | [Change Impact Analysis](./05-change-analysis.md) | 45 min |
| 6 | [Error Taxonomy](./06-error-taxonomy.md) | 45 min |

---

## Artifacts You Will Create

By the end of this phase, you will have created:

| Artifact | Location | Purpose |
|----------|----------|---------|
| Domain model diagram | `docs/domain-model.md` | Visual entity map |
| Invariants document | `docs/invariants.md` | Business rules that must never break |
| ADR folder | `docs/adr/` | Technology and architecture decisions |
| Dependency rules | `docs/architecture.md` | What can import what |

---

## Exercises

Each tutorial includes exercises where you:
- Analyze the BRD for specific information
- Create domain modeling artifacts
- Write ADRs
- Identify invariants

---

## When You're Done

You should be able to:
- [ ] Draw the domain model from memory
- [ ] List five invariants and explain why each matters
- [ ] Explain why we chose Python, SQLite, Flask
- [ ] Draw the dependency diagram
- [ ] Predict what breaks if a specific module changes

---

## Next Phase

[Phase 02: Development Environment →](../02-development-environment/README.md)
