# Lesson 36: Giving the Session Its Own Real Owner

**What you will build:** `project/lib/game_session.dart` — a genuine,
new, permanent domain class, `GameSession`, this project's first real
object modeling a concept from the *problem* (a played game) rather than
the UI or the Sudoku rules themselves. It wraps an existing real
`SudokuBoard` (Phase 2, unmodified) and adds exactly what Lesson 35
proved was missing: a real, honestly-classified `difficulty`, a real
`startTime`/`elapsed`, two real, genuinely encapsulated counters
(`mistakes`, `hints`), and a real, live `isComplete`. Built and tested as
its own standalone unit — not yet wired into `main.dart`; that wiring is
Lessons 37-40's own job, the same way `SudokuBoard` itself was built and
fully tested for eight lessons (17-24) before Phase 3 ever touched it
from the UI.

**What you need to know first:**
- Lesson 1 — `dart run`, the established invocation this lesson's own
  throwaway lab reuses.
- Lesson 5 — `final`, nullable types (`?`).
- Lesson 6 — truncating integer division (`~/`), reused inside
  `Duration.inSeconds`'s own real, quoted body.
- Lesson 8 — named parameters, arrow-function bodies (`=>`).
- Lesson 9 — `.length`-style getters, reused here for `_cells`-style
  reasoning about `elapsed`/`isComplete`.
- Lesson 10 — the `??` null-coalescing operator, and nullable types
  (`DateTime? startTime`).
- Lesson 11 — encapsulation — a private field, mutated only through its
  own class's own methods — this lesson's own real, corrected example of
  it, after an honest first draft got it wrong (see Concept Unit 3).
- Lesson 12 — constructor initializer lists (`: field = value, ...`),
  reappearing from `SudokuBoard`'s own real constructor.
- Lesson 14 — `InvalidMoveException`, the real error `registerMistake`
  (Concept Unit 3) exists to respond to, even though this lesson does not
  yet wire that response into `main.dart`.
- Lesson 16 — `Duration`, reappearing from `Timer.periodic`.
- Lesson 19 — `SudokuBoard.solve`, reused to prove Concept Units 1 and 4
  for real.
- Lesson 20 — the increment operator (`++`), `static const`.
- Lesson 21 — `SudokuBoard.classifyDifficulty`, and the real, genuine
  `Hard` puzzle Lesson 21 itself found and captured — reused verbatim
  this lesson.
- Lesson 24 — the real, permanent `project/test/` convention, and the
  small, hand-rolled `expectTrue`/`expectEqual` test harness
  `sudoku_board_test.dart` already established, reused again here rather
  than introducing a real testing framework early.
- Lesson 28 — `_SessionStatusState`'s own real `Timer`-driven counter,
  contrasted directly with this lesson's own live `elapsed` getter.
- Lesson 35 — local/shared/application/derived/persistent state, and the
  real, honest, run-proved gap (a "Start New Game" button that never
  touches the real board) this lesson's own new class exists to close.

**Terms used in this lesson:**
- **Domain object** — new: a real class modeling a concept from the
  actual problem this app solves (a played game session), rather than a
  UI widget or a database row. It exists as a named category because
  `project/lib/` has, until now, held only two other real kinds of
  things — a rules engine (`SudokuBoard`) and Flutter widgets
  (`main.dart`, `sudoku_board_view.dart`, `number_pad_view.dart`) —
  `GameSession` is a genuinely new third kind, and Phase 5 (Lesson 41
  onward) is where this curriculum gives that distinction its own full,
  formal architectural treatment.
- **Value snapshot** — new: a value computed once, at one specific real
  moment, and deliberately never recomputed after that, even though its
  own inputs keep changing. It exists because some real values only mean
  something at the moment they were captured — re-measuring them later
  would not correct a stale answer, it would produce a different, wrong
  question's answer instead. `GameSession.difficulty` (Concept Unit 1) is
  this lesson's own real, concrete example.
- **`external`** — new: a real Dart keyword marking a function or method
  whose actual body lives outside the Dart file declaring it — typically
  implemented directly in the Dart VM or the underlying platform, in a
  language other than Dart. It exists because some real operations
  (reading the actual system clock) cannot be written in Dart alone;
  `external` is Dart's own honest way of saying "the real implementation
  is real, it just isn't here."
- **Redirecting constructor** — new: a real, named constructor whose
  entire body is `: this.otherConstructor(args);` — it does no
  initialization of its own at all, only forwards to a different real
  constructor of the same class. It exists to let a class offer more
  than one convenient real way to construct it (`DateTime.now()`,
  `DateTime(year, month, ...)`) while keeping the actual construction
  logic written in exactly one place.

**Objects and methods used:**

