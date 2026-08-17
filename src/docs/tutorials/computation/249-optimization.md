# Lesson 249: Optimization — Finding a Minimum With Gradients

**What you will build**: `gradient-descent`, a real, working optimization
algorithm — the same core technique behind training almost every machine
learning model in production use today — built from nothing but Lesson
247's own `gradient` and repeated subtraction. Lesson 247 already proved
the gradient points toward steepest *ascent*; this lesson's entire idea
is one sentence long: step in the *opposite* direction, repeatedly, and
a function's own value should keep decreasing until it settles near a
minimum. The lesson also runs the real, concrete failure every
practitioner eventually hits — a step size chosen too large, watched
diverging in real numbers instead of converging.

**What you need to know first**: Lesson 247's own `gradient`,
`partial-derivative-x`/`partial-derivative-y`, and its own real,
measured proof that the gradient points toward steepest ascent — this
lesson's entire technique rests on that proof holding in reverse.
Lesson 232's `make-vector`/`vector-dx`/`vector-dy`/`vector-magnitude`.
Lesson 248's own real, measured recursion-depth ceiling — this lesson's
own iteration counts are chosen with that same ceiling in mind.

**Terms used in this lesson**:

- **local minimum** — a point where a function's own value is lower than
  at every nearby point — not necessarily the lowest value the function
  can ever take (that would be a *global* minimum), just the lowest
  among points close enough to matter for this lesson's own algorithm.
- **gradient descent** — the algorithm this lesson builds: repeatedly
  step in the direction *opposite* the gradient, shrinking a function's
  own value a little at a time, until the steps stop making meaningful
  progress.
- **step size** (also called a **learning rate** in machine learning,
  the field this exact algorithm is best known from) — how far each
  individual gradient-descent step actually moves, a real, tunable
  number this lesson's own Unit 3 shows can make the difference between
  convergence and outright divergence.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`declare`**
  - *What it is:* reused unchanged from Lesson 91.
  - *Implementation:* `(declare name)` — a forward declaration, no body.
  - *Its use:* `gradient-descent` calls `gradient-descent-from` before
    it's defined in reading order, the identical shape Lesson 248's own
    `riemann-sum`/`riemann-sum-from` already used.
- **`gradient`** / **`vector-dx`** / **`vector-dy`**
  - *What they are:* reused unchanged from Lesson 247 and Lesson 232.
  - *Their use:* `gradient` computes the direction to step away from at
    every iteration; `vector-dx`/`vector-dy` unpack that direction's own
    two components to update `x` and `y` separately.
- **`get`** / **`-`** / **`*`** / **`+`** / **`/`** / **`=`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, addition, division, and equality functions, reused
    throughout this curriculum since its earliest arithmetic.
  - *Their use:* the entire update rule is one subtraction and one
    multiplication per coordinate.

---

## Concept Unit: One Step Downhill — the Update Rule

### The Problem

Lesson 247 proved, with real measured numbers, that the gradient points
toward the direction `bowl` increases *fastest*. Decreasing `bowl`
instead — finding a point where it's smaller — should, by that same
logic, mean moving in exactly the *opposite* direction: not `+gradient`,
but `-gradient`, scaled down by some small step size so a single step
doesn't overshoot.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because gradient descent is a mathematical technique this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn gradient-descent-step [x y g step-size]
  (make-vector
    (- x (* step-size (vector-dx g)))
    (- y (* step-size (vector-dy g)))))

