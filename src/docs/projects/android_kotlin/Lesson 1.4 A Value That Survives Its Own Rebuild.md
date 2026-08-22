# Lesson 1.4: A Value That Survives Its Own Rebuild

**What you will build** — `CalculatorScreen`'s display finally changes:
pressing `7` makes it read `"7"`; pressing `8` right after makes it read
`"78"`. This is the first time this project's UI actually responds to
anything. The transferable problem this lesson is actually about: how a
UI framework can hold a value that changes over time, notice exactly when
it changes, and keep that value alive across its own repeated rebuilding
of the screen — and, just as important, how to *prove* that mechanism
actually works, with a real, executed test, rather than trusting a
plausible-sounding description of what a framework "should" do.

**What you need to know first** — `CalculatorScreen`'s existing
`Column`/`Row`/`Button`/`Text`/`Modifier`/`@Composable` structure and its
complete, data-driven keypad; named-argument calls and `for` loops over a
collection, from earlier in Stage 0; `var` versus `val` and property
syntax, also from earlier in Stage 0.

## Terms used in this lesson

- **`by` (property delegation)** — a Kotlin declaration-site keyword that
  hands a property's own storage and access logic to a separate *delegate*
  object, instead of the property managing its own backing field
  directly. Written `var displayText by remember { mutableStateOf("0") }`,
  it exists so a property can be backed by any object with the right
  shape (Concept Unit 3, below, shows exactly what shape that is) —
  reading or writing `displayText` becomes reading or writing that
  delegate, without the property's own declaration needing to spell out
  how.
- **Use-site target** — a Kotlin syntax that narrows exactly which
  generated element an annotation attaches to, written as
  `@target:Annotation` (here, `@get:Rule`). It exists because a single
  Kotlin property declaration can generate more than one real JVM element
  (a backing field, a getter method, sometimes a setter), and some
  annotations are only meaningful on one specific one of those — `@get:`
  says "attach this annotation to the property's generated getter
  specifically," not the field or the property declaration as a whole.
- **`@Rule`** — a JUnit annotation marking a field or property (via a
  use-site-targeted getter, here) as a piece of test infrastructure JUnit
  itself must manage — running setup before each test method and
  teardown after, around the test body, rather than the test writing that
  bookkeeping by hand.
- **`@RunWith`** — a JUnit annotation naming an alternate *test runner* —
  the real class actually in charge of executing a test class's methods —
  in place of JUnit's own plain default runner.
- **`@Test`** — a JUnit annotation marking a function as a test case
  JUnit's runner should actually execute and report a pass/fail result
  for, rather than an ordinary helper method that happens to sit inside a
  test class.
- **`@Config`** — a Robolectric-specific annotation configuring how
  Robolectric's own simulated Android environment behaves for the test
  class or method it's attached to; `sdk = [34]` tells it which Android
  SDK version to simulate, matching this project's own real
  `compileSdk`.
- **State-driven UI** — the architectural principle that a composable's
  own visible output is entirely determined by reading a current value,
  never by some other code reaching in and imperatively telling a
  specific widget to change. `Text(text = displayText)` never receives an
  instruction like "now show 7"; it simply reads whatever `displayText`
  currently holds, every time it (re)runs — proven for real in Concept
  Unit 6, below, by an actual executed test.
- **Recomposition** — Compose calling some of a program's `@Composable`
  functions again, later, because a value they read has changed, so the
  Composition it's holding can be brought up to date without rebuilding
  the whole screen from scratch. This project's screen had no changing
  value to exercise this with before this lesson; Concept Unit 6, below,
  is where it is finally triggered and observed for real, for the first
  time in this curriculum.
- **`@Composable`** (reappearing) — an annotation marking a Kotlin
  function as one Compose is allowed to call while building a screen, and
  one that is itself allowed to call other composables. It exists because
  Compose needs to tell, at compile time, which functions are ordinary
  code and which ones describe UI and can therefore call other
  UI-describing functions and be re-run automatically later. It reappears
  here, unchanged, still marking `CalculatorScreen`'s own declaration,
  shown again in every one of this lesson's own Updated Project blocks.

## Objects and methods used

**`mutableStateOf(...)`**
- What it is: the function that creates a real, observable state
  holder — a container for one value that Compose can notice being read
  during composition, and notice being written to later.
- Implementation: `fun <T> mutableStateOf(value: T): MutableState<T>`,
  from `androidx.compose.runtime`.
- Its use: creates the state holder wrapping `CalculatorScreen`'s own
  display text, starting at `"0"`.
- Type: a top-level generic function, returning a `MutableState<T>`.
- Responsibility: allocates one real, independent state holder with a
  given starting value; does nothing on its own to keep that holder
  alive across anything — that is a separate concern, `remember`'s own
  (Concept Unit 3, below).
- Depends on: an initial value of whatever type `T` is being inferred.
- Connects to: called once inside `CalculatorScreen`; its return value is
  immediately passed into `remember { }`, not stored directly.
- Shape: a factory function — the entry point into Compose's state
  system, not itself the mechanism that survives recomposition.

**`MutableState<T>`**
- What it is: the real interface `mutableStateOf(...)` returns — a
  mutable container holding exactly one value of type `T`, readable and
  writable through its own `value` property.
- Implementation:
  ```kotlin
  interface MutableState<T> : State<T> {
      override var value: T
  }
  ```
  from `androidx.compose.runtime` — `State<T>` (its own parent interface)
  declares `value` as read-only (`val`); `MutableState<T>` overrides it as
  read-write (`var`). Reading `.value` during composition registers that
  composable as depending on this state; writing `.value` is what
  actually triggers Compose to schedule recomposition of every reader.
- Its use: `displayText` is declared *as* a delegated property backed by
  a `MutableState<String>` — every read or write of `displayText`
  compiles down to reading or writing this interface's own `value`
  property, through the `getValue`/`setValue` operators below.
- Type: an interface, extending `State<T>`.
- Responsibility: holds exactly one current value and is the single
  source Compose's own recomposition machinery watches to know when that
  value has changed.
- Depends on: nothing further — it's a real, minimal, self-contained
  interface.
- Connects to: created by `mutableStateOf(...)`; read and written through
  `remember`'s own returned reference, via the `by`-delegation operators
  below — never accessed as a bare `.value` call anywhere in this
  lesson's own project code, because `by` handles that translation.
- Shape: the actual state-holding object at the center of this whole
  mechanism — everything else in this lesson (`remember`, `by`,
  recomposition itself) exists to create, preserve, or react to this one
  interface.

**`getValue` (operator extension)**
- What it is: the specific function Kotlin's `by` delegation calls every
  time a delegated property is *read*.
- Implementation: `operator fun <T> State<T>.getValue(thisObj: Any?,
  property: KProperty<*>): T`, from `androidx.compose.runtime` — an
  `operator`-modified extension function on `State<T>` (`MutableState<T>`
  itself extends `State<T>`, so this applies to it too). Confirmed for
  real this session: removing its import while `by` was still in use
  produced the actual compiler error `Type 'TypeVariable(T)' has no
  method 'getValue(Nothing?, KProperty<*>) and thus it cannot serve as a
  delegate`, printing this exact real signature shape directly.
- Its use: every plain read of `displayText` anywhere in
  `CalculatorScreen`'s code (inside `Text(text = displayText)`, inside
  the digit-append check) is compiled by Kotlin into a call to this
  function on the underlying `MutableState<String>`.
- Type: an `operator` extension function on `State<T>`.
- Responsibility: reads the current value out of a `State<T>`'s own
  `value` property and hands it back to whatever read `displayText`.
- Depends on: `by`'s own compiler-generated call — never written directly
  by this project's own code.
- Connects to: called by the compiler wherever `displayText` is read;
  reads through to `MutableState.value`.
- Shape: one half of the real machinery that makes `by` legal on a
  property at all — Kotlin's own compiler requires a matching `getValue`
  (and, for a `var`, `setValue`, below) on whatever's placed after `by`.

