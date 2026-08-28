# Lesson 62: Reachable More Than One Way

**What you will build.** A real, second, non-visual layer on top of
this app's existing screen: explicit labels a screen reader can speak
for every real cell and number-pad button, verified against a real,
inspectable semantics tree rather than assumed; a real, computed proof
that this app's own theme colors are legible, not just apparently so;
every real tappable target raised toward — and, for the number pad,
fully reaching — a real, published minimum size; and a real, second
input path into this same app, a physical keyboard, reaching the exact
same real `GameIntent`s a tap already does. The transferable problem:
a UI is not "done" once it looks right to one person, on one input
device, with one set of senses — the same real information and the
same real actions have to reach a player who cannot see the screen,
cannot make fine motor taps, or has no touchscreen at all, through a
completely different real path, without this app's own real rules or
state ever knowing the difference.

**What you need to know first.** `SudokuCellView`/`SudokuBoardView`'s
own existing widget structure and real `InkWell`-based tap handling.
`NumberPadButtonView`'s own existing structure. `_dispatch` and this
app's own real `GameIntent` pipeline (`SelectCellIntent`,
`EnterDigitIntent`) — every new real input path in this lesson still
funnels through it, unchanged. `AppTheme`'s own real
`ColorScheme.fromSeed` and this app's real light/dark themes. Two real,
already-established facts this lesson's own labs directly reuse: a
bare, root-level widget receiving tight test-surface constraints unless
wrapped in something that hands it loose ones instead, and that a
`Transform`-based visual effect changes what is painted, never a real
`RenderObject`'s own reported layout size.

**Terms used in this lesson**

- **Accessibility** — designing and building software so it remains
  genuinely usable by someone with a disability, temporary or
  permanent, affecting vision, hearing, motor control, or cognition —
  not an added feature layered on afterward, but a real property of
  whether the software actually works for the full range of people who
  might use it. It exists because the assumption "the person using this
  can see the screen and tap precisely" is not universally true, and
  code built only against that assumption silently locks other real
  people out.
- **Semantics tree** — a real, second tree Flutter builds and maintains
  alongside the ordinary widget/element/render tree, made of
  `SemanticsNode`s carrying non-visual information (a label, a role
  like "button," a current state like "selected") instead of pixels. It
  exists because an assistive technology (a screen reader, a
  switch-access device) does not read pixels off the screen at all — it
  reads this real, separate tree instead, which means a screen can
  visually communicate something this tree never mentions, and that
  gap is invisible to anyone not using assistive technology themselves.

**Objects and methods used**

- **`Semantics`**
  - *What it is:* a real, built-in Flutter widget that attaches
    non-visual, real semantics information to whatever real widget
    subtree it wraps, without changing anything about how that subtree
    actually looks or paints.
  - *Implementation:* its real, declared constructor (only the members
    this lesson actually uses), read fresh this session from
    `C:\flutter\packages\flutter\lib\src\widgets\basic.dart`:
    ```dart
    Semantics({
      super.key,
      super.child,
      super.container = false,
      super.excludeSemantics = false,
      super.selected,
      super.button,
      super.label,
      super.onTap,
      // ...many other real, unused-by-this-lesson fields
    });
    ```
  - *Its use:* wraps this app's own real `SudokuCellView`/
    `NumberPadButtonView` content, replacing whatever real semantics
    that content would otherwise generate on its own with one, real,
    deliberately authored node.
  - *Type:* a `StatelessWidget`-shaped configuration object (its own
    real superclass is more involved, but nothing this lesson calls
    depends on that).
  - *Responsibility:* build and attach one real `SemanticsNode`
    describing this subtree — its label, whether it behaves like a
    button, whether it's currently selected, and what happens if an
    assistive technology triggers its real tap action — to the real,
    separate semantics tree a screen reader actually reads.
  - *Depends on:* the real values this lesson's own code supplies —
    `label`, `button`, `selected`, `onTap` — and, when `container: true`
    is set, nothing from any nearby ancestor node, since it becomes a
    real boundary of its own instead.
  - *Connects to:* read by Flutter's real semantics owner, which hands
    the assembled, real semantics tree to the host platform's own real
    accessibility APIs (Windows Narrator, TalkBack, VoiceOver) —
    nothing in this app's own code talks to those platform APIs
    directly.
  - *Shape:* a Presentation-layer widget; the real information it
    carries is authored once, at the same real call site as the visual
    content it describes.
- **`excludeSemantics`**
  - *What it is:* a real, boolean constructor parameter on `Semantics`
    (already shown as part of its real declared shape, above) — not a
    separate class, but significant enough, and easy enough to miss the
    effect of, to explain on its own.
  - *Implementation:* when `true`, every real semantics-contributing
    descendant of this `Semantics` widget is dropped from the real
    semantics tree entirely — only this node's own, explicitly-given
    properties remain.
  - *Its use:* set `true` on every `Semantics` wrapper in this lesson,
    so a screen reader hears exactly one, deliberately authored
    sentence per cell or button — not that sentence *plus* whatever a
    plain child `Text`/`InkWell` would have separately contributed.
  - *Type:* a `bool` constructor parameter.
  - *Responsibility:* decide whether this node's own real subtree gets
    to speak for itself in the semantics tree, or whether this node
    speaks for the whole subtree alone.
  - *Depends on:* nothing beyond the `Semantics` widget carrying it.
  - *Connects to:* real, run, direct proof of its own effect is this
    lesson's own first Concept Unit's isolated lab, below — with it
    `false` (the real default), a real child `Text`'s own label merges
    into the parent's; with it `true`, only the parent's remains.
  - *Shape:* Presentation-layer, local to wherever `Semantics` is used.
- **`SemanticsNode` / `tester.ensureSemantics()` / `tester.getSemantics()` / `matchesSemantics()`**
  - *What it is:* `SemanticsNode` is a real, concrete node in the real
    semantics tree explained above; `tester.ensureSemantics()` is a
    real `flutter_test` method that turns semantics generation on for a
    test (off by default, since it costs real, extra work Flutter
    otherwise skips); `tester.getSemantics(finder)` reads the real,
    live `SemanticsNode` for whatever widget a `Finder` locates;
    `matchesSemantics(...)` is a real `Matcher`, built specifically to
    assert against a `SemanticsNode`'s own real fields.
  - *Implementation:* `SemanticsHandle tester.ensureSemantics()`,
    `SemanticsNode tester.getSemantics(FinderBase<Element> finder)`, and
    `Matcher matchesSemantics({String? label, bool isButton = false,
    bool hasSelectedState = false, bool isSelected = false, bool
    hasTapAction = false, ...})` — all real, read fresh this session
    from `C:\flutter\packages\flutter_test\lib\src\controller.dart` and
    `.../matchers.dart`.
  - *Its use:* this lesson's own real, direct way to check what a
    screen reader would actually announce, without needing a real
    screen reader running live — the real semantics tree itself is the
    thing being read either way.
  - *Type:* a class (`SemanticsNode`), two `WidgetController` instance
    methods, and a top-level `Matcher`-returning function.
  - *Responsibility:* `ensureSemantics` turns generation on and returns
    a real `SemanticsHandle` that must be disposed to turn it back off;
    `getSemantics` walks the real, live tree to the node a `Finder`
    resolves to; `matchesSemantics` compares a real node's own fields —
    label, flags, actions — against exactly the ones named, failing on
    any unexpected extra flag or action too, not only a missing one.
  - *Depends on:* a real, already-pumped widget tree, and, for
    `matchesSemantics`, a real `SemanticsNode` to compare against.
  - *Connects to:* used throughout this lesson's own new, permanent
    `accessibility_test.dart`, and its own isolated lab, below — the
    exact real mechanism proving every claim this lesson makes about
    what a cell or button "says."
  - *Shape:* test-only tooling — none of these three appear anywhere in
    this app's own real, shipped `lib/` code.
