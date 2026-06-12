# M-009 — Inverse Functions

**Phase 2 · Functions and Their Behaviour · Lesson 2 of 3**
**Pillar: Transformation** · *The recurring idea of undoing — from arithmetic to calculus to linear algebra*

---

## What You Will Build

A Canvas animation showing a function and its inverse as reflections across $y = x$. A Python program verifying that $f^{-1}(f(x)) = x$ numerically for several function pairs. And a systematic view of when inverses exist and why.

---

## What You Need to Know First

- M-008: the formal definition of function, injectivity, surjectivity, bijectivity.

---

> **Quick Check — try to answer before reading:**
>
> 1. What is the inverse of $f(x) = 2x + 3$? How do you find it?
> 2. Does $f(x) = x^2$ have an inverse? If you restrict the domain, can it?
> 3. What is the inverse of the inverse? That is, what is $(f^{-1})^{-1}$?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### When Does an Inverse Exist?

The **inverse** of $f: A \to B$ is a function $f^{-1}: B \to A$ satisfying:
$$f^{-1}(f(x)) = x \quad \forall x \in A \qquad \text{and} \qquad f(f^{-1}(y)) = y \quad \forall y \in B$$

In words: applying $f$ then $f^{-1}$ gets you back to where you started (in $A$), and applying $f^{-1}$ then $f$ gets you back to where you started (in $B$).

**Theorem:** $f$ has an inverse if and only if $f$ is bijective.

**Proof:**

($\Rightarrow$ If $f^{-1}$ exists, then $f$ is bijective):

*Injective:* Suppose $f(x_1) = f(x_2)$. Apply $f^{-1}$ to both sides: $f^{-1}(f(x_1)) = f^{-1}(f(x_2))$, so $x_1 = x_2$. So $f$ is injective.

*Surjective:* For any $y \in B$: $f(f^{-1}(y)) = y$, so $y$ is in the image of $f$. So $f$ is surjective.

($\Leftarrow$ If $f$ is bijective, then $f^{-1}$ exists):

For each $y \in B$: since $f$ is surjective, there exists $x \in A$ with $f(x) = y$. Since $f$ is injective, this $x$ is unique. Define $f^{-1}(y) = x$. This defines a function (unique value for each input) and satisfies both inverse conditions. $\square$

**What this tells you:** To check whether a function has an inverse, check bijectivity. If it fails injectivity (two inputs give the same output), the inverse would need to send that output to two inputs — which makes it not a function. If it fails surjectivity, the inverse would be undefined at elements of $B$ not in the image of $f$.

### Restricting Domains

$f(x) = x^2$ is not injective on $\mathbb{R}$ (both $2$ and $-2$ give $4$). But if we restrict the domain to $[0, \infty)$, the function becomes injective and surjective onto $[0, \infty)$. Its inverse on this restricted domain is $f^{-1}(x) = \sqrt{x}$.

This domain restriction is how we define $\sin^{-1}$, $\cos^{-1}$, and $\tan^{-1}$ in Phase 4: the trig functions are not injective on all of $\mathbb{R}$, so we restrict to a principal branch where they are bijective.

### The Graphical Interpretation

If $(a, b)$ is a point on the graph of $f$ (meaning $f(a) = b$), then $(b, a)$ is on the graph of $f^{-1}$ (meaning $f^{-1}(b) = a$).

Swapping coordinates $(a, b) \to (b, a)$ corresponds geometrically to reflecting across the line $y = x$.

Therefore: **the graph of $f^{-1}$ is the reflection of the graph of $f$ across $y = x$.**

