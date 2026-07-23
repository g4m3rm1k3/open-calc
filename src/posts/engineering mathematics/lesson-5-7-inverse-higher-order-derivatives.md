# Stage 5, Lesson 5.7 — Inverse Function Derivatives and Higher-Order Derivatives
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 2.4 introduced $\arcsin$, $\arccos$, and $\arctan$ purely
geometrically, with no derivative treatment at all — this lesson
supplies it, via a general rule for differentiating **any** inverse
function, built directly from implicit differentiation (Lesson 5.5).
This lesson also introduces **higher-order derivatives** — the
derivative of a derivative, and so on — which have been implicitly
needed since Stage 3 (Lesson 3.10's $C^2$ continuity, which required
matching *curvature*, is precisely a second-derivative condition, left
unformalized until now) and become essential machinery for concavity
(Lesson 5.11), Newton's method (5.12), and Taylor series (5.11). The
closing application is directly manufacturing-relevant: real CNC
controllers don't just limit velocity and acceleration, they limit
**jerk** — the derivative of acceleration — specifically to avoid the
mechanical shock and vibration that instantaneous acceleration changes
cause.

---

## What You Need To Know First

- **Implicit differentiation, chain rule** — Lesson 5.5.
- **Inverse trigonometric functions, defined geometrically with no
  calculus** — Lesson 2.4.
- **$C^2$ continuity requiring matched curvature, left informal** —
  Lesson 3.10.

---

## The Lesson

### The General Inverse Function Derivative Rule

If $g=f^{-1}$ (so $f(g(x))=x$ for all valid $x$), differentiate both
sides with respect to $x$ using the chain rule on the left:

$$f'(g(x))\cdot g'(x) = 1 \quad\Longrightarrow\quad g'(x) = \frac{1}{f'(g(x))}$$

**In words**: the inverse function's derivative at $x$ is the
reciprocal of the original function's derivative, evaluated at
$g(x)$ — not at $x$ itself. This single formula is the engine behind
every inverse-trig derivative below.

---

### Derivative of $\arcsin x$

Let $y=\arcsin x$, so $\sin y=x$ (Lesson 2.4's definition, restricted
to $y\in[-\pi/2,\pi/2]$). Differentiate implicitly:

$$\cos y\cdot\frac{dy}{dx} = 1 \quad\Longrightarrow\quad \frac{dy}{dx} = \frac{1}{\cos y}$$

Express $\cos y$ in terms of $x$: from $\sin^2y+\cos^2y=1$ (Lesson
2.5), $\cos y=\sqrt{1-\sin^2y}=\sqrt{1-x^2}$ (positive root, since
$\cos y\ge0$ for $y\in[-\pi/2,\pi/2]$ — the restricted range is
exactly why this sign choice is always valid). So:

$$\frac{d}{dx}\arcsin x = \frac{1}{\sqrt{1-x^2}}$$

```python
import sympy as sp

x = sp.symbols('x')
print(f"d/dx[arcsin x] = {sp.diff(sp.asin(x), x)}")
```

**Derivative of $\arccos x$**, by an identical argument (or via
$\arccos x=\pi/2-\arcsin x$, Lesson 2.4):

$$\frac{d}{dx}\arccos x = -\frac{1}{\sqrt{1-x^2}}$$

**Derivative of $\arctan x$**: let $y=\arctan x$, so $\tan y=x$.
Implicit differentiation:

$$\sec^2y\cdot\frac{dy}{dx}=1 \quad\Longrightarrow\quad \frac{dy}{dx}=\frac{1}{\sec^2y} = \frac{1}{1+\tan^2y} = \frac{1}{1+x^2}$$

using the identity $\sec^2y=1+\tan^2y$ (Lesson 2.5) in the second
step.

```python
import sympy as sp

x = sp.symbols('x')
print(f"d/dx[arccos x] = {sp.diff(sp.acos(x), x)}")
print(f"d/dx[arctan x] = {sp.diff(sp.atan(x), x)}")
```

**Numerical cross-check**, the same "verify the exact answer against
a finite-difference estimate" habit from Lesson 5.3:

```python
import math

def central_diff(f, x0, h=1e-6):
    return (f(x0+h) - f(x0-h)) / (2*h)

x0 = 0.5
print(f"arcsin'({x0}) exact:     {1/math.sqrt(1-x0**2):.8f}")
print(f"arcsin'({x0}) numerical: {central_diff(math.asin, x0):.8f}")
```

---

### Higher-Order Derivatives

