# Lesson 15: State and Recomposition

**What you will build:** A disposable counter composable, deliberately
built two ways — once broken, once working — proving exactly what
`remember` and `mutableStateOf` each contribute, and what
"recomposition" actually means when a composable's own data changes.
The transferable problem: Java's Lesson 27–29 (ahead of this series)
call `RecyclerView.Adapter.notifyDataSetChanged()` by hand, every single
time the underlying data changes, as a manual, error-prone signal that
something needs to be redrawn. Lesson 14 established that a `@Composable`
function describes UI as a function of its data — but a plain Kotlin
function has no built-in way to know when its own local data changed, or
any way to be re-run automatically when it does. This lesson names the
two real mechanisms that make it possible, and proves — by causing a
real, observable bug on purpose — exactly what goes wrong without one of
them.

**What you need to know first:** This series' Lesson 14 (`@Composable`,
`Column`, `Modifier`). Java's Lesson 26–29 (ahead of this series in the
Java sequence; referenced here only for what `notifyDataSetChanged()`
manually accomplishes, not its full mechanics — this series builds its
own Compose-based version of the grid rather than porting `Adapter`/
`ViewHolder` directly).

**Terms introduced in this lesson:**
- **Property delegation (`by`)** — a property whose reads and writes are
  handled by a separate delegate object, rather than a plain backing
  field, so the delegate can add its own behavior (caching, observing a
  change) around every access.
- **`mutableStateOf`** — creates a special, observable holder for a
  value; reading its `.value` inside a composable registers that
  composable to be notified when the value changes.
- **`remember`** — preserves a value across recompositions of the same
  composable, so a value created inside a function body isn't rebuilt
  from scratch every time that function runs again.
- **Recomposition** — Compose re-running a composable function (or the
  smallest part of it that actually depends on changed state), producing
  an updated description of the UI — not a mutation of an existing
  `View` tree.
- **Configuration change** — an event (a screen rotation, most commonly)
  that destroys and recreates the hosting `Activity` from scratch,
  discarding anything not explicitly preserved across it.

---

## Concept Unit: `by` — Property Delegation

### The Problem

