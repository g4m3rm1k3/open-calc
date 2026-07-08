# Stage 1, Lesson 1.12 — Why $i$ Exists: Completing the Number System
**Threads:** Math · CS  
**Estimated time:** 50–65 minutes

---

## What This Lesson Is About

This lesson asks one of the most consequential questions in the history
of mathematics: **what happens when you encounter $\sqrt{-1}$?**

For 16th-century algebraists working on cubic equations, the answer
was not "that's impossible" — it was "treat it as a symbol, keep
calculating, and see if the imaginary parts cancel at the end." They
did cancel. The answers were real and correct. Something genuinely new
had been discovered: numbers of a new kind, whose square is negative.

Today we call these **complex numbers**, and they are not a curiosity
or a workaround — they are the natural setting for oscillations,
waves, signal processing, quantum mechanics, and control systems.
This lesson traces the logic that forces complex numbers to exist:
the number line is incomplete, and no matter how far you extend it,
you cannot solve $x^2 + 1 = 0$ without adding a genuinely new kind
of number. By the end you understand what $i$ is, why it is not
"imaginary" in the dismissive sense, and how the complex numbers form
a complete algebraic system that subsumes every number you have seen.

---

## Historical Context

In 1545, Girolamo Cardano published *Ars Magna*, the first book to give
a systematic method for solving cubic equations ($ax^3 + bx^2 + cx + d = 0$).
His method — and independently the method of Niccolò Tartaglia and later
Lodovico Ferrari — occasionally produced expressions of the form
$\sqrt{-15}$ in intermediate steps, even when the final answer was a
real number. Cardano called these "sophistic" numbers and warned readers
to "put aside the mental tortures involved." A generation later, Rafael
Bombelli in 1572 went further: he gave rules for arithmetic with $\sqrt{-1}$,
treating it as a new type of quantity that follows algebraic rules. The
key insight: if you follow the rules consistently, the $\sqrt{-}$ terms
cancel and leave real numbers. This cannot happen by accident.

The name "imaginary" was coined dismissively by René Descartes in 1637,
but by the 18th century, Leonhard Euler was using $i = \sqrt{-1}$
fluently (1748), and by the early 19th century, Carl Friedrich Gauss
and Augustin-Louis Cauchy had placed complex numbers on a rigorous
geometric footing.

---

## What You Need To Know First

- **Quadratic equations** — Lesson 1.2. The quadratic formula gives
  $x = (-b \pm \sqrt{b^2-4ac})/2a$. When $b^2-4ac < 0$, the
  discriminant is negative.
- **Square roots of real numbers** — $\sqrt{a} \cdot \sqrt{a} = a$ for $a \geq 0$.
- **Factoring** — Lesson 1.2. The key fact: over the reals, $x^2 + 1$
  has no roots and cannot be factored.
- **Polynomial remainder theorem** — Lesson 1.3. A polynomial $p(x)$
  has $r$ as a root iff $(x - r)$ is a factor.

---

## The Lesson

### The Real Number Line is Incomplete

The real number line $\mathbb{R}$ is a complete ordered field. It contains
all integers, rationals, and irrationals. But it has one gap: it
cannot solve every polynomial equation with real coefficients.

Consider:

$$x^2 + 1 = 0 \implies x^2 = -1$$

Is there any real number whose square is $-1$? No. For any real $a$:
- If $a > 0$: $a^2 > 0$
- If $a = 0$: $a^2 = 0$
- If $a < 0$: $a^2 = (-a)^2 > 0$

In all cases, $a^2 \geq 0$. Squaring a real number cannot give a
negative result. Therefore $x^2 + 1 = 0$ has **no real solutions**.

This is not a minor nuisance. The polynomial $x^2 + 1$ is a perfectly
well-formed degree-2 polynomial. By the **Fundamental Theorem of
Algebra** (which you saw in Lesson 1.4), every degree-$n$ polynomial
has exactly $n$ roots — counting multiplicity. But only if we allow
complex numbers. Over the reals, $x^2 + 1$ has zero roots, violating
the pattern.

**The fix:** extend the real number line to include a new number whose
square is $-1$, and define arithmetic consistently. This is exactly
the same strategy that extended $\mathbb{N}$ to $\mathbb{Z}$ (add
negatives), extended $\mathbb{Z}$ to $\mathbb{Q}$ (add fractions),
and extended $\mathbb{Q}$ to $\mathbb{R}$ (add irrationals).

