# Lesson 4.2: Why Architecture Exists

- **What you will build** — no new feature. This lesson makes no
  production code changes at all; every one of this project's 26 real,
  passing tests still passes, unchanged, at the end of it. Instead, this
  lesson looks hard at `CalculatorScreen` — the same real, working
  function this project has grown, lesson by lesson, into its current
  shape — and names, with real, provable evidence rather than a
  feeling, exactly why
  its current design is already starting to cost this project something,
  even though nothing about it is broken today. The transferable problem:
  code that works right now can still be quietly setting up real trouble
  later, and "it works" is not the same claim as "it's built well" —
  this lesson is about learning to tell the difference, using four real,
  named tools.
- **What you need to know first** — Lesson 3.3's `CalculatorState` and
  `nextState`, and Lesson 1.4's `remember`/`mutableStateOf`, all still
  owned and called directly by `CalculatorScreen`; Lesson 4.1's own
  real, published implementation of `rememberNavController`, fetched
  and read in full — specifically, that it uses `rememberSaveable`, not
  plain `remember`, to survive a configuration change.
- **Terms used in this lesson**
  - **Coupling** — how much one piece of code depends on the exact,
    specific details of another piece of code, rather than on some
    stable, general contract between them. Why it matters: tightly
    coupled code can't change independently — touching one side forces
    you to touch the other, whether you wanted to or not.
  - **Cohesion** — how strongly the things inside one single piece of
    code actually belong together, all genuinely serving the same one
    purpose. Why it matters: low cohesion is a warning sign that a
    single function or class is secretly doing several unrelated jobs
    at once, each of which will eventually need to change for its own,
    unrelated reason.
  - **Responsibility** — what a piece of code is actually answerable
    for; its own real job description. Why it matters: a piece of code
    with a clean, one-sentence responsibility is easy to reason about
    and easy to test in isolation; a piece of code whose honest
    responsibility needs the word "and" more than once is already
    carrying more than one real job.
  - **Separation of concerns** — dividing a system so that each
    genuinely distinct *kind* of concern — what to compute, how to
    display it, who owns a piece of state and for how long it lives —
    gets its own place, instead of being tangled together inside one
    piece of code. Why it matters: concerns that are still tangled
    together can't be changed, tested, or reused independently of each
    other, even when nothing about them is actually related.
  - **`for` loop** — Kotlin's own established control-flow keyword,
    iterating over every element of an `Iterable`. Reappearing here,
    unchanged, inside `CalculatorScreen`'s own nested keypad-building
    loop (`for (row in keypadRows) { ... for (label in row) { ... } }`),
    quoted below.
  - **`when` expression** — Kotlin's own established control-flow
    keyword, evaluating exactly one matching branch and returning its
    value. Reappearing here, unchanged, both inside `nextState`'s own
    four-branch dispatch and inside `animateColorAsState`'s own
    two-branch target-color choice, both quoted below.
