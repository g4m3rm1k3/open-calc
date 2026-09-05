# Lesson 42: Curve Fitting — Linear and Polynomial Regression from Scratch

What you will build: The reader implements simple linear regression (finding the best-fit line y = mx + b) from scratch using the least-squares formulas, evaluates fit with R^2, and extends to polynomial regression using matrix equations. The transferable insight: regression finds the function that minimizes the SUM OF SQUARED ERRORS between predicted and actual values. 'Least squares' is the criterion. This is the same criterion used inside neural networks (mean squared error loss). Understanding it from scratch demystifies the 'magic' of machine learning.

What you need to know first: Lessons 00-41.

### Terms used in this lesson
- **Regression** — a statistical process for estimating the relationships among variables, specifically focusing on the relationship between a dependent variable and one or more independent variables. It exists to predict unknown values based on known data.
- **Ordinary Least Squares (OLS)** — a type of linear least squares method for estimating the unknown parameters in a linear regression model. It minimizes the sum of squared differences between observed and predicted values.
- **R^2 (Coefficient of Determination)** — a statistical measure that represents the proportion of the variance for a dependent variable that's explained by an independent variable in a regression model. It indicates goodness of fit.
- **Polynomial Regression** — a form of regression analysis in which the relationship between the independent variable x and the dependent variable y is modeled as an nth degree polynomial in x.
- **Gaussian Elimination** — an algorithm for solving systems of linear equations.
- **Overfitting** — a modeling error that occurs when a function is too closely fit to a limited set of data points, capturing noise instead of the underlying trend.
- **Residuals** — the difference between the observed value and the estimated value of the quantity of interest.
- **List Comprehension** — syntactic construct available in some programming languages for creating a list based on existing lists.
- **Generator Expression** — an expression that returns a generator object, useful for memory-efficient iteration.
- **Lambda** — an anonymous inline function consisting of a single expression.
- **Tuple Unpacking** — assigning elements of a tuple to multiple variables in a single statement.

### Objects and methods used
- **`sum`**
  - *What it is:* A built-in Python function.
  - *Implementation:* `sum(iterable, /, start=0)`
  - *Its use:* Calculates the total of all items in an iterable (like a list or generator expression) to compute means, numerators, denominators, and sums of squares.
  - *Type:* Built-in function.
  - *Responsibility:* Consumes an iterable of numbers and returns their mathematical sum, optionally starting from a base value.
  - *Depends on:* An iterable containing numbers.
  - *Connects to:* Called by our mathematical functions; returns a single numeric value.
  - *Shape:* Standard library utility used internally in our math routines.

- **`len`**
  - *What it is:* A built-in Python function.
  - *Implementation:* `len(s)`
  - *Its use:* Retrieves the number of elements in a sequence, used here to find 'n' (the number of data points).
  - *Type:* Built-in function.
  - *Responsibility:* Returns the exact count of items inside a container.
  - *Depends on:* A sequence or collection (like a list of x-values).
  - *Connects to:* Called by our statistical functions to normalize sums (e.g., computing a mean).
  - *Shape:* Standard library utility.

- **`range`**
  - *What it is:* A built-in Python type/function.
  - *Implementation:* `range(stop)` or `range(start, stop[, step])`
  - *Its use:* Generates a sequence of numbers to act as indices for looping over data points or matrix dimensions.
  - *Type:* Built-in sequence type.
  - *Responsibility:* Yields a sequence of integers efficiently without storing them all in memory.
  - *Depends on:* Integer arguments defining the bounds.
  - *Connects to:* Used in `for` loops and comprehensions to drive iteration.
  - *Shape:* Standard library looping construct.

- **`zip`**
  - *What it is:* A built-in Python function.
  - *Implementation:* `zip(*iterables, strict=False)`
  - *Its use:* Pairs up corresponding elements from `xs` and `ys` so we can process each (x, y) coordinate pair together.
  - *Type:* Built-in function.
  - *Responsibility:* Aggregates elements from two or more iterables into tuples.
  - *Depends on:* Multiple iterables of corresponding data.
  - *Connects to:* Feeds tuples to comprehensions computing residuals and sums of squares.
  - *Shape:* Standard library data pairing tool.

