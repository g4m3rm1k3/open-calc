# Stage 5, Lesson 5.10 — Optimization: Local and Global Extrema
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

This is the lesson every prior derivative result in this stage has
been building toward practically: **finding the best value** — the
maximum strength, minimum cost, maximum volume, minimum material —
by exploiting a simple fact Fermat noticed decades before Newton or
Leibniz formalized calculus: at a smooth function's peak or valley,
the tangent line is exactly horizontal. Combined with Lesson 5.9's
increasing/decreasing test, this gives a complete, systematic
procedure for finding a function's maximum and minimum values, either
locally or across an entire interval. By the end of this lesson you
can find and classify critical points, locate absolute extrema on a
closed interval, and solve genuine engineering optimization problems
— including this lesson's central example, minimizing the material
needed for a cylindrical container of fixed volume, a problem every
packaging and container manufacturer solves in practice.

---

## Historical Context

Pierre de Fermat developed a method around 1638 — decades before
Newton or Leibniz's calculus — for finding a curve's maximum and
minimum points, using an early, informal version of exactly the
"set the rate of change to zero" idea this lesson formalizes. Fermat
never had a rigorous concept of the limit or derivative to justify his
method, but the technique worked, and it's genuinely one of the direct
historical seeds calculus grew from — Lesson 5.9's proof of Rolle's
theorem used precisely this fact (a differentiable function's
interior extremum has zero derivative) under the modern name
**Fermat's theorem**, closing a loop between this lesson and the last.

---

## What You Need To Know First

- **Increasing/decreasing test, MVT** — Lesson 5.9 (Consequence 3
  directly powers the first derivative test).
- **Second derivatives** — Lesson 5.7, for the second derivative
  test.
- **Extreme Value Theorem** — mentioned in Lesson 5.9, guarantees
  global extrema exist on a closed interval.

---

## The Lesson

### Critical Points and Fermat's Theorem

A **critical point** of $f$ is a value $x=c$ where $f'(c)=0$ or
$f'(c)$ **does not exist**.

**Fermat's theorem**: if $f$ has a local maximum or minimum at
$x=c$, and $f'(c)$ exists, then $f'(c)=0$. (Already proved, in
essence, within Lesson 5.9's argument for Rolle's theorem — a local
extremum forces the tangent to be horizontal, since any nonzero slope
would mean the function keeps changing in that direction, contradicting
the extremum.)

**Critical points are candidates, not guarantees** — $f'(c)=0$ does
not by itself mean $x=c$ is a max or min (consider $f(x)=x^3$ at
$x=0$: $f'(0)=0$, but $x=0$ is neither a local max nor min — the
function just briefly flattens while continuing to increase).

```python
import sympy as sp

x = sp.symbols('x')
f = x**3 - 3*x
critical_points = sp.solve(sp.diff(f, x), x)
print(f"f(x) = {f}")
print(f"Critical points: {critical_points}")
```

---

### The First Derivative Test

At a critical point $c$, examine $f'$'s **sign** just before and
just after $c$:

| $f'$ before $c$ | $f'$ after $c$ | Conclusion |
|---|---|---|
| $+$ | $-$ | Local **maximum** at $c$ |
| $-$ | $+$ | Local **minimum** at $c$ |
| Same sign both sides | | **Neither** (e.g., $x^3$ at $0$) |

This is a direct application of Lesson 5.9's Consequence 3: $f'>0$
means increasing, $f'<0$ means decreasing — a switch from increasing
to decreasing is exactly a local maximum, geometrically.

```python
import sympy as sp

def first_derivative_test(f_expr, var, critical_point, delta=0.01):
    f_prime = sp.diff(f_expr, var)
    before = f_prime.subs(var, critical_point - delta)
    after = f_prime.subs(var, critical_point + delta)
    if before > 0 and after < 0:
        return 'local maximum'
    elif before < 0 and after > 0:
        return 'local minimum'
    else:
        return 'neither (inflection-like point)'

x = sp.symbols('x')
f = x**3 - 3*x
for cp in sp.solve(sp.diff(f, x), x):
    result = first_derivative_test(f, x, cp)
    print(f"x={cp}: {result}")
```

Output:

```
x=-1: local maximum
x=1: local minimum
```