- **`GameSession`**
  - *What it is:* this lesson's own real subject — a new, permanent
    domain class owning everything one played game needs to remember
    about itself beyond the board's own rules.
  - *Implementation:* real, complete, from `project/lib/game_session.dart`
    (shown in full across this lesson's own four Concept Units).
  - *Its use:* the real, single, motivating answer to Lesson 35's own
    proved gap — a real place `mistakes`, `hints`, `startTime`, and a
    faithfully-classified `difficulty` can all actually live together.
  - *Type:* a concrete class, no supertype.
  - *Responsibility:* to hold one played game's own real identity — which
    board, how hard it honestly is, when it started, how many mistakes
    and hints it has used, and whether it's finished — as one single,
    coherent real object, rather than scattered fields on unrelated
    widgets.
  - *Depends on:* a real, already-constructed `SudokuBoard`; nothing
    else required.
  - *Connects to:* wraps a real `SudokuBoard`; not yet constructed or
    read anywhere in `main.dart` — Lessons 37-40 are where this
    connection gets built.
  - *Shape:* `project/lib/`'s own first real domain object, sitting
    conceptually apart from both the engine and the UI, though nothing
    in this project's own folder structure enforces that separation
    yet (Lesson 47: feature-oriented project structure, is where that
    eventually gets real, physical enforcement).

- **`DateTime`/`DateTime.now()`**
  - *What it is:* a real, standard Dart class representing one specific
    real point in calendar time; `.now()` is a real, named constructor
    reading the actual, current system clock.
  - *Implementation:* real, verbatim, from
    `C:\flutter\bin\cache\dart-sdk\lib\core\date_time.dart`, line 136:
    `class DateTime implements Comparable<DateTime>` — a real, concrete
    class implementing the real, generic `Comparable<DateTime>`
    interface (Lesson 12's own interface concept, reappearing); line
    239: `DateTime.now() : this._now();` — a real **redirecting
    constructor** (this lesson's own new Header term), forwarding
    entirely to a separate, private `_now()` constructor this project
    never calls directly.
  - *Its use:* `GameSession`'s own real `startTime` field defaults to
    `DateTime.now()` — the real, actual moment a session was
    constructed, unless a caller explicitly supplies a different one
    (this lesson's own real testing seam, used directly in
    `game_session_test.dart`).
  - *Type:* a concrete class from `dart:core`.
  - *Responsibility:* represent one real, specific moment precisely
    enough to compute real, meaningful differences between two of them.
  - *Depends on:* the real, actual system clock, for `.now()`
    specifically; explicit `year`/`month`/`day`/etc. arguments for its
    other real constructors (not used by this lesson).
  - *Connects to:* `GameSession`'s constructor reads it once, via
    `DateTime.now()`, and stores the real result in `startTime`;
    `elapsed` (below) reads it again, fresh, on every access.
  - *Shape:* real, standard `dart:core` API — available without any
    import, the same as `String`/`int`/`List` since Lesson 5.

- **`DateTime.difference`**
  - *What it is:* a real instance method computing the real span of time
    between the `DateTime` it's called on and another one passed in.
  - *Implementation:* real, verbatim, from `date_time.dart`, line 762:
    `external Duration difference(DateTime other);` — this lesson's own
    new **`external`** Header term, quoted directly: there is no real
    Dart method body to show here at all, because the actual
    implementation is not written in Dart — it lives in the Dart VM
    itself, computing the real difference from each `DateTime`'s own
    internal microsecond-precision timestamp.
  - *Its use:* `GameSession.elapsed` calls it every single time it's
    read: `DateTime.now().difference(startTime)`.
  - *Type:* a real instance method, marked `external`, returning a real
    `Duration`.
  - *Responsibility:* compute one real, exact time span between two real
    moments — never an approximation.
  - *Depends on:* a real `DateTime` to call it on, and a real `DateTime`
    argument to compare against.
  - *Connects to:* called by `GameSession.elapsed`; returns a real
    `Duration`, immediately read via `.inSeconds` in this lesson's own
    test.
  - *Shape:* real, standard `dart:core` API.

- **`Duration`/`Duration.inSeconds`**
  - *What it is:* `Duration` itself reappears in full from Lesson 16/28
    (`Timer.periodic(const Duration(seconds: 1), ...)`) — a real,
    immutable class representing a real span of time, stored internally
    as a single real microsecond count. `.inSeconds` is a real getter
    this lesson uses for the first time.
  - *Implementation:* real, verbatim, from
    `C:\flutter\bin\cache\dart-sdk\lib\core\duration.dart`, line 336:
    `int get inSeconds => inMicroseconds ~/ Duration.microsecondsPerSecond;`
    — a real getter (reappearing `get` from Lesson 9), computed via
    real integer division (`~/`, reappearing from Lesson 6) against a
    real, named constant, `Duration.microsecondsPerSecond`.
  - *Its use:* `game_session_test.dart` calls `session.elapsed.inSeconds`
    to check, as a whole number, that at least 5 real seconds have
    elapsed — without needing to compare exact microsecond counts.
  - *Type:* `Duration` is a concrete, immutable class; `inSeconds` is a
    real instance getter on it.
  - *Responsibility:* `Duration` — hold one real, exact time span.
    `inSeconds` — report that span's own whole-second count, real
    fractional seconds truncated away (Lesson 6's own real, already-
    proved truncating-division behavior, reapplied here).
  - *Depends on:* `Duration` depends on nothing to construct (a real
    microsecond count, computed from whichever named constructor
    argument is given); `.inSeconds` depends only on the `Duration`
    instance it's read from.
  - *Connects to:* `DateTime.difference` returns a real `Duration`;
    `GameSession.elapsed`'s own declared return type is `Duration`;
    `.inSeconds`, read in the test, converts it to a plain `int`.
  - *Shape:* real, standard `dart:core` API.

- **`SudokuBoard.classifyDifficulty`/`isComplete`/`solve`**
  - *What it is:* three real, already fully-tested Phase 2 methods,
    reappearing in full — `classifyDifficulty` (Lesson 21) judges a
    puzzle honestly by which real solving technique it actually needs;
    `isComplete` (Lesson 11) reports whether every real cell holds a
    digit; `solve` (Lesson 19) runs the real backtracking solver in
    place.
  - *Implementation:* real, verbatim, from `project/lib/sudoku_board.dart`
    (already quoted in full in Lessons 19/21): `String
    classifyDifficulty()`, `bool get isComplete`, `bool solve({Random?
    random})`.
  - *Its use:* `GameSession`'s own constructor calls `classifyDifficulty`
    exactly once; `isComplete` is read fresh by `GameSession.isComplete`
    on every access; `solve` is called directly by this lesson's own
    real test, to prove Concept Units 1 and 4 for real.
  - *Type:* real instance methods/getters on `SudokuBoard`.
  - *Responsibility:* unchanged from Phase 2 — see Lessons 11/19/21 for
    each one's own complete, original charter.
  - *Depends on:* `classifyDifficulty`/`isComplete` depend on nothing
    beyond the board's own current state; `solve` optionally accepts a
    `Random` (not used this lesson — this lesson always solves
    deterministically, ascending order).
  - *Connects to:* `GameSession.difficulty` calls `classifyDifficulty`
    once, at construction; `GameSession.isComplete` calls `isComplete`
    on every read; this lesson's own test calls `solve` directly on
    `session.board`, proving `GameSession` never needs its own separate
    "is it solved" bookkeeping.
  - *Shape:* Phase 2's own real, already-tested, unmodified public API.

---

## Concept Unit: A Real Class Wrapping the Board — `difficulty` as a Snapshot

### The Problem

Lesson 35 proved this app has no single real place holding "which puzzle
is this, and how hard is it, honestly." `SudokuBoard.classifyDifficulty`
already answers that second question — but calling it fresh every time
would mean re-classifying an increasingly-filled-in board, which no
longer describes the same real thing the player actually started with.
What's the smallest real class that fixes this?

> **Pause and think:** Given `SudokuBoard.classifyDifficulty` walks the
> board's *own current* state (Lesson 21), what would happen, concretely,
> if you called it once when a puzzle starts, and once again after the
> player has filled in several real digits — would you expect the same
> real answer both times, or could filling in correct digits change what
> technique the *remaining* cells need? Given Lesson 35's own new term,
> derived state, computed fresh on every read — is "puzzle difficulty"
> actually a good candidate for that, or does it need to be captured and
> kept, the way `final` (Lesson 5) already keeps a value fixed after its
> first assignment?

### Project Change

**Reference Source:** no reference counterpart — `GameSession` is a
from-scratch addition; curriculum's own Lesson 36 bullet ("Create:
`GameSession` containing: Puzzle, Current board, Difficulty, ...") names
the shape but no existing file to port from. **Files affected:**
`project/lib/game_session.dart`, created. **Change type:** add.
**Location:** new file. **Dependencies:** `project/lib/sudoku_board.dart`
(`import 'sudoku_board.dart';`).

### The New Code

```dart
class GameSession {
  GameSession(this.board, {DateTime? startTime})
      : difficulty = board.classifyDifficulty(),
        startTime = startTime ?? DateTime.now();

  final SudokuBoard board;
  final String difficulty;
  final DateTime startTime;
}
```

### The Updated Project

This *is* the whole new structure, with nothing surrounding it yet — a
brand-new file's own first real class. Per this schema's own skip
condition for exactly this case, no separate "already-existing enclosing
structure" exists to return to.

### Isolate and Discard

Not applicable this unit — every individual piece here (constructor
initializer lists, `final` fields, nullable named parameters, `??`) is
already fully taught; what's actually new is a modeling *decision*
(capture once vs. recompute), not a new language construct, so the
Concept Isolation Rule's own "new language construct" trigger does not
apply. That decision is proved directly, for real, in this unit's own
"Run It" step below, using the real, permanent project test rather than
a separate throwaway lab.

### Mechanical Walkthrough

- `class GameSession {` — declares this lesson's own new, real,
  standalone class — no `extends`/`implements` (Lesson 12, reappearing):
  a plain, concrete class, the same shape `SudokuBoard` itself has.
- `GameSession(this.board, {DateTime? startTime})` — a real constructor;
  `this.board` is the real constructor-shorthand syntax (Lesson 11,
  reappearing) assigning the first positional argument straight to the
  real `board` field; `{DateTime? startTime}` is a real, optional named
  parameter (Lesson 8's own named-parameter syntax, reappearing) whose
  type is nullable (`?`, Lesson 5, reappearing) — because this parameter
  has no `required` (Lesson 8) and no explicit `= default` value, Dart
  gives it the real, implicit default `null` when the caller omits it.
- `: difficulty = board.classifyDifficulty(), startTime = startTime ?? DateTime.now();`
  — a real constructor initializer list (Lesson 12's own colon syntax,
  reappearing from `SudokuBoard`'s own constructor); `board
  .classifyDifficulty()` is a real instance-method call on the
  just-assigned `board` field, run exactly once, here, before this
  constructor finishes — this is the real, concrete mechanism behind
  this lesson's own new **value snapshot** term: the real string this
  call returns (`'Easy'`, `'Medium'`, or `'Hard'`) is captured into
  `difficulty` and never recomputed again. `startTime ?? DateTime.now()`
  — the real `??` operator (Lesson 10, reappearing): evaluates to the
  real `startTime` parameter when the caller supplied one, or a fresh,
  real `DateTime.now()` (this lesson's own new Header entry) when they
  didn't — this real fallback is what lets `game_session_test.dart`
  supply a deliberately fake, past `startTime` for deterministic
  testing, without needing a real, formal dependency-injection mechanism
  yet (Lesson 39 is where this exact seam gets a real, proper name).
- `final SudokuBoard board;` / `final String difficulty;` / `final
  DateTime startTime;` — three real, `final` fields (Lesson 5,
  reappearing): each can be set exactly once, by the constructor above,
  and never reassigned afterward — the real, concrete enforcement behind
  `difficulty` genuinely being a snapshot: even code inside this same
  class has no way to write to `difficulty` a second time.

### CS Lens

`difficulty`, computed once and then frozen, is a real, working instance
of a **value snapshot** (this lesson's own new term) — deliberately
*not* using the same "recompute fresh every read" strategy Lesson 35's
own derived state used, because the two situations are genuinely
different: `_cells` (Lesson 35) should always reflect `_board`'s *current*
truth; `difficulty` should reflect the puzzle's *original* truth, which
a live recomputation would actively corrupt rather than refresh.

```
Also recognized in: a home appraisal's own recorded value, fixed at the
date of appraisal rather than recalculated as the market moves; a
photograph, capturing one real moment rather than continuously updating
to show whatever the scene looks like now; a database's own audit-log
row, recording what a value *was* at the time of a change, deliberately
never updated to match the row's current value
```

### SE Lens

The alternative — making `difficulty` a getter that calls
`board.classifyDifficulty()` fresh every time, the same real strategy
Lesson 35 used for `_cells` — was rejected because it would silently
change *meaning*, not just *value*: `classifyDifficulty` on a
mostly-solved board answers "how hard is finishing what's left," a
completely different real question than "how hard was this puzzle when
the player started it." The real cost of the snapshot approach instead:
`GameSession` now holds one more piece of state that could, in
principle, disagree with a fresh recomputation — but that disagreement
is exactly the *intended*, correct behavior here, not a bug, which this
unit's own real test (below) proves directly rather than merely
asserting.

### Commands Needed

None — no new commands this unit.

### Run It

Real, run this session, via `dart run test/game_session_test.dart`
(shown in full for this lesson's own last unit; the first two real
checks belong to this unit specifically):

```
PASS: a real Hard puzzle is classified Hard at construction
PASS: the board really is fully solved now
PASS: classifying the same board fresh, now complete, gives a different, meaningless answer
PASS: but the session's own stored difficulty never changed — a real snapshot, not derived state
```

Concretely: `GameSession(SudokuBoard(_hardPuzzle))` captured `'Hard'` at
construction. After `session.board.solve()` filled every real cell,
calling `session.board.classifyDifficulty()` fresh, directly, returned
`'Easy'` — a real, different, genuinely wrong answer to the original
question, since a complete board trivially satisfies the "solvable by
naked singles alone" check with zero real singles left to find.
`session.difficulty` itself, read again after all of this, was still
`'Hard'` — proving, not just claiming, that it never recomputed.

### Connect

`GameSession` now has a real board and a real, correctly-frozen
difficulty. The next unit gives it a real sense of time.

---

## Concept Unit: Real Time — `startTime` and Live `elapsed`

### The Problem

A played game needs to know how long it's been running. `SudokuBoard`
has no concept of time at all — it's a pure rules engine. Where should
"how long has this session run" actually live, and should it be stored
or computed?

> **Pause and think:** Given Lesson 35's own new **derived state** term
> (a value computed fresh from other state, never stored) — is "elapsed
> time" more like `difficulty` (frozen once) or more like `_cells`
> (recomputed every read)? What real, concrete problem would storing
> "elapsed seconds" as a plain, manually-incremented field (the way
> `_SessionStatusState._elapsedSeconds`, Lesson 28, already does) run
> into if nothing were actively ticking it forward on a timer?

### Project Change

**Reference Source:** no reference counterpart — a from-scratch
addition. **Files affected:** `project/lib/game_session.dart`, modified.
**Change type:** add. **Location:** inside the `GameSession` class body,
after the fields Concept Unit 1 added. **Dependencies:** none new — this
unit reads `DateTime`/`Duration`, both part of `dart:core`, already
available with no additional import.

### The New Code

```dart
Duration get elapsed => DateTime.now().difference(startTime);
```

### The Updated Project

The complete, real `GameSession` class so far, this unit's own new line
marked, numbered:

```dart
1   class GameSession {
2     GameSession(this.board, {DateTime? startTime})
3         : difficulty = board.classifyDifficulty(),
4           startTime = startTime ?? DateTime.now();
5
6     final SudokuBoard board;
7     final String difficulty;
8     final DateTime startTime;
9
10    Duration get elapsed => DateTime.now().difference(startTime);  // ← new
11  }
```

`GameSession` now answers two real questions about itself: which puzzle
and how hard (lines 1-8, Concept Unit 1), and, as of line 10, how long
it's actually been running — read live, on demand, never stored.

### Isolate and Discard

Real, throwaway lab, `verification/lesson-36/datetime_probe.dart`, run
this session, then discarded — `DateTime`/`Duration.difference` are
genuinely new library APIs to this curriculum, so the Concept Isolation
Rule's "familiar-sounding is a trap" clause applies even though a
"span of time" is not, itself, a hard idea:

```dart
void main() {
  final now = DateTime.now();
  print('now: $now');

  final fiveSecondsAgo = now.subtract(const Duration(seconds: 5));
  print('fiveSecondsAgo: $fiveSecondsAgo');

  final gap = now.difference(fiveSecondsAgo);
  print('gap: $gap');
  print('gap.inSeconds: ${gap.inSeconds}');
}
```

This is exactly what `GameSession.elapsed` above does, isolated: capture
one real moment (`now`), a second real moment computed relative to it
(`fiveSecondsAgo`, standing in for what a real `startTime` would be),
and the real, computed span between them (`gap`). Discarded after this
session's real run; not part of `project/` at all.

Real, captured output:

```
now: 2026-08-23 20:11:30.505194
fiveSecondsAgo: 2026-08-23 20:11:25.505194
gap: 0:00:05.000000
gap.inSeconds: 5
```

The exact real timestamp is this session's own arbitrary, real moment;
the load-bearing real fact is the exact `5`-second gap, confirming
`.difference()` computes a real, precise span rather than an
approximation.

### Mechanical Walkthrough

- `Duration get elapsed =>` — `get`, reappearing in full from Lesson 9:
  a real getter, not a plain field — nothing here is ever stored; every
  real read runs the expression on the right fresh.
- `DateTime.now()` — this lesson's own new Header entry: reads the real,
  current system clock at the exact real moment this getter is
  evaluated — not the moment `GameSession` itself was constructed.
- `.difference(startTime)` — this lesson's own new Header entry
  (`external`, no Dart body to show): computes the real, exact span
  between this fresh `DateTime.now()` and the real, frozen `startTime`
  captured back in Concept Unit 1 — the longer real time passes between
  a session's construction and a given read of `elapsed`, the larger the
  real `Duration` this returns, with no manual incrementing anywhere,
  unlike `_SessionStatusState._elapsedSeconds`'s own `Timer`-driven
  `++` (Lesson 28/35).

### CS Lens

`elapsed` is a real, second, deliberate instance of Lesson 35's own
**derived state** — contrasted directly against Concept Unit 1's real
**value snapshot** — proving both real strategies now exist,
side-by-side, inside the very same class, each chosen for the real
reason its own value actually needs.

```
Also recognized in: a car's own real, live "time since last oil change"
readout (recomputed from the stored change date every time the dash
displays it) versus the odometer reading recorded *at* that last oil
change (frozen, never updated after the fact) — the identical real
snapshot-vs-derived contrast, one dashboard, two adjacent numbers
```

### SE Lens

The alternative — a plain, stored `int elapsedSeconds` field, manually
incremented by some real, external `Timer` the way
`_SessionStatusState` already does — was rejected here because
`GameSession` itself has no natural place to run a `Timer` (it's a pure
domain object, Lesson 41's own eventual formal distinction, with no
concept of "currently displayed on screen" at all); computing `elapsed`
live from two real `DateTime`s needs no ticking mechanism running in the
background at all, and stays correct even if nothing has read it in
several real minutes. The real cost: reading `elapsed` twice in a row,
microseconds apart, can report two subtly different real values — a
real, honest consequence of *not* freezing it, the exact inverse of
Concept Unit 1's own real trade-off.

### Commands Needed

- `dart run datetime_probe.dart` — the same established `dart run`
  invocation (Lesson 1), pointed at this lesson's own throwaway lab.

### Run It

Real, captured output — shown above in Isolate and Discard. The real
project-level proof (via `game_session_test.dart`) is shown in this
lesson's own final unit.

### Connect

`GameSession` can now honestly answer "how hard" (frozen) and "how long"
(live). The next unit gives it a real, honestly-encapsulated memory of
what's gone wrong so far.

---

## Concept Unit: Two Real, Encapsulated Counters — `mistakes` and `hints`

### The Problem

Lesson 35's own real, run-proved gap was a counter (`_gamesStarted`)
that meant one thing but didn't do it. `GameSession` needs two new real
counters — mistakes and hints — and this is the first real chance to
get their own design right rather than repeating that exact mistake.

> **Pause and think:** Given Lesson 11's own real, already-proved
> distinction between a public field anyone can overwrite directly and a
> private field only reachable through this class's own methods — if
> `mistakes` were declared as a plain, public, mutable `int mistakes =
> 0;` field, what real, concrete line of code, written anywhere else in
> this project, could set it to `9999` in one step, with no real event
> ever having caused nine thousand mistakes? What would you actually
> need to change about how the field is declared to make that
> impossible?

### Project Change

**Reference Source:** no reference counterpart — a from-scratch
addition. **Files affected:** `project/lib/game_session.dart`, modified.
**Change type:** add. **Location:** inside the `GameSession` class body,
after `elapsed`. **Dependencies:** none new.

### The New Code

```dart
int _mistakes = 0;
int _hints = 0;

int get mistakes => _mistakes;
int get hints => _hints;

void registerMistake() {
  _mistakes++;
}

void useHint() {
  _hints++;
}
```

An honest note on how this unit's own first real draft actually went:
the very first version of this file declared `int mistakes = 0;` and
`int hints = 0;` as plain, public fields — directly mutable from
anywhere — while a doc comment merely *claimed* they stayed
"private-in-spirit." Re-reading that draft against this lesson's own
Concept Unit found the real contradiction directly: nothing in the code
actually enforced the comment's own claim. The fix, shown above: genuinely
private `_mistakes`/`_hints` fields, with real, public, read-only getters
for reading and exactly one real method each for changing them.

### The Updated Project

The complete, real `GameSession` class, this unit's own new lines
marked, numbered:

```dart
1   class GameSession {
2     GameSession(this.board, {DateTime? startTime})
3         : difficulty = board.classifyDifficulty(),
4           startTime = startTime ?? DateTime.now();
5
6     final SudokuBoard board;
7     final String difficulty;
8     final DateTime startTime;
9
10    int _mistakes = 0;             // ← new
11    int _hints = 0;                // ← new
12
13    int get mistakes => _mistakes;  // ← new
14    int get hints => _hints;        // ← new
15
16    Duration get elapsed => DateTime.now().difference(startTime);
17
18    void registerMistake() {        // ← new
19      _mistakes++;                   // ← new
20    }                                 // ← new
21
22    void useHint() {                 // ← new
23      _hints++;                       // ← new
24    }                                 // ← new
25  }
```

Reading a mistake or hint count from outside this class (lines 13-14) is
now genuinely safe to expose publicly, because there is no real way to
reach lines 10-11 directly from outside — only lines 18-24 can ever
change them, and each only ever moves the real count up by exactly one.

### Isolate and Discard

Not applicable — no new language construct here; private fields with
public getters and dedicated mutator methods are the exact same real
pattern Lesson 11 already fully taught and lab'd, applied to a second,
new field. Per the Stopping Rule, re-isolating an already-lab'd exact
construct a second time inside the same lesson, with nothing new about
it, would be over-decomposition rather than genuine teaching.

### Mechanical Walkthrough

- `int _mistakes = 0;` / `int _hints = 0;` — two real, private
  (leading-underscore, Lesson 11, reappearing) `int` fields, each
  initialized to a real literal `0`.
- `int get mistakes => _mistakes;` / `int get hints => _hints;` — two
  real, public getters (Lesson 9, reappearing), each exposing read-only
  access to its own private field — a caller can read `session.mistakes`
  freely, but `session.mistakes = 5` is a real compile error, because a
  getter with no matching setter cannot be assigned to.
- `void registerMistake() { _mistakes++; }` — a real, public method; the
  real increment operator `++` (Lesson 20, reappearing) is the only real
  place `_mistakes` ever changes anywhere in this codebase.
- `void useHint() { _hints++; }` — the identical real shape, for
  `_hints`.

### CS Lens

Exposing a value for reading through a getter while permitting writes
only through a narrow, named method is a real, textbook instance of
**encapsulation** (Lesson 11's own hard concept, reappearing in full) —
this unit's own honestly-reported false start is itself real, direct
proof of why the CS Lens keeps calling this a *hard* concept rather than
routine syntax: getting the *words* right (a doc comment claiming
privacy) is not the same real thing as getting the *code* right.

```
Also recognized in: a bank's own real ledger, showing a customer their
current balance freely while permitting changes only through real,
audited transactions; a thermostat's own display, showing the current
temperature to anyone while only its own internal control logic can
actually change the target setting; a version-control system's own
read-access-for-everyone, write-access-only-through-a-commit model
```

### SE Lens

The alternative — the original, honestly-kept first draft (plain public
`mistakes`/`hints` fields) — was rejected the moment this unit's own
Concept Unit review compared the code against its own doc comment and
found they disagreed. The real cost of leaving it as it was: nothing in
the *type system* would have ever caught a stray `session.mistakes =
-1;` written by mistake somewhere else in this growing codebase; the
real cost of the fix instead is two extra lines (a private field plus a
getter) per counter — a small, real, permanent price for a real
guarantee the original version only pretended to have.

### Commands Needed

None — no new commands this unit.

### Run It

Real, run this session, via `dart run test/game_session_test.dart` (full
output shown in this lesson's final unit); the three real checks
belonging to this unit:

```
PASS: a fresh session starts with zero real mistakes
PASS: a fresh session starts with zero real hints used
PASS: two real calls to registerMistake left mistakes at 2
PASS: one real call to useHint left hints at 1
```

### Connect

`GameSession` now genuinely protects its own two counters the way its
doc comments always claimed to. The final unit gives it one more real,
live value — whether the game is actually finished.

---

## Concept Unit: `isComplete` — Real, Live Delegation

### The Problem

`SudokuBoard` already has a real, working `isComplete` getter (Lesson
11). Does `GameSession` need its own separate "is this game done"
tracking, or can it simply ask the board it already holds?

> **Pause and think:** Given Concept Unit 1's own real, deliberate
> choice to freeze `difficulty` rather than recompute it — is
> "is the game complete" more like `difficulty` (a fact about how the
> puzzle started) or more like `elapsed` (a fact that's only true right
> now, changing as play continues)? If `GameSession` stored its own
> separate `bool _isComplete = false;`, what real, concrete step would
> have to remember to update it, and what would happen the moment that
> step were ever forgotten?

### Project Change

**Reference Source:** `project/lib/sudoku_board.dart`, the real,
existing `bool get isComplete` getter (Lesson 11), read fresh this
session. **Files affected:** `project/lib/game_session.dart`, modified.
**Change type:** add. **Location:** inside the `GameSession` class body,
after `useHint`. **Dependencies:** none new.

### The New Code

```dart
bool get isComplete => board.isComplete;
```

### The Updated Project

The complete, real, final `GameSession` class for this lesson, this
unit's own new line marked, numbered:

```dart
1   class GameSession {
2     GameSession(this.board, {DateTime? startTime})
3         : difficulty = board.classifyDifficulty(),
4           startTime = startTime ?? DateTime.now();
5
6     final SudokuBoard board;
7     final String difficulty;
8     final DateTime startTime;
9
10    int _mistakes = 0;
11    int _hints = 0;
12
13    int get mistakes => _mistakes;
14    int get hints => _hints;
15
16    Duration get elapsed => DateTime.now().difference(startTime);
17
18    bool get isComplete => board.isComplete;  // ← new
19
20    void registerMistake() {
21      _mistakes++;
22    }
23
24    void useHint() {
25      _hints++;
26    }
27  }
```

`GameSession` is now complete for this lesson: one real, frozen snapshot
(`difficulty`), one real, live time span (`elapsed`), two real,
genuinely encapsulated counters (`mistakes`/`hints`), and, as of line
18, one real, live completion flag that can never disagree with the
board it reads from.

### Isolate and Discard

Not applicable — `board.isComplete` is a direct, one-line delegation to
an already fully-taught, already-lab'd getter (Lesson 11); no new
language construct is introduced.

### Mechanical Walkthrough

- `bool get isComplete => board.isComplete;` — a real getter
  (reappearing) whose entire body is a single real property read on
  `board` — `board.isComplete` here is the exact same real getter
  Lesson 11 built and Phase 2 has tested ever since, reached through
  `GameSession`'s own real `board` field (Concept Unit 1). No new real
  logic exists in `GameSession` itself at all — this is pure real
  delegation: asking the one real object that actually knows the
  answer, rather than tracking a second, separate, redundant copy of it.

### CS Lens

This one-line getter is a real, minimal instance of **delegation** — a
real object answering a question not by knowing the answer itself, but
by forwarding the question to another real object that does, verbatim,
with zero transformation. It's also this lesson's own third and final
real instance of **derived state** (Lesson 35), the plainest possible
form of it: derived from exactly one other real value, with no
computation at all beyond the forward itself.

```
Also recognized in: a company's own automated receptionist forwarding a
call directly to the one real department that can actually answer it,
a proxy server forwarding an HTTP request to the real backend that
holds the actual data, a subclass's own overridden method that simply
calls `super.method()` and returns its real result unchanged
```

### SE Lens

The alternative — `GameSession` keeping its own separate `bool
_isComplete` field, manually set to `true` somewhere after a successful
`placeDigit` call — was rejected for the identical real reason Concept
Unit 1 chose *against* this shape for `elapsed`: a manually-updated
second copy of a fact the board already knows perfectly is a second real
place that fact could quietly go stale, the exact failure Lesson 35's
own Concept Unit 3 already proved is a real, live risk in this
codebase's own recent history. The real cost of delegating instead:
`GameSession.isComplete` does slightly more real work per read (one
extra real method call) than reading a plain boolean field would — a
real, negligible cost, paid gladly in exchange for the same
never-out-of-sync guarantee `_cells` (Lesson 35) already earned.

### Commands Needed

None — no new commands this unit.

### Run It

Real, run this session, via `dart run test/game_session_test.dart`:

```
PASS: a real Hard puzzle is classified Hard at construction
PASS: the board really is fully solved now
PASS: classifying the same board fresh, now complete, gives a different, meaningless answer
PASS: but the session's own stored difficulty never changed — a real snapshot, not derived state
PASS: elapsed time reflects a real, live comparison against now, not a value fixed at construction
PASS: a fresh session starts with zero real mistakes
PASS: a fresh session starts with zero real hints used
PASS: two real calls to registerMistake left mistakes at 2
PASS: one real call to useHint left hints at 1
PASS: a freshly started real session is not complete
PASS: isComplete flips to true the instant the underlying real board reports complete — no separate step needed
11 tests run, 0 failed
```

`flutter analyze .` and the full `flutter test` suite (17 real test
files, including this lesson's own new `game_session_test.dart`) both
stayed clean, real output saved in `verification/lesson-36/run-log.md`.

### Connect

`GameSession` now genuinely answers every real question curriculum's
own Lesson 36 bullet asked for: puzzle, current board, difficulty, start
time, elapsed time, mistakes, hints, and completion status — built and
proved correct entirely on its own, with zero changes to `main.dart`
yet.

---

## Connect the Pieces

Follow one real `GameSession`, built around the real `Hard` puzzle
Lesson 21 found, through every unit this lesson built:

1. `GameSession(SudokuBoard(_hardPuzzle))` captured `difficulty =
   'Hard'` exactly once, at construction (Concept Unit 1) — a real
   **value snapshot** of a fact that would stop meaning the same thing
   the instant the board started filling in.
2. From the moment it was constructed, `elapsed` (Concept Unit 2) has
   been answerable at any real instant, computed live from `startTime`
   against whatever `DateTime.now()` actually is at read time — no
   ticking mechanism required.
3. Every real rejected move this session will ever see could call
   `registerMistake()` (Concept Unit 3); every real hint requested could
   call `useHint()` — both genuinely private counters, unreachable any
   other way, a real, corrected example of the exact encapsulation
   discipline Lesson 11 already taught.
4. Calling `session.board.solve()` directly proved two things at once:
   `isComplete` (Concept Unit 4) flipped to `true` immediately, with no
   separate step, and a *fresh* call to `classifyDifficulty()` on that
   same, now-complete board returned `'Easy'` — while `session
   .difficulty` itself stayed `'Hard'`, exactly as Concept Unit 1
   promised it would.

`GameSession` is now a real, complete, independently-tested domain
object — Lesson 35's own named gap has a real owner. It still knows
nothing about `main.dart`, and `main.dart` still knows nothing about it.
The next lesson is where a user's tap actually becomes a change to this
object, following one clean, real, named direction.