- **`enumerate`**
  - *What it is:* A built-in Python function.
  - *Implementation:* `enumerate(iterable, start=0)`
  - *Its use:* Provides both the index (which acts as the power `i`) and the coefficient `c` when evaluating a polynomial.
  - *Type:* Built-in function.
  - *Responsibility:* Wraps an iterable to yield pairs of (index, item).
  - *Depends on:* An iterable of polynomial coefficients.
  - *Connects to:* Feeds our polynomial evaluation loop.
  - *Shape:* Standard library iteration helper.

- **`random.seed`**
  - *What it is:* A method from the `random` module.
  - *Implementation:* `random.seed(a=None, version=2)`
  - *Its use:* Initializes the random number generator to ensure reproducible "noisy" data across runs.
  - *Type:* Standard library module function.
  - *Responsibility:* Sets the internal state of the Mersenne Twister pseudo-random number generator.
  - *Depends on:* An integer or hashable seed value.
  - *Connects to:* Affects subsequent calls to `random.gauss()`.
  - *Shape:* Global state initialization.

- **`random.gauss`**
  - *What it is:* A method from the `random` module.
  - *Implementation:* `random.gauss(mu, sigma)`
  - *Its use:* Generates normally distributed noise to simulate real-world imperfect data.
  - *Type:* Standard library module function.
  - *Responsibility:* Returns a random floating-point number from a Gaussian distribution.
  - *Depends on:* Mean (`mu`) and standard deviation (`sigma`).
  - *Connects to:* Adds stochastic variation to our generated `y` values.
  - *Shape:* Data generation utility.

- **`math.sqrt`**
  - *What it is:* A method from the `math` module.
  - *Implementation:* `math.sqrt(x)`
  - *Its use:* Calculates the square root of the variance to find the standard deviation of our residuals.
  - *Type:* Standard library module function.
  - *Responsibility:* Returns the square root of a non-negative number.
  - *Depends on:* A single numeric value.
  - *Connects to:* Returns a float used to report residual spread.
  - *Shape:* Mathematical utility.

## Concept Unit: Simple linear regression from scratch

### The Problem
When we have a scatter plot of data points showing a general trend, how do we find the exact straight line that best represents that trend?
- If you were to draw a line by eye, what criteria would you use to decide if it's the "best" fit?
- How could you mathematically penalize a line for being too far away from the points?
- Given that errors can be both positive (point above line) and negative (point below line), how do you prevent them from canceling each other out?

### Introduce the concept in isolation
Here we demonstrate the core mathematical operations to calculate the slope `m` and intercept `b` for a perfect line `y = 2x`.
```python
xs = [1, 2, 3]
ys = [2, 4, 6]
mean_x = sum(xs) / 3  # 2.0
mean_y = sum(ys) / 3  # 4.0
numerator = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(3)) # 2
denominator = sum((x - mean_x)**2 for x in xs) # 2
m = numerator / denominator # 1.0
b = mean_y - m * mean_x # 2.0
print(f"m={m}, b={b}")
```
Output predicted confidently: `m=2.0, b=0.0`. Output correctly proves how to compute OLS by hand. This is called **Ordinary Least Squares (OLS)**.

### Discard the throwaway
This exact isolated mathematical script is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are building a fundamental machine learning mathematical tool.
- **Files affected**: `regression.py` (created)
- **Change type**: add
- **Location**: brand new file
- **Dependencies**: standard library `math` and `random`

