# Stage 1, Lesson 1.13 — Complex Arithmetic: Operations, Conjugate, and Modulus
**Threads:** Math · CS · Physics  
**Estimated time:** 55–70 minutes

---

## What This Lesson Is About

Introducing $i$ (Lesson 1.12) creates a new number system. This lesson
makes that system fully operational: you learn how to add, subtract,
multiply, and divide complex numbers, how to compute the modulus (the
"size" or distance from zero), and how to use the **complex conjugate**
as a tool — especially for division. Every operation follows directly
from the definition $i^2 = -1$ and the ordinary rules of algebra. No
new axioms are needed; complex arithmetic is just algebra, applied
consistently to the form $a + bi$.

By the end you can carry out any arithmetic on complex numbers by hand
and in code, and you understand why the conjugate plays a central role:
it converts a complex denominator into a real one without changing the
numerator in a trivial way.

---

## Historical Context

Rafael Bombelli's 1572 breakthrough was explicitly arithmetic: he gave
the rules for multiplying what he called "piu di meno" (plus of minus)
terms. His key insight was that $(\sqrt{-1})(\sqrt{-1}) = -1$, so that
expressions like $(2+\sqrt{-1})(2-\sqrt{-1}) = 4 - (-1) = 5$ — a real
product from two "impossible" factors. The conjugate multiplication
formula was known to Bombelli two centuries before Gauss formalised
the modulus and conjugate in their modern form. Gauss's 1831 paper
*Theoria Residuorum Biquadraticorum* gave complex numbers their
geometric interpretation and introduced the notation $a + bi$ and
$|z|$ for modulus.

---

## What You Need To Know First

- **$i^2 = -1$** and the cycle of powers (Lesson 1.12).
- **$a + bi$ form** and the real/imaginary part notation (Lesson 1.12).
- **Expanding brackets:** $(a+b)(c+d) = ac + ad + bc + bd$.
- **Difference of squares:** $(a+b)(a-b) = a^2 - b^2$.

---

## The Lesson

### Addition and Subtraction

**Rule:** add (or subtract) real parts together and imaginary parts together.

$$\boxed{(a + bi) + (c + di) = (a + c) + (b + d)i}$$

$$\boxed{(a + bi) - (c + di) = (a - c) + (b - d)i}$$

**Why:** complex numbers have the same structure as vectors in
$\mathbb{R}^2$: addition is component-wise. $a + bi$ behaves like
the vector $(a, b)$ for the purposes of addition.

**Geometric lens:** adding two complex numbers is the same as adding
their corresponding vectors tail-to-tip in the complex plane. Subtraction
points from the second number to the first.

**Hand-worked example:** compute $(3 + 5i) + (2 - 3i)$ and $(3 + 5i) - (2 - 3i)$.

$$\text{Sum: } (3+2) + (5 + (-3))i = 5 + 2i$$
$$\text{Difference: } (3-2) + (5 - (-3))i = 1 + 8i$$

**Commutativity and associativity hold:** complex addition inherits
these properties from real addition applied component-wise.

**Additive inverse:** $-(a+bi) = -a - bi$. The additive identity is $0 + 0i = 0$.

---

### Multiplication

**Rule:** expand using FOIL (or distributivity), then apply $i^2 = -1$.

$$\boxed{(a + bi)(c + di) = ac + adi + bci + bdi^2 = (ac - bd) + (ad + bc)i}$$

**Why:** complex multiplication is not component-wise (unlike addition).
The formula comes entirely from the rule $i^2 = -1$ applied after
expanding.

**Hand-worked example 1:** compute $(3 + 2i)(1 + 4i)$.

$$= 3 \cdot 1 + 3 \cdot 4i + 2i \cdot 1 + 2i \cdot 4i$$
$$= 3 + 12i + 2i + 8i^2$$
$$= 3 + 14i + 8(-1)$$
$$= (3 - 8) + 14i = -5 + 14i$$

**Hand-worked example 2:** compute $i(3 + 4i)$.

$$= 3i + 4i^2 = 3i + 4(-1) = -4 + 3i$$

**Geometric interpretation (preview):** multiplying by $i$ rotates a
complex number 90° counter-clockwise in the complex plane. The vector
$(3, 4)$ becomes $(-4, 3)$: indeed, rotating $(3, 4)$ by 90° gives
$(-4, 3)$. This will be made precise in Lesson 1.15 (polar form).

**Commutativity:** $(z_1 z_2 = z_2 z_1)$ — multiplication is commutative,
which follows from the formula since $ac-bd = ca-db$ and $ad+bc = da+cb$.

