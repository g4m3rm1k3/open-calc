# Lesson 22: Making Randomness Reproducible

**What you will build:** A close, formal look at `Random` and seeds —
used only narrowly by Lesson 20, given their full treatment here — a
real proof of exactly why reproducibility matters (reporting a failing
puzzle as one short seed instead of an entire 81-cell grid), a real,
verified gotcha about Dart's own `assert()` statement, and a small, real,
self-contained test harness proving `project/lib/sudoku_board.dart`'s own
generation is genuinely reproducible — including a **deliberately wrong**
expectation, kept in on purpose to prove the harness actually detects a
real failure, not just always reporting success.

**What you need to know first:** Lesson 20's own narrow, deferred use of
`Random`, `generateComplete`, `removeDigits`, and its own real proof that
the same seed reproduces the same board — all restated here in full, not
re-derived. Lesson 21's `classifyDifficulty`, reused as this lesson's
third real reproducibility check. Lesson 13's `==`/`toString()` override
pattern (here, comparing two boards' own real text form for equality,
since `SudokuBoard` itself has no `==` override of its own).

**Terms used in this lesson:**

- **Increment operator (`++`)** — reappearing from Lesson 7, restated in
  full: shorthand for "add exactly `1` to this variable and store the
  result back into it."
- **`Random`** — reappearing from Lesson 20, given its full, general
  treatment for the first time: a real `dart:math` class producing a
  sequence of pseudorandom values, either reproducibly (given a seed) or
  not (left to the system's own entropy).
- **Seed** — reappearing from Lesson 20, given its full, general
  treatment for the first time: a starting value that fully determines
  every "random" value a `Random` instance will ever produce afterward —
  the same seed, used twice, produces the exact same sequence every
  single time, proven again, more thoroughly, in this lesson's own
  Concept Unit 4.
- **Pseudorandom** — appearing "random" in the sense of passing
  statistical tests for randomness, while actually being fully computed
  by a deterministic (Lesson 20's term, reappearing) formula from a
  starting seed — genuinely different from true, physical randomness
  (radioactive decay, atmospheric noise), which cannot be reproduced by
  definition.
- **Reproducibility** — the property that running the same process again,
  from the same starting conditions, produces the exact same result —
  the entire reason this lesson's own real proofs matter: a puzzle that
  causes a real bug can be reported, reliably, as nothing more than one
  short seed, rather than an entire 81-cell grid.
- **`assert()`** — a real Dart statement that checks a condition and, if
  it's `false`, throws a real `AssertionError` naming exactly which
  condition failed and where — but, this lesson's own real proof shows,
  only when a program is actually run with assertions enabled; by
  default, a plain `dart run` silently ignores every `assert()` in the
  program, as though it were never written at all.
- **`AssertionError`** — a real `dart:core` class, thrown automatically
  by a failed `assert()` when assertions are actually enabled — a
  genuine, standard-library exception (Lesson 14's own family of
  concepts, reappearing), not a `SudokuBoard`-specific invention.
- **`--enable-asserts`** — a command-line flag for `dart run`, turning on
  enforcement of every `assert()` in the program for that one run —
  without it, this lesson's own real proof shows every `assert()` is a
  complete no-op.
- **Test, expectation** — a **test** is a small, self-contained piece of
  code that runs a real operation and checks its real result against a
  known, expected one; an **expectation** is one specific such check —
  "this exact value should equal that exact value." This lesson writes
  its own small, manual version of both, rather than reaching for
  `assert()` (given this lesson's own real gotcha about it) or a formal
  testing framework, which is Phase 10's own subject, not yet built.

**Objects and methods used:**

- **`SudokuBoard`**
  - *What it is:* the same real class Lessons 17-21 worked with, in
    `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session. No
    new members are added this lesson — every real proof here exercises
    `generateComplete`, `removeDigits`, and `classifyDifficulty` exactly
    as Lessons 20 and 21 already built them.
  - *Its use:* this entire lesson's subject is proving these already-real
    methods behave reproducibly.
  - *Type:* a real, encapsulated class (Lesson 11's term, reappearing).
  - *Responsibility:* unchanged from Lesson 21.
  - *Depends on:* unchanged from Lesson 20/21.
  - *Connects to:* unchanged from Lesson 20/21.
  - *Shape:* unchanged from Lesson 17.
- **`Object`**
  - *What it is:* the same real `dart:core` class Lesson 10/13
    introduced — the root of every class in Dart.
  - *Implementation:* real member used fresh here: `String toString()`
    (already overridden by `SudokuBoard`, Lesson 17), and the default
    `bool operator ==(Object other)` (Lesson 13, reappearing) — which
    `SudokuBoard` does *not* override, meaning two separately-built
    `SudokuBoard`s are never `==` to each other by value, exactly Lesson
    13's own real, proven default.
  - *Its use:* this lesson compares two boards' own real text
    (`.toString()`) rather than the boards themselves with `==`, because
    of that exact default.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 13.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: A Number Sequence That Isn't Really Random

### The Problem

Lesson 20 used `Random(seed)` narrowly, proving one real fact (the same
seed reproduces the same board) without ever explaining *why* that's
even possible — real randomness, by definition, can't be reproduced.

> **Stop and think before reading on:** If `Random`'s own values are
> fully determined by a starting seed, in what sense are they "random"
> at all? What real, practical difference does that make compared to,
> say, physically flipping a coin?

### Project Change

- **Reference Source:** No reference counterpart — this unit restates
  Lesson 20's own already-real usage of `Random`, giving it full
  treatment rather than introducing new code.
- **Files affected:** None — this unit reuses Lesson 20's own already-
  real, already-saved evidence.
- **Change type:** N/A — restatement, per the Repetition Rule.
- **Location:** N/A.
- **Dependencies:** Lesson 20's own real `Random(1)`/`Random(2)` proof.

### The New Code

Lesson 20's own already-real code, restated:

```dart
var boardA = SudokuBoard.generateComplete(Random(1));
var boardB = SudokuBoard.generateComplete(Random(2));
```

### The Updated Project

Not applicable — no new project code; this unit restates Lesson 20's own
already-real evidence.

### Introduce the concept in isolation

Nothing new to run — Lesson 20's own real, saved proof already
established this:

```
two random complete boards identical: false
```

`Random(1)` and `Random(2)` produced two genuinely different real
complete boards. `Random`'s values are called **pseudorandom** (this
lesson's term): computed by a fixed, deterministic (Lesson 20's term,
reappearing) formula from the seed, statistically indistinguishable from
true randomness for practical purposes, but — unlike a real coin flip —
fully reproducible given the same starting seed.

### Discarding this example

Nothing to discard — this unit reuses Lesson 20's own already-real,
already-saved evidence rather than introducing new throwaway code.

### Mechanical walkthrough

- **`Random(1)`, `Random(2)`** — `Random`'s own real constructor (this
  lesson's header), each given a different **seed** (this lesson's term)
  — `1` and `2` — producing two genuinely different pseudorandom
  sequences.
- **`SudokuBoard.generateComplete(...)`** — Lesson 20's own already-real,
  `static` (Lesson 20's term, reappearing) method, each call using its
  own `Random` instance's own sequence to shuffle candidate order
  (Lesson 20).

### CS lens

A pseudorandom number generator is itself a real, deterministic (Lesson
20's term, reappearing) algorithm — the "randomness" is really
*unpredictability without already knowing the seed and the formula*, not
the absence of any underlying rule at all.

```
Also recognized in: video game world generation from a shared seed
(letting two players compare the exact same generated world); a
cryptographic key derived from a passphrase, deterministically, so
the same passphrase always regenerates the same key; a simulation
run twice from the same random seed to reproduce the exact same
sequence of events for debugging
```

### SE lens

True randomness (a hardware source, or the system's own unpredictable
entropy) can't be asked to repeat itself — which is exactly why testing
or debugging anything built on top of it would be far harder without
pseudorandomness: a `Random` with no seed given still behaves this same
deterministic way internally, it's simply seeded from something
unpredictable (often the current time) instead of a fixed number a
programmer chose.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Not run standalone — this unit reuses Lesson 20's own already-real,
already-saved output rather than producing a new run.

### Connecting this unit

This unit explained why `Random` can be both varied and reproducible.
The next unit turns to *why* reproducibility specifically matters for
this project.

---

## Concept Unit: Reporting a Bug as One Short Number

### The Problem

Suppose a randomly generated puzzle, somewhere down the line, turns out
to trigger a real bug — maybe `classifyDifficulty` (Lesson 21) crashes on
it, or `hasUniqueSolution` (Lesson 20) gives a wrong answer. How would
that specific puzzle actually get reported and reproduced later, for
debugging?

> **Stop and think before reading on:** Given that `generateComplete` and
> `removeDigits` both take a `Random`, built from a single **seed** (this
> lesson's term), what's the smallest possible piece of information
> needed to describe — and later exactly recreate — one specific
> generated puzzle, compared to writing out its entire 81-cell grid by
> hand?

### Project Change

- **Reference Source:** No reference counterpart — a conceptual unit,
  reasoning about an implication of Lesson 20's own already-real design
  rather than introducing new code.
- **Files affected:** None.
- **Change type:** N/A — conceptual.
- **Location:** N/A.
- **Dependencies:** Lesson 20's own `generateComplete`/`removeDigits`.

### The New Code

No new code — the reasoning: a specific generated puzzle is fully
described by exactly three whole numbers — the seed used for
`generateComplete`, the seed used for `removeDigits`, and the number of
cells removed — rather than an entire 81-cell grid.

### The Updated Project

Not applicable — conceptual unit, no code changes.

### Introduce the concept in isolation

Nothing new to run — the reasoning is already fully supported by Lesson
20's own real, saved proof: the exact same three numbers (`Random(1)` for
`generateComplete`, `Random(42)` for `removeDigits`, and `40` cells)
reliably reproduce the identical starting grid every time, already
proven in that lesson's own real run.

### Discarding this example

Nothing to discard — pure reasoning over Lesson 20's own already-real
evidence.

### Mechanical walkthrough

- **The seed for `generateComplete`** — fully determines which complete
  board is built.
- **The seed for `removeDigits`** — fully determines which cells,
  specifically, get emptied out of that complete board.
- **The removal count** — fully determines how many cells are emptied.
- **Together, these three numbers** — not the grid itself — are
  **reproducibility** (this lesson's term) made concrete: enough
  information, on their own, to recreate the exact same puzzle again,
  any time, on any machine running this same code.

### CS lens

Describing a large, complex artifact (an 81-cell grid) with a tiny,
fixed amount of information (three numbers) that can regenerate it
exactly is the same underlying idea as a **procedural** generation
technique — the artifact itself is never stored or transmitted, only the
process (and its seed) that produces it.

```
Also recognized in: procedurally generated game worlds, described
and shared as a single seed rather than gigabytes of map data; a
compressed file format that stores instructions to reconstruct data
rather than the data itself; a mathematical fractal, fully described
by a short formula rather than an image of arbitrary size
```

### SE lens

Without reproducibility, a bug report for a randomly-generated puzzle
would need to include the entire, specific 81-cell grid that triggered
it — verbose, and, worse, that same buggy scenario could never be
regenerated fresh to test whether a fix actually resolved it, only
replayed from the one saved grid. Reporting three seeds/counts instead
means the exact failing scenario can be regenerated on demand, tested
against a fix, and — as the next unit builds directly — turned into a
real, permanent, automated check.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — pure reasoning over Lesson 20's own already-real
evidence.

### Connecting this unit

This unit explained why reproducibility matters. The next unit turns to
Dart's own built-in `assert()` — a natural-seeming tool for turning this
into a real, automated check — and finds a real, easy-to-miss problem
with relying on it.

---

## Concept Unit: A Built-In Check That's Silently Off by Default

### The Problem

Dart provides a real, built-in `assert()` statement for exactly this
kind of check — "this condition must hold, or something is wrong." Is it
safe to build this project's own reproducibility checks on top of it?

> **Stop and think before reading on:** If `assert()` throws when its
> condition is `false`, what do you predict happens if you run a program
> containing a *deliberately* false `assert()` with a plain `dart run` —
> does it crash exactly the way you'd expect, or is there a real chance
> nothing happens at all?

### Project Change

- **Reference Source:** No reference counterpart — this unit's own
  throwaway proof exists purely to establish a real fact about Dart's
  toolchain before this lesson's final unit builds on it.
- **Files affected:** `src/docs/flutter/verification/lesson-22/assert_check.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** A working `dart` installation.

### The New Code

```dart
assert(1 + 1 == 2, 'math is broken');
print('after true assert');
assert(1 + 1 == 3, 'this should fail');
print('after false assert — did we get here?');
```

### The Updated Project

Not applicable — a brand-new, freestanding file.

### Introduce the concept in isolation

This is exactly the kind of hidden-behavior claim the Verification Rule
demands real proof for, not a guess. A plain `dart run`:

```
before assert
after true assert
after false assert — did we get here?
```

The deliberately false assertion, `1 + 1 == 3`, was **completely
ignored** — no error, no crash, exit code `0`. Then, the identical file,
run with **`--enable-asserts`** (this lesson's term):

```
before assert
after true assert
Unhandled exception:
'file:///.../assert_check.dart': Failed assertion: line 5 pos 10: '1 + 1 == 3': this should fail
```

Exit code `255` — now the same false assertion genuinely throws a real
**`AssertionError`** (this lesson's term), naming the exact failed
condition and its exact source location. This proves `assert()` is
**disabled by default** in a plain `dart run`.

### Discarding this example

`1 + 1 == 2`/`1 + 1 == 3` are disposable, one-time proofs. What carries
forward: `assert()` only actually does anything when a program is run
with `--enable-asserts`; without it, every `assert()` in a program —
correct or not — is silently skipped entirely.

### Mechanical walkthrough

- **`assert(1 + 1 == 2, 'math is broken')`** — Dart's own `assert`
  statement: its first argument is a `bool` (Lesson 5's real class,
  reappearing) condition; its second, optional argument is a `String`
  (Lesson 5's real class, reappearing) message shown only if the
  condition is `false` and assertions are enabled.
- **`print('after true assert')`** — the same `print` function from this
  lesson's header; reached identically whether or not assertions are
  enabled, since this specific assertion's own condition is `true`
  either way.
- **`assert(1 + 1 == 3, 'this should fail')`** — the same statement,
  this time with a condition that's genuinely `false`; whether this line
  actually does anything at all depends entirely on how the program was
  launched — proven above to differ completely between the two real
  runs.
- **`print('after false assert — did we get here?')`** — reached in the
  default run (proving the assertion above did nothing), never reached
  in the `--enable-asserts` run (proving it genuinely threw and crashed
  the program before this line could run).

### CS lens

A check that's silently disabled unless specifically turned on is a real,
deliberate design choice found in more than one language — the underlying
idea being that assertion checks, useful during development, can carry a
real runtime cost not worth paying once code is trusted and shipped.

```
Also recognized in: Java's own `assert` keyword, disabled by default
identically, requiring a `-ea` flag to enable; C's own `assert()`
macro, compiled away entirely when `NDEBUG` is defined; a car's own
diagnostic mode, active only when specifically engaged, not during
ordinary driving
```

### SE lens

Relying on `assert()` for a check that genuinely must always run — like
this project's own reproducibility guarantee — is a real, easy mistake:
code that "works" during development (if a developer happens to always
pass `--enable-asserts`) could silently skip every one of its own checks
the moment someone runs it the plain, default way, with no warning at
all that anything was even skipped. This is exactly why this lesson's
final unit reaches for a small, manual check instead, rather than
`assert()` — one that genuinely runs and reports its own result no
matter how the program is launched.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used, its own default behavior now proven to skip every `assert()`.
- **`--enable-asserts`** (this lesson's term) — a flag to `dart run`
  turning assertion enforcement genuinely on for that one run; success
  looks like a real, thrown `AssertionError` for any assertion whose
  condition turns out `false`.

### Run it

Real, verified output, both real runs:

```
before assert
after true assert
after false assert — did we get here?
```

```
before assert
after true assert
Unhandled exception:
'file:///.../assert_check.dart': Failed assertion: line 5 pos 10: '1 + 1 == 3': this should fail
```

Real, saved in full in
`src/docs/flutter/verification/lesson-22/run-log.md`.

### Connecting this unit

This unit proved `assert()` alone can't be trusted for a check that must
always run. The final unit writes this project's own small, manual,
always-enforced check instead — a real, working deterministic test.

---

## Concept Unit: A Real, Working Deterministic Test

### The Problem

This project needs a check that genuinely always runs, reporting
`generateComplete`/`removeDigits`/`classifyDifficulty`'s own real
reproducibility — not one silently skipped by a default `dart run`
(previous unit's own real proof). Phase 10 (Testing) hasn't introduced a
formal testing framework yet. What's the smallest real, working way to
write this today?

> **Stop and think before reading on:** If you needed a check that always
> runs, always reports its own real result, and never depends on a
> special command-line flag, what would the smallest possible version of
> that look like — using only what this curriculum has already taught?

### Project Change

- **Reference Source:** No reference counterpart — a genuinely new,
  small test harness, kept as verification content rather than a
  permanent part of `project/`, since formal testing infrastructure is
  Phase 10's own subject.
- **Files affected:** `src/docs/flutter/verification/lesson-22/deterministic_tests_demo.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** `generateComplete`, `removeDigits`, `classifyDifficulty`
  (Lessons 20-21).

### The New Code

```dart
int testsRun = 0;
int testsFailed = 0;

void expectEqual(Object? actual, Object? expected, String description) {
  testsRun++;
  if (actual != expected) {
    testsFailed++;
    print('FAIL: $description — expected $expected, got $actual');
  } else {
    print('PASS: $description');
  }
}
```

### The Updated Project

Not applicable — a brand-new, freestanding file (this lesson's own real
tests, shown next, call this function directly afterward, in the same
file).

### Introduce the concept in isolation

Whether this genuinely detects both a real success *and* a real failure —
not just always reporting one or the other — is worth real, contrasted
proof. Three genuine reproducibility checks, plus one **deliberately
wrong** expectation kept in on purpose:

```
PASS: same seed reproduces the same complete board
PASS: same seed reproduces the same removal pattern
PASS: same seed reproduces the same difficulty classification
FAIL: DELIBERATE: different seeds should NOT match (expected to fail) — expected [board A's real text], got [board C's real text]
4 tests run, 1 failed
```

Three real passes confirm end-to-end reproducibility: the same seed
reproduces an identical complete board, an identical removal pattern,
and therefore an identical difficulty classification. The fourth,
deliberately wrong expectation — that two genuinely *different* seeds
should produce matching boards — correctly reports `FAIL`, proving this
small harness genuinely compares real values rather than always
reporting success regardless of what's checked.

### Discarding this example

Nothing to discard — this test harness is real, working verification
content, kept in `verification/lesson-22/`, not `project/` itself; formal
tests belonging to the actual, growing project are Phase 10's own job.

### Mechanical walkthrough

- **`int testsRun = 0; int testsFailed = 0;`** — two declarations
  (Lesson 5's term, reappearing) of top-level, mutable `int` counters.
- **`void expectEqual(Object? actual, Object? expected, String description)`**
  — a function declaration (Lesson 8's term, reappearing) — a **test**
  helper (this lesson's term): `Object?` (Lesson 10's own most general
  nullable type, reappearing) lets `actual`/`expected` be any comparable
  value at all.
- **`testsRun++;`** — the increment operator (Lesson 7's term,
  reappearing).
- **`if (actual != expected)`** — Lesson 6's `if` and inequality operator
  (both reappearing); comparing with Dart's own default `==` (Lesson 13's
  term, reappearing) — for this lesson's own real tests, always comparing
  two `String`s (board text) or two enum-like difficulty strings, never
  two `SudokuBoard` objects directly, specifically because `SudokuBoard`
  has no `==` override of its own (this lesson's header).
- **`testsFailed++;`, `print('FAIL: $description — expected $expected, got $actual');`**
  — the same increment operator, and `print` with string interpolation
  (Lesson 4's term, reappearing) reporting exactly which **expectation**
  (this lesson's term) failed and what the real, actual value was.
- **`print('PASS: $description');`** — the matching success report.

### CS lens

A small, self-written function that runs a real operation and compares
its real result against a known-correct one is the actual, minimal
essence of **automated testing** — everything a full testing framework
(Phase 10) adds on top of this (test discovery, reporting, grouping) is
convenience layered over this exact same basic idea: run something real,
compare it to what's expected, report the difference honestly.

```
Also recognized in: every unit testing framework in every language,
built on the same run-compare-report core; a factory's own quality-
control check, running a real sample through a real process and
comparing it against a known-good specification; a scientific
experiment's own control group, providing the known "expected" value
a real result is measured against
```

### SE lens

Deliberately keeping one wrong expectation in this lesson's own real test
run — rather than deleting it once it was confirmed correct — is a real,
deliberate choice: it's live, ongoing proof that this harness's own
`FAIL` path genuinely works, not just its `PASS` path. A test suite that
has never actually been seen to fail is a real, common source of false
confidence — a broken test that *always* reports success (a bug in the
test itself, not the code it checks) is indistinguishable from a
genuinely passing one unless something has actually been seen to fail at
least once.

### Commands needed

- **`dart run <file>`** — same command as every earlier unit this
  lesson.

### Run it

Real, verified, complete output:

```
PASS: same seed reproduces the same complete board
PASS: same seed reproduces the same removal pattern
PASS: same seed reproduces the same difficulty classification
FAIL: DELIBERATE: different seeds should NOT match (expected to fail) — expected [board A's real text], got [board C's real text]
4 tests run, 1 failed
```

Real, saved in full in
`src/docs/flutter/verification/lesson-22/run-log.md`.

### Connecting this unit

This unit closed this lesson with a real, working, always-enforced
deterministic test — proven, by its own deliberate failure, to actually
work in both directions.

---

## Connect the Pieces

Trace one seed through everything this lesson built. Concept Unit 1
explained why `Random(1)` and `Random(2)` — both pseudorandom, both fully
determined by their own seed — produced two genuinely different real
boards, restating Lesson 20's own already-real proof rather than
re-deriving it. Concept Unit 2 reasoned that this same property means a
buggy, randomly-generated puzzle can be reported and reproduced with just
three numbers, never an entire grid. Concept Unit 3 proved, with a real,
contrasted pair of runs, that Dart's own built-in `assert()` can't be
trusted for a check that must always run — silently skipped by a plain
`dart run`, only actually enforced with `--enable-asserts`. And Concept
Unit 4 built this project's own small, real, always-enforced test
harness instead, proven, by one deliberately wrong expectation kept in on
purpose, to genuinely detect failure and not just report success by
default.

`project/lib/sudoku_board.dart`'s own randomness is no longer just
"proven reproducible once" (Lesson 20) — it now has a real, working,
repeatable check confirming that reproducibility, built entirely from
tools this curriculum has already taught, with an honest accounting of
what Dart's own built-in `assert()` can and can't be trusted for.
Lesson 23 turns to a different real question this project has flagged
forward more than once already: how fast is any of this, really?
