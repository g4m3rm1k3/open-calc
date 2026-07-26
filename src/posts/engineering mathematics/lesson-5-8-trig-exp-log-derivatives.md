# Stage 5, Lesson 5.8 — Derivatives of Trigonometric, Exponential, and Logarithmic Functions
**Threads:** Math · Physics · Engineering
**Estimated time:** 65–75 minutes

---

## What This Lesson Is About

Lesson 5 used $\frac{d}{dx}\sin x=\cos x$ as a "known building
block, properly derived in Lesson 6." This is that lesson. The
proof uses **exactly** the two trigonometric limits established in
Lesson 2 — $\lim_{h\to0}\frac{\sin h}{h}=1$ (proved via the
Archimedes-style squeeze) and $\lim_{h\to0}\frac{1-\cos h}{h}=0$ (that
lesson's Extension problem) — showing those limits weren't isolated
curiosities but the exact two facts calculus needed all along. This
lesson also finally cashes in Lesson 1.7's teaser about why $e$ is
"the number that appears everywhere": $e$ is defined, in the deepest
sense relevant to calculus, as **the unique base for which
$\frac{d}{dx}a^x=a^x$ exactly** — no extra constant factor. By the
end of this lesson you can differentiate any trigonometric,
exponential, or logarithmic function, understand precisely why $e$ is
singled out among all possible exponential bases, and apply these
derivatives to the exponential decay/growth models (tool wear,
Newton's cooling, RC circuits) introduced back in Lesson 1.13.

---

## Historical Context

Lesson 1.7 described $e$ via compound interest and left its deeper
significance as a promise. That significance is precisely this
lesson's content: among all possible exponential functions $a^x$,
only $a=e$ gives a function that is **its own derivative** — a fact
that, once seen, retroactively explains why $e$ shows up in radioactive
decay, population growth, compound interest, and RC circuit
discharge (Lesson 1.13) with such stubborn regularity: any process
whose *rate of change is proportional to its current value* is
governed by an equation that only $e^x$ (and its scaled/shifted
relatives) can solve — a claim this lesson sets up and Stage 7's
differential equations will finish properly.

---

## What You Need To Know First

- **The two trig limits**, $\lim\sin h/h=1$ and
  $\lim(1-\cos h)/h=0$ — Lesson 2, including its Extension problem.
- **The chain rule, implicit differentiation** — Lesson 5.
- **$e$, compound interest, the natural logarithm** — Lessons 1.7,
  1.8.
- **Exponential engineering models (tool life, Newton cooling, RC
  circuits)** — Lesson 1.13, this lesson's closing application.

---

## The Lesson

### The Derivative of $\sin x$, Fully Proved

$$\frac{d}{dx}\sin x = \lim_{h\to0}\frac{\sin(x+h)-\sin x}{h}$$

Expand $\sin(x+h)$ using the angle-addition identity (Lesson 2.5):

$$\sin(x+h) = \sin x\cos h + \cos x\sin h$$

Substitute:

$$= \lim_{h\to0}\frac{\sin x\cos h+\cos x\sin h - \sin x}{h} = \lim_{h\to0}\left[\sin x\cdot\frac{\cos h-1}{h} + \cos x\cdot\frac{\sin h}{h}\right]$$

Split via the sum limit law (Lesson 2), treating $\sin x$ and
$\cos x$ as constants with respect to the limit in $h$:

$$= \sin x\cdot\lim_{h\to0}\frac{\cos h-1}{h} + \cos x\cdot\lim_{h\to0}\frac{\sin h}{h} = \sin x\cdot0 + \cos x\cdot1 = \cos x$$

using **exactly** the two limits Lesson 2 proved geometrically
($\lim\frac{\sin h}{h}=1$ directly, and $\lim\frac{\cos h-1}{h}=0$,
the negative of that lesson's Extension result $\lim\frac{1-\cos
h}{h}=0$). $\blacksquare$

```python
import sympy as sp

x = sp.symbols('x')
result = sp.diff(sp.sin(x), x)
print(f"d/dx[sin x] = {result}")
```

**The derivative of $\cos x$** follows by an almost identical proof
(expand $\cos(x+h)=\cos x\cos h-\sin x\sin h$, split, apply the same
two limits) — or more efficiently, via the chain rule and the
identity $\cos x=\sin(x+\pi/2)$ (Lesson 2.5):

$$\frac{d}{dx}\cos x = \frac{d}{dx}\sin(x+\pi/2) = \cos(x+\pi/2)\cdot1 = -\sin x$$

using $\cos(x+\pi/2)=-\sin x$ (another Lesson 2.5 identity).

**Derivatives of the remaining trig functions** follow from these two
via the quotient rule (Lesson 4), since $\tan x=\sin x/\cos x$,
etc.:

```python
import sympy as sp

x = sp.symbols('x')
for func in [sp.tan(x), sp.sec(x), sp.cot(x), sp.csc(x)]:
    print(f"d/dx[{func}] = {sp.diff(func, x)}")
```

**Hand-worked example** (tangent, via quotient rule):
$$\frac{d}{dx}\tan x = \frac{d}{dx}\left[\frac{\sin x}{\cos x}\right] = \frac{\cos x\cos x - \sin x(-\sin x)}{\cos^2x} = \frac{\cos^2x+\sin^2x}{\cos^2x} = \frac{1}{\cos^2x} = \sec^2x$$

using the Pythagorean identity $\sin^2x+\cos^2x=1$ (Lesson 2.5) in
the last step.

---

### The Derivative of $e^x$: Cashing In Lesson 1.7's Teaser

$$\frac{d}{dx}e^x = \lim_{h\to0}\frac{e^{x+h}-e^x}{h} = \lim_{h\to0}\frac{e^x(e^h-1)}{h} = e^x\lim_{h\to0}\frac{e^h-1}{h}$$

Everything now hinges on $\lim_{h\to0}\dfrac{e^h-1}{h}$. Check it
numerically:

```python
import math

print("h            (e^h - 1)/h")
for h in [0.1, 0.01, 0.001, 0.0001, 0.00001]:
    print(f"{h:<12} {(math.exp(h)-1)/h:.8f}")
```

Output:

```
h            (e^h - 1)/h
0.1          1.05170918
0.01         1.00501671
0.001        1.00050017
0.0001       1.00005000
1e-05        1.00000500
```

This limit is **exactly 1** — and this is not a coincidence to be
separately proved so much as it is essentially **the defining
property of $e$ itself**: Lesson 1.7 introduced $e$ via the compound-
interest limit $e=\lim_{n\to\infty}(1+1/n)^n$, and that limit can be
shown (with more algebra than this lesson needs to spell out) to be
*exactly equivalent* to $\lim_{h\to0}\frac{e^h-1}{h}=1$ — two
different-looking limits that turn out to characterize the same
number. Taking this as established:

$$\frac{d}{dx}e^x = e^x\cdot1 = e^x$$

**$e^x$ is its own derivative** — the single fact Lesson 1.7 promised
would eventually explain why $e$ "appears everywhere." No other base
$a$ has this property exactly: for general $a$,

$$\frac{d}{dx}a^x = a^x\ln a$$

(derived below) — an extra factor of $\ln a$ appears for every base
except $a=e$, where $\ln e=1$ makes that factor vanish. This is the
precise, provable reason $e$ is singled out among all exponential
bases, not an arbitrary convention.

```python
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-2, 2, 300)
fig, ax = plt.subplots(figsize=(8,6))
for base, color in [(2, '#e74c3c'), (math.e, '#2980b9'), (3, '#27ae60')]:
    y = base**x
    dy_numeric = np.gradient(y, x)   # numerical derivative for visual comparison
    ax.plot(x, y, color=color, lw=2, label=f'${base:.3g}^x$' if base != math.e else '$e^x$')
    ax.plot(x, dy_numeric, color=color, lw=1, linestyle=':')
ax.legend(fontsize=9)
ax.set_title('$a^x$ (solid) and its derivative (dotted): only $e^x$ overlaps itself', fontsize=10)
plt.tight_layout()
plt.show()
```

**Walkthrough.** `np.gradient(y, x)` is a first appearance: it
computes a numerical derivative of an entire array at once (using
central differences internally, Lesson 3.7/5.3's technique, applied
elementwise across a whole sampled curve rather than at one point) —
a fast, practical way to visualize "the derivative" of sampled data
without symbolic differentiation. For $a=e$ specifically, the dotted
derivative curve should sit exactly on top of the solid function
curve; for $a=2$ or $a=3$, the two visibly separate — a direct visual
confirmation of $e^x$'s unique self-derivative property.

---

### The Derivative of $\ln x$: Implicit Differentiation, Reused

Let $y=\ln x$, so $e^y=x$ (the defining relationship between $\ln$
and $e^x$, Lesson 1.8). Differentiate both sides with respect to $x$,
using implicit differentiation (Lesson 5) — the left side needs the
chain rule, since $y$ is a function of $x$:

$$e^y\cdot\frac{dy}{dx} = 1 \quad\Longrightarrow\quad \frac{dy}{dx} = \frac{1}{e^y} = \frac{1}{x}$$

(using $e^y=x$ again in the last step). So:

$$\frac{d}{dx}\ln x = \frac{1}{x}$$

— a remarkably clean result, given how complicated $\ln x$ looked
when first introduced (Lesson 1.8).

```python
import sympy as sp

x = sp.symbols('x', positive=True)
print(f"d/dx[ln x] = {sp.diff(sp.log(x), x)}")

# Verify via implicit differentiation directly, the way it was derived
y = sp.symbols('y')
eq = sp.exp(y) - x
dy_dx = sp.idiff(eq, y, x)
print(f"Via implicit differentiation on e^y=x: dy/dx = {sp.simplify(dy_dx.subs(y, sp.log(x)))}")
```

**General exponential and logarithm bases**, via the chain rule
applied to $a^x=e^{x\ln a}$ (Lesson 1.9's change-of-base identity)
and $\log_a x=\frac{\ln x}{\ln a}$:

$$\frac{d}{dx}a^x = a^x\ln a \qquad \frac{d}{dx}\log_a x = \frac{1}{x\ln a}$$

```python
import sympy as sp

x, a = sp.symbols('x a', positive=True)
print(f"d/dx[a^x] = {sp.diff(a**x, x)}")
print(f"d/dx[log_a(x)] = {sp.diff(sp.log(x, a), x)}")
```

---

### Extending the Tree Differentiator

```python
def differentiate(expr):
    """Extends Lessons 5.4/5.5's differentiator with exp and ln."""
    kind = expr[0]
    if kind == 'const': return ('const', 0)
    if kind == 'var': return ('const', 1)
    if kind == 'add':
        _, l, r = expr
        return ('add', differentiate(l), differentiate(r))
    if kind == 'mul':
        _, l, r = expr
        return ('add', ('mul', differentiate(l), r), ('mul', l, differentiate(r)))
    if kind == 'pow':
        _, base, exponent = expr
        n = exponent[1]
        outer = ('mul', ('const', n), ('pow', base, ('const', n-1)))
        return ('mul', outer, differentiate(base))
    if kind == 'sin':
        _, inner = expr
        return ('mul', ('cos', inner), differentiate(inner))
    if kind == 'cos':
        _, inner = expr
        return ('mul', ('mul', ('const', -1), ('sin', inner)), differentiate(inner))
    if kind == 'exp':
        _, inner = expr
        # d/dx[e^u] = e^u * u'  -- the chain rule applied to e^x's self-derivative property
        return ('mul', ('exp', inner), differentiate(inner))
    if kind == 'ln':
        _, inner = expr
        # d/dx[ln(u)] = (1/u) * u'
        return ('mul', ('pow', inner, ('const', -1)), differentiate(inner))
    raise ValueError(f"Unknown expression kind: {kind}")

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
    if kind == 'exp': return math.exp(evaluate(expr[1], x_val))
    if kind == 'ln': return math.log(evaluate(expr[1], x_val))

# e^(x^2) at x=1: derivative is e^(x^2)*2x
expr = ('exp', ('pow', ('var',), ('const', 2)))
deriv = differentiate(expr)
print(f"d/dx[e^(x²)] at x=1: {evaluate(deriv, 1):.6f}")
print(f"Expected: e * 2 = {math.e*2:.6f}")
```

**Walkthrough.** The `'exp'` branch is a direct code translation of
$\frac{d}{dx}e^u=e^u\cdot u'$ — the chain rule applied to exactly the
self-derivative property proved above, with the inner derivative
`differentiate(inner)` supplied by recursion exactly as in every
prior chain-rule branch. The `'ln'` branch reuses the existing
`'pow'` machinery cleverly: $\frac{1}{u}$ is represented as
`('pow', inner, ('const', -1))` rather than adding a whole new
"reciprocal" node type — a small design choice that avoids
duplicating logic already present in the differentiator.

---

### Manufacturing Application: Rate of Change in Exponential Models

Lesson 1.13 introduced three exponential engineering models without
their rates of change: **Taylor tool-life equation**, **Newton's law
of cooling**, and **RC circuit discharge**. Each is now differentiable
directly.

**Newton's cooling**: $T(t)=T_{env}+(T_0-T_{env})e^{-kt}$. The
**cooling rate**:

$$T'(t) = (T_0-T_{env})\cdot(-k)e^{-kt} = -k(T(t)-T_{env})$$

— the rate of cooling is proportional to how far above ambient the
object currently is, exactly the physical law's own statement (the
differential equation Stage 7 will solve properly, previewed here as
a direct consequence of this lesson's exponential derivative).

```python
import sympy as sp

t, T0, Tenv, k = sp.symbols('t T0 T_env k', positive=True)
T = Tenv + (T0 - Tenv)*sp.exp(-k*t)
cooling_rate = sp.diff(T, t)
print(f"T(t) = {T}")
print(f"T'(t) = {sp.simplify(cooling_rate)}")

# Verify: does T'(t) equal -k(T(t) - T_env)?
claim = -k*(T - Tenv)
print(f"\nMatches -k(T-T_env): {sp.simplify(cooling_rate - claim) == 0}")

# Numeric example: coffee at 90°C, room at 20°C, k=0.05/min
values = {T0: 90, Tenv: 20, k: 0.05}
rate_at_10min = cooling_rate.subs(values).subs(t, 10)
print(f"\nCooling rate at t=10 min: {float(rate_at_10min):.4f} °C/min")
```

**Walkthrough.** This section introduces no new syntax — every tool
(`sp.diff`, `sp.simplify`, `.subs`) was already established earlier in
this stage. The point is entirely payoff: Lesson 1.13 presented these
models as formulas to evaluate at specific times; this lesson finally
answers "how fast is it changing right now," the genuinely more
useful engineering question for control systems, alarms (rate-of-
change cooling limits), and process monitoring.

---

## Connect the Pieces

Concrete trace: a cooling coffee cup, from formula to rate.

1. **The two trig limits** (Lesson 2) directly proved
   $\frac{d}{dx}\sin x=\cos x$ — no longer a "known building block,"
   fully derived.
2. **$e$'s self-derivative property**, the exact fact Lesson 1.7
   promised, proved via the limit $\lim(e^h-1)/h=1$ and confirmed
   both numerically and visually (only $e^x$'s dotted derivative
   curve overlaps its own solid curve).
3. **$\ln x$'s derivative**, via implicit differentiation (Lesson
   5.5), reused rather than re-derived from scratch.
4. **Applied to Lesson 1.13's cooling model**: the derivative reveals
   the cooling rate is proportional to the temperature gap — the
   physical law itself, recovered directly from differentiating the
   formula.

---

## Summary

**$\frac{d}{dx}\sin x=\cos x$**, proved fully using Lesson 2's two
trig limits — no longer assumed.

**$\frac{d}{dx}e^x=e^x$** — $e$'s defining calculus property, the
payoff of Lesson 1.7's teaser; general base: $\frac{d}{dx}a^x=a^x\ln a$.

**$\frac{d}{dx}\ln x=\frac1x$**, via implicit differentiation on
$e^y=x$ (Lesson 5, reused).

**Application**: Lesson 1.13's exponential engineering models now
have exact, symbolic rates of change — Newton's cooling rate is
proportional to the current temperature gap, recovered directly by
differentiating the formula.

**New Python/CS concepts:**
- `np.gradient` — numerical derivative of a whole sampled array at
  once
- Tree differentiator extended to `'exp'`/`'ln'`, reusing the
  existing `'pow'` machinery for reciprocals rather than duplicating
  logic

---

## Problems

### Math

**1.** Differentiate $f(x)=e^{3x}\sin x$ (product + chain rule).

<details><summary>Answer</summary>
$f'(x)=3e^{3x}\sin x + e^{3x}\cos x = e^{3x}(3\sin x+\cos x)$.
</details>

---

**2.** Differentiate $f(x)=\ln(x^2+1)$.

<details><summary>Answer</summary>
$f'(x)=\dfrac{2x}{x^2+1}$ (chain rule: $\frac{1}{u}\cdot u'$ with
$u=x^2+1$).
</details>

