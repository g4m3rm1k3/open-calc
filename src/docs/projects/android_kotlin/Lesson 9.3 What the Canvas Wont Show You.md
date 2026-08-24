# Lesson 9.3: What the Canvas Won't Show You

**What you will build.** This project draws something that isn't a
Material component for the first time: a real, permanent `GraphScreen`,
reachable from a real, new "Graph" button on the home screen, that
samples this project's own real `x×x` expression, converts every
sampled point into a real screen coordinate using this project's own
Cartesian-to-screen transform — made real and permanent at last — and
connects them into one continuous curve with Android's own real
`Canvas` drawing API. The
transferable problem underneath it: every framework built around
composing pre-made widgets (a `Button`, a `Text`, a `Column`) eventually
meets a shape no pre-made widget can express — and needs a real, lower-
level escape hatch for drawing arbitrary pixels directly, at the cost of
losing some of the very testability that made the higher-level widgets
easy to trust.

**What you need to know first.** Lesson 9.1's own `toScreenX`/
`toScreenY` (a Cartesian-to-screen coordinate transform, previously only
ever proven in a discarded throwaway lab) and its own `ScreenPoint` (a
screen coordinate as a real value). Lesson 9.2's own real, permanent
`Point`, `sample`, and `evaluateAt` — this project's own real pipeline
for turning a parsed expression into many real Cartesian points. Lesson
1.4's own Robolectric-based Compose UI testing
(`@RunWith(RobolectricTestRunner::class)`), and its own established,
standing limitation: Robolectric simulates Android's framework well
enough to test composition, state, and layout, but performs no genuine
GPU rendering. Lesson 4.1's own Jetpack Navigation
(`NavHost`/`composable`/`rememberNavController`).

## The pipeline, so far

```
Text → Tokenizer → Shunting-Yard → AST → Evaluator → Sampling → Screen Transform → Rendering
```

This lesson touches the last two stages — Screen Transform (made real,
not just proven in isolation) and Rendering (entirely new) — reusing
every stage before it completely unchanged. One concrete value, carried
through every stage this project has now built:

```
Text:            "x×x"
Tokenizer:       [x, ×, x]
Shunting-Yard:   [x, x, ×]
AST:             Node("×", Node("x"), Node("x"))
Evaluator:       evaluateAt(tree, 2.0) -> 4.0
Sampling:        [(-2.0,4.0), (-1.0,1.0), (0.0,0.0), (1.0,1.0), (2.0,4.0)]
Screen Transform: [(160,120), (180,180), (200,200), (220,180), (240,120)]
Rendering:       a real Path connecting those five screen points, drawn
                 by a real Canvas — the first pixels this project has
                 ever computed the position of for itself.
```

## Terms used in this lesson

- **Immediate-mode drawing** — a drawing model where a function call
  paints pixels directly, right when it's called, with nothing retained
  afterward describing what was drawn. It exists as the deliberate
  opposite of everything else this project's UI has used since Lesson
  1.2: a `Button` or `Text` composable describes *what should exist*,
  and Compose itself decides when and how to actually render it, keeping
  track of that description so it can update it later — immediate-mode
  drawing has no such description to keep; the instant `drawCircle`
  returns, Compose has already forgotten it was ever called, which is
  exactly why a graph's own curve has to be redrawn, from scratch, every
  single time this project's canvas needs to show it.
- **`DrawScope`** — the special receiver a `Canvas` composable's own
  drawing lambda runs with, giving that lambda access to real drawing
  operations (`drawCircle`, `drawPath`, `drawLine`) and real, live
  information about the surface being drawn to (its own real, current
  pixel `size`) that ordinary composable code never needs and never gets.
  It exists because drawing operations only make sense inside an actual
  drawing context — calling `drawCircle` from arbitrary code, with no
  real canvas to draw onto, would be meaningless.
- **`Offset`** — a real, immutable pair of pixel coordinates,
  `(x, y)`, used specifically to tell a `DrawScope` drawing call *where*
  on its own real surface to draw. It exists as `DrawScope`'s own native
  coordinate type, distinct from this project's own `ScreenPoint` (a
  plain `Int` pair this project defined for itself); an `Offset` uses
  real `Float`s, matching the precision Android's own real graphics
  system actually draws with.
- **`Path`** — a real, mutable object recording a *sequence of drawing
  instructions* — "start here," "draw a straight line to here," and so
  on — describing the outline of a shape without drawing anything itself
  until a separate, real drawing call is told to render it. It exists
  because connecting many points into one continuous line is a
  fundamentally different operation from drawing one shape at one
  location — a `Path` is what lets "visit these five points, in order,
  connected by straight lines" be built up once and then drawn as a
  single real operation.
- **`Stroke`** — a real value telling a drawing call to render a shape's
  own *outline* — a line of some real pixel width — instead of the
  default: filling the entire area the shape encloses. It exists because
  a graph's own curve is a line to look at, not a solid region to fill;
  without it, connecting this project's own sampled points into a closed
  shape would fill the space between them with solid color instead of
  tracing the curve itself.
- **`remember`** (reappearing) — a Compose function that computes a
  value once, the first time a composable runs, and returns that exact
  same value on every later recomposition instead of recomputing it. It
  exists so an expensive computation — sampling a real expression at a
  hundred real points, here — doesn't repeat itself every single time
  Compose decides to redraw a screen for an unrelated reason.
- **`data class`** (reappearing) — a class modifier telling the compiler
  to generate real `equals`, `hashCode`, `toString`, and `copy`
  implementations directly from the properties listed in its primary
  constructor.
- **`val`** (reappearing) — a keyword declaring a read-only reference:
  once assigned, it can never be reassigned.
- **`fun`** (reappearing) — the keyword introducing a function
  declaration.
- **`Float`** — a 32-bit floating-point numeric type, distinct from the
  64-bit `Double` this project's own math has already used for every
  real fractional value. It exists here
  because Android's own real graphics system — every `Offset`, every
  `Path` coordinate — is built on `Float`, not `Double`; a coordinate
  passed to a real drawing call has to be converted to this exact,
  narrower type before Android's own drawing code will accept it.
- **`Boolean`** (reappearing) — a type with exactly two possible values,
  `true` and `false`.
- **Arithmetic operators** `+`, `-`, `*`, `/` (reappearing) — the
  built-in operators for addition, subtraction, multiplication, and
  division.

## Objects and methods used

This lesson's own subject — turning this project's own already-sampled
points into a real, visible curve — is built from this project's own
new functions and composables, not from a single external class or
method, so it has no entry of its own here. Every real class or method
this lesson's new code actually calls is supporting cast, listed below
under one trailing heading.

### Everything else in the file, not this lesson's subject but still explained

- **`Canvas` (composable)**
  - *What it is:* A Compose UI composable providing a real, blank
    drawing surface, sized like any other composable by its own
    `Modifier`, whose contents are described by real, immediate-mode
    drawing calls instead of nested composables.
  - *Implementation:* `androidx.compose.foundation.Canvas(modifier:
    Modifier, onDraw: DrawScope.() -> Unit): Unit` — a real, public
    composable function taking a `Modifier` (sizing and positioning it
    like any other composable) and a lambda with `DrawScope` (full
    treatment in Terms, above) as its receiver, called by Compose's own
    rendering system whenever this surface actually needs to be drawn.
  - *Its use:* this lesson's own `GraphScreen` uses `Canvas` as the one
    real place this project draws anything that isn't a pre-built
    Material component.
  - *Type:* a public, top-level `@Composable` function.
  - *Responsibility:* claiming a real region of the screen, sized by its
    own `Modifier`, and invoking its own `onDraw` lambda, with a real
    `DrawScope`, every time that region needs to be rendered.
  - *Depends on:* a `Modifier` (sizing/positioning) and an `onDraw`
    lambda describing what to actually draw.
  - *Connects to:* called directly inside `GraphScreen`; its own
    `onDraw` lambda is where `size`, `drawPath`, and every other real
    `DrawScope` member this lesson uses actually get called.
  - *Shape:* a real, public escape hatch at the boundary between
    Compose's own declarative composition system and Android's own
    lower-level, immediate-mode 2D graphics system.
