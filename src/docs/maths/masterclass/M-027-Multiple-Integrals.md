# M-027 — Multiple Integrals

**Phase 9 · Multivariable Calculus · Lesson 2 of 3**
**Pillar: Approximation** · *FTC applied twice — computing volumes and areas over 2D regions*

---

## What You Will Build

A Python program that computes double integrals numerically as 2D Riemann sums and compares to exact analytic answers from FTC applied twice. A Canvas animation showing rectangles filling in under a 2D surface. By the end you understand Fubini's theorem — when and why you can swap the order of integration — and can compute an area in polar coordinates.

---

## What You Need to Know First

- M-021: the Riemann integral (double integrals extend the same rectangle-limit idea to 2D)
- M-022: FTC (each direction of an iterated integral uses FTC to evaluate)
- M-026: partial derivatives (holding one variable fixed is the same idea)

---

> **Quick Check — try to answer before reading:**
>
> 1. A car travels at 30 km/h for 2 hours and 60 km/h for 1 hour. Total distance = 120 km. Which geometric shape represents each segment?
> 2. For $f(x,y) = x + y$ on the unit square $[0,1] \times [0,1]$, is the integral larger or smaller than $1$?
> 3. Can you always compute $\int_0^1\int_0^1 f(x,y)\,dy\,dx$ by doing the $y$-integral first, then the $x$-integral? Are there any restrictions?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Problem: Area in Two Dimensions

In M-021, the single integral $\int_a^b f(x)\,dx$ measured signed area between a curve and the $x$-axis, as the limit of 1D Riemann sums.

Now suppose $f(x,y)$ assigns a height to every point $(x,y)$ in a region $D$. The double integral $\iint_D f(x,y)\,dA$ measures the **signed volume** between the surface $z = f(x,y)$ and the region $D$ in the $xy$-plane.

The definition is the natural extension: partition $D$ into small rectangles of dimensions $\Delta x \times \Delta y$ (area $\Delta A = \Delta x\,\Delta y$), sample $f$ at a point in each rectangle, form the sum, and take the limit as the rectangles shrink:

$$\iint_D f(x,y)\,dA = \lim_{\Delta x, \Delta y \to 0} \sum_{i,j} f(x_i^*, y_j^*)\,\Delta x\,\Delta y$$

**Math lens:** This is the 2D Riemann integral. Everything from M-021 carries over: continuity on a closed bounded region guarantees the limit exists, the value is independent of how we choose the sample points, and the properties (linearity, additivity) all hold.

**CS lens:** In numerical analysis, this double sum is a 2D quadrature rule. Computational physics simulates heat flow, fluid dynamics, and electromagnetic fields by discretising PDEs on 2D grids — the same double sum, applied millions of times.

---

### Fubini's Theorem: Computing Double Integrals by Slicing

**The key insight:** Instead of limiting a 2D sum directly, you can compute a double integral as two successive 1D integrals.

Fix a value of $x$. The integral $A(x) = \int_{y_{\min}}^{y_{\max}} f(x,y)\,dy$ computes the area of the cross-section of the solid at position $x$ — a 1D integral with $x$ held fixed. Now integrate $A(x)$ over $x$:

$$\iint_D f(x,y)\,dA = \int_{x_{\min}}^{x_{\max}} A(x)\,dx = \int_{x_{\min}}^{x_{\max}} \left(\int_{y_{\min}}^{y_{\max}} f(x,y)\,dy\right)dx$$

This is the **iterated integral** — two applications of FTC, one for each direction.

**Fubini's Theorem:** For a continuous $f$ on a rectangle $[a,b] \times [c,d]$:

$$\iint_D f(x,y)\,dA = \int_a^b \left(\int_c^d f(x,y)\,dy\right)dx = \int_c^d \left(\int_a^b f(x,y)\,dx\right)dy$$

The two iterated integrals give the same answer. You may integrate in either order.

**Why this is remarkable:** The left side requires a 2D limiting process. The right side is two 1D integrals — each solved with antidifferentiation via FTC. Fubini converts a hard problem into two easy ones.

**When Fubini needs care:** On a non-rectangular region $D$, the limits of the inner integral depend on the outer variable. The result is still the same in both orders, but the expressions look different. Choosing the right order can be the difference between an easy and an impossible computation.

**Example: $\int_0^1\int_0^x f(x,y)\,dy\,dx$ (triangular region $y \leq x$)**

Inner-first (over $y$): inner limit runs from $0$ to $x$ — doable.

