# Stage 1, Lesson 1.12 — Complex Numbers
**Threads:** Math · Physics · CS  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

Every polynomial with real coefficients has roots in $\mathbb{R}$ —
unless it does not. $x^2 + 1 = 0$ has no real solution because no
real number squares to $-1$. For centuries mathematicians called such
roots "imaginary" and considered them meaningless. Then Gauss, Hamilton,
and others showed that extending $\mathbb{R}$ by including a number $i$
satisfying $i^2 = -1$ produces a complete and consistent number system
— the complex numbers $\mathbb{C}$ — in which every polynomial has a
root (the Fundamental Theorem of Algebra, Lesson 1.4). Complex numbers
are not imaginary in any pejorative sense; they are as real as any
other mathematical object, and they are indispensable in physics
(quantum mechanics uses them unavoidably), engineering (AC circuits,
signal processing, control theory), and computer science (FFT, digital
filters). By the end of this lesson you will perform all complex
arithmetic, visualise complex numbers in the complex plane, understand
the polar form, and see the first glimpse of Euler's formula — the most
beautiful equation in mathematics.

---

## Historical Context

The square root of $-1$ appeared in 1545 when Cardano, solving cubic
equations, encountered expressions like $\sqrt{-15}$ that cancelled out
in the final answer but were necessary steps in between. Bombelli (1572)
gave rules for computing with them. Descartes named them "imaginary" in
1637 — disparagingly. Euler introduced the notation $i$ in 1777. But it
was Gauss who placed complex numbers on firm geometric ground (1797),
interpreting them as points in a plane. Hamilton (1843) gave a rigorous
algebraic foundation, constructing $\mathbb{C}$ as pairs of reals with
specific multiplication rules. The word "imaginary" is historical baggage
— there is nothing more or less imaginary about $i$ than about $-1$ or
$\sqrt{2}$. All are mathematical constructs invented to solve equations
that could not be solved without them.

---

## What You Need To Know First

- **Real number system** $\mathbb{R}$ — Lesson 0.1.
- **Polynomial roots and the FTA** — Lesson 1.4. Complex numbers are
  precisely what the FTA needs to guarantee $n$ roots.
- **The Cartesian plane** — Lesson 0.4. The complex plane is the same
  coordinate system, reinterpreted.
- **Trigonometry (basic)** — not yet formally taught, but $\cos$ and
  $\sin$ appear in the polar form at the end. Their definitions are
  given where needed; full treatment is Stage 2.

---

## The Lesson

### Defining $i$ and the Complex Numbers

**Definition:** The **imaginary unit** $i$ is defined by:

$$i^2 = -1 \qquad \text{(equivalently, } i = \sqrt{-1}\text{)}$$

**Definition:** A **complex number** is any expression of the form

$$z = a + bi, \qquad a, b \in \mathbb{R}$$

where $a$ is the **real part** $\mathrm{Re}(z) = a$ and $b$ is the
**imaginary part** $\mathrm{Im}(z) = b$.

The set of all complex numbers is $\mathbb{C} = \{a + bi : a, b \in \mathbb{R}\}$.

**Special cases:**
- $b = 0$: $z = a$ is a real number. So $\mathbb{R} \subset \mathbb{C}$.
- $a = 0$: $z = bi$ is **purely imaginary**.
- $a = b = 0$: $z = 0$.

**Powers of $i$** — a repeating cycle of period 4:

$$i^0 = 1, \quad i^1 = i, \quad i^2 = -1, \quad i^3 = -i, \quad i^4 = 1, \quad \ldots$$

In general, $i^n$ depends only on $n \bmod 4$:
- $n \equiv 0$: $i^n = 1$
- $n \equiv 1$: $i^n = i$
- $n \equiv 2$: $i^n = -1$
- $n \equiv 3$: $i^n = -i$

**Two complex numbers are equal** iff both real and imaginary parts are equal:

$$a + bi = c + di \quad \Longleftrightarrow \quad a = c \text{ and } b = d$$

This follows because $\{1, i\}$ forms a basis for $\mathbb{C}$ over $\mathbb{R}$
— every complex number has a unique representation.

---

### Arithmetic

**Addition/Subtraction:** add real and imaginary parts separately.

$$(a+bi) \pm (c+di) = (a \pm c) + (b \pm d)i$$

