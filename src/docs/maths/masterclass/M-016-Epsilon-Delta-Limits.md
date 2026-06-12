# M-016 — The Epsilon-Delta Definition of a Limit

**Phase 5 · Limits and Continuity · Lesson 1 of 2**
**Pillar: Approximation** · *Making "approaching" precise — and why two centuries of calculus needed this*

---

## What You Will Build

A Canvas visualisation of the epsilon-delta definition: a tolerance band $|f(x) - L| < \varepsilon$ with the corresponding neighbourhood $0 < |x - a| < \delta$. A Python program that verifies the definition numerically for several limits and shows the $\delta$-vs-$\varepsilon$ relationship. You will write your first formal limit proof.

---

## What You Need to Know First

- M-006: absolute value as distance — the language of epsilon-delta
- M-000: quantifiers — the definition involves $\forall \varepsilon,\ \exists \delta$

---

> **Quick Check — try to answer before reading:**
>
> 1. What does it mean to say $f(x)$ "approaches" $L$ as $x \to a$? Try to make it precise without the definition.
> 2. Why does $\lim_{x \to 2} f(x)$ not care about $f(2)$?
> 3. The sequence $0.9, 0.99, 0.999, \ldots$ "approaches" 1. But does it ever equal 1? Does that matter for the limit?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Problem with "Approaching"

Calculus was invented by Newton and Leibniz in the 1670s. For 200 years, it worked magnificently but rested on the intuitive notion of "infinitely small quantities" — infinitesimals. In the 1820s–1870s, Cauchy and Weierstrass made calculus rigorous by replacing infinitesimals with the epsilon-delta definition.

The problem with "approaches": how close is "close enough"? How do we know when $f(x)$ is "sufficiently near" $L$? The epsilon-delta definition gives a precise criterion that requires no appeal to intuition.

---

### Building the Definition

**Informal statement:** $\lim_{x \to a} f(x) = L$ means we can make $f(x)$ as close to $L$ as we want, by taking $x$ close enough to $a$.

Let us make this precise, piece by piece.

**"As close to $L$ as we want"** — any positive tolerance $\varepsilon > 0$ we name, we can satisfy it.

**"By taking $x$ close enough to $a$"** — there exists some positive radius $\delta > 0$ such that all $x$ within $\delta$ of $a$ (but not equal to $a$) will satisfy the tolerance.

**Formal definition:**

$$\lim_{x \to a} f(x) = L \iff \forall \varepsilon > 0,\ \exists \delta > 0 \text{ such that } 0 < |x - a| < \delta \implies |f(x) - L| < \varepsilon$$

**The quantifier order matters critically:** $\forall \varepsilon\ \exists \delta$ means $\delta$ is allowed to depend on $\varepsilon$. The smaller the tolerance $\varepsilon$ you demand, the smaller $\delta$ you may need. This is the whole game of limit proofs: given $\varepsilon$, find a $\delta$ that works.

**Why $0 < |x - a|$:** The definition excludes $x = a$ (we write $0 < |x - a|$, not $|x - a| < \delta$). The limit is about what $f(x)$ approaches as $x$ nears $a$, not what $f(a)$ equals. The function may be undefined at $a$, or may have a different value there — the limit does not care.

---

### A Worked Limit Proof

**Claim:** $\lim_{x \to 3} (2x - 1) = 5$.

**Scratchwork (not part of the proof):** We want $|(2x-1) - 5| < \varepsilon$. Simplify:

$|(2x-1) - 5| = |2x - 6| = 2|x - 3|$

So we need $2|x - 3| < \varepsilon$, i.e. $|x - 3| < \varepsilon/2$.

Therefore choose $\delta = \varepsilon/2$.

**Proof:** Let $\varepsilon > 0$ be given. Choose $\delta = \varepsilon/2$. Suppose $0 < |x - 3| < \delta$. Then:

$$|(2x-1) - 5| = |2x - 6| = 2|x - 3| < 2\delta = 2 \cdot \frac{\varepsilon}{2} = \varepsilon \quad \square$$

**The structure of every limit proof:**
1. Given $\varepsilon > 0$.
2. Do scratchwork to find $\delta$ (work backwards from the conclusion).
3. State $\delta$ explicitly.
4. Show $0 < |x - a| < \delta \implies |f(x) - L| < \varepsilon$ (use the bound you found in scratchwork).

