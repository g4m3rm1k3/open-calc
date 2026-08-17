# Lesson 104: Engineering Conventions

**What you will build.** Nothing new in code — this lesson takes the
eleven lessons already built in this domain and asks what they all have
in common as a body of decisions, not just as individual techniques.
The transferable problem: each of Lessons 93 through 103 taught one
specific discipline — guard clauses, intention-revealing names, small
functions, safe state, specific exceptions, honest failure semantics,
isolated side effects, validated input, safely-loaded configuration,
cohesive files, named-and-fixed code smells — using one real,
continuously evolving pricing codebase as its own proof. This lesson
answers the question none of the previous eleven asked directly: what
is actually the same about all of them, underneath their eleven
different subjects?

**What you need to know first.** Every lesson in this domain so far.
This lesson doesn't introduce a new technical construct the way Lessons
93 through 103 each did — it's this domain's closing synthesis, and it
uses `pricing_calculations.py` and `pricing_batch.py`'s own accumulated
history — a bug guard clauses fixed (Lesson 93), a bug keyword-only
parameters prevented (Lesson 95), a bug validation caught before it
reached production (Lesson 97, Lesson 100), a smell a value object
structurally removed (Lesson 103) — as its own worked examples
throughout.

**Pipeline diagram.** This curriculum's full pipeline, established in
Lesson 12:

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

This closes out this domain's work inside the **Implementation** stage.
Every one of this domain's twelve lessons lived here; the next domain,
named at the end of this lesson, moves one stage further down this same
pipeline — from writing the code to the practices that let more than
one person write it together, safely, over time.

**Terms restated in this lesson.** Per the Repetition Rule, a term
reappearing at a domain's close gets the same real treatment as its
first appearance — not a reminder, the actual definition again.

- **Code smell** — a pattern in working, correct code that signals a
  likely future maintenance cost, without being a bug in the present.
- **Command-query separation** — the principle that a function should
  either answer a question, causing no side effects, or carry out an
  action, never meaningfully both at once.
- **Validate at the boundary, trust internally** — checking a value
  once, at the specific point it crosses from untrusted to trusted, and
  relying on that single check everywhere downstream instead of
  repeating it.

**Objects and methods used.** None new — this lesson narrates prior
code, it doesn't introduce any.

## Concept Unit: Every Lesson in This Domain Taught the Same Discipline, at a Different Scale

### The Problem

Eleven lessons, eleven different-sounding subjects: how a function's
own control flow is shaped, what its identifiers are called, how big it
is, where its state lives, how it signals failure, what a failure
leaves behind, where its side effects happen, what it trusts about its
own input, where its configuration comes from, which file it lives in,
and what warning signs mean it should be restructured. Read as a list,
these look like eleven separate skills. Read against the one codebase
every single one of them was practiced on, they don't.

### The Concept

Every lesson in this domain made the identical kind of decision: given
more than one way code could legally be written, this domain chose one,
consistently, and applied it everywhere the same situation recurred —
not because the alternative was impossible, but because a codebase
where the same kind of decision is made the same way every time is
predictable in a way one where it isn't can never be. Lesson 93 chose
guard clauses over nesting, everywhere a function had an early-exit
case, not just once. Lesson 95 chose keyword-only parameters for
`calculate_order_total`'s own public boundary, and Lesson 99's own
`preview_order_total` matched that same signature shape rather than
inventing a new one. Lesson 100 chose to validate at the specific
boundary a value enters, and trust it everywhere downstream, rather
than deciding case by case whether a given function felt like it needed
its own check. Lesson 102 chose one direction for the dependency
between `pricing_calculations.py` and `pricing_batch.py`, and Lesson
103's own value object followed the identical shape Domain 4's `Money`
already established, rather than inventing a new pattern for bundling
related values. None of these were the *only* correct choice available
— a different, equally competent team could have chosen differently on
any one of them — but every single lesson in this domain chose once and
then held to it, everywhere the same situation came up again. This
consistency, practiced at the level of individual lines, whole
functions, and whole files alike, is what **engineering conventions**
actually means: not a list of arbitrary style rules, but the discipline
of making a class of decision the same way every time it recurs, so a
reader who has learned how this codebase makes one such decision can
correctly predict how it makes every other one like it, without having
to read each new function from scratch.

### CS Lens

This is the identical shape as a **coding standard** enforced by an
automated linter across an entire organization's codebase — not because
any one rule in that standard is provably the only correct choice, but
because a hundred engineers each making their own independent choice
about tab width, quote style, or import ordering produces a codebase no
single one of them can read as fluently as their own code, while a
hundred engineers following one shared standard can each read
everyone else's code almost as fluently as their own. The value isn't
in which specific rule wins; it's in every rule being applied
uniformly, the same principle this domain's own twelve lessons
practiced without ever using the word "linter."

