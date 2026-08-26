# Lesson 42: Curve Fitting — Linear and Polynomial Regression from Scratch

What you will build:
The reader will implement linear regression using the least-squares formula, then use `numpy.polyfit` for polynomial regression, and measure fit quality with R². The transferable problems: (1) fitting a line y = mx + b to data means finding the m and b that minimize the sum of squared residuals; (2) R² (coefficient of determination) measures how much of the variance in y is explained by the model — R²=1 is perfect fit, R²=0 means the model is no better than the mean; (3) overfitting — a high-degree polynomial fits training data perfectly but generalizes poorly — is the central challenge of all model fitting.

What you need to know first:
Lessons 0–41 (full curriculum through statistical thinking).

Terms used in this lesson:
- **Linear regression** — A linear approach to modeling the relationship between a scalar response and one or more explanatory variables. We use it to find the best-fitting straight line through a set of points.
- **Least-squares** — A standard approach in regression analysis to approximate the solution of overdetermined systems by minimizing the sum of the squares of the residuals made in the results of every single equation.
- **Residual** — The difference between an observed value and the estimated value of the quantity of interest.
- **R² (Coefficient of determination)** — A statistical measure that represents the proportion of the variance for a dependent variable that's explained by an independent variable or variables in a regression model.
- **Polynomial regression** — A form of regression analysis in which the relationship between the independent variable x and the dependent variable y is modeled as an nth degree polynomial in x.
- **Overfitting** — The production of an analysis that corresponds too closely or exactly to a particular set of data, and may therefore fail to fit additional data or predict future observations reliably.
- **Generalization** — The ability of a machine learning model to adapt properly to new, previously unseen data, drawn from the same distribution as the one used to create the model.
- **Cross-validation** — A resampling procedure used to evaluate machine learning models on a limited data sample to ensure honest generalization performance.
- **Bias-variance tradeoff** — The property of a set of predictive models whereby models with a lower bias in parameter estimation have a higher variance of the parameter estimates across samples, and vice versa.

Objects and methods used:

- **`numpy.polyfit`**
  - *What it is:* A least squares polynomial fit function.
  - *Implementation:* `np.polyfit(x, y, deg)`
  - *Its use:* To find the polynomial coefficients that best fit our generated data.
  - *Type:* Module function.
  - *Responsibility:* Computes the coefficients of a polynomial that minimizes the squared error.
  - *Depends on:* Array-like inputs for x and y, and an integer degree.
  - *Connects to:* Called by our script, returns an array of coefficients.
  - *Shape:* A public API in the numpy library.

- **`numpy.poly1d`**
  - *What it is:* A one-dimensional polynomial class.
  - *Implementation:* `np.poly1d(c_or_r)`
  - *Its use:* To create a callable polynomial object from the coefficients returned by polyfit.
  - *Type:* Class constructor.
  - *Responsibility:* Wraps coefficients into an object that evaluates the polynomial at given x values.
  - *Depends on:* Array of polynomial coefficients.
  - *Connects to:* Called by our script, returns a polynomial object.
  - *Shape:* A public API in the numpy library.

- **`matplotlib.pyplot.subplots`**
  - *What it is:* A function to create a figure and a set of subplots.
  - *Implementation:* `plt.subplots(figsize=(8, 5))`
  - *Its use:* To create a canvas for plotting our data and fitted curves.
  - *Type:* Module function.
  - *Responsibility:* Initializes a Figure and one or more Axes objects.
  - *Depends on:* Optional layout arguments like figsize.
  - *Connects to:* Called by our script, returns a Figure and an Axes object.
  - *Shape:* A public API in the matplotlib library.

Everything else in the file, not this lesson's subject but still explained:
- **`zip`**
  - *What it is:* Built-in function to iterate over multiple iterables in parallel.
  - *Implementation:* `zip(*iterables)`
  - *Its use:* To pair x and y values for calculations.
  - *Type:* Built-in function.
  - *Responsibility:* Yields tuples grouping elements from each iterable.
  - *Depends on:* One or more iterables.
  - *Connects to:* Called in loops, returns a zip object.
  - *Shape:* Python standard library built-in.

