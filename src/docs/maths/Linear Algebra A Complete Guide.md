# Linear Algebra: A Complete Ground-Up Guide
### Every term defined. Every step shown by hand. MATLAB to verify, not to replace understanding.

---

## How this guide works

Each concept follows this pattern:
1. What the word actually means in plain English
2. Why it exists — what problem it solves
3. A canonical example worked completely by hand
4. Every variation you might encounter
5. MATLAB to check your hand work

Do not skip sections. Every concept in linear algebra is built directly on the previous one. If something later is confusing, the missing piece is almost always earlier in this guide.

---

---

# CHAPTER 1: The Objects We Work With

---

## 1.1 Vectors

### What the word means

A vector is an ordered list of numbers. That is the entire definition.

The word "ordered" matters. [3, 2] and [2, 3] are different vectors because the positions matter.

The numbers inside are called **components** or **entries**.

### Why vectors exist

We use vectors to describe things that have multiple pieces of information at once. A point in 2D space needs two numbers. A polynomial needs one number per coefficient. A color in RGB needs three numbers. Vectors let us handle all of these with the same set of tools.

### Notation

On paper, vectors are written as a vertical column. This is called a **column vector**:

```
    [3]
v = [2]
    [5]
```

The reason for writing vertically will become clear when we get to matrix multiplication. For now just know: vectors are columns by default.

### The space a vector lives in

If a vector has 2 components, it lives in **R²** (called "R two").
If it has 3 components, it lives in **R³**.
If it has n components, it lives in **Rⁿ**.

The R stands for "real numbers." Rⁿ just means "all possible lists of n real numbers."

### The two operations on vectors

Only two things are defined for vectors:

**Addition**: add matching components.

```
[3]   [1]   [3+1]   [4]
[2] + [5] = [2+5] = [7]
```

You can only add vectors from the same space. Adding a vector in R² to a vector in R³ is undefined — like adding miles to kilograms.

**Scalar multiplication**: multiply every component by one number. That number is called a **scalar** (just a plain number, not a vector).

```
    [3]   [2·3]   [6]
2 · [2] = [2·2] = [4]
```

Everything in linear algebra — every theorem, every technique — is built from just these two operations.

```matlab
% MATLAB: defining and operating on vectors
v = [3; 2];      % semicolons make a column vector
w = [1; 5];

v + w            % [4; 7]
2 * v            % [6; 4]
v - w            % [2; -3]  (same as v + (-1)*w)
```

---

## 1.2 Vector Spaces

### What the word means

A **vector space** is any collection of objects where addition and scalar multiplication are defined and behave the way you expect (commutativity, associativity, a zero element exists, etc.).

### Why this matters

The objects do not have to be arrows or number lists. They can be polynomials, matrices, functions — anything, as long as addition and scaling make sense.

**R²**: vectors with 2 components. ✓ vector space
**P2**: all polynomials of degree ≤ 2. ✓ vector space (you can add polynomials and scale them)
**M₂ₓ₂**: all 2×2 matrices. ✓ vector space (you can add matrices and scale them)

The tools of linear algebra apply to ALL of these because they are all vector spaces.

### The zero vector

Every vector space has a **zero vector** — the unique object that does nothing when added. In Rⁿ it is the vector of all zeros. In P2 it is the zero polynomial 0. In M₂ₓ₂ it is the matrix of all zeros.

```matlab
zeros(3,1)   % zero vector in R³: [0;0;0]
```

---

## 1.3 Polynomials as Vectors

This trips people up constantly so let us be very explicit.

A polynomial like 3 + 2x + x² is an element of the vector space **P2** (polynomials of degree at most 2).

You can add two polynomials: (3 + 2x + x²) + (1 + x) = 4 + 3x + x². ✓
You can scale a polynomial: 2·(3 + 2x + x²) = 6 + 4x + 2x². ✓

So polynomials are vectors in a vector space. When we say "vector" in this course, it might mean an arrow, a list of numbers, a polynomial, or a matrix. The word just means "an element of a vector space."

### The general form

A polynomial in P1 (degree at most 1) always looks like:
```
a₁x + a₂
```
where a₁ is the coefficient of x and a₂ is the constant.

A polynomial in P2 (degree at most 2) always looks like:
```
a₁x² + a₂x + a₃
```

The aᵢ are just placeholder names for "whatever number sits in that position." When a problem gives you a specific polynomial like 3 + 2x, it is telling you a₁ = 2, a₂ = 3.

---

---

# CHAPTER 2: Building Blocks

---

## 2.1 Linear Combinations

### What the word means

A **linear combination** of a set of vectors is what you get when you scale each vector by some number and add them all up.

Given vectors v₁, v₂, v₃ and numbers c₁, c₂, c₃:

```
c₁·v₁ + c₂·v₂ + c₃·v₃
```

is a linear combination. The numbers c₁, c₂, c₃ are called **coefficients**.

### Canonical example

```
v₁ = [1]    v₂ = [0]
     [0]         [1]

3·v₁ + 2·v₂ = 3·[1] + 2·[0] = [3] + [0] = [3]
                  [0]     [1]   [0]   [2]   [2]
```

The vector [3; 2] is a linear combination of v₁ and v₂ with coefficients 3 and 2.

### Why this matters

Almost every question in linear algebra is secretly asking: "is this vector a linear combination of these other vectors?" or "what coefficients would I need?"

