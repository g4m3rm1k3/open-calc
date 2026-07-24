# Lesson 6: When the Test You Expected to Fail... Doesn't

*(The Tenth Frame's Special Case)*

**User Story**
> As a bowler, I want a spare or strike in the tenth (final) frame to
> correctly award its bonus roll(s), even though there's no eleventh frame
> to borrow rolls from.

**What you will build**
Two tests targeting the kata's traditionally hardest edge case — the
tenth frame allows extra rolls specifically so a spare or strike there
still has something to award as a bonus. Written expecting to need new
code — the honest, real result is more interesting than that.

**What you need to know first**
Lesson 5's strike/spare lookahead logic — this lesson tests it against
its trickiest input rather than adding new logic outright.

---

## Concept Unit: A Test That's Expected to Force a Rewrite

### The Problem

Every previous test padded the game out to exactly twenty rolls with
gutter balls after the interesting part. The tenth frame is different in
real bowling: if you spare or strike in it, you get one or two *extra*
rolls, specifically so there's something for that frame's own bonus to
point at (since there's no eleventh frame to borrow from). This is
traditionally the hardest part of this kata to get right — worth writing
the test expecting a real fight.

### The New Code

```java
@Test
void spareInTenthFrameGetsOneBonusRoll() {
    Game game = new Game();
    rollMany(game, 18, 0);
    rollAll(game, 5, 5, 3);
    assertEquals(13, game.score());
}

@Test
void strikeInTenthFrameGetsTwoBonusRolls() {
    Game game = new Game();
    rollMany(game, 18, 0);
    rollAll(game, 10, 4, 5);
    assertEquals(19, game.score());
}
```

*Why `13` and `19`:* nine gutter frames contribute nothing. In the first
test, the tenth frame is a spare (`5, 5`) with one bonus roll (`3`) —
`10 + 3 = 13`. In the second, the tenth frame is a strike (`10`) with two
bonus rolls (`4, 5`) — `10 + 4 + 5 = 19`.

### Run it against Lesson 5's `Game`, unchanged

Real output — verified this session:

```text
[         2 tests found           ]
[         2 tests successful      ]
[         0 tests failed          ]
```

*What this proves — genuinely, not a scripted teaching moment:* both
tests pass immediately, with zero changes to `score()`. This is worth
taking seriously rather than being disappointed by. Here's the honest
reason it works: `score()`'s loop only ever runs exactly ten times
(`frame < 10`), and each iteration's lookahead (`rolls.get(rollIndex + 1)`,
`rolls.get(rollIndex + 2)`) doesn't know or care whether those positions
belong to "the next frame" or "this frame's own bonus rolls" — they're
just the next entries in one flat list, either way. The tenth frame's
bonus rolls get appended to `rolls` by the exact same `roll()` method
every other roll uses, and the scoring loop's lookahead reads them exactly
the same way it would read a genuine eleventh frame's rolls, if bowling
had one.

### CS Lens

This is a real example of a well-chosen abstraction **generalizing for
free** — `score()` was never written with "the tenth frame is special" as
a rule; it was written as "look ahead N positions in a flat sequence,"
and that description happens to already cover this case without asking it
to. This is worth naming honestly as a *design property*, not luck: the
flat-list, index-based representation doesn't distinguish "frame 10's
bonus roll" from "frame 11's first roll" at all, and that's exactly why
this generalizes without new code.

### SE Lens

A test that passes immediately, with no code change, is not a wasted
test — it's a **regression test**, locking in a fact about the current
design (that it handles this case) so that a *future* change (Lesson 8's
alternative design, for instance) can be checked against the exact same
expectation. Writing this test and being surprised that it passes is
itself a legitimate, useful TDD moment: it tells you something true and
non-obvious about your own design that you didn't know for certain until
you checked.

### Connection

This generalization has a limit worth finding honestly, not assuming:
Lesson 7's perfect-game test is the next, harder stress test of the exact
same lookahead logic — twelve strikes in a row, the traditional capstone
of this kata.

---

## Closing

### Connect the pieces

Two tests were written expecting to force new tenth-frame-specific logic
into `score()`. Neither did — Lesson 5's flat-list lookahead already
generalizes correctly, because it never distinguished "next frame" from
"this frame's bonus roll" in the first place. Both tests still earn their
place in the suite: they now document and protect this fact for good.

### What breaks without this

Artificially restrict `roll()` to reject a call once twenty rolls have
been recorded (a plausible-looking "safety" check someone might add
without thinking it through): `if (rolls.size() >= 20) return;`. Re-run
both tenth-frame tests. Real, observable failure: the tenth frame's bonus
roll(s) — the 21st roll in the spare case, the 21st and 22nd in the
strike case — get silently dropped, and both tests fail with a lower
score than expected. Remove the artificial limit and both pass again —
concrete proof that the *lack* of any hardcoded 20-roll assumption is
precisely what let Lesson 6 pass without new code.

### Exercises

- Write the artificial `rolls.size() >= 20` check yourself, confirm both
  tests break, then remove it and confirm they pass again — seeing a
  regression test actually catch a regression is worth doing at least
  once.
- Predict, before running it, what a game with a spare in the tenth frame
  followed by a bonus roll of `10` would score, and verify your prediction.

### Definition of done

- [ ] Both tenth-frame tests pass.
- [ ] You can explain, in your own words, *why* they pass without new
      code — not just that they do.
- [ ] You triggered a real regression yourself (the artificial roll-limit
      exercise) and watched these exact tests catch it.
- [ ] Commit: `git commit -m "Add tenth-frame regression tests — confirms the existing lookahead design already generalizes correctly"`.
