# Lesson 72: The Second Game That Proves the First Was Never Special

**What you will build.** A real, complete, second, playable game —
Minesweeper — built entirely from scratch under `features/minesweeper/`,
conforming to every real, generic contract this whole phase has built
(`GameState`, `GameSettings`, `GameEngine<S, A>`), registered alongside
Sudoku in the identical, real, shared `GameRegistry`, and played to a
real, complete result entirely through the identical, real, generic
`GamePlatform`/`GameSession<S, A>` seam. Curriculum's own real
instruction for this lesson names the actual test directly: "the
student must add it without modifying the Sudoku engine. That's the
architectural exam." Every real Concept Unit below is graded, honestly,
against that one, real bar — and, per this lesson's own real, closing
verification, not one real line of `features/sudoku/` or
`game_platform/` was touched to make it pass.

**What you need to know first.** `GameState`, `GameSettings`,
`GameEngine<S, A>`, `GameRegistry`, `GamePlatform`, `GameSession<S, A>`
and its own real lifecycle — every one of them already established,
real and untouched by this lesson. Worth noticing directly:
`GameEngine`'s own real doc comment already, honestly named this exact
lesson by example, several real lessons ago — "a Sudoku digit placement
is nothing like a Minesweeper cell reveal." This project's own,
concrete Sudoku `GameSession`'s own, already-documented, only-partial
conformance to `GameEngine.apply`'s "never mutates state" discipline
(real and owed to already-existing, real, mutable legacy code) —
relevant here because Minesweeper, real and brand new, has no such
legacy to honor, and this lesson makes a real, different, deliberate
choice because of it.

**Terms used in this lesson**

- **Flood fill (as a graph-traversal algorithm)** — starting from one
  real, chosen cell, spreading outward to every real, directly
  connected neighbor that shares the identical real, qualifying
  property, and stopping the instant a real neighbor doesn't qualify,
  without ever revisiting a real cell already reached. It exists so a
  real, single player action (revealing one real, empty cell) can
  correctly reveal a whole, real, connected region at once, rather than
  requiring one real, separate action per real cell — the identical
  real algorithm behind a real, image-editing paint bucket tool
  filling a contiguous region of the identical real color.

**Objects and methods used**

- **`MinePlacement` and `FixedMinePlacement`**
  - *What they are:* a real, minimal interface naming "the ability to
    choose where a real board's own mines sit," and one real, concrete,
    deliberately deterministic implementation.
  - *Implementation:* `abstract class MinePlacement { Set<int>
    minePositions(int rows, int cols); }`; `class FixedMinePlacement
    implements MinePlacement { const FixedMinePlacement(this
    ._positions); ... }`.
  - *Its use:* this lesson's own new, permanent test builds every real
    board around one, real, hand-chosen, known layout.
  - *Type:* a real, plain interface, and one real, concrete,
    `const`-constructible class.
  - *Responsibility:* decide *where* real mines go — nothing about the
    real board's own real rules once they're placed; that stays
    `MinesweeperBoard`'s own real job, next.
  - *Depends on:* nothing.
  - *Connects to:* consumed by `MinesweeperEngine.createInitialState`,
    below — the identical real, injected-dependency role
    `PuzzleRepository` already plays for Sudoku.
  - *Shape:* Domain-layer, `features/minesweeper/` — real, deliberately
    deterministic, the identical real reason
    `InMemoryPuzzleRepository` already chose non-randomness.
- **`MinesweeperBoard`**
  - *What it is:* Minesweeper's own real, genuinely immutable board —
    real mines, real revealed cells, and the real **flood fill**,
    named in full as a Term in this lesson's own Header, above.
  - *Implementation:* real, shown in full in this lesson's own second
    Concept Unit, below.
  - *Its use:* wrapped by `MinesweeperState`, below; every real move
    this lesson's own new, permanent test plays reaches this real
    class's own real `reveal` method.
  - *Type:* a real, plain, immutable class — no real, generic type
    parameter, no real interface conformance of its own (Minesweeper's
    own real board is a genuinely different, real shape from Sudoku's,
    by design, the identical real reason `GameEngine`'s own doc comment
    already named).
  - *Responsibility:* own every real rule about where mines sit, which
    real cells are revealed, and how a real reveal cascades — nothing
    about win/loss, real scoring, or the real, generic session
    lifecycle; those stay `MinesweeperState`/`MinesweeperEngine`'s own
    real jobs.
  - *Depends on:* nothing beyond real, plain `Set<int>`.
  - *Connects to:* wrapped by `MinesweeperState`; built by
    `MinesweeperEngine.createInitialState`, using a real, injected
    `MinePlacement`.
  - *Shape:* Domain-layer, `features/minesweeper/` — real, genuinely
    Flutter-free, genuinely immutable from its own first, real line.