A property's read and write normally go straight to its own backing
field (this series' own Lesson 03). Sometimes a property needs real
logic wrapped around every access — computing a value only the first
time it's ever read, for instance — without every single read site
having to remember to call a function instead of just reading a
property plainly.

### Introduce the Concept in Isolation

```kotlin
class LazyValue {
    val expensive: String by lazy {
        println("Computing now...")
        "computed result"
    }
}

fun main() {
    val obj = LazyValue()
    println("Object created")
    println(obj.expensive)
    println(obj.expensive)
}
```

Compile and run:

```
kotlinc ByDemo.kt -include-runtime -d ByDemo.jar
java -jar ByDemo.jar
```

Real output, from running this just now:

```
Object created
Computing now...
computed result
computed result
```

"Computing now..." prints exactly once, on the *first* read of
`obj.expensive`, even though `expensive` is read twice — and it doesn't
print at all when `obj` is merely constructed. `by lazy { ... }` is
**property delegation**: `expensive` isn't a plain, directly-stored
property at all — every read of it is handed off to a separate delegate
object (`lazy`'s own returned value), which decides what actually
happens on that read. `lazy`'s specific delegate runs its block only
once, caches the result, and returns the cached value on every
subsequent read — confirmed directly by the single "Computing now..."
line.

### Discard the Throwaway Example

`ByDemo.kt`/`LazyValue` are deleted. `by` itself is not a
Compose-specific keyword — it's a general Kotlin language feature, and
Compose's own `remember`/`mutableStateOf` pairing, in the next unit, is
simply one more delegate built on the identical mechanism.

### CS Lens

Delegating a property's actual behavior to a separate object, while
callers keep reading and writing it with ordinary property syntax, is
the **Proxy pattern** (or, depending on exactly what the delegate adds,
**Decorator**) — a stand-in object controlling or augmenting access to
something, transparently to the code using it.

Also recognized in: Python's `@property` decorator with custom
getter/setter logic, C#'s own property accessors, and any ORM library's
"lazy-loaded" model fields, which defer an expensive database read until
the field is actually accessed for the first time — structurally the
same idea as this lesson's own `lazy` delegate.

---

## Concept Unit: `mutableStateOf` and `remember` — Together, Not Separately

### The Problem

A composable needs to hold a value that changes over time — a counter,
a piece of typed text, whether a row is selected — and have the screen
actually update when it does. An ordinary `var count = 0` declared
inside a composable's function body is a plain local variable: nothing
about reassigning it tells Compose "something changed, please redraw."

### Introduce the Concept in Isolation

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }

    Column {
        Text(text = "Count: $count")
        Button(onClick = { count++ }) {
            Text(text = "Increment")
        }
    }
}
```

`mutableStateOf(0)` creates a real, observable holder around the value
`0` — not the value itself, a wrapper object with its own `.value`
property. `remember { ... }` runs the lambda exactly once, the *first*
time this specific composable is placed on screen, and preserves
whatever it returns across every subsequent recomposition — without it,
a fresh `mutableStateOf(0)` would be created from scratch on every
single recomposition, and the counter could never hold a value greater
than what it started at. `by` — reappearing, this lesson's own property
delegation concept, just proven with `lazy` — lets `count` be read and
written as if it were a plain `Int` (`count++`, not
`count.value++`), while every read and write actually goes through the
underlying `mutableStateOf` holder's real `.value` property underneath;
`mutableStateOf`'s return value is a delegate exactly like `lazy`'s was,
just one that also triggers recomposition on write instead of merely
caching on read.
Tapping "Increment," when you build and run this yourself, updates the
displayed count immediately — Compose detected that `count`'s value
changed, and re-ran exactly the part of `Counter` that depends on it.

### Discard the Throwaway Example

`Counter` is deleted. `remember { mutableStateOf(...) }` is the exact
pattern the real inventory list state uses starting next lesson.

### CS Lens

A value that automatically notifies interested parties when it changes
is the same **Observer pattern** Java's own Lesson 16 already named for
`setOnClickListener` — here, the "observer" isn't an object you register
by hand; it's Compose's own runtime, automatically tracking which
composables read which pieces of state during composition, and
re-running exactly those composables — and no others — when a read
value later changes.

Also recognized in: spreadsheet formulas (changing one cell
automatically updates every formula that reads it, without manually
telling each one), reactive programming frameworks generally, and
React's own `useState` hook, which solves the identical problem — a
plain local variable inside a function component would also be
discarded every time that function re-runs — with a near-identical
two-part shape (a state holder, plus a mechanism ensuring it survives
across re-renders).

### SE Lens

**Why does Compose need two separate concepts — `remember` and
`mutableStateOf` — instead of one function that does both jobs at
once?** They solve genuinely independent problems: `mutableStateOf`
makes a value *observable* (reading it registers interest; writing it
triggers recomposition), while `remember` makes a value *survive*
being recreated when its enclosing function runs again. Either one
without the other is broken in a different way — `mutableStateOf`
alone, freshly created every recomposition with no `remember`, resets to
its initial value constantly; `remember` alone, wrapping a plain
non-observable value, would preserve it correctly but never trigger a
redraw when it changes. Keeping them separate also means `remember` has
a real, independent use for values that need to survive recomposition
but were never meant to trigger one — an object that's expensive to
construct but doesn't itself need to be observed.

---

## Concept Unit: What Recomposition Actually Means

### The Problem

"Compose re-ran the function" is a claim, and this series' own standard
for a claim about behavior a reader can't directly see is proof, not a
confident sentence.

### The Evidence

Add a plain, unguarded print statement directly inside `Counter`'s body,
outside the `Column`:

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    println("Counter composing, count = $count")

    Column {
        Text(text = "Count: $count")
        Button(onClick = { count++ }) {
            Text(text = "Increment")
        }
    }
}
```

When you build and run this yourself and watch Logcat (Compose's own
`println`/`Log` output appears there identically to any other Kotlin
code), the line prints once when the screen first appears, and prints
*again*, with an incremented `count`, every single time the button is
tapped — direct, observable proof that **recomposition** means Compose
genuinely calling `Counter`'s own function body again, from the top,
not quietly mutating a `Text` widget's displayed string in place the way
`binding.usernameField.text = "..."` would have mutated a real `View`
object directly. The `remember` block itself does *not* re-run on these
later calls — confirmed by the counter's value continuing upward instead
of resetting to `0` — `remember` specifically remembers its own
lambda's result across exactly this repeated re-execution.

### CS Lens

Re-running a whole function to produce an updated result, rather than
mutating previous output in place, is the same **idempotent, pure
description** idea behind Lesson 14's declarative framing — recomposition
is simply that idea's runtime mechanism made concrete: given the same
inputs, `Counter` always describes the same UI; given different inputs
(a changed `count`), calling it again produces a different, correct
description, with no dependency on whatever the previous call happened
to leave behind.

---

## Concept Unit: What Breaks Without `remember` — a Real, Observed Failure

### The Problem

State this series' own Lesson 04 named — a rotation destroying and
recreating the hosting `Activity` — is a real event this project's UI
needs to survive correctly. Does `remember` alone survive it?

### The Failure, Caused on Purpose

Build and run `Counter` on a real device or emulator, tap "Increment"
several times so the count reads a value other than `0`, then rotate the
device.

