# Lesson 2: The View Reacts to State Instead of Being Told About It

*(A Counter That Updates Itself)*

**User Story**
> As a user, I want to tap a button and see the screen update immediately —
> with no code that manually pushes the new value onto the screen.

**What you will build**
A button and a number. Tapping the button increments the number on screen.
The transferable problem: in the Java course, updating a `TextView` after
some data changed meant explicitly calling `textView.setText(...)` at the
exact moment the data changed — you, the developer, were responsible for
remembering every place the UI needed to be told about a change. This lesson
introduces the idea that makes that manual bookkeeping unnecessary.

**What you need to know first**
Lesson 1's `@Composable`, `Column`, `Modifier`. From `../track/`: Lesson 16,
LiveData — "data that announces itself." Keep that lesson in mind
specifically; this unit is the same underlying idea, arrived at from the
opposite direction.

---

## Concept Unit: `mutableStateOf` and `remember`

### The Problem

A plain Kotlin `var` inside a composable function does not do what you'd
expect. Prove it — a naive, broken first attempt:

```kotlin
@Composable
fun BrokenCounter() {
    var count = 0
    Column {
        Text(text = "Count: $count")
        Button(onClick = { count++ }) {
            Text("Tap me")
        }
    }
}
```

Run this on a device. *What you'll observe:* the number never changes on
screen, no matter how many times you tap — even though `count++` is
definitely executing (you can confirm with a breakpoint). The variable
updates; the screen doesn't.

### Why the naive version fails

`BrokenCounter()` is a function. Like any function, its local variables
(`count`) are recreated from scratch every time it's called. Compose *does*
re-call this function when it needs to redraw — that's Concept Unit 2's
subject — but a plain `var count = 0` resets to `0` on every single one of
those re-calls, because nothing tells Compose "this particular value should
survive being recreated."

