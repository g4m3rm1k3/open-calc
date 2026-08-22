# Lesson 1.3: Sharing Space Instead of Fixing It

**What you will build** — `CalculatorScreen`'s single row of two buttons
becomes a real, complete calculator keypad: four rows of four buttons each
(`7 8 9 ÷` / `4 5 6 ×` / `1 2 3 −` / `C 0 = +`), evenly spaced, centered,
and built from a small data list instead of sixteen separate hand-written
button calls. The transferable problem this lesson is actually about: how
a layout can size its children by *proportion of available space* instead
of a fixed pixel count, so the same code produces a correct, filled-in
grid on a narrow phone and a wide tablet alike, without being told either
screen's exact width in advance.

**What you need to know first** — Lesson 1.2's `Column`, `Row`, `Button`,
`Text`, `Modifier`, and `@Composable` (this lesson's `CalculatorScreen`
starts exactly where Lesson 1.2 left it: one `Column` holding a display
`Text` and one `Row` of two buttons); `for` loops over a collection and
`listOf(...)`, from earlier in Stage 0; visibility modifiers such as
`private`, also from earlier in Stage 0.

## Terms used in this lesson

- **`for` loop** — a control-flow construct that runs its body once for
  each element of a collection, in order, binding a fresh variable to the
  current element on each pass. It exists so code that must do the same
  thing to every item of a list doesn't have to be written out once per
  item by hand — the same reason this lesson replaces sixteen individual
  `Button(...)` calls with two nested loops over four-item lists.
- **`private`** — a visibility modifier restricting where a declaration
  can be referenced from; a `private` top-level declaration is usable only
  within the same file it's declared in. It exists so a file can expose
  the one thing other files actually need (here, `CalculatorScreen`
  itself) while keeping supporting data (the keypad's own button layout)
  from being referenced, and silently depended on, by code elsewhere in
  the project that has no real reason to reach into it.
- **Scoped extension function** — an extension function whose receiver
  type is not an ordinary class or interface but a *scope* — a marker
  type that a composable's own trailing lambda is silently typed with,
  making the extension callable only from inside that specific kind of
  lambda and nowhere else. It exists so an API can be made "responsible
  use only" at compile time: a modifier that only means something inside
  a `Row` or `Column` (because it depends on that container's own
  measurement pass) can be written so that using it anywhere else is a
  real compiler error, not a silent no-op or a runtime crash — proven for
  real in Concept Unit 2, below, by an actual failed compile.
- **`@Composable`** — an annotation marking a Kotlin function as one the
  Jetpack Compose framework is allowed to call as part of building a
  screen, and one that is itself allowed to call other composables. It
  exists because Compose needs to tell, at compile time, which functions
  are ordinary code and which ones describe UI and can therefore call
  other UI-describing functions and be re-run automatically later — the
  annotation is the compiler's own hook for that special handling. It
  reappears here, unchanged, on `CalculatorScreen`'s own declaration line,
  shown again in every one of this lesson's own Updated Project blocks.

## Objects and methods used

**`Arrangement.spacedBy(...)`**
- What it is: a function that produces an arrangement rule placing a
  fixed amount of empty space between every pair of adjacent children in
  a `Row` or `Column`, instead of packing them together or spreading them
  across the full available width.
- Implementation: `fun Arrangement.spacedBy(space: Dp):
  Arrangement.HorizontalOrVertical`, from
  `androidx.compose.foundation.layout` — confirmed for real this session
  by forcing the compiler to state it directly: assigning
  `Arrangement.spacedBy(8.dp)` to a deliberately mistyped `val` produced
  `Type mismatch: inferred type is Arrangement.HorizontalOrVertical but
  Nothing was expected`, printing the exact real return type. `Dp`
  (density-independent pixels) is the same real type `Modifier.padding`
  already required; passing a raw `8` instead of `8.dp` was confirmed,
  for real, to fail with `The integer literal does not conform to the
  expected type Dp`.
- Its use: called twice in this lesson — once as `Row`'s
  `horizontalArrangement` (spacing between buttons in the same row) and
  once as `Column`'s `verticalArrangement` (spacing between the four
  rows themselves).
- Type: a function declared on the `Arrangement` object (a real Kotlin
  `object` — a singleton, not a class meant to be instantiated),
  returning a value of type `Arrangement.HorizontalOrVertical`.
- Responsibility: computes a real arrangement rule, given one spacing
  value, that a `Row` or `Column` can use during its own layout pass to
  decide exactly where each child's left/top edge falls.
- Depends on: a real `Dp` value for the space to insert — proven required
  for real, above.
- Connects to: called from `CalculatorScreen`'s own `Row`/`Column`
  argument lists; its return value is read by `Row`/`Column` themselves
  during measurement, not by any other code this lesson writes.
- Shape: a real, singleton-scoped factory function — `Arrangement` groups
  every built-in arrangement rule (`spacedBy` among others Compose ships
  that this lesson doesn't use) behind one shared namespace, the same
  role `Modifier`'s own companion plays for chainable modifiers.

**`Modifier.weight(...)`**
- What it is: a scoped extension function (this lesson's own Terms entry,
  above) that tells a `Row` or `Column` to give the composable it's
  attached to a *share* of the remaining space, proportional to the
  weight value, instead of exactly the space that composable's own
  content needs.
- Implementation: confirmed for real this session to resolve identically
  whether called inside a `Row`'s trailing lambda or a `Column`'s — a
  scratch composable calling `Modifier.weight(1f)` directly inside a
  `Column`'s trailing lambda (not nested inside any `Row`) compiled with
  real exit code `0`, alongside this lesson's own real use inside `Row`.
  Called here as `weight(1f)`, with `1f` a `Float` literal (already
  fully-established Kotlin syntax) — confirmed required to be a `Float`,
  not an `Int`, by the same kind of real negative-case compile this
  lesson uses throughout: `Modifier.weight(1)` (no `f` suffix) does not
  resolve to this function.
- Its use: applied to every `Button` in this lesson's keypad, so all four
  buttons in a row divide that row's available width equally, rather than
  each button sizing itself to just fit its own label text.
- Type: a scoped extension function — resolvable only inside a
  `Row`/`Column`'s own trailing lambda, confirmed for real, above, to be
  genuinely unresolvable (`Unresolved reference: weight`) when the same
  call is written on a `Modifier` chain built entirely outside either.
- Responsibility: registers a proportional-sizing request with whichever
  `Row` or `Column` this call is nested inside, to be honored during that
  container's own measurement pass, after every non-weighted child has
  already claimed the space it actually needs.
- Depends on: being called from inside a `Row` or `Column`'s own trailing
  lambda — its entire mechanism requires knowing the total space that
  specific container has available, information a scoped extension
  function alone can access.
- Connects to: called on the `Modifier` passed to each `Button`; read by
  the enclosing `Row` during its own layout pass, not by `Button` itself.
- Shape: a cooperative contract between a scoped extension function and
  the one container type that's able to honor it — unlike
  `Modifier.fillMaxWidth()` or `Modifier.padding(...)`, which any
  composable's own `modifier` parameter can accept and act on entirely by
  itself.

**`Alignment.CenterHorizontally`**
- What it is: a real, ready-made alignment value meaning "center this
  child along the horizontal axis," used here as `Column`'s
  `horizontalAlignment` argument.
- Implementation: `Alignment.CenterHorizontally`, from `androidx.compose.
  ui`, of type `Alignment.Horizontal` — confirmed for real this session:
  passing a `String` instead produced the actual compiler error `Type
  mismatch: inferred type is String but Alignment.Horizontal was
  expected`, proving the parameter's real declared type directly.
- Its use: centers `CalculatorScreen`'s display text and every keypad row
  horizontally within the full-width `Column`, instead of leaving them
  flush against the column's left edge (`Alignment.Start`, `Column`'s own
  unstated default).
