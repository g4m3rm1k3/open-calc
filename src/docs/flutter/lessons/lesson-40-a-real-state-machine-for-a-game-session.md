# Lesson 40: A Real State Machine for a Game Session

**What you will build:** `project/lib/game_status.dart` — a new,
real, enhanced enum, `GameStatus`, naming every real state one played
game can be in (curriculum's own `NotStarted → Playing → Paused →
Completed`, plus `Abandoned`/`Failed`/`Interrupted`) — and a real,
complete, explicit transition table added to `GameSession`, rejecting
any illegal move with a new domain error,
`InvalidStateTransitionException`. Getting there moved real,
significant logic (auto-starting on the first move, detecting
completion, failing after too many mistakes) out of
`GameSessionNotifier` and into `GameSession` itself, where curriculum's
own architectural point (Lesson 34: the UI shouldn't own the rules)
applies just as much to the *session* layer as it always did to the
board. A real "Pause"/"Resume" button reaches this new machine through
`_dispatch`; a real, new Flutter concept — `WidgetsBindingObserver`,
listening for genuine OS-level app lifecycle changes — reaches it too,
proving `interrupted` is a real, externally-triggered state, not just a
name on a diagram. This is the final lesson of Phase 4.

**What you need to know first:**
- Lesson 5 — `final`, `const`.
- Lesson 6 — `switch`, `if`/`else`.
- Lesson 8 — named parameters, arrow-function bodies.
- Lesson 9 — `Map`/`Set` literals, the index operator, list literals.
- Lesson 10 — the `!` null-assertion operator.
- Lesson 11 — encapsulation.
- Lesson 12 — `extends`, `with` (mixins) — this lesson's own first real
  use of `with` outside a doc-comment mention.
- Lesson 13 — enhanced enums (a `const` constructor, a real field) —
  `GameStatus.isTerminal` reuses this exact real pattern.
- Lesson 14 — domain errors, `InvalidMoveException`'s own real shape,
  reused directly for `InvalidStateTransitionException`; `finally`,
  reused for real for the first time since Lesson 14 itself.
- Lesson 20 — `static const`, reused for `_legalTransitions`/
  `maxMistakesBeforeFailure`.
- Lesson 21 — `SudokuBoard.classifyDifficulty`'s own plain-`String`
  return shape, contrasted with this lesson's own real `GameStatus` enum.
- Lesson 25 — `@override`.
- Lesson 27 — the real risk of two independent places disagreeing,
  reused as this lesson's own reasoning for centralizing every real
  transition check inside `_transitionTo`.
- Lesson 28 — `initState`/`dispose`, reused for a second, different real
  purpose this lesson.
- Lesson 33 — `tester.ensureVisible`, reused again this lesson for a
  real, second, independently-triggered off-screen-button failure.
- Lesson 34 — curriculum's own architectural point (the UI shouldn't own
  the rules) — this lesson applies it a second time, one layer up.
- Lesson 35 — the real, proved `_gamesStarted`/`_board` gap this
  lesson's own real state machine finally closes for good.
- Lesson 36 — `GameSession`, `mistakes`, `registerMistake`.
- Lesson 37 — `GameIntent`, `_dispatch`, sealed classes, object patterns
  — this lesson's own new `TogglePauseIntent` and OR-patterns both
  extend this exact real machinery.
- Lesson 38 — `Notifier`, `ref.read`, `state.touched()`.
- Lesson 39 — dependency injection (`Clock`) — contrasted this lesson
  with app lifecycle events, a real dependency this app *receives*
  rather than one it *asks for*.

**Terms used in this lesson:**
- **State machine** — new, hard concept: a real, formal model naming
  every state a system can be in, and every legal transition between
  them, so that a request to move to an illegal state can be *rejected
  outright* rather than merely producing a confusing or undocumented
  result. It exists because "what can happen next" is otherwise only
  ever implicit in scattered code — Lesson 35's own real, proved gap (a
  button that claimed to start a new game but didn't) is exactly the
  kind of implicit, unenforced behavior a real state machine makes
  structurally impossible to get wrong silently.
- **Terminal state** — new: a real state with no legal transitions
  leading out of it at all. It exists because not every real state is
  equally final — `paused` genuinely expects to be left again;
  `completed` genuinely does not.
- **OR-pattern** — new: Dart 3's real `pattern1 || pattern2` syntax
  inside a `case` label, matching if *either* pattern matches, running
  one shared real body for both. It exists to let several real,
  unrelated case labels that should be handled identically share one
  body, without stacking empty `case` labels (Lesson 6's own `switch`
  never needed this, since none of its cases shared a body).
- **App lifecycle** — new: the real, fixed sequence of states a host
  operating system puts a running app through — foregrounded,
  backgrounded, terminated, and others — entirely independent of
  anything the app's own code decides. It exists because a real, running
  app is never fully in control of its own execution — the real OS can
  suspend or resume it at any real moment, for reasons (an incoming
  phone call, the user switching apps, low memory) the app itself never
  requested.

**Objects and methods used:**

- **`GameStatus`**
  - *What it is:* this lesson's own new, real, primary subject — an
    enhanced enum (Lesson 13's own real pattern, reappearing) naming
    every real state a `GameSession` can be in.
  - *Implementation:* real, complete, from `project/lib/game_status.dart`
    (shown in full in this lesson's own Concept Unit 1).
  - *Its use:* `GameSession._status`'s own real type; every real
    transition method (`pause`, `resume`, `abandon`, `interrupt`,
    `enterDigit`) either reads or writes a value of this type.
  - *Type:* an enhanced enum with one real field, `isTerminal`.
  - *Responsibility:* enumerate the complete, real, closed set of states
    a session can occupy — nothing about "what a session is doing right
    now" can be expressed outside this real, fixed list.
  - *Depends on:* nothing.
  - *Connects to:* read by `GameSession._legalTransitions`; displayed
    directly in `main.dart`'s own new `Text('Status: ${session.status
    .name}')`.
  - *Shape:* `project/lib/`'s own new, small, pure-domain file — no
    Flutter or Riverpod dependency, the same real discipline Lesson 39
    established for `clock.dart`.

- **`InvalidStateTransitionException`**
  - *What it is:* a new, real domain error, naming exactly which real
    transition was rejected and why.
  - *Implementation:* real, complete, from `project/lib/game_session.dart`:
    `class InvalidStateTransitionException implements Exception { final
    String message; InvalidStateTransitionException(this.message);
    @override String toString() => 'InvalidStateTransitionException:
    $message'; }` — the identical real shape as Lesson 14's own
    `InvalidMoveException`.
  - *Its use:* thrown by `GameSession._transitionTo` whenever a
    requested real transition isn't in `_legalTransitions`; caught by
    `_SudokuAppState._dispatch` and shown via a real `SnackBar`, the
    same real pattern `InvalidMoveException` already established.
  - *Type:* a concrete class implementing `Exception`.
  - *Responsibility:* carry a real, specific, human-readable reason one
    exact transition was rejected.
  - *Depends on:* a real `String` message, built at the real throw site
    from the session's own current and requested `GameStatus.name`
    values.
  - *Connects to:* thrown by `GameSession._transitionTo`/`enterDigit`;
    caught by `_SudokuAppState._dispatch`.
  - *Shape:* a real, second domain error alongside `InvalidMoveException`
    — both now genuinely used by real, live UI code.

- **`GameSession._transitionTo`/`pause`/`resume`/`abandon`/`interrupt`**
  - *What it is:* `_transitionTo` is the one real, private method that
    ever reassigns `_status`; the four public methods are its real,
    named callers.
  - *Implementation:* real, complete, from `project/lib/game_session.dart`
    (shown in full in this lesson's own Concept Unit 2).
  - *Its use:* `pause`/`resume` are called by `GameSessionNotifier
    .togglePause`; `interrupt`/`resume` are called by
    `GameSessionNotifier.handleAppLifecycleChange`; `abandon` is real
    and fully tested, though this lesson does not yet wire a UI button
    to it — an honest, forward-flagged gap, the same kind Lesson 36 left
    for `useHint`.
  - *Type:* five real instance methods (one private, four public).
  - *Responsibility:* `_transitionTo` — the sole real gatekeeper,
    checking every requested move against `_legalTransitions` before
    ever changing `_status`. The four public methods — request one
    specific, named real transition each, with no logic of their own
    beyond naming which one.
  - *Depends on:* `_legalTransitions`, a real, `static const` `Map`
    (Lesson 9's own `Map`, reappearing) from every `GameStatus` to the
    real `Set` of statuses it may legally move to next.
  - *Connects to:* called by `GameSessionNotifier`'s own real methods;
    reads/writes `GameSession._status` exclusively through
    `_transitionTo`.
  - *Shape:* the real, complete definition of this project's own first
    formal state machine.

- **`GameSession.enterDigit`**
  - *What it is:* real, substantial domain logic, moved here this
    lesson from `GameSessionNotifier` (Lesson 38's own original home for
    it) — this lesson's own real architectural refactor.
  - *Implementation:* real, complete, from `project/lib/game_session.dart`
    (shown in full in this lesson's own Concept Unit 2).
  - *Its use:* the one real place a digit placement, a mistake, an
    auto-start, and an auto-completion are all decided together, as one
    coherent real domain operation.
  - *Type:* a real instance method.
  - *Responsibility:* decide, entirely on its own, whether a real move is
    even allowed right now (auto-starting if needed, rejecting if not
    genuinely `playing`), attempt it against the real board, record a
    real mistake (and possibly fail the session) if it's rejected, and
    complete the session the instant the real board finishes.
  - *Depends on:* `board` (already a real field); `_status`
    (read/written via `_transitionTo`); `registerMistake`.
  - *Connects to:* called by `GameSessionNotifier.enterDigit`, now a
    thin, real adapter around it.
  - *Shape:* real, central domain logic — exactly the kind of code
    Lesson 41 (architecture fundamentals) will soon give a formal,
    named layer of its own.

- **`WidgetsBindingObserver`/`didChangeAppLifecycleState`**
  - *What it is:* a real, standard Flutter mixin (Lesson 12's own `with`
    keyword, reappearing) letting any object register to be told about
    real app lifecycle events.
  - *Implementation:* real, verbatim, from
    `C:\flutter\packages\flutter\lib\src\widgets\binding.dart`, line 86:
    `abstract mixin class WidgetsBindingObserver { ... }`; line 369:
    `void didChangeAppLifecycleState(AppLifecycleState state) {}` — a
    real, empty default body, meant to be overridden.
  - *Its use:* `_SudokuAppState with WidgetsBindingObserver`, overriding
    `didChangeAppLifecycleState` to forward every real event straight to
    `GameSessionNotifier.handleAppLifecycleChange`.
  - *Type:* a real `mixin class` — reusable behavior added to a class via
    `with`, rather than through single inheritance (`extends`).
  - *Responsibility:* provide a real, named hook the framework calls
    automatically on every real lifecycle change, with no default real
    behavior of its own (the empty body above) until overridden.
  - *Depends on:* being registered via `WidgetsBinding.instance
    .addObserver(this)` — without that real call, the override is never
    actually invoked.
  - *Connects to:* `WidgetsBinding.instance` calls it; `_SudokuAppState`
    overrides it.
  - *Shape:* real, standard Flutter infrastructure — a mixin, not a
    widget or a `State` subclass itself.

- **`WidgetsBinding.instance.addObserver`/`removeObserver`**
  - *What it is:* the real, paired registration methods every real
    `WidgetsBindingObserver` must call to actually start (and later
    stop) receiving real events.
  - *Implementation:* real shape used here: `WidgetsBinding.instance
    .addObserver(this)`, called inside `initState`; `WidgetsBinding
    .instance.removeObserver(this)`, called inside `dispose`.
  - *Its use:* the real, necessary bookkeeping making
    `didChangeAppLifecycleState` actually fire for this specific real
    `State` object.
  - *Type:* two real instance methods on the real, singleton
    `WidgetsBinding.instance`.
  - *Responsibility:* `addObserver` — add a real object to the list
    every lifecycle event gets broadcast to. `removeObserver` — the
    exact real inverse, preventing a real callback into a `State` object
    that no longer exists (the identical real risk Lesson 28's own
    `Timer.cancel()` already guarded against, for a different real
    subscription).
  - *Depends on:* a real object implementing `WidgetsBindingObserver`.
  - *Connects to:* called from `initState`/`dispose`, the same two real
    lifecycle hooks Lesson 28 and Lesson 35 already gave full treatment.
  - *Shape:* real, standard Flutter infrastructure.

- **`AppLifecycleState`**
  - *What it is:* a real, standard enum naming every real state the host
    OS can put this app's own process in.
  - *Implementation:* real, current, confirmed by running
    `AppLifecycleState.values` this session (not read from memory):
    `[AppLifecycleState.detached, AppLifecycleState.resumed,
    AppLifecycleState.inactive, AppLifecycleState.hidden,
    AppLifecycleState.paused]`.
  - *Its use:* `GameSessionNotifier.handleAppLifecycleChange`'s own real
    `switch` parameter type — matched exhaustively against all five real
    values.
  - *Type:* a real, plain enum (`dart:ui`, re-exported by Flutter).
  - *Responsibility:* name, exhaustively, every real state this app's
    own process can be in from the OS's own point of view.
  - *Depends on:* nothing — reported to the app by the real, host OS.
  - *Connects to:* delivered to `didChangeAppLifecycleState`; read by
    `GameSessionNotifier.handleAppLifecycleChange`'s own real `switch`.
  - *Shape:* real, standard Flutter/`dart:ui` API — this app's first
    real dependency on anything OS-level.

---

## Concept Unit: Naming Every Real State — `GameStatus`

### The Problem

Curriculum's own diagram names seven real states this session can be in.
Nothing in `GameSession` currently represents "which one of these am I
right now" at all — `isComplete` (Lesson 36) only answers one narrow real
question, derived from the board. What's the smallest real way to name
all seven, together, as one real, closed set?

> **Pause and think:** Given Lesson 13's own real, enhanced `Difficulty`
> enum already proved an enum can carry a real field alongside each of
> its values (`cellsToRemove`) — what real, useful field might a
> `GameStatus` value want to carry, given that some of curriculum's own
> seven real states (`Completed`, `Failed`, `Abandoned`) are clearly
> *final*, and others (`Playing`, `Paused`) clearly are not? Given
> `SudokuBoard.classifyDifficulty` (Lesson 21) already returns a plain
> real `String` rather than an enum — what real, concrete advantage
> would a genuine `GameStatus` enum have over just using plain strings
> like `'playing'`/`'paused'` for this instead?

### Project Change

**Reference Source:** no reference counterpart — a from-scratch
addition; curriculum's own Lesson 40 diagram names the real shape.
**Files affected:** `project/lib/game_status.dart`, created.
**Change type:** add. **Location:** new file. **Dependencies:** none.

### The New Code

```dart
enum GameStatus {
  notStarted(isTerminal: false),
  playing(isTerminal: false),
  paused(isTerminal: false),
  interrupted(isTerminal: false),
  completed(isTerminal: true),
  failed(isTerminal: true),
  abandoned(isTerminal: true);

  const GameStatus({required this.isTerminal});

  final bool isTerminal;
}
```

### The Updated Project

Not applicable — this is the whole new file, with nothing surrounding it
yet.

### Isolate and Discard

Not applicable — enhanced-enum syntax (a `const` constructor, a real
named field) is already fully lab'd in Lesson 13; this unit applies the
identical real pattern to a new, real set of values.

### Mechanical Walkthrough

- `enum GameStatus { notStarted(isTerminal: false), ..., abandoned(isTerminal: true); }`
  — `enum`, reappearing in full from Lesson 13: seven real, named
  values, each one a genuine constant instance of `GameStatus` itself;
  each real value is constructed with one real, named argument,
  `isTerminal`.
- `const GameStatus({required this.isTerminal});` — reappearing in full
  from Lesson 13's own enhanced enum: a real, `const` constructor
  (Lesson 5's own `const`, reappearing) — every enum value is built at
  real compile time, not run time; `required` (Lesson 8, reappearing)
  means every one of the seven real values above had to supply this
  argument explicitly — there's no real default to silently fall back
  on.
- `final bool isTerminal;` — a real, `final` (Lesson 5, reappearing)
  field — once a specific `GameStatus` value is built, its own
  `isTerminal` can never change, which makes real sense: `GameStatus
  .completed.isTerminal` is `true` for the exact same real reason every
  time, forever, not a fact that could ever legitimately become false.

### CS Lens

Naming a small, fixed, exhaustively-known set of real states as its own
type — rather than, say, plain strings — is the same real, hard concept
Lesson 13 already introduced with `Difficulty`, here reapplied to a
genuinely different real domain: not "how hard is this puzzle" but
"what is this session currently doing." The real payoff repeats too:
Lesson 13's own real, compiler-enforced exhaustive `switch` applies here
identically — a `switch` over `GameStatus` that forgets a real case is a
real compile error, the same real guarantee a plain `String` could never
give.

```
Also recognized in: a traffic light's own fixed, real set of colors
(never "whatever color someone typed"), an HTTP response's own fixed,
real set of status-code categories (1xx-5xx), a vending machine's own
fixed, real set of internal states (idle, dispensing, out of stock,
jammed) — never an open-ended, freely-typed description of what it's
doing
```

### SE Lens

The alternative — representing status as a plain `String` (the same
real shape `classifyDifficulty` already uses for a different, narrower
purpose) — was rejected here specifically because a session's own status
is checked and compared constantly, by real code that has to get every
single comparison exactly right (`_legalTransitions`, the next unit's
own subject, depends entirely on this). A typo in a plain string
(`'compelted'`) would silently never match anything and fail at real
run time, possibly much later than the actual mistake; the identical
typo as an enum member name (`GameStatus.compelted`) is a real compile
error, the instant it's written. The real cost of the enum approach:
seven small, fixed real values, upfront — a real, small, one-time
investment for a real, permanent guarantee.

### Commands Needed

None this unit.

### Run It

Not applicable as a standalone execution — verified together with the
next unit's own real test suite.

### Connect

Every real state this session can be in now has a real name. The next
unit decides which real moves between them are actually allowed.

---

## Concept Unit: Enforcing Legal Moves — Transitions Move Into `GameSession`

### The Problem

Naming seven real states isn't enough on its own — nothing yet stops a
`notStarted` session from being `paused` directly, skipping `playing`
entirely, which curriculum's own diagram never allows. Where should the
real rule "which moves are even legal" actually live, and what should
happen to a real, illegal request?

> **Pause and think:** Given `SudokuBoard.placeDigit` (Lesson 14) already
> proved the real pattern this project uses for "reject an illegal real
> request with a specific, real reason" — `throw`, not a silent `false`
> — what would the equivalent real domain error for an illegal *status*
> change actually need to say? Given `Map`/`Set` (Lesson 9) can represent
> real relationships between values — how would you represent "from
> `playing`, these five real statuses are legal next steps, and no
> others" as data, rather than as a long real chain of `if`/`else`?

### Project Change

**Reference Source:** `project/lib/sudoku_board.dart`, lines 5-11 (the
real, complete `InvalidMoveException`, Lesson 14), read fresh this
session as the real template for this unit's own new error.
**Files affected:** `project/lib/game_session.dart`, modified.
**Change type:** add; refactor. **Location:** top of the file (new
`InvalidStateTransitionException`); `GameSession`'s own class body (new
fields, methods, and a moved `enterDigit`). **Dependencies:** `import
'game_status.dart';`, added.

### The New Code

```dart
class InvalidStateTransitionException implements Exception {
  final String message;
  InvalidStateTransitionException(this.message);

  @override
  String toString() => 'InvalidStateTransitionException: $message';
}
```

```dart
static const Map<GameStatus, Set<GameStatus>> _legalTransitions = {
  GameStatus.notStarted: {GameStatus.playing},
  GameStatus.playing: {
    GameStatus.paused,
    GameStatus.completed,
    GameStatus.failed,
    GameStatus.abandoned,
    GameStatus.interrupted,
  },
  GameStatus.paused: {GameStatus.playing, GameStatus.abandoned, GameStatus.interrupted},
  GameStatus.interrupted: {GameStatus.playing, GameStatus.abandoned},
  GameStatus.completed: {},
  GameStatus.failed: {},
  GameStatus.abandoned: {},
};

void _transitionTo(GameStatus next) {
  final allowed = _legalTransitions[_status]!;
  if (!allowed.contains(next)) {
    throw InvalidStateTransitionException('cannot move from ${_status.name} to ${next.name}');
  }
  _status = next;
}

void pause() => _transitionTo(GameStatus.paused);
void resume() => _transitionTo(GameStatus.playing);
void abandon() => _transitionTo(GameStatus.abandoned);
void interrupt() => _transitionTo(GameStatus.interrupted);

void enterDigit(int row, int col, int digit) {
  if (_status == GameStatus.notStarted) {
    _transitionTo(GameStatus.playing);
  }
  if (_status != GameStatus.playing) {
    throw InvalidStateTransitionException('cannot enter a digit while the session is ${_status.name}');
  }
  try {
    board.placeDigit(row, col, digit);
  } on InvalidMoveException {
    registerMistake();
    rethrow;
  }
  if (board.isComplete) {
    _transitionTo(GameStatus.completed);
  }
}
```

### The Updated Project

The complete, real `GameSession` class, this unit's own new/changed
members marked, numbered (fields from Lessons 36/39 shown unchanged for
orientation):

```dart
1   class GameSession {
2     GameSession(this.board, this._clock, {DateTime? startTime}) : ...
3     GameSession._raw(this.board, this._clock, this.difficulty, this.startTime, this._mistakes, this._hints, this._status);  // ← changed (added this._status)
4
5     final SudokuBoard board;
6     final Clock _clock;
7     final String difficulty;
8     final DateTime startTime;
9
10    int _mistakes = 0;
11    int _hints = 0;
12    GameStatus _status = GameStatus.notStarted;                                 // ← new
13
14    static const Map<GameStatus, Set<GameStatus>> _legalTransitions = { /* ... */ };  // ← new
15    static const int maxMistakesBeforeFailure = 3;                              // ← new
16
17    GameSession touched() => GameSession._raw(board, _clock, difficulty, startTime, _mistakes, _hints, _status);  // ← changed
18
19    int get mistakes => _mistakes;
20    int get hints => _hints;
21    GameStatus get status => _status;                                           // ← new
22
23    Duration get elapsed => _clock.now().difference(startTime);
24    bool get isComplete => board.isComplete;
25
26    void _transitionTo(GameStatus next) { /* ... */ }                           // ← new
27    void pause() => _transitionTo(GameStatus.paused);                           // ← new
28    void resume() => _transitionTo(GameStatus.playing);                         // ← new
29    void abandon() => _transitionTo(GameStatus.abandoned);                      // ← new
30    void interrupt() => _transitionTo(GameStatus.interrupted);                  // ← new
31
32    void enterDigit(int row, int col, int digit) { /* ... */ }                  // ← new (moved from GameSessionNotifier)
33
34    void registerMistake() {                                                     // ← changed
35      _mistakes++;
36      if (_mistakes >= maxMistakesBeforeFailure && _status == GameStatus.playing) {  // ← new
37        _transitionTo(GameStatus.failed);                                         // ← new
38      }                                                                            // ← new
39    }
40
41    void useHint() {
42      _hints++;
43    }
44  }
```

`touched()` (line 17) now carries `_status` through too — an easy real
omission to make, and exactly the kind of thing this schema's own
Repetition Rule exists to catch: every real field `GameSession` owns has
to survive a `touched()` copy, or Riverpod would silently keep noticing
changes to every other field while completely missing status changes.

### Isolate and Discard

Not applicable — `Map`/`Set` literals (Lesson 9), `throw` (Lesson 14),
and `static const` (Lesson 20) are already fully lab'd; this unit's own
real newness is architectural (a real, explicit transition table),
proved directly against real project code and a real, permanent test
suite (this lesson's own final unit shows the complete real run).

### Mechanical Walkthrough

- `class InvalidStateTransitionException implements Exception { ... }` —
  the identical real shape as `InvalidMoveException` (Lesson 14,
  reappearing in full): `implements Exception` (Lesson 12's own
  interface pattern), a real, public `message` field, and a real,
  overridden `toString()`.
- `static const Map<GameStatus, Set<GameStatus>> _legalTransitions = {...}`
  — `static const` (Lesson 20, reappearing): built once, at real compile
  time, shared by every `GameSession` instance rather than recomputed
  per object; a real `Map` literal (Lesson 9, reappearing) whose own
  keys are `GameStatus` values and whose own values are real `Set`
  literals (Lesson 9, reappearing) — `GameStatus.completed: {}` is a
  real, empty set: this lesson's own concrete, data-level expression of
  **terminal state** (this lesson's own new Header term) — nothing is
  ever a legal destination from here.
- `void _transitionTo(GameStatus next) { final allowed = _legalTransitions[_status]!; if (!allowed.contains(next)) { throw ...; } _status = next; }`
  — `_legalTransitions[_status]` is a real index operator (Lesson 9,
  reappearing) on a `Map`, returning the real `Set` of legal next
  statuses (or `null` if the key were missing, which it never is here,
  since every real `GameStatus` value has its own real entry — the `!`
  null-assertion, Lesson 10, reappearing, states that confidence
  directly); `.contains` (Lesson 9, reappearing) checks real set
  membership; `throw`/a real, constructed `InvalidStateTransitionException`
  (Lesson 14, reappearing) rejects the move with a real, specific
  message naming both the current and requested real status by name
  (`.name`, Lesson 13's own real, inherited `Enum` member, reappearing);
  `_status = next;` is the one real line, in this whole class, that ever
  reassigns this field.
- `void pause() => _transitionTo(GameStatus.paused);` (and the three
  siblings beside it) — real, one-line arrow functions (Lesson 8,
  reappearing), each naming exactly one real, intended transition —
  none of the four contains any real logic of its own; all real
  decision-making happens once, inside `_transitionTo`.
- `void enterDigit(int row, int col, int digit) { ... }` — moved here,
  in full, from `GameSessionNotifier` (Lesson 38's own original home):
  `if (_status == GameStatus.notStarted) { _transitionTo(GameStatus
  .playing); }` — a real, automatic transition, no explicit `start()`
  call needed from any caller; `if (_status != GameStatus.playing) {
  throw ...; }` — a real, second real guard, rejecting any attempt while
  genuinely paused, completed, failed, abandoned, or interrupted; the
  real `try`/`on InvalidMoveException`/`rethrow` block (Lesson 14,
  reappearing in full) is unchanged in shape from Lesson 38, except that
  `registerMistake()` (below) can now itself trigger a real, further
  transition; `if (board.isComplete) { _transitionTo(GameStatus
  .completed); }` — reads the real, already-existing `SudokuBoard
  .isComplete` (Lesson 11) fresh, immediately after a real, successful
  placement.
- `void registerMistake() { _mistakes++; if (_mistakes >= maxMistakesBeforeFailure && _status == GameStatus.playing) { _transitionTo(GameStatus.failed); } }`
  — reappearing `_mistakes++` (Lesson 36); the new real `if` (Lesson 6,
  reappearing) checks a real, named constant,
  `maxMistakesBeforeFailure`, *and* that the session is still genuinely
  `playing` — the second real condition matters: without it, a session
  already `paused` when its third real mistake happened (impossible
  today, since mistakes only occur inside `enterDigit`, itself guarded
  to require `playing` — but a real, honest guard against a future
  change accidentally breaking that assumption) could not silently
  "fail while paused," which would be a nonsensical real transition.

### CS Lens

`_legalTransitions` — a real `Map` from each state to its own real set
of legal successors — is the textbook, real, concrete representation of
a **finite state machine**: a real, complete, closed graph, states as
nodes, legal transitions as directed edges, with `_transitionTo` as the
one real function ever walking an edge.

```
Also recognized in: a traffic light controller's own real, fixed
transition table (red → green, never red → yellow directly), a TCP
connection's own real, formally specified state diagram (SYN_SENT,
ESTABLISHED, FIN_WAIT, and so on — a real, standard protocol document
this exact shape comes from), a vending machine's own real internal
controller, a board game's own real rulebook defining which moves are
legal from which real position
```

### SE Lens

The alternative — scattering these same real checks as `if` statements
directly inside whatever code happens to request a transition (the
UI, the notifier) — was rejected because that real approach has no
single place to *see* the complete real rule set at all, and, worse,
would let two different real call sites drift into disagreement about
what's actually legal, the same real risk this curriculum has already
named more than once (Lesson 27's SE lens; Lesson 38's own real,
discovered mutable-state gotcha). Moving `enterDigit` itself into
`GameSession` — this unit's own real, structural decision — carries a
real, honest cost too: `GameSessionNotifier` (the next unit's own
subject) had real logic taken away from it, which might read, at a
glance, as the notifier doing less — the real, correct read is that the
notifier's job was never *supposed* to include domain rules at all
(curriculum's own Lesson 34 already said so, one layer down); this
lesson simply catches a second, real place that same principle had
quietly drifted.

### Commands Needed

None this unit.

### Run It

Not applicable as a standalone execution — verified together with this
lesson's own final, complete test run.

### Connect

Illegal transitions are now genuinely rejected, and `enterDigit` genuinely
owns its own real domain rules. The next unit wires real, automatic
transitions into actual gameplay, and gives the player a real way to
pause on purpose.

---

## Concept Unit: Automatic Transitions and a Real Pause/Resume Button

### The Problem

`GameSessionNotifier.enterDigit` (Lesson 38) still contains the real
logic this unit's own previous work just moved into `GameSession`
itself. And nothing yet lets a real player actually *choose* to pause —
curriculum's own diagram includes `Paused` as a real, deliberate state, not
just an automatic one.

> **Pause and think:** Given `GameSession.enterDigit` now handles every
> real domain decision on its own — what real work is actually left for
> `GameSessionNotifier.enterDigit` to do at all? Given Lesson 37's own
> real `GameIntent` hierarchy already proved a sealed class can be
> extended by more than one real subtype — what would the smallest real
> new subtype naming "the player tapped the Pause/Resume button" need to
> carry as data, given that whether that tap should *pause* or *resume*
> genuinely depends on the session's own current real status, not on
> anything the tap itself carries?

### Project Change

**Reference Source:** `project/lib/game_session_provider.dart`, the
real, existing `GameSessionNotifier.enterDigit` (Lesson 38), read fresh
this session. **Files affected:** `project/lib/game_session_provider.dart`,
modified; `project/lib/game_intent.dart`, modified; `project/lib/main.dart`,
modified. **Change type:** refactor; add. **Location:**
`GameSessionNotifier`'s own class body; `game_intent.dart`'s own bottom;
`_SudokuAppState._dispatch`'s own `switch` and `build`'s own `Column`.
**Dependencies:** none new.

### The New Code

```dart
void enterDigit(int row, int col, int digit) {
  try {
    state.enterDigit(row, col, digit);
  } finally {
    state = state.touched();
  }
}

void togglePause() {
  if (state.status == GameStatus.playing) {
    state.pause();
    state = state.touched();
  } else if (state.status == GameStatus.paused) {
    state.resume();
    state = state.touched();
  }
}
```

```dart
class TogglePauseIntent extends GameIntent {}
```

### The Updated Project

The complete, real `_dispatch` method and the relevant real slice of
`build()`, this unit's own new/changed lines marked, numbered:

```dart
1   void _dispatch(GameIntent intent) {
2     switch (intent) {
3       case SelectCellIntent(row: final row, col: final col):
4         setState(() {
5           _selectedRow = row;
6           _selectedCol = col;
7         });
8       case EnterDigitIntent(digit: final digit):
9         final row = _selectedRow;
10        final col = _selectedCol;
11        if (row == null || col == null) {
12          return;
13        }
14        try {
15          ref.read(gameSessionProvider.notifier).enterDigit(row, col, digit);
16        } on InvalidMoveException catch (e) {
17          _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
18        } on InvalidStateTransitionException catch (e) {                          // ← new
19          _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));  // ← new
20        }                                                                          // ← new
21      case TogglePauseIntent():                                                    // ← new
22        ref.read(gameSessionProvider.notifier).togglePause();                       // ← new
23    }
24  }
25
26  @override
27  Widget build(BuildContext context) {
28    final session = ref.watch(gameSessionProvider);
29    final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;  // ← new
30    return MaterialApp(
31      // ...
32      home: Scaffold(
33        // ...
34        body: SingleChildScrollView(
35          child: Column(
36            children: [
37              Text('Status: ${session.status.name}'),                                // ← new
38              const SizedBox(height: 8),                                             // ← new
39              SudokuBoardView(/* ... */),
40              const SizedBox(height: 16),
41              NumberPadView(/* ... */),
42              const SizedBox(height: 16),
43              if (canTogglePause)                                                     // ← new
44                ElevatedButton(                                                        // ← new
45                  onPressed: () => _dispatch(TogglePauseIntent()),                      // ← new
46                  child: Text(session.status == GameStatus.paused ? 'Resume' : 'Pause'), // ← new
47                ),                                                                       // ← new
48              const SizedBox(height: 16),
49              const _SessionStatus(),
50            ],
51          ),
52        ),
53      ),
54    );
55  }
```

### Isolate and Discard

Not applicable — every individual real piece here (`try`/`finally`,
sealed subclasses, conditional widget inclusion via `if`) is already
fully lab'd; this unit wires them together for a new, real purpose.

### Mechanical Walkthrough

- `try { state.enterDigit(row, col, digit); } finally { state = state.touched(); }`
  — `finally` (Lesson 14, reappearing in full, for the first time since
  Lesson 14 itself): this real block runs *no matter what* —
  `state.enterDigit` succeeding, throwing `InvalidMoveException`, or
  throwing `InvalidStateTransitionException` all reach the identical
  real `finally` body; whatever real exception was thrown, if any, keeps
  propagating upward automatically once `finally` finishes — Dart never
  swallows it. This is a real, meaningful simplification over Lesson
  38's own original version, which needed a separate, explicit `on
  InvalidMoveException` branch just to call `touched()` before
  `rethrow`ing.
- `void togglePause() { if (state.status == GameStatus.playing) { ... } else if (state.status == GameStatus.paused) { ... } }`
  — real, plain `if`/`else if` (Lesson 6, reappearing); each real branch
  calls exactly one of `GameSession`'s own new transition methods, then
  `touched()`; neither branch runs at all if the session is in any other
  real status — a silent, deliberate no-op, since there's nothing
  sensible to do with a pause/resume tap while, say, `completed`.
- `class TogglePauseIntent extends GameIntent {}` — reappearing `extends`
  (Lesson 12) from a real, sealed hierarchy (Lesson 37): an empty real
  class body — this real intent carries no data at all, because *which*
  real transition happens depends entirely on the session's own current
  status, decided inside `togglePause`, not on anything the tap itself
  could report.
- `case TogglePauseIntent():` — a real object pattern (Lesson 37,
  reappearing) with nothing to destructure — the empty real parentheses
  still perform a real, genuine type check against `intent`'s own
  runtime type, exactly like every other real case in this `switch`.
- `on InvalidStateTransitionException catch (e) { ... }` — a real,
  second `on` clause (Lesson 14, reappearing), added directly beside the
  existing `InvalidMoveException` one — both real exception types share
  an identical real `message` field, so both real catch bodies are, by
  necessity, identical in shape.
- `final canTogglePause = session.status == GameStatus.playing || session.status == GameStatus.paused;`
  — `||` (Lesson 6, reappearing) combines two real comparisons into one
  real boolean; `if (canTogglePause) ElevatedButton(...)` — a real,
  conditional widget inclusion (Dart's own `if` inside a collection
  literal, reappearing informally since `Column`'s own `children:` list
  has always been a real `List` literal, Lesson 9) — the button is
  genuinely absent from the real widget tree entirely, not merely
  disabled, whenever the session is `notStarted` or any of the three
  real terminal statuses.

### CS Lens

`GameSessionNotifier.enterDigit`'s own new shape — `try { realOperation();
} finally { alwaysNotify(); }` — is a real, minimal instance of the
**decorator**/wrapper pattern: a thin real layer adding one, consistent,
real cross-cutting behavior (telling Riverpod something changed) around
a call to real domain logic it doesn't need to understand the details
of at all.

```
Also recognized in: a database transaction's own real `COMMIT`/
`ROLLBACK` guaranteed to run regardless of which real query inside it
succeeded or failed, a file handle's own real `close()` call inside a
`finally` block regardless of whether reading it threw, a web
framework's own real request-logging middleware wrapping every real
route handler identically, whether that handler succeeds or fails
```

### SE Lens

The alternative — keeping two separate, real `on X catch` clauses with
genuinely different real bodies for `InvalidMoveException` versus
`InvalidStateTransitionException` — was considered and rejected here:
both real messages are shown identically, so two clauses with identical
bodies, while slightly repetitive, are more honest than collapsing them
into a single broad `on Exception catch (e)`, which would also
silently catch any real, genuinely unexpected exception this code was
never designed to handle gracefully — the real, small cost of a few
duplicated lines, paid to keep this `catch` block's own real scope
exactly as narrow as it should be.

### Commands Needed

None new — `flutter analyze .`/`flutter test`.

### Run It

Real, run this session — full output in this lesson's own final unit,
together with the app-lifecycle work below.

### Connect

A real player can now genuinely pause and resume, and every real
gameplay transition (auto-start, auto-complete, auto-fail) flows through
one, thin, real notifier method. The final unit gives this same machine
a real transition it never asked for.

---

## Concept Unit: A Real Transition From Outside the App — `interrupted`

### The Problem

Every real transition so far was requested by this app's own code —
either a player's tap, or a domain rule reacting to one. Curriculum's
own `Interrupted` state is different: it should happen when the real
*operating system*, not this app, decides to background it. Does this
app currently have any real way to even find out that happened?

> **Pause and think:** Given this app has never once imported anything
> from `dart:ui` directly (Lesson 25's own already-documented boundary)
> — what real, Flutter-level mechanism would have to exist for *any*
> Flutter app to find out the host OS just backgrounded it? Given a real
> `State` object already has real lifecycle hooks of its own
> (`initState`/`dispose`, Lesson 28) for its *own* creation and
> destruction — would you expect "the OS backgrounded the whole app" to
> arrive through one of those same real hooks, or somewhere else
> entirely?

### Project Change

**Reference Source:**
`C:\flutter\packages\flutter\lib\src\widgets\binding.dart`, lines 86 and
369 (the real, complete `WidgetsBindingObserver` mixin and its
`didChangeAppLifecycleState` hook), read fresh this session.
**Files affected:** `project/lib/main.dart`, modified;
`project/lib/game_session_provider.dart`, modified. **Change type:**
add. **Location:** `_SudokuAppState`'s own class declaration,
`initState`, and a new override; `GameSessionNotifier`'s own class body.
**Dependencies:** `import 'package:flutter/widgets.dart' show
AppLifecycleState;`, added to `game_session_provider.dart`.

### The New Code

```dart
class _SudokuAppState extends ConsumerState<SudokuApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    ref.read(gameSessionProvider.notifier).handleAppLifecycleChange(state);
  }
}
```

```dart
void handleAppLifecycleChange(AppLifecycleState lifecycleState) {
  switch (lifecycleState) {
    case AppLifecycleState.paused || AppLifecycleState.inactive || AppLifecycleState.hidden:
      if (state.status == GameStatus.playing) {
        state.interrupt();
        state = state.touched();
      }
    case AppLifecycleState.resumed:
      if (state.status == GameStatus.interrupted) {
        state.resume();
        state = state.touched();
      }
    case AppLifecycleState.detached:
      break;
  }
}
```

### The Updated Project

The complete, real `_SudokuAppState`, this unit's own new lines marked,
numbered (fields/`_dispatch`/`build` from earlier units omitted here for
space, unchanged from this lesson's own previous unit):

```dart
1   class _SudokuAppState extends ConsumerState<SudokuApp> with WidgetsBindingObserver {  // ← changed
2     final _scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();
3     int? _selectedRow = 4;
4     int? _selectedCol = 4;
5
6     @override                                                          // ← new
7     void initState() {                                                  // ← new
8       super.initState();                                                 // ← new
9       WidgetsBinding.instance.addObserver(this);                          // ← new
10    }                                                                     // ← new
11
12    @override                                                            // ← new
13    void dispose() {                                                      // ← new
14      WidgetsBinding.instance.removeObserver(this);                        // ← new
15      super.dispose();                                                      // ← new
16    }                                                                        // ← new
17
18    @override                                                              // ← new
19    void didChangeAppLifecycleState(AppLifecycleState state) {              // ← new
20      ref.read(gameSessionProvider.notifier).handleAppLifecycleChange(state);  // ← new
21    }                                                                          // ← new
22
23    // ...(_dispatch, build — unchanged from this lesson's own previous unit)...
24  }
```

### Isolate and Discard

Real, throwaway lab, `verification/lesson-40/lifecycle_probe_test.dart`,
run this session, then kept there — a minimal, generic
`LifecycleProbe`, standing in for `_SudokuAppState`'s own real, larger
subscription:

```dart
class LifecycleProbe extends StatefulWidget {
  const LifecycleProbe({super.key, required this.onChange});
  final void Function(AppLifecycleState) onChange;

  @override
  State<LifecycleProbe> createState() => _LifecycleProbeState();
}

class _LifecycleProbeState extends State<LifecycleProbe> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    widget.onChange(state);
  }

  @override
  Widget build(BuildContext context) => const SizedBox();
}
```

Real, captured output, from a real, simulated lifecycle change via
`tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused)`:

```
events: [AppLifecycleState.paused, AppLifecycleState.resumed]
```

This is exactly this lesson's own real mechanism, isolated: a real
`State` object, mixing in `WidgetsBindingObserver`, registering itself,
and genuinely receiving real, simulated OS-level events without any
actual device or OS involved at all.

### Mechanical Walkthrough

- `class _SudokuAppState extends ConsumerState<SudokuApp> with
  WidgetsBindingObserver {` — `with` (Lesson 12, reappearing, its own
  first real, non-doc-comment use): mixes real `WidgetsBindingObserver`
  behavior into `_SudokuAppState` *alongside* its existing real
  inheritance from `ConsumerState<SudokuApp>` — Dart's own real
  mechanism for adding a second real capability to a class without
  needing multiple inheritance, which Dart (correctly, per Lesson 12's
  own single-inheritance model) doesn't otherwise allow.
- `WidgetsBinding.instance.addObserver(this);` (inside `initState`) —
  this lesson's own new Header entry: registers this exact real object
  to actually start receiving real lifecycle events — without this real
  line, `didChangeAppLifecycleState` would never be called at all, no
  matter how it's overridden.
- `WidgetsBinding.instance.removeObserver(this);` (inside `dispose`) —
  the real, necessary inverse — the same real discipline
  `_ticker?.cancel()` (Lesson 28/35) already established: never leave a
  real subscription pointing at a `State` object that no longer exists.
- `void didChangeAppLifecycleState(AppLifecycleState state) { ref.read(gameSessionProvider.notifier).handleAppLifecycleChange(state); }`
  — `@override` (Lesson 25, reappearing) on a real, inherited hook
  (this lesson's Header entry); the real body does nothing itself except
  forward the real event straight to `GameSessionNotifier` — the widget
  layer reports the real fact; the notifier decides what it means for
  gameplay, the same real separation this whole lesson has now applied
  twice.
- `switch (lifecycleState) { case AppLifecycleState.paused || AppLifecycleState.inactive || AppLifecycleState.hidden: ... }`
  — this lesson's own new **OR-pattern** term: one real `case` label
  matching any of three real, distinct `AppLifecycleState` values,
  running one shared real body for all three, rather than writing the
  identical real body three separate times.
- `if (state.status == GameStatus.playing) { state.interrupt(); state = state.touched(); }`
  — a real, deliberate guard: only a genuinely `playing` session is
  interrupted; a session already `paused` on purpose is left alone —
  the OS backgrounding an app the player had already, deliberately
  paused shouldn't overwrite that real, intentional choice with a
  different real status.
- `case AppLifecycleState.resumed: if (state.status == GameStatus.interrupted) { state.resume(); state = state.touched(); }`
  — the real, matching inverse: only a session genuinely `interrupted`
  auto-resumes on foregrounding; a session the player had manually
  `paused` stays `paused` until they resume it themselves.
- `case AppLifecycleState.detached: break;` — a real, explicit, empty
  case — `detached` (the app is about to be, or has been, fully torn
  down) has no real, meaningful transition to make here at all; writing
  it explicitly, rather than omitting it, is what makes this real
  `switch` exhaustive over all five real `AppLifecycleState` values
  (confirmed this session by actually running `AppLifecycleState
  .values`), the identical real exhaustiveness guarantee Lesson 13 and
  Lesson 37 both already proved for a `sealed`/enum hierarchy.

### CS Lens

An app reacting to a real event it never requested, originating entirely
outside its own code, is a real, working instance of **inversion of
control**: `_SudokuAppState` doesn't poll the OS asking "am I still in
the foreground?" — it registers once, and the real framework calls it
back, on the real framework's own real, external schedule.

```
Also recognized in: a GUI button's own real click handler (the OS
decides when to call it, not the app), a web server's own real request
handler (the network decides when a request arrives), an interrupt
handler in a real operating system kernel (hardware decides when it
fires) — the same real "don't call us, we'll call you" shape recurring
at every real layer of a computing system
```

### SE Lens

The alternative — never modeling `interrupted` as its own real status at
all, and simply leaving a backgrounded app's session sitting in whatever
real status it was already in (`playing`) — was rejected because it
would make `elapsed` (Lesson 36) genuinely misleading: a player
backgrounded for a real hour, then returning, would see the *session's*
real elapsed time include that whole real hour, even though no real
gameplay happened during it. The real cost this lesson's own fix still
honestly carries, named plainly: `interrupt()`/`resume()` change
`_status` but do **not** touch `startTime` or pause `elapsed`'s own real
clock — a genuinely real, unfinished gap, left honestly rather than
silently, for whichever later lesson (Phase 6's own persistence work is
the natural real candidate) actually needs `elapsed` to be accurate
across a real interruption, not just correctly *named*.

### Commands Needed

- `flutter test test/lesson40_lifecycle_probe_test.dart` — the
  established `flutter test` invocation, given this unit's own specific
  real throwaway file.

### Run It

Real, run this session — the isolation lab's own output is shown above.
The complete, real, final verification, covering every unit this lesson
built:

```
dart run test/game_session_test.dart
```

33 real checks, 0 failed — including every real transition this lesson
added: terminal statuses, auto-start, illegal-transition rejection,
pause blocking further moves, auto-completion on the real winning move,
auto-failure after three real mistakes (and rejection of a fourth
attempt), and abandon/interrupt from both `playing` and `paused`.

```
flutter test test/game_session_lifecycle_test.dart
```

```
a real OS-level backgrounding interrupts a genuinely playing session — PASS
tapping the real Pause/Resume button toggles the shared session — PASS
```

The second of these two real tests failed once, honestly, before being
fixed: the new "Pause" button first rendered below the fixed 800×600
real test surface, the identical real class of failure Lesson 33 already
met with the number pad — fixed the same real way,
`tester.ensureVisible(find.text('Pause'))`, before tapping.

Full project verification: `flutter analyze .` — 25 info-level lints (the
same pre-existing categories, one more line total); zero errors. `flutter
test` — 22 real test files, all passing. Complete real output saved in
`verification/lesson-40/run-log.md`.

### Connect

`interrupted` is now a real, externally-triggered state, not just a name
on a diagram — proved by a real, simulated OS event moving a real,
shared session through it and back, exactly the way a real device would.

---

## Connect the Pieces

Follow one real, complete session — start to a real interruption and
back — through every unit this lesson built:

1. **Naming states** (Concept Unit 1): `GameStatus.notStarted` is where
   every real `GameSession` begins.
2. **Enforcing legal moves** (Concept Unit 2): the first real digit
   entered auto-transitions to `playing`, via the exact same
   `_transitionTo` that would have rejected a request to jump straight
   to `paused` from here.
3. **Automatic transitions and a real button** (Concept Unit 3): three
   real rejected moves in a row would auto-fail this session; instead, a
   real tap on "Pause" moves it to `paused`, and the real board/number
   pad stop accepting moves (`enterDigit`'s own real guard) until the
   player taps "Resume."
4. **A real, external transition** (Concept Unit 4): a real, simulated
   OS-level backgrounding event — reaching `_SudokuAppState` through a
   real `WidgetsBindingObserver`, forwarded to `GameSessionNotifier`,
   applied to `GameSession` through the identical real `_transitionTo`
   every other transition in this lesson already uses — moves a
   genuinely `playing` session to `interrupted`, and a real foregrounding
   event moves it straight back.

Every real transition this session can ever make — whether requested by
a tap, decided automatically by a domain rule, or reported by the host
OS itself — passes through the exact same one, real, explicit
`_legalTransitions` table. Phase 4 is now complete: this app has a real,
named, protected shape for every kind of state it holds — local, shared,
derived, and now, genuinely, its own lifecycle — closing the real,
honest gap Lesson 35 opened this whole phase by proving.
