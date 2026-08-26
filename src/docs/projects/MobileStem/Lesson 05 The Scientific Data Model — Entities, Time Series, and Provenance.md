# Lesson 5: One Shape for Every Measurement — Entities, Time Series, and Provenance

**What you will build:** No new screen — a pure Kotlin data model,
`Experiment` → `Session` → `Trial` → `Dataset` → `Channel` → `Sample`, with
no dependency on Android or Compose at all, verified entirely through real
compiled-and-run code. The transferable problem: every future experiment
this curriculum ever builds — a pendulum, a spectrum analyzer, a GPS
tracker — is going to produce measurements. If each one invents its own,
different shape for "the data I recorded," nothing else in this app —
storage (Lesson 16), export (Lesson 18), graphing (Lesson 13), statistics
(Part V) — could ever be written once and reused; each would need a special
case per experiment kind. Is there one shape general enough to hold *any*
scientific measurement, regardless of which instrument or experiment
produced it?

**What you need to know first:** Lesson 2 of this curriculum (`data class`
domain models, `List`). Lesson 4 (`ExperimentDefinition`, the id-based
lookup pattern connecting a record back to its own definition).

**Terms used in this lesson:**
- **Entity** — an object with its own real identity (usually a stable
  `id`), distinct from a plain value even when two entities happen to hold
  identical data — two separate `Trial`s with coincidentally identical
  measurements are still two different trials, distinguished by `id`, the
  same way two people who happen to share a name are still two different
  people.
- **Aggregation (a whole-part relationship)** — a real, named
  object-oriented modeling relationship: one entity is built *from* a
  collection of smaller entities or values, and understanding the whole
  requires understanding how its parts relate — this lesson's entire
  hierarchy is a chain of these relationships, one level nested inside the
  next.
