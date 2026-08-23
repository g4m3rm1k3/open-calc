# Lesson 9.1: Where Up Stopped Being Positive

**What you will build.** No new feature ships in this lesson, and no file
in the real, running `AndroidCalculator` project changes — this lesson is
purely diagnostic, laying the mathematical and vocabulary groundwork
Slice 9's graphing feature needs before a single pixel gets drawn. The
transferable problem underneath it has nothing to do with graphing
specifically: whenever a program has to place a mathematically-computed
location onto a rendering surface — a chart, a map, a game world, a CAD
drawing — it runs into the exact same mismatch this lesson works out from
first principles: the coordinate system math is comfortable in and the
coordinate system a screen actually uses to address its own pixels are
two different systems, with different rules, and something has to
convert between them correctly or everything drawn ends up in the wrong
place, upside down, or both.

**What you need to know first.** Lesson 0.6's `class` (a blueprint
grouping related properties together) and Lesson 0.8's `data class` (a
class modifier that generates real `equals`/`hashCode`/`toString`/`copy`
from its own constructor properties) — this lesson's throwaway `Point`
and `ScreenPoint` types are both plain data classes. Lesson 0.9's lambda
expressions and `list.map { ... }` — used to turn a list of raw numbers
into a list of points. Lesson 6.4's `Double` — Cartesian coordinates and
scale factors are real numbers, not just whole ones.

## Terms used in this lesson

- **Cartesian coordinate system** — the mathematical convention
  identifying every point on a plane by an ordered pair `(x, y)`, with
  the plane extending infinitely in every direction and `y` conventionally
  increasing upward. It exists because early mathematics needed a way to
  turn geometric shapes into algebra — an equation like `y = x²` and a
  literal curve on paper become the exact same thing once every point on
  that curve has real numeric coordinates. This project already computes
  `y = f(x)` as a single number, one `x` at a time, through Stage 5 and
  Stage 6's evaluator; the Cartesian system is what turns a series of
  those numbers into "a shape" at all.
- **Origin** — the one point, `(0, 0)`, that a coordinate system measures
  every other point relative to. It exists because "a point's
  coordinates" is meaningless without first agreeing which point counts
  as zero — two coordinate systems can describe the exact same physical
  location completely differently if their origins sit in different
  places, which is precisely the problem this lesson's third unit has to
  solve.
- **Screen (pixel) coordinate system** — the coordinate convention a
  rendering surface actually uses to address its own pixels: origin
  fixed at the surface's top-left corner, `x` increasing rightward, `y`
  increasing downward, and every real coordinate bounded to the
  surface's actual width and height. It exists because a physical (or
  virtual) screen is a finite grid of addressable dots, not an infinite
  mathematical plane — something has to say, concretely, which dot
  `(0, 0)` actually refers to.
- **Y-axis inversion (y-flip)** — the fact that the Cartesian system's
  "up is positive" and the screen system's "down is positive" point in
  opposite directions along the same axis, `y`. This gets its own name,
  not just a passing observation, because any code converting a
  mathematical `y` into a screen `y` that ignores this will draw every
  shape upside down — a silent, easy mistake with a simple, permanent
  fix once it's named.
- **Coordinate transformation** — a function that converts a location
  expressed in one coordinate system into the equivalent location
  expressed in a different one. It exists because two different,
  independently useful coordinate systems — Cartesian for doing the
  math, screen for actually rendering it — are only usable together if
  something can move one real location between their two different
  descriptions of it.
- **Scale factor** — the number of screen pixels that represent one unit
  of Cartesian distance. It exists because a Cartesian unit has no fixed
  physical size on its own — the same equation could be graphed tiny or
  huge — and a transformation needs to know that number before it can
  turn "3 units away from the origin" into an actual, concrete pixel
  count.
- **`class`** (reappearing) — a blueprint naming a group of
  properties (and, optionally, behavior) that every real object built
  from it will have. It exists so related pieces of data — here, an `x`
  and a `y` that belong together as one location — can be passed around,
  stored, and referred to as a single value instead of as separate,
  disconnected variables that could accidentally drift apart.
- **`data class`** (reappearing) — a class modifier telling
  the compiler to generate real `equals`, `hashCode`, `toString`, and
  `copy` implementations directly from the properties listed in its
  primary constructor. It exists so a class that's purely a holder for
  values — this lesson's `Point` and `ScreenPoint` do nothing but hold an
  `x` and a `y` — never requires hand-writing that repetitive, mechanical,
  easy-to-get-subtly-wrong code by hand.
- **`val`** (reappearing) — a keyword declaring a read-only reference:
  once assigned, it can never be reassigned. It exists so a value that
  should never change after it's first set — an origin, a scale factor,
  a computed point — can say so directly in the code, turning an
  accidental later reassignment into a compile error instead of a silent
  bug.
- **`fun`** (reappearing) — the keyword introducing a function
  declaration: a named, reusable block of code that can take inputs
  (parameters) and produce an output (a return value). It exists so a
  calculation used more than once — converting a Cartesian coordinate
  into a screen coordinate, here — can be written exactly once and
  called by name, instead of copied everywhere it's needed.
- **Expression-body function** (`fun f(...): T = expr`) — a function
  whose entire body is a single expression written directly after an
  `=` sign, instead of a `{ }` block containing an explicit `return`. It
  exists as a shorter, equally real way to write a function whose whole
  job is "compute one value and hand it back" — exactly what this
  lesson's `toScreenX` and `toScreenY` do.