### The New Code

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    Column {
        Text(text = "Count: $count")
        Button(onClick = { count++ }) {
            Text("Tap me")
        }
    }
}
```

### The Updated Project

```kotlin
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }   // ← changed
    Column {
        Text(text = "Count: $count")
        Button(onClick = { count++ }) {
            Text("Tap me")
        }
    }
}
```

Tapping the button now correctly increments the visible number every time,
starting from `0` and never resetting on its own.

### Mechanical walkthrough

1. `mutableStateOf(0)` — (first appearance) creates a special
   **`MutableState<Int>`** object holding the value `0` — not a plain `Int`.
   This object is what Compose actually watches for changes.
2. `remember { ... }` — (first appearance) tells Compose: "run this lambda
   *once*, the first time this composable enters the screen, and hand back
   the exact same result on every subsequent recomposition instead of
   re-running it." This is what fixes `BrokenCounter`'s reset-to-zero bug —
   without `remember`, a fresh `MutableState(0)` would indeed be created on
   every recomposition, identical to the plain-`var` failure.
3. `by` — (first appearance) Kotlin's **property delegation** keyword.
   `remember { mutableStateOf(0) }` actually returns a `MutableState<Int>`
   object, not an `Int` — writing `var count = remember { ... }` would make
   `count` a `MutableState<Int>`, forcing you to write `count.value++`
   everywhere. `by` delegates `count`'s getter/setter *to* that
   `MutableState` object, so `count` reads and writes like a plain `Int`
   (`count++`, `"$count"`) while every read/write actually goes through the
   `MutableState` under the hood.
4. `Button(onClick = { count++ }) { Text("Tap me") }` — (first appearance)
   `Button` is Compose's clickable control — the direct replacement for a
   Java course `Button` + `setOnClickListener`. `onClick = { count++ }` is a
   lambda (Lesson 1 already used one for `setContent`); the trailing
   `{ Text("Tap me") }` block is the button's *content* — Compose buttons
   don't take a plain string label, they take composable content, which is
   why the label itself is a `Text` call.

### CS Lens

This is the **observer pattern**, the exact same one named in `../track/`'s
Lesson 16 for LiveData — a value that, when it changes, automatically
notifies whatever is watching it, instead of the watcher having to be
manually told. `MutableState` is Compose's version of an observable value;
`remember` is what gives that observable value a stable identity across
recompositions instead of a fresh one every time.

Also recognized in: spreadsheet formula recalculation, reactive frameworks
like React (this repo's own React Studio project) and SwiftUI's
`@State`, and this same curriculum's WPF course's `INotifyPropertyChanged` —
four different UI systems, the same underlying idea, each with its own
syntax for "the view reacts to the model" instead of "the model tells the
view."

### SE Lens

Why does Compose require the explicit `remember` wrapper instead of just
making every `var` inside a composable automatically persistent? Because
most local variables in a composable function genuinely *shouldn't* survive
recomposition — a value computed fresh from parameters every time is
correct and cheap. Making *everything* implicitly remembered would waste
memory holding onto state nothing needs preserved, and would make it
unclear, reading the code, which values are actually meant to persist.
Requiring `remember` explicitly is the same design bet Lesson 0 made with
`val`/`var`: make the common case (recompute fresh) the default, and the
special case (preserve across recomposition) opt-in and visible.

### Connection

Every piece of on-screen state in this app from here on — the calculator's
current expression, the graph's zoom level, memory register — uses exactly
this `var ... by remember { mutableStateOf(...) }` shape.

---

## Concept Unit: Recomposition

### The Problem

Concept Unit 1 said Compose "re-calls" a composable function to update the
screen. That deserves a precise definition — otherwise it sounds like the
entire UI tree gets torn down and rebuilt on every tap, which would be
absurdly slow for anything beyond a toy counter.

### What recomposition actually is

**Recomposition** is Compose re-running only the composable functions whose
*inputs* (their parameters, or any `MutableState` they read) actually
changed — not the whole tree. In `Counter()`, tapping the button changes
`count`. Compose tracks that `Text(text = "Count: $count")` reads `count`,
so *that specific `Text` call* is re-run and its content updated. The
`Button` composable itself doesn't read `count`, so it is not recomposed at
all — it's left completely alone.

### CS Lens

This is **fine-grained reactive update propagation** — Compose builds an
internal dependency graph between state and the specific composables that
read it, then only re-executes the parts of that graph downstream of a
change. This is a stronger, more automatic version of the observer pattern
from Concept Unit 1: instead of you writing code that says "when this
changes, update that specific view," the framework infers exactly which
"that" from which state each composable actually reads.

Also recognized in: spreadsheet engines recalculating only cells that
depend on a changed cell (not the whole sheet), React's virtual DOM diffing,
and build systems like Make or Bazel recompiling only files whose
dependencies changed.

### SE Lens

The real cost of this design: a composable function must be safe to call
zero, one, or many times, in any order, with no side effects that would
break if called more or less often than you expect (writing to a global
`var`, launching a network request directly in the function body) —
Compose calls this requirement **idempotence**, and violating it is a real,
common source of bugs (a composable that logs analytics or writes to a
file directly in its body will log or write far more often than intended).
Later lessons (Epic 7's `LaunchedEffect`) exist specifically to give
composables a safe place to do exactly this kind of one-time or
change-triggered side effect.

### Connection

Every subsequent lesson's state changes rely on this: adding a digit to the
calculator's expression in Lesson 5 recomposes only the display `Text`, not
the entire button grid around it.

---

## Concept Unit: State Hoisting

### The Problem

`Counter()` currently owns `count` itself — nothing outside `Counter()` can
read it, reset it, or react to it changing. That's fine for a throwaway
demo; it's a real problem the moment two different composables need to
agree on the same value, which is exactly Slide Rule's actual shape: the
button grid and the display both need to agree on the current expression.

### The New Code

```kotlin
@Composable
fun Counter(count: Int, onIncrement: () -> Unit) {
    Column {
        Text(text = "Count: $count")
        Button(onClick = onIncrement) {
            Text("Tap me")
        }
    }
}

