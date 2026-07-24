# Lesson 12: A Contract With No Implementation of Its Own

*(Interfaces and a Second Scoring Variant)*

**User Story**
> As a developer, I want to plug in a different scoring rule (a simplified
> "flat" variant) without touching `Game`'s existing ten-pin logic at all.

**What you will build**
A `ScoringStrategy` interface, extracted from `Game.score()`'s existing
logic, plus a genuinely different second implementation — proving the
extraction actually decouples `Game` from one specific scoring rule.

**What you need to know first**
Lesson 5's complete strike/spare scoring logic — this lesson extracts it
behind an interface rather than rewriting it.

---

## Concept Unit: `interface` — A Contract, Checked by the Compiler

### The Problem

`Game.score()`'s ten-pin logic (Lessons 4–7) is the *only* scoring rule
`Game` currently knows how to apply. Real bowling has variants (candlepin,
duckpin) with different rules entirely — supporting even one alternative
requires a way for `Game` to depend on "some scoring rule" in the
abstract, without hardcoding which one.

### Introduce the concept in isolation

```java
import java.util.List;

interface ScoringStrategy {
    int score(List<Integer> rolls);
}
```

```java
import java.util.List;

class TenPinScoring implements ScoringStrategy {
    @Override
    public int score(List<Integer> rolls) {
        int total = 0;
        int rollIndex = 0;
        for (int frame = 0; frame < 10; frame++) {
            if (rolls.get(rollIndex) == 10) {
                total += 10 + rolls.get(rollIndex + 1) + rolls.get(rollIndex + 2);
                rollIndex += 1;
            } else if (rolls.get(rollIndex) + rolls.get(rollIndex + 1) == 10) {
                total += 10 + rolls.get(rollIndex + 2);
                rollIndex += 2;
            } else {
                total += rolls.get(rollIndex) + rolls.get(rollIndex + 1);
                rollIndex += 2;
            }
        }
        return total;
    }
}
```

```java
import java.util.List;

class FlatScoring implements ScoringStrategy {
    @Override
    public int score(List<Integer> rolls) {
        int total = 0;
        for (int pins : rolls) total += pins;
        return total;
    }
}
```

```java
import java.util.List;

public class ScoringStrategyDemo {
    static int runWithStrategy(ScoringStrategy strategy, List<Integer> rolls) {
        return strategy.score(rolls);
    }

    public static void main(String[] args) {
        List<Integer> perfectRolls = java.util.Collections.nCopies(12, 10);
        System.out.println(runWithStrategy(new TenPinScoring(), perfectRolls));
        System.out.println(runWithStrategy(new FlatScoring(), perfectRolls));
    }
}
```

Run it:

```bash
javac ScoringStrategy.java TenPinScoring.java FlatScoring.java ScoringStrategyDemo.java
java ScoringStrategyDemo
```

Real output — verified this session:

```text
300
120
```

*What this proves:* `runWithStrategy` never mentions `TenPinScoring` or
`FlatScoring` by name — its parameter type is `ScoringStrategy`, the
interface. The exact same twelve-strikes input produces bowling's real
score (`300`) through one strategy and a naive flat sum (`120`, twelve
tens added plainly) through the other — proof the calling code is
genuinely decoupled from which scoring rule actually runs.

### Discard the throwaway demo

`ScoringStrategyDemo` is discarded. `ScoringStrategy` and `TenPinScoring`
move into the real project; `FlatScoring` stays as a genuine second
implementation proving the extraction works.

### Project Change

- **Reference Source:** No reference counterpart — extracting `Game`'s
  existing Lesson 5 logic into a named interface implementation, not a
  new algorithm.
- **Files affected:** New files `ScoringStrategy.java`, `TenPinScoring.java`;
  `Game.java`'s `score()` method removed, replaced by a delegated call.
- **Change type:** Extract + refactor.
- **Location:** `Game`'s entire `score()`/`isStrike`/`isSpare` block moves
  into `TenPinScoring`.
- **Dependencies:** None new.

### The Updated Project

