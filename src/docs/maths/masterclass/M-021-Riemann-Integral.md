# M-021 — The Riemann Integral

**Phase 7 · Integral Calculus · Lesson 1 of 2**
**Pillar: Approximation** · *Area as a limit of rectangles — making "accumulation" precise*

---

## What You Will Build

A Python implementation of Riemann sums (left, right, midpoint) with a convergence table showing the error decreasing as $n$ increases. A Canvas animation showing the rectangles filling in under the curve.

---

## What You Need to Know First

- M-016: limits (the integral is defined as a limit of sums)
- M-017: continuity (continuity guarantees the integral exists)
- M-021 sits before M-022 (FTC) — this lesson defines the integral rigorously; the next connects it to derivatives

---

> **Quick Check — try to answer before reading:**
>
> 1. A car goes at 30 km/h for 2 hours and 60 km/h for 1 hour. Total distance? How is this like an area?
> 2. If you approximate the area under $y = x^2$ from 0 to 1 using 10 rectangles, is your estimate too high or too low if you use left endpoints?
> 3. Why is $\int_a^b f(x)\,dx = -\int_b^a f(x)\,dx$?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Area as a Limit

**The problem:** Find the area bounded by $y = f(x)$, the $x$-axis, and the vertical lines $x = a$ and $x = b$.

For a rectangle, area = base × height. For a curved region, we approximate with rectangles.

**Riemann sum:** Partition $[a, b]$ into $n$ subintervals of width $\Delta x = (b-a)/n$. On each subinterval $[x_{k-1}, x_k]$, choose a sample point $x_k^*$ and form the rectangle with height $f(x_k^*)$:

$$S_n = \sum_{k=1}^{n} f(x_k^*)\,\Delta x$$

Different choices of sample points give different approximations:
- Left endpoints: $x_k^* = x_{k-1} = a + (k-1)\Delta x$
- Right endpoints: $x_k^* = x_k = a + k\Delta x$
- Midpoints: $x_k^* = (x_{k-1} + x_k)/2$

**The Riemann integral:**

$$\int_a^b f(x)\,dx = \lim_{n \to \infty} S_n$$

This limit exists (and is the same regardless of choice of sample points) when $f$ is continuous on $[a, b]$. Proved in Phase 16 using the completeness of $\mathbb{R}$.

**The $dx$ notation:** $dx$ represents the infinitesimally small width $\Delta x$ in the limit. It is not a number — it is a notation indicating the variable of integration.

**The integral as signed area:** $\int_a^b f(x)\,dx$ counts area above the $x$-axis positively and area below negatively. If $f(x) < 0$ on part of $[a, b]$, the integral subtracts that part.

---

### Error Analysis

**Left-endpoint error:** $O(1/n)$ — the error decreases like $1/n$.
**Midpoint rule error:** $O(1/n^2)$ — much better, because the overestimate on one half-interval cancels the underestimate on the other.
**Trapezoid rule error:** $O(1/n^2)$ — same order as midpoint.
**Simpson's rule** (not covered in detail): $O(1/n^4)$ — two more orders.

The exact error for continuous $f$ is:
- Left/right: $\leq \frac{(b-a)^2}{2n} \max|f'(x)|$
- Midpoint: $\leq \frac{(b-a)^3}{24n^2} \max|f''(x)|$

