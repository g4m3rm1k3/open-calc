# M-026 — Partial Derivatives and the Gradient

**Phase 9 · Multivariable Calculus · Lesson 1 of 3**
**Pillar: Approximation** · *Extending derivatives to functions of several variables*

---

## What You Will Build

A Python program computing gradients of scalar functions and demonstrating that gradient descent follows the steepest ascent direction. A Canvas heatmap of a 2D function with gradient arrows overlaid.

---

## What You Need to Know First

- M-018: single-variable derivatives (partial derivatives use the same definition)
- M-029: vectors (gradient is a vector of partial derivatives)

---

> **Quick Check — try to answer before reading:**
>
> 1. $f(x, y) = x^2 + y^2$. How fast does $f$ change as $x$ increases while $y$ is held fixed?
> 2. The gradient $\nabla f$ points "uphill." Is this a definition or a theorem?
> 3. If $f(x, y) = x^2 + y^2$, what is the gradient at $(1, 1)$? What direction does steepest ascent point?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Partial Derivatives

For $f: \mathbb{R}^n \to \mathbb{R}$, the **partial derivative** with respect to $x_i$ is:

$$\frac{\partial f}{\partial x_i} = \lim_{h \to 0} \frac{f(\ldots, x_i + h, \ldots) - f(\ldots, x_i, \ldots)}{h}$$

All other variables are treated as constants. Every rule from single-variable calculus applies.

**Example:** $f(x, y) = x^2 y + \sin(xy)$

$\frac{\partial f}{\partial x} = 2xy + y\cos(xy)$ (treat $y$ as constant)

$\frac{\partial f}{\partial y} = x^2 + x\cos(xy)$ (treat $x$ as constant)

**Second-order partials:**

$\frac{\partial^2 f}{\partial x^2}$ — differentiate with respect to $x$ twice.

$\frac{\partial^2 f}{\partial y \partial x}$ — differentiate first with respect to $x$, then $y$.

**Clairaut's theorem:** If the mixed partials are continuous: $\frac{\partial^2 f}{\partial y \partial x} = \frac{\partial^2 f}{\partial x \partial y}$. Order does not matter.

---

### The Gradient

The **gradient** of $f: \mathbb{R}^n \to \mathbb{R}$ is the vector of all partial derivatives:

$$\nabla f = \left(\frac{\partial f}{\partial x_1}, \frac{\partial f}{\partial x_2}, \ldots, \frac{\partial f}{\partial x_n}\right)$$

**Theorem:** $\nabla f(\mathbf{a})$ points in the direction of steepest ascent of $f$ at $\mathbf{a}$.

**Proof sketch:** The **directional derivative** in direction $\hat{u}$ (a unit vector) is:

$$D_{\hat{u}} f = \nabla f \cdot \hat{u} = |\nabla f| \cos\theta$$

where $\theta$ is the angle between $\nabla f$ and $\hat{u}$. This is maximised when $\theta = 0$, i.e. when $\hat{u}$ points in the same direction as $\nabla f$. $\square$

This is a theorem about dot products and directions — not a definition. The gradient direction is the one that maximises the directional derivative.

**Machine learning connection:** **Gradient descent** minimises a function $L(\theta)$ by iterating $\theta \leftarrow \theta - \alpha \nabla L(\theta)$. At each step, we move opposite the gradient (downhill) by step size $\alpha$. Every neural network training algorithm is gradient descent or a variant.

---

### The Multivariable Chain Rule

If $z = f(x, y)$ where $x = g(t)$ and $y = h(t)$:

$$\frac{dz}{dt} = \frac{\partial f}{\partial x} \cdot \frac{dx}{dt} + \frac{\partial f}{\partial y} \cdot \frac{dy}{dt} = \nabla f \cdot \left(\frac{dx}{dt}, \frac{dy}{dt}\right)$$

