# Stage 1, Lesson 1.10 — Exponential and Logarithmic Equations
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Lessons 1.6 through 1.9 built all the tools: exponential functions,
the number $e$, the natural logarithm, and logarithm laws in any base.
This lesson puts them together to solve equations where the unknown
appears in an exponent or inside a logarithm. These are the equations
that arise when you ask "how long until…" — until the capacitor charges
to a given voltage, until the population reaches a target, until the
radioactive sample decays to a safe level, until the algorithm finishes
on a dataset of size $n$. Two techniques carry the whole lesson: take
$\ln$ of both sides to bring a variable down from an exponent; apply
$e^{(\cdot)}$ to both sides to extract a variable from inside a $\ln$.
By the end you can solve any single-variable exponential or logarithmic
equation, including equations with multiple terms and equations that
reduce to quadratics after substitution.

---

## Historical Context

The practical need to solve exponential equations drove the invention
of logarithm tables. Astronomers in the 16th century needed to solve
equations like $a^x = b$ to compute planetary positions — these arise
from the time laws governing orbital motion. Napier's 1614 tables were
explicitly designed to solve such problems: once you have logarithm tables,
$a^x = b$ becomes $x \log a = \log b$, a linear equation in $x$.
The technique was so powerful that Johannes Kepler used it immediately
to complete his computation of the Rudolphine Tables, which took him
years to finish and which he had expected to take much longer. Before
Napier's tables, the same calculation could take days; after them, hours.

---

## What You Need To Know First

- **Natural logarithm** — Lesson 1.8. The inverse relationship
  $\ln(e^x) = x$ and $e^{\ln x} = x$ are the central tools.
- **Logarithm laws** — Lesson 1.9: product, quotient, power laws,
  and change of base.
- **Exponential functions** — Lesson 1.6 and 1.7. $b^x = e^{x\ln b}$
  — any exponential base can be converted to base $e$.

---

## The Lesson

### The Two Core Techniques

Every exponential or logarithmic equation is solved by one of two moves:

**Technique A — Variable in exponent:** apply $\ln$ to both sides.

$$b^{f(x)} = C \implies \ln(b^{f(x)}) = \ln C \implies f(x)\ln b = \ln C$$

This brings the variable from the exponent down to a coefficient.

**Technique B — Variable inside $\ln$:** apply $e^{(\cdot)}$ to both sides.

$$\ln(g(x)) = c \implies e^{\ln(g(x))} = e^c \implies g(x) = e^c$$

This extracts the variable from inside the logarithm.

These are inverses of each other — Technique A undoes $b^x$ using $\ln$;
Technique B undoes $\ln$ using $e^x$. Every equation in this lesson
reduces to one of these two moves (sometimes after simplification).

```python
import math

def solve_exponential(b, C, k=1):
    """
    Solve b^(k*x) = C for x.
    b^(k*x) = C → k*x*ln(b) = ln(C) → x = ln(C) / (k * ln(b))
    
    b: base (positive, not 1)
    C: right-hand side (positive)
    k: coefficient of x in exponent (nonzero)
    """
    if b <= 0 or b == 1: raise ValueError(f"Invalid base: {b}")
    if C <= 0:           raise ValueError(f"C must be positive: {C}")
    if k == 0:           raise ValueError("k (exponent coefficient) must be nonzero")
    return math.log(C) / (k * math.log(b))

def solve_logarithmic(c, inner_fn_inverse):
    """
    Solve ln(g(x)) = c for x by:
      1. g(x) = e^c
      2. Apply inner_fn_inverse to find x
    
    inner_fn_inverse: callable that takes e^c and returns x
    c: right-hand side
    """
    g_value = math.exp(c)
    return inner_fn_inverse(g_value)

# Examples
print("Technique A — Solve b^(kx) = C:")
cases_A = [
    (2,   32,  1,  "2^x = 32    → x = 5"),
    (10, 1000, 1,  "10^x = 1000 → x = 3"),
    (3,   7,   2,  "3^(2x) = 7  → x = ln(7)/(2ln3)"),
    (math.e, 5, 1, "e^x = 5     → x = ln(5)"),
]
for b, C, k, label in cases_A:
    x = solve_exponential(b, C, k)
    verify = b**(k*x)
    print(f"  {label:<30}: x = {x:.6f}  verify: {b}^({k}*x) = {verify:.6f} (expect {C})")

print("\nTechnique B — Solve ln(g(x)) = c:")
# ln(3x - 1) = 4 → 3x - 1 = e^4 → x = (e^4 + 1) / 3
x2 = solve_logarithmic(4, lambda v: (v + 1) / 3)
print(f"  ln(3x-1) = 4: x = {x2:.6f}  verify: ln(3x-1) = {math.log(3*x2-1):.6f}")

# ln(x^2) = 6 → x^2 = e^6 → x = ±sqrt(e^6) = ±e^3
x3_pos = solve_logarithmic(6, lambda v: math.sqrt(v))
x3_neg = -x3_pos
print(f"  ln(x^2) = 6: x = ±{x3_pos:.6f}  verify: ln(x^2) = {math.log(x3_pos**2):.6f}")
```