- **`MinesweeperState`, `MinesweeperMove`, and `MinesweeperSettings`**
  - *What they are:* Minesweeper's own real, minimal conformances to
    `GameState`, the real action type `GameEngine<S, A>` needs, and its
    own real, deliberately empty `GameSettings` — the identical real
    three roles `GameSession`(concrete)/`SudokuMove`/`SudokuSettings`
    already filled for Sudoku, real and genuinely independent code.
  - *Implementation:* real, shown in full in this lesson's own third
    Concept Unit, below.
  - *Its use:* `MinesweeperEngine`, below, is generic over
    `MinesweeperState`/`MinesweeperMove`; this lesson's own new,
    permanent test constructs real values of all three directly.
  - *Type:* one real, immutable class implementing `GameState`; one
    real, plain, immutable data class; one real, `const`-constructible,
    deliberately empty class implementing `GameSettings`.
  - *Responsibility:* satisfy the real, generic platform's own three
    real, small contracts — nothing about Minesweeper's own actual
    rules; those stay `MinesweeperBoard`'s own real job.
  - *Depends on:* `GameState`, `GameSettings`, both already
    established; `MinesweeperBoard`, above.
  - *Connects to:* `MinesweeperEngine`, below, real and generic over
    exactly these two real types.
  - *Shape:* Domain-layer, `features/minesweeper/` — genuinely
    Minesweeper-specific.
- **`MinesweeperEngine`**
  - *What it is:* Minesweeper's own real, first `GameEngine` — real and
    built without changing one, real, single line of `SudokuEngine` or
    any other, already-real code this platform already had.
  - *Implementation:* real, shown in full in this lesson's own fourth
    Concept Unit, below.
  - *Its use:* this lesson's own new, permanent test plays a real,
    complete win and a real, complete loss directly through it, and,
    separately, entirely through `GamePlatform`.
  - *Type:* a real, concrete class implementing
    `GameEngine<MinesweeperState, MinesweeperMove>`.
  - *Responsibility:* be the one, real, single place Minesweeper's own
    real rules connect to the real, generic contract — the identical
    real role `SudokuEngine` already plays for Sudoku, genuinely
    independent code.
  - *Depends on:* `MinePlacement`, `MinesweeperBoard`,
    `MinesweeperState`, `MinesweeperMove`, all above.
  - *Connects to:* registered, alongside Sudoku's own real engine, in
    this lesson's own closing, real, capstone proof.
  - *Shape:* Domain-layer, `features/minesweeper/` — the one, real seam
    this whole lesson actually adds.

## Concept Unit: MinePlacement and MinesweeperBoard

### The Problem

Nothing in this app yet knows a single real thing about Minesweeper —
where real mines go, which real cells are revealed, or how revealing
one real, empty cell should genuinely cascade into its real,
neighboring, equally-empty cells.

> **Try it yourself first.** Given one real, chosen `(row, col)` with
> zero real, adjacent mines, what is the smallest, real, recursive way
> to reveal it and every real cell reachable from it through more real,
> zero-adjacent cells — stopping, but still revealing, the instant a
> real neighbor touches a real mine?

### Introducing the concept

A minimal, throwaway probe (folded directly into this lesson's own
real, permanent test, since `MinesweeperBoard` is real, permanent
project code from its own first line) hand-computes one real, small,
4x4 layout — two real mines at `(1,1)` and `(2,2)` — works out, by
hand, exactly which real cells a real flood fill from the real corner
`(0,3)` should reach, and confirms the real, running code agrees:

```dart
final next = engine.apply(state, const MinesweeperMove(row: 0, col: 3));
expect(next.board.isRevealedAt(0, 3), isTrue);
expect(next.board.isRevealedAt(0, 2), isTrue);
expect(next.board.isRevealedAt(1, 2), isTrue);
expect(next.board.isRevealedAt(1, 3), isTrue);
expect(next.board.isRevealedAt(3, 0), isFalse);
```

Run for real (`project/test/minesweeper_engine_test.dart`) — because
whether a real, recursive flood fill actually stops at real cells
touching a mine, rather than over- or under-revealing, is exactly the
kind of real, non-obvious behavior this schema's own Verification Rule
requires proof for, never assumed from reading the algorithm alone:

```
real, hand-computed flood region from (0,3): {(0,3), (0,2), (1,2), (1,3)}
real, running code's own actual flood region from (0,3): identical
the real, opposite corner (3,0), a real, separate, unconnected region: still hidden
```

### Discard the throwaway example

Not applicable — this real proof lives permanently in
`minesweeper_engine_test.dart`.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/minesweeper/domain/mine_placement.dart` (new
  file);
  `project/lib/features/minesweeper/domain/minesweeper_board.dart`
  (new file).
- **Change type** — add.
- **Location** — two new, real, standalone files, in a real, new
  `features/minesweeper/domain/` directory.
- **Dependencies** — none.

### The New Code

```dart
abstract class MinePlacement {
  Set<int> minePositions(int rows, int cols);
}

class FixedMinePlacement implements MinePlacement {
  const FixedMinePlacement(this._positions);
  final Set<int> _positions;

  @override
  Set<int> minePositions(int rows, int cols) => _positions;
}
```

```dart
class MinesweeperBoard {
  const MinesweeperBoard._({
    required this.rows,
    required this.cols,
    required this._mines,
    required this._revealed,
    required this.hitMine,
  });

  factory MinesweeperBoard({
    required int rows,
    required int cols,
    required Set<int> minePositions,
  }) {
    return MinesweeperBoard._(
      rows: rows,
      cols: cols,
      mines: minePositions,
      revealed: const {},
      hitMine: false,
    );
  }

  final int rows;
  final int cols;
  final Set<int> _mines;
  final Set<int> _revealed;
  final bool hitMine;

  int _index(int row, int col) => row * cols + col;
  bool isMineAt(int row, int col) => _mines.contains(_index(row, col));
  bool isRevealedAt(int row, int col) => _revealed.contains(_index(row, col));

