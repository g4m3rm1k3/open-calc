# Lesson 71: Pattern Selection

**What you will build.** Nothing new in code — this lesson takes the
nineteen lessons already built in this domain and asks what was actually
deciding, each time, whether to add structure or leave something simple.
The transferable problem: every technique this domain introduced —
modules, private state, defensive copies, keyword-only parameters,
registries, dependency inversion, the Strategy pattern itself — was a
response to a real, demonstrated cost, never a rule applied because a
textbook says so. Lesson 70 already showed a pattern applied
*correctly* and still being the wrong amount of structure for the
problem in front of it. This lesson turns that one comparison into a
real, repeatable question a working engineer can actually ask, before
this domain hands off to Architecture.

**What you need to know first.** Every lesson in this domain so far.
This lesson doesn't introduce a new technical idea the way Lessons 52
through 70 each did — it's this domain's closing synthesis, and it uses
`order_lifecycle.py`'s own accumulated history — a transition table, a
listener registry, a payment-method registry, a boundary payload
function — as its own worked examples throughout.

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

This closes out this domain's work inside the **Design** stage. Every
one of this domain's twenty lessons lived here; the next domain, named
at the end of this lesson, moves one stage further down this same
pipeline.

**Terms restated in this lesson.** Per the Repetition Rule, a term
reappearing at a domain's close gets the same real treatment as its
first appearance — not a reminder, the actual definition again.

- **coupling** — how much one piece of code needs to know about
  another's internal details, state, or exact shape in order to work
  correctly with it.
- **cohesion** — how strongly the responsibilities inside one module or
  class actually belong together, sharing a common purpose and often the
  same internal state.
- **design pattern** — a named, reusable solution to a problem that
  recurs across many different systems, valuable specifically because
  naming it lets engineers communicate an entire design decision in one
  word instead of re-explaining the mechanism every time.

**Objects and methods used.** None new — this lesson narrates prior
code, it doesn't introduce any.

## Concept Unit: Every Technique in This Domain Answered a Real Bug First

### The Problem

Twenty lessons in this domain each taught one real technique — modules,
information hiding, encapsulation, interfaces, four separate lessons on
dependency, composition, substitution, polymorphism, extension points,
configuration, side effects, state ownership, boundaries, patterns —
using small, self-contained, real examples. None of them, on their own,
showed what was actually deciding, each time, whether a given piece of
structure was worth its own cost. Is there a single question underneath
all twenty?

### The Concept

There is, and it's visible in every single one of this domain's own
Problem sections: **every technique in this domain was introduced by
first showing a real, run, demonstrated failure that existed without
it.** `order_lifecycle.py` didn't get a private `_ORDER_TRANSITIONS`
and a `can_transition` function because information hiding is a good
idea in the abstract — it got them after Lesson 53 showed a real
`AttributeError` when the module's internal shape changed underneath a
caller that had reached past it. `Order` didn't get a listener registry
because Observer is a classic pattern — it got one after Lesson 61 showed
a real missing activity-log entry from a checkout path that forgot a
manual call. `DiscountStrategy` didn't get simplified into plain
functions because classes are bad — Lesson 70 showed the exact, real
cost an abstract base class was and wasn't buying, for one specific
problem's actual shape. Not one technique in this domain was added
because a name existed for it; every one was added because a concrete
failure, run and shown, made the cost of *not* having it visible first.

### CS Lens

This is the same discipline as **premature optimization** in reverse:
where a performance optimization applied before a real bottleneck is
measured is a classic, well-known mistake, a design pattern applied
before a real cost is demonstrated is the identical mistake, one domain
over. Both share the same fix: measure or demonstrate the actual problem
first, and let the real cost — a slow function, a real bug — decide
whether the added complexity is worth what it costs.

### SE Lens

The realistic alternative to this domain's own approach is memorizing a
catalog of patterns and reaching for the closest-sounding one whenever a
problem vaguely resembles its textbook description — exactly the trap
this curriculum's own BRD names directly, and exactly what Lesson 70's
`DiscountStrategy` was built to demonstrate the cost of. A pattern
applied without its real cost ever being weighed against a real,
demonstrated problem is added complexity with no proof it was needed —
which is, structurally, the identical failure as Lesson 4's essential
versus accidental complexity, all the way back in this curriculum's
first domain, now recurring at the level of an entire design decision.

---

## Concept Unit: A Real Question, Not a Fixed Rule

### The Problem

Given that every technique in this domain answered a real cost, is there
a repeatable way to ask the question *before* writing the code, instead
of only recognizing the right answer in hindsight, the way this domain's
own lessons did?

### The Concept

There is, built entirely from costs this domain already measured, for
real, more than once: **before adding structure — a class hierarchy, a
registry, an abstraction layer — name the specific, concrete failure it
prevents, and check whether that failure is actually reachable given how
this system is really used.** Lesson 65's registry earned its cost
because `GiftCard` was a real, demonstrated case of a type needing to be
added without touching existing code — a cost that recurs every time a
genuinely new payment method ships. Lesson 70's `DiscountStrategy`
*didn't* earn its cost, in the same domain, because three discount
computations, defined together, changing together, never faced the
failure `ABC` protects against — a new, badly-shaped implementation
arriving from code outside anyone's control. The same mechanism, an
abstract, enforced interface, was exactly right for one problem and
exactly wrong for the other, and the difference was never the mechanism
itself — it was whether the failure it prevents was ever actually going
to happen.

### CS Lens