**Walkthrough:** `solve_exponential` implements $x = \ln C / (k \ln b)$
directly. `solve_logarithmic` takes a callable `inner_fn_inverse` that
solves $g(x) = e^c$ for $x$ — this keeps the solver flexible: for
$\ln(3x-1) = 4$, `inner_fn_inverse = lambda v: (v+1)/3` inverts
$g(x) = 3x-1$. The verify step confirms by substituting back in.

---

### Solving Exponential Equations: Standard Cases

**Case 1 — Single exponential.** Isolate the exponential, then take $\ln$.

**Hand-worked example:** $3 \cdot 2^{x+1} = 48$.

Step 1 — Isolate: $2^{x+1} = 16$.

Step 2 — Take $\ln$: $(x+1)\ln 2 = \ln 16$.

Step 3 — Solve: $x + 1 = \ln 16 / \ln 2 = \log_2(16) = 4$, so $x = 3$.

Step 4 — Verify: $3 \cdot 2^{3+1} = 3 \cdot 16 = 48$. ✓

**Case 2 — Exponentials with different bases.** Convert both to $e$
using $b^x = e^{x\ln b}$.

**Hand-worked example:** $3^x = 5^{x-2}$.

Take $\ln$ of both sides:

$$x\ln 3 = (x-2)\ln 5$$
$$x\ln 3 = x\ln 5 - 2\ln 5$$
$$x(\ln 3 - \ln 5) = -2\ln 5$$
$$x = \frac{-2\ln 5}{\ln 3 - \ln 5} = \frac{2\ln 5}{\ln 5 - \ln 3} = \frac{2\ln 5}{\ln(5/3)}$$

Numerically: $x = 2(1.6094) / (1.6094 - 1.0986) = 3.2189 / 0.5108 \approx 6.302$.

Verify: $3^{6.302} \approx 729.0$ and $5^{6.302-2} = 5^{4.302} \approx 729.0$. ✓

**Case 3 — Exponential reducible to quadratic.** Substitute $u = b^x$.

**Hand-worked example:** $4^x - 3 \cdot 2^x - 4 = 0$.

Write $4^x = (2^2)^x = (2^x)^2$. Let $u = 2^x$ (so $u > 0$):

$$u^2 - 3u - 4 = 0 \implies (u-4)(u+1) = 0$$

Solutions: $u = 4$ (since $u > 0$; $u = -1$ is rejected).

$2^x = 4 = 2^2 \implies x = 2$.

Verify: $4^2 - 3(2^2) - 4 = 16 - 12 - 4 = 0$. ✓

```python
import math
import numpy as np

# Solve Case 3 type: a*b^(2x) + c*b^x + d = 0 via substitution u = b^x
def solve_exponential_quadratic(a, c, d, b):
    """
    Solve a*(b^x)^2 + c*b^x + d = 0 by substituting u = b^x.
    Returns all positive solutions u, then converts back to x = ln(u)/ln(b).
    
    a, c, d: coefficients of the quadratic a*u^2 + c*u + d = 0
    b: exponential base
    """
    discriminant = c**2 - 4*a*d
    if discriminant < 0:
        return []   # no real solutions
    
    u_solutions = [(-c + math.sqrt(discriminant)) / (2*a),
                   (-c - math.sqrt(discriminant)) / (2*a)]
    
    x_solutions = []
    for u in u_solutions:
        if u > 0:   # only positive u is valid (b^x > 0 always)
            x_solutions.append(math.log(u) / math.log(b))
    return x_solutions

# Example: 4^x - 3*2^x - 4 = 0  →  a=1, c=-3, d=-4, b=2
solutions = solve_exponential_quadratic(1, -3, -4, b=2)
print(f"4^x - 3*2^x - 4 = 0: x = {solutions}")
for x in solutions:
    val = 4**x - 3*2**x - 4
    print(f"  Verify x={x:.4f}: 4^x - 3*2^x - 4 = {val:.6f}  (expect 0)")

# Another example: 9^x - 10*3^x + 9 = 0  →  a=1, c=-10, d=9, b=3
solutions2 = solve_exponential_quadratic(1, -10, 9, b=3)
print(f"\n9^x - 10*3^x + 9 = 0: x = {solutions2}")
for x in solutions2:
    val = 9**x - 10*3**x + 9
    print(f"  Verify x={x:.4f}: 9^x - 10*3^x + 9 = {val:.6f}  (expect 0)")
```