- **`DrawScope.drawCircle`**
  - *What it is:* A real `DrawScope` member function that draws one
    real circle.
  - *Implementation:*
    `androidx.compose.ui.graphics.drawscope.DrawScope.drawCircle(color:
    Color, radius: Float, center: Offset): Unit` (among other real
    overloads) — draws a real circle of the given `radius`, centered at
    the given `Offset`, filled with the given `Color` unless a `style`
    argument says otherwise.
  - *Its use:* this lesson's own first throwaway lab uses `drawCircle`
    as the simplest possible real drawing call, to prove `Canvas` and
    `DrawScope` work at all before anything more complex is attempted.
  - *Type:* an instance member function, callable only from inside a
    real `DrawScope` receiver.
  - *Responsibility:* drawing exactly one real circle, at exactly one
    real location, in exactly one real color, the instant it's called.
  - *Depends on:* a real `DrawScope` receiver (only available inside a
    `Canvas`'s own drawing lambda), a `Color`, a `radius`, and a `center`
    `Offset`.
  - *Connects to:* called directly inside a `Canvas`'s own `onDraw`
    lambda; has no return value and produces no lasting object — its
    only real effect is pixels changing on the drawing surface.
  - *Shape:* one of several real, interchangeable primitive drawing
    operations `DrawScope` provides — `drawCircle`, `drawLine`,
    `drawPath` (used later in this lesson), and others — each drawing
    one specific real shape.
- **`Offset`**
  - *What it is:* A real, immutable data type representing one 2D pixel
    location.
  - *Implementation:* `androidx.compose.ui.geometry.Offset(x: Float, y:
    Float)` — a real constructor taking two `Float`s.
  - *Its use:* `drawCircle`'s own `center` parameter requires one, to
    say exactly where its circle should be drawn.
  - *Type:* an immutable value class.
  - *Responsibility:* holding exactly one real 2D pixel location, as two
    `Float`s, for a drawing call to read.
  - *Depends on:* the two `Float` values given to its constructor.
  - *Connects to:* constructed at a `drawCircle` (or, later, `drawLine`)
    call site; read internally by whatever real drawing operation it's
    passed to.
  - *Shape:* `DrawScope`'s own native coordinate type — the type every
    real `DrawScope` drawing call actually expects, as opposed to this
    project's own `ScreenPoint`, which exists only inside this project's
    own domain code.
- **`Color`**
  - *What it is:* A real type representing one specific color.
  - *Implementation:* `androidx.compose.ui.graphics.Color` — already
    real, permanent code in this project, defining this project's own
    named theme colors; `Color.Blue` and `Color.Red` are real,
    pre-defined constant instances of it.
  - *Its use:* every real drawing call in this lesson takes a `Color`
    telling it what color to actually draw with.
  - *Type:* an immutable value class.
  - *Responsibility:* holding exactly one real color value for a drawing
    call, or a themed UI element, to read.
  - *Depends on:* nothing, for one of its own pre-defined constants like
    `Color.Blue`.
  - *Connects to:* passed directly into `drawCircle`/`drawPath` calls in
    this lesson, the same real type this project's own `Theme.kt`
    already uses for `MaterialTheme`'s own color scheme.
  - *Shape:* a small, shared value type reused identically by both
    Compose's own high-level theming system and its low-level
    `DrawScope` drawing calls.
- **`Path`**
  - *What it is:* A real, mutable, stateful object recording a sequence
    of drawing instructions.
  - *Implementation:* `androidx.compose.ui.graphics.Path()` — a real,
    public, no-argument constructor. Its real instance methods
    `moveTo(x: Float, y: Float)` and `lineTo(x: Float, y: Float)` each
    append one more real instruction — "start a new subpath here," or
    "draw a straight line from wherever the path currently is to here" —
    to what the `Path` remembers internally. `getBounds(): Rect` returns
    the real, smallest rectangle containing every point the path's own
    instructions have visited so far. `isEmpty: Boolean` reports whether
    any instruction has been added yet at all.
  - *Its use:* this lesson's own `buildGraphPath` calls `moveTo` once,
    for the first real screen point, then `lineTo` once per remaining
    point, building one real, continuous path connecting every sampled
    point in order.
  - *Type:* a concrete, constructible, mutable class.
  - *Responsibility:* accumulating a real, ordered sequence of drawing
    instructions and answering real questions about their combined
    shape (`getBounds`, `isEmpty`) without drawing anything itself.
  - *Depends on:* nothing to construct; each `moveTo`/`lineTo` call
    depends only on the two real `Float` coordinates given to it.
  - *Connects to:* built by `buildGraphPath`, from a real
    `List<ScreenPoint>`; its finished, real state is what
    `DrawScope.drawPath` (below) is later given to actually render.
  - *Shape:* a real, standalone data structure sitting between "a list
    of points" and "pixels on screen" — genuinely separate from both;
    building one requires no `DrawScope` at all, confirmed for real, this
    session, by a throwaway probe that called `Path()`, `moveTo`, and
    `lineTo` from a plain (non-Robolectric) JUnit test and hit a real,
    genuine `RuntimeException` ("Method moveTo in android.graphics.Path
    not mocked") — proof that `Path`, despite needing no live `DrawScope`
    to construct, still delegates to Android's own real, framework-backed
    `android.graphics.Path` underneath, and so still needs Robolectric
    (`@RunWith(RobolectricTestRunner::class)`) to run in a real test, the
    same requirement every other Compose UI construct this project has
    already needed to be genuinely testable at all.
- **`DrawScope.drawPath`**
  - *What it is:* A real `DrawScope` member function that draws an
    already-built `Path`.
  - *Implementation:*
    `androidx.compose.ui.graphics.drawscope.DrawScope.drawPath(path:
    Path, color: Color, style: DrawStyle = Fill): Unit` — renders every
    real instruction already recorded in `path`, in the given `color`,
    filling the enclosed area by default (`style = Fill`) unless a
    different `DrawStyle` — this lesson's own `Stroke` — is given
    instead.
  - *Its use:* `GraphScreen`'s own `Canvas` calls this exactly once per
    real draw, on the real `Path` `buildGraphPath` just constructed.
  - *Type:* an instance member function on `DrawScope`.
  - *Responsibility:* rendering one already-built `Path`'s worth of
    drawing instructions, in one real color, either filled or outlined
    depending on its own `style` argument.
  - *Depends on:* a real `DrawScope` receiver, a `Path` to render, a
    `Color`, and, optionally, a `DrawStyle`.
  - *Connects to:* called once inside `GraphScreen`'s own `Canvas`
    lambda, on `buildGraphPath`'s own real return value.
  - *Shape:* the one real point where everything this lesson built —
    sampling, the screen transform, and `Path`-building — actually
    becomes visible pixels, at least on a real device; this project's own
    current tooling cannot observe that this call even ran, a real,
    confirmed limitation explained in this lesson's own third unit.
- **`Stroke`**
  - *What it is:* A real, concrete `DrawStyle` telling a drawing call to
    render a shape's outline instead of filling its interior.
  - *Implementation:*
    `androidx.compose.ui.graphics.drawscope.Stroke(width: Float)` — a
    real, constructible class implementing the `DrawStyle` interface,
    its `width` parameter naming the real pixel thickness of the
    outline to draw; this lesson's own code always passes it explicitly
    (`4f`), never relying on whatever default the real constructor may
    or may not define.
  - *Its use:* `GraphScreen`'s own `drawPath` call passes
    `style = Stroke(width = 4f)`, so the sampled curve is drawn as a real
    4-pixel-wide line rather than a filled shape.
  - *Type:* a concrete, constructible class implementing `DrawStyle`.
  - *Responsibility:* telling a drawing call, on the one real occasion it
    needs to know, "outline this, at this real width" instead of "fill
    this."
  - *Depends on:* the `width` value given to its constructor.
  - *Connects to:* constructed at the `drawPath` call site; read
    internally by `drawPath` to decide how to actually render the given
    `Path`.
  - *Shape:* a small, real configuration value passed to a drawing call
    — the same general shape as any other named-parameter configuration
    object this project has already used (`ScreenPoint`, `Point`
    themselves, structurally).
- **`DrawScope.size`**
  - *What it is:* A real, read-only property on `DrawScope`, giving a
    drawing call access to the real, current pixel dimensions of the
    surface it's drawing onto.
  - *Implementation:* `val DrawScope.size: Size` — a real property
    returning a `Size` with real `width`/`height` `Float`s, reflecting
    the actual, current, real pixel dimensions `Canvas`'s own `Modifier`
    resolved to, known only once real layout has actually happened —
    never at compile time.
  - *Its use:* `GraphScreen`'s own `Canvas` reads `size.width`/
    `size.height` to compute a real screen origin — the exact center of
    whatever real space this graph is actually being drawn into —
    instead of a hard-coded guess.
  - *Type:* a real, read-only extension property on `DrawScope`.
  - *Responsibility:* reporting the real, current pixel dimensions of the
    surface currently being drawn to, correct for whatever real device or
    window this code actually runs on.
  - *Depends on:* real, already-completed layout — `size` cannot be read
    before Compose's own layout system has actually measured the
    `Canvas`.
  - *Connects to:* read inside `GraphScreen`'s own `Canvas` lambda; its
    real `width`/`height` values feed directly into this lesson's own
    real screen-transform call.
  - *Shape:* the one piece of genuinely dynamic, runtime-only information
    `DrawScope` provides — everything else this lesson draws is computed
    ahead of time and handed in.
- **`List<T>.first()`**
  - *What it is:* A Kotlin standard-library extension function
    returning a list's first element.
  - *Implementation:* `kotlin.collections.List<T>.first(): T` — returns
    the element at index `0`, throwing `NoSuchElementException` if the
    list is empty.
  - *Its use:* `buildGraphPath` calls this to get the one real point
    `moveTo` needs, before any `lineTo` call can make sense.
  - *Type:* an extension function on `List<T>`.
  - *Responsibility:* returning exactly the first element of a real,
    non-empty list, or failing loudly if there isn't one.
  - *Depends on:* the list it's called on.
  - *Connects to:* called on `buildGraphPath`'s own `screenPoints`
    parameter, guarded by an explicit `isEmpty()` check first so this
    call is never reached on a real empty list.
  - *Shape:* a small, standard, safe-when-guarded accessor — this
    project's own established pattern of checking a real precondition
    before calling something that would otherwise throw.
- **`List<T>.drop(n)`**
  - *What it is:* A Kotlin standard-library extension function
    returning a new list with the first `n` elements removed.
  - *Implementation:* `kotlin.collections.List<T>.drop(n: Int):
    List<T>` — returns a real, new list containing every element from
    index `n` onward, leaving the original list unmodified.
  - *Its use:* `buildGraphPath` calls `screenPoints.drop(1)` to get every
    real point *except* the first one already consumed by `moveTo`, so
    the following loop's own `lineTo` calls never repeat it.
  - *Type:* an extension function on `List<T>`.
  - *Responsibility:* producing a real, new list holding every element
    after the first `n`, with no effect on the original list.
  - *Depends on:* the list it's called on and the real `Int` count to
    drop.
  - *Connects to:* called on `screenPoints`; its own return value is
    what the following `for`-in loop iterates over.
  - *Shape:* a small, standard slicing operation — the same general
    shape as this project's own `until`/`map` combination for turning
    one real collection into a related one, without a hand-written
    index-based loop.
- **`Int.toFloat()`**
  - *What it is:* A Kotlin standard-library method converting an `Int`
    into a `Float`.
  - *Implementation:* `kotlin.Int.toFloat(): Float` — a real member
    function on `Int`, returning the same numeric value represented as a
    32-bit floating-point `Float` instead of a whole number.
  - *Its use:* `buildGraphPath` calls this on every real `ScreenPoint`'s
    own `Int` `x`/`y`, since `Path.moveTo`/`lineTo` require real
    `Float`s, not `Int`s.
  - *Type:* an instance (member) method on `Int`.
  - *Responsibility:* converting exactly one `Int` into exactly one
    `Float` representing the identical real numeric value, with no
    precision loss for any value this project's own real screen
    coordinates could ever actually reach.
  - *Depends on:* only the `Int` value it's called on.
  - *Connects to:* called inside `buildGraphPath`, immediately before
    each real `moveTo`/`lineTo` call.
  - *Shape:* the real conversion seam between this project's own
    `Int`-based `ScreenPoint` and Android's own `Float`-based drawing
    API — the same kind of boundary-crossing conversion `.toInt()`
    already handles, in the opposite direction, converting this
    project's own real `Double` math into a whole-number pixel
    coordinate in the first place.
- **`remember`**
  - *What it is:* A real Compose runtime function caching a computed
    value across recomposition.
  - *Implementation:* `androidx.compose.runtime.remember(calculation:
    () -> T): T` — on a composable's very first real composition, calls
    `calculation` once and stores its result; on every later
    recomposition of the same composable instance, returns that stored
    result directly, without calling `calculation` again.
  - *Its use:* `GraphScreen` wraps both `buildTree(toPostfix(tokenize(
    "x×x")))` and the resulting `sample(...)` call in `remember`, so
    parsing this project's own expression and sampling a hundred real
    points happens once per real screen visit, not on every
    recomposition.
  - *Type:* a top-level, generic Compose runtime function.
  - *Responsibility:* running an expensive real computation exactly once
    per composable instance, and handing back the identical stored
    result on every later recomposition of that same instance.
  - *Depends on:* the composable's own real position in the composition,
    tracked internally by Compose; and the `calculation` lambda to run
    the first time.
  - *Connects to:* called twice inside `GraphScreen`, each wrapping one
    real, otherwise-repeated computation.
  - *Shape:* a real, general-purpose caching primitive, reused here
    exactly as it already was for this project's own calculator state.
- **`Modifier.testTag`**
  - *What it is:* A real Compose UI modifier attaching a real, static
    identifier string to a composable, for tests to find it by.
  - *Implementation:* `androidx.compose.ui.platform.testTag(tag: String):
    Modifier` — a real extension function on `Modifier`.
  - *Its use:* `GraphScreen`'s own `Canvas` carries
    `.testTag("graphCanvas")`, giving a real test a way to find this
    project's own graph surface in the composition tree, the same real
    pattern this project's own keypad buttons have used since Lesson
    2.5.
  - *Type:* an extension function on `Modifier`.
  - *Responsibility:* attaching one real, static string identifier to
    whatever composable its modifier chain belongs to, for tests only —
    it changes nothing about what a real user actually sees.
  - *Depends on:* the `Modifier` chain it's called on, and the `tag`
    string given to it.
  - *Connects to:* called directly on `GraphScreen`'s own `Canvas`'s
    `Modifier`; read later by `onNodeWithTag("graphCanvas")` in this
    lesson's own real tests.
  - *Shape:* a small, test-only seam, invisible to a real user, the same
    role it has played in this project since it was first introduced.

---

## Concept Unit: Canvas and DrawScope

### The Problem

Everything this project has ever shown on screen has been a composition
of pre-built pieces: a `Button`, a `Text`, a `Column` arranging them.
None of those pieces can draw an arbitrary shape at an arbitrary
location — there is no `Button` for "a small filled circle at pixel
`(50, 50)`," because a circle at a chosen coordinate isn't a reusable,
nameable widget the way a button is. This project's own real sampling
already produces exactly this kind of arbitrary data: a real list of
points with no natural button to represent any of them.

Before reading on: if a UI framework's entire toolkit is built around
composing pre-made, reusable widgets, what would it take to add "draw
one specific circle at exactly this pixel location" as a genuinely new
capability, rather than just combining existing widgets differently?
Does drawing one circle at a chosen location need to be *remembered*
by the framework afterward, the way a `Button`'s own existence is, or
could it be forgotten immediately once drawn? If this project needed to
draw a hundred small shapes, one per sampled point, would writing a
hundred separate `Button`s be a reasonable way to do it?

### Introduce the Concept in Isolation

The following throwaway lab is a real, temporary composable, added
directly to this project's own real source tree — Compose's own
compiler plugin only attaches inside a real, Gradle-wired project, so
there is no standalone `kotlinc`-only sandbox for it, the same
adaptation of the Concept Isolation Rule this project has already used
for every Compose concept it has ever introduced:

```kotlin
@Composable
fun LabCanvasCircles() {
    Canvas(modifier = Modifier.fillMaxSize()) {
        drawCircle(color = Color.Red, radius = 20f, center = Offset(50f, 50f))
        drawCircle(color = Color.Blue, radius = 20f, center = Offset(150f, 50f))
    }
}
```

Compiled for real via `./gradlew :app:compileDebugKotlin`, and exercised
by a real, temporary Robolectric test:

```kotlin
@Test
fun canvasWithTwoRealCirclesComposesWithoutCrashing() {
    composeTestRule.setContent { LabCanvasCircles() }
    composeTestRule.waitForIdle()
}
```

Run for real:

```
BUILD SUCCESSFUL
```

This output proves `Canvas` and its own `drawCircle` really do compile
and compose successfully as real Compose code, inside this project's own
real Gradle project, with two real, independent drawing calls sitting
directly inside one composable — something no earlier lesson's code has
ever done. It does *not* prove either circle actually appeared as real,
visible pixels anywhere; that distinction — and exactly how far this
project's own tooling can and can't see into it — is this lesson's own
third unit's real subject. This drawing model, where a function call
paints immediately and nothing is kept afterward describing what was
drawn, is called **immediate-mode drawing**.

### Discard the Throwaway Example

`LabCanvasCircles` and its own temporary test are both deleted. Neither
appears in the real project. `Canvas`'s own real, permanent use in this
project is built in this lesson's own third unit, once there's a real
`Path` — this lesson's next unit's own subject — worth actually drawing.

### Mechanical Walkthrough

Every distinct syntactic element in the lab above, in the order it
appears:

- `@Composable fun LabCanvasCircles()` — a composable function
  declaration, the same real shape every composable in this project has
  ever used, taking no parameters.
- `Canvas(modifier = Modifier.fillMaxSize()) { ... }` — calls the
  standard-library **`Canvas`** composable (full treatment above), with
  a `Modifier` (already established, reappearing) sizing it to fill
  all available space, and a trailing lambda — this call's own
  **`DrawScope`** (full treatment in Terms, above) receiver — containing
  the real drawing calls.
- `drawCircle(color = Color.Red, radius = 20f, center = Offset(50f,
  50f))` — calls the real **`DrawScope.drawCircle`** (full treatment
  above), with a **`Color`** (full treatment above) constant, a real
  `Float` literal `radius`, and a real **`Offset`** (full treatment
  above) built from two more `Float` literals — `20f`/`50f`, the
  trailing `f` marking each literal as a real **`Float`** (full
  treatment in Terms, above), not the `Double` this project's own
  arithmetic math has always used.
- `drawCircle(color = Color.Blue, radius = 20f, center = Offset(150f,
  50f))` — the identical real call, at a different real `Offset`,
  proving two independent, immediate-mode drawing calls really can
  coexist inside one `DrawScope` lambda.

### CS Lens

This is **immediate-mode drawing**, the deliberate opposite of the
**retained-mode** (or declarative) model every other part of this
project's UI has ever used — where a composable *describes* what should
exist, and the framework itself retains that description to decide when
and how to actually render or re-render it.

```
Also recognized in: HTML5 canvas's own 2D drawing context, raw
OpenGL/Vulkan draw calls, PostScript and PDF's own page-
description operators, a plotter drawing a physical line with a
real pen
```

Every one of these systems shares the same real tradeoff `Canvas` makes
here: enormous flexibility to draw literally anything, at the real cost
of the framework having nothing persistent left to inspect, replay, or
test once a drawing call has already run.

### SE Lens

The design choice worth naming here is `Canvas` existing at all,
alongside `Button`/`Text`/`Column` and everything else this project's UI
has ever used. The alternative — expressing a graph's own curve as some
composition of existing, pre-built widgets — was never seriously
possible: a curve made of a hundred sampled points has no natural
correspondence to any composable this project, or Compose itself, has
ever defined; forcing it into one would mean either a hundred separate,
absurd one-pixel `Box`es, or abandoning the idea of drawing a real curve
at all. `Canvas` is Compose's own deliberate escape hatch for exactly
this case — real, low-level, immediate-mode drawing, available the
moment declarative composition genuinely can't express what's needed.
The real cost, worth stating honestly and explored fully in this
lesson's own third unit: everything drawn through `Canvas` trades away
Compose's own built-in retained state and, with it, a real measure of
the testability this project's other UI code has always had.

### Commands Needed

```
./gradlew :app:compileDebugKotlin
```

The same real Gradle task this project has already used to compile every
Compose concept's own isolated lab — `Canvas`/`DrawScope` only compile
through the real Compose compiler plugin, attached only inside this
actual Gradle-wired project.

```
./gradlew :app:testDebugUnitTest --tests "com.example.calculator.LabCanvasPath93Test"
```

Runs only this lab's own real, temporary test class, via this project's
already-established Robolectric setup.

### Run It

```
BUILD SUCCESSFUL
```

Real, saved in `verification/9.3/lab1_2_canvas_path.kt`,
`verification/9.3/lab1_2_canvas_path_test.kt`, and
`verification/9.3/lab1_2_output.txt`.

### Connect the Pieces

This project can now draw an arbitrary shape at an arbitrary pixel
location — real progress past "only pre-built widgets," but still only
isolated dots, unconnected to each other or to any of this project's own
real sampled data. The next unit is what actually connects points
together.

---

## Concept Unit: A Path That Connects Points

### The Problem

`drawCircle` draws one isolated dot per call — useful for proving
`Canvas` works, useless for a graph. A curve needs many real points
connected, in order, by real lines between them, drawn as one continuous
shape rather than a scatter of unconnected marks. Nothing built so far
can turn a real list of points into one connected line.

Before reading on: if you needed to connect five real points with
straight lines, in order, would you draw four separate lines, each
independently, or is there a way to describe the whole connected shape
as one single sequence of instructions? Does the very first point in
such a sequence need the same kind of instruction as every point after
it, or something different — is "start here" the same operation as
"draw a line here from wherever you already are"? If the real list of
points to connect were empty, what would a sensible connected shape
even look like?

### Introduce the Concept in Isolation

The following throwaway lab, added to the same real, temporary file as
the last unit's lab, defines a real function turning a list of points
into one real, connected `Path`:

```kotlin
data class LabPoint(val x: Float, val y: Float)

fun labBuildPath(points: List<LabPoint>): Path {
    val path = Path()
    if (points.isEmpty()) {
        return path
    }
    path.moveTo(points.first().x, points.first().y)
    for (point in points.drop(1)) {
        path.lineTo(point.x, point.y)
    }
    return path
}
```

Exercised by two real, temporary Robolectric tests:

```kotlin
@Test
fun buildingAPathFromThreeRealPointsProducesTheCorrectRealBounds() {
    // Arrange
    val points = listOf(LabPoint(10f, 120f), LabPoint(200f, 40f), LabPoint(300f, 300f))

    // Act
    val path = labBuildPath(points)
    val bounds = path.getBounds()

    // Assert
    assertEquals(10f, bounds.left, 0f)
    assertEquals(40f, bounds.top, 0f)
    assertEquals(300f, bounds.right, 0f)
    assertEquals(300f, bounds.bottom, 0f)
}

@Test
fun buildingAPathFromNoPointsProducesARealEmptyPath() {
    // Arrange
    val points = emptyList<LabPoint>()

    // Act
    val path = labBuildPath(points)

    // Assert
    assertEquals(true, path.isEmpty)
}
```

Run for real:

```
BUILD SUCCESSFUL
```

This output proves two real, distinct things. First, `path.getBounds()`
— a real, inspectable rectangle — exactly matches the true minimum and
maximum `x`/`y` across all three real input points (`left=10`, the
smallest `x`; `top=40`, the smallest `y`; `right=300`/`bottom=300`, the
largest of each), confirming `moveTo`/`lineTo` really did record every
real point's own location, not just however many the path happened to
retain. Second, the empty-list case returns a real, genuinely empty
`Path` (`isEmpty` is `true`) instead of throwing — proven directly,
rather than assumed, by the explicit `if (points.isEmpty())` guard being
checked before `points.first()` is ever called. This is called building
a **`Path`** (full treatment in Objects and methods, above) —
specifically, one connected, open path (never closed back to its own
start), the real shape a graph's own curve needs.

### Discard the Throwaway Example

`LabPoint` and `labBuildPath`, along with both real tests exercising
them, are deleted. A real, permanent version — operating on this
project's own real `ScreenPoint`, not a throwaway lookalike — is added
next.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition; `ScreenPoint` reuses the same shape Lesson
  9.1's own discarded throwaway lab already proved, this time built to
  stay as real, permanent project code.
- **Files affected:**
  `app/src/main/java/com/example/calculator/Graphing.kt`.
- **Change type:** add.
- **Location:** directly after the existing `sample` function, in the
  same file.
- **Dependencies:** the real `androidx.compose.ui.graphics.Path` type —
  already on this project's classpath transitively (confirmed for real
  this session via `./gradlew :app:dependencies --configuration
  debugRuntimeClasspath`, which showed `androidx.compose.ui:
  ui-graphics:1.6.8` already resolved through the existing Compose BOM),
  no new Gradle dependency needed.

### The New Code

```kotlin
data class ScreenPoint(val x: Int, val y: Int)

fun buildGraphPath(screenPoints: List<ScreenPoint>): Path {
    val path = Path()
    if (screenPoints.isEmpty()) {
        return path
    }
    path.moveTo(screenPoints.first().x.toFloat(), screenPoints.first().y.toFloat())
    for (screenPoint in screenPoints.drop(1)) {
        path.lineTo(screenPoint.x.toFloat(), screenPoint.y.toFloat())
    }
    return path
}
```

### The Updated Project

`Graphing.kt`, with `sample` unchanged above it and `ScreenPoint`/
`buildGraphPath` added directly after:

```kotlin
 1  package com.example.calculator
 2
 3  import androidx.compose.ui.graphics.Path
 4
 5  data class Point(val x: Double, val y: Double)
 6
 7  fun sample(f: (Double) -> Double, xMin: Double, xMax: Double, sampleCount: Int): List<Point> {
 8      val step = (xMax - xMin) / (sampleCount - 1)
 9      return (0 until sampleCount).map { i ->
10          val x = xMin + i * step
11          Point(x, f(x))
12      }
13  }
14
15  data class ScreenPoint(val x: Int, val y: Int)  // ← new
16
17  fun buildGraphPath(screenPoints: List<ScreenPoint>): Path {  // ← new
18      val path = Path()
19      if (screenPoints.isEmpty()) {
20          return path
21      }
22      path.moveTo(screenPoints.first().x.toFloat(), screenPoints.first().y.toFloat())
23      for (screenPoint in screenPoints.drop(1)) {
24          path.lineTo(screenPoint.x.toFloat(), screenPoint.y.toFloat())
25      }
26      return path
27  }
```

`Point`/`sample` (lines 5–13) are completely untouched — this project's
own real sampling still works exactly as it did. `ScreenPoint` (line 15)
is the real, permanent form of a type this project has already proven
correct once, in an earlier discarded throwaway lab; `buildGraphPath`
(lines 17–27) is genuinely new, real code — the identical real logic
this unit's own lab already proved, now operating on this project's own
real `ScreenPoint` instead of the discarded `LabPoint`.

### Mechanical Walkthrough

Beyond what the last unit's own lab already fully explained (the
`Path()` construction, the `isEmpty()` guard, `moveTo`/`lineTo`, `for`-in,
`.drop(1)`) — every element genuinely different in this real version:

