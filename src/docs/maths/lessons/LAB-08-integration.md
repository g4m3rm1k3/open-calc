# Computational Mathematics — LAB 08 — Integration: Riemann Sums to SciPy
**Prerequisites:** LAB-01 (NumPy), LAB-07 (derivatives — you know what f'(x) is). Basic calculus — you know integration is the reverse of differentiation.
**Environment:** Python 3.10+ | pip install numpy matplotlib scipy sympy | python lab08.py
**Time:** 75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A car travels at a constant 6 m/s for 3 seconds. How far does it travel? Write out the calculation. What shape does this draw on a velocity-time graph?
> 2. Now the car speeds up — its velocity at time t is v(t) = 2t m/s. At t=1 it is going 2 m/s, at t=2 it is going 4 m/s, at t=3 it is going 6 m/s. Is the total distance more or less than 18 m? Why?
> 3. *(Prediction)* If you cut the 0–3 second interval into 100 tiny slices and treat each slice as constant velocity, will your distance estimate be more accurate than using 10 slices? Why?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A script that computes the same integral four ways — from scratch rectangles up to scipy's adaptive algorithm — and shows you exactly how accurate each method is:

```
=== The Problem ===
Car velocity: v(t) = 2t m/s
Distance from t=0 to t=3 seconds

=== Exact answer ===
Triangle area: 1/2 * base * height = 1/2 * 3 * 6 = 9.0 meters

=== Riemann Sums (n=10 rectangles) ===
Left Riemann:     8.100  error: 0.9000  (10.00%)
Right Riemann:    9.900  error: 0.9000  (10.00%)
Midpoint rule:    9.000  error: 0.0000  (0.00%)
Trapezoid rule:   9.000  error: 0.0000  (0.00%)

=== Riemann Sums (n=100 rectangles) ===
Left Riemann:     8.910  error: 0.0900  (1.00%)
Right Riemann:    9.090  error: 0.0900  (1.00%)
Midpoint rule:    9.000  error: 0.0000  (0.00%)
Trapezoid rule:   9.000  error: 0.0000  (0.00%)

=== scipy.integrate.quad ===
Result: 9.000000000000000  Estimated error: 9.99e-14

=== SymPy exact symbolic answer ===
Antiderivative of 2t: t**2
Evaluated from 0 to 3: 9
```

---

## Part 1 — The Physical Problem

### Why We Need Integration

You have already seen derivatives: given a position function p(t), the derivative p'(t) gives velocity — the *rate of change*.

Integration is the reverse question. Given a *rate of change*, find the *accumulated total*.

**The physical setup:**

A car starts from rest at t=0. Its velocity at time t is:

```
v(t) = 2t   (meters per second)
```

At t=0, the car is not moving. At t=1, it is going 2 m/s. At t=3, it is going 6 m/s.

**Question:** How far does it travel between t=0 and t=3 seconds?

If velocity were constant at 6 m/s the whole time, the answer would be simple:

```
distance = velocity × time = 6 × 3 = 18 meters
```

But the velocity is not constant. For the first second, the car was moving slowly. The actual distance must be *less* than 18 meters.

**Step 1 — Set up the file and see the problem:**

Create `lab08.py` and add this opening section:

```python
import numpy as np                    # arrays and math
import matplotlib.pyplot as plt       # plotting
from scipy.integrate import quad      # numerical integration
import sympy as sp                    # symbolic math

# ============================================================
# PART 1: The Physical Problem
# ============================================================

# Our velocity function: v(t) = 2t meters per second
def v(t):
    return 2 * t                      # velocity grows linearly with time

# The time interval we care about
a = 0                                 # start time (seconds)
b = 3                                 # end time (seconds)

# Plot the velocity-time graph to see what we're dealing with
t_plot = np.linspace(0, 3, 300)      # 300 points for a smooth curve
v_plot = v(t_plot)                    # velocity at each point

plt.figure(figsize=(8, 5))
plt.plot(t_plot, v_plot, 'b-', linewidth=2, label='v(t) = 2t')
plt.fill_between(t_plot, v_plot, alpha=0.3, color='blue', label='Distance = this area')
plt.xlabel('Time (seconds)')
plt.ylabel('Velocity (m/s)')
plt.title('Velocity-Time Graph: Area = Distance Traveled')
plt.legend()
plt.grid(True)
plt.savefig('lab08_part1_velocity.png', dpi=100)
plt.show()
print("Saved: lab08_part1_velocity.png")
```

Run it: `python lab08.py`

You should see a straight line from (0,0) to (3,6) with the area under it shaded blue. **That shaded area IS the distance the car travels.** The triangle has base 3 and height 6, so area = (1/2)(3)(6) = 9 meters.

> **Concept checkpoint:** Integration computes accumulated totals. Distance is accumulated velocity. Volume is accumulated area. Mass is accumulated density. The shape of the curve does not matter — integration handles any curve.

---

## Part 2 — The Geometric Idea: Rectangles Fill the Area

### Why Rectangles Work

We know triangles and rectangles. We do not have a formula for the area under an arbitrary curve. But we know that if a rectangle is very thin, its area is:

```
area = height × width = f(x) × Δx
```

If we fill the area under the curve with many thin rectangles, the sum of all rectangle areas approximates the total area under the curve.

**The key insight:** as rectangles get thinner (Δx → 0), the approximation gets better. This is the entire mathematical idea behind integration.

**Step 2 — Build the Left Riemann Sum from scratch:**

Add this to `lab08.py`:

```python
# ============================================================
# PART 2: Riemann Sums — Building Integration from Scratch
# ============================================================

# --- LEFT RIEMANN SUM ---
# Divide [a,b] into n equal slices. Each slice is a rectangle.
# Height of rectangle = function value at the LEFT edge of that slice.

def left_riemann(f, a, b, n):
    dx = (b - a) / n                        # width of each rectangle (all equal)
    x_left = np.linspace(a, b - dx, n)      # left edge of each of the n rectangles
    heights = f(x_left)                     # function value at each left edge
    areas = heights * dx                    # area of each rectangle: height × width
    return np.sum(areas)                    # total area = sum of all rectangles

# Test it with our velocity problem
exact = 9.0                                 # we know the triangle area is 9
for n in [5, 10, 100, 1000]:
    approx = left_riemann(v, 0, 3, n)
    error = abs(approx - exact)
    print(f"Left Riemann  n={n:5d}: {approx:.6f}  error: {error:.6f}")
```

Run it. You will see the error shrinks as n grows, but slowly — cutting error in half requires doubling n.

**Step 3 — Visualize the rectangles to make the idea concrete:**

```python
# Draw the rectangles so you can SEE why this works
def plot_riemann_rectangles(f, a, b, n, method='left', ax=None, color='orange'):
    """Draw the Riemann rectangles on a plot so you can see them."""
    dx = (b - a) / n                        # rectangle width

    if method == 'left':
        x_eval = np.linspace(a, b - dx, n) # evaluate at left edges
    elif method == 'right':
        x_eval = np.linspace(a + dx, b, n) # evaluate at right edges
    elif method == 'midpoint':
        x_eval = np.linspace(a + dx/2, b - dx/2, n)  # evaluate at midpoints

    if ax is None:
        ax = plt.gca()

    for i, x in enumerate(x_eval):
        height = f(x)                       # height of this rectangle
        rect = plt.Rectangle(               # draw one rectangle
            (a + i*dx, 0),                  # bottom-left corner of rectangle
            dx,                             # width
            height,                         # height
            alpha=0.4,
            facecolor=color,
            edgecolor='black',
            linewidth=0.5
        )
        ax.add_patch(rect)

# Plot n=5 vs n=20 rectangles side by side
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
t_dense = np.linspace(0, 3, 300)

for ax, n, title in zip(axes, [5, 20], ['n=5 rectangles', 'n=20 rectangles']):
    ax.plot(t_dense, v(t_dense), 'b-', linewidth=2, label='v(t) = 2t')  # actual curve
    plot_riemann_rectangles(v, 0, 3, n, method='left', ax=ax, color='orange')
    ax.fill_between(t_dense, v(t_dense), alpha=0.15, color='blue')       # true area
    ax.set_xlabel('Time (s)')
    ax.set_ylabel('Velocity (m/s)')
    ax.set_title(f'Left Riemann Sum: {title}')
    ax.set_xlim(0, 3)
    ax.set_ylim(0, 7)
    ax.legend()
    ax.grid(True)
    approx = left_riemann(v, 0, 3, n)
    ax.text(0.05, 0.95, f'Approx: {approx:.3f}\nExact: 9.000',
            transform=ax.transAxes, verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='wheat'))

plt.tight_layout()
plt.savefig('lab08_part2_rectangles.png', dpi=100)
plt.show()
print("Saved: lab08_part2_rectangles.png")
```

Run it. With n=5, you can see the rectangles missing pieces of the curve (undercounting) because the left edge is always below the curve for a rising function. With n=20, the rectangles fill the area much more snugly.

> **Concept checkpoint:** Left Riemann sum *understimates* for increasing functions (the left edge is always lower than the curve). Right Riemann sum *overestimates* for the same reason. This means the true answer always lies between them.

---

## Part 3 — Four Methods: Better Approximations

### Making the Approximation Smarter

Left Riemann is the simplest idea but not the best. Two improvements:

- **Midpoint rule:** use the function value at the *center* of each rectangle. This samples a more representative height and cancels some of the left/right error.
- **Trapezoid rule:** instead of a flat-topped rectangle, connect the left and right edges with a diagonal line. This creates a trapezoid that hugs the curve better.

**Step 4 — Build all four methods:**

```python
# ============================================================
# PART 3: Four Approximation Methods
# ============================================================

# --- RIGHT RIEMANN SUM ---
# Same idea as left, but use the RIGHT edge of each rectangle for height.
def right_riemann(f, a, b, n):
    dx = (b - a) / n
    x_right = np.linspace(a + dx, b, n)    # right edge of each rectangle
    return np.sum(f(x_right) * dx)         # sum of all rectangle areas

# --- MIDPOINT RULE ---
# Use the function value at the CENTER of each rectangle.
# More accurate because midpoint errors partially cancel out.
def midpoint_rule(f, a, b, n):
    dx = (b - a) / n
    x_mid = np.linspace(a + dx/2, b - dx/2, n)  # midpoint of each slice
    return np.sum(f(x_mid) * dx)

# --- TRAPEZOID RULE ---
# Each slice is a trapezoid (not a rectangle): area = (left + right)/2 * width.
# Equivalent to averaging left and right Riemann sums.
def trapezoid_rule(f, a, b, n):
    x = np.linspace(a, b, n + 1)           # n+1 points create n trapezoids
    y = f(x)                               # function value at each point
    dx = (b - a) / n
    # Standard trapezoid formula: dx/2 * (first + 2*middles + last)
    return dx / 2 * (y[0] + 2 * np.sum(y[1:-1]) + y[-1])

# Compare all four methods for the car problem
print("\n=== Comparing All Four Methods: v(t)=2t from 0 to 3 ===")
print(f"{'Method':<18} {'n=10':>10} {'n=100':>10} {'n=1000':>10}")
print("-" * 52)

for name, fn in [('Left Riemann', left_riemann),
                 ('Right Riemann', right_riemann),
                 ('Midpoint', midpoint_rule),
                 ('Trapezoid', trapezoid_rule)]:
    row = f"{name:<18}"
    for n in [10, 100, 1000]:
        val = fn(v, 0, 3, n)
        row += f" {val:>10.6f}"
    print(row)
print(f"{'Exact':<18} {'9.000000':>10} {'9.000000':>10} {'9.000000':>10}")
```

Run it. You will notice midpoint and trapezoid hit exactly 9.000000 even at n=10 for this particular function. That is because v(t)=2t is linear — trapezoids match a straight line perfectly, and the midpoint of a straight line is exactly the average.

**Step 5 — Test all four methods on a harder function:**

```python
# v(t)=2t is too easy for trapezoid — it's linear, so trapezoids are exact.
# Let's try sin(x) from 0 to pi, where the exact answer is 2.

import math
f_sin = np.sin                         # use numpy's sin function

exact_sin = 2.0                        # exact: integral of sin from 0 to pi = 2

print("\n=== Comparing All Four Methods: sin(x) from 0 to pi ===")
print(f"{'Method':<18} {'n=10':>12} {'n=100':>12} {'n=1000':>12}")
print("-" * 58)

for name, fn in [('Left Riemann', left_riemann),
                 ('Right Riemann', right_riemann),
                 ('Midpoint', midpoint_rule),
                 ('Trapezoid', trapezoid_rule)]:
    row = f"{name:<18}"
    for n in [10, 100, 1000]:
        val = fn(f_sin, 0, math.pi, n)
        row += f" {val:>12.8f}"
    print(row)
print(f"{'Exact':<18} {'2.00000000':>12} {'2.00000000':>12} {'2.00000000':>12}")
```

Run it. Now you see real differences between methods. Left and right Riemann converge slowly. Midpoint and trapezoid converge much faster.

---

## Part 4 — Error Analysis: How Fast Do Methods Improve?

### Understanding Convergence

When you double n, how much does the error shrink? This tells you how *efficient* a method is.

- Left/Right Riemann: error ~ 1/n. Double n → error halves. (**First-order convergence**)
- Midpoint/Trapezoid: error ~ 1/n². Double n → error quarters. (**Second-order convergence**)

On a log-log plot, first-order convergence is a line with slope -1, second-order is a line with slope -2. You can literally *see* how fast a method converges.

**Step 6 — Build the error analysis:**

```python
# ============================================================
# PART 4: Error Analysis — How Fast Do Methods Converge?
# ============================================================

# Test with sin(x) from 0 to pi, exact answer = 2
exact_sin = 2.0
n_values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]  # powers of 2

errors = {
    'Left Riemann':  [],
    'Right Riemann': [],
    'Midpoint':      [],
    'Trapezoid':     [],
}

for n in n_values:
    errors['Left Riemann'].append( abs(left_riemann(f_sin, 0, math.pi, n)  - exact_sin))
    errors['Right Riemann'].append(abs(right_riemann(f_sin, 0, math.pi, n) - exact_sin))
    errors['Midpoint'].append(     abs(midpoint_rule(f_sin, 0, math.pi, n) - exact_sin))
    errors['Trapezoid'].append(    abs(trapezoid_rule(f_sin, 0, math.pi, n)- exact_sin))

# Print as table
print("\n=== Error Table: sin(x) from 0 to pi ===")
print(f"{'n':>6}  {'Left':>12}  {'Right':>12}  {'Midpoint':>12}  {'Trapezoid':>12}")
print("-" * 64)
for i, n in enumerate(n_values):
    print(f"{n:>6}  "
          f"{errors['Left Riemann'][i]:>12.8f}  "
          f"{errors['Right Riemann'][i]:>12.8f}  "
          f"{errors['Midpoint'][i]:>12.8f}  "
          f"{errors['Trapezoid'][i]:>12.8f}")

# Plot on log-log scale so convergence rates appear as straight lines
plt.figure(figsize=(9, 6))
colors = {'Left Riemann': 'red', 'Right Riemann': 'orange',
          'Midpoint': 'green', 'Trapezoid': 'blue'}

for name, err_list in errors.items():
    plt.loglog(n_values, err_list,               # log-log makes rates visible
               marker='o', label=name,
               color=colors[name], linewidth=2)

# Draw reference lines showing what slope -1 and slope -2 look like
ref_n = np.array(n_values, dtype=float)
plt.loglog(ref_n, 3.0/ref_n,    'k--', alpha=0.4, label='slope -1 (1st order)')  # 1/n line
plt.loglog(ref_n, 2.0/ref_n**2, 'k:',  alpha=0.4, label='slope -2 (2nd order)')  # 1/n^2 line

plt.xlabel('Number of rectangles (n)')
plt.ylabel('Absolute error')
plt.title('Error vs n: log-log scale shows convergence rate')
plt.legend()
plt.grid(True, which='both', alpha=0.3)
plt.savefig('lab08_part4_convergence.png', dpi=100)
plt.show()
print("Saved: lab08_part4_convergence.png")
```

Run it. On the log-log plot, Left and Right Riemann should run parallel to the slope=-1 reference line. Midpoint and Trapezoid should run parallel to the slope=-2 reference line.

> **Concept checkpoint:** Second-order convergence is not just twice as good — it is *order-of-magnitude* better for large n. At n=1000, second-order methods have roughly 1/1000000 error while first-order methods have only 1/1000. This is why simple Riemann sums are rarely used in practice.

---

## Part 5 — The Limitation: Why Riemann Sums Are Not Enough

### When DIY Integration Fails

Riemann sums work well when the function is smooth and the integrand is simple. They fail — or become impractically slow — in three situations:

1. **Oscillating functions:** sin(1/x) near x=0 oscillates infinitely fast. You need millions of rectangles.
2. **Singularities:** 1/sqrt(x) at x=0 is infinite, but the integral is finite. Rectangles cannot represent this.
3. **Slow convergence:** even for smooth functions, getting 15 digits of precision with rectangles requires ~10^7 or more slices.

**Step 7 — See where rectangles struggle:**

```python
# ============================================================
# PART 5: Where Riemann Sums Fail
# ============================================================

# A function with a weak singularity: 1/sqrt(x)
# The integral from 0 to 1 = 2 (exact), but f(0) is infinite.
def f_sqrt_singular(x):
    return 1.0 / np.sqrt(np.where(x > 0, x, 1e-300))  # avoid dividing by zero

# Try to integrate with left Riemann — the first rectangle is huge
print("\n=== Struggling: integral of 1/sqrt(x) from 0 to 1, exact = 2.0 ===")
for n in [100, 1000, 10000]:
    approx = left_riemann(f_sqrt_singular, 1e-10, 1.0, n)  # avoid x=0 exactly
    print(f"Left Riemann n={n:6d}: {approx:.6f}  error: {abs(approx-2.0):.6f}")

# This converges, but very slowly. The singularity at x=0 makes the first
# rectangle dominate the error no matter how many slices you use.

# Now show the limitation is in our method, not in the math.
# scipy.integrate.quad handles this automatically.
from scipy.integrate import quad
result, err_estimate = quad(f_sqrt_singular, 0, 1)        # quad handles the singularity
print(f"scipy.quad:            {result:.15f}  estimated error: {err_estimate:.2e}")
print("(quad gets it right even starting from 0)")
```

Run it. Your Riemann sum is still off even at n=10000. scipy.quad nails it.

> **Transition:** Riemann sums are the *idea* behind integration. But for actual computation, scipy.integrate.quad uses adaptive Gaussian quadrature — a method that automatically concentrates evaluation points where the function changes rapidly and uses higher-order polynomial fitting. You do not need to understand the internals to use it correctly.

---

## Part 6 — scipy.integrate.quad: The Right Tool

### How quad Works

`quad` takes a function and an interval and returns `(result, error_estimate)`. The error estimate is not exact, but it is a reliable upper bound on the true error in almost all cases.

```
quad(f, a, b)
  → adaptively subdivides [a,b] wherever f changes most rapidly
  → fits high-order polynomials on each subdivision
  → combines polynomial integrals analytically
  → result is accurate to ~15 digits for most smooth functions
```

**Step 8 — Use quad on all our test cases:**

```python
# ============================================================
# PART 6: scipy.integrate.quad
# ============================================================

from scipy.integrate import quad   # import the function

# --- Test 1: car velocity problem ---
# quad returns (value, error_estimate)
result, err = quad(v, 0, 3)        # integrate v(t)=2t from 0 to 3
print(f"\nCar problem: distance = {result:.15f}  (exact: 9.0)")
print(f"  quad error estimate: {err:.2e}")

# --- Test 2: sin(x) from 0 to pi ---
result_sin, err_sin = quad(np.sin, 0, math.pi)
print(f"\nsin(x) 0 to pi: {result_sin:.15f}  (exact: 2.0)")
print(f"  quad error estimate: {err_sin:.2e}")

# --- Test 3: the singular function ---
result_sq, err_sq = quad(f_sqrt_singular, 0, 1)
print(f"\n1/sqrt(x) 0 to 1: {result_sq:.15f}  (exact: 2.0)")
print(f"  quad error estimate: {err_sq:.2e}")

# --- Test 4: a function where we know the exact answer via formula ---
# integral of x^2 from 0 to 1 = 1/3
result_x2, _ = quad(lambda x: x**2, 0, 1)
print(f"\nx^2 from 0 to 1: {result_x2:.15f}  (exact: {1/3:.15f})")

# --- Test 5: a function with no simple antiderivative ---
# integral of e^(-x^2) from -inf to inf = sqrt(pi)
# This has no closed form antiderivative, but quad handles infinite limits
import scipy.special
result_gauss, _ = quad(lambda x: np.exp(-x**2), -np.inf, np.inf)
print(f"\ne^(-x^2) from -inf to inf: {result_gauss:.15f}  (exact: sqrt(pi) = {math.sqrt(math.pi):.15f})")
print("  (This has no antiderivative formula — quad works anyway)")
```

Run it. Notice that quad achieves 15 digits of accuracy in milliseconds for all of these, including the one with an infinite limit.

**Step 9 — Compare quad vs Riemann accuracy head-to-head:**

```python
# Side-by-side comparison: accuracy vs computation effort
import time

test_fn = lambda x: np.sin(x) * np.exp(-x/5)  # interesting function
a_test, b_test = 0, 10                          # integration interval

# What is the truth? Use quad with very tight tolerances
truth, _ = quad(test_fn, a_test, b_test, limit=200, epsabs=1e-14)

print(f"\n=== Accuracy vs Cost: integral of sin(x)*exp(-x/5) from 0 to 10 ===")
print(f"{'Method':<22}  {'n/calls':>8}  {'result':>18}  {'error':>12}  {'time (ms)':>10}")
print("-" * 80)

# Time each Riemann method
for name, fn in [('Left Riemann', left_riemann),
                 ('Right Riemann', right_riemann),
                 ('Midpoint', midpoint_rule),
                 ('Trapezoid', trapezoid_rule)]:
    for n in [100, 10000]:
        t0 = time.perf_counter()
        val = fn(test_fn, a_test, b_test, n)
        elapsed = (time.perf_counter() - t0) * 1000
        print(f"{name:<22}  {n:>8d}  {val:>18.12f}  {abs(val-truth):>12.2e}  {elapsed:>10.2f}")

# Time quad
t0 = time.perf_counter()
val_quad, _ = quad(test_fn, a_test, b_test)
elapsed = (time.perf_counter() - t0) * 1000
print(f"{'scipy.quad':<22}  {'~21':>8}  {val_quad:>18.12f}  {abs(val_quad-truth):>12.2e}  {elapsed:>10.2f}")
```

Run it. scipy.quad uses roughly 21 function evaluations and beats Riemann at n=10000. This is the power of adaptive methods.

---

## Part 7 — The Fundamental Theorem of Calculus

### The Bridge Between Differentiation and Integration

You learned in LAB-07 that the derivative measures instantaneous rate of change. Integration measures accumulated total. These two operations are inverses of each other. That relationship is the Fundamental Theorem of Calculus:

```
If F'(x) = f(x), then:

∫[a,b] f(x) dx = F(b) - F(a)
```

In plain language: if you can find the antiderivative F, you can compute any definite integral instantly by just evaluating F at the endpoints.

**Verifying numerically — accumulating area and comparing to the antiderivative:**

For v(t) = 2t, the antiderivative is V(t) = t². The integral from 0 to T should equal T² - 0² = T².

**Step 10 — Verify the Fundamental Theorem numerically:**

```python
# ============================================================
# PART 7: The Fundamental Theorem of Calculus
# ============================================================

# For v(t) = 2t, the antiderivative is V(t) = t^2
# FTC says: integral from 0 to T of 2t dt  =  T^2 - 0^2  =  T^2
# Let's verify this numerically for many values of T

T_values = np.linspace(0.1, 4.0, 40)       # many upper limits

# For each T, compute integral from 0 to T using quad
integrals = []
for T in T_values:
    val, _ = quad(v, 0, T)                 # accumulate from 0 to each T
    integrals.append(val)

integrals = np.array(integrals)
antiderivative = T_values**2               # the antiderivative V(T) = T^2

# If FTC holds, integrals and antiderivative should be equal
plt.figure(figsize=(8, 5))
plt.plot(T_values, integrals,       'b-',  linewidth=2, label='∫₀ᵀ 2t dt  (quad)')
plt.plot(T_values, antiderivative,  'r--', linewidth=2, label='T²  (antiderivative)')
plt.xlabel('T (upper limit)')
plt.ylabel('Value')
plt.title('FTC Verification: Accumulated integral equals antiderivative')
plt.legend()
plt.grid(True)
plt.savefig('lab08_part7_ftc.png', dpi=100)
plt.show()
print("Saved: lab08_part7_ftc.png")

# Confirm the error is at machine precision (~10^-14)
max_error = np.max(np.abs(integrals - antiderivative))
print(f"\nMax error between quad result and antiderivative: {max_error:.2e}")
print("(Should be near machine precision ~1e-14)")
```

Run it. The two curves overlap exactly. The max error is around 1e-14 — machine precision.

> **Concept checkpoint:** The derivative of the accumulated area function gives back the original function. Integration and differentiation literally undo each other. This is why `∫ 2t dt = t²` — because `d/dt [t²] = 2t`. When you use quad or any numerical integrator, you are computing the same quantity that the antiderivative formula gives, just without needing to know the formula.

---

## Part 8 — SymPy: Exact Symbolic Integration

### When You Need the Exact Antiderivative

Numerical integration (quad) gives floating-point numbers. Sometimes you need exact symbolic answers — for homework, for formulas, or for understanding what the antiderivative actually is.

SymPy computes antiderivatives symbolically, the way you do by hand in calculus class, but without errors.

**Step 11 — Use SymPy to compute antiderivatives:**

```python
# ============================================================
# PART 8: SymPy — Exact Symbolic Integration
# ============================================================

import sympy as sp

t = sp.Symbol('t')   # symbolic variable named t
x = sp.Symbol('x')   # another symbolic variable

# --- Example 1: car velocity problem ---
v_sym = 2 * t                                    # symbolic expression for v(t) = 2t
antideriv_v = sp.integrate(v_sym, t)             # indefinite integral (antiderivative)
print(f"\nAntiderivative of 2t:  {antideriv_v}")  # should print t**2

definite = sp.integrate(v_sym, (t, 0, 3))        # definite integral from 0 to 3
print(f"∫₀³ 2t dt = {definite}")                  # should print 9

# --- Example 2: power rule verification ---
for power in [1, 2, 3, 4]:
    expr = x**power
    anti = sp.integrate(expr, x)                  # compute antiderivative
    print(f"∫ x^{power} dx = {anti}  (power rule: x^{power+1}/{power+1})")

# --- Example 3: trig functions ---
anti_sin = sp.integrate(sp.sin(x), x)
print(f"\n∫ sin(x) dx = {anti_sin}")              # should be -cos(x)

anti_cos = sp.integrate(sp.cos(x), x)
print(f"∫ cos(x) dx = {anti_cos}")               # should be sin(x)

# --- Example 4: definite integral of sin from 0 to pi ---
sin_definite = sp.integrate(sp.sin(x), (x, 0, sp.pi))
print(f"\n∫₀^π sin(x) dx = {sin_definite}")       # should be 2

# --- Example 5: a function that requires substitution ---
expr_sub = x * sp.exp(x**2)                      # x * e^(x^2)
anti_sub = sp.integrate(expr_sub, x)
print(f"\n∫ x*e^(x^2) dx = {anti_sub}")           # should be exp(x^2)/2

# --- Example 6: integration by parts (SymPy does it automatically) ---
expr_parts = x * sp.exp(x)                       # x * e^x
anti_parts = sp.integrate(expr_parts, x)
print(f"∫ x*e^x dx = {anti_parts}")              # should be (x-1)*e^x
```

Run it. SymPy returns exact results as mathematical expressions, not floating-point numbers. This is useful for checking your homework.

**Step 12 — Use SymPy to check a harder integral and then verify with quad:**

```python
# A more interesting function: x^2 * sin(x)
expr_hard = x**2 * sp.sin(x)
anti_hard = sp.integrate(expr_hard, x)
print(f"\nAntiderivative of x^2 * sin(x):\n  {anti_hard}")

# Definite integral from 0 to pi
definite_hard = sp.integrate(expr_hard, (x, 0, sp.pi))
print(f"\n∫₀^π x^2 * sin(x) dx = {definite_hard}")          # symbolic exact answer
print(f"  Numeric value: {float(definite_hard):.10f}")

# Verify with quad
f_hard_numeric = lambda val: val**2 * np.sin(val)            # lambda version for quad
result_quad, _ = quad(f_hard_numeric, 0, math.pi)
print(f"  scipy.quad:    {result_quad:.10f}")
print(f"  Match: {abs(float(definite_hard) - result_quad) < 1e-10}")
```

Run it. SymPy and quad agree to 10+ decimal places.

---

## Part 9 — Double Integrals: A Preview

### Integrating Over a 2D Region

A double integral computes volume under a surface (or area, mass, probability over a 2D region). The idea is the same as 1D: slice, approximate, sum.

```
∫∫ f(x,y) dA  =  ∫[x_min to x_max] [ ∫[y_min to y_max] f(x,y) dy ] dx
```

**Step 13 — Use dblquad for a 2D integral:**

```python
# ============================================================
# PART 9: Double Integrals — Preview
# ============================================================

from scipy.integrate import dblquad   # double integral

# --- Example: integral of f(x,y) = x*y over [0,1] × [0,1] ---
# By hand: ∫₀¹ ∫₀¹ x*y dy dx = ∫₀¹ x * [y²/2]₀¹ dx = ∫₀¹ x/2 dx = 1/4
def f_xy(y, x):                           # NOTE: dblquad wants f(y, x) order
    return x * y

# dblquad(func, x_lower, x_upper, y_lower, y_upper)
result_2d, err_2d = dblquad(f_xy, 0, 1, 0, 1)
print(f"\n∫∫ x*y dA over [0,1]x[0,1] = {result_2d:.10f}")
print(f"  Exact answer: 0.25")
print(f"  Error estimate: {err_2d:.2e}")

# --- A more interesting case: Gaussian bell curve in 2D ---
# ∫∫ e^(-(x^2+y^2)) dA over all of R^2 = pi
def f_gauss2d(y, x):
    return np.exp(-(x**2 + y**2))         # 2D Gaussian

# Approximate with large but finite limits (true limit is infinity)
result_gauss2d, _ = dblquad(f_gauss2d, -5, 5, -5, 5)
print(f"\n∫∫ e^(-(x^2+y^2)) dA ≈ {result_gauss2d:.10f}")
print(f"  Exact (over all R^2): pi = {math.pi:.10f}")

# --- Verify with SymPy ---
x_sym, y_sym = sp.symbols('x y')
expr_2d = x_sym * y_sym
result_sym = sp.integrate(sp.integrate(expr_2d, (y_sym, 0, 1)), (x_sym, 0, 1))
print(f"\nSymPy double integral x*y over [0,1]x[0,1] = {result_sym}")
```

Run it. The double integral matches the by-hand calculation.

---

## Part 10 — Full Visualization

### Bringing It All Together

**Step 14 — Build the complete four-panel summary plot:**

```python
# ============================================================
# PART 10: Complete Visualization Summary
# ============================================================

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Integration: From Riemann Sums to scipy', fontsize=14)

# --- Panel 1: Riemann rectangles for v(t)=2t ---
ax1 = axes[0, 0]
t_dense = np.linspace(0, 3, 300)
ax1.plot(t_dense, v(t_dense), 'b-', linewidth=2.5, label='v(t) = 2t', zorder=5)
ax1.fill_between(t_dense, v(t_dense), alpha=0.15, color='blue', label='True area = 9')

# Draw n=8 left Riemann rectangles
n_draw = 8
dx = 3.0 / n_draw
for i in range(n_draw):
    x_left = i * dx
    height = v(x_left)
    rect = plt.Rectangle((x_left, 0), dx, height,
                          alpha=0.5, facecolor='orange', edgecolor='black', linewidth=0.8)
    ax1.add_patch(rect)

ax1.set_xlabel('Time (s)')
ax1.set_ylabel('Velocity (m/s)')
ax1.set_title(f'Left Riemann Sum (n={n_draw})\nApprox: {left_riemann(v,0,3,n_draw):.3f}, Exact: 9.000')
ax1.legend(fontsize=8)
ax1.grid(True, alpha=0.3)
ax1.set_xlim(0, 3)
ax1.set_ylim(0, 7)

# --- Panel 2: All four methods on sin(x) ---
ax2 = axes[0, 1]
x_sin = np.linspace(0, math.pi, 300)
ax2.plot(x_sin, np.sin(x_sin), 'b-', linewidth=2.5, label='sin(x)')
ax2.fill_between(x_sin, np.sin(x_sin), alpha=0.15, color='blue', label='True area = 2')

colors_m = ['red', 'orange', 'green', 'purple']
n_vis = 10
dx_sin = math.pi / n_vis

for method_idx, (method_name, x_evals) in enumerate([
    ('Left', np.linspace(0, math.pi-dx_sin, n_vis)),
    ('Right', np.linspace(dx_sin, math.pi, n_vis)),
    ('Midpoint', np.linspace(dx_sin/2, math.pi-dx_sin/2, n_vis)),
]):
    for i, x_e in enumerate(x_evals):
        rect = plt.Rectangle((i*dx_sin, 0), dx_sin, np.sin(x_e),
                              alpha=0.3, facecolor=colors_m[method_idx],
                              edgecolor='none')
        ax2.add_patch(rect)

ax2.set_xlabel('x')
ax2.set_ylabel('sin(x)')
ax2.set_title(f'Four Methods on sin(x), n={n_vis}')
ax2.set_xlim(0, math.pi)
ax2.set_ylim(0, 1.2)
ax2.legend(fontsize=8)
ax2.grid(True, alpha=0.3)

# --- Panel 3: Error vs n (log-log) ---
ax3 = axes[1, 0]
n_vals_plot = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]
plot_colors = {'Left Riemann': 'red', 'Right Riemann': 'orange',
               'Midpoint': 'green', 'Trapezoid': 'blue'}

for name, fn in [('Left Riemann', left_riemann), ('Right Riemann', right_riemann),
                 ('Midpoint', midpoint_rule), ('Trapezoid', trapezoid_rule)]:
    errs = [abs(fn(np.sin, 0, math.pi, n) - 2.0) for n in n_vals_plot]
    ax3.loglog(n_vals_plot, errs, 'o-', label=name, color=plot_colors[name], linewidth=1.5)

ref_n = np.array(n_vals_plot, dtype=float)
ax3.loglog(ref_n, 3/ref_n,    'k--', alpha=0.4, linewidth=1, label='1/n (1st order)')
ax3.loglog(ref_n, 2/ref_n**2, 'k:',  alpha=0.4, linewidth=1, label='1/n² (2nd order)')
ax3.set_xlabel('n (rectangles)')
ax3.set_ylabel('Absolute error')
ax3.set_title('Error Convergence — sin(x) from 0 to π')
ax3.legend(fontsize=7)
ax3.grid(True, which='both', alpha=0.3)

# --- Panel 4: FTC verification ---
ax4 = axes[1, 1]
T_vals = np.linspace(0.1, 4.0, 50)
integrals_plot = [quad(v, 0, T)[0] for T in T_vals]
ax4.plot(T_vals, integrals_plot, 'b-', linewidth=2.5, label='∫₀ᵀ 2t dt  (quad)')
ax4.plot(T_vals, T_vals**2,      'r--', linewidth=2.5, label='T²  (antiderivative)')
ax4.set_xlabel('T')
ax4.set_ylabel('Value')
ax4.set_title('Fundamental Theorem of Calculus\n∫₀ᵀ 2t dt = T²')
ax4.legend()
ax4.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('lab08_summary.png', dpi=100)
plt.show()
print("Saved: lab08_summary.png")
```

Run it. This is the complete picture: rectangles, four methods compared, convergence rates, and the FTC all in one figure.

---

## Challenge — Variable Force and Work

### The Physics

In physics, work done by a force over a displacement is:

```
W = ∫[a,b] F(x) dx
```

When the force is constant, this is just force × distance. When the force varies with position, you need to integrate.

**The setup:**

A variable force acts on an object:

```
F(x) = x² + 2x   (Newtons)
```

The object is pushed from x=0 to x=5 meters. How much total work is done?

**Your tasks:**

1. Compute the work using Left Riemann sum for n = 10, 100, 1000. Print a table showing how the result changes.

2. Compute using the Trapezoid rule for the same n values. Add to your table.

3. Compute the exact numerical answer with `scipy.integrate.quad`.

4. Compute the exact symbolic answer with SymPy. Show the antiderivative and the evaluated result.

5. Build a single figure with two panels:
   - Left panel: plot F(x) = x²+2x from 0 to 5 with the area shaded, and the n=5 Riemann rectangles overlaid
   - Right panel: a bar chart or table-style comparison of all methods (Left n=10, Left n=100, Left n=1000, Trapezoid n=10, Trapezoid n=100, quad, SymPy)

6. Extension — a trickier function: F(x) = sin(x) + x/2 from 0 to 2π. Claim: the exact answer is π²/4. Is this true? Use SymPy to compute the answer symbolically and report what you find.

**When you're done:**

Your output should include a printed table like:

```
=== Work done by F(x) = x^2 + 2x from 0 to 5 ===
Left Riemann  n=10:    ...
Left Riemann  n=100:   ...
Left Riemann  n=1000:  ...
Trapezoid     n=10:    ...
Trapezoid     n=100:   ...
Trapezoid     n=1000:  ...
scipy.quad:            ...
SymPy exact:           ...
```

And a saved plot `lab08_challenge.png`.

**Stuck?** Ask AI: "I'm computing the integral of x^2 + 2x from 0 to 5 in Python using Riemann sums. Can you explain why my left Riemann sum is overshooting/undershooting?"

**Stuck on the extension?** Ask AI: "I computed the symbolic integral of sin(x) + x/2 from 0 to 2pi using SymPy and got a result that surprises me. Walk me through why the integral of sin(x) over a full period behaves the way it does, and then compute x/2 over the same interval."

---

## Summary

What you built in this lab, in order:

| Step | Concept | Code |
|------|---------|------|
| 1 | Integration = accumulated area under a curve | `plt.fill_between` |
| 2 | Left Riemann sum from scratch | `left_riemann(f, a, b, n)` |
| 3 | Visualizing rectangles | `plt.Rectangle` |
| 4 | Four methods: left, right, midpoint, trapezoid | All four functions |
| 5 | Error shrinks with more rectangles | `abs(approx - exact)` |
| 6 | Log-log plot shows convergence rate | `plt.loglog` |
| 7 | Where Riemann sums fail: singularities | `f_sqrt_singular` |
| 8 | scipy.quad: adaptive, accurate, fast | `quad(f, a, b)` |
| 9 | FTC: antiderivative = accumulated integral | `quad(v, 0, T)` vs `T**2` |
| 10 | SymPy: exact symbolic antiderivatives | `sp.integrate` |
| 11 | Double integrals | `dblquad(f, ...)` |
| 12 | Full four-panel summary visualization | `lab08_summary.png` |

**The core idea:**

Integration is a sum. A sum of infinitely many, infinitely thin rectangles. Riemann sums approximate this by using a *finite* number of rectangles. As you use more rectangles, the approximation improves. scipy.integrate.quad makes this so efficient — through adaptive subdivision and high-order polynomial fitting — that you can get 15-digit accuracy with fewer than 100 function evaluations.

---

## Quick Check Answers

1. **Distance = velocity × time = 6 × 3 = 18 meters.** On the velocity-time graph this is a rectangle: width=3, height=6, area=18. The geometric shape is a rectangle.

2. **Less than 18 meters.** For the first second, the car is moving at 2 m/s or less (it starts from rest). The average velocity over the entire 3 seconds is (0+2+4+6)/4... more precisely it is (0+6)/2 = 3 m/s, giving 3×3 = 9 meters. The distance is 9 m, not 18 m. The car was moving slowly for the early part of the trip.

3. **Yes, more accurate.** With 100 slices, each rectangle is much thinner (Δt = 0.03 s vs Δt = 0.3 s). The velocity does not change much in 0.03 seconds, so treating each slice as constant velocity is a much better approximation. The error of Left Riemann sum is proportional to 1/n — ten times as many slices gives ten times smaller error.