```python
import numpy as np

# Try to find a real root of x^2 + 1
# Method: fine grid search
x_vals = np.linspace(-1000, 1000, 10_000_000)   # 10 million points
f_vals = x_vals**2 + 1

# The minimum value of f on this grid
min_val = np.min(f_vals)
min_at  = x_vals[np.argmin(f_vals)]

print(f"Searching for roots of x² + 1 over [-1000, 1000]:")
print(f"  Minimum value on grid: {min_val:.6f}  (at x = {min_at:.6f})")
print(f"  Minimum is {min_val:.6f}, never reaches 0 → no real root")
print()

# Contrast with x^2 - 2 (which does have real roots)
g_vals = x_vals**2 - 2
print(f"For comparison, x² − 2 has minimum {np.min(g_vals):.6f}")
print(f"  crosses zero at approximately x = ±{np.sqrt(2):.6f}")
print()

# Polynomial coefficients of x^2 + 1 and numpy root-finding
# np.roots uses eigenvalue method and allows complex roots
coeffs_no_real = [1, 0, 1]   # x^2 + 0*x + 1
roots_complex  = np.roots(coeffs_no_real)
print("np.roots([1, 0, 1]) — allows complex numbers:")
for r in roots_complex:
    print(f"  x = {r}    check: x^2+1 = {r**2 + 1}")
```

**Walkthrough:** `np.linspace(-1000, 1000, 10_000_000)` creates 10 million
equally spaced points between $-1000$ and $1000$. `x_vals**2 + 1` evaluates
$x^2+1$ element-wise. `np.min(f_vals)` finds the global minimum on the grid
— for $x^2+1$ this is exactly 1 (at $x=0$), confirming the function
never reaches zero. `np.roots([1, 0, 1])` finds roots of $x^2 + 1$
using an eigenvalue algorithm; unlike the real number line, numpy allows
complex numbers by default and returns $i$ and $-i$.

---

### Defining $i$

We **define** a new symbol $i$ with a single rule:

$$\boxed{i^2 = -1}$$

This is a definition, not a discovery of a hidden real number. We
are extending the number system to include a new element. Consistency
requires that $i$ follows all the usual algebraic rules (addition,
multiplication, distributivity, associativity, commutativity). We
check that no contradiction arises — and none does.

**Geometric lens:** you cannot place $i$ on the real number line. It
lives on a perpendicular axis — the **imaginary axis**. The full
space of complex numbers is a **plane** (the complex plane, introduced
in Lesson 1.14), where the real axis is horizontal and the imaginary
axis is vertical.

**Physical lens:** $i$ is not "unreal" in any physical sense. In
alternating-current circuits, voltage and current are 90° out of phase.
The mathematical description of phase is rotation in a plane, which
requires two-dimensional complex numbers. Every AC circuit calculation
uses $j = i$ (engineers use $j$ to avoid confusion with current $I$).

**Powers of $i$:**

Once we define $i^2 = -1$, the higher powers follow mechanically:

$$i^1 = i$$
$$i^2 = -1$$
$$i^3 = i^2 \cdot i = -1 \cdot i = -i$$
$$i^4 = i^3 \cdot i = -i \cdot i = -i^2 = -(-1) = 1$$
$$i^5 = i^4 \cdot i = 1 \cdot i = i$$

The pattern repeats with period 4: $i, -1, -i, 1, i, -1, -i, 1, \ldots$

To compute any power $i^n$: find $n \bmod 4$.

| $n \bmod 4$ | $i^n$ |
|------------|-------|
| 0 | $1$ |
| 1 | $i$ |
| 2 | $-1$ |
| 3 | $-i$ |

**Hand-worked example:** compute $i^{47}$.

$47 = 4 \times 11 + 3$, so $47 \bmod 4 = 3$.
Therefore $i^{47} = i^3 = -i$.

**Verification:** $i^{48} = (i^4)^{12} = 1^{12} = 1$, and
$i^{47} = i^{48}/i = 1/i$. Multiplying numerator and denominator
by $i$: $1/i \cdot i/i = i/i^2 = i/(-1) = -i$. Confirmed.

```python
def power_of_i(n):
    """
    Compute i^n exactly (as a string +/- 1 or +/- i)
    using the period-4 cycle, not floating-point.
    n can be any non-negative integer.
    """
    remainder = n % 4    # Python % always returns non-negative for positive divisor
    cycle = {0: '1', 1: 'i', 2: '-1', 3: '-i'}
    return cycle[remainder]

def power_of_i_numeric(n):
    """
    Return i^n as a Python complex number.
    1j is Python's notation for the imaginary unit.
    """
    return (1j)**n   # Python handles complex arithmetic natively

print("Powers of i:")
print(f"{'n':>5}  {'i^n (exact)':>12}  {'i^n (numeric)':>20}")
print("-" * 42)
for n in range(12):
    exact   = power_of_i(n)
    numeric = power_of_i_numeric(n)
    print(f"{n:>5}  {exact:>12}  {str(numeric):>20}")

print()
print("Large powers:")
for n in [47, 100, 999, 1024]:
    exact   = power_of_i(n)
    numeric = power_of_i_numeric(n)
    print(f"  i^{n} = {exact:>4}   (numeric: {numeric})")
```

