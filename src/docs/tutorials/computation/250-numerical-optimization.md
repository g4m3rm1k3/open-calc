# Lesson 250: Numerical Optimization — From a Fixed Count to a Real Stopping Rule

**What you will build**: `gradient-descent-until-converged`, closing a
gap Lesson 249 named directly and left open on purpose: a fixed
iteration count either wastes real work continuing after the answer is
already good enough, or stops too early with no way to know it. This
lesson builds a real convergence check based on the gradient's own
magnitude, a safety cap to guarantee the algorithm always terminates
even when it never converges, and a real, honest signal telling the
caller which of those two things actually happened.

**What you need to know first**: Lesson 249's own `gradient-descent-
step-at`, its fixed-iteration-count `gradient-descent`, and its own
explicitly-named gap: *"A production optimizer would instead stop once
the gradient's own magnitude drops below some small threshold — real,
additional logic this lesson deliberately leaves out."* Lesson 247's own
`gradient` and `vector-magnitude`. Lesson 96's own `heap-extract-min`,
returning two genuinely different results bundled as a pair — this
lesson's own `make-descent-result` reuses that identical shape. Lesson
248's own real, measured recursion-depth ceiling — this lesson's own
safety cap exists specifically because of it.

**Terms used in this lesson**:

- **convergence** — the point at which an iterative algorithm's own
  steps have stopped making meaningful progress, close enough to a real
  answer that continuing further isn't worth the additional work.
- **tolerance** — the real, numeric threshold below which this lesson's
  own algorithm decides "the gradient's own magnitude is small enough
  that we're done" — a caller-chosen number, not a universal constant.
- **safety cap** — a hard maximum iteration count, guaranteeing the
  algorithm always terminates in a real, bounded amount of work, even
  when convergence never actually happens.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`gradient`** / **`vector-magnitude`** / **`gradient-descent-step-at`**
  - *What they are:* reused unchanged from Lesson 247 and Lesson 249.
  - *Their use:* `gradient` and `vector-magnitude` together measure how
    close to a real minimum the current point already is;
    `gradient-descent-step-at` is reused, unmodified, as the one real
    step taken per iteration.
- **`get`** / **`<`** / **`=`**
  - *What they are:* Clojure's positional lookup, less-than, and
    equality functions — `<` appearing for the first time this lesson,
    `get` and `=` reused throughout this curriculum since its earliest
    arithmetic and control flow.
  - *Implementation:* `(< a b)` returns `true` when `a` is strictly
    smaller than `b`, `false` otherwise.
  - *Their use:* `<` is the entire convergence check — comparing a real
    measured magnitude against a caller-chosen tolerance.

---

## Concept Unit: A Real Convergence Check

### The Problem

Lesson 249's own closing example showed the gradient's magnitude
shrinking toward `0` as `gradient-descent` approached a real minimum —
proof of convergence, computed *after the fact*, by hand. Turning that
into a real stopping rule means asking the identical question *during*
the algorithm's own run: is the gradient's own magnitude, right now,
already small enough that further steps wouldn't meaningfully improve
the answer?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, closing a gap Lesson 249 itself named, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn converged? [f x y h tolerance]
  (< (vector-magnitude (gradient f x y h)) tolerance))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn converged? [f x y h tolerance] ...)` — `gradient`, reappearing
from Lesson 247, computes the real gradient at `(x, y)`; `vector-
magnitude`, reappearing from Lesson 232, measures its length — how steep
`f` still is at this point, not just which way is steepest. `<`,
appearing for the first time this lesson, compares that magnitude
against `tolerance`, returning `true` exactly when the gradient has
shrunk below the caller's own chosen threshold.

### CS Lens

This is a **convergence predicate** — a real, checkable stopping
condition, the same category of idea as a `while`-loop's own guard in
languages this curriculum hasn't used, expressed here the only way this
curriculum's own conventions allow: a real function returning a
`boolean`, checked explicitly before each further step. Also recognized
in: any real optimizer's own `tol` parameter (SciPy, PyTorch, and
essentially every numerical library expose exactly this concept under
that name), root-finding algorithms stopping once a function's value is
close enough to `0`, and physics simulations stopping an iterative
solver once successive results stop changing meaningfully.