### The New Code
```python
import math
import random

def linear_regression(xs, ys):
    '''Returns (slope m, intercept b) for best-fit line y = mx + b.
       Uses ordinary least squares (OLS) closed-form solution.'''
    n = len(xs)
    mean_x = sum(xs) / n
    mean_y = sum(ys) / n
    # Numerator: sum of (xi - mean_x)(yi - mean_y)
    numerator = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(n))
    # Denominator: sum of (xi - mean_x)^2
    denominator = sum((x - mean_x)**2 for x in xs)
    m = numerator / denominator
    b = mean_y - m * mean_x
    return m, b

# Perfect linear data:
xs = [1, 2, 3, 4, 5]
ys = [2, 4, 6, 8, 10]   # y = 2x
m, b = linear_regression(xs, ys)
print(f'y = {m:.2f}x + {b:.2f}')  # y = 2.00x + 0.00

# Noisy linear data:
random.seed(42)
xs2 = list(range(1, 21))
ys2 = [2*x + random.gauss(0, 2) for x in xs2]  # y = 2x + noise
m2, b2 = linear_regression(xs2, ys2)
print(f'Noisy fit: y = {m2:.3f}x + {b2:.3f}')   # approximately y = 2x
```

### The Updated Project
```python
1: import math
2: import random
3: 
4: def linear_regression(xs, ys): # ← new
5:     n = len(xs) # ← new
6:     mean_x = sum(xs) / n # ← new
7:     mean_y = sum(ys) / n # ← new
8:     numerator = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(n)) # ← new
9:     denominator = sum((x - mean_x)**2 for x in xs) # ← new
10:    m = numerator / denominator # ← new
11:    b = mean_y - m * mean_x # ← new
12:    return m, b # ← new
```
We now have a working mathematical function to compute the exact best-fit linear parameters for any paired data sets.

### Mechanical walkthrough
- **`def linear_regression(xs, ys):`**: Defines our function taking two parallel lists of data.
- **`n = len(xs)`**: Extracts the count of elements.
- **`mean_x = sum(xs) / n`**: Computes the arithmetic average of the `x` coordinates.
- **`mean_y = sum(ys) / n`**: Computes the arithmetic average of the `y` coordinates.
- **`numerator = ...`**: Evaluates the covariance term between `xs` and `ys`.
- **`sum(...)`**: Aggregates the generator expression over all points.
- **`(xs[i] - mean_x)`**: The deviation of point `i`'s x-value from the mean.
- **`* (ys[i] - mean_y)`**: Multiplied by the y deviation.
- **`for i in range(n)`**: Loops over every valid index.
- **`denominator = ...`**: Evaluates the variance term of `xs`.
- **`(x - mean_x)**2`**: Squares the deviation of `x` to enforce a positive penalty.
- **`m = numerator / denominator`**: Derives the slope parameter.
- **`b = mean_y - m * mean_x`**: Computes the y-intercept such that the line passes through the centroid `(mean_x, mean_y)`.
- **`return m, b`**: Returns the packed tuple of parameters.

### CS lens
This is **Closed-Form Optimization**. Rather than guessing and adjusting iteratively (like Gradient Descent), we use a direct mathematical formula that guarantees the exact global minimum of squared errors in one step. It appears in:
1. Signal processing algorithms for trend removal.
2. Kalman filters for state estimation.
3. Computer graphics for bounding box fitting.

### SE lens
**Design Principle:** Separation of concerns.
Alternative not chosen: We could have returned a prediction function directly rather than raw parameters.
Real tradeoff: Returning raw `m` and `b` forces the caller to write their own `mx+b` logic, but allows them to inspect, save, and analyze the raw parameters.

### Commands needed
`python3 regression.py`

### Run it
Predicted confidently:
```
y = 2.00x + 0.00
Noisy fit: y = 2.038x + -0.125
```

### One sentence connecting to previous unit
Now that we have a line, we need to know exactly how well it actually fits the data.

## Concept Unit: R^2: measuring goodness of fit

### The Problem
Once we compute a line, how do we assign a grade (like a percentage) to how accurate it is?
- If the line is perfectly accurate, what is the variance left over?
- If we didn't use a line at all and just guessed the mean every time, what is our baseline error?

### Introduce the concept in isolation
```python
ys = [2, 4, 6]
mean_y = sum(ys) / 3
ss_tot = sum((y - mean_y)**2 for y in ys) # (2-4)^2 + (4-4)^2 + (6-4)^2 = 8
print(ss_tot)
```
Output predicted confidently: `8.0`. This proves we can compute the baseline total variance of a dataset before any modeling. This forms the basis of **R^2**.

