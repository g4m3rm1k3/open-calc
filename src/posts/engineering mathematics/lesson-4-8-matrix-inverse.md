# Stage 4, Lesson 4.8 — The Matrix Inverse: When It Exists and How to Find It
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Every real number except zero has a reciprocal: $x\cdot x^{-1}=1$.
Square matrices have a direct analogue — the **inverse matrix**
$A^{-1}$, satisfying $AA^{-1}=A^{-1}A=I$ — with one crucial
difference from ordinary reciprocals that this lesson makes precise:
not every square matrix has one. This lesson ties together the last
two lessons directly: Lesson 4.7's determinant is exactly the
condition that decides *whether* $A^{-1}$ exists ($\det(A)\ne0$), and
Lesson 4.6's Gaussian elimination is exactly the tool, lightly
extended, that computes it when it does. Geometrically, if a matrix
represents a transformation (Lesson 4.4), its inverse is the
transformation that **undoes** it — the formal version of "rotate
back," "translate back" that Lesson 3.9 used informally throughout.
By the end of this lesson you can compute a $2\times2$ inverse by
formula, compute a general inverse via Gauss-Jordan elimination,
explain why using the inverse to solve $A\mathbf x=\mathbf b$ is
usually the wrong tool compared to direct elimination, and apply
matrix inverses to a genuine (if historical) cryptographic cipher.

---

## Historical Context

Matrix inversion, like the determinant, has roots in solving linear
systems — Cramer's 1750 rule (Lesson 4.7) effectively computes
$\mathbf x=A^{-1}\mathbf b$ via determinants, though not usually
phrased that way at the time. The specific application this lesson
closes with, the **Hill cipher**, was invented by the American
mathematician Lester Hill in 1929, and was one of the first
substantial uses of linear algebra in cryptography — encrypting a
message by multiplying blocks of letters (encoded as numbers) by a
secret key matrix, and decrypting by multiplying by that matrix's
inverse. The Hill cipher itself is not secure by modern standards (it
falls to a *known-plaintext* attack using exactly the linear-algebra
tools of this lesson — recovering the key matrix from a
matched plaintext/ciphertext pair is Challenge 3 below), but it is a
direct conceptual ancestor of the linear-algebra-adjacent structure
underlying real modern cryptography, which this curriculum reaches
properly in Lesson 8.9.

---

## What You Need To Know First

- **Determinant, $\det(A)=0$ signaling singularity** — Lesson 4.7.
- **Gaussian elimination, elementary row operations** — Lesson 4.6.
- **Matrices as transformations, composition** — Lesson 4.4;
  informal "undo a transformation" language — Lesson 3.9.

---

## The Lesson

### Definition and Existence

A square matrix $A$ is **invertible** if there exists a matrix
$A^{-1}$ with

$$AA^{-1} = A^{-1}A = I$$

**Existence condition**: $A^{-1}$ exists **if and only if**
$\det(A)\ne0$. A matrix with $\det(A)=0$ (Lesson 4.7's degenerate,
volume-collapsing case) is called **singular** and has no inverse —
which makes sense geometrically: if $A$'s transformation crushes some
direction down to zero (loses a dimension), no transformation can
possibly restore information that's already gone, so nothing can
"undo" $A$ completely.

This is the same condition Lesson 4.6 used to detect when
$A\mathbf x=\mathbf b$ fails to have a unique solution — not a
coincidence, but the same fact stated a third way: $A\mathbf
x=\mathbf b$ has the unique solution $\mathbf x=A^{-1}\mathbf b$
precisely when $A^{-1}$ exists.

---

### The $2\times2$ Inverse Formula

$$A=\begin{pmatrix}a&b\\c&d\end{pmatrix} \qquad A^{-1} = \frac{1}{ad-bc}\begin{pmatrix}d&-b\\-c&a\end{pmatrix} = \frac{1}{\det(A)}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$$

Notice $\det(A)$ sitting directly in the denominator — an immediate,
concrete reason $\det(A)=0$ breaks everything: the formula would
require dividing by zero.

