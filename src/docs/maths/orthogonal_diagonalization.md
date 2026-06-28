# Orthogonal Diagonalization and the Spectral Theorem
## Every concept earned before it is named. Nothing assumed.

---

## What this document assumes you already know

```
✓ A matrix is a grid of numbers
✓ Eigenvalues and eigenvectors: Av = λv
✓ The dot product: u·v = u₁v₁ + u₂v₂ + ...
✓ Orthogonal means dot product = 0
✓ A unit vector has norm = 1
✓ Norm = √(v·v)
✓ Transpose: flipping rows and columns of a matrix
```

If any of those feel shaky, stop here and review them first.
Everything below builds on all of them.

---

## Part 1: What is a transpose? (Defined precisely with numbers)

The transpose of a matrix A, written Aᵀ, is formed by
swapping rows and columns.

```
A = [1  2  3]       Aᵀ = [1  4]
    [4  5  6]             [2  5]
                          [3  6]
```

Row 1 of A becomes Column 1 of Aᵀ.
Row 2 of A becomes Column 2 of Aᵀ.

**Entry-level rule:** entry (i,j) of A becomes entry (j,i) of Aᵀ.
So entry at row 1, column 2 of A (which is 2) becomes entry at
row 2, column 1 of Aᵀ (which is also 2). The row and column
indices swap.

```matlab
A = [1 2 3; 4 5 6];
A'      % apostrophe is MATLAB's transpose operator
```

---

## Part 2: What is a symmetric matrix?

**Definition:** A matrix A is symmetric if A = Aᵀ.

In plain English: the matrix looks the same when you flip it
across its diagonal (top-left to bottom-right).

**What this means entry by entry:** entry (i,j) equals entry (j,i)
for every i and j. In other words, the entry in row i, column j
equals the entry in row j, column i.

Example:

```
A = [-1   2   9]
    [ 2  -5   0]
    [ 9   0   3]
```

Check: entry (1,2) = 2, entry (2,1) = 2. Equal. ✓
Check: entry (1,3) = 9, entry (3,1) = 9. Equal. ✓
Check: entry (2,3) = 0, entry (3,2) = 0. Equal. ✓

**Visually:** the matrix is a mirror image of itself across
its diagonal. The diagonal itself (top-left to bottom-right)
can be anything.

**Why symmetric matrices matter:** they show up everywhere in
applications — covariance matrices in statistics, distance
matrices, physics equations. The spectral theorem tells us
they have a beautifully clean structure.

```matlab
A = [-1 2 9; 2 -5 0; 9 0 3];
issymmetric(A)      % returns 1 if symmetric, 0 if not
isequal(A, A')      % another way to check: is A equal to its transpose?
```

---

## Part 3: What is an orthogonal matrix?

**Definition:** A matrix P is orthogonal if Pᵀ = P⁻¹.

Equivalently: PᵀP = I (where I is the identity matrix).

**What this means in plain terms:** the columns of P are
orthonormal — every column is a unit vector, and every
pair of different columns is orthogonal (dot product = 0).

Example: the simplest orthogonal matrix is the identity:

```
I = [1  0]
    [0  1]
```

Columns are (1,0) and (0,1). They are unit vectors (norm=1)
and orthogonal (dot product = 0). So Iᵀ = I⁻¹ = I.

A rotation matrix is also orthogonal:

```
P = [cos θ   -sin θ]
    [sin θ    cos θ]
```

This rotates every vector by angle θ. Its columns are unit
vectors and perpendicular to each other.

**Why does Pᵀ = P⁻¹ follow from orthonormal columns?**

If columns of P are v₁, v₂, ..., vₙ (orthonormal), then PᵀP
gives a matrix whose (i,j) entry is the dot product of column i
with column j.

```
(PᵀP)ᵢⱼ = vᵢ · vⱼ
```

Since columns are orthonormal:
- vᵢ · vᵢ = 1 (each column has norm 1)
- vᵢ · vⱼ = 0 when i≠j (different columns are orthogonal)

