# Lesson 92: Architecture Evolution

**What you will build.** Nothing new in code — this lesson takes the
twenty lessons already built in this domain and asks what they all have
in common as a body of decisions, not just as individual techniques. The
transferable problem: Lesson 91 closed by asking whether this system's
modular-monolith decision (Lesson 80) still holds now that real scale
exposed a cost nobody chose. This lesson answers the question underneath
that one, for every decision this domain has made: an architectural
decision is never permanently correct, only correct given the evidence
that justified it at the time — and evolving it, deliberately, when new
evidence arrives, is not a failure of the original decision. It's the
same discipline that made the original decision defensible in the first
place, applied again.

**What you need to know first.** Every lesson in this domain so far.
This lesson doesn't introduce a new technical construct the way Lessons
72 through 91 each did — it's this domain's closing synthesis, and it
uses `order_lifecycle.py`'s own accumulated architectural history — a
dependency direction (Lesson 72), a stability measurement (Lesson 74), a
critical path (Lesson 82), a shared-resource failure (Lesson 91) — as
its own worked examples throughout.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

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

This closes out this domain's work inside the **Architecture** stage.
Every one of this domain's twenty-one lessons lived here; the next
domain, named at the end of this lesson, moves one stage further down
this same pipeline. Fittingly, this closing lesson's own subject —
architecture that keeps changing as a system moves through *Operations*,
*Observation*, and *Change* — is this pipeline's own loop, first named
back in Lesson 12, now made concrete at the scale of an entire system's
structure instead of one function's own history.

**Terms restated in this lesson.** Per the Repetition Rule, a term
reappearing at a domain's close gets the same real treatment as its
first appearance — not a reminder, the actual definition again.

- **architectural driver** — a real, checkable fact about a system that
  a boundary decision should actually be justified by, rather than a
  boundary chosen because it matches how the data happens to be
  modeled.
- **quality attribute tradeoff** — the fact that improving one quality
  attribute frequently costs another, measurably, rather than being a
  free improvement.
- **architecture failure** — a system-level breakdown caused not by a
  bug in any single component, but by an interaction between components
  that the architecture itself allowed.

**Objects and methods used.** None new — this lesson narrates prior
code, it doesn't introduce any.

## Concept Unit: Every Decision in This Domain Was Justified, Not Permanent

### The Problem

Twenty-one lessons in this domain each made one real architectural
decision — a direction, a boundary, a split, a critical path, an owner
— using small, self-contained, measured examples. None of them, on
their own, said what should happen when the evidence that justified a
decision changes. Is a decision made in Lesson 80 still binding once
Lesson 91 measures a cost that decision's own original reasoning never
anticipated?

### The Concept

No, and the evidence is already sitting in this domain's own history.
Lesson 72 decided `arch_order` depends on `arch_inventory`, justified by
a real circular-import crash. Lesson 80 kept checkout and payment in one
process, justified by a real, measured partial-failure cost. Lesson 81
gave one report its own worker, justified by a real 250x latency
measurement. Lesson 82 shrank a critical path, justified by a real,
simulated compound-reliability number. Lesson 86 made one service the
owner of a customer's address, justified by a real, reproduced data-drift
bug. Every one of these decisions was correct *given the evidence
available at the time it was made* — none of them were guesses, and none
of them claimed to be permanent. Lesson 91's own failure — checkout's
latency silently degrading 18,000x because of a shared resource nobody
had reason to suspect at the scale the system was originally built for
— is not evidence that Lesson 80's original decision was wrong. It's
evidence that the system's *scale* changed, and the *evidence* that
justified the original decision no longer describes the system as it
actually exists now. **Architecture evolution** is deciding, using the
identical tools this domain already built — Lesson 74's own
measurement, Lesson 89's own weighted comparison — whether new evidence
like that actually calls for a changed decision, the same way the
original evidence once called for the original one.

### CS Lens

