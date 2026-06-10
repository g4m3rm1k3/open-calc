# Computational Mathematics — LAB 06 — SymPy: Symbolic Mathematics

**Prerequisites:** LAB-01 (NumPy). Basic algebra — you know what x²+2x+1 means.
**Environment:** Python 3.10+ | pip install sympy | python lab06.py
**Time:** 60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In Python, type `0.1 + 0.2`. What do you get? What should the answer be? Why is it wrong?
> 2. If `x = 5` assigns the number 5 to `x`, what would it mean to have a variable that holds the *symbol* `x` — not any specific number, just the unknown?
> 3. *(Prediction)* When you factor `x² - 1` by hand, you get `(x-1)(x+1)`. Do you think a computer can do that? What would it even mean for a program to "factor" something?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A script that explores exact symbolic mathematics — the kind a human mathematician does on paper, not the approximate number-crunching your calculator does.

```
=== The floating point problem ===
0.1 + 0.2 = 0.30000000000000004    ← Python float, WRONG
1/10 + 2/10 = 3/10                 ← SymPy exact, correct

=== Symbols and expressions ===
Expression: x**2 + 2*x + 1
Factored:   (x + 1)**2

=== Solving equations ===
x**2 - 5*x + 6 = 0
Solutions: [2, 3]

=== Derivatives ===
f(x) = x**3 + 2*x**2 - 5*x + 3
f'(x) = 3*x**2 + 4*x - 5
f''(x) = 6*x + 4

=== Integration ===
∫ x**2 dx = x**3/3
∫₀¹ x**2 dx = 1/3   (exact fraction, not 0.3333...)

=== Linear algebra (symbolic) ===
Exact solution to Ax = b: {x: 2, y: 1}
Determinant: -36
Eigenvalues: {-4: 1, 2: 1, 3: 1}
```

---

## The Core Problem: Numbers Are Lies

Before writing a single line of SymPy, you need to understand WHY symbolic math exists.

Open a Python REPL and type this:

```python
print(0.1 + 0.2)    # expected: 0.3
```

You get: `0.30000000000000004`

That is wrong. Not "close enough" — wrong. The number `0.1` cannot be represented exactly in binary floating point (just like `1/3` cannot be represented exactly in decimal). Your computer stores an approximation, and those tiny errors accumulate.

For most engineering calculations this does not matter. But for:
- Solving equations algebraically
- Verifying a factored form is correct
- Computing eigenvalues exactly (not approximately)
- Producing homework answers that are fractions, not decimals

...you need exact computation. That is what SymPy does.

**SymPy treats math the way a human mathematician treats it.** When you write `x² + 2x + 1`, a mathematician does not evaluate it at `x=5` and get a number. They hold the expression as-is, manipulate it symbolically, and only substitute numbers when instructed. SymPy works the same way.

---

## Setup

Create `lab06.py` and start with:

```python
# lab06.py — SymPy Symbolic Mathematics
# Run with: python lab06.py

import sympy as sp    # import the entire sympy library under the alias sp

# Tell SymPy to display math nicely in the terminal
sp.init_printing(use_unicode=True)    # enables pretty-printed output with Unicode symbols
```

---

## Section 1: Symbols and Expressions

### The concept: what is a "symbol"?

In regular Python, every variable holds a VALUE:

```python
x = 5        # x stores the integer 5
x + 3        # evaluates immediately to 8
```

In SymPy, a symbol holds an UNKNOWN — a placeholder that stands in for a mathematical variable, the same way `x` works in an algebra problem:

```python
x = sp.Symbol('x')   # x is now the mathematical unknown "x"
x + 3                # does NOT evaluate — it stays as the expression x + 3
```

This is the fundamental shift. SymPy defers evaluation. It builds expression trees and manipulates them algebraically.

### Step 1-A: Create your first symbol and expression

Add this to `lab06.py`:

```python
print("\n=== Section 1: Symbols and Expressions ===")

# Create a single symbol — the string 'x' is the display name
x = sp.Symbol('x')

# Build an expression — Python sees x**2 + 2*x + 1 but does NOT evaluate it
# It creates an expression tree: Add(Pow(x,2), Mul(2,x), 1)
expr = x**2 + 2*x + 1

print("Expression:", expr)          # x**2 + 2*x + 1
print("Type:", type(expr))          # <class 'sympy.core.add.Add'>

# SymPy knows how to factor this — it recognizes the pattern (a+b)^2
factored = sp.factor(expr)
print("Factored:", factored)        # (x + 1)**2
```