---

**3.** For Newton's cooling model, if $k$ doubles, how does the
cooling *rate* at a fixed temperature gap change? Use the derivative
formula $T'=-k(T-T_{env})$.

<details><summary>Answer</summary>
The rate is directly proportional to $k$, so doubling $k$ exactly
doubles the cooling rate at any given temperature gap.
</details>

---

### Code Challenges

**Challenge 1 — Trig/exp/log differentiator**

```python
def differentiate_v3(expr):
    """Reimplement this lesson's full differentiator."""
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
    if kind == 'exp': return math.exp(evaluate(expr[1], x_val))
    if kind == 'ln': return math.log(evaluate(expr[1], x_val))

# --- tests: do not modify ---
import math
expr = ('ln', ('pow', ('var',), ('const', 2)))  # ln(x^2)
deriv = differentiate_v3(expr)
assert math.isclose(evaluate(deriv, 3), 2/3, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — e's self-derivative, numerically confirmed**

```python
def confirm_e_property(candidate_bases, h=1e-6):
    """
    For each base a in candidate_bases, compute the numerical
    derivative of a^x at x=0 (i.e., (a^h - 1)/h) and return a dict
    {base: approx_derivative}. Identify which base gives ≈1.
    """
    pass

# --- tests: do not modify ---
import math
results = confirm_e_property([2, math.e, 3])
assert math.isclose(results[math.e], 1.0, abs_tol=1e-4)
assert results[2] < 1.0 < results[3]
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Cooling rate calculator**

