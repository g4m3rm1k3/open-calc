# Android Pattern Schema

This is the production template for every file in
`src/docs/tutorials/Android Patterns/`. It is a sibling to `LESSON
SCHEMA.md`, not a replacement — the Repetition Rule and the tokenize-
before-you-write discipline below are carried over from it, in spirit.
Everything else in `LESSON SCHEMA.md` assumes a single project
accumulating across a lesson sequence, built and verified by actually
running code. This series has none of that: no accumulating project, no
compiling, no running, no throwaway labs. Each file documents exactly
one Android pattern, stands completely alone, and is read once, for
reference — closer to a Gang-of-Four pattern-catalog entry than a
lesson.

---

## What "standalone" means here

A pattern file assumes nothing beyond ordinary Java syntax and basic
Android project setup (an app exists, has an `Activity`, compiles). It
never references another pattern file, another lesson, or "Lesson N" —
there is no lesson sequence to point into. If explaining this pattern
genuinely requires another named pattern as a collaborator (the Adapter
pattern's ViewHolder participant, say), that collaborator gets explained
inline, to the depth this pattern's own mechanics require — never by
pointing elsewhere and trusting the reader already read it.

## The Bounded Vocabulary Rule

Only define what this pattern's own shown code actually uses as part of
*making the pattern work*. A related Android concept that doesn't
appear in this pattern's shape — a sibling class, a lifecycle method
this pattern doesn't call, a broader architectural idea only tangentially
connected — stays out, even if it would be natural to mention.

This also draws a line inside the shown code itself, not just around it:
ordinary ambient Android/Java scaffolding that's merely present so the
example compiles (`Context`, a resource-ID constant, the fact that some
class extends `Activity`) is assumed known and does not need its own
entry. Anything that is part of *how the pattern itself does its job* —
every method the pattern's own mechanism calls, every type it hands
around — does need one, even if it's a familiar-looking standard-library
or framework call. The test: if removing this symbol from the snippet
would break the pattern's own mechanism, it's in scope; if the snippet
would still demonstrate the same pattern with a different stand-in
value, it's ambient and out of scope.

Same mechanical fix as `LESSON SCHEMA.md`'s Vocabulary Extraction Rule:
tokenize every code span this file will show before writing prose, and
give every in-scope token — keyword, annotation, class, method — a Terms
or Objects-and-methods slot, filled before any walkthrough prose is
written.

## The Repetition Rule (carried over unchanged)

Every concept, construct, method, or term gets full, real treatment at
every use inside this file — first appearance or the fifth. No reduced
tier for reappearance, no "as explained above" shorthand. A single file
is short enough that this rarely produces much real repetition; it
exists mainly so a term isn't defined once, early, then leaned on
silently several paragraphs later.

---

## Header (write once)

```
# <Pattern Name>
```

- **What problem this solves** — one paragraph, in the abstract, before
  any Android specifics: what goes wrong without this pattern, in any
  language, any framework.
- **Classic pattern family, if any** — name the Gang-of-Four (or other
  well-established) pattern this is an instance of, and define that
  classic pattern's own idea in one or two sentences, inline, right
  here — never assume the reader already has that vocabulary from
  outside this file, even if they're reading GoF right now. If this is
  Android-specific with no real classic antecedent (a lifecycle-callback
  contract, say), say so plainly instead of forcing a label onto it.
- **Where you'll meet it in Android** — the real, current class or
  interface names this pattern shows up as. Concrete, never "in various
  UI components."
- **Terms used in this pattern** — same format as `LESSON SCHEMA.md`:
  the term, bolded, an em-dash, a definition stating *why* it exists,
  not just what it means. Bounded per the rule above.
- **Objects and methods used** — same three-part format as `LESSON
  SCHEMA.md`: one bolded name, then *What it is:*, *Implementation:*
  (real signature, return type, real inheritance relationship), *Its
  use:* (why this pattern reaches for it specifically). Every class,
  interface, or method the pattern's own mechanism depends on gets an
  entry, including the pattern's own subject.

---

## The Shape

*(This is the section `LESSON SCHEMA.md` doesn't have — the whole
collaboration, described as one system, before any single piece is
explained.)*

Before any mechanical walkthrough: name every participant (every
class or interface involved), give each one a one-line role, and
describe in plain prose how they relate to each other as a working
system — who holds a reference to whom, who calls whom, what triggers
the whole thing. A short text diagram is welcome if it clarifies the
relationships (boxes and arrows, plain ASCII), but never as a
replacement for the prose — a diagram shows *that* two things connect;
prose has to say *why*.

The test for this section: a reader who stops after The Shape and reads
no further should already be able to describe the pattern's overall
idea to someone else, even without knowing a single method signature
yet. If they'd still be stuck at "well, there are a few classes
involved," the section hasn't done its job.

## Mechanical Walkthrough

Same discipline as `LESSON SCHEMA.md` step 7. Show the pattern's
canonical real shape — real interface/abstract-class signatures, and a
minimal, realistic usage snippet, not a from-scratch build sequence.
Literally enumerate every distinct in-scope syntactic element in the
shown code, in order — every method, every parameter, every generic
bound — before writing prose about any of it. Every item gets full
treatment: what it is, what it does, what it returns, and — per
`LESSON SCHEMA.md`'s "explain, don't just describe" standard — *why*
it's shaped this way, what would break without it, not just what it's
called. One bullet per named thing, never folded into a paragraph about
something else.

Fluent or chained calls get every link its own bullet, same as `LESSON
SCHEMA.md` — a `.setTitle(...).setMessage(...).create()` chain is three
things to explain, not one chain to wave through.

## Collaboration — how it actually runs

Most Android patterns exist because the *framework* calls your code at
a time you don't control, not because your code calls itself in a
sequence you write out top to bottom. Use the numbered control-flow
list shape from `LESSON SCHEMA.md` (never a code fence — this is prose
about code, not code) — one step per call, in the real order the
framework actually makes them, stating not just *that* each one fires
but *why* it fires then and not earlier or later. This is usually the
section that resolves the "heck of a time" part — the Shape and the
Walkthrough explain the pieces; this explains *when* Android decides to
touch them, which isn't visible from reading your own code top to
bottom.

## Why It's Shaped This Way

Name the design principle this pattern serves. State the alternative
that wasn't chosen and the real cost it would have had — a real
tradeoff, not a vocabulary definition. State the cost this pattern
itself carries, honestly (a Builder means more typing than a
constructor for a trivial case; an Observer that isn't lifecycle-aware
leaks; a ViewHolder that skips its cache misses the entire performance
point).

## Recognizing It Elsewhere

Name several unrelated places the same idea recurs — other frameworks,
other languages, non-software systems. One example proves it's used
somewhere; several teach that it's a shape worth noticing on sight,
which is the actual point of reading GoF at all.

## Where This Actually Breaks

Practical, not theoretical: the specific, common mistake developers make
with this exact pattern — the wrong assumption that produces a real
bug (stale data in a recycled row, an Observer that outlives its
screen, a Builder call given in the wrong order for what it implies).
State the mistake, why it happens, and what it looks like when it goes
wrong — a symptom the reader could recognize in their own app.

---

## Self-check before calling a pattern file finished

- [ ] Does every Terms and Objects/methods entry explain *why* the
      thing exists, not just what it does?
- [ ] Was the Header assembled by tokenizing every code span in the
      file first, including inside a quoted signature — or does a
      technical word appear later with no Header slot?
- [ ] Does this file reference another pattern file, a lesson, or
      "Lesson N"? If yes, remove it and inline what's actually needed.
- [ ] Does the Terms glossary define anything the shown code doesn't
      actually use as part of the pattern's own mechanism? If yes, cut
      it — bounded vocabulary, not a general glossary.
- [ ] Does The Shape stand on its own — could a reader stop there and
      describe the whole pattern to someone else, or does it only make
      sense after the Walkthrough?
- [ ] Does every Mechanical Walkthrough bullet explain (why, what
      breaks without it) rather than only describe (what it's called,
      what it does)?
- [ ] Does every named method or class get its own bullet, never folded
      as a clause into a paragraph about something else — including
      inside The Shape and Collaboration?
- [ ] Is Collaboration a numbered list, not a code fence — and does
      each step say *why* it fires when it does, not just that it does?
- [ ] Does Why It's Shaped This Way name a real alternative and a real
      cost, not just define a term?
- [ ] Does Recognizing It Elsewhere name more than one unrelated
      recurrence?
- [ ] Does Where This Actually Breaks name a concrete, recognizable
      symptom, not just "be careful with this"?
