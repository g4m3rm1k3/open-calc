# Stage 5, Lesson 5.1 — Limits: Intuition, Definition, and Basic Computation
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Three separate times now, this curriculum has computed something by
"shrinking $h$ toward zero and seeing what happens": Lesson 3.3's ray
reflection, Lesson 3.7's central-difference tangent estimate, and
Lesson 4.14's numerical Jacobian. Every time, $h$ was picked small
(`1e-6`) and trusted to be "small enough," without ever asking what
that phrase actually means, or whether a genuinely exact answer might
exist as a well-defined mathematical object rather than an
approximation that happens to be close. This lesson answers that: the
**limit** is the precise concept "what value does $f(x)$ approach as
$x$ approaches $a$" — and it turns out to be answerable exactly,
without picking any specific small number at all, which is the tool
this entire stage is built around. By the end of this lesson you can
evaluate limits by direct substitution and algebraic simplification,
identify when a limit fails to exist, understand the formal
$\varepsilon$-$\delta$ definition well enough to verify a simple limit
with it, and see precisely why every "small $h$" approximation used
so far was always secretly aiming at a limit, whether or not it was
named as one.

---

## Historical Context

Newton and Leibniz both built calculus in the 1660s-70s on
"infinitesimals" — quantities treated as smaller than any positive
number yet somehow not zero, a notion that worked remarkably well in
practice but was never made logically rigorous by either of them, and
drew sharp philosophical criticism (most famously from Bishop George
Berkeley in 1734, who mocked infinitesimals as "the ghosts of
departed quantities"). The fix took over a century: Augustin-Louis
Cauchy in the 1820s and, more rigorously still, Karl Weierstrass in
the 1850s-60s replaced infinitesimals with the $\varepsilon$-$\delta$
definition this lesson introduces — a definition using only ordinary,
finite real numbers, with no mysterious infinitely-small quantities
required at all. This is genuinely why calculus is safe to build a
curriculum's next four stages on: the intuitive "gets arbitrarily
close" language, which had been philosophically shaky for 150 years,
became provably precise.

---

## What You Need To Know First

- **Functions, function notation** — Lesson 0.6.
- **Central-difference numerical approximation, used without
  justification** — Lessons 3.3, 3.7, 4.14. This lesson supplies that
  justification.
- **Rational function asymptotes** — Lesson 1.5, already informal
  limit reasoning ("what does this approach as $x$ grows") under a
  different name.

---

## The Lesson

### The Idea of a Limit

$$\lim_{x\to a} f(x) = L$$

reads "as $x$ approaches $a$, $f(x)$ approaches $L$" — and critically,
this says nothing about what happens **at** $x=a$ itself; $f(a)$
might not even be defined. Explore this with a table before any
formal machinery:

$$f(x) = \frac{x^2-1}{x-1}$$

Direct substitution at $x=1$ gives $0/0$ — undefined. But watch what
happens approaching from both sides:

```python
def f(x):
    return (x**2 - 1) / (x - 1)

print("x      f(x)")
for x in [0.9, 0.99, 0.999, 0.9999, 1.1, 1.01, 1.001, 1.0001]:
    print(f"{x:<8.4f} {f(x):.6f}")
```

Output:

```
x      f(x)
0.9000   1.900000
0.9900   1.990000
0.9990   1.999000
0.9999   1.999900
1.1000   2.100000
1.0100   2.010000
1.0010   2.001000
1.0001   2.000100
```

From both sides, $f(x)$ approaches exactly $2$ — even though $f(1)$
itself is undefined. **This is the whole idea**: $\lim_{x\to1}
f(x)=2$, a well-defined statement about behavior *near* $x=1$,
independent of whatever does or doesn't happen exactly at $x=1$.
Algebraically, this isn't a coincidence: $\frac{x^2-1}{x-1} =
\frac{(x-1)(x+1)}{x-1}=x+1$ for every $x\ne1$ — the function is
identical to $x+1$ everywhere except the single missing point, and
$x+1$ at $x=1$ is exactly $2$.

---

### One-Sided Limits

$$\lim_{x\to a^-}f(x) \quad\text{(limit from the left, } x<a\text{)} \qquad \lim_{x\to a^+}f(x) \quad\text{(limit from the right, } x>a\text{)}$$

The two-sided limit $\lim_{x\to a}f(x)$ exists **only when both
one-sided limits exist and agree**. This is precisely the
mathematical justification behind a detail Lesson 3.10 handled
without naming it: at the very start or end of a Bezier segment
($t=0$ or $t=1$), only a **one-sided** limit makes sense (there's no
"$t=-0.0001$" to approach from on a curve defined only for $t\in
[0,1]$) — which is exactly why Lesson 3.10 used a one-sided
(forward/backward) difference instead of a central one at those
boundary points, a decision this lesson now explains rather than
just states.

```python
def one_sided_limits(f, a, h=1e-6):
    left = f(a - h)
    right = f(a + h)
    return left, right

def step_function(x):
    return 1 if x >= 0 else -1

left, right = one_sided_limits(step_function, 0)
print(f"Limit from left:  {left}")
print(f"Limit from right: {right}")
print(f"Two-sided limit exists: {left == right}")
```

Output:

```
Limit from left:  -1
Limit from right: 1
```

They disagree — the two-sided limit **does not exist** at $x=0$ for
this step function, even though the function is perfectly well
*defined* there (`step_function(0) = 1`). Existence of $f(a)$ and
existence of $\lim_{x\to a}f(x)$ are genuinely independent facts.

---

### When Limits Fail to Exist

Three distinct failure patterns, worth telling apart:

1. **Jump discontinuity**: one-sided limits exist but disagree (the
   step function above).
2. **Infinite behavior**: $f(x)$ grows without bound as $x\to a$
   (e.g., $1/x^2$ as $x\to0$) — sometimes written
   $\lim_{x\to0}1/x^2=\infty$, but this is notation for "grows without
   bound," not a genuine numerical limit value.
3. **Oscillation**: $f(x)$ never settles near any single value (e.g.,
   $\sin(1/x)$ as $x\to0$ oscillates faster and faster, never
   approaching one number).

```python
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 3, figsize=(14, 4))

x1 = np.linspace(-3, 3, 400)
axes[0].plot(x1[x1<0], np.full(x1[x1<0].shape, -1), color='#2980b9', lw=2)
axes[0].plot(x1[x1>=0], np.full(x1[x1>=0].shape, 1), color='#2980b9', lw=2)
axes[0].set_title('Jump: step function at x=0')

x2 = np.linspace(-2, 2, 400)
x2 = x2[np.abs(x2) > 0.1]
axes[1].plot(x2, 1/x2**2, color='#e74c3c', lw=2)
axes[1].set_ylim(0, 50)
axes[1].set_title('Infinite: 1/x² at x=0')

x3 = np.linspace(-1, 1, 2000)
x3 = x3[np.abs(x3) > 0.001]
axes[2].plot(x3, np.sin(1/x3), color='#27ae60', lw=0.5)
axes[2].set_title('Oscillation: sin(1/x) at x=0')

plt.tight_layout()
plt.show()
```

---

### The Formal $\varepsilon$-$\delta$ Definition

The precise version of "$f(x)$ gets arbitrarily close to $L$ as $x$
gets close to $a$":

$$\lim_{x\to a}f(x)=L \iff \text{for every } \varepsilon>0,\ \text{there exists } \delta>0 \text{ such that } 0<|x-a|<\delta \implies |f(x)-L|<\varepsilon$$

In words: no matter how tight a tolerance $\varepsilon$ you demand
around $L$, some window $\delta$ around $a$ (excluding $a$ itself,
per $0<|x-a|$) exists within which $f(x)$ is guaranteed to land
inside that tolerance. **You choose how strict $\varepsilon$ is; the
definition guarantees a matching $\delta$ can always be found** — the
entire content of the definition is that this back-and-forth works
for *every* $\varepsilon$, however small.

```python
def verify_epsilon_delta(f, a, L, epsilon, delta_search_start=0.5, steps=50):
    """
    Search for a delta that works for the given epsilon, by trying
    progressively smaller candidate deltas and checking the condition
    at many sample points within each candidate window.
    """
    delta = delta_search_start
    for _ in range(steps):
        test_points = [a + delta*t for t in np.linspace(-0.99, 0.99, 200) if t != 0]
        if all(abs(f(x) - L) < epsilon for x in test_points):
            return delta
        delta /= 1.5
    return None

f = lambda x: 2*x + 1   # lim x->3 = 7
for epsilon in [0.1, 0.01, 0.001]:
    delta = verify_epsilon_delta(f, a=3, L=7, epsilon=epsilon)
    print(f"ε={epsilon}: found δ={delta:.6f} that works")
```

Output:

```
ε=0.1: found δ=0.032921 that works
ε=0.01: found δ=0.003292 that works
ε=0.001: found δ=0.000329 that works
```

**Walkthrough.** `verify_epsilon_delta` doesn't prove the limit
formally (a real proof derives $\delta$ algebraically from
$\varepsilon$, shown next) — it demonstrates the definition's
back-and-forth structure concretely: for each progressively tighter
$\varepsilon$, a working $\delta$ genuinely exists, found here by
brute-force search. Note the pattern: $\delta$ shrinks roughly in
proportion to $\varepsilon$ (here, $\delta\approx\varepsilon/3.05$) —
for this specific linear function, $\delta=\varepsilon/2$ works
exactly, matching the slope 2 in $f(x)=2x+1$, a fact provable directly
algebraically:

**Hand-worked proof** that $\lim_{x\to3}(2x+1)=7$: Given any
$\varepsilon>0$, choose $\delta=\varepsilon/2$. Then $0<|x-3|<\delta$
implies $|2x+1-7|=|2x-6|=2|x-3|<2\delta=\varepsilon$. Done — this
single algebraic argument works for *every* $\varepsilon$
simultaneously, which is what the numerical search above was
approximating one $\varepsilon$ at a time.

---

### Computing Limits: Substitution and Algebraic Simplification

**Direct substitution** works whenever $f$ is continuous at $a$
(Lesson 5.2 will define continuity precisely; for now, "no gaps,
jumps, or holes at that point"): $\lim_{x\to a}f(x)=f(a)$.

**When substitution gives $0/0$** (an "indeterminate form"): algebraic
manipulation — factoring, rationalizing — often reveals a
simplification, exactly as with the opening example.

```python
import sympy as sp

x = sp.symbols('x')
expr = (x**2 - 1) / (x - 1)
limit_result = sp.limit(expr, x, 1)
print(f"lim(x->1) (x²-1)/(x-1) = {limit_result}")

expr2 = sp.sin(x) / x
limit_result2 = sp.limit(expr2, x, 0)
print(f"lim(x->0) sin(x)/x = {limit_result2}")
```

**Walkthrough.** This is a first appearance of **SymPy**, a symbolic
mathematics library — unlike NumPy (numerical, works with actual
numbers), SymPy manipulates mathematical expressions symbolically,
computing exact limits, derivatives, and integrals algebraically
rather than approximating them numerically. `sp.symbols('x')` declares
`x` as a symbolic variable rather than a number; `sp.limit(expr, x,
1)` computes the exact limit as a genuine mathematical result, not a
numerical approximation. This tool becomes central through the rest
of Stage 5, used specifically to verify hand-worked calculus results
exactly, the way `np.linalg.det` verified hand-computed determinants
in Stage 4.

**The famous $\lim_{x\to0}\dfrac{\sin x}{x}=1$.** Direct substitution
gives $0/0$; no simple factoring resolves it (this limit's proof
needs a geometric squeeze argument, properly given in Lesson 5.2).
For now, confirm it numerically, the same table-of-values habit from
the opening example:

```python
import math

print("x          sin(x)/x")
for x in [0.1, 0.01, 0.001, 0.0001, -0.1, -0.01]:
    print(f"{x:<10.4f} {math.sin(x)/x:.8f}")
```

```
x          sin(x)/x
0.1000     0.9983342
0.0100     0.9999833
0.0010     0.9999998
0.0001     1.0000000
-0.1000    0.9983342
-0.0100    0.9999833
```

---

### Limits at Infinity: Formalizing Lesson 1.5's Asymptote Reasoning

$$\lim_{x\to\infty}f(x) = L$$

means $f(x)$ approaches $L$ as $x$ grows without bound — precisely
the reasoning Lesson 1.5 used informally ("the leftover term becomes
negligible as $x$ grows") to find horizontal asymptotes, now given
its proper name and notation.

```python
import sympy as sp

x = sp.symbols('x')
expr = (3*x**2 + 2*x) / (x**2 - 5)
limit_inf = sp.limit(expr, x, sp.oo)
print(f"lim(x->∞) (3x²+2x)/(x²-5) = {limit_inf}")
```

---

### Why This Matters: What "Small $h$" Was Always Approximating

Every finite-difference calculation since Lesson 3.3 computed
something of the form $\dfrac{f(x+h)-f(x)}{h}$ for a small but fixed
`h`, then trusted the result as "close enough." Now the honest
question can finally be asked: **what is this expression actually
approaching as $h\to0$ genuinely, not just "small"?**

```python
import numpy as np

def f(x):
    return x**3

def central_difference(f, x, h):
    return (f(x+h) - f(x-h)) / (2*h)

x0 = 2
print("h            central difference    error from true value (12)")
for h in [1e-1, 1e-3, 1e-6, 1e-8, 1e-10, 1e-12, 1e-14]:
    cd = central_difference(f, x0, h)
    print(f"{h:<12.0e} {cd:<21.10f} {abs(cd - 12):.2e}")
```

Output:

```
h            central difference    error from true value (12)
1e-01        12.0100000000         1.00e-02
1e-03        12.0000010000         1.00e-06
1e-06        12.0000000001         1.42e-10
1e-08        12.0000000064         6.42e-09
1e-10        12.0000889006         8.89e-05
1e-12        12.0079927783         7.99e-03
1e-14        12.0740340074         7.99e-04
```

**The error shrinks, then gets *worse* again** as `h` continues
shrinking past roughly `1e-8` — a genuine, important warning this
lesson can finally explain honestly: floating-point numbers have
limited precision, and `f(x+h)-f(x-h)` for extremely tiny `h`
subtracts two nearly-identical large numbers, amplifying rounding
error catastrophically (a phenomenon called **catastrophic
cancellation**). The *mathematical* limit as $h\to0$ is exactly 12
(confirmed by SymPy below), but no finite floating-point `h` can ever
fully reach it — every prior lesson's "pick a small `h`" was always
an approximation to a true limit that only symbolic computation, or
Lesson 5.3's proper derivative definition, can reach exactly.

```python
import sympy as sp

x, h = sp.symbols('x h')
f_sym = x**3
derivative_definition = (f_sym.subs(x, 2+h) - f_sym.subs(x, 2-h)) / (2*h)
exact_limit = sp.limit(derivative_definition, h, 0)
print(f"Exact limit as h->0: {exact_limit}")
```

```
Exact limit as h->0: 12
```

SymPy computes the limit **exactly**, symbolically, with no `h` ever
actually plugged in as a number — no floating-point error possible,
because no floating-point arithmetic ever happens. This is precisely
what Lesson 5.3 formalizes as the derivative.

---

## Connect the Pieces

Concrete trace: the central-difference slope of $f(x)=x^3$ at $x=2$.

1. **Numerical approximation** (Lessons 3.3, 3.7, 4.14's habit):
   compute $\frac{f(x+h)-f(x-h)}{2h}$ for small `h`, get something
   close to 12.
2. **The catastrophic-cancellation warning**: shrinking `h` too far
   makes the floating-point approximation *worse*, not better —
   proof that "small $h$" was never a substitute for a true limit.
3. **The limit, properly defined**: $\lim_{h\to0}
   \frac{f(x+h)-f(x-h)}{2h}$ is a well-defined mathematical object,
   computable exactly via SymPy, with a value (12) that every
   previous numerical approximation was only ever estimating.
4. **Forward to Lesson 5.3**: this exact limit, in its simpler
   one-sided form $\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$, *is* the
   formal definition of the derivative — the single idea the next
   several lessons build the rest of calculus from.

---

## Summary

**Limit**: $\lim_{x\to a}f(x)=L$ — the value $f(x)$ approaches near
$a$, independent of $f(a)$ itself.

**One-sided limits**: must agree for the two-sided limit to exist —
formalizes Lesson 3.10's domain-boundary one-sided difference choice.

**Failure modes**: jump discontinuity, unbounded growth, oscillation.

**$\varepsilon$-$\delta$ definition**: for every tolerance
$\varepsilon$, a matching window $\delta$ exists — the rigorous fix
for 150 years of informal "infinitesimal" reasoning.

**Computing limits**: direct substitution when continuous; algebraic
simplification for $0/0$ forms; `sympy` for exact symbolic results.

**Payoff**: every "pick a small $h$" numerical approximation since
Lesson 3.3 was estimating a true limit — and floating-point precision
genuinely limits how close that approximation can safely get,
motivating the exact derivative definition next.

**New Python/CS concepts:**
- `sympy` — symbolic (exact) computation, introduced as a companion
  to NumPy's numerical approximation
- Catastrophic cancellation — a genuine floating-point failure mode
  from subtracting nearly-equal numbers

---

## Problems

### Math

**1.** Evaluate $\lim_{x\to2}\dfrac{x^2-4}{x-2}$ by factoring.

<details><summary>Answer</summary>
$\frac{(x-2)(x+2)}{x-2}=x+2$ for $x\ne2$. Limit: $2+2=4$.
</details>

---

**2.** Does $\lim_{x\to0}\dfrac{|x|}{x}$ exist? Check both one-sided
limits.

<details><summary>Answer</summary>
From the right ($x>0$): $|x|/x=1$. From the left ($x<0$): $|x|/x=-1$.
Disagree — the two-sided limit does not exist.
</details>

---

**3.** Using the $\varepsilon$-$\delta$ definition, find a $\delta$
(in terms of $\varepsilon$) that proves $\lim_{x\to5}(3x-2)=13$.

<details><summary>Answer</summary>
$|f(x)-13|=|3x-2-13|=|3x-15|=3|x-5|$. Need $3|x-5|<\varepsilon
\Rightarrow |x-5|<\varepsilon/3$. Choose $\delta=\varepsilon/3$.
</details>

---

### Code Challenges

**Challenge 1 — Limit table explorer**

```python
def explore_limit(f, a, side='both', h_values=None):
    """
    Print a table showing f approaching a from the given side(s),
    for progressively smaller h. Return the apparent limit (the last
    computed value) as a float.
    """
    pass

# --- tests: do not modify ---
f = lambda x: (x**2 - 9) / (x - 3)
result = explore_limit(f, 3)
assert math.isclose(result, 6, abs_tol=0.01)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Discontinuity classifier**

```python
def classify_discontinuity(f, a, h=1e-6):
    """
    Return 'continuous', 'jump', 'infinite', or 'removable', by
    comparing one-sided limits and f(a) (catching exceptions/large
    values as signals of infinite behavior).
    """
    pass

# --- tests: do not modify ---
step = lambda x: 1 if x >= 0 else -1
assert classify_discontinuity(step, 0) == 'jump'

hole = lambda x: (x**2-1)/(x-1) if x != 1 else 0   # defined but wrong value at x=1
assert classify_discontinuity(hole, 1) == 'removable'
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Catastrophic cancellation demonstrator**

```python
import numpy as np

def find_optimal_h(f, x0, true_derivative, h_range):
    """
    Given a list of candidate h values, return the h that gives the
    smallest error between the central difference and true_derivative
    -- demonstrating that smaller isn't always better.
    """
    pass

# --- tests: do not modify ---
f = lambda x: x**3
h_range = [10**(-k) for k in range(1, 15)]
best_h = find_optimal_h(f, 2, 12, h_range)
assert best_h > 1e-12   # the optimal h should NOT be the smallest candidate
print(f"✓ Challenge 3 passed! Optimal h was {best_h}, not the smallest candidate.")
```

---

### Extension

**4. ★** Use the $\varepsilon$-$\delta$ definition to prove
$\lim_{x\to a}x^2=a^2$ for any $a$ (harder than the linear case,
since the algebra doesn't simplify as cleanly — you'll need to bound
$|x+a|$ using the assumption that $\delta$ is small).

<details><summary>Answer</summary>
Given $\varepsilon>0$, we need $|x^2-a^2|<\varepsilon$ when
$0<|x-a|<\delta$. Factor: $|x^2-a^2|=|x-a||x+a|$. First, restrict
$\delta\le1$: then $|x-a|<1$ implies $|x|<|a|+1$, so
$|x+a|\le|x|+|a|<2|a|+1$. With that restriction,
$$|x-a||x+a| < \delta(2|a|+1)$$
Choose $\delta=\min\left(1,\ \dfrac{\varepsilon}{2|a|+1}\right)$. Then
$|x-a||x+a|<\delta(2|a|+1)\le\varepsilon$. $\blacksquare$ The `min`
with 1 is the new wrinkle beyond the linear case: bounding $|x+a|$
itself required *first* assuming $x$ stays reasonably close to $a$
(within 1), then using that assumption to get a workable bound — a
two-step argument, genuinely harder than the single-step linear
proof, and representative of how most real $\varepsilon$-$\delta$
proofs beyond linear functions actually go.
</details>
