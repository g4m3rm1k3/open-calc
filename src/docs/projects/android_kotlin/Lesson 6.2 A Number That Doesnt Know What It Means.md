# Lesson 6.2: A Number That Doesn't Know What It Means

**What you will build:** No new feature ships from this lesson — this is a real, executed investigation, staying purely conceptual for a genuine, honest reason this unit's own Problem states plainly. This slice's own real target features — `sin`, `cos` — each take one real angle as input. But a bare number like `90` doesn't, by itself, say whether it means a quarter turn or something else entirely: the same raw value means something completely different depending on whether it's read as **degrees** or **radians**. This lesson proves, with real, executed code, exactly what's different about the two, and exactly why closing this gap for real has to wait for a tool this project doesn't have yet.

**What you need to know first:** `enum class`, established since this project's own real `Operator`. Integer division and modulo, established since this project's own early work and its own real `Modulo` operation.

## Terms used in this lesson

- **Degrees** — a way of measuring an angle where one full turn equals exactly `360`. This word exists to name the specific, familiar unit most people already think in — chosen, historically, because `360` divides evenly by an unusually large number of small whole numbers (`2`, `3`, `4`, `5`, `6`, `8`, `9`, `10`, `12`...), making common fractions of a turn land on whole-number degree values.
- **Radians** — a different way of measuring the same angle, where one full turn equals `2π` (roughly `6.283`) instead of `360`. This word exists to name the unit real mathematics — and, as a direct consequence, real programming-language math libraries — actually build their own trigonometric functions around, because it's the one unit in which those functions' own underlying calculus comes out cleanest, not because it's more intuitive to read.
- **Angle mode** — the real, general software-engineering idea that a single raw numeric value can mean genuinely different things depending on an separate, explicit choice of unit, and that choice has to be tracked and respected everywhere the value is used. This word exists because the number itself carries no memory of which unit it was meant in — `90` is just `90`; something else, external to the number, has to say what it means.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — degrees, radians, angle mode — is itself a real external class or method; each one is a concept, and lives in Terms, above. Every entry below is supporting cast: already-established Kotlin constructs this unit's own throwaway lab depends on.

- **`enum class`**
  - *What it is:* A real Kotlin type restricted to a fixed, named set of possible values, already established from this project's own real `Operator`.
  - *Implementation:* `enum class Name { CONSTANT_ONE, CONSTANT_TWO, ... }` — unlike this project's own real `Operator`, which carries a real `Operation` per constant, an enum's own constants don't require any carried data at all.
  - *Its use:* This unit's own throwaway lab declares a new, real `AngleMode` enum with exactly two constants, `DEGREES` and `RADIANS`, representing the real choice a raw angle value needs alongside it to mean anything.
  - *Type:* A Kotlin class modifier.
  - *Responsibility:* Restricting a type to a fixed, exhaustive, named set of real values.
  - *Depends on:* Nothing, for a parameterless enum like this unit's own.
  - *Connects to:* `AngleMode`'s own real declaration, below.
  - *Shape:* Already-established Kotlin syntax, reappearing here in its simplest real form.
- **Integer division (`/`) and modulo (`%`)**
  - *What it is:* Already-established arithmetic operators, from this project's own earliest real work and its own real `Modulo` operation.
  - *Implementation:* For two `Int`s, `/` truncates any fractional part of the real mathematical quotient; `%` returns the real remainder left over.
  - *Its use:* This unit's own throwaway lab uses both together to compute exactly how many full rotations a real angle value represents in degrees, and how much is left over past the last complete one.
  - *Type:* Operator functions on `Int`.
  - *Responsibility:* Producing a truncated quotient and its own matching remainder.
  - *Depends on:* Two `Int` operands.
  - *Connects to:* Both called once in this unit's own throwaway `main`.
  - *Shape:* Already-established Kotlin syntax, reappearing here unchanged.

## Concept Unit: What a Raw Angle Actually Needs

### The Problem

This slice's own real target features — `sin`, `cos` — each take one real angle as their own input. But a bare `Int` like `90` says nothing, by itself, about which unit it's meant in — ninety *what*? This project has never had to answer that question before, since none of its real operators have ever taken an angle at all. Does this project's current design have anywhere to track that choice — and does the choice itself even matter, numerically, or is it just a labeling detail?

> If turning a full circle is `360` in one unit and roughly `6.283` in another, and someone hands you the bare number `90` with no unit attached, can you actually tell what fraction of a turn it represents? What real, practical reason might `360` — a number chosen thousands of years ago — divide evenly by so many small whole numbers, in a way `6.283` clearly doesn't? If a calculator's own future scientific mode needs to support *both* real units, what does that imply has to travel alongside every real angle value, everywhere it's used?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — a real, new `AngleMode` enum, and a real, executed demonstration of exactly what degrees make possible that this project can't yet do the same way for radians:

```kotlin
enum class AngleMode {
    DEGREES,
    RADIANS
}

fun main() {
    val angle = 750
    val mode = AngleMode.DEGREES

    val fullRotations = angle / 360
    val remainder = angle % 360
    println("$angle degrees = $fullRotations full rotation(s) plus $remainder degrees left over")
}
```

Compiled and run for real, this produced:

```
750 degrees = 2 full rotation(s) plus 30 degrees left over
```

`750 / 360` truncates to `2`, and `750 % 360` leaves `30` — both computed with nothing but this project's own already-established real `Int` arithmetic, no new numeric type required at all. This is real, concrete proof of degrees' own practical advantage: because a full turn is exactly `360`, an ordinary whole number, this project's own existing `Int`-based arithmetic can answer a real question about it — "how many full turns, and what's left over" — cleanly and exactly.

The identical real question asked in radians has no equally clean real answer available yet. A full turn in radians is `2π`, and `π` is irrational — it cannot be written down exactly as any finite decimal, let alone represented exactly by an `Int`. Answering "how many full rotations is `750` radians" for real would require genuine floating-point arithmetic — a real numeric type this project does not have yet. This is the real, honest, structural reason this unit stops here: `AngleMode` itself needs nothing but an enum to exist, but *using* it to actually convert between the two real units it names is a genuinely different, later real job.

### Discard the Throwaway Example

This `AngleMode` enum and its own real demonstration are deleted now and will not appear in this project again. This project's own real code is completely unmodified — this unit's own job was proving, concretely, what makes degrees and radians genuinely different in practice, not building a real, permanent angle-mode feature before this project has the real numeric tool that feature actually needs.

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in order:

- `enum class AngleMode { DEGREES, RADIANS }` — the real `enum class` construct, documented above, declaring exactly two real constants, neither one carrying any additional data.
- `fun main()`, `val angle = 750` — already established: a real `Int` literal, deliberately chosen larger than `360` specifically so it represents more than one full turn.
- `val mode = AngleMode.DEGREES` — already established, holding one of the two real constants just declared; unused directly in this unit's own arithmetic below, present to make explicit which real unit `angle` is actually meant to represent.
- `val fullRotations = angle / 360` — the real integer-division operator documented above, computing how many complete `360`-unit turns fit inside `750`.
- `val remainder = angle % 360` — the real modulo operator documented above, computing what's left over after those complete turns are removed.
- `println("$angle degrees = $fullRotations full rotation(s) plus $remainder degrees left over")` — a string template, already established, interpolating all three real values directly.

### CS Lens

Choosing the right unit for a real numeric quantity — and keeping track of which one is actually in play — is a real, recurring source of both elegant design and real, costly bugs across all of computing.

```
Also recognized in: real timekeeping (seconds vs. milliseconds vs.
nanoseconds), real currency handling (dollars vs. cents, a classic
real source of off-by-a-hundred bugs), real distance and mass units
across engineering software, and, famously, NASA's own real 1999 Mars
Climate Orbiter, lost because one real piece of software produced
values in pound-seconds while another real piece expected newton-
seconds, with nothing in either system's own real data catching the
mismatch
```

### SE Lens

The alternative not chosen here: skip a real, explicit `AngleMode` entirely, and simply decide, project-wide, that every real angle value is always assumed to mean one specific unit, documented only in a comment or a developer's own memory. The real tradeoff: an implicit, undocumented convention costs nothing to write today, but real, silent unit-confusion bugs — exactly the Mars Climate Orbiter's own real failure mode — are precisely what an *implicit* convention invites, the moment a real future contributor forgets, or never knew, which unit was assumed. A real, explicit `AngleMode` value, carried alongside every real angle, makes the assumption checkable by the compiler and visible in the code itself, rather than trusted to memory — the same real "make the correct thing checkable, not just documented" reasoning this project's own sealed `Display` type already proved once, replacing an implicit, ad-hoc `"Error"` string convention with a real, compiler-enforced one.

### Commands Needed

`kotlinc lab1_angle_mode.kt -include-runtime -d lab1.jar` compiles this file into a real, standalone, executable `.jar`, exactly as established throughout this project's own prior work; `java -jar lab1.jar` runs it.

### Run It

Real command run: `kotlinc lab1_angle_mode.kt -include-runtime -d lab1.jar`, then `java -jar lab1.jar`. Real, executed output:

```
750 degrees = 2 full rotation(s) plus 30 degrees left over
```

### Connect the Pieces

Degrees and radians are now proven, concretely, to be genuinely different — not just cosmetically different labels for the same idea, but two real units where one already fits this project's own existing `Int` arithmetic cleanly and the other structurally cannot, until this project has a real numeric type built for exactly that kind of imprecision.

## Connect the Pieces

Follow one real number through the one real question this lesson actually answered. `750`, treated as degrees, real, exactly: this project's own already-established `Int` division and modulo computed `2` full rotations and `30` degrees left over, with no rounding, no approximation, and no new numeric type needed anywhere. That same real cleanliness has nowhere to go once the unit changes to radians — a full turn stops being a tidy whole number and becomes `2π`, a value no `Int` can ever hold exactly, confirmed here not by computing it (this project has no real tool for that yet) but by recognizing, honestly, exactly what tool would be required. Nothing about this project's own permanent code changed — no `AngleMode` exists in the real project yet, and this unit's own real enum and demonstration are both already discarded. What exists now is a real, concrete understanding of exactly where this project's own existing tools run out, and exactly what real capability — genuine floating-point arithmetic — this slice's own coming work will need before a real angle, in either real unit, can actually be used.
