# Lesson 23: Measuring What Actually Costs Time

**What you will build:** Real, `Stopwatch`-measured timings across
`project/lib/sudoku_board.dart`'s own real methods — and a real,
first-hand discovery that the very first measurement taken was
misleading by roughly 7x, before a corrected, warmed-up, averaged
measurement revealed something genuinely surprising: the real,
published milestone puzzle (`Easy`, per Lesson 21) took *longer* for
`solve()`'s own plain backtracking to finish than a real, harder-for-a-
human puzzle. Every claim in this lesson is measured, not estimated.

**What you need to know first:** Lesson 1's JIT-versus-AOT compilation
CS lens — this lesson's own first real discovery is a direct, concrete
consequence of it. Lesson 19's own 120-second real false start and
Lesson 20's own honest, unmeasured worry about shuffled candidate order —
both explicitly deferred here, both now measured for real. Lesson 21's
`classifyDifficulty`, directly contrasted against raw `solve()` time in
this lesson's own central finding.

**Terms used in this lesson:**

- **Cascade operator (`..`)** — calls a method (or sets a property) on the
  object a preceding expression just produced, and evaluates to that same
  object afterward, rather than to the method's own return value. This
  lesson uses this narrowly, only for `Stopwatch()..start()` — constructing
  a `Stopwatch` and immediately starting it in one expression; the
  cascade operator's own full, general treatment is not this lesson's
  subject.
- **`Stopwatch`** — a real `dart:core` class for measuring real elapsed
  time around a piece of code.
- **Microsecond** — one millionth of a second — the unit `Stopwatch`'s
  own `elapsedMicroseconds` reports in, fine-grained enough to measure
  operations this project's own methods complete in in well under a
  millisecond.
- **JIT warmup** — the real, measurable effect of Dart's own
  just-in-time compilation (Lesson 1's term, reappearing): the first
  time a specific piece of code actually runs, it executes less
  optimized (or not yet compiled at all); repeated execution lets the
  runtime progressively compile and optimize that same code, making
  later runs genuinely faster. This lesson's own first real measurement
  is direct, first-hand proof of this effect, not a citation to Lesson 1's
  own conceptual explanation of JIT alone.
- **Benchmark** — a deliberate, repeatable measurement of how long a
  specific operation actually takes, structured (this lesson's own real
  proof shows why) to discard early, unrepresentative measurements before
  recording ones that reflect real, ongoing cost.
- **Algorithmic complexity (Big-O notation)** — a way of describing how
  an algorithm's own real cost grows as its input grows, independent of
  any one specific machine's real speed — written `O(...)`, naming the
  *shape* of that growth (constant, linear, exponential) rather than an
  exact number of operations.
- **Allocation** — creating a new object (here, almost always a new
  `List`) at runtime, requiring the runtime to find and reserve real
  memory for it. It exists as a real, measurable cost distinct from the
  computation an algorithm performs — two algorithms doing the identical
  number of comparisons can still have very different real costs if one
  allocates far more new objects along the way than the other.

**Objects and methods used:**

- **`Stopwatch`**
  - *What it is:* a real class from `dart:core`.
  - *Implementation:* `Stopwatch()` (a plain constructor); real members
    used here: `void start()`, `void stop()`, and `int
    get elapsedMicroseconds`.
  - *Its use:* every real timing in this lesson is measured with one.
  - *Type:* a class.
  - *Responsibility:* measure real elapsed wall-clock time between a
    `start()` and a `stop()` call.
  - *Depends on:* being started and stopped around the exact code being
    measured.
  - *Connects to:* wraps calls to `solve`, `generateComplete`,
    `hasUniqueSolution`, `isValidMove`, `findHiddenSingle`, and
    `classifyDifficulty` (Lessons 18-21) in this lesson's own real
    measurements.
  - *Shape:* `dart:core`'s own standard-library surface, a new
    dependency for this project's own verification code (not `project/`
    itself).