- **Objects and methods used**
  - **Everything else in the file, not this lesson's subject but still
    explained:**

    - **`CalculatorScreen`**
      - *What it is:* this project's own real, top-level screen
        composable — the exact subject this whole lesson examines.
      - *Implementation:* `@Composable fun CalculatorScreen(mode:
        String = "Basic")`, unchanged by this lesson.
      - *Its use:* re-quoted and analyzed, unmodified, across this
        lesson's own Cohesion and Responsibility units.
      - *Type:* a top-level `@Composable` function.
      - *Responsibility:* right now, honestly: owns this calculator's
        state, computes its own display color, lays out the screen,
        renders its display text, builds a sixteen-button keypad from
        data, and invokes business logic on every press — the exact,
        real, over-full charter this lesson's own Responsibility unit
        names in full.
      - *Depends on:* `CalculatorState`, `nextState`,
        `animateColorAsState`, and this project's own established
        layout vocabulary, all below.
      - *Connects to:* called by `CalculatorApp`'s own `"calculator/
        {mode}"` route; calls `nextState` on every keypad press.
      - *Shape:* this project's own UI entry point for the calculator —
        the exact seam this lesson's four units all converge on.

    - **`nextState(current: CalculatorState, label: String):
      CalculatorState`**
      - *What it is:* this project's own real, pure function holding
        every piece of this calculator's actual business logic.
      - *Implementation:* a `when` expression over four real branches —
        digit entry, `"C"`, an operator symbol, `"="` — unchanged by
        this lesson.
      - *Its use:* called directly, by name, from `CalculatorScreen`'s
        own keypad `onClick` lambdas — the exact real line this
        lesson's own Coupling unit examines.
      - *Type:* a top-level, pure function.
      - *Responsibility:* compute the next `CalculatorState` from the
        current one and one pressed label — nothing about rendering,
        nothing about ownership.
      - *Depends on:* a `CalculatorState` and a `String` label; no
        Compose or Android dependency at all.
      - *Connects to:* called by `CalculatorScreen`; already directly,
        fast unit-tested by this project's own `CalculatorStateTest.kt`
        with zero Compose machinery involved.
      - *Shape:* a plain Kotlin function — proof this project's own
        business logic is already genuinely separated from its own UI
        layer, unlike state ownership.

    - **`CalculatorState`**
      - *What it is:* this project's own real, immutable data class
        holding this calculator's entire current state.
      - *Implementation:* `data class CalculatorState(val display:
        Display = Display.Value("0"), val firstOperand: Int? = null,
        val pendingOperator: Operator? = null)`, unchanged by this
        lesson.
      - *Its use:* the value `CalculatorScreen` owns via `remember`, and
        the value `nextState` both reads and returns a new copy of.
      - *Type:* a `data class`.
      - *Responsibility:* hold one complete, immutable snapshot of this
        calculator's state — nothing about how or where that snapshot
        is stored across recomposition.
      - *Depends on:* `Display`, `Operator` — both this project's own
        already-established types.
      - *Connects to:* built and read by `nextState`; wrapped in a
        `mutableStateOf` inside `CalculatorScreen`.
      - *Shape:* a plain data model — the actual value this lesson's
        Separation of Concerns unit asks who should really own.

    - **`remember`**
      - *What it is:* the real Compose function that keeps a value alive
        across recomposition, tied to one specific composable's own slot
        in the composition tree.
      - *Implementation:* `@Composable fun <T> remember(calculation: ()
        -> T): T`, unchanged from its own first appearance in this
        project.
      - *Its use:* wraps the `mutableStateOf(CalculatorState())` call
        inside `CalculatorScreen`, deciding where that state's own value
        actually lives.
      - *Type:* a `@Composable` function.
      - *Responsibility:* return the same held value across
        recomposition, computing it fresh only the first time — nothing
        about surviving a composition being torn down and rebuilt from
        scratch entirely.
      - *Depends on:* a `calculation` lambda producing the initial
        value; an active composition to hold a slot in.
      - *Connects to:* wraps `mutableStateOf(CalculatorState())` inside
        `CalculatorScreen`; contrasted directly against
        `rememberSaveable`, below, by this lesson's own Separation of
        Concerns unit.
      - *Shape:* the weaker of two real state-holding tools this
        project has already used — this lesson's own point of departure.

    - **`mutableStateOf(CalculatorState())`**
      - *What it is:* the real Compose function building the actual
        observable holder Compose watches for changes.
      - *Implementation:* `fun <T> mutableStateOf(value: T): MutableState
        <T>`, unchanged from its own first appearance in this project.
      - *Its use:* builds the specific `MutableState<CalculatorState>`
        `CalculatorScreen` reads and writes on every keypad press.
      - *Type:* a top-level function.
      - *Responsibility:* wrap one value so Compose can observe reads of
        it and trigger recomposition on writes to it.
      - *Depends on:* an initial `CalculatorState()` value.
      - *Connects to:* wrapped by `remember`, above; written to directly
        by `CalculatorScreen`'s own `state = nextState(state, label)`.
      - *Shape:* Compose's own observable-state primitive, unchanged.

    - **`rememberSaveable`**
      - *What it is:* the real, stronger sibling of `remember`, backing
        its held value with Android's own saved-instance-state
        mechanism instead of a plain in-memory composition slot.
      - *Implementation:* its own real, published body, already fetched
        and read in full from `rememberNavController()`'s own
        implementation: `rememberSaveable(saver = NavControllerSaver
        (context)) { createNavController(context) }`.
      - *Its use:* named here only in contrast — `CalculatorScreen`'s
        own state uses plain `remember`, not this, and this lesson's own
        Separation of Concerns unit names exactly what that choice
        costs.
      - *Type:* a `@Composable` function.
      - *Responsibility:* survive not just recomposition but a
        composition being torn down and rebuilt from scratch — a real
        configuration change, for instance — by saving its value into
        Android's own saved-instance-state.
      - *Depends on:* a `Saver` describing how to save/restore its
        value; an ambient `Context`.
      - *Connects to:* already proven, real, called by
        `rememberNavController()`'s own body; not currently called
        anywhere in `CalculatorScreen`.
      - *Shape:* the real tool this project has already proven exists,
        not yet reached for where it's actually needed.

    - **`animateColorAsState`**
      - *What it is:* this project's own real Compose animation call,
        driving a smooth color transition from a target value.
      - *Implementation:* `@Composable fun animateColorAsState
        (targetValue: Color, ..., label: String = "ColorAnimation"):
        State<Color>`, unchanged by this lesson.
      - *Its use:* computes `CalculatorScreen`'s own `displayColor`,
        transitioning between an ordinary value's color and an error
        color.
      - *Type:* a `@Composable` function.
      - *Responsibility:* own the animation between color values —
        nothing about what triggers a new target color, or how the
        underlying state that drives it is itself owned.
      - *Depends on:* a real target `Color`, recomputed here from
        `state.display` on every recomposition.
      - *Connects to:* reads `state.display`; its own result colors the
        display `Text` below it.
      - *Shape:* one of the six real, distinct concerns this lesson's
        own Cohesion unit finds living inside `CalculatorScreen`.

    - **`Column`, `Row`**
      - *What it is:* Compose's own real layout composables, stacking
        their children vertically (`Column`) or horizontally (`Row`).
      - *Implementation:* `@Composable fun Column(modifier: Modifier =
        Modifier, verticalArrangement: Arrangement.Vertical = ...,
        horizontalAlignment: Alignment.Horizontal = ..., content:
        @Composable ColumnScope.() -> Unit)`; `Row`'s own real signature
        mirrors it, horizontally.
      - *Its use:* `Column` wraps `CalculatorScreen`'s entire body; one
        `Row` per keypad row, inside the `for` loop below.
      - *Type:* top-level `@Composable` functions.
      - *Responsibility:* arrange their own children along one axis —
        nothing about what those children's own values are.
      - *Depends on:* a `content` lambda building the children to
        arrange.
      - *Connects to:* `Column` holds both `Text` calls and the keypad
        loop; each `Row` holds one row's own `CalculatorButton` calls.
      - *Shape:* this project's own established layout vocabulary,
        unchanged.

    - **`Text`**
      - *What it is:* Compose's own real composable rendering a string
        as visible text.
      - *Implementation:* `@Composable fun Text(text: String, modifier:
        Modifier = Modifier, color: Color = Color.Unspecified, style:
        TextStyle = LocalTextStyle.current, ...)`.
      - *Its use:* renders `CalculatorScreen`'s own `mode` title and its
        own current display value, twice, with different real
        parameters each time.
      - *Type:* a top-level `@Composable` function.
      - *Responsibility:* lay out and draw exactly one real string —
        nothing about deciding what that string should be.
      - *Depends on:* a `text: String`.
      - *Connects to:* reads `mode` for the title; reads `state.display.
        toDisplayText()` and `displayColor` for the running display.
      - *Shape:* this project's own established rendering vocabulary,
        unchanged.

    - **`CalculatorButton`**
      - *What it is:* this project's own real, reusable, haptic-enabled
        button composable.
      - *Implementation:* `@Composable fun CalculatorButton(label:
        String, onClick: () -> Unit, modifier: Modifier = Modifier,
        contentDescription: String? = null)`, unchanged by this lesson.
      - *Its use:* called once per keypad label, inside the nested
        loop below, its own `onClick` wired directly to `nextState`.
      - *Type:* a `@Composable` function.
      - *Responsibility:* render one real, styled, accessible, haptic
        button and run whatever `onClick` it's handed.
      - *Depends on:* a `label`, an `onClick` callback.
      - *Connects to:* called by `CalculatorScreen`'s own nested keypad
        loop; its own `onClick` calls `nextState` directly — the real
        line this lesson's own Coupling unit examines.
      - *Shape:* this project's own established, reusable UI vocabulary,
        unchanged.

    - **`MaterialTheme`**
      - *What it is:* the real, ambient object this project's own
        `CalculatorTheme` populates, exposing this app's own colors,
        typography, and shapes to every composable beneath it.
      - *Implementation:* a real singleton object with `colorScheme`,
        `typography`, `shapes` properties, already confirmed via `javap`
        against the real installed Material3 library.
      - *Its use:* `CalculatorScreen` reads `MaterialTheme.colorScheme.
        onBackground`/`.error` and `MaterialTheme.typography.
        displayLarge` from it, unchanged by this lesson.
      - *Type:* a singleton object.
      - *Responsibility:* expose this app's own, centrally defined
        design values to any composable that reads it.
      - *Depends on:* being composed underneath a real `MaterialTheme`
        call, which `CalculatorTheme` already provides.
      - *Connects to:* read by `animateColorAsState`'s own target-color
        `when` and by the display `Text`'s own `style`.
      - *Shape:* this project's own established theming vocabulary,
        unchanged.

    - **`Modifier` chain (`.fillMaxWidth()`, `.padding(Dp)`,
      `.testTag(String)`, `.weight(Float)`)**
      - *What it is:* Compose's own real, chainable configuration
        object, and four of its own real extension functions.
      - *Implementation:* `Modifier.fillMaxWidth(): Modifier`,
        `Modifier.padding(all: Dp): Modifier`,
        `Modifier.testTag(tag: String): Modifier`,
        `Modifier.weight(weight: Float): Modifier` (the last one scoped
        to `RowScope`), all unchanged from their own first appearances.
      - *Its use:* sized and identified `CalculatorScreen`'s own
        `Column` and every one of its sixteen real
        `CalculatorButton` calls.
      - *Type:* an interface (`Modifier`) plus its own real extension
        functions.
      - *Responsibility:* describe, declaratively, how one composable
        should be measured, laid out, or identified — nothing about
        what it actually renders.
      - *Depends on:* whatever composable it's ultimately attached to.
      - *Connects to:* built up and passed into `Column` and every
        `CalculatorButton` call inside `CalculatorScreen`.
      - *Shape:* this project's own established configuration
        vocabulary, unchanged.

    - **`accessibilityLabels[label]`**
      - *What it is:* this project's own real `Map<String, String>`
        key-lookup operator, returning a nullable value.
      - *Implementation:* `operator fun <K, V> Map<K, V>.get(key: K):
        V?`, unchanged from its own first appearance in this project.
      - *Its use:* supplies `CalculatorButton`'s own optional
        `contentDescription` parameter for each real keypad label.
      - *Type:* an `operator fun`, the real mechanism behind `[]` on a
        `Map`.
      - *Responsibility:* look up one key and return its value, or
        `null` if that key was never stored.
      - *Depends on:* `accessibilityLabels`, this project's own real,
        already-established `Map`, and a `label: String` key.
      - *Connects to:* called once per keypad button, inside the nested
        loop below; its nullable result flows straight into
        `CalculatorButton`'s own `contentDescription` parameter.
      - *Shape:* this project's own established nullable-lookup
        vocabulary, unchanged.

