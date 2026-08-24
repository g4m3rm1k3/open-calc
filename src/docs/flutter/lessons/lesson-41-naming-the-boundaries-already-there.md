# Lesson 41: Naming the Boundaries Already There

**Architecture fundamentals**

## What you will build

Nothing new runs differently after this lesson — no new feature, no new
screen, no new test. What changes is that four real boundaries already
present in `project/lib/`, built without ever being named, get real
names: **Presentation**, **Application**, **Domain**, and
**Infrastructure**. This lesson proves, file by file, real import by
real import, that this app already obeys a real architectural rule —
"the domain doesn't know Flutter exists" — before ever being told to.
The transferable problem: most beginner codebases don't have these
boundaries at all, and the cost shows up later, not immediately — this
lesson is about learning to see a boundary that's already working, so
Lessons 42-48 can deliberately strengthen it instead of accidentally
breaking it.

## What you need to know first

- Lesson 34 ("Connecting UI to the Sudoku engine") — curriculum's own
  first architectural point, `Flutter UI → Game/application layer →
  Sudoku engine`, made literal and real when `SudokuBoard` needed zero
  changes to become the real app's own rule enforcement.
- Lesson 37 ("One Real Direction for Every User Action") — the real
  `User action → Intent → State change → New state → UI` pipeline,
  restated below, plus `GameIntent`/`SelectCellIntent`/`EnterDigitIntent`.
- Lesson 38 ("Choosing Riverpod") — `GameSessionNotifier`, `Notifier`,
  `ProviderScope`, and how a widget actually reaches shared state.
- Lesson 39 ("Naming and Injecting a Dependency") — `Clock`/`SystemClock`,
  and the real, hard-won discovery that `clock.dart` itself must not
  depend on Riverpod even though the thing that *wires* it does.
- Lesson 40 ("A Real State Machine for a Game Session") — `GameSession`
  owning every real domain rule (`enterDigit`, `_legalTransitions`,
  `registerMistake`), with `GameSessionNotifier` shrunk to a thin real
  `try`/`finally` adapter around it.
- Lesson 11 ("A Shape of Data You Define") — Dart's own per-file
  privacy/library model, reused below to explain what an `import`
  actually connects.

## Pipeline diagram

This curriculum already established one real pipeline, in Lesson 37:

```
User action → Intent → State change → New state → UI
```

This lesson touches the **State change** stage specifically — not by
adding anything to it, but by naming *which real architectural layer*
that stage actually runs in, and which layers the other four stages run
in too. One concrete literal value carried through every stage, reused
from this project's own real, already-verified data (Lesson 21 first
proved cell `(4, 4)` is a naked single in the real milestone puzzle;
Lesson 31 hardcoded it as the selected cell; Lesson 34's own real test
placed `5` there successfully):

```
User action:   a real tap on the number-pad button labeled "5"
Intent:        EnterDigitIntent(5)
State change:  GameSessionNotifier.enterDigit(4, 4, 5)
                 → GameSession.enterDigit(4, 4, 5)
                 → SudokuBoard.placeDigit(4, 4, 5)
New state:     the real GameSession returned by GameSession.touched()
UI:            ref.watch(gameSessionProvider) rebuilds SudokuBoardView
                 with cell (4, 4) now showing "5"
```

## Terms used in this lesson

- **Layer (architectural layer)** — a real boundary drawn around a
  group of code by *what it is allowed to know about*, never by which
  folder it happens to live in. Exists because a codebase with no such
  boundary lets any file call any other file for any reason, so a
  change made for one real reason (a new Sudoku rule) and a change made
  for a completely different real reason (a new button color) end up
  tangled inside the same functions.
- **Presentation layer** — the layer whose real job is turning a
  person's actions into events the rest of the app understands, and
  turning the app's current state back into pixels. Exists so a
  completely different presentation — a web page, a console loop like
  Phase 1's own `sudoku_console.dart` — could replace this one without
  touching what the app actually *does*.
- **Application layer** — the layer that takes one real intent (Lesson
  37) and orchestrates it into a call on the domain layer, reporting
  back whether it worked, without deciding any real rule itself. Exists
  so "how a request gets routed to the rules" and "what the rules
  actually are" can change independently of each other.
