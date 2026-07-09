# Stage 1, Lesson 1.10 — Exponential and Logarithmic Equations
**Threads:** Math · Physics · CS  
**Estimated time:** 60–75 minutes

---

## What This Lesson Is About

Lessons 1.6 through 1.9 built exponential and logarithmic functions and
their laws. Now those tools are put to work on the equations that arise
from modelling real processes. An exponential equation has the unknown
in an exponent; a logarithmic equation has the unknown inside a
logarithm. Both types require the same core insight: exponentials and
logarithms are inverses, so they undo each other. The strategy for every
equation in this lesson is the same — isolate the exponential or
logarithm, then apply the inverse to both sides. By the end of the
lesson you will solve any equation of these types systematically,
handle the trickier cases (different bases on both sides, quadratic
substitution), and apply these techniques to real growth, decay, and
engineering problems.

---

## What You Need To Know First

- **Exponential functions** — Lesson 1.6. Shape, domain, range.
- **The number $e$ and $e^x$** — Lesson 1.7. Standard form.
- **Natural logarithm** — Lesson 1.8. $\ln$ as the inverse of $e^x$.
- **Logarithm laws** — Lesson 1.9. Product, quotient, power; change of base.

---

## The Lesson

### The Two Master Strategies

Every exponential or logarithmic equation reduces to one of two moves:

**Move 1 — Take $\ln$ of both sides** (to solve exponential equations):
$$b^x = c \implies \ln(b^x) = \ln c \implies x \ln b = \ln c \implies x = \frac{\ln c}{\ln b}$$

**Move 2 — Convert to exponential form** (to solve logarithmic equations):
$$\log_b x = c \implies x = b^c$$

The rest of the lesson is variations and combinations of these two moves.

---

### Type 1 — Same Base on Both Sides

When both sides have the same base, set exponents equal (the exponential
function is injective, so $b^A = b^B \Rightarrow A = B$).

**Example:** Solve $2^{3x-1} = 16$.

Write 16 as a power of 2: $16 = 2^4$.

$$2^{3x-1} = 2^4 \implies 3x - 1 = 4 \implies x = \frac{5}{3}$$

**Verify:** $2^{3(5/3)-1} = 2^{5-1} = 2^4 = 16$. ✓

**Example:** Solve $9^x = 27$.

Write both as powers of 3: $9 = 3^2$, $27 = 3^3$.

$$(3^2)^x = 3^3 \implies 3^{2x} = 3^3 \implies 2x = 3 \implies x = \frac{3}{2}$$

**Verify:** $9^{3/2} = (9^{1/2})^3 = 3^3 = 27$. ✓

```python
import math

print("Type 1 — Same base: set exponents equal\n")

cases = [
    ("2^(3x-1) = 16",   lambda x: 2**(3*x-1),    16,  5/3),
    ("9^x = 27",         lambda x: 9**x,           27,  3/2),
    ("4^(x+1) = 8^x",   lambda x: 4**(x+1),  None,  None),
]

# Solve 4^(x+1) = 8^x manually: 2^(2x+2) = 2^(3x) => 2x+2=3x => x=2
x_43 = 2
print(f"4^(x+1) = 8^x:  2^(2x+2)=2^(3x) => x=2")
print(f"  Verify: 4^3={4**3}, 8^2={8**2}, match={4**3==8**2}")

for label, f, rhs, x_sol in cases[:2]:
    print(f"\n{label}: x = {x_sol}")
    print(f"  Verify: f({x_sol}) = {f(x_sol):.6f}, rhs = {rhs}")
    print(f"  Match: {math.isclose(f(x_sol), rhs)}")
```

---

### Type 2 — Different Bases: Apply $\ln$

When the bases cannot be made the same, take $\ln$ of both sides and
use the power law $\ln(b^x) = x\ln b$.

**Example:** Solve $5^x = 3^{x+2}$.

$$\ln(5^x) = \ln(3^{x+2}) \implies x\ln 5 = (x+2)\ln 3$$

$$x\ln 5 - x\ln 3 = 2\ln 3 \implies x(\ln 5 - \ln 3) = 2\ln 3$$

$$x = \frac{2\ln 3}{\ln 5 - \ln 3} = \frac{2\ln 3}{\ln(5/3)} \approx 4.3013$$