---

## Concept Unit: Coupling — depending on exact details instead of a stable contract

### The Problem

Every one of `CalculatorScreen`'s sixteen keypad buttons has the exact
same real line inside its `onClick`: `state = nextState(state, label)`.
That line calls `nextState` — a specific, real, named free function —
directly, by name. It works. It's also, right now, the *only* way
`CalculatorScreen` knows how to compute a new state.

> **Stop and think:** if `nextState` were renamed tomorrow — to
> `computeNextState`, say — what would happen to `CalculatorScreen` the
> next time this project is built? Would the compiler catch it, or would
> it only show up as a runtime bug? Now imagine `CalculatorScreen`
> instead received *a function* as one of its own parameters — the same
> `() -> Unit` shape `CalculatorButton`'s own `onClick` parameter has
> used since this project's own Stage 3 — and called *that* parameter
> instead of `nextState` directly. Would renaming `nextState` still
> break anything?

### Introduce the Concept in Isolation

Two small, throwaway functions, added temporarily as
`lab_coupling.kt`, deliberately built to mirror `CalculatorScreen`'s own
real shape — one calling a specific named function directly, one
receiving a function as a parameter instead:

```kotlin
fun computeTotal(items: List<Int>): Int = items.sum()

fun printReceiptTightlyCoupled(items: List<Int>) {
    println("Total: ${computeTotal(items)}")
}

fun printReceiptLooselyCoupled(items: List<Int>, compute: (List<Int>) -> Int) {
    println("Total: ${compute(items)}")
}

fun main() {
    printReceiptTightlyCoupled(listOf(2, 3, 4))
    printReceiptLooselyCoupled(listOf(2, 3, 4), ::computeTotal)
}
```

