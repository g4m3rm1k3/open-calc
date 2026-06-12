# M-010 — Composition and Graph Transformations

**Phase 2 · Functions and Their Behaviour · Lesson 3 of 3**
**Pillar: Transformation** · *How function composition encodes every graph transformation without memorisation*

---

## What You Will Build

A Canvas showing a base function and its transformations (shifts, stretches, reflections) side by side. A Python program verifying that every graph transformation is just function composition — so you can read a formula like $f(2x - 3) + 4$ and immediately know what it does to the graph of $f$ without computing anything.

---

## What You Need to Know First

- M-008: functions as sets (domain, codomain, rule)
- M-009: inverse functions

---

> **Quick Check — try to answer before reading:**
>
> 1. Does $f(g(x)) = g(f(x))$ in general? Give a counterexample.
> 2. If $f(x)$ has a maximum at $x = 2$, where does $f(x - 3)$ have its maximum?
> 3. If you know $g(x)$ is the graph of $f(x)$ shifted right by 2, what is $g$ in terms of $f$?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Composition

The **composition** of $f: B \to C$ and $g: A \to B$ is:
$$(f \circ g)(x) = f(g(x))$$

Apply $g$ first, then $f$. The domain of $f \circ g$ is $A$; the codomain is $C$.

**Why the order**: $f \circ g$ means "$f$ of $g$" — $g$ acts first. The notation reads right to left, just as $(f \circ g)(x) = f(g(x))$ — you evaluate right to left.

**Composition is not commutative** in general. $f \circ g \neq g \circ f$.

Example: $f(x) = x^2$, $g(x) = x + 1$.

$(f \circ g)(x) = f(g(x)) = f(x+1) = (x+1)^2 = x^2 + 2x + 1$

$(g \circ f)(x) = g(f(x)) = g(x^2) = x^2 + 1$

These are different functions.

**Composition is associative**: $(f \circ g) \circ h = f \circ (g \circ h)$. (The order of evaluation is determined by the order of composition, not the grouping.)

**Identity function**: $\text{id}_A: A \to A$ defined by $\text{id}_A(x) = x$ satisfies $f \circ \text{id}_A = f$ and $\text{id}_B \circ f = f$. The identity is the neutral element for composition.

**CS lens:** Function composition is exactly how pipelines work in functional programming. In Haskell, `(f . g) x = f (g x)`. In Unix, `cmd1 | cmd2 | cmd3` composes three programs. Understanding composition as a mathematical operation makes you understand why pipelines compose — and why they don't commute.

---

### Graph Transformations from Composition

Every standard graph transformation is a composition. Once you understand this, you need to memorise **nothing**.

**The key principle:** $y = f(g(x))$ is the graph of $f$ with the variable replaced by $g(x)$. The graph of $f$ is moved/scaled in whatever way makes the new formula true.

**Vertical shift:** $y = f(x) + c$

This is the composition $(T_c \circ f)(x)$ where $T_c(y) = y + c$ is translation by $c$. The whole curve shifts up by $c$.

*Why up?* Because we are adding $c$ to the output. The point $(x, f(x))$ on the original curve becomes $(x, f(x) + c)$ — same $x$, output increased by $c$.

**Horizontal shift:** $y = f(x + c)$

This is $f(S_c(x))$ where $S_c(x) = x + c$. The curve shifts **left** by $c$.

*Why left when we add $c$?* This is the one that always confuses. Think: the original graph has a special feature at $x = a$ (a maximum, a zero, whatever). For $f(x+c)$: the feature appears at the new $x$ where $x + c = a$, i.e. $x = a - c$. If $c > 0$, the feature moved to $x = a - c < a$ — it moved left.

*Algebraically:* The point $(a, f(a))$ on the original graph satisfies $y = f(x)$ at $x = a$. On the shifted graph $y = f(x+c)$: the same $y$-value appears at $x = a - c$ (since $f((a-c)+c) = f(a)$). The $x$-coordinate decreased by $c$.

**Horizontal scaling:** $y = f(cx)$ for $c > 1$

The graph is compressed horizontally by a factor of $c$. The original feature at $x = a$ is now at $x = a/c < a$.

*Why compressed when $c > 1$?* The feature appears where $cx = a$, i.e. $x = a/c$. Since $c > 1$, $a/c < a$ — the feature is closer to the origin.

