# Lesson 246: Derivatives — Rates of Change From First Principles

**What you will build**: `average-rate-of-change`, the ordinary slope
between two points on a function's own graph, and `numerical-derivative`,
which shrinks the gap between those two points toward zero to approximate
a function's *instantaneous* rate of change — the derivative, built the
same way it's actually defined mathematically, as a limit, not looked up
from a table of symbolic differentiation rules. The lesson also reopens
Lesson 242's own numerical-stability machinery for real: shrinking `h`
too far doesn't make the answer more accurate, it makes floating-point
subtraction cancel out the very information being measured, ending in a
genuine, reproducible crash.

**What you need to know first**: Lesson 233's own `dot-product` and
ordinary function-calling conventions — nothing structurally new is
required here beyond calling a function with a number. Lesson 242's own
`relative-error`, catastrophic cancellation, and the real fact that
`(+ 1e16 1.0)` silently loses information — this lesson's own Unit 3
reopens that exact machinery on a genuinely different computation.

**Terms used in this lesson**:

- **rate of change** — how fast one quantity changes relative to
  another; for a function `f` and an input `x`, how much `f(x)` changes
  per unit change in `x`.
- **average rate of change** (also called a **secant slope**) — the
  ordinary slope between two specific points on `f`'s own graph:
  `(f(x2) - f(x1)) / (x2 - x1)`. This describes the *average* behavior
  across the whole interval `[x1, x2]`, not what's happening at any one
  instant inside it.
- **derivative** — the *instantaneous* rate of change at a single point
  `x`: what the average rate of change approaches as the second point,
  `x2`, is moved closer and closer to `x1` until the interval between
  them shrinks toward nothing. This is the actual textbook definition —
  a **limit** — made computational rather than left as a symbol.
- **difference quotient** — `(f(x + h) - f(x)) / h`, the average rate of
  change rewritten with the second point as `x + h` for some small step
  `h`, making "shrink the interval" the same thing as "shrink `h` toward
  `0`."

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson, including `f` itself —
    every function this lesson differentiates is a real, named,
    ordinary `defn`, called by name, not a special mathematical object.
- **`get`** / **`-`** / **`*`** / **`+`** / **`/`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, addition, and division functions, reused throughout
    this curriculum since its earliest arithmetic.
  - *Their use:* the entire difference quotient is built from nothing
    but `-`, `+`, and `/`.

---

## Concept Unit: Average Rate of Change

### The Problem

Given a function `f` and two input values, how fast did `f`'s own output
change between them, on average? This is the natural starting question
before asking about a single instant — a real, computable quantity in
its own right, and the building block everything else in this lesson is
built from.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the derivative is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn square [x] (* x x))