**Walkthrough:** `1j` is Python's built-in notation for the imaginary
unit — Python has native complex number support. `(1j)**n` computes
$i^n$ using floating-point complex arithmetic; the result will be
a complex number with negligible floating-point error. The `%` operator
always returns a non-negative result when the divisor is positive, so
`n % 4` gives $0, 1, 2, 3$ for any non-negative `n`.

---

### Complex Numbers: Definition and Structure

A **complex number** is any expression of the form:

$$z = a + bi$$

where $a, b \in \mathbb{R}$ and $i^2 = -1$.

- $a = \text{Re}(z)$ is the **real part**
- $b = \text{Im}(z)$ is the **imaginary part** (a real number, the coefficient of $i$)
- When $b = 0$: $z = a$ is a real number. $\mathbb{R} \subset \mathbb{C}$
- When $a = 0$, $b \neq 0$: $z = bi$ is called **purely imaginary**
- When $a = b = 0$: $z = 0$

The set of all complex numbers is denoted $\mathbb{C}$.

**The number hierarchy:**

$$\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}$$

Each step is an extension that preserves all existing arithmetic and
adds something new. $\mathbb{C}$ is the final step in this chain —
the **algebraically closed** extension of $\mathbb{R}$, meaning every
polynomial with complex coefficients has all its roots in $\mathbb{C}$.

**Equality:** two complex numbers are equal if and only if both their
real parts are equal **and** their imaginary parts are equal:

$$a + bi = c + di \iff a = c \text{ and } b = d$$

This is important: a single complex equation $z_1 = z_2$ encodes
**two** real equations simultaneously. Engineers use this to solve
two equations at once.

```python
import cmath   # Python's complex math module

# Python complex number literals
z1 = 3 + 4j    # 3 + 4i   (Python uses j for i)
z2 = 1 - 2j    # 1 - 2i
z3 = 5 + 0j    # real number embedded in C
z4 = 0 + 3j    # purely imaginary

print("Complex numbers:")
for label, z in [('z1 = 3+4i', z1), ('z2 = 1-2i', z2),
                  ('z3 = 5', z3),   ('z4 = 3i', z4)]:
    print(f"  {label:<12} Re={z.real:>6.1f}   Im={z.imag:>6.1f}   "
          f"is_real={z.imag==0}   is_pure_imag={z.real==0 and z.imag!=0}")
print()

# The number hierarchy: every real number is complex
real_as_complex = complex(2.718)   # e as complex: 2.718 + 0i
print(f"  Every real is complex: {real_as_complex}")
print()

# Equality: component-wise
print("Equality check:")
print(f"  (2+3j) == (2+3j)? {(2+3j) == (2+3j)}")
print(f"  (2+3j) == (2+4j)? {(2+3j) == (2+4j)}  (imaginary parts differ)")
print()

# Solving x^2 + 1 = 0 in C
# Roots are i and -i
root1 = 1j
root2 = -1j
print("Roots of x² + 1 in C:")
for r in [root1, root2]:
    check = r**2 + 1
    print(f"  x = {r}:   x²+1 = {check}   ✓" if abs(check) < 1e-15
          else f"  x = {r}:   x²+1 = {check}   ✗")

# General quadratic with complex roots
# x^2 - 4x + 13 = 0  discriminant = 16 - 52 = -36
import cmath
a, b, c = 1, -4, 13
disc = complex(b**2 - 4*a*c)   # -36 + 0j
r1 = (-b + cmath.sqrt(disc)) / (2*a)
r2 = (-b - cmath.sqrt(disc)) / (2*a)
print(f"\nRoots of x²-4x+13=0:")
print(f"  x₁ = {r1}   check: {a*r1**2 + b*r1 + c:.1e}")
print(f"  x₂ = {r2}   check: {a*r2**2 + b*r2 + c:.1e}")
```

**Walkthrough:** Python uses `j` (not `i`) for the imaginary unit.
Writing `3 + 4j` creates a complex number directly — no import needed.
`.real` and `.imag` access the components. `cmath` is the complex
version of `math`: `cmath.sqrt(-36)` returns `6j` rather than raising
an error. `complex(b**2 - 4*a*c)` converts a negative real to a complex
number so `cmath.sqrt` can process it.