**Multiplicative identity:** $(a+bi)(1+0i) = a + bi$. The identity is $1$.

---

### The Complex Conjugate

**Definition:** the **complex conjugate** of $z = a + bi$ is:

$$\bar{z} = a - bi$$

Conjugation reflects the number across the real axis: the real part is
unchanged, the imaginary part changes sign.

**Key identities involving the conjugate:**

$$z + \bar{z} = (a+bi) + (a-bi) = 2a = 2\,\text{Re}(z)$$
$$z - \bar{z} = (a+bi) - (a-bi) = 2bi = 2i\,\text{Im}(z)$$
$$z\bar{z} = (a+bi)(a-bi) = a^2 - (bi)^2 = a^2 - b^2 i^2 = a^2 + b^2$$

The last identity is the crucial one: $z\bar{z} = a^2 + b^2$, a **non-negative real number**.
Multiplying a complex number by its conjugate eliminates the imaginary part.

**Why this is the difference of squares:** $(a+bi)(a-bi) = a^2 - (bi)^2 = a^2 - b^2(-1) = a^2 + b^2$.

**Properties of conjugation:**
- $\overline{z_1 + z_2} = \bar{z}_1 + \bar{z}_2$
- $\overline{z_1 z_2} = \bar{z}_1 \bar{z}_2$
- $\bar{\bar{z}} = z$ (conjugation is its own inverse)
- $z \in \mathbb{R} \iff \bar{z} = z$ (real numbers equal their conjugates)

---

### The Modulus

**Definition:** the **modulus** (absolute value, magnitude) of $z = a + bi$ is:

$$\boxed{|z| = \sqrt{a^2 + b^2}}$$

**Geometric lens:** $|z|$ is the Euclidean distance from the origin to the
point $(a, b)$ in the complex plane. This is exactly the Pythagorean theorem.

**Connection to conjugate:**

$$|z|^2 = z\bar{z} = a^2 + b^2$$

$$|z| = \sqrt{z\bar{z}}$$

This is a formula that computes the modulus through arithmetic, without
reference to geometry.

**Key values:**
- $|3 + 4i| = \sqrt{9 + 16} = \sqrt{25} = 5$
- $|1 + i| = \sqrt{2}$
- $|r| = |r|$ for real $r$ — the modulus of a real number is its absolute value
- $|i| = 1$ — the imaginary unit has modulus 1

**Properties of modulus:**
- $|z| \geq 0$, with $|z| = 0 \iff z = 0$
- $|z_1 z_2| = |z_1||z_2|$ (**modulus is multiplicative**)
- $|z_1 + z_2| \leq |z_1| + |z_2|$ (**triangle inequality**)
- $|\bar{z}| = |z|$

**Proving multiplicativity:** $|z_1 z_2|^2 = (z_1 z_2)\overline{(z_1 z_2)}
= z_1 z_2 \bar{z}_1 \bar{z}_2 = (z_1 \bar{z}_1)(z_2 \bar{z}_2)
= |z_1|^2 |z_2|^2$. Taking square roots: $|z_1 z_2| = |z_1||z_2|$.

**Hand-worked example:** $|3 + 4i|$, then $|(3+4i)(1+2i)|$.

$|3+4i| = \sqrt{9+16} = 5$.
$|1+2i| = \sqrt{1+4} = \sqrt{5}$.
$|(3+4i)(1+2i)| = |3+4i| \cdot |1+2i| = 5\sqrt{5}$.

Check: $(3+4i)(1+2i) = 3 + 6i + 4i + 8i^2 = 3 + 10i - 8 = -5 + 10i$.
$|-5+10i| = \sqrt{25+100} = \sqrt{125} = 5\sqrt{5}$. ✓

