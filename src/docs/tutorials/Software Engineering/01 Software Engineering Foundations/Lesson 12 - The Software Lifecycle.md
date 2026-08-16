# Lesson 12: The Software Lifecycle

**What you will build.** Nothing new in code — this lesson takes the
eleven lessons already built in this domain and lays them, end to end,
against a single, named sequence of stages every real software system
passes through, more than once, for as long as it's used. The
transferable problem: without a shared map of that sequence, it's easy to
mistake "the code works" (Implementation) for "the job is done," the
exact trap Lesson 2 spent an entire lesson on — this lesson makes the
rest of the job visible, names each part of it, and shows where the rest
of this curriculum lives on that map.

**What you need to know first.** Every lesson in this domain so far.
This lesson doesn't introduce a new technical idea the way Lessons 1
through 11 did — it's the domain's closing synthesis, and it uses
`cart_total` (Lesson 1), `is_username_available` (Lessons 2, 3, 9, 11),
`business_days_between` (Lesson 4), and `apply_coupon` (Lesson 10) as its
own worked examples throughout.

**Pipeline established in this lesson.**

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

This is the first lesson to name this full sequence, so there is no
earlier stage of it to restate — every lesson in this curriculum from
here on that touches any one of these seventeen stages will open by
restating this diagram and marking which stage it's actually working in,
so the specific technique being taught never loses its place in the
larger whole.

**Terms introduced in this lesson.** One line each — every stage gets
real depth in a dedicated part of this curriculum later; this lesson's
job is naming and ordering them, not teaching any one in full.

- **Problem** — the real difficulty or need that justifies building
  anything at all, before any solution is proposed.
- **Requirements** — a precise statement of what a system must actually
  do to address the problem — this curriculum's entire next domain.
- **Domain model** — a representation of the real-world concepts,
  entities, and rules a system has to work with, independent of how it's
  eventually built.
- **Specification** — a precise, checkable statement of a system's
  intended behavior, contracts, and boundaries.
- **Architecture** — the system's largest-scale structural decisions:
  what major parts it has, and how they're allowed to depend on each
  other.
- **Design** — the more detailed shape of individual parts within that
  architecture — modules, interfaces, responsibilities.
- **Implementation** — writing the actual code that carries out the
  design. Everything Lessons 1 through 11 built directly lives here.
- **Verification** — establishing, with real evidence, that the
  implementation actually does what it was specified to do.
- **Integration** — combining separately-built parts and confirming they
  work correctly together, not just individually.
- **Release** — packaging a verified, integrated system into a form ready
  to be delivered.
- **Deployment** — actually putting a release into the environment where
  it will run for real.
- **Operations** — keeping a deployed system running correctly, day to
  day.
- **Observation** — knowing, with real evidence, how a running system is
  actually behaving.
- **Change** — any new requirement, fix, or adjustment made to a system
  already in Operations — using the same word Lesson 5 already gave a
  full definition to.
- **Migration** — deliberately moving a system, or its data, from one
  state or platform to another without destroying what already depends on
  it.
- **Evolution** — a system's structure and behavior changing over a long
  period, across many individual changes, in response to everything
  around it shifting.
- **Retirement** — deliberately ending a system's operation, including
  everything that has to happen for the people and systems depending on
  it to be safely let go of it.

**Objects and methods used.** None new — this lesson narrates prior code,
it doesn't introduce any.

---

## Concept Unit: One Sequence, Every Stage Named

### The Problem

Eleven lessons in this domain each taught one real idea — regressions,
essential complexity, coupling, tradeoffs — using small, self-contained
examples. None of them, on their own, showed where that idea fits into
the *entire* job of building and keeping a real system alive. Is there a
single sequence all of them belong to?

### The Concept

