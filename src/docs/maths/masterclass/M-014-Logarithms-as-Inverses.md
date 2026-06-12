# M-014 — Logarithms as Inverses

**Phase 4 · Exponentials, Logarithms, and Trigonometry · Lesson 2 of 3**
**Pillar: Transformation** · *Every log law derived from exponent laws — via the inverse relationship*

---

## What You Will Build

A Python program deriving and verifying all logarithm laws, plus a Canvas showing $\ln(x)$ as the reflection of $e^x$ across $y = x$. After this lesson you never need to memorise a log law — you derive it from the corresponding exponent law in one step.

---

## What You Need to Know First

- M-007: exponent laws (all log laws follow directly from these)
- M-009: inverse functions (the logarithm is the inverse of the exponential)
- M-013: the exponential function (the logarithm inverts it)

---

> **Quick Check — try to answer before reading:**
>
> 1. If $\ln(ab) = \ln a + \ln b$, which exponent law does this correspond to?
> 2. What is $\ln(e^5)$? What is $e^{\ln 7}$? Why?
> 3. What is the domain of $\ln(x)$? Why can't you take $\ln$ of a negative number?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Definition: The Logarithm as Inverse

Since $f(x) = e^x$ is a bijection from $\mathbb{R}$ to $(0, \infty)$ (it is strictly increasing, maps $\mathbb{R}$ to all positive reals), it has an inverse (M-009):

$$\ln : (0, \infty) \to \mathbb{R}, \qquad \ln = \exp^{-1}$$

By the definition of inverse:
$$\ln(e^x) = x \quad \forall x \in \mathbb{R} \qquad \text{and} \qquad e^{\ln x} = x \quad \forall x > 0$$

These two identities are the definition. Everything else follows from them.

**The domain is $(0, \infty)$** — you can only take the logarithm of a positive number. Why? Because the range of $e^x$ is $(0, \infty)$: for every positive $y$, there is exactly one $x$ with $e^x = y$; for $y \leq 0$, there is no such $x$ (since $e^x > 0$ always). The logarithm is simply undefined for $y \leq 0$.

---

### Deriving the Logarithm Laws from Exponent Laws

Every log law is the exponent law in disguise. This is how you derive them — not how you memorise them.

**Law 1: $\ln(ab) = \ln a + \ln b$**

Let $a = e^s$ and $b = e^t$ (we can do this because $\exp$ is surjective onto $(0, \infty)$: every positive number is $e^{\text{something}}$). Then $s = \ln a$ and $t = \ln b$.

$$\ln(ab) = \ln(e^s \cdot e^t) = \ln(e^{s+t}) \quad \text{(exponent law 1: } e^s \cdot e^t = e^{s+t}\text{)}$$
$$= s + t = \ln a + \ln b \quad \square$$

**Law 2: $\ln(a/b) = \ln a - \ln b$**

$\ln(a/b) = \ln(a \cdot b^{-1}) = \ln a + \ln(b^{-1})$. By Law 3 below (with $r = -1$): $\ln(b^{-1}) = -\ln b$. $\square$

**Law 3: $\ln(a^r) = r \ln a$ (for $r \in \mathbb{R}$, $a > 0$)**

$$\ln(a^r) = \ln((e^{\ln a})^r) = \ln(e^{r \ln a}) \quad \text{(exponent law 2)}$$
$$= r \ln a \quad \square$$

**Change of base:** $\log_b(x) = \frac{\ln x}{\ln b}$. Derived:

$y = \log_b x$ means $b^y = x$. Take $\ln$ of both sides: $y \ln b = \ln x$, so $y = \frac{\ln x}{\ln b}$.

**The pattern:** Every log law is one step from the corresponding exponent law, using the substitution $a = e^{\ln a}$. This means you only need to remember the exponent laws — the log laws are free.