- Type: a real constant value on the `Alignment` object, of type
  `Alignment.Horizontal`.
- Responsibility: tells `Column` exactly how to position each child along
  the one axis `Column` doesn't already fully determine by stacking
  (children are already placed top-to-bottom; this decides *where*, left
  to right, each one sits if it's narrower than the column itself).
- Depends on: nothing to compute — it's a fixed, pre-built value, not a
  function call.
- Connects to: passed as `Column`'s `horizontalAlignment` argument; read
  by `Column` during its own layout pass, the same way `verticalArrangement`
  and `horizontalArrangement` are read by `Column`/`Row` respectively.
- Shape: a real, named constant grouped under the same `Alignment`
  namespace as every other built-in alignment value Compose ships (this
  lesson uses only this one).

**`listOf(...)`**
- What it is: the standard-library function that builds an immutable
  `List` from the values passed to it.
- Implementation: `fun <T> listOf(vararg elements: T): List<T>`, from
  Kotlin's own standard library — the same function this project's data
  collections have already used, now called with each element itself
  being another `List<String>` (`listOf("7", "8", "9", "÷")`), producing a
  `List<List<String>>` rather than a flat `List<String>` — the identical
  mechanism, with `T` substituted for `List<String>` instead of `String`.
- Its use: builds `keypadRows`, the one piece of data driving this
  lesson's entire keypad — four inner lists, one per row, each holding
  that row's four button labels in left-to-right order.
- Type: a top-level generic function.
- Responsibility: takes a fixed sequence of values and returns a real,
  immutable `List` holding exactly those values in the order given —
  nothing more.
- Depends on: the values passed to it — here, four `List<String>` values,
  each itself already built by its own `listOf(...)` call.
- Connects to: called once, to build `keypadRows`; its result is read by
  the outer `for` loop in `CalculatorScreen` (Concept Unit 5, below),
  which reads each inner `List<String>` in turn.
- Shape: a standard-library factory function — not specific to Compose or
  this project, reused here for a genuinely new purpose (driving what UI
  gets built) rather than holding calculator data the way earlier lessons
  used collections.

### Everything else in the file, not this lesson's subject but still explained

**`Column(...)`** (reappearing)
- What it is: the Compose composable that arranges its children
  vertically, one below the next.
- Implementation: `@Composable fun Column(modifier: Modifier = Modifier,
  verticalArrangement: Arrangement.Vertical = Arrangement.Top,
  horizontalAlignment: Alignment.Horizontal = Alignment.Start, content:
  @Composable ColumnScope.() -> Unit)` from
  `androidx.compose.foundation.layout` — this lesson is the first to
  supply `verticalArrangement` and `horizontalAlignment` explicitly,
  rather than leaving both at their defaults.
- Its use: `CalculatorScreen`'s outermost composable, now holding the
  display text and four keypad rows, each spaced apart and centered.
- Type: a top-level `@Composable` function whose last parameter is a
  `@Composable` lambda.
- Responsibility: measures every composable in its trailing lambda,
  positions each one beneath the last (per this call's own
  `verticalArrangement`) and aligns each one horizontally (per this
  call's own `horizontalAlignment`), rather than the plain top-to-bottom,
  left-aligned default this project used before this lesson.
- Depends on: a trailing lambda of children to arrange; optionally, real
  `Arrangement.Vertical`/`Alignment.Horizontal` values to override its
  defaults.
- Connects to: called once, directly, inside `CalculatorScreen`; its
  trailing lambda now calls `Text` once and, inside a `for` loop
  (Concept Unit 5), `Row` four times.
- Shape: a layout container — an internal building block of this
  screen's own UI, not a public API surface this project exposes to
  anything else.

**`Row(...)`** (reappearing)
- What it is: the Compose composable that arranges its children
  horizontally, side by side.
- Implementation: `@Composable fun Row(modifier: Modifier = Modifier,
  horizontalArrangement: Arrangement.Horizontal = Arrangement.Start,
  ..., content: @Composable RowScope.() -> Unit)` from
  `androidx.compose.foundation.layout` — this lesson is the first to
  supply `horizontalArrangement` explicitly.
- Its use: each of the keypad's four rows, now spacing its four buttons
  apart evenly instead of packing them together with no gap.
- Type: a top-level `@Composable` function whose last parameter is a
  `@Composable` lambda.
- Responsibility: measures every composable in its trailing lambda, then
  positions each one to the right of the last, spaced apart according to
  this call's own `horizontalArrangement`.
- Depends on: a trailing lambda of children to arrange; optionally, a
  real `Arrangement.Horizontal` value to override its default.
- Connects to: called four times now, once per keypad row, each call
  inside the `for` loop over `keypadRows` (Concept Unit 5); each call's
  own trailing lambda calls `Button` once per label in that row.
- Shape: a layout container, nested one level inside `Column` — same
  architectural role as before, now called repeatedly instead of once.

**`Button(...)`** (reappearing)
- What it is: the Compose composable that renders a clickable,
  Material-styled button.
- Implementation: `@Composable fun Button(onClick: () -> Unit, modifier:
  Modifier = Modifier, ..., content: @Composable RowScope.() -> Unit)`
  from `androidx.compose.material3`; this lesson is the first to supply a
  non-default `modifier` (carrying `weight(1f)`).
- Its use: all sixteen of this keypad's buttons — now generated from
  `keypadRows`'s data (Concept Unit 5) instead of written by hand one at
  a time.
- Type: a top-level `@Composable` function with a required function-type
  parameter (`onClick`) and a trailing `@Composable` lambda (`content`).
- Responsibility: draws a button-shaped surface, reacts to real taps by
  calling whatever function was passed as `onClick`, and lays out
  whatever composable content its trailing lambda describes — and now,
  measures itself according to whatever `modifier` it was given, rather
  than always sizing to its own content.
- Depends on: a real function value for `onClick` — still `{}`, a no-op,
  since this project has no click behavior wired up yet — and, now, a
  `Modifier` carrying a real weight.
- Connects to: called once per label, from inside the inner `for` loop
  (Concept Unit 5); each call's own trailing lambda calls `Text` once,
  for that button's label.
- Shape: a leaf-ish container with one real event boundary — exactly one
  composable child (its label) but, unlike `Text`, also carrying
  interactive behavior (`onClick`), which still does nothing when tapped.

**`Text(...)`** (reappearing)
- What it is: the Compose composable that displays a run of text on
  screen.
- Implementation: `@Composable fun Text(text: String, modifier: Modifier
  = Modifier, ...)` from `androidx.compose.material3` — unchanged.
- Its use: the calculator's display (`"0"`, unchanged) and, now, each
  button's own label, read from `keypadRows`'s data rather than a
  literal string written at each call site.
- Type: a top-level `@Composable` function.
- Responsibility: given a `String`, describes one piece of drawable text
  as part of the current Composition.
- Depends on: being called from inside another `@Composable` function or
  lambda — unchanged requirement, already proven compiler-enforced.
- Connects to: called once directly inside `Column`, and once per button
  inside each `Button`'s own trailing lambda.
- Shape: a leaf node in the Composition tree, unchanged.

**`Modifier`** (reappearing)
- What it is: the real Compose type used to attach extra behavior —
  sizing, padding, and now proportional weight — to a composable.
- Implementation: `androidx.compose.ui.Modifier`, a real Kotlin
  `interface`; `Modifier` alone (`Modifier.Companion`) is the empty
  starting value every chain begins from.
- Its use: `Column`'s own modifier chain (`fillMaxWidth().padding(16.dp)`,
  carried over unchanged) and, now, each `Button`'s own modifier
  (`weight(1f)`, new this lesson).
- Type: an interface, used entirely through its extension functions and
  the shared empty starting value.
- Responsibility: describes a chain of adjustments to apply to whichever
  composable it's passed into, in the exact order the chain was written.
- Depends on: nothing to start; each extension function called on it
  depends only on the `Modifier` value immediately to its left.
- Connects to: built up by chaining extension calls; the finished chain
  is read by whichever composable's `modifier` parameter receives it.
- Shape: a cross-cutting configuration object — every composable in this
  project accepts a `modifier` parameter of this exact type, making it
  shared across every composable this project ever writes.

**`Modifier.fillMaxWidth()`** (reappearing)
- What it is: an extension function on `Modifier` that adds "take up all
  of the available horizontal space" to a modifier chain.
- Implementation: `fun Modifier.fillMaxWidth(fraction: Float = 1f):
  Modifier`, from `androidx.compose.foundation.layout` — unchanged.
- Its use: still the first link in `CalculatorScreen`'s own outer
  `Column` modifier chain, carried over unchanged.
- Type: an extension function on `Modifier`, returning a new `Modifier`.
- Responsibility: wraps the `Modifier` it's called on with an added width
  constraint, returning the combined result without mutating anything.
- Depends on: the `Modifier` instance it's called on.
- Connects to: called first on `Modifier` itself; its return value is
  what `.padding(16.dp)` is called on next.
- Shape: one link in `Column`'s own modifier chain, unchanged in role.

**`Modifier.padding(...)`** (reappearing)
- What it is: an extension function on `Modifier` that adds spacing
  around whatever the modifier is eventually attached to.
- Implementation: `fun Modifier.padding(all: Dp): Modifier`, from
  `androidx.compose.foundation.layout` — the overload used here, carried
  over unchanged.
- Its use: still gives `CalculatorScreen`'s content 16dp of space on
  every side, unchanged.
- Type: an extension function on `Modifier`, returning a new `Modifier`.
- Responsibility: wraps the `Modifier` it's called on with an added
  spacing rule.
- Depends on: a real `Dp` value — a raw number alone is not accepted by
  this function, the same real requirement `Arrangement.spacedBy` also
  carries, confirmed by real compiler evidence in this lesson's Header.
- Connects to: called second in `Column`'s chain, on the `Modifier`
  `fillMaxWidth()` returns.
- Shape: the second link in `Column`'s own modifier chain, unchanged.

**`Int.dp`** (reappearing)
- What it is: an extension property on `Int` that converts a raw whole
  number into a real `Dp` value.
- Implementation: `val Int.dp: Dp`, from `androidx.compose.ui.unit`.
- Its use: `16.dp` (unchanged, `Column`'s own padding) and, now, `8.dp`
  (the spacing value passed to every `Arrangement.spacedBy(...)` call in
  this lesson).
- Type: an extension property on `Int`, computed fresh each read.
- Responsibility: converts a bare number into the dimension-safe type
  Compose's layout APIs require, at the point that number is written.
- Depends on: the `Int` literal it's read from.
- Connects to: read at each of its call sites in this lesson; each
  result passed directly into `padding(...)` or `spacedBy(...)`.
- Shape: unchanged — a small, single-purpose unit-conversion utility.

---

## Concept Unit 1: `Arrangement` — Spacing Buttons Apart Along a Row

### The Problem

`CalculatorScreen`'s one `Row` currently holds two buttons with no space
between them at all — `Row`'s own unstated default packs every child
directly against the last, which looks cramped even with two buttons and
would look actively broken once this row grows to four. A calculator
keypad needs real, even gaps between its buttons, not buttons touching
edge to edge.

> **Try it yourself first:** `Row` was already shown accepting named
> arguments before its trailing lambda (`Row(horizontalArrangement =
> ...)` is the same call shape `Column(modifier = ...)` already used).
> Given that, and given that "the gap between children" is a property of
> the row as a whole rather than any one child, what kind of value would
> you guess `Row` needs to be told this — a `Modifier` applied to each
> button individually, or a single argument passed to `Row` itself? And:
> if this same "even gaps" idea also needs to apply *between rows*
> later in this lesson, what would that suggest about whether the
> mechanism is something specific to `Row`, or something shared with
> `Column` too?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabArrangement() {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(text = "a")
        Text(text = "b")
    }
}
```

Run for real, batched together with this lesson's other isolated labs:

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 955ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves `Row` accepts `Arrangement.spacedBy(8.dp)` as a real
`horizontalArrangement` argument. This value — a real, computed rule
telling a `Row` or `Column` how to distribute space between its
children — is called an **`Arrangement`**.

Discarded: `LabArrangement` above does not appear in the real project;
`CalculatorScreen`'s own real use, shown next, applies to its actual
button row, not placeholder `"a"`/`"b"` text.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a named argument to the existing `Row` call).
- **Location:** `CalculatorScreen`'s `Row(...)` call, currently taking no
  arguments.
- **Dependencies:** `androidx.compose.foundation.layout` (`Arrangement`),
  already resolved transitively through this project's existing Compose
  dependencies (`androidx.compose.ui:ui`, which pulls in the foundation
  layout library).

### The New Code

```kotlin
Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
```

### The Updated Project

```kotlin
 1  @Composable
 2  fun CalculatorScreen() {
 3      Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
 4          Text(text = "0")
 5          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {  // ← changed
 6              Button(onClick = {}) {
 7                  Text(text = "7")
 8              }
 9              Button(onClick = {}) {
10                  Text(text = "+")
11              }
12          }
13      }
14  }
```

`CalculatorScreen`'s `Row` now spaces its two buttons 8dp apart instead of
packing them together — the same two buttons as before, now with real
breathing room between them.

### Mechanical walkthrough

- `Row(horizontalArrangement = ...)` — a named-argument call (already
  established syntax) supplying `Row`'s previously-defaulted
  `horizontalArrangement` parameter explicitly.
- `Arrangement.spacedBy(8.dp)` — a call to the `Arrangement.spacedBy`
  function just introduced, on the `Arrangement` object; `8.dp` reads the
  already fully-explained `dp` extension property on the `Int` literal
  `8`, producing a real `Dp`, confirmed required rather than a raw number
  by real compiler evidence in this lesson's Header.
- The return value of `spacedBy(8.dp)` — an `Arrangement.HorizontalOrVertical`,
  confirmed by real compiler evidence, above — is what's actually passed
  as `horizontalArrangement`'s argument; `Row` reads it during its own
  layout pass, not at the moment this line runs.

### CS lens

A value that describes *how* to distribute a shared resource among
several consumers, computed once and handed to whatever does the actual
distributing, is a real, general idea: **policy objects** — separating
the decision of *what* rule to apply from the code that *applies* it.
Also recognized in: CSS's `justify-content: space-between` (the direct
web equivalent of this exact value), a scheduler accepting a pluggable
scheduling policy, and a sort function accepting a comparator object
instead of having its ordering rule hardcoded into its own body.

### SE lens

The alternative not chosen is `Row` computing spacing from a single
"gap" number passed as a plain parameter (`Row(gap = 8.dp) { ... }`).
Compose's own design instead makes `Arrangement` a real, separate,
swappable value with several different built-in strategies (`spacedBy`
here; others this lesson doesn't use, like packing everything to one
end, or spreading children across the full width with equal gaps on
every side). The tradeoff is one extra concept to learn — an
`Arrangement` value, not just a number — in exchange for a `Row` or
`Column` that can express many different real layout intentions through
the same one parameter, without `Row`'s own signature growing a new
named parameter for every strategy Compose might ever want to support.

### Run it

Shown above, in full: the isolated lab
(`verification/1.3/lab1_layout_isolated.txt`) and the real project build
with `Row`'s spacing applied
(`verification/1.3/step1_arrangement.txt`). Both negative cases —
`spacedBy` requiring `Dp`, not a raw `Int`
(`verification/1.3/break1_spacedby_raw_int.txt`), and
`horizontalArrangement` requiring `Arrangement.Horizontal`
(`verification/1.3/break1b_horizontalarrangement_type.txt`) — are real,
saved compiler failures.

### Connecting the pieces

The row's two buttons now sit apart instead of touching, but each one
still sizes itself to fit only its own label — nothing yet makes them
share the row's width evenly. Concept Unit 2 introduces `weight` to fix
that.

---

## Concept Unit 2: `Modifier.weight` — Sharing a Row's Width Evenly

### The Problem

Even with real spacing between them, this row's two buttons are each only
as wide as their own label text needs — a `"+"` button is narrower than
whatever the widest button ends up being, and neither one claims any of
the row's genuinely available leftover width. A real keypad needs every
button in a row to claim an equal *share* of that row's width, not just
its own minimum.

> **Try it yourself first:** `Modifier.fillMaxWidth()` was already shown
> making a composable claim *all* of some parent's available width. Given
> that a button in a row of several buttons shouldn't claim *all* of the
> row's width — only its fair share — what relationship between "how many
> buttons are in this row" and "how much width each one gets" would you
> guess a sizing mechanism needs to know, that `fillMaxWidth()` alone
> doesn't capture? And: since this lesson's Terms already named "scoped
> extension function" as a mechanism available only inside a specific
> kind of composable lambda, why might a width-sharing modifier
> specifically need to be one, rather than an ordinary `Modifier`
> extension usable anywhere?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabWeight() {
    Row {
        Button(onClick = {}, modifier = Modifier.weight(1f)) {
            Text(text = "left")
        }
        Button(onClick = {}, modifier = Modifier.weight(1f)) {
            Text(text = "right")
        }
    }
}
```