- `data class ScreenPoint(val x: Int, val y: Int)` — a **`data class`**
  (full treatment in Terms, above) holding two **`val`**-declared,
  read-only **`Int`** properties — `Int`, not `Float`, because a real
  screen coordinate is this project's own whole-number pixel address,
  the exact type this project's own screen-transform math already
  produces.
- `fun buildGraphPath(screenPoints: List<ScreenPoint>): Path` — takes a
  real `List<ScreenPoint>`, this project's own type, not a generic
  `LabPoint`; returns a real **`Path`** (full treatment above).
- `screenPoints.first().x.toFloat()` and `screenPoints.first().y.
  toFloat()` — each reads a real `Int` property off the first real
  `ScreenPoint`, then calls **`Int.toFloat()`** (full treatment above)
  to convert it into the `Float` `moveTo` actually requires — a real
  conversion the throwaway lab's own `LabPoint` never needed, since it
  already stored `Float`s directly.
- `screenPoint.x.toFloat()` and `screenPoint.y.toFloat()` — the
  identical real conversion, applied inside the loop to every remaining
  real `ScreenPoint`.

### CS Lens

This is a **`Path`** (full treatment in Objects and methods, above) —
concretely, a real instance of the general CS idea of a **command
sequence**: a real, ordered list of instructions describing how to
produce something, kept separate from whatever eventually executes it.