So PᵀP has 1s on the diagonal and 0s everywhere else — that
IS the identity matrix I. Therefore Pᵀ = P⁻¹.

```matlab
P = [1/sqrt(2)  -1/sqrt(2);
     1/sqrt(2)   1/sqrt(2)];

% Check orthogonality
P' * P          % should give identity matrix
det(P)          % should be +1 or -1 for orthogonal matrices
```

---

## Part 4: What is diagonalization? (Review)

You saw this in chapter 6. Quick review:

A matrix A is diagonalizable if you can write:

```
A = PDP⁻¹
```

Where:
- P is a matrix whose columns are eigenvectors of A
- D is a diagonal matrix with eigenvalues on the diagonal
- P⁻¹ is the inverse of P

This is equivalent to: P⁻¹AP = D.

**Why diagonalization is useful:** D is diagonal, so raising D
to a power is trivial (just raise each diagonal entry to that power).
This makes computing Aⁿ easy.

---

## Part 5: What is ORTHOGONAL diagonalization? (The new thing)

**Definition:** A matrix A is orthogonally diagonalizable if
there exists an ORTHOGONAL matrix P such that:

```
PᵀAP = D
```

Where D is diagonal.

**How this differs from regular diagonalization:**

Regular diagonalization: A = PDP⁻¹, where P is any invertible matrix.

Orthogonal diagonalization: PᵀAP = D, where P is specifically
ORTHOGONAL (meaning its columns are orthonormal eigenvectors).

Since P is orthogonal, Pᵀ = P⁻¹. So:

```
PᵀAP = D    is the same as    P⁻¹AP = D    when P is orthogonal
```

The requirement is stricter: not just any invertible P, but
specifically one whose columns are ORTHONORMAL eigenvectors.

**Why bother with this stricter requirement?** Because orthogonal
matrices are numerically stable, easy to invert (just transpose),
and preserve lengths and angles. In applications (data science,
physics, signal processing), orthogonal diagonalization is
far more useful than regular diagonalization.

---

## Part 6: The Spectral Theorem — what it says and why it matters

**The theorem (three facts):**

For any SYMMETRIC matrix A:

```
Fact 1: A is orthogonally diagonalizable.
        (A symmetric matrix can ALWAYS be orthogonally diagonalized)

Fact 2: All eigenvalues of A are real numbers.
        (No complex numbers, even though complex eigenvalues
         are possible for non-symmetric matrices)

Fact 3: Eigenvectors from DIFFERENT eigenvalues are orthogonal.
        (If λ₁ ≠ λ₂, their eigenvectors v₁ and v₂ satisfy v₁·v₂ = 0)
```

**Why "spectral"?** The "spectrum" of a matrix is its set of
eigenvalues. This theorem completely describes the eigenvalue
structure of symmetric matrices.

**Why it matters:** symmetric matrices are everywhere. Knowing
they are always orthogonally diagonalizable means you can always
decompose them cleanly using their eigenvectors as axes.

---

## Part 7: Verifying Fact 2 and Fact 3 with a concrete example

Let A = [[-1, 2], [2, 2]]. A is symmetric (check: a₁₂=2=a₂₁ ✓).

```matlab
A = [-1 2; 2 2];

% Find eigenvalues and eigenvectors
[V, D] = eig(A)
```

**Fact 2 check:** all eigenvalues on D's diagonal should be real.
They will be — no i appearing.

**Fact 3 check:** eigenvectors from different eigenvalues should
be orthogonal.

```matlab
v1 = V(:,1);    % first eigenvector (all rows, column 1)
v2 = V(:,2);    % second eigenvector

dot(v1, v2)     % should be 0 (or very close, due to rounding)
```

---

## Part 8: How to actually PERFORM orthogonal diagonalization

**The algorithm — step by step:**

**Step 1:** Find all eigenvalues of A by solving det(A−λI) = 0.

**Step 2:** For each eigenvalue, find its eigenvectors by solving
(A−λI)v = 0.

