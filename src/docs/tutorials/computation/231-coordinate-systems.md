# Lesson 231: Coordinate Systems — Building Geometry From Coordinates

**What you will build**: A point represented as data — a pair of
coordinates — and a direct proof that coordinates are never an
intrinsic property of a point, only a chosen way of describing it
relative to an arbitrary origin: shift the origin, and a point's own
coordinates change completely, even though the point itself hasn't
moved anywhere. It then derives squared distance from those same
coordinates and proves, concretely, that distance — unlike a point's own
coordinates — stays exactly the same no matter which origin was chosen,
before closing with real distance and this curriculum's first-ever call
into the host platform underneath Clojure itself.

**What you need to know first**: Nothing from Section X — this section
is a genuine topic shift, no threads, no messages, no shared state.
Lesson 85's vector-as-pair convention (`get` at position `0` and `1`),
reused directly for a point instead of a queue or a lock. Lesson 189's
IEEE-754 floating-point representation, reused directly for why a real
distance value can't always be written down exactly.

**Terms used in this lesson**:

- **coordinate** — a single number specifying position along one axis,
  relative to a chosen origin and direction; exists because "where
  something is" only becomes computable once it's expressed as numbers,
  not pointed at or described in words.
- **coordinate system** — the combination of a chosen origin and a set
  of axis directions that gives every point a specific, unique numeric
  address; exists because a coordinate by itself means nothing until
  everyone agrees on what it's being measured *from*.
- **origin** — the one specific point chosen as `(0, 0)`; every other
  point's coordinates are defined relative to it, and it is the one
  genuinely arbitrary choice a coordinate system has to make before any
  coordinate means anything at all.
- **translation** — shifting a coordinate system's own origin, changing
  every point's coordinates by the same fixed amount, while the points
  themselves don't move in space at all; exists to make concrete that
  coordinates are a chosen representation, never an intrinsic property
  of the thing they describe.
- **translation-invariant** — a quantity that stays exactly the same
  regardless of which origin a coordinate system happens to choose;
  distance between two points is the canonical example — *where* two
  points are can change completely under a shifted origin, while *how
  far apart* they are never does.
- **irrational number** — a number that cannot be written exactly as a
  ratio of two whole numbers, whose decimal representation never
  terminates or repeats; exists as the reason ordinary exact arithmetic
  (addition, subtraction, multiplication) can never produce a value like
  the square root of `2` precisely, only approximate it.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index`.
  - *Its use:* reading a point's own `x` and `y` coordinate back out of
    its `[x y]` pair.
- **`-`** / **`+`** / **`*`**
  - *What they are:* Clojure's subtraction, addition, and
    multiplication functions.
  - *Implementation:* `(- a b)`, `(+ a b)`, `(* a b)` return the
    difference, sum, and product.
  - *Their use:* `-` computes a coordinate shift and a coordinate
    difference; `*` squares that difference; `+` sums the two squared
    differences into a total.
- **`Math/sqrt`**
  - *What it is:* a **static method** — one that belongs to a class
    itself, not to any particular constructed object of that class —
    from Java's own `Math` class, part of the standard library the JVM
    (and, by extension, Babashka, which runs on the JVM) provides
    directly. This is this curriculum's first use of **Java interop**:
    Clojure code calling directly into the host platform underneath it,
    rather than something Clojure itself defines.
  - *Implementation:* `(Math/sqrt x)` — the `ClassName/methodName`
    syntax calls a static method with no object to construct first;
    given a non-negative number `x`, it returns the non-negative real
    number whose square is `x`, as a floating-point value (a `double`).
  - *Its use:* converting an exact, always-correct squared distance into
    a genuine real-world distance value — something no combination of
    `+`, `-`, and `*` alone can ever produce, since a square root is
    frequently irrational.

---

## Concept Unit: Points as Coordinates, Relative to a Chosen Origin

### The Problem

Geometry needs a way to talk about "where" something is precisely
enough to compute with — not point at it, not describe it in words, but
represent it as data a function can actually take as an argument. What
does it mean, concretely, to say a point "is at" some specific
location — and is that location a fact about the point itself, or a fact
about something else entirely?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because coordinate geometry is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-point [x y]
  [x y])

(defn point-x [point] (get point 0))
(defn point-y [point] (get point 1))

(defn translate-point [point offset-x offset-y]
  (make-point (- (point-x point) offset-x) (- (point-y point) offset-y)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def p (make-point 5 3))
#'user/p
user=> p
[5 3]
user=> (def p-shifted (translate-point p 2 2))
#'user/p-shifted
user=> p-shifted
[3 1]
```