```matlab
v1 = [1; 0];
v2 = [0; 1];

% Form the combination 3*v1 + 2*v2
result = 3*v1 + 2*v2;   % [3; 2]
```

---

## 2.2 Span

### What the word means

The **span** of a set of vectors is the collection of ALL possible linear combinations you could form from those vectors. Every possible choice of coefficients, every possible result.

Written mathematically: span{v₁, v₂} = {c₁·v₁ + c₂·v₂ : c₁, c₂ are any real numbers}

The curly braces mean "the set of all."

### Why span matters

Span answers: "what territory can I reach using these vectors as building blocks?"

### Canonical example 1: span fills the plane

```
v₁ = [1]    v₂ = [0]
     [0]         [1]
```

Any vector [a; b] in R² can be written as a·v₁ + b·v₂. So span{v₁, v₂} = all of R². These two vectors can reach everywhere in the plane.

### Canonical example 2: span is just a line

```
v₁ = [1]    v₂ = [2]
     [2]         [4]
```

Notice: v₂ = 2·v₁. So any combination:
```
c₁·v₁ + c₂·v₂ = c₁·v₁ + c₂·(2·v₁) = (c₁ + 2c₂)·v₁
```

No matter what c₁ and c₂ you pick, you always end up with some multiple of v₁. You can only travel along the line through v₁. The span is just one line, not the whole plane.

### Canonical example 3: span in polynomial space

span{1, x} = all polynomials of degree ≤ 1 = {a + bx : a, b are real}

You can form any degree-1 polynomial from these two building blocks.

span{1, x²} does NOT include x. You cannot build x from 1 and x² with any coefficients.

```matlab
% To check if a vector w is in the span of v1, v2, v3:
% Ask: does the system [v1 v2 v3] * c = w have a solution?
v1 = [1; 0; 2];
v2 = [0; 1; 1];
w  = [3; 2; 8];

A = [v1 v2];
c = A \ w;         % try to solve
% Check if the solution actually works:
norm(A*c - w)      % if this is ~0, w IS in the span
```

---

## 2.3 Linear Independence

### What the word means

A set of vectors is **linearly independent** if no vector in the set can be built as a linear combination of the others.

The technical definition: vectors v₁, v₂, ..., vₙ are linearly independent if the ONLY solution to:
```
c₁·v₁ + c₂·v₂ + ... + cₙ·vₙ = 0
```
is c₁ = c₂ = ... = cₙ = 0.

In other words: the only way to combine them into the zero vector is to use all zero coefficients. There is no "trick" combination that cancels everything out.

### Why independence matters

If vectors are independent, each one contributes something new. None of them is redundant. This is what you want from a set of building blocks.

### How to check by hand

Set up the equation c₁·v₁ + c₂·v₂ + ... = 0 and solve. If the only solution is all zeros, independent. If there is any nonzero solution, dependent.

### Canonical example 1: independent

```
v₁ = [1]    v₂ = [0]
     [0]         [1]
```

Set up: c₁·[1;0] + c₂·[0;1] = [0;0]

This gives:
```
c₁ = 0
c₂ = 0
```

Only the zero solution. **Linearly independent.**

### Canonical example 2: dependent

```
v₁ = [1]    v₂ = [2]    v₃ = [1]
     [2]         [4]         [1]
```

Set up: c₁·v₁ + c₂·v₂ + c₃·v₃ = 0

```
c₁ + 2c₂ + c₃  = 0
2c₁ + 4c₂ + c₃ = 0
```

One nonzero solution: c₁ = 2, c₂ = -1, c₃ = 0 (check: 2·v₁ - 1·v₂ = [2;4] - [2;4] = [0;0] ✓)

**Linearly dependent.** v₂ is redundant — it is just 2·v₁.

### Canonical example 3: polynomials

Are {1, x, x²} linearly independent?

Set up: c₁·1 + c₂·x + c₃·x² = 0 (the zero polynomial)

The zero polynomial has all coefficients equal to zero:
```
c₁ = 0    (constant coefficient)
c₂ = 0    (coefficient of x)
c₃ = 0    (coefficient of x²)
```

Only the zero solution. **Linearly independent.**

Are {1, x, 2+3x} linearly independent?

Set up: c₁·1 + c₂·x + c₃·(2+3x) = 0

```
(c₁ + 2c₃) = 0    → c₁ = -2c₃
(c₂ + 3c₃) = 0    → c₂ = -3c₃
```

Take c₃ = 1: then c₁ = -2, c₂ = -3. 
Check: -2·1 + (-3)·x + 1·(2+3x) = -2 - 3x + 2 + 3x = 0. ✓

**Linearly dependent.** The polynomial 2+3x can be built from 1 and x.

```matlab
% Check independence: put vectors as columns of a matrix
% If rank = number of columns, independent
% If rank < number of columns, dependent

A = [1 2 1; 2 4 1];   % v1, v2, v3 as columns
rank(A)               % gives 2, but we have 3 columns → dependent

B = [1 0; 0 1];       % v1, v2 as columns
rank(B)               % gives 2 = number of columns → independent
```

---

## 2.4 Basis

### What the word means

A **basis** for a vector space V is a set of vectors that:
1. **Spans** V — you can build anything in V from this set
2. **Is linearly independent** — no redundancy, every vector in the set is necessary

A basis is the minimal complete set of building blocks for a space.

### Why basis matters