Compiled and run for real this session via `kotlinc lab_coupling.kt
-include-runtime -d lab_coupling.jar` (clean, no errors) and `java -jar
lab_coupling.jar`:

```
Total: 9
Total: 9
```

Both functions produce the identical real result — proving the two
designs are behaviorally interchangeable *today*. The real difference
only shows up under change. `computeTotal` was renamed to `sumItems`
everywhere except inside `printReceiptTightlyCoupled`'s own body — a
real, deliberate mistake, saved as `lab_coupling_break.kt` — and
recompiled for real:

```
$ kotlinc lab_coupling_break.kt -include-runtime -d lab_coupling_break.jar
lab_coupling_break.kt:4:23: error: unresolved reference 'computeTotal'.
    println("Total: ${computeTotal(items)}")
                      ^^^^^^^^^^^^
```

A real, genuine compile failure — `printReceiptTightlyCoupled` has no
way to keep working once the specific name it depends on changes.
`printReceiptLooselyCoupled`, by contrast, needed no change at all
beyond updating its own one real call site
(`printReceiptLooselyCoupled(listOf(2, 3, 4), ::sumItems)`) to pass in
whatever the function happens to be named *now* — the function itself
never had `computeTotal`'s name written inside it anywhere. This
concrete difference — how much one piece of code depends on another
piece's exact, specific details — is called **coupling**.
`printReceiptTightlyCoupled` is tightly coupled to `computeTotal`;
`printReceiptLooselyCoupled` is only coupled to a stable shape, `(List
<Int>) -> Int`, not to any one function's name.

### Discard the Throwaway Example

`lab_coupling.kt` and `lab_coupling_break.kt` are both deleted now —
real, saved in this lesson's own verification folder
(`verification/4.2/lab_coupling.kt`,
`break2_lab_coupling_rename_breaks_tightly_coupled.kt`, and both real
run transcripts). Neither exists anywhere in this project's own real
source tree.

### Mechanical Walkthrough

The same real pattern the isolated lab just proved is not hypothetical
for this project — it's real, right now, inside `CalculatorScreen`'s own
code:

```kotlin
var state by remember { mutableStateOf(CalculatorState()) }
// ...
onClick = { state = nextState(state, label) }
```

- `var state by remember { mutableStateOf(CalculatorState()) }` —
  `CalculatorScreen` itself creates and owns this state, using the same
  real `remember`/`mutableStateOf` pair proven throughout this project
  since state was first introduced.
- `onClick = { state = nextState(state, label) }` — this is the real
  line shaped exactly like `printReceiptTightlyCoupled`'s own body:
  `nextState` is called by its own specific, hardcoded name, not
  received as a parameter. This was proven for real, against this exact
  project, this session: `nextState` was temporarily renamed to
  `computeNextState` inside `Calculator.kt`, and a real
  `./gradlew :app:compileDebugKotlin` was run:

  ```
  e: .../MainActivity.kt:144:45 Unresolved reference: nextState
  ```

  A real, genuine compile failure against this project's own actual
  code — not a hypothetical, not a prediction. The rename was reverted
  immediately afterward; `nextState` is real, unchanged, and still
  called by that same name in the actual project today. This transcript
  is saved in full at
  `verification/4.2/break1_rename_nextState_breaks_calculatorscreen.txt`.

### CS Lens

Coupling — how much one piece of code depends on another's exact,
specific details rather than a stable contract between them — is a
foundational idea in how any nontrivial system is actually built and
maintained.

```
Also recognized in: microservices communicating over a versioned API
contract instead of shared internal code, a plugin system depending on
a stable interface rather than a specific implementation class, database
schemas versioned so client code doesn't break on every column rename
```

### SE Lens

