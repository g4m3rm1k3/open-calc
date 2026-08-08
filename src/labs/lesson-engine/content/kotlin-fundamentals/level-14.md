---
series: kotlin-fundamentals
level: 14
title: Enum Classes
lang: kotlin
---

# Enum Classes

`java-fundamentals` Level 9 covered Java's `enum` — a fixed, named set of constants, richer than a plain `int` because each constant can carry its own fields and methods. Kotlin's `enum class` is nearly identical syntax carrying the same capabilities, with one addition worth calling out: it integrates directly with `when`'s exhaustiveness checking from Level 9, the same way `sealed class` did in Level 13.

## A Basic Enum Class

```kotlin
enum class Direction {
    NORTH, SOUTH, EAST, WEST
}

fun main() {
    val heading = Direction.NORTH
    println(heading)
    println(heading.name)
    println(heading.ordinal)

    println(Direction.entries)
}
```

```text
NORTH
NORTH
0
[NORTH, SOUTH, EAST, WEST]
```

**Walkthrough:** `enum class Direction { NORTH, SOUTH, EAST, WEST }` declares exactly four possible values — no other `Direction` can ever exist. Every enum constant automatically has a `.name` property (the constant's own name as a `String`) and an `.ordinal` property (its zero-based position in declaration order — `NORTH` is `0`, `SOUTH` is `1`, and so on). `Direction.entries` returns every constant as a `List<Direction>`, in declaration order — useful for iterating all possible values, or checking `Direction.entries.size`.

## Exhaustive when Over an Enum

```kotlin
enum class Direction { NORTH, SOUTH, EAST, WEST }

fun opposite(direction: Direction): Direction = when (direction) {
    Direction.NORTH -> Direction.SOUTH
    Direction.SOUTH -> Direction.NORTH
    Direction.EAST -> Direction.WEST
    Direction.WEST -> Direction.EAST
    // no else needed — the compiler knows these four ARE every Direction
}

fun main() {
    println(opposite(Direction.NORTH))
    println(opposite(Direction.EAST))
}
```

```text
SOUTH
WEST
```

**Walkthrough:** Exactly like `sealed class` in Level 13, an `enum class`'s complete set of values is known to the compiler at compile time, so a `when` over every constant needs no `else` branch — and, just as importantly, if a fifth `Direction` were added later (`NORTHEAST`, say) without updating `opposite`, this function would stop compiling immediately, flagging the exact spot that needs updating, rather than silently returning nothing (or throwing an unrelated error) the first time `NORTHEAST` reached it at runtime.

## Enum Classes With Properties and Methods

```kotlin
enum class Planet(val massKg: Double, val radiusM: Double) {
    MERCURY(3.303e+23, 2.4397e6),
    EARTH(5.976e+24, 6.37814e6),
    JUPITER(1.9e+27, 7.1492e7);   // note the semicolon — required when methods follow

    fun surfaceGravity(): Double {
        val gravitationalConstant = 6.67300E-11
        return gravitationalConstant * massKg / (radiusM * radiusM)
    }
}

fun main() {
    for (planet in Planet.entries) {
        println("${planet.name}: gravity = ${"%.2f".format(planet.surfaceGravity())} m/s²")
    }
}
```

```text
MERCURY: gravity = 3.70 m/s²
EARTH: gravity = 9.80 m/s²
JUPITER: gravity = 24.81 m/s²
```

**Walkthrough:** `enum class Planet(val massKg: Double, val radiusM: Double)` gives every constant its own constructor parameters — `MERCURY(3.303e+23, 2.4397e6)` calls that constructor with Mercury's own real mass and radius, exactly like calling any other class's constructor. The trailing `;` after the last constant (`JUPITER(...)`) is required syntax whenever an enum class has methods or additional members following its constant list — Kotlin needs that semicolon to know where the list of constants ends and the class body begins. `surfaceGravity()` is a real method, available on every constant, using that constant's own `massKg` and `radiusM`. `"%.2f".format(...)` is `String`'s own formatting method — `%.2f` means "format as a floating-point number with exactly two digits after the decimal point," the same format-string syntax `java-fundamentals`'s `printf`/`String.format` lesson covered for Java.

**SE lens:** This is meaningfully more capable than a plain integer constant or a bare set of string labels — every `Planet` constant carries its own real data and can compute its own derived values, with the compiler guaranteeing the complete set of planets is closed and every one of them was constructed correctly, with the right number of matching-typed arguments, the same way any other class's constructor is checked.

## Recognition

```text
Today: enum class — closed, data-carrying constants with exhaustive when

Also recognized in: Java's own enum (added in Java 5, specifically to
replace the earlier "public static final int" constant-group pattern that
had no type safety at all), Swift's enum (which can also carry associated
values, blurring into sealed-class territory), and C#'s enum (closer to
C's plain integer constants — without Java/Kotlin's ability to attach real
methods and properties to each value).
```

## Challenge: traffic_light

Write `enum class TrafficLight(val durationSeconds: Int) { RED(30), YELLOW(5), GREEN(25) }`. Then write `fun next(light: TrafficLight): TrafficLight` using an exhaustive `when` (no `else`) that cycles `RED -> GREEN -> YELLOW -> RED`.

```challenge
enum class TrafficLight(val durationSeconds: Int) {
    RED(30), YELLOW(5), GREEN(25)
}

fun next(light: TrafficLight): TrafficLight {
    return light
}
```

```test
assert next(TrafficLight.RED) == TrafficLight.GREEN
assert next(TrafficLight.GREEN) == TrafficLight.YELLOW
assert next(TrafficLight.YELLOW) == TrafficLight.RED
assert TrafficLight.RED.durationSeconds == 30
assert TrafficLight.entries.size == 3
```