```python
import math

def riemann_sum(f, a, b, n, method='midpoint'):
    """
    Compute the Riemann sum for integral of f from a to b using n rectangles.
    
    method: 'left', 'right', or 'midpoint'
    
    The Riemann sum IS the integral in the limit n → infinity.
    Each method corresponds to a different choice of sample point x_k*.
    """
    dx = (b - a) / n
    total = 0
    for k in range(n):
        x_left  = a + k * dx
        x_right = a + (k + 1) * dx
        if method == 'left':
            sample = x_left
        elif method == 'right':
            sample = x_right
        else:  # midpoint
            sample = (x_left + x_right) / 2
        total += f(sample) * dx
    return total

def trapezoid_rule(f, a, b, n):
    """
    Trapezoid rule: average of left and right Riemann sums.
    Error ~ (b-a)^3 / (12n^2) * max|f''|  -- order 1/n^2.
    """
    dx = (b - a) / n
    total = (f(a) + f(b)) / 2
    for k in range(1, n):
        total += f(a + k * dx)
    return total * dx


print("=== Riemann Sum Convergence ===")
print("Integrating f(x) = x² from 0 to 1  (exact: 1/3 ≈ 0.333333...)")
print()
exact = 1/3
f = lambda x: x**2

print(f"{'n':>7}  {'left':>12}  {'midpoint':>12}  {'right':>12}  {'trapezoid':>12}")
print("-" * 62)
for n in [10, 100, 1000, 10000]:
    left = riemann_sum(f, 0, 1, n, 'left')
    mid  = riemann_sum(f, 0, 1, n, 'midpoint')
    right= riemann_sum(f, 0, 1, n, 'right')
    trap = trapezoid_rule(f, 0, 1, n)
    print(f"{n:>7}  {left:>12.8f}  {mid:>12.8f}  {right:>12.8f}  {trap:>12.8f}")

print(f"{'exact':>7}  {exact:>12.8f}  {exact:>12.8f}  {exact:>12.8f}  {exact:>12.8f}")
print()

print("=== Error vs n (showing 1/n for left, 1/n^2 for midpoint) ===")
print(f"{'n':>7}  {'left error':>13}  {'mid error':>13}  {'left/n':>10}  {'mid*n^2':>12}")
print("-" * 60)
for n in [10, 100, 1000, 10000]:
    left_err = abs(riemann_sum(f, 0, 1, n, 'left') - exact)
    mid_err  = abs(riemann_sum(f, 0, 1, n, 'midpoint') - exact)
    print(f"{n:>7}  {left_err:>13.4e}  {mid_err:>13.4e}  {left_err*n:>10.4f}  {mid_err*n**2:>12.6f}")

print()
print("left error × n → constant   (confirms O(1/n))")
print("mid error × n² → constant   (confirms O(1/n²))")
print()

# Additional examples
print("=== Additional Integrals ===")
examples = [
    ("∫₀^1 e^x dx",       lambda x: math.exp(x),  0, 1, math.e - 1),
    ("∫₀^π sin(x) dx",    math.sin,                0, math.pi, 2.0),
    ("∫₁^2 ln(x) dx",     math.log,                1, 2, 2*math.log(2) - 1),
]
for (name, f, a, b, exact_val) in examples:
    approx = riemann_sum(f, a, b, 10000, 'midpoint')
    err = abs(approx - exact_val)
    print(f"  {name} = {approx:.8f}  (exact: {exact_val:.8f},  error: {err:.2e})")
```

```javascript
// Canvas: rectangles under f(x) = x^2 from 0 to 1
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 400;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const f = x => x * x;
const a = 0, b = 1;
let n = 2, growing = true;

function draw() {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, 500, 400);

    // Coordinate: x in [-0.1, 1.3], y in [-0.1, 1.3]
    const toC = (mx, my) => ({
        x: (mx + 0.1) / 1.4 * 460 + 20,
        y: 380 - (my + 0.1) / 1.4 * 360
    });

    const dx = (b - a) / n;

    // Fill rectangles (midpoint)
    ctx.fillStyle = 'rgba(79, 195, 247, 0.25)';
    for (let k = 0; k < n; k++) {
        const xL = a + k * dx;
        const xR = a + (k + 1) * dx;
        const xM = (xL + xR) / 2;
        const height = f(xM);
        const {x: px, y: py} = toC(xL, 0);
        const {x: px2, y: py2} = toC(xR, height);
        ctx.fillRect(px, py2, px2 - px, py - py2);
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py2, px2 - px, py - py2);
    }

    // Curve
    ctx.beginPath(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    let first = true;
    for (let i = 0; i <= 300; i++) {
        const mx = a + (b - a) * i / 300;
        const {x, y} = toC(mx, f(mx));
        first ? (ctx.moveTo(x, y), first = false) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(toC(-0.1, 0).x, toC(-0.1, 0).y);
    ctx.lineTo(toC(1.3, 0).x, toC(1.3, 0).y);
    ctx.moveTo(toC(0, -0.1).x, toC(0, -0.1).y);
    ctx.lineTo(toC(0, 1.3).x, toC(0, 1.3).y);
    ctx.stroke();

    const approx = Array.from({length: n}, (_, k) => f(a + (k + 0.5) * dx) * dx).reduce((s, v) => s + v, 0);
    ctx.fillStyle = '#ccc'; ctx.font = '13px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`n = ${n}  midpoint sum = ${approx.toFixed(6)}  exact = 0.333333`, 20, 30);
    ctx.fillText(`f(x) = x²`, 420, 50);
}

function animate() {
    draw();
    if (growing) { n = Math.floor(n * 1.06) + 1; if (n > 200) { growing = false; } }
    else         { n = Math.max(2, Math.floor(n * 0.94)); if (n <= 2) { growing = true; } }
    requestAnimationFrame(animate);
}
animate();
```

