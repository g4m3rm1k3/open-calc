# M-012 — Complex Numbers

**Phase 3 · Polynomials and Rational Functions · Lesson 2 of 2**
**Pillar: Structure** · *Extending R by the only extension that makes every polynomial solvable*

---

## What You Will Build

A Canvas animation showing complex multiplication as rotation and scaling on the Argand plane. A Python program verifying Euler's formula numerically using the Taylor series. By the end you understand complex numbers not as mysterious "imaginary" things but as the unique field extension of $\mathbb{R}$ that closes polynomial roots.

---

## What You Need to Know First

- M-003: the field axioms (we extend $\mathbb{R}$ to a new field)
- M-004: why $a^2 \geq 0$ prevents $\sqrt{-1}$ from being real
- M-011: the Fundamental Theorem of Algebra (complex roots are what it guarantees)

---

> **Quick Check — try to answer before reading:**
>
> 1. Is the "imaginary" in "imaginary number" a mathematical term? What does it actually mean?
> 2. What is $i^2$? What is $i^3$? $i^4$?
> 3. What does multiplying two complex numbers do geometrically?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### Why $\mathbb{R}$ Is Not Enough

From M-004: $a^2 \geq 0$ for all $a \in \mathbb{R}$. Therefore $x^2 = -1$ has no real solution.

But the Fundamental Theorem of Algebra (M-011) says every degree-2 polynomial has 2 roots in some field. The polynomial $x^2 + 1$ has no real roots — so $\mathbb{R}$ is missing something.

The fix: extend $\mathbb{R}$ by introducing a symbol $i$ satisfying:

$$i^2 = -1$$

This is not a convention — it is a construction. Formally, $\mathbb{C}$ can be defined as the quotient ring $\mathbb{R}[x] / (x^2 + 1)$, where $i$ is the equivalence class of $x$. This construction is beyond our current tools, but the key point is: **$\mathbb{C}$ is not an arbitrary extension — it is the minimal one needed to factor $x^2 + 1$, and it turns out to be the one that factors all polynomials** (FTA).

---

### The Structure of $\mathbb{C}$

$$\mathbb{C} = \{a + bi : a, b \in \mathbb{R}\}$$

with operations:
$$(a + bi) + (c + di) = (a + c) + (b + d)i$$
$$(a + bi)(c + di) = ac + adi + bci + bdi^2 = (ac - bd) + (ad + bc)i$$

The real part of $z = a + bi$ is $\text{Re}(z) = a$. The imaginary part is $\text{Im}(z) = b$ (note: the imaginary part is a real number $b$, not $bi$).

**$\mathbb{C}$ is a field:** Every nonzero $z = a + bi$ has a multiplicative inverse:
$$\frac{1}{a + bi} = \frac{a - bi}{(a + bi)(a - bi)} = \frac{a - bi}{a^2 + b^2}$$

The denominator $a^2 + b^2 > 0$ for $z \neq 0$ (by M-004: $a^2, b^2 \geq 0$ and not both zero). So division is always possible for nonzero $z$. $\mathbb{C}$ satisfies all nine field axioms.

**The complex conjugate** of $z = a + bi$ is $\bar{z} = a - bi$. Key properties:
- $z \bar{z} = a^2 + b^2$ (a non-negative real number)
- $\overline{z_1 + z_2} = \bar{z}_1 + \bar{z}_2$ and $\overline{z_1 z_2} = \bar{z}_1 \bar{z}_2$

---

### The Complex Plane (Argand Diagram)

Represent $z = a + bi$ as the point $(a, b)$ in the plane. The real axis is the $x$-axis; the imaginary axis is the $y$-axis.

**Modulus:** $|z| = \sqrt{a^2 + b^2}$ — the distance from the origin to $z$.

**Argument:** $\arg(z) = \theta$ where $a = |z|\cos\theta$ and $b = |z|\sin\theta$ — the angle from the positive real axis.

**Polar form:** $z = r(\cos\theta + i\sin\theta)$ where $r = |z|$ and $\theta = \arg(z)$.