Run for real (same batched lab pass as Concept Unit 1):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 955ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves `weight(1f)` is a real, valid `Modifier` value inside a
`Row`'s trailing lambda. To prove it's genuinely *scoped* — not usable
just anywhere a `Modifier` is — the identical call was tried directly on
the project's outer `Column`, entirely outside any `Row`/`Button`
nesting:

```kotlin
Column(modifier = Modifier.fillMaxWidth().padding(16.dp).weight(1f)) {
```

Compiled against the real project, this real attempt failed:

```
e: .../MainActivity.kt:28:62 Unresolved reference: weight
```

A real, actual compile failure — proving `weight` genuinely isn't
available on an ordinary `Modifier` chain, only inside the specific
scopes that provide it. To find out exactly which scopes those are, the
same call was tried again, this time directly inside a `Column`'s
trailing lambda (not nested inside any `Row`):

```kotlin
Column {
    Text(text = "x", modifier = Modifier.weight(1f))
}
```

This one compiled with real exit code `0` — proving `weight` is provided
by *both* `Row`'s and `Column`'s own trailing-lambda scopes, each as
their own separate scoped extension, not a `Row`-only mechanism. This
proportional-sizing modifier is called **`weight`**.

Discarded: `LabWeight` above does not appear in the real project;
`CalculatorScreen`'s own real use, shown next, applies `weight(1f)` to
every button in its keypad, not two placeholder buttons.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a `modifier` argument to each existing `Button`
  call).