**Multiplication:** expand using $i^2 = -1$.

$$(a+bi)(c+di) = ac + adi + bci + bdi^2 = (ac - bd) + (ad + bc)i$$

**Hand-worked example:** $(3+4i)(1-2i)$

$$= 3(1) + 3(-2i) + 4i(1) + 4i(-2i) = 3 - 6i + 4i - 8i^2 = 3 - 6i + 4i + 8 = 11 - 2i$$

**The complex conjugate:** $\bar{z} = a - bi$ (flip the sign of the imaginary part).

Key property: $z \cdot \bar{z} = (a+bi)(a-bi) = a^2 + b^2 \in \mathbb{R}$.

**Division:** multiply numerator and denominator by the conjugate of the denominator.

$$\frac{a+bi}{c+di} = \frac{(a+bi)(c-di)}{(c+di)(c-di)} = \frac{(ac+bd) + (bc-ad)i}{c^2+d^2}$$

**Hand-worked example:** $\dfrac{3+4i}{1-2i}$

$$= \frac{(3+4i)(1+2i)}{(1-2i)(1+2i)} = \frac{3+6i+4i+8i^2}{1+4} = \frac{3+10i-8}{5} = \frac{-5+10i}{5} = -1+2i$$

```python
import cmath   # cmath: Python's complex math module (like math but for complex numbers)

z1 = 3 + 4j    # Python uses j for the imaginary unit (engineering convention)
z2 = 1 - 2j    # j is identical to the mathematical i

# Python supports all complex arithmetic with standard operators
print("Complex arithmetic:\n")
print(f"  z1 = {z1}")
print(f"  z2 = {z2}")
print(f"  z1 + z2 = {z1 + z2}")
print(f"  z1 - z2 = {z1 - z2}")
print(f"  z1 * z2 = {z1 * z2}")   # should be 11 - 2j
print(f"  z1 / z2 = {z1 / z2}")   # should be -1 + 2j

print()
# Accessing real and imaginary parts
print(f"  z1.real = {z1.real}")    # .real: the real part
print(f"  z1.imag = {z1.imag}")    # .imag: the imaginary part (as a float, not z.imag*j)
print(f"  z1.conjugate() = {z1.conjugate()}")   # .conjugate(): returns the conjugate
print(f"  z1 * z1.conjugate() = {z1 * z1.conjugate()}")   # should be real: 3^2+4^2 = 25

print()
# Powers of i
print("Powers of j (= i):")
for n in range(8):
    val = 1j**n   # 1j is Python's i; 1j**n raises it to the nth power
    print(f"  i^{n} = {val.real:+.0f} {'+' if val.imag >= 0 else ''}{val.imag:.0f}i")
```

**Walkthrough:** In Python, the imaginary unit is written `j` (the
engineering convention) rather than `i` (the mathematics convention).
`3 + 4j` creates the complex number $3 + 4i$. All arithmetic operators
work directly on complex numbers — Python handles the rules of complex
arithmetic internally. `.real` and `.imag` return the components as
plain floats (not as complex numbers). `.conjugate()` returns the
conjugate as a new complex number. `cmath` is the complex-number analogue
of `math` — imported here for later use; `math` functions like `math.sqrt`
only work on real numbers and raise errors for negative inputs.

---

### The Complex Plane

A complex number $z = a + bi$ can be plotted as the point $(a, b)$
in the **complex plane** (also called the **Argand plane**):

- The horizontal axis is the **real axis** (real parts)
- The vertical axis is the **imaginary axis** (imaginary parts)

This gives a geometric interpretation of every complex operation:
- Addition is vector addition
- Conjugation is reflection across the real axis
- Multiplication is rotation + scaling (shown later)

