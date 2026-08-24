# Lesson 45: Data Shaped for Carrying, Not for Deciding

**DTOs vs domain objects**

## What you will build

A new, real, minimal class, `SudokuBoardDto` — two fields, `cells` and
`givenCells`, and nothing else: no methods, no validation, no rules.
It's not wired into the real app yet (that's Lesson 46's own job,
curriculum's own next bullet, "Mapping") — this lesson only defines the
real shape and proves, with two real, run demonstrations, exactly why
`SudokuBoard`/`GameSession` themselves could never safely take its
place. The transferable problem: curriculum.md's own Lesson 45 bullet
asks why `SudokuGame` and `SudokuGameDto` are different — this project
has no database or network yet, so this lesson answers with the one
real, present, motivating gap it does have: `main.dart`'s own
`_cellsOf`/`_givenCellsOf` functions already compute this exact real
data shape, twice, separately, every time the board renders.

## What you need to know first

- Lesson 11 ("A Shape of Data You Define") — classes, fields,
  constructors — `SudokuBoardDto`'s own real shape; that lesson's own
  encapsulation focus is exactly what this lesson contrasts it against.
- Lesson 34 ("Connecting UI to the Sudoku engine") — `_cellsOf`/
  `_givenCellsOf`, the two real functions in `main.dart` this lesson's
  own new type is motivated by.
- Lesson 39 ("Naming and Injecting a Dependency") — `Clock`, reused as
  this lesson's own central real example of something that can never be
  data.
- Lesson 16 ("Work That Finishes Later") — this curriculum's only prior
  contact with `dart:convert`-adjacent ideas is indirect; this lesson is
  the first to actually import and run `dart:convert`'s own real
  `jsonEncode`.

## Terms used in this lesson

- **DTO (Data Transfer Object)** — a real, minimal class whose only real
  job is carrying data across a boundary — a network call, a database
  row, a file — with no behavior, no validation, and no rules of its
  own. Exists so the shape of data crossing a boundary can change
  independently of the shape a domain object needs internally for its
  own real logic.
- **Domain object (reappearing sense, formalized)** — a real class like
  `SudokuBoard`/`GameSession`, carrying both data *and* the real rules
  that keep that data valid — the opposite real shape from a DTO.
- **Serialization** — converting a real, in-memory value into a real,
  storable or transmittable form (here, JSON text) — and the reverse,
  **deserialization**. Exists as a named boundary because a running
  program's own real objects (with real behavior, real references to
  other objects) don't have an obvious, unique text form the way a
  plain number or string does.
- **`toJson()` (the convention, not a specific method yet)** — a real,
  informal Dart convention: a method named exactly `toJson`, returning
  a `Map<String, dynamic>` or another JSON-safe value, that
  `dart:convert`'s own `jsonEncode` looks for and calls automatically
  on any object it doesn't already know how to encode directly.

## Objects and methods used

- **`SudokuBoard` (reappearing, Lesson 11, 17-24)**
  - *What it is:* this project's own real, working Sudoku engine —
    Concept Unit 1's own central example of a domain object.
  - *Implementation:* `class SudokuBoard` (`project/lib/sudoku_board.dart`),
    real methods `placeDigit`, `candidatesFor`, `solve`,
    `classifyDifficulty`, and more; real private fields `_grid`,
    `_isGiven`.
  - *Its use:* contrasted directly against this lesson's own new
    `SudokuBoardDto`.
  - *Type:* a plain class.
  - *Responsibility:* unchanged from every earlier lesson — enforce
    every real Sudoku rule.
  - *Depends on:* `dart:math`'s `Random`.
  - *Connects to:* read by `GameSession`; this lesson adds no new real
    connection.
  - *Shape:* Domain layer (Lesson 41).