- **`Color.computeLuminance()`**
  - *What it is:* a real, built-in `dart:ui` method already present on
    every `Color` this app has ever used, computing that color's real
    relative luminance — a single real number from `0.0` (darkest) to
    `1.0` (lightest).
  - *Implementation:* its real, complete body, fetched fresh this
    session from
    `C:\flutter\bin\cache\pkg\sky_engine\lib\ui\painting.dart`:
    ```dart
    // See <https://www.w3.org/TR/WCAG20/#relativeluminancedef>
    static double _linearizeColorComponent(double component) {
      if (component <= 0.03928) return component / 12.92;
      return math.pow((component + 0.055) / 1.055, 2.4) as double;
    }

    double computeLuminance() {
      final double R = _linearizeColorComponent(r);
      final double G = _linearizeColorComponent(g);
      final double B = _linearizeColorComponent(b);
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }
    ```
    The real source comment cites the real, published WCAG relative
    luminance definition directly — this is not this app's own
    approximation of an accessibility standard; it is Flutter's own
    real implementation of that standard's own real formula.
  - *Its use:* this lesson's own new, real `contrastRatio` function
    (project code, walked through in full in its own Concept Unit,
    below) calls this real method on two real colors instead of
    re-deriving the linearization math by hand.
  - *Type:* a real instance method on `Color`.
  - *Responsibility:* answer one real number for one real color — how
    perceptually light or dark it is — with no notion of any *other*
    color or of contrast at all; that comparison is a separate,
    real, further calculation this lesson's own code performs on top.
  - *Depends on:* the calling `Color`'s own real `r`/`g`/`b` channel
    values (real `double`s, 0.0-1.0, this app's own already-established
    real `Color` API).
  - *Connects to:* called twice — once per color — inside this lesson's
    own `contrastRatio`, below.
  - *Shape:* Dart-SDK-level (`dart:ui`), reused unmodified — not
    Flutter- or project-specific at all.
- **`kMinInteractiveDimension`**
  - *What it is:* a real, published Flutter constant naming the
    Material Design minimum size for any real, interactive region.
  - *Implementation:* `const double kMinInteractiveDimension = 48.0;`,
    read fresh this session from
    `C:\flutter\packages\flutter\lib\src\material\constants.dart`, whose
    own real doc comment states its purpose directly: "used to avoid
    small regions that are hard for the user to interact with... a
    square of size `kMinInteractiveDimension` x
    `kMinInteractiveDimension` is the smallest acceptable region that
    should respond to gestures."
  - *Its use:* the real, new fixed size for every `NumberPadButtonView`,
    replacing this app's own original `44`-pixel literal, and the real
    upper bound this lesson's board-cell sizing already clamped
    toward, now given its own real, named meaning instead of a bare
    number.
  - *Type:* a top-level, `const double`.
  - *Responsibility:* name one, single, real, shared number so every
    real call site that cares about a minimum touch target references
    the identical value, on purpose, rather than each guessing its own.
  - *Depends on:* nothing; a fixed, real constant.
  - *Connects to:* read directly inside `NumberPadButtonView.build` and
    inside both of `SudokuApp`'s own real layout `LayoutBuilder`s,
    below.
  - *Shape:* framework-level, imported from `package:flutter/material.dart`
    — this app defines nothing of its own to replace it.
- **`FittedBox` / `BoxFit.scaleDown`**
  - *What it is:* a real, built-in Flutter widget that measures its own
    single `child` at that child's real, natural, *unconstrained* size,
    then paints it scaled to fit within whatever real space `FittedBox`
    itself was actually given — `BoxFit.scaleDown` is one real, named
    member of the `BoxFit` enum, specifically the one that only ever
    shrinks, never enlarges, its child.
  - *Implementation:* real and, for this lesson's own purpose,
    behaviorally two real, distinct steps: layout — the child is given
    genuinely unconstrained real constraints and reports back its own,
    real, natural size, whatever that is; paint — a real transform
    matrix is computed from that natural size against `FittedBox`'s own
    real, given size, and applied only at paint time.
  - *Its use:* wraps this app's own board (`SudokuBoardView`) inside
    both real layouts, so a board sized toward the new, real, raised
    touch-target minimum that genuinely cannot fit a real, narrow
    screen scales down as a whole, visually, rather than throwing a
    real layout error.
  - *Type:* a real, single-child `StatelessWidget`.
  - *Responsibility:* reconcile a child's own real, natural size against
    whatever real space is actually available, using a real, uniform
    visual scale — never by reflowing, wrapping, or clipping the
    child's own internal layout.
  - *Depends on:* a real `child`, and a real, bounded `fit:`, both
    supplied at this lesson's own two real call sites.
  - *Connects to:* wraps `SudokuBoardView` directly; reads whatever
    constraints its own parent (a `LayoutBuilder`-returned position
    inside a real `Card`) hands it.
  - *Shape:* a small, shared, framework-level utility widget — the
    identical real category as `Transform`, reappearing from earlier in
    this project.
- **`Focus` / `FocusNode` / `onKeyEvent` / `KeyEventResult`**
  - *What it is:* `Focus` is a real, built-in Flutter widget that gives
    its own real subtree the ability to hold *keyboard* focus and react
    to real, physical key events; `FocusNode` is the real, underlying
    object representing one real, focusable position; `onKeyEvent` is a
    real, optional callback `Focus` invokes for every real key event
    reaching it while focused; `KeyEventResult` is a real, three-value
    enum the callback returns, telling Flutter what to do with the
    event next.
  - *Implementation:* its real, relevant constructor members, read
    fresh this session from
    `C:\flutter\packages\flutter\lib\src\widgets\focus_scope.dart`:
    ```dart
    const Focus({
      super.key,
      required this.child,
      this.autofocus = false,
      FocusOnKeyEventCallback? onKeyEvent,
    });
    ```
    and, from
    `C:\flutter\packages\flutter\lib\src\widgets\focus_manager.dart`:
    ```dart
    typedef FocusOnKeyEventCallback = KeyEventResult Function(FocusNode node, KeyEvent event);

    enum KeyEventResult { handled, ignored, skipRemainingHandlers }
    ```
  - *Its use:* wraps this app's own real screen body; `autofocus: true`
    means this app is ready to receive real, physical key events the
    instant it launches, with no separate real tap needed first;
    `onKeyEvent` is where every real arrow-key and digit-key press this
    lesson handles actually arrives.
  - *Type:* `Focus` is a real `StatefulWidget`; `FocusNode` a plain,
    real class; `KeyEventResult` a real enum; `FocusOnKeyEventCallback`
    a real function-type alias.
  - *Responsibility:* `Focus` manages one real `FocusNode`'s own
    lifecycle and forwards every real key event reaching it, while
    focused, to `onKeyEvent`; the callback's own real job is deciding
    whether it consumed that event (`handled`, stopping it from
    reaching anything else) or not (`ignored`, letting it continue).
  - *Depends on:* a real `child`, and, for keyboard handling
    specifically, a real `onKeyEvent` callback.
  - *Connects to:* wraps `SafeArea` inside `SudokuApp.build`, below;
    `onKeyEvent` is `_SudokuAppState._handleKeyEvent`, which reaches the
    identical, already-real `_dispatch` method every tap already uses.
  - *Shape:* Presentation-layer, the one, real, new entry point into
    this app's own already-existing intent pipeline.