```python
import cmath
import math
import numpy as np
import matplotlib.pyplot as plt

# ---- basic operations ----
z1 = 3 + 2j
z2 = 1 + 4j

print("=== Complex Arithmetic ===")
print(f"z1 = {z1}")
print(f"z2 = {z2}")
print()
print(f"z1 + z2 = {z1 + z2}")
print(f"z1 - z2 = {z1 - z2}")
print(f"z1 * z2 = {z1 * z2}")   # Python complex multiplication is built-in
print()

# Manual multiplication to verify
a, b = z1.real, z1.imag   # 3, 2
c, d = z2.real, z2.imag   # 1, 4
manual = complex(a*c - b*d, a*d + b*c)
print(f"Manual (ac-bd) + (ad+bc)i = {manual}  matches: {manual == z1*z2}")
print()

# ---- conjugate and modulus ----
z = 3 + 4j
z_conj = z.conjugate()   # Python's built-in conjugate method

print("=== Conjugate and Modulus ===")
print(f"z        = {z}")
print(f"conj(z)  = {z_conj}")
print(f"z + zbar = {z + z_conj}  = 2*Re(z) = {2*z.real}")
print(f"z - zbar = {z - z_conj}  = 2i*Im(z) = {2j*z.imag}")
print(f"z * zbar = {z * z_conj}  = |z|^2 = {abs(z)**2}")
print(f"|z|      = {abs(z)}")    # Python's abs() works on complex numbers
print(f"a^2+b^2  = {z.real**2 + z.imag**2}")
print()

# ---- multiplicativity of modulus ----
z1, z2 = 3+4j, 1+2j
product = z1 * z2
print(f"Multiplicativity: |z1*z2| = |z1|*|z2|?")
print(f"  |z1|          = {abs(z1):.6f}")
print(f"  |z2|          = {abs(z2):.6f}")
print(f"  |z1|*|z2|     = {abs(z1)*abs(z2):.6f}")
print(f"  |z1*z2|       = {abs(z1*z2):.6f}   match: {abs(abs(z1*z2) - abs(z1)*abs(z2)) < 1e-12}")
print()

# ---- visualise: addition as vector sum ----
z1, z2 = 2 + 1j, 1 + 3j
z_sum = z1 + z2

fig, ax = plt.subplots(figsize=(7, 7))
origin = np.array([0, 0])

# Draw z1, z2, z1+z2 as arrows from origin
for z, color, label in [(z1, '#2980b9', 'z₁'), (z2, '#e74c3c', 'z₂'), (z_sum, '#27ae60', 'z₁+z₂')]:
    ax.annotate('', xy=(z.real, z.imag), xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    ax.annotate(f'{label}={z}', xy=(z.real, z.imag),
                xytext=(z.real+0.1, z.imag+0.1), color=color, fontsize=10)

# Show parallelogram: z2 added to tip of z1
ax.annotate('', xy=(z_sum.real, z_sum.imag), xytext=(z1.real, z1.imag),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=1.5, linestyle='dashed'))
ax.annotate('', xy=(z_sum.real, z_sum.imag), xytext=(z2.real, z2.imag),
            arrowprops=dict(arrowstyle='->', color='#2980b9', lw=1.5, linestyle='dashed'))

ax.set_xlim(-0.5, 4.5); ax.set_ylim(-0.5, 5)
ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_xlabel('Real axis'); ax.set_ylabel('Imaginary axis')
ax.set_title('Complex addition = vector addition (parallelogram law)', fontsize=10)
ax.grid(True, alpha=0.3); ax.set_aspect('equal')
plt.tight_layout(); plt.show()
```

**Walkthrough:** `z.conjugate()` is Python's built-in method on complex
objects — it returns $a - bi$ given $a + bi$. `abs(z)` on a complex
number computes $\sqrt{a^2 + b^2}$ — the same function that gives
absolute value on reals generalises automatically to modulus. The plot
uses `ax.annotate('', xy=tip, xytext=tail, arrowprops=...)` to draw
an arrow from `xytext` to `xy` — the empty string `''` as the first
argument means no label, just the arrow.

---

### Division

**Problem:** how do we compute $(a+bi)/(c+di)$?

A complex number in the denominator is a problem — we cannot simplify
$\frac{a+bi}{c+di}$ directly into the form $p + qi$. The solution:
multiply numerator and denominator by the **conjugate of the denominator**.

$$\frac{a+bi}{c+di} = \frac{(a+bi)(c-di)}{(c+di)(c-di)} = \frac{(ac+bd) + (bc-ad)i}{c^2+d^2}$$

The denominator $(c+di)(c-di) = c^2+d^2$ is now a real number, so:

$$\boxed{\frac{a+bi}{c+di} = \frac{ac+bd}{c^2+d^2} + \frac{bc-ad}{c^2+d^2}\,i}$$

**Why this works:** the conjugate of the denominator turns the product
$z\bar{z} = |z|^2$ into a real number via the difference-of-squares identity.

**Condition for division:** $c + di \neq 0$, i.e., $c^2 + d^2 > 0$
(not both $c$ and $d$ are zero). When $c + di \neq 0$, every complex
number has a unique multiplicative inverse:

$$\frac{1}{c+di} = \frac{c-di}{c^2+d^2}$$

So $\mathbb{C}$ is a **field**: every nonzero element has an inverse,
and all four operations are well-defined.

