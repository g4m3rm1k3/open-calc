# M-019 — Differentiation Rules

**Phase 6 · Differential Calculus · Lesson 2 of 3**
**Pillar: Approximation** · *Every rule is a theorem — derived once, used forever*

---

## What You Will Build

A Python program that computes derivatives using rules and checks them against numerical central differences. You will see the product rule and chain rule derived from the limit definition, and understand implicit differentiation as an application of the chain rule.

---

## What You Need to Know First

- M-018: derivative as a limit (the rules are proved from this definition)
- M-010: function composition (chain rule is about composed functions)

---

> **Quick Check — try to answer before reading:**
>
> 1. Is $\frac{d}{dx}[f(x)g(x)] = f'(x) g'(x)$? Test with $f = x^2$ and $g = x^3$.
> 2. What is the derivative of $f(g(x))$ in terms of $f'$ and $g'$?
> 3. If $y$ is a function of $x$ implicitly defined by $x^2 + y^2 = 1$, what is $dy/dx$?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Product Rule

**Theorem:** $(fg)' = f'g + fg'$

**Proof from the definition:**

$$\lim_{h \to 0} \frac{f(x+h)g(x+h) - f(x)g(x)}{h}$$

Add and subtract the term $f(x)g(x+h)$:

$$= \lim_{h \to 0} \left[\frac{f(x+h) - f(x)}{h} \cdot g(x+h) + f(x) \cdot \frac{g(x+h) - g(x)}{h}\right]$$

Taking the limit:
- $\frac{f(x+h)-f(x)}{h} \to f'(x)$
- $g(x+h) \to g(x)$ (by continuity of $g$, which follows from differentiability)
- $\frac{g(x+h)-g(x)}{h} \to g'(x)$
- $f(x) \to f(x)$

Therefore: $(fg)'(x) = f'(x) \cdot g(x) + f(x) \cdot g'(x)$. $\square$

**Intuition:** $fg$ changes because $f$ changes (while $g$ stays fixed, contributing $f'g$) and because $g$ changes (while $f$ stays fixed, contributing $fg'$).

**The quotient rule:** $(f/g)' = (f'g - fg')/g^2$ — proved by writing $f/g = f \cdot g^{-1}$ and applying product rule + chain rule (below).

---

### The Chain Rule

**Theorem:** $(f \circ g)'(x) = f'(g(x)) \cdot g'(x)$

**Intuition:** The rate of change of $f(g(x))$ is how fast $f$ changes (at $g(x)$) times how fast $g(x)$ changes. Two rates multiplied.

**Proof sketch** (rigorous version in Phase 16):

$$\frac{f(g(x+h)) - f(g(x))}{h} = \frac{f(g(x+h)) - f(g(x))}{g(x+h) - g(x)} \cdot \frac{g(x+h) - g(x)}{h}$$

(valid when $g(x+h) \neq g(x)$). The first factor $\to f'(g(x))$ as $h \to 0$; the second $\to g'(x)$. $\square$

(When $g(x+h) = g(x)$ for some $h$, the argument needs care — the rigorous proof in Phase 16 handles this.)

---

### The Power Rule for All Real Exponents

$$\frac{d}{dx}[x^n] = nx^{n-1}$$

- **Integer $n$:** Proved by induction using the product rule.
- **Rational $n = p/q$:** Use implicit differentiation on $y^q = x^p$.
- **Real $n$:** Write $x^n = e^{n\ln x}$ and differentiate using chain rule:

$$\frac{d}{dx}[e^{n\ln x}] = e^{n\ln x} \cdot \frac{n}{x} = x^n \cdot \frac{n}{x} = nx^{n-1} \quad \square$$

---

### Implicit Differentiation

When $y$ is defined implicitly by an equation $F(x, y) = 0$, differentiate both sides with respect to $x$, treating $y$ as a function of $x$ and applying the chain rule wherever $y$ appears.

**Example:** Find $dy/dx$ for the unit circle $x^2 + y^2 = 1$.

Differentiate both sides with respect to $x$:

