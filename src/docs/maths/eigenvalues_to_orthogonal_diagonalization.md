# From Eigenvalues to Orthogonal Diagonalization
## Starting from zero. Every number explained. Every pattern named.

---

## What this document assumes

```
✓ A matrix is a grid of numbers
✓ You can multiply a matrix by a vector (row · column rule)
✓ The dot product: u·v = u₁v₁ + u₂v₂ + ...
✓ RREF and solving systems of equations
```

Everything else is built here from scratch.

---

# SECTION 1: EIGENVALUES AND EIGENVECTORS

---

## Part 1: The problem eigenvalues solve

When you multiply a matrix A by a vector v, you usually get a
completely different vector pointing in a different direction.

```
A = [3  1]      v = [1]
    [0  2]          [1]

A*v = [3*1 + 1*1]  =  [4]
      [0*1 + 2*1]     [2]
```

v = (1,1) pointed up-right at 45 degrees.
A*v = (4,2) points in a DIFFERENT direction (less steep).
The direction CHANGED.

Now try a different vector:

```
v = [1]
    [0]

A*v = [3*1 + 1*0]  =  [3]
      [0*1 + 2*0]     [0]
```

v = (1,0) pointed right. A*v = (3,0) ALSO points right.
Same direction, just 3 times longer.

This is the special property we are looking for.

**The question eigenvalues answer:**

For a given matrix A, which special vectors v have the property
that A*v points in the EXACT SAME direction as v
(just longer, shorter, or flipped)?

Those special vectors are called EIGENVECTORS.
The scaling factor is called the EIGENVALUE.

---

## Part 2: The defining equation

If v is an eigenvector with eigenvalue lambda, then:

```
A*v = lambda*v
```

Read as: matrix A times vector v equals the number lambda times v.

The left side (A*v) is matrix multiplication — a full transformation.
The right side (lambda*v) is just scaling every entry of v by one number.
The equation says these two things produce identical results.

**Concrete check:** A = [[3,1],[0,2]], v = (1,0), lambda = 3.

```
A*v = [3*1 + 1*0]  =  [3]
      [0*1 + 2*0]     [0]

lambda*v = 3 * [1]  =  [3]
               [0]     [0]

[3] = [3]  YES. Same result. (1,0) IS an eigenvector with lambda=3.
[0]   [0]
```

**Check that (1,1) is NOT an eigenvector:**

```
A*v = [4]
      [2]

For (1,1) to be an eigenvector, we need some lambda where
lambda*(1,1) = (4,2).

lambda*(1,1) = (lambda, lambda).

For this to equal (4,2): lambda=4 AND lambda=2.
Impossible. (1,1) is NOT an eigenvector.
```

---

## Part 3: Where do the eigenvalues come from?

We need to find every lambda where A*v = lambda*v has a NONZERO
solution v.

**Rearrange the equation:**

```
A*v = lambda*v
A*v - lambda*v = 0
```

We cannot subtract lambda (a number) from A (a matrix) directly.
The fix: write lambda as lambda*I, where I is the identity matrix.

```
I = [1  0]    (2x2 identity: 1s on diagonal, 0s elsewhere)
    [0  1]
```

lambda*I = [lambda    0  ]
           [  0    lambda]

Now the equation becomes:

```
A*v - lambda*I*v = 0
(A - lambda*I)*v = 0
```

Now (A - lambda*I) is a matrix, and we need this matrix times v
to equal zero.

**The key insight:**

The equation (A - lambda*I)*v = 0 always has the solution v = 0
(the zero vector). But v = 0 is useless as an eigenvector.
We want a NONZERO v.

A nonzero solution to M*v = 0 exists ONLY when M is not invertible.
A matrix is not invertible exactly when its determinant equals zero.

**Therefore, eigenvalues are the values of lambda where:**

```
det(A - lambda*I) = 0
```

This is called the CHARACTERISTIC EQUATION.

---

## Part 4: What is a determinant?

For a 2x2 matrix, the determinant is:

```
det([a  b]) = a*d - b*c
   ([c  d])
```

Multiply top-left by bottom-right, subtract the product of
top-right and bottom-left.

Examples:

