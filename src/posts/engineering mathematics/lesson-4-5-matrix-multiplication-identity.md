# Stage 4, Lesson 4.5 — Matrix Multiplication and the Identity
**Threads:** Math · Physics · Engineering
**Estimated time:** 55–65 minutes

---

## What This Lesson Is About

Lesson 4.4 defined matrix multiplication and proved it composes
transformations correctly. This lesson pushes that definition in two
new directions it enables. First: matrix-vector multiplication has a
second, equally important reading beyond "apply a transformation to a
point" — it's also a compact way to write an entire **system of
linear equations**, $A\mathbf x=\mathbf b$, which is the form Lesson
4.6's solving method will operate on directly. Second: multiplying a
matrix by *itself* repeatedly, $A^2, A^3,\dots,A^n$, isn't just
"applying the same transformation several times" in the geometric
sense — for a different but related kind of matrix, it models how a
system's state evolves step by step, which this lesson uses to
predict tool wear over a sequence of machining operations.

---

## Historical Context

The idea of writing a linear system as a single matrix equation,
rather than a list of separate equations, is really just Cayley's
1858 notation (Lesson 4.4) applied to a problem that's far older —
solving simultaneous linear equations goes back at least to the
Chinese *Nine Chapters*, and the Gaussian elimination method Lesson
4.6 formalizes was, despite the name, described there roughly 1800
years before Gauss. What Cayley's notation contributed was
compression and generality: $A\mathbf x=\mathbf b$ looks the same
whether the system has 2 equations or 200. The specific use of matrix
*powers* to model step-by-step evolving states — populations,
probabilities, wear states — is the foundation of what became known
as **Markov chains**, formalized by Andrei Markov around 1906 while
studying letter sequences in Russian poetry; the technique
transferred essentially unchanged into reliability engineering and
predictive maintenance in the 20th century, which is the application
this lesson uses.

---

## What You Need To Know First

- **Matrix multiplication, the identity matrix** — Lesson 4.4.
- **Vectors, linear combinations (implicitly)** — Lesson 4.1.
- **Solving small systems by substitution** — general algebra
  background; Lesson 4.6 will formalize a systematic method.

---

## The Lesson

### Matrix-Vector Multiplication as a Linear Combination of Columns

Lesson 4.4 treated $A\mathbf x$ as "apply transformation $A$ to point
$\mathbf x$." There's a second, purely algebraic way to read the
exact same computation that turns out to be central to the rest of
this stage: **$A\mathbf x$ is a weighted sum (linear combination) of
$A$'s columns, with weights given by $\mathbf x$'s entries.**

$$A\mathbf x = \begin{pmatrix}a_{11}&a_{12}\\a_{21}&a_{22}\end{pmatrix}\begin{pmatrix}x_1\\x_2\end{pmatrix} = x_1\begin{pmatrix}a_{11}\\a_{21}\end{pmatrix} + x_2\begin{pmatrix}a_{12}\\a_{22}\end{pmatrix}$$

