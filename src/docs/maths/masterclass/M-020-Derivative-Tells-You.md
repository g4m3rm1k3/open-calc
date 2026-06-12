# M-020 — What the Derivative Tells You

**Phase 6 · Differential Calculus · Lesson 3 of 3**
**Pillar: Approximation** · *The Mean Value Theorem, optimisation, and Newton's method*

---

## What You Will Build

A Python implementation of Newton's method showing quadratic convergence, and code demonstrating the Mean Value Theorem numerically. You will prove the MVT, use it to prove the first and second derivative tests, and understand L'Hôpital's rule.

---

## What You Need to Know First

- M-018: derivative definition
- M-019: differentiation rules
- M-017: continuity and the IVT

---

> **Quick Check — try to answer before reading:**
>
> 1. If $f'(x) > 0$ on $(a, b)$, what can you say about $f$ on that interval?
> 2. If $f'(c) = 0$ and $f''(c) > 0$, what kind of point is $c$?
> 3. Newton's method iterates $x_{n+1} = x_n - f(x_n)/f'(x_n)$. What is this geometrically?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Mean Value Theorem

**Theorem (MVT):** If $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then there exists $c \in (a, b)$ such that:

$$f'(c) = \frac{f(b) - f(a)}{b - a}$$

The average rate of change over $[a, b]$ is achieved as an instantaneous rate at some interior point.

**Geometric meaning:** There is a point where the tangent line is parallel to the chord from $(a, f(a))$ to $(b, f(b))$.

**Proof:** Define $g(x) = f(x) - \frac{f(b)-f(a)}{b-a}(x-a)$. Then $g(a) = f(a)$ and $g(b) = f(a) + [f(b)-f(a)] - [f(b)-f(a)] = f(a)$. So $g(a) = g(b)$.

By **Rolle's Theorem** (a special case of MVT, proved similarly using the Extreme Value Theorem): since $g$ is continuous on $[a,b]$, differentiable on $(a,b)$, and $g(a) = g(b)$, there exists $c$ with $g'(c) = 0$.

Since $g'(x) = f'(x) - \frac{f(b)-f(a)}{b-a}$: $f'(c) = \frac{f(b)-f(a)}{b-a}$. $\square$

**Key applications:**

**First derivative test for monotonicity:**
- $f'(x) > 0$ on $(a, b)$ $\implies$ $f$ is strictly increasing on $(a, b)$.
- **Proof:** For $a < x_1 < x_2 < b$: by MVT, $f(x_2) - f(x_1) = f'(c)(x_2 - x_1)$ for some $c \in (x_1, x_2)$. Since $f'(c) > 0$ and $x_2 - x_1 > 0$: $f(x_2) > f(x_1)$. $\square$

**Critical points and local extrema:**
- If $f'(c) = 0$ and $f'$ changes sign from positive to negative at $c$: local maximum.
- If $f'$ changes sign from negative to positive: local minimum.
- If $f''(c) > 0$: local minimum (concave up). If $f''(c) < 0$: local maximum (concave down).

---

### L'Hôpital's Rule

**Theorem:** If $\lim_{x \to a} f(x) = 0$ and $\lim_{x \to a} g(x) = 0$ (the $0/0$ indeterminate form), and $g'(x) \neq 0$ near $a$, then:

$$\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}$$

provided the right-hand side limit exists.

**Proof using Cauchy MVT:** There exists $c$ between $a$ and $x$ with $\frac{f(x) - f(a)}{g(x) - g(a)} = \frac{f'(c)}{g'(c)}$. As $x \to a$: $c \to a$ and the right side $\to f'(a)/g'(a)$. Since $f(a) = g(a) = 0$: $\frac{f(x)}{g(x)} \to \frac{f'(a)}{g'(a)}$. $\square$

Also applies to the $\infty/\infty$ form, and to forms $0 \cdot \infty$, $0^0$, $\infty - \infty$ after rearrangement.