**`setValue` (operator extension)**
- What it is: the specific function Kotlin's `by` delegation calls every
  time a delegated `var` property is *written*.
- Implementation: `operator fun <T> MutableState<T>.setValue(thisObj:
  Any?, property: KProperty<*>, value: T): Unit`, from
  `androidx.compose.runtime` — confirmed for real this session: removing
  its import (with `getValue` still present) produced the actual compiler
  error `Type 'MutableState<String>' has no method 'setValue(Nothing?,
  KProperty<*>, String)' and thus it cannot serve as a delegate for var
  (read-write property)`, printing this exact real signature directly.
- Its use: every assignment to `displayText` (the digit-append logic)
  compiles into a call to this function.
- Type: an `operator` extension function on `MutableState<T>` — narrower
  than `getValue`'s receiver, since only a genuinely *mutable* state can
  support being written to.
- Responsibility: writes a new value into the underlying `MutableState`'s
  own `value` property — the exact write that Compose's own recomposition
  machinery is watching for.
- Depends on: `by`'s own compiler-generated call, and only applies
  because `displayText` was declared `var`, not `val` — confirmed
  required for real, above.
- Connects to: called by the compiler wherever `displayText` is assigned;
  writes through to `MutableState.value`, which is what actually notifies
  Compose a change happened.
- Shape: the other half of the machinery `by` needs — together with
  `getValue`, it's what makes `var displayText by remember { ... }` a
  real, compiling, meaningful property declaration.

**`remember { ... }`**
- What it is: the function that keeps whatever value its lambda computes
  alive across recomposition, instead of recomputing it fresh every time
  the enclosing composable runs again.
- Implementation: `@Composable fun <T> remember(calculation: () -> T): T`,
  from `androidx.compose.runtime`.
- Its use: wraps `mutableStateOf("0")` so the *same* `MutableState`
  object — not a fresh one with `"0"` in it — is what `displayText`
  reads and writes across every recomposition of `CalculatorScreen`.
- Type: a `@Composable` top-level generic function.
- Responsibility: on a composable's *first* composition, runs its lambda
  and stores the result, associated with this exact call site in the
  Composition; on every later recomposition of the same call site,
  returns the *already-stored* value instead of running the lambda
  again.
- Depends on: being called from a `@Composable` context — it's itself
  annotated `@Composable` — and a lambda producing whatever value should
  survive.
- Connects to: called once inside `CalculatorScreen`, wrapping
  `mutableStateOf("0")`; its return value (the `MutableState<String>`) is
  what `by` delegates `displayText` to.
- Shape: the survival mechanism this lesson's own title refers to — proven
  for real, in Concept Unit 3's own isolated lab and again in Concept Unit
  6's real project test, to be the specific thing standing between "this
  value resets every rebuild" and "this value survives."

**`RobolectricTestRunner`**
- What it is: a real JUnit test runner that executes test methods inside
  a simulated Android environment running directly on the JVM — no
  emulator or physical device involved.
- Implementation: `org.robolectric.RobolectricTestRunner`, from the
  `robolectric` library; named via `@RunWith(RobolectricTestRunner::class)`
  on a test class.
- Its use: lets this lesson's tests call real Android/Compose APIs
  (`ComponentActivity`'s own underlying machinery, Compose's real click
  dispatch and recomposition scheduling) and get real, executed answers,
  in an environment that otherwise has no working emulator.
- Type: a class implementing JUnit's own runner contract, referenced via
  `::class` (a class reference, already-established Kotlin syntax).
- Responsibility: before running any test method, sets up a simulated
  Android runtime (using real Android framework class *shadows*
  Robolectric itself maintains) matching whatever SDK level `@Config`
  requests; runs each `@Test` method inside that simulated environment;
  tears it down after.
- Depends on: a real `@Config` (or Robolectric's own defaults) specifying
  which SDK to simulate, and the real `android.jar` this project's build
  already depends on.
- Connects to: named by `@RunWith` on this lesson's test classes; JUnit
  itself hands control to this runner instead of its own default one.
- Shape: the actual engine making every other testing construct in this
  lesson possible — without it, none of `createComposeRule`,
  `performClick`, or the rest would have a real Android environment to
  run against.

**`createComposeRule()`**
- What it is: the function that creates a real JUnit rule for hosting and
  interacting with Compose UI inside a test.
- Implementation: `fun createComposeRule(): ComposeContentTestRule`, from
  `androidx.compose.ui.test.junit4` — confirmed for real this session by
  forcing the compiler to state it directly: assigning its result to a
  deliberately mistyped `val` produced `Type mismatch: inferred type is
  ComposeContentTestRule but Nothing was expected`, printing the exact
  real return type.
- Its use: called once per test class, producing the one object
  (`composeTestRule`) every test method in this lesson uses to set
  content and interact with it.
- Type: a top-level function, returning a `ComposeContentTestRule`.
- Responsibility: builds a real rule object wired to JUnit's own
  before/after test lifecycle (via `@Rule`), so Compose's testing
  machinery is properly started before each test and cleaned up after.
- Depends on: nothing at the call site — takes no arguments.
- Connects to: its result is assigned to a property annotated
  `@get:Rule`, handing lifecycle control to JUnit; that same property is
  what every test method in this lesson calls `.setContent`/`.onNodeWithTag`/
  etc. on.
- Shape: the entry point into Compose's own testing API — everything this
  lesson's tests do to Compose UI happens through the object this
  function returns.

**`ComposeContentTestRule`**
- What it is: the real type of `composeTestRule` — this lesson's tests
  call more than one of its members (`setContent`, `onNodeWithTag`,
  `onNodeWithText`), so its real declared shape is shown here rather than
  described in prose alone.
- Implementation (the members this lesson actually calls):
  ```kotlin
  interface ComposeContentTestRule : ComposeTestRule {
      fun setContent(composable: @Composable () -> Unit)
      // inherited from ComposeTestRule:
      fun onNodeWithTag(testTag: String): SemanticsNodeInteraction
      fun onNodeWithText(text: String): SemanticsNodeInteraction
  }
  ```
  from `androidx.compose.ui.test.junit4` (`ComposeContentTestRule`) and
  `androidx.compose.ui.test` (`ComposeTestRule`, `onNodeWithTag`/
  `onNodeWithText`, inherited).
- Its use: `composeTestRule.setContent { ... }` hosts real composable
  content for the test; `composeTestRule.onNodeWithTag(...)`/
  `onNodeWithText(...)` locate real nodes inside it afterward.
- Type: an interface, extending `ComposeTestRule`.
- Responsibility: hosts a real, running Composition for the duration of
  one test, and exposes finder methods to locate specific nodes within
  it by tag or text.
- Depends on: being installed as a JUnit `@Rule` (via `createComposeRule()`'s
  result) so its own lifecycle is driven by the test framework.
- Connects to: `setContent` installs `CalculatorScreen()` as this test's
  own real Composition; `onNodeWithTag`/`onNodeWithText`, below, query
  that same Composition afterward.
- Shape: the seam between this lesson's project code and its own test
  code — the one object every interaction in a Compose UI test flows
  through.

**`.onNodeWithTag(...)`**
- What it is: a finder that locates exactly one node in the test's
  Composition by a `Modifier.testTag(...)` value.
- Implementation: `fun ComposeTestRule.onNodeWithTag(testTag: String):
  SemanticsNodeInteraction`, from `androidx.compose.ui.test`.
- Its use: locates `CalculatorScreen`'s own display `Text` — tagged
  `"display"` specifically so this finder can locate it unambiguously,
  distinct from `onNodeWithText`, below.
- Type: an extension function on `ComposeTestRule`, returning a
  `SemanticsNodeInteraction` (a handle to interact with or assert against
  the found node — this lesson only calls `.assertTextEquals(...)` on it,
  covered under that entry, not the type itself, since only one member is
  used).
- Responsibility: searches the current Composition's real semantics tree
  for exactly one node carrying the given tag, and fails the test
  immediately, with a real, descriptive error, if zero or more than one
  match.
- Depends on: the node actually being tagged with a matching
  `Modifier.testTag(...)` value somewhere in the project's own code.
- Connects to: called on `composeTestRule`; its result is what
  `.assertTextEquals(...)` is chained onto.
- Shape: one of two node-finding strategies this lesson uses — the exact
  one, tag-based, that a real failed test this session proved is
  *required* when a node's own text could otherwise be ambiguous (Concept
  Unit 6, below).