**Step 3:** If any eigenvalue has MORE than one eigenvector
(geometric multiplicity > 1), apply Gram-Schmidt to make those
eigenvectors orthogonal to each other.
(Eigenvectors from DIFFERENT eigenvalues are already orthogonal
by Fact 3 — Gram-Schmidt is only needed WITHIN the same eigenvalue.)

**Step 4:** Normalize every eigenvector to length 1 (divide by norm).

**Step 5:** Put the normalized eigenvectors as columns of P.
Put the corresponding eigenvalues on the diagonal of D.

**Step 6:** Verify: PᵀAP should equal D.

---

## Part 9: Worked example — complete, every step shown

**A = [[-1, 2], [2, 2]]**

First, confirm A is symmetric:

```
A = [-1  2]
    [ 2  2]

Aᵀ = [-1  2]    =  A ✓
     [ 2  2]
```

**Step 1: Find eigenvalues**

Build A−λI (subtract λ from diagonal entries):

```
A - λI = [-1-λ   2  ]
         [  2   2-λ ]
```

Set determinant = 0:

```
det(A−λI) = (-1-λ)(2-λ) - (2)(2)
```

Expand (-1-λ)(2-λ):

```
= (-1)(2) + (-1)(-λ) + (-λ)(2) + (-λ)(-λ)
= -2 + λ - 2λ + λ²
= λ² - λ - 2
```

So:

```
det = λ² - λ - 2 - 4 = λ² - λ - 6
```

Set equal to zero and factor:

```
λ² - λ - 6 = 0
(λ - 3)(λ + 2) = 0
λ = 3    or    λ = -2
```

**Eigenvalues: λ₁ = 3, λ₂ = -2** (both real ✓ — Fact 2 confirmed)

**Step 2: Find eigenvectors**

**For λ₁ = 3:** solve (A−3I)v = 0

```
A - 3I = [-1-3   2  ] = [-4   2]
         [  2   2-3]    [ 2  -1]
```

Row reduce:

```
[-4  2]  →  R1 ÷ (-4)  →  [1  -1/2]  →  R2 - 2R1  →  [1  -1/2]
[ 2 -1]                    [2  -1  ]                   [0   0   ]
```

Equation: v₁ - (1/2)v₂ = 0  →  v₁ = (1/2)v₂

Let v₂ = 2 (to get whole numbers):  v₁ = 1

```
Eigenvector for λ=3:  v₁ = [1]
                            [2]
```

**For λ₂ = -2:** solve (A+2I)v = 0

```
A + 2I = [-1+2   2  ] = [1  2]
         [  2   2+2]    [2  4]
```

Row reduce:

```
[1  2] →  R2 - 2R1  →  [1  2]
[2  4]                  [0  0]
```

Equation: v₁ + 2v₂ = 0  →  v₁ = -2v₂

Let v₂ = 1:  v₁ = -2

```
Eigenvector for λ=-2:  v₂ = [-2]
                              [ 1]
```

**Step 3: Check orthogonality between eigenvectors**

```
v₁ · v₂ = (1)(-2) + (2)(1) = -2 + 2 = 0  ✓
```

They are already orthogonal — Fact 3 guaranteed this since
λ=3 ≠ λ=-2.

**Step 4: Normalize each eigenvector**

```
||v₁|| = √(1² + 2²) = √5

w₁ = v₁/||v₁|| = [1/√5]
                  [2/√5]
```

```
||v₂|| = √((-2)² + 1²) = √5

w₂ = v₂/||v₂|| = [-2/√5]
                  [ 1/√5]
```

**Step 5: Build P and D**

```
P = [1/√5    -2/√5]    D = [3    0]
    [2/√5     1/√5]        [0   -2]
```

P's columns are the normalized eigenvectors.
D's diagonal entries are the corresponding eigenvalues
(λ=3 in column 1 matches w₁, λ=-2 in column 2 matches w₂).

**Step 6: Verify PᵀAP = D**

```matlab
A = [-1 2; 2 2];
P = [1/sqrt(5) -2/sqrt(5); 2/sqrt(5) 1/sqrt(5)];
D_check = P' * A * P
% Should give [3 0; 0 -2]
```

