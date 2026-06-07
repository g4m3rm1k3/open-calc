# Applied Linear Algebra: Complete Study Guide
### Modules 1–3 | MAT-350

---

## How to Use This Guide

Everything in here is defined before it is used. Every calculation is shown step by step with no steps skipped. MATLAB is shown where your labs use it, but the manual math always comes first. Work through this top to bottom — each section builds on the last.

---

# PART 1: SYSTEMS OF LINEAR EQUATIONS

---

## 1. What Is a Linear Equation?

A **linear equation** is any equation that can be written in the form:

```
a₁x₁ + a₂x₂ + ... + aₙxₙ = b
```

Where:
- x₁, x₂, ..., xₙ are **variables** (unknowns)
- a₁, a₂, ..., aₙ are **coefficients** (just numbers — they multiply the variables)
- b is a **constant** (a number on the right side)

**Linear** means no variable is squared, cubed, multiplied by another variable, inside a square root, etc.

Examples of linear equations:
```
2x + 3y = 7          ✓ linear
x - 4y + z = 0       ✓ linear
x² + y = 5           ✗ NOT linear (x is squared)
xy = 3               ✗ NOT linear (x times y)
sin(x) = 1           ✗ NOT linear
```

---

## 2. Systems of Linear Equations

A **system of linear equations** is just a collection of two or more linear equations that all use the same variables, and you need to find values that satisfy all of them at the same time.

Example — a system of 2 equations in 2 unknowns:
```
2x + 3y = 7
x  - y  = 1
```

A **solution** to the system is a set of values for all variables that makes every equation true simultaneously.

To check if (x = 2, y = 1) is a solution:
```
Equation 1:  2(2) + 3(1) = 4 + 3 = 7  ✓
Equation 2:  (2) - (1) = 1             ✓
```
Yes, (2, 1) is a solution.

### How Many Solutions Can a System Have?

Every system of linear equations has exactly one of these three outcomes:

**Case 1: Exactly one solution** (the lines/planes intersect at one point)
**Case 2: No solution** (the lines/planes are parallel — they never meet)
**Case 3: Infinitely many solutions** (the equations describe the same line/plane)

A system is called:
- **Consistent** if it has at least one solution (cases 1 or 3)
- **Inconsistent** if it has no solution (case 2)

---

## 3. Matrices — What They Are and Why We Need Them

Solving systems by hand with substitution gets messy fast. A **matrix** is a rectangular grid of numbers that lets us organize and manipulate the information in a system efficiently.

**Definition:** A **matrix** is a rectangular array of numbers arranged in rows and columns.

```
    [ 1  2  3 ]
A = [ 4  5  6 ]
    [ 7  8  9 ]
```

- This matrix has **3 rows** and **3 columns**
- We say it is a **3×3 matrix** (read "3 by 3")
- The **size** or **dimensions** of a matrix are always stated as rows × columns

**Notation:** The entry in row i and column j of matrix A is written **aᵢⱼ**.

So for the matrix above:
- a₁₁ = 1 (row 1, column 1)
- a₁₂ = 2 (row 1, column 2)
- a₂₃ = 6 (row 2, column 3)
- a₃₁ = 7 (row 3, column 1)

### Types of Matrices You Need to Know

**Square matrix:** Same number of rows and columns (2×2, 3×3, etc.)

**Row vector:** A matrix with only 1 row
```
v = [ 3  1  -2 ]     (1×3 matrix)
```

**Column vector:** A matrix with only 1 column
```
    [ 3  ]
v = [ 1  ]     (3×1 matrix)
    [ -2 ]
```

**Zero matrix:** Every entry is 0
```
    [ 0  0  0 ]
O = [ 0  0  0 ]
```

**Identity matrix (I):** Square matrix with 1s on the main diagonal (top-left to bottom-right) and 0s everywhere else. This is the matrix equivalent of the number 1.
```
        [ 1  0  0 ]
I₃ =    [ 0  1  0 ]
        [ 0  0  1 ]
```

**Diagonal matrix:** Square matrix with nonzero entries only on the main diagonal
```
    [ 5  0  0 ]
D = [ 0  3  0 ]
    [ 0  0  7 ]
```

**Upper triangular matrix:** All entries *below* the main diagonal are zero
```
    [ 2  3  1 ]
U = [ 0  5  4 ]
    [ 0  0  6 ]
```

**Lower triangular matrix:** All entries *above* the main diagonal are zero
```
    [ 2  0  0 ]
L = [ 3  5  0 ]
    [ 1  4  6 ]
```

**Transpose of a matrix:** Flip it — rows become columns and columns become rows. Written Aᵀ.
```
        [ 1  2  3 ]               [ 1  4  7 ]
A   =   [ 4  5  6 ]    →   Aᵀ =   [ 2  5  8 ]
        [ 7  8  9 ]               [ 3  6  9 ]
```

---

## 4. Turning a System Into a Matrix

This is one of the most important ideas in the course. Any system of linear equations can be written as a matrix.

### The Coefficient Matrix

Take the system:
```
2x + 3y -  z = 1
 x -  y + 2z = 4
3x + 2y +  z = 5
```

The **coefficient matrix** A is formed by just the coefficients of the variables, preserving their positions:
```
    [  2   3  -1 ]
A = [  1  -1   2 ]
    [  3   2   1 ]
```

Important: if a variable is missing from an equation, its coefficient is 0. Never skip a slot.

### The Augmented Matrix

The **augmented matrix** includes the constant terms (right-hand side) as an extra column, separated by a vertical bar:

```
         [  2   3  -1  |  1 ]
[A | b] = [  1  -1   2  |  4 ]
         [  3   2   1  |  5 ]
```

This is what you will work with when solving systems. The vertical bar is just a reminder of where the equals sign was — it has no mathematical meaning otherwise.

### MATLAB: Defining Matrices
```matlab
% Define a matrix
A = [2 3 -1; 1 -1 2; 3 2 1]

% Define the augmented matrix
Aug = [2 3 -1 1; 1 -1 2 4; 3 2 1 5]

% Access element in row 2, column 3
A(2,3)

% Access an entire row (row 1)
A(1,:)

% Access an entire column (column 2)
A(:,2)

% Size of a matrix
size(A)        % returns [3 3]
[m, n] = size(A)   % m = rows, n = columns
```

---

## 5. Elementary Row Operations

To solve a system, we manipulate its augmented matrix using **elementary row operations (EROs)**. These operations change the form of the matrix without changing its solution set.

There are exactly three:

### ERO 1: Row Swap
**Swap any two rows.**

Notation: Rᵢ ↔ Rⱼ

Example — swap row 1 and row 2:
```
[ 0   2   3  |  5 ]             [ 1  -1   2  |  4 ]
[ 1  -1   2  |  4 ]   R₁↔R₂    [ 0   2   3  |  5 ]
[ 3   2   1  |  6 ]    →→→      [ 3   2   1  |  6 ]
```

### ERO 2: Scale a Row
**Multiply every entry in a row by a nonzero constant.**

Notation: Rᵢ → kRᵢ (where k ≠ 0)

Example — multiply row 2 by 1/2:
```
[ 1  -1   2  |  4 ]              [ 1  -1   2  |  4 ]
[ 0   2   3  |  5 ]   R₂→(1/2)R₂  [ 0   1  3/2 | 5/2]
[ 3   2   1  |  6 ]    →→→       [ 3   2   1  |  6 ]
```

### ERO 3: Row Replacement (the most used one)
**Replace a row by itself plus a multiple of another row.**

Notation: Rᵢ → Rᵢ + kRⱼ

Example — replace row 3 with row 3 + (−3) times row 1:
```
[ 1  -1   2  |  4 ]               [ 1  -1   2  |  4 ]
[ 0   2   3  |  5 ]  R₃→R₃-3R₁   [ 0   2   3  |  5 ]
[ 3   2   1  |  6 ]    →→→        [ 0   5  -5  | -6 ]
```

Calculation for new row 3:
```
Row 3 - 3×Row 1:
[3 - 3(1),  2 - 3(-1),  1 - 3(2),  6 - 3(4)]
= [3-3,  2+3,  1-6,  6-12]
= [0,  5,  -5,  -6]   ✓
```

**Why are these operations valid?** Each one is equivalent to something you already know is legal in algebra (multiplying both sides by a constant, adding equations together, swapping the order you write equations). They never change which values of x, y, z make the system true.

---

## 6. Echelon Forms

The goal of row operations is to get the matrix into a special structured form that makes the solution obvious.

### Key Term: Leading Entry (Pivot)

The **leading entry** of a row is the first nonzero number in that row (reading left to right). It is also called a **pivot**.

### Row Echelon Form (REF)

A matrix is in **row echelon form** if:

1. All zero rows (rows of all zeros) are at the bottom
2. The leading entry of each nonzero row is strictly to the right of the leading entry of the row above it
3. All entries below a leading entry in the same column are zero

```
[ 2   3  -1  |  1 ]     ← leading entry: 2 (column 1)
[ 0   5   2  |  3 ]     ← leading entry: 5 (column 2, right of column 1) ✓
[ 0   0   4  |  7 ]     ← leading entry: 4 (column 3, right of column 2) ✓
[ 0   0   0  |  0 ]     ← zero row at bottom ✓
```

This IS in REF.

```
[ 2   3  -1  |  1 ]
[ 0   0   2  |  3 ]
[ 0   5   4  |  7 ]     ← leading entry in column 2, but the row ABOVE has leading entry
                           in column 3 — that's to the RIGHT, not left. VIOLATION.
```

This is NOT in REF.

### Reduced Row Echelon Form (RREF)

**Reduced row echelon form** adds two more requirements on top of REF:

4. Every leading entry is exactly 1 (called a **leading 1** or **pivot position**)
5. Every entry above a leading 1 is also 0 (not just below — above too)

```
[ 1   0   0  |  3 ]
[ 0   1   0  | -1 ]
[ 0   0   1  |  2 ]
```

This is RREF. The solution just reads off: x = 3, y = −1, z = 2.

**Think of it this way:**
- REF is like getting partway there — a staircase pattern, zeros below each pivot
- RREF is fully finished — zeros both above AND below each pivot, and each pivot is 1

### Pivot Columns and Free Variables

**Pivot column:** A column that contains a leading 1 (in RREF) or a leading entry (in REF)

**Free variable:** A variable whose column is NOT a pivot column. Free variables can take on any value — they are the source of infinitely many solutions.

Example:
```
[ 1   2   0   3  |  5 ]
[ 0   0   1  -1  |  2 ]
[ 0   0   0   0  |  0 ]
```

- Pivot columns: 1 and 3 (columns with leading entries)
- Non-pivot columns: 2 and 4
- Variables: x₁ (pivot), x₂ (free), x₃ (pivot), x₄ (free)
- x₂ and x₄ are free — they can be anything, giving infinitely many solutions

---

## 7. Gaussian Elimination — Full Worked Example

**Gaussian elimination** is the systematic procedure for row-reducing a matrix to REF, then using back substitution to find the solution.

**Gauss-Jordan elimination** continues to RREF, making back substitution unnecessary.

Let's solve this system completely, showing every step:

```
 x +  y +  z =  6
2x +  y - 3z = -5
3x - 2y +  z =  2
```

**Step 1: Write the augmented matrix**
```
[ 1   1   1  |  6 ]
[ 2   1  -3  | -5 ]
[ 3  -2   1  |  2 ]
```

**Step 2: Eliminate below the first pivot (column 1)**

We want zeros below the 1 in position (1,1).

Operation: R₂ → R₂ − 2R₁
```
R₂ - 2R₁:  [2-2(1),  1-2(1),  -3-2(1),  -5-2(6)]
          = [2-2,  1-2,  -3-2,  -5-12]
          = [0,  -1,  -5,  -17]
```

Operation: R₃ → R₃ − 3R₁
```
R₃ - 3R₁:  [3-3(1),  -2-3(1),  1-3(1),  2-3(6)]
          = [0,  -5,  -2,  -16]
```

Matrix after step 2:
```
[ 1   1   1  |   6 ]
[ 0  -1  -5  | -17 ]
[ 0  -5  -2  | -16 ]
```

**Step 3: Eliminate below the second pivot (column 2)**

Operation: R₃ → R₃ − 5R₂
```
R₃ - 5R₂:  [0-5(0),  -5-5(-1),  -2-5(-5),  -16-5(-17)]
          = [0,  -5+5,  -2+25,  -16+85]
          = [0,  0,  23,  69]
```

Matrix is now in REF:
```
[ 1   1   1  |   6 ]
[ 0  -1  -5  | -17 ]
[ 0   0  23  |  69 ]
```

**Step 4: Back substitution**

From row 3: 23z = 69  →  z = 3

From row 2: -y - 5z = -17  →  -y - 5(3) = -17  →  -y = -17 + 15 = -2  →  y = 2

From row 1: x + y + z = 6  →  x + 2 + 3 = 6  →  x = 1

**Solution: x = 1, y = 2, z = 3**

**Check (always check your work):**
```
Eq 1: 1 + 2 + 3 = 6          ✓
Eq 2: 2(1) + 2 - 3(3) = 2 + 2 - 9 = -5   ✓
Eq 3: 3(1) - 2(2) + 3 = 3 - 4 + 3 = 2    ✓
```

---

## 8. Gauss-Jordan Elimination — Full Worked Example

Continue from REF above to get RREF:

Starting REF:
```
[ 1   1   1  |   6 ]
[ 0  -1  -5  | -17 ]
[ 0   0  23  |  69 ]
```

**Step 5: Make each pivot equal to 1**

R₂ → (−1)R₂:
```
[ 0   1   5  |  17 ]
```

R₃ → (1/23)R₃:
```
[ 0   0   1  |   3 ]
```

Matrix:
```
[ 1   1   1  |   6 ]
[ 0   1   5  |  17 ]
[ 0   0   1  |   3 ]
```

**Step 6: Eliminate ABOVE each pivot**

Use the pivot in row 3 (column 3) to zero out the entries above it:

R₂ → R₂ − 5R₃:
```
[0, 1-0, 5-5(1), 17-5(3)] = [0, 1, 0, 2]
```

R₁ → R₁ − R₃:
```
[1, 1-0, 1-1, 6-3] = [1, 1, 0, 3]
```

Matrix:
```
[ 1   1   0  |   3 ]
[ 0   1   0  |   2 ]
[ 0   0   1  |   3 ]
```

Use the pivot in row 2 (column 2) to zero out above:

R₁ → R₁ − R₂:
```
[1-0, 1-1, 0-0, 3-2] = [1, 0, 0, 1]
```