**RUN IT:**
```
python lab06.py
```

**Expected output:**
```
=== Section 1: Symbols and Expressions ===
Expression: x**2 + 2*x + 1
Type: <class 'sympy.core.add.Add'>
Factored: (x + 1)**2
```

If you see `(x + 1)**2` — SymPy factored a quadratic exactly. A floating-point library cannot do this.

### Step 1-B: Multiple symbols and constrained symbols

```python
# Create multiple symbols at once — returns a tuple
x, y, z = sp.symbols('x y z')    # space-separated string, unpacked into three variables

# Build a multi-variable expression
expr2 = x**2 + y**2 + z**2
print("\nMulti-variable expression:", expr2)    # x**2 + y**2 + z**2

# Constrained symbols — tell SymPy extra facts about the variable
# This changes how simplification and solve() behave
a = sp.Symbol('a', positive=True)     # SymPy knows a > 0
b = sp.Symbol('b', integer=True)      # SymPy knows b is an integer
n = sp.Symbol('n', real=True)         # SymPy knows n is real (not complex)

# With a positive assumption, SymPy simplifies sqrt(a**2) correctly
print("sqrt(a**2) with a>0:", sp.sqrt(a**2))   # a  (not Abs(a), because a is positive)
print("sqrt(x**2) without assumption:", sp.sqrt(x**2))  # Abs(x) — could be negative
```

**RUN IT.**

**Expected output:**
```
Multi-variable expression: x**2 + y**2 + z**2
sqrt(a**2) with a>0: a
sqrt(x**2) without assumption: Abs(x)
```

The second result shows why assumptions matter: SymPy does not assume `x` is positive unless you say so.

---

## Section 2: Simplification and Manipulation

### The concept: algebraic manipulation

Once you have an expression, you want to reshape it — expand brackets, collect terms, substitute values. SymPy provides a toolkit of operations that work like pencil-and-paper algebra.

### Step 2-A: Expand, factor, simplify

```python
print("\n=== Section 2: Simplification and Manipulation ===")

x = sp.Symbol('x')

# expand() multiplies out brackets — the reverse of factor()
expanded = sp.expand((x + 1)**3)    # applies (a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3
print("(x+1)^3 expanded:", expanded)    # x**3 + 3*x**2 + 3*x + 1

# factor() reverses expand — finds the factored form
factored = sp.factor(x**2 - 1)          # difference of squares: (x-1)(x+1)
print("x^2 - 1 factored:", factored)    # (x - 1)*(x + 1)

# simplify() applies multiple rules to find the "simplest" form
# Use when you're not sure which specific operation you need
messy = (x**2 - 1) / (x - 1)           # this should simplify to x + 1 (when x != 1)
simplified = sp.simplify(messy)
print("(x^2-1)/(x-1) simplified:", simplified)    # x + 1
```

**RUN IT.**

**Expected output:**
```
=== Section 2: Simplification and Manipulation ===
(x+1)^3 expanded: x**3 + 3*x**2 + 3*x + 1
x^2 - 1 factored: (x - 1)*(x + 1)
(x^2-1)/(x-1) simplified: x + 1
```

### Step 2-B: Substitution and evaluation

```python
# subs() replaces a symbol with a value (or another expression)
# This is like plugging a number into a formula — but stays symbolic until evalf()
x = sp.Symbol('x')
expr = x**2 + 2*x + 1

# Substitute x = 3 — SymPy computes 3**2 + 2*3 + 1 = 16 exactly
result_at_3 = expr.subs(x, 3)
print("expr at x=3:", result_at_3)    # 16  (exact integer)

# Substitute x = 1/3 — stays as an exact fraction, not 0.111...
result_frac = expr.subs(x, sp.Rational(1, 3))  # Rational() creates an exact fraction
print("expr at x=1/3:", result_frac)            # 25/9  (exact fraction)

# evalf() converts to a decimal — use ONLY when you want the numerical answer
# The argument is the number of decimal places
print("25/9 as decimal:", sp.Rational(25, 9).evalf())         # 2.77777777777778
print("pi to 50 places:", sp.pi.evalf(50))                    # 3.14159265358979...
```