---

### Why the Complex Numbers Cannot Be "Real" Numbers in Disguise

A subtle but important point: $i$ is not a real number written in a
tricky way. You cannot encode $i$ as a decimal or a fraction or any
real number, because real numbers are ordered and $i$ has no position
on the real number line.

Specifically: in $\mathbb{R}$, for every nonzero element $a$, either
$a > 0$ or $a < 0$. In either case, $a^2 > 0$. So no real number can
have a negative square. $i$ does not fit this.

Furthermore, the complex numbers cannot be made into an **ordered
field**: there is no ordering $<$ on $\mathbb{C}$ that is compatible
with addition and multiplication. (Any such ordering would require
either $i > 0$ or $i < 0$, and both lead to contradictions — try it.)
This means $\mathbb{C}$ genuinely extends $\mathbb{R}$ in a way that
gives up ordering but gains algebraic completeness.

**The trade-off:**
- $\mathbb{R}$: ordered, but not algebraically closed
- $\mathbb{C}$: algebraically closed (every polynomial has roots), but not ordered

---

### Solving Equations with Complex Roots

**Quadratic $x^2 + bx + c = 0$ with negative discriminant:**

Discriminant $\Delta = b^2 - 4c < 0$. Write $\Delta = -D$ where $D > 0$.

$$x = \frac{-b \pm \sqrt{-D}}{2} = \frac{-b \pm \sqrt{D}\,i}{2}$$

So $x = -b/2 \pm (\sqrt{D}/2)\,i$. The two roots are **complex conjugates**
of each other: $z$ and $\bar{z} = a - bi$ when $z = a + bi$.

**Key observation:** complex roots of polynomials with real coefficients
always come in conjugate pairs. If $a + bi$ is a root, then $a - bi$ is
also a root. (This is because conjugation distributes over addition and
multiplication, and $\overline{a} = a$ for real $a$.)

**Hand-worked example:** find the roots of $x^2 - 2x + 5 = 0$.

Discriminant: $\Delta = (-2)^2 - 4(1)(5) = 4 - 20 = -16$.

$$x = \frac{2 \pm \sqrt{-16}}{2} = \frac{2 \pm 4i}{2} = 1 \pm 2i$$

Roots: $x_1 = 1 + 2i$ and $x_2 = 1 - 2i$ (a conjugate pair).

**Verification:** multiply $(x - (1+2i))(x - (1-2i))$:

$$= (x-1-2i)(x-1+2i) = ((x-1) - 2i)((x-1) + 2i)$$
$$= (x-1)^2 - (2i)^2 = (x-1)^2 - 4i^2 = (x-1)^2 + 4$$
$$= x^2 - 2x + 1 + 4 = x^2 - 2x + 5 \checkmark$$

