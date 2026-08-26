# Lesson 2: Capability Detection — What Does This Specific Phone Actually Have?

**What you will build:** A real dashboard, replacing the "Instruments —
coming soon" placeholder from Lesson 1, listing every instrument this
curriculum's app knows about (accelerometer, gyroscope, microphone, GPS,
camera) and showing, per instrument, whether *this specific device* actually
has it. The transferable problem: unlike a desktop program that can usually
assume its target machine has a keyboard and a screen and stop worrying,
this app is going to run on wildly different phones and tablets — some with
a barometer, many without one; some with a gyroscope, some without. Code
that just assumes a piece of hardware exists and tries to use it will crash
or silently misbehave on whichever device doesn't have it. How does code ask
the operating system, honestly and in advance, "does this exist here?"

**What you need to know first:** Lesson 1 of this curriculum (`@Composable`
functions, `Scaffold`, `sealed class`, and the `StemLabApp`/`HomeScreen`/
`AreaScreen` navigation structure `AreaScreen` for `Instruments` now
replaces the body of).

**Terms used in this lesson:**
- **Domain model** — a piece of code (here, a `data class`) whose only job
  is representing a real-world concept the app cares about — in this
  lesson, "a scientific instrument" — completely separately from any UI
  that happens to display it or any Android API that happens to detect it.
  It exists so "what an instrument *is*" can be reasoned about, tested, and
  changed without touching a single line of UI code.
- **Interface** — a Kotlin construct declaring a contract of behavior (what
  functions exist, what they accept and return) with **no implementation at
  all** attached to it. It exists so different pieces of code can depend on
  "something that can do X" without caring, or even knowing, which concrete
  implementation actually does it.