```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(8, 8))

# Plot several complex numbers as points and as vectors from origin
numbers = {
    '$z_1 = 3+4i$':    (3+4j,  '#2980b9'),
    '$z_2 = 1-2i$':    (1-2j,  '#e74c3c'),
    '$z_1+z_2=4+2i$':  (4+2j,  '#27ae60'),
    '$\\bar{z}_1=3-4i$':(3-4j, '#8e44ad'),
    '$z_1 z_2=11-2i$': (11-2j, '#e67e22'),
}

for label, (z, color) in numbers.items():
    # Plot the point
    ax.plot(z.real, z.imag, 'o', color=color, markersize=10, zorder=5)
    # Draw vector from origin to point
    ax.annotate('', xy=(z.real, z.imag), xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', color=color, lw=1.8))
    # Label
    offset = 0.2
    ax.text(z.real + offset, z.imag + offset, label,
            fontsize=9, color=color, fontweight='bold')

# Axes
ax.axhline(0, color='#333', lw=1)
ax.axvline(0, color='#333', lw=1)
ax.set_xlabel('Real axis', fontsize=11)
ax.set_ylabel('Imaginary axis', fontsize=11)
ax.set_title('The complex plane: complex numbers as points and vectors',
             fontsize=11)
ax.set_xlim(-1, 13); ax.set_ylim(-6, 6)
ax.set_aspect('equal')
ax.grid(True, alpha=0.3)
# Label the axes with standard notation
ax.text(12.5, 0.2, '$\\mathbb{R}$', fontsize=13)
ax.text(0.2, 5.7, '$i\\mathbb{R}$', fontsize=13)
plt.tight_layout()
plt.show()
```

**Walkthrough:** `z.real` and `z.imag` extract the coordinates of the
complex number as floats, used here as the $x$ and $y$ coordinates of the
plot. Each complex number is drawn both as a point (`ax.plot`) and as an
arrow from the origin (`ax.annotate` with `xytext=(0,0)`), making the
vector interpretation visible. `ax.set_aspect('equal')` ensures the real
and imaginary axes have the same scale, so distances in the plane are
geometrically meaningful.

---

### Modulus and Argument

Two quantities completely characterise a complex number's position
in the complex plane:

**Definition:** The **modulus** (or **absolute value**) of $z = a + bi$ is:

$$|z| = \sqrt{a^2 + b^2}$$

This is the distance from the origin to the point $(a, b)$ — the same
formula as the length of a vector in $\mathbb{R}^2$ (Lesson 0.4).

**Definition:** The **argument** of $z$, written $\arg(z)$, is the angle
$\theta$ that the vector from $0$ to $z$ makes with the positive real axis,
measured in radians:

$$\theta = \arg(z) = \arctan\!\left(\frac{b}{a}\right) \quad \text{(with care for quadrant)}$$

The principal argument is usually taken in $(-\pi, \pi]$.

**Hand-worked examples:**

$z = 3 + 4i$: $|z| = \sqrt{9+16} = \sqrt{25} = 5$,
$\arg(z) = \arctan(4/3) \approx 0.927$ rad $\approx 53.1°$.

$z = -1 + 0i$: $|z| = 1$, $\arg(z) = \pi$ (points left along real axis).

$z = 0 + 2i$: $|z| = 2$, $\arg(z) = \pi/2$ (points straight up).

**Key property:** $|z_1 z_2| = |z_1||z_2|$ and $\arg(z_1 z_2) = \arg(z_1) + \arg(z_2)$.

Multiplication scales by the product of moduli and **rotates** by the
sum of arguments. This is the geometric heart of complex multiplication.

```python
import cmath
import math

numbers = [3+4j, 1+1j, -1+0j, 2j, -1-1j]

print(f"{'z':>12}  {'|z|':>8}  {'arg (rad)':>12}  {'arg (deg)':>12}")
print("-" * 52)
for z in numbers:
    modulus  = abs(z)            # abs() on a complex number gives |z|
    argument = cmath.phase(z)    # cmath.phase: the argument of z in (-pi, pi]
    degrees  = math.degrees(argument)   # math.degrees: radians -> degrees
    print(f"{str(z):>12}  {modulus:>8.4f}  {argument:>12.4f}  {degrees:>12.2f}")

print()
# Verify multiplication property: |z1*z2| = |z1|*|z2|, arg(z1*z2) = arg(z1)+arg(z2)
z1, z2 = 3+4j, 1+1j
product = z1 * z2
print(f"z1={z1}, z2={z2}, z1*z2={product}")
print(f"  |z1|*|z2| = {abs(z1)*abs(z2):.6f}, |z1*z2| = {abs(product):.6f}")
print(f"  arg(z1)+arg(z2) = {cmath.phase(z1)+cmath.phase(z2):.6f}, arg(z1*z2) = {cmath.phase(product):.6f}")
```