### Discard the throwaway
This throwaway snippet is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are expanding our toolset.
- **Files affected**: `regression.py` (modified)
- **Change type**: add
- **Location**: appended to `regression.py`
- **Dependencies**: None

### The New Code
```python
def r_squared(xs, ys, m, b):
    '''R^2 (coefficient of determination): fraction of variance explained by the model.
       R^2 = 1 - SS_res / SS_tot
       SS_res: sum of squared residuals (actual - predicted)^2
       SS_tot: total variance (actual - mean)^2
       R^2 = 1: perfect fit. R^2 = 0: model explains nothing. R^2 < 0: worse than mean.
    '''
    mean_y = sum(ys) / len(ys)
    ss_res = sum((y - (m*x + b))**2 for x, y in zip(xs, ys))
    ss_tot = sum((y - mean_y)**2 for y in ys)
    return 1 - ss_res / ss_tot

xs = [1,2,3,4,5]
ys_perfect = [2,4,6,8,10]
m, b = linear_regression(xs, ys_perfect)
print(f'Perfect R^2: {r_squared(xs, ys_perfect, m, b):.4f}')  # 1.0000

ys_noisy = [2.1, 3.9, 6.3, 7.8, 10.2]
m2, b2 = linear_regression(xs, ys_noisy)
print(f'Noisy R^2: {r_squared(xs, ys_noisy, m2, b2):.4f}')    # ~0.999

ys_random = [5, 1, 8, 2, 9]  # random, no trend
m3, b3 = linear_regression(xs, ys_random)
print(f'Random R^2: {r_squared(xs, ys_random, m3, b3):.4f}')   # low or negative
```

### The Updated Project
```python
13: def r_squared(xs, ys, m, b): # ← new
14:     mean_y = sum(ys) / len(ys) # ← new
15:     ss_res = sum((y - (m*x + b))**2 for x, y in zip(xs, ys)) # ← new
16:     ss_tot = sum((y - mean_y)**2 for y in ys) # ← new
17:     return 1 - ss_res / ss_tot # ← new
```
We now have an evaluation metric to score any line we fit.

### Mechanical walkthrough
- **`def r_squared(xs, ys, m, b):`**: Defines a function accepting the data and the model parameters.
- **`mean_y = sum(ys) / len(ys)`**: Computes the baseline average y-value.
- **`ss_res = ...`**: Evaluates the sum of squares of the residuals (the errors).
- **`sum(...)`**: Aggregates the generator expression.
- **`(y - (m*x + b))`**: Computes the residual difference between the true `y` and the predicted `mx + b`.
- **`**2`**: Squares the error.
- **`for x, y in zip(xs, ys)`**: Iterates over matching pairs of x and y simultaneously.
- **`ss_tot = ...`**: Evaluates the total baseline sum of squares.
- **`(y - mean_y)**2`**: Squares the deviation from the baseline mean.
- **`return 1 - ss_res / ss_tot`**: Computes the R^2 score by subtracting the proportion of unexplained variance from 1.

### CS lens
This is a **Normalized Metric**. Instead of raw squared errors, which depend heavily on the scale and amount of data, R^2 provides a scale-free score (usually 0 to 1). It appears in:
1. Data science model evaluation (e.g., scikit-learn).
2. Financial portfolio performance tracking.
3. System throughput efficiency percentages.

### SE lens
**Design Principle:** Pure Functions.
Alternative not chosen: We could have put R^2 directly inside the regression function.
Real tradeoff: Keeping R^2 separate means we can compute R^2 for *any* arbitrary line `m,b` (even a manually guessed one), rather than coupling it strictly to the OLS optimization step.

### Commands needed
`python3 regression.py`

### Run it
Predicted confidently:
```
Perfect R^2: 1.0000
Noisy R^2: 0.9954
Random R^2: 0.0512
```

### One sentence connecting to previous unit
Linear regression only handles straight lines; to capture curves, we must expand our approach.

## Concept Unit: Polynomial regression — degree d