**Reflection:** $y = f(-x)$ reflects the graph across the $y$-axis. $y = -f(x)$ reflects across the $x$-axis.

**Reading a complicated formula:** $y = 2f(3x - 6) + 1$. Rewrite $3x - 6 = 3(x - 2)$.

- $f(3(x-2))$: horizontal compression by 3, then horizontal shift right by 2.
- $2f(\ldots)$: vertical stretch by 2.
- $2f(\ldots) + 1$: vertical shift up by 1.

You can read off the transformation without computing. This is the power of understanding composition.

```javascript
// Canvas: base function and four transformations
const canvas = document.createElement('canvas');
canvas.width = 700;
canvas.height = 500;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0d1117';
ctx.fillRect(0, 0, 700, 500);

// Draw a single plot panel
function drawPanel(panelX, panelY, width, height, title, fn, color) {
    const margin = 30;
    const plotW = width - 2*margin;
    const plotH = height - 2*margin - 20;

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(panelX, panelY, width, height);

    // Title
    ctx.fillStyle = '#ddd';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, panelX + width/2, panelY + 15);

    // Axes
    const axX = panelX + margin;
    const axY = panelY + margin + 20 + plotH / 2;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + margin, axY);
    ctx.lineTo(panelX + margin + plotW, axY);
    ctx.moveTo(panelX + margin + plotW/2, panelY + margin + 20);
    ctx.lineTo(panelX + margin + plotW/2, panelY + margin + 20 + plotH);
    ctx.stroke();

    // Plot function: x in [-3, 3], y in [-2, 2]
    const toCanvasX = mx => panelX + margin + (mx + 3) / 6 * plotW;
    const toCanvasY = my => axY - my / 2 * plotH;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    let first = true;
    for (let i = 0; i <= 300; i++) {
        const mx = -3 + i * 6 / 300;
        let my;
        try { my = fn(mx); } catch { first = true; continue; }
        if (!isFinite(my) || Math.abs(my) > 2.5) { first = true; continue; }
        const cx = toCanvasX(mx);
        const cy = toCanvasY(my);
        if (first) { ctx.moveTo(cx, cy); first = false; }
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
}

// Base function: a parabola-like shape
const baseF = x => x < 0 ? Math.cos(Math.PI * x / 2) * 1.5 : Math.exp(-x) * 1.5;

const panels = [
    { title: 'f(x)  [original]',   fn: x => baseF(x),        color: '#4fc3f7' },
    { title: 'f(x) + 1  [up 1]',   fn: x => baseF(x) + 1,    color: '#66bb6a' },
    { title: 'f(x-1)  [right 1]',  fn: x => baseF(x - 1),    color: '#ff9800' },
    { title: 'f(2x)  [compressed]',fn: x => baseF(2 * x),     color: '#ce93d8' },
    { title: '-f(x)  [flipped]',   fn: x => -baseF(x),        color: '#ef5350' },
    { title: 'f(-x)  [mirrored]',  fn: x => baseF(-x),        color: '#ffb74d' },
];

const cols = 3, rows = 2;
const pw = 700 / cols, ph = 240 / rows;
panels.forEach((p, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    drawPanel(col * pw, row * ph + 20, pw - 4, ph - 4, p.title, p.fn, p.color);
});

ctx.fillStyle = '#aaa';
ctx.font = '11px serif';
ctx.textAlign = 'center';
ctx.fillText('Each panel shows the same base function under a different transformation', 350, 490);
```