A basis gives you a coordinate system. Once you have a basis, every vector in the space can be described by a unique list of numbers (how much of each basis vector you need). Without a basis, you have no way to turn abstract vectors into computable numbers.

### The standard basis for Rⁿ

The standard basis vectors are written e₁, e₂, ..., eₙ. They have a 1 in one position and zeros everywhere else.

For R³:
```
e₁ = [1]    e₂ = [0]    e₃ = [0]
     [0]         [1]         [0]
     [0]         [0]         [1]
```

Any vector [a; b; c] = a·e₁ + b·e₂ + c·e₃. These clearly span R³ and are clearly independent.

### The standard basis for Pₙ

For P2 (polynomials of degree ≤ 2): {1, x, x²}

For P3: {1, x, x², x³}

In general for Pₙ: {1, x, x², ..., xⁿ} — this set has n+1 elements.

### Non-standard bases

Any set that spans V and is independent is a valid basis. There are infinitely many choices.

Example. For R²:
```
B = {[1;1], [1;-1]}
```

Check spanning: can you build any [a; b]?
```
c₁·[1;1] + c₂·[1;-1] = [c₁+c₂; c₁-c₂] = [a; b]
```
Solving: c₁ = (a+b)/2, c₂ = (a-b)/2. Yes, any [a;b] is reachable. ✓

Check independence: c₁·[1;1] + c₂·[1;-1] = [0;0] gives c₁+c₂=0 and c₁-c₂=0, so c₁=c₂=0. ✓

This is a valid basis for R².

### Dimension

The **dimension** of a vector space is the number of vectors in any basis.

This is a theorem: every basis for a given space has the same number of vectors.

```
dim(Rⁿ) = n
dim(Pₙ) = n+1       (because the basis {1,x,...,xⁿ} has n+1 elements)
dim(M₂ₓ₂) = 4       (four basis matrices, one for each position)
dim(M_{m×n}) = m·n
```

```matlab
% Standard basis vectors in R³
e1 = [1;0;0];
e2 = [0;1;0];
e3 = [0;0;1];

% Any vector is a combination of these
v = [4; -2; 7];
% v = 4*e1 + (-2)*e2 + 7*e3
```

---

## 2.5 Coordinates

### What the word means

Given a basis B = {b₁, b₂, ..., bₙ} for a space V, the **coordinates** of a vector v with respect to B are the unique numbers c₁, c₂, ..., cₙ such that:

```
v = c₁·b₁ + c₂·b₂ + ... + cₙ·bₙ
```

Written as a column vector:
```
[v]_B = [c₁]
        [c₂]
        [...]
        [cₙ]
```

The bracket notation [v]_B means "the coordinate vector of v in basis B."

### Why coordinates matter

This is the bridge between abstract vectors (polynomials, matrices, etc.) and concrete numbers you can compute with. Once you have coordinates, everything becomes matrix multiplication.

### How to find coordinates — by hand

You set up the equation v = c₁·b₁ + c₂·b₂ + ... and solve for the c's.

### Canonical example 1: standard basis (trivial case)

B = {e₁, e₂} = {[1;0], [0;1]}, v = [3; 7]

```
v = c₁·[1;0] + c₂·[0;1] = [c₁; c₂] = [3; 7]
```

So c₁ = 3, c₂ = 7. The coordinates are just the components. This is why the standard basis is "standard" — coordinates are the numbers themselves.

### Canonical example 2: non-standard basis in R²

B = {[1;1], [1;-1]}, find coordinates of v = [5; 1].

Set up:
```
c₁·[1;1] + c₂·[1;-1] = [5;1]
```

This gives two equations:
```
c₁ + c₂  = 5     (top component)
c₁ - c₂  = 1     (bottom component)
```

Add the two equations: 2c₁ = 6, so c₁ = 3.
Subtract: 2c₂ = 4, so c₂ = 2.

Check: 3·[1;1] + 2·[1;-1] = [3;3] + [2;-2] = [5;1] ✓

So [v]_B = [3; 2].

### Canonical example 3: polynomial coordinates

B = {1, x, x²} (standard basis for P2), find coordinates of p = 4 - 3x + 2x².

Since B is the standard polynomial basis, coordinates are just coefficients:
```
[p]_B = [4; -3; 2]
```

### Canonical example 4: polynomial with non-standard basis

B = {1+x, 1-x} (a basis for P1), find coordinates of p = 7 + 3x.

Set up:
```
c₁·(1+x) + c₂·(1-x) = 7 + 3x
```

Expand:
```
(c₁ + c₂) + (c₁ - c₂)x = 7 + 3x
```

Match coefficients:
```
c₁ + c₂  = 7     (constant term)
c₁ - c₂  = 3     (coefficient of x)
```

Solve: c₁ = 5, c₂ = 2.

Check: 5·(1+x) + 2·(1-x) = 5+5x+2-2x = 7+3x ✓

So [p]_B = [5; 2].

```matlab
% Finding coordinates relative to a non-standard basis
% B = {[1;1], [1;-1]}, find coordinates of [5;1]

% Put basis vectors as columns of a matrix
B_matrix = [1 1; 1 -1];
v = [5; 1];

% Solve B_matrix * c = v for c
c = B_matrix \ v;   % backslash (\) solves the system Ax=b
% c = [3; 2]

% Verify
B_matrix * c        % should give [5; 1]
```