- **`Clock` (reappearing, Lesson 39, 44)**
  - *What it is:* the real, minimal interface naming "the ability to
    report the current moment."
  - *Implementation:* `abstract class Clock { DateTime now(); }`
    (`project/lib/clock.dart`).
  - *Its use:* Concept Unit 2's own central real example of something
    that structurally cannot ever become a DTO — an interface names a
    capability, not data, and has no real fields to serialize at all.
  - *Type:* an `abstract class`.
  - *Responsibility:* unchanged from Lesson 39.
  - *Depends on:* nothing.
  - *Connects to:* held by `GameSession`, which is exactly why
    `GameSession` itself can never be serialized directly either — Lesson
    39's own real dependency, reappearing here as this lesson's own real
    reason.
  - *Shape:* Domain/Infrastructure seam.

- **`jsonEncode` (new to this curriculum)**
  - *What it is:* `dart:convert`'s own real, top-level function
    converting a real Dart value into real JSON text.
  - *Implementation:* `String jsonEncode(Object? object, {Object?
    Function(dynamic)? toEncodable})` — real signature, `dart:convert`.
    Directly encodes `num`, `String`, `bool`, `null`, `List`, and `Map`
    (with `String` keys) values; for anything else, calls a real
    `toJson()` method on the object if one exists, and throws a real
    `JsonUnsupportedObjectError` if it doesn't.
  - *Its use:* this lesson's own real diagnostic tool, proving rather
    than asserting which real shapes can and cannot be converted to
    JSON.
  - *Type:* a top-level function.
  - *Responsibility:* produce real, valid JSON text from a real Dart
    value, or fail loudly, with a real, specific error, when it
    genuinely cannot.
  - *Depends on:* the real value passed in; optionally, that value's own
    real `toJson()` method.
  - *Connects to:* called directly in both of this lesson's own real,
    throwaway labs, below.
  - *Shape:* `dart:convert`, part of the Dart SDK itself — outside this
    project's own code, a real standard-library boundary.

- **`SudokuBoardDto`**
  - *What it is:* a new, real, minimal class carrying exactly the real
    data `main.dart`'s own `_cellsOf`/`_givenCellsOf` functions already
    compute — nothing more.
  - *Implementation:* `class SudokuBoardDto { SudokuBoardDto(this.cells,
    this.givenCells); final List<List<int?>> cells; final
    List<List<bool>> givenCells; }` (`project/lib/sudoku_board_dto.dart`,
    new file).
  - *Its use:* this lesson's own central new subject — defined now,
    wired into the real app in Lesson 46.
  - *Type:* a plain class — no domain rules, no methods beyond its own
    constructor.
  - *Responsibility:* carry exactly two real, already-JSON-safe values
    together as one real, named value, instead of two separate `List`
    values traveling independently.
  - *Depends on:* nothing beyond `dart:core`'s own real `List`/`int`/
    `bool` types.
  - *Connects to:* not yet connected to anything real in `project/lib/`
    — Lesson 46's own explicit job.
  - *Shape:* not yet placed in any of Lesson 41's four named layers;
    Lesson 46 will place it precisely once it's actually wired in.

---

## Concept Unit 1: What a Domain Object Actually Carries

### The Problem

`SudokuBoard` holds a real 9x9 grid of digits — data, unmistakably. It
also holds `placeDigit`, `candidatesFor`, `solve`, `classifyDifficulty`,
and a dozen more real methods enforcing real rules about that data. Is
`SudokuBoard` "data," or something more?

> **Socratic prompt:** if you stripped every real method out of
> `SudokuBoard` — kept only `_grid` and `_isGiven` — could you still
> call it `SudokuBoard`, or would it just be two `List`s with a name
> attached? Second: `GameSession.enterDigit` (Lesson 40) auto-starts a
> session, rejects an illegal move, tracks mistakes, and auto-completes
> — real, active decisions, made by the object itself, about its own
> data. Does a plain `List<List<int?>>`, on its own, ever make a
> decision like that?

### Project Change

- **Reference Source:** no reference counterpart — this unit reasons
  about already-real code (`project/lib/sudoku_board.dart`,
  `project/lib/game_session.dart`, both reread fresh this session), not
  new code.
