# M-028 — The Jacobian and Change of Variables

**Phase 9 · Multivariable Calculus · Lesson 3 of 3**
**Pillar: Transformation** · *How coordinate transformations scale area — the multivariable chain rule for integrals*

---

## What You Will Build

A Python program computing Jacobians numerically and verifying a change-of-variables transformation (Cartesian to polar). You will understand why $dA = r\,dr\,d\theta$ in polar coordinates and see the Jacobian as a local scaling factor.

---

## What You Need to Know First

- M-026: partial derivatives (Jacobian is a matrix of partials)
- M-027: double integrals
- M-031: determinants (Jacobian determinant measures area scaling)

---

> **Quick Check — try to answer before reading:**
>
> 1. In 1D, the change of variables formula $\int f(g(x))g'(x)\,dx = \int f(u)\,du$ uses $g'(x)$. What replaces $g'(x)$ in 2D?
> 2. In polar coordinates, a thin ring at radius $r$ with radial width $\delta r$ and angular span $\delta\theta$ has area approximately $r\,\delta r\,\delta\theta$. Why $r$?
> 3. What happens to the Jacobian determinant when the transformation is not invertible?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Jacobian

For a transformation $\Phi: \mathbb{R}^2 \to \mathbb{R}^2$ defined by $(x, y) = \Phi(u, v) = (x(u,v), y(u,v))$, the **Jacobian matrix** is:

$$J_\Phi = \frac{\partial(x, y)}{\partial(u, v)} = \begin{pmatrix} \frac{\partial x}{\partial u} & \frac{\partial x}{\partial v} \\ \frac{\partial y}{\partial u} & \frac{\partial y}{\partial v} \end{pmatrix}$$

The **Jacobian determinant** $|J_\Phi| = \left|\frac{\partial(x,y)}{\partial(u,v)}\right|$ is the local scaling factor: a small area element $du\,dv$ in the $(u,v)$-space corresponds to an area element $|J_\Phi|\,du\,dv$ in the $(x,y)$-space.

**Change of variables formula:**