### SE Lens

The alternative — comparing successive *positions* instead of the
gradient's own magnitude (stop once `x` and `y` stop moving much) — is a
real, valid design some optimizers use instead. This lesson's own choice,
checking the gradient directly, answers a slightly different and often
more meaningful question: not "did the last step move much" (which can
be small even far from a real minimum, on a very flat region of `f`) but
"is this point actually close to where the slope is zero" — the real,
mathematical definition of a local minimum this whole section has been
building toward since Lesson 246.

### Run It — Real Output

```
user=> (converged? bowl 3 4 1e-8 0.001)
false
user=> (converged? bowl 0.0001 0.0001 1e-8 0.001)
true
user=> (vector-magnitude (gradient bowl 0.0001 0.0001 1e-8))
2.8285685460986606E-4
```

Far from the minimum, `(3, 4)`, `converged?` correctly says `false` —
the gradient there is still large, `≈ 10` (Lesson 249's own already-
established value). Very close to the minimum, `(0.0001, 0.0001)`, the
real gradient magnitude, `2.83 × 10⁻⁴`, is genuinely below the chosen
tolerance, `0.001` — `converged?` correctly says `true`.

### Connection

A real, working check for "are we done." The next unit wires it directly
into the descent loop itself, replacing Lesson 249's own fixed count.

---

## Concept Unit: Stopping as Soon as Good Enough

### The Problem

Lesson 249's own `gradient-descent` always runs its exact iteration
count, whether that's too few (stopping before real convergence) or too
many (continuing to burn real work long after the answer stopped
meaningfully improving — Unit 2's own `50`-iteration example there had
already converged well before iteration `50`). A real stopping rule
should let the algorithm decide for itself, each iteration, whether it's
actually done.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, replacing Lesson 249's own fixed-count loop with a real
  convergence-checked one, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `converged?`
  from this lesson's own Unit 1 and `gradient-descent-step-at` from
  Lesson 249.

### The New Code

```clojure
(defn make-descent-result [point did-converge] [point did-converge])
(defn descent-result-point [r] (get r 0))
(defn descent-result-converged? [r] (get r 1))

(declare gradient-descent-until-from)
(defn gradient-descent-until-converged [f x y h step-size tolerance max-iterations]
  (gradient-descent-until-from f x y h step-size tolerance max-iterations))

(defn gradient-descent-until-recur [f new-point h step-size tolerance remaining]
  (gradient-descent-until-from f (vector-dx new-point) (vector-dy new-point) h step-size tolerance remaining))

(defn gradient-descent-until-from [f x y h step-size tolerance remaining]
  (if (converged? f x y h tolerance)
    (make-descent-result (make-vector x y) true)
    (if (= remaining 0)
      (make-descent-result (make-vector x y) false)
      (gradient-descent-until-recur f (gradient-descent-step-at f x y h step-size) h step-size tolerance (- remaining 1)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn make-descent-result [point did-converge] [point did-converge])`
— the identical vector-as-pair shape Lesson 96's own `heap-extract-min`
already established for a function returning two genuinely different
results: the final point *and* an honest signal about how the algorithm
actually stopped. `descent-result-point`/`descent-result-converged?` —
`get`, reappearing, read each half back out by position.

`(declare gradient-descent-until-from)` — `declare`, reappearing,
lets `gradient-descent-until-converged` call it before its own `defn`.

`(defn gradient-descent-until-converged [f x y h step-size tolerance
max-iterations] ...)` — a small named entry point, identical in shape to
Lesson 249's own `gradient-descent`.

`(defn gradient-descent-until-recur [f new-point h step-size tolerance
remaining] ...)` — the identical unpacking shape Lesson 249's own
version already used, needed for the same "no `let`" reason.

