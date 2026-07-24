# Lesson 7: The Kata's Traditional Capstone

*(A Perfect Game Scores Exactly 300)*

**User Story**
> As a bowler, I want twelve strikes in a row (a perfect game) to score
> exactly 300 — the hardest, most cited stress test of this entire kata.

**What you will build**
Two final Epic 1 tests: a genuinely tricky "two strikes then a five" tenth
frame, and the traditional capstone — twelve consecutive strikes scoring
exactly `300`.

**What you need to know first**
Lesson 5's strike lookahead, Lesson 6's honest finding that tenth-frame
bonus rolls generalize for free.

---

## Concept Unit: A Genuinely Tricky Case — Bonus Rolls That Are Themselves Strikes

### The Problem

Lesson 6's tenth-frame tests both had *open or spare* bonus rolls — plain
numbers, not further strikes. A tenth frame of strike-strike-five is
harder: the frame's own bonus rolls are, themselves, a strike, which
raises a real question — does the lookahead logic get confused reading a
bonus roll that's a `10`?

### The New Code

```java
@Test
void twoStrikesThenFiveInTenthFrame() {
    Game game = new Game();
    rollMany(game, 18, 0);
    game.roll(10);
    game.roll(10);
    game.roll(5);
    assertEquals(25, game.score());
}
```

*Why `25`:* the tenth frame's own score is `10` (the strike) plus its two
bonus rolls, `10` and `5` — `10 + 10 + 5 = 25`. Nothing beyond the tenth
frame exists to further bonus that second strike — real bowling rules
stop awarding bonuses once the tenth frame's allotted extra rolls are
used up, and this test's total roll count (twenty-one) reflects exactly
that: 18 gutters + 3 more rolls, nothing further.

### Run it

Real output — verified this session:

```text
[         1 tests found           ]
[         1 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* passes immediately, same honest reason as Lesson 6 —
`rolls.get(rollIndex + 1)` and `rolls.get(rollIndex + 2)` don't care
*what value* those rolls hold, only that they exist at those positions.
A bonus roll that happens to be a `10` is read correctly as "the value
10," never mistakenly re-triggering strike logic of its own — because
`score()`'s frame loop only calls `isStrike`/`isSpare` at the *start* of
each of its ten iterations, never at the bonus-lookahead positions
themselves.

---

## Concept Unit: The Perfect Game — 300, Exactly

### The New Code

```java
@Test
void perfectGameScoresThreeHundred() {
    Game game = new Game();
    rollMany(game, 12, 10);
    assertEquals(300, game.score());
}
```

*Why twelve strikes, and why `300`:* ten frames, each a strike, would
normally need a look at "the next two rolls" for each of the first nine —
but the tenth frame's strike also gets two bonus rolls of its own. Twelve
total strikes covers exactly this: ten "real" frame-strikes plus two bonus
rolls in the tenth frame that are also strikes. Every one of the first
nine frames scores `10 + 10 + 10 = 30` (the frame's own strike, plus the
next two rolls, which are themselves strikes) — nine frames at `30` each
is `270`; the tenth frame scores `10 + 10 + 10 = 30` the same way, using
its own two bonus-strike rolls. Total: `270 + 30 = 300`.

### Run it

Real output — verified this session:

```text
[         1 tests found           ]
[         1 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* the design built incrementally across Lessons 1
through 6 — never once written with "handle the perfect game" as an
explicit goal — correctly produces bowling's maximum possible score on
the first try, with zero code changes. This is the honest reward of
building a general rule (frame-based lookahead) instead of special-casing
every scenario a bowler might actually roll.

### CS Lens

A perfect game is the input that exercises **every lookahead path
simultaneously and repeatedly** — twelve strikes means every single frame
in the loop takes the `isStrike` branch, and every lookahead read pulls
from rolls that are themselves strikes. If there were an off-by-one error
anywhere in the strike-consumption logic (Lesson 5's `rollIndex += 1`),
this is the input most likely to expose it — which is exactly why it's
the kata's traditional, most-cited stress test.

### SE Lens

Kent Beck's own writing on TDD names this pattern directly: tests should
progress from the simplest possible case toward the hardest, most
demanding one you can construct, and a design that survives the hardest
case without needing special-casing is real evidence (not just hope) that
the design generalizes correctly — not merely that it happens to pass the
specific tests you thought to write.

### Connection

Every test from Lesson 1 through this one still passes together — Epic 1
is functionally complete. Lesson 8 steps back from adding tests entirely,
to look honestly at the design these seven cycles produced.

---

## Closing

### Connect the pieces

The strike-heavy tenth frame (unit 1) confirmed bonus rolls that are
themselves strikes don't confuse the lookahead logic, because `isStrike`/
`isSpare` are only ever evaluated at real frame starts. The perfect game
(unit 2) stress-tested every strike path at once and produced bowling's
exact maximum score, `300`, with a design built one honest increment at a
time, never aimed at this specific case.

### What breaks without this

Deliberately introduce an off-by-one: change the strike branch's
`rollIndex += 1` to `rollIndex += 2` (the open/spare frames' increment,
applied where it doesn't belong). Re-run the perfect-game test. Real,
observable failure: either a wrong score or an `IndexOutOfBoundsException`
(depending on exactly how the miscount compounds across twelve frames) —
proof that a single misplaced increment, invisible in simpler tests,
becomes impossible to miss once put under this test's real pressure.
Restore `rollIndex += 1` and `300` returns.

### Exercises

- Run every test file from Lessons 1 through 7 together and confirm all
  nine tests pass as one suite — the actual, cumulative proof this
  design works, not just each test in isolation.
- Construct, by hand, a game that scores `299` (one pin short of perfect)
  and verify your prediction — a good, harder-than-it-sounds exercise in
  the same scoring rules.

### Definition of done

- [ ] All nine tests from Epic 1 pass together, in one run.
- [ ] The perfect game scores exactly `300`, verified by you.
- [ ] You can explain, in your own words, why a perfect game is this
      kata's hardest real stress test, not just its most famous one.
- [ ] Commit: `git commit -m "Red-green-refactor cycle #5: perfect game verified at 300 — Epic 1's scoring rules are complete"`.