```python
import math

print("=== Deriving log laws from exponent laws ===")
print()

a, b, r = 5.0, 3.0, 2.7

# Law 1: ln(ab) = ln(a) + ln(b)
lhs = math.log(a * b)
rhs = math.log(a) + math.log(b)
print(f"Law 1: ln(ab) = ln(a) + ln(b)")
print(f"  ln({a}·{b}) = ln({a*b}) = {lhs:.8f}")
print(f"  ln({a}) + ln({b}) = {math.log(a):.8f} + {math.log(b):.8f} = {rhs:.8f}")
print(f"  Equal: {abs(lhs - rhs) < 1e-12} ✓")
print()

# Law 2: ln(a/b) = ln(a) - ln(b)
lhs2 = math.log(a / b)
rhs2 = math.log(a) - math.log(b)
print(f"Law 2: ln(a/b) = ln(a) - ln(b)")
print(f"  ln({a}/{b}) = {lhs2:.8f}")
print(f"  ln({a}) - ln({b}) = {rhs2:.8f}")
print(f"  Equal: {abs(lhs2 - rhs2) < 1e-12} ✓")
print()

# Law 3: ln(a^r) = r·ln(a)
lhs3 = math.log(a**r)
rhs3 = r * math.log(a)
print(f"Law 3: ln(a^r) = r·ln(a)")
print(f"  ln({a}^{r}) = ln({a**r:.4f}) = {lhs3:.8f}")
print(f"  {r}·ln({a}) = {r}·{math.log(a):.8f} = {rhs3:.8f}")
print(f"  Equal: {abs(lhs3 - rhs3) < 1e-12} ✓")
print()

# Derivation: each law follows from the corresponding exponent law
print("=== Derivation trace: ln(ab) = ln(a) + ln(b) ===")
print()
s, t = math.log(a), math.log(b)
print(f"  Let s = ln({a}) = {s:.6f},  t = ln({b}) = {t:.6f}")
print(f"  So a = e^s = {math.exp(s):.6f},  b = e^t = {math.exp(t):.6f}  ✓")
print(f"  ln(ab) = ln(e^s · e^t)    [substitution]")
print(f"         = ln(e^(s+t))      [exponent law 1: e^s · e^t = e^(s+t)]")
print(f"         = s + t             [inverse: ln(e^x) = x]")
print(f"         = ln(a) + ln(b)    [s = ln(a), t = ln(b)]")
print(f"         = {s:.6f} + {t:.6f} = {s+t:.6f} = ln({a*b:.4f})  ✓")
print()

# Change of base
print("=== Change of base: log_b(x) = ln(x)/ln(b) ===")
for (base, x) in [(10, 1000), (2, 64), (3, 81)]:
    direct = math.log(x, base)
    formula = math.log(x) / math.log(base)
    print(f"  log_{base}({x}) = ln({x})/ln({base}) = {math.log(x):.6f}/{math.log(base):.6f} = {formula:.6f}  (check: {base}^{formula:.4f} = {base**formula:.6f} ≈ {x})")
```

```javascript
// Canvas: e^x and ln(x) as reflections across y = x
const canvas = document.createElement('canvas');
canvas.width = 480;
canvas.height = 480;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0d1117';
ctx.fillRect(0, 0, 480, 480);

// Coordinate system: x in [-2, 5], y in [-2, 5]
const toCanvas = (mx, my) => ({
    x: (mx + 2) / 7 * 460 + 10,
    y: 470 - (my + 2) / 7 * 460
});

// Grid
ctx.strokeStyle = '#1a2332';
for (let v = -2; v <= 5; v++) {
    const p1 = toCanvas(v, -2), p2 = toCanvas(v, 5);
    const q1 = toCanvas(-2, v), q2 = toCanvas(5, v);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
    ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y);
    ctx.stroke();
}

// Axes
ctx.strokeStyle = '#444';
ctx.lineWidth = 1.5;
const o = toCanvas(0, 0), xend = toCanvas(5, 0), yend = toCanvas(0, 5);
ctx.beginPath();
ctx.moveTo(toCanvas(-2, 0).x, toCanvas(-2, 0).y);
ctx.lineTo(xend.x, xend.y);
ctx.moveTo(toCanvas(0, -2).x, toCanvas(0, -2).y);
ctx.lineTo(yend.x, yend.y);
ctx.stroke();

// y = x line
ctx.strokeStyle = '#333';
ctx.setLineDash([5, 5]);
const d1 = toCanvas(-2, -2), d2 = toCanvas(5, 5);
ctx.beginPath(); ctx.moveTo(d1.x, d1.y); ctx.lineTo(d2.x, d2.y); ctx.stroke();
ctx.setLineDash([]);

function curve(fn, xMin, xMax, color, steps = 500) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    let first = true;
    for (let i = 0; i <= steps; i++) {
        const mx = xMin + (xMax - xMin) * i / steps;
        let my;
        try { my = fn(mx); } catch { first = true; continue; }
        if (!isFinite(my) || my < -2.1 || my > 5.1) { first = true; continue; }
        const {x, y} = toCanvas(mx, my);
        first ? (ctx.moveTo(x, y), first = false) : ctx.lineTo(x, y);
    }
    ctx.stroke();
}

curve(x => Math.exp(x), -2, 5, '#4fc3f7');
curve(x => Math.log(x),  0.001, 5, '#ff9800');

// Labels
ctx.font = '14px serif';
ctx.fillStyle = '#4fc3f7'; ctx.fillText('y = eˣ', toCanvas(1.5, 4).x, toCanvas(1.5, 4).y);
ctx.fillStyle = '#ff9800'; ctx.fillText('y = ln x', toCanvas(3.5, 1.3).x, toCanvas(3.5, 1.3).y);
ctx.fillStyle = '#444';    ctx.fillText('y = x', toCanvas(4, 3.6).x, toCanvas(4, 3.6).y);

// Mark (1, e) on e^x and its reflection (e, 1) on ln(x)
const pt1 = toCanvas(1, Math.E), pt2 = toCanvas(Math.E, 1);
[pt1, pt2].forEach(p => {
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 2*Math.PI);
    ctx.fillStyle = '#fff'; ctx.fill();
});
ctx.fillStyle = '#ccc'; ctx.font = '11px monospace';
ctx.fillText(`(1, e)`, pt1.x + 7, pt1.y - 5);
ctx.fillText(`(e, 1)`, pt2.x + 7, pt2.y + 14);
ctx.strokeStyle = '#555'; ctx.setLineDash([3,3]);
ctx.beginPath(); ctx.moveTo(pt1.x, pt1.y); ctx.lineTo(pt2.x, pt2.y); ctx.stroke();
ctx.setLineDash([]);
```