**Hand-worked example 1:** compute $\frac{3+2i}{1+4i}$.

$$\frac{3+2i}{1+4i} \cdot \frac{1-4i}{1-4i}
= \frac{(3+2i)(1-4i)}{1^2+4^2}
= \frac{3-12i+2i-8i^2}{17}
= \frac{3-10i+8}{17}
= \frac{11-10i}{17}
= \frac{11}{17} - \frac{10}{17}i$$

**Verification:** $\left(\frac{11}{17} - \frac{10}{17}i\right)(1+4i)
= \frac{11+44i-10i-40i^2}{17} = \frac{11+34i+40}{17} = \frac{51+34i}{17} = 3+2i$ ✓

**Hand-worked example 2:** compute $\frac{1}{i}$.

$$\frac{1}{i} = \frac{1 \cdot (-i)}{i \cdot (-i)} = \frac{-i}{-i^2} = \frac{-i}{1} = -i$$

This confirms $i^{-1} = -i$ from Lesson 1.12.

**Hand-worked example 3:** compute $\frac{5}{2+i}$.

$$\frac{5}{2+i} \cdot \frac{2-i}{2-i} = \frac{5(2-i)}{4+1} = \frac{10-5i}{5} = 2 - i$$

```python
import cmath
import math
import numpy as np
import matplotlib.pyplot as plt

def complex_divide(z1, z2):
    """
    Divide z1 by z2 using the conjugate formula.
    Returns (z1/z2) as a complex number.
    Raises ZeroDivisionError if z2 == 0.
    """
    if z2 == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    a, b = z1.real, z1.imag
    c, d = z2.real, z2.imag
    denom = c**2 + d**2
    real_part = (a*c + b*d) / denom
    imag_part = (b*c - a*d) / denom
    return complex(real_part, imag_part)

# Test cases for division
cases = [
    (3+2j,  1+4j,  "hand-worked example 1"),
    (1+0j,  0+1j,  "1/i = -i"),
    (5+0j,  2+1j,  "5/(2+i) = 2-i"),
    (2+3j,  2-3j,  "(2+3i)/(2-3i)"),
    (0+1j,  1+1j,  "i/(1+i)"),
]
print("Division verification:")
print(f"{'Expression':<30} | {'Result':>20} | {'Python z1/z2':>20} | {'Match'}")
print("-" * 80)
for z1, z2, label in cases:
    result   = complex_divide(z1, z2)
    py_result = z1 / z2    # Python computes complex division natively
    match = abs(result - py_result) < 1e-12
    print(f"{label:<30} | {str(result):>20} | {str(py_result):>20} | {'✓' if match else '✗'}")

print()

# Division as: multiply by reciprocal
# 1/(c+di) = (c-di)/(c^2+d^2)
z = 2 + 3j
z_inv = z.conjugate() / (z.real**2 + z.imag**2)
print(f"Reciprocal: 1/(2+3i) = {z_inv}")
print(f"  Check: (2+3i) * {z_inv} = {z * z_inv}")  # should be 1+0i
print()

# Visualise the unit circle: |z| = 1
# Numbers on the unit circle: |z|=1, their reciprocals = conjugates
theta = np.linspace(0, 2*np.pi, 200)
unit_circle = np.cos(theta) + 1j*np.sin(theta)

# Pick a few specific unit-circle points
special = [1+0j, 0+1j, -1+0j, 0-1j,
           (1+1j)/math.sqrt(2), (1-1j)/math.sqrt(2)]

fig, axes = plt.subplots(1, 2, figsize=(13, 6))

# Left: unit circle
ax = axes[0]
ax.plot(np.cos(theta), np.sin(theta), color='#2980b9', lw=2)
for z in special:
    z_inv = 1/z
    ax.scatter([z.real], [z.imag], s=80, color='#e74c3c', zorder=5)
    ax.scatter([z_inv.real], [z_inv.imag], s=80, color='#27ae60', marker='^', zorder=5)
    ax.plot([z.real, z_inv.real], [z.imag, z_inv.imag], color='#888', lw=1, ls='--')

ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('Unit circle: if |z|=1, then 1/z = z̄\n(red=z, green=1/z)', fontsize=10)
ax.grid(True, alpha=0.3)

# Right: modulus under multiplication
# |z1*z2| = |z1|*|z2|: show on a grid
z1_vals = [1+1j, 2+1j, 1+2j, 3+0j, 0+2j]
z2 = 1 + 1j

ax = axes[1]
for z1 in z1_vals:
    z_prod = z1 * z2
    ax.plot([0, z1.real], [0, z1.imag], color='#2980b9', lw=2)
    ax.plot([0, z_prod.real], [0, z_prod.imag], color='#e74c3c', lw=2, ls='--')
    ax.annotate(f'{z1}', xy=(z1.real, z1.imag), xytext=(z1.real+0.05, z1.imag+0.05), fontsize=8, color='#2980b9')
    ax.annotate(f'{z_prod}', xy=(z_prod.real, z_prod.imag), xytext=(z_prod.real+0.05, z_prod.imag+0.05), fontsize=8, color='#e74c3c')

ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title(f'Multiplying by z₂={z2}: scales length by |z₂|=√2, rotates by 45°\n'
             f'Blue=original, red dashed=product', fontsize=9)
ax.grid(True, alpha=0.3)

plt.suptitle('Complex division and modulus visualised', fontsize=11)
plt.tight_layout(); plt.show()
```