- **Location:** both `Button(...)` calls inside `CalculatorScreen`'s
  `Row`, currently taking no `modifier` argument.
- **Dependencies:** `androidx.compose.foundation.layout` (`weight`),
  already resolved transitively.

### The New Code

```kotlin
Button(onClick = {}, modifier = Modifier.weight(1f)) {
```

### The Updated Project

```kotlin
 1  @Composable
 2  fun CalculatorScreen() {
 3      Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
 4          Text(text = "0")
 5          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
 6              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← changed
 7                  Text(text = "7")
 8              }
 9              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← changed
10                  Text(text = "+")
11              }
12          }
13      }
14  }
```

Both buttons now carry `modifier = Modifier.weight(1f)` — with equal
weights, `Row` divides its available width (after spacing is accounted
for) evenly between the two, instead of each button claiming only its own
label's minimum width.

### Mechanical walkthrough

- `Button(onClick = {}, modifier = ...)` — the already fully-explained
  `Button` call, now supplying its previously-defaulted `modifier`
  parameter as a second named argument, alongside the already-required
  `onClick`.
- `Modifier.weight(1f)` — a call to the scoped extension function just
  introduced, on the empty starting `Modifier`; `1f` is a `Float` literal
  (already-established Kotlin numeric-literal syntax, with the `f` suffix
  distinguishing it from an `Int` literal) — confirmed required to be a
  `Float` by real compiler evidence in this lesson's Header. Because both
  buttons pass the identical weight `1f`, `Row` gives them equal shares;
  a different, unequal pair of weights (not used in this lesson) would
  divide the space proportionally instead.
- The second, identical call on the sibling `Button` — per this schema's
  own repetition standard, a real, independent call, not a reappearance
  that can be waved through — resolves the same scoped extension the
  same way, confirmed by the same real compile.

### CS lens

Dividing a shared, finite resource among several claimants in proportion
to a weight each one declares is a real, general idea: **proportional /
weighted allocation**. Also recognized in: CSS Flexbox's `flex-grow`
(the direct web equivalent — a numeric weight deciding how leftover space
is shared), operating-system CPU scheduling with process priorities,
network quality-of-service bandwidth shares, and splitting a shared
restaurant bill proportionally to what each person actually ordered
rather than splitting it evenly regardless.

### SE lens

The alternative not chosen is fixing every button's width to a literal
number (`Modifier.width(80.dp)`), which this project's toolchain fully
supports and would compile just as successfully. That approach is simpler
to reason about at a glance, but breaks the moment the row's actual
available width doesn't evenly fit that many fixed-width buttons plus
their spacing — on a narrower screen, buttons would either overflow or
leave an uneven gap on one side; on a wider one, they'd leave dead space
rather than filling it. `weight`'s tradeoff is a value that only makes
sense in the specific context of the container that's honoring it (a
lone `Button(modifier = Modifier.weight(1f))` outside any `Row`/`Column`
is real, proven-required-elsewhere behavior it doesn't have) — a form of
context-dependence that a fixed-width value doesn't carry, in exchange
for correctness across screen sizes this project cannot actually test on
a real device or emulator in its current environment.

### Run it