Swapped (over $x$ first): limits become $\int_0^1\int_y^1 f(x,y)\,dx\,dy$ — same region, but $x$ now runs from $y$ to $1$.

Both give the same answer. Sometimes one is analytically easier; always the harder one can be escaped by swapping.

---

### Computing a Double Integral Step by Step

**Example:** $\iint_D xy\,dA$ over $[0,2] \times [0,1]$.

**Inner integral (fix $x$, integrate over $y$ from 0 to 1):**

$$\int_0^1 xy\,dy = x \cdot \left[\frac{y^2}{2}\right]_0^1 = x \cdot \frac{1}{2} = \frac{x}{2}$$

($x$ is a constant here — the same idea as holding $y$ fixed in partial derivatives.)

**Outer integral (integrate $x/2$ over $x$ from 0 to 2):**

$$\int_0^2 \frac{x}{2}\,dx = \frac{1}{2} \cdot \left[\frac{x^2}{2}\right]_0^2 = \frac{1}{2} \cdot 2 = 1$$

Answer: $\iint_D xy\,dA = 1$.

**Separable functions:** When $f(x,y) = g(x)\cdot h(y)$ and the region is a rectangle:

$$\int_a^b\int_c^d g(x)h(y)\,dy\,dx = \left(\int_a^b g(x)\,dx\right)\left(\int_c^d h(y)\,dy\right)$$

The integral factors into two 1D integrals. This is why $\int_0^2\int_0^1 xy\,dy\,dx = (\int_0^2 x\,dx)(\int_0^1 y\,dy) = 2 \cdot 1/2 = 1$ — same answer, found faster.

---

### Polar Coordinates

For circular regions, the change to polar coordinates $(r, \theta)$ with $x = r\cos\theta$, $y = r\sin\theta$ converts the region description from a disk (awkward in Cartesian) to a rectangle $r \in [0, R]$, $\theta \in [0, 2\pi]$ (easy).

The area element transforms: $dx\,dy = r\,dr\,d\theta$. The $r$ factor comes from the Jacobian determinant (derived in M-028). Here we use it.

**Example:** Area of the disk $x^2 + y^2 \leq R^2$:

$$\text{Area} = \iint_{x^2+y^2 \leq R^2} 1\,dA = \int_0^{2\pi}\int_0^R r\,dr\,d\theta = \int_0^{2\pi} \frac{R^2}{2}\,d\theta = \pi R^2$$

The formula $\pi R^2$ is not a definition or a memory aid — it is derived from first principles by integration in polar coordinates.

