# Lesson 6: A Number Alone Is Not a Measurement — Quantities, Dimensions, and Units

**What you will build:** A pure Kotlin `Quantity`/`MeasurementUnit` system —
no UI, no Android dependency — that can represent `5 m`, `5 s`, and `5 m/s`
as three genuinely distinguishable values (not just three numbers that
happen to equal `5`), and can convert a length between meters and feet
while refusing, loudly, to "convert" a length into a time. The transferable
problem: every number this curriculum's app will ever record or compute —
an acceleration, a distance, a duration, a frequency — means something
different depending on what physical quantity it represents. A raw
`Double` can't tell `5` meters apart from `5` seconds; both are just `5.0`.
What has to exist, in code, before a number can honestly be called a
*measurement*?

**What you need to know first:** Lesson 1 of this curriculum (`sealed
class`, `data object`). Lesson 2 (`data class` domain models). Lesson 5
(the mutation hazard around shared mutable state — this lesson's own units
are, like every entity so far, entirely immutable).

**Terms used in this lesson:**
- **Physical dimension** — the fundamental *kind* of physical quantity
  something measures — length, time, mass, and so on — independent of which
  specific unit expresses it. A meter and a foot are different units but
  the identical dimension (length); a meter and a second are different
  units *and* different dimensions.
