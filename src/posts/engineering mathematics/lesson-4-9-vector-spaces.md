# Stage 4, Lesson 4.9 — Vector Spaces and Subspaces
**Threads:** Math · Physics · Engineering
**Estimated time:** 60–70 minutes

---

## What This Lesson Is About

Every lesson since 4.1 has quietly relied on a handful of facts about
$\mathbb{R}^n$: you can add two vectors and get another vector, scale
a vector and get another vector, and these operations behave sensibly
(order doesn't matter for addition, scaling distributes, and so on).
This lesson names that structure explicitly — a **vector space** — and
then makes a claim that will matter increasingly from here forward:
*plenty of things that don't look like arrows satisfy the exact same
rules.* Matrices of a fixed size form a vector space (you added and
scaled them constantly in Lesson 4.4). Polynomials of a bounded
degree form a vector space (their coefficients behave exactly like a
vector's components). This isn't a curiosity — it means every tool
built for $\mathbb{R}^n$ in this stage (span, independence, basis,
dimension) automatically applies to these other settings too, without
new theory.

This lesson also finally resolves something left honestly unfinished
in Lesson 4.6: distinguishing "no solution" from "infinitely many
solutions" when $\det(A)=0$. The tool that does it — the **null
space** — is also, not coincidentally, the exact tool that tells a
robotics engineer whether a robot arm has "wasted" degrees of freedom
that don't move its end effector at all, a genuine forward reference
to this curriculum's robot kinematics lesson (4.14/10.2).

---

## Historical Context

The formal, axiomatic definition of a vector space — the version that
deliberately doesn't care whether the "vectors" are arrows, matrices,
or polynomials — traces to Giuseppe Peano's 1888 work, building
directly on Grassmann's 1844 *Ausdehnungslehre* (Lesson 4.1), which
had already worked in arbitrary dimensions but without the fully
abstracted axiomatic packaging Peano supplied. This abstraction was
not merely tidiness: it meant that a single theorem proved once,
abstractly, about "vector spaces" in general would automatically be
true for every specific example satisfying the axioms — geometric
vectors, matrices, polynomials, and (later, foundational to Stage 7's
Fourier analysis) even certain spaces of *functions* — without ever
re-proving it in each separate context.

---

## What You Need To Know First

- **Vectors, addition, scalar multiplication** — Lesson 4.1.
- **Linear combinations of matrix columns** — Lesson 4.5.
- **Solving $A\mathbf x=\mathbf b$, singular systems** — Lesson 4.6
  (this lesson resolves that lesson's deferred ambiguity).
- **Matrix inverse existence** — Lesson 4.8.

---

## The Lesson

### Vector Spaces, Generally

A **vector space** is a set of objects (called vectors) that can be
added together and scaled by real numbers, satisfying a short list of
sensible rules: addition is commutative and associative, there's a
zero vector that changes nothing when added, every vector has a
negative, scaling distributes over addition, and so on. $\mathbb{R}^n$
is the running example — but it is very much not the only one.

**Matrices as a vector space.** The set of all $2\times2$ matrices,
under the addition and scalar multiplication defined in Lesson 4.4,
satisfies every one of these rules — you were already treating it as
a vector space in Lesson 4.4 without the name attached.

**Polynomials as a vector space.** The set of polynomials of degree
$\le n$ — $\{a_0+a_1x+a_2x^2+\cdots+a_nx^n\}$ — forms a vector space:
adding two such polynomials, or scaling one, produces another
polynomial of degree $\le n$. The natural way to see this
computationally: a degree-$\le n$ polynomial *is*, for all algebraic
purposes, its coefficient vector $(a_0,a_1,\dots,a_n)\in
\mathbb{R}^{n+1}$ — Lesson 1.1's polynomials, viewed through this
stage's lens.

```python
import numpy as np

# Matrices as vectors: add and scale two 2x2 matrices
M1 = np.array([[1,2],[3,4]])
M2 = np.array([[5,-1],[0,2]])
print(f"M1 + M2 =\n{M1 + M2}")
print(f"2*M1 =\n{2*M1}")

# Polynomials as coefficient vectors: (1 + 2x - x^2) + (3 - x)
p1 = np.array([1, 2, -1])   # 1 + 2x - x^2
p2 = np.array([3, -1, 0])   # 3 - x
p_sum = p1 + p2
print(f"\n(1+2x-x²) + (3-x) has coefficients: {p_sum}")
print(f"i.e. {p_sum[0]} + {p_sum[1]}x + {p_sum[2]}x²")
```

**Walkthrough.** No new syntax here — the point of this section is
entirely conceptual: the identical `+` and scalar `*` operations
already used constantly for `np.array` vectors work, unmodified, on
these two very different kinds of mathematical object, because both
genuinely are vector spaces under the hood. This is the payoff of
Lesson 4.1's "generalize to $\mathbb{R}^n$" move, taken one step
further: it's not just that $n$ can be large, it's that "vector"
never had to mean "arrow" in the first place.

---

### Subspaces

A **subspace** of a vector space is a subset that is *itself* a
vector space under the same operations — which, it turns out, only
needs checking three conditions (everything else follows
automatically):

1. Contains the **zero vector**.
2. **Closed under addition**: adding two vectors in the subset always
   gives another vector in the subset.
3. **Closed under scalar multiplication**: scaling a vector in the
   subset always gives another vector in the subset.

**Example:** the set of all vectors $(x,y,0)$ in $\mathbb{R}^3$ (the
$xy$-plane) is a subspace — it contains $(0,0,0)$; adding two such
vectors keeps the third coordinate at 0; scaling keeps it at 0.
**Non-example:** the set of vectors $(x,y,1)$ (a plane *not* through
the origin) is **not** a subspace — it fails condition 1 immediately,
since $(0,0,1)\ne(0,0,0)$; geometrically, a subspace must pass through
the origin.

```python
import numpy as np

def is_closed_under_addition(vectors_in_set, membership_test, n_trials=20):
    """
    Randomly sample pairs from vectors_in_set, check that their sum
    still passes membership_test.
    """
    import random
    for _ in range(n_trials):
        u, v = random.choice(vectors_in_set), random.choice(vectors_in_set)
        if not membership_test(u + v):
            return False
    return True

# xy-plane: z=0
xy_plane_test = lambda v: v[2] == 0
xy_samples = [np.array([1,2,0]), np.array([-3,0,0]), np.array([5,5,0])]
print(f"xy-plane closed under addition: {is_closed_under_addition(xy_samples, xy_plane_test)}")

# Shifted plane z=1: contains the zero vector? No.
contains_zero = xy_plane_test(np.array([0,0,0])) # reuse test differently
shifted_test = lambda v: v[2] == 1
print(f"Plane z=1 contains zero vector: {shifted_test(np.array([0,0,0]))}")
```

**Walkthrough.** This is a first, deliberately informal use of
**randomized spot-checking** as a plausibility test rather than a
proof — sampling several pairs and confirming closure holds for each
is evidence, not a guarantee (a subspace claim should really be
verified algebraically, the way the by-hand $xy$-plane argument
above was), but the practice of testing a mathematical claim against
random samples before/alongside a full proof is a genuinely common
and useful engineering habit, worth normalizing here in a low-stakes
setting.

---

### Span: Formalizing Lesson 4.5's "Linear Combination of Columns"

The **span** of a set of vectors $\{\mathbf v_1,\dots,\mathbf v_k\}$
is the set of *every possible* linear combination of them:

$$\text{span}\{\mathbf v_1,\dots,\mathbf v_k\} = \{c_1\mathbf v_1+c_2\mathbf v_2+\cdots+c_k\mathbf v_k : c_1,\dots,c_k\in\mathbb{R}\}$$

This is exactly Lesson 4.5's "$A\mathbf x$ is a linear combination of
$A$'s columns" idea, generalized from *one* specific combination
(picked out by a particular $\mathbf x$) to *every possible*
combination. The span of a matrix's columns has a name: the
**column space** of $A$, written $\text{col}(A)$ — and it answers a
question left implicit throughout Lesson 4.6: **$A\mathbf x=\mathbf
b$ has a solution at all exactly when $\mathbf b$ lies in
$\text{col}(A)$** — when $\mathbf b$ can be built as some combination
of $A$'s columns.

**Span in $\mathbb{R}^2$, geometrically:** the span of one nonzero
vector is a line through the origin; the span of two
*non-parallel* vectors is the entire plane; the span of two
*parallel* vectors is still just a line (the second vector adds
nothing new — a direct preview of "linear independence," Lesson
4.10).

```python
import numpy as np

def in_span(b, vectors, tol=1e-9):
    """
    Check whether b is in the span of the given vectors, by checking
    whether Ax=b (A's columns = the given vectors) has a solution --
    using rank: b is in the span iff appending it as a column doesn't
    increase the rank.
    """
    A = np.column_stack(vectors)
    rank_A = np.linalg.matrix_rank(A, tol=tol)
    rank_Ab = np.linalg.matrix_rank(np.column_stack([A, b]), tol=tol)
    return rank_A == rank_Ab

v1 = np.array([1, 0])
v2 = np.array([0, 1])
print(f"(3,5) in span{{v1,v2}}: {in_span(np.array([3,5]), [v1, v2])}")

# A degenerate span: two parallel vectors only cover a line
w1 = np.array([1, 2])
w2 = np.array([2, 4])   # parallel to w1
print(f"(1,0) in span{{w1,w2}} (a line): {in_span(np.array([1,0]), [w1, w2])}")
print(f"(2,4) in span{{w1,w2}}: {in_span(np.array([2,4]), [w1, w2])}")
```

**Walkthrough.** `np.linalg.matrix_rank` is a first appearance: the
**rank** of a matrix is the number of genuinely independent
directions its columns span (a forward reference to Lesson 4.10's
formal treatment of independence and dimension) — used here as a
practical black-box test: if adding $\mathbf b$ as an extra column
doesn't increase the rank, $\mathbf b$ was already reachable as a
combination of the existing columns, i.e., it's in their span. This
is the same rank-comparison idea, informally, that decides
solvability of $A\mathbf x=\mathbf b$ in general (not just the square,
unique-solution case Lesson 4.6 focused on).

---

### Null Space: Resolving Lesson 4.6's Deferred Question

The **null space** of a matrix $A$ is the set of all solutions to the
**homogeneous** system $A\mathbf x=\mathbf 0$:

$$\text{null}(A) = \{\mathbf x : A\mathbf x=\mathbf 0\}$$

This is always a genuine subspace (it contains $\mathbf 0$ trivially,
since $A\mathbf 0=\mathbf 0$ always; closure under addition and
scaling follow directly from the distributive properties of matrix
multiplication). Its size is exactly what Lesson 4.6 was missing:

- If $\text{null}(A) = \{\mathbf 0\}$ **only** — $A\mathbf x=\mathbf b$
  has **at most one** solution (unique, if it exists at all).
- If $\text{null}(A)$ contains **nonzero** vectors — whenever
  $A\mathbf x=\mathbf b$ has *any* solution $\mathbf x_0$, it
  automatically has **infinitely many**: $\mathbf x_0+\mathbf n$ for
  every $\mathbf n\in\text{null}(A)$ is also a solution, since
  $A(\mathbf x_0+\mathbf n)=A\mathbf x_0+A\mathbf n=\mathbf b+\mathbf
  0=\mathbf b$.

Combined with the column-space test above (does $\mathbf b\in
\text{col}(A)$ at all?), this fully resolves Lesson 4.6's open
question: **no solution** means $\mathbf b\notin\text{col}(A)$;
**infinitely many** means $\mathbf b\in\text{col}(A)$ *and*
$\text{null}(A)\ne\{\mathbf 0\}$; **unique** means $\mathbf
b\in\text{col}(A)$ *and* $\text{null}(A)=\{\mathbf 0\}$.

```python
import numpy as np

def null_space_basis(A, tol=1e-9):
    """
    Find a basis for the null space of A via row reduction to RREF,
    identifying free variables (columns without a pivot).
    """
    A = A.astype(float).copy()
    m, n = A.shape
    pivot_cols = []
    row = 0
    for col in range(n):
        pivot_candidates = np.where(np.abs(A[row:, col]) > tol)[0]
        if len(pivot_candidates) == 0:
            continue   # no pivot in this column -- it's a free variable
        pivot_row = row + pivot_candidates[0]
        A[[row, pivot_row]] = A[[pivot_row, row]]
        A[row, :] /= A[row, col]
        for r in range(m):
            if r != row:
                A[r, :] -= A[r, col] * A[row, :]
        pivot_cols.append(col)
        row += 1
        if row == m:
            break

    free_cols = [c for c in range(n) if c not in pivot_cols]
    basis = []
    for free_col in free_cols:
        vec = np.zeros(n)
        vec[free_col] = 1
        for i, pcol in enumerate(pivot_cols):
            vec[pcol] = -A[i, free_col]
        basis.append(vec)
    return basis

# A matrix whose columns are dependent -- non-trivial null space
A = np.array([[1, 2, 3], [2, 4, 6]])   # row 2 = 2 * row 1
basis = null_space_basis(A)
print(f"Null space basis vectors: {basis}")
for v in basis:
    print(f"  A @ {v} = {A @ v}  (should be all zeros)")
```

**Walkthrough.** `null_space_basis` extends Lesson 4.8's Gauss-Jordan
elimination in a genuinely new direction: instead of assuming every
column gets a pivot (true for a nice, invertible square matrix), it
explicitly tracks which columns *fail* to get one — those are the
**free variables**, columns whose corresponding unknown isn't pinned
down by the equations at all. For each free column, one basis vector
of the null space is built by setting that free variable to 1 (and
every other free variable to 0) and solving for the pivot variables
in terms of it — a systematic, general procedure for exactly the
"infinitely many solutions" case Lesson 4.6 could detect but not
fully describe.

---

### Manufacturing/Robotics Application: Redundant Degrees of Freedom

A robot arm's **Jacobian matrix** $J$ (properly developed in Lesson
4.14/10.2) relates joint velocities $\dot{\boldsymbol\theta}$ to
end-effector velocity: $\dot{\mathbf x}=J\dot{\boldsymbol\theta}$. A
**redundant manipulator** — one with more joints than strictly needed
for its task (common in real industrial arms, which often have 7
joints for a 6-degree-of-freedom task specifically to gain this
flexibility) — has a Jacobian whose null space is **nonzero**: there
exist joint motions $\dot{\boldsymbol\theta}$ that produce *zero*
end-effector motion at all — the arm can wiggle its internal joints
(useful for avoiding an obstacle or a singular pose) while the tool
tip stays perfectly still.

```python
import numpy as np

# A simplified Jacobian for a redundant planar arm: 2 output dimensions
# (end-effector x,y velocity), 3 joints -- more joints than needed
J = np.array([
    [1.0, 0.5, -0.5],
    [0.0, 0.87, 0.87],
])

null_basis = null_space_basis(J)
print(f"Jacobian null space basis: {null_basis}")

if null_basis:
    n_vec = null_basis[0]
    end_effector_motion = J @ n_vec
    print(f"\nJoint motion {n_vec} produces end-effector motion: {end_effector_motion}")
    print(f"(Should be ≈ zero -- this joint motion is 'free', doesn't move the tool tip)")
else:
    print("\nNo redundancy: every joint motion affects the end effector.")
```

**Walkthrough.** This section introduces no new syntax — the entire
point is that `null_space_basis`, built above purely to resolve a
Lesson 4.6 loose end about abstract linear systems, is *exactly* the
tool a robotics engineer uses to find a redundant arm's "self-motion"
directions — joint velocity combinations that leave the tool
perfectly still. This is a genuine, direct forward reference: exactly
this calculation, on exactly this kind of matrix, is core machinery
in Lesson 4.14 and 10.2's treatment of robot kinematics.

---

## Connect the Pieces

Concrete trace: a 3-joint planar arm with 2 end-effector output
dimensions.

1. **Vector space structure**: joint-velocity space ($\mathbb{R}^3$)
   and end-effector-velocity space ($\mathbb{R}^2$) are both vector
   spaces in the fully general sense from this lesson's opening.
2. **Column space of $J$**: the set of achievable end-effector
   velocities — here, all of $\mathbb{R}^2$, since the arm isn't
   under-actuated.
3. **Null space of $J$**: nonzero, confirming redundancy — one
   free joint-motion direction exists.
4. **Physical meaning**: that null-space vector is a joint motion the
   arm can execute (e.g., to dodge an obstacle) with *zero* effect on
   where the tool tip is — verified directly by multiplying it
   through $J$ and confirming the result is (numerically) zero.

---

## Summary

**Vector space**: a set closed under addition and scalar
multiplication, satisfying standard algebraic rules — $\mathbb{R}^n$,
matrices, and bounded-degree polynomials all qualify.

**Subspace**: contains zero, closed under addition and scaling —
must pass through the origin.

**Span / column space**: the set of every linear combination of a
set of vectors; $\mathbf b\in\text{col}(A)$ iff $A\mathbf x=\mathbf
b$ has a solution at all.

**Null space**: solutions to $A\mathbf x=\mathbf 0$; its size
resolves Lesson 4.6's unfinished distinction between no-solution and
infinite-solutions cases.

**New Python/CS concepts:**
- `np.linalg.matrix_rank` — practical span/dependency testing
- Free-variable identification via extended row reduction (building a
  null-space basis)
- Redundant robot Jacobians as a direct, real null-space application

---

## Problems

### Math

**1.** Is the set of vectors $(x,y)$ with $x+y=0$ a subspace of
$\mathbb{R}^2$? Check all three conditions.

<details><summary>Answer</summary>
Zero vector: $(0,0)$, $0+0=0$. ✓. Closure under addition: if
$x_1+y_1=0$ and $x_2+y_2=0$, then $(x_1+x_2)+(y_1+y_2)=0$. ✓. Closure
under scaling: $c(x+y)=c(0)=0$. ✓. Yes, a subspace (a line through
the origin).
</details>

---

**2.** Find the null space of
$A=\begin{pmatrix}1&2\\2&4\end{pmatrix}$ by solving $A\mathbf x=
\mathbf 0$ directly.

<details><summary>Answer</summary>
$x+2y=0 \Rightarrow x=-2y$. Every solution has the form $y(-2,1)$:
null space is the line spanned by $(-2,1)$.
</details>

---

**3.** A system $A\mathbf x=\mathbf b$ has $A$ a $3\times3$ matrix
with $\text{null}(A)=\{\mathbf 0\}$ only. What can you conclude about
the number of solutions, for any $\mathbf b$?

<details><summary>Answer</summary>
At most one solution for any $\mathbf b$ — and since
$\text{null}(A)=\{\mathbf0\}$ for a square matrix means $\det(A)\ne0$
(Lesson 4.7/4.8), a solution always exists too: exactly one, for
every $\mathbf b$.
</details>

---

### Code Challenges

**Challenge 1 — Subspace tester**

```python
import numpy as np

def is_subspace(membership_test, sample_vectors, dimension, n_trials=50):
    """
    Heuristically test whether a set (defined by membership_test) is
    a subspace of R^dimension: check zero-vector membership and
    closure under addition/scaling using random samples and scalars.
    """
    pass

# --- tests: do not modify ---
xy_plane = lambda v: abs(v[2]) < 1e-9
samples = [np.array([1.,2.,0.]), np.array([3.,-1.,0.]), np.array([0.,0.,0.])]
assert is_subspace(xy_plane, samples, 3)

shifted = lambda v: abs(v[2] - 1) < 1e-9
samples2 = [np.array([1.,2.,1.]), np.array([3.,-1.,1.])]
assert not is_subspace(shifted, samples2, 3)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Full system classifier**

```python
import numpy as np

def classify_full(A, b, tol=1e-9):
    """
    Return 'no_solution', 'unique', or 'infinite', using rank
    (column space membership) and null space size, per the lesson.
    """
    pass

# --- tests: do not modify ---
A1 = np.array([[1,2],[2,4]], dtype=float)
assert classify_full(A1, np.array([3,5.0])) == 'no_solution'
assert classify_full(A1, np.array([3,6.0])) == 'infinite'
A2 = np.array([[2,1],[1,-1]], dtype=float)
assert classify_full(A2, np.array([3,0.0])) == 'unique'
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Redundancy detector**

```python
import numpy as np

def is_redundant(J, tol=1e-9):
    """
    Given a Jacobian-like matrix J (rows = output dims, cols = joints),
    return True if the manipulator has redundant degrees of freedom
    (nonzero null space), False otherwise.
    """
    pass

# --- tests: do not modify ---
J_redundant = np.array([[1.0, 0.5, -0.5], [0.0, 0.87, 0.87]])
assert is_redundant(J_redundant)

J_exact = np.array([[1.0, 0.0], [0.0, 1.0]])   # 2 joints, 2 outputs: no redundancy
assert not is_redundant(J_exact)
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Prove that the null space of any matrix $A$ is genuinely
closed under addition — i.e., if $A\mathbf u=\mathbf 0$ and
$A\mathbf v=\mathbf 0$, show $A(\mathbf u+\mathbf v)=\mathbf 0$ too —
using only the distributive property of matrix multiplication over
vector addition (a property you can take as given, following directly
from the row-times-column definition in Lesson 4.4).

<details><summary>Answer</summary>
$$A(\mathbf u+\mathbf v) = A\mathbf u + A\mathbf v = \mathbf 0+\mathbf 0=\mathbf 0$$
using distributivity for the first step and the given
$A\mathbf u=\mathbf 0$, $A\mathbf v=\mathbf 0$ for the second.
$\blacksquare$ This is exactly why null space qualifies as a genuine
subspace rather than just an arbitrary solution set — the same
three-condition subspace test from earlier in this lesson applies,
and this proof discharges the "closed under addition" condition in
full generality, for any matrix $A$ whatsoever, not just the specific
examples computed numerically above.
</details>