(defn gradient-descent-step-at [f x y h step-size]
  (gradient-descent-step x y (gradient f x y h) step-size))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn gradient-descent-step [x y g step-size] ...)` — `vector-dx` and
`vector-dy`, reappearing from Lesson 232, read the already-computed
gradient `g`'s own two components; `*`, reappearing, scales each one by
`step-size`; `-`, reappearing, subtracts that scaled amount from `x` and
`y` respectively — moving *against* the gradient's own direction, not
with it. `make-vector`, reappearing, bundles the new `x` and `y` into a
real point.

`(defn gradient-descent-step-at [f x y h step-size] ...)` — `gradient`,
reappearing from Lesson 247, computes `g` once; `gradient-descent-step`,
just built, is handed that already-computed value — the identical
"compute once, pass to a helper" shape this curriculum has used since
Lesson 56, needed here specifically because this curriculum builds
without `let`: `g` can't be bound to a name and reused inside one
function body, so it's computed in the outer function and passed to the
inner one instead.

### CS Lens

This is **gradient descent's own single update rule**, the real
mathematical core every more sophisticated variant (momentum, Adam,
stochastic gradient descent) still builds on: `new_x = x - step_size ×
∂f/∂x`, repeated. Also recognized in: every neural-network training loop
in production machine learning, adjusting millions of parameters by this
identical rule at every training step; robotics path-planning software
minimizing a cost function over possible trajectories; and any physical
system settling toward a stable equilibrium by moving against a real
restoring force — a ball rolling downhill is doing, physically, almost
exactly this update rule.

### SE Lens

The alternative — trying to solve `gradient = 0` directly and exactly,
algebraically — genuinely works for `bowl` (its exact minimum, `(0,
0)`, is obvious by inspection) but doesn't generalize: most real
functions optimization software actually minimizes have no clean
algebraic solution at all, which is exactly why gradient descent — an
iterative, numerical technique, the identical philosophy as Lesson 246's
own numerical derivative and Lesson 248's own Riemann sum — is the real,
general-purpose tool used in practice instead.

### Run It — Real Output

```
user=> (gradient bowl 3 4 1e-8)
[5.99999978589949 7.999999951380232]
user=> (gradient-descent-step-at bowl 3 4 1e-8 0.1)
[2.400000021410051 3.2000000048619768]
user=> (bowl 3 4)
25
user=> (bowl 2.400000021410051 3.2000000048619768)
16.0
```

One step, with step size `0.1`, moves `(3, 4)` to `≈ (2.4, 3.2)` — and
`bowl`'s own value really did drop, from `25` to `16.0`, confirming the
step moved toward, not away from, a smaller value.

### Connection

One step made real progress. The next unit repeats it, and checks
whether that progress keeps compounding toward a real minimum.

---

## Concept Unit: Repeating the Step — Recursive Descent Toward a Minimum

### The Problem

One step reduced `bowl` from `25` to `16`. Does repeating the identical
step, over and over, keep shrinking it — and does it actually approach
`bowl`'s own true minimum, `(0, 0)`, or just wander somewhere smaller
without ever settling?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because gradient descent is a mathematical technique this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Iteration counts in
  this unit's own examples stay well under Lesson 248's own measured
  `n ≈ 2000` recursion-depth ceiling, deliberately.

### The New Code

```clojure
(declare gradient-descent-from)
(defn gradient-descent [f x y h step-size iterations]
  (gradient-descent-from f x y h step-size iterations))

(defn gradient-descent-recur [f new-point h step-size remaining]
  (gradient-descent-from f (vector-dx new-point) (vector-dy new-point) h step-size remaining))

