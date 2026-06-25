# Linear Algebra: Inner Products, Norms, and Beyond
## A Complete Teaching Guide with MATLAB
### Assumes nothing. Teaches everything.

---

# How to Use This Document

This is not a reference sheet. It is a teaching document. Every concept is explained in plain English first, then with math, then with a concrete numerical example worked by hand, then in MATLAB with every line commented. If something is explained more than once, that is intentional — repetition from different angles is how understanding forms.

Run every MATLAB block as you read. Do not just read the code — type it, run it, change the numbers, break it, fix it. That is the difference between knowing what something does and understanding why it works.

---

# Part 1: Inner Product Spaces (Section 7.1)

---

## 1.1 What Is a Vector Space?

Before inner products make sense, you need to know what they operate on.

A **vector space** is a collection of objects where two operations are defined:
- You can **add** any two objects together and get another object in the collection
- You can **scale** any object by a number and get another object in the collection

The objects do not have to be arrows or lists of numbers. They just have to obey those two rules. This is important because in this course you will see three different kinds of objects treated as vectors:

**Kind 1: Tuples of numbers**
(1, 2, 3) is a vector. (−5, 0, 7, 2) is a vector. You can add them component by component and scale them by multiplying every component by a number.

**Kind 2: Polynomials**
f(x) = 3 + 2x − x² is a vector. You can add two polynomials and get another polynomial. You can multiply a polynomial by a number and get another polynomial. So polynomials form a vector space.

**Kind 3: Functions**
f(x) = sin(x) is a vector in a function space. You can add sin(x) + cos(x) and get another function. You can scale 3·sin(x) and get another function.

The word "vector" in this course means any of these three things depending on context. The formulas change slightly depending on which kind you are working with, but the underlying ideas are identical.

---

## 1.2 What Is an Inner Product?

An inner product is a machine that takes **two vectors** as input and produces **one number** as output.

That number captures something meaningful: how much the two vectors "point in the same direction," how similar they are, how much they overlap.

The formal name for that output number is a **scalar**.

### The Three Rules an Inner Product Must Obey

Not every formula that takes two vectors and produces a number qualifies as an inner product. It must satisfy three rules. These rules are not arbitrary — they are the minimum requirements for the output to behave like a meaningful measure of similarity.

**Rule 1: Symmetry**
Swapping the two inputs does not change the output.
⟨u, v⟩ = ⟨v, u⟩

Intuition: how much u overlaps with v should be the same as how much v overlaps with u.

**Rule 2: Linearity in the First Argument**
If you scale or add vectors in the first slot, the inner product scales or adds accordingly.
⟨au + bw, v⟩ = a⟨u, v⟩ + b⟨w, v⟩

Intuition: if you double a vector, its overlap with anything else doubles.

**Rule 3: Positive Definiteness**
⟨v, v⟩ > 0 for any non-zero vector v, and ⟨v, v⟩ = 0 only when v is the zero vector.

Intuition: a vector's overlap with itself is its "size squared." Size is always positive, and only the zero vector has size zero.

---

## 1.3 The Standard Inner Product (Dot Product)

The most common inner product for tuples of numbers is the **dot product**. You have probably seen it before. Here it is defined carefully.

Given two vectors with n components each:

**u** = (u₁, u₂, ..., uₙ)
**v** = (v₁, v₂, ..., vₙ)

The dot product is:

⟨u, v⟩ = u₁v₁ + u₂v₂ + ... + uₙvₙ

In words: multiply the first components together, multiply the second components together, keep going, then add everything up.

### Canonical Example — Worked by Hand

Let **u** = (1, 3, −2) and **v** = (4, −1, 5).

⟨u, v⟩ = (1)(4) + (3)(−1) + (−2)(5)
        = 4 + (−3) + (−10)
        = 4 − 3 − 10
        = −9

The inner product is −9. A negative number means the vectors point more "against" each other than "with" each other. Zero means they are perpendicular. Positive means they point more in the same direction.

### In MATLAB

```matlab
% Define two column vectors
% Note: semicolons separate rows, so [1;3;-2] is a column vector
u = [1; 3; -2];
v = [4; -1; 5];

% Method 1: use MATLAB's built-in dot() function
result = dot(u, v)
% Output: -9

% Method 2: use matrix multiplication
% u' means "transpose of u" -- turns a column into a row
% A row times a column gives a single number
result2 = u' * v
% Output: -9

% Method 3: do it manually to see every step
step1 = u(1)*v(1)   % first components: 1*4 = 4
step2 = u(2)*v(2)   % second components: 3*(-1) = -3
step3 = u(3)*v(3)   % third components: (-2)*5 = -10
total = step1 + step2 + step3
% Output: -9

% All three methods give the same answer
% Use dot() or u'*v in practice -- they are cleaner
```

### Verifying the Three Rules in MATLAB

```matlab
u = [1; 3; -2];
v = [4; -1; 5];
w = [2; 0; -1];
a = 3;
b = -2;

% Rule 1: Symmetry -- <u,v> should equal <v,u>
lhs = dot(u, v)    % -9
rhs = dot(v, u)    % -9
% They match

% Rule 2: Linearity -- <a*u + b*w, v> should equal a*<u,v> + b*<w,v>
lhs = dot(a*u + b*w, v)
rhs = a*dot(u,v) + b*dot(w,v)
% They match

% Rule 3: Positive definiteness -- <u,u> should be > 0
dot(u, u)   % = 1 + 9 + 4 = 14, which is > 0

% Only the zero vector gives 0
zero = [0; 0; 0];
dot(zero, zero)   % = 0
```

---

## 1.4 The Inner Product for Polynomials (Coefficient Method)

When your course treats polynomials as vectors using their coefficients, the inner product is computed exactly like the dot product — just extract the coefficients and treat them as a tuple.

### How Coefficients Become a Vector

The polynomial f(x) = 5 − 3x + 2x² has three coefficients: 5, −3, and 2.

The rule is: list the coefficients in order from the constant term up:
- constant term (x⁰): 5
- coefficient of x¹: −3
- coefficient of x²: 2

So f becomes the vector (5, −3, 2).

**Important:** two polynomials must have the same degree to take their inner product this way. If one has fewer terms, pad it with zeros.