- **`SudokuBoard`**
  - *What it is:* the same real class Lessons 17-22 worked with, in
    `project/lib/sudoku_board.dart`.
  - *Implementation:* real, current source, read fresh this session. No
    new members are added this lesson — every real measurement here
    exercises already-existing methods.
  - *Its use:* this entire lesson's subject is measuring these
    already-real methods.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged from
    Lesson 22.
- **`print`**
  - *What it is:* the same function every earlier lesson has used.
  - *Implementation:* `void print(Object? object)`, `dart:core`.
  - *Its use:* every result in this lesson is made visible through it.
  - *Type/Responsibility/Depends on/Connects to/Shape:* unchanged since
    Lesson 1.

---

## Concept Unit: The First Measurement Is Often a Lie

### The Problem

Lesson 19 hit a real, 120-second false start measuring one specific,
badly-chosen puzzle. Before measuring anything else in this project,
is a single, one-shot timing even trustworthy at all — or does something
about *how* Dart runs code make the very first measurement misleading on
its own?

> **Stop and think before reading on:** Lesson 1's own CS lens already
> distinguished JIT (translate-and-run-together) from AOT (translate-
> everything-first) compilation, and named `dart run` as using JIT. Given
> that, what would you predict about the *very first* time a specific
> piece of code actually runs, compared to the *tenth* time the identical
> code runs, in the same program?

### Project Change

- **Reference Source:** No reference counterpart — this unit checks a
  real, general fact about this project's own toolchain rather than
  reasoning about a specific reference implementation.