There is, and it's the diagram given in this lesson's own header: **Problem
→ Requirements → Domain model → Specification → Architecture → Design →
Implementation → Verification → Integration → Release → Deployment →
Operations → Observation → Change → Migration → Evolution → Retirement.**
Walk `is_username_available` across it directly, using only what this
domain already built: the *Problem* was "can two people register
conflicting accounts" — never stated outright in Lesson 2, but implied by
the task existing at all. Lesson 2's own opening line — "say whether it's
available" — was an informal *Requirement*, immediately shown to be
incomplete once Lesson 2's second unit found the case-sensitivity gap: a
*Specification* question ("what does 'the same username' mean, precisely")
that had never actually been answered. Lesson 2's three-line function was
the *Implementation*; running it against `"dave"` and `"alice"` was
*Verification*, in its smallest possible form — one hand-checked example.
Lesson 3 placed that same code inside `accounts.py`, owned by a team, with
a formal boundary to `growth_signup.py` — an *Architecture* and *Design*
decision, made visible only once the code had to live inside something
larger than one file. Lesson 3's operational unit — an on-call engineer
paged at 3 a.m. — was *Operations* and *Observation*: keeping the system
running, and knowing how it's actually behaving, once it's live. Lesson
5's `float`-versus-cents comparison was a *Change*, priced at two
different points in the same system's life. Lesson 9's internal
`_accounts` restructuring, absorbed safely by `get_account_status`, was a
small, real *Migration* — moving from one internal representation to
another without breaking what depended on it. Not one line of new code
was needed to place all of this domain's work on the map; the work was
always happening at some point along this sequence, whether or not this
curriculum had named the sequence yet.

### CS Lens

This sequence is itself an abstraction, in exactly Lesson 7's sense:
seventeen named stages standing in for what is, in reality, an enormous
amount of activity, letting anyone who's absorbed this lesson talk about
"a Verification problem" or "an Operations failure" precisely, without
re-explaining what that means every time.

### SE Lens

The realistic alternative to naming these stages is the trap Lesson 2
opened this curriculum with: mistaking Implementation — the code runs,
the tests someone happened to think of pass — for the entire job. Every
stage after Implementation in this diagram is real, additional work this
curriculum will spend the rest of its lessons on, and skipping straight
from Implementation to calling something "done" is exactly the gap Lesson
2's engineering question was built to catch.

---

## Concept Unit: The Sequence Is a Loop, Not a Line

### The Problem

Drawn as a straight line, this pipeline looks like it runs once: start at
Problem, end at Retirement, done. Does any system in this domain's own
history actually work that way?

### The Concept

None of them do, and the evidence is already sitting in this domain's own
lessons. `cart_total` didn't move through this sequence once — Lesson 1
alone cycled through *Requirements* (a discount code request) →
*Design/Implementation* (the `discount_code` parameter) → a real
*Verification* failure (the `KeyError: None` regression) → *Change* → a
second *Implementation* (the `.get()` fix), all inside one lesson, on one
function, before Lesson 5 came back to the same function's pricing
representation as a *new* Change entirely. `apply_coupon` went through
*Design* twice in Lesson 10 alone — once with a hidden global, once
rebuilt around an explicit parameter — each version fully implemented and
verified before the next Change arrived. **Change**, specifically, is the
stage this loop actually turns on: every real system spends the vast
majority of its working life cycling between Operations, Observation, and
Change — running, being watched, being adjusted — occasionally looping
all the way back to Requirements or even Domain model when a change is
large enough to demand it, rather than moving through Migration and
Evolution toward Retirement on any fixed schedule. Retirement is the one
stage without a real analog anywhere in this domain's own eleven lessons
— nothing built so far has been deliberately ended — and that's honest:
most of what a working engineer spends their career doing lives inside
this loop, not at either end of the line.

### CS Lens

This is the identical shape as a state machine with a self-loop: most of
a real system's lifetime is spent cycling through a small number of
recurring states (Operations, Observation, Change) rather than
progressing linearly through every state exactly once — a shape this
curriculum's Specification domain will give a formal name and formal
tools for, shortly.

### SE Lens

Believing the pipeline is a straight line leads to a real, common
planning mistake: budgeting real time and attention for Requirements
through Deployment, and treating everything after as an afterthought —
exactly backward from where most systems actually spend most of their
cost, which Lesson 17 of this curriculum's later material addresses
directly under the name "why software decays." Naming the loop now, in
this domain's closing lesson, is what makes the rest of this curriculum's
heavy investment in testing, observability, and maintenance — stages most
learners have spent the least time thinking about — make sense as the
main event, not a coda.

---

## Concept Unit: Where This Curriculum Goes From Here

### The Problem

Domain 1 is closing. What does the rest of this curriculum actually cover,
placed against the sequence this lesson just named?

### The Concept