**RUN IT.**

**Expected output:**
```
expr at x=3: 16
expr at x=1/3: 25/9
25/9 as decimal: 2.77777777777778
pi to 50 places: 3.14159265358979323846264338327950288419716939937510
```

Notice that `pi` is a SymPy object, not the float `3.14159...`. It stays exact until you call `evalf()`.

### Step 2-C: Collecting terms

```python
# collect() groups terms by powers of a variable — useful for reading polynomials
x, y = sp.symbols('x y')

# This expression has x terms scattered around — collect organizes them by power
scattered = x*y + x**2*y + x + x**2 + y + 1
collected = sp.collect(scattered, x)    # group by powers of x: x^2(...) + x(...) + (...)
print("Collected by x:", collected)     # x**2*(y + 1) + x*(y + 1) + y + 1
```

**RUN IT.**

**Expected output:**
```
Collected by x: x**2*(y + 1) + x*(y + 1) + y + 1
```

---

## Section 3: Solving Equations

### The concept: exact roots vs approximate roots

NumPy's `np.roots([1, -5, 6])` gives you `[3.0, 2.0]` — numerical approximations that happen to be exact here, but will drift for harder problems. SymPy's `sp.solve()` derives the exact algebraic answer.

For `x² - 5x + 6 = 0`, SymPy factors the left side, sets each factor to zero, and returns `[2, 3]` as exact integers — not floats. For an equation whose roots are irrational (like `x² - 2 = 0`), SymPy returns `[-sqrt(2), sqrt(2)]` — the exact symbolic values.

### Step 3-A: Solve a single polynomial

```python
print("\n=== Section 3: Solving Equations ===")

x = sp.Symbol('x')

# solve(expr, variable) finds the values of variable that make expr = 0
# Note: you pass the expression equal to zero, not the full equation object
solutions = sp.solve(x**2 - 5*x + 6, x)    # solves x^2 - 5x + 6 = 0
print("x^2 - 5x + 6 = 0:", solutions)       # [2, 3]

# Irrational roots — returned as exact symbols, not decimals
irrational = sp.solve(x**2 - 2, x)
print("x^2 - 2 = 0:", irrational)           # [-sqrt(2), sqrt(2)]

# Complex roots — SymPy handles these too
complex_roots = sp.solve(x**2 + 1, x)
print("x^2 + 1 = 0:", complex_roots)        # [-I, I]  (I is the imaginary unit)

# Quartic — SymPy still gives exact answer
quartic = sp.solve(x**4 - 5*x**2 + 4, x)
print("x^4 - 5x^2 + 4 = 0:", quartic)      # [-2, -1, 1, 2]
```

**RUN IT.**

**Expected output:**
```
=== Section 3: Solving Equations ===
x^2 - 5x + 6 = 0: [2, 3]
x^2 - 2 = 0: [-sqrt(2), sqrt(2)]
x^2 + 1 = 0: [-I, I]
x^4 - 5x^2 + 4 = 0: [-2, -1, 1, 2]
```

### Step 3-B: Systems of equations — the symbolic Gaussian elimination

This connects directly to LAB-03. When you solved `2x + y = 5, x - y = 1` by Gaussian elimination, you were doing the same thing SymPy does — just by hand. SymPy's `solve()` handles multiple equations by performing symbolic row reduction internally.

```python
# Solve a 2x2 linear system: 2x + y = 5, x - y = 1
x, y = sp.symbols('x y')

# Pass a list of equations (each one written as expression = 0 form)
# and a list of variables to solve for
system_2x2 = [
    2*x + y - 5,    # represents 2x + y = 5  (moved everything to left side)
    x - y - 1       # represents x - y = 1
]
sol_2x2 = sp.solve(system_2x2, [x, y])    # returns a dict: {x: value, y: value}
print("2x+y=5, x-y=1:", sol_2x2)          # {x: 2, y: 1}  — exact integers

# Verify manually that the solution is correct
print("Verify 2x+y:", 2*sol_2x2[x] + sol_2x2[y], "== 5?")   # 5
print("Verify x-y:", sol_2x2[x] - sol_2x2[y], "== 1?")       # 1
```

**RUN IT.**

**Expected output:**
```
2x+y=5, x-y=1: {x: 2, y: 1}
Verify 2x+y: 5 == 5?
Verify x-y: 1 == 1?
```