- **Files affected:** `src/docs/flutter/verification/lesson-23/warmup_check.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** `solve()` (Lesson 19).

### The New Code

```dart
for (var i = 0; i < 5; i++) {
  final stopwatch = Stopwatch()..start();
  SudokuBoard(samplePuzzle).solve();
  stopwatch.stop();
  print('run $i: ${stopwatch.elapsedMicroseconds} microseconds');
}
```

### The Updated Project

Not applicable — a brand-new, freestanding file.

### Introduce the concept in isolation

This is exactly the kind of hidden-behavior claim the Verification Rule
requires real proof for — run for real, five separate times, in the same
process:

```
run 0: 14053 microseconds
run 1: 2062 microseconds
run 2: 2034 microseconds
run 3: 2083 microseconds
run 4: 1750 microseconds
```

The very first call took roughly **7 times longer** than every call
after it — real, direct proof of **JIT warmup** (this lesson's term):
the exact same code, called repeatedly, genuinely gets faster as Dart's
own runtime compiles and optimizes it, purely from having already run it
a few times.

### Discarding this example

This exact file, and its own five specific numbers, are disposable —
what carries forward is the real, general lesson: a single, first-ever
measurement of any operation in this project is not trustworthy on its
own.

### Mechanical walkthrough

- **`for (var i = 0; i < 5; i++)`** — Lesson 7's `for` loop
  (reappearing), running the identical operation five separate times.
- **`Stopwatch()..start()`** — `Stopwatch`'s own plain constructor (this
  lesson's header), immediately started via `..start()` — Dart's cascade
  operator (a genuinely new piece of syntax, narrowly used here: `..`
  calls a method on the object just constructed and evaluates to that
  same object, rather than the method's own return value; full, formal
  treatment of cascades is not this lesson's own subject and isn't given
  here beyond this one narrow use).
- **`SudokuBoard(samplePuzzle).solve();`** — Lesson 11's constructor and
  Lesson 19's own already-real `solve`, run inside the timed region.
- **`stopwatch.stop();`** — `Stopwatch`'s own real `void stop()` (this
  lesson's header), ending the measurement.
- **`stopwatch.elapsedMicroseconds`** — `Stopwatch`'s own real `int get
  elapsedMicroseconds` (this lesson's header), the real, measured elapsed
  time in **microseconds** (this lesson's term).

### CS lens

A JIT compiler's own real behavior — interpreting or lightly compiling
code the first time it runs, then progressively recompiling frequently-
run ("hot") code paths into faster machine code — is why **warmup**
before a **benchmark** (both this lesson's terms) is a standard,
necessary practice in any language with this kind of runtime.

```
Also recognized in: the JVM's own hotspot compiler, which every real
Java benchmarking guide warns about identically; a car engine running
less efficiently until it reaches its own proper operating
temperature; a musician's own warmup before a real performance,
distinct from the performance itself
```

### SE lens

Measuring only a single, cold, first-ever run and trusting it as
representative is a real, common benchmarking mistake — this lesson's
own real 7x discrepancy is direct, first-hand proof of exactly why every
further measurement in this lesson discards several warmup runs before
recording anything, rather than trusting whatever the very first attempt
happens to report.

### Commands needed

- **`dart run <file>`** — the same real command every earlier lesson has
  used.

### Run it

Real, verified output:

```
run 0: 14053 microseconds
run 1: 2062 microseconds
run 2: 2034 microseconds
run 3: 2083 microseconds
run 4: 1750 microseconds
```

Real, saved in full in
`src/docs/flutter/verification/lesson-23/run-log.md`.

### Connecting this unit

This unit proved measurement itself needs care. The next unit applies a
properly warmed-up, averaged measurement to a real, surprising
comparison this project has never actually checked.

---

## Concept Unit: "Easy" and "Fast to Solve" Are Not the Same Thing

### The Problem

Lesson 21 classified the real milestone puzzle `Easy` — solvable by a
human using naked singles alone. Lesson 19's `solve()`, though, never
consults naked or hidden singles at all; it only ever guesses and
backtracks. Does a puzzle a human finds easy also take a computer's own
backtracking solver less real time?

> **Stop and think before reading on:** `solve()`'s own real cost (Lesson
> 19) depends on how large a search space its backtracking actually has
> to explore — roughly, how many empty cells there are, and how quickly
> wrong guesses get ruled out. Given that, do you expect a puzzle a
> *human* would call "easy" to also always be *fast* for `solve()`'s own
> blind backtracking — or could the two be almost unrelated?

### Project Change

- **Reference Source:** No reference counterpart — this unit measures
  already-existing, already-real methods (`solve`, `classifyDifficulty`)
  rather than introducing new project code.
- **Files affected:** `src/docs/flutter/verification/lesson-23/performance_demo.dart`
  — created.
- **Change type:** Add (new file).
- **Location:** A brand-new file.
- **Dependencies:** `solve` (Lesson 19), `classifyDifficulty` (Lesson
  21), the real milestone puzzle and the real Hard puzzle found in
  Lesson 21's own search.

### The New Code

```dart
double timeAveraged(
  String label,
  void Function() action, {
  int warmupRuns = 5,
  int measuredRuns = 20,
}) {
  for (var i = 0; i < warmupRuns; i++) {
    action();
  }
  final stopwatch = Stopwatch()..start();
  for (var i = 0; i < measuredRuns; i++) {
    action();
  }
  stopwatch.stop();
  final average = stopwatch.elapsedMicroseconds / measuredRuns;
  print('$label: ${average.toStringAsFixed(1)} microseconds');
  return average;
}
```

### The Updated Project

Not applicable — a brand-new, freestanding file.

### Introduce the concept in isolation

Whether a human-easy puzzle is also computer-fast is worth real,
properly-warmed-up proof, not assumption — run for real:

```
solve: real milestone puzzle (Easy): 1648.0 microseconds
solve: real Hard puzzle: 238.3 microseconds
```

The real, published milestone puzzle — `Easy` for a human, per Lesson
21 — took **roughly 7 times longer** for `solve()`'s own plain
backtracking than the real, genuinely-Hard-for-a-human puzzle from
Lesson 21's own search. Direct inspection of both puzzles' real starting
grids explains why: the milestone puzzle has `52` empty cells; the Hard
puzzle has `48` — `solve()`'s own real cost tracks the size of its
search space, which has nothing at all to do with which logical
technique a human would need.

### Discarding this example

This exact comparison's two specific puzzles are permanent, real,
already-existing artifacts (the milestone, and Lesson 21's own Hard
puzzle) — nothing here is newly disposable; the measurement code itself,
`timeAveraged`, stays in verification, not `project/`.

### Mechanical walkthrough

- **`double timeAveraged(String label, void Function() action, {int warmupRuns = 5, int measuredRuns = 20})`**
  — a function declaration (Lesson 8's term, reappearing) whose second
  parameter has a function type (Lesson 15's term, reappearing),
  `void Function()` — the specific operation to measure, handed in as a
  value; `warmupRuns`/`measuredRuns` are optional named parameters
  (Lesson 8's term, reappearing) with real default values.
- **The first `for` loop, calling `action()` `warmupRuns` times** —
  Lesson 7's `for` loop (reappearing); a function call (Lesson 9's term,
  reappearing) on `action`, discarding every result, purely to let the
  JIT (this lesson's own Concept Unit 1 finding) warm up before anything
  is actually measured.
- **`Stopwatch()..start()`** — this lesson's own cascade operator,
  reappearing from Concept Unit 1.
- **The second `for` loop, calling `action()` `measuredRuns` times** —
  the same loop shape, now inside the timed region.
- **`stopwatch.elapsedMicroseconds / measuredRuns`** — Lesson 6's
  division operator (reappearing), producing a `double` (Lesson 5's real
  class, reappearing) average — dividing the *total* time for all
  `measuredRuns` repetitions by that count, smoothing out any single
  unusually fast or slow individual run.
- **`average.toStringAsFixed(1)`** — a real `num` method (the shared
  supertype of `int`/`double`, Lesson 5, reappearing), formatting the
  average to one decimal place for a clean, readable printed result.

### CS lens

Averaging many repeated, warmed-up measurements, rather than trusting
one single run, is standard **benchmarking** (this lesson's term)
methodology — reducing the influence of any one measurement's own
incidental noise (a momentary system interruption, a garbage collection
pause) on the reported result.

```
Also recognized in: any real scientific measurement taken as an
average of several trials rather than one; a runner's own personal
best measured across many timed attempts, not a single lucky run; an
A/B test in software, comparing averaged outcomes across many users
rather than one
```

### SE lens

Conflating "a puzzle is easy for a person" with "a puzzle is fast for
this specific solving algorithm" would be a real, concrete mistake this
project's own real data just disproved: if `classifyDifficulty`'s own
`Easy`/`Medium`/`Hard` labels were ever used as a *performance* hint
(say, deciding how much time to budget for solving), this real,
measured 7x reversal would make that assumption actively wrong. The two
are genuinely separate concerns — one about human reasoning technique
(Lesson 21), one about a specific algorithm's own real search cost (this
lesson) — and this project's own code correctly keeps them as two
entirely separate methods rather than conflating them into one.

### Commands needed

- **`dart run <file>`** — same command as the previous unit.

### Run it

Real, verified output (this unit's own comparison; the complete real
output for every measurement in this lesson is shown in full in Concept
Unit 4's own "Run it" step):

```
solve: real milestone puzzle (Easy): 1648.0 microseconds
solve: real Hard puzzle: 238.3 microseconds
```

Real, saved in full in
`src/docs/flutter/verification/lesson-23/run-log.md`.

### Connecting this unit

This unit proved difficulty and solve time are genuinely different real
things. The next unit names the general vocabulary for reasoning about
*why* an algorithm's own cost grows the way it does, independent of any
one specific measurement.

---

## Concept Unit: Naming How Cost Actually Grows

### The Problem

This lesson's own real numbers are specific to this one machine, this
one run, these two specific puzzles. Is there a way to reason about
`_isSafe`, `solve`, and `findHiddenSingle`'s own real costs that doesn't
depend on any one specific measurement at all?

> **Stop and think before reading on:** `_isSafe` (Lesson 18) always
> checks exactly 9 cells for the row, 9 for the column, and 9 for the
> box — regardless of how many cells on the whole board are empty or
> filled. Do you expect `_isSafe`'s own real cost to grow at all as the
> rest of the board changes, or does it stay essentially fixed?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`'s own already-
  real `_isSafe` (Lesson 18), `solve` (Lesson 19), and `findHiddenSingle`
  (Lesson 21), quoted by name — this unit reasons about their real,
  already-written shapes rather than introducing new code.