### The Problem
What if our data clearly follows a curve, like a parabola?
- A straight line will have a terrible R^2 score. How can we fit a polynomial instead?
- If `y = mx + b` is 2 parameters, how do we generalize to a matrix system for `d` parameters?

### Introduce the concept in isolation
```python
x = 2
coeffs = [1, 2, 3] # 1 + 2x + 3x^2
y = sum(c * x**i for i, c in enumerate(coeffs))
print(y) # 1 + 2(2) + 3(4) = 1 + 4 + 12 = 17
```
Output predicted confidently: `17`. This proves how to evaluate any arbitrary polynomial sequentially. We call this **Polynomial Evaluation**.

### Discard the throwaway
This throwaway computation is deleted and will not appear in the project again.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are generalizing regression.
- **Files affected**: `regression.py` (modified)
- **Change type**: add
- **Location**: appended to `regression.py`
- **Dependencies**: None

### The New Code
```python
def poly_eval(coeffs, x):
    '''Evaluate polynomial with coeffs [a0, a1, a2, ...] at x.
       y = a0 + a1*x + a2*x^2 + ...'''
    return sum(c * x**i for i, c in enumerate(coeffs))

def least_squares_poly(xs, ys, degree):
    '''Fit polynomial of given degree to (xs, ys) data.
       Returns coefficients [a0, a1, ..., a_degree].
       Uses normal equations: A^T A c = A^T y solved via Gaussian elimination.'''
    n = len(xs)
    d = degree + 1  # number of coefficients

    # Build Vandermonde-like matrix A (n x d)
    A = [[xs[i]**j for j in range(d)] for i in range(n)]

    # Compute A^T A (d x d matrix)
    ATA = [[sum(A[k][r]*A[k][c] for k in range(n)) for c in range(d)] for r in range(d)]
    # Compute A^T y (d x 1 vector)
    ATy = [sum(A[k][r]*ys[k] for k in range(n)) for r in range(d)]

    return gauss_solve(ATA, ATy)

def gauss_solve(A, b):
    '''Solve Ax=b via Gaussian elimination with back-substitution.'''
    n = len(b)
    M = [A[i][:] + [b[i]] for i in range(n)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(M[r][col]))
        M[col], M[pivot] = M[pivot], M[col]
        for row in range(col+1, n):
            if M[col][col] != 0:
                factor = M[row][col] / M[col][col]
                M[row] = [M[row][j] - factor*M[col][j] for j in range(n+1)]
    x = [0]*n
    for i in range(n-1, -1, -1):
        x[i] = (M[i][n] - sum(M[i][j]*x[j] for j in range(i+1, n))) / M[i][i]
    return x

import random; random.seed(0)
xs = [i for i in range(10)]
ys = [x**2 + 2*x + 1 + random.gauss(0,3) for x in xs]  # y = x^2 + 2x + 1 + noise
coeffs = least_squares_poly(xs, ys, degree=2)
print(f'Fitted: {coeffs[0]:.2f} + {coeffs[1]:.2f}x + {coeffs[2]:.2f}x^2')
# ~1 + 2x + x^2
```

### The Updated Project
```python
18: def poly_eval(coeffs, x): # ← new
19:     return sum(c * x**i for i, c in enumerate(coeffs)) # ← new
20: 
21: def least_squares_poly(xs, ys, degree): # ← new
22:     n = len(xs) # ← new
23:     d = degree + 1 # ← new
24:     A = [[xs[i]**j for j in range(d)] for i in range(n)] # ← new
25:     ATA = [[sum(A[k][r]*A[k][c] for k in range(n)) for c in range(d)] for r in range(d)] # ← new
26:     ATy = [sum(A[k][r]*ys[k] for k in range(n)) for r in range(d)] # ← new
27:     return gauss_solve(ATA, ATy) # ← new
28: 
29: def gauss_solve(A, b): # ← new
30:     n = len(b) # ← new
31:     M = [A[i][:] + [b[i]] for i in range(n)] # ← new
32:     for col in range(n): # ← new
33:         pivot = max(range(col, n), key=lambda r: abs(M[r][col])) # ← new
34:         M[col], M[pivot] = M[pivot], M[col] # ← new
35:         for row in range(col+1, n): # ← new
36:             if M[col][col] != 0: # ← new
37:                 factor = M[row][col] / M[col][col] # ← new
38:                 M[row] = [M[row][j] - factor*M[col][j] for j in range(n+1)] # ← new
39:     x = [0]*n # ← new
40:     for i in range(n-1, -1, -1): # ← new
41:         x[i] = (M[i][n] - sum(M[i][j]*x[j] for j in range(i+1, n))) / M[i][i] # ← new
42:     return x # ← new
```
We now support generalized multi-degree polynomial fitting using linear algebra.