**Walkthrough:** `abs(z)` for a complex number returns $|z| = \sqrt{a^2+b^2}$
— Python overloads the built-in `abs` function to work correctly on
complex numbers. `cmath.phase(z)` returns the argument $\arg(z)$ in
radians, in the range $(-\pi, \pi]$. `math.degrees(x)` converts from
radians to degrees.

---

### Polar Form and Euler's Formula

Since a complex number is completely determined by its modulus $r = |z|$
and argument $\theta = \arg(z)$, it can be written as:

$$z = r(\cos\theta + i\sin\theta)$$

This is the **polar form**. Here $\cos\theta$ and $\sin\theta$ are
the standard trigonometric functions (Stage 2) — for now, their
geometric definition is sufficient: $\cos\theta$ is the horizontal
component of a unit vector at angle $\theta$, and $\sin\theta$ is
the vertical component.

**Euler's Formula** (proved in Stage 5 via Taylor series):

$$e^{i\theta} = \cos\theta + i\sin\theta$$

This allows the polar form to be written compactly:

$$z = r e^{i\theta}$$

**Euler's Identity** — a special case at $\theta = \pi$:

$$e^{i\pi} = \cos\pi + i\sin\pi = -1 + 0 = -1$$

$$\boxed{e^{i\pi} + 1 = 0}$$

This single equation connects $e$, $i$, $\pi$, 1, and 0 — the five
most important constants in mathematics, in one elegant identity.

**Multiplication in polar form:**

$$z_1 z_2 = r_1 e^{i\theta_1} \cdot r_2 e^{i\theta_2} = r_1 r_2 \, e^{i(\theta_1+\theta_2)}$$

Multiplying complex numbers: multiply the moduli, add the arguments.
This makes clear why complex multiplication is a rotation combined with scaling.

**De Moivre's Theorem** (immediate from Euler's formula):

$$(r e^{i\theta})^n = r^n e^{in\theta} \implies (\cos\theta + i\sin\theta)^n = \cos(n\theta) + i\sin(n\theta)$$

```python
import numpy as np
import matplotlib.pyplot as plt
import cmath, math

fig, axes = plt.subplots(1, 2, figsize=(14, 7))

# --- Left: Euler's formula on the unit circle ---
theta_vals = np.linspace(0, 2*np.pi, 300)
# Plot unit circle
axes[0].plot(np.cos(theta_vals), np.sin(theta_vals),
             color='#aaaaaa', lw=1, linestyle='--')
# np.cos, np.sin: element-wise cosine and sine -- first appearance
# cos(theta) is the x-coordinate, sin(theta) the y-coordinate of a unit circle point

# Show e^(i*theta) = cos(theta) + i*sin(theta) for several theta
thetas = [0, np.pi/6, np.pi/4, np.pi/3, np.pi/2, np.pi, 3*np.pi/2]
labels = ['$0$','$\\pi/6$','$\\pi/4$','$\\pi/3$','$\\pi/2$','$\\pi$','$3\\pi/2$']
colors = plt.cm.hsv(np.array(thetas)/(2*np.pi))
# plt.cm.hsv: hue-saturation-value colormap, cycles through colours as angle increases
# dividing by 2*pi maps [0, 2*pi] to [0,1] for the colormap

for theta, label, color in zip(thetas, labels, colors):
    x = np.cos(theta)
    y = np.sin(theta)
    axes[0].plot(x, y, 'o', color=color, markersize=10, zorder=5)
    axes[0].annotate(f'$e^{{i{label}}}$', (x,y),
                     xytext=(x*1.18, y*1.18), fontsize=8, ha='center', color=color)
    axes[0].plot([0,x], [0,y], color=color, lw=1.5, alpha=0.7)

axes[0].axhline(0, color='#333', lw=0.8)
axes[0].axvline(0, color='#333', lw=0.8)
axes[0].set_aspect('equal')
axes[0].set_xlim(-1.6, 1.6); axes[0].set_ylim(-1.6, 1.6)
axes[0].set_xlabel('Real'); axes[0].set_ylabel('Imaginary')
axes[0].set_title("Euler's formula: $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$\n"
                  "traces the unit circle", fontsize=10)
axes[0].grid(True, alpha=0.3)

# --- Right: multiplication as rotation ---
z = 1 + 1j   # |z| = sqrt(2), arg = pi/4
axes[1].axhline(0, color='#333', lw=0.8)
axes[1].axvline(0, color='#333', lw=0.8)

colors2 = ['#2980b9','#27ae60','#e74c3c','#8e44ad','#e67e22']
z_current = 1 + 0j  # start at 1 on real axis
for k, color in enumerate(colors2):
    z_next = z_current * z
    axes[1].plot([z_current.real, z_next.real],
                 [z_current.imag, z_next.imag],
                 color=color, lw=1.5, alpha=0.5, linestyle='--')
    axes[1].plot(z_current.real, z_current.imag, 'o', color=color, markersize=9)
    axes[1].text(z_current.real+0.1, z_current.imag+0.1,
                 f'$(1+i)^{k}$', fontsize=8, color=color)
    z_current = z_next

axes[1].plot(z_current.real, z_current.imag, 'o', color='black', markersize=9)
axes[1].text(z_current.real+0.1, z_current.imag+0.1,
             f'$(1+i)^{len(colors2)}$', fontsize=8)
axes[1].set_aspect('equal')
axes[1].set_title('Multiplying by $(1+i)$ repeatedly:\n'
                  'each step rotates by $45°$ and scales by $\\sqrt{2}$', fontsize=10)
axes[1].set_xlabel('Real'); axes[1].set_ylabel('Imaginary')
axes[1].grid(True, alpha=0.3)

plt.suptitle("Complex multiplication = rotation + scaling", fontsize=12)
plt.tight_layout()
plt.show()

# Euler's identity: e^(i*pi) + 1 = 0
import cmath
result = cmath.exp(1j * math.pi) + 1
print(f"e^(i*pi) + 1 = {result}")
print(f"  Real part: {result.real:.15f} (should be 0)")
print(f"  Imaginary part: {result.imag:.2e} (floating point rounding of 0)")
```