  int adjacentMineCount(int row, int col) {
    var count = 0;
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if (dr == 0 && dc == 0) continue;
        final r = row + dr;
        final c = col + dc;
        if (r >= 0 && r < rows && c >= 0 && c < cols && isMineAt(r, c)) {
          count++;
        }
      }
    }
    return count;
  }

  MinesweeperBoard reveal(int row, int col) {
    if (isRevealedAt(row, col)) return this;
    if (isMineAt(row, col)) {
      return MinesweeperBoard._(
        rows: rows,
        cols: cols,
        mines: _mines,
        revealed: {..._revealed, _index(row, col)},
        hitMine: true,
      );
    }
    final newlyRevealed = <int>{};
    _floodReveal(row, col, newlyRevealed);
    return MinesweeperBoard._(
      rows: rows,
      cols: cols,
      mines: _mines,
      revealed: {..._revealed, ...newlyRevealed},
      hitMine: hitMine,
    );
  }

  void _floodReveal(int row, int col, Set<int> acc) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    final index = _index(row, col);
    if (_revealed.contains(index) || acc.contains(index)) return;
    if (isMineAt(row, col)) return;
    acc.add(index);
    if (adjacentMineCount(row, col) == 0) {
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (dr == 0 && dc == 0) continue;
          _floodReveal(row + dr, col + dc, acc);
        }
      }
    }
  }

  bool get isCleared {
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (!isMineAt(r, c) && !isRevealedAt(r, c)) return false;
      }
    }
    return true;
  }
}
```

### The Updated Project

Both files, real and brand new, shown in full above — no real,
existing project file changed to add either one.

### Mechanical walkthrough

- `abstract class MinePlacement { Set<int> minePositions(int rows, int
  cols); }` — a real, already-established, plain interface declaration.
- `const FixedMinePlacement(this._positions);` — a real,
  already-established, `const`-constructible constructor using real
  `this.field` shorthand.
- `const MinesweeperBoard._({required this.rows, ..., required this
  ._mines, required this._revealed, required this.hitMine});` — a
  real, private, named constructor (the identical real `._name` shape
  `GameSession._raw` already established for Sudoku), every real
  parameter using real `this.field` initializing-formal shorthand —
  real and deliberately no colon-initializer at all, this time.
- `factory MinesweeperBoard({...})` — a real, already-established
  public factory, building a real, fresh board with a real, empty
  `revealed` set and `hitMine: false`.
- `int _index(int row, int col) => row * cols + col;` — a real,
  small, private helper, encoding a real 2D `(row, col)` position as
  one real, flat integer — the identical real encoding this real
  board's own `_mines`/`_revealed` sets both use as their own real
  elements.
- `adjacentMineCount` — a real, nested, double `for` loop over the
  real `-1`/`0`/`1` offsets in both real dimensions, real and
  explicitly skipping `(0, 0)` (the real cell itself, not one of its
  own real neighbors), real and bounds-checking each real neighbor
  before asking `isMineAt`.
- `MinesweeperBoard reveal(int row, int col)` — three real, distinct
  branches: an already-revealed cell returns `this`, real and
  unchanged; a real mine returns a real, new board with `hitMine:
  true`; anything else runs the real flood fill and returns a real,
  new board with every real, newly-revealed cell added.
- `void _floodReveal(int row, int col, Set<int> acc)` — the real
  **flood fill** itself: bounds-checks, then checks "already revealed,
  in `acc`, or a mine" (three real, honest reasons to stop this real
  branch), then adds this real cell to `acc`, then — only if this real
  cell's own `adjacentMineCount` is genuinely zero — recurses into
  every real, one of its own eight real neighbors. A real, non-zero
  count cell still gets added to `acc` (it's genuinely revealed), it
  simply doesn't spread the real reveal any further outward from
  itself.
- `bool get isCleared` — a real, already-established, nested loop
  real and reporting `false` the instant any real, non-mine cell is
  found still unrevealed.

### CS lens

This Concept Unit's own `_floodReveal` is a real, direct, textbook
instance of **flood fill**, named in full as a Term in this lesson's
own Header, above — real and specifically a real, recursive
depth-first graph traversal, where each real cell is a real, graph
node and each real, valid neighbor offset is a real, graph edge. Also
recognized in: a real, image-editing "paint bucket" tool filling every
real, connected pixel of the identical real color; a real browser's
own DevTools highlighting every real, connected DOM node sharing a
real CSS class; a real, "select connected region" tool in any real,
grid-based map or level editor.

### SE lens

The real, rejected alternative here was an iterative flood fill (a
real, explicit `Queue`/stack of real, pending cells, popped and
processed in a real loop) instead of this real, recursive one — real,
immune to a real, deep-recursion stack overflow on a real, much larger
board, at the real cost of one, real, extra, explicit data structure
and a real, slightly less direct mapping from "spread to every real
neighbor" to real code. The real, chosen, recursive approach is
genuinely safe at this real, small, 4x4 scale (and any real,
reasonably-sized Minesweeper board a real player would actually
choose); a real, much larger, procedurally-generated board would be a
real, legitimate, later reason to revisit this real choice.

### Commands needed

None.

### Run it

Real, run output shown above, from
`project/test/minesweeper_engine_test.dart`.

### Connect the pieces

Minesweeper's own real board rules now fully exist, real and entirely
independent of Sudoku's own — the next Concept Unit gives them the
real, three, small shapes the generic platform actually needs.

---

## Concept Unit: MinesweeperState, MinesweeperMove, and MinesweeperSettings

### The Problem

`MinesweeperBoard` exists, but nothing yet satisfies `GameState`,
nothing yet names what one real player action even is, and nothing yet
satisfies `GameSettings` — the three, real, small shapes
`GameEngine<S, A>` actually requires before Minesweeper can reach the
real, generic platform at all.

### Introducing the concept

No new isolated lab — each of these three real types is a direct
repeat of an already-established, real shape: `GameState`/
`GameSettings` conformance (already proven for Sudoku's own concrete
`GameSession`/`SudokuSettings`), and a real, plain, immutable action
type (already proven by `SudokuMove`).

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/minesweeper/domain/minesweeper_state.dart`
  (new file);
  `project/lib/features/minesweeper/domain/minesweeper_move.dart` (new
  file);
  `project/lib/features/minesweeper/domain/minesweeper_settings.dart`
  (new file).
