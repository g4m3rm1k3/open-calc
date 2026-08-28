# Lesson 66: A Real, Shared Shape for Being In Progress

**What you will build.** A real, generic lifecycle wrapped around the
`GameSession<S, A>` this project's own immediately preceding lesson
already built — five real, named states (`notStarted`/`playing`/
`paused`/`finished`/`abandoned`) and the seven real methods
curriculum names to move between them: `create`, `start`, `pause`,
`resume`, `play`, `finish`, `abandon`. The transferable problem: a
game's own rules (this project's own real `GameEngine`) only ever
answer "what happens to the state if this action happens" — nothing
in that contract says whether an action is even allowed to happen
*right now*, whether a session can be walked away from and returned
to, or what "over" genuinely means as an event, not just a fact a
state happens to report.

**What you need to know first.** Every one of this lesson's own six
real contracts from the immediately preceding lesson —
`GameDefinition`, `GameSettings`, `GameState`, `GameResult`,
`GameEngine<S, A>`, and `GameSession<S, A>` itself. This project's own
existing, concrete, Sudoku-specific `GameStatus` (a real, seven-value
enum with an `isTerminal` field and a real, explicit
`_legalTransitions` map) and `GameSession`'s own real
`InvalidStateTransitionException` — this lesson's own new, generic
lifecycle is built the identical real way, applied more narrowly. A
real, custom domain error thrown instead of silently failing, already
established since this project's own domain layer first existed.

**Terms used in this lesson**

- **Finite state machine** — a real system with a fixed, small,
  enumerable set of real states and a real, explicit, closed set of
  legal transitions between them, where any transition not explicitly
  listed is real and forbidden. It exists so "what can happen next"
  is a real, provable, closed question, answerable by reading one real
  table, rather than an open one only discoverable by reading every
  real method that might change state and hoping none of them
  contradicts another.

**Objects and methods used**

- **`GameLifecycleStatus`**
  - *What it is:* a real, new, generic enum naming every real state one
    real, played `GameSession` can be in.
  - *Implementation:* `enum GameLifecycleStatus { notStarted
    (isTerminal: false), playing(isTerminal: false), paused
    (isTerminal: false), finished(isTerminal: true), abandoned
    (isTerminal: true); const GameLifecycleStatus({required this
    .isTerminal}); final bool isTerminal; }` — a real, enhanced enum
    (a real, const constructor and a real, per-value field), the
    identical real shape this project's own, concrete, Sudoku-specific
    `GameStatus` already established.
  - *Its use:* every real transition method this lesson adds reads or
    writes exactly one real `GameLifecycleStatus` value.
  - *Type:* a real, enhanced Dart enum.
  - *Responsibility:* name every real state a session can be in, and,
    via `isTerminal`, whether any further real transition can ever
    happen at all.
  - *Depends on:* nothing.
  - *Connects to:* read and written by every real method
    `GameSession<S, A>` adds this lesson, below.
  - *Shape:* Domain-layer, `game_platform/`.
- **`InvalidGameTransitionException`**
  - *What it is:* a real, custom domain error — a real, requested
    lifecycle transition, or a real `play` call, this session's own
    state machine does not allow from its real, current status.
  - *Implementation:* `class InvalidGameTransitionException implements
    Exception { InvalidGameTransitionException(this.message); final
    String message; }` — the identical real shape this project's own
    domain layer has already, repeatedly used for every custom real
    error it defines.
  - *Its use:* thrown by `_transitionTo` whenever a real, requested
    transition isn't present in `_legalTransitions`, and by `play`
    when called while not genuinely `playing`.
  - *Type:* a real class implementing the real, built-in `Exception`
    interface.
  - *Responsibility:* carry a real, human-readable explanation of
    exactly which real transition was rejected and why.
  - *Depends on:* nothing.
  - *Connects to:* real, run-proved thrown and caught in this lesson's
    own isolated lab, below.
  - *Shape:* Domain-layer, `game_platform/`.