**Walkthrough:** `discriminant = c**2 - 4*a*d` is the quadratic
discriminant applied to $au^2 + cu + d = 0$. The list comprehension
`if u > 0` filters out negative $u$ values — since $b^x > 0$ for
all real $x$, $u$ must be positive. `math.log(u) / math.log(b)`
converts $u$ back to $x$ via the change-of-base formula.

---

### Solving Logarithmic Equations: Standard Cases

**Case 1 — Single logarithm.** Isolate $\ln$, then apply $e^{(\cdot)}$.

**Hand-worked example:** $2\ln(x) + 3 = 9$.

$2\ln x = 6 \implies \ln x = 3 \implies x = e^3 \approx 20.086$.

Verify: $2\ln(e^3) + 3 = 2(3) + 3 = 9$. ✓

**Case 2 — Multiple logarithms with the same base.** Condense to one
log using the laws, then apply $e^{(\cdot)}$.

**Hand-worked example:** $\ln(x+1) + \ln(x-2) = \ln(4)$.

Product law (left side): $\ln((x+1)(x-2)) = \ln 4$.

Apply $e^{(\cdot)}$: $(x+1)(x-2) = 4$.

Expand: $x^2 - x - 2 = 4 \implies x^2 - x - 6 = 0 \implies (x-3)(x+2) = 0$.

Solutions: $x = 3$ or $x = -2$.

**Check domain:** $\ln(x+1)$ requires $x > -1$; $\ln(x-2)$ requires $x > 2$.
So we need $x > 2$. Only $x = 3$ is valid; $x = -2$ is extraneous.

Verify $x = 3$: $\ln(4) + \ln(1) = \ln(4) + 0 = \ln 4$. ✓

**Hand-worked example:** $\log_2(x) - \log_2(x-1) = 3$.

Quotient law: $\log_2\!\left(\dfrac{x}{x-1}\right) = 3$.

Apply $2^{(\cdot)}$: $\dfrac{x}{x-1} = 2^3 = 8$.

$x = 8(x-1) = 8x - 8 \implies -7x = -8 \implies x = 8/7 \approx 1.143$.

Check domain: need $x > 0$ and $x - 1 > 0$, so $x > 1$. Since $8/7 > 1$, valid.

Verify: $\log_2(8/7) - \log_2(1/7) = \log_2(8/7 \div 1/7) = \log_2(8) = 3$. ✓

```python
import math

# General utility: condense sum/difference of logs and solve
def solve_log_sum(terms, b=math.e):
    """
    Solve: sign_1*log_b(f1(x)) + sign_2*log_b(f2(x)) + ... = rhs
    
    This is a utility for demonstration; the actual equations below
    are solved by hand-translated Python.
    """
    pass   # too equation-specific for a general solver; see individual cases below

# Case 2 Example: ln(x+1) + ln(x-2) = ln(4)
# → (x+1)(x-2) = 4 → x^2-x-6=0 → x=3 or x=-2 (reject -2)
import numpy as np
coeffs = [1, -1, -6]   # x^2 - x - 6 = 0
roots = np.roots(coeffs)
# np.roots: finds all roots of the polynomial
valid = [r.real for r in roots if abs(r.imag) < 1e-8 and r.real > 2]
print(f"ln(x+1)+ln(x-2)=ln(4): candidate roots = {[round(r,4) for r in roots.real]}")
print(f"  Valid (x>2): {valid}")
for x in valid:
    lhs = math.log(x+1) + math.log(x-2)
    rhs = math.log(4)
    print(f"  x={x}: LHS={lhs:.6f}, RHS={rhs:.6f}, match={abs(lhs-rhs)<1e-10}")

print()
# Case 3 Example: log_2(x) - log_2(x-1) = 3
# → x/(x-1) = 8 → x = 8(x-1) → -7x = -8 → x = 8/7
x3 = 8/7
print(f"log2(x) - log2(x-1) = 3:")
print(f"  x = 8/7 = {x3:.6f}")
print(f"  x > 1? {x3 > 1}")
lhs3 = math.log(x3,2) - math.log(x3-1,2)
print(f"  Verify: log2(8/7) - log2(1/7) = {lhs3:.6f}  (expect 3)")
```

**Walkthrough:** `np.roots([1,-1,-6])` finds both roots of the quadratic
$x^2 - x - 6 = 0$. The list comprehension `if abs(r.imag) < 1e-8 and r.real > 2`
keeps only real roots satisfying the domain constraint $x > 2$.
`math.log(x3, 2)` computes $\log_2(x_3)$ using Python's two-argument form.