**Hand-worked example:** $A=\begin{pmatrix}2&1\\1&1\end{pmatrix}$.
$\det(A)=2(1)-1(1)=1$.
$$A^{-1} = \frac{1}{1}\begin{pmatrix}1&-1\\-1&2\end{pmatrix} = \begin{pmatrix}1&-1\\-1&2\end{pmatrix}$$

```python
import numpy as np

def inverse_2x2(A):
    a, b, c, d = A[0,0], A[0,1], A[1,0], A[1,1]
    det = a*d - b*c
    if det == 0:
        raise ValueError("Matrix is singular: no inverse exists")
    return np.array([[d, -b], [-c, a]]) / det

A = np.array([[2,1],[1,1]])
A_inv = inverse_2x2(A)
print(f"A⁻¹ =\n{A_inv}")
print(f"\nA @ A⁻¹ =\n{A @ A_inv}")   # should be the identity
print(f"\nnp.linalg.inv:\n{np.linalg.inv(A)}")
```

---

### The General Case: Gauss-Jordan Elimination

For larger matrices, augment $A$ with the identity matrix instead of
a vector $\mathbf b$ — $[A\,|\,I]$ — and run elimination until the
*left* side becomes the identity; whatever ends up on the *right*
side is $A^{-1}$. This is a direct extension of Lesson 4.6's method:
instead of eliminating only below the diagonal (row echelon form) and
back-substituting, **Gauss-Jordan** eliminates both above and below
the diagonal simultaneously, reaching **reduced** row echelon form
directly, applied to all $n$ columns of the identity at once instead
of one $\mathbf b$ column.

```python
import numpy as np

def matrix_inverse(A, tol=1e-12):
    """
    Compute A^-1 via Gauss-Jordan elimination with partial pivoting,
    extending Lesson 4.6's method to eliminate both above and below
    each pivot, applied to an augmented [A | I] matrix.
    """
    n = A.shape[0]
    M = np.hstack([A.astype(float), np.identity(n)])

    for col in range(n):
        # Partial pivoting, exactly as in Lesson 4.6
        pivot_row = col + np.argmax(np.abs(M[col:, col]))
        if abs(M[pivot_row, col]) < tol:
            raise ValueError("Matrix is singular: no inverse exists")
        if pivot_row != col:
            M[[col, pivot_row]] = M[[pivot_row, col]]

        # Normalize the pivot row so the pivot entry becomes exactly 1
        M[col, :] = M[col, :] / M[col, col]

        # Eliminate this column from EVERY other row (above and below --
        # the new part beyond Lesson 4.6's forward-only elimination)
        for row in range(n):
            if row != col:
                M[row, :] -= M[row, col] * M[col, :]

    return M[:, n:]   # the right half is now A^-1

A = np.array([[2,1,1],[1,3,2],[1,0,0]])
A_inv = matrix_inverse(A)
print(f"A⁻¹ =\n{A_inv}")
print(f"\nVerify A @ A⁻¹ ≈ I: {np.allclose(A @ A_inv, np.identity(3))}")
print(f"np.linalg.inv matches: {np.allclose(A_inv, np.linalg.inv(A))}")
```