- **`Double`** (reappearing) — a 64-bit floating-point
  numeric type capable of representing fractional values. It exists here
  because Cartesian coordinates and scale factors are real numbers, not
  just whole ones — a curve like `y = x²` needs fractional `x` values
  between whole numbers to eventually look like a smooth curve rather
  than a few scattered dots.
- **`Int`** (reappearing) — a whole-number numeric type with no
  fractional part. It exists here because a real pixel is a single,
  indivisible, whole-number location — a screen has no such thing as
  "pixel 4.7."
- **Lambda expression** (reappearing) — an anonymous, inline
  function value, written as `{ parameters -> body }`. It exists so a
  small, one-off transformation — "turn this `x` into a `Point`," here —
  can be handed directly to a function like `map` without declaring a
  separate, named function just to use it once.
- **String template** (reappearing) — the `"...${expression}..."` syntax
  that substitutes a real, computed value directly into a string at the
  position of the `${ }`. It exists so a value never has to be manually
  converted to text and concatenated by hand every time it needs to
  appear inside a message.
- **`for`-in loop** (reappearing) — a loop that executes its body once
  for every element of a collection, in order, binding each element in
  turn to a named variable. It exists so code that must "do the same
  thing to every item in a list" — printing every computed point, here —
  doesn't have to be written once per item by hand.
- **Arithmetic operators** `+`, `-`, `*` (reappearing) — the built-in
  operators for addition, subtraction, and multiplication. They exist
  here as the literal computational machinery behind this lesson's
  central formula: shifting a value by an origin (`+`/`-`) and stretching
  it by a scale factor (`*`).

## Objects and methods used

This lesson's own subject — two coordinate systems and the transform
between them — is a mathematical concept, not a real external class or
method, so it has no entry of its own here. Every real class or method
this lesson's throwaway lab code actually calls is supporting cast,
listed below under one trailing heading.

### Everything else in the file, not this lesson's subject but still explained

- **`println`**
  - *What it is:* A Kotlin standard-library function that writes text to
    standard output, followed by a newline.
  - *Implementation:* `kotlin.io.println(message: Any?): Unit`, declared
    in `kotlin.io.ConsoleKt`. It converts its argument to a string
    (calling `toString()` on it, if it isn't already a `String`) and
    writes that string plus a line separator to `System.out`.
  - *Its use:* every lab in this lesson uses `println` to make an
    otherwise invisible computed value — a coordinate, a transformed
    pixel location — visible as real, comparable text, which is the
    entire point of an isolated lab under the Verification Rule.
  - *Type:* a top-level (package-level) function, not a method on any
    class — callable with no receiver.
  - *Responsibility:* converting whatever value it's given into text and
    delivering that text to the process's standard output stream, one
    line at a time.
  - *Depends on:* the JVM's `System.out` stream being available (it
    always is in a normal `java` invocation) and, for any non-`String`
    argument, that argument having some `toString()` implementation
    (every Kotlin object does, at minimum the default one every class
    inherits).
  - *Connects to:* called directly by this lesson's own `main`
    functions; internally forwards to `System.out.println`, part of the
    JVM's own console I/O machinery this lesson's code never touches
    directly.
  - *Shape:* a public entry point at the very edge of the program — the
    last real step before a computed value leaves the running process
    and becomes something a person actually reads.
- **`listOf`**
  - *What it is:* A Kotlin standard-library factory function that builds
    a read-only `List` from the arguments passed to it.
  - *Implementation:* `kotlin.collections.listOf(vararg elements: T):
    List<T>` — a generic function accepting any number of arguments of
    the same type `T` and returning a `List<T>`, allocating its own
    backing storage from the given arguments.
  - *Its use:* Concept Unit 1's lab needs a small, fixed sequence of
    `Double` values to turn into points; `listOf` is the standard way to
    build that sequence as a literal, with no mutable collection this
    lesson has any reason to mutate.
  - *Type:* a top-level generic function, `vararg`-parameterized.
  - *Responsibility:* taking zero or more values of one type and
    producing a single, read-only, ordered collection holding exactly
    those values in the order given.
  - *Depends on:* nothing beyond the argument values themselves.
  - *Connects to:* called once, in Concept Unit 1's lab; its return
    value is handed immediately to `.map`, the very next call in the
    same expression.
  - *Shape:* a public factory function at the boundary between "several
    loose values" and "one collection" — the first step in nearly every
    small, literal dataset this curriculum has built since Stage 0.
- **`List<T>.map`**
  - *What it is:* A Kotlin standard-library extension function on
    `Iterable<T>` that produces a new list by applying a transformation
    to every element of an existing one.
  - *Implementation:* `inline fun <T, R> Iterable<T>.map(transform: (T)
    -> R): List<R>` — walks the receiver once, calls `transform` on each
    element, and collects the results, in order, into a new `List<R>`;
    the source list is never modified.
  - *Its use:* Concept Unit 1's lab needs to turn five raw `Double`
    x-values into five `Point` objects, pairing each `x` with its own
    `x * x`; `map` is the standard way to produce one new value per
    existing value without a hand-written loop and a mutable
    accumulator list.
  - *Type:* a generic, `inline` extension function — callable as if it
    were a method on any `Iterable<T>`, including `List<Double>`.
  - *Responsibility:* producing exactly one output element for every
    input element, in the same order, with no filtering and no change to
    how many elements exist.
  - *Depends on:* a receiver list to iterate, and a `transform` lambda
    describing how to convert one element of type `T` into one element
    of type `R`.
  - *Connects to:* called on the `List<Double>` `listOf` just built; the
    lambda passed to it constructs a `Point` per element; its own
    return value, a `List<Point>`, is exactly what the following `for`
    loop iterates over.
  - *Shape:* a public, general-purpose transformation step — the same
    shape used throughout this curriculum any time "the same operation,
    applied to every element" is needed, without a hand-written loop and
    accumulator list standing in its way.
