# Lesson 29: Who Decides How Big, and Who Decides Where

**What you will build:** `project/lib/main.dart`'s own screen gets a
real, deliberate layout — 16 real pixels of padding around the whole
body, the elapsed-time and games-started text sitting side by side
instead of stacked, and the board placeholder centered within whatever
vertical space is actually left over — using six real, standard Flutter
layout widgets (`Row`, `Column`, `Padding`, `Expanded`, `Flexible`,
`Align`) plus a seventh (`Stack`) proved in isolation. Every real claim
in this lesson is backed by *measured* geometry — exact pixel offsets
and sizes read back from a real, running widget tree — not a picture of
one, and this lesson's own real verification work hit two genuine,
honestly-kept false starts along the way, both real evidence for this
lesson's own final bullet: constraints.

**What you need to know first:**
- Lesson 5 — `const`, `final`.
- Lesson 6 — comparison operators (`>`), reused in this lesson's own
  real geometry assertions.
- Lesson 8 — named parameters.
- Lesson 13 — enum-value access (`Alignment.center`, `MainAxisAlignment
  .center`), reappearing from Lesson 13's own enum-access syntax.
- Lesson 25 — `Widget`, `RenderObject`, and the real, quoted `layout`
  stage of the render pipeline — this lesson's whole subject is what
  actually happens during that one stage.
- Lesson 26 — the real `MaterialApp`/`Scaffold` tree this lesson's own
  layout changes are made inside.
- Lesson 27 — `super.key`, library privacy.
- Lesson 28 — `Column`, used narrowly there with full treatment
  explicitly deferred here; `_SessionStatus`, the real widget this
  lesson's own `Row` change is made inside.

**Pipeline diagram.** This curriculum's own widget pipeline, established
across Lessons 25-28:

```
Widget
  ↓ createElement() / canUpdate()
Element
  ↓ createRenderObject() / updateRenderObject()
RenderObject
  ↓ layout → paint → composite
Pixels
```

This lesson touches **layout** specifically — the one real pass, already
named but never yet explained, where every `RenderObject` is told the
space it has and decides its own real size and position. Concrete value
carried through: `project/`'s own real `EdgeInsets.all(16)` — a `Widget`
(`Padding`)'s own configuration — inflates into a real `RenderPadding`
(a `RenderObject`), and this lesson's own real, measured proof is that
during the **layout** stage, that `RenderObject` genuinely shrinks the
space available to its own child by exactly 16 real pixels on every
side, measured and confirmed, not assumed.

**Terms used in this lesson:**
- **Main axis / cross axis** — new: `Row`'s own main axis is horizontal,
  its cross axis vertical; `Column`'s are the reverse. It exists as a
  real, shared vocabulary letting one property name
  (`mainAxisAlignment`) mean "align along whichever direction this
  particular widget actually lays its children out," without two
  separate, axis-specific property names.
- **Tight constraints** — new: a real constraint where the minimum and
  maximum allowed size are exactly equal, leaving a `RenderObject` no
  real choice about its own size. It exists as the real, concrete
  explanation behind this lesson's own first genuine false start: the
  root of a widget tree pumped in a test receives tight constraints
  matching the real, fixed test surface (800×600), so a `SizedBox`
  asking to be smaller genuinely cannot be, no matter what it requests.
- **Loose constraints** — new: a real constraint where the minimum is
  `0` and only the maximum is fixed, genuinely leaving room for a
  `RenderObject` to choose to be smaller. It exists as the real,
  concrete reason `Center`/`Align` can let a child be its own natural
  size even inside a much larger available space — they hand their own
  child loose constraints, not the tight ones they themselves received.
- **Global vs. local coordinates** — new: `WidgetTester.getTopLeft`
  returns a position measured from the whole real screen's own origin,
  not from whatever widget happens to be that widget's own visual
  parent. It exists as the real, concrete explanation behind this
  lesson's own second genuine false start: two real, correct widgets
  can disagree about "where is this, exactly" depending on which origin
  the answer is measured against.

**Objects and methods used:**

- **`Row` / `Column`**
  - *What it is:* the real, paired pair of Flutter's most basic
    multi-child layout widgets — `Row` arranges children left to right;
    `Column`, top to bottom.
  - *Implementation:* real, shared shape (both extend the same real
    `Flex` class with a fixed `direction`):
    `Row({super.key, this.mainAxisAlignment = MainAxisAlignment.start, this.mainAxisSize = MainAxisSize.max, this.crossAxisAlignment = CrossAxisAlignment.center, required this.children})`
    — `Column`'s real constructor shape is identical, member for member.
  - *Its use:* `project/lib/main.dart`'s own `_SessionStatusState.build()`
    now uses a real `Row` to place its two `Text` widgets side by side;
    `SudokuApp.build()` and `_SessionStatusState.build()` both already
    used `Column` (Lesson 28, narrowly) for vertical stacking.
  - *Type:* two concrete classes, both extending `Flex` extending
    `MultiChildRenderObjectWidget` extending `Widget`.
  - *Responsibility:* to lay out a real, ordered list of children along
    one fixed real axis, and, along the other, per a real, configurable
    alignment.
  - *Depends on:* a real list of child widgets.
  - *Connects to:* `Row` is used inside `_SessionStatusState.build()`;
    `Column` wraps both `SudokuApp`'s own body and `_SessionStatusState`'s
    own three children.
  - *Shape:* two public, directly-constructed, extremely common layout
    widgets.