```python
import sympy as sp

def cooling_rate_at(T0, Tenv, k, t):
    """Return the cooling rate at time t for Newton's cooling model."""
    pass

# --- tests: do not modify ---
rate = cooling_rate_at(90, 20, 0.05, 10)
import math
expected = -0.05 * (20 + 70*math.exp(-0.5) - 20)
assert math.isclose(rate, expected, abs_tol=1e-6)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Using the derivative of $\ln x$ and the chain rule, derive
**logarithmic differentiation** — a technique for differentiating
$f(x)=x^x$ (which is neither a plain power rule nor a plain
exponential rule case, since *both* the base and exponent depend on
$x$). Hint: take $\ln$ of both sides first, giving $\ln f(x)=x\ln x$,
then differentiate implicitly.

<details><summary>Answer</summary>
Let $y=x^x$. Take $\ln$ of both sides: $\ln y = x\ln x$. Differentiate
both sides with respect to $x$ (implicit differentiation on the left,
product rule on the right):
$$\frac{1}{y}\cdot\frac{dy}{dx} = \ln x + x\cdot\frac1x = \ln x+1$$
Solve for $dy/dx$:
$$\frac{dy}{dx} = y(\ln x+1) = x^x(\ln x+1) \qquad\blacksquare$$
This technique — take $\ln$ first, differentiate implicitly, solve
for the original derivative — is exactly why $\ln x$'s derivative
being the clean $1/x$ matters so much: it converts a genuinely
awkward "variable to a variable power" expression into an ordinary
sum, differentiable with tools already fully derived in this lesson.
</details>