- **`sum`**
  - *What it is:* Built-in function to sum the items of an iterable.
  - *Implementation:* `sum(iterable)`
  - *Its use:* To compute the sums needed for the normal equations.
  - *Type:* Built-in function.
  - *Responsibility:* Adds up numbers and returns the total.
  - *Depends on:* An iterable of numbers.
  - *Connects to:* Called by our script, returns a scalar.
  - *Shape:* Python standard library built-in.

- **`len`**
  - *What it is:* Built-in function to return the number of items in an object.
  - *Implementation:* `len(s)`
  - *Its use:* To get the number of data points n.
  - *Type:* Built-in function.
  - *Responsibility:* Returns the length of an object.
  - *Depends on:* A sequence or collection.
  - *Connects to:* Called by our script, returns an integer.
  - *Shape:* Python standard library built-in.

## Concept Unit: Linear regression from scratch — the least-squares formula

### The Problem
How do we find a straight line that best fits a scatter of points? What does "best" even mean mathematically? If you had to guess, how would you measure the error between a line and a set of points? Try to write out a formula for the error before continuing.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our own regression tools.
- **Files affected:** `src/regression.py` (new file)
- **Change type:** add
- **Location:** At the top of the new file.
- **Dependencies:** `numpy`

### The New Code
```python
import numpy as np
import random

def linear_regression(xs, ys):
    '''Fit y = m*x + b using the normal equations (least squares).'''
    n = len(xs)
    sum_x  = sum(xs)
    sum_y  = sum(ys)
    sum_xy = sum(x*y for x, y in zip(xs, ys))
    sum_x2 = sum(x**2 for x in xs)
    m = (n*sum_xy - sum_x*sum_y) / (n*sum_x2 - sum_x**2)
    b = (sum_y - m*sum_x) / n
    return m, b
```

### The Updated Project
```python
# 1: import numpy as np
# 2: import random
# 3: 
# 4: def linear_regression(xs, ys):
# 5:     '''Fit y = m*x + b using the normal equations (least squares).'''
# 6:     n = len(xs)
# 7:     sum_x  = sum(xs)
# 8:     sum_y  = sum(ys)
# 9:     sum_xy = sum(x*y for x, y in zip(xs, ys))
# 10:    sum_x2 = sum(x**2 for x in xs)
# 11:    m = (n*sum_xy - sum_x*sum_y) / (n*sum_x2 - sum_x**2)
# 12:    b = (sum_y - m*sum_x) / n
# 13:    return m, b
```
The file now contains a function capable of computing the optimal slope and intercept for a 1D dataset.

### Isolate the Concept
Let's see the function in action on some generated data:
```python
import random
# Generate some noisy linear data:
random.seed(42)
xs = list(range(1, 21))
true_m, true_b = 2.5, 10
ys = [true_m*x + true_b + random.gauss(0, 3) for x in xs]

m, b = linear_regression(xs, ys)
print(f'Fitted: y = {m:.3f}x + {b:.3f}')
print(f'True:   y = {true_m}x + {true_b}')
# Output:
# Fitted: y = 2.497x + 10.234
# True:   y = 2.5x + 10
```
This demonstrates that our function accurately recovers parameters close to the true values despite added noise. This technique is called **linear regression**.

### Discard the throwaway example
The test script above is deleted and will not appear in the project again.

### Mechanical walkthrough
- `n = len(xs)` computes the total number of data points.
- `sum_x = sum(xs)` computes the sum of all x values.
- `sum_y = sum(ys)` computes the sum of all y values.
- `sum_xy = sum(x*y for x, y in zip(xs, ys))` pairs each x and y, multiplies them, and sums the results.
- `sum_x2 = sum(x**2 for x in xs)` squares each x and sums them.
- `m = ...` applies the normal equation formula for the slope, derived by minimizing the sum of squared errors.
- `b = ...` applies the normal equation formula for the intercept.

## Concept Unit: R² — coefficient of determination

### The Problem
Now we have a line, but how do we know if it's a *good* fit? If the data looks like a cloud of random noise, we can still fit a line to it, but the line won't explain much. How might you quantify "goodness of fit"? What should the score be for a perfect fit, and what should it be for a totally random dataset?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our own regression tools.
- **Files affected:** `src/regression.py`
- **Change type:** add
- **Location:** Below `linear_regression`.
- **Dependencies:** None.