---

### Extraneous Solutions and Domain Checking

Logarithmic equations must always be checked against domain constraints.
Squaring or multiplying can introduce solutions where none exist.

**Rule:** after solving $\ln(g(x)) = c$, check:
- Every $g(x)$ must be positive (log domain).
- If you multiplied through by a factor, check that factor is nonzero.
- Substitute back into the **original** equation, not a derived form.

**Hand-worked example with extraneous root:**

Solve $\log_2(x+2) + \log_2(2x-3) = \log_2(x+9)$.

Condense: $(x+2)(2x-3) = x + 9$.

Expand: $2x^2 + x - 6 = x + 9 \implies 2x^2 - 15 = 0 \implies x^2 = 15/2 \implies x = \pm\sqrt{15/2}$.

$\sqrt{15/2} \approx 2.739$ and $-\sqrt{15/2} \approx -2.739$.

Domain check for $\log_2(2x-3)$: needs $2x - 3 > 0$, so $x > 3/2$.
Only $x = \sqrt{15/2} \approx 2.739 > 3/2$ is valid.

Check: $\log_2(4.739) + \log_2(2.478) = \log_2(4.739 \times 2.478) = \log_2(11.739) \approx 3.554$.
$\log_2(2.739 + 9) = \log_2(11.739) \approx 3.554$. ✓

```python
import math

# Find both candidates
x_pos = math.sqrt(15/2)
x_neg = -math.sqrt(15/2)

print(f"log2(x+2) + log2(2x-3) = log2(x+9)")
print(f"Quadratic gives: x = ±sqrt(15/2) = ±{x_pos:.4f}\n")

for x in [x_pos, x_neg]:
    print(f"x = {x:.4f}:")
    # Domain check
    args = [x+2, 2*x-3, x+9]
    domain_ok = all(a > 0 for a in args)
    print(f"  Domain check (all args > 0): {domain_ok}  {args}")
    if domain_ok:
        lhs = math.log(x+2, 2) + math.log(2*x-3, 2)
        rhs = math.log(x+9, 2)
        print(f"  LHS={lhs:.6f}, RHS={rhs:.6f}, match={abs(lhs-rhs)<1e-8}")
    print()
```

**Walkthrough:** `args = [x+2, 2*x-3, x+9]` collects all arguments
of logarithms; `all(a > 0 for a in args)` checks every one is
positive. For $x = -\sqrt{15/2} \approx -2.739$: $2x - 3 = -8.478 < 0$,
so the domain check fails without needing to compute further.

---

### Physical Models: Solving for Time

The most common engineering application: given $A(t) = A_0\,e^{rt}$,
find the time $t$ when $A(t)$ reaches a given value.

**Formula:** $t = \dfrac{\ln(A/A_0)}{r}$

**Applications:**

| Problem | $A$, $A_0$, $r$ | Time $t$ |
|---------|-----------------|---------|
| RC circuit: charge to 90% of $V_s$ | $A/A_0 = 0.9$, $r = -1/\tau$ | $t = -\tau\ln(0.1)$ *(wait — charging is $V = V_s(1-e^{-t/\tau})$, solved below)* |
| Bacteria: triple from 1000 | $A/A_0 = 3$, $r = 0.04$/hr | $t = \ln 3 / 0.04 \approx 27.5$ hr |
| Carbon dating: 30% ${}^{14}$C remains | $A/A_0 = 0.3$, $\lambda = 1.2097\times10^{-4}$/yr | $t = \ln(0.3)/(-\lambda) \approx 9953$ yr |

**Charging circuit** (different form): $V(t) = V_s(1 - e^{-t/\tau})$.

To reach fraction $f$ of $V_s$: $f = 1 - e^{-t/\tau}$, so
$e^{-t/\tau} = 1 - f$, giving $t = -\tau\ln(1-f)$.

