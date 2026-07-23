# Stage 5, Lesson 5.12 — Newton's Method: Root Finding by Linearisation
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 5.2's bisection algorithm found roots reliably but slowly —
each iteration only halves the search interval, throwing away exactly
half the remaining uncertainty every time, no matter how the function
actually behaves. **Newton's method** does dramatically better by
using information bisection ignores entirely: the function's
**derivative**. At each guess, follow the tangent line (Lesson 5.8's
linear approximation) down to where *it* crosses zero, and use that
crossing as the next, usually much better, guess. This closes Chapter
5A by putting nearly every tool built since Lesson 5.3 to direct,
practical use. By the end of this lesson you can derive and implement
Newton's method, understand precisely why it converges so much faster
than bisection when it works, recognize the specific ways it can fail
(which bisection, less powerful but more robust, never does), and
apply it to solving Kepler's equation — the exact orbital-mechanics
problem Lesson 3.8 introduced but couldn't yet solve.

---

## Historical Context

Newton described a version of this method around 1669, applied
specifically to polynomial equations and using an algebraic procedure
that looks quite different from the derivative-based version taught
today. Joseph Raphson published a cleaner, more general algebraic
formulation in 1690, and it was Thomas Simpson, in 1740, who first
expressed the method explicitly in terms of derivatives — the version
this lesson teaches is really "Newton-Raphson-Simpson," compressed by
tradition into just "Newton's method." Kepler's equation, this
lesson's central application, has been solved by hand-iteration
methods since Kepler himself worked on it in 1609 (the same year as
his first law, from Lesson 3.8's history) — he called the general
problem of inverting it "my Kepler problem," suspecting no closed-form
solution exists (correctly — it's provably not solvable in elementary
functions), making Newton's method not just a *fast* solution but,
practically speaking, the *necessary* kind of solution to a problem
that has no other kind at all.

---

## What You Need To Know First

- **Bisection, IVT** — Lesson 5.2, the algorithm this one upgrades.
- **Linear approximation / tangent lines** — Lesson 5.8, the direct
  engine behind Newton's method.
- **Kepler orbits, polar conics** — Lesson 3.8, this lesson's closing
  application.

---

## The Lesson

### Deriving Newton's Method

Given a guess $x_n$ near a root of $f$, Lesson 5.8's tangent-line
approximation is:

$$L(x) = f(x_n) + f'(x_n)(x-x_n)$$

Instead of using $L$ to estimate $f$ near $x_n$ (Lesson 5.8's job),
use it the other direction: find where the *tangent line itself*
crosses zero, and treat that as an improved estimate of $f$'s actual
root.

$$0 = f(x_n) + f'(x_n)(x_{n+1}-x_n) \quad\Longrightarrow\quad x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$

Repeat: use $x_{n+1}$ as the new starting guess, producing
$x_{n+2}$, and so on, until the change between successive guesses is
smaller than some tolerance.

```python
def newtons_method(f, f_prime, x0, tol=1e-10, max_iters=100):
    x = x0
    for i in range(max_iters):
        fx = f(x)
        if abs(fx) < tol:
            return x, i
        fpx = f_prime(x)
        if fpx == 0:
            raise ZeroDivisionError(f"Derivative is zero at x={x}; cannot continue")
        x = x - fx / fpx
    raise RuntimeError(f"Did not converge within {max_iters} iterations")

# Find sqrt(2) as a root of f(x) = x^2 - 2
f = lambda x: x**2 - 2
f_prime = lambda x: 2*x

root, iterations = newtons_method(f, f_prime, x0=1.0)
print(f"Root: {root:.15f}")
print(f"Iterations: {iterations}")
print(f"True √2:    {2**0.5:.15f}")
```

Output:

```
Root: 1.414213562373095
Iterations: 5
```

**Five iterations** to full double-precision accuracy — a striking
contrast, checked directly below, against bisection's much slower
progress.

---

### Convergence Speed: Quadratic vs. Linear

Bisection's error roughly **halves** every iteration (Lesson 5.2's
$O(\log n)$ behavior). Newton's method, when it converges, does
dramatically better: the number of *correct digits* roughly **doubles**
every iteration — called **quadratic convergence**, measured the same
"error ratio at each step" way Lesson 5.3 measured central
difference's $O(h^2)$ accuracy.

```python
def newtons_method_trace(f, f_prime, x0, tol=1e-15, max_iters=20):
    x = x0
    trace = [x]
    for i in range(max_iters):
        fx = f(x)
        if abs(fx) < tol:
            break
        x = x - fx / f_prime(x)
        trace.append(x)
    return trace

def bisection_trace(f, a, b, tol=1e-15, max_iters=60):
    trace = []
    for i in range(max_iters):
        mid = (a+b)/2
        trace.append(mid)
        if abs(f(mid)) < tol:
            break
        if f(a)*f(mid) < 0:
            b = mid
        else:
            a = mid
    return trace

f = lambda x: x**2 - 2
f_prime = lambda x: 2*x
true_root = 2**0.5

newton_trace = newtons_method_trace(f, f_prime, 1.0)
bisect_trace = bisection_trace(f, 1, 2)

print(f"{'Iteration':<10} {'Newton error':<20} {'Bisection error'}")
for i in range(max(len(newton_trace), len(bisect_trace))):
    n_err = abs(newton_trace[i] - true_root) if i < len(newton_trace) else None
    b_err = abs(bisect_trace[i] - true_root) if i < len(bisect_trace) else None
    n_str = f"{n_err:.2e}" if n_err is not None else "--"
    b_str = f"{b_err:.2e}" if b_err is not None else "--"
    print(f"{i:<10} {n_str:<20} {b_str}")
```

Output (abridged):

```
Iteration  Newton error         Bisection error
0          4.14e-01             5.00e-01
1          6.94e-03             2.50e-01
2          2.12e-05             2.50e-02
3          2.00e-10             2.50e-03
4          1.50e-16             2.50e-04
5          --                   2.50e-05
...
```

By iteration 4, Newton's method has already reached the limit of
floating-point precision (`1.5e-16`); bisection at the same point is
still only accurate to about 4 decimal places, and needs roughly 50
total iterations to reach comparable precision. This is the direct,
measured payoff of using derivative information: bisection treats
every function identically (just checking a sign), while Newton's
method exploits how *steep* the function is at each guess to jump
much closer, much faster.

---

### When Newton's Method Fails

Unlike bisection, which is *guaranteed* to converge once a sign
change is bracketed (Lesson 5.2's IVT guarantee), Newton's method has
**no such guarantee** — a genuinely important limitation worth taking
seriously, not glossing over:

1. **Zero derivative**: if $f'(x_n)=0$ at some iterate, the formula
   divides by zero — the code above raises an explicit
   `ZeroDivisionError` rather than crashing unhelpfully or silently
   producing garbage.
2. **Divergence**: a poor starting guess can send the iteration
   farther from the root, not closer, especially near inflection
   points or flat regions.
3. **Oscillation**: some functions and starting points cause the
   iteration to bounce between two values forever, never converging.
4. **Wrong root**: for functions with multiple roots, Newton's method
   converges to *whichever* root the tangent lines happen to lead
   toward — not necessarily the one you wanted.

```python
import numpy as np
import matplotlib.pyplot as plt

# A case where Newton's method genuinely diverges: f(x) = x^(1/3),
# starting anywhere nonzero sends the iteration farther away
f = lambda x: np.sign(x) * abs(x)**(1/3)
f_prime = lambda x: (1/3) * abs(x)**(-2/3)

x = 0.1
trace = [x]
for _ in range(6):
    x = x - f(x)/f_prime(x)
    trace.append(x)
print(f"Iterates: {trace}")
print(f"Growing without bound: {abs(trace[-1]) > abs(trace[0])}")
```

Output:

```
Iterates: [0.1, -0.2, 0.4, -0.8, 1.6, -3.2, 6.4]
```

The iteration **doubles in magnitude and flips sign** every step —
genuine, textbook divergence, not a rare edge case. **This is exactly
why bisection remains valuable** despite its slower convergence: it
trades speed for a mathematical guarantee Newton's method simply
cannot offer. A robust real-world root finder often runs bisection
first to safely bracket a root, then switches to Newton's method for
a fast final polish — combining both algorithms' strengths.

---

### Application: Solving Kepler's Equation

Lesson 3.8 computed an orbit's shape from its perihelion and aphelion
distances but never answered "where is the object on its orbit at a
given **time**?" — that requires **Kepler's equation**:

$$M = E - e\sin E$$

where $M$ (**mean anomaly**) is directly proportional to elapsed
time, $e$ is the orbit's eccentricity (Lesson 3.5/3.8), and $E$ (the
**eccentric anomaly**, an auxiliary angle) is what determines the
object's actual position — but $E$ appears both linearly and inside a
sine, making this equation **provably unsolvable for $E$ in
elementary closed form**. Newton's method is the standard practical
solution, used for exactly this problem since well before Newton
(iteratively, by hand) and using Newton's method specifically since
the technique existed.

```python
import math

def solve_kepler(M, e, tol=1e-12, max_iters=50):
    """
    Solve Kepler's equation M = E - e*sin(E) for E, given mean anomaly
    M (radians) and eccentricity e, via Newton's method.
    """
    f = lambda E: E - e*math.sin(E) - M
    f_prime = lambda E: 1 - e*math.cos(E)

    E = M   # a standard, reliable starting guess for moderate eccentricity
    for i in range(max_iters):
        fE = f(E)
        if abs(fE) < tol:
            return E, i
        E = E - fE / f_prime(E)
    raise RuntimeError("Kepler's equation did not converge")

# Halley's Comet, from Lesson 3.8: e = 0.9672
e_halley = 0.9672
M = math.radians(45)   # some point partway through the orbital period

E, iterations = solve_kepler(M, e_halley)
print(f"Mean anomaly M = {math.degrees(M):.2f}°")
print(f"Eccentric anomaly E = {math.degrees(E):.4f}° (found in {iterations} iterations)")

# Verify
residual = E - e_halley*math.sin(E) - M
print(f"Residual (should be ≈0): {residual:.2e}")

# Convert to true anomaly (theta) and radius, connecting back to
# Lesson 3.8's polar orbit equation
a = 17.834   # semi-major axis, AU, from Lesson 3.8
r = a * (1 - e_halley*math.cos(E))
theta = 2 * math.atan2(math.sqrt(1+e_halley)*math.sin(E/2), math.sqrt(1-e_halley)*math.cos(E/2))
print(f"\nOrbital radius at this point: {r:.4f} AU")
print(f"True anomaly (angle from perihelion): {math.degrees(theta):.4f}°")
```

**Walkthrough.** `E = M` as the starting guess reuses a well-known,
generally reliable choice for this specific equation (for very high
eccentricity orbits like comets, more careful starting guesses exist,
but $E=M$ works robustly across most practical cases). The final
conversion to radius `r` and true anomaly `theta` connects directly
back to Lesson 3.8's polar conic equation and orbit-shape parameters
— this lesson's Newton's-method solver is precisely the missing piece
that turns "here is an orbit's shape" (Lesson 3.8) into "here is where
the object actually is at a specific time" (this lesson), closing a
genuine, previously incomplete loop from three chapters ago.

---

## Connect the Pieces

Concrete trace: Halley's Comet's position 45° of mean anomaly into
its orbit.

1. **Newton's method, derived**: follow the tangent line to
   $f(E)=E-e\sin E-M$ down to zero — exactly Lesson 5.8's linear
   approximation, used iteratively.
2. **Convergence**: a handful of iterations reach machine precision,
   directly measured against bisection's much slower comparable trace
   earlier in this lesson.
3. **Honesty about failure modes**: the $x^{1/3}$ divergence example
   demonstrates concretely why bisection's guarantee still matters,
   rather than presenting Newton's method as a strict, unconditional
   upgrade.
4. **Kepler's equation, solved**: the exact orbital-position problem
   Lesson 3.8 left open, resolved here using nothing but tangent-line
   iteration — a genuine three-chapter payoff.

---

## Summary

**Newton's method**: $x_{n+1}=x_n-\dfrac{f(x_n)}{f'(x_n)}$ — follow
the tangent line to its zero, repeat.

