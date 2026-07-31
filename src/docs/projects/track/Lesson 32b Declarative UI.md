# Lesson 32b: Declarative UI

**What you will build:** No new code to compile — this contrasts two
real UI paradigms directly.

**What you need to know first:** Lesson 32a's State Hoisting, Lesson
1c's Views vs. Jetpack Compose.

**Terms introduced in this lesson:**

- **Declarative UI** — describing UI as what it should currently look
  like, re-invoked automatically on state change, rather than describing
  initial structure and then imperatively mutating pieces of it over
  time.

---

## Concept Unit: Declarative UI

### The Problem

Every screen since Lesson 2g has been built from two separate halves — an
XML layout file describing structure, and imperative Java glue code
(`setText`, `notifyDataSetChanged`, Lesson 6h) mutating specific views by
hand whenever data changes — kept in sync entirely by a developer
remembering to call the right update method at the right moment.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real contrast between two real UI
paradigms, verified against actual code shapes already shown in this
course:

```java
// Imperative (this course's own approach so far, Lesson 2g onward):
// the developer must remember to call setText every time quantity changes.
quantityTextView.setText(String.valueOf(quantity));

// Declarative: describe what the UI should show for the current
// quantity; the framework itself decides when and how to update it.
Text(text = quantity.toString())
```

This is `Declarative UI` — **first appearance**: describing UI as what
it should currently look like, re-invoked automatically on state change,
rather than describing initial structure and then imperatively mutating
pieces of it over time. The imperative version requires a developer to
remember to call `quantityTextView.setText(...)` at every single place
`quantity` changes; the declarative version states the relationship
once — this text shows `quantity`'s own current value — and never needs
a manual update call at any specific mutation site.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this contrasts two real UI
paradigms.

### Mechanical Walkthrough

1. `quantityTextView.setText(String.valueOf(quantity));` — **(b)
   reappearing** imperative view-mutation shape from Lesson 6h, requiring
   a developer to call this exact line at every point `quantity` changes.
2. `Text(text = quantity.toString())` — **(b) reappearing** Compose
   function-call shape from Lesson 1c, now examined specifically for its
   declarative relationship: it states what to show, not when to update.
3. Neither line, by itself, shows *when* an update happens — that's
   exactly the difference the next lesson makes concrete: something must
   decide when to re-run the declarative description.

### CS Lens

Declarative UI is the same general shift as declarative programming
broadly (SQL, Lesson 12c, declaring *what* rows to retrieve rather than
*how* to search for them) — applied here to UI: state *what* the screen
should show for a given state, and let the framework handle *how* and
*when* to actually update it.

Also recognized in: React and SwiftUI, and declarative UI frameworks
broadly — the same shift recurring independently across multiple
platforms once each one matured enough to support it.

### SE Lens

The alternative — the imperative approach this course has used
throughout (Lesson 2g onward) — was not a mistake; it makes the
structure/behavior split explicit and easy to teach in isolation. But it
does require a developer to correctly call every update method at every
mutation site, by hand, forever — exactly the repeated discipline
declarative UI removes.

---

## Connect the Pieces

Declarative UI names the underlying shift: state what the screen should
show, not when to update it. The next lesson shows Android's real,
load-bearing implementation of that shift.

## What Breaks Without This

Continuing to write imperative view-mutation code (`setText`,
`notifyDataSetChanged`) without ever calling it at some specific mutation
site leaves the real screen showing stale data — a real, observable bug
manual discipline is required to avoid.

## Exercises

1. Explain, in your own words, why `Text(text = quantity.toString())`
   alone, without a mechanism deciding when to re-run it, would not
   automatically update when `quantity` changes.
2. Name one other declarative system (besides SQL and UI frameworks)
   from earlier in this course, and explain what makes it declarative.
3. Explain, in your own words, why the imperative approach "makes the
   structure/behavior split explicit and easy to teach in isolation."

## Definition of Done

- [ ] You read the imperative-versus-declarative contrast and can state
      the difference in your own words.
- [ ] You completed Exercise 2.
- [ ] You can explain why declarative UI removes a specific, repeated
      developer responsibility.
