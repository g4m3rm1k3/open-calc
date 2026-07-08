# Stage 1, Lesson 1.16 — Euler's Formula: $e^{i\theta} = \cos\theta + i\sin\theta$
**Threads:** Math · Physics · CS  
**Estimated time:** 65–80 minutes

---

## What This Lesson Is About

Euler's formula is one of the most remarkable equations in mathematics:

$$e^{i\theta} = \cos\theta + i\sin\theta$$

It connects three completely different areas of mathematics — exponentials
($e$, Lesson 1.7), trigonometry ($\cos, \sin$), and complex numbers ($i$,
Lesson 1.12) — in a single equation that is not only beautiful but
profoundly useful. At $\theta = \pi$ it gives Euler's identity $e^{i\pi}+1=0$,
linking the five most important constants in mathematics.

This lesson derives the formula rigorously using Taylor series (with the
derivation at the right level of detail for this stage), verifies it
numerically and geometrically, and then exploits it: the exponential form
$z = re^{i\theta}$ makes multiplication, division, and powers almost trivial.
Every oscillation in physics and engineering — sound waves, AC currents,
vibrating strings, quantum wavefunctions — is written in the form $e^{i\omega t}$
because of this formula.

---

## Historical Context

Leonhard Euler stated $e^{i\theta} = \cos\theta + i\sin\theta$ in his
1748 treatise *Introductio in Analysin Infinitorum*. He derived it by
extending the exponential function to complex arguments using its Taylor
series and comparing the resulting series with those for $\cos$ and $\sin$.
The special case $e^{i\pi} = -1$ (rearranged as $e^{i\pi}+1=0$) was
known to Johann Bernoulli before Euler and appears implicitly in Roger
Cotes's 1714 formula $ix = \ln(\cos x + i\sin x)$ — which is exactly
Euler's formula rewritten with $\ln$. The physicist Richard Feynman
called Euler's identity "the most remarkable formula in mathematics" —
a view shared by most working physicists and engineers.

---

## What You Need To Know First

- **The number $e$** and its defining property $(e^x)' = e^x$ (Lesson 1.7).
- **Complex numbers** $z = a + bi$, modulus $|z|$, argument $\arg(z)$ (Lessons 1.12–1.15).
- **Polar form** $z = r(\cos\theta + i\sin\theta)$ (Lesson 1.15).
- **Taylor series** — this lesson uses them for the derivation. The key idea is that
  for any function $f$: $f(x) = f(0) + f'(0)x + \frac{f''(0)}{2!}x^2 + \cdots$

---

## The Lesson

### The Taylor Series Derivation

A Taylor series expresses a function as an infinite sum of polynomial terms.
For $e^x$:
$$e^x = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \frac{x^4}{4!} + \cdots = \sum_{k=0}^\infty \frac{x^k}{k!}$$

The crucial step: **assume this formula holds when $x = i\theta$** (replacing the real
variable $x$ with a purely imaginary one).

$$e^{i\theta} = \sum_{k=0}^\infty \frac{(i\theta)^k}{k!}
= 1 + i\theta + \frac{(i\theta)^2}{2!} + \frac{(i\theta)^3}{3!} + \frac{(i\theta)^4}{4!} + \cdots$$

Now evaluate each power of $i$ using $i^2=-1$ (period-4 cycle):

$(i\theta)^0 = 1$
$(i\theta)^1 = i\theta$
$(i\theta)^2 = i^2\theta^2 = -\theta^2$
$(i\theta)^3 = i^3\theta^3 = -i\theta^3$
$(i\theta)^4 = i^4\theta^4 = \theta^4$
$(i\theta)^5 = i^5\theta^5 = i\theta^5$
$(i\theta)^6 = -\theta^6$

Substituting:

$$e^{i\theta} = 1 + i\theta - \frac{\theta^2}{2!} - \frac{i\theta^3}{3!} + \frac{\theta^4}{4!} + \frac{i\theta^5}{5!} - \cdots$$

Separate real and imaginary parts:

**Real part** (terms without $i$):
$$1 - \frac{\theta^2}{2!} + \frac{\theta^4}{4!} - \frac{\theta^6}{6!} + \cdots = \cos\theta$$

**Imaginary part** (coefficient of $i$):
$$\theta - \frac{\theta^3}{3!} + \frac{\theta^5}{5!} - \cdots = \sin\theta$$

Therefore:

$$\boxed{e^{i\theta} = \cos\theta + i\sin\theta}$$

**Note on rigor:** the step of substituting $i\theta$ into the Taylor series
requires verifying that the series converges for complex arguments, which it
does — the exponential series converges absolutely for all complex inputs.
This is proved in a complex analysis course; we assume it here.

**The key observation:** the **same series** that defines $e^x$ for real $x$
automatically produces $\cos$ and $\sin$ when the input is imaginary. These
three functions are not independent — they are different facets of the complex
exponential.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

def euler_partial(theta, n_terms):
    """
    Approximate e^(i*theta) using the first n_terms of the Taylor series.
    e^(itheta) = sum_{k=0}^{n_terms-1} (i*theta)^k / k!
    Returns a Python complex number.
    """
    total    = 0 + 0j
    i_power  = 1 + 0j     # tracks (i*theta)^k
    factorial = 1          # tracks k!
    for k in range(n_terms):
        if k > 0:
            i_power  *= 1j * theta   # multiply by i*theta each step
            factorial *= k           # k! = k * (k-1)!
        total += i_power / factorial
    return total

