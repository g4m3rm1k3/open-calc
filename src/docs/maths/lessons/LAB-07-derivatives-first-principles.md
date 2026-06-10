# Computational Mathematics — LAB 07 — Derivatives: From First Principles to SciPy

**Prerequisites:** LAB-01 (NumPy), LAB-06 (SymPy) helpful but not required. Basic calculus — you know what a derivative is.
**Environment:** Python 3.10+ | pip install numpy matplotlib scipy sympy | python lab07.py
**Time:** 60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A car travels 100 km in 2 hours. Its average speed is 50 km/h. But can you tell from this what its speed was at exactly the 1-hour mark?
> 2. On a graph of a curve, draw two points close together. The line connecting them is called a _______ line. What happens to this line as the two points get closer and closer together?
> 3. *(Prediction)* If you try to compute `(f(x + h) - f(x)) / h` in Python and you set `h = 1e-20`, what might go wrong?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
=== Ball trajectory: h(t) = -4.9t² + 20t ===
At t=2.0s:
  Average velocity (h=1.0):    1.700 m/s
  Average velocity (h=0.1):    0.310 m/s
  Average velocity (h=0.01):   0.151 m/s
  Exact velocity:               0.400 m/s   (from -9.8t + 20)

Wait — those don't converge to 0.4? Let me check...
  Forward diff  (h=1e-5):  0.40000 m/s   ✓
  Central diff  (h=1e-5):  0.40000 m/s   ✓
  scipy.misc.derivative:   0.40000 m/s   ✓
  SymPy exact:             0.40000 m/s   ✓

=== Error vs step size h ===
  h=1e-1:  forward error = 4.9e-01,  central error = 4.9e-03
  h=1e-3:  forward error = 4.9e-03,  central error = 4.9e-07
  h=1e-5:  forward error = 4.9e-05,  central error = 4.9e-11
  h=1e-7:  forward error = 4.9e-07,  central error = 1.2e-09   ← float noise creeping in
  h=1e-15: forward error = 1.1e-01,  central error = 1.4e+00   ← catastrophic cancellation

=== Maximum height ===
  Velocity = 0 at t = 2.0408 s
  Maximum height = 20.408 m

=== Ball hits ground at t = 4.082 s ===
```

Two plots:
1. The trajectory with secant lines converging to the tangent at t = 2
2. Error vs h — showing the sweet spot and the catastrophic failure at tiny h

---

## Step 1 — The Physical Problem

**Concept: Instantaneous rate of change**

A ball is thrown straight upward. Its height in metres at time t seconds is:

```
h(t) = -4.9t² + 20t
```

The `-4.9t²` term is gravity pulling it down (half of g ≈ 9.8 m/s²). The `20t` term is the initial upward velocity of 20 m/s.

Questions we want to answer:
- How fast is the ball moving at *exactly* t = 2 seconds?
- When does it stop going up (velocity = 0)?
- When does it hit the ground?

The first question is the hard one. The other two follow from it.

**What "velocity at t = 2" actually means:**

Average velocity is easy: distance divided by time. From t = 2 to t = 2.1:

```
average velocity = (h(2.1) - h(2)) / (2.1 - 2) = (h(2.1) - h(2)) / 0.1
```

Instantaneous velocity is the limit of this as the time interval shrinks toward zero. You cannot compute it by plugging in zero — that gives 0/0. You have to take the limit.

**The derivative is that limit.** It is the instantaneous rate of change of height with respect to time — which is exactly velocity.

Create the file `lab07.py` and add this first section:

```python
# lab07.py

import numpy as np                      # arrays and numerical tools
import matplotlib.pyplot as plt         # plotting
from scipy.misc import derivative       # numerical differentiation
import sympy as sp                      # symbolic math (exact answers)

# ── Step 1: The Physical Problem ─────────────────────────────────────
# h(t) = -4.9t² + 20t  (ball thrown upward, height in metres)

def h(t):
    return -4.9 * t**2 + 20 * t         # the ball's height at time t

# Compute average velocity over the interval [2, 2+delta]
# This is (h(2 + delta) - h(2)) / delta — rise over run

t0 = 2.0                                # the moment we care about

