# Lesson 248: Integrals — Accumulation, the Reverse of a Rate

**What you will build**: `riemann-sum`, approximating the real area under
a function's own curve by adding up many thin rectangles' worth of area
— accumulation, built the same honest, numerical way Lesson 246 built
the derivative: by direct computation converging toward a limit, not a
memorized symbolic rule. The lesson closes by proving, with real numbers,
the deep connection between this section's own two ideas: integrating a
function's *derivative* gives back exactly how much the original
function changed — and confronts a genuine, honest limitation this
curriculum's own "no `loop`/`recur`" rule creates here for the first
time: a real `StackOverflowError`, not glossed over.

**What you need to know first**: Lesson 246's own derivative and
difference-quotient reasoning — this lesson builds its numerical
counterpart. Lesson 91's own `(declare ...)` for mutually-referencing
functions, reused here for `riemann-sum`/`riemann-sum-from`. This
curriculum's own standing "no `let`, no `loop`/`recur`" rule (stated in
this project's own build conventions) — `riemann-sum-from` is built as
ordinary recursion, the only tool this curriculum allows for repeating
work, and this lesson's own Unit 2 confronts that choice's real cost
directly.

**Terms used in this lesson**:

- **integral** — the total accumulated amount a function represents
  across an interval — geometrically, the real area between its own
  curve and the horizontal axis.
- **Riemann sum** — a real, computable approximation of an integral:
  slice the interval into many equal-width rectangles, and add up each
  rectangle's own height (the function's value at its left edge) times
  its width.
- **Fundamental Theorem of Calculus** — the deep connection this lesson's
  own Unit 3 confirms numerically: integrating a function's derivative
  across `[a, b]` gives back exactly `f(b) - f(a)`, the original
  function's own total change — accumulation and rate of change are, in
  a precise sense, opposite operations that undo each other.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`declare`**
  - *What it is:* reused unchanged from Lesson 91 — a forward
    declaration, telling Clojure a name will be defined as a function
    before it's actually used.
  - *Implementation:* `(declare name)` — no body, just a promise the
    real `defn` for `name` comes later in the file.
  - *Its use:* `riemann-sum` calls `riemann-sum-from` before it's been
    defined yet in reading order, the identical mutual-reference shape
    Lesson 91's own `binary-search`/`search-at-mid` already used.
- **`get`** / **`-`** / **`*`** / **`+`** / **`/`** / **`=`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, addition, division, and equality functions, reused
    throughout this curriculum since its earliest arithmetic.
  - *Their use:* the entire Riemann sum is built from nothing but these.

---

## Concept Unit: Approximating Area With Rectangles

### The Problem

A function's own graph traces out a curve; the space between that curve
and the horizontal axis, over some interval, is a real geometric
quantity — its area — but for any curve that isn't a straight line,
there's no single rectangle or triangle formula that computes it
directly. The natural first approximation: cut the interval into several
equal pieces, treat the function as flat across each one, and add up the
resulting rectangles.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the integral is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn identity-fn [x] x)

(declare riemann-sum-from)
(defn riemann-sum [f a b n]
  (riemann-sum-from f a (/ (- b a) n) n 0))

