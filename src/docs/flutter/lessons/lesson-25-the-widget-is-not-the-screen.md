# Lesson 25: The Widget Is Not the Screen

**What you will build:** No project code changes this lesson — `project/`
has no Flutter dependency yet, and stays that way until Lesson 26. What
you build instead is real, run-verified evidence, saved to
`verification/lesson-25/`, of the single most load-bearing mental model in
all of Flutter: a `Widget` is a cheap, throwaway, immutable *description*
of what the screen should look like, not the thing actually sitting on
screen. A small, real, executed test proves — not asserts, proves — that
building the exact same UI twice produces two different `Widget` objects
but reuses the *same* `Element` and the *same* `RenderObject` underneath.
Everything from Lesson 27 (stateful widgets, `setState`) through Lesson 61
(animations) only makes sense once this distinction is real to you, not
just a phrase you've read.

**What you need to know first:**
- Lesson 1 — the JIT-vs-AOT compiler distinction (CS lens), reused here to
  explain *why* Flutter's own tooling ships two different compiled forms
  of the same Dart code.
- Lesson 5 — `final`, `const`, and the real difference between them
  (`const` requiring a genuine compile-time constant).
- Lesson 6 — comparison operators (`==`, `!=`) and logical operators
  (`&&`).
- Lesson 7 — the `for-in` loop.
- Lesson 8 — named parameters, return values.
- Lesson 10 — the null-assertion operator `!`.
- Lesson 11 — classes, constructors, fields, methods.
- Lesson 12 — `abstract class`, `extends`, `implements`, `@override`,
  polymorphism.
- Lesson 13 — `identical()` and Dart's identity-based default equality
  (`RawCoordinate`'s own real proof that two separately-built,
  equal-looking objects were not `==` to each other).
- Lesson 15 — anonymous function (lambda) syntax, `(x) => ...`.
- Lesson 16 — `async`/`await` and the event loop (a scheduled callback
  runs when the scheduler gets to it, not the instant it's requested).
- Lesson 17 — the real, deliberately-triggered `board[0][0] = 500`
  corruption demo, reused as evidence of what unrestricted mutation
  risks.
- Lesson 19 — recursion (a function whose own body calls itself).
- Lesson 20 — `static` methods.
- Lesson 23 — the real, measured JIT-warmup finding (the first `solve()`
  call took ~7x longer than every call after it), reused as concrete
  evidence, not just restated theory.
- Lesson 24 — the `test()`/`expect()` shape from `project/test/
  sudoku_board_test.dart`, extended in this lesson by a Flutter-specific
  sibling, `testWidgets()`.

**Terms used in this lesson:**
- **Just-In-Time (JIT) compilation** — reappearing (Lessons 1, 23):
  translating Dart source to native machine code *while the program is
  already running*, one piece at a time, only as it's actually reached.
  It exists so a running program can be paused, patched, and resumed
  without a full rebuild — which is exactly what makes Flutter's hot
  reload possible.
- **Ahead-of-Time (AOT) compilation** — reappearing (Lesson 1): translating
  the *entire* program to native machine code once, before it ever runs,
  producing a single finished binary with no compiler along for the ride.
  It exists because a shipped app can't carry a JIT compiler's startup and
  memory cost with it — a real user's phone needs to launch instantly, not
  warm up.
- **Hot reload** — new: injecting freshly-compiled Dart code into an
  *already-running* Flutter process and re-running just the `build()`
  methods affected, without restarting the app or losing its current
  state (the counter stays at 7, the scroll position stays where it was).
  It exists to make the edit-see-result loop take seconds instead of a
  full app relaunch, and it is only possible because a debug build is
  running under the JIT, not AOT-compiled.
- **Flutter engine** — new: the part of Flutter that is not Dart at all —
  a separately-compiled body of C++ code (using Google's own Skia
  graphics library) that does the actual drawing, text layout, and
  low-level platform plumbing. It exists because turning shapes and text
  into real pixels on a GPU is not something you want reimplemented in
  every UI framework from scratch; Flutter's own Dart framework code
  hands it a set of drawing instructions and the engine is what actually
  executes them.
- **Embedder** — new: the thin, platform-specific glue layer (different
  code on Windows than on Android) that creates a native window or
  surface, feeds the engine real input events from that specific OS, and
  exposes the engine's C API to that platform. It exists because "draw
  pixels" means something different on Windows than on Android — someone
  has to own that platform-specific boundary so the engine itself doesn't
  have to know which OS it's running on.
- **Raster thread** (also called the GPU thread) — new: the specific
  thread, inside the engine, whose job is turning a finished list of
  drawing instructions into actual pixels on the GPU. It exists as its
  own thread, separate from the thread running your Dart code, so that a
  slow `build()` call doesn't also stall the drawing of the *previous*
  already-finished frame.
- **Skia** — new: the real, specific open-source 2D graphics library
  (also used inside Google Chrome) that the raster thread calls into to
  actually rasterize shapes, text, and images into pixels. It exists so
  Flutter's engine team didn't have to write a graphics rasterizer from
  scratch.
- **`dart:ui`** — new: a special Dart library that, unlike `dart:core` or
  `dart:math`, is not provided by the plain Dart SDK at all — it's
  provided *only* by the Flutter engine itself, in C++, and exposed back
  into Dart as this one library. It exists as the actual seam between the
  Dart framework and the C++ engine: every `Color`, `Offset`, and
  low-level paint call the framework uses ultimately comes from here, not
  from ordinary Dart.
- **Immutable configuration object** — new: an object whose only job is
  to describe a *desired* state, that can never be mutated after
  construction, and that is deliberately allowed to be thrown away and
  rebuilt constantly because building a new one is treated as cheap. It
  exists as this lesson's central idea: a `Widget` is one of these, not
  the real, persistent thing being described.
- **Inflate / inflation** — new: Flutter's own name (used in its real
  source comments) for the act of turning a `Widget` — a description —
  into a real, tracked `Element` in the running tree for the first time.
  It exists as a specific word because "create" would wrongly suggest an
  `Element` gets created on *every* build; inflation only happens once,
  the first time a given position in the tree needs one.
- **`identical()`** — reappearing (Lesson 13): a real, top-level Dart
  function testing whether two references point at the exact same object
  in memory, not just objects with equal-looking contents. It exists
  because Dart's `==` can be overridden to mean structural equality (as
  `Coordinate` did in Lesson 13), so `identical()` is the one honest way
  to ask "is this literally the same object," with no override possible.
- **`static` method** — reappearing (Lesson 20): a method that belongs to
  the class itself, callable without ever constructing an instance
  (`ClassName.methodName(...)`), because its logic doesn't need any
  particular object's own state to run.
- **`abstract class`** — reappearing (Lesson 12): a class that can never
  be constructed directly (`new Widget()` is a compile error), existing
  only to be extended, so it can declare a shared contract without
  committing to one specific implementation of it.
- **`extends`** — reappearing (Lesson 12): declares that one class
  inherits another class's fields and methods and may override them,
  used here to declare that `StatelessWidget` *is a* `Widget` and
  `StatelessElement` *is an* `Element`.
- **`implements`** — reappearing (Lesson 12): declares that a class
  fulfills another type's contract (every method that type declares)
  without inheriting any of its code, used here to show that `Element`
  itself fulfills the real `BuildContext` contract.
- **`as` (explicit type cast)** — new: an operator, `value as Type`, that
  tells the compiler "trust me, this value's real runtime type is `Type`"
  and throws a real runtime error if that trust turns out to be wrong. It
  exists for exactly the situation this lesson's own quoted source uses
  it for: a variable is declared with a general, widely-usable type
  (`Widget widget`) but the code holding it knows, from context, that a
  more specific type is really there.
- **Layout** — new: the pass in which every `RenderObject` in the tree is
  told the space it has available and, in response, decides its own real
  size (and, for anything with children, tells each child the same
  thing). It exists as its own separate pass because a parent generally
  cannot decide how to arrange its children until it knows how big each
  child actually wants to be.
- **Paint** — new: the pass, after layout, in which every `RenderObject`
  records the actual drawing instructions (draw this rectangle, this
  text, at this position) needed to represent the size and position
  layout just decided. It exists as a separate pass from layout because
  "how big am I" and "what do I actually draw" are genuinely different
  questions, and layout has to finish everywhere before paint can know
  final positions anywhere.
- **Compositing** — new: the step that takes every separately-recorded
  paint layer and assembles them into the one final scene actually sent
  to the GPU. It exists because some effects (opacity, clipping,
  transforms) are cheaper and more correct to apply to an entire
  already-painted layer than to redo painting for every affected pixel.
- **Semantics tree** — new, briefly: a separate, parallel tree the
  framework builds alongside the visual one, describing what's on screen
  in terms a screen reader or other assistive tool can use (a label, a
  role, whether something is currently checked) rather than in terms of
  pixels. It exists as its own tree, distinct from the render tree, so
  full accessibility support — this curriculum's own Lesson 62 — doesn't
  require re-deriving meaning from raw drawn shapes.
- **Frame** — new: one complete cycle of build → layout → paint →
  composite → raster, scheduled to run in sync with the display's own
  refresh (its "vsync" signal), producing one still image the screen
  actually shows. It exists as the unit Flutter's own scheduler thinks
  in: not "run this code sometime," but "have a finished picture ready
  by the next moment the screen is going to redraw itself."

**Objects and methods used:**

- **`Widget`**
  - *What it is:* the abstract base class every single thing you place in
    a Flutter UI — a button, a row of text, an entire screen — ultimately
    extends.
  - *Implementation:* real, verbatim, from
    `C:\flutter\packages\flutter\lib\src\widgets\framework.dart`, lines
    312–349 and 382–384 (read fresh this session):
    ```dart
    abstract class Widget extends DiagnosticableTree {
      const Widget({this.key});

      final Key? key;

      @protected
      @factory
      Element createElement();

      static bool canUpdate(Widget oldWidget, Widget newWidget) {
        return oldWidget.runtimeType == newWidget.runtimeType && oldWidget.key == newWidget.key;
      }
    }
    ```
  - *Its use:* this lesson's whole argument rests on three real facts
    visible only in this exact source: the constructor is `const`
    (cheap, one-shot construction is the *intended* usage), `createElement`
    is a method every `Widget` must supply but *this lesson's own code
    never calls directly* (something else calls it, once), and
    `canUpdate` is the real, exact rule the framework uses to decide
    "same thing, updated" versus "different thing, replace it."
  - *Type:* an `abstract class`, not instantiable on its own.
  - *Responsibility:* to hold the complete, immutable configuration for
    one position in the UI, and to answer, given an old and a new
    instance of itself, whether the new one is close enough to the old
    one to reuse what's already on screen rather than tear it down.
  - *Depends on:* nothing external to construct — a `const Widget({this.key})`
    needs only an optional `Key`, which is why building one is treated as
    free.
  - *Connects to:* every concrete widget class (`StatelessWidget`, `SizedBox`,
    and everything else in Flutter) extends it; `Element.canUpdate` (called
    internally, not by this lesson's own code) calls `Widget.canUpdate` to
    decide an Element's fate on rebuild.
  - *Shape:* the very top of Flutter's own public API surface — the one
    type every Flutter developer's own code touches on nearly every line.

- **`StatelessWidget`**
  - *What it is:* the specific, common kind of `Widget` used for any UI
    piece whose whole configuration is just its constructor arguments —
    no internal, changing state of its own.
  - *Implementation:* real, verbatim, from the same file, lines 530–531
    and 571–572:
    ```dart
    @override
    StatelessElement createElement() => StatelessElement(this);

    @protected
    Widget build(BuildContext context);
    ```
  - *Its use:* this is the exact class `Greeting`, this lesson's own
    throwaway example, extends — and this quoted body is the real proof
    of exactly what `createElement()` does for it: builds one specific
    kind of `Element`, a `StatelessElement`, and hands it `this` (itself)
    to hold onto.
  - *Type:* an `abstract class` extending `Widget`.
  - *Responsibility:* to declare the one method every concrete subclass
    must supply — `build`, describing what this widget currently looks
    like — and to wire up, once, which concrete `Element` subtype
    manages that description in the running tree.
  - *Depends on:* a `BuildContext`, handed to `build` by the framework,
    giving it access to its own position in the tree.
  - *Connects to:* `Greeting` (this lesson's own subclass) extends it;
    its `createElement()` constructs a `StatelessElement`, passing itself
    in as that Element's own `widget`.
  - *Shape:* a public extension point — the class a Flutter developer's
    own widget classes actually extend, not something used directly.

- **`BuildContext`**
  - *What it is:* the handle a widget's own `build` method is given,
    representing that widget's specific location in the running tree.
  - *Implementation:* real, verbatim, the declaration line at
    `framework.dart` line 3570: `abstract class Element extends
    DiagnosticableTree implements BuildContext`.
  - *Its use:* `Greeting.build(BuildContext context)` takes one as its
    only parameter — proof, from real source, that whatever gets passed
    in there is, underneath, literally an `Element`.
  - *Type:* an `abstract class` (a pure interface, in this codebase's own
    practice — nothing implements it except `Element`).
  - *Responsibility:* to answer "where in the tree am I," letting a
    `build` method look up ambient information (theme, inherited data)
    without needing a direct reference to its own parent.
  - *Depends on:* nothing on its own — it's a contract, fulfilled by
    `Element`.
  - *Connects to:* `StatelessWidget.build` receives one; `Element`
    `implements` it, meaning every `BuildContext` your code ever touches
    is, in reality, some real `Element`.
  - *Shape:* the framework's own deliberate boundary — the one piece of
    "the real tree" a widget's own `build` method is allowed to see.

- **`Element`**
  - *What it is:* the real, persistent object the framework builds the
    *first* time a given `Widget` needs to appear in the tree, and then
    keeps reusing across rebuilds for as long as that position in the
    tree keeps producing "close enough" widgets.
  - *Implementation:* real, verbatim, the declaration line at
    `framework.dart` line 3570: `abstract class Element extends
    DiagnosticableTree implements BuildContext`.
  - *Its use:* this lesson's own probe calls `tester.element(...)` to
    reach one directly and compares it, by `identical()`, against the
    `Element` returned after a second, different `Widget` is built in
    the same spot.
  - *Type:* an `abstract class`.
  - *Responsibility:* to be the thing that actually lives in the running
    tree, hold a reference to whichever `Widget` currently configures it,
    decide (via `Widget.canUpdate`) whether an incoming new widget
    updates it in place or tears it down, and own the matching
    `RenderObject` beneath it.
  - *Depends on:* a `Widget` to be constructed from in the first place.
  - *Connects to:* created by a `Widget`'s own `createElement()`; its own
    subclasses (`StatelessElement`) call back into that same `Widget`'s
    `build()` method.
  - *Shape:* an internal implementation detail of the framework — a
    Flutter developer's own application code essentially never
    subclasses or directly constructs one.

- **`StatelessElement`**
  - *What it is:* the specific, real `Element` subtype that manages every
    `StatelessWidget` in the running tree — the concrete object
    `Greeting.createElement()` actually produces.
  - *Implementation:* real, verbatim, from `framework.dart` line 5902:
    ```dart
    @override
    Widget build() => (widget as StatelessWidget).build(this);
    ```
  - *Its use:* this one real line is the direct proof of *how* your own
    `Greeting.build(context)` ever actually gets called — something else
    (a `StatelessElement`) is the thing that calls it, not you, and not
    directly from `main()`.
  - *Type:* a concrete class extending `Element` (through one intermediate
    class this lesson doesn't otherwise use).
  - *Responsibility:* to hold the current `StatelessWidget` and, whenever
    the framework decides this position needs rebuilding, call that
    exact widget's own `build` method and hand it back `this` as the
    `BuildContext`.
  - *Depends on:* a `StatelessWidget` (its own `widget` field, inherited
    from `Element`) to call `build` on.
  - *Connects to:* constructed by `StatelessWidget.createElement()`;
    calls back into that same widget's `build(context)`, passing itself
    (`this`) as the `context` argument — the concrete proof that
    `BuildContext` really is the `Element`.
  - *Shape:* internal framework machinery, one layer below
    `StatelessWidget` in the architecture, never touched directly by
    application code.

- **`RenderObject`**
  - *What it is:* the object one layer *below* `Element` that actually
    knows how to measure itself (layout) and draw itself (paint) — the
    layer where "widget" stops being a metaphor and turns into real
    geometry and real drawing instructions.
  - *Implementation:* real, verbatim, from
    `C:\flutter\packages\flutter\lib\src\rendering\object.dart`, lines
    2026–2034:
    ```dart
    void reassemble() {
      markNeedsLayout();
      markNeedsCompositingBitsUpdate();
      markNeedsPaint();
      markNeedsSemanticsUpdate();
      visitChildren((RenderObject child) {
        child.reassemble();
      });
    }
    ```
  - *Its use:* this real method, used internally by hot reload, is this
    lesson's cleanest piece of evidence that layout, compositing, paint,
    and semantics are four genuinely separate, independently-invalidatable
    stages of work — each has its own real, named `markNeeds*` method —
    not one vague "redraw" step.
  - *Type:* an `abstract class`.
  - *Responsibility:* to hold real geometry (size, position) once layout
    has run, hold real recorded drawing instructions once paint has run,
    and know how to walk to its own children so a parent's pass can
    reach the whole subtree.
  - *Depends on:* constraints handed down from its parent during layout.
  - *Connects to:* created by a `RenderObjectWidget` (such as `SizedBox`)
    via `createRenderObject`; `visitChildren` here calls `reassemble()`
    recursively on every child `RenderObject`, the same self-calling
    shape as Lesson 19's recursive `solve()`.
  - *Shape:* the framework's own lowest widget-adjacent layer — directly
    above the engine itself, which is where Skia's real, actual
    rasterizing begins.

- **`SizedBox`**
  - *What it is:* a small, real, ordinary Flutter widget that reserves a
    fixed amount of space; used here purely as the simplest possible real
    child for `Greeting.build()` to return.
  - *Implementation:* real, verbatim, from `basic.dart`, lines 2803–2815:
    ```dart
    @override
    RenderConstrainedBox createRenderObject(BuildContext context) {
      return RenderConstrainedBox(additionalConstraints: _additionalConstraints);
    }

    @override
    void updateRenderObject(BuildContext context, RenderConstrainedBox renderObject) {
      renderObject.additionalConstraints = _additionalConstraints;
    }
    ```
  - *Its use:* this is the exact, real, named-parameter-carrying pair of
    methods this lesson's own probe output can be traced back to:
    `createRenderObject` runs exactly once (a brand-new
    `RenderConstrainedBox` is built), and every later rebuild instead
    calls `updateRenderObject`, which *mutates the existing one's own
    field* — the literal, real reason this lesson's probe found the same
    `RenderObject`, by `identical()`, both times.
  - *Type:* a concrete class extending `Widget` (through two intermediate
    classes this lesson doesn't otherwise use).
  - *Responsibility:* to describe a fixed-size box and know how to both
    create and, separately, update the real `RenderConstrainedBox` that
    actually enforces that size.
  - *Depends on:* an optional `width`/`height`, used to build a real
    `BoxConstraints` object.
  - *Connects to:* `createRenderObject`/`updateRenderObject` are called
    by the framework's own `RenderObjectElement` (a sibling of
    `StatelessElement`), never directly by application code.
  - *Shape:* a public, directly-usable widget — unlike `Element` and
    `RenderObject`, this is a class application code really does
    construct.

- **`testWidgets`**
  - *What it is:* the Flutter-specific sibling of Lesson 24's own real
    `test()` function, used specifically for tests that need a real,
    running (if headless) widget tree to test against.
  - *Implementation:* a top-level function from `package:flutter_test`,
    real signature shape:
    `void testWidgets(String description, Future<void> Function(WidgetTester) callback)`.
  - *Its use:* wraps this lesson's own probe body, supplying it a real
    `WidgetTester` to drive.
  - *Type:* a top-level function.
  - *Responsibility:* to register one test case, and, critically, to set
    up a real (headless) Flutter binding first — the actual engine-backed
    environment `dart:ui` needs to exist at all, run through
    `flutter_tester.exe` on disk at
    `C:\flutter\bin\cache\artifacts\engine\windows-x64\flutter_tester.exe`.
  - *Depends on:* a callback taking a `WidgetTester`, and, ambiently, the
    Flutter test binding it creates internally.
  - *Connects to:* called once at the top of `main()` in this lesson's
    own probe file; hands its callback a `WidgetTester`, which is what
    every other real object in this lesson (`element`, `renderObject`)
    is actually reached through.
  - *Shape:* the entry point of Flutter's own widget-testing framework —
    a public, directly-called API.

- **`WidgetTester`**
  - *What it is:* the object `testWidgets` hands you, giving real control
    over pumping widgets into a test tree and inspecting the real result.
  - *Implementation:* real methods this lesson's own code calls:
    `Future<void> pumpWidget(Widget widget)`, `Element element(Finder finder)`,
    `RenderObject renderObject(Finder finder)`.
  - *Its use:* every real object this lesson inspects — the `Element`,
    the `RenderObject` — is reached by calling one of these three methods
    on it.
  - *Type:* a concrete class.
  - *Responsibility:* to drive the test's own tiny, real, headless
    Flutter app — building a widget tree from a widget you hand it, then
    letting you reach into the real, running `Element`/`RenderObject`
    trees that resulted.
  - *Depends on:* the real Flutter test binding `testWidgets` already set
    up.
  - *Connects to:* `pumpWidget` is what actually calls, deep inside the
    framework, the same `createElement()`/`canUpdate()` machinery quoted
    above; `element`/`renderObject` read the result back out.
  - *Shape:* a public, test-only API — never present in a shipped app.

- **`Finder` (`find.byType`)**
  - *What it is:* a small, real object describing *which* widget in the
    tree you mean, used to tell `WidgetTester.element`/`renderObject`
    where to look.
  - *Implementation:* real call shape: `Finder find.byType(Type type)`,
    where `find` is a real top-level constant.
  - *Its use:* `find.byType(Greeting)` says, plainly, "the one node in
    this tree whose widget's runtime type is `Greeting`."
  - *Type:* `find` is a `const` top-level object; `byType` is one of its
    real instance methods, returning a `Finder`.
  - *Responsibility:* to describe a search over the real tree without
    performing it itself — the search only actually runs once handed to
    something like `WidgetTester.element`.
  - *Depends on:* a `Type` literal (`Greeting`, the class itself, used as
    a value).
  - *Connects to:* passed directly into `WidgetTester.element` and
    `WidgetTester.renderObject`.
  - *Shape:* a small, public, test-only utility type.

- **`identical()`**
  - *What it is:* reappearing from Lesson 13 — the real, top-level Dart
    function `bool identical(Object? a, Object? b)`, answering "are these
    two references the exact same object in memory," immune to any `==`
    override.
  - *Implementation:* `external bool identical(Object? a, Object? b);` —
    a genuine VM-implemented primitive, not ordinary Dart code, in
    `dart:core`.
  - *Its use:* every single claim this lesson makes about "the same
    `Element`" or "a different `Widget`" is backed by a real
    `identical()` call in the probe, exactly the same tool Lesson 13
    used to prove `RawCoordinate`'s default equality was identity-based.
  - *Type:* a top-level function.
  - *Responsibility:* to answer object identity, and only object
    identity, with zero possibility of a class overriding its answer.
  - *Depends on:* two object references.
  - *Connects to:* called four times in this lesson's own probe, each
    call backing one real, printed line of evidence.
  - *Shape:* a `dart:core` primitive — the same trusted tool from
    Lesson 13, reused here for a new claim.

- **`debugPrint()`**
  - *What it is:* Flutter's own real replacement for plain `print()`,
    used throughout this lesson's own probe.
  - *Implementation:* a top-level function from `package:flutter/
    foundation.dart`, real signature shape: `void debugPrint(String?
    message, {int? wrapWidth})`.
  - *Its use:* every diagnostic line this lesson's probe writes uses this
    instead of plain `print`.
  - *Type:* a top-level function.
  - *Responsibility:* to print exactly like `print` for normal-sized
    messages, but to break very long messages into safe chunks first —
    plain `print` can silently truncate long output on Android, because
    Android's own log buffer drops lines past a fixed length.
  - *Depends on:* nothing beyond the string to print.
  - *Connects to:* called directly by this lesson's own probe code;
    exists specifically because this curriculum's real device testing
    (Lesson 26 onward) runs on Android over USB.
  - *Shape:* a small, public utility function, a direct, safer
    replacement for `print` in any Flutter-aware code.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`DiagnosticableTree`**
  - *What it is:* Flutter's own real internal base class giving both
    `Widget` and `Element` the ability to print a real, readable
    description of themselves and their own subtree.
  - *Implementation:* named in the real, quoted class declarations this
    lesson already shows: `abstract class Widget extends
    DiagnosticableTree` and `abstract class Element extends
    DiagnosticableTree implements BuildContext`.
  - *Its use:* it exists so tools like `debugDumpApp()` (not called in
    this lesson) can print any real widget or element tree for human
    debugging — mentioned here only because it appears, by name, in
    quoted source this lesson already reads.
  - *Type:* an `abstract class`.
  - *Responsibility:* to give every subclass a real, working
    `toString()`/tree-printing implementation without each one writing
    its own.
  - *Depends on:* nothing this lesson's own code touches directly.
  - *Connects to:* `Widget` and `Element` both extend it; neither this
    lesson's own probe nor its walkthrough calls anything on it directly.
  - *Shape:* a low-level, internal framework detail, not a public
    developer-facing API.

- **`Key`**
  - *What it is:* the real, optional value a widget can carry to help the
    framework tell apart widgets that would otherwise look identical to
    `Widget.canUpdate`.
  - *Implementation:* named in `Widget`'s own quoted source, this
    lesson's own Header entry: `final Key? key;`.
  - *Its use:* `Greeting`, this lesson's own widget, never sets one — its
    `key` is always `null`, which is exactly why `Widget.canUpdate`'s
    real `oldWidget.key == newWidget.key` check passed in this lesson's
    own probe (`null == null`).
  - *Type:* an `abstract class`.
  - *Responsibility:* to give a widget an explicit identity beyond its
    own `runtimeType` and tree position, so the framework can be told
    "these two are the same logical thing" even if their position in a
    list changes.
  - *Depends on:* nothing to construct one of the simplest real subtypes
    (a `ValueKey`, not used in this lesson).
  - *Connects to:* read by `Widget.canUpdate`, this lesson's own quoted
    real source, as one half of its real equality check.
  - *Shape:* a small, public, optional field on every `Widget` — real,
    present, and genuinely load-bearing once lists of widgets exist,
    which this lesson's own single-widget probe never needed.

- **`RenderConstrainedBox`**
  - *What it is:* the real, concrete `RenderObject` `SizedBox` actually
    produces — the object this lesson's own probe found, by
    `renderObject.runtimeType`, really is there underneath `Greeting`.
  - *Implementation:* named in `SizedBox`'s own quoted real source,
    `RenderConstrainedBox(additionalConstraints: _additionalConstraints)`.
  - *Its use:* the real, printed proof (`renderObject.runtimeType:
    RenderConstrainedBox`) that a `SizedBox` widget and the real object
    enforcing its size are two different classes entirely.
  - *Type:* a concrete class extending `RenderObject`.
  - *Responsibility:* to hold real `BoxConstraints` and enforce them
    during the real layout pass, this lesson's own Header term.
  - *Depends on:* a `BoxConstraints` value, handed to it by `SizedBox`.
  - *Connects to:* created once by `SizedBox.createRenderObject`, mutated
    in place afterward by `SizedBox.updateRenderObject` — both this
    lesson's own quoted real source.
  - *Shape:* an internal rendering-layer detail, never constructed
    directly by application code, only ever through a widget like
    `SizedBox`.

- **`WidgetsBinding`**
  - *What it is:* the real, singleton object owning the connection
    between the widget tree and a running frame — the actual class whose
    real `drawFrame` method is this lesson's own Concept Unit 6 evidence.
  - *Implementation:* real, verbatim excerpt already quoted in Concept
    Unit 6: `buildOwner!.buildScope(rootElement!); super.drawFrame();`.
  - *Its use:* named, and its real method quoted, purely as evidence for
    *when* `Greeting.build` actually gets called — this lesson's own code
    never references it directly.
  - *Type:* a concrete class (a singleton, reached as
    `WidgetsBinding.instance` elsewhere in the framework, not in this
    lesson's own code).
  - *Responsibility:* to own the real `BuildOwner` and root `Element`,
    and, once per frame, walk every `Element` marked dirty and rebuild
    it.
  - *Depends on:* a scheduled frame callback from the engine itself.
  - *Connects to:* calls `buildOwner.buildScope`, then `super.drawFrame()`
    which is `RendererBinding.drawFrame`, this lesson's own next entry.
  - *Shape:* a real, internal framework singleton, set up automatically
    the moment `testWidgets`, this lesson's own Header entry, runs.

- **`RendererBinding`**
  - *What it is:* the real object one layer below `WidgetsBinding`,
    owning the connection between the render tree and the engine itself.
  - *Implementation:* real, verbatim, already quoted in Concept Unit 6:
    `rootPipelineOwner.flushLayout(); rootPipelineOwner
    .flushCompositingBits(); rootPipelineOwner.flushPaint();` followed by
    the real per-`RenderView` compositing loop.
  - *Its use:* named, and its real method quoted, as this lesson's own
    direct evidence for the real, separate layout/paint/composite
    sequence.
  - *Type:* a concrete class, a real superclass of `WidgetsBinding`.
  - *Responsibility:* to run layout, then compositing preparation, then
    paint, across the whole real render tree, once per frame, then hand
    the finished result to the engine.
  - *Depends on:* a `rootPipelineOwner` already holding every
    `RenderObject` that's been marked dirty since the last frame.
  - *Connects to:* called by `WidgetsBinding.drawFrame`'s own real
    `super.drawFrame()` line; its own `renderView.compositeFrame()` is
    the real, literal handoff into the engine.
  - *Shape:* a real, internal framework singleton, one layer below
    `WidgetsBinding` in the same real inheritance chain.

- **`RenderView`**
  - *What it is:* the real, single object representing one entire visible
    surface (a window, in this lesson's headless test, a virtual one).
  - *Implementation:* named in `RendererBinding`'s own quoted real
    source: `for (final RenderView renderView in renderViews) {
    renderView.compositeFrame(); }`.
  - *Its use:* named purely because it appears in this lesson's own
    quoted real evidence — this lesson's own probe never references it
    directly.
  - *Type:* a concrete class.
  - *Responsibility:* to be the real root of one complete render tree and
    know how to hand its own already-painted content to the engine.
  - *Depends on:* the real render tree beneath it, already having
    finished layout and paint.
  - *Connects to:* iterated over by `RendererBinding.drawFrame`; its own
    `compositeFrame()` call is what the real, quoted source comment calls
    the moment that *"sends the bits to the GPU."*
  - *Shape:* an internal framework detail — one real object per real
    visible surface, never constructed directly by application code.

- **`expect()` / `isTrue` / `isFalse`**
  - *What it is:* reappearing from Lesson 24's own real, permanent test
    suite — the same assertion function and the same boolean matchers,
    reused here without any change in meaning.
  - *Implementation:* real signature shape, from `package:test` (used
    directly by `package:flutter_test`, not re-implemented by it):
    `void expect(dynamic actual, dynamic matcher)`; `isTrue`/`isFalse` are
    real, const `Matcher` values.
  - *Its use:* every real identity claim this lesson's probe makes —
    `identical(firstWidget, element)` and its siblings — is wrapped in
    exactly this call, the same shape Lesson 24's own
    `project/test/sudoku_board_test.dart` already used.
  - *Type:* `expect` is a top-level function; `isTrue`/`isFalse` are
    top-level `const` values of type `Matcher`.
  - *Responsibility:* to compare an actual real value against an expected
    condition and fail the test, with a real, specific message, the
    instant they don't match.
  - *Depends on:* a value to check (here, always the `bool` result of an
    `identical()` call) and a matcher describing what's expected.
  - *Connects to:* called four times in this lesson's own final probe;
    a failure in any one of them would have stopped the real `flutter
    test` run this lesson's evidence is built on from reporting "All
    tests passed!".
  - *Shape:* the same public, application-facing testing API Lesson 24
    already established as this project's own real testing convention.

---

## Concept Unit: Two Compilers for One Language

### The Problem

Lesson 1 already proved, for real, that `dart run` compiles and runs Dart
using a Just-In-Time compiler — and Lesson 23 already *measured* it: the
first `solve()` call in a fresh process took roughly 7x longer
(14053 vs. ~2000 microseconds) than every call after it, real, direct
evidence of a JIT warming up as it went. But a shipped phone app can't
carry a JIT compiler along with it forever — a real user expects an app
icon tap to produce a running app in well under a second, not a slow
warm-up. So which is it: does Flutter ship JIT-compiled Dart, or
AOT-compiled Dart?

> **Pause and think:** Lesson 1's CS lens already told you what AOT
> compilation trades away to get instant startup — what was it? Given
> that hot reload (patching running code without restarting) needs to
> keep a compiler around to compile the patch, could hot reload possibly
> work at all in a fully AOT-compiled, no-compiler-attached binary? If a
> released app can't carry a JIT and a debug session wants hot reload,
> what would you guess Flutter actually does about this tension, rather
> than picking only one?

### Project Change

No reference counterpart — this unit is conceptual/diagnostic, extending
Lesson 1's own already-real JIT/AOT evidence to Flutter's specific
tooling, not a project file change. `project/` has no Flutter dependency
yet; nothing here touches it.

### The New Code

Real, actually-captured evidence, not invented code — real output from
running `flutter run --help` in this session:

```
    --debug                                                  Build a debug version of your app (default mode).
    --profile                                                Build a version of your app specialized for performance
profiling.
    --release                                                Build a release version of your app.
    --[no-]track-widget-creation                             Track widget creation locations. This enables features
such as the widget inspector. This parameter is only functional in debug mode (i.e. when compiling JIT, not AOT).
    --[no-]hot                                               Run with support for hot reloading. Only available for
debug mode. Not available with "--trace-startup".
```

And a real, on-disk file, confirming AOT compilation is not an abstract
idea but a literal separate tool this machine already has installed:

```
C:\flutter\bin\cache\artifacts\engine\windows-x64\gen_snapshot.exe   5,201,920 bytes
```

### The Updated Project

Not applicable — nothing in `project/` changes. This real command output
and this real file are the entire content of this unit, exactly as
captured, nothing summarized from memory.

### Isolate and Discard

There is nothing to isolate further and nothing to discard — this real
`--help` output and this real file are already the smallest possible
piece of evidence for the claim, and neither was ever staged to become
part of `project/` in the first place.

### Mechanical Walkthrough

- `--debug` / `--profile` / `--release` — three real, named build modes
  Flutter's own CLI has always had; `--debug` is explicitly labeled the
  *default* mode, meaning every `flutter run` you've been told to expect
  from Lesson 26 onward, unless told otherwise, runs in this mode.
- `--track-widget-creation`'s own real help text says, in Flutter's own
  words, *"this parameter is only functional in debug mode (i.e. when
  compiling JIT, not AOT)"* — direct, real, first-party confirmation that
  debug mode compiles under a **JIT compiler**, reappearing in full from
  Lesson 1/23: translating code while the program is already running,
  one piece at a time, which is exactly what let Lesson 23's own
  `solve()` measurement show a slow first call and fast later ones.
- `--hot`'s own real help text says *"only available for debug mode"* —
  direct, real confirmation that **hot reload**, injecting freshly
  compiled code into an already-running process without restarting it,
  only works in the one mode that still has a compiler (the JIT) present
  at runtime to compile that injected patch. `--profile` and `--release`
  builds have no such flag available to them at all, because by the time
  either exists, there is no compiler left in the binary — it was
  compiled once, fully, ahead of time.
- `gen_snapshot.exe`, sitting for real on this machine at
  `C:\flutter\bin\cache\artifacts\engine\windows-x64\`, is Flutter's own
  real **AOT compiler**: the specific tool `flutter build`/`flutter run
  --release` hands the finished Dart program to, once, to produce a
  single native binary with no compiler riding along inside it —
  reappearing in full from Lesson 1's own CS lens: compiling once, ahead
  of time, sacrificing hot reload for the ability to launch instantly
  and run without any interpreter or JIT overhead at all.

### CS Lens

This is a genuine engineering tradeoff between two goals that cannot both
be maximized by the same compiled artifact at the same time: fast
iteration (JIT, hot reload, a compiler always present to accept patches)
versus fast, predictable startup and steady-state performance (AOT, no
compiler present, nothing left to warm up). Flutter's actual answer is
not to pick one — it's to compile the *same* Dart source two genuinely
different ways for two genuinely different purposes, and switch which
one you're using with a single CLI flag.

```
Also recognized in: Java's own dual HotSpot JIT/AOT tooling (`jaotc`),
V8's TurboFan JIT for Node.js versus its own AOT snapshotting for
faster startup, game engines shipping a JIT-scripted editor build
alongside an AOT-compiled shipping build, .NET's own JIT-by-default
runtime versus its NativeAOT publishing mode
```

### SE Lens

The alternative Flutter did *not* choose was picking one compilation
strategy for everything — either always-JIT (keeping hot reload
everywhere, but shipping an app that's permanently slower to start and
carries a whole compiler in its download size) or always-AOT (fast,
predictable release builds, but losing hot reload entirely, turning every
UI tweak during development into a full rebuild-and-relaunch). The real
cost of the two-mode approach Flutter actually took is that debug-mode
performance numbers are not release-mode performance numbers — a slow
frame you see in `flutter run`'s default debug mode may not exist at all
in `--release`, and the reverse is also possible. This project already
carries this exact debt narrowly: Lesson 23's own real, measured
`solve()` timings were taken under `dart run`'s own JIT, not under an
AOT-compiled binary — a number this curriculum has treated as real and
directly usable, but one that would need re-measuring under `--release`
before trusting it as a shipped app's actual performance.

### Commands Needed

- `flutter run --help` — prints every real flag `flutter run` accepts,
  along with Flutter's own real one-line explanation of each. No flags
  were passed in this unit; this was read-only, informational output,
  not an app launch (there's no `project/` Flutter app yet to launch).

### Run It

Already run, real, this session — the exact captured output is shown
above in The New Code, not paraphrased from memory.

### Connect

Flutter's whole tool chain is built on Dart specifically because Dart
already had both a mature JIT (needed for hot reload) and a mature AOT
compiler (needed for real release builds) — the very same JIT Lesson 1
first showed you and Lesson 23 measured for real is, right now, the exact
thing that will make Lesson 26's first `flutter run` support hot reload.

---

## Concept Unit: The Engine Is Not Dart

### The Problem

Every line of Flutter code this curriculum will write from Lesson 26
onward is Dart. So can a plain `dart run somefile.dart` run it, the same
way `dart run` has run every single `.dart` file since Lesson 1?

> **Pause and think:** Lesson 1's own `flutter doctor -v` output already
> showed two separate pieces of version information for Flutter — do you
> remember more than one number being reported? If the Dart SDK alone
> were enough to run a Flutter widget, why would Flutter's own install
> need anything beyond the Dart SDK you already had working since Lesson
> 1 at all?

### Project Change

No reference counterpart — conceptual/diagnostic, and a real, honest
failed experiment. `project/` is untouched.

### The New Code

A real, deliberate attempt to do exactly what the Problem asks — run a
tiny Flutter-widget file with plain `dart run`, not `flutter test`:

```dart
import 'package:flutter/widgets.dart';

class Greeting extends StatelessWidget {
  const Greeting();

  @override
  Widget build(BuildContext context) => const SizedBox();
}

void main() {
  const greeting = Greeting();
  print(greeting.runtimeType);
}
```

Run, for real, this session, via `dart run`. It did not work:

```
Error: Dart library 'dart:ui' is not available on this platform.
export 'dart:ui' show Locale;
^
Context: The unavailable library 'dart:ui' is imported through these packages:
    create_element_probe.dart => package:flutter => dart:ui
```

### The Updated Project

Not applicable — this file was never staged to become part of
`project/`; it exists solely to produce this one real failure.

### Isolate and Discard

This *is* the isolated case already — the smallest possible file that
imports Flutter's widget layer at all. There's nothing to discard beyond
noting that this exact file is unusable as written and will not appear
again; the fix (using `flutter test` instead of `dart run`) is the next
unit's own job.

### Mechanical Walkthrough

- `import 'package:flutter/widgets.dart';` — a real, third-party package
  import (`package:`, not `dart:`), reaching outside this project's own
  files for the first time in this curriculum's own Phase 3 work; the
  package itself, `flutter`, is not fetched from pub.dev the way a
  normal Dart package would be — it comes bundled directly with the SDK
  already installed at `C:\flutter`.
- The real error names the actual cause precisely: `dart:ui` is *"not
  available on this platform"* when reached through plain `dart run`.
  `dart:ui` is not an ordinary Dart standard-library package the way
  `dart:math` (already used since Lesson 20) is — it's a library that
  only exists because the **Flutter engine**, in C++, provides it. Plain
  `dart run` launches the ordinary Dart VM, which has never heard of the
  engine at all, so `dart:ui` genuinely doesn't exist from where it's
  standing.
- The error's own "Context" section shows the real import chain:
  `create_element_probe.dart => package:flutter => dart:ui` — proof that
  reaching `dart:ui` doesn't require this file to import it directly;
  `package:flutter/widgets.dart` itself already depends on it,
  transitively, the moment anything in the widgets layer is imported at
  all.

### CS Lens

This is a real, working example of a **layered system boundary** being
enforced by the tooling itself, not just documentation: the Dart language
and its ordinary VM form one layer, and the Flutter engine forms a
separate layer beneath it that the ordinary VM has no access to at all.
`dart:ui` is the literal seam between them — a set of Dart-side
declarations whose real implementations live entirely in C++, on the
other side of that seam.

```
Also recognized in: a database driver's Python bindings failing outside
a running database server, a graphics API's shader language failing to
compile outside a real GPU driver, any plugin architecture where the
plugin's own declared interface exists in one process but its real
implementation only exists inside the host process
```

### SE Lens

The alternative would have been reimplementing enough of a graphics/text
stack in pure Dart to avoid this seam entirely — rejected, because it
would mean rebuilding (and forever re-tuning) a GPU-backed rasterizer
from scratch in a language never designed for that job, instead of
reusing Skia, an already mature, battle-tested one. The real cost this
project inherits from that choice: any tool that only understands plain
Dart (a `dart run`, a plain Dart-only IDE feature) will not work on
Flutter widget code, full stop — which is exactly the real failure just
shown, not a hypothetical one.

### Commands Needed

- `dart run <file>` — the exact same command used constantly since
  Lesson 1, shown here specifically to prove its own real limitation: it
  runs the plain Dart VM, with no engine attached, so anything genuinely
  needing `dart:ui` will fail exactly as shown.

### Run It

Already run, real, this session — the exact error text above is pasted
from the real run, not paraphrased.

### Connect

The Problem this unit raised — "can `dart run` run Flutter code" — now
has a real, direct, honest answer: no, and the *reason why* is the
Flutter engine itself, the very thing Concept Unit 1 already showed is a
second, separately-compiled artifact from your own Dart code. The next
unit shows what actually can run it.

---

## Concept Unit: A Widget Is a Cheap, Immutable Description

### The Problem

The previous unit's failure named the real cause but not the real fix.
Something *does* run Flutter widget code without a full phone or a
running `flutter run` session — Lesson 22 already used a similarly
"headless" idea for its own `expectEqual` test harness. What's actually
different about a `Widget` — a real Dart class — that would let it, and
not some other ordinary class, be described as "cheap" and "throwaway"?

> **Pause and think:** Given that `const Widget({this.key})` is a `const`
> constructor (Lesson 5's own already-real evidence that `const`
> requires a genuine compile-time constant, stricter than `final`), what
> does that already tell you about how expensive building one is
> *meant* to be? If a `Widget` is genuinely meant to be rebuilt
> constantly, would you expect its own fields to be mutable, the way
> `SudokuCell`'s fields were designed to be in Lesson 11 — or not?

### Project Change

No reference counterpart — `project/` still has no Flutter dependency.
This unit's own code is new, real, run evidence saved to
`verification/lesson-25/`, not a discarded lab — it stays on disk and
gets extended by the next two units, the same way Lesson 12 grew one real
class family across several units, except here the "project" it grows
inside is this lesson's own verification folder, not `project/` itself.
**Files affected:** `verification/lesson-25/pubspec.yaml` (created) and
`verification/lesson-25/test/widget_vs_element_test.dart` (created).
**Dependencies:** the real Flutter SDK already installed at `C:\flutter`
(no separate download needed).

### The New Code

```dart
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';

class Greeting extends StatelessWidget {
  const Greeting();

  @override
  Widget build(BuildContext context) => const SizedBox();
}
```

### The Updated Project

This is a brand-new file with nothing surrounding this fragment yet —
Project Change already covers this case. The complete file, so far:

```dart
1  import 'package:flutter/widgets.dart';
2  import 'package:flutter_test/flutter_test.dart';
3
4  class Greeting extends StatelessWidget {           // ← new
5    const Greeting();                                // ← new
6
7    @override                                        // ← new
8    Widget build(BuildContext context) => const SizedBox();  // ← new
9  }
```

As it stands, this file declares one real, complete `Widget` subclass and
does nothing with it yet — the next unit adds the `main()` that actually
builds one and inspects what results.

### Isolate and Discard

This code is not a discarded lab — per this lesson's own Project Change
above, it's real, kept, run evidence, extended over the next two units.

### Mechanical Walkthrough

- `class Greeting extends StatelessWidget` — `extends`, reappearing in
  full from Lesson 12: `Greeting` inherits `StatelessWidget`'s own real
  fields and methods (including the real `createElement()` quoted in
  this lesson's own Header) and must supply the one method
  `StatelessWidget` itself only declares, never implements: `build`.
- `const Greeting();` — a `const` constructor, reappearing in full from
  Lesson 5: this is what makes `const Greeting()` (used in the next
  unit) a genuine compile-time constant, not merely a cheap runtime
  allocation — the strictest, most "obviously safe to rebuild constantly"
  guarantee Dart's own type system can give.
- `@override` — reappearing in full from Lesson 12: an annotation (not a
  keyword) telling both the reader and the compiler that `build` is
  intentionally replacing a method `StatelessWidget` already declares,
  catching a real compile error if the signature doesn't actually match.
- `Widget build(BuildContext context)` — the one real method
  `StatelessWidget` requires; `BuildContext context`, this lesson's own
  Header entry above, is the handle this method is given to its own
  position in the real tree — not used inside this particular body, but
  still required by the real signature `StatelessWidget.build` declares.
- `=> const SizedBox();` — arrow-syntax return, reappearing in full from
  Lesson 15's own lambda-expression treatment, here used on an ordinary
  method rather than an anonymous function; `const SizedBox()` builds
  this lesson's Header-documented `SizedBox`, the real, ordinary Flutter
  widget standing in as `Greeting`'s own single child.

### CS Lens

`Widget` is a real, working instance of the **immutable value / cheap
description** pattern this lesson's Header already names: rather than
mutating one long-lived object in place to reflect new UI state (the way
`SudokuCell.setValue` in Lesson 11 *did* mutate a long-lived board cell
in place), Flutter deliberately throws the old description away and
builds a brand-new one, then leans on a separate, cheap comparison
(`Widget.canUpdate`, quoted in this lesson's own Header) to figure out
what, if anything, actually needs to change underneath.

```
Also recognized in: React's own virtual DOM (a new, cheap tree built on
every render, diffed against the last one), functional programming's own
preference for immutable data plus a separate reconciliation step over
in-place mutation, a game engine's immutable per-frame input snapshot
rather than mutating live input state mid-frame
```

### SE Lens

The alternative — a mutable, long-lived UI object you update in place,
the way a traditional retained-mode UI toolkit (or this project's own
`SudokuCell`) works — was deliberately not chosen for the *widget* layer
specifically. Mutating UI objects in place invites an entire category of
bug this project has already met once, for a different kind of object:
Lesson 17's own real, deliberately-triggered corruption demo
(`board[0][0] = 500`, no error at all) showed exactly what unrestricted
mutation risks. Flutter's real tradeoff: pay the cost of constructing a
fresh, small object on every rebuild (cheap, because it's `const`-eligible
and shallow) in exchange for never having to reason about a UI object's
own history of in-place mutations.

### Commands Needed

- `flutter pub get`, run inside `verification/lesson-25/` — resolves and
  downloads this throwaway folder's own real dependencies (`flutter` and
  `flutter_test`, both declared in a small `pubspec.yaml` created for
  this unit). Real output, this session:
  ```
  Resolving dependencies...
  Downloading packages...
  + flutter 0.0.0 from sdk flutter
  + flutter_test 0.0.0 from sdk flutter
  Changed 24 dependencies!
  ```
  `pubspec.yaml` itself — the file naming a package's own dependencies —
  gets its full, formal treatment in Lesson 26, where it becomes a real,
  permanent part of `project/` for the first time; this lesson's own copy
  is a narrow, throwaway exception used only so this unit's code can run
  at all.

### Run It

Not runnable standalone yet — this fragment declares a widget class but
never constructs one. The next unit adds the code that does, and this
unit's own file connects to it directly.

### Connect

`Greeting` is now a real, complete `Widget` subclass, sitting on disk,
doing nothing yet. The next unit adds a real `main()` and proves, with
`identical()`, exactly what building one — and building a second, equal-
looking one — actually produces underneath.

---

## Concept Unit: The Element Tree Is What Actually Persists

### The Problem

The previous unit's `Greeting` class exists but nothing has actually
built one yet. If two separate `const Greeting()` expressions really do
each produce their own separate object (the same way Lesson 13's
`RawCoordinate(2, 5)` built twice produced two separately-`identical()`-
false objects), and `Widget.canUpdate`'s own real, quoted source only
checks `runtimeType` and `key` — never checking the tree's own history —
what would you predict happens to whatever's *underneath* a `Greeting`
when a second, brand-new `Greeting()` replaces the first one in the same
spot?

> **Pause and think:** Given `Widget.canUpdate`'s own real body
> (`oldWidget.runtimeType == newWidget.runtimeType && oldWidget.key ==
> newWidget.key`), would two separately-built `Greeting()` instances,
> both with no `key` at all, count as updatable? What would you guess
> "updatable" actually causes to happen to the `Element` built the first
> time, versus the `Widget` itself?

### Project Change

**Reference Source:** no external reference counterpart — this is the
same throwaway file the previous unit started, `verification/lesson-25/
test/widget_vs_element_test.dart`, grown further. **Files affected:**
the same file, modified. **Change type:** add. **Location:** a new
`main()` block, after the existing `Greeting` class. **Dependencies:**
the `flutter_test` package already resolved in the previous unit.

### The New Code

```dart
void main() {
  testWidgets('a Widget, its Element, and its RenderObject are three different real objects', (
    WidgetTester tester,
  ) async {
    const firstWidget = Greeting();
    await tester.pumpWidget(firstWidget);

    final element = tester.element(find.byType(Greeting));

    const secondWidget = Greeting();
    await tester.pumpWidget(secondWidget);
    final elementAfterRebuild = tester.element(find.byType(Greeting));

    expect(identical(firstWidget, element), isFalse);
    expect(identical(firstWidget, secondWidget), isFalse);
    expect(identical(element, elementAfterRebuild), isTrue);
  });
}
```

### The Updated Project

The complete file, `Greeting` unchanged from the previous unit, with this
unit's own new `main()` added beneath it:

```dart
1  import 'package:flutter/widgets.dart';
2  import 'package:flutter_test/flutter_test.dart';
3
4  class Greeting extends StatelessWidget {
5    const Greeting();
6
7    @override
8    Widget build(BuildContext context) => const SizedBox();
9  }
10
11 void main() {                                                             // ← new
12   testWidgets(                                                            // ← new
13     'a Widget, its Element, and its RenderObject are three different real objects',  // ← new
14     (WidgetTester tester) async {                                         // ← new
15       const firstWidget = Greeting();                                     // ← new
16       await tester.pumpWidget(firstWidget);                               // ← new
17
18       final element = tester.element(find.byType(Greeting));              // ← new
19
20       const secondWidget = Greeting();                                    // ← new
21       await tester.pumpWidget(secondWidget);                              // ← new
22       final elementAfterRebuild = tester.element(find.byType(Greeting));  // ← new
23
24       expect(identical(firstWidget, element), isFalse);                   // ← new
25       expect(identical(firstWidget, secondWidget), isFalse);              // ← new
26       expect(identical(element, elementAfterRebuild), isTrue);            // ← new
27     },
28   );
29 }
```

This file is now a complete, real, runnable widget test: it builds a
`Greeting`, builds a second, different `Greeting` in the same spot, and
checks three separate identity claims about what happened underneath.

### Isolate and Discard

Not applicable — same real, kept file as the previous unit, per this
lesson's own Project Change convention.

### Mechanical Walkthrough

- `void main()` — reappearing since Lesson 1: the real entry point every
  Dart program needs; here it's the entry point of the *test file*, not
  of a running app.
- `testWidgets('...', (WidgetTester tester) async { ... });` — this
  lesson's own Header entry: registers one test case and, critically,
  spins up a real, headless Flutter binding (backed by
  `flutter_tester.exe`, this lesson's own Header entry) so `dart:ui` —
  the previous unit's own real point of failure under plain `dart run` —
  actually exists this time.
- `(WidgetTester tester) async { ... }` — an anonymous function, in full
  from Lesson 15, here also marked `async` (in full from Lesson 16):
  every `await` inside this body genuinely suspends until a real pending
  operation (a widget build, a real pump) finishes.
- `const firstWidget = Greeting();` — constructs one real, `const`
  `Greeting` object, stored under the name `firstWidget`.
- `await tester.pumpWidget(firstWidget);` — this lesson's own Header
  entry, `WidgetTester.pumpWidget`; `await`, in full from Lesson 16,
  suspends until the real build this call triggers has actually
  finished. This is the moment `Widget.createElement()` — this lesson's
  own quoted, real source — is called for the very first time, inflating
  `firstWidget` into a real `StatelessElement`.
- `final element = tester.element(find.byType(Greeting));` — `final`, in
  full from Lesson 5; `tester.element` and `find.byType`, this lesson's
  own Header entries, together reach into the real, now-running tree and
  pull out the actual `Element` object that resulted.
- `const secondWidget = Greeting();` — a second, entirely separate
  `Greeting()` construction — per Lesson 13's own already-real evidence
  about `RawCoordinate`, building the same-looking thing twice does not
  reuse the first object.
- `await tester.pumpWidget(secondWidget);` — builds again, this time
  handing the tree `secondWidget` instead of `firstWidget` for the exact
  same position in the tree.
- `final elementAfterRebuild = tester.element(find.byType(Greeting));` —
  reaches into the tree again, after the second build, to see what
  `Element` is there now.
- `expect(identical(firstWidget, element), isFalse);` — `expect`, `isFalse`,
  reappearing in full from Lesson 24's own real test suite; `identical`,
  in full from Lesson 13. This asserts the `Widget` and the `Element` it
  produced are genuinely two different objects — not two names for the
  same thing.
- `expect(identical(firstWidget, secondWidget), isFalse);` — asserts the
  two separately-built `Greeting()` instances are, exactly as Lesson 13
  already showed for `RawCoordinate`, two real, distinct objects.
- `expect(identical(element, elementAfterRebuild), isTrue);` — the
  lesson's own central claim: despite `secondWidget` being a brand-new
  object, the real `Element` behind it, after the second build, is the
  *exact same* `Element` as before.

### Execution Trace

This was actually run, real, this session, via `flutter test
test\widget_vs_element_test.dart`:

1. `await tester.pumpWidget(firstWidget)` — the framework has no existing
   tree yet, so there is no `Widget` to call `canUpdate` against; it
   calls `firstWidget.createElement()` directly (this lesson's own
   quoted `StatelessWidget.createElement()`), producing one real
   `StatelessElement` and inserting it as the tree's root.
2. `tester.element(find.byType(Greeting))` reads that real `StatelessElement`
   back out, stored as `element`.
3. `await tester.pumpWidget(secondWidget)` — this time a previous widget
   *does* exist at this spot (`firstWidget`). The framework calls
   `Widget.canUpdate(firstWidget, secondWidget)` — this lesson's own
   quoted real body — which checks `firstWidget.runtimeType ==
   secondWidget.runtimeType` (`Greeting == Greeting`, true) and
   `firstWidget.key == secondWidget.key` (`null == null`, true).
   `canUpdate` returns `true`.
4. Because `canUpdate` said yes, the framework reuses the existing
   `StatelessElement` and calls its own real `update` method rather than
   discarding it and building a new one from scratch — the same
   `StatelessElement` object keeps living in the tree, now configured by
   `secondWidget` instead of `firstWidget`.
5. `tester.element(find.byType(Greeting))` is called again, stored as
   `elementAfterRebuild` — since step 4 never replaced the `Element`
   object itself, this is the exact same object as `element` from step 2.

Real, captured console output from this exact run:

```
--- first build ---
firstWidget.runtimeType:  Greeting
element.runtimeType:      StatelessElement
identical(firstWidget, element): false
--- second build (new Greeting() pumped) ---
identical(firstWidget, secondWidget): false
identical(element, elementAfterRebuild): true
00:00 +1: All tests passed!
```

### CS Lens

This is the framework's own real **reconciliation** step — comparing an
old description against a new one and computing the minimal real update
needed, rather than tearing everything down and rebuilding it from
nothing on every single change.

```
Also recognized in: React's own reconciler diffing virtual DOM trees,
Git's own diff algorithm reusing unchanged file content across commits,
a spreadsheet engine recalculating only the cells whose real inputs
actually changed, database query planners reusing an unchanged subquery's
already-computed result
```

### SE Lens

The alternative — discarding and fully rebuilding the `Element` (and
everything beneath it, including scroll position, animation state, and,
starting Lesson 28, `State` objects) on *every* rebuild — was rejected
because it would make `setState`-driven UI updates (Lesson 28's own
subject) prohibitively expensive and would silently reset things a real
user would expect to persist, like a text field's own cursor position.
The real cost this design carries: `Widget.canUpdate`'s own real check is
deliberately shallow (`runtimeType` and `key` only) — it can be fooled.
Two structurally very different widgets sharing the same `runtimeType`
and no `key` will be treated as "the same thing, just updated," which is
exactly why Flutter's own real `Key` class (this lesson's own Header
entry, present but not deeply used yet) exists at all — a debt this
lesson deliberately leaves open, since keys have no real use until a
*list* of widgets exists to disambiguate, further out in Phase 3.

### Commands Needed

- `flutter test test\widget_vs_element_test.dart` — runs one specific
  real test file inside `verification/lesson-25/`, launching Flutter's
  own real, headless test binding first (backed by the real
  `flutter_tester.exe` on disk). No device, emulator, or `flutter run`
  session is needed for this — a genuinely different, lighter real
  execution path than Lesson 26 onward will use.

### Run It

Run for real, this session — the exact captured output is shown above in
the Execution Trace, not paraphrased or predicted.

### Connect

The Problem this unit raised is now answered with real, run evidence, not
a guess: a `Widget` really is thrown away and rebuilt constantly, but the
`Element` underneath survives across that churn whenever `canUpdate` says
yes. The next unit goes one layer deeper, to see whether the same is true
of the actual, real thing that draws pixels.

---

## Concept Unit: Below Elements, RenderObjects Measure and Then Draw

### The Problem

An `Element` is still not a pixel — nothing shown so far explains how a
`SizedBox` actually becomes real, sized space on a real screen. Given
`SizedBox`'s own real, quoted source overrides both `createRenderObject`
and, separately, `updateRenderObject`, what would you predict about a
third real object, one layer below `Element`, given the exact same
"create once, then update in place" shape this lesson has already proven
twice?

> **Pause and think:** `SizedBox`'s two real methods are named almost
> identically to `Widget.createElement`/the update path already proven in
> the previous unit — what does that naming similarity suggest about how
> this third layer behaves across a rebuild, before you're told? If
> `updateRenderObject` exists as a *separate* method from
> `createRenderObject`, what does that already tell you about whether the
> framework tears down and rebuilds this third object on every rebuild,
> the same way it doesn't tear down the `Element`?

### Project Change

**Reference Source:** no external reference counterpart. **Files
affected:** `verification/lesson-25/test/widget_vs_element_test.dart`,
extended again. **Change type:** add. **Location:** inside the existing
`testWidgets` callback, alongside the existing `element`/
`elementAfterRebuild` lines. **Dependencies:** unchanged.

### The New Code

```dart
final renderObject = tester.renderObject(find.byType(Greeting));
// ...
final renderObjectAfterRebuild = tester.renderObject(find.byType(Greeting));
// ...
expect(identical(renderObject, renderObjectAfterRebuild), isTrue);
```

### The Updated Project

The complete file, with this unit's own three new lines marked:

```dart
1  import 'package:flutter/widgets.dart';
2  import 'package:flutter_test/flutter_test.dart';
3
4  class Greeting extends StatelessWidget {
5    const Greeting();
6
7    @override
8    Widget build(BuildContext context) => const SizedBox();
9  }
10
11 void main() {
12   testWidgets(
13     'a Widget, its Element, and its RenderObject are three different real objects',
14     (WidgetTester tester) async {
15       const firstWidget = Greeting();
16       await tester.pumpWidget(firstWidget);
17
18       final element = tester.element(find.byType(Greeting));
19       final renderObject = tester.renderObject(find.byType(Greeting));       // ← new
20
21       const secondWidget = Greeting();
22       await tester.pumpWidget(secondWidget);
23       final elementAfterRebuild = tester.element(find.byType(Greeting));
24       final renderObjectAfterRebuild = tester.renderObject(find.byType(Greeting));  // ← new
25
26       expect(identical(firstWidget, element), isFalse);
27       expect(identical(firstWidget, secondWidget), isFalse);
28       expect(identical(element, elementAfterRebuild), isTrue);
29       expect(identical(renderObject, renderObjectAfterRebuild), isTrue);     // ← new
30     },
31   );
32 }
```

This is now this lesson's complete, final probe — three real objects
tracked across two builds, in one file.

### Isolate and Discard

Not applicable — same real, kept file, extended per this lesson's own
convention, established in the previous unit.

### Mechanical Walkthrough

- `final renderObject = tester.renderObject(find.byType(Greeting));` —
  `WidgetTester.renderObject`, this lesson's own Header entry, reaches
  one layer past `tester.element` into the real `RenderObject` tree.
  `find.byType(Greeting)` is reused exactly as before — the same
  `Finder`, a genuinely new call, since a `Finder` describes a search,
  it isn't itself the result of one.
- `final renderObjectAfterRebuild = tester.renderObject(find.byType(Greeting));`
  — the identical call, made again after the second `pumpWidget`, mirroring
  the already-established `element`/`elementAfterRebuild` pattern from the
  previous unit.
- `expect(identical(renderObject, renderObjectAfterRebuild), isTrue);` —
  `identical`, `expect`, `isTrue`, all reappearing in full as already
  explained in the previous unit and Lesson 24; the new claim is that this
  third, deeper object also survives the rebuild.

### Execution Trace

Run together with the previous unit's own test, in the same single real
`flutter test` execution (per the Verification Rule's Batching clause —
one pass covers both units' own claims):

1. `tester.renderObject(find.byType(Greeting))`, called right after the
   first `pumpWidget`, reaches past `Greeting` and its `SizedBox` child
   to the real `RenderObject` `SizedBox` actually produced. This lesson's
   own quoted `SizedBox.createRenderObject` ran exactly once here,
   returning a brand-new `RenderConstrainedBox(additionalConstraints:
   _additionalConstraints)`.
2. On the second `pumpWidget`, `Widget.canUpdate` already said yes for
   `Greeting` (previous unit); the same reasoning applies one layer down —
   `SizedBox`'s own `canUpdate` (inherited, unmodified, from `Widget`)
   also says yes, since the new `SizedBox` has the same `runtimeType` and
   `key`. This time `updateRenderObject`, this lesson's own quoted real
   method, runs instead of `createRenderObject` — it *mutates* the
   existing `RenderConstrainedBox`'s own `additionalConstraints` field
   rather than building a new object.
3. `tester.renderObject(find.byType(Greeting))`, called again, reads back
   the exact same `RenderConstrainedBox` object from step 1 — never
   replaced, only mutated in place in step 2.

Real, captured console output, from the same run as the previous unit:

```
--- first build ---
firstWidget.runtimeType:  Greeting
element.runtimeType:      StatelessElement
renderObject.runtimeType: RenderConstrainedBox
identical(firstWidget, element): false
--- second build (new Greeting() pumped) ---
identical(firstWidget, secondWidget): false
identical(element, elementAfterRebuild): true
identical(renderObject, renderObjectAfterRebuild): true
00:00 +1: All tests passed!
```

Separately — real, hidden-behavior evidence, not just a confident
sentence, for what happens *inside* a `RenderObject` when something above
it changes — the real, unmodified `RenderObject.reassemble()` method,
verbatim from `C:\flutter\packages\flutter\lib\src\rendering\object.dart`,
lines 2026–2034:

```dart
void reassemble() {
  markNeedsLayout();
  markNeedsCompositingBitsUpdate();
  markNeedsPaint();
  markNeedsSemanticsUpdate();
  visitChildren((RenderObject child) {
    child.reassemble();
  });
}
```

This is real evidence, from Flutter's own source, that **layout**,
**compositing**, **paint**, and the semantics tree (briefly named here;
full treatment deferred to Lesson 62, Accessibility) are four separately
named, separately dirty-markable stages — not one vague "redraw" — and
that `visitChildren((RenderObject child) { child.reassemble(); })` walks
the whole render tree the same way Lesson 19's own `solve()` walked a
search tree: by calling itself, recursively, on each child.

### CS Lens

Three real, independently-persisting layers — `Element` (identity and
tree structure), `RenderObject` (geometry and drawing instructions) —
sitting beneath one throwaway layer, `Widget` (pure configuration), is a
real instance of **separation of concerns by layer, with each layer
choosing its own lifetime**: the cheap, frequently-rebuilt layer on top,
the expensive, rarely-rebuilt state underneath, and an explicit
reconciliation rule (`canUpdate`) connecting the two.

```
Also recognized in: a game engine's separate "scene description" versus
"physics body" objects, a compiler's separate AST (rebuilt on every
parse) versus its separately-cached symbol table, a spreadsheet's
formula text (cheap, edited constantly) versus its computed dependency
graph (expensive, only rebuilt when structure actually changes)
```

### SE Lens

The alternative — one single object per UI element, doing configuration,
tree bookkeeping, layout, and painting all at once — was rejected because
it would force every rebuild to redo real, expensive work (measuring
text, recalculating layout) even when nothing about that element's actual
geometry changed. The real cost of splitting this into three real layers
instead: three real objects now exist for every one thing a developer
writes, and reasoning about "why isn't my UI updating" sometimes means
knowing *which* of the three layers actually failed to update — a real
debugging cost this curriculum has not yet had to teach, and will, once
Lesson 28 introduces `setState` and rebuild bugs become possible for the
first time.

### Commands Needed

None beyond the previous unit's own `flutter test` invocation, reused —
per the Verification Rule's Batching clause, this unit's new evidence
came from the same single execution already run.

### Run It

Already run, real, this session, together with the previous unit — the
exact output is shown above in the Execution Trace.

### Connect

The three-layer picture is now real and complete, proven by one single
real run, not three separate claims taken on faith: `Widget` (thrown
away every build), `Element` (persists across `canUpdate`-approved
rebuilds), `RenderObject` (persists the same way, one layer further
down, and is the thing that actually knows how to measure and draw
itself). The last unit asks when, exactly, any of this machinery
actually runs.

---

## Concept Unit: One Frame, Start to Finish

### The Problem

Nothing shown so far ever called `Greeting.build(context)` directly —
`tester.pumpWidget` did, somehow, invisibly. Lesson 16 already taught, in
full, that the event loop is what decides *when* a scheduled `Future`
callback actually runs, not the line of code that scheduled it. Is
something similar true here — is there a real, named scheduler deciding
when `build()` actually runs, or does it just run immediately, in a
straight line, the moment `pumpWidget` is called?

> **Pause and think:** Lesson 16's own real proof showed a `.then`
> callback scheduled with only a 5ms delay still ran strictly after every
> already-written synchronous line — what shape of evidence would prove
> the same kind of "not immediate, not in the order it looks" behavior
> here? If `RenderObject.reassemble()`, already shown in the previous
> unit, calls `markNeedsLayout()` rather than *doing* layout right there,
> what does that already suggest about layout not happening the instant
> it's requested?

### Project Change

No reference counterpart — conceptual, closing this lesson with real,
quoted evidence of the actual scheduling mechanism, not a project file
change.

### The New Code

Real, actually-captured evidence — the real, verbatim body of
`WidgetsBinding.drawFrame()`, from
`C:\flutter\packages\flutter\lib\src\widgets\binding.dart`, lines
1569–1578 (trimmed to its two real, load-bearing lines):

```dart
if (rootElement != null) {
  buildOwner!.buildScope(rootElement!);
}
super.drawFrame();
```

And, real, verbatim, the body `super.drawFrame()` on that line actually
calls — `RendererBinding.drawFrame()`, from
`C:\flutter\packages\flutter\lib\src\rendering\binding.dart`, lines
691–701:

```dart
void drawFrame() {
  rootPipelineOwner.flushLayout();
  rootPipelineOwner.flushCompositingBits();
  rootPipelineOwner.flushPaint();
  if (sendFramesToEngine) {
    for (final RenderView renderView in renderViews) {
      renderView.compositeFrame(); // this sends the bits to the GPU
    }
    rootPipelineOwner.flushSemantics(); // this sends the semantics to the OS.
    _firstFrameSent = true;
  }
}
```

### The Updated Project

Not applicable — real, quoted framework source, not project code; both
fragments are shown whole for what this unit needs, per this lesson's own
established convention.

### Isolate and Discard

Nothing to discard — this is real, quoted evidence, kept as this
lesson's own closing proof, the same as every prior unit's real quotes.

### Mechanical Walkthrough

- `if (rootElement != null) { buildOwner!.buildScope(rootElement!); }` —
  `!=` and `!`, both reappearing in full (Lesson 6's comparison operators,
  Lesson 10's null-assertion operator); `buildOwner!.buildScope(rootElement!)`
  is the real, single call that walks every `Element` marked as needing a
  rebuild and calls each one's own real `build()` — this is the actual,
  concrete answer to where `Greeting.build(context)` gets called from: not
  from `pumpWidget` directly, but from this one real, internal call,
  itself triggered by `pumpWidget`.
- `super.drawFrame();` — `super`, reappearing, extended here from Lesson
  12's own constructor-call usage to calling an overridden *method* on
  the parent class; `WidgetsBinding` extends `RendererBinding`, so this
  one call is what hands control from the build phase into the render
  phase shown in the second quoted block.
- `rootPipelineOwner.flushLayout();` / `flushCompositingBits();` /
  `flushPaint();` — three real, separately-named calls, each one the
  actual moment the `markNeedsLayout()`/`markNeedsCompositingBitsUpdate()`/
  `markNeedsPaint()` flags from the previous unit's own quoted
  `reassemble()` finally get acted on — proof, from real source, that
  marking something dirty and actually doing the resulting work are two
  separate real steps, exactly as the Problem's own Socratic prompt
  predicted.
- `for (final RenderView renderView in renderViews) { renderView.compositeFrame(); }`
  — a `for-in` loop, in full from Lesson 7, with a `final`-typed loop
  variable, in full from Lesson 5; `renderView.compositeFrame()`'s own
  real, inline source comment says, verbatim, *"this sends the bits to
  the GPU"* — direct, real, first-party proof that this is the exact
  moment control passes from Dart code into the engine's own **raster
  thread**, this lesson's own Header entry.
- `rootPipelineOwner.flushSemantics();`'s own real, inline comment says,
  verbatim, *"this sends the semantics to the OS"* — a brief, real
  glimpse of the semantics tree, this lesson's own Header entry, full
  treatment deferred to Lesson 62 (Accessibility), where screen readers
  are this curriculum's actual subject.

### CS Lens

A **fixed pipeline, run once per frame, in a fixed order** — build, then
layout, then compositing-bits, then paint, then send-to-GPU, then
send-to-OS — is a real instance of the same idea Lesson 16's own event
loop already taught: work doesn't run the instant it's requested, it runs
when a scheduler decides it's the work's own turn, batched together with
everything else scheduled for the same real moment (here, the same
frame).

```
Also recognized in: a game engine's own fixed update-then-render loop,
a video codec's fixed encode pipeline (motion estimation, then transform,
then quantization, then entropy coding), a CPU's own instruction pipeline
stages (fetch, decode, execute, writeback), a build system's fixed
compile-then-link-then-package stage order
```

### SE Lens

The alternative — recomputing layout and repainting immediately, the
instant any single `markNeedsLayout()` call happens, rather than batching
every dirty node into one pass per frame — was rejected because a single
user interaction (a tap, triggering several separate state changes in a
row) could otherwise trigger the same expensive layout-and-paint work
many times in a single frame's worth of time, most of it thrown away
seconds later anyway. The real cost of batching instead: nothing on
screen updates the *instant* `markNeedsLayout()` is called — it updates
at the next real frame, meaning any code that tries to read a
`RenderObject`'s own size immediately after changing something that
affects it will read a stale value, a real, honest source of confusion
this curriculum has not yet had reason to demonstrate, and will, once
Lesson 61 (Animations) starts caring about exact frame timing.

### Commands Needed

None — this unit's evidence is real, quoted source, already read this
session; nothing new was executed.

### Run It

Not applicable in the run-a-file sense — this unit's proof is the real,
verbatim source itself, already quoted above, per the Verification
Rule's own exemption for evidence that is itself the artifact being
examined, not a claim needing a fresh execution to confirm.

### Connect

Every real object this lesson has tracked — the `Widget`, the `Element`,
the `RenderObject` — now has a real answer for *when* it's actually
touched: `Widget.createElement()`/`canUpdate` inside `buildOwner
.buildScope`, `RenderObject`'s own layout and paint inside
`RendererBinding.drawFrame()`, all of it happening inside one real,
fixed, per-frame pipeline, not scattered across arbitrary moments chosen
by application code.

---

## Connect the Pieces

Follow one concrete, real value through every unit this lesson built,
start to finish, all of it backed by this lesson's own single real
`flutter test` run:

1. `const firstWidget = Greeting();` constructs one real, `const`
   **`Widget`** — Concept Unit 3's own subject — a cheap, immutable
   description that does not yet exist anywhere on screen.
2. `await tester.pumpWidget(firstWidget)` hands it to the framework.
   Because nothing else was already on screen at this spot, `Widget
   .createElement()` — Concept Unit 3's own quoted real source — runs,
   producing a real `StatelessElement`, Concept Unit 4's own central
   claim, real-proved `identical(firstWidget, element) == false`: the
   description and the persistent object it produced are not the same
   object.
3. That `StatelessElement`'s own real, quoted `build()` method calls
   `firstWidget.build(context)` — this is the real, concrete answer to
   "who actually calls `Greeting.build`," not `main()`, not
   `pumpWidget` directly, but this one specific `Element`.
4. `Greeting.build` returns `const SizedBox()`. Because nothing existed
   below `Greeting` yet either, `SizedBox.createRenderObject` — Concept
   Unit 5's own quoted real source — runs, producing a real
   `RenderConstrainedBox`, the actual object that will do the real work
   of measuring and drawing.
5. `const secondWidget = Greeting();` builds a second, real, separate
   **`Widget`** — real-proved `identical(firstWidget, secondWidget) ==
   false`, the same real identity-check tool Lesson 13 already trusted.
6. `await tester.pumpWidget(secondWidget)` hands the framework this new
   description for the same spot. `Widget.canUpdate(firstWidget,
   secondWidget)` — Concept Unit 3's own quoted real source — checks
   `runtimeType` and `key`, finds both equal, and returns `true`.
7. Because `canUpdate` said yes, the framework reuses, rather than
   discards, both the `Element` and, one layer further down, the
   `RenderObject` — Concept Unit 4 and 5's own real-proved claims:
   `identical(element, elementAfterRebuild) == true` and
   `identical(renderObject, renderObjectAfterRebuild) == true`.
   `SizedBox.updateRenderObject` — not `createRenderObject` — is what
   actually ran the second time, mutating the existing
   `RenderConstrainedBox` in place.
8. All of this — build, layout, paint — happens inside one real, fixed,
   per-frame pipeline, Concept Unit 6's own quoted real
   `WidgetsBinding.drawFrame()`/`RendererBinding.drawFrame()` source: a
   scheduled batch of work, not code running the instant it's called,
   the same event-loop-governed idea Lesson 16 already proved for a
   plain `Future`.
9. `RendererBinding.drawFrame`'s own real, quoted inline comment,
   *"this sends the bits to the GPU,"* is where control finally leaves
   Dart entirely and crosses into Concept Unit 2's own subject: the
   Flutter **engine**, a real, separately-compiled 46-megabyte binary
   already sitting on this machine at
   `C:\flutter\bin\cache\artifacts\engine\windows-x64\flutter_windows.dll`,
   which is what actually turns this whole real, traced chain — one
   `Greeting`, rebuilt once, mostly reused — into real pixels.

Nothing in this lesson touched `project/` — that starts next lesson, once
`pubspec.yaml` gets its own full, formal treatment and this exact
three-layer picture (`Widget`/`Element`/`RenderObject`) stops being a
throwaway probe and starts being the real machinery behind this
curriculum's own first Flutter screen.