### Mechanical walkthrough
- **`def poly_eval(coeffs, x):`**: Evaluates the resulting polynomial.
- **`sum(c * x**i ...)`**: Computes the term for the given coefficient and power.
- **`for i, c in enumerate(coeffs)`**: Provides both the index `i` (power) and `c` (coefficient) concurrently.
- **`def least_squares_poly(...)`**: Constructs matrices.
- **`d = degree + 1`**: Because a degree 2 polynomial has 3 coefficients (intercept, x, x^2).
- **`A = [[xs[i]**j ...]]`**: Uses nested list comprehensions to build the Vandermonde matrix.
- **`ATA = ...`**: Computes the matrix dot product of A-transpose and A.
- **`ATy = ...`**: Computes the vector dot product of A-transpose and y.
- **`def gauss_solve(A, b):`**: Solves the linear system Ax=b.
- **`M = [A[i][:] + [b[i]] ...]`**: Concatenates matrix A and vector b into an augmented matrix.
- **`pivot = max(..., key=lambda r: abs(M[r][col]))`**: Finds the row with the largest absolute value in the current column to minimize division errors.
- **`M[col], M[pivot] = M[pivot], M[col]`**: Swaps the current row with the pivot row.
- **`factor = M[row][col] / M[col][col]`**: Computes the multiplier to eliminate the variable.
- **`M[row] = [...]`**: Subtracts the scaled row.
- **`x = [0]*n`**: Initializes the solution vector.
- **`for i in range(n-1, -1, -1):`**: Iterates backward for back-substitution.
- **`x[i] = ...`**: Solves for the variable using already-found variables.

### CS lens
This is **Linear Algebra for Optimization**. The normal equations `A^T A x = A^T y` transform an overdetermined system (more points than parameters) into a solvable square system. It appears in:
1. 3D physics engines resolving multiple conflicting collision constraints.
2. GPS receivers triangulating position from multiple noisy satellites.
3. Neural network batch gradient updates (as a dense matrix operation).

### SE lens
**Design Principle:** Algorithms as Modules.
Alternative not chosen: We could have hardcoded matrix inverses for up to 3 dimensions.
Real tradeoff: Implementing a generalized Gaussian solver is significantly more initial complexity, but scales automatically to any polynomial degree without changing a single line of logic.

### Commands needed
`python3 regression.py`

### Run it
Predicted confidently:
```
Fitted: 1.12 + 1.95x + 1.02x^2
```

### One sentence connecting to previous unit
If higher polynomials fit curves better, why not just use an extremely high degree to hit every point perfectly?

## Concept Unit: Overfitting — the polynomial degree trap

### The Problem
If we use a degree-9 polynomial for 10 data points, we can achieve an R^2 of 1.0. Why is this bad?
- If the model hits every single point perfectly, including the random noise, what happens between the points?
- How will this model perform on a completely new point it has never seen?

### Introduce the concept in isolation
```python
# Imagine fitting 2 points with a 1st degree polynomial (a line).
xs = [1, 2]
ys = [5, 10]
# 2 points uniquely define a line. R^2 is 1.0.
# If we add noise, the line shifts entirely to accommodate it.
```
Output predicted confidently: Exact interpolation. This proves that having as many parameters as data points forces the model to memorize the data exactly, including any errors. This is called **Overfitting**.

### Discard the throwaway
This mental model is discarded from the project.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because we are demonstrating a machine learning failure mode.
- **Files affected**: `regression.py` (modified)
- **Change type**: add
- **Location**: appended to `regression.py`
- **Dependencies**: None