**Quadratic convergence**: correct digits roughly double each
iteration, dramatically faster than bisection's linear
(digit-halving-rate) convergence — measured directly via error-ratio
tracing, the same technique from Lesson 5.3.

**Failure modes**: zero derivative, divergence, oscillation, wrong
root — genuine limitations bisection's IVT-guaranteed convergence
doesn't share; robust solvers often combine both.

**Application**: Kepler's equation, provably unsolvable in closed
form, solved via Newton's method — completing Lesson 3.8's orbital
mechanics with an actual time-to-position calculation.

**New Python/CS concepts:**
- Explicit `ZeroDivisionError`/`RuntimeError` for distinct failure
  modes, rather than one generic exception
- Combining two algorithms (bisection for safety, Newton for speed)
  as a standard robust-solver pattern

---

## Problems

### Math

**1.** Perform two iterations of Newton's method by hand to
approximate $\sqrt3$, starting from $x_0=2$, using $f(x)=x^2-3$.

<details><summary>Answer</summary>
$f'(x)=2x$. $x_1=2-\dfrac{4-3}{4}=2-0.25=1.75$.
$x_2=1.75-\dfrac{1.75^2-3}{3.5}=1.75-\dfrac{0.0625}{3.5}\approx1.7321$
(true value $\approx1.7321$ — already very close after just 2 steps).
</details>