```
Also recognized in: SVG's own <path d="M10 10 L20 20"> attribute
syntax, PostScript and PDF's own path-construction operators,
vector font glyph outlines, turtle graphics' own forward/turn
instruction sequences
```

Every one of these separates *describing* a shape from *rendering* it,
the same real separation `buildGraphPath` keeps here — it never draws
anything itself, only records what a later, separate drawing call should
do.

### SE Lens

The design choice worth naming here is `buildGraphPath` taking a plain
`List<ScreenPoint>` and returning a plain `Path`, with no `DrawScope`
anywhere in its own signature. The alternative — writing this same logic
directly inside a `Canvas`'s own drawing lambda, where a real `DrawScope`
is already available — would have worked, and would have needed one
fewer real function. It was deliberately not chosen: a function that
needs a live `DrawScope` to even be called can only ever be tested by
actually composing a real `Canvas`, which this unit's own lab already
proved is possible but limited; a function that takes and returns plain
data can be tested directly, with exact real assertions
(`path.getBounds()`), with no `Canvas` involved at all — exactly the
separation this unit's own real, passing tests already depend on. The
real cost: `buildGraphPath`'s own real caller, inside `GraphScreen`,
still has to do the small extra work of actually calling `drawPath` on
its result — worth it here specifically because it keeps the one
genuinely hard-to-test part of this project's own graphing feature as
small as it can possibly be.