```
det([3  1]) = 3*2 - 1*0 = 6 - 0 = 6
   ([0  2])

det([1  2]) = 1*4 - 2*3 = 4 - 6 = -2
   ([3  4])

det([2  4]) = 2*2 - 4*1 = 4 - 4 = 0
   ([1  2])
```

When det = 0, the matrix is NOT invertible.
This is exactly when M*v = 0 has a nonzero solution.

---

## Part 5: Finding eigenvalues — worked example

A = [[3, 1], [0, 2]]

**Step 1: Build A - lambda*I**

Subtract lambda from DIAGONAL entries only.
Off-diagonal entries stay unchanged.

```
A - lambda*I = [3-lambda     1    ]
               [   0      2-lambda]
```

**Step 2: Set det(A - lambda*I) = 0**

```
det = (3-lambda)(2-lambda) - (1)(0)
    = (3-lambda)(2-lambda)
```

Expand (3-lambda)(2-lambda):

```
= 3*2 + 3*(-lambda) + (-lambda)*2 + (-lambda)*(-lambda)
= 6 - 3*lambda - 2*lambda + lambda^2
= lambda^2 - 5*lambda + 6
```

**Step 3: Solve lambda^2 - 5*lambda + 6 = 0**

Factor: (lambda-3)(lambda-2) = 0

lambda = 3   or   lambda = 2

**Eigenvalues: lambda1 = 3, lambda2 = 2**

---

## Part 6: Finding eigenvectors for each eigenvalue

**For lambda1 = 3: solve (A - 3I)*v = 0**

```
A - 3I = [3-3   1 ] = [0   1]
         [ 0   2-3]   [0  -1]
```

Row reduce:

```
[0   1]
[0  -1]

R2 = R2 + R1:

[0   1]
[0   0]
```

One equation: 0*v1 + 1*v2 = 0   so   v2 = 0

v1 has no equation pinning it down — it is FREE.
Let v1 = 1.

```
Eigenvector for lambda=3:   v = [1]
                                [0]
```

Check: A*[1,0] = [3*1+1*0, 0*1+2*0] = [3,0] = 3*[1,0]  YES

**For lambda2 = 2: solve (A - 2I)*v = 0**

```
A - 2I = [3-2   1 ] = [1   1]
         [ 0   2-2]   [0   0]
```

One equation: v1 + v2 = 0   so   v1 = -v2

v2 is free. Let v2 = 1, then v1 = -1.

```
Eigenvector for lambda=2:   v = [-1]
                                [ 1]
```

Check: A*[-1,1] = [3*(-1)+1*1, 0*(-1)+2*1] = [-2,2] = 2*[-1,1]  YES

---

## Part 7: Why "let v1 = 1" — the free variable explanation

When a variable has no equation determining its value, it is FREE.
You can pick any nonzero value. Picking 1 (or any convenient number)
gives you one specific eigenvector.

But there are infinitely many eigenvectors for each eigenvalue.
2*[1,0], 5*[1,0], -3*[1,0] are all eigenvectors for lambda=3.
They all point in the same DIRECTION. The direction is what matters.

Choosing v1 = 1 is just a convention to get clean numbers.

---

## Part 8: MATLAB for eigenvalues and eigenvectors

```matlab
% Define the matrix
A = [3 1; 0 2];

%% FINDING EIGENVALUES

% Method 1: Let MATLAB compute directly
eigenvalues = eig(A)
% Returns column vector of eigenvalues

% Method 2: Symbolic characteristic polynomial
% syms lam: declare lam as a symbol so MATLAB does algebra with it
syms lam
char_poly = det(A - lam*eye(2))
% eye(2) is the 2x2 identity matrix
% A - lam*eye(2) builds (A - lambda*I) symbolically
% det() computes the determinant as a polynomial in lam

eigenvalues_exact = solve(char_poly == 0, lam)
% solve() finds all lam values where char_poly equals zero

%% FINDING EIGENVECTORS

% Method 1: Get everything at once
% [V, D] = eig(A) returns:
%   V: matrix whose COLUMNS are eigenvectors (length 1)
%   D: diagonal matrix with eigenvalues on diagonal
%   Column i of V pairs with diagonal entry D(i,i)
[V, D] = eig(A)

% Extract individual eigenvectors
% V(:,1) means "all rows, column 1" = first eigenvector
v1 = V(:,1);
v2 = V(:,2);

% D(1,1) is row 1 column 1 of D = first eigenvalue
lambda1 = D(1,1);
lambda2 = D(2,2);

% Verify: A*v1 should equal lambda1*v1
disp('A * v1:');    disp(A * v1)
disp('lambda1*v1:'); disp(lambda1 * v1)

% Method 2: Find eigenvector for one specific eigenvalue
% null(M, 'r'): finds vectors that M sends to zero
% 'r' means rational output (exact fractions not decimals)
eigvec_for_3 = null(A - 3*eye(2), 'r')
eigvec_for_2 = null(A - 2*eye(2), 'r')
```