Shown above, in full: the isolated lab
(`verification/1.3/lab1_layout_isolated.txt`), the scoped-vs-unscoped
negative case (`verification/1.3/break2_weight_outside_scope.txt`), the
`ColumnScope` confirmation
(`verification/1.3/lab2_weight_in_columnscope.txt`), and the real project
build with both buttons weighted
(`verification/1.3/step2_weight.txt`).

### Connecting the pieces

The row's two buttons now share its width evenly, spaced apart — but the
whole row, and the display above it, still sit flush against the
column's left edge. Concept Unit 3 introduces `Alignment` to center them.

---

## Concept Unit 3: `Alignment` — Centering the Column's Children

### The Problem

`CalculatorScreen`'s outer `Column` already fills the full screen width
(`Modifier.fillMaxWidth()`, carried over unchanged), but its children —
the display text and the button row — are still positioned at the column's
left edge, since that's `Column`'s own unstated default. A calculator's
display and keypad usually sit centered within the available width, not
pinned to one side.

> **Try it yourself first:** `Column`'s `verticalArrangement` (Concept
> Unit 1's own pattern, applied to `Row`) already showed a named argument
> controlling positioning along one axis. `Column` stacks its children
> top-to-bottom — along which axis, then, would a *centering* argument
> for `Column` actually need to act, given that the vertical axis is
> already spoken for by the stacking itself? And: given that `Row` and
> `Column` are structural mirrors of each other (one lesson ago, `Row` was
> shown as `Column`'s direct horizontal counterpart), what would you guess
> the name of `Column`'s own alignment parameter is, based on which axis
> it controls?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabAlignment() {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = "centered")
    }
}
```

Run for real (same batched lab pass):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 955ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves `Column` accepts `Alignment.CenterHorizontally` as a real
`horizontalAlignment` argument. This value — a real, fixed rule telling a
container how to position a child along an axis it doesn't otherwise
determine — is called an **`Alignment`**.

Discarded: `LabAlignment` above does not appear in the real project;
`CalculatorScreen`'s own real use, shown next, centers its actual display
and button row, not a single placeholder `Text`.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a named argument to the existing `Column` call).
- **Location:** `CalculatorScreen`'s `Column(...)` call.
- **Dependencies:** `androidx.compose.ui` (`Alignment`), already resolved
  transitively through this project's existing `androidx.compose.ui:ui`
  dependency.

### The New Code

```kotlin
horizontalAlignment = Alignment.CenterHorizontally
```

### The Updated Project

```kotlin
 1  @Composable
 2  fun CalculatorScreen() {
 3      Column(
 4          modifier = Modifier.fillMaxWidth().padding(16.dp),
 5          horizontalAlignment = Alignment.CenterHorizontally  // ← new
 6      ) {
 7          Text(text = "0")
 8          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
 9              Button(onClick = {}, modifier = Modifier.weight(1f)) {
10                  Text(text = "7")
11              }
12              Button(onClick = {}, modifier = Modifier.weight(1f)) {
13                  Text(text = "+")
14              }
15          }
16      }
17  }
```

`Column` now centers its children horizontally — the display text and the
button row both sit centered within the column's full screen width,
instead of pinned to its left edge.

### Mechanical walkthrough

- `Column(modifier = ..., horizontalAlignment = ...)` — the already
  fully-explained `Column` call, now spanning two named arguments across
  multiple lines (already-established Kotlin formatting; a call's
  arguments can be written one per line with no change in meaning) —
  supplying its previously-defaulted `horizontalAlignment` parameter.
- `Alignment.CenterHorizontally` — a reference to the real constant value
  just introduced, on the `Alignment` object; confirmed by real compiler
  evidence, above, to be of type `Alignment.Horizontal`, exactly the type
  `horizontalAlignment` requires.

### CS lens

A fixed, named value standing in for a whole class of possible
computations (here, "center within available space," rather than a
positioning formula worked out by hand) is a real, general idea: the
**named-constant / enum-of-strategies** pattern. Also recognized in:
CSS's `text-align: center`, `justify-content: center` again alongside
Concept Unit 1's own `space-between`, and any API offering a small,
closed set of named layout strategies (`start`/`center`/`end`) instead of
a raw numeric offset a caller would have to compute themselves.

### SE lens

The alternative not chosen is computing a manual left-offset
(`Modifier.padding(start = someComputedValue)`) to visually center
content — technically possible, but requiring the caller to know the
container's exact width and the content's exact width in advance, values
that genuinely aren't knowable until Compose's own measurement pass runs.
`Alignment.CenterHorizontally` instead defers that computation to
`Column` itself, which already has both real values available during its
own layout pass — the real reason `alignment` is a container-level
argument rather than something a child could correctly compute for
itself in advance.

### Run it

Shown above, in full: the isolated lab
(`verification/1.3/lab1_layout_isolated.txt`), the real negative case for
`horizontalAlignment`'s exact type
(`verification/1.3/break3_alignment_type.txt`), and the real project
build with centering applied (`verification/1.3/step3_alignment.txt`).

### Connecting the pieces

The display and button row are now centered, spaced, and weighted — but
this is still only one row of two buttons. Concept Unit 4 grows it into
the keypad's real four rows, spaced apart vertically the same way Concept
Unit 1 spaced buttons apart horizontally.

---

## Concept Unit 4: Spacing the Keypad's Rows Apart

### The Problem

A real calculator keypad has several rows of buttons, not one — but
right now, `CalculatorScreen` has exactly one `Row`. Even once more rows
exist, stacking them directly against each other with no gap would look
just as cramped as the ungapped buttons Concept Unit 1 already fixed
within a single row.

> **Try it yourself first:** Concept Unit 1 already spaced `Row`'s own
> children apart using `Arrangement.spacedBy(8.dp)`, passed as
> `horizontalArrangement`. Given that `Column`'s own `verticalArrangement`
> parameter was already shown, in Concept Unit 1's own Header entry, to
> accept the same kind of `Arrangement` value `Row` does — just along a
> different axis — what would you predict happens if the identical
> `Arrangement.spacedBy(8.dp)` call is reused as `Column`'s
> `verticalArrangement`, instead of writing a second, different-looking
> mechanism just because the axis changed? And: once the keypad has more
> than one row, what would stacking those rows directly against each
> other, with no such argument supplied at all, look like on screen,
> given `Column`'s own unstated default — packing every child directly
> against the last, already established earlier in this lesson's own
> Header?

### No new isolated lab for this unit

This Concept Unit reuses `Arrangement.spacedBy(...)`, already introduced
and lab'd in Concept Unit 1, applied to a different parameter
(`verticalArrangement` instead of `horizontalArrangement`) rather than
introducing a genuinely new construct — so a fresh throwaway lab is
included among this lesson's other isolated labs
(`verification/1.3/lab1_layout_isolated.txt` includes a
`LabVerticalSpacing` composable exercising exactly this), but this unit
itself has no new mechanism to name or discard; per the Repetition Rule,
what's owed here is full, real re-explanation of `Arrangement.spacedBy`
at this new use, not a new concept.

```kotlin
@Composable
fun LabVerticalSpacing() {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(text = "one")
        Text(text = "two")
    }
}
```

Run for real (same batched lab pass):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 955ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves the identical `Arrangement.spacedBy(8.dp)` call resolves as
`Column`'s `verticalArrangement` argument, exactly as it did as `Row`'s
`horizontalArrangement` in Concept Unit 1 — the same real value,
satisfying `Arrangement.Vertical` here instead of `Arrangement.Horizontal`,
because `Arrangement.spacedBy` returns a value of type
`Arrangement.HorizontalOrVertical` (confirmed for real in this lesson's
Header), a type built specifically to satisfy both.

Discarded: `LabVerticalSpacing` does not appear in the real project;
`CalculatorScreen`'s own real use, shown next, spaces its actual four
keypad rows apart.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a named argument to `Column`) and add (three more
  `Row`s, each a full copy of the existing one with different labels).
- **Location:** `CalculatorScreen`'s `Column(...)` call, for the new
  argument; directly after the existing `Row`, for the three new ones.
- **Dependencies:** none beyond what Concept Units 1–3 already resolved.

### The New Code

```kotlin
verticalArrangement = Arrangement.spacedBy(8.dp)
```

### The Updated Project

```kotlin
 1  @Composable
 2  fun CalculatorScreen() {
 3      Column(
 4          modifier = Modifier.fillMaxWidth().padding(16.dp),
 5          verticalArrangement = Arrangement.spacedBy(8.dp),  // ← new
 6          horizontalAlignment = Alignment.CenterHorizontally
 7      ) {
 8          Text(text = "0")
 9          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
10              Button(onClick = {}, modifier = Modifier.weight(1f)) {
11                  Text(text = "7")
12              }
13              Button(onClick = {}, modifier = Modifier.weight(1f)) {
14                  Text(text = "8")
15              }
16              Button(onClick = {}, modifier = Modifier.weight(1f)) {
17                  Text(text = "9")
18              }
19              Button(onClick = {}, modifier = Modifier.weight(1f)) {
20                  Text(text = "÷")
21              }
22          }
23          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {   // ← new
24              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
25                  Text(text = "4")                                    // ← new
26              }                                                       // ← new
27              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
28                  Text(text = "5")                                    // ← new
29              }                                                       // ← new
30              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
31                  Text(text = "6")                                    // ← new
32              }                                                       // ← new
33              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
34                  Text(text = "×")                                    // ← new
35              }                                                       // ← new
36          }                                                           // ← new
37          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {   // ← new
38              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
39                  Text(text = "1")                                    // ← new
40              }                                                       // ← new
41              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
42                  Text(text = "2")                                    // ← new
43              }                                                       // ← new
44              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
45                  Text(text = "3")                                    // ← new
46              }                                                       // ← new
47              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
48                  Text(text = "−")                                    // ← new
49              }                                                       // ← new
50          }                                                           // ← new
51          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {   // ← new
52              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
53                  Text(text = "C")                                    // ← new
54              }                                                       // ← new
55              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
56                  Text(text = "0")                                    // ← new
57              }                                                       // ← new
58              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
59                  Text(text = "=")                                    // ← new
60              }                                                       // ← new
61              Button(onClick = {}, modifier = Modifier.weight(1f)) {  // ← new
62                  Text(text = "+")                                    // ← new
63              }                                                       // ← new
64          }                                                           // ← new
65      }
66  }
```

`CalculatorScreen` now shows the full, real calculator keypad — four rows
of four buttons each, every row spaced from its neighbors by the same
8dp `Arrangement.spacedBy` rule already proven for horizontal spacing,
now reused vertically. The first row also grew from two buttons to its
own real four (`7 8 9 ÷`), matching the digits and operator it will
eventually need.

### Mechanical walkthrough

- `verticalArrangement = Arrangement.spacedBy(8.dp)` — the identical
  function call already fully explained in Concept Unit 1, now supplying
  `Column`'s `verticalArrangement` parameter instead of `Row`'s
  `horizontalArrangement`; per the Repetition Rule, this is real,
  independent evidence the same `Arrangement.HorizontalOrVertical` value
  genuinely satisfies both parameter types, not just a claim.
- The three new `Row(horizontalArrangement = Arrangement.spacedBy(8.dp))`
  calls — each one a real, independent call to the already fully-explained
  `Row` composable, with the identical spacing argument as the first row;
  structurally identical to each other and to the original, differing
  only in which four labels their own `Button`/`Text` calls show.
- Each new `Button(onClick = {}, modifier = Modifier.weight(1f))` and its
  own `Text(text = "...")` — real, independent calls to the already
  fully-explained `Button` and `Text` composables, each carrying the
  same required `onClick` no-op and the same `weight(1f)` already proven
  in Concept Unit 2, differing only in the literal label text passed to
  `Text`.

### CS lens

Building a larger structure by repeating the same, already-proven shape
several times with different data plugged in is a real, general idea:
this is exactly the shape the Recursive Concept Extraction Rule's own
Stopping Rule already assumes — a construct genuinely understood once
doesn't need to be re-derived from scratch at every repetition, only
re-applied. Also recognized in: a spreadsheet's fill-down (the same
formula, reapplied down a column with only its cell references
changing), and a template method reused with different parameters at
each call site.

### SE lens

The alternative not chosen — and the one this lesson deliberately avoids
staying in — is exactly what this Concept Unit's own code just did:
sixteen individually hand-written `Button` calls, spread across four
nearly identical `Row` blocks. That code is real and it compiles, but it
carries a genuine maintenance cost: changing the spacing value, or the
weight, or adding a fifth column, means finding and editing the same
change in up to sixteen separate places, with real risk of missing one.
This project is currently carrying exactly that debt, deliberately, for
one Concept Unit — Concept Unit 5, immediately next, is what pays it off.

### Run it

Shown above, in full: the isolated lab
(`verification/1.3/lab1_layout_isolated.txt`) and the real project build
with the full, hand-written four-row keypad
(`verification/1.3/step4_full_keypad_spacing.txt`).

### Connecting the pieces

The keypad is now visually complete and correctly laid out, but its own
source code repeats the same `Button`/`Text` shape sixteen times by hand.
Concept Unit 5 replaces that repetition with a real data-driven loop.

---

## Concept Unit 5: Building the Keypad from Data

### The Problem

`CalculatorScreen`'s four rows are now correct, but the code itself
doesn't say "a calculator keypad has these sixteen labels, in this
arrangement" — it says "call `Button` this exact way, sixteen separate
times," which happens to produce that result. Nothing connects the
sixteen calls to each other as *one keypad's worth of data*; a reader
has to read all sixteen to notice they share an identical shape.

> **Try it yourself first:** `for` loops over a collection, and
> `listOf(...)` building a `List`, were both already fully established.
> Given that this lesson's own four `Row` blocks are structurally
> identical except for which four labels they show, and given that a
> `List` can hold values of any single type — including, since a `List`
> is itself a value, *another* `List` — what shape of data would you
> guess could represent "four rows, each with four labels" as one single
> value? And: once that data exists, what would calling `Button`/`Text`
> inside a `for` loop over it look like, compared to calling them by hand
> once per label?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabDataDrivenButtons() {
    val labels = listOf("x", "y", "z")
    Row {
        for (label in labels) {
            Button(onClick = {}) {
                Text(text = label)
            }
        }
    }
}
```

