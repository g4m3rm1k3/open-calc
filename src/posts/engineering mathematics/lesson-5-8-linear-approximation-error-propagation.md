# Stage 5, Lesson 5.8 — Linear Approximation, Differentials, and Error Propagation
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

The tangent line (Lesson 5.3) isn't just a picture — near the point
of tangency, it's an excellent **approximation** of the curve itself,
because the curve and its tangent share the same value and the same
instantaneous rate of change at that one point. This lesson formalizes
that approximation, gives Leibniz's $dy/dx$ notation its final,
precise meaning as a ratio of **differentials** ($dy=f'(x)\,dx$,
rather than the vague "infinitesimal" language flagged as historically
shaky back in Lesson 5.1), and applies both directly to one of the
most practically important calculations in manufacturing engineering:
**error propagation** — if a measured dimension carries some
uncertainty, how much uncertainty does that produce in a quantity
computed from it? By the end of this lesson you can build a linear
approximation to any differentiable function, use differentials to
estimate small changes, and propagate a manufacturing tolerance
through a formula to predict the resulting uncertainty in a computed
result — a genuine, common tolerance-stack-up calculation.

---

## What You Need To Know First

- **Tangent lines, the derivative** — Lesson 5.3.
- **Differentiation rules** — Lessons 5.4–5.7, as needed for whatever
  formula's error is being propagated.
- **Floating-point/measurement tolerance language**, informally used
  since Lesson 3.2's `contains_point` tolerance checks.

---

## The Lesson

### Linear Approximation

The tangent line to $f$ at $x=a$ is:

$$L(x) = f(a) + f'(a)(x-a)$$

For $x$ **near** $a$, $L(x)\approx f(x)$ — the tangent line is the
*best possible* straight-line approximation to $f$ at that point,
because it matches both $f$'s value and its instantaneous rate of
change there.

**Hand-worked example**: approximate $\sqrt{4.1}$ without a
calculator, using $f(x)=\sqrt x$ and $a=4$ (a nearby point with a
clean square root).

$$f(4)=2 \qquad f'(x)=\frac{1}{2\sqrt x} \Rightarrow f'(4)=\frac14$$
$$L(4.1) = 2 + \frac14(4.1-4) = 2+\frac14(0.1) = 2.025$$

```python
import math

exact = math.sqrt(4.1)
approx = 2 + 0.25*(4.1 - 4)
print(f"Linear approximation: {approx}")
print(f"Exact value:          {exact}")
print(f"Error:                {abs(exact-approx):.6f}")
```

Output:

```
Linear approximation: 2.025
Exact value:          2.0248456731316587
Error:                0.000154
```

A tiny error, from a calculation requiring no square root at all —
just one derivative evaluation and one multiplication.

---

### Differentials

Leibniz's notation $\dfrac{dy}{dx}$ can now be given a genuine,
precise meaning rather than treated as an inseparable symbol standing
for "the derivative": define $dx$ as an independent small change in
$x$, and define the **differential** $dy$ as:

$$dy = f'(x)\,dx$$

