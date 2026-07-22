# Stage 5, Lesson 5.2 — Limit Laws, Squeeze Theorem, and Continuity
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Lesson 5.1 computed every limit either by staring at a table of
values or by asking SymPy — useful for building intuition, but not a
method that scales to complicated expressions or that lets you prove
anything by hand. This lesson supplies the missing algebra: **limit
laws** let you break a complicated limit into simpler pieces (sums,
products, quotients) and combine their individual limits directly,
the same "known constructs combine predictably" idea that's justified
formula manipulation since Lesson 1.1. The **Squeeze Theorem**
handles cases algebra alone can't reach — including, finally, a real
proof of $\lim_{x\to0}\frac{\sin x}{x}=1$, left as a numerical
observation in Lesson 5.1. And **continuity** gets its precise
definition at last, unifying every discontinuity type from Lesson 5.1
into one clean three-part test. The lesson closes with the
**Intermediate Value Theorem**, which guarantees roots exist under
mild conditions — and directly motivates **bisection**, a genuinely
useful root-finding algorithm built from nothing but IVT and
Lesson 5.1's limit machinery.

---

## Historical Context

The Squeeze Theorem's core idea — trap an unknown quantity between
two known bounds that converge to the same value — is far older than
formal calculus: Archimedes used essentially this technique (already
mentioned in Lesson 3.3's parabola history) to bound $\pi$ between the
perimeters of inscribed and circumscribed polygons, squeezing a
circle's circumference between two computable values that converge as
the polygon's side count grows. The specific geometric proof of
$\lim_{x\to0}\frac{\sin x}{x}=1$ given below is a direct descendant of
that same area-comparison technique, applied to a triangle, a
circular sector, and a larger triangle — a proof that would have been
entirely comprehensible to Archimedes, using only tools available in
antiquity, despite settling a question about *limits*, a concept not
formalized for another two millennia.

---

## What You Need To Know First

- **Limits, one-sided limits, the informal $\sin x/x\to1$
  observation** — Lesson 5.1.
- **Unit circle, radian measure, area of a sector** — Lesson 2.1.
- **Rational function asymptote reasoning** — Lesson 1.5, now
  formalized via limit laws.

---

## The Lesson

### Limit Laws

If $\lim_{x\to a}f(x)=L$ and $\lim_{x\to a}g(x)=M$ both exist:

$$\lim_{x\to a}[f(x)\pm g(x)] = L\pm M \qquad \lim_{x\to a}[f(x)g(x)] = LM$$
$$\lim_{x\to a}\frac{f(x)}{g(x)} = \frac{L}{M} \ (M\ne0) \qquad \lim_{x\to a}[cf(x)]=cL \qquad \lim_{x\to a}[f(x)]^n = L^n$$

These let you compute a complicated limit by breaking it into pieces
whose limits you already know, rather than re-deriving from a table
or an $\varepsilon$-$\delta$ argument every time — the same
divide-into-known-pieces strategy that's underpinned algebra since
Lesson 1.1.

**Hand-worked example:**
$$\lim_{x\to2}(3x^2-5x+1) = 3\lim_{x\to2}x^2 - 5\lim_{x\to2}x + \lim_{x\to2}1 = 3(4)-5(2)+1 = 3$$

For any polynomial, this always reduces to direct substitution — the
limit laws are exactly what justifies "just plug in the number,"
rather than that being an unexplained shortcut.

```python
import sympy as sp

x = sp.symbols('x')
expr = 3*x**2 - 5*x + 1
print(f"Limit via SymPy: {sp.limit(expr, x, 2)}")
print(f"Direct substitution: {expr.subs(x, 2)}")
```

---

### The Squeeze Theorem

If $g(x)\le f(x)\le h(x)$ for all $x$ near $a$ (except possibly at
$a$ itself), and $\lim_{x\to a}g(x)=\lim_{x\to a}h(x)=L$, then

$$\lim_{x\to a}f(x) = L$$

**Intuition**: $f$ is trapped between two functions that squeeze
together to the same value — $f$ has nowhere else to go.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-2, 2, 400)
x_nonzero = x[np.abs(x) > 0.01]