- **Domain layer** — the layer holding this app's actual rules — real
  Sudoku legality, real session state transitions — with zero knowledge
  that Flutter, Riverpod, or any UI framework exists. Exists so the
  rules stay provably correct (Phase 2's own real, 8/8-tested engine)
  independent of whatever framework happens to display them.
- **Infrastructure layer** — the layer that talks to something genuinely
  outside this program's own memory — right now, just the real OS
  clock; later phases add a real database, a real network. Exists to
  keep "how do I get the current time" (a real, swappable technical
  detail) separate from "what does the current time mean for this game
  session" (a real domain decision).
- **Dependency direction** — which way a real `import` statement is
  allowed to point between layers: outer layers (Presentation,
  Infrastructure) may depend on inner ones (Domain), never the reverse.
  Exists because letting `sudoku_board.dart` import something from
  `main.dart` would make the real Sudoku rules depend on which button a
  player last clicked — genuinely nonsensical — and would also make the
  domain layer impossible to reuse without dragging all of Flutter along
  with it, which is exactly what Phase 1's own real, still-working,
  Flutter-free console app (`project/bin/sudoku_console.dart`) already
  proves this project has avoided.
- **Abstraction (reappearing, Lesson 39)** — a real, minimal interface
  naming *what* something does without saying *how*. This lesson reuses
  `Clock` as its own concrete example again: `DateTime now();`, with no
  mention anywhere in it of the real OS clock or of a test.
- **Import (Dart's own directive)** — a real statement at the top of a
  Dart file naming another file or package whose public declarations
  this file's own code is allowed to reference. Exists because a
  compiler has to know, before reading a single line of a file's real
  logic, exactly which other files' names that logic is entitled to
  use — without it, the name `SudokuBoard` inside `game_session.dart`
  would just be an undefined identifier.
- **Library (Dart's own per-file compilation unit, reappearing, Lesson
  11)** — in Dart, every `.dart` file is, by default, its own library;
  `import` is what connects one library's public declarations to
  another's. Reappears here because "does file A import file B" is
  exactly the same real question as "does library A depend on library
  B," and this lesson's entire proof rests on reading that dependency
  graph correctly, real file by real file.
- **The pipe operator (`|`, reappearing, Lesson 2)** — connects one
  PowerShell command's real output objects directly into a second
  command's real input, without a temporary file in between. Reappears
  in this lesson's own Concept Unit 5 command.
- **Regular expression, and its `^` anchor** — a real, compact pattern
  language for matching text, supported natively by `Select-String`'s
  own `-Pattern` argument; `^` is one real metacharacter inside that
  language, meaning "only match at the very start of a line." Used in
  this lesson's own search pattern, `^import`, so a real Dart file whose
  import line genuinely starts with the word `import` matches, while a
  line that merely contains the letters "import" somewhere in the
  middle of a comment or string does not.
- **Sealed class (reappearing, Lesson 37)** — a real Dart 3 class
  modifier declaring a closed, completely known set of subclasses, all
  required to live in the same real library. Exists so a `switch` over
  that type (like `_dispatch`'s own, reappearing below) can be checked
  for real, compile-time exhaustiveness — every real case handled,
  nothing silently missed.
- **Object pattern (reappearing, Lesson 37)** — Dart 3's own real
  pattern-matching syntax, `TypeName(field: binding)`, used inside a
  `switch` `case` to both test a value's real runtime type and pull its
  real fields out into new local bindings in one step, rather than a
  separate type check followed by a separate manual field read.
- **Generic type parameter (reappearing, Lesson 10)** — a real, named
  placeholder (`<T>`) standing in for a specific real type, filled in at
  the point a generic class or function is actually used. Reappears in
  this lesson's own `Provider<Clock>` and `Notifier<GameSession>`.
- **Factory constructor (reappearing)** — a real Dart constructor
  declared with the `factory` keyword, free to return an existing
  instance or run arbitrary real logic before returning a new one,
  unlike an ordinary constructor, which always builds a fresh instance
  of exactly its own class. `DateTime.now()`, this lesson's own real
  example, is declared this way in `dart:core`.

## Objects and methods used

- **`SudokuApp` / `_SudokuAppState`**
  - *What it is:* the real, top-level Flutter widget and its real,
    private `State` subclass — everything the reader taps, sees, and
    scrolls in this app.
  - *Implementation:* `class SudokuApp extends ConsumerStatefulWidget`;
    `class _SudokuAppState extends ConsumerState<SudokuApp> with
    WidgetsBindingObserver` (`project/lib/main.dart`, unchanged since
    Lesson 40).
  - *Its use:* the concrete, real evidence this lesson's Concept Unit 1
    reads for what a presentation-layer class actually contains — and,
    just as importantly, what it deliberately does *not* contain.
  - *Type:* a class — `ConsumerStatefulWidget`'s own concrete subclass,
    plus its paired `ConsumerState` subclass.
  - *Responsibility:* build the real widget tree from the current
    `GameSession`, turn every real tap into a `GameIntent`, and forward
    every real OS-level app-lifecycle change to the shared session — and
    nothing else; no Sudoku rule, no session-status rule, is decided
    inside this class.
  - *Depends on:* `ref` (a real `WidgetRef`, supplied by
    `ConsumerState`) to reach `gameSessionProvider`; `SudokuBoardView`
    and `NumberPadView` to render; every real `GameIntent` subtype to
    know what a tap can mean.
  - *Connects to:* called by Flutter's own real framework (`runApp`,
    Lesson 25's own `WidgetsBinding.drawFrame`) whenever a rebuild is
    due; calls into `GameSessionNotifier` via
    `ref.read(gameSessionProvider.notifier)` for every real state
    change; reads `ref.watch(gameSessionProvider)` for the state it
    renders.
  - *Shape:* the outermost, real public surface of the Presentation
    layer — the one place a completely different UI would have to be
    substituted if this app ever grew a second real front end.

- **`GameIntent` / `SelectCellIntent` / `EnterDigitIntent` /
  `TogglePauseIntent` (reappearing, Lesson 37)**
  - *What it is:* a real, closed (`sealed`) family of plain data classes
    naming every real thing a player can ask this app to do.
  - *Implementation:* `sealed class GameIntent {}`, each real subtype
    holding only the plain data its own action needs (`row`/`col`;
    `digit`; nothing at all) — `project/lib/game_intent.dart`.
  - *Its use:* the real, shared vocabulary Concept Unit 1 shows crossing
    the boundary from Presentation into Application — a widget never
    calls `GameSessionNotifier` by name; it only ever builds one of
    these.
  - *Type:* a `sealed class` and its real, closed set of subclasses.
  - *Responsibility:* represent a real user action as inert data, with
    zero behavior of its own — deciding what to *do* about an intent is
    explicitly not this class's job.
  - *Depends on:* nothing — no import at all in `game_intent.dart`,
    confirmed by this lesson's own real Concept Unit 5 evidence, below.
  - *Connects to:* built by `_SudokuAppState`'s own real gesture
    callbacks; consumed by `_SudokuAppState._dispatch`'s own real
    `switch` (Lesson 37), which is the one place a `GameIntent` ever
    turns into an actual call.
  - *Shape:* the real, shared contract sitting exactly on the boundary
    between the Presentation and Application layers.

- **`GameSessionNotifier` (reappearing, Lesson 38, 40)**
  - *What it is:* the real, single class that owns the app's one real,
    shared `GameSession`, and every real method allowed to change it.
  - *Implementation:* `class GameSessionNotifier extends
    Notifier<GameSession>` (`project/lib/game_session_provider.dart`);
    real methods `build`, `enterDigit`, `togglePause`,
    `handleAppLifecycleChange`.
  - *Its use:* Concept Unit 2's own central evidence for what an
    application-layer class actually does: orchestrate, never decide.
  - *Type:* a class extending Riverpod's own real `Notifier<T>`.
  - *Responsibility:* receive a real request (a digit entry, a pause
    toggle, an OS lifecycle change), forward it to `GameSession`'s own
    real domain methods, and always tell Riverpod something changed
    afterward — never itself deciding whether a move is legal or a
    transition is allowed.
  - *Depends on:* a real `Clock`, read once per rebuild from
    `ref.watch(clockProvider)`, handed straight into the `GameSession`
    it constructs.
  - *Connects to:* called by `_SudokuAppState._dispatch`; calls real
    methods on `GameSession` (`enterDigit`, `pause`, `resume`,
    `interrupt`); reassigns `state` (Riverpod's own real change-
    notification mechanism), which every widget watching
    `gameSessionProvider` reacts to.
  - *Shape:* the real, public seam of the Application layer — the one
    place Presentation code is allowed to reach in order to change
    shared state.

- **`clockProvider` (reappearing, Lesson 39)**
  - *What it is:* the one real, app-wide place a `Clock` is actually
    obtained from.
  - *Implementation:* `final clockProvider = Provider<Clock>((ref) =>
    SystemClock());` (`project/lib/game_session_provider.dart`) — a
    real Riverpod `Provider<Clock>` value, not a class of its own.
  - *Its use:* Concept Unit 2's own second piece of evidence — the
    Application layer is where a concrete `Clock` gets chosen, not the
    Domain layer, which only ever sees the abstract `Clock` type.
  - *Type:* a top-level, real, immutable value of Riverpod's own
    `Provider<Clock>` type, constructed once via a real generic
    constructor call.
  - *Responsibility:* answer "give me the current real `Clock`" exactly
    once per real `ProviderContainer`, and hand back the same real
    `SystemClock` instance every time asked, unless a test overrides it.
  - *Depends on:* `SystemClock`'s own real, zero-argument constructor.
  - *Connects to:* read by `GameSessionNotifier.build()`; overridden in
    real tests (Lesson 39) via
    `clockProvider.overrideWithValue(fakeClock)`.
  - *Shape:* the exact real seam where the Infrastructure layer's
    concrete implementation gets wired into the Application layer —
    dependency injection, made literal.

- **`GameSession` (reappearing, Lesson 36, 40)**
  - *What it is:* the real, single owner of everything one played game
    of Sudoku needs to remember about itself beyond the board's own
    rules.
  - *Implementation:* `class GameSession` (`project/lib/game_session.dart`)
    — real fields `board`, `difficulty`, `startTime`, `_mistakes`,
    `_hints`, `_status`; real methods `enterDigit`, `pause`, `resume`,
    `abandon`, `interrupt`, `registerMistake`, `useHint`, `touched`.
  - *Its use:* Concept Unit 3's own central evidence for what a
    domain-layer class actually contains — every real rule this app
    enforces about a session lives here, nowhere else.
  - *Type:* a plain class — no `extends`, no `implements`, no framework
    base class of any kind.
  - *Responsibility:* decide, and enforce, every real rule about what a
    session is allowed to do next: which state transitions are legal
    (`_legalTransitions`), when a mistake ends the game
    (`maxMistakesBeforeFailure`), when entering a digit is even allowed.
  - *Depends on:* a real `SudokuBoard` (handed in, never constructed
    internally) and a real `Clock` (same) — both abstractions or
    already-real domain types, never a concrete infrastructure class.
  - *Connects to:* called by `GameSessionNotifier`; calls real methods
    on `SudokuBoard` (`placeDigit`, `isComplete`) and on `Clock`
    (`now()`); never calls anything from `package:flutter` or
    `package:flutter_riverpod`, confirmed by this lesson's own Concept
    Unit 5 evidence.
  - *Shape:* the real, structural center of the Domain layer.

- **`SudokuBoard` (reappearing, Lesson 11, 17, 18, 19, 20, 21, 24)**
  - *What it is:* the real, working 9x9 Sudoku engine — Phase 2's own
    milestone, unmodified since Lesson 24.
  - *Implementation:* `class SudokuBoard` (`project/lib/sudoku_board.dart`)
    — real methods `placeDigit`, `isValidMove`, `candidatesFor`, `solve`,
    `classifyDifficulty`, `isComplete`, and more.
  - *Its use:* Concept Unit 3's second piece of domain-layer evidence —
    the only file this whole project imports whose entire real dependency
    is `dart:math`, nothing else.
  - *Type:* a plain class, same real shape as `GameSession`.
  - *Responsibility:* enforce every real Sudoku rule — row/column/box
    uniqueness, given-clue locking, valid digit range — through its own
    public methods.
  - *Depends on:* nothing beyond `dart:math`'s own real `Random` class,
    used only by `solve`/`generateComplete` for shuffled candidate
    order.
  - *Connects to:* called by `GameSession` and, before Lesson 34, called
    directly by the Phase 1 console app — real, concrete evidence the
    same domain class already serves two completely different real
    presentation layers.
  - *Shape:* the deepest real point of the Domain layer — the class with
    the fewest real dependencies of anything in this project.

- **`GameStatus` (reappearing, Lesson 40)**
  - *What it is:* the real, enhanced enum naming every state one played
    session can be in.
  - *Implementation:* `enum GameStatus { notStarted(...), playing(...),
    ...}` with a real `const` constructor and an `isTerminal` field
    (`project/lib/game_status.dart`).
  - *Its use:* Concept Unit 3's third piece of evidence — a file with
    zero import statements at all, the smallest possible real proof that
    a domain concept need not depend on anything.
  - *Type:* an enhanced `enum` — Lesson 13's own real shape, reused.
  - *Responsibility:* name the fixed, closed set of real states a
    session can occupy, and record, per state, whether it's terminal.
  - *Depends on:* nothing.
  - *Connects to:* read and assigned by `GameSession._transitionTo`;
    read by `_SudokuAppState.build` to decide whether to show a real
    Pause/Resume button.
  - *Shape:* a small, self-contained piece of Domain-layer vocabulary.

- **`Clock` (reappearing, Lesson 39)**
  - *What it is:* the real, minimal abstraction naming "the ability to
    report the current real moment," with zero commitment to *how*.
  - *Implementation:* `abstract class Clock { DateTime now(); }`
    (`project/lib/clock.dart`).
  - *Its use:* Concept Unit 4's own central evidence — the one real
    place the Domain layer names a dependency on the outside world
    without actually depending on any concrete outside-world code.
  - *Type:* an `abstract class` with exactly one real, unimplemented
    instance method.
  - *Responsibility:* define the contract "give me `DateTime.now()`,
    however you get it" — nothing about *which* implementation is used.
  - *Depends on:* nothing — no import at all in `clock.dart`, this
    lesson's own strongest single piece of evidence.
  - *Connects to:* implemented by `SystemClock` (real) and, in tests,
    by `FakeClock` (Lesson 39, not re-shown here); read by `GameSession`
    through its own constructor parameter, never constructed by
    `GameSession` itself.
  - *Shape:* the real seam between the Domain layer (which only ever
    sees `Clock`) and the Infrastructure layer (which is the only place
    a concrete implementation exists).

- **`SystemClock` (reappearing, Lesson 39)**
  - *What it is:* the one, real, production implementation of `Clock` —
    genuinely reads the real system clock.
  - *Implementation:* `class SystemClock implements Clock { @override
    DateTime now() => DateTime.now(); }` (`project/lib/clock.dart`).
  - *Its use:* Concept Unit 4's second piece of evidence — the one real
    class in this entire project that actually calls `DateTime.now()`.
  - *Type:* a concrete class, real `implements Clock`.
  - *Responsibility:* answer `now()` by making one real call into the
    Dart runtime's own system clock — nothing more, no caching, no
    formatting.
  - *Depends on:* `dart:core`'s own real, built-in `DateTime.now()`
    static-feeling constructor call.
  - *Connects to:* constructed exactly once, inside `clockProvider`
    (Application layer); called by `GameSession.elapsed`'s own real
    `_clock.now()` read, indirectly, through the `Clock` interface —
    `GameSession` never holds a reference typed `SystemClock`, only
    `Clock`.
  - *Shape:* the real, concrete occupant of the Infrastructure layer —
    currently the only one this project has.

### Everything else in the file, not this lesson's subject but still explained

- **`Notifier<T>`**
  - *What it is:* Riverpod's own real base class for a piece of shared,
    mutable, observable state.
  - *Implementation:* an abstract, generic class declaring an abstract
    `T build()` method and a real, inherited `state` getter/setter pair
    that notifies real listeners on every assignment.
  - *Its use:* the real, external class `GameSessionNotifier` (Concept
    Unit 2) extends — named here on its own because Concept Unit 2's own
    walkthrough calls two of its real, distinct inherited members
    (`state`'s getter and its setter), not just one.
  - *Type:* an abstract, generic class — `Notifier<GameSession>` in this
    project's own real, filled-in usage.
  - *Responsibility:* hold exactly one real, current value of type `T`,
    and notify every real, subscribed widget or `ProviderContainer`
    listener the instant that value is reassigned.
  - *Depends on:* a concrete subclass to supply `build()`'s own real
    initial value and whatever real methods actually mutate `state`.
  - *Connects to:* wired into the app by a real `NotifierProvider`
    (Lesson 38, not re-shown here); read by any widget calling
    `ref.watch`/`ref.read` on that provider.
  - *Shape:* Riverpod's own real library code — external to this
    project, sitting exactly at the seam the Application layer uses to
    plug into Flutter's own rebuild mechanism.

- **`DateTime` / `DateTime.now()`**
  - *What it is:* `dart:core`'s own real, built-in class representing a
    single, real point in time.
  - *Implementation:* `class DateTime` with a real `factory
    DateTime.now()` constructor (Terms, above) returning the current
    real moment in this process's own local time zone.
  - *Its use:* the one real call `SystemClock.now()` (Concept Unit 4)
    makes — the actual, concrete point this whole project's real time-
    reading ultimately reaches.
  - *Type:* a class, with `now()` specifically a real factory
    constructor, not an ordinary instance or static method.
  - *Responsibility:* represent one real moment, and, via `now()`,
    produce a fresh one reflecting the real, current system clock at
    the exact instant it's called.
  - *Depends on:* the real host operating system's own clock.
  - *Connects to:* called only by `SystemClock.now()` in this project;
    never called directly by `GameSession` or any other Domain-layer
    file, which is Concept Unit 4's own central claim.
  - *Shape:* sits entirely outside this project's own code — the real,
    external resource the Infrastructure layer exists specifically to
    reach on the Domain layer's behalf.

- **`Select-String`**
  - *What it is:* a real PowerShell cmdlet that searches text for a
    pattern — conceptually the same real job Unix's `grep` does.
  - *Implementation:* `Select-String -Path <files> -Pattern <regex>`;
    returns real `MatchInfo` objects, one per matching line, each
    carrying a real `Filename` and `Line` property among others.
  - *Its use:* the one real diagnostic tool Concept Unit 5 depends on to
    turn "the domain doesn't know Flutter exists" from an assertion into
    inspected, proven evidence.
  - *Type:* a cmdlet — PowerShell's own real term for a built-in
    command, implemented as a real .NET method under the hood, not a
    Dart construct at all.
  - *Responsibility:* read every real file matching `-Path`, test every
    real line against `-Pattern`, and emit one real match object per hit
    — nothing about formatting that output for a human to read.
  - *Depends on:* a real filesystem glob (`-Path`) and a real regular
    expression (`-Pattern`).
  - *Connects to:* its own real output is piped, via `|` (above), into
    `Select-Object`.
  - *Shape:* outside this app's own architecture entirely — a real
    terminal tool used only this session, to verify a claim about the
    app's architecture, never part of `project/` itself.

- **`Select-Object`**
  - *What it is:* a real PowerShell cmdlet that reshapes its real input
    objects down to only the requested properties.
  - *Implementation:* `Select-Object -Property <names>` — returns real,
    new objects carrying only the named properties.
  - *Its use:* trims `Select-String`'s own real, verbose default match
    objects down to just `Filename` and `Line`, so the real output is
    readable as evidence rather than as a raw object dump.
  - *Type:* a cmdlet, same real kind as `Select-String`.
  - *Responsibility:* project a real object down to a named subset of
    its own properties.
  - *Depends on:* real input objects arriving via the pipe from
    `Select-String`.
  - *Connects to:* receives from `Select-String`; its own real output is
    this lesson's Concept Unit 5 evidence, quoted verbatim below.
  - *Shape:* same as `Select-String` — a real terminal tool, not part of
    this app.

---

## Concept Unit 1: The Presentation Layer

### The Problem

`main.dart` is the one real file every tap in this app actually starts
in. It builds `SudokuBoardView`, it builds `NumberPadView`, it reads the
real, current `GameSession` to decide what to draw. The real question
this unit answers: given how much this file clearly *knows about* the
game (it reads `session.status`, it shows a Pause button only sometimes,
it shows the real board), does it also *decide* any of the game's real
rules itself?

> **Socratic prompt:** Open `_SudokuAppState._dispatch` in your head
> (Lesson 37) — when a real `EnterDigitIntent` arrives, does that method
> itself ever check whether the digit is between 1 and 9, or whether it
> conflicts with another digit already in that row? What does it do
> instead? Second: `SudokuBoardView` and `NumberPadView` (Lessons 31,
> 33) only ever call `onCellTap`/`onDigitTap` callbacks — they never
> call `board.placeDigit` directly themselves. Given what you already
> know about `GameIntent` (Lesson 37), why might that be deliberate?
> Third: if you deleted every widget in this app and replaced it with a
> completely different UI — say, a command-line version like Phase 1's
> own console app — how much of `game_session.dart` would genuinely have
> to change?

### Project Change

- **Reference Source:** curriculum.md, lines 471-484 (Phase 5's own
  header: "Introduce: Presentation / Application / Domain /
  Infrastructure"), and lines 1337-1357 (the later "crucial dependency
  direction" diagram this whole lesson is built from) — both read fresh
  this session, quoted verbatim where used below.
- **Files affected:** none created, none modified. This unit inspects
  and labels the real, already-existing `project/lib/main.dart`,
  unchanged since Lesson 40.
- **Change type:** none — inspection only.
- **Location:** `main.dart`'s own top import block (lines 1-12) and its
  real `_dispatch` method (lines 71-94).
- **Dependencies:** none beyond the already-real, already-passing
  project.

### The New Evidence

The real import block at the top of `main.dart`:

```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'game_intent.dart';
import 'game_session.dart';
import 'game_session_provider.dart';
import 'game_status.dart';
import 'number_pad_view.dart';
import 'sudoku_board.dart';
import 'sudoku_board_view.dart';
```

And the real `_dispatch` method, already fully explained mechanically in
Lesson 37, reread here for a different, architectural question — not
*how* the switch works, but *what it never does*:

```dart
void _dispatch(GameIntent intent) {
  switch (intent) {
    case SelectCellIntent(row: final row, col: final col):
      setState(() {
        _selectedRow = row;
        _selectedCol = col;
      });
    case EnterDigitIntent(digit: final digit):
      final row = _selectedRow;
      final col = _selectedCol;
      if (row == null || col == null) {
        return;
      }
      try {
        ref.read(gameSessionProvider.notifier).enterDigit(row, col, digit);
      } on InvalidMoveException catch (e) {
        _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
      } on InvalidStateTransitionException catch (e) {
        _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
      }
    case TogglePauseIntent():
      ref.read(gameSessionProvider.notifier).togglePause();
  }
}
```

### Updated Project

Not applicable — nothing in the project changed. Both real excerpts
above are shown complete, in full, exactly as they already exist; there
is no fragment here needing a surrounding structure to be placed inside.

### Isolate and Discard

There is no throwaway lab for this unit. The real, already-existing code
above already isolates the concept on its own — nothing here was
invented for teaching purposes, so nothing needs to be discarded. This
real pattern — a class that reads state and forwards intents, but never
itself decides a domain rule — is called the **Presentation layer**.

### Mechanical Walkthrough

- `import 'dart:async';` — Dart's own `import` directive (Terms, above),
  naming `dart:async`'s own real library as a dependency; needed for
  `Timer`, used later in the same file by `_SessionStatusState`, not by
  anything shown in this unit's own two excerpts.
- `import 'package:flutter/material.dart';` — the same real `import`
  directive, this time naming an external package (`package:`-prefixed,
  as opposed to `dart:`-prefixed or a bare relative filename) — Flutter's
  own real Material Design widget library. This one line is this
  lesson's own first piece of hard evidence: `main.dart` genuinely does
  depend on Flutter.
- `import 'package:flutter_riverpod/flutter_riverpod.dart';` — same real
  directive, naming the real, external Riverpod package — this file
  depends on the Application layer's own real wiring mechanism, not just
  on Flutter.
- `import 'game_intent.dart';` through `import 'sudoku_board_view.dart';`
  — six real, relative imports (no `package:` prefix, no `dart:` prefix
  — just a bare filename, which Dart resolves against files in the same
  real library/project), each naming one real file this project itself
  authored. Per the Library term above, each of these connects
  `main.dart`'s own real library to another one this project wrote.
- `switch (intent)` — Dart's own real pattern-matching switch statement
  (Lesson 37, reappearing), branching on `intent`'s own real runtime
  type — a `sealed class`, so the compiler can (and does) verify every
  real case is covered.
- `case SelectCellIntent(row: final row, col: final col):` — a real
  object pattern (Lesson 37), destructuring a matched `SelectCellIntent`
  into two real local bindings.
- `setState(() { ... })` — `State`'s own real, inherited method (Lesson
  28, reappearing), scheduling a real rebuild after its callback runs;
  used here for `_selectedRow`/`_selectedCol` — genuinely local UI state,
  never touching `GameSession` at all.
- `case EnterDigitIntent(digit: final digit):` — the same real object
  pattern, this time destructuring `digit`.
- `ref.read(gameSessionProvider.notifier)` — a real Riverpod call
  (Lesson 38, reappearing): `ref` is the real `WidgetRef` this
  `ConsumerState` was given; `.read` reaches a provider's real current
  value once, without subscribing to future rebuilds; `.notifier`
  accesses the real `GameSessionNotifier` instance a `NotifierProvider`
  wraps, as opposed to `ref.watch(gameSessionProvider)` (used elsewhere
  in this same file), which reaches the real, current `GameSession`
  itself.
- `.enterDigit(row, col, digit)` — a real method call, this lesson's
  central piece of evidence: `_dispatch` hands off `row`/`col`/`digit`
  and does nothing else with them — no range check, no conflict check.
  Every real rule about whether `5` is even a legal Sudoku digit lives
  somewhere else entirely, reached only through this one real call.
- `on InvalidMoveException catch (e)` / `on InvalidStateTransitionException
  catch (e)` — Dart's own real, typed `catch` clauses (Lesson 14,
  reappearing) — this widget reacts to a real domain error being thrown
  by naming it and showing it, which is a real presentation-layer job
  (turning a domain outcome into pixels), but it never constructs
  either exception itself, confirming again that it doesn't decide the
  rule — only reports what the rule, applied elsewhere, decided.
- `_scaffoldMessengerKey.currentState?.showSnackBar(...)` — a real,
  already-explained (Lesson 34) chain: `.currentState` (a nullable
  property read), `?.` (Lesson 10's own real null-aware operator,
  reappearing), `.showSnackBar(...)` (a real instance method on Flutter's
  own `ScaffoldMessengerState`) — pure presentation: showing text, never
  deciding what that text should say beyond forwarding `e.message`.
- `case TogglePauseIntent():` — a real object pattern matching a class
  with no fields to destructure — an empty parameter list inside the
  pattern.
- `.togglePause()` — the same real shape as `.enterDigit(...)` above: a
  bare forward, zero decision made here about *whether* toggling pause
  is currently legal.

### CS Lens

**Architectural layering** is a hard concept — a real, general pattern
for organizing any sufficiently large system by *what each part is
allowed to know*, not by what it happens to do.

```
Also recognized in: the OSI network stack (physical → data link → ...
→ application, each layer ignorant of the ones above it), a web
server's own model/view/controller split, a compiler's own front-end/
middle-end/back-end split, a car's drive-by-wire electronics (a pedal
sensor layer that never has to know which real actuator eventually
moves), operating-system privilege rings (ring 0 kernel code vs. ring 3
user applications, each unable to reach directly into the other)
```

### SE Lens

The real design principle here is **separation of concerns**: the
Presentation layer's own real job (turning taps into intents, turning
state into pixels) is kept structurally apart from the Domain layer's
real job (deciding what a legal move is). The alternative not chosen —
and genuinely tempting for a beginner — is writing the row/column/box
conflict check directly inside `SudokuCellView`'s own `onTap` handler,
or inside `_dispatch` itself. That would work, today, for exactly this
one screen. The real tradeoff: this project's actual `_dispatch` method
pays a small real cost — every digit entry travels through
`GameIntent` → `_dispatch` → `GameSessionNotifier` → `GameSession` →
`SudokuBoard` before anything happens — for the real payoff Lesson 34
already proved concretely: `SudokuBoard` needed zero changes to become
this real app's own rule enforcement, because it was never coupled to
any UI in the first place. The honest, present cost this project still
carries: `main.dart` still builds its entire real widget tree inline,
with no router or screen abstraction separating "which screen is
showing" from "what that screen contains" — a real, small debt, left
for Lesson 47's own job (feature-oriented structure), not fixed here.

### Run It

No command to run — this unit's evidence is the real, already-passing
project exactly as Lesson 40 left it. `flutter analyze .` and
`flutter test` both already ran clean at the end of Lesson 40's own
verification; nothing about *reading* this code changes that real
result, so re-running either command here would only reproduce output
this curriculum's own verification folder already has on file, per the
Verification Rule's Persistence clause.

### Connect

The Presentation layer is `main.dart`'s own real job: turn a tap into a
`GameIntent`, forward it, render whatever comes back. What it forwards
*to* is Concept Unit 2's own subject.

---

## Concept Unit 2: The Application Layer

### The Problem

`GameSessionNotifier.enterDigit` is four real lines wrapped in a
`try`/`finally`. Lesson 40 already explained *why* it shrank to that
size — the real rule logic moved into `GameSession`. This unit asks a
different, architectural question: now that the rule logic is gone, what
real job is actually left for `GameSessionNotifier` to do, and why does
that job need its own real class at all, instead of `_dispatch` just
calling `GameSession` directly?

> **Socratic prompt:** Riverpod's own real `Notifier` class (Lesson 38)
> is the thing every widget in this app actually talks to for shared
> game state. If `Notifier`/Riverpod disappeared tomorrow and plain
> `setState` came back as the only real tool available, would
> `GameSession`'s own rules (`_legalTransitions`, `registerMistake`,
> `maxMistakesBeforeFailure`) need to change at all? Second:
> `GameSessionNotifier.build()` constructs a `GameSession` and hands it
> a `Clock` read from `ref.watch(clockProvider)` (Lesson 39). Whose real
> job was it to decide *which concrete* `Clock` that actually is — the
> notifier's own, or something else's?

### Project Change

- **Reference Source:** curriculum.md, line 475-484 (Phase 5's own
  Lesson 41 header naming these four layers) — no more specific
  reference exists; curriculum.md never names `GameSessionNotifier`
  itself, since that class is this project's own, real, already-built
  code from Lessons 38 and 40, not something curriculum.md describes in
  advance.
- **Files affected:** none created, none modified. This unit inspects
  the real, already-existing `project/lib/game_session_provider.dart`,
  unchanged since Lesson 40.
- **Change type:** none — inspection only.
- **Location:** the file's own top import block, and the real
  `enterDigit` method.
- **Dependencies:** none beyond the already-real, already-passing
  project.

### The New Evidence

The real import block at the top of `game_session_provider.dart`:

```dart
import 'package:flutter/widgets.dart' show AppLifecycleState;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'clock.dart';
import 'game_session.dart';
import 'game_status.dart';
import 'sudoku_board.dart';
```

And the real `enterDigit` method:

```dart
void enterDigit(int row, int col, int digit) {
  try {
    state.enterDigit(row, col, digit);
  } finally {
    state = state.touched();
  }
}
```

### Updated Project

Not applicable — nothing in the project changed; both excerpts are shown
complete.

### Isolate and Discard

No throwaway lab for this unit either — the real code above is the
evidence. This real pattern — a class that receives a request and
forwards it to a real domain object, deciding nothing itself, but always
completing the real bookkeeping (here, `state = state.touched()`) a
framework needs to notice the change — is called the **Application
layer**.

### Mechanical Walkthrough

- `import 'package:flutter/widgets.dart' show AppLifecycleState;` — the
  same real `import` directive as Concept Unit 1, with a real `show`
  clause this lesson hasn't yet named as its own token: `show` restricts
  what a Dart import actually brings into scope to only the listed
  names — here, exactly one, `AppLifecycleState` — rather than every
  public name `package:flutter/widgets.dart` declares. This is this
  lesson's own second, more interesting piece of evidence: the
  Application layer *does* touch one real Flutter type, but as narrowly
  as Dart's own import syntax allows, and only for a real OS-level
  concept (foreground/background), never for anything about widgets,
  rendering, or pixels.
- `import 'package:flutter_riverpod/flutter_riverpod.dart';` — same real
  directive as before; this file is where Riverpod's own real wiring
  mechanism (`Provider`, `Notifier`, `NotifierProvider`) actually lives
  in this project.
- `import 'clock.dart'; import 'game_session.dart'; import
  'game_status.dart'; import 'sudoku_board.dart';` — four real, relative
  imports naming this project's own Domain-layer files — the Application
  layer depends on the Domain layer, never the other way around, which
  Concept Unit 5, below, checks directly.
- `void enterDigit(int row, int col, int digit)` — a real, ordinary
  method declaration (Lesson 8, reappearing): `void` (no return value),
  three real `int` parameters.
- `try { ... } finally { ... }` — Dart's own real `try`/`finally`
  construct (Lesson 14, reappearing): the `finally` block's own real
  code runs whether `state.enterDigit(...)` inside `try` succeeds or
  throws — the actual, concrete reason this shape was chosen, not just a
  syntax habit.
- `state.enterDigit(row, col, digit)` — a real property read
  (`state`, `Notifier`'s own inherited getter for its current real value)
  followed by a real method call on that value — `GameSession`'s own
  `enterDigit`, Concept Unit 3's own upcoming subject. This one call is
  the entire real decision this method makes: hand the request straight
  to the Domain layer.
- `state = state.touched()` — a real property *assignment* on `state` —
  `Notifier`'s own inherited setter, which is what actually tells
  Riverpod "something changed, rebuild anything watching this" — reading
  `state` first (the current, just-mutated `GameSession`), calling its
  own real `touched()` method (Lesson 38: a genuinely new object,
  needed because Riverpod's own default `updateShouldNotify` compares by
  reference identity), and reassigning `state` to that new real object.

### CS Lens

**Orchestration** — coordinating a sequence of real calls into other
components without embedding those components' own decisions — is
itself the concept this unit's evidence embodies, one specific real
instance of the layering pattern already named in Concept Unit 1's CS
lens.

```
Also recognized in: a REST API controller that validates a request's
shape and calls a service layer without embedding business rules, an
orchestral conductor (decides *when* each section plays, never plays a
note itself), a restaurant expediter (routes a ticket to the right
station, never cooks), a build system's own task runner (sequences real
compile/link/test steps without knowing how any one of them actually
works internally)
```

### SE Lens

The real principle at work is keeping **orchestration separate from
business logic** — `GameSessionNotifier` sequences a real operation and
handles Riverpod's own real bookkeeping; `GameSession` decides whether
that operation is legal at all. The alternative not chosen is real and
concrete, not hypothetical: before Lesson 40, this exact project kept
the full rule set (auto-start, mistake-counting, auto-failure,
auto-completion) inside `GameSessionNotifier.enterDigit` itself. The
real tradeoff for moving it out: an extra real class
(`GameSession`) and an extra real layer of indirection, in exchange for
the real, already-proven payoff that `game_session_test.dart` — 33 real
checks — runs with zero import of `flutter_riverpod` anywhere in it.
The honest, present cost: two real classes now exist
(`GameSession`/`GameSessionNotifier`) where a smaller tutorial app would
use one, and a reader has to hold both in mind to understand "what
happens when a digit is entered."

### Run It

No command to run — same reasoning as Concept Unit 1; this is real,
already-verified code, unchanged since Lesson 40's own clean
`flutter analyze .`/`flutter test` run.

### Connect

Concept Unit 1 showed the Presentation layer forwarding a request into
`GameSessionNotifier`. This unit shows exactly what `GameSessionNotifier`
does with it: orchestrate, then get out of the way. What it actually
hands the real decision to is Concept Unit 3's own subject.

---

## Concept Unit 3: The Domain Layer

### The Problem

`GameSession` and `SudokuBoard` are the two real classes every other
class in this app ultimately calls into. Both were built, lesson by
lesson, entirely before Flutter ever entered this curriculum —
`SudokuBoard` at the Phase 1/2 milestones, `GameSession` at Lesson 36.
The real question: now that both classes sit inside a real Flutter app,
do they still know nothing about Flutter — or did some real dependency
creep in along the way?

> **Socratic prompt:** you already read `sudoku_board.dart` in full in
> earlier lessons for its real Sudoku rules. Does that file, anywhere in
> it, mention `Widget`, `BuildContext`, or anything from
> `package:flutter`? Second: `game_session.dart`'s own real `enterDigit`
> method (Lesson 40) rejects a move if the session isn't `playing`, and
> fails the whole session past three mistakes. If you were writing a
> completely different Sudoku app tomorrow — a web app, a new CLI, with
> zero Flutter involved — could you copy this exact file in, unchanged?
> Third: given how `GameSession`'s own constructor actually gets "now"
> (Lesson 39), does this file know or care whether that time genuinely
> came from the real OS clock, or from a test standing in for it?

### Project Change

- **Reference Source:** curriculum.md, lines 471-484 and 1337-1357, same
  as Concept Units 1-2 — curriculum.md never names `GameSession`'s own
  real internals; those are this project's own real code from Lessons
  36 and 40.
- **Files affected:** none created, none modified. This unit inspects
  the real, already-existing `project/lib/game_session.dart`,
  `project/lib/sudoku_board.dart`, and `project/lib/game_status.dart`,
  all unchanged since their respective lessons.
- **Change type:** none — inspection only.
- **Location:** each file's own top import block (the whole point of
  this unit).
- **Dependencies:** none beyond the already-real, already-passing
  project.

### The New Evidence

The complete, real import block of `game_session.dart`:

```dart
import 'clock.dart';
import 'game_status.dart';
import 'sudoku_board.dart';
```

The complete, real import block of `sudoku_board.dart`:

```dart
import 'dart:math';
```

`game_status.dart` has no import block at all — its first real line is
its own doc comment, followed directly by `enum GameStatus {`.

### Updated Project

Not applicable — nothing in the project changed; all three real excerpts
are shown complete.

### Isolate and Discard

No throwaway lab — the real evidence above is already as isolated as it
gets: three real files, and between them, one single real dependency
(`dart:math`, for `Random`) on anything outside this project's own code,
and zero on Flutter. This real pattern — code that holds an app's actual
rules and depends on nothing from the UI framework displaying it — is
called the **Domain layer**.

### Mechanical Walkthrough

- `import 'clock.dart';` — a real, relative import naming `Clock`
  (Concept Unit 4's own upcoming subject) — the Domain layer depends on
  a real *abstraction*, never on `SystemClock` directly; `GameSession`'s
  own constructor takes a `Clock`-typed parameter, never constructs a
  `SystemClock` itself.
- `import 'game_status.dart';` — a real, relative import naming
  `GameStatus`, one Domain concept importing another, both inside the
  same layer.
- `import 'sudoku_board.dart';` — a real, relative import naming
  `SudokuBoard`, the domain object `GameSession` actually wraps.
- `import 'dart:math';` — `sudoku_board.dart`'s own single real
  dependency: Dart's own standard-library `Random` class (Lesson 20,
  reappearing), used only for shuffled candidate order in
  `solve`/`generateComplete`. `dart:math` is part of the Dart language
  itself, not a UI framework, so this import doesn't weaken the "no
  Flutter" claim at all — it's exactly the kind of real dependency a
  pure Dart console program (Phase 1's own `sudoku_console.dart`) could
  use too, and already does.
- The absence of any import line at all in `game_status.dart` — not a
  syntactic element to enumerate, but real, direct evidence in its own
  right: a real Dart enum needs nothing else to exist.

### CS Lens

The specific hard concept this unit proves in miniature is **framework
independence** — code that could, in principle, be reused against a
completely different framework, because it was never written against
one in the first place.

```
Also recognized in: a chess engine sold separately from any chess GUI,
a physics engine (Box2D) used identically inside completely different
game engines, a compiler's own middle-end intermediate representation
(shared across wildly different front ends and back ends), SQL itself
(the same real query language, portable — in principle — across many
different database products)
```

### SE Lens

The real design principle is keeping the **Domain layer pure** — free of
any framework dependency, so its own correctness (Phase 2's real,
already-passing 8/8 test suite for `SudokuBoard`; Lesson 40's own real
33/33 for `GameSession`) never depends on Flutter, Riverpod, or any
other framework being present or even installed. The alternative not
chosen: this project could have built `SudokuBoard` and `GameSession`
directly against Flutter from the start — a `ChangeNotifier`, say,
instead of a plain class — which is genuinely how many real tutorials do
it. The real tradeoff already paid off concretely: Phase 1's own console
app still runs, completely unmodified, with `SudokuBoard` never once
requiring `package:flutter` in its own `pubspec.yaml`. The honest,
present cost: this purity is currently kept only by discipline, not
enforced by any tool — nothing stops a future lesson's code from
accidentally importing `package:flutter/material.dart` into
`sudoku_board.dart` by mistake; Concept Unit 5, below, names this
directly as the still-open half of the story.

### Run It

No command to run yet for this unit specifically — the real evidence
above is inspection of already-real, unchanged files. The command that
actually *proves* "zero Flutter dependency" as a real, checked fact
rather than an eyeballed one is Concept Unit 5's own job, immediately
following.

### Connect

Concept Unit 2 showed the Application layer handing a request to
`GameSession`. This unit shows what `GameSession` (and `SudokuBoard`
underneath it) actually is: real rules, with no real dependency on
anything that displays them. What `GameSession` does depend on —
`Clock`, an abstraction rather than a concrete implementation — is
Concept Unit 4's own subject.

---

## Concept Unit 4: The Infrastructure Layer

### The Problem

`Clock` is a real, three-line abstract class: `abstract class Clock {
DateTime now(); }`. It cannot, by itself, actually tell anyone what time
it is — there's no real code inside it at all. Something else has to
supply a real answer. This unit asks: which real class does, and what
makes that class different in kind from `GameSession` or `SudokuBoard`?

> **Socratic prompt:** `SystemClock.now()` calls `DateTime.now()` — a
> real call that ultimately reaches the operating system. Search your
> own memory of `game_session.dart`'s real code (Concept Unit 3, just
> shown): does `GameSession` itself ever call `DateTime.now()`
> directly, anywhere? Second: if this project added a real save-game
> feature next (Phase 6's own future job) that read and wrote an actual
> SQLite file on disk, would that new code most naturally sit next to
> `SystemClock`, next to `GameSession`, or somewhere else — based on what
> `SystemClock` is already doing here?

### Project Change

- **Reference Source:** curriculum.md, lines 471-484 and 1337-1357 —
  same as the prior three units; `Clock`/`SystemClock` are this
  project's own real code from Lesson 39.
- **Files affected:** none created, none modified. This unit inspects
  the real, already-existing `project/lib/clock.dart` in full,
  unchanged since Lesson 39.
- **Change type:** none — inspection only.
- **Location:** the whole file — it is 17 real lines.
- **Dependencies:** none beyond the already-real, already-passing
  project.

### The New Evidence

The complete, real, unmodified content of `clock.dart`:

```dart
abstract class Clock {
  DateTime now();
}

class SystemClock implements Clock {
  @override
  DateTime now() => DateTime.now();
}
```

(Doc comments omitted here only for length — the real file's own doc
comments, quoted in full in this lesson's Objects and methods section
above, already explain both classes' own real intent.)

### Updated Project

Not applicable — nothing in the project changed; the excerpt above is
the file's own complete real code, in full.

### Isolate and Discard

No throwaway lab — `clock.dart` is already the smallest possible real
example of this concept, and it already exists in the project. This
real pattern — a concrete class that reaches something genuinely outside
the program's own memory (here, the real OS clock) on behalf of an
abstraction the Domain layer defines — is called the **Infrastructure
layer**.

### Mechanical Walkthrough

- `abstract class Clock { DateTime now(); }` — Dart's own real `abstract`
  class modifier (Lesson 12, reappearing): a class explicitly marked as
  unable to be instantiated directly, existing purely to declare a real
  contract other classes commit to. Its only member, `DateTime now();`,
  is itself a real abstract method — a signature with no body at all, a
  real promise that any concrete subclass must supply one. Together
  these two real pieces are this unit's whole point: `Clock` names
  *what* "give me the current moment" means without saying *how*.
- `class SystemClock implements Clock` — Dart's own real `implements`
  keyword (Lesson 12, reappearing): declares that `SystemClock` commits
  to providing a real, concrete body for every one of `Clock`'s own
  abstract members — here, just `now()` — and can be used anywhere a
  `Clock` is expected, per Lesson 12's own real polymorphism proof.
- `@override` — a real Dart annotation (Lesson 12, reappearing), not a
  keyword — marking that `now()` below is deliberately providing the
  real implementation `Clock` itself left abstract, letting the compiler
  catch a real mismatch (a typo'd signature) as an error instead of
  silently defining an unrelated method.
- `DateTime now() => DateTime.now();` — a real arrow-bodied method
  (Lesson 9's own arrow syntax, reappearing) whose entire real body is
  one call: `DateTime.now()`, a real factory constructor (Terms, above)
  declared in `dart:core` as `factory DateTime.now()` — free, per that
  real declaration, to run whatever logic it needs before returning a
  `DateTime`, unlike an ordinary constructor bound to building one fresh
  instance of exactly its own class every time. This one real call
  reads the actual system clock this process is running under, and is
  the real, concrete reason `SystemClock`
  belongs to the Infrastructure layer and not the Domain layer: it
  touches something genuinely outside this program's own memory — real,
  external, current wall-clock time — which is exactly the kind of
  dependency the Domain layer (Concept Unit 3) was shown to have zero
  of.

### CS Lens

The specific hard concept `Clock`/`SystemClock` embodies is the **port
and adapter** shape — an abstraction (`Clock`, the "port") the Domain
layer defines on its own terms, and a concrete class (`SystemClock`, the
"adapter") translating that port into a real call against something
external.

```
Also recognized in: a device driver (the OS defines a port; the driver
adapts a specific real piece of hardware to it), an ODBC/JDBC database
driver (a language defines a query port; each real database vendor
supplies its own adapter), a payment gateway SDK (an app defines
"charge this card"; a specific real processor's adapter decides how),
a game engine's own input-abstraction layer (one real "jump was
pressed" port, adapted separately for a keyboard, a gamepad, and a touch
screen)
```

### SE Lens

The real principle is isolating the genuinely **unpredictable outside
world** — the real OS clock — behind one thin, swappable seam, so the
Domain layer never has to know it exists. The alternative not chosen:
calling `DateTime.now()` directly from inside `GameSession` (this
project's own real, original Lesson 36 shape, before Lesson 39 changed
it). The real tradeoff: one extra method call at every real use site
(`_clock.now()` instead of a bare `DateTime.now()`) for the real,
already-proven payoff of `FakeClock`-driven deterministic tests (Lesson
39). The honest, present cost: `SystemClock` currently lives in the same
file as its own abstraction, `Clock`, rather than in a dedicated
`infrastructure/` folder — a small, real, deliberately deferred debt;
Lesson 47 is where a real folder finally exists for it to move into.

### Run It

No command to run for this unit specifically — same reasoning as
Concept Unit 3. The real command that checks this unit's own central
claim — that `clock.dart` genuinely has zero real dependency on anything
outside `dart:core` — is Concept Unit 5's job, immediately following,
covering every file in `project/lib/` at once.

### Connect

Concept Unit 3 showed `GameSession` depending on `Clock`, an
abstraction. This unit shows what actually answers that abstraction for
real: `SystemClock`, reaching genuinely outside the program. All four
layers are now named with real evidence each; Concept Unit 5 checks, in
one real pass, that the dependency direction between them actually holds
everywhere in `project/lib/`, not just in the four files already shown.

---

## Concept Unit 5: The Dependency Direction Rule

### The Problem

Four layers have real names now: Presentation (`main.dart` and its own
widgets), Application (`game_session_provider.dart`), Domain
(`game_session.dart`, `sudoku_board.dart`, `game_status.dart`), and
Infrastructure (`clock.dart`'s own `SystemClock`). Curriculum.md's own
diagram (lines 1337-1357, read fresh this session) draws real arrows
between them:

```
┌───────────────┐
│ Presentation  │
└───────┬───────┘
        ↓
┌───────────────┐
│ Application   │
└───────┬───────┘
        ↓
┌───────────────┐
│    Domain     │
└───────────────┘
        ↑
        │
┌───────┴───────┐
│Infrastructure │
│ DB / API      │
└───────────────┘
```

Curriculum.md states the real point of this diagram in one sentence,
quoted verbatim: *"The domain doesn't know Flutter exists."* Concept
Units 1-4 already showed four individual pieces of evidence for this.
This unit's real question: is that arrow direction actually true across
*every* real file in `project/lib/`, or only the four files already
looked at by hand?

> **Socratic prompt:** every layer in this lesson so far has been
> defined by what it depends on. Of the nine real files in
> `project/lib/`, which one has never appeared in any of this lesson's
> own import evidence at all — and given that, what would you predict
> its own import list looks like? Second: if `sudoku_board.dart`
> started importing `main.dart` — say, to read `SudokuApp`'s current
> theme color for some reason — what real, concrete thing, already
> proven working in this curriculum, would that break? Third:
> `clock.dart` doesn't import `game_session_provider.dart`, but
> `game_session_provider.dart` does import `clock.dart`. Given the
> arrows in curriculum's own diagram above, is that the correct
> direction?

### Project Change

- **Reference Source:** curriculum.md, lines 1337-1357, quoted in full
  above — this unit exists specifically to check this project's own real
  code against that exact diagram.
- **Files affected:** none created, none modified — this unit runs one
  real, read-only terminal command against every existing file in
  `project/lib/`.
- **Change type:** none — verification only.
- **Location:** `project/lib/` as a whole, all nine real `.dart` files.
- **Dependencies:** PowerShell, already available in this environment
  (Lesson 2).

### The New Evidence

The real command, run from `project/`:

```powershell
Select-String -Path "lib\*.dart" -Pattern "^import" | Select-Object -Property Filename, Line
```

### Updated Project

Not applicable — this is a read-only diagnostic command; it modifies
nothing in `project/`.

### Isolate and Discard

This is not a throwaway lab in the usual sense — there is no code being
taught, only a real diagnostic command being run once, this session,
against the real project. Nothing here is discarded because nothing here
was ever part of `project/` to begin with; its real output is kept
permanently in this curriculum's own verification folder instead
(Verification Rule, Persistence). This real technique — checking a
structural claim about a codebase with a real search tool instead of
trusting a by-hand read — doesn't have a single common name the way
"lambda expression" does, but is closest to what's usually called
**static dependency analysis**: inspecting a codebase's own declared
dependencies without running any of it.

### Mechanical Walkthrough

- `Select-String` — already given full treatment in this lesson's own
  Objects and methods section, above; reused here as the command's own
  first real stage.
- `-Path "lib\*.dart"` — a real named argument, a Windows-style glob
  pattern matching every real file directly inside `project/lib/`
  ending in `.dart` — all nine real files this project's own `lib/`
  folder currently contains.
- `-Pattern "^import"` — a real named argument, a regular expression:
  `^` (Terms, above — start-of-line anchor) immediately followed by the
  literal text `import`, so only a real line that genuinely *begins*
  with the word `import` counts as a match.
- `|` — the real pipe operator (Terms, above, reappearing from Lesson
  2), connecting `Select-String`'s own real output objects directly into
  the next command.
- `Select-Object` — already given full treatment in this lesson's own
  Objects and methods section, above.
- `-Property Filename, Line` — a real named argument: a comma-separated
  real list of two property names, `Filename` and `Line`, telling
  `Select-Object` which two real fields of each incoming match object to
  keep.

### CS Lens

Checking a real dependency graph mechanically, rather than trusting an
eyeballed read of the code, is itself a recognizable idea:

```
Also recognized in: a build system computing a real dependency graph
before deciding compile order, a linter's own "no circular imports"
rule, a package manager resolving a real dependency tree before install,
a static site generator checking for real broken internal links before
publishing
```

### SE Lens

The real principle this unit's own evidence proves is the **Acyclic
Dependencies Principle** — dependencies between components should form
a real, one-directional graph, never a cycle — which is the general form
of curriculum's own specific "domain doesn't know Flutter" rule. The
alternative not chosen is no enforced direction at all: any file
importing any other file freely, which is genuinely how many real,
poorly-aged codebases end up, one convenient shortcut at a time. The
real, honest cost this project currently carries: this rule is kept by
discipline alone right now — nothing in `flutter analyze .`'s own real
output would catch a future lesson accidentally adding `import
'main.dart';` to `sudoku_board.dart`. A real linter rule or a dedicated
architecture-testing package could enforce this mechanically; that's
explicitly out of this lesson's own scope, flagged honestly rather than
silently left unmentioned.

### Commands Needed

- **`Select-String -Path "lib\*.dart" -Pattern "^import" | Select-Object
  -Property Filename, Line`** — run from `project/`, this session, in
  the same PowerShell process already carrying this session's own
  persistent `PATH`/`JAVA_HOME`/`ANDROID_HOME`/`ANDROID_SDK_ROOT`
  (Lesson 1's own documented gotcha; not actually needed for this
  specific command, since it touches no Flutter/Dart toolchain at all,
  only real files on disk). Success output: one real line per real
  `import` statement found, each showing which file it came from.

### Run It

Real, captured output — every real match this command actually found,
this session, across all nine files in `project/lib/`:

```
game_session_provider.dart import 'package:flutter/widgets.dart' show AppLifecycleState;
game_session_provider.dart import 'package:flutter_riverpod/flutter_riverpod.dart';
game_session_provider.dart import 'clock.dart';
game_session_provider.dart import 'game_session.dart';
game_session_provider.dart import 'game_status.dart';
game_session_provider.dart import 'sudoku_board.dart';
game_session.dart          import 'clock.dart';
game_session.dart          import 'game_status.dart';
game_session.dart          import 'sudoku_board.dart';
main.dart                  import 'dart:async';
main.dart                  import 'package:flutter/material.dart';
main.dart                  import 'package:flutter_riverpod/flutter_riverpod.dart';
main.dart                  import 'game_intent.dart';
main.dart                  import 'game_session.dart';
main.dart                  import 'game_session_provider.dart';
main.dart                  import 'game_status.dart';
main.dart                  import 'number_pad_view.dart';
main.dart                  import 'sudoku_board.dart';
main.dart                  import 'sudoku_board_view.dart';
number_pad_view.dart       import 'package:flutter/material.dart';
sudoku_board_view.dart     import 'package:flutter/material.dart';
sudoku_board.dart          import 'dart:math';
```

This proves, rather than asserts, three real things at once: first,
exactly three of the nine real files (`game_session_provider.dart`,
`main.dart`, `number_pad_view.dart`, `sudoku_board_view.dart` — four,
not three, on a careful recount) import anything from `package:flutter`
or `package:flutter_riverpod` — every one of them a Presentation- or
Application-layer file. Second, the real Domain-layer files
(`game_session.dart`, `sudoku_board.dart`) import only each other,
`clock.dart`, `game_status.dart`, and `dart:math` — never anything with
`package:flutter` in it. Third, two real files —
`game_status.dart` and `game_intent.dart` — don't appear in this output
at all, meaning `Select-String` found zero lines starting with `import`
in either one: the smallest, strongest possible real proof that a file
can be genuinely useful while depending on nothing at all.

### Connect

Every layer named across this lesson's five units is now backed by one
real, run command's own real output, not by an eyeballed read of five
separate files. The dependency direction curriculum.md draws as a
diagram is the same real, concrete shape this project's own
`project/lib/` already has.

---

## Connect the Pieces

Tap the real number-pad button labeled "5" while cell `(4, 4)` is
selected. `_SudokuAppState._dispatch` (Presentation, Concept Unit 1)
builds an `EnterDigitIntent(5)` and calls
`ref.read(gameSessionProvider.notifier).enterDigit(4, 4, 5)`.
`GameSessionNotifier.enterDigit` (Application, Concept Unit 2) wraps one
real call, `state.enterDigit(4, 4, 5)`, in a `try`/`finally` whose real
job is only to guarantee `state = state.touched()` runs afterward, pass
or fail — it decides nothing about whether `5` is legal there.
`GameSession.enterDigit` (Domain, Concept Unit 3) is where every real
decision actually happens: the session auto-starts if it hasn't yet,
confirms it's genuinely `playing`, and calls
`board.placeDigit(4, 4, 5)` — `SudokuBoard`'s own real row/column/box
check, proven correct back in Phase 2, long before this app had a single
widget. Along the way, `GameSession.elapsed` might be read for display —
which quietly calls `_clock.now()`, reaching `SystemClock`
(Infrastructure, Concept Unit 4), the one real class in this whole app
that actually asks the operating system what time it is. `_dispatch`
never sees any of that — it only ever sees the real
`GameSession` `GameSessionNotifier` hands back, through `ref.watch
(gameSessionProvider)`, and rebuilds `SudokuBoardView` from it. Concept
Unit 5's own real, run command confirms none of these four layers'
dependencies point the wrong way: `sudoku_board.dart`'s entire real
import list is `dart:math`, and nothing in this project has ever needed
it to be anything more.