### Commands Needed

```
./gradlew :app:testDebugUnitTest --tests "com.example.calculator.LabCanvasPath93Test"
```

The same real command already covered in this lesson's first unit;
`buildingAPathFromThreeRealPointsProducesTheCorrectRealBounds` and
`buildingAPathFromNoPointsProducesARealEmptyPath` are two of the three
real tests it runs.

### Run It

```
BUILD SUCCESSFUL
```

Real, saved in `verification/9.3/lab1_2_output.txt`.

Against the real, now-extended project, two new, real, permanent tests
in the new `GraphPathTest.kt` confirm `buildGraphPath` directly:
`buildGraphPathFromRealScreenPointsProducesAPathWithTheCorrectRealBounds`
(the identical real bounds assertion this unit's own lab already
proved, now against real `ScreenPoint`s) and
`buildGraphPathFromNoScreenPointsProducesARealEmptyPath` — both real,
passing, and included in this lesson's own final, complete test run,
shown once, in full, at the end of this lesson's own third and last
unit. Real, saved in `verification/9.3/step3_full_suite.txt` and
`verification/9.3/step2_3_Graphing.kt`.

### Connect the Pieces

This project can now turn any real list of screen points into one real,
connected `Path` — but nothing yet supplies that list from this
project's own real, sampled data, and nothing yet draws the result
anywhere real. The next unit closes both gaps at once.

