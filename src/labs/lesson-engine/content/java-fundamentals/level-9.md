---
series: java-fundamentals
level: 9
title: Enums
lang: java
---

# Enums

Level 6's `Status` idea — a value that's genuinely one of a small, fixed set of options — has been quietly representable only as a `String` or an `int` so far, with nothing stopping a typo like `"activ"` or an out-of-range `99` from compiling just fine. An **enum** makes the fixed set of options part of the type system itself: the compiler enforces that a variable of that type can only ever hold one of the named values.

## A Basic Enum

```java
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

public class Main {
    public static void main(String[] args) {
        Day today = Day.WEDNESDAY;
        System.out.println(today);
        System.out.println(today == Day.WEDNESDAY);

        for (Day d : Day.values()) {
            System.out.print(d + " ");
        }
        System.out.println();
        System.out.println(today.ordinal());
    }
}
```

```text
WEDNESDAY
true
MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY SUNDAY 
2
```

`enum Day { MONDAY, TUESDAY, ... }` — declares a brand-new type, `Day`, whose only possible values are exactly the seven named constants listed. `Day today = "wednesday";` would be a compile error — a `Day` can never hold a plain `String`, and `Day someOtherValue = Day.MONDAY;` is the *only* way to get a `Day` at all.

`today == Day.WEDNESDAY` — enum constants are compared safely with `==` (unlike `String`'s own `==` trap from Level 4) because each named constant (`MONDAY`, `WEDNESDAY`, ...) is really one single, unique object that exists exactly once for the whole program — `Day.WEDNESDAY` always refers to that same object, everywhere it appears.

`Day.values()` — a method the compiler generates automatically for every enum, returning every constant in declaration order as a `Day[]`. `today.ordinal()` — another automatically-generated method: the constant's `0`-based position in that declaration order (`WEDNESDAY` is third, so `ordinal()` is `2`).

## Enums With Fields and a Constructor

```java
enum Planet {
    MERCURY(3.3e23, 2.4e6),
    EARTH(5.9e24, 6.4e6);

    final double mass;
    final double radius;

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    double gravity() {
        double G = 6.67e-11;
        return G * mass / (radius * radius);
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.printf("%.2f%n", Planet.EARTH.gravity());
    }
}
```

```text
9.61
```

An enum isn't limited to bare names — it's a real class underneath, and can carry its own fields, its own constructor, and its own methods exactly like `Rectangle` (Level 7) could. `MERCURY(3.3e23, 2.4e6)` — each constant calls the enum's own constructor with its specific values, run exactly once, the moment the enum type is first loaded.

`final double mass;` — `final` (Level 8) here means each constant's `mass` is set once, in its own constructor call, and never changes afterward — appropriate, since `EARTH`'s mass shouldn't be reassignable at runtime any more than `EARTH` itself should stop being `EARTH`.

`Planet.EARTH.gravity()` — an ordinary instance method call (Level 7's own `r.area()` shape), just called on an enum constant instead of a `new`-created object.

## Enums in a switch, and valueOf

```java
enum Status { ACTIVE, PAUSED, DONE }

public class Main {
    static String describe(Status s) {
        switch (s) {
            case ACTIVE: return "Running now";
            case PAUSED: return "On hold";
            case DONE: return "Finished";
            default: return "Unknown";
        }
    }

    public static void main(String[] args) {
        System.out.println(describe(Status.ACTIVE));
        System.out.println(describe(Status.PAUSED));
        System.out.println(Status.valueOf("DONE"));
    }
}
```

```text
Running now
On hold
DONE
```

`switch (s) { case ACTIVE: ... }` — inside a `switch` over an enum, case labels use the bare constant name (`ACTIVE`, not `Status.ACTIVE`) — the compiler already knows every case must be a `Status`, so the type prefix would be redundant. This is exactly Level 1's `switch` statement, now switching over an enum instead of an `int`.

`Status.valueOf("DONE")` — the reverse of printing: parses a `String` back into the matching enum constant, throwing `IllegalArgumentException` (Level 10 covers exceptions in depth) if no constant matches that exact name.

**CS lens:** Under the hood, every enum constant really is a `static final` (Level 8) instance of a real, compiler-generated class — `Day.MONDAY` is genuinely an object, not a disguised integer the way C's older `enum` was. This is exactly why `==` is safe on enum constants (there is only ever one instance of `Day.MONDAY` for the entire program to compare against) and why an enum can carry real fields and methods, as `Planet` just did — something a plain integer constant never could.

**SE lens:** An enum replaces a whole category of bugs a `String` or `int` "status field" invites — a stray `"actvie"` typo, or a `3` meant for a status that only ever went up to `2` — with something the compiler checks *before the program ever runs*. Reach for an enum the instant a value is genuinely one of a small, fixed, known-in-advance set of options; reach for a plain `String` or `int` instead only when the real set of valid values is open-ended or comes from outside the program (user input, a database row) rather than being fixed by the code itself.

## Challenge: opposite

Write an `enum Direction { NORTH, SOUTH, EAST, WEST }` and a `static Direction opposite(Direction d)` method that returns the direction directly opposite `d` (`NORTH` ↔ `SOUTH`, `EAST` ↔ `WEST`).

```challenge
enum Direction { NORTH, SOUTH, EAST, WEST }

static Direction opposite(Direction d) {
    // TODO
}
```

```test
assert opposite(Direction.NORTH) == Direction.SOUTH
assert opposite(Direction.SOUTH) == Direction.NORTH
assert opposite(Direction.EAST) == Direction.WEST
assert opposite(Direction.WEST) == Direction.EAST
```