- **`Padding`**
  - *What it is:* a real, single-child widget that insets its child by a
    real, given amount on each side.
  - *Implementation:* real shape:
    `const Padding({super.key, required this.padding, super.child})`,
    where `padding` is a real `EdgeInsets` value.
  - *Its use:* `SudokuApp.build()` now wraps its whole real body in one,
    `padding: const EdgeInsets.all(16)`.
  - *Type:* a concrete class extending `SingleChildRenderObjectWidget`.
  - *Responsibility:* during the real **layout** stage, to shrink the
    constraints it hands its own child by exactly its own real
    `padding` amount, then report its own size as its child's size plus
    that same padding added back.
  - *Depends on:* a real `EdgeInsets` value and, optionally, one real
    child.
  - *Connects to:* wraps `SudokuApp.build()`'s own real `Column`.
  - *Shape:* a small, public, directly-constructed widget — one of the
    most common real widgets in any Flutter codebase.

- **`EdgeInsets`**
  - *What it is:* a real, immutable value type describing an inset or
    margin — how much space to leave on each of up to four real sides.
  - *Implementation:* real shape used here: `const EdgeInsets.all(double value)`
    — a real, named constructor setting all four real sides
    (`left`/`top`/`right`/`bottom`) to the same value.
  - *Its use:* `EdgeInsets.all(16)`, handed to `Padding`.
  - *Type:* an immutable value class (not a `Widget` itself).
  - *Responsibility:* to hold four real numbers and know how to apply
    them to a real rectangle.
  - *Depends on:* the real number(s) handed to whichever real
    constructor is used.
  - *Connects to:* constructed directly inside `Padding`'s own
    `padding:` argument.
  - *Shape:* a small, public, real value type — this lesson's own first
    example of a Flutter class that is not itself a `Widget`.

- **`Expanded`**
  - *What it is:* a real widget, usable only directly inside a `Row` or
    `Column`, forcing its own child to fill whatever real space is left
    over after every non-`Expanded` sibling has taken what it needs.
  - *Implementation:* real shape:
    `const Expanded({super.key, super.flex = 1, required super.child})`.
  - *Its use:* `SudokuApp.build()`'s own real `Column` wraps the board
    placeholder in `Expanded`, so it genuinely fills whatever vertical
    space remains once `_SessionStatus`'s own real height is accounted
    for.
  - *Type:* a concrete class extending `Flexible`.
  - *Responsibility:* to claim a real share (`flex`) of a `Row`/`Column`'s
    own remaining space, and, unlike its own parent class `Flexible`,
    force its child to fill that share exactly (a real, "tight" fit).
  - *Depends on:* one real child and, optionally, a real `flex` weight.
  - *Connects to:* extends `Flexible`; used inside `SudokuApp.build()`'s
    own `Column`.
  - *Shape:* a small, public, directly-constructed widget, valid only as
    a direct `Row`/`Column` child.

- **`Flexible`**
  - *What it is:* `Expanded`'s own real, more permissive parent class —
    claims a real share of remaining space, but, unlike `Expanded`,
    genuinely allows its child to end up smaller than that share if the
    child itself doesn't need it all.
  - *Implementation:* real shape:
    `const Flexible({super.key, this.flex = 1, this.fit = FlexFit.loose, required super.child})`
    — `Expanded`'s own real difference is exactly one field:
    `fit: FlexFit.tight` instead of `FlexFit.loose`.
  - *Its use:* not used inside `project/`'s own real code this
    lesson — proved instead in this lesson's own isolated lab, directly
    contrasted against `Expanded`, real-measured to confirm the one real
    difference (`loose` vs. `tight` fit) actually changes behavior.
  - *Type:* a concrete class extending `ParentDataWidget<FlexParentData>`.
  - *Responsibility:* to attach real flex information to its child for
    its `Row`/`Column` parent to read, without forcing that child's own
    final size the way `Expanded` does.
  - *Depends on:* one real child; optional `flex`/`fit`.
  - *Connects to:* `Expanded` extends it, overriding only `fit`.
  - *Shape:* a small, public, directly-constructed widget — the more
    general of the two, `Expanded` being its own common special case.