### Step 3-C: linsolve for linear systems (exact fractions)

```python
# linsolve() is specialized for linear systems — handles underdetermined and
# overdetermined systems gracefully, always returns exact fractions
x, y, z = sp.symbols('x y z')

# 3x3 linear system
system_3x3 = [
    2*x + y + z - 9,     # 2x + y + z = 9
    x - 3*y + z + 2,     # x - 3y + z = -2
    3*x + y - 2*z - 4    # 3x + y - 2z = 4
]

# linsolve takes the system and the variable order
sol_3x3 = sp.linsolve(system_3x3, x, y, z)
print("3x3 system:", sol_3x3)    # {(2, 1, 4)}  — a FiniteSet of solution tuples

# Extract the values from the FiniteSet
sol_tuple = list(sol_3x3)[0]     # get the single solution tuple
print(f"x={sol_tuple[0]}, y={sol_tuple[1]}, z={sol_tuple[2]}")  # x=2, y=1, z=4
```

**RUN IT.**

**Expected output:**
```
3x3 system: {(2, 1, 4)}
x=2, y=1, z=4
```

---

## Section 4: Derivatives

### The concept: symbolic differentiation

When you differentiate `f(x) = x³ + 2x² - 5x + 3` by hand, you apply the power rule term by term: `f'(x) = 3x² + 4x - 5`. SymPy applies the same rules — power rule, chain rule, product rule — automatically, to any expression you give it.

This is NOT numerical differentiation (which approximates `(f(x+h) - f(x))/h`). SymPy computes the exact derivative as an algebraic expression.

### Step 4-A: Basic derivatives

```python
print("\n=== Section 4: Derivatives ===")

x = sp.Symbol('x')

# Define a polynomial
f = x**3 + 2*x**2 - 5*x + 3

# diff(expression, variable) computes the derivative with respect to that variable
df = sp.diff(f, x)          # first derivative: power rule on each term
print("f(x) =", f)          # x**3 + 2*x**2 - 5*x + 3
print("f'(x) =", df)        # 3*x**2 + 4*x - 5

# Second derivative: diff with a third argument for the order
d2f = sp.diff(f, x, 2)      # differentiate f with respect to x, twice
print("f''(x) =", d2f)      # 6*x + 4

# Third derivative
d3f = sp.diff(f, x, 3)      # third derivative of a cubic is a constant
print("f'''(x) =", d3f)     # 6
```

**RUN IT.**

**Expected output:**
```
=== Section 4: Derivatives ===
f(x) = x**3 + 2*x**2 - 5*x + 3
f'(x) = 3*x**2 + 4*x - 5
f''(x) = 6*x + 4
f'''(x) = 6
```

### Step 4-B: Chain rule and product rule (applied automatically)

```python
# SymPy applies calculus rules without you specifying which rule to use.
# It identifies the structure of the expression and picks the right rule.

# Chain rule: d/dx[sin(x^2)] — outer function is sin, inner is x^2
# By chain rule: cos(x^2) * 2x
chain_result = sp.diff(sp.sin(x**2), x)
print("d/dx[sin(x^2)]:", chain_result)       # 2*x*cos(x**2)

# Product rule: d/dx[x * e^x] — two functions multiplied together
# By product rule: 1*e^x + x*e^x = e^x(x + 1)
product_result = sp.diff(x * sp.exp(x), x)
print("d/dx[x*e^x]:", product_result)        # x*exp(x) + exp(x)

# Simplify the product rule result to see the factored form
print("Simplified:", sp.factor(product_result))   # (x + 1)*exp(x)

# Quotient rule: d/dx[sin(x)/x]
quotient_result = sp.diff(sp.sin(x) / x, x)
print("d/dx[sin(x)/x]:", sp.simplify(quotient_result))  # (x*cos(x) - sin(x))/x**2
```

**RUN IT.**

**Expected output:**
```
d/dx[sin(x^2)]: 2*x*cos(x**2)
d/dx[x*e^x]: x*exp(x) + exp(x)
Simplified: (x + 1)*exp(x)
d/dx[sin(x)/x]: (x*cos(x) - sin(x))/x**2
```

Use this to verify your calculus homework — compute the derivative yourself, then check with SymPy.

---

## Section 5: Integration

### The concept: antiderivatives vs definite integrals