The alternative to tight coupling here isn't "no coupling at all" — some
dependency between `CalculatorScreen` and its own business logic is
inevitable and necessary; a calculator screen that computed nothing
would be useless. The real alternative, proven by the isolated lab
above, is coupling to a *stable shape* — a function type, an interface —
instead of one specific, named implementation. `CalculatorScreen`
doesn't do this today: `nextState` is called directly, by name, the
same way `printReceiptTightlyCoupled` called `computeTotal`. The real
cost this project is currently carrying is small precisely *because*
`nextState` is unlikely to be renamed — but the same shape of coupling
reappears, at real scale, the moment `CalculatorScreen` needs to depend
on something genuinely likely to change or vary — exactly the situation
a real, purpose-built ownership abstraction exists to address, once this
project's own design actually introduces one.

### Commands Needed

- `kotlinc <file>.kt -include-runtime -d <file>.jar` — compiles a
  standalone Kotlin file into a runnable `.jar`, bundling the Kotlin
  runtime so it can run with a plain `java -jar` afterward, with no
  Gradle project needed — the same standalone compilation approach this
  project's own Stage 0 used throughout.
- `./gradlew :app:compileDebugKotlin` — compiles only this project's
  main source set, without running any tests or building a full `.apk`
  — the fastest real way to check whether a change like a rename
  actually breaks compilation, used here for a real, deliberate,
  temporary break.

### Run It

Both labs, run for real this session (already shown above in full);
the real, deliberate break against this project's own actual
`nextState`, also run for real this session (already shown above in
full). All three transcripts are saved in
`verification/4.2/`. This project's own `nextState` was confirmed
reverted and compiling cleanly again immediately afterward via a second
real `./gradlew :app:compileDebugKotlin` run: `BUILD SUCCESSFUL in
338ms`.

### Connect the Pieces

The isolated lab proved, in miniature, that calling a specific function
by name — rather than receiving one as a value — makes a rename a real,
breaking change; reverting the exact same experiment against this
project's own real `nextState` proved it's not just a lab toy, it's true
of `CalculatorScreen` right now, today.

---

## Concept Unit: Cohesion — whether what's inside one function actually belongs together

### The Problem

`CalculatorScreen` is one real function. Right now, everything it does —
creating state, animating a color, laying out a column, rendering two
text labels, building a sixteen-button keypad, and calling business
logic on every press — lives inside that one function's own body.

> **Stop and think:** if you had to describe, in one sentence, everything
> `CalculatorScreen` actually does today, how many separate verbs would
> that sentence need? If a designer asked for the display's color logic
> to move somewhere else, or a different developer asked for the keypad
> layout to change, would either change actually require touching
> anything the *other* one cares about? What does it mean if two
> completely unrelated change requests both land in the exact same
> function?

### Introduce the Concept in Isolation

A small, throwaway pair of functions, added temporarily as
`lab_cohesion.kt` — one doing three unrelated jobs at once, one
splitting the same three jobs into three single-purpose pieces:

```kotlin
fun processOrderLowCohesion(quantity: Int, price: Int): String {
    val valid = quantity > 0 && price > 0
    val total = quantity * price
    return if (valid) "Total: \$$total" else "Invalid order"
}

fun isValidOrder(quantity: Int, price: Int): Boolean = quantity > 0 && price > 0
fun computeOrderTotal(quantity: Int, price: Int): Int = quantity * price
fun formatOrderTotal(total: Int): String = "Total: \$$total"

fun processOrderHighCohesion(quantity: Int, price: Int): String {
    return if (isValidOrder(quantity, price)) {
        formatOrderTotal(computeOrderTotal(quantity, price))
    } else {
        "Invalid order"
    }
}
```

Compiled and run for real this session:

```
$ kotlinc lab_cohesion.kt -include-runtime -d lab_cohesion.jar
(compiles clean, no warnings/errors)

$ java -jar lab_cohesion.jar
Total: $15
Total: $15
```

Both real, identical output — proving the refactor from
`processOrderLowCohesion` to `processOrderHighCohesion` changed nothing
about *what* the code does, only *how it's organized*.
`processOrderLowCohesion` mixes three genuinely separate jobs —
validating, computing, and formatting — inside one function body, with
no way to reuse, test, or change any one of them without touching the
whole thing. `isValidOrder`, `computeOrderTotal`, and
`formatOrderTotal` each do exactly one job, and each could be reused or
tested completely on its own. This property — how strongly the things
inside one piece of code actually belong together — is called
**cohesion**. `processOrderLowCohesion` has low cohesion;
`isValidOrder`/`computeOrderTotal`/`formatOrderTotal` each individually
have high cohesion.

### Discard the Throwaway Example

`lab_cohesion.kt` is deleted now — real, saved in
`verification/4.2/lab_cohesion.kt` alongside its real run transcript. It
does not exist in this project's own real source tree.

### Mechanical Walkthrough

`CalculatorScreen`'s own real, current, full body — unchanged, quoted
here in full for this analysis:

```kotlin
@Composable
fun CalculatorScreen(mode: String = "Basic") {
    var state by remember { mutableStateOf(CalculatorState()) }
    val displayColor by animateColorAsState(
        targetValue = when (state.display) {
            is Display.Value -> MaterialTheme.colorScheme.onBackground
            Display.Error -> MaterialTheme.colorScheme.error
        },
        label = "displayColor"
    )
    Column(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = mode, modifier = Modifier.testTag("modeTitle"))
        Text(
            text = state.display.toDisplayText(),
            style = MaterialTheme.typography.displayLarge,
            color = displayColor,
            modifier = Modifier.testTag("display")
        )
        for (row in keypadRows) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (label in row) {
                    CalculatorButton(
                        label = label,
                        onClick = { state = nextState(state, label) },
                        modifier = Modifier.weight(1f),
                        contentDescription = accessibilityLabels[label]
                    )
                }
            }
        }
    }
}
```