---

## Concept Unit: Rendering This Project's Own Real Graph

### The Problem

Everything this lesson needs now exists, separately: `Canvas` can draw;
`buildGraphPath` can connect points; this project's own real
`toScreenX`/`toScreenY` formula can convert a Cartesian point into a
screen one, proven correct once already, but only ever in a discarded
lab, never real; this project's own real `sample`/`evaluateAt` can
produce real Cartesian points from this project's own real expression
pipeline. Nothing connects them into one real screen a user could
actually navigate to and see — and one genuinely new question sits in
the middle of connecting them: that transform formula needed an
`originX`/`originY` to center itself on, chosen by hand, arbitrarily,
for its own earlier, throwaway proof. A real screen has no such
arbitrary choice available — it has only whatever real pixel dimensions
it actually, currently occupies.

Before reading on: if a graph should always appear centered on whatever
real screen it's drawn into, regardless of that screen's actual size,
where would the real origin for this project's own transform need to
come from — a fixed number chosen ahead of time, or something read at the
exact moment drawing happens? Given `remember` already caches an
expensive computation across recomposition, would sampling a hundred
points need to be wrapped in `remember` even if it were cheap enough to
compute instantly on every single recomposition? If this project's own
existing Robolectric tests can prove a `Canvas` composes without
crashing, does that same proof also confirm any particular real color or
shape actually got drawn inside it?

### Introduce the Concept in Isolation

The following throwaway lab, real and temporary, investigates the one
genuinely new piece: reading a `Canvas`'s own real, dynamic `size` from
inside its drawing lambda, and drawing with a real `Stroke`:

```kotlin
val labLastCanvasWidth = mutableStateOf(-1f)
val labLastCanvasHeight = mutableStateOf(-1f)

@Composable
fun LabDynamicSizeCanvas() {
    Canvas(modifier = Modifier.fillMaxSize().testTag("labCanvas")) {
        labLastCanvasWidth.value = size.width
        labLastCanvasHeight.value = size.height
        val stroke = Stroke(width = 8f)
        drawCircle(color = Color.Magenta, radius = 20f, center = Offset(size.width / 2, size.height / 2), style = stroke)
    }
}
```

Exercised by two real, temporary Robolectric tests, each rendering this
composable inside a real, precisely-sized `200.dp x 100.dp` box:

```kotlin
@Test
fun drawScopesOwnBlockDoesNotObservablyRunUnderThisProjectsRobolectricSetup() {
    composeTestRule.setContent { SizedLabWrapper() }
    composeTestRule.waitForIdle()
    println("labLastCanvasWidth = ${labLastCanvasWidth.value}")
    println("labLastCanvasHeight = ${labLastCanvasHeight.value}")
    // Real, confirmed finding: labLastCanvasWidth/Height stay at their initial -1f,
    // never updated by DrawScope's own draw block, even though LabDynamicSizeCanvas
    // really is present, composed, and laid out in a real 200dp x 100dp box.
    assertEquals(-1f, labLastCanvasWidth.value, 0f)
    assertEquals(-1f, labLastCanvasHeight.value, 0f)
}

@Test
fun canvasStillHasARealCorrectLayoutSizeEvenThoughDrawScopeIsUnobservable() {
    composeTestRule.setContent { SizedLabWrapper() }
    composeTestRule.onNodeWithTag("labCanvas")
        .assertWidthIsEqualTo(200.dp)
        .assertHeightIsEqualTo(100.dp)
}
```

Run for real:

```
BUILD SUCCESSFUL
```

Both tests pass — and together they prove something genuinely
surprising, not assumed ahead of time. The second test proves this
project's own real `Canvas` gets the real, correct layout size its own
surrounding box specifies — `200dp` by `100dp`, exactly. The first test
proves that despite that, `labLastCanvasWidth`/`labLastCanvasHeight` —
written to only from *inside* the real drawing lambda, reading `size`
directly — never change from their initial `-1f`, meaning the real
drawing lambda itself never observably ran under this project's current
Robolectric setup, at all, not merely that its pixel output can't be
inspected. Two further real, genuine attempts to get past this were made
before accepting it: `@GraphicsMode(GraphicsMode.Mode.NATIVE)` made no
real difference, and `composeTestRule.onRoot().captureToImage()` (the
documented Compose-testing API for forcing a real capture) hung and
timed out rather than succeeding. This sharpens this project's own
already-standing Robolectric limitation into something more precise:
**placement — composition, layout, real size — is provable; rendering —
whether the drawing lambda's own code actually ran, and what it
produced — is not**, in this project's current tooling.

### Discard the Throwaway Example

`labLastCanvasWidth`, `labLastCanvasHeight`, `LabDynamicSizeCanvas`, and
both real tests exercising it are deleted. This project's own real
`GraphScreen`, built next, uses `size` the same real way, without the
extra state properties this lab needed only to make the finding above
observable at all.

### Project Change

- **Reference Source:** No reference counterpart — `toScreenX`/
  `toScreenY` are a from-scratch promotion of this project's own
  already-proven, previously-discarded formulas to real, permanent code;
  `toScreen`/`toScreenPoints`/`GraphScreen` are from-scratch additions
  with no external reference.
- **Files affected:**
  `app/src/main/java/com/example/calculator/Graphing.kt` (adds
  `toScreenX`, `toScreenY`, `toScreen`, `toScreenPoints`) and
  `app/src/main/java/com/example/calculator/MainActivity.kt` (adds
  `GraphScreen`; modifies `HomeScreen` and `CalculatorApp`).
