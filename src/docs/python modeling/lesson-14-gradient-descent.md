# Lesson 14: What Minimization Actually Does — `GradientDescentOptimizer`

**What you will build:** a new class, `GradientDescentOptimizer`, in a
new file `src/vector3d/optimizer.py` — Phase E's first lesson, and this
project's first venture outside geometry entirely: numerical
optimization. Given any function that takes a `Vector3` and returns a
single number (a "score" — lower is better), this class finds a
`Vector3` that makes that score as small as it can, with no calculus
done by hand and no external library — replacing
`scipy.optimize.minimize(..., method="L-BFGS-B")` from `diff3d.py`'s
`align3d()`.

**What you need to know first:** Phase A's `Vector3` (specifically
`__add__`, `__sub__`, `__mul__`, `dot`, `length`) and Lesson 9's
running-best/sentinel scanning pattern is *not* needed here — this
lesson's stopping condition works differently, and says so explicitly
in its own Concept Unit.

**Terms used in this lesson:**
- **objective function** — the function being minimized: takes a
  candidate answer, returns one number scoring how good it is (lower is
  better, by convention). In `align3d()`, the objective function takes a
  candidate alignment offset and returns a total squared-distance
  score — `align3d()`'s own `fun`, defined fresh inside `minimize_pass`
  each time it runs.
- **derivative / slope** — how fast a function's output changes as its
  input changes, at a specific point — a single number for a function of
  one variable, telling you which direction (and how steeply) the
  output would move if the input moved slightly.
- **finite differences** — estimating a derivative *numerically*,
  without symbolic calculus, by actually evaluating the function at two
  very close points and dividing the difference in output by the
  difference in input: `(f(x + epsilon) - f(x)) / epsilon`. It exists as
  a general-purpose way to estimate a slope for *any* function you can
  call, even one whose formula is too complex (or too opaque — built
  from other function calls, loops, conditionals) to differentiate by
  hand with algebra.
- **gradient** — the multi-dimensional generalization of a derivative:
  for a function taking a `Vector3` and returning one number, the
  gradient is itself a `Vector3` — one slope per axis, each computed by
  nudging *only* that axis and holding the other two fixed. It points in
  the direction the objective function increases fastest.
- **gradient descent** — an optimization method: repeatedly compute the
  gradient at the current candidate, then step *against* it (the
  gradient points toward increasing output; stepping the opposite way
  decreases it), by some fraction of its size. Repeat until the
  candidate stops changing much, or a maximum number of attempts is
  reached.
