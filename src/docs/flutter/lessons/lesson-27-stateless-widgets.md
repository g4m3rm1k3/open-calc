# Lesson 27: A Widget You Wrote Yourself

**What you will build:** `project/lib/main.dart`'s own inline
`MaterialApp(home: Scaffold(...))` expression — the exact real tree
Lesson 26 built and proved, on screen, twice — gets factored into two
real, named, reusable widget classes: `SudokuApp` (this project's own
real root widget) and `_PlaceholderMessage` (a small, configurable,
private widget). The transferable problem: an inline expression works,
but it can't be given a name, reused, tested by importing it directly,
or grown without the whole `build()` method growing with it — writing
your own `StatelessWidget` subclass is how Flutter code stays
readable as it grows, not a separate feature from what Lesson 25 and 26
already built.

**What you need to know first:**
- Lesson 5 — `final` and `const`, reused throughout as the reason every
  widget in this lesson's own code stays a cheap, compile-time-constant
  value.
- Lesson 8 — `required` named parameters, real-analyzer-error-proved to
  reject an omitted one.
- Lesson 11 — constructors with `this.field` shorthand; Dart's real,
  per-library (not per-class) privacy, real-proved with a leading
  underscore.
- Lesson 12 — composition: one object built from other, smaller objects
  working together.
- Lesson 13 — `identical()`, reused here inside a real `same()` matcher.
- Lesson 24 — the real `test()` shape (distinct from `testWidgets()`),
  reused directly in this lesson's own throwaway lab.
- Lesson 25 — `Widget`, `StatelessWidget`, `BuildContext`, and the real,
  quoted `createElement()`/`build()` mechanics every `StatelessWidget`
  subclass — including this lesson's own two new ones — is built on.
- Lesson 26 — the real, exact `MaterialApp`/`Scaffold`/`AppBar`/
  `Center`/`Text` tree this lesson factors apart; the real,
  deliberately-left-open debt its own SE lens named (`main_smoke_test
  .dart` duplicating that tree by hand instead of importing it).

**Pipeline diagram.** This curriculum's own widget pipeline, established
across Lessons 25-26:

```
Widget
  ↓ createElement() / canUpdate()
Element
  ↓ createRenderObject() / updateRenderObject()
RenderObject
  ↓ layout → paint → composite
Pixels
```

Carrying Lesson 26's own real, concrete value through every stage built
so far: the literal string `"Sudoku"`, wrapped in a `Text` **Widget**,
sits inside an `AppBar` **Widget**, inside a `Scaffold` **Widget**, each
already real-proved (Lesson 26) to inflate into its own real **Element**
and, where applicable, its own real **RenderObject**, ultimately reaching
real **Pixels** on both Chrome and a physical Android device. This
lesson touches only the very first stage — **Widget** — and specifically
*how that Widget gets authored*: as a named, reusable class instead of
an inline expression built fresh, unnamed, inside `runApp(...)`'s own
argument list. Nothing about `Element`, `RenderObject`, or the frame
pipeline changes; this lesson's own real test suite (below) is the proof
that the exact same tree still results.

**Terms used in this lesson:**
- **`super.key` (super-initializing formal parameter)** — new: a
  constructor parameter written as `super.key` instead of a plain name,
  which both declares the parameter *and* forwards it straight to the
  superclass's own same-named constructor parameter, with no method body
  needed to write that forwarding by hand. It exists so the extremely
  common case — "this constructor accepts a `key`, and its only job is
  to hand it to `Widget`'s own constructor unchanged" — doesn't need
  four extra lines of `Key? key, super(key: key)` boilerplate the way it
  would in a language without this specific shorthand.
- **Library privacy (leading underscore)** — reappearing (Lesson 11):
  reused here to name `_PlaceholderMessage` — a widget this app's own
  `main.dart` uses but nothing outside that file needs to construct
  directly.
- **`required`** — reappearing (Lesson 8): reused on
  `_PlaceholderMessage`'s own `message` parameter, making it a real
  compile error to construct one without saying what message to show.
- **`this.field` shorthand** — reappearing (Lesson 11): reused in both
  of this lesson's own new constructors.
- **Composition** — reappearing (Lesson 12): the hard concept underneath
  both of this lesson's own new classes — `SudokuApp`'s own `build()`
  *is* a `MaterialApp` built from a `Scaffold` built from an `AppBar`
  and a `_PlaceholderMessage`, each one a real, independent object, not
  one large object doing every job itself.
