# MATLAB Fundamentals for Linear Algebra
## Every concept defined before it is used. Written for someone who loves to code.

---

## What MATLAB is

MATLAB is a programming language designed specifically for math and
matrix operations. If you've used Python, JavaScript, or any other
language, MATLAB will feel familiar — it has variables, functions,
loops, and conditionals, just with math-focused syntax.

The key difference from other languages: in MATLAB, a variable can
hold a matrix (a grid of numbers) just as easily as a single number,
and most operations work on the whole matrix at once without needing
explicit loops.

---

## Part 1: Numbers and Variables

### Assigning a value to a variable

```matlab
x = 5
```

Output:
```
x =
     5
```

The variable `x` now holds the number 5. Works exactly like any
other language.

```matlab
x = 5;
```

The semicolon at the end SUPPRESSES the output — MATLAB won't print
the result. Use semicolons when you don't want to see intermediate
results cluttering your screen. Only omit them when you want to see
what a variable contains.

### Basic arithmetic

```matlab
a = 10;
b = 3;

add      = a + b     % addition:       13
subtract = a - b     % subtraction:    7
multiply = a * b     % multiplication: 30
divide   = a / b     % division:       3.3333
power    = a ^ b     % exponentiation: 1000 (10 cubed)
```

The `%` symbol starts a comment — MATLAB ignores everything after it
on the same line. Use comments to explain what your code does.

### Built-in math functions

```matlab
sqrt(25)      % square root:     5
abs(-7)       % absolute value:  7
floor(3.7)    % round down:      3
ceil(3.2)     % round up:        4
round(3.5)    % round to nearest: 4
mod(10, 3)    % remainder:       1  (10 divided by 3 leaves remainder 1)
```

### Special constants

```matlab
pi            % 3.14159...
exp(1)        % e = 2.71828... (Euler's number)
Inf           % infinity
NaN           % "Not a Number" (result of 0/0 or similar)
```

---

## Part 2: Vectors

A vector is an ordered list of numbers. In MATLAB you create them
using square brackets.

### Row vector (numbers side by side)

```matlab
v = [3, 4, 5]
% or equivalently (comma is optional):
v = [3 4 5]
```

Output:
```
v =
     3     4     5
```

This is a 1×3 vector (1 row, 3 columns).

### Column vector (numbers stacked vertically)

```matlab
v = [3; 4; 5]
```

The semicolon INSIDE brackets means "start a new row." So [3; 4; 5]
has three rows, each with one number.

Output:
```
v =
     3
     4
     5
```

This is a 3×1 vector (3 rows, 1 column).

### Why the distinction matters

Most linear algebra uses COLUMN vectors. When you multiply a matrix
by a vector, the vector must be a column. You'll use column vectors
(semicolons) the majority of the time.

### Accessing individual entries

```matlab
v = [10; 20; 30; 40];

v(1)    % first entry:  10
v(2)    % second entry: 20
v(end)  % last entry:   40
```

MATLAB counts from 1, not 0. The first element is v(1), not v(0).

### Vector arithmetic

```matlab
a = [1; 2; 3];
b = [4; 5; 6];

a + b     % add matching entries:      [5; 7; 9]
a - b     % subtract matching entries: [-3; -3; -3]
3 * a     % multiply every entry by 3: [3; 6; 9]
a / 2     % divide every entry by 2:   [0.5; 1; 1.5]
```

### The dot product

```matlab
a = [1; 2; 3];
b = [4; 5; 6];

dot(a, b)     % 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
```

`dot(a, b)` multiplies matching entries and adds them all up.
This is the inner product for vectors.

You can also write it as:
```matlab
a' * b        % a' transposes a (makes it a row), then multiplies
```

`a'` turns the column [1;2;3] into the row [1 2 3], then [1 2 3]*[4;5;6]
uses the row·column rule: 1*4 + 2*5 + 3*6 = 32. Same answer.

### Vector norm (length)

```matlab
v = [3; 4];

norm(v)       % sqrt(3^2 + 4^2) = sqrt(9+16) = sqrt(25) = 5
norm(v, 2)    % same thing — 2-norm is the default
norm(v, 1)    % 1-norm: |3| + |4| = 7
norm(v, Inf)  % infinity-norm: max(|3|,|4|) = 4
```

---

## Part 3: Matrices

A matrix is a grid of numbers with rows and columns.

### Creating a matrix

```matlab
A = [1 2 3;
     4 5 6;
     7 8 9]
```

