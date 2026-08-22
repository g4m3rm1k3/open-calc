# Lesson 1.5: Handing Behavior to Someone Else to Call

**What you will build** — the `C` (clear) button becomes real: pressing
it resets the display to `"0"`, no matter what it currently shows,
verified with a real, executed test that types a couple of digits, clears
them, and checks the result. The transferable problem this lesson is
actually about: how calling code hands *behavior itself* — not a value, a
function — to some other code, to be invoked later, at a moment and under
conditions the caller doesn't control. Every digit button already does
this; this lesson names the mechanism explicitly and puts it to work one
more time.

**What you need to know first** — `CalculatorScreen`'s existing digit
buttons (`mutableStateOf`/`remember`/`by`, and each `Button`'s own
`onClick` checking `label[0].isDigit()` before updating `displayText`);
function types and lambda expressions, and `when` as a decision
construct, both from earlier in Stage 0.

## Terms used in this lesson

- **Callback** — a function value handed to other code specifically so
  that *other* code can call it later, at a time and under conditions the
  original caller doesn't control. It exists because some code
  (`Button`, here) needs to react to something that hasn't happened yet
  when it's first set up — a real user tap, arriving at some
  unpredictable future moment — without the reacting code needing to
  know, in advance, what that reaction should actually *do*. This is a
  real, deliberate inversion of the usual flow: ordinarily, code that
  calls a function decides when that call happens; with a callback, the
  code that *defines* the behavior is not the code that decides *when*
  it runs.
- **User event** — a real, discrete signal a UI framework detects and
  dispatches in response to something a person actually does — tapping,
  typing, dragging. It exists as its own category distinct from an
  ordinary function call because nothing in this project's own code
  decides when one happens; Compose's own input-handling layer detects a
  real tap and is what actually decides the moment a registered callback
  gets invoked, not any line of code this lesson writes.
- **`when`** — a Kotlin decision construct choosing one of several
  branches based on which condition matches, checked top to bottom, the
  first true condition's branch running and the rest skipped. Used here
  as a statement (not assigned to anything), it requires no `else`
  branch — if no condition matches, `when` simply does nothing, the exact
  behavior every non-digit, non-`C` button already relied on before this
  lesson added a second real branch.

## Objects and methods used

**`Modifier.clickable(...)`**
- What it is: an extension function on `Modifier` that makes *any*
  composable respond to a real tap, not just ones — like `Button` — that
  already build click handling in.
- Implementation: `fun Modifier.clickable(enabled: Boolean = true,
  onClickLabel: String? = null, role: Role? = null, onClick: () ->
  Unit): Modifier`, from `androidx.compose.foundation` — confirmed for
  real this session: passing a `String` where `enabled`'s first
  positional `Boolean` parameter belongs produced the actual compiler
  error `Type mismatch: inferred type is String but Boolean was
  expected`, printing this exact real parameter directly.
- Its use: demonstrated in this lesson's own isolated lab (Concept Unit
  2, below) making a plain `Text` clickable — proof that `Button`'s own
  built-in click handling is a convenience over this more general
  mechanism, not a separate one. This project's own real code does not
  use it directly; `Button` already provides everything this project's
  keypad needs.
- Type: an extension function on `Modifier`, returning a new `Modifier`
  (the same wrap-and-return pattern every other `Modifier` extension in
  this project already uses).
- Responsibility: registers a real callback — the same kind of function
  value `Button`'s own `onClick` already requires — to be invoked when a
  real tap is detected anywhere within whatever composable this modifier
  chain is attached to.
- Depends on: a real function value for `onClick`, the same required
  shape `Button` itself already demands.
- Connects to: attached to a composable's own `modifier` chain; read by
  Compose's real input-handling layer, which is what actually calls the
  registered `onClick` when a tap is detected — not this project's own
  code, and not at the moment the modifier chain is built.
- Shape: the real, general mechanism `Button` itself is built on top
  of — a lower-level seam between "any composable" and "Compose's own
  input dispatch," of which `Button`'s own `onClick` parameter is one
  specific, convenient surface.

### Everything else in the file, not this lesson's subject but still explained