**Walkthrough:** `np.cos(theta_vals)` and `np.sin(theta_vals)` compute
cosine and sine element-wise — this is their first appearance in the
curriculum. Their full definition and properties are Stage 2; here we
use them purely as coordinate functions: $(\cos\theta, \sin\theta)$ is
the point at angle $\theta$ on the unit circle. `plt.cm.hsv(values)`
maps values in $[0,1]$ to the HSV colour wheel — appropriate here
because angles are circular, and the HSV wheel is also circular.
`cmath.exp(1j * math.pi)` computes $e^{i\pi}$ — the `cmath` version
of `exp` handles complex arguments, unlike `math.exp`.

---

### Square Roots and Solving Equations

With complex numbers we can now take square roots of negative numbers:

$$\sqrt{-a} = \sqrt{a} \cdot i \quad \text{for } a > 0$$

More generally, $\sqrt{z}$ for any complex $z$ can be computed using the
polar form: if $z = re^{i\theta}$, then $\sqrt{z} = \sqrt{r}\,e^{i\theta/2}$.

**Solving $z^2 = -4$:**

$$z = \pm\sqrt{-4} = \pm 2i$$

**Solving $z^2 + 2z + 5 = 0$** (quadratic formula):

$$z = \frac{-2 \pm \sqrt{4 - 20}}{2} = \frac{-2 \pm \sqrt{-16}}{2} = \frac{-2 \pm 4i}{2} = -1 \pm 2i$$

**Verify:** $(-1+2i)^2 + 2(-1+2i) + 5 = (1-4+4i-2) + (-2+4i) + 5$
$= (-1+4i) + (-2+4i) + 5 = 2 + 8i$... let me recheck.

$(-1+2i)^2 = 1 - 4i + 4i^2 = 1 - 4i - 4 = -3-4i$.
$(-3-4i) + 2(-1+2i) + 5 = -3-4i-2+4i+5 = 0$. ✓

```python
import cmath

print("Solving equations with complex roots:\n")

# z^2 = -4
print("z^2 = -4:")
for sign in [1, -1]:
    z = sign * cmath.sqrt(-4)   # cmath.sqrt handles negative arguments
    print(f"  z = {z},  verify z^2 = {z**2}")

print()
# z^2 + 2z + 5 = 0 using quadratic formula
a, b, c = 1, 2, 5
discriminant = b**2 - 4*a*c
print(f"z^2 + 2z + 5 = 0,  discriminant = {discriminant}")
for sign in [1, -1]:
    z = (-b + sign * cmath.sqrt(discriminant)) / (2*a)
    # cmath.sqrt of a negative number returns a purely imaginary result
    residual = a*z**2 + b*z + c
    print(f"  z = {z},  verify: az^2+bz+c = {residual.real:.2e}+{residual.imag:.2e}i")

print()
# General square root using polar form
z_vals = [3+4j, -1+0j, 1j, -4+0j]
for z in z_vals:
    root = cmath.sqrt(z)
    print(f"  sqrt({z}) = {root},  verify: root^2 = {root**2}")
```