Differentiating $f'(x)$ **again** gives the **second derivative**,
$f''(x)$ or $\dfrac{d^2y}{dx^2}$; differentiating again gives the
**third derivative** $f'''(x)$ or $f^{(3)}(x)$ (parenthesized-number
notation is standard once the prime marks get unwieldy, beyond about
the third derivative), and so on.

**Physical meaning, the classic chain**: if $s(t)$ is position, then
$v(t)=s'(t)$ is **velocity**, $a(t)=v'(t)=s''(t)$ is **acceleration**,
and $j(t)=a'(t)=s'''(t)$ is **jerk** — the rate of change of
acceleration itself.

```python
import sympy as sp

t = sp.symbols('t')
s = t**4 - 2*t**3 + t   # some position function

v = sp.diff(s, t)
a = sp.diff(v, t)
j = sp.diff(a, t)

print(f"position:     s(t) = {s}")
print(f"velocity:     v(t) = {v}")
print(f"acceleration: a(t) = {a}")
print(f"jerk:         j(t) = {j}")
```

**Higher-order derivatives in the tree differentiator**: simply apply
`differentiate` repeatedly — no new machinery needed, since each
application produces a new, fully valid expression tree that the same
function can be called on again.

```python
def nth_derivative(expr, n, differentiate_fn):
    """Apply differentiate_fn n times."""
    result = expr
    for _ in range(n):
        result = differentiate_fn(result)
    return result
```

---

### Manufacturing Application: Jerk-Limited Motion Profiles

A naive CNC motion command might specify only a target velocity,
implicitly allowing **instantaneous** acceleration changes — which in
reality means an infinite jerk spike, causing mechanical shock,
vibration, and surface-finish defects on the workpiece. Real motion
controllers instead plan a **jerk-limited** (or "S-curve") velocity
profile: acceleration itself ramps up and down smoothly, rather than
switching on and off abruptly.

```python
import sympy as sp
import numpy as np
import matplotlib.pyplot as plt

t = sp.symbols('t')

# A smooth S-curve position profile (one common construction:
# based on a scaled/shifted portion of a smooth polynomial ramp)
T = 4   # total move duration
s_expr = 10 * (t/T)**3 - 15*(t/T)**4 + 6*(t/T)**5   # a "smoothstep"-style profile, scaled by distance 10
s_expr = 10 * s_expr   # total distance 10 units -- adjust for the smoothstep's [0,1] range already giving 0->1
s_expr = (t/T)**3 * (10 + 15*(1 - t/T) + 6*(1-t/T)**2)  # (kept simple; see note below)

# Simpler, cleaner choice: classic quintic smoothstep scaled to distance D over time T
D = 10
tau = t / T
s_expr = D * (10*tau**3 - 15*tau**4 + 6*tau**5)

v_expr = sp.diff(s_expr, t)
a_expr = sp.diff(v_expr, t)
j_expr = sp.diff(a_expr, t)

t_vals = np.linspace(0, T, 200)
s_fn = sp.lambdify(t, s_expr, 'numpy')
v_fn = sp.lambdify(t, v_expr, 'numpy')
a_fn = sp.lambdify(t, a_expr, 'numpy')
j_fn = sp.lambdify(t, j_expr, 'numpy')

fig, axes = plt.subplots(4, 1, figsize=(8, 10), sharex=True)
labels = ['Position', 'Velocity', 'Acceleration', 'Jerk']
for ax, fn, label, color in zip(axes, [s_fn, v_fn, a_fn, j_fn], labels,
                                  ['#2980b9','#27ae60','#e74c3c','#f39c12']):
    ax.plot(t_vals, fn(t_vals), color=color, lw=2)
    ax.set_ylabel(label, fontsize=9)
    ax.grid(True, alpha=0.3)
axes[-1].set_xlabel('time (s)')
plt.suptitle('Jerk-limited (S-curve) motion profile: all derivatives start/end at zero', fontsize=11)
plt.tight_layout()
plt.show()

print(f"Velocity at start/end: {v_fn(0):.4f}, {v_fn(T):.4f}")
print(f"Acceleration at start/end: {a_fn(0):.4f}, {a_fn(T):.4f}")
```

**Walkthrough.** `sp.lambdify(t, expr, 'numpy')` is a first
appearance: it converts a symbolic SymPy expression into an ordinary,
fast numerical Python function that accepts NumPy arrays — bridging
symbolic differentiation (exact, but slow on large arrays) and
numerical evaluation (fast, needed for plotting hundreds of points) —
the practical glue between the two modes of computation this stage
has used side by side since Lesson 5.1. The **quintic smoothstep**
polynomial ($10\tau^3-15\tau^4+6\tau^5$) is specifically constructed
so that both its first *and* second derivatives are exactly zero at
$\tau=0$ and $\tau=1$ — meaning velocity **and acceleration** both
start and end at zero, a genuinely desirable property for a real
machine move (no jerk discontinuity at the very start or end of the
motion, exactly the mechanical-shock problem this section opened
with).

---