Spaces separate entries in the SAME row. Semicolons (or new lines)
start a NEW row. This creates a 3×3 matrix:

```
A =
     1     2     3
     4     5     6
     7     8     9
```

### Matrix size

```matlab
A = [1 2 3; 4 5 6];

size(A)         % returns [2, 3] — 2 rows, 3 columns
size(A, 1)      % returns 2 — number of rows
size(A, 2)      % returns 3 — number of columns
numel(A)        % returns 6 — total number of entries (2*3)
```

### Accessing entries

```matlab
A = [1 2 3; 4 5 6; 7 8 9];

A(2, 3)     % row 2, column 3:  6
A(1, 1)     % row 1, column 1:  1
A(end, end) % last row, last column: 9
```

### Accessing entire rows and columns

```matlab
A = [1 2 3; 4 5 6; 7 8 9];

A(2, :)     % entire row 2:    [4 5 6]
A(:, 3)     % entire column 3: [3; 6; 9]
```

The colon `:` means "all." `A(2,:)` means "row 2, all columns."
`A(:,3)` means "all rows, column 3."

### Special matrices

```matlab
zeros(3)        % 3×3 matrix of all zeros
zeros(2, 4)     % 2×4 matrix of all zeros
ones(3)         % 3×3 matrix of all ones
eye(3)          % 3×3 identity matrix (1s on diagonal, 0s elsewhere)
rand(3)         % 3×3 matrix of random numbers between 0 and 1
```

The identity matrix:
```
eye(3) =
     1     0     0
     0     1     0
     0     0     1
```

### Matrix arithmetic

```matlab
A = [1 2; 3 4];
B = [5 6; 7 8];

A + B       % add matching entries
A - B       % subtract matching entries
3 * A       % multiply every entry by 3
A / 2       % divide every entry by 2
```

### Element-wise vs matrix operations

This is one of the most important distinctions in MATLAB.

```matlab
A = [1 2; 3 4];
B = [5 6; 7 8];

A * B       % MATRIX multiplication (row·column rule)
            % NOT the same as multiplying matching entries

A .* B      % ELEMENT-WISE multiplication (matching entries)
            % The dot before * changes everything
```

Matrix multiplication (A * B):
```
[1*5+2*7, 1*6+2*8]   =   [19, 22]
[3*5+4*7, 3*6+4*8]       [43, 50]
```

Element-wise (A .* B):
```
[1*5, 2*6]   =   [5,  12]
[3*7, 4*8]       [21, 32]
```

**Rule:** use `.*` when you want to multiply matching entries.
Use `*` when you want matrix multiplication (row·column rule).
This same distinction applies to `./` (element-wise divide) vs `/`.

### Matrix transpose

```matlab
A = [1 2 3; 4 5 6];

A'      % transpose: rows become columns, columns become rows
```

Output:
```
ans =
     1     4
     2     5
     3     6
```

A was 2×3, A' is 3×2.

### Matrix determinant and inverse

```matlab
A = [1 2; 3 4];

det(A)      % determinant: 1*4 - 2*3 = -2
inv(A)      % inverse matrix (only works if det ≠ 0)
```

### Row reduction (RREF)

```matlab
A = [1 2 3; 4 5 6; 7 8 9];

rref(A)                     % reduced row echelon form
[R, pivot_cols] = rref(A)   % also returns which columns have pivots
```

---

## Part 4: Functions

### Anonymous functions (one-liners)

The `@` symbol creates a function without needing a separate file.

```matlab
square = @(x) x^2
```

Breaking this down:
- `square` — the name we give to this function
- `=` — assignment, same as always
- `@` — "what follows is a function definition"
- `(x)` — x is the INPUT (the thing you pass in when you call it)
- `x^2` — the OUTPUT (what the function computes and returns)

Using it:
```matlab
square(5)     % returns 25
square(3)     % returns 9
```

### Functions with two inputs

```matlab
add = @(a, b) a + b

add(3, 4)     % returns 7
```

### Functions using other variables

```matlab
weights = [5; 3; 1];

weighted_sum = @(u, v) sum(weights .* u .* v)
```

Breaking this down:
- `weights` — a variable defined BEFORE the function, used inside it
- `u .* v` — element-wise multiply u and v (matching entries)
- `weights .* (u .* v)` — multiply those results by the weights
- `sum(...)` — add everything up into one number