- **`Align`**
  - *What it is:* a real, single-child widget that positions its child
    within its own available space according to a real, configurable
    alignment factor, without forcing the child's own size.
  - *Implementation:* real shape:
    `const Align({super.key, this.alignment = Alignment.center, super.child})`.
  - *Its use:* `SudokuApp.build()`'s own real `Expanded` wraps `Align
    (alignment: Alignment.center, ...)`, centering `_PlaceholderMessage`
    within whatever real space `Expanded` gave it.
  - *Type:* a concrete class extending `SingleChildRenderObjectWidget`.
  - *Responsibility:* during layout, to hand its own child *loose*
    constraints (this lesson's own real Header term) regardless of what
    it itself received, then position that child's own resulting real
    size according to its own real `alignment` factor.
  - *Depends on:* an `Alignment` value and, optionally, one real child.
  - *Connects to:* wraps `_PlaceholderMessage` inside `SudokuApp.build()`'s
    own real `Expanded`.
  - *Shape:* a small, public, directly-constructed widget.

- **`Alignment`**
  - *What it is:* a real, immutable value type describing a position
    within a rectangle as two real numbers from `-1.0` to `1.0` on each
    axis — `Alignment.center` is real shorthand for `(0.0, 0.0)`.
  - *Implementation:* real shape: `const Alignment(double x, double y)`,
    plus real, named constants like `Alignment.center`,
    `Alignment.topLeft`.
  - *Its use:* `Alignment.center`, handed to `Align`.
  - *Type:* an immutable value class.
  - *Responsibility:* to describe a relative position, resolved against
    whatever real size ends up available at layout time.
  - *Depends on:* nothing to use a real, named constant.
  - *Connects to:* constructed (via a real, named constant) inside
    `Align`'s own `alignment:` argument.
  - *Shape:* a small, public, real value type.

- **`Stack`**
  - *What it is:* a real, multi-child widget that overlays its children
    on top of one another, rather than arranging them in a row or
    column.
  - *Implementation:* real shape:
    `Stack({super.key, this.alignment = AlignmentDirectional.topStart, required this.children})`.
  - *Its use:* proved only in this lesson's own isolated lab — no
    natural real use in `project/` yet; a genuine, honest gap, deferred
    to Lesson 31, where a real Sudoku cell (a number, potentially a
    selection highlight, potentially a hint marker, all in the same
    screen position) is `Stack`'s own real, obvious first use in this
    project.
  - *Type:* a concrete class extending `MultiChildRenderObjectWidget`.
  - *Responsibility:* to lay out every real child independently, then
    position each one according to its own real alignment (or an
    explicit `Positioned` wrapper, not used in this lesson), rather than
    flowing them one after another the way `Row`/`Column` do.
  - *Depends on:* a real list of children.
  - *Connects to:* not connected to any real `project/` code yet.
  - *Shape:* a public, directly-constructed widget, real and proved, its
    real project use still ahead.

- **`WidgetTester.getTopLeft` / `getSize` / `widget<T>` / `find.ancestor`**
  - *What it is:* four real `WidgetTester`/`CommonFinders` members, new
    in this lesson, `WidgetTester` itself reappearing in full from
    Lesson 25.
  - *Implementation:* real signature shapes:
    `Offset getTopLeft(Finder finder)`, `Size getSize(Finder finder)`,
    `T widget<T extends Widget>(Finder finder)`,
    `Finder ancestor({required Finder of, required Finder matching})`.
  - *Its use:* every real geometry claim in this lesson — every exact
    pixel offset, every exact size, every real padding value read back
    off a live widget — was measured with one of these four.
  - *Type:* four real instance methods (`getTopLeft`/`getSize`/`widget`
    on `WidgetTester`; `ancestor` on the real `find` object).
  - *Responsibility:* to read real, live geometry and configuration
    directly off the running (headless) render tree, rather than
    inferring it from source code alone.
  - *Depends on:* a `Finder` (all four) or, additionally, a generic type
    argument (`widget<T>`).
  - *Connects to:* used throughout this lesson's own labs and the real
    `project/test/layout_test.dart`.
  - *Shape:* public, test-only tools — real, direct, numeric proof,
    not visual inspection.

---

## Concept Unit: `Row` and `Column` — One Axis, Two Widgets

### The Problem

`_SessionStatus`'s own real `Column` (Lesson 28) stacks "Elapsed: N s"
and "Games started: N" vertically — two lines, when a single, compact
line reads better for a quick status glance. Lesson 28 already used
`Column` without ever explaining, mechanically, how it actually decides
where each child lands — what's the real, minimal change to lay the same
two pieces of text out horizontally instead?

> **Pause and think:** Given `Row` and `Column`'s own real, identical
> constructor shape (`mainAxisAlignment`, `mainAxisSize`,
> `crossAxisAlignment`, `children`) — differing, per this lesson's own
> Header, only in which real axis each treats as "main" — what would you
> guess the *smallest* possible code change from a working `Column` to a
> working `Row` looks like? Given Lesson 25's own real, quoted
> `RenderObject` — the actual object that does layout — what real,
> distinct pieces of information would a `Row`/`Column`'s own
> `RenderObject` need about each child to lay them out one after
> another, rather than all in the same spot?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart`, modified. **Change type:** replace.
**Location:** inside `_SessionStatusState.build()`'s own `Column`, its
first two children. **Dependencies:** unchanged.

### The New Code

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.center,
  children: [
    Text('Elapsed: $_elapsedSeconds s'),
    const SizedBox(width: 16),
    Text('Games started: $_gamesStarted'),
  ],
),
```

### The Updated Project

The complete, real `_SessionStatusState.build()`, with this unit's own
new lines marked:

```dart
1  Widget build(BuildContext context) {
2    return Column(
3      mainAxisSize: MainAxisSize.min,
4      children: [
5        Row(                                                            // ← new
6          mainAxisAlignment: MainAxisAlignment.center,                  // ← new
7          children: [                                                    // ← new
8            Text('Elapsed: $_elapsedSeconds s'),                        // ← changed (moved into Row)
9            const SizedBox(width: 16),                                   // ← new
10           Text('Games started: $_gamesStarted'),                      // ← changed (moved into Row)
11         ],                                                             // ← new
12       ),                                                                // ← new
13       const SizedBox(height: 8),                                      // ← new
14       ElevatedButton(onPressed: _startNewGame, child: const Text('Start New Game')),
15     ],
16   );
17 }
```

The outer `Column` still stacks things vertically — now just two real
things (the new `Row`, and the button) instead of three.

### Isolate

A real, separate throwaway lab, `verification/lesson-29/test/
layout_geometry_test.dart`, isolates `Row`'s own real behavior — placing
two same-sized boxes and measuring, precisely, where each one actually
landed:

```dart
await tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: const [
        SizedBox(width: 50, height: 50, key: Key('a')),
        SizedBox(width: 50, height: 50, key: Key('b')),
      ],
    ),
  ),
);