```python
import cmath
import numpy as np
import matplotlib.pyplot as plt

def solve_quadratic_complex(a, b, c):
    """
    Solve ax^2 + bx + c = 0 over C.
    Returns (root1, root2) as Python complex numbers.
    Always works, whether roots are real or complex.
    """
    disc = complex(b**2 - 4*a*c)
    sqrt_disc = cmath.sqrt(disc)   # cmath.sqrt handles negative discriminants
    return (-b + sqrt_disc) / (2*a), (-b - sqrt_disc) / (2*a)

# Test cases
equations = [
    (1, -5,  6,  "x²-5x+6=0   (real roots)"),
    (1, -2,  5,  "x²-2x+5=0   (complex roots)"),
    (1,  0,  1,  "x²+1=0      (pure imaginary roots)"),
    (1, -4, 13,  "x²-4x+13=0  (complex roots)"),
    (2, -3,  2,  "2x²-3x+2=0  (complex roots)"),
]

print(f"{'Equation':<30}  {'Root 1':>18}  {'Root 2':>18}  {'Check'}")
print("-" * 80)
for a, b, c, label in equations:
    r1, r2 = solve_quadratic_complex(a, b, c)
    chk1 = abs(a*r1**2 + b*r1 + c)
    chk2 = abs(a*r2**2 + b*r2 + c)
    ok   = '✓' if chk1 < 1e-10 and chk2 < 1e-10 else '✗'
    print(f"{label:<30}  {str(r1):>18}  {str(r2):>18}  {ok}")

# Visualise: real vs complex roots
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

x = np.linspace(-3, 7, 500)

# Left: two parabolas, one with real roots, one without
for ax_idx, (a2, b2, c2, color, label) in enumerate([
    (1, -5, 6,  '#2980b9', 'x²-5x+6  (real roots at x=2, x=3)'),
    (1, -2, 5,  '#e74c3c', 'x²-2x+5  (complex roots, never crosses x-axis)'),
]):
    y = a2*x**2 + b2*x + c2
    axes[0].plot(x, y, color=color, lw=2.5, label=label)

axes[0].axhline(0, color='#333', lw=1)
axes[0].set_xlabel('x')
axes[0].set_ylabel('f(x)')
axes[0].set_ylim(-3, 12)
axes[0].set_title('Parabolas: real roots vs complex roots\n'
                  'If it never crosses x-axis, roots are complex', fontsize=10)
axes[0].legend(fontsize=8)
axes[0].grid(True, alpha=0.3)

# Right: powers of i on the complex plane
powers = [(1j)**n for n in range(8)]
for n, z in enumerate(powers):
    axes[1].scatter([z.real], [z.imag], s=120, color='#e74c3c', zorder=5)
    axes[1].annotate(f'$i^{{{n}}}$={power_of_i(n)}',
                     xy=(z.real, z.imag),
                     xytext=(z.real + 0.1, z.imag + 0.12),
                     fontsize=9, color='#c0392b')

axes[1].axhline(0, color='#333', lw=1)
axes[1].axvline(0, color='#333', lw=1)
axes[1].set_xlim(-1.8, 1.8); axes[1].set_ylim(-1.8, 1.8)
axes[1].set_xlabel('Real axis')
axes[1].set_ylabel('Imaginary axis')
axes[1].set_title('Powers of $i$ cycle with period 4:\n$i → -1 → -i → 1 → i → ...$', fontsize=10)
axes[1].grid(True, alpha=0.3)
axes[1].set_aspect('equal')

plt.suptitle('Complex numbers: extending ℝ to solve all polynomial equations', fontsize=11)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `cmath.sqrt(disc)` accepts a complex argument and returns
the principal square root, correctly handling negative discriminants.
`abs(a*r1**2 + b*r1 + c)` computes the magnitude of the residual — it
should be numerically zero (or very close) if $r_1$ is a root. The left
plot shows that a parabola that never crosses the $x$-axis (like $x^2-2x+5$)
has complex roots. The right plot visualises the period-4 cycle of $i^n$
on the complex plane — the four points rotate 90° each step.

---

## Connect the Pieces

**What this lesson built on:** Quadratic formula (Lesson 1.2), the
Fundamental Theorem of Algebra (Lesson 1.4, which stated that every
degree-$n$ polynomial has exactly $n$ roots in $\mathbb{C}$). This
lesson explains what $\mathbb{C}$ is, completing the statement of
the FTA.

**What this lesson makes possible:** Lesson 1.13 (complex arithmetic —
adding, multiplying, dividing), Lesson 1.14 (complex plane / Argand
diagram), Lesson 1.16 (Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$).
Further: Stage 3 (Fourier transform uses complex exponentials),
Stage 7 (signals and systems — impedance, poles, zeros of transfer
functions all live in $\mathbb{C}$).

**In engineering:** impedance of a capacitor is $Z_C = 1/(j\omega C)$
and of an inductor is $Z_L = j\omega L$ — both purely imaginary,
representing phase shifts. Phasor analysis, filter design, and control
system stability analysis all require complex arithmetic.

---

## Summary

- $x^2 = -1$ has no real solutions because $a^2 \geq 0$ for all real $a$.
- We **define** $i$ by the rule $i^2 = -1$; this is an extension of $\mathbb{R}$.
- A **complex number** is $z = a + bi$ with $a, b \in \mathbb{R}$.
  - Real part: $\text{Re}(z) = a$
  - Imaginary part: $\text{Im}(z) = b$
- Powers of $i$ cycle with period 4: $i^1=i,\ i^2=-1,\ i^3=-i,\ i^4=1$.
  To compute $i^n$: find $n \bmod 4$.
- Quadratic $ax^2 + bx + c = 0$ with negative discriminant has roots
  $x = (-b \pm \sqrt{|{\Delta}|}\,i)/(2a)$, a **conjugate pair**.
- $\mathbb{N} \subset \mathbb{Z} \subset \mathbb{Q} \subset \mathbb{R} \subset \mathbb{C}$
- Python: `j` is the imaginary unit; `cmath` provides complex-aware functions.

**New Python:**
- `1j` — the imaginary unit in Python
- `z.real`, `z.imag` — real and imaginary parts
- `cmath.sqrt(x)` — complex square root (handles negative arguments)
- `complex(a, b)` or `a + bj` — create complex number

---

## Problems

### Math

**1.** Compute each of the following:
(a) $i^{13}$ (b) $i^{100}$ (c) $i^{-1}$ (d) $i^{-3}$

<details>
<summary>Answers</summary>

(a) $13 \bmod 4 = 1 \implies i^{13} = i$.
(b) $100 \bmod 4 = 0 \implies i^{100} = 1$.
(c) $i^{-1} = 1/i = 1/i \cdot i/i = i/i^2 = i/(-1) = -i$. Alternatively $(-1) \bmod 4 = 3 \implies i^{-1} = i^3 = -i$.
(d) $i^{-3} = 1/i^3 = 1/(-i) = -1/i = -(-i) = i$.

</details>

---

**2.** Find all complex roots of each quadratic. Express in the form $a + bi$.

(a) $x^2 + 4 = 0$
(b) $x^2 - 6x + 13 = 0$
(c) $x^2 + x + 1 = 0$ *(Hint: discriminant is $-3$)*
(d) $3x^2 - 2x + 1 = 0$

<details>
<summary>Answers</summary>

(a) $x = \pm 2i$.

(b) $\Delta = 36 - 52 = -16$; $x = (6 \pm 4i)/2 = 3 \pm 2i$.

(c) $\Delta = 1 - 4 = -3$; $x = (-1 \pm \sqrt{3}\,i)/2$.

(d) $\Delta = 4 - 12 = -8$; $x = (2 \pm 2\sqrt{2}\,i)/6 = (1 \pm \sqrt{2}\,i)/3$.

</details>

---

**3.** (a) Verify that $z = 1 + 2i$ satisfies $z^2 - 2z + 5 = 0$ by direct substitution.
(b) Using the conjugate root theorem, write down the other root immediately without
computing it. Then verify that root satisfies the equation too.

<details>
<summary>Answers</summary>

(a) $z^2 = (1+2i)^2 = 1 + 4i + 4i^2 = 1 + 4i - 4 = -3+4i$.
$z^2 - 2z + 5 = (-3+4i) - 2(1+2i) + 5 = (-3+4i) - 2 - 4i + 5 = 0$. ✓

(b) Conjugate root theorem: the other root is $\bar{z} = 1 - 2i$.
Check: $(1-2i)^2 - 2(1-2i) + 5 = (-3-4i) - (2-4i) + 5 = -3-4i-2+4i+5 = 0$. ✓

</details>

---

**4.** (Proof) Prove that complex roots of a polynomial with **real** coefficients
come in conjugate pairs. That is: if $p(z) = a_n z^n + \cdots + a_0$ with all
$a_k \in \mathbb{R}$, and $p(w) = 0$, then $p(\bar{w}) = 0$.

*(Hint: use the facts that $\overline{z_1 + z_2} = \bar{z}_1 + \bar{z}_2$,
$\overline{z_1 z_2} = \bar{z}_1\, \bar{z}_2$, and $\bar{a} = a$ for real $a$.)*

<details>
<summary>Proof</summary>

Since $p(w) = 0$, take the complex conjugate of both sides:
$\overline{p(w)} = \bar{0} = 0$.
Now:
$$\overline{p(w)} = \overline{\sum_{k=0}^n a_k w^k}
= \sum_{k=0}^n \overline{a_k w^k}
= \sum_{k=0}^n \overline{a_k}\, \overline{w^k}
= \sum_{k=0}^n a_k \bar{w}^k = p(\bar{w})$$

(using $\overline{a_k} = a_k$ since $a_k \in \mathbb{R}$, and $\overline{w^k} = \bar{w}^k$).
Therefore $p(\bar{w}) = 0$. $\square$

</details>

---

### Code Challenges

**Challenge 1 — Powers and roots of $i$**

```python
import cmath
import math