## Concept Unit: GameLifecycleStatus and create()

### The Problem

`GameSession<S, A>`, as this project's own immediately preceding
lesson left it, has real state and a real engine, but no real notion
of its own lifecycle at all — nothing distinguishes a session that
hasn't begun from one mid-play, and building one still requires a
caller to call `engine.createInitialState` themselves.

> **Try it yourself first.** This project's own existing, concrete,
> Sudoku-specific `GameStatus` already names `notStarted` as its own
> real, first state, with real logic elsewhere deciding exactly when a
> session leaves it. Sketch, in your head, the smallest real enum that
> could name just enough real states — not necessarily all seven of
> Sudoku's own — to support curriculum's own seven real lifecycle
> method names, no more.

### Introducing the concept

A minimal, throwaway lab constructs a real session via the new,
real `create` factory and reads its own real, starting status:

```dart
final session = GameSession<GuessState, int>.create(
  definition: definition,
  settings: const GuessSettings(secret: 7, maxAttempts: 5),
  engine: GuessEngine(),
);
```

Run for real
(`verification/lesson-66/game_lifecycle_labs_test.dart`, Lab 1) —
because whether `create` genuinely calls `engine.createInitialState`
internally, rather than merely compiling, is exactly the kind of
real, observable behavior worth proving, not assuming:

```
session.status == GameLifecycleStatus.notStarted
session.state.attemptsLeft == 5
```

Real, direct proof: the real, returned session already holds a real,
fully-built `GuessState` (`attemptsLeft: 5`, from `GuessSettings
.maxAttempts`) without this lab's own code ever calling
`GuessEngine().createInitialState(...)` itself — and its own real
status is `notStarted`, not `playing`, confirming `create` genuinely
does not also start the session.

### Discard the throwaway example