```javascript
// Canvas: epsilon-delta visualisation
const canvas = document.createElement('canvas');
canvas.width = 560;
canvas.height = 440;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0d1117';
ctx.fillRect(0, 0, 560, 440);

// Function: f(x) = 2x - 1, limit at a=3, L=5
const f = x => 2*x - 1;
const a = 3, L = 5;

// Coordinate: x in [0, 6], y in [0, 12]
const toC = (mx, my) => ({
    x: mx / 6 * 500 + 30,
    y: 420 - my / 12 * 400
});

// Axes
ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5;
const ox = toC(0,0), oy = toC(0,12);
ctx.beginPath();
ctx.moveTo(30, 420); ctx.lineTo(530, 420);
ctx.moveTo(30, 20);  ctx.lineTo(30, 420);
ctx.stroke();

// Axis labels
ctx.fillStyle = '#666'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
for (let v = 0; v <= 6; v++) ctx.fillText(v, toC(v,0).x, 435);
ctx.textAlign = 'right';
for (let v = 0; v <= 12; v += 2) ctx.fillText(v, 24, toC(0,v).y+4);

// Epsilon band around L
const epsilon = 1.5, delta_choice = epsilon / 2;
const Ly = toC(0, L).y, delt_x = delta_choice;
ctx.fillStyle = 'rgba(255,152,0,0.15)';
ctx.fillRect(30, toC(0, L+epsilon).y, 500, toC(0, L-epsilon).y - toC(0, L+epsilon).y);

// Delta neighbourhood around a
ctx.fillStyle = 'rgba(79,195,247,0.15)';
ctx.fillRect(toC(a-delta_choice, 0).x, 20, 
             toC(a+delta_choice, 0).x - toC(a-delta_choice, 0).x, 400);

// L ± epsilon lines
ctx.strokeStyle = '#ff9800'; ctx.setLineDash([5,3]);
[L+epsilon, L-epsilon].forEach(y => {
    ctx.beginPath();
    ctx.moveTo(30, toC(0,y).y); ctx.lineTo(530, toC(0,y).y);
    ctx.stroke();
});

// a ± delta lines
ctx.strokeStyle = '#4fc3f7';
[a-delta_choice, a+delta_choice].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(toC(x,0).x, 20); ctx.lineTo(toC(x,0).x, 420);
    ctx.stroke();
});
ctx.setLineDash([]);

// Function curve f(x) = 2x-1
ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
ctx.beginPath();
let first = true;
for (let i = 0; i <= 500; i++) {
    const mx = 0.1 + i * 5.8 / 500;
    const my = f(mx);
    if (my < 0 || my > 12) { first = true; continue; }
    const {x, y} = toC(mx, my);
    first ? (ctx.moveTo(x,y), first=false) : ctx.lineTo(x,y);
}
ctx.stroke();

// Open circle at (a, L)
ctx.beginPath(); ctx.arc(toC(a,L).x, toC(a,L).y, 5, 0, 2*Math.PI);
ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
ctx.fillStyle = '#0d1117'; ctx.fill(); ctx.stroke();

// Labels
ctx.fillStyle = '#ff9800'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
ctx.fillText(`L = ${L}`, 535, toC(0,L).y+4);
ctx.fillText(`L+ε`, 535, toC(0,L+epsilon).y+4);
ctx.fillText(`L-ε`, 535, toC(0,L-epsilon).y+4);
ctx.fillStyle = '#4fc3f7';
ctx.fillText(`a-δ`, toC(a-delta_choice,0).x-5, 440);
ctx.fillText(`a`, toC(a,0).x-3, 440);
ctx.fillText(`a+δ`, toC(a+delta_choice,0).x-5, 440);
ctx.fillStyle = '#ccc';
ctx.fillText(`ε = ${epsilon}, δ = ε/2 = ${delta_choice}`, 200, 30);
ctx.fillText('f(x) = 2x-1', 370, 80);
```

