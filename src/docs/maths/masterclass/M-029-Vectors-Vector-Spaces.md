# M-029 — Vectors and Vector Spaces

**Phase 10 · Linear Algebra I · Lesson 1 of 3**
**Pillar: Transformation** · *Vectors are not arrows — they are elements of any set obeying eight axioms*

---

## What You Will Build

A Canvas visualisation of 2D span and linear independence. A Python program that tests whether a set of vectors is linearly independent and finds a basis for the span. You will see why polynomials, matrices, and continuous functions are all vector spaces — not just coordinate tuples.

---

## What You Need to Know First

- M-003: field axioms (vector spaces are defined over a field, typically $\mathbb{R}$)
- M-002: sets (vector spaces are sets with structure)

---

> **Quick Check — try to answer before reading:**
>
> 1. Can you add two polynomials together? Can you multiply a polynomial by a scalar? Does this make polynomials a vector space?
> 2. What does "linearly independent" mean for three vectors?
> 3. What is the dimension of the space of all polynomials of degree $\leq 2$?
>
> *(Answers at the end of this lesson)*

---

## The Lesson

### The Abstract Definition

A **vector space** over $\mathbb{R}$ is a set $V$ with two operations:
- **Addition:** $u + v \in V$ for all $u, v \in V$
- **Scalar multiplication:** $cv \in V$ for all $c \in \mathbb{R}$, $v \in V$

satisfying eight axioms (for all $u, v, w \in V$ and scalars $a, b$):

1. $u + v = v + u$ (commutativity)
2. $(u+v)+w = u+(v+w)$ (associativity)
3. $\exists \mathbf{0} \in V$ with $v + \mathbf{0} = v$ (zero vector)
4. $\exists (-v) \in V$ with $v + (-v) = \mathbf{0}$ (additive inverse)
5. $1 \cdot v = v$ (scalar identity)
6. $(ab)v = a(bv)$ (scalar associativity)
7. $a(u+v) = au + av$ (distributivity over vector sum)
8. $(a+b)v = av + bv$ (distributivity over scalar sum)

**The key insight:** Vectors are **not arrows**. They are elements of any set satisfying these axioms.

**Examples of vector spaces:**

| Space $V$ | Vectors | Addition | Scalar mult. |
|---|---|---|---|
| $\mathbb{R}^n$ | $n$-tuples of reals | componentwise | componentwise |
| $P_n$ | polynomials of degree $\leq n$ | polynomial addition | multiply by constant |
| $M_{m \times n}$ | $m \times n$ matrices | matrix addition | scalar×matrix |
| $C([a,b])$ | continuous functions on $[a,b]$ | $(f+g)(x) = f(x)+g(x)$ | $(cf)(x) = cf(x)$ |
| $\{0\}$ | just the zero element | $0+0=0$ | $c \cdot 0 = 0$ |

Every theorem proved from the eight axioms applies to all of these simultaneously.

---

### Linear Independence, Span, and Basis

**Linear combination:** $c_1 v_1 + c_2 v_2 + \cdots + c_k v_k$ for scalars $c_i$.

**Span:** $\text{span}(v_1, \ldots, v_k) = \{c_1 v_1 + \cdots + c_k v_k : c_i \in \mathbb{R}\}$ — all possible linear combinations.

**Linear independence:** $v_1, \ldots, v_k$ are linearly independent if the only solution to $c_1 v_1 + \cdots + c_k v_k = \mathbf{0}$ is $c_1 = \cdots = c_k = 0$.

Equivalently: no vector in the set is a linear combination of the others.

**Basis:** A linearly independent set that spans $V$.

**Dimension:** The number of elements in any basis. Well-defined: any two bases of $V$ have the same number of elements.

**Standard examples:**

- $\mathbb{R}^n$: standard basis $\{e_1, \ldots, e_n\}$ where $e_i$ has 1 in position $i$ and 0 elsewhere. $\dim(\mathbb{R}^n) = n$.
- $P_n$: basis $\{1, x, x^2, \ldots, x^n\}$. $\dim(P_n) = n+1$.
- $M_{m \times n}$: $\dim = mn$.