```python
# Verify graph transformation rules numerically

import math

def base_f(x):
    """A specific function: sin(x) + 0.3 * x"""
    return math.sin(x) + 0.3 * x

# Transformation rules:
# f(x) + c  →  shift up by c
# f(x - c)  →  shift right by c (note the sign!)
# f(c*x)    →  horizontal compression by c (c > 1)
# c * f(x)  →  vertical stretch by c

test_x = [0.5, 1.0, 2.0, -1.0]

print("Transformation verification: checking where features move")
print()

# Vertical shift by c = 2: point (x, f(x)) becomes (x, f(x)+2)
c = 2
print(f"Vertical shift by {c}: f(x) + {c}")
for x in test_x:
    original = base_f(x)
    shifted  = base_f(x) + c
    print(f"  x={x}: f(x)={original:.4f}, f(x)+{c}={shifted:.4f} (y moved by {c})")
print()

# Horizontal shift right by 1: f(x-1) — feature at x=a is now at x=a+1
print("Horizontal shift right by 1: f(x - 1)")
print("  Feature that was at x=a is now at x=a+1")
for x in test_x:
    original_at_x     = base_f(x)           # f(x): value of original at x
    shifted_at_x_plus_1 = base_f((x+1) - 1) # f((x+1)-1) = f(x)
    print(f"  f({x}) = {original_at_x:.4f}  and  f({x+1} - 1) = {shifted_at_x_plus_1:.4f}  [same value, different x-location]")
print()

# Why f(x+1) shifts LEFT (not right)
print("Why f(x+1) shifts LEFT by 1:")
print("  f(x+1) at x=a-1 equals f(a) -- the feature that was at x=a is now at x=a-1")
for a in [1.0, 2.0]:
    print(f"  f({a}) = {base_f(a):.4f},  f({a-1}+1) = f({a}) = {base_f(a):.4f}  [feature moved left to x={a-1}]")
print()

# Composition view: f(g(x)) where g(x) = x + 1
print("Same thing as composition: f(g(x)) where g(x) = x + 1")
g = lambda x: x + 1
fog = lambda x: base_f(g(x))
for x in test_x:
    print(f"  (f∘g)({x}) = f(g({x})) = f({g(x)}) = {fog(x):.4f}")
```

---

### Decomposing Functions

When you see a complicated function, you can often decompose it as a composition of simpler ones. This is how you understand what it does.

Example: $h(x) = \sqrt{x^2 + 1}$.

Let $g(x) = x^2 + 1$ and $f(x) = \sqrt{x}$. Then $h = f \circ g$.

$g$ shifts the parabola up by 1 (so it is always $\geq 1$). $f$ takes the square root. The composition: first square-and-shift, then take the root.

This decomposition matters because:
- The derivative of $h$ is $(f \circ g)'(x) = f'(g(x)) \cdot g'(x)$ — the chain rule from Phase 6.
- The integral of $h$ uses $u$-substitution, which is the reverse chain rule (Phase 7).

Understanding composition now means the chain rule will feel natural, not like another formula to memorise.

---

## Connect the Pieces

**Backwards:** M-008 defined functions. M-009 defined inverses. This lesson defines composition — the three core operations on functions.

**Forwards:**
- The chain rule (Phase 6) is $\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)$ — a theorem about derivatives of compositions.
- $u$-substitution in integration (Phase 7) is the reverse chain rule: recognising $\int f(g(x)) g'(x) dx$ as $\int f(u) du$.
- Matrix multiplication is composition of linear maps (Phase 10) — the definition is forced by requiring $(AB)(x) = A(Bx)$.
- Homomorphisms in group theory (Phase 17) are functions that preserve composition: $\phi(f \circ g) = \phi(f) \circ \phi(g)$.

---

## What Breaks Without This

Without understanding composition:
- Students apply the chain rule without understanding what they are differentiating — they fail to identify the "inner function" $g$ and "outer function" $f$ in $f(g(x))$.
- The notation $f^{-1}$ (inverse) is confused with $1/f(x)$ (reciprocal). The inverse is the function that composes with $f$ to give the identity; the reciprocal is $1/f(x)$. These are completely different.

---

## Definition of Done

- [ ] You can give a counterexample showing $f \circ g \neq g \circ f$ in general
- [ ] You can explain why $f(x+2)$ shifts the graph left (not right), deriving the direction from the definition
- [ ] You can describe the transformation applied by $y = 3f(2x - 4) - 1$ without computing
- [ ] You can decompose $h(x) = \sin(x^2 + 1)$ as a composition and name each part
- [ ] You ran both code blocks and can explain what the canvas shows and what the Python verifies

**Proof reconstruction (Sunday):** Show that composition is associative: $(f \circ g) \circ h = f \circ (g \circ h)$. Then identify the inner and outer functions for: $\sin(3x+1)$, $e^{x^2}$, $\sqrt{\ln x}$.

---

## Answers to Quick Check

1. No. $f(x) = x+1$, $g(x) = x^2$: $(f \circ g)(x) = x^2 + 1$ but $(g \circ f)(x) = (x+1)^2 = x^2 + 2x + 1$. Different.
2. $f(x - 3)$ shifts the graph right by 3. So the maximum moves from $x = 2$ to $x = 2 + 3 = 5$.
3. $g(x) = f(x - 2)$ — the rule for a rightward shift is subtracting the shift amount from the argument.