```matlab
u = [2; 1; 4];
v = [3; 5; 2];

weighted_sum(u, v)
% = 5*(2*3) + 3*(1*5) + 1*(4*2)
% = 5*6 + 3*5 + 1*8
% = 30 + 15 + 8
% = 53
```

### Named functions (in their own file)

For reusable code, save a function in a file named exactly the same
as the function:

```matlab
% File: compute_norm.m
function result = compute_norm(v, inner_product)
% compute_norm - finds the norm of v under the given inner product
%
% INPUTS:
%   v             - a column vector
%   inner_product - a function @(a,b) that computes the inner product
%
% OUTPUT:
%   result - the norm (a single positive number)

    result = sqrt(inner_product(v, v));
end
```

Breaking the function header down:
- `function` — keyword that says "this is a function definition"
- `result` — the OUTPUT variable name (what gets returned)
- `=` — separates output from the function name
- `compute_norm` — the name of this function
- `(v, inner_product)` — the INPUT variable names

Using it:
```matlab
euclidean = @(a,b) dot(a,b);
v = [3; 4];

compute_norm(v, euclidean)    % returns 5
```

---

## Part 5: Control flow

### For loops

```matlab
for i = 1:5
    disp(i)
end
```

`1:5` creates the sequence [1, 2, 3, 4, 5]. The loop runs once for
each value, with `i` taking that value.

Output: prints 1, then 2, then 3, then 4, then 5.

```matlab
total = 0;
for i = 1:10
    total = total + i;
end
disp(total)    % 55 (sum of 1 through 10)
```

### Looping over a range with a step

```matlab
for i = 1:2:10    % start:step:end
    disp(i)
end
% prints 1, 3, 5, 7, 9
```

### While loops

```matlab
x = 1;
while x < 100
    x = x * 2;
end
disp(x)    % 128 (first power of 2 that exceeds 100)
```

### If statements

```matlab
x = 7;

if x > 5
    disp('x is greater than 5')
elseif x == 5
    disp('x equals 5')
else
    disp('x is less than 5')
end
```

Note: `==` tests equality (two equals signs). `=` assigns a value.

### Logical operators

```matlab
a = 5;
b = 10;

a > b       % false (0)
a < b       % true  (1)
a == b      % false (0) — equals
a ~= b      % true  (1) — not equals (~ means NOT in MATLAB)
a >= b      % false (0) — greater than or equal
a <= b      % true  (1) — less than or equal

(a > 3) && (b < 20)    % true  AND true  = true
(a > 3) || (b > 20)    % true  OR  false = true
```

---

## Part 6: Cell Arrays

A regular array in MATLAB must contain numbers of the same type.
A cell array can hold ANYTHING — numbers, matrices, strings, other
cell arrays.

```matlab
c = {5, [1;2;3], 'hello', [1 2; 3 4]}
```

This cell array has four items:
- Position 1: the number 5
- Position 2: a column vector [1;2;3]
- Position 3: the string 'hello'
- Position 4: a 2×2 matrix

### Accessing cell array contents

```matlab
c{1}    % gets the number 5        (curly braces to get the CONTENT)
c{2}    % gets the vector [1;2;3]
c(1)    % gets a CELL containing 5 (round braces give you the cell itself)
```

**Always use curly braces `{}` to get the actual content out of a
cell array.** Round braces give you a cell wrapper, not the content.

### Creating an empty cell array

```matlab
result = cell(1, 3)    % 1 row, 3 columns, all empty cells
```

Then fill it in a loop:
```matlab
for i = 1:3
    result{i} = i * 10;    % put 10, 20, 30 into the three cells
end
```

---

## Part 7: The sum() function in detail

`sum()` is used constantly and behaves differently depending on input.

```matlab
v = [3; 4; 5];
sum(v)          % adds all entries of a vector: 12
```

For a matrix:
```matlab
A = [1 2 3;
     4 5 6];

sum(A)          % adds each COLUMN: [5, 7, 9] (one number per column)
sum(A, 1)       % same: sum down columns
sum(A, 2)       % sum across ROWS: [6; 15] (one number per row)
sum(sum(A))     % sum everything: first sum columns, then sum that row = 21
```

**Why sum(sum(A))?** The first `sum(A)` gives [5, 7, 9] (three numbers,
one per column). The second `sum(...)` adds those three together: 21.
Two nested sums = total of ALL entries in the matrix.

This is used in the Frobenius inner product:
```matlab
frob = @(A, B) sum(sum(A .* B));
% A .* B  — multiply matching entries (gives a matrix)
% sum(sum(...)) — add ALL of those products up (gives one number)
```