**Walkthrough:** `cmath.sqrt(x)` — unlike `math.sqrt` — accepts any
real or complex argument, including negative reals, and returns a complex
result. `cmath.sqrt(-4)` returns `2j` (i.e., $2i$). For a general
complex number, `cmath.sqrt` uses the polar form internally, as described
above. The `residual` computation verifies each root by substituting
back into the original equation and checking the result is near zero.

---

## Connect the Pieces

**What this lesson built on:** The FTA (Lesson 1.4) stated that every
degree-$n$ polynomial has $n$ roots in $\mathbb{C}$ — this lesson gives
$\mathbb{C}$ a concrete definition. Conjugate pairs (Lesson 1.4) —
the theorem proved there is now proved properly using $z\bar{z}=|z|^2$.
The Cartesian plane (Lesson 0.4) — the complex plane is the same
geometry, reinterpreted. Exponentials (Lessons 1.6–1.7) — Euler's
formula $e^{i\theta} = \cos\theta + i\sin\theta$ connects $e$ from
Chapter 1B with the complex numbers of Chapter 1C.

**What this lesson makes possible:** Stage 2 (Trigonometry) — Euler's
formula provides the most powerful tool for deriving trig identities.
Stage 5 (Calculus) — complex numbers appear in the solutions to
differential equations. Stage 7 (Signals and Systems) — Fourier
transforms, z-transforms, and transfer functions all live in $\mathbb{C}$.
Stage 10 (Abstract Algebra) — $\mathbb{C}$ is the prototype of an
algebraically closed field.

**In engineering:** AC circuit analysis uses complex impedances
$Z = R + iX$. Control system stability is determined by where poles
(complex numbers) lie in the complex plane. The Fast Fourier Transform
(FFT) — the algorithm that enables all modern audio, image, and signal
processing — is fundamentally a computation over $\mathbb{C}$.

---

## Summary

**Complex number:** $z = a + bi$, where $a, b \in \mathbb{R}$ and $i^2 = -1$.

**Operations:**
$$\text{Add/Sub: } (a+bi)\pm(c+di) = (a\pm c)+(b\pm d)i$$
$$\text{Multiply: } (a+bi)(c+di) = (ac-bd)+(ad+bc)i$$
$$\text{Divide: } \frac{z_1}{z_2} = \frac{z_1\bar{z_2}}{|z_2|^2}$$

**Conjugate:** $\bar{z} = a - bi$. $z\bar{z} = |z|^2 \in \mathbb{R}$.

**Modulus:** $|z| = \sqrt{a^2+b^2}$. **Argument:** $\arg(z) = \theta$.

**Polar form:** $z = r(\cos\theta + i\sin\theta) = re^{i\theta}$.

**Euler's formula:** $e^{i\theta} = \cos\theta + i\sin\theta$.

**Euler's identity:** $e^{i\pi} + 1 = 0$.

**Multiplication:** $|z_1 z_2| = |z_1||z_2|$, $\arg(z_1 z_2) = \arg(z_1)+\arg(z_2)$.

**New Python:**
- `3 + 4j` — complex number literal (Python uses `j` for $i$)
- `z.real`, `z.imag` — real and imaginary parts
- `z.conjugate()` — complex conjugate
- `abs(z)` — modulus $|z|$
- `import cmath` — complex math module
- `cmath.phase(z)` — argument $\arg(z)$
- `cmath.sqrt(z)` — complex square root
- `cmath.exp(z)` — complex exponential $e^z$
- `np.cos(x)`, `np.sin(x)` — cosine and sine (full treatment in Stage 2)

---

## Problems

### Math

**1.** Write in the form $a + bi$.

(a) $(2+3i)(4-i)$ &emsp;
(b) $\dfrac{2+i}{1-3i}$ &emsp;
(c) $i^{23}$ &emsp;
(d) $(1+i)^4$