---

# SECTION 2: DIAGONALIZATION

---

## Part 9: What diagonalization means

Now that we have eigenvalues and eigenvectors, we can write A
in a much simpler form.

**The diagonalization equation:**

```
A = P * D * P^(-1)
```

Where:
- P = matrix whose COLUMNS are eigenvectors of A
- D = diagonal matrix with eigenvalues on the diagonal
- P^(-1) = the inverse of P

For our example A = [[3,1],[0,2]]:

```
P = [1   -1]    D = [3  0]
    [0    1]        [0  2]
```

Column 1 of P = eigenvector (1,0) for lambda=3.
Column 2 of P = eigenvector (-1,1) for lambda=2.
D has eigenvalues 3 and 2 matching those columns.

**Why is this useful?**

D is diagonal, so raising it to a power is trivial:

```
D^10 = [3^10    0  ] = [59049    0   ]
       [  0   2^10]   [   0    1024 ]
```

And A^10 = P * D^10 * P^(-1).
Instead of multiplying A by itself 10 times, you just raise
each eigenvalue to the 10th power.

```matlab
A = [3 1; 0 2];
P = [1 -1; 0 1];
D = [3 0; 0 2];

% inv() computes the matrix inverse
result = P * D * inv(P)
% Should equal A = [3 1; 0 2]

% Fast power using diagonalization
A_to_10_direct = A^10
A_to_10_diag   = P * D^10 * inv(P)
% Both give the same answer
```

---

# SECTION 3: ORTHOGONAL DIAGONALIZATION

---

## Part 10: What makes a matrix orthogonal

A matrix P is ORTHOGONAL when its columns are ORTHONORMAL:

```
Condition 1: Every column has norm (length) = 1
             v · v = 1  for each column v

Condition 2: Every pair of different columns has dot product = 0
             v_i · v_j = 0  when i is not equal to j
```

When both conditions hold: P^T * P = I, meaning P^T = P^(-1).

**Why does P^T = P^(-1) follow?**

The entry at row i, column j of P^T * P is the dot product of
column i with column j of P.

```
(P^T * P) at position (i,j) = (column i of P) dot (column j of P)
```

By the orthonormal conditions:
- When i = j: dot product = 1  (unit vector)
- When i not j: dot product = 0  (orthogonal)

So P^T * P has 1s on the diagonal and 0s everywhere else.
That IS the identity matrix. So P^T = P^(-1).

**This means for orthogonal P:**

```
A = P * D * P^(-1)  becomes  A = P * D * P^T
```

No need to compute the inverse. Just transpose.

---

## Part 11: What is a symmetric matrix

A matrix A is SYMMETRIC if A = A^T.

The transpose A^T is formed by swapping rows and columns:
entry at position (i,j) moves to position (j,i).

```
A = [4   2]       A^T = [4   2]
    [2   1]              [2   1]

A = A^T  so A is symmetric.
```

In plain terms: the matrix looks the same when you flip it
across its main diagonal (top-left to bottom-right corner).
Entries below the diagonal mirror the entries above it.

```
A = [-1   2   9]
    [ 2  -5   0]
    [ 9   0   3]
```

Entry (1,2) = 2 = Entry (2,1).   Mirror. Check.
Entry (1,3) = 9 = Entry (3,1).   Mirror. Check.
Entry (2,3) = 0 = Entry (3,2).   Mirror. Check.

```matlab
A = [4 2; 2 1];
isequal(A, A')    % 1 if symmetric, 0 if not
```