$$2x + 2y \frac{dy}{dx} = 0 \implies \frac{dy}{dx} = -\frac{x}{y}$$

**Verification:** At the point $(3/5, 4/5)$ (on the unit circle): $dy/dx = -3/4$. The tangent line at this point has slope $-3/4$, which we can verify geometrically — the radius vector $(3/5, 4/5)$ has slope $4/3$, and the tangent is perpendicular to the radius, so slope $= -3/4$. ✓

**Why implicit differentiation works:** It is just the chain rule. When we write $\frac{d}{dx}[y^2] = 2y \frac{dy}{dx}$, we are applying the chain rule to $g(x) = y(x)$: $(y^2)' = 2y \cdot y'$.

```python
import math

# Verify differentiation rules numerically

def central_diff(f, x, h=1e-7):
    return (f(x + h) - f(x - h)) / (2 * h)

def verify_rule(rule_name, f, f_prime, test_x_values):
    print(f"Rule: {rule_name}")
    max_err = 0
    for x in test_x_values:
        numerical = central_diff(f, x)
        exact     = f_prime(x)
        err = abs(numerical - exact)
        max_err = max(max_err, err)
    print(f"  Max error over test points: {max_err:.2e}  {'✓' if max_err < 1e-8 else '✗'}")

print("=== Differentiation Rules Verification ===")
print()

test_x = [0.5, 1.0, 1.5, 2.0, -0.5]

# Product rule: d/dx[x^2 * sin(x)] = 2x*sin(x) + x^2*cos(x)
verify_rule(
    "d/dx[x² · sin(x)] = 2x·sin(x) + x²·cos(x)",
    f       = lambda x: x**2 * math.sin(x),
    f_prime = lambda x: 2*x*math.sin(x) + x**2*math.cos(x),
    test_x_values = test_x
)

# Chain rule: d/dx[sin(x^2)] = cos(x^2) * 2x
verify_rule(
    "d/dx[sin(x²)] = cos(x²) · 2x",
    f       = lambda x: math.sin(x**2),
    f_prime = lambda x: math.cos(x**2) * 2 * x,
    test_x_values = test_x
)

# Chain rule + exponential: d/dx[e^(3x^2)] = 6x * e^(3x^2)
verify_rule(
    "d/dx[e^(3x²)] = 6x · e^(3x²)",
    f       = lambda x: math.exp(3*x**2),
    f_prime = lambda x: 6*x * math.exp(3*x**2),
    test_x_values = test_x
)

# Power rule (real exponent): d/dx[x^π] = π * x^(π-1)
verify_rule(
    "d/dx[x^π] = π · x^(π-1)  (real exponent)",
    f       = lambda x: x**math.pi,
    f_prime = lambda x: math.pi * x**(math.pi - 1),
    test_x_values = [0.5, 1.0, 1.5, 2.0, 3.0]     # positive x only
)

# Quotient rule: d/dx[sin(x)/x] = (x*cos(x) - sin(x)) / x^2
verify_rule(
    "d/dx[sin(x)/x] = (x·cos(x) - sin(x)) / x²",
    f       = lambda x: math.sin(x) / x,
    f_prime = lambda x: (x*math.cos(x) - math.sin(x)) / x**2,
    test_x_values = [0.5, 1.0, 2.0, -1.0]           # avoid x=0
)

print()

# Implicit differentiation: unit circle x^2 + y^2 = 1
# dy/dx = -x/y
print("=== Implicit Differentiation: unit circle x²+y²=1 ===")
print("dy/dx = -x/y")
print()
circle_points = [(0, 1), (3/5, 4/5), (1/math.sqrt(2), 1/math.sqrt(2)), (0, -1)]
for (x, y) in circle_points:
    if abs(x**2 + y**2 - 1) > 1e-10:
        print(f"  ({x:.4f}, {y:.4f}) not on unit circle, skipping")
        continue
    if abs(y) < 1e-12:
        print(f"  ({x:.4f}, {y:.4f}) dy/dx undefined (vertical tangent)")
        continue
    slope = -x / y
    # Verify: radius vector has slope y/x, tangent should be perpendicular (-x/y)
    if abs(x) > 1e-12:
        radius_slope = y / x
        perp_check = abs(slope * radius_slope + 1) < 1e-10   # perpendicular: m1*m2 = -1
    else:
        perp_check = True  # x=0: vertical radius, horizontal tangent
    print(f"  ({x:.4f}, {y:.4f}): dy/dx = {slope:.6f}  perpendicular to radius? {'✓' if perp_check else '✗'}")

print()

# Summary table of standard derivatives
print("=== Standard Derivatives (all derived, not memorised) ===")
print(f"{'Function':>20}  {'Derivative':>20}")
print("-" * 44)
rules = [
    ("xⁿ",         "nxⁿ⁻¹"),
    ("eˣ",         "eˣ"),
    ("ln x",       "1/x"),
    ("sin x",      "cos x"),
    ("cos x",      "-sin x"),
    ("tan x",      "sec²x"),
    ("aˣ",         "(ln a)aˣ"),
    ("f·g",        "f'g + fg'"),
    ("f∘g",        "f'(g)·g'"),
]
for (fn, deriv) in rules:
    print(f"{fn:>20}  {deriv:>20}")
```