**Verify:** $5^{4.3013} \approx 1015.06$ and $3^{6.3013} \approx 1015.06$. ✓

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Solve 5^x = 3^(x+2) algebraically
x_sol = 2*math.log(3) / (math.log(5) - math.log(3))
print(f"5^x = 3^(x+2): x = {x_sol:.6f}")
print(f"  Verify: 5^x = {5**x_sol:.4f},  3^(x+2) = {3**(x_sol+2):.4f}")
print(f"  Match: {math.isclose(5**x_sol, 3**(x_sol+2))}")

print()
# Visualise: find intersection of 5^x and 3^(x+2)
x = np.linspace(0, 6, 400)

fig, ax = plt.subplots(figsize=(8, 5))

ax.plot(x, 5**x,       color='#2980b9', lw=2.5, label='$y = 5^x$')
ax.plot(x, 3**(x+2),   color='#e74c3c', lw=2.5, label='$y = 3^{x+2}$')

# Mark the intersection
y_sol = 5**x_sol
ax.plot(x_sol, y_sol, 'o', color='#27ae60', markersize=11, zorder=5,
        label=f'Solution: $x \\approx {x_sol:.3f}$')
ax.annotate(f'$x \\approx {x_sol:.3f}$\n$5^x = 3^{{x+2}} \\approx {y_sol:.0f}$',
            xy=(x_sol, y_sol), xytext=(x_sol-2.5, y_sol*0.6),
            arrowprops=dict(arrowstyle='->', color='#27ae60', lw=1.2),
            fontsize=9, color='#27ae60')

ax.set_title('$5^x = 3^{x+2}$: graphical solution\n'
             'Intersection at $x = 2\\ln 3 / \\ln(5/3)$', fontsize=11)
ax.set_xlabel('$x$'); ax.set_ylabel('$y$')
ax.set_ylim(0, 1500); ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `5**x` with a numpy array raises 5 to every element
of `x` simultaneously — element-wise scalar power, used throughout
since Lesson 1.6. Plotting both exponential curves and marking their
intersection provides a visual check that the algebraic solution is
correct. `xytext=(x_sol-2.5, y_sol*0.6)` places the annotation label
to the left and below the intersection point to avoid overlapping the curves.

---

### Type 3 — Quadratic Substitution

Some exponential equations become quadratic after substituting $u = b^x$.

**Example:** Solve $e^{2x} - 5e^x + 6 = 0$.

Note $e^{2x} = (e^x)^2$. Let $u = e^x$ (so $u > 0$ always):

$$u^2 - 5u + 6 = 0 \implies (u-2)(u-3) = 0$$

$$u = 2 \quad \text{or} \quad u = 3$$

Back-substitute $e^x = u$:

- $e^x = 2 \implies x = \ln 2 \approx 0.6931$
- $e^x = 3 \implies x = \ln 3 \approx 1.0986$

**Verify both:** $e^{2\ln 2} - 5e^{\ln 2} + 6 = 4 - 10 + 6 = 0$. ✓
$e^{2\ln 3} - 5e^{\ln 3} + 6 = 9 - 15 + 6 = 0$. ✓