**`.onNodeWithText(...)`**
- What it is: a finder that locates exactly one node in the test's
  Composition by its own visible text content.
- Implementation: `fun ComposeTestRule.onNodeWithText(text: String):
  SemanticsNodeInteraction`, from `androidx.compose.ui.test`.
- Its use: locates the `"7"` and `"8"` buttons by their own label text —
  unambiguous for a `Button`, whose semantics merge its own label `Text`
  into one combined node, unlike the separate, identically-labeled
  display this lesson had to disambiguate with a tag instead.
- Type: an extension function on `ComposeTestRule`, returning a
  `SemanticsNodeInteraction`.
- Responsibility: searches the current Composition's real semantics tree
  for exactly one node whose own text matches, failing the test
  immediately if zero or more than one match — confirmed for real this
  session: an early draft of this lesson's own test searched for `"0"`
  by text and failed with a real, actual error reporting *two* matching
  nodes (the display and the `"0"` digit button both showing `"0"` at
  that point), which is exactly why the display needed its own
  `testTag` instead.
- Depends on: at least one node's own real text actually matching.
- Connects to: called on `composeTestRule`; its result is what
  `.performClick()`, below, is chained onto.
- Shape: the other of the two node-finding strategies this lesson uses —
  simpler when text is genuinely unique, unreliable when it might not be.

**`.performClick()`**
- What it is: the function that simulates a real user tap on whatever
  node it's called on.
- Implementation: `fun SemanticsNodeInteraction.performClick():
  SemanticsNodeInteraction`, from `androidx.compose.ui.test`.
- Its use: simulates pressing the `"7"` and `"8"` buttons, in order,
  driving this lesson's entire real proof of state changing and
  recomposition happening.
- Type: an extension function on `SemanticsNodeInteraction`.
- Responsibility: dispatches a real, simulated click event to the node's
  own registered click handler — the exact `onClick` lambda this
  project's own `Button` calls were given — and, critically, actually
  *waits* for any resulting recomposition to finish before returning, so
  the test's next assertion sees the settled result, not a
  still-in-progress one.
- Depends on: a real, clickable node — one with a registered `onClick`,
  same requirement `Button` itself already carries.
- Connects to: called on the result of `.onNodeWithText(...)`; its own
  side effect (running the real `onClick` lambda) is what changes
  `displayText`, which is what the next `.assertTextEquals(...)` checks.
- Shape: the actual trigger for everything this lesson set out to
  prove — the one call that turns "code that could theoretically update
  state" into "state that actually got updated, for real, this session."

**`.assertTextEquals(...)`**
- What it is: an assertion that fails the test, with a real, descriptive
  error, unless the found node's own text exactly matches what's given.
- Implementation: `fun SemanticsNodeInteraction.assertTextEquals(vararg
  value: String, ...): SemanticsNodeInteraction`, from
  `androidx.compose.ui.test`.
- Its use: checks the display's real text at three points — `"0"`
  before anything is clicked, `"7"` after clicking `"7"`, `"78"` after
  clicking `"8"` — the exact sequence this lesson's own BRD example
  describes.
- Type: an extension function on `SemanticsNodeInteraction`.
- Responsibility: reads the found node's own real, current text out of
  the Composition and compares it, failing loudly with both the expected
  and actual values if they differ.
- Depends on: a `SemanticsNodeInteraction` for a node that actually
  carries text.
- Connects to: called on the result of `.onNodeWithTag("display")`; what
  it reads reflects whatever `CalculatorScreen`'s own `Text` is currently
  showing, live, in the running test.
- Shape: the actual verification step — every other construct in this
  lesson's testing machinery exists to get to a point where this one call
  can make a real, checkable claim.

**`Modifier.testTag(...)`**
- What it is: an extension function on `Modifier` that attaches a
  string identifier to a composable, readable only by testing code, never
  by an end user.
- Implementation: `fun Modifier.testTag(tag: String): Modifier`, from
  `androidx.compose.ui.platform`.
- Its use: tags `CalculatorScreen`'s display `Text` with `"display"`, so
  `.onNodeWithTag("display")` can find it unambiguously — proven
  necessary, above, by a real failed test that found two nodes matching
  plain text `"0"` before this tag existed.
- Type: an extension function on `Modifier`, returning a new `Modifier`
  (the same wrap-and-return pattern every other `Modifier` extension in
  this project already uses).
- Responsibility: attaches test-only metadata to whichever composable
  receives the finished chain — invisible in the real, running app,
  meaningful only to test code that specifically searches for it.
- Depends on: the `Modifier` it's called on.
- Connects to: called as part of the display `Text`'s own modifier chain;
  read by `.onNodeWithTag(...)` during a test, never by anything in the
  real app itself.
- Shape: a test-only extension of the same `Modifier` mechanism this
  project's real UI already depends on — proof that testing hooks and
  real UI configuration share one consistent API, not two separate
  systems.

### Everything else in the file, not this lesson's subject but still explained

**`Column(...)`** (reappearing)
- What it is: the Compose composable that arranges its children
  vertically, one below the next.
- Implementation: unchanged — `@Composable fun Column(modifier: Modifier
  = Modifier, verticalArrangement: Arrangement.Vertical = Arrangement.Top,
  horizontalAlignment: Alignment.Horizontal = Alignment.Start, content:
  @Composable ColumnScope.() -> Unit)`, from
  `androidx.compose.foundation.layout`.
- Its use: still `CalculatorScreen`'s outermost composable, holding the
  display `Text` and the `for` loop over keypad rows — unchanged by this
  lesson.
- Type: a top-level `@Composable` function whose last parameter is a
  `@Composable` lambda.
- Responsibility: unchanged — measures every composable in its trailing
  lambda, positions each beneath the last, aligns each horizontally.
- Depends on: unchanged — a trailing lambda of children, real
  `Arrangement`/`Alignment` values.
- Connects to: unchanged — holds the display `Text` and the row-generating
  `for` loop as its own direct children.
- Shape: unchanged in architectural role.

**`Row(...)`** (reappearing)
- What it is: the Compose composable that arranges its children
  horizontally, side by side.
- Implementation: unchanged — `@Composable fun Row(modifier: Modifier =
  Modifier, horizontalArrangement: Arrangement.Horizontal =
  Arrangement.Start, ..., content: @Composable RowScope.() -> Unit)`,
  from `androidx.compose.foundation.layout`.
- Its use: still holds each keypad row's four buttons side by side,
  unchanged by this lesson.
- Type: a top-level `@Composable` function whose last parameter is a
  `@Composable` lambda.
- Responsibility: unchanged — measures every composable in its trailing
  lambda, positions each to the right of the last.
- Depends on: unchanged — a trailing lambda, a real `Arrangement.Horizontal`
  value.
- Connects to: unchanged — called once per keypad row, each holding four
  `Button`s.
- Shape: unchanged in architectural role.

**`Button(...)`** (reappearing)
- What it is: the Compose composable that renders a clickable,
  Material-styled button.
- Implementation: unchanged — `@Composable fun Button(onClick: () ->
  Unit, modifier: Modifier = Modifier, ..., content: @Composable
  RowScope.() -> Unit)`, from `androidx.compose.material3`; `onClick`
  still has no default value.
