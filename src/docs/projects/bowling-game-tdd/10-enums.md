# Lesson 10: An Enum Is a Class, Not Just a Named Number

*(`RollResult` as a Real Java `enum`)*

**What you will build**
A `RollResult` enum — `STRIKE`, `SPARE`, `OPEN` — each carrying its own
behavior, used to classify a frame's result for display purposes,
independent of the numeric scoring logic Epic 1 already built.

**What you need to know first**
Lesson 5's `isStrike`/`isSpare` checks — this lesson gives their boolean
results a real, named type instead of leaving "what kind of frame was
that" implicit in scattered `if` conditions.

---

## Concept Unit: `enum` With Fields and Per-Constant Behavior

### The Problem

`../track/`'s Java exposure may have shown enums as a fixed list of named
constants (`enum Direction { NORTH, SOUTH, EAST, WEST }`), which is real
but only part of what Java's `enum` can do. `RollResult` needs each
constant to behave differently when asked to describe itself — plain
named constants alone can't express that.

### Introduce the concept in isolation

```java
enum RollResult {
    STRIKE(10) {
        @Override
        public String describe() { return "Strike!"; }
    },
    SPARE(10) {
        @Override
        public String describe() { return "Spare!"; }
    },
    OPEN(0) {
        @Override
        public String describe() { return "Open frame."; }
    };

    private final int minimumPins;

    RollResult(int minimumPins) {
        this.minimumPins = minimumPins;
    }

    public abstract String describe();
}
```

```java
public class RollResultDemo {
    public static void main(String[] args) {
        for (RollResult result : RollResult.values()) {
            System.out.println(result + ": " + result.describe());
        }
        RollResult r = RollResult.STRIKE;
        System.out.println(r == RollResult.STRIKE);
    }
}
```

Run it:

```bash
javac RollResult.java RollResultDemo.java
java RollResultDemo
```

Real output — verified this session:

```text
STRIKE: Strike!
SPARE: Spare!
OPEN: Open frame.
true
```

*What this proves:* each constant (`STRIKE`, `SPARE`, `OPEN`) has its own
implementation of `describe()` — this is a real, per-constant method
body, not a single shared `switch` inside one `describe()` method. `r ==
RollResult.STRIKE` correctly uses `==` (not `.equals()`) — enum constants
are guaranteed by the language to be singletons, exactly one instance per
constant ever exists, so reference equality (`==`) is not just safe here,
it's the idiomatic, correct choice — the one place `==` on an object type
is genuinely the right tool, a direct exception to Lesson 0's general
rule.

### Discard the throwaway example

Deleted (the concept, not literally — `RollResult` moves into the project
as a real, permanent type, adapted to fit this project's needs).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `RollResult.java`; `Game.java` gains a
  method classifying a given frame.
- **Change type:** Add.
- **Location:** A new `resultForFrame(int rollIndex)` method alongside
  `isStrike`/`isSpare`.
- **Dependencies:** None new.

### The New Code

```java
enum RollResult {
    STRIKE, SPARE, OPEN
}
```

```java
RollResult resultForFrame(int rollIndex) {
    if (isStrike(rollIndex)) return RollResult.STRIKE;
    if (isSpare(rollIndex)) return RollResult.SPARE;
    return RollResult.OPEN;
}
```

### The Updated Project

`Game.java` gains this one new method alongside `isStrike`/`isSpare` —
`score()` itself is unchanged; this is a separate, additive classification
method, not a replacement for the scoring logic.

### Mechanical walkthrough

1. `enum RollResult { STRIKE, SPARE, OPEN }` — (hard concept reappearing,
   simpler form) the plain-constants shape, no per-constant bodies needed
   here since this project's actual use (classifying a frame, not
   generating display text yet) doesn't need it — a deliberate, simpler
   choice than the concept lab's version, made because Epic 3's console
   (Lesson 20) is a better home for real per-`RollResult` display text.
2. `RollResult resultForFrame(int rollIndex)` — reuses `isStrike`/
   `isSpare` (Lesson 5) exactly as they already exist — this method adds a
   named classification on top of existing boolean logic, it doesn't
   duplicate it.

### CS Lens

An `enum` in Java is a real class under the hood — each constant is a
singleton instance of that class, which is *why* per-constant method
bodies (the concept lab's version) are even possible: each constant can be
its own tiny subclass with its own implementation. This is meaningfully
richer than C's or many other languages' enums, which are just named
integers.

### SE Lens

Why introduce `RollResult` at all, when `isStrike`/`isSpare` already exist
and work? Because "what kind of frame is this" is a real, recurring
question this app will ask again (Lesson 16's game history display, for
instance) — a named `RollResult` value is self-documenting at every call
site (`resultForFrame(0) == RollResult.STRIKE` reads clearly) in a way
that two separate boolean checks scattered through calling code do not.

### Connection

Lesson 16's player game-history display uses `RollResult` directly to show
each frame's outcome without re-deriving it from raw booleans.

---

## Closing

### Connect the pieces

The concept lab proved `enum` constants can carry real, distinct
behavior, each a genuine singleton (`==` is correct and idiomatic for
them). The real `RollResult` in this project uses the simpler
plain-constants shape, layered on top of Lesson 5's existing `isStrike`/
`isSpare` checks as a named classification, not a replacement.

### What breaks without this

Remove the `abstract` keyword from `describe()` in the concept-lab version
and try to compile the per-constant bodies. Real, observable failure: a
compile error, since a non-abstract method can't be overridden per-constant
the way this pattern requires — the constants' bodies (`{ @Override public
String describe() {...} }`) specifically need something declared abstract
to override. Restore `abstract` and it compiles again.

### Exercises

- Add a fourth constant to the concept lab, `GUTTER`, with its own
  `describe()` returning `"Gutter ball."` — confirm the `for` loop over
  `values()` picks it up automatically.
- Try comparing two `RollResult` values with `.equals()` instead of `==` —
  confirm it also works (enums correctly implement both), then explain, in
  your own words, why `==` is still the idiomatic choice for enums
  specifically, unlike for `Roll` (Lesson 9).

### Definition of done

- [ ] `resultForFrame` correctly classifies strike/spare/open frames using
      the existing `isStrike`/`isSpare` logic.
- [ ] You ran the per-constant-behavior concept lab yourself and can
      explain why `==` is correct for enum comparison.
- [ ] Commit: `git commit -m "Add RollResult enum, classifying frames using the existing Lesson 5 strike/spare checks"`.