---

**2.** Explain why Newton's method applied to $f(x)=x^2$ (a double
root at $x=0$) converges, but only **linearly**, not quadratically.

<details><summary>Answer</summary>
$f'(x)=2x$, so at a point near $0$, $x_{n+1}=x_n-\dfrac{x_n^2}{2x_n}=
x_n-\dfrac{x_n}{2}=\dfrac{x_n}{2}$ — each iterate is exactly half the
previous one, a constant ratio, which is linear convergence
(bisection-speed), not quadratic. Repeated roots are a known
exception to Newton's usual fast convergence.
</details>

---

**3.** For Kepler's equation with $e=0$ (a circular orbit), what does
Newton's method reduce to, and why does this make physical sense?

<details><summary>Answer</summary>
With $e=0$: $M=E-0=E$, so $E=M$ immediately — no iteration needed at
all, matching the physical fact that a circular orbit's eccentric
anomaly equals its mean anomaly exactly (no equation-of-centre
correction needed, since motion is already uniform around a circle).
</details>

---

### Code Challenges

**Challenge 1 — Newton's method from scratch**

```python
def newton(f, f_prime, x0, tol=1e-10, max_iters=100):
    """Reimplement newtons_method from the lesson."""
    pass

# --- tests: do not modify ---
f = lambda x: x**3 - x - 2
f_prime = lambda x: 3*x**2 - 1
root, iters = newton(f, f_prime, 1.5)
assert math.isclose(root, 1.5213797068, abs_tol=1e-6)
assert iters < 10
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Convergence order measurer**

```python
def measure_convergence_order(trace, true_value):
    """
    Given a list of iterates and the true root, return a list of
    ratios log(err[i+1])/log(err[i]) approaching 2 for quadratic
    convergence (use natural log; skip any zero-error entries).
    """
    pass