```python
import math

def dot(u, v):
    return sum(a*b for a, b in zip(u, v))

def subtract_projection(v, u):
    """Remove the projection of v onto u from v: v - (v·u/u·u)u."""
    coeff = dot(v, u) / dot(u, u)
    return [v[i] - coeff*u[i] for i in range(len(v))]

def gram_schmidt(vectors):
    """
    Gram-Schmidt: convert a set of linearly independent vectors to an orthonormal basis.
    Returns orthonormal basis or None if vectors are linearly dependent.
    """
    orthonormal = []
    for v in vectors:
        w = list(v)
        # Subtract projections onto all previously found basis vectors
        for q in orthonormal:
            w = subtract_projection(w, q)
        norm_w = math.sqrt(dot(w, w))
        if norm_w < 1e-10:
            return None  # linearly dependent
        orthonormal.append([c / norm_w for c in w])
    return orthonormal

def is_linearly_independent(vectors):
    return gram_schmidt(vectors) is not None

print("=== Linear Independence Tests ===")
print()

test_sets = [
    ("(1,0), (0,1) in R²",          [[1,0],[0,1]],          True),
    ("(1,0), (0,1), (1,1) in R²",   [[1,0],[0,1],[1,1]],    False),  # 3 vectors in R^2
    ("(1,2,3), (0,1,0), (0,0,1)",   [[1,2,3],[0,1,0],[0,0,1]], True),
    ("(1,2), (2,4) in R²",          [[1,2],[2,4]],          False),  # 2nd = 2 × 1st
]

for (name, vecs, expected) in test_sets:
    result = is_linearly_independent(vecs)
    print(f"  {name}: LI = {result}  {'✓' if result == expected else '✗'}")

print()

# Show what span looks like (2D case)
print("=== Span in R² ===")
print("span((1,0), (0,1)) = entire R²  (standard basis — any vector is a combination)")
print("span((1,2), (2,4)) = line y=2x  (dependent — same direction)")
print("span((1,0)) = x-axis  (one vector spans a line through origin)")
print()

# Basis for polynomials of degree ≤ 2
print("=== Basis for P₂ (polynomials of degree ≤ 2) ===")
print("Standard basis: {1, x, x²}")
print("Any p(x) = a + bx + cx² is uniquely determined by coefficients (a, b, c)")
print("dim(P₂) = 3")
print()
# Verify: 2 + 3x - x^2 has unique representation
poly_coeffs = [2, 3, -1]  # a=2, b=3, c=-1
print(f"p(x) = {poly_coeffs[0]} + {poly_coeffs[1]}x + ({poly_coeffs[2]})x²")
test_x = [0, 1, 2, -1, 3]
for x in test_x:
    val = sum(poly_coeffs[k] * x**k for k in range(3))
    print(f"  p({x}) = {val}")

print()
# Dot product and norms in R^n
print("=== Inner Products (dot products) and Norms ===")
u = [1, 2, 3]
v = [4, 0, -1]
dot_uv  = dot(u, v)
norm_u  = math.sqrt(dot(u, u))
norm_v  = math.sqrt(dot(v, v))
cos_ang = dot_uv / (norm_u * norm_v)
angle   = math.acos(max(-1, min(1, cos_ang))) * 180 / math.pi

print(f"u = {u}")
print(f"v = {v}")
print(f"u · v = {dot_uv}")
print(f"|u| = {norm_u:.4f}")
print(f"|v| = {norm_v:.4f}")
print(f"cos(angle) = {cos_ang:.4f}")
print(f"angle = {angle:.2f}°")
print()
orthogonal = abs(dot_uv) < 1e-10
print(f"Orthogonal: {orthogonal} (dot product {'= 0' if orthogonal else '≠ 0'})")
```

