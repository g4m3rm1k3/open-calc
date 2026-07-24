# Lesson 5: When Red Is an Exception, Not Just a Wrong Number

*(Scoring a Strike)*

**User Story**
> As a bowler, I want a strike (all ten pins on the first roll of a frame)
> to add the value of the next *two* rolls as a bonus.

**What you will build**
Strike handling: a frame that's a strike consumes only **one** roll, not
two, and its bonus is the next two rolls combined. This is the lesson
where getting frame indexing wrong doesn't just produce a wrong number —
it crashes.

**What you need to know first**
Lesson 4's frame-based iteration and spare lookahead — strike handling
follows the identical shape, one roll consumed instead of two, two bonus
rolls instead of one.

---

## Concept Unit: Red — A Crash, Not Just a Failed Assertion

### The New Code

```java
@Test
void strikeGetsBonusOfNextTwoRolls() {
    Game game = new Game();
    rollAll(game, 10, 3, 4);
    rollMany(game, 16, 0);
    assertEquals(24, game.score());
}
```

*Why `24`:* frame one is a strike — `10` plus the next two rolls,
`3` and `4` — scoring `10 + 3 + 4 = 17`. Frame two is those same two
rolls, `3 + 4 = 7`. Every other frame is gutter balls. Total: `17 + 7 =
24`.

### Run it against Lesson 4's spare-aware `Game`

Real output — verified this session:

```text
[         5 tests found           ]
[         4 tests successful      ]
[         1 tests failed          ]

Failures (1):
  JUnit Jupiter:GameTest:strikeGetsBonusOfNextTwoRolls()
    => java.lang.IndexOutOfBoundsException: Index 19 out of bounds for length 19
       ...
       Game.isSpare(Game.java:27)
       Game.score(Game.java:15)
```

*What this proves:* this is a genuinely different, more dramatic kind of
red than every previous test — not a wrong number, a real crash. Here's
why: `score()` still assumes every frame consumes exactly two rolls
(`rollIndex += 2` unconditionally). A strike is only *one* roll, so after
the strike frame, `rollIndex` is already two positions further into the
list than it should be — every subsequent frame reads the *wrong* rolls,
and by the tenth frame, the (wrong) position runs past the end of the
list entirely. Getting frame-boundary bookkeeping wrong doesn't fail
gracefully — it corrupts every frame after the mistake.

---

## Concept Unit: Green — Strikes Consume One Roll, Not Two

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Game.java`.
- **Change type:** Add a strike branch, checked before the spare check.
- **Location:** Inside `score()`'s frame loop.
- **Dependencies:** None new.

### The New Code

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

private boolean isStrike(int rollIndex) {
    return rolls.get(rollIndex) == 10;
}
```

### The Updated Project

`isSpare` is unchanged from Lesson 4; `score()` gains one new `if` branch,
checked **first**, before `isSpare` — order matters here, explained below.

### Mechanical walkthrough

1. `isStrike(rollIndex)` — (first appearance) checks only the *single*
   roll at the current position — a strike is knowable from one value
   alone, unlike a spare, which needs two rolls to add up correctly.
2. `total += 10 + rolls.get(rollIndex + 1) + rolls.get(rollIndex + 2);` —
   the strike bonus reads the next **two** individual rolls, whatever
   frame(s) they actually belong to — this is deliberately blind to frame
   boundaries; it just wants "the next two rolls in the flat sequence,"
   which is exactly why the flat-list representation makes this
   relatively easy to express.
3. `rollIndex += 1;` — critically different from the other two branches —
   a strike frame only ever produces **one** entry in `rolls`, so only one
   position should be consumed before moving to the next frame.
4. **Order matters:** `isStrike` is checked before `isSpare` because
   `isSpare(rollIndex)` reads `rolls.get(rollIndex + 1)` — if the current
   frame is actually a strike, `rollIndex + 1` belongs to the *next*
   frame entirely, and checking spare-ness against it would be reading
   the wrong data. Checking strike first and returning early (via the
   `if`/`else if` chain) avoids ever asking `isSpare` a nonsensical
   question.

### Execution trace

```
rolls = [10, 3, 4, 0, 0, ...]
frame 0: rollIndex=0, isStrike(0)? rolls[0] == 10 → yes
         total += 10 + rolls[1] + rolls[2] = 10 + 3 + 4 = 17 → total = 17
         rollIndex: 0 → 1
frame 1: rollIndex=1, isStrike(1)? rolls[1] == 10 → no (rolls[1] = 3)
         isSpare(1)? rolls[1]+rolls[2] = 3+4 = 7 → no
         total += rolls[1] + rolls[2] = 3 + 4 = 7 → total = 24
         rollIndex: 1 → 3
frames 2–9: all gutters
final total = 24
```

### Run it

Real output — verified this session:

```text
[         5 tests found           ]
[         5 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* all five tests pass, including the previously
crashing strike case — with `isStrike` checked first, `rollIndex`
advancing correctly by one instead of two, and no index ever running past
the list's actual length.

### CS Lens

This is the same **lookahead** idea from Lesson 4, generalized: the amount
you look ahead (`+1` for spare, `+1` and `+2` for strike) and the amount
you advance (`+2` for open/spare, `+1` for strike) both depend on
*which case you're in* — a real instance of variable-length token
consumption, the same category of decision a real tokenizer makes reading
variable-length tokens from a character stream.

### SE Lens

Why check `isStrike` before `isSpare`, rather than the other way around?
Because the checks aren't independent — `isSpare` reads a roll position
that's only valid to read *if the current frame isn't a strike*. This is
a real, easy-to-get-backwards ordering dependency between two conditions,
worth naming explicitly rather than discovering by accident (the exact
crash this unit's own Red state demonstrated when the ordering — implicit
via `rollIndex`'s wrong increment — was wrong).

### Connection

Lesson 6's tenth-frame test is the natural next question: does this exact
logic, unchanged, already handle a strike or spare happening in the very
last frame correctly?

---

## Closing

### Connect the pieces

The strike test (unit 1) revealed a genuinely more severe kind of red — an
`IndexOutOfBoundsException`, not just a wrong number — because
mis-tracking `rollIndex` corrupts every frame after the mistake, not just
the current one. `isStrike`, checked before `isSpare` (unit 2), fixes the
one-vs-two-roll consumption difference and the ordering dependency between
the two checks, verified against all five tests, old and new.

### What breaks without this

Swap the order — check `isSpare` before `isStrike` — and re-run against
the strike test. Real, observable failure: the same
`IndexOutOfBoundsException` returns, because `isSpare(0)` on a strike
frame reads `rolls.get(1)`, which belongs to the *next* frame, and the
resulting miscount cascades exactly as it did before this lesson's fix.
Restore strike-first ordering and it passes again.

### Exercises

- Trace `strikeGetsBonusOfNextTwoRolls` by hand using the Execution Trace
  format, then verify with a real `println` inside the loop.
- Write a test for two strikes in a row (e.g., `10, 10, 3, ...`) and
  predict the score by hand — this is genuinely trickier, since the first
  strike's bonus now depends on rolls that are *themselves* a strike.

### Definition of done

- [ ] The strike test passes, and you saw the real crash first.
- [ ] All five tests pass together.
- [ ] You can explain, in your own words, why `isStrike` must be checked
      before `isSpare`.
- [ ] Commit: `git commit -m "Red-green-refactor cycle #4: strike scoring, with isStrike checked before isSpare"`.