**Example:** $\lim_{x \to 0} \frac{\sin x}{x} = \lim_{x \to 0} \frac{\cos x}{1} = 1$ ✓ (confirms the key limit used in M-018)

---

### Newton's Method

**Problem:** Find a root of $f(x) = 0$.

**Idea:** If $x_n$ is close to a root, the tangent line at $x_n$ is a good approximation of $f$ near $x_n$. The tangent line crosses zero at:

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$

This is Newton's method. Each step replaces the curve with its tangent approximation and takes the tangent's root as the next estimate.

**Quadratic convergence:** If $f'(r) \neq 0$ at the root $r$, then the error $e_n = x_n - r$ satisfies:

$$|e_{n+1}| \approx \frac{|f''(r)|}{2|f'(r)|} \cdot e_n^2$$

The error squares at each step. If $|e_0| = 0.1$: $|e_1| \approx 0.01$, $|e_2| \approx 0.0001$, $|e_3| \approx 10^{-8}$. Digits of accuracy double with each iteration.

```python
import math

# Mean Value Theorem numerical demonstration
print("=== Mean Value Theorem Verification ===")
print()
print("MVT: there exists c in (a,b) such that f'(c) = (f(b)-f(a))/(b-a)")
print()

def find_mvt_point(f, f_prime, a, b, steps=10000):
    """Find c in (a,b) where f'(c) equals the average slope."""
    average_slope = (f(b) - f(a)) / (b - a)
    # Search for c where f'(c) ≈ average_slope
    best_c, best_diff = None, float('inf')
    for i in range(steps):
        c = a + (b - a) * (i + 0.5) / steps
        diff = abs(f_prime(c) - average_slope)
        if diff < best_diff:
            best_diff, best_c = diff, c
    return best_c, average_slope

for (name, f, fp, a, b) in [
    ("f(x) = x²",    lambda x: x**2,   lambda x: 2*x, 1, 3),
    ("f(x) = sin(x)", math.sin,          math.cos,      0, math.pi),
    ("f(x) = e^x",   math.exp,           math.exp,      0, 2),
]:
    c, avg_slope = find_mvt_point(f, fp, a, b)
    print(f"{name} on [{a}, {b}]:")
    print(f"  Average slope = {avg_slope:.8f}")
    print(f"  MVT point c ≈ {c:.8f}")
    print(f"  f'(c) = {fp(c):.8f}  (matches average slope: {abs(fp(c) - avg_slope) < 1e-4})")
    print()

# Newton's method showing quadratic convergence
print("=== Newton's Method: Quadratic Convergence ===")
print()

def newton(f, f_prime, x0, tolerance=1e-15, max_iter=50):
    """
    Newton's method for f(x) = 0.
    Iterates x_{n+1} = x_n - f(x_n)/f'(x_n).
    Returns list of (iteration, x, error) triples.
    """
    results = []
    x = x0
    for i in range(max_iter):
        fx = f(x)
        fpx = f_prime(x)
        if abs(fpx) < 1e-15:
            break
        x_new = x - fx / fpx
        results.append((i+1, x_new, abs(fx)))
        if abs(fx) < tolerance:
            break
        x = x_new
    return results

# Find sqrt(2) as root of f(x) = x^2 - 2, f'(x) = 2x
print("Finding sqrt(2) via x² - 2 = 0 starting from x₀ = 1.0:")
print(f"{'Iter':>5}  {'x_n':>20}  {'|f(x_n)|':>14}  Digits of accuracy")
print("-" * 60)
true_root = math.sqrt(2)
for (i, x, ferr) in newton(lambda x: x**2 - 2, lambda x: 2*x, 1.0):
    digits = -math.log10(abs(x - true_root)) if abs(x - true_root) > 0 else 15
    print(f"{i:>5}  {x:>20.15f}  {ferr:>14.4e}  {digits:.1f}")

print()

# Demonstrate quadratic convergence: errors ~ C * prev_error^2
print("Error sequence (showing quadratic doubling of correct digits):")
results = newton(lambda x: x**2 - 2, lambda x: 2*x, 1.0)
errors = [abs(x - true_root) for (_, x, _) in results]
print(f"{'Iter':>5}  {'Error':>15}  {'Ratio e_n/e_{n-1}^2':>22}")
for i in range(1, len(errors)):
    if errors[i-1] > 0:
        ratio = errors[i] / errors[i-1]**2
        print(f"{i:>5}  {errors[i]:>15.4e}  {ratio:>22.4f}")
    if errors[i] < 1e-14:
        break
print()
print("The ratio e_n/e_{n-1}^2 converges to |f''(r)|/(2|f'(r)|) = 1/(2*sqrt(2)) ≈ 0.354")
print("This confirms quadratic convergence.")
```

**Walkthrough:** The MVT search samples 10,000 points in $(a, b)$ and finds the one where $f'(c)$ is closest to the average slope. For $f(x) = x^2$ on $[1, 3]$: average slope is $(9-1)/2 = 4$; MVT says $2c = 4$ so $c = 2$, and the code finds $c \approx 2.00$. Newton's method on $x^2 - 2 = 0$ starting from $x_0 = 1.0$: the errors (bottom table) satisfy $e_n \approx 0.354 \cdot e_{n-1}^2$, confirming the quadratic convergence rate. After 5 iterations from $x_0 = 1.0$, full double-precision accuracy is reached.

---

## Connect the Pieces

**Backwards:** MVT requires differentiability (M-018) and continuity (M-017). L'Hôpital's Rule gives us the limit $\sin(h)/h = 1$ used in M-018.

**Forwards:**
- M-022 (FTC): MVT is used in the proof that antiderivatives are unique up to constants — if $F' = G'$ on $(a, b)$, then $F - G$ is constant.
- M-026 (Multivariable): The multivariable MVT extends the theorem to functions of several variables.
- M-032 (Eigenvalues): Newton's method is the basis of the QR algorithm for computing eigenvalues.
- M-043 (Concrete Mathematics): Newton's method's convergence analysis uses the power rule and Taylor series — tools from M-019 and M-025.

---

## What Breaks Without This

Without the MVT:
- You cannot prove that a function with zero derivative everywhere is constant — this seems obvious but requires the MVT.
- You cannot prove the fundamental theorem linking antiderivatives to integrals.
- All monotonicity theorems ("$f' > 0 \implies f$ increasing") are assertions, not theorems.

Without Newton's method:
- Root finding requires bisection, which converges linearly (one bit per step). Newton's method converges quadratically (doubles accurate bits). For scientific computing, the difference is $33$ vs $5$ iterations for full precision.

---

## Definition of Done

- [ ] You can state and prove the Mean Value Theorem (using Rolle's Theorem as a lemma)
- [ ] You can use the first and second derivative tests to classify critical points
- [ ] You can state L'Hôpital's Rule and apply it to evaluate $\lim_{x \to 0} \sin(x)/x$
- [ ] You can implement Newton's method from scratch and observe quadratic convergence
- [ ] You ran the Python code and can read the convergence ratio table

**Proof reconstruction (Sunday):** Prove: if $f'(x) = 0$ for all $x \in (a, b)$, then $f$ is constant on $(a, b)$. Use the MVT.

---

## Answers to Quick Check

1. $f$ is strictly increasing on $(a, b)$. Proved using MVT: for any $x_1 < x_2$ in $(a, b)$, $f(x_2) - f(x_1) = f'(c)(x_2 - x_1) > 0$.
2. A local minimum. The second derivative test: $f'(c) = 0$ means a critical point; $f''(c) > 0$ means concave up — the function curves upward at $c$, so it is a bowl shape — a minimum.
3. Geometrically: draw the tangent line to $f$ at $x_n$. $x_{n+1}$ is where this tangent line crosses the $x$-axis. We are replacing the curve with its linear approximation and solving that instead.