**Walkthrough:** Python computes `z1 / z2` for complex numbers natively
using the same conjugate formula we derived — `complex_divide` shows
the manual computation and confirms it matches. `z.conjugate()` is the
built-in conjugate. On the unit circle, if $|z|=1$ then
$z\bar{z} = 1$, so $1/z = \bar{z}$ — the reciprocal is the conjugate.
This is why `1/z == z.conjugate()` for all unit-circle points.

---

### Summary of Operations

For $z_1 = a+bi$ and $z_2 = c+di$:

| Operation | Result | Formula |
|-----------|--------|---------|
| Addition | $z_1 + z_2$ | $(a+c) + (b+d)i$ |
| Subtraction | $z_1 - z_2$ | $(a-c) + (b-d)i$ |
| Multiplication | $z_1 z_2$ | $(ac-bd) + (ad+bc)i$ |
| Conjugate | $\bar{z}_1$ | $a - bi$ |
| Modulus | $|z_1|$ | $\sqrt{a^2+b^2}$ |
| Division | $z_1/z_2$ | $\dfrac{(ac+bd)+(bc-ad)i}{c^2+d^2}$ |
| Inverse | $1/z_2$ | $\dfrac{c-di}{c^2+d^2}$ |

**$\mathbb{C}$ is a field:** closed under all four operations; every
nonzero element has a multiplicative inverse; addition and multiplication
satisfy commutative, associative, distributive laws.

---

## Connect the Pieces

**What this lesson built on:** definition of $i$ and the $a+bi$ form
(Lesson 1.12). Difference of squares $(a+b)(a-b) = a^2-b^2$ is the
algebraic engine behind conjugate division.

**What this enables:** Lesson 1.14 (the complex plane — now that we
can compute with $z$, we need its geometry). Lesson 1.15 (polar form
and modulus as length). Lesson 1.16 (Euler's formula — where $e^{i\theta}$
will need complex multiplication to verify). Stage 7 signal processing —
impedance arithmetic, phasor sums and products.

**Engineering application:** AC circuits replace real resistances with
complex **impedances**: $Z_R = R$, $Z_L = j\omega L$, $Z_C = 1/(j\omega C)$.
Series impedances add; parallel impedances divide (by the formula
$Z_{12} = Z_1 Z_2/(Z_1+Z_2)$). Computing these requires exactly the
arithmetic of this lesson.

---

## Summary

$$z + \bar{z} = 2\,\text{Re}(z); \qquad z - \bar{z} = 2i\,\text{Im}(z)$$
$$z\bar{z} = |z|^2 = a^2+b^2 \geq 0$$
$$|z_1 z_2| = |z_1||z_2|; \qquad |z_1 + z_2| \leq |z_1|+|z_2|$$
$$\frac{a+bi}{c+di} = \frac{(ac+bd)+(bc-ad)i}{c^2+d^2} \qquad (c+di \neq 0)$$

**New Python:**
- `z.conjugate()` — complex conjugate
- `abs(z)` — modulus (works for complex)
- `z1 / z2` — complex division (built-in)
- `z.real`, `z.imag` — components

---

## Problems

### Math

**1.** Let $z_1 = 2 + 3i$ and $z_2 = 1 - 2i$. Compute:

(a) $z_1 + z_2$ (b) $z_1 - z_2$ (c) $z_1 z_2$ (d) $z_1/z_2$ (e) $|z_1|$ (f) $|z_1 z_2|$

<details>
<summary>Answers</summary>