**Multiplication in polar form:**

$$z_1 z_2 = r_1 r_2 \bigl(\cos(\theta_1 + \theta_2) + i\sin(\theta_1 + \theta_2)\bigr)$$

Multiplying two complex numbers **multiplies their moduli and adds their arguments**.

This is not obvious from the rectangular form. In polar form it is beautiful and immediate. It means: **multiplication by $z$ is a rotation by $\arg(z)$ followed by a scaling by $|z|$**.

Special case: multiplying by $i = 1 \cdot (\cos(\pi/2) + i\sin(\pi/2))$ rotates by $90°$ and scales by 1.

---

### Euler's Formula

$$e^{i\theta} = \cos\theta + i\sin\theta$$

This is one of the deepest formulas in mathematics. It will be **derived** in Phase 8 using Taylor series. The derivation:

$$e^{ix} = \sum_{n=0}^\infty \frac{(ix)^n}{n!} = 1 + ix + \frac{(ix)^2}{2!} + \frac{(ix)^3}{3!} + \cdots$$

Since $i^2 = -1$, $i^3 = -i$, $i^4 = 1$ (period 4):

$$= \left(1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots\right) + i\left(x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots\right)$$

The first bracket is the Taylor series of $\cos x$. The second is $\sin x$. Therefore $e^{ix} = \cos x + i\sin x$. $\square$

**Euler's identity (the most famous equation in mathematics):** Setting $\theta = \pi$:
$$e^{i\pi} + 1 = 0$$

This connects the five most fundamental constants: $e$, $i$, $\pi$, $1$, $0$.

```javascript
// Canvas: complex multiplication as rotation and scaling on the Argand plane
const canvas = document.createElement('canvas');
canvas.width = 520;
canvas.height = 520;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0d1117';
ctx.fillRect(0, 0, 520, 520);

const cx = 260, cy = 260, scale = 80;  // origin and pixels-per-unit

// Grid and axes
ctx.strokeStyle = '#222';
ctx.lineWidth = 1;
for (let k = -3; k <= 3; k++) {
    ctx.beginPath();
    ctx.moveTo(cx + k*scale, 20);
    ctx.lineTo(cx + k*scale, 500);
    ctx.moveTo(20, cy + k*scale);
    ctx.lineTo(500, cy + k*scale);
    ctx.stroke();
}
ctx.strokeStyle = '#555';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(20, cy); ctx.lineTo(500, cy);
ctx.moveTo(cx, 20); ctx.lineTo(cx, 500);
ctx.stroke();

// Axis labels
ctx.fillStyle = '#666';
ctx.font = '11px monospace';
ctx.textAlign = 'center';
for (let k = -3; k <= 3; k++) {
    if (k !== 0) {
        ctx.fillText(k, cx + k*scale, cy + 16);
        ctx.fillText(k === 1 ? 'i' : `${k}i`, cx + 18, cy - k*scale + 4);
    }
}

function drawPoint(re, im, color, label) {
    const px = cx + re * scale;
    const py = cy - im * scale;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    if (label) {
        ctx.fillStyle = color;
        ctx.font = '13px serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, px + 10, py - 6);
    }
    return {px, py};
}

function drawVector(re, im, color) {
    const px = cx + re * scale;
    const py = cy - im * scale;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    // Arrowhead
    const angle = Math.atan2(cy - py, px - cx);
    ctx.moveTo(px, py);
    ctx.lineTo(px - 12*Math.cos(angle-0.3), py + 12*Math.sin(angle-0.3));
    ctx.moveTo(px, py);
    ctx.lineTo(px - 12*Math.cos(angle+0.3), py + 12*Math.sin(angle+0.3));
    ctx.stroke();
}

// z1 = 2 + i (|z1| = sqrt(5), arg = atan(1/2) ≈ 26.6°)
const z1_re = 2, z1_im = 1;
// z2 = 1 + i (|z2| = sqrt(2), arg = 45°)
const z2_re = 1, z2_im = 1;
// product z1*z2 = (2+i)(1+i) = 2+2i+i+i^2 = 2+3i-1 = 1+3i
const prod_re = z1_re*z2_re - z1_im*z2_im;
const prod_im = z1_re*z2_im + z1_im*z2_re;

drawVector(z1_re, z1_im, '#4fc3f7');
drawVector(z2_re, z2_im, '#ff9800');
drawVector(prod_re, prod_im, '#66bb6a');

drawPoint(z1_re, z1_im, '#4fc3f7', `z₁ = ${z1_re}+${z1_im}i`);
drawPoint(z2_re, z2_im, '#ff9800', `z₂ = ${z2_re}+${z2_im}i`);
drawPoint(prod_re, prod_im, '#66bb6a', `z₁z₂ = ${prod_re}+${prod_im}i`);

// Modulus annotations
const modz1 = Math.sqrt(z1_re**2 + z1_im**2).toFixed(2);
const modz2 = Math.sqrt(z2_re**2 + z2_im**2).toFixed(2);
const modprod = Math.sqrt(prod_re**2 + prod_im**2).toFixed(2);
const argz1 = (Math.atan2(z1_im, z1_re) * 180/Math.PI).toFixed(1);
const argz2 = (Math.atan2(z2_im, z2_re) * 180/Math.PI).toFixed(1);
const argprod = (Math.atan2(prod_im, prod_re) * 180/Math.PI).toFixed(1);

ctx.fillStyle = '#aaa';
ctx.font = '12px monospace';
ctx.textAlign = 'left';
ctx.fillText(`|z₁| = ${modz1}, arg(z₁) = ${argz1}°`, 20, 380);
ctx.fillText(`|z₂| = ${modz2}, arg(z₂) = ${argz2}°`, 20, 400);
ctx.fillText(`|z₁z₂| = ${modprod} = |z₁|·|z₂| ✓`, 20, 420);
ctx.fillText(`arg(z₁z₂) = ${argprod}° = ${argz1}° + ${argz2}° ✓`, 20, 440);
ctx.fillText('Multiplication: multiply moduli, add arguments', 20, 470);
```