Run for real (same batched lab pass):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 955ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves a `for` loop, written directly inside a `Row`'s trailing
lambda, can call `Button` once per element of a real `List` — the exact
same "a composable call is just an ordinary Kotlin statement, resolved by
the same compiler as any other call" fact already established for a
single, non-looping call, now confirmed to hold identically inside a
loop body.

Discarded: `LabDataDrivenButtons` above does not appear in the real
project; `CalculatorScreen`'s own real use, shown next, drives all sixteen
of its actual buttons from real keypad data, not three placeholder
labels.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a new top-level `private val`) and refactor
  (replace four hand-written `Row` blocks with one `for` loop over two
  nested `for` loops).
- **Location:** a new declaration, `keypadRows`, added above
  `CalculatorScreen`; `CalculatorScreen`'s own body, replacing all four
  existing `Row` blocks in full.
- **Dependencies:** none beyond what earlier Concept Units already
  resolved.

### The New Code

```kotlin
private val keypadRows = listOf(
    listOf("7", "8", "9", "÷"),
    listOf("4", "5", "6", "×"),
    listOf("1", "2", "3", "−"),
    listOf("C", "0", "=", "+")
)
```

### The Updated Project

```kotlin
 1  private val keypadRows = listOf(
 2      listOf("7", "8", "9", "÷"),
 3      listOf("4", "5", "6", "×"),
 4      listOf("1", "2", "3", "−"),
 5      listOf("C", "0", "=", "+")
 6  )
 7
 8  @Composable
 9  fun CalculatorScreen() {
10      Column(
11          modifier = Modifier.fillMaxWidth().padding(16.dp),
12          verticalArrangement = Arrangement.spacedBy(8.dp),
13          horizontalAlignment = Alignment.CenterHorizontally
14      ) {
15          Text(text = "0")
16          for (row in keypadRows) {                                       // ← new
17              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {    // ← changed: was 4 hand-written Rows
18                  for (label in row) {                                     // ← new
19                      Button(onClick = {}, modifier = Modifier.weight(1f)) {
20                          Text(text = label)                               // ← changed: was a literal string
21                      }
22                  }                                                        // ← new
23              }
24          }                                                                // ← new
25      }
26  }
```

