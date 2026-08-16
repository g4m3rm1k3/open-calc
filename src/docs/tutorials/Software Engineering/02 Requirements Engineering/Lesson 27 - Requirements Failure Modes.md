# Lesson 27: Requirements Failure Modes

**What you will build.** Nothing new in code — this closing lesson of
the domain lays its fourteen lessons side by side as a single, named
catalog of ways a requirement can fail, each one anchored to the real,
reproduced failure this domain already demonstrated for it. The
transferable problem: without a shared name for each of these failure
modes, every one of them tends to get diagnosed, after the fact, as "a
bug" — even though not one of this domain's real failures was ever a
mistake in code. Naming them precisely is what makes them recognizable
*before* they cost what Lesson 5's cost-of-change curve says they'll cost
once they're only found in production.

**What you need to know first.** Every lesson in this domain. This
lesson doesn't introduce new failures — it's the domain's own closing
synthesis, the way Lesson 12 closed Domain 1.

**Terms restated in this lesson.** Each of these received full treatment
earlier in this domain; per the Repetition Rule, they're named here, not
re-explained, alongside the concrete failure that demonstrated each one:

- **problem vs. solution confusion** (Lesson 13) — accepting a
  solution-shaped request as the requirement itself; demonstrated by a
  correct CSV export that failed to solve the real CRM problem behind it.
- **missed stakeholders** (Lesson 14) — serving only the person who
  asked; demonstrated by a restricted VIP contact leaking to every
  requester because nobody but the sales rep was ever consulted.
- **goal/task confusion** (Lesson 15) — completing the literal task while
  failing the real reason behind it; demonstrated by a perfectly correct
  search burying the one file a user actually wanted.
- **unstated non-functional needs** (Lessons 16–17) — a functional
  requirement satisfied while a real quality requirement was never
  written down at all; demonstrated by `cart_total_wasteful` passing
  every functional check while running 300 times slower than needed.
- **unrespected constraints** (Lesson 18) — a functionally correct
  solution that violates a real, external boundary; demonstrated by a
  working signup flow that stored raw passwords.
- **unstated assumptions** (Lesson 19) — a correctness-critical fact
  nobody wrote down; demonstrated by a bulk-import tool silently breaking
  username normalization it never knew existed.
- **unchecked acceptance** (Lesson 20) — judging "done" by impression
  instead of a written, runnable criterion; demonstrated by a one-
  character `and`/`or` bug that looked correct on a skim and failed
  immediately once actually checked.
- **ambiguity** (Lesson 21) — a requirement precise enough to sound
  settled while still admitting more than one honest reading;
  demonstrated by two dedupe implementations disagreeing, both correctly,
  about the same sentence.
- **unresolved conflict** (Lesson 22) — two legitimate requirements that
  cannot both be fully true at once, mistaken for a bug to fix rather
  than a decision to make.
- **poor prioritization** (Lesson 23) — legitimate work done in an
  arbitrary order, delivering the same total value measurably later than
  it needed to.
- **lost traceability** (Lesson 24) — a requirement implemented more than
  once with no link between the copies, so a later change reaches only
  one of them.
- **skipped validation** (Lesson 25) — a requirement built in full before
  ever being checked against the stakeholder's real intent, when a
  three-line prototype could have checked it first.
- **mishandled change** (Lesson 26) — a real change request applied by
  memory instead of by impact analysis, repeating Lesson 24's own failure
  on purpose to show it's preventable.

**Objects and methods used.** None new — this lesson narrates prior code,
it doesn't introduce any.

---

## Concept Unit: One Catalog, Fourteen Lessons

### The Problem

Looked at individually, this domain's fourteen lessons each solved one
specific problem, using one specific example. Is there a shape underneath
all of them?

### The Concept

Every failure mode in this domain's own glossary above shares one trait:
none of them are failures of writing correct code. `export_contacts_csv`
was correct, by Lesson 2's own definition of that word, every single time
it failed one of this domain's fourteen lessons — correct and aimed at
the wrong problem (Lesson 13), correct and blind to a second stakeholder
(Lesson 14), correct and silently violating a constraint (Lesson 18),
correct and ambiguous about what "correct" even meant (Lesson 21).
Lesson 2 opened this entire curriculum by separating the programming
question from the engineering question; this domain is, in full, a map
of everything that can go wrong specifically in the space between them —
before a single line of implementation is even judged, because the thing
being implemented was never actually pinned down.

### CS Lens

This is the same organizing move Lesson 12 made for the whole curriculum,
narrowed to one domain: a catalog of named failure modes turns "something
about this system feels wrong" into "this is specifically an ambiguity"
or "this is specifically a missed stakeholder" — a diagnosis precise
enough to reach for the right fix instead of guessing.

### SE Lens

The realistic value of this catalog isn't reciting it — it's pattern
matching against it under real pressure, the moment something about a new
requirement feels off. A team that can say "this sounds like an
ambiguous requirement, not a disagreement about the code" reaches for
Lesson 21's fix — clarify the wording — instead of Lesson 22's — negotiate
a compromise — which are genuinely different remedies for genuinely
different diseases.

---

## Concept Unit: Real Failures Rarely Come One at a Time

### The Problem

Every lesson in this domain isolated exactly one failure mode, on
purpose, the way the Concept Isolation Rule demands throughout this
curriculum. Does a real requirement ever fail in only one of these ways
at once?

