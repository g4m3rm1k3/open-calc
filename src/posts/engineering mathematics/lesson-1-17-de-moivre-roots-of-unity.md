# Stage 1, Lesson 1.17 — De Moivre's Theorem and Roots of Unity
**Threads:** Math · CS · Physics  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

De Moivre's theorem says that to raise a complex number to a positive integer
power, you raise its modulus to that power and multiply its argument by that
integer. In exponential form this is trivially $\left(re^{i\theta}\right)^n = r^n e^{in\theta}$.
But De Moivre's theorem has a second, less obvious consequence: it also answers
the question "what are the $n$-th roots of a complex number?" Every nonzero
complex number has exactly $n$ distinct $n$-th roots, equally spaced around
a circle in the complex plane. The special case — $n$-th roots of $1$ — gives
the **roots of unity**, a set of complex numbers with extraordinary algebraic,
geometric, and computational properties.

The $n$-th roots of unity are the vertices of a regular $n$-gon inscribed in
the unit circle. They arise in signal processing (the Discrete Fourier Transform),
in number theory (cyclotomic polynomials), and in engineering (filter design,
antenna arrays). This lesson derives De Moivre's theorem, applies it to
computing roots, proves properties of roots of unity, and builds computational
tools for working with them.

---

## Historical Context

Abraham de Moivre (1667–1754) was a French mathematician who spent most of
his life in England. His theorem, in the form
$(\cos\theta + i\sin\theta)^n = \cos(n\theta) + i\sin(n\theta)$,
appeared in 1722 in the *Philosophical Transactions of the Royal Society*,
though he had used equivalent forms earlier. He discovered it before Euler's
formula was published and derived it by repeated multiplication and trigonometric
identities. With Euler's formula, the proof reduces to a single line:
$(e^{i\theta})^n = e^{in\theta}$. De Moivre also made foundational contributions
to probability theory — his 1756 book *The Doctrine of Chances* proved the
normal approximation to the binomial distribution.

---

## What You Need To Know First

- **Euler's formula** $e^{i\theta} = \cos\theta + i\sin\theta$ (Lesson 1.16).
- **Exponential form** $z = re^{i\theta}$ and polar form (Lesson 1.15).
- **Argument periodicity:** $e^{i(\theta + 2\pi k)} = e^{i\theta}$ for any integer $k$.
- **Factoring $z^n - 1$** — Lesson 1.3 for the basic idea; this lesson extends it
  to complex roots.

---

## The Lesson

### De Moivre's Theorem

**Statement:** for any real $\theta$ and any integer $n$:

$$\boxed{(\cos\theta + i\sin\theta)^n = \cos(n\theta) + i\sin(n\theta)}$$

Equivalently, in exponential form:

$$(e^{i\theta})^n = e^{in\theta}$$

**Proof (using Euler's formula):** this is immediate:
$(e^{i\theta})^n = e^{i(n\theta)} = \cos(n\theta) + i\sin(n\theta)$. $\square$

The exponential law $(e^a)^n = e^{na}$ extends to complex arguments.

**Proof by induction (without Euler, for rigor):**

Base case ($n=1$): $(\cos\theta+i\sin\theta)^1 = \cos\theta+i\sin\theta = \cos(1\cdot\theta)+i\sin(1\cdot\theta)$. ✓

Inductive step: assume $(\cos\theta+i\sin\theta)^k = \cos(k\theta)+i\sin(k\theta)$.
Then:
$$(\cos\theta+i\sin\theta)^{k+1} = (\cos\theta+i\sin\theta)^k \cdot (\cos\theta+i\sin\theta)$$
$$= [\cos(k\theta)+i\sin(k\theta)][\cos\theta+i\sin\theta]$$
$$= \cos(k\theta)\cos\theta - \sin(k\theta)\sin\theta + i[\cos(k\theta)\sin\theta + \sin(k\theta)\cos\theta]$$
$$= \cos((k+1)\theta) + i\sin((k+1)\theta)$$

(using $\cos(A+B) = \cos A\cos B - \sin A\sin B$ and $\sin(A+B) = \sin A\cos B + \cos A\sin B$). $\square$

**For negative $n$:** if $n = -m$ with $m > 0$:
$(e^{i\theta})^{-m} = 1/(e^{i\theta})^m = 1/e^{im\theta} = e^{-im\theta}$. ✓

**Application — computing high powers:**

$z = r(\cos\theta + i\sin\theta) = re^{i\theta}$, so:

$$z^n = r^n(\cos(n\theta) + i\sin(n\theta)) = r^n e^{in\theta}$$

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def de_moivre(z, n):
    """
    Compute z^n using De Moivre: r^n * e^(i*n*theta).
    Returns a complex number.
    """
    r     = abs(z)
    theta = cmath.phase(z)
    return cmath.rect(r**n, n*theta)   # rect(r, theta) = r*e^(i*theta)

# Verify: (cos 20° + i sin 20°)^9 = cos 180° + i sin 180° = -1
theta = math.radians(20)
z     = cmath.rect(1, theta)   # e^(i*20°)
result = de_moivre(z, 9)
print(f"(e^(i·20°))^9 = e^(i·180°) = {result:.6f}")
print(f"  Should be -1+0i: {-1+0j}")
print(f"  Error: {abs(result - (-1+0j)):.2e}")
print()

# Compare De Moivre vs Python built-in
test_cases = [
    (1+1j,         10, "(1+i)^10 = 32i"),
    (cmath.rect(2, math.pi/3), 6,  "(2e^(iπ/3))^6 = 2^6 * e^(2πi) = 64"),
    (-1+1j,        4, "(-1+i)^4"),
    (0.5+0.866j,   3, "approx (e^(iπ/3))^3 = e^(iπ) = -1"),
]
print(f"{'Expression':<35} | {'De Moivre':>25} | {'Python z^n':>25} | Match")
print("-" * 100)
for z, n, label in test_cases:
    dm      = de_moivre(z, n)
    direct  = z**n
    ok      = abs(dm - direct) < 1e-8
    print(f"{label:<35} | {str(dm):>25} | {str(direct):>25} | {'✓' if ok else '✗'}")

print()

# Visualise: powers on the complex plane
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Left: (1+i)^n for n=0..10 (spiral outward because |1+i| = sqrt(2) > 1)
z_base = 1+1j
pows = [de_moivre(z_base, n) for n in range(11)]
ax = axes[0]
ax.plot([p.real for p in pows], [p.imag for p in pows], '-o',
        color='#2980b9', lw=1.5, markersize=8, zorder=5)
for n, p in enumerate(pows):
    ax.annotate(f'$n={n}$', xy=(p.real, p.imag),
                xytext=(p.real+0.5, p.imag+0.5), fontsize=8, color='#2980b9')
ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal')
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('$(1+i)^n$: modulus grows by $\\sqrt{2}$ each step\n'
             'argument increases by 45°', fontsize=10)
ax.grid(True, alpha=0.3)

# Right: unit-circle point — stays on unit circle
z_unit = cmath.rect(1, math.pi/5)   # e^(iπ/5) = 36°
pows_unit = [de_moivre(z_unit, n) for n in range(11)]
ax = axes[1]
theta_c = np.linspace(0, 2*np.pi, 300)
ax.plot(np.cos(theta_c), np.sin(theta_c), color='#ddd', lw=2)
ax.plot([p.real for p in pows_unit], [p.imag for p in pows_unit], '-o',
        color='#e74c3c', lw=1.5, markersize=8, zorder=5)
for n, p in enumerate(pows_unit):
    ax.annotate(f'$n={n}$', xy=(p.real, p.imag),
                xytext=(p.real*1.15, p.imag*1.15), fontsize=7.5, color='#c0392b')
ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal'); ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title('$(e^{i\\pi/5})^n$: stays on unit circle\n'
             'returns to start after $n=10$', fontsize=10)
