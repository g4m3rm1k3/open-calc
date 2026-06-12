# M-025 — Taylor Series

**Phase 8 · Sequences and Series · Lesson 3 of 3**
**Pillar: Approximation** · *Any smooth function approximated by polynomials — and Euler's formula derived*

---

## What You Will Build

A Python program showing Taylor partial sums of $\sin(x)$ converging to the function with an error plot. Euler's formula $e^{i\pi} = -1$ is derived from the Taylor series. You will derive the coefficients from scratch by successive differentiation.

---

## What You Need to Know First

- M-024: series convergence (Taylor series are power series; convergence needs the ratio test)
- M-019: derivatives of all orders (Taylor coefficients are derivatives at 0)
- M-012: complex numbers (Euler's formula connects $e^{ix}$ to trig)

---

> **Quick Check — try to answer before reading:**
>
> 1. Near $x = 0$, $\sin x \approx x$. Why? Can you extend this to a better approximation?
> 2. What polynomial of degree $\leq 2$ best approximates $e^x$ near $x = 0$?
> 3. How can $e^{ix}$ equal $\cos x + i\sin x$ when $e^{ix}$ has a complex exponent?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Deriving the Taylor Coefficients

**Question:** If $f(x) = c_0 + c_1 x + c_2 x^2 + c_3 x^3 + \cdots$, what are the $c_k$?

**Answer by successive differentiation:**

$f(0) = c_0$

$f'(x) = c_1 + 2c_2 x + 3c_3 x^2 + \cdots \implies f'(0) = c_1$

$f''(x) = 2c_2 + 6c_3 x + \cdots \implies f''(0) = 2c_2 \implies c_2 = f''(0)/2$

$f^{(k)}(0) = k! \cdot c_k \implies c_k = \frac{f^{(k)}(0)}{k!}$

**Taylor series centred at 0 (Maclaurin series):**

$$f(x) = \sum_{n=0}^\infty \frac{f^{(n)}(0)}{n!} x^n$$

This works when $f$ is infinitely differentiable and the series converges to $f$ (not all smooth functions have this property — the proof that it works requires the Taylor Remainder Theorem, in Phase 16).

---

### Key Series Derived

**$e^x$:** $(e^x)^{(n)} = e^x$ for all $n$, and $e^0 = 1$. So $c_n = 1/n!$.

$$e^x = \sum_{n=0}^\infty \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots$$

**$\sin x$:** $\sin^{(0)} = \sin$, $\sin^{(1)} = \cos$, $\sin^{(2)} = -\sin$, $\sin^{(3)} = -\cos$, $\sin^{(4)} = \sin$ (period 4). At $x = 0$: $0, 1, 0, -1, 0, 1, \ldots$

$$\sin x = \sum_{n=0}^\infty \frac{(-1)^n x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{6} + \frac{x^5}{120} - \cdots$$

**$\cos x$:** Similarly, derivatives at 0: $1, 0, -1, 0, 1, \ldots$

$$\cos x = \sum_{n=0}^\infty \frac{(-1)^n x^{2n}}{(2n)!} = 1 - \frac{x^2}{2} + \frac{x^4}{24} - \cdots$$

---

### Euler's Formula — Derived

Substitute $ix$ into the Taylor series for $e^x$:

$$e^{ix} = \sum_{n=0}^\infty \frac{(ix)^n}{n!} = 1 + ix + \frac{(ix)^2}{2!} + \frac{(ix)^3}{3!} + \frac{(ix)^4}{4!} + \cdots$$

Since $i^2 = -1$, $i^3 = -i$, $i^4 = 1$ (cycling with period 4):

$$= 1 + ix - \frac{x^2}{2!} - \frac{ix^3}{3!} + \frac{x^4}{4!} + \frac{ix^5}{5!} - \cdots$$

Separate real and imaginary parts:

$$= \underbrace{\left(1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots\right)}_{\cos x} + i\underbrace{\left(x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots\right)}_{\sin x}$$

$$\boxed{e^{ix} = \cos x + i\sin x} \quad \square$$

Setting $x = \pi$: $e^{i\pi} = \cos\pi + i\sin\pi = -1 + 0 = -1$. Therefore $e^{i\pi} + 1 = 0$.

---

### Radius of Convergence

Every power series $\sum a_n x^n$ has a **radius of convergence** $R$ such that:
- The series converges absolutely for $|x| < R$
- The series diverges for $|x| > R$
- Behaviour at $|x| = R$ must be checked separately

**Finding $R$:** By the ratio test, $R = 1/\limsup |a_{n+1}/a_n|$.

For $e^x$: ratio $= |x|/(n+1) \to 0$ for any fixed $x$. So $R = \infty$ — converges everywhere.
For $\sin x$ and $\cos x$: similarly $R = \infty$.

```python
import math

def taylor_sin(x, n_terms):
    """Partial sum of Taylor series for sin(x)."""
    total, sign, x_power, factorial = 0, 1, x, 1
    for k in range(n_terms):
        if k > 0:
            factorial *= (2*k) * (2*k + 1)
            x_power  *= x * x
            sign     *= -1
        total += sign * x_power / factorial
    return total

def taylor_cos(x, n_terms):
    """Partial sum of Taylor series for cos(x)."""
    total, sign, x_power, factorial = 1, 1, 1, 1
    for k in range(1, n_terms + 1):
        factorial *= (2*k - 1) * (2*k)
        x_power  *= x * x
        sign     *= -1
        total    += sign * x_power / factorial
    return total

def taylor_exp(x, n_terms):
    """Partial sum of Taylor series for e^x."""
    total, x_power, factorial = 0, 1, 1
    for k in range(n_terms):
        if k > 0:
            factorial *= k
            x_power  *= x
        total += x_power / factorial
    return total

print("=== Taylor Series Convergence ===")
print()
print("sin(x) — partial sums with increasing terms:")
test_x = [0.1, 1.0, math.pi/4, math.pi, 2*math.pi]
print(f"{'x':>8}  {'true':>12}  " + "  ".join(f"N={k:2}" for k in [1, 3, 5, 10, 20]))
print("-" * 75)
for x in test_x:
    true_val = math.sin(x)
    approxes = [taylor_sin(x, k) for k in [1, 3, 5, 10, 20]]
    approx_str = "  ".join(f"{v:7.4f}" for v in approxes)
    print(f"{x:>8.4f}  {true_val:>12.8f}  {approx_str}")

print()
print("Error for sin(x=1) as a function of N:")
for N in range(1, 8):
    err = abs(taylor_sin(1.0, N) - math.sin(1.0))
    print(f"  N={N}: error = {err:.6e}  {'(> 1e-10, still significant)' if err > 1e-10 else '(< 1e-10, essentially exact)'}")

print()
print("=== Euler's Formula Verification ===")
print("e^(ix) = cos(x) + i*sin(x)")
print()
test_angles = [0, math.pi/6, math.pi/4, math.pi/2, math.pi, 2*math.pi]
names       = ['0', 'π/6', 'π/4', 'π/2', 'π', '2π']
print(f"{'x':>8}  {'Re(e^ix)=cos(x)':>16}  {'Im(e^ix)=sin(x)':>16}  match")
for x, name in zip(test_angles, names):
    re_via_cos = math.cos(x)
    im_via_sin = math.sin(x)
    re_via_exp = taylor_cos(x, 20)     # Taylor cos
    im_via_exp = taylor_sin(x, 20)     # Taylor sin
    re_match = abs(re_via_cos - re_via_exp) < 1e-10
    im_match = abs(im_via_sin - im_via_exp) < 1e-10
    print(f"{name:>8}  {re_via_cos:>16.8f}  {im_via_sin:>16.8f}  {'✓' if re_match and im_match else '✗'}")

print()
print("Euler's identity: e^(iπ) = cos(π) + i·sin(π) = -1 + 0·i = -1")
print(f"  Taylor cos(π) = {taylor_cos(math.pi, 20):.10f}")
print(f"  Taylor sin(π) = {taylor_sin(math.pi, 20):.10f}")
print(f"  So e^(iπ) + 1 = {taylor_cos(math.pi, 20) + 1:.2e}  ≈ 0  ✓")

print()
print("=== Radius of Convergence ===")
print("For e^x: ratio = x/(n+1) → 0 for any x.  R = ∞  (converges everywhere)")
print("For sin(x), cos(x): same analysis.  R = ∞")
print()
print("Example: 1/(1-x) = ∑ x^n  has R = 1  (diverges for |x| ≥ 1)")
for x in [0.5, 0.9, 0.99, 1.0, 1.01]:
    partial = sum(x**n for n in range(200)) if abs(x) < 1 else float('inf')
    exact = 1/(1-x) if x != 1 else float('inf')
    print(f"  x={x}: partial sum ≈ {partial:.4f},  exact 1/(1-x) = {exact:.4f}  {'converges' if abs(x) < 1 else 'diverges'}")
```

---

## Connect the Pieces

Taylor series tie together almost every topic so far:
- Coefficients come from repeated differentiation (M-018–M-019)
- Convergence determined by ratio test (M-024)
- Euler's formula connects $e^x$ (M-013), $\sin/\cos$ (M-015), and $\mathbb{C}$ (M-012)

**Forwards:**
- M-046 (Real Analysis): Uniform convergence of power series — when can you integrate and differentiate term by term?
- M-037 (Probability): Moment generating function $E[e^{tX}] = \sum E[X^n] t^n/n!$ — Taylor series of the MGF.
- M-043 (Concrete Mathematics): Generating functions $\sum a_n x^n$ encode combinatorial sequences; Taylor coefficient extraction is the same operation.

---

## What Breaks Without This

Without Taylor series:
- You cannot compute $e^{0.1}$, $\sin(0.3)$, or $\ln(1.1)$ to arbitrary precision — these are how calculators and computers implement transcendental functions.
- Euler's formula has no derivation — it is a mystery rather than a theorem.
- Physics loses small-angle approximation $\sin\theta \approx \theta$ (first Taylor term) used in pendulum analysis, optics, and quantum mechanics.

---

## Definition of Done

- [ ] You can derive the Taylor coefficients $c_n = f^{(n)}(0)/n!$ by successive differentiation
- [ ] You can write the Taylor series for $e^x$, $\sin x$, and $\cos x$ from memory
- [ ] You can derive Euler's formula by substituting $ix$ into the Taylor series of $e^x$
- [ ] You can find the radius of convergence of a power series using the ratio test
- [ ] You ran the Python convergence table and Euler verification

**Proof reconstruction (Sunday):** Derive the Taylor series for $\cos x$ from the derivatives of $\cos$. Then substitute $i\pi$ into the series for $e^x$ to derive $e^{i\pi} = -1$.

---

## Answers to Quick Check

1. $\sin x = x - x^3/6 + \cdots$, so near 0, $\sin x \approx x$ (first term). Better: $\sin x \approx x - x^3/6$ (two terms). The Taylor series gives increasingly accurate polynomial approximations.
2. $e^x = 1 + x + x^2/2 + \cdots$. The best degree-2 approximation near 0 is $1 + x + x^2/2$.
3. By the Taylor series: $e^{ix} = \sum (ix)^n/n!$. Separating real and imaginary parts using $i^{2k} = (-1)^k$ and $i^{2k+1} = i(-1)^k$ gives $\cos x + i\sin x$. This is not asserted — it is derived.