(defn gradient-descent-from [f x y h step-size remaining]
  (if (= remaining 0)
    (make-vector x y)
    (gradient-descent-recur f (gradient-descent-step-at f x y h step-size) h step-size (- remaining 1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(declare gradient-descent-from)` — `declare`, reappearing from Lesson
91, lets `gradient-descent` call `gradient-descent-from` before its own
`defn` appears below.

`(defn gradient-descent [f x y h step-size iterations] ...)` — a small,
named entry point, calling straight into `gradient-descent-from` with
the full iteration count still remaining.

`(defn gradient-descent-recur [f new-point h step-size remaining] ...)`
— `vector-dx`/`vector-dy`, reappearing, unpack the just-computed new
point back into separate `x` and `y` values, since
`gradient-descent-from` itself takes them that way; this small function
exists purely to do that unpacking without needing `let` to hold
`new-point` and read two pieces out of it in one breath.

`(defn gradient-descent-from [f x y h step-size remaining] ...)` — `if`,
reused control flow: when `remaining` reaches `0`, the current `(x, y)`
*is* the answer, bundled with `make-vector`. Otherwise: `gradient-
descent-step-at`, from this lesson's own Unit 1, computes one real step;
`gradient-descent-recur`, just built, unpacks it and recurses with `(-
remaining 1)` — one iteration closer to done. Unlike Lesson 248's own
`riemann-sum-from`, this recursive call is the *very last* thing each
branch does — nothing wraps around it waiting for its result — though
Clojure still allocates a real stack frame per call regardless, since
only an explicit `recur` (never used in this curriculum) gets true
tail-call optimization.

### CS Lens

This is **iterative refinement**, a hard concept this curriculum has
already met in different clothing: Newton's-method-style convergence,
repeated union-find path operations, and now gradient descent — a
single, simple step, repeated many times, converging toward an answer no
single step could reach alone. Also recognized in: k-means clustering
repeatedly reassigning points and recomputing centroids until they stop
moving, physics engines repeatedly applying small force updates each
simulated frame, and reinforcement learning repeatedly updating a policy
toward better expected reward.

### SE Lens

A fixed iteration count (this unit's own `remaining` parameter) is the
simplest possible stopping rule — real, working code, at the cost of
real waste: continuing to iterate long after the steps have stopped
making meaningful progress (visible directly in this unit's own `50`-
iteration result, already essentially at the minimum) or, in a harder
problem, stopping too early, before real convergence. A production
optimizer would instead stop once the gradient's own magnitude drops
below some small threshold — real, additional logic this lesson
deliberately leaves out, the same honest-scope choice this curriculum
has made before for a tractable, representative core.

### Run It — Real Output

```
user=> (gradient-descent bowl 3 4 1e-8 0.1 1)
[2.400000021410051 3.2000000048619768]
user=> (gradient-descent bowl 3 4 1e-8 0.1 5)
[0.9830399965408105 1.310720010190721]
user=> (gradient-descent bowl 3 4 1e-8 0.1 20)
[0.03458763994877445 0.04611685567051582]
user=> (def result50 (gradient-descent bowl 3 4 1e-8 0.1 50))
#'user/result50
user=> result50
[4.2812430543672806E-5 5.708490829887119E-5]
user=> (bowl (vector-dx result50) (vector-dy result50))
5.091590964547341E-9
user=> (vector-magnitude (gradient bowl (vector-dx result50) (vector-dy result50) 1e-8))
1.4272476993061655E-4
```

`1`, `5`, `20`, `50` iterations: `(2.4, 3.2)` → `(0.983, 1.311)` →
`(0.0346, 0.0461)` → `(0.0000428, 0.0000571)` — real, monotonic
convergence toward `(0, 0)`, the true minimum. After `50` iterations,
`bowl`'s own value is `5.09 × 10⁻⁹`, essentially zero, and — the real
confirmation this is a genuine local minimum, not just "somewhere
smaller" — the *gradient itself*, recomputed at this final point, has
shrunk to `1.43 × 10⁻⁴`, close to `0`: the algorithm has reached a point
where there's almost no steepest-ascent direction left at all.

### Connection

Step size `0.1` converged cleanly. The last unit asks the obvious
practical question: does *any* step size work, or does this only
converge because `0.1` happened to be a safe choice?

---

## Concept Unit: Step Size Matters — Too Large Diverges

### The Problem

`step_size` controls how far each individual step moves. A larger step
should, intuitively, mean faster progress toward the minimum — is that
actually true, or is there a real point where a step size stops helping
and starts making things worse?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because gradient descent is a mathematical technique this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses
  `gradient-descent` unchanged — this unit introduces no new function,
  only a new experiment against a different `step-size`.

### The New Code

No new function this unit — the real content is `gradient-descent`
called with `step-size = 1.1` instead of Unit 2's own `0.1`, and
`step-size = 0.4` as a third comparison point.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
run against three genuinely different step sizes, not a throwaway later
discarded.

### Mechanical Walkthrough

For `bowl`, each coordinate updates as `x_new = x - step_size × 2x = x ×
(1 - 2 × step_size)` — a real, exact algebraic fact about this specific
function, derivable directly from `gradient-descent-step`'s own formula
and `bowl`'s own known gradient, `(2x, 2y)`. Whether repeated
multiplication by `(1 - 2 × step_size)` shrinks toward `0` or grows
without bound depends entirely on whether that factor's own *absolute
value* is less than `1`. At `step_size = 0.1`: factor `= 1 - 0.2 = 0.8`
— shrinks every time, exactly Unit 2's own real convergence. At
`step_size = 1.1`: factor `= 1 - 2.2 = -1.2` — its magnitude, `1.2`, is
*greater* than `1`: each step doesn't just fail to shrink, it grows,
alternating sign every time because the factor itself is negative.

### CS Lens

This is a **numerical stability boundary in an iterative algorithm** —
the identical structural idea as Lesson 242's own numerical stability
work, in an entirely different setting: a single parameter (`step_size`
there, the pivot choice; here, the step size itself) determines whether
repeated computation converges toward a real answer or amplifies error
without bound. Also recognized in: a real machine-learning training run
that "explodes" (loss increasing without bound) from a learning rate set
too high, control-systems feedback loops becoming unstable past a
critical gain value, and any fixed-point iteration (Newton's method
included) that only converges within a specific, real range of its own
starting conditions or parameters.

### SE Lens

Discovering the safe range for `step_size` by testing a candidate value
against a real, expected convergence pattern — exactly what this unit's
own real output does — is the honest, practical answer real optimization
software gives too: the mathematically exact safe boundary
(`|1 - 2×step_size| < 1`, derived above) is specific to `bowl`'s own
particular shape, and a genuinely different function would have a
different safe range entirely, unknown in advance without either a
similar derivation or, far more commonly in practice, exactly this kind
of empirical check.

### Run It — Real Output

```
user=> (gradient-descent bowl 3 4 1e-8 1.1 1)
[-3.59999976448944 -4.7999999465182555]
user=> (gradient-descent bowl 3 4 1e-8 1.1 5)
[-7.464961022194075 -9.953283186651788]
user=> (gradient-descent bowl 3 4 1e-8 1.1 10)
[18.575228289321785 24.766984860642886]
user=> (gradient-descent bowl 3 4 1e-8 1.1 20)
[115.01263156124244 153.35024758244708]
```

`step_size = 1.1`: `1` iteration overshoots straight past the minimum to
the *opposite* side, `(-3.6, -4.8)` — farther from `(0, 0)` than the
start, `(3, 4)`, ever was. By `20` iterations, the point has grown to
`(115, 153)` — real, measured divergence, not a slow failure to
converge. Compare against a still-different, still-safe step size:

```
user=> (def result-good (gradient-descent bowl 3 4 1e-8 0.4 50))
#'user/result-good
user=> result-good
[-5.0E-9 -5.0E-9]
user=> (bowl (vector-dx result-good) (vector-dy result-good))
5.0000000000000005E-17
```

`step_size = 0.4` (factor `= 1 - 0.8 = 0.2`, smaller in magnitude than
`0.1`'s own factor of `0.8`) converges *faster* than Unit 2's own
`step_size = 0.1` — after the identical `50` iterations, `bowl`'s value
is `5 × 10⁻¹⁷`, effectively the smallest positive number a `double` can
represent at this scale, versus `0.1`'s own `5.09 × 10⁻⁹`. A larger step
size isn't automatically worse — it's only worse once it crosses the
real, derivable boundary into instability.

### Connection

The closing section traces `(3, 4)` through both a converging and a
diverging step-size choice, side by side.

---

## Connect the Pieces

`bowl(x, y) = x² + y²`, starting point `(3, 4)`, moving through every
unit built in this lesson, along two different paths:

1. `gradient-descent-step-at(bowl, 3, 4, 1e-8, 0.1)` (Unit 1) → `≈ (2.4,
   3.2)`, `bowl` dropping from `25` to `16.0` — one real step of
   progress.
2. `gradient-descent(bowl, 3, 4, 1e-8, 0.1, 50)` (Unit 2) → `≈ (0.0000428,
   0.0000571)`, `bowl ≈ 5.09 × 10⁻⁹` — real convergence, confirmed twice
   over: by `bowl`'s own shrinking value, and by the gradient at that
   final point shrinking to nearly `0` too.
3. `gradient-descent(bowl, 3, 4, 1e-8, 1.1, 20)` (Unit 3) → `(115.01,
   153.35)` — the *identical* starting point, the *identical* algorithm,
   one number changed (`step_size`, `0.1` to `1.1`), and the outcome
   flips from convergence to real, measured divergence.

Every function this lesson built — `gradient-descent-step`,
`gradient-descent-step-at`, `gradient-descent-from` — behaved completely
correctly in both paths; nothing in the code is different between step 2
and step 3, only the single number controlling how far each step
reaches. That's the real, load-bearing lesson: an optimization
algorithm's own correctness and its own practical usability are two
different questions, and the second one depends on a parameter this
lesson's own code never chooses on its own.

## What Breaks Without This

Hardcode a step size with no way for a caller to choose a safer one:

```clojure
(defn gradient-descent-fixed-step [f x y h iterations]
  (gradient-descent f x y h 1.1 iterations))
```

```
user=> (gradient-descent-fixed-step bowl 3 4 1e-8 20)
[115.01263156124244 153.35024758244708]
```

`gradient-descent-fixed-step` looks, from its own call site, exactly
like a working optimizer — it runs, it returns a real point, nothing
crashes. The real damage is silent: it diverges every single time it's
called on a function shaped like `bowl`, because `1.1` was never a safe
choice for this particular function, and nothing about the function
signature reveals that. This is Unit 3's own SE Lens made concrete: a
"safe" step size is a property of the *combination* of function and
step size together, and hardcoding one half of that pair produces
working-looking code with a real, hidden failure mode. Restoring a real,
tested step size:

```
user=> (gradient-descent bowl 3 4 1e-8 0.1 20)
[0.03458763994877445 0.04611685567051582]
```

recovers genuine convergence.

## Exercises

1. Find, by real experiment, the largest `step_size` for `bowl` that
   still converges — somewhere between Unit 2's own confirmed-safe `0.1`
   (and Unit 3's own even-better `0.4`) and Unit 3's own
   confirmed-diverging `1.1`. Check your answer against this unit's own
   derived boundary, `|1 - 2 × step_size| < 1`.
2. Run `gradient-descent` starting from a genuinely different point,
   `(-5, 10)`, with `step_size = 0.1`, and confirm it still converges
   toward `(0, 0)` — the same minimum, reached from a different starting
   direction.
3. Lesson 247's own `bowl` has exactly one minimum, at the origin.
   Research (or reason from this lesson's own update rule) what happens
   to `gradient-descent` on a function with *more than one* local
   minimum, and explain, in your own words, why the starting point this
   lesson always fixed at `(3, 4)` could genuinely change which minimum
   such a function's own gradient descent settles into.

## Definition of Done

- [ ] `gradient-descent-step-at` correctly reduces `bowl`'s own value in
      one real step, verified with real before/after numbers.
- [ ] `gradient-descent` demonstrates real, monotonic convergence toward
      `(0, 0)` over `1`, `5`, `20`, and `50` iterations at `step_size =
      0.1`, confirmed both by `bowl`'s own shrinking value and by the
      gradient at the final point shrinking too.
- [ ] `gradient-descent` at `step_size = 1.1` was run for real and shown
      to diverge — genuinely growing farther from the minimum, not just
      failing to improve.
- [ ] A second, faster-converging step size (`0.4`) was compared directly
      against the first (`0.1`) at the identical iteration count.
- [ ] The hardcoded-unsafe-step-size bug was reproduced for real and
      explained in your own words as a silent, not a crashing, failure.
- [ ] `git commit` with a message explaining *why* `step_size` is a real,
      required parameter to `gradient-descent` rather than a sensible
      hardcoded default — for example: `"Keep step-size as a caller-
      chosen parameter — Lesson 249's own bowl example shows 0.1 and 0.4
      both converge while 1.1 diverges; there is no single safe default
      across different functions."`