<details>
<summary>Answers</summary>

(a) $8-2i+12i-3i^2 = 8+10i+3 = 11+10i$

(b) $\frac{(2+i)(1+3i)}{(1-3i)(1+3i)} = \frac{2+6i+i+3i^2}{10} = \frac{2+7i-3}{10} = \frac{-1+7i}{10} = -\frac{1}{10}+\frac{7}{10}i$

(c) $23 \equiv 3 \pmod 4$, so $i^{23} = -i$

(d) $(1+i)^2 = 2i$; $(2i)^2 = -4$

</details>

---

**2.** Find the modulus and argument (in radians and degrees) of each.

(a) $z = 1 + i$ &emsp;
(b) $z = -\sqrt{3} + i$ &emsp;
(c) $z = -5$ &emsp;
(d) $z = 3i$

<details>
<summary>Answers</summary>

(a) $|z|=\sqrt{2}$, $\arg(z)=\pi/4=45°$

(b) $|z|=2$, $\arg(z)=5\pi/6=150°$ (second quadrant: $\arctan(1/(-\sqrt{3}))+\pi$)

(c) $|z|=5$, $\arg(z)=\pi=180°$

(d) $|z|=3$, $\arg(z)=\pi/2=90°$

</details>

---

**3.** Solve each equation over $\mathbb{C}$.

(a) $z^2 + 9 = 0$

(b) $z^2 - 4z + 13 = 0$

(c) $z^2 + z + 1 = 0$

<details>
<summary>Answers</summary>

(a) $z = \pm 3i$

(b) $z = \frac{4\pm\sqrt{16-52}}{2} = \frac{4\pm\sqrt{-36}}{2} = 2\pm 3i$

(c) $z = \frac{-1\pm\sqrt{-3}}{2} = -\frac{1}{2}\pm\frac{\sqrt{3}}{2}i$

</details>

---

**4.** (Proof) Prove that for any $z, w \in \mathbb{C}$:
$\overline{zw} = \bar{z}\,\bar{w}$
(the conjugate of a product equals the product of the conjugates).

<details>
<summary>Answer</summary>

Let $z=a+bi$, $w=c+di$. Then $zw=(ac-bd)+(ad+bc)i$.
$\overline{zw} = (ac-bd)-(ad+bc)i$.
$\bar{z}\bar{w} = (a-bi)(c-di) = ac-adi-bci+bdi^2 = (ac-bd)-(ad+bc)i$.
These are equal. $\blacksquare$

</details>

---

### Code Challenges

**Challenge 1 — Complex arithmetic verifier**

```python
import cmath

def complex_divide(z1, z2):
    """
    Divide z1 by z2 using the conjugate method:
    z1/z2 = z1 * conj(z2) / |z2|^2
    Raises ZeroDivisionError if z2 == 0.
    """
    pass

def complex_power_of_i(n):
    """
    Return i^n as a complex number using the cycle i^(n mod 4).
    Works for any integer n (positive, negative, or zero).
    """
    pass


# --- tests: do not modify ---
assert complex_divide(3+4j, 1-2j) == -1+2j
assert complex_divide(1+0j, 1j)   == -1j
assert abs(complex_divide(1+1j, 1+1j) - 1) < 1e-10

for n, expected in [(0,1+0j),(1,1j),(2,-1+0j),(3,-1j),(4,1+0j),(7,-1j),(-1,-1j)]:
    result = complex_power_of_i(n)
    assert abs(result - expected) < 1e-10, f"i^{n}: got {result}, expected {expected}"

print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Complex number plotter**

```python
import matplotlib.pyplot as plt
import cmath, math

def plot_complex_numbers(numbers_dict, title="Complex Plane"):
    """
    Plot a dictionary of {label: complex_number} in the complex plane.
    Each number shown as a point and as a vector from origin.
    """
    pass


# No automated test -- verify visually.
plot_complex_numbers({
    '$z_1 = 2+3i$':    2+3j,
    '$z_2 = -1+2i$':  -1+2j,
    '$z_1+z_2$':       1+5j,
    '$z_1 z_2$':       (2+3j)*(-1+2j),
    '$\\bar{z}_1$':    (2+3j).conjugate(),
})
```

---

**Challenge 3 — Roots of unity**

The $n$-th roots of unity are the $n$ solutions to $z^n = 1$.
They are equally spaced on the unit circle:
$z_k = e^{2\pi i k/n}$ for $k = 0, 1, \ldots, n-1$.

```python
import cmath, math
import matplotlib.pyplot as plt
import numpy as np

