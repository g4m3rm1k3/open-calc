# Lesson 1: Red, Green, Refactor — For Real, Three Times

*(A Gutter Game Scores Zero)*

**User Story**
> As a developer, I want a failing test for the simplest possible bowling
> game, then the smallest code that makes it pass.

**What you will build**
The very first slice of the kata: a `Game` class where rolling all gutter
balls (every roll knocks down zero pins) scores `0`. Trivial as a feature —
the actual point of this lesson is experiencing red, green, and refactor as
three genuinely distinct, run-for-real states, not a phrase you've read
about.

**What you need to know first**
Lesson 0's Java fundamentals. Nothing about JUnit or the kata itself yet.

---

## Concept Unit: JUnit and the Shape of a Test

### The Problem

Before writing any bowling logic, you need a tool that can run a small
piece of code and report pass or fail — the mechanical infrastructure TDD
depends on. `../track/` Lesson 30 already covers JUnit's role in Android
testing; this unit is the plain-Java version of exactly that tool, with
nothing Android-specific in the way.

### The New Code

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GameTest {
    @Test
    void gutterGameScoresZero() {
        Game game = new Game();
        for (int i = 0; i < 20; i++) {
            game.roll(0);
        }
        assertEquals(0, game.score());
    }
}
```

### Mechanical walkthrough

1. `import org.junit.jupiter.api.Test;` — (hard concept reappearing) an
   `import`, same mechanism as any other Java import — this one brings in
   JUnit 5's test-marking annotation.
2. `@Test` — (first appearance in this project) an annotation marking this
   method as a test JUnit's runner should discover and execute — without
   it, `gutterGameScoresZero` is just an ordinary method nobody calls.
3. `void gutterGameScoresZero()` — a test method's name should read as a
   full description of what it verifies — this is a convention, not a
   language rule, but a strong one throughout real Java test suites.
4. `Game game = new Game();` — instantiating a class that does not exist
   yet — this line is written *before* `Game` is written at all, which is
   the entire point: the test defines what needs to exist, not the other
   way around.
5. `for (int i = 0; i < 20; i++) { game.roll(0); }` — twenty rolls, because
   a full game of ten frames, no strikes or spares, is always exactly
   twenty individual rolls.
6. `assertEquals(0, game.score());` — (hard concept reappearing from
   `../track/` Lesson 30) JUnit's core assertion — if `game.score()`
   doesn't equal `0`, the test fails and reports both values.

### CS Lens

A test is a **specification expressed as executable code** — instead of a
prose sentence ("a gutter game scores zero"), the exact same fact is
written as something that can be mechanically run and checked, forever,
by anyone, without re-reading prose to figure out if it's still true.

### Connection

This test doesn't compile yet — `Game` doesn't exist. That's the next
step, deliberately.

---

## Concept Unit: Red — A Test That Cannot Even Compile

### The Problem

TDD's first rule is: **see the test fail before writing any code to make
it pass.** Skipping this step means you can never be sure your test is
actually testing anything — a test that "passes" without ever having
failed first might be checking nothing at all.

### Run it — for real, before `Game` exists

```bash
javac -cp .:junit-platform-console-standalone.jar GameTest.java
```

Real output — verified this session:

```text
GameTest.java:7: error: cannot find symbol
        Game game = new Game();
        ^
  symbol:   class Game
  location: class GameTest
GameTest.java:7: error: cannot find symbol
        Game game = new Game();
                        ^
  symbol:   class Game
  location: class GameTest
2 errors
```

*What this proves:* this is red — not a failed assertion, an outright
compile error, because `Game` genuinely does not exist. This counts as
"the test fails" every bit as much as a runtime assertion failure would —
red simply means "this test does not currently pass," by any mechanism.

### CS Lens

This is the literal first phase of **red-green-refactor** — the cycle this
entire course's Epic 1 is built around. Red is not optional ceremony; it's
the only way to know your test *can* fail, which is the only way a
passing test later actually means something.

### SE Lens

Why insist on seeing red before green, when it feels slower? Because a
test you've never seen fail might be a test with a bug in its own
assertion (a typo comparing the wrong variable, an assertion that's
vacuously true) — you'd never notice, because it "passes" either way.
Seeing it fail for the *right* reason (the feature doesn't exist yet, not
a typo in the test itself) is the actual verification that the test is
worth anything at all.

### Connection

Green is next — the smallest possible code that turns this exact failure
into a pass.

---

## Concept Unit: Green — The Smallest Honest Step

### The Problem

Make the test pass with the least code possible — not the "right" final
design, the smallest true step from red to green.

### Project Change

- **Reference Source:** No reference counterpart — first production code
  in this project.
- **Files affected:** New file `Game.java`.
- **Change type:** Add.
- **Location:** Brand-new file.
- **Dependencies:** None.

### The New Code

```java
class Game {
    void roll(int pins) {
    }