- **Time series** — an ordered sequence of values, each tagged with the
  specific moment it was recorded, where the *ordering by time* itself
  carries real meaning (unlike an arbitrary list, where reordering the
  elements wouldn't change what the data represents).
- **Sampling rate** — how frequently, on average, a time series records a
  new value, usually expressed in **Hz** (samples per second) — a derived
  fact computed *from* a time series' own timestamps, not a separate value
  stored alongside it.
- **Provenance** — the recorded facts about *where a piece of data came
  from*: which experiment definition produced it, and when it was
  recorded. It exists because a scientific measurement with no record of
  its own origin cannot later be trusted, reproduced, or meaningfully
  compared against another measurement.

**Objects and methods used:**

- **`Sample`, `Channel`, `Dataset`, `Trial`, `Session`, `Experiment`**
  (this lesson's own new entity hierarchy — grouped into one entry, since
  all six share the identical `data class` shape and CRC facts, and are
  walked through individually, in full, below)
  - *What it is:* Six nested entity types, together forming one common
    representation for any scientific measurement this curriculum's app
    will ever record.
  - *Implementation:* Six `data class` declarations, each one's fields
    holding either plain values or a `List` of the next level down (shown
    in full in this lesson's own Concept Units, below).
  - *Its use:* Every future measurement-producing lesson in this
    curriculum constructs and reads this same hierarchy.
  - *Type:* Six `data class`es, the identical construct `Instrument`
    (Lesson 2) and `ExperimentDefinition` (Lesson 4) already used.
  - *Responsibility:* Together, hold a complete, self-describing record of
    one full round of scientific work — which definition produced it, when,
    across however many sessions, trials, channels, and individual samples
    that work actually involved.
  - *Depends on:* `ExperimentDefinition.id` (Lesson 4), referenced by
    `Experiment.definitionId` — a plain `String`, not a direct object
    reference (explained in full below).
  - *Connects to:* Nothing yet reads or writes this hierarchy inside the
    real app — this lesson defines the shape only; Lesson 9's simulator and
    Lesson 15's real recording are what will first populate one for real.
  - *Shape:* The single, shared data-layer contract every other subsystem
    of this app — UI, storage, export, analysis — will be built to consume,
    without any of them needing to know which specific experiment produced
    the data they're looking at.

- **`List<T>.first`** *(reappearing from Lesson 1)*
  - *What it is:* A stdlib function returning a collection's first element.
  - *Implementation:* `fun <T> Iterable<T>.first(): T` (the
    no-predicate overload; Lesson 1 and 4 both used the predicate-taking
    overload, `first { ... }` — a real, different overload of the same
    name, chosen here because this lesson always wants literally the first
    element, not the first matching some condition).
  - *Its use:* Walking down through the hierarchy
    (`experiment.sessions.first().trials.first()...`) to reach a specific
    sample for inspection or verification.
  - *Type:* An extension function on `Iterable<T>`.
  - *Responsibility:* Return the first element, or throw
    `NoSuchElementException` if the collection is empty.
  - *Depends on:* A non-empty `Iterable`.
  - *Connects to:* Chained repeatedly, one call per hierarchy level, in
    this lesson's own verification code.
  - *Shape:* A read-only traversal tool — it never modifies anything it's
    called on.

- **`List<T>.last`**
  - *What it is:* The mirror of `first` — a stdlib function returning a
    collection's last element.
  - *Implementation:* `fun <T> List<T>.last(): T`.
  - *Its use:* `samplingRateHz` (this lesson's own function) reads a
    channel's most recent sample's timestamp.
  - *Type:* An extension function on `List<T>`.
  - *Responsibility:* Return the last element, or throw if the list is
    empty.
  - *Depends on:* A non-empty `List`.
  - *Connects to:* Called alongside `first()` inside `samplingRateHz`, to
    compute the total time span a set of samples covers.
  - *Shape:* The same read-only traversal role as `first`, at the opposite
    end of the list.

- **`MutableList<T>.toList`**
  - *What it is:* A stdlib function producing a real, independent,
    immutable copy of a mutable list's current contents.
  - *Implementation:* `fun <T> Iterable<T>.toList(): List<T>`.
  - *Its use:* This lesson's own mutation-hazard lab, proving the
    difference between sharing a mutable list by reference and copying it.
  - *Type:* An extension function on `Iterable<T>`.
  - *Responsibility:* Allocate a brand-new list, copy every current
    element into it, and hand back a reference to that new list —
    afterward, changes to the original collection have zero effect on the
    copy.
  - *Depends on:* Nothing beyond the receiver collection.
  - *Connects to:* Reused here from `ExperimentRegistry.all()` (Lesson 4),
    which already relied on this exact same copying behavior for the exact
    same reason.
  - *Shape:* The one real defense this lesson has against the mutation
    hazard its own third Concept Unit proves is otherwise real.

---

## Concept Unit: Aggregation — Building One Entity From Smaller Ones

### The Problem

A single measurement (one number, at one instant) means almost nothing
alone. A useful scientific record needs many of them, grouped correctly:
many samples make a channel meaningful; multiple channels recorded at once
make a dataset; and a dataset only means something in the context of *which
trial* produced it. How should code represent "one thing that is genuinely
made of several smaller things," where the smaller things themselves might
also be made of even smaller things?

Given `Instrument` (Lesson 2, a flat data holder with no nested entities of
its own) and `ExperimentDefinition` (Lesson 4, which holds a plain
`List<String>` of instrument *ids*, not real `Instrument` objects): what's
different about a data shape that needs to hold real, full sub-entities
directly, rather than just references to them by id?

### Introduce the Concept in Isolation

```kotlin
data class LineItem(val product: String, val quantity: Int)
data class Order(val id: String, val items: List<LineItem>)

fun main() {
    val a = Order("o1", listOf(LineItem("Widget", 2), LineItem("Gadget", 1)))
    val b = Order("o1", listOf(LineItem("Widget", 2), LineItem("Gadget", 1)))
    println(a == b)
    println(a)
    val total = a.items.sumOf { it.quantity }
    println(total)
}
```

Compile and run:

```
kotlinc Order.kt -include-runtime -d Order.jar
java -jar Order.jar
```

Real output, from running this just now:

```
true
Order(id=o1, items=[LineItem(product=Widget, quantity=2), LineItem(product=Gadget, quantity=1)])
3
```

This proves something genuinely non-obvious: `a == b` is `true` even though
`Order`'s own `items` field is a `List<LineItem>`, not a single simple
value. `data class`'s generated `equals` (met already in Lesson 2)
compares `items` field-by-field too — and `List`'s own real `equals`
implementation (from `kotlin.collections.List`, backed by
`java.util.AbstractList`) compares two lists element-by-element, calling
each element's own `equals` in turn. Because `LineItem` is *itself* a
`data class`, that recursion bottoms out correctly, all the way down, with
no extra code written anywhere to make it happen. This nested,
whole-made-of-parts shape — `Order` built from a list of `LineItem`s — is
called **aggregation**: `Order` doesn't just reference line items, it
genuinely contains them, and `a.items.sumOf { it.quantity }` proves the
point further — `sumOf` (a real stdlib function,
`inline fun <T> Iterable<T>.sumOf(selector: (T) -> Int): Int`) reaches
*into* the aggregated parts to compute a fact about the whole.

### Discard the Throwaway Example

`LineItem`, `Order`, and `main` are all deleted. The aggregation shape just
proven — one entity's field holding a real `List` of smaller, fully-formed
entities, with equality and computation both reaching through the nesting
correctly — is exactly what this curriculum's own six-level hierarchy
reuses next, level after level.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
  This lesson interprets `curriculum.md`'s own stated hierarchy
  (`Experiment → Session → Trial → Dataset → Channel → Sample`) directly.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/ScientificData.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** None yet (the top-level `Experiment` entity's
  dependency on `ExperimentDefinition`'s `id` is covered in this lesson's
  final unit).

### The New Code

```kotlin
data class Sample(val timestampMillis: Long, val value: Double)

data class Channel(val name: String, val unit: String, val samples: List<Sample>)

data class Dataset(val channels: List<Channel>)
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption, this step is skipped.

### Mechanical Walkthrough

- `data class Sample(val timestampMillis: Long, val value: Double)` — the
  smallest, innermost entity: one real-world measurement, at one instant.
  `timestampMillis` is a plain `Long` (milliseconds since the Unix epoch,
  the identical unit `System.currentTimeMillis()` — met in Lesson 3 —
  already returns); `value` is a plain `Double`, deliberately generic
  (this lesson does not yet attach a physical unit to an individual sample
  — that's `Channel`'s job, next).
- `data class Channel(val name: String, val unit: String, val samples: List<Sample>)`
  — the aggregation level just proven in the lab, applied for real:
  `samples` is a real `List<Sample>`, not a count or a summary; `name`
  (for example, `"x-axis acceleration"`) and `unit` (for example,
  `"m/s²"`) both describe the whole channel once, rather than being
  repeated on every individual `Sample` — a deliberate design choice this
  lesson's own SE Lens (in the final unit) returns to directly.
- `data class Dataset(val channels: List<Channel>)` — the identical
  aggregation shape one level up: a dataset is *made of* channels,
  recorded together (several sensor axes captured during the same span of
  time, for instance).

### CS Lens

This three-level shape — `Sample` inside `Channel` inside `Dataset` — is a
concrete instance of a **composite structure**: a tree where each level is
built from a collection of the level below it, and an operation on the
whole (like `sumOf` in the lab above) naturally recurses through every
level without special-casing any one of them.

Also recognized in: a filesystem's directory tree (folders containing files
and other folders); an HTML document's DOM tree (elements containing other
elements); a company's real org chart (departments made of teams made of
individual people).

### SE Lens

**Why doesn't `Sample` carry its own `unit` field, alongside `Channel`?**
The per-sample alternative — `Sample(timestampMillis, value, unit)` —
was not chosen, because a channel's unit is a fact about the *whole
channel*, true for every sample in it by construction (an accelerometer's
x-axis channel doesn't switch units mid-recording); repeating it on every
single sample would mean thousands of samples per trial all storing the
identical string, wasted, with a real, live risk that two of those copies
could someday disagree due to a bug, with no way to tell which one was
right. Storing it once, on `Channel`, makes "every sample in this channel
shares this unit" a structural fact of the data shape itself, not
something that merely happens to be true today by convention.

---

## Concept Unit: Time Series — What Makes a List of Samples More Than Just a List

### The Problem

`Channel.samples` is, mechanically, just a `List<Sample>` — nothing about
the type itself says the timestamps have to be in order, or that the
spacing between them means anything. But a real instrument doesn't just
produce "some data" — it produces a genuine **time series**, where a fact
like "how frequently was this actually sampled" is real, useful, and
computable directly from the data itself, with nothing extra stored
alongside it. What would a function computing that fact actually need to
read, and how would it turn a list of timestamps into one number,
expressed in Hz?

### Introduce the Concept in Isolation

```kotlin
data class Sample(val timestampMillis: Long, val value: Double)

fun samplingRateHz(samples: List<Sample>): Double {
    if (samples.size < 2) return 0.0
    val totalSpanMillis = samples.last().timestampMillis - samples.first().timestampMillis
    val intervalCount = samples.size - 1
    val averageIntervalMillis = totalSpanMillis.toDouble() / intervalCount
    return 1000.0 / averageIntervalMillis
}

fun main() {
    val samples = listOf(
        Sample(0, 0.1),
        Sample(100, 0.2),
        Sample(200, 0.15),
        Sample(300, 0.18)
    )
    println(samplingRateHz(samples))
}
```

Compile and run:

```
kotlinc SamplingRate.kt -include-runtime -d SamplingRate.jar
java -jar SamplingRate.jar
```

Real output, from running this just now:

```
10.0
```

This proves the real arithmetic, not just the idea: four samples span
timestamps `0` to `300` — a `totalSpanMillis` of `300`, across
`intervalCount = samples.size - 1 = 3` gaps between them (four points make
three gaps, the same **off-by-one** counting fact worth naming explicitly:
it is *not* four gaps), giving an `averageIntervalMillis` of `300.0 / 3 =
100.0`. `1000.0 / 100.0 = 10.0` converts "one sample every 100
milliseconds" into "10 samples per second" — 10 Hz — matching a sampling
rate a real accelerometer might genuinely report. This is exactly what
makes `Channel.samples` a **time series**, not merely a list: this whole
computation only makes sense, and only produces a meaningful answer,
*because* the samples are ordered by time and their spacing carries real
information.

### Discard the Throwaway Example

The standalone `main` is deleted; `samplingRateHz` itself is not — it
becomes a real, permanent function in this project, reused directly next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/ScientificData.kt` (add
  `samplingRateHz`).
- **Change type:** Add.
- **Location:** Below `Dataset`'s closing parenthesis.
- **Dependencies:** `Sample`, from the previous unit.

### The Updated Project

`ScientificData.kt`, after this addition:

```kotlin
 1  data class Sample(val timestampMillis: Long, val value: Double)
 2
 3  data class Channel(val name: String, val unit: String, val samples: List<Sample>)
 4
 5  data class Dataset(val channels: List<Channel>)
 6
 7  fun samplingRateHz(samples: List<Sample>): Double {                                          // ← new
 8      if (samples.size < 2) return 0.0                                                          // ← new
 9      val totalSpanMillis = samples.last().timestampMillis - samples.first().timestampMillis    // ← new
10     val intervalCount = samples.size - 1                                                      // ← new
11     val averageIntervalMillis = totalSpanMillis.toDouble() / intervalCount                     // ← new
12     return 1000.0 / averageIntervalMillis                                                     // ← new
13 }                                                                                              // ← new
```

### Mechanical Walkthrough

- `fun samplingRateHz(samples: List<Sample>): Double` — takes a plain
  `List<Sample>` directly (not a whole `Channel`), so it stays reusable
  against any list of samples this project ever produces, including ones
  not (yet) wrapped in a `Channel` at all.
- `if (samples.size < 2) return 0.0` — a guard clause: computing a rate
  needs at least two points to have any interval to measure at all; one or
  zero samples returns a defined, sane `0.0` rather than dividing by zero
  further down.
- `samples.last().timestampMillis - samples.first().timestampMillis` — as
  explained in full in the Header (`List<T>.last`, `List<T>.first`);
  subtracting two `Long` timestamps produces the total real-world time
  span the whole list of samples covers, in milliseconds.
- `val intervalCount = samples.size - 1` — the off-by-one fact named
  above, made explicit as its own named value rather than buried inline,
  specifically so a reader doesn't have to re-derive "why minus one"
  themselves.
- `totalSpanMillis.toDouble() / intervalCount` — `toDouble()` is a real
  Kotlin numeric-conversion function (`fun Long.toDouble(): Double`),
  required here because dividing two `Long`s in Kotlin performs **integer
  division**, silently truncating any fractional remainder — without this
  conversion, `300L / 3` would still correctly give `100`, but a
  less-evenly-spaced real dataset could silently lose real precision with
  no compiler warning at all.
- `1000.0 / averageIntervalMillis` — converts "milliseconds between
  samples" into "samples per second," using `1000.0` (a `Double` literal,
  not `1000`, so this division is real, floating-point division from the
  start).

### CS Lens

`samplingRateHz` computing a *rate* from a sequence of *timestamped
events* is the same fundamental measurement every performance-monitoring
system, every network protocol's throughput counter, and every biological
system's own heart-rate calculation (beats over a time span) computes,
using the identical "count the intervals, not the points" arithmetic this
unit just proved.

### SE Lens

**Why is `samplingRateHz` a plain function taking a `List<Sample>`, rather
than a method defined directly on `Channel` itself (`channel.samplingRateHz()`)?**
The method alternative is real, and arguably reads more naturally at a call
site. It was not chosen because `Sample` and `Channel` are meant to stay
pure data holders — plain facts, with zero behavior of their own attached —
so that every future computation this curriculum adds (and Part IV, Part V,
and Part VI of this curriculum's outline add *many* — derivatives,
statistics, FFTs) can be written as its own free function operating on
`List<Sample>`, without `Channel`'s own source file needing to grow a new
method for every single one. The cost paid: reaching this function
requires an explicit, separate call (`samplingRateHz(channel.samples)`)
rather than Kotlin's dot-call syntax reading slightly more fluently.

---

## Concept Unit: Trial, Session, Experiment — Provenance and Why Every Level Stays Immutable

### The Problem

`Dataset` alone doesn't say *which* run of *which* experiment produced it,
or when. Without that, a saved dataset years from now would be an orphaned
pile of numbers — no way to know what it measured, whether it came from a
real device or Lesson 9's future simulator, or which of possibly many
attempts it represents. And separately: every one of these entities has
been declared with `val` fields throughout this lesson — is that just
following Lesson 2's established convention, or does immutability
specifically matter *more* for a scientific record than it did for
`Instrument`?

### The New Code

```kotlin
data class Trial(
    val id: String,
    val startedAtMillis: Long,
    val stoppedAtMillis: Long,
    val dataset: Dataset
)

data class Session(val id: String, val trials: List<Trial>)

data class Experiment(
    val id: String,
    val definitionId: String,
    val recordedAtMillis: Long,
    val sessions: List<Session>
)
```

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/ScientificData.kt` (add `Trial`,
  `Session`, `Experiment`).
- **Change type:** Add.
- **Location:** Below `samplingRateHz`.
- **Dependencies:** `Dataset`, from the first unit; `ExperimentDefinition`
  (Lesson 4), referenced only by its `id` field's type (`String`), not
  imported directly.

### The Updated Project

`ScientificData.kt`, in full, after this lesson's three units combined:

```kotlin
 1  data class Sample(val timestampMillis: Long, val value: Double)
 2
 3  data class Channel(val name: String, val unit: String, val samples: List<Sample>)
 4
 5  data class Dataset(val channels: List<Channel>)
 6
 7  fun samplingRateHz(samples: List<Sample>): Double {
 8      if (samples.size < 2) return 0.0
 9      val totalSpanMillis = samples.last().timestampMillis - samples.first().timestampMillis
10     val intervalCount = samples.size - 1
11     val averageIntervalMillis = totalSpanMillis.toDouble() / intervalCount
12     return 1000.0 / averageIntervalMillis
13 }
14
15 data class Trial(                                             // ← new
16     val id: String,                                           // ← new
17     val startedAtMillis: Long,                                // ← new
18     val stoppedAtMillis: Long,                                // ← new
19     val dataset: Dataset                                      // ← new
20 )                                                              // ← new
21
22 data class Session(val id: String, val trials: List<Trial>)   // ← new
23
24 data class Experiment(                                        // ← new
25     val id: String,                                           // ← new
26     val definitionId: String,                                 // ← new
27     val recordedAtMillis: Long,                                // ← new
28     val sessions: List<Session>                                // ← new
29 )                                                              // ← new
```

The file now defines the complete six-level hierarchy this whole lesson
promised, with nothing left abstract — every level is a real, constructible
`data class`, verified next.

Verified this session with a temporary driver (not part of this file),
proving the whole hierarchy actually constructs and traverses correctly,
end to end:

```kotlin
fun main() {
    val xChannel = Channel("x", "m/s^2", listOf(Sample(0, 0.01), Sample(100, 0.02)))
    val yChannel = Channel("y", "m/s^2", listOf(Sample(0, 9.81), Sample(100, 9.80)))
    val dataset = Dataset(listOf(xChannel, yChannel))
    val trial = Trial(id = "trial-1", startedAtMillis = 0, stoppedAtMillis = 100, dataset = dataset)
    val session = Session(id = "session-1", trials = listOf(trial))
    val experiment = Experiment(id = "exp-1", definitionId = "generic", recordedAtMillis = 1000, sessions = listOf(session))

    println(experiment.sessions.first().trials.first().dataset.channels.map { it.name })
    println(experiment.sessions.first().trials.first().dataset.channels.first().samples.size)
}
```

```
kotlinc Hierarchy.kt -include-runtime -d Hierarchy.jar
java -jar Hierarchy.jar
```

Real output, from running this just now:

```
[x, y]
2
```

`.map { it.name }` (a real stdlib function, `inline fun <T, R> Iterable<T>.map(transform: (T) -> R): List<R>`,
transforming each element of a collection into a new value, here extracting
just each channel's `name`) proves both channels survived the full round
trip through every level of nesting, correctly, and `.samples.size`
confirms the innermost `Sample` list is reachable, and correctly sized,
five levels down from `experiment` itself.

### Mechanical Walkthrough

- `data class Trial(val id: String, val startedAtMillis: Long, val stoppedAtMillis: Long, val dataset: Dataset)`
  — `id` gives this specific trial a real, stable identity (the **entity**
  concept named in the Header) — two trials with an identical `dataset`
  are still two different, distinguishable trials; `startedAtMillis`/
  `stoppedAtMillis` mirror `ExperimentState.Running`/`Stopped`'s own field
  names from Lesson 3, deliberately, since a `Trial` is this app's
  permanent record of exactly one completed run through that state
  machine.
- `data class Session(val id: String, val trials: List<Trial>)` — the
  identical aggregation shape as `Dataset`/`Channel`, one level up: a
  session is one sitting in which possibly several trials were run.
- `data class Experiment(val id: String, val definitionId: String, val recordedAtMillis: Long, val sessions: List<Session>)`
  — `definitionId: String` is this lesson's actual **provenance** field:
  it names, by id, exactly which `ExperimentDefinition` (Lesson 4) this
  record is an instance of — deliberately a plain `String`, not a direct
  `ExperimentDefinition` reference, the identical id-based-reference
  choice `ExperimentDefinition.requiredInstrumentIds` (Lesson 4) already
  made for the same reason: a saved `Experiment` needs to persist and
  reload correctly (Lesson 16, ahead in this curriculum) long after the
  in-memory `ExperimentDefinition` object that produced it is gone —
  an id survives that; a direct object reference cannot.
  `recordedAtMillis` is the second half of provenance: *when* this record
  was made, independent of any individual trial's own timing.

### CS Lens

Naming this file's own final concern — **provenance** — as a first-class
part of the data model itself (`definitionId`, `recordedAtMillis`), rather
than leaving "where did this come from" as an assumption or a filename
convention, is the same idea behind a scientific paper's own materials-and-methods
section, a blockchain transaction's reference to its previous block, or a
version-control commit's parent-commit reference — in every case, a record
that doesn't just state a fact, but states verifiably where that fact came
from.

### SE Lens

**Why does immutability (`val` everywhere, no `var` anywhere in this whole
file) matter *more* here than it did for `Instrument` back in Lesson 2?**
A real, concrete hazard proves the answer, rather than a general appeal to
"immutability is good practice":

```kotlin
data class Sample(val timestampMillis: Long, val value: Double)
data class Channel(val name: String, val unit: String, val samples: List<Sample>)

fun main() {
    val liveBuffer = mutableListOf(Sample(0, 0.1), Sample(100, 0.2))
    val recorded = Channel(name = "x", unit = "m/s^2", samples = liveBuffer)
    println("Right after recording: ${recorded.samples.size} samples")
    liveBuffer.add(Sample(200, 0.99))
    println("After more data arrives elsewhere: ${recorded.samples.size} samples")

    val safeCopy = Channel(name = "x", unit = "m/s^2", samples = liveBuffer.toList())
    liveBuffer.add(Sample(300, 0.5))
    println("Safe copy after more data arrives: ${safeCopy.samples.size} samples")
}
```

Real output, from running this just now:

```
Right after recording: 2 samples
After more data arrives elsewhere: 3 samples
Safe copy after more data arrives: 3 samples
```

This is a genuine, real bug this exact code shape can produce: `Channel`'s
`samples` field is declared as the read-only type `List<Sample>` — but a
`MutableList` (`liveBuffer`) was assigned into it directly, and Kotlin's
`List` interface is only a **read-only view**, not a guarantee that the
underlying object can't change — `recorded.samples` and `liveBuffer` are,
underneath, the exact same object in memory. `recorded`'s own sample count
silently grew from `2` to `3`, *after* it was supposedly already recorded,
with nothing about `recorded`'s own declared type warning that this could
happen. `safeCopy`, built with `liveBuffer.toList()` (explained in full in
the Header) instead, made a genuine, independent copy at that instant — a
later `liveBuffer.add(...)` has zero effect on it. This is exactly why
every entity in this file matters more here than in `Instrument`: an
`Instrument`'s own catalog entry is fixed at compile time and never
constructed from a live, still-changing buffer; a `Trial`'s `Dataset`, once
this curriculum starts recording real sensor data (Lesson 15 onward), will
be built directly from a live stream still receiving new samples in real
time — the exact hazard just proven, not a hypothetical one. Every real
recording function this curriculum ever writes must call `.toList()` (or
build the list correctly from the start) at the moment a `Trial` is
considered finished — a real, concrete rule this lesson establishes now,
for code that doesn't exist yet.

---

## Connect the Pieces

One trace through this lesson: the `Order`/`LineItem` lab proved that
Kotlin's `data class` equality and iteration both correctly recurse through
nested aggregation, before `Sample`, `Channel`, and `Dataset` reused that
exact shape for real measurement data; `samplingRateHz` proved that an
ordered list of timestamped samples is genuinely more than "just a list" —
a real rate is computable from timestamps alone; `Trial`, `Session`, and
`Experiment` closed the hierarchy, with `Experiment.definitionId` tying
every record back to Lesson 4's own registry by id; and the final mutation
hazard proved, concretely, why every one of these six types staying
immutable is a correctness requirement for this project's future, not a
style preference held over from Lesson 2. Nothing in the real app
constructs one of these yet — that begins with Lesson 9's simulator and
Lesson 15's real recording — but every future measurement this curriculum
ever produces now has exactly one shape to fit into.

Next: quantity and unit types — giving `Sample.value` and `Channel.unit`'s
plain `Double` and `String` real, type-checked physical meaning, so `5`
meters and `5` seconds can never be silently added together as if they
were the same kind of thing.