```python
import math

def double_riemann_midpoint(f, x_min, x_max, y_min, y_max, nx=200, ny=200):
    """
    Compute ∫∫ f(x,y) dA over [x_min,x_max] × [y_min,y_max]
    using a 2D midpoint Riemann sum.

    The idea: tile the rectangle with nx × ny small rectangles of area dx*dy.
    Sample f at the midpoint of each rectangle and multiply by the area.
    Sum all samples — this IS the double integral in the limit as nx,ny → ∞.

    This is the direct 2D extension of the 1D midpoint rule from M-021.
    """
    dx = (x_max - x_min) / nx
    dy = (y_max - y_min) / ny
    total = 0
    for i in range(nx):
        x = x_min + (i + 0.5) * dx    # x-midpoint of column i
        for j in range(ny):
            y = y_min + (j + 0.5) * dy  # y-midpoint of row j
            total += f(x, y) * dx * dy   # height × area
    return total

def iterated_integral(f, x_min, x_max, y_min, y_max, n=500):
    """
    Compute as an iterated 1D integral:
    ∫_{x_min}^{x_max} [∫_{y_min}^{y_max} f(x,y) dy] dx

    Outer loop: x from x_min to x_max in n steps.
    Inner loop: for each x, compute ∫ f(x,y) dy using midpoint rule.
    
    This is Fubini in action: the double integral computed as two 1D integrals.
    """
    dx = (x_max - x_min) / n
    outer_total = 0
    for i in range(n):
        x = x_min + (i + 0.5) * dx
        # Inner 1D integral: ∫ f(x,y) dy with x fixed
        dy = (y_max - y_min) / n
        inner_total = sum(f(x, y_min + (j + 0.5)*dy) * dy for j in range(n))
        outer_total += inner_total * dx
    return outer_total

print("=== Double Integral: Verification of Fubini ===")
print()
print("We verify three things:")
print("  1) 2D Riemann sum ≈ exact answer")
print("  2) Iterated integral (FTC twice) = same answer")
print("  3) Swapping integration order gives same answer")
print()

examples = [
    {
        "name":  "∫₀²∫₀¹ xy dy dx",
        "f":     lambda x, y: x * y,
        "xa": 0, "xb": 2, "ya": 0, "yb": 1,
        "exact": 1.0,
        "derivation": "= (∫₀² x dx)(∫₀¹ y dy) = [x²/2]₀² · [y²/2]₀¹ = 2 · 0.5 = 1",
    },
    {
        "name":  "∫₀¹∫₀¹ (x²+y²) dy dx",
        "f":     lambda x, y: x**2 + y**2,
        "xa": 0, "xb": 1, "ya": 0, "yb": 1,
        "exact": 2/3,
        "derivation": "= ∫₀¹[x²y + y³/3]₀¹ dx = ∫₀¹(x² + 1/3)dx = [x³/3 + x/3]₀¹ = 2/3",
    },
    {
        "name":  "∫₀^π∫₀^{π/2} sin(x)cos(y) dy dx",
        "f":     lambda x, y: math.sin(x) * math.cos(y),
        "xa": 0, "xb": math.pi, "ya": 0, "yb": math.pi/2,
        "exact": 2.0,
        "derivation": "= (∫₀^π sin x dx)(∫₀^{π/2} cos y dy) = 2 · 1 = 2",
    },
]

for ex in examples:
    f, xa, xb, ya, yb = ex["f"], ex["xa"], ex["xb"], ex["ya"], ex["yb"]
    riemann = double_riemann_midpoint(f, xa, xb, ya, yb, 300, 300)
    iterated = iterated_integral(f, xa, xb, ya, yb, 500)
    exact = ex["exact"]

    print(f"  {ex['name']}")
    print(f"  Derivation: {ex['derivation']}")
    print(f"    Exact:            {exact:.8f}")
    print(f"    2D Riemann sum:   {riemann:.8f}  (error: {abs(riemann-exact):.2e})")
    print(f"    Iterated (FTC):   {iterated:.8f}  (error: {abs(iterated-exact):.2e})")
    print()

# Fubini: verify swapping order gives same result
print("=== Fubini: swap integration order, same result ===")
f_sym = lambda x, y: math.exp(-x * y)       # non-separable
xa, xb, ya, yb = 0, 2, 0, 1

# Order 1: outer x, inner y
def integrate_outer_x(f, xa, xb, ya, yb, n=400):
    dx = (xb - xa) / n
    return sum(
        sum(f(xa+(i+0.5)*dx, ya+(j+0.5)*(yb-ya)/n)*(yb-ya)/n for j in range(n)) * dx
        for i in range(n)
    )

# Order 2: outer y, inner x (swapped)
def integrate_outer_y(f, xa, xb, ya, yb, n=400):
    dy = (yb - ya) / n
    return sum(
        sum(f(xa+(i+0.5)*(xb-xa)/n, ya+(j+0.5)*dy)*(xb-xa)/n for i in range(n)) * dy
        for j in range(n)
    )

order_xy = integrate_outer_x(f_sym, xa, xb, ya, yb, 300)
order_yx = integrate_outer_y(f_sym, xa, xb, ya, yb, 300)
print(f"  f(x,y) = e^{{-xy}} on [0,2]×[0,1]")
print(f"  ∫₀²[∫₀¹ e^{{-xy}} dy] dx = {order_xy:.8f}")
print(f"  ∫₀¹[∫₀² e^{{-xy}} dx] dy = {order_yx:.8f}")
print(f"  Difference: {abs(order_xy - order_yx):.2e}  ← Fubini confirms both orders equal")
print()

# Polar coordinates: derive πR²
print("=== Area of Disk via Polar Coordinates ===")
print("∫₀^{2π}∫₀^R r dr dθ  =  πR²")
print()
print("Step by step:")
print("  Inner: ∫₀^R r dr = [r²/2]₀^R = R²/2")
print("  Outer: ∫₀^{2π} R²/2 dθ = (R²/2) · 2π = πR²")
print()
for R in [1, 2, 3]:
    n = 2000
    dr = R / n
    polar_sum = sum((k + 0.5)*dr * 2*math.pi * dr for k in range(n))
    exact_area = math.pi * R**2
    print(f"  R={R}: polar sum = {polar_sum:.8f},  πR² = {exact_area:.8f},  error = {abs(polar_sum-exact_area):.2e}")
```