---

## Part 8: Putting it all together — building a Gram-Schmidt function

Now that you know all the pieces, here is the Gram-Schmidt algorithm
written from scratch, with every line explained.

### What Gram-Schmidt does

Takes any basis (set of vectors that span a space) and produces a
new basis for the same space where every pair of vectors is orthogonal.

The core operation is PROJECTION: given two vectors U and V, the
projection of U onto V is:

```
proj = (⟨U,V⟩ / ⟨V,V⟩) * V
```

This gives the part of U that lies along V's direction. Subtracting
it from U leaves only the part perpendicular to V.

### The algorithm

```
V1 = U1                                   (keep first vector)
V2 = U2 - proj_V1(U2)                    (remove V1-component from U2)
V3 = U3 - proj_V1(U3) - proj_V2(U3)     (remove V1 and V2 components from U3)
...
```

### The code

```matlab
function [V_basis, W_basis] = gram_schmidt(U_list, inner_fn)
% gram_schmidt
%
% Converts any basis into an orthogonal basis (V_basis) and
% an orthonormal basis (W_basis).
%
% INPUTS:
%   U_list   - cell array of input vectors/matrices, e.g. {v1, v2, v3}
%              each item is one basis element
%   inner_fn - function handle for the inner product
%              e.g. @(a,b) dot(a,b)  for Euclidean
%              e.g. @(A,B) sum(sum(A.*B))  for Frobenius
%
% OUTPUTS:
%   V_basis - cell array of orthogonal basis elements
%   W_basis - cell array of orthonormal basis elements (each has norm 1)

    % How many vectors are in the input basis?
    % numel() counts elements in an array or cell array
    n = numel(U_list);

    % Create empty cell arrays to store our results
    % cell(1,n) makes a cell array with 1 row and n columns
    % Think of it as n empty boxes waiting to be filled
    V_basis = cell(1, n);
    W_basis = cell(1, n);

    % Process each input vector one at a time
    for i = 1:n

        % Start with the current input vector
        % U_list{i} gets the i-th item from the cell array
        % We store it in V_basis{i} and will subtract projections from it
        V_basis{i} = U_list{i};

        % Subtract the projection onto each PREVIOUS orthogonal vector
        % When i=1, this inner loop runs 0 times (1:0 is empty in MATLAB)
        % When i=2, j takes value 1 only
        % When i=3, j takes values 1, then 2
        for j = 1:(i-1)

            % Compute the projection of U_list{i} onto V_basis{j}
            %
            % inner_fn(U_list{i}, V_basis{j}) — how much U_list{i}
            %   overlaps with V_basis{j}: one number
            %
            % inner_fn(V_basis{j}, V_basis{j}) — the size of V_basis{j}
            %   squared: one number
            %
            % Dividing gives the SCALAR (one number) that tells us
            % how much of V_basis{j} to subtract
            proj_scalar = inner_fn(U_list{i}, V_basis{j}) / ...
                          inner_fn(V_basis{j}, V_basis{j});

            % proj_scalar * V_basis{j}:
            %   proj_scalar is ONE number
            %   V_basis{j} is a vector or matrix
            %   multiplying scales every entry of V_basis{j}
            %   result is the projection vector/matrix
            %
            % V_basis{i} - (...):
            %   subtract the projection from our current vector
            %   this removes the V_basis{j} component
            V_basis{i} = V_basis{i} - proj_scalar * V_basis{j};
        end

        % Compute the norm of V_basis{i}:
        %   inner_fn(V_basis{i}, V_basis{i}) gives norm SQUARED (one number)
        %   sqrt(...) gives the actual norm (one number)
        norm_i = sqrt(inner_fn(V_basis{i}, V_basis{i}));

        % Divide every entry of V_basis{i} by norm_i
        %   result is a unit vector (norm = 1) pointing same direction
        W_basis{i} = V_basis{i} / norm_i;
    end
end
```

### Using it on your problem