- **Change type** — add.
- **Location** — three new, real, standalone files.
- **Dependencies** — `GameState`, `GameSettings`, both already
  established; `MinesweeperBoard`, above.

### The New Code

```dart
class MinesweeperState implements GameState {
  const MinesweeperState(this.board);
  final MinesweeperBoard board;

  @override
  bool get isComplete => board.isCleared || board.hitMine;
}

class MinesweeperMove {
  const MinesweeperMove({required this.row, required this.col});
  final int row;
  final int col;
}

class MinesweeperSettings implements GameSettings {
  const MinesweeperSettings();
}
```

### The Updated Project

All three files, real and brand new, shown in full above.

### Mechanical walkthrough

- `class MinesweeperState implements GameState { const
  MinesweeperState(this.board); ... }` — a real, already-established
  `implements` clause and `const`-constructible constructor, the
  identical real shape the concrete Sudoku `GameSession implements
  GameState` already established.
- `bool get isComplete => board.isCleared || board.hitMine;` — a real,
  already-established boolean-`||` expression — the one, real place
  this lesson's own SE lens (below) actually lives.
- `class MinesweeperMove { const MinesweeperMove({required this.row,
  required this.col}); ... }` — the identical, already-established
  real shape `SudokuMove` already used, real and genuinely smaller
  (Minesweeper needs no real, third `digit` value — only a real
  `(row, col)`).
- `class MinesweeperSettings implements GameSettings { const
  MinesweeperSettings(); }` — the identical, already-established real
  shape `SudokuSettings` already used.

### CS lens

Not applicable — three, plain, already-covered constructs; no new hard
concept of their own.

### SE lens

`MinesweeperState.isComplete` reports `true` on a real win *or* a real
loss — a real, deliberate, different choice from Sudoku's own,
existing `isComplete` (`board.isComplete`, real and only ever true on
a real, solved board; a real, failed Sudoku session, three real
mistakes in, never reports `isComplete: true` through the real,
generic contract at all). `GameState`'s own real contract never
mandates which real choice is correct — only that `GameSession<S, A>
.play` should stop calling `engine.apply` once it's genuinely `true`.
Minesweeper's own real choice (stop on any real, terminal outcome) and
Sudoku's own real choice (stop only on a real win) are both real,
legitimate, genuinely different answers to the identical real
question, proof the generic contract was never secretly shaped around
Sudoku's own particular real answer.

### Commands needed

None.

### Run it

Verified together with this lesson's own remaining Concept Units, in
the closing, full-lesson test run, below.

### Connect the pieces

Minesweeper now satisfies every real, small shape the generic platform
needs from a real game's own state and settings — the next Concept
Unit builds the real engine that actually connects them.

---

## Concept Unit: MinesweeperEngine

### The Problem

Nothing yet connects Minesweeper's own real board rules to the generic
`GameEngine<S, A>` contract — and, unlike Sudoku's own, this real
engine has no already-existing, real, mutable legacy object it's
forced to wrap.

> **Try it yourself first.** Given that `MinesweeperBoard.reveal`
> already returns a real, new, distinct board rather than mutating in
> place, what is the smallest, real `apply` body that achieves *full*,
> honest conformance to `GameEngine.apply`'s own documented "never
> mutates state" discipline — the real conformance Sudoku's own engine
> could only partially reach?

### Introducing the concept

No new isolated lab — delegating three real methods to already-real,
already-tested `MinesweeperBoard` code is not a new construct; its own
real proof lives in this lesson's own permanent test, run directly
against real project code, the identical real choice this project's
own earlier lessons already made for `SudokuEngine`/`GameRegistry`.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/minesweeper/domain/minesweeper_engine.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `MinePlacement`, `MinesweeperBoard`,
  `MinesweeperState`, `MinesweeperMove`, all above; `GameEngine`,
  `GameResult`, `GameSettings`, already established.

### The New Code