# Check convergence
theta = math.pi / 4   # 45 degrees
exact = math.cos(theta) + 1j * math.sin(theta)   # 1/√2 + i/√2

print(f"Euler's formula convergence for θ = π/4 ({math.degrees(theta):.1f}°):")
print(f"Exact: {exact}\n")
print(f"{'Terms':>6} | {'Approximation':>30} | {'Error':>15}")
print("-" * 58)
for n in [1, 2, 3, 5, 8, 12, 20]:
    approx = euler_partial(theta, n)
    error  = abs(approx - exact)
    print(f"{n:>6} | {str(approx):>30} | {error:>15.2e}")

print()

# Visualise: partial sums trace a spiral to the answer
theta_demo = 1.5   # radians
partial_sums = [euler_partial(theta_demo, k) for k in range(1, 25)]
exact_demo = math.cos(theta_demo) + 1j*math.sin(theta_demo)

fig, ax = plt.subplots(figsize=(9, 9))

# Unit circle
theta_circ = np.linspace(0, 2*np.pi, 300)
ax.plot(np.cos(theta_circ), np.sin(theta_circ), color='#ddd', lw=2, zorder=1)

# Partial sums path
xs = [s.real for s in partial_sums]
ys = [s.imag for s in partial_sums]
ax.plot(xs, ys, '-o', color='#2980b9', lw=1.5, markersize=6, zorder=3,
        label='Partial sums of Taylor series')
for k, s in enumerate(partial_sums[:8], 1):
    ax.annotate(f'n={k}', xy=(s.real, s.imag), xytext=(s.real+0.03, s.imag+0.04),
                fontsize=7.5, color='#2980b9')

# Exact value
ax.scatter([exact_demo.real], [exact_demo.imag], s=150, color='#e74c3c', zorder=6,
           label=f'$e^{{i·1.5}} = {exact_demo:.4f}$')
ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal')
ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 2.5)
ax.set_xlabel('Real'); ax.set_ylabel('Imaginary')
ax.set_title("Taylor series for $e^{i\\theta}$: partial sums spiral to $e^{i\\theta}$ on the unit circle\n"
             "$\\theta = 1.5$ rad", fontsize=11)
ax.legend(fontsize=9)
ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `euler_partial` accumulates the Taylor sum term by term.
Rather than computing `(1j*theta)**k / math.factorial(k)` from scratch
each iteration (which is slow and risks precision loss for large $k$),
we maintain running variables: `i_power *= 1j * theta` multiplies by $i\theta$
each step (computing $(i\theta)^k$ incrementally), and `factorial *= k`
updates $k!$ without recalculation. The partial sums start near $(1, 0)$
(the $n=1$ approximation $e^{i\theta} \approx 1$) and spiral toward the
exact point on the unit circle as more terms are added.

---

### The Exponential Form of a Complex Number

Euler's formula rewrites the polar form compactly. Recall:

$$z = r(\cos\theta + i\sin\theta)$$

By Euler's formula, $\cos\theta + i\sin\theta = e^{i\theta}$, so:

$$\boxed{z = r e^{i\theta}}$$

This is the **exponential form** of a complex number. It is the most
compact and most useful representation for computation.

**Notation:** in engineering, $r e^{j\theta}$ (using $j$ for $i$) is standard.

**Key special values:**

| $\theta$ | $e^{i\theta}$ | Cartesian |
|----------|--------------|-----------|
| $0$ | $e^{0} = 1$ | $1 + 0i$ |
| $\pi/6$ | $e^{i\pi/6}$ | $\frac{\sqrt{3}}{2} + \frac{1}{2}i$ |
| $\pi/4$ | $e^{i\pi/4}$ | $\frac{1}{\sqrt{2}} + \frac{i}{\sqrt{2}}$ |
| $\pi/3$ | $e^{i\pi/3}$ | $\frac{1}{2} + \frac{\sqrt{3}}{2}i$ |
| $\pi/2$ | $e^{i\pi/2} = i$ | $0 + i$ |
| $\pi$ | $e^{i\pi} = -1$ | $-1 + 0i$ |
| $3\pi/2$ | $e^{3i\pi/2} = -i$ | $0 - i$ |
| $2\pi$ | $e^{2i\pi} = 1$ | $1 + 0i$ |

**Periodicity:** $e^{i(\theta + 2\pi)} = e^{i\theta}$ — the complex exponential
is periodic with period $2\pi$ (unlike the real exponential, which is not periodic).

**Euler's identity:** setting $\theta = \pi$:

$$\boxed{e^{i\pi} + 1 = 0}$$

This links $e$ (natural exponential base), $i$ (imaginary unit), $\pi$
(ratio of circumference to diameter), $1$ (multiplicative identity), and
$0$ (additive identity) in one relation.

---

### Arithmetic is Now Trivial

**Multiplication:**
$$z_1 z_2 = r_1 e^{i\theta_1} \cdot r_2 e^{i\theta_2} = r_1 r_2 e^{i(\theta_1+\theta_2)}$$

Multiply moduli, add exponents — exactly like real exponentials.

**Division:**
$$\frac{z_1}{z_2} = \frac{r_1 e^{i\theta_1}}{r_2 e^{i\theta_2}} = \frac{r_1}{r_2} e^{i(\theta_1-\theta_2)}$$

**Powers:**
$$z^n = (r e^{i\theta})^n = r^n e^{in\theta}$$