Real result, when you do this yourself: the counter resets to `0`.
`remember` preserves a value across *recomposition* — Compose re-running
a function while the same `Activity` instance is still alive — but a
**configuration change** (a rotation, by default) destroys the entire
hosting `Activity` and creates a brand-new one from scratch, exactly the
same lifecycle event this series' own Lesson 04 named when explaining
why `binding` is declared `lateinit var` rather than initialized at
declaration time. `remember`'s memory doesn't survive that: a new
`Activity` means an entirely fresh composition, starting over from
`mutableStateOf(0)`'s literal initial value, with nothing left over from
before.

### Discard the Failing Example

This exact `Counter` is not carried into the real project — its failure
is the honest point being made, not a bug to silently work around here.
Lesson 18 names the real fix directly, once the inventory grid's own
list state hits this identical wall for real.

### SE Lens

**Why does Compose let `remember`'s memory be this fragile, instead of
automatically surviving every possible event, including a full
`Activity` recreation?** `remember` genuinely can't survive a full
object recreation on its own — the composition itself, along with
everything `remember` was holding onto, is thrown away and rebuilt along
with the `Activity` that hosted it. Making `remember` survive this would
require Compose to serialize and restore arbitrary objects across a
process that might, in the worst case (a configuration change under
memory pressure), not even keep the same process alive at all. Rather
than attempt that generally and unreliably, Compose keeps `remember`
honest about a real, narrower guarantee — survives recomposition, not
recreation — and provides a separate, deliberate tool
(`rememberSaveable`, and eventually a real `ViewModel`, this series'
own Lesson 19) for state that specifically needs to survive further.

---

## Connect the Pieces

One trace: `mutableStateOf(0)` created a real, observable value holder;
`remember { }` ensured that exact holder — not a fresh one — persisted
across every recomposition of `Counter` while its `Activity` stayed
alive. Tapping "Increment" changed the holder's value, which Compose
detected because `Counter`'s own body had read it during composition,
triggering a real, observable recomposition — proven directly by a
`println` firing again with the new value, not merely asserted. Rotating
the device proved the real edge of `remember`'s guarantee: a
configuration change recreates the `Activity` and its entire
composition from nothing, and `remember`'s memory does not survive that
specific event, however completely it survives ordinary recomposition.

## What Breaks Without This

This lesson's own rotation experiment *is* "what breaks" — a real,
observed reset to `0`, caused deliberately, not merely described. As a
second, smaller failure: remove `remember`, leaving `var count by
mutableStateOf(0)` directly inside the function body with no wrapper at
all, and tap "Increment" repeatedly.

Real result, when you do this yourself: the counter never advances past
`1` — each tap triggers a recomposition, which re-runs `mutableStateOf(0)`
from scratch, starting over at `0` and then immediately incrementing
once, every single time. This is the concrete version of this lesson's
own SE Lens: `mutableStateOf` without `remember` is observable but not
preserved.

## Exercises

1. Add a second `remember { mutableStateOf(...) } ` value to `Counter`
   tracking whether the count is even or odd (recomputed, not stored
   independently — a `val`, not a `var`, reading the first state's
   current value), and display it in a second `Text`. Confirm it updates
   correctly on every tap without its own separate `remember` wrapper
   being strictly necessary — reasoning about why a derived, recomputed
   value doesn't need its own state holder the way `count` itself does.
2. Reproduce this lesson's `println`-based recomposition proof yourself,
   watching Logcat live while tapping the button several times, and
   count how many times the line actually printed versus how many times
   you tapped — confirming the two numbers match exactly.
3. Reproduce the rotation-reset failure yourself on a real device or
   emulator, then look up `rememberSaveable` (not built in this lesson)
   and explain, from its documentation alone, why substituting it in
   place of plain `remember` would likely fix this specific failure.

## Definition of Done

- [ ] You ran the counter composable yourself and watched it correctly
      increment on tap.
- [ ] You observed the real `println`/Logcat proof of recomposition
      firing on each tap, with the correct, incrementing value each
      time.
- [ ] You caused the rotation-reset failure yourself, on a real device
      or emulator, and can explain precisely why `remember` didn't
      prevent it.
- [ ] You caused the "resets to 1 on every tap" failure from omitting
      `remember` entirely, and can explain why it's a different failure
      from the rotation case.
- [ ] You can state, precisely, what `remember` guarantees and what it
      does not.
- [ ] Commit: not applicable — every example in this lesson is a
      disposable lab; no real project files changed.

Next: the real inventory grid, rebuilt with `LazyColumn` — a direct,
detailed contrast against `RecyclerView.Adapter`'s real contract, now
that `@Composable`, state, and recomposition are all in place to build
it honestly.