```javascript
// Canvas: f(x) = 2^x and its inverse ln(x), reflected across y = x
const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#0d1117';
ctx.fillRect(0, 0, 500, 500);

// Coordinate transform: math coords to canvas pixels
// Math: x in [-1.5, 4], y in [-1.5, 4]
const mathToPixel = (mx, my) => ({
    x: (mx + 1.5) / 5.5 * 480 + 10,
    y: 490 - (my + 1.5) / 5.5 * 480
});

// Axes
ctx.strokeStyle = '#444';
ctx.lineWidth = 1;
const origin = mathToPixel(0, 0);
ctx.beginPath();
ctx.moveTo(10, origin.y);
ctx.lineTo(490, origin.y);
ctx.moveTo(origin.x, 10);
ctx.lineTo(origin.x, 490);
ctx.stroke();

// y = x line (reflection axis)
ctx.strokeStyle = '#444';
ctx.setLineDash([5, 5]);
ctx.lineWidth = 1;
ctx.beginPath();
let p = mathToPixel(-1.5, -1.5);
ctx.moveTo(p.x, p.y);
p = mathToPixel(4, 4);
ctx.lineTo(p.x, p.y);
ctx.stroke();
ctx.setLineDash([]);

function drawCurve(fn, xMin, xMax, color, steps = 400) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    let first = true;
    for (let i = 0; i <= steps; i++) {
        const mx = xMin + (xMax - xMin) * i / steps;
        const my = fn(mx);
        if (!isFinite(my) || my < -1.5 || my > 4.5) { first = true; continue; }
        const {x, y} = mathToPixel(mx, my);
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

// f(x) = 2^x
drawCurve(x => Math.pow(2, x), -1.5, 4, '#4fc3f7');
// f^{-1}(x) = log_2(x) = ln(x)/ln(2)
drawCurve(x => Math.log(x) / Math.log(2), 0.001, 4, '#ff9800');

// Label axes and curves
ctx.fillStyle = '#4fc3f7';
ctx.font = '14px serif';
ctx.fillText('f(x) = 2ˣ', ...Object.values(mathToPixel(2.5, 3.5)));

ctx.fillStyle = '#ff9800';
ctx.fillText('f⁻¹(x) = log₂(x)', ...Object.values(mathToPixel(1.8, 0.2)));

ctx.fillStyle = '#666';
ctx.font = '12px serif';
ctx.fillText('y = x', ...Object.values(mathToPixel(3.4, 3.0)));

// Show a point and its reflection: (1, 2) on f, (2, 1) on f^{-1}
const pt1 = mathToPixel(1, 2);
const pt2 = mathToPixel(2, 1);
ctx.fillStyle = '#fff';
[pt1, pt2].forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
    ctx.fill();
});
ctx.strokeStyle = '#888';
ctx.setLineDash([3, 3]);
ctx.beginPath();
ctx.moveTo(pt1.x, pt1.y);
ctx.lineTo(pt2.x, pt2.y);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = '#ccc';
ctx.font = '11px monospace';
ctx.fillText('(1, 2)', pt1.x + 7, pt1.y - 5);
ctx.fillText('(2, 1)', pt2.x + 7, pt2.y + 14);
```

**Walkthrough:** The canvas draws $f(x) = 2^x$ in blue and its inverse $f^{-1}(x) = \log_2 x$ in orange, both on the same axes. The dashed line $y = x$ is the mirror. A white dot marks the point $(1, 2)$ on $f$ (since $2^1 = 2$) and its reflection $(2, 1)$ on $f^{-1}$ (since $\log_2 2 = 1$). The dashed connecting line confirms they are reflections. The `drawCurve` helper samples the function at 400 points and connects them — this is the basic technique for rendering continuous curves on a canvas, used throughout the curriculum.

```python
import math

# Verify f^{-1}(f(x)) = x for several function pairs

def verify_inverse_pair(f, f_inv, name_f, name_inv, domain_samples):
    """
    Numerically verify that f_inv(f(x)) = x for all sample points.
    """
    max_error = 0
    for x in domain_samples:
        roundtrip = f_inv(f(x))
        error = abs(roundtrip - x)
        max_error = max(max_error, error)
    return max_error

print("Verifying f⁻¹(f(x)) = x for inverse function pairs")
print()

sample_positive = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
sample_real     = [-2.0, -1.0, 0.0, 1.0, 2.0, 3.0]

pairs = [
    (lambda x: x**2, math.sqrt, "x²", "√x", sample_positive),
    (math.exp, math.log, "eˣ", "ln(x)", sample_real),
    (lambda x: 2*x + 3, lambda y: (y - 3)/2, "2x+3", "(y-3)/2", sample_real),
    (lambda x: x**3, lambda y: y**(1/3) if y >= 0 else -((-y)**(1/3)), "x³", "∛x", sample_real),
]

for (f, f_inv, name_f, name_inv, samples) in pairs:
    error = verify_inverse_pair(f, f_inv, name_f, name_inv, samples)
    print(f"  f = {name_f:12s},  f⁻¹ = {name_inv:12s},  max |f⁻¹(f(x))-x| = {error:.2e}  {'✓' if error < 1e-10 else '✗'}")

print()
print("Note: errors are floating-point rounding (~1e-15), not mathematical errors.")
print("The inverse relationship f⁻¹(f(x)) = x is exact.")
```