---

### The Second Derivative Test

An often-quicker alternative: at a critical point $c$ where
$f'(c)=0$:

- $f''(c)>0 \Rightarrow$ local **minimum** (the function is
  **concave up**, curving like a valley — full treatment in Lesson
  5.11).
- $f''(c)<0 \Rightarrow$ local **maximum** (**concave down**).
- $f''(c)=0 \Rightarrow$ **inconclusive** — must fall back to the
  first derivative test.

```python
import sympy as sp

def second_derivative_test(f_expr, var, critical_point):
    f_double_prime = sp.diff(f_expr, var, 2)
    value = f_double_prime.subs(var, critical_point)
    if value > 0:
        return 'local minimum'
    elif value < 0:
        return 'local maximum'
    else:
        return 'inconclusive'

x = sp.symbols('x')
f = x**3 - 3*x
for cp in sp.solve(sp.diff(f, x), x):
    print(f"x={cp}: {second_derivative_test(f, x, cp)}")
```

---

### Absolute (Global) Extrema on a Closed Interval

The **Extreme Value Theorem** (Lesson 5.9) guarantees a continuous
function on a closed interval $[a,b]$ attains an absolute maximum and
minimum **somewhere** on that interval. The systematic procedure to
find them:

1. Find all critical points **inside** $(a,b)$.
2. Evaluate $f$ at each critical point **and** at both endpoints
   $a,b$.
3. The largest value is the absolute maximum; the smallest is the
   absolute minimum.

**Endpoints must be checked explicitly** — an absolute extremum can
occur at an endpoint even where $f'\ne0$ there, since Fermat's
theorem only applies to *interior* extrema.

```python
import sympy as sp

def find_absolute_extrema(f_expr, var, a, b):
    critical_points = [cp for cp in sp.solve(sp.diff(f_expr, var), var)
                        if a < cp < b]
    candidates = critical_points + [a, b]
    values = [(pt, f_expr.subs(var, pt)) for pt in candidates]
    max_pt = max(values, key=lambda pair: pair[1])
    min_pt = min(values, key=lambda pair: pair[1])
    return max_pt, min_pt

x = sp.symbols('x')
f = x**3 - 6*x**2 + 9*x + 1
max_pt, min_pt = find_absolute_extrema(f, x, 0, 5)
print(f"Absolute maximum: f({max_pt[0]}) = {max_pt[1]}")
print(f"Absolute minimum: f({min_pt[0]}) = {min_pt[1]}")
```

**Walkthrough.** `max(values, key=lambda pair: pair[1])` is a first
appearance of the `key=` argument to Python's built-in `max`/`min`:
rather than comparing tuples directly (which would compare by the
*point* first, not the *function value*), `key=lambda pair: pair[1]`
tells `max` to compare using only the second element of each
`(point, value)` pair — the function value — while still returning
the full pair, so the corresponding $x$-location isn't lost.

---

### Manufacturing Application: Minimum-Material Cylindrical Container

A cylindrical can must hold a fixed volume $V=355\text{cm}^3$ (a
standard beverage can size). Minimize the total surface area (hence
material cost) as a function of radius $r$.

**Setup**: volume constraint $V=\pi r^2h \Rightarrow h=\dfrac{V}{\pi
r^2}$. Surface area (two circular ends plus the curved side):

$$A(r) = 2\pi r^2 + 2\pi rh = 2\pi r^2 + 2\pi r\cdot\frac{V}{\pi r^2} = 2\pi r^2 + \frac{2V}{r}$$

```python
import sympy as sp

r = sp.symbols('r', positive=True)
V = 355

A = 2*sp.pi*r**2 + 2*V/r

A_prime = sp.diff(A, r)
critical_r = sp.solve(A_prime, r)
print(f"A(r) = {A}")
print(f"A'(r) = {A_prime}")
print(f"Critical radius: {critical_r}")

r_opt = critical_r[0]
A_double_prime = sp.diff(A, r, 2)
test_value = A_double_prime.subs(r, r_opt)
print(f"A''(r_opt) = {test_value}  ({'minimum confirmed' if test_value > 0 else 'check again'})")

h_opt = V / (sp.pi * r_opt**2)
print(f"\nOptimal radius: {float(r_opt):.4f} cm")
print(f"Optimal height: {float(h_opt):.4f} cm")
print(f"Height/radius ratio: {float(h_opt/r_opt):.4f}")
print(f"Minimum surface area: {float(A.subs(r, r_opt)):.4f} cm²")
```