`(defn gradient-descent-until-from [f x y h step-size tolerance
remaining] ...)` — `if`, reused, checks `converged?` (this lesson's own
Unit 1) *first*, before even looking at `remaining`: the moment the
gradient's own magnitude drops below `tolerance`, the current point is
returned immediately, bundled with `true`. Only if *not* yet converged
does the second `if` check `remaining`: `0` left means the safety cap
has been reached, returning the current point bundled with `false` —
an honest report that convergence never actually happened. Otherwise,
`gradient-descent-step-at`, reappearing from Lesson 249, takes one real
step, and the recursion continues.

### CS Lens

This is **early termination based on a real, checked condition**, in
sharp contrast to Lesson 249's own fixed-count loop, which always ran
exactly `iterations` times regardless of how quickly the answer actually
stabilized. Also recognized in: a search algorithm returning the moment
it finds a match rather than scanning every remaining element, a
compiler's own fixed-point dataflow analysis stopping once a pass
produces no further changes, and any real production training loop
using "early stopping" to halt once a validation metric stops improving,
saving real, otherwise-wasted computation.

### SE Lens

The `make-descent-result` pair is the real, honest alternative to simply
returning the final point alone: a caller receiving only a point, with
no signal about *how* the algorithm stopped, has no way to distinguish
"this genuinely converged" from "this hit the safety cap and gave up" —
two results that can look numerically similar but mean completely
different things about whether the answer should actually be trusted.
The cost: every caller now has to unpack the result with
`descent-result-point` instead of using the return value directly — a
real, small piece of friction, paid specifically so the "did this
actually work" question can never be silently ignored.

### Run It — Real Output

```
user=> (def r (gradient-descent-until-converged bowl 3 4 1e-8 0.1 0.001 1000))
#'user/r
user=> r
[[2.5520677377484857E-4 3.402773704412664E-4] true]
user=> (descent-result-point r)
[2.5520677377484857E-4 3.402773704412664E-4]
user=> (descent-result-converged? r)
true
user=> (bowl (vector-dx (descent-result-point r)) (vector-dy (descent-result-point r)))
1.8091918621498958E-7
```