f(x) = 5 − 3x + 2x²  →  (5, −3, 2)
g(x) = 1 + 4x − x²   →  (1, 4, −1)

⟨f, g⟩ = (5)(1) + (−3)(4) + (2)(−1)
        = 5 − 12 − 2
        = −9

### Canonical Example — Worked by Hand

f(x) = 2 + x − 3x²  →  (2, 1, −3)
g(x) = −1 + 2x + x² →  (−1, 2, 1)

⟨f, g⟩ = (2)(−1) + (1)(2) + (−3)(1)
        = −2 + 2 − 3
        = −3

### In MATLAB

```matlab
% f(x) = 2 + x - 3x^2  -->  coefficients listed constant first
f = [2; 1; -3];

% g(x) = -1 + 2x + x^2  -->  coefficients listed constant first
g = [-1; 2; 1];

% Inner product: exactly the same as dot product
ip = dot(f, g)
% = (2)(-1) + (1)(2) + (-3)(1)
% = -2 + 2 - 3
% = -3

% Verify by doing it step by step
ip_manual = f(1)*g(1) + f(2)*g(2) + f(3)*g(3)
% Same result: -3
```

---

## 1.5 The Weighted Inner Product

The standard dot product treats all components equally. But sometimes some components matter more than others. A **weighted inner product** lets you assign different importance to each component.

Given positive weights w₁, w₂, ..., wₙ (they must all be positive for Rule 3 to hold):

⟨u, v⟩_w = w₁u₁v₁ + w₂u₂v₂ + ... + wₙuₙvₙ

It is the same as the dot product, except each term gets multiplied by its weight before being added.

The standard dot product is the special case where all weights equal 1.

### Why Would You Use This?

Imagine you are measuring the quality of a manufactured part. It has three dimensions: length, width, and thickness. But thickness has a tolerance ten times tighter than the others — it matters more. You would assign a higher weight to the thickness component so that errors there count more in your distance calculations.

### Canonical Example — Worked by Hand

**u** = (1, 2, 3), **v** = (4, −1, 2), weights **w** = (2, 3, 1)

⟨u, v⟩_w = (2)(1)(4) + (3)(2)(−1) + (1)(3)(2)
           = 8 + (−6) + 6
           = 8

Compare to the unweighted version:
⟨u, v⟩ = (1)(4) + (2)(−1) + (3)(2) = 4 − 2 + 6 = 8

In this case they happen to be equal, but that is a coincidence of these specific numbers.

### In MATLAB

```matlab
u = [1; 2; 3];
v = [4; -1; 2];
w = [2; 3; 1];   % weights -- must all be positive

% Weighted inner product
% .* means element-wise multiplication (multiply component by component)
ip_weighted = sum(w .* u .* v)
% w .* u .* v = [2*1*4; 3*2*(-1); 1*3*2] = [8; -6; 6]
% sum of [8; -6; 6] = 8

% Unweighted for comparison
ip_standard = dot(u, v)
% = 4 - 2 + 6 = 8

% Another example where they differ
u2 = [1; 0; 1];
v2 = [1; 1; 0];
w2 = [1; 5; 1];

ip_standard2 = dot(u2, v2)       % = 1 + 0 + 0 = 1
ip_weighted2 = sum(w2 .* u2 .* v2)  % = 1 + 0 + 0 = 1
% Still the same here because the middle components are 0

% Try this one
u3 = [1; 2; 1];
v3 = [1; 1; 1];
w3 = [1; 10; 1];

ip_standard3 = dot(u3, v3)          % = 1 + 2 + 1 = 4
ip_weighted3 = sum(w3 .* u3 .* v3)  % = 1 + 20 + 1 = 22
% Now the difference is clear -- the second component dominates
```

---

## 1.6 The Integral Inner Product

When your vectors are **functions** rather than tuples, you cannot multiply "corresponding components" because a function has infinitely many values. Instead of summing a finite list, you integrate.

The integral inner product of two functions f and g over an interval [a, b] is:

⟨f, g⟩ = ∫ₐᵇ f(x) · g(x) dx

This is the direct analog of the dot product. Think of it as: at each point x, multiply the two function values together, then "add up" all those products over the interval — which is what an integral does.

### Canonical Example — Worked by Hand

f(x) = x, g(x) = x², interval [0, 1]

⟨f, g⟩ = ∫₀¹ x · x² dx
        = ∫₀¹ x³ dx
        = [x⁴/4]₀¹
        = 1/4 − 0
        = 1/4

### Another Example

f(x) = 1, g(x) = x, interval [−1, 1]

⟨f, g⟩ = ∫₋₁¹ 1 · x dx
        = ∫₋₁¹ x dx
        = [x²/2]₋₁¹
        = 1/2 − 1/2
        = 0

The inner product is zero. These two functions are orthogonal on [−1, 1]. Geometrically, this means they do not "overlap" on this interval — the positive part of x and the negative part of x cancel out perfectly when multiplied by the constant 1.

### In MATLAB

```matlab
% MATLAB can compute symbolic integrals using the Symbolic Math Toolbox
% You need to declare x as a symbolic variable first
syms x

% Define functions symbolically
f = x;
g = x^2;

% Compute the integral inner product over [0, 1]
ip = int(f * g, x, 0, 1)
% int() computes the definite integral
% Arguments: integrand, variable, lower limit, upper limit
% Output: 1/4

% Another example: f=1, g=x over [-1, 1]
f2 = 1;
g2 = x;
ip2 = int(f2 * g2, x, -1, 1)
% Output: 0  (they are orthogonal)

% Convert symbolic result to decimal if needed
double(ip)    % converts 1/4 to 0.2500

% More complex example: f = x^2, g = 3-x, over [0, 2]
f3 = x^2;
g3 = 3 - x;
ip3 = int(f3 * g3, x, 0, 2)
% = int(3x^2 - x^3, 0, 2)
% = [x^3 - x^4/4] from 0 to 2
% = (8 - 4) - 0 = 4
```

---

# Part 2: Norms and Distances (Section 7.2)

---

## 2.1 What Is a Norm?

A norm is a function that takes a single vector and outputs a number representing its **size** or **length**.

The absolute value |x| is a norm for numbers. Norms generalize absolute value to vectors.

### The Three Rules a Norm Must Obey