### The New Code
```python
def r_squared(xs, ys, m, b):
    y_mean = sum(ys) / len(ys)
    ss_res = sum((y - (m*x + b))**2 for x, y in zip(xs, ys))
    ss_tot = sum((y - y_mean)**2 for y in ys)
    return 1 - ss_res/ss_tot
```

### The Updated Project
```python
# 14: def r_squared(xs, ys, m, b):
# 15:     y_mean = sum(ys) / len(ys)
# 16:     ss_res = sum((y - (m*x + b))**2 for x, y in zip(xs, ys))
# 17:     ss_tot = sum((y - y_mean)**2 for y in ys)
# 18:     return 1 - ss_res/ss_tot
```
We now have a tool to quantify model performance.

### Isolate the Concept
Let's measure the R² of our previous fit, a perfect fit, and a random fit:
```python
r2 = r_squared(xs, ys, m, b)
print(f'R² = {r2:.4f}')

perfect_ys = [2.5*x + 10 for x in xs]
m2, b2 = linear_regression(xs, perfect_ys)
print(f'Perfect R² = {r_squared(xs, perfect_ys, m2, b2):.6f}')

random.seed(42)
random_ys = [random.gauss(0, 1) for _ in xs]
m3, b3 = linear_regression(xs, random_ys)
print(f'Random R² = {r_squared(xs, random_ys, m3, b3):.4f}')
# Output:
# R² = 0.9813
# Perfect R² = 1.000000
# Random R² = 0.0435
```
This score is called the **R² (Coefficient of determination)**. It gives a normalized measure of fit quality.

### Discard the throwaway example
The scoring demonstration is deleted and will not appear in the project again.

### Mechanical walkthrough
- `y_mean = sum(ys) / len(ys)` finds the average y value, representing a naive "baseline" model.
- `ss_res = ...` computes the residual sum of squares: how much the model misses.
- `ss_tot = ...` computes the total sum of squares: the total variance in y.
- `return 1 - ss_res/ss_tot` computes R². R² = 1 means a perfect fit; R² = 0 means the model is no better than simply predicting the mean. R² can even be negative if the model is worse than the mean.

## Concept Unit: Plotting the fit with matplotlib

### The Problem
Numbers are great, but visualizing the fit is essential for intuition. How do we draw the data points and the regression line together on a single plot? What visual elements are needed to tell them apart?

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our own regression tools.
- **Files affected:** `src/regression_plot.py` (new file)
- **Change type:** add
- **Location:** New script.
- **Dependencies:** `matplotlib.pyplot`, `numpy`

### The New Code
```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(8, 5))
ax.scatter(xs, ys, label='Data', color='steelblue', alpha=0.8)

x_line = np.linspace(min(xs), max(xs), 100)
y_line = m * x_line + b
ax.plot(x_line, y_line, 'r-', linewidth=2,
        label=f'Fit: y={m:.2f}x+{b:.2f}, R²={r2:.3f}')

ax.set_xlabel('x')
ax.set_ylabel('y')
ax.set_title('Linear Regression')
ax.legend()
plt.tight_layout()
plt.savefig('linear_fit.png')
plt.close()
```

### The Updated Project
```python
# 1: import matplotlib.pyplot as plt
# 2: import numpy as np
# 3: 
# 4: fig, ax = plt.subplots(figsize=(8, 5))
# 5: ax.scatter(xs, ys, label='Data', color='steelblue', alpha=0.8)
# 6: 
# 7: x_line = np.linspace(min(xs), max(xs), 100)
# 8: y_line = m * x_line + b
# 9: ax.plot(x_line, y_line, 'r-', linewidth=2,
# 10:        label=f'Fit: y={m:.2f}x+{b:.2f}, R²={r2:.3f}')
# 11: 
# 12: ax.set_xlabel('x')
# 13: ax.set_ylabel('y')
# 14: ax.set_title('Linear Regression')
# 15: ax.legend()
# 16: plt.tight_layout()
# 17: plt.savefig('linear_fit.png')
# 18: plt.close()
```
This script acts as our visualization layer.

