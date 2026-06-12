# M-018 — The Derivative as a Limit

**Phase 6 · Differential Calculus · Lesson 1 of 3**
**Pillar: Approximation** · *Instantaneous rate as the resolution of 0/0 — the central question of calculus*

---

## What You Will Build

A Canvas animation showing secant lines converging to the tangent line as $h \to 0$, and a Python program computing derivatives from first principles for $x^2$, $\sin(x)$, and $e^x$. You will derive $\frac{d}{dx}[x^2] = 2x$ and $\frac{d}{dx}[\sin x] = \cos x$ completely from the limit definition, no rules.

---

## What You Need to Know First

- M-016: epsilon-delta limits (derivative is defined as a limit)
- M-015: trig addition formulas (needed for $(\sin x)' = \cos x$)
- M-013: the exponential property $e^{x+h} = e^x \cdot e^h$ (needed for $(e^x)' = e^x$)

---

> **Quick Check — try to answer before reading:**
>
> 1. A car travels from $x = 0$ to $x = 100$ km in 2 hours. Average speed = 50 km/h. Is the instantaneous speed at time $t = 1$ necessarily 50 km/h?
> 2. On a graph, draw a curve. Draw two points close together. The slope of the line connecting them is what? What happens to this line as the points converge?
> 3. What does $\frac{d}{dx}[f(x)] = 0$ tell you about the shape of $f$?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Paradox of Instantaneous Rate

Speed = distance / time. At a single instant: both distance and time are zero. $0/0$ is undefined.

Yet speedometers exist. GPS tracks instantaneous velocity. Physics is built on it. The resolution: we do not actually measure speed at an instant — we measure it as the limit of average speeds over shrinking time intervals.

This is the derivative. The question is not "what is $0/0$?" — that is undefined. The question is: **what does $\frac{\Delta f}{\Delta x}$ approach as $\Delta x \to 0$?** That limit may be a well-defined number, and if it is, that number is the derivative.

---

### The Definition

$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$$

The expression $\frac{f(x+h) - f(x)}{h}$ is the slope of the **secant line** through $(x, f(x))$ and $(x+h, f(x+h))$. As $h \to 0$, the secant approaches the **tangent line** at $(x, f(x))$. The derivative is the slope of the tangent.

**Alternative notations (all mean the same thing):**

$f'(x) = \frac{df}{dx} = \frac{d}{dx}[f(x)] = Df(x)$

**Differentiability implies continuity:** If $f'(a)$ exists, then $f$ is continuous at $a$. (Proved: $\lim_{x \to a} f(x) = f(a)$ follows from the fact that the difference quotient has a finite limit.)

---

### Computing Derivatives from the Definition

#### $\frac{d}{dx}[x^2] = 2x$

$$\lim_{h \to 0} \frac{(x+h)^2 - x^2}{h} = \lim_{h \to 0} \frac{x^2 + 2xh + h^2 - x^2}{h} = \lim_{h \to 0} \frac{2xh + h^2}{h} = \lim_{h \to 0} (2x + h) = 2x \quad \square$$

#### $\frac{d}{dx}[\sin x] = \cos x$

$$\lim_{h \to 0} \frac{\sin(x+h) - \sin x}{h}$$

Using the angle addition formula $\sin(x+h) = \sin x \cos h + \cos x \sin h$:

$$= \lim_{h \to 0} \frac{\sin x \cos h + \cos x \sin h - \sin x}{h}$$

$$= \sin x \cdot \lim_{h \to 0} \frac{\cos h - 1}{h} + \cos x \cdot \lim_{h \to 0} \frac{\sin h}{h}$$

Two standard limits (proved geometrically from unit circle area arguments):

$$\lim_{h \to 0} \frac{\sin h}{h} = 1 \qquad \text{and} \qquad \lim_{h \to 0} \frac{\cos h - 1}{h} = 0$$

Therefore: $\frac{d}{dx}[\sin x] = \sin x \cdot 0 + \cos x \cdot 1 = \cos x$. $\square$

#### $\frac{d}{dx}[e^x] = e^x$

$$\lim_{h \to 0} \frac{e^{x+h} - e^x}{h} = \lim_{h \to 0} \frac{e^x \cdot e^h - e^x}{h} = e^x \cdot \lim_{h \to 0} \frac{e^h - 1}{h}$$

The limit $\lim_{h \to 0} \frac{e^h - 1}{h} = 1$ — this follows from the definition of $e$ as the base where the derivative at 0 is 1. (Rigorous proof: via L'Hôpital in M-020, or via the Taylor series in M-025.)

Therefore: $\frac{d}{dx}[e^x] = e^x \cdot 1 = e^x$. $\square$

```javascript
// Canvas: secant lines converging to the tangent of f(x) = x^2 at x = 1
const canvas = document.createElement('canvas');
canvas.width = 520;
canvas.height = 420;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const f = x => x * x;
const fPrime = x => 2 * x;

// Coordinate: x in [-0.5, 3], y in [-0.5, 6]
const toC = (mx, my) => ({
    x: (mx + 0.5) / 3.5 * 490 + 15,
    y: 410 - (my + 0.5) / 6.5 * 400
});

let h_value = 2.0, decreasing = true;

function draw() {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, 520, 420);

    const a = 1.0;  // point of tangency

    // Axes
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(toC(-0.5, 0).x, toC(-0.5, 0).y);
    ctx.lineTo(toC(3, 0).x,    toC(3, 0).y);
    ctx.moveTo(toC(0, -0.5).x, toC(0, -0.5).y);
    ctx.lineTo(toC(0, 6).x,    toC(0, 6).y);
    ctx.stroke();

    // Parabola
    ctx.beginPath(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    let first = true;
    for (let i = 0; i <= 400; i++) {
        const mx = -0.5 + i * 3.5 / 400;
        const my = f(mx);
        if (my < -0.5 || my > 6.5) { first = true; continue; }
        const {x, y} = toC(mx, my);
        first ? (ctx.moveTo(x,y), first=false) : ctx.lineTo(x,y);
    }
    ctx.stroke();

    // Secant line through (a, f(a)) and (a+h, f(a+h))
    if (h_value > 1e-5) {
        const x1 = a, y1 = f(a);
        const x2 = a + h_value, y2 = f(a + h_value);
        const slope = (y2 - y1) / (x2 - x1);
        const p1 = toC(-0.5, y1 + slope * (-0.5 - x1));
        const p2 = toC(3, y1 + slope * (3 - x1));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#ff9800'; ctx.lineWidth = 1.5;
        ctx.stroke();

        // Second point
        const pt2 = toC(x2, y2);
        ctx.beginPath(); ctx.arc(pt2.x, pt2.y, 4, 0, 2*Math.PI);
        ctx.fillStyle = '#ff9800'; ctx.fill();
    }

    // Tangent line (the limit as h → 0)
    const tangentSlope = fPrime(a);
    const pt1 = toC(-0.5, f(a) + tangentSlope * (-0.5 - a));
    const pt2 = toC(3, f(a) + tangentSlope * (3 - a));
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y); ctx.lineTo(pt2.x, pt2.y);
    ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 2;
    ctx.stroke();

    // Point of tangency
    const center = toC(a, f(a));
    ctx.beginPath(); ctx.arc(center.x, center.y, 5, 0, 2*Math.PI);
    ctx.fillStyle = '#4fc3f7'; ctx.fill();

    // Labels
    ctx.fillStyle = '#ccc'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`h = ${h_value.toFixed(5)}`, 20, 30);
    ctx.fillText(`slope of secant = ${h_value > 1e-5 ? ((f(a+h_value)-f(a))/h_value).toFixed(5) : '—'}`, 20, 50);
    ctx.fillStyle = '#4fc3f7';
    ctx.fillText(`tangent slope = ${tangentSlope.toFixed(2)} (= 2·1 = f'(1))`, 20, 75);
    ctx.fillStyle = '#aaa';
    ctx.fillText("f(x) = x²   Point: x = 1", 20, 400);
}

function animate() {
    draw();
    if (decreasing) {
        h_value *= 0.992;
        if (h_value < 1e-4) decreasing = false;
    } else {
        h_value /= 0.94;
        if (h_value > 2.0) decreasing = true;
    }
    requestAnimationFrame(animate);
}
animate();
```

```python
import math

def numerical_derivative(f, x, h=1e-7):
    """Forward difference quotient: (f(x+h) - f(x)) / h."""
    return (f(x + h) - f(x)) / h

def central_derivative(f, x, h=1e-5):
    """Central difference: (f(x+h) - f(x-h)) / (2h). More accurate."""
    return (f(x + h) - f(x - h)) / (2 * h)

# Test functions and their known derivatives
test_cases = [
    (lambda x: x**2,      lambda x: 2*x,        "x²",      2*x for x in [0, 1, -1, 2]),
    (math.sin,             math.cos,              "sin(x)",  [0, 1, -1, math.pi/4]),
    (math.exp,             math.exp,              "e^x",     [0, 1, -1, 2]),
    (math.log,             lambda x: 1/x,         "ln(x)",   [0.5, 1, 2, 10]),
]

def run_tests(fn, exact_deriv, name, test_x_values):
    print(f"Function: {name}")
    print(f"  {'x':>6}  {'exact f\'(x)':>14}  {'numerical':>14}  {'error':>10}")
    for x in test_x_values:
        exact = exact_deriv(x)
        numerical = central_derivative(fn, x)
        err = abs(numerical - exact)
        print(f"  {x:>6.3f}  {exact:>14.8f}  {numerical:>14.8f}  {err:>10.2e}")
    print()

print("=== Derivatives from first principles (central difference) ===")
print()
run_tests(lambda x: x**2, lambda x: 2*x, "x²", [0, 1, -1, 2, 3])
run_tests(math.sin, math.cos, "sin(x)", [0, 1, -1, math.pi/4, math.pi/2])
run_tests(math.exp, math.exp, "e^x",   [0, 1, -1, 2])
run_tests(math.log, lambda x: 1/x, "ln(x)", [0.5, 1, 2, 10])

# The key limit: sin(h)/h → 1 as h → 0
print("=== Key limit: sin(h)/h → 1 as h → 0 ===")
print(f"{'h':>12}  {'sin(h)/h':>14}")
for h in [1.0, 0.1, 0.01, 0.001, 0.0001, 1e-6]:
    val = math.sin(h) / h
    print(f"{h:>12.6f}  {val:>14.12f}")
print()

print("=== Key limit: (cos(h)-1)/h → 0 as h → 0 ===")
print(f"{'h':>12}  {'(cos(h)-1)/h':>16}")
for h in [1.0, 0.1, 0.01, 0.001, 0.0001, 1e-6]:
    val = (math.cos(h) - 1) / h
    print(f"{h:>12.6f}  {val:>16.12f}")
```

---

## Connect the Pieces

**The derivative is a limit.** Every property of derivatives is a consequence of limit properties.

**Backwards:** M-016 defined limits. M-015 provided the trig addition formula used in $(\sin x)' = \cos x$. M-013 provided $e^{x+h} = e^x e^h$ used in $(e^x)' = e^x$.

**Forwards:**
- M-019: Differentiation rules (product, chain) derived using this definition.
- M-020: Mean Value Theorem — a theorem about derivatives, proved using limits and continuity.
- M-022: FTC Part 1 — $\frac{d}{dx}\int_a^x f(t)dt = f(x)$, proved using the limit definition.
- M-025: Taylor series — the derivative tells you the coefficient of $x^n$ in the series expansion.

---

## What Breaks Without This

Without deriving from the definition:
- You accept the derivative as a rule rather than understanding it as a limit. When you encounter a function that breaks the rules (non-differentiable at a cusp, or defined piecewise), you have no tool to compute the derivative — you can only check "does a rule apply?"
- You cannot understand the chain rule as a limit statement (Phase 6).
- You cannot prove that $\frac{d}{dx}[e^x] = e^x$ — you can only assert it.

---

## Definition of Done

- [ ] You can state the definition of the derivative as a limit and explain the secant-to-tangent geometry
- [ ] You can derive $\frac{d}{dx}[x^2] = 2x$ from the definition (5-line calculation)
- [ ] You can outline the proof of $\frac{d}{dx}[\sin x] = \cos x$, citing the addition formula and two key limits
- [ ] You can explain why differentiability implies continuity
- [ ] You ran the canvas animation and Python code

**Proof reconstruction (Sunday):** Derive $\frac{d}{dx}[x^3] = 3x^2$ from the limit definition. Then outline (not full proof) why $\frac{d}{dx}[\sin x] = \cos x$.

---

## Answers to Quick Check

1. Not necessarily. Average 50 km/h tells you about the whole journey, not the speed at $t = 1$.
2. The slope of the **secant line** connecting two points. As the points converge ($h \to 0$), the secant approaches the **tangent line** — a line touching the curve at exactly one point with the same slope as the curve.
3. $f'(x) = 0$ means the function is momentarily "flat" — neither increasing nor decreasing. This is a necessary condition for a local maximum or minimum (but not sufficient — could also be an inflection point).