fig, ax = plt.subplots(figsize=(8, 6))
ax.plot(x_nonzero, x_nonzero**2, color='#e74c3c', lw=1.5, label='$g(x)=x^2$ (lower bound)')
ax.plot(x_nonzero, -x_nonzero**2, color='#e74c3c', lw=1.5)
ax.plot(x_nonzero, x_nonzero**2 * np.sin(1/x_nonzero), color='#2980b9', lw=1,
        label='$f(x)=x^2\\sin(1/x)$')
ax.axhline(0, color='#333', lw=0.5)
ax.legend(fontsize=9)
ax.set_title('Squeeze Theorem: $x^2\\sin(1/x)$ trapped between $\\pm x^2$', fontsize=11)
plt.tight_layout()
plt.show()
```

$f(x)=x^2\sin(1/x)$ **oscillates wildly** near $x=0$ (the same
oscillation failure mode from Lesson 5.1's $\sin(1/x)$ example) — but
because $-1\le\sin(1/x)\le1$ always, $-x^2\le x^2\sin(1/x)\le x^2$
everywhere, and both bounds $\to0$ as $x\to0$. Squeeze Theorem:
$\lim_{x\to0}x^2\sin(1/x)=0$, despite the function's wild oscillation
directly at that point — a genuinely useful result algebra alone
couldn't reach, since $x^2\sin(1/x)$ has no clean simplification.

---

### Proving $\lim_{x\to0}\dfrac{\sin x}{x}=1$

Lesson 5.1 left this numerical. Here is the real proof, via geometric
squeeze — for $0<x<\pi/2$, compare the areas of three regions built
from the unit circle:

1. **Triangle $OAB$** (with $B$ on the circle at angle $x$): area
   $=\frac12\sin x$.
2. **Circular sector $OAB$**: area $=\frac12x$ (Lesson 2.1: sector
   area is $\frac12r^2\theta$, here $r=1$).
3. **Triangle $OAC$** (extending to the tangent line at $A$): area
   $=\frac12\tan x$.

The triangle sits inside the sector, which sits inside the larger
triangle:

$$\frac12\sin x \le \frac12 x \le \frac12\tan x$$

Multiply through by $2/\sin x$ (positive for $0<x<\pi/2$, so the
inequality direction is preserved):

$$1 \le \frac{x}{\sin x} \le \frac{1}{\cos x}$$

Take reciprocals (flipping the inequalities):

$$\cos x \le \frac{\sin x}{x} \le 1$$

As $x\to0^+$, $\cos x\to1$ (direct substitution, $\cos$ is
continuous) — so $\sin x/x$ is squeezed between $\cos x\to1$ and the
constant $1$. By the Squeeze Theorem, $\lim_{x\to0^+}\sin x/x=1$. The
function is even ($\sin(-x)/(-x)=\sin x/x$), so the left-hand limit
matches automatically, giving the full two-sided result.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0.01, 1.5, 300)

fig, ax = plt.subplots(figsize=(8,6))
ax.plot(x, np.cos(x), color='#e74c3c', lw=2, label='$\\cos x$ (lower bound)')
ax.plot(x, np.ones_like(x), color='#27ae60', lw=2, label='$1$ (upper bound)')
ax.plot(x, np.sin(x)/x, color='#2980b9', lw=2, linestyle='--', label='$\\sin(x)/x$')
ax.legend(fontsize=10)
ax.set_title('$\\cos x \\leq \\sin(x)/x \\leq 1$: squeezed to 1 as $x\\to0$', fontsize=11)
plt.tight_layout()
plt.show()
```

---

### Continuity, Formally

$f$ is **continuous at $x=a$** if all three conditions hold:

1. $f(a)$ is defined.
2. $\lim_{x\to a}f(x)$ exists.
3. $\lim_{x\to a}f(x) = f(a)$.

Every discontinuity type from Lesson 5.1 is exactly one of these
three conditions failing:

| Failure | Type |
|---|---|
| Condition 2 fails, but the "expected" limit exists if you patch $f(a)$ | **Removable** (a hole) |
| Condition 2 fails because one-sided limits disagree | **Jump** |
| Condition 2 fails because $f$ grows unboundedly | **Infinite** |
| Conditions 1, 2 both hold but disagree (condition 3 fails) | Also removable — $f(a)$ is just the "wrong" value |

```python
def is_continuous_at(f, a, h=1e-6, tol=1e-4):
    """
    Check continuity at a by comparing f(a) (condition 1), the
    one-sided limits (condition 2), and their agreement (condition 3).
    """
    try:
        fa = f(a)
    except (ZeroDivisionError, ValueError):
        return False   # condition 1 fails

    left = f(a - h)
    right = f(a + h)
    if abs(left - right) > tol:
        return False   # condition 2 fails (one-sided limits disagree)

    limit_estimate = (left + right) / 2
    return abs(limit_estimate - fa) < tol   # condition 3

f_continuous = lambda x: x**2 + 1
f_hole = lambda x: (x**2-1)/(x-1) if x != 1 else 999   # wrong value patched in
f_jump = lambda x: 1 if x >= 0 else -1

print(f"x²+1 at x=2:         {is_continuous_at(f_continuous, 2)}")
print(f"Patched hole at x=1: {is_continuous_at(f_hole, 1)}")
print(f"Step function at x=0: {is_continuous_at(f_jump, 0)}")
```

**Walkthrough.** The `try`/`except` around `f(a)` is a genuine,
necessary defensive check — condition 1 ("$f(a)$ is defined") can
fail outright (a `ZeroDivisionError` from an undefined expression),
and the function needs to catch that rather than crash, correctly
reporting "not continuous" in that case too. This directly reuses
Lesson 5.1's classification logic, now organized around the three
named conditions rather than the informal jump/infinite/removable
labels.

---

### The Intermediate Value Theorem

**IVT**: if $f$ is continuous on $[a,b]$, and $L$ is any value
between $f(a)$ and $f(b)$, then there exists at least one $c\in[a,b]$
with $f(c)=L$.

**Intuition**: a continuous function can't skip over values — to get
from $f(a)$ to $f(b)$, it must pass through everything in between
(no jumping, since jumping is exactly what continuity rules out).

**A direct, practical consequence**: if $f(a)$ and $f(b)$ have
**opposite signs**, IVT guarantees a **root** ($f(c)=0$) somewhere in
$(a,b)$ — a genuine existence guarantee, not just a plausibility
argument, useful in engineering wherever you need to know a target
condition is achievable somewhere within a range before searching for
exactly where.

### Bisection: A Root-Finding Algorithm Built Directly From IVT

If $f(a)$ and $f(b)$ have opposite signs, IVT guarantees a root
between them. **Bisection** finds it by repeatedly halving the
interval, keeping whichever half still brackets a sign change:

```python
def bisection(f, a, b, tol=1e-8, max_iters=100):
    """
    Find a root of f in [a,b] via bisection, requiring f(a) and f(b)
    to have opposite signs (an IVT precondition).
    """
    fa, fb = f(a), f(b)
    if fa * fb > 0:
        raise ValueError("f(a) and f(b) must have opposite signs (IVT precondition)")

    for _ in range(max_iters):
        mid = (a + b) / 2
        fm = f(mid)
        if abs(fm) < tol or (b - a) / 2 < tol:
            return mid
        if fa * fm < 0:
            b, fb = mid, fm
        else:
            a, fa = mid, fm
    return (a + b) / 2

# Find where x^3 - x - 2 = 0
f = lambda x: x**3 - x - 2
root = bisection(f, 1, 2)
print(f"Root: {root:.8f}")
print(f"f(root) = {f(root):.2e}")
```