```python
import math
import numpy as np
import matplotlib.pyplot as plt

# Verify both solutions
for u in [2, 3]:
    x = math.log(u)
    val = math.e**(2*x) - 5*math.e**x + 6
    print(f"x = ln({u}) = {x:.6f}: e^(2x)-5e^x+6 = {val:.10f}")

print()
# Show quadratic substitution graphically
x = np.linspace(-0.5, 2, 400)
y = np.exp(2*x) - 5*np.exp(x) + 6
# np.exp: element-wise e^x -- unchanged from Lesson 1.7

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# Left: original equation in x
axes[0].plot(x, y, color='#2980b9', lw=2.5)
axes[0].axhline(0, color='#333', lw=0.8)
axes[0].axvline(0, color='#333', lw=0.8)
for root, color in [(math.log(2),'#e74c3c'), (math.log(3),'#27ae60')]:
    axes[0].plot(root, 0, 'o', color=color, markersize=10, zorder=5)
    axes[0].annotate(f'$x=\\ln {round(math.e**root):.0f}$',
                     (root, 0), xytext=(root+0.1, 0.8), fontsize=9, color=color)
axes[0].set_title('$e^{2x}-5e^x+6=0$\nTwo solutions', fontsize=11)
axes[0].set_xlabel('$x$'); axes[0].set_ylabel('$y$')
axes[0].set_ylim(-1, 5); axes[0].grid(True, alpha=0.3)

# Right: after substitution u = e^x, quadratic in u
u = np.linspace(0.5, 4, 300)
axes[1].plot(u, u**2 - 5*u + 6, color='#8e44ad', lw=2.5)
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].axvline(0, color='#333', lw=0.8)
for root, color in [(2,'#e74c3c'), (3,'#27ae60')]:
    axes[1].plot(root, 0, 'o', color=color, markersize=10, zorder=5)
    axes[1].annotate(f'$u={root}$', (root, 0), xytext=(root+0.1, 0.5),
                     fontsize=9, color=color)
axes[1].set_title('After $u=e^x$: $u^2-5u+6=0$\nStandard quadratic', fontsize=11)
axes[1].set_xlabel('$u = e^x$'); axes[1].set_ylabel('$y$')
axes[1].set_ylim(-1, 5); axes[1].grid(True, alpha=0.3)

plt.suptitle('Quadratic substitution $u = e^x$ reduces to a familiar form',
             fontsize=12)
plt.tight_layout()
plt.show()
```

**Walkthrough:** The two-panel plot shows the same equation in two
different variables. Left: $f(x) = e^{2x}-5e^x+6$ plotted against
$x$ — roots at $x=\ln 2$ and $x=\ln 3$, spaced irregularly.
Right: $g(u) = u^2-5u+6$ plotted against $u=e^x$ — a standard
parabola with roots at $u=2$ and $u=3$, evenly spaced. The substitution
makes the structure visible and the solution straightforward.

---

### Type 4 — Logarithmic Equations

For equations where the unknown is inside a logarithm, condense to a
single log and convert to exponential form.

**Example:** Solve $\ln x + \ln(x-1) = \ln 6$.

Both sides are $\ln$ of something, so set arguments equal (injectivity):

$$\ln[x(x-1)] = \ln 6 \implies x(x-1) = 6 \implies x^2 - x - 6 = 0$$

$$(x-3)(x+2) = 0 \implies x = 3 \text{ or } x = -2$$

**Domain check:** $\ln x$ and $\ln(x-1)$ both require positive arguments.
- $x = 3$: $\ln(3) > 0$ and $\ln(2) > 0$. ✓
- $x = -2$: $\ln(-2)$ undefined. ✗ Rejected.

**Answer:** $x = 3$.

**Example:** Solve $\log_2 x + \log_2(x+2) = 3$.

$$\log_2[x(x+2)] = 3 \implies x(x+2) = 2^3 = 8$$

$$x^2 + 2x - 8 = 0 \implies (x+4)(x-2) = 0$$

$x = 2$ (valid) or $x = -4$ (rejected). **Answer:** $x = 2$.

```python
import math
import numpy as np

def solve_log_sum_equals_value(log_base, a1, b1, a2, b2, rhs):
    """
    Solve: log_base(a1*x+b1) + log_base(a2*x+b2) = rhs
    by condensing and solving the resulting quadratic.
    
    Returns list of valid (positive-argument) solutions.
    
    a1, b1: coefficients of first log argument (a1*x + b1)
    a2, b2: coefficients of second log argument (a2*x + b2)
    rhs:    right-hand side constant
    """
    # After condensing: log_base((a1x+b1)(a2x+b2)) = rhs
    # So: (a1x+b1)(a2x+b2) = log_base^rhs
    target = log_base**rhs   # base^rhs

    # Expand (a1x+b1)(a2x+b2) = a1a2 x^2 + (a1b2+a2b1) x + b1b2
    A = a1 * a2
    B = a1*b2 + a2*b1
    C = b1*b2 - target   # move target to left side: A x^2 + B x + C = 0

    discriminant = B**2 - 4*A*C
    if discriminant < 0:
        return []   # no real solutions

    solutions = []
    for sign in [1, -1]:
        x = (-B + sign * math.sqrt(discriminant)) / (2*A)
        # Check domain: both log arguments must be positive
        arg1 = a1*x + b1
        arg2 = a2*x + b2
        if arg1 > 0 and arg2 > 0:
            solutions.append(x)

    return solutions

# Test on our hand-worked examples
sols1 = solve_log_sum_equals_value(math.e, 1,0, 1,-1, math.log(6))
print(f"ln(x) + ln(x-1) = ln(6):  solutions = {[round(s,6) for s in sols1]}")

sols2 = solve_log_sum_equals_value(2, 1,0, 1,2, 3)
print(f"log2(x) + log2(x+2) = 3:  solutions = {[round(s,6) for s in sols2]}")
```