- **`Double.toInt()`**
  - *What it is:* A Kotlin standard-library conversion method that
    truncates a floating-point `Double` value down to a whole-number
    `Int`.
  - *Implementation:* `kotlin.Double.toInt(): Int` — a member function on
    the `Double` type itself. It discards any fractional part
    (truncation toward zero, not rounding to the nearest whole number)
    and returns the resulting whole number as an `Int`.
  - *Its use:* Concept Unit 3's transform functions compute a screen
    coordinate as a `Double` (an origin plus a scaled distance), but a
    real pixel location has no fractional part — `.toInt()` is what
    turns that computed `Double` into the whole-number pixel coordinate
    a screen actually addresses.
  - *Type:* an instance (member) method on the `Double` type — every
    `Double` value carries it.
  - *Responsibility:* converting exactly one `Double` value into exactly
    one `Int` value by discarding whatever sits past the decimal point,
    with no rounding, no bounds-checking, and no other side effect.
  - *Depends on:* only the `Double` value it's called on; it needs
    nothing passed to it.
  - *Connects to:* called at the very end of both `toScreenX` and
    `toScreenY`, immediately after the addition/subtraction-and-
    multiplication arithmetic that computes each function's raw
    `Double` result; its own `Int` return value is what each function
    actually returns.
  - *Shape:* a small conversion sitting at the exact seam between this
    lesson's own continuous math (real numbers, fractional distances)
    and the screen coordinate system's own discrete addressing (whole
    pixels) established in Concept Unit 2. In this lesson's own chosen
    numbers, the arithmetic always lands on an exact whole value already
    — `.toInt()` never visibly discards anything here — but it's still
    required because the compiler needs a real `Int`, not a `Double`,
    for a pixel coordinate; a future lesson feeding this function real
    sampled data will hit genuinely fractional results where the
    truncation actually changes the answer.

---

## Concept Unit: The Cartesian Plane

### The Problem

This project can already compute `y = f(x)` for one `x` at a time —
Stage 5's expression parser and Stage 6's evaluator turn text like
`3 + 5 × (2 − 8)` into a single real answer. Graphing a function means
doing that many times, across a range of `x` values, and then somehow
turning the resulting pile of numbers into a recognizable shape. But
"a shape" is not a concept this project has ever needed before — every
number it has ever produced has stood alone. Before any of that math can
become a picture, this lesson needs a real, precise answer to a
question that sounds almost too basic to ask: what, exactly, is "a
point," and what rules govern how a collection of them relates to each
other well enough to look like a curve?

Before reading on: if you were asked to plot `y = x²` on a blank piece
of paper, which direction would you draw increasing `y` — up the page,
or down it? Is there a largest `x` you could plug into `y = x²`, or a
smallest, or does the equation accept literally any real number? And
where would you naturally place the point `(0, 0)` on that blank paper —
dead center, or tucked into a corner?

### Introduce the Concept in Isolation

The following throwaway lab represents five points on the curve
`y = x²` and prints each one:

```kotlin
data class Point(val x: Double, val y: Double)

fun main() {
    val points = listOf(-2.0, -1.0, 0.0, 1.0, 2.0).map { x -> Point(x, x * x) }
    for (point in points) {
        println("(${point.x}, ${point.y})")
    }
}
```

Compiled and run for real:

```
(-2.0, 4.0)
(-1.0, 1.0)
(0.0, 0.0)
(1.0, 1.0)
(2.0, 4.0)
```

This output proves two things at once. First, five independent numbers
really can be organized into five `(x, y)` pairs, each pair naming one
specific location, with nothing more exotic than a `data class` holding
two `Double`s. Second — and this is the part that actually matters for
graphing — the five pairs are not five unrelated facts: `x` ranges
symmetrically from `-2.0` to `2.0`, while `y` is always `x`'s own square,
so `y` shrinks toward `0.0` as `x` approaches `0.0` from either side and
grows again as `x` moves away from it in either direction. That
symmetric rise-fall-rise pattern, visible directly in the printed
numbers, is what a parabola *is*, expressed as data instead of as a
drawing. This convention — locating every point on an infinite plane by
an ordered pair `(x, y)`, with `y` increasing upward and no bound on how
far `x` or `y` can range in any direction — is called the **Cartesian
coordinate system**.

### Discard the Throwaway Example

The `Point` data class and the `main` function above exist only to prove
this one idea. Both are deleted; neither appears in the real project. A
real project equivalent gets built only once this project's own
evaluator output genuinely needs to become points for real — not before,
and not in this diagnostic lesson.

### Mechanical Walkthrough

Every distinct syntactic element in the lab above, in the order it
appears:

- `data class Point(val x: Double, val y: Double)` — declares a new
  **`class`**: a blueprint, not a running value by itself, naming the
  shape every real `Point` object will have. The **`data class`**
  modifier tells the compiler to generate real `equals`, `hashCode`,
  `toString`, and `copy` methods from the two properties listed in the
  parentheses, so this line alone is enough to make `Point` a fully
  usable value type with no hand-written boilerplate.
- `val x: Double` and `val y: Double` — the two properties `Point`
  actually holds, each declared with **`val`**: read-only, assigned once
  when a `Point` is constructed and never reassigned afterward. Both are
  typed **`Double`**, this project's 64-bit floating-point type, because
  a Cartesian `x` or `y` is a real number — `1.5` is just as valid a
  coordinate as `1` or `2`.