Just like inner products, not every formula qualifies. A norm ‖·‖ must satisfy:

**Rule 1: Non-negativity**
‖v‖ ≥ 0 for all v, and ‖v‖ = 0 if and only if v is the zero vector.

A size is never negative. Only the zero vector has size zero.

**Rule 2: Homogeneity (Scaling)**
‖cv‖ = |c| · ‖v‖ for any scalar c.

If you stretch a vector by a factor of 3, its length triples. The absolute value of c is needed because scaling by −2 stretches by 2 (the negative just flips direction, it does not shrink).

**Rule 3: Triangle Inequality**
‖u + v‖ ≤ ‖u‖ + ‖v‖

The length of the sum is at most the sum of the lengths. This is the mathematical version of "the shortest path between two points is a straight line." If you walk from A to B to C, that trip is at least as long as walking straight from A to C.

---

## 2.2 The L2 Norm (Euclidean Norm)

The L2 norm is the one you already know from geometry. It is the straight-line length of a vector, computed using the Pythagorean theorem extended to n dimensions.

‖v‖₂ = √(v₁² + v₂² + ... + vₙ²)

The subscript 2 is the name of this norm — it is the "2-norm" or "L2 norm."

### Canonical Example — Worked by Hand

**v** = (3, −4, 0)

‖v‖₂ = √(3² + (−4)² + 0²)
      = √(9 + 16 + 0)
      = √25
      = 5

### Connection to Inner Products

Notice: 3² + (−4)² + 0² is exactly what you get when you compute ⟨v, v⟩ (the dot product of v with itself).

So the L2 norm is always:

‖v‖₂ = √⟨v, v⟩

This is the fundamental connection between inner products and norms. The L2 norm is what you get when you take the inner product of a vector with itself and take the square root. Every inner product generates an L2-style norm this way.

### In MATLAB

```matlab
v = [3; -4; 0];

% Method 1: MATLAB's built-in norm() -- defaults to L2
n = norm(v)
% Output: 5

% Method 2: formula directly
n2 = sqrt(v(1)^2 + v(2)^2 + v(3)^2)
% Output: 5

% Method 3: using the inner product connection
n3 = sqrt(dot(v, v))
% Output: 5

% Method 4: using matrix operations
% v' * v computes dot product of v with itself
n4 = sqrt(v' * v)
% Output: 5

% All four methods give the same answer
% In practice, use norm(v)

% Example with more components
w = [1; 2; 2; 0; -1; 3];
norm(w)
% = sqrt(1 + 4 + 4 + 0 + 1 + 9) = sqrt(19)
```

---

## 2.3 The L1 Norm (Manhattan Norm)

The L1 norm adds up the absolute values of all components.

‖v‖₁ = |v₁| + |v₂| + ... + |vₙ|

The name "Manhattan" comes from city blocks. In Manhattan you cannot walk diagonally through buildings. To get from one corner to another, you walk along the grid. The L1 norm measures that grid distance.

### Canonical Example — Worked by Hand

**v** = (3, −4, 0)

‖v‖₁ = |3| + |−4| + |0|
      = 3 + 4 + 0
      = 7

Notice that L1 (7) > L2 (5) for this vector. This is always true — the L1 norm is always greater than or equal to the L2 norm. Intuitively, walking along the grid is always at least as long as walking diagonally.

### In MATLAB

```matlab
v = [3; -4; 0];

% L1 norm: use norm(v, 1)
n = norm(v, 1)
% Output: 7

% Manually: sum of absolute values
n_manual = sum(abs(v))
% abs() makes every component positive
% sum() adds them up
% Output: 7

% Another example
w = [-5; 2; -3; 1];
norm(w, 1)
% = |-5| + |2| + |-3| + |1| = 5 + 2 + 3 + 1 = 11
```

---

## 2.4 The L∞ Norm (Max Norm, Infinity Norm)

The L∞ norm is simply the largest absolute value among all components.

‖v‖∞ = max(|v₁|, |v₂|, ..., |vₙ|)

### Canonical Example — Worked by Hand

**v** = (3, −4, 0)

|v₁| = |3| = 3
|v₂| = |−4| = 4
|v₃| = |0| = 0

‖v‖∞ = max(3, 4, 0) = 4

### Why Does This Norm Exist?

The L∞ norm asks: what is the worst single component? This matters in situations where the biggest error is what counts, not the total error. In manufacturing, if one dimension of a part is way out of tolerance, it fails — even if every other dimension is perfect. The L∞ norm captures that kind of worst-case thinking.

### In MATLAB

```matlab
v = [3; -4; 0];

% L-infinity norm: use norm(v, inf)
n = norm(v, inf)
% Output: 4

% Manually: max of absolute values
n_manual = max(abs(v))
% abs(v) = [3; 4; 0]
% max([3; 4; 0]) = 4
% Output: 4

% Example
w = [-5; 2; -3; 1];
norm(w, inf)
% max(5, 2, 3, 1) = 5
```

---

## 2.5 Comparing All Three Norms

Let us use the same vector for all three and see how the results relate.

**v** = (3, −4, 0)

| Norm | Formula | Calculation | Result |
|------|---------|-------------|--------|
| L1   | sum of \|components\| | 3 + 4 + 0 | 7 |
| L2   | sqrt of sum of squares | √(9+16+0) | 5 |
| L∞   | max absolute component | max(3,4,0) | 4 |

Always: ‖v‖∞ ≤ ‖v‖₂ ≤ ‖v‖₁

The L∞ is always smallest (or tied), L1 is always largest (or tied), L2 is in between.

### In MATLAB — Side-by-Side Comparison

```matlab
v = [3; -4; 0];

fprintf('L1 norm: %g\n', norm(v, 1))    % 7
fprintf('L2 norm: %g\n', norm(v))        % 5
fprintf('Linf norm: %g\n', norm(v, inf)) % 4

% You can also verify the ordering
l1 = norm(v, 1);
l2 = norm(v);
linf = norm(v, inf);

% This should print 1 (true) for both comparisons
linf <= l2          % true
l2 <= l1            % true
```

---

## 2.6 Norms of Polynomials

When polynomials are represented by their coefficients, computing their norms is identical to computing vector norms. You just extract the coefficients first.

### The Rule for Extracting Coefficients