`sp.integrate(f, x)` finds the antiderivative — the function whose derivative is `f`. It does NOT add a constant of integration (SymPy omits the `+ C` by convention).

`sp.integrate(f, (x, a, b))` computes a definite integral from `a` to `b` — an exact value, often a fraction.

### Step 5-A: Indefinite and definite integrals

```python
print("\n=== Section 5: Integration ===")

x = sp.Symbol('x')

# Indefinite integral — finds the antiderivative
indef = sp.integrate(x**2, x)          # reverse of differentiation: x^3/3
print("∫ x^2 dx =", indef)             # x**3/3

# Verify: take the derivative of the result — should get back x^2
check = sp.diff(indef, x)
print("d/dx[x^3/3] =", check)          # x**2  ← confirms the integral is correct

# Definite integral — exact evaluation from 0 to 1
definite = sp.integrate(x**2, (x, 0, 1))    # tuple (variable, lower, upper)
print("∫₀¹ x^2 dx =", definite)             # 1/3  — exact fraction, not 0.333...

# Compare with floating point
print("As decimal:", float(definite))        # 0.3333333333333333

# Trigonometric integral
trig_indef = sp.integrate(sp.sin(x), x)
print("∫ sin(x) dx =", trig_indef)           # -cos(x)

trig_def = sp.integrate(sp.sin(x), (x, 0, sp.pi))  # pi is exact
print("∫₀^π sin(x) dx =", trig_def)                 # 2  (exact integer)
```

**RUN IT.**

**Expected output:**
```
=== Section 5: Integration ===
∫ x^2 dx = x**3/3
d/dx[x^3/3] = x**2
∫₀¹ x^2 dx = 1/3
As decimal: 0.3333333333333333
∫ sin(x) dx = -cos(x)
∫₀^π sin(x) dx = 2
```

The definite integral of `sin(x)` from `0` to `π` is exactly `2` — a clean integer. NumPy would give you `2.0000000000000004` due to floating point error in evaluating `cos(0) - cos(π)`.

---

## Section 6: Linear Algebra in SymPy

### The concept: exact vs approximate linear algebra

NumPy's `np.linalg.solve()` is fast and practical — but it uses floating point. For a system with integer coefficients, the exact answer might be `x = 7/3`, but NumPy returns `2.3333333333333335`. More importantly, eigenvalue calculations are inherently approximate in NumPy.

SymPy's matrix tools work with exact arithmetic throughout. Every entry stays as an exact integer or fraction, and the final answer is exact.

This section connects to everything you have done in the linear algebra part of the course.

### Step 6-A: Create a SymPy matrix and solve Ax = b

```python
print("\n=== Section 6: Symbolic Linear Algebra ===")

# sp.Matrix() takes a list of rows — each row is a Python list
# All entries are stored as exact SymPy numbers (integers, rationals, or expressions)
A = sp.Matrix([
    [2,  1,  1],    # row 1 of the coefficient matrix
    [1, -3,  1],    # row 2
    [3,  1, -2]     # row 3
])

b = sp.Matrix([9, -2, 4])    # column vector: right-hand side of Ax = b

# A.solve(b) uses exact arithmetic — no floating point anywhere
# The result is a column vector of the exact solution
x_exact = A.solve(b)
print("Exact solution Ax = b:")
sp.pprint(x_exact)    # pretty-print as a column vector
```

**RUN IT.**

**Expected output:**
```
=== Section 6: Symbolic Linear Algebra ===
Exact solution Ax = b:
⎡2⎤
⎢ ⎥
⎢1⎥
⎢ ⎥
⎣4⎦
```

(Your terminal may show `[2, 1, 4]` if Unicode is not enabled — that is fine.)

### Step 6-B: Determinant and RREF

```python
# det() computes the determinant as an exact integer or fraction
det_A = A.det()
print("\nDeterminant of A:", det_A)    # -36  (exact integer)

# RREF (Reduced Row Echelon Form) — the end state of Gaussian elimination
# row_join() appends b as a new column to create the augmented matrix [A|b]
A_aug = A.row_join(b)              # augmented matrix [A | b]
rref_matrix, pivot_cols = A_aug.rref()    # returns (rref form, tuple of pivot column indices)

print("\nAugmented matrix [A|b]:")
sp.pprint(A_aug)

print("\nRREF of [A|b]:")
sp.pprint(rref_matrix)             # identity matrix on left, solution on right
print("Pivot columns:", pivot_cols)    # (0, 1, 2) — all three variables have pivots
```

