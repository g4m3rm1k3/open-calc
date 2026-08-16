# Shared Curriculum Fact: The 17-Stage Lifecycle Pipeline

Extracted verbatim from `01 Software Engineering Foundations/Lesson 12 -
The Software Lifecycle.md` on 2026-08-16, so that later sessions building
Domain 3+ lessons never have to reopen Lesson 12 just to restate this
diagram — per `LESSON SCHEMA.md`'s rule, any lesson touching one of these
stages opens by restating the full diagram and marking which stage(s) it
touches.

This file exists as a general pattern, not a one-off: whenever building a
new lesson requires a specific fact that only lives inside one already-
written lesson file, pull that fact into a small shared file here (like
this one) instead of re-deriving it from memory or reopening the source
lesson again next time. Check this folder for an existing shared file
before reopening a prior lesson for a fact that might already be here.

## The diagram

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

## Stage-to-domain map

Loose mapping, per Lesson 12's own third Concept Unit ("Where This
Curriculum Goes From Here") — most domains cover a stage or a closely
related cluster of stages, not a strict one-to-one:

- **Problem** — Domain 1 (Software Engineering Foundations)
- **Requirements** — Domain 2 (Requirements Engineering)
- **Domain model** — Domain 4 (Domain Modeling)
- **Specification** — Domain 3 (Specification & Contracts) — note this
  domain is taught *before* Domain 4 in lesson order even though
  "Domain model" precedes "Specification" in the pipeline itself; the
  curriculum's teaching order and the pipeline's own causal order are
  not the same thing, and Lesson 12 doesn't claim they are.
- **Architecture, Design** — Domain 5 (Software Design & Modularity) and
  a later Architecture domain
- **Implementation, Integration, Verification** — Implementation
  Engineering, Version Control & Collaboration, and Testing &
  Verification domains
- **Release, Deployment** — Build & Dependency Engineering and Release &
  Deployment Engineering domains
- **Operations, Observation** — Observability & Operations and
  Reliability & Resilience domains (Scalability & Distributed
  Applications extends Operations under growth)
- **Change, Migration, Evolution, Retirement** — Maintenance, Evolution &
  Legacy Systems domain
- Engineering Organizations & Economics closes the curriculum, returning
  to the socio-technical theme at full scale rather than owning one more
  pipeline stage.

## The one thing this file does not replace

Lesson 12 itself still carries real teaching content beyond the diagram —
term definitions with their own *why*, the "loop, not a line" argument
(most of a system's life cycles through Operations → Observation →
Change rather than progressing once through all 17 stages), and worked
placements of `is_username_available` and `cart_total` on the pipeline.
This file is a lookup for the diagram and the stage list only; it is not
a substitute for reading Lesson 12 if a future lesson needs to reuse that
lesson's actual arguments, not just the stage names.