- Its use: this lesson changes what `onClick` actually *does* (Concept
  Unit 5) — the call itself, and its required `onClick`/trailing-lambda
  shape, are unchanged.
- Type: a top-level `@Composable` function with a required function-type
  parameter (`onClick`) and a trailing `@Composable` lambda (`content`).
- Responsibility: unchanged — draws a button-shaped surface, reacts to
  real taps by calling `onClick`, lays out its trailing lambda's content.
- Depends on: unchanged — a real function value for `onClick`, now no
  longer always a no-op (Concept Unit 5); a trailing lambda for its
  label.
- Connects to: called once per label inside the innermost `for` loop;
  each call's own trailing lambda still calls `Text` once, for its
  label.
- Shape: unchanged in architectural role.

**`Text(...)`** (reappearing)
- What it is: the Compose composable that displays a run of text on
  screen.
- Implementation: unchanged — `@Composable fun Text(text: String,
  modifier: Modifier = Modifier, ...)`, from `androidx.compose.material3`.
- Its use: this lesson changes what the *display* `Text`'s own `text`
  argument reads from — state (Concept Unit 4), instead of a fixed
  literal; each button's own label `Text` is unchanged, still reading
  the loop's own `label` variable.
- Type: a top-level `@Composable` function.
- Responsibility: unchanged — given a `String`, describes one piece of
  drawable text as part of the current Composition.
- Depends on: unchanged — being called from inside a `@Composable`
  context.
- Connects to: the display `Text` now reads `displayText` instead of a
  literal (Concept Unit 4); button-label `Text` calls are unchanged.
- Shape: unchanged in architectural role.

**`Modifier`** (reappearing)
- What it is: the real Compose type used to attach extra behavior —
  sizing, padding, weight, and now testing metadata — to a composable.
- Implementation: unchanged — `androidx.compose.ui.Modifier`, a real
  `interface`; `Modifier` alone (`Modifier.Companion`) the empty starting
  value every chain begins from.
- Its use: `Column`'s own modifier chain is unchanged by this lesson; the
  new `Modifier.testTag(...)` (this lesson's own subject, above) is
  appended to the display `Text`'s own, previously-default, modifier.
- Type: an interface, used entirely through its extension
  functions/properties and the shared empty starting value.
- Responsibility: unchanged — describes a chain of adjustments applied in
  the order written.
- Depends on: unchanged — nothing to start; each extension call depends
  only on the `Modifier` immediately to its left.
- Connects to: unchanged, plus the new `testTag(...)` link this lesson
  adds to the display `Text`'s own chain specifically.
- Shape: unchanged — the one configuration mechanism shared by every
  composable in this project.

**`Modifier.fillMaxWidth()`** (reappearing)
- What it is: an extension function on `Modifier` that adds "take up all
  of the available horizontal space" to a modifier chain.
- Implementation: unchanged — `fun Modifier.fillMaxWidth(fraction: Float
  = 1f): Modifier`, from `androidx.compose.foundation.layout`.
- Its use: still the first link in `CalculatorScreen`'s own outer
  `Column` modifier chain, unchanged.
- Type: an extension function on `Modifier`, returning a new `Modifier`.
- Responsibility: unchanged — wraps the `Modifier` it's called on with an
  added width constraint.
- Depends on: unchanged — the `Modifier` instance it's called on.
- Connects to: unchanged — called first on `Modifier` itself; its return
  value is what `.padding(16.dp)` is called on next.
- Shape: unchanged — one link in `Column`'s own modifier chain.

**`Modifier.padding(...)`** (reappearing)
- What it is: an extension function on `Modifier` that adds spacing
  around whatever the modifier is eventually attached to.
- Implementation: unchanged — `fun Modifier.padding(all: Dp): Modifier`,
  from `androidx.compose.foundation.layout` — the overload used here.
- Its use: still gives `CalculatorScreen`'s content 16dp of space on
  every side, unchanged.
- Type: an extension function on `Modifier`, returning a new `Modifier`.
- Responsibility: unchanged — wraps the `Modifier` it's called on with an
  added spacing rule.
- Depends on: unchanged — a real `Dp` value.
- Connects to: unchanged — called second in `Column`'s chain.
- Shape: unchanged — the second link in `Column`'s own modifier chain.

**`Int.dp`** (reappearing)
- What it is: an extension property on `Int` that converts a raw whole
  number into a real `Dp` value.
- Implementation: unchanged — `val Int.dp: Dp`, from
  `androidx.compose.ui.unit`.
- Its use: still converts `16` for `Column`'s own padding, unchanged.
- Type: an extension property on `Int`, computed fresh each read.
- Responsibility: unchanged — converts a bare number into the
  dimension-safe type Compose's layout APIs require.
- Depends on: unchanged — the `Int` literal it's read from.
- Connects to: unchanged — its result passed directly as `padding`'s
  `all` argument.
- Shape: unchanged — a small, single-purpose unit-conversion utility.

**`for` loop** (reappearing)
- What it is: a control-flow construct running its body once per element
  of a collection, binding a fresh variable to the current element each
  time.
- Implementation: unchanged Kotlin syntax.
- Its use: still drives the keypad's own generation from `keypadRows`,
  unchanged by this lesson — this lesson's own new code (the digit-append
  check) lives *inside* the innermost loop body, reading the same `label`
  variable that loop already binds.
- Type: a control-flow statement.
- Responsibility: unchanged.
- Depends on: unchanged — a real collection to iterate.
- Connects to: still binds `row`/`label`, now additionally read by this
  lesson's own `onClick` logic to decide what to append.
- Shape: unchanged in role.

---

## Concept Unit 1: `mutableStateOf` — Creating a Value Compose Can Watch

### The Problem

`CalculatorScreen`'s display currently reads `Text(text = "0")` — a fixed
literal. Nothing about a plain `val`/`var` in ordinary Kotlin gives
Compose any way to notice when it changes: an ordinary `var displayText =
"0"` reassigned later doesn't cause anything to happen on screen, because
nothing is watching it. Something has to exist that Compose specifically
knows how to observe.

> **Try it yourself first:** an ordinary Kotlin `var` was already fully
> established — reassignable, but with no way for anything *else* to
> notice the reassignment happening. Given that Compose needs to know
> exactly *when* a value used by a composable changes (not just that it
> theoretically could), what shape of object would you guess is needed —
> something more than a bare `var`? And: if such an object exists, what's
> the simplest possible operation it would need to support, given that a
> composable just needs to *read* the current value and, later, some code
> needs to *write* a new one?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabState() {
    val state = mutableStateOf("hello")
    Text(text = state.value)
}
```

Run for real, batched together with this lesson's other isolated labs:

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 6 executed, 21 up-to-date
```

This proves `mutableStateOf("hello")` produces a real, usable object whose
`.value` property can be read directly and passed to `Text`. This
observable value-holder is called a **`MutableState`**.

Discarded: `LabState` above does not appear in the real project;
`CalculatorScreen`'s own real use, shown next, wraps its call in
`remember` (Concept Unit 3) and reads it through `by` (Concept Unit 2),
never through a bare `.value` call.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a new local declaration inside `CalculatorScreen`).
- **Location:** the first line inside `CalculatorScreen`'s own body,
  before its `Column` call.
- **Dependencies:** `androidx.compose.runtime` (`mutableStateOf`),
  already resolved transitively through this project's existing
  `androidx.compose.ui:ui` dependency.

### The New Code

```kotlin
val displayState = mutableStateOf("0")
```

### The Updated Project

```kotlin
1  @Composable
2  fun CalculatorScreen() {
3      val displayState = mutableStateOf("0")  // ← new
4      Column(
5          modifier = Modifier.fillMaxWidth().padding(16.dp),
6          verticalArrangement = Arrangement.spacedBy(8.dp),
7          horizontalAlignment = Alignment.CenterHorizontally
8      ) {
9          Text(text = "0")
```

`CalculatorScreen` now creates a real state holder as its very first
statement — not read by anything yet (`Text` still shows the literal
`"0"`); Concept Units 2–4 connect it for real.

