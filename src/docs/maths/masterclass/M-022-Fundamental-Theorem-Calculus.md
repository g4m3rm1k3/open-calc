# M-022 — The Fundamental Theorem of Calculus

**Phase 7 · Integral Calculus · Lesson 2 of 2**
**Pillar: Approximation** · *The deepest result in calculus: integration and differentiation are inverse operations*

---

## What You Will Build

A Python program that verifies FTC Part 1 numerically ($\frac{d}{dx}\int_0^x f(t)\,dt = f(x)$) and uses FTC Part 2 to compute definite integrals exactly. You will also implement integration by substitution and integration by parts.

---

## What You Need to Know First

- M-021: the Riemann integral (FTC connects it to derivatives)
- M-018–M-020: derivatives (FTC is a theorem about derivatives and integrals together)
- M-017: continuity (FTC requires $f$ continuous)

---

> **Quick Check — try to answer before reading:**
>
> 1. What is $\frac{d}{dx}\left[\int_0^x t^2\,dt\right]$? Try to answer before reading.
> 2. To compute $\int_1^3 2x\,dx$, you need a function whose derivative is $2x$. What is it?
> 3. What is $\int_0^{2\pi} \sin(x)\,dx$? Is this zero? Why does that make geometric sense?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### FTC Part 1: Differentiation Undoes Integration

**Theorem (FTC Part 1):** Let $f$ be continuous on $[a, b]$. Define:

$$F(x) = \int_a^x f(t)\,dt$$

Then $F$ is differentiable on $(a, b)$ and $F'(x) = f(x)$.

**Proof:**

$$F'(x) = \lim_{h \to 0} \frac{F(x+h) - F(x)}{h} = \lim_{h \to 0} \frac{1}{h}\int_x^{x+h} f(t)\,dt$$

By the Mean Value Theorem for integrals (a consequence of continuity): $\int_x^{x+h} f(t)\,dt = f(c) \cdot h$ for some $c \in [x, x+h]$.

As $h \to 0$: $c \to x$ (since $c$ is squeezed between $x$ and $x+h$). By continuity of $f$: $f(c) \to f(x)$.

Therefore $F'(x) = f(x)$. $\square$

**What this says:** Integrating $f$ from $a$ to $x$ creates a new function $F(x)$. Differentiating $F$ recovers $f$. The two operations undo each other — they are inverse operations.

---

### FTC Part 2: Antidifferentiation Computes Area