(a) $(2+1)+(3-2)i = 3+i$.
(b) $(2-1)+(3+2)i = 1+5i$.
(c) $(2\cdot1-3\cdot(-2))+(2\cdot(-2)+3\cdot1)i = (2+6)+(-4+3)i = 8-i$.
(d) $\frac{(2+3i)(1+2i)}{1+4} = \frac{(2-6)+(4+3)i}{5} = \frac{-4+7i}{5} = -\frac{4}{5}+\frac{7}{5}i$.
(e) $\sqrt{4+9} = \sqrt{13}$.
(f) $|z_1 z_2| = |z_1||z_2| = \sqrt{13}\cdot\sqrt{5} = \sqrt{65}$. Check: $|8-i|=\sqrt{64+1}=\sqrt{65}$. ✓

</details>

---

**2.** Find the real and imaginary parts of each:
(a) $(1+i)^3$ (b) $\frac{1+i}{1-i}$ (c) $\frac{2+i}{(1+i)^2}$

<details>
<summary>Answers</summary>

(a) $(1+i)^2 = 2i$; $(2i)(1+i) = 2i+2i^2 = -2+2i$.

(b) $\frac{(1+i)^2}{|1-i|^2} = \frac{2i}{2} = i$. So $\text{Re}=0$, $\text{Im}=1$.

(c) $(1+i)^2 = 2i$; $\frac{2+i}{2i} \cdot \frac{-2i}{-2i} = \frac{(2+i)(-2i)}{4}
= \frac{-4i-2i^2}{4} = \frac{2-4i}{4} = \frac{1}{2} - i$.

</details>

---

**3.** Prove each property:

(a) $\overline{z_1 + z_2} = \bar{z}_1 + \bar{z}_2$

(b) $\overline{z_1 z_2} = \bar{z}_1 \bar{z}_2$

(c) $|z_1 + z_2|^2 = |z_1|^2 + 2\,\text{Re}(z_1\bar{z}_2) + |z_2|^2$

<details>
<summary>Proofs</summary>

(a) Let $z_1=a+bi$, $z_2=c+di$.
$\overline{(a+c)+(b+d)i} = (a+c)-(b+d)i = (a-bi)+(c-di) = \bar{z}_1+\bar{z}_2$. $\square$

(b) $z_1z_2 = (ac-bd)+(ad+bc)i$; $\overline{z_1z_2} = (ac-bd)-(ad+bc)i$.
$\bar{z}_1\bar{z}_2 = (a-bi)(c-di) = (ac-bd)+(-ad-bc)i = (ac-bd)-(ad+bc)i$. ✓ $\square$

(c) $|z_1+z_2|^2 = (z_1+z_2)\overline{(z_1+z_2)} = (z_1+z_2)(\bar{z}_1+\bar{z}_2)
= z_1\bar{z}_1 + z_1\bar{z}_2 + z_2\bar{z}_1 + z_2\bar{z}_2
= |z_1|^2 + z_1\bar{z}_2 + \overline{z_1\bar{z}_2} + |z_2|^2
= |z_1|^2 + 2\,\text{Re}(z_1\bar{z}_2) + |z_2|^2$.
(using $w + \bar{w} = 2\,\text{Re}(w)$ with $w = z_1\bar{z}_2$.) $\square$

</details>

---

**4.** (Proof) Show that for any nonzero complex number $z = a+bi$:

$$z^{-1} = \frac{\bar{z}}{|z|^2}$$

and verify that $z \cdot z^{-1} = 1$.

<details>
<summary>Proof</summary>

$z \cdot \frac{\bar{z}}{|z|^2} = \frac{z\bar{z}}{|z|^2} = \frac{|z|^2}{|z|^2} = 1$ (since $z\bar{z} = |z|^2$). $\square$

This shows $z^{-1} = \bar{z}/|z|^2 = (a-bi)/(a^2+b^2)$.

</details>

---

### Code Challenges

**Challenge 1 — Arithmetic operations from scratch**