### SE Lens

The realistic alternative to this domain's own approach is treating
each of these eleven lessons' own decisions as a one-off, made fresh
for whatever function happened to need it at the time — guard clauses
here because this function felt nested enough to bother, keyword-only
parameters there because this particular bug happened to get noticed,
validation added wherever a developer happened to think of it. That
approach isn't lazy or careless on any single decision — every
individual choice, made in isolation, could still be locally
reasonable. What it costs is exactly what this domain's own consistency
bought: a reader's ability to predict unfamiliar code from familiar
code, which only holds when the same kind of decision is actually made
the same way every time, not merely usually.

---

## Concept Unit: A Convention Is a Choice, Not a Discovery

### The Problem

If conventions are what made this domain's own code predictable, what
stops "we chose this convention" from becoming an excuse to defend any
decision, forever, regardless of whether it was ever actually the right
one — the identical undisciplined instinct Domain 6's own Lesson 91 and
Lesson 92 already warned against, one domain earlier, at the scale of
architecture instead of implementation?

### The Concept

The same discipline that justified choosing a convention the first
time applies, unchanged, to revisiting it. This domain's own
conventions weren't handed down as universal law — Lesson 93's own SE
Lens named a real cost guard clauses carry (losing the visual grouping
nesting provides); Lesson 100's own SE Lens named a real risk in
validating once and trusting internally (a future caller that bypasses
the one checked boundary); Lesson 102's own SE Lens named a real cost
to splitting one file into two (a reader who needs both responsibilities
together now needs two open files instead of one). Every convention
this domain chose was chosen with its own real, stated tradeoff, not
presented as costless — which is exactly what makes each one
legitimately revisable, the moment new evidence says its own tradeoff
no longer favors it, using the identical standard of evidence Domain
6's own Lesson 92 already established for architecture: not "this
feels outdated," but a real, specific cost, observed, outweighing the
reason the convention was chosen in the first place.

### CS Lens

This is the same shape as a **style guide's own changelog**: a real
style guide is versioned, not eternal — a rule adopted for a real
reason, in a specific version, superseded by a later version only when
a documented reason justifies the change, with the reasoning kept
visible rather than silently overwritten. A convention with no
recorded reason behind it degrades, over time, into the exact kind of
unquestioned tradition Lesson 88's own regression already demonstrated
at the scale of a single architectural decision: a rule nobody remembers
choosing is a rule nobody can responsibly revise.

### SE Lens

The alternative — treating every convention this domain established as
permanently settled, immune to reconsideration regardless of what
future evidence says — recreates Domain 6's own closing warning a
second time, one domain later: a decision defended by nothing but
habit is not more defensible than one that was never justified at all.
The opposite mistake is just as real: treating every convention as
equally negotiable, revisited on a whim whenever it becomes locally
inconvenient, is exactly the failure mode this domain's own SE Lenses
spent eleven lessons arguing against — a codebase where "we usually do
it this way, except when we don't" offers a reader no more
predictability than no convention at all. The discipline this domain
actually practiced sits between both: choose deliberately, state the
real tradeoff honestly, hold to it consistently, and revisit only with
the same rigor that justified it the first time.

---

## Concept Unit: Where This Domain Goes From Here

### The Problem

This domain is closing. What does the rest of this curriculum actually
build on top of the twelve lessons here?

### The Concept

Version Control & Collaboration, next, takes this domain's own
conventions — the specific, consistent choices Lessons 93 through 103
made about how one person writes correct, readable, maintainable code —
and asks the genuinely different question of how more than one person
makes those same choices together, over time, without the consistency
this domain relied on quietly breaking down the moment a second author
joins. A commit message explaining *why*, not just *what* — this
domain's own "Definition of Done" checklist has required exactly this,
every single lesson, without yet naming the discipline that makes it
matter at scale: history that stays readable across dozens of
contributors, not just inside one file one person wrote alone. Testing
& Verification will give this domain's own real, run-every-time
discipline — no lesson in this domain ever asserted an output without
actually producing it — its own permanent, automated home, so the
guarantee this domain built by hand, once, in each lesson's own "Run
It" step, becomes a guarantee the codebase itself enforces continuously.
Nothing in that list replaces this domain; both of them will keep
reaching back to its own vocabulary — guard clauses, keyword-only
boundaries, validate-once-trust-internally, cohesive files, named code
smells — the same way this domain's own lessons kept reaching back to
Domain 5's and Domain 4's vocabulary since Lesson 93.

### CS Lens