```python
import math

def time_to_value(A, A0, r):
    """
    Find t such that A0*e^(r*t) = A.
    t = ln(A/A0) / r
    
    A, A0: values (A0 > 0, A > 0)
    r: growth rate (nonzero)
    """
    if A0 <= 0 or A <= 0:
        raise ValueError("A and A0 must be positive")
    if r == 0:
        raise ValueError("r must be nonzero")
    return math.log(A / A0) / r

def charging_time(V_s, V_target, tau):
    """
    Time for RC circuit charging V(t) = V_s*(1 - e^(-t/tau)) to reach V_target.
    Solve V_target = V_s*(1 - e^(-t/tau)) for t.
    """
    f = V_target / V_s
    if not 0 < f < 1:
        raise ValueError("V_target must be between 0 and V_s")
    return -tau * math.log(1 - f)

print("Physical models — solving for time:\n")

# Bacteria tripling
t1 = time_to_value(A=3000, A0=1000, r=0.04)
print(f"Bacteria triple (r=0.04/hr):   t = {t1:.2f} hr")

# Carbon dating
lam_C14 = 1.2097e-4    # per year
t2 = time_to_value(A=0.3, A0=1.0, r=-lam_C14)
print(f"Carbon-14, 30% remains:        t = {t2:,.0f} yr")

# RC charging
tau = 0.1   # seconds (RC = 100ms)
for pct in [50, 90, 95, 99]:
    t = charging_time(V_s=5, V_target=5*pct/100, tau=tau)
    print(f"  RC charge to {pct}%:  t = {t*1000:.2f} ms = {t/tau:.2f}τ")

print()
# Plot: RC charging curve with the 4 time markers
import numpy as np
import matplotlib.pyplot as plt

t_plot = np.linspace(0, 6*tau, 400)
V_s = 5.0
V  = V_s * (1 - np.exp(-t_plot/tau))

fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(t_plot*1000, V, color='#2980b9', lw=2.5, label='$V(t) = 5(1-e^{-t/\\tau})$')
ax.axhline(V_s, color='#aaa', lw=1, linestyle='--', label=f'$V_s = {V_s}$ V')

for pct, color in [(50,'#27ae60'),(90,'#e74c3c'),(95,'#e67e22'),(99,'#8e44ad')]:
    t_mark = charging_time(V_s, V_s*pct/100, tau)
    ax.plot(t_mark*1000, V_s*pct/100, 'o', color=color, markersize=8, zorder=5)
    ax.annotate(f'{pct}%\n{t_mark*1000:.1f} ms',
                xy=(t_mark*1000, V_s*pct/100),
                xytext=(t_mark*1000 + 30, V_s*pct/100 - 0.4),
                fontsize=8, color=color)

ax.set_xlabel('Time (ms)'); ax.set_ylabel('Voltage (V)')
ax.set_title(f'RC Charging ($\\tau = {tau*1000:.0f}$ ms)\n'
             '$t = -\\tau\\ln(1-V/V_s)$ gives time to reach each level', fontsize=11)
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `time_to_value` implements $t = \ln(A/A_0)/r$.
For the carbon dating example, $r = -\lambda$ is negative (decay),
and `math.log(0.3/1.0)` is negative, giving a positive $t$.
The charging circuit formula uses `math.log(1-f)` where $f = V/V_s$;
since $0 < f < 1$, $1-f \in (0,1)$ and $\ln(1-f) < 0$, so
$-\tau\ln(1-f) > 0$. The 99% charging time is $-\tau\ln(0.01) \approx 4.6\tau$.

---

## Connect the Pieces

**What this lesson built on:** Natural logarithm (Lesson 1.8) and
logarithm laws (Lesson 1.9) — these provide the algebra. Exponential
functions (Lessons 1.6–1.7) — the equations arise from these models.

**What this lesson makes possible:** Lesson 1.11 (logarithmic scales)
— the decibel, pH, and Richter formulas are exponential equations
rearranged. Lesson 7.2 (separable ODEs) — the models $A(t) = A_0 e^{rt}$
solved here are solutions to differential equations; Stage 7 derives
them from scratch. Lesson 1.16 (Euler's formula) — complex exponential
equations will require the same technique.

**In engineering:** Solving for time in exponential models is the
everyday algebra of circuits, heat transfer, and chemistry:
"how long until the capacitor is 90% charged," "how long until the
part cools to handling temperature," "when will the concentration
fall below the safe threshold."

---

## Summary

**Technique A — Variable in exponent:**
$$b^{f(x)} = C \implies f(x) = \frac{\ln C}{\ln b} = \log_b C$$

**Technique B — Variable inside $\ln$:**
$$\ln(g(x)) = c \implies g(x) = e^c$$

**General base:** $\log_b(g(x)) = c \implies g(x) = b^c$.

**Exponential quadratic:** let $u = b^x$, solve the quadratic in $u$,
keep only $u > 0$, then $x = \log_b u$.

**Domain check (required):** all arguments of logarithms must be positive.
Reject extraneous solutions.

**Time formula:** from $A(t) = A_0\,e^{rt}$:
$$t = \frac{\ln(A/A_0)}{r}$$

**RC charging:** from $V(t) = V_s(1 - e^{-t/\tau})$:
$$t = -\tau\ln\!\left(1 - \frac{V}{V_s}\right)$$

---

## Problems

### Math

**1.** Solve for $x$. Give exact answers, then decimal approximations.

(a) $5^x = 200$ &emsp;
(b) $3^{2x-1} = 27$ &emsp;
(c) $2^x = 3^{x-1}$ &emsp;
(d) $e^{x^2} = e^{3x-2}$

<details>
<summary>Answers</summary>

(a) $x = \log_5(200) = \ln(200)/\ln(5) \approx 3.292$

(b) $3^{2x-1} = 3^3 \Rightarrow 2x-1 = 3 \Rightarrow x = 2$ (exact)

(c) $x\ln 2 = (x-1)\ln 3 \Rightarrow x(\ln 2 - \ln 3) = -\ln 3 \Rightarrow x = \ln 3/(\ln 3 - \ln 2) \approx 2.710$

(d) $x^2 = 3x - 2 \Rightarrow x^2 - 3x + 2 = 0 \Rightarrow (x-1)(x-2) = 0 \Rightarrow x = 1$ or $x = 2$

</details>

---

**2.** Solve for $x$. Check domain and reject any extraneous solutions.

(a) $\ln(x) + \ln(x+2) = \ln 8$

(b) $\log_3(x+4) - \log_3(x-2) = 2$

(c) $\log x + \log(x-3) = 1$ &emsp; ($\log = \log_{10}$)

(d) $\ln(2x-1) = \ln(x+3) + \ln 2$

<details>
<summary>Answers</summary>

(a) $x(x+2)=8 \Rightarrow x^2+2x-8=0 \Rightarrow (x+4)(x-2)=0$; $x=2$ (reject $x=-4$, domain)

(b) $(x+4)/(x-2)=9 \Rightarrow x+4=9x-18 \Rightarrow 8x=22 \Rightarrow x=11/4=2.75$; check $x>2$ ✓

(c) $x(x-3)=10 \Rightarrow x^2-3x-10=0 \Rightarrow (x-5)(x+2)=0$; $x=5$ (reject $x=-2$)

(d) $2x-1=2(x+3) \Rightarrow 2x-1=2x+6$: no solution (contradiction $-1=6$)

</details>

---

**3.** A population grows according to $P(t) = 500\,e^{0.03t}$ (persons, $t$ in years).

(a) When does the population first reach 2000?

(b) When does it double?

(c) The growth rate decreases to $r = 0.015$ after year $T$. Find $T$ such
that the population at year $2T$ is 3000. *(Two-phase model:
$P(T) = 500e^{0.03T}$, then $P(2T) = P(T)\cdot e^{0.015T} = 3000$.)*

<details>
<summary>Answers</summary>

(a) $500e^{0.03t}=2000 \Rightarrow e^{0.03t}=4 \Rightarrow t=\ln 4/0.03 \approx 46.2$ years.

(b) $t = \ln 2/0.03 \approx 23.1$ years.

(c) $P(T) = 500e^{0.03T}$; $P(2T) = 500e^{0.03T}\cdot e^{0.015T} = 500e^{0.045T} = 3000$.
$e^{0.045T} = 6 \Rightarrow T = \ln 6 / 0.045 \approx 39.8$ years.

</details>

---

### Code Challenges

**Challenge 1 — Exponential equation solver (all cases)**

```python
import math