**Walkthrough.** `if fa * fm < 0:` checks whether the root lies in
the *left* half (the sign change persists between `a` and `mid`) —
multiplying two values and checking the sign of the product is a
compact way to test "do these have opposite signs" without writing
out a longer conditional. Each iteration **halves** the search
interval — a direct preview of Lesson 8.8's formal $O(\log n)$
analysis of exactly this kind of halving algorithm, here demonstrated
concretely rather than proved asymptotically.

---

### Manufacturing Application: Finding an Operating Setpoint via Bisection

A machine's cutting force is a continuous (if complicated,
possibly simulation-derived) function of spindle speed. IVT guarantees
that if the force at a low speed is below target and at a high speed
is above target, **some** speed in between hits the target exactly —
and bisection finds it without needing to know the function's formula
at all, only how to evaluate it (even via a black-box simulation).

```python
def cutting_force(rpm):
    """A stand-in for a real (possibly simulated) force model."""
    return 0.0004*(rpm - 1200)**2 - 50 + 0.02*rpm

target_force = 100

def shifted(rpm):
    return cutting_force(rpm) - target_force

optimal_rpm = bisection(shifted, 500, 3000)
print(f"RPM for {target_force}N cutting force: {optimal_rpm:.2f}")
print(f"Verification: force at this RPM = {cutting_force(optimal_rpm):.4f}N")
```

**Walkthrough.** `shifted(rpm) = cutting_force(rpm) - target_force`
reframes "find the RPM giving force = target" as "find the root of
(force − target)" — a standard, reusable translation that turns any
target-matching problem into a root-finding problem, letting the same
`bisection` function solve both this and the earlier polynomial root
without modification.

---

## Connect the Pieces

Concrete trace: proving $\sin x/x\to1$, then using continuity and IVT
to justify a root search.

1. **Limit laws**: handle polynomial and simple algebraic limits
   directly — the tool for "easy" cases.
2. **Squeeze Theorem**: handles $\sin x/x$ (and $x^2\sin(1/x)$), where
   no algebraic simplification exists — geometric area bounds,
   traceable straight back to Archimedes.
3. **Continuity**: the precise three-condition test unifying every
   discontinuity type from Lesson 5.1.
4. **IVT**: continuity's direct practical payoff — root existence
   guaranteed by a sign change.
5. **Bisection**: IVT turned into a working algorithm, applicable to
   both a clean polynomial and a real, opaque engineering function
   (cutting force vs. RPM).

---

## Summary

**Limit laws**: sums, products, quotients, powers of limits combine
predictably — justifies direct substitution for continuous functions.

**Squeeze Theorem**: trap $f$ between two functions converging to the
same limit; proves $\lim_{x\to0}\sin x/x=1$ geometrically (Archimedes-
style area comparison).

**Continuity**: $f(a)$ defined, $\lim_{x\to a}f(x)$ exists, and they
match — unifies every Lesson 5.1 discontinuity type as one of these
three conditions failing.

**IVT**: a continuous function hits every value between $f(a)$ and
$f(b)$ — guarantees roots exist given a sign change.

**Bisection**: a genuine root-finding algorithm built directly from
IVT, applicable to any continuous function, including opaque/
simulation-based ones.

**New Python/CS concepts:**
- Three-condition continuity checker (unifying Lesson 5.1's ad hoc
  classifier)
- Bisection algorithm — halving search, a direct forward reference to
  $O(\log n)$ (Lesson 8.8)
- Reframing "hit a target value" as "find a root of (f − target)"

---

## Problems

### Math

**1.** Evaluate $\lim_{x\to1}\dfrac{x^3-1}{x-1}$ using limit laws
after factoring.

<details><summary>Answer</summary>
$x^3-1=(x-1)(x^2+x+1)$. Limit $=\lim_{x\to1}(x^2+x+1)=1+1+1=3$.
</details>