---

### Properties of the Integral

These follow from the definition and the limit laws:

$$\int_a^b [f(x) + g(x)]\,dx = \int_a^b f(x)\,dx + \int_a^b g(x)\,dx \quad \text{(linearity)}$$

$$\int_a^b c f(x)\,dx = c \int_a^b f(x)\,dx \quad \text{(homogeneity)}$$

$$\int_a^b f(x)\,dx = \int_a^c f(x)\,dx + \int_c^b f(x)\,dx \quad \text{(additivity over intervals)}$$

$$\int_a^a f(x)\,dx = 0 \quad \text{(zero width)}$$

$$\int_a^b f(x)\,dx = -\int_b^a f(x)\,dx \quad \text{(orientation)}$$

---

## Connect the Pieces

**Backwards:** The integral is a limit (M-016) of sums. Continuity (M-017) guarantees convergence.

**Forwards:**
- M-022 (FTC): The Fundamental Theorem connects integrals to derivatives — making the integral computable without summing rectangles.
- M-027 (Double integrals): The Riemann sum extends to functions of two variables by summing over rectangles in the plane.
- M-037 (Probability): Continuous probability distributions use $\int P(x) dx$ — a Riemann integral.

---

## What Breaks Without This

Without the Riemann integral definition:
- "Area under a curve" is an intuition with no definition. You cannot ask "is this function integrable?" — there is nothing to integrate in.
- The error bounds (O(1/n²) for midpoint) cannot be proved — you cannot know how many rectangles you need for a desired precision.

---

## Definition of Done

- [ ] You can write the Riemann sum formula and explain left, right, and midpoint choices
- [ ] You can explain why the integral is the limit of Riemann sums, not the limit of any one sum
- [ ] You can state the error orders: $O(1/n)$ for endpoints, $O(1/n^2)$ for midpoint
- [ ] You ran the Python convergence table and can explain the $n$ vs $n^2$ columns
- [ ] You can list the five integral properties and derive the orientation rule

**Proof reconstruction (Sunday):** Using the definition, prove $\int_a^b c\,dx = c(b-a)$ (integral of a constant). Then derive the orientation rule $\int_a^b f = -\int_b^a f$ from the definition (hint: what happens to the sum when $a > b$?).

---

## Answers to Quick Check

1. Distance = speed × time. Constant 30 km/h for 2 hours: area of rectangle = 30 × 2 = 60. Constant 60 km/h for 1 hour: area = 60 × 1 = 60. Total = 120 km. The integral of velocity is distance — an area computation.
2. For $f(x) = x^2$ (increasing function) on $[0, 1]$: left endpoints are always lower than the function on each subinterval, so left-endpoint rectangles underestimate. The sum is less than the true area.
3. When you swap the limits of integration, $\Delta x$ changes sign (you are summing in the reverse direction), so the sum changes sign.