---

### The Inverse Is Unique

**Theorem:** If $f: A \to B$ is bijective, its inverse is unique.

**Proof:** Suppose $g$ and $h$ are both inverses of $f$. Then for any $y \in B$:

$$g(y) = g(f(f^{-1}(y))) = (g \circ f)(f^{-1}(y)) = \text{id}_A(f^{-1}(y)) = f^{-1}(y)$$

Wait — this just says $g = f^{-1}$ using $f^{-1}$ itself. Let's do it properly without assuming one inverse:

For any $y \in B$: $g(y) = g(f(h(y))) = h(y)$, using $g(f(x)) = x$ and the fact that $f(h(y)) = y$. Since $g(y) = h(y)$ for all $y \in B$, we have $g = h$. $\square$

---

### The Inverse Theme

This is one of the most important threads in the curriculum:

| Context | Object | Inverse | Condition |
|---|---|---|---|
| Arithmetic | $a \neq 0$ | $a^{-1} = 1/a$ | $a \neq 0$ |
| Functions | $f: A \to B$ | $f^{-1}: B \to A$ | $f$ bijective |
| Matrices | $A: \mathbb{R}^n \to \mathbb{R}^n$ | $A^{-1}$ | $\det A \neq 0$ |
| Calculus | $\frac{d}{dx}$ | $\int \cdot\, dx$ | (FTC, Phase 7) |
| Logs & exp | $e^x$ | $\ln x$ | (Phase 4) |
| Groups | $a \in G$ | $a^{-1}$ with $a \cdot a^{-1} = e$ | Always (axiom M4) |

Each row is a different manifestation of the same idea. When you see "inverse" in any context, you are seeing the same concept.

---

## Connect the Pieces

**Backwards:** M-008 defined bijective functions — the prerequisite for inverses. M-003 introduced multiplicative inverses in the field axioms — the original instance of the inverse idea.

**Forwards:**
- M-010 (Composition): The composition $f \circ f^{-1} = \text{id}$ is a composition of functions.
- M-014 (Logarithms): $\ln = \exp^{-1}$ — the logarithm is defined as the inverse of the exponential.
- M-031 (Matrix inverse): $A^{-1}$ is the matrix inverse, defined by $AA^{-1} = I$.
- M-022 (FTC): integration inverts differentiation — the deepest inverse in calculus.

---

## What Breaks Without This

Without the precise inverse condition:
- Students compute $f^{-1}$ by "swapping $x$ and $y$" without understanding when this is valid. For $f(x) = x^2$ on $\mathbb{R}$, swapping gives $x = y^2$, then $y = \pm\sqrt{x}$ — but which sign? The answer is: it depends on which restriction you impose to make $f$ bijective.
- The derivative of $f^{-1}$ (the inverse function theorem, Phase 6) requires the inverse to exist. Without knowing the bijection condition, you cannot state when the theorem applies.

---

## Definition of Done

- [ ] You can state the definition of the inverse of a function, including both conditions
- [ ] You can prove that an inverse exists if and only if the function is bijective
- [ ] You can explain geometrically why the graph of $f^{-1}$ is the reflection of $f$ across $y = x$
- [ ] You can give three examples of the inverse concept in different mathematical contexts
- [ ] You ran both the canvas and Python code and can explain what each demonstrates

**Proof reconstruction (Sunday):** Prove that if $f$ is bijective then its inverse is unique. (Do not use "the inverse" in the proof — prove that any two left-inverses must be equal.)

---

## Answers to Quick Check

1. $f^{-1}(y) = (y - 3)/2$. Found by solving $y = 2x + 3$ for $x$.
2. $f(x) = x^2$ does not have an inverse on $\mathbb{R}$ (not injective: $f(2) = f(-2) = 4$). Restricted to $[0, \infty) \to [0, \infty)$, it is bijective and $f^{-1}(y) = \sqrt{y}$.
3. $(f^{-1})^{-1} = f$. The inverse of the inverse is the original function.