This is the identical shape as **incremental refinement** in any
iterative system: a model, a plan, or an architecture is never built
once and finalized — it's built against the best evidence available,
tested against reality, and revised when reality disagrees with it. A
scientific theory isn't abandoned as "wrong" the moment new evidence
complicates it; it's refined, or replaced, using the same standard of
evidence that established it in the first place. An architecture that
was correct for a real, measured scale is not "wrong" the moment that
scale changes — it was correct, for the system that existed then, and
the discipline is noticing when it stops describing the system that
exists now.

### SE Lens

The realistic alternative to this domain's own approach is treating an
architectural decision as a one-time event, made once, defended
indefinitely regardless of what changes around it — exactly the mistake
Lesson 88's own regression demonstrated in miniature, a decision
defended by nothing but memory. The other realistic mistake, treating
every new problem as proof the whole architecture must be rebuilt from
scratch, is just as costly: Lesson 91 already proved a failure that
*looked* architectural had a cheap, local fix. Evolution, done right,
sits between both mistakes — revisit a decision using real evidence,
change exactly what the new evidence justifies changing, and leave
everything else exactly as it was.

---

## Concept Unit: Evolving Deliberately, Not Reflexively

### The Problem

Given that architecture should evolve when evidence justifies it, what
stops "the evidence justifies it" from becoming an excuse to rewrite
something the moment it becomes inconvenient, the same undisciplined
instinct Lesson 91 already warned against?

### The Concept

The same tools this domain already built for making a decision the
first time apply, unchanged, to changing it. Lesson 74's own measurement
discipline — a real number, not a feeling — is exactly what should
justify revisiting a decision: not "this feels slow," but "checkout's
own latency measured 118 milliseconds, up from 0.0066, under this
specific condition." Lesson 89's own weighted tradeoff matrix is exactly
what should justify choosing a new direction over an old one: not "the
old way is annoying," but a real, defended comparison across the
attributes that actually matter for the system as it exists today, which
may not be the attributes that mattered when the original decision was
made. Lesson 88's own ADR practice is exactly what should record the
change: a new record, explicitly naming what changed and why, superseding
the old one rather than silently replacing it — the same discipline that
would have prevented Lesson 88's own regression in the first place,
applied here to a change made on purpose instead of one made by
accident.

### CS Lens

This is **regression-safe refactoring**, applied to a system's own
structure instead of to one function's own implementation: a change
justified by real evidence, made deliberately, verified against the
identical evidence that justified it (Lesson 90's own fitness functions,
rerun after the change, are exactly this verification), rather than a
change made on instinct and hoped to be an improvement.

### SE Lens

The alternative — evolving architecture reflexively, chasing whatever
technique is newest or most discussed, without the measurement
discipline this domain has practiced in every single lesson — recreates
Lesson 89's own honest warning about unjustified weights, one level up:
a confident-looking architectural change, with no real evidence behind
it, is not more defensible than the decision it's replacing just because
it's newer. Every deliberate evolution this domain would endorse looks
exactly like every deliberate decision it already made: real measurement
first, a real tradeoff weighed second, a written record third.

---

## Concept Unit: Where This Domain Goes From Here

### The Problem

This domain is closing. What does the rest of this curriculum actually
build on top of the twenty-one lessons here?

### The Concept

Implementation Engineering, next, takes the architectural boundaries
this domain decided — layers, ports, services — and gives the actual
code living inside each one its own real treatment: naming, readability,
error handling, at the scale of individual lines and functions instead
of entire subsystems. Version Control & Collaboration and Testing &
Verification will give this domain's own fitness functions (Lesson 90)
and quality-attribute measurements (Lesson 74) their full, permanent
home — real, automated, continuously-run checks, not one-off scripts
built to prove a single lesson's own point. Observability & Operations
and Reliability & Resilience pick up directly from Lesson 91's own
diagnostic question, giving real depth to distinguishing a local failure
from an architectural one at production scale. Maintenance, Evolution &
Legacy Systems — one of the largest domains in this entire curriculum —
is this lesson's own subject, evolution, given the full weight this
single closing lesson could only gesture at. Nothing in that list
replaces this domain; every one of them will keep reaching back to its
vocabulary — coupling, cohesion, dependency direction, quality
attributes, architecture fitness — the same way this domain's own
lessons kept reaching back to Domain 5's vocabulary since Lesson 72.