def solve_single_exp(b, k, C):
    """
    Solve b^(k*x) = C for x.
    Returns x = ln(C) / (k * ln(b)).
    
    Raise ValueError if C <= 0, b <= 0, b == 1, or k == 0.
    """
    pass  # your code here

def solve_two_base_exp(b1, b2, k2_offset):
    """
    Solve b1^x = b2^(x - k2_offset) for x.
    
    Taking ln: x*ln(b1) = (x - k2_offset)*ln(b2)
    → x*(ln(b1) - ln(b2)) = -k2_offset*ln(b2)
    → x = k2_offset * ln(b2) / (ln(b2) - ln(b1))
    
    Raise ValueError if b1 == b2 (then x*(ln(b1)-ln(b2))=0 and the
    equation has no finite solution unless k2_offset is also 0).
    """
    pass  # your code here

def solve_exp_quadratic(a, c_coeff, d, b):
    """
    Solve a*(b^x)^2 + c_coeff*(b^x) + d = 0 via substitution u = b^x.
    Returns list of valid x values (u must be positive).
    """
    pass  # your code here


# --- tests: do not modify ---
# Single: 5^x = 200
x = solve_single_exp(5, 1, 200)
assert abs(5**x - 200) < 1e-9

# Single: 3^(2x) = 81 → x = 2
x = solve_single_exp(3, 2, 81)
assert abs(x - 2) < 1e-10