Almost the entire remaining curriculum is this same seventeen-stage
sequence, given real depth, one stage — or a closely related cluster of
stages — at a time: Requirements Engineering takes the *Requirements*
stage this domain only gestured at, in full. Specification & Contracts and
Domain Modeling do the same for *Specification* and *Domain model*.
Software Design & Modularity and Architecture take *Design* and
*Architecture* far past this domain's brief, real-but-small examples.
Implementation Engineering, Version Control & Collaboration, and Testing &
Verification give *Implementation*, *Integration*, and *Verification*
their real weight — Testing & Verification alone is one of the largest
domains in this entire curriculum, for exactly the reason this lesson's
second unit just argued: verification is not a small, closing step. Build
& Dependency Engineering and Release & Deployment Engineering cover
*Release* and *Deployment*. Observability & Operations and Reliability &
Resilience cover *Operations* and *Observation* directly. Scalability &
Distributed Applications extends *Operations* under real growth.
Maintenance, Evolution & Legacy Systems is *Change*, *Migration*,
*Evolution*, and *Retirement*, given the entire domain this lesson's
second unit argued they deserve. Engineering Organizations & Economics
closes the curriculum by returning to Lesson 3's socio-technical theme at
full scale. Nothing in that list replaces this domain — every one of
those domains will keep reaching back to the vocabulary Lessons 1 through
11 already built: regressions, cohesion, coupling, local reasoning,
tradeoffs. This domain gave the vocabulary. The rest of the curriculum
gives the depth.

### CS Lens

A curriculum organized around a single named pipeline, with each domain
mapped onto a specific stage or cluster of stages, is the same
organizing principle as a real, staged compiler or interpreter — Text →
Lexer → Parser → AST → Semantic Analysis — where each stage is studied on
its own terms while the whole sequence stays visible as the thing every
individual stage exists to serve.

### SE Lens

The alternative — teaching every topic this curriculum covers in whatever
order seems locally convenient, with no shared map connecting them — is
exactly the pattern this curriculum's own opening pages rejected: "learn
language → learn framework → learn Git → learn testing → build projects,"
each topic self-contained, none of them showing how the others depend on
it. This lesson's pipeline is the alternative actually delivered: every
domain from here on has a stated place on the map this lesson just drew,
and this domain's own vocabulary — the words, not just the code — is what
makes each of those later domains legible as more than an isolated topic.

---

## Connect the Pieces

Eleven lessons, one sequence, walked start to finish:

1. **The full pipeline, named** — seventeen stages, Problem through
   Retirement, with this domain's own `is_username_available` and
   `cart_total` shown occupying real, specific points on it, all without
   writing a line of new code.
2. **The loop, not the line** — `cart_total` and `apply_coupon` both
   cycled through Implementation, Verification, and Change more than once
   within a single lesson each, proving the pipeline's real shape is
   cyclic, centered on Change, not linear.
3. **The map for what comes next** — every remaining domain in this
   curriculum is this same sequence, given real depth, one cluster of
   stages at a time, building on the exact vocabulary this domain spent
   eleven lessons establishing.

## What Breaks Without This

Treat "the code runs and passes the checks I thought of" (Implementation
and a thin slice of Verification) as the entire job, the way a
programming-only view — Lesson 2's own opening trap — always does. Every
later stage this lesson named still happens regardless: the system still
gets deployed, still runs in Operations, still gets watched or fails to
be, still changes. What's missing isn't the work — it's ever having
budgeted attention, or vocabulary, for it, which is exactly how a
`cart_total`-sized regression or an `apply_coupon`-sized hidden dependency
survives all the way into a real system nobody was watching closely
enough to catch it in.

## Exercises

1. Pick any one function or fix from this domain's eleven lessons that
   this lesson's first unit didn't already walk through `is_username_available`
   or `cart_total` with. Place it on the seventeen-stage pipeline the same
   way this lesson did — which stage or stages was it actually an example
   of?
2. Name one real piece of software you use that you believe is currently
   in Retirement, or heading toward it. What told you that, specifically
   — a real signal, not a guess?
3. Without rereading this lesson, write the seventeen stages from memory,
   in order. It's fine to get a few wrong on the first try — the goal is
   noticing which ones you already have a real feel for from this
   domain's own lessons, and which ones are still just names.

## Definition of Done

- [ ] You can recite the full seventeen-stage pipeline, in order, from
      memory.
- [ ] You can place at least three specific moments from this domain's
      earlier lessons on that pipeline correctly, by name.
- [ ] You can explain, in your own words, why the pipeline is a loop
      centered on Change rather than a straight line.
- [ ] You've completed all three exercises.
- [ ] No commit for this lesson — it added no new code. If you're
      tracking progress in a repository, note in a journal file or README
      that Domain 1 is complete, and name the one idea from these twelve
      lessons you expect to reach for most often going forward.