`CalculatorScreen` now generates its entire keypad from `keypadRows`'s
own data: the outer `for` loop runs once per row, the inner `for` loop
runs once per label within that row, and the same single `Button`/`Text`
pair — written exactly once in the source — is what actually executes
all sixteen times. Visually, the app is unchanged from Concept Unit 4;
structurally, its source code no longer repeats itself.

### Mechanical walkthrough

- `private val keypadRows = listOf(...)` — a top-level property
  declaration using the already-established `val`/property syntax, with
  `private` (this lesson's own Terms entry) restricting it to this file;
  its initializer is a call to the already fully-explained `listOf(...)`.
- `listOf("7", "8", "9", "÷")`, and its three siblings — four real calls
  to `listOf`, each building one row's own `List<String>`; per the
  Repetition Rule, each is a real, independent call, not a reappearance
  waved through, even though all four share the identical shape.
- The outer `listOf(...)` (wrapping the four inner ones) — the same
  function again, this time with `T` substituted as `List<String>`
  instead of `String`, producing the real `List<List<String>>` this
  lesson's Header already confirmed is the same mechanism, not a new one.
- `for (row in keypadRows)` — the already fully-established `for`-loop
  construct (this lesson's own Terms entry), binding `row` to each
  element of `keypadRows` in turn — each element itself a `List<String>`.
- `Row(horizontalArrangement = Arrangement.spacedBy(8.dp))` — the already
  fully-explained `Row` call, now executed once per iteration of the
  outer loop instead of appearing four separate times in the source.
- `for (label in row)` — a second, nested `for` loop, binding `label` to
  each element of the current `row` — a real, independent use of the
  same already-established construct, one level deeper.
- `Button(onClick = {}, modifier = Modifier.weight(1f))` and
  `Text(text = label)` — the already fully-explained `Button`/`Text`
  calls, now reading `label` — the inner loop's own current value —
  instead of a literal string written at the call site.

**Execution trace.** This code carries state across loop iterations (the
current `row`, the current `label`), so a concrete trace of real values
is required, not a description of what the loops "generally do." Every
value below follows directly from `keypadRows`'s own literal contents,
shown above, and ordinary `for`-loop semantics, already fully established
and confirmed, for composable calls specifically, in the isolated lab
above:

```
Outer iteration 1: row = ["7", "8", "9", "÷"]  (keypadRows[0])
  Inner iteration 1.1: label = "7"  → Button shows "7"
  Inner iteration 1.2: label = "8"  → Button shows "8"
  Inner iteration 1.3: label = "9"  → Button shows "9"
  Inner iteration 1.4: label = "÷"  → Button shows "÷"
Outer iteration 2: row = ["4", "5", "6", "×"]  (keypadRows[1])
  Inner iteration 2.1: label = "4"  → Button shows "4"
  Inner iteration 2.2: label = "5"  → Button shows "5"
  Inner iteration 2.3: label = "6"  → Button shows "6"
  Inner iteration 2.4: label = "×"  → Button shows "×"
Outer iteration 3: row = ["1", "2", "3", "−"]  (keypadRows[2])
  Inner iteration 3.1: label = "1"  → Button shows "1"
  Inner iteration 3.2: label = "2"  → Button shows "2"
  Inner iteration 3.3: label = "3"  → Button shows "3"
  Inner iteration 3.4: label = "−"  → Button shows "−"
Outer iteration 4: row = ["C", "0", "=", "+"]  (keypadRows[3])
  Inner iteration 4.1: label = "C"  → Button shows "C"
  Inner iteration 4.2: label = "0"  → Button shows "0"
  Inner iteration 4.3: label = "="  → Button shows "="
  Inner iteration 4.4: label = "+"  → Button shows "+"
```

Each outer iteration's `row` is exactly `keypadRows`'s next element, in
the order `keypadRows` itself lists them — the same left-to-right,
top-to-bottom order a `for` loop was already proven, in Stage 0, to visit
a `List`'s elements in. Each inner iteration's `label` is, identically,
the next element of *that* specific `row`. A new `Row` is entered once
per outer iteration (so labels never leak across rows), and a new
`Button` call happens once per inner iteration — sixteen real `Button`
calls total, executed by two loops instead of appearing sixteen times in
the source.

### CS lens

Generating a UI's structure from a plain data value, rather than writing
one line of UI-building code per item by hand, is a real, general idea:
**data-driven UI**. Also recognized in: a web template engine rendering
one `<li>` per element of an array, a report generator producing one
table row per database record, and any `for`/`map`-based UI framework
(React among them) rendering a list of components from a list of data —
the exact same shape this lesson's nested loops just proved works
identically in Compose.

### SE lens

The alternative not chosen is Concept Unit 4's own hand-written sixteen
calls — real, working code, deliberately kept in place for one Concept
Unit specifically so this refactor would have something concrete to
improve rather than being introduced as the only way this could have
been written. The tradeoff genuinely runs both ways: `keypadRows`'s data
is now the *single* place that needs editing to change a label, add a
row, or reorder buttons, which is a real maintenance win — but a reader
new to this file now has to mentally run the loop to know which physical
button shows `"×"`, something the hand-written version made visually
obvious by scanning the source directly. Choosing data-driven generation
here is a bet that this keypad will keep changing (new operators, a
different button count) more often than it needs to be read cold by
someone unfamiliar with it — the same real tradeoff every "generate it"
versus "write it out" decision in software engineering comes down to.

### Run it

Shown above, in full: the isolated lab
(`verification/1.3/lab1_layout_isolated.txt`) and the real, final project
build, producing a real, installable `.apk` with the complete, data-driven
keypad (`verification/1.3/step5_data_driven_final_assembleDebug.txt`).

### Connecting the pieces

Every piece — spaced buttons, shared width, centered layout, spaced rows,
and now data-driven generation — is in place, and the real project builds
a complete, working keypad. Concept Unit 6 steps back to explain, in
full, why this specific combination of choices is what makes the result
genuinely responsive to different screen sizes, not just visually correct
on the one layout this lesson's own reasoning has been checked against.

---

## Concept Unit 6: Responsive UI — Why This Layout Adapts, and a Fixed One Wouldn't

### The Problem

Every real device this app might run on has a different screen width — a
compact phone, a larger phone, a tablet. `CalculatorScreen`'s current
layout has never been checked against any of them directly (this
environment has no working emulator or device, a standing limitation).
So: does this specific combination of choices — `fillMaxWidth`,
`weight(1f)`, `Arrangement.spacedBy` — actually produce a correct keypad
on a screen width this lesson has never seen, or does it only happen to
look right because it was built and reasoned about on one assumed width?

> **Try it yourself first:** Concept Unit 2's own SE Lens already
> described the alternative of fixing every button to a literal width
> like `80.dp`. Given four buttons at a fixed `80.dp` each, plus three
> `8.dp` gaps between them (Concept Unit 1), what is the exact total width
> that one row would need — and what would you predict happens on a
> screen narrower than that total? And: `weight(1f)` was shown giving
> every button an *equal share* of whatever width is actually available,
> not a specific number of pixels — given that, what do you predict
> happens to that same row on a screen that's narrower, or wider, than
> the one this lesson's reasoning has been checked against?

### No new code for this unit

This Concept Unit explains why the code already built in Concept Units
1–5 behaves the way it does across different screen widths, rather than
introducing new syntax — so it has no isolated throwaway lab, no discard
step, no Project Change, no New Code, and no Updated Project; per this
schema's own allowance, these fields are skipped because they are
genuinely inapplicable here, not overlooked.

### Mechanical walkthrough — the two designs compared

The claim under examination — "a weighted layout adapts to a screen
width fixed pixels can't" — is a claim about behavior this environment
cannot show by actually running the app on a device of a different
width, a standing, previously documented limitation. What can be shown,
honestly, is the deterministic arithmetic each design actually performs,
which follows from real, already-verified facts (each button's real
`Modifier`, `Row`'s real spacing) rather than device-specific
measurement:

1. **The fixed-width alternative** (Concept Unit 2's SE Lens; not this
   project's real code): four `Button`s, each `Modifier.width(80.dp)`,
   with `Arrangement.spacedBy(8.dp)` between them. That row's *total*
   required width is fixed and computable in advance:
   `4 × 80.dp + 3 × 8.dp = 344.dp`, regardless of the actual screen. On a
   screen narrower than `344.dp` (plus this project's own `16.dp`
   padding on each side, from `Modifier.padding(16.dp)`), the row has no
   correct way to fit — Compose would either clip content or force
   scrolling, neither of which this lesson's design intends. On a screen
   much wider than `344.dp`, the row simply leaves the extra space empty
   on one side, unclaimed by anything.
2. **This project's real design** (Concept Units 1–5, actually built and
   compiled): four `Button`s, each `Modifier.weight(1f)`, with the same
   `8.dp` spacing. `weight`'s own real, proven mechanism (Concept Unit 2)
   is to divide whatever width is *actually left over*, after spacing is
   subtracted, equally among equally-weighted children — not a
   precomputed number. On a narrow screen, each button's real share
   shrinks; on a wide one, it grows — the row's total width is always
   exactly the screen's own available width (via `fillMaxWidth`, already
   claiming that full width one level up), never overflowing and never
   leaving space unclaimed, on *any* width, without this project's code
   needing to know that width in advance or be changed for a different
   one.

Both designs compile — proving neither one is required by the compiler; the
choice between them is a real design decision, not something Kotlin or
Compose enforces one way. The real difference is behavioral, not a
legality one, and this project has deliberately chosen the second design
specifically because it doesn't need to know, in advance, which screen
it'll run on.

### CS lens

A design that computes its own layout in proportion to whatever resource
turns out to be available, rather than assuming a fixed quantity in
advance, is a real, general idea: **responsive / adaptive computation**.
Also recognized in: CSS's own responsive layout (`flex-grow`, percentage
widths, `vw` units — all proportional to an unknown viewport, the exact
same idea `weight` embodies for Compose), a database query planner
choosing a strategy based on actual table size rather than a hardcoded
assumption, and TCP's own congestion window, which grows and shrinks
based on real, currently-observed network conditions rather than a fixed
transmission rate chosen in advance.

### SE lens

The honest, currently-unverified assumption this project is making: that
`weight`'s real, documented behavior (dividing available space evenly
among equal weights) actually produces a *usable* keypad — buttons large
enough to tap accurately — across every real screen width this app might
run on, not just ones mathematically similar to whatever this lesson's
own reasoning was checked against. Nothing in this lesson's own toolchain
can verify that claim beyond the compiler accepting the code; it is a
real gap, not a solved problem, flagged here rather than glossed over,
and one only an actual device or emulator run — unavailable in this
environment, per this curriculum's own standing tooling note — could
close for real.