Always list coefficients from constant term up:
- p(x) = a₀ + a₁x + a₂x² + ... → vector (a₀, a₁, a₂, ...)

### Canonical Example — Worked by Hand

p(x) = 3 − x + 2x²  →  coefficients (3, −1, 2)

‖p‖₁ = |3| + |−1| + |2| = 3 + 1 + 2 = 6
‖p‖₂ = √(9 + 1 + 4) = √14
‖p‖∞ = max(3, 1, 2) = 3

### In MATLAB

```matlab
% p(x) = 3 - x + 2x^2
% Coefficients: constant=3, x-term=-1, x^2-term=2
p = [3; -1; 2];

norm_L1   = norm(p, 1)      % 3 + 1 + 2 = 6
norm_L2   = norm(p)         % sqrt(9+1+4) = sqrt(14)
norm_Linf = norm(p, inf)    % max(3,1,2) = 3

% What if two polynomials have different degrees?
% Pad the shorter one with zeros
% f(x) = 1 + 2x       --> degree 1
% g(x) = 3 - x + x^2  --> degree 2

f = [1; 2; 0];   % pad with 0 for missing x^2 term
g = [3; -1; 1];

norm(f)   % sqrt(1 + 4 + 0) = sqrt(5)
norm(g)   % sqrt(9 + 1 + 1) = sqrt(11)
```

---

## 2.7 Distance Between Two Vectors

Distance is the norm of the difference.

d(u, v) = ‖u − v‖

That is the complete definition. You subtract one vector from the other, then take the norm of the result.

The choice of which norm you use (L1, L2, or L∞) gives you different notions of distance, just as there are different ways to measure distance in a city.

### Canonical Example — Worked by Hand

**u** = (1, 5, 3) and **v** = (4, 1, 3)

Step 1: subtract
u − v = (1−4, 5−1, 3−3) = (−3, 4, 0)

Step 2: take the norm
L2 distance: ‖u−v‖₂ = √(9 + 16 + 0) = √25 = 5
L1 distance: ‖u−v‖₁ = 3 + 4 + 0 = 7
L∞ distance: ‖u−v‖∞ = max(3, 4, 0) = 4

### In MATLAB

```matlab
u = [1; 5; 3];
v = [4; 1; 3];

% Step 1: compute the difference
diff = u - v   % [-3; 4; 0]

% Step 2: take the norm
d_L2   = norm(diff)        % 5
d_L1   = norm(diff, 1)     % 7
d_Linf = norm(diff, inf)   % 4

% You can write it all in one line
d = norm(u - v)   % L2 distance = 5
```

---

## 2.8 Distance Between Polynomials (Coefficient Method)

Subtract the coefficient vectors, then take the norm.

### Canonical Example — Worked by Hand

f(x) = 4 + x − 2x²  →  (4, 1, −2)
g(x) = 1 − 3x + x²  →  (1, −3, 1)

f − g = (4−1, 1−(−3), −2−1) = (3, 4, −3)

d(f, g) = ‖f − g‖₂ = √(9 + 16 + 9) = √34

### In MATLAB

```matlab
f = [4; 1; -2];
g = [1; -3; 1];

d = norm(f - g)
% f - g = [3; 4; -3]
% norm = sqrt(9 + 16 + 9) = sqrt(34)
```

---

## 2.9 Distance Between Functions (Integral Method)

When your problem specifies functions over an interval, distance uses the integral inner product:

d(f, g) = ‖f − g‖ = √⟨f−g, f−g⟩ = √∫ₐᵇ (f(x) − g(x))² dx

### Step-by-Step Process (Always Follow This Order)

1. Subtract: compute h(x) = f(x) − g(x)
2. Square: compute h(x)² and expand it algebraically
3. Integrate: compute ∫ₐᵇ h(x)² dx
4. Square root: take √ of the result

### Canonical Example — Worked by Hand

f(x) = x², g(x) = x, interval [0, 1]

Step 1: h(x) = x² − x

Step 2: h(x)² = (x² − x)² = x⁴ − 2x³ + x²

Step 3: ∫₀¹ (x⁴ − 2x³ + x²) dx
       = [x⁵/5 − x⁴/2 + x³/3]₀¹
       = 1/5 − 1/2 + 1/3
       = 6/30 − 15/30 + 10/30
       = 1/30

Step 4: d(f, g) = √(1/30)

### In MATLAB

```matlab
syms x

f = x^2;
g = x;

% Step 1: subtract
h = f - g         % x^2 - x

% Step 2 and 3: square and integrate
integrand = h^2;                       % (x^2 - x)^2
result = int(integrand, x, 0, 1);     % integrate from 0 to 1

% Step 4: square root
d = sqrt(result)
% Output: 1/sqrt(30)

% Convert to decimal
double(d)
% Output: 0.1826...

% You can do it all in one line too
d_oneline = sqrt(int((f-g)^2, x, 0, 1))
```

---

# Part 3: Orthogonal Bases (Section 7.4)

---

## 3.1 What Does Orthogonal Mean?

Two vectors are **orthogonal** when their inner product is zero.

⟨u, v⟩ = 0  ↔  u and v are orthogonal

In 2D and 3D, orthogonal means perpendicular. In higher dimensions or function spaces, it is the generalization of perpendicular — they have no "overlap" in the sense of the inner product.

### Canonical Example

**u** = (1, 2) and **v** = (−2, 1)

⟨u, v⟩ = (1)(−2) + (2)(1) = −2 + 2 = 0 ✓ orthogonal

If you draw these as arrows, they form a 90° angle.

### In MATLAB

```matlab
u = [1; 2];
v = [-2; 1];

ip = dot(u, v)   % 0 -- they are orthogonal

% Always check orthogonality by testing if dot product is zero
% Due to floating point arithmetic, use a tolerance
abs(dot(u, v)) < 1e-10   % true
```

---

## 3.2 What Is a Basis?

A **basis** for a vector space is a set of vectors that:
1. Are **linearly independent** (none of them can be built from the others)
2. **Span** the space (any vector in the space can be built from them)

Think of a basis as the minimal set of building blocks for your space.

The standard basis for 3D space is:
**e₁** = (1, 0, 0)
**e₂** = (0, 1, 0)
**e₃** = (0, 0, 1)