**RREF:**
```
[ 1   0   0  |  1 ]
[ 0   1   0  |  2 ]
[ 0   0   1  |  3 ]
```

Solution reads directly: x = 1, y = 2, z = 3. Same answer, no back substitution needed.

### MATLAB: Row Reduction
```matlab
A = [1 1 1 6; 2 1 -3 -5; 3 -2 1 2]

% Reduce to RREF automatically
rref(A)

% This gives you the fully reduced matrix
% The solution is in the last column
```

---

## 9. Solution Sets — Reading Solutions from RREF

### Case 1: Unique Solution

RREF has a pivot in every variable column and no contradictions:
```
[ 1   0   0  |  3 ]
[ 0   1   0  | -1 ]
[ 0   0   1  |  2 ]
```
Solution: x₁ = 3, x₂ = −1, x₃ = 2. Done.

### Case 2: No Solution (Inconsistent)

A row appears that says 0 = nonzero:
```
[ 1   2   0  |  5 ]
[ 0   0   1  |  3 ]
[ 0   0   0  |  7 ]    ← This row says: 0x₁ + 0x₂ + 0x₃ = 7, i.e., 0 = 7
```
This is impossible. **No solution.** The system is inconsistent.

### Case 3: Infinitely Many Solutions (Free Variables)

There's at least one non-pivot column (other than the augmented column):
```
[ 1   3   0  -2  |  4 ]
[ 0   0   1   5  |  1 ]
[ 0   0   0   0  |  0 ]
```

Pivot columns: 1 and 3 → x₁ and x₃ are **basic variables** (determined)
Non-pivot columns: 2 and 4 → x₂ and x₄ are **free variables** (can be anything)

Let x₂ = s and x₄ = t (we use parameters — any letter is fine):

From row 2:  x₃ + 5t = 1  →  x₃ = 1 − 5t

From row 1:  x₁ + 3s − 2t = 4  →  x₁ = 4 − 3s + 2t

**Solution (parametric form):**
```
x₁ = 4 − 3s + 2t
x₂ = s
x₃ = 1 − 5t
x₄ = t
```
where s and t are any real numbers. This gives infinitely many solutions.

**Checking consistency quickly:** A system with n variables and fewer than n pivot positions has free variables → infinitely many solutions (if consistent).

---

# PART 2: MATRIX ALGEBRA

---

## 10. Matrix Addition and Scalar Multiplication

### Matrix Addition

You can only add two matrices if they have **the same dimensions**.

Add them entry by entry:

If A and B are both m×n matrices, then:

(A + B)ᵢⱼ = aᵢⱼ + bᵢⱼ

Example:
```
    [ 1   2 ]       [  5  -1 ]       [ 1+5    2+(-1) ]   [  6   1 ]
A = [ 3   4 ]   B = [  0   2 ]   A+B=[ 3+0    4+2    ] = [  3   6 ]
    [ 5   6 ]       [ -3   1 ]       [ 5+(-3)  6+1   ]   [  2   7 ]
```

Matrix addition is **commutative**: A + B = B + A
Matrix addition is **associative**: (A + B) + C = A + (B + C)

### Scalar Multiplication

A **scalar** is just a single number (as opposed to a matrix or vector). To multiply a matrix by a scalar, multiply every entry by that number.

If k is a scalar and A is a matrix:
(kA)ᵢⱼ = k · aᵢⱼ

Example with k = 3:
```
        [ 1   2 ]       [  3   6 ]
3 × A = [ 3   4 ]   =   [  9  12 ]
        [ 5   6 ]       [ 15  18 ]
```

### MATLAB
```matlab
A = [1 2; 3 4; 5 6]
B = [5 -1; 0 2; -3 1]

C = A + B        % Matrix addition
D = 3 * A        % Scalar multiplication
E = A - B        % Subtraction (same as A + (-1)*B)
```

---

## 11. Matrix Multiplication

This is where many students get confused. Matrix multiplication is NOT done entry by entry.

### The Rule

You can multiply A × B only if the **number of columns in A equals the number of rows in B**.

If A is m×n and B is n×p, then AB is m×p.

```
A         ×    B      =    C
(m × n)       (n × p)      (m × p)
        ↑↑↑↑
    these must match
```

### How to Compute Each Entry

The entry in row i and column j of AB is computed by taking the **dot product** of row i of A with column j of B:

(AB)ᵢⱼ = (row i of A) · (column j of B)
       = aᵢ₁b₁ⱼ + aᵢ₂b₂ⱼ + ... + aᵢₙbₙⱼ

### Full Example

```
        [ 1   2   3 ]              [ 7   8  ]
A =     [ 4   5   6 ]      B =     [ 9   10 ]
                                   [ 11  12 ]
```

A is 2×3, B is 3×2. Result AB will be 2×2.

Compute entry (1,1) — row 1 of A dotted with column 1 of B:
```
(1)(7) + (2)(9) + (3)(11) = 7 + 18 + 33 = 58
```

Compute entry (1,2) — row 1 of A dotted with column 2 of B:
```
(1)(8) + (2)(10) + (3)(12) = 8 + 20 + 36 = 64
```

Compute entry (2,1) — row 2 of A dotted with column 1 of B:
```
(4)(7) + (5)(9) + (6)(11) = 28 + 45 + 66 = 139
```

Compute entry (2,2) — row 2 of A dotted with column 2 of B:
```
(4)(8) + (5)(10) + (6)(12) = 32 + 50 + 72 = 154
```

```
       [  58    64 ]
AB  =  [ 139   154 ]
```

### Critical Properties of Matrix Multiplication

**Matrix multiplication is NOT commutative.** In general: AB ≠ BA