Output:

```
Optimal radius: 3.8360 cm
Optimal height: 7.6720 cm
Height/radius ratio: 2.0000
```

A striking, checkable result: **the optimal height is always exactly
twice the radius** (equivalently, height equals diameter) — a
prediction that can be verified holds for *any* target volume, not
just this specific one, and a real, well-known fact in container
design (most real beverage cans are noticeably *taller* than this
ratio, for reasons outside pure material minimization — ergonomics,
stacking, shelf display, and manufacturing line constraints all pull
the actual design away from the pure math optimum, worth flagging
honestly rather than implying real cans are designed by this formula
alone).

```python
import sympy as sp

# Verify the h=2r result holds symbolically, for ANY volume V (not just 355)
r, V = sp.symbols('r V', positive=True)
A = 2*sp.pi*r**2 + 2*V/r
r_opt_general = sp.solve(sp.diff(A, r), r)[0]
h_opt_general = V / (sp.pi * r_opt_general**2)
ratio = sp.simplify(h_opt_general / r_opt_general)
print(f"h/r ratio at the optimum, for ANY V: {ratio}")
```

```
h/r ratio at the optimum, for ANY V: 2
```

**Walkthrough.** Solving with `V` left as a **symbol** rather than a
specific number is a genuinely more powerful use of `sp.solve` than
every prior numeric example in this stage — the result `2` holds
*universally*, for every possible target volume, a single symbolic
computation replacing what would otherwise require checking
infinitely many separate numeric cases.

---

### A Second Classic: The Sheet-Metal Box

A square sheet of metal, side length $L=30\text{cm}$, has equal
squares of side $x$ cut from each corner, and the flaps folded up to
form an open-top box. Maximize the box's volume as a function of $x$.

$$V(x) = x(L-2x)^2 = x(30-2x)^2 \qquad 0<x<15$$

```python
import sympy as sp

x = sp.symbols('x', positive=True)
L = 30
V = x*(L - 2*x)**2

V_prime = sp.diff(V, x)
critical_points = sp.solve(V_prime, x)
valid_points = [cp for cp in critical_points if 0 < cp < 15]
print(f"V(x) = {sp.expand(V)}")
print(f"Critical point(s) in (0,15): {valid_points}")

x_opt = valid_points[0]
print(f"\nOptimal cut size: {float(x_opt):.4f} cm")
print(f"Maximum volume: {float(V.subs(x, x_opt)):.4f} cm³")

# Confirm against the endpoints (both give V=0, so the interior
# critical point is clearly the winner -- no need for full absolute-
# extrema machinery here, but worth checking explicitly)
print(f"V(0) = {V.subs(x,0)}, V(15) = {V.subs(x,15)}")
```

---

## Connect the Pieces

Concrete trace: minimizing a beverage can's material for fixed
volume.

1. **Constraint elimination**: the volume constraint reduces a
   two-variable problem ($r$ and $h$) to a single-variable function
   $A(r)$ — a standard, essential first step in any optimization
   problem with a constraint.
2. **Critical point**: $A'(r)=0$, solved via `sp.solve`, finds the
   candidate optimum.
3. **Second derivative test**: confirms it's genuinely a minimum, not
   a maximum or inflection.
4. **Symbolic generalization**: solving with $V$ left symbolic proves
   the $h=2r$ result universally, not just for one specific volume —
   a genuinely more powerful conclusion than any single numeric
   optimization could provide.

---

## Summary