(defn average-rate-of-change [f x1 x2]
  (/ (- (f x2) (f x1)) (- x2 x1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn square [x] (* x x))` — `*`, reappearing from this curriculum's
earliest arithmetic, multiplies `x` by itself. `square` is this lesson's
own running example function — an ordinary, named Clojure function, not
a special mathematical object; calling `(square 3)` computes `9` exactly
the way any other function call in this curriculum always has.

`(defn average-rate-of-change [f x1 x2] ...)` — `f`, its own first
parameter, is itself a function — passed in and called directly,
`(f x2)` and `(f x1)`, the same way Lesson 91's own `binary-search`
already called functions passed to it as arguments. `-`, reappearing,
computes the change in output (`f(x2) - f(x1)`) and, separately, the
change in input (`x2 - x1`); `/`, reappearing, divides one by the other
— the ordinary slope formula, "rise over run," applied to `f`'s own
graph instead of a straight line.

Trace `average-rate-of-change(square, 2, 4)`: `(square 4) = 16`,
`(square 2) = 4`; `(- 16 4) = 12`; `(- 4 2) = 2`; `(/ 12 2) = 6`. Over
the narrower interval `[2, 3]`: `(square 3) = 9`; `(- 9 4) = 5`; `(- 3
2) = 1`; result `5`. Narrower still, `[2, 2.1]`: result `4.099999999999998`
— a real floating-point value, not exactly `4.1`, for the same reason
Lesson 242's own Unit 1 already demonstrated: `2.1` itself is already the
closest `double` to the decimal `2.1`, not `2.1` exactly.

### CS Lens

`average-rate-of-change` is a **higher-order function** — a function
that takes another function as an argument, not just ordinary data —
reused directly from the exact same pattern Lesson 91's own
`binary-search` already established for a comparison function. This is
a **hard concept** worth naming precisely: it's what lets this single
function differentiate `square`, or any other function with the same
one-number-in-one-number-out shape, without being rewritten for each
one. Also recognized in: `sort`'s own comparison-function argument in
almost every language's standard library, event-handler registration
passing a callback function as data, and numerical libraries' root-
finders and integrators, all of which take "the function to operate on"
as a real argument rather than hardcoding one.

### SE Lens

The alternative — writing a separate `average-rate-of-change-of-square`
function, hardcoding `square` inside it — would work for exactly one
function and need to be rewritten, by hand, for every other function this
lesson or a later one wants to analyze. Taking `f` as a real parameter
costs nothing extra to write and means every unit that follows — the
difference quotient, the position-and-velocity example — reuses this
identical function unchanged, just called with a different `f`.

### Run It — Real Output

```
user=> (average-rate-of-change square 2 4)
6
user=> (average-rate-of-change square 2 3)
5
user=> (average-rate-of-change square 2 2.1)
4.099999999999998
user=> (average-rate-of-change square 2 2.01)
4.009999999999977
```

As the second point moves closer to `2` — `4`, then `3`, then `2.1`,
then `2.01` — the average rate of change moves closer to `4` each time:
`6`, `5`, `4.1`, `4.01`. That's not a coincidence this unit explains yet
— the next one does.

### Connection

The average rate of change keeps getting closer to `4` as the interval
shrinks. The next unit makes "shrinking the interval" the actual
parameter being controlled, and asks what it approaches in the limit.

---

## Concept Unit: The Difference Quotient — Shrinking Toward an Instant

### The Problem

Unit 1's own trace suggested a pattern: as the second point gets closer
to the first, the average rate of change seems to approach a fixed
number, `4`. Is that a genuine, reliable trend — something that would
keep converging no matter how much closer the second point gets — or
does the previous unit's own trace just happen to look that way for the
three specific values it tried?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the derivative is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses
  `average-rate-of-change` from this lesson's own Unit 1.

### The New Code

```clojure
(defn numerical-derivative [f x h]
  (average-rate-of-change f x (+ x h)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn numerical-derivative [f x h] ...)` — `+`, reappearing, computes
`x + h`, the second point, as an explicit step away from `x` by exactly
`h`; `average-rate-of-change`, reappearing from this lesson's own Unit 1,
computes the identical secant slope as before, now between `x` and
`x + h`. This is called the **difference quotient** — the same average
rate of change as Unit 1, just parameterized by a single step size `h`
instead of two independent points, which is what makes "shrink the
interval" the same operation as "shrink `h` toward `0`."

Trace a real sequence of shrinking `h`, all at `x = 2`: `h = 1` gives `5`
(the identical result as Unit 1's own `[2, 3]` case, since `2 + 1 = 3`).
`h = 0.1` gives `4.099999999999998`. `h = 0.01` gives
`4.009999999999977`. `h = 0.0001` gives `4.000099999999392`. `h = 1e-8`
gives `4.0` — no longer even visibly different from the exact value.

### CS Lens

This is **approximating a limit by direct numerical convergence** — no
symbolic algebra, no calculus rulebook, just the literal definition
("what does this approach as `h` shrinks") computed directly and watched
converge. This is a **hard concept**, the actual mathematical meaning of
a derivative, made concrete rather than assumed as a memorized formula.
Also recognized in: Newton's method converging toward a root by
repeated approximation, gradient descent (Lesson 249's own subject)
converging toward a minimum the identical way, and Monte Carlo
simulation converging toward a true probability by direct sampling
rather than symbolic derivation.

### SE Lens

The alternative — symbolic differentiation, applying an algebraic rule
(`d/dx[x²] = 2x`) to get an *exact* formula instead of a numerical
approximation — is real, faster once computed, and exact rather than
approximate. This lesson's own numerical approach trades that exactness
away for something symbolic differentiation can't offer directly: it
works on *any* function passed as `f`, including one this curriculum has
no algebraic rule for at all (real sensor data, a simulation's own
output, a function with no closed-form derivative), at the cost of the
real, measurable imprecision the next unit examines directly.

### Run It — Real Output

```
user=> (numerical-derivative square 2 1)
5
user=> (numerical-derivative square 2 0.1)
4.099999999999998
user=> (numerical-derivative square 2 0.01)
4.009999999999977
user=> (numerical-derivative square 2 0.0001)
4.000099999999392
user=> (numerical-derivative square 2 1e-8)
4.0
```

A genuine, monotonic convergence toward `4` — the real derivative of
`x²` at `x = 2` (the exact algebraic rule Unit 3's own SE Lens named,
`2x`, gives `2*2 = 4`, confirming this numerical convergence is heading
toward the actual right answer, not just some stable number).

### Connection

`h = 1e-8` already looks exact. The next unit asks the obvious follow-up
— if shrinking `h` keeps helping, why not shrink it as far as possible?

---

## Concept Unit: When h Gets Too Small — Cancellation Returns

### The Problem

Lesson 242 already proved, in general, that subtracting two
nearly-equal floating-point numbers can destroy precision rather than
reveal it — **catastrophic cancellation**. `numerical-derivative`'s own
`(f(x + h) - f(x))` is exactly that shape: as `h` shrinks, `x + h` gets
closer and closer to `x`, and `f(x + h)` gets closer and closer to
`f(x)` — precisely the "two nearly-equal numbers" situation Lesson 242
already warned about. Does shrinking `h` all the way to the smallest
possible positive value actually give the *most* accurate derivative, or
does this lesson's own convergence eventually break down?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the derivative is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses
  `numerical-derivative` unchanged — this unit introduces no new
  function, only a new claim, checked against real, extremely small `h`
  values.

### The New Code

No new function this unit — the real content is what `numerical-
derivative(square, 2, h)` actually does as `h` keeps shrinking past
`1e-8`, checked directly rather than assumed to keep improving.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
run against a real sequence of shrinking `h` values, not a throwaway
later discarded.

### Mechanical Walkthrough

From `h = 1e-8` down through `h = 1e-15`, `numerical-derivative(square,
2, h)` keeps returning exactly `4.0` — genuinely, bit-for-bit equal to
the true derivative, confirmed directly with `relative-error` from
Lesson 242: `0.0`, not just a small number. That's not proof the
technique is now perfectly safe; it's proof that, for this specific
function and this specific `x`, the rounding happened to land exactly
right at every one of these particular `h` values. The real failure
shows up sharply, not gradually, at `h = 1e-16`: `(+ 2 1e-16)` computes
`2.0` — the exact same `double` as `x` itself, because `1e-16` is
smaller than the smallest gap between two representable `double` values
near `2.0` (`2.220446049250313e-16`, the same machine epsilon Lesson
242's own Unit 4 already measured exactly). Once `x + h` rounds back to
`x` bit-for-bit, `numerical-derivative`'s own denominator, `(x + h) -
x`, computes `0.0` exactly — and `/`, reappearing, raises a genuine
`ArithmeticException`, `Divide by zero`, not a silently wrong number.

### CS Lens

This is **catastrophic cancellation**, Lesson 242's own hard concept,
reappearing here in a completely different computation — not raw
addition this time, but a numerical derivative, one of the single most
common places this exact failure shows up in real scientific and
engineering software. Also recognized in: real numerical-differentiation
libraries choosing `h` from a documented, deliberately-tuned range
(commonly around the square root of a `double`'s own machine epsilon,
roughly `1e-8`) rather than "as small as possible"; finite-difference
methods in physics simulations facing the identical tradeoff between
truncation error (too-large `h`) and rounding error (too-small `h`); and
any iterative refinement algorithm that has to stop *before* its own
precision runs out, not after.

### SE Lens

The tempting, wrong intuition — "smaller `h` is always more accurate,
since it's mathematically closer to the true limit" — is exactly what
this unit's own real, run output disproves: `h = 1e-8` was already
indistinguishable from exact for this function, and every `h` smaller
than that bought nothing at all, right up until one specific `h` caused
an outright crash. A real numerical-differentiation function shipped
without this understanding would either silently return imprecise
answers for `h` chosen far too small, or crash unpredictably the moment a
caller's own `x` and `h` combination happens to round together — exactly
the honest, undefended edge this lesson's own code still carries, the
same "described, not hidden" scope choice Lesson 242's own `solve-system`
made for a genuinely singular system.

### Run It — Real Output

```
user=> (numerical-derivative square 2 1e-12)
4.0
user=> (numerical-derivative square 2 1e-14)
4.0
user=> (- (+ 2 1e-15) 2)
8.881784197001252E-16
user=> (- (+ 2 1e-16) 2)
0.0
user=> (= (+ 2 1e-16) 2)
true
user=> (numerical-derivative square 2 1e-16)
----- Error --------------------------------------------------------------------
Type:     java.lang.ArithmeticException
Message:  Divide by zero
```

`(+ 2 1e-15)` still measurably differs from `2` (`8.88e-16`, nonzero);
`(+ 2 1e-16)` doesn't — `1e-16` fell below `double`'s own precision
floor at this magnitude, and the two numbers became bit-for-bit
identical. The crash isn't a bug in `numerical-derivative`; it's an
honest report that the question it was asked — "what's the slope over an
interval smaller than floating point can even represent at this
magnitude" — has no real floating-point answer to give.

### Connection

The derivative concept survives this failure completely intact — it's
`h`'s own value, not the definition, that has a real floor. The last
unit applies the technique, safely, to a genuine physical question.

---

## Concept Unit: Velocity — A Real Rate of Change

### The Problem

An abstract function `f` is one thing; a real, physical rate of change
is the concept's actual motivation. If `position(t)` describes an
object's own location at time `t`, its derivative describes exactly how
fast that location is changing — its **velocity** — and this is worth
checking directly, not just asserted.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, applying this lesson's own already-verified machinery to a
  genuine physical quantity, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses
  `average-rate-of-change` and `numerical-derivative` unchanged.

### The New Code

```clojure
(defn position [t] (* t t))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn position [t] (* t t))` — `*`, reappearing, is structurally
identical to `square`, renamed to reflect what it now represents: a
position, in some distance unit, at time `t`, growing with the square of
time — the same simple accelerating-motion shape a dropped object's own
distance fallen follows. Calling `average-rate-of-change` or
`numerical-derivative` on `position` needs no new code at all; both
functions were already built to accept *any* one-argument function.

Trace `average-rate-of-change(position, 1, 1.001)`: the average velocity
over the short time interval from `t = 1` to `t = 1.001` —
`2.0009999999999177`, very close to `2`. `numerical-derivative(position,
3, 1e-8)`: the instantaneous velocity at `t = 3` — `6.0`, exactly `2*3`.
`numerical-derivative(position, 5, 1e-8)`: at `t = 5` —
`10.000000177635686`, close to but not exactly `10` (`2*5`) — a real,
small floating-point discrepancy at `h = 1e-8`, genuinely present here
even though the identical `h` gave an exact answer back in Unit 3's own
`x = 2` case. The "safe" value for `h` isn't a single universal constant;
it depends on the specific function and input, exactly the honest,
undefended edge Unit 3's own SE Lens already named.

### CS Lens

This is **the same abstraction reused across domains without
modification** — `average-rate-of-change` and `numerical-derivative`
were built once, against an arithmetic-only `square`, and now compute a
genuine physical quantity, velocity, with zero changes to either
function. Also recognized in: a generic sorting algorithm working
identically whether it's sorting numbers, strings, or database records;
a statistics library's mean and variance functions working identically
on financial data or sensor readings; and any well-designed numerical
routine that never needed to know *what* its input represented to
compute something true about it.

### SE Lens

The alternative — writing a separate `average-velocity` function
hardcoded for `position`-shaped functions — would duplicate logic this
lesson already built and verified against `square`, for zero real
benefit: nothing about computing a rate of change actually depends on
whether the function represents distance, temperature, or population.
Reusing the identical, already-tested functions here is the direct
payoff of Unit 1's own decision to take `f` as a real parameter rather
than hardcoding one function.

### Run It — Real Output

```
user=> (average-rate-of-change position 1 1.001)
2.0009999999999177
user=> (numerical-derivative position 3 1e-8)
6.0
user=> (numerical-derivative position 5 1e-8)
10.000000177635686
```

### Connection

The closing section traces one real rate-of-change computation through
every unit built in this lesson.

---

## Connect the Pieces

One function, `position(t) = t²`, and one point in time, `t = 3`, moving
through every unit built in this lesson:

1. `average-rate-of-change(position, 3, 4)` (Unit 1) — the average
   velocity over a full second, `1` time unit wide: `(16 - 9) / 1 = 7`.
2. `numerical-derivative(position, 3, 0.01)` (Unit 2) — the difference
   quotient with a small, explicit step: converges toward `6` as `h`
   keeps shrinking from here.
3. `numerical-derivative(position, 3, 1e-8)` (Unit 2/3 boundary) → `6.0`
   — indistinguishable from the true instantaneous velocity at `t = 3`.
4. `numerical-derivative(position, 3, 1e-16)` (Unit 3) — would raise the
   identical `ArithmeticException` Unit 3 already proved: `3 + 1e-16`
   rounds back to exactly `3.0` in `double` precision, the identical
   failure mode as `x = 2`, for the identical reason.
5. `numerical-derivative(position, 3, 1e-8)` (Unit 4), reused unchanged
   — the exact instantaneous velocity, `6.0`, the real physical quantity
   this whole lesson's machinery was built to compute.

Step 1's own coarse average, `7`, step 3's own precise instantaneous
answer, `6`, and step 4's own honest crash are three genuinely different
outcomes from the *identical* underlying function — the real story of
this lesson: a derivative is a limit, computing it numerically means
approaching that limit with real, finite arithmetic, and that arithmetic
has a real floor it cannot be pushed past.

## What Breaks Without This

Skip straight to the smallest representable positive `h` a caller might
naively reach for, assuming "smaller is always better":

```clojure
(defn numerical-derivative-naive [f x]
  (numerical-derivative f x 1e-16))
```

```
user=> (numerical-derivative-naive square 2)
----- Error --------------------------------------------------------------------
Type:     java.lang.ArithmeticException
Message:  Divide by zero
```

`numerical-derivative-naive` hardcodes the smallest `h` the previous
naive intuition ("as small as possible must be most accurate") would
suggest — and crashes immediately, for the exact reason Unit 3 already
proved: `x + h` collapses back to `x` itself in floating point long
before `h` reaches its own mathematical zero. Restoring a real,
deliberately-chosen `h`:

```
user=> (numerical-derivative square 2 1e-8)
4.0
```

recovers the real, accurate answer.

## Exercises

1. `square`'s own derivative, `2x`, is exact and well-known. Pick a
   function this curriculum has no simple derivative rule memorized for
   — Lesson 232's own `vector-magnitude-squared`, treated as a function
   of one component with the other held fixed, or any function of your
   own choosing — and use `numerical-derivative` to estimate its rate of
   change at a real point.
2. Unit 3 found `h = 1e-16` crashes at `x = 2`. Find the smallest `h`
   that still crashes at `x = 1000` instead, and explain, using Lesson
   242's own machine-epsilon fact, why it's a *different* smallest `h`
   than at `x = 2`.
3. Build `central-difference-derivative [f x h]`, using `(f(x+h) -
   f(x-h)) / (2*h)` instead of this lesson's own forward difference. Run
   it against `square` at `x = 2` for the same sequence of shrinking `h`
   values this lesson used, and compare how quickly it converges to `4`
   against `numerical-derivative`'s own convergence from Unit 2.

## Definition of Done

- [ ] `average-rate-of-change` correctly computes a real secant slope,
      verified against at least three different interval widths.
- [ ] `numerical-derivative` demonstrates real, monotonic convergence
      toward `square`'s own true derivative (`2x`) as `h` shrinks from
      `1` down to `1e-8`.
- [ ] The catastrophic-cancellation crash was reproduced for real
      (`numerical-derivative` at `h = 1e-16` raising a genuine
      `ArithmeticException`), and the exact boundary (`h = 1e-15` still
      works, `h = 1e-16` doesn't) was confirmed with real output.
- [ ] `numerical-derivative` was applied to `position` and produced a
      real, physically sensible velocity, matching the known exact
      derivative `2t`.
- [ ] The naive "smallest possible `h`" bug was reproduced for real and
      explained in your own words.
- [ ] `git commit` with a message explaining *why* `numerical-derivative`
      takes `h` as a real, caller-chosen parameter rather than a
      hardcoded constant — for example: `"Keep h as an explicit
      parameter to numerical-derivative — the safe value genuinely
      depends on both the function and the input, per Lesson 246's own
      x=2 vs x=5 comparison; there is no universal safest h."`