**Walkthrough of `double_riemann_midpoint`:** The outer loop over `i` selects column $x = x_{\min} + (i+\tfrac{1}{2})\Delta x$. The inner loop over `j` selects row $y = y_{\min} + (j+\tfrac{1}{2})\Delta y$. At each grid cell, `f(x,y) * dx * dy` is the volume of the rectangular column with height $f(x,y)$ and base area $\Delta x \cdot \Delta y$. The total is the 2D Riemann sum — the direct extension of the 1D midpoint rule.

**Walkthrough of `iterated_integral`:** The outer loop computes $A(x) = \int f(x, y)\,dy$ for each value of $x$ using a 1D midpoint sum (inner loop). Then $A(x) \cdot \Delta x$ is accumulated in the outer sum. This is Fubini's theorem in computational form: instead of a 2D sum, two 1D sums nested inside each other.

**CS lens — nested loops as iteration over a product space:** The double Riemann sum runs over all $(i, j)$ pairs in a grid — a Cartesian product of indices. The iterated integral separates this into two sequential loops. In distributed computing (MapReduce, GPU kernels), these two forms correspond to "all-at-once parallelism" vs "pipelined parallelism." Fubini is the mathematical guarantee that both computations yield the same result.

**SE lens — dimensional analysis and abstraction:** The `double_riemann_midpoint` function is easy to test independently of the integrand — you can pass `f = lambda x, y: 1` and verify it returns the area of the rectangle. Each piece is independently testable. This is the separation-of-concerns principle applied to numerical integration.

---

```javascript
// Canvas: 2D Riemann sum rectangles filling in under z = x^2 + y^2
const canvas = document.createElement('canvas');
canvas.width = 480; canvas.height = 380;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Isometric-style projection: (x, y, z) → (px, py)
const isoProject = (x, y, z) => ({
    px: 80 + x * 70 - y * 40,
    py: 320 - y * 25 - z * 50
});

let n = 2, growing = true;

function drawGrid() {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, 480, 380);

    const f = (x, y) => x*x + y*y;
    const dx = 1 / n, dy = 1 / n;

    // Draw rectangles from back to front (painter's algorithm)
    for (let j = n - 1; j >= 0; j--) {
        for (let i = n - 1; i >= 0; i--) {
            const x = i * dx, y = j * dy;
            const xm = x + dx/2, ym = y + dy/2;
            const height = f(xm, ym);     // midpoint height

            // Four corners of the rectangle base
            const corners = [[x,y], [x+dx,y], [x+dx,y+dy], [x,y+dy]];
            // Color by height
            const hue = Math.floor((1 - height/2) * 200 + 40);
            ctx.fillStyle = `hsla(${hue}, 70%, 45%, 0.85)`;
            ctx.strokeStyle = '#0d1117';
            ctx.lineWidth = 0.5;

            // Top face of rectangle
            ctx.beginPath();
            corners.forEach(([cx,cy], k) => {
                const {px, py} = isoProject(cx, cy, height);
                k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            });
            ctx.closePath();
            ctx.fill(); ctx.stroke();

            // Front face (y side)
            const yEdge = [[x,y+dy,height],[x+dx,y+dy,height],[x+dx,y+dy,0],[x,y+dy,0]];
            ctx.fillStyle = `hsla(${hue}, 60%, 30%, 0.85)`;
            ctx.beginPath();
            yEdge.forEach(([cx,cy,cz], k) => {
                const {px, py} = isoProject(cx, cy, cz);
                k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            });
            ctx.closePath();
            ctx.fill(); ctx.stroke();
        }
    }

    // Compute sum
    let rsum = 0;
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
            rsum += f((i+0.5)/n, (j+0.5)/n) * (1/n) * (1/n);
    const exact = 2/3;

    ctx.fillStyle = '#ccc'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`n = ${n}×${n} = ${n*n} rectangles`, 20, 30);
    ctx.fillText(`Riemann sum = ${rsum.toFixed(5)}`, 20, 50);
    ctx.fillText(`Exact (2/3)  = ${exact.toFixed(5)}`, 20, 70);
    ctx.fillText(`f(x,y) = x²+y² on [0,1]²`, 20, 90);
}

function animate() {
    drawGrid();
    if (growing) { n += 1; if (n > 15) { growing = false; } }
    else         { n -= 1; if (n <= 2) { growing = true; } }
    setTimeout(() => requestAnimationFrame(animate), 150);
}
animate();
```

