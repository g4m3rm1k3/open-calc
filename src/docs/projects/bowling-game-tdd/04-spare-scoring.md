# Lesson 4: The First Rule That Breaks Naive Summing

*(Scoring a Spare)*

**User Story**
> As a bowler, I want a spare (two rolls in a frame totaling exactly 10)
> to add the value of the next roll as a bonus.

**What you will build**
The first genuinely new scoring rule: a spare's frame score is `10` plus
whatever the *next* roll turns out to be — the first case where summing
every roll independently gives the wrong answer.

**What you need to know first**
Lesson 3's `rollAll`/`rollMany` helpers. Lesson 2's `List<Integer>`-backed
storage — this lesson is the first time the naive "just sum everything"
approach is proven wrong.

---

## Concept Unit: Red — A Real Wrong Answer, Not Just a Missing Feature

### The New Code

```java
@Test
void spareGetsBonusOfNextRoll() {
    Game game = new Game();
    rollAll(game, 5, 5, 3);
    rollMany(game, 17, 0);
    assertEquals(16, game.score());
}
```

*Why `16`:* frame one is a spare (`5 + 5 = 10`); its bonus is the very
next roll, `3` — so frame one scores `10 + 3 = 13`. Frame two is just that
same `3` roll again, scoring `3` on its own. Every other frame is gutter
balls. Total: `13 + 3 = 16`.

### Run it against the current naive-sum `Game`

Real output — verified this session:

```text
[         4 tests found           ]
[         3 tests successful      ]
[         1 tests failed          ]

Failures (1):
  JUnit Jupiter:GameTest:spareGetsBonusOfNextRoll()
    => org.opentest4j.AssertionFailedError: expected: <16> but was: <13>
```

*What this proves:* `5 + 5 + 3 = 13` is exactly what plain summing gives —
correct as a total of *individual rolls*, wrong as a bowling *score*,
because a spare's bonus roll (the `3`) needs to be counted **twice**: once
as its own frame's contribution, and once again as frame one's bonus.
Plain summing structurally cannot express "count this value twice" — this
is the real, concrete limit Lesson 3 was building toward.

---

## Concept Unit: Green — Frame-by-Frame Iteration With Lookahead

### The Problem

Making this test pass requires the scoring logic to think in terms of
**frames**, not a flat sum of every roll — and to be able to "look ahead"
at rolls beyond the current frame's own two.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Game.java` — `score()`'s entire implementation.
- **Change type:** Replace.
- **Location:** The `score()` method's body.
- **Dependencies:** None new.

### The New Code

```java
int score() {
    int total = 0;
    int rollIndex = 0;
    for (int frame = 0; frame < 10; frame++) {
        if (isSpare(rollIndex)) {
            total += 10 + rolls.get(rollIndex + 2);
            rollIndex += 2;
        } else {
            total += rolls.get(rollIndex) + rolls.get(rollIndex + 1);
            rollIndex += 2;
        }
    }
    return total;
}

private boolean isSpare(int rollIndex) {
    return rolls.get(rollIndex) + rolls.get(rollIndex + 1) == 10;
}
```

### The Updated Project

This replaces `score()` entirely — `roll()` and the `rolls` field are
unchanged from Lesson 2.

### Mechanical walkthrough

1. `int rollIndex = 0;` — (first appearance) a running position into the
   flat `rolls` list, tracked separately from the `frame` loop counter,
   because frames consume a *different number* of rolls depending on
   whether they're a spare (about to also apply to strikes, Lesson 5).
2. `for (int frame = 0; frame < 10; frame++)` — always exactly ten
   iterations, one per frame, regardless of how many individual rolls
   each one consumes.
3. `isSpare(rollIndex)` — (first appearance) a small `private` helper
   (Lesson 0's access modifiers, used deliberately: this is an internal
   detail of *how* `Game` scores, not part of its public contract) —
   checks whether the two rolls starting at the current position sum to
   `10`.