## Connect the Pieces

Concrete trace: an S-curve CNC move over 4 seconds, distance 10 units.

1. **Inverse trig derivatives**: established via implicit
   differentiation, giving Lesson 2.4's geometric functions their
   first calculus treatment.
2. **Higher-order derivatives**: position → velocity → acceleration →
   jerk, each one an ordinary application of `sp.diff` to the
   previous result — no new rule needed beyond repeated
   differentiation.
3. **`sp.lambdify`**: bridges exact symbolic derivatives to fast
   numerical plotting across an entire time range.
4. **Physical payoff**: the smoothstep profile's acceleration (not
   just velocity) provably starts and ends at zero — directly
   preventing the jerk spike a naive linear-ramp motion profile would
   produce.

---

## Summary

**Inverse function rule**: $g'(x)=\dfrac{1}{f'(g(x))}$, derived via
implicit differentiation on $f(g(x))=x$.

**Inverse trig derivatives**: $\arcsin'x=\dfrac{1}{\sqrt{1-x^2}}$,
$\arccos'x=-\dfrac{1}{\sqrt{1-x^2}}$, $\arctan'x=\dfrac{1}{1+x^2}$.

**Higher-order derivatives**: repeated differentiation; position →
velocity → acceleration → jerk.

**Application**: jerk-limited (S-curve) CNC motion profiles use a
smoothstep polynomial specifically chosen so velocity *and*
acceleration both vanish at the endpoints, avoiding mechanical shock.

**New Python/CS concepts:**
- `sp.lambdify` — converting a symbolic expression into a fast
  numerical function

---

## Problems

### Math

**1.** Differentiate $f(x)=\arcsin(2x)$ using the chain rule.

<details><summary>Answer</summary>
$f'(x)=\dfrac{1}{\sqrt{1-(2x)^2}}\cdot2 = \dfrac{2}{\sqrt{1-4x^2}}$.
</details>

---

**2.** Differentiate $f(x)=\arctan(x^2)$.

<details><summary>Answer</summary>
$f'(x)=\dfrac{2x}{1+x^4}$.
</details>

---

**3.** For $s(t)=t^3-6t^2+9t$, find velocity, acceleration, and the
time(s) when acceleration is zero.

<details><summary>Answer</summary>
$v(t)=3t^2-12t+9$. $a(t)=6t-12$. $a(t)=0 \Rightarrow t=2$.
</details>

---

### Code Challenges

**Challenge 1 — Inverse trig derivative verifier**

```python
import math

def arcsin_derivative(x0, h=1e-6):
    """Return the exact arcsin derivative formula's value at x0."""
    pass

def numerical_check(f, x0, h=1e-6):
    return (f(x0+h) - f(x0-h)) / (2*h)

# --- tests: do not modify ---
x0 = 0.3
exact = arcsin_derivative(x0)
numeric = numerical_check(math.asin, x0)
assert math.isclose(exact, numeric, abs_tol=1e-4)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Motion chain**

```python
import sympy as sp

def motion_chain(position_expr, var):
    """Return (velocity, acceleration, jerk) expressions."""
    pass

# --- tests: do not modify ---
t = sp.symbols('t')
s = t**4
v, a, j = motion_chain(s, t)
assert v == 4*t**3
assert a == 12*t**2
assert j == 24*t
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — S-curve endpoint checker**

```python
import sympy as sp

def check_smoothstep_endpoints(D, T):
    """
    Build the quintic smoothstep position profile scaled to distance D
    over time T, and return (v_at_0, v_at_T, a_at_0, a_at_T) -- all
    should be (numerically) zero.
    """
    pass

# --- tests: do not modify ---
v0, vT, a0, aT = check_smoothstep_endpoints(10, 4)
assert all(abs(val) < 1e-9 for val in [v0, vT, a0, aT])
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Use the general inverse function rule $g'(x)=1/f'(g(x))$ to
re-derive $\dfrac{d}{dx}\ln x=\dfrac1x$ (Lesson 5.6), treating $\ln$
as the inverse of $\exp$, as an independent check against that
lesson's implicit-differentiation derivation.

<details><summary>Answer</summary>
Let $f(x)=e^x$ (so $f'(x)=e^x$, Lesson 5.6) and $g=\ln=f^{-1}$. By the
inverse rule:
$$g'(x) = \frac{1}{f'(g(x))} = \frac{1}{e^{\ln x}} = \frac{1}{x}$$
using $e^{\ln x}=x$ (the defining inverse relationship). Matches
Lesson 5.6's result exactly, via a completely different route (this
lesson's general inverse rule rather than that lesson's implicit
differentiation on $e^y=x$) — the same cross-verification habit used
for the circle/ellipse tangent lines in Lesson 5.5. $\blacksquare$
</details>