---

## Part 12: The Spectral Theorem — three guaranteed facts

For any SYMMETRIC matrix A, three things are ALWAYS true:

**Fact 1: A is orthogonally diagonalizable.**

You can ALWAYS find an orthogonal P where P^T * A * P = D.
This is stronger than regular diagonalization because P must
have orthonormal columns, not just any invertible columns.

**Fact 2: All eigenvalues of A are real numbers.**

Non-symmetric matrices can have complex eigenvalues (involving
i = sqrt(-1)). Symmetric matrices never do.
Every lambda is a plain real number.

**Fact 3: Eigenvectors from DIFFERENT eigenvalues are orthogonal.**

If lambda_1 not equal to lambda_2, then their eigenvectors
v1 and v2 satisfy v1 dot v2 = 0 automatically.
You do not need to check or force this — the theorem guarantees it.

**When does Fact 3 NOT cover everything?**

If the SAME eigenvalue has multiple independent eigenvectors
(this happens when that eigenvalue is a repeated root of the
characteristic equation), those eigenvectors might not be
orthogonal to each other. In that case, apply Gram-Schmidt
to orthogonalize them. But eigenvectors from DIFFERENT
eigenvalues are always already orthogonal.

---

## Part 13: The algorithm for orthogonal diagonalization

**Given:** a symmetric matrix A.
**Goal:** find orthogonal P and diagonal D where P^T * A * P = D.

**Step 1:** Confirm A is symmetric: check A = A^T.

**Step 2:** Find eigenvalues by solving det(A - lambda*I) = 0.

**Step 3:** For each eigenvalue, find eigenvectors by solving
(A - lambda*I)*v = 0 using row reduction.

**Step 4:** If one eigenvalue has multiple independent eigenvectors,
apply Gram-Schmidt to make them orthogonal.
(Skip this if all eigenvalues are distinct — Fact 3 handles it.)

**Step 5:** Normalize every eigenvector: w = v / norm(v).

**Step 6:** Build P with normalized eigenvectors as columns.
Build D with matching eigenvalues on the diagonal.

**Step 7:** Verify P^T * A * P = D and P^T * P = I.

---

## Part 14: Worked example — every step shown

**A = [[4, 2], [2, 1]]**

**Step 1: Confirm symmetric**

```
A^T = [4  2]  =  A  YES
      [2  1]
```

**Step 2: Find eigenvalues**

Build A - lambda*I:

```
[4-lambda    2   ]
[   2     1-lambda]
```

det = (4-lambda)(1-lambda) - (2)(2)

Expand (4-lambda)(1-lambda):

```
= 4*1 + 4*(-lambda) + (-lambda)*1 + (-lambda)*(-lambda)
= 4 - 4*lambda - lambda + lambda^2
= lambda^2 - 5*lambda + 4
```

So:

```
det = lambda^2 - 5*lambda + 4 - 4
    = lambda^2 - 5*lambda
    = lambda*(lambda - 5)
```

Set = 0:   lambda = 0   or   lambda = 5.

**Eigenvalues: lambda1 = 0, lambda2 = 5**

Both real. Fact 2 confirmed.

**Step 3: Find eigenvectors**

**For lambda = 0: solve A*v = 0**

```
[4  2]
[2  1]

Row reduce:
R1 / 4:  [1  1/2]
         [2   1 ]

R2 - 2*R1:
         [1  1/2]
         [0   0 ]
```

Equation: v1 + (1/2)*v2 = 0   so   v1 = -(1/2)*v2

Let v2 = 2 (to avoid fractions):   v1 = -1

```
Eigenvector for lambda=0:   u1 = [-1]
                                  [ 2]
```

Verify: A*[-1,2] = [4*(-1)+2*2, 2*(-1)+1*2] = [0,0] = 0*[-1,2]  YES

**For lambda = 5: solve (A - 5I)*v = 0**

```
A - 5I = [4-5   2 ] = [-1   2]
         [ 2   1-5]   [ 2  -4]

Row reduce:
R1 * (-1):  [1  -2]
            [2  -4]

R2 - 2*R1:
            [1  -2]
            [0   0]
```

Equation: v1 - 2*v2 = 0   so   v1 = 2*v2

