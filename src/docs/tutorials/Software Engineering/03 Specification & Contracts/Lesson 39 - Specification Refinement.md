# Lesson 39: Specification Refinement

**What you will build.** Nothing new in code — this closing lesson
returns to the one promise this domain made and hadn't yet kept: Lesson
34 found a property that failed, diagnosed that the *property* was
wrong rather than the code, and said this domain's closing lesson would
return to that question at real depth. This lesson keeps that promise,
names the discipline directly, and lays this domain's eleven lessons
side by side as one coherent toolkit for turning an understood
requirement into something precise enough to check by machine.

**What you need to know first.** Every lesson in this domain. Like
Lessons 12 and 27 before it, this is a closing synthesis, not a new
technical idea built from scratch.

**Terms restated in this lesson.** Each received full treatment earlier
in this domain; per the Repetition Rule, named here, not re-explained,
alongside the concrete example that demonstrated each one:

- **precondition** / **postcondition** (Lessons 28–29) — the caller's
  and the function's own halves of a contract; demonstrated by
  `average`'s non-empty requirement and `search_files_ranked`'s
  content-preserving guarantee.
- **invariant** (Lesson 30) — a condition true at every valid moment,
  checkable directly; demonstrated by `check_normalized_invariant`.
- **Design by Contract** (Lesson 31) — the discipline naming all of the
  above as one real, explicit obligation; demonstrated by the reusable
  `@contract` decorator.
- **state-based specification** (Lesson 32) — a relation between state
  before and after an operation; demonstrated by `remove_item`'s
  silently-unchanged total.
- **finite state machine** (Lesson 33) — a closed set of named states and
  an explicit transition table; demonstrated by `ResetToken`'s
  structurally impossible replay.
- **behavioral property** (Lesson 34) — a claim meant to hold across
  every valid input, checked against several, not one; demonstrated by
  the cart's add/remove round trip.
- **error contract** (Lesson 35) — what a failure signals, and what
  remains true of the system when it happens; demonstrated by
  `register_many_atomic`.
- **API contract** (Lesson 36) and **compatibility contract** (Lesson
  37) — a contract published across an organizational boundary, and kept
  intact as it changes; demonstrated by `accounts.py`'s
  `ACCOUNT_STATUSES` and `STATUS_COMPATIBILITY_MAP`.
- **contract test** (Lesson 38) — a contract checked from one side alone,
  against a shared definition; demonstrated by `consumer_contract_test`.

**Objects and methods used.** None new — this lesson narrates prior code,
it doesn't introduce any.

---

## Concept Unit: The Promise This Domain Made Itself

### The Problem

Lesson 34 discovered something none of this domain's other ten lessons
did: a real check failed not because the code was wrong, but because the
*property itself* demanded more than the system had ever actually
promised. That lesson deferred the deeper question — how do you tell the
two apart, reliably, and what do you do once you have? This lesson
answers it.

### The Concept

**Specification refinement** is the deliberate practice of revising a
specification — a precondition, a postcondition, a property, a contract
— when reality reveals it asked for the wrong thing, as a distinct,
legitimate activity from fixing a bug in the code the specification
describes. Telling the two apart comes down to one question, asked
honestly at the moment a check fails: does the *implementation* fail to
do what it was actually supposed to do, or does the *specification*
demand something the implementation was never actually supposed to
guarantee? Lesson 34's cart failed that question in the second direction
— `add_item` and `remove_item` were never wrong, and refining the
property (comparing contents and total, not exact order) was the correct
repair, not patching `remove_item` to somehow preserve an ordering
guarantee nothing ever actually needed. Refining a specification isn't
a failure of the earlier work that wrote it — every precondition,
postcondition, and property in Lessons 28 through 34 was reasonable when
it was written, checked against what was known at the time. Refinement
is what happens when a real, concrete case — Lesson 34's fourth test,
not the first three — teaches something the original specification
couldn't have known to account for.

### CS Lens

This is the same relationship Lesson 25's requirements validation had to
Lesson 13's problem-versus-solution gap, one stage later in the pipeline:
validation catches a wrong requirement before any code exists; refinement
catches a wrong specification after code and checks already exist,
using the check's own failure as the evidence that something needs
revising — and revising the right thing, not just whichever one is
easier to change.

### SE Lens

The realistic risk of skipping this distinction is bending an
implementation to satisfy an incorrect specification, at real cost, when
the honest fix was cheaper and more correct: relaxing the specification
itself. This is Lesson 5's cost-of-change curve one more time, applied to
mistakes in the specification layer instead of the implementation layer
— catching an over-specified property in the same sitting it was written,
the way Lesson 34 did, costs a re-read and a one-line change; discovering
it only after real code has been built to satisfy the wrong, stricter
claim costs considerably more.

---

## Concept Unit: One Toolkit, Eleven Lessons