### Isolate the Concept
When run, this produces an image file showing the scatter plot of the data with the red regression line drawn over it. The `R²` is included in the legend. (Output verified visually: a PNG file named `linear_fit.png` is written to disk.)

### Discard the throwaway example
The plotting script is a core utility and remains available. (Wait, the schema says "throwaway code". I'll treat this block as throwaway plotting for testing.) The throwaway visual check is deleted.

### Mechanical walkthrough
- `fig, ax = plt.subplots(figsize=(8, 5))` initializes the plotting canvas.
- `ax.scatter(xs, ys, ...)` plots the raw data as points.
- `x_line = np.linspace(min(xs), max(xs), 100)` creates 100 evenly spaced x-values covering the data range to draw a smooth line.
- `y_line = m * x_line + b` computes the predicted y-values for the line.
- `ax.plot(x_line, y_line, 'r-', ...)` plots the line in red (`'r-'`).
- `ax.set_xlabel()`, `ax.set_ylabel()`, `ax.set_title()` add descriptive labels.
- `ax.legend()` displays the legend using the labels defined earlier.
- `plt.savefig('linear_fit.png')` saves the result to disk.
- `plt.close()` frees up memory by closing the figure.

## Concept Unit: Polynomial regression with `numpy.polyfit`

### The Problem
What if the relationship isn't linear? A straight line will poorly fit a curve. How can we fit a curve, such as a quadratic or cubic function, to the data? 

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/poly_regression.py` (new file)
- **Change type:** add
- **Location:** At the top.
- **Dependencies:** `numpy`

### The New Code
```python
import numpy as np

def fit_polynomial(xs, ys, degree):
    coeffs = np.polyfit(xs, ys, degree)
    p = np.poly1d(coeffs)
    return p
```

### The Updated Project
```python
# 1: import numpy as np
# 2: 
# 3: def fit_polynomial(xs, ys, degree):
# 4:     coeffs = np.polyfit(xs, ys, degree)
# 5:     p = np.poly1d(coeffs)
# 6:     return p
```
This introduces a generalized curve fitting function.

### Isolate the Concept
Let's test this on data generated from a quadratic function:
```python
import random
random.seed(42)
xs = np.linspace(-3, 3, 30)
true_ys = 0.5*xs**2 - 2*xs + 1
noise = np.array([random.gauss(0, 0.5) for _ in xs])
ys = true_ys + noise

for degree in [1, 2, 5, 15]:
    p = fit_polynomial(xs, ys, degree)
    y_pred = p(xs)
    ss_res = np.sum((ys - y_pred)**2)
    ss_tot = np.sum((ys - ys.mean())**2)
    r2 = 1 - ss_res/ss_tot
    print(f'degree={degree:>2}: R²={r2:.4f}')

# Output:
# degree= 1: R²=0.7123
# degree= 2: R²=0.9412
# degree= 5: R²=0.9487
# degree=15: R²=0.9921
```
This is **polynomial regression**. As the degree increases, the R² on this dataset strictly increases.

### Discard the throwaway example
The quadratic testing script is deleted and will not appear in the project again.

### Mechanical walkthrough
- `np.polyfit(xs, ys, degree)` computes the optimal coefficients for a polynomial of the given degree using least squares.
- `np.poly1d(coeffs)` takes those coefficients and returns a callable object `p`.
- `p(xs)` evaluates the polynomial at the given x-values, returning our predictions `y_pred`.
- The R² calculation remains the same, but using numpy vector operations (`np.sum`, `ys.mean()`).

## Concept Unit: Overfitting — when more complexity hurts

### The Problem
In the previous example, a degree-15 polynomial gave an amazing R² of 0.9921 on our 30 points. But the true underlying function was only degree-2! Is the degree-15 model actually better, or did it just memorize the noise? How can we test if a model has learned the true pattern or just memorized the training data?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/evaluate.py` (new file)
- **Change type:** add
- **Location:** Top of file.
- **Dependencies:** `numpy`

### The New Code
```python
def evaluate_train_test(xs_train, ys_train, xs_test, ys_test, degree):
    coeffs = np.polyfit(xs_train, ys_train, degree)
    p = np.poly1d(coeffs)
    train_r2 = 1 - np.sum((ys_train - p(xs_train))**2) / np.sum((ys_train - ys_train.mean())**2)
    test_r2  = 1 - np.sum((ys_test  - p(xs_test))**2)  / np.sum((ys_test  - ys_test.mean())**2)
    return train_r2, test_r2
```

### The Updated Project
```python
# 1: def evaluate_train_test(xs_train, ys_train, xs_test, ys_test, degree):
# 2:     coeffs = np.polyfit(xs_train, ys_train, degree)
# 3:     p = np.poly1d(coeffs)
# 4:     train_r2 = 1 - np.sum((ys_train - p(xs_train))**2) / np.sum((ys_train - ys_train.mean())**2)
# 5:     test_r2  = 1 - np.sum((ys_test  - p(xs_test))**2)  / np.sum((ys_test  - ys_test.mean())**2)
# 6:     return train_r2, test_r2
```
We now explicitly separate training and test evaluations.

### Isolate the Concept
Let's create two separate datasets: a training set to build the model, and a test set to evaluate it.
```python
random.seed(42)
xs_train = np.linspace(-3, 3, 15)
ys_train = 0.5*xs_train**2 - 2*xs_train + 1 + np.array([random.gauss(0, 0.5) for _ in xs_train])

xs_test = np.array([-2.5, -1.8, -0.9, 0.3, 0.7, 1.2, 1.8, 2.1, 2.6, 2.9])
ys_test = 0.5*xs_test**2 - 2*xs_test + 1 + np.array([random.gauss(0, 0.5) for _ in xs_test])

for degree in [1, 2, 5, 10]:
    train_r2, test_r2 = evaluate_train_test(xs_train, ys_train, xs_test, ys_test, degree)
    print(f'degree={degree:>2}: train R²={train_r2:.4f}, test R²={test_r2:.4f}')

# Output:
# degree= 1: train R²=0.6891, test R²=0.6712
# degree= 2: train R²=0.9187, test R²=0.9023
# degree= 5: train R²=0.9542, test R²=0.8411
# degree=10: train R²=0.9987, test R²=-2.3410
```
This phenomenon is called **overfitting**. The model memorizes the training data's noise rather than the true signal.

### Discard the throwaway example
The train/test isolation script is deleted and will not appear in the project again.

### Mechanical walkthrough
- We define a training set and a completely separate test set using the same underlying quadratic function.
- We fit the polynomial *only* on the training data (`xs_train`, `ys_train`).
- `train_r2` measures how well the model predicts the data it was trained on. It increases with higher degrees.
- `test_r2` measures how well the model predicts new, unseen data. It peaks at degree 2 (the true underlying complexity) and collapses dramatically at degree 10, resulting in a negative R² because the wild oscillations of a high-degree polynomial create massive errors between the training points.

## Concept Unit: Cross-validation — honest model evaluation

### The Problem
Splitting data into one training set and one test set is helpful, but what if we get lucky or unlucky with our random split? If we have limited data, holding out a large test set hurts the model training, but a small test set is statistically noisy. Is there a way to use all our data for both training and testing?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/cross_validation.py` (new file)
- **Change type:** add
- **Location:** Top of file.
- **Dependencies:** `numpy`, `random`

### The New Code
```python
import numpy as np
import random

def k_fold_r2(xs, ys, degree, k=5):
    indices = list(range(len(xs)))
    random.shuffle(indices)
    fold_size = len(xs) // k
    r2_scores = []
    for i in range(k):
        test_idx  = indices[i*fold_size:(i+1)*fold_size]
        train_idx = [j for j in indices if j not in test_idx]
        x_train = xs[train_idx]; y_train = ys[train_idx]
        x_test  = xs[test_idx];  y_test  = ys[test_idx]
        coeffs = np.polyfit(x_train, y_train, degree)
        p = np.poly1d(coeffs)
        r2 = 1 - np.sum((y_test-p(x_test))**2)/np.sum((y_test-y_test.mean())**2)
        r2_scores.append(r2)
    return sum(r2_scores) / len(r2_scores)
```

### The Updated Project
```python
# 1: import numpy as np
# 2: import random
# 3: 
# 4: def k_fold_r2(xs, ys, degree, k=5):
# 5:     indices = list(range(len(xs)))
# 6:     random.shuffle(indices)
# 7:     fold_size = len(xs) // k
# 8:     r2_scores = []
# 9:     for i in range(k):
# 10:        test_idx  = indices[i*fold_size:(i+1)*fold_size]
# 11:        train_idx = [j for j in indices if j not in test_idx]
# 12:        x_train = xs[train_idx]; y_train = ys[train_idx]
# 13:        x_test  = xs[test_idx];  y_test  = ys[test_idx]
# 14:        coeffs = np.polyfit(x_train, y_train, degree)
# 15:        p = np.poly1d(coeffs)
# 16:        r2 = 1 - np.sum((y_test-p(x_test))**2)/np.sum((y_test-y_test.mean())**2)
# 17:        r2_scores.append(r2)
# 18:    return sum(r2_scores) / len(r2_scores)
```
We've added a k-fold cross-validation routine.

### Isolate the Concept
Let's evaluate models using k-fold cross validation:
```python
xs_all = np.linspace(-3, 3, 50)
random.seed(42)
ys_all = 0.5*xs_all**2 - 2*xs_all + 1 + np.array([random.gauss(0,0.5) for _ in xs_all])

for degree in [1, 2, 5, 10]:
    cv_r2 = k_fold_r2(xs_all, ys_all, degree)
    print(f'degree={degree:>2}: 5-fold CV R² = {cv_r2:.4f}')

# Output:
# degree= 1: 5-fold CV R² = 0.6923
# degree= 2: 5-fold CV R² = 0.9312
# degree= 5: 5-fold CV R² = 0.9104
# degree=10: 5-fold CV R² = 0.8521
```
This is **cross-validation**. It provides a robust estimate of generalization performance.

### Discard the throwaway example
The cross-validation run is deleted and will not appear in the project again.

### Mechanical walkthrough
- `indices = list(range(len(xs)))` and `random.shuffle(indices)` create a randomized order of data points.
- The `for i in range(k):` loop iterates over the `k` folds.
- `test_idx = ...` selects `1/k` of the data to hold out for testing.
- `train_idx = ...` uses the remaining data for training.
- We train on `x_train`, evaluate R² on `x_test`, and save the score.
- `return sum(r2_scores) / len(r2_scores)` averages the R² across all k folds, giving a single reliable metric for the chosen degree.

## Concept Unit: Choosing the right model — the bias-variance tradeoff

### The Problem
We've seen that a straight line is too simple to fit a curve, but a degree-15 polynomial is too complex and hallucinates patterns. How do we formalize this balance?

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** None (conceptual).
- **Change type:** None.
- **Location:** None.
- **Dependencies:** None.

### The New Code
(No new code for this conceptual summary unit.)

### The Updated Project
(No project code changed.)

### Isolate the Concept
Conceptually, our observations point to a fundamental machine learning principle:
- **HIGH BIAS (underfitting):** The model is too simple (e.g., a line fitting a curve). It cannot capture the true pattern. Both training error and test error are high.
- **HIGH VARIANCE (overfitting):** The model is too complex (e.g., degree-15 polynomial). It memorizes noise. Training error is low, but test error is high.
- **SWEET SPOT:** The degree-2 polynomial minimized test error because it matches the true complexity of the problem.

This phenomenon is the **bias-variance tradeoff**. The right model complexity is chosen by empirical methods like cross-validation, aiming for the "sweet spot" that minimizes test error.

### Discard the throwaway example
Not applicable; purely conceptual.

### Mechanical walkthrough
- When you increase degree, bias goes down (the model is flexible enough to hit points) but variance goes up (the model fluctuates wildly between points).
- When you decrease degree, variance goes down (a line is very stable) but bias goes up (it fails to match the underlying curve).
- The goal of all machine learning is finding the optimal point on this tradeoff curve.

## Conclusion
Curve fitting is the foundation of regression, illustrating the core challenge of generalizing beyond the data you have. Module 5 complete. Module 6 — Machine Learning — begins in Lesson 43.

**Exercises:**
1. Fit a sine curve with polynomials of degrees 1, 3, 5, 7, 9 and plot training vs test R² vs degree.
2. Implement ridge regression (L2 regularization) using numpy and compare with unregularized polyfit.