Any 3D vector (a, b, c) = a·e₁ + b·e₂ + c·e₃.

---

## 3.3 What Is an Orthogonal Basis?

An **orthogonal basis** is a basis where every pair of basis vectors is orthogonal to each other.

⟨bᵢ, bⱼ⟩ = 0 whenever i ≠ j

The standard basis above is orthogonal. But there are many other orthogonal bases.

An **orthonormal basis** goes one step further: every basis vector also has length 1 (unit length). The standard basis is orthonormal.

### Why Are Orthogonal Bases Useful?

With an orthogonal basis, finding coordinates becomes trivially easy. For any vector v, its coordinate along basis vector bᵢ is:

cᵢ = ⟨v, bᵢ⟩ / ‖bᵢ‖²

You never need to solve a system of equations — just take inner products.

### In MATLAB

```matlab
% Check if a set of vectors forms an orthogonal basis

b1 = [1; 1; 0];
b2 = [1; -1; 0];
b3 = [0; 0; 1];

% Check all pairs
dot(b1, b2)   % 1-1+0 = 0  ✓
dot(b1, b3)   % 0+0+0 = 0  ✓
dot(b2, b3)   % 0+0+0 = 0  ✓
% All zero -- this is an orthogonal basis

% Find coordinates of v = [3; 1; 5] in this basis
v = [3; 1; 5];

c1 = dot(v, b1) / dot(b1, b1)   % (3+1)/(1+1) = 2
c2 = dot(v, b2) / dot(b2, b2)   % (3-1)/(1+1) = 1
c3 = dot(v, b3) / dot(b3, b3)   % 5/1 = 5

% Verify: c1*b1 + c2*b2 + c3*b3 should equal v
c1*b1 + c2*b2 + c3*b3   % [3; 1; 5] ✓
```

---

## 3.4 Gram-Schmidt Process

Given any basis (not necessarily orthogonal), the **Gram-Schmidt process** converts it into an orthogonal basis spanning the same space.

The idea: take each vector, subtract off the parts that overlap with the previous orthogonal vectors, leaving only the perpendicular component.

### The Process — Step by Step

Given vectors {v₁, v₂, v₃}:

u₁ = v₁
u₂ = v₂ − (⟨v₂, u₁⟩/⟨u₁, u₁⟩) u₁
u₃ = v₃ − (⟨v₃, u₁⟩/⟨u₁, u₁⟩) u₁ − (⟨v₃, u₂⟩/⟨u₂, u₂⟩) u₂

Each step removes the component of the new vector that overlaps with the already-orthogonalized vectors.

### In MATLAB

```matlab
% MATLAB does Gram-Schmidt internally via QR decomposition
A = [1 1 0;
     1 0 1;
     0 1 1];
% Columns of A are the original basis vectors

[Q, R] = qr(A);
% Q's columns are the orthonormal basis
% R is upper triangular

Q   % orthonormal basis vectors as columns

% Verify orthogonality
Q' * Q   % should be identity matrix (ones on diagonal, zeros elsewhere)

% To get just orthogonal (not normalized), you can scale back
% Or implement Gram-Schmidt manually:
v1 = A(:,1);
v2 = A(:,2);
v3 = A(:,3);

u1 = v1;
u2 = v2 - (dot(v2,u1)/dot(u1,u1)) * u1;
u3 = v3 - (dot(v3,u1)/dot(u1,u1)) * u1 - (dot(v3,u2)/dot(u2,u2)) * u2;

% Verify orthogonality
dot(u1, u2)   % should be ~0
dot(u1, u3)   % should be ~0
dot(u2, u3)   % should be ~0
```

---

# Part 4: Orthogonal Complements (Section 7.5)

---

## 4.1 What Is an Orthogonal Complement?

The **orthogonal complement** of a subspace W, written W⊥ (read "W perp"), is the set of ALL vectors that are orthogonal to every vector in W.

Think of it this way: if W is a plane in 3D space, W⊥ is the line perpendicular to that plane. If W is a line in 3D space, W⊥ is the plane perpendicular to that line.

The key fact: the dimensions of W and W⊥ always add up to the dimension of the whole space.

dim(W) + dim(W⊥) = n

### Canonical Example

In ℝ³, let W be the span of **v** = (1, 0, 0) — just the x-axis.

W⊥ is every vector orthogonal to (1, 0, 0). That means every vector (a, b, c) where:
⟨(a,b,c), (1,0,0)⟩ = a = 0

So W⊥ = {(0, b, c)} — the yz-plane.

dim(W) = 1, dim(W⊥) = 2, and 1 + 2 = 3 ✓

### In MATLAB

```matlab
% Find W-perp given the matrix A whose columns define W

A = [1 0;
     0 1;
     0 0];
% Columns span the xy-plane in R^3

% W-perp = null space of A transpose
W_perp = null(A')
% Should give [0; 0; 1] -- the z-axis

% Verify: W_perp should be orthogonal to both columns of A
dot(A(:,1), W_perp)   % 0
dot(A(:,2), W_perp)   % 0

% More complex example
A2 = [1 2;
      3 4;
      5 6];

W_perp2 = null(A2')
% This gives the orthogonal complement of the column space of A2

% Verify
A2' * W_perp2   % should be ~zero vector
```

---

# Part 5: Orthogonal Matrices (Section 7.6)

---

## 5.1 What Is an Orthogonal Matrix?

A square matrix Q is called an **orthogonal matrix** if its columns form an orthonormal set — they are mutually orthogonal and each has unit length.

The defining property is:

Qᵀ Q = I

Where I is the identity matrix. This has a remarkable consequence:

Q⁻¹ = Qᵀ

The inverse of an orthogonal matrix is just its transpose. Computing transposes is free (just relabel rows and columns). This makes orthogonal matrices extremely useful computationally.

### Canonical Example

The 2D rotation matrix rotates every vector by angle θ:

Q = [[cos θ, −sin θ], [sin θ, cos θ]]

For θ = 90°:
Q = [[0, −1], [1, 0]]

Check: Qᵀ Q = [[0,1],[−1,0]] · [[0,−1],[1,0]] = [[1,0],[0,1]] = I ✓

### What Do Orthogonal Matrices Do Geometrically?