**RUN IT.**

**Expected output:**
```
Determinant of A: -36

Augmented matrix [A|b]:
⎡2  1   1  9 ⎤
⎢             ⎥
⎢1  -3  1  -2⎥
⎢             ⎥
⎣3  1  -2  4 ⎦

RREF of [A|b]:
⎡1  0  0  2⎤
⎢           ⎥
⎢0  1  0  1⎥
⎢           ⎥
⎣0  0  1  4⎦
Pivot columns: (0, 1, 2)
```

The RREF has the identity matrix on the left — that is what fully solved looks like. Solution is read off the right column: x=2, y=1, z=4.

### Step 6-C: Eigenvalues and eigenvectors

### The concept: characteristic polynomial

The eigenvalues of a matrix `A` are the values of `λ` where `det(A - λI) = 0`. Expanding that determinant gives the characteristic polynomial. SymPy can do all of this symbolically.

```python
# Create a lambda symbol for the characteristic polynomial
lam = sp.Symbol('lambda')

# Characteristic polynomial: det(A - λI)
# sp.eye(3) is the 3×3 identity matrix
char_poly = (A - lam * sp.eye(3)).det()    # expand the determinant symbolically
char_poly_expanded = sp.expand(char_poly)  # expand to standard polynomial form

print("\nCharacteristic polynomial det(A - λI):")
sp.pprint(char_poly_expanded)    # -lambda**3 + ... + constant

# eigenvals() returns a dict: {eigenvalue: algebraic_multiplicity}
# These are EXACT — not floating point approximations
eigenvalues = A.eigenvals()
print("\nEigenvalues (exact):", eigenvalues)    # e.g. {-4: 1, 2: 1, 3: 1}

# eigenvects() returns a list of tuples: (eigenvalue, multiplicity, [basis vectors])
# Each eigenvector is an exact rational column vector
eigenvectors = A.eigenvects()
print("\nEigenvectors:")
for eigenval, multiplicity, vectors in eigenvectors:    # unpack each tuple
    print(f"  λ = {eigenval} (multiplicity {multiplicity}):")
    for v in vectors:        # vectors is a list (one per dimension of eigenspace)
        sp.pprint(v)         # pretty-print the eigenvector
```

**RUN IT.**

**Expected output (values depend on matrix A):**
```
Characteristic polynomial det(A - λI):
...polynomial expression...

Eigenvalues (exact): {-4: 1, 2: 1, 3: 1}  (or similar)

Eigenvectors:
  λ = -4 (multiplicity 1):
  ...column vector...
  λ = 2 (multiplicity 1):
  ...column vector...
  λ = 3 (multiplicity 1):
  ...column vector...
```

Note: the exact eigenvalues for the matrix above may involve irrational numbers — SymPy will show them as exact radical expressions, not decimals.

---

## Section 7: Pretty Printing and LaTeX Output

### The concept: readable math output

SymPy expressions can be printed three ways:
1. `print(expr)` — plain text: `x**2 + 2*x + 1`
2. `sp.pprint(expr)` — Unicode "pretty print": renders fractions, exponents, integrals visually
3. `sp.latex(expr)` — LaTeX string: paste directly into your homework or a `.tex` file

### Step 7-A: All three output modes

```python
print("\n=== Section 7: Output Formats ===")

x = sp.Symbol('x')
f = x**3 / (x**2 - 1)    # a rational expression

# Mode 1: plain print — safe for logging, always works
print("Plain text:", f)                 # x**3/(x**2 - 1)

# Mode 2: pprint — draws math visually using Unicode characters
print("\nPretty print:")
sp.pprint(f)                            # renders as a fraction with horizontal bar

# Mode 3: LaTeX — paste into your homework document
latex_str = sp.latex(f)
print("\nLaTeX:", latex_str)            # \frac{x^{3}}{x^{2} - 1}

# LaTeX for more complex expressions
lam = sp.Symbol('lambda')
char_poly = lam**3 - 2*lam**2 - 5*lam + 6
print("\nCharacteristic polynomial LaTeX:")
print(sp.latex(char_poly))             # \lambda^{3} - 2 \lambda^{2} - 5 \lambda + 6

# LaTeX for a matrix
M = sp.Matrix([[1, 2], [3, 4]])
print("\nMatrix LaTeX:")
print(sp.latex(M))                     # \left[\begin{matrix}1 & 2\\3 & 4\end{matrix}\right]
```

**RUN IT.**

**Expected output:**
```
=== Section 7: Output Formats ===
Plain text: x**3/(x**2 - 1)

Pretty print:
    3
   x
────────
 2
x  - 1

LaTeX: \frac{x^{3}}{x^{2} - 1}

Characteristic polynomial LaTeX:
\lambda^{3} - 2 \lambda^{2} - 5 \lambda + 6

Matrix LaTeX:
\left[\begin{matrix}1 & 2\\3 & 4\end{matrix}\right]
```

Copy the LaTeX output into your homework. Wrap it in `$...$` for inline or `$$...$$` for display math.

---

## Putting It All Together: A Complete Workflow

Here is how a typical homework problem flows with SymPy:

```python
print("\n=== Complete Workflow: Analyze a polynomial ===")

x = sp.Symbol('x')

# Define the function
f = x**3 - 6*x**2 + 9*x + 2

print("f(x) =", f)

# Step 1: Find critical points — where f'(x) = 0
df = sp.diff(f, x)                           # compute first derivative
print("f'(x) =", df)                         # 3*x**2 - 12*x + 9

critical_pts = sp.solve(df, x)               # solve f'(x) = 0 for x
print("Critical points:", critical_pts)      # [1, 3]

# Step 2: Second derivative test — classify each critical point
d2f = sp.diff(f, x, 2)                       # compute second derivative
print("f''(x) =", d2f)                       # 6*x - 12

for cp in critical_pts:                      # loop through each critical point
    second_deriv_val = d2f.subs(x, cp)       # evaluate f''(x) at the critical point
    f_val = f.subs(x, cp)                    # evaluate f(x) at the critical point

    # Second derivative test: f''> 0 means concave up = local min
    #                          f''< 0 means concave down = local max
    #                          f''= 0 means test is inconclusive
    if second_deriv_val > 0:
        classification = "local minimum"
    elif second_deriv_val < 0:
        classification = "local maximum"
    else:
        classification = "inconclusive (saddle point or inflection)"

    print(f"  x={cp}: f({cp})={f_val}, f''({cp})={second_deriv_val} → {classification}")
```

**RUN IT.**

**Expected output:**
```
=== Complete Workflow: Analyze a polynomial ===
f(x) = x**3 - 6*x**2 + 9*x + 2
f'(x) = 3*x**2 - 12*x + 9
Critical points: [1, 3]
f''(x) = 6*x - 12
  x=1: f(1)=6, f''(1)=-6 → local maximum
  x=3: f(3)=2, f''(3)=6 → local minimum
```

---

## Challenges

**When you're done with each challenge, show your output.**

### Challenge 1: Critical Point Analysis

Find all critical points of `f(x) = x⁴ - 8x² + 7`, classify each one using the second derivative test, and identify the global minimum value on the interval [-3, 3].

**When you're done:** Show the critical points, their classifications, and the minimum value.

**Stuck?** Ask AI: "How do I find and classify critical points using SymPy's diff and solve functions?"

---

### Challenge 2: Symbolic Matrix Analysis

Choose any 3×3 matrix with integer entries (not all zeros, not the identity). Using SymPy:
- Compute the determinant
- Compute the characteristic polynomial in terms of `lambda`
- Find all eigenvalues (exact)
- Compute the RREF
- Print the characteristic polynomial as LaTeX

**When you're done:** Show all five outputs and paste the LaTeX string.

**Stuck?** Ask AI: "How do I compute eigenvalues and the characteristic polynomial of a SymPy Matrix?"

---

### Challenge 3: Verify Your Homework

Take any system of 3 linear equations from your current coursework or textbook. Solve it with SymPy using `sp.linsolve()`. Verify that each equation is satisfied by substituting the solution back in.

**When you're done:** Show the system, the solution, and the verification steps.

**Stuck?** Ask AI: "How do I use SymPy linsolve to solve a system of equations, and then verify the solution with subs?"

---

### Challenge 4: Integration by Parts Verification

