# Lesson 5: The Real App Starts — A Grid of Buttons Building a String

*(The Calculator's Button Grid)*

**User Story**
> As a user, I want to enter the basic details of a calculation by tapping
> digit and operator buttons, and see the expression build up as I type.

**What you will build**
The placeholder `CounterScreen` from Epic 1 is deleted, replaced by a real
4-column grid of calculator buttons (digits, `+ − × ÷`, `.`, `C`, `=`) above
a display showing the expression being built. This is the first lesson of
the calculator itself — everything in Epic 1 was the shell around it.

**What you need to know first**
Lesson 2's state hoisting, Lesson 4's `NavHost` (this replaces the
`"calculator"` route's content). From `../track/`: nothing new required —
this lesson is pure Compose layout and Kotlin string building.

---

## Concept Unit: `LazyVerticalGrid`

### The Problem

A calculator's buttons form a real grid — four buttons per row, several
rows — not a single vertical stack (`Column`) or horizontal row (`Row`).
Building that by manually nesting several `Row`s inside a `Column`, one per
button row, works but hardcodes the row breaks; adding or removing a button
means recounting how many fit per row by hand.

### The New Code

```kotlin
val buttons = listOf(
    "7", "8", "9", "÷",
    "4", "5", "6", "×",
    "1", "2", "3", "−",
    "C", "0", "=", "+"
)

LazyVerticalGrid(columns = GridCells.Fixed(4)) {
    items(buttons) { label ->
        Button(onClick = { }, modifier = Modifier.padding(4.dp)) {
            Text(text = label, fontSize = 20.sp)
        }
    }
}
```

### The Updated Project

```kotlin
composable("calculator") {
    Column(modifier = Modifier.fillMaxSize()) {
        Text(text = "0", fontSize = 40.sp, modifier = Modifier.padding(16.dp)) // display, placeholder for now
        val buttons = listOf(                                   // ← new
            "7", "8", "9", "÷",
            "4", "5", "6", "×",
            "1", "2", "3", "−",
            "C", "0", "=", "+"
        )
        LazyVerticalGrid(columns = GridCells.Fixed(4)) {         // ← new
            items(buttons) { label ->
                Button(onClick = { }, modifier = Modifier.padding(4.dp)) {
                    Text(text = label, fontSize = 20.sp)
                }
            }
        }
    }
}
```

The `"calculator"` route now shows a placeholder display followed by a real
4-column button grid, replacing Epic 1's `CounterScreen`.

### Mechanical walkthrough

1. `val buttons = listOf("7", "8", ...)` — (hard concept reappearing)
   Kotlin's `List` — reappearing from any Java `List` usage in `../track/`;
   `listOf(...)` builds an **immutable** list directly (no separate
   `add()` calls needed), matching Lesson 0's default-immutable philosophy.
2. `LazyVerticalGrid(columns = GridCells.Fixed(4))` — (first appearance)
   a grid layout composable; `GridCells.Fixed(4)` means exactly 4 equal-width
   columns, however many items are supplied.
3. `items(buttons) { label -> ... }` — (first appearance) tells the grid
   *how* to render each element of `buttons` — `label` is each string in
   turn, and the lambda returns the composable content for that one cell.
   This is the same shape as a `RecyclerView.Adapter`'s `onBindViewHolder`
   from `../track/` Lesson 6, but as one function instead of a whole
   adapter class — Lesson 8 makes this connection explicit for a scrolling
   list specifically.
4. `Button(onClick = { }, ...)` — (hard concept reappearing) Lesson 2's
   `Button`, `onClick` left as an empty no-op for now — filled in next unit.

### CS Lens

`LazyVerticalGrid`'s "lazy" naming matters: like `../track/` Lesson 6's
`RecyclerView`, it only actually creates and measures the button
composables likely to be visible on screen, not all sixteen at once
regardless of screen size — the same view-recycling-adjacent efficiency
idea, though with only 16 buttons here the difference is invisible; it
becomes load-bearing the moment Epic 4's calculation history (Lesson 8) can
hold thousands of entries.

### SE Lens

Why a flat `List<String>` plus a grid, instead of hand-nested `Row`s per
row of buttons? Because the data (which labels exist, in what order) and
the layout (how many columns) are now two independent, separately-changeable
things — adding a fifth column, or a seventeenth button, is a one-line
change to `buttons` or `Fixed(4)`, never a restructuring of nested `Row`
calls.

### Connection

Concept Unit 2 gives each button's `onClick` real behavior — right now
every one of the sixteen taps does nothing.

---

## Concept Unit: Building the Expression String

### The Problem

Tapping a digit or operator button should append it to a running
expression, shown in the display `Text` above the grid — and `C` should
clear it. This is state hoisting (Lesson 2) applied for real, for the first
time, to the app's actual purpose.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Wherever the `"calculator"` route's composable lives.
- **Change type:** Add state + wire callbacks.
- **Location:** Wrapping the existing display `Text` and `LazyVerticalGrid`
  from Concept Unit 1.
- **Dependencies:** None new.

### The New Code

```kotlin
var expression by remember { mutableStateOf("") }

fun onButtonPressed(label: String) {
    expression = when (label) {
        "C" -> ""
        "=" -> expression   // real evaluation arrives in Lesson 6
        else -> expression + label
    }
}
```

### The Updated Project

```kotlin
composable("calculator") {
    var expression by remember { mutableStateOf("") }          // ← new

    fun onButtonPressed(label: String) {                       // ← new
        expression = when (label) {
            "C" -> ""
            "=" -> expression
            else -> expression + label
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = expression.ifEmpty { "0" },                 // ← changed
            fontSize = 40.sp,
            modifier = Modifier.padding(16.dp)
        )
        val buttons = listOf(
            "7", "8", "9", "÷", "4", "5", "6", "×",
            "1", "2", "3", "−", "C", "0", "=", "+"
        )
        LazyVerticalGrid(columns = GridCells.Fixed(4)) {
            items(buttons) { label ->
                Button(
                    onClick = { onButtonPressed(label) },      // ← changed
                    modifier = Modifier.padding(4.dp)
                ) {
                    Text(text = label, fontSize = 20.sp)
                }
            }
        }
    }
}
```

The display now shows `expression`'s live content (or `"0"` when empty),
and every button press routes through `onButtonPressed`, which updates
`expression` based on which label was tapped.

### Mechanical walkthrough

1. `fun onButtonPressed(label: String) { ... }` — (first appearance in this
   file) a **local function** — a plain function declared inside another
   composable function's body, visible only within it. Kotlin allows this
   directly; Java has no equivalent (only anonymous classes or, in modern
   Java, similarly-scoped lambdas assigned to variables).
2. `expression = when (label) { "C" -> ""; "=" -> expression; else -> expression + label }`
   — (hard concept reappearing) Lesson 0's `when` expression, now branching
   on a runtime string value instead of a numeric condition — each branch
   produces the new value `expression` is reassigned to.
3. `expression + label` — Kotlin's `+` on two `String`s concatenates them —
   ordinary operator behavior, not special to this lesson.
4. `expression.ifEmpty { "0" }` — (first appearance) a standard-library
   extension function (Lesson 0's mechanism, applied by the library itself
   this time) — returns `expression` unchanged if it's non-empty, or the
   result of the lambda (`"0"`) if it is.

### Execution trace

```
Initial: expression = ""
Tap "7": onButtonPressed("7") → when branches to else → expression = "" + "7" = "7"
Tap "+": onButtonPressed("+") → else branch → expression = "7" + "+" = "7+"
Tap "3": else branch → expression = "7+" + "3" = "7+3"
Tap "C": "C" branch → expression = ""
Display recomposes each step: "7" → "7+" → "7+3" → "0" (via ifEmpty)
```

### CS Lens

This is the calculator's **input accumulation** stage — the same shape as
the very first stage of any tokenizer/lexer (this repo's OpenMAT project
included): raw input characters collected into a string before anything
tries to interpret their meaning. `"="` deliberately does nothing but
return `expression` unchanged for now — Lesson 6 is where that string stops
being just text and becomes something evaluated.

### SE Lens

Why route every button through one `onButtonPressed` function instead of
giving each button its own distinct `onClick` lambda? Because all sixteen
buttons share the same *shape* of behavior (append this label, unless it's
`C` or `=`) — one function keeps that logic in one place, so a future rule
(Lesson 7's error handling, for instance) only needs to change in one spot,
not sixteen.

### Connection

Lesson 6 replaces `"=" -> expression` (currently a no-op) with a real
evaluator — everything else in this lesson stays exactly as built here.

---

## Closing

### Connect the pieces

`buttons` (unit 1) is a flat list of labels rendered by `LazyVerticalGrid`
into a real 4-column grid. Every button's `onClick` (unit 2) calls the same
`onButtonPressed`, which reads and rewrites `expression` — hoisted state
(Lesson 2) driving both the display `Text` and, indirectly, every future
lesson that needs to know the current expression.

### What breaks without this

Remove the `else ->` branch from the `when` in `onButtonPressed`, leaving
only `"C"` and `"="`. Real, observable failure: a compile error —
`when` used as an expression (its result is assigned to `expression`) must
be **exhaustive**, covering every possible `String` value, and the compiler
correctly refuses to guess what a digit button should do. Restore the
`else` branch and it compiles again — direct proof that `when`-as-expression
is checked, not just a convenience.

### Exercises

- Add a decimal point button (`"."`) to `buttons` and confirm it's handled
  correctly by the existing `else` branch with no new code.
- Add a rule to `onButtonPressed` preventing two operators in a row (typing
  `+` right after `+` should replace the last character instead of
  appending) — this is real defensive logic Lesson 6's evaluator will
  otherwise have to reject anyway.

### Definition of done

- [ ] A 4-column button grid renders all sixteen labels.
- [ ] Tapping digits and operators builds up the expression correctly.
- [ ] `C` clears the expression back to empty (shown as `"0"`).
- [ ] Commit: `git commit -m "Build the button grid and expression-accumulation state — the calculator's first real feature"`.
