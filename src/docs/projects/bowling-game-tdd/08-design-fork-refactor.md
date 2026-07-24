# Lesson 8: Two Correct Designs, One Real Tradeoff

*(Refactor Only — the Kata's Famous Fork)*

**No new test, no new scoring rule.** Epic 1's nine tests already pass
against the flat-`List<Integer>` design from Lessons 2–7. This lesson is
pure refactor: stepping back to ask whether that design is actually the
*right* one, by building a genuine alternative and comparing both
honestly — the single most-discussed decision point in the real history
of this kata (Robert Martin has written multiple public retrospectives on
exactly this fork).

**What you need to know first:** every test and the full `Game`
implementation from Lessons 1–7.

---

## The Design Actually Built (Lessons 2–7)

```java
import java.util.ArrayList;
import java.util.List;

class Game {
    private final List<Integer> rolls = new ArrayList<>();

    void roll(int pins) {
        rolls.add(pins);
    }

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

    private boolean isStrike(int rollIndex) { return rolls.get(rollIndex) == 10; }
    private boolean isSpare(int rollIndex) { return rolls.get(rollIndex) + rolls.get(rollIndex + 1) == 10; }
}
```

Twenty-nine lines. One class. Every roll is just a number in one flat
list; "frame" is never a real object — it's a loop variable and an index
arithmetic trick.

## The Alternative — An Object-Oriented `Frame` Design

Built from scratch, verified against the exact same nine tests, to make
this comparison honest rather than hypothetical:

```java
import java.util.ArrayList;
import java.util.List;

class Frame {
    private final List<Integer> pinsPerRoll = new ArrayList<>();
    private final boolean isTenth;

    Frame(boolean isTenth) { this.isTenth = isTenth; }

    void addRoll(int pins) { pinsPerRoll.add(pins); }

    boolean isComplete() {
        if (pinsPerRoll.isEmpty()) return false;
        if (isTenth) {
            if (pinsPerRoll.size() < 2) return false;
            boolean gotBonusChance = pinsPerRoll.get(0) == 10
                || pinsPerRoll.get(0) + pinsPerRoll.get(1) == 10;
            return gotBonusChance ? pinsPerRoll.size() == 3 : pinsPerRoll.size() == 2;
        }
        if (pinsPerRoll.get(0) == 10) return true;
        return pinsPerRoll.size() == 2;
    }

    boolean isStrike() { return pinsPerRoll.get(0) == 10; }
    boolean isSpare() {
        return pinsPerRoll.size() >= 2
            && pinsPerRoll.get(0) != 10
            && pinsPerRoll.get(0) + pinsPerRoll.get(1) == 10;
    }
    int rollAt(int index) { return pinsPerRoll.get(index); }
    int rollCount() { return pinsPerRoll.size(); }
    int frameScore() {
        int sum = 0;
        for (int pins : pinsPerRoll) sum += pins;
        return sum;
    }
}

class Game {
    private final List<Frame> frames = new ArrayList<>();
    private Frame currentFrame;

    Game() { startNewFrame(); }

    private void startNewFrame() {
        currentFrame = new Frame(frames.size() == 9);
        frames.add(currentFrame);
    }

    void roll(int pins) {
        if (currentFrame.isComplete() && frames.size() < 10) {
            startNewFrame();
        }
        currentFrame.addRoll(pins);
    }

    int score() {
        int total = 0;
        for (int i = 0; i < 10; i++) {
            Frame frame = frames.get(i);
            total += frame.frameScore();
            if (frame.isStrike()) {
                total += nextIndividualRolls(i, 2);
            } else if (frame.isSpare()) {
                total += nextIndividualRolls(i, 1);
            }
        }
        return total;
    }

    private int nextIndividualRolls(int frameIndex, int count) {
        List<Integer> gathered = new ArrayList<>();
        for (int i = frameIndex + 1; i < frames.size() && gathered.size() < count; i++) {
            Frame frame = frames.get(i);
            for (int r = 0; r < frame.rollCount() && gathered.size() < count; r++) {
                gathered.add(frame.rollAt(r));
            }
        }
        int sum = 0;
        for (int pins : gathered) sum += pins;
        return sum;
    }
}
```

Two classes, roughly seventy lines. Run against the exact same nine tests
from Lessons 1–7 (renamed to `FullTest` in this comparison), real output —
verified this session:

```text
[         9 tests found           ]
[         9 tests successful      ]
[         0 tests failed          ]
```

*Both designs are correct.* This isn't a trick question with a hidden
right answer — this is the actual, well-documented real fork.

## The Honest Comparison

| | Flat `List<Integer>` | Object-Oriented `Frame` |
|---|---|---|
| Lines of code | ~29 | ~70 |
| What "a frame" is | A loop variable + index math | A real, named class |
| Where bonus lookahead lives | Direct index arithmetic on one flat list | `nextIndividualRolls`, walking across `Frame` boundaries |
| Encapsulation | `rolls` is one private list; frame boundaries are implicit, re-derived every `score()` call | `Frame` encapsulates its own rolls — but `Game.nextIndividualRolls` still has to reach *into* `Frame` via `rollAt`/`rollCount`, undoing some of that encapsulation |
| Readability of `score()` | Requires holding "rollIndex means what, right now" in your head | Reads closer to "for each frame, add its score, plus bonus if applicable" |
| Extending to more info per roll (Lesson 9 onward) | Every roll is just an `int` — no natural place to attach more data | `Frame` is a natural home for richer per-roll data later |

### CS Lens

Neither design is more "correct" in a computer-science sense — both pass
every test, both are `O(1)` per roll and `O(1)` per frame for scoring.
This is a genuine **design tradeoff**, not a right-answer question — the
kind of judgment call real software engineering is actually made of, as
opposed to a puzzle with one correct solution.

### SE Lens — Stated Honestly, Both Ways

**For the flat list:** less code, fewer moving parts, and — a real,
underappreciated point — the bonus-lookahead logic is *simpler* precisely
because it doesn't respect frame boundaries at all; it just reads "the
next N rolls," which is exactly what the scoring rule actually needs.
Robert Martin's own retrospectives on this kata have, at times, argued the
flat design is under-appreciated for exactly this reason.

**For the object-oriented `Frame`:** a `Frame` is a real, nameable concept
in the domain — useful the moment something *else* needs to know about
frames (a UI showing each frame's individual result, for instance,
Lesson 16's `Player`/game-history display). The real cost, honestly:
`nextIndividualRolls` still has to reach across `Frame` boundaries via
`rollAt`/`rollCount`, which means `Frame`'s encapsulation isn't actually
buying full independence — `Game` still needs to know a lot about
`Frame`'s internal roll sequence to score correctly. This is the exact
tension Martin's retrospectives name: an OO `Frame` design *looks* more
object-oriented, but the scoring rule itself resists being cleanly
decomposed per-frame, because a strike's score genuinely depends on data
outside that frame.

### This Project's Choice, Stated Honestly

Lessons 9 onward continue from the **flat `List<Integer>` design** — not
because it's objectively better, but because Epic 2's actual teaching
goals (value types, enums, exceptions, interfaces, generics) are better
served by a small, simple `Game` that those concepts can be added to
incrementally, one at a time, rather than a `Frame` class whose own
internal design decisions would compete for the same lessons' attention.
If you'd rather continue from the `Frame`-based version yourself, every
later lesson's *concepts* still apply — only some of the exact code
locations would differ.

---

## Definition of Done

- [ ] You built and ran the object-oriented `Frame` alternative yourself,
      not just read it — confirmed all nine tests pass against it too.
- [ ] You can state, in your own words, at least one real advantage of
      each design — not just "they're both fine."
- [ ] You can explain, concretely, why `Frame`'s encapsulation is
      genuinely incomplete here (why `Game` still needs `rollAt`/
      `rollCount`) — the specific tension Martin's own retrospectives
      discuss.
- [ ] Commit: `git commit -m "Refactor retrospective: compare flat-list and object-oriented Frame designs, both verified correct — continuing with the flat design"`.