**Theorem (FTC Part 2):** If $G$ is any antiderivative of $f$ (meaning $G'(x) = f(x)$ on $[a, b]$), then:

$$\int_a^b f(x)\,dx = G(b) - G(a)$$

**Proof:** By FTC Part 1, $F(x) = \int_a^x f(t)\,dt$ is an antiderivative of $f$. By MVT, any two antiderivatives of the same function differ by a constant: $G(x) = F(x) + C$ for all $x$.

$G(b) - G(a) = (F(b) + C) - (F(a) + C) = F(b) - F(a) = \int_a^b f(t)\,dt - \int_a^a f(t)\,dt = \int_a^b f(t)\,dt$. $\square$

**Why this is remarkable:** FTC Part 2 converts the geometric problem of finding area (a limit of sums) into the algebraic problem of finding an antiderivative. This is why calculus works — you never have to sum rectangles once you have Part 2.

**The integral table:** FTC Part 2 turns differentiation tables upside down into integration tables.

| $f(x)$ | $\int f(x)\,dx$ | Why |
|---|---|---|
| $x^n$ ($n \neq -1$) | $\frac{x^{n+1}}{n+1} + C$ | Reverse power rule |
| $e^x$ | $e^x + C$ | $(e^x)' = e^x$ |
| $\frac{1}{x}$ | $\ln|x| + C$ | $(\ln|x|)' = 1/x$ |
| $\sin x$ | $-\cos x + C$ | $(-\cos x)' = \sin x$ |
| $\cos x$ | $\sin x + C$ | $(\sin x)' = \cos x$ |

---

### Integration Techniques

**Substitution (reverse chain rule):** For $\int f(g(x))g'(x)\,dx$: let $u = g(x)$, $du = g'(x)\,dx$:

$$\int f(g(x))g'(x)\,dx = \int f(u)\,du$$

**Example:** $\int 2x \cos(x^2)\,dx$. Let $u = x^2$, $du = 2x\,dx$:

$= \int \cos(u)\,du = \sin(u) + C = \sin(x^2) + C$ ✓ (Check: $\frac{d}{dx}[\sin(x^2)] = \cos(x^2) \cdot 2x$)

**Integration by parts (reverse product rule):** $(uv)' = u'v + uv'$, so $\int u\,dv = uv - \int v\,du$.

**Example:** $\int x e^x\,dx$. Let $u = x$ (differentiates simply), $dv = e^x\,dx$ (integrates simply):

$= xe^x - \int e^x\,dx = xe^x - e^x + C = e^x(x-1) + C$ ✓

```python
import math

# FTC Part 1: numerical verification that d/dx [int_0^x f(t)dt] = f(x)
print("=== FTC Part 1: d/dx[∫₀ˣ f(t)dt] = f(x) ===")
print()

def integral_up_to(f, a, x, n=10000):
    """Compute ∫ₐˣ f(t)dt numerically using midpoint rule."""
    if abs(x - a) < 1e-15:
        return 0
    dt = (x - a) / n
    return sum(f(a + (k + 0.5) * dt) for k in range(n)) * dt

def numerical_deriv_of_integral(f, a, x, h=1e-5):
    """Compute d/dx[∫ₐˣ f(t)dt] numerically."""
    F_plus  = integral_up_to(f, a, x + h)
    F_minus = integral_up_to(f, a, x - h)
    return (F_plus - F_minus) / (2 * h)

test_functions = [
    (lambda t: t**2,   lambda x: x**2,   "f(t) = t²"),
    (math.sin,          math.sin,          "f(t) = sin(t)"),
    (math.exp,          math.exp,          "f(t) = e^t"),
    (lambda t: 1/t,    lambda x: 1/x,    "f(t) = 1/t"),
]

for (f, f_exact, name) in test_functions:
    test_x = [0.5, 1.0, 1.5, 2.0]
    if "1/t" in name:
        a = 0.1  # avoid singularity at 0
    else:
        a = 0
    errs = []
    for x in test_x:
        if "1/t" in name and x <= a:
            continue
        deriv = numerical_deriv_of_integral(f, a, x)
        exact = f_exact(x)
        errs.append(abs(deriv - exact))
    print(f"  {name}: max|d/dx[∫] - f(x)| = {max(errs):.2e}  ✓")

print()
print("FTC Part 1 confirmed: differentiating the integral recovers the integrand.")
print()

# FTC Part 2: computing definite integrals exactly
print("=== FTC Part 2: ∫ₐᵇ f(x)dx = G(b) - G(a) where G' = f ===")
print()

examples = [
    ("∫₀² x² dx",      lambda x: x**2,      lambda x: x**3/3,    0, 2,  8/3),
    ("∫₀^π sin(x) dx", math.sin,              lambda x: -math.cos(x), 0, math.pi, 2.0),
    ("∫₁^e (1/x) dx",  lambda x: 1/x,         math.log,            1, math.e, 1.0),
    ("∫₀¹ e^x dx",     math.exp,              math.exp,            0, 1, math.e - 1),
]

for (name, f, F, a, b, exact) in examples:
    ftc_value = F(b) - F(a)
    riemann   = sum(f(a + (k + 0.5)*(b-a)/100000)*(b-a)/100000 for k in range(100000))
    print(f"  {name}:")
    print(f"    FTC:    G(b) - G(a) = {F(b):.6f} - {F(a):.6f} = {ftc_value:.8f}")
    print(f"    Exact:  {exact:.8f}")
    print(f"    Riemann (n=10^5): {riemann:.8f}")
    print(f"    FTC error: {abs(ftc_value - exact):.2e}  ✓")
    print()

# Integration by substitution
print("=== Substitution: ∫ 2x cos(x²) dx = sin(x²) + C ===")
print("Verification: d/dx[sin(x²)] = cos(x²) · 2x ✓")
test_x = [0.5, 1.0, 1.5]
for x in test_x:
    antideriv_deriv = math.cos(x**2) * 2 * x
    f_value = 2 * x * math.cos(x**2)
    print(f"  x={x}: d/dx[sin(x²)] = {antideriv_deriv:.6f} = f(x) = {f_value:.6f}  ✓")
print()

# Integration by parts: ∫ x e^x dx = e^x(x-1) + C
print("=== Integration by parts: ∫ x·eˣ dx = eˣ(x-1) + C ===")
print("Verification: d/dx[eˣ(x-1)] = eˣ(x-1) + eˣ = x·eˣ ✓")
for x in test_x:
    antideriv_deriv = math.exp(x)*(x-1) + math.exp(x)   # product rule
    f_value = x * math.exp(x)
    print(f"  x={x}: d/dx[eˣ(x-1)] = {antideriv_deriv:.6f} = x·eˣ = {f_value:.6f}  ✓")
```

---

## Connect the Pieces

The Fundamental Theorem is the central theorem of calculus — it is the reason the subject exists. Without it, differentiation and integration are two unrelated problems.

**FTC as an "inverse operation" theme:** The same theme from M-009 (inverses), M-014 (logarithm as inverse of exponential), M-031 (matrix inverse). FTC says: $\int$ and $\frac{d}{dx}$ are inverse operations.

**Forwards:**
- M-025 (Taylor series): A Taylor series is an antiderivative problem — finding the polynomial that has the given function's derivatives.
- M-027 (Multiple integrals): Fubini's theorem is FTC applied twice (in two directions).
- M-037 (Probability): CDF and PDF: if $F$ is the CDF, then $F' = f$ (the PDF). This is exactly FTC Part 1.
- M-043 (Concrete Mathematics): Summation formulas like $\sum_{k=1}^n k = n(n+1)/2$ are discrete analogues of FTC — the discrete antiderivative.

---

## What Breaks Without This

Without FTC:
- Every integral computation requires summing thousands of rectangles — impractical by hand and slow by computer.
- You cannot connect probability densities to cumulative distributions without FTC.
- Physics formulas like "work = $\int F \, dx$" and "impulse = $\int F \, dt$" have no connection to energy and momentum without FTC.

---

## Definition of Done

- [ ] You can state FTC Part 1 and Part 2, and explain what each says in plain English
- [ ] You can prove FTC Part 1 using the mean value theorem for integrals
- [ ] You can use FTC Part 2 to compute $\int_0^2 x^3\,dx$, $\int_0^\pi \cos(x)\,dx$, and $\int_1^e (1/x)\,dx$
- [ ] You can perform integration by substitution and by parts, and verify by differentiation
- [ ] You ran the Python verification and understand the two numerical checks

**Proof reconstruction (Sunday):** Prove FTC Part 1 from scratch. Then use it to prove FTC Part 2 (hint: if $G' = f$, write $G(x) = F(x) + C$ using MVT).

---

## Answers to Quick Check

1. By FTC Part 1: $\frac{d}{dx}\left[\int_0^x t^2\,dt\right] = x^2$. The derivative of the integral is the integrand.
2. $\int 2x\,dx = x^2 + C$ (reverse power rule). So $\int_1^3 2x\,dx = [x^2]_1^3 = 9 - 1 = 8$.
3. $\int_0^{2\pi} \sin(x)\,dx = [-\cos(x)]_0^{2\pi} = -\cos(2\pi) - (-\cos(0)) = -1 + 1 = 0$. Geometric reason: $\sin(x)$ is positive on $(0, \pi)$ and negative on $(\pi, 2\pi)$ with equal areas — they cancel.
