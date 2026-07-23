# Stage 5, Lesson 5.9 — The Mean Value Theorem and Its Consequences
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This lesson Is About

Lesson 5.8's error-propagation formula, $\Delta f\approx
f'(x)\Delta x$, was justified only informally — "the tangent line is
a good local approximation." The **Mean Value Theorem (MVT)** supplies
the missing rigor: it guarantees that the *average* rate of change of
$f$ over an interval is achieved *exactly* by the *instantaneous*
rate of change at some specific point inside that interval — not
approximately, exactly. This single fact, almost deceptively simple
to state, is the hidden engine behind several results this curriculum
needs soon: the test for whether a function is increasing or
decreasing (Lesson 5.10), the guarantee that two functions with the
same derivative differ only by a constant (the fact Lesson 5.14's
Fundamental Theorem of Calculus is built on), and a rigorous bound on
linear approximation's error, replacing Lesson 5.8's "trust the
picture" justification with an actual proof.

---

## Historical Context

The special case where $f(a)=f(b)$ — guaranteeing a point where the
tangent is exactly horizontal — was proved by Michel Rolle in 1691,
somewhat ironically given that Rolle was, at the time, one of
calculus's most vocal public critics (he considered it a "collection
of ingenious fallacies," a stance he later softened). The general
Mean Value Theorem, without requiring $f(a)=f(b)$, was proved by
Joseph-Louis Lagrange in the 1790s, built directly on Rolle's earlier,
more restricted result via the clever function-construction technique
shown below — a genuine case of a critic's own theorem becoming
essential machinery for the field he doubted.

---

## What You Need To Know First

- **Continuity, IVT** — Lesson 5.2.
- **The derivative, differentiability** — Lesson 5.3.
- **Linear approximation, informally justified** — Lesson 5.8, whose
  error bound this lesson makes rigorous.

---

## The Lesson

### Rolle's Theorem

If $f$ is continuous on $[a,b]$, differentiable on $(a,b)$, and
$f(a)=f(b)$, then there exists at least one $c\in(a,b)$ with
$f'(c)=0$.

**Proof sketch**: a continuous function on a closed interval attains
both a maximum and minimum somewhere on that interval (the **Extreme
Value Theorem** — stated here without proof, a genuine companion
result to IVT from Lesson 5.2, both consequences of continuity on a
closed interval). If $f$ is constant, every point works trivially. If
not, since $f(a)=f(b)$, at least one of the max/min must occur at
some **interior** point $c\in(a,b)$ (not at an endpoint) — and at an
interior maximum or minimum of a differentiable function, the tangent
line must be exactly horizontal (approaching from either side, the
slope can't be both positive, since that would mean the function keeps
rising past the supposed max, and can't be both negative for the
symmetric reason) — so $f'(c)=0$.

```python
import sympy as sp

x = sp.symbols('x')
f = x**3 - 3*x**2 + 2*x   # f(0)=0, f(1)=0: check Rolle's applies on [0,1]

print(f"f(0) = {f.subs(x,0)}, f(1) = {f.subs(x,1)}")
critical_points = sp.solve(sp.diff(f, x), x)
print(f"Points where f'=0: {critical_points}")
in_interval = [c for c in critical_points if 0 < c < 1]
print(f"Point(s) in (0,1): {in_interval}")
```

---

### The Mean Value Theorem

If $f$ is continuous on $[a,b]$ and differentiable on $(a,b)$, there
exists at least one $c\in(a,b)$ with:

$$f'(c) = \frac{f(b)-f(a)}{b-a}$$

**Geometric meaning**: the right side is the **secant line's slope**
(average rate of change over $[a,b]$) — MVT guarantees some point
where the **tangent line is exactly parallel** to that secant.

**Proof**, via Rolle's theorem — construct an auxiliary function that
measures the *gap* between $f$ and the secant line:

$$g(x) = f(x) - \left[f(a) + \frac{f(b)-f(a)}{b-a}(x-a)\right]$$

$g$ is continuous and differentiable wherever $f$ is (it's just $f$
minus a line). Check $g(a)=f(a)-f(a)=0$ and
$g(b)=f(b)-[f(a)+(f(b)-f(a))]=f(b)-f(b)=0$ — so $g(a)=g(b)=0$, exactly
Rolle's hypothesis. By Rolle's theorem, some $c\in(a,b)$ has $g'(c)=0$:

$$g'(x) = f'(x) - \frac{f(b)-f(a)}{b-a} \quad\Longrightarrow\quad f'(c) = \frac{f(b)-f(a)}{b-a} \qquad\blacksquare$$

```python
import sympy as sp

x = sp.symbols('x')
f = x**3 - 2*x
a, b = 0, 2

avg_rate = (f.subs(x,b) - f.subs(x,a)) / (b-a)
print(f"Average rate of change on [{a},{b}]: {avg_rate}")

f_prime = sp.diff(f, x)
solutions = sp.solve(sp.Eq(f_prime, avg_rate), x)
in_interval = [s for s in solutions if a < s < b]
print(f"f'(x) = {f_prime}")
print(f"c where f'(c) = average rate: {in_interval}")
```

---

### Consequence 1: Zero Derivative Means Constant

If $f'(x)=0$ for every $x$ in an interval, $f$ is **constant** on
that interval.

**Proof**: pick any two points $x_1<x_2$ in the interval. By MVT,
some $c$ between them has $f'(c)=\dfrac{f(x_2)-f(x_1)}{x_2-x_1}$.
Since $f'(c)=0$ everywhere (given), $f(x_2)-f(x_1)=0$, i.e.
$f(x_1)=f(x_2)$ — true for *any* two points, so $f$ never changes
value.

### Consequence 2: Same Derivative Means Differ by a Constant

If $f'(x)=g'(x)$ for every $x$ on an interval, then $f(x)-g(x)=C$
(some constant) throughout.

**Proof**: let $h(x)=f(x)-g(x)$. Then
$h'(x)=f'(x)-g'(x)=0$ everywhere (given). By Consequence 1, $h$ is
constant. $\blacksquare$

**This is precisely the fact Lesson 5.14's Fundamental Theorem of
Calculus needs**: it guarantees that if you find *any one*
antiderivative of a function, every other antiderivative differs from
it by only a constant — nothing more exotic can happen, a genuinely
load-bearing fact for the "+C" you'll see attached to every indefinite
integral from Stage 5B onward.

```python
import sympy as sp

x, C = sp.symbols('x C')
f = sp.sin(x)**2
g = -sp.cos(x)**2   # different-looking function

diff_f = sp.diff(f, x)
diff_g = sp.diff(g, x)
print(f"f'(x) = {sp.simplify(diff_f)}")
print(f"g'(x) = {sp.simplify(diff_g)}")
print(f"Same derivative: {sp.simplify(diff_f - diff_g) == 0}")

difference = sp.simplify(f - g)
print(f"\nf(x) - g(x) = {difference}  (should be a constant)")
```

---

### Consequence 3: The Increasing/Decreasing Test (Preview of Lesson 5.10)

If $f'(x)>0$ throughout an interval, $f$ is **increasing** there; if
$f'(x)<0$, $f$ is **decreasing**. This follows directly from MVT:
for any $x_1<x_2$ in the interval, some $c$ gives
$f(x_2)-f(x_1)=f'(c)(x_2-x_1)$. If $f'(c)>0$ and $x_2-x_1>0$, then
$f(x_2)-f(x_1)>0$ — $f$ genuinely increased. Lesson 5.10 builds a full
curve-sketching toolkit on top of this single observation.

---

### Rigorous Error Bound for Linear Approximation

Lesson 5.8's linear approximation $L(x)=f(a)+f'(a)(x-a)$ had its
error justified only by "the picture looks close." MVT provides an
actual bound. Apply MVT to $f'$ itself, treated as a function on
$[a,x]$: if $|f''(t)|\le M$ for all $t$ between $a$ and $x$ (some
known bound on the second derivative — Lesson 5.7's higher-order
derivatives, doing real work here), then the linear approximation's
error satisfies:

$$|f(x)-L(x)| \le \frac{M}{2}(x-a)^2$$

(A full derivation needs Cauchy's generalized MVT and is deferred;
this lesson states the bound, which is the exact $n=1$ case of the
**Taylor remainder** Lesson 5.11 develops in full generality, and
verifies it numerically here.)