**Walkthrough:** `log_base**rhs` computes $b^{\text{rhs}}$ — the right-hand
side of the converted exponential form. For $\ln$ equations (base $e$),
we pass `log_base=math.e` and `rhs=math.log(6)` so `target = e^(ln 6) = 6`.
The quadratic coefficients are derived by expanding
$(a_1 x + b_1)(a_2 x + b_2)$ and bringing `target` to the left side.
The domain check `arg1 > 0 and arg2 > 0` rejects extraneous solutions.

---

### Type 5 — Applied: Growth and Decay

The most common application: given a model, find when a quantity reaches
a target value.

**Example — Compound interest:** How long until \$1000 invested at 4%
continuous interest doubles?

$$1000 e^{0.04t} = 2000 \implies e^{0.04t} = 2 \implies 0.04t = \ln 2 \implies t = \frac{\ln 2}{0.04} \approx 17.33 \text{ years}$$

(This is the doubling time formula from Lesson 1.6.)

**Example — Tool wear:** $W(t) = 100 \cdot 0.85^t$. When does the tool
reach 10% condition?

$$100 \cdot 0.85^t = 10 \implies 0.85^t = 0.1 \implies t\ln(0.85) = \ln(0.1)$$

$$t = \frac{\ln(0.1)}{\ln(0.85)} \approx \frac{-2.3026}{-0.1625} \approx 14.17 \text{ hours}$$

```python
import math
import numpy as np
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

# --- Left: compound interest doubling ---
t = np.linspace(0, 25, 300)
A = 1000 * np.exp(0.04 * t)   # np.exp: e^x element-wise

t_double = math.log(2) / 0.04

axes[0].plot(t, A, color='#27ae60', lw=2.5, label='$A(t) = 1000e^{0.04t}$')
axes[0].axhline(2000, color='#aaa', lw=1, linestyle='--')
axes[0].plot(t_double, 2000, 'o', color='#e74c3c', markersize=10, zorder=5)
axes[0].annotate(f'$t = \\ln 2 / 0.04 \\approx {t_double:.2f}$ yr',
                 xy=(t_double, 2000), xytext=(t_double+3, 1700),
                 arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=1.2),
                 fontsize=9, color='#e74c3c')
axes[0].set_title('Doubling time: $1000e^{0.04t} = 2000$', fontsize=11)
axes[0].set_xlabel('Time (years)'); axes[0].set_ylabel('Amount ($)')
axes[0].grid(True, alpha=0.3); axes[0].legend(fontsize=9)

# --- Right: tool wear reaching 10% ---
t2 = np.linspace(0, 20, 300)
W  = 100 * 0.85**t2   # 0.85**t2: element-wise scalar power

t_10pct = math.log(0.1) / math.log(0.85)

axes[1].plot(t2, W, color='#e74c3c', lw=2.5, label='$W(t) = 100 \\cdot 0.85^t$')
axes[1].axhline(10, color='#aaa', lw=1, linestyle='--')
axes[1].plot(t_10pct, 10, 'o', color='#2980b9', markersize=10, zorder=5)
axes[1].annotate(f'$t = \\ln(0.1)/\\ln(0.85) \\approx {t_10pct:.2f}$ hr',
                 xy=(t_10pct, 10), xytext=(t_10pct-8, 25),
                 arrowprops=dict(arrowstyle='->', color='#2980b9', lw=1.2),
                 fontsize=9, color='#2980b9')
axes[1].set_title('Tool wear: $100 \\cdot 0.85^t = 10$', fontsize=11)
axes[1].set_xlabel('Time (hours)'); axes[1].set_ylabel('Condition (%)')
axes[1].grid(True, alpha=0.3); axes[1].legend(fontsize=9)

plt.suptitle('Applied exponential equations: solving for time', fontsize=12)
plt.tight_layout()
plt.show()

print(f"Doubling time (4% continuous):  {t_double:.4f} years")
print(f"Tool reaches 10% at: {t_10pct:.4f} hours")
```