The backslash operator `\` in MATLAB solves the equation Ax = b for x. It is the computational version of "solve this system of equations."

---

---

# CHAPTER 3: Matrices

---

## 3.1 What a Matrix Is

A **matrix** is a rectangular array of numbers arranged in rows and columns.

```
A = [1  2  3]
    [4  5  6]
```

This is a 2×3 matrix (2 rows, 3 columns). The dimensions are always stated as rows × columns.

The entry in row i, column j is written Aᵢⱼ. So A₁₂ = 2 (row 1, column 2).

```matlab
A = [1 2 3; 4 5 6];   % rows separated by semicolons
size(A)                % [2 3]
A(1,2)                 % 2  — row 1, column 2
```

---

## 3.2 Matrix-Vector Multiplication

This is the operation that connects matrices to transformations.

### The rule

To multiply matrix A (m×n) by vector v (n×1):

Each entry of the result is the **dot product** of one row of A with the vector v.

Dot product: multiply matching components and add.

```
A = [1  2]    v = [3]
    [3  4]        [1]
    [0  5]

Row 1 dot v: 1·3 + 2·1 = 5
Row 2 dot v: 3·3 + 4·1 = 13
Row 3 dot v: 0·3 + 5·1 = 5

       [5 ]
A·v =  [13]
       [5 ]
```

### The dimension requirement

For A·v to be defined, the number of columns of A must equal the number of rows of v (its length). An m×n matrix times an n×1 vector gives an m×1 vector.

```matlab
A = [1 2; 3 4; 0 5];
v = [3; 1];
A * v    % [5; 13; 5]
```

---

## 3.3 Matrix-Matrix Multiplication

To multiply A (m×n) by B (n×p):

Each column of B is a vector. Multiply A by each column of B separately. Stack the results as columns of the output.

Result has dimensions m×p.

```
A = [1 2]    B = [5 1]
    [3 4]        [6 2]

Column 1 of B is [5;6]:
A·[5;6] = [1·5+2·6; 3·5+4·6] = [17; 39]

Column 2 of B is [1;2]:
A·[1;2] = [1·1+2·2; 3·1+4·2] = [5; 11]

        [17  5]
A·B  =  [39 11]
```

```matlab
A = [1 2; 3 4];
B = [5 1; 6 2];
A * B    % [17 5; 39 11]
```

---

## 3.4 Rank

### What the word means

The **rank** of a matrix is the number of linearly independent rows (equivalently, the number of linearly independent columns — these always turn out equal).

More concretely: if you reduce the matrix to its simplest form (row reduction), rank counts how many rows are NOT all zeros.

### Why rank matters

Rank measures how much "real content" a matrix has. A matrix with high rank is doing a lot. A matrix with low rank has redundancy — some rows (or columns) are just combinations of others.

### How to find rank by hand

**Row reduction** (also called Gaussian elimination):
Use these three operations to simplify a matrix:
1. Swap two rows
2. Multiply a row by a nonzero number
3. Add a multiple of one row to another row

Keep going until you have a staircase pattern (**row echelon form**). Count the nonzero rows. That count is the rank.

### Canonical example

```
A = [1  2  3]
    [2  4  6]
    [1  0  1]
```

Row 2 = 2 × Row 1. Subtract 2×(Row 1) from Row 2:
```
    [1  2  3]
    [0  0  0]    ← became all zeros
    [1  0  1]
```

Subtract Row 1 from Row 3:
```
    [1  2  3]
    [0  0  0]
    [0 -2 -2]
```

Swap Row 2 and Row 3:
```
    [1  2  3]
    [0 -2 -2]
    [0  0  0]
```

Two nonzero rows. **Rank = 2.**

```matlab
A = [1 2 3; 2 4 6; 1 0 1];
rank(A)    % 2
```

---

---

# CHAPTER 4: Linear Transformations

---

## 4.1 What a Linear Transformation Is

### The definition

A **linear transformation** T from vector space V to vector space W is a function that satisfies two rules for ALL vectors u, v in V and ALL scalars c:

**Rule 1**: T(u + v) = T(u) + T(v)
**Rule 2**: T(c·v) = c·T(v)

These two rules say: it does not matter if you add/scale before or after applying T — you get the same result either way.

### What these rules rule out

- Anything that shifts the origin: T(v) = v + [1;0] is NOT linear (Rule 1 fails)
- Anything that curves or bends: T([x;y]) = [x²;y] is NOT linear (Rule 2 fails)
- The zero vector must always map to zero: T(0) = 0

### What linear transformations do geometrically

They can stretch, squish, rotate, reflect, and project — but lines stay lines, and the origin stays put.

### The formula always tells you the rule

When a problem defines T with a formula, that formula IS the transformation. You just substitute and compute.

Example: T(a₁x + a₂) = [-4a₁; 2a₂]

This tells you exactly what to do with any input. The symbols a₁ and a₂ are slots. Plug in your polynomial's coefficients, get the output.

---

## 4.2 The Two Kinds of Output

In your course, transformation outputs come in two forms. The formula always reveals which one.

### Kind 1: polynomial output

T : P1 → P2, defined by T(p(x)) = x·p(x)

You put in a polynomial, you get out a polynomial.

```
T(3 + 2x) = x·(3 + 2x) = 3x + 2x²
```

### Kind 2: vector output

T : P1 → R², defined by T(a₁x + a₂) = [-4a₁; 2a₂]

You put in a polynomial, you get out a number vector.

```
T(3x + 5):
  a₁ = 3  (coefficient of x)
  a₂ = 5  (constant)
  Output: [-4·3; 2·5] = [-12; 10]