This is the same test underneath the **YAGNI** principle ("you aren't
gonna need it"), stated more precisely: not "don't build things you
might not need," which is too vague to act on, but "name the specific
failure a piece of structure prevents, and check whether it's reachable
in this system as it actually exists" — a test with a real, checkable
answer instead of a feeling. It's the identical discipline a database
query planner uses deciding whether an index is worth its own write
cost: not "indexes are generally good," but "is this specific query
pattern going to hit this table often enough for the index's benefit to
outweigh what it costs to maintain."

### SE Lens

The alternative — building the more structured version by default,
"just in case" a future requirement needs it — has a real, honest cost
this domain has now demonstrated in both directions: Lessons 61 through
69 showed real costs from *not* having enough structure (missed
notifications, leaked internals, duplicated validation); Lesson 70
showed a real cost from having *more* structure than a problem needed
(a construction-time trap for a case that never needed enforcement in
the first place). Neither direction is free, and neither is the safe
default — the only real answer, every time, is the same question this
domain's own twenty lessons kept asking by example: what specific
failure, demonstrated or clearly reachable, does this structure actually
prevent, right now, in this system, not in a hypothetical one.

---

## Concept Unit: Where This Domain Goes From Here

### The Problem

This domain is closing. What does the rest of this curriculum actually
build on top of what these twenty lessons established?

### The Concept

Architecture, next, asks this domain's own questions — coupling,
cohesion, dependency direction, boundaries — at the scale of entire
services instead of one Python module, the same jump Lesson 60 and
Lesson 69 both already previewed by name. Implementation Engineering
takes this domain's own file- and object-level discipline and extends
it to naming, readability, and error handling at the level of individual
lines. Testing & Verification will write real, automated tests against
exactly the guarantees this domain built by hand in every "Run It" and
"What Breaks Without This" section — a test suite is, structurally,
nothing more than this domain's own habit of proving a fix with real
output, made permanent and repeatable. Nothing in that list replaces
this domain; every one of those domains will keep reaching back to its
vocabulary — coupling, cohesion, dependency direction, information
hiding, the Strategy and Observer patterns by name — the same way this
domain's own running `order_lifecycle` example kept reaching back to
`OrderStatus` and `ORDER_TRANSITIONS` from the very first lesson to the
very last.

### CS Lens

A curriculum whose later domains keep citing an earlier domain's own
vocabulary by name, rather than re-deriving equivalent ideas under new
names, is the identical discipline Lesson 51 already named for this
curriculum's own structure — this domain has now done the same thing
for its own twenty lessons that Lesson 51 did for the twelve before it.

### SE Lens

The alternative — treating each domain's vocabulary as disposable,
reinventing "how tightly does this depend on that" under a new name in
every later domain — would recreate Lesson 51's own term drift at the
scale of an entire curriculum, for a second time. Naming this domain's
vocabulary once, precisely, across these twenty lessons, and committing
to reusing it rather than reinventing it, is this curriculum's own
ubiquitous language, practiced on itself a second time.

## Connect the Pieces

Twenty lessons, one throughline, walked start to finish: **every
technique in this domain answered a real, demonstrated cost, and the
same question — what specific failure does this actually prevent, right
now — is what decided both when to add structure and when to leave
something simple.** `order_lifecycle.py`'s own history carries the
proof: a transition table (Lesson 46) added because a real illegal move
succeeded silently; a listener registry (Lesson 61) added because a real
activity entry went missing; a `DiscountStrategy` class hierarchy
(Lesson 70) *removed* because three one-line functions never faced the
failure the hierarchy was built to prevent. Not one of these decisions
came from a rule. Every one came from a real, run, demonstrated cost,
weighed honestly against what the fix would cost too.

## What Breaks Without This

Apply every pattern this domain named — Observer, Registry, Strategy,
Adapter — to every problem that superficially resembles the one each
pattern was built for, without ever checking whether the specific
failure each one prevents is actually reachable. The result is exactly
Lesson 70's own `DiscountStrategy` before its fix: real, working code,
correctly built, carrying real cost — construction-time contracts,
indirection, extra files — that nothing in the actual system ever needed
paid off. What's missing isn't correctness — every pattern, used this
way, still works. What's missing is ever having asked whether the
problem in front of you was the one the pattern was actually built to
solve.

## Exercises

1. Pick any one technique from this domain's own twenty lessons that
   this lesson's first Concept Unit didn't already walk through by name.
   State, in one sentence, the specific real failure its own Problem
   section demonstrated before the fix was introduced.
2. Name one real piece of software you use, or are building, where you
   believe a pattern was applied without its real cost ever being
   checked against a real, demonstrated need. What's the concrete signal
   that told you that, specifically — not a guess?
3. Without rereading this domain, write down, from memory, the specific
   real bug each of these lessons opened with: State (45), Aggregates
   (49), Coupling (58), Dependency Inversion (61). It's fine to get some
   wrong on the first try — the goal is noticing which of this domain's
   own running failures you already have a real feel for.

## Definition of Done

- [ ] You can state, in your own words, the one question this domain's
      own twenty lessons were all answering, each in their own way.
- [ ] You can name at least three specific, real bugs this domain
      demonstrated, by lesson, from memory.
- [ ] You can explain, using Lesson 70's own `DiscountStrategy` example,
      why the same mechanism was right for one problem and wrong for
      another.
- [ ] You've completed all three exercises.
- [ ] No commit for this lesson — it added no new code. If you're
      tracking progress in a repository, note in a journal file or
      README that Domain 5 is complete, and name the one technique from
      these twenty lessons you expect to reach for most often going
      forward.

Domain 6, Architecture, is next.