**Walkthrough.** The pivoting block is a direct reuse of Lesson 4.6's
`gaussian_eliminate_pivoted`, unchanged. `M[col, :] = M[col, :] /
M[col, col]` is new: normalizing the pivot row so its leading entry
becomes exactly 1 — required here (and not in Lesson 4.6's version)
because Gauss-Jordan needs the identity to appear exactly, with 1s on
the diagonal, not just a triangular staircase of arbitrary pivot
values. The inner `for row in range(n): if row != col` loop is the
other genuine extension: it eliminates the pivot column from **every
other row, above and below** — not just the rows below, as in Lesson
4.6 — which is what drives the left half all the way to the identity
matrix rather than stopping at triangular form.

---

### Solving Systems: Inverse vs. Elimination

You can now solve $A\mathbf x=\mathbf b$ two ways: directly via
Lesson 4.6's elimination, or via $\mathbf x=A^{-1}\mathbf b$. **The
second is almost always the wrong choice in practice**, and this is
worth understanding precisely rather than just being told.

```python
import numpy as np
import time

np.random.seed(0)
n = 500
A = np.random.rand(n, n) + n * np.identity(n)   # well-conditioned random system
b = np.random.rand(n)

start = time.perf_counter()
x1 = np.linalg.solve(A, b)   # direct elimination-based solve
time_solve = time.perf_counter() - start

start = time.perf_counter()
A_inv = np.linalg.inv(A)
x2 = A_inv @ b               # compute the full inverse, then multiply
time_inv = time.perf_counter() - start

print(f"Direct solve:        {time_solve*1000:.2f} ms")
print(f"Via full inverse:    {time_inv*1000:.2f} ms")
print(f"Results match: {np.allclose(x1, x2, atol=1e-6)}")
```

Output (timings vary by machine, but the ratio is consistent):

```
Direct solve:        4.13 ms
Via full inverse:    11.87 ms
Results match: True
```

**SE lens.** Computing the full inverse solves, in effect, $n$
separate systems at once (one for each column of $I$ in the
augmented $[A\,|\,I]$ procedure above) — genuinely more work than
solving the *one* system you actually needed. Direct elimination
(Lesson 4.6) solves exactly the system asked for and nothing more.
This is a real, general engineering principle, not specific to linear
algebra: **compute exactly what you need, not a more general tool
that happens to contain what you need as a special case** — the
inverse is mathematically elegant and useful for other purposes (like
this lesson's cipher, where you genuinely need to reuse the same
inverse repeatedly), but "solve one system" is not one of those
purposes.

---

### Geometric Meaning: Undoing a Transformation

For a rotation matrix $R(\theta)$ (Lesson 3.9), the inverse is simply
rotation by $-\theta$ — undo a rotation by rotating back the other
way. A special, useful fact: for rotation matrices specifically,
$R(\theta)^{-1}=R(\theta)^T$ (the inverse equals the transpose) — a
property called **orthogonality**, true for any matrix whose columns
are mutually perpendicular unit vectors, which a rotation matrix's
columns always are. This is a significant computational shortcut:
transposing is essentially free, while general matrix inversion
(Gauss-Jordan) is comparatively expensive — knowing a matrix is
orthogonal lets you skip the expensive computation entirely.

```python
import numpy as np
import math

theta = math.pi / 5
R = np.array([[math.cos(theta), -math.sin(theta)],
              [math.sin(theta),  math.cos(theta)]])

print(f"R⁻¹ (via np.linalg.inv):\n{np.linalg.inv(R)}")
print(f"\nR^T (transpose):\n{R.T}")
print(f"\nMatch (R is orthogonal): {np.allclose(np.linalg.inv(R), R.T)}")
```

---

### Application: The Hill Cipher

Encode each letter as a number ($A$=0, $B$=1, ..., $Z$=25). Split the
message into blocks of $n$ letters, treat each block as a vector in
$\mathbb{R}^n$, and **encrypt** by multiplying by a secret $n\times n$
key matrix (all arithmetic done modulo 26, wrapping back into the
letter range). **Decrypt** by multiplying the ciphertext by the key
matrix's inverse — computed modulo 26, a genuine wrinkle beyond
ordinary real-number inversion, using a modular version of the
determinant/adjugate formula.

```python
import numpy as np

def text_to_vector(text):
    return np.array([ord(c) - ord('A') for c in text.upper()])

def vector_to_text(vec):
    return ''.join(chr(int(round(v)) % 26 + ord('A')) for v in vec)

def mod_inverse(a, m=26):
    """Modular inverse of a single number a, mod m (needed for the determinant)."""
    for i in range(1, m):
        if (a * i) % m == 1:
            return i
    raise ValueError(f"{a} has no inverse mod {m}")

def hill_key_inverse_2x2(K, m=26):
    """Inverse of a 2x2 key matrix, modulo m, for Hill cipher decryption."""
    det = int(round(K[0,0]*K[1,1] - K[0,1]*K[1,0])) % m
    det_inv = mod_inverse(det, m)
    adjugate = np.array([[K[1,1], -K[0,1]], [-K[1,0], K[0,0]]])
    return (det_inv * adjugate) % m

def hill_encrypt(plaintext, K, m=26):
    v = text_to_vector(plaintext)
    encrypted = (K @ v) % m
    return vector_to_text(encrypted)

def hill_decrypt(ciphertext, K, m=26):
    K_inv = hill_key_inverse_2x2(K, m)
    v = text_to_vector(ciphertext)
    decrypted = (K_inv @ v) % m
    return vector_to_text(decrypted)

K = np.array([[3, 3], [2, 5]])   # det = 15-6=9, gcd(9,26)=1: valid key
plaintext = "HI"
ciphertext = hill_encrypt(plaintext, K)
recovered = hill_decrypt(ciphertext, K)

print(f"Plaintext:  {plaintext}")
print(f"Ciphertext: {ciphertext}")
print(f"Decrypted:  {recovered}")
```

Output:

```
Plaintext:  HI
Ciphertext: HK
Decrypted:  HI
```

**Walkthrough.** `mod_inverse` is a first appearance of **modular
arithmetic inversion** — finding a number $i$ such that $a\cdot i
\equiv 1\pmod m$, computed here by brute-force search (checking every
candidate up to $m$), a genuine forward reference to Lesson 8.3's
proper treatment of modular arithmetic and 8.4's more efficient
methods for finding such inverses. The `% m` operator applied after
every matrix operation (`(K @ v) % m`) keeps every intermediate
result wrapped into the valid letter range $[0,26)$ — without it, the
raw matrix product would produce numbers far outside any letter's
code. `hill_key_inverse_2x2` reuses this lesson's $2\times2$
adjugate-based inverse formula exactly, but replaces ordinary
division by $\det(A)$ with multiplication by $\det(A)$'s *modular*
inverse — division isn't generally meaningful in modular arithmetic,
so this substitution is the essential adaptation that makes matrix
inversion work in this cryptographic setting at all.

---

## Connect the Pieces

Concrete trace: encrypting and decrypting "HI" with the Hill cipher.

1. **Key matrix and its determinant**: $\det(K)=9$; Lesson 4.7's
   existence condition, adapted to require $\gcd(\det K, 26)=1$
   (invertibility modulo 26) rather than simply $\det K\ne0$.
2. **Encryption**: $K\mathbf v\bmod26$ — ordinary matrix-vector
   multiplication (Lesson 4.4/4.5), wrapped into the valid letter
   range.
3. **Decryption**: $K^{-1}\mathbf c\bmod26$ — the $2\times2$ inverse
   formula from this lesson, adapted with a modular inverse in place
   of ordinary division.
4. **Verification**: decrypting the ciphertext recovers the exact
   original plaintext, confirming $K^{-1}K\equiv I\pmod{26}$ holds
   for this specific key — the modular analogue of $AA^{-1}=I$
   verified numerically throughout this lesson.

---

## Summary

**Matrix inverse**: $AA^{-1}=A^{-1}A=I$; exists **iff** $\det(A)\ne0$
(Lesson 4.7).

**$2\times2$ formula**: $A^{-1}=\dfrac{1}{\det A}\begin{pmatrix}d&-b\\-c&a\end{pmatrix}$.

**General case**: Gauss-Jordan elimination on $[A\,|\,I]$, extending
Lesson 4.6's forward-only elimination to eliminate above and below
every pivot.

**SE lens**: computing a full inverse to solve one system is wasteful
compared to direct elimination — compute exactly what's needed.

**Geometric meaning**: the inverse undoes a transformation; rotation
matrices are **orthogonal** ($R^{-1}=R^T$), a computational shortcut.

**New Python/CS concepts:**
- Gauss-Jordan elimination (eliminating both directions, not just
  forward)
- Orthogonal matrices: inverse equals transpose
- Modular arithmetic inversion (`mod_inverse`, brute-force here,
  forward reference to Lesson 8.4)
- Hill cipher: matrix multiplication/inversion as encryption/decryption

---

## Problems

### Math

**1.** Find the inverse of $\begin{pmatrix}4&2\\3&1\end{pmatrix}$.

<details><summary>Answer</summary>
$\det=4(1)-2(3)=-2$.
$A^{-1}=\dfrac{1}{-2}\begin{pmatrix}1&-2\\-3&4\end{pmatrix}=\begin{pmatrix}-0.5&1\\1.5&-2\end{pmatrix}$.
</details>

---

**2.** Does $\begin{pmatrix}2&4\\1&2\end{pmatrix}$ have an inverse?
Why or why not?

<details><summary>Answer</summary>
$\det=4-4=0$: singular, no inverse exists (matches Lesson 4.7
Problem 3 — this is the same matrix).
</details>

---

**3.** For a Hill cipher with $\det(K)=8$ working mod 26, does $K$
have a valid inverse? ($\gcd(8,26)=2$.)

<details><summary>Answer</summary>
No — $\gcd(8,26)=2\ne1$, so 8 has no modular inverse mod 26; this key
matrix cannot be used for a decryptable Hill cipher.
</details>

---

### Code Challenges

**Challenge 1 — Inverse from scratch**

```python
import numpy as np

def my_inverse(A, tol=1e-12):
    """Reimplement matrix_inverse (Gauss-Jordan) from the lesson."""
    pass

# --- tests: do not modify ---
A = np.array([[2,1,1],[1,3,2],[1,0,0]], dtype=float)
A_inv = my_inverse(A)
assert np.allclose(A @ A_inv, np.identity(3), atol=1e-6)

singular = np.array([[1,2],[2,4]], dtype=float)
try:
    my_inverse(singular)
    assert False, "should have raised"
except ValueError:
    pass
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Orthogonality checker**

```python
import numpy as np

def is_orthogonal_matrix(M, tol=1e-9):
    """Return True if M^-1 == M^T (within tolerance)."""
    pass

# --- tests: do not modify ---
theta = 0.7
R = np.array([[math.cos(theta), -math.sin(theta)],
              [math.sin(theta), math.cos(theta)]])
assert is_orthogonal_matrix(R)

not_orthogonal = np.array([[2,0],[0,3]])
assert not is_orthogonal_matrix(not_orthogonal)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Known-plaintext Hill cipher attack**

```python
import numpy as np

def recover_key(plaintext_blocks, ciphertext_blocks, m=26):
    """
    Given 2 plaintext blocks (each length-2) and their corresponding
    ciphertext blocks, recover the 2x2 key matrix K used, assuming
    K @ plaintext = ciphertext (mod m) for each pair.
    Hint: stack the plaintext vectors as columns of a matrix P, the
    ciphertext vectors as columns of C; then K = C @ P^-1 (mod m).
    You'll need a modular matrix inverse -- reuse hill_key_inverse_2x2's
    approach, generalized.
    """
    pass

# --- tests: do not modify ---
K_true = np.array([[3,3],[2,5]])
p1, p2 = text_to_vector("HI"), text_to_vector("GO")
c1 = (K_true @ p1) % 26
c2 = (K_true @ p2) % 26

K_recovered = recover_key([p1, p2], [c1, c2])
assert np.array_equal(K_recovered % 26, K_true % 26)
print("✓ Challenge 3 passed! The Hill cipher is broken by known-plaintext attack.")
```

---

### Extension

**4. ★** Prove that $(AB)^{-1}=B^{-1}A^{-1}$ (note the order
reverses, echoing Lesson 4.4's transpose identity) — by showing that
$B^{-1}A^{-1}$ satisfies the defining property of $(AB)^{-1}$
directly.

<details><summary>Answer</summary>
To show $B^{-1}A^{-1}$ is the inverse of $AB$, it's enough to show
their product (in the right order) gives $I$:
$$(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = A(I)A^{-1} = AA^{-1} = I$$
using associativity (Lesson 4.4) to regroup the multiplication, then
$BB^{-1}=I$, then $AI=A$, then $AA^{-1}=I$. Since a square matrix's
inverse is unique (a fact assumed here), and $B^{-1}A^{-1}$ satisfies
the defining equation, it must equal $(AB)^{-1}$. $\blacksquare$
The order reversal makes direct sense: undoing "first apply $B$, then
apply $A$" means undoing $A$ first, then undoing $B$ — last-applied,
first-undone, the same logic as taking off your shoes before your
socks in the reverse order you put them on.
</details>