```python
def c_add(z1, z2):
    """Return z1 + z2. Both z1, z2 are (real, imag) tuples. Return a tuple."""
    pass  # your code here

def c_sub(z1, z2):
    """Return z1 - z2 as (real, imag) tuple."""
    pass

def c_mul(z1, z2):
    """Return z1 * z2 using (ac-bd, ad+bc). Return (real, imag) tuple."""
    pass

def c_conj(z):
    """Return conjugate of z = (a, b) as tuple (a, -b)."""
    pass

def c_mod(z):
    """Return |z| = sqrt(a^2 + b^2) as a float."""
    pass

def c_div(z1, z2):
    """
    Return z1 / z2 using conjugate formula.
    Raise ZeroDivisionError if z2 == (0, 0).
    Return (real, imag) tuple.
    """
    pass


# --- tests: do not modify ---
import math

# Addition
assert c_add((3,2), (1,4)) == (4, 6)
assert c_add((0,0), (2,3)) == (2, 3)

# Subtraction
assert c_sub((3,2), (1,4)) == (2, -2)
assert c_sub((2,3), (2,3)) == (0, 0)

# Multiplication
assert c_mul((3,2), (1,4)) == (-5, 14)   # (3+2i)(1+4i) = -5+14i
assert c_mul((0,1), (0,1)) == (-1, 0)    # i*i = -1

# Conjugate
assert c_conj((3, 4))  == (3, -4)
assert c_conj((5, 0))  == (5, 0)
assert c_conj((0, -2)) == (0, 2)

# Modulus
assert abs(c_mod((3, 4)) - 5.0) < 1e-10
assert abs(c_mod((1, 0)) - 1.0) < 1e-10
assert abs(c_mod((0, 0)) - 0.0) < 1e-10

# Division
r, i = c_div((3,2), (1,4))
assert abs(r - 11/17) < 1e-10
assert abs(i - (-10/17)) < 1e-10

r, i = c_div((1,0), (0,1))
assert abs(r - 0.0) < 1e-10
assert abs(i - (-1.0)) < 1e-10   # 1/i = -i

# ZeroDivisionError
try:
    c_div((1,2), (0,0))
    assert False
except ZeroDivisionError:
    pass

# Verify z * (1/z) = 1 for several z
for z in [(2,3), (1,1), (-3,4), (0,5)]:
    inv = c_div((1,0), z)
    prod = c_mul(z, inv)
    assert abs(prod[0] - 1.0) < 1e-10 and abs(prod[1] - 0.0) < 1e-10

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`c_add`: `return (z1[0]+z2[0], z1[1]+z2[1])`.
`c_mul`: `a,b=z1; c,d=z2; return (a*c-b*d, a*d+b*c)`.
`c_div`: check `z2==(0,0)`. `denom = z2[0]**2+z2[1]**2`. Use conjugate.

</details>

---

**Challenge 2 — Modulus properties verifier**

```python
import random
import math

def check_triangle_inequality(N=5000, seed=42):
    """
    Verify |z1 + z2| <= |z1| + |z2| for N random complex pairs.
    Return the maximum of (|z1+z2| - |z1| - |z2|), which should be <= 0.
    """
    pass  # your code here

def check_multiplicativity(N=5000, seed=42):
    """
    Verify |z1 * z2| == |z1| * |z2| for N random complex pairs.
    Return the maximum absolute error over all pairs.
    """
    pass  # your code here

def check_conjugate_modulus(N=5000, seed=42):
    """
    Verify |conj(z)| == |z| for N random complex numbers.
    Return max error.
    """
    pass  # your code here


# --- tests: do not modify ---
max_tri = check_triangle_inequality()
assert max_tri <= 1e-10, f"Triangle inequality violated: excess {max_tri}"

max_mult = check_multiplicativity()
assert max_mult < 1e-10, f"Multiplicativity violated: error {max_mult}"

max_conj = check_conjugate_modulus()
assert max_conj < 1e-10, f"Conjugate modulus violated: error {max_conj}"

print("✓ Challenge 2 passed!")
print(f"  Triangle inequality: max excess = {max_tri:.2e}  (≤ 0 → always holds)")
print(f"  Multiplicativity:   max error  = {max_mult:.2e}")
print(f"  Conjugate modulus:  max error  = {max_conj:.2e}")
```

<details>
<summary>Hint</summary>

Use `random.seed(seed)` for reproducibility. Generate `a,b = random.uniform(-10,10)` twice for each pair. Use `abs(complex(a,b))` for modulus.
`check_triangle_inequality`: return `max(abs(z1+z2) - (abs(z1)+abs(z2)) for ...)`.
`check_multiplicativity`: return `max(abs(abs(z1*z2) - abs(z1)*abs(z2)) for ...)`.

</details>

---

**Challenge 3 — Complex impedance calculator**

```python
import cmath
import math

def series_impedance(*impedances):
    """Z_total = Z1 + Z2 + ... (complex addition)"""
    pass

def parallel_impedance(*impedances):
    """
    1/Z_total = 1/Z1 + 1/Z2 + ...
    Raise ValueError if any impedance is 0.
    """
    pass

def resistor(R):
    """Return impedance of resistor: Z = R (real)."""
    return complex(R, 0)

def inductor(L, omega):
    """Return impedance of inductor: Z = j*omega*L."""
    return complex(0, omega * L)