```python
import sympy as sp
import math

x = sp.symbols('x')
f = sp.sqrt(x)
a = 4
f_double_prime = sp.diff(f, x, 2)
print(f"f''(x) = {f_double_prime}")

# Bound M on [4, 4.1]: f'' is decreasing (in magnitude) on this range,
# so its max magnitude is at x=4
M = abs(float(f_double_prime.subs(x, 4)))
print(f"M (bound on |f''|) ≈ {M:.6f}")

x_target = 4.1
error_bound = M/2 * (x_target - a)**2
print(f"Error bound: {error_bound:.6f}")

L = float(f.subs(x,a)) + float(sp.diff(f,x).subs(x,a))*(x_target-a)
actual_error = abs(float(f.subs(x, x_target)) - L)
print(f"Actual error: {actual_error:.6f}")
print(f"Bound holds: {actual_error <= error_bound}")
```

Output:

```
f''(x) = -1/(4*x**(3/2))
M (bound on |f''|) ≈ 0.031250
Error bound: 0.000156
Actual error: 0.000154
```

The actual error (0.000154, matching Lesson 5.8's opening example
exactly) falls within the MVT-derived bound (0.000156) — the linear
approximation's error is now genuinely *provable* to be small, not
just observed to be small in one example.

---

### Manufacturing/Physics Application: Average vs. Instantaneous Feed Rate

A CNC toolpath segment's **average** feed rate over a move is
$\dfrac{\text{distance}}{\text{time}}$ — but MVT guarantees the tool's
**instantaneous** speed genuinely equaled that average at some point
during the move (assuming smooth, differentiable motion — which a
properly jerk-limited profile, Lesson 5.7, provides). This matters
directly for machine safety limits: if a controller only logs average
feed rate per segment, MVT guarantees that average was *actually
achieved* instantaneously somewhere, not just a mathematical fiction —
meaning a maximum-feed-rate safety limit genuinely was reached (at
least momentarily) whenever the logged average is close to that
limit, even though the log itself never recorded an instantaneous
value.

```python
import sympy as sp

t = sp.symbols('t')
# A position profile over a 2-second move, total distance covered = position(2)-position(0)
position = 5*t**2 - t**3/3

t0, t1 = 0, 2
avg_speed = (position.subs(t,t1) - position.subs(t,t0)) / (t1-t0)
print(f"Average feed rate: {avg_speed} units/s")

velocity = sp.diff(position, t)
solutions = sp.solve(sp.Eq(velocity, avg_speed), t)
in_range = [s for s in solutions if t0 < s < t1]
print(f"Velocity function: {velocity}")
print(f"Time(s) where instantaneous speed = average: {in_range}")
```

**Walkthrough.** This section introduces no new syntax — `sp.solve`
solving `velocity = avg_speed` for `t` is a direct, mechanical
application of MVT's own construction: find the specific $c$ (here,
a specific time $t$) where the instantaneous rate matches the
computed average, exactly the same calculation performed for the
abstract cubic example earlier in this lesson, now applied to a
physically meaningful motion profile.

---

## Connect the Pieces

Concrete trace: bounding the error of $\sqrt{4.1}$'s linear
approximation from Lesson 5.8.

1. **MVT itself**: guarantees some $c\in(4,4.1)$ where
   $f'(c)=\dfrac{f(4.1)-f(4)}{0.1}$ exactly.
2. **Applied to $f'$**: a second application of the same idea (this
   time to the derivative, not the original function) produces the
   $\frac{M}{2}(x-a)^2$ error bound.
3. **Verification**: the actual Lesson 5.8 error (0.000154) sits
   safely within the computed bound (0.000156) — the approximation's
   quality is now provable, not just observed.
4. **Forward to Lesson 5.14**: Consequence 2 (same derivative implies
   differ by a constant) is the exact fact that makes "the"
   antiderivative meaningful up to a constant — load-bearing
   machinery for the Fundamental Theorem of Calculus, still two
   chapters away.

---

## Summary

**Rolle's Theorem**: $f(a)=f(b)$ guarantees a horizontal tangent
somewhere in between.

**MVT**: guarantees a point where the instantaneous rate equals the
average rate over an interval — proved by applying Rolle's theorem to
the gap between $f$ and its secant line.

