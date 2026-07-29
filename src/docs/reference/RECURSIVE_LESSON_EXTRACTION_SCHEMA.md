# Recursive Lesson Extraction Schema

This document governs a different question than `LESSON_CONTRACT.md`
and `LESSON SCHEMA.md` answer. Those two govern **how to write one
lesson once you already know its scope** — the Concept Unit shape, the
Glossary Rule, the Parent Contract Rule, execution traces, the
Explain-vs-Describe rule. This document governs **how to decide what
lessons should exist and in what order**, before any of that per-lesson
writing starts. Use this document first, to produce a chapter's worth
of lesson titles and scopes; use the other two to actually write each
one.

## The problem this exists to fix

A curriculum built one lesson at a time, forward, tends toward two
failure modes, both observed for real in this project:

1. **Reappearing concepts get thinner than they need to be.** The
   existing Repetition Rule ("a previously-taught concept reappearing
   gets a brief reminder, never a full re-explanation") is correct for
   genuinely basic syntax, but for a hard concept, many lessons later,
   a brief reminder is often not enough — the reader may not remember
   the first, full explanation from ten lessons ago, and a "brief
   reminder" reads as thinner than a fresh, standalone explanation
   would (the exact gap a learner will notice the moment they ask a
   general-purpose AI the same question and get a longer, freestanding
   answer with no memory of "this was already covered").
2. **Lessons cram multiple independent concepts into one unit because
   a reference implementation happens to introduce them together.** A
   real feature (an Activity's `onCreate`, say) might genuinely require
   five unrelated ideas at once — a Manifest entry, inheritance and
   method overriding, access modifiers, a generated resource class, and
   Logcat — and a lesson written by walking through that feature
   top-to-bottom tends to teach all five in one pass, each getting a
   fraction of the room it would get on its own.

Both failure modes come from the same root cause: building lessons
**forward**, from "here's the next feature," instead of **backward**,
from "here's the feature — what, exactly, does understanding it
require, and how much of that is already true for this specific
reader?"

## The core idea: backward design from a working feature

Do not invent a chapter's content from scratch. Start from a **feature
lesson** — a lesson that already shows a real, working implementation
of something, written for a reader who already has the background it
assumes. In this project, `src/docs/projects/track/` is exactly that:
complete, correct, already covering the whole app, written for a reader
who already knows Java and Android. Treat one `track/` lesson (or one
cohesive unit of one) as the **capstone** of a chapter. Everything else
in the chapter exists only to make that capstone teachable to the
actual target reader, and is derived from the capstone itself, not
invented independently of it.

## The method

### Step 1 — Pick the capstone

Choose one feature lesson (or a clearly bounded piece of one) as the
chapter's ending point. State, explicitly, who the *original* lesson
assumed as its reader — usually stated directly in its own "What you
need to know first" line. That stated assumption is the thing this
whole process exists to replace.

### Step 2 — Build the dependency tree

Read the capstone in full. For every construct, API, pattern, or idea
it uses, ask: *what would someone need to already understand for this
specific line to make sense?* Recurse on each answer the same way,
until you reach nodes that are either (a) genuinely universal
background (variables, loops, functions — the kind of thing "coming
from Python or JavaScript" already covers) or (b) something the
capstone itself fully teaches, in place, without leaning on outside
knowledge.

Write the tree down. Two shapes will emerge, and they need different
treatment:

- **True prerequisites** — concepts the capstone *uses* but does not
  *teach*, because its original author assumed the reader already had
  them. These are gaps a new reader will fall into. Each one needs its
  own lesson (or its own clause in an already-planned lesson) before
  the capstone.
- **The capstone's own real content** — concepts the capstone already
  teaches, from the ground up, adequately, for the intended new reader.
  These do not need extraction into a separate lesson; they stay in the
  capstone exactly as they are.

The test for sorting a node into the first bucket versus the second is
not "is this hard" — it's **"does the capstone's own text actually
explain this, or does it use it and move on assuming the reader already
has it?"** Read the capstone's actual prose to answer this, every time;
do not guess from the topic alone.

### Step 3 — Prune against the target reader's stated background

The tree is not absolute — it is relative to one specific, explicitly
stated reader profile (e.g. "knows Python/JavaScript basics; zero Java;
zero Android," the profile `track-beginner` already commits to). Before
turning any tree node into a lesson, ask whether that stated background
already covers it. If yes, prune the node — it needs no lesson, not
even a clause; if the target reader's own background doesn't include
it, keep it. This step is why "files and folders" and "what a loop is"
disappear from the tree for a Python/JS-background reader even though
they are, technically, real prerequisites of everything downstream —
they are covered by the reader's stated starting point, not by
anything this curriculum needs to teach.

**State the target reader's background once, explicitly, per
curriculum** (or per chapter, if it changes) — every pruning decision
in every chapter depends on it, and it should never be re-derived
silently from a sense of "this feels too basic to explain."

### Step 4 — Find the seams

Once the tree is pruned, look for natural breaks between clusters of
nodes that don't depend on each other. This is the Recursive Concept
Extraction Rule's own "split at the seam between concepts" idea, from
`LESSON SCHEMA.md`, applied one level up — not splitting a single
lesson's Concept Units, but splitting an entire chapter's worth of
prerequisite material into separate lessons. A cluster becomes its own
lesson when:

- it's independent of the other clusters (learning it doesn't require
  any of the others first), and
- it's substantial enough to need real room — a full Concept Unit's
  worth of Problem/Isolate/Walkthrough/Lenses, not a single clause.

A cluster that's small enough to state in one or two sentences, with no
real isolated proof needed, can be folded as a clause into whichever
lesson needs it, rather than promoted to its own lesson — matching the
Stopping Rule's existing "don't split down to punctuation" instinct,
now applied at the chapter level: don't split a chapter down to
one-sentence lessons either.

### Step 5 — Order leaves first, write the capstone last

Order the resulting lessons so every lesson's own prerequisites were
already covered by an earlier lesson in the same chapter. The capstone
is always last. When writing it, **reuse the original feature lesson's
content as directly as possible** — the whole point of starting from an
already-correct, already-verified implementation is not re-deriving it.
The only edits the capstone needs are:

- its own "What you need to know first" line, repointed from the
  original assumed background to the new prerequisite lessons this
  chapter just built, and
- trimming any inline aside that now duplicates a prerequisite lesson's
  own, fuller explanation (cite it briefly instead, per the existing
  citation rule in `LESSON SCHEMA.md`).

If the capstone's own text turns out to already explain something
adequately for the target reader (Step 2 sorted it into "the capstone's
own real content"), leave it alone — don't manufacture a prerequisite
lesson for something the capstone was never actually missing.

## The just-in-time deferral rule

A node belonging in the tree does not have to be taught in *this*
chapter just because the capstone happens to touch it. Prefer deferring
a prerequisite to whichever future chapter is actually forced to depend
on it, over front-loading it now because the reference lesson mentions
it early. Two concrete tests for whether a deferral is legitimate:

1. **Does the capstone's own logic actually depend on the reader
   understanding this right now**, or does it just reference the
   thing's *existence* in passing? A generated resource class
   (Android's `R`) referenced once, by a wizard-generated file the
   reader isn't asked to touch yet, doesn't need a lesson the moment it
   first appears on screen — it needs one the first time the reader is
   asked to *use* it deliberately.
2. **Would deferring it cost a future chapter more than teaching it now
   would cost this one?** Four access-modifier levels, side by side,
   cost little to teach once real classes with real fields already
   exist to demonstrate them against — but teaching all four the moment
   a single `protected` keyword appears, before the reader has written
   a class with more than one field, front-loads a comparison the
   reader has no concrete reason yet to care about.

When in doubt, defer. A concept taught right before it's needed lands
better than the same concept taught early and re-explained later
anyway.

## Worked example: `track/` Lesson 1

Full pilot output for this example lives at
`PILOT Chapter 1A - The Shape of a Java Program.md` (built during the
session that introduced this schema). Summarized:

**Capstone:** `track/`'s "Lesson 1: Where Your Code Actually Lives."
Its own stated reader: "You've taken a basic Java class, so `public
class`, `public static void main`, and `System.out.println` are
assumed familiar."

**Tree:**

```
True prerequisites (not taught by the capstone)
├── Files/folders/paths           → pruned: covered by "coming from Python/JS"
├── Compile vs. run as two steps  → kept: never explained in the capstone at all
└── Basic Java syntax             → kept: explicitly named as assumed by the capstone itself
    ├── class / public
    ├── static void main(String[] args)
    └── System.out.println

The capstone's own real content (left alone, not extracted)
├── package declaration as a compiler-checked folder claim
├── javac -d / package-aware compilation
├── fully-qualified name addressing
└── wizard mechanics
```

**Seams:** exactly one — "basic Java syntax + compile/run" is
independent of everything else and substantial enough for its own
Concept Unit. Nothing else in the tree survived pruning.

**Result — Chapter 1, two lessons:**
- **1A (new):** *The Shape of a Java Program* — closes the one real
  gap, written from scratch.
- **1B (the capstone):** `track/`'s own Lesson 1, unchanged except one
  line repointing "What you need to know first" at Lesson 1A instead
  of "a basic Java class."

This is the easy case: one clean seam, one new lesson, the capstone
needing almost no editing. `track/`'s own Lesson 2 is the harder case —
its tree has at least four independent seams (Manifest/XML,
inheritance-override-`super`-Template-Method, access modifiers, the
generated `R` class) bundled into one lesson, and at least one of those
(the `R` class) is a strong candidate for the just-in-time deferral
rule rather than a Chapter 2 lesson at all.

## Relationship to the rest of the reference set

- **This document** decides chapter scope and lesson order, before any
  lesson is written.
- **`LESSON_CONTRACT.md`** states the non-negotiable teaching
  principles (the Silent Knowledge Problem, the Glossary Rule, the
  Parent Contract Rule, Explain-vs-Describe) that apply to every lesson
  this process produces, prerequisite or capstone alike.
- **`LESSON SCHEMA.md`** is the concrete, mechanical per-lesson
  structure (Concept Unit shape, execution traces, the self-check
  checklist) used to actually write each lesson this process decided
  should exist.

## Checklist before calling a chapter's extraction done

- [ ] Is the capstone a real, already-working feature lesson, not
      something invented from scratch?
- [ ] Was the capstone's stated reader assumption identified explicitly,
      by reading its own "What you need to know first" line — not
      guessed at?
- [ ] Was every tree node sorted by actually reading the capstone's own
      prose (does it teach this or just use it), not by topic alone?
- [ ] Was the tree pruned against one explicitly stated target-reader
      background, not silently re-derived per node?
- [ ] Does every extracted lesson correspond to a real seam — independent
      of the others, substantial enough to need its own room — rather
      than a single clause promoted to a whole lesson?
- [ ] Was deferral considered for anything the capstone only references
      in passing, rather than automatically front-loading it?
- [ ] Does the capstone, as finally written, reuse the original
      reference lesson directly, with edits limited to its prerequisite
      line and trimming now-duplicated asides — not a rewrite from
      scratch?