A curriculum whose later domains keep citing an earlier domain's own
vocabulary by name, rather than re-deriving equivalent ideas under new
names, is the identical discipline Lesson 51, Lesson 71, and Lesson 92
already practiced for their own domains — this domain has now done the
same thing a fourth time, for its own twelve lessons.

### SE Lens

The alternative — treating this domain's own hard-won vocabulary as
disposable, reinventing "where should validation happen" or "when
should a function be split" under a new name in a later domain — would
recreate Lesson 51's own term drift a fourth time, now at the scale of
implementation-level practice instead of a single bounded context.
Naming this domain's vocabulary once, precisely, across these twelve
lessons, and committing to reusing it rather than reinventing it, is
this curriculum's own ubiquitous language, holding at every scale it
has been tested against so far — a single field, a single object, a
single module, an entire system's own architecture, and now the actual
lines of code living inside every boundary that architecture drew.

## Connect the Pieces

Twelve lessons, one throughline, walked start to finish: **every
decision in this domain was a deliberate, consistent choice among
legitimate alternatives, held to everywhere the same situation recurred,
and revisable only by the same rigor that justified it the first
time.** A gold-tier order's own $42.00 subtotal carried every one of
those decisions at once, by the time this domain closed: guard clauses
that exposed a real hidden bug (Lesson 93), names that need no private
decoder (Lesson 94), a body decomposed into four independently
verifiable rules behind a keyword-only boundary that made a real
silent mistake impossible to write (Lesson 95), an accumulator whose
state never escapes the function that owns it (Lesson 96), a specific,
named exception instead of a silent wrong answer (Lesson 97), an
audit trail that stays honest even when an order fails (Lesson 98), a
functional core pure enough to preview without side effect (Lesson
99), input rejected at the exact point it enters, by name and position
(Lesson 100), a discount rate configurable from outside the source
code without risking two disagreeing copies (Lesson 101), a file
structure that makes its own responsibilities visible on sight (Lesson
102), and a value object that turned three easily-confused primitives
into one enforced, growable concept (Lesson 103). Every one of these
is a decision this domain can point to a real bug, a real number, or a
real measured cost for — and every one of them remains open to revision
the moment new evidence, gathered with the same discipline, says it
should be.

## What Breaks Without This

Take any one of this domain's own twelve conventions and apply it
inconsistently — guard clauses in some functions, deep nesting in
others chosen by whoever happened to write them; keyword-only
parameters on `calculate_order_total` but not on some new function
added later without anyone remembering why the pattern mattered. What's
missing isn't correctness in any one function — each one, read alone,
can still be individually right. What's missing is the one property
this entire domain was built to produce: a reader who has learned how
this codebase makes one kind of decision can no longer predict how it
makes any of the others, because "sometimes" is not a convention, and a
codebase where every function might or might not follow last lesson's
own discipline is exactly as unpredictable, to someone reading it cold,
as one that never adopted the discipline at all.

## Exercises

1. Pick any one convention from this domain's own twelve lessons that
   this lesson's first Concept Unit didn't already name directly. State
   the real, honest tradeoff its own SE Lens gave for it, and describe
   one hypothetical future situation where that tradeoff would flip.
2. Name one real codebase you've worked in, or read, that you believe
   applies a convention inconsistently — some functions one way, others
   a different way, with no stated reason for the difference. What
   specifically would you need to know to tell whether that
   inconsistency is a real problem, or a deliberate, justified
   exception this domain's own second Concept Unit would recognize as
   legitimate?
3. Without rereading this domain, write down, from memory, which
   specific lesson introduced each of these: guard clauses, keyword-only
   parameters, the mutable default argument trap, `validate_order_lines`,
   `OrderRequest`. It's fine to get one wrong — the goal is noticing
   which of this domain's own twelve lessons you already have a genuine
   feel for.

## Definition of Done

- [ ] You can state, in your own words, why this domain calls its own
      subject "engineering conventions" rather than "best practices" —
      using this lesson's own second Concept Unit as your evidence for
      the distinction.
- [ ] You can name at least four specific conventions this domain
      established, by lesson, from memory.
- [ ] You can explain, using this domain's own real bugs — the gold-
      tier discount bug (Lesson 93), the subtotal/item_count swap
      (Lesson 95), the mutable-default-argument leak (Lesson 96) — how
      each one was a direct consequence of a convention not yet being
      in place, not an unrelated mistake that happened to occur nearby.
- [ ] You've completed all three exercises.
- [ ] No commit for this lesson — it added no new code. If you're
      tracking progress in a repository, note in a journal file or
      README that Domain 7 is complete, and name the one convention
      from these twelve lessons you expect to reach for most often
      going forward.

Domain 8, Version Control & Collaboration, is next.