@Composable
fun CounterScreen() {
    var count by remember { mutableStateOf(0) }
    Counter(count = count, onIncrement = { count++ })
}
```

### The Updated Project

`Counter` no longer owns `remember { mutableStateOf(0) }` at all — that line
moved up to a new caller, `CounterScreen`. `Counter` itself now takes
`count` as a plain parameter and `onIncrement` as a callback it invokes
without knowing what that callback actually does.

### Mechanical walkthrough

1. `onIncrement: () -> Unit` — (first appearance) a **function type** as a
   parameter — `() -> Unit` means "a function that takes no arguments and
   returns nothing," the type of the lambda `{ count++ }` passed in below.
   This is Lesson 0's higher-order-function idea (fully covered in Lesson
   10) arriving early because state hoisting genuinely needs it now.
2. `Counter(count = count, onIncrement = { count++ })` — `CounterScreen`
   owns the real state and passes a *read* of it (`count`) down, plus a
   callback that performs the *write* (`count++`) back up. `Counter` itself
   never touches `remember` or `mutableStateOf` at all anymore.

### CS Lens

This is **state hoisting** — moving state up to the nearest common ancestor
of everything that needs to read or change it, so the state has exactly one
owner and every other composable is a "dumb" function of parameters plus
callbacks. This is the same principle this repo's React Studio project
calls "lifting state up," arrived at for the same reason: two components
that both need the same truth can't each keep their own private copy of it.

### SE Lens

The real payoff: `Counter` is now trivially reusable and testable — it has
no hidden dependency on where its state lives, no `remember` call baked in,
so it can be previewed with any fixed `count` value and a no-op
`onIncrement`, or reused inside a completely different screen that manages
its own state differently. The cost: an extra parameter and an extra
callback per piece of state, which can start to feel like a lot of plumbing
in a deeply nested UI — this course accepts that cost for exactly the
composables (the button grid, Epic 5) where two separate composables
genuinely need to share one truth.

### Connection

Every composable in this course that displays part of the calculator's
state, starting with Lesson 5's button grid, is written hoisted this way:
state lives in one place, everything else takes it as a parameter.

---

## Closing

### Connect the pieces

`BrokenCounter`'s plain `var` reset to zero every recomposition because
nothing told Compose to preserve it. `remember { mutableStateOf(0) }`
(unit 1) fixed that by creating a tracked, persistent value. Recomposition
(unit 2) is what actually re-runs the `Text` reading that value — and only
that `Text`, nothing else in the tree. State hoisting (unit 3) moved
ownership of that value up to a parent, so a reusable `Counter` composable
never needs to know where its state actually lives, only that it's handed a
value and a callback.

### What breaks without this

Delete `remember`, leaving `mutableStateOf(0)` called directly. Real,
observable failure: tapping the button appears to do nothing — the number
never advances, because a brand-new `MutableState(0)` is created on every
recomposition, discarding the previous tap's increment before it's ever
seen. Restore `remember` and it works again — this is the exact
`BrokenCounter` bug from Concept Unit 1, now caused a second way.

### Exercises

- Add a "Reset" button next to the counter that sets `count` back to `0` —
  confirm it's just another callback, following the same hoisted shape.
- Log a line (`println` is fine for now) directly inside `Counter`'s
  function body, outside any callback. Tap the increment button several
  times and count how many times the log line actually prints — connect
  the result to Concept Unit 2's idempotence warning.
- Try moving `remember { mutableStateOf(0) }` into `Counter` again instead
  of `CounterScreen`, but keep the `onIncrement` parameter unused. Confirm
  the count still updates — then explain, in your own words, why this
  version isn't actually hoisted even though it still works.

### Definition of done

- [ ] `Counter` takes `count` and `onIncrement` as parameters — no
      `remember`/`mutableStateOf` inside it.
- [ ] `CounterScreen` owns the state and passes it down.
- [ ] You triggered the `BrokenCounter` bug yourself and can explain why it
      happens in terms of recomposition, not just "it's broken."
- [ ] You can state, in your own words, the connection between this
      lesson's `remember`/`mutableStateOf` and `../track/` Lesson 16's
      LiveData — same idea, different mechanism.
- [ ] Commit: `git commit -m "Introduce remember/mutableStateOf and state hoisting — the view now reacts to state instead of being told about it"`.