def power_i(n):
    """
    Return i^n as a string: one of '1', 'i', '-1', '-i'.
    Use the period-4 cycle. n can be any integer (including negative).
    For negative n: use i^(-n) = conjugate of i^n when |i|=1.
    Hint: Python's % always gives non-negative results for positive divisor.
    """
    pass  # your code here

def quadratic_roots(a, b, c):
    """
    Solve a*x^2 + b*x + c = 0 over C.
    Returns (root1, root2) as complex numbers.
    Raise ValueError if a == 0.
    """
    pass  # your code here

def count_real_roots(a, b, c):
    """
    Return the number of distinct real roots of a*x^2 + b*x + c = 0.
    Possible returns: 0 (complex roots), 1 (double root), 2 (distinct real roots).
    """
    pass  # your code here


# --- tests: do not modify ---
# power_i
assert power_i(0) == '1'
assert power_i(1) == 'i'
assert power_i(2) == '-1'
assert power_i(3) == '-i'
assert power_i(4) == '1'
assert power_i(7) == '-i'
assert power_i(100) == '1'
assert power_i(-1) == '-i'    # i^(-1) = -i
assert power_i(-2) == '-1'   # i^(-2) = -1
assert power_i(47) == '-i'

# quadratic_roots
r1, r2 = quadratic_roots(1, 0, 1)   # x^2 + 1 = 0 → i, -i
assert abs(r1 - 1j) < 1e-10 or abs(r1 + 1j) < 1e-10
assert abs(r1**2 + 1) < 1e-10
assert abs(r2**2 + 1) < 1e-10