**`Button(...)`** (reappearing)
- What it is: the Compose composable that renders a clickable,
  Material-styled button.
- Implementation: unchanged — `@Composable fun Button(onClick: () ->
  Unit, modifier: Modifier = Modifier, ..., content: @Composable
  RowScope.() -> Unit)`, from `androidx.compose.material3`; `onClick`
  still has no default value.
- Its use: this lesson extends what each button's own `onClick` body
  actually does — a second real branch, for `"C"` — without changing the
  `Button` call itself in any way.
- Type: a top-level `@Composable` function with a required function-type
  parameter (`onClick`) and a trailing `@Composable` lambda (`content`).
- Responsibility: unchanged — draws a button-shaped surface, reacts to
  real taps by calling `onClick`, lays out its trailing lambda's content.
- Depends on: unchanged — a real function value for `onClick`.
- Connects to: unchanged — called once per label inside the innermost
  `for` loop; its own `onClick` now runs one more real branch than
  before.
- Shape: unchanged in architectural role — still the one composable in
  this project's keypad with a real event boundary.

---

## Concept Unit 1: Callbacks — Handing Over Behavior, Not Just a Value

### The Problem

Every digit button already reacts to a real tap by updating
`displayText` — this has worked since earlier in Stage 1. But *why* it
works this way has never been named or examined directly: `Button`
itself has no idea, when it's declared, what pressing it should
eventually do — that knowledge lives entirely in whatever function value
`onClick` was given, written by this project's own code, not `Button`'s.

> **Try it yourself first:** function types and lambda expressions were
> already fully established — a lambda is a real, ordinary value, not
> special syntax tied to any one call site. Given that `Button`'s
> `onClick` parameter has always been of function type `() -> Unit`
> (already established), and given that nothing in this project's own
> code ever calls `onClick` directly, anywhere, what does that suggest
> about *who* actually decides the moment that lambda runs? And: if two
> different `Button` calls are given two different `onClick` lambdas,
> what does `Button`'s own declaration have to know about what each one
> does, for both to work correctly?

### Introduce the concept in isolation

```kotlin
fun runIfPositive(n: Int, onPositive: () -> Unit) {
    if (n > 0) {
        onPositive()
    }
}

fun main() {
    runIfPositive(5) { println("positive!") }
    runIfPositive(-3) { println("this should not print") }
}
```

Run for real, on the plain JVM — no Compose or Android involved, since
this is ordinary Kotlin, not a UI-specific mechanism:

```
positive!
```

This proves `runIfPositive` never needed to know *what* its caller
wanted done — only that some function value existed to call, if its own
condition (`n > 0`) was met. The second call's own lambda genuinely never
ran; `-3` is not positive, so `onPositive()` was never reached. A
function value handed to other code specifically so that code can invoke
it later, under conditions the receiving code alone decides, is called a
**callback**.

Discarded: `runIfPositive` above does not appear in the real project; the
real callback this project already relies on is `Button`'s own
`onClick`, already wired for every digit button, unchanged by this
Concept Unit.

### No project change for this unit

This Concept Unit names and explains a mechanism the real project
already depends on (`Button`'s own `onClick`) rather than introducing new
project code — per this schema's own allowance, Project Change, New
Code, and Updated Project are skipped here because they are genuinely
inapplicable, not overlooked. `Button`'s own required `onClick`
parameter, and every digit button's own real lambda, are exactly the
same real mechanism this Concept Unit's isolated lab just proved in
miniature: `Button` is `runIfPositive`'s own real-world shape, with "was
this button actually tapped" standing in for `n > 0`.

### CS lens

A caller handing behavior to callee code, to be invoked later rather
than run immediately, is a real, general idea: **inversion of control**.
Also recognized in: a web server's own route handler (registered once,
called by the server whenever a matching request actually arrives, not
when the route is declared), a database driver's own connection-pool
callback (told what to do with a connection, not when one becomes
available), a promise's/future's `.then(callback)`, and a scheduler
accepting a task to run at a time it alone decides.

### SE lens