- **Self-package import** — new: an import written as
  `package:open_calc_sudoku/main.dart` — this project's own real package
  name (from `pubspec.yaml`'s own `name:` field), not a relative path
  like `../lib/main.dart` and not an external dependency. It exists so a
  file in `test/` can reach a file in `lib/` the same well-defined way
  any other package would be imported, which is also exactly what
  Lesson 26's own real `avoid_relative_lib_imports` lint (surfaced on
  `bin/sudoku_console.dart` and the old `sudoku_board_test.dart`) was
  asking every file in this project to do instead of a relative import.

**Objects and methods used:**

- **`SudokuApp`**
  - *What it is:* this project's own real, permanent root widget — the
    one value `main()` now hands to `runApp`.
  - *Implementation:* real, from `project/lib/main.dart`:
    `class SudokuApp extends StatelessWidget { const SudokuApp({super.key}); @override Widget build(BuildContext context) { ... } }`.
  - *Its use:* replaces Lesson 26's own inline `MaterialApp(...)`
    expression with a named class `runApp(const SudokuApp())` can
    construct in one place and `main_smoke_test.dart` can import and
    `pumpWidget` directly, resolving Lesson 26's own named debt.
  - *Type:* a concrete class extending `StatelessWidget`.
  - *Responsibility:* to be this app's own single, real, top-level
    description — everything Lesson 26 built (`MaterialApp`, `Scaffold`,
    `AppBar`, the body) now lives inside its own `build()`, not scattered
    inline inside `main()`.
  - *Depends on:* an optional `Key`, forwarded via `super.key`.
  - *Connects to:* constructed once, by `main()`; its own `build()`
    constructs a real `MaterialApp`.
  - *Shape:* a public class (no leading underscore) — this app's own
    real, top-level widget, meant to be constructed from outside this
    file (`main()`, and now `main_smoke_test.dart`).

- **`_PlaceholderMessage`**
  - *What it is:* a small, real, reusable widget that centers a single,
    caller-supplied string — a real, working stand-in for whatever
    Lesson 31 eventually puts in this exact spot.
  - *Implementation:* real, from `project/lib/main.dart`:
    `class _PlaceholderMessage extends StatelessWidget { const _PlaceholderMessage({required this.message}); final String message; @override Widget build(BuildContext context) => Center(child: Text(message)); }`.
  - *Its use:* constructed once, inside `SudokuApp.build()`, as
    `_PlaceholderMessage(message: 'Board goes here')` — the exact same
    real string Lesson 26 already proved renders correctly, now passed
    in rather than hard-coded inside a `Text` two levels deep.
  - *Type:* a concrete class extending `StatelessWidget`, private to
    `main.dart` (leading underscore).
  - *Responsibility:* to take one real `String` and turn it into a
    correctly centered, real widget — nothing else; it doesn't know or
    care what the message actually says.
  - *Depends on:* a `String`, `message`, required at construction.
  - *Connects to:* constructed by `SudokuApp.build()`; its own `build()`
    constructs a `Center` wrapping a `Text`, reappearing unchanged from
    Lesson 26.
  - *Shape:* a private, file-local widget — real, reusable *within this
    file*, deliberately not exposed beyond it, per Lesson 11's own
    already-real library-privacy proof.

- **`Key`**
  - *What it is:* reappearing in full from Lesson 25 — the real,
    optional value distinguishing otherwise-identical widgets.
  - *Implementation:* real, from this lesson's own throwaway lab:
    `const testKey = Key('greeting-key');` — `Key`'s own real, simplest
    concrete subtype, `ValueKey<String>` (constructed here via its own
    real `Key('...')` convenience constructor), wraps one real string
    value.
  - *Its use:* this lesson's own lab constructs one for real and proves,
    directly, that `super.key` really does carry it through to
    `Widget.key` unchanged.
  - *Type:* an `abstract class`.
  - *Responsibility:* unchanged from Lesson 25 — to give a widget an
    identity `Widget.canUpdate` can compare beyond its own `runtimeType`.
  - *Depends on:* nothing to construct the simplest real subtype used
    here.
  - *Connects to:* handed into `Greeting(key: testKey)` in this lesson's
    own lab; read back via `greeting.key`.
  - *Shape:* unchanged from Lesson 25 — a small, public, optional field
    every real `Widget` carries.