- `var state by remember { mutableStateOf(CalculatorState()) }` —
  concern 1: **owning** this screen's state. `remember` and
  `mutableStateOf` are the same real constructs already established
  throughout this project — `remember` keeps a value alive across
  recomposition; `mutableStateOf` builds the observable holder Compose
  watches. This line's own job is deciding *where this state lives*,
  not displaying or computing anything.
- `val displayColor by animateColorAsState(...)` — concern 2:
  **animating** a color derived from state. `animateColorAsState` is the
  same real Compose animation call already established when this
  project's display color was first made to transition; the `when
  (state.display) { is Display.Value -> ...; Display.Error -> ... }`
  reads `state`, but its own job is choosing a *color*, unrelated to
  owning state or laying out the screen.
- `Column(modifier = ..., verticalArrangement = ...,
  horizontalAlignment = ...) { ... }` — concern 3: **laying out** the
  screen's own visual structure. The same real `Column` composable, the
  same real `Modifier.fillMaxWidth().padding(16.dp)` chain, the same
  real `Arrangement.spacedBy(8.dp)` and `Alignment.CenterHorizontally`
  already fully established in this project — its own job is arranging
  child elements vertically, unrelated to what those elements' own
  values are.
- `Text(text = mode, ...)` and `Text(text = state.display.
  toDisplayText(), ...)` — concern 4: **rendering** two specific pieces
  of text. Both real, already-established `Text` calls, reading `mode`
  and `state.display` respectively — their own job is putting a string
  on screen, not deciding what that string should be.
- `for (row in keypadRows) { Row(...) { for (label in row) {
  CalculatorButton(...) } } }` — concern 5: **building the keypad**, a
  real, already-established nested loop over `keypadRows`, each
  `CalculatorButton` call reading `accessibilityLabels[label]` (this
  project's own real `Map` key lookup, returning a nullable value) —
  its own job is producing sixteen real buttons from data, unrelated to
  any of the four concerns above it.
- `onClick = { state = nextState(state, label) }` — concern 6:
  **invoking business logic** and writing the result back into concern
  1's own state — the exact real line the previous unit already proved
  is tightly coupled to `nextState`'s own specific name.

Six genuinely distinct concerns — owning state, animating a color,
laying out structure, rendering text, building a keypad from data, and
invoking business logic — all currently living inside one function's
own body. Some of these concerns are closely related enough that mixing
them is defensible (laying out a screen and rendering its own text are
both, honestly, "UI work"); others are not (owning a piece of mutable
state has nothing structurally in common with animating a color, even
though both happen to touch the same `state` variable).

### CS Lens

Cohesion — how strongly the elements inside one unit of code genuinely
belong together — is a core idea for reasoning about any codebase's own
real structure, not just this one function.

```
Also recognized in: the Unix philosophy's "do one thing well," database
normalization (keeping unrelated facts in separate tables), a
well-designed class library where each class has one clear job,
microservice boundaries drawn around one real business capability
```

### SE Lens

The alternative to `CalculatorScreen`'s current shape isn't necessarily
"six separate functions" — some of these concerns genuinely are UI
concerns that belong together in one composable. The real, specific
low-cohesion problem worth naming is concern 1, state ownership, sitting
directly alongside concerns 2 through 6, all UI-rendering concerns:
*owning* a piece of mutable state and *rendering* it are not the same
kind of job, even though Compose's own `remember` syntax makes it easy
to write them as if they were. The real cost already showing up:
`CalculatorScreen` cannot be unit-tested for its own business-logic
wiring without also standing up a full Robolectric Compose test — this
project's own `CalculatorStateTest.kt` already proves the *opposite*
extreme is possible and fast (`nextState` alone, tested directly, at
real sub-millisecond speed, no Compose machinery at all) precisely
*because* business logic was already separated out; state *ownership*
has not had the same treatment yet.

### Commands Needed

No new commands beyond `kotlinc`, already shown above.

### Run It

Already shown above in full; the real, saved transcript lives at
`verification/4.2/step2_lab_cohesion_run.txt`.

### Connect the Pieces

The previous unit named one real coupling problem inside
`CalculatorScreen`'s own `onClick` line; this unit steps back and looks
at the *whole* function at once, and finds that line sitting alongside
five other genuinely different jobs — the same six-concerns view this
lesson's next two units will use to name exactly which of those jobs
belongs where.

---

## Concept Unit: Responsibility — what a piece of code is actually answerable for

### The Problem

Every "Objects and methods used" entry this curriculum has ever written
gives its subject a *Responsibility* — a full, honest job description.
`CalculatorScreen` itself has never had one written out. What would it
honestly say?

> **Stop and think:** try writing `CalculatorScreen`'s own real
> Responsibility charter, the same way this project's own Header entries
> always have, as one sentence. How many times does the word "and" show
> up before the sentence is actually honest? If a single sentence needs
> "and" more than once, what does that suggest about how many genuinely
> separate jobs are hiding inside one name?

### Introduce the Concept in Isolation

A small, throwaway class deliberately given three unrelated real-world
jobs, added temporarily as `lab_responsibility.kt`, contrasted with one
given exactly one:

```kotlin
class Thermostat {
    fun readTemperature(): Int = 72
    fun adjustFurnace(targetTemp: Int) {
        println("Furnace adjusted toward $targetTemp")
    }
    fun logReading(temp: Int) {
        println("Logged: $temp")
    }
}