- **`KeyEvent` / `KeyDownEvent` / `LogicalKeyboardKey`**
  - *What it is:* `KeyEvent` is a real, abstract class describing one
    real, physical keyboard event; `KeyDownEvent` is a real, concrete
    subclass specifically for the moment a key is *pressed* (as
    opposed to released); `LogicalKeyboardKey` is a real class naming
    *which* real key, independent of physical keyboard layout.
  - *Implementation:* `abstract class KeyEvent`;
    `class KeyDownEvent extends KeyEvent`, both read fresh this session
    from
    `C:\flutter\packages\flutter\lib\src\services\hardware_keyboard.dart`;
    every real `KeyEvent` carries a real `logicalKey` field.
  - *Its use:* `_handleKeyEvent` checks `event is! KeyDownEvent` first,
    so a real key *release* is never misread as a second real press;
    `event.logicalKey` is compared against real, named constants
    (`LogicalKeyboardKey.arrowUp`, `.digit5`, and so on) to decide what
    this app's own real code should do.
  - *Type:* two real classes in an `is`/subtype relationship, plus a
    third, real, comparable value class.
  - *Responsibility:* `KeyEvent`/`KeyDownEvent` carry the real facts
    about one real, physical event; `LogicalKeyboardKey` gives that
    event's own real key a stable, real identity to compare against.
  - *Depends on:* the real, underlying platform's own keyboard
    handling, which Flutter's own engine translates into these real
    Dart objects.
  - *Connects to:* read inside `_handleKeyEvent`; real instances of
    `LogicalKeyboardKey` are the real keys of this lesson's own new
    `digitKeys` map, below.
  - *Shape:* `package:flutter/services.dart` — a real, lower-level
    package than `material.dart`, imported for the first time in this
    project by this lesson.
- **`tester.sendKeyEvent`**
  - *What it is:* a real `flutter_test` method that simulates one real,
    physical key press-and-release for a given `LogicalKeyboardKey`.
  - *Implementation:* `Future<bool> sendKeyEvent(LogicalKeyboardKey key,
    {String? platform, String? character})`, read fresh this session
    from
    `C:\flutter\packages\flutter_test\lib\src\controller.dart` — real
    and, internally, dispatches a real `KeyDownEvent` followed by a
    real `KeyUpEvent` against the currently focused real `FocusNode`.
  - *Its use:* this lesson's own real, permanent keyboard-navigation
    tests drive `_handleKeyEvent` with it directly, the same real way a
    real, physical keypress would.
  - *Type:* a `WidgetController` instance method.
  - *Responsibility:* simulate one real, complete physical key
    interaction for a real test, without needing a real, physical
    keyboard or platform.
  - *Depends on:* a real, already-focused widget somewhere in the
    currently pumped tree (`Focus(autofocus: true, ...)`, above,
    already guarantees this the instant `SudokuApp` is pumped).
  - *Connects to:* used throughout this lesson's own new, permanent
    keyboard tests and its own isolated lab, below.
  - *Shape:* test-only tooling.

## Concept Unit: Semantic labels

### The Problem

`SudokuCellView`'s own real content, since it was first built, has
always been a plain `Text` showing a digit (or nothing) inside a
tappable `InkWell`. Flutter automatically derives *some* real semantics
from that — the `Text`'s own string becomes a real, spoken label; the
tappable region becomes a real, announced "button." But an empty
cell's own real label is an empty string — nothing at all — and even a
filled cell's real label is only ever the bare digit, with no real
information at all about *which* cell, or whether entering a new value
there would even be allowed.

> **Try it yourself first.** Picture using this app with your eyes
> closed, hearing only whatever a screen reader speaks as your finger
> moves across the real, on-screen grid. If every real cell's own
> spoken content were only ever "", "5", "", "", "3", "" (its own bare
> digit or nothing), could you tell which real cell you were on, or
> whether it was a given clue you could never change versus one you
> could? What real, specific pieces of information would a spoken
> sentence need to include for you to actually play this game by
> hearing alone?

### Introducing the concept

A minimal, throwaway lab proves both the real problem and the real fix,
side by side. First, without `excludeSemantics`:

```dart
Semantics(
  label: 'Increment',
  button: true,
  child: InkWell(onTap: () {}, child: const Text('3')),
);
```

Run for real (`verification/lesson-62/accessibility_labs_test.dart`,
Lab 1) — because exactly how a real child's own contributed semantics
combines with an explicit parent label is not something to state with
confidence unaided:

```
tester.getSemantics(find.byType(InkWell)).label == 'Increment\n3'
```

The real child `Text`'s own automatic label ("3") did not disappear —
it **merged** with the parent's explicit `'Increment'`, becoming one,
real, but genuinely confusing combined sentence a screen reader would
actually speak. Adding one real argument changes this outcome
completely:

```dart
Semantics(
  label: 'Increment',
  button: true,
  excludeSemantics: true,
  child: InkWell(onTap: () {}, child: const Text('3')),
);
```

Real, run proof, same lab: `tester.getSemantics(find.byType(InkWell))
.label == 'Increment'` — the child's own real contribution is gone
entirely; exactly one, deliberately authored sentence remains. This
mechanism — a widget-tree subtree contributing its own real semantics
unless explicitly told not to — is called **semantics merging**.

### Discard the throwaway example

This lab's own "Increment"/InkWell pairing never joins the real
project. What carries forward: every custom, composite tappable widget
in this app needs `excludeSemantics: true` alongside its own explicit
label, or a screen reader will hear a confusing, automatically-merged
sentence instead of the one this app's own code actually intends.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart`
  (`_SudokuCellViewState` gains a real, computed `_semanticLabel`
  getter and wraps its own existing `build` output);
  `project/lib/features/sudoku/presentation/number_pad_view.dart`
  (`NumberPadButtonView.build` gains the identical real wrapping).
- **Change type** — add (wrap existing content; no existing real
  behavior is removed).
- **Location** — the outermost real widget each `build` method returns.
- **Dependencies** — none beyond the Flutter SDK.

### The New Code

```dart
Semantics(
  label: _semanticLabel,
  button: true,
  selected: widget.isSelected,
  excludeSemantics: true,
  onTap: widget.onTap,
  child: /* this cell's own existing real content, unchanged */,
);
```

### The Updated Project

`_SudokuCellViewState`'s own real `_semanticLabel` getter and the start
of `build`, numbered:

```dart
 1  String get _semanticLabel {
 2    final position = 'Row ${widget.row + 1}, column ${widget.col + 1}';
 3    if (widget.isGiven) {
 4      return '$position, given clue, ${widget.value}';
 5    }
 6    if (widget.value == null) {
 7      return '$position, empty';
 8    }
 9    return '$position, ${widget.value}';
10  }
11
12  @override
13  Widget build(BuildContext context) {
14    return Semantics(                                       // ← new
15      label: _semanticLabel,                                // ← new
16      button: true,                                          // ← new
17      selected: widget.isSelected,                           // ← new
18      excludeSemantics: true,                                // ← new
19      onTap: widget.onTap,                                   // ← new
20      child: AnimatedBuilder(
21        /* this cell's entire existing real subtree, unchanged */
22      ),
23    );
24  }
```