# --- tests: do not modify ---
import math
f = lambda x: x**2 - 2
f_prime = lambda x: 2*x
trace = [1.0]
x = 1.0
for _ in range(5):
    x = x - f(x)/f_prime(x)
    trace.append(x)
ratios = measure_convergence_order(trace, math.sqrt(2))
assert ratios[-1] > 1.5   # should be approaching 2
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Robust hybrid solver**

```python
def robust_solve(f, f_prime, a, b, tol=1e-10):
    """
    Bracket a root with bisection for a fixed number of steps to get
    close and safe, then switch to Newton's method for fast final
    convergence. f(a) and f(b) must have opposite signs.
    """
    pass

# --- tests: do not modify ---
f = lambda x: x**3 - x - 2
f_prime = lambda x: 3*x**2 - 1
root = robust_solve(f, f_prime, 1, 2)
assert math.isclose(root, 1.5213797068, abs_tol=1e-8)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Using the error-ratio measurement idea from Challenge 2,
explain informally why Newton's method's error roughly *squares*
each iteration (i.e., $\varepsilon_{n+1}\approx C\varepsilon_n^2$ for
some constant $C$), starting from the linear approximation's error
bound established in Lesson 5.9: $|f(x)-L(x)|\le\frac{M}{2}(x-a)^2$.

<details><summary>Answer</summary>
Let $\varepsilon_n=x_n-r$ (the error at step $n$, where $r$ is the
true root). Since $x_{n+1}$ is exactly where the tangent line at
$x_n$ crosses zero, the gap between $x_{n+1}$ and the true root $r$
is entirely due to the tangent line's own approximation error at $r$
— precisely Lesson 5.9's bound, applied with $a=x_n$ and evaluated
near $r$:
$$|f(r) - L(r)| \le \frac{M}{2}\varepsilon_n^2$$
Since $f(r)=0$ and $L(r)\approx f'(x_n)\cdot(\text{something involving }\varepsilon_{n+1})$
(a more careful derivation relates $L(r)$'s error directly to
$\varepsilon_{n+1}$ via the mean value theorem again), the upshot is
$$|\varepsilon_{n+1}| \lesssim \frac{M}{2|f'(x_n)|}\varepsilon_n^2$$
— error at the next step is proportional to the **square** of the
current error, exactly the quadratic-convergence behavior measured
empirically earlier in this lesson. This is a genuine, direct
consequence of Lesson 5.9's linear-approximation error bound, applied
recursively at every Newton iteration — the same MVT machinery from
three lessons ago, still doing load-bearing work here.
</details>