```python
import math

# Euler's formula: verify e^(i*theta) = cos(theta) + i*sin(theta)
# using partial Taylor series

def exp_taylor(x, n_terms):
    """Compute partial sum of Taylor series for e^x: sum x^k/k!"""
    total = 0
    factorial = 1
    x_power = 1
    for k in range(n_terms):
        if k > 0:
            factorial *= k
            x_power  *= x
        total += x_power / factorial
    return total

# For e^(i*theta), we split into real and imaginary parts
def euler_via_taylor(theta, n_terms):
    """
    Compute e^(i*theta) as cos+i*sin using Taylor series.
    i^k cycles: i^0=1, i^1=i, i^2=-1, i^3=-i, i^4=1, ...
    Real part: terms k=0,4,8,... (positive) and k=2,6,10,... (negative)
    Imag part: terms k=1,5,9,... (positive) and k=3,7,11,... (negative)
    """
    real_part = 0
    imag_part = 0
    factorial = 1
    x_power   = 1
    i_powers  = [1, 0+1j, -1, 0-1j]   # i^0, i^1, i^2, i^3
    for k in range(n_terms):
        if k > 0:
            factorial *= k
            x_power  *= theta
        term = x_power / factorial
        i_k  = i_powers[k % 4]
        real_part += term * i_k.real
        imag_part += term * i_k.imag
    return real_part, imag_part

print("Verifying Euler's formula: e^(iθ) = cos(θ) + i·sin(θ)")
print()
test_angles = [0, math.pi/6, math.pi/4, math.pi/2, math.pi, 2*math.pi]
angle_names = ['0', 'π/6', 'π/4', 'π/2', 'π', '2π']

print(f"{'θ':>6}  {'cos(θ)':>10}  {'sin(θ)':>10}  {'Taylor real':>12}  {'Taylor imag':>12}  match")
print("-" * 65)
for theta, name in zip(test_angles, angle_names):
    expected_re = math.cos(theta)
    expected_im = math.sin(theta)
    taylor_re, taylor_im = euler_via_taylor(theta, 30)
    err = math.sqrt((taylor_re - expected_re)**2 + (taylor_im - expected_im)**2)
    print(f"{name:>6}  {expected_re:>10.6f}  {expected_im:>10.6f}  {taylor_re:>12.6f}  {taylor_im:>12.6f}  {'✓' if err < 1e-8 else '✗'}")

print()
# Euler's identity: e^(i*pi) + 1 = 0
re, im = euler_via_taylor(math.pi, 50)
print(f"Euler's identity: e^(iπ) = {re:.10f} + {im:.10f}i")
print(f"  e^(iπ) + 1 = {re + 1:.2e} + {im:.2e}i  ≈  0 + 0i  ✓")
print()
print("The Taylor series confirms: the five constants e, i, π, 1, 0 are linked by e^(iπ) + 1 = 0.")
```

