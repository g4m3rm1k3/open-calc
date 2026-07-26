# Stage 5, Lesson 5.16 — Curve Sketching: Concavity, Inflection, and the Full Picture
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 10's Extension problem used "concave up" without a formal
definition, leaning on intuition to justify why $A''(r)>0$ everywhere
guaranteed a genuine minimum. This lesson supplies that definition
precisely, introduces **inflection points** (where concavity itself
switches), and extends Lesson 8's linear approximation one step
further: a **quadratic approximation** that matches not just a
function's value and slope at a point, but its curvature too — the
natural next term after the linear one, using exactly the second
derivative concavity measures. By the end of this lesson you can
determine concavity and find inflection points precisely, justify the
second derivative test rigorously rather than by appeal to intuition,
build a quadratic approximation more accurate than Lesson 8's
linear one, and assemble every tool from this chapter — domain,
asymptotes, extrema, concavity — into a complete, systematic
curve-sketching procedure.

---

## What You Need To Know First

- **Second derivatives** — Lesson 7.
- **The second derivative test, used informally** — Lesson 10.
- **Linear approximation and its MVT-derived error bound** — Lessons
  5.8, 5.9.
- **Rational function asymptotes** — Lesson 1.5, needed for the full
  sketching procedure.

---

## The Lesson

### Concavity, Precisely

$f$ is **concave up** on an interval if $f'$ is **increasing** there
— equivalently (by Lesson 9's Consequence 3, applied to $f'$
itself), $f''(x)>0$ throughout. Geometrically: the curve lies *above*
every one of its tangent lines on that interval, curving like the
inside of a bowl.

$f$ is **concave down** if $f'$ is decreasing — $f''(x)<0$ — the
curve lies *below* its tangent lines, curving like the top of a dome.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-2, 2, 300)

fig, axes = plt.subplots(1, 2, figsize=(11, 5))
f_up = x**2
axes[0].plot(x, f_up, color='#2980b9', lw=2)
tangent_pt = 0.8
tangent_slope = 2*tangent_pt
tangent_line = f_up[np.argmin(np.abs(x-tangent_pt))] + tangent_slope*(x-tangent_pt)
axes[0].plot(x, tangent_line, color='#e74c3c', lw=1, linestyle='--')
axes[0].set_title("Concave up ($f''>0$): curve above tangent", fontsize=10)

f_down = -x**2
axes[1].plot(x, f_down, color='#2980b9', lw=2)
tangent_slope2 = -2*tangent_pt
tangent_line2 = f_down[np.argmin(np.abs(x-tangent_pt))] + tangent_slope2*(x-tangent_pt)
axes[1].plot(x, tangent_line2, color='#e74c3c', lw=1, linestyle='--')
axes[1].set_title("Concave down ($f''<0$): curve below tangent", fontsize=10)

plt.tight_layout()
plt.show()
```

**Justifying the second derivative test, rigorously.** Lesson 10
stated the rule (concave up at a critical point $\Rightarrow$ local
min) without full justification. Now it follows directly: at a
critical point $c$ with $f'(c)=0$, if $f''(c)>0$, then $f$ is concave
up near $c$ — the curve lies above its (horizontal, since $f'(c)=0$)
tangent line there, meaning $f(x)>f(c)$ for $x$ near $c$ on both
sides — precisely a local minimum.

---

### Inflection Points

An **inflection point** is a point where concavity **switches** —
from up to down or down to up. Candidates occur where $f''(x)=0$ or
is undefined, **but this is only a candidate**, exactly like critical
points in Lesson 10 — the concavity must actually **change sign**
across the point for it to be a genuine inflection (compare: $f(x)=x^4$
has $f''(0)=0$, but $f''(x)=12x^2\ge0$ everywhere — never negative —
so concavity never actually switches, and $x=0$ is not an inflection
point despite satisfying the necessary condition).

```python
import sympy as sp

def find_inflection_points(f_expr, var, tol=1e-9):
    f_double_prime = sp.diff(f_expr, var, 2)
    candidates = sp.solve(f_double_prime, var)
    inflections = []
    for c in candidates:
        before = f_double_prime.subs(var, c - 0.01)
        after = f_double_prime.subs(var, c + 0.01)
        if before * after < 0:   # genuine sign change
            inflections.append(c)
    return inflections