Let v2 = 1:   v1 = 2

```
Eigenvector for lambda=5:   u2 = [2]
                                  [1]
```

Verify: A*[2,1] = [4*2+2*1, 2*2+1*1] = [10,5] = 5*[2,1]  YES

**Step 4: Check orthogonality between eigenvectors**

```
u1 dot u2 = (-1)(2) + (2)(1) = -2 + 2 = 0  YES
```

Already orthogonal. Fact 3 guaranteed this since lambda1 = 0
is different from lambda2 = 5. No Gram-Schmidt needed.

**Step 5: Normalize each eigenvector**

```
norm(u1) = sqrt((-1)^2 + 2^2) = sqrt(1 + 4) = sqrt(5)

w1 = u1 / sqrt(5) = [-1/sqrt(5)]
                     [ 2/sqrt(5)]
```

```
norm(u2) = sqrt(2^2 + 1^2) = sqrt(4 + 1) = sqrt(5)

w2 = u2 / sqrt(5) = [2/sqrt(5)]
                     [1/sqrt(5)]
```

**Step 6: Build P and D**

```
P = [-1/sqrt(5)    2/sqrt(5)]
    [ 2/sqrt(5)    1/sqrt(5)]

D = [0  0]
    [0  5]
```

Column 1 of P is w1, matching lambda=0 in D position (1,1).
Column 2 of P is w2, matching lambda=5 in D position (2,2).

**Step 7: Verify**

```matlab
A = [4 2; 2 1];
P = [-1/sqrt(5)  2/sqrt(5);
      2/sqrt(5)  1/sqrt(5)];

disp('P_transpose * A * P (should be [0,0;0,5]):')
disp(P' * A * P)

disp('P_transpose * P (should be identity):')
disp(P' * P)
```

---

## Part 15: MATLAB — complete code, every line explained

```matlab
%% COMPLETE ORTHOGONAL DIAGONALIZATION

A = [4 2; 2 1];

%% CHECK SYMMETRY
% A' is the transpose (apostrophe = transpose in MATLAB)
% isequal checks if two matrices match entry by entry
disp('Is A symmetric? (1=yes):')
disp(isequal(A, A'))

%% FIND EIGENVALUES SYMBOLICALLY
% syms lam: lam is now a symbol MATLAB treats algebraically
% not a number — MATLAB keeps it as the letter lam
syms lam

% eye(2): 2x2 identity matrix [[1,0],[0,1]]
% lam*eye(2): [[lam,0],[0,lam]]
% A - lam*eye(2): builds (A - lambda*I) as a symbolic matrix
char_poly = det(A - lam*eye(2));
disp('Characteristic polynomial:')
disp(char_poly)

% solve(expression == 0, variable):
% finds all values of variable making expression equal zero
eigenvalues_sym = solve(char_poly == 0, lam);
disp('Eigenvalues:')
disp(eigenvalues_sym)

%% FIND EIGENVECTORS FOR EACH EIGENVALUE
% double() converts symbolic number to regular decimal number
lam1 = double(eigenvalues_sym(1));
lam2 = double(eigenvalues_sym(2));

% null(M, 'r'): finds all vectors that M sends to zero
% 'r' = rational output (exact fractions not floating-point)
% returns a matrix whose COLUMNS are the null space basis vectors
u1 = null(A - lam1*eye(2), 'r');
u2 = null(A - lam2*eye(2), 'r');

disp('Eigenvector for lambda1:'); disp(u1)
disp('Eigenvector for lambda2:'); disp(u2)

%% VERIFY EIGENVECTORS
% A*v should equal lambda*v for each pair
disp('A*u1 (should equal lam1*u1):')
disp(A * u1)
disp('lam1 * u1:')
disp(lam1 * u1)

%% CHECK ORTHOGONALITY (Fact 3 of Spectral Theorem)
% dot(a,b): computes a1*b1 + a2*b2 + ... = one number
disp('u1 dot u2 (should be 0):')
disp(dot(u1, u2))

%% NORMALIZE EIGENVECTORS
% norm(v): computes sqrt(v dot v) = length of v
% v / norm(v): divides every entry of v by that length
% result is a unit vector pointing same direction
w1 = u1 / norm(u1);
w2 = u2 / norm(u2);

disp('w1 (normalized u1):'); disp(w1)
disp('norm of w1 (should be 1):'); disp(norm(w1))
disp('w2 (normalized u2):'); disp(w2)
disp('norm of w2 (should be 1):'); disp(norm(w2))

%% BUILD P AND D
% [w1, w2]: puts w1 and w2 side by side as columns
% w1 must be a column vector for this to work
P = [w1, w2];

% diag([a, b]): creates diagonal matrix [[a,0],[0,b]]
D_matrix = diag([lam1, lam2]);

disp('P:'); disp(P)
disp('D:'); disp(D_matrix)

%% VERIFY
% P' is transpose of P
% P' * A * P computes (P^T)(A)(P)
disp('P_transpose * A * P (should equal D):')
disp(P' * A * P)

disp('P_transpose * P (should equal identity):')
disp(P' * P)

%% SHORTCUT: LET MATLAB DO EVERYTHING AT ONCE
% [V, D] = eig(A):
%   V: columns are already normalized eigenvectors
%   D: diagonal matrix of eigenvalues
%   Column i of V pairs with diagonal entry D(i,i)
[V, D_auto] = eig(A);
disp('=== AUTOMATIC METHOD ===')
disp('V (orthonormal eigenvectors as columns):'); disp(V)
disp('D (eigenvalues on diagonal):'); disp(D_auto)
disp('Verify V_transpose * A * V equals D:'); disp(V' * A * V)
disp('Verify V_transpose * V equals identity:'); disp(V' * V)
```