This lab's own `session` instance is deleted here. What carries
forward: `GameSession.create(...)` is the real, correct, sufficient
way to build a fresh session from now on.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/game_lifecycle_status.dart` (new
  file); `project/lib/game_platform/domain/game_session.dart`
  (`GameSession` gains a real `_status` field and a real, new
  `GameSession.create` factory).
- **Change type** — add.
- **Location** — a new, real, standalone file; a new real factory
  constructor and field on the existing `GameSession` class.
- **Dependencies** — none new.

### The New Code

```dart
factory GameSession.create({required GameDefinition definition, required GameSettings settings, required GameEngine<S, A> engine}) {
  return GameSession(definition: definition, settings: settings, engine: engine, state: engine.createInitialState(settings));
}
```

### The Updated Project

`game_session.dart`'s own real, updated top, numbered, this Concept
Unit's own new lines marked:

```dart
 1  class GameSession<S extends GameState, A> {
 2    GameSession({required this.definition, required this.settings, required this.engine, required S state})
 3        : _state = state;
 4
 5    factory GameSession.create({                                        // ← new
 6      required GameDefinition definition,                                // ← new
 7      required GameSettings settings,                                    // ← new
 8      required GameEngine<S, A> engine,                                  // ← new
 9    }) {                                                                  // ← new
10     return GameSession(                                                 // ← new
11       definition: definition,                                          // ← new
12       settings: settings,                                              // ← new
13       engine: engine,                                                  // ← new
14       state: engine.createInitialState(settings),                      // ← new
15     );                                                                  // ← new
16   }                                                                     // ← new
17
18   final GameDefinition definition;
19   final GameSettings settings;
20   final GameEngine<S, A> engine;
21
22   S _state;
23   GameLifecycleStatus _status = GameLifecycleStatus.notStarted;          // ← new
```

Lines 1-4 and 18-22, this class's own real, already-existing shape,
are unchanged. Line 22 (real, new) gives every session a real, starting
`_status` the instant it's constructed, by either real constructor.
Lines 5-16, this Concept Unit's own real payload, add a second, real
way to build a `GameSession` — one that also handles calling
`engine.createInitialState` for you, rather than requiring the caller
to.

### Mechanical walkthrough

- `factory GameSession.create({...})` — a real, already-established
  Dart construct (`factory`, already used by this project's own
  `InMemoryPuzzleRepository`-adjacent code and elsewhere) declaring a
  real, named, alternate constructor that returns an already-built
  instance rather than implicitly constructing `this` — required here
  specifically because its own real body needs to *compute* a real
  argument (`engine.createInitialState(settings)`) before the real
  object can even be constructed, something an ordinary, generative
  constructor's own initializer list cannot do as directly.
- `engine.createInitialState(settings)` — the real, already-established
  method from this project's own `GameEngine` contract, called here,
  once, on the caller's behalf.
- `GameLifecycleStatus _status = GameLifecycleStatus.notStarted;` — a
  real, new field, defaulted to the real, enum value explained in full
  in this lesson's own Header, above.

### CS lens

A **finite state machine**, named in full as a Term in this lesson's
own Header, above, is what this Concept Unit begins building — a
system whose own real, current condition is always exactly one of a
real, small, enumerable set of named values. Also recognized in: a
traffic light; a TCP connection's own real, standard states
(`LISTEN`/`SYN_SENT`/`ESTABLISHED`/...); a regular-expression engine's
own internal states while matching a real string, character by
character; a vending machine's own real states (idle, coin inserted,
dispensing).

### SE lens

The real alternative here was letting `GameSession`'s own default
constructor keep being the only real way to build one, with `status`
left unset (`null`-able, or a plain, un-enumerated `bool started`
field) until the next Concept Unit's own real transition logic exists.
The real, chosen order — status field and `create` first, transitions
next — mirrors how a real finite state machine actually has to be
built: the real, complete, closed set of states must exist before any
real transition between them can be validated against it.

### Commands needed

None.

### Run it

Real, run output shown above, from
`verification/lesson-66/game_lifecycle_labs_test.dart`.

### Connect the pieces

Every real session now begins in a real, named, `notStarted` state —
the next Concept Unit builds the one real mechanism every later
transition in this lesson reuses.

---

## Concept Unit: start() and the transition mechanism

### The Problem

A session that begins `notStarted` needs a real, controlled way to
become `playing` — and every later real transition this lesson adds
will need the identical real kind of check: is the requested real move
actually legal from here?

> **Try it yourself first.** This project's own existing, concrete,
> Sudoku-specific `GameSession._transitionTo` already solves exactly
> this problem, for Sudoku's own seven states, with one real, shared,
> private method and one real, explicit map. What would the identical
> real shape look like, generically, for this lesson's own five, real,
> smaller set of states?

### Introducing the concept

No new isolated lab for the `Map<K, Set<V>>`-shaped transition table
itself — an already-established real Dart shape (`Map`/`Set` literals,
both fully explained earlier in this project). What genuinely needs
real, run proof is the specific, real behavior of throwing on an
illegal transition:

```dart
session.pause(); // called before session.start() — not yet a legal transition
```

Run for real (Lab 3, later in the same file, exercises this exact
real path alongside `pause`/`resume` — see that Concept Unit, below,
for its own full real output) — because whether a genuinely illegal
call really throws the real, correct exception type, rather than
silently doing nothing or corrupting real state, is exactly the kind
of error-path behavior this schema's own Verification Rule requires
real proof for.

### Discard the throwaway example

Not applicable — the real proof lives inside this lesson's own
permanent lab structure, exercised together with `pause`/`resume`,
below.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/game_platform/domain/game_lifecycle_status.dart`
  (`InvalidGameTransitionException` added);
  `project/lib/game_platform/domain/game_session.dart`
  (`_legalTransitions`, `_transitionTo`, `start` added).
- **Change type** — add.
- **Location** — a new, real, private static field and private method
  on `GameSession`; one new, real, public method.
- **Dependencies** — `GameLifecycleStatus`, from the Concept Unit
  above.

### The New Code

```dart
void _transitionTo(GameLifecycleStatus next) {
  final allowed = _legalTransitions[_status]!;
  if (!allowed.contains(next)) {
    throw InvalidGameTransitionException('cannot move from ${_status.name} to ${next.name}');
  }
  _status = next;
}

void start() => _transitionTo(GameLifecycleStatus.playing);
```

### The Updated Project

`GameSession`'s own real, updated body, numbered, this Concept Unit's
own new lines marked:

```dart
 1  static const Map<GameLifecycleStatus, Set<GameLifecycleStatus>>       // ← new
 2      _legalTransitions = {                                             // ← new
 3    GameLifecycleStatus.notStarted: {GameLifecycleStatus.playing},      // ← new
 4    GameLifecycleStatus.playing: {                                      // ← new
 5      GameLifecycleStatus.paused,                                       // ← new
 6      GameLifecycleStatus.finished,                                     // ← new
 7      GameLifecycleStatus.abandoned,                                    // ← new
 8    },                                                                   // ← new
 9    GameLifecycleStatus.paused: {                                       // ← new
10     GameLifecycleStatus.playing,                                      // ← new
11     GameLifecycleStatus.abandoned,                                    // ← new
12   },                                                                   // ← new
13   GameLifecycleStatus.finished: {},                                   // ← new
14   GameLifecycleStatus.abandoned: {},                                  // ← new
15 };                                                                     // ← new
16
17 GameLifecycleStatus get status => _status;                            // ← new
18 bool get isComplete => _state.isComplete;
19
20 void _transitionTo(GameLifecycleStatus next) {                        // ← new
21   final allowed = _legalTransitions[_status]!;                        // ← new
22   if (!allowed.contains(next)) {                                      // ← new
23     throw InvalidGameTransitionException(                             // ← new
24       'cannot move from ${_status.name} to ${next.name}',              // ← new
25     );                                                                 // ← new
26   }                                                                    // ← new
27   _status = next;                                                     // ← new
28 }                                                                      // ← new
29
30 void start() => _transitionTo(GameLifecycleStatus.playing);           // ← new
```

### Mechanical walkthrough

- `static const Map<GameLifecycleStatus, Set<GameLifecycleStatus>>
  _legalTransitions = {...}` — a real, already-established `static
  const` field (this project's own Sudoku-specific `GameSession`
  already used the identical real shape), a real `Map` literal whose
  own real keys are every real `GameLifecycleStatus` and whose own
  real values are the real `Set` of statuses legally reachable from
  each — a real, closed, exhaustive, explicit table, the concrete
  embodiment of this lesson's own **finite state machine** Term.
- `GameLifecycleStatus.finished: {}` / `GameLifecycleStatus.abandoned:
  {}` — two real, empty `Set` literals: a real, direct, explicit
  statement that nothing can ever transition out of either real
  status, matching `GameLifecycleStatus.isTerminal`'s own real value
  for both.
- `GameLifecycleStatus get status => _status;` — a real,
  already-established getter, exposing the real, current status for
  reading.
- `void _transitionTo(GameLifecycleStatus next)` — a real, new,
  private method, the one real place `_status` is ever reassigned.
- `final allowed = _legalTransitions[_status]!;` — a real,
  already-established map index (`[]`) plus the real, already-established
  null-assertion operator (`!`) — safe here since every real
  `GameLifecycleStatus` value genuinely has its own real entry in
  `_legalTransitions`.
- `if (!allowed.contains(next)) { throw InvalidGameTransitionException
  (...); }` — a real, already-established `Set.contains` call
  (already used elsewhere in this project), throwing the real, custom
  error explained in full in this lesson's own Header, above, when the
  real, requested transition isn't in the real, allowed set.
- `_status = next;` — the one real, direct field reassignment in this
  entire class.
- `void start() => _transitionTo(GameLifecycleStatus.playing);` — a
  real, new, public, single-expression method (already-established
  arrow-function syntax), curriculum's own second named lifecycle
  method.

### CS lens

Not applicable beyond this lesson's own already-covered **finite state
machine** concept, above — `_transitionTo` is that concept's own real,
concrete, load-bearing mechanism, not a second, separate hard concept.

### SE lens

The real alternative here was a real, scattered set of `if`
statements, one per real method, each independently checking whatever
real conditions that specific transition happened to need — real,
working code, at the real, serious cost of every real rule about
"what can follow what" living in a different real place, with no
single real spot to read the whole, real, legal shape of this
lifecycle at a glance, and a real, growing risk that two real methods
quietly disagree about whether some transition is legal. One real,
shared, explicit table, read by one real, shared method, is exactly
what this project's own, concrete Sudoku `GameSession` already proved
works, reused here, not re-derived.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson lab run, below.

### Connect the pieces

A real session can now genuinely begin — the next Concept Unit adds
the real way to step away from one, and back.

---

## Concept Unit: pause() and resume()

### The Problem

A real, `playing` session currently has no real way to be set aside
and returned to later — only, so far, a one-way trip from `notStarted`
to `playing`.

> **Try it yourself first.** `_legalTransitions`'s own real table,
> already built in the Concept Unit above, already lists `paused` as a
> real, legal destination from `playing`, and `playing` as a real,
> legal destination from `paused` — a genuine, real, two-way real
> edge. Given `_transitionTo` and `start()`'s own real, one-line shape
> already exist, what real, new code do `pause`/`resume` actually
> need?

### Introducing the concept

No new isolated lab — `pause`/`resume` reuse the identical real
`_transitionTo` mechanism the Concept Unit above already proved for
real; per the Recursive Concept Extraction Rule, this is a real,
reappearing application of an already-taught mechanism, not a new
concept needing its own fresh lab.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_session.dart`.
- **Change type** — add.
- **Location** — two new, real, public methods, beside `start`.
- **Dependencies** — `_transitionTo`, from the Concept Unit above.

### The New Code

```dart
void pause() => _transitionTo(GameLifecycleStatus.paused);
void resume() => _transitionTo(GameLifecycleStatus.playing);
```

### The Updated Project

`GameSession`'s own real, three lifecycle-start methods together,
numbered:

```dart
1  void start() => _transitionTo(GameLifecycleStatus.playing);
2  void pause() => _transitionTo(GameLifecycleStatus.paused);          // ← new
3  void resume() => _transitionTo(GameLifecycleStatus.playing);        // ← new
```

### Mechanical walkthrough

- `void pause() => _transitionTo(GameLifecycleStatus.paused);` — the
  identical real, already-established shape as `start`, targeting a
  real, different destination status.
- `void resume() => _transitionTo(GameLifecycleStatus.playing);` — the
  identical real shape again; real and genuinely reaches the identical
  real destination `start` does (`playing`), from a real, different
  origin (`paused` rather than `notStarted`) — `_legalTransitions`
  itself, not this method's own body, is what actually enforces that
  distinction.

Real, run proof (`verification/lesson-66/game_lifecycle_labs_test.dart`,
Lab 3) that this real distinction genuinely holds:

```
session.play(3);       // real, auto-starts: notStarted → playing
session.pause();       // real: playing → paused
session.play(4);       // real, genuinely throws InvalidGameTransitionException
session.resume();      // real: paused → playing
session.play(4);       // real, genuinely succeeds now
```

The real, rejected `play` call while paused left `state.attemptsLeft`
completely unchanged (`4`, not `3`) — real, direct proof the real
rejection happened *before* any real state change was attempted, not
after.

### CS lens

Not applicable — reuses this lesson's own already-covered finite state
machine mechanism.

### SE lens

The real alternative here was giving `pause`/`resume` their own,
separate, real validation logic instead of reusing `_transitionTo` —
real, more code, for zero real benefit, since both real transitions
are exactly the same *kind* of operation `start` already is. Reuse
here isn't merely convenient; it's what keeps every real transition
in this class provably consistent with the identical, one, real,
shared table.

### Commands needed

None.

### Run it

Real, run output shown above.

### Connect the pieces

A real session can now genuinely be set aside and picked back up — the
next Concept Unit is where a real session actually does something
while it's playing.

---

## Concept Unit: play()

### The Problem

Every method built so far moves between real, named states — none of
them actually advances the real, underlying game. This project's own
immediately preceding lesson's own real `apply` method did that, but
with zero real regard for whether the session was even in a state
that should allow it.

> **Try it yourself first.** If a real digit could be entered into
> this app's own real Sudoku board while the real session was
> genuinely `paused`, what real, concrete harm could actually result?
> Sketch, in your head, the smallest real guard `play` would need,
> given it already has real access to `_status`.

### Introducing the concept

A minimal, throwaway lab drives `play` through a real win:

```dart
session.play(3);
session.play(9);
session.play(7); // the real, correct secret
```

Run for real (Lab 4) — because the specific, real moment `status`
flips from `playing` to `finished`, and whether that happens
*automatically*, is exactly the kind of real, observable, non-obvious
behavior this schema requires proof for, not confidence alone:

```
after session.play(7): session.status == GameLifecycleStatus.finished
                        session.isComplete == true
```

Real, direct proof: nothing in this lab ever calls `session.finish()`
directly — `play`'s own real body does, automatically, the instant the
resulting state reports itself complete.

### Discard the throwaway example

This lab's own specific sequence of guesses is discarded; `play`
itself is real, permanent project code.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_session.dart`
  (`play` added, replacing the previous, real `apply` method from this
  project's own immediately preceding lesson).
- **Change type** — replace (a real, deliberate rename and enrichment,
  not an addition alongside the old method).
- **Location** — `GameSession`, replacing `apply`.
- **Dependencies** — `finish`, from the next Concept Unit — shown here
  already landed, since `play`'s own real body calls it.

### The New Code

```dart
void play(A action) {
  if (_status == GameLifecycleStatus.notStarted) {
    start();
  }
  if (_status != GameLifecycleStatus.playing) {
    throw InvalidGameTransitionException('cannot play while ${_status.name}');
  }
  _state = engine.apply(_state, action);
  if (_state.isComplete) {
    finish();
  }
}
```

### The Updated Project

`GameSession`'s own real, final method, in full, numbered — the real,
direct replacement for this project's own immediately preceding
lesson's `apply`:

```dart
1  void play(A action) {
2    if (_status == GameLifecycleStatus.notStarted) {                     // ← new
3      start();                                                            // ← new
4    }                                                                     // ← new
5    if (_status != GameLifecycleStatus.playing) {                        // ← new
6      throw InvalidGameTransitionException('cannot play while ${_status.name}'); // ← new
7    }                                                                     // ← new
8    _state = engine.apply(_state, action);
9    if (_state.isComplete) {                                              // ← new
10     finish();                                                          // ← new
11   }                                                                     // ← new
12 }
```

Line 8, this method's own real, original job, is unchanged — the real
call into `engine.apply` this project's own immediately preceding
lesson already built. Every other line is new: real, automatic
starting; a real, explicit rejection while not genuinely playing; and
real, automatic finishing.

### Mechanical walkthrough

- `if (_status == GameLifecycleStatus.notStarted) { start(); }` — a
  real, already-established `if` calling the real, already-established
  `start` method — real, direct proof (Lab 2) that a session's very
  first real `play` call needs no separate, prior `start()` call at
  all.
- `if (_status != GameLifecycleStatus.playing) { throw
  InvalidGameTransitionException(...); }` — a real guard catching every
  other real, non-playable status (`paused`, `finished`, `abandoned`)
  — reached only if the line above didn't already resolve `notStarted`
  into `playing`.
- `_state = engine.apply(_state, action);` — the real, already-established
  call this method inherits from its own predecessor.
- `if (_state.isComplete) { finish(); }` — a real, new, final check,
  calling the real `finish` method (shown in full in the next Concept
  Unit) the real instant the just-updated state reports itself
  complete.

### CS lens

Not applicable — `play`'s own real logic composes constructs already
covered (guards, delegation, the finite state machine); no new hard
concept.

### SE lens

The real, honest, deliberate choice recorded here: `apply` (Lesson
65's own real method) was **removed**, not kept alongside `play` as a
real, separate, lower-level option — real, working code either way,
but keeping both would let real, calling code bypass this class's own
real lifecycle guarantees entirely, silently mutating state while
paused or finished. `GameSession`'s own real job (the one, controlled
place state can change) only holds if `play` really is the *only* real
way to advance it.

### Commands needed

None.

### Run it

Real, run output shown above.

### Connect the pieces

A real session can now genuinely be played, automatically starting and
automatically finishing itself — the final Concept Unit gives it the
one real ending `play` doesn't reach on its own.

---

## Concept Unit: finish() and abandon()

### The Problem

`play` already calls a real `finish` internally — but nothing yet
defines what that real method actually does, and no real way exists
yet for a player to walk away from a session on purpose, rather than
finishing it by winning or losing.

> **Try it yourself first.** `_legalTransitions` already lists both
> `finished` and `abandoned` as real, legal destinations from
> `playing`, both mapped to a real, empty destination set of their own.
> What does that real, empty set, on both, already guarantee about
> what happens after either one — without a single new line of real
> code needed to enforce it?

### Introducing the concept

No new isolated lab — the identical, already-proved `_transitionTo`
mechanism. What genuinely needs real, run proof is the real,
*terminal* guarantee itself:

```dart
final abandoned = _freshSession();
abandoned.play(1);
abandoned.abandon();
abandoned.resume(); // must genuinely throw
```

Run for real (Lab 5) — because "nothing can transition out of a
terminal state" is a real, load-bearing claim about this whole
lesson's own lifecycle, worth proving directly, not just implied by
an empty set literal:

```
abandoned.resume() → throws InvalidGameTransitionException
```

The identical real lab also confirms a genuinely `finished` session
(via a real win) rejects both a further `pause()` and a further
`play(...)` call — real, direct proof `GameLifecycleStatus.finished`'s
own empty transition set is honored identically regardless of *how*
a session reached it.

### Discard the throwaway example

This lab's own specific sessions are discarded; `finish`/`abandon`
themselves are real, permanent project code.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/lib/game_platform/domain/game_session.dart`.
- **Change type** — add.
- **Location** — two new, real, public methods, beside `pause`/`resume`.
- **Dependencies** — `_transitionTo`, already established.

### The New Code

```dart
void finish() => _transitionTo(GameLifecycleStatus.finished);
void abandon() => _transitionTo(GameLifecycleStatus.abandoned);
```

### The Updated Project

`GameSession`'s own real, complete set of five real transition
methods, together, numbered:

```dart
1  void start() => _transitionTo(GameLifecycleStatus.playing);
2  void pause() => _transitionTo(GameLifecycleStatus.paused);
3  void resume() => _transitionTo(GameLifecycleStatus.playing);
4  void abandon() => _transitionTo(GameLifecycleStatus.abandoned);      // ← new
5  void finish() => _transitionTo(GameLifecycleStatus.finished);        // ← new
```

### Mechanical walkthrough

- `void finish() => _transitionTo(GameLifecycleStatus.finished);` — the
  identical real, already-established shape as every sibling method;
  called both automatically (from `play`, per the Concept Unit above)
  and, real and available, directly — for a real, hypothetical future
  game whose own `GameEngine` never produces a genuinely complete
  state on its own, and needs an external, real signal instead.
- `void abandon() => _transitionTo(GameLifecycleStatus.abandoned);` —
  the identical real shape; real and distinct in *meaning* from
  `finish` (a real, deliberate, player-chosen ending versus a real,
  natural one) despite an identical real mechanism — `GameResult`
  itself carries no real field distinguishing the two, an honest,
  real, minor gap this lesson leaves named, not fixed, since no real
  platform code yet needs that distinction.

### CS lens

Not applicable — reuses this lesson's own already-covered mechanism.

### SE lens

The real alternative here was one, single, real `end()` method instead
of two real, separate `finish`/`abandon` ones, with a real, boolean
parameter distinguishing them (`end(abandoned: true)`) — real, one
fewer public method, at the real cost of a real, boolean parameter
whose own meaning isn't obvious from a call site alone (`end(true)`
reads far worse than `abandon()`). Two real, small, clearly-named
methods cost nothing extra in real behavior, and read honestly at
every real call site.

### Commands needed

None.

### Run it

Real, run output shown above.

### Connect the pieces

Every one of curriculum's own seven named lifecycle methods now
exists, real and working, built entirely on one real, shared,
explicit transition table.

---

## Connect the pieces

One real, concrete trace, start to finish, through every Concept Unit
this lesson built: a real "Guess the Number" session, paused midway,
resumed, and won.

1. `GameSession<GuessState, int>.create(...)` builds a real session —
   `status: notStarted`, `state.attemptsLeft: 5` — without its own
   caller ever touching `engine.createInitialState` directly.
2. `session.play(3)` — a real, wrong guess — auto-starts the session
   (`notStarted → playing`), then delegates to `engine.apply`, landing
   `attemptsLeft: 4`.
3. `session.pause()` moves it to real `paused`; a real, attempted
   `session.play(4)` here genuinely throws
   `InvalidGameTransitionException`, and `state.attemptsLeft` stays
   real and unchanged at `4`.
4. `session.resume()` moves it back to real `playing`; `session.play
   (4)` now genuinely succeeds, landing `attemptsLeft: 3`.
5. `session.play(7)` — the real, correct secret — succeeds, and,
   because the resulting real state reports `isComplete: true`,
   `play`'s own real, final check calls `finish()` automatically —
   `status` becomes real `finished`, with no separate, explicit call
   from outside ever needed.
6. Any further real `session.play(...)` or `session.pause()` call now
   genuinely throws — `GameLifecycleStatus.finished`'s own real, empty
   transition set, established the moment this lesson's own first
   Concept Unit built the table, guarantees it.

Five real, named states, seven real, curriculum-named methods, one
real, shared, explicit table — a genuinely different real game than
Sudoku, played start to finish, entirely through this lesson's own new
lifecycle, never once needing to know Sudoku exists.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. One real, throwaway lab file
(`verification/lesson-66/game_lifecycle_labs_test.dart`, five real
labs, reusing the identical "Guess the Number" toy game from this
project's own immediately preceding lesson) ran once — every real lab
passed on its first real run.

A real, deliberate, breaking design decision, recorded honestly: this
project's own immediately preceding lesson's own real `apply` method
was removed outright, replaced by this lesson's own richer `play` —
not kept alongside it, since keeping both would let real, calling code
bypass this class's own real lifecycle guarantees entirely. That
immediately preceding lesson's own real, already-saved throwaway lab
still references the old `apply` name, left genuinely unchanged, as an
honest, historical record of what that lesson's own code looked like
at the time — this project's own Verification Rule Persistence
convention treats a saved lab as a record, never a continuously
rebuilt mirror of current code.

```
flutter analyze .
57 issues found. (ran in 5.9s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category, not only total count: zero new issues, zero new categories.

```
flutter test
...
00:23 +83: All tests passed!
```

83 real test-file-level checks, unchanged — this lesson's own real
proof lives entirely in its own throwaway lab, the identical, real,
deliberate scoping choice as the lesson before it. Full real script
and output saved to `verification/lesson-66/`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