x = sp.symbols('x')
f1 = x**3 - 3*x
print(f"x³-3x inflection points: {find_inflection_points(f1, x)}")

f2 = x**4
print(f"x⁴ inflection points (should be empty -- x=0 is NOT one): {find_inflection_points(f2, x)}")
```

---

### Quadratic Approximation: One Step Beyond Lesson 8

Lesson 8's linear approximation, $L(x)=f(a)+f'(a)(x-a)$, matches
$f$'s **value** and **slope** at $a$, but not its curvature — so it
systematically drifts away from curves that bend noticeably. Add one
more term, using the second derivative to match curvature too:

$$Q(x) = f(a) + f'(a)(x-a) + \frac{1}{2}f''(a)(x-a)^2$$

This is the beginning of what's formally called a **Taylor
polynomial** — this curriculum stops at the quadratic term, but the
same pattern (matching progressively higher derivatives) continues
indefinitely in the full theory, a genuine and important topic in its
own right that sits just beyond this course's scope.

```python
import sympy as sp

x = sp.symbols('x')
f = sp.sqrt(x)
a = 4

f_a = f.subs(x, a)
f_prime_a = sp.diff(f, x).subs(x, a)
f_double_prime_a = sp.diff(f, x, 2).subs(x, a)

L = f_a + f_prime_a*(x - a)                                    # linear (Lesson 8)
Q = f_a + f_prime_a*(x-a) + sp.Rational(1,2)*f_double_prime_a*(x-a)**2  # quadratic

x_target = 4.5   # farther from a=4 than Lesson 8's example, to show the difference more clearly
exact = float(f.subs(x, x_target))
linear_approx = float(L.subs(x, x_target))
quad_approx = float(Q.subs(x, x_target))

print(f"Exact value:  {exact:.6f}")
print(f"Linear approx: {linear_approx:.6f}  (error: {abs(exact-linear_approx):.6f})")
print(f"Quadratic approx: {quad_approx:.6f}  (error: {abs(exact-quad_approx):.6f})")
```

Output:

```
Exact value:  2.121320
Linear approx: 2.125000  (error: 0.003680)
Quadratic approx: 2.121094  (error: 0.000227)
```

The quadratic approximation's error is roughly **16 times smaller**
than the linear one at this distance — a direct, visible payoff of
matching one more derivative, and a concrete preview of why the full
Taylor series (matching every derivative) converges so effectively
for well-behaved functions.

---

### The Complete Curve-Sketching Procedure

Assembling every tool from this chapter into one systematic report:

1. **Domain** — where is $f$ defined?
2. **Intercepts** — $f(0)$, and where $f(x)=0$.
3. **Asymptotes** — vertical (Lesson 1's infinite-limit case),
   horizontal (Lesson 1's limits at infinity, Lesson 1.5).
4. **Critical points and extrema** — Lesson 10.
5. **Concavity and inflection points** — this lesson.
6. **Sketch**, informed by all of the above.

```python
import sympy as sp

def curve_analysis_report(f_expr, var):
    """A systematic report combining every Stage 5 curve-sketching tool."""
    report = {}
    report['f(0)'] = f_expr.subs(var, 0) if f_expr.subs(var, 0).is_finite else 'undefined'

    zeros = sp.solve(sp.Eq(f_expr, 0), var)
    report['zeros'] = [z for z in zeros if z.is_real]

    f_prime = sp.diff(f_expr, var)
    critical_points = sp.solve(f_prime, var)
    report['critical_points'] = critical_points

    f_double_prime = sp.diff(f_expr, var, 2)
    inflection_candidates = sp.solve(f_double_prime, var)
    inflections = []
    for c in inflection_candidates:
        try:
            before = f_double_prime.subs(var, c - 0.01)
            after = f_double_prime.subs(var, c + 0.01)
            if before * after < 0:
                inflections.append(c)
        except TypeError:
            continue
    report['inflection_points'] = inflections

    horiz_asymptote = sp.limit(f_expr, var, sp.oo)
    report['horizontal_asymptote_at_+inf'] = horiz_asymptote

    return report