- **learning rate** — the fraction of the gradient's own size actually
  used for each step (`0.1` means "move 10% of the way the gradient
  suggests, not the full distance"). It exists because stepping the
  gradient's *full* size, every time, tends to overshoot a function's
  actual minimum and bounce around it instead of settling down —
  worth naming as a real, honest control this lesson's own SE Lens
  returns to.
- **convergence** — the point at which further optimization steps stop
  producing meaningful improvement, used here as the stopping condition:
  once the gradient's own `length()` (Lesson 4) drops below a small
  threshold, the candidate is close enough to a genuine minimum (where
  the true gradient is exactly zero) that continuing further isn't
  worth it.

**Objects and methods used:**

- **`GradientDescentOptimizer`**
  - *What it is:* a class implementing gradient descent (this lesson's
    own term) for any `Vector3`-to-number objective function.
  - *Implementation:* `class GradientDescentOptimizer:` with
    `__init__(self, learning_rate=0.1, epsilon=1e-6, max_iterations=100)`
    storing three tunable settings, plus `_gradient` and `minimize`,
    built across this lesson's Concept Units.
  - *Its use:* the from-scratch, deliberately simpler replacement for
    `scipy.optimize.minimize(..., method="L-BFGS-B")` in `diff3d.py`'s
    `align3d()` — L-BFGS-B is a real, considerably more sophisticated
    algorithm (it builds an approximation of the objective function's
    second-derivative structure to take smarter steps); this project's
    own optimizer uses plain first-derivative gradient descent instead,
    a genuinely different and less powerful method, named honestly as
    such rather than claimed to be equivalent.
  - *Type:* a plain class, with tunable numeric settings stored at
    construction time rather than hard-coded into its methods.
  - *Responsibility:* to search for a `Vector3` that minimizes any
    objective function it's handed, using only repeated function calls
    and finite-difference gradient estimates — no knowledge of that
    function's internals required.
  - *Depends on:* nothing beyond `Vector3`'s own already-built
    arithmetic (`__add__`, `__sub__`, `__mul__`, `length`) and an
    objective function supplied by the caller.
  - *Connects to:* nothing calls `GradientDescentOptimizer` yet within
    this project beyond this lesson's own verification; Lesson 15
    (multi-pass alignment) will call `minimize` directly, the same role
    `scipy.optimize.minimize` plays in the original script's
    `minimize_pass`.
  - *Shape:* a new architectural branch — general-purpose numerical
    optimization, entirely independent of this project's geometry
    classes; it operates on `Vector3` only because that happens to be
    the 3-number shape `align3d()`'s own objective function needs, not
    because it has any inherent connection to 3D geometry.

- **`GradientDescentOptimizer._gradient`**
  - *What it is:* an instance method estimating the gradient (this
    lesson's own term) of an objective function at a given point, via
    finite differences.
  - *Implementation:*
    ```
    def _gradient(self, f, point):
        base = f(point)
        eps = self.epsilon
        dx = (f(point + Vector3(eps, 0.0, 0.0)) - base) / eps
        dy = (f(point + Vector3(0.0, eps, 0.0)) - base) / eps
        dz = (f(point + Vector3(0.0, 0.0, eps)) - base) / eps
        return Vector3(dx, dy, dz)
    ```
    — takes `self`, an objective function `f`, and a `Vector3` point;
    returns a new `Vector3`, the estimated gradient.
  - *Its use:* the core numerical building block `minimize` (built next
    in this lesson) repeats on every single iteration.
  - *Type:* an ordinary instance method, leading-underscore internal
    helper (Lesson 11's own naming convention).
  - *Responsibility:* to estimate how `f`'s output would change if
    `point` moved slightly along each axis independently, calling `f`
    exactly four times per gradient estimate (once for the unperturbed
    baseline, once per axis).
  - *Depends on:* `self.epsilon` (set by `__init__`), `Vector3.__add__`
    (Lesson 2), and whatever objective function `f` it's handed.
  - *Connects to:* calls `f` four times per invocation; called
    repeatedly by `minimize`, built next.
  - *Shape:* `GradientDescentOptimizer`'s own internal layer.

- **`GradientDescentOptimizer.minimize`**
  - *What it is:* an instance method repeatedly stepping a candidate
    `Vector3` against its estimated gradient until convergence or a
    maximum number of iterations.
  - *Implementation:*
    ```
    def minimize(self, f, initial_point):
        point = initial_point
        for _ in range(self.max_iterations):
            grad = self._gradient(f, point)
            if grad.length() < self.epsilon:
                break
            point = point - grad * self.learning_rate
        return point
    ```
    — takes `self`, an objective function `f`, and a starting
    `Vector3`; returns a `Vector3` believed to (approximately) minimize
    `f`.
  - *Its use:* the direct, from-scratch equivalent of the whole
    `scipy.optimize.minimize(fun, x0=delta0, ...)` call in `diff3d.py`'s
    `minimize_pass`.
  - *Type:* an ordinary instance method — the one later lessons will
    actually call.
  - *Responsibility:* to repeatedly improve a candidate answer by
    stepping against its own estimated gradient, stopping either once
    that gradient becomes small enough to trust the candidate is close
    to a true minimum, or once `self.max_iterations` steps have been
    taken without reaching that point.
  - *Depends on:* `self._gradient` (this lesson), `self.learning_rate`/
    `self.max_iterations` (set by `__init__`), and `Vector3.__sub__`/
    `Vector3.__mul__` (Lessons 2 and 10).
  - *Connects to:* calls `self._gradient` once per iteration (up to
    `max_iterations` times). Lesson 15 will call this method directly.
  - *Shape:* `GradientDescentOptimizer`'s own top-level method.

---

## Concept Unit: Estimating a Slope Without Calculus

### The Problem

`align3d()`'s own `fun` — the objective function `scipy.optimize.minimize`
is handed — is built from real Python code: a call to `find_closest`, a
subtraction, a sum of squares, sometimes an exponential. There's no
tidy algebraic formula to differentiate by hand the way you might for
`y = x²`. `scipy.optimize`'s own L-BFGS-B algorithm handles this by
estimating derivatives numerically when an exact formula isn't
supplied — this project needs the same capability, built from scratch.

> **Before reading on, try this yourself:** a derivative, informally, is
> "how much does the output change for a tiny change in the input."
> Given a function `f` you can call but can't algebraically
> differentiate, and a point `x`, what's the simplest experiment you
> could run — using only *calls to `f`* — to estimate that rate of
> change directly? (Think about what "change in output" and "change in
> input" would each need to be measured as, and what arithmetic
> combining them would estimate a rate.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: estimating a slope from two nearby function values, no calculus needed
def f(x):
    return (x - 3.0) ** 2

def slope_at(f, x, epsilon):
    return (f(x + epsilon) - f(x)) / epsilon

print(slope_at(f, 0.0, 1e-4))
print(slope_at(f, 3.0, 1e-4))
print(slope_at(f, 5.0, 1e-4))
```

Real output:

```
-5.99990000001327
0.00010000000000042206
4.00009999999007
```

`f(x) = (x - 3)²` has a real, known, hand-derivable calculus derivative
— `2(x - 3)` — useful here specifically because it lets the estimate be
checked against a known-correct answer: at `x=0`, the true derivative is
`2(0-3) = -6`; at `x=3` (`f`'s own actual minimum), it's `2(3-3) = 0`;
at `x=5`, it's `2(5-3) = 4`. The **finite differences** (this lesson's
own term) estimates — `-5.9999`, `0.0001`, `4.0001` — land extremely
close to all three, confirming this Concept Unit's own Socratic prompt's
approach really works: evaluate `f` at the point and at a point
`epsilon` away, and divide the difference in output by the difference in
input (`epsilon` itself), estimating the true instantaneous rate of
change with an actual, tiny-but-nonzero step instead.

### Discard the Throwaway Example

This `slope_at` function is discarded now — the real project version,
built later in this lesson, applies this same idea across three axes at
once rather than one.

### Project Change

- **Reference Source:** `diff3d.py`'s
  `scipy.optimize.minimize(fun, x0=delta0, method="L-BFGS-B", tol=tol_rel*size)`
  — `scipy`'s own L-BFGS-B implementation performs numerical gradient
  estimation internally (among other, more sophisticated things) when no
  exact derivative function is supplied, exactly as `align3d()`'s own
  call doesn't supply one. This Concept Unit's finite-differences idea
  is the same general numerical technique, well-established outside
  `scipy` too — stated here from established knowledge, not fetched
  live this session (no network access in this environment), the same
  honesty note used since Lesson 8.
- **Files affected:** none yet — this Concept Unit's own idea is proven
  only in the throwaway lab; the real project file is created in the
  next Concept Unit, generalized to three axes at once.
- **Change type:** N/A for this Concept Unit specifically.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A for this Concept Unit — the finite-differences idea itself is
proven in the throwaway lab above; the next Concept Unit is where it
becomes real, committed project code, applied to `Vector3`-valued
points instead of plain numbers.

### The Updated Project

N/A for this Concept Unit, for the same reason.

### Mechanical Walkthrough

- **`def slope_at(f, x, epsilon):`** — `def`, a module-level function
  (Lesson 10's own term), taking another function, `f`, as one of its
  own arguments — already legal, ordinary Python (functions are values
  like any other), though this is the first time this project has
  passed a function *as an argument to another function* — a new
  pattern worth naming even though the syntax itself needs no new
  explanation beyond ordinary parameter-passing.
- **`return (f(x + epsilon) - f(x)) / epsilon`** — `f(x + epsilon)` and
  `f(x)`, two separate calls to the passed-in function, at two very
  close input values; the difference between their outputs, divided by
  the difference between their inputs (`epsilon` itself, since
  `(x + epsilon) - x` is exactly `epsilon`) — the direct implementation
  of "change in output over change in input," this lesson's own
  informal definition of a derivative.

### CS Lens

This is **numerical differentiation** via **finite differences** (this
lesson's own term for both) — specifically, this exact one-sided
version is called the **forward difference** method (evaluating at `x`
and `x + epsilon`, rather than, say, both `x - epsilon` and
`x + epsilon`, which is a real, slightly more accurate alternative
called a "central difference").

Also recognized in: physics simulations (estimating velocity from two
close-together position samples, or acceleration from two close-together
velocity samples — literally the same "difference over a small interval"
idea, applied to motion instead of an arbitrary function); machine
learning (gradient checking — numerically estimating a gradient this
same way, specifically to verify that a hand-derived or automatically-
differentiated gradient formula is correct, by comparing the two);
any optimization library (like `scipy.optimize` itself) that falls back
to this exact technique whenever a user-supplied objective function has
no exact derivative available.

### SE Lens

The principle is **treating a function as a black box** — this
technique needs nothing about `f`'s internal structure, only the
ability to call it and read a number back. That's exactly what makes it
usable for `align3d()`'s own objective function, built from real calls
to `find_closest` and real Python arithmetic, with no tidy formula to
differentiate symbolically.

The alternative not chosen: hand-derive an exact, symbolic gradient
formula for `align3d()`'s specific objective function, the way you might
for a simple polynomial like this Concept Unit's own `f(x) = (x-3)²`.
That would be more accurate (no `epsilon`-dependent estimation error at
all) and faster (no extra function calls needed) — but it would require
redoing that derivation by hand for every different objective function
this project (or any future one) ever needs to minimize, and would be
genuinely difficult or impractical for a function built from
conditional logic and nearest-neighbor searches the way `align3d()`'s
own is. Finite differences trade some accuracy and speed for working
identically on *any* callable objective function, with zero calculus
required at the call site.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — this Concept Unit's throwaway lab is its own
complete execution.

### Connect

This slope-estimation idea, proven on a single number, is exactly what
the next Concept Unit applies independently to each of a `Vector3`'s
three axes — turning a single slope into a full gradient.

---

## Concept Unit: From a Slope to a Gradient

### The Problem

`align3d()`'s objective function doesn't take a single number — it
takes a 3D offset (`delta`, a `Vector3` in this project's own terms).
Minimizing it needs to know how the output changes along *each* of the
three axes independently, not just one overall slope — this lesson's
own **gradient** term.

> **Before reading on, try this yourself:** the previous Concept Unit's
> `slope_at` nudged a single number by `epsilon` and measured the
> change. Given a `Vector3` point instead, and `Vector3.__add__`
> (Lesson 2) already available, what three separate nudges — each
> changing *only one* of `x`, `y`, `z` while leaving the other two
> exactly as they were — would let you estimate three independent
> slopes, one per axis, using the identical "difference in output over
> difference in input" idea from the previous Concept Unit?

### Introduce the Concept in Isolation

```python
# Throwaway lab: estimating a slope along each axis separately, assembled into a vector
class Vec2:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        return Vec2(self.x + other.x, self.y + other.y)
    def __repr__(self):
        return f"Vec2({self.x}, {self.y})"

def f(v):
    return (v.x - 3.0) ** 2 + (v.y - 1.0) ** 2

def gradient(f, point, epsilon):
    base = f(point)
    dx = (f(point + Vec2(epsilon, 0.0)) - base) / epsilon
    dy = (f(point + Vec2(0.0, epsilon)) - base) / epsilon
    return Vec2(dx, dy)

print(gradient(f, Vec2(0.0, 0.0), 1e-4))
print(gradient(f, Vec2(3.0, 1.0), 1e-4))
```

Real output:

```
Vec2(-5.99990000001327, -1.9999000000048284)
Vec2(0.00010000000000042206, 9.999999999997795e-05)
```

`f`'s true minimum sits at `(3.0, 1.0)` (each term is a squared
difference, minimized at exactly zero when `x=3` and `y=1`). At
`(0, 0)`, the estimated gradient, `(-6, -2)`, matches the real calculus
answer (`2(0-3)=-6`, `2(0-1)=-2`) — confirming both axes were nudged
*independently*, each producing its own correct slope, exactly as the
Socratic prompt above described. At the true minimum itself, `(3, 1)`,
both components come back essentially `0` — the defining property of a
minimum: the gradient vanishes there.

### Discard the Throwaway Example

This `Vec2`/lab pair is discarded now. `GradientDescentOptimizer` gets
the real, three-axis `_gradient` next.

### Project Change

- **Reference Source:** same as this lesson's previous Concept Unit —
  `scipy.optimize.minimize`'s own internal multi-dimensional gradient
  estimation, generalized from this lesson's earlier single-axis idea.
- **Files affected:** create `src/vector3d/optimizer.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Vector3.__add__` (Lesson 2).

### The New Code

Type this into `src/vector3d/optimizer.py`:

```python
from vector3d.vector import Vector3


class GradientDescentOptimizer:
    def __init__(self, learning_rate=0.1, epsilon=1e-6, max_iterations=100):
        self.learning_rate = learning_rate
        self.epsilon = epsilon
        self.max_iterations = max_iterations

    def _gradient(self, f, point):
        base = f(point)
        eps = self.epsilon
        dx = (f(point + Vector3(eps, 0.0, 0.0)) - base) / eps
        dy = (f(point + Vector3(0.0, eps, 0.0)) - base) / eps
        dz = (f(point + Vector3(0.0, 0.0, eps)) - base) / eps
        return Vector3(dx, dy, dz)
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption used throughout this curriculum):

```
 1  from vector3d.vector import Vector3
 2
 3
 4  class GradientDescentOptimizer:
 5      def __init__(self, learning_rate=0.1, epsilon=1e-6, max_iterations=100):
 6          self.learning_rate = learning_rate
 7          self.epsilon = epsilon
 8          self.max_iterations = max_iterations
 9
10      def _gradient(self, f, point):
11          base = f(point)
12          eps = self.epsilon
13          dx = (f(point + Vector3(eps, 0.0, 0.0)) - base) / eps
14          dy = (f(point + Vector3(0.0, eps, 0.0)) - base) / eps
15          dz = (f(point + Vector3(0.0, 0.0, eps)) - base) / eps
16          return Vector3(dx, dy, dz)
```

As a whole, this file now defines a buildable `GradientDescentOptimizer`
that can estimate the full 3D gradient of any `Vector3`-to-number
function at any point — the core numerical capability everything else
in this lesson builds on top of.

### Mechanical Walkthrough

- **`def __init__(self, learning_rate=0.1, epsilon=1e-6, max_iterations=100):`**
  — `def`, `__init__` (Lesson 1's reserved constructor name), `self`,
  and three parameters, each given a **default argument** — ordinary
  Python syntax (already familiar) letting a caller build a
  `GradientDescentOptimizer()` with no arguments at all and still get
  sensible starting values, or override any one of the three
  individually.
- **`self.learning_rate = learning_rate`**, **`self.epsilon = epsilon`**,
  **`self.max_iterations = max_iterations`** — three ordinary attribute
  assignments (Lesson 1's own pattern), storing this instance's own
  tunable settings — this lesson's own **learning rate** term, the
  `epsilon` used both for finite-differences nudging and for the
  convergence threshold (this lesson's own term, both reused for the
  same small number rather than needing two separate settings), and a
  hard cap on how many iterations `minimize` (built next) will ever run.
- **`def _gradient(self, f, point):`** — `def`; `_gradient`, a
  leading-underscore internal helper name (Lesson 11's own convention);
  `self`, `f` (the objective function itself, passed in as an ordinary
  argument — the same function-as-argument pattern this lesson's
  previous Concept Unit already introduced), and `point` (the `Vector3`
  to estimate the gradient at).
- **`base = f(point)`** — calling the passed-in objective function once,
  at the unperturbed point, storing its result for reuse in all three
  axis calculations below (rather than needing three separate baseline
  calls).
- **`eps = self.epsilon`** — a local alias for `self.epsilon`, used
  three times below purely for shorter, more readable lines.
- **`dx = (f(point + Vector3(eps, 0.0, 0.0)) - base) / eps`** — this
  lesson's own **finite differences** formula from the previous Concept
  Unit, generalized: `point + Vector3(eps, 0.0, 0.0)` — `Vector3.__add__`
  (Lesson 2) — nudges *only* the `x` component by `eps`, leaving `y` and
  `z` exactly as they were in `point`; `f(...)` evaluates the objective
  function at that nudged position; subtracting `base` and dividing by
  `eps` estimates the slope along the `x` axis alone.
- **`dy = (...)`** and **`dz = (...)`** — structurally identical, each
  nudging a *different* single axis (`Vector3(0.0, eps, 0.0)` for `y`,
  `Vector3(0.0, 0.0, eps)` for `z`), directly answering this Concept
  Unit's own Socratic prompt: three independent single-axis nudges,
  each isolating one component's own contribution to the overall slope.
- **`return Vector3(dx, dy, dz)`** — `return`, assembling the three
  independently-estimated slopes into a single `Vector3` — the
  gradient, via `Vector3.__init__` (Lesson 1).

### CS Lens

This is the **numerical gradient** — the vector-valued generalization of
this lesson's own single-axis finite-differences derivative, computed by
applying that same one-axis-at-a-time technique independently along
every dimension.

Also recognized in: every practical application of gradient-based
optimization across more than one variable — neural network training
(though modern deep learning uses automatic differentiation rather than
finite differences, for speed and accuracy, the *concept* of a gradient
as "one partial slope per parameter, assembled into a vector" is
identical); terrain/heightmap analysis (the gradient of elevation at a
point tells you the steepest uphill direction — literally the origin of
the word "gradient" in everyday geographic use); any multi-variable
calibration or fitting problem (adjusting several independent knobs to
minimize some measured error).

### SE Lens

The principle is the same **composing a higher-dimensional operation
from independent lower-dimensional ones** this project has used
repeatedly since `Mesh.bounds()` (Lesson 6, treating `x`/`y`/`z` as
independent scans) — here, treating each axis as an independent
one-variable optimization problem, even though the *objective function*
itself might mix all three together in complex ways internally.

The alternative not chosen, worth naming honestly: this method calls
`f` four times per gradient estimate (`base`, plus once per axis) — for
an objective function as expensive as `align3d()`'s own (which calls
`find_closest` internally, itself scanning many candidate triangles),
four calls per gradient, times many gradient calls per `minimize` run,
adds up to a real, non-trivial computational cost. A **central
difference** (evaluating both `f(point - eps)` and `f(point + eps)` per
axis, rather than this method's baseline-plus-one-nudge approach) is
somewhat more numerically accurate, at the cost of *seven* calls to `f`
per gradient instead of four. This lesson's own **forward difference**
choice deliberately favors fewer expensive function calls over that
extra accuracy — a real, named tradeoff, not an oversight.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.optimizer import GradientDescentOptimizer

target = Vector3(3.0, 1.0, -2.0)

def f(v):
    diff = v - target
    return diff.dot(diff)

opt = GradientDescentOptimizer()
grad = opt._gradient(f, Vector3(0.0, 0.0, 0.0))
print(grad)
"
```

Real output:

```
Vector3(-5.999999000749767, -1.9999990001906554, 4.0000010006480125)
```

`f(v)` here is the squared distance from `v` to a known target,
`(3, 1, -2)` — its true calculus gradient at the origin is
`(-6, -2, 4)` (twice the negative of the target's own coordinates), and
the finite-differences estimate lands extremely close on all three
axes, confirmed by real numbers rather than only claimed.

### Connect

`GradientDescentOptimizer` can now estimate a full 3D gradient at any
point. The final Concept Unit uses that gradient to actually search for
a minimum — repeatedly stepping against it.

---

## Concept Unit: Taking Steps Downhill — `minimize()`

### The Problem

A gradient alone doesn't find a minimum — it only says which direction
is currently *uphill*. `diff3d.py`'s `scipy.optimize.minimize` performs
an entire iterative search, repeatedly refining its candidate answer;
nothing built so far in this project repeats anything at all — Lesson
14's own `_gradient` only ever answers "what's the slope right here,"
once.

> **Before reading on, try this yourself:** if the gradient points
> *uphill* (the direction the objective function increases fastest),
> what direction would you step to make the objective function
> *smaller*? And given this lesson's own **learning rate** term — a
> fraction of the gradient's own size, rather than the full size —
> sketch, in plain words, what a loop repeating "compute the gradient,
> step a fraction of the way against it" would need to check on every
> pass to know *when to stop*, given that a true minimum is exactly the
> point where the gradient becomes zero.

### Introduce the Concept in Isolation

```python
# Throwaway lab: repeatedly stepping downhill against the gradient
class Vec2:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, other):
        return Vec2(self.x + other.x, self.y + other.y)
    def __sub__(self, other):
        return Vec2(self.x - other.x, self.y - other.y)
    def __mul__(self, n):
        return Vec2(self.x * n, self.y * n)
    def dot(self, other):
        return self.x * other.x + self.y * other.y
    def length(self):
        return self.dot(self) ** 0.5
    def __repr__(self):
        return f"Vec2({self.x}, {self.y})"

def f(v):
    return (v.x - 3.0) ** 2 + (v.y - 1.0) ** 2

def gradient(f, point, epsilon):
    base = f(point)
    dx = (f(point + Vec2(epsilon, 0.0)) - base) / epsilon
    dy = (f(point + Vec2(0.0, epsilon)) - base) / epsilon
    return Vec2(dx, dy)

point = Vec2(0.0, 0.0)
learning_rate = 0.1
for i in range(50):
    grad = gradient(f, point, 1e-6)
    if grad.length() < 1e-4:
        break
    point = point - grad * learning_rate

print(point)
print(i)
```

Real output:

```
Vec2(2.9999566825764243, 0.9999852275302143)
49
```

Starting from `(0, 0)`, with the true minimum sitting at `(3, 1)`, this
loop lands at `(2.99996, 0.99999)` — extraordinarily close, confirmed
by real numbers, not merely claimed. `i` printing `49` means the loop
ran the full `50` passes without ever triggering the `break` — a real,
honest data point this Concept Unit's own SE Lens returns to: this
particular combination of `learning_rate` and stopping threshold
converges *closely*, but hadn't technically satisfied its own
convergence check yet when the loop's own iteration cap was reached.

### Discard the Throwaway Example

This `Vec2`/lab pair is discarded now. `GradientDescentOptimizer` gets
the real `minimize` next.

### Project Change

- **Reference Source:** `diff3d.py`'s
  `scipy.optimize.minimize(fun, x0=delta0, method="L-BFGS-B", tol=tol_rel*size)`
  — this method is the deliberately simpler, from-scratch replacement:
  plain gradient descent rather than L-BFGS-B's own more sophisticated
  approximated-second-derivative approach, named honestly rather than
  claimed equivalent, per this lesson's own Header.
- **Files affected:** modify `src/vector3d/optimizer.py`.
- **Change type:** add.
- **Location:** inside `class GradientDescentOptimizer:`, directly
  after `_gradient` (earlier in this lesson).
- **Dependencies:** `self._gradient` (earlier in this lesson),
  `self.learning_rate`/`self.max_iterations` (set by `__init__`), and
  `Vector3.__sub__`/`Vector3.__mul__` (Lessons 2 and 10).

### The New Code

```python
    def minimize(self, f, initial_point):
        point = initial_point
        for _ in range(self.max_iterations):
            grad = self._gradient(f, point)
            if grad.length() < self.epsilon:
                break
            point = point - grad * self.learning_rate
        return point
```

### The Updated Project

`src/vector3d/optimizer.py` in full, new lines marked:

```
 1  from vector3d.vector import Vector3
 2
 3
 4  class GradientDescentOptimizer:
 5      def __init__(self, learning_rate=0.1, epsilon=1e-6, max_iterations=100):
 6          self.learning_rate = learning_rate
 7          self.epsilon = epsilon
 8          self.max_iterations = max_iterations
 9
10      def _gradient(self, f, point):
11          base = f(point)
12          eps = self.epsilon
13          dx = (f(point + Vector3(eps, 0.0, 0.0)) - base) / eps
14          dy = (f(point + Vector3(0.0, eps, 0.0)) - base) / eps
15          dz = (f(point + Vector3(0.0, 0.0, eps)) - base) / eps
16          return Vector3(dx, dy, dz)
17
18      def minimize(self, f, initial_point):                            # ← new
19          point = initial_point                                        # ← new
20          for _ in range(self.max_iterations):                         # ← new
21              grad = self._gradient(f, point)                          # ← new
22              if grad.length() < self.epsilon:                         # ← new
23                  break                                                 # ← new
24              point = point - grad * self.learning_rate                # ← new
25          return point                                                  # ← new
```

As a whole, `GradientDescentOptimizer` is now complete: given any
objective function and a starting point, `minimize` repeatedly estimates
the gradient and steps against it, stopping once the gradient is small
enough to trust the search has converged (this lesson's own term), or
once `max_iterations` is reached, whichever comes first.

### Mechanical Walkthrough

- **`def minimize(self, f, initial_point):`** — `def`; `minimize`,
  deliberately the same conceptual name `scipy.optimize.minimize` uses
  — a real, if partial, port; `self`, `f` (the objective function), and
  `initial_point` (a starting `Vector3` guess).
- **`point = initial_point`** — a local variable, initialized to the
  starting guess; this is what gets updated on every iteration below —
  `initial_point` itself is never modified (`Vector3.__sub__`, used
  below, always returns a *new* `Vector3`, never changes an existing
  one, exactly per Lesson 2's own original design).
- **`for _ in range(self.max_iterations):`** — Lesson 8's own `range()`
  + throwaway-`_` pattern, reused here to cap the total number of
  optimization steps, guaranteeing this method always terminates even if
  convergence is never actually reached.
- **`grad = self._gradient(f, point)`** — calling this class's own
  `_gradient` (earlier in this lesson) at the *current* candidate point,
  re-estimated fresh on every single iteration, since the gradient
  itself changes as `point` moves.
- **`if grad.length() < self.epsilon: break`** — `Vector3.length()`
  (Lesson 4), measuring the gradient's own overall magnitude; `break`
  (already-familiar Python — exits the loop immediately) — this
  lesson's own **convergence** check, directly answering this Concept
  Unit's own Socratic prompt: once the gradient's size drops below a
  small threshold, the search is close enough to a genuine minimum
  (where the true gradient is exactly zero) to stop early, rather than
  running all `max_iterations` regardless.
- **`point = point - grad * self.learning_rate`** — `grad * self.learning_rate`
  — `Vector3.__mul__` (Lesson 10), scaling the gradient down to only a
  fraction of its full size; `point - ...` — `Vector3.__sub__` (Lesson
  2), stepping *against* the gradient's own direction (subtracting,
  since the gradient points toward increasing output, and this method
  wants to decrease it) — directly answering the first half of this
  Concept Unit's own Socratic prompt.
- **`return point`** — `return`, handing back whichever candidate the
  loop was working with when it stopped — either because convergence
  was reached, or because `max_iterations` ran out.

### CS Lens

This is **gradient descent** (this lesson's own term, in full) — one of
the most widely used optimization algorithms in all of computing,
built from exactly the two pieces this lesson assembled: a way to
estimate which direction is uphill, and a loop that keeps stepping
downhill until it can't usefully continue.

Also recognized in: training essentially every modern machine learning
model (though, as this lesson's own CS Lens for `_gradient` already
noted, real ML systems use automatic differentiation instead of finite
differences for the gradient step itself — the *descent* loop around it
is frequently this exact shape, often with real refinements like
momentum or adaptive learning rates this project's own simpler version
doesn't implement); operations research and engineering design
optimization (tuning many real-world parameters — a bridge's structural
dimensions, a chemical process's settings — to minimize cost or
maximize performance); this project's own immediate future: Lesson 15's
`align3d()` port will use this exact `minimize` method to find the best
3D translation aligning two meshes.

### SE Lens

The principle is the same **accepting a simpler, less powerful method
deliberately** already named in this lesson's own Header: real
optimization libraries like `scipy.optimize`'s L-BFGS-B build and
maintain an approximation of the objective function's *curvature*
(how the gradient itself changes), letting them take much smarter,
often far fewer, steps toward a true minimum. This lesson's plain
gradient descent only ever looks at the current gradient, one step at a
time, with a fixed learning rate — real, tunable settings, but no
adaptive intelligence about step size at all.

The honest, demonstrated cost, worth naming directly rather than only
asserted: this Concept Unit's own throwaway lab converged to within
roughly `0.0001` of the true answer, correct, but only by running the
*entire* `50`-iteration cap — the loop's own convergence check never
actually triggered in that run. A learning rate that's too small
converges reliably but slowly (more iterations needed, as demonstrated
here); one that's too large can overshoot a minimum and oscillate,
never converging at all. Real gradient-descent-based optimizers
(including more advanced variants of this exact family) commonly add
adaptive learning rates that shrink automatically as the search
progresses — a real, well-known refinement this project's own simpler
version doesn't implement, left as a deliberate scope limit rather than
a bug.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.optimizer import GradientDescentOptimizer

target = Vector3(3.0, 1.0, -2.0)

def f(v):
    diff = v - target
    return diff.dot(diff)

opt = GradientDescentOptimizer()
result = opt.minimize(f, Vector3(0.0, 0.0, 0.0))
print(result)
print(f(result))
"
```

Real output:

```
Vector3(2.9999991050789725, 0.9999993683597013, -2.0000002367192047)
1.2558890943189404e-12
```

Starting from the origin, with no knowledge of where `target` actually
sits beyond what the objective function `f` reveals through its own
outputs, `minimize` converges to within about `0.000001` of the true
`(3, 1, -2)` on every axis — and `f(result)`, the actual remaining
squared distance, comes back as a number so close to zero
(`1.26 × 10⁻¹²`) that it's effectively exact for any real purpose.

### Connect

Phase E's first lesson is complete: `GradientDescentOptimizer` can
minimize any `Vector3`-to-number objective function, verified against a
known target where the true answer is checkable by hand. The next
lesson builds `align3d()`'s own actual objective function — real squared
distances to a mesh's surface, using Phase C's search classes — and
hands it to this exact `minimize` method, in place of
`scipy.optimize.minimize`.

---

## Connect the Pieces

One optimization run, traced through every method this lesson built:
`opt.minimize(f, Vector3(0,0,0))` (third Concept Unit) starts with
`point = Vector3(0,0,0)`. On its first pass, `self._gradient(f, point)`
(second Concept Unit) nudges `point` along each axis independently via
`Vector3.__add__` (Lesson 2), calling the objective function `f` four
times total, and assembles three estimated slopes — each one itself
computed via this lesson's first Concept Unit's own forward-difference
formula — into a gradient of roughly `(-6, -2, 4)`. Because that
gradient's `length()` (Lesson 4) is nowhere near `self.epsilon`, the
loop scales it down by `self.learning_rate` (`Vector3.__mul__`, Lesson
10) and steps `point` against it (`Vector3.__sub__`, Lesson 2) — closer
to the true minimum, though not there yet. This repeats, the gradient
shrinking on each pass as `point` approaches `(3, 1, -2)`, until
`grad.length()` finally drops below `self.epsilon` and the loop exits
early — landing within roughly `0.000001` of the exact answer, using
nothing but repeated calls to `f` and `Vector3`'s own already-built
arithmetic.

---

## Try It Yourself

Type `GradientDescentOptimizer` into `src/vector3d/optimizer.py`
yourself (not copy-pasted), and confirm both `Run It` outputs above with
your own target point. Then, once that works, try a deliberately too-large
learning rate (`1.5` instead of the default `0.1`) on the same objective
function, and see for yourself what this lesson's own SE Lens warned
about — overshooting — happening for real:

```python
bad_opt = GradientDescentOptimizer(learning_rate=1.5, max_iterations=10)
result = bad_opt.minimize(f, Vector3(0.0, 0.0, 0.0))
print(result)
print(f(result))
```