**Walkthrough:** Both plots show the same structure: an exponential
curve, a horizontal target line, and the time at which they intersect
— which is the solution to the equation. `np.exp(0.04 * t)` computes
$e^{0.04 t_i}$ at every point; `0.85**t2` computes $0.85^{t_i}$ at
every point. Both are element-wise array operations.

---

### Decision Guide

| Equation form | Strategy |
|---------------|----------|
| $b^{f(x)} = b^{g(x)}$ | Set exponents equal: $f(x) = g(x)$ |
| $b^{f(x)} = c$ | Take $\ln$ both sides: $f(x) = \ln c / \ln b$ |
| $b^x = d^x$ (different bases) | Take $\ln$: $x\ln b = x\ln d$ |
| $b^{f(x)} = d^{g(x)}$ (diff bases) | Take $\ln$: $f(x)\ln b = g(x)\ln d$, solve for $x$ |
| $e^{2x} + pe^x + q = 0$ | Substitute $u = e^x$, solve quadratic |
| $\log_b A = \log_b B$ | Set $A = B$ (injectivity) |
| $\log_b f(x) = c$ | Convert: $f(x) = b^c$ |
| Multiple logs on one side | Condense with log laws, then convert |
| **Always** | Check domain after solving |

---

## Connect the Pieces

**What this lesson built on:** Everything in Lessons 1.6–1.9.
Quadratic equations (Lesson 1.2 — factoring). The Factor Theorem was
used informally in the quadratic substitution step.

**What this lesson makes possible:** Stage 5 (Calculus) — solving
differential equations of the form $y' = ky$ gives $y = Ce^{kx}$, and
finding when $y$ reaches a specific value is exactly the exponential
equation solving done here. Stage 7 (Differential Equations) — virtually
every first-order linear ODE has an exponential solution.

**In manufacturing:** CNC controllers use exponential interpolation for
smooth feedrate transitions; tool management systems solve tool life
equations to predict when a tool needs replacement. Both require solving
exponential equations for $t$.

---

## Summary

**Core moves:**
- Exponential: isolate the exponential, apply $\ln$ to both sides.
- Logarithmic: condense to one log, convert to exponential form.

**Key results:**
$$b^x = c \implies x = \frac{\ln c}{\ln b} \qquad \log_b x = c \implies x = b^c$$

**Quadratic substitution:** $b^{2x} + pb^x + q = 0$ → let $u = b^x$,
solve $u^2 + pu + q = 0$, back-substitute.

**Domain check:** always verify log arguments are positive after solving.

**Extraneous solutions** arise from squaring or from log condensation —
check every candidate.

---

## Problems

### Math

**1.** Solve each equation. Give exact and decimal answers.

(a) $3^{2x} = 81$

(b) $5^{x-1} = 125^{x+2}$

(c) $7^x = 4$

(d) $2^x \cdot 2^{x+3} = 32$

<details>
<summary>Answers</summary>

(a) $3^{2x} = 3^4 \Rightarrow 2x=4 \Rightarrow x=2$.

(b) $5^{x-1}=5^{3(x+2)} \Rightarrow x-1=3x+6 \Rightarrow -2x=7 \Rightarrow x=-7/2$.

(c) $x=\ln 4/\ln 7 \approx 0.7124$.

(d) $2^{2x+3}=2^5 \Rightarrow 2x+3=5 \Rightarrow x=1$.

</details>

---

**2.** Solve by substitution.

(a) $e^{2x} - 4e^x - 5 = 0$

(b) $2^{2x} - 6\cdot 2^x + 8 = 0$

(c) $e^{2x} + e^x - 6 = 0$

<details>
<summary>Answers</summary>

(a) Let $u=e^x$: $u^2-4u-5=0=(u-5)(u+1)=0$. $u=5>0$: $x=\ln 5$. ($u=-1$ rejected.)

(b) Let $u=2^x$: $u^2-6u+8=0=(u-2)(u-4)=0$. $x=1$ or $x=2$.