### Mechanical Walkthrough

`(defn make-point [x y] [x y])` — `defn`, reappearing, names a
function that just wraps its two arguments in a vector — the
established vector-as-pair convention, applied here to a genuinely new
domain: two numbers describing a *location*, not a resource, a lock, or
a node.

`(defn point-x [point] (get point 0))` / `(defn point-y [point] (get
point 1))` — `get`, reappearing, two small named accessors, reading a
point's coordinates back out by position.

`(defn translate-point [point offset-x offset-y] ...)` — `-`,
reappearing, twice: subtracts `offset-x` from the point's own `x`
coordinate, and `offset-y` from its own `y` coordinate, then rebuilds a
new point from the results via `make-point`.

Trace: `p` is `[5 3]` — a point, five units along the `x` axis, three
along `y`, *relative to whatever origin is currently being used*.
`(translate-point p 2 2)` shifts that origin by `(2, 2)` — imagine a new
origin placed two units over and two units up from the old one. The
*same physical point*, described relative to *this new origin*, is now
`[3 1]`. Nothing about the point's real location changed; only the
numbers describing it did, because the thing they're measured from
changed.

### CS Lens

This is the entire content of a **coordinate system**, made concrete: a
coordinate is never a standalone fact, it's a *relationship* between a
point and a chosen origin. `translate-point` doesn't move anything in
the world — it recomputes the same relationship against a different
reference. This is worth taking seriously before anything else in this
section is built, because every later lesson's own numbers — a vector's
components, a matrix's entries — inherit this same relativity: they are
always relative to *some* chosen frame, never absolute facts about the
geometric object itself.

Also recognized in: a GPS coordinate, meaningless without agreeing the
Earth's own center (or some other reference point) is what "latitude and
longitude" are measured from; a "3 blocks north, 2 blocks east" set of
directions, which describes the same destination completely differently
depending on which corner you're currently standing on; a spreadsheet's
relative cell reference, recalculating to a different actual cell
depending on where the formula containing it is pasted.

### SE Lens

The alternative would be to try to represent a point's location as some
kind of *absolute*, origin-free fact — and there is no such
representation; every numeric description of "where" something is has
to be relative to *something*, even if that something is left implicit
and never questioned. The real engineering cost of leaving it implicit:
two systems that quietly assume *different* origins will disagree about
where the exact same real point is, with nothing in either system's own
numbers revealing the mismatch — the same class of silent, plausible-
looking-but-wrong bug this curriculum has met before in different
clothes (Lesson 227's ambiguous `-1`, Lesson 228's clock skew). Making
the origin an explicit, nameable choice — as `translate-point` does — is
what keeps that disagreement checkable instead of invisible.

---

## Concept Unit: Squared Distance — Invariant Under a Shifted Origin

### The Problem