### CS Lens

A curriculum whose later domains keep citing an earlier domain's own
vocabulary by name, rather than re-deriving equivalent ideas under new
names, is the identical discipline Lesson 51 and Lesson 71 already
practiced for their own domains — this domain has now done the same
thing a third time, for its own twenty-one lessons.

### SE Lens

The alternative — treating each domain's own hard-won vocabulary as
disposable, reinventing "how do we decide when to split a service" under
a new name in a later domain — would recreate Lesson 51's own term
drift a third time, at the scale of an entire curriculum. Naming this
domain's vocabulary once, precisely, across these twenty-one lessons,
and committing to reusing it rather than reinventing it, is this
curriculum's own ubiquitous language, holding at every scale it has been
tested against so far — a single field, a single object, a single
module, and now an entire system's own architecture.

## Connect the Pieces

Twenty-one lessons, one throughline, walked start to finish: **every
architectural decision in this domain was justified by real, measured
evidence, and every one of them remains open to revision the moment new
evidence, gathered with the same discipline, says it should be.**
`arch_order`'s dependency on `arch_inventory` (Lesson 72), the modular
monolith that kept checkout and payment safe from partial failure
(Lesson 80), the critical path that improved order success from 95.1%
to 97.0% (Lesson 82), the shared resource that degraded checkout 18,000x
before a local fix closed it (Lesson 91) — every one of these is a
decision this domain can point to a real number for, and every one of
them is a decision this domain would revisit, using the identical
standard of evidence, the moment a real number said to.

## What Breaks Without This

Treat an architecture as either permanently fixed or infinitely
malleable — the two mistakes this domain's own closing lesson named
directly — and the result is the same either way: decisions divorced
from evidence, defended or discarded by instinct instead of by the
measurement discipline every other lesson in this domain actually
practiced. What's missing isn't effort — a team defending a broken
decision out of habit, or rewriting a working one out of boredom, can
both work very hard. What's missing is asking, every time, the one
question this entire domain has been answering, lesson after lesson:
what's the real, measured evidence, for the system as it actually exists
right now — not as it was designed, and not as anyone assumes it to be.

## Exercises

1. Pick any one decision from this domain's own twenty-one lessons that
   this lesson's first Concept Unit didn't already walk through. Name
   the real evidence that justified it, and describe one hypothetical
   future measurement that would justify revisiting it.
2. Name one real piece of software you use that you believe has an
   architecture decision made years ago that no longer fits its current
   scale. What real, measurable evidence — not a guess — would you need
   to gather to actually justify changing it?
3. Without rereading this domain, write down, from memory, the real
   number this domain measured for at least three of these: the Stable
   Dependencies instability score (Lesson 60), the microservices
   compound success rate (Lesson 82), the async speedup (Lesson 85), and
   the architecture-failure latency degradation (Lesson 91). It's fine
   to get the exact figures wrong — the goal is noticing which of this
   domain's own real measurements you already have a genuine feel for.

## Definition of Done

- [ ] You can state, in your own words, why an architectural decision
      being justified by real evidence at the time it was made doesn't
      mean it should never be revisited.
- [ ] You can name at least three specific, real measurements this
      domain made, by lesson, from memory.
- [ ] You can explain, using Lesson 91's own example, the difference
      between a local fix and a genuine architectural evolution.
- [ ] You've completed all three exercises.
- [ ] No commit for this lesson — it added no new code. If you're
      tracking progress in a repository, note in a journal file or
      README that Domain 6 is complete, and name the one measurement
      technique from these twenty-one lessons you expect to reach for
      most often going forward.

Domain 7, Implementation Engineering, is next.