(c) Let $u=e^x$: $u^2+u-6=0=(u+3)(u-2)=0$. $u=2$: $x=\ln 2$. ($u=-3$ rejected.)

</details>

---

**3.** Solve each logarithmic equation. Reject extraneous solutions.

(a) $\log_5(x+3) - \log_5(x-1) = 1$

(b) $\log(x+5) + \log(x-2) = \log 18$

(c) $2\ln x - \ln(x+1) = 0$

<details>
<summary>Answers</summary>

(a) $\log_5\frac{x+3}{x-1}=1 \Rightarrow \frac{x+3}{x-1}=5 \Rightarrow x+3=5x-5 \Rightarrow x=2$. Both args positive ✓.

(b) $\log[(x+5)(x-2)]=\log 18 \Rightarrow x^2+3x-10=18 \Rightarrow x^2+3x-28=0=(x+7)(x-4)=0$. $x=4$ ✓; $x=-7$ ✗. **$x=4$**.

(c) $\ln\frac{x^2}{x+1}=0 \Rightarrow \frac{x^2}{x+1}=1 \Rightarrow x^2=x+1 \Rightarrow x^2-x-1=0 \Rightarrow x=\frac{1\pm\sqrt{5}}{2}$. Positive root: $x=\frac{1+\sqrt{5}}{2}\approx 1.618$ ✓.

</details>

---

**4.** A bacterial population grows according to $P(t) = 500 e^{0.3t}$
(where $t$ is in hours).

(a) When does the population reach 5000?

(b) When does it reach 50000?

(c) By what factor does doubling the time increase the population?

<details>
<summary>Answers</summary>

(a) $500e^{0.3t}=5000 \Rightarrow e^{0.3t}=10 \Rightarrow t=\ln(10)/0.3 \approx 7.68$ hr.

(b) $t=\ln(100)/0.3 = 2\ln(10)/0.3 \approx 15.35$ hr. (Exactly twice part (a).)

(c) $P(2t)/P(t) = e^{0.3\cdot 2t}/e^{0.3t} = e^{0.3t}$, which grows with $t$. At $t=7.68$: factor $= e^{0.3\times7.68} = e^{\ln 10} = 10$.

</details>

---

### Code Challenges

**Challenge 1 — Universal exponential equation solver**

```python
import math

def solve_exponential(base, coefficient, target, exponent_scale=1.0):
    """
    Solve: coefficient * base^(exponent_scale * x) = target
    Returns x, or None if no solution exists.
    
    coefficient:     the multiplier in front (e.g. 1000 in 1000*e^(0.04x)=2000)
    base:            the exponential base
    target:          the right-hand side value
    exponent_scale:  the coefficient of x in the exponent (e.g. 0.04)
    """
    pass  # your code here


# --- tests: do not modify ---
# 1000*e^(0.04x) = 2000  =>  x = ln(2)/0.04
sol = solve_exponential(math.e, 1000, 2000, 0.04)
assert math.isclose(sol, math.log(2)/0.04, rel_tol=1e-6)

# 100*0.85^x = 10  =>  x = ln(0.1)/ln(0.85)
sol2 = solve_exponential(0.85, 100, 10)
assert math.isclose(sol2, math.log(0.1)/math.log(0.85), rel_tol=1e-6)

# 3^(2x) = 81  =>  2x = 4  =>  x = 2
sol3 = solve_exponential(3, 1, 81, exponent_scale=2)
assert math.isclose(sol3, 2.0, rel_tol=1e-6)

# No solution: 2^x = -1
sol4 = solve_exponential(2, 1, -1)
assert sol4 is None

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

Rearrange: `base^(scale * x) = target / coefficient`. If `target / coefficient <= 0`,
return `None` (no solution). Otherwise: `scale * x = log(target/coefficient) / log(base)`.
Solve for `x`.

</details>

---

**Challenge 2 — Quadratic substitution solver**

```python
import math

def solve_exp_quadratic(base, p, q):
    """
    Solve: base^(2x) + p * base^x + q = 0
    using the substitution u = base^x.
    
    Returns list of real solutions x (rejecting u <= 0).
    """
    pass  # your code here