**Walkthrough:** The canvas draws an isometric view of the 2D Riemann sum for $f(x,y) = x^2 + y^2$ on $[0,1]^2$. Each rectangle in the $xy$-grid becomes a 3D column with height $f(x_m, y_m)$ (the midpoint value). The "painter's algorithm" draws back-to-front so columns don't visually overlap incorrectly. As $n$ increases from 2 to 15 and back, you see the jagged approximation smooth out toward the exact volume $2/3$.

---

## Connect the Pieces

**Backwards:** Double integrals extend the Riemann integral (M-021) to 2D. FTC (M-022) is applied twice: once for the inner integral, once for the outer. Polar coordinates use the trig functions from M-015.

**Forwards:**
- M-028 (Jacobian): The $r\,dr\,d\theta$ area element in polar coordinates is the Jacobian determinant — derived there.
- M-037 (Probability): The joint density of two continuous random variables integrates to 1 over $\mathbb{R}^2$: $\iint f(x,y)\,dx\,dy = 1$.
- M-044 (Real Analysis): Fubini's theorem requires measurability conditions, not just continuity. The full statement is proved in Lebesgue integration theory.

---

## What Breaks Without This

**Without double integrals:**

- You cannot compute the volume of any solid bounded by a surface $z = f(x,y)$.
- Joint probability distributions have no mathematical foundation — $P(X \in A, Y \in B)$ requires $\iint_{A \times B} f(x,y)\,dx\,dy$.
- The moment of inertia $I = \iint r^2 \rho(x,y)\,dA$ (used in every mechanics problem involving rotation) is undefined.

**Without Fubini:**

- You are forced to evaluate the 2D limit directly — an $O(n^2)$ nested sum with no simplification.
- Choosing the wrong integration order becomes catastrophic: $\int_0^1\int_0^x \sin(y^2)\,dy\,dx$ has no antiderivative in $y$ (the function $\sin(y^2)$ does not integrate to a closed form). Swap the order: $\int_0^1\int_y^1 \sin(y^2)\,dx\,dy = \int_0^1 (1-y)\sin(y^2)\,dy$ — now the inner integral is trivially $(1-y)\sin(y^2)$ and the outer is computable.

**What the failure looks like:** Without Fubini, a numerical integrator must compute $n_x \times n_y$ samples. With Fubini, you can often reduce to $n_x + n_y$ samples by separating. For $n = 10^3$, that is $10^6$ vs $2000$ evaluations.

---

## Definition of Done

- [ ] You can state Fubini's theorem and explain when you can swap the integration order
- [ ] You can compute $\iint_D xy\,dA$ over $[0,2] \times [0,1]$ step by step, showing the inner and outer integrals
- [ ] You can set up and evaluate $\iint_{x^2+y^2 \leq R^2} 1\,dA$ using polar coordinates to derive $\pi R^2$
- [ ] You can explain the separability shortcut: when $f(x,y) = g(x)h(y)$ on a rectangle
- [ ] You ran the Python code and can explain the difference between `double_riemann_midpoint` and `iterated_integral`
- [ ] You watched the canvas animation and can describe what converges as $n$ increases

**Proof reconstruction (Sunday):** Evaluate $\int_0^1\int_0^1 (x^2 + y^2)\,dy\,dx$ by hand, showing both the inner integral evaluation and the outer integral. Then: why does $\int_0^\infty\int_0^\infty e^{-(x+y)}\,dx\,dy = 1$?

---

## Answers to Quick Check

1. Each segment is a rectangle: base = time, height = speed, area = distance. Constant 30 km/h for 2 hours = rectangle with area 60. Constant 60 km/h for 1 hour = rectangle with area 60. Total 120.
2. $f(x,y) = x + y$ has average value $\frac{1}{2} + \frac{1}{2} = 1$ on $[0,1]^2$, so $\iint f\,dA = 1 \times$ area $= 1$. You can verify: $\int_0^1\int_0^1 (x+y)\,dy\,dx = \int_0^1 [xy + y^2/2]_0^1\,dx = \int_0^1 (x + 1/2)\,dx = [x^2/2 + x/2]_0^1 = 1$.
3. Yes, always — if $f$ is continuous, Fubini guarantees both orders give the same answer. On a rectangle, both orders have constant limits. On a general region, the limits of the inner integral depend on the outer variable, but you can always choose either order; one may be easier to evaluate than the other.
