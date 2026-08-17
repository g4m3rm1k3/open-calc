# Lesson 252: Mathematics of Simulation — Section XI Checkpoint

**What you will build**: A real physics simulation — a ball dropped from
a real height, falling under constant gravity — built from nothing but
this section's own tools: a rate of change (Lesson 246's own derivative,
run in reverse — velocity *is* the rate of change of position, exactly
as Lesson 246's own `position`/`velocity` pair already established),
repeated small state updates (the identical recursive-accumulator shape
Lesson 248's `riemann-sum` and Lesson 249's `gradient-descent` both
already used), and a real check against an exact, independently-known
answer. This is this section's own checkpoint, in the format Lesson 108
established: a real challenge, attempted with minimal scaffolding, a
companion implementation carrying one deliberately planted bug, and a
reveal — not a normal Concept Unit sequence.

**What you need to know first**: Every real function this challenge
needs already exists, verified, across this section: Lesson 232's
`make-vector`/`vector-dx`/`vector-dy` (a state here, not a spatial
vector — this challenge's own first design decision, addressed in the
reveal). Lesson 246's own derivative-as-rate-of-change reasoning, and its
own `position`/`velocity` pair. Lesson 248's own Riemann-sum
accumulation and its real, measured recursion-depth ceiling — this
challenge's own state-update recursion is built with that ceiling
directly in mind. Lesson 91's `declare`, for the mutually-referencing
`simulate-fall`/`simulate-fall-from` shape every recursive function in
this section since Lesson 248 has used.

---

## The Challenge

A ball is dropped — no initial push, just released — from a real
height, `100` meters, above the ground. Gravity accelerates it downward
at a constant `9.8` meters per second per second. Two facts describe
this completely:

- **velocity's own rate of change is acceleration**: `dv/dt = -g` (a
  constant — gravity never changes as the ball falls).
- **position's own rate of change is velocity**: `dx/dt = v` — exactly
  Lesson 246's own `position`/`velocity` relationship, restated as a
  general rule rather than one specific function.

There is a real, exact, closed-form answer for how long the ball takes
to hit the ground: `t = √(2h / g)`, ordinary high-school physics. This
challenge is not to look that formula up and use it directly — it's to
build a *simulation* that discovers the same answer numerically, the way
this whole section has approached every hard question: not by symbolic
formula, but by small, repeated, honestly-computed steps.

**Your task:**

1. Represent the ball's own state — its current position (height above
   the ground) and current velocity — as a single value, built the same
   way this section has bundled two related numbers together since
   Lesson 96's own `heap-extract-min` and, more recently, Lesson 250's
   own `make-descent-result`.
2. Build a single **step** function: given the current state, gravity,
   and a small time increment `dt`, compute the *next* state — one
   real, small application of both rate-of-change facts above, the same
   "multiply a rate by a small step" idea Lesson 248's own `riemann-sum`
   already used to turn a rate into an accumulated total.
3. Build a **simulate** function: starting from height `100`, velocity
   `0`, repeatedly apply your step function — the identical recursive-
   accumulator shape Lesson 248's `riemann-sum-from` and Lesson 249's
   `gradient-descent-from` both already used — until the ball's own
   position reaches the ground (`≤ 0`), counting how many steps that
   took. Include a real safety cap on the iteration count, the same
   discipline Lesson 250's own `gradient-descent-until-converged`
   already established, and for the identical reason: Lesson 248's own
   measured recursion-depth ceiling is real, and a bug in your own step
   function could otherwise mean never reaching the ground at all.
4. Multiply your step count by `dt` to get the simulated fall time, and
   compare it against the real, exact formula, `√(2h / g)`.

**Attempt this yourself before reading further.** The companion
implementation below is real, runnable code — but it carries one
deliberately planted bug, the same kind of single, findable mistake
Lesson 108's own checkpoint and Lesson 138's own required-waypoint
challenge already used. Build your own version first, run it, and check
it against the real formula above, before comparing against what
follows.

---

## A Companion Implementation

```clojure
(defn make-vector [dx dy] [dx dy])
(defn vector-dx [v] (get v 0))
(defn vector-dy [v] (get v 1))

(defn fall-step [state g dt]
  (make-vector
    (+ (vector-dx state) (- (vector-dy state) (* g dt)))
    (- (vector-dy state) (* g dt))))

(declare simulate-fall-from)
(defn simulate-fall [height g dt max-steps]
  (simulate-fall-from (make-vector height 0) g dt 0 max-steps))

(defn simulate-fall-from [state g dt elapsed-steps max-steps]
  (if (<= (vector-dx state) 0)
    elapsed-steps
    (if (= max-steps 0)
      elapsed-steps
      (simulate-fall-from (fall-step state g dt) g dt (+ elapsed-steps 1) (- max-steps 1)))))
```

```
user=> (def steps (simulate-fall 100 9.8 0.01 2000))
#'user/steps
user=> steps
45
user=> (* steps 0.01)
0.45
user=> (Math/sqrt (/ (* 2 100) 9.8))
4.5175395145262565
```