```matlab
% Define the two input matrices
U1 = [1 0; 3 4];
U2 = [0 -1; 2 5];

% Store them in a cell array
% Curly braces {} create a cell array
U_list = {U1, U2};

% Define the Frobenius inner product as a function handle
% A.*B   — element-wise multiply (matching entries)
% sum(sum(...)) — add ALL entries to get one number
frob = @(A,B) sum(sum(A .* B));

% Run Gram-Schmidt
[V_basis, W_basis] = gram_schmidt(U_list, frob);

% Display orthogonal basis
disp('V1 (first orthogonal basis matrix):')
disp(V_basis{1})

disp('V2 (second orthogonal basis matrix):')
disp(V_basis{2})

% Display orthonormal basis
disp('W1 (first orthonormal basis matrix):')
disp(W_basis{1})

disp('W2 (second orthonormal basis matrix):')
disp(W_basis{2})

% Verification
disp('Check V1 and V2 are orthogonal (should be 0):')
disp(frob(V_basis{1}, V_basis{2}))

disp('Check W1 has norm 1 (should be 1):')
disp(sqrt(frob(W_basis{1}, W_basis{1})))

disp('Check W2 has norm 1 (should be 1):')
disp(sqrt(frob(W_basis{2}, W_basis{2})))
```

Expected output:
```
V1 =
     1     0
     3     4

V2 =
    -1    -1
    -1     1

W1 =
    0.1961         0
    0.5883    0.7845

W2 =
   -0.5000   -0.5000
   -0.5000    0.5000

Check V1 and V2 are orthogonal: 0
Check W1 has norm 1: 1.0000
Check W2 has norm 1: 1.0000
```

---

## Part 9: A reusable linear algebra toolkit

Here are the functions you will use repeatedly. Save each one in its
own .m file with the same name as the function.

```matlab
% File: inner_euclidean.m
function result = inner_euclidean(u, v)
% Euclidean inner product (dot product) for vectors
    result = dot(u, v);
end
```

```matlab
% File: inner_frobenius.m
function result = inner_frobenius(A, B)
% Frobenius inner product for matrices
% Multiply matching entries, add them all up
    result = sum(sum(A .* B));
end
```

```matlab
% File: inner_weighted.m
function result = inner_weighted(u, v, weights)
% Weighted Euclidean inner product
% weights is a column vector of the same size as u and v
    result = sum(weights .* u .* v);
end
```

```matlab
% File: vector_norm.m
function result = vector_norm(v, inner_fn)
% Norm of v under the given inner product
    result = sqrt(inner_fn(v, v));
end
```

```matlab
% File: is_orthogonal.m
function result = is_orthogonal(u, v, inner_fn)
% Check if two objects are orthogonal under the given inner product
% Returns 1 (true) if orthogonal, 0 (false) if not
    tolerance = 1e-10;    % allow tiny floating-point errors
    result = abs(inner_fn(u, v)) < tolerance;
end
```

```matlab
% File: is_unit.m
function result = is_unit(v, inner_fn)
% Check if v is a unit vector under the given inner product
    tolerance = 1e-10;
    result = abs(vector_norm(v, inner_fn) - 1) < tolerance;
end
```

```matlab
% File: project.m
function result = project(u, v, inner_fn)
% Project u onto v under the given inner product
% Returns the component of u that lies along v's direction
    scalar = inner_fn(u, v) / inner_fn(v, v);
    result = scalar * v;
end
```

### Using the toolkit

```matlab
% Define inner product to use
frob = @inner_frobenius;    % use the function we wrote

% Two matrices
A = [1 2; 3 4];
B = [0 1; -1 0];

% Check orthogonality
is_orthogonal(A, B, frob)    % 1 or 0

% Find norm
vector_norm(A, frob)

% Check if unit
is_unit(A, frob)

% Project A onto B
project(A, B, frob)
```

---

## Part 10: Decision process for any linear algebra problem in MATLAB

When you see a problem, ask these questions in order:

```
1. What KIND of objects am I working with?
      vectors → use dot(), norm(), etc.
      matrices → use sum(sum(A.*B)) for Frobenius
      functions → use int() (symbolic integration)

2. What INNER PRODUCT is given?
      Euclidean → dot(u,v)
      Weighted  → sum(weights .* u .* v)
      Frobenius → sum(sum(A.*B))
      Integration → int(f*g, x, a, b)
      Build it as a function handle: inner = @(a,b) ...

3. What am I being asked to find?
      norm        → sqrt(inner(v,v))
      distance    → sqrt(inner(u-v, u-v))
      orthogonal? → inner(u,v) == 0
      unit vector? → sqrt(inner(v,v)) == 1
      orthonormal? → both above conditions
      orthogonal basis → gram_schmidt(vectors, inner)

4. Write the function handle first, then call the right function.
```

This decision process works for every problem in chapters 7+.