---

## Part 16: Summary — the complete picture

```
START: symmetric matrix A  (check: A = A^T)
         |
         | Spectral Theorem guarantees:
         | • All eigenvalues are real
         | • Eigenvectors from different eigenvalues are orthogonal
         | • Orthogonal diagonalization is possible
         v
STEP 1: Find eigenvalues
        Solve det(A - lambda*I) = 0
        This gives lambda1, lambda2, ... (all real)
         |
         v
STEP 2: Find eigenvectors
        For each lambda: solve (A - lambda*I)*v = 0
        Row reduce, find free variables, write eigenvectors
         |
         v
STEP 3: Orthogonalize if needed
        Eigenvectors from DIFFERENT lambdas: already orthogonal
        Multiple eigenvectors for SAME lambda: use Gram-Schmidt
         |
         v
STEP 4: Normalize
        w = v / norm(v)    where norm(v) = sqrt(v dot v)
         |
         v
STEP 5: Build P and D
        P: columns are normalized eigenvectors
        D: diagonal with eigenvalues in matching order
         |
         v
STEP 6: Verify
        P^T * A * P = D  (diagonalization worked)
        P^T * P = I      (P is orthogonal)
         |
         v
RESULT: A = P * D * P^T
```

---

## Part 17: Common mistakes

```
MISTAKE: Using non-normalized eigenvectors in P
SYMPTOM: P'*A*P gives something diagonal but P'*P is not identity
FIX:     Always divide each eigenvector by its norm before building P

MISTAKE: Putting eigenvalues in D in a different order than eigenvectors in P
SYMPTOM: P'*A*P is diagonal but numbers do not match D
FIX:     Column i of P must pair with diagonal position (i,i) of D
         Build P and D at the same time so they stay in sync

MISTAKE: Trying to orthogonally diagonalize a non-symmetric matrix
SYMPTOM: Eigenvectors are not orthogonal to each other
FIX:     Check isequal(A, A') first. If A is not symmetric,
         orthogonal diagonalization is not guaranteed to work

MISTAKE: Thinking Gram-Schmidt is always needed
SYMPTOM: Extra unnecessary work
FIX:     Gram-Schmidt is only needed when ONE eigenvalue
         has MULTIPLE independent eigenvectors.
         Eigenvectors from DIFFERENT eigenvalues are already
         orthogonal by the Spectral Theorem.

MISTAKE: Thinking P^T = P^(-1) for any matrix
SYMPTOM: Wrong result when using transpose instead of inverse
FIX:     P^T = P^(-1) ONLY when P is orthogonal.
         For regular diagonalization, you must use inv(P).
```