The real formula says the ball should take about `4.52` seconds to fall
`100` meters. This companion implementation says `0.45` seconds — nearly
**ten times too fast**. Something in `fall-step` is wrong.

---

## The Reveal

`fall-step`'s own position update is:

```clojure
(+ (vector-dx state) (- (vector-dy state) (* g dt)))
```

Read closely: this computes the *current position* plus (*current
velocity* minus *acceleration times `dt`*) — it adds the ball's own
**new velocity value directly to its position**, with no `dt`
multiplication on that added term at all. Every unit this whole section
has built involving a rate of change — Lesson 246's own difference
quotient, Lesson 248's own `riemann-sum` (`(* (f ...) dx)`, never `(f
...)` alone), Lesson 249's own `gradient-descent-step` (`(* step-size
(vector-dx g))`, never the raw gradient component by itself) — always
multiplies a rate by the small step size *before* adding it to an
accumulated total. Adding raw velocity (a number in meters *per
second*) directly to a position (a number in meters) is a real
dimensional-analysis error: `velocity * dt` has units of meters, real
distance covered in a real small time step, exactly the quantity that
belongs added to position; velocity alone does not.

At `dt = 0.01`, a velocity of, say, `1` meter per second, wrongly added
directly, moves the ball a full `1` meter in that single step — as much
distance as `100` real timesteps' worth of `velocity × dt` should have
covered — which is exactly why the buggy simulation reaches the ground
roughly `10` times faster than the real physics allows once velocity has
built up even a little.

The fix is one multiplication:

```clojure
(defn fall-step [state g dt]
  (make-vector
    (+ (vector-dx state) (* (- (vector-dy state) (* g dt)) dt))
    (- (vector-dy state) (* g dt))))
```

```
user=> (def steps (simulate-fall 100 9.8 0.01 2000))
#'user/steps
user=> steps
452
user=> (* steps 0.01)
4.5200000000000005
user=> (Math/sqrt (/ (* 2 100) 9.8))
4.5175395145262565
```

`4.52` seconds simulated, against `4.5175...` seconds from the real,
exact formula — within one timestep's own real, expected numerical error
(the same kind of approximation gap Lesson 248's own `riemann-sum`
already demonstrated converging as its own step count grows), not the
tenfold, structurally-wrong gap the bug produced. A second, independent
check, chosen so the exact formula comes out a clean number:

```
user=> (def steps2 (simulate-fall 44.1 9.8 0.01 2000))
#'user/steps2
user=> steps2
300
user=> (* steps2 0.01)
3.0
user=> (Math/sqrt (/ (* 2 44.1) 9.8))
3.0
```

`44.1` meters, at `g = 9.8`, has a real, exact fall time of precisely
`3.0` seconds (`√(2 × 44.1 / 9.8) = √9 = 3`) — and the corrected
simulation lands on exactly `3.0` too, real confirmation the fix wasn't
tuned to succeed on one lucky number.

**What this challenge actually proved**, connecting the section's own
threads: `fall-step` is Lesson 246's own derivative relationship
(`dv/dt`, `dx/dt`), run *forward* instead of measured after the fact —
turning a known rate of change into a predicted future state, one small
step at a time. `simulate-fall-from` is Lesson 248's own accumulation
idea, restated as repeated state update instead of a running sum — each
step doesn't just add to a total, it *becomes* the new starting point for
the next step. And the whole exercise's own final check — comparing a
numerically-simulated answer against an independently-known exact one —
is the identical discipline this section held itself to from Lesson 240's
algebraic eigenvector proof through Lesson 251's own real orientation
tests: never trust a number this section computed without a second,
different way of confirming it.

## Definition of Done

- [ ] A real state representation (position and velocity, bundled) was
      built and used consistently.
- [ ] `fall-step` correctly applies both rate-of-change relationships,
      each one multiplied by `dt` before being added to an accumulated
      quantity — not left as a raw rate.
- [ ] `simulate-fall` includes a real safety cap, chosen with Lesson
      248's own measured recursion-depth ceiling in mind.
- [ ] The simulated fall time for a `100`-meter drop was checked against
      the real, exact `√(2h/g)` formula and found to agree within one
      timestep's own real numerical error.
- [ ] A second, independent height (`44.1` meters, an exact-answer case)
      was checked too, confirming the first result wasn't a coincidence.
- [ ] The planted bug — velocity added directly to position with no
      `dt` multiplication — was found, explained in terms of real
      physical units (meters versus meters-per-second), and fixed.
- [ ] `git commit` with a message explaining *why* every rate-of-change
      term in a simulation must be multiplied by the timestep before
      being accumulated — for example: `"Fix fall-step: multiply
      velocity by dt before adding to position — adding a raw rate
      directly to an accumulated quantity is a real dimensional error,
      not just a style choice, and it silently produced a 10x-too-fast
      simulation."`

---

This closes Section XI (Linear Algebra, Geometry, and Continuous
Mathematics, Lessons 231–252). Section XII (Computability, Complexity,
and the Limits of Algorithms, Lessons 253–272) is a genuine, complete
topic break — formal automata, Turing machines, the halting problem, and
complexity classes — with no dependency on this section's own points,
vectors, matrices, or calculus machinery.