They **preserve length and angles**. Multiplying any vector by an orthogonal matrix does not change its norm or the angle between it and other vectors. Orthogonal matrices represent rigid motions — rotations and reflections.

### In MATLAB

```matlab
% Rotation matrix by angle theta
theta = pi/4;   % 45 degrees
Q = [cos(theta), -sin(theta);
     sin(theta),  cos(theta)];

% Verify Q'*Q = I
Q' * Q   % should be identity (1s on diagonal, 0s off-diagonal)

% Verify inverse = transpose
norm(inv(Q) - Q')   % should be ~0

% Verify length is preserved
v = [3; 4];
norm(v)        % 5
norm(Q * v)    % also 5 -- length preserved!

% Verify angle is preserved
u = [1; 0];
v = [0; 1];
original_angle = acos(dot(u,v) / (norm(u)*norm(v)))   % 90 degrees

Qu = Q*u;
Qv = Q*v;
new_angle = acos(dot(Qu,Qv) / (norm(Qu)*norm(Qv)))   % still 90 degrees

% Determinant of orthogonal matrix is always +1 or -1
det(Q)   % 1 for rotation, -1 for reflection
```

---

# Part 6: QR Factorization (Section 7.7)

---

## 6.1 What Is QR Factorization?

QR factorization decomposes any matrix A into two matrices:

A = Q · R

Where:
- **Q** is an orthogonal matrix (columns are orthonormal)
- **R** is upper triangular (every entry below the diagonal is zero)

An upper triangular matrix looks like this:

```
[r₁₁  r₁₂  r₁₃]
[ 0   r₂₂  r₂₃]
[ 0    0   r₃₃]
```

This structure makes it trivially easy to solve systems — you start from the bottom and work up.

### Why Is QR Factorization Useful?

**Reason 1: Solving Ax = b stably**
Computers have limited precision. Directly solving Ax = b can accumulate errors. With QR:
Ax = b → QRx = b → Rx = Qᵀb (since Qᵀ = Q⁻¹)
Qᵀb is just a matrix multiplication. Then Rx = c is solved by back-substitution, which is numerically stable.

**Reason 2: It is how Gram-Schmidt is implemented**
The columns of Q are exactly the Gram-Schmidt orthonormalization of the columns of A. R records the change-of-basis coefficients.

### In MATLAB

```matlab
A = [1 2 3;
     4 5 6;
     7 8 10];

% QR factorization
[Q, R] = qr(A)

% Q is orthogonal
Q' * Q   % identity matrix

% R is upper triangular
R   % zeros below diagonal

% Verify A = Q*R
norm(A - Q*R)   % should be ~0 (tiny floating point error)

% Use QR to solve Ax = b
b = [1; 2; 3];

% Method 1: use QR explicitly
c = Q' * b;          % Qᵀb -- free because Q is orthogonal
x = R \ c;           % solve Rx = c by back-substitution
% The backslash \ solves the system -- efficient for triangular R

% Method 2: MATLAB's backslash (does QR internally)
x2 = A \ b

% Both give the same answer
norm(x - x2)   % ~0
```

---

# Part 7: Singular Value Decomposition (Section 7.8)

---

## 7.1 What Is SVD?

The **Singular Value Decomposition** (SVD) is the most powerful matrix factorization in applied linear algebra. Every matrix — rectangular or square, any size — can be factored as:

A = U Σ Vᵀ

Where:
- **U** is an m×m orthogonal matrix (left singular vectors)
- **Σ** (Sigma) is an m×n diagonal-ish matrix with non-negative numbers on the diagonal (singular values), sorted from largest to smallest
- **Vᵀ** is the transpose of an n×n orthogonal matrix (right singular vectors)

### What Do the Pieces Mean?

Think of multiplying a vector by A in three steps:

1. **Vᵀ** rotates/reflects the input
2. **Σ** stretches along the coordinate axes by the singular values
3. **U** rotates/reflects the result

So A is really just: rotate, then stretch, then rotate again. Every linear transformation can be decomposed this way.

The **singular values** (diagonal of Σ) tell you how much stretching happens in each direction. A large singular value means A stretches a lot in that direction. A zero singular value means A collapses that direction to nothing.

### In MATLAB

```matlab
A = [1 2 3;
     4 5 6];

[U, S, V] = svd(A)

% U is 2x2 orthogonal
U' * U   % identity

% V is 3x3 orthogonal
V' * V   % identity

% S is 2x3 with singular values on diagonal
S

% Singular values: diag(S)
sigma = diag(S)   % sorted largest to smallest

% Verify A = U*S*V'
norm(A - U*S*V')   % ~0

% The singular values tell you the "stretch" in each direction
```

---

## 7.2 What Singular Values Tell You

```matlab
A = [3 0;
     0 2];

[U, S, V] = svd(A)
% Singular values: 3 and 2
% This matrix just stretches by 3 in x and 2 in y -- no rotation

% For a more interesting matrix
B = [1 1;
     0 1];

[U, S, V] = svd(B)
% The singular values tell you how much B stretches in its principal directions

% Condition number: ratio of largest to smallest singular value
% High condition number means the matrix is nearly singular
cond(B)
max(diag(S)) / min(diag(S))   % same thing

% The induced L2 norm of a matrix = largest singular value
norm(B, 2)
max(diag(S))   % same
```

---

## 7.3 Low-Rank Approximation

The most important application of SVD: approximating a matrix with a simpler one.

The rank-k approximation keeps only the k largest singular values:

Aₖ = σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + ... + σₖuₖvₖᵀ

This is the best possible rank-k approximation in the L2 sense (Eckart-Young theorem).

```matlab
% Create a matrix
A = [4 3 0 0;
     3 4 0 0;
     0 0 5 2;
     0 0 2 5];

[U, S, V] = svd(A);

% Rank-1 approximation
A1 = S(1,1) * U(:,1) * V(:,1)';

% Rank-2 approximation
A2 = U(:,1:2) * S(1:2,1:2) * V(:,1:2)';

% Errors
norm(A - A1, 'fro')   % larger error
norm(A - A2, 'fro')   % smaller error

% The error of the rank-k approximation equals the (k+1)th singular value
% This is the Eckart-Young theorem
norm(A - A1, 'fro') - S(2,2)   % ~0
norm(A - A2, 'fro') - S(3,3)   % ~0
```