- **Change type:** add (all of `Graphing.kt`'s new functions and
  `GraphScreen`) and replace (`HomeScreen`'s own parameter list and
  body; `CalculatorApp`'s own `NavHost` content).
- **Location:** `Graphing.kt`'s new functions are added directly after
  `buildGraphPath`. `MainActivity.kt`'s `HomeScreen` gains a new
  `onGraphSelected: () -> Unit` parameter and a second `CalculatorButton`
  call; `GraphScreen` is added as a new composable directly after it;
  `CalculatorApp`'s own `NavHost` block gains a new `composable("graph")`
  entry and passes a new `onGraphSelected` lambda into `HomeScreen`.
- **Dependencies:** this project's own real `sample`, `evaluateAt`,
  `tokenize`, `toPostfix`, `buildTree`, and `buildGraphPath` — all
  already real, permanent code.

### The New Code

```kotlin
fun toScreenX(x: Double, originX: Int, scale: Double): Int =
    (originX + x * scale).toInt()

fun toScreenY(y: Double, originY: Int, scale: Double): Int =
    (originY - y * scale).toInt()

fun toScreen(point: Point, originX: Int, originY: Int, scale: Double): ScreenPoint =
    ScreenPoint(toScreenX(point.x, originX, scale), toScreenY(point.y, originY, scale))

fun toScreenPoints(points: List<Point>, originX: Int, originY: Int, scale: Double): List<ScreenPoint> =
    points.map { point -> toScreen(point, originX, originY, scale) }
```

With all four of those real functions now available, the second piece
of new code is the real, permanent screen that actually calls them:

```kotlin
@Composable
fun GraphScreen() {
    val tree = remember { buildTree(toPostfix(tokenize("x×x"))) }
    val points = remember { sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100) }
    Canvas(modifier = Modifier.fillMaxSize().testTag("graphCanvas")) {
        val originX = (size.width / 2).toInt()
        val originY = (size.height / 2).toInt()
        val screenPoints = toScreenPoints(points, originX, originY, 20.0)
        drawPath(buildGraphPath(screenPoints), color = Color.Blue, style = Stroke(width = 4f))
    }
}
```

### The Updated Project

`Graphing.kt`, with `buildGraphPath` unchanged above it and this unit's
four new functions added directly after:

```kotlin
15  data class ScreenPoint(val x: Int, val y: Int)
16
17  fun buildGraphPath(screenPoints: List<ScreenPoint>): Path {
18      val path = Path()
19      if (screenPoints.isEmpty()) {
20          return path
21      }
22      path.moveTo(screenPoints.first().x.toFloat(), screenPoints.first().y.toFloat())
23      for (screenPoint in screenPoints.drop(1)) {
24          path.lineTo(screenPoint.x.toFloat(), screenPoint.y.toFloat())
25      }
26      return path
27  }
28
29  fun toScreenX(x: Double, originX: Int, scale: Double): Int =  // ← new
30      (originX + x * scale).toInt()
31
32  fun toScreenY(y: Double, originY: Int, scale: Double): Int =  // ← new
33      (originY - y * scale).toInt()
34
35  fun toScreen(point: Point, originX: Int, originY: Int, scale: Double): ScreenPoint =  // ← new
36      ScreenPoint(toScreenX(point.x, originX, scale), toScreenY(point.y, originY, scale))
37
38  fun toScreenPoints(points: List<Point>, originX: Int, originY: Int, scale: Double): List<ScreenPoint> =  // ← new
39      points.map { point -> toScreen(point, originX, originY, scale) }
```

`toScreenX`/`toScreenY` (lines 29–33) are exactly this project's own
already-proven formulas, unchanged, now real for the first time.
`toScreen` (lines 35–36) is new: it combines both axes into one real
call, taking a real `Point` and returning a real `ScreenPoint` —
precisely the convenience this project's own earlier design reasoning
had already named as a likely, deliberately-deferred future refinement,
built now that a real caller genuinely needs it.
`toScreenPoints` (lines 38–39) applies `toScreen` across an entire real
list at once, the exact shape `GraphScreen` itself needs.

`MainActivity.kt`, with `HomeScreen` and `CalculatorApp` updated and
`GraphScreen` added between them:

```kotlin
 90  @Composable
 91  fun HomeScreen(onModeSelected: (String) -> Unit, onGraphSelected: () -> Unit) {  // ← changed
 92      Column(
 93          modifier = Modifier.fillMaxWidth().padding(16.dp),
 94          verticalArrangement = Arrangement.spacedBy(8.dp),
 95          horizontalAlignment = Alignment.CenterHorizontally
 96      ) {
 97          Text(text = "Choose a Calculator", style = MaterialTheme.typography.displayLarge)
 98          CalculatorButton(label = "Basic Calculator", onClick = { onModeSelected("Basic") })
 99          CalculatorButton(label = "Graph", onClick = onGraphSelected)  // ← new
100      }
101  }
102
103  @Composable
104  fun GraphScreen() {  // ← new
105      val tree = remember { buildTree(toPostfix(tokenize("x×x"))) }
106      val points = remember { sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100) }
107      Canvas(modifier = Modifier.fillMaxSize().testTag("graphCanvas")) {
108          val originX = (size.width / 2).toInt()
109          val originY = (size.height / 2).toInt()
110          val screenPoints = toScreenPoints(points, originX, originY, 20.0)
111          drawPath(buildGraphPath(screenPoints), color = Color.Blue, style = Stroke(width = 4f))
112      }
113  }
114
115  @Composable
116  fun CalculatorApp(navController: NavHostController = rememberNavController()) {
117      NavHost(navController = navController, startDestination = "home") {
118          composable("home") {
119              HomeScreen(
120                  onModeSelected = { mode -> navController.navigate("calculator/$mode") },
121                  onGraphSelected = { navController.navigate("graph") }  // ← new
122              )
123          }
124          composable(
125              route = "calculator/{mode}",
126              arguments = listOf(navArgument("mode") { type = NavType.StringType })
127          ) { backStackEntry ->
128              val mode = backStackEntry.arguments?.getString("mode") ?: "Basic"
129              CalculatorScreen(mode = mode)
130          }
131          composable("graph") {  // ← new
132              GraphScreen()
133          }
134      }
135  }
```

`HomeScreen` (lines 90–101) now takes a second real callback,
`onGraphSelected`, and renders a second real `CalculatorButton`, "Graph"
— the existing "Basic Calculator" button, its own `onClick`, and every
other line are otherwise completely unchanged. `GraphScreen` (lines
103–113) is genuinely new: two `remember`-cached values (this project's
own real parsed tree, then a hundred real sampled points from it), and a
real `Canvas` reading its own real `size` to center this project's own
transform on whatever real space it's actually drawn into, converting
every sampled point and drawing the real, connected result.
`CalculatorApp` (lines 115–135) passes the new `onGraphSelected` lambda
into `HomeScreen`, navigating to a new, literal `"graph"` route, and
registers that route against `GraphScreen` — the same real
`NavHost`/`composable` shape this project's `"calculator/{mode}"` route
already uses, needing no arguments this time since `GraphScreen` takes
none.

### Mechanical Walkthrough

Every distinct syntactic element in this unit's own New Code, in the
order it appears:

- `fun toScreenX(x: Double, originX: Int, scale: Double): Int =
  (originX + x * scale).toInt()` — an expression-body function, its
  full logic already explained in this project's own earlier,
  now-discarded proof of this exact formula: it scales `x` by `scale`
  using the `*` operator, shifts the result by `originX` using `+`, and
  truncates the resulting `Double` to a whole-number `Int` pixel
  coordinate.
- `fun toScreenY(y: Double, originY: Int, scale: Double): Int =
  (originY - y * scale).toInt()` — the identical real shape, with `-` in
  place of `+`, the one sign flip that inverts a Cartesian `y` (which
  increases upward) into a screen `y` (which increases downward).
- `fun toScreen(point: Point, originX: Int, originY: Int, scale:
  Double): ScreenPoint = ScreenPoint(toScreenX(point.x, originX, scale),
  toScreenY(point.y, originY, scale))` — genuinely new: reads a real
  `Point`'s own `x`/`y` properties, calls `toScreenX`/`toScreenY` on
  each, and constructs one real `ScreenPoint` from both results,
  combining what were previously two separate calls into one.
- `fun toScreenPoints(points: List<Point>, originX: Int, originY: Int,
  scale: Double): List<ScreenPoint> = points.map { point -> toScreen(
  point, originX, originY, scale) }` — calls the standard-library
  `List<T>.map` (already fully treated in this project's own earlier
  sampling work) with a lambda calling `toScreen` once per real `Point`,
  turning an entire real list of Cartesian points into a real list of
  screen points in one call.
- `@Composable fun GraphScreen()` — a composable function declaration
  taking no parameters, the same real shape every composable in this
  project has ever used.
- `val tree = remember { buildTree(toPostfix(tokenize("x×x"))) }` —
  **`remember`** (full treatment in Objects and methods, above) wraps
  this project's own real, already-established parsing pipeline —
  `tokenize`, then `toPostfix`, then `buildTree`, each already fully
  explained in this project's own earlier work — so the real text
  `"x×x"` is parsed into a real tree exactly once per screen visit, not
  once per recomposition.
- `val points = remember { sample({ x -> evaluateAt(tree, x) }, -5.0,
  5.0, 100) }` — a second, separate `remember` call, wrapping this
  project's own real `sample` function (already fully explained) with a
  lambda calling this project's own real `evaluateAt` (already fully
  explained) on the just-parsed `tree`; the literal arguments `-5.0`,
  `5.0`, and `100` choose this call's own real range and sample count —
  a hundred real points between `x = -5.0` and `x = 5.0`.
- `Canvas(modifier = Modifier.fillMaxSize().testTag("graphCanvas")) {
  ... }` — calls the standard-library `Canvas` (full treatment above)
  with a `Modifier` chain: `fillMaxSize()` (already established) sizes
  it to fill all available space, and `.testTag("graphCanvas")` (full
  treatment above) attaches this real screen's own test-only identifier.
- `val originX = (size.width / 2).toInt()` — reads the real `DrawScope.
  size` property (full treatment above) for its own real `width`,
  divides it by the literal `2` using `/`, and calls `Int.toFloat()`'s
  own counterpart, a real `Float`-to-`Int` conversion, to get a real,
  whole-number horizontal origin centered on whatever real width this
  `Canvas` actually has.
- `val originY = (size.height / 2).toInt()` — the identical real
  operation on `size`'s own real `height`, producing a real, centered
  vertical origin.