Starting from `(3, 4)`, with a generous safety cap of `1000` iterations
(safely under Lesson 248's own measured `≈ 2000` ceiling), the real
algorithm converges — `descent-result-converged?` is `true` — and stops
itself, well before ever reaching `1000`: the final point,
`≈ (0.000255, 0.00034)`, is *less* precise than Lesson 249's own fixed
`50`-iteration result (`≈ (0.0000428, 0.0000571)`), because this version
correctly stopped as soon as the gradient dropped below `0.001`, rather
than continuing to refine an answer that had already crossed the
caller's own "good enough" threshold — real, saved work, not wasted
precision.

```
user=> (gradient-descent-until-converged bowl 3 4 1e-8 0.1 0.001 5)
[[0.9830399965408105 1.310720010190721] false]
```

With the safety cap set unrealistically low, `5`, the algorithm
correctly reports `false` — it hasn't converged yet, and this exact
point matches Lesson 249's own real `5`-iteration fixed-count result,
confirming the cap-hit path returns the honest, real intermediate state,
not a wrong or fabricated answer.

### Connection

Both paths — converging early, and correctly reporting "not yet" when
capped too tight — worked. The last unit checks the case this whole
safety cap exists for: a step size that never converges at all.

---

## Concept Unit: A Safety Cap for the Case That Never Converges

### The Problem

Lesson 249's own Unit 3 proved a step size of `1.1` makes
`gradient-descent` diverge, growing without bound instead of shrinking.
Run through `gradient-descent-until-converged` instead, `converged?`
will never become `true` for a sequence that keeps growing — without
the safety cap, that would mean recursing forever, straight into exactly
the kind of unbounded call-stack growth Lesson 248 already proved this
curriculum's own recursion style can't survive past roughly `2000`
calls.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the safety cap is this lesson's own new machinery
  applied to a known-diverging case, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses
  `gradient-descent-until-converged` unchanged, with `max-iterations`
  set deliberately low and safe.

### The New Code

No new function this unit — the real content is calling this lesson's
own already-built `gradient-descent-until-converged` with Lesson 249's
own already-known-diverging `step-size = 1.1`, and confirming the
safety cap does its real job.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
not a throwaway later discarded.

### Mechanical Walkthrough

`(gradient-descent-until-converged bowl 3 4 1e-8 1.1 0.001 20)` — every
function inside it behaves exactly as already explained; what matters
here is which branch of `gradient-descent-until-from`'s own `if`
actually fires, every single iteration: `converged?` checks the
gradient's own magnitude, which — because the point itself is diverging,
growing farther from the minimum every step — only ever *grows*, never
shrinks below `tolerance`. So the *first* `if` never takes its `true`
branch, not even once; the *second* `if`, checking `remaining`, is what
eventually stops the recursion, once all `20` allotted iterations are
used up.

### CS Lens

This is a **liveness guarantee traded for correctness on a known-bad
input** — the safety cap doesn't make `step_size = 1.1` a good choice;
it makes the *algorithm itself* guaranteed to terminate and report
honestly, regardless of whether the specific numbers handed to it happen
to converge. Also recognized in: any network request with a real
timeout rather than waiting indefinitely for a response that might never
come, retry logic capped at a maximum attempt count rather than retrying
forever, and Lesson 214's own deadlock-avoidance work, which similarly
traded a small real cost (checking lock order) for a hard guarantee
(no infinite wait) rather than hoping the bad case never happens.

### SE Lens

Without this unit's own safety cap — the exact scenario Lesson 249's own
`gradient-descent` (no cap, no convergence check, just a fixed count)
already avoided by construction, but which `gradient-descent-until-
converged` would reintroduce if the `remaining`-check branch were ever
removed — a genuinely divergent step size wouldn't just give a wrong
answer, per this curriculum's own real, measured Lesson 248 finding: it
would eventually crash with a `StackOverflowError`, once the ever-growing
recursion depth crossed that same real ceiling. The safety cap turns an
unbounded, eventually-crashing failure into a bounded, honestly-reported
one — real, working code even on an input the algorithm was never
guaranteed to succeed on.

### Run It — Real Output

```
user=> (gradient-descent-until-converged bowl 3 4 1e-8 1.1 0.001 20)
[[115.01263156124244 153.35024758244708] false]
```

The final point, `(115.01, 153.35)`, matches Lesson 249's own real
`20`-iteration diverging result exactly — and `descent-result-converged?`
correctly reports `false`: a caller checking this result, rather than
just using the point directly, knows immediately not to trust it as a
real minimum, without needing to inspect the numbers by hand to notice
they're growing instead of shrinking.

### Connection

The closing section traces both a real convergence and a real
capped-divergence through every piece this lesson built.

---

## Connect the Pieces

`bowl(x, y) = x² + y²`, starting point `(3, 4)`, moving through every
unit built in this lesson, along two paths:

1. `converged?(bowl, 3, 4, 1e-8, 0.001)` (Unit 1) → `false` — far from
   done.
2. `gradient-descent-until-converged(bowl, 3, 4, 1e-8, 0.1, 0.001,
   1000)` (Unit 2) → `[≈(0.000255, 0.00034), true]` — real convergence,
   detected and reported honestly, stopping itself well short of the
   generous `1000`-iteration cap.
3. `gradient-descent-until-converged(bowl, 3, 4, 1e-8, 1.1, 0.001, 20)`
   (Unit 3) → `[(115.01, 153.35), false]` — the identical function, a
   genuinely different step size, correctly detects it never converged
   and reports that honestly instead of either running forever or
   silently returning a meaningless number.

Every real step this lesson's own recursion took was Lesson 249's own
already-verified `gradient-descent-step-at`, called unchanged — nothing
about *how* to step downhill needed to change at all. What changed was
*when to stop*, and *what to say about it* — the actual difference
between "an algorithm that computes an answer" and "an algorithm that
computes an answer you can actually trust."

## What Breaks Without This

Remove the safety cap, trusting convergence to always eventually happen:

```clojure
(declare gradient-descent-unsafe-from)
(defn gradient-descent-unsafe [f x y h step-size tolerance]
  (gradient-descent-unsafe-from f x y h step-size tolerance))

(defn gradient-descent-unsafe-recur [f new-point h step-size tolerance]
  (gradient-descent-unsafe-from f (vector-dx new-point) (vector-dy new-point) h step-size tolerance))

(defn gradient-descent-unsafe-from [f x y h step-size tolerance]
  (if (converged? f x y h tolerance)
    (make-vector x y)
    (gradient-descent-unsafe-recur f (gradient-descent-step-at f x y h step-size) h step-size tolerance)))
```

```
user=> (gradient-descent-unsafe bowl 3 4 1e-8 1.1 0.001)
----- Error --------------------------------------------------------------------
Type:     java.lang.StackOverflowError
```

`gradient-descent-unsafe` looks like a simplification — no
`max-iterations`, no cap-hit branch, less code. Run on `step_size = 1.1`,
it recurses until the real gradient magnitude finally happens to exceed
whatever the JVM's own stack can hold, somewhere past Lesson 248's own
measured `≈ 2000`-call ceiling, and crashes — the exact failure mode this
lesson's own safety cap exists specifically to prevent. Restoring it:

```
user=> (gradient-descent-until-converged bowl 3 4 1e-8 1.1 0.001 20)
[[115.01263156124244 153.35024758244708] false]
```

recovers a real, bounded, honestly-reported result instead.

## Exercises

1. Run `gradient-descent-until-converged` on `bowl` starting from `(3,
   4)` with a *tighter* tolerance, `0.0000001`, and a generous cap
   (`1000`). Confirm it still converges, and compare how many more
   iterations of real progress it needed versus this lesson's own
   `0.001`-tolerance example.
2. Using `step_size = 0.4` (Lesson 249's own faster-converging choice),
   run `gradient-descent-until-converged` with the identical `0.001`
   tolerance this lesson used for `step_size = 0.1`, and compare how
   quickly each one reports `converged? = true`.
3. `gradient-descent-until-converged`'s own safety cap is a fixed
   number, chosen by the caller. Using this lesson's own real numbers,
   argue for a specific, concrete `max-iterations` value you'd actually
   trust for `bowl` with `step_size = 0.1` and `tolerance = 0.001` —
   large enough to comfortably reach real convergence, small enough to
   stay well clear of Lesson 248's own measured recursion ceiling.

## Definition of Done

- [ ] `converged?` correctly distinguishes a point far from `bowl`'s own
      minimum from one genuinely close to it, using a real tolerance.
- [ ] `gradient-descent-until-converged` converges for real on `bowl`
      with `step_size = 0.1`, reports `true`, and stops well short of a
      generous safety cap.
- [ ] The same function, given a deliberately tiny safety cap, correctly
      reports `false` and returns the real intermediate point, matching
      Lesson 249's own fixed-count result at that same iteration count.
- [ ] The same function, given Lesson 249's own known-diverging
      `step_size = 1.1`, correctly reports `false` after exhausting the
      cap, rather than recursing forever or crashing.
- [ ] The uncapped version was reproduced for real, crashing with a
      genuine `StackOverflowError` on the identical diverging input.
- [ ] `git commit` with a message explaining *why*
      `gradient-descent-until-converged` returns a pair
      (`descent-result-point`/`descent-result-converged?`) rather than
      just the final point — for example: `"Return convergence status
      alongside the point — a caller silently trusting an unconverged
      result (e.g. from a bad step size) has no way to know it hit the
      safety cap instead of actually finding a minimum."`