- **Files affected:** none.
- **Change type:** none — reasoning only.
- **Location:** `SudokuBoard`'s own real method list; `GameSession
  .enterDigit`'s own real body.
- **Dependencies:** none.

### The New Evidence

`SudokuBoard`'s own real, already-established public surface (method
names only, real signatures unchanged since their own original
lessons):

```dart
void placeDigit(int row, int col, int digit)
List<int> candidatesFor(int row, int col)
bool solve({Random? random})
Difficulty classifyDifficulty()
bool isValidStartingGrid()
```

### Updated Project

Not applicable — nothing changed; the real method list above is a
direct, unmodified read of the already-real file.

### Isolate and Discard

No throwaway lab — `SudokuBoard`'s own real, already-built method list
is already the concrete evidence. This real distinction — a class
carrying both data and the rules protecting it, as opposed to data
alone — is called a **domain object** (Terms, above), the real, formal
name for what `SudokuBoard`/`GameSession` have already been since
Lessons 11 and 36.

### Mechanical Walkthrough

- `void placeDigit(int row, int col, int digit)` — already given full
  treatment across Lessons 14 and 18; reread here as one real, concrete
  instance of "a rule, not just a write" — placing a digit isn't a bare
  assignment, it's a real decision that can be refused.
- `List<int> candidatesFor(int row, int col)` — already given full
  treatment in Lesson 18; reread here as a real method that *computes*
  new information from existing data, something a plain `List` cannot
  do on its own.
- `bool solve({Random? random})` — already given full treatment in
  Lesson 19; reread here as the most extreme real example in this
  file: an entire real algorithm, living inside what could, in
  principle, have just been a `List<List<int?>>`.
- `Difficulty classifyDifficulty()` — already given full treatment in
  Lessons 21 and 42; reread here as a real method producing an entirely
  new real value (a `Difficulty`) that doesn't exist anywhere in the
  raw grid data at all — it's *derived*, not stored.
- `bool isValidStartingGrid()` — already given full treatment in Lesson
  24; reread here as a real example of the class checking its own real
  data's own internal consistency, something a DTO, by definition,
  never does.

### CS Lens

The **Rich Domain Model** — an object that carries both its own data
and the real rules that keep that data valid, contrasted with an
**Anemic Domain Model** (a class that's only real fields, with logic
scattered elsewhere) — is a hard concept.

```
Also recognized in: a bank account object that refuses an overdraft
itself, rather than trusting every caller to check first; a thermostat
that refuses to set a target below its own real safety minimum, not
merely reporting the number back; a vending machine that physically
cannot dispense without real payment already registered, not a bare
counter of "items available"
```

### SE Lens

The real principle is keeping **behavior next to the data it protects**
— `SudokuBoard` refuses an illegal move itself, rather than trusting
every real caller (`GameSession`, `main.dart`, a future second game) to
remember every rule independently. The alternative not chosen: a plain
`List<List<int?>>` with validation logic duplicated at every real call
site — genuinely how Lesson 17 itself demonstrated the problem, with its
own real, deliberately-uncorrected `board[0][0] = 500` corruption demo.
The real tradeoff: `SudokuBoard` is a heavier, more complex real class
than a bare `List` would be, for the payoff every later lesson since 17
has depended on. The honest, present cost: this richness is exactly
what makes `SudokuBoard` unsuitable to hand directly across a real
boundary — Concept Unit 2's own subject.

### Run It

No command to run — this unit reuses already-real, already-verified
code and method signatures.

### Connect

`SudokuBoard`/`GameSession` are real domain objects — rich with
behavior. Concept Unit 2 asks what actually goes wrong if you try to
serialize one directly.

---

## Concept Unit 2: What Happens When You Try to Serialize One Directly

### The Problem

Suppose this app needed to save a `GameSession` to a file today (Phase
6's own future job). The most direct, naive approach: hand the real
`GameSession` object straight to `dart:convert`'s own `jsonEncode`. Does
that actually work?

> **Socratic prompt:** `GameSession` holds a real `Clock` field — an
> interface, `abstract class Clock { DateTime now(); }`, with no real
> data fields of its own at all. If you tried to write down "what
> `Clock` currently *is*" as JSON text, what would you even put? Second:
> now imagine a much simpler real class holding only a
> `List<List<int?>>` field, nothing else — no `Clock`, no methods. Would
> `jsonEncode` succeed on *that* class directly, with no extra work — or
> does even a genuinely plain-data class need something more?

### Project Change

- **Reference Source:** no reference counterpart — a from-scratch,
  isolated demonstration using `dart:convert`, a real Dart SDK library,
  not this project's own code.
- **Files affected:** none — both real labs, below, are throwaway.
- **Change type:** none.
- **Location:** n/a.
- **Dependencies:** `dart:convert`, part of the Dart SDK itself.

### The New Code

```dart
import 'dart:convert';