print("=== Average velocity approaching t=2 ===")
for delta in [1.0, 0.1, 0.01, 0.001]:
    avg_vel = (h(t0 + delta) - h(t0)) / delta   # slope of secant line
    print(f"  delta={delta:.3f}:  avg velocity = {avg_vel:.6f} m/s")

# The exact answer (from calculus): h'(t) = -9.8t + 20
# At t=2: h'(2) = -9.8(2) + 20 = -19.6 + 20 = 0.4 m/s
exact = -9.8 * t0 + 20
print(f"\n  Exact velocity at t=2: {exact} m/s")
```

**Run it:**
```
python lab07.py
```

You should see the average velocities getting closer to 0.4 as delta shrinks. They are never exactly 0.4 — that would require delta = 0, which is division by zero. The derivative is the value this sequence *converges to*.

---

## Step 2 — The Geometry

**Concept: Secant lines and tangent lines**

The expression `(h(t0 + delta) - h(t0)) / delta` is the slope of the **secant line** — the straight line connecting two points on the curve:

- Point A: `(t0, h(t0))`
- Point B: `(t0 + delta, h(t0 + delta))`

As delta → 0, point B slides toward point A. The secant line rotates and converges to the **tangent line** — the line that just touches the curve at t0 without crossing it.

**The derivative is the slope of that tangent line.**

This is not just a metaphor. It is the definition. Every numerical and symbolic method for computing derivatives is approximating or computing this slope.

Add the visualization to `lab07.py`:

```python
# ── Step 2: The Geometry — Secant Lines Converging to Tangent ────────

t_vals = np.linspace(0, 4.5, 300)       # time axis: 0 to 4.5 seconds
h_vals = h(t_vals)                       # height at each time (vectorized)

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(t_vals, h_vals, 'b-', linewidth=2, label='h(t) = -4.9t² + 20t')  # the curve

t0 = 2.0                                 # point of interest
h0 = h(t0)                               # height at t=2
ax.plot(t0, h0, 'ko', markersize=8,      # mark the point we're zooming in on
        label=f'Point of interest: t={t0}, h={h0:.2f}m')

# Draw secant lines for several values of delta
# Each one connects (t0, h(t0)) to (t0+delta, h(t0+delta))
colors    = ['#e74c3c', '#e67e22', '#f1c40f']   # red, orange, yellow (getting closer)
deltas    = [1.0, 0.5, 0.1]

for delta, color in zip(deltas, colors):
    t1 = t0 + delta                              # second point's time
    h1 = h(t1)                                   # second point's height
    slope = (h1 - h0) / delta                    # slope of this secant line

    # Draw the secant line: extend it a bit on each side of (t0, h0)
    t_line = np.array([t0 - 0.3, t1 + 0.3])     # x-range for the line
    h_line = h0 + slope * (t_line - t0)          # y = h0 + slope*(t - t0)
    ax.plot(t_line, h_line, color=color, linewidth=1.5, linestyle='--',
            label=f'Secant δ={delta}: slope={slope:.3f}')
    ax.plot(t1, h1, 'o', color=color, markersize=6)  # mark the second point

# Draw the true tangent line (exact derivative = 0.4 at t=2)
exact_slope = -9.8 * t0 + 20                     # h'(2) = 0.4
t_tangent   = np.array([t0 - 0.5, t0 + 0.5])    # short x-range near t0
h_tangent   = h0 + exact_slope * (t_tangent - t0)  # tangent line equation
ax.plot(t_tangent, h_tangent, 'g-', linewidth=2.5,
        label=f'Tangent (exact slope={exact_slope:.3f})')