The alternative not chosen is `Button` polling — repeatedly asking, on
some fixed schedule, "was I tapped since I last checked?" — with the
caller's own code checking the answer and reacting. That would work in
principle, but couples the caller's own code to a polling loop it has to
write and maintain, and introduces real latency between the actual tap
and the moment it's noticed. A callback instead lets `Button` itself,
which is the one thing that actually knows the instant a real tap
happens, be the code that decides when to act — the caller only ever
has to say *what* should happen, never *when* to check for it.

### Run it

Shown above, in full: the real, plain-JVM compile and run
(`verification/1.5/lab1_callback.kt`,
`verification/1.5/lab1_callback_output.txt`).

### Connecting the pieces

`Button`'s own `onClick` is now understood as a real callback, not just a
required parameter. Concept Unit 2 widens the picture: `onClick` is one
specific surface for a broader real mechanism, available on any
composable.

---

## Concept Unit 2: User Events and `Modifier.clickable`

### The Problem

`Button` happens to build click handling in, but nothing about a tap
being detectable is actually specific to `Button` — a real tap is a
signal Compose's own input layer can detect anywhere on screen. If a
project ever needed a *different* composable (a plain `Text`, an image)
to react to a tap, `Button`'s own `onClick` parameter wouldn't help,
since it only exists on `Button` itself.

> **Try it yourself first:** `Modifier` was already established as the
> one configuration mechanism shared by every composable in this
> project, not specific to any single one of them. Given that a real tap
> is a signal Compose's own input layer detects, independent of which
> composable happens to be underneath it, what would you guess a more
> general, `Modifier`-based mechanism for "react to a tap" might look
> like, compared to a parameter that only `Button` itself has? And: once
> such a mechanism exists, what real, concrete difference — if any —
> would you predict between a `Button` and a plain `Text` with that same
> mechanism attached, from the perspective of someone tapping the
> screen?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabClickableText() {
    var wasClicked by remember { mutableStateOf(false) }
    Text(
        text = if (wasClicked) "clicked" else "not clicked",
        modifier = Modifier.testTag("clickableText").clickable { wasClicked = true }
    )
}
```

Run for real — not just compiled, but actually clicked and checked, the
same real Robolectric-based testing this project's own tooling already
supports:

```
com.example.calculator.LabsCU15Test > clickableTextRespondsToClick PASSED

BUILD SUCCESSFUL in 4s
```

The real test found the text reading `"not clicked"`, performed a real
click on it, and found it reading `"clicked"` afterward — proof that a
plain `Text`, which has no `onClick` parameter of its own, can genuinely
respond to a real tap once `Modifier.clickable { }` is attached. This
mechanism — attaching real tap-detection to any composable through
`Modifier` — is what makes a **user event** concrete: Compose's own
input layer is what actually calls `wasClicked = true`, at whatever real
moment a tap is detected, never this lesson's own code calling it
directly.

Discarded: `LabClickableText` above does not appear in the real project;
this project's own keypad already gets everything it needs from
`Button`'s built-in `onClick`, so `Modifier.clickable` is not added to
`CalculatorScreen` — the same honest judgment call already made for
constructs (like an earlier lesson's `run`) that were worth proving real
without being forced into code that doesn't actually need them.

### No project change for this unit

Like Concept Unit 1, this unit explains a mechanism through its own
isolated, real, executed proof rather than changing the real project;
`CalculatorScreen`'s own keypad has no plain, non-`Button` composable
that needs click handling, so there is nothing here for `Modifier.
clickable` to attach to — Project Change, New Code, and Updated Project
are skipped for the same, explicitly stated reason as Concept Unit 1.

### CS lens

A general capability exposed through a shared, composable configuration
mechanism, with specific components (`Button`) offering a convenience
layer over the same underlying capability, is a real, general idea:
**layered API design**. Also recognized in: a web framework's low-level
`addEventListener` versus a higher-level `<button onClick={...}>`
component built on top of it, a GUI toolkit's raw mouse-event
registration versus its own pre-built `Button` widget, and any library
that exposes both a low-level primitive and a convenient wrapper for the
common case, without hiding the primitive from code that genuinely needs
it.

### SE lens

The alternative not chosen for this project's own real keypad — using
`Modifier.clickable` directly on a plain `Text` or `Column` in place of
`Button` — would work, proven by this Concept Unit's own real test, but
would throw away everything `Button` already provides for free: Material
styling, a real pressed/released visual state, and built-in
accessibility semantics (a `Button`'s own semantics already report a
real `Role = 'Button'`, visible in this curriculum's own earlier real
test output). `Modifier.clickable`'s real value is for exactly the case
this project doesn't currently have: a composable that needs to react to
a tap but genuinely isn't, and shouldn't look like, a button.

### Run it

Shown above, in full: the real, executed, passing test
(`verification/1.5/lab2_clickable_isolated.txt`) and the real negative
case confirming `enabled`'s exact real parameter type
(`verification/1.5/lab2b_clickable_signature.txt`).

### Connecting the pieces

Two real mechanisms are now understood: callbacks in general (Concept
Unit 1), and user-event dispatch specifically, through both `Button`'s
own `onClick` and the more general `Modifier.clickable` (Concept Unit
2). Concept Unit 3 finally puts a callback to real, new work: making `C`
actually clear the display.

---

## Concept Unit 3: Wiring the Clear Button

### The Problem

Every digit button's `onClick` already checks `label[0].isDigit()` and
updates `displayText` accordingly. Every other button — including `C` —
still falls through that check doing nothing, an honest, previously
acknowledged gap. `C`'s own real job doesn't depend on `Calculator.kt`'s
arithmetic the way the operator buttons do — resetting the display to
`"0"` is a complete, correct, self-contained feature this lesson can
finish for real.

> **Try it yourself first:** `when` was already established as a
> decision construct checking conditions top to bottom, and the existing
> digit check already uses it as a statement, with no `else` branch —
> meaning any label matching neither existing condition currently falls
> through silently. Given that, what's the smallest possible addition to
> the existing `when` block that would give `"C"` specifically its own
> real behavior, without disturbing how digits or any other button
> already behave? And: given `displayText`'s own already-established
> type (`String`), what's the simplest possible expression that resets
> it back to its very first value?

### No new isolated lab for this unit

This Concept Unit's own change reuses `when` (already fully explained in
this lesson's own Terms) and `displayText`'s already-established
assignment mechanism, with no new construct of its own to isolate — its
real verification is the actual project change itself, proven by a real,
executed test, next.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a second branch inside the existing `when`
  block).
- **Location:** inside each `Button`'s `onClick` lambda, immediately
  after the existing `label[0].isDigit() -> { ... }` branch.
- **Dependencies:** none beyond what earlier lessons already resolved.

### The New Code

```kotlin
label == "C" -> {
    displayText = "0"
}
```

### The Updated Project

```kotlin
1  onClick = {
2      when {
3          label[0].isDigit() -> {
4              displayText = if (displayText == "0") label else displayText + label
5          }
6          label == "C" -> {          // ← new
7              displayText = "0"      // ← new
8          }                          // ← new
9      }
10  },
```

Every button's `onClick` now runs a `when` with two real branches instead
of one — for `"C"` specifically, `displayText` is reset to `"0"`
outright; for the remaining five buttons (`÷`, `×`, `−`, `+`, and `=` —
every operator plus `=`), neither condition matches, and, exactly as
`when`'s own already-established statement semantics require, nothing
happens — the identical no-op behavior those buttons already had.

### Mechanical walkthrough

- `label == "C" -> {` — a second `when` branch (already-established
  syntax, this lesson's own Terms entry), checked only if the first
  branch's own condition (`label[0].isDigit()`) was false; `label == "C"`
  uses the already-established `==` structural-equality operator,
  comparing the button's own label against the literal string `"C"`.
- `displayText = "0"` — an assignment (already-established syntax) to
  the already fully-explained `displayText` property, unconditionally
  setting it back to its own very first value — unlike the digit branch,
  which reads `displayText`'s current value before deciding what to
  assign, this branch never reads it at all.

### CS lens

A reset operation returning a piece of mutable state to a fixed, known
starting value, regardless of whatever value it currently holds, is a
real, general idea: **idempotent reset**. Also recognized in: a form's
own "Clear" button in any web application, a game's "New Game" action
resetting score and board state alike, an HTTP `DELETE` on a cache entry
(the entry ends up absent regardless of what was cached before), and a
circuit breaker's own manual reset, returning it to a known-good state
independent of its prior failure history.

### SE lens

The alternative not chosen is giving `C` its own separate, dedicated
`Button` call outside the data-driven loop, with a hand-written `onClick`
distinct from the shared `when` block every other button already runs
through. That would work, but would break the very thing an earlier
lesson's own refactor to a data-driven keypad specifically achieved: one
real rule, reused identically for all sixteen buttons. Adding `C`'s own
behavior as one more `when` branch, inside the same shared `onClick`
every button already runs, keeps that property intact — the real,
ongoing cost is that this one `when` block will keep growing as more
buttons (the operators, `=`) get real behavior in a later lesson, a
tradeoff already made, and already paying off, since this lesson's own
addition needed to touch exactly one place, not sixteen.

### Run it

```kotlin
@Test
fun pressingClearResetsDisplay() {
    composeTestRule.setContent {
        CalculatorScreen()
    }

    composeTestRule.onNodeWithText("7").performClick()
    composeTestRule.onNodeWithText("8").performClick()
    composeTestRule.onNodeWithTag("display").assertTextEquals("78")

    composeTestRule.onNodeWithText("C").performClick()
    composeTestRule.onNodeWithTag("display").assertTextEquals("0")
}
```

Run for real, alongside the existing digit-press test, both against the
real project:

```
com.example.calculator.CalculatorScreenTest > pressingDigitsUpdatesDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingClearResetsDisplay PASSED

BUILD SUCCESSFUL in 4s
```

A real, executed proof: pressing `7` then `8` really does produce
`"78"`, and pressing `C` immediately afterward really does bring the
display back to `"0"` — not a prediction, an actual, checked result. The
full project was confirmed once more with a complete
`./gradlew testDebugUnitTest assembleDebug`, producing both a passing
test suite and a real, installable `.apk`
(`verification/1.5/step2_final_test_and_assembleDebug.txt`).

### Connecting the pieces

Every piece from this lesson comes together here: `Button`'s own
`onClick` (Concept Unit 1's real callback), the same real mechanism
`Modifier.clickable` generalizes (Concept Unit 2), now doing one more
real thing — resetting `displayText`, proven for real by an actual
passing test — the second button, after the ten digits, whose tap
genuinely changes what this project's screen shows.

---

## Closing

**Connect the pieces.** Follow one concrete action — a real press of the
`C` button, exactly as this lesson's own passing test performed it —
through every unit this lesson built. `runIfPositive` (Concept Unit 1)
first proved, in miniature, on the plain JVM, that a function handed to
other code can be called later, under conditions only the receiving code
decides — real output (`"positive!"` printed once, the second call's own
lambda never running) confirming the mechanism directly. `Button`'s own
`onClick` was named as exactly this same mechanism, already at work for
every digit button. `Modifier.clickable` (Concept Unit 2), proven for
real against a plain `Text` with no `onClick` of its own, showed that
mechanism is not `Button`-specific — `Button`'s own click handling is
one convenient surface over a capability any composable can reach,
through `Modifier`. And the real press itself, dispatched by Compose's
own input layer, ran the new `when` branch Concept Unit 3 added: `label
== "C"` matching, `displayText` reset to `"0"` — proven, concretely, by
a real test that typed `"78"` and watched it real become `"0"` again.

**Next: Lesson 1.6, Connect UI to Domain Logic** — `C` is now real, but
the operator buttons (`÷`, `×`, `−`, `+`) and `=` still fall through the
same `when` with no matching branch, because their real behavior depends
on arithmetic this project's own `Calculator.kt` already knows how to
do, from Stage 0 — never yet connected to this Android UI at all. Lesson
1.6 is where that connection finally happens, and Slice 1 — a functioning
Android calculator — ships.