# --- tests: do not modify ---
# e^(2x) - 5e^x + 6 = 0  =>  x = ln2, ln3
sols = solve_exp_quadratic(math.e, -5, 6)
assert math.isclose(min(sols), math.log(2), rel_tol=1e-8)
assert math.isclose(max(sols), math.log(3), rel_tol=1e-8)

# 2^(2x) - 6*2^x + 8 = 0  =>  x = 1, 2
sols2 = solve_exp_quadratic(2, -6, 8)
assert sorted([round(s) for s in sols2]) == [1, 2]

# e^(2x) + e^x - 6 = 0  =>  x = ln2 only (u=-3 rejected)
sols3 = solve_exp_quadratic(math.e, 1, -6)
assert len(sols3) == 1
assert math.isclose(sols3[0], math.log(2), rel_tol=1e-8)

print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Find when two models intersect**

Two competing models describe the same physical quantity. Find when they
are equal by solving the resulting exponential or logarithmic equation.

```python
import math
import numpy as np

def find_intersection_time(model1, model2, t_low, t_high, tol=1e-8):
    """
    Find t in [t_low, t_high] where model1(t) == model2(t).
    Uses bisection: the simplest root-finding algorithm.
    
    Bisection: if f(t) = model1(t) - model2(t) changes sign on [a,b],
    check the midpoint m = (a+b)/2. If f(m) has the same sign as f(a),
    the root is in [m,b]; otherwise it's in [a,m]. Repeat until |b-a| < tol.
    
    model1, model2: callables t -> float
    Returns: t where models are equal (to within tol)
    """
    pass  # your code here


# --- tests: do not modify ---
# 1000*e^(0.04t) = 500*e^(0.07t) => when do they meet?
# e^(0.03t) = 2 => t = ln(2)/0.03
t_sol = find_intersection_time(
    lambda t: 1000*math.exp(0.04*t),
    lambda t: 500*math.exp(0.07*t),
    0, 100
)
expected = math.log(2) / 0.03
assert math.isclose(t_sol, expected, rel_tol=1e-5), f"{t_sol} vs {expected}"

print("✓ Challenge 3 passed!")
print(f"  1000e^(0.04t) = 500e^(0.07t) at t = {t_sol:.4f} (exact: {expected:.4f})")
```

<details>
<summary>Hint for bisection</summary>

```python
f = lambda t: model1(t) - model2(t)
a, b = t_low, t_high
while b - a > tol:
    m = (a + b) / 2
    if f(a) * f(m) < 0:
        b = m
    else:
        a = m
return (a + b) / 2
```

</details>

---

### Extension

**4. ★** The equation $x^x = 100$ cannot be solved with logarithms alone
(it becomes $x \ln x = \ln 100$, which is transcendental).

(a) Use bisection (from Challenge 3) to find the solution numerically.

(b) Estimate the number of iterations needed for bisection to reach
tolerance $10^{-10}$ starting from $[1, 10]$.
*(Hint: each iteration halves the interval.)*

```python
import math

def solve_x_to_x(target, t_low=1, t_high=10, tol=1e-10):
    """Find x such that x^x = target using bisection."""
    pass

sol = solve_x_to_x(100)
print(f"x^x = 100: x = {sol:.10f}")
print(f"Verify: {sol:.10f}^{sol:.10f} = {sol**sol:.10f}")
```

**5. ★** Prove that the equation $e^x = cx$ has:
- No solution when $c \leq 0$
- Exactly one solution when $c = e$
- Two solutions when $c > e$
- No real solution when $0 < c < e$

*(This is a graphical argument: sketch $y = e^x$ and $y = cx$ for each
case, using the tangency condition at $c = e$.)*

<details>
<summary>Answer</summary>

$e^x = cx$ iff $e^x/(cx) = 1$ iff the line $y=cx$ is tangent to or
intersects $y=e^x$.

At a tangent point: slopes must match, so $c = e^x$ (slope of $e^x$)
and $cx = e^x$ (the equation itself). Dividing: $x=1$, so $c=e$.
At $x=1$: line $y=ex$ is tangent to $e^x$.

For $c<e$: line too shallow, no intersection.
For $c=e$: exactly tangent, one solution ($x=1$).
For $c>e$: line steeper, intersects $e^x$ at two points.
For $c\leq0$: $cx \leq 0 < e^x$, no solution. $\square$

</details>