Two points, each described as coordinates, have some real relationship
to each other — how far apart they are — that intuitively shouldn't
depend on which origin happened to be chosen to write those coordinates
down. Unit 1 proved that a *single* point's own coordinates genuinely
do change under a shifted origin. Does the distance *between two
points* change too, or is it something a coordinate system can't
actually alter?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because coordinate geometry is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn point-distance-squared [p1 p2]
  (+ (* (- (point-x p2) (point-x p1)) (- (point-x p2) (point-x p1)))
     (* (- (point-y p2) (point-y p1)) (- (point-y p2) (point-y p1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def p1 (make-point 0 0))
#'user/p1
user=> (def p2 (make-point 3 4))
#'user/p2
user=> (point-distance-squared p1 p2)
25
```

Now translate *both* points by the identical offset and recompute:

```
user=> (def p1t (translate-point p1 10 -7))
#'user/p1t
user=> (def p2t (translate-point p2 10 -7))
#'user/p2t
user=> p1t
[-10 7]
user=> p2t
[-7 11]
user=> (point-distance-squared p1t p2t)
25
```

### Mechanical Walkthrough

`(defn point-distance-squared [p1 p2] ...)` — `defn`, reappearing.
The body computes, in order: `(- (point-x p2) (point-x p1))` — `-` and
`point-x`, both reappearing — the difference between the two points'
`x` coordinates; `(* ... ...)` — `*`, reappearing — that same
difference multiplied by itself, squaring it (deliberately written as
`(* d d)` rather than a bare exponent, since no exponentiation operator
has been introduced in this curriculum). The identical shape repeats
for `y`: `(- (point-y p2) (point-y p1))`, squared the same way. `+`,
reappearing, sums the two squared differences into one total.

Trace the first call: `p1` is `[0 0]`, `p2` is `[3 4]`. The `x`
difference is `3 - 0 = 3`, squared is `9`. The `y` difference is
`4 - 0 = 4`, squared is `16`. `9 + 16 = 25` — instantly recognizable as
`5²`, the classic `3`-`4`-`5` right triangle.

Now trace the translated call: `p1t` is `[-10 7]` (from `translate-
point p1 10 -7`: `0 - 10 = -10`, `0 - (-7) = 7`). `p2t` is `[-7 11]`
(from `3 - 10 = -7`, `4 - (-7) = 11`). The `x` difference is `-7 -
(-10) = 3` — *the identical difference as before*. The `y` difference
is `11 - 7 = 4` — also identical. Squaring and summing produces `25`
again, exactly. Every individual coordinate changed completely under
the translation — `0` became `-10`, `4` became `11` — but the
*differences between corresponding coordinates* did not change at all,
because both points were shifted by the exact same amount, and
subtraction cancels a shared shift out perfectly.

### CS Lens

Distance-squared is **translation-invariant**, proven here rather than
just asserted: shifting an origin adds the identical offset to every
point's every coordinate, and a *difference* between two coordinates
that both received the same addition is completely unaffected by it —
`(a + k) - (b + k) = a - b`, for any shift `k`. This is the first
concrete instance, in this curriculum, of a genuinely important idea in
geometry and physics both: some quantities are properties of the
*relationship* between objects (distance, angle, shape) and are real
regardless of how they're measured; others (a single point's own
coordinates) are properties of the *measurement itself* and change
freely with the choice of measurement frame. Confusing the two — mistaking
a coordinate-dependent fact for a coordinate-independent one — is a real,
recurring source of error in any system that reasons about geometry.

Also recognized in: a temperature reading in Celsius versus Fahrenheit —
the *numbers* differ completely, but whether one day is hotter than
another is a real fact neither scale can change; a stock's percentage
change, identical whether measured in dollars or another currency, even
though the absolute price numbers look completely different in each; two
maps of the same city drawn with different corners as "the top-left," on
which every street's own coordinates differ but the actual distance
between any two landmarks is exactly the same.

### SE Lens

The alternative to deriving this — simply assuming distance behaves
sensibly under a shifted origin, without ever proving it — is what most
practical geometry code silently does, and it's usually fine, because
the fact really is true. The value of deriving it explicitly here,
rather than only asserting it, is the same value this curriculum has
placed on real proof throughout: a fact that's merely assumed can't be
distinguished, by a reader, from a fact that merely happens to be true
in the one example shown — `point-distance-squared`'s own algebra
(`(a + k) - (b + k) = a - b`) is what makes this genuinely, provably true
for *any* shift, not just the specific `(10, -7)` offset this trace
happened to use.

---

## Concept Unit: Real Distance — Calling Into the Host Platform

### The Problem

`point-distance-squared` answers "which pair of points is closer" (a
smaller squared distance always means a smaller real distance, since
squaring never reverses order for non-negative numbers), but it doesn't
answer "how far apart, in ordinary units, are these two points really."
For that, the square root of the squared distance is needed — and
`+`, `-`, and `*` alone, exact as they are, can never produce a square
root; there is no way to write "the square root of `2`" as a finite
combination of whole numbers and ordinary exact arithmetic.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because coordinate geometry is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn point-distance [p1 p2]
  (Math/sqrt (point-distance-squared p1 p2)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (point-distance p1 p2)
5.0
```

Now a case where the answer genuinely is not a whole number:

```
user=> (def p3 (make-point 0 0))
#'user/p3
user=> (def p4 (make-point 1 1))
#'user/p4
user=> (point-distance-squared p3 p4)
2
user=> (point-distance p3 p4)
1.4142135623730951
```

### Mechanical Walkthrough

`(defn point-distance [p1 p2] (Math/sqrt (point-distance-squared p1
p2)))` — `point-distance-squared`, reappearing, computes the exact
squared distance first, as always. `Math/sqrt` is new: the
`ClassName/methodName` syntax — `Math`, the class name; `sqrt`, the
method name — calls a **static method**, one that belongs to the `Math`
class itself rather than to any specific object built from it, meaning
there's nothing to construct first, no `new` step, just a direct call.
`Math` isn't something this curriculum's own Clojure code defined — it's
part of Java's own standard library, always present because Babashka
(like every Clojure implementation) runs on the JVM, and this is this
curriculum's first genuine reach *past* Clojure itself into that
underlying platform.

Trace the first call: `point-distance-squared p1 p2` computes `25`
exactly, as Unit 2 already established; `(Math/sqrt 25)` returns `5.0`
— note the `.0`, a real, floating-point value, not the exact integer
`5` Clojure's own arithmetic would have produced from `(+ 2 3)`. Trace
the second call: `point-distance-squared p3 p4` computes `2` — `(1-0)²
+ (1-0)² = 1 + 1`. `(Math/sqrt 2)` returns `1.4142135623730951` — a
genuinely irrational number, √2, and this is exactly as many digits as
a `double` can hold; the true value continues forever with no repeating
pattern, and this is Clojure's own best finite approximation of it,
represented internally exactly the way Lesson 189's IEEE-754 format
already established: a sign, an exponent, and a fixed number of
significant bits, incapable of storing an infinite, non-repeating
decimal exactly, only approximating it as closely as that fixed bit
budget allows.

### CS Lens

This is **Java interop**: Clojure code, running on the JVM, calling
directly into a class the JVM's own standard library provides, using
`ClassName/methodName` for a static method. Nothing about this is
special-cased or magic — `Math` is a real, ordinary Java class, `sqrt`
a real, ordinary static method on it, exactly as inspectable and
documented as any Clojure function this curriculum has built, just
written in a different language and reached through a different syntax.
Clojure was deliberately designed to make this kind of direct access to
its host platform's own standard library easy and idiomatic, rather
than requiring every numeric or system capability to be reimplemented
in Clojure itself from scratch.

Also recognized in: a Python program calling a C library function
through a foreign-function interface, reaching past the language it's
written in for a capability the host platform already provides; a
website's JavaScript calling a browser's own built-in `Date` or
`fetch` functionality, not something the page's own script defined;
any high-level language's standard math library, which is frequently
not implemented in that language at all, but delegated to decades-old,
highly optimized routines the underlying operating system or hardware
already provides.

### SE Lens

The alternative would be implementing square root entirely in Clojure —
genuinely possible (Newton's method, iteratively refining a guess, is
not complicated) — and choosing not to is a real, deliberate tradeoff:
`Math/sqrt` is implemented in highly optimized, extensively tested code
that's been refined for decades, likely backed directly by a single
hardware instruction on the actual processor; a from-scratch Clojure
version would be slower, and — a real risk worth naming honestly — could
easily be subtly less accurate at the outer edges of floating-point
precision than the version the platform itself provides. Reaching for
`Math/sqrt` instead of reimplementing it is the same judgment this
curriculum has made before for genuinely foundational capabilities
(Lesson 191's addressable memory standing in for real RAM, Lesson 217's
`test-and-set` standing in for a real hardware instruction) — some
things are worth taking as a trusted, given capability rather than
re-deriving from first principles every time they're needed.

---

## Connect the Pieces

Follow the pair of points `p1` and `p2` through every unit built in this
lesson. `make-point` (Unit 1) gives them coordinates, `[0 0]` and `[3
4]`, meaningful only relative to whichever origin is currently in use.
`translate-point` (Unit 1, reused in Unit 2) shifts that origin,
producing completely different coordinates, `[-10 7]` and `[-7 11]`, for
the exact same two physical points — proving coordinates are a chosen
representation, not a fact about the points themselves.
`point-distance-squared` (Unit 2), computed against *both* the original
and the shifted coordinates, returns the identical `25` either time —
proving that while a point's own coordinates are relative to the chosen
origin, the *distance* between two points is not, a real, provable fact
about the relationship between them that no choice of coordinate system
can alter. `point-distance` (Unit 3) then converts that exact, always-
correct squared value into the real number a person would actually call
"the distance" — `5.0` here, reaching, for the first time in this
curriculum, past Clojure's own arithmetic into the JVM's own `Math`
class to do it, because no combination of exact rational arithmetic
could ever produce a square root on its own.

## What Breaks Without This

Compute distance using the coordinates directly, without first
computing the *difference* between them — a plausible-looking but wrong
shortcut:

```clojure
(defn point-distance-squared-broken [p1 p2]
  (+ (* (point-x p2) (point-x p2)) (* (point-y p2) (point-y p2))))
```

Run it against the exact same translated points from Unit 2:

```
user=> (point-distance-squared-broken p1 p2)
25
user=> (point-distance-squared-broken p1t p2t)
170
```

Against the *original* coordinates, this broken version happens to
produce the correct `25` — `p1` was `[0 0]`, so squaring `p2`'s raw
coordinates accidentally equals squaring the *difference* this one
time. Against the *translated* coordinates, it produces `170`, wildly
different from the correct, translation-invariant `25` — because it
squares `p2t`'s own raw coordinates, `[-7 11]`, instead of the
difference between `p1t` and `p2t`. This is the exact danger Unit 1's
own opening point named directly: treating a coordinate-dependent
number as though it were a real, standalone fact. Restoring the actual
coordinate *differences* — not the raw coordinates themselves — brings
the correct, origin-independent `25` back in both cases.

## Exercises

1. Extend `make-point`, `point-x`/`point-y`, and `point-distance-squared`
   to three dimensions (`x`, `y`, `z`), and confirm the `3`-`4`-`5`-style
   triple `(0,0,0)` to `(2,3,6)` produces a squared distance of `49` —
   a real `7`-unit distance.
2. Write a `points-equidistant?` predicate that compares two candidate
   points' `point-distance-squared` from a fixed third point, without
   ever calling `Math/sqrt` at all, and explain in one sentence why
   comparing squared distances is sufficient to answer "which is
   closer" without needing the real (irrational) distance at all.
3. Translate a set of three points by the same offset, confirm every
   pairwise distance among them is preserved, and state, in your own
   words, why this proves translating an entire shape rigidly (not just
   two isolated points) never changes that shape's own size.

## Definition of Done

- [ ] `make-point`, `point-x`, `point-y`, `translate-point`,
      `point-distance-squared`, and `point-distance` all defined and run
      in a live `bb` REPL, matching every transcript shown above
      exactly.
- [ ] Unit 1's translation reproduced, confirming a point's own
      coordinates genuinely change under a shifted origin.
- [ ] Unit 2's translation-invariance proof reproduced, with the exact
      `25` matching before and after translation.
- [ ] Unit 3's two `Math/sqrt` calls reproduced, one producing a whole
      number and one producing a genuinely irrational value.
- [ ] Exercise 1 completed, extending this lesson's own functions to
      three dimensions.
- [ ] `git commit -m "Add Lesson 231: points as coordinates relative to
      a chosen origin, translation-invariant squared distance, and real
      distance via this curriculum's first Java interop call"`