    int score() {
        return 0;
    }
}
```

### The Updated Project

This is the entire new file — nothing to show it landing inside, per the
schema's own allowance for a brand-new file with nothing surrounding it
yet.

### Mechanical walkthrough

1. `class Game { ... }` — (hard concept reappearing) an ordinary class
   declaration, no access modifier written — Lesson 0's "package-private"
   default, a deliberate, honest choice for now: nothing outside this
   package needs `Game` yet.
2. `void roll(int pins) { }` — (first appearance in this project) a method
   with a genuinely empty body — it does nothing at all, on purpose. This
   satisfies the test's calls to `game.roll(0)` without needing to store
   anything yet, because nothing has asked for stored data to matter yet.
3. `int score() { return 0; }` — hardcoded, always `0`, regardless of
   what was rolled. This is deliberately, honestly **fake** — this
   specific technique has a name in TDD practice: "fake it till you make
   it" — write the most trivially wrong-looking implementation that still
   makes the current test pass, and let the *next* test force it to
   become real.

### Run it

```bash
javac -cp junit-platform-console-standalone.jar Game.java GameTest.java -d out
java -cp out:junit-platform-console-standalone.jar TestRunner GameTest
```

Real output — verified this session:

```text
[         1 tests found           ]
[         0 tests skipped         ]
[         1 tests started         ]
[         0 tests aborted         ]
[         1 tests successful      ]
[         0 tests failed          ]
```

*What this proves:* green — genuinely, for real, one test passing. Not
because the scoring logic is real (it obviously isn't — `score()` always
returns `0` no matter what happened), but because *this specific test*
only ever checks the all-gutters case, and a hardcoded `0` is a completely
honest way to satisfy exactly that, no more.

### CS Lens

"Fake it till you make it" is a real, named TDD technique, not a cop-out —
it keeps every step small enough to never be more than a few minutes from
green, and it forces the *next* test (Lesson 2) to be the thing that
proves the fake implementation wrong, rather than trusting your own
judgment about when logic is "real enough."

### SE Lens

The alternative — writing the full, general scoring algorithm right now,
before any test demands it — is exactly what TDD's discipline exists to
prevent: code written ahead of a test that requires it is code with no
proof it's even correct, and no test forcing it to stay correct as the
codebase grows. `return 0;` looks silly in isolation; it is not silly as
a *deliberate, temporary* step inside a cycle that will replace it the
moment a test needs it to be more.

### Connection

Lesson 2's test (`all ones scores 20`) is specifically chosen to make this
`return 0;` fail — the fake stops working the moment reality disagrees
with it.

---

## Concept Unit: Refactor — Nothing to Clean Up Yet, and That's Fine

### The Problem

The third phase of the cycle is refactor: improve the code's internal
structure without changing its behavior, with the test suite as proof
nothing broke.

### What refactoring means here

`Game` right now is two lines. There's genuinely nothing to improve —
and that's a legitimate, honest state for this step to be in. Refactor is
not "always find something to change"; it's "look, honestly, for
improvement, and make it if there's real improvement to make." Forcing a
change here (renaming `pins` for no reason, adding structure nothing needs
yet) would be exactly the premature complexity this whole method avoids.

### SE Lens

The discipline worth naming: refactor is a real, separate step from green
specifically so that "make it pass" and "make it good" are never
conflated into one activity you might rush. Here, skipping it isn't
skipping the discipline — it's correctly recognizing there's nothing to
do, this time.

### Connection

Lesson 2 is where refactor becomes real: introducing genuine storage for
rolls is exactly the kind of structural change this step exists for.

---

## Closing

### Connect the pieces

A test (unit 1) specifying "gutter game scores zero" was written and run
before `Game` existed at all — genuinely red (unit 2), a real compile
error. The smallest honest fix — an empty `roll()` and a hardcoded
`score()` — turned it green (unit 3), verified with real test-runner
output. Refactor (unit 4) had nothing to do yet, itself a legitimate,
named state in the cycle.

### What breaks without this

Change the test's expected value from `0` to `1` and re-run. Real,
observable failure: `1 tests failed`, with the assertion reporting
`expected: <1> but was: <0>` — direct proof the test is actually checking
something, not vacuously passing regardless of what `Game` does. Restore
`0` and it passes again.

### Exercises

- Add a second, near-identical test — "a gutter game with 21 rolls instead
  of 20 still scores zero" — and confirm it also passes trivially against
  the current fake implementation (it should; nothing here forces a real
  implementation yet).
- Try writing `assertEquals(game.score(), 0)` (arguments reversed) instead
  of `assertEquals(0, game.score())` and confirm the test still passes —
  then look up JUnit's convention for argument order (expected first,
  actual second) and why getting it backwards produces a confusing failure
  message on a real failure, even though it doesn't affect pass/fail here.

### Definition of done

- [ ] `GameTest.gutterGameScoresZero` genuinely failed to compile before
      `Game` existed — you saw the real error yourself.
- [ ] The test passes now, with the real test-runner output to show it.
- [ ] You can explain, in your own words, why `return 0;` is an honest
      implementation right now and not a shortcut you're getting away
      with.
- [ ] Commit: `git commit -m "Red-green-refactor cycle #1: gutter game scores zero, via a deliberately fake implementation"`.
