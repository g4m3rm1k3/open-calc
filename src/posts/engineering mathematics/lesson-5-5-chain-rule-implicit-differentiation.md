# Stage 5, Lesson 5.5 — The Chain Rule and Implicit Differentiation
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 5.4's tree differentiator raised `NotImplementedError` the
moment it met anything more complicated than bare $x^n$ — it had no
way to differentiate $(x^2+1)^5$ or $\sin(3x)$, because those aren't
sums, products, or plain powers of $x$; they're **compositions**, one
function nested inside another. The **chain rule** closes that gap:

$$\frac{d}{dx}[f(g(x))] = f'(g(x))\cdot g'(x)$$

In Leibniz notation, $\dfrac{dy}{dx}=\dfrac{dy}{du}\cdot\dfrac{du}{dx}$
— which looks exactly like ordinary fraction cancellation, and this
is genuinely why Leibniz's notation won out over Newton's (Lesson
5.3's history): the chain rule becomes almost self-suggesting, even
though $dy/dx$ isn't literally a fraction. This lesson also finally
handles curves that were never solved for $y$ in the first place —
Lesson 3.2's circle and Lesson 3.4's ellipse used ad hoc tangent-line
formulas derived from perpendicularity arguments; **implicit
differentiation** re-derives both, directly from calculus, treating
$y$ as an unknown function of $x$ throughout.

---

## Historical Context

The chain rule doesn't have as dramatic a discovery story as some
other calculus results — it emerges almost immediately once Leibniz's
notation for the derivative is in place, which is itself telling: the
rule is, in a real sense, a *consequence of good notation* as much as
a separate mathematical discovery. Implicit differentiation, by
contrast, was essential to Newton's own work on algebraic curves
(curves defined by a polynomial equation in $x$ and $y$ with no
requirement that $y$ be isolated) well before Leibniz's notation
existed — Newton needed tangent lines to curves like circles and
conics for his physics, and treating $y$ as an unspecified function of
$x$ throughout a differentiation, without ever solving for it
explicitly, was his practical solution.

---

## What You Need To Know First

- **Differentiation rules, the tree differentiator, its
  `NotImplementedError` gap** — Lesson 5.4.
- **Circle and ellipse tangent-line formulas, derived geometrically**
  — Lessons 3.2, 3.4.
- **Leibniz notation** — Lesson 5.3.

---

## The Lesson

### The Chain Rule

$$\frac{d}{dx}[f(g(x))] = f'(g(x))\cdot g'(x)$$

**Informal derivation** via Leibniz notation: let $u=g(x)$, so
$y=f(u)$. For a small change $\Delta x$, there's a resulting change
$\Delta u=g(x+\Delta x)-g(x)$, and a resulting change $\Delta y$.
Multiply and divide by $\Delta u$:

$$\frac{\Delta y}{\Delta x} = \frac{\Delta y}{\Delta u}\cdot\frac{\Delta u}{\Delta x}$$

Taking the limit as $\Delta x\to0$ (and, correspondingly,
$\Delta u\to0$, assuming $g$ is differentiable hence continuous —
Lesson 5.3): each factor approaches its respective derivative,
$\dfrac{dy}{du}\cdot\dfrac{du}{dx}$. **This derivation has a genuine
gap worth flagging honestly**: it silently divides by $\Delta u$,
which can be exactly zero for some $\Delta x\ne0$ even as
$\Delta x\to0$ (imagine $g$ momentarily flat) — a fully rigorous
proof needs to handle that case separately, which is beyond this
lesson's scope, but the result itself is correct and provable
rigorously; only this particular informal derivation has the gap.

**Hand-worked example:** $\dfrac{d}{dx}(x^2+1)^5$.

Let $u=x^2+1$ (inner function), $f(u)=u^5$ (outer function).
$f'(u)=5u^4$, $\dfrac{du}{dx}=2x$.

$$\frac{d}{dx}(x^2+1)^5 = 5(x^2+1)^4\cdot2x = 10x(x^2+1)^4$$

```python
import sympy as sp

x = sp.symbols('x')
expr = (x**2+1)**5
result = sp.diff(expr, x)
print(f"sympy: {sp.factor(result)}")
```

**A second example**, combining chain rule with a trig derivative
(the derivative of $\sin x$ is $\cos x$ — properly derived in Lesson
5.6, used here as a known building block): $\dfrac{d}{dx}\sin(3x)$.

$u=3x$, $f(u)=\sin u$, $f'(u)=\cos u$, $\dfrac{du}{dx}=3$.

$$\frac{d}{dx}\sin(3x) = 3\cos(3x)$$

---

### Resolving Lesson 5.4's Gap: Chain Rule in the Tree Differentiator

Lesson 5.4's `differentiate` function refused any `'pow'` node whose
base wasn't literally `('var',)`. Fix it properly, and add a
`'compose'` node for general function composition:

```python
def differentiate(expr):
    """
    Extends Lesson 5.4's differentiator with the chain rule, resolving
    its NotImplementedError for non-trivial power bases and adding
    general function composition.
    """
    kind = expr[0]

    if kind == 'const':
        return ('const', 0)
    if kind == 'var':
        return ('const', 1)
    if kind == 'add':
        _, left, right = expr
        return ('add', differentiate(left), differentiate(right))
    if kind == 'mul':
        _, left, right = expr
        return ('add',
                ('mul', differentiate(left), right),
                ('mul', left, differentiate(right)))

    if kind == 'pow':
        _, base, exponent = expr
        n = exponent[1]
        # Chain rule, generalized: d/dx[base^n] = n*base^(n-1) * d/dx[base]
        outer_derivative = ('mul', ('const', n), ('pow', base, ('const', n-1)))
        return ('mul', outer_derivative, differentiate(base))

    if kind == 'sin':
        _, inner = expr
        return ('mul', ('cos', inner), differentiate(inner))
    if kind == 'cos':
        _, inner = expr
        return ('mul', ('mul', ('const', -1), ('sin', inner)), differentiate(inner))

    raise ValueError(f"Unknown expression kind: {kind}")

def to_string(expr):
    kind = expr[0]
    if kind == 'const': return str(expr[1])
    if kind == 'var': return 'x'
    if kind == 'add': return f"({to_string(expr[1])} + {to_string(expr[2])})"
    if kind == 'mul': return f"({to_string(expr[1])} * {to_string(expr[2])})"
    if kind == 'pow': return f"({to_string(expr[1])}^{to_string(expr[2])})"
    if kind == 'sin': return f"sin({to_string(expr[1])})"
    if kind == 'cos': return f"cos({to_string(expr[1])})"

# (x^2 + 1)^5 -- previously raised NotImplementedError in Lesson 5.4
expr = ('pow', ('add', ('pow', ('var',), ('const', 2)), ('const', 1)), ('const', 5))
deriv = differentiate(expr)
print(f"f(x)  = {to_string(expr)}")
print(f"f'(x) unsimplified = {to_string(deriv)}")
```

**Walkthrough.** The `'pow'` branch's fix is minimal but essential:
instead of assuming `differentiate(base)` is always `1` (true only
when `base == ('var',)`, Lesson 5.4's restriction), it's now called
*genuinely recursively* and multiplied in — exactly the chain rule
formula, $n\cdot\text{base}^{n-1}\cdot\frac{d}{dx}[\text{base}]$. When
`base` really is `('var',)`, `differentiate(base)` returns `('const',
1)`, and multiplying by 1 recovers Lesson 5.4's original plain power
rule exactly as a special case — confirming the chain rule
*generalizes* the power rule rather than replacing it, matching the
mathematical relationship between the two. The new `'sin'`/`'cos'`
branches are a first, direct application of the chain rule to
non-polynomial functions, using $\frac{d}{dx}\sin(u)=\cos(u)\cdot u'$
— itself a chain-rule application, with $\cos x$ as the to-be-proved
building block from Lesson 5.6.

---

### The Chain Rule and Rational Exponents

Lesson 5.4 stated, without proof, that the power rule extends to
rational exponents like $x^{1/2}$. The chain rule (combined with
implicit differentiation, next section) finally proves this. Let
$y=x^{1/n}$ for a positive integer $n$; then $y^n=x$. Differentiate
both sides with respect to $x$, treating $y$ as a function of $x$ and
using the chain rule on the left ($y^n$ is a composition: outer
function "raise to the $n$", inner function $y(x)$):

$$ny^{n-1}\cdot\frac{dy}{dx} = 1 \quad\Longrightarrow\quad \frac{dy}{dx}=\frac{1}{ny^{n-1}} = \frac{1}{n(x^{1/n})^{n-1}} = \frac{1}{n}x^{1/n-1}$$

— exactly the power rule's formula, now confirmed for rational
exponents of the form $1/n$. (The general rational case $x^{p/q}$
follows by combining this with the ordinary integer power rule and
the chain rule — left as Problem 2.)

---

### Implicit Differentiation

For a curve defined by an equation in both $x$ and $y$ with no
requirement that $y$ be isolated (Lesson 3.6's general conics are the
running example), **implicit differentiation** treats $y$ as an
unspecified function of $x$ throughout, differentiates both sides of
the equation with respect to $x$ (applying the chain rule to every
$y$-term, since $y$ is implicitly $y(x)$), and solves algebraically
for $\dfrac{dy}{dx}$.

**Re-deriving Lesson 3.2's circle tangent formula.** Circle:
$x^2+y^2=r^2$. Differentiate both sides with respect to $x$:

$$2x + 2y\frac{dy}{dx} = 0 \quad\Longrightarrow\quad \frac{dy}{dx} = -\frac{x}{y}$$

Compare directly to Lesson 3.2's `tangent_at_point`, which computed
the tangent slope geometrically as $-1/m_r$ where
$m_r=(y_0-k)/(x_0-h)$ is the radius slope (here $h=k=0$, so
$m_r=y_0/x_0$): $-1/m_r=-x_0/y_0$ — **identical**, confirming the two
completely different derivations (geometric perpendicularity in
Lesson 3.2, calculus here) agree exactly.

```python
import sympy as sp

x, y = sp.symbols('x y')
r = sp.symbols('r', positive=True)

circle_eq = sp.Eq(x**2 + y**2, r**2)
# sp.idiff computes dy/dx directly from an implicit equation
dy_dx = sp.idiff(circle_eq.lhs - circle_eq.rhs, y, x)
print(f"Circle: dy/dx = {dy_dx}")

# Verify against a specific point, matching Lesson 3.2's hand-worked
# example: circle (x-2)^2+(y-1)^2=25 at point (5,5)
h, k, r_val = 2, 1, 5
x0, y0 = 5, 5
shifted_eq = (x-h)**2 + (y-k)**2 - r_val**2
slope = sp.idiff(shifted_eq, y, x).subs({x: x0, y: y0})
print(f"\nTangent slope at (5,5) on the shifted circle: {slope}")
print(f"Lesson 3.2's hand-worked answer was: -3/4")
```

Output:

```
Circle: dy/dx = -x/y

Tangent slope at (5,5) on the shifted circle: -3/4
```

**Walkthrough.** `sp.idiff(expr, y, x)` is a first appearance of
SymPy's dedicated implicit-differentiation function — given an
expression implicitly equal to zero (or, as here, a shifted-circle
expression built the same way), it treats `y` as a function of `x`
automatically and returns `dy/dx` directly, without you needing to
manually write out `sp.Function('y')(x)` and differentiate by hand
(a more verbose alternative also worth knowing exists, but `idiff`
is the direct, practical tool for this specific job). The exact
match to Lesson 3.2's independently-derived $-3/4$ closes that
lesson's loop completely: two unrelated derivation methods, one
geometric and one calculus-based, landing on the identical answer.

**Re-deriving Lesson 3.4's ellipse tangent formula.**

```python
import sympy as sp

x, y, a, b = sp.symbols('x y a b', positive=True)
ellipse_eq = x**2/a**2 + y**2/b**2 - 1
dy_dx_ellipse = sp.idiff(ellipse_eq, y, x)
print(f"Ellipse: dy/dx = {sp.simplify(dy_dx_ellipse)}")
```

Output:

```
Ellipse: dy/dx = -b**2*x/(a**2*y)
```

This is the general slope formula for any point on the ellipse — a
single, compact calculus result standing in for what would otherwise
need a separate geometric derivation for every conic type, exactly
the unifying power calculus brings to what Stage 3 handled conic-by-
conic.

---

## Connect the Pieces

Concrete trace: the tangent line to $(x-2)^2+(y-1)^2=25$ at $(5,5)$,
computed three separate ways across this curriculum.

1. **Lesson 3.2, geometric**: perpendicular-to-radius reasoning,
   $-1/m_r$, giving $-3/4$ by hand.
2. **Lesson 3.2, code**: `tangent_at_point`, verified numerically.
3. **This lesson, calculus**: implicit differentiation via
   `sp.idiff`, applying the chain rule to the $y^2$ term, giving
   $-3/4$ again — independently, from an entirely different
   mathematical starting point.
4. **The tree differentiator**: extended in this lesson to finally
   handle the compositions (`(x^2+1)^5`, `sin(3x)`) that stalled it
   in Lesson 5.4, via the identical chain-rule formula used for the
   circle/ellipse.

Three independent methods, one answer — the kind of cross-
verification this curriculum has favored since Lesson 3.2's circle
tangent, now closed with calculus.

---

## Summary

**Chain rule**: $\frac{d}{dx}[f(g(x))]=f'(g(x))g'(x)$, or
$\frac{dy}{dx}=\frac{dy}{du}\cdot\frac{du}{dx}$ — resolves Lesson
5.4's tree-differentiator gap for any composed expression.

**Rational exponents**: the power rule extends via implicit
differentiation on $y^n=x$.

**Implicit differentiation**: differentiate both sides of an equation
in $x,y$ with respect to $x$, treating $y$ as $y(x)$ (chain rule on
every $y$-term), solve for $dy/dx$ — re-derives Lessons 3.2 and 3.4's
geometric tangent formulas exactly, via calculus instead of
perpendicularity arguments.

**New Python/CS concepts:**
- `sp.idiff` — symbolic implicit differentiation
- Chain rule as the generalization that makes the tree
  differentiator's `'pow'` branch correct for *any* base, not just
  `('var',)`

---

## Problems

### Math

**1.** Differentiate $f(x)=\sqrt{x^2+1}$ using the chain rule.

<details><summary>Answer</summary>
$f(x)=(x^2+1)^{1/2}$. $f'(x)=\frac12(x^2+1)^{-1/2}\cdot2x =
\dfrac{x}{\sqrt{x^2+1}}$.
</details>

---

**2.** Use the chain rule to extend the power-rule proof to
$x^{p/q}$ (general rational exponent), starting from $y=x^{p/q}
\Rightarrow y^q=x^p$.

<details><summary>Answer</summary>
Differentiate both sides: $qy^{q-1}\dfrac{dy}{dx}=px^{p-1}$.
$$\frac{dy}{dx} = \frac{px^{p-1}}{qy^{q-1}} = \frac{p}{q}\cdot\frac{x^{p-1}}{(x^{p/q})^{q-1}} = \frac{p}{q}\cdot x^{p-1-\frac{p(q-1)}{q}} = \frac{p}{q}x^{\frac{p}{q}-1}$$
matching the general power rule exactly.
</details>

---

**3.** Find $dy/dx$ for the hyperbola $\dfrac{x^2}{a^2}-\dfrac{y^2}{b^2}=1$
via implicit differentiation, and compare to Lesson 3.5's asymptote
slope $b/a$ (consider what happens as the point moves far from the
origin, where $y/x\to b/a$).

<details><summary>Answer</summary>
$\dfrac{2x}{a^2}-\dfrac{2y}{b^2}\dfrac{dy}{dx}=0 \Rightarrow
\dfrac{dy}{dx}=\dfrac{b^2x}{a^2y}$. Far from the origin, points on the
hyperbola satisfy $y/x\to b/a$ (Lesson 3.5), so
$\dfrac{dy}{dx}\to\dfrac{b^2}{a^2}\cdot\dfrac{x}{y}\to\dfrac{b^2}{a^2}
\cdot\dfrac{a}{b}=\dfrac{b}{a}$ — the tangent slope itself approaches
the asymptote's slope far from the centre, consistent with the curve
hugging its asymptote.
</details>

---

### Code Challenges

**Challenge 1 — Chain rule tree differentiator**

```python
def differentiate_v2(expr):
    """Reimplement the lesson's chain-rule-aware differentiate()."""
    pass

def evaluate(expr, x_val):
    import math
    kind = expr[0]
    if kind == 'const': return expr[1]
    if kind == 'var': return x_val
    if kind == 'add': return evaluate(expr[1], x_val) + evaluate(expr[2], x_val)
    if kind == 'mul': return evaluate(expr[1], x_val) * evaluate(expr[2], x_val)
    if kind == 'pow': return evaluate(expr[1], x_val) ** evaluate(expr[2], x_val)
    if kind == 'sin': return math.sin(evaluate(expr[1], x_val))
    if kind == 'cos': return math.cos(evaluate(expr[1], x_val))

# --- tests: do not modify ---
# (x^2+1)^3 at x=2: f'(x)=3(x^2+1)^2 * 2x = 6x(x^2+1)^2; at x=2: 12*25=300
expr = ('pow', ('add', ('pow', ('var',), ('const', 2)), ('const', 1)), ('const', 3))
deriv = differentiate_v2(expr)
assert evaluate(deriv, 2) == 300

# sin(x^2) at x=1: derivative is cos(x^2)*2x
import math
expr2 = ('sin', ('pow', ('var',), ('const', 2)))
deriv2 = differentiate_v2(expr2)
assert math.isclose(evaluate(deriv2, 1), math.cos(1)*2, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Implicit tangent line finder**

```python
import sympy as sp

def implicit_tangent_slope(equation_expr, x_val, y_val):
    """
    equation_expr: a sympy expression assumed equal to 0 (e.g. x**2+y**2-25).
    Return dy/dx at the given point using sp.idiff.
    """
    pass

# --- tests: do not modify ---
x, y = sp.symbols('x y')
circle = x**2 + y**2 - 25
slope = implicit_tangent_slope(circle, 3, 4)
assert math.isclose(float(slope), -3/4, abs_tol=1e-9)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Conic tangent line, generalized**

```python
import sympy as sp

def conic_tangent_line(A, B, C, D, E, F, x0, y0):
    """
    For the general conic Ax²+Bxy+Cy²+Dx+Ey+F=0 (Lesson 3.6),
    return (slope, ) at point (x0,y0) via implicit differentiation.
    Assumes (x0,y0) is on the conic and the tangent isn't vertical.
    """
    pass

# --- tests: do not modify ---
# Circle x²+y²-25=0 is A=1,B=0,C=1,D=0,E=0,F=-25
slope = conic_tangent_line(1, 0, 1, 0, 0, -25, 3, 4)
assert math.isclose(slope, -3/4, abs_tol=1e-9)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Lesson 5.4's tree differentiator's `'pow'` branch, before
this lesson's fix, was only correct when the base was literally
`('var',)`. Explain precisely *why* the old version
(`('mul', ('const', n), ('pow', base, ('const', n-1)))`, without the
extra `differentiate(base)` factor) silently gave a **wrong** answer
for a composed base like `(x^2+1)^5`, rather than raising an error —
i.e., what specific wrong numeric result would it have produced at a
test point, if the `NotImplementedError` guard hadn't caught it
first?

<details><summary>Answer</summary>
Without the `differentiate(base)` factor (i.e., implicitly treating
it as if it were always `1`), the old formula would compute
$n\cdot\text{base}^{n-1}\cdot1$ instead of the correct
$n\cdot\text{base}^{n-1}\cdot g'(x)$ — silently *missing the inner
derivative factor entirely*. For $(x^2+1)^5$ at $x=2$: base
$=x^2+1=5$, correct derivative is $5(5)^4\cdot(2\cdot2)=5\cdot625\cdot
4=12500$, but the old (unguarded) formula would have produced just
$5(5)^4=3125$ — off by a factor of exactly $4$ (which is $g'(2)=2x=4$,
the missing chain-rule factor). This is precisely why Lesson 5.4's
explicit `NotImplementedError` guard mattered: it's far better for
buggy code to fail loudly on an unsupported case than to silently
return a plausible-looking but numerically wrong answer — exactly the
same fail-fast philosophy behind every precondition check since
Lesson 3.2's `Circle` radius guard.
</details>