- **`test()`**
  - *What it is:* reappearing in full from Lesson 24 — the plain,
    non-widget test function, distinct from Lesson 25's own
    `testWidgets()`.
  - *Implementation:* real signature shape, from `package:test` (used
    directly, the same package `flutter_test` itself builds on):
    `void test(String description, void Function() body)`.
  - *Its use:* this lesson's own throwaway lab uses `test()`, not
    `testWidgets()`, because checking `greeting.key`'s own value needs no
    real running widget tree — just constructing an object and reading a
    field, exactly the shape Lesson 24's own real Sudoku engine tests
    already used.
  - *Type:* a top-level function.
  - *Responsibility:* to run a synchronous block of real code and report
    pass/fail based on whether every `expect()` inside it held.
  - *Depends on:* a description and a callback with no required
    parameters.
  - *Connects to:* called twice in this lesson's own lab file; each body
    calls `expect()`.
  - *Shape:* the same public, permanent testing API this whole
    curriculum has used since Lesson 24, still valid and preferred here
    specifically because no widget tree is actually needed.

- **`same()`**
  - *What it is:* a real `Matcher`, new in this lesson, checking that two
    values are `identical()` — Lesson 13's own real tool — rather than
    merely `==`.
  - *Implementation:* real, top-level function from `package:matcher`
    (re-exported by both `package:test` and `package:flutter_test`):
    `Matcher same(Object? expected)`.
  - *Its use:* `expect(greeting.key, same(testKey))` — proof that the
    exact same real `Key` object handed in comes back out, not merely an
    equal-looking one.
  - *Type:* a top-level function returning a `Matcher`.
  - *Responsibility:* to fail, with a real, specific message, unless
    `identical(actual, expected)` is genuinely `true`.
  - *Depends on:* the expected object to compare against.
  - *Connects to:* used once in this lesson's own lab; the general-
    purpose sibling of Lesson 25's own bare `identical()` calls, wrapped
    here as a real matcher instead of a raw boolean.
  - *Shape:* a small, public, real testing utility.

- **`isNull`**
  - *What it is:* a real, top-level `Matcher` constant, new in this
    lesson, asserting a value is genuinely `null`.
  - *Implementation:* a real, top-level `const Matcher` value from
    `package:matcher`.
  - *Its use:* `expect(greeting.key, isNull)` — real proof that omitting
    `key:` entirely leaves `Widget.key` at its real, documented default.
  - *Type:* a top-level `const` value of type `Matcher`.
  - *Responsibility:* to fail unless the actual value is exactly `null`.
  - *Depends on:* nothing — it's a constant.
  - *Connects to:* paired with `greeting.key` in this lesson's own lab's
    second real test.
  - *Shape:* a small, public, real testing constant.

- **`StatelessWidget`**
  - *What it is:* reappearing in full from Lesson 25 — the same real
    base class every widget with no internal, changing state extends.
  - *Implementation:* real, verbatim, already quoted in Lesson 25's own
    Header: `StatelessElement createElement() => StatelessElement(this);`
    and `Widget build(BuildContext context);`.
  - *Its use:* both `SudokuApp` and `_PlaceholderMessage` extend it —
    this lesson's own first time *this project's own permanent code*
    (not a throwaway probe) defines a `StatelessWidget` subclass.
  - *Type:* an `abstract class` extending `Widget`.
  - *Responsibility:* unchanged from Lesson 25 — declare `build`, wire up
    `StatelessElement` as the real `Element` subtype that manages it.
  - *Depends on:* a `BuildContext`, handed to `build` by the framework.
  - *Connects to:* extended by both of this lesson's own new classes;
    each one's own `createElement()` (inherited, unmodified) builds a
    real `StatelessElement`.
  - *Shape:* unchanged from Lesson 25 — the extension point application
    code actually extends.