---

## Part 10: Why PᵀAP = D works — the intuition

Here is the picture:

```
P converts FROM eigenvector coordinates TO standard coordinates.
Pᵀ converts FROM standard coordinates TO eigenvector coordinates.
```

So Pᵀ(A(P(x))) means:
1. P converts x into standard coordinates
2. A applies its transformation (rotate+stretch)
3. Pᵀ converts back to eigenvector coordinates

In eigenvector coordinates, A just stretches each direction by
its eigenvalue — no rotation. That's exactly what a diagonal
matrix does (just multiply each component by a number). So
PᵀAP = D.

---

## Part 11: Why the proof uses "induction" — what that word means

The proof in your textbook uses induction. Here is what that means.

**Induction** is a proof technique that works in two steps:

1. **Base case:** prove the statement is true for the smallest case.
   Here: prove a 1×1 symmetric matrix is orthogonally diagonalizable.
   A 1×1 matrix is just one number [a]. Its only eigenvalue is a
   (real ✓). P = [1] (which is orthogonal ✓). PᵀAP = [a] = D ✓.

2. **Inductive step:** prove that IF the statement holds for all
   (n-1)×(n-1) symmetric matrices, THEN it also holds for any
   n×n symmetric matrix.

If both steps are true, the statement holds for all sizes by
chain reasoning:
- True for 1×1 (base case)
- True for 1×1 → true for 2×2 (inductive step)
- True for 2×2 → true for 3×3 (inductive step again)
- True for 3×3 → true for 4×4 ...
- And so on forever.

The proof in your textbook is showing the inductive step — it
assumes it works for (n-1)×(n-1) and builds the n×n case from it.

---

## Part 12: MATLAB — complete code with every line explained

```matlab
%% ORTHOGONAL DIAGONALIZATION IN MATLAB

% Define a symmetric matrix
% Check that it's symmetric: entry (i,j) = entry (j,i) for all i,j
A = [-1 2; 2 2];

% isequal(A, A') checks if A equals its own transpose
% A' is the transpose in MATLAB (apostrophe)
disp('Is A symmetric?')
disp(isequal(A, A'))     % should print 1 (true)

%% STEP 1: Find eigenvalues and eigenvectors
% [V, D] = eig(A) returns:
%   V: a matrix whose COLUMNS are eigenvectors
%   D: a diagonal matrix whose diagonal entries are eigenvalues
%   The i-th column of V matches the i-th diagonal entry of D
[V, D] = eig(A);

disp('Eigenvalues (diagonal of D):')
disp(diag(D))    % diag(D) extracts diagonal entries as a column vector

disp('Eigenvectors (columns of V):')
disp(V)

%% STEP 2: Check eigenvectors are orthogonal to each other
% V(:,1) means "all rows, column 1" — extracts the first eigenvector
% V(:,2) means "all rows, column 2" — extracts the second eigenvector
v1 = V(:,1);
v2 = V(:,2);

disp('Dot product of eigenvectors (should be 0 if orthogonal):')
disp(dot(v1, v2))

%% STEP 3: Check eigenvectors are already unit vectors
% norm(v) computes the Euclidean length of v = sqrt(v·v)
disp('Norm of v1 (should be 1):')
disp(norm(v1))

disp('Norm of v2 (should be 1):')
disp(norm(v2))

% eig() automatically returns normalized eigenvectors
% so they should already be unit vectors

%% STEP 4: P is already built — it's the V matrix from eig()
% The columns of V are already orthonormal eigenvectors
P = V;

%% STEP 5: Verify orthogonal diagonalization: P'*A*P should equal D
% P' is the transpose of P
% P'*A*P performs matrix multiplication: (Pᵀ)(A)(P)
result = P' * A * P;

disp('P_transpose * A * P (should equal D):')
disp(result)

disp('D (eigenvalue matrix):')
disp(D)

% Check they match (within floating point tolerance)
disp('Do they match? (1=yes, 0=no):')
disp(max(max(abs(result - D))) < 1e-10)

%% STEP 6: Verify P is orthogonal — Pᵀ should equal P⁻¹
% P'*P should give the identity matrix
disp('P_transpose * P (should be identity):')
disp(P' * P)

%% DOING IT MANUALLY (so you see every step)

% Find eigenvalues by solving characteristic polynomial
syms lam
char_poly = det(A - lam*eye(2));
disp('Characteristic polynomial:')
disp(char_poly)

eigenvalues = solve(char_poly == 0, lam);
disp('Eigenvalues:')
disp(eigenvalues)

% For each eigenvalue, find eigenvector manually
lambda1 = double(eigenvalues(1));
lambda2 = double(eigenvalues(2));

% Eigenvector for lambda1: solve (A - lambda1*I)v = 0
% null(M, 'r') finds the null space of M with rational (exact) output
eigvec1 = null(A - lambda1*eye(2), 'r');
disp('Eigenvector for lambda1:')
disp(eigvec1)

eigvec2 = null(A - lambda2*eye(2), 'r');
disp('Eigenvector for lambda2:')
disp(eigvec2)

% Normalize each eigenvector (divide by its norm)
w1 = eigvec1 / norm(eigvec1);
w2 = eigvec2 / norm(eigvec2);

% Build P from normalized eigenvectors as columns
% [w1, w2] puts w1 and w2 side by side as columns
P_manual = [w1, w2];

D_manual = [lambda1  0;
            0        lambda2];

disp('Manual P:')
disp(P_manual)

disp('Manual D:')
disp(D_manual)

disp('Manual P_transpose * A * P:')
disp(P_manual' * A * P_manual)
```