x = sp.symbols('x')
f = (x**3 - 3*x) / 4   # scaled cubic for a clean plot

report = curve_analysis_report(f, x)
for key, value in report.items():
    print(f"{key}: {value}")
```

```python
import numpy as np
import matplotlib.pyplot as plt
import sympy as sp

x_sym = sp.symbols('x')
f_sym = (x_sym**3 - 3*x_sym) / 4
f_np = sp.lambdify(x_sym, f_sym, 'numpy')

x_vals = np.linspace(-3, 3, 300)
fig, ax = plt.subplots(figsize=(8, 6))
ax.plot(x_vals, f_np(x_vals), color='#2980b9', lw=2)

for cp in report['critical_points']:
    ax.plot(float(cp), f_np(float(cp)), 'o', color='#e74c3c', markersize=8,
            label='critical point' if cp == report['critical_points'][0] else None)
for ip in report['inflection_points']:
    ax.plot(float(ip), f_np(float(ip)), 's', color='#27ae60', markersize=8,
            label='inflection point' if ip == report['inflection_points'][0] else None)

ax.axhline(0, color='#999', lw=0.5); ax.axvline(0, color='#999', lw=0.5)
ax.legend(fontsize=9)
ax.set_title('Full curve sketch: critical points and inflection points marked', fontsize=11)
plt.tight_layout()
plt.show()
```

**Walkthrough.** `curve_analysis_report` composes tools from every
prior Stage 5 lesson into one function — `sp.solve` for zeros and
critical points (Lesson 10), the inflection-point sign-change check
(this lesson), and `sp.limit(..., sp.oo)` for asymptotic behavior
(Lesson 1/5.2) — genuinely nothing new syntactically, only new
*composition* of established tools, the same capstone-style
integration used at the end of Stage 3 and Stage 4.

---

## Connect the Pieces

Concrete trace: full analysis of $f(x)=\frac{x^3-3x}{4}$.

1. **Critical points** ($x=\pm1$, from $f'(x)=0$): candidates for
   local extrema, classified via concavity.
2. **Inflection point** ($x=0$, where $f''(x)=\frac{6x}{4}$
   genuinely changes sign): the point where the curve's bend reverses
   direction.
3. **Concavity test, justified**: at $x=1$, $f''(1)>0$ (concave up)
   confirms a genuine local minimum — the same reasoning Lesson 10
   used informally, now fully justified via the tangent-line
   argument at the top of this lesson.
4. **Quadratic approximation**: available at any point on this curve,
   using the same $f,f',f''$ already computed for the report —
   demonstrating these aren't separate calculations but one connected
   toolkit.

---

## Summary

**Concavity**: $f''>0$ concave up (curve above tangents), $f''<0$
concave down (below tangents) — a direct consequence of Lesson 9's
monotonicity test applied to $f'$ itself.

**Inflection points**: $f''=0$ or undefined **and** a genuine sign
change — a necessary-but-not-sufficient condition, exactly like
critical points.

**Second derivative test, justified**: concave-up at a critical point
means the curve sits above its horizontal tangent — a genuine local
minimum, not just an asserted rule.

**Quadratic approximation**: $Q(x)=f(a)+f'(a)(x-a)+\frac12f''(a)(x-a)^2$
— the first step of a Taylor polynomial, dramatically more accurate
than Lesson 8's linear version.

**Complete curve sketching**: domain, intercepts, asymptotes,
extrema, concavity/inflection — every Stage 5 differentiation tool
assembled into one systematic procedure.

**New Python/CS concepts:**
- Genuine sign-change verification for inflection candidates (not
  just solving $f''=0$)
- A composed "report" function integrating tools from across the
  entire chapter

---

## Problems

### Math

**1.** Determine the concavity of $f(x)=x^3-6x^2$ on $(0,\infty)$
and find any inflection point.

<details><summary>Answer</summary>
$f''(x)=6x-12$. $f''<0$ for $x<2$ (concave down), $f''>0$ for $x>2$
(concave up). Genuine sign change at $x=2$: inflection point.
</details>

---

**2.** Explain, using this lesson's tangent-line definition of
concavity, why $f(x)=x^4$ is concave up everywhere despite $f''(0)=0$.

<details><summary>Answer</summary>
$f''(x)=12x^2\ge0$ for all $x$, and strictly $>0$ except at the
single point $x=0$ — the curve still lies at or above every tangent
line throughout, including the horizontal tangent at $x=0$ itself
(check: $f(x)=x^4\ge0=$ the tangent line's value there, for all $x$).
Concavity doesn't require $f''>0$ strictly everywhere, only that the
curve never dips below its tangents — a single isolated zero of $f''$
doesn't break that.
</details>

---

**3.** Use the quadratic approximation formula to estimate $\cos(0.2)$
using $a=0$ (recall $\cos(0)=1$, $\cos'(0)=0$, $\cos''(0)=-1$).

<details><summary>Answer</summary>
$Q(x)=1+0(x)+\frac12(-1)x^2=1-\frac{x^2}{2}$.
$Q(0.2)=1-0.02=0.98$. (Exact: $\cos(0.2)\approx0.980067$ — very
close, since $\cos$ near 0 is well-approximated by its Taylor
polynomial.)
</details>

---

### Code Challenges

**Challenge 1 — Concavity classifier**

```python
import sympy as sp

