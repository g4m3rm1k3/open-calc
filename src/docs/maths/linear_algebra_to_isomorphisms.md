# Linear Algebra: From Foundations to Isomorphisms
### A ground-up guide with canonical examples and MATLAB code

---

## How to use this guide

Every section follows the same pattern:
1. Plain English definition — what the thing actually is
2. Canonical example — the simplest possible concrete case
3. The general rule — how it works for anything
4. MATLAB — how to compute it

Work through in order. Each section builds on the last.

---

## Part 1: Vectors

### What a vector is

A vector is just an ordered list of numbers. That is the complete definition. Nothing more.

```
v = [3, 2]       % a vector in R²  (2 numbers)
v = [1, 4, -2]   % a vector in R³  (3 numbers)
```

The numbers are called **components**. The number of components tells you which space the vector lives in. Two components means R², three means R³, n components means Rⁿ.

When written on paper, vectors are written as a vertical column:

```
    [3]
v = [2]
```

In MATLAB, a column vector is written with semicolons:

```matlab
v = [3; 2];       % column vector in R²
w = [1; 4; -2];   % column vector in R³
```

### What vectors let you do

Two operations are defined on vectors:

**Addition**: add component by component.
```
[3]   [1]   [4]
[2] + [5] = [7]
```

**Scalar multiplication**: multiply every component by one number.
```
    [3]   [6]
2 · [2] = [4]
```

That is all. A vector space is any collection of objects where these two operations make sense and follow the standard rules (commutativity, associativity, etc.).

```matlab
v = [3; 2];
w = [1; 5];

v + w          % [4; 7]
2 * v          % [6; 4]
```

---

## Part 2: Span

### What span means

The **span** of a set of vectors is every possible vector you can build by adding and scaling those vectors.

Canonical example. Take two vectors in R²:

```
v1 = [1; 0]
v2 = [0; 1]
```

Their span is every possible combination a·v1 + b·v2 for any numbers a and b. Since:

```
a·[1;0] + b·[0;1] = [a; b]
```

You can hit any point in R². The span of v1 and v2 is all of R².

Now take:

```
v1 = [1; 2]
v2 = [2; 4]
```

Notice v2 = 2·v1. Every combination a·v1 + b·v2 = a·v1 + b·2·v1 = (a+2b)·v1. You can only ever travel along the line through v1. The span is just that one line, not all of R².

```matlab
% Visualize span of two vectors
v1 = [1; 2];
v2 = [2; 4];

% Check if v2 is a multiple of v1
ratio = v2 ./ v1;   % [2; 2] — same ratio, so v2 = 2*v1, span is a line
```

**The rule**: if one vector in your set is a combination of the others, it contributes nothing new to the span. You can throw it away.

---

## Part 3: Linear Independence

### What it means

A set of vectors is **linearly independent** if no vector in the set can be built from the others.

Equivalently: the only way to get the zero vector from a combination a1·v1 + a2·v2 + ... = 0 is if every a is zero.

Canonical example.

```
v1 = [1; 0]
v2 = [0; 1]
```

Can you build v1 from v2? No. Can you build v2 from v1? No. They point in completely different directions. **Linearly independent.**

```
v1 = [1; 2]
v2 = [2; 4]
```

v2 = 2·v1. You can build v2 from v1. **Linearly dependent.**

```matlab
% Test linear independence: put vectors as columns, check rank
A = [1 2; 0 0; 2 4];   % columns are your vectors

rank(A)   % if rank = number of columns, they are independent
          % if rank < number of columns, they are dependent
```

**The rule**: a set of vectors is linearly independent if and only if the rank of the matrix they form equals the number of vectors.

---

## Part 4: Basis

### What a basis is

A **basis** for a vector space V is a set of vectors that:
1. Spans V (you can build anything in V from them)
2. Is linearly independent (no redundancy — every vector is necessary)

Think of it as the minimal complete set of building blocks.

Canonical example. The **standard basis** for R²:

```
e1 = [1; 0]
e2 = [0; 1]
```

These span all of R² (you can build any [a; b] = a·e1 + b·e2) and they are independent. This is the basis your book calls B when it says "standard basis for R²."

The standard basis for P2 (polynomials of degree ≤ 2):

```
{1, x, x²}
```

