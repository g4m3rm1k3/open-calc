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

## The concrete worked example carried through the diagram

Extracted verbatim (paraphrased facts, not copied prose) from Lesson 12's
own first Concept Unit on 2026-08-17, opened once under the same
one-time-exception pattern as the diagram extraction above, specifically
to recover the concrete literal value the "carry one concrete literal
value through every stage built so far" rule (schema, Header section)
requires — needed starting with Domain 8, the first domain to touch a
pipeline stage since this file was created. Not previously recorded here
because no session between L45 and L104 needed it recorded (Domains 5–7
apparently extended it directly from L12 or didn't need this level of
cross-domain carry-through; their own lesson files aren't in scope to
confirm which). This is the account current as of L12 itself only —
Domains 4–7's own further extensions of it, if any, are not reflected
here and were not reopened to check, per this curriculum's own no-
reopen-old-lessons constraint.

L12 walked `is_username_available` (Lesson 2's own function, testing the
literal usernames `"dave"` and `"alice"`) across the stages it could
concretely place it on, using only what Domain 1 (Lessons 1–11) itself
had already built — honestly stopping at the stages that domain's own
work didn't reach:

- **Problem** — "can two people register conflicting accounts," never
  stated outright in Lesson 2 but implied by the task existing at all.
- **Requirements** — Lesson 2's own opening line, "say whether it's
  available," an informal requirement.
- **Specification** — Lesson 2's second unit finding the case-
  sensitivity gap: "what does 'the same username' mean, precisely" —
  i.e., is `"Dave"` the same username as `"dave"`?
- **Implementation** — Lesson 2's three-line function itself.
- **Verification** — running it by hand against the literal inputs
  `"dave"` and `"alice"`, one hand-checked example each.
- **Architecture / Design** — Lesson 3 placing that same code inside
  `accounts.py`, owned by a team, with a formal boundary to
  `growth_signup.py`.
- **Operations / Observation** — Lesson 3's on-call engineer, paged at
  3 a.m., keeping the system running and knowing how it's actually
  behaving.
- **Change** — Lesson 9's internal `_accounts` restructuring, absorbed
  safely by `get_account_status` (L12 itself calls this a *Migration*
  example reused for the Change stage — its own words: "a small, real
  Migration — moving from one internal representation to another
  without breaking what depended on it").

L12 explicitly and honestly declined to place this example (or any
Domain-1 example) on **Domain model, Integration, Release, Deployment,
Migration** (as its own separate stage — L9's restructuring above covers
it only as reused evidence, not a dedicated placement), **Evolution**, or
**Retirement** — its own words: "Retirement is the one stage without a
real analog anywhere in this domain's own eleven lessons — nothing built
so far has been deliberately ended — and that's honest." A later domain
extending this same value onto one of those still-unplaced stages is
extending L12's own worked example forward, in the same honest spirit —
not reconstructing something L12 already claimed and hiding a gap.

## The one thing this file does not replace

Lesson 12 itself still carries real teaching content beyond the diagram —
term definitions with their own *why*, the "loop, not a line" argument
(most of a system's life cycles through Operations → Observation →
Change rather than progressing once through all 17 stages), and worked
placements of `is_username_available` and `cart_total` on the pipeline.
This file is a lookup for the diagram and the stage list only; it is not
a substitute for reading Lesson 12 if a future lesson needs to reuse that
lesson's actual arguments, not just the stage names.