$$\iint_D f(x,y)\,dx\,dy = \iint_{D'} f(\Phi(u,v)) \cdot |J_\Phi|\,du\,dv$$

where $D' = \Phi^{-1}(D)$.

This is the multivariable analogue of $u$-substitution: $\int_a^b f(g(x))g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du$. Here $g'(x)$ is replaced by $|J_\Phi|$.

---

### Polar Coordinates Explained

$\Phi(r, \theta) = (r\cos\theta, r\sin\theta)$, so:

$$J_\Phi = \begin{pmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{pmatrix}$$

$$|J_\Phi| = \cos\theta \cdot r\cos\theta - (-r\sin\theta) \cdot \sin\theta = r\cos^2\theta + r\sin^2\theta = r$$

Therefore $dx\,dy = r\,dr\,d\theta$ — this is where the $r$ factor in polar integrals comes from.

**Geometric interpretation:** A small rectangle of width $dr$ and angular width $d\theta$ at radius $r$ has area approximately $r\,dr\,d\theta$ (it is like a thin annular sector of radius $r$, arc length $r\,d\theta$, width $dr$).

```python
import math

def jacobian_det(x_fn, y_fn, u, v, h=1e-6):
    """Compute |J_Phi| = |∂(x,y)/∂(u,v)| numerically."""
    dx_du = (x_fn(u+h, v) - x_fn(u-h, v)) / (2*h)
    dx_dv = (x_fn(u, v+h) - x_fn(u, v-h)) / (2*h)
    dy_du = (y_fn(u+h, v) - y_fn(u-h, v)) / (2*h)
    dy_dv = (y_fn(u, v+h) - y_fn(u, v-h)) / (2*h)
    return abs(dx_du * dy_dv - dx_dv * dy_du)

print("=== Jacobian for Polar Coordinates ===")
print("Φ(r,θ) = (r·cos θ, r·sin θ)")
print("J = |cos θ  -r·sin θ|    det(J) = r·cos²θ + r·sin²θ = r")
print("    |sin θ   r·cos θ|")
print()

x_polar = lambda r, theta: r * math.cos(theta)
y_polar = lambda r, theta: r * math.sin(theta)

test_pts = [(0.5, 0), (1, math.pi/4), (2, math.pi/2), (1.5, math.pi)]
print(f"{'r':>6}  {'θ':>8}  {'|J| numerical':>16}  {'r (exact)':>12}  match")
for (r, theta) in test_pts:
    jdet = jacobian_det(x_polar, y_polar, r, theta)
    print(f"{r:>6.2f}  {theta:>8.4f}  {jdet:>16.8f}  {r:>12.8f}  {'✓' if abs(jdet - r) < 1e-6 else '✗'}")

print()
print("=== Area of Disk via Change of Variables ===")
print("∫∫_{x²+y²≤R²} 1 dA = ∫₀^{2π} ∫₀^R r dr dθ = π R²")
print()
for R in [1, 2, 3]:
    # Polar integral
    n = 1000
    dr = R / n
    area = sum((i + 0.5) * dr * 2 * math.pi * dr for i in range(n))
    exact = math.pi * R**2
    print(f"  R={R}: polar area = {area:.8f},  π·R² = {exact:.8f},  error = {abs(area-exact):.2e}")

print()
# Change of variables for a Gaussian integral
print("=== Gaussian Integral via Polar CoV ===")
print("∫_{-∞}^{∞} e^{-x²} dx = √π")
print("Proof: [∫e^{-x²}dx]² = ∫∫ e^{-(x²+y²)}dxdy = ∫₀^{2π}∫₀^∞ e^{-r²} r dr dθ = π")
print()
# Numerical verification using large truncation
from functools import reduce
def gauss_1d(N=1000):
    dx = 12.0 / N
    return sum(math.exp(-((-6 + (i+0.5)*dx)**2)) * dx for i in range(N))
gauss = gauss_1d(10000)
print(f"  ∫_{{-6}}^{{6}} e^{{-x²}} dx ≈ {gauss:.10f}")
print(f"  √π                = {math.sqrt(math.pi):.10f}")
print(f"  Error:              {abs(gauss - math.sqrt(math.pi)):.2e}  ✓")
print()
print("The key step: ∫₀^∞ r·e^{-r²} dr = 1/2  (substituting u=r², du=2r dr)")
print("This is why the polar change of variables makes the 2D Gaussian integrable.")
```

---

## Connect the Pieces

The Jacobian is the multivariable derivative. In 1D: change of variables uses $g'(x)$. In 2D: uses $|\det J_\Phi|$. In $n$D: uses the determinant of the $n \times n$ Jacobian matrix.

**Backwards:** The Jacobian is a matrix of partial derivatives (M-026). Its determinant measures area/volume scaling (M-031 — coming next).

**Forwards:**
- M-031 (Determinants): The geometric meaning of the determinant is exactly the Jacobian's role: scaling areas.
- M-037 (Probability): The change-of-variables formula for PDFs uses the Jacobian: if $Y = g(X)$, the density of $Y$ involves $|J_{g^{-1}}|$.

---

## Definition of Done

- [ ] You can state the change-of-variables formula and explain the role of $|J_\Phi|$
- [ ] You can compute the Jacobian for polar coordinates and confirm $|J| = r$
- [ ] You can explain why $dA = r\,dr\,d\theta$ using the determinant
- [ ] You ran the Python code and verified the Gaussian integral sketch

**Proof reconstruction (Sunday):** Compute the Jacobian determinant for the transformation to cylindrical coordinates $(r, \theta, z)$ where $x = r\cos\theta$, $y = r\sin\theta$, $z = z$. Show that $dV = r\,dr\,d\theta\,dz$.