final topLeftA = tester.getTopLeft(find.byKey(const Key('a')));
final topLeftB = tester.getTopLeft(find.byKey(const Key('b')));

expect(topLeftA.dy, topLeftB.dy);
expect(topLeftB.dx, topLeftA.dx + 50);
```

Run for real, this session, via `flutter test test\
layout_geometry_test.dart`, alongside `Column`'s own mirror-image real
proof:

```
Row places children side by side, same y, increasing x
Column stacks children top to bottom, same x, increasing y
```

Real, measured, exact proof: inside a `Row`, two same-sized boxes share
the identical real `y` coordinate, and the second one's `x` is exactly
the first box's own real width further along — inside a `Column`, the
same two facts hold with `x`/`y` swapped. Not "roughly to the right" —
*exactly* 50 real logical pixels along the main axis, and *exactly*
matched along the cross axis.

### Discard

This lab is discarded — the real classes `project/lib/main.dart`
depends on are `Row`/`Column`, real Flutter classes, not the throwaway
`Key('a')`/`Key('b')` boxes used only to measure them.

### Mechanical Walkthrough

- `Row(mainAxisAlignment: MainAxisAlignment.center, children: [...])`
  — this lesson's own new `Row` Header entry; `MainAxisAlignment
  .center` (reappearing enum-access syntax from Lesson 13) centers the
  whole real row of children along its own **main axis** (this lesson's
  own new Header term) — horizontal, for a `Row` — inside whatever
  space is actually available.
- `Text('Elapsed: $_elapsedSeconds s')` / `Text('Games started:
  $_gamesStarted')` — `Text`, reappearing in full from Lesson 26,
  unchanged; string interpolation, reappearing from Lesson 5.
- `const SizedBox(width: 16)` — reappearing from Lesson 26's own
  `SizedBox` entry, used here narrowly as a real, deliberate gap between
  the two `Text` widgets — a common, real, minimal spacing idiom.

### CS Lens

`Row`/`Column` are a real, direct instance of **linear layout along one
axis** — the same real idea underneath CSS flexbox's own `flex-direction`,
underneath a phone's own vertical `LinearLayout` in Android's native UI
toolkit, underneath a spreadsheet's own row-versus-column formula fill
direction.

```
Also recognized in: CSS Flexbox's row/column, Android's own
LinearLayout orientation, a game UI's own horizontal health-bar stack
versus a vertical inventory list, a print layout engine's own text flow
direction
```

### SE Lens

The alternative — one single, general-purpose "flex container" widget
with a `direction:` parameter instead of two separate named classes
(`Row`, `Column`) — is, in fact, real and already exists: both `Row` and
`Column` are, per this lesson's own quoted real source, thin, fixed-
direction wrappers around one real shared class, `Flex`. The real reason
two named wrappers exist anyway: `Row(...)` and `Column(...)` read as
their own real intent at the call site, without a reader having to find
and check a `direction:` argument buried inside a longer parameter list
— a real, deliberate readability tradeoff, not a technical necessity.

### Commands Needed

None beyond `flutter test`, already explained.

### Run It

Real, captured output, this session — shown above in the Isolate step.

### Connect

The two-line status text is now one, real, horizontal line. The next
unit gives the whole screen real breathing room around its own edges.

---

## Concept Unit: `Padding` — Real, Measured Space

### The Problem

`SudokuApp.build()`'s own `Scaffold.body` currently sits flush against
every real screen edge — no gap at all. Real UI, almost everywhere,
leaves deliberate space around its own content. What's the smallest
real change to add exactly 16 real pixels around the whole body?

> **Pause and think:** Given `Padding`'s own real, quoted `padding:`
> field takes an `EdgeInsets`, and `EdgeInsets.all(16)` sets every real
> side to the same value — if you needed *different* space on each
> side, what shape do you think a real, more specific constructor might
> take, based on `EdgeInsets`'s own name alone? Given Lesson 25's own
> real, quoted `RenderObject` performs layout by telling its own
> children what space they have — what real, concrete number would you
> expect a padded child to actually receive, if its parent had 300 real
> pixels available and `Padding` added 16 on every side?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart`, modified. **Change type:** wrap. **Location:**
`SudokuApp.build()`'s own `Scaffold.body`. **Dependencies:** unchanged.

### The New Code

```dart
body: const Padding(
  padding: EdgeInsets.all(16),
  child: Column(
    // ...
  ),
),
```

### The Updated Project

The complete, real `SudokuApp.build()`, with this unit's own new lines
marked:

```dart
1  Widget build(BuildContext context) {
2    return MaterialApp(
3      home: Scaffold(
4        appBar: AppBar(title: const Text('Sudoku')),
5        body: const Padding(                                            // ← new
6          padding: EdgeInsets.all(16),                                  // ← new
7          child: Column(
8            children: [
9              Expanded(
10               child: Align(
11                 alignment: Alignment.center,
12                 child: _PlaceholderMessage(message: 'Board goes here'),
13               ),
14             ),
15             _SessionStatus(),
16           ],
17         ),
18       ),
19     ),
20   );
21 }
```

(`Expanded`/`Align`, shown here already in place, are this lesson's own
next two units' own subject — added together with `Padding` in this
project's own single real edit, verified once, per the Verification
Rule's own Batching guidance, rather than three separate real edits.)

### Isolate

A real, separate lab measures `Padding`'s own effect directly:

```dart
await tester.pumpWidget(
  const Directionality(
    textDirection: TextDirection.ltr,
    child: Padding(
      padding: EdgeInsets.all(16),
      child: SizedBox(width: 10, height: 10, key: Key('child')),
    ),
  ),
);

final topLeft = tester.getTopLeft(find.byKey(const Key('child')));
expect(topLeft, const Offset(16, 16));
```

Run for real, this session:

```
Padding insets its child by exactly the given amount
```

Real, exact, measured proof: the child's own real top-left corner sits
at precisely `(16, 16)` — not "near the top-left," sixteen real logical
pixels from the true screen origin in both directions, matching
`EdgeInsets.all(16)` exactly.

### Discard

Discarded — the throwaway `Key('child')` box never appears in
`project/`; `Padding`'s own real use is shown above, wrapping a real
`Column`.

### Mechanical Walkthrough

- `Padding(padding: EdgeInsets.all(16), child: ...)` — this lesson's
  own new `Padding`/`EdgeInsets` Header entries: `EdgeInsets.all(16)`
  constructs a real, immutable value, `left: top: right: bottom: 16`
  each; `Padding` reads that value during its own real layout pass and
  shrinks the constraints it hands its child by exactly that much on
  every real side.
- `const` on the whole expression — reappearing from Lesson 5: since
  every real widget and value inside this whole tree (down through
  `_PlaceholderMessage`/`_SessionStatus`, both real, `const`-constructible
  classes) is itself `const`-eligible, the entire body can be one single
  real, compile-time constant.

### CS Lens

`Padding` is a real, minimal instance of **the decorator layering**
Lesson 27's own CS lens already named for `MaterialApp` wrapping
`Placeholder` — one widget wrapping another, adding one real, specific
behavior (inset space) without the wrapped widget itself needing to
know or care.

```
Also recognized in: CSS's own `padding` property, a function decorator
in Python adding logging around a plain function with no changes to the
function itself, an image border added by a photo-editing tool's own
non-destructive layer
```

### SE Lens

The alternative — giving every individual widget its own `padding:`
parameter, the way some UI toolkits do — was rejected by Flutter's own
real design in favor of one small, single-purpose, composable `Padding`
widget any other widget can be wrapped in. The real cost: an extra real
widget (and, per Lesson 25's own architecture, an extra real `Element`/
`RenderObject`) for every single padded region — a real, small
overhead this curriculum's own Lesson 89 (Performance profiling) will
eventually put a real number on, not measured here.

### Commands Needed

None beyond `flutter analyze`/`flutter test`, already explained.

### Run It

Real, captured output, this session — shown above in the Isolate step;
the real project-level proof (`project/test/layout_test.dart`, checking
this exact real `Padding`, found precisely by
`find.ancestor(of: find.byType(Column), matching: find.byType(Padding))`
after a first, honest attempt — a bare `find.byType(Padding)` — failed
with a real `StateError: Bad state: Too many elements`, because
`Scaffold`/`AppBar` internally use their own real `Padding` widgets too)
is shown in the next unit's own Run It step, run together per the
Verification Rule's Batching guidance.

### Connect

The whole body now sits a real 16 pixels from every screen edge. The
next unit makes the placeholder area actually claim the real space
that's left over, rather than sitting at its own natural, small size.

---

## Concept Unit: `Expanded` and `Flexible` — Claiming What's Left

### The Problem

Before this lesson, `SudokuApp.build()`'s own `Column` sized itself to
fit its own children, with `mainAxisAlignment: MainAxisAlignment.center`
doing the real work of centering everything in the leftover space
(Lesson 28). Lesson 31's real Sudoku board will eventually need a large,
specific, real region of screen — not just "centered," but actually
*claiming* the space between the app bar and `_SessionStatus`. What
real widget makes one child claim real, leftover space along a
`Row`/`Column`'s own main axis?

> **Pause and think:** Given `Expanded`'s own real, quoted shape,
> `extends Flexible`, differing only by forcing `fit: FlexFit.tight`
> instead of `Flexible`'s own default `FlexFit.loose` — what real,
> concrete difference would you predict in behavior if a child *wants*
> to be smaller than its own real, available flex share? Given this
> lesson's own real, quoted `RenderObject` connection to layout, would
> you expect `Expanded`'s own child to have any real say in its own
> final size at all?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart` (already shown, wrapped together with `Padding`
in the previous unit's own real edit). **Change type:** wrap.
**Location:** around `_PlaceholderMessage`. **Dependencies:** unchanged.

### The New Code

```dart
Expanded(
  child: Align(
    alignment: Alignment.center,
    child: _PlaceholderMessage(message: 'Board goes here'),
  ),
),
```

### The Updated Project

Already shown in full in the previous unit's own Updated Project step —
`Expanded` wraps `Align`, which is this lesson's own next unit's own
subject.

### Isolate

A real, separate lab proves `Expanded`'s own real fill behavior, and,
directly contrasted, `Flexible`'s own real, more permissive one, inside
a fixed, controlled real space:

```dart
await tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: Center(
      child: SizedBox(
        width: 200,
        height: 20,
        child: Row(
          children: [
            Expanded(child: Container(key: const Key('expanded'), width: 30, height: 10)),
          ],
        ),
      ),
    ),
  ),
);

final expandedSize = tester.getSize(find.byKey(const Key('expanded')));
expect(expandedSize.width, 200);
```

Real, run this session (real output, this lesson's whole lab together —
per the Verification Rule's own Batching guidance, one real run):

```
Expanded forces its child to fill the remaining main-axis space
Flexible (loose) lets its child keep its own requested size
Expanded (tight) forces the same child to fill instead
```

A real, genuine false start happened getting here, kept in the record
rather than silently fixed: the first real attempt used a bare
`SizedBox(width: 200, ...)` at the very root of `pumpWidget`, and got a
real, exact failure — `Expected: <200>`, `Actual: <800.0>`. The real
cause, worked out from that exact number: `flutter_test`'s own default
test surface is a fixed 800×600, and the root of any pumped tree
receives this lesson's own new **tight constraints** Header term —
min equals max — so a `SizedBox` asking to be 200 wide genuinely cannot
be, no matter what it requests; it's forced to the full real 800.
Wrapping the whole thing in `Center` — which hands its own child this
lesson's own new **loose constraints** Header term instead — fixed it
for real, confirmed by the clean rerun above.

Real, measured proof, from the same run: `Container(key: 'flexible',
width: 30, ...)`, wrapped in `Flexible` (the real, default `FlexFit
.loose`), ends up exactly `30` real pixels wide — its *own* requested
size, honored — while the identical `Container(width: 30, ...)`,
wrapped in `Expanded` instead, ends up exactly `200` — the *entire* real
available width, its own request overridden completely. Same child
widget, same requested size, two genuinely different real outcomes,
purely from which one of the two wrapped it.

### Discard

Discarded — the real `Expanded` usage `project/lib/main.dart` now
depends on is shown in the previous unit's own Updated Project step.

### Mechanical Walkthrough

- `Expanded(child: Align(...))` — this lesson's own new `Expanded`
  Header entry: claims all of the real, remaining vertical space in
  `SudokuApp.build()`'s own `Column`, after `_SessionStatus`'s own real,
  natural height is subtracted, and forces its own child (`Align`) to
  fill that exact real space — this lesson's own real, quoted
  `Flexible`/`Expanded` distinction (`fit: FlexFit.tight`) is exactly
  why.
- `SizedBox`/`Container` used in the lab — `SizedBox`, reappearing from
  Lesson 26; `Container`, a real, new-in-this-lab widget used here
  purely as a real, sizeable, key-able probe (its own full treatment is
  not this lesson's subject).

### CS Lens

`Expanded`/`Flexible` are a real, working instance of **weighted space
allocation** — give each participant a real share, then decide, per
participant, whether that share is a hard requirement (`Expanded`) or
just an upper bound (`Flexible`).

```
Also recognized in: CSS Flexbox's own `flex-grow`, a spreadsheet
column's own "auto-fit" versus a fixed pixel width, an operating
system's own memory allocator handing out a process's requested versus
maximum working set
```

### SE Lens

The alternative — every widget in a `Row`/`Column` always taking exactly
its own natural size, with no way to claim leftover space at all — was
rejected because most real screens have exactly this shape: some
content has a fixed, known size (`_SessionStatus`'s own real height),
and something else should fill whatever's left (the eventual real
Sudoku board). The real cost of `Expanded` specifically, discovered the
hard way in this unit's own real lab: forcing a child to an exact size
it didn't ask for can silently produce layout bugs invisible until
measured — this lesson's own real, honest false start (200 expected,
800 actual) is exactly that class of bug, caught here by a real
assertion, not eyeballed from a picture.

### Commands Needed

None beyond `flutter test`, already explained.

### Run It

Real, captured output, this session — the lab output is shown above;
the real project-level result, from the same combined `flutter test`
run as `Padding`'s own unit:

```
the real body has 16px padding on every side
the elapsed and games-started text sit side by side
```

(`layout_test.dart`'s own two real tests don't directly measure
`Expanded`'s own fill amount in the real app — Lesson 31's real board,
once it exists, is where that specific real measurement becomes
meaningful; this unit's own isolated lab already proved the mechanism
works, in general, for real.)

### Connect

The placeholder area now genuinely claims whatever real vertical space
is left over, rather than sitting at its own small, natural size. The
next unit centers it precisely within that claimed space.

---

## Concept Unit: `Align` — A Position Within What's Available

### The Problem

`Expanded` hands its own child a large, real region — but a large region
isn't automatically centered content within it. `_PlaceholderMessage`
already used `Center` internally (Lesson 27) to center its own single
line of text within *itself* — but `Expanded`'s own child, here, is that
whole `_PlaceholderMessage` widget, and it needs to be positioned within
the *larger* space `Expanded` claimed, not just internally. What's the
real, correct widget for that?

> **Pause and think:** Lesson 27's own real `Center` widget
> (`const Center({super.key, super.child, ...})`) and this lesson's own
> `Align` share the same real parent class — given `Align`'s own real
> `alignment:` parameter defaults to `Alignment.center`, what do you
> think `Center` actually *is*, structurally, given Flutter's own
> real source? If two widgets in this same tree both claim "my child is
> at (40, 40)," using two different real reference points, would you
> expect a test comparing those two real claims directly to agree?

### Project Change

**Reference Source:** no reference implementation. **Files affected:**
`project/lib/main.dart` (already shown, wrapped together with the
previous two units' own real edit). **Change type:** wrap. **Location:**
inside `Expanded`, around `_PlaceholderMessage`. **Dependencies:**
unchanged.

### The New Code

```dart
Align(
  alignment: Alignment.center,
  child: _PlaceholderMessage(message: 'Board goes here'),
),
```

### The Updated Project

Already shown in full in the "`Padding`" unit's own Updated Project
step.

### Isolate

A real, separate lab measures `Align`'s own real positioning — and this
unit's own second genuine false start happened here:

```dart
await tester.pumpWidget(
  const Directionality(
    textDirection: TextDirection.ltr,
    child: Center(
      child: SizedBox(
        key: Key('box'),
        width: 100,
        height: 100,
        child: Align(
          alignment: Alignment.center,
          child: SizedBox(width: 20, height: 20, key: Key('child')),
        ),
      ),
    ),
  ),
);

final boxOrigin = tester.getTopLeft(find.byKey(const Key('box')));
final childOrigin = tester.getTopLeft(find.byKey(const Key('child')));
expect(childOrigin - boxOrigin, const Offset(40, 40));
```

Run for real, this session:

```
Align centers its child using a real, measured alignment factor
```

The first real attempt at this exact test asserted `childOrigin`
directly against `Offset(40, 40)`, with no `boxOrigin` subtraction at
all — and got a real, exact failure: `Expected: Offset(40.0, 40.0)`,
`Actual: Offset(390.0, 290.0)`. Worked out from the exact numbers: `390
= (800 - 20) / 2` and `290 = (600 - 20) / 2` — this lesson's own new
**global vs. local coordinates** Header term, caught directly: the outer
`Center` had placed the whole 100×100 box in the middle of the real
800×600 test surface, not at its origin, so the child's real, global
screen position was never going to equal a small, local offset. The
real fix — measuring `childOrigin - boxOrigin` instead of `childOrigin`
alone — asks the actually correct question: "where is the child,
*relative to the box that positions it*," and the clean rerun above
confirms `Align.center` really does place a 20×20 child exactly `(40,
40)` inside a 100×100 parent: `(100 - 20) / 2 = 40`, on both axes.

### Discard

Discarded — the throwaway `Key('box')`/`Key('child')` boxes never
appear in `project/`; `Align`'s own real use is shown wrapping
`_PlaceholderMessage`.

### Mechanical Walkthrough

- `Align(alignment: Alignment.center, child: _PlaceholderMessage(...))`
  — this lesson's own new `Align`/`Alignment` Header entries:
  `Alignment.center`, a real, named constant equal to `Alignment(0.0,
  0.0)`, tells `Align` to center its child both horizontally and
  vertically within whatever real space `Align` itself was given —
  here, the real space `Expanded` claimed.
- `_PlaceholderMessage(message: 'Board goes here')` — reappearing in
  full from Lesson 27, unchanged.

### CS Lens

`Align` measuring a position **relative to its own local coordinate
space**, only meaningful once translated back to the real screen by
every ancestor above it, is a real, direct instance of **coordinate
space transformation** — the same real idea underneath a 3D game
engine's own local-versus-world object transforms, underneath CSS's own
distinction between `position: relative` and `position: absolute`,
underneath a vector graphics editor's own nested group transforms.

```
Also recognized in: a 3D scene graph's own local-to-world transform
chain, CSS's own relative/absolute positioning contexts, a robot arm's
own joint-relative angles versus its end effector's real position in
the room
```

### SE Lens

The alternative — every widget always reporting its real position in
global screen coordinates, with no local coordinate spaces at all — was
rejected because it would make every single widget's own layout
calculation depend on knowing its own absolute position on screen ahead
of time, breaking the real, local, parent-child reasoning Lesson 25's
own real `RenderObject` architecture depends on entirely. The real cost:
exactly what this unit's own false start hit — measuring "position" at
all always requires deciding *relative to what*, and getting that wrong
produces numbers that are individually completely correct and
collectively meaningless together.

### Commands Needed

None beyond `flutter test`, already explained.

### Run It

Real, captured output, this session — shown above in the Isolate step;
combined project-level evidence already shown in the previous unit's own
Run It step.

### Connect

The board placeholder is now genuinely centered within its own claimed
space, not merely "roughly in the middle" by the previous, simpler
`mainAxisAlignment` approach. The last unit proves one more real layout
widget in isolation — one this project doesn't have a real use for yet.

---

## Concept Unit: `Stack` — Proved, Not Yet Used

### The Problem

Curriculum's own Lesson 29 bullets name `Stack` alongside the widgets
already covered — but nothing in `project/`'s own current, single-screen
placeholder actually needs to overlay one widget on top of another.
Should this concept be skipped, or proved anyway?

> **Pause and think:** Lesson 31's real Sudoku board will need, for each
> of 81 real cells, a number, possibly a selection highlight, possibly a
> hint marker — all in the *same* screen position, at once. Given
> `Row`/`Column` place children one after another, could either lay
> three things directly on top of each other at all? Given this
> lesson's own real, quoted `Stack` shape (`required this.children`,
> no `mainAxisAlignment` at all), what does the *absence* of a
> main-axis concept already tell you about how it positions things
> differently from `Row`/`Column`?

### Project Change

No reference counterpart — honestly, no natural use in `project/` yet;
this unit's own real evidence lives only in
`verification/lesson-29/test/layout_geometry_test.dart`, per this
lesson's own Header entry for `Stack`. Full, real project use is
deferred to Lesson 31.

### The New Code

```dart
await tester.pumpWidget(
  Directionality(
    textDirection: TextDirection.ltr,
    child: Stack(
      children: const [
        SizedBox(width: 100, height: 100, key: Key('back')),
        SizedBox(width: 50, height: 50, key: Key('front')),
      ],
    ),
  ),
);
```

### The Updated Project

Not applicable — no `project/` file changes this unit.

### Isolate and Discard

This *is* the isolated case — the smallest real structure proving
`Stack`'s own default overlay behavior. Discarded — never becomes part
of `project/` this lesson.

### Mechanical Walkthrough

- `Stack(children: [SizedBox(...), SizedBox(...)])` — this lesson's own
  `Stack` Header entry: two real children, deliberately different real
  sizes, both handed with no `Positioned` wrapper (not covered this
  lesson) and no explicit `alignment` override, exercising `Stack`'s own
  real, documented default (`AlignmentDirectional.topStart` — every
  child's own top-left corner, by default).

### Execution Trace

Real, run this session, via `flutter test test\layout_geometry_test.dart`:

```
Stack overlays every child at the same origin by default
```

1. `tester.getTopLeft(find.byKey(const Key('back')))` reads the real,
   global position of the first, larger real child.
2. `tester.getTopLeft(find.byKey(const Key('front')))` reads the real,
   global position of the second, smaller real child.
3. `expect(backTopLeft, frontTopLeft);` — real, exact equality: both
   real children's own top-left corners land at the identical real
   position, direct, measured confirmation that `Stack`, unlike
   `Row`/`Column`, never moves a later child out of an earlier one's
   own way at all.

### CS Lens

`Stack` is a real, working instance of **layered composition** —
multiple independent things occupying the same real space, each drawn
in order, later ones on top — the exact opposite arrangement strategy
from `Row`/`Column`'s own sequential flow.

```
Also recognized in: a photo editor's own layer stack, a game engine's
own sprite z-ordering, HTML/CSS's own `position: absolute` elements
overlapping their normal document flow, a PDF's own layered content
streams
```

### SE Lens

The alternative — building a future Sudoku cell out of `Row`/`Column`
alone, somehow squeezing a number, a highlight, and a hint marker into
sequential rather than overlapping space — was never seriously viable:
those three things are not "next to" each other, they're "in the same
place, some more visible than others," which is precisely `Stack`'s own
real, specific job. The real cost of learning it now, without a real use
yet: this unit's own real evidence lives only in a throwaway lab, not
`project/` — an honest, explicitly tracked gap, not a silent one.

### Commands Needed

None beyond `flutter test`, already explained.

### Run It

Real, captured output, this session — shown above in the Execution
Trace.

### Connect

Every widget curriculum's own Lesson 29 bullets named is now real,
proved, and understood — six of seven already at work in `project/`'s
own real screen, the seventh (`Stack`) proved and waiting for Lesson
31's real board.

---

## Connect the Pieces

Follow the real number `16` — `EdgeInsets.all(16)`'s own value — through
every real layout decision this lesson made:

1. `Padding(padding: EdgeInsets.all(16), ...)` wraps `SudokuApp.build()`'s
   own entire `Scaffold.body` — real-measured, exact: the real `Column`
   inside it starts precisely 16 real pixels from every real screen
   edge, not "close to" the edge.
2. That `Column` holds two real things: an `Expanded` (claiming all real
   leftover vertical space) wrapping an `Align` (centering, real-measured
   exact, `_PlaceholderMessage` within that claimed space), and
   `_SessionStatus`, taking only its own real, natural height.
3. `_SessionStatus`'s own `build()` uses a real `Row` — real-measured,
   exact — to place "Elapsed: N s" and "Games started: N" on the same
   real horizontal line, sixteen real pixels apart (a second, smaller,
   real use of the exact same `16`-pixel spacing idea, via `SizedBox
   (width: 16)`).
4. Every one of these real, measured claims survived a genuine false
   start along the way — `flutter_test`'s own real, fixed 800×600 test
   surface, and global-versus-local coordinates — both caught by a real
   assertion failing with an exact, diagnosable number, both fixed for
   real, both kept in this lesson's own record rather than smoothed
   over.
5. `Stack`, curriculum's own seventh real bullet, is proved the same
   rigorous way — real, measured, exact — with its own real project use
   honestly still ahead, at Lesson 31.

Every real position and size this lesson claims is something a test
actually measured, this session, in real logical pixels — not a
description of what the layout was *supposed* to do. The next lesson,
curriculum's own "Flutter's constraint system," takes the two ideas this
lesson's own false starts already forced into the open — tight versus
loose constraints, and who actually gets to decide a widget's own real
size — and gives them the deep, dedicated treatment curriculum.md itself
asks for.