def capacitor(C, omega):
    """
    Return impedance of capacitor: Z = 1/(j*omega*C).
    Raise ValueError if omega == 0 or C == 0.
    """
    pass

def voltage_divider(Z1, Z2, V_in):
    """
    Return V_out = V_in * Z2 / (Z1 + Z2).
    (Z1 and Z2 in series; V_out measured across Z2.)
    """
    pass


# --- tests: do not modify ---
omega = 2 * math.pi * 1000   # 1 kHz

# Resistors
R1, R2 = resistor(100), resistor(200)
Z_series = series_impedance(R1, R2)
assert abs(Z_series - 300+0j) < 1e-8
Z_parallel = parallel_impedance(R1, R2)
assert abs(Z_parallel - complex(200/3, 0)) < 1e-8

# Inductor
L = inductor(1e-3, omega)   # 1 mH at 1 kHz
assert abs(L.real) < 1e-10
assert abs(L.imag - omega*1e-3) < 1e-8

# Capacitor
C = capacitor(1e-6, omega)   # 1 µF at 1 kHz
assert abs(C.real) < 1e-10
assert abs(C.imag + 1/(omega*1e-6)) < 1e-6   # imag should be negative

# Series RLC
R   = resistor(100)
L_z = inductor(1e-3, omega)
C_z = capacitor(1e-6, omega)
Z_RLC = series_impedance(R, L_z, C_z)
assert abs(Z_RLC.real - 100) < 1e-6

# Voltage divider (resistive)
Vout = voltage_divider(resistor(100), resistor(100), 10+0j)
assert abs(Vout - 5+0j) < 1e-10

# ValueError for omega=0 on capacitor
try:
    capacitor(1e-6, 0)
    assert False
except ValueError:
    pass

print("✓ Challenge 3 passed!")
print(f"\nRC voltage divider at 1 kHz (R=100Ω, C=1µF):")
R   = resistor(100)
C_z = capacitor(1e-6, omega)
Vout_rc = voltage_divider(R, C_z, complex(1, 0))   # 1V input
print(f"  Output magnitude: {abs(Vout_rc):.4f} V")
print(f"  Output phase:     {math.degrees(cmath.phase(Vout_rc)):.2f}°")
print(f"  (High frequencies: capacitor impedance → 0, divides signal)")
```

<details>
<summary>Hint</summary>

`series_impedance`: `return sum(impedances, start=0j)`.
`parallel_impedance`: `return 1 / sum(1/z for z in impedances)`.
`capacitor`: check `omega == 0 or C == 0`; `return complex(0, -1/(omega*C))`.
`voltage_divider`: `return V_in * Z2 / (Z1 + Z2)`.

</details>

---

### Extension

**4. ★** Prove the **triangle inequality** $|z_1 + z_2| \leq |z_1| + |z_2|$ using the
identity from Problem 3(c): $|z_1+z_2|^2 = |z_1|^2 + 2\,\text{Re}(z_1\bar{z}_2) + |z_2|^2$.

*(Hint: show $\text{Re}(z_1\bar{z}_2) \leq |z_1\bar{z}_2| = |z_1||z_2|$, then compare
the right-hand side with $(|z_1|+|z_2|)^2$.)*

<details>
<summary>Proof</summary>

$\text{Re}(w) \leq |w|$ for any complex $w$ (since $|w| = \sqrt{(\text{Re}\,w)^2 + (\text{Im}\,w)^2} \geq |\text{Re}\,w|$).
So $\text{Re}(z_1\bar{z}_2) \leq |z_1\bar{z}_2| = |z_1||\bar{z}_2| = |z_1||z_2|$.
Then:
$|z_1+z_2|^2 = |z_1|^2 + 2\,\text{Re}(z_1\bar{z}_2) + |z_2|^2
\leq |z_1|^2 + 2|z_1||z_2| + |z_2|^2 = (|z_1|+|z_2|)^2$.
Taking square roots (both sides non-negative): $|z_1+z_2| \leq |z_1|+|z_2|$. $\square$

</details>

**5. ★** The **Cauchy-Schwarz inequality for complex numbers** states that for
$z_1, \ldots, z_n, w_1, \ldots, w_n \in \mathbb{C}$:

$$\left|\sum_{k=1}^n z_k \bar{w}_k\right|^2 \leq \left(\sum_{k=1}^n |z_k|^2\right)\left(\sum_{k=1}^n |w_k|^2\right)$$

Verify this numerically for $n=4$ with random complex values (repeat the
statistical check from Challenge 2 but for this inequality).
