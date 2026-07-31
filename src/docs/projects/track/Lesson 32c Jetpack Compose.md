# Lesson 32c: Jetpack Compose

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 32b's Declarative UI, Lesson
16b's `LiveData`.

**Terms introduced in this lesson:**

- **Jetpack Compose** — a UI toolkit where a function describes UI
  declaratively and is automatically re-invoked (recomposition) whenever
  the state it depends on changes, collapsing separate XML structure and
  imperative view-mutation code into one thing.

---

## Concept Unit: Jetpack Compose

### The Problem

Stating a declarative relationship (Lesson 32b) is not enough by
itself — something must actually decide *when* to re-evaluate
`Text(text = quantity.toString())` and update the real screen once
`quantity`'s own value changes.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual Jetpack Compose framework source:

```java
@Composable
fun ItemRow(item: LiveData<Item>) {
    val currentItem by item.observeAsState()
    Text(text = currentItem?.quantity.toString())
}
```

This is `Jetpack Compose` — **first appearance**: a UI toolkit where a
function describes UI declaratively and is automatically re-invoked
(recomposition) whenever the state it depends on changes, collapsing
separate XML structure and imperative view-mutation code into one thing.
`item.observeAsState()` connects `LiveData` (Lesson 16b) directly into
Compose's own state system; whenever the observed `Item` changes,
`ItemRow` itself is automatically re-invoked — recomposition — and
`Text`'s own displayed value updates, with no `setText` call written
anywhere.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `@Composable fun ItemRow(item: LiveData<Item>)` — **(a) first
   appearance**: marks this function as one Compose can automatically
   re-invoke whenever its own observed state changes.
2. `val currentItem by item.observeAsState()` — **(b) reappearing**
   `LiveData` from Lesson 16b, now feeding directly into Compose's own
   recomposition mechanism rather than a manual `.observe(this, ...)`
   callback.
3. `Text(text = currentItem?.quantity.toString())` — **(b) reappearing**
   declarative shape from Lesson 32b; when `currentItem` changes, this
   whole function is automatically re-invoked — recomposition — and
   only the parts of the real screen that actually changed are updated.

### CS Lens

Jetpack Compose is Lesson 32b's own declarative UI, real and
load-bearing: it collapses the two separate halves every earlier screen
in this course needed (an XML file, Lesson 2g, plus imperative Java
glue, Lesson 6h) into one function, with recomposition replacing every
manual `setText`/`notifyDataSetChanged` call this course has shown
since.

Also recognized in: React's own re-render cycle triggered by state
changes, SwiftUI's own view re-evaluation — the same recomposition idea,
named differently by each framework.

### SE Lens

The alternative — continuing to use Views and imperative update code, as
this course has throughout — remains valid and widely used; Compose is
not a strict replacement so much as a different, newer paradigm,
appropriate once a project no longer needs the explicit
structure/behavior separation Views makes easy to teach.

---

## Connect the Pieces

Declarative UI (Lesson 32b) names the underlying shift: state what the
screen should show, not when to update it. Jetpack Compose is Android's
real, load-bearing implementation of that shift — recomposition is the
actual mechanism deciding *when* to re-run a declarative description,
triggered directly by `LiveData` (Lesson 16b) changes via
`observeAsState()`, replacing every manual
`setText`/`notifyDataSetChanged` call this course's own Views-based
material has required since Lesson 2g.

## What Breaks Without This

Continuing to write imperative view-mutation code without ever calling
it at some specific mutation site leaves the real screen showing stale
data — declarative UI removes that specific failure mode by removing
the manual call sites altogether, but only once a framework like
Compose actually provides the recomposition mechanism to make it work.

## Exercises

1. Explain, in your own words, why `observeAsState()` is the bridge
   connecting `LiveData` (Lesson 16b) into Compose's own recomposition
   system.
2. Explain, in your own words, why this course deliberately taught Views
   first, connecting your answer to Lesson 1c's own reasoning.
3. Name one thing recomposition replaces that this course's own earlier
   lessons required manual discipline to get right.

## Definition of Done

- [ ] You read the real `ItemRow`/`observeAsState()` example and can
      explain what recomposition replaces.
- [ ] You completed Exercise 1.
- [ ] You can explain why Compose is a different paradigm, not simply a
      strict improvement over Views.