- `val screenPoints = toScreenPoints(points, originX, originY, 20.0)` —
  calls this unit's own `toScreenPoints`, converting all hundred real
  sampled `Point`s into real `ScreenPoint`s in one call, using the real,
  just-computed origin and a literal scale of `20.0` pixels per
  Cartesian unit.
- `drawPath(buildGraphPath(screenPoints), color = Color.Blue, style =
  Stroke(width = 4f))` — calls **`DrawScope.drawPath`** (full treatment
  above) on the real `Path` this lesson's own second unit's
  `buildGraphPath` (full treatment in that unit's own Mechanical
  Walkthrough) builds from `screenPoints`, with a real **`Color`** (full
  treatment above) constant and a real **`Stroke`** (full treatment
  above), telling this one real drawing call to outline the path in
  blue, four real pixels wide, rather than filling the shape it
  encloses.

### CS Lens

This whole unit is a real, working instance of a **rendering pipeline**
— a chain of stages, each consuming the previous stage's real output and
producing real input for the next, ending in visible pixels: parse, then
sample, then transform, then connect, then draw.

```
Also recognized in: a 3D game engine's own model-to-screen
pipeline, a GIS/mapping application projecting real-world
coordinates onto map tiles, a PDF renderer turning page-
description commands into real pixels, a data visualization
library turning a spreadsheet's own numbers into a chart
```

Every one of these keeps the exact same real shape this project's own
pipeline now has: each stage stays ignorant of every stage beyond the
next one it directly feeds, which is what let this project build,
prove, and test `sample`, the screen transform, and `buildGraphPath`
completely independently, only meeting each other for the first time
inside `GraphScreen` itself.

### SE Lens

The design choice worth naming here is computing `originX`/`originY`
from `Canvas`'s own real, dynamic `size`, read fresh inside the drawing
lambda, rather than a fixed number chosen ahead of time the way Lesson
9.1's own lab did. The alternative — a hard-coded origin, matching that
lab's own `200`/`200` — was rejected because a real screen's own actual
pixel dimensions are never known until real layout actually happens, and
genuinely differ across real devices; a fixed origin would center this
project's own graph correctly on exactly one specific screen size and
nowhere else. The real cost: this project's own screen-transform math
can now only be exercised, end to end, from inside a real `Canvas`'s own
drawing lambda — which this lesson's own third unit just proved, for
real, is exactly the one part of this project's current tooling that
can't observably confirm ran at all. This is why `toScreenPoints` and
`buildGraphPath` were both kept as plain, `DrawScope`-free functions,
fully covered by this lesson's own real, passing, exact-value tests: the
one real, unverifiable gap left is deliberately as small as it can be —
two real `size` reads and one real `drawPath` call, nothing more.

### Commands Needed

```
./gradlew :app:dependencies --configuration debugRuntimeClasspath
```

Confirms which real dependencies are already resolved on this project's
own classpath without adding anything new — run once this session to
confirm `androidx.compose.ui:ui-graphics:1.6.8` (which `Path` needs) was
already transitively present.

```
./gradlew :app:testDebugUnitTest :app:assembleDebug
```

The same real, combined command this project has run after every real
production change since Stage 1 — `:app:testDebugUnitTest` runs every
real JVM unit test; `:app:assembleDebug` compiles and packages this
project's own complete, real, installable `.apk`, confirming
`GraphScreen` and everything it depends on builds correctly as part of
the whole real app, not just under its own test task.

### Run It

```
$ ./gradlew :app:testDebugUnitTest --rerun-tasks --console=plain
BUILD SUCCESSFUL in 12s
32 actionable tasks: 32 executed
$ find app/build/test-results/testDebugUnitTest -name "*.xml" | xargs grep -h "tests=" | \
  grep -oE 'tests="[0-9]+" skipped="[0-9]+" failures="[0-9]+"' | \
  awk -F'"' '{t+=$2; s+=$4; f+=$6} END {print "total tests:", t, "skipped:", s, "failures:", f}'
total tests: 90 skipped: 0 failures: 0
$ ./gradlew :app:assembleDebug --console=plain
BUILD SUCCESSFUL in 1s
```

Two more new, real, permanent tests confirm this unit directly:
`toScreenConvertsARealCartesianPointToTheCorrectRealScreenPoint` and
`toScreenPointsConvertsAWholeRealListOfCartesianPointsInOrder` (both in
`GraphingTest.kt`, asserting the exact real screen coordinates this
project's own transform math has already hand-verified once before:
`Point(2.0, 4.0)` at origin `(200, 200)`, scale `20.0`, becomes
`ScreenPoint(240, 120)`).
`graphScreenComposesARealCanvasWithoutCrashing` (new `GraphScreenTest.kt`)
and `tappingGraphNavigatesToARealGraphScreen` (added to
`NavigationTest.kt`) confirm `GraphScreen` itself composes successfully
and is genuinely reachable through this project's own real navigation —
real, honest proof of *placement*, per this unit's own confirmed
finding, not of what actually got drawn. Real, saved in
`verification/9.3/step3_full_suite.txt`,
`verification/9.3/step2_3_Graphing.kt`, and
`verification/9.3/step3_MainActivity.kt`.

What this lesson's own tooling genuinely cannot confirm: that the real,
drawn curve actually looks like a parabola on a real screen. Stated
directly, from real confidence, not executed: it does — `sample`'s own
real output (already proven exact) feeds `toScreenPoints` (this unit,
already proven exact) feeds `buildGraphPath` (this lesson's own second
unit, already proven exact via real `getBounds()` checks) — every real
number along that entire chain has already been checked, independently,
by an exact, passing test; the only unverified step is Android's own
real, standard `Canvas`/`Path` rendering machinery actually painting
what it's given, which this project's own tooling has never been able
to observe directly, on any screen.

### Connect the Pieces

Follow this project's own real `"x×x"` all the way through, start to
finish. It parses into a real tree, exactly as it always has.
`sample` walks that tree a hundred times, at a hundred real, evenly
spaced `x` values, producing a hundred real Cartesian points.
`toScreenPoints` converts every one of them into a real `ScreenPoint`,
using an origin read fresh from this unit's own real, dynamic `size` —
correct on whatever real screen this code actually runs on, not just
one hand-chosen size. `buildGraphPath` connects all hundred into one
real, continuous `Path`. `drawPath` — the one real step nothing in this
project's current tooling can directly confirm ran — paints that path,
in real blue, four real pixels wide, onto a real `Canvas`, reachable
from this project's own home screen by a real, working "Graph" button
that did not exist before this lesson.

---

## Closing

**Connect the pieces.** This lesson took three separately-proven pieces
— `Canvas`'s own real, immediate-mode drawing; `Path`'s own real,
sequential drawing instructions; and this project's own transform math,
proven correct once already but set aside, real yet unused, until this
lesson gave it a real caller — and, for the first time, actually
combined them into something a real user could navigate to and see. A
real tap on a real "Graph" button, added to this project's own home
screen in this lesson's own third unit, now leads to a real screen that
parses this project's own `"x×x"`, samples it a hundred times, converts
every point into real screen coordinates centered on whatever real space
it's actually drawn into, and connects them into one real, continuous
curve.

This lesson also found something worth carrying forward honestly, not
just built something: this project's own Robolectric-based testing,
already trusted to prove real Compose behavior — clicks, state,
recomposition, layout — has a real, now-confirmed edge. It can
prove a `Canvas` exists, composes without crashing, and receives the
correct real layout size. It cannot prove that `Canvas`'s own drawing
lambda actually ran, or what it actually drew — confirmed by two real,
separate, executed attempts to get past this, not assumed from the
outset. Everything this lesson could keep on the provable side of that
line — sampling, the screen transform, path-building — it did, on
purpose, leaving only the smallest possible real step, one `drawPath`
call, on the other side.

Next: Lesson 9.4 — Gestures, which finally gives a real user a reason to
touch this lesson's own real graph screen at all: drag, pinch, and zoom,
changing the real origin and scale this lesson's own transform already
takes as parameters, but has, until now, only ever been told to compute
once and never change.