### The Concept

Rarely. Trace `export_contacts_csv` across this domain honestly: it began
as **problem/solution confusion** (Lesson 13) — a CSV button standing in
for a CRM need. Fixing that surfaced a **missed stakeholder** (Lesson
14) — the VIP client, never consulted. Serving that stakeholder correctly
still left an **unresolved conflict** (Lesson 22) between Sales and
Compliance once their two legitimate needs turned out incompatible.
Resolving *that* required **traceability** (Lesson 24) once the same rule
got reimplemented elsewhere, and a real **change request** (Lesson 26)
tested whether that traceability actually held. One feature, five
different named failure modes, encountered in sequence, each one only
visible once the previous one was fixed enough to reveal it. This is
realistic, not a contrived worst case: a request that's already
solution-shaped is *more* likely to hide a missed stakeholder, because
nobody examining a specific proposed solution is looking for who else it
touches; an ambiguous requirement is *more* likely to go unvalidated,
because the ambiguity is invisible to whoever wrote it down in the first
place. These failure modes don't arrive politely, one at a time, waiting
for the last one to be resolved.

### CS Lens

This is the identical shape as a real bug investigation compounding
through Lesson 10's local reasoning failure modes: fixing one hidden
dependency often reveals a second one sitting behind it, invisible until
the first was cleared away — not because the fix was wrong, but because
the two problems were never independent to begin with.

### SE Lens

The realistic discipline this suggests isn't "solve every failure mode
before building anything" — this domain's own Lesson 23 already argued
against that kind of unlimited upfront caution. It's staying alert, after
fixing one named failure, to whether fixing it revealed another one
sitting behind it, the exact pattern `export_contacts_csv`'s own history
across this domain just traced in full.

---

## Concept Unit: Where This Domain Hands Off

### The Problem

This domain's job, per its own opening lesson, was determining what a
system is actually supposed to do. That job is never fully finished the
way a single function's correctness is — but at some point, a
requirement is understood well enough to move forward. To what?

### The Concept

To precision mechanical enough to reason about, not just discuss —
Domain 3, *Specification & Contracts*, immediately next. This domain's
tools produced requirements a person can validate, prioritize, and trace
by name; the next domain takes a requirement this well-understood and
asks a sharper question: can it be stated as a real, checkable contract —
preconditions, postconditions, invariants — precise enough that a
computer, not just a careful reader, could tell whether an implementation
satisfies it. Lesson 20's acceptance criteria were this domain's first
real step in that direction — English sentences precise enough to become
`assert` statements. The next domain formalizes that step far beyond
what a handful of `assert` calls can express.

### CS Lens

This is the same narrowing this curriculum's own pipeline, named in
Lesson 12, describes moving from *Requirements* to *Specification*:
broader, human-facing precision giving way to narrower, mechanically
checkable precision, each stage building on what the last one already
secured rather than replacing it.

### SE Lens

Nothing this domain built stops mattering once Domain 3 begins —
stakeholders don't stop existing, ambiguity doesn't stop being possible,
and every fix built across these fourteen lessons remains exactly as
necessary as it was when first introduced. Specification adds a new,
sharper layer on top of an already-solid foundation; it doesn't replace
the foundation, the same way Domain 1's vocabulary never stopped being
used once this domain began building on top of it.

---

## Connect the Pieces

Fourteen lessons, one running feature, one closing map:

1. **The catalog** — thirteen named failure modes, each anchored to a
   real, reproduced failure this domain already demonstrated.
2. **They compound** — `export_contacts_csv`'s own history across this
   domain shows five of them arriving in sequence, each one revealed only
   once the last was fixed.
3. **The handoff** — a well-understood requirement, this domain's actual
   product, becomes Domain 3's raw material: something precise enough to
   state as a formal, checkable contract.

## What Breaks Without This

Treat every one of this domain's fourteen failures as an isolated,
unrelated incident, diagnosed after the fact as "we should have tested
better" — the closest thing to a diagnosis available to anyone without
this domain's vocabulary. Every fix still gets made, eventually, the same
way `export_contacts_csv` eventually got fixed five separate times across
this domain's own narrative. What's lost is the ability to recognize the
sixth one coming, in a different feature, before it costs what Lesson 5's
curve says late discovery always costs.

## Exercises

1. Pick any real software failure you've personally experienced as a
   user — a feature that technically worked but still frustrated you.
   Match it to one (or more) of this domain's thirteen named failure
   modes, and justify your choice.
2. Trace a different running example from this domain — Lesson 2's
   `is_username_available`, say — across every lesson it appeared in, the
   way this lesson traced `export_contacts_csv`. How many distinct
   failure modes touched it, and in what order?
3. Without rereading this lesson, write all thirteen failure modes from
   memory, each with one word or phrase naming the example that
   demonstrated it.

## Definition of Done

- [ ] You can name at least ten of this domain's thirteen failure modes
      from memory, each with the concrete example that demonstrated it.
- [ ] You can explain why real requirements failures tend to compound
      rather than arrive one at a time.
- [ ] You've completed all three exercises.
- [ ] No commit for this lesson — it added no new code. If you're
      tracking progress in a repository, note in a journal file or README
      that Domain 2 is complete, and name the one failure mode from these
      fourteen lessons you expect to catch yourself making most often.