- `fun main()` — the **`fun`** keyword introduces a function
  declaration; `main` is this file's own entry point, the function the
  JVM calls first when the compiled program runs.
- `listOf(-2.0, -1.0, 0.0, 1.0, 2.0)` — calls the standard-library
  **`listOf`** function (full treatment in Objects and methods, above),
  building a `List<Double>` holding exactly these five literal values,
  in this order.
- `.map { x -> Point(x, x * x) }` — calls the standard-library
  **`List<T>.map`** function (full treatment above) on that list. Its
  argument, `{ x -> Point(x, x * x) }`, is a **lambda expression**: an
  inline, anonymous function taking one parameter (named `x` here,
  shadowing nothing since this is its own separate scope) and evaluating
  to whatever its body's last expression produces. Inside that lambda,
  `x * x` uses the **`*`** (multiplication) **arithmetic operator** to
  compute the square of the current element, and `Point(x, x * x)`
  constructs one real `Point` from that element and its own square.
  `map` calls this lambda once per element of the original list and
  collects the five resulting `Point` objects into a new `List<Point>`,
  assigned to `points`.
- `for (point in points)` — a **`for`-in loop**: executes its body once
  for every element of `points`, in order, binding each one in turn to
  the name `point`.
- `println("(${point.x}, ${point.y})")` — calls the standard-library
  **`println`** function (full treatment above) with one **string
  template** argument. Inside the string, `${point.x}` and `${point.y}`
  each read a real property off the current `point` (the `x`/`y`
  properties `Point`'s own primary constructor declared) and substitute
  its real, computed value directly into the text at that position —
  the parentheses and comma between them are ordinary literal characters
  in the string, not part of the template syntax itself.

### CS Lens

This is the **Cartesian coordinate system**, named for René Descartes,
who first showed that geometry (shapes, distances, curves) and algebra
(equations, numbers) are the same subject once every point on a plane
has real numeric coordinates — the entire reason this lesson's lab could
turn `y = x²` into five concrete number pairs at all.

```
Also recognized in: graph paper and every graphing calculator's
own display, a physics engine's "world space," a CAD or
vector-drawing program's "user units," GPS latitude and
longitude before it's projected onto any map tile
```

Each of these is a coordinate system existing on its own terms,
independent of whatever eventually renders it: a physics engine's world
space describes where an object really is regardless of where the
camera happens to be looking; a CAD program's user units describe a
drawing's real dimensions regardless of the screen it's shown on; GPS
latitude and longitude describe a real location on Earth completely
independently of the pixel grid of whatever map tile eventually displays
it.

### SE Lens

The design choice worth naming here is introducing a real, named `Point`
type at all, instead of just working with two loose `Double` variables,
`x` and `y`, side by side. The alternative — never bundling them —
was rejected because two independently-passed `Double`s carry no
guarantee they belong together; a function taking `(x1: Double, y1:
Double, x2: Double, y2: Double)` gives a caller four interchangeable
numbers and no compiler-enforced way to know which two form one point.
A `Point` groups exactly the two values that only ever mean something
together, and — because it's a `data class` — gets real structural
equality and a real, readable `toString()` for free, at zero authored
cost beyond the one-line declaration. The honest cost: for a
lesson this small, with exactly one throwaway use, a bare `Pair<Double,
Double>` would have worked almost as well and needed no declaration at
all; `Point` is worth it here specifically because this project's own
graphing feature will need a real, named, growing concept of "a point"
far past what one throwaway lab requires — this lab's own `Point`
previews that shape honestly, even though it's discarded immediately
afterward.

### Commands Needed

```
kotlinc lab1_cartesian.kt lab2_screen.kt lab3_transform.kt -include-runtime -d labs91.jar
```

`kotlinc` is the Kotlin compiler's own command-line entry point;
invoking it directly with one or more `.kt` file paths compiles all of
them together in a single pass. `-include-runtime` bundles the Kotlin
standard library itself into the output `.jar`, so the result can run on
a plain `java` installation with no separate Kotlin runtime on the
classpath. `-d labs91.jar` names the output file `-d` ("destination")
writes the compiled result to. Passing all three of this lesson's lab
files to one `kotlinc` invocation is this lesson's own batching under
the Verification Rule's second part — one compile pass covering every
lab this lesson needs, instead of three separate ones — and is safe here
specifically because none of the three labs declares a name that
collides with another (`Point` only exists in this lab's own file;
`ScreenPoint`, `toScreenX`, and `toScreenY` exist only in the other two).

```
java -cp labs91.jar Lab1_cartesianKt
```

`java` is the JVM's own launcher. `-cp labs91.jar` puts the compiled jar
on the classpath so the JVM can find the compiled classes inside it.
`Lab1_cartesianKt` is the real, compiler-generated class name for this
specific file's top-level code — Kotlin compiles every file's top-level
`fun main()` into a class named after that file (`lab1_cartesian.kt`
becomes `Lab1_cartesianKt`), and that generated class is what `java`
actually runs.

### Run It

```
$ java -cp labs91.jar Lab1_cartesianKt
(-2.0, 4.0)
(-1.0, 1.0)
(0.0, 0.0)
(1.0, 1.0)
(2.0, 4.0)
```

Real, saved in `verification/9.1/lab1_cartesian.kt` and
`verification/9.1/lab1_output.txt`.

### Connect the Pieces

This unit gives this lesson its starting material: five real `(x, y)`
pairs, related to each other by the equation `y = x²`, expressed the
only way this project has ever expressed a computed answer — as plain
numbers. The next unit asks what happens the moment those same numbers
have to be drawn somewhere real.

---

## Concept Unit: The Screen Coordinate System

### The Problem

The five points the last unit produced describe a real parabola — but
only on an infinite, abstract mathematical plane that has no edges, no
pixels, and no fixed size. Actually drawing anything means placing ink
(or lit pixels) on a real, physical, bounded surface. That surface has
never entered this project's reasoning before; every value this project
has ever computed was consumed by more computation, or printed as plain
text, never placed at a specific physical location.

Before reading on: when Android draws to a screen, does the drawing
surface extend infinitely in every direction the way the Cartesian
plane does, or does it stop somewhere? If you were told a specific pixel
sits at row `0`, is that pixel near the top of the screen or the bottom?
Could a real, visible pixel ever sit at a negative row or column?

### Introduce the Concept in Isolation

The following throwaway lab names the four corners of a hypothetical
400×400 screen by their real pixel coordinates:

```kotlin
data class ScreenPoint(val x: Int, val y: Int)

fun main() {
    val width = 400
    val height = 400
    val topLeft = ScreenPoint(0, 0)
    val topRight = ScreenPoint(width - 1, 0)
    val bottomLeft = ScreenPoint(0, height - 1)
    val bottomRight = ScreenPoint(width - 1, height - 1)
    println("top-left = $topLeft")
    println("top-right = $topRight")
    println("bottom-left = $bottomLeft")
    println("bottom-right = $bottomRight")
}
```

Compiled and run for real:

```
top-left = ScreenPoint(x=0, y=0)
top-right = ScreenPoint(x=399, y=0)
bottom-left = ScreenPoint(x=0, y=399)
bottom-right = ScreenPoint(x=399, y=399)
```

This output proves the convention directly, in real numbers rather than
as an assertion to take on faith: both points named "top" share `y=0`,
and both points named "bottom" share `y=399` — the largest `y` this
400-pixel-tall screen has room for, since valid rows run `0` through
`height - 1`. Nothing in this output has a negative coordinate, and
nothing exceeds `width - 1` or `height - 1` — every real pixel address
this surface has is bounded, not infinite. This mirrors Android's own
real, documented `View`/`Canvas` pixel coordinate convention exactly —
origin at the top-left corner, `x` increasing rightward, `y` increasing
downward, every coordinate bounded to the real surface's own width and
height — a stable, extremely well-documented platform fact, stated here
from that documented convention rather than an on-device run, since this
project's own tooling still has no working emulator or physical device
(a standing limitation recorded in this curriculum's handoff). This is
called the **screen (pixel) coordinate system**, and the specific fact
that its `y` grows in the opposite direction from the Cartesian plane's
`y` is called **y-axis inversion**, or the **y-flip**.

### Discard the Throwaway Example

The `ScreenPoint` data class and the `main` function above exist only to
prove this one idea. Both are deleted; neither appears in the real
project. Android's own real `Canvas` API, which this project will
eventually use to actually draw pixels, is a real, separate subject of
its own — a real drawing surface, not a coordinate convention — and is
not covered by this diagnostic lesson.

### Mechanical Walkthrough

Every distinct syntactic element in the lab above, in the order it
appears:

- `data class ScreenPoint(val x: Int, val y: Int)` — another **`data
  class`**, the same construct explained in Concept Unit 1 above, this
  time holding two **`Int`** properties instead of two `Double`s,
  because a real pixel address is always a whole number — there is no
  such thing as pixel `4.7`.
- `val width = 400` and `val height = 400` — two **`val`**-declared,
  read-only `Int` properties naming this hypothetical screen's real
  dimensions; `400` here is an ordinary integer literal, no different in
  kind from any whole number this project has used since Stage 0.
- `ScreenPoint(0, 0)`, `ScreenPoint(width - 1, 0)`,
  `ScreenPoint(0, height - 1)`, `ScreenPoint(width - 1, height - 1)` —
  four calls to `ScreenPoint`'s own compiler-generated primary
  constructor, each building one real `ScreenPoint` object. `width - 1`
  and `height - 1` each use the **`-`** (subtraction) **arithmetic
  operator** to compute the largest valid coordinate on an axis of that
  length — a screen `400` pixels tall has real rows numbered `0` through
  `399`, not `1` through `400`, since counting starts at the origin,
  `0`.
- `println("top-left = $topLeft")` (and the three lines after it,
  identical in shape) — each calls **`println`** (full treatment above)
  with one **string template** argument. `$topLeft` (the short form of
  `${topLeft}`, valid when substituting a single bare name rather than a
  full expression) substitutes the real, computed value of `topLeft`
  into the string. Because `ScreenPoint` is a `data class`, substituting
  it into a string template implicitly calls its own compiler-generated
  `toString()` — the same real, compiler-generated method every
  `data class` gets from its own primary-constructor properties,
  reappearing here on a brand-new one — which is what actually produces
  the readable `ScreenPoint(x=0, y=0)` text seen in the real output
  above, not
  anything this lesson's own code wrote by hand.

### CS Lens

This is the **screen (pixel) coordinate system** — more precisely, it's
one instance of the far more general idea of **raster (device) space**:
a coordinate system whose origin, axis directions, and bounds are fixed
by whatever physical or virtual grid of addressable dots is actually
being drawn to, rather than by mathematical convenience.

```
Also recognized in: HTML5 canvas coordinates, iOS UIKit view
coordinates, most desktop windowing systems' drawing surfaces,
raw bitmap image rows, text-terminal cursor addressing
```

This exact top-left-origin, `y`-down convention is not an Android quirk
— it appears, essentially unchanged, across nearly every one of these:
HTML5's own `<canvas>` API, iOS's own `UIKit` view coordinates, and most
desktop windowing systems' own drawing surfaces all place `(0, 0)` at
the top-left corner with `y` growing downward; a raw bitmap image file's
row `0` is, by near-universal convention, its own top row; a text
terminal addresses its cursor by row and column from the top-left
corner, in exactly the same shape.

### SE Lens

The design choice worth naming here is treating "screen coordinates" as
its own distinct, named concept — with its own type, `ScreenPoint` — 
rather than reusing Concept Unit 1's `Point` for both jobs. The
alternative not chosen: one shared coordinate type used for both
Cartesian math and screen placement. That would be simpler by one fewer
declared type, but it would erase a real, meaningful distinction —
nothing about a shared type would stop a genuine Cartesian `y` value
from being passed, unconverted, straight into code expecting a real
pixel row, silently drawing everything upside down (exactly the failure
mode Y-axis inversion names). Two distinct types, `Point` and
`ScreenPoint`, make that specific mistake something the compiler can
catch — passing one where the other is expected is a real type error,
not a bug waiting to be noticed on screen. The honest cost: two small
type declarations to maintain instead of one, worth it here because the
whole reason this lesson exists is that these two systems are not
interchangeable.

### Commands Needed

```
java -cp labs91.jar Lab2_screenKt
```

The same `kotlinc` compilation already covered in Concept Unit 1's own
Commands Needed section produced this file's compiled class as part of
that same batched pass; only the `java` invocation differs here, running
`Lab2_screenKt` — the real, compiler-generated class name for
`lab2_screen.kt`'s own top-level code — instead of the previous unit's
`Lab1_cartesianKt`.

### Run It

```
$ java -cp labs91.jar Lab2_screenKt
top-left = ScreenPoint(x=0, y=0)
top-right = ScreenPoint(x=399, y=0)
bottom-left = ScreenPoint(x=0, y=399)
bottom-right = ScreenPoint(x=399, y=399)
```

Real, saved in `verification/9.1/lab2_screen.kt` and
`verification/9.1/lab2_output.txt`.

### Connect the Pieces

This project now has two real, incompatible coordinate systems: Concept
Unit 1's Cartesian points — unbounded, `y` increasing upward, origin
wherever the math finds convenient — and this unit's screen points —
bounded to a real width and height, `y` increasing downward, origin
fixed at the top-left corner. Neither unit has yet said how to turn one
into the other. That conversion is this lesson's last piece.

---

## Concept Unit: Coordinate Transformation

### The Problem

Every real value this project needs to draw starts life as a Cartesian
point, the shape Concept Unit 1 established. Every real value a screen
can actually display has to be a screen point, the shape Concept Unit 2
established. Nothing built so far moves a value from the first shape to
the second — and simply copying the numbers across would be wrong twice
over: the Cartesian origin might not belong at pixel `(0, 0)` at all
(most graphs look better centered), and, per Y-axis inversion, a larger
Cartesian `y` needs to produce a *smaller* screen `y`, not a larger one.

Before reading on: given the y-flip Concept Unit 2 already established,
if a Cartesian `y` value increases, should the matching screen `y`
increase or decrease? If you wanted the Cartesian origin, `(0, 0)`, to
land at the exact center of a 400×400 screen instead of its top-left
corner, what screen coordinates should `(0, 0)` map to? And what single
extra number would you need to know before you could convert "3
Cartesian units away from the origin" into an actual pixel distance?

### Introduce the Concept in Isolation

The following throwaway lab defines two small functions, each
converting one axis of a Cartesian coordinate into its matching screen
coordinate, then applies both to Concept Unit 1's own five points:

```kotlin
fun toScreenX(x: Double, originX: Int, scale: Double): Int =
    (originX + x * scale).toInt()

fun toScreenY(y: Double, originY: Int, scale: Double): Int =
    (originY - y * scale).toInt()

fun main() {
    val originX = 200
    val originY = 200
    val scale = 20.0
    println("Cartesian (-2.0, 4.0) -> screen (${toScreenX(-2.0, originX, scale)}, ${toScreenY(4.0, originY, scale)})")
    println("Cartesian (-1.0, 1.0) -> screen (${toScreenX(-1.0, originX, scale)}, ${toScreenY(1.0, originY, scale)})")
    println("Cartesian (0.0, 0.0) -> screen (${toScreenX(0.0, originX, scale)}, ${toScreenY(0.0, originY, scale)})")
    println("Cartesian (1.0, 1.0) -> screen (${toScreenX(1.0, originX, scale)}, ${toScreenY(1.0, originY, scale)})")
    println("Cartesian (2.0, 4.0) -> screen (${toScreenX(2.0, originX, scale)}, ${toScreenY(4.0, originY, scale)})")
}
```

Compiled and run for real:

```
Cartesian (-2.0, 4.0) -> screen (160, 120)
Cartesian (-1.0, 1.0) -> screen (180, 180)
Cartesian (0.0, 0.0) -> screen (200, 200)
Cartesian (1.0, 1.0) -> screen (220, 180)
Cartesian (2.0, 4.0) -> screen (240, 120)
```

This output proves the transform works in exactly the way Concept Units
1 and 2 predicted it would need to. The Cartesian origin, `(0.0, 0.0)`,
lands at screen `(200, 200)` — the exact center of a 400×400 screen,
because `originX` and `originY` were both chosen as `200`. `x` maps in
the *same* direction on both sides: as Cartesian `x` rises from `-2.0`
to `2.0`, screen `x` rises too, from `160` to `240`. `y` maps in the
*opposite* direction, exactly as Y-axis inversion predicted: Cartesian
`y` is `4.0` at both ends of this range and only `0.0` at the middle,
yet screen `y` is `120` — the *smallest* value in this table — at both
ends, and `200` — the *largest* — in the middle. A real parabola, opening
upward on the Cartesian plane, has been correctly converted into a real
set of screen coordinates that open *downward*, exactly as a parabola
must look once drawn on a `y`-down surface. This function is a
**coordinate transformation** — specifically, one built from a
**scale factor** (`scale`, here `20.0` pixels per Cartesian unit) and an
origin offset, with no rotation involved.

### Discard the Throwaway Example

`toScreenX`, `toScreenY`, and the `main` function above exist only to
prove this formula works. All three are deleted; none appears in the
real project yet. A real, permanent version of this transform becomes
part of the project only once this project's own real sampling and
drawing code genuinely needs one to call — not before, and not in this
diagnostic lesson.

### Mechanical Walkthrough

Every distinct syntactic element in the lab above, in the order it
appears:

- `fun toScreenX(x: Double, originX: Int, scale: Double): Int =
  (originX + x * scale).toInt()` — an **expression-body function**
  (full treatment in Terms, above): the **`fun`** keyword introduces the
  declaration; `toScreenX` is its name; `(x: Double, originX: Int,
  scale: Double)` declares three parameters with explicit types; `: Int`
  is the function's declared return type; and everything after the `=`
  is the single expression this function evaluates and returns, with no
  `{ }` block or explicit `return` keyword needed. Inside that
  expression, `x * scale` uses the **`*`** operator to multiply the
  Cartesian `x` by the scale factor, converting "how many Cartesian
  units away from the origin" into "how many pixels away from the
  origin"; adding `originX` to that product uses the **`+`** operator to
  shift that pixel distance by the origin's own real screen position, so
  the result is measured from the screen's own `(0, 0)`, not from the
  Cartesian origin. The parentheses around `originX + x * scale` group
  that whole computation before `.toInt()` (full treatment in Objects
  and methods, above) truncates the resulting `Double` down to the
  `Int` a real screen coordinate has to be.
- `fun toScreenY(y: Double, originY: Int, scale: Double): Int =
  (originY - y * scale).toInt()` — the same expression-body-function
  shape as `toScreenX`, with one deliberate difference: `originY - y *
  scale` uses the **`-`** operator where `toScreenX` used `+`. This
  single sign flip is the entire, complete implementation of Y-axis
  inversion: subtracting a larger Cartesian `y` moves the result
  *further below* `originY` on screen (a smaller screen `y`, since
  screen `y` grows downward), which is exactly what "up is positive in
  Cartesian terms, down is positive in screen terms" requires.
- `val originX = 200`, `val originY = 200`, `val scale = 20.0` — three
  more **`val`**-declared read-only values: `originX`/`originY` (`Int`,
  matching `ScreenPoint`'s own coordinate type from Concept Unit 2)
  choose where the Cartesian origin lands on this hypothetical 400×400
  screen — dead center, in this lab's own choice — and `scale` (`Double`,
  matching Concept Unit 1's own coordinate type) sets how many pixels
  represent one Cartesian unit.
- `println("Cartesian (-2.0, 4.0) -> screen (${toScreenX(-2.0,
  originX, scale)}, ${toScreenY(4.0, originY, scale)})")` (and the four
  lines after it, identical in shape with different literal `x`/`y`
  values) — each calls **`println`** (full treatment above) with one
  **string template** argument containing two nested function calls:
  `${toScreenX(-2.0, originX, scale)}` calls `toScreenX` with this
  line's own literal Cartesian `x`, and substitutes its real, computed
  `Int` result directly into the string; `${toScreenY(4.0, originY,
  scale)}` does the same for `toScreenY` and this line's own literal
  Cartesian `y`. The five literal `(x, y)` pairs used across these five
  lines are the exact same five points Concept Unit 1's own lab
  computed and printed, typed here by hand since that lab's own `Point`
  values no longer exist to reuse — its own `main` function was already
  discarded, per this project's standing rule that a throwaway lab never
  survives past the unit that introduced it.

### CS Lens

This is a **coordinate transformation** — more specifically, an
**affine transformation**: a scale (stretching or shrinking distances by
a constant factor) combined with a translation (shifting everything by a
fixed offset), with no rotation or shear involved. It's the same
mathematical shape used to convert between any two coordinate systems
that agree on direction and shape but disagree on origin, scale, or
axis orientation.

```
Also recognized in: 3D graphics model-view-projection matrices,
map applications projecting latitude/longitude onto screen
tiles, audio waveform visualizers, CAD "zoom" and "pan" controls
```

A 3D graphics pipeline's model-view-projection matrices do the same job
this lesson's own `toScreenX`/`toScreenY` do — converting a point's
coordinates from one space into another — across more dimensions and
with more steps chained together. A map application converts real
latitude and longitude into the pixel coordinates of whatever map tile
is currently on screen using the same shape of transform. An audio
waveform visualizer converts a sample's raw amplitude (a continuous
numeric value) into a vertical pixel position within a fixed-height
waveform image, the same scale-plus-offset idea applied to a single
axis. A CAD program's "zoom" and "pan" controls are, mechanically,
nothing more than a user changing this exact transform's own `scale`
and origin-offset parameters in real time.

### SE Lens

The design choice worth naming here is separating the transform into two
independent functions, `toScreenX` and `toScreenY`, each handling one
axis, rather than one combined function taking a full `Point` and
returning a full `ScreenPoint`. The alternative — one function,
`fun toScreen(point: Point, origin: ScreenPoint, scale: Double):
ScreenPoint` — was deliberately not built in this lab, even though it
would read more naturally at a real call site later. The reason: the `x`
and `y` axes genuinely behave differently here (`+` on one axis, `-` on
the other, because of Y-axis inversion), and this lab's own job is
proving that difference is real and correctly implemented — collapsing
both into one function before that proof exists would hide exactly the
asymmetry this unit needs the reader to see clearly, one axis at a time.
The real cost of leaving them separate: any real, permanent version of
this transform will likely want to combine both into one
`Point`-to-`ScreenPoint` call for convenience at its own real call
sites — a legitimate, deliberately deferred refinement, not a mistake
made here, since this lab's own job is proving the two axes behave
differently in the first place, not yet building the most convenient
permanent shape for calling the result.

A second, related choice: `.toInt()`'s truncation (full treatment in
Objects and methods, above) was kept as-is rather than swapped for
rounding to the nearest whole pixel. Truncation is simpler — one
built-in method, no extra import — but it systematically biases every
computed screen coordinate slightly toward zero rather than to the
nearest actual pixel. That bias is invisible in this lab's own chosen
numbers, where every result happens to land on an exact whole value
already; it would become visible, if only by a single pixel here and
there, the moment real, non-round sampled data starts flowing through
this same formula. Left as truncation here deliberately, since fixing an
inaccuracy this small, before any real graph has ever been drawn to
notice it, would be solving a problem that doesn't exist yet.

### Commands Needed

```
java -cp labs91.jar Lab3_transformKt
```

The same batched `kotlinc` compilation already covered in Concept Unit
1's own Commands Needed section produced this file's compiled class as
well; only the `java` invocation differs here, running
`Lab3_transformKt` — the real, compiler-generated class name for
`lab3_transform.kt`'s own top-level code.

### Run It

```
$ java -cp labs91.jar Lab3_transformKt
Cartesian (-2.0, 4.0) -> screen (160, 120)
Cartesian (-1.0, 1.0) -> screen (180, 180)
Cartesian (0.0, 0.0) -> screen (200, 200)
Cartesian (1.0, 1.0) -> screen (220, 180)
Cartesian (2.0, 4.0) -> screen (240, 120)
```

Real, saved in `verification/9.1/lab3_transform.kt` and
`verification/9.1/lab3_output.txt`. Worth recording honestly: the first
real compile of this exact file had a copy-paste mistake — its last
line passed `2.0` into `toScreenY` instead of `4.0`, producing a wrong
screen `y` of `160` instead of `120` for that one point. Actually
running the code, rather than trusting the source by eye, is what caught
it; the fix (using `4.0`, this point's own real Cartesian `y`) is what
produced the output shown above and saved to
`verification/9.1/lab3_output.txt`, which also records this mistake and
its fix directly.

### Connect the Pieces

Follow one real value through everything this lesson built: Concept Unit
1 computed the Cartesian point `(2.0, 4.0)` as one of five points on `y
= x²`. Concept Unit 2 established that wherever this point eventually
lands, it must land somewhere within a bounded, `y`-down screen — not
copied over unchanged. This unit's own transform, given an origin at
screen `(200, 200)` and a scale of `20.0` pixels per unit, converts that
exact point into the real screen coordinate `(240, 120)`: `240` because
`2.0` Cartesian units to the right of the origin becomes `40` pixels to
the right of screen `x` `200`; `120` because `4.0` Cartesian units
*above* the origin becomes `80` pixels *above* screen `y` `200` — a
*smaller* screen `y`, per Y-axis inversion, not a larger one. That single
number, `(240, 120)`, is a real, valid, addressable pixel on a real
screen — the first Cartesian value this entire lesson produced that
could actually be drawn.

---

## Closing

**Connect the pieces.** Trace `y = x²`'s own point at `x = 2.0` through
this lesson's complete arc. Concept Unit 1 established what "a point"
means before any screen is involved: `(2.0, 4.0)`, one location on an
infinite, `y`-up Cartesian plane, computed the same way this project has
computed every answer since Stage 5 — as plain, real numbers. Concept
Unit 2 established the completely different system that same point will
eventually have to live in: a real, bounded, `y`-down grid of pixels,
with `(0, 0)` fixed at its top-left corner, not floating wherever the
math finds convenient. Concept Unit 3 built the one function standing
between those two systems — a scale factor turning Cartesian distance
into pixel distance, and an origin offset combined with a sign flip on
`y` alone, turning "up" into "down" exactly where it needs to. Run
through that transform with a screen center at `(200, 200)` and a scale
of `20` pixels per unit, `(2.0, 4.0)` becomes the real screen coordinate
`(240, 120)` — a location nothing in this project could produce, or even
describe, before this lesson existed.

Nothing about this lesson required a real device, a real `Canvas`, or
even the `AndroidCalculator` project's own source tree — every claim
made here was proven with three small, throwaway, real, compiled `.kt`
files, which is exactly why this lesson could be written honestly
without a working emulator: the math a coordinate transform depends on
is genuinely independent of whatever eventually draws its result.

Next: Lesson 9.2 — Sampling, which gives this lesson's own transform
formula real, computed Cartesian points to work on, by extending this
project's own expression-evaluation pipeline to compute `y = f(x)`
across a whole range of `x` values instead of just one.