def concavity_at(f_expr, var, point):
    """Return 'up', 'down', or 'inconclusive' at the given point."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
assert concavity_at(x**2, x, 0) == 'up'
assert concavity_at(-x**2, x, 0) == 'down'
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Genuine inflection point finder**

```python
import sympy as sp

def genuine_inflection_points(f_expr, var):
    """Reimplement find_inflection_points from the lesson."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
result1 = genuine_inflection_points(x**3, x)
assert 0 in result1

result2 = genuine_inflection_points(x**4, x)
assert 0 not in result2   # necessary condition met, but no sign change
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Quadratic approximation accuracy comparison**

```python
import sympy as sp

def compare_approximations(f_expr, var, a, x_target):
    """
    Return (linear_error, quadratic_error) comparing both
    approximations' accuracy at x_target.
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
lin_err, quad_err = compare_approximations(sp.sqrt(x), x, 4, 4.5)
assert quad_err < lin_err   # quadratic should always be at least as good, here strictly better
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** A function has $f'(c)=0$ and $f''(c)=0$ at some point $c$ —
the second derivative test is inconclusive. Using $f(x)=x^4$ (local
min at $0$) and $g(x)=x^3$ (neither, at $0$) — both satisfying
$f'(0)=f''(0)=0$ — explain why no test based on $f'$ and $f''$ alone
could ever distinguish these two cases, and what additional
information (informally — full justification needs the higher-order
Taylor terms beyond this course's scope) would be needed to tell them
apart.

<details><summary>Answer</summary>
Both $f(x)=x^4$ and $g(x)=x^3$ have $f'(0)=0$ and $f''(0)=0$ —
identical first and second derivative information at $x=0$ — yet one
has a local minimum there and the other doesn't. Any test built only
from $f'$ and $f''$ evaluated at the single point $c$ necessarily
sees these two functions as indistinguishable, since it has access to
exactly the same two numbers ($0$ and $0$) in both cases — the test
simply doesn't have enough information encoded in it to separate them.
What actually distinguishes them is the **third derivative**:
$f'''(0)=0$ for $x^4$ but continues to a nonzero fourth derivative
($f^{(4)}(0)=24>0$, consistent with a min), while $g'''(0)=6\ne0$ for
$x^3$ — a nonzero odd-order derivative at a point where all lower
derivatives vanish is exactly the signature of an inflection-like
point rather than a genuine extremum, the general pattern (odd order
$\Rightarrow$ neither; even order with positive value $\Rightarrow$
min; negative $\Rightarrow$ max) that the full Taylor-series theory
makes precise beyond what this lesson's quadratic approximation
alone can resolve.
</details>