**Consequences**: zero derivative $\Rightarrow$ constant function;
equal derivatives $\Rightarrow$ differ by a constant (needed for
Lesson 5.14); positive/negative derivative $\Rightarrow$
increasing/decreasing (needed for Lesson 5.10).

**Rigorous error bound**: MVT applied to $f'$ gives
$|f(x)-L(x)|\le\frac{M}{2}(x-a)^2$ — replaces Lesson 5.8's informal
justification with an actual, checkable bound.

**New Python/CS concepts:**
- `sp.solve(sp.Eq(...), var)` used to find MVT's guaranteed point $c$
  explicitly, rather than just asserting it exists

---

## Problems

### Math

**1.** Verify Rolle's theorem applies to $f(x)=x^2-4x+3$ on $[1,3]$,
and find $c$.

<details><summary>Answer</summary>
$f(1)=0$, $f(3)=0$: equal, Rolle's applies. $f'(x)=2x-4=0
\Rightarrow x=2\in(1,3)$. $c=2$.
</details>

---

**2.** Find $c$ guaranteed by MVT for $f(x)=x^3$ on $[0,2]$.

<details><summary>Answer</summary>
Average rate: $(8-0)/2=4$. $f'(x)=3x^2=4 \Rightarrow x^2=4/3
\Rightarrow x=2/\sqrt3\approx1.155\in(0,2)$.
</details>

---

**3.** Explain why $f(x)=|x|$ does **not** satisfy MVT's hypotheses
on $[-1,1]$, and why this matters (does a valid $c$ still happen to
exist anyway, or does the theorem's guarantee simply not apply?).

<details><summary>Answer</summary>
$f$ isn't differentiable at $x=0$ (Lesson 5.3's corner-point
example) — MVT's hypothesis (differentiable on the *open* interval)
fails, so the theorem simply doesn't guarantee anything here. (In
this specific case a $c$ with matching slope doesn't actually exist:
average rate is $(1-1)/2=0$, but $f'(x)=\pm1$ everywhere it's
defined, never $0$ — confirming the hypothesis failure isn't just a
technicality; the conclusion genuinely fails too.)
</details>

---

### Code Challenges

**Challenge 1 — MVT point finder**

```python
import sympy as sp

def find_mvt_point(f_expr, var, a, b):
    """Return all c in (a,b) satisfying MVT's conclusion."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
points = find_mvt_point(x**3, x, 0, 2)
assert len(points) >= 1
assert all(0 < p < 2 for p in points)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Constant-difference verifier**

```python
import sympy as sp

def differ_by_constant(f_expr, g_expr, var):
    """
    Return True if f and g have the same derivative (hence differ
    by a constant), False otherwise.
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
assert differ_by_constant(sp.sin(x)**2, -sp.cos(x)**2, x)
assert not differ_by_constant(x**2, x**3, x)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Linear approximation error bound**

```python
import sympy as sp

def error_bound(f_expr, var, a, x_target, M_interval_samples=50):
    """
    Estimate M as the max |f''| over [a, x_target] (sampled), then
    return the MVT-derived error bound (M/2)(x_target-a)^2.
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
bound = error_bound(sp.sqrt(x), x, 4, 4.1)
actual = abs(math.sqrt(4.1) - (2 + 0.25*0.1))
assert actual <= bound
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Use the Mean Value Theorem to prove the inequality
$|\sin a - \sin b| \le |a-b|$ for all real $a,b$ (a **Lipschitz
bound** — a genuinely useful fact for numerical stability, since it
guarantees $\sin$ never amplifies an input difference).

<details><summary>Answer</summary>
By MVT applied to $f(x)=\sin x$ on the interval between $a$ and $b$
(assume $a<b$ without loss of generality): some $c$ between them has
$$\sin b - \sin a = \cos(c)\cdot(b-a)$$
Take absolute values: $|\sin b-\sin a| = |\cos c|\cdot|b-a|$. Since
$|\cos c|\le1$ always:
$$|\sin b - \sin a| \le |b-a| \qquad\blacksquare$$
This is a direct, practical consequence: no matter how far apart two
inputs to $\sin$ are, their outputs are never farther apart than the
inputs themselves were — a "non-amplifying" property that matters
directly for numerical stability analysis (Lesson 4.6's partial-
pivoting concerns, and error propagation generally, both care about
exactly this kind of bound on how much a function can stretch input
differences).
</details>