```dart
class MinesweeperEngine implements GameEngine<MinesweeperState, MinesweeperMove> {
  MinesweeperEngine({required this._minePlacement, this.rows = 4, this.cols = 4});
  final MinePlacement _minePlacement;
  final int rows;
  final int cols;

  @override
  MinesweeperState createInitialState(GameSettings settings) {
    final mines = _minePlacement.minePositions(rows, cols);
    return MinesweeperState(MinesweeperBoard(rows: rows, cols: cols, minePositions: mines));
  }

  @override
  MinesweeperState apply(MinesweeperState state, MinesweeperMove action) {
    return MinesweeperState(state.board.reveal(action.row, action.col));
  }

  @override
  GameResult resultFor(MinesweeperState state) {
    return GameResult(won: state.board.isCleared, score: 0);
  }
}
```

### The Updated Project

The file, real and brand new, shown in full above.

### Mechanical walkthrough

- `class MinesweeperEngine implements GameEngine<MinesweeperState,
  MinesweeperMove>` — a real, already-established `implements` clause,
  the identical real shape `SudokuEngine implements
  GameEngine<GameSession, SudokuMove>` already used, real and
  genuinely different type arguments.
- `MinesweeperEngine({required this._minePlacement, this.rows = 4,
  this.cols = 4});` — a real, already-established constructor, real
  and mixing one real, required, injected dependency with two real,
  defaulted, plain `int` parameters.
- `MinesweeperState createInitialState(GameSettings settings)` — a
  real, already-established method override; `settings`, real and
  genuinely unused (`MinesweeperSettings` carries no real fields), the
  identical real shape `SudokuEngine.createInitialState` already had.
- `MinesweeperState apply(MinesweeperState state, MinesweeperMove
  action)` — real and genuinely one line: `state.board.reveal(...)`
  already returns a real, new board; this method only wraps it in a
  real, new `MinesweeperState`. Real, full, honest conformance to
  `GameEngine.apply`'s own "never mutates state" discipline — `state`
  itself, the real parameter, is never once written to.
- `GameResult resultFor(MinesweeperState state)` — a real,
  already-established method override; `won: state.board.isCleared`
  reads the real board's own real getter directly; `score: 0` is a
  real, honest, literal, matching `GameResult.score`'s own real,
  documented allowance for a real game with no real scoring system.

### CS lens

Not applicable — `MinesweeperEngine` composes already-covered
mechanisms (the generic `GameEngine` contract, real delegation to
already-tested board code); no new hard concept of its own.

### SE lens

The real, direct contrast this Concept Unit makes explicit:
`SudokuEngine.apply` could only partially honor `GameEngine.apply`'s
own "never mutates state" discipline, real and honestly documented as
such, because it wraps an already-existing, real, mutable
`GameSession`. `MinesweeperEngine.apply`, real and built from scratch
this lesson with no such legacy, achieves full, real, honest
conformance for free — real, direct, concrete proof that the generic
contract's own "never mutates" promise was always achievable in full;
Sudoku's own real, partial conformance was a real, honest, deliberate
cost of wrapping already-existing, real, working code, never a real
limitation of the contract itself.

### Commands needed

None.

### Run it

Real, run output shown above, from
`project/test/minesweeper_engine_test.dart`.

### Connect the pieces

Minesweeper's own rules are now genuinely reachable through the
generic contract — the final Concept Unit registers it, alongside
Sudoku, in the identical, real, shared registry, and proves both play
correctly at once.

---

## Concept Unit: minesweeperGameDefinition and the shared registry

### The Problem

Curriculum's own real, closing test for this whole lesson: can this
real, second, completely different game actually stand alongside
Sudoku in the identical, real, shared `GameRegistry`, played through
the identical, real, generic `GamePlatform`, with zero real changes to
anything Sudoku already had?

### Introducing the concept

