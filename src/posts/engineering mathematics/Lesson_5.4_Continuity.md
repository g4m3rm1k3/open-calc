# Stage 5, Lesson 5.4 — Continuity

**Threads:** Math, Physics
**Estimated time:** 45–60 minutes

---

## What This Lesson Is About

Lesson 5.2 met a function with a "hole" — $\frac{x^2-4}{x-2}$ had a perfectly good limit at $x=2$ even though the function itself wasn't defined there. That gap between "the limit exists" and "the function actually reaches that value" is exactly what this lesson is about. A function is **continuous** at a point when there is no gap at all — when the limit exists *and* matches the function's actual value there, so the graph can be drawn through that point without lifting your pen. This lesson reuses the $\epsilon$–$\delta$ machinery from Lesson 5.3 almost unchanged, and gives you a vocabulary (removable, jump, infinite discontinuity) for classifying exactly *how* a function can fail to be continuous.

---

## Historical Context

Bernard Bolzano gave one of the first rigorous definitions of continuity in 1817, in a paper whose actual goal was to prove the Intermediate Value Theorem (the subject of the very next lesson) — he needed a precise notion of "unbroken" curve before he could prove that such a curve must cross every height between its endpoints. Bolzano's work was largely overlooked for decades, and Cauchy independently published a similar continuity definition in 1821; it was only later, once Weierstrass supplied the full $\epsilon$–$\delta$ apparatus, that continuity took the exact form used in this lesson.

---

## What You Need To Know First

- **The $\epsilon$–$\delta$ definition of a limit** (Lesson 5.3): continuity is that same definition, with one small addition.
- **Removable discontinuities from limit examples** (Lesson 5.2): you've already met one example of a discontinuous function without the vocabulary to name it yet.
- **Piecewise-defined functions**: reading a function defined by different formulas on different intervals.

---

## The Lesson

### The Definition of Continuity

**The problem.** A limit only asks what happens as you *approach* a point — it says nothing about what actually happens *at* that point. We need a definition that ties the two together.