**Walkthrough:** The code uses **central differences** $\frac{f(x+h) - f(x-h)}{2h}$ rather than forward differences. Central differences have error $O(h^2)$ (twice as accurate as forward differences, which have error $O(h)$) — this is why `h=1e-7` gives errors at the $10^{-11}$ level. The implicit differentiation check verifies geometrically that the tangent is perpendicular to the radius — using the fact that perpendicular lines have slopes satisfying $m_1 \cdot m_2 = -1$.

---

## Connect the Pieces

**Backwards:** Product rule and chain rule both reduce to M-018 (derivative as a limit).

**Forwards:**
- M-020 (Mean Value Theorem): requires differentiability — uses the rules proved here.
- M-022 (Fundamental Theorem): FTC Part 1 proof uses the chain rule (the integral is differentiated as a function of its upper limit).
- M-025 (Taylor series): the $n$th Taylor coefficient is $\frac{f^{(n)}(0)}{n!}$ — requires computing $n$th derivatives using the rules.
- M-026 (Multivariable): partial derivatives are single-variable derivatives with other variables held fixed; chain rule extends to the total derivative.

---

## What Breaks Without This

Without the product rule:
- You cannot differentiate $x^2 \sin x$, $e^x \cos x$, or any product.
- Finance (option pricing, continuous compounding) models products of functions — no derivative means no sensitivity analysis.

Without the chain rule:
- You cannot differentiate $\sin(x^2)$, $e^{-x^2}$, or any composition.
- The normal distribution PDF is $e^{-x^2/2}$ — its derivative and integral require the chain rule.
- Backpropagation in neural networks is the chain rule applied to a composition of layers.

---

## Definition of Done

- [ ] You can derive the product rule from the limit definition (the add-and-subtract trick)
- [ ] You can state the chain rule and compute $(f \circ g)'$ for at least three examples
- [ ] You can perform implicit differentiation on $x^2 + y^2 = 1$ and verify geometrically
- [ ] You can compute the derivative of $x^n$ for non-integer $n$ using $x^n = e^{n\ln x}$
- [ ] You ran the Python code and understand the difference between forward and central differences

**Proof reconstruction (Sunday):** Derive the product rule from the limit definition. Then: find $dy/dx$ for $x^3 + y^3 = 1$ using implicit differentiation.

---

## Answers to Quick Check

1. No. $(x^2 \cdot x^3)' = (x^5)' = 5x^4$. But $f'g' = 2x \cdot 3x^2 = 6x^3 \neq 5x^4$. The product rule is $(fg)' = f'g + fg' = 2x \cdot x^3 + x^2 \cdot 3x^2 = 2x^4 + 3x^4 = 5x^4$ ✓.
2. $(f \circ g)'(x) = f'(g(x)) \cdot g'(x)$ — the chain rule.
3. Differentiate $x^2 + y^2 = 1$: $2x + 2y(dy/dx) = 0$, so $dy/dx = -x/y$.