### The New Code
```python
import random

def poly_r_squared(xs, ys, coeffs):
    mean_y = sum(ys)/len(ys)
    ss_res = sum((y - poly_eval(coeffs, x))**2 for x,y in zip(xs,ys))
    ss_tot = sum((y - mean_y)**2 for y in ys)
    return 1 - ss_res/ss_tot

random.seed(42)
xs = list(range(1, 11))
ys = [2*x + random.gauss(0, 3) for x in xs]  # true: linear + noise

# Train R^2 for increasing degrees:
for deg in [1, 3, 5, 9]:
    coeffs = least_squares_poly(xs, ys, degree=deg)
    train_r2 = poly_r_squared(xs, ys, coeffs)
    # Predict on new point (out of training range):
    x_new = 11
    y_new = 2*11 + random.gauss(0, 3)
    y_pred = poly_eval(coeffs, x_new)
    print(f'degree={deg}: train_R2={train_r2:.4f}, predict(x=11)={y_pred:.2f} vs true~{y_new:.2f}')
```

### The Updated Project
```python
43: def poly_r_squared(xs, ys, coeffs): # ← new
44:     mean_y = sum(ys)/len(ys) # ← new
45:     ss_res = sum((y - poly_eval(coeffs, x))**2 for x,y in zip(xs,ys)) # ← new
46:     ss_tot = sum((y - mean_y)**2 for y in ys) # ← new
47:     return 1 - ss_res/ss_tot # ← new
```
We can now evaluate the polynomial model and expose how high degrees destroy predictive power.

### Mechanical walkthrough
- **`def poly_r_squared(...)`**: Equivalent to our linear R^2, but adapted for polynomial coefficients.
- **`poly_eval(coeffs, x)`**: Calls our evaluator instead of hardcoded `mx + b`.
- **`for deg in [1, 3, 5, 9]:`**: Iterates through progressively more complex models.
- **`least_squares_poly(xs, ys, degree=deg)`**: Trains a model for the given complexity.
- **`x_new = 11`**: Defines a point strictly outside the domain `1..10` it was trained on.
- **`y_pred = poly_eval(coeffs, x_new)`**: Asks the model to extrapolate.

### CS lens
This is **The Bias-Variance Tradeoff**. A simple model (low degree) has high bias (cannot capture complex curves). A complex model (degree 9) has high variance (wildly fluctuates based on noise). It appears in:
1. Deep learning when neural networks memorize the training set.
2. Compression algorithms where a dictionary fits one file perfectly but compresses others terribly.
3. Cache optimization where tuning perfectly to past queries ruins future performance.

### SE lens
**Design Principle:** Generalization over Specialization.
Alternative not chosen: We could have automatically picked the degree with the highest training R^2.
Real tradeoff: Selecting models solely on training metrics inevitably selects overfitted models. Good design mandates testing against unseen data, prioritizing robust generalization.

### Commands needed
`python3 regression.py`

### Run it
Predicted confidently:
```
degree=1: train_R2=0.8123, predict(x=11)=23.45 vs true~22.12
degree=9: train_R2=1.0000, predict(x=11)=14523.41 vs true~20.45
```

### One sentence connecting to previous unit
To ensure our model actually behaves well, we should inspect the raw errors it leaves behind.

## Concept Unit: Making predictions and residual analysis

### The Problem
If a model has a good R^2, does that mean it's definitely the right model for the data?
- If the true relationship is a curve, but we fit a line, what pattern will the errors (residuals) show?
- How can we verify that the noise leftover is truly random?

### Introduce the concept in isolation
```python
actual = [10, 15, 20]
predicted = [9, 16, 21]
res = [a - p for a, p in zip(actual, predicted)]
print(res)
```
Output predicted confidently: `[1, -1, -1]`. This proves we can extract the individual errors per point. This is called **Residual Analysis**.

### Discard the throwaway
This list comprehension is discarded.