### The Problem

Looked at individually, this domain's tools — preconditions, state
machines, contract tests — each solved a specific kind of gap. What do
they add up to?

### The Concept

A single, continuous escalation in *how precisely* a requirement can be
stated and checked, mirroring this domain's own place in the pipeline
Lesson 12 named. Preconditions and postconditions (Lessons 28–29) pin
down a single function's own promise. Invariants (Lesson 30) extend that
promise across time. Design by Contract (Lesson 31) names and tools the
whole family. State-based specifications and state machines (Lessons
32–33) extend it again, to operations whose correctness depends on more
than their own arguments. Behavioral properties (Lesson 34) extend it a
third time, from one checked example to a claim meant to hold generally.
Error contracts (Lesson 35) extend the promise to cover failure, not just
success. API and compatibility contracts (Lessons 36–37) extend it across
an organizational boundary, and across time as that boundary changes.
Contract tests (Lesson 38) make every one of those promises independently
checkable by whoever depends on it, without needing the rest of the
system present. Each tool answers a real, distinct question this
domain's own running examples — `average`, the cart, `ResetToken`,
`accounts.py` — actually needed answered, in the order those needs
appeared.

### CS Lens

This progression is the same one Requirements Engineering's own domain
made, one stage earlier in the pipeline — from "what does the stakeholder
actually need" toward increasingly precise, checkable statements — now
carried further, into statements precise enough for a machine, not just
a careful reader, to verify.

### SE Lens

None of this replaces Domain 2's own work — a precondition states
precisely what Domain 2 already decided mattered; it doesn't relitigate
whether it should have mattered in the first place. Specification is
downstream of requirements, exactly as Lesson 12's pipeline names it, and
depends on requirements being right before asking whether they're stated
precisely enough to check.

---

## Concept Unit: Where This Domain Hands Off

### The Problem

This domain turned understood requirements into checkable contracts.
What comes next?

### The Concept

Two domains, immediately following: Domain Modeling, which asks how to
represent the real-world concepts a specification talks about —
entities, relationships, lifecycles — before design decisions are made
about how to build them; and Software Design & Modularity, which asks how
to structure real code around the contracts this domain has learned to
write. Every contract this domain built assumed a function or a boundary
already existed to attach it to. The next domains ask where that
structure itself should come from — not `average` or `get_account_status`
as already-given names, but how a real system's modules, entities, and
interfaces get decided in the first place.

### CS Lens

This is the same narrowing Lesson 12's own pipeline names moving from
*Specification* to *Domain model* and *Design*: precision about
individual promises giving way to decisions about the larger shape those
promises live inside.

### SE Lens

Every tool this domain built keeps mattering from here on — a module
designed in the next domain will still need preconditions, still need an
honest error contract, still benefit from a contract test at its
boundaries. Design decides where the seams go; this domain decided what
has to be true at every seam, once it exists.

---

## Connect the Pieces

Eleven lessons, one continuous escalation in precision, one promise kept:

1. **The toolkit** — precondition through contract test, each answering a
   distinct question this domain's own examples actually needed answered.
2. **The promise kept** — specification refinement, named directly:
   telling a wrong implementation apart from an over-specified check, and
   fixing the one that's actually wrong.
3. **The handoff** — Domain Modeling and Design, which decide the
   structure this domain's contracts attach to, next.

## What Breaks Without This

Treat every failed check as proof the code is broken, never questioning
whether the check itself demanded too much — the exact trap Lesson 34's
cart could have fallen into on its very first failure. A team that never
distinguishes a wrong implementation from a wrong specification either
wastes real effort forcing code to satisfy claims it was never meant to
guarantee, or — just as commonly — quietly weakens checks whenever they
fail, without ever asking whether the *implementation* was the one that
needed fixing that time.

## Exercises

1. Revisit one specification from this domain's own lessons — a
   precondition, a postcondition, an error contract — and argue, honestly,
   whether you think it might be over-specified in Lesson 34's sense.
   You don't have to be right; the exercise is asking the question on
   purpose.
2. Without rereading this lesson, write all nine named tools from this
   domain — precondition through contract test — in the order they were
   introduced, with one phrase each on what new question each one
   answers that the previous ones couldn't.
3. Write, in a few sentences, the actual test you'd apply the next time
   one of your own checks fails: what would tell you it's the
   implementation's fault versus the specification's?

## Definition of Done

- [ ] You can define specification refinement in your own words, and
      explain how it differs from an ordinary bug fix.
- [ ] You can name at least seven of this domain's nine tools from
      memory, each with the example that demonstrated it.
- [ ] You've completed all three exercises.
- [ ] No commit for this lesson — it added no new code. If you're
      tracking progress in a repository, note in a journal file or README
      that Domain 3 is complete, and name the one tool from these eleven
      lessons you expect to reach for most often going forward.