Any polynomial up to degree 2 looks like a + bx + cx², which is a·1 + b·x + c·x². Spanned. And none of 1, x, x² can be built from the others. Independent.

```matlab
% The standard basis vectors for R³
e1 = [1; 0; 0];
e2 = [0; 1; 0];
e3 = [0; 0; 1];

% Any vector in R³ is a combination of these
v = [4; -2; 7];
% v = 4*e1 + (-2)*e2 + 7*e3
```

### Why basis matters

The basis is your coordinate system. When you write a vector as [3; 2], those numbers only make sense relative to a specific basis. The numbers 3 and 2 mean "3 of the first basis vector, 2 of the second."

Change the basis, and the same physical vector gets described by different numbers.

---

## Part 5: Coordinates

### What coordinates are

Given a basis B = {b1, b2, ..., bn}, the **coordinates** of a vector v with respect to B are the amounts of each basis vector you need to build v.

If v = 3·b1 + (-1)·b2 + 2·b3, then the coordinate vector is:

```
[v]_B = [3; -1; 2]
```

The subscript B means "with respect to basis B."

Canonical example. Let B = {1+x, 1-x} be a basis for P1.

Express the polynomial 4 + 2x in terms of B.

You need to find a and b such that:
```
a·(1+x) + b·(1-x) = 4 + 2x
```

Expanding:
```
(a+b) + (a-b)x = 4 + 2x
```

So:
```
a + b = 4
a - b = 2
```

Solving: a = 3, b = 1.

So [4+2x]_B = [3; 1].

```matlab
% Finding coordinates relative to a non-standard basis
% B = {1+x, 1-x} represented as coefficient vectors [const; x_coeff]
b1 = [1; 1];   % 1 + x
b2 = [1; -1];  % 1 - x

% Express 4 + 2x, which as a coefficient vector is:
v = [4; 2];

% Solve B * coords = v
B_matrix = [b1, b2];   % put basis vectors as columns
coords = B_matrix \ v; % MATLAB backslash solves the system
% coords = [3; 1]
```

---

## Part 6: Linear Transformations

### What a linear transformation is

A **linear transformation** T is a function from one vector space to another that satisfies two rules:

1. T(u + v) = T(u) + T(v)  — addition before or after gives same result
2. T(c·v) = c·T(v)         — scaling before or after gives same result

These two rules together mean: T plays nicely with the vector space operations. It doesn't matter if you combine vectors first and then transform, or transform first and then combine. You get the same answer either way.

What this rules out: anything that shifts, curves, or bends. T must send the zero vector to the zero vector. T(0) = 0 always.

### The general form

Every linear transformation from Rⁿ to Rᵐ can be written as matrix multiplication:

```
T(v) = A·v
```

where A is an m×n matrix. This is not a coincidence — it is a theorem. Matrix multiplication IS linear transformation.

Canonical example. T : R² → R² defined by T([x;y]) = [2x; 3y].

Check the rules:
```
T([x1+x2; y1+y2]) = [2(x1+x2); 3(y1+y2)] = [2x1+2x2; 3y1+3y2]
T([x1;y1]) + T([x2;y2]) = [2x1;3y1] + [2x2;3y2] = [2x1+2x2; 3y1+3y2]  ✓

T(c·[x;y]) = [2cx; 3cy] = c·[2x; 3y] = c·T([x;y])  ✓
```

It is linear.

```matlab
% Define T as a matrix
A = [2 0; 0 3];

v = [4; 5];
T_v = A * v;   % [8; 15]
```

### Transformations between polynomial spaces

When T maps polynomials to polynomials, you cannot write it directly as a matrix — first because polynomials are not column vectors. But once you choose bases, you represent polynomials as coordinate vectors, and then T becomes a matrix.

Example. T : P1 → P2 defined by T(p(x)) = x · p(x).

```
T(1)   = x·1   = x        (input: degree 0, output: degree 1)
T(x)   = x·x   = x²       (input: degree 1, output: degree 2)
T(3+2x) = x·(3+2x) = 3x + 2x²
```

This is linear. You can verify: T(p+q) = x(p+q) = xp + xq = T(p) + T(q). ✓

```matlab
syms x
T = @(p) expand(x * p);

T(1)       % x
T(x)       % x^2
T(3 + 2*x) % 3*x + 2*x^2
```