r1, r2 = quadratic_roots(1, -2, 5)   # x^2 - 2x + 5 → 1+2i, 1-2i
for r in [r1, r2]:
    assert abs(r**2 - 2*r + 5) < 1e-10

# ValueError for a=0
try:
    quadratic_roots(0, 1, 1)
    assert False
except ValueError:
    pass

# count_real_roots
assert count_real_roots(1, -5, 6)  == 2   # x=2, x=3
assert count_real_roots(1, -2, 1)  == 1   # (x-1)^2, double root
assert count_real_roots(1,  0, 1)  == 0   # complex roots

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`power_i`: `remainder = n % 4`; map `{0:'1', 1:'i', 2:'-1', 3:'-i'}[remainder]`.
`quadratic_roots`: check `a==0`, compute `disc = complex(b**2 - 4*a*c)`,
return `(-b + cmath.sqrt(disc))/(2*a), (-b - cmath.sqrt(disc))/(2*a)`.
`count_real_roots`: compute `disc = b**2 - 4*a*c`; return 2 if >0, 1 if ==0, 0 if <0.

</details>

---

**Challenge 2 — Exploring the number hierarchy**

```python
import cmath

def classify_number(z):
    """
    Classify a Python complex number z:
    - 'natural'        if z is a non-negative integer with Im=0
    - 'integer'        if z has Im=0 and Re is an integer (possibly negative)
    - 'rational'       if z has Im=0 and Re is a float that equals a fraction p/q
                       (for this challenge: check if z.real == round(z.real * 10) / 10
                        within tolerance 1e-10, i.e. one decimal place)
    - 'real'           if z has Im=0
    - 'purely imaginary' if z has Re=0 and Im != 0
    - 'complex'        otherwise
    Return the most specific applicable label.
    """
    pass  # your code here

def is_conjugate_pair(z1, z2):
    """
    Return True if z2 == conj(z1), i.e. z2 == z1.real - z1.imag * j.
    Use tolerance 1e-10.
    """
    pass  # your code here

def verify_conjugate_root_theorem(coeffs, roots):
    """
    Given a list of real polynomial coefficients (highest degree first)
    and a list of its complex roots, verify that roots come in conjugate pairs
    (or are real). Return True if valid, False otherwise.
    
    coeffs: list of floats (all real)
    roots: list of complex numbers
    """
    pass  # your code here


# --- tests: do not modify ---
# classify_number
assert classify_number(5+0j)   == 'natural'
assert classify_number(-3+0j)  == 'integer'
assert classify_number(0+3j)   == 'purely imaginary'
assert classify_number(2+3j)   == 'complex'
assert classify_number(0+0j)   == 'natural'    # 0 is natural

# is_conjugate_pair
assert is_conjugate_pair(2+3j, 2-3j) == True
assert is_conjugate_pair(2+3j, 2+3j) == False
assert is_conjugate_pair(3+0j, 3+0j) == True    # real: conjugate of itself
assert is_conjugate_pair(1+1j, 1-2j) == False

# verify_conjugate_root_theorem
# x^2 - 2x + 5 = 0: roots 1+2i, 1-2i (conjugate pair) ✓
assert verify_conjugate_root_theorem([1, -2, 5], [1+2j, 1-2j]) == True
# x^2 - 5x + 6 = 0: roots 2, 3 (real) ✓
assert verify_conjugate_root_theorem([1, -5, 6], [2+0j, 3+0j]) == True
# Fake: 1+2i without its conjugate ✗
assert verify_conjugate_root_theorem([1, -2, 5], [1+2j, 1+2j]) == False

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

`classify_number`: check `z.imag == 0` first, then `z.real == 0`.
For natural: `z.real >= 0 and z.real == int(z.real)`.
For integer: `z.real == int(z.real)`.

`is_conjugate_pair`: `return abs(z2 - z1.real + z1.imag * 1j) < 1e-10`.

`verify_conjugate_root_theorem`: for each root, if it's not real,
check that its conjugate is also in the list.

</details>

---

**Challenge 3 — Polynomial root finder (real coefficients)**

```python
import numpy as np