```

### How to always identify a₁ and a₂

The formula T(a₁x + a₂) = ... uses a₁ for the x coefficient and a₂ for the constant.

Given any polynomial, match positions:
```
Polynomial: 7x + (-2)
              ↑      ↑
             a₁     a₂
```

So a₁ = 7, a₂ = -2.

Given polynomial: 5 (just a constant, no x term)
Written fully: 0·x + 5
So a₁ = 0, a₂ = 5.

Given polynomial: x (just x, no constant)
Written fully: 1·x + 0
So a₁ = 1, a₂ = 0.

This always works. Every polynomial has one coefficient per basis element.

---

## 4.3 Building the Matrix of a Transformation

### The complete setup

You are always given:
- A transformation T
- A basis B for the input space (list of n vectors)
- A basis B' for the output space (list of m vectors)

You need to find the matrix [T]_{B,B'}.

### Why the matrix exists

A matrix is just a compact way to record what T does to every possible input. Because T is linear, its entire behavior is determined by what it does to the basis vectors alone. Everything else follows from linearity.

### The dimension rule

The matrix is ALWAYS: **m rows × n columns**

- n = number of vectors in B (input basis) → determines columns
- m = number of vectors in B' (output basis) → determines rows

This is not a coincidence. Each column answers "what happens to one basis vector from B?" and needs one number per vector in B' to describe the answer.

### The four steps — always exactly these four

**Step 1**: Take the first vector from B. Plug it into T. Get an output.

**Step 2**: Express that output as a linear combination of the vectors in B'. Solve for the coefficients.

**Step 3**: Write those coefficients as a column, top to bottom, in the order of B'. This is column 1 of your matrix.

**Step 4**: Repeat for every vector in B. Each one produces one column.

### Canonical example 1: polynomial to polynomial

T : P1 → P2, T(p) = x·p, B = {1, x}, B' = {1, x, x²}

B has 2 vectors → 2 columns.
B' has 3 vectors → 3 rows.
Matrix is 3×2.

**Column 1**: plug in first item of B, which is 1.
```
T(1) = x·1 = x
```
Express x in terms of B' = {1, x, x²}:
```
x = 0·1 + 1·x + 0·x²
```
Coefficients: 0, 1, 0. Column 1 = [0; 1; 0].

**Column 2**: plug in second item of B, which is x.
```
T(x) = x·x = x²
```
Express x² in terms of B' = {1, x, x²}:
```
x² = 0·1 + 0·x + 1·x²
```
Coefficients: 0, 0, 1. Column 2 = [0; 0; 1].

**Matrix**:
```
[T]_{B,B'} = [0  0]
             [1  0]
             [0  1]
```

### Canonical example 2: polynomial to vector

T : P1 → R², T(a₁x + a₂) = [-4a₁; 2a₂], B = {1, x}, B' = {[1;0], [0;1]}

B has 2 vectors → 2 columns.
B' has 2 vectors → 2 rows.
Matrix is 2×2.

**Column 1**: plug in 1 (the first item in B).

1 as a polynomial: a₁ = 0, a₂ = 1.
```
T(1) = [-4·0; 2·1] = [0; 2]
```
Express [0;2] in terms of B' = {[1;0], [0;1]}:
```
[0;2] = 0·[1;0] + 2·[0;1]
```
Coefficients: 0, 2. Column 1 = [0; 2].

**Column 2**: plug in x (the second item in B).

x as a polynomial: a₁ = 1, a₂ = 0.
```
T(x) = [-4·1; 2·0] = [-4; 0]
```
Express [-4;0] in terms of B':
```
[-4;0] = -4·[1;0] + 0·[0;1]
```
Coefficients: -4, 0. Column 2 = [-4; 0].

**Matrix**:
```
[T]_{B,B'} = [0  -4]
             [2   0]
```

### Why B' = standard makes the expressing step invisible

When B' = {[1;0], [0;1]}, expressing any vector [a;b] in terms of B' always gives coefficients a and b — the numbers that are already sitting there. So you skip the expressing step and just read off the components of the output directly.

This is ONLY true when B' is the standard basis. When B' is non-standard, you must actually solve for the coefficients.

```matlab
% Build the matrix column by column in MATLAB
% T: P1 → R², T(a1*x + a2) = [-4*a1; 2*a2]
% B = {1, x}, B' = standard basis for R²

% Column 1: T(1), where a1=0, a2=1
col1 = [-4*0; 2*1];   % [0; 2]

% Column 2: T(x), where a1=1, a2=0
col2 = [-4*1; 2*0];   % [-4; 0]

M = [col1, col2]
% M = [0  -4]
%     [2   0]
```

---

## 4.4 Using the Matrix to Compute T of Any Input

Once you have the matrix, you can find T of any vector quickly.

### The process

1. Write your input as a coordinate vector in B (list of coefficients, one per basis vector in B, top to bottom in B's order)
2. Multiply the matrix by that coordinate vector
3. Read the result as a vector of coordinates in B'

### Canonical example

Matrix from above: M = [0 -4; 2 0]. Find T(5x + 3).

**Step 1**: Express 5x + 3 as coordinates in B = {1, x}.
```
5x + 3 = 3·(1) + 5·(x)
```
Coordinate vector: [3; 5]  (3 of "1", then 5 of "x", in B's order)

**Step 2**: Multiply.
```
M · [3;5] = [0·3 + (-4)·5]  = [-20]
            [2·3 +   0·5 ]    [ 6 ]
```

**Step 3**: Read back in B' = {[1;0], [0;1]}.
Result is [-20; 6], which in standard coordinates means the vector [-20; 6].

Verify directly: T(5x+3) = [-4·5; 2·3] = [-20; 6] ✓

```matlab
M = [0 -4; 2 0];
v = [3; 5];        % coordinates of 5x+3 in B={1,x}: 3 of "1", 5 of "x"
M * v              % [-20; 6]
```

---

---

# CHAPTER 5: Kernel and Image

---

## 5.1 Kernel (Null Space)

### What the word means

The **kernel** of T (written ker(T) or null(A)) is the set of all inputs that T sends to the zero vector.

```
ker(T) = { v in V : T(v) = 0 }
```

In matrix terms, if T(v) = A·v, then ker(T) = {v : A·v = 0}.

### Why kernel matters

The kernel tells you whether T "collapses" information. If the kernel contains only the zero vector, nothing is lost — every distinct input gives a distinct output. If the kernel is bigger, multiple inputs give the same output.

### How to find the kernel by hand

Set A·v = 0. Row reduce the augmented matrix [A | 0]. Solve.

### Canonical example

```
A = [1  2  3]
    [0  0  1]
```

Set up A·v = 0:
```
[1 2 3] [x]   [0]
[0 0 1] [y] = [0]
        [z]
```

From row 2: z = 0.
From row 1: x + 2y + 3(0) = 0, so x = -2y.

y is free — it can be anything. Let y = t (a parameter):
```
x = -2t
y = t
z = 0
```

So ker(A) = all vectors of the form t·[-2; 1; 0] for any t.

The kernel is a line through the origin. It has **dimension 1**.

```matlab
A = [1 2 3; 0 0 1];
null(A)     % gives a basis vector for the kernel: [-2; 1; 0] (normalized)
```

---

## 5.2 Image (Range, Column Space)

### What the word means

The **image** of T (written im(T) or range(T)) is the set of all possible outputs.

```
im(T) = { T(v) : v in V }
```

In matrix terms: all possible results of A·v as v ranges over all inputs. This equals the **span of the columns of A**.

### Why image matters

The image tells you what outputs are reachable. If im(T) = W (the whole output space), then every output is reachable.

### How to find the image

The image is the column space of A. Its dimension equals the rank of A. To find a basis for it, take the columns of A that are pivot columns after row reduction.

### Canonical example

```
A = [1  2  3]
    [0  0  1]
```

After row reduction, pivot columns are columns 1 and 3 (column 2 is not a pivot column — it is a multiple of column 1 in the reduced form). So the image is spanned by columns 1 and 3:

```
im(A) = span{ [1;0], [3;1] }
```

Dimension of image = 2.

```matlab
A = [1 2 3; 0 0 1];
rank(A)       % 2 — dimension of image
orth(A)       % gives an orthonormal basis for the column space
```

---

## 5.3 The Rank-Nullity Theorem

### Statement

For any linear transformation T from an n-dimensional space:

```
dim(ker T) + dim(im T) = n
```

In words: dimension of kernel plus dimension of image equals dimension of input space. Always. No exceptions.

### Why this is useful

If you know any two of these three quantities, you can find the third without computing it.

### Canonical example

T : R⁵ → R³, represented by a 3×5 matrix A with rank 2.

- n = 5 (input space is R⁵)
- dim(im T) = rank(A) = 2
- dim(ker T) = 5 - 2 = 3

You do not need to find the actual kernel — you already know its dimension.

```matlab
A = [1 2 3 0 1; 0 0 1 1 2; 1 2 4 1 3];
n = size(A, 2);      % 5 — number of columns = dim of input space
r = rank(A);         % dimension of image
nullity = n - r;     % dimension of kernel
fprintf('rank=%d, nullity=%d, sum=%d\n', r, nullity, r+nullity)
```

---

---

# CHAPTER 6: One-to-One and Onto

---

## 6.1 One-to-One (Injective)

### What the word means

T is **one-to-one** if every output comes from exactly one input. No two different inputs produce the same output.

Formally: T(u) = T(v) implies u = v.

### The test for linear transformations

For linear transformations specifically:

**T is one-to-one if and only if ker(T) = {0}**

The zero vector is the only input that maps to zero.

Why? If T(u) = T(v), then T(u) - T(v) = 0, so T(u-v) = 0 (by linearity). If ker(T) = {0}, then u-v = 0, so u = v.

### Matrix test

T is one-to-one ⟺ rank(A) = n (where n = number of columns = dimension of input space)

This means no columns are redundant — every column contributes to the rank.

### Canonical example

```
A = [1 0]
    [0 1]
    [2 3]
```

T : R² → R³. Rank = 2 = number of columns. One-to-one. ✓

Different inputs give different outputs — nothing gets collapsed.

```matlab
A = [1 0; 0 1; 2 3];
rank(A) == size(A,2)   % true → one-to-one
```

---

## 6.2 Onto (Surjective)

### What the word means

T is **onto** if every possible output is actually hit by some input. The image equals the entire output space.

Formally: for every w in W, there exists v in V with T(v) = w.

### Matrix test

T is onto ⟺ rank(A) = m (where m = number of rows = dimension of output space)

Every row contributes — the outputs span the whole output space.

### Canonical example

```
A = [1 0 2]
    [0 1 3]
```

T : R³ → R². Rank = 2 = number of rows. Onto. ✓

Every vector in R² can be reached from some input in R³.

```matlab
A = [1 0 2; 0 1 3];
rank(A) == size(A,1)   % true → onto
```

---

## 6.3 The Relationship to Dimensions

The rank-nullity theorem plus these tests give us:

- If n > m (more inputs than outputs): T cannot be one-to-one (kernel is too big), but might be onto.
- If n < m (more outputs than inputs): T cannot be onto (image is too small), but might be one-to-one.
- If n = m: T might be both, or neither.

Only when the input and output spaces have equal dimension is it possible to have both properties at once. This leads directly to isomorphisms.

---

---

# CHAPTER 7: Isomorphisms

---

## 7.1 What an Isomorphism Is

### The definition

A linear transformation T : V → W is an **isomorphism** if it is:
1. Linear ✓ (it is a linear transformation by assumption)
2. One-to-one ✓ (ker(T) = {0})
3. Onto ✓ (im(T) = W)

When an isomorphism exists between V and W, we say V and W are **isomorphic**, written V ≅ W.

### What isomorphism actually means

V and W are isomorphic means they are structurally identical. Every vector in V has exactly one partner in W. Every operation in V has an exact mirror in W. The spaces are the same abstract structure wearing different clothing.

Think of it like a perfect translation between two languages where every word in one language has exactly one word in the other, and every sentence structure is preserved.

### The most important theorem

Two finite-dimensional vector spaces are isomorphic if and only if they have the same dimension.

```
V ≅ W  ⟺  dim(V) = dim(W)
```

You do not need to find the transformation — just check dimensions.

---

## 7.2 Canonical Examples

### Example 1: Pₙ ≅ Rⁿ⁺¹

P2 (polynomials of degree ≤ 2) is isomorphic to R³.

Both have dimension 3. The isomorphism:
```
T : P2 → R³
T(a + bx + cx²) = [a; b; c]
```

Just reads off coefficients. Every polynomial maps to exactly one vector. Every vector maps to exactly one polynomial. Structure is preserved.

Check:
- Linear: T((a+bx+cx²) + (d+ex+fx²)) = [a+d;b+e;c+f] = [a;b;c]+[d;e;f] = T(p)+T(q) ✓
- One-to-one: T(p)=0 means [a;b;c]=[0;0;0] means a=b=c=0 means p=0 ✓
- Onto: given any [a;b;c], the polynomial a+bx+cx² maps to it ✓

### Example 2: M₂ₓ₂ ≅ R⁴

The space of 2×2 matrices has dimension 4. R⁴ has dimension 4. They are isomorphic.

The isomorphism:
```
T([a b; c d]) = [a; b; c; d]
```

Just unrolls the matrix into a vector.

### Example 3: spaces that are NOT isomorphic

P2 (dimension 3) and R⁴ (dimension 4) are NOT isomorphic. Different dimensions — no isomorphism exists.

---

## 7.3 How to Prove Something is an Isomorphism

Given T : V → W, prove it is an isomorphism by checking all three conditions.

### Full worked example

T : P2 → R³ defined by T(a + bx + cx²) = [a-b; b+c; a+c]

**Check linearity**:

Let p = a + bx + cx² and q = d + ex + fx².

```
T(p + q) = T((a+d) + (b+e)x + (c+f)x²)
         = [(a+d)-(b+e); (b+e)+(c+f); (a+d)+(c+f)]
         = [a-b; b+c; a+c] + [d-e; e+f; d+f]
         = T(p) + T(q)  ✓
```

```
T(k·p) = T(ka + kbx + kcx²)
       = [ka-kb; kb+kc; ka+kc]
       = k·[a-b; b+c; a+c]
       = k·T(p)  ✓
```

**Check one-to-one** (find ker(T)):

Set T(a + bx + cx²) = [0;0;0]:
```
a - b = 0    → a = b
b + c = 0    → c = -b
a + c = 0    → a = -c = b  ✓ (consistent)
```

From a = b and c = -b, with a = b:
```
a = b, c = -a
```

Plug into a + c = 0: a + (-a) = 0 ✓. This is consistent but... we need to check if the only solution is a=b=c=0.

From a-b=0 and b+c=0 and a+c=0:
Add all three: (a-b) + (b+c) + (a+c) = 2a+2c = 0, so a = -c.
From a-b=0: a=b.
From b+c=0: b=-c, so a=-c, consistent.

If we let a = t, then b = t, c = -t. For this to be zero: t=0. So a=b=c=0. ker(T) = {0}. **One-to-one.** ✓

**Check onto**:

dim(V) = dim(P2) = 3, dim(W) = dim(R³) = 3. Since T is one-to-one and dimensions are equal, T is automatically onto. ✓

(This shortcut always works: if dim(V) = dim(W) and T is one-to-one, then T is onto. And vice versa.)

**Conclusion**: T is an isomorphism.

---

## 7.4 The Shortcut When Dimensions Are Equal

If dim(V) = dim(W), you only need to verify ONE of:
- T is one-to-one, OR
- T is onto

The other one follows automatically from the rank-nullity theorem.

Why: if dim(V) = dim(W) = n, and ker(T) = {0} (dimension 0), then dim(im T) = n - 0 = n = dim(W), so im(T) = W.

```matlab
% Check if T is an isomorphism when T is given by matrix A
% (only works when V = Rⁿ, W = Rᵐ)

A = [1 -1 0; 0 1 1; 1 0 1];   % 3×3 matrix, T: R³→R³

% A is an isomorphism iff det(A) ≠ 0
det(A)       % if nonzero: isomorphism

% Or equivalently:
rank(A) == size(A,1) && rank(A) == size(A,2)   % both onto and one-to-one
```

---

## 7.5 The Inverse of an Isomorphism

Since an isomorphism is one-to-one and onto, it has an inverse T⁻¹ : W → V. The inverse is also an isomorphism.

For matrix transformations: (A)⁻¹ is the matrix of T⁻¹.

```matlab
A = [1 -1 0; 0 1 1; 1 0 1];
A_inv = inv(A);

% Verify
A * A_inv    % should be identity (1s on diagonal, 0s elsewhere)
A_inv * A    % also identity
```

---

---

# CHAPTER 8: Change of Basis

---

## 8.1 Why Coordinates Change with Basis

The same vector v has different coordinates in different bases. The vector itself does not change — only the description of it changes.

Analogy: the distance from Boston to New York is the same whether you measure it in miles or kilometers. The number changes, the reality does not.

### Canonical example

v = [3; 1] in standard coordinates (relative to e₁, e₂).

In basis B = {[1;1], [1;-1]}:
```
c₁·[1;1] + c₂·[1;-1] = [3;1]
c₁ + c₂ = 3
c₁ - c₂ = 1
→ c₁ = 2, c₂ = 1
```

Same vector v, but [v]_B = [2; 1].

---

## 8.2 The Change of Basis Matrix

### From B to standard

If B = {b₁, b₂, ..., bₙ}, put the basis vectors as columns:

```
P = [b₁ | b₂ | ... | bₙ]
```

Then: v_standard = P · [v]_B

P converts B-coordinates to standard coordinates.

### From standard to B

P⁻¹ converts standard coordinates to B-coordinates:

```
[v]_B = P⁻¹ · v_standard
```

### Canonical example

B = {[1;1], [1;-1]}.

```
P = [1  1]
    [1 -1]
```

Find [v]_B where v = [3;1]:
```
[v]_B = P⁻¹ · [3;1]
```

To find P⁻¹ by hand, set up [P | I] and row reduce to [I | P⁻¹]:

```
[1  1 | 1 0]
[1 -1 | 0 1]

R2 → R2 - R1:
[1  1 | 1  0]
[0 -2 |-1  1]

R2 → R2 / (-2):
[1  1 | 1    0  ]
[0  1 | 1/2 -1/2]

R1 → R1 - R2:
[1  0 | 1/2  1/2]
[0  1 | 1/2 -1/2]
```

So P⁻¹ = [1/2 1/2; 1/2 -1/2].

```
[v]_B = [1/2 1/2; 1/2 -1/2] · [3;1] = [2; 1]
```

Verify: 2·[1;1] + 1·[1;-1] = [2;2]+[1;-1] = [3;1] ✓

```matlab
P = [1 1; 1 -1];
v = [3; 1];

v_in_B = P \ v;    % [2; 1]

% Convert back
P * v_in_B         % [3; 1] — original vector
```

---

---

# QUICK REFERENCE

| Term | Plain English | Formula | MATLAB |
|---|---|---|---|
| Vector | Ordered list of numbers | [a; b; c] | `v = [a;b;c]` |
| Scalar multiplication | Multiply all components | c·v | `c*v` |
| Linear combination | Scale and add vectors | c₁v₁ + c₂v₂ | `c1*v1 + c2*v2` |
| Span | All reachable combinations | {c₁v₁+c₂v₂ : any c} | — |
| Linear independence | No redundancy | only solution to Σcᵢvᵢ=0 is all c=0 | `rank(A)==size(A,2)` |
| Basis | Spanning + independent | minimal complete building blocks | `orth(A)` |
| Dimension | Number of vectors in any basis | dim(Rⁿ)=n, dim(Pₙ)=n+1 | `rank(A)` |
| Coordinates in B | Coefficients to rebuild v from B | solve B·c = v | `B\v` |
| Linear transformation | Structure-preserving function | T(u+v)=T(u)+T(v) | `A*v` |
| Matrix of T | T applied to each B vector, expressed in B' | columns = T(bᵢ) in B' | build by hand |
| Rank | Number of independent rows/columns | count nonzero rows after reduction | `rank(A)` |
| Kernel | Inputs that map to zero | ker(T) = {v : Tv=0} | `null(A)` |
| Image | All possible outputs | im(T) = span of columns | `rank(A)` gives dim |
| Rank-nullity | dim(ker)+dim(im)=dim(input) | n = nullity + rank | `n - rank(A)` |
| One-to-one | Distinct inputs → distinct outputs | ker(T)={0} | `rank(A)==size(A,2)` |
| Onto | Every output is reachable | im(T)=W | `rank(A)==size(A,1)` |
| Isomorphism | Linear + one-to-one + onto | V≅W | `det(A)~=0` |
| Isomorphic spaces | Same dimension | dim(V)=dim(W) | compare dimensions |
| Change of basis | Convert coordinates between bases | [v]_B = P⁻¹·v | `P\v` |