# Single: e^x = 5
x = solve_single_exp(math.e, 1, 5)
assert abs(math.exp(x) - 5) < 1e-10

# Error cases
for args in [(0, 1, 5), (-1, 1, 5), (2, 0, 5), (2, 1, -1)]:
    try:
        solve_single_exp(*args)
        assert False, f"Should raise ValueError for {args}"
    except ValueError:
        pass

# Two-base: 3^x = 5^(x-2)
x = solve_two_base_exp(3, 5, 2)
assert abs(3**x - 5**(x-2)) < 1e-8

# Two-base: 2^x = 2^(x-1) → should raise (same base, undefined)
try:
    solve_two_base_exp(2, 2, 1)
    assert False, "Should raise ValueError for equal bases"
except ValueError:
    pass

# Quadratic: 4^x - 3*2^x - 4 = 0 → x = 2
sols = solve_exp_quadratic(1, -3, -4, 2)
assert len(sols) == 1
assert abs(sols[0] - 2) < 1e-10
assert abs(4**sols[0] - 3*2**sols[0] - 4) < 1e-10

# Quadratic: 9^x - 10*3^x + 9 = 0 → x = 0 and x = 2
sols2 = sorted(solve_exp_quadratic(1, -10, 9, 3))
assert len(sols2) == 2
for x in sols2:
    assert abs(9**x - 10*3**x + 9) < 1e-9

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`solve_single_exp`: validate inputs, then `return math.log(C) / (k * math.log(b))`.
`solve_two_base_exp`: if `abs(math.log(b1) - math.log(b2)) < 1e-12`, raise ValueError;
else `return k2_offset * math.log(b2) / (math.log(b2) - math.log(b1))`.
`solve_exp_quadratic`: compute discriminant, find $u$ values from quadratic formula,
keep `u > 0`, convert each with `math.log(u) / math.log(b)`.

</details>

---

**Challenge 2 — Logarithmic equation solver**

```python
import math

def solve_ln_product(c1, c2, rhs_val):
    """
    Solve ln(c1*x + c2) = rhs_val for x.
    → c1*x + c2 = e^rhs_val
    → x = (e^rhs_val - c2) / c1
    
    Raise ValueError if c1 == 0.
    Check domain: c1*x + c2 must be positive.
    Returns x (float).
    """
    pass  # your code here

def solve_ln_sum(a, b, rhs):
    """
    Solve ln(x + a) + ln(x + b) = rhs for x.
    → (x+a)(x+b) = e^rhs
    → x^2 + (a+b)x + (a*b - e^rhs) = 0
    
    Returns list of valid x values (those making both arguments positive).
    """
    pass  # your code here


# --- tests: do not modify ---
# solve_ln_product: ln(3x - 1) = 4 → x = (e^4 + 1)/3
x = solve_ln_product(3, -1, 4)
assert abs(math.log(3*x - 1) - 4) < 1e-10

# solve_ln_product: ln(2x + 5) = 3 → x = (e^3 - 5)/2
x = solve_ln_product(2, 5, 3)
assert abs(math.log(2*x + 5) - 3) < 1e-10

# Error: c1 = 0
try:
    solve_ln_product(0, 5, 2)
    assert False
except ValueError:
    pass

# solve_ln_sum: ln(x+1) + ln(x+2) = ln(12)
# → (x+1)(x+2) = 12 → x^2+3x-10=0 → x=2 or x=-5 (reject -5)
sols = solve_ln_sum(1, 2, math.log(12))
valid = [x for x in sols if x > -1 and x > -2]   # both args must be positive
assert any(abs(x - 2) < 1e-8 for x in valid), f"x=2 not found: {valid}"

# Verify each valid solution
for x in solve_ln_sum(1, 2, math.log(12)):
    if x + 1 > 0 and x + 2 > 0:
        lhs = math.log(x+1) + math.log(x+2)
        assert abs(lhs - math.log(12)) < 1e-9, f"Failed at x={x}"

print("✓ Challenge 2 passed!")
print(f"  ln(3x-1)=4: x = {solve_ln_product(3,-1,4):.6f}")
```

<details>
<summary>Hint</summary>

`solve_ln_product`: return `(math.exp(rhs_val) - c2) / c1` after validating c1≠0.
`solve_ln_sum`: compute quadratic coefficients `A=1, B=a+b, C=a*b - math.exp(rhs)`,
use `discriminant = B**2 - 4*A*C`; collect real roots (where discriminant ≥ 0) and
return them all — the caller checks domain.

</details>

---

**Challenge 3 — Time-to-target calculator**

