# Lesson 31a: Test Pyramid

**What you will build:** No new code to compile — this reads a real,
documented testing model directly.

**What you need to know first:** Lesson 30a's Unit Testing.

**Terms introduced in this lesson:**

- **Test Pyramid** — many fast, cheap unit tests forming a broad base,
  fewer slower, more realistic integration/UI tests forming a smaller
  layer above — each layer catching a different class of bug, at a
  different cost.

---

## Concept Unit: Test Pyramid

### The Problem

Lesson 30a's own plain-JVM unit tests run in milliseconds and can verify
pure logic thoroughly — but they deliberately avoid real Views and a real
`RecyclerView` entirely, so nothing about them can prove that a real
screen actually wires its parts together correctly once assembled.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, documented testing model,
verified against how this course's own two testing approaches actually
differ:

```
Many:  Plain-JVM unit tests (Lesson 30a) — milliseconds each,
       pure logic only, no real View, no real Activity.
       ↑
Fewer: Instrumented UI tests (the next lesson) — seconds each,
       a real Activity, real Views, a real device or emulator.
```

This is the `Test Pyramid` — **first appearance**: many fast, cheap unit
tests forming a broad base, fewer slower, more realistic
integration/UI tests forming a smaller layer above — each layer catching
a different class of bug, at a different cost. Lesson 30a's own unit
tests sit at the base — fast, numerous, but blind to whether a real
screen actually assembles correctly; instrumented tests (the next
lesson) sit higher up — slower, fewer, but able to catch exactly what
the base layer cannot.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, documented
testing model.

### Mechanical Walkthrough

1. Lesson 30a's own plain-JVM unit tests — **(b) reappearing**: run in
   milliseconds, verify pure logic, but use no real `Activity` or real
   View at all.
2. Instrumented UI tests (the next lesson) — **(a) first appearance** of
   this exact tradeoff, named: run in seconds, on a real device or
   emulator, against real Views — able to prove something unit tests
   structurally cannot.
3. Neither replaces the other — the Test Pyramid's own point is that a
   healthy suite needs many of the fast kind and fewer of the slow kind,
   not one or the other exclusively.

### CS Lens

The Test Pyramid is a resource-allocation model: since slower tests cost
more (in run time and often in flakiness), a healthy suite deliberately
has more of the cheap, fast layer and fewer of the expensive, slow layer
— not because the expensive layer is less valuable, but because it's
reserved for exactly what the cheap layer cannot verify.

Also recognized in: the Test Pyramid as a named concept across virtually
every mainstream software testing discipline, regardless of language or
platform — unit tests, integration tests, and end-to-end/UI tests, in
decreasing quantity and increasing cost, at each layer.

### SE Lens

The alternative — relying entirely on instrumented UI tests, skipping
unit tests — was not chosen because instrumented tests are slow and
comparatively expensive to run; most logic (Lesson 30a's own examples)
can and should be verified by fast unit tests, reserving slower
instrumented tests specifically for verifying that a real screen
actually wires everything together.

---

## Connect the Pieces

The Test Pyramid explains why both fast unit tests and slower
instrumented tests belong in the same suite, each catching what the
other structurally cannot. The next lesson shows the real, load-bearing
mechanism for the pyramid's upper layer.

## What Breaks Without This

Relying only on unit tests, with no instrumented tests at all, leaves a
real screen's own wiring entirely unverified — a component whose real
tap-to-result chain never actually connects would pass every unit test
while being genuinely broken on a real device.

## Exercises

1. Explain, in your own words, why Lesson 30a's own unit tests cannot
   verify that a real button tap actually shows a real result on screen.
2. Explain, in your own words, why the Test Pyramid recommends *fewer*
   instrumented tests than unit tests, rather than an equal number of
   each.
3. Name one class of bug a unit test could never catch, regardless of
   how thoroughly the pure logic is tested.

## Definition of Done

- [ ] You can state, without looking back at this lesson, what each layer
      of the Test Pyramid can prove that the other cannot.
- [ ] You completed Exercise 1.
- [ ] You can explain why a healthy test suite needs both layers, not
      just one.