(defn riemann-sum-from [f a dx remaining index]
  (if (= remaining 0)
    0
    (+ (* (f (+ a (* index dx))) dx) (riemann-sum-from f a dx (- remaining 1) (+ index 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn identity-fn [x] x)` — the simplest possible one-argument
function, returning its own input unchanged; `f(x) = x`, a straight
line, this lesson's own first running example specifically because its
true area (a triangle) is easy to check by hand.

`(declare riemann-sum-from)` — `declare`, reappearing from Lesson 91,
promises `riemann-sum-from` will be defined later, so `riemann-sum` can
call it below despite being written first.

`(defn riemann-sum [f a b n] ...)` — `/`, reappearing, computes `dx`,
each rectangle's own width: the whole interval's length, `(b - a)`,
divided evenly among `n` rectangles. `riemann-sum-from` is called with
that width, `n` rectangles still remaining, and index `0` — the first
rectangle.

`(defn riemann-sum-from [f a dx remaining index] ...)` — `if`, reused
control flow: when `remaining` reaches `0`, the whole sum is `0` — the
base case, no more rectangles left to add. Otherwise: `+`, reappearing,
adds this rectangle's own contribution to the result of recursing on
everything after it. `(f (+ a (* index dx)))` — `*` and `+`, reappearing,
compute this rectangle's own left edge (`a` plus `index` widths' worth of
steps), then call `f` there — the rectangle's own height. `(* ... dx)` —
height times width, this one rectangle's own area. The recursive call
passes `(- remaining 1)` (one fewer rectangle still to add) and `(+
index 1)` (move to the next rectangle's own position) — real, ordinary
recursion, the only tool this curriculum allows itself for repeating
work, since `loop`/`recur` has been off-limits since early in this
series.

### CS Lens

`riemann-sum-from` is a real **numerical integration** algorithm, and
its own recursive shape is a genuine instance of **recursion carrying an
explicit accumulator-like state** (`remaining`, `index`) forward through
each call, the identical pattern this curriculum has used since Lesson
119 specifically *because* `loop`/`recur` is off-limits. Also recognized
in: every real numerical-integration library (`scipy.integrate`,
MATLAB's own `trapz`), physics engines accumulating a particle's own
position from many small velocity-times-timestep contributions every
single simulated frame, and financial software accumulating compound
interest across many small time periods.

### SE Lens

The alternative — a single closed-form area formula — simply doesn't
exist for most real functions; Riemann sums trade exactness for
generality, working on *any* function this curriculum can call, the
identical tradeoff Lesson 246's own numerical derivative already made.
The real cost specific to *this* implementation: recursion, not `loop`,
means each rectangle adds one real stack frame — a cost this lesson's
own next unit measures directly rather than assumes away.

### Run It — Real Output

```
user=> (riemann-sum identity-fn 0 4 1)
0
user=> (riemann-sum identity-fn 0 4 4)
6
```

One rectangle, spanning the whole interval, uses `f`'s value at the
*left* edge, `f(0) = 0`, as its height — height `0` means area `0`,
badly underestimating the real triangle's area (which is `8`). Four
rectangles do better: `f(0) + f(1) + f(2) + f(3) = 0 + 1 + 2 + 3 = 6`,
each times width `1` — closer, still an underestimate, because a
left-edge rectangle under a rising line always sits below the real
curve.

### Connection

More, thinner rectangles should mean less error — the next unit checks
that directly, and finds a real wall this implementation's own
recursion runs into before the approximation gets as good as it could.

---

## Concept Unit: More Rectangles, Less Error — and a Real Wall

### The Problem

Unit 1's own four-rectangle approximation, `6`, undershoots the real
answer, `8`, by a lot. Does using more, thinner rectangles genuinely
close that gap — and is there any limit to how many rectangles
`riemann-sum` can actually use, or does "more rectangles" scale forever?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the integral is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `riemann-sum`
  unchanged — this unit introduces no new function, only a new
  measurement.

### The New Code

No new function this unit — the real content is `riemann-sum` called
with a growing sequence of `n` values, checked against the real
`n = 2000` failure this implementation actually hits.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
run against a real sequence of rectangle counts, not a throwaway later
discarded.

### Mechanical Walkthrough

`(riemann-sum identity-fn 0 4 10)` gives `7.2`; `100` gives `7.92`;
`1000` gives `7.992` — a real, genuine convergence toward the true
answer, `8`, each tenfold increase in rectangles cutting the remaining
error by roughly a factor of `10`, exactly the behavior a left-edge
Riemann sum is expected to have. Pushing further, to `n = 2000`, doesn't
give an even-better approximation — it raises a real
`java.lang.StackOverflowError`. `riemann-sum-from` is *not* tail-call
optimized the way a `loop`/`recur` version would automatically be in
Clojure (this curriculum's own established, deliberate reason for never
using `loop`/`recur` was never "it has no cost" — it was a choice about
which constructs to teach first); each of `n` rectangles adds one real
frame to the JVM's own call stack before the innermost base case is ever
reached and the additions can start unwinding back out, and somewhere
between `1000` and `2000` rectangles, that stack runs out of room.

### CS Lens

This is a **genuine, load-bearing example of unbounded recursion depth**
— not a bug in this lesson's own arithmetic, a real structural property
of building a sum via ordinary (non-tail) recursion rather than
iteration. `riemann-sum-from`'s own recursive call sits *inside* a `+`
call (`(+ (* ...) (riemann-sum-from ...))`) — meaning the addition can't
happen until the recursive call fully returns, so every pending addition
has to stay on the stack, one frame each, all the way down. Also
recognized in: any naive recursive `sum`/`reduce` implementation without
tail-call handling in a language that doesn't guarantee tail-call
elimination, deeply nested JSON or XML parsers crashing on
pathologically deep real-world input, and exactly the kind of stack
exhaustion this curriculum's own Lesson 192 already demonstrated for a
simulated call stack, now hit for real.

### SE Lens

This is real, honest technical debt this specific lesson's own
implementation carries, not a hidden flaw: a version written with
`loop`/`recur` would run `n` in the millions with no stack cost at all,
since Clojure specifically optimizes that one construct into a real
loop with no growing call stack. This curriculum's own standing rule
against `loop`/`recur` was a deliberate teaching choice (matching Lesson
119's own explicit statement of the same tradeoff), not a claim that
avoiding it is always free — and `riemann-sum`'s own real crash at
`n = 2000` is the concrete, measured price of that choice, worth naming
directly rather than only ever using `n` small enough to hide it.

### Run It — Real Output

```
user=> (double (riemann-sum identity-fn 0 4 10))
7.2
user=> (double (riemann-sum identity-fn 0 4 100))
7.92
user=> (double (riemann-sum identity-fn 0 4 1000))
7.992
user=> (riemann-sum identity-fn 0 4 2000)
----- Error --------------------------------------------------------------------
Type:     java.lang.StackOverflowError
```

`10` → `100` → `1000` rectangles: `7.2` → `7.92` → `7.992`, each step
roughly halving the remaining distance to `8` for every extra factor of
`10` in rectangle count — genuine convergence. `2000` rectangles doesn't
continue that trend at all; it crashes outright, this session's own real,
reproducible ceiling for this specific implementation.

### Connection

`n = 1000` is real, safe, and accurate enough (within `0.008` of the
true area `8`) for everything the rest of this lesson needs. The next
unit uses that same safe range to check a much deeper claim.

---

## Concept Unit: The Fundamental Connection — Integrating a Derivative

### The Problem

Lesson 246 built the derivative — a rate of change. This lesson builds
the integral — an accumulation. Calculus's own deepest classical result
connects them directly: integrating a function's *derivative* across
`[a, b]` should give back exactly how much the original function changed
over that same interval, `f(b) - f(a)` — accumulation undoing a rate of
change, real enough to check with this lesson's own already-built
`riemann-sum`.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the Fundamental Theorem of Calculus is a mathematical
  fact this curriculum is checking directly, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `riemann-sum`
  from this lesson's own Unit 1 and `square` from Lesson 246.

### The New Code

```clojure
(defn double-x [x] (* 2 x))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn double-x [x] (* 2 x))` — `*`, reappearing, computes `2x`. This is
Lesson 246's own already-established exact derivative of `square(x) =
x²` (`d/dx[x²] = 2x`, confirmed numerically back in Lesson 246). Running
`riemann-sum` on `double-x` across `[0, 3]` accumulates `2x`'s own area —
and the Fundamental Theorem's own claim is that this should equal
`square(3) - square(0)`, the original function's total change, not
anything about `double-x`'s own shape directly.

### CS Lens

This is a real, numerically-checked instance of the **Fundamental
Theorem of Calculus** — a genuine **hard concept**, arguably the single
most important theorem in all of calculus, made concrete here as a
direct equality between two completely different computations
(`riemann-sum` accumulating rectangles under `double-x`, versus a plain
subtraction of two `square` values) rather than accepted as a memorized
rule. Also recognized in: signal processing recovering a signal's own
total change from its measured rate of change, control systems
integrating a sensor's own measured velocity to track accumulated
position (exactly Unit 4's own next example), and thermodynamics
recovering total heat transferred by integrating a measured rate of heat
flow.

### SE Lens

Checking this numerically, with real `riemann-sum` output compared
against real `square` output, costs a few extra function calls in
exchange for a claim now backed by this session's own genuine numbers —
the identical standard this curriculum held eigenvectors (Lesson 240)
and gradient direction (Lesson 247) to, rather than treating a
"fundamental theorem" as too authoritative to need its own check.

### Run It — Real Output

```
user=> (double (riemann-sum double-x 0 3 1000))
8.991
user=> (square 3)
9
user=> (square 0)
0
```

`riemann-sum` of `double-x` across `[0, 3]`, with `1000` rectangles,
comes out `8.991` — within Unit 2's own already-established
`n = 1000` error budget of the exact answer, `square(3) - square(0) = 9
- 0 = 9`. Accumulating a rate of change really does reconstruct the
original quantity's own total change.

### Connection

The last unit applies this identical connection to a genuine physical
pair this curriculum already has in hand: velocity and position.

---

## Concept Unit: Integrating Velocity Gives Position

### The Problem

Lesson 246's own `position(t) = t²` had derivative `2t` — its velocity.
The Fundamental Theorem, just confirmed abstractly, makes a very
concrete physical prediction here: accumulating velocity over a time
interval should give exactly the distance actually traveled during that
interval.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, applying this lesson's own already-verified machinery to a
  genuine physical quantity, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `riemann-sum`
  and Lesson 246's own `position`.

### The New Code

```clojure
(defn velocity [t] (* 2 t))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn velocity [t] (* 2 t))` — structurally identical to `double-x`,
renamed to reflect what it represents: `position`'s own exact
derivative, confirmed already in Lesson 246. `riemann-sum` needs no
change at all to accumulate it — the same reuse-without-modification
Lesson 247's own gradient already demonstrated for `bowl`.

### CS Lens

This is the same **abstraction reused across domains** Lesson 247's own
closing unit already gave full treatment — `riemann-sum` was built once,
verified against an abstract straight line and an abstract parabola, and
now computes a genuine physical distance with zero changes. Also
recognized in: a car's own odometer literally performing this exact
integration in hardware, continuously accumulating measured wheel-speed
into total distance traveled; and GPS-based dead reckoning, accumulating
measured velocity when satellite signal is briefly unavailable.

### SE Lens

The identical payoff Lesson 246's own Unit 4 and Lesson 247's own Unit 3
already established: building `riemann-sum` against pure, easy-to-verify
math first, rather than directly against a physical example, means its
correctness is trusted *before* it's ever asked to answer something with
real physical consequences riding on the answer.

### Run It — Real Output

```
user=> (double (riemann-sum velocity 0 5 1000))
24.975
user=> (position 5)
25
user=> (double (riemann-sum velocity 2 5 1000))
20.991
user=> (- (position 5) (position 2))
21
```

Accumulating velocity from `t = 0` to `t = 5` gives `24.975`, matching
`position(5) = 25` within Unit 2's own established error budget — the
total distance traveled in the first `5` time units. Accumulating only
from `t = 2` to `t = 5` gives `20.991`, matching `position(5) -
position(2) = 21` — the distance traveled *during* that later interval
alone, correctly excluding whatever distance was already covered before
`t = 2`.

### Connection

The closing section traces `velocity` and `position` together through
every unit built in this lesson.

---

## Connect the Pieces

`velocity(t) = 2t`, `position(t) = t²`, moving through every unit built
in this lesson:

1. `riemann-sum(velocity, 0, 5, 4)` (Unit 1) — a coarse, `4`-rectangle
   estimate, real but rough.
2. `riemann-sum(velocity, 0, 5, 1000)` (Unit 2) → `24.975` — genuine
   convergence, safely inside this implementation's own real
   recursion-depth ceiling (`n = 2000` would crash, per Unit 2's own
   measured wall).
3. The Fundamental Theorem (Unit 3), applied to this exact pair:
   `velocity` is `position`'s own derivative, so accumulating it should
   reconstruct `position`'s own total change.
4. `position(5) - position(0) = 25` (Unit 4) — the real, exact distance
   traveled, matching step 2's own `24.975` within the expected
   approximation error.

Every function in this trace — `velocity`, `position`, `riemann-sum` —
was built and verified independently, in a different unit, for a
different reason; step 4's own match is real confirmation, not a
coincidence engineered to look tidy.

## What Breaks Without This

Reuse Unit 2's own real crash directly, this time as the thing to fix
rather than only observe:

```clojure
(defn riemann-sum-unsafe [f a b n]
  (riemann-sum-from f a (/ (- b a) n) n 0))
```

```
user=> (riemann-sum-unsafe identity-fn 0 4 5000)
----- Error --------------------------------------------------------------------
Type:     java.lang.StackOverflowError
```

`riemann-sum-unsafe` is identical to `riemann-sum` — the "break" here
isn't a code bug, it's a caller trusting rectangle count can grow without
limit. The honest fix this lesson's own conventions allow is not a
different algorithm (this curriculum still won't reach for `loop`/`recur`
here) but a documented, respected ceiling: choose `n` from the safe range
Unit 2 already measured (comfortably under `2000` for this specific
interval and machine), the same "know your own real limits, don't just
hope" discipline Lesson 224's own write-ahead log and Lesson 214's own
deadlock-avoidance code already practiced in very different domains.
Calling `riemann-sum` within that real, tested range:

```
user=> (double (riemann-sum identity-fn 0 4 1000))
7.992
```

gives a real, safe, accurate answer.

## Exercises

1. Find, by real experiment (not guessing), the largest `n` this
   session's own `bb` can run `riemann-sum` with before it crashes —
   somewhere between Unit 2's own confirmed-safe `1000` and
   confirmed-crashing `2000`. Report the exact boundary you find.
2. Build a **right** Riemann sum (using each rectangle's *right* edge,
   `f(a + (index + 1) * dx)`, instead of its left edge) and compare its
   convergence, at the identical `n` values Unit 2 used, against this
   lesson's own left-edge version for `identity-fn` over `[0, 4]`.
   Explain, in one sentence, which side of the true answer each one
   approaches from, and why.
3. Using `riemann-sum` and Lesson 247's own `bowl(x, y) = x² + y²` held
   fixed at `y = 0` (so it behaves like `square`), confirm the
   Fundamental Theorem connection once more: integrate `double-x` from
   `1` to `4`, and check it against `square(4) - square(1)`.

## Definition of Done

- [ ] `riemann-sum` correctly approximates the real triangular area
      under `identity-fn` from `[0, 4]`, converging toward `8` as `n`
      grows through `10`, `100`, `1000`.
- [ ] The real `StackOverflowError` at `n = 2000` was reproduced for
      real, and explained as a genuine consequence of this curriculum's
      own "no `loop`/`recur`" convention, not a bug.
- [ ] `riemann-sum` was run on `double-x` and confirmed to match
      `square(3) - square(0)` within the established `n = 1000` error
      budget — the Fundamental Theorem, checked numerically.
- [ ] `riemann-sum` was run on `velocity` and confirmed to match
      `position(5) - position(0)` and, separately,
      `position(5) - position(2)` for a sub-interval.
- [ ] `git commit` with a message explaining *why* `riemann-sum` has a
      real, undocumented-in-code recursion-depth ceiling — for example:
      `"Document riemann-sum's real n<2000 recursion limit — a genuine
      cost of this curriculum's no-loop/recur rule, not a bug; callers
      must choose n from the safe range Lesson 248 measured directly."`