**Conjugate:**
$$\bar{z} = r e^{-i\theta}$$
Because $\overline{e^{i\theta}} = \overline{\cos\theta + i\sin\theta} = \cos\theta - i\sin\theta = e^{-i\theta}$.

**Inverse:**
$$z^{-1} = \frac{1}{r} e^{-i\theta}$$

**Hand-worked example 1 — multiplication:**

$(2e^{i\pi/4})(3e^{i\pi/6}) = 6e^{i(\pi/4+\pi/6)} = 6e^{i5\pi/12}$.

**Hand-worked example 2 — powers:**

$(1+i)^{10}$: $1+i = \sqrt{2}\,e^{i\pi/4}$, so
$(1+i)^{10} = (\sqrt{2})^{10} e^{i10\pi/4} = 32 e^{i5\pi/2} = 32 e^{i\pi/2} = 32i$.
(Using $5\pi/2 = 2\pi + \pi/2$.)

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

# Verify key special values
print("Key values of e^(i*theta):")
special = [
    (0,           "0",      1+0j),
    (math.pi/6,   "π/6",    math.sqrt(3)/2 + 0.5j),
    (math.pi/4,   "π/4",    1/math.sqrt(2) + 1j/math.sqrt(2)),
    (math.pi/3,   "π/3",    0.5 + math.sqrt(3)/2*1j),
    (math.pi/2,   "π/2",    0+1j),
    (math.pi,     "π",      -1+0j),
    (3*math.pi/2, "3π/2",   0-1j),
    (2*math.pi,   "2π",     1+0j),
]
print(f"{'θ':>10} | {'e^(iθ) computed':>30} | {'Expected':>20} | Match")
print("-" * 80)
for theta, label, expected in special:
    computed = cmath.exp(1j * theta)    # Python's cmath.exp handles complex input
    ok = abs(computed - expected) < 1e-14
    print(f"{label:>10} | {str(computed):>30} | {str(expected):>20} | {'✓' if ok else '✗'}")

# Euler's identity: e^(i*pi) + 1 = 0
euler_identity_value = cmath.exp(1j * math.pi) + 1
print(f"\nEuler's identity: e^(iπ) + 1 = {euler_identity_value}")
print(f"  |error from 0|: {abs(euler_identity_value):.2e}")

# Demonstrate arithmetic in exponential form
print("\nExponential-form arithmetic:")
z1 = cmath.rect(2, math.pi/4)   # 2*e^(i*pi/4)
z2 = cmath.rect(3, math.pi/6)   # 3*e^(i*pi/6)

product_exp = cmath.rect(2*3, math.pi/4 + math.pi/6)
print(f"  z1 = 2·e^(iπ/4) = {z1:.4f}")
print(f"  z2 = 3·e^(iπ/6) = {z2:.4f}")
print(f"  z1*z2 via exp form: 6·e^(i·5π/12) = {product_exp:.4f}")
print(f"  z1*z2 direct:                      = {z1*z2:.4f}")
print(f"  Match: {abs(product_exp - z1*z2) < 1e-12}")
print()

# Powers
z = 1 + 1j   # sqrt(2) * e^(i*pi/4)
print(f"  (1+i)^10 via De Moivre: {cmath.rect(math.sqrt(2)**10, 10*math.pi/4):.4f}")
print(f"  (1+i)^10 direct:        {(1+1j)**10:.4f}")
print(f"  Both should be 32i = {32j}")

# Visualise: unit circle parametrised by theta
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Left: e^(i*theta) traces the unit circle
theta_vals = np.linspace(0, 2*np.pi, 500)
z_vals = np.exp(1j * theta_vals)   # element-wise complex exp via numpy

ax = axes[0]
ax.plot(z_vals.real, z_vals.imag, color='#2980b9', lw=3, label='$e^{i\\theta}$ unit circle')

# Mark specific points
for theta, label in [(0,'1'), (math.pi/4,'e^{iπ/4}'), (math.pi/2,'i'),
                      (math.pi,'−1'), (3*math.pi/2,'−i')]:
    z = np.exp(1j*theta)
    ax.scatter([z.real], [z.imag], s=100, color='#e74c3c', zorder=5)
    ax.annotate(f'$θ={label}$' if 'π' in label else f'θ={label}°: {z:.2f}',
                xy=(z.real, z.imag), xytext=(z.real*1.2, z.imag*1.2),
                fontsize=8.5, color='#c0392b', ha='center')

ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal')
ax.set_xlim(-1.6, 1.6); ax.set_ylim(-1.6, 1.6)
ax.set_xlabel('Re'); ax.set_ylabel('Im')
ax.set_title('$e^{i\\theta}$ traces the unit circle as $\\theta$ varies\n'
             'cos θ = real part, sin θ = imaginary part', fontsize=10)
ax.grid(True, alpha=0.3)
ax.legend(fontsize=9)