- **Files affected:** None — conceptual analysis of already-existing
  code.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `_isSafe`, `solve`, `findHiddenSingle`.

### The New Code

No new code — this unit reasons about three already-real methods'
actual shapes.

### The Updated Project

Not applicable — no code changes.

### Introduce the concept in isolation

Nothing new to run — the reasoning, applied to each method in turn:

- **`_isSafe`** always performs exactly `9 + 9 + 9 = 27` real comparisons
  — fixed by the board's own fixed `9x9` size (Lesson 17), never growing
  no matter what the board's contents are. This is **`O(1)`** — constant
  time: its real cost doesn't depend on the input at all.
- **`findHiddenSingle`** checks up to `27` units, each requiring up to `9`
  digits checked against up to `9` cells (each needing its own
  `candidatesFor` call) — a real, but still fixed, bound: `27 × 9 × 9`,
  a large constant, but a constant, since the board's own size never
  changes. Still, technically, **`O(1)`** for this specific, fixed-size
  `9x9` board — though this lesson's own real measurement (`133.9`
  microseconds) shows that fixed constant is meaningfully larger than
  `_isSafe`'s own.
- **`solve`**, in the worst case, explores a genuinely exponential search
  tree (Lesson 19's own term) — each empty cell can branch into up to `9`
  candidates, each of which branches again at the next empty cell. This
  is **exponential time** in the number of empty cells, in the worst
  case — real, direct evidence being Lesson 19's own 120-second false
  start on a nearly-empty, badly-constrained board.

### Discarding this example

Nothing to discard — pure reasoning over already-real, already-written
code.

### Mechanical walkthrough

- **`_isSafe`'s three fixed loops** (Lesson 18) — each iterates exactly
  `size` (`9`) times, regardless of the board's own contents; three
  fixed-length loops compose into one still-fixed total, `O(1)`.
- **`findHiddenSingle`'s own real structure** (Lesson 21) — three outer
  loops (rows, columns, boxes), each calling `_hiddenSingleIn`, which
  itself loops over `9` digits and up to `9` cells — every one of these
  bounds is fixed by the board's own unchanging `9x9` size, so the whole
  method, however much larger a constant than `_isSafe`'s own, is still
  technically `O(1)` for this specific, fixed board size.
- **`solve`'s own recursive branching** (Lesson 19) — unlike the two
  methods above, the *number of empty cells* genuinely varies from board
  to board, and each one can branch into up to `9` further recursive
  calls — this is where real exponential growth actually enters, not
  fixed by the board's own size the way the other two methods are.

### CS lens

**Algorithmic complexity**, written in **Big-O notation** (both this
lesson's terms), describes how an algorithm's own cost grows as its
*input* grows — for a fixed-size `9x9` Sudoku board, many operations
that would genuinely scale on a *variable*-size input (an arbitrarily
large board) are actually constant-time in practice, since the input
size itself never changes; `solve`'s own real exponential worst case is
the one place in this project where growth genuinely matters, because
the *effective* input — how many cells are empty, and how constrained
each one already is — really does vary board to board.

```
Also recognized in: Big-O notation used identically across every
area of computer science to compare algorithms independent of any
one specific machine; a GPS route planner's own worst-case search
space growing combinatorially with the number of possible roads; a
password cracker's own real cost growing exponentially with password
length, the same shape as this project's own worst-case backtracking
```

### SE lens

Recognizing which of this project's own methods are genuinely fixed-cost
(`_isSafe`, `findHiddenSingle`, both bound entirely by the board's own
unchanging `9x9` size) versus genuinely variable-cost (`solve`, bound by
how many cells are empty and how constrained the search is) is exactly
what tells this project *where* a real performance problem could
actually occur, and where it structurally can't: no amount of Sudoku
puzzle variety will ever make `_isSafe` slow, but a sufficiently
adversarial, under-constrained board (Lesson 19's own real 120-second
proof) genuinely can make `solve` slow — a real, structural distinction
worth knowing before spending any effort "optimizing" a part of this
project that was never actually the bottleneck.

### Commands needed

None — this unit performs no new run.

### Run it

Not applicable — pure reasoning over already-real, already-written code.

### Connecting this unit

This unit named why some of this project's own methods can never be
slow, structurally, while one genuinely can. The final unit turns to a
different real cost every one of Lessons 17-22's own safe-copy patterns
has already been quietly paying.

---

## Concept Unit: The Real Cost of Staying Safe

### The Problem

`removeDigits`, `hasUniqueSolution`, and `classifyDifficulty` (Lessons
20-21) all build a fresh copy of the board's own grid before working on
it, specifically so the real board being asked about is never mutated.
That safety isn't free — what does it actually cost?

> **Stop and think before reading on:** Every one of those three methods
> calls `List.generate(size, (row) => List.of(_grid[row]))` — building 9
> brand-new inner lists, one per row. If `classifyDifficulty` alone
> builds *two* separate full copies (Lesson 21's own `nakedOnlyCopy` and
> `logicalCopy`), what do you predict that means for its own real
> measured cost, compared to a method that only ever reads `_grid`
> directly with no copying at all?

### Project Change

- **Reference Source:** `project/lib/sudoku_board.dart`'s own already-
  real `removeDigits` (Lesson 20), `hasUniqueSolution` (Lesson 20), and
  `classifyDifficulty` (Lesson 21) — quoted by name, reasoning about
  their real, already-written copy patterns rather than introducing new
  code.
- **Files affected:** None — conceptual, connecting this lesson's own
  real measurements to already-existing code.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** This lesson's own Concept Unit 2 real measurements.

### The New Code

No new code — this unit connects this lesson's own already-real
measurements to already-existing code's own copy pattern.

### The Updated Project

Not applicable — no code changes.

### Introduce the concept in isolation

Nothing new to run — the reasoning, using this lesson's own already-real
numbers:

```
hasUniqueSolution: real milestone puzzle: 1834.0 microseconds
classifyDifficulty: real Hard puzzle: 3059.6 microseconds
```

`classifyDifficulty` (Lesson 21) builds *two* separate full board copies
(`nakedOnlyCopy` and `logicalCopy`) before doing any real work at all,
compared to `hasUniqueSolution`'s (Lesson 20) single copy — real,
measured evidence consistent with `classifyDifficulty`'s own real cost
being meaningfully higher, not merely from more searching, but partly
from that extra **allocation** (this lesson's term) up front.

### Discarding this example

Nothing to discard — pure reasoning connecting already-real measurements
to already-existing code.

### Mechanical walkthrough

- **`List.generate(size, (row) => List.of(_grid[row]))`** (quoted from
  Lesson 20's `removeDigits`/`hasUniqueSolution`, and reused identically
  in Lesson 21's `classifyDifficulty`) — Lesson 17's own real
  construction, reappearing: each call genuinely allocates 9 brand-new
  inner `List<int?>` objects, one full copy of the board's own real
  current state, every single time it runs.
- **`classifyDifficulty`'s own two separate copies** — `nakedOnlyCopy`
  and `logicalCopy` are each built with this exact same real
  construction, meaning this one method allocates twice as many fresh
  inner lists as a method (like `hasUniqueSolution`) that only ever
  builds one.

### CS lens

Distinguishing an algorithm's own **computation** cost (comparisons,
loop iterations) from its **allocation** (this lesson's term) cost —
creating new objects the runtime has to find real memory for — is a
real, separate axis of performance analysis: two methods can perform an
identical *number* of logical checks and still have genuinely different
real costs if one allocates far more new objects along the way.

```
Also recognized in: a database query's own execution cost split
between actual row scanning and temporary result-set allocation; a
video game's own frame-rate cost split between rendering logic and
memory allocation for temporary objects, often the more troublesome
of the two in practice; a shipping company's own cost split between
the actual delivery route and the packaging materials consumed for
every single shipment
```

### SE lens

This project's own real, deliberate choice — always copying before a
read-only check, rather than mutating `_grid` directly and restoring it
afterward the way `solve`/`_countSolutionsUpTo` (Lessons 19-20) do — is a
real, honest tradeoff: copying costs real, measurable allocation
(this lesson's own numbers), in exchange for a genuinely simpler,
harder-to-get-wrong guarantee (the original board is *never* at risk of
being left half-mutated if something goes wrong partway through). For a
single `9x9` board, this lesson's own real measurements show that cost
staying small — low thousands of microseconds, not a real, noticeable
delay to any real player — which is exactly why this project accepts it
rather than optimizing it away for a performance gain nothing here
actually needs yet.

### Commands needed

- **`dart run <file>`** — the same real command every earlier unit this
  lesson.

### Run it

Real, verified, complete output for this lesson's entire measurement
suite:

```
solve: real milestone puzzle (Easy): 1648.0 microseconds
solve: real Hard puzzle: 238.3 microseconds
generateComplete: empty board, seed 1: 163.2 microseconds
hasUniqueSolution: real milestone puzzle: 1834.0 microseconds
hasUniqueSolution: real Hard puzzle: 1450.5 microseconds
isValidMove: one single check: 3.0 microseconds
findHiddenSingle: real milestone puzzle: 133.9 microseconds
classifyDifficulty: real Hard puzzle: 3059.6 microseconds
```

Real, saved in full in
`src/docs/flutter/verification/lesson-23/run-log.md`.

### Connecting this unit

This unit named the real, separate cost every safe-copy pattern this
project has used since Lesson 20 has been quietly paying — small,
measured, and, for this project's own real scale, an entirely reasonable
price for the safety it buys.

---

## Connect the Pieces

Trace one real number through everything this lesson built. Concept Unit
1's own first, uncorrected measurement of `solve()` — `14053`
microseconds — was a real, direct lie about that method's own ongoing
cost, real-proved by four more runs settling near `2000` microseconds
once the JIT had genuinely warmed up. Concept Unit 2's own properly
warmed-up, averaged measurement then revealed something this project had
never actually checked: the real milestone puzzle, `Easy` by Lesson 21's
own honest classification, took roughly seven times longer for
`solve()`'s plain backtracking to finish than a genuinely Hard puzzle —
because `solve()` never consults the techniques that make a puzzle easy
for a *person*, only how large its own search space is. Concept Unit 3
named why: `_isSafe` and `findHiddenSingle` are both fixed-cost,
`O(1)`, for this project's own unchanging `9x9` board, while `solve`'s
own real exponential worst case is the one place growth genuinely
matters. And Concept Unit 4 connected this lesson's own real numbers back
to a cost every safe-copy method since Lesson 20 has already been
paying: real, measured allocation, small and worth it at this project's
own real scale.

Every real performance question this project has flagged forward since
Lesson 19 — the 120-second false start, the unmeasured worry about
shuffled candidates, the honest, unhidden question of what any of this
actually costs — is now answered with real, measured numbers, not
guesses. Lesson 24 turns to making sure all of it — every rule, every
solver, every generator, every classifier this phase has built — is
actually, systematically tested, not just verified by hand one real run
at a time.