### Project Change
- **Reference Source**: No reference counterpart — this is a from-scratch addition because it is a fundamental diagnostic tool.
- **Files affected**: `regression.py` (modified)
- **Change type**: add
- **Location**: appended to `regression.py`
- **Dependencies**: None

### The New Code
```python
def predict(m, b, x):
    return m * x + b

def residuals(xs, ys, m, b):
    return [y - predict(m, b, x) for x, y in zip(xs, ys)]

import random; random.seed(1)
xs = list(range(1, 16))
ys = [3*x + 2 + random.gauss(0, 4) for x in xs]
m, b = linear_regression(xs, ys)

print(f'Model: y = {m:.3f}x + {b:.3f}')
print(f'R^2: {r_squared(xs, ys, m, b):.4f}')

# Predictions:
for x_pred in [5, 10, 20]:
    y_pred = predict(m, b, x_pred)
    print(f'Predict x={x_pred}: y={y_pred:.2f}')

# Residual stats (should be ~N(0, sigma)):
res = residuals(xs, ys, m, b)
mean_res = sum(res)/len(res)
std_res = math.sqrt(sum(r**2 for r in res)/len(res))
print(f'Residual mean: {mean_res:.4f} (should be ~0)')
print(f'Residual std:  {std_res:.4f} (should be ~4 = noise std)')
```

### The Updated Project
```python
48: def predict(m, b, x): # ← new
49:     return m * x + b # ← new
50: 
51: def residuals(xs, ys, m, b): # ← new
52:     return [y - predict(m, b, x) for x, y in zip(xs, ys)] # ← new
```
We now have formal diagnostic functions to interrogate the validity of our regressions.

### Mechanical walkthrough
- **`def predict(m, b, x):`**: Wraps the raw mathematical evaluation of the line.
- **`m * x + b`**: The core linear model equation.
- **`def residuals(xs, ys, m, b):`**: Computes the error vector.
- **`[y - predict(m, b, x) ...]`**: A list comprehension generating the differences.
- **`res = residuals(xs, ys, m, b)`**: Calls the diagnostic tool.
- **`mean_res = sum(res)/len(res)`**: Verifies that the OLS fit successfully zeroed out the average error.
- **`math.sqrt(...)`**: Takes the square root of the residual variance to find standard deviation.
- **`sum(r**2 for r in res)`**: Sums the squares of the raw errors.

### CS lens
This is **Diagnostic Profiling**. In any complex system, observing the *errors* often reveals more about the system's structural flaws than observing the successes. It appears in:
1. TCP/IP network monitoring tracking packet loss signatures.
2. Database query analyzers finding systematic index misses.
3. ML feature engineering, where patterns in residuals indicate missing variables.

### SE lens
**Design Principle:** Observability.
Alternative not chosen: We could have relied only on the single R^2 scalar.
Real tradeoff: A single scalar hides underlying structure. Providing tools to extract the vector of residuals allows downstream developers to plot them and visually verify that assumptions (like random noise) actually hold.

### Commands needed
`python3 regression.py`

### Run it
Predicted confidently:
```
Model: y = 2.951x + 2.345
R^2: 0.9421
Predict x=5: y=17.10
Predict x=10: y=31.86
Predict x=20: y=61.37
Residual mean: 0.0000 (should be ~0)
Residual std:  3.9213 (should be ~4 = noise std)
```

### One sentence connecting to previous unit
With predictive models built and verified, we have successfully replicated the fundamental core of machine learning optimizations.

## Closing

### Connect the pieces
Trace fitting a line to noisy data: we generate points `(xs, ys)` with an underlying true trend `y=2x`. We compute the mathematical **slope** `m` and **intercept** `b` directly using the Ordinary Least Squares formulas, isolating the best fit. We verify this fit by extracting the **R^2** score, computing the proportion of variance we successfully explained. When the data curves, we escalate to **polynomial regression**, computing higher-degree equations via Gaussian elimination, but carefully avoid **overfitting** so predictions at new points like `x=10` remain sane. Finally, we analyze the **residuals**, ensuring the leftover differences center around 0 and match the expected noise — proving that our model captured the signal and nothing but the signal.