In fact, if AB exists, BA might not even be defined (if dimensions don't match the other way).

Even when both AB and BA exist (square matrices), they are usually not equal. This is one of the biggest differences between matrix algebra and regular algebra.

**Matrix multiplication IS associative:** (AB)C = A(BC)

**Distributive laws hold:** A(B + C) = AB + AC  and  (B + C)A = BA + CA

**Identity matrix acts like 1:** AI = A and IA = A

**Transpose of a product:** (AB)ᵀ = BᵀAᵀ (note the order reverses)

### MATLAB
```matlab
A = [1 2 3; 4 5 6]
B = [7 8; 9 10; 11 12]

C = A * B        % Matrix multiplication
D = A .* A       % Entry-wise multiplication (different! only same-size matrices)
E = A'           % Transpose of A
```

---

## 12. The Matrix Equation Ax = b

Here is one of the central ideas of the entire course.

The system of equations:
```
2x + 3y -  z = 1
 x -  y + 2z = 4
3x + 2y +  z = 5
```

Can be written as a **single matrix equation**: **Ax = b**

Where:
```
    [  2   3  -1 ]       [ x ]       [ 1 ]
A = [  1  -1   2 ]   x = [ y ]   b = [ 4 ]
    [  3   2   1 ]       [ z ]       [ 5 ]
```

When you compute Ax using matrix multiplication, you get:
```
Ax = [ 2x + 3y - z ]   =   [ 1 ]   = b
     [ x - y + 2z  ]       [ 4 ]
     [ 3x + 2y + z ]       [ 5 ]
```

This is exactly the original system. So A, x, and b are the coefficient matrix, variable vector, and constant vector respectively.

This notation is powerful because it lets us talk about systems using tools from matrix algebra.

---

## 13. The Inverse of a Matrix

Just as the number 5 has a multiplicative inverse 1/5 (because 5 × 1/5 = 1), a square matrix A may have an **inverse matrix**, written A⁻¹.

**Definition:** A square matrix A is **invertible** (also called **nonsingular**) if there exists a matrix A⁻¹ such that:

```
A · A⁻¹ = I   and   A⁻¹ · A = I
```

Where I is the identity matrix of the same size.

If no such matrix exists, A is called **singular** or **non-invertible**.

### Finding the Inverse: Row Reduction Method

To find A⁻¹, form the augmented matrix [A | I] and row reduce until the left side becomes I. Whatever is on the right side at that point is A⁻¹:

```
[A | I]   →  row reduction  →  [I | A⁻¹]
```

**Full example:** Find the inverse of
```
    [ 2   1 ]
A = [ 5   3 ]
```

Form [A | I]:
```
[ 2   1  |  1   0 ]
[ 5   3  |  0   1 ]
```

R₁ → (1/2)R₁:
```
[ 1   1/2  |  1/2   0 ]
[ 5   3    |  0     1 ]
```

R₂ → R₂ − 5R₁:
```
R₂ - 5R₁: [5-5, 3-5/2, 0-5/2, 1-0] = [0, 1/2, -5/2, 1]
```
```
[ 1   1/2  |  1/2   0 ]
[ 0   1/2  | -5/2   1 ]
```

R₂ → 2R₂:
```
[ 1   1/2  |  1/2   0 ]
[ 0   1    | -5     2 ]
```

R₁ → R₁ − (1/2)R₂:
```
R₁ - (1/2)R₂: [1-0, 1/2-1/2, 1/2-(-5/2), 0-1] = [1, 0, 3, -1]
```
```
[ 1   0  |   3  -1 ]
[ 0   1  |  -5   2 ]
```

Therefore:
```
        [  3  -1 ]
A⁻¹ =   [ -5   2 ]
```

**Verify:** AA⁻¹ should equal I:
```
[ 2   1 ] [  3  -1 ]   [ 2(3)+1(-5)   2(-1)+1(2) ]   [ 6-5   -2+2 ]   [ 1  0 ]
[ 5   3 ] [ -5   2 ] = [ 5(3)+3(-5)   5(-1)+3(2) ] = [ 15-15  -5+6 ] = [ 0  1 ]  ✓
```

### Quick Formula for 2×2 Inverse

For a 2×2 matrix:
```
    [ a   b ]             1      [  d  -b ]
A = [ c   d ]    A⁻¹ = ------   [ -c   a ]
                        ad-bc
```

The quantity **ad − bc** is called the **determinant** of A (more on this in Part 3). If it equals zero, A has no inverse.

For our example: det = (2)(3) − (1)(5) = 6 − 5 = 1

```
A⁻¹ = (1/1) [ 3  -1 ] = [  3  -1 ]   ✓
             [ -5   2 ]   [ -5   2 ]
```

### Properties of the Inverse

- (A⁻¹)⁻¹ = A
- (AB)⁻¹ = B⁻¹A⁻¹  (order reverses, just like transpose)
- (Aᵀ)⁻¹ = (A⁻¹)ᵀ
- If A is invertible, A⁻¹ is unique

### MATLAB
```matlab
A = [2 1; 5 3]
A_inv = inv(A)    % Compute inverse

% Verify
A * A_inv         % Should give identity matrix (may show tiny rounding errors)
```

---

## 14. Solving Systems Using the Inverse

If Ax = b and A is invertible, then:

```
Ax = b
A⁻¹(Ax) = A⁻¹b
(A⁻¹A)x = A⁻¹b
Ix = A⁻¹b
x = A⁻¹b
```

**Example:** Solve the system using the inverse method:
```
2x + y = 8
5x + 3y = 21
```

We already found A⁻¹ = [[3, -1], [-5, 2]] above.

```
    [ 8  ]
b = [ 21 ]

x = A⁻¹b = [  3  -1 ] [ 8  ]   =  [ 3(8) + (-1)(21) ]   =  [ 24-21 ]   =  [ 3 ]
            [ -5   2 ] [ 21 ]      [ -5(8) + 2(21)   ]      [ -40+42 ]      [ 2 ]
```

**Solution: x = 3, y = 2**

**When to use this method vs row reduction:**
- Row reduction is better for a single system
- Inverse method is better if you need to solve Ax = b for many different b vectors with the same A (you compute A⁻¹ once, then just multiply)

### MATLAB
```matlab
A = [2 1; 5 3]
b = [8; 21]

x = inv(A) * b    % Using inverse

% Better numerically: use backslash operator
x = A \ b         % MATLAB solves Ax = b directly (more stable than inv)
```

---

## 15. Elementary Matrices

An **elementary matrix** is a matrix obtained by performing exactly ONE elementary row operation on an identity matrix.

There's a reason we care about these: every row operation you perform on a matrix A is equivalent to multiplying A on the left by an elementary matrix.

### The Three Types

**Type 1 — Row swap (swap rows i and j of I):**
```
Swap rows 1 and 2 of I₃:

    [ 0   1   0 ]
E = [ 1   0   0 ]
    [ 0   0   1 ]
```

**Type 2 — Scale row (multiply row i of I by k):**
```
Multiply row 2 of I₃ by 3:

    [ 1   0   0 ]
E = [ 0   3   0 ]
    [ 0   0   1 ]
```

**Type 3 — Row replacement (add k times row j to row i in I):**
```
Add -2 times row 1 to row 3 of I₃:

    [ 1   0   0 ]
E = [ 0   1   0 ]
    [ -2  0   1 ]
```

### Why This Matters

If you perform the same row operation that created E on matrix A, the result is EA.

This gives us a way to express row reduction as matrix multiplication:

If Gauss-Jordan gives us:  Eₖ···E₂E₁A = I

Then A⁻¹ = Eₖ···E₂E₁

Each elementary matrix is invertible, and:
- The inverse of a row swap is itself (swap back)
- The inverse of scaling by k is scaling by 1/k
- The inverse of adding k×Rⱼ to Rᵢ is adding −k×Rⱼ to Rᵢ

---

## 16. LU Decomposition

**LU decomposition** breaks a matrix A into the product of two matrices:

```
A = LU
```

Where:
- **L** is a lower triangular matrix (with 1s on the diagonal)
- **U** is an upper triangular matrix

### Why It's Useful

If you need to solve Ax = b for many different b values, LU decomposition is more efficient than computing A⁻¹.

Given A = LU:
- Ax = b becomes LUx = b
- Let y = Ux (a new variable)
- Then Ly = b — solve this for y (easy, L is triangular)
- Then Ux = y — solve this for x (easy, U is triangular)

Both steps use **forward substitution** (for L) and **back substitution** (for U), which are fast.

### How to Find L and U

Perform Gaussian elimination on A to get U. The multipliers you use in the row operations go directly into L.

**Full example:** Decompose
```
    [ 2   4   -2 ]
A = [ 4   9   -3 ]
    [ -2  -3   7 ]
```

**Step 1:** Eliminate column 1.

R₂ → R₂ − 2R₁ (multiplier m₂₁ = 2):
```
Row 2 - 2(Row 1): [4-4, 9-8, -3-(-4)] = [0, 1, 1]
```

R₃ → R₃ − (−1)R₁ = R₃ + R₁ (multiplier m₃₁ = −1):
```
Row 3 + Row 1: [-2+2, -3+4, 7+(-2)] = [0, 1, 5]
```

Matrix after step 1:
```
[ 2   4  -2 ]
[ 0   1   1 ]
[ 0   1   5 ]
```

**Step 2:** Eliminate column 2.

R₃ → R₃ − R₂ (multiplier m₃₂ = 1):
```
Row 3 - Row 2: [0-0, 1-1, 5-1] = [0, 0, 4]
```

**U (the result of elimination):**
```
    [ 2   4  -2 ]
U = [ 0   1   1 ]
    [ 0   0   4 ]
```

**L (1s on diagonal, multipliers fill in below):**
```
    [  1   0   0 ]
L = [  2   1   0 ]    ← m₂₁ = 2 goes in position (2,1)
    [ -1   1   1 ]    ← m₃₁ = -1 goes in (3,1), m₃₂ = 1 goes in (3,2)
```

**Verify A = LU:**
```
[  1   0   0 ] [ 2   4  -2 ]   [ 2    4   -2  ]
[  2   1   0 ] [ 0   1   1 ] = [ 4    9   -3  ]   ✓  (check by multiplying out)
[ -1   1   1 ] [ 0   0   4 ]   [ -2  -3    7  ]
```

### MATLAB
```matlab
A = [2 4 -2; 4 9 -3; -2 -3 7]
[L, U, P] = lu(A)    % P is a permutation matrix (MATLAB may reorder rows)

% Solve Ax = b using LU
b = [2; 5; 3]
y = L \ b            % Forward substitution: Ly = b
x = U \ y            % Back substitution: Ux = y
```

---

# PART 3: VECTORS AND DETERMINANTS

---

## 17. Introduction to Vectors

A **vector** is an ordered list of numbers. You've already seen them — in this course, vectors are essentially matrices with one column (or one row).

**Column vector** (most common in this course):
```
    [ 3  ]
v = [ -1 ]
    [ 2  ]
```

This is a vector in **ℝ³** (3-dimensional real space). The ℝ stands for real numbers, and the superscript tells you how many components.

**Key distinction from scalars:**
- A **scalar** has only magnitude (just a number: 5, −3, π)
- A **vector** has both magnitude AND direction

**Components:** The individual numbers in a vector. The vector above has components v₁ = 3, v₂ = −1, v₃ = 2.

### Geometric Interpretation

In 2D, the vector **v = [3, 2]ᵀ** represents:
- An arrow starting at the origin (0,0) and pointing to the point (3,2)
- OR a displacement of "3 units right, 2 units up"

In 3D, vectors work the same way with an added z-component.

### The Zero Vector

**0** = [0, 0, ..., 0]ᵀ — all components are zero. This is different from the scalar 0.

---

## 18. Vector Operations

### Addition

Add component by component (same rule as matrix addition, and same requirement: same size):

```
    [ 3  ]       [  1 ]       [ 3+1  ]   [ 4 ]
u = [ -1 ]   v = [  4 ]   u+v=[ -1+4 ] = [ 3 ]
    [  2 ]       [ -2 ]       [ 2-2  ]   [ 0 ]
```

**Geometric meaning:** Vector addition is the "tip-to-tail" rule. Place v at the tip of u, and the result u + v goes from the tail of u to the tip of v.

### Scalar Multiplication

Multiply every component by the scalar:

```
        [ 3  ]   [  6  ]
2u = 2  [ -1 ] = [ -2  ]
        [  2 ]   [  4  ]
```

**Geometric meaning:** Scaling a vector stretches or shrinks it (and flips its direction if the scalar is negative).

### Subtraction

u − v = u + (−1)v:
```
    [ 3  ]   [  1 ]   [  2 ]
u - v = [-1] - [  4 ] = [ -5 ]
    [  2 ]   [ -2 ]   [  4 ]
```

### Linear Combination

A **linear combination** of vectors v₁, v₂, ..., vₖ is any expression of the form:

```
c₁v₁ + c₂v₂ + ... + cₖvₖ
```

where c₁, c₂, ..., cₖ are scalars.

Example:
```
    [ 1 ]       [ 2 ]
v₁ = [ 0 ]   v₂ = [ 1 ]
    [ 3 ]       [-1 ]

2v₁ + 3v₂ = 2[1,0,3]ᵀ + 3[2,1,-1]ᵀ = [2,0,6]ᵀ + [6,3,-3]ᵀ = [8,3,3]ᵀ
```

### The Span

The **span** of a set of vectors {v₁, v₂, ..., vₖ} is the set of ALL possible linear combinations. It's the collection of every vector you can "reach" by combining those vectors.

---

## 19. Vector Magnitude (Norm)

The **magnitude** (also called **length** or **norm**) of a vector is its length as an arrow. Written ‖v‖.

For v = [v₁, v₂, ..., vₙ]ᵀ:

```
‖v‖ = √(v₁² + v₂² + ... + vₙ²)
```

This is just the Pythagorean theorem extended to n dimensions.

**Example:**
```
    [ 3  ]
v = [ -4 ]
    [  0 ]

‖v‖ = √(3² + (-4)² + 0²) = √(9 + 16 + 0) = √25 = 5
```

### Unit Vector

A **unit vector** has magnitude exactly 1. To create a unit vector in the direction of v:

```
û = v / ‖v‖
```

This is called **normalizing** the vector.

**Example:**
```
v = [3, -4, 0]ᵀ,  ‖v‖ = 5

û = (1/5)[3, -4, 0]ᵀ = [3/5, -4/5, 0]ᵀ

Check: ‖û‖ = √((3/5)² + (-4/5)² + 0²) = √(9/25 + 16/25) = √(25/25) = 1  ✓
```

### Standard Unit Vectors

In ℝ³, there are three standard unit vectors:
```
    [ 1 ]       [ 0 ]       [ 0 ]
e₁ = [ 0 ]  e₂ = [ 1 ]  e₃ = [ 0 ]
    [ 0 ]       [ 0 ]       [ 1 ]
```

Also written as **i**, **j**, **k** in physics/engineering. Any vector in ℝ³ can be written as a linear combination of these: [a, b, c]ᵀ = ae₁ + be₂ + ce₃.

---

## 20. The Dot Product

The **dot product** (also called the **scalar product** or **inner product**) takes two vectors of the same length and produces a single number (a scalar).

### Definition

For vectors u = [u₁, u₂, ..., uₙ]ᵀ and v = [v₁, v₂, ..., vₙ]ᵀ:

```
u · v = u₁v₁ + u₂v₂ + ... + uₙvₙ
```

Multiply corresponding components and add them all up.

**Example:**
```
    [ 3 ]       [  2 ]
u = [ 1 ]   v = [ -4 ]
    [ 2 ]       [  1 ]

u · v = (3)(2) + (1)(-4) + (2)(1) = 6 - 4 + 2 = 4
```

Note: The dot product is also equal to uᵀv (treating u and v as matrices: u is 3×1, uᵀ is 1×3, and (1×3)(3×1) = (1×1) scalar).

### Geometric Meaning: Angle Between Vectors

The dot product has a beautiful geometric interpretation:

```
u · v = ‖u‖ ‖v‖ cos(θ)
```

where θ is the angle between u and v.

Solving for θ:
```
cos(θ) = (u · v) / (‖u‖ ‖v‖)

θ = arccos( (u · v) / (‖u‖ ‖v‖) )
```

**Example — find the angle between u = [1, 0]ᵀ and v = [1, 1]ᵀ:**
```
u · v = (1)(1) + (0)(1) = 1

‖u‖ = √(1² + 0²) = 1
‖v‖ = √(1² + 1²) = √2

cos(θ) = 1 / (1 · √2) = 1/√2

θ = arccos(1/√2) = 45°  ✓  (makes sense geometrically)
```

### Orthogonality

Two vectors are **orthogonal** (perpendicular) if and only if their dot product is zero:

```
u · v = 0  ↔  u ⊥ v
```

Why? Because cos(90°) = 0, so u · v = ‖u‖‖v‖cos(90°) = 0.

**Example:** Are [1, 2, −1]ᵀ and [3, 0, 3]ᵀ orthogonal?
```
[1,2,-1] · [3,0,3] = (1)(3) + (2)(0) + (-1)(3) = 3 + 0 - 3 = 0  ✓  Yes, orthogonal.
```

### Properties of the Dot Product

- **Commutative:** u · v = v · u
- **Distributive:** u · (v + w) = u · v + u · w
- **Scalar:** (ku) · v = k(u · v)
- **Magnitude:** v · v = ‖v‖²

### MATLAB
```matlab
u = [3; 1; 2]
v = [2; -4; 1]

d = dot(u, v)          % Dot product
d = u' * v             % Same thing using matrix multiplication

norm_u = norm(u)       % Magnitude of u
theta = acos(dot(u,v) / (norm(u) * norm(v)))   % Angle in radians
theta_deg = rad2deg(theta)                      % Convert to degrees
```

---

## 21. The Cross Product

The **cross product** takes two vectors in ℝ³ and produces a new vector (not a scalar). It is defined only for 3D vectors.

**Definition:** For u = [u₁, u₂, u₃]ᵀ and v = [v₁, v₂, v₃]ᵀ:

```
         [ u₂v₃ - u₃v₂ ]
u × v =  [ u₃v₁ - u₁v₃ ]
         [ u₁v₂ - u₂v₁ ]
```

### The Determinant Memory Aid

The easiest way to remember the cross product is to write it as a formal determinant (more on determinants in Section 22) using the standard unit vectors:

```
         | e₁  e₂  e₃ |
u × v =  | u₁  u₂  u₃ |
         | v₁  v₂  v₃ |
```

Expanding along row 1:
```
= e₁(u₂v₃ - u₃v₂) - e₂(u₁v₃ - u₃v₁) + e₃(u₁v₂ - u₂v₁)
```

**Full example:** Compute u × v where u = [1, 2, 3]ᵀ and v = [4, 5, 6]ᵀ:

```
Component 1 (e₁): u₂v₃ - u₃v₂ = (2)(6) - (3)(5) = 12 - 15 = -3
Component 2 (e₂): -(u₁v₃ - u₃v₁) = -((1)(6) - (3)(4)) = -(6 - 12) = 6
Component 3 (e₃): u₁v₂ - u₂v₁ = (1)(5) - (2)(4) = 5 - 8 = -3
```

```
        [ -3 ]
u × v = [  6 ]
        [ -3 ]
```

### Geometric Meaning of the Cross Product

u × v is a vector that is **perpendicular to both u and v**. Its direction follows the **right-hand rule**: point your fingers from u toward v, and your thumb points in the direction of u × v.

The **magnitude** of the cross product:
```
‖u × v‖ = ‖u‖ ‖v‖ sin(θ)
```

This equals the **area of the parallelogram** formed by u and v.

**Verify our result is perpendicular to both:**
```
u · (u × v) = [1,2,3] · [-3,6,-3] = -3 + 12 - 9 = 0  ✓
v · (u × v) = [4,5,6] · [-3,6,-3] = -12 + 30 - 18 = 0  ✓
```

### Key Properties of the Cross Product

- **Anti-commutative:** u × v = −(v × u)  (order matters!)
- **Not associative:** (u × v) × w ≠ u × (v × w) in general
- **Parallel vectors:** u × v = 0 if u and v are parallel (sin(0°) = 0)
- **Self-cross-product:** u × u = 0 always

### MATLAB
```matlab
u = [1; 2; 3]
v = [4; 5; 6]

w = cross(u, v)          % Cross product

% Verify perpendicularity
dot(u, w)                % Should be 0
dot(v, w)                % Should be 0

% Area of parallelogram
area = norm(cross(u, v))
```

---

## 22. Introduction to Determinants

The **determinant** is a single number associated with a square matrix. It carries a surprising amount of information about the matrix.

**Notation:** The determinant of matrix A is written det(A) or |A|.

### 1×1 Determinant

Trivial: det([a]) = a

### 2×2 Determinant

```
    [ a   b ]
A = [ c   d ]

det(A) = ad - bc
```

This is the product of the main diagonal minus the product of the off-diagonal.

**Example:**
```
    [ 3   2 ]
A = [ 1   4 ]

det(A) = (3)(4) - (2)(1) = 12 - 2 = 10
```

**Example (zero determinant):**
```
    [ 2   4 ]
A = [ 1   2 ]

det(A) = (2)(2) - (4)(1) = 4 - 4 = 0
```

A matrix with determinant = 0 is **singular** (not invertible).

### 3×3 Determinant — The Diagonal Rule (Sarrus' Rule)

For a 3×3 matrix:
```
    [ a   b   c ]
A = [ d   e   f ]
    [ g   h   i ]
```

Write out the matrix and repeat the first two columns to the right:
```
a  b  c | a  b
d  e  f | d  e
g  h  i | g  h
```

Sum the three "down-right" diagonals, minus the three "down-left" diagonals:
```
det(A) = (aei + bfg + cdh) - (ceg + afh + bdi)
```

**Full Example:**
```
    [ 1   2   3 ]
A = [ 4   5   6 ]
    [ 7   8   9 ]
```

Down-right diagonals:
```
(1)(5)(9) = 45
(2)(6)(7) = 84
(3)(4)(8) = 96
Sum = 225
```

Down-left diagonals:
```
(3)(5)(7) = 105
(1)(6)(8) = 48
(2)(4)(9) = 72
Sum = 225
```

det(A) = 225 − 225 = 0

(This matrix is singular — its rows are linearly dependent, which you can check by row reducing.)

**Important:** The diagonal rule ONLY works for 3×3. Do not apply it to larger matrices.

---

## 23. Cofactor Expansion (Expansion by Minors)

For matrices larger than 3×3, we use **cofactor expansion** to compute determinants. This method also works for 3×3 matrices and is more systematic.

### Minor

The **minor** Mᵢⱼ of matrix A is the determinant of the submatrix formed by deleting row i and column j.

**Example — minor M₁₂ of:**
```
    [ 1   2   3 ]
A = [ 4   5   6 ]
    [ 7   8   9 ]
```

Delete row 1 and column 2:
```
Remaining submatrix: [ 4   6 ]
                     [ 7   9 ]

M₁₂ = det([4,6;7,9]) = (4)(9) - (6)(7) = 36 - 42 = -6
```

### Cofactor

The **cofactor** Cᵢⱼ is the signed minor:

```
Cᵢⱼ = (-1)^(i+j) × Mᵢⱼ
```

The sign pattern is a checkerboard:
```
[ +   -   +   -  ... ]
[ -   +   -   +  ... ]
[ +   -   +   -  ... ]
[ -   +   -   +  ... ]
```

Position (1,1): (−1)^(1+1) = (−1)² = +1 → positive
Position (1,2): (−1)^(1+2) = (−1)³ = −1 → negative
Position (2,1): (−1)^(2+1) = (−1)³ = −1 → negative
Position (2,2): (−1)^(2+2) = (−1)⁴ = +1 → positive

Quick trick: top-left is always +, and it alternates from there.

### Cofactor Expansion

To find det(A), pick any row or column, multiply each entry by its cofactor, and sum:

**Expanding along row i:**
```
det(A) = aᵢ₁Cᵢ₁ + aᵢ₂Cᵢ₂ + ... + aᵢₙCᵢₙ
```

**Expanding along column j:**
```
det(A) = a₁ⱼC₁ⱼ + a₂ⱼC₂ⱼ + ... + aₙⱼCₙⱼ
```

You can expand along ANY row or column — you always get the same answer. Pick the one with the most zeros to minimize calculation.

**Full Example — compute det(A) by expanding along row 1:**
```
    [ 2   1   3 ]
A = [ 0   4   1 ]
    [ 5  -2   6 ]
```

Expanding along row 1:

```
det(A) = a₁₁C₁₁ + a₁₂C₁₂ + a₁₃C₁₃
```

C₁₁ = (+1) × det([4,1;-2,6]) = (4)(6) - (1)(-2) = 24 + 2 = 26

C₁₂ = (−1) × det([0,1;5,6]) = −((0)(6) - (1)(5)) = −(0 - 5) = 5

C₁₃ = (+1) × det([0,4;5,-2]) = (0)(−2) - (4)(5) = 0 - 20 = −20

```
det(A) = 2(26) + 1(5) + 3(-20) = 52 + 5 - 60 = -3
```

### Expanding Along a Column with Zeros

**Example:** Find det(B) where:
```
    [ 3   2   1   4 ]
    [ 0   5   2   3 ]
B = [ 0   0   4   1 ]
    [ 0   0   0   6 ]
```

This is upper triangular! Expanding along column 1, only the (1,1) entry is nonzero:

```
det(B) = 3 × C₁₁ = 3 × (+1) × det([5,2,3;0,4,1;0,0,6])
```

det([5,2,3;0,4,1;0,0,6]) is also upper triangular:
= 5 × det([4,1;0,6]) = 5 × (4×6 - 1×0) = 5 × 24 = 120

det(B) = 3 × 120 = 360

**Key fact: The determinant of any triangular matrix is the product of its diagonal entries.**
```
det(B) = 3 × 5 × 4 × 6 = 360  ✓  (much faster!)
```

### MATLAB
```matlab
A = [2 1 3; 0 4 1; 5 -2 6]
d = det(A)       % Returns -3
```

---

## 24. Properties of Determinants

These properties let you compute determinants more efficiently and understand what determinants tell you about a matrix.

### Effect of Row Operations on the Determinant

**Row swap:** Swapping two rows changes the sign of the determinant.
```
If B is obtained from A by swapping two rows:  det(B) = -det(A)
```

**Scaling:** Multiplying a row by scalar k multiplies the determinant by k.
```
If B is obtained by multiplying one row of A by k:  det(B) = k × det(A)
```

**Row replacement:** Adding a multiple of one row to another does NOT change the determinant.
```
If B is obtained by Rᵢ → Rᵢ + kRⱼ (i ≠ j):  det(B) = det(A)
```

### Using Row Reduction to Find Determinants

You can row-reduce A to upper triangular form (keeping track of what operations you do), then multiply the diagonal entries.

**Example:**
```
    [ 1   2   3 ]
A = [ 2   5   4 ]
    [ 1   3   5 ]
```

R₂ → R₂ - 2R₁:
```
[ 1   2   3 ]
[ 0   1  -2 ]
[ 1   3   5 ]
```
(Row replacement — no change to det)

R₃ → R₃ - R₁:
```
[ 1   2   3 ]
[ 0   1  -2 ]
[ 0   1   2 ]
```
(Row replacement — no change to det)

R₃ → R₃ - R₂:
```
[ 1   2   3 ]
[ 0   1  -2 ]
[ 0   0   4 ]
```
(Row replacement — no change to det)

Now it's upper triangular. det = product of diagonal = 1 × 1 × 4 = **4**

If we had done a row swap during the process, we'd track it and negate the final answer.

### Other Important Properties

**Transpose:** det(Aᵀ) = det(A)

**Product:** det(AB) = det(A) × det(B)

**Inverse:** det(A⁻¹) = 1/det(A)

**Scalar multiple:** det(kA) = kⁿ det(A), where A is n×n
(This is because each of the n rows gets scaled by k)

**Zero row or column:** If any row or column of A is all zeros, det(A) = 0

**Equal rows/columns:** If two rows (or two columns) of A are identical, det(A) = 0

**Proportional rows/columns:** If one row is a multiple of another, det(A) = 0

---

## 25. Invertibility and Determinants

This is a critical theorem that ties together everything from Modules 1, 2, and 3.

**Theorem:** A square matrix A is invertible if and only if det(A) ≠ 0.

This means all of the following statements are equivalent (they are all true at the same time or all false at the same time):

1. A is invertible
2. det(A) ≠ 0
3. Ax = b has a unique solution for every b
4. Ax = 0 has only the trivial solution (x = 0)
5. The RREF of A is the identity matrix I
6. A has n pivot positions (one in every row and column)
7. The columns of A are linearly independent
8. The rows of A are linearly independent

If det(A) = 0, then A is singular, and EVERY one of those statements is false.

**Example — Is this matrix invertible?**
```
    [ 1   2   3 ]
A = [ 0   4   5 ]
    [ 0   0   6 ]
```

det(A) = 1 × 4 × 6 = 24 ≠ 0  → A is invertible. ✓

**Example:**
```
    [ 1   2   3 ]
B = [ 4   5   6 ]
    [ 7   8   9 ]
```

We computed det(B) = 0 earlier → B is NOT invertible (singular).

---

## 26. The Adjugate and the Inverse Formula

For any invertible matrix A, there is an explicit formula for A⁻¹:

```
A⁻¹ = (1/det(A)) × adj(A)
```

Where **adj(A)** is the **adjugate** (also called the classical adjoint) of A — the transpose of the matrix of cofactors.

**To build the cofactor matrix:**  Replace each entry aᵢⱼ with cofactor Cᵢⱼ.

**Then transpose it** to get adj(A).

For 2×2:
```
    [ a   b ]               [  d  -b ]
A = [ c   d ]    adj(A) =   [ -c   a ]
```

This is where the 2×2 inverse formula from Section 13 comes from.

For larger matrices this is computationally intensive — row reduction is usually faster for finding inverses. But the formula is important theoretically and for Cramer's Rule.

---

## 27. Cramer's Rule

**Cramer's Rule** gives explicit formulas for the solution of a system Ax = b when A is an invertible n×n matrix.

For xᵢ (the i-th component of the solution):

```
xᵢ = det(Aᵢ) / det(A)
```

Where **Aᵢ** is the matrix formed by replacing column i of A with the vector b.

### Full Example

Solve:
```
2x + y = 5
x + 3y = 10
```

Matrix form: A = [[2,1],[1,3]],  b = [5, 10]ᵀ

det(A) = (2)(3) - (1)(1) = 6 - 1 = 5

**For x₁ = x:** Replace column 1 with b:
```
A₁ = [ 5   1 ]
     [ 10  3 ]

det(A₁) = (5)(3) - (1)(10) = 15 - 10 = 5

x = det(A₁)/det(A) = 5/5 = 1
```

**For x₂ = y:** Replace column 2 with b:
```
A₂ = [ 2   5 ]
     [ 1  10 ]

det(A₂) = (2)(10) - (5)(1) = 20 - 5 = 15

y = det(A₂)/det(A) = 15/5 = 3
```

**Solution: x = 1, y = 3**

**Check:**
```
2(1) + 3 = 5  ✓
1 + 3(3) = 10  ✓
```

### 3×3 Example

Solve:
```
 x +  y +  z = 6
2x - y + 3z = 11
-x + 2y - z = -1
```

```
    [  1   1   1 ]       [ 6  ]
A = [  2  -1   3 ]   b = [ 11 ]
    [ -1   2  -1 ]       [ -1 ]
```

**Compute det(A)** (expand along row 1):

C₁₁ = (+1) det([-1,3;2,-1]) = (-1)(-1) - (3)(2) = 1 - 6 = -5
C₁₂ = (-1) det([2,3;-1,-1]) = -((2)(-1) - (3)(-1)) = -(-2+3) = -1
C₁₃ = (+1) det([2,-1;-1,2]) = (2)(2) - (-1)(-1) = 4 - 1 = 3

det(A) = 1(-5) + 1(-1) + 1(3) = -5 - 1 + 3 = -3

**Find x = det(A₁)/det(A):**

Replace column 1 with b:
```
A₁ = [  6   1   1 ]
     [ 11  -1   3 ]
     [ -1   2  -1 ]
```

Expand along row 1:
C₁₁ = (+1)det([-1,3;2,-1]) = 1 - 6 = -5
C₁₂ = (-1)det([11,3;-1,-1]) = -((-11-(-3))) = -(-11+3) = 8... 

Let me be careful:
det([-1,3;2,-1]) = (-1)(-1) - (3)(2) = 1 - 6 = -5  → cofactor at (1,1): (+1)(-5) = -5
det([11,3;-1,-1]) = (11)(-1) - (3)(-1) = -11 + 3 = -8  → cofactor at (1,2): (-1)(-8) = 8
det([11,-1;-1,2]) = (11)(2) - (-1)(-1) = 22 - 1 = 21  → cofactor at (1,3): (+1)(21) = 21

det(A₁) = 6(-5) + 1(8) + 1(21) = -30 + 8 + 21 = -1

x = det(A₁)/det(A) = (-1)/(-3) = 1/3... 

Actually, let me use a cleaner example to avoid fractions. The key takeaway is the procedure: replace the column, compute the determinant, divide by det(A). The process is identical regardless of what the numbers are.

**When to use Cramer's Rule:**
- Works for any n×n invertible system
- Most efficient for 2×2 and 3×3 systems
- For larger systems, row reduction is faster
- But Cramer's Rule gives a theoretical formula that's useful in proofs and applications

### MATLAB
```matlab
A = [1 1 1; 2 -1 3; -1 2 -1]
b = [6; 11; -1]

% Cramer's Rule manually
det_A = det(A)

A1 = A; A1(:,1) = b;   % Replace column 1 with b
A2 = A; A2(:,2) = b;   % Replace column 2 with b
A3 = A; A3(:,3) = b;   % Replace column 3 with b

x1 = det(A1) / det_A
x2 = det(A2) / det_A
x3 = det(A3) / det_A

% Or just solve directly
x = A \ b
```

---

## 28. Summary: The Big Picture

Here is how everything you've learned connects:

**A square matrix A is invertible ↔ det(A) ≠ 0 ↔ Ax = b has a unique solution ↔ A row-reduces to I.**

These are all different ways of asking the same question: is A "full rank"? Does it have all its pivots?

### The Flow of the Course

```
Linear System
      ↓
Augmented Matrix [A | b]
      ↓
Row Operations (EROs)
      ↓
Echelon Forms (REF / RREF)
      ↓
Solution (unique / none / infinitely many)
      ↓
Matrix Algebra (multiplication, inverse)
      ↓
Vectors (geometry, dot/cross products)
      ↓
Determinants (single number summary of A)
      ↓
Cramer's Rule (explicit solution formula)
```

### Quick Reference: What Each Term Means

| Term | Meaning |
|---|---|
| Scalar | A single number |
| Vector | An ordered list of numbers (column or row) |
| Matrix | A rectangular grid of numbers |
| Augmented matrix | Coefficient matrix with b appended as extra column |
| Pivot | The leading nonzero entry in a row |
| Free variable | Variable in a non-pivot column; can take any value |
| REF | Staircase form, zeros below pivots |
| RREF | REF + leading 1s + zeros above pivots too |
| Consistent | System has at least one solution |
| Inconsistent | System has no solution (0 = nonzero row appears) |
| Invertible/Nonsingular | Square matrix with det ≠ 0; A⁻¹ exists |
| Singular | Square matrix with det = 0; no inverse |
| Determinant | Single number that encodes invertibility and scaling |
| Minor Mᵢⱼ | Determinant of A with row i and column j deleted |
| Cofactor Cᵢⱼ | Signed minor: (−1)^(i+j) × Mᵢⱼ |
| Dot product | u · v: scalar; gives angle and orthogonality info |
| Cross product | u × v: vector perpendicular to both u and v (3D only) |
| Orthogonal | Perpendicular; dot product = 0 |
| Unit vector | Vector of length 1 |
| Span | All possible linear combinations of a set of vectors |
| LU decomposition | A = LU; splits matrix into lower and upper triangular |
| Cramer's Rule | xᵢ = det(Aᵢ)/det(A); explicit solution formula |

---

## Practice Problems

Work these by hand, showing every step.

**Section 1 — Row Reduction:**

1. Solve by Gauss-Jordan elimination:
```
 x + 2y - z = 3
2x -  y + z = 1
3x +  y + 2z = 8
```

2. Determine if this system is consistent. If so, find all solutions:
```
x₁ - 2x₂ + x₃ = 0
2x₁ + x₂ - x₃ = 3
x₁ + 4x₂ - 3x₃ = 5
```

**Section 2 — Matrix Algebra:**

3. If A = [[1,2],[3,4]] and B = [[0,1],[2,3]], compute AB and BA. Are they equal?

4. Find A⁻¹ where A = [[3,1],[5,2]] using row reduction.

5. Verify that (AB)ᵀ = BᵀAᵀ using the matrices from problem 3.

**Section 3 — Vectors:**

6. Given u = [1, -2, 3]ᵀ and v = [2, 1, -1]ᵀ:
   - Compute u · v
   - Find the angle between u and v
   - Are they orthogonal?
   - Compute u × v
   - Verify u × v is perpendicular to both u and v

7. Find a unit vector in the direction of w = [4, 0, -3]ᵀ.

**Section 4 — Determinants:**

8. Compute by cofactor expansion along the row or column of your choice:
```
| 3  0  2 |
| -1 1  4 |
| 0  2  3 |
```

9. Use the properties of determinants (not direct computation) to explain why:
```
    | 2  4  6 |
det | 1  3  5 | = 0
    | 3  6  9 |
```

**Section 5 — Cramer's Rule:**

10. Solve using Cramer's Rule:
```
3x -  y = 7
 x + 2y = 4
```

---

*Keep this guide nearby while working through your zybook problems. The order of sections here mirrors the order concepts actually depend on each other, not just the chapter order. When something in your book is confusing, find the term in the Quick Reference table and then go to that section here.*