# Right: real and imaginary parts of e^(i*theta)
theta2 = np.linspace(-2*np.pi, 2*np.pi, 400)
ax = axes[1]
ax.plot(theta2, np.cos(theta2), color='#2980b9', lw=2.5, label='$\\cos\\theta = \\mathrm{Re}(e^{i\\theta})$')
ax.plot(theta2, np.sin(theta2), color='#e74c3c', lw=2.5, label='$\\sin\\theta = \\mathrm{Im}(e^{i\\theta})$')
# For visual check: overlay real/imag from complex exp
z_check = np.exp(1j * theta2)
ax.plot(theta2, z_check.real, color='#2980b9', lw=1, ls='--', alpha=0.6, label='Re via cmath (should match)')
ax.plot(theta2, z_check.imag, color='#e74c3c', lw=1, ls='--', alpha=0.6, label='Im via cmath (should match)')
ax.axhline(0, color='#333', lw=1)
ax.set_xlabel('θ (radians)')
ax.set_ylabel('Value')
ax.set_title('Real and imaginary parts of $e^{i\\theta}$\n'
             'are exactly $\\cos\\theta$ and $\\sin\\theta$', fontsize=10)
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3)

plt.suptitle("Euler's formula: $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$", fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `cmath.exp(1j * theta)` computes $e^{i\theta}$ for a
scalar. `np.exp(1j * theta_vals)` applies the complex exponential
**element-wise** to the array `theta_vals` — numpy's `exp` understands
complex arrays. `z_vals.real` and `z_vals.imag` extract the real and
imaginary parts element-wise from the complex array. The right panel
confirms visually that $\text{Re}(e^{i\theta}) = \cos\theta$ and
$\text{Im}(e^{i\theta}) = \sin\theta$ for all $\theta$.

---

### Inverse Euler: Expressing $\cos$ and $\sin$ in Terms of $e^{i\theta}$

From Euler's formula and its conjugate $e^{-i\theta} = \cos\theta - i\sin\theta$:

**Adding:**
$$e^{i\theta} + e^{-i\theta} = 2\cos\theta \implies \boxed{\cos\theta = \frac{e^{i\theta}+e^{-i\theta}}{2}}$$

**Subtracting:**
$$e^{i\theta} - e^{-i\theta} = 2i\sin\theta \implies \boxed{\sin\theta = \frac{e^{i\theta}-e^{-i\theta}}{2i}}$$

These are the **exponential definitions of $\cos$ and $\sin$**. They are
not alternative formulas — they are the true definitions from the viewpoint
of complex analysis. They also show that $\cos$ and $\sin$ are related to
the **hyperbolic functions**: $\cosh(x) = (e^x+e^{-x})/2$ and $\sinh(x) = (e^x-e^{-x})/2$,
with the identity $\cos(i x) = \cosh(x)$ and $\sin(ix) = i\sinh(x)$.

**Application — proving trig identities:** these exponential forms make
trig identities almost mechanical.

**Example:** derive $\cos(2\theta) = \cos^2\theta - \sin^2\theta$.

$$\cos(2\theta) = \frac{e^{2i\theta}+e^{-2i\theta}}{2} = \frac{(e^{i\theta})^2+(e^{-i\theta})^2}{2}$$

$$\cos^2\theta - \sin^2\theta
= \left(\frac{e^{i\theta}+e^{-i\theta}}{2}\right)^2 - \left(\frac{e^{i\theta}-e^{-i\theta}}{2i}\right)^2$$

$$= \frac{e^{2i\theta}+2+e^{-2i\theta}}{4} - \frac{e^{2i\theta}-2+e^{-2i\theta}}{-4}$$

$$= \frac{e^{2i\theta}+2+e^{-2i\theta}}{4} + \frac{e^{2i\theta}-2+e^{-2i\theta}}{4}$$

$$= \frac{2e^{2i\theta}+2e^{-2i\theta}}{4} = \frac{e^{2i\theta}+e^{-2i\theta}}{2} = \cos(2\theta) \checkmark$$

```python
import math
import cmath
import numpy as np

# Verify inverse Euler formulas numerically
print("Inverse Euler formulas: cos θ = (e^(iθ)+e^(-iθ))/2, sin θ = (e^(iθ)-e^(-iθ))/(2i)")
print()
theta_tests = [0, math.pi/6, math.pi/4, math.pi/3, math.pi/2, math.pi]
print(f"{'θ (°)':>8} | {'cos from formula':>18} | {'math.cos':>12} | {'sin from formula':>18} | {'math.sin':>12}")
print("-" * 78)
for theta in theta_tests:
    eit  = cmath.exp( 1j * theta)
    e_it = cmath.exp(-1j * theta)
    cos_euler = ((eit + e_it) / 2).real        # should be exactly real; take .real to strip tiny imag part
    sin_euler = ((eit - e_it) / (2j)).real
    cos_math  = math.cos(theta)
    sin_math  = math.sin(theta)
    deg = math.degrees(theta)
    ok_c = abs(cos_euler - cos_math) < 1e-12
    ok_s = abs(sin_euler - sin_math) < 1e-12
    print(f"{deg:>8.1f} | {cos_euler:>18.10f} | {cos_math:>12.10f} | {sin_euler:>18.10f} | {sin_math:>12.10f}  {'✓' if ok_c and ok_s else '✗'}")

print()

# Verify double angle identity numerically
print("Double angle identity: cos(2θ) = cos²θ - sin²θ")
for theta in [0.3, 0.7, 1.2, math.pi/5]:
    lhs = math.cos(2*theta)
    rhs = math.cos(theta)**2 - math.sin(theta)**2
    ok  = abs(lhs - rhs) < 1e-14
    print(f"  θ={theta:.2f}: cos(2θ)={lhs:.8f}, cos²θ-sin²θ={rhs:.8f}  {'✓' if ok else '✗'}")

print()

# Connection to hyperbolic functions
print("Connections: cos(ix) = cosh(x), sin(ix) = i*sinh(x)")
for x in [0.5, 1.0, 1.5]:
    cos_ix  = cmath.cos(1j*x).real   # cos(ix) should be real = cosh(x)
    cosh_x  = math.cosh(x)
    sin_ix  = cmath.sin(1j*x) / 1j   # sin(ix)/i should be real = sinh(x)
    sinh_x  = math.sinh(x)
    print(f"  x={x:.1f}: cos(ix)={cos_ix:.6f}, cosh(x)={cosh_x:.6f}  match={abs(cos_ix-cosh_x)<1e-12}")
    print(f"          sin(ix)/i={sin_ix.real:.6f}, sinh(x)={sinh_x:.6f}  match={abs(sin_ix.real-sinh_x)<1e-12}")
```

**Walkthrough:** `cmath.exp(1j*theta)` and `cmath.exp(-1j*theta)` give
$e^{i\theta}$ and $e^{-i\theta}$. `(eit + e_it)/2` computes
$(\cos\theta + i\sin\theta + \cos\theta - i\sin\theta)/2 = \cos\theta$;
calling `.real` strips the numerically-tiny imaginary part caused by
floating-point rounding. `2j` is $2i$ in Python, so dividing by `2j`
implements division by $2i$. `cmath.cos(1j*x)` and `cmath.sin(1j*x)`
compute cosine and sine at a purely imaginary argument — Python's
`cmath` module handles complex arguments.

---

### Physical Interpretation: Oscillations and Waves

The formula $e^{i\omega t} = \cos(\omega t) + i\sin(\omega t)$ means
that the **complex exponential is a rotating vector in the complex plane**.
As $t$ increases, the angle $\omega t$ increases, and the point $e^{i\omega t}$
traces the unit circle at angular frequency $\omega$ radians per second.

**Period:** $e^{i\omega t}$ has period $T = 2\pi/\omega$.

**Real oscillation:** a real sinusoidal signal $\cos(\omega t)$ is simply
the **real part** of $e^{i\omega t}$:
$$\cos(\omega t) = \text{Re}(e^{i\omega t})$$

This is why engineers write voltages and currents as complex exponentials:
the real AC signal is the real part. The imaginary part carries phase information.

**Amplitude and phase:** a more general oscillation $A\cos(\omega t + \phi)$
is the real part of $Ae^{i(\omega t+\phi)} = Ae^{i\phi} e^{i\omega t}$.
The **phasor** $Ae^{i\phi}$ encodes amplitude $A$ and phase shift $\phi$
as a single complex number.

**Physical lens:** a mass-spring system with natural frequency $\omega_0$
has displacement $x(t) = \text{Re}(A e^{i\omega_0 t})$. Quantum mechanics
describes particle states with $\psi(x,t) = e^{i(kx-\omega t)}$ — the
wavefunction is a complex exponential.

```python
import math
import numpy as np
import matplotlib.pyplot as plt

omega = 2 * math.pi          # 1 Hz (angular frequency ω = 2π)
t     = np.linspace(0, 2, 400)   # 0 to 2 seconds

# Complex oscillation
z = np.exp(1j * omega * t)   # e^(iωt) on unit circle

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Top left: unit circle animation (first cycle)
cycle = int(len(t) / 2)   # one full cycle
ax = axes[0, 0]
ax.plot(z.real, z.imag, color='#ddd', lw=2)   # full circle
# Colour by time: lighter = earlier
for k in range(0, cycle, 10):
    alpha = 0.3 + 0.7*(k/cycle)
    ax.plot(z[k].real, z[k].imag, 'o', color='#2980b9', alpha=alpha, markersize=5)
# Mark current position at t=0.5
t_pos = 0.5
z_pos = np.exp(1j * omega * t_pos)
ax.scatter([z_pos.real], [z_pos.imag], s=120, color='#e74c3c', zorder=6,
           label=f't={t_pos}s: z={z_pos:.2f}')
ax.annotate('', xy=(z_pos.real, z_pos.imag), xytext=(0,0),
            arrowprops=dict(arrowstyle='->', color='#e74c3c', lw=2))
ax.axhline(0, color='#333', lw=1); ax.axvline(0, color='#333', lw=1)
ax.set_aspect('equal'); ax.set_xlim(-1.5, 1.5); ax.set_ylim(-1.5, 1.5)
ax.set_xlabel('Re'); ax.set_ylabel('Im')
ax.set_title('$e^{i\\omega t}$ traces unit circle\nas $t$ increases', fontsize=10)
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3)

# Top right: real part = cos, imag part = sin
ax = axes[0, 1]
ax.plot(t, z.real, color='#2980b9', lw=2.5, label='$\\cos(\\omega t) = \\mathrm{Re}(e^{i\\omega t})$')
ax.plot(t, z.imag, color='#e74c3c', lw=2.5, label='$\\sin(\\omega t) = \\mathrm{Im}(e^{i\\omega t})$')
ax.axhline(0, color='#333', lw=1)
ax.set_xlabel('Time $t$ (s)')
ax.set_ylabel('Value')
ax.set_title('Real oscillation from complex exponential', fontsize=10)
ax.legend(fontsize=9)
ax.grid(True, alpha=0.3)

# Bottom left: phasors with different amplitudes and phases
ax = axes[1, 0]
phasors = [
    (1.0,  0,           'A=1, φ=0°'),
    (0.7,  math.pi/4,   'A=0.7, φ=45°'),
    (1.3, -math.pi/3,   'A=1.3, φ=-60°'),
]
for A, phi, label in phasors:
    phasor = A * np.exp(1j * phi)
    signal = np.real(phasor * np.exp(1j * omega * t))   # A*cos(omega*t + phi)
    ax.plot(t, signal, lw=2, label=label)
ax.axhline(0, color='#333', lw=1)
ax.set_xlabel('Time $t$ (s)')
ax.set_ylabel('$A\\cos(\\omega t + \\phi)$')
ax.set_title('Phasors: $A e^{i\\phi}$ encodes amplitude $A$ and phase $\\phi$', fontsize=10)
ax.legend(fontsize=8)
ax.grid(True, alpha=0.3)

# Bottom right: sum of phasors = sum of cosines
ax = axes[1, 1]
sum_phasor = sum(A * np.exp(1j*phi) for A, phi, _ in phasors)
individual_sum = sum(np.real(A*np.exp(1j*phi)*np.exp(1j*omega*t)) for A,phi,_ in phasors)
combined = np.real(sum_phasor * np.exp(1j * omega * t))
ax.plot(t, individual_sum, color='#bbb', lw=3, label='Sum (explicit)', zorder=3)
ax.plot(t, combined, color='#e74c3c', lw=2, ls='--', label='Sum (phasor method)', zorder=4)
ax.axhline(0, color='#333', lw=1)
ax.set_xlabel('Time $t$ (s)')
ax.set_ylabel('Signal')
ax.set_title('Sum of phasors: add complex numbers,\nthen take real part', fontsize=10)
ax.legend(fontsize=9)
ax.grid(True, alpha=0.3)

plt.suptitle("Euler's formula and oscillations: $e^{i\\omega t} = \\cos\\omega t + i\\sin\\omega t$",
             fontsize=12)
plt.tight_layout(); plt.show()
```

**Walkthrough:** `np.exp(1j * omega * t)` evaluates $e^{i\omega t}$ at
every point in the array `t` simultaneously — numpy's complex exponential
is fully vectorised. `z.real` and `z.imag` extract the two component
signals. `np.real(phasor * np.exp(1j*omega*t))` first forms the product
$Ae^{i\phi} \cdot e^{i\omega t} = Ae^{i(\omega t+\phi)}$ as a complex
array, then takes the real part to get $A\cos(\omega t+\phi)$. The bottom-right
panel shows that summing phasors (complex numbers) and then taking the
real part gives the same result as summing each cosine individually —
this is the phasor addition principle used in AC circuit analysis.

---

## Connect the Pieces

**What this lesson built on:** the number $e$ (Lesson 1.7), complex
numbers and polar form (Lessons 1.12–1.15). The Taylor series for $e^x$
was introduced informally in Lesson 1.7 as $e^x = \sum x^k/k!$; here
it is used for a complex argument.

**What this lesson makes possible:** Lesson 1.17 (De Moivre + roots of
unity — now trivially derived from $e^{i\theta}$). Stage 3 (Fourier
series: $f(t) = \sum c_n e^{in\omega_0 t}$, every Fourier component is
a complex exponential). Signal processing, control theory, quantum mechanics.

---

## Summary

$$e^{i\theta} = \cos\theta + i\sin\theta \qquad \text{(Euler's formula)}$$
$$e^{i\pi} + 1 = 0 \qquad \text{(Euler's identity)}$$
$$z = r e^{i\theta} \qquad \text{(exponential form)}$$
$$z_1 z_2 = r_1 r_2 e^{i(\theta_1+\theta_2)}; \quad z^n = r^n e^{in\theta}$$
$$\cos\theta = \frac{e^{i\theta}+e^{-i\theta}}{2}; \qquad \sin\theta = \frac{e^{i\theta}-e^{-i\theta}}{2i}$$

**New Python:**
- `cmath.exp(1j * theta)` — complex exponential $e^{i\theta}$
- `np.exp(1j * t_array)` — vectorised for arrays
- `z.real`, `z.imag` on numpy arrays — component extraction

---

## Problems

### Math

**1.** Convert to exponential form $re^{i\theta}$:
(a) $1 + i$ (b) $-4$ (c) $-1 - \sqrt{3}\,i$ (d) $2i$

<details>
<summary>Answers</summary>

(a) $r=\sqrt{2}$, $\theta=\pi/4$: $z=\sqrt{2}\,e^{i\pi/4}$.
(b) $r=4$, $\theta=\pi$: $z=4e^{i\pi}$.
(c) $r=2$, $\theta=-2\pi/3$: $z=2e^{-2i\pi/3}$.
(d) $r=2$, $\theta=\pi/2$: $z=2e^{i\pi/2}$.

</details>

---

**2.** Use Euler's formula to prove the trig identities:

(a) $\cos^2\theta + \sin^2\theta = 1$

(b) $\sin(2\theta) = 2\sin\theta\cos\theta$

(c) $\cos\!\left(\theta + \frac{\pi}{2}\right) = -\sin\theta$

<details>
<summary>Proofs</summary>

(a) $|e^{i\theta}|^2 = e^{i\theta} \cdot e^{-i\theta} = e^0 = 1$.
Also $|e^{i\theta}|^2 = |\cos\theta+i\sin\theta|^2 = \cos^2\theta+\sin^2\theta$.
So $\cos^2\theta+\sin^2\theta=1$. $\square$

(b) $e^{2i\theta} = \cos2\theta + i\sin2\theta$.
Also $e^{2i\theta} = (e^{i\theta})^2 = (\cos\theta+i\sin\theta)^2 = (\cos^2\theta-\sin^2\theta)+2i\sin\theta\cos\theta$.
Equating imaginary parts: $\sin2\theta = 2\sin\theta\cos\theta$. $\square$

(c) $e^{i(\theta+\pi/2)} = e^{i\theta}\cdot e^{i\pi/2} = (\cos\theta+i\sin\theta)(i) = i\cos\theta - \sin\theta$.
Real part: $\cos(\theta+\pi/2) = -\sin\theta$. $\square$

</details>

---

**3.** Let $z = e^{i\theta}$. Show that $\frac{1}{z} = \bar{z}$ and
use this to prove $|\cos\theta| \leq 1$ and $|\sin\theta| \leq 1$.

<details>
<summary>Proof</summary>

$e^{i\theta} \cdot e^{-i\theta} = e^0 = 1$, so $1/z = e^{-i\theta} = \cos\theta - i\sin\theta = \bar{z}$.

$\cos\theta = \text{Re}(e^{i\theta})$. For any complex $w$: $|\text{Re}(w)| \leq |w|$.
So $|\cos\theta| \leq |e^{i\theta}| = 1$. Similarly $|\sin\theta| = |\text{Im}(e^{i\theta})| \leq 1$. $\square$

</details>

---

**4.** Compute $(1+i)^{20}$ using Euler's formula. Show all steps.

<details>
<summary>Answer</summary>

$1+i = \sqrt{2}\,e^{i\pi/4}$.
$(1+i)^{20} = (\sqrt{2})^{20} e^{i\cdot 20\pi/4} = 2^{10} e^{5i\pi} = 1024 e^{i\pi} = 1024(-1) = -1024$.

</details>

---

### Code Challenges

**Challenge 1 — Euler's formula from scratch**

```python
import math

def euler_exp(theta, n_terms=50):
    """
    Compute e^(i*theta) using the Taylor series with n_terms terms.
    Do NOT use cmath.exp or any built-in complex exponential.
    
    e^(i*theta) = sum_{k=0}^{n_terms-1} (i*theta)^k / k!
    Use incremental computation:
      - i_power starts at 1 and is multiplied by (1j*theta) each step
      - factorial starts at 1 and is multiplied by k each step
    Returns a Python complex number.
    """
    pass  # your code here

def cos_euler(theta, n_terms=50):
    """Compute cos(theta) from Euler: Re(e^(i*theta)). Use euler_exp."""
    pass  # your code here

def sin_euler(theta, n_terms=50):
    """Compute sin(theta) from Euler: Im(e^(i*theta)). Use euler_exp."""
    pass  # your code here


# --- tests: do not modify ---
# Verify against math module
for theta in [0, math.pi/6, math.pi/4, math.pi/3, math.pi/2,
              math.pi, 3*math.pi/2, 2*math.pi, 0.1, 1.7, -0.8]:
    e_computed = euler_exp(theta)
    e_expected = math.cos(theta) + 1j*math.sin(theta)
    assert abs(e_computed - e_expected) < 1e-12, f"Failed for theta={theta}: {e_computed} vs {e_expected}"

# cos and sin
for theta in [0, math.pi/6, math.pi/4, math.pi/2, math.pi, 2.5]:
    assert abs(cos_euler(theta) - math.cos(theta)) < 1e-12
    assert abs(sin_euler(theta) - math.sin(theta)) < 1e-12

# Euler's identity
euler_id = euler_exp(math.pi)   # should be -1+0i
assert abs(euler_id + 1) < 1e-12, f"Euler identity failed: {euler_id}"

# Pythagorean identity
for theta in [0.3, 0.7, 1.5, math.pi/3]:
    c, s = cos_euler(theta), sin_euler(theta)
    assert abs(c**2 + s**2 - 1) < 1e-12

print("✓ Challenge 1 passed!")
print(f"  e^(iπ) = {euler_exp(math.pi):.10f}  (should be -1+0i)")
print(f"  e^(iπ/2) = {euler_exp(math.pi/2):.10f}  (should be 0+1i = i)")
```

<details>
<summary>Hint</summary>

```python
total     = 0 + 0j
i_power   = 1 + 0j    # (i*theta)^0 = 1
factorial = 1
for k in range(n_terms):
    if k > 0:
        i_power   *= (1j * theta)
        factorial *= k
    total += i_power / factorial
return total
```

</details>

---

**Challenge 2 — Trig identities via Euler**

```python
import math
import cmath

def double_angle_cos(theta):
    """
    Compute cos(2*theta) using Euler's formula:
    cos(2θ) = Re(e^(2iθ)) = Re((e^(iθ))^2)
    """
    pass  # your code here

def sum_to_product(theta1, theta2):
    """
    Use Euler's formula to compute cos(theta1) + cos(theta2).
    The result should equal 2*cos((theta1+theta2)/2)*cos((theta1-theta2)/2).
    
    Method: write each cosine as Re(e^(i*theta)), sum, and simplify
    to extract the product form.
    
    Return (value, product_formula_value) for verification.
    """
    pass  # your code here

def verify_pythagorean(theta):
    """
    Verify sin²θ + cos²θ = 1 using:
    |e^(iθ)|² = e^(iθ) * e^(-iθ) = 1
    Return abs(sin²θ + cos²θ - 1) as error.
    """
    pass  # your code here


# --- tests: do not modify ---
for theta in [0.2, 0.5, 1.0, math.pi/4, math.pi/3, 1.9]:
    # double angle
    expected = math.cos(2*theta)
    computed = double_angle_cos(theta)
    assert abs(computed - expected) < 1e-12, f"double_angle_cos failed at {theta}"

    # pythagorean
    err = verify_pythagorean(theta)
    assert err < 1e-14

# sum_to_product
for t1, t2 in [(0.3, 0.7), (math.pi/4, math.pi/6), (1.0, 2.0)]:
    val, prod = sum_to_product(t1, t2)
    assert abs(val - (math.cos(t1) + math.cos(t2))) < 1e-12
    assert abs(val - prod) < 1e-12

print("✓ Challenge 2 passed!")
```

<details>
<summary>Hint</summary>

`double_angle_cos`: `return cmath.exp(2j*theta).real`.
`sum_to_product`:
`val = cmath.exp(1j*theta1).real + cmath.exp(1j*theta2).real`
(i.e., `math.cos(t1) + math.cos(t2)`).
`prod = 2*math.cos((theta1+theta2)/2)*math.cos((theta1-theta2)/2)`.
`verify_pythagorean`: `z = cmath.exp(1j*theta)`;
`return abs(z.real**2 + z.imag**2 - 1)`.

</details>

---

**Challenge 3 — Phasor summer**

```python
import math
import cmath
import numpy as np
import matplotlib.pyplot as plt

def phasor_sum(amplitudes, phases_deg, omega, t_values):
    """
    Given a list of sinusoidal signals A_k * cos(omega*t + phi_k),
    represented as phasors A_k * e^(i*phi_k):
    
    1. Compute the sum phasor S = sum(A_k * e^(i*phi_k))
    2. Return the combined signal Re(S * e^(i*omega*t)) for the given t_values
    
    amplitudes: list of floats (A_k)
    phases_deg: list of floats (phi_k in degrees)
    omega: angular frequency (radians/second)
    t_values: numpy array of time values
    
    Returns: (sum_phasor, signal) where
      sum_phasor is a complex number (S = A_total * e^(i*phi_total))
      signal is a numpy array of the combined signal
    """
    pass  # your code here


# --- tests: do not modify ---
omega = 2*math.pi   # 1 Hz
t = np.linspace(0, 2, 400)

# Two equal cosines in phase: result has double amplitude
S, sig = phasor_sum([1, 1], [0, 0], omega, t)
assert abs(abs(S) - 2) < 1e-10          # amplitude should double
assert abs(math.degrees(cmath.phase(S)) - 0) < 1e-8   # phase unchanged

# Two equal cosines 180° apart: cancel
S, sig = phasor_sum([1, 1], [0, 180], omega, t)
assert abs(S) < 1e-10          # amplitude = 0 (destructive interference)
assert np.max(np.abs(sig)) < 1e-10   # signal is zero

# Single phasor: A*cos(omega*t + phi)
A, phi = 2, 45
S, sig = phasor_sum([A], [phi], omega, t)
phi_rad = math.radians(phi)
expected = A * np.cos(omega*t + phi_rad)
assert np.max(np.abs(sig - expected)) < 1e-10

# Three phasors: check vs manual sum
amps   = [1.0, 0.7, 1.3]
phases = [0,   45,  -60]
S, sig = phasor_sum(amps, phases, omega, t)
manual = sum(a*np.cos(omega*t + math.radians(p)) for a,p in zip(amps,phases))
assert np.max(np.abs(sig - manual)) < 1e-10

print("✓ Challenge 3 passed!")
print(f"\nThree-phasor sum (A=[1, 0.7, 1.3], φ=[0°, 45°, -60°]):")
S_demo, _ = phasor_sum([1.0, 0.7, 1.3], [0, 45, -60], omega, t)
print(f"  Total phasor: {S_demo:.4f}")
print(f"  Amplitude:    {abs(S_demo):.4f}")
print(f"  Phase:        {math.degrees(cmath.phase(S_demo)):.2f}°")
```

<details>
<summary>Hint</summary>

`phasor_sum`:
1. `sum_phasor = sum(A * cmath.exp(1j*math.radians(phi)) for A,phi in zip(amplitudes, phases_deg))`
2. `signal = np.real(sum_phasor * np.exp(1j * omega * t_values))`
3. `return sum_phasor, signal`

</details>

---

### Extension

**4. ★** Derive the formula for $\cos(3\theta)$ in terms of $\cos\theta$
using $(e^{i\theta})^3 = e^{3i\theta}$. That is, expand $(\cos\theta+i\sin\theta)^3$
and equate real parts. You should obtain $\cos(3\theta) = 4\cos^3\theta - 3\cos\theta$.

**5. ★** Prove that the **exponential form** satisfies the differential equation
$\frac{d}{d\theta}e^{i\theta} = ie^{i\theta}$ (treating $e^{i\theta}$ as a
function of $\theta$). Then verify this is consistent with differentiating
$\cos\theta + i\sin\theta$ component-wise: $\frac{d}{d\theta}\cos\theta + i\frac{d}{d\theta}\sin\theta = -\sin\theta + i\cos\theta$,
and confirm that $i(\cos\theta + i\sin\theta) = i\cos\theta - \sin\theta = -\sin\theta + i\cos\theta$. $\square$