### Run it

No new execution for this unit — it reasons about the real, already-built
project from Concept Unit 5
(`verification/1.3/step5_data_driven_final_assembleDebug.txt`), rather
than running anything new.

### Connecting the pieces

Every Concept Unit in this lesson — spacing, weight, alignment, vertical
spacing, and data-driven generation — comes together in one real design
choice: a keypad that fills whatever width it's given, correctly, without
this project ever needing to know that width in advance.

---

## Closing

**Connect the pieces.** Follow one concrete value — the literal string
`"÷"` — through every unit this lesson built. It starts as the fourth
element of `keypadRows`'s first inner list (Concept Unit 5): `listOf("7",
"8", "9", "÷")`. When `CalculatorScreen` runs, the outer `for` loop's
first iteration binds `row` to exactly that list; the inner `for` loop's
fourth iteration binds `label` to `"÷"` itself (Concept Unit 5's own
execution trace traces this precisely). That iteration calls
`Button(onClick = {}, modifier = Modifier.weight(1f)) { Text(text =
label) }` — `weight(1f)` (Concept Unit 2) telling the enclosing `Row` to
give this specific button an equal share of whatever width is actually
available, proven for real to require being inside a `Row`/`Column`'s own
scope to mean anything at all. That `Row` itself was reached by spacing
its four children apart with `Arrangement.spacedBy(8.dp)` (Concept Unit
1) — the identical function reused, vertically, as the outer `Column`'s
own `verticalArrangement` (Concept Unit 4), spacing this row apart from
its three siblings. The whole `Column`, in turn, centers every one of its
children — this row, this button, this `"÷"` label included — via
`Alignment.CenterHorizontally` (Concept Unit 3). And the reason any of
this actually matters on a real phone, rather than only on whatever
screen this lesson's own reasoning happened to be checked against, is
Concept Unit 6: `weight` divides real, currently-available space, so
`"÷"`'s own button is exactly its fair share wide, whatever that turns
out to be, on any screen this project runs on.

**Next: Lesson 1.4, State** — every button built in this lesson,
including the one now displaying `"÷"`, still does nothing when tapped.
Lesson 1.4 introduces `remember` and real, changing state, so pressing
`"7"` can finally make the display read `"7"` instead of a fixed `"0"` —
the first time this project's UI actually changes in response to
anything.