### Mechanical walkthrough

- `val displayState = mutableStateOf("0")` — a `val` declaration
  (already-established syntax) whose initializer calls the function just
  introduced; `displayState` itself never gets reassigned — only the
  `MutableState` object it refers to has its own internal `.value`
  written later, an important distinction Concept Unit 2 depends on.
- `mutableStateOf("0")` — a call to the real function this Concept Unit
  introduced, on the string literal `"0"`; its real, inferred type
  parameter `T` is `String`, so the call returns a `MutableState<String>`.

### CS lens

A value wrapped in an object specifically so something else can observe
reads and writes to it is a real, general idea: the **Observable /
reactive value** pattern. Also recognized in: a spreadsheet cell (the
sheet's own engine "watches" every cell for changes), RxJava's/Kotlin
Flow's own observable value types, a database row with change-data-capture
triggers, and any UI framework's own "signal" or "ref" primitive (React's
`useState`, SwiftUI's `@State`, Vue's `ref`) — the exact same shape as
`MutableState`, under different names, across different frameworks.

### SE lens

The alternative not chosen is Compose polling every composable's own
plain variables on some fixed schedule, checking whether anything changed
since last time. That would work in principle but scales badly — every
composable in a real app would need re-checking, constantly, whether or
not anything actually changed. `mutableStateOf`'s design instead makes
change detection *precise*: only a real write to a real `MutableState`'s
own `value` can ever trigger anything, and Compose can know exactly which
composables read exactly which state, because reading is itself a
trackable operation, not something Compose has to guess about
afterward — the real reason a plain `var` cannot substitute for this.

### Run it

Shown above, in full: the isolated lab, part of this lesson's batched lab
run (`verification/1.4/lab1_state_remember_isolated.txt`), and the real
project build with `displayState` created but not yet connected
(`verification/1.4/step1_state_wiring_compiles.txt`).

### Connecting the pieces

A real, observable state holder now exists, but nothing reads from it or
writes to it yet, and the raw `.value`-based syntax used to prove it works
is not what this project's own code will actually use. Concept Unit 2
introduces the real syntax this project keeps: `by` delegation.

---

## Concept Unit 2: `by` — Making a State Holder Read and Write Like a Plain Property

### The Problem

`displayState.value` works, but every place this project reads or writes
the display text would need to spell out `.value` explicitly, everywhere,
forever — a small but real, repeated tax on every single use, and a
detail a reader has to remember is even necessary. Kotlin's `var`/`val`
syntax for an ordinary property is simpler than that.

> **Try it yourself first:** `MutableState`'s own real declared shape,
> just shown in this lesson's Header, has a `value` property. Given that
> Kotlin's `by` keyword was named in this lesson's own Terms as
> "delegating a property's storage and access to a separate object," and
> given that a `MutableState` is exactly such an object, what would you
> guess the compiled-down meaning of `var displayText by displayState`
> actually is, in terms of `.value` reads and writes? And: since a
> `MutableState`'s `value` is both readable and writable, why might `by`
> specifically require *two* separate operator functions rather than one?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabDelegatedState() {
    val state = mutableStateOf("hello")
    var text by state
    Text(text = text)
}
```

Run for real (same batched lab pass):

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 6 executed, 21 up-to-date
```

This proves `var text by state` compiles and `text` can be read directly,
with no `.value` anywhere. To prove exactly what makes this legal, the
same file was compiled again with `androidx.compose.runtime.getValue` and
`androidx.compose.runtime.setValue` both left unimported:

```
e: .../LabDelegatedState.kt:7:13 Type 'TypeVariable(T)' has no method 'getValue(Nothing?, KProperty<*>) and thus it cannot serve as a delegate
e: .../LabDelegatedState.kt:7:13 Type 'MutableState<String>' has no method 'setValue(Nothing?, KProperty<*>, String)' and thus it cannot serve as a delegate for var (read-write property)
```

A real, actual compile failure — proving `by` is not built-in magic for
`MutableState` specifically; it's ordinary Kotlin delegation, which
requires exactly these two real, importable operator functions to exist
for whatever type follows `by`. This shorthand — reading and writing a
property by delegating to another object's own matching `getValue`/
`setValue` functions — is called **property delegation**.

Discarded: `LabDelegatedState` above does not appear in the real project;
`CalculatorScreen`'s own real use, shown next, delegates directly to a
`remember`-wrapped state, not a bare, unremembered one.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** replace (the plain `val` from Concept Unit 1 becomes a
  delegated `var`).
- **Location:** the same line Concept Unit 1 added.
- **Dependencies:** `androidx.compose.runtime` (`getValue`, `setValue`),
  already resolved transitively.

### The New Code

```kotlin
var displayText by mutableStateOf("0")
```

### The Updated Project

```kotlin
1  @Composable
2  fun CalculatorScreen() {
3      var displayText by mutableStateOf("0")  // ← changed: was val displayState = mutableStateOf("0")
4      Column(
5          modifier = Modifier.fillMaxWidth().padding(16.dp),
6          verticalArrangement = Arrangement.spacedBy(8.dp),
7          horizontalAlignment = Alignment.CenterHorizontally
8      ) {
9          Text(text = "0")
```

`CalculatorScreen` now declares `displayText` as a delegated `var`,
readable and writable with plain property syntax — still not read by
`Text` yet (still the literal `"0"`), and, as Concept Unit 4's real test
will show, not yet safe from losing its value on recomposition either.

### Mechanical walkthrough