- **`CompositionLocal`** — a Compose mechanism for making a value
  implicitly available to every composable inside a certain part of the UI
  tree, without threading it through every single function's parameter list
  by hand. It exists because some values (like "the current Android
  `Context`") are needed by so many unrelated composables, deep in a UI
  tree, that passing them as an explicit parameter through every
  intermediate function would make every function's signature longer for no
  reason connected to what that function actually does.

**Objects and methods used:**

- **`Instrument`** (this lesson's own new domain model)
  - *What it is:* A plain data holder describing one scientific instrument
    this app knows how to look for — its identity, its human-readable
    description, and the exact system feature string used to detect it.
  - *Implementation:*
    ```kotlin
    data class Instrument(
        val id: String,
        val label: String,
        val description: String,
        val requiredFeature: String
    )
    ```
  - *Its use:* `InstrumentCatalog.all` is a fixed list of these; the
    dashboard renders one card per instrument.
  - *Type:* A `data class` — Kotlin's built-in construct for value-holding
    classes, automatically generating `equals`, `hashCode`, `toString`, and
    a `copy` function from its constructor properties.
  - *Responsibility:* Hold exactly the facts needed to both display an
    instrument and detect whether it's present — nothing about *how* to
    detect it, and nothing about *how* to display it.
  - *Depends on:* Nothing; it's a pure data container with no behavior of
    its own beyond what `data class` generates automatically.
  - *Connects to:* Constructed once per instrument, inside
    `InstrumentCatalog`; read by both `InstrumentDashboard` (for display)
    and, indirectly through `requiredFeature`, by `CapabilityChecker` (for
    detection).
  - *Shape:* A pure domain-layer value type — it has no dependency on
    Android, Compose, or any framework at all, and could be tested,
    reused, or serialized with zero changes if this app's entire UI were
    rewritten from scratch.

- **`CapabilityChecker`** (this lesson's own new interface)
  - *What it is:* The abstraction boundary between "code that wants to know
    if a feature exists" and "code that actually knows how to ask the
    Android OS."
  - *Implementation:*
    ```kotlin
    interface CapabilityChecker {
        fun isAvailable(featureName: String): Boolean
    }
    ```
  - *Its use:* `InstrumentDashboard` depends on a `CapabilityChecker`, not
    on `PackageManager` directly.
  - *Type:* An `interface` — no implementation, no state, no constructor;
    it cannot be instantiated on its own with `CapabilityChecker()`.
  - *Responsibility:* Declare, and promise, exactly one capability — being
    askable "is this named feature available?" — without saying anything
    about how that question gets answered.
  - *Depends on:* Nothing of its own; anything implementing it must supply
    a real `isAvailable` body.
  - *Connects to:* Implemented by `SystemCapabilityChecker`, below; used by
    `InstrumentDashboard`, which never references `SystemCapabilityChecker`
    by name at all.
  - *Shape:* A public seam this app's own architecture defines on purpose —
    the exact boundary Lesson 9 of this curriculum (a simulated-hardware
    lab) will plug a second, entirely different implementation into,
    without `InstrumentDashboard` changing by one line.

- **`PackageManager`**
  - *What it is:* The real Android system service that knows what hardware
    and software features the running device actually has.
  - *Implementation:* `android.content.pm.PackageManager`, an abstract
    class; the specific method this lesson calls is
    `fun hasSystemFeature(featureName: String): Boolean`.
  - *Its use:* `SystemCapabilityChecker.isAvailable` calls it directly —
    the one and only place in this entire app that touches
    `PackageManager`.
  - *Type:* An abstract class, obtained (never constructed directly) from
    a real `Context`.
  - *Responsibility:* Answer factual questions about the device and the
    apps installed on it — this lesson uses exactly one of the many things
    it can answer.
  - *Depends on:* A live Android `Context` to be obtained from in the first
    place (`context.packageManager`).
  - *Connects to:* Queried by `SystemCapabilityChecker`; itself backed
    directly by the Android OS's own hardware and software feature
    registry, which this app's code never sees or controls.
  - *Shape:* A real Android system boundary — the literal edge between
    this app's own code and facts about the physical device it happens to
    be running on right now.

- **`hasSystemFeature`**
  - *What it is:* The specific `PackageManager` method that answers "does
    this device have the named feature?"
  - *Implementation:* `fun hasSystemFeature(featureName: String): Boolean`,
    where `featureName` is one of Android's own predefined feature-name
    constants (for example, `PackageManager.FEATURE_SENSOR_GYROSCOPE`, a
    real constant whose actual string value is
    `"android.hardware.sensor.gyroscope"`).
  - *Its use:* Called once per instrument, with that instrument's
    `requiredFeature` string.
  - *Type:* An instance method on `PackageManager`.
  - *Responsibility:* Look up one named feature string against the real
    device's actual hardware/software feature list and report a plain
    `Boolean` — nothing about *why* it's missing, nothing about
    permissions, just presence or absence.
  - *Depends on:* A valid feature-name string; an unrecognized string
    simply returns `false` rather than throwing.
  - *Connects to:* Called from `SystemCapabilityChecker.isAvailable`; its
    result flows straight back out as that function's own return value.
  - *Shape:* The actual, single point of contact with real device hardware
    facts, for this entire lesson.

- **`LocalContext`**
  - *What it is:* The specific `CompositionLocal` giving Compose code
    access to the current Android `Context`, without it being passed as an
    explicit function parameter.
  - *Implementation:* `val LocalContext: ProvidableCompositionLocal<Context>`,
    in `androidx.compose.ui.platform`; read via `LocalContext.current`,
    which yields a real `Context`.
  - *Its use:* `InstrumentDashboard` reads `LocalContext.current` once, to
    build a real `SystemCapabilityChecker`.
  - *Type:* A top-level property holding a `ProvidableCompositionLocal`
    instance — not a class this lesson instantiates, and not a function.
  - *Responsibility:* Hold whatever `Context` value the Compose framework
    itself provided further up the composition tree (Compose provides one
    automatically, rooted at the hosting `Activity`), and hand it back to
    any composable that reads `.current`.
  - *Depends on:* Being read from inside an active composition — reading
    `.current` outside any composable function is a compile error, since
    `.current` is itself a property whose getter is marked `@Composable`.
  - *Connects to:* Set up automatically by the Compose framework, rooted at
    `setContent`'s own `Activity`; read here, inside
    `InstrumentDashboard`, to construct a real `SystemCapabilityChecker`.
  - *Shape:* The one sanctioned way Compose code reaches back out to the
    surrounding Android platform for ambient values like `Context`,
    without every single composable needing its own explicit `context:
    Context` parameter.

- **`Card`**
  - *What it is:* A Material3 composable rendering its content inside a
    raised, bordered surface — the standard visual container for "one
    self-contained item in a list of items."
  - *Implementation:*
    ```kotlin
    @Composable
    fun Card(
        modifier: Modifier = Modifier,
        colors: CardColors = CardDefaults.cardColors(),
        content: @Composable ColumnScope.() -> Unit
    )
    ```
    (`androidx.compose.material3.Card`; other real parameters — `shape`,
    `elevation`, `border` — exist but go unused here.)
  - *Its use:* `InstrumentCard` uses it as the outer container for each
    instrument's label, description, and status.
  - *Type:* A `@Composable` function.
  - *Responsibility:* Draw a consistent, styled container (background,
    corner rounding, elevation shadow) and provide a `ColumnScope` for its
    content, so children can use `Column`-specific modifiers without an
    extra `Column` wrapper.
  - *Depends on:* A `content` lambda describing what goes inside.
  - *Connects to:* Called once per instrument, from `InstrumentCard`, which
    is itself called once per instrument from `InstrumentDashboard`.
  - *Shape:* A shared, reusable visual building block — the same `Card`
    this lesson calls is exactly the one every later card-shaped UI in this
    curriculum will reuse.

---

## Concept Unit: The Instrument Domain Model

### The Problem

Before any code can ask "does this device have a gyroscope," something has
to say what a gyroscope even *means* to this app — a name to show a human,
a description, and something precise enough to actually check against the
OS. Should that live as scattered string literals directly inside whatever
composable happens to render the dashboard, or somewhere else entirely?

Given `StemArea` from Lesson 1 — a fixed, compiler-checked list of named
things, each carrying a couple of fields — what's genuinely similar here,
and what's genuinely different? Does an *instrument* need to be a closed,
enumerable set the way an *area* did, or could new instruments plausibly get
added over time in a way `StemArea` was never meant to support?

### Introduce the Concept in Isolation

```kotlin
data class Person(val name: String, val age: Int)

fun main() {
    val a = Person("Ada", 36)
    val b = Person("Ada", 36)
    println(a == b)
    println(a)
    println(a.copy(age = 37))
}
```

Compile and run:

```
kotlinc Person.kt -include-runtime -d Person.jar
java -jar Person.jar
```

Real output, from running this just now:

```
true
Person(name=Ada, age=36)
Person(name=Ada, age=37)
```

Three real, distinct facts proven by this one run: `a == b` is `true` even
though `a` and `b` are two genuinely separate objects in memory, because
`data class` generates a real `equals` comparing every constructor
property's value, not object identity — an ordinary `class Person(...)`
with no `data` keyword would print `false` here instead, comparing by
reference. `println(a)` shows every property by name with no `toString`
written by hand — `data class` generates that too. `a.copy(age = 37)`
built an entirely new `Person`, leaving `a` itself unchanged, with every
property except `age` copied over automatically — this is called a **data
class**, and it exists specifically for values whose entire identity *is*
their data, with no independent identity beyond that.

### Discard the Throwaway Example

`Person` is deleted. The three guarantees just proven — value-based
equality, a real generated `toString`, and `copy` — are exactly why
`Instrument`, next, is a `data class` rather than a plain `class`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  same as every unit in this curriculum so far.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/Instrument.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** `android.content.pm.PackageManager`'s real
  `FEATURE_*` constant strings, referenced by value only (as plain string
  literals matching their real documented values — this file itself does
  not import `PackageManager`, keeping this domain model free of any
  Android import at all).

### The New Code

```kotlin
data class Instrument(
    val id: String,
    val label: String,
    val description: String,
    val requiredFeature: String
)

object InstrumentCatalog {
    val all = listOf(
        Instrument(
            id = "accelerometer",
            label = "Accelerometer",
            description = "Measures acceleration along three axes.",
            requiredFeature = "android.hardware.sensor.accelerometer"
        ),
        Instrument(
            id = "gyroscope",
            label = "Gyroscope",
            description = "Measures rotation rate along three axes.",
            requiredFeature = "android.hardware.sensor.gyroscope"
        ),
        Instrument(
            id = "microphone",
            label = "Microphone",
            description = "Captures audio for signal analysis.",
            requiredFeature = "android.hardware.microphone"
        ),
        Instrument(
            id = "gps",
            label = "GPS",
            description = "Reports geographic position.",
            requiredFeature = "android.hardware.location.gps"
        ),
        Instrument(
            id = "camera",
            label = "Camera",
            description = "Captures images for computer vision.",
            requiredFeature = "android.hardware.camera.any"
        )
    )
}
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption for that case, this step is skipped.

### Mechanical Walkthrough

- `data class Instrument(val id: String, val label: String, val description: String, val requiredFeature: String)`
  — as proven in the lab above: this generates real `equals`, `hashCode`,
  `toString`, and `copy` for free, from these four constructor properties.
- `object InstrumentCatalog` — a singleton object (the same construct
  `StemArea`'s four areas used in Lesson 1, applied here to hold a shared
  list instead of being one of the list's own entries).
- `val all = listOf(...)` — builds an immutable, ordered `List<Instrument>`
  containing five real instrument definitions, in the order the dashboard
  will display them.
- `requiredFeature = "android.hardware.sensor.accelerometer"` (and each
  sibling string) — a plain Kotlin string literal, deliberately written out
  as the literal value rather than importing and referencing
  `PackageManager.FEATURE_SENSOR_ACCELEROMETER` directly, so this file has
  zero dependency on `android.content.pm` — this specific string is the
  real, documented value of that Android constant, confirmed against
  Android's own public `PackageManager` feature-constant documentation.

### CS Lens

`Instrument` and `InstrumentCatalog` together form a real **domain model**,
in the sense that term is used across professional software: a
representation of a real-world concept (a scientific instrument) that
exists independently of any particular UI, storage format, or detection
mechanism built around it.

Also recognized in: an e-commerce app's `Product` type, unrelated to
whatever database or UI framework displays it; a game's `Character` or
`Item` types; any ORM's model classes, deliberately kept separate from the
SQL that persists them.

### SE Lens

**Why keep `requiredFeature` as a plain `String` instead of, say, an `enum`
of known Android features?** A `String` was chosen over a closed `enum`
because `PackageManager.hasSystemFeature` itself takes a raw `String` — no
`enum` exists on the Android side to wrap, and inventing one here would
just be a parallel set of names this project would have to keep in sync
with Android's own real constants by hand, forever, for no real safety
gained (a typo'd `enum` case name fails to compile either way; a typo'd
`String` literal here would simply mean `hasSystemFeature` always returns
`false` for that instrument — a real, silent risk this lesson accepts
deliberately, in exchange for zero required Android imports in this file).

---

## Concept Unit: Capability Detection Behind an Interface

### The Problem

`InstrumentDashboard` needs to know, per instrument, whether this specific
device actually has it — but if the dashboard's own composable code calls
`PackageManager.hasSystemFeature` directly, every single future screen or
test that needs the same fact has to import Android's `PackageManager` and
repeat the same lookup logic, and — more importantly for this curriculum
specifically — Lesson 9's planned simulated-hardware mode would have no
seam to plug into at all; the real device check would be hardwired straight
into the UI. Is there a way to let `InstrumentDashboard` ask "is this
available?" without it ever knowing *how* that question gets answered?

Given what an `interface` already promises — a contract with no
implementation attached — what would you try writing first, if the goal
were "let two completely different pieces of code answer the exact same
question in two completely different ways"?

### Introduce the Concept in Isolation

```kotlin
interface Greeter {
    fun greet(name: String): String
}

class FormalGreeter : Greeter {
    override fun greet(name: String) = "Good day, $name."
}

class CasualGreeter : Greeter {
    override fun greet(name: String) = "Hey $name!"
}

fun printGreeting(greeter: Greeter, name: String) {
    println(greeter.greet(name))
}

fun main() {
    printGreeting(FormalGreeter(), "Ada")
    printGreeting(CasualGreeter(), "Ada")
}
```

Compile and run:

```
kotlinc Greeter.kt -include-runtime -d Greeter.jar
java -jar Greeter.jar
```

Real output, from running this just now:

```
Good day, Ada.
Hey Ada!
```

This proves the real point: `printGreeting`'s own parameter type is
`Greeter` — never `FormalGreeter` or `CasualGreeter` by name — and yet it
successfully calls two genuinely different implementations, producing two
genuinely different outputs, with no `if` statement anywhere checking which
one it received. This is called **programming to an interface**:
`printGreeting` depends on the *contract* (`fun greet(name: String): String`
exists), never on any specific class that happens to fulfill it, which is
exactly the capability `InstrumentDashboard` needs next.

### Discard the Throwaway Example

`Greeter`, `FormalGreeter`, `CasualGreeter`, and `printGreeting` are all
deleted. The pattern just proven — code depending on an interface,
oblivious to which concrete implementation it actually received — is what
`CapabilityChecker` and `SystemCapabilityChecker` reuse next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/CapabilityChecker.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** `Instrument` from the previous unit (referenced only by
  the type's general shape, not directly imported by this file).

### The New Code

```kotlin
interface CapabilityChecker {
    fun isAvailable(featureName: String): Boolean
}

class SystemCapabilityChecker(private val context: Context) : CapabilityChecker {
    override fun isAvailable(featureName: String): Boolean {
        return context.packageManager.hasSystemFeature(featureName)
    }
}
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption, this step is skipped.

### Mechanical Walkthrough

- `interface CapabilityChecker { fun isAvailable(featureName: String): Boolean }`
  — as explained in full in the Header: declares the contract with no
  body attached; `isAvailable` here has no `{ }` at all, only a signature,
  which is precisely what makes this an interface method rather than an
  ordinary function.
- `class SystemCapabilityChecker(private val context: Context) : CapabilityChecker`
  — `private val context: Context` is a **constructor property**, the same
  shape `StemArea`'s `id`/`label` used in Lesson 1, here marked `private`
  so nothing outside this class can read `context` directly; `:
  CapabilityChecker` declares that this class **implements** the
  interface — a real, checked promise the Kotlin compiler enforces: leaving
  out `override fun isAvailable` entirely would be a compile error, because
  the compiler requires every member the interface declares to actually be
  provided.
- `override fun isAvailable(featureName: String): Boolean` — the `override`
  keyword is required here (not optional) whenever a function fulfills an
  interface member or replaces an open superclass member; without it,
  Kotlin refuses to compile, specifically to prevent an accidental
  same-named function from silently satisfying an interface by coincidence
  rather than by deliberate intent.
- `context.packageManager` — `packageManager` is a real property on
  Android's `Context` class, returning that device's live `PackageManager`
  instance.
- `.hasSystemFeature(featureName)` — as explained in full in the Header;
  the actual real-device check, called with whatever feature string this
  method's own caller passed in.

### CS Lens

This is the **Dependency Inversion Principle** in direct, concrete form:
`InstrumentDashboard` (a high-level, UI-concerned module) does not depend
on `SystemCapabilityChecker` (a low-level, Android-framework-concerned
module) — both instead depend on the `CapabilityChecker` **interface**, a
boundary neither one owns outright. This is also a real instance of the
**Strategy pattern**: swapping which concrete "strategy" answers
`isAvailable` (a real device check today; a scripted, simulated answer once
Lesson 9 builds it) without the code that *uses* the strategy changing at
all.

Also recognized in: a payment system depending on a `PaymentGateway`
interface rather than directly on `StripeGateway`; a logging call depending
on an abstract `Logger` interface rather than a specific file-writing
implementation; a game's AI depending on a `MovementStrategy` interface
so "patrol," "chase," and "flee" can be swapped per enemy without the game
loop itself branching on enemy type.

### SE Lens

**Why introduce this interface now, in Lesson 2, when this app has exactly
one real implementation and no second one yet?** The simpler alternative —
call `PackageManager` straight from `InstrumentDashboard` today, and
introduce an interface only once a second real need for one actually shows
up — was not chosen, because this curriculum's own outline (Lesson 9,
"Build the Measurement Simulator") already commits to a second
implementation existing later, specifically so every sensor-dependent
screen this curriculum ever builds can be developed and tested without
real hardware. Introducing the seam now costs one extra file and one extra
constructor parameter today, in exchange for Lesson 9 never having to go
back and *retrofit* an abstraction underneath UI code that was never
written expecting one — a much larger, riskier change than adding the
interface up front.

---

## Concept Unit: A Reusable, State-Driven Instrument Card

### The Problem

Five instruments, each needing a label, a description, and a clearly
different visual treatment depending on one fact: is it available on this
device or not? Writing five separate, hand-copied blocks of near-identical
Compose code — one per instrument — would mean any future visual change
(a new color, an added field) has to be repeated correctly five times, and
a sixth instrument added later needs a sixth hand-copied block. What single
piece of code could describe "one instrument card," parameterized just
enough to handle every instrument and both availability states?

### Introduce the Concept in Isolation

Same honesty note as Lesson 1's Compose-dependent units: this cannot run in
bare `kotlinc`; the description below is a confident, accurate prediction
of Material3's documented behavior, not a screenshot from a real execution.

```kotlin
@Composable
fun StatusDemo(ok: Boolean) {
    Card {
        Text(if (ok) "Available" else "Unavailable")
    }
}
```

Predicted result: calling `StatusDemo(true)` shows a card reading
"Available"; calling `StatusDemo(false)` shows a card reading
"Unavailable" — the exact same composable function, called twice, produces
two different results purely because of the `Boolean` value passed in.
This is **state-driven UI**: which branch of the `if` expression runs, and
therefore what actually appears on screen, is entirely determined by
`ok`'s value at the moment this function runs — there is no separate
"Available" version and "Unavailable" version of this function; there is
one function whose output is a function of its input.

### Discard the Throwaway Example

`StatusDemo` is deleted. `Card`, and the pattern of branching on a
`Boolean` to vary a composable's appearance, are both reused directly next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/InstrumentCard.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** `Instrument`, from the first unit of this lesson.

### The New Code

```kotlin
@Composable
fun InstrumentCard(instrument: Instrument, isAvailable: Boolean) {
    Card(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = instrument.label, style = MaterialTheme.typography.titleMedium)
            Text(text = instrument.description)
            Text(
                text = if (isAvailable) "Available on this device" else "Not available on this device",
                color = if (isAvailable) Color(0xFF2E7D32) else Color(0xFF9E9E9E)
            )
        }
    }
}
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption, this step is skipped.

### Mechanical Walkthrough

- `fun InstrumentCard(instrument: Instrument, isAvailable: Boolean)` — two
  parameters: the domain model itself, and a plain `Boolean` computed
  elsewhere (by `InstrumentDashboard`, next) — `InstrumentCard` itself
  never calls `CapabilityChecker`; it only displays a result it's handed,
  keeping this component ignorant of *how* availability was determined.
- `Card(modifier = Modifier.fillMaxWidth().padding(8.dp))` — as explained
  in full in the Header; `.fillMaxWidth().padding(8.dp)` chains two
  `Modifier` extensions (both already met in Lesson 1): expand to full
  width, then add `8.dp` of outer spacing around the card itself.
- `Column(modifier = Modifier.padding(16.dp))` — `Column` (met briefly in
  Lesson 1) arranges its three `Text` children vertically; `16.dp` of
  padding here is *inner* spacing, between the card's edge and its text —
  distinct from the `8.dp` outer spacing above, which is between one card
  and the next.
- `Text(text = instrument.label, style = MaterialTheme.typography.titleMedium)`
  — `instrument.label` reads the domain model's own property directly;
  `style = MaterialTheme.typography.titleMedium` is a real, predefined
  Material3 text style (part of a type-scale system this curriculum's own
  Lesson 26, "Material Theming," covers in full) — used here only to make
  the instrument's name visually stand out from its description, one level
  above what this lesson needs to explain further.
- `Text(text = instrument.description)` — reads the domain model's second
  property, with no extra styling.
- `text = if (isAvailable) "Available on this device" else "Not available on this device"`
  — an **`if` expression** (not a statement): in Kotlin, `if`/`else`
  produces a value directly, usable anywhere a value is expected — this is
  the exact mechanism `StatusDemo`'s lab just proved, applied to a real,
  two-instrument-state message instead of a placeholder word.
  This curriculum's Lesson 23 covers Kotlin's `if`-as-expression in full,
  dedicated detail; this lesson uses the capability without yet exploring
  every implication of it.
- `color = if (isAvailable) Color(0xFF2E7D32) else Color(0xFF9E9E9E)` — the
  identical `if`-expression pattern, applied a second time in the same
  call, this time selecting a `Color` value instead of a `String`;
  `Color(0xFF2E7D32)` constructs an opaque (`FF` alpha) green, and
  `Color(0xFF9E9E9E)` an opaque gray, both real ARGB hex values passed to
  `androidx.compose.ui.graphics.Color`'s `Long`-based constructor.

### CS Lens

This is the same idea CS calls **referential transparency** applied at UI
scale: `InstrumentCard`'s displayed output depends *only* on the arguments
it was called with (`instrument`, `isAvailable`) — call it twice with the
same two arguments and it produces the identical result every time, with no
hidden dependency on anything else. This is what makes "state-driven UI" a
real, checkable property of this function rather than just a phrase.

Also recognized in: a pure mathematical function (`sin(x)` always returns
the same value for the same `x`); spreadsheet cell formulas, which
recompute purely from their inputs; React's own core design principle,
which Compose's own documentation explicitly cites as a direct influence.

### SE Lens

**Why compute `isAvailable` outside `InstrumentCard` and pass it in, rather
than have `InstrumentCard` call `CapabilityChecker` itself?** The
alternative — `InstrumentCard` taking a `CapabilityChecker` and an
`Instrument`, and calling `isAvailable` internally — was not chosen,
because it would mean every place that ever wants to render a card needs a
real or fake `CapabilityChecker` on hand just to draw the UI, even in
contexts (an app-store screenshot tool, a UI preview in Android Studio,
this curriculum's own future UI tests) where no real capability check is
wanted or even meaningful. Passing a plain `Boolean` in costs one extra
line at the one real call site (`InstrumentDashboard`, next) that actually
needs to compute it, in exchange for `InstrumentCard` itself staying a pure
function of its arguments, checkable and previewable with nothing more than
two literal values.

---

## Concept Unit: The Dashboard — Wiring Catalog, Checker, and Card Together

### The Problem

Three pieces exist now, each fully built and each ignorant of the other
two: a catalog of instruments, an interface that can check availability,
and a card that can display one instrument's status. Something has to
actually create a real `SystemCapabilityChecker`, run it against every
catalog entry, and render one `InstrumentCard` per result — replacing
Lesson 1's `AreaScreen`, which currently shows the same "coming soon" text
for every area regardless of which one was tapped.

### The New Code

```kotlin
@Composable
fun InstrumentDashboard() {
    val context = LocalContext.current
    val checker: CapabilityChecker = remember { SystemCapabilityChecker(context) }
    Column {
        InstrumentCatalog.all.forEach { instrument ->
            InstrumentCard(
                instrument = instrument,
                isAvailable = checker.isAvailable(instrument.requiredFeature)
            )
        }
    }
}
```

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/MainActivity.kt` (`AreaScreen`'s body
  now shows `InstrumentDashboard()` when `area == StemArea.Instruments`,
  and its previous placeholder text otherwise); created —
  `app/src/main/java/com/stemlab/app/InstrumentDashboard.kt`.
- **Change type:** Add (`InstrumentDashboard.kt`); refactor (`AreaScreen`).
- **Location:** `AreaScreen`'s `content` slot, inside `Scaffold`.
- **Dependencies:** `Instrument`, `InstrumentCatalog`, `CapabilityChecker`,
  `SystemCapabilityChecker`, `InstrumentCard` — every prior unit of this
  lesson.

### The Updated Project

`AreaScreen`, in full, after this change (the rest of `MainActivity.kt` —
`MainActivity`, `StemLabApp`, `HomeScreen` — is unchanged from Lesson 1 and
omitted from this specific block only because nothing in it changed; every
line shown below is real, current code):

```kotlin
1  @Composable
2  fun AreaScreen(area: StemArea) {
3      Scaffold(
4          topBar = { TopAppBar(title = { Text(area.label) }) }
5      ) { innerPadding ->
6          Box(modifier = Modifier.padding(innerPadding)) {                 // ← new
7              if (area == StemArea.Instruments) {                          // ← new
8                  InstrumentDashboard()                                    // ← new
9              } else {                                                     // ← new
10                 Text(text = "${area.label} — coming soon")               // ← changed: no longer takes innerPadding directly
11             }                                                            // ← new
12         }                                                                // ← new
13     }
14 }
```

`AreaScreen` now genuinely branches on *which* area it was given: tapping
"Instruments" from the home screen reaches this exact function with
`area == StemArea.Instruments`, and now shows the real, five-card dashboard
instead of placeholder text; tapping any of the other three areas still
reaches this same function, with a different `area` value, and still shows
the Lesson 1 placeholder — nothing about Experiments, Data, or Analysis
changed in this lesson.

### Mechanical Walkthrough

- `val context = LocalContext.current` — as explained in full in the
  Header: reads the ambient `Context` Compose provides automatically.
- `val checker: CapabilityChecker = remember { SystemCapabilityChecker(context) }`
  — `remember { ... }` (Compose's own memory-across-recomposition
  mechanism, used already via `rememberNavController` in Lesson 1) builds
  exactly one `SystemCapabilityChecker` the first time `InstrumentDashboard`
  composes, and reuses that same instance on every later recomposition,
  rather than constructing a fresh one — and, more importantly for this
  specific line, rather than a fresh `PackageManager` lookup being
  re-triggered needlessly every recomposition. The declared type,
  `CapabilityChecker`, is the interface, not `SystemCapabilityChecker` —
  a deliberate, explicit choice matching this unit's own point: everything
  below this line only ever sees the interface.
- `InstrumentCatalog.all.forEach { instrument -> ... }` — the identical
  `forEach` pattern `HomeScreen` used in Lesson 1, applied here to iterate
  the instrument catalog instead of the area list.
- `InstrumentCard(instrument = instrument, isAvailable = checker.isAvailable(instrument.requiredFeature))`
  — calls `checker.isAvailable(...)` through the interface type — this is
  the literal moment the Strategy-pattern seam named in this lesson's CS
  Lens actually executes: `checker`'s *declared* type is the interface, but
  its *real*, runtime object is a `SystemCapabilityChecker`, and calling an
  interface method on an interface-typed reference dispatches to whichever
  concrete implementation the variable actually holds — the same dynamic
  dispatch mechanism this curriculum's Lesson 5 will cover for class
  inheritance, here applying identically to interface implementation.
- `if (area == StemArea.Instruments) { InstrumentDashboard() } else { ... }`
  — `area == StemArea.Instruments` compares against the exact singleton
  `object` Lesson 1 declared; because `StemArea.Instruments` is a true
  singleton (Lesson 1's own point about `object` declarations), `==`
  here checks genuine object identity in effect, even though `==` in
  Kotlin always calls `equals` — for an `object` with no custom `equals`
  override, the default `equals` inherited from `Any` *is* reference
  equality, so this comparison is both value-equal and reference-equal at
  once, for the specific reason that only one `Instruments` object will
  ever exist.

### CS Lens

Iterating `InstrumentCatalog.all` and calling `checker.isAvailable` once
per instrument, entirely independent of iteration order or how many
instruments exist, is the same **map** operation from functional
programming — transforming each element of a collection through the same
function to produce a new, parallel result per element — expressed here as
`forEach` producing UI side effects (composable calls) rather than
`map` producing a new list, because Compose's own composition model treats
"call a composable" as the actual meaningful action, not "return a value."

### SE Lens

**Why does `AreaScreen` branch with a plain `if (area == StemArea.Instruments)`
instead of, say, giving each `StemArea` its own dedicated navigation route
back in `StemLabApp`?** The dedicated-route alternative is real, and this
curriculum's own Lesson 4 ("Build the Experiment Registry") is going to
need something much closer to it, once areas need genuinely different
navigation graphs of their own. It is not chosen yet here because
`Experiments`, `Data`, and `Analysis` have no real screen at all yet — a
dedicated route per area today would just be four more copy-pasted
`composable(...)` blocks, all but one showing identical placeholder text.
The cost paid for the simpler `if` used today: `AreaScreen` will need a
real rewrite once every area has its own dashboard — a cost this lesson
accepts on purpose, rather than over-building navigation infrastructure for
three screens that don't exist yet.

---

## Connect the Pieces

One trace through this lesson: `Instrument` and `InstrumentCatalog` gave
"what a scientific instrument is" a real, Android-independent home;
`CapabilityChecker` declared, as a bare contract, what it means to check
whether one is present; `SystemCapabilityChecker` fulfilled that contract
by actually calling `PackageManager.hasSystemFeature`, reached through
`LocalContext.current`; `InstrumentCard` turned one instrument plus one
`Boolean` into a consistent, reusable visual; and `InstrumentDashboard`
wired all four together — read the catalog, check each entry through the
interface, render a card per result — before `AreaScreen` learned to show
that dashboard specifically when `StemArea.Instruments` was the area
tapped. Tap "Instruments" on a real device now, and the app reports, for
the first time, a real fact about that specific physical phone.

Next: the experiment workspace — a configure/run/stop/save state machine,
independent of which specific instrument or measurement it's driving.