- **SI base unit** — one of the International System of Units' seven
  reference units (the meter for length, the second for time, the kilogram
  for mass, and four others this lesson doesn't need) — the standard every
  other unit of the same dimension is ultimately defined in terms of.
- **Derived unit** — a unit built by combining base units, representing a
  dimension that isn't fundamental on its own (velocity — meters per
  second — is length divided by time; it has no SI base unit of its own,
  because it doesn't need one once meters and seconds already exist).
- **Conversion factor** — the fixed number relating one unit to another
  unit of the *same* dimension (one foot equals exactly `0.3048` meters) —
  a fact about the units themselves, never about any specific measured
  value.

**Objects and methods used:**

- **`Dimension`** (this lesson's own new type)
  - *What it is:* A closed, named list of the physical dimensions this
    app's unit system currently understands.
  - *Implementation:* `enum class Dimension { LENGTH, TIME, MASS, VELOCITY }`.
  - *Its use:* Every `MeasurementUnit` declares which one it belongs to;
    `convertTo` checks two units share one before allowing a conversion.
  - *Type:* An `enum class` — Kotlin's construct for a genuinely fixed,
    small set of named constants, all sharing one identical shape (unlike
    `sealed class`, met in Lesson 1, whose subclasses can each carry
    different data — every `Dimension` constant here is identical in shape,
    a bare name with no fields, which is exactly what makes `enum class`
    the right choice here instead of `sealed class`).
  - *Responsibility:* Answer exactly one question — "what fundamental kind
    of physical quantity is this" — for any `MeasurementUnit`.
  - *Depends on:* Nothing; it's a fixed, self-contained set of constants.
  - *Connects to:* Read by every `MeasurementUnit` subclass's own
    constructor call, and compared directly inside `convertTo`.
  - *Shape:* The actual boundary this whole lesson is about: two units
    with the same `Dimension` can be meaningfully converted between; two
    units with different `Dimension`s cannot, ever, no matter what
    conversion factor might be invented for them.

- **`MeasurementUnit`** (this lesson's own new sealed hierarchy)
  - *What it is:* A closed set of every unit this app currently
    understands, each one knowing its own display symbol, its own
    dimension, and the fixed factor converting one of it into its
    dimension's base unit.
  - *Implementation:*
    ```kotlin
    sealed class MeasurementUnit(val symbol: String, val dimension: Dimension, val toBaseFactor: Double) {
        data object Meter : MeasurementUnit("m", Dimension.LENGTH, toBaseFactor = 1.0)
        data object Foot : MeasurementUnit("ft", Dimension.LENGTH, toBaseFactor = 0.3048)
        data object Second : MeasurementUnit("s", Dimension.TIME, toBaseFactor = 1.0)
        data object Kilogram : MeasurementUnit("kg", Dimension.MASS, toBaseFactor = 1.0)
        data object MetersPerSecond : MeasurementUnit("m/s", Dimension.VELOCITY, toBaseFactor = 1.0)
    }
    ```
  - *Its use:* `Quantity.unit` holds one of these; `convertTo` reads
    `dimension` and `toBaseFactor` from both the source and target unit.
  - *Type:* A `sealed class` with five `data object` singleton subclasses —
    the identical shape `StemArea` (Lesson 1) already used.
  - *Responsibility:* Be the single, closed source of truth for "what units
    exist, what dimension each belongs to, and how to convert each one to
    its own dimension's base unit" — nothing about performing a conversion
    itself, only the facts a conversion needs.
  - *Depends on:* A `Dimension`, at construction, for each subclass.
  - *Connects to:* Constructed once, as five singletons; read by `Quantity`
    and `convertTo`.
  - *Shape:* This lesson's actual data-integrity boundary — every unit this
    app will ever use has to be declared here, as a real subclass, before
    any code anywhere can construct a `Quantity` using it.

  > **A genuine naming hazard, caught by actually compiling this:** the
  > obvious name for this type is simply `Unit` — but Kotlin already has a
  > built-in type named exactly that (`kotlin.Unit`, the real return type
  > of any function or lambda that "returns nothing meaningful," used
  > constantly and usually invisibly, including by every `onClick: () ->
  > Unit` this curriculum's UI code already writes). Declaring
  > `sealed class Unit` inside this app's own `com.stemlab.app` package was
  > tried, compiled successfully on its own, and then broke every lambda
  > in the whole project expecting to return `kotlin.Unit` — the compiler
  > resolved every bare `Unit` inside this package to the new local class
  > instead of the standard library's, with a real, confirmed compiler
  > error: `return type mismatch: expected 'com.stemlab.app.Unit', actual
  > 'kotlin.Unit'`. This is exactly what "type-safe domain modeling" (this
  > lesson's own stated engineering focus) has to watch for on both sides:
  > a type system that catches `5 m + 5 s` as an error is only a genuine
  > improvement if it doesn't introduce a *different*, worse class of
  > error by colliding with a name the rest of the language already
  > depends on. `MeasurementUnit` avoids the collision entirely.

- **`require`**
  - *What it is:* A Kotlin standard-library function for validating an
    argument or a precondition, failing loudly and specifically when it
    doesn't hold.
  - *Implementation:* `fun require(value: Boolean, lazyMessage: () -> Any): Unit`,
    in `kotlin.PreconditionsKt`; when `value` is `false`, it throws
    `IllegalArgumentException(lazyMessage().toString())`.
  - *Its use:* `convertTo` calls it to refuse converting between two
    different dimensions.
  - *Type:* A top-level standard-library function.
  - *Responsibility:* Check one Boolean condition and, if it's false,
    immediately halt with a real, typed exception carrying a specific
    explanation — functionally close to `error` (Lesson 3), but with a
    real, meaningful difference covered directly in this unit's own SE
    Lens.
  - *Depends on:* A `value` to check and a `lazyMessage` lambda — `lazy`,
    specifically, because building the message string (which involves
    string-template interpolation) only needs to happen on the failure
    path, never wasted work on the success path.
  - *Connects to:* Called once, at the top of `convertTo`, before any real
    conversion math runs.
  - *Shape:* The actual, single gate this whole lesson's conversion logic
    passes every call through before doing anything else.

---

## Concept Unit: A Quantity Is a Value *and* a Unit, Never a Value Alone

### The Problem

`5.0` alone cannot honestly represent a measurement — is it 5 meters,
5 seconds, 5 kilograms? Nothing about a bare `Double` can say. Before this
app can compute a single real derivative, statistic, or physics formula
correctly, something has to hold *both* a number and what that number
actually counts, together, as one real value — and, critically, two
`Quantity`s that happen to share the same number but not the same unit
must never accidentally compare as the same thing.

Given `Instrument` (Lesson 2) and `ExperimentDefinition` (Lesson 4) — both
plain `data class`es holding a handful of unrelated fields together — what
would you try first for "a number, plus a tag saying what kind of number it
is"? What test would actually prove that tag is doing real work, rather
than being decoration a careless comparison could still ignore?

### Introduce the Concept in Isolation

```kotlin
enum class Dimension { LENGTH, TIME, MASS, VELOCITY }

sealed class MeasurementUnit(val symbol: String, val dimension: Dimension)
data object Meter : MeasurementUnit("m", Dimension.LENGTH)
data object Second : MeasurementUnit("s", Dimension.TIME)
data object MetersPerSecond : MeasurementUnit("m/s", Dimension.VELOCITY)

data class Quantity(val value: Double, val unit: MeasurementUnit)

fun main() {
    val length = Quantity(5.0, Meter)
    val time = Quantity(5.0, Second)
    val velocity = Quantity(5.0, MetersPerSecond)
    println(length == time)
    println(length)
    println(time)
    println(velocity)
}
```

Compile and run:

```
kotlinc QuantityBasic.kt -include-runtime -d QuantityBasic.jar
java -jar QuantityBasic.jar
```

Real output, from running this just now:

```
false
Quantity(value=5.0, unit=Meter)
Quantity(value=5.0, unit=Second)
Quantity(value=5.0, unit=MetersPerSecond)
```

This proves the actual point directly: `length == time` is `false`, even
though both hold the identical `value`, `5.0` — because `data class`'s
generated `equals` (met in Lesson 2, and every entity since) compares
*every* constructor property, `unit` included, not just `value` alone.
`5` meters and `5` seconds are provably, checkedly different values in this
system — this is called giving a raw number **type-safe physical meaning**:
the type itself, not a comment or a variable name, is what now distinguishes
them.

### Discard the Throwaway Example

`Meter`, `Second`, `MetersPerSecond` (as bare top-level declarations),
and `main` are all deleted. `Dimension`, the general shape of
`MeasurementUnit`, and `Quantity` itself are not — they're rebuilt, for
real, with their full, permanent shape, in the next two units.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/Quantity.kt`.
- **Change type:** Add.
- **Location:** New file, package `com.stemlab.app`.
- **Dependencies:** None yet.

### The New Code

```kotlin
data class Quantity(val value: Double, val unit: MeasurementUnit)
```

(`MeasurementUnit` itself is defined in the next unit — `Quantity`'s own
declaration is shown here alone, matching this Concept Unit's own single
new idea: a quantity is a value paired with a unit, full stop.)

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption, this step is skipped.

### Mechanical Walkthrough

- `data class Quantity(val value: Double, val unit: MeasurementUnit)` — two
  constructor properties: `value`, a plain `Double` with no inherent
  meaning on its own, and `unit`, which supplies that meaning; `data
  class` (met repeatedly since Lesson 2) generates the exact `equals`
  behavior the lab above just proved — comparing both fields, not just
  `value`.

### CS Lens

Pairing a raw value with a tag describing what it *means* is the same idea
behind a **tagged value** or **unit type** in type theory — using the type
system itself to prevent a whole category of mistake (mixing up what two
numbers actually represent) at the language level, rather than trusting
every piece of code, forever, to remember it by convention.

Also recognized in: F#'s and Rust's own units-of-measure and newtype
patterns; a database column typed `MONEY` instead of a bare `DECIMAL`,
specifically so it can't be silently added to a `DECIMAL` representing a
row count; NASA's own, real 1999 Mars Climate Orbiter loss — a genuine,
famous incident where one team's software used pound-force-seconds and
another's used newton-seconds, with nothing in either system's own types
catching the mismatch before the spacecraft was lost.

### SE Lens

**Why is `Quantity` a plain `data class` holding a `MeasurementUnit`,
instead of one separate type per unit — a `Meters` class, a `Seconds`
class, each with its own `Double` field?** The one-class-per-unit
alternative is real (and is, in fact, exactly the "unit type" pattern
Rust's and F#'s ecosystems often use, cited above) — it was not chosen
here because this app's own future lessons (Part IV's calculus,
Part V's statistics) need to write genuinely generic functions —
`samplingRateHz` from Lesson 5 is a preview of exactly this — that operate
on "a numeric quantity" without one separate overload written by hand per
unit that might ever exist. The cost accepted here, in exchange for that
generality: `unit` mismatches (like `5 m` versus `5 s`) are caught by
comparing a *value* at runtime (as this unit's own lab just proved,
through `equals`), not rejected by the compiler at compile time the way a
`Meters`-versus-`Seconds` type mismatch would be. This curriculum's own
next lesson, Dimensional Analysis, is what turns this into an actively
*enforced* runtime check for arithmetic operations specifically — this
lesson only builds the representation those checks will run against.

---

## Concept Unit: SI Base Units and Physical Dimensions

### The Problem

`Dimension` alone can say "this is a length" — but a length still needs an
*actual unit* to be expressed in: meters, feet, miles, and countless
others all measure length, and all of them need to agree, ultimately, on
some fixed reference point, or converting between any two of them would be
arbitrary and meaningless.

### The New Code

```kotlin
enum class Dimension { LENGTH, TIME, MASS, VELOCITY }

sealed class MeasurementUnit(val symbol: String, val dimension: Dimension, val toBaseFactor: Double) {
    data object Meter : MeasurementUnit("m", Dimension.LENGTH, toBaseFactor = 1.0)
    data object Second : MeasurementUnit("s", Dimension.TIME, toBaseFactor = 1.0)
    data object Kilogram : MeasurementUnit("kg", Dimension.MASS, toBaseFactor = 1.0)
}
```

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified — `Quantity.kt` (add `Dimension` and the
  start of `MeasurementUnit`, above `Quantity`'s own declaration).
- **Change type:** Add.
- **Location:** Top of the file, before `Quantity`.
- **Dependencies:** None.

### The Updated Project

`Quantity.kt`, after this addition:

```kotlin
 1  enum class Dimension { LENGTH, TIME, MASS, VELOCITY }                                        // ← new
 2
 3  sealed class MeasurementUnit(val symbol: String, val dimension: Dimension, val toBaseFactor: Double) { // ← new
 4      data object Meter : MeasurementUnit("m", Dimension.LENGTH, toBaseFactor = 1.0)             // ← new
 5      data object Second : MeasurementUnit("s", Dimension.TIME, toBaseFactor = 1.0)              // ← new
 6      data object Kilogram : MeasurementUnit("kg", Dimension.MASS, toBaseFactor = 1.0)           // ← new
 7  }                                                                                              // ← new
 8
 9  data class Quantity(val value: Double, val unit: MeasurementUnit)
```

### Mechanical Walkthrough

- `enum class Dimension { LENGTH, TIME, MASS, VELOCITY }` — as explained
  in full in the Header; four named constants, `VELOCITY` included even
  though this unit doesn't yet define a unit for it (that's the next
  unit's own subject).
- `sealed class MeasurementUnit(val symbol: String, val dimension: Dimension, val toBaseFactor: Double)`
  — as explained in full in the Header; a real, three-field primary
  constructor every subclass must supply values for.
- `data object Meter : MeasurementUnit("m", Dimension.LENGTH, toBaseFactor = 1.0)` —
  `Meter`'s `toBaseFactor` is exactly `1.0` specifically *because the
  meter is itself the SI base unit* for length — converting a meter "to
  the base unit" is a no-op by definition; this is the real,
  concrete meaning of **SI base unit**: the one reference unit every other
  unit of that dimension gets compared against, with a factor of exactly
  `1.0` for itself.
- `data object Second : MeasurementUnit("s", Dimension.TIME, toBaseFactor = 1.0)` /
  `data object Kilogram : MeasurementUnit("kg", Dimension.MASS, toBaseFactor = 1.0)`
  — the identical pattern, one SI base unit per remaining dimension this
  lesson covers (of the seven real SI base units, this app currently
  needs exactly these three; the other four — ampere, kelvin, mole,
  candela — aren't needed by any lesson this curriculum has planned so
  far, and aren't declared speculatively).

### CS Lens

Anchoring every unit's conversion factor to one shared reference point
(`toBaseFactor` relative to the SI base unit) rather than storing a direct
factor between every possible *pair* of units is the same idea as a
**canonical form**: instead of needing a conversion rule for every one of
`n × (n-1)` possible unit pairs, only `n` facts (each unit's relationship
to one shared reference) are needed, and any pair can be related by going
through that shared reference — the same reason timestamps are usually
stored relative to one shared epoch (Unix time) rather than every possible
pair of calendars needing a direct conversion rule to every other one.

### SE Lens

**Why is `toBaseFactor` a stored `Double` field on each unit, rather than a
computed function?** A function (`fun toBaseFactor(): Double`) would work
identically for every unit *this lesson* defines, since every real
conversion factor between fixed units is, in fact, a constant. It's stored
as a plain field instead specifically because a stored `val` makes that
fact — "this number never changes for this unit, ever" — a structural
guarantee enforced by Kotlin's own `val` immutability (met since Lesson
1), rather than a function body a future edit could accidentally make
non-constant (reading a live sensor value into a "conversion factor,"
for instance, would be a real category error this project wants prevented
by the type's own shape, not caught only by careful review).

---

## Concept Unit: Derived Units — Built From Base Units, Not Independently Defined

### The Problem

Velocity has no SI base unit of its own — there's no seventh fundamental
"speed" reference the way there is for length or time. And yet "meters per
second" is a completely real, meaningful unit this app needs (every future
sensor-reading lesson in Part II and Part IV of this curriculum's outline
depends on exactly this). How can a unit exist, and be just as usable as
`Meter` or `Second`, without ever needing its own fundamental reference
point?

### The New Code

```kotlin
data object MetersPerSecond : MeasurementUnit("m/s", Dimension.VELOCITY, toBaseFactor = 1.0)
```

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified — `Quantity.kt` (add `MetersPerSecond`
  inside `MeasurementUnit`'s body).
- **Change type:** Add.
- **Location:** Inside `MeasurementUnit`, after `Kilogram`.
- **Dependencies:** `MeasurementUnit`, `Dimension.VELOCITY`, from the
  previous unit.

### The Updated Project

`MeasurementUnit`'s body, in full, after this addition:

```kotlin
1  sealed class MeasurementUnit(val symbol: String, val dimension: Dimension, val toBaseFactor: Double) {
2      data object Meter : MeasurementUnit("m", Dimension.LENGTH, toBaseFactor = 1.0)
3      data object Second : MeasurementUnit("s", Dimension.TIME, toBaseFactor = 1.0)
4      data object Kilogram : MeasurementUnit("kg", Dimension.MASS, toBaseFactor = 1.0)
5      data object MetersPerSecond : MeasurementUnit("m/s", Dimension.VELOCITY, toBaseFactor = 1.0) // ← new
6  }
```

### Mechanical Walkthrough

- `data object MetersPerSecond : MeasurementUnit("m/s", Dimension.VELOCITY, toBaseFactor = 1.0)` —
  structurally identical to `Meter`, `Second`, and `Kilogram` — the same
  three-argument constructor call, the same `data object` shape — and yet
  it represents something genuinely different: a **derived unit**. Its
  `toBaseFactor` is `1.0` for the same underlying reason `Meter`'s is:
  meters-per-second is, itself, this app's chosen base reference *for the
  velocity dimension specifically* — the same "one shared reference point"
  idea from the previous unit's CS Lens, just applied to a dimension whose
  reference happens to be built from two other dimensions' own units
  (length divided by time) rather than being physically fundamental on its
  own.

### CS Lens

`MeasurementUnit` treats a **derived unit** with the identical structural
shape as a base unit — same fields, same construction, same
`sealed class` membership — which is a real instance of the **Liskov
substitution principle**: anywhere code expects a `MeasurementUnit`
(`Quantity.unit`, `convertTo`'s parameters), a derived unit like
`MetersPerSecond` behaves correctly, with no special-casing required to
tell it apart from a base unit like `Meter`.

### SE Lens

**Why doesn't `MeasurementUnit` model a derived unit's real composition —
some structure explicitly saying "this equals LENGTH divided by TIME" —
instead of just another flat `Dimension.VELOCITY` constant?** A fully
compositional model (a real "unit algebra" tracking exponents of each base
dimension, letting the system *derive* that dividing a length by a time
produces a velocity automatically) is real, and is precisely what a mature
scientific-computing platform eventually wants — and this curriculum's own
outline, in Lesson 7 ("Dimensional Analysis," immediately next), begins
building exactly that. It isn't built yet, here, because this lesson's own
scope is representation and conversion for a small, fixed, hand-declared
set of units — introducing full compositional dimension algebra before a
single unit has even been represented would mean building the harder,
more general system before proving the simpler, concrete one actually
works. The cost paid for that deliberate ordering: adding a sixth unit
today (an `enum class Dimension` shared constant) requires a real, manual
choice among existing `Dimension` values, or a new one added by hand — a
limitation Lesson 7 addresses directly, not this one.

---

## Concept Unit: Conversion — Moving Between Units of the Same Dimension

### The Problem

`MeasurementUnit.Foot` doesn't exist in this file yet, and even once it
does, nothing yet turns "100 meters" into "how many feet is that" — or,
just as important, correctly *refuses* to answer "how many seconds is
100 meters," because that question has no meaningful answer at all.

Given `toBaseFactor` (a fixed number relating any unit to its dimension's
shared reference): if you had a value in unit A and wanted it in unit B,
both of the same dimension, what two-step arithmetic path — through that
shared reference point — would get you there, using only each unit's own
`toBaseFactor`?

### The New Code

```kotlin
data object Foot : MeasurementUnit("ft", Dimension.LENGTH, toBaseFactor = 0.3048)

fun Quantity.convertTo(target: MeasurementUnit): Quantity {
    require(unit.dimension == target.dimension) {
        "Cannot convert ${unit.symbol} to ${target.symbol}: different dimensions"
    }
    val valueInBase = value * unit.toBaseFactor
    val convertedValue = valueInBase / target.toBaseFactor
    return Quantity(convertedValue, target)
}
```

Verified this session with a temporary driver (not part of this file):

```kotlin
fun main() {
    val trackLength = Quantity(100.0, MeasurementUnit.Meter)
    val trackInFeet = trackLength.convertTo(MeasurementUnit.Foot)
    println(trackInFeet)

    val backToMeters = trackInFeet.convertTo(MeasurementUnit.Meter)
    println(backToMeters)

    val bad = trackLength.convertTo(MeasurementUnit.Second)
    println(bad)
}
```

```
kotlinc QuantityFull.kt -include-runtime -d QuantityFull.jar
java -jar QuantityFull.jar
```

Real output, from running this just now:

```
Quantity(value=328.0839895013123, unit=Foot)
Quantity(value=100.0, unit=Meter)
Exception in thread "main" java.lang.IllegalArgumentException: Cannot convert m to s: different dimensions
	at QuantityFullKt.convertTo(QuantityFull.kt:14)
	at QuantityFullKt.main(QuantityFull.kt:39)
	at QuantityFullKt.main(QuantityFull.kt)
```

Three real facts proven at once: `100` meters converts to
`328.0839895013123` feet — `100 * 1.0 / 0.3048`, exactly the two-step
"through the base unit" arithmetic this unit's own Socratic question
asked about. Converting straight back (`328.0839895013123 * 0.3048 /
1.0`) lands on exactly `100.0` again, proving the round trip is
mathematically consistent, not just directionally plausible. And
attempting to convert a length into `Second` throws a real, specific
`IllegalArgumentException`, from `require`, before any arithmetic even
runs — this is the direct fulfillment of this lesson's own stated result:
`5 m`, `5 s`, and `5 m/s` are not just *displayed* differently, they're
now types the system actively refuses to confuse.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified — `Quantity.kt` (add `Foot` inside
  `MeasurementUnit`; add `convertTo` at file scope, below `Quantity`).
- **Change type:** Add.
- **Location:** `Foot` alongside `Meter`/`Second`/`Kilogram`/
  `MetersPerSecond`; `convertTo` below `Quantity`'s closing parenthesis.
- **Dependencies:** `Quantity`, `MeasurementUnit`, `Dimension` — every
  earlier unit of this lesson.

### The Updated Project

`Quantity.kt`, in full, after this lesson's four units combined:

```kotlin
 1  enum class Dimension { LENGTH, TIME, MASS, VELOCITY }
 2
 3  sealed class MeasurementUnit(val symbol: String, val dimension: Dimension, val toBaseFactor: Double) {
 4      data object Meter : MeasurementUnit("m", Dimension.LENGTH, toBaseFactor = 1.0)
 5      data object Foot : MeasurementUnit("ft", Dimension.LENGTH, toBaseFactor = 0.3048)          // ← new
 6      data object Second : MeasurementUnit("s", Dimension.TIME, toBaseFactor = 1.0)
 7      data object Kilogram : MeasurementUnit("kg", Dimension.MASS, toBaseFactor = 1.0)
 8      data object MetersPerSecond : MeasurementUnit("m/s", Dimension.VELOCITY, toBaseFactor = 1.0)
 9  }
10
11 data class Quantity(val value: Double, val unit: MeasurementUnit)
12
13 fun Quantity.convertTo(target: MeasurementUnit): Quantity {                                    // ← new
14     require(unit.dimension == target.dimension) {                                              // ← new
15         "Cannot convert ${unit.symbol} to ${target.symbol}: different dimensions"               // ← new
16     }                                                                                           // ← new
17     val valueInBase = value * unit.toBaseFactor                                                 // ← new
18     val convertedValue = valueInBase / target.toBaseFactor                                      // ← new
19     return Quantity(convertedValue, target)                                                     // ← new
20 }                                                                                                // ← new
```

`Quantity.kt` is now a complete, self-contained, verified physical-quantity
system: five real units across four dimensions, and one function able to
correctly convert between any two units that genuinely share a dimension,
while refusing every pair that doesn't.

### Mechanical Walkthrough

- `data object Foot : MeasurementUnit("ft", Dimension.LENGTH, toBaseFactor = 0.3048)`
  — a second unit for `Dimension.LENGTH`; `0.3048` is the real, standard,
  internationally-defined exact conversion factor (one foot equals
  exactly `0.3048` meters).
- `fun Quantity.convertTo(target: MeasurementUnit): Quantity` — an
  **extension function** (the same construct explained, but not yet
  authored by this curriculum's own code, when `setContent` was met in
  Lesson 1) — `Quantity.` before the function name means `convertTo` can
  be called as `someQuantity.convertTo(...)`, exactly like a real member
  method, without `Quantity`'s own `data class` declaration needing to
  grow a method of its own — keeping `Quantity` itself a pure data holder,
  the same "behavior stays external to plain data types" choice Lesson 5's
  own SE Lens already made for `samplingRateHz`.
- `require(unit.dimension == target.dimension) { "..." }` — as explained
  in full in the Header; `unit` here refers to the receiver `Quantity`'s
  own `unit` property (accessible directly, with no `this.` needed, inside
  an extension function's body); the trailing lambda supplies the failure
  message lazily.
- `val valueInBase = value * unit.toBaseFactor` — converts the receiver's
  own value into the shared dimension-wide reference point (the "canonical
  form" idea from the second unit's CS Lens): for `100` meters, this is
  `100 * 1.0 = 100.0` (already in the base unit); for a value already in
  feet, this step would scale it *up* into meters.
- `val convertedValue = valueInBase / target.toBaseFactor` — the second
  half of the same "through the shared reference" path: dividing the
  base-unit value by the *target* unit's own factor converts it back out
  into that specific unit — for `100.0` (meters) converting to `Foot`
  (`toBaseFactor = 0.3048`), this is `100.0 / 0.3048 = 328.0839895013123`,
  exactly the value the real run above produced.
- `return Quantity(convertedValue, target)` — builds and returns a brand
  new `Quantity`; the original receiver `Quantity` is never mutated (it
  has no mutable fields to mutate), matching every immutable-record
  practice this curriculum has followed since Lesson 5.

### CS Lens

Converting through one shared reference point rather than a direct
per-pair formula, proven concretely by this unit's own round-trip test
(`100 m → 328.08... ft → 100 m`, landing exactly back where it started), is
the same idea behind any **normalization** step in a larger system —
converting disparate inputs into one common internal representation before
operating on them, then converting back out only when a specific external
form is actually needed.

### SE Lens

**Why does `convertTo` use `require` specifically, rather than the `error`
function this curriculum's own Lesson 3 already used for illegal state
transitions?** Both throw a real, immediate exception with a message — the
real, meaningful difference is *which* exception type each one throws:
`error` throws `IllegalStateException` — appropriate for Lesson 3's own
case, where the problem was the *object's own current state* being wrong
for the requested action. `require` throws `IllegalArgumentException` —
appropriate here, because the problem is specifically the *argument*
passed in (`target`, a unit of the wrong dimension), not anything wrong
with the `Quantity` itself. This distinction is a real, standard Kotlin/
Java convention, not a cosmetic choice: code that catches exceptions
selectively (a future lesson's own error-handling work, Part XVII of this
curriculum's outline) can distinguish "you gave me a bad argument" from
"the object itself is in a state that doesn't allow this" only if the
exception type itself already carries that distinction.

---

## Connect the Pieces

One trace through this lesson: the opening lab proved that pairing a
`value` with a `unit` inside `Quantity` makes `5 m` and `5 s` genuinely,
checkedly different values, not just two variables a programmer has to
remember not to confuse; `Dimension` and `MeasurementUnit`'s first three
entries then gave that `unit` field real substance, anchored to the actual
SI base units for length, time, and mass; `MetersPerSecond` proved a
derived unit needs no special-case treatment, carrying the identical shape
as a base unit despite representing a fundamentally different kind of
physical fact; and `convertTo`, verified with a real round-trip conversion
and a real refused illegal conversion, gave this whole system its actual
payoff — moving a measurement between compatible units correctly, and
refusing, with a specific, typed exception, to move one between
incompatible ones. Nothing in the real STEM Lab app calls any of this yet
— that begins once Lesson 9's simulator and later lessons produce real
`Sample` values needing real units attached — but the app can now, for the
first time in this curriculum, honestly tell `5 m` apart from `5 s` apart
from `5 m/s`, exactly as this lesson set out to prove.

Next: dimensional analysis — building on `Dimension` and `MeasurementUnit`
to catch invalid *operations* between quantities (adding a length to a
time, for instance), not just invalid conversions.