```java
class Game {
    private final List<Integer> rolls = new ArrayList<>();
    private final ScoringStrategy scoringStrategy;

    Game() {
        this(new TenPinScoring());
    }

    Game(ScoringStrategy scoringStrategy) {
        this.scoringStrategy = scoringStrategy;
    }

    void roll(int pins) {
        if (pins < 0 || pins > 10) {
            throw new InvalidRollException("Pins must be between 0 and 10, got: " + pins);
        }
        rolls.add(pins);
    }

    int score() {
        return scoringStrategy.score(rolls);
    }
}
```

### Mechanical walkthrough

1. `interface ScoringStrategy { int score(List<Integer> rolls); }` —
   (first appearance) an interface declares a method's signature with
   **no body** — a pure contract: "anything implementing this must
   provide a `score` method with this exact shape," with no
   implementation of its own to inherit.
2. `class TenPinScoring implements ScoringStrategy` — (first appearance)
   `implements` is how a class commits to fulfilling an interface's
   contract — the compiler checks that every method the interface
   declares is actually provided, with a matching signature.
3. `Game() { this(new TenPinScoring()); }` — (first appearance) **constructor
   chaining** — this no-argument constructor calls the other constructor
   below it (`this(...)`), supplying a default `TenPinScoring` so existing
   code creating `new Game()` (every test from Lessons 1–11) keeps working
   unchanged.
4. `Game(ScoringStrategy scoringStrategy) { this.scoringStrategy = scoringStrategy; }`
   — a second constructor accepting *any* `ScoringStrategy` — this is what
   makes `Game` genuinely pluggable, for a test or a future feature that
   wants `FlatScoring` or another rule entirely.

### CS Lens

This is **polymorphism through an interface** — `Game` calls
`scoringStrategy.score(rolls)` without knowing or caring which concrete
class `scoringStrategy` actually is at runtime; the correct `score`
implementation is dispatched dynamically, based on the actual object
provided.

### SE Lens

This is **dependency inversion** — `Game` no longer depends on one
specific scoring algorithm directly; it depends on the `ScoringStrategy`
abstraction, and a concrete implementation is supplied from outside (the
constructor). The real payoff: this is exactly the mechanism Lesson 22's
"fearless refactor" leans on — swapping internal implementation details
becomes safe specifically because calling code depends on a stable
interface, not a concrete class's internals.

### Run it

Real output — verified this session, re-running every Epic 1 test against
the refactored `Game`:

```text
[         9 tests found           ]
[         9 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* the extraction changed `Game`'s internal structure
completely — `score()` is now one line — while every existing test,
written against the *old* structure, still passes unchanged. This is
exactly what a correct refactor looks like: internal design changed,
external behavior identical, proven by the same test suite.

### Connection

Lesson 22's "fearless refactor" builds directly on this exact mechanism —
having `Game` depend on an interface, not a concrete class, is precisely
what makes a later internal redesign low-risk.

---

## Closing

### Connect the pieces

`ScoringStrategy` (unit 1) defines a pure contract with no implementation.
`TenPinScoring` implements it using Lesson 5's exact existing logic,
extracted unchanged; `FlatScoring` proves a genuinely different rule can
plug in through the same interface. `Game` now depends on the interface,
supplied via constructor, defaulting to `TenPinScoring` so every existing
test keeps working — verified with all nine tests passing against the
refactored structure.

### What breaks without this

Try constructing `Game` with a scoring strategy whose `score` method has a
different signature (say, `double score(List<Integer> rolls)` instead of
`int`). Real, observable failure: a compile error stating the class does
not implement the abstract method `score(List<Integer>)` from
`ScoringStrategy` — the compiler enforces the exact contract, including
the return type, not just the method name.

### Exercises

- Write a `CandlepinScoring implements ScoringStrategy` with a genuinely
  different (even simplified/fictional) rule, and confirm it plugs into
  `Game` via the second constructor with no changes to `Game` itself.
- Write a test constructing `new Game(new FlatScoring())` and confirm it
  produces the flat-sum result instead of the real ten-pin score for the
  same rolls.

### Definition of done

- [ ] `Game`'s scoring logic is extracted behind `ScoringStrategy`, with
      `TenPinScoring` as the default.
- [ ] All nine existing tests pass unchanged against the refactored
      `Game`.
- [ ] A second, genuinely different `ScoringStrategy` implementation
      plugs in with zero changes to `Game`.
- [ ] Commit: `git commit -m "Extract scoring behind a ScoringStrategy interface — Game no longer depends on one specific rule"`.