---

### The Natural Logarithm as Measurement of Scale

$\ln x$ measures how many times you need to multiply by $e$ to reach $x$ from 1. More precisely:

- $\ln e = 1$: it takes 1 step of "multiply by $e$" to get from 1 to $e$.
- $\ln e^2 = 2$: two steps to reach $e^2$.
- $\ln(1/e) = -1$: negative — you are dividing, not multiplying.

This is why logarithms are used to measure **multiplicative scale**. Decibels measure sound intensity in $\log_{10}$. Richter scale measures earthquake energy in $\log_{10}$. Information entropy is measured in $\log_2$ (bits). Complexity $O(\log n)$ algorithms (binary search, balanced trees) are logarithmic in the number of halvings needed to reach the target.

---

## Connect the Pieces

The logarithm is the **inverse of the exponential**. It undoes exponentiation just as subtraction undoes addition, division undoes multiplication, and $\sqrt{\cdot}$ undoes squaring (for positive numbers).

**Forwards:**
- M-018 (Derivatives): $(\ln x)' = 1/x$ — the derivative of the logarithm, proved using the inverse function derivative rule.
- M-022 (Integration): $\int 1/x \, dx = \ln|x| + C$ — the logarithm is the antiderivative of $1/x$.
- M-031 (Matrices): $\log(A)$ for a matrix $A$ is defined via the Taylor series of $\ln$.
- M-037 (Probability): The log-likelihood is $\ln P(data | \theta)$ — used in maximum likelihood estimation.

---

## What Breaks Without This

Without the logarithm:
- You cannot "undo" exponentials — no way to solve $e^x = 5$ for $x$.
- There is no antiderivative for $1/x$: $\int 1/x \, dx$ would be undefined.
- Complexity analysis of logarithmic algorithms lacks notation.
- Entropy (information theory), decibels, pH, and the Richter scale are all log-based measurements with no natural alternative.

---

## Definition of Done

- [ ] You can define $\ln$ as the inverse of $\exp$ and state the two fundamental identities
- [ ] You can derive all three log laws from the corresponding exponent laws in one step each
- [ ] You can prove the change-of-base formula
- [ ] You can explain why the domain of $\ln$ is $(0, \infty)$
- [ ] You ran the Python code and can trace through the derivation trace output

**Proof reconstruction (Sunday):** Derive $\ln(a^r) = r \ln a$ from the exponent law $(e^s)^r = e^{rs}$. Then: solve $5^x = 100$ for $x$ using logarithms.

---

## Answers to Quick Check

1. $\ln(ab) = \ln a + \ln b$ corresponds to $e^{s+t} = e^s \cdot e^t$ (exponent Law 1). Products become sums.
2. $\ln(e^5) = 5$ (inverse: $\ln \circ \exp = \text{id}$). $e^{\ln 7} = 7$ (inverse: $\exp \circ \ln = \text{id}$).
3. Domain of $\ln$ is $(0, \infty)$. The range of $e^x$ is $(0, \infty)$, so the inverse $\ln$ can only take positive inputs. There is no real number $x$ with $e^x \leq 0$.