In general: $\frac{d}{dt}[f(\mathbf{g}(t))] = \nabla f(\mathbf{g}(t)) \cdot \mathbf{g}'(t)$.

This is the chain rule from M-019, extended to vector inputs.

```python
import math

def gradient(f, x, y, h=1e-6):
    """Numerically compute gradient of f at (x, y) using central differences."""
    df_dx = (f(x + h, y) - f(x - h, y)) / (2 * h)
    df_dy = (f(x, y + h) - f(x, y - h)) / (2 * h)
    return df_dx, df_dy

def norm(v):
    return math.sqrt(sum(c**2 for c in v))

def normalize(v):
    n = norm(v)
    return tuple(c/n for c in v)

# Test function: f(x,y) = x^2 + y^2 (paraboloid)
print("=== Gradient of f(x,y) = x² + y² ===")
print("Exact: ∇f = (2x, 2y)")
print()

test_points = [(1, 1), (2, 0), (1, -1), (0, 3), (-2, 1)]
for (x, y) in test_points:
    gx, gy = gradient(lambda x, y: x**2 + y**2, x, y)
    exact_x, exact_y = 2*x, 2*y
    err = math.sqrt((gx - exact_x)**2 + (gy - exact_y)**2)
    print(f"  ({x:5.2f}, {y:5.2f}): ∇f ≈ ({gx:.4f}, {gy:.4f})  exact ({exact_x:.4f}, {exact_y:.4f})  error={err:.2e}")

print()
# Directional derivative: D_u f = ∇f · u (dot product)
print("=== Directional Derivatives: D_u f = ∇f · û ===")
print("f(x,y) = x² + y², at point (1, 1), gradient = (2, 2)")
print()
gx, gy = 2.0, 2.0      # gradient at (1,1)
grad_magnitude = norm((gx, gy))
print(f"  |∇f| = {grad_magnitude:.4f}  (magnitude of steepest ascent)")
print()
directions = [
    ("along x",        (1, 0)),
    ("along y",        (0, 1)),
    ("gradient dir",   normalize((gx, gy))),
    ("45 degrees",     normalize((1, 1))),
    ("opposite grad",  normalize((-gx, -gy))),
    ("perpendicular",  normalize((-gy, gx))),
]
for (name, (ux, uy)) in directions:
    directional = gx*ux + gy*uy   # dot product ∇f · û
    print(f"  Direction '{name:20s}': D_u f = {directional:.4f}  (max possible = {grad_magnitude:.4f})")

print()
# Gradient descent on f(x,y) = (x-1)^2 + (y-2)^2 (minimum at (1,2))
print("=== Gradient Descent: minimising f(x,y) = (x-1)² + (y-2)² ===")
print("Minimum is at (1, 2), f(1,2) = 0")
print()
f = lambda x, y: (x-1)**2 + (y-2)**2
x, y = 5.0, -3.0   # start far from minimum
alpha = 0.1         # step size (learning rate)
print(f"{'Step':>5}  {'x':>8}  {'y':>8}  {'f(x,y)':>12}  |∇f|")
print("-" * 50)
for step in range(20):
    gx, gy = gradient(f, x, y)
    fx = f(x, y)
    print(f"{step:>5}  {x:>8.4f}  {y:>8.4f}  {fx:>12.6f}  {norm((gx,gy)):.4f}")
    x -= alpha * gx    # move opposite gradient (downhill)
    y -= alpha * gy
    if fx < 1e-10:
        break
```