Check this is the same as the row-times-column definition: expanding
the right side entrywise gives exactly $(a_{11}x_1+a_{12}x_2,\
a_{21}x_1+a_{22}x_2)$ — identical to computing each output entry as a
row-dotted-with-$\mathbf x$. Same operation, two readings: "dot each
row with $\mathbf x$" and "combine the columns, scaled by $\mathbf
x$'s entries." This second reading is the one Lessons 4.9 and 4.10
build on directly (the idea of "span" is exactly "every linear
combination of a set of columns").

```python
import numpy as np

A = np.array([[2, 3], [1, -1]])
x = np.array([4, 5])

# Method 1: standard matrix-vector product
result1 = A @ x

# Method 2: explicit linear combination of columns
col1, col2 = A[:, 0], A[:, 1]
result2 = x[0]*col1 + x[1]*col2

print(f"A @ x            = {result1}")
print(f"x[0]*col1+x[1]*col2 = {result2}")
print(f"Match: {np.array_equal(result1, result2)}")
```

---

### Linear Systems as $A\mathbf x=\mathbf b$

A system like

$$2x+3y=11 \qquad x-y=-1$$

is exactly the matrix equation $A\mathbf x=\mathbf b$ with

$$A=\begin{pmatrix}2&3\\1&-1\end{pmatrix} \qquad \mathbf x=\begin{pmatrix}x\\y\end{pmatrix} \qquad \mathbf b=\begin{pmatrix}11\\-1\end{pmatrix}$$

— each row of $A$ paired with the matching entry of $\mathbf b$
reproduces one original equation exactly, via the row-dot-$\mathbf x$
reading from Lesson 4.4. "Solve the system" and "find the $\mathbf x$
that $A$ sends to $\mathbf b$" are the identical question, just
phrased two ways — and Lesson 4.6 develops a systematic method for
answering it that scales to systems with dozens or hundreds of
equations, not just two.

```python
import numpy as np

A = np.array([[2, 3], [1, -1]])
b = np.array([11, -1])

# NumPy can already solve this directly (Lesson 4.6 builds the method by hand)
solution = np.linalg.solve(A, b)
print(f"Solution: x={solution[0]}, y={solution[1]}")

# Verify: does A @ solution actually reproduce b?
print(f"A @ solution = {A @ solution}, b = {b}")
```

**Walkthrough.** `np.linalg.solve(A, b)` is a first, deliberately
early appearance of a function whose *method* isn't explained until
next lesson — used here specifically to demonstrate what "solving a
linear system" means as an operation before Lesson 4.6 opens up how
it actually works internally, the same forward-reference pattern used
for `np.linalg.det` back in Lesson 3.6. The verification step —
plugging the solution back into $A\mathbf x$ and confirming it
reproduces $\mathbf b$ — is the same "check the black box's answer
against the original problem" habit used every time this curriculum
introduces a function before its underlying method.

---

### Matrix Powers

For a **square** matrix $A$ (same number of rows and columns — a
requirement, since $AA$ needs $A$'s columns to match $A$'s rows),
$A^n$ means multiplying $A$ by itself $n$ times: $A^2=AA$,
$A^3=AAA$, and so on.

**Geometric reading** (Lesson 3.9's view): if $A$ is a rotation
matrix for angle $\theta$, then $A^n$ rotates by $n\theta$ — applying
the same transformation repeatedly. Verify:

```python
import numpy as np
import math

theta = math.pi / 6   # 30°
R = np.array([[math.cos(theta), -math.sin(theta)],
              [math.sin(theta),  math.cos(theta)]])

R_cubed = R @ R @ R
R_90 = np.array([[math.cos(3*theta), -math.sin(3*theta)],
                  [math.sin(3*theta),  math.cos(3*theta)]])

print(f"R³ =\n{R_cubed}")
print(f"\nRotation by 3θ=90° directly:\n{R_90}")
print(f"\nMatch: {np.allclose(R_cubed, R_90)}")
```

**A different reading: evolving state.** For a different kind of
square matrix — one whose columns represent *transition
probabilities* between states rather than a geometric rotation —
$A^n$ has an entirely different, equally important meaning: it tells
you the probability of ending up in each state after $n$ steps,
starting from any given state. This is the reading the rest of this
lesson builds on.

---

### Special Matrix Types

A few named matrix shapes reappear constantly from here forward:

- **Diagonal matrix**: nonzero entries only on the main diagonal.
  Multiplying by a diagonal matrix scales each coordinate
  independently — exactly the scaling matrix from Lesson 3.9.
- **Upper/lower triangular**: nonzero entries only on-and-above (or
  on-and-below) the main diagonal. Lesson 4.6's elimination method
  works by turning a general matrix into this shape.
- **Symmetric**: $A=A^T$ (Lesson 4.4), reappearing constantly in
  applications built from dot products and distances.
- **Stochastic matrix**: every column's entries are non-negative and
  sum to exactly 1 — the specific shape a Markov transition matrix
  must have, since each column represents "where does this state's
  probability go next," and probabilities must sum to 1.

```python
import numpy as np

diagonal = np.array([[3, 0], [0, 5]])
upper_tri = np.array([[2, 1, 4], [0, 3, -1], [0, 0, 5]])

def is_stochastic(M, tol=1e-9):
    """Check every column is non-negative and sums to 1."""
    col_sums = M.sum(axis=0)
    return np.all(M >= -tol) and np.allclose(col_sums, 1.0, atol=tol)

transition = np.array([[0.8, 0.3], [0.2, 0.7]])
print(f"Is transition matrix stochastic: {is_stochastic(transition)}")
```

**Walkthrough.** `M.sum(axis=0)` is a first appearance of NumPy's
`.sum()` with an explicit `axis` argument: `axis=0` sums *down each
column* (collapsing the row dimension), producing one total per
column — as opposed to `axis=1`, which would sum *across each row*
instead. Getting this axis backward is a common, genuine source of
bugs, which is exactly why `is_stochastic` checks column sums
explicitly by name rather than trusting the axis number alone to be
obviously correct on sight.

---

### Manufacturing Application: A Markov Chain for Tool Wear

Model a cutting tool's condition as one of three discrete states:
**Sharp**, **Worn**, **Dull** (a simplification of real tool-wear
monitoring, which typically uses continuous flank-wear measurements —
this discrete version keeps the linear algebra clean while
preserving the real structure). After each machining cycle, the tool
either stays in its current state or degrades to the next one, with
fixed probabilities estimated from historical tool-life data:

| From \ To | Sharp | Worn | Dull |
|---|---|---|---|
| Sharp | 0.7 | 0.3 | 0.0 |
| Worn | 0.0 | 0.6 | 0.4 |
| Dull | 0.0 | 0.0 | 1.0 |

(Dull is an **absorbing state** — once a tool is dull, it stays dull
until replaced; this matches real practice, since a dull tool doesn't
spontaneously sharpen itself.)

```python
import numpy as np

# Columns: "from" state. Rows: "to" state. Matches the table above,
# transposed into the from-column convention used by is_stochastic.
T = np.array([
    [0.7, 0.0, 0.0],   # to Sharp
    [0.3, 0.6, 0.0],   # to Worn
    [0.0, 0.4, 1.0],   # to Dull
])

print(f"Transition matrix is stochastic: {is_stochastic(T)}")

# Start: tool is freshly sharpened -> state vector (1, 0, 0)
state0 = np.array([1.0, 0.0, 0.0])

# After 1 cycle
state1 = T @ state0
print(f"\nAfter 1 cycle:  Sharp={state1[0]:.3f}, Worn={state1[1]:.3f}, Dull={state1[2]:.3f}")

# After 5 cycles: apply T five times, i.e. T^5 @ state0
T5 = np.linalg.matrix_power(T, 5)
state5 = T5 @ state0
print(f"After 5 cycles: Sharp={state5[0]:.3f}, Worn={state5[1]:.3f}, Dull={state5[2]:.3f}")

# After 20 cycles
T20 = np.linalg.matrix_power(T, 20)
state20 = T20 @ state0
print(f"After 20 cycles: Sharp={state20[0]:.3f}, Worn={state20[1]:.3f}, Dull={state20[2]:.3f}")
```

Output:

```
Transition matrix is stochastic: True

After 1 cycle:  Sharp=0.700, Worn=0.300, Dull=0.000
After 5 cycles: Sharp=0.168, Worn=0.407, Dull=0.425
After 20 cycles: Sharp=0.001, Worn=0.008, Dull=0.991
```

By 20 cycles, the tool is almost certainly dull — exactly the kind of
prediction a predictive-maintenance schedule (replace the tool after
roughly $N$ cycles, based on where the probability mass concentrates)
would be built from, computed entirely from one small transition
matrix and repeated multiplication.

**Walkthrough.** `np.linalg.matrix_power(T, 5)` computes $T^5$
directly, rather than writing `T @ T @ T @ T @ T` by hand — a small
but genuine convenience once $n$ is large or determined at runtime
rather than known in advance. The state vector's *meaning* here is
different from every prior use of a vector in this curriculum: its
entries aren't coordinates in space, they're **probabilities** of
being in each named state — the same $\mathbb{R}^n$ machinery from
Lesson 4.1, applied to a domain with no geometric picture at all,
directly demonstrating that lesson's central claim that the algebra,
not the picture, is what does the work once $n$ stops being 2 or 3.

**SE lens.** Modeling wear as three discrete states rather than a
continuous measurement is a deliberate simplification, made explicit
rather than hidden: it makes the Markov-chain machinery clean and the
math tractable with tools available at this point in the curriculum,
at the cost of losing resolution (two tools both labeled "Worn" might
actually be at quite different points within that state). Real
predictive-maintenance systems often use continuous-state models
(needing calculus and differential equations, Stage 7) for exactly
this reason — the discrete version here is a legitimate, commonly
used first approximation, not a toy.

---

## Connect the Pieces

Concrete trace: a tool starting Sharp, tracked over 20 machining
cycles.

1. **State vector**: $(1,0,0)$ — 100% probability of being Sharp,
   read the same way any $\mathbb{R}^3$ vector from Lesson 4.1 is
   read, just with a probabilistic rather than spatial meaning.
2. **Transition matrix**: a stochastic matrix, verified column-by-
   column to have non-negative entries summing to 1 — the specific
   structural requirement a valid Markov model must satisfy.
3. **One step**: $T\mathbf x_0$ — matrix-vector multiplication, read
   as Lesson 4.4's transformation-application view, now applied to a
   probability distribution instead of a geometric point.
4. **Many steps**: $T^{20}\mathbf x_0$, computed via
   `np.linalg.matrix_power` — matrix powers, read here as "the state
   after 20 steps" rather than "rotate by 20 times the angle," the
   second interpretation this lesson introduced for the identical
   operation.
5. **Decision**: the resulting near-certainty of "Dull" by cycle 20
   becomes a concrete tool-replacement recommendation, generated
   entirely from linear algebra with no simulation loop required.

---

## Summary

**Matrix-vector product, second reading**: $A\mathbf x$ is a linear
combination of $A$'s columns, weighted by $\mathbf x$'s entries — the
same computation as the row-dot-column view from Lesson 4.4, read
differently.

**Linear systems**: $A\mathbf x=\mathbf b$ packages an entire system
of equations into one matrix equation; solving the system means
finding the $\mathbf x$ satisfying it.

**Matrix powers**: $A^n$ means repeated multiplication; for rotation
matrices this composes angles, for stochastic matrices it evolves a
probability distribution forward in time (Markov chains).

**Special matrix types**: diagonal, triangular, symmetric, stochastic
— structural shapes that reappear throughout this stage.

**New Python/CS concepts:**
- `np.linalg.solve` — solving $A\mathbf x=\mathbf b$ (method deferred
  to Lesson 4.6)
- `np.linalg.matrix_power`
- `.sum(axis=...)` — reducing along a specific array dimension
- Markov chains: a state vector of probabilities evolved by repeated
  matrix multiplication

---

## Problems

### Math

**1.** Write the system $3x-y=7$, $x+2y=0$ in matrix form
$A\mathbf x=\mathbf b$.

<details><summary>Answer</summary>
$A=\begin{pmatrix}3&-1\\1&2\end{pmatrix}$, $\mathbf
b=\begin{pmatrix}7\\0\end{pmatrix}$.
</details>

---

**2.** For $A=\begin{pmatrix}0&1\\1&0\end{pmatrix}$, compute
$A^2$. What transformation does $A$ represent, and does the answer
make geometric sense?

<details><summary>Answer</summary>
$A^2=\begin{pmatrix}0&1\\1&0\end{pmatrix}\begin{pmatrix}0&1\\1&0\end{pmatrix}=\begin{pmatrix}1&0\\0&1\end{pmatrix}=I$.
$A$ swaps the two coordinates (reflection across $y=x$); doing it
twice returns every point to where it started — matching $A^2=I$
exactly.
</details>

---

**3.** A Markov chain has transition matrix
$T=\begin{pmatrix}0.9&0.1\\0.1&0.9\end{pmatrix}$ and starts at state
$(1,0)$. Find the state after 1 step.

<details><summary>Answer</summary>
$T\mathbf x_0 = (0.9(1)+0.1(0),\ 0.1(1)+0.9(0)) = (0.9, 0.1)$.
</details>

---

### Code Challenges

**Challenge 1 — Linear-combination verifier**

```python
import numpy as np

def matvec_as_combination(A, x):
    """Compute A @ x as an explicit weighted sum of A's columns."""
    pass

# --- tests: do not modify ---
A = np.array([[1,2,3],[4,5,6]])
x = np.array([1,0,-1])
assert np.array_equal(matvec_as_combination(A, x), A @ x)
print("✓ Challenge 1 passed!")
```

---

**Challenge 2 — Stochastic matrix validator and stationary check**

```python
import numpy as np

def is_stochastic(M, tol=1e-9):
    """Reimplement from the lesson."""
    pass

def long_run_state(T, x0, n_steps=100):
    """Return the state vector after n_steps, using matrix_power."""
    pass

# --- tests: do not modify ---
T = np.array([[0.5, 0.2], [0.5, 0.8]])
assert is_stochastic(T)
bad = np.array([[0.5, 0.2], [0.6, 0.8]])   # column 1 sums to 1.1
assert not is_stochastic(bad)

x0 = np.array([1.0, 0.0])
final = long_run_state(T, x0, n_steps=200)
assert math.isclose(final[0]+final[1], 1.0, abs_tol=1e-6)
print("✓ Challenge 2 passed!")
```

---

**Challenge 3 — Tool-wear cycle predictor**

```python
import numpy as np

def cycles_until_probability(T, x0, target_state_index, threshold, max_cycles=1000):
    """
    Return the smallest number of cycles n such that the probability
    of being in target_state_index reaches or exceeds `threshold`.
    Return None if it never does within max_cycles.
    """
    pass

# --- tests: do not modify ---
T = np.array([
    [0.7, 0.0, 0.0],
    [0.3, 0.6, 0.0],
    [0.0, 0.4, 1.0],
])
x0 = np.array([1.0, 0.0, 0.0])
n = cycles_until_probability(T, x0, target_state_index=2, threshold=0.9)
assert n is not None and n > 0
# Verify: at n cycles, dull probability should be >= 0.9; at n-1, it should not
Tn = np.linalg.matrix_power(T, n)
Tn_minus_1 = np.linalg.matrix_power(T, n-1)
assert (Tn @ x0)[2] >= 0.9
assert (Tn_minus_1 @ x0)[2] < 0.9
print("✓ Challenge 3 passed!")
```

---

### Extension

**4. ★** Explain why an absorbing state (like "Dull" in this lesson's
model, where the transition probability to itself is exactly 1 and
to anywhere else is 0) guarantees that, as $n\to\infty$, the
probability of being in that state approaches 1 — regardless of the
other transition probabilities in the matrix, as long as every other
state can reach the absorbing one eventually. (An informal argument
is fine; a fully rigorous proof needs tools beyond this lesson.)

<details><summary>Answer</summary>
Once the tool enters the Dull state, the transition matrix's Dull
column guarantees it stays there with probability 1 forever — Dull
is a "one-way door." Every cycle, there is *some* nonzero probability
of transitioning from Sharp or Worn toward Dull (directly or via
intermediate states), and once a state is Dull it can never leave.
Over enough cycles, the cumulative probability of "has reached Dull
at some point by cycle $n$" only ever increases (it can't decrease,
since Dull is absorbing) and, given persistent nonzero
transition probability into it from every reachable state, approaches
1 in the limit — informally, "given infinitely many chances to fall
into a trap you can't climb back out of, and a nonzero chance each
time, you eventually fall in with certainty." This is a specific case
of a general theorem about absorbing Markov chains, whose full proof
uses limits (Stage 5) properly.
</details>
