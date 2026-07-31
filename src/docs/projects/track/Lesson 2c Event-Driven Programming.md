# Lesson 2c: Event-Driven Programming — A Different Shape of Program

**What you will build:** No new code — this lesson names a paradigm
already demonstrated by real, compiled, executed code from the previous
two lessons.

**What you need to know first:** Lesson 2a's inversion of control,
Lesson 2b's callback.

**Terms introduced in this lesson:**

- **Event-driven programming** — a program's execution is driven by
  responding to discrete events as they occur, rather than running
  once, top to bottom, like a script.

---

## Concept Unit: Event-Driven Programming — A Different Shape of Program

### The Problem

Every program before Lesson 2a had one clear starting point and ran top
to bottom until it finished. Lesson 2a and Lesson 2b's code still,
technically, ran and finished that way too — but the *reason* those
patterns exist is a program shape that genuinely doesn't: one that
starts up, then waits, responding to whatever happens next, for as long
as it runs, with no single top-to-bottom script describing its entire
behavior in one pass.

### Introduce the Concept in Isolation

This concept doesn't need new runnable code beyond what Lessons 2a and
2b already built and already produced real output for — it names the
paradigm those lessons were both already examples of. Both
`MiniFramework` (inversion of control) and `Button`/`ClickHandler`
(callbacks) are small pieces of `event-driven programming` — **first
appearance**: a program's execution is driven by responding to discrete
events as they occur, rather than running once, top to bottom, like a
script. A real button in a real UI doesn't know, in advance, when — or
whether — it will ever be clicked; its code exists purely to be *ready*
to respond whenever that event actually happens.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a paradigm already
demonstrated by Lesson 2a and Lesson 2b's own real, compiled, executed
code.

### Mechanical Walkthrough

No new syntax appears in this unit; its content is the CS/SE framing
below, applied to code already run and proven in Lesson 2a and Lesson
2b.

### CS Lens

Event-driven programs are structured around **events** — discrete
occurrences (a click, a message arriving, a timer firing) — and
**handlers** registered to respond to them, rather than a single
sequential script. Every `main` method in this course still runs top to
bottom — but real event-driven systems (a real button in a real running
application) sit idle between events indefinitely, calling registered
handlers only when something actually happens, for as long as the
program keeps running.

Also recognized in: every GUI application ever built, server code
responding to incoming network requests, any script that reads and
reacts to sensor input in a loop, video game engines processing player
input frame by frame.

### SE Lens

This concept itself names a paradigm rather than introducing a new
design tradeoff of its own — the tradeoffs (giving up control of timing
and sequence) were already covered under inversion of control, its
underlying mechanism.

---

## Connect the Pieces

Lesson 2a's `MiniFramework` and Lesson 2b's `Button` are both real,
already-run examples of event-driven programming — code that responds
to moments it doesn't schedule itself. The next lesson (Template Method
Pattern) names a more specific, fixed-sequence shape this same paradigm
often takes.

## What Breaks Without This

There's no new code to break in this unit — the failure mode this
concept guards against is conceptual: mistaking `main`'s own top-to-
bottom execution for the *only* shape a program can take, and being
surprised when a real Activity's `onCreate` doesn't run the way a
plain `main` method would.

## Exercises

1. Name, from memory, one real-world event-driven system you interact
   with daily (a phone's own home screen counts).
2. Explain, in your own words, why a real button's code must be
   "ready" for a click rather than actively waiting for one in a loop.
3. Contrast, in your own words, Lesson 2a's `MiniFramework.run()` (which
   still runs top to bottom once) with a genuinely long-lived,
   indefinitely-waiting event-driven system.

## Definition of Done

- [ ] You can state, without looking back at this lesson, what
      distinguishes an event-driven program from a top-to-bottom
      script.
- [ ] You completed Exercise 1 and Exercise 3.