---

**2.** Use the Squeeze Theorem to find $\lim_{x\to0}x^4\cos(1/x^2)$.

<details><summary>Answer</summary>
$-1\le\cos(1/x^2)\le1 \Rightarrow -x^4\le x^4\cos(1/x^2)\le x^4$.
Both bounds $\to0$ as $x\to0$. Squeeze: limit is $0$.
</details>

---

**3.** Does $f(x)=x^2-4x+3$ have a root between $x=0$ and $x=2$?
Use IVT (don't just factor and check directly).

<details><summary>Answer</summary>
$f(0)=3>0$, $f(2)=4-8+3=-1<0$ — opposite signs, and $f$ is a
polynomial (continuous everywhere). By IVT, a root exists in $(0,2)$.
(It's $x=1$, but IVT guarantees existence without needing to find it.)
</details>

---

### Code Challenges

**Challenge 1 — Limit laws calculator**

```python
import sympy as sp

def compute_limit(expr_str, var_str, approach_to):
    """
    Parse a SymPy expression string and compute its limit symbolically.
    approach_to can be a number, sp.oo, or -sp.oo.
    """
    pass

# --- tests: do not modify ---
result = compute_limit("3*x**2 - 2*x + 1", "x", 2)
assert result == 9

result2 = compute_limit("sin(x)/x", "x", 0)
assert result2 == 1
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Continuity classifier (three-condition version)**

```python
def continuity_report(f, a, h=1e-6, tol=1e-4):
    """
    Return a dict: {'defined': bool, 'limit_exists': bool,
    'continuous': bool}, testing all three IVT-adjacent conditions
    from the lesson.
    """
    pass

# --- tests: do not modify ---
f1 = lambda x: x**2
report1 = continuity_report(f1, 3)
assert report1['defined'] and report1['limit_exists'] and report1['continuous']

f2 = lambda x: 1/x if x != 0 else 0
report2 = continuity_report(f2, 0)
assert report2['defined']
assert not report2['limit_exists']
assert not report2['continuous']
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Bisection solver**

```python
def find_root(f, a, b, tol=1e-8, max_iters=100):
    """Reimplement bisection from the lesson."""
    pass

# --- tests: do not modify ---
f = lambda x: x**2 - 2   # root at sqrt(2)
root = find_root(f, 0, 2)
assert math.isclose(root, math.sqrt(2), abs_tol=1e-6)

try:
    find_root(lambda x: x**2 + 1, -1, 1)   # no real root, same sign throughout
    assert False, "should have raised"
except ValueError:
    pass
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove, using the Squeeze Theorem and the result
$\lim_{x\to0}\frac{\sin x}{x}=1$ from this lesson, that
$\lim_{x\to0}\dfrac{1-\cos x}{x}=0$. (Hint: multiply numerator and
denominator by $1+\cos x$, and use $\sin^2x=1-\cos^2x$ from Lesson
2.5.)

<details><summary>Answer</summary>
$$\frac{1-\cos x}{x}\cdot\frac{1+\cos x}{1+\cos x} = \frac{1-\cos^2x}{x(1+\cos x)} = \frac{\sin^2x}{x(1+\cos x)} = \frac{\sin x}{x}\cdot\frac{\sin x}{1+\cos x}$$
As $x\to0$: $\frac{\sin x}{x}\to1$ (this lesson's proven result), and
$\frac{\sin x}{1+\cos x}\to\frac{0}{2}=0$ (direct substitution, since
both $\sin$ and $\cos$ are continuous). By the product limit law:
$$\lim_{x\to0}\frac{1-\cos x}{x} = 1\times0=0 \qquad\blacksquare$$
This companion limit is exactly what Lesson 5.6 needs to derive the
derivative of $\sin x$ from first principles — another instance of
this lesson's tools being built specifically for near-term reuse.
</details>