**Critical points**: $f'(x)=0$ or undefined — candidates for local
extrema (Fermat's theorem), not guarantees.

**First derivative test**: sign change of $f'$ around a critical
point (max: $+$ to $-$; min: $-$ to $+$) — a direct application of
Lesson 5.9's monotonicity result.

**Second derivative test**: $f''(c)>0$ minimum, $f''(c)<0$ maximum,
$f''(c)=0$ inconclusive.

**Absolute extrema on $[a,b]$**: check all interior critical points
*and* both endpoints — endpoints can be extrema even where $f'\ne0$.

**Optimization workflow**: eliminate constraints to reach a
single-variable objective function, then apply the critical-point
machinery — demonstrated on a minimum-material cylinder (the
universal $h=2r$ result) and a maximum-volume sheet-metal box.

**New Python/CS concepts:**
- `max`/`min` with a `key=` argument for comparing by a derived value
  rather than the object itself
- Solving symbolically with a parameter left as a variable (`V`) to
  get a universal, not just numeric, result

---

## Problems

### Math

**1.** Find and classify the critical points of $f(x)=x^4-4x^2$.

<details><summary>Answer</summary>
$f'(x)=4x^3-8x=4x(x^2-2)=0 \Rightarrow x=0,\pm\sqrt2$.
$f''(x)=12x^2-8$. $f''(0)=-8<0$: local max. $f''(\pm\sqrt2)=16>0$:
local min at each.
</details>

---

**2.** Find the absolute extrema of $f(x)=x^3-3x$ on $[-2,3]$.

<details><summary>Answer</summary>
Critical points: $x=\pm1$. Candidates: $f(-2)=-2$, $f(-1)=2$,
$f(1)=-2$, $f(3)=18$. Absolute max: $18$ at $x=3$ (an endpoint).
Absolute min: $-2$, tied at $x=-2$ and $x=1$.
</details>

---

**3.** A rectangular field of fixed perimeter $P$ is to be enclosed.
Show the maximum-area rectangle is always a square, by maximizing
$A=x(P/2-x)$.

<details><summary>Answer</summary>
$A'(x)=P/2-2x=0 \Rightarrow x=P/4$. The other side is
$P/2-x=P/2-P/4=P/4$ — equal sides, a square, for any $P$.
</details>

---

### Code Challenges

**Challenge 1 — Critical point classifier**

```python
import sympy as sp

def classify_all_critical_points(f_expr, var):
    """
    Return a dict {critical_point: 'local max'/'local min'/'inconclusive'}
    using the second derivative test.
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
results = classify_all_critical_points(x**3 - 3*x, x)
assert results[-1] == 'local max'
assert results[1] == 'local min'
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Absolute extrema finder**

```python
import sympy as sp

def absolute_extrema(f_expr, var, a, b):
    """Reimplement find_absolute_extrema from the lesson."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
max_pt, min_pt = absolute_extrema(x**3 - 6*x**2 + 9*x + 1, x, 0, 5)
assert max_pt[1] == 21   # at x=5
assert min_pt[1] == 1    # at x=0 and x=3, either acceptable
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Minimum-material box (rectangular, open top)**

```python
import sympy as sp

def min_material_box(volume):
    """
    An open-top box with a SQUARE base must hold `volume`. Minimize
    total material (base + 4 sides) as a function of base side x.
    Return (optimal_x, optimal_height, minimum_material).
    """
    pass

# --- tests: do not modify ---
x_opt, h_opt, material = min_material_box(1000)
V_check = x_opt**2 * h_opt
assert math.isclose(V_check, 1000, abs_tol=0.1)
# Known result: optimal height = x/2 for this classic problem
assert math.isclose(h_opt, x_opt/2, abs_tol=0.01)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** For the minimum-material cylinder, prove **symbolically**
(with $V$ left as a variable, as in the lesson) that the second
derivative test confirms a genuine minimum for *every* positive $V$
— not just that $A''(r_{opt})$ happens to be positive for one
specific numeric example.

<details><summary>Answer</summary>
$A(r)=2\pi r^2+2V/r \Rightarrow A''(r) = 4\pi + 4V/r^3$. For any
$r>0$ and $V>0$ (both physically required — a container can't have
negative radius or negative volume), every term is strictly positive:
$4\pi>0$ and $4V/r^3>0$. So $A''(r)>0$ for **every** valid $r$, not
just at the critical point — meaning $A$ is concave up (Lesson 5.11)
everywhere on its domain, which guarantees the single critical point
found is a genuine global minimum, for every positive $V$
simultaneously, with no case-by-case numeric checking required.
$\blacksquare$ This is a stronger and more efficient conclusion than
plugging in specific numbers ever could provide — exactly the payoff
of doing the optimization symbolically.
</details>