---

## Part 13: Common mistakes and how to catch them

```
❌ Mistake 1: Using non-normalized eigenvectors in P
   Symptom: P'*A*P gives something diagonal but P'*P ≠ I
   Fix: always divide each eigenvector by its norm before
        building P

❌ Mistake 2: Mismatching eigenvalue and eigenvector order
   Symptom: P'*A*P is diagonal but the diagonal doesn't match D
   Fix: the i-th column of P must match the i-th diagonal of D —
        always build them together

❌ Mistake 3: Trying to orthogonally diagonalize a non-symmetric matrix
   Symptom: eigenvectors are not orthogonal to each other
   Fix: check isequal(A, A') first — if A is not symmetric,
        orthogonal diagonalization may not be possible

❌ Mistake 4: Forgetting Gram-Schmidt when one eigenvalue
   has multiple independent eigenvectors
   Symptom: two eigenvectors for the same eigenvalue are not
            perpendicular
   Fix: eigenvectors from DIFFERENT eigenvalues are guaranteed
        orthogonal (Fact 3), but eigenvectors from the SAME
        eigenvalue must be orthogonalized manually using
        Gram-Schmidt
```

---

## Part 14: Summary — the complete picture

```
SYMMETRIC MATRIX: A = Aᵀ (equal to its own transpose)
  ↓
  Guarantees (Spectral Theorem):
  1. All eigenvalues are real
  2. Eigenvectors from different eigenvalues are orthogonal
  3. A is orthogonally diagonalizable
  ↓
  Algorithm:
  1. Find eigenvalues: det(A−λI) = 0
  2. Find eigenvectors: null(A−λI)
  3. If same eigenvalue has multiple eigenvectors: Gram-Schmidt
  4. Normalize all eigenvectors: divide by norm
  5. Build P (columns = normalized eigenvectors)
     Build D (diagonal = eigenvalues, matching P's column order)
  6. Verify: P'*A*P = D and P'*P = I
  ↓
  Result: A = P*D*P'  (since P' = P⁻¹ for orthogonal P)
```

```matlab
% One-line MATLAB version of the whole process:
A = [-1 2; 2 2];        % symmetric matrix
[P, D] = eig(A);        % P = orthogonal matrix, D = diagonal eigenvalue matrix
P' * A * P              % verify: should equal D
```