```javascript
// Canvas: 2D span and linear independence visualisation
const canvas = document.createElement('canvas');
canvas.width = 480; canvas.height = 480;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0d1117'; ctx.fillRect(0, 0, 480, 480);

const cx = 240, cy = 240, scale = 60;
const toC = (mx, my) => ({x: cx + mx*scale, y: cy - my*scale});

// Grid
ctx.strokeStyle = '#1a2332'; ctx.lineWidth = 1;
for (let k = -3; k <= 3; k++) {
    ctx.beginPath();
    ctx.moveTo(toC(k,-4).x, toC(k,-4).y); ctx.lineTo(toC(k,4).x, toC(k,4).y);
    ctx.moveTo(toC(-4,k).x, toC(-4,k).y); ctx.lineTo(toC(4,k).x, toC(4,k).y);
    ctx.stroke();
}
// Axes
ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(toC(-4,0).x, toC(-4,0).y); ctx.lineTo(toC(4,0).x, toC(4,0).y);
ctx.moveTo(toC(0,-4).x, toC(0,-4).y); ctx.lineTo(toC(0,4).x, toC(0,4).y);
ctx.stroke();

function drawVector(vx, vy, color, label) {
    const {x: x0, y: y0} = toC(0, 0);
    const {x: x1, y: y1} = toC(vx, vy);
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    const angle = Math.atan2(y1-y0, x1-x0);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 14*Math.cos(angle-0.4), y1 - 14*Math.sin(angle-0.4));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 14*Math.cos(angle+0.4), y1 - 14*Math.sin(angle+0.4));
    ctx.stroke();
    ctx.fillStyle = color; ctx.font = '14px serif'; ctx.textAlign = 'left';
    ctx.fillText(label, x1+8, y1);
}

// v1 = (2,1), v2 = (0,2) — linearly independent
drawVector(2, 1, '#4fc3f7', 'v₁=(2,1)');
drawVector(0, 2, '#ff9800', 'v₂=(0,2)');

// Linear combination: v1 + v2 = (2,3)
drawVector(2, 3, '#66bb6a', 'v₁+v₂=(2,3)');

// Dependent case: show w = 1.5*v1
ctx.setLineDash([5,5]);
drawVector(3, 1.5, '#ef5350', '1.5v₁ (dependent dir)');
ctx.setLineDash([]);

ctx.fillStyle = '#aaa'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
ctx.fillText('Solid: independent vectors span all of R²', 240, 465);
ctx.fillText('Dashed: dependent vector — in same direction as v₁', 240, 478);
```

---

## Connect the Pieces

**Backwards:** Vector spaces use field axioms (M-003) — the scalars come from $\mathbb{R}$.

**Forwards:**
- M-030: Linear transformations are maps between vector spaces preserving the structure.
- M-031: Gaussian elimination solves $Ax = b$ — finding coordinates in a basis.
- M-033 (Spectral theorem): $\mathbb{R}^n$ has a special structure (inner product) beyond just the vector space axioms.
- M-046 (Real Analysis): Function spaces $L^2([a,b])$ are infinite-dimensional vector spaces — the setting for Fourier series.

---

## What Breaks Without This

Without the abstract definition:
- You think linear algebra is only about $\mathbb{R}^n$ and miss the connection to polynomials (polynomial fitting), functions (Fourier analysis), and matrices (quantum mechanics).
- The phrase "dimension" has no precise meaning — you cannot say "the space of degree-3 polynomials has dimension 4."

---

## Definition of Done

- [ ] You can state the eight vector space axioms
- [ ] You can give three examples of vector spaces that are not $\mathbb{R}^n$
- [ ] You can determine whether a set of vectors is linearly independent
- [ ] You can explain what a basis and dimension are, and compute the dimension of $P_n$ and $M_{m \times n}$
- [ ] You ran the Python and canvas code

**Proof reconstruction (Sunday):** Show that $\{1, x, x^2, x^3\}$ is a basis for $P_3$ (polynomials of degree $\leq 3$). Then: is $\{1, (x-1), (x-1)^2, (x-1)^3\}$ also a basis? Why?