**Formal definition.** A function $f$ is **continuous at $x=a$** if all three of the following hold:
1. $f(a)$ is defined (the point actually exists),
2. $\lim_{x\to a} f(x)$ exists (both one-sided limits exist and agree),
3. $\lim_{x\to a} f(x) = f(a)$ (the limit actually equals the function's value there).

Equivalently, in $\epsilon$–$\delta$ language: for every $\epsilon>0$, there exists $\delta>0$ such that
$$|x-a| < \delta \implies |f(x)-f(a)| < \epsilon$$
Notice this is Lesson 5.3's definition with one change: there is no need for the strict $0 < |x-a|$ restriction anymore, because when $x=a$ exactly, $|f(a)-f(a)|=0<\epsilon$ trivially — continuity is allowed, even required, to include the point itself.

**Geometric picture.** A function is continuous at $a$ exactly when you can trace its graph through $x=a$ without lifting your pen — no hole, no sudden jump, no shooting off to infinity.

**Physical lens.** Almost every quantity you'd measure physically — position over time, temperature, pressure — is continuous, because physical processes don't teleport: an object's position can't jump from one value to another without passing through everything in between. This is precisely the physical intuition Bolzano and Cauchy were trying to capture mathematically, and it's exactly what makes the Intermediate Value Theorem (next lesson) physically meaningful, not just a mathematical curiosity.

---

### Classifying Discontinuities

**The problem.** When continuity fails, exactly *how* does it fail? Not all broken graphs look alike.

**The three types:**

- **Removable discontinuity:** the two-sided limit exists, but either $f(a)$ is undefined or $f(a)$ doesn't match the limit. There's a single "hole" that could be patched by simply (re)defining $f(a)$ to equal the limit.
- **Jump discontinuity:** the left-hand limit and right-hand limit both exist individually, but they don't agree with each other — the function genuinely jumps from one height to another.
- **Infinite (essential) discontinuity:** the function grows without bound on one or both sides, so no finite limit exists at all — a vertical asymptote.

#### Hand-Worked Example — Classifying a Jump Discontinuity

We will classify the discontinuity of
$$f(x) = \begin{cases} x^2 & x < 1 \\ 3 & x = 1 \\ 2x+1 & x > 1 \end{cases}$$
at $x=1$.

**Step 1 — check condition 1: is $f(1)$ defined?** Yes, $f(1)=3$ by the middle case.

**Step 2 — compute the left-hand limit.** As $x\to 1^-$, use the $x^2$ piece: $\lim_{x\to1^-} x^2 = 1$.

**Step 3 — compute the right-hand limit.** As $x\to1^+$, use the $2x+1$ piece: $\lim_{x\to1^+}(2x+1)=3$.

**Step 4 — compare the two one-sided limits.** Left limit is $1$; right limit is $3$. They **do not agree**, so $\lim_{x\to1} f(x)$ does not exist at all — condition 2 fails, regardless of what $f(1)$ equals.

**Step 5 — verify numerically.** The table in the code block below confirms $f(x)\to 1$ from the left and $f(x)\to 3$ from the right.

**Step 6 — classify.** Since both one-sided limits exist individually but disagree, this is a **jump discontinuity** — the graph genuinely leaps from height $1$ to height $3$ at $x=1$, and no single redefinition of $f(1)$ could ever patch it (unlike a removable discontinuity).

**Step 7 — generalize.** To classify any discontinuity: first check both one-sided limits exist and are finite. If they disagree, it's a jump. If they agree with each other but not with $f(a)$ (or $f(a)$ is undefined), it's removable. If either one-sided limit is infinite, it's an infinite discontinuity.

#### Hand-Worked Example — Proving Continuity With ε–δ

We will prove $f(x) = x^2+1$ is continuous at $x=2$.

**Step 1 — state the target.** $f(2) = 4+1 = 5$. We must show $\lim_{x\to2}(x^2+1) = 5$ using $\epsilon$–$\delta$, i.e., for every $\epsilon>0$ find $\delta>0$ with $|x-2|<\delta \implies |(x^2+1)-5|<\epsilon$.

**Step 2 — scratch work.** $|(x^2+1)-5| = |x^2-4| = |x-2|\,|x+2|$ — the exact same factorization from Lesson 5.3's quadratic example.

**Step 3 — reuse the restriction trick.** Restrict $\delta \leq 1$: then $1<x<3$, so $|x+2|<5$, giving $|x^2-4|<5|x-2|$.

**Step 4 — choose $\delta$.** As before, $\delta = \min\left(1,\frac{\epsilon}{5}\right)$ makes $5|x-2|<\epsilon$.

**Step 5 — verify numerically.** Confirmed in the code block below for four values of $\epsilon$, sampling points including $x=2$ itself this time (unlike Lesson 5.3, we don't need to exclude it).

**Step 6 — narrate why this proof is easier than 5.3's.** Because $f(2)=5$ genuinely equals the limit, we didn't need to worry about excluding $x=2$ from the sampled points at all — continuity means the function behaves consistently *including* at the point itself.

---

### Code — Classifying Discontinuities Numerically and Verifying Continuity

**Purpose.** Compute the one-sided tables for a jump and an infinite discontinuity, and numerically confirm the $\epsilon$–$\delta$ continuity proof above.

```python
import numpy as np

def f_jump(x):
    if x < 1:
        return x**2
    elif x == 1:
        return 3
    else:
        return 2*x + 1

print("Jump discontinuity: approaching x=1")
print("From the left:", [f_jump(x) for x in [0.9, 0.99, 0.999]])
print("From the right:", [f_jump(x) for x in [1.1, 1.01, 1.001]])
print("f(1) =", f_jump(1))

def f_inf(x):
    return 1 / (x - 2)

print("\nInfinite discontinuity: approaching x=2")
print("From the left:", [f_inf(x) for x in [1.9, 1.99, 1.999]])
print("From the right:", [f_inf(x) for x in [2.1, 2.01, 2.001]])

def f_cont(x):
    return x**2 + 1

a, L = 2, 5
print("\nContinuity check: f(x) = x^2+1 at x=2")
for eps in [1.0, 0.1, 0.01, 0.001]:
    delta = min(1, eps / 5)
    rng = np.random.default_rng(2)
    xs = a + rng.uniform(-delta, delta, 2000)  # x = a is allowed here
    max_diff = np.max(np.abs(f_cont(xs) - L))
    print(f"  eps={eps:<7} delta={delta:<8} max|f(x)-L|={max_diff:.6f}  (< eps: {max_diff < eps})")
```

**Real output, this session:**
```
Jump discontinuity: approaching x=1
From the left: [0.81, 0.9801, 0.998001]
From the right: [3.2, 3.02, 3.002]
f(1) = 3

Infinite discontinuity: approaching x=2
From the left: [-9.999999999999991, -99.99999999999991, -1000.0000000001102]
From the right: [9.999999999999991, 100.00000000000213, 1000.0000000001102]

Continuity check: f(x) = x^2+1 at x=2
  eps=1.0     delta=0.2      max|f(x)-L|=0.839926  (< eps: True)
  eps=0.1     delta=0.02     max|f(x)-L|=0.080393  (< eps: True)
  eps=0.01    delta=0.002    max|f(x)-L|=0.008003  (< eps: True)
  eps=0.001   delta=0.0002   max|f(x)-L|=0.000800  (< eps: True)
```

![Three discontinuity types: removable hole, jump, and infinite/vertical asymptote](discontinuity_types.png)

**Walkthrough.** The jump table shows the left values climbing toward $1$ and the right values climbing toward $3$ — two different destinations, confirming Step 4 of the classification example numerically. The infinite-discontinuity table shows values racing off toward $-1000$ and $+1000$ as $x$ gets merely three decimal places closer to $2$ — a signature of no finite limit existing at all, unlike the jump case where both sides at least *settle* somewhere. The continuity check reuses the exact sampling technique from Lesson 5.3, now including $x=a$ itself in the sampled points (rather than excluding it), which is fine precisely because continuity guarantees $f$ behaves consistently there too.

**Connection.** The three panels of the figure are the three named discontinuity types side by side — notice the removable panel (left) has one clean open circle (a single patchable hole), the jump panel (middle) has the graph at two different heights on either side of $x=1$, and the infinite panel (right) never levels off at all as it approaches the dashed asymptote line.

---

## Connect the Pieces

This lesson adds exactly one condition — $f(a)$ must equal the limit — to the $\epsilon$–$\delta$ definition from Lesson 5.3, and gives you vocabulary (removable, jump, infinite) for every way that condition can fail, including the removable-hole example first seen back in Lesson 5.2. It sets up Lesson 5.5 directly: the Intermediate Value Theorem only works for *continuous* functions, precisely because a jump discontinuity could let a function skip over a height entirely without ever actually reaching it. Physically, continuity is the mathematical statement behind the everyday assumption that measurable quantities like position and temperature don't teleport — an assumption engineering models lean on constantly.

---

## Summary

- $f$ is **continuous at $a$** if $f(a)$ is defined, $\lim_{x\to a}f(x)$ exists, and the two are equal.
- In $\epsilon$–$\delta$ form: for every $\epsilon>0$ there's a $\delta>0$ with $|x-a|<\delta \implies |f(x)-f(a)|<\epsilon$ — the same definition as a limit, but without needing to exclude $x=a$.
- **Removable discontinuity:** the limit exists, but doesn't match (or exist for) $f(a)$ — a single patchable hole.
- **Jump discontinuity:** the one-sided limits both exist but disagree with each other.
- **Infinite discontinuity:** at least one one-sided limit is infinite — a vertical asymptote.

---

## Problems

### Computation

1. Classify the discontinuity of $f(x) = \dfrac{1}{(x-3)^2}$ at $x=3$.
2. Classify the discontinuity of $g(x) = \begin{cases} x+1 & x\le 0 \\ x-1 & x>0\end{cases}$ at $x=0$.
3. Is $h(x) = \dfrac{x^2-1}{x-1}$ (with $h(1)$ undefined) continuous at $x=1$? If not, what type of discontinuity is it, and how would you patch it?

*Answers: (1) both sides go to $+\infty$ — infinite discontinuity. (2) left limit $=1$, right limit $=-1$ — jump discontinuity. (3) not continuous ($h(1)$ undefined); the limit exists and equals $2$ (factor and cancel, as in Lesson 5.2) — removable; patch by defining $h(1)=2$.*

### Understanding

4. A student claims: "If $f(a)$ is defined and $\lim_{x\to a}f(x)$ exists, then $f$ must be continuous at $a$." Give a specific counterexample showing this claim is false, and identify exactly which of the three conditions it overlooks.

### Proof

5. Prove that $f(x) = 3x - 7$ is continuous at every real number $a$ (not just one specific point) using the $\epsilon$–$\delta$ definition.

### Extension ★

6. ★ A function can be discontinuous at *every single point* of its domain — the classic example is the Dirichlet function, $D(x) = 1$ if $x$ is rational and $0$ if $x$ is irrational. Explain, using the definition of continuity, why no $\delta>0$ can ever work at any point $a$ for this function, no matter how small $\epsilon$ is chosen. (Hint: no matter how small an interval around $a$ you pick, it contains both rational and irrational numbers.)