```python
import math

def verify_limit_epsilon_delta(f, a, L, delta_fn, epsilons):
    """
    Numerically verify: for given epsilon, find worst-case |f(x)-L| in (a-delta, a+delta).
    delta_fn(epsilon) returns the delta we claim works.
    """
    print(f"Verifying lim(x→{a}) f(x) = {L}")
    print(f"{'ε':>10} {'δ':>10} {'max|f(x)-L|':>14} {'< ε?':>7}")
    print("-" * 46)
    for epsilon in epsilons:
        delta = delta_fn(epsilon)
        # Sample 10000 points in (a-delta, a+delta) \ {a}
        worst = 0
        for k in range(1, 10001):
            x = a - delta + 2*delta * k/10000
            if abs(x - a) < 1e-15:
                continue
            val = abs(f(x) - L)
            worst = max(worst, val)
        holds = worst < epsilon
        print(f"{epsilon:>10.5f} {delta:>10.5f} {worst:>14.6f} {'✓' if holds else '✗'}")

print("=== Limit 1: lim(x→3)(2x-1) = 5, delta = epsilon/2 ===")
verify_limit_epsilon_delta(
    f       = lambda x: 2*x - 1,
    a       = 3,
    L       = 5,
    delta_fn= lambda eps: eps / 2,
    epsilons= [1.0, 0.1, 0.01, 0.001, 0.0001]
)
print()

print("=== Limit 2: lim(x→2)(x^2) = 4, delta = min(1, epsilon/5) ===")
# Scratchwork: |x^2 - 4| = |x-2||x+2|. If |x-2|<1 then x in (1,3), so |x+2| < 5.
# Thus |x^2-4| < 5|x-2| < epsilon when |x-2| < epsilon/5.
# Take delta = min(1, epsilon/5).
verify_limit_epsilon_delta(
    f       = lambda x: x**2,
    a       = 2,
    L       = 4,
    delta_fn= lambda eps: min(1, eps/5),
    epsilons= [1.0, 0.1, 0.01, 0.001, 0.0001]
)
print()
print("The delta is always smaller than epsilon — confirming the limit holds.")
```

---

### One-Sided Limits and Limits at Infinity

**One-sided limits:**

$\lim_{x \to a^+} f(x) = L$ (right-hand limit): $x$ approaches $a$ from above.

Formally: $\forall \varepsilon > 0,\ \exists \delta > 0$ such that $0 < x - a < \delta \implies |f(x) - L| < \varepsilon$.

The two-sided limit $\lim_{x \to a} f(x) = L$ exists if and only if both one-sided limits exist and are equal.

**Limits at infinity:** $\lim_{x \to \infty} f(x) = L$ means for any $\varepsilon > 0$, there exists $M$ such that $x > M \implies |f(x) - L| < \varepsilon$. Same structure, different quantifier.

---

## Connect the Pieces

The epsilon-delta definition resolves the "two centuries of informal calculus" problem. Every limit theorem in this curriculum (limit laws, continuity, derivatives, integrals) is ultimately proved using this definition.

**Backwards:** M-006 prepared the distance notation $|x - a|$ and $|f(x) - L|$. M-000 prepared the quantifier structure $\forall \varepsilon\ \exists \delta$.

**Forwards:**
- M-017: Limit laws proved using epsilon-delta. Continuity defined using limits.
- M-018: The derivative $\lim_{h \to 0} (f(x+h) - f(x))/h$ — a limit. Every derivative proof reduces to an epsilon-delta argument.
- M-044 (Real Analysis): Returning here with full rigour — the completeness of $\mathbb{R}$ is what makes these limits exist.

---

## What Breaks Without This

Without the epsilon-delta definition:
- You cannot prove that $\lim_{x \to a}[f(x) + g(x)] = \lim f(x) + \lim g(x)$. You can only assert it.
- You cannot prove the derivative of $e^x$ is $e^x$ — you use limits to define the derivative.
- You cannot distinguish "the function approaches but does not reach" from "the function oscillates and has no limit." Both feel like "not converging" — only epsilon-delta distinguishes them.

---

## Definition of Done

- [ ] You can state the epsilon-delta definition from memory, including the quantifier order
- [ ] You can write the scratchwork and then the formal proof for $\lim_{x \to 3}(2x-1) = 5$
- [ ] You can explain why $0 < |x - a| < \delta$ (not $|x - a| < \delta$) and why the limit does not care about $f(a)$
- [ ] You ran the canvas and Python code and can explain what each demonstrates

**Proof reconstruction (Sunday):** Prove $\lim_{x \to 2} x^2 = 4$ using the epsilon-delta definition. Show the scratchwork separately from the formal proof.

---

## Answers to Quick Check

1. One attempt: "$f(x)$ gets closer and closer to $L$." Problem: $f(x) = 1/x$ gets "closer to 0" as $x$ increases, but is it ever close enough? "Closer" does not specify how close. Epsilon-delta fixes this with "as close as any prescribed tolerance."
2. The definition says $0 < |x - a| < \delta$ — specifically excluding $x = a$. The limit is about behaviour near $a$, not at $a$.
3. The sequence $0.9, 0.99, 0.999, \ldots$ does not need to equal 1 — the limit is about what it approaches arbitrarily closely. For any $\varepsilon > 0$, we can find a term within $\varepsilon$ of 1 (at the $N$th term, the error is $10^{-N}$). That is the definition of convergence, and it does not require equality.
