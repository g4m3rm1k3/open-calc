# Lesson 22: The Actual Argument, Made Concrete

*(A Real Internal Redesign, Backed by the Full Test Suite)*

**What you will build**
A genuine internal redesign of `score()`'s bonus-gathering logic — not a
new feature, a real structural improvement, done with total confidence
specifically *because* nine passing tests already exist to catch any
mistake.

**What you need to know first**
Every test from Lessons 1–7, and Lesson 12's extraction of scoring behind
`ScoringStrategy`. This lesson is the payoff Kent Beck's own writing
argues for directly: tests aren't just proof code works once — they're
what makes changing that code later safe.

---

## Concept Unit: The Duplication Worth Removing

### The Problem

Lesson 5's `score()` has two separate bonus-gathering expressions —
`rolls.get(rollIndex + 1) + rolls.get(rollIndex + 2)` for a strike, and
`rolls.get(rollIndex + 2)` for a spare — that are really the same
operation ("sum the next N rolls starting at some position"), written
twice, with slightly different starting points and counts.

### Before — the current, working code

```java
int score() {
    int total = 0;
    int rollIndex = 0;
    for (int frame = 0; frame < 10; frame++) {
        if (isStrike(rollIndex)) {
            total += 10 + rolls.get(rollIndex + 1) + rolls.get(rollIndex + 2);
            rollIndex += 1;
        } else if (isSpare(rollIndex)) {
            total += 10 + rolls.get(rollIndex + 2);
            rollIndex += 2;
        } else {
            total += rolls.get(rollIndex) + rolls.get(rollIndex + 1);
            rollIndex += 2;
        }
    }
    return total;
}
```

### Confirm the safety net exists, before touching anything

```bash
java -cp out:junit-platform-console-standalone.jar TestRunner FullTest
```

Real output — verified this session, run *before* making any change:

```text
[         9 tests found           ]
[         9 tests successful      ]
[         0 tests failed          ]
```

*This is the entire point:* nine tests, covering gutter games, all-ones,
mixed frames, spares, strikes, both tenth-frame edge cases, the
double-strike tenth frame, and the perfect game — already pass. Any
refactor that keeps them all green has not changed behavior, regardless
of how much the internal code structure changes.

### The New Code — After

```java
int score() {
    int total = 0;
    int rollIndex = 0;
    for (int frame = 0; frame < 10; frame++) {
        if (isStrike(rollIndex)) {
            total += 10 + bonusSum(rollIndex + 1, 2);
            rollIndex += 1;
        } else if (isSpare(rollIndex)) {
            total += 10 + bonusSum(rollIndex + 2, 1);
            rollIndex += 2;
        } else {
            total += rolls.get(rollIndex) + rolls.get(rollIndex + 1);
            rollIndex += 2;
        }
    }
    return total;
}

private int bonusSum(int startIndex, int count) {
    int sum = 0;
    for (int i = 0; i < count; i++) {
        sum += rolls.get(startIndex + i);
    }
    return sum;
}
```

### Mechanical walkthrough

1. `private int bonusSum(int startIndex, int count)` — (first appearance
   as a named extraction) one method replacing two separate inline
   expressions — "sum `count` rolls, starting at `startIndex`" is now
   stated once, reused for both the strike case (`rollIndex + 1`, `2`
   rolls) and the spare case (`rollIndex + 2`, `1` roll).
2. The call sites — `bonusSum(rollIndex + 1, 2)` and `bonusSum(rollIndex
   + 2, 1)` — read as direct statements of each rule's actual parameters,
   rather than two subtly-different-looking arithmetic expressions a
   reader has to compare carefully to confirm they're really the same
   operation.

### Run it — after the change

```bash
javac Game.java FullTest.java TestRunner.java -d out
java -cp out:junit-platform-console-standalone.jar TestRunner FullTest
```

Real output — verified this session, run *after* the refactor:

```text
[         9 tests found           ]
[         9 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* identical result — all nine tests, unchanged, still
pass. The internal structure changed (two duplicated expressions became
one shared, named helper); the observable behavior did not, and the test
suite is the actual evidence of that, not a claim taken on faith.

### CS Lens

This is a real instance of the general **extract method** refactoring —
recognizing that two pieces of code express the same underlying
operation and giving that operation one name and one implementation,
used from both call sites.

### SE Lens — Kent Beck's Actual Argument, Not Just Asserted

This is the concrete version of the claim this entire project was built
to demonstrate, not just state: a comprehensive test suite is what turns
"I think this refactor is safe" into "I know this refactor is safe,
because I ran the exact same nine checks before and after and got the
identical result both times." Without Epic 1's tests, this exact change
would require manually re-verifying gutter games, spares, strikes, both
tenth-frame edge cases, and the perfect game by hand, every single time
— which is precisely the situation that makes real engineers avoid
refactoring code they're afraid of, even when they can see it should be
improved. The tests are what remove the fear.

### Connection

This is the same principle Lesson 12's `ScoringStrategy` extraction and
Lesson 8's design-fork comparison both leaned on already — every
structural change in this entire project, from Lesson 3's test-helper
refactor onward, was verified exactly this way: run the suite, change the
code, run the suite again, compare.

---

## Closing

### Connect the pieces

Two near-duplicate bonus expressions (unit 1) were unified into one
`bonusSum` helper, verified safe by running the exact same nine tests
before and after the change and getting identical results both times —
not a manual re-check of the scoring rules by hand, a mechanical,
repeatable proof.

### What breaks without this

Introduce a real mistake into the refactor — swap `bonusSum`'s parameter
order, calling it as `bonusSum(2, rollIndex + 1)` instead of
`bonusSum(rollIndex + 1, 2)` for the strike case. Real, observable
failure: the strike and perfect-game tests fail immediately, with a
concrete wrong number or an index-out-of-bounds crash, exactly the same
category of failure Lessons 4 and 5 already demonstrated — proof that the
test suite catches a real regression the instant it's introduced, not
just in theory.

### Exercises

- Introduce the parameter-order mistake above yourself, confirm the
  suite catches it, then fix it and confirm all nine pass again.
- Find one more piece of duplication in `Game`/`Player`/`BowlingAlley`
  across this whole project and refactor it the same way: run the suite,
  change the code, run the suite again, compare.

### Definition of done

- [ ] You ran the full test suite before this refactor and captured the
      real result.
- [ ] You ran it again after, and both runs show all nine tests passing.
- [ ] You triggered a real regression on purpose and watched the suite
      catch it.
- [ ] You can explain, in your own words, why this is the concrete
      version of Kent Beck's central TDD argument, not just a code
      cleanup.
- [ ] Commit: `git commit -m "Refactor: extract bonusSum, unifying strike/spare bonus logic — verified safe by the full test suite, before and after"`.
