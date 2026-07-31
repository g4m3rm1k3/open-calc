# Lesson 68: Declarative UI and Jetpack Compose

**What you will build:** Both units read real Android mechanisms
directly.

**What you need to know first:** Lesson 26's Views vs. Jetpack Compose
fork, Lesson 61's `LiveData`.

**Terms introduced in this lesson:**

- **Declarative UI** — describing *what* the UI should look like for a
  given state, with the framework itself responsible for figuring out
  *how* to update the actual screen — rather than imperatively mutating
  specific views by hand as data changes.
- **Jetpack Compose** — a UI toolkit where a function describes UI
  declaratively and is automatically re-invoked (recomposition) whenever
  the state it depends on changes, collapsing separate XML structure and
  imperative view-mutation code into one thing.

---

## Concept Unit: Declarative UI

### The Problem

Every screen since Lesson 11 has been built from two separate halves — an
XML layout file describing structure, and imperative Java glue code
(`setText`, `notifyDataSetChanged`, Lesson 46) mutating specific views by
hand whenever data changes — kept in sync entirely by a developer
remembering to call the right update method at the right moment.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real contrast between two real UI
paradigms, verified against actual code shapes already shown in this
curriculum:

```java
// Imperative (this curriculum's own approach so far, Lesson 11 onward):
// the developer must remember to call setText every time quantity changes.
quantityTextView.setText(String.valueOf(quantity));

// Declarative: describe what the UI should show for the current
// quantity; the framework itself decides when and how to update it.
Text(text = quantity.toString())
```

This is `declarative UI` — **first appearance**: describing *what* the
UI should look like for a given state, with the framework itself
responsible for figuring out *how* to update the actual screen — rather
than imperatively mutating specific views by hand as data changes. The
imperative version requires a developer to remember to call
`quantityTextView.setText(...)` at every single place `quantity` changes;
the declarative version states the relationship once — this text shows
`quantity`'s own current value — and never needs a manual update call at
any specific mutation site.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this contrasts two real UI
paradigms.

### Mechanical Walkthrough

1. `quantityTextView.setText(String.valueOf(quantity));` — **(b)
   reappearing** imperative view-mutation shape from Lesson 46, requiring
   a developer to call this exact line at every point `quantity` changes.
2. `Text(text = quantity.toString())` — **(b) reappearing** Compose
   function-call shape from Lesson 26, now examined specifically for its
   declarative relationship: it states what to show, not when to update.
3. Neither line, by itself, shows *when* an update happens — that's
   exactly the difference this lesson's own next unit (Jetpack Compose)
   makes concrete: something must decide when to re-run the declarative
   description.

### CS Lens

Declarative UI is the same general shift as declarative programming
broadly (SQL, Lesson 55, declaring *what* rows to retrieve rather than
*how* to search for them) — applied here to UI: state *what* the screen
should show for a given state, and let the framework handle *how* and
*when* to actually update it.

Also recognized in: React and SwiftUI (Lesson 26's own cited parallel),
and declarative UI frameworks broadly — the same shift recurring
independently across multiple platforms once each one matured enough to
support it.

### SE Lens

The alternative — the imperative approach this curriculum has used
throughout (Lesson 11 onward) — was not a mistake; it makes the
structure/behavior split explicit and easy to teach in isolation
(Lesson 26's own reasoning). But it does require a developer to
correctly call every update method at every mutation site, by hand,
forever — exactly the repeated discipline declarative UI removes.

---

## Concept Unit: Jetpack Compose

### The Problem

Stating a declarative relationship (this lesson's own previous unit) is
not enough by itself — something must actually decide *when* to
re-evaluate `Text(text = quantity.toString())` and update the real screen
once `quantity`'s own value changes.

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
`item.observeAsState()` connects `LiveData` (Lesson 61) directly into
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
   `LiveData` from Lesson 61, now feeding directly into Compose's own
   recomposition mechanism rather than a manual `.observe(this, ...)`
   callback.
3. `Text(text = currentItem?.quantity.toString())` — **(b) reappearing**
   declarative shape from this lesson's own previous unit; when
   `currentItem` changes, this whole function is automatically
   re-invoked — recomposition — and only the parts of the real screen
   that actually changed are updated.

### CS Lens

Jetpack Compose is this lesson's own declarative UI, real and
load-bearing: it collapses the two separate halves every earlier screen
in this curriculum needed (an XML file, Lesson 11, plus imperative Java
glue, Lesson 46) into one function, with recomposition replacing every
manual `setText`/`notifyDataSetChanged` call this curriculum has shown
since.

Also recognized in: React's own re-render cycle triggered by state
changes, SwiftUI's own view re-evaluation — the same recomposition idea,
named differently by each framework.

### SE Lens

The alternative — continuing to use Views and imperative update code, as
this curriculum has throughout (Lesson 26's own deliberate choice for
teaching foundational ideas in isolation) — remains valid and widely
used; Compose is not a strict replacement so much as a different,
newer paradigm, appropriate once a project no longer needs the explicit
structure/behavior separation Views makes easy to teach.

---

## Connect the Pieces

Declarative UI names the underlying shift: state what the screen should
show, not when to update it. Jetpack Compose is Android's real,
load-bearing implementation of that shift — recomposition is the actual
mechanism deciding *when* to re-run a declarative description, triggered
directly by `LiveData` (Lesson 61) changes via `observeAsState()`,
replacing every manual `setText`/`notifyDataSetChanged` call this
curriculum's own Views-based material has required since Lesson 11.

## What Breaks Without This

Continuing to write imperative view-mutation code (`setText`,
`notifyDataSetChanged`) without ever calling it at some specific mutation
site leaves the real screen showing stale data — a real, observable bug
this curriculum's own earlier lessons required manual discipline to
avoid. Declarative UI removes that specific failure mode by removing the
manual call sites altogether — but only once a framework like Compose
actually provides the recomposition mechanism to make it work.

## Exercises

1. Explain, in your own words, why `Text(text = quantity.toString())`
   alone, without Compose's own recomposition mechanism, would not
   automatically update when `quantity` changes.
2. Explain, in your own words, why `observeAsState()` is the bridge
   connecting `LiveData` (Lesson 61) into Compose's own recomposition
   system.
3. Explain, in your own words, why this curriculum deliberately taught
   Views first, connecting your answer to Lesson 26's own reasoning.

## Definition of Done

- [ ] You can state, without looking back at this lesson, the difference
      between declarative and imperative UI updates.
- [ ] You read the real `ItemRow`/`observeAsState()` example and can
      explain what recomposition replaces.
- [ ] You can explain why Compose is a different paradigm, not simply a
      strict improvement over Views.