---

### Why Complex Numbers Are Not "Imaginary"

The word "imaginary" is a historical accident — Descartes used it disparagingly. Complex numbers are no more or less "real" than negative numbers (which were also called "false" by early mathematicians) or irrational numbers (which caused a genuine crisis in Greek mathematics — see the proof of $\sqrt{2}$'s irrationality in M-001).

Complex numbers are:
- Numbers in a field (they satisfy all nine field axioms)
- Points in the plane (a completely geometric object)
- Rotations and scalings (multiplication in the complex plane is a linear map)
- Essential in physics (quantum mechanics is formulated in $\mathbb{C}$), signal processing (Fourier transforms), and control theory

They are not imaginary. They are necessary.

---

## Connect the Pieces

- **Phase 4:** Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ is derived from the Taylor series of $e^x$, $\sin x$, $\cos x$.
- **Phase 11:** Complex eigenvalues of real matrices come in conjugate pairs — from FTA applied to the characteristic polynomial.
- **Phase 12:** The characteristic function of a probability distribution is the Fourier transform of its PDF — a complex-valued function.
- **Phase 17:** $\mathbb{C} \cong \mathbb{R}[x]/(x^2+1)$ — complex numbers as a quotient ring.

---

## What Breaks Without This

Without complex numbers:
- The FTA would be vacuously false: most polynomials would have no roots.
- You could not factor every polynomial over $\mathbb{R}$ — some quadratics ($x^2 + 1$) are irreducible.
- Eigenvalue analysis (Phase 11) would fail for matrices with complex eigenvalues — yet such matrices describe rotations, which appear constantly in graphics and physics.

---

## Definition of Done

- [ ] You can define $\mathbb{C}$ as a set with two operations, and verify it satisfies the field axioms
- [ ] You can compute products and quotients of complex numbers in rectangular form
- [ ] You can convert between rectangular $(a + bi)$ and polar $(r e^{i\theta})$ forms
- [ ] You can state and explain the geometric interpretation: multiplication multiplies moduli and adds arguments
- [ ] You can sketch the derivation of Euler's formula (Taylor series argument — previewed here, proved in Phase 8)
- [ ] You ran both the canvas and Python code and can explain what each shows

**Proof reconstruction (Sunday):** Compute $(2 + 3i)(-1 + i)$ in two ways: (1) by expanding, (2) by converting to polar form and using $r_1 r_2 e^{i(\theta_1 + \theta_2)}$. Verify you get the same answer.

---

## Answers to Quick Check

1. "Imaginary" is a historical misnomer, not a mathematical term. Complex numbers are as mathematically rigorous as real numbers — the name reflects 17th-century mistrust, not mathematical reality.
2. $i^1 = i$. $i^2 = -1$. $i^3 = i^2 \cdot i = -i$. $i^4 = (i^2)^2 = (-1)^2 = 1$. The cycle repeats with period 4.
3. Multiplying by $z = re^{i\theta}$ rotates the plane by angle $\theta$ and scales every point by a factor of $r = |z|$.