ax.grid(True, alpha=0.3)

plt.suptitle("De Moivre's Theorem: $(re^{i\\theta})^n = r^n e^{in\\theta}$", fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `cmath.rect(r**n, n*theta)` computes $r^n e^{in\theta}$
directly. `cmath.phase(z)` returns the principal argument $\theta \in (-\pi,\pi]$.
The left spiral shows that when $|z| = \sqrt{2} > 1$, successive powers
spiral outward — each step doubles the distance from origin (since
$(\sqrt{2})^2 = 2$, so $|z^{n+1}|/|z^n| = \sqrt{2}$) and rotates by 45°.
The right panel shows a unit-circle point: modulus stays 1, only the
angle changes, so the sequence lies on the unit circle.

---

### Finding $n$-th Roots of a Complex Number

**Problem:** given $w$ (complex), find all $z$ such that $z^n = w$.

**Method:** write $w = R e^{i\phi}$ (polar form). Seek $z = r e^{i\theta}$ satisfying:

$$(r e^{i\theta})^n = R e^{i\phi}$$
$$r^n e^{in\theta} = R e^{i\phi}$$

Equating moduli: $r^n = R$, so $r = R^{1/n}$.
Equating arguments: $n\theta = \phi + 2\pi k$ for any integer $k$,
so $\theta = \frac{\phi + 2\pi k}{n}$.

For $k = 0, 1, 2, \ldots, n-1$, these give $n$ **distinct** values of $\theta$.
For $k \geq n$, the values repeat (since $2\pi/n$ is the spacing and
adding $n$ steps wraps around).

Therefore the $n$ **distinct $n$-th roots** of $w = Re^{i\phi}$ are:

$$\boxed{z_k = R^{1/n} e^{i(\phi + 2\pi k)/n}, \quad k = 0, 1, 2, \ldots, n-1}$$

**Geometric meaning:** all $n$ roots have modulus $R^{1/n}$ — they lie on
a **circle of radius $R^{1/n}$**. They are equally spaced around this circle,
separated by angle $2\pi/n$.

**Hand-worked example 1:** find the cube roots of $8$ (i.e., solve $z^3 = 8$).

$8 = 8e^{i \cdot 0}$ (real positive, so $R=8$, $\phi=0$).

$r = 8^{1/3} = 2$.

Angles: $\theta_k = (0 + 2\pi k)/3$ for $k = 0, 1, 2$.

$\theta_0 = 0$: $z_0 = 2e^{0} = 2$ (the real cube root)
$\theta_1 = 2\pi/3$: $z_1 = 2e^{2i\pi/3} = 2(-\frac{1}{2}+\frac{\sqrt{3}}{2}i) = -1+\sqrt{3}\,i$
$\theta_2 = 4\pi/3$: $z_2 = 2e^{4i\pi/3} = 2(-\frac{1}{2}-\frac{\sqrt{3}}{2}i) = -1-\sqrt{3}\,i$

**Verification:** $z_1^3 = 2^3 e^{3 \cdot 2i\pi/3} = 8 e^{2i\pi} = 8 \cdot 1 = 8$. ✓

**Hand-worked example 2:** find the 4th roots of $-16$.

$-16 = 16 e^{i\pi}$ (real negative, so $R=16$, $\phi=\pi$).

$r = 16^{1/4} = 2$.

Angles: $\theta_k = (\pi + 2\pi k)/4$ for $k = 0, 1, 2, 3$.

$\theta_0 = \pi/4$: $z_0 = 2e^{i\pi/4} = \sqrt{2}+\sqrt{2}\,i$
$\theta_1 = 3\pi/4$: $z_1 = 2e^{3i\pi/4} = -\sqrt{2}+\sqrt{2}\,i$
$\theta_2 = 5\pi/4$: $z_2 = 2e^{5i\pi/4} = -\sqrt{2}-\sqrt{2}\,i$
$\theta_3 = 7\pi/4$: $z_3 = 2e^{7i\pi/4} = \sqrt{2}-\sqrt{2}\,i$

These form the vertices of a square.

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def nth_roots(w, n):
    """
    Find all n distinct n-th roots of complex number w.
    Returns a list of n complex numbers z_k = R^(1/n) * e^(i*(phi+2*pi*k)/n)
    for k = 0, 1, ..., n-1.
    """
    if n <= 0:
        raise ValueError("n must be a positive integer")
    if w == 0:
        return [0+0j]   # only root of 0 is 0 (for any n)
    R   = abs(w)
    phi = cmath.phase(w)
    r   = R ** (1/n)    # float: n-th root of modulus
    roots = []
    for k in range(n):
        theta_k = (phi + 2 * math.pi * k) / n
        roots.append(cmath.rect(r, theta_k))
    return roots

# Example 1: cube roots of 8
print("Cube roots of 8:")
roots_8 = nth_roots(8+0j, 3)
for k, z in enumerate(roots_8):
    check = z**3
    print(f"  z_{k} = {z:.6f}   z^3 = {check:.6f}   (should be 8+0i)")

print()

# Example 2: 4th roots of -16
print("4th roots of -16:")
roots_m16 = nth_roots(-16+0j, 4)
for k, z in enumerate(roots_m16):
    check = z**4
    print(f"  z_{k} = {z:.6f}   z^4 = {check:.6f}   (should be -16+0i)")

print()

# General verification
for w, n, label in [(1+0j, 6, "6th roots of 1"),
                     (0+1j, 4, "4th roots of i"),
                     (-8+0j, 3, "cube roots of -8"),
                     (2+2j, 3, "cube roots of 2+2i")]:
    roots = nth_roots(w, n)
    checks = [abs(z**n - w) for z in roots]
    max_err = max(checks)
    print(f"{label}: max error = {max_err:.2e}  {'✓' if max_err < 1e-10 else '✗'}")

# Visualise: n-th roots as regular polygon vertices
fig, axes = plt.subplots(1, 3, figsize=(16, 5))

for idx, (w, n, title) in enumerate([
    (8+0j,   3, "Cube roots of 8\n(triangle, r=2)"),
    (-16+0j, 4, "4th roots of -16\n(square, r=2)"),
    (1+0j,   6, "6th roots of 1\n(hexagon, r=1)"),
]):
    ax = axes[idx]
    roots = nth_roots(w, n)
    R = abs(w)**(1/n)

    # Draw circle
    theta_c = np.linspace(0, 2*np.pi, 300)
    ax.plot(R*np.cos(theta_c), R*np.sin(theta_c), color='#ddd', lw=2)

    # Draw polygon connecting roots (sorted by angle)
    roots_sorted = sorted(roots, key=lambda z: cmath.phase(z))
    xs = [z.real for z in roots_sorted] + [roots_sorted[0].real]
    ys = [z.imag for z in roots_sorted] + [roots_sorted[0].imag]
    ax.plot(xs, ys, color='#aaa', lw=1.5, ls='--')

    # Plot roots
    colors_r = ['#2980b9', '#e74c3c', '#27ae60', '#e67e22', '#8e44ad', '#c0392b']
    for k, z in enumerate(roots):
        ax.scatter([z.real], [z.imag], s=120, color=colors_r[k], zorder=5)
        ax.annotate(f'$z_{{{k}}}$\n{z.real:.2f}{"+"+str(round(z.imag,2))+"i" if abs(z.imag)>1e-10 else ""}',
                    xy=(z.real, z.imag), xytext=(z.real*(1+0.3/R), z.imag*(1+0.3/R)),
                    fontsize=7.5, color=colors_r[k], ha='center')

    # Mark w
    ax.scatter([w.real], [w.imag], s=80, color='#333', marker='x', zorder=6)
    ax.annotate(f'w={w}', xy=(w.real, w.imag), xytext=(w.real+0.05, w.imag+0.1),
                fontsize=8)

    ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
    ax.set_aspect('equal')
    margin = R * 1.5
    ax.set_xlim(-margin, margin); ax.set_ylim(-margin, margin)
    ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
    ax.set_title(title, fontsize=10)
    ax.grid(True, alpha=0.3)

plt.suptitle("$n$-th roots of $w$: equally spaced on circle of radius $|w|^{1/n}$", fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `R**(1/n)` computes the real $n$-th root of the modulus.
Python's `/` gives float division, so `phi + 2*math.pi*k` and `n` are both
floats/ints and `theta_k` is a float angle. `cmath.rect(r, theta_k)` converts
back to Cartesian. `sorted(roots, key=lambda z: cmath.phase(z))` sorts roots
by angle to draw the polygon in the correct order. The polygon plot adds
`roots_sorted[0]` at the end to close the polygon (connect last vertex to first).

---

### Roots of Unity

**Definition:** the **$n$-th roots of unity** are the solutions to $z^n = 1$.

Since $1 = 1 \cdot e^{i \cdot 0} = e^{2\pi i k}$ for any integer $k$, the formula gives:

$$\boxed{\omega_k = e^{2\pi i k/n}, \quad k = 0, 1, \ldots, n-1}$$

Setting $\omega = e^{2\pi i/n}$ (the **primitive root of unity**), these are:

$$1, \omega, \omega^2, \omega^3, \ldots, \omega^{n-1}$$

**Geometric meaning:** vertices of a regular $n$-gon inscribed in the unit
circle, starting at $1$ and spaced by $2\pi/n$ radians.

**Algebraic properties:**

**(i) Product of all roots:**

$$\prod_{k=0}^{n-1} \omega^k = \omega^{0+1+\cdots+(n-1)} = \omega^{n(n-1)/2}$$

Since $\omega^n = 1$: this is $1$ if $n \equiv 1$ or $2 \pmod 4$, and...
more simply, for odd $n$: product $= (-1)^{n+1}$. (This follows from Vieta's formulas applied to $z^n-1$.)

By Vieta's for $z^n - 1 = 0$: product of all roots $= (-1)^n \cdot (-1) = (-1)^{n+1}$.

**(ii) Sum of all $n$-th roots of unity:**

$$\boxed{\sum_{k=0}^{n-1} \omega^k = 0 \quad (n \geq 2)}$$

**Proof:** this is a geometric series with ratio $\omega \neq 1$:

$$\sum_{k=0}^{n-1} \omega^k = \frac{\omega^n - 1}{\omega - 1} = \frac{1 - 1}{\omega - 1} = 0$$

**Geometric interpretation:** the $n$ roots are symmetrically placed around
the origin, so their centroid (average) is at the origin — the sum is zero.

**(iii) Sum of geometric series:**

$$\sum_{k=0}^{n-1} (\omega^m)^k = \begin{cases} n & \text{if } \omega^m = 1 \text{ (i.e., } n \mid m\text{)} \\ 0 & \text{otherwise}\end{cases}$$

This **orthogonality property** is the foundation of the **Discrete Fourier Transform (DFT)**.

**(iv) The minimal polynomial:**

The $n$-th roots of unity are roots of $z^n - 1 = 0$. This factors as:

$$z^n - 1 = (z-1)(z^{n-1} + z^{n-2} + \cdots + z + 1)$$

The second factor is the **$n$-th cyclotomic-like polynomial** for $n$ prime;
its roots are the primitive $n$-th roots of unity $\omega^k$ for $k \not\equiv 0 \pmod n$.

**Hand-worked example:** find and verify the 6th roots of unity.

$\omega = e^{2\pi i/6} = e^{i\pi/3} = \cos(60°) + i\sin(60°) = \frac{1}{2}+\frac{\sqrt{3}}{2}i$.

The roots are: $\omega^0=1$, $\omega^1=\frac{1}{2}+\frac{\sqrt{3}}{2}i$,
$\omega^2 = -\frac{1}{2}+\frac{\sqrt{3}}{2}i$, $\omega^3=-1$,
$\omega^4=-\frac{1}{2}-\frac{\sqrt{3}}{2}i$, $\omega^5=\frac{1}{2}-\frac{\sqrt{3}}{2}i$.

Sum: $(1) + (\frac{1}{2}+\frac{\sqrt{3}}{2}i) + (-\frac{1}{2}+\frac{\sqrt{3}}{2}i) + (-1) + (-\frac{1}{2}-\frac{\sqrt{3}}{2}i) + (\frac{1}{2}-\frac{\sqrt{3}}{2}i)$
$= (1+\frac{1}{2}-\frac{1}{2}-1-\frac{1}{2}+\frac{1}{2}) + (\frac{\sqrt{3}}{2}+\frac{\sqrt{3}}{2}-\frac{\sqrt{3}}{2}-\frac{\sqrt{3}}{2})i = 0 + 0i = 0$. ✓

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def roots_of_unity(n):
    """
    Return the n-th roots of unity as a list of complex numbers.
    omega^k = e^(2*pi*i*k/n) for k = 0, 1, ..., n-1.
    """
    omega = cmath.exp(2j * math.pi / n)   # primitive n-th root
    return [omega**k for k in range(n)]

# Verify sum = 0 and product for several n
print("Roots of unity verification:")
print(f"{'n':>4} | {'Sum (should be 0)':>25} | {'|Sum|':>10} | {'All on unit circle':>20}")
print("-" * 68)
for n in [2, 3, 4, 5, 6, 8, 10]:
    roots = roots_of_unity(n)
    s     = sum(roots)
    on_circle = all(abs(abs(z) - 1) < 1e-12 for z in roots)
    print(f"{n:>4} | {str(s):>25} | {abs(s):>10.2e} | {'✓' if on_circle else '✗'}")

print()

# Geometric series orthogonality
print("Orthogonality: sum of omega^(mk) for k=0..n-1:")
n = 6
omega = cmath.exp(2j * math.pi / n)
for m in range(8):
    s = sum(omega**(m*k) for k in range(n))
    expected = n if m % n == 0 else 0
    ok = abs(abs(s) - abs(expected)) < 1e-10
    print(f"  m={m}: sum = {s:.2f}  expected: {expected}  {'✓' if ok else '✗'}")

print()

# Visualise: n-th roots of unity as regular polygons
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
theta_circ = np.linspace(0, 2*np.pi, 300)

for idx, n in enumerate([3, 4, 5, 6, 8, 12]):
    ax = axes[idx // 3][idx % 3]
    roots = roots_of_unity(n)

    ax.plot(np.cos(theta_circ), np.sin(theta_circ), color='#ddd', lw=2)

    xs = [z.real for z in roots] + [roots[0].real]
    ys = [z.imag for z in roots] + [roots[0].imag]
    ax.plot(xs, ys, color='#2980b9', lw=2, zorder=3)

    for k, z in enumerate(roots):
        ax.scatter([z.real], [z.imag], s=100, color='#e74c3c', zorder=5)
        deg = math.degrees(cmath.phase(z))
        ax.annotate(f'$\\omega^{{{k}}}$\n{deg:.0f}°',
                    xy=(z.real, z.imag),
                    xytext=(z.real*1.22, z.imag*1.22),
                    fontsize=6.5, ha='center', color='#c0392b')

    ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
    ax.set_aspect('equal')
    ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
    ax.set_title(f'$n={n}$: regular {n}-gon\n$\\omega = e^{{2\\pi i/{n}}}$', fontsize=10)
    ax.grid(True, alpha=0.3)

plt.suptitle('$n$-th roots of unity: vertices of regular $n$-gons on the unit circle', fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `cmath.exp(2j*math.pi/n)` computes $e^{2\pi i/n}$, the
primitive $n$-th root. `omega**k` raises it to the $k$-th power. The list
comprehension `[omega**k for k in range(n)]` generates all $n$ roots.
The orthogonality test computes $\sum_{k=0}^{n-1} (\omega^m)^k$ for each $m$;
by the geometric series formula, this should be $n$ when $n \mid m$ (when
$\omega^m = 1$) and $0$ otherwise. The six subplots show that $n$-th
roots of unity always form a regular $n$-gon — this is the geometric
content of the equal spacing.

---

### The Discrete Fourier Transform (Preview)

The orthogonality property of roots of unity is the mathematical engine
behind the **Discrete Fourier Transform (DFT)**:

$$X[k] = \sum_{j=0}^{n-1} x[j] \cdot \omega^{-jk}, \quad \omega = e^{2\pi i/n}$$

This decomposes a sequence $x[0], x[1], \ldots, x[n-1]$ into $n$ complex
amplitudes $X[0], X[1], \ldots, X[n-1]$ at different frequencies.
The inverse DFT:

$$x[j] = \frac{1}{n}\sum_{k=0}^{n-1} X[k] \cdot \omega^{jk}$$

**The key property:** the matrix $F$ where $F_{jk} = \omega^{jk}/\sqrt{n}$
is **unitary** — $F^\dagger F = I$ — exactly because of the orthogonality
$\sum_j \omega^{(m-k)j} = n \cdot \delta_{mk}$.

The **Fast Fourier Transform (FFT)** computes this DFT in $O(n\log n)$ time
instead of $O(n^2)$ by exploiting the recursive structure of the roots of unity.

```python
import cmath
import math
import numpy as np
import matplotlib.pyplot as plt

def dft_naive(x):
    """
    Compute the Discrete Fourier Transform of sequence x.
    X[k] = sum_{j=0}^{n-1} x[j] * omega^(-j*k), omega = e^(2*pi*i/n)
    Returns a list of n complex numbers.
    """
    n = len(x)
    omega = cmath.exp(2j * math.pi / n)   # primitive n-th root
    return [sum(x[j] * omega**(-j*k) for j in range(n)) for k in range(n)]

def idft_naive(X):
    """
    Inverse DFT: x[j] = (1/n) * sum_{k=0}^{n-1} X[k] * omega^(j*k)
    """
    n = len(X)
    omega = cmath.exp(2j * math.pi / n)
    return [(1/n) * sum(X[k] * omega**(j*k) for k in range(n)) for j in range(n)]

# Test: DFT of a simple signal
# Signal: x = [1, 0, 0, 0] -> DFT should be [1, 1, 1, 1]
x1 = [1, 0, 0, 0]
X1 = dft_naive(x1)
print("DFT of [1,0,0,0]:", [round(X.real,8) for X in X1])
print("  Expected: [1, 1, 1, 1] (constant spectrum)")

# Signal with frequency: x = [1, i, -1, -i] (one full cycle of e^(2*pi*i*k/4))
x2 = [1+0j, 0+1j, -1+0j, 0-1j]
X2 = dft_naive(x2)
print("\nDFT of [1, i, -1, -i]:", [round(abs(X),8) for X in X2])
print("  Expected: [0, 4, 0, 0] magnitudes (all energy at frequency k=1)")

# Round-trip: DFT then IDFT
x_orig = [1.5, -0.5, 2.0, 0.8]
X = dft_naive(x_orig)
x_rec  = idft_naive(X)
print("\nRound-trip DFT->IDFT:")
print(f"  Original:      {[round(v.real, 8) for v in [complex(v) for v in x_orig]]}")
print(f"  Reconstructed: {[round(v.real, 8) for v in x_rec]}")
print(f"  Max error:     {max(abs(complex(x_orig[k]) - x_rec[k]) for k in range(4)):.2e}")

# Compare with numpy's FFT (industry-standard FFT implementation)
x_np = np.array(x_orig)
X_numpy = np.fft.fft(x_np)
X_naive = dft_naive(x_orig)
print(f"\nNaive DFT vs numpy.fft.fft: max diff = {max(abs(X_numpy[k]-X_naive[k]) for k in range(4)):.2e}")

# Visualise: DFT spectrum of a signal
n = 64
t = np.arange(n)
# Signal: sum of two cosines at f=4 and f=12
x_signal = np.cos(2*np.pi*4*t/n) + 0.5*np.cos(2*np.pi*12*t/n)
X_signal  = np.fft.fft(x_signal)
freqs     = np.fft.fftfreq(n) * n   # frequencies in cycles per n samples

fig, axes = plt.subplots(1, 2, figsize=(13, 5))

axes[0].plot(t, x_signal, color='#2980b9', lw=2)
axes[0].set_xlabel('Sample index')
axes[0].set_ylabel('Amplitude')
axes[0].set_title('Signal: $\\cos(2\\pi\\cdot4t/n) + 0.5\\cos(2\\pi\\cdot12t/n)$', fontsize=10)
axes[0].grid(True, alpha=0.3)

# Spectrum: magnitude of DFT
axes[1].stem(freqs[:n//2], np.abs(X_signal[:n//2]),
             linefmt='#e74c3c', markerfmt='o', basefmt='grey',
             use_line_collection=True)
axes[1].set_xlabel('Frequency (cycles per n samples)')
axes[1].set_ylabel('|X[k]|')
axes[1].set_title('DFT spectrum: spikes at f=4 and f=12\n'
                  '(amplitude ratio 2:1 matches 1:0.5 in time domain)', fontsize=10)
axes[1].grid(True, alpha=0.3)

plt.suptitle('Discrete Fourier Transform: powered by roots of unity orthogonality', fontsize=11)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `dft_naive` implements the DFT definition directly:
for each output frequency $k$, it sums all $n$ input samples weighted
by $\omega^{-jk}$. The double comprehension is $O(n^2)$. `cmath.exp(2j*math.pi/n)`
is $e^{2\pi i/n}$. `np.fft.fft` is numpy's highly optimised FFT — it gives
the same result but in $O(n\log n)$ time. `np.fft.fftfreq(n)*n` produces
the integer frequency labels $0, 1, \ldots, n/2, -n/2+1, \ldots, -1$.
`ax.stem` draws a stem plot — vertical lines from the baseline to each
data point — which is the standard way to visualise a discrete spectrum.

---

## Connect the Pieces

**What this lesson built on:** De Moivre (polar powers, Lesson 1.15),
Euler's formula (Lesson 1.16), the geometric series $\sum_{k=0}^{n-1} r^k = (r^n-1)/(r-1)$
(Stage 0), the FTA (Lesson 1.4 — $z^n-1$ has exactly $n$ roots).

**What this lesson makes possible:** the Discrete Fourier Transform (Stage 4);
antenna array beam-forming (equally-spaced antennas produce a roots-of-unity
pattern); $n$-th roots in number theory and cryptography. The proof that
every polynomial has $n$ complex roots (FTA) and that these roots can be
found numerically is completed by the tools of this lesson.

**Closing the loop:** Stage 1 began with polynomials (Lessons 1.1–1.5),
moved through exponentials and logarithms (1.6–1.11), and built complex
numbers from scratch (1.12–1.17). These three threads are now unified:
polynomials are fully understood over $\mathbb{C}$ (FTA), logarithms
and exponentials are related to complex numbers via $e^{i\theta}$, and the
roots of unity show that $\mathbb{C}$ is exactly the right field for
solving all polynomial equations.

---

## Summary

**De Moivre's Theorem:**
$$(\cos\theta + i\sin\theta)^n = \cos(n\theta) + i\sin(n\theta)$$
$$\text{or equivalently: } (re^{i\theta})^n = r^n e^{in\theta}$$

**$n$-th roots of $w = Re^{i\phi}$:**
$$z_k = R^{1/n} e^{i(\phi + 2\pi k)/n}, \quad k = 0, 1, \ldots, n-1$$
$$n \text{ distinct roots, equally spaced on circle of radius } R^{1/n}$$

**Roots of unity:**
$$\omega_k = e^{2\pi ik/n}, \quad k = 0, 1, \ldots, n-1$$
$$\sum_{k=0}^{n-1} \omega_k = 0, \qquad \omega^n = 1$$
$$\text{vertices of regular } n\text{-gon on unit circle}$$

**New Python:**
- `cmath.exp(2j*math.pi/n)` — primitive $n$-th root of unity
- `np.fft.fft(x)` — Fast Fourier Transform
- `ax.stem(x, y)` — stem plot for discrete spectra

---

## Problems

### Math

**1.** Use De Moivre's theorem to compute:
(a) $(\cos(15°)+i\sin(15°))^{12}$
(b) $\left(\frac{\sqrt{3}}{2}+\frac{i}{2}\right)^{10}$
(c) $(1-i)^8$

<details>
<summary>Answers</summary>

(a) $\cos(180°)+i\sin(180°) = -1$.
(b) $\frac{\sqrt{3}}{2}+\frac{i}{2} = e^{i\pi/6}$; $(e^{i\pi/6})^{10} = e^{i10\pi/6} = e^{i5\pi/3} = \cos(300°)+i\sin(300°) = \frac{1}{2}-\frac{\sqrt{3}}{2}i$.
(c) $1-i = \sqrt{2}\,e^{-i\pi/4}$; $(1-i)^8 = (\sqrt{2})^8 e^{-2\pi i} = 16 \cdot 1 = 16$.

</details>

---

**2.** Find all $n$-th roots in exponential form:
(a) Square roots of $i$ (i.e., solve $z^2 = i$)
(b) Cube roots of $-1$
(c) 4th roots of $-4$

<details>
<summary>Answers</summary>

(a) $i = e^{i\pi/2}$; roots: $e^{i\pi/4} = \frac{1}{\sqrt{2}}+\frac{i}{\sqrt{2}}$ and $e^{i5\pi/4} = -\frac{1}{\sqrt{2}}-\frac{i}{\sqrt{2}}$.

(b) $-1 = e^{i\pi}$; cube roots: $r=1$, angles $\pi/3, \pi, 5\pi/3$. $z_0 = e^{i\pi/3} = \frac{1}{2}+\frac{\sqrt{3}}{2}i$, $z_1 = -1$, $z_2 = e^{i5\pi/3} = \frac{1}{2}-\frac{\sqrt{3}}{2}i$.

(c) $-4 = 4e^{i\pi}$; $r=\sqrt{2}$, angles $(\pi+2\pi k)/4$. $z_0 = \sqrt{2}\,e^{i\pi/4} = 1+i$, $z_1 = \sqrt{2}\,e^{3i\pi/4} = -1+i$, $z_2 = \sqrt{2}\,e^{5i\pi/4} = -1-i$, $z_3 = \sqrt{2}\,e^{7i\pi/4} = 1-i$.

</details>

---

**3.** (a) Prove that the sum of all $n$-th roots of unity is zero for $n \geq 2$.
(b) Prove that the product of all $n$-th roots of unity is $(-1)^{n+1}$.
*(Hint for (b): use Vieta's formulas on $z^n - 1 = 0$.)*

<details>
<summary>Proofs</summary>

(a) Geometric series: $\sum_{k=0}^{n-1} \omega^k = (1-\omega^n)/(1-\omega) = (1-1)/(1-\omega) = 0$ (since $\omega \neq 1$ for $n \geq 2$). $\square$

(b) By Vieta's for $z^n - 1 = z^n + 0z^{n-1} + \cdots + 0z - 1$:
product of roots = $(-1)^n \cdot \text{(constant term)}/\text{(leading coefficient)} = (-1)^n \cdot (-1)/1 = (-1)^{n+1}$. $\square$

</details>

---

**4.** Use De Moivre's to derive $\cos(3\theta) = 4\cos^3\theta - 3\cos\theta$
by expanding $(\cos\theta+i\sin\theta)^3$ and equating real parts.

<details>
<summary>Derivation</summary>

$(\cos\theta+i\sin\theta)^3$:
$= \cos^3\theta + 3\cos^2\theta(i\sin\theta) + 3\cos\theta(i\sin\theta)^2 + (i\sin\theta)^3$
$= \cos^3\theta + 3i\cos^2\theta\sin\theta - 3\cos\theta\sin^2\theta - i\sin^3\theta$
$= (\cos^3\theta - 3\cos\theta\sin^2\theta) + i(3\cos^2\theta\sin\theta - \sin^3\theta)$

Real part: $\cos(3\theta) = \cos^3\theta - 3\cos\theta\sin^2\theta = \cos^3\theta - 3\cos\theta(1-\cos^2\theta)
= 4\cos^3\theta - 3\cos\theta$. $\square$

</details>

---

### Code Challenges

**Challenge 1 — $n$-th root finder**

```python
import cmath
import math

def nth_roots(w, n):
    """
    Find all n distinct n-th roots of complex number w.
    Returns list of n complex numbers:
      z_k = |w|^(1/n) * e^(i*(arg(w) + 2*pi*k)/n)
    for k = 0, 1, ..., n-1.
    If w == 0 and n > 0: return [0+0j].
    Raise ValueError if n <= 0.
    """
    pass  # your code here

def verify_roots(w, n, roots):
    """
    Given roots = nth_roots(w, n), verify:
    1. Each root z satisfies z^n == w (within 1e-8)
    2. All roots are distinct (pairwise distance > 1e-6)
    3. All roots have modulus |w|^(1/n) (within 1e-10)
    Return True if all checks pass.
    """
    pass  # your code here


# --- tests: do not modify ---
# Basic cases
roots_8 = nth_roots(8+0j, 3)
assert len(roots_8) == 3
assert verify_roots(8+0j, 3, roots_8)

roots_1 = nth_roots(1+0j, 4)
assert len(roots_1) == 4
assert verify_roots(1+0j, 4, roots_1)
# 4th roots of 1 should be 1, i, -1, -i
expected_4th = {1+0j, 0+1j, -1+0j, 0-1j}
found_4th    = {complex(round(z.real,6), round(z.imag,6)) for z in roots_1}
assert expected_4th == found_4th

# Square root of i
roots_i = nth_roots(1j, 2)
assert len(roots_i) == 2
assert verify_roots(1j, 2, roots_i)

# Zero
assert nth_roots(0+0j, 5) == [0+0j]

# ValueError
try:
    nth_roots(1+0j, 0)
    assert False
except ValueError:
    pass

# General
for w, n in [(2+2j, 3), (-8+0j, 3), (1+0j, 6), (0-4j, 4)]:
    roots = nth_roots(w, n)
    assert len(roots) == n
    assert verify_roots(w, n, roots)

print("✓ Challenge 1 passed!")
```

<details>
<summary>Hint</summary>

`nth_roots`: `if n <= 0: raise ValueError(...)`.
`if w == 0: return [0+0j]`.
`R = abs(w); phi = cmath.phase(w); r = R**(1/n)`.
`return [cmath.rect(r, (phi + 2*math.pi*k)/n) for k in range(n)]`.
`verify_roots`: for modulus check: `abs(abs(z) - abs(w)**(1/n)) < 1e-10`.
For distinctness: `all(abs(roots[i]-roots[j]) > 1e-6 for i in range(n) for j in range(i+1,n))`.

</details>

---

**Challenge 2 — Roots of unity and orthogonality**

```python
import cmath
import math

def roots_of_unity(n):
    """Return the n-th roots of unity: [omega^k for k=0..n-1] where omega=e^(2*pi*i/n)."""
    pass  # your code here

def unity_sum(n):
    """Return sum of all n-th roots of unity. Should be 0 for n>=2."""
    pass  # your code here

def orthogonality_check(n):
    """
    Verify the DFT orthogonality: sum_{k=0}^{n-1} omega^(m*k)
    Should be n if n divides m (i.e. m%n==0), else 0.
    Return dict: {m: computed_sum for m in range(2*n)}
    """
    pass  # your code here


# --- tests: do not modify ---
# Roots on unit circle
for n in [2, 3, 4, 5, 6, 8, 12]:
    roots = roots_of_unity(n)
    assert len(roots) == n
    assert all(abs(abs(z) - 1) < 1e-12 for z in roots), f"Not on unit circle for n={n}"
    # Each root z satisfies z^n = 1
    assert all(abs(z**n - 1) < 1e-10 for z in roots), f"z^n != 1 for n={n}"

# Sum = 0 for n >= 2
for n in [2, 3, 4, 5, 6, 8, 10]:
    s = unity_sum(n)
    assert abs(s) < 1e-10, f"Sum not zero for n={n}: {s}"

# Orthogonality
n = 6
orth = orthogonality_check(n)
for m, val in orth.items():
    if m % n == 0:
        assert abs(val - n) < 1e-8, f"Expected {n} for m={m}, got {val}"
    else:
        assert abs(val) < 1e-8, f"Expected 0 for m={m}, got {val}"

print("✓ Challenge 2 passed!")
for n in [3, 4, 5, 6]:
    s = unity_sum(n)
    print(f"  Sum of {n}-th roots of unity: {s:.2e}  (should be 0)")
```

<details>
<summary>Hint</summary>

`roots_of_unity`: `omega = cmath.exp(2j*math.pi/n)`; `return [omega**k for k in range(n)]`.
`unity_sum`: `return sum(roots_of_unity(n))`.
`orthogonality_check`: `omega = cmath.exp(2j*math.pi/n)`;
`return {m: sum(omega**(m*k) for k in range(n)) for m in range(2*n)}`.

</details>

---

**Challenge 3 — Naive DFT**

```python
import cmath
import math
import numpy as np

def dft(x):
    """
    Compute the Discrete Fourier Transform of a sequence x.
    X[k] = sum_{j=0}^{n-1} x[j] * omega^(-j*k), omega = e^(2*pi*i/n)
    
    x: list or array of complex (or real) numbers
    Returns: list of n complex numbers X[0..n-1]
    """
    pass  # your code here

def idft(X):
    """
    Compute the Inverse DFT: x[j] = (1/n) * sum_{k=0}^{n-1} X[k] * omega^(j*k)
    Returns list of n complex numbers.
    """
    pass  # your code here


# --- tests: do not modify ---
# DFT of [1,0,0,0] = [1,1,1,1]
X = dft([1,0,0,0])
assert all(abs(X[k]-1) < 1e-10 for k in range(4)), f"DFT([1,0,0,0]) failed: {X}"

# DFT of [1,1,1,1] = [4,0,0,0]
X2 = dft([1,1,1,1])
assert abs(X2[0]-4) < 1e-10 and all(abs(X2[k]) < 1e-10 for k in range(1,4))

# Round-trip DFT -> IDFT
x_orig = [1.5+0j, -0.5+0j, 2.0+0j, 0.8+0j]
x_rec  = idft(dft(x_orig))
assert all(abs(x_orig[j]-x_rec[j]) < 1e-12 for j in range(4))

# Match numpy FFT
for x_test in [[1,2,3,4], [1,-1,1,-1], [0,1,0,0]]:
    X_naive = dft(x_test)
    X_numpy = np.fft.fft(x_test)
    assert all(abs(X_naive[k]-X_numpy[k]) < 1e-10 for k in range(len(x_test))), \
           f"Mismatch for {x_test}"

# Linearity: DFT(a*x + b*y) = a*DFT(x) + b*DFT(y)
x1 = [1+0j, 0+1j, -1+0j, 0-1j]
x2 = [2+0j, 1+0j,  0+0j, 1+0j]
a, b = 2+1j, 0-3j
lhs = dft([a*x1[j]+b*x2[j] for j in range(4)])
rhs = [a*dft(x1)[k]+b*dft(x2)[k] for k in range(4)]
assert all(abs(lhs[k]-rhs[k]) < 1e-10 for k in range(4))

print("✓ Challenge 3 passed!")
print("  DFT([1,0,0,0]) =", [round(X[k].real,6) for k in range(4)], "(should be [1,1,1,1])")
```

<details>
<summary>Hint</summary>

`dft`: `n = len(x)`; `omega = cmath.exp(2j*math.pi/n)`.
`return [sum(x[j]*omega**(-j*k) for j in range(n)) for k in range(n)]`.
`idft`: same but `omega**(+j*k)` and multiply by `1/n`.

</details>

---

### Extension

**4. ★** A **primitive $n$-th root of unity** is a root $\omega$ such that
$\omega^k \neq 1$ for $k = 1, 2, \ldots, n-1$ (i.e., it has exact order $n$,
not a smaller divisor of $n$).

(a) For $n=6$: which roots $\omega^0, \ldots, \omega^5$ are primitive?
(Hint: $\omega^k$ is primitive iff $\gcd(k, n) = 1$.)
(b) The **Euler totient function** $\phi(n)$ counts integers in $\{1,\ldots,n\}$
coprime to $n$. Verify that the number of primitive $n$-th roots equals $\phi(n)$ for $n = 6, 8, 12$.

**5. ★** The **Fast Fourier Transform (FFT)** exploits the following splitting:

$$X[k] = \sum_{j=0}^{n-1} x[j]\omega^{-jk}
= \sum_{j=0}^{n/2-1} x[2j]\omega^{-2jk} + \omega^{-k}\sum_{j=0}^{n/2-1} x[2j+1]\omega^{-2jk}$$

where $\omega^2 = e^{2\pi i/(n/2)}$ is the $(n/2)$-th root.

Implement this Cooley-Tukey FFT recursively for $n = 2^m$:

```python
def fft(x):
    n = len(x)
    if n == 1: return [x[0]]
    omega = cmath.exp(-2j * cmath.pi / n)
    # split into even and odd indexed elements
    even = fft(x[0::2])   # x[0], x[2], x[4], ...
    odd  = fft(x[1::2])   # x[1], x[3], x[5], ...
    T    = [omega**k * odd[k] for k in range(n//2)]
    return [even[k] + T[k] for k in range(n//2)] + \
           [even[k] - T[k] for k in range(n//2)]
```

Verify this gives the same output as `dft` (and numpy's `np.fft.fft`) for
$n = 8, 16, 32$. Then time both for $n = 1024$ and compare speeds.