class MinimalSession {
  MinimalSession(this.clock);
  final Clock clock;
}

void main() {
  final session = MinimalSession(SystemClock());
  try {
    final encoded = jsonEncode(session);
    print('encoded: $encoded');
  } catch (e) {
    print('real error: $e');
  }
}
```

### Isolate and Discard

Run for real (`dart run`), output captured:

```
real error: Converting object to an encodable object failed: Instance of 'MinimalSession'
```

A real, second lab — this time a genuinely plain-data class, no
interface, no behavior:

```dart
import 'dart:convert';

class MinimalBoardDto {
  MinimalBoardDto(this.cells);
  final List<List<int?>> cells;
}

void main() {
  final dto = MinimalBoardDto([
    [1, null, 3],
    [null, 5, null],
  ]);
  try {
    final encoded = jsonEncode(dto);
    print('encoded: $encoded');
  } catch (e) {
    print('real error: $e');
  }
  final rawEncoded = jsonEncode(dto.cells);
  print('raw field encoded directly: $rawEncoded');
}
```

Run for real, output captured:

```
real error: Converting object to an encodable object failed: Instance of 'MinimalBoardDto'
raw field encoded directly: [[1,null,3],[null,5,null]]
```

Both labs discarded — neither file exists inside `project/`. This is
this lesson's own central, genuinely surprising real proof: **even the
plain-data class fails, identically to the one holding a `Clock`** —
`jsonEncode` only ever directly handles `num`/`String`/`bool`/`null`/
`List`/`Map` values, or an object with a real `toJson()` method; neither
lab's class has one. But the *raw field* (`dto.cells`, already a
`List<List<int?>>`) encodes successfully with zero extra work, because
its own real, nested contents are already `int`/`null`/`List` all the
way down. This is called being **JSON-safe** — every real value nested
inside is already one of `jsonEncode`'s own directly-supported types.
`MinimalBoardDto` is one short, mechanical `toJson()` method away from
being JSON-safe itself (Lesson 46's own job); `MinimalSession` can
never get there at all, because "the current moment, however it's
obtained" has no real JSON representation whatsoever.

### Mechanical Walkthrough

- `import 'dart:convert';` — Dart's own real `import` directive (Lesson
  41, reappearing), naming `dart:convert`'s own real, built-in library
  — this curriculum's first real use of it.
- `class MinimalSession { MinimalSession(this.clock); final Clock
  clock; }` — a real, minimal class (Lesson 11, reappearing) holding
  exactly one real field, typed `Clock` — an abstraction, not data.
- `jsonEncode(session)` — the real function call this whole unit exists
  to test, already given full treatment in this lesson's own Objects and
  methods section, above.
- `try { ... } catch (e) { ... }` — Dart's own real `try`/`catch`
  (Lesson 14, reappearing), here catching whatever real error
  `jsonEncode` throws rather than letting the whole program crash, so
  the real error text can be captured and printed.
- `print('real error: $e')` — real string interpolation (Lesson 5,
  reappearing), printing the caught error object's own real `toString()`
  output.
- `class MinimalBoardDto { MinimalBoardDto(this.cells); final
  List<List<int?>> cells; }` — the same real class shape, this time with
  a field typed `List<List<int?>>` instead of `Clock` — real, nested
  data all the way down.
- `jsonEncode(dto.cells)` — a real property access (`.cells`) followed
  by the same real function call, this time on the raw field value
  directly rather than the wrapping object.

### CS Lens

Not repeated separately — this unit's own real evidence is the direct,
run proof of Concept Unit 1's already-given Rich-Domain-Model/DTO
contrast, above: an interface (`Clock`) has no real JSON shape at all;
a nested-primitive value (`List<List<int?>>`) does, once wrapped in a
real `toJson()`.

### SE Lens

The real principle is that **serializability is a structural property**,
not something achieved by merely "having fields." The alternative not
chosen: assume any class without obviously-weird fields is "basically
data" and try to serialize it directly — which this unit's own real,
run evidence just disproved for `MinimalBoardDto` too. The real
tradeoff: writing a real, dedicated DTO type costs one small, new,
real file; the payoff is a type that's *provably* JSON-safe, checked by
the compiler's own real type system (every field typed something
`jsonEncode` or a short, mechanical `toJson()` can actually handle),
rather than discovered to be unsafe only when a real save operation
throws in production. The honest, present cost: this project doesn't
save anything yet, so this real proof is preparation for Phase 6, not a
bug being fixed today.

### Run It

Real, captured output, both labs (`dart run`), shown together above
under Isolate and Discard, per the Verification Rule's batching
preference (two small, independent, non-interfering scripts, run
separately since one deliberately throws and the other doesn't, but
reported together here as one lesson-time verification pass).

### Connect

Both labs prove the same real point from two real angles: a domain
object's own real richness — whether that's active behavior (`Clock`)
or simply not yet having a `toJson()` — is exactly what stands between
it and a real boundary. Concept Unit 3 defines a real type built to
never have that problem in the first place.

---

## Concept Unit 3: A Real Type Built Only to Carry Data

### The Problem

`main.dart` already computes exactly the real data shape a DTO for
`SudokuBoard` would need — twice, separately, every time the board
renders:

```dart
List<List<int?>> _cellsOf(SudokuBoard board) {
  return List.generate(
    SudokuBoard.size,
    (row) => List.generate(SudokuBoard.size, (col) => board.valueAt(row, col)),
  );
}