4. `total += 10 + rolls.get(rollIndex + 2);` — the spare case: `10` for
   the frame itself, plus the roll *immediately after* the frame's own two
   rolls — `rolls.get(rollIndex + 2)`, reading one position past this
   frame's own rolls, is the literal "lookahead" this rule requires.
5. `rollIndex += 2;` in both branches — a spare or an open frame always
   consumes exactly two rolls from the flat list, even though the spare
   case also *reads* a third value without consuming it — that third roll
   is read again, correctly, as the start of the *next* frame.

### Execution trace

```
rolls = [5, 5, 3, 0, 0, 0, ...]
frame 0: rollIndex=0, isSpare(0)? rolls[0]+rolls[1] = 5+5 = 10 → yes
         total += 10 + rolls[2] = 10 + 3 = 13 → total = 13
         rollIndex: 0 → 2
frame 1: rollIndex=2, isSpare(2)? rolls[2]+rolls[3] = 3+0 = 3 → no
         total += rolls[2] + rolls[3] = 3 + 0 = 3 → total = 16
         rollIndex: 2 → 4
frames 2–9: all gutters, contribute 0 each
final total = 16
```

### Run it

Real output — verified this session:

```text
[         4 tests found           ]
[         4 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* all four tests pass — the new frame-based,
lookahead-aware scoring correctly handles the spare case while still
correctly handling the three earlier, simpler cases (gutter, all-ones,
mixed-open) with the exact same code.

### CS Lens

This is **lookahead** — a scoring decision that depends on data beyond the
current position, a small instance of the same general idea behind
lookahead parsing in real compilers (checking the next token before
deciding how to interpret the current one) and this repo's own OpenMAT
project's parser design.

### SE Lens

The real tradeoff introduced here: `rollIndex` and `rolls.get(rollIndex +
2)` couple `score()` tightly to the exact flat-list representation
`roll()` builds — reading "two positions ahead" only makes sense because
`rolls` is a flat, ungrouped sequence. Lesson 8 puts a real alternative
(grouping rolls into actual `Frame` objects first) side by side with this
one, honestly, rather than assuming this coupling is the only correct
design.

### Connection

Lesson 5's strike test needs a very similar lookahead — one roll further,
and consuming only one roll instead of two — reusing this exact frame-loop
shape.

---

## Closing

### Connect the pieces

The spare test (unit 1) proved plain summing wrong for the first time,
with a real, verified wrong answer (`13` instead of `16`). Frame-by-frame
iteration with lookahead (unit 2) fixed it by reading one roll past the
current frame's own two whenever a spare is detected — verified against
all four tests, old and new, passing together.

### What breaks without this

Change `isSpare`'s check from `== 10` to `>= 10` and re-run. Real,
observable failure with a new test rolling `6, 5` (should never legally
happen in real bowling, but nothing in the code prevents it yet) — this
malformed input would be incorrectly treated as a spare. Restore `== 10`
and only a genuine spare triggers the bonus — worth noting honestly:
nothing here yet stops a caller from rolling invalid values at all (more
than 10 pins in a frame, negative pins) — Lesson 11's custom exceptions
close that real, currently-open gap.

### Exercises

- Trace `spareGetsBonusOfNextRoll` by hand using the Execution Trace
  format above, then confirm your trace matches by adding a `println`
  inside the loop and running it for real.
- Write a test for *two* spares in a row (e.g., `5,5,4,6,...`) and predict
  the score by hand before running it.

### Definition of done

- [ ] The spare test passes, and you saw it genuinely fail first.
- [ ] All earlier tests still pass alongside it.
- [ ] You can explain, in your own words, why `rollIndex += 2` is correct
      even in the spare branch, which reads three rolls but only consumes
      two.
- [ ] Commit: `git commit -m "Red-green-refactor cycle #3: spare scoring via frame-based lookahead"`.