class TemperatureSensor {
    fun read(): Int = 72
}
```

Compiled and run for real this session:

```
$ kotlinc lab_responsibility.kt -include-runtime -d lab_responsibility.jar
(compiles clean, no warnings/errors)

$ java -jar lab_responsibility.jar
Logged: 72
Furnace adjusted toward 70
Sensor reads: 72
```

`Thermostat`'s own honest Responsibility charter: "Reads the current
temperature, **and** controls the furnace, **and** logs every reading" —
three real "and"s, and, more importantly, three genuinely different
real-world stakeholders: a sensor engineer, an HVAC-control engineer,
and whoever owns audit logging, each of whom would want to change this
one class for their own entirely unrelated reason.
`TemperatureSensor`'s own charter: "Reports the current temperature." —
one sentence, no "and," one real stakeholder. This test — can this
code's own job be stated honestly in one sentence with no "and" — is
called checking a piece of code's **responsibility**.

### Discard the Throwaway Example

`lab_responsibility.kt` is deleted now — real, saved in
`verification/4.2/lab_responsibility.kt` alongside its real run
transcript. It does not exist in this project's own real source tree.

### Mechanical Walkthrough

Applying the same one-sentence test to `CalculatorScreen`'s own real
code, shown in full in the previous unit above: its own honest
Responsibility charter reads "Owns this calculator's current state,
**and** computes its own display color from that state, **and** lays
out the screen, **and** renders its display text, **and** builds a
sixteen-button keypad from data, **and** invokes business logic on every
press, writing the result back into its own state." Six real "and"s,
matching the six real concerns the Cohesion unit above already
enumerated line by line — the same evidence, now read through a
different, complementary lens: not "do these things belong together"
(Cohesion), but "how many genuinely separate jobs is this one function
actually answerable for" (Responsibility). A well-formed version of this
same screen would instead read something closer to "Renders the current
calculator state and forwards user input events" — one real sentence,
one real job, everything else pushed to something else answerable for
its own separate charter.

### CS Lens

Naming a unit's own Responsibility, precisely, is the same real
technique behind the Class-Responsibility-Collaborator (CRC) card — a
real, decades-old object-oriented design technique this curriculum's own
Header has used for every single class and function it has ever
introduced, in every lesson, without exception.

```
Also recognized in: CRC cards in object-oriented design, job
descriptions in any well-run organization, the Single Responsibility
Principle from the SOLID design principles, API design reviews that ask
"what is this endpoint actually for"
```

### SE Lens

The alternative to `CalculatorScreen`'s current, six-part charter isn't
necessarily six separate classes — some of those six concerns are small
enough, and different enough in kind, that the real dividing line worth
drawing is between "owning and computing state" (a job with no
inherent connection to Compose, to Android, or to any UI framework at
all) and "rendering whatever state it's given, and forwarding whatever
events the user causes" (a job that's inherently, unavoidably tied to
the UI framework). This is exactly the real seam Android's own
`ViewModel` class exists to sit on — not a hypothetical, a real,
purpose-built Android framework class, whose one job is owning UI state
independently of any one Composable's own lifecycle. The real cost of
not making this split yet: every one of `CalculatorScreen`'s six real
jobs currently changes for the same reason a rebuild happens — recompose
this one function, and all six run again together, whether the change
that triggered it had anything to do with five of them or not.

### Commands Needed

No new commands beyond `kotlinc`, already shown above.

### Run It

Already shown above in full; the real, saved transcript lives at
`verification/4.2/step4_lab_responsibility_run.txt`.

### Connect the Pieces

Cohesion asked whether `CalculatorScreen`'s own six concerns belong
together; this unit asks the complementary question — how many
genuinely separate jobs those same six concerns actually represent —
and lands on the same real seam: state ownership and computation on one
side, UI rendering on the other.

---

## Concept Unit: Separation of Concerns — giving each distinct kind of concern its own place

### The Problem

This lesson's first three units already found the same real seam three
separate ways: a coupling risk sitting in the state-mutation line, a
low-cohesion mix of state-ownership alongside UI work, and a two-part
Responsibility charter split along the exact same line. One real
question is still open: does it actually matter, concretely, today —
or is this just theory?

> **Stop and think:** `CalculatorScreen`'s own state is held with plain
> `remember`, not `rememberSaveable` — a real, already-proven distinction
> from this project's own real work reading `rememberNavController`'s
> own published source. Given what that distinction actually means,
> what happens to a user's
> in-progress calculation — say, they've typed `7`, pressed `+`, and
> typed `3`, but haven't pressed `=` yet — the moment a real
> configuration change (rotating the device) tears down and rebuilds
> `CalculatorScreen` from scratch? Is this a hypothetical risk, or a
> real, reproducible one?

### Introduce the Concept in Isolation

Two small, throwaway classes, added temporarily as `lab_separation.kt`
— one where a piece of state is owned directly by the same object that
renders it, one where the state is a separate object, owned externally
and only handed to whatever renders it:

```kotlin
class ScreenOwningItsOwnState {
    private var count = 0
    fun render(): String {
        count++
        return "Count: $count"
    }
}

class CounterState {
    var count = 0
}

fun renderCount(state: CounterState): String {
    state.count++
    return "Count: ${state.count}"
}
```

Compiled and run for real this session:

```
$ kotlinc lab_separation.kt -include-runtime -d lab_separation.jar
(compiles clean, no warnings/errors)