$dy$ is the tangent line's predicted change in $y$; the **actual**
change $\Delta y=f(x+dx)-f(x)$ is generally close to but not exactly
$dy$ — the gap between them is precisely the linear approximation's
error, shrinking faster than $dx$ itself as $dx\to0$ (a fact Lesson
5.11's Taylor series will quantify exactly).

```python
import sympy as sp

x, dx = sp.symbols('x dx')
f = sp.sqrt(x)
dy = sp.diff(f, x) * dx

dy_at_4 = dy.subs({x: 4, dx: 0.1})
print(f"dy = f'(4)*dx = {dy_at_4}")

delta_y = f.subs(x, 4.1) - f.subs(x, 4)
print(f"Δy (actual change) = {float(delta_y):.6f}")
print(f"dy (differential estimate) = {float(dy_at_4):.6f}")
```

---

### Error Propagation

**The core engineering question**: if a measured or manufactured
quantity $x$ has some uncertainty $\Delta x$ (a tolerance, a
measurement error), how much uncertainty results in a computed
quantity $f(x)$? Linear approximation gives the direct answer:

$$\Delta f \approx f'(x)\,\Delta x$$

**Relative error** (often more meaningful in engineering than
absolute error) follows by dividing both sides by $f(x)$:

$$\frac{\Delta f}{f(x)} \approx \frac{f'(x)}{f(x)}\Delta x$$

**Hand-worked example**: a cylindrical shaft's cross-sectional area
is $A=\pi r^2$. If the radius is measured as $r=10\text{mm}\pm
0.05\text{mm}$, how much uncertainty results in the computed area?

$$\frac{dA}{dr} = 2\pi r \Rightarrow \Delta A \approx 2\pi(10)(0.05) = \pi\approx3.1416\text{mm}^2$$

```python
import sympy as sp

r, dr = sp.symbols('r dr', positive=True)
A = sp.pi * r**2
dA = sp.diff(A, r) * dr

result = dA.subs({r: 10, dr: 0.05})
print(f"ΔA ≈ {float(result):.4f} mm²")

nominal_A = float(A.subs(r, 10))
print(f"Nominal area: {nominal_A:.4f} mm²")
print(f"Relative error: {float(result)/nominal_A*100:.3f}%")
```

**Verify against the exact difference**, the same cross-check habit
from every prior lesson in this stage:

```python
A_func = lambda r_val: math.pi * r_val**2
exact_change = A_func(10.05) - A_func(10)
print(f"\nExact ΔA (computed directly): {exact_change:.4f} mm²")
print(f"Linear approximation ΔA:       {float(result):.4f} mm²")
```

The two nearly match — confirming the linear approximation is a
reliable stand-in for a full recomputation, for small tolerances.

---

### How Good Is the Approximation? Checking the Range of Validity

Linear approximation degrades as $\Delta x$ grows — worth checking
explicitly rather than trusting blindly, especially since real
manufacturing tolerances vary enormously in size relative to the
nominal dimension.

```python
import numpy as np
import matplotlib.pyplot as plt

r0 = 10
dr_values = np.linspace(0.001, 3, 100)

exact_changes = [math.pi*(r0+dr)**2 - math.pi*r0**2 for dr in dr_values]
linear_changes = [2*math.pi*r0*dr for dr in dr_values]

fig, ax = plt.subplots(figsize=(8,6))
ax.plot(dr_values, exact_changes, color='#2980b9', lw=2, label='Exact ΔA')
ax.plot(dr_values, linear_changes, color='#e74c3c', lw=2, linestyle='--',
        label='Linear approximation')
ax.set_xlabel('Δr (mm)'); ax.set_ylabel('ΔA (mm²)')
ax.legend(fontsize=10)
ax.set_title('Linear approximation degrades as Δr grows', fontsize=11)
plt.tight_layout()
plt.show()

# Quantify: at what Δr does the approximation's relative error exceed 5%?
for dr in dr_values:
    exact = math.pi*(r0+dr)**2 - math.pi*r0**2
    linear = 2*math.pi*r0*dr
    rel_error = abs(exact-linear)/exact
    if rel_error > 0.05:
        print(f"Approximation exceeds 5% relative error at Δr ≈ {dr:.4f} mm "
              f"({dr/r0*100:.2f}% of nominal radius)")
        break
```

**Walkthrough.** This section makes an honest, quantified claim about
*when* the tool built earlier in this lesson can be trusted, rather
than presenting linear approximation as universally reliable — a
genuinely important engineering habit: a tolerance that's a small
fraction of the nominal dimension (typical for precision manufacturing)
keeps this technique accurate; a tolerance approaching the dimension's
own size (unusual, but not impossible in rough machining or casting)
would need the full nonlinear calculation instead.

---

### Manufacturing Application: Tolerance Stack-Up on a Stress Formula

A bracket's stress under a known load $F$ is $\sigma = F/A$, where
the cross-sectional area $A=w\cdot t$ (width times thickness) is
manufactured with tolerances on both dimensions. Propagate both
tolerances through to find the resulting stress uncertainty —
treating this, for now, as two separate single-variable propagations
(a genuine simplification; the fully correct multivariable treatment
needs partial derivatives, a forward reference to Stage 7/10, though
the single-variable version used here, adding the two contributions
in quadrature, is a standard first-order engineering approximation).

```python
import sympy as sp

F, w, t, dw, dt = sp.symbols('F w t dw dt', positive=True)
A = w * t
sigma = F / A

# Sensitivity of sigma to each dimension, holding the other fixed
d_sigma_dw = sp.diff(sigma, w)
d_sigma_dt = sp.diff(sigma, t)

print(f"∂σ/∂w = {d_sigma_dw}")
print(f"∂σ/∂t = {d_sigma_dt}")

values = {F: 5000, w: 20, t: 5}
sensitivity_w = float(d_sigma_dw.subs(values))
sensitivity_t = float(d_sigma_dt.subs(values))

tol_w = 0.1   # mm
tol_t = 0.05  # mm

delta_sigma_w = abs(sensitivity_w) * tol_w
delta_sigma_t = abs(sensitivity_t) * tol_t

# Root-sum-square combination: standard first-order approach for
# independent error sources (assumes w and t tolerances are uncorrelated)
total_uncertainty = math.sqrt(delta_sigma_w**2 + delta_sigma_t**2)

nominal_sigma = float(sigma.subs(values))
print(f"\nNominal stress: {nominal_sigma:.4f} MPa")
print(f"Contribution from width tolerance:     ±{delta_sigma_w:.4f} MPa")
print(f"Contribution from thickness tolerance: ±{delta_sigma_t:.4f} MPa")
print(f"Combined uncertainty (RSS): ±{total_uncertainty:.4f} MPa")
print(f"Stress range: {nominal_sigma-total_uncertainty:.4f} to {nominal_sigma+total_uncertainty:.4f} MPa")
```

**Walkthrough.** `sp.diff(sigma, w)` computes the **sensitivity** of
stress to width — how much $\sigma$ changes per unit change in $w$,
holding $t$ fixed, which is exactly the single-variable derivative
concept from this lesson applied with one variable temporarily
treated as a constant (a genuine, if informal, first taste of
**partial derivatives**, formalized properly in Stage 7). Combining
the two individual uncertainty contributions via
**root-sum-square** ($\sqrt{a^2+b^2}$, rather than simply adding
them) is the standard statistical treatment for independent,
uncorrelated error sources — flagged honestly as an assumption
(independence) rather than a universal law, since correlated
tolerances (e.g., two dimensions cut by the same worn tool) would need
a different combination rule.

---

## Connect the Pieces

Concrete trace: stress uncertainty from width and thickness
tolerances on a loaded bracket.

1. **Linear approximation**: $\Delta\sigma\approx\frac{\partial
   \sigma}{\partial w}\Delta w$ for each dimension separately — the
   tangent-line idea, applied twice.
2. **Differentials**: each `d_sigma_dw * tol_w` term is precisely
   $d\sigma=\sigma'(w)\,dw$, this lesson's differential notation, made
   concrete.
3. **Validity check**: the earlier section's degradation analysis
   justifies trusting this linear approach, given that manufacturing
   tolerances are typically small relative to nominal dimensions.
4. **Combination**: root-sum-square combines independent
   contributions into one overall uncertainty band on the final
   stress prediction — a genuine, standard tolerance-stack-up result.

---

## Summary

**Linear approximation**: $L(x)=f(a)+f'(a)(x-a)\approx f(x)$ near
$a$.

**Differentials**: $dy=f'(x)\,dx$ — Leibniz notation, finally given
precise, non-infinitesimal meaning.

**Error propagation**: $\Delta f\approx f'(x)\Delta x$ — the direct
engineering payoff, used to propagate measurement/manufacturing
tolerances through a formula.

**Validity**: linear approximation degrades as $\Delta x$ grows
relative to the nominal value — checkable explicitly, not assumed.

**Application**: tolerance stack-up on a stress formula, combining
independent dimensional tolerances via root-sum-square.

**New Python/CS concepts:**
- Differential-based sensitivity analysis (`sp.diff` used to compute
  a "how sensitive is this to that input" coefficient)
- Root-sum-square combination of independent uncertainty
  contributions

---

## Problems

### Math

**1.** Use linear approximation to estimate $(2.01)^5$, based on
$f(x)=x^5$ at $a=2$.

<details><summary>Answer</summary>
$f(2)=32$, $f'(x)=5x^4 \Rightarrow f'(2)=80$.
$L(2.01)=32+80(0.01)=32.8$.
</details>

---

**2.** A cube's side length is measured as $5\text{cm}\pm0.02\text{cm}$.
Estimate the resulting uncertainty in its volume ($V=s^3$).

<details><summary>Answer</summary>
$dV=3s^2\,ds=3(25)(0.02)=1.5\text{cm}^3$.
</details>

---

**3.** For the stress formula $\sigma=F/A$ with $F$ fixed, is
$\sigma$ more sensitive to a small change in $A$ when $A$ is small or
large? (Consider $d\sigma/dA=-F/A^2$.)

<details><summary>Answer</summary>
$|d\sigma/dA|=F/A^2$ grows as $A$ shrinks — stress is *more* sensitive
to area changes when the area is already small, a real reason thin
sections in a design carry disproportionate manufacturing risk.
</details>

---

### Code Challenges

**Challenge 1 — Linear approximator**

```python
import sympy as sp

def linear_approximate(f_expr, var, a, x_target):
    """Return L(x_target) using the tangent line at x=a."""
    pass

# --- tests: do not modify ---
x = sp.symbols('x')
result = linear_approximate(sp.sqrt(x), x, 4, 4.1)
assert math.isclose(float(result), 2.025, abs_tol=1e-9)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Error propagator**

```python
import sympy as sp

def propagate_error(f_expr, var, nominal_value, tolerance):
    """Return the estimated Δf using differentials."""
    pass

# --- tests: do not modify ---
r = sp.symbols('r', positive=True)
result = propagate_error(sp.pi*r**2, r, 10, 0.05)
assert math.isclose(float(result), math.pi, abs_tol=1e-6)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Multi-variable tolerance stack-up (RSS)**

```python
import sympy as sp

def stack_up_rss(f_expr, variables_and_tolerances, nominal_values):
    """
    variables_and_tolerances: dict {symbol: tolerance}.
    nominal_values: dict {symbol: value}.
    Return (nominal_f, total_uncertainty) using RSS combination of
    each variable's individual contribution.
    """
    pass

# --- tests: do not modify ---
F, w, t = sp.symbols('F w t', positive=True)
sigma = F/(w*t)
nominal, uncertainty = stack_up_rss(
    sigma, {w: 0.1, t: 0.05}, {F: 5000, w: 20, t: 5})
assert math.isclose(nominal, 50.0, abs_tol=1e-6)
assert uncertainty > 0
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** For $f(x)=1/x$, show that the **relative** error
$\Delta f/f$ has an especially clean relationship to the relative
error $\Delta x/x$ — specifically, prove $\dfrac{\Delta f}{f}\approx
-\dfrac{\Delta x}{x}$ (equal in magnitude, opposite sign). Explain
why this matters for any formula involving a quantity in the
denominator (e.g., stress $=F/A$: a 1% error in $A$ produces
approximately a 1% error in $\sigma$, just in the opposite direction).

<details><summary>Answer</summary>
$f(x)=1/x \Rightarrow f'(x)=-1/x^2$. Then
$$\Delta f \approx f'(x)\Delta x = -\frac{\Delta x}{x^2}$$
Relative error:
$$\frac{\Delta f}{f} \approx \frac{-\Delta x/x^2}{1/x} = -\frac{\Delta x}{x} \qquad\blacksquare$$
This is exactly why, in the stress formula $\sigma=F/A$, a 1%
manufacturing error in cross-sectional area $A$ propagates to
approximately a 1% error in $\sigma$ (opposite sign — an
under-sized area produces over-estimated stress) — a clean,
memorable rule of thumb directly useful for quick tolerance
sensitivity checks without running the full symbolic calculation
every time.
</details>