Lines 1-10 are an entirely new, real, private getter — this class's
first. Lines 14-19 wrap `build`'s own, previously-returned root widget
(line 20 onward, otherwise unchanged) in the real `Semantics` explained
in this lesson's own Header, above — every real animation this app
already plays (the selection fade, the placement pop, the rejection
shake) is completely unaffected, since none of it lives above this
wrapper.

`NumberPadButtonView.build`, the identical real change, numbered:

```dart
 1  Widget build(BuildContext context) {
 2    return Semantics(                                        // ← new
 3      label: 'Enter digit $digit',                            // ← new
 4      button: true,                                           // ← new
 5      excludeSemantics: true,                                 // ← new
 6      onTap: onTap,                                            // ← new
 7      child: InkWell(
 8        onTap: onTap,
 9        child: Container(
10          width: kMinInteractiveDimension,
11          height: kMinInteractiveDimension,
12          alignment: Alignment.center,
13          decoration: BoxDecoration(border: Border.all()),
14          child: Text('$digit', style: Theme.of(context).textTheme.titleMedium),
15        ),
16      ),
17    );
18  }
```

(Line 10-11's own real `kMinInteractiveDimension` is this lesson's own
separate, later Concept Unit's change, shown here already landed since
this is the file's own real, current state.)

### Mechanical walkthrough

- `String get _semanticLabel` — a real, computed getter (already
  established elsewhere in this project, e.g. `GameSession.elapsed`),
  re-run fresh every time it's read rather than stored.
- `'Row ${widget.row + 1}, column ${widget.col + 1}'` — real string
  interpolation (already established) over `widget.row`/`.col`, each
  incremented by one: this app's own internal grid indices are
  zero-based, but a spoken "row 1, column 1" reads more naturally to a
  person than "row 0, column 0."
- `widget.isGiven ? ... : ...` — a real, reappearing ternary-adjacent
  chain of `if` statements (both constructs already established),
  choosing among three real, mutually exclusive sentence shapes: given,
  empty, or filled.
- `Semantics(label: _semanticLabel, button: true, selected:
  widget.isSelected, excludeSemantics: true, onTap: widget.onTap,
  child: ...)` — constructs the real widget explained in full in this
  lesson's own Header, above; `button: true` applies to *every* real
  cell now, given or not, since every real cell can genuinely be
  selected by a real tap — a deliberate correction made after this
  lesson's own permanent tests, below, first caught a version that
  withheld it for given clues specifically; `selected:
  widget.isSelected` reads this cell's own already-existing real field,
  now also exposed non-visually; `onTap: widget.onTap` gives an
  assistive technology's own real "activate" action the identical real
  callback a physical tap already uses.
- `Semantics(label: 'Enter digit $digit', button: true, excludeSemantics:
  true, onTap: onTap, child: ...)` — the identical real pattern, on
  `NumberPadButtonView`; `'Enter digit $digit'` real-interpolates the
  actual digit this specific button represents, spoken in full rather
  than as a bare glyph.

### CS lens

The **semantics tree**, named in full in this lesson's own Header,
above, is a real, concrete instance of maintaining two parallel real
representations of the same underlying real state, each serving a
genuinely different real consumer — the ordinary render tree for
sighted, pointing input; this one for assistive technology. Also
recognized in: an HTML document's own real DOM versus its accessibility
tree, built by every real browser for the identical real reason; a
video game's own separate audio-cue layer, conveying real information
(an enemy's real position) a purely visual HUD might also show, for
players who rely on sound; a building's real Braille signage existing
alongside, not instead of, its printed signs.

### SE lens

The real alternative here was leaving Flutter's own automatic,
merged semantics as-is and hoping they were good enough — real, zero
extra code, but a real, silent gap this lesson's own opening problem
already named: an empty cell has no real spoken content at all under
that default. The real cost of the chosen approach: every custom,
composite widget in this app now needs its own, explicit `Semantics`
wrapper, by hand, forever — a real, ongoing maintenance surface plain
`Text`/`ElevatedButton` widgets elsewhere in this app don't carry,
since those already generate reasonable real semantics on their own
(their own real child `Text` already *is* the reasonable label).

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Every real cell and number-pad button now carries one, real,
deliberately authored sentence describing itself — the raw material
the next Concept Unit's own verification tooling actually reads.

---

## Concept Unit: Screen readers

### The Problem

The Concept Unit above added real labels — but nothing yet has
actually confirmed what a screen reader would really hear. A label
that reads correctly in the source code could still merge wrong, get
overridden by a nearby ancestor, or simply not attach to the node a
real accessibility service would actually land on.

> **Try it yourself first.** This app already has a real, working habit
> of proving a UI claim by measuring the actual, rendered widget tree
> rather than trusting the code that built it — real border widths,
> real colors, real positions, all already checked this way elsewhere
> in this project. Semantics data isn't paint, though; it's a separate,
> real tree `tester.getSize`/`tester.widget` don't touch at all. What
> would a `flutter_test` tool need to actually read, in order to check
> semantics the same rigorous way this project already checks pixels?

### Introducing the concept

A minimal, throwaway lab proves the real verification mechanism itself,
on a widget with nothing else going on:

```dart
final handle = tester.ensureSemantics();
await tester.pumpWidget(
  MaterialApp(
    home: Material(
      child: Semantics(
        label: 'A real, minimal label',
        button: true,
        container: true,
        child: const SizedBox(key: Key('lab2-target'), width: 10, height: 10),
      ),
    ),
  ),
);
final node = tester.getSemantics(
  find.ancestor(of: find.byKey(const Key('lab2-target')), matching: find.byType(Semantics)).first,
);
```

Run for real (Lab 2, same file) — because whether `tester.getSemantics`
resolves to *this* widget's own real node, versus some other, nearby
real `Semantics` widget the framework itself also happens to build, is
exactly the kind of thing worth checking rather than assuming: a real,
first-attempt version of this lab, without a `Key`-anchored finder,
resolved to the wrong node entirely — Flutter's own `MaterialApp`
internally builds its own, separate, real `Semantics` widgets too, and
a bare `find.byType(Semantics).first` matched one of those instead.
Anchoring the finder to a real `Key` on the actual target, then walking
up to its nearest `Semantics` ancestor, fixed it:

```
node = matchesSemantics(label: 'A real, minimal label', isButton: true)  → real, passing
```

`container: true` also matters here, proven by the same real run: it
forces this specific node to become its own real, distinct boundary in
the semantics tree, rather than merging into whatever real ancestor
boundary happened to be nearest.

### Discard the throwaway example

This lab's own minimal `SizedBox` target is deleted here. What carries
forward: `tester.ensureSemantics()` (turning generation on for the
test), `tester.getSemantics(finder)` (reading the real, live node), and
`matchesSemantics(...)` (asserting against it) are this app's own real,
repeatable recipe for checking what a screen reader would actually
announce.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — `project/test/accessibility_test.dart` (new
  file).
- **Change type** — add.
- **Location** — a new, real, permanent test file; no `lib/` code
  changes in this specific Concept Unit.
- **Dependencies** — the Concept Unit above's own real `Semantics`
  labels, already landed.

### The New Code

```dart
final handle = tester.ensureSemantics();
await tester.pumpWidget(const ProviderScope(child: SudokuApp()));

final node = tester.getSemantics(
  find.byWidgetPredicate((w) => w is SudokuCellView && w.row == 0 && w.col == 0),
);
expect(
  node,
  matchesSemantics(
    label: 'Row 1, column 1, given clue, 5',
    isButton: true,
    hasTapAction: true,
    hasSelectedState: true,
    isSelected: false,
  ),
);
```

### The Updated Project

`project/test/accessibility_test.dart`'s own real given-clue check, in
full, numbered:

```dart
 1  testWidgets(
 2    'a real given clue reports its position, that it is given, its value, and that it can still be selected',
 3    (tester) async {
 4      final handle = tester.ensureSemantics();
 5      await tester.pumpWidget(const ProviderScope(child: SudokuApp()));
 6
 7      final node = tester.getSemantics(
 8        find.byWidgetPredicate(
 9          (widget) => widget is SudokuCellView && widget.row == 0 && widget.col == 0,
10        ),
11      );
12      expect(
13        node,
14        matchesSemantics(
15          label: 'Row 1, column 1, given clue, 5',
16          isButton: true,
17          hasTapAction: true,
18          hasSelectedState: true,
19          isSelected: false,
20        ),
21      );
22
23      handle.dispose();
24    },
25  );
```

A real, honest, first-attempt failure this exact test caught, kept as
documented evidence: its own first version asserted no selection-related
flags at all, on the reasoning that an unselected given clue "isn't
selected." The real run disagreed — `hasSelectedState: true` was
present even with `isSelected: false`, because this app's own real
`_dispatch` genuinely lets *any* cell, given clue included, become
selected; the assertion was wrong, not the code, and the real,
production `Semantics` widget was corrected to match (`button: true`
unconditionally, `onTap: widget.onTap` unconditionally — see the
Concept Unit above's own final, landed state), closing a real,
first-attempt accessibility gap this exact check exists to catch.

### Mechanical walkthrough

- `final handle = tester.ensureSemantics()` — the real method explained
  in full in this lesson's own Header, above; without this call, this
  test's own real `getSemantics` call would find no attached semantics
  tree at all, since Flutter skips building one by default.
- `tester.getSemantics(find.byWidgetPredicate(...))` — the real method
  explained in full in this lesson's own Header, above; `find
  .byWidgetPredicate` (already established elsewhere in this project)
  locates the specific real `SudokuCellView` at `(0, 0)`.
- `matchesSemantics(label: ..., isButton: true, hasTapAction: true,
  hasSelectedState: true, isSelected: false)` — the real matcher
  explained in full in this lesson's own Header, above; every named
  field must match exactly, and, per its own real, strict design, any
  *unnamed* real flag or action present on the node also fails the
  match — this is what caught the real, first-attempt gap described
  above, rather than silently allowing extra, unaccounted-for real
  semantics through.
- `handle.dispose()` — releases the real `SemanticsHandle` `ensureSemantics`
  returned, turning generation back off; omitting this leaves semantics
  generation on for every later test in the same real run, a real,
  avoidable cost this lesson's own tests take care not to introduce.

### CS lens

This Concept Unit's own real technique — reading a system's actual,
internal state through a dedicated inspection API instead of trusting
the code that produced it — is **testing through an observable
interface**, the identical real principle this project's own measured-
geometry tests already apply to pixels, now applied to a completely
different real tree. Also recognized in: browser accessibility-tree
inspectors (Chrome DevTools' own real Accessibility panel, reading the
identical *kind* of tree a screen reader does); database query plans,
inspected directly rather than inferred from a query's own source text;
a compiler's own `-S`/disassembly flag, showing real, generated machine
code instead of trusting the source alone.

### SE lens

The real alternative here was manual, live testing with an actual
screen reader (Windows' own real, built-in Narrator, already available
on this development machine) for every real change. Real and valuable
as a final, human check, but not a repeatable, real regression test —
nothing catches a *later* change silently breaking a label that manual
testing already confirmed once. The real cost of the chosen approach:
`matchesSemantics`' own strict, no-unnamed-extras behavior means every
test has to name every real flag/action actually present, not just the
ones a given test cares about — more verbose, but exactly what caught
this lesson's own real, first-attempt gap above.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

The Concept Unit above authored real labels; this one proves, with the
identical real rigor this project already applies to pixels, that
those labels actually reach a screen reader intact.

---

## Concept Unit: Contrast

### The Problem

This app's own real theme (`ColorScheme.fromSeed(seedColor:
Colors.indigo)`) was chosen for how it looks, not measured against any
real, numeric standard. A color pair that looks fine to one person can
still be genuinely, measurably hard to read for someone with low vision
or color blindness — a real, separate concern from a screen reader
entirely, since this affects a *sighted* person looking directly at the
real screen.

> **Try it yourself first.** "Good contrast" is not just "not the same
> color" — dark gray text on a black background is technically two
> different colors, but still nearly unreadable. WCAG's own real
> standard expresses contrast as a single real ratio, from 1:1 (no
> contrast at all) to 21:1 (pure black on pure white, the real
> maximum). Before reading on: what two real facts about a color would
> you need, mathematically, to compute how different it is from another
> one — not just "different RGB numbers," but a real measure of
> perceived brightness difference?

### Introducing the concept

`Color.computeLuminance()`, explained in full in this lesson's own
Header, above, already answers exactly that — one real color's own real
brightness, as a single number. A minimal, throwaway lab confirms its
real output against WCAG's own two, real, defined extremes before this
lesson's own code relies on it:

```dart
print('black luminance = ${Colors.black.computeLuminance()}');
print('white luminance = ${Colors.white.computeLuminance()}');
```

Run for real (`verification/lesson-62/color_api_probe_test.dart`, Lab
3) — because trusting an SDK method's real output without checking it
against a known reference is exactly the kind of confidence this
lesson's own Verification Rule doesn't extend:

```
black luminance = 0.0
white luminance = 1.0
```

Exactly the real values WCAG's own published standard defines for pure
black and pure white — real, direct confirmation this real method does
what its own real, quoted source claims.

### Discard the throwaway example

This lab's own bare `print` calls are deleted here. What carries
forward: `computeLuminance()` is trustworthy, real, already-verified
input to a real contrast calculation this lesson's own new code builds
next.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `project/lib/features/sudoku/presentation/theme/contrast.dart` (new
  file); `project/test/accessibility_test.dart` (extended).
- **Change type** — add.
- **Location** — a new, small, standalone file alongside this app's own
  existing `theme/` token classes (`AppSpacing`, `AppShapes`).
- **Dependencies** — `Color.computeLuminance()`, explained above.

### The New Code

```dart
double contrastRatio(Color a, Color b) {
  final luminanceA = a.computeLuminance();
  final luminanceB = b.computeLuminance();
  final lighter = luminanceA > luminanceB ? luminanceA : luminanceB;
  final darker = luminanceA > luminanceB ? luminanceB : luminanceA;
  return (lighter + 0.05) / (darker + 0.05);
}
```

### The Updated Project

`project/lib/features/sudoku/presentation/theme/contrast.dart`, in
full, numbered:

```dart
1  double contrastRatio(Color a, Color b) {
2    final luminanceA = a.computeLuminance();
3    final luminanceB = b.computeLuminance();
4    final lighter = luminanceA > luminanceB ? luminanceA : luminanceB;
5    final darker = luminanceA > luminanceB ? luminanceB : luminanceA;
6    return (lighter + 0.05) / (darker + 0.05);
7  }
```

A real, complete, self-contained function — this app's first new file
this lesson, and its only genuinely new piece of project logic (every
other Concept Unit either wraps existing widgets or reuses existing
framework mechanisms directly).

### Mechanical walkthrough

- `double contrastRatio(Color a, Color b)` — a real, new, top-level
  function (already an established shape in this project, e.g.
  `_isSafe` at the domain layer, though this one is public and
  presentation-layer) taking two real `Color` parameters and returning
  a real `double`.
- `a.computeLuminance()` / `b.computeLuminance()` — the real method
  explained in full in this lesson's own Header, above, called once
  per real color.
- `luminanceA > luminanceB ? luminanceA : luminanceB` — a real,
  already-established ternary expression picking the real, larger of
  the two luminance values.
- `(lighter + 0.05) / (darker + 0.05)` — the real, published WCAG
  contrast-ratio formula itself: each real luminance is offset by a
  small, real, fixed `0.05` before dividing, specifically so a
  comparison against pure black (luminance `0.0`) never divides by
  literal zero — real-run-confirmed, via this lesson's own permanent
  tests, below, to reproduce WCAG's own real 21:1 maximum for black
  against white.

### CS lens

Reusing a real, already-verified building block
(`computeLuminance`) instead of re-deriving its own internal math is
**not reinventing a wheel that already works, correctly, in a form
already proven** — plain engineering discipline, not a named CS
pattern, but worth naming explicitly since the temptation to
hand-roll the sRGB linearization formula from a blog post was real and
avoidable.

### SE lens

The real alternative here was writing the entire WCAG relative-
luminance formula by hand inside `contrastRatio` itself — real, more
self-contained code, but real, needless duplication of logic Flutter's
own `Color` class already implements and already tests, with a real,
higher chance of a transcription mistake going unnoticed. The real cost
of the chosen approach: `contrastRatio` now has an implicit real
dependency on `dart:ui`'s own specific implementation detail (linearizing
via `r`/`g`/`b`, not, say, `a`) — acceptable here, since this app
already depends on the whole Flutter SDK regardless.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

The real label-and-selection work above helps someone who cannot see
the screen at all; this Concept Unit's own real, computed proof exists
for someone who can see it, but not as clearly as someone with typical
vision — a genuinely different real population, needing a genuinely
different real kind of evidence.

---

## Concept Unit: Touch targets

### The Problem

`NumberPadButtonView`'s own real, original size (a `44`-pixel square)
and the board's own real `cellSize` (clamped as low as `28` pixels on a
narrow layout) were both chosen by feel, not against any real,
published minimum — someone with limited fine motor control could
genuinely, repeatedly mis-tap a target that small.

> **Try it yourself first.** This app's own board is a fixed, 9-cell-
> wide grid that must fit within whatever real width a real phone
> screen actually has. If every real cell had to be at least 48 real
> pixels wide, purely by arithmetic, how many total real pixels wide
> would the whole board need to be? Compare that to a real, common,
> narrow phone width (often as little as 320-360 real logical pixels
> in portrait). What does that arithmetic already tell you about
> whether a *single*, real, fixed minimum can honestly apply to every
> real interactive element in this app the same way?

### Introducing the concept

Two small, real, throwaway labs, kept deliberately separate since they
prove two independent real facts. First, the real minimum itself:

```dart
expect(kMinInteractiveDimension, 48.0);
```

Run for real (Lab 4a) — confirming this lesson's own quoted Header
value is genuinely what this installed SDK defines, not assumed from
memory: `48.0`, exactly.

Second, what happens when real content genuinely cannot fit real,
available space:

```dart
await tester.pumpWidget(
  MaterialApp(
    home: Center(
      child: SizedBox(width: 100, child: Row(children: const [SizedBox(width: 200, height: 20)])),
    ),
  ),
);
```

Run for real (Lab 4b) — because a `RenderFlex` overflow's own exact,
real, catchable shape is worth confirming directly, not assumed:

```
tester.takeException() → a real, non-null FlutterError (genuine overflow)
```

Wrapping the identical, real, too-wide content in `FittedBox(fit:
BoxFit.scaleDown)` instead:

```
tester.takeException() → null — no real error at all
```

Real, direct proof: `FittedBox`, explained in full in this lesson's own
Header, above, prevents the real overflow outright by scaling its
child to fit, rather than letting it exceed real, available space.

### Discard the throwaway example

Both labs' own minimal `SizedBox`/`Row` content are deleted here. What
carries forward: `kMinInteractiveDimension` is this app's own real,
trustworthy target; `FittedBox` is the real, correct tool when honoring
it would otherwise overflow.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/number_pad_view.dart`
  (`NumberPadButtonView`'s own fixed size);
  `project/lib/features/sudoku/presentation/sudoku_app.dart` (a new,
  real, named `kMinTouchTargetForDenseGrid` constant; both real
  layouts' own `cellSize` clamp; both real layouts' own `SudokuBoardView`
  call sites, now wrapped in `FittedBox`).
- **Change type** — replace (the number pad's fixed size; the clamp's
  own bounds); add (the `FittedBox` wrap).
- **Location** — `NumberPadButtonView.build`'s own `Container`;
  `_CompactLayout`/`_WideLayout`'s own `LayoutBuilder` callbacks.
- **Dependencies** — `kMinInteractiveDimension`, explained above.

### The New Code

```dart
const double kMinTouchTargetForDenseGrid = 32.0;
```

### The Updated Project

`sudoku_app.dart`'s own new, real, top-level constant and doc comment,
numbered:

```dart
1  /// A real, honest, smaller floor than [kMinInteractiveDimension]
2  /// (48.0), used only for this board's own 9-wide cell grid: a real
3  /// 9x9 grid of genuinely 48-pixel cells needs at least 432 real
4  /// pixels of width, which a real, narrow phone in portrait cannot
5  /// always provide without this board itself overflowing. Every
6  /// other real, interactive element in this app meets the full real
7  /// [kMinInteractiveDimension] instead; this narrower floor is a
8  /// real, tracked, deliberately accepted accessibility debt specific
9  /// to a dense, fixed-count grid, not a general standard this app
10 /// applies anywhere else.
11 const double kMinTouchTargetForDenseGrid = 32.0;
```

`_CompactLayout`'s own real `LayoutBuilder` callback, the one real
call site this Concept Unit changes in each of the two real layouts,
numbered:

```dart
 1  builder: (context, constraints) {
 2    final cellSize = (constraints.maxWidth / 9).clamp(
 3      kMinTouchTargetForDenseGrid,                          // ← new
 4      kMinInteractiveDimension,                              // ← new
 5    );
 6    return FittedBox(                                        // ← new
 7      fit: BoxFit.scaleDown,                                  // ← new
 8      child: SudokuBoardView(
 9        cellSize: cellSize,
10        cells: boardDto.cells,
11        givenCells: boardDto.givenCells,
12        selectedRow: selectedRow,
13        selectedCol: selectedCol,
14        shakeTrigger: shakeTrigger,
15        onCellTap: onCellTap,
16      ),
17    );                                                        // ← new
18  },
```

Lines 2-5's own real clamp bounds are the only change to the arithmetic
itself — the real board still gets *at least* `32`, up to `48`, per
cell, wherever real space allows. Lines 6-7 and 17 are the new, real
`FittedBox` wrap, explained in the walkthrough below; lines 8-16, this
Concept Unit's real payload (`SudokuBoardView` itself), are entirely
unchanged.

A real, genuine regression this exact change caused, caught by two
already-existing, permanent tests
(`responsive_layout_test.dart`) before being fixed: raising the clamp's
own lower bound from `28.0` made `9 * 32.0` genuinely exceed the real,
available width in two already-real, narrow simulated viewports,
producing a real `RenderFlex` overflow — the identical real shape this
Concept Unit's own Lab 4b already proved, now happening for real,
organically, inside the actual app. The `FittedBox` wrap above is the
real fix, confirmed by re-running the full, real project suite clean
afterward.

### Mechanical walkthrough

- `const double kMinTouchTargetForDenseGrid = 32.0` — a real, new,
  top-level constant (the identical real shape as
  `kMinInteractiveDimension` itself), documented with a real, honest
  doc comment naming exactly why it exists and what it deliberately
  falls short of.
- `.clamp(kMinTouchTargetForDenseGrid, kMinInteractiveDimension)` — a
  real, already-established method (`num.clamp`, used since this
  board's layout was first made responsive), its own two real bounds
  now both named constants instead of bare literals.
- `FittedBox(fit: BoxFit.scaleDown, child: SudokuBoardView(...))` —
  constructs the real widget explained in full in this lesson's own
  Header, above; `fit: BoxFit.scaleDown` is one real, named value from
  Flutter's own real `BoxFit` enum, specifically chosen because this
  app only ever wants a board to shrink to fit, never to enlarge past
  its own real, computed `cellSize`.

### CS lens

**Graceful degradation** — a system continuing to function, in a
visibly reduced but still working form, when it cannot fully satisfy
every real constraint at once, rather than failing outright. Also
recognized in: a web page's own responsive images, serving a smaller
real file when bandwidth is limited rather than failing to load at
all; a video call dropping its own real resolution under poor real
network conditions instead of disconnecting; an elevator's own real
"door held, please step back" behavior instead of refusing to move at
all when overloaded.

### SE lens

The real alternative here was making the board horizontally
scrollable, preserving the full real `48`-pixel-per-cell target
everywhere, at the real cost of most players never seeing the whole
board at once — a real, worse UX for the overwhelming majority to
protect a comparatively rare, real, extreme-narrow-viewport case. The
real, chosen tradeoff instead: raise the real floor everywhere it's
genuinely free (most real phones), accept a smaller, real,
still-improved floor where it isn't, and let `FittedBox` absorb the
remaining, rare, genuine conflict as a last resort — a real, honest,
partial fix, tracked explicitly by `kMinTouchTargetForDenseGrid`'s own
real doc comment rather than presented as fully solved.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

Every real button and cell in this app is now sized, honestly, toward
a real, published standard — fully reaching it where nothing else
conflicts, and failing visibly, gracefully, rather than silently, where
it cannot.

---

## Concept Unit: Keyboard navigation

### The Problem

Every real way to play this app so far — a tap, on a touchscreen or
with a mouse — assumes a pointing device exists at all. Someone using
this app on a real desktop with no touchscreen, or who cannot operate
one precisely, currently has no real way to play it whatsoever.

> **Try it yourself first.** This app's own real `_dispatch` method
> already turns exactly two kinds of `GameIntent` — a cell selection, a
> digit entry — into real state changes, regardless of what triggered
> them. If a real, physical keyboard press needed to reach that exact
> same real method, what real, new code would actually have to exist —
> and what, specifically, would *not* need to change at all?

### Introducing the concept

A minimal, throwaway lab proves the real mechanism connecting a
physical key press to application code, before this lesson's own
project code relies on it:

```dart
Focus(
  autofocus: true,
  onKeyEvent: (node, event) {
    if (event is KeyDownEvent) {
      pressedKeys.add(event.logicalKey);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  },
  child: const SizedBox(width: 10, height: 10),
);
```

Run for real (Lab 5) — because exactly what `flutter_test`'s own
`sendKeyEvent` actually delivers, and in what order, is not something
to assume:

```dart
await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
await tester.sendKeyEvent(LogicalKeyboardKey.digit5);
// pressedKeys == [LogicalKeyboardKey.arrowRight, LogicalKeyboardKey.digit5]
```

Real, direct proof: each real, simulated key press reached `onKeyEvent`
as a real `KeyDownEvent`, in the identical real order sent, each
correctly identified by its own real `LogicalKeyboardKey`.

### Discard the throwaway example

This lab's own `pressedKeys`-recording widget is deleted here. What
carries forward: `Focus(autofocus: true, onKeyEvent: ...)` is the real,
correct, minimal way to receive real, physical key events at all.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_SudokuAppState` gains `_digitForKey`/`_handleKeyEvent`; `build`
  wraps its own real body in `Focus`).
- **Change type** — add (two new methods); wrap (existing body).
- **Location** — two new private methods, placed beside `_dispatch`;
  `body: SafeArea(...)` becomes `body: Focus(..., child: SafeArea(...))`.
- **Dependencies** — `package:flutter/services.dart`, imported for the
  first time in this project by this lesson, for `LogicalKeyboardKey`/
  `KeyEvent`/`KeyDownEvent`.

### The New Code

```dart
KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
  if (event is! KeyDownEvent) {
    return KeyEventResult.ignored;
  }
  final digit = _digitForKey(event.logicalKey);
  if (digit != null) {
    _dispatch(EnterDigitIntent(digit));
    return KeyEventResult.handled;
  }
  // ...arrow-key handling, shown in full below
}
```

### The Updated Project

`_SudokuAppState._handleKeyEvent`, in full, numbered:

```dart
 1  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
 2    if (event is! KeyDownEvent) {
 3      return KeyEventResult.ignored;
 4    }
 5    final digit = _digitForKey(event.logicalKey);
 6    if (digit != null) {
 7      _dispatch(EnterDigitIntent(digit));
 8      return KeyEventResult.handled;
 9    }
10    final row = _selectedRow;
11    final col = _selectedCol;
12    if (row == null || col == null) {
13      return KeyEventResult.ignored;
14    }
15    int newRow = row;
16    int newCol = col;
17    switch (event.logicalKey) {
18      case LogicalKeyboardKey.arrowUp:
19        newRow = (row - 1).clamp(0, 8);
20      case LogicalKeyboardKey.arrowDown:
21        newRow = (row + 1).clamp(0, 8);
22      case LogicalKeyboardKey.arrowLeft:
23        newCol = (col - 1).clamp(0, 8);
24      case LogicalKeyboardKey.arrowRight:
25        newCol = (col + 1).clamp(0, 8);
26      default:
27        return KeyEventResult.ignored;
28    }
29    _dispatch(SelectCellIntent(newRow, newCol));
30    return KeyEventResult.handled;
31  }
```

And `build`'s own real, minimal wrapping change:

```dart
1  body: Focus(                                   // ← new
2    autofocus: true,                              // ← new
3    onKeyEvent: _handleKeyEvent,                   // ← new
4    child: SafeArea(
5      /* this app's entire existing real body, unchanged */
6    ),
7  ),                                               // ← new
```

Every real widget this app already built — the board, the number pad,
every animation from earlier in this project — still exists,
completely unchanged, one real level deeper inside `Focus`'s own
`child`.

### Mechanical walkthrough

- `if (event is! KeyDownEvent) { return KeyEventResult.ignored; }` — a
  real, already-established `is!` type check, filtering out a real key
  *release* (`KeyUpEvent`, a real sibling class this lesson doesn't
  otherwise use) — without this, releasing a key after a real press
  would attempt to handle the identical logical key a second time.
- `_digitForKey(event.logicalKey)` — a real, new, private method (shown
  fully below) mapping a real `LogicalKeyboardKey` to the `int` digit
  it names, or `null`.
- `_dispatch(EnterDigitIntent(digit))` — the real, already-established
  method and real, already-established `GameIntent` subtype — a
  physical key reaches the identical real pipeline a number-pad tap
  already does, with zero new branching anywhere else in this app.
- `final row = _selectedRow; final col = _selectedCol;` — real reads of
  this class's own, already-established fields.
- `switch (event.logicalKey) { case LogicalKeyboardKey.arrowUp: ...
  }` — a real, already-established `switch` statement (Dart 3's own
  pattern-matching form, already used elsewhere in this class) over a
  real `LogicalKeyboardKey` value; each real case reassigns exactly one
  real coordinate.
- `(row - 1).clamp(0, 8)` — a real, already-established method
  (`num.clamp`, reappearing from this lesson's own Concept Unit above)
  keeping the real, new coordinate inside this board's own real,
  valid `0`-`8` range — real, direct proof this actually holds is this
  lesson's own permanent "stays in bounds" test, below.
- `_dispatch(SelectCellIntent(newRow, newCol))` — the real,
  already-established method and intent, identical to what a real cell
  tap already dispatches.
- `Focus(autofocus: true, onKeyEvent: _handleKeyEvent, child:
  SafeArea(...))` — constructs the real widget explained in full in
  this lesson's own Header, above; `autofocus: true` means this app
  starts ready to receive real key events immediately, with no
  separate real click or tap needed first to "focus" it.

### CS lens

Every real input this app now accepts — a tap, a physical key —
converges on the identical real `GameIntent` pipeline before touching
any real game state; this is **input abstraction**, a hard concept:
decoupling *how* an action was requested from *what* it actually does.
Also recognized in: a video game accepting both a gamepad and a
keyboard, both ultimately producing the identical real "move forward"
action; a text editor's own command palette and its own keyboard
shortcuts, both ultimately invoking the identical real command object;
a car's cruise-control stalk and its own dashboard touchscreen, both
ultimately setting the identical real target speed.

### SE lens

The real alternative here was giving keyboard handling its own,
separate real path directly into `GameSessionNotifier`, bypassing
`_dispatch` — real, slightly less code in this one lesson, but a real,
second place any future new intent would need wiring into, immediately
undermining the entire real point of this app's own, already-`GameIntent`
pipeline. The real cost of the chosen approach: `_handleKeyEvent` now
has to reconstruct, in its own terms (arrow direction, digit key),
exactly the same real information a tap's own call sites already
express directly (a specific `row`/`col`, a specific digit) — a small,
real, ongoing translation layer, honestly worth it for keeping exactly
one real place decide what a `GameIntent` actually does.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

A real, physical keyboard now reaches the identical real state changes
a tap always has — the same real board, the same real rules, reached a
second, genuinely independent real way.

---

## Connect the pieces

One real, concrete trace, start to finish, through every Concept Unit
this lesson built: a player who cannot see the screen and has no
pointing device presses the right-arrow key, then the digit key `5`.

1. `Focus`'s own real `onKeyEvent` receives a real `KeyDownEvent` naming
   `LogicalKeyboardKey.arrowRight`; `_handleKeyEvent` finds no matching
   real digit, falls into the real `switch`, and calls
   `_dispatch(SelectCellIntent(4, 5))` — the real selection moves from
   `(4, 4)` to `(4, 5)`.
2. `SudokuCellView` at `(4, 5)` rebuilds with `isSelected: true`. Its
   own real `Semantics` node updates to report `isSelected: true` — a
   real screen reader, focused there, would now hear this cell's own
   real label change to reflect it, the exact real proof this lesson's
   own Concept Unit above already ran.
3. `Focus` receives a second real `KeyDownEvent`, this time
   `LogicalKeyboardKey.digit5`; `_digitForKey` resolves it to `5`;
   `_handleKeyEvent` calls `_dispatch(EnterDigitIntent(5))` — the
   identical real intent a number-pad tap, or a screen-reader user
   double-tapping the real "5" button (its own real `onTap` semantics
   action, from this lesson's own first Concept Unit), would also
   produce.
4. `SudokuBoard.placeDigit` accepts the real move; `SudokuCellView` at
   `(4, 5)` rebuilds with its own new real value, playing this
   project's own already-existing real pop-in animation — its own real
   `Semantics` label updates in the same real rebuild, from "empty" to
   the real, placed digit.
5. Throughout, every real color this cell and its neighbors used —
   the selection highlight, the given-clue text, the "Solved!" banner
   were it to appear — already meets a real, computed WCAG AA contrast
   minimum, confirmed once, for the whole real theme, rather than
   checked cell by cell.
6. Had this same player instead been sighted but using a switch device
   or a stylus with imprecise aim, the identical real key presses would
   still work, and every real tappable target they *could* reach by
   touch now meets, or — for the dense board specifically — honestly,
   visibly approaches, a real, published minimum size, gracefully
   scaled by `FittedBox` rather than failing outright where it cannot.

Four real, independent accessibility concerns — hearing this app,
seeing it clearly, touching it precisely, operating it without a
pointing device at all — each verified with the identical real rigor
this project already applies everywhere else: run it, measure it, and
never assume a claim about legibility, size, or spoken content without
checking.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together in one, real, final pass, per the Verification
Rule's Batching clause.

Two real, throwaway lab files
(`verification/lesson-62/color_api_probe_test.dart`,
`verification/lesson-62/accessibility_labs_test.dart`) ran first,
isolated from the real project entirely — real, first-attempt failures
in two of the five `accessibility_labs_test.dart` labs were found and
fixed in place (a semantics finder resolving to the wrong, internal
framework node; a `FittedBox` assertion checking the wrong real
property, since a paint-time scale never changes a `RenderObject`'s own
reported layout size — full, real narrative in
`verification/lesson-62/run-log.md`).

With every Concept Unit's own real code landed together, raising the
board's own touch-target floor caused a real, genuine `RenderFlex`
overflow in two already-existing, permanent tests, fixed with a real
`FittedBox` wrap; a `const` map keyed by `LogicalKeyboardKey` produced
a real, genuine `const_map_key_not_primitive_equality` compiler error,
fixed by making the map `final` instead of `const`; and this lesson's
own new, permanent semantics tests caught a real, honest, first-attempt
accessibility gap in production code itself — given clues silently
withholding a real tap/select semantics action a sighted player could
already use — fixed by making every real cell equally selectable and
tappable in the semantics tree, matching this app's own actual,
already-real behavior.

Final, clean, real results:

```
flutter analyze .
56 issues found. (ran in 5.9s)
```

Identical count and categories to this lesson's own pre-change
baseline — zero new issues.

```
flutter test
...
00:18 +70: All tests passed!
```

70 real test-file-level checks, up from 58: 12 new, all in a new,
permanent `accessibility_test.dart` — four semantic-label checks, three
contrast checks, two touch-target checks, three keyboard-navigation
checks.
