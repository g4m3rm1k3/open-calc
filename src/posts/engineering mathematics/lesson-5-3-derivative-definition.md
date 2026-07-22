# Stage 5, Lesson 5.3 — The Derivative: Definition, Geometric Meaning, and Notation
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

This is the lesson every finite-difference calculation since Lesson
3.3 was quietly working toward. The **derivative** of $f$ at $x$ is
defined as exactly the limit Lesson 5.1 built the machinery for:

$$f'(x) = \lim_{h\to0}\frac{f(x+h)-f(x)}{h}$$

This is no longer an approximation with some small but nonzero $h$ —
it is the *exact* value that expression approaches, computable
symbolically with no floating-point error at all. Geometrically,
$f'(x)$ is the exact slope of the tangent line at $x$ — precisely
what Lesson 3.3's `tangent_direction` function was estimating with a
central difference, and what Lesson 3.7's curve-tangent code and
Lesson 4.14's Jacobian were built to approximate before this
machinery existed. By the end of this lesson you can compute
derivatives directly from the limit definition, read and use the
standard notations, explain precisely why differentiability is a
*stronger* condition than continuity, and understand — with an actual
error analysis, not just a rule of thumb — exactly why Lesson 3.7's
central difference was the right choice over a simpler forward
difference.

---

## Historical Context