```javascript
// Canvas: heatmap of f(x,y) = x^2 + y^2 with gradient arrows
const canvas = document.createElement('canvas');
canvas.width = 400; canvas.height = 400;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const W = 400, H = 400;
const xMin = -3, xMax = 3, yMin = -3, yMax = 3;
const f = (x, y) => x*x + y*y;
const fMax = 18;

// Heatmap
const imgData = ctx.createImageData(W, H);
for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
        const mx = xMin + (xMax - xMin) * px / W;
        const my = yMax - (yMax - yMin) * py / H;
        const val = Math.min(f(mx, my) / fMax, 1);
        const r = Math.floor(val * 30);
        const g = Math.floor(val * 80 + (1-val) * 30);
        const b = Math.floor((1-val) * 150 + val * 80);
        const i = (py * W + px) * 4;
        imgData.data[i]=r; imgData.data[i+1]=g; imgData.data[i+2]=b; imgData.data[i+3]=255;
    }
}
ctx.putImageData(imgData, 0, 0);

const toC = (mx, my) => ({
    x: (mx - xMin) / (xMax - xMin) * W,
    y: H - (my - yMin) / (yMax - yMin) * H
});

// Gradient arrows at a grid of points
const h = 1e-5;
ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 1.5;
for (let mx = -2.5; mx <= 2.5; mx += 1) {
    for (let my = -2.5; my <= 2.5; my += 1) {
        const gx = (f(mx+h, my) - f(mx-h, my)) / (2*h);
        const gy = (f(mx, my+h) - f(mx, my-h)) / (2*h);
        const len = Math.sqrt(gx*gx + gy*gy);
        if (len < 1e-10) continue;
        const scale = 0.2;
        const {x: x0, y: y0} = toC(mx, my);
        const {x: x1, y: y1} = toC(mx + scale*gx/len, my + scale*gy/len);
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
        // Arrowhead
        const angle = Math.atan2(y1-y0, x1-x0);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - 8*Math.cos(angle-0.4), y1 - 8*Math.sin(angle-0.4));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - 8*Math.cos(angle+0.4), y1 - 8*Math.sin(angle+0.4));
        ctx.stroke();
    }
}

// Contour labels and origin
const orig = toC(0, 0);
ctx.beginPath(); ctx.arc(orig.x, orig.y, 4, 0, 2*Math.PI);
ctx.fillStyle = '#fff'; ctx.fill();
ctx.fillStyle = '#ccc'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
ctx.fillText('f(x,y) = x²+y²  arrows = ∇f', 200, 390);
```

---

## Connect the Pieces

**Backwards:** Partial derivatives are single-variable derivatives (M-018) with other variables held constant. The gradient uses vectors (M-029).

**Forwards:**
- M-027 (Multiple integrals): the gradient and Jacobian are needed for change of variables.
- M-028 (Jacobian): the Jacobian generalises the derivative to vector-valued functions.
- M-031 (Linear algebra): the gradient at a point is the linear approximation to $f$ near that point — the first-order Taylor approximation in multiple dimensions.
- Machine learning: every neural network trains by computing gradients via backpropagation (M-019 chain rule applied to compositions of layers).

---

## Definition of Done

- [ ] You can compute partial derivatives of functions of two and three variables
- [ ] You can explain why $\nabla f$ points in the direction of steepest ascent (as a theorem, not a definition)
- [ ] You can implement gradient descent and explain what the learning rate $\alpha$ controls
- [ ] You ran the Python code and can describe what gradient descent does in the output

**Proof reconstruction (Sunday):** Prove that the directional derivative $D_{\hat{u}} f = \nabla f \cdot \hat{u}$ is maximised when $\hat{u}$ is in the direction of $\nabla f$. (Use the dot product formula $\mathbf{a} \cdot \mathbf{b} = |\mathbf{a}||\mathbf{b}|\cos\theta$.)

---

## Answers to Quick Check

1. $\frac{\partial}{\partial x}[x^2 + y^2] = 2x$ (treat $y$ as constant).
2. Theorem. The gradient direction is proved to maximise the directional derivative using the dot product formula.
3. $\nabla f = (2x, 2y)$. At $(1, 1)$: $\nabla f = (2, 2)$. Steepest ascent points in direction $(1, 1)$ (normalised: $(1/\sqrt{2}, 1/\sqrt{2})$), i.e. diagonally away from the origin.