---

# Part 8: Pseudoinverses (Section 8.1)

---

## 8.1 When Regular Inverses Fail

A regular inverse A⁻¹ only exists when A is square AND non-singular (full rank). Most real matrices are neither — they might be rectangular (more rows than columns, or more columns than rows) or they might be rank-deficient.

The **pseudoinverse** A⁺ (also written A†) is defined for any matrix and gives the "best possible inverse" in the least-squares sense.

### The Formula Using SVD

If A = UΣVᵀ, then:

A⁺ = V Σ⁺ Uᵀ

Where Σ⁺ is formed by taking the reciprocal of each non-zero singular value (and leaving zeros as zeros), then transposing.

### What Does the Pseudoinverse Do?

For a system Ax = b:
- If an exact solution exists, A⁺b gives it
- If no exact solution exists (overdetermined system), A⁺b gives the least-squares solution — the x that minimizes ‖Ax − b‖

### In MATLAB

```matlab
% Square, full rank matrix -- pseudoinverse = regular inverse
A = [2 1; 1 3];
norm(pinv(A) - inv(A))   % ~0, they are the same

% Rectangular matrix (overdetermined -- more rows than columns)
A = [1 1;
     1 2;
     1 3];
b = [1; 2; 4];

% No exact solution exists -- the system is overdetermined
% pseudoinverse gives least squares solution
x = pinv(A) * b

% Verify this is the best we can do
% Any other x_try will give larger norm(A*x_try - b)
norm(A*x - b)   % the minimum possible residual

% Underdetermined (more columns than rows) -- infinitely many solutions
A2 = [1 2 3;
      4 5 6];
b2 = [1; 2];

x2 = pinv(A2) * b2   % minimum norm solution
norm(x2)             % smallest possible norm among all solutions
```

---

# Part 9: Complex Inner Product Spaces (Section 8.3)

---

## 9.1 Why Complex Numbers Change the Inner Product

For real vectors, the inner product ⟨u, v⟩ = u₁v₁ + u₂v₂ + ... works fine. But for complex vectors, this fails Rule 3 (positive definiteness).

Consider v = (i) where i = √−1:
⟨v, v⟩ = i · i = i² = −1

That is negative! A norm cannot be negative.

The fix: conjugate the first argument.

⟨u, v⟩ = ū₁v₁ + ū₂v₂ + ... + ūₙvₙ

Where ū means the complex conjugate of u (replace every i with −i).

Now ⟨v, v⟩ = v̄₁v₁ = |v₁|² which is always non-negative. ✓

### Canonical Example — Worked by Hand

**u** = (1+i, 2), **v** = (3, 1−i)

⟨u, v⟩ = (1+i)̄ · 3 + 2̄ · (1−i)
        = (1−i) · 3 + 2 · (1−i)
        = (3 − 3i) + (2 − 2i)
        = 5 − 5i

### In MATLAB

```matlab
u = [1+1i; 2];
v = [3; 1-1i];

% Complex inner product -- MATLAB's dot() conjugates the FIRST argument
ip = dot(u, v)
% = conj(1+1i)*3 + conj(2)*(1-1i)
% = (1-1i)*3 + 2*(1-1i)
% = (3-3i) + (2-2i)
% = 5-5i

% You can also write it as
ip2 = u' * v
% u' in MATLAB is the conjugate transpose (Hermitian transpose)
% Same as dot(u,v) for column vectors

% Norm of complex vector
n = norm(u)
% = sqrt(|1+i|^2 + |2|^2)
% = sqrt(2 + 4)
% = sqrt(6)

% Verify: norm squared = inner product with itself
dot(u, u)   % = 6, which is real and positive ✓
double(dot(u,u))

% Note: for real vectors, u' is just the transpose
% For complex vectors, u' is the conjugate transpose -- these are different!
u_real = [1; 2; 3];
u_complex = [1+2i; 3; -1i];

u_real'        % just transposes: [1, 2, 3]
u_complex'     % conjugate transposes: [1-2i, 3, 1i]
```

---

# Part 10: Least-Squares Approximation (Section 8.4)

---

## 10.1 The Problem That Least Squares Solves

You have a system Ax = b with more equations than unknowns. Most of the time, no exact solution exists. The equations contradict each other.

Example: you measure the height of an object three times and get 5.1, 5.0, and 4.9 meters. The "system" is:
x = 5.1
x = 5.0
x = 4.9

No single x satisfies all three. But x = 5.0 is the least-squares solution — it minimizes the total squared error.

**Least squares finds the x that minimizes ‖Ax − b‖²**

### The Normal Equations

The least-squares solution satisfies:

AᵀAx = Aᵀb

These are called the **normal equations**. The solution is:

x = (AᵀA)⁻¹Aᵀb

(AᵀA)⁻¹Aᵀ is exactly the pseudoinverse when A has full column rank.

### Canonical Example: Fitting a Line to Data

You have data points: (1, 2.1), (2, 3.9), (3, 6.2), (4, 7.8), (5, 10.1)

You want to fit y = a + bx (a line). This gives five equations in two unknowns:

a + b(1) = 2.1
a + b(2) = 3.9
a + b(3) = 6.2
a + b(4) = 7.8
a + b(5) = 10.1

In matrix form: Ax = b where x = (a, b)

```
A = [1 1]     b = [2.1]
    [1 2]         [3.9]
    [1 3]         [6.2]
    [1 4]         [7.8]
    [1 5]         [10.1]
```

### In MATLAB

```matlab
% Data points
x_data = [1; 2; 3; 4; 5];
y_data = [2.1; 3.9; 6.2; 7.8; 10.1];

% Build A: first column all 1s (for intercept), second column is x values
A = [ones(5,1), x_data];

% Method 1: Normal equations explicitly
% x = (A'A)^{-1} A'b
coeffs_normal = (A'*A) \ (A'*y_data)
% coeffs_normal(1) = intercept a
% coeffs_normal(2) = slope b

% Method 2: MATLAB's backslash (numerically more stable, uses QR internally)
coeffs = A \ y_data
% Same result, better numerical stability

% Method 3: Using pseudoinverse
coeffs_pinv = pinv(A) * y_data
% Same result

fprintf('Line: y = %.4f + %.4f*x\n', coeffs(1), coeffs(2))

% How good is the fit?
y_predicted = A * coeffs;
residuals = y_data - y_predicted;
total_error = norm(residuals)   % the minimum possible error

% Plot it
figure;
plot(x_data, y_data, 'ro', 'MarkerSize', 10, 'LineWidth', 2);
hold on;
x_line = linspace(0, 6, 100)';
y_line = coeffs(1) + coeffs(2)*x_line;
plot(x_line, y_line, 'b-', 'LineWidth', 2);
xlabel('x'); ylabel('y');
title(sprintf('Least Squares Fit: y = %.2f + %.2f*x', coeffs(1), coeffs(2)));
legend('Data points', 'Least squares line');
grid on;
```

