# Lesson 3: A Finite State Machine, and Who's Allowed to Watch It Change

**What you will build:** A real Experiment Workspace screen, reachable from
the "Experiments" area, with four buttons — Configure, Start, Stop, Save —
where only the buttons that are actually legal right now are enabled, and
tapping one visibly changes what the screen displays. The transferable
problem: an experiment obviously can't be saved before it's been run, and
can't be started twice — how does code represent "a fixed set of stages, and
the specific, limited moves allowed between them," in a way the compiler and
the UI can both actually enforce, rather than trusting every caller to
remember the rules?

**What you need to know first:** Lesson 1 of this curriculum (`sealed
class`, `object`, `remember`). Lesson 2 (`data class`, `interface`,
`Card`).

**Terms used in this lesson:**
- **Finite state machine (FSM)** — a model of a system as a fixed,
  enumerable set of states, together with explicit rules for which
  state-to-state transitions are allowed, given a current state and an
  attempted action. It exists so "what can legally happen next" is a fact
  checkable directly from a small, closed set of rules, instead of an
  emergent property of scattered `if` checks spread across a whole
  codebase.
- **Illegal transition** — an attempted state change the FSM's own rules do
  not permit from the current state (attempting to `save` an experiment
  that hasn't been `stop`ped yet, for instance). A well-designed FSM
  implementation refuses this loudly, rather than silently ignoring it or
  producing a nonsensical state.
- **`data object`** — a singleton `object` declaration (still exactly one
  instance ever created, the same guarantee Lesson 1's plain `object`
  gave) that additionally generates a real `toString`, `equals`, and
  `hashCode` — the same generation `data class` performs for classes with
  fields, applied here to a singleton with none. It exists specifically so
  a fieldless singleton still prints its own real name instead of a
  default, unreadable `ClassName@a1b2c3` identity string.
- **Presentation state** — state whose entire reason for existing is to
  tell the UI what to currently show and to trigger recomposition when it
  changes. This is a genuinely different concern from **domain state** (the
  actual `ExperimentState` value, which represents a real fact about the
  experiment, independent of whether any UI is even watching it right
  now) — the same distinction this lesson's own outline names directly as
  "separation of presentation state from domain state."
- **Property delegation (`by`)** — Kotlin syntax letting a property's
  getter and setter be supplied by a separate object, rather than backed by
  an ordinary field directly. It exists so a type like `MutableState<T>`
  can make itself usable with plain `x` and `x = newValue` syntax, instead
  of forcing every read to be `x.value` and every write to be
  `x.value = newValue`.

**Objects and methods used:**

- **`error`**
  - *What it is:* A Kotlin standard-library function for unconditionally
    failing with a clear message, when code reaches a point that should be
    provably impossible under the program's own stated rules.
  - *Implementation:* `fun error(message: Any): Nothing`, in
    `kotlin.PreconditionsKt` (Kotlin's standard library); it throws
    `IllegalStateException(message.toString())` — declared to return
    `Nothing`, Kotlin's real type for "this function never returns
    normally," which lets the compiler treat any code path calling it as
    provably unreachable.
  - *Its use:* Every illegal transition attempt in `ExperimentState.kt`'s
    transition functions calls it, in the `else` branch of a `when`.
  - *Type:* A top-level standard-library function.
  - *Responsibility:* Immediately halt the current function by throwing a
    real, typed exception carrying a human-readable explanation of exactly
    what rule was violated.
  - *Depends on:* A `message` describing the failure.
  - *Connects to:* Called from within `start`/`stop`/`save`'s `when`
    expressions; its thrown exception propagates up to whatever code called
    that function, unless caught somewhere in between.
  - *Shape:* A last line of defense — this lesson's own UI is built,
    later, specifically so it never actually triggers this path in normal
    use, but the function itself still enforces the rule unconditionally,
    for any caller, UI or not.

- **`mutableStateOf`**
  - *What it is:* The function that wraps an ordinary value in a container
    Compose can observe for changes.
  - *Implementation:* `fun <T> mutableStateOf(value: T, policy: SnapshotMutationPolicy<T> = structuralEqualityPolicy()): MutableState<T>`,
    in `androidx.compose.runtime`.
  - *Its use:* `ExperimentWorkspace` wraps its current `ExperimentState`
    value with it.
  - *Type:* A top-level function.
  - *Responsibility:* Construct a `MutableState<T>` — a real object holding
    both the current value and the bookkeeping Compose's snapshot system
    needs to notice, and react to, future writes.
  - *Depends on:* An initial `value`.
  - *Connects to:* Its result is typically immediately wrapped in
    `remember` (met already in Lesson 1) so the same `MutableState`
    instance survives recomposition instead of being rebuilt, empty, every
    time.
  - *Shape:* The actual bridge between "a plain Kotlin value" and
    "something Compose's recomposition engine can watch."

- **`MutableState<T>`**
  - *What it is:* The real type `mutableStateOf` returns — a mutable,
    observable single-value holder.
  - *Implementation:* `interface MutableState<T> : State<T> { override var value: T }`
    (`State<T>` itself declares `val value: T`) — both types additionally
    supply `getValue`/`setValue` operator extension functions, which is
    specifically what makes `by` delegation legal against them.
  - *Its use:* `ExperimentWorkspace` declares
    `var state by remember { mutableStateOf<ExperimentState>(ExperimentState.Configuring) }`.
  - *Type:* An interface, extending `State<T>`.
  - *Responsibility:* Hold exactly one current value of type `T`, and,
    critically, notify Compose's snapshot system on every write, so any
    composable that read `.value` (or, via `by`, the delegated property)
    gets scheduled for recomposition.
  - *Depends on:* Being constructed via `mutableStateOf` (there's no public
    constructor to call directly).
  - *Connects to:* Read and written by whatever composable holds it; its
    writes are what actually drive every later recomposition this lesson's
    UI depends on.
  - *Shape:* The concrete presentation-state container this whole Concept
    Unit is about — the literal object standing between "a domain value
    changed" and "the screen redraws."

- **`Button`**
  - *What it is:* The standard Material3 clickable-button composable.
  - *Implementation:*
    ```kotlin
    @Composable
    fun Button(
        onClick: () -> Unit,
        modifier: Modifier = Modifier,
        enabled: Boolean = true,
        content: @Composable RowScope.() -> Unit
    )
    ```
    (`androidx.compose.material3.Button`; other real parameters — `shape`,
    `colors`, `elevation` — exist but go unused here.)
  - *Its use:* One `Button` each for Configure, Start, Stop, and Save.
  - *Type:* A `@Composable` function.
  - *Responsibility:* Render a tappable Material button, call `onClick`
    when tapped, and, whenever `enabled` is `false`, visually gray itself
    out and stop delivering taps to `onClick` at all — not merely a visual
    suggestion, but an actual, enforced refusal at the input-handling
    level.
  - *Depends on:* An `onClick` lambda, and, this lesson's own point of
    interest, an `enabled` value.
  - *Connects to:* `enabled` is computed, per button, directly from the
    current `ExperimentState` — a second, independent read of the same
    domain state `Text` also displays.
  - *Shape:* The concrete input boundary of this whole lesson — the one
    place a human tap actually turns into an attempted state transition.

---

## Concept Unit: The Experiment State Machine — Legal and Illegal Transitions

### The Problem

An experiment has to move through a fixed sequence: it starts out being
configured, gets started, eventually gets stopped, and only then can be
saved. Saving before stopping, or starting twice in a row, doesn't just
produce a wrong answer — it describes something that shouldn't be
representable as having happened at all. What does it take for code to
*refuse* an illegal request outright, rather than silently doing something
arbitrary with it?

Given `StemArea` from Lesson 1 (a fixed, closed set of named things) and
`Instrument` from Lesson 2 (a plain data holder with no rules about how it
changes): does either of those, as they already stand, have any concept of
"this specific change is or isn't allowed right now"? What would have to be
added to make one of them capable of refusing a specific change?

### Introduce the Concept in Isolation

```kotlin
sealed class DoorState {
    data object Closed : DoorState()
    data object Open : DoorState()
    data object Locked : DoorState()
}

fun open(state: DoorState): DoorState = when (state) {
    is DoorState.Closed -> DoorState.Open
    else -> error("Cannot open from $state")
}

fun close(state: DoorState): DoorState = when (state) {
    is DoorState.Open -> DoorState.Closed
    else -> error("Cannot close from $state")
}

fun lock(state: DoorState): DoorState = when (state) {
    is DoorState.Closed -> DoorState.Locked
    else -> error("Cannot lock from $state")
}

fun main() {
    var door: DoorState = DoorState.Closed
    door = open(door)
    println(door)
    door = close(door)
    println(door)
    door = lock(door)
    println(door)
    door = open(door)
    println(door)
}
```

Compile and run:

```
kotlinc Door.kt -include-runtime -d Door.jar
java -jar Door.jar
```

Real output, from running this just now:

```
Open
Closed
Locked
Exception in thread "main" java.lang.IllegalStateException: Cannot open from Locked
	at DoorKt.open(Door.kt:9)
	at DoorKt.main(Door.kt:30)
	at DoorKt.main(Door.kt)
```

This proves the real point, twice over. First: `println(door)` after each
legal transition prints a clean `Open`, `Closed`, `Locked` — not
`DoorState$Open@6bc7c054` or similar — because each state is declared as a
**`data object`**, not a plain `object`; a plain `object` inherits `Any`'s
default `toString`, which prints the class name plus a hash-based identity
string, while `data object` generates a real `toString` returning just the
type's own simple name, the same generation `data class` performs for
fields. Second, and more importantly: the final `open(door)` call, with
`door` now `Locked`, hits the `else -> error("Cannot open from $state")`
branch and throws a real `IllegalStateException`, crashing `main` with a
real, visible stack trace, rather than returning some made-up "what should
opening a locked door even mean" value. This is called a **finite state
machine**: `DoorState` is the finite, closed set of states, and
`open`/`close`/`lock` are the only legal transitions between them, each one
explicit about exactly which states it's even willing to run from.

### Discard the Throwaway Example

`DoorState`, `open`, `close`, `lock`, and `main` are all deleted. The
pattern just proven — states as a sealed class, transitions as functions
that explicitly reject any state they weren't written for — is exactly what
`ExperimentState` reuses next, with real experiment stages instead of a
door's.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/ExperimentState.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** None.

### The New Code

```kotlin
sealed class ExperimentState {
    data object Configuring : ExperimentState()
    data class Running(val startedAtMillis: Long) : ExperimentState()
    data class Stopped(val startedAtMillis: Long, val stoppedAtMillis: Long) : ExperimentState()
    data class Saved(val startedAtMillis: Long, val stoppedAtMillis: Long) : ExperimentState()
}

fun start(state: ExperimentState, nowMillis: Long): ExperimentState = when (state) {
    is ExperimentState.Configuring -> ExperimentState.Running(startedAtMillis = nowMillis)
    else -> error("Cannot start from $state")
}

fun stop(state: ExperimentState, nowMillis: Long): ExperimentState = when (state) {
    is ExperimentState.Running -> ExperimentState.Stopped(state.startedAtMillis, nowMillis)
    else -> error("Cannot stop from $state")
}

fun save(state: ExperimentState): ExperimentState = when (state) {
    is ExperimentState.Stopped -> ExperimentState.Saved(state.startedAtMillis, state.stoppedAtMillis)
    else -> error("Cannot save from $state")
}
```

This file, as shown, is real, shipped project code — not a throwaway lab —
but the Verification Rule still requires proving it actually behaves as
claimed. It was verified this session by a temporary driver (a `main`
function, run once and deleted, never part of this file):

```
kotlinc ExperimentState.kt -include-runtime -d ExperimentState.jar
java -jar ExperimentState.jar
```

Real output, from running this just now:

```
Configuring
Running(startedAtMillis=1000)
Stopped(startedAtMillis=1000, stoppedAtMillis=5000)
Saved(startedAtMillis=1000, stoppedAtMillis=5000)
Exception in thread "main" java.lang.IllegalStateException: Cannot start from Saved(startedAtMillis=1000, stoppedAtMillis=5000)
	at ExperimentStateKt.start(ExperimentState.kt:10)
	at ExperimentStateKt.main(ExperimentState.kt:32)
	at ExperimentStateKt.main(ExperimentState.kt)
```

Notice `Running(startedAtMillis=1000)` printed with its real field shown —
`Running` is a `data class`, not a `data object`, specifically because,
unlike `Closed`/`Open`/`Locked` above, it genuinely needs to carry a value
(when the experiment started) that differs every single time this state is
entered; a `data object` can never hold per-instance data like this, since
it is, by definition, one single unchanging instance.

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption, this step is skipped.

### Mechanical Walkthrough

- `sealed class ExperimentState` — the same construct `StemArea` (Lesson 1)
  and the throwaway `DoorState` lab both already used: a closed,
  compiler-enumerable set of subclasses.
- `data object Configuring : ExperimentState()` — as just proven in the
  lab: a singleton with a real, readable `toString`; chosen here because
  "currently configuring" carries no per-instance data of its own.
- `data class Running(val startedAtMillis: Long) : ExperimentState()` — a
  real `data class` subclass, chosen (unlike `Configuring`) because every
  time an experiment starts, it starts at a genuinely different real-world
  moment, which has to be recorded somewhere.
- `data class Stopped(val startedAtMillis: Long, val stoppedAtMillis: Long) : ExperimentState()`
  — carries both the original start time (still needed to eventually
  compute duration) and the new stop time.
- `data class Saved(val startedAtMillis: Long, val stoppedAtMillis: Long) : ExperimentState()`
  — identical fields to `Stopped`; kept as a genuinely separate state
  (rather than reusing `Stopped` with an extra flag) specifically so the
  *type itself* — not a Boolean buried inside it — is what `start`/`stop`/
  `save`'s own `when` expressions branch on.
- `fun start(state: ExperimentState, nowMillis: Long): ExperimentState = when (state) { ... }`
  — a **transition function**: takes the current state and an attempted
  action's inputs, returns the new state (or refuses). `nowMillis` is
  passed in as a plain parameter, rather than this function calling
  `System.currentTimeMillis()` internally, specifically so a test can call
  `start(someState, nowMillis = 1000L)` with a fixed, predictable value
  instead of a real clock reading that would differ on every real run.
- `is ExperimentState.Configuring -> ExperimentState.Running(startedAtMillis = nowMillis)`
  — the one legal case: constructs a brand-new `Running` value; the
  original `Configuring` instance is not mutated (it has no mutable fields
  to mutate in the first place) — this transition *replaces* the current
  state entirely with a new value, rather than modifying anything in
  place.
- `else -> error("Cannot start from $state")` — as explained in full in the
  Header: every other possible `ExperimentState` (including, notably,
  another `Running`, `Stopped`, or `Saved`) falls into this one branch and
  throws, refusing the action outright.
- `fun stop`/`fun save` — the identical transition-function shape, each
  legal only from exactly one specific prior state (`Running` for `stop`;
  `Stopped` for `save`), each carrying forward the fields it still needs
  from the state it's leaving.

### CS Lens

This is a real, direct implementation of a **finite state machine**, the
same formal model computer science uses to describe any system with a
fixed set of states and well-defined transitions between them — proven,
concretely, by the thrown exception above refusing an out-of-order
transition rather than silently producing nonsense.

Also recognized in: a traffic light's red/yellow/green cycle; a TCP
connection's own real state diagram (`LISTEN`, `SYN_SENT`,
`ESTABLISHED`, `CLOSE_WAIT`, and others, each with explicit legal next
states); a vending machine's coin-then-select-then-dispense sequence;
a regular-expression engine's internal matching automaton.

### SE Lens

**Why throw a real exception on an illegal transition, instead of just
quietly returning the current state unchanged when an invalid action is
attempted?** The silent-no-op alternative is real, and genuinely simpler at
the call site — no exception to ever worry about catching. It was not
chosen because a silent no-op actively hides a real bug: code that calls
`save(configuringState)` by mistake would appear to succeed, and the actual
mistake — calling `save` at the wrong moment — would never surface,
possibly not until a user reports missing data far later, disconnected from
its real cause. Throwing immediately, at the exact call site of the actual
mistake, costs real ceremony (every caller now has to either be certain the
transition is legal, or handle a possible exception) — a cost this
project accepts on purpose, in exchange for bugs surfacing at their true
origin instead of somewhere downstream.

---

## Concept Unit: Presentation State — Letting Compose Watch a Value Change

### The Problem

`ExperimentState` and its transition functions are complete, real, and
already verified — but nothing in this whole app has anywhere to actually
*hold* a live, changing `ExperimentState` value yet, the way `StemArea`
never needed to change after `HomeScreen` first composed, and
`Instrument`'s availability, once checked, never changed either. This is a
genuinely new situation: a value that starts one way and needs to visibly,
repeatedly change *while the screen stays up*, in response to taps. Compose
already recomposes automatically when `navController`'s internal state
changes (proven back in Lesson 1) — what's the equivalent mechanism for a
plain value this app's own code owns, instead of one built into
`NavController`?

### Introduce the Concept in Isolation

Same honesty note as every other Compose-dependent unit in this
curriculum: this cannot run in bare `kotlinc`, since `mutableStateOf`'s
*effect* is only observable inside a real, running composition; the result
below is a confident, accurate prediction of `androidx.compose.runtime`'s
documented contract, not a screenshot from an execution this session
performed.

```kotlin
@Composable
fun CounterDemo() {
    var count by remember { mutableStateOf(0) }
    Column {
        Text("Count: $count")
        Button(onClick = { count = count + 1 }) {
            Text("Increment")
        }
    }
}
```

Predicted result: on first showing, "Count: 0" appears above an "Increment"
button. Tapping the button once changes what's displayed to "Count: 1",
with no further code written anywhere to make that redraw happen. Trace
precisely why: `count` is declared `by remember { mutableStateOf(0) }` —
`mutableStateOf(0)` builds a real `MutableState<Int>`; `remember { ... }`
(met already in Lesson 1) ensures that *same* `MutableState` instance
survives every recomposition of `CounterDemo`, instead of a fresh one
resetting to `0` each time; `by` delegates `count`'s own reads and writes
straight to that `MutableState`'s `value` property, so `count = count + 1`
inside `onClick` is really calling `MutableState.value`'s setter. That
setter is precisely what notifies Compose's snapshot system that something
changed — which is what schedules `CounterDemo` (specifically, the part of
it that actually reads `count`, which is `Text("Count: $count")`) to
recompose and show the new value.

### Discard the Throwaway Example

`CounterDemo` is deleted. `mutableStateOf`, `remember`, and the `by`
delegation pattern are not — they're reused directly, next, to hold this
app's real `ExperimentState`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/ExperimentWorkspace.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** `ExperimentState`, `start`, `stop`, `save`, from the
  previous unit.

### The New Code

```kotlin
@Composable
fun ExperimentWorkspace() {
    var state: ExperimentState by remember { mutableStateOf(ExperimentState.Configuring) }
    // buttons and display wired to `state` in the next unit
}
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption, this step is skipped.

### Mechanical Walkthrough

- `var state: ExperimentState by remember { mutableStateOf(ExperimentState.Configuring) }`
  — reading right to left: `mutableStateOf(ExperimentState.Configuring)`
  builds a `MutableState<ExperimentState>` whose initial value is the
  `Configuring` singleton from the previous unit; `remember { ... }`
  (reappearing from Lesson 1, given its full, real explanation again per
  this curriculum's own Repetition Rule) ensures that one `MutableState`
  instance survives recomposition; `by` delegates `state`'s own reads and
  writes to it — exactly the pattern the isolated lab above just proved,
  applied here to this lesson's own real domain state instead of a plain
  `Int` counter. `var`, not `val`, is required specifically because this
  property will be *reassigned* (`state = start(state, ...)`, next unit) —
  a `val` would make that reassignment a compile error, even though the
  underlying `MutableState` object itself is never literally mutated in
  place; `by` delegation makes `state = ...` compile down to a call to the
  delegate's `setValue`, not a direct field write.

### CS Lens

This is the same **observer pattern** this curriculum has already used
once, implicitly, through `NavController`'s own internal state
(Lesson 1) — a subject (`MutableState`) that notifies interested observers
(here, Compose's own recomposition scheduler) whenever it changes, without
either side needing a direct reference to the other's internals.

### SE Lens

**Why does `ExperimentState` (the domain model, from the previous unit)
have zero dependency on Compose, while `ExperimentWorkspace` (this unit)
depends on both?** This is precisely the "separation of presentation state
from domain state" this lesson's own outline names as its engineering
point. The alternative — making `ExperimentState` itself a
`MutableState`-aware type, or building `mutableStateOf` calls directly into
the transition functions — was not chosen, because it would mean
`ExperimentState`, `start`, `stop`, and `save` could never be reused, or
even compiled, anywhere Compose isn't present: a future command-line
analysis tool, a unit test (once Lesson 10 builds a test harness), or an
entirely different UI framework, would all be blocked from using this
app's own core experiment logic. Keeping `ExperimentState` Compose-free
costs exactly one extra layer — `ExperimentWorkspace` wrapping a plain
domain value in `mutableStateOf` itself, rather than the domain value
already being observable on its own — in exchange for the domain logic
being usable literally anywhere Kotlin runs.

---

## Concept Unit: Building the Workspace Screen

### The Problem

`ExperimentWorkspace` now holds a real, changing `ExperimentState` — but
nothing yet displays it, and nothing yet lets a real tap call `start`,
`stop`, or `save`. Given that calling an illegal transition throws a real
exception (proven in this lesson's first unit), should this screen let a
user tap "Save" while still `Configuring`, and then handle the resulting
crash — or is there a way to make the illegal tap simply impossible to
perform in the first place?

### The New Code

```kotlin
@Composable
fun ExperimentWorkspace() {
    var state: ExperimentState by remember { mutableStateOf(ExperimentState.Configuring) }

    Column {
        Text(text = "Current state: $state")

        Button(
            onClick = { state = start(state, nowMillis = System.currentTimeMillis()) },
            enabled = state is ExperimentState.Configuring
        ) { Text("Start") }

        Button(
            onClick = { state = stop(state, nowMillis = System.currentTimeMillis()) },
            enabled = state is ExperimentState.Running
        ) { Text("Stop") }

        Button(
            onClick = { state = save(state) },
            enabled = state is ExperimentState.Stopped
        ) { Text("Save") }
    }
}
```

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/ExperimentWorkspace.kt`; modified —
  `app/src/main/java/com/stemlab/app/MainActivity.kt` (`AreaScreen` now
  shows `ExperimentWorkspace()` for `StemArea.Experiments`, alongside the
  existing `InstrumentDashboard()` branch for `StemArea.Instruments`).
- **Change type:** Refactor (both files).
- **Location:** `ExperimentWorkspace`'s previously-empty body;
  `AreaScreen`'s existing `if`/`else` branch, extended with one more case.
- **Dependencies:** `ExperimentState`, `start`, `stop`, `save`.

### The Updated Project

`ExperimentWorkspace.kt`, in full:

```kotlin
 1  @Composable
 2  fun ExperimentWorkspace() {
 3      var state: ExperimentState by remember { mutableStateOf(ExperimentState.Configuring) }
 4
 5      Column {
 6          Text(text = "Current state: $state")                                          // ← new
 7
 8          Button(                                                                        // ← new
 9              onClick = { state = start(state, nowMillis = System.currentTimeMillis()) }, // ← new
10             enabled = state is ExperimentState.Configuring                              // ← new
11         ) { Text("Start") }                                                             // ← new
12
13         Button(                                                                         // ← new
14             onClick = { state = stop(state, nowMillis = System.currentTimeMillis()) },   // ← new
15             enabled = state is ExperimentState.Running                                   // ← new
16         ) { Text("Stop") }                                                               // ← new
17
18         Button(                                                                          // ← new
19             onClick = { state = save(state) },                                            // ← new
20             enabled = state is ExperimentState.Stopped                                    // ← new
21         ) { Text("Save") }                                                                // ← new
22     }
23 }
```

`ExperimentWorkspace` is now a complete, self-contained screen: it owns its
own presentation state (line 3), displays it (line 6), and offers exactly
three actions, each individually enabled or disabled based on a live read
of that same state (lines 10, 15, 20) — every illegal transition this
lesson's first unit proved throws a real exception is now, separately,
prevented from ever being *attempted* through this UI at all.

And `AreaScreen`, in `MainActivity.kt`, gains one more branch:

```kotlin
 1  @Composable
 2  fun AreaScreen(area: StemArea) {
 3      Scaffold(
 4          topBar = { TopAppBar(title = { Text(area.label) }) }
 5      ) { innerPadding ->
 6          Box(modifier = Modifier.padding(innerPadding)) {
 7              when (area) {                                          // ← changed: if/else → when
 8                  StemArea.Instruments -> InstrumentDashboard()
 9                  StemArea.Experiments -> ExperimentWorkspace()       // ← new
10                 else -> Text(text = "${area.label} — coming soon")  // ← changed
11             }
12         }
13     }
14 }
```

### Mechanical Walkthrough

- `Text(text = "Current state: $state")` — a **string template**
  (reappearing from Lesson 1's `"area/${area.id}"`) reads `state`'s live
  value; because `Text` is called from inside the same composable that owns
  `state`, every write to `state` schedules this exact call to re-run with
  the new value.
- `onClick = { state = start(state, nowMillis = System.currentTimeMillis()) }`
  — `System.currentTimeMillis()` (a real, standard JVM/Android API,
  `java.lang.System`'s static method returning the current wall-clock time
  in milliseconds since the Unix epoch) supplies a real timestamp, unlike
  the lab's fixed `1000L`; `start(...)`'s result is assigned back to
  `state`, which, per the previous unit, routes through `MutableState`'s
  real setter and triggers recomposition.
- `enabled = state is ExperimentState.Configuring` — a **type check
  expression** (Kotlin's `is` operator, reappearing from this lesson's own
  `when (state) { is ExperimentState.Configuring -> ... }` branches, here
  used directly as a `Boolean`-producing expression rather than inside a
  `when`): evaluates to `true` only while `state`'s actual runtime type is
  `Configuring`, which is exactly, and only, when `start` is legal to call.
- `enabled = state is ExperimentState.Running` / `enabled = state is ExperimentState.Stopped`
  — the identical pattern, once per remaining button, each checking exactly
  the one state its own transition function requires.
- `when (area) { StemArea.Instruments -> ...; StemArea.Experiments -> ...; else -> ... }`
  — Kotlin's `when` used as a multi-branch expression (a generalization of
  the two-branch `if`/`else` Lesson 2 used here); because `StemArea` is a
  `sealed class` (Lesson 1), the compiler could, in principle, require every
  subclass to be handled — this `when` instead keeps a deliberate `else`,
  since `Data` and `Analysis` still have no real screen of their own yet.

### CS Lens

Disabling a button based on a live state check, rather than allowing the
tap and catching a resulting failure, is a real instance of **guarding
preconditions at the boundary** — the same principle behind disabling a
"Submit" button until a form is valid, or graying out "Undo" when there's
nothing to undo. The illegal action is made unreachable through the normal
interface, rather than reachable-and-then-rejected.

### SE Lens

**Why keep the `error(...)` throw inside `start`/`stop`/`save` at all, now
that the UI's own `enabled` checks make it unreachable through normal use?**
The throw was not removed, because "unreachable through this one UI" is not
the same guarantee as "unreachable, period" — this curriculum's own outline
already commits to a future test harness (Lesson 10) that will call
`start`/`stop`/`save` directly, with no UI involved at all, and a future
screen or feature this curriculum hasn't built yet could call them too.
Removing the throw because *today's* UI happens to prevent the mistake
would silently reopen the exact bug the first Concept Unit's SE Lens argued
against, for any caller that isn't this specific screen — the two
protections (UI-level prevention, domain-level rejection) are deliberately
redundant, each covering a boundary the other doesn't.

---

## Connect the Pieces

One trace through this lesson: `ExperimentState` gave "which stage this
experiment is in" a real, closed, compiler-checked shape, and `start`/
`stop`/`save` gave it real, enforced rules about which stage can follow
which — proven, concretely, by a real thrown exception when those rules
were broken on purpose. `ExperimentWorkspace` then wrapped that pure domain
value in `mutableStateOf`, via `remember`, so a plain Kotlin assignment to
`state` could drive real, automatic Compose recomposition — the same
mechanism the isolated `CounterDemo` lab proved on a trivial integer,
applied here to a real four-stage experiment. Finally, each button's own
`enabled` check read that same live state a second, independent way,
closing off illegal taps before they ever reach the transition functions
that would otherwise throw. Tap "Start" on the real Experiments screen now,
and — for the first time in this curriculum — a real, generic experiment
actually runs.

Next: the experiment registry — making *which* experiments exist a
discoverable, dynamic fact instead of a single hardcoded workspace.