Compute the definite integral `∫₀^π x·sin(x) dx` symbolically with SymPy. Then verify by computing it manually using integration by parts (`∫u·dv = uv - ∫v·du` with `u=x`, `dv=sin(x)dx`) and checking your hand answer matches SymPy's.

**When you're done:** Show the SymPy result and your manual derivation.

**Stuck?** Ask AI: "How do I compute a definite integral in SymPy, and how does integration by parts work for x*sin(x)?"

---

## Quick Check Answers

1. **`0.1 + 0.2` in Python:** You get `0.30000000000000004`. The correct answer is `0.3`. It is wrong because `0.1` cannot be represented exactly in binary floating point — the computer stores the nearest representable binary fraction, and errors accumulate when you add them. This is not a Python bug; it affects every language that uses IEEE 754 floating point (C, Java, JavaScript, etc.).

2. **What does it mean to hold the symbol `x`?** It means the variable does not represent any particular number — it represents the *unknown* `x` from algebra. You can build expressions with it (`x + 3`, `x**2 - 1`), manipulate them algebraically, and only assign a specific value when you choose to (via `subs()`). It is the difference between asking "what is x + 3 when x = 5?" (numerical) and "simplify the expression x + 3" (symbolic).

3. **Can a computer factor `x² - 1`?** Yes — and SymPy does exactly this with `sp.factor()`. For a program, "factoring" means recognizing algebraic identities (difference of squares, perfect square trinomial, etc.) and rewriting the expression in a product form. SymPy uses polynomial GCD algorithms and pattern matching on the expression tree to find factored forms — the same algebra you do by hand, but implemented as code.

---

## Key Functions Reference

| Function | What it does | Example |
|---|---|---|
| `sp.Symbol('x')` | Create a single symbolic variable | `x = sp.Symbol('x')` |
| `sp.symbols('x y z')` | Create multiple symbols | `x, y, z = sp.symbols('x y z')` |
| `sp.Rational(a, b)` | Exact fraction a/b | `sp.Rational(1, 3)` → 1/3 |
| `sp.expand(expr)` | Multiply out brackets | `sp.expand((x+1)**3)` |
| `sp.factor(expr)` | Factor into product form | `sp.factor(x**2 - 1)` |
| `sp.simplify(expr)` | Apply simplification rules | `sp.simplify((x**2-1)/(x-1))` |
| `sp.collect(expr, x)` | Group terms by power of x | `sp.collect(expr, x)` |
| `expr.subs(x, val)` | Substitute x = val | `expr.subs(x, 3)` |
| `expr.evalf(n)` | Convert to n-digit decimal | `sp.pi.evalf(50)` |
| `sp.solve(expr, x)` | Solve expr = 0 for x | `sp.solve(x**2 - 1, x)` |
| `sp.linsolve(system, vars)` | Solve linear system | `sp.linsolve([eq1, eq2], x, y)` |
| `sp.diff(f, x)` | Derivative of f w.r.t. x | `sp.diff(x**3, x)` |
| `sp.diff(f, x, n)` | nth derivative | `sp.diff(f, x, 2)` |
| `sp.integrate(f, x)` | Antiderivative | `sp.integrate(x**2, x)` |
| `sp.integrate(f, (x,a,b))` | Definite integral | `sp.integrate(f, (x, 0, 1))` |
| `sp.Matrix([[...]])` | Create symbolic matrix | `A = sp.Matrix([[1,2],[3,4]])` |
| `A.det()` | Exact determinant | `A.det()` |
| `A.solve(b)` | Solve Ax = b exactly | `A.solve(b)` |
| `A.rref()` | Reduced row echelon form | `A.rref()` |
| `A.eigenvals()` | Dict of eigenvalues | `A.eigenvals()` |
| `A.eigenvects()` | List of eigenvectors | `A.eigenvects()` |
| `sp.pprint(expr)` | Pretty-print to terminal | `sp.pprint(expr)` |
| `sp.latex(expr)` | LaTeX string for homework | `sp.latex(expr)` |

---

## What Comes Next

- **LAB-07** goes deeper into derivatives: limits, L'Hôpital's rule, Taylor series expansions — all symbolic.
- **LAB-08** goes deeper into integration: improper integrals, series, and numerical integration for integrals SymPy cannot solve in closed form.
- Everything you did with matrices here (eigenvalues, RREF, solve) will appear again when the course covers diagonalization and matrix decompositions.
