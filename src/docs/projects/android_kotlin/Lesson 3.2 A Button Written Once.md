# Lesson 3.2: A Button Written Once

- **What you will build** — a real, permanent `CalculatorButton`
  composable, extracted from `CalculatorScreen`'s own keypad loop, with
  its own real parameter list (`label`, `onClick`, `modifier`) — the
  first composable function this project has ever authored with
  parameters of its own, rather than only calling library composables
  that already had them. The transferable problem: once a piece of UI
  logic needs to exist in more than one conceptual place — not
  necessarily written twice yet, but *needed* twice — something has to
  decide what stays fixed and what becomes a parameter, the same
  decision every function's own signature has always had to make.
- **What you need to know first** — Lesson 1.2's `@Composable` functions
  calling other composables; Lesson 1.5's function-type parameters
  (`onClick: () -> Unit`); Lesson 1.3's `Modifier.weight`, scoped to
  `RowScope`; Lesson 2.5's `Modifier.testTag`; Lesson 3.1's
  `MaterialTheme.shapes.small` and `CalculatorScreen`'s own current
  keypad-building loop, calling `Button` directly.

## Terms used in this lesson

- **Default parameter** — a parameter declared with a fallback value,
  usable by simply omitting it from a call, as in `modifier: Modifier =
  Modifier`. It exists so a caller who has nothing extra to add doesn't
  have to write out a value that means "nothing extra" by hand at every
  call site.
- **Function-type parameter** — a parameter whose declared type is
  itself a function shape, such as `onClick: () -> Unit` — a parameter
  that isn't a piece of data, but behavior to run later. It exists so a
  composable can defer a decision ("what happens when this is clicked")
  to whoever calls it, instead of hardcoding one specific behavior
  inside itself.

## Objects and methods used

- **`CalculatorButton`** *(this lesson's own new, permanent composable)*
  - *What it is:* this project's own real, reusable representation of
    "one calculator key" — its shape, its test identity, and its label,
    all in one named unit.
  - *Implementation:* `@Composable fun CalculatorButton(label: String,
    onClick: () -> Unit, modifier: Modifier = Modifier)`, wrapping a
    real `Button` call: `Button(onClick = onClick, shape =
    MaterialTheme.shapes.small, modifier = modifier.testTag(label)) {
    Text(text = label) }`.
  - *Its use:* replaces the `Button`/`Text` pair `CalculatorScreen`'s own
    keypad loop used to call directly, sixteen times over, with one
    named call.
  - *Type:* a `@Composable` function with three parameters, two required
    (`label`, `onClick`) and one with a real default value (`modifier`).
  - *Responsibility:* to be the one place this project decides what a
    calculator key looks like and how it identifies itself to a test —
    every actual keypad key's own click behavior stays the caller's job,
    passed in as `onClick`.
  - *Depends on:* a `label: String`, an `onClick: () -> Unit`, and,
    optionally, a `modifier: Modifier` to merge with its own internal
    `testTag`.
  - *Connects to:* called sixteen times from `CalculatorScreen`'s own
    keypad-building loop, once per real button; calls `Button` and
    `Text` internally, and reads `MaterialTheme.shapes.small`.
  - *Shape:* a public API surface *within* this project — a real,
    project-owned composable, the same kind of "own entry point"
    `CalculatorTheme` already is.

### Everything else in the file, not this lesson's subject but still explained

- **`Modifier`**
  - *What it is:* a real type describing zero or more visual, layout, or
    behavioral adjustments to apply to a composable; `Modifier` (with a
    capital letter, used as a value, not a type) is also a real,
    separate thing: the one, singleton instance representing *no*
    adjustments at all.
  - *Implementation:* `interface Modifier`, with a real `companion object
    Modifier : Modifier` — that companion object is the actual value
    every `Modifier = Modifier` default parameter refers to; calling an
    extension like `.testTag(...)` or `.weight(...)` on it produces a
    new `Modifier` carrying that one adjustment, ready to have more
    chained onto it.
  - *Its use:* `CalculatorButton`'s own `modifier` parameter defaults to
    plain `Modifier` — no adjustments — so a caller with nothing extra to
    add can simply omit it.
  - *Type:* an interface, with its own "empty" implementation reachable
    through its companion object.
  - *Responsibility:* to represent a chain of adjustments as one
    composable value, so a whole chain can be passed around, merged, and
    applied as a single argument, rather than as separate, uncombinable
    settings.
  - *Depends on:* nothing — the empty `Modifier` requires no arguments to
    exist.
  - *Connects to:* passed into `CalculatorButton` from
    `CalculatorScreen`'s own loop (`Modifier.weight(1f)`); merged inside
    `CalculatorButton` with `.testTag(label)`.
  - *Shape:* a public Compose Foundation type, already this project's
    single most-reused external dependency.

- **`Modifier.testTag`**
  - *What it is:* a real `Modifier` extension attaching a test-only
    string identifier to a composable.
  - *Implementation:* `fun Modifier.testTag(tag: String): Modifier`.
  - *Its use:* now called once, inside `CalculatorButton` itself, instead
    of once per button call site in `CalculatorScreen`'s own loop.
  - *Type:* an extension function on `Modifier`, returning a new
    `Modifier`.
  - *Responsibility:* to attach exactly one piece of test-only metadata,
    with no effect on appearance or behavior.
  - *Depends on:* a `String` tag — here, `CalculatorButton`'s own
    `label` parameter.
  - *Connects to:* chained onto whatever `Modifier` `CalculatorButton`
    receives from its caller; read by `onNodeWithTag` in this project's
    existing tests, unchanged.
  - *Shape:* a public Compose testing API, called from real, permanent
    project code.

- **`Modifier.weight`**
  - *What it is:* the real, `RowScope`-scoped `Modifier` extension that
    divides available space among siblings proportionally.
  - *Implementation:* `fun RowScope.weight(weight: Float, fill: Boolean =
    true): Modifier`.
  - *Its use:* still called from `CalculatorScreen`'s own loop, which is
    still directly inside a real `RowScope` — `CalculatorButton` itself
    is not, so `weight` could never have been called from inside it.
  - *Type:* a scoped extension function — resolvable only inside a
    `RowScope` receiver.
  - *Responsibility:* to claim a proportional share of a `Row`'s leftover
    space for the composable it's applied to.
  - *Depends on:* being called inside a real `RowScope`.
  - *Connects to:* called at `CalculatorButton`'s own call site, in
    `CalculatorScreen`'s loop; its result is passed in as
    `CalculatorButton`'s `modifier` argument.
  - *Shape:* a public, scoped Compose layout API, unchanged from where it
    was first introduced.

- **`Button`**
  - *What it is:* the real Material3 composable rendering one tappable
    key.
  - *Implementation:* `@Composable fun Button(onClick: () -> Unit,
    modifier: Modifier = Modifier, shape: Shape = ButtonDefaults.shape,
    ...)`.
  - *Its use:* now called from exactly one place in the whole project —
    inside `CalculatorButton` — instead of from `CalculatorScreen`'s own
    loop directly.
  - *Type:* a `@Composable` function.
  - *Responsibility:* to render one real, tappable Material button,
    including its own visual shape, ripple, and accessibility semantics.
  - *Depends on:* an `onClick` lambda; optionally, a `modifier` and a
    `shape`.
  - *Connects to:* called by `CalculatorButton`, forwarding
    `CalculatorButton`'s own `onClick` parameter and reading
    `MaterialTheme.shapes.small` directly.
  - *Shape:* a public Material3 composable — its own one real call site
    just moved, unchanged in every other way.

- **`Text`**
  - *What it is:* the real Material3 composable rendering a run of text.
  - *Implementation:* `@Composable fun Text(text: String, modifier:
    Modifier = Modifier, style: TextStyle = LocalTextStyle.current,
    ...)`.
  - *Its use:* now called, for every keypad label, from inside
    `CalculatorButton`'s own trailing lambda, instead of directly inside
    `CalculatorScreen`'s loop.
  - *Type:* a `@Composable` function.
  - *Responsibility:* to render one real run of text with a given style.
  - *Depends on:* a `text: String`.
  - *Connects to:* called inside `CalculatorButton`'s own `Button {
    Text(text = label) }` trailing lambda.
  - *Shape:* a public Material3 composable, its own one real keypad-label
    call site moved, unchanged in every other way.

- **`MaterialTheme.shapes.small`**
  - *What it is:* the real property reading back this project's own
    named button-corner shape, provided by `CalculatorTheme`.
  - *Implementation:* `MaterialTheme.shapes` (a real property on the
    `MaterialTheme` singleton object, reading whichever `Shapes` the
    nearest enclosing `MaterialTheme` call provided) followed by
    `.small` (that `Shapes`'s own `small` property, this project's real
    `RoundedCornerShape(12.dp)`).
  - *Its use:* now read once, inside `CalculatorButton`, instead of once
    per button call site.
  - *Type:* two chained read-only properties.
  - *Responsibility:* to always answer with this project's own real
    corner shape, wherever it's read from inside `CalculatorTheme`'s own
    composition.
  - *Depends on:* being read from inside a composable nested inside
    `CalculatorTheme` — `CalculatorButton` qualifies, since it's always
    called from inside `CalculatorScreen`, itself always wrapped in
    `CalculatorTheme`.
  - *Connects to:* set by `CalculatorTheme`; read directly inside
    `CalculatorButton`'s own body.
  - *Shape:* a public Material3 API, its own one real read site moved,
    unchanged in every other way.

- **`CalculatorScreen`**
  - *What it is:* this project's own top-level composable — the entire
    calculator UI.
  - *Implementation:* `@Composable fun CalculatorScreen()`, building the
    display `Text` and, as of this lesson, calling `CalculatorButton`
    instead of `Button` directly inside its own keypad-building loop.
  - *Its use:* the one real caller of `CalculatorButton`, sixteen times
    over, once per keypad key.
  - *Type:* a `@Composable` function with no parameters.
  - *Responsibility:* to own the calculator's entire visible state and
    layout; no longer responsible for knowing exactly how a single
    button renders, only for supplying each one's `label` and `onClick`.
  - *Depends on:* nothing external — it owns all of its own state.
  - *Connects to:* calls `CalculatorButton` from inside its own nested
    loops, passing `label`, a real `onClick` lambda, and
    `Modifier.weight(1f)`.
  - *Shape:* the single, public composable this whole project's UI is
    built from — now visibly smaller, having handed one real
    responsibility to `CalculatorButton`.

## Concept Unit: Components

### The Problem

`CalculatorScreen` currently does two genuinely different jobs at once:
it decides *which* keys exist and *what* each one does when pressed — the
part that's actually specific to a calculator — and it also decides
*exactly how* a single key renders: its shape, its test identity, how its
label sits inside it. That second job has nothing to do with calculators
specifically; it's the same rendering logic, run sixteen times, welded
into one function that also happens to own all the calculator-specific
state.

> `Button` and `Text` are themselves ordinary `@Composable` functions —
> the same kind of thing `CalculatorScreen` already is. Given that this
> project has already written one composable function
> (`CalculatorScreen` itself), what would stop it from writing a
> *second* one, called from inside the first? What would such a function
> need to accept as parameters, to render a different key each time it's
> called, rather than the exact same one every time?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun LabGreeting(name: String, tag: String) {
    Text(text = "Hello, $name", modifier = Modifier.testTag(tag))
}

@Test
fun sameComposableProducesDifferentRealOutputPerCall() {
    composeTestRule.setContent {
        LabGreeting(name = "Ada", tag = "first")
        LabGreeting(name = "Grace", tag = "second")
    }

    composeTestRule.onNodeWithTag("first").assertTextEquals("Hello, Ada")
    composeTestRule.onNodeWithTag("second").assertTextEquals("Hello, Grace")
}
```

Real output:

```
BUILD SUCCESSFUL
```

The test passes: the *same* function, `LabGreeting`, called twice with
two different `name` arguments, produces two genuinely different real
strings on screen — `"Hello, Ada"` and `"Hello, Grace"` — each findable
by its own real tag. This proves a hand-written `@Composable` function
behaves exactly like any other function: one definition, many calls,
each call's own arguments determining its own real result. This is
called a **component**: a self-contained, named, reusable unit of UI,
defined once.

### Discard the Throwaway Example

`LabGreeting` was written only to prove a custom composable function
produces distinct real output per call; it is not part of the project.

### CS Lens

Defining a reusable unit once and instantiating it many times, each
instance configured by its own arguments, is a foundational idea across
UI programming generally, not unique to Compose: **the component
model**. Also recognized in: React's and Vue's own component systems,
each built on the same "a function of its own props, called many times"
shape; a relational database's stored view, defined once and queried
with different parameters each time; a Unix shell function wrapping a
common multi-command sequence, called with different arguments at each
site instead of the sequence being retyped.

### SE Lens

The alternative: leave every button's rendering logic exactly where it
is, inline inside `CalculatorScreen`'s own loop. The real tradeoff: today,
with one calculator screen and one keypad, nothing is actually broken by
that — the loop already runs the identical code sixteen times, correctly.
The cost shows up the moment a *second* screen needs a key that looks and
behaves the same way; without a named component, that logic would need
to be copied, not reused, and the two copies could quietly drift apart
over time. Extracting the component now, while there's exactly one real
caller, costs one small new function and no behavior change at all.

### Commands Needed

`kotlinc`-style standalone compilation doesn't apply here — `@Composable`
functions can only compile through the real, Gradle-wired project.
`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.Lab1ComponentsTest"` — the same JVM-only Gradle
task this project's every other Robolectric test already runs through.

### Run It

Real output, from this session:

```
$ ./gradlew :app:testDebugUnitTest --tests "com.example.calculator.Lab1ComponentsTest"
BUILD SUCCESSFUL
```

### Connect the Pieces

This unit proved a hand-written composable function is a real, reusable
component, no different in kind from `Button` or `Text`; the next unit
designs exactly what parameters this project's own component should
accept.

## Concept Unit: Parameters, API Design, and Reuse

### The Problem

A reusable button component needs to accept whatever genuinely differs
between this project's sixteen real keys — at minimum, the label and
what happens on click. It should *not* need a caller to repeat things
that never differ, like the button's own shape. And Compose's own
ecosystem has one specific, near-universal convention about a parameter
named `modifier` that this project has never had a reason to follow
before, because it has never written its own composable until now.

> `Button` itself already accepts a `modifier: Modifier = Modifier`
> parameter, and so does `Text`, and so does `Column`. Given that this
> project's new component will itself call `Button` internally, what
> would it mean for the new component to *also* accept its own
> `modifier` parameter, and pass it — combined with something of its
> own — into the `Button` it wraps? What real capability would a caller
> gain from that, that they wouldn't have if the new component simply
> built its own `Modifier` from scratch every time, ignoring anything
> external?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun LabBox(text: String, modifier: Modifier = Modifier) {
    Text(text = text, modifier = modifier.padding(4.dp))
}

@Test
fun externallySuppliedModifierReachesTheUnderlyingComposable() {
    composeTestRule.setContent {
        LabBox(text = "Hi", modifier = Modifier.testTag("mytag"))
    }

    composeTestRule.onNodeWithTag("mytag").assertTextEquals("Hi")
}
```

Real output:

```
BUILD SUCCESSFUL
```

The test passes: `onNodeWithTag("mytag")` finds the real `Text` inside
`LabBox`, even though `LabBox`'s own body never once mentions `testTag`
— the tag arrived entirely through the `modifier` parameter, supplied
from *outside* `LabBox`, then merged with `LabBox`'s own internal
`.padding(4.dp)` addition. This proves the `modifier: Modifier =
Modifier` shape genuinely works as advertised: a caller's own
adjustments survive being combined with a component's own internal
ones, rather than being overwritten or ignored.

### Discard the Throwaway Example

`LabBox` was written only to prove an externally-supplied `Modifier`
reaches a component's own underlying composable; it is not part of the
project.

Both real constructs this lesson needs are now proven: a composable
function with its own parameters (the previous unit), and an
externally-supplied `modifier` merged with an internal one (just above).
Nothing in the real project has changed yet, though —
`CalculatorScreen`'s own loop still calls `Button` and `Text` directly,
sixteen times, with `MaterialTheme.shapes.small` and
`Modifier.testTag(label)` repeated at that one call site every time it
runs. Given `LabGreeting`'s own shape (`name`, `tag` as parameters) and
`LabBox`'s own shape (`text`, `modifier` as parameters), the real
parameter list for a `CalculatorButton` — replacing
`CalculatorScreen`'s own current `Button(onClick = ..., shape =
MaterialTheme.shapes.small, modifier =
Modifier.weight(1f).testTag(label)) { Text(text = label) }` call exactly,
with nothing lost — combines both proven shapes directly into real,
permanent project code, rather than a third throwaway lab: `label` and
`onClick` carry what genuinely differs per call, `modifier` carries
whatever the caller's own layout context supplies, and `shape`/`testTag`
stay fixed inside the new component itself, since every real call wants
them identically.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch
  extraction of this project's own existing inline code, not a port from
  anywhere else.
- **Files affected** — `app/src/main/java/com/example/calculator/MainActivity.kt`
  (modified: one new composable added; `CalculatorScreen`'s own keypad
  loop changed to call it).
- **Change type** — add (the new composable); refactor (the existing
  call site).
- **Location** — a new `@Composable fun CalculatorButton(...)`, placed
  above `CalculatorScreen`, below `operatorSymbols`; `CalculatorScreen`'s
  own inner `for (label in row)` loop body, replacing its direct `Button`
  call.
- **Dependencies** — `Button`/`Text`/`Modifier`/`MaterialTheme.shapes.
  small`, all already real project dependencies; the parameter shape
  proven in this lesson's own previous two units.

### The New Code

```kotlin
@Composable
fun CalculatorButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Button(
        onClick = onClick,
        shape = MaterialTheme.shapes.small,
        modifier = modifier.testTag(label)
    ) {
        Text(text = label)
    }
}
```

### The Updated Project

```kotlin
42  private val operatorSymbols = mapOf(
43      "+" to Operator.PLUS,
44      "−" to Operator.MINUS,
45      "×" to Operator.TIMES,
46      "÷" to Operator.DIVIDE
47  )
48
49  @Composable                                                       // ← new
50  fun CalculatorButton(label: String, onClick: () -> Unit, modifier: Modifier = Modifier) {  // ← new
51      Button(                                                       // ← new
52          onClick = onClick,                                        // ← new
53          shape = MaterialTheme.shapes.small,                       // ← new
54          modifier = modifier.testTag(label)                        // ← new
55      ) {                                                            // ← new
56          Text(text = label)                                        // ← new
57      }                                                              // ← new
58  }                                                                  // ← new
```

`MainActivity.kt` now has a new, real, permanent composable, sitting
between this project's data (`operatorSymbols`) and its screen
(`CalculatorScreen`) — exactly where a reusable building block belongs:
built from the same real dependencies `CalculatorScreen` already had,
available for `CalculatorScreen` to call.

Separately, inside `CalculatorScreen`'s own keypad loop:

```kotlin
64      for (row in keypadRows) {
65          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
66              for (label in row) {
67                  CalculatorButton(                                 // ← new
68                      label = label,                                // ← new
69                      onClick = {
70                          when {
71                              label[0].isDigit() -> {
72                                  displayText = if (displayText == "0" || displayText == "Error") label else displayText + label
73                              }
74                              label == "C" -> {
75                                  displayText = "0"
76                              }
77                              label in operatorSymbols -> {
78                                  firstOperand = displayText.toInt()
79                                  pendingOperator = operatorSymbols[label]
80                                  displayText = "0"
81                              }
82                              label == "=" -> {
83                                  val operator = pendingOperator
84                                  val first = firstOperand
85                                  if (operator != null && first != null) {
86                                      displayText = try {
87                                          operator.operation.apply(first, displayText.toInt()).toString()
88                                      } catch (invalidOperation: ArithmeticException) {
89                                          "Error"
90                                      }
91                                  }
92                                  pendingOperator = null
93                                  firstOperand = null
94                              }
95                          }
96                      },
97                      modifier = Modifier.weight(1f)                 // ← new
98                  )
99              }
100         }
101     }
```

The loop's own job is now visibly smaller: it still decides *which*
sixteen keys exist and *what each one does* when pressed — the real
calculator logic — but it no longer says anything about shape, styling,
or test identity; that's `CalculatorButton`'s own job now.

### Mechanical Walkthrough

- `@Composable fun CalculatorButton(label: String, onClick: () -> Unit,
  modifier: Modifier = Modifier)` — the real function signature this
  lesson's previous two units built toward: `label`, the one plain-data
  parameter every call genuinely differs on; `onClick`, a
  **function-type parameter**, the calculator-specific behavior only the
  caller knows; `modifier`, a **default parameter**, letting
  `CalculatorScreen`'s own `Row` attach `Modifier.weight(1f)` from
  outside.
- `Button(onClick = onClick, ...)` — forwards `CalculatorButton`'s own
  `onClick` parameter straight through to the real `Button` it wraps,
  unchanged.
- `shape = MaterialTheme.shapes.small` — the real property read described
  in the Header; now read once, here, instead of once per call site.
- `modifier = modifier.testTag(label)` — chains `CalculatorButton`'s own
  internal `.testTag(label)` addition onto whatever `Modifier` it
  received as a parameter, the exact real merge behavior this lesson's
  second unit already proved works.
- `{ Text(text = label) }` — `Button`'s own trailing-lambda `content`
  slot, unchanged in shape from every earlier lesson, now supplied by
  `CalculatorButton` instead of directly by `CalculatorScreen`.
- `CalculatorButton(label = label, onClick = { ... }, modifier =
  Modifier.weight(1f))` — the new call site, inside `CalculatorScreen`'s
  own loop: `label = label` passes the loop variable through unchanged;
  the `onClick` lambda is the exact same real calculator logic this
  project already had, untouched; `modifier =
  Modifier.weight(1f)` — built here, inside the real `RowScope`
  `CalculatorScreen`'s own `Row` provides, and handed down to
  `CalculatorButton`, which could never have built it itself.

### CS Lens

The same **component model** this lesson's first unit already named
applies here as this project's own first real instance of it — not a
throwaway proof, a permanent one, now doing real work for all sixteen of
this project's own keys. Deciding which of its details stay configurable
(`label`, `onClick`, `modifier`) and which stay fixed internally (`shape`,
`testTag`) is a second, related idea: **encapsulation** — already named
in this curriculum for classes, applied here to a function's own
parameter list instead of a class's own fields. Also recognized in: a
REST API endpoint's own query parameters, exposing only what a caller is
meant to control while keeping its internal implementation free to
change; a library's public function signature, version to version,
versus its private helper functions underneath.

### SE Lens

The alternative already considered and rejected: give `CalculatorButton`
no `modifier` parameter at all, building its own `Modifier` entirely
from scratch inside its own body. The real tradeoff: without it,
`CalculatorScreen`'s own loop would have nowhere to attach
`Modifier.weight(1f)` — a real, necessary adjustment only the *caller*
can supply, since `weight` requires the `RowScope` `CalculatorButton`
itself is never directly inside. Accepting `modifier` costs one small
parameter, in exchange for `CalculatorButton` staying usable inside a
`Row`'s own layout at all — this isn't optional flexibility invented
speculatively; it's the one real capability this project's own existing
call site already needs, discovered by asking what would break without
it. Beyond this lesson's own first unit's already-stated
extraction-now-versus-duplication-later tradeoff, one more real,
concrete motivation exists for extracting `CalculatorButton` at all:
this curriculum's own BRD names a specific future need this design
already serves — Stage 4 explicitly plans "Calculator Modes" (Basic /
Scientific / Matrix screens), each needing its own keypad-like grid of
keys. `CalculatorButton` is built generally enough — a label, a click
behavior, an optional modifier — to be reused by any of those future
screens without modification, not because this lesson speculatively
invented that flexibility, but because the BRD's own already-planned
Stage 4 genuinely needs it.

### Commands Needed

`./gradlew testDebugUnitTest assembleDebug` — this project's own
already-established combined command, proving both the test suite and a
real, installable `.apk` still build successfully after a change.

### Run It

Real output, from this session:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 5s
43 actionable tasks: 10 executed, 33 up-to-date
```

All 13 real tests pass, unchanged — real, complete regression proof that
extracting `CalculatorButton` changed nothing about this calculator's own
real, observable behavior. Every one of this project's existing tests
that clicks a real button (`pressingDigitsUpdatesDisplay`,
`pressingSevenPlusThreeEqualsShowsTen`,
`pressingFiveDivideZeroEqualsShowsErrorInsteadOfCrashing`, and the rest)
now exercises `CalculatorButton` sixteen times over, not `Button`
directly — and every one of them still passes.

### Connect the Pieces

This unit proved, with a throwaway `LabBox`, that a `modifier` parameter
really does let an outside caller's own adjustments survive being merged
with a component's own internal ones — then combined that proof with the
previous unit's own proof (a hand-written composable really can be
called many times with different real results) directly into
`CalculatorButton`, a real, permanent replacement for sixteen identical
inline `Button` calls, with a real, passing regression suite proving
nothing about the running app actually changed.

## Connect the Pieces

One real call, traced through every unit this lesson built:
`CalculatorButton(label = "5", onClick = { ... }, modifier =
Modifier.weight(1f))`, one of the sixteen real calls `CalculatorScreen`'s
own loop now makes. The first Concept Unit proved, with a throwaway
`LabGreeting`, that a hand-written composable function really can be
called more than once with different real arguments, producing different
real output each time. The second proved, with a throwaway `LabBox`,
that a `modifier` parameter really does let an outside caller's own
adjustments survive being merged with a component's own internal ones —
without that proof, `CalculatorScreen`'s own `Modifier.weight(1f)` would
have had nowhere to attach at all, since `weight` needs the `RowScope`
only the loop itself, not `CalculatorButton`, is ever directly inside —
then combined both proofs into `CalculatorButton` for real: `label`
carries what genuinely differs between calls, `onClick` carries
calculator-specific behavior the component itself knows nothing about,
and `modifier` carries whatever layout adjustment the caller's own
context requires, while `shape` and `testTag` moved inside, fixed,
because every real call wants them identically. Thirteen real tests,
unchanged, still pass — proof this extraction changed how this project's
own code is organized without changing what it does.