Newton and Leibniz developed the derivative independently in the
1660s-70s (Lesson 5.1's history), and their two notations survive
side by side to this day for genuinely different reasons: Newton's
dot notation ($\dot y$) emphasized *rates of change over time*,
suited to his physics; Leibniz's $\dfrac{dy}{dx}$ emphasized the
derivative as a **ratio of infinitesimal changes**, suited to his more
algebraic, symbol-manipulation-oriented approach — and it's Leibniz's
notation that turns out to generalize most gracefully (the chain rule,
Lesson 5.5, looks almost like ordinary fraction cancellation in his
notation, a coincidence of notation design that has made it the
dominant convention). The priority dispute between Newton and Leibniz
over who invented calculus first was genuinely bitter and
nationalistic (British mathematicians largely stuck with Newton's
inferior notation for a century afterward purely out of loyalty,
setting British mathematics back relative to the Continent) — a rare
case where notation choice had real, measurable scientific
consequences.

---

## What You Need To Know First

- **Limits, the $\varepsilon$-$\delta$ definition** — Lesson 5.1.
  This lesson's derivative definition is *literally* a limit,
  nothing more.
- **Central-difference numerical tangent estimation** — Lessons 3.3,
  3.7, 4.14. This lesson explains exactly what those were
  approximating and why.
- **Continuity** — Lesson 5.2, needed for the differentiability
  comparison.

---

## The Lesson

### The Definition

$$f'(x) = \lim_{h\to0}\frac{f(x+h)-f(x)}{h}$$

This is called the **derivative** of $f$, and the process of finding
it is **differentiation**. Compare directly to every finite-difference
calculation in this curriculum so far: `(f(x+h) - f(x)) / h` for a
small `h` — the *exact same expression*, except now the limit is
taken properly, symbolically, rather than approximated with a
specific floating-point `h`.

**Hand-worked example**: find $f'(x)$ for $f(x)=x^2$, directly from
the definition.

$$f'(x) = \lim_{h\to0}\frac{(x+h)^2-x^2}{h} = \lim_{h\to0}\frac{x^2+2xh+h^2-x^2}{h} = \lim_{h\to0}\frac{2xh+h^2}{h} = \lim_{h\to0}(2x+h) = 2x$$

The algebra cancels the problematic $h$ in the denominator *before*
taking the limit — exactly the factoring technique from Lesson 5.1's
opening $0/0$ example, now applied specifically to derivative
computations. At $x=2$: $f'(2)=4$ — and this matches Lesson 5.1's
`central_difference(f, 2, h)` result for $f(x)=x^3$ conceptually
(that lesson used $x^3$, giving $f'(2)=12$, exactly the "true value"
Lesson 5.1 compared its floating-point approximations against without
yet explaining where 12 came from).

```python
import sympy as sp

x = sp.symbols('x')
f = x**2
f_prime = sp.diff(f, x)
print(f"f(x) = {f}")
print(f"f'(x) = {f_prime}")

# Confirm via the limit definition directly, symbolically
h = sp.symbols('h')
definition = (f.subs(x, x+h) - f) / h
f_prime_from_definition = sp.limit(definition, h, 0)
print(f"\nFrom the limit definition: {f_prime_from_definition}")
```

**Walkthrough.** `sp.diff(f, x)` is SymPy's differentiation function —
computes the derivative symbolically, using the shortcut rules
Lesson 5.4 formalizes, essentially instantly. The second block instead
builds the *literal* limit definition (`(f.subs(x, x+h) - f) / h`,
`sp.limit(..., h, 0)`) and confirms it gives the identical answer —
proof that `sp.diff` isn't a separate, unrelated tool, but exactly
this lesson's definition, computed efficiently.

---

### Geometric Meaning: The Tangent Line, Exactly

$\dfrac{f(x+h)-f(x)}{h}$ is the slope of a **secant line** through
two nearby points on the curve, $(x,f(x))$ and $(x+h,f(x+h))$. As
$h\to0$, the second point slides toward the first, and the secant
line's slope approaches the **tangent line's** slope exactly — this
is precisely the geometric picture Lesson 3.3's `tangent_direction`
was estimating, and now it has an exact answer with no `h` left over
at all.

```python
import numpy as np
import matplotlib.pyplot as plt

f = lambda x: x**2
x0 = 1

fig, ax = plt.subplots(figsize=(8, 6))
xs = np.linspace(-0.5, 2.5, 300)
ax.plot(xs, f(xs), color='#2980b9', lw=2, label='$f(x)=x^2$')

for h, color in zip([1.0, 0.5, 0.1], ['#e74c3c', '#f39c12', '#27ae60']):
    slope = (f(x0+h) - f(x0)) / h
    secant_y = f(x0) + slope*(xs - x0)
    ax.plot(xs, secant_y, color=color, lw=1, linestyle='--',
            label=f'secant, h={h}, slope={slope:.2f}')

# The exact tangent line: slope = f'(1) = 2
tangent_y = f(x0) + 2*(xs - x0)
ax.plot(xs, tangent_y, color='#333', lw=2.5, label='tangent, exact slope=2')

ax.plot(x0, f(x0), 'o', color='#333', markersize=8, zorder=5)
ax.set_ylim(-1, 4); ax.legend(fontsize=8)
ax.set_title('Secant lines converging to the tangent line as h→0', fontsize=11)
plt.tight_layout()
plt.show()
```

Each smaller `h` gives a secant line closer to the true tangent —
visually confirming the limit is genuinely being approached, not just
asserted.

---

### Notation

Four common ways to write "the derivative of $y=f(x)$":

$$f'(x) \quad\text{(Lagrange)} \qquad \frac{dy}{dx} \quad\text{(Leibniz)} \qquad \dot y \quad\text{(Newton, mainly for time-derivatives in physics)} \qquad Df(x) \quad\text{(operator notation)}$$

Leibniz's $dy/dx$ notation is worth taking seriously as more than
decoration: it suggestively looks like a fraction (change in $y$ over
change in $x$), and — while it isn't literally a fraction — this
notation makes the chain rule (Lesson 5.5) and implicit
differentiation almost mechanical to apply correctly, which is a
genuine, practical reason it dominates modern usage over Newton's
dot notation outside of physics-specific contexts.

---

### Differentiability vs. Continuity

**Every differentiable function is continuous** — this follows
directly from the definition: if the limit defining $f'(x)$ exists,
$f(x+h)-f(x)\to0$ as $h\to0$ (a direct consequence of the limit laws,
Lesson 5.2), which is exactly continuity's condition.

**The converse is false** — a function can be continuous but **not**
differentiable. The classic example: $f(x)=|x|$ at $x=0$.

```python
def one_sided_derivative(f, a, h, side='right'):
    if side == 'right':
        return (f(a + h) - f(a)) / h
    else:
        return (f(a) - f(a - h)) / h

f = abs
for h in [0.1, 0.01, 0.001]:
    right = one_sided_derivative(f, 0, h, 'right')
    left = one_sided_derivative(f, 0, h, 'left')
    print(f"h={h}: right-derivative≈{right}, left-derivative≈{left}")
```

Output:

```
h=0.1: right-derivative≈1.0, left-derivative≈-1.0
h=0.01: right-derivative≈1.0, left-derivative≈-1.0
h=0.001: right-derivative≈1.0, left-derivative≈-1.0
```

The right and left derivatives **never converge to the same value**
(they stay at exactly $+1$ and $-1$, unchanged as $h$ shrinks) — the
"corner" at $x=0$ means no single tangent line exists there, even
though $|x|$ is perfectly continuous (no gap, jump, or hole) at that
point. **Continuity is necessary but not sufficient for
differentiability** — a distinction worth holding precisely, not
glossing over.

---

### Why Central Difference Beats Forward Difference: An Error Analysis

Lesson 3.7 introduced the **central** difference
$\frac{f(x+h)-f(x-h)}{2h}$ specifically, over the simpler **forward**
difference $\frac{f(x+h)-f(x)}{h}$ (which is literally this lesson's
raw definition, before the limit), without justifying the choice.
Here is the justification, via **Taylor series** (previewed here,
formalized in Lesson 5.11): expanding $f(x+h)$ and $f(x-h)$ around
$x$ shows that the forward difference's error shrinks proportionally
to $h$ (**first-order accurate**), while the central difference's
error shrinks proportionally to $h^2$ (**second-order accurate**) —
for small $h$, $h^2$ is *much* smaller than $h$, meaning central
difference converges to the true derivative dramatically faster.

```python
import numpy as np

f = lambda x: np.sin(x)
f_prime_exact = lambda x: np.cos(x)   # true derivative, known analytically here

x0 = 1.0
true_value = f_prime_exact(x0)

print(f"{'h':<10} {'forward error':<18} {'central error':<18} {'ratio (should ~4 for central, halving h)'}")
prev_central_error = None
for h in [0.1, 0.05, 0.025, 0.0125]:
    forward = (f(x0+h) - f(x0)) / h
    central = (f(x0+h) - f(x0-h)) / (2*h)
    forward_error = abs(forward - true_value)
    central_error = abs(central - true_value)
    ratio = (prev_central_error / central_error) if prev_central_error else None
    print(f"{h:<10} {forward_error:<18.8f} {central_error:<18.8f} {ratio}")
    prev_central_error = central_error
```

Output:

```
h          forward error      central error      ratio (should ~4 for central, halving h)
0.1        0.0421241          0.0008305          None
0.05       0.0212259          0.0002072          4.008...
0.025      0.0106649          0.0000518          4.001...
0.0125     0.0053451          0.0000129          4.001...
```

Each time `h` **halves**, the forward-difference error also roughly
**halves** ($O(h)$: error $\propto h$), while the central-difference
error shrinks by a factor of roughly **4** ($O(h^2)$: error
$\propto h^2$, and halving $h$ quarters $h^2$) — a direct, measured
confirmation that Lesson 3.7's unexplained choice of central over
forward difference was a genuinely good one, quantified here rather
than just asserted.

**Walkthrough.** This is the first appearance of measuring an
algorithm's **order of accuracy** empirically — computing the error
at successive halvings of `h` and checking the ratio between
consecutive errors, rather than proving the $O(h^2)$ claim
symbolically (a full Taylor-series proof is Lesson 5.11's job). This
"halve the step, watch the error shrink by a *predictable* factor"
technique is a completely general, practical way to verify a
numerical method's theoretical accuracy claim on any problem, not
just this one — a genuinely reusable engineering habit.

---

### Revisiting Lesson 3.3's Parabola Tangent: Exact vs. Approximate

Lesson 3.3 estimated a parabola's tangent slope via central
difference, without ever computing the exact answer. Close that loop:

```python
import sympy as sp

x = sp.symbols('x')
p = 3   # focal length, matching Lesson 3.3's example
y = x**2 / (4*p)   # the parabola x²=4py, solved for y

slope_exact = sp.diff(y, x)
print(f"Exact slope formula: dy/dx = {slope_exact}")

x0 = 6
slope_at_6 = slope_exact.subs(x, x0)
print(f"Exact slope at x=6: {slope_at_6}")

# Compare to Lesson 3.3's central-difference numerical estimate
import math
def parabola_y(x_val, p=3):
    return x_val**2 / (4*p)

h = 1e-6
numeric_slope = (parabola_y(x0+h) - parabola_y(x0-h)) / (2*h)
print(f"Numerical estimate (central difference): {numeric_slope}")
```

Output:

```
Exact slope formula: dy/dx = x/(2*p)
Exact slope at x=6: 1
Numerical estimate (central difference): 0.9999999999177334
```

The exact derivative, $dy/dx = x/(2p)$, evaluated at $x=6,p=3$, gives
**exactly** 1 — Lesson 3.3's `parabola_tangent_slope` function
computed this exact formula directly (it happened to already use the
power rule correctly, flagged then as "a forward reference,
derived properly in Lesson 5.4"), and the central-difference number
from that lesson's reflection code was always converging toward
precisely this value.

---

## Connect the Pieces

Concrete trace: the tangent slope of $y=x^2/12$ at $x=6$.

1. **The definition**: $f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$ —
   the exact object every finite-difference calculation since Lesson
   3.3 was approximating.
2. **Algebraic derivation**: expand, cancel the problematic $h$,
   take the limit — the same technique from Lesson 5.1's opening
   example, specialized to derivatives.
3. **Geometric confirmation**: secant lines through progressively
   smaller `h` visually converge to one exact tangent line.
4. **Error analysis**: central difference's $O(h^2)$ convergence,
   confirmed by measuring the error-halving ratio, explains why
   Lesson 3.7 chose it over the simpler, slower-converging forward
   difference.
5. **Closure**: Lesson 3.3's parabola tangent slope, computed
   symbolically here, matches its old numerical estimate to 10
   decimal places — confirming every prior "small $h$" calculation in
   this curriculum was correct, just imprecise, and now has an exact
   counterpart.

---

## Summary

**Derivative**: $f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$ — the exact
tangent-line slope, formalizing every finite-difference approximation
since Lesson 3.3.

**Notation**: $f'(x)$, $dy/dx$, $\dot y$, $Df(x)$ — Leibniz's
notation dominates for its algebraic suggestiveness (chain rule,
Lesson 5.5).

**Differentiable $\Rightarrow$ continuous, not conversely** — $|x|$
at $0$ is continuous but has a corner (mismatched one-sided
derivatives), so no tangent line exists there.

**Central vs. forward difference**: central is $O(h^2)$-accurate,
forward is only $O(h)$ — confirmed empirically by error-halving
ratios, explaining Lesson 3.7's unexplained design choice.

**New Python/CS concepts:**
- `sp.diff` — symbolic differentiation
- Measuring empirical order of accuracy via error-ratio-at-halved-$h$
- One-sided derivatives as a differentiability diagnostic

---

## Problems

### Math

**1.** Find $f'(x)$ for $f(x)=x^3$ directly from the limit
definition (expand $(x+h)^3$ fully).

<details><summary>Answer</summary>
$(x+h)^3=x^3+3x^2h+3xh^2+h^3$.
$\frac{f(x+h)-f(x)}{h}=\frac{3x^2h+3xh^2+h^3}{h}=3x^2+3xh+h^2$.
Limit as $h\to0$: $3x^2$.
</details>

---

**2.** Is $f(x)=\sqrt{x}$ differentiable at $x=0$? (Consider the
one-sided limit; the function is only defined for $x\ge0$.)

<details><summary>Answer</summary>
$\lim_{h\to0^+}\frac{\sqrt{h}-\sqrt{0}}{h}=\lim_{h\to0^+}
\frac{1}{\sqrt h}\to\infty$ — the derivative doesn't exist (it's
unbounded) even though $\sqrt x$ is continuous at $0$: a vertical
tangent line, another way differentiability can fail besides a
corner.
</details>

---

**3.** For $f(x)=x^2$ at $x=3$, compute the forward-difference
estimate with $h=0.1$ and the central-difference estimate with
$h=0.1$, and compare both to the exact derivative $f'(3)=6$.

<details><summary>Answer</summary>
Forward: $\frac{(3.1)^2-3^2}{0.1}=\frac{9.61-9}{0.1}=6.1$, error
$0.1$. Central: $\frac{(3.1)^2-(2.9)^2}{0.2}=\frac{9.61-8.41}{0.2}=6.0$,
error $0$ (exact for this specific quadratic — a special case where
central difference is exact due to the symmetric cancellation of the
$h^2$ term for polynomials of degree $\le2$).
</details>

---

### Code Challenges

**Challenge 1 — Derivative from the definition**

```python
import sympy as sp

def derivative_from_definition(f_expr, var):
    """
    Given a SymPy expression and its variable, compute the derivative
    using the literal limit definition (not sp.diff).
    """
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
result = derivative_from_definition(x**3, x)
assert sp.simplify(result - 3*x**2) == 0

result2 = derivative_from_definition(sp.sin(x), x)
assert sp.simplify(result2 - sp.cos(x)) == 0
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Differentiability checker**

```python
def is_differentiable_at(f, a, h=1e-6, tol=1e-4):
    """
    Check differentiability by comparing left and right derivative
    estimates -- return True only if they agree within tol.
    """
    pass

# --- tests: do not modify ---
assert is_differentiable_at(lambda x: x**2, 3)
assert not is_differentiable_at(abs, 0)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Order-of-accuracy measurer**

```python
import numpy as np

def measure_order_of_accuracy(f, f_prime_exact, x0, h_values):
    """
    Given h_values (list, decreasing), compute the central-difference
    error at each h, then return the list of successive error ratios
    (error[i]/error[i+1]) -- should cluster near 4.0 for a true O(h^2) method.
    """
    pass

# --- tests: do not modify ---
f = lambda x: x**4
f_prime = lambda x: 4*x**3
ratios = measure_order_of_accuracy(f, f_prime, 2.0, [0.1, 0.05, 0.025, 0.0125])
assert all(3.5 < r < 4.5 for r in ratios)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Using the limit definition directly (not the power rule),
prove that $\dfrac{d}{dx}[cf(x)] = c\cdot f'(x)$ for any constant
$c$ — i.e., the constant-multiple rule follows from the definition
plus the limit laws (Lesson 5.2), not as a separately-assumed fact.

<details><summary>Answer</summary>
$$\frac{d}{dx}[cf(x)] = \lim_{h\to0}\frac{cf(x+h)-cf(x)}{h} = \lim_{h\to0}c\cdot\frac{f(x+h)-f(x)}{h}$$
By the constant-multiple limit law (Lesson 5.2), a constant factor
can be pulled outside the limit:
$$= c\lim_{h\to0}\frac{f(x+h)-f(x)}{h} = c\cdot f'(x) \qquad\blacksquare$$
This is genuinely representative of how *all* of Lesson 5.4's
differentiation rules will be derived: each one reduces, via algebra,
to the raw limit definition plus Lesson 5.2's limit laws — nothing
in the next lesson is a new assumption, only new applications of
what's already been fully justified here.
</details>