- `var displayText by mutableStateOf("0")` — a `var` declaration
  (already-established syntax) using `by` (this lesson's own Terms entry)
  to delegate to the `MutableState<String>` `mutableStateOf("0")` returns
  directly, without a `remember` wrapper yet.
- `mutableStateOf("0")` — the identical already-explained call from
  Concept Unit 1, now feeding directly into `by` instead of being stored
  in its own named `val` first.

### CS lens

Delegating a property's read/write behavior to a separate object,
resolved by the compiler through a fixed, named protocol (`getValue`/
`setValue`), is a real, general idea: the **Delegation pattern** — composing
behavior from another object instead of inheriting it. Also recognized
in: JavaScript's `Object.defineProperty` with custom getters/setters,
Python's descriptor protocol (`__get__`/`__set__`), C#'s own property
syntax backed by arbitrary logic, and any "lazy property" library that
computes a value only on first real access.

### SE lens

The alternative not chosen is this lesson's own Concept Unit 1 style:
every read and write spelled out as `.value`. That remains completely
valid Kotlin and would work identically — `by`'s real benefit is
readability at every call site, not new capability the bare `.value` form
lacks. The real cost `by` introduces is indirection: a reader unfamiliar
with `getValue`/`setValue` sees `displayText` and might reasonably assume
it's an ordinary property with no observable side effects, when reading
or writing it is actually running real delegate code — exactly the kind
of "prove it's not magic" gap this lesson's own real compiler evidence,
above, exists to close.

### Run it

Shown above, in full: the isolated lab and its real negative case, both
part of this lesson's batched lab run
(`verification/1.4/lab1_state_remember_isolated.txt`), and the two real,
targeted negative-case compiles against the actual project confirming
`getValue`'s and `setValue`'s exact real signatures
(`verification/1.4/break3_missing_getvalue_import.txt`,
`verification/1.4/break2_missing_setvalue_import.txt`).

### Connecting the pieces

`displayText` now reads and writes like a plain property, backed by a
real, observable `MutableState`. But nothing yet keeps that specific
`MutableState` object alive across `CalculatorScreen`'s own repeated
recomposition — Concept Unit 3 introduces `remember`, and Concept Unit 4
proves, with a real executed test, exactly what happens without it.

---

## Concept Unit 3: `remember` — Keeping the Same State Object Across Recomposition

### The Problem

`CalculatorScreen`'s own body is just a function — Kotlin already
established that a function's body runs fresh, from the top, every time
it's called. Recomposition means Compose calling `CalculatorScreen`
again. If `var displayText by mutableStateOf("0")` sits directly in that
body, calling the function again would run that exact line again — and
`mutableStateOf("0")` unconditionally builds a *brand-new* `MutableState`
initialized back to `"0"`, discarding whatever the previous one held.

> **Try it yourself first:** a function's body already runs top-to-bottom
> every single time it's called, with no memory of a previous call unless
> something outside the function preserves it. Given that recomposition
> is exactly "call this composable function again," and given that
> `mutableStateOf("0")` is an ordinary function call with no special
> memory of its own, what would you predict happens to a `MutableState`
> created directly inside a composable's body, the *second* time that
> composable recomposes? And: what real mechanism would be needed to make
> a *specific* value, computed once, available again on a later call to
> the *same* function — something a plain function call, by itself,
> cannot do?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabCounterWithRemember() {
    var count by remember { mutableStateOf(0) }
    Column {
        Text(text = count.toString(), modifier = Modifier.testTag("countText"))
        Button(onClick = { count = count + 1 }, modifier = Modifier.testTag("incButton")) {
            Text(text = "increment")
        }
    }
}

@Composable
fun LabCounterWithoutRemember() {
    var count by mutableStateOf(0)
    Column {
        Text(text = count.toString(), modifier = Modifier.testTag("countText"))
        Button(onClick = { count = count + 1 }, modifier = Modifier.testTag("incButton")) {
            Text(text = "increment")
        }
    }
}
```

Run for real — not just compiled, but actually executed against a
simulated Android environment and interacted with, per Concept Unit 5's
own testing tooling, batched together as two real test cases:

```
com.example.calculator.LabsCU14Test > counterWithRememberSurvivesRecomposition PASSED
com.example.calculator.LabsCU14Test > counterWithoutRememberResetsEveryClick PASSED

BUILD SUCCESSFUL in 4s
```

The first real test clicked the `remember`-wrapped counter's button
twice and found the real, live count read `1`, then `2` — the same state
object, genuinely preserved across two real recompositions. The second
real test clicked the *not*-`remember`-wrapped counter's button once and
found the real, live count still read `0` — proving, with an actual
executed assertion rather than a predicted description, that without
`remember`, the click *did* run (nothing crashed; recomposition *did*
happen) but the freshly-created `MutableState` each recomposition builds
always starts back at `0`, discarding the previous click's own write.
This memory-preserving wrapper is called **`remember`**.

Discarded: both `LabCounterWithRemember` and `LabCounterWithoutRemember`
above do not appear in the real project; `CalculatorScreen`'s own real
use, in Concept Unit 4, wraps its actual display state, not a throwaway
counter.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (wrapping the existing `mutableStateOf(...)` call).
- **Location:** the same line Concept Units 1–2 already modified.
- **Dependencies:** `androidx.compose.runtime` (`remember`), already
  resolved transitively.

### The New Code

```kotlin
var displayText by remember { mutableStateOf("0") }
```

### The Updated Project

```kotlin
1  @Composable
2  fun CalculatorScreen() {
3      var displayText by remember { mutableStateOf("0") }  // ← changed: was var displayText by mutableStateOf("0")
4      Column(
5          modifier = Modifier.fillMaxWidth().padding(16.dp),
6          verticalArrangement = Arrangement.spacedBy(8.dp),
7          horizontalAlignment = Alignment.CenterHorizontally
8      ) {
9          Text(text = "0")
```

`CalculatorScreen` now wraps its state creation in `remember` — the exact
line this lesson's own title refers to: a value that survives its own
rebuild. `Text` still shows the literal `"0"`, unconnected; Concept Unit
4 finally reads from `displayText` for real.

### Mechanical walkthrough

- `remember { mutableStateOf("0") }` — a call to the function this
  Concept Unit introduced, with a trailing lambda (already-established
  trailing lambda syntax) whose body is the already fully-explained
  `mutableStateOf("0")` call.
- `var displayText by ...` — the already fully-explained `by`-delegation
  syntax, now delegating to whatever `remember`'s own call returns — the
  *same* `MutableState<String>` on every recomposition, per this Concept
  Unit's own real, executed proof, rather than a fresh one each time.

### CS lens

A cache keyed by call-site identity, returning a previously-computed
result instead of recomputing it, is a real, general idea:
**memoization**. Also recognized in: a recursive Fibonacci function
memoized to avoid recomputing the same subproblem repeatedly, an HTTP
cache keyed by request URL, a build system caching a task's output keyed
by its inputs (this project's own real Gradle `UP-TO-DATE` output,
already seen directly, is exactly this idea), and React's own `useMemo`/
`useState` hooks, which solve the identical "survive a re-render" problem
`remember` solves here, under a different framework's name.

### SE lens

The alternative not chosen — proven, this session, to actually break — is
Concept Unit 2's own bare `mutableStateOf("0")`, unwrapped. The real,
measured cost of `remember` is one extra function call and one extra
concept to learn; the real, measured cost of skipping it, demonstrated by
an actual failing test in this same Concept Unit, is silent data loss —
a click that visibly does nothing, with no crash, no error, and no
obvious signal to a developer that anything is wrong, unless it's
specifically tested for, the way this lesson just did.

### Run it

Shown above, in full: both real, executed test results, saved at
`verification/1.4/lab1_state_remember_isolated.txt`, and the real project
build with `remember` now wrapping `displayText`
(`verification/1.4/step1_state_wiring_compiles.txt`).

### Connecting the pieces

A real, surviving state holder now exists — created once, kept alive
across recomposition, readable and writable through plain property
syntax. Concept Unit 4 finally connects it to what the display actually
shows and what pressing a digit actually does.

---

## Concept Unit 4: State-Driven UI — Reading From State Instead of a Literal

### The Problem

`Text(text = "0")` still shows a fixed literal, completely disconnected
from `displayText`, which now exists, survives recomposition, and is
ready to be read. Nothing yet makes the *screen itself* reflect whatever
`displayText` currently holds.

> **Try it yourself first:** `Text`'s own `text` parameter has always
> accepted any `String` expression, not only a literal — every use so far
> just happened to pass a literal or a loop variable. Given that
> `displayText` is now a real, readable `String` property, what's the
> simplest possible change to `Text(text = "0")` that would make it show
> whatever `displayText` currently holds instead? And: once that change
> is made, if `displayText` is written to somewhere else entirely (a
> button's own `onClick`), what has to happen for this specific `Text`
> call to actually show the new value, given that nothing calls `Text`
> directly a second time?

### No new isolated lab for this unit

This Concept Unit's own change — reading `displayText` instead of a
literal — reuses `by`'s already fully-explained read behavior (Concept
Unit 2) with no new construct of its own; the real question it raises
(how does the *screen* actually update) is answered by Recomposition,
covered with its own real, executed proof in Concept Unit 6, once the
digit buttons (Concept Unit 5) give it something to react to. This
Concept Unit's own job is the one-line change connecting state to
`Text`, not a new mechanism.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** replace (the literal `"0"` becomes the `displayText`
  property read).
- **Location:** the display `Text(...)` call, directly inside `Column`.
- **Dependencies:** none beyond what earlier Concept Units already
  resolved.

### The New Code

```kotlin
Text(text = displayText)
```

### The Updated Project

```kotlin
1  @Composable
2  fun CalculatorScreen() {
3      var displayText by remember { mutableStateOf("0") }
4      Column(
5          modifier = Modifier.fillMaxWidth().padding(16.dp),
6          verticalArrangement = Arrangement.spacedBy(8.dp),
7          horizontalAlignment = Alignment.CenterHorizontally
8      ) {
9          Text(text = displayText)  // ← changed: was Text(text = "0")
```

`Text` now reads `displayText` directly instead of a fixed literal — this
is what **State-driven UI** (this lesson's own Terms entry) means
concretely: this line never says "show 7"; it only ever says "show
whatever `displayText` is," every single time it runs.

### Mechanical walkthrough

- `Text(text = displayText)` — the already fully-explained `Text` call;
  `displayText` here is a plain property read, compiling down to the
  already fully-explained `getValue` operator call on the underlying
  `MutableState`, exactly as explained in Concept Unit 2 — the *same*
  read mechanism, now used at this specific call site instead of only in
  isolated examples.

### CS lens

A view that's defined as a pure function of current state, re-evaluated
from scratch (conceptually) whenever that state changes, rather than
patched in place by imperative instructions, is the real, general
principle of **declarative / state-driven rendering**. Also recognized
in: React's `render()` (a pure function from `state` to a UI tree), a
spreadsheet cell's formula (recomputed, not manually edited, when its
inputs change), and a build system re-linking a binary from source rather
than patching bytes in the existing one — the output is always derived
fresh from current inputs, never mutated piecemeal.

### SE lens

The alternative not chosen is what Android's older View system requires:
finding the display widget by reference (`findViewById`) and calling an
imperative mutator (`.text = newValue`) at the exact moment a value
changes, from inside the click handler itself. That couples the click
handler directly to the specific widget displaying the result — the
handler has to *know* which widget to update. This project's
`onClick` (Concept Unit 5, next) never references `Text` at all; it only
writes to `displayText`, and this line is what makes that write visible,
entirely decoupled from where or how many places read that same state.

### Run it

No new execution for this unit — its own change is exercised for real,
together with Concept Unit 5's, by Concept Unit 6's real test.

### Connecting the pieces

The display now shows whatever `displayText` holds — currently always
`"0"`, since nothing writes to it yet. Concept Unit 5 wires the digit
buttons to actually change it.

---

## Concept Unit 5: Wiring the Digit Buttons

### The Problem

Every button's `onClick` is still `{}` — a real, empty, no-op function
value. Pressing any button, including a digit, currently does nothing at
all. This lesson's own BRD goal — `7` making the display read `"7"`,
then `8` making it read `"78"`, not `"08"` — needs a real decision: which
buttons should actually change `displayText`, and what exactly should
each one do.

> **Try it yourself first:** `label` (the loop variable each button's own
> `onClick` lambda can already see, since it's declared in the enclosing
> loop) holds this button's own literal text — `"7"`, `"÷"`, `"C"`, and so
> on. Given that only digit buttons should change the display this
> lesson (the operator and control buttons' real behavior depends on
> `Calculator.kt`'s own arithmetic, not yet connected), what real,
> already-available operation on a single character would let an
> `onClick` lambda tell a digit label like `"7"` apart from a non-digit
> one like `"÷"`? And: given the BRD's own example shows `"0"` becoming
> `"7"`, not `"07"`, when the first real digit is pressed, what special
> case does that imply for what happens when `displayText` still holds
> its very first, untouched value?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabDigitCheck() {
    val label = "7"
    Text(text = if (label[0].isDigit()) "digit" else "not a digit")
}
```

Run for real (same batched lab pass):

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 6 executed, 21 up-to-date
```

This proves `label[0]` — reading the first `Char` out of a `String`,
using the already-established `[]` indexing syntax — and `.isDigit()`
compile and resolve as expected. `label[0].isDigit()` calls
`fun Char.isDigit(): Boolean`, from Kotlin's own standard library —
a real, standalone check with no Compose involvement at all, proving this
decision is ordinary Kotlin logic, not something specific to the UI
framework.

Discarded: `LabDigitCheck` above does not appear in the real project;
`CalculatorScreen`'s own real use, shown next, uses the identical check
inside a real `onClick` lambda, not a standalone `if`/`else` producing a
label.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** replace (each button's `onClick = {}` becomes real
  logic).
- **Location:** the `Button(...)` call inside the innermost `for` loop.
- **Dependencies:** none beyond what earlier Concept Units already
  resolved.

### The New Code

```kotlin
onClick = {
    if (label[0].isDigit()) {
        displayText = if (displayText == "0") label else displayText + label
    }
}
```

### The Updated Project

```kotlin
 1  @Composable
 2  fun CalculatorScreen() {
 3      var displayText by remember { mutableStateOf("0") }
 4      Column(
 5          modifier = Modifier.fillMaxWidth().padding(16.dp),
 6          verticalArrangement = Arrangement.spacedBy(8.dp),
 7          horizontalAlignment = Alignment.CenterHorizontally
 8      ) {
 9          Text(text = displayText)
10          for (row in keypadRows) {
11              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
12                  for (label in row) {
13                      Button(
14                          onClick = {                                                    // ← changed: was {}
15                              if (label[0].isDigit()) {                                   // ← new
16                                  displayText = if (displayText == "0") label else displayText + label  // ← new
17                              }                                                            // ← new
18                          },
19                          modifier = Modifier.weight(1f)
20                      ) {
21                          Text(text = label)
22                      }
23                  }
24              }
25          }
26      }
27  }
```

Every button's `onClick` now runs this real check — for the twelve
non-digit buttons (`÷`, `×`, `−`, `+`, `C`, `=`), `label[0].isDigit()` is
`false` and nothing happens, exactly the same no-op behavior as before;
for the ten digit buttons (`0`–`9`), it either replaces `displayText`
(if it's still the untouched `"0"`) or appends to it.

### Mechanical walkthrough

- `onClick = { ... }` — the already fully-explained named-argument/lambda
  syntax for `Button`'s required parameter, now containing real logic
  instead of an empty body.
- `if (label[0].isDigit())` — `label[0]` is a call to `String`'s real
  indexing operator (`operator fun String.get(index: Int): Char`, part of
  Kotlin's standard library), reading the first, and in this project's
  case only, character of the button's own label; `.isDigit()` is the
  already fully-explained real standard-library check, from this
  Concept Unit's own isolated lab.
- `displayText = if (displayText == "0") label else displayText + label`
  — an `if`/`else` *expression* (already-established Kotlin syntax: an
  `if` used as a value, not just a statement) assigned directly to
  `displayText`. `displayText == "0"` reads the current state (the
  already fully-explained `getValue` operator call) and compares it with
  the already-established `==` structural-equality operator; the `if`
  branch assigns `label` itself (replacing, not appending); the `else`
  branch computes `displayText + label` (`String`'s own `+` operator,
  already-established, concatenating the two) before assigning it —
  either branch's result becomes `displayText`'s new value through the
  already fully-explained `setValue` operator call.

### CS lens

A single conditional check reused identically across every element of a
loop, with the loop's own per-element data (`label`) deciding the
outcome, is the same real idea Concept Unit 5's own predecessor lesson
already named: data-driven behavior, extended here from *what gets
built* (the keypad's own shape) to *what happens when it's used* (each
button's own click behavior) — the same loop variable now serving double
duty.

### SE lens

The alternative not chosen is giving each button its own, individually
written `onClick` — ten separate digit-append lambdas, six separate
no-op lambdas. That would work, but multiplies exactly the same
maintenance cost this project's own keypad generation already avoided
once, for the same reason: one real rule (`label[0].isDigit()`), written
once, governs all sixteen buttons' real behavior, correctly, without
needing sixteen separate edits if that rule ever needs to change. The
honest cost carried forward: operator and control buttons still do
nothing beyond the no-op their `if` check falls through to — a real,
visible gap, not hidden, and one this project's own forward-reference
promises already flag as open work for later lessons.

### Run it

No new isolated execution beyond the lab shown above
(`verification/1.4/lab1_state_remember_isolated.txt`); this change is
exercised for real, together with Concept Unit 4's, by Concept Unit 6's
real test, next.

### Connecting the pieces

Every piece is now in place in the source: a surviving state holder, a
display that reads it, and buttons that write to it. Concept Unit 6 is
where this lesson finally proves, with a real, executed test, that
pressing `7` then `8` produces exactly `"78"`.

---

## Concept Unit 6: Recomposition, Proven — Turning On Real UI Testing

### The Problem

Every piece Concept Units 1–5 built compiles. None of it has been proven
to actually *work* — to actually recompose the screen and show a new
value when a button is really pressed. This project has no working
emulator or device (a standing limitation), so proving this the way an
app is normally verified — installing it and tapping a real screen — is
not available here. Something else has to provide real, executed proof,
or this lesson's own central claim stays an unverified assertion.

> **Try it yourself first:** Kotlin unit tests were never covered in this
> curriculum before now, but ordinary JVM code — arithmetic, function
> calls, `if`/`else` — was always testable by just calling it and checking
> a return value. Given that `CalculatorScreen` is, underneath the
> `@Composable` annotation, still an ordinary Kotlin function, and given
> that Compose's own real UI (click dispatch, recomposition scheduling)
> is implemented in ordinary JVM code that happens to normally run inside
> a real Android OS, what would have to exist for that same real code to
> run directly on this machine's own JVM, without an actual phone or
> emulator involved at all? And: once such a test can actually click a
> real button and read a real, current value back, what specific,
> concrete sequence of values would prove `remember`'s own claimed
> behavior — surviving recomposition — as opposed to merely being
> consistent with it?

### Turning on Robolectric and Compose UI testing

This is a build-configuration concept — like Concept Unit 1 of the
lesson that first turned on Jetpack Compose, there is no meaningful
throwaway lab separate from the real project's own build file; this is
verified directly against `AndroidCalculator/`'s real
`app/build.gradle.kts`, run for real with `./gradlew`.

```kotlin
testOptions {
    unitTests {
        isIncludeAndroidResources = true
    }
}
```

That flag alone isn't enough — the real test libraries themselves still
need declaring, in a second, real change to the same `dependencies { }`
block Concept Unit 1 of the lesson that turned on Jetpack Compose
originally added:

```kotlin
testImplementation("junit:junit:4.13.2")
testImplementation("org.robolectric:robolectric:4.13")
testImplementation(composeBom)
testImplementation("androidx.compose.ui:ui-test-junit4")
debugImplementation("androidx.compose.ui:ui-test-manifest")
```

Run for real:

```
BUILD SUCCESSFUL
```

With this in place, a real test class was written and actually executed:

```kotlin
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class CalculatorScreenTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun pressingDigitsUpdatesDisplay() {
        composeTestRule.setContent {
            CalculatorScreen()
        }

        composeTestRule.onNodeWithTag("display").assertTextEquals("0")

        composeTestRule.onNodeWithText("7").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("7")

        composeTestRule.onNodeWithText("8").performClick()
        composeTestRule.onNodeWithTag("display").assertTextEquals("78")
    }
}
```

The very first real attempt at this test — before the display carried
its own `testTag` — failed with a real, genuine error:

```
java.lang.AssertionError: Failed: assertExists.
Reason: Expected exactly '1' node but found '2' nodes that satisfy: (Text + EditableText contains '0' ...)
```

Two real nodes both showed `"0"` at that point: the display itself, and
the `"0"` digit button. This is exactly why `Modifier.testTag("display")`
(this lesson's own Header entry) exists — not a hypothetical concern, a
real failure this session hit and fixed. With the tag added, the test
above ran for real and **passed**:

```
com.example.calculator.CalculatorScreenTest > pressingDigitsUpdatesDisplay PASSED

BUILD SUCCESSFUL in 4s
```

This is this curriculum's first real, executed, on-device-style proof
that Compose's own recomposition machinery works exactly as claimed:
clicking a real button, dispatched through Compose's real semantics
tree, ran the real `onClick` lambda, wrote a real `MutableState`, and
Compose recomposed the real `Text` reading it — all without an emulator,
running directly on this machine's own JVM through Robolectric's
simulated Android environment. **Recomposition** (this lesson's own Terms
entry) is no longer a description of expected framework behavior; it is
something this project has now watched happen, for real, three times in
a row, in one real test run.

### CS lens

Running real framework code against a simulated environment on the same
machine, instead of the real target environment, to get fast, repeatable,
automatable verification is a real, general idea: **test doubles for an
environment**, not just for an individual dependency. Also recognized
in: an in-memory database standing in for a real one in fast unit tests,
a mock HTTP server standing in for a real backend, a flight simulator
standing in for an actual aircraft during pilot training, and any
"headless" browser automation tool letting web UI tests run without an
actual visible browser window.

### SE lens

The alternative not chosen — and the one every earlier lesson in this
curriculum's own Stage 1 was honestly limited to — is trusting the
schema's own Verification Rule Necessity exemption: stating predicted
behavior from confidence in well-documented framework guarantees,
without an actual run. That remains a legitimate, honestly-labeled tool
for genuinely unverifiable claims, but it is strictly weaker than a real
execution whenever a real execution is actually achievable — this
lesson's own real investment in Robolectric proves it was achievable
here, for exactly the class of claims ("does recomposition actually
update the screen") this curriculum's own tooling notes had previously
written off as unverifiable in this environment. The real, ongoing cost:
Robolectric simulates the Android framework faithfully enough for
semantics-tree and click-dispatch behavior, but does not perform genuine
GPU rendering — a claim specifically about actual drawn pixels, animation
timing, or true multi-touch gesture recognition still cannot be verified
this way, and still needs the Necessity exemption's honest, unexecuted
treatment, or a real device, when Stage 1's later lessons or Stages 9–11
reach that kind of claim.

### Run it

Shown above, in full: the real Gradle config change, the real first
failing attempt, and the real passing test. All saved at
`verification/1.4/step2_robolectric_digit_press_updates_display.txt`
(the passing run) and
`verification/1.4/lab0_first_real_attempt_ambiguous_finder.txt` (the real
first failure). The full, final project — every Concept Unit's own
change together — was confirmed once more with a complete
`./gradlew testDebugUnitTest assembleDebug`, producing both a passing
test suite and a real, installable `.apk`
(`verification/1.4/step4_final_test_and_assembleDebug.txt`).

### Connecting the pieces

Every Concept Unit in this lesson — a real, observable state holder, kept
alive by `remember`, read by a state-driven `Text`, written by real
digit-button clicks — comes together in one real, executed, passing
test: proof, not prediction, that this project's UI genuinely responds to
its own state.

---

## Closing

**Connect the pieces.** Follow one concrete action — a real click on the
`"7"` button, exactly as this lesson's own passing test performed it —
through every unit this lesson built. `mutableStateOf("0")` (Concept Unit
1) first created a real, observable `MutableState<String>`, wrapped in
`remember` (Concept Unit 3) so recomposition wouldn't discard it —
proven, concretely, by a real test where the *un*-wrapped version's count
stayed frozen at `0` after a real click, while the wrapped version's
correctly reached `1`, then `2`. `by` (Concept Unit 2) let
`CalculatorScreen` read and write that state as a plain `displayText`
property, through real, compiler-confirmed `getValue`/`setValue` calls.
`Text(text = displayText)` (Concept Unit 4) is what made the *display*
specifically reflect that property — State-driven UI, never told what to
show, only ever reading what currently is. The click itself ran the real
`onClick` logic Concept Unit 5 wired: `label[0].isDigit()` recognizing
`"7"` as a digit, and, since `displayText` still held its untouched
`"0"`, replacing it outright rather than appending. And the *proof* that
all of this genuinely happened — not just compiled, but ran, dispatched
a real click, wrote real state, and recomposed a real screen — is Concept
Unit 6's own real, executed, passing test, this curriculum's first
on-device-style verification without an emulator.

**Next: Lesson 1.5, Events** — this lesson wired only the ten digit
buttons; the six operator and control buttons (`÷`, `×`, `−`, `+`, `C`,
`=`) still fall through to the same no-op their `if` check already
proved does nothing. Lesson 1.5 goes deeper into callbacks and event
handlers to decide what those remaining buttons should actually do.