```python
import math

def exp_time_to_target(A0, r, A_target):
    """
    Solve A0 * e^(r*t) = A_target for t.
    Returns t = ln(A_target / A0) / r.
    
    Raise ValueError if A0 <= 0 or A_target <= 0 or r == 0.
    """
    pass  # your code here

def charging_time(V_s, V_target, tau):
    """
    Time for V(t) = V_s * (1 - e^(-t/tau)) to reach V_target.
    Solve V_target = V_s*(1 - e^(-t/tau)) for t.
    Returns t = -tau * ln(1 - V_target/V_s).
    
    Raise ValueError if V_target >= V_s (unreachable) or V_target <= 0.
    """
    pass  # your code here

def carbon_date(fraction_remaining):
    """
    Estimate age of a carbon sample given the fraction of C-14 remaining.
    Uses A(t) = A0 * e^(-lambda * t) with lambda = 1.2097e-4 per year.
    Returns age in years.
    
    fraction_remaining: float in (0, 1]
    """
    pass  # your code here


# --- tests: do not modify ---
# exp_time_to_target: bacteria triple from 1000 at r=0.04
t = exp_time_to_target(1000, 0.04, 3000)
assert abs(1000 * math.exp(0.04*t) - 3000) < 1e-6

# exp_time_to_target: decay to 50% (half-life verification)
lam = 1.2097e-4
t_half = exp_time_to_target(1.0, -lam, 0.5)
assert abs(t_half - 5730) < 1    # C-14 half-life

# Error cases for exp_time_to_target
for bad in [(0, 0.04, 100), (100, 0, 200), (100, 0.04, -5)]:
    try:
        exp_time_to_target(*bad)
        assert False
    except ValueError:
        pass

# charging_time: check 50%, 90%, 99% targets
tau = 0.1
for pct in [50, 90, 99]:
    t = charging_time(V_s=5, V_target=5*pct/100, tau=tau)
    V_actual = 5 * (1 - math.exp(-t/tau))
    assert abs(V_actual - 5*pct/100) < 1e-9, f"pct={pct} failed"

# charging_time: error cases
try:
    charging_time(5, 5, 0.1)      # V_target == V_s (unreachable)
    assert False
except ValueError:
    pass

# carbon_date: 100% → age 0
assert abs(carbon_date(1.0) - 0) < 1e-6

# carbon_date: half-life → ~5730 years
assert abs(carbon_date(0.5) - 5730) < 1

# carbon_date: round-trip
for age in [1000, 5730, 10000, 20000]:
    lam = 1.2097e-4
    frac = math.exp(-lam * age)
    assert abs(carbon_date(frac) - age) < 0.5, f"Round-trip failed at age={age}"

print("✓ Challenge 3 passed!")
print(f"  Bacteria triple at r=0.04: {exp_time_to_target(1000,0.04,3000):.2f} hr")
print(f"  RC charge to 99%: {charging_time(5,4.95,0.1)*1000:.2f} ms")
print(f"  C-14 fraction 0.30 → age: {carbon_date(0.30):,.0f} yr")
```

<details>
<summary>Hint</summary>

`exp_time_to_target`: validate, then `return math.log(A_target/A0) / r`.
`charging_time`: check `V_target <= 0 or V_target >= V_s`, then
`return -tau * math.log(1 - V_target/V_s)`.
`carbon_date`: `lambda_C14 = 1.2097e-4`; validate `fraction_remaining > 0`;
return `math.log(fraction_remaining) / (-lambda_C14)`.

</details>

---

### Extension

**4. ★** Prove that the equation $\ln x = e^x$ has no solution.

*(Hint: show that $\ln x < x$ for all $x > 0$ (use Lesson 1.8 extension),
and that $e^x > x$ for all real $x$. Combine.)*

<details>
<summary>Sketch</summary>

From Lesson 1.8 extension, $\ln x \leq x - 1 < x$ for $x > 0$.
For $e^x$: the series gives $e^x = 1 + x + x^2/2! + \ldots > x$ for all $x$.
So $\ln x < x < e^x$ for $x > 0$, meaning $\ln x < e^x$ — they never intersect. $\square$

</details>

**5. ★** An investment grows at a continuous rate that decreases over time:
$r(t) = r_0 / (1 + t)$ (so the rate halves by $t=1$, approaches 0 as $t\to\infty$).

The value is $V(t) = V_0\,e^{\int_0^t r(s)\,ds}$ (covered in Lesson 5.17).

(a) Compute $\int_0^t \frac{r_0}{1+s}\,ds$ using the known antiderivative of $1/s$.

(b) Show that $V(t) = V_0\,(1+t)^{r_0}$ — a power law, not an exponential.

(c) Does the investment grow without bound? Slower or faster than $e^{r_0 t}$?