---

## 10.2 Fitting a Polynomial to Data

The same framework extends to fitting any polynomial. For a degree-d polynomial y = a₀ + a₁x + a₂x² + ... + aₐxᵈ, build the **Vandermonde matrix**:

```matlab
% Data points
x_data = [-2; -1; 0; 1; 2];
y_data = [3.8; 1.1; 0.2; 1.0; 4.1];

% Fit a degree-2 polynomial: y = a0 + a1*x + a2*x^2
A = [ones(5,1), x_data, x_data.^2];
% First column: x^0 = 1
% Second column: x^1
% Third column: x^2

coeffs = A \ y_data
% coeffs(1) = a0 (constant)
% coeffs(2) = a1 (linear)
% coeffs(3) = a2 (quadratic)

fprintf('Polynomial: y = %.4f + %.4f*x + %.4f*x^2\n', ...
        coeffs(1), coeffs(2), coeffs(3))

% Plot
x_line = linspace(-3, 3, 100)';
y_line = coeffs(1) + coeffs(2)*x_line + coeffs(3)*x_line.^2;

figure;
plot(x_data, y_data, 'ro', 'MarkerSize', 10);
hold on;
plot(x_line, y_line, 'b-', 'LineWidth', 2);
title('Least Squares Polynomial Fit');
grid on;
```

---

## 10.3 Why Not Just Use Higher Degree Polynomials?

You might think: if 5 data points fit a line with error, why not use a degree-4 polynomial that passes through all 5 points exactly?

This is called **overfitting**. The polynomial memorizes the noise in your data and performs terribly on new data. Least squares with a low-degree polynomial finds the underlying trend.

```matlab
% 5 data points
x_data = [-2; -1; 0; 1; 2];
y_data = [3.8; 1.1; 0.2; 1.0; 4.1];

% Degree-4 polynomial: passes through all points exactly
A4 = [ones(5,1), x_data, x_data.^2, x_data.^3, x_data.^4];
coeffs4 = A4 \ y_data;
norm(A4*coeffs4 - y_data)   % ~0, perfect fit

% But evaluated at new points x=1.5, x=-1.5:
x_new = [1.5; -1.5];
A4_new = [ones(2,1), x_new, x_new.^2, x_new.^3, x_new.^4];
A2_new = [ones(2,1), x_new, x_new.^2];

coeffs2 = [ones(5,1), x_data, x_data.^2] \ y_data;

y_pred4 = A4_new * coeffs4   % degree-4 prediction -- can be wild
y_pred2 = A2_new * coeffs2   % degree-2 prediction -- more reasonable
```

---

# Quick Reference: Every Function You Need

```matlab
%% INNER PRODUCTS
dot(u, v)                     % standard inner product (real vectors)
u' * v                        % same (also works for complex -- conjugates u)
sum(w .* u .* v)              % weighted inner product
int(f*g, x, a, b)             % integral inner product (symbolic)

%% NORMS -- VECTORS
norm(v)          % L2 norm (default)
norm(v, 1)       % L1 norm
norm(v, 2)       % L2 norm (explicit)
norm(v, inf)     % L-infinity norm

%% NORMS -- MATRICES
norm(A)          % induced L2 norm = largest singular value
norm(A, 1)       % induced L1 norm = max column sum
norm(A, inf)     % induced L-inf norm = max row sum
norm(A, 'fro')   % Frobenius norm = sqrt(sum of all entries squared)

%% DISTANCE
norm(u - v)           % L2 distance
norm(u - v, 1)        % L1 distance
norm(u - v, inf)      % Linf distance
sqrt(int((f-g)^2, x, a, b))  % integral distance (symbolic)

%% ORTHOGONALITY
dot(u, v) == 0        % check if two vectors are orthogonal
Q' * Q                % should be I for orthogonal matrix

%% SUBSPACES
null(A)               % null space of A (kernel)
orth(A)               % orthonormal basis for column space of A
null(A')              % orthogonal complement of column space

%% FACTORIZATIONS
[Q, R] = qr(A)        % QR factorization
[U, S, V] = svd(A)   % Singular Value Decomposition
diag(S)               % extract singular values
pinv(A)               % Moore-Penrose pseudoinverse

%% SOLVING SYSTEMS
A \ b                 % solve Ax=b, or least squares if overdetermined
pinv(A) * b           % same, explicit pseudoinverse form
(A'*A) \ (A'*b)       % normal equations (numerically less stable)

%% SYMBOLIC (for integrals)
syms x                % declare x as symbolic variable
int(expr, x, a, b)    % definite integral of expr from a to b
double(result)        % convert symbolic result to decimal
simplify(expr)        % simplify symbolic expression
expand(expr)          % expand symbolic expression
```

---

# The Mental Checklist for Any Problem

When you see a problem, ask these questions in order:

**1. What kind of objects am I working with?**
- Tuples of numbers → use vector formulas directly
- Polynomials with coefficients → extract coefficients, use vector formulas
- Functions over an interval → use integral formulas with syms

**2. What inner product is being used?**
- Standard (no specification) → dot product
- Weighted → sum(w .* u .* v)
- Integral over [a,b] → int(f*g, x, a, b)

**3. What is being asked?**
- Size of one object → norm
- Comparison of two objects → distance = norm of difference
- Relationship of two objects → inner product
- Are they perpendicular? → check if inner product = 0
- Best approximation? → least squares with backslash

**4. Which formula?**
Look it up in the reference section above.

**5. Translate to MATLAB.**
Pick the right function and run it.

Every single problem in your course is some combination of these five steps. There are no exceptions.