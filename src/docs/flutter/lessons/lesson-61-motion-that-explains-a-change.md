# Lesson 61: Motion That Explains a Change

**What you will build.** Four real, working animations landing in this
app's own real board and number-entry screen: a smooth color
transition when the selected cell moves, a real pop-in the instant a
digit is placed, a real fade-and-scale banner the instant a puzzle is
solved, and a real, own-cell shake the instant a move is rejected. The
transferable problem underneath all four: when a piece of on-screen
state changes instantly, from one static frame to the next, a person
watching has to *infer* that something happened and guess what. Motion
is what actually communicates the change itself — not decoration on
top of a UI update, but the mechanism that makes the update legible in
the first place. Flutter gives two genuinely different ways to produce
that motion: describe the *end state* and let the framework compute
every value in between on its own schedule, or take direct, imperative
control of a single number over time and decide for yourself when it
starts. This lesson builds one animation the first way, one that mixes
both, and two the second way — and is honest, throughout, about which
kind of "the state changed, when did it change, and who decided to
react" question each one answers.

**What you need to know first.** `StatefulWidget`, `State<T>`,
`initState`, `dispose`, and `setState` — this lesson turns a widget
that has been `StatelessWidget` since it was first written into a real
`StatefulWidget`, needing that exact same lifecycle discipline for a
new kind of resource. Widget/Element/RenderObject identity and
reconciliation — specifically, that Flutter decides whether to *update*
an existing on-screen widget or *discard it and build a fresh one*
based on matching type and `Key`, which is the exact mechanism the
number-placement pop-in depends on. `SudokuBoardView`/`SudokuCellView`'s
own existing board-rendering code — every change in this lesson is a
real diff against it. The `_dispatch` method's real
`InvalidMoveException`/`InvalidStateTransitionException` handling,
already showing a `SnackBar` on a rejected move — the real trigger
point the error-shake attaches to. `GameStatus` and its own real state
machine, specifically `GameStatus.completed` — the real signal the
completion banner watches for. This app's own real, shared design
tokens (`AppSpacing`) — reused for the completion banner's padding.

**Terms used in this lesson**

- **Implicit animation** — a Flutter animation strategy where a widget
  describes only its *current target value* (a color, a width, a
  number); the framework itself notices the value changed across two
  builds and animates smoothly toward the new one, entirely on its own
  schedule, with no explicit start/stop call anywhere in your own code.
  It exists so the common case — "this property changed, make that
  change smooth" — needs no manual bookkeeping at all.
- **Explicit animation** — the opposite strategy: your own code owns a
  running numeric value (an `AnimationController`) and decides,
  imperatively, exactly when it starts, reverses, or restarts. It
  exists for cases an implicit animation cannot express at all — a
  motion that has to begin at a moment your own code decides (a game
  finishing, a move being rejected), not merely whenever some widget
  property happens to differ between two builds.
- **Interpolation** — computing an in-between value at a given fraction
  of the way from a start value to an end value (10% of the way from 20
  to 100 is 28). Every animation in this lesson, implicit or explicit,
  is ultimately this one idea repeated at high frequency, once per real
  screen frame.
- **Easing curve** — a function mapping *elapsed time fraction* to
  *progress fraction*, both from 0 to 1, used to interpolate at a
  non-constant rate — motion that starts slow and finishes fast, or
  overshoots and settles back, rather than moving at one uniform speed
  the entire time. It exists because a uniform, linear rate of change
  reads as mechanical to a human eye; real, physical motion almost
  never looks like that.

**Objects and methods used**

- **`AnimatedContainer`**
  - *What it is:* a real, built-in Flutter widget that behaves exactly
    like an ordinary `Container` — same `width`, `height`, `decoration`,
    `alignment`, `child` — except that whenever one of those properties
    genuinely differs between one build and the next, it animates the
    visible change smoothly instead of snapping instantly.
  - *Implementation:* its real, declared constructor (only the members
    this lesson actually uses), read fresh this session from
    `C:\flutter\packages\flutter\lib\src\widgets\implicit_animations.dart`:
    ```dart
    const AnimatedContainer({
      super.key,
      this.alignment,
      this.decoration,
      required super.duration,
      this.curve = Curves.linear,
      this.width,
      this.height,
      this.child,
      // ...other Container-shaped fields, unused by this lesson's own code
    });
    ```
    `AnimatedContainer extends ImplicitlyAnimatedWidget` — a real,
    shared base class every implicit animation widget in Flutter
    extends — confirmed from the same real, installed source file.
  - *Its use:* the exact, minimal change this Concept Unit makes —
    every other real property of this app's own cell already existed;
    only the class name and a real `duration:` argument change.
  - *Type:* a `const`-constructible `StatefulWidget` subclass (every
    implicit animation is secretly a real `StatefulWidget` under the
    hood, driving its own private `AnimationController` — you never see
    that controller directly, which is exactly the tradeoff implicit
    animation makes: less control, in exchange for zero manual
    bookkeeping).
  - *Responsibility:* on every real build where its own `decoration`
    (or any other animatable field) differs from the value it held
    last time, compute and run a real animation from the old value to
    the new one over `duration`, repainting once per real frame in
    between; when nothing differs, behave exactly like a plain,
    unanimated `Container`.
  - *Depends on:* a real `TickerProvider` it manages internally (this
    app's own code never has to supply one — that is the entire point
    of an implicit animation over an explicit one), and the real
    `duration`/`curve` this lesson's own code supplies.
  - *Connects to:* replaces this app's own `Container` directly, one
    for one, inside `SudokuCellView`; every existing property this cell
    already set (its `decoration`'s real selected-cell color, its real
    per-side border widths) now animates instead of snapping, with
    zero other code anywhere needing to change.
  - *Shape:* a Presentation-layer widget, entirely local to one file —
    this app's own real Domain/Application layers know nothing about
    any of this lesson's own code; nothing about how a game session
    scores or persists itself changes here.
- **`Curve` / `Curves.linear`**
  - *What it is:* `Curve` is a real, abstract Flutter class describing
    an easing function; `Curves` is a real class holding a large set of
    ready-made, named `Curve` instances as `static const` fields —
    `Curves.linear` is the plainest one, mapping every elapsed-time
    fraction directly onto the identical progress fraction with no
    distortion at all.
  - *Implementation:* `abstract class Curve { double transform(double
    t); }` — a real, single-method contract: given `t` (elapsed
    fraction, 0 to 1), return the real progress fraction to interpolate
    with at that instant. `Curves.linear` is a real, fixed instance
    whose own `transform` simply returns `t` unchanged.
  - *Its use:* `AnimatedContainer`'s own real `curve` parameter defaults
    to `Curves.linear` — this Concept Unit's own code never passes one
    explicitly, so this app's very first animation moves at a constant
    rate, matching the isolated lab's own real, measured proof, below.
  - *Type:* an abstract class with one real instance method
    (`Curve`), paired with a class of real `static const` named
    instances (`Curves`).
  - *Responsibility:* answer, for any elapsed-time fraction between 0
    and 1, exactly what progress fraction an animation should be at —
    nothing more; it holds no state of its own and knows nothing about
    what property is actually being animated.
  - *Depends on:* nothing — a pure, real mathematical function with no
    side effects, which is exactly why the same `Curve` instance is
    reused, unmodified, across every animation in this app that wants
    the same easing feel.
  - *Connects to:* read internally by whatever real, running animation
    owns it (an `AnimatedContainer`, a `TweenAnimationBuilder`, a
    `CurvedAnimation`, all appearing across this lesson's own four
    Concept Units) to convert a raw elapsed-time fraction into the real
    progress fraction actually used to interpolate.
  - *Shape:* a small, shared, framework-level utility type — never
    project-specific, reused unmodified everywhere an easing curve is
    needed.
- **`Key` / `ValueKey<T>`**
  - *What it is:* `Key` is a real, abstract Flutter class every widget
    constructor can optionally accept; `ValueKey<T>` is a real, concrete
    subclass wrapping one plain value (here, an `int?` cell value) that
    two keys compare equal by, using ordinary `==`.
  - *Implementation:* `abstract class Key`; `class ValueKey<T>
    extends LocalKey { const ValueKey(this.value); final T value; @override
    bool operator ==(Object other) => other is ValueKey<T> && other.value
    == value; }` — a real, minimal wrapper whose entire job is comparing
    two keys' own wrapped values.
  - *Its use:* `TweenAnimationBuilder(key: ValueKey(widget.value), ...)`,
    below — giving each real cell's own animated digit a key derived
    from its current value, specifically so a genuinely new value
    produces a genuinely new key.
  - *Type:* an abstract class (`Key`) with one concrete, generic
    subclass used here (`ValueKey<T>`).
  - *Responsibility:* let Flutter's own real reconciliation decide,
    every rebuild, whether an existing on-screen widget and element can
    be *updated in place* to match a new configuration, or must be
    *discarded and rebuilt fresh* — by comparing the old widget's key
    against the new one's, alongside matching `runtimeType`.
  - *Depends on:* nothing on its own; it only matters in the context of
    a parent rebuilding a child at the exact same position in the
    widget tree.
  - *Connects to:* read internally by Flutter's own element-reconciliation
    code (not this app's own), which walks old and new widget trees
    together comparing exactly this.
  - *Shape:* a small, shared, framework-level utility type, identical in
    kind to `Curve`, above — never project-specific.
- **`TweenAnimationBuilder<T>`**
  - *What it is:* a real, built-in Flutter widget implementing the
    identical implicit-animation idea `AnimatedContainer` already
    demonstrated, but generic over *any* interpolatable value, not only
    the fixed set of properties `Container` happens to have, and handing
    the caller a real `builder` callback to construct arbitrary UI from
    the current, in-between value.
  - *Implementation:* its real, declared constructor, read fresh this
    session from
    `C:\flutter\packages\flutter\lib\src\widgets\tween_animation_builder.dart`:
    ```dart
    const TweenAnimationBuilder({
      super.key,
      required this.tween,
      this.curve = Curves.linear,
      required super.duration,
      required this.builder,
      this.child,
    });
    ```
    `TweenAnimationBuilder<T> extends ImplicitlyAnimatedWidget` — the
    identical real base class `AnimatedContainer` extends, confirmed
    from the same real source; its internal `build` is a real,
    one-line method: `return widget.builder(context,
    _currentTween!.evaluate(animation), widget.child);` — the current
    interpolated value, computed by evaluating the real `tween` at the
    animation's current progress, handed straight to the caller's own
    `builder`.
  - *Its use:* animates a real `double` scale factor from 0 to 1 each
    time a player-fillable cell's own value genuinely changes, driving a
    real pop-in.
  - *Type:* a `const`-constructible, generic `StatefulWidget` subclass.
  - *Responsibility:* own a real, internal `AnimationController`
    (invisible to the caller, same as `AnimatedContainer`'s), animate
    its given `tween` from the tween's own `begin` to `end` over
    `duration` whenever this widget is first built, and call `builder`
    again on every real tick with the current interpolated value.
  - *Depends on:* a real `Tween<T>` describing what to interpolate
    between, and a real `builder` callback describing what to draw with
    the current value — both required constructor arguments.
  - *Connects to:* wraps this cell's own real `Text` (the digit) as its
    `child`; its own `builder` wraps that `child` in a real
    `Transform.scale`, below, using the current interpolated value as
    the scale factor.
  - *Shape:* a Presentation-layer widget, same as `AnimatedContainer`.
- **`Tween<T>`**
  - *What it is:* a real, plain Flutter class describing only two
    values — a `begin` and an `end` — plus a real `evaluate` method
    computing the value at any given progress fraction in between.
  - *Implementation:* `class Tween<T extends Object?> { Tween({this.begin,
    this.end}); T? begin; T? end; T lerp(double t) => ...; T transform(double
    t) => t == 0.0 ? begin! : t == 1.0 ? end! : lerp(t); }` — a real, minimal
    data holder; for a numeric `T` like `double`, `lerp` computes
    ordinary linear interpolation, `begin + (end - begin) * t`.
  - *Its use:* `Tween(begin: 0, end: 1)` — the real object handed to
    `TweenAnimationBuilder`'s own `tween:` parameter, above, naming
    exactly what range this lesson's own pop-in animates across.
  - *Type:* a plain, non-widget class holding two real fields.
  - *Responsibility:* answer, for any progress fraction from 0 to 1,
    the real, interpolated value between its own `begin` and `end` —
    nothing about timing, curves, or widgets; those are `Curve`'s and
    `TweenAnimationBuilder`'s own separate jobs.
  - *Depends on:* nothing; a pure, stateless value holder.
  - *Connects to:* handed to and read by whatever real,
    `ImplicitlyAnimatedWidget` owns it (`TweenAnimationBuilder`, here).
  - *Shape:* a small, shared, framework-level utility type.
- **`AnimationController`**
  - *What it is:* a real, explicit animation primitive — a single,
    real `double` value between 0 and 1 that your own code starts,
    stops, and restarts directly, in contrast to every implicit
    animation above, which starts itself the moment a property differs.
  - *Implementation:* its real, relevant members, read fresh this
    session from
    `C:\flutter\packages\flutter\lib\src\animation\animation_controller.dart`:
    ```dart
    class AnimationController extends Animation<double> with ... {
      AnimationController({double? value, required this.duration,
          required TickerProvider vsync});
      TickerFuture forward({double? from}) {
        // ...
        if (from != null) { value = from; } // synchronous jump
        return _animateToInternal(upperBound);
      }
      void reset() { value = lowerBound; }
    }
    ```
    `forward`'s own real body confirms, in the genuine source, that
    passing `from:` sets `value` synchronously, before any animating
    begins — proved for real against this exact behavior in this
    lesson's own isolated lab, below.
  - *Its use:* drives the completion banner's real fade/scale, and the
    error-shake's real oscillation — both need to start at a moment
    this app's own code decides, not merely whenever some property
    differs.
  - *Type:* a class implementing `Animation<double>` — a real,
    observable, single `double` value other widgets can listen to.
  - *Responsibility:* own the real, current progress value of exactly
    one animation, expose real `forward`/`reverse`/`reset` methods to
    control it imperatively, and notify every real listener each time a
    real tick changes that value.
  - *Depends on:* a real `TickerProvider` (`vsync:`) supplying the
    actual per-frame callback source, and a real `duration`.
  - *Connects to:* created and owned by a `State<T>` (this lesson's own
    `_CompletionBannerState`/`_SudokuCellViewState`, below); read by
    `FadeTransition`/`ScaleTransition`/`AnimatedBuilder` as the real,
    live value driving their own visual output.
  - *Shape:* an Application-adjacent utility living entirely inside the
    Presentation layer — this app's own real game rules never reference
    it.
- **`SingleTickerProviderStateMixin`**
  - *What it is:* a real, built-in Flutter mixin a `State<T>` class adds
    to become a valid real `TickerProvider` — the thing `vsync:` above
    actually requires.
  - *Implementation:* mixes in a real `createTicker` method building a
    genuine `Ticker`, a real, low-level object that calls back once per
    real screen frame, synchronized to this real app's own actual
    rendering schedule (never running while, for instance, this real
    app's own tab or window isn't visible, avoiding wasted real work).
  - *Its use:* `class _CompletionBannerState extends State<_CompletionBanner>
    with SingleTickerProviderStateMixin` — the real, minimal way to make
    exactly one `AnimationController` valid inside a `State<T>`.
  - *Type:* a mixin (applied with Dart's `with` keyword) restricted to
    exactly one real `Ticker` per `State` — using it for more than one
    real, simultaneous `AnimationController` is a genuine, real
    programmer error `TickerProviderStateMixin` (a real, different
    mixin, unused in this lesson) exists to allow instead.
  - *Responsibility:* supply the one, real per-frame callback source
    every `AnimationController` in this `State` needs, and stop
    supplying it the instant this real widget leaves the screen — real,
    automatic cleanup this app's own code never has to write by hand.
  - *Depends on:* being mixed into a real `State<T>` class specifically
    — it cannot exist standalone.
  - *Connects to:* passed as `vsync: this` into every real
    `AnimationController` this lesson's own two stateful widgets create.
  - *Shape:* framework-level plumbing, invisible once wired — this
    app's own visible behavior never references it directly again after
    construction.
- **`CurvedAnimation`**
  - *What it is:* a real, built-in Flutter class that wraps an existing
    `Animation<double>` (here, an `AnimationController`) and re-exposes
    its value after applying a real `Curve` — the explicit-animation
    equivalent of `AnimatedContainer`'s own `curve:` parameter.
  - *Implementation:* `class CurvedAnimation extends Animation<double>
    with AnimationWithParentMixin<double> { CurvedAnimation({required
    this.parent, required this.curve}); @override double get value =>
    curve.transform(parent.value); }` — real and small: every real read
    of its own `.value` simply runs the parent's current progress
    through the curve first.
  - *Its use:* `CurvedAnimation(parent: _controller, curve:
    Curves.elasticOut)` — makes the completion banner's own real scale
    overshoot slightly past full size before settling, rather than
    growing at one flat, linear rate.
  - *Type:* a real, thin wrapper `Animation<double>` implementation.
  - *Responsibility:* re-derive one real, curved value from a parent
    animation's own linear progress, on every real read — it owns no
    ticking or timing of its own at all.
  - *Depends on:* a real `parent` `Animation<double>` (here, the
    `AnimationController` itself) and a real `Curve`.
  - *Connects to:* handed directly into `ScaleTransition`'s own `scale:`
    parameter, below, as the real, live value that transition reads
    every frame.
  - *Shape:* framework-level utility, Presentation-layer only.
- **`FadeTransition` / `ScaleTransition`**
  - *What it is:* two real, built-in Flutter widgets that each read one
    real `Animation<double>` and repaint their own single `child` using
    its current value — `FadeTransition` as opacity, `ScaleTransition`
    as a uniform scale factor — with no `builder` callback needed, since
    each already knows exactly what to do with the value.
  - *Implementation:* both are real `AnimatedWidget` subclasses whose
    own `build` methods read `listenable.value` (their real,
    given `Animation<double>`) directly — `FadeTransition` wraps its
    child in a real `Opacity`; `ScaleTransition` wraps its child in a
    real `Transform.scale`, the identical real widget this lesson's own
    Concept Unit 2 already uses directly, below.
  - *Its use:* `FadeTransition(opacity: _controller, child:
    ScaleTransition(scale: CurvedAnimation(...), child: ...))` —
    the completion banner's own real, composed fade-and-scale.
  - *Type:* two real, concrete `AnimatedWidget` subclasses.
  - *Responsibility:* repaint their own single child every time their
    given `Animation<double>` changes value — nothing about starting,
    stopping, or timing that animation; that stays the
    `AnimationController`'s own, separate job.
  - *Depends on:* a real `Animation<double>` (here, the same
    `AnimationController`/`CurvedAnimation` pair) and a real `child`.
  - *Connects to:* the outermost real widgets `_CompletionBanner.build`
    returns, below, wrapping the actual "Solved!" `Card`.
  - *Shape:* Presentation-layer, purely visual.
- **`AnimatedBuilder`**
  - *What it is:* a real, built-in Flutter widget bridging an explicit
    `Animation` (like an `AnimationController`) into an arbitrary,
    caller-defined `builder` callback — the explicit-animation
    equivalent of `TweenAnimationBuilder`'s own implicit `builder`,
    except it does no interpolating of its own at all; it only re-runs
    `builder` every time its given `animation` changes.
  - *Implementation:* a real, `child`-optimized widget: its own
    `builder` callback receives a real, already-built `child` argument
    that is **not** rebuilt on every tick, only reused — proved for
    real in this lesson's own isolated lab, below.
  - *Its use:* re-runs this cell's own shake calculation on every real
    animation tick, wrapping the cell's already-built visual content
    (its `InkWell`/`AnimatedContainer` subtree) as a `child` that is
    built exactly once, not once per tick.
  - *Type:* a real, generic `StatefulWidget` subclass.
  - *Responsibility:* call its own `builder` again every time the given
    `animation` notifies a change, handing it the unchanged, real
    `child` each time, rather than forcing the entire subtree to be
    rebuilt at real animation-frame frequency.
  - *Depends on:* a real `Listenable` (here, the `AnimationController`
    itself) and a real `builder` callback.
  - *Connects to:* wraps this cell's entire existing real `InkWell`
    subtree as its `child`; its own `builder` reads the real, live
    `_shakeController.value` to compute a real horizontal offset.
  - *Shape:* Presentation-layer, purely visual — a real, meaningful
    performance seam (rebuild frequency) inside a widget that otherwise
    looks identical to before.
- **`Transform.translate` / `Transform.scale`**
  - *What it is:* two real, named constructors on Flutter's real
    `Transform` widget, each building a real 4x4 transformation matrix
    internally and applying it to paint its own `child` shifted
    (`.translate`) or resized (`.scale`) — without changing that
    child's own real layout size or position as far as its parent is
    concerned.
  - *Implementation:* `Transform.translate({required Offset offset,
    required Widget child})`; `Transform.scale({required double scale,
    required Widget child})` — both real, and both purely a *paint-time*
    effect: the real underlying `RenderObject` is never actually resized
    or moved in the layout tree, only repainted differently.
  - *Its use:* `.translate` shifts a rejected cell horizontally for a
    real shake; `.scale` grows the pop-in digit from invisible to full
    size.
  - *Type:* a real widget with two real, named factory constructors
    used in this lesson (a third, plain `Transform(transform: Matrix4
    ...)`, is not used here).
  - *Responsibility:* paint its own `child` through a real, given
    transform, leaving every other real widget around it — hit-testing,
    layout size, everything but the actual pixels drawn — unaffected.
  - *Depends on:* a real `child` and either a real `Offset`
    (`.translate`) or a real `double` (`.scale`).
  - *Connects to:* `.scale`'s own real factor comes from
    `TweenAnimationBuilder`'s current interpolated value, above;
    `.translate`'s own real offset comes from a value this lesson's own
    new code computes from `_shakeController.value`, below.
  - *Shape:* a small, shared, framework-level utility widget.
- **`sin` / `pi`** (`dart:math`)
  - *What it is:* `sin` is a real, top-level trigonometric function;
    `pi` is a real, top-level `double` constant (3.14159...) — both from
    Dart's own real `dart:math` library, already imported once before
    in this project for `Random`, never for either of these two.
  - *Implementation:* `double sin(num radians)`; `const double pi =
    3.1415926535897932;` — both real, ordinary math-library members,
    with no Flutter-specific behavior at all.
  - *Its use:* `math.sin(progress * math.pi * 4)` — a real, oscillating
    wave used to compute this lesson's own shake offset, below; `* 4`
    makes the wave complete two full back-and-forth cycles across one
    real animation run.
  - *Type:* a top-level function (`sin`) and a top-level constant
    (`pi`), imported with a real `math.` prefix (`import 'dart:math' as
    math;`) to avoid colliding with this file's own, unrelated real
    names.
  - *Responsibility:* `sin` answers the real sine of a given real angle
    in radians; `pi` supplies the one real constant needed to convert a
    0-to-1 progress fraction into a real angle spanning whole or partial
    circles.
  - *Depends on:* nothing; both are pure, real, stateless math.
  - *Connects to:* read directly inside `_SudokuCellViewState.build`'s
    own real `AnimatedBuilder.builder` callback, below.
  - *Shape:* Dart SDK-level, not Flutter-specific at all — the same
    real functions any Dart program, with or without Flutter, could
    call.
- **`State.didUpdateWidget`**
  - *What it is:* a real, third lifecycle method on `State<T>`, distinct
    from the already-established `initState` (called exactly once, the
    real instant a `State` is first created) and `build` (called on
    every real rebuild, with no memory of what came before) — called
    specifically when an existing, already-mounted `State`'s own widget
    configuration is replaced by a new one Flutter decided to *reuse*
    this same `State` for, per the real `Key`-based reconciliation
    explained above.
  - *Implementation:* `@mustCallSuper void didUpdateWidget(covariant T
    oldWidget) { }` — a real, empty default; overriding it is the only
    way a `State` ever sees its own *previous* widget configuration
    directly, since `build` only ever has access to the current one via
    `widget`.
  - *Its use:* compares a real, just-received `oldWidget` field against
    the current real `widget` field to detect a genuine, meaningful
    change — `!oldWidget.visible && widget.visible` for the completion
    banner, `widget.isSelected && widget.shakeTrigger !=
    oldWidget.shakeTrigger` for the cell shake — and only then calls a
    real, explicit `AnimationController.forward(from: 0)`.
  - *Type:* an instance method every `State<T>` subclass may override.
  - *Responsibility:* let a `State` react to *how* its configuration
    changed, not merely *that* it changed — real, run proof, in this
    lesson's own isolated lab, below, shows it fires on every single
    real rebuild that reuses the same `Element`, even one where nothing
    meaningful actually differs, which is exactly why comparing
    `oldWidget` against `widget` explicitly, inside it, is this app's
    own responsibility, not something Flutter filters out beforehand.
  - *Depends on:* being inside a real `State<T>` whose own `Element` was
    genuinely reused, not freshly created, for this rebuild.
  - *Connects to:* called by Flutter's own internal element-update code
    (`Element.update`), immediately after a real, reused `State`'s
    `widget` field has already been reassigned to the new configuration
    — `oldWidget` is the caller's only remaining copy of what it used to
    be.
  - *Shape:* framework lifecycle contract — every real override in this
    lesson stays local to its own `State` class.

## Concept Unit: Cell selection

### The Problem

Since this app first drew a real board, tapping a different cell
changes the selected-cell highlight — a real, solid background color —
in exactly one frame: gone from the old cell, present on the new one,
with nothing in between. That is a correct state change; it is not yet
a *communicated* one. A player's eye has to notice two separate,
instantaneous facts (this cell lost its color, that one gained it)
rather than following one continuous, obvious motion from one to the
other.

> **Try it yourself first.** This app's own `SudokuCellView` already
> reads `Theme.of(context).colorScheme.primaryContainer` for its real,
> selected-cell fill color, inside a plain `BoxDecoration` on a plain
> `Container`. Before reading on: if you wanted that specific color
> change to fade in smoothly over, say, 150 milliseconds, using nothing
> but ordinary `StatefulWidget`/`setState` machinery you already know,
> what would you actually have to write? Sketch it in your head — a
> field to hold a slowly-changing color value, something that updates
> it many times a second, a timer or a frame callback driving each
> update. Now ask: does a plain `Container`'s `color` property support
> being told "become this new color, but do it over 150ms" on its own,
> or is that logic something you'd have to build yourself, by hand,
> around it?

### Introducing the concept

A minimal, throwaway widget test proves the real mechanism before this
lesson's own code touches it. A `StatefulBuilder` rebuilds a real
`AnimatedContainer` with a new target `width` (20 → 100) after one real
tap-equivalent `setState`, over a real 200-millisecond `duration`:

```dart
await tester.pumpWidget(
  MaterialApp(
    home: Center(
      child: StatefulBuilder(
        builder: (context, setter) {
          setState = setter;
          return AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: targetWidth,
            height: 20,
            color: Colors.blue,
          );
        },
      ),
    ),
  ),
);

expect(tester.getSize(find.byType(AnimatedContainer)).width, 20);

setState(() => targetWidth = 100);
await tester.pump();
await tester.pump(const Duration(milliseconds: 100)); // exactly halfway

final midWidth = tester.getSize(find.byType(AnimatedContainer)).width;
```

Run for real (`verification/lesson-61/animation_labs_test.dart`, Lab
1), because this touches `AnimatedContainer`'s own real, internal
timing — not something to predict with confidence rather than measure:

```
midWidth == 60.something, closeTo(60, 1)
```

At exactly the halfway point of a 200ms animation from 20 to 100 with
the real, default linear curve, the real, on-screen width was measured
at ~60 — precisely halfway between 20 and 100, not 20 (unchanged) and
not 100 (already finished). This is called **implicit animation**: no
code anywhere called `.animateTo(60)` — the widget was simply told a
new target width, and `AnimatedContainer` computed and painted every
real, in-between frame on its own, entirely unprompted.

### Discard the throwaway example

This lab's own `AnimatedContainer` never becomes part of this app's
real project — it is deleted, right here, once understood. What it
proved carries forward directly, though: this app's own real
`SudokuCellView` is about to gain the identical real mechanism, on its
real `decoration`'s color, not a lab's `width`.

### Project Change

- **Reference Source** — No reference counterpart; this is a
  from-scratch addition, since Flutter's own animation widgets have no
  equivalent in the Phase 2 Sudoku-engine work this project ports from.
- **Files affected** — `project/lib/features/sudoku/presentation/sudoku_board_view.dart`
  (modified).
- **Change type** — replace.
- **Location** — inside `SudokuCellView.build`, the real `Container`
  that already wraps this cell's own content.
- **Dependencies** — none beyond the Flutter SDK already in use.

### The New Code

```dart
AnimatedContainer(
  duration: const Duration(milliseconds: 150),
  width: widget.size,
  height: widget.size,
  // ...alignment, decoration, and child are unchanged
)
```

### The Updated Project

`SudokuCellView.build` — the real, complete method, this lesson's own
first real change marked:

```dart
 1  Widget build(BuildContext context) {
 2    return AnimatedContainer(                                          // ← new
 3      duration: const Duration(milliseconds: 150),                     // ← new
 4      width: widget.size,
 5      height: widget.size,
 6      alignment: Alignment.center,
 7      decoration: BoxDecoration(
 8        color: widget.isSelected
 9            ? Theme.of(context).colorScheme.primaryContainer
10            : null,
11        border: Border(
12          top: BorderSide(width: widget.row % 3 == 0 ? 2 : 0.5),
13          left: BorderSide(width: widget.col % 3 == 0 ? 2 : 0.5),
14          right: BorderSide(width: widget.col == 8 ? 2 : 0.5),
15          bottom: BorderSide(width: widget.row == 8 ? 2 : 0.5),
16        ),
17      ),
18      child: /* this cell's own digit, unchanged by this Concept Unit */,
19    );
20  }
```

The method's own real job hasn't changed at all — it still describes
exactly one cell's current appearance, every real frame. What changed
is *how that description gets from one state to the next on screen*:
line 2's class name is now `AnimatedContainer`, and line 3 hands it a
real `duration`. Nothing about lines 6-17, the cell's own real border
and color logic, needed to change even slightly — the same `decoration`
value that used to appear instantly now animates, for free.

### Mechanical walkthrough

- `AnimatedContainer(...)` — constructs a real, `const`-ineligible
  (its `duration`/`width` arguments aren't compile-time constants)
  instance of the class explained in full in this lesson's own Header,
  above: an implicitly-animated drop-in replacement for `Container`.
- `duration: const Duration(milliseconds: 150)` — a real `Duration`
  value (already used elsewhere in this app, for a `Timer` and for
  other UI delays) — here it names how long *this specific widget's
  own* animation should take to finish once a change is detected; 150
  milliseconds was chosen because it's fast enough to feel responsive
  to a tap, not so fast the motion is imperceptible.
- `width: widget.size` / `height: widget.size` — unchanged reads of
  this cell's own already-existing `size` field; still the same values
  as before, just now animatable properties of a different widget
  class.
- `decoration: BoxDecoration(...)` — unchanged in its own contents; its
  presence here is what actually gets animated. `AnimatedContainer`
  compares this whole `BoxDecoration` value against the one it held on
  the previous real build and, when they differ, produces a real,
  interpolated sequence of intermediate `BoxDecoration`s in between —
  proof of exactly this, for the real `color` field specifically, is
  what this Concept Unit's own isolated lab already measured, above,
  on a simpler `width` property to keep the lab minimal.

### CS lens

**Implicit animation** is a real, named pattern: describe the desired
end state declaratively, and let a separate system compute the path to
it. Also recognized in: CSS `transition` properties on the web (`.box {
transition: background-color 150ms; }` produces the identical real
effect, in a completely different language and rendering engine);
physics-engine "spring to target" solvers in game development; a
thermostat, which doesn't jump a room's temperature instantly but lets
it approach a target over real time; animation "tweening" in
traditional 2D animation software, where an artist draws only the first
and last frame ("keyframes") and software fills in every frame between.

### SE lens

The real alternative here was a hand-built `Timer.periodic` loop
manually interpolating a color field itself, driving `setState` many
times a second — real, working code, but code this app's own author
would have to write, test, and maintain by hand, for every single
animated property, forever. `AnimatedContainer` exists specifically so
that entire category of hand-rolled interpolation logic never has to
be written at all for the common case: "this value changed between two
builds, animate the difference." The real cost of this convenience:
`AnimatedContainer` can only react to a value that *already differs*
between two builds — it has no way to be told "play this animation
right now," independent of any property actually changing. That
limitation is exactly why Concept Unit 3 and Concept Unit 4, below,
reach for a different, more work-intensive tool instead.

### Commands needed

None — this Concept Unit only edits an existing Dart file already part
of the real, running project.

### Run it

Verified together with every other Concept Unit's own real code in
this lesson's closing, full-project verification pass, below, per the
Verification Rule's Batching clause — re-running `flutter test` after
every single Concept Unit lands separately would only repeat the
identical suite for no new information. This Concept Unit's own real,
individual proof already ran above, in its own isolated lab.

### Connect the pieces

The real cell that has shown a highlight color since this app first
drew a board now shows it arriving, not appearing — the smallest
possible real change (a class name, one argument) with a directly
visible, immediate effect on how every tap already in this app feels.

---

## Concept Unit: Number placement

### The Problem

A digit typed into a cell also appears in exactly one frame — correct,
but, per this lesson's own opening problem, uncommunicated: nothing
distinguishes "this cell has always shown a 7" from "a 7 was just, this
instant, placed here." A given clue and a just-placed player digit
currently render completely identically once painted.

> **Try it yourself first.** `AnimatedContainer`, from the Concept Unit
> above, animates *properties that change value* between builds — a
> color, a width. A cell's digit going from `null` to `7` is exactly
> that kind of change. Could `AnimatedContainer` itself be made to
> animate a `Text` widget's own string content directly, the same way
> it animates a color? Try to state, specifically, what "the halfway
> point between no text and the text '7'" would even mean, the way
> "halfway between blue and red" clearly does — is a digit's own
> *appearance* (a pop, a fade, a grow) something a single interpolated
> value between two strings could ever express?

### Introducing the concept

A digit's own string content isn't the thing to animate at all — a
real, numeric *scale factor* is. A minimal, throwaway lab proves the
real mechanism this Concept Unit actually needs: `TweenAnimationBuilder`
animating a plain `double` from 0 to 1, displayed as text so its own
real, in-flight value is directly readable, and — the real point of
this specific lab — what happens to that running value when the
widget's own `key` does, and doesn't, change:

```dart
TweenAnimationBuilder<double>(
  key: widgetKey,
  tween: Tween(begin: 0, end: 1),
  duration: const Duration(milliseconds: 200),
  curve: Curves.linear,
  builder: (context, value, child) => Text(value.toStringAsFixed(2)),
);
```

Run for real (`verification/lesson-61/animation_labs_test.dart`, Lab
2) — because this touches real `Element`-reuse-versus-discard behavior,
not something to predict from first principles alone:

```
pumped with key ValueKey(1); after 100ms of a 200ms run: value ≈ 0.50
rebuilt with the SAME key, no other change:            value ≈ 0.50 (unchanged — retargeted, not restarted)
rebuilt with key ValueKey(2), a genuinely different key: value == 0.00 (restarted from begin)
```

Three real, distinct outcomes. Rebuilding with the *same* key mid-flight
changed nothing about the running value — the exact same real element,
mid-animation, was simply asked to keep going. Rebuilding with a
*different* key snapped the value straight back to `0.00`, its own real
`begin` — not because anything paused or reset an animation, but
because Flutter discarded the entire old `TweenAnimationBuilder`
element (and the private `AnimationController` it owns internally)
outright and built a genuinely new one from scratch, which naturally
starts at `begin`. This is exactly the real `Key`-based reconciliation
mechanism named in this lesson's own Header, above, now proven with a
real, running animation as the stakes rather than an inert widget.

### Discard the throwaway example

This lab's own `Text`-displaying `TweenAnimationBuilder` is deleted
here, never joining the real project. What carries forward: giving a
cell's own animated digit a key derived from its current value is
exactly how to make a *new* value restart the pop-in from scratch, on
purpose, every single time — the real mechanism this lab just proved,
now aimed at a real, useful effect instead of an arbitrary demonstration.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition, same reasoning as the Concept Unit above.
- **Files affected** — `project/lib/features/sudoku/presentation/sudoku_board_view.dart`
  (modified).
- **Change type** — replace.
- **Location** — inside `SudokuCellView.build`, replacing the plain
  `Text` that was, until now, this cell's own entire real `child`.
- **Dependencies** — none beyond the Flutter SDK.

### The New Code

```dart
widget.isGiven
    ? Text(/* unchanged given-clue rendering */)
    : TweenAnimationBuilder<double>(
        key: ValueKey(widget.value),
        tween: Tween(begin: 0, end: 1),
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutBack,
        builder: (context, scale, child) => Transform.scale(scale: scale, child: child),
        child: Text(/* the real digit, unchanged content */),
      )
```

### The Updated Project

`SudokuCellView.build`'s own real `child:` argument, the one real
parameter this Concept Unit changes, numbered from its own start:

```dart
 1  child: widget.isGiven
 2      ? Text(
 3          widget.value == null ? '' : '${widget.value}',
 4          style: Theme.of(context).textTheme.titleLarge!
 5              .copyWith(fontWeight: FontWeight.bold),
 6        )
 7      : TweenAnimationBuilder<double>(                              // ← new
 8          key: ValueKey(widget.value),                              // ← new
 9          tween: Tween(begin: 0, end: 1),                           // ← new
10          duration: const Duration(milliseconds: 200),              // ← new
11          curve: Curves.easeOutBack,                                // ← new
12          builder: (context, scale, child) =>                       // ← new
13              Transform.scale(scale: scale, child: child),          // ← new
14          child: Text(                                              // ← new
15            widget.value == null ? '' : '${widget.value}',          // ← new
16            style: Theme.of(context).textTheme.titleLarge!
17                .copyWith(fontWeight: FontWeight.normal),            // ← new
18          ),                                                        // ← new
19        ),                                                          // ← new
```

Lines 1-6, a real given clue, are entirely unchanged — this Concept
Unit never touches how a given clue renders. Lines 7-19 are new: a
player-fillable cell's own digit now renders through a real,
`ValueKey`-keyed `TweenAnimationBuilder` instead of a bare `Text`,
whole and complete — the exact same real `Text` content as before
(lines 15-17), just now wrapped in real, animated scale machinery keyed
to its own current value.

### Mechanical walkthrough

- `widget.isGiven ? ... : ...` — a real, reappearing ternary expression
  (already used elsewhere in this app's own code) branching this cell's
  entire `child` on whether it's a given clue — unchanged in structure,
  now with a genuinely different real branch on the right.
- `TweenAnimationBuilder<double>(...)` — constructs a real instance of
  the class explained in full in this lesson's own Header, above,
  explicitly typed to interpolate a `double` (its own generic type
  parameter, reused from earlier lessons' own generic classes, here
  fixing exactly what kind of value this specific instance
  interpolates).
- `key: ValueKey(widget.value)` — a real `ValueKey` wrapping this
  cell's own current `int?` value — every time that value differs from
  what it was, this produces a real, different key, and, per this
  Concept Unit's own isolated lab, above, a genuinely different key
  means Flutter discards the old element and builds a fresh one,
  restarting the animation from `begin`.
- `tween: Tween(begin: 0, end: 1)` — a real `Tween<double>` naming the
  real range this pop-in interpolates across: fully shrunk to fully
  sized.
- `duration: const Duration(milliseconds: 200)` — a real `Duration`,
  chosen slightly longer than the selection highlight's own 150ms,
  since a "pop" reads better with a touch more time to actually see the
  overshoot the next line adds.
- `curve: Curves.easeOutBack` — a real, named `Curve` (from the same
  `Curves` class already explained in this lesson's own Header) whose
  own real shape briefly overshoots past 1.0 before settling back —
  producing the actual "pop" feel, in contrast to the selection
  highlight's own plain `Curves.linear` default.
- `builder: (context, scale, child) => Transform.scale(scale: scale,
  child: child)` — a real anonymous function (already used elsewhere in
  this project for callbacks) receiving the current, real interpolated
  `double` as `scale`, wrapping the already-built `child` argument in a
  real `Transform.scale`, explained in full in this lesson's own
  Header, above.
- `child: Text(...)` — the real digit's own text, entirely unchanged in
  content from before this lesson, just relocated to be
  `TweenAnimationBuilder`'s own real `child` parameter rather than
  `AnimatedContainer`'s direct `child` — passed once, reused unchanged
  on every real animated tick, per this same class's own real, quoted
  `build` method in this lesson's own Header, above (`return
  widget.builder(context, _currentTween!.evaluate(animation),
  widget.child)`).

### CS lens

Restating this lesson's own already-proven fact from the Concept Unit
above, now in a genuinely new, load-bearing role: Flutter's real
element reconciliation compares a new widget's `runtimeType` and `key`
against the widget an existing `Element` already holds — matching both
means *update in place*; either differing means *discard and rebuild*.
This specific Concept Unit is the real, first time this app's own code
deliberately *forces* a discard, on purpose, as a technique — using a
value-derived key not to preserve identity across rebuilds, but
specifically to break it, exactly when a fresh restart is the actual
desired effect. Also recognized in: React's own `key` prop on list
items (the identical real idea, a different framework); version-control
diff tools treating a file as "deleted and re-added" rather than
"modified" once its content changes past some similarity threshold;
object pooling systems that reuse an object only while its own identity
key still matches, and allocate fresh otherwise.

### SE lens

The real alternative here was giving `SudokuCellView` itself a mutable
field remembering "was I just filled," toggled on in
`didUpdateWidget` (the lifecycle method the next two Concept Units
introduce properly) and read back inside `build` to decide whether to
animate — real, working code, but code carrying its own, separate
mutable state purely to answer a question `Key`-based reconciliation
already answers for free. The real tradeoff of the chosen approach:
a `ValueKey` derived from `widget.value` also restarts the animation on
*any* value change, not only "was empty, now isn't" — correcting an
already-filled cell to a different real digit pops in again too, a
real, deliberate choice (a correction is exactly as worth
communicating as a first placement) rather than a limitation quietly
accepted.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

The real selection highlight, from the Concept Unit above, communicates
*where* attention is; this Concept Unit's own real pop-in communicates
*that something just arrived* there — the same underlying idea
(implicit animation reacting to a value that differs across builds),
now driving a `double` instead of a `BoxDecoration`, and, for the first
time in this lesson, deliberately exploiting `Key`-based reconciliation
rather than merely relying on it.

---

## Concept Unit: Completion animation

### The Problem

`GameSession`'s own real state machine already flips `status` to
`GameStatus.completed` the exact real instant the board's own final
correct digit lands — real, correct, already-tested logic, untouched by
this lesson. But nothing on screen currently reacts to it at all beyond
one small, plain status line's own text changing from `playing` to
`completed`, easy to miss entirely if a player isn't looking at that
exact word.

> **Try it yourself first.** Every animation this lesson has built so
> far started itself the moment some widget *property* differed across
> two builds — a color, a value, a key. A "you solved it" flourish needs
> to start at one specific, real *event* (the transition into
> `GameStatus.completed`), not merely whenever some property happens to
> differ. Could `AnimatedContainer` or `TweenAnimationBuilder` express
> "play this animation once, right now, because this specific thing just
> happened" the way they express "smoothly become this new value"? What
> real information would a widget need to be given that neither of them
> currently receives?

### Introducing the concept

The real, missing ingredient is a *memory of what changed last time* —
exactly what `didUpdateWidget`, named in this lesson's own Header,
above, supplies. A minimal, throwaway `_LabBanner` widget proves both
real facts this Concept Unit depends on: that `didUpdateWidget` fires
on every rebuild reusing the same `Element`, with the real, previous
widget for comparison, and that a real `AnimationController`'s own
`forward(from: ...)` can be triggered from inside it:

```dart
class _LabBannerState extends State<_LabBanner> {
  @override
  void didUpdateWidget(_LabBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    widget.onDidUpdate(oldWidget.visible);
  }

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
```

Run for real (`verification/lesson-61/animation_labs_test.dart`, Lab
4) — because this touches real, internal Flutter lifecycle-callback
behavior, not something to confidently predict unaided:

```
first, real mount (visible: false):         didUpdateWidget calls seen: [] (none — initState only)
rebuilt, identical real value (false):      didUpdateWidget calls seen: [false] (fired anyway, nothing changed)
rebuilt, genuinely different value (true):  didUpdateWidget calls seen: [false, false]
```

Two real, load-bearing facts, confirmed rather than assumed: first,
`didUpdateWidget` never fires on the widget's own first, real mount —
only `initState` sees that moment. Second, and more surprising:
`didUpdateWidget` fires on *every* rebuild that reuses the same
`Element`, even the second one above, where `visible` never actually
changed at all — proving that deciding whether something *meaningful*
changed is this app's own, explicit responsibility, inside
`didUpdateWidget`'s own body, never something Flutter filters out for
you beforehand.

A second, separate real lab proves `AnimationController.forward(from:
...)`'s own precise behavior, since this Concept Unit's own real code
calls it from inside `didUpdateWidget`:

```dart
controller.forward();
await tester.pump();
await tester.pump(const Duration(milliseconds: 100));
// controller.value ≈ 0.5

controller.forward(from: 0);
// controller.value == 0.0   ← jumped synchronously, before any new frame
// controller.status == AnimationStatus.forward
```

Run for real (Lab 3, same file) — real, direct proof of the real,
quoted `forward` body in this lesson's own Header, above
(`if (from != null) { value = from; }`, executed synchronously, before
`_animateToInternal` even schedules the next real tick): calling
`forward(from: 0)` genuinely jumps the controller's own value back to
`0` immediately, in the same real line of code, not on some later
frame.

### Discard the throwaway example

Both labs — `_LabBanner` and the standalone `forward(from:)` probe —
are deleted here, joining nothing in the real project. What carries
forward: `didUpdateWidget` is the real place to compare "what this
widget's configuration used to be" against "what it is now," and
`AnimationController.forward(from: 0)` is the real, correct call to
make there when that comparison says "play the animation, from
scratch, right now."

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition.
- **Files affected** — `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (modified: a new private widget added; both `_CompactLayout` and
  `_WideLayout` each gain one new line).
- **Change type** — add.
- **Location** — a new `_CompletionBanner`/`_CompletionBannerState`
  pair, placed directly in `sudoku_app.dart` (this file's own
  established convention for every other private, screen-local widget —
  `_SessionStatus`, `_CompactLayout`, `_WideLayout` — all already live
  here, since Dart's own privacy is per-file, not per-class); one new
  line inside each layout's own `Column`, directly below its existing
  status `Text`.
- **Dependencies** — `AppSpacing` (this app's own existing design
  token class) for the banner's own padding.

### The New Code

```dart
class _CompletionBannerState extends State<_CompletionBanner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 400),
  );

  @override
  void initState() {
    super.initState();
    if (widget.visible) {
      _controller.value = 1;
    }
  }

  @override
  void didUpdateWidget(_CompletionBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!oldWidget.visible && widget.visible) {
      _controller.forward(from: 0);
    }
  }
}
```

### The Updated Project

`_CompletionBanner`'s own real, complete state class, numbered:

```dart
 1  class _CompletionBannerState extends State<_CompletionBanner>
 2      with SingleTickerProviderStateMixin {
 3    late final AnimationController _controller = AnimationController(
 4      vsync: this,
 5      duration: const Duration(milliseconds: 400),
 6    );
 7
 8    @override
 9    void initState() {
10      super.initState();
11      if (widget.visible) {
12        _controller.value = 1;
13      }
14    }
15
16    @override
17    void didUpdateWidget(_CompletionBanner oldWidget) {
18      super.didUpdateWidget(oldWidget);
19      if (!oldWidget.visible && widget.visible) {
20        _controller.forward(from: 0);
21      }
22    }
23
24    @override
25    void dispose() {
26      _controller.dispose();
27      super.dispose();
28    }
29
30    @override
31    Widget build(BuildContext context) {
32      if (!widget.visible) {
33        return const SizedBox.shrink();
34      }
35      return ScaleTransition(
36        scale: CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
37        child: FadeTransition(
38          opacity: _controller,
39          child: Card(
40            child: Padding(
41              padding: const EdgeInsets.all(AppSpacing.lg),
42              child: Text('Solved!', style: Theme.of(context).textTheme.titleLarge),
43            ),
44          ),
45        ),
46      );
47    }
48  }
```

Lines 1-14 and 16-28 are this Concept Unit's own new lifecycle
management, explained in the walkthrough below; lines 30-47 are this
widget's own `build`, returning nothing at all (`SizedBox.shrink()`,
already used elsewhere in this project) while `!widget.visible`, or a
real, composed `ScaleTransition`/`FadeTransition` pair around a `Card`
once it is. As a whole, this class now owns a complete, real,
self-contained animation: nothing outside it decides when the flourish
plays — only whether `visible` is currently true, which this class
itself watches for the *transition* into.

### Mechanical walkthrough

- `class _CompletionBannerState extends State<_CompletionBanner> with
  SingleTickerProviderStateMixin` — a real `State` subclass (already
  established elsewhere in this app) additionally mixing in
  `SingleTickerProviderStateMixin`, explained in full in this lesson's
  own Header, above — required specifically because this class is
  about to construct a real `AnimationController` and must supply its
  own real `vsync`.
- `late final AnimationController _controller = AnimationController(
  vsync: this, duration: const Duration(milliseconds: 400))` — a real
  `late final` field (already used elsewhere in this app for
  similarly-lazy, one-time construction), initialized the real instant
  it's first read, to a real `AnimationController`, explained in full
  in this lesson's own Header, above; `vsync: this` passes this very
  `State` object, valid specifically because of the mixin on the class
  declaration; `duration: 400ms` names how long the full flourish takes
  once started.
- `void initState()` — a real, already-established `State` lifecycle
  method (called exactly once, the instant this `State` is first
  created) — `super.initState()` is a real, mandatory call up to
  `State`'s own base implementation, already required everywhere this
  method is overridden in this app.
- `if (widget.visible) { _controller.value = 1; }` — a real, direct
  field assignment (not `forward()`) on the controller's own `value` —
  setting it straight to its own real upper bound with zero animating
  at all, specifically for the case this widget mounts already
  completed (a resumed, already-finished session) — the flourish is
  reserved for a completion this widget is actually alive to witness
  happen, not a session that was already done before this widget ever
  existed.
- `void didUpdateWidget(_CompletionBanner oldWidget)` — the real
  lifecycle method explained in full in this lesson's own Header,
  above; `super.didUpdateWidget(oldWidget)` is a real, mandatory call
  up to `State`'s own base implementation, marked `@mustCallSuper` in
  the real, installed Flutter source.
- `if (!oldWidget.visible && widget.visible)` — a real, compound
  boolean condition (`!`, already established; `&&`, already
  established) comparing the real, just-received `oldWidget.visible`
  against the current real `widget.visible` — true only on a genuine
  false-to-true transition, never on a rebuild where `visible` was
  already true (per this Concept Unit's own isolated lab, above,
  proving `didUpdateWidget` alone cannot be trusted to mean "something
  meaningful changed").
- `_controller.forward(from: 0)` — a real call, explained in full in
  this lesson's own Header, above, and proven for real in this Concept
  Unit's own isolated lab: synchronously resets the controller to `0`,
  then begins a real, running animation toward `1`.
- `void dispose()` — a real, already-established `State` lifecycle
  method, called the instant this `State` is permanently removed;
  `_controller.dispose()` releases the real `Ticker` this controller
  owns — omitting this call is a real, genuine resource leak, per this
  lesson's own isolated lab's own accidental, first-hand proof of
  exactly that failure mode, in Lab 5, below.
- `if (!widget.visible) { return const SizedBox.shrink(); }` — a real,
  already-established widget (`SizedBox.shrink()`, a zero-size,
  invisible placeholder) returned whenever there is genuinely nothing
  to show — this widget takes up no real layout space at all until a
  session actually completes.
- `ScaleTransition(scale: CurvedAnimation(parent: _controller, curve:
  Curves.elasticOut), child: ...)` — constructs the real widgets
  explained in full in this lesson's own Header, above; `Curves
  .elasticOut` is a real, different named curve from `Curves
  .easeOutBack` used in the Concept Unit above — its own real shape
  overshoots and gently oscillates before settling, a stronger, more
  playful "flourish" feel deliberately chosen for a whole-game
  completion rather than one placed digit.
- `FadeTransition(opacity: _controller, child: Card(...))` — constructs
  the real widget explained in full in this lesson's own Header, above,
  reading `_controller` directly as its own `opacity` (rather than
  through a `CurvedAnimation`, unlike the scale above) — a deliberate,
  real choice: the fade itself stays linear, only the scale gets the
  more dramatic curve, so the two motions read as distinct rather than
  identical.
- `Card(child: Padding(padding: const EdgeInsets.all(AppSpacing.lg),
  child: Text('Solved!', ...)))` — real, already-established widgets
  from this app's own existing design system, reused unmodified: the
  identical real `Card` styling every other card in this app already
  has, the identical real `AppSpacing.lg` token, and `Theme.of(context)
  .textTheme.titleLarge`, the same real text style this app's own
  status line already uses elsewhere.

### CS lens

**Explicit animation**, named in full in this lesson's own Header,
above, is on real display here for the first time in this lesson: a
real, owned `AnimationController` your own code starts on purpose, at a
moment your own code decides, rather than a value the framework merely
notices differs. Also recognized in: a video game's own "level
complete" fanfare, triggered by a specific in-game event, never merely
"some property changed"; a state machine's own `onEnter` callback,
firing exactly once on a genuine transition into a state, not on every
tick spent already inside it — the identical real shape as this
Concept Unit's own `!oldWidget.visible && widget.visible` guard;
a debouncer, which distinguishes "this value changed" from "this value
changed *and stayed changed*" before reacting.

### SE lens

The real alternative rejected here: letting `AnimatedContainer` or
`TweenAnimationBuilder` (this lesson's own two implicit tools) drive
the banner instead, keyed or triggered somehow off `session.status`
directly. That would work for the fade/scale-in itself, but has no real
way to express "only the very first frame this becomes true, never
again on a later, unrelated rebuild" — the exact distinction
`didUpdateWidget`'s own explicit `oldWidget` comparison exists to make.
The real cost of the chosen, explicit approach: this widget now owns
real lifecycle bookkeeping (`initState`'s own special-cased already-true
check, `dispose`) that an implicit animation would have handled
invisibly — a real, honest tradeoff, not a strictly superior choice,
made here specifically because this Concept Unit's own requirement
(react to an event, not a value) is exactly the case implicit animation
cannot express at all.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

The selection highlight and the placement pop-in, from the two Concept
Units above, both react to *values* a rebuild already carries; this
Concept Unit's own real banner is the first thing in this lesson that
reacts to an *event* — a genuine transition, not a snapshot — setting up
the exact same real, explicit machinery the next Concept Unit reuses
for a very different, but structurally identical, real trigger.

---

## Concept Unit: Error animation

### The Problem

`_dispatch` already catches a rejected move's own real
`InvalidMoveException`/`InvalidStateTransitionException` and shows a
real `SnackBar` naming exactly why. That real message is accurate and
already present — but a `SnackBar` appears at the bottom of the real
screen, potentially far from where a player's own eyes actually are:
on the cell they just tried to fill. Nothing draws the eye back to the
real, actual site of the rejected move itself.

> **Try it yourself first.** The Concept Unit above just built a real,
> working explicit animation triggered by one specific event
> (`GameStatus` reaching `completed`). A rejected move is also a real,
> specific event — `_dispatch`'s own `catch` blocks already know the
> exact real instant it happens. Sketch, in your head, what a "shake"
> even *is* as a real, animatable value — not a color, not a size, not
> an opacity. What single real number, changing over time, would
> produce a cell that visibly moves left, then right, then left again,
> then stops back at rest?

### Introducing the concept

A shake is a real position *offset* that oscillates and decays to
zero — exactly the kind of arbitrary, non-monotonic value
`TweenAnimationBuilder` cannot express (its own real `Tween` only ever
moves smoothly from one fixed `begin` to one fixed `end`, never
back and forth). This is precisely what `AnimatedBuilder`, named in
this lesson's own Header, above, exists for: an explicit
`AnimationController`'s own raw progress value, read directly inside a
real callback free to compute *anything* from it — including a real
sine wave.

A minimal, throwaway lab proves `AnimatedBuilder`'s own real, central
performance property before this Concept Unit's code relies on it —
that its `builder` callback reruns on every real tick, while its own
`child` argument is built exactly once, no matter how many times
`builder` itself reruns:

```dart
AnimatedBuilder(
  animation: controller,
  builder: (context, child) {
    builderCalls++;
    return child!;
  },
  child: Builder(
    builder: (context) {
      childBuilds++;
      return const SizedBox(width: 10, height: 10);
    },
  ),
);
```

Run for real (`verification/lesson-61/animation_labs_test.dart`, Lab
5) — because this touches a real, internal Flutter rebuild-scoping
optimization, not something to state from confidence alone:

```
after first frame:                childBuilds == 1
controller.forward(); three pumps: builderCalls increased (multiple real ticks)
                                    childBuilds still == 1
```

Real, direct proof: `builder` reran multiple real times as the
controller ticked, but `child`'s own `Builder` ran exactly once, total
— `AnimatedBuilder` reuses the identical, already-built `child` widget
on every single real rerun of `builder`, never rebuilding it merely
because the animation ticked.

### Discard the throwaway example

This lab's own counting widgets are deleted here. What carries forward:
put everything that must genuinely change every tick (the shake offset
itself) inside `AnimatedBuilder`'s own `builder`, and put everything
that doesn't (this cell's entire existing visual content) into its
`child`, built once and reused.

### Project Change

- **Reference Source** — No reference counterpart; a from-scratch
  addition.
- **Files affected** —
  `project/lib/features/sudoku/presentation/sudoku_board_view.dart`
  (`SudokuCellView`/`SudokuBoardView` both gain a new `shakeTrigger`
  parameter; `_SudokuCellViewState` gains a second `AnimationController`
  and wraps its own existing content in `AnimatedBuilder`);
  `project/lib/features/sudoku/presentation/sudoku_app.dart`
  (`_SudokuAppState` gains a real `_shakeTrigger` counter, incremented
  inside `_dispatch`'s own two existing `catch` blocks, and threads it
  down through `_CompactLayout`/`_WideLayout` into `SudokuBoardView`).
- **Change type** — add (new fields, a new controller, a new wrapping
  widget); the existing rejection-handling `catch` blocks themselves are
  extended, not replaced.
- **Location** — inside `_dispatch`'s own two existing `catch` clauses,
  right after the already-existing `showSnackBar` call each one makes;
  inside `_SudokuCellViewState.build`, wrapping the content that was,
  until this Concept Unit, this method's own direct return value.
- **Dependencies** — `dart:math`'s real `sin`/`pi`, explained in full in
  this lesson's own Header, above.

### The New Code

```dart
} on InvalidMoveException catch (e) {
  _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
  setState(() => _shakeTrigger++);
}
```

### The Updated Project

`_SudokuAppState._dispatch`'s own real `EnterDigitIntent` branch, the
one real case this Concept Unit changes, numbered:

```dart
 1  case EnterDigitIntent(digit: final digit):
 2    final row = _selectedRow;
 3    final col = _selectedCol;
 4    if (row == null || col == null) {
 5      return;
 6    }
 7    try {
 8      ref.read(gameSessionProvider.notifier).enterDigit(row, col, digit);
 9    } on InvalidMoveException catch (e) {
10      _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
11      setState(() => _shakeTrigger++);                                              // ← new
12    } on InvalidStateTransitionException catch (e) {
13      _scaffoldMessengerKey.currentState?.showSnackBar(SnackBar(content: Text(e.message)));
14      setState(() => _shakeTrigger++);                                              // ← new
15    }
```

Lines 1-8, this whole case's own real dispatch and attempted move, are
unchanged. Lines 9-10 and 12-13, the real rejection handling, are also
unchanged — the existing `SnackBar` still shows. Lines 11 and 14 are
new: every real rejection now also increments a real, shared counter,
inside the same real `setState` that already exists for selection
changes elsewhere in this class, which is what actually causes
`SudokuBoardView`/`SudokuCellView`, further down the real widget tree,
to rebuild with a genuinely new `shakeTrigger` value.

`SudokuCellView.build`, this Concept Unit's own second real change,
wrapping everything the Concept Units above already built:

```dart
 1  Widget build(BuildContext context) {
 2    return AnimatedBuilder(                                              // ← new
 3      animation: _shakeController,                                      // ← new
 4      builder: (context, child) {                                       // ← new
 5        final progress = _shakeController.value;                        // ← new
 6        final offset = math.sin(progress * math.pi * 4)                 // ← new
 7            * 6 * (1 - progress);                                       // ← new
 8        return Transform.translate(offset: Offset(offset, 0), child: child); // ← new
 9      },                                                                 // ← new
10      child: InkWell(
11        onTap: widget.onTap,
12        child: AnimatedContainer(
13          /* ...this cell's entire, real, existing content from the two Concept Units above, unchanged */
14        ),
15      ),
16    );
17  }
```

The method's own real job — describe exactly what one cell looks like —
still hasn't changed. Lines 2-9 are new: everything this method already
returned (lines 10-15, entirely unchanged from the Concept Units above)
is now wrapped in a real `AnimatedBuilder`, computing a real, live
horizontal offset from `_shakeController`'s own current value and
applying it via `Transform.translate` — at rest (`_shakeController
.value == 0`), `math.sin(0) == 0`, so the offset is `0` and this cell
paints exactly as it did before this Concept Unit existed.

`_SudokuCellViewState`'s own real `didUpdateWidget`, gaining the second
real reason (alongside none yet added — this is its first) to call
`forward(from: 0)`:

```dart
1  @override
2  void didUpdateWidget(SudokuCellView oldWidget) {
3    super.didUpdateWidget(oldWidget);
4    if (widget.isSelected && widget.shakeTrigger != oldWidget.shakeTrigger) {  // ← new
5      _shakeController.forward(from: 0);                                      // ← new
6    }
7  }
```

### Mechanical walkthrough

- `setState(() => _shakeTrigger++)` — a real, already-established
  `setState` call (this class already uses it for cell selection),
  wrapping a real `++` increment (already established) on a new,
  `int`-typed field — its own real job is nothing more than "make this
  number different than it was," which is all `didUpdateWidget`'s own
  comparison, below, actually needs.
- `shakeTrigger: shakeTrigger` — threaded, unchanged in mechanism, down
  through `_CompactLayout`/`_WideLayout` and `SudokuBoardView`'s own
  `List.generate` calls (both already established), reaching every real
  `SudokuCellView` — every cell receives the identical real, current
  counter value on every rebuild, though, per the guard below, only the
  real selected one ever reacts to it.
- `AnimatedBuilder(animation: _shakeController, builder: ..., child:
  ...)` — constructs the real widget explained in full in this lesson's
  own Header, above; `animation: _shakeController` is the real
  `Listenable` it watches; the real `child` argument (lines 10-15) is
  this cell's own entire, pre-existing, unmodified content, built once
  and reused on every real tick, per this Concept Unit's own isolated
  lab, above.
- `final progress = _shakeController.value` — a real, local `double`
  read directly from the controller's own current progress, 0 to 1.
- `math.sin(progress * math.pi * 4)` — the real function and constant
  explained in full in this lesson's own Header, above; multiplying
  `progress` by `4π` before taking its sine produces two complete real
  oscillations (a full sine cycle repeats every `2π`) across one run
  from `progress == 0` to `progress == 1`.
- `* 6` — a real, plain numeric literal scaling the raw, real -1-to-1
  sine output up to a real, visible ±6-logical-pixel swing.
- `* (1 - progress)` — a real, linear damping factor: `1` at the very
  start of the shake, shrinking to `0` by the end, so each successive
  real oscillation is visibly smaller than the last, reading as a
  shake settling down rather than one that just stops abruptly.
- `Transform.translate(offset: Offset(offset, 0), child: child)` —
  constructs the real widget explained in full in this lesson's own
  Header, above; `Offset(offset, 0)` is a real, already-established
  class (used elsewhere in this app for tap coordinates) — here, a real
  horizontal shift with zero real vertical movement; `child` is
  `AnimatedBuilder`'s own second, real callback parameter — the
  already-built content passed straight through, unread and
  unmodified, by this specific callback.
- `widget.isSelected && widget.shakeTrigger != oldWidget.shakeTrigger` —
  a real, compound condition: `widget.isSelected` (already
  established) ensures only the one real cell a player was actually
  looking at shakes, never an uninvolved one merely rebuilding for an
  unrelated real reason; `!=` (already established) is the real
  comparison actually detecting a genuine, new rejection, exactly the
  same real shape as the Concept Unit above's own `!oldWidget.visible
  && widget.visible` guard, now comparing an `int` instead of a `bool`.
- `_shakeController.forward(from: 0)` — the identical real call and
  real, proven behavior as the Concept Unit above: synchronously resets
  to `0`, then runs forward — here, restarting the shake from
  scratch even if a second rejection lands mid-shake, rather than
  compounding an already-running one.

### CS lens

This Concept Unit's own real shake is **interpolation** — this lesson's
own opening Term, above — applied to a real, non-monotonic,
periodic function instead of a straight line between two fixed values;
the same underlying idea (compute a value from elapsed progress) still
holds, just with `sin` in place of `Tween`'s own plain linear `lerp`.
Also recognized in: a phone's own haptic "error buzz" pattern, several
short pulses rather than one long one; audio synthesis, where a
decaying sine wave (an "envelope" shrinking amplitude over time) is the
literal, standard way a plucked string or struck bell is modeled; a
mechanical spring released from tension, oscillating and settling
rather than snapping directly to rest.

### SE lens

The real alternative here: giving `_shakeController`'s own animation a
real `AnimationStatusListener` calling `setState` on every tick instead
of using `AnimatedBuilder` at all — real, working code, but one that
would force this cell's *entire* `build` method, including its
unrelated `AnimatedContainer`/`TweenAnimationBuilder` subtree from the
Concept Units above, to rerun on every single real animation tick,
dozens of times a second, for the one selected cell — a real,
measurable cost this Concept Unit's own isolated lab already showed
`AnimatedBuilder`'s own `child` parameter exists specifically to avoid.
The real debt this project is knowingly carrying: only the *selected*
cell can shake right now, by design — a future difficulty setting that
highlights every conflicting cell at once (not scoped for this lesson)
would need its own, separate real trigger, not a straightforward reuse
of this exact mechanism.

### Commands needed

None.

### Run it

Verified together with every other Concept Unit's own code, in this
lesson's closing, full-project verification pass, below.

### Connect the pieces

The completion banner, above, and this Concept Unit's own shake share
the identical real explicit-animation shape — an owned
`AnimationController`, a `didUpdateWidget` guard comparing old against
current — aimed at two structurally opposite real events: one
celebrates a real success, the other calls attention to a real
rejection, and both exist for the same real reason this whole lesson
opened on: an instant state change, alone, doesn't tell a player what
just happened; motion does.

---

## Connect the pieces

One real, concrete trace, start to finish: a player taps cell `(0, 0)`
— a real given clue already holding `5` — then taps `9` on the number
pad.

1. The tap on `(0, 0)` dispatches a real `SelectCellIntent`; `_dispatch`
   calls `setState`, moving `_selectedRow`/`_selectedCol` to `(0, 0)`.
   `SudokuCellView` at `(0, 0)` rebuilds with `isSelected: true`; the
   Concept Unit above's own real `AnimatedContainer` sees its own
   `decoration`'s color differ from what it held before and begins a
   real, 150-millisecond fade into the selected-cell highlight — the
   first Concept Unit's own real payoff, live.
2. The tap on `9` dispatches a real `EnterDigitIntent`. `_dispatch`
   calls `ref.read(gameSessionProvider.notifier).enterDigit(0, 0, 9)`,
   which reaches the real, already-tested `SudokuBoard.placeDigit`,
   which throws a real `InvalidMoveException` — `(0, 0)` is a given
   clue, unchangeable, exactly as it's been since long before this
   lesson.
3. `_dispatch`'s own `catch` block shows the real, existing `SnackBar`
   naming exactly why, then, per this lesson's own final Concept Unit,
   calls `setState(() => _shakeTrigger++)`.
4. That `setState` rebuilds the whole real tree below it, including
   `SudokuCellView` at `(0, 0)` — still `isSelected: true`, but now with
   a genuinely different real `shakeTrigger`. Its own `didUpdateWidget`
   fires, the real guard condition holds, and `_shakeController.forward
   (from: 0)` starts a real, 300-millisecond shake — `AnimatedBuilder`
   reruns its own `builder` many real times as the controller ticks,
   translating this one cell left and right while its own already-built
   `InkWell`/`AnimatedContainer` content, unread by that callback, never
   rebuilds at all.
5. Had the tap instead been a real, legal move — say, `5` at cell
   `(4, 4)`, this app's own real milestone puzzle's own naked single —
   `SudokuBoard.placeDigit` would have succeeded, `SudokuCellView` at
   `(4, 4)` would rebuild with a real, new `value`, and this lesson's
   own second Concept Unit would take over instead: a genuinely
   different `ValueKey`, a discarded and freshly rebuilt
   `TweenAnimationBuilder`, and a real, 200-millisecond pop from nothing
   to full size.
6. Had that same legal move also happened to be this real puzzle's own
   final empty cell, `GameSession.enterDigit` would additionally
   transition `status` to `GameStatus.completed`; `SudokuApp.build`
   would pass `visible: true` into `_CompletionBanner` for the first
   real time, its own `didUpdateWidget` guard would hold, and a real,
   400-millisecond elastic fade-and-scale "Solved!" flourish — this
   lesson's own third Concept Unit — would play, once, for real.

Four real, distinct animations, two real, different underlying
strategies (implicit, reacting to a value; explicit, reacting to an
event), one shared purpose in every single case: make a change a player
can actually *see happen*, not just infer from a static before and
after.

## Real, final verification

Every real Concept Unit's own code above was built incrementally and
verified together, in one real, final pass, per the Verification
Rule's Batching clause — re-running the full suite after each
individual Concept Unit would only repeat an identical check for no
new information.

Four real, throwaway labs (`verification/lesson-61/animation_labs_test.dart`)
ran first, isolated from the real project entirely — two real,
first-attempt failures surfaced and were fixed in place (a completion
check that needed one small pump past the exact animation duration; an
`AnimationController` disposed too late, via `addTearDown`, for a
ticker still genuinely active at the moment its own test body
returned) — full real narrative, every command, and every real output
saved in `verification/lesson-61/run-log.md`.

With every Concept Unit's own real code landed together, the first
real, full-project `flutter test` run surfaced one further real,
genuine regression: `cell_selection_test.dart` carried its own,
separate, duplicated copy of a `Container`-typed test helper, missed on
the first pass through `sudoku_board_view_test.dart`'s own identical
fix — found by the real, run failure itself, fixed the identical real
way, then confirmed, by a real, repo-wide search, that no third copy
existed anywhere else.

Final, clean, real results:

```
flutter analyze .
56 issues found. (ran in 6.0s)
```

Identical count and categories to this lesson's own pre-change
baseline — zero new issues.

```
flutter test
...
00:18 +58: All tests passed!
```

58 real test-file-level checks, up from 54: four new — a
number-placement pop-in test and a selected-cell-shake test, both in
`sudoku_board_view_test.dart`, plus two new tests in a new,
permanent `completion_banner_test.dart`, proving the real banner is
absent before completion, fades and scales in the instant a real
session genuinely completes, and shows at full opacity immediately,
with no flourish, when a session mounts already completed.