- **`MaterialApp` / `Scaffold` / `AppBar` / `Center` / `Text`**
  - *What it is:* reappearing in full from Lesson 26 — the same five
    real classes, same real constructors, same real optional-parameter
    shapes already quoted there.
  - *Implementation:* unchanged, real, from Lesson 26's own Header:
    `const MaterialApp({super.key, this.home, ...})`,
    `const Scaffold({super.key, this.appBar, this.body, ...})`,
    `const AppBar({super.key, this.title, ...})`,
    `const Center({super.key, super.child, ...})`,
    `const Text(String data, {super.key, ...})`.
  - *Its use:* every one of these five now lives inside `SudokuApp
    .build()` (the first four) or `_PlaceholderMessage.build()` (the
    last), rather than inline inside `main()` — the exact same real
    values, the exact same real constructor calls, only their *location*
    changed.
  - *Type:* five concrete classes, each ultimately extending `Widget` —
    `MaterialApp`/`Scaffold`/`AppBar` extend `StatefulWidget`; `Center`/
    `Text` extend `StatelessWidget`.
  - *Responsibility:* `MaterialApp` builds the real theming/navigation
    machinery every Material widget beneath it assumes exists;
    `Scaffold` lays out whichever of its many real optional slots were
    actually supplied; `AppBar` draws a real top bar around whatever's
    handed to its own `title`; `Center` positions its one real child in
    the middle of its own available space; `Text` turns one real
    `String` into real, drawn glyphs.
  - *Depends on:* `MaterialApp` needs at least one of `home`/`routes`/
    `onGenerateRoute`/`builder`; `Scaffold`/`AppBar` need nothing
    required; `Center` needs one real child; `Text` needs one real
    `String`.
  - *Connects to:* nested exactly as Lesson 26 first built them —
    `MaterialApp` wraps `Scaffold`, which wraps `AppBar` (holding a
    `Text`) and, now, `_PlaceholderMessage` (which itself wraps `Center`
    wrapping a second `Text`) — the only real change this lesson made is
    that all five are now constructed inside `SudokuApp.build()` and
    `_PlaceholderMessage.build()` instead of directly inside `runApp
    (...)`'s own argument.
  - *Shape:* unchanged — five public, directly-constructed Material/
    layout widgets, the real building blocks of this app's own screen.

---

## Concept Unit: `SudokuApp` — a Widget With a Name

### The Problem

Lesson 26's own real `main.dart` works, real-proved twice over. But
`main_smoke_test.dart` had to type out the exact same
`MaterialApp(home: Scaffold(...))` expression a second time by hand,
because nothing in `main()` had a name a test file could import. Lesson
25's own real, quoted `Widget.createElement()`/`canUpdate()` mechanics
don't care whether a `Widget` came from an inline expression or a named
class — so what, specifically, would change if `main()`'s own inline
tree were given a real name instead?

> **Pause and think:** Lesson 25's own `Greeting` class
> (`class Greeting extends StatelessWidget { const Greeting(); @override
> Widget build(BuildContext context) => const SizedBox(); }`) is
> structurally almost identical to what `main.dart`'s own inline tree
> would need to become — what's actually different between "an
> expression passed directly to `runApp`" and "a named class whose
> `build()` returns that same expression"? Given Lesson 13's own real
> proof that `identical()` cares about object identity, would you expect
> `const SudokuApp()` to be a cheaper or more expensive value to build
> than the inline expression it replaces?

### Project Change

**Reference Source:** no reference implementation — this project's own
real refactor. **Files affected:** `project/lib/main.dart`, modified.
**Change type:** refactor. **Location:** the whole file — `main()`
shrinks to one line; everything it used to build moves into a new class.
**Dependencies:** unchanged.

### The New Code

```dart
class SudokuApp extends StatelessWidget {
  const SudokuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Sudoku')),
        body: const _PlaceholderMessage(message: 'Board goes here'),
      ),
    );
  }
}
```

### The Updated Project

The complete, real `project/lib/main.dart`, with `main()` itself shown
alongside the new class it now calls:

```dart
1  import 'package:flutter/material.dart';
2
3  void main() {
4    runApp(const SudokuApp());                                          // ← changed
5  }
6
7  class SudokuApp extends StatelessWidget {                             // ← new
8    const SudokuApp({super.key});                                       // ← new
9
10   @override                                                           // ← new
11   Widget build(BuildContext context) {                                // ← new
12     return MaterialApp(                                                // ← new
13       home: Scaffold(                                                  // ← new
14         appBar: AppBar(title: const Text('Sudoku')),                   // ← new
15         body: const _PlaceholderMessage(message: 'Board goes here'),   // ← new (name only — see next unit)
16       ),
17     );
18   }
19 }
```

`main()` no longer knows what a Sudoku app's screen actually contains —
it only knows to build one `SudokuApp` and hand it to `runApp`. Every
real detail Lesson 26 built (the title, the app bar, the body) now lives
entirely inside `SudokuApp`'s own `build()`.

### Isolate

`super.key` is the one genuinely new piece of syntax here, and it hasn't
appeared in this curriculum's own code before — a real, separate,
throwaway lab, `verification/lesson-27/test/super_key_test.dart`, proves
what it actually does before trusting it inside `project/`'s own real
file:

```dart
class Greeting extends StatelessWidget {
  const Greeting({super.key});

  @override
  Widget build(BuildContext context) => const SizedBox();
}

void main() {
  test('super.key forwards the caller-supplied key to Widget.key', () {
    const testKey = Key('greeting-key');
    const greeting = Greeting(key: testKey);

    expect(greeting.key, same(testKey));
  });

  test('omitting key leaves Widget.key null', () {
    const greeting = Greeting();

    expect(greeting.key, isNull);
  });
}
```

Real, run this session, via `flutter test test\super_key_test.dart`:

```
super.key forwards the caller-supplied key to Widget.key
omitting key leaves Widget.key null
+2: All tests passed!
```

This proves, directly, what the real code above in `SudokuApp` is
doing: `const SudokuApp({super.key});` is exactly equivalent to writing
`const SudokuApp({Key? key}) : super(key: key);` by hand — a real,
Dart-provided shorthand for "declare this parameter, and forward it,
unchanged, to the superclass's own same-named parameter" — proved here
by constructing a real `Key`, handing it in, and reading it back out
identical, and separately proving the omitted case genuinely defaults to
`null` rather than throwing or silently substituting something else.

### Discard

This lab is discarded — it never appears in `project/`; the real
`super.key` usage `project/lib/main.dart` now depends on is what's shown
above in The New Code, not this lab.

### Mechanical Walkthrough