ax.set_xlabel('Time (s)')
ax.set_ylabel('Height (m)')
ax.set_title('Secant Lines Converging to the Tangent Line at t=2')
ax.legend(loc='upper right')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('lab07_secant_convergence.png', dpi=150)
plt.show()
print("\nPlot saved: lab07_secant_convergence.png")
```

**Run it:**
```
python lab07.py
```

Watch the secant lines rotate as delta shrinks. The yellow line (delta = 0.1) is nearly indistinguishable from the green tangent line. The red line (delta = 1.0) is visibly wrong.

---

## Step 3 — The Limit Definition

**Concept: Where the formula comes from**

The derivative of f at x is defined as:

```
f'(x) = lim[h→0] (f(x+h) - f(x)) / h
```

This is not something we just declare. It follows from the secant line picture you just saw:

1. Pick a point x on the curve
2. Pick a second point x + h (h is small)
3. Compute the slope of the line connecting them: `(f(x+h) - f(x)) / h`
4. Let h approach zero
5. The limit (if it exists) is the derivative

**Why "if it exists"?** Some functions are not differentiable everywhere. `|x|` (absolute value) has a corner at x = 0 — the left secant approaches slope = -1, the right secant approaches slope = +1. They disagree, so the limit does not exist there. No derivative at x = 0.

**In code, we cannot take h to exactly zero** — we would divide by zero. We take h to a very small number and accept an approximation. This is numerical differentiation.

The limit definition tells us something important: as h → 0 from the right, this is the **forward difference** formula. If we approach from both sides simultaneously, we get the **central difference** formula — which is more accurate. The next step shows why.

---

## Step 4 — Build Numerical Differentiation from Scratch

**Concept: Forward difference vs central difference**

The forward difference:
```
f'(x) ≈ (f(x+h) - f(x)) / h
```
This is the secant line formula with the second point always to the *right* of x.

The central difference:
```
f'(x) ≈ (f(x+h) - f(x-h)) / (2h)
```
This uses a point to the *left* AND to the *right* of x, symmetric around x.

**Why is central difference more accurate?**

Using Taylor series (expanding f around x):
```
f(x+h) = f(x) + h·f'(x) + (h²/2)·f''(x) + (h³/6)·f'''(x) + ...
f(x-h) = f(x) - h·f'(x) + (h²/2)·f''(x) - (h³/6)·f'''(x) + ...
```

Forward difference: `(f(x+h) - f(x)) / h = f'(x) + (h/2)·f''(x) + ...`
The error is proportional to h — it is "first order" in h. Halve h, halve the error.

Central difference: `(f(x+h) - f(x-h)) / (2h) = f'(x) + (h²/6)·f'''(x) + ...`
The error is proportional to h² — it is "second order" in h. Halve h, *quarter* the error.

Same number of function evaluations. Central difference is almost always better.

Add this to `lab07.py`:

```python
# ── Step 4: Build Numerical Differentiation from Scratch ─────────────

def forward_diff(f, x, h=1e-5):
    # Slope of the secant line from x to x+h
    # Error is O(h): first order — halving h halves the error
    return (f(x + h) - f(x)) / h

def central_diff(f, x, h=1e-5):
    # Slope of the secant line from x-h to x+h (symmetric around x)
    # Error is O(h²): second order — halving h quarters the error
    return (f(x + h) - f(x - h)) / (2 * h)

# Test both on the ball problem at t=2
t0       = 2.0
exact    = -9.8 * t0 + 20      # h'(t) = -9.8t + 20, so h'(2) = 0.4

fwd  = forward_diff(h, t0)     # using our function from Step 1
ctr  = central_diff(h, t0)

print("\n=== Numerical derivatives at t=2 ===")
print(f"  Forward diff:   {fwd:.10f}  (error: {abs(fwd - exact):.2e})")
print(f"  Central diff:   {ctr:.10f}  (error: {abs(ctr - exact):.2e})")
print(f"  Exact answer:   {exact:.10f}")
```

**Run it:**
```
python lab07.py
```

Both should be very close to 0.4. The central difference error should be much smaller than the forward difference error.

---

## Step 5 — Error Analysis: Why Not Use h = 0.000000001?

**Concept: Floating point cancellation**

You might think: the smaller h is, the closer we are to the true limit, so make h as tiny as possible. This is wrong.

Python floats have about 15-16 significant decimal digits of precision. When h is very small, `f(x+h)` and `f(x)` are nearly equal. Their difference loses most of those significant digits — this is called **catastrophic cancellation**. The result is dominated by rounding error, not mathematical error.

There is a sweet spot: around h ≈ 1e-5 for forward difference, h ≈ 1e-4 to 1e-5 for central difference. Below that sweet spot, floating point noise makes things worse, not better.

Add the error analysis to `lab07.py`:

```python
# ── Step 5: Error vs Step Size — Finding the Sweet Spot ──────────────

h_values   = np.logspace(-1, -15, 50)     # h from 0.1 down to 1e-15
exact      = -9.8 * t0 + 20               # true derivative at t=2

fwd_errors = []                            # error for forward difference
ctr_errors = []                            # error for central difference

for h_step in h_values:
    fwd_approx = forward_diff(h, t0, h=h_step)   # numerical estimate
    ctr_approx = central_diff(h, t0, h=h_step)

    # Absolute error: how far from the true answer
    fwd_errors.append(abs(fwd_approx - exact))
    ctr_errors.append(abs(ctr_approx - exact))

fig, ax = plt.subplots(figsize=(9, 5))
ax.loglog(h_values, fwd_errors, 'r-o', markersize=3, linewidth=1.5,
          label='Forward difference O(h)')
ax.loglog(h_values, ctr_errors, 'b-o', markersize=3, linewidth=1.5,
          label='Central difference O(h²)')

# Mark the theoretical slopes for reference
h_ref   = np.array([1e-1, 1e-5])
ax.loglog(h_ref, 5e-1 * h_ref,      'r--', alpha=0.4, label='Slope 1 (O(h))')
ax.loglog(h_ref, 5e-1 * h_ref**2,   'b--', alpha=0.4, label='Slope 2 (O(h²))')

ax.set_xlabel('Step size h')
ax.set_ylabel('Absolute error')
ax.set_title('Error vs Step Size: The Sweet Spot and Catastrophic Cancellation')
ax.legend()
ax.grid(True, which='both', alpha=0.3)
ax.invert_xaxis()                          # h decreasing left to right makes intuitive sense
plt.tight_layout()
plt.savefig('lab07_error_analysis.png', dpi=150)
plt.show()
print("Plot saved: lab07_error_analysis.png")

# Print the sweet-spot values explicitly
best_fwd_idx = np.argmin(fwd_errors)
best_ctr_idx = np.argmin(ctr_errors)
print(f"\n  Best h for forward diff:  {h_values[best_fwd_idx]:.2e}  "
      f"(error: {fwd_errors[best_fwd_idx]:.2e})")
print(f"  Best h for central diff:  {h_values[best_ctr_idx]:.2e}  "
      f"(error: {ctr_errors[best_ctr_idx]:.2e})")
```

**Run it:**
```
python lab07.py
```

The plot shows a characteristic "V" shape in the log-log space for each method. Left side: mathematical error decreasing as h shrinks. Right side (small h): floating point error increasing as h shrinks. The bottom of the V is the sweet spot — around h = 1e-5 for forward, 1e-4 for central.

Notice central difference is steeper on the left (slope 2 vs slope 1) and reaches lower errors before the noise floor takes over.

---

## Step 6 — SciPy and NumPy for Derivatives

**Concept: When to use the library instead of rolling your own**

Your `forward_diff` and `central_diff` functions work fine for one-off computations. But SciPy and NumPy provide tools that handle edge cases, work on arrays, and are tested against many functions.

**`scipy.misc.derivative`** — for differentiating a Python *function* at a specific point:

```python
from scipy.misc import derivative
result = derivative(f, x0, dx=1e-5, n=1)   # n=1: first derivative
```

It uses a higher-order finite difference formula internally — more accurate than central difference for the same step size.

**`np.gradient`** — for differentiating an *array of data*:

```python
np.gradient(y_array, x_array)
```

Use this when you have measured data (e.g., sensor readings) and want the rate of change at each point. You do not have a function — just values. It uses central differences at interior points and forward/backward differences at the edges.

Add this to `lab07.py`:

```python
# ── Step 6: SciPy and NumPy for Derivatives ───────────────────────────

from scipy.misc import derivative as scipy_deriv   # avoid name clash with our 'derivative' concept

t0    = 2.0
exact = -9.8 * t0 + 20

# scipy.misc.derivative: differentiate a Python function at a point
scipy_result = scipy_deriv(h, t0, dx=1e-5, n=1)   # n=1 means first derivative
print("\n=== scipy.misc.derivative ===")
print(f"  Result: {scipy_result:.10f}")
print(f"  Error:  {abs(scipy_result - exact):.2e}")

# np.gradient: differentiate an array of data (simulate "sensor readings")
t_data  = np.linspace(0, 4.1, 200)     # 200 time samples, evenly spaced
h_data  = h(t_data)                    # height values at those times (our "measurements")

# np.gradient returns the derivative at each point
velocity_data = np.gradient(h_data, t_data)   # d(height)/d(time) at each sample

# Find the index closest to t=2 so we can compare
idx_t2 = np.argmin(np.abs(t_data - 2.0))      # index where t is closest to 2.0
print("\n=== np.gradient (array-based) ===")
print(f"  Derivative near t=2: {velocity_data[idx_t2]:.10f}")
print(f"  Exact answer:        {exact:.10f}")

# When to use which:
print("\n=== When to use which ===")
print("  forward_diff / central_diff:  you understand what you're doing, one-off use")
print("  scipy.misc.derivative:        you have a Python function, want a convenient wrapper")
print("  np.gradient:                  you have a data array (not a function), want all derivatives at once")
```

**Run it:**
```
python lab07.py
```

All three methods should give values very close to 0.4. The small differences come from different step sizes and different finite difference formulas used internally.

---

## Step 7 — SymPy for Exact Derivatives

**Concept: Symbolic differentiation — no approximation**

Everything in Steps 4-6 is *numerical* — we compute an approximation. SymPy computes the derivative *symbolically*, applying the same rules you use in calculus class: power rule, product rule, chain rule. The answer is exact.