---

## Part 7: The Matrix of a Transformation

### The full picture

You have:
- A transformation T from space V to space W
- A basis B for V (the input space), with n vectors
- A basis B' for W (the output space), with m vectors

The matrix [T]_{B,B'} is built column by column:

```
For each vector in B:
    1. Apply T to it — get an output in W
    2. Express that output in terms of B' — get m numbers
    3. Those m numbers become one column
```

Result: an m×n matrix. m rows because B' has m vectors. n columns because B has n vectors.

### Canonical complete example

T : P1 → P2, T(p(x)) = x · p(x)

B = {1, x} (standard basis for P1, 2 vectors → 2 columns)
B' = {1, x, x²} (standard basis for P2, 3 vectors → 3 rows)

**Column 1**: plug in first item of B, which is 1.
```
T(1) = x·1 = x
```
Express x in terms of B' = {1, x, x²}:
```
0·1 + 1·x + 0·x²
```
Coefficients: (0, 1, 0). Column 1 = [0; 1; 0].

**Column 2**: plug in second item of B, which is x.
```
T(x) = x·x = x²
```
Express x² in terms of B':
```
0·1 + 0·x + 1·x²
```
Coefficients: (0, 0, 1). Column 2 = [0; 0; 1].

**The matrix**:
```
[T]_{B,B'} = [0  0]
             [1  0]
             [0  1]
```

```matlab
% Build the matrix column by column
% Represent polynomials as coefficient vectors [const; x_coeff; x²_coeff]

% B' has 3 items so rows = 3, B has 2 items so cols = 2
M = zeros(3, 2);

% Column 1: T(1) = x = 0*1 + 1*x + 0*x²
M(:,1) = [0; 1; 0];

% Column 2: T(x) = x² = 0*1 + 0*x + 1*x²
M(:,2) = [0; 0; 1];

disp(M)
% [0 0]
% [1 0]
% [0 1]
```

### Using the matrix to compute T of any polynomial

Once you have the matrix, to find T(3 + 2x):

1. Write 3 + 2x as a coordinate vector in B: [3; 2] (3 of the "1", 2 of the "x")
2. Multiply: M · [3; 2]
3. Read the result as a polynomial in B'

```matlab
v = [3; 2];
result = M * v;   % [0; 3; 2]

% Read back: 0*1 + 3*x + 2*x² = 3x + 2x²
% Which makes sense: T(3+2x) = x*(3+2x) = 3x + 2x²  ✓
```

---

## Part 8: Kernel and Image (Null Space and Range)

### The kernel

The **kernel** of T (also called null space) is the set of all inputs that T sends to zero.

```
ker(T) = { v in V : T(v) = 0 }
```

In matrix terms: all vectors v where A·v = 0.

Canonical example. T : R³ → R², A = [1 2 3; 0 0 0].

```
A·v = [x + 2y + 3z; 0] = [0; 0]
```

So x + 2y + 3z = 0. The kernel is a whole plane in R³. It contains infinitely many vectors.

```matlab
A = [1 2 3; 0 0 0];
null(A)   % gives a basis for the kernel
```

### The image (range)

The **image** of T is the set of all possible outputs.

```
im(T) = { T(v) : v in V } = { A·v : v in R^n }
```

This is also called the column space of A — the span of A's columns.

```matlab
A = [1 2 3; 0 0 0];

% Image is the column space
orth(A')   % gives a basis for the column space
rank(A)    % dimension of the image
```

### The rank-nullity theorem

For any linear transformation T from an n-dimensional space:

```
dim(ker T) + dim(im T) = n
```

Dimension of kernel + dimension of image = dimension of input space. Always. This lets you find one if you know the other.

```matlab
A = [1 2 3; 0 0 0];
n = size(A, 2);          % 3 — dimension of input space
r = rank(A);             % dimension of image
nullity = n - r;         % dimension of kernel
% r=1, nullity=2, 1+2=3 ✓
```

---

## Part 9: One-to-One and Onto

These two properties describe how a transformation maps inputs to outputs. They are the prerequisites you need for isomorphism.

### One-to-one (injective)

T is **one-to-one** if different inputs always give different outputs. No two inputs map to the same output.

Equivalently: T(u) = T(v) implies u = v.

Equivalently for linear transformations: ker(T) = {0}. The only input that maps to zero is zero itself.

If T is one-to-one, nothing gets "collapsed." Every input has a unique output.

```matlab
A = [1 0; 0 1; 0 0];   % T : R² → R³

% Check: kernel is just {0}?
null(A)   % empty (rank 2 = number of columns, so kernel is trivial)
% Yes, T is one-to-one
```

### Onto (surjective)

T is **onto** if every possible output is actually hit by some input. The image equals the entire output space.

Equivalently: im(T) = W (the whole output space).

Equivalently: rank(A) = m (number of rows = dimension of output space).

```matlab
A = [1 0 0; 0 1 0];   % T : R³ → R²

rank(A)           % 2
size(A, 1)        % 2 — number of rows (dimension of output space)
% rank = rows, so T is onto
```

### Why both matter

If T is one-to-one: you can recover the input from the output (no information lost).
If T is onto: you can reach every output (nothing is missed).

If T is both, it is a perfect pairing between input space and output space.

---

## Part 10: Isomorphism

### What an isomorphism is

A linear transformation T : V → W is an **isomorphism** if it is:
1. Linear (it is a linear transformation)
2. One-to-one (injective)
3. Onto (surjective)

If such a T exists, V and W are called **isomorphic**, written V ≅ W.

### What isomorphism actually means

Two vector spaces are isomorphic if they are structurally identical — just with different labels on the vectors.

Every operation, every relationship, every structure in V has an exact mirror in W. The spaces are the same space in disguise.

Canonical example. P2 ≅ R³.

P2 = all polynomials a + bx + cx² (3-dimensional).
R³ = all vectors [a; b; c] (3-dimensional).

Define T : P2 → R³ by:
```
T(a + bx + cx²) = [a; b; c]
```

This just reads off coefficients. Check:

**Linear**: T((a+bx+cx²) + (d+ex+fx²)) = T((a+d)+(b+e)x+(c+f)x²) = [a+d; b+e; c+f] = [a;b;c] + [d;e;f] = T(p) + T(q). ✓

**One-to-one**: if T(p) = T(q) then [a;b;c] = [d;e;f] so a=d, b=e, c=f so p=q. ✓

**Onto**: given any [a;b;c] in R³, the polynomial a+bx+cx² maps to it. ✓

T is an isomorphism. P2 and R³ are the same space, just written differently.

```matlab
syms a b c x

p = a + b*x + c*x^2;

% T: read off coefficients into a vector
T = @(poly) coeffs(poly, x, 'All');   % extracts [c, b, a] (highest first)

T(3 + 2*x + x^2)   % [1, 2, 3] — note MATLAB orders highest degree first
```

### The dimension theorem for isomorphisms

Two finite-dimensional vector spaces are isomorphic if and only if they have the same dimension.

```
V ≅ W  ⟺  dim(V) = dim(W)
```

This is powerful. You do not have to find the transformation. Just check dimensions.

- P3 ≅ R⁴? dim(P3) = 4, dim(R⁴) = 4. Yes. ✓
- R² ≅ R³? dim(R²) = 2, dim(R³) = 3. No. ✗
- M_{2×2} ≅ R⁴? dim(M_{2×2}) = 4, dim(R⁴) = 4. Yes. ✓  (M_{2×2} is 2×2 matrices)

```matlab
% Dimensions of common spaces
% P_n (polynomials degree <= n): dimension is n+1
dim_P3 = 4;   % {1, x, x², x³}
dim_R4 = 4;

fprintf('P3 isomorphic to R4: %d\n', dim_P3 == dim_R4)  % 1 (true)
```

### The inverse transformation

Because an isomorphism is one-to-one and onto, it has an inverse T⁻¹ : W → V that is also an isomorphism.

In matrix terms: if A is the matrix of an isomorphism, A is square and invertible, and A⁻¹ is the matrix of T⁻¹.

```matlab
% Isomorphism between R² and R²
A = [1 2; 3 4];

det(A)      % nonzero means A is invertible means T is an isomorphism
A_inv = inv(A);   % matrix of T⁻¹

% Verify
A * A_inv   % should be identity matrix
```

### How to prove something is an isomorphism — the checklist

Given T : V → W:

**Step 1**: Verify T is linear.
Show T(u+v) = T(u)+T(v) and T(cu) = cT(u) for arbitrary u, v, c.

**Step 2**: Show T is one-to-one.
Find ker(T). If ker(T) = {0}, T is one-to-one.

**Step 3**: Show T is onto.
Show im(T) = W. Either show rank equals dim(W), or show an arbitrary element of W is hit.

**Shortcut**: if V and W are finite-dimensional and dim(V) = dim(W), then you only need to show ONE of one-to-one or onto. The other follows automatically.

```matlab
% Example: T : R³ → R³ defined by matrix A
A = [1 0 2; 0 1 1; 1 1 3];

% Step 1: all matrix transformations are linear by definition

% Step 2: check one-to-one (kernel = {0}?)
null_basis = null(A);
if isempty(null_basis)
    disp('One-to-one: yes')
else
    disp('One-to-one: no')
end

% Step 3: check onto (rank = dim of output space?)
if rank(A) == size(A,1)
    disp('Onto: yes')
else
    disp('Onto: no')
end

% Shortcut: just check det
if det(A) ~= 0
    disp('Isomorphism: yes')
else
    disp('Isomorphism: no')
end
```

---

## Part 11: Change of Basis

### Why you need it

You have a vector. You know its coordinates in basis B. You want its coordinates in a different basis B'. This comes up constantly when working with isomorphisms.

### The change of basis matrix

If B = {b1, b2, ..., bn} is a basis for V, the **change of basis matrix** from B to the standard basis is:

```
P = [b1 | b2 | ... | bn]   (basis vectors as columns)
```

To convert coordinates in B to standard coordinates:
```
v_standard = P · v_B
```

To go the other way (standard to B):
```
v_B = P⁻¹ · v_standard
```

Canonical example. B = {[1;1], [1;-1]} is a basis for R².

```
P = [1  1]
    [1 -1]
```

Vector v = [3;1] in standard coordinates. Find coordinates in B.

```
v_B = P⁻¹ · [3;1]
```

```matlab
P = [1 1; 1 -1];
v_standard = [3; 1];

v_B = P \ v_standard;   % [2; 1]
% Verify: 2*[1;1] + 1*[1;-1] = [2;2] + [1;-1] = [3;1] ✓
```

### Change of basis for a transformation matrix

If you have the matrix [T]_{B,B} (T expressed using basis B for both input and output) and you want [T]_{C,C} (T expressed using basis C), the formula is:

```
[T]_C = P⁻¹ · [T]_B · P
```

where P is the change of basis matrix from C to B.

```matlab
% T expressed in standard basis
T_standard = [2 1; 0 3];

% New basis C = {[1;1], [0;1]}
P = [1 0; 1 1];

% T in basis C
T_C = inv(P) * T_standard * P;
```

---

## Summary: The Complete Chain

```
Vector spaces → Bases → Coordinates → Linear Transformations
      ↓
  Matrices → Kernel/Image → One-to-One/Onto → Isomorphism
```

Every step follows from the previous one. The whole subject is about representing structure (vector spaces, transformations) with numbers (coordinates, matrices) so you can compute with it.

An isomorphism is the answer to the question: when are two vector spaces actually the same thing? The answer is: exactly when they have the same dimension, because then there is always a perfect structure-preserving map between them.

---

## Quick Reference

| Concept | What it is | MATLAB |
|---|---|---|
| Span | All combinations of a set of vectors | `null`, `rank` |
| Linear independence | No redundancy in a set | `rank(A) == size(A,2)` |
| Basis | Spanning + independent | `orth(A)` |
| Coordinates in B | Coefficients to rebuild v from B | `B_matrix \ v` |
| Linear transformation | Structure-preserving map | `A * v` |
| Matrix of T | Columns = T applied to each basis vector | build column by column |
| Kernel | Inputs that map to zero | `null(A)` |
| Image | All possible outputs | `rank(A)` |
| One-to-one | ker(T) = {0} | `rank(A) == size(A,2)` |
| Onto | im(T) = W | `rank(A) == size(A,1)` |
| Isomorphism | Linear + one-to-one + onto | `det(A) ~= 0` |
| Change of basis | P⁻¹ · v | `P \ v` |