No new isolated lab — registering a real, second `GameDefinition` in
an already-established, real `GameRegistry`, and starting a real,
second game through an already-established, real `GamePlatform`, are
both direct repeats of already-proven, real mechanisms.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/minesweeper/domain/minesweeper_game_definition.dart`
  (new file).
- **Change type** — add.
- **Location** — a new, real, standalone file.
- **Dependencies** — `GameDefinition`, already established.

### The New Code

```dart
const minesweeperGameDefinition = GameDefinition(
  id: 'minesweeper',
  name: 'Minesweeper',
  description: 'Reveal every real, safe cell without revealing a real mine.',
  icon: 'flag',
  supportedModes: ['classic'],
);
```

### The Updated Project

The file, real and brand new, shown in full above.

### Mechanical walkthrough

- `const minesweeperGameDefinition = GameDefinition(id: 'minesweeper',
  ...)` — the identical, already-established real shape
  `sudokuGameDefinition` already used, real and carrying a real,
  distinct `id` — the one, real value `GameRegistry` keys every real
  entry by.

### CS lens

Not applicable.

### SE lens

Not applicable — every real design decision this Concept Unit needed
was already made, and already justified, by the immediately preceding
lesson's own real `GameDefinition` fields.

### Commands needed

None.

### Run it

Real, run output shown below, from
`project/test/minesweeper_engine_test.dart`'s own real, closing,
capstone test.

### Connect the pieces

Every real piece this lesson built now composes with every real piece
every earlier lesson in this phase already built — proven end to end,
below.

---

## Connect the pieces

One real, concrete trace, start to finish, proving Sudoku and
Minesweeper genuinely coexist through the identical, real, generic
seam.

1. `GameRegistry()..register(sudokuGameDefinition)..register
   (minesweeperGameDefinition)` — a real, single, shared registry,
   real and holding two, genuinely different, real games at once.
2. `GamePlatform(registry).startGame(gameId: 'sudoku', engine:
   SudokuEngine(...), settings: const SudokuSettings())` — a real,
   complete, winning Sudoku game, played the identical real way this
   project's own earlier lessons already proved, entirely unmodified.
3. `GamePlatform(registry).startGame(gameId: 'minesweeper', engine:
   MinesweeperEngine(...), settings: const MinesweeperSettings())` — a
   real, complete, winning Minesweeper game (two real flood-fill
   cascades, six real, individual reveals), played entirely through
   the identical, real, generic `session.play(action)` method Sudoku's
   own session just used.
4. Both real results — `GameResult(won: true, score: 100)` for Sudoku,
   `GameResult(won: true, score: 0)` for Minesweeper — read back
   correctly, each through its own real, distinct `GameEngine
   .resultFor`, neither one ever aware the other real game exists.

The real, second game that proves the first was never special —
curriculum's own real "architectural exam," passed: every real,
generic contract this whole phase built already worked for a real
game nobody had written yet.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause. Since `MinesweeperEngine` and every real type
around it are real, permanent project code from their own first line,
this lesson's own real proof lives in a new, permanent
`project/test/minesweeper_engine_test.dart`, not a throwaway lab.

Two real, first-attempt mistakes, both caught immediately and fixed in
place: this lesson's own hand-computed list of "the six, remaining
cells needed for a real, full win" originally named one real cell
already revealed by an earlier flood fill, and omitted a real,
genuinely unrevealed one — caught directly by a real, failing
`isCleared` assertion, not assumed correct, and fixed by recomputing
the real, remaining cell set by hand a second time; and
`MinesweeperBoard._`'s own first, real, private constructor used a
colon-initializer list instead of `this.field` shorthand, triggering
the identical, already-existing `prefer_initializing_formals` info
this project's own `SudokuEngine` constructor already carries, fixed
identically.

**The real, mandatory constraint, verified directly, not assumed:**
every real file this lesson touches is either brand new
(`features/minesweeper/**`, `test/minesweeper_engine_test.dart`) or
was never opened at all — no file under `features/sudoku/` or
`game_platform/` was edited this lesson.

```
flutter analyze .
57 issues found. (ran in 5.9s)
```

Unchanged from this lesson's own pre-change baseline, checked by real
category — zero new issues, zero new categories, after the one, real,
first-attempt fix above.

```
flutter test
...
00:24 +108: All tests passed!
```

108 real test-file-level checks, up from 102 — six new, all in a new,
permanent `minesweeper_engine_test.dart`. Adding a real, second,
completely different game produced zero regressions anywhere else in
this app; zero flakes on this lesson's own single, real, full-suite
run. Full, honest narrative in `verification/lesson-72/run-log.md`.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.