This is useful for:
- Verifying numerical results
- Getting a closed-form expression for the derivative
- Solving equations involving derivatives (like finding where h'(t) = 0)

Add this to `lab07.py`:

```python
# ── Step 7: SymPy for Exact Symbolic Derivatives ─────────────────────

t_sym = sp.Symbol('t')                              # t is a symbolic variable

# Define h(t) symbolically (same formula, but SymPy objects)
h_sym = -4.9 * t_sym**2 + 20 * t_sym

# Differentiate: d/dt of h_sym with respect to t_sym
h_prime_sym = sp.diff(h_sym, t_sym)                 # returns -9.8*t + 20

print("\n=== SymPy exact differentiation ===")
print(f"  h(t)  = {h_sym}")
print(f"  h'(t) = {h_prime_sym}")

# Evaluate h'(t) at t=2 — exact rational arithmetic
h_prime_at_2 = h_prime_sym.subs(t_sym, 2)          # substitute t=2
print(f"  h'(2) = {h_prime_at_2}")                  # should print 0.4 or 2/5

# ── Verify differentiation rules using SymPy ─────────────────────────
x_sym = sp.Symbol('x')

print("\n=== Verifying calculus rules ===")

# Power rule: d/dx[x^n] = n*x^(n-1)
expr1 = x_sym**5
print(f"  Power rule:   d/dx[x^5]       = {sp.diff(expr1, x_sym)}")        # 5x^4

# Chain rule: d/dx[sin(x^2)] = 2x * cos(x^2)
expr2 = sp.sin(x_sym**2)
print(f"  Chain rule:   d/dx[sin(x²)]   = {sp.diff(expr2, x_sym)}")        # 2x*cos(x^2)

# Product rule: d/dx[x * e^x] = e^x + x*e^x
expr3 = x_sym * sp.exp(x_sym)
print(f"  Product rule: d/dx[x·eˣ]      = {sp.diff(expr3, x_sym)}")        # exp(x) + x*exp(x)
print(f"                simplified:      = {sp.simplify(sp.diff(expr3, x_sym))}")

# ── Find when the ball reaches maximum height: solve h'(t) = 0 ───────
t_max = sp.solve(h_prime_sym, t_sym)                # solve -9.8t + 20 = 0 for t
print(f"\n  Maximum height at t = {t_max[0]:.4f} s")
h_max = h_sym.subs(t_sym, t_max[0])
print(f"  Maximum height     = {float(h_max):.4f} m")

# ── Find when the ball hits the ground: solve h(t) = 0 ───────────────
t_ground = sp.solve(h_sym, t_sym)                   # solve -4.9t^2 + 20t = 0 for t
print(f"\n  Ball hits ground at t = {[float(t) for t in t_ground]} s")
print(f"  (t=0 is launch, the other root is landing)")
```

**Run it:**
```
python lab07.py
```

SymPy will print `h'(t) = -9.8*t + 20` and correctly find the maximum at `t ≈ 2.0408 s`. Compare this to the numerical derivative — they should agree everywhere.

---

## Step 8 — Brief Introduction to Partial Derivatives and the Gradient

**Concept: Derivatives of functions with multiple inputs**

So far, h(t) has only one input. Real-world functions often have many inputs. Temperature in a room depends on x, y, z coordinates. A machine's error depends on speed, feed rate, and tool angle.

The **partial derivative** ∂f/∂x measures how f changes when only x changes, while every other variable is held constant. It is the same limit definition applied to one variable at a time:

```
∂f/∂x = lim[h→0] (f(x+h, y) - f(x, y)) / h
```

**The gradient** ∇f is the vector of all partial derivatives:

```
∇f(x, y) = [∂f/∂x, ∂f/∂y]
```

The gradient points in the direction of steepest ascent at any point. Move in the direction of -∇f and you descend — this is gradient descent, the engine behind most machine learning optimization.

Add this to `lab07.py`:

```python
# ── Step 8: Partial Derivatives and the Gradient ─────────────────────

# f(x, y) = x² + x*y + y²
# ∂f/∂x = 2x + y   (treat y as a constant, differentiate with respect to x)
# ∂f/∂y = x + 2y   (treat x as a constant, differentiate with respect to y)

def f_xy(x, y):
    return x**2 + x*y + y**2             # a surface in 3D space

# Numerical partial derivatives at the point (1, 2)
point_x, point_y = 1.0, 2.0
step = 1e-5

# Partial w.r.t. x: vary x, hold y fixed
df_dx_num = (f_xy(point_x + step, point_y) - f_xy(point_x - step, point_y)) / (2 * step)

# Partial w.r.t. y: vary y, hold x fixed
df_dy_num = (f_xy(point_x, point_y + step) - f_xy(point_x, point_y - step)) / (2 * step)

print("\n=== Partial derivatives of f(x,y) = x² + xy + y² at (1,2) ===")
print(f"  ∂f/∂x (numerical): {df_dx_num:.6f}")
print(f"  ∂f/∂x (exact):     {2*point_x + point_y:.6f}   (= 2x + y = 2+2 = 4)")
print(f"  ∂f/∂y (numerical): {df_dy_num:.6f}")
print(f"  ∂f/∂y (exact):     {point_x + 2*point_y:.6f}   (= x + 2y = 1+4 = 5)")

gradient = np.array([df_dx_num, df_dy_num])   # gradient vector at (1, 2)
print(f"\n  Gradient ∇f at (1,2) = {gradient}")
print("  This vector points in the direction of steepest ascent.")
print("  Gradient descent uses -∇f to minimize f.")

# ── SymPy partial derivatives ─────────────────────────────────────────
x_sym, y_sym = sp.symbols('x y')
f_sym = x_sym**2 + x_sym*y_sym + y_sym**2

df_dx_sym = sp.diff(f_sym, x_sym)             # differentiate w.r.t. x
df_dy_sym = sp.diff(f_sym, y_sym)             # differentiate w.r.t. y

print(f"\n  SymPy: ∂f/∂x = {df_dx_sym}")
print(f"  SymPy: ∂f/∂y = {df_dy_sym}")
```

**Run it:**
```
python lab07.py
```

The numerical and symbolic partial derivatives should agree. The gradient [4, 5] tells you: at point (1, 2), increasing x by 1 unit increases f by about 4; increasing y by 1 unit increases f by about 5.

---

## Step 9 — Full Visualization: Trajectory with Tangent Lines

**Concept: Putting it all together**

The payoff: a clean plot showing the ball's trajectory with tangent lines at multiple times. The slope of each tangent line is the velocity at that moment.

Add this to `lab07.py`:

```python
# ── Step 9: Full Visualization ───────────────────────────────────────

t_vals  = np.linspace(0, 4.5, 400)         # time axis
h_vals  = h(t_vals)                         # height at each time

# Points where we want to draw tangent lines
t_points = [0.1, 0.5, 1.0, 1.5, 2.0, 2.5]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# ── Left plot: trajectory with tangent lines ──────────────────────────
ax1.plot(t_vals, h_vals, 'b-', linewidth=2.5, label='h(t) trajectory')

colors = plt.cm.plasma(np.linspace(0.1, 0.9, len(t_points)))   # color gradient

for t_pt, color in zip(t_points, colors):
    h_pt    = h(t_pt)                                       # height at this time
    slope   = central_diff(h, t_pt)                         # velocity at this time
    label   = f't={t_pt}: v={slope:.2f} m/s'

    # Tangent line: short segment centred on (t_pt, h_pt)
    t_tan   = np.array([t_pt - 0.25, t_pt + 0.25])          # ±0.25 s window
    h_tan   = h_pt + slope * (t_tan - t_pt)                  # line through (t_pt, h_pt)

    ax1.plot(t_pt, h_pt, 'o', color=color, markersize=8)     # the point on the curve
    ax1.plot(t_tan, h_tan, '-', color=color, linewidth=2, label=label)  # tangent line

ax1.axhline(0, color='gray', linestyle='--', alpha=0.5)      # ground level
ax1.set_xlabel('Time (s)')
ax1.set_ylabel('Height (m)')
ax1.set_title('Ball Trajectory with Tangent Lines (= Velocity)')
ax1.legend(fontsize=8, loc='upper right')
ax1.grid(True, alpha=0.3)

# ── Right plot: velocity (derivative) of h(t) ────────────────────────
velocity = np.gradient(h_vals, t_vals)                        # derivative at each point

ax2.plot(t_vals, velocity, 'r-', linewidth=2.5, label="h'(t) = velocity")
ax2.axhline(0, color='k', linestyle='-', linewidth=0.8)       # zero velocity = max height

# Mark the velocity at each of our points
for t_pt, color in zip(t_points, colors):
    v_pt = central_diff(h, t_pt)                              # velocity at this point
    ax2.plot(t_pt, v_pt, 'o', color=color, markersize=8)

# Mark where velocity = 0 (maximum height)
t_max_val = 20 / 9.8                                          # from h'(t)=0 → t = 20/9.8
ax2.axvline(t_max_val, color='green', linestyle='--',
            label=f'Max height at t={t_max_val:.3f}s (v=0)')

ax2.set_xlabel('Time (s)')
ax2.set_ylabel('Velocity (m/s)')
ax2.set_title("Velocity h'(t): The Derivative of Height")
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.suptitle('h(t) = -4.9t² + 20t', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig('lab07_full_visualization.png', dpi=150)
plt.show()
print("Plot saved: lab07_full_visualization.png")
```

**Run it:**
```
python lab07.py
```

The left plot shows the ball's arc. Each tangent line has a slope equal to the velocity at that moment — positive (pointing up-right) when the ball rises, negative (pointing down-right) when it falls, and horizontal at the peak.

The right plot shows velocity directly. It is a straight line (the derivative of a quadratic is linear). It crosses zero at the same moment the ball reaches its highest point.

---

## Challenge

You have all the tools. Now apply them.

**The setup:** the ball problem, pushed further.

```python
# Start from here
import numpy as np
import matplotlib.pyplot as plt
from scipy.misc import derivative as scipy_deriv
from scipy.optimize import brentq
import sympy as sp

def h(t):
    return -4.9 * t**2 + 20 * t

def central_diff(f, x, step=1e-5):
    return (f(x + step) - f(x - step)) / (2 * step)
```

**Part 1 — Maximum height**

Find when the ball reaches maximum height. The velocity equals zero at the peak.
- Use SymPy to solve `h'(t) = 0` symbolically
- Confirm by evaluating `central_diff(h, t_max)` numerically — it should be near zero
- Compute the maximum height `h(t_max)`

**When you're done:** You should have printed the time and height of the peak, and confirmed the numerical derivative is approximately zero there.

**Stuck?** Ask AI: "How do I solve an equation symbolically in SymPy when I have the derivative expression?"

---

**Part 2 — Velocity at six moments**

Compute the numerical derivative (central difference) at: `t = 0.1, 0.5, 1.0, 1.5, 2.0, 2.5`

Print each time and velocity. Notice the pattern: velocity decreases linearly. Why?

**When you're done:** You should have a list of six (time, velocity) pairs printed. Velocity should decrease by roughly the same amount between each step.

**Stuck?** Ask AI: "Why is the derivative of a quadratic function a linear function?"

---

**Part 3 — Plot trajectory with tangent lines**

Plot `h(t)` from t = 0 to t = 4.5.

On the same axes, draw a tangent line at each of the six t-values from Part 2. Each tangent line:
- Passes through `(t, h(t))`
- Has slope equal to the velocity at t
- Extends 0.3 seconds on each side of t

Use a different colour for each tangent line. Add a legend showing the velocity.

**When you're done:** You should see the tangent lines rotating as the ball's velocity changes — steeply positive at launch, horizontal at the peak.

**Stuck?** Ask AI: "How do I draw a short line segment through a point with a given slope in matplotlib?"

---

**Part 4 — When does the ball land?**

Find the two times when `h(t) = 0` (height is zero):
- t = 0 (launch)
- t = some positive value (landing)

Use **both** methods and compare:
- SymPy: `sp.solve(h_sym, t_sym)` on the symbolic expression
- `scipy.optimize.brentq`: a numerical root-finder. Give it `h` and a bracket like `[0.1, 5.0]`

```python
from scipy.optimize import brentq
landing_time = brentq(h, 0.1, 5.0)    # find root of h(t)=0 between t=0.1 and t=5
```

Print both answers. They should match.

**When you're done:** You should see the same landing time printed twice — once from SymPy, once from brentq.

**Stuck?** Ask AI: "What does brentq need — what is a bracket and why does the function need opposite signs at each end?"

---

**Part 5 — The derivative plot**

Plot `h'(t)` (velocity) from t = 0 to t = 4.5 using `np.gradient`.

On the same plot:
- Mark where `h'(t) = 0` with a vertical dashed line (this is the maximum height time)
- Mark the landing time from Part 4 with a vertical dashed line
- Add a horizontal line at `h'(t) = 0` for reference

**When you're done:** You should see a straight descending line (velocity) crossing zero at the peak, with two vertical markers.

**Stuck?** Ask AI: "How do I add a vertical line to a matplotlib plot at a specific x value?"

---

## Quick Check Answers

1. **No.** Average speed over 2 hours tells you nothing about the instantaneous speed at any particular moment. The car could have been going 0 at t=1h and 100 at t=1.5h — still 50 average. Instantaneous speed requires the derivative.

2. The line connecting two points on a curve is called a **secant** line. As the two points get infinitely close together, the secant line converges to the **tangent** line — the line that just touches the curve at that one point without crossing it.

3. When h = 1e-20, `f(x + h)` and `f(x)` are so nearly equal that their difference is computed from the noise in the last few bits of the floating point representation. Python `float` has only about 15-16 significant digits. The difference `f(x + h) - f(x)` loses nearly all of them. The result is dominated by rounding error — what you compute is essentially garbage. This is **catastrophic cancellation**.

---

## What You Learned

| Tool | Use case |
|------|----------|
| `forward_diff` | Simple, one-sided, O(h) error |
| `central_diff` | Symmetric, O(h²) error, almost always better |
| `scipy.misc.derivative` | Convenient wrapper around central difference for a Python function |
| `np.gradient` | Derivative of an array of data, not a function |
| `sp.diff` | Exact symbolic derivative — no approximation |
| `sp.solve` | Solve equations involving derivatives symbolically |
| `scipy.optimize.brentq` | Find where a function equals zero numerically |

**The big picture:**

The derivative is a limit. You cannot compute a limit exactly in floating point arithmetic. You can:
1. Approximate it numerically (forward/central difference) — fast, flexible, prone to floating point error at tiny h
2. Compute it exactly symbolically (SymPy) — exact, but requires the function in symbolic form
3. Use the library (scipy, np.gradient) — tested, convenient, handles edge cases

All three are useful. Know when to reach for each one.

**Next:** LAB-08 will use derivatives to solve optimization problems — finding minima and maxima of functions with one and multiple variables, including gradient descent.