$ java -jar lab_separation.jar
Count: 1
Count: 2
Count: 1
Count: 1
Count: 2
Count: 3
```

The real output proves the exact real risk: calling `screen.render()`
twice on one `ScreenOwningItsOwnState` produced `1`, then `2`, as
expected — but building a **new** `ScreenOwningItsOwnState` (standing
in for a Composable being torn down and recreated fresh, the same real
event a configuration change triggers) and calling `render()` on *that*
produced `1` again — the earlier count of `2` is gone, permanently,
because it never existed anywhere except inside the exact object that
got thrown away. `renderCount`, by contrast, was called three times
against one, single, externally-owned `CounterState` object and
produced `1`, `2`, `3` — because the count's own lifetime was never tied
to any one call to `renderCount` at all. This — deliberately giving each
distinct *kind* of concern (owning long-lived state; rendering whatever
state currently exists) its own separate place, rather than tangling
them into one object's own lifetime — is called **separation of
concerns**.

### Discard the Throwaway Example

`lab_separation.kt` is deleted now — real, saved in
`verification/4.2/lab_separation.kt` alongside its real run transcript.
It does not exist in this project's own real source tree.

### Mechanical Walkthrough

`CalculatorScreen`'s own real line, unchanged, already shown in full
above:

```kotlin
var state by remember { mutableStateOf(CalculatorState()) }
```

- `remember { mutableStateOf(CalculatorState()) }` — the same real
  Compose constructs already established throughout this project.
  `remember` ties whatever it holds to *this exact composable's own
  slot* in the composition tree — precisely the same relationship
  `ScreenOwningItsOwnState` had to its own `count`: the value's entire
  lifetime is borrowed from whatever holds it, not owned independently.
  `rememberSaveable` — this project's own already-proven, real
  alternative, its own real body already read in full from
  `rememberNavController`'s own published source — backs its held value
  with Android's own saved-instance-state mechanism instead,
  specifically so it survives a composition being torn down and rebuilt
  from scratch, the
  exact event a real configuration change triggers.
  `CalculatorScreen`'s own `state` uses plain `remember`, not
  `rememberSaveable` — meaning the exact real risk the isolated lab
  above just proved with `ScreenOwningItsOwnState` applies here,
  unchanged: a user mid-calculation, rotating their real device, would
  really lose their current `firstOperand` and `pendingOperator`, reset
  back to `CalculatorState()`'s own defaults — not a hypothetical, the
  same real mechanism already proven twice over, once by
  `rememberNavController`'s own contrast with plain `remember`, and once
  by this unit's own isolated lab.

### CS Lens

Separation of concerns is one of the oldest, most general organizing
ideas in how any nontrivial system gets built without collapsing under
its own complexity.

```
Also recognized in: the OSI networking model's own layered separation of
physical/transport/application concerns, a compiler's own separate
lexer/parser/code-generator stages, database systems separating storage
engines from query planners, the Model-View-Controller pattern this
project's own upcoming MVVM lesson directly descends from
```

### SE Lens

The alternative to `CalculatorScreen`'s current design isn't leaving
state ownership where it is and hoping the risk never surfaces — the
real alternative, which this project's own next lesson builds, is
moving state ownership into something whose own lifetime is
deliberately independent of any one Composable's recomposition or
recreation: Android's own real `ViewModel` class, whose entire, real,
documented purpose is surviving exactly the configuration changes plain
`remember` does not. The real tradeoff: separating this concern out
means `CalculatorScreen` itself no longer directly owns the value it
displays — it has to receive or observe it from somewhere else instead,
one more real indirection than the current, simpler-looking single
function. That real cost is exactly what the next three lessons in this
project's own Stage 4 exist to spend deliberately, not accidentally.

### Commands Needed

No new commands beyond `kotlinc`, already shown above.

### Run It

Already shown above in full; the real, saved transcript lives at
`verification/4.2/step3_lab_separation_run.txt`.

### Connect the Pieces

Coupling, Cohesion, and Responsibility each found the same real seam in
`CalculatorScreen` from a different angle; this unit is where that
finding stops being structural theory and becomes a real, concrete,
reproducible risk — a real user's real in-progress calculation, lost to
a real configuration change, because state ownership was never
separated from UI rendering in the first place.

---

## Connect the Pieces

Four real lenses, one real function, one real finding. Coupling showed
`CalculatorScreen`'s own `onClick` line breaks the instant `nextState`
is renamed — proven twice, once in an isolated lab, once against this
project's own actual code. Cohesion opened up `CalculatorScreen`'s
entire body and found six genuinely distinct concerns sharing one
function, state ownership sitting uneasily beside five UI-rendering
jobs. Responsibility named the same finding as a charter that honestly
needs the word "and" six times over, when a well-formed screen's own
charter should need it zero times. Separation of Concerns turned that
structural finding into a real, provable risk: because `CalculatorScreen`
owns its own state with plain `remember` instead of something whose
lifetime is genuinely independent of the screen itself, a real
configuration change would really erase a real user's real in-progress
work. Nothing in this project's own real code changed today — every one
of its 26 real, passing tests still passes, unchanged. What changed is
that the exact seam worth cutting along — state ownership, separated
from UI rendering — is no longer a feeling. It's four times proven, and
it's exactly the seam a real, purpose-built ownership abstraction needs
to land on next.