def roots_of_unity(n):
    """
    Return the n roots of z^n = 1 as a list of complex numbers.
    Uses the formula z_k = e^(2*pi*i*k/n).
    """
    pass


# --- tests: do not modify ---
roots = roots_of_unity(4)  # 1, i, -1, -i
assert len(roots) == 4
assert all(abs(z**4 - 1) < 1e-10 for z in roots)
assert any(abs(z - 1j) < 1e-10 for z in roots)   # i is a 4th root of unity

roots6 = roots_of_unity(6)
assert len(roots6) == 6
assert all(abs(z**6 - 1) < 1e-10 for z in roots6)

print("✓ Challenge 3 passed!")
print("Plotting 8th roots of unity...")

# Visualise
fig, ax = plt.subplots(figsize=(7, 7))
theta = np.linspace(0, 2*np.pi, 300)
ax.plot(np.cos(theta), np.sin(theta), color='#aaa', lw=1, linestyle='--')

for n_roots, color in [(3,'#e74c3c'),(4,'#2980b9'),(6,'#27ae60')]:
    for k, z in enumerate(roots_of_unity(n_roots)):
        ax.plot(z.real, z.imag, 'o', color=color, markersize=12)
    ax.plot([], [], 'o', color=color, markersize=10,
            label=f'$n={n_roots}$ roots of unity')

ax.axhline(0, color='#333', lw=0.8); ax.axvline(0, color='#333', lw=0.8)
ax.set_aspect('equal')
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.legend(fontsize=10); ax.grid(True, alpha=0.3)
ax.set_title('Roots of unity: equally spaced on the unit circle', fontsize=11)
plt.tight_layout()
plt.show()
```

---

### Extension

**4. ★** Prove De Moivre's Theorem by induction:
$(\cos\theta + i\sin\theta)^n = \cos(n\theta) + i\sin(n\theta)$
for all positive integers $n$.

<details>
<summary>Answer</summary>

**Base case** $n=1$: trivially $\cos\theta+i\sin\theta = \cos\theta+i\sin\theta$. ✓

**Inductive step:** Assume $(\cos\theta+i\sin\theta)^k = \cos(k\theta)+i\sin(k\theta)$.

$(\cos\theta+i\sin\theta)^{k+1} = (\cos(k\theta)+i\sin(k\theta))(\cos\theta+i\sin\theta)$

$= \cos(k\theta)\cos\theta - \sin(k\theta)\sin\theta + i(\sin(k\theta)\cos\theta + \cos(k\theta)\sin\theta)$

$= \cos((k+1)\theta) + i\sin((k+1)\theta)$

where the last step uses the addition formulas for cosine and sine
(Stage 2). $\blacksquare$

</details>

**5. ★** Use De Moivre's Theorem to derive exact formulas for
$\cos(3\theta)$ and $\sin(3\theta)$ in terms of $\cos\theta$ and $\sin\theta$.

<details>
<summary>Answer</summary>

$(\cos\theta+i\sin\theta)^3 = \cos(3\theta)+i\sin(3\theta)$.

Expand the left side:
$\cos^3\theta + 3\cos^2\theta(i\sin\theta) + 3\cos\theta(i\sin\theta)^2 + (i\sin\theta)^3$
$= \cos^3\theta + 3i\cos^2\theta\sin\theta - 3\cos\theta\sin^2\theta - i\sin^3\theta$
$= (\cos^3\theta - 3\cos\theta\sin^2\theta) + i(3\cos^2\theta\sin\theta - \sin^3\theta)$

Matching real and imaginary parts:
$$\cos(3\theta) = \cos^3\theta - 3\cos\theta\sin^2\theta = 4\cos^3\theta - 3\cos\theta$$
$$\sin(3\theta) = 3\cos^2\theta\sin\theta - \sin^3\theta = 3\sin\theta - 4\sin^3\theta$$

(using $\sin^2\theta = 1-\cos^2\theta$ and $\cos^2\theta = 1-\sin^2\theta$ to simplify)

</details>
