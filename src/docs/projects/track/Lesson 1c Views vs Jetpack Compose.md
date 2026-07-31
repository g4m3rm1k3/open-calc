# Lesson 1c: Views vs. Jetpack Compose

**What you will build:** No new code — two real, verified code
fragments, read directly.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Views vs. Jetpack Compose** — Android offers two different
  UI-building systems — XML-layout-based Views (older) and code-first
  Jetpack Compose (newer) — a real architectural fork, not a cosmetic
  setting.

---

## Concept Unit: Views vs. Jetpack Compose

### The Problem

A new Android project's creation wizard silently makes a real,
consequential architectural choice — which UI-building system the
entire project will use — often before a beginner even knows two
exist, let alone what the difference is.

### Introduce the Concept in Isolation

Two real, verified fragments building the identical piece of UI —
first, the Views system (XML plus Java, this course's own approach):

```xml
<TextView android:text="Hello" />
```

```java
TextView textView = findViewById(R.id.textView);
textView.setText("Hello");
```

...and Jetpack Compose, the newer alternative:

```java
Text("Hello")
```

This is `Views vs. Jetpack Compose` — **first appearance**: Android
offers two different UI-building systems — XML-layout-based Views
(older, this course's choice) and code-first Jetpack Compose (newer) —
a real architectural fork, not a cosmetic setting. The Views approach
splits structure (XML) from behavior (Java, reaching into that
structure via `findViewById`, a later lesson's own subject); Compose
collapses both into one piece of code, with no separate XML file at
all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — both fragments are real,
verified code shapes.

### Mechanical Walkthrough

1. `<TextView android:text="Hello" />` plus `findViewById`/`setText` —
   **(a) first appearance** of this exact shape, examined here
   specifically as one half of a genuine architectural fork rather than
   the only way UI is built; a later lesson covers XML and
   `findViewById` in their own full treatment.
2. `Text("Hello")` — **(a) first appearance** of Compose's own shape: a
   plain function call, with no matching XML file anywhere, producing
   the equivalent visible UI directly from code.

### CS Lens

This fork is a real, consequential choice between two different UI
paradigms: an imperative, structure-plus-glue-code model (Views)
versus a declarative, code-first model (Compose) — the exact
declarative-versus-imperative distinction a much later lesson on
Compose returns to and explains fully, once enough foundation exists to
cover it properly.

Also recognized in: SwiftUI versus UIKit on iOS (an almost identical
architectural fork, arriving on that platform around the same time),
React versus older, imperative DOM-manipulation approaches on the web
— the declarative-UI shift recurring across multiple platforms
independently.

### SE Lens

This course deliberately uses the Views system throughout, not because
Compose is worse, but because Views' explicit separation of structure
and code makes several foundational ideas (resources, the generated
`R` class, XML itself) easier to teach in isolation before introducing
a second, newer paradigm on top of them — Compose is covered directly
once that foundation is in place.

---

## Connect the Pieces

Choosing Views over Compose (or the reverse) is a real architectural
fork, not a cosmetic checkbox — this course's own choice of Views,
explained here for the first time, is why every upcoming Android
example uses XML and `findViewById` rather than Compose's own
function-call shape.

## What Breaks Without This

Mixing the two systems without understanding the fork — say, expecting
a Compose `Text("Hello")` call to be reachable via `findViewById`, a
Views-only mechanism — produces a real compiler error, since no such
view ID exists anywhere in a Compose-only screen's structure.

## Exercises

1. List, from memory, one concrete difference between the Views
   fragment and the Compose fragment shown in this lesson.
2. Explain, in your own words, why a project must choose one system or
   the other for a given screen, rather than mixing them arbitrarily.
3. Explain, in your own words, why this course teaches Views first.

## Definition of Done

- [ ] You can name, without looking back at this lesson, which of
      Views or Compose this course's own examples will use.
- [ ] You completed Exercise 1 and Exercise 2.