List<List<bool>> _givenCellsOf(SudokuBoard board) {
  return List.generate(
    SudokuBoard.size,
    (row) => List.generate(SudokuBoard.size, (col) => board.isGivenAt(row, col)),
  );
}
```

Both real functions always get called together, on the same real board,
and their two real results always travel together afterward, as two
separate `List` parameters to `SudokuBoardView`. Nothing currently
names that pairing as its own real thing.

> **Socratic prompt:** given Concept Unit 2's own real proof that
> `List<List<int?>>` and `List<List<bool>>` are both already JSON-safe
> on their own, what would the smallest real class holding both of them
> together, with no methods at all, look like? Second: `main.dart`'s
> own real call site passes `cells: _cellsOf(session.board)` and
> `givenCells: _givenCellsOf(session.board)` as two separate, real
> arguments. If a real bug someday passed `_cellsOf` for one board and
> `_givenCellsOf` for a *different* board by mistake, would the compiler
> catch it — and would a single, combined value make that particular
> real mistake harder to make?

### Project Change

- **Reference Source:** `project/lib/main.dart`, lines 18-30 (the real,
  current `_cellsOf`/`_givenCellsOf` functions, read fresh this
  session, quoted in full above) — this unit's own new type is a
  from-scratch addition motivated directly by that real, already-existing
  duplication, not a port of any external reference.
- **Files affected:** `project/lib/sudoku_board_dto.dart` (new).
- **Change type:** add.
- **Location:** a brand-new file.
- **Dependencies:** none.

### The New Code

```dart
class SudokuBoardDto {
  SudokuBoardDto(this.cells, this.givenCells);
  final List<List<int?>> cells;
  final List<List<bool>> givenCells;
}
```

### Isolate and Discard

No throwaway lab — Concept Unit 2's own second real lab
(`MinimalBoardDto`) already is, structurally, this exact shape; this
unit's own new code is that same real idea, given its own real,
permanent name and file, matching what `_cellsOf`/`_givenCellsOf`
actually need to carry together.

### Mechanical Walkthrough

- `class SudokuBoardDto` — a real class declaration (Lesson 11,
  reappearing), deliberately with no `extends`/`implements` — a DTO
  commits to no real contract beyond holding its own data.
- `SudokuBoardDto(this.cells, this.givenCells);` — a real constructor
  using `this.field` shorthand (Lesson 11, reappearing) for both real
  fields at once — the smallest possible real way to require both
  values together, so a `SudokuBoardDto` can never exist with only one
  of them set.
- `final List<List<int?>> cells;` — a real field (Lesson 11,
  reappearing), the identical real type `_cellsOf` already returns.
- `final List<List<bool>> givenCells;` — a real field, the identical
  real type `_givenCellsOf` already returns.

### CS Lens

Not repeated separately — this is the concrete, real instance of the
**DTO** concept Concept Unit 1's own CS lens context already covers
generally (a rich vs. anemic model contrast); its own unrelated
recurrences (a REST API's own JSON request body, a database row before
an ORM maps it to a real model object, a network packet's own header
struct) apply here directly, each one a real, minimal, behavior-free
carrier, same as `SudokuBoardDto`.

### SE Lens

The real principle is the **Single Responsibility Principle**, applied
narrowly: `SudokuBoardDto`'s only real job is holding these two real
values together — not rendering them, not validating them, not deriving
anything from them. The alternative not chosen: leave `cells`/
`givenCells` as two independent real `List` values forever, trusting
every real call site to keep them paired correctly by convention, the
same real risk this unit's own Socratic prompt named directly. The real
tradeoff: one new, tiny, real file, for a real type that makes "these
two values belong together" a fact the compiler can see, not just a
convention a reader has to remember. The honest, present cost: this
class isn't actually used anywhere in `project/lib/` yet — `main.dart`
still calls `_cellsOf`/`_givenCellsOf` directly, unchanged; wiring
`SudokuBoardDto` in for real, replacing that duplication, is Lesson 46's
own explicit job ("Mapping"), not this one's.

### Commands Needed

- **`flutter analyze .`** — run from `project/`, this session, to
  confirm the new, unused-but-valid file introduces no real error.

### Run It

Real, captured output:

```
26 issues found.
```

— identical count and categories to Lesson 44's own last real run; the
new file, having no `print` calls and no relative `lib` import, adds
zero new lint issues. (`flutter test` not rerun — nothing in
`project/lib/` that any real test exercises changed; `SudokuBoardDto`
has no caller yet to test.)

### Connect

`main.dart`'s own real duplication motivated this unit's new type;
Lesson 46 is where that real duplication actually gets replaced by it.

---

## Connect the Pieces

`SudokuBoard`/`GameSession` stay exactly what they've always been —
rich, real domain objects, carrying both data and the rules that
protect it, confirmed once more by Concept Unit 1's own real method
list and proven, concretely, by Concept Unit 2's own real `jsonEncode`
failure to be structurally unable to cross a real boundary directly.
`SudokuBoardDto`, brand new this lesson, is built to be the opposite:
two real, already-JSON-safe fields, no behavior, motivated by
`main.dart`'s own real, already-duplicated `_cellsOf`/`_givenCellsOf`
functions rather than an imagined future need. Nothing in the real,
running app changed today — `SudokuBoardDto` exists, compiled and
verified, but uncalled — because the real bridge between these two
shapes, the actual mapping logic, is Lesson 46's own job next.
