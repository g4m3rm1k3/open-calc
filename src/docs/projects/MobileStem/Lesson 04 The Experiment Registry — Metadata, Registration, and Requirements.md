# Lesson 4: The Experiment Registry — Making "What Experiments Exist" a Fact, Not Hardcoded Navigation

**What you will build:** Tapping "Experiments" now shows a real list of
registered experiments (one, for now — "Generic Experiment," wrapping
Lesson 3's own workspace), each showing its title, description, and whether
this specific device can actually run it, given what it requires. Tapping
one opens that specific experiment's workspace. The transferable problem:
Lesson 3 wired exactly one experiment directly into `AreaScreen`'s
navigation. A second experiment, today, would mean editing `AreaScreen`
itself again — and a third, and a fourth. Is there a way for "which
experiments exist" to be a fact the app can discover and list, rather than
a fact baked into a specific screen's own code?

**What you need to know first:** Lesson 1 of this curriculum (navigation,
routes, `sealed class`). Lesson 2 (`interface`, `CapabilityChecker`,
`data class` domain models). Lesson 3 (`ExperimentWorkspace`,
`ExperimentState`).

**Terms used in this lesson:**
- **Registry** — an object whose entire job is holding a collection of
  things other code can add to and later ask about, without the registry
  itself needing to know in advance what, or how many, things it will ever
  hold.
- **Dynamic registration** — the act of adding an entry to a registry at
  runtime, from the code that defines that entry, rather than the registry
  itself listing every entry by name inside its own source file.
- **Open/closed principle** — a real, named software engineering principle:
  code should be **open for extension** (new behavior can be added) but
  **closed for modification** (adding that new behavior doesn't require
  editing the existing, already-working code). It exists because every
  edit to already-working, already-tested code is a fresh chance to break
  it; a design that never needs that edit in the first place removes the
  risk entirely for that specific kind of change.
- **Requirement** — a fact an `ExperimentDefinition` states about itself:
  which instruments (by `Instrument.id`, from Lesson 2's catalog) it needs
  in order to actually run, distinct from whether this specific device
  happens to have them.

**Objects and methods used:**

- **`ExperimentDefinition`** (this lesson's own new domain model)
  - *What it is:* A plain data holder describing one *kind* of experiment
    this app knows how to run — its identity, its human-facing description,
    and what it requires — without being the experiment itself, or any UI
    for it.
  - *Implementation:*
    ```kotlin
    data class ExperimentDefinition(
        val id: String,
        val title: String,
        val description: String,
        val category: String,
        val requiredInstrumentIds: List<String>
    )
    ```
  - *Its use:* `ExperimentRegistry` holds a growing collection of these;
    `isRunnable` reads `requiredInstrumentIds`.
  - *Type:* A `data class`, the same construct `Instrument` (Lesson 2) and
    `ExperimentState`'s per-state variants (Lesson 3) already used.
  - *Responsibility:* Hold exactly the facts needed to list, describe, and
    check the requirements of one experiment kind — nothing about how that
    experiment actually runs.
  - *Depends on:* Nothing beyond its own constructor arguments.
  - *Connects to:* Constructed once per experiment kind; read by
    `ExperimentListScreen` (for display) and `isRunnable` (for requirement
    checking, cross-referencing `InstrumentCatalog` from Lesson 2).
  - *Shape:* A pure domain-layer value type, exactly like `Instrument` —
    no dependency on Android, Compose, or the registry that holds it.

- **`ExperimentRegistry`** (this lesson's own new registry)
  - *What it is:* The one place this app tracks every experiment kind that
    exists, built specifically so adding a new kind never requires editing
    this object's own source.
  - *Implementation:*
    ```kotlin
    object ExperimentRegistry {
        private val definitions = mutableListOf<ExperimentDefinition>()

        fun register(definition: ExperimentDefinition) {
            definitions.add(definition)
        }

        fun all(): List<ExperimentDefinition> = definitions.toList()
    }
    ```
  - *Its use:* `registerBuiltInExperiments()` (below) calls `register`
    once, for "Generic Experiment"; `ExperimentListScreen` calls `all()`.
  - *Type:* A singleton `object`.
  - *Responsibility:* Accept new `ExperimentDefinition`s from anywhere, at
    any time before they're first listed, and hand back the complete,
    current set on demand — nothing about validating, ranking, or
    filtering them.
  - *Depends on:* Nothing to construct (it's a singleton); each call to
    `register` depends on a real `ExperimentDefinition`.
  - *Connects to:* Written to by any code that calls `register` (today,
    only `registerBuiltInExperiments`; later lessons and, eventually,
    user-defined experiments per this curriculum's own outline, could call
    it too); read by `ExperimentListScreen`.
  - *Shape:* The literal open/closed seam this lesson is about — every
    future experiment this entire curriculum ever adds registers itself
    here, and this object's own three lines never have to change again to
    support it.

- **`MutableList<T>.add`**
  - *What it is:* The standard Kotlin/Java method that appends one element
    to a mutable list, in place.
  - *Implementation:* `fun add(element: E): Boolean`, part of the
    `MutableList<E>` interface (`kotlin.collections.MutableList`, backed at
    runtime by `java.util.ArrayList` for a list built with
    `mutableListOf()`).
  - *Its use:* `ExperimentRegistry.register` calls it on its own private
    `definitions` list.
  - *Type:* An instance method on `MutableList<E>`.
  - *Responsibility:* Grow the list by exactly one element, at the end,
    returning `true` (per the real `Collection.add` contract, `true` means
    "the collection changed as a result" — always true for a plain list
    append, since a list allows duplicates and always accepts a new
    element).
  - *Depends on:* An `element` to append.
  - *Connects to:* Called from `register`; the list it mutates is read back
    (as an immutable copy) by `all()`.
  - *Shape:* The actual mutation this whole registry is built around —
    private to `ExperimentRegistry`, never exposed directly to any caller.

- **`List<T>.all`**
  - *What it is:* A standard Kotlin stdlib function checking whether every
    element of a collection satisfies a given condition.
  - *Implementation:* `inline fun <T> Iterable<T>.all(predicate: (T) -> Boolean): Boolean`,
    in `kotlin.collections`.
  - *Its use:* `isRunnable` calls it on `requiredInstrumentIds` to check
    every required instrument is available.
  - *Type:* An inline extension function on `Iterable<T>`.
  - *Responsibility:* Evaluate `predicate` against every element in order,
    short-circuiting to `false` the moment any element fails it, and
    returning `true` only if every single element passed (including,
    vacuously, when the collection is empty — an empty list's `all` is
    always `true`, since there's nothing to fail the check).
  - *Depends on:* A `predicate` lambda.
  - *Connects to:* Called from `isRunnable`, once per experiment
    definition being checked; its `predicate` itself calls
    `CapabilityChecker.isAvailable` (Lesson 2) once per required
    instrument.
  - *Shape:* The exact mechanism turning a *list* of individual
    requirements into one combined yes/no answer.

---

## Concept Unit: The Registry — Open for Extension, Closed for Modification

### The Problem

`ExperimentDefinition` alone is just a data shape — something still has to
hold the actual, growing collection of them. A `listOf(...)` the way
`StemArea.all` and `InstrumentCatalog.all` were both built (Lessons 1 and
2) would work today, with one real cost: every one of those was written as
a single, fixed literal list, edited by hand each time a new entry was
needed. This curriculum's own later lessons, and this project's own future
growth, will keep adding new kinds of experiments — should the list holding
them keep being edited by hand forever, or can the *code defining* a new
experiment be the thing that adds itself to the list, without touching
whatever holds the list at all?

Given `mutableListOf` (a real, already-available Kotlin stdlib function you
may not have used yet in this curriculum, alongside the `listOf` already
met twice) — what would you try writing first, for "a shared place other
code can add entries to, whenever it wants, without needing to be inside
the same file"?

### Introduce the Concept in Isolation

```kotlin
interface Plugin {
    val name: String
    fun run(): String
}

object PluginRegistry {
    private val plugins = mutableListOf<Plugin>()
    fun register(plugin: Plugin) {
        plugins.add(plugin)
    }
    fun all(): List<Plugin> = plugins.toList()
}

class GreetingPlugin : Plugin {
    override val name = "Greeting"
    override fun run() = "Hello from a plugin!"
}

class FarewellPlugin : Plugin {
    override val name = "Farewell"
    override fun run() = "Goodbye from a plugin!"
}

fun main() {
    PluginRegistry.register(GreetingPlugin())
    PluginRegistry.register(FarewellPlugin())
    PluginRegistry.all().forEach { plugin ->
        println("${plugin.name}: ${plugin.run()}")
    }
    println("Registered count: ${PluginRegistry.all().size}")
}
```

Compile and run:

```
kotlinc Plugin.kt -include-runtime -d Plugin.jar
java -jar Plugin.jar
```

Real output, from running this just now:

```
Greeting: Hello from a plugin!
Farewell: Goodbye from a plugin!
Registered count: 2
```

This proves the real point: `PluginRegistry`'s own source code — every line
of it — was written once, before `GreetingPlugin` or `FarewellPlugin` ever
existed, and never changed to accommodate either one. Both plugin classes
called `PluginRegistry.register(...)` themselves, from `main`, and
`PluginRegistry.all()` correctly reflects both, in registration order. Add
a third `class ReminderPlugin : Plugin { ... }` and one more `register(...)`
call mentally: nothing about `PluginRegistry`'s own three-line body would
need to change for it to work — this is called the **open/closed
principle**, and this registry shape is a direct, working demonstration of
it: open for new `Plugin`s to be added, closed against ever needing its own
source edited to add one.

### Discard the Throwaway Example

`Plugin`, `PluginRegistry`, `GreetingPlugin`, `FarewellPlugin`, and `main`
are all deleted. The registry shape just proven — a private mutable list,
a `register` function to append to it, an `all()` function returning a
read-only view — is exactly what `ExperimentRegistry` reuses next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/ExperimentRegistry.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** `ExperimentDefinition` (declared in the same file, for
  this lesson).

### The New Code

```kotlin
data class ExperimentDefinition(
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val requiredInstrumentIds: List<String>
)

object ExperimentRegistry {
    private val definitions = mutableListOf<ExperimentDefinition>()

    fun register(definition: ExperimentDefinition) {
        definitions.add(definition)
    }

    fun all(): List<ExperimentDefinition> = definitions.toList()
}
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption, this step is skipped.

### Mechanical Walkthrough

- `data class ExperimentDefinition(...)` — as explained in full in the
  Header; five constructor properties, no behavior of its own.
- `object ExperimentRegistry` — a singleton, the same construct
  `InstrumentCatalog` (Lesson 2) already used to hold a shared list —
  the genuine difference here, covered next, is that this list starts
  empty and grows at runtime, rather than being fully populated as a
  single literal.
- `private val definitions = mutableListOf<ExperimentDefinition>()` —
  `mutableListOf<T>()` (a real Kotlin stdlib function,
  `fun <T> mutableListOf(): MutableList<T>`) builds a genuinely empty,
  growable list; `private` means no code outside `ExperimentRegistry`
  itself can read or mutate `definitions` directly — every interaction has
  to go through `register` or `all()`.
- `fun register(definition: ExperimentDefinition) { definitions.add(definition) }`
  — as explained in full in the Header (`MutableList<T>.add`); this is the
  *only* way anything outside this file can ever add to `definitions`.
- `fun all(): List<ExperimentDefinition> = definitions.toList()` —
  `toList()` (a real stdlib function, `fun <T> Iterable<T>.toList(): List<T>`)
  builds a brand-new, independent, immutable copy of `definitions`'
  current contents. Returning a *copy*, rather than `definitions` itself,
  matters specifically because `definitions`' own declared type is
  `MutableList<ExperimentDefinition>`, but `all()`'s declared return type
  is the plain, read-only `List<ExperimentDefinition>` — if `all()`
  returned `definitions` directly, its caller could `as`-cast the result
  back to `MutableList` and call `.add(...)` on it from *outside*
  `ExperimentRegistry`, silently defeating the whole point of `register`
  being the one sanctioned entry point.

### CS Lens

This registry shape is a real, named design pattern: the **Registry
pattern** — a well-known object whose whole job is being a shared lookup
point for other objects that register themselves with it, so unrelated
parts of a system can find each other without holding direct references to
one another ahead of time.

Also recognized in: a plugin-based text editor or IDE, where each
extension registers its own commands with a central command registry; a
dependency-injection container, where classes register how they should be
constructed; a game engine's component registry, where new component types
register themselves without the engine's own core loop needing to know
about each one by name.

### SE Lens

**Why `object ExperimentRegistry` — a singleton — rather than, say, a
`class ExperimentRegistry` that `StemLabApp` constructs once and passes
around explicitly?** The explicit-instance alternative is real, and is
exactly the shape Lesson 9's planned dependency-injection lab (a simulated
`CapabilityChecker`, passed in rather than looked up globally) already
commits this curriculum to caring about — global singletons make swapping
in a fake, isolated version for testing harder, not easier, since every
caller reaches `ExperimentRegistry` the same fixed way with no seam to
intercept. It's chosen here anyway, for this specific registry, because
*which experiment kinds exist* is a genuine, single, whole-app-wide fact —
unlike `CapabilityChecker`, there's no real scenario in this curriculum
where two different parts of the app should see two different, disagreeing
sets of registered experiments. The cost accepted here: if a future lesson
*does* need to test registry behavior in isolation (registering a fake
experiment without polluting the real, shared list), this specific
singleton shape will need to change — a real, named tradeoff, not an
oversight.

---

## Concept Unit: Requirement Checking — Is This Experiment Actually Runnable Here?

### The Problem

`ExperimentDefinition.requiredInstrumentIds` can already name, say,
`listOf("accelerometer", "gyroscope")` — but nothing yet connects that list
to Lesson 2's `CapabilityChecker`, the one piece of this app that actually
knows what hardware a real device has. Without that connection, this app
could list an experiment as available on a phone that's physically missing
half of what it needs.

### Introduce the Concept in Isolation

This reuses `CapabilityChecker` (Lesson 2) directly rather than introducing
a new construct, so there is no new throwaway lab for a new language
feature here — instead, the logic itself is verified for real, standing
alone, before it's wired into any UI, using a **fake** implementation of
`CapabilityChecker` built specifically for this verification (not a
throwaway example of a *language* concept, but a genuine, real technique:
testing logic that depends on an interface using a fake, controllable
implementation of that interface, instead of the real, hardware-backed
one):

```kotlin
class FakeCapabilityChecker(private val availableFeatures: Set<String>) : CapabilityChecker {
    override fun isAvailable(featureName: String): Boolean = featureName in availableFeatures
}

fun isRunnable(definition: ExperimentDefinition, checker: CapabilityChecker): Boolean {
    return definition.requiredInstrumentIds.all { instrumentId ->
        val instrument = InstrumentCatalog.all.first { it.id == instrumentId }
        checker.isAvailable(instrument.requiredFeature)
    }
}

fun main() {
    val checker = FakeCapabilityChecker(availableFeatures = setOf("android.hardware.sensor.accelerometer"))
    val generic = ExperimentDefinition("generic", "Generic Experiment", "d", "General", emptyList())
    val motion = ExperimentDefinition("motion", "Motion Test", "d", "Motion", listOf("accelerometer", "gyroscope"))
    println(isRunnable(generic, checker))
    println(isRunnable(motion, checker))
}
```

Compile and run (against a scratch copy of `CapabilityChecker`, `Instrument`,
and `InstrumentCatalog` from Lessons 2, matching the real project files
exactly):

```
kotlinc Runnable.kt -include-runtime -d Runnable.jar
java -jar Runnable.jar
```

Real output, from running this just now:

```
true
false
```

This proves both real cases at once: `generic`'s `requiredInstrumentIds` is
`emptyList()`, and `List.all` (explained in full in the Header) returns
`true` on an empty list vacuously — an experiment with no requirements is
always runnable. `motion` requires both `"accelerometer"` and
`"gyroscope"`; `checker` (the fake) only reports the accelerometer's real
feature string as available — `all` short-circuits to `false` the moment
it reaches the gyroscope requirement and finds it unavailable. This also
proves, directly, the exact payoff Lesson 2's own SE Lens argued for
ahead of time: because `isRunnable` depends on the `CapabilityChecker`
*interface*, not on `SystemCapabilityChecker` specifically, this real
requirement-checking logic could be verified this session with zero Android
dependency at all, using nothing but a fake, in-memory implementation.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/ExperimentRegistry.kt` (add
  `isRunnable`).
- **Change type:** Add (one new top-level function in the existing file).
- **Location:** Below `ExperimentRegistry`'s closing brace.
- **Dependencies:** `CapabilityChecker` and `InstrumentCatalog`, both from
  Lesson 2.

### The Updated Project

`ExperimentRegistry.kt`, in full, after this addition:

```kotlin
 1  data class ExperimentDefinition(
 2      val id: String,
 3      val title: String,
 4      val description: String,
 5      val category: String,
 6      val requiredInstrumentIds: List<String>
 7  )
 8
 9  object ExperimentRegistry {
10     private val definitions = mutableListOf<ExperimentDefinition>()
11
12     fun register(definition: ExperimentDefinition) {
13         definitions.add(definition)
14     }
15
16     fun all(): List<ExperimentDefinition> = definitions.toList()
17 }
18
19 fun isRunnable(definition: ExperimentDefinition, checker: CapabilityChecker): Boolean {  // ← new
20     return definition.requiredInstrumentIds.all { instrumentId ->                        // ← new
21         val instrument = InstrumentCatalog.all.first { it.id == instrumentId }            // ← new
22         checker.isAvailable(instrument.requiredFeature)                                   // ← new
23     }                                                                                      // ← new
24 }                                                                                          // ← new
```

`ExperimentRegistry.kt` now defines the complete data shape for an
experiment kind, the registry holding them, and the one function able to
answer, for any of them, "can this specific device actually run this" —
with zero UI code anywhere in this file.

### Mechanical Walkthrough

- `fun isRunnable(definition: ExperimentDefinition, checker: CapabilityChecker): Boolean`
  — takes both the definition being checked and a `CapabilityChecker`
  (the interface type, not a specific implementation) as explicit
  parameters, the same "depend on the interface, not the concrete type"
  shape `InstrumentDashboard` already used in Lesson 2.
- `definition.requiredInstrumentIds.all { instrumentId -> ... }` — as
  explained in full in the Header (`List<T>.all`); iterates every required
  instrument id, short-circuiting `false` on the first one that fails.
- `InstrumentCatalog.all.first { it.id == instrumentId }` — the identical
  `first { ... }` pattern Lesson 1's navigation route resolution already
  used (`StemArea.all.first { it.id == areaId }`), here reused to look up
  the full `Instrument` (and, specifically, its `requiredFeature` string)
  from just its `id`.
- `checker.isAvailable(instrument.requiredFeature)` — calls the interface
  method (Lesson 2) exactly the way `InstrumentDashboard` already did,
  here through whatever `checker` this function's own caller passed in —
  today, either the real `SystemCapabilityChecker` or, as just proven, a
  `FakeCapabilityChecker` built purely for verification.

### CS Lens

Checking every element of a requirement list and combining the results with
a logical AND (which is what `all`'s short-circuiting behavior really is,
under the hood) is the same **universal quantification** ("for all x, P(x)
holds") from formal logic and discrete mathematics — the same idea a
database's `NOT EXISTS` subquery, or a spreadsheet's `AND()` function
across a range, both express in their own syntax.

### SE Lens

**Why verify `isRunnable` with a `FakeCapabilityChecker` instead of just
trusting the logic looks right, or waiting until this curriculum's Lesson
10 test harness exists to check it formally?** Waiting was a real option,
and would have been cheaper right now — but it was not chosen, because
`isRunnable` combines two separate pieces of logic (`all`'s short-circuit
behavior, and the id-to-feature-string lookup through `InstrumentCatalog`)
in a way that's genuinely easy to get subtly wrong (a bug that finds the
*wrong* instrument for a given id, for instance, would silently make an
experiment appear runnable or not runnable for the wrong reason), and this
project's own Verification Rule specifically requires real proof for
exactly this kind of case — an unaided prediction here would be a real
guess, not a confident one. The genuine cost paid: this fake, along with
copies of `CapabilityChecker`, `Instrument`, and `InstrumentCatalog`, had
to be reconstructed once, this session, purely to run the check — Lesson 10
will let this same kind of verification live permanently inside the
project itself instead of a throwaway scratch file.

---

## Concept Unit: The Experiment List Screen and Dynamic Navigation

### The Problem

`ExperimentRegistry` and `isRunnable` are both real and verified — but
`AreaScreen`, from Lesson 3, still shows `ExperimentWorkspace()` directly
the moment "Experiments" is tapped, with no list, and no requirement
information, in between. And nothing has actually called
`ExperimentRegistry.register` yet with a real definition — the registry, as
it stands right now, is empty.

### The New Code

```kotlin
fun registerBuiltInExperiments() {
    ExperimentRegistry.register(
        ExperimentDefinition(
            id = "generic",
            title = "Generic Experiment",
            description = "A minimal configure/run/stop/save workflow with no real measurement yet.",
            category = "General",
            requiredInstrumentIds = emptyList()
        )
    )
}
```

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/ExperimentRegistry.kt` (add
  `registerBuiltInExperiments`); modified —
  `app/src/main/java/com/stemlab/app/MainActivity.kt`
  (`StemLabApp` calls `registerBuiltInExperiments()` once; a new
  `"experiment/{experimentId}"` route is registered; `AreaScreen`'s
  `Experiments` branch now shows a new `ExperimentListScreen`, and no
  longer calls `ExperimentWorkspace()` directly).
- **Change type:** Add (`registerBuiltInExperiments`, the new route,
  `ExperimentListScreen`); refactor (`StemLabApp`, `AreaScreen`).
- **Location:** `StemLabApp`'s body, before its `NavHost` call; a new
  `composable(...)` block inside that `NavHost`; `AreaScreen`'s `when`.
- **Dependencies:** Everything from this lesson's first two units;
  `ExperimentWorkspace` and `Card` (Lessons 3 and 2).

### The Updated Project

`ExperimentListScreen`, a new composable in a new file,
`ExperimentListScreen.kt`:

```kotlin
 1  @Composable
 2  fun ExperimentListScreen(onExperimentClick: (ExperimentDefinition) -> Unit) {
 3      val context = LocalContext.current
 4      val checker: CapabilityChecker = remember { SystemCapabilityChecker(context) }
 5      Column {
 6          ExperimentRegistry.all().forEach { definition ->
 7              val runnable = isRunnable(definition, checker)
 8              Card(
 9                  modifier = Modifier
10                     .fillMaxWidth()
11                     .padding(8.dp)
12                     .clickable(enabled = runnable) { onExperimentClick(definition) }
13             ) {
14                 Column(modifier = Modifier.padding(16.dp)) {
15                     Text(text = definition.title, style = MaterialTheme.typography.titleMedium)
16                     Text(text = definition.description)
17                     Text(text = if (runnable) "Ready to run" else "Missing required instrument")
18                 }
19             }
20         }
21     }
22 }
```

And `MainActivity.kt`'s `StemLabApp`, `AreaScreen`, and
`registerBuiltInExperiments` (this last one now living in
`ExperimentRegistry.kt`), together, in full:

```kotlin
 1  @Composable
 2  fun StemLabApp() {
 3      registerBuiltInExperiments()                                             // ← new
 4      val navController = rememberNavController()
 5      NavHost(navController = navController, startDestination = "home") {
 6          composable("home") {
 7              HomeScreen(
 8                  onAreaClick = { area -> navController.navigate("area/${area.id}") }
 9              )
10         }
11         composable("area/{areaId}") { backStackEntry ->
12             val areaId = backStackEntry.arguments?.getString("areaId")
13             val area = StemArea.all.first { it.id == areaId }
14             AreaScreen(
15                 area = area,
16                 onExperimentClick = { definition ->                             // ← new
17                     navController.navigate("experiment/${definition.id}")       // ← new
18                 }                                                               // ← new
19             )
20         }
21         composable("experiment/{experimentId}") {                              // ← new
22             ExperimentWorkspace()                                              // ← new
23         }                                                                      // ← new
24     }
25 }
26
27 @Composable
28 fun AreaScreen(area: StemArea, onExperimentClick: (ExperimentDefinition) -> Unit) { // ← changed: new parameter
29     Scaffold(
30         topBar = { TopAppBar(title = { Text(area.label) }) }
31     ) { innerPadding ->
32         Box(modifier = Modifier.padding(innerPadding)) {
33             when (area) {
34                 StemArea.Instruments -> InstrumentDashboard()
35                 StemArea.Experiments -> ExperimentListScreen(onExperimentClick) // ← changed: was ExperimentWorkspace()
36                 else -> Text(text = "${area.label} — coming soon")
37             }
38         }
39     }
40 }
```

`AreaScreen` now takes a second parameter, threaded in from `StemLabApp`,
exactly the same shape `HomeScreen`'s `onAreaClick` already established in
Lesson 1 — tapping any listed, runnable experiment now navigates to a real
route carrying that specific experiment's id, landing on
`ExperimentWorkspace` (which, for now, still ignores which experiment id it
was given — a real, honest limitation this lesson does not yet resolve,
left for Lesson 5's data model to address).

### Mechanical Walkthrough

- `fun registerBuiltInExperiments()` — an ordinary top-level function
  (not a composable, not part of any class) whose only job is calling
  `ExperimentRegistry.register` once per experiment this app ships with
  built in — "built-in," as opposed to a hypothetical future
  user-registered one, is a real distinction this curriculum's own outline
  (Lesson 219, "Build Custom Experiments," far ahead) already anticipates.
- `registerBuiltInExperiments()` (the call, inside `StemLabApp`) — called
  once, at the very top of `StemLabApp`'s body, every single time
  `StemLabApp` composes; because `ExperimentRegistry.register` simply
  appends to a list with no duplicate-checking, calling this on every
  recomposition (not just the first) is a real, latent bug this lesson
  accepts and does not yet fix — `ExperimentRegistry` would grow a second,
  duplicate "Generic Experiment" entry on a second recomposition of
  `StemLabApp`, something this curriculum's own future lessons on
  lifecycle and one-time side effects will address properly, rather than
  papering over here with a construct not yet taught.
- `AreaScreen(area = area, onExperimentClick = { definition -> navController.navigate("experiment/${definition.id}") })`
  — the identical lambda-and-navigate pattern `onAreaClick` established in
  Lesson 1, here navigating to the new parameterized `"experiment/{experimentId}"`
  route instead of `"area/{areaId}"`.
- `composable("experiment/{experimentId}") { ExperimentWorkspace() }` — a
  second parameterized route registered inside the same `NavHost`, matching
  Lesson 1's own `"area/{areaId}"` pattern; its `backStackEntry` argument
  (available the same way `"area/{areaId}"`'s was) goes unused for now,
  since `ExperimentWorkspace` doesn't yet take an experiment id at all.
- `val checker: CapabilityChecker = remember { SystemCapabilityChecker(context) }`
  — the identical pattern `InstrumentDashboard` (Lesson 2) already used,
  reused here so `ExperimentListScreen` can call the same `isRunnable`
  logic just verified.
- `ExperimentRegistry.all().forEach { definition -> ... }` — the same
  `forEach`-over-a-registry-listing pattern `InstrumentDashboard` used over
  `InstrumentCatalog.all` — here, the list itself was built dynamically by
  `register`, rather than written as one literal.
- `val runnable = isRunnable(definition, checker)` — calls this lesson's
  own verified function, once per listed experiment.
- `.clickable(enabled = runnable) { onExperimentClick(definition) }` —
  `clickable` (met in Lesson 1) is called here with its real `enabled`
  parameter supplied explicitly (Lesson 1's own call left it at its
  default, always-`true` value) — an unrunnable experiment's card becomes
  genuinely untappable, the identical "prevent the illegal action at the
  UI boundary" idea Lesson 3's `Button(enabled = ...)` already established,
  applied here to a `Card` instead of a `Button`.

### CS Lens

Routing to `"experiment/{experimentId}"` and, separately, deciding *which*
list of experiments to even offer via `ExperimentRegistry.all()`, is a
concrete instance of **service discovery** — code finding out, at runtime,
what capabilities or services are available, rather than that set being
fixed at compile time. The same general idea a browser's plugin manager,
an operating system's driver discovery, or a microservice architecture's
service registry all rely on, each adapted to its own domain.

### SE Lens

**Why does `ExperimentWorkspace` still ignore which specific experiment was
tapped?** This is a real, deliberate limitation, not an oversight left
unaddressed by accident: this lesson's own scope is the registry and its
discovery mechanism, not experiment-specific behavior — giving
`ExperimentWorkspace` real, per-experiment behavior today would mean
building it against a guessed shape for "what an experiment's actual data
looks like," before Lesson 5's own data model (`Experiment` → `Session` →
`Trial` → `Dataset` → `Channel` → `Sample`) exists to define that shape for
real. Building it now would very likely mean reworking it again the moment
that real data model lands — a cost this lesson avoids by explicitly
scoping "which experiments exist and can I reach one" separately from "what
does running one actually mean."

---

## Connect the Pieces

One trace through this lesson: `ExperimentDefinition` gave "one kind of
experiment" a real, Android-independent shape, including a list of
requirements; `ExperimentRegistry` gave every future experiment kind — this
one and, per this curriculum's own outline, dozens more later — one shared
place to register itself, without ever needing its own three-line body
edited again; `isRunnable`, verified against a fake `CapabilityChecker`
before ever touching real hardware, connected those requirements back to
Lesson 2's real device-capability check; and `ExperimentListScreen` put all
three together — list what's registered, check what's runnable, disable
what isn't — before handing off, through a new parameterized route, to
Lesson 3's already-working workspace. Tap "Experiments" now, and the app
shows something it *discovered*, not something hardcoded into a single
screen.

Next: the scientific data model — `Experiment` → `Session` → `Trial` →
`Dataset` → `Channel` → `Sample`, the shape every future measurement this
curriculum ever records will share.