def find_roots_and_classify(coeffs):
    """
    Given a list of real polynomial coefficients (highest degree first),
    find all roots using np.roots, then return a dict:
    {
        'all_roots': [complex numbers],
        'real_roots': [floats],          # roots with |Im| < 1e-8
        'complex_pairs': [(z, z_bar)],   # conjugate pairs (Im != 0)
    }
    """
    pass  # your code here

def build_polynomial_from_real_roots_and_pairs(real_roots, complex_pairs):
    """
    Given real roots and complex conjugate pairs, build the polynomial
    coefficients (using np.poly).
    
    real_roots: list of float
    complex_pairs: list of (z, z_bar) tuples — use only the first of each pair
    
    Returns numpy coefficient array (highest degree first).
    """
    pass  # your code here


# --- tests: do not modify ---
import cmath

# x^2 - 5x + 6 = (x-2)(x-3): two real roots
result = find_roots_and_classify([1, -5, 6])
assert len(result['real_roots']) == 2
assert len(result['complex_pairs']) == 0
assert all(abs(r - 2) < 1e-8 or abs(r - 3) < 1e-8 for r in result['real_roots'])

# x^2 + 1 = 0: two complex roots
result = find_roots_and_classify([1, 0, 1])
assert len(result['real_roots']) == 0
assert len(result['complex_pairs']) == 1
z, zbar = result['complex_pairs'][0]
assert abs(z - 1j) < 1e-8 or abs(z + 1j) < 1e-8

# x^3 - x^2 + x - 1 = (x-1)(x^2+1): one real, two complex
result = find_roots_and_classify([1, -1, 1, -1])
assert len(result['real_roots']) == 1
assert len(result['complex_pairs']) == 1

# build round-trip: roots → poly → roots
coeffs_orig = np.array([1.0, -5.0, 6.0])
result2 = find_roots_and_classify(coeffs_orig.tolist())
coeffs_rebuilt = build_polynomial_from_real_roots_and_pairs(
    result2['real_roots'], result2['complex_pairs'])
# Normalise and compare
cn = coeffs_orig / coeffs_orig[0]
rn = np.array(coeffs_rebuilt) / coeffs_rebuilt[0]
assert np.allclose(cn, rn, atol=1e-8)

print("✓ Challenge 3 passed!")
```

<details>
<summary>Hint</summary>

`find_roots_and_classify`: `all_roots = np.roots(coeffs).tolist()`.
Real roots: `abs(r.imag) < 1e-8`. For complex pairs, iterate through
roots with `|Im| >= 1e-8`; pair each root with its conjugate (skip
already-paired roots).
`build_polynomial_from_real_roots_and_pairs`: collect all roots
(real_roots as complex + first element of each pair + its conjugate),
then call `np.poly(all_roots)`.

</details>

---

### Extension

**4. ★** Prove that there is no ordering $<$ on $\mathbb{C}$ compatible with
addition and multiplication. That is, show that if we assume any ordering
where $0 < 1$ and the properties:
- If $a < b$ then $a + c < b + c$ for all $c$
- If $0 < a$ and $0 < b$ then $0 < ab$

then we reach a contradiction when we try to place $i$.

<details>
<summary>Proof sketch</summary>

Consider $i$. Either $i > 0$ or $i < 0$ (or $i = 0$, which is false
since $i \neq 0$).

**Case 1:** $i > 0$. Then $i \cdot i = i^2 = -1 > 0$ (by the
positive-product property). But then $-1 > 0$ and $1 > 0$ gives $0 = -1 + 1 > 0$, contradiction.

**Case 2:** $i < 0$. Then $-i > 0$. So $(-i)(-i) = i^2 = -1 > 0$, same contradiction.

Therefore no compatible ordering exists. $\square$

</details>

**5. ★** The **Gaussian integers** $\mathbb{Z}[i] = \{a + bi : a, b \in \mathbb{Z}\}$
are complex numbers with integer real and imaginary parts. Determine which
of the following are Gaussian integers and which are units (i.e. have a
multiplicative inverse that is also a Gaussian integer):
$1, i, -1, -i, 2, 1+i, 2+3i$.

*(Hint: units of $\mathbb{Z}[i]$ are exactly the Gaussian integers with norm 1.)*