- `class SudokuApp extends StatelessWidget` — `extends`, reappearing in
  full from Lesson 12: `SudokuApp` inherits `StatelessWidget`'s own real
  `createElement()` (Lesson 25's own quoted source) unmodified, and must
  supply `build`, the one method `StatelessWidget` only declares.
- `const SudokuApp({super.key});` — this lesson's own new **super.key**
  Header term, real-proved above: declares an optional `key` parameter
  and forwards it to `Widget`'s own real `key` field without writing
  that forwarding by hand; `const`, reappearing in full from Lesson 5,
  makes `const SudokuApp()` (used in the next step) a genuine
  compile-time constant.
- `@override Widget build(BuildContext context)` — reappearing in full
  from Lesson 25: the one method every `StatelessWidget` subclass must
  supply, called by its own real `StatelessElement` (Lesson 25's own
  quoted `build() => (widget as StatelessWidget).build(this);`), not
  directly by application code.
- `return MaterialApp(home: Scaffold(appBar: AppBar(title: const
  Text('Sudoku')), body: const _PlaceholderMessage(message: 'Board goes
  here')));` — every one of `MaterialApp`/`Scaffold`/`AppBar`/`Text`,
  reappearing in full from Lesson 26, unchanged in meaning; only their
  location changed, from directly inside `runApp(...)`'s own argument to
  inside this method's own `return` statement. `_PlaceholderMessage`
  appears here by name only — its own real definition is the next
  unit's own subject.
- `runApp(const SudokuApp());` — `runApp`, reappearing in full from
  Lesson 26; `const SudokuApp()` is the one real value `main()` now
  builds, replacing Lesson 26's own much larger inline expression.

### CS Lens

Naming `SudokuApp` and moving Lesson 26's own real tree inside its
`build()` is a real, direct instance of **extracting a named unit from
an anonymous expression** — the exact same idea Lesson 8 already taught
about functions (a named `pureSquare` versus an inline `(x) => x * x`)
and Lesson 11 already taught about objects (a real `SudokuCell` class
versus loose, unnamed data), applied here to a `Widget` for the first
time.

```
Also recognized in: extracting a repeated SQL subquery into a named
view, extracting a repeated CSS rule into a named class, refactoring a
deeply nested anonymous callback into a named function passed by
reference
```

### SE Lens

The alternative — leaving everything inline inside `main()`, the way
Lesson 26 left it — was a reasonable, deliberate choice *at the time*:
Lesson 26's own real subject was proving `MaterialApp`/`Scaffold` work
at all, not code organization. The real cost of leaving it inline any
longer, already paid once: `main_smoke_test.dart` had no real name to
import, so it duplicated the whole tree by hand — a real, live risk that
the test and the real app silently drift apart the moment one changes
without the other. Naming `SudokuApp` removes that risk structurally,
not by discipline: the next unit's own real fix makes the test *import*
this exact class, so drift becomes a compile error, not a test that
quietly stops meaning what it claims to.

### Commands Needed

- `flutter analyze lib\main.dart` — real, captured output, this session:
  `No issues found!` (as part of a combined real run, shown in the next
  unit's own Run It step, per the Verification Rule's Batching clause).

### Run It

Deferred to the next unit's own Run It step — this file isn't complete
(`_PlaceholderMessage` doesn't exist yet) until that unit's own change
lands, and the Verification Rule's own Batching clause prefers one real
run over the completed file to two partial ones.

### Connect

`SudokuApp` now exists, real and named, but still references a class
that hasn't been written yet. The next unit writes it.

---

## Concept Unit: `_PlaceholderMessage` — a Widget You Can Configure

### The Problem

`SudokuApp.build()`, as just written, references `_PlaceholderMessage`
— a class that doesn't exist. Lesson 26's own real body was
`const Center(child: Text('Board goes here'))`, a fixed, hard-coded pair
of widgets with no way to reuse that exact "centered message" shape for
a different string without copying both lines again. What does the
smallest real, reusable version of that shape actually look like?

> **Pause and think:** Lesson 11's own real `SudokuCell` constructor
> used `this.field` shorthand to accept a value and store it as a real
> field — given that, and Lesson 8's own real, analyzer-error-proved
> `required` keyword, what would you guess the smallest real constructor
> accepting one required string and storing it looks like? Given Lesson
> 11's own real, run-proved discovery that Dart's privacy is enforced
> per-file, not per-class, what would a leading underscore on this new
> class's own name actually prevent — and what would it *not* prevent,
> within this same file?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart`, modified further (same file as the previous
unit). **Change type:** add. **Location:** a new class, below
`SudokuApp`. **Dependencies:** unchanged.

### The New Code

```dart
class _PlaceholderMessage extends StatelessWidget {
  const _PlaceholderMessage({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(child: Text(message));
  }
}
```

### The Updated Project

The complete, real `project/lib/main.dart`, with this unit's own new
class added after the previous unit's own `SudokuApp`:

```dart
1  import 'package:flutter/material.dart';
2
3  void main() {
4    runApp(const SudokuApp());
5  }
6
7  class SudokuApp extends StatelessWidget {
8    const SudokuApp({super.key});
9
10   @override
11   Widget build(BuildContext context) {
12     return MaterialApp(
13       home: Scaffold(
14         appBar: AppBar(title: const Text('Sudoku')),
15         body: const _PlaceholderMessage(message: 'Board goes here'),
16       ),
17     );
18   }
19 }
20
21 class _PlaceholderMessage extends StatelessWidget {                   // ← new
22   const _PlaceholderMessage({required this.message});                 // ← new
23
24   final String message;                                               // ← new
25
26   @override                                                           // ← new
27   Widget build(BuildContext context) {                                // ← new
28     return Center(child: Text(message));                               // ← new
29   }
30 }
```

`SudokuApp.build()`'s own `_PlaceholderMessage(message: 'Board goes
here')` call, written in the previous unit, now resolves to a real,
complete class — this file, as a whole, is once again valid, self-
contained Dart.

### Isolate and Discard

Not applicable — every construct this class uses (`required`,
`this.field`, leading-underscore privacy) was already given a real,
isolated lab in the specific earlier lesson cited in this lesson's own
Header (Lessons 8 and 11) and gets full, real re-explanation below, per
the Repetition Rule, rather than a second lab for the same syntax.

### Mechanical Walkthrough

- `class _PlaceholderMessage extends StatelessWidget` — the leading
  underscore, reappearing in full from Lesson 11's own real proof
  (writing directly to a `_`-prefixed field from other code in the
  *same file* succeeded with no error): this class is genuinely
  constructible from anywhere inside `main.dart` — including
  `SudokuApp.build()`, in a different class in the same file — but not
  importable or constructible from `main_smoke_test.dart` or any other
  file.
- `const _PlaceholderMessage({required this.message});` — `required`,
  reappearing in full from Lesson 8 (real-analyzer-error-proved there:
  omitting a `required` named parameter really is a compile error, not
  just discouraged); `this.message` shorthand, reappearing in full from
  Lesson 11: declares the constructor parameter and assigns it straight
  to the field of the same name, in one line, no method body needed.
- `final String message;` — `final`, reappearing in full from Lesson 5:
  this field is set exactly once, by the constructor above, and never
  reassigned — consistent with every `Widget` field this curriculum has
  built since Lesson 25's own real, quoted `final Key? key;`.
- `Widget build(BuildContext context) { return Center(child:
  Text(message)); }` — `Center`/`Text`, reappearing in full from Lesson
  26, unchanged in meaning; `message` here is a real read of this
  object's own field, the one genuinely new thing this build method does
  compared to Lesson 26's own hard-coded `Text('Board goes here')` —
  this same class could just as validly be constructed with any other
  real string.

### CS Lens

A widget accepting a real constructor parameter and using it inside its
own `build()` is a real, minimal instance of **parameterization** — the
same idea behind every function parameter this curriculum has used since
Lesson 8, applied here to a whole reusable piece of UI rather than a
single value.

```
Also recognized in: a React/Vue component accepting props, a database
stored procedure accepting arguments, a CSS custom property (`--gap`)
threaded through a whole stylesheet, a factory function building
differently-configured objects from the same blueprint
```

### SE Lens

The alternative — leaving `Text('Board goes here')` hard-coded exactly
where Lesson 26 put it, inside `SudokuApp.build()` directly — was
rejected because Lesson 31 (building the real Sudoku board) will replace
this exact spot with real board content, and a hard-coded string buried
two widgets deep inside a much larger `build()` method is harder to find
and safely replace than a single, named constructor argument. The real
cost `_PlaceholderMessage` accepts in exchange: one more real class in
this file, and one more real object built on every rebuild — a cost this
curriculum has already shown, in Lesson 25's own real evidence, is
genuinely cheap (a `const`-eligible, throwaway configuration object, not
a persistent one).

### Commands Needed

- `flutter analyze lib\main.dart test\main_smoke_test.dart` — real,
  captured output, this session: `No issues found! (ran in 12.2s)`.
- `flutter test` — runs every real test in `project/test/` together.

### Run It

Real, captured output, this session, from `flutter test` (covering both
this unit and the previous one, per the Verification Rule's own Batching
clause — one real run, not two):

```
the Sudoku shell shows a title and a body placeholder
PASS: a fully-solved board isComplete
PASS: a fully-solved board has no internal conflicts
PASS: a fully-solved board has exactly one solution (itself)
PASS: the real milestone puzzle has no internal conflicts
PASS: two given 5s in the same row is correctly detected as invalid
PASS: a deliberately ambiguous 1/2-swap puzzle is correctly detected as non-unique
PASS: a board engineered to have zero real candidates for its one empty cell fails to solve
PASS: a freshly generated, lightly-carved puzzle (35 empty cells) has a unique solution
8 tests run, 0 failed
+1: All tests passed!
```

No new screenshot was taken this lesson — this same passing test already
proves, more precisely than a screenshot could, that the real, rendered
content is unchanged; Lesson 26's own real screenshots
(`verification/lesson-26/first-run-chrome.png`,
`first-run-android.png`) remain accurate evidence of what this exact
tree looks like on a real screen.

### Connect

`project/lib/main.dart` is whole again — `SudokuApp` and
`_PlaceholderMessage`, two real, named widget classes, replace Lesson
26's own single inline expression, with the real test suite proving
nothing about the actual rendered result changed. One piece of Lesson
26's own named debt is still open: the test file itself.

---

## Concept Unit: Closing the Debt

### The Problem

`SudokuApp` is now a real, importable class. Does
`project/test/main_smoke_test.dart` still duplicate `main.dart`'s own
tree by hand, the way Lesson 26's own SE lens flagged as real, deliberate
debt?

> **Pause and think:** Lesson 26's own `main_smoke_test.dart` built its
> own `MaterialApp(home: Scaffold(...))` expression directly inside the
> test file. Given `SudokuApp` now exists as a real, public class in
> `lib/main.dart`, what single change would let the test construct the
> *actual* app instead of a hand-copied lookalike? Lesson 26's own real,
> triggered `avoid_relative_lib_imports` lint named the wrong way to
> reach across files inside one project — what's the real, correct shape
> of that import instead?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/test/main_smoke_test.dart`, modified. **Change type:** replace.
**Location:** the whole file. **Dependencies:** none beyond what already
existed.

### The New Code

```dart
import 'package:open_calc_sudoku/main.dart';

// ...
    await tester.pumpWidget(const SudokuApp());
```

### The Updated Project

The complete, real `project/test/main_smoke_test.dart`:

```dart
1  import 'package:flutter/material.dart';
2  import 'package:flutter_test/flutter_test.dart';
3
4  import 'package:open_calc_sudoku/main.dart';                          // ← new
5
6  void main() {
7    testWidgets('the Sudoku shell shows a title and a body placeholder', (
8      WidgetTester tester,
9    ) async {
10     await tester.pumpWidget(const SudokuApp());                       // ← changed
11
12     expect(find.text('Sudoku'), findsOneWidget);
13     expect(find.text('Board goes here'), findsOneWidget);
14     expect(find.byType(AppBar), findsOneWidget);
15     expect(find.byType(Scaffold), findsOneWidget);
16   });
17 }
```

Every real assertion from Lesson 26 stays exactly as it was — only what
gets pumped into the tester changed, from a hand-built copy to the real,
imported `SudokuApp` itself.

### Isolate and Discard

Not applicable — a real, permanent edit to `project/test/
main_smoke_test.dart`, not a throwaway example.

### Mechanical Walkthrough

- `import 'package:open_calc_sudoku/main.dart';` — this lesson's own new
  **self-package import** Header term: `open_calc_sudoku`, the real
  package name declared in `project/pubspec.yaml`'s own `name:` field
  since the Phase 1 milestone, followed by the real path to the file
  within `lib/` — Dart's real, standard way for one file in a package to
  import another, the same shape every earlier `dart:`/`package:` import
  this curriculum has used, just pointed at this project's own code
  instead of the SDK or a third-party package.
- `await tester.pumpWidget(const SudokuApp());` — `tester.pumpWidget`,
  reappearing in full from Lesson 25; `const SudokuApp()`, this lesson's
  own real class, replacing the hand-built `MaterialApp(...)` expression
  Lesson 26's own version of this file constructed directly.

### CS Lens

Testing against the real, imported `SudokuApp` instead of a hand-copied
lookalike is a real instance of **testing the actual production code
path, not a parallel reimplementation of it** — the same principle
behind why Lesson 24's own real test suite called `SudokuBoard`'s own
real methods directly rather than reimplementing Sudoku rules a second
time just to check them.

```
Also recognized in: an integration test hitting a real API client
instead of a hand-rolled fake, a snapshot test rendering the actual
component instead of a manually maintained mockup, a compiler's own test
suite invoking the real parser instead of a simplified stand-in
```

### SE Lens

The alternative — leaving the duplicated tree in place, since it still
passed — was rejected because a passing duplicate proves the *duplicate*
is correct, not that the real app is; Lesson 26's own SE lens named this
exact risk before it had a chance to cause real harm. The real, small
cost paid here: this test file now depends on `lib/main.dart` compiling
cleanly before the test can even load, coupling the two more tightly —
an intentional tradeoff, not an accident, in exchange for the coupling
actually meaning something (drift is now impossible, not just
undetected).

### Commands Needed

- `flutter test` — real, captured output, this session, already shown
  in the previous unit's own Run It step, since both units' own changes
  were verified together in one real run.

### Run It

Already run, real, this session — the same real, full-suite run shown in
the previous unit's own Run It step; per the Verification Rule's own
Persistence clause, this output isn't re-pasted a second time, only
referenced.

### Connect

The real debt Lesson 26 named out loud is now closed: `main.dart` and
`main_smoke_test.dart` build the exact same real object, not two
independently-maintained copies of the same idea.

---

## Connect the Pieces

Follow the literal string `"Board goes here"` through everything this
lesson changed:

1. Before this lesson, that string lived inside `main()`'s own inline
   `Text('Board goes here')`, two widgets deep inside a single, growing
   expression with no name of its own.
2. Concept Unit 1 extracted `SudokuApp`, a real, named `StatelessWidget`
   subclass, real-proved via a separate `super.key` lab to correctly
   forward an optional key the same way Dart's own shorthand promises,
   without writing that forwarding by hand.
3. Concept Unit 2 extracted `_PlaceholderMessage`, a real, small,
   reusable, `required`-parameterized widget — the literal string
   "Board goes here" now travels in as a real constructor argument,
   `message: 'Board goes here'`, rather than sitting hard-coded inside a
   `Text` call two levels removed from where it's actually supplied.
4. Concept Unit 3 closed the debt Lesson 26's own SE lens named:
   `main_smoke_test.dart` now imports and pumps the real `SudokuApp`
   directly, via a real self-package import, rather than maintaining a
   second, hand-copied version of the same tree.
5. The real, full test suite — Lesson 26's own smoke test and Lesson
   24's own real Sudoku-engine suite together — passed, unchanged, 9/9,
   proving this entire refactor moved *where* real code lives without
   changing *what* it does; Lesson 26's own real screenshots, taken
   before any of this lesson's changes existed, remain accurate evidence
   of exactly what this same tree looks like on a real screen.

`project/lib/main.dart` is now built from two real, named, independently
reusable widget classes instead of one inline expression — the shape
every widget this curriculum writes from Lesson 28 (stateful widgets)
onward will take by default, not a special case built just for this
lesson.
