// Chapter 1.3 — Linear Relationships
//
// PHASE 1 — MATHEMATICAL FOUNDATIONS (COMPUTATIONAL FIRST)
//
// TEACHES:
//   1.  What makes a relationship linear — constant rate of change
//   2.  Slope — Δy/Δx, rise over run, sign and meaning
//   3.  Slope-intercept form — y = mx + b
//   4.  Finding slope from two points
//   5.  Visualizing slope — rise/run diagram with opencalc
//   6.  Y-intercept and x-intercept
//   7.  Point-slope form — y − y₁ = m(x − x₁)
//   8.  Parallel and perpendicular lines
//   9.  Modeling with code — generating linear data
//  10.  Real data with noise — the scatter plot workflow
//  11.  Residuals — the gap between model and data
//  12.  Least squares intuition — why we minimize squared residuals
//  13.  Computing the best-fit line analytically
//  14.  Visualizing the fit — line + residuals together

export default {
  id: 'py-1-3-linear-relationships',
  slug: 'linear-relationships',
  chapter: 1.3,
  order: 2,
  title: 'Linear Relationships',
  subtitle: 'Slope, intercept, and the first model you will ever fit to data',
  tags: ['slope', 'intercept', 'linear', 'y=mx+b', 'residuals', 'least squares', 'modeling', 'scatter', 'opencalc'],

  hook: {
    question: 'If you know that every extra year of experience adds $4,200 to a salary, what equation describes the relationship — and how do you find it from raw data?',
    realWorldContext:
      'Linear relationships are everywhere: calories burned per minute of exercise, ' +
      'fuel consumed per kilometre, memory usage per active user, revenue per unit sold. ' +
      'The slope tells you the rate — how much y changes per unit of x. ' +
      'The intercept tells you the baseline — what y is when x is zero. ' +
      'Together they form the simplest possible model: y = mx + b. ' +
      'Almost every model in machine learning is a generalisation of this one equation. ' +
      'Before you can understand neural networks or gradient descent, ' +
      'you need to understand why a straight line fits data — and how to find the best one.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A relationship is **linear** if equal changes in x always produce equal changes in y. ' +
      'Double x, y changes by the same fixed amount each time. This fixed amount per unit of x ' +
      'is the **slope** m. The value of y when x = 0 is the **y-intercept** b. Together: y = mx + b.',
      'The slope has units: if x is hours and y is kilometres, then m is km/hour — a speed. ' +
      'If x is dollars spent on ads and y is sales, m is sales per dollar — an ROI. ' +
      'The sign matters: positive slope means y increases with x; negative means y decreases.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Slope',
        body: 'm = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{y_2 - y_1}{x_2 - x_1} \\quad \\text{(rise over run)}',
      },
      {
        type: 'insight',
        title: 'Linearity = constant rate of change',
        body: 'A function f is linear if and only if its slope is the same between every pair of points. If you compute Δy/Δx for any two points and always get the same number — it is linear.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Linear Relationships',
        mathBridge: 'y = mx + b. Slope m = Δy/Δx. Every cell in this lesson builds toward fitting a line to real data using least squares.',
        caption: 'Build the mental model cell by cell — then use it to fit data at the end.',
        props: {
          initialCells: [
            // ── CONCEPT ───────────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'What makes a relationship linear',
              prose: 'A relationship is **linear** when equal steps in x always produce equal steps in y — no matter where you are on the curve. This constant rate of change is what separates a straight line from a curve. It is a surprisingly strong claim: double your input and the output shifts by the exact same amount every single time. The code below tests this numerically by computing Δy/Δx between consecutive pairs. For the linear sequence the ratio is always 3; for x² it changes at every step, immediately revealing non-linearity. **Python pattern:** We loop using `range(1, len(...))` to access both the current and previous index simultaneously — a standard idiom for computing pairwise differences in a list.',
              code: `# Is this relationship linear?
x_vals = [0, 1, 2, 3, 4, 5]
y_vals = [3, 6, 9, 12, 15, 18]   # y = 3x + 3

print("x   y   Δy/Δx")
for i in range(1, len(x_vals)):
    dx = x_vals[i] - x_vals[i-1]
    dy = y_vals[i] - y_vals[i-1]
    print(f"{x_vals[i]}   {y_vals[i]}   {dy/dx}")

# Now a non-linear one
y_nonlinear = [x**2 for x in x_vals]
print("\\nNon-linear (x²):")
print("x   y   Δy/Δx")
for i in range(1, len(x_vals)):
    dx = x_vals[i] - x_vals[i-1]
    dy = y_nonlinear[i] - y_nonlinear[i-1]
    print(f"{x_vals[i]}   {y_nonlinear[i]}   {dy/dx}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Slope — rise over run',
              prose: 'Slope is not just a formula — it is a unit of measurement. If x is hours and y is kilometres, then slope has units of km/h — a speed. If x is dollars spent on advertising and y is sales revenue, slope is revenue per dollar spent — an ROI. The magnitude tells you steepness (how fast y changes), and the sign tells you direction (positive: y grows with x; negative: y shrinks with x; zero: flat). Critically, on a truly linear relationship the slope between **any** two points is identical — that invariance is the definition of linearity. **Python pattern:** We write a dedicated `slope()` function with a docstring that names its edge case (vertical lines cause division by zero). Wrapping even simple formulas in named functions makes code testable, readable, and reusable — you will call this logic dozens of times in a data project.',
              code: `def slope(x1, y1, x2, y2):
    """Slope between two points. Raises ZeroDivisionError for vertical lines."""
    return (y2 - y1) / (x2 - x1)

# Examples
print(slope(0, 0, 3, 6))       #  2.0 — goes up 2 for every 1 right
print(slope(0, 5, 4, 1))       # -1.0 — goes down 1 for every 1 right
print(slope(1, 3, 5, 3))       #  0.0 — horizontal line
print(slope(-2, -4, 3, 6))     #  2.0 — same slope regardless of which points

# Slope is symmetric: slope(A,B) == slope(B,A)
print(slope(1, 2, 4, 8) == slope(4, 8, 1, 2))  # True

# Units matter: if x=hours, y=km → slope is km/h
hours  = [0, 1, 2, 3]
km     = [0, 80, 160, 240]
speed = slope(hours[0], km[0], hours[-1], km[-1])
print(f"Speed: {speed} km/h")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Slope-intercept form — y = mx + b',
              prose: 'y = mx + b is arguably the most important equation in all of data science. Every linear regression model, every weight in a neural network layer, every price formula in economics is a generalisation of this one line. Here m is the **rate of change** — how much y increases for each unit increase in x — and b is the **baseline** — the value of y when x is zero. The salary model `linear(m=4200, b=35000)` tells you instantly: every additional year of experience is worth $4,200, and someone starting with zero experience earns $35,000. **Python pattern:** `linear(m, b)` returns a **lambda** — a small anonymous function that captures m and b in its closure. This is a *higher-order function*: a function that manufactures other functions. The returned lambda behaves exactly like a def function but is concise to write and easy to pass to plotting routines. The one-liner `b = y - m * px` shows how to recover the y-intercept when you know the slope and one point — a technique you will use repeatedly.',
              code: `def linear(m, b):
    """Return the function f(x) = mx + b."""
    return lambda x: m * x + b

# A few lines
steep_up    = linear(m=3,    b=0)
gentle_down = linear(m=-0.5, b=4)
flat        = linear(m=0,    b=2)
salary_line = linear(m=4200, b=35000)   # $4200/year, starting at $35k

# Evaluate
x = 5
print(f"steep_up(5)     = {steep_up(x)}")
print(f"gentle_down(5)  = {gentle_down(x)}")
print(f"flat(5)         = {flat(x)}")
print(f"salary at 5 yrs = \${salary_line(5):,.0f}")

# Find b from slope and a point: b = y - mx
# Given: slope=2, passes through (3, 7)
m = 2
px, py = 3, 7
b = py - m * px
print(f"\\nLine with slope 2 through (3,7): y = 2x + {b}")
print(f"Check: f(3) = {linear(m,b)(3)}")   # should be 7`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'oc-line-arrow',
              cellTitle: 'opencalc: fig.line(), fig.arrow() — segments and directed arrows',
              prose: [
                'Two distinct annotation tools for directional vs non-directional lines — both use **data coordinates** (not pixels) and scale automatically.',
                '## fig.line() — undirected segment',
                '- `fig.line(start, end, color, width, dashed)` — segment with no arrowhead\n- Use for: triangle legs, reference distances, grid overlays, piecewise boundaries\n- **No `label` parameter** — use `fig.text()` to annotate manually',
                '## fig.arrow() — directed segment',
                '- `fig.arrow(start, end, color, width, label, dashed)` — segment with arrowhead at `end`\n- Use for: vectors, slope indicators, labelled measurements, distances with direction\n- **Has `label`** — appears in the figure legend',
              ],
              code: `from opencalc import Figure, BLUE, RED, AMBER, GREEN

fig = Figure(xmin=-1, xmax=6, ymin=-1, ymax=5, title="line vs arrow")
fig.grid().axes()

# fig.line([x1,y1], [x2,y2], color, width, dashed)  — no label parameter
fig.line([0, 0], [5, 3], color=BLUE, width=2.5)
fig.line([1, 4], [4, 4], color='gray', width=1.5, dashed=True)

# fig.arrow([x1,y1], [x2,y2], color, width, label)
# — same as line but with an arrowhead drawn at [x2,y2]
fig.arrow([0, 1], [3, 1], color=RED,   width=2.5, label='arrow →')
fig.arrow([0, 2], [0, 4], color=GREEN, width=2.5, label='arrow ↑')

# fig.arrow is perfect for: slope rise/run, vector components, distances
fig.text([3.2, 2.2], "arrowhead here", color='red', size=11)

fig.show()

# Parameters:
# fig.line(start, end, color='muted', width=1.5, dashed=False, alpha=1.0)
# fig.arrow(start, end, color='blue',  width=2.5, label=None, dashed=False)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'oc-fill',
              cellTitle: 'opencalc: fig.fill_between() and fig.rect() — shading regions',
              prose: [
                'Shading communicates area — drawing the eye to a region, not just a boundary. Both methods use `color` and `alpha` (0 = invisible, 1 = solid; 0.2–0.3 lets the grid show through).',
                '## fig.fill_between()',
                '- `fig.fill_between(fn_top, fn_bottom, xmin, xmax, color, alpha)` — shades between two functions\n- `fn_bottom` can be `None` to shade down to y = 0\n- Use for: area under a curve, region between two lines, confidence bands',
                '## fig.rect()',
                '- `fig.rect(x, y, w, h, color, fill, alpha)` — rectangle from bottom-left corner (x, y) with width w and height h\n- Use for: annotating intervals, marking data windows, drawing the literal squares in a least-squares diagram',
                '**Python pattern:** both `fn_top` and `fn_bottom` accept any callable — lambdas, `def` functions, or built-ins.',
              ],
              code: `from opencalc import Figure, BLUE, RED, AMBER, GREEN
import math

fig = Figure(xmin=-1, xmax=5, ymin=-1, ymax=10,
             title="fill_between and rect")
fig.grid().axes()

# Fill between two functions
f_top    = lambda x: x**2 + 2
f_bottom = lambda x: x

fig.plot(f_top,    color=BLUE, label='x²+2', width=2)
fig.plot(f_bottom, color=RED,  label='x',    width=2)
fig.fill_between(f_top, f_bottom, xmin=0, xmax=2,
                 color=BLUE, alpha=0.2)   # shaded region between them

# Rectangle: bottom-left corner, width, height
fig.rect(3, 1, 1.5, 3, color=AMBER, fill=True, alpha=0.3)
fig.text([3.75, 4.5], "rect", color='amber', size=12, bold=True)

fig.show()

# Parameters:
# fig.fill_between(fn_top, fn_bottom=None, xmin, xmax, color, alpha, steps)
# fig.rect(x, y, w, h, color, fill=True, alpha=0.2)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Visualizing a line — rise and run diagram',
              prose: 'The rise-run triangle is the geometric heart of slope. Choose any two x-values on a line, draw a horizontal segment (the **run** = Δx) and then a vertical segment connecting back to the line (the **rise** = Δy), and you form a right triangle. The slope is the ratio rise/run — visually, how steep the hypotenuse is. Because the line is straight, this triangle has the same proportions everywhere: pick different starting points and you always get the same angle and the same slope. This cell builds that diagram programmatically: m and b are set at the top, and every annotation — triangle corner positions, label text, label positions — is computed from them. Change m or b and the entire diagram updates automatically. **Python:** dx is chosen arbitrarily (here 2), and dy is derived from `m * dx` — the slope equation. The triangle corner coordinates are computed precisely in data space, then passed to `fig.line()`, `fig.text()`, and `fig.point()`. **Library:** `fig.line()` draws the two legs; `fig.text()` places labels; `fig.point()` marks the corners. Together they turn abstract algebra into a readable geometric picture.',
              code: `from opencalc import Figure, BLUE, RED, AMBER, GREEN

m, b = 2, -1   # y = 2x - 1

fig = Figure(xmin=-1, xmax=5, ymin=-4, ymax=9, title=f"y = {m}x + ({b})")
fig.grid().axes()

# The line
fig.plot(lambda x: m*x + b, color=BLUE, label=f'y = {m}x + {b}', width=3)

# Rise-run triangle starting at x=1
x0 = 1
y0 = m*x0 + b   # y at x=1
dx = 2           # run
dy = m * dx      # rise

# Run (horizontal leg)
fig.line([x0, y0], [x0 + dx, y0], color=RED, width=2.5)
fig.text([x0 + dx/2, y0 - 0.5], f'run = {dx}', color='red', size=11)

# Rise (vertical leg)
fig.line([x0 + dx, y0], [x0 + dx, y0 + dy], color=GREEN, width=2.5)
fig.text([x0 + dx + 0.15, y0 + dy/2], f'rise = {dy}', color='green', size=11)

# Points at triangle corners
fig.point([x0, y0],           color=AMBER, radius=7, label=f'({x0},{y0})')
fig.point([x0+dx, y0+dy],     color=AMBER, radius=7, label=f'({x0+dx},{y0+dy})')

# Y-intercept
fig.point([0, b], color=BLUE, radius=7, label=f'y-int = {b}')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'X-intercept and Y-intercept',
              prose: [
                'Intercepts are where a line crosses the axes — and they always have a real-world meaning.',
                '## Y-intercept (set x = 0)',
                'y = b — the **baseline** before x has changed at all. In a salary model: starting salary at zero years experience. In physics: initial position at t = 0.',
                '## X-intercept (set y = 0)',
                'x = −b/m — the **break-even point** where the output is zero. Profit models: the sales volume where profit turns positive. Note: if m = 0 (horizontal line), there is no x-intercept — the code returns `None` for this edge case.',
                '## Library',
                '`fig.hline(y)` and `fig.vline(x)` draw full-width/full-height reference lines across the entire figure — lighter than drawing explicit segments and always axis-aligned.',
              ],
              code: `from opencalc import Figure, BLUE, RED, AMBER

def y_intercept(m, b): return b
def x_intercept(m, b): return -b / m if m != 0 else None  # vertical if m=0

# Example: y = 3x - 6
m, b = 3, -6
xi = x_intercept(m, b)   # -(-6)/3 = 2
yi = y_intercept(m, b)   # -6

print(f"y = {m}x + ({b})")
print(f"y-intercept: (0, {yi})")
print(f"x-intercept: ({xi}, 0)")

fig = Figure(xmin=-2, xmax=5, ymin=-8, ymax=6, title=f"y = {m}x + ({b}) — intercepts")
fig.grid().axes()

fig.plot(lambda x: m*x + b, color=BLUE, label=f'y={m}x+({b})', width=3)
fig.point([0, yi],  color=AMBER, radius=8, label=f'y-int (0,{yi})')
fig.point([xi, 0],  color=RED,   radius=8, label=f'x-int ({xi},0)')

# Dashed guide lines
fig.hline(0, color='gray')
fig.vline(0, color='gray')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Point-slope form — y − y₁ = m(x − x₁)',
              prose: 'In practice you rarely know the y-intercept directly. You know the slope (from physics, the problem description, or a previous measurement) and one observed data point. Point-slope form encodes this: y − y₁ = m(x − x₁). It says "starting from the known point, the line grows at rate m." Rearranging gives y = mx + (y₁ − mx₁), revealing that b = y₁ − mx₁ — the y-intercept is computable from slope and any one point. `line_from_two_points` takes this further: it first computes m from the two-point slope formula, then delegates to `line_from_point_slope`. **Python pattern:** Functions that build on other functions keep code DRY (Do not Repeat Yourself). `line_from_two_points` does not repeat the b-computation logic — it calls the existing function. The tuple return `(fn, b)` lets the caller unpack both the function and the intercept in one line: `f, b = line_from_point_slope(...)`. This is idiomatic Python — use tuple unpacking instead of returning dictionaries for small, fixed sets of values.',
              code: `def line_from_point_slope(m, x1, y1):
    """Return linear function given slope m and a point (x1, y1)."""
    b = y1 - m * x1
    return lambda x: m * x + b, b

def line_from_two_points(x1, y1, x2, y2):
    """Return linear function through two points."""
    m = (y2 - y1) / (x2 - x1)
    return line_from_point_slope(m, x1, y1)

# Line with slope 3 through (2, 5)
f, b = line_from_point_slope(m=3, x1=2, y1=5)
print(f"y = 3(x-2) + 5  →  y = 3x + {b}")
print(f"f(2) = {f(2)}   (should be 5)")
print(f"f(0) = {f(0)}   (y-intercept)")

# Line through (-1, 4) and (3, -4)
g, b2 = line_from_two_points(-1, 4, 3, -4)
print(f"\\nLine through (-1,4) and (3,-4):")
print(f"Slope = {(-4-4)/(3-(-1))}")
print(f"y-intercept = {b2}")
print(f"g(-1) = {g(-1)}, g(3) = {g(3)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Parallel and perpendicular lines',
              prose: 'Why are perpendicular slopes negative reciprocals? Think geometrically: a slope of 2 means "go right 1, go up 2." Now rotate that direction 90° clockwise — you end up going "down 1, right 2," which is a slope of −1/2. Rise and run swap, and one flips sign. Algebraically, if two directions are perpendicular their dot product is zero: (1, m₁) · (1, m₂) = 1 + m₁m₂ = 0, so m₁m₂ = −1. This is why the product rule works for any pair of perpendicular lines (except vertical and horizontal, which are special cases). Parallel lines have identical slopes because they point in the same direction — they are offset copies of each other, never meeting. **Python pattern:** `perpendicular_line` computes m_perp = −1/m, then computes a new y-intercept through the given point: b = y₁ − m_perp · x₁. The three lines are built by calling the two factory functions, keeping all the slope arithmetic encapsulated. **Library:** All three lines are plotted together, colours differentiated, with a single `fig.point()` marking the shared point (1, 3) — making it visually obvious that the parallel and perpendicular lines both pass through the same location.',
              code: `from opencalc import Figure, BLUE, RED, GREEN, AMBER

def parallel_line(m, x1, y1):
    """Line through (x1,y1) parallel to slope m (same slope, different intercept)."""
    b = y1 - m * x1
    return lambda x: m * x + b

def perpendicular_line(m, x1, y1):
    """Line through (x1,y1) perpendicular to slope m."""
    m_perp = -1 / m
    b = y1 - m_perp * x1
    return lambda x: m_perp * x + b

m_orig = 2
b_orig = -1

f_orig = lambda x: m_orig * x + b_orig
f_para = parallel_line(m_orig, 1, 3)      # parallel through (1,3)
f_perp = perpendicular_line(m_orig, 1, 3) # perpendicular through (1,3)

fig = Figure(xmin=-2, xmax=5, ymin=-5, ymax=8, title="Parallel & Perpendicular Lines")
fig.grid().axes()
fig.plot(f_orig, color=BLUE,  label=f'original  m={m_orig}',  width=2.5)
fig.plot(f_para, color=GREEN, label=f'parallel  m={m_orig}',  width=2.5)
fig.plot(f_perp, color=RED,   label=f'perp      m={-1/m_orig}', width=2.5)
fig.point([1, 3], color=AMBER, radius=8, label='(1,3)')
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── MODELING WITH DATA ─────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Modeling with code — generating linear data',
              prose: [
                'Real-world data follows the model y = f(x) + ε, where ε (epsilon) is the **noise term** — the random variation around the true signal. For linear models, noise is usually assumed to be **Gaussian** (bell-curve, mean 0): symmetric errors, centred around the true value.',
                '## Noise level σ',
                '- σ = 0.5 — data hugs the line tightly, almost perfect\n- σ = 1.5 — moderate scatter, realistic for many real datasets\n- σ = 10 — wildly scattered, hard to recover the true line',
                '## Python pattern',
                '- `random.gauss(0, sigma)` — one sample from a Gaussian with mean 0 and standard deviation σ\n- Called inside a list comprehension once per point, generating **independent** noise for each\n- `random.seed(42)` — pins the random number generator for **reproducibility** — anyone running this gets identical data',
                'Synthetic data is fundamental to testing analysis code: you know the true answer, so you can measure exactly how well your estimator performs.',
              ],
              code: `import random
import math

random.seed(42)   # reproducible results

def generate_linear_data(m, b, n=20, noise_std=2.0):
    """
    Generate n data points from y = mx + b + Gaussian noise.
    noise_std controls how spread the data is around the true line.
    """
    xs = [i * 0.5 for i in range(n)]
    ys = [m * x + b + random.gauss(0, noise_std) for x in xs]
    return xs, ys

# Generate data from a known line: y = 2x + 1, noise σ=1.5
true_m, true_b = 2.0, 1.0
xs, ys = generate_linear_data(true_m, true_b, n=25, noise_std=1.5)

print(f"True model:  y = {true_m}x + {true_b}")
print(f"First 5 points:")
for x, y in zip(xs[:5], ys[:5]):
    print(f"  x={x:.1f}  y={y:.3f}  (true={true_m*x+true_b:.3f})  noise={y-(true_m*x+true_b):.3f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 9,
              cellTitle: 'Scatter plot — visualizing raw data',
              prose: 'A scatter plot is your first and most important diagnostic. Before fitting any model you must look at the data with your own eyes. Ask: does the cloud of points appear roughly linear, or does it curve? Does the spread (noise) stay constant left to right, or does it fan out (a sign that a linear model may not be appropriate)? Are there isolated points far from the main cloud — outliers that could drag a least-squares fit off course? Skipping this step is one of the most common mistakes in data analysis. The red line in this plot is the "true" underlying model — something you would never see in practice, but here it reveals how the noisy data scatters around the ground truth. **Python:** Data is regenerated by repeating the seed and generation code. In a real project you would store xs and ys in variables and share them across cells; here we repeat for self-containment. **Library:** `fig.scatter(xs, ys, color, radius)` places a dot at each (x, y) pair. Unlike `fig.plot()` which draws a smooth continuous curve through a mathematical function, `scatter()` marks discrete observed measurements — the visual distinction is immediate and communicates "this is data" vs "this is a model."',
              code: `from opencalc import Figure, BLUE, RED, GRAY

# Using data from previous cell (re-generate if needed)
import random
random.seed(42)
true_m, true_b = 2.0, 1.0
xs = [i * 0.5 for i in range(25)]
ys = [true_m * x + true_b + random.gauss(0, 1.5) for x in xs]

fig = Figure(xmin=-0.5, xmax=13, ymin=-4, ymax=28,
             title="Raw Data — before fitting any line")
fig.grid().axes()

# Scatter plot of the noisy data
fig.scatter(xs, ys, color=BLUE, radius=5)

# Show the TRUE line (pretend we know it — in practice we don't)
fig.plot(lambda x: true_m * x + true_b, color=RED,
         label=f'True line: y={true_m}x+{true_b}', width=1.5)

fig.text([1, 25], "Blue dots = observed data", color='blue', size=11)
fig.text([1, 22], "Red line = true model (hidden)", color='red', size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Residuals — the gap between model and data',
              prose: [
                'A **residual** is the signed gap between observation and prediction: residualᵢ = yᵢ − ŷᵢ = yᵢ − (mxᵢ + b).',
                '## Sign interpretation',
                '- **Positive residual** — point is above the line (model underestimated)\n- **Negative residual** — point is below the line (model overestimated)',
                '## MSE — Mean Squared Error',
                'MSE = Σ residualᵢ² / n. Squaring removes the sign (so positives and negatives do not cancel) and penalises large errors heavily — residual 4 → contributes 16, vs two residuals of 2 → contribute only 8.',
                '## What good residuals look like',
                '- Small and roughly equal in magnitude\n- Randomly scattered — no left-to-right trend, no curve, no clusters\n- Roughly equal numbers positive and negative\n\nIf you see a pattern in residuals, the model is systematically wrong about something.',
              ],
              code: `def residuals(xs, ys, m, b):
    """Compute residuals: actual y minus predicted y."""
    return [y - (m * x + b) for x, y in zip(xs, ys)]

def mse(xs, ys, m, b):
    """Mean Squared Error — average of squared residuals."""
    res = residuals(xs, ys, m, b)
    return sum(r**2 for r in res) / len(res)

import random
random.seed(42)
true_m, true_b = 2.0, 1.0
xs = [i * 0.5 for i in range(25)]
ys = [true_m * x + true_b + random.gauss(0, 1.5) for x in xs]

# Compare the true line vs a bad guess
res_true = residuals(xs, ys, m=2.0, b=1.0)
res_bad  = residuals(xs, ys, m=1.0, b=5.0)

print(f"True line  MSE: {mse(xs,ys,2.0,1.0):.4f}")
print(f"Bad guess  MSE: {mse(xs,ys,1.0,5.0):.4f}")
print(f"Smaller MSE = better fit")

# First 5 residuals for the true line
print("\\nFirst 5 residuals (true line):")
for x, y, r in zip(xs[:5], ys[:5], res_true[:5]):
    print(f"  y={y:.3f}  ŷ={true_m*x+true_b:.3f}  residual={r:.3f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Visualizing residuals',
              prose: 'The residual diagram makes the abstract formula concrete: each data point is connected to the line by a vertical segment whose length is |residual|. Green segments sit above the line (positive residual — model underestimated), red sit below (negative — model overestimated). In a well-fitted model these segments should look random: varying lengths with no obvious left-to-right pattern and roughly equal green and red throughout. If you see all the greens on one side and all the reds on the other, the line is tilted wrong. If the segments grow longer as x increases, the noise is not constant and a simple linear model may be insufficient. The name "least squares" comes from imagining a square of side |residualᵢ| drawn at each point — you are minimising the total area of all those squares. **Python:** The conditional `\'green\' if residual > 0 else \'red\'` is Python\'s inline ternary expression — a concise one-liner choice between two values. **Library:** `fig.line([x, y_hat], [x, y])` draws a vertical segment (same x, different y). Followed by `fig.point([x, y])` to mark the observed point. Looping over all (x, y) pairs builds the full residual diagram programmatically.',
              code: `from opencalc import Figure, BLUE, RED, AMBER

import random
random.seed(42)
true_m, true_b = 2.0, 1.0
xs = [i * 0.5 for i in range(25)]
ys = [true_m * x + true_b + random.gauss(0, 1.5) for x in xs]

m_fit, b_fit = 2.0, 1.0   # using true line for now

fig = Figure(xmin=-0.5, xmax=13, ymin=-4, ymax=28,
             title="Residuals — vertical gaps from points to line")
fig.grid().axes()

fig.plot(lambda x: m_fit*x + b_fit, color=BLUE, label='fitted line', width=2.5)

for x, y in zip(xs, ys):
    y_hat = m_fit * x + b_fit
    residual = y - y_hat
    # Draw the residual as a vertical line
    color = 'green' if residual > 0 else 'red'
    fig.line([x, y_hat], [x, y], color=color, width=1.5)
    fig.point([x, y], color=AMBER, radius=3)

fig.text([8, 26], "Green: above line (positive residual)", color='green', size=10)
fig.text([8, 23], "Red: below line (negative residual)",  color='red',   size=10)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── LEAST SQUARES ──────────────────────────────────────────────────
            {
              id: 12,
              cellTitle: 'Least squares — the best fit line',
              prose: [
                '## Why square the residuals?',
                '- **Calculus works:** squared error is smooth and differentiable — you can take ∂/∂m and ∂/∂b, set to zero, and solve exactly\n- **Absolute value breaks:** |residual| has a kink at zero where the derivative is undefined\n- **Outlier penalty:** squaring hits large errors hard — residual 10 contributes 100 vs ten residuals of 1 contributing 10 total',
                '## The closed-form solution (normal equations)',
                'Compute five sums from the data, then combine:',
                '- n = count, Σx = sum of x, Σy = sum of y, Σx² = sum of x², Σxy = sum of x·y\n- **m = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)**\n- **b = (Σy − m·Σx) / n**',
                'No iteration, no initialisation, no learning rate — one pass through the data, exact answer. **Python:** `sum()` with generator expressions is all you need — no imports, no libraries.',
              ],
              code: `def least_squares(xs, ys):
    """
    Compute the least-squares best-fit line y = mx + b.
    Closed-form solution derived by minimising sum of squared residuals.

    Formulas:
        m = (n·Σxy  - Σx·Σy) / (n·Σx² - (Σx)²)
        b = (Σy - m·Σx) / n
    """
    n  = len(xs)
    sx  = sum(xs)
    sy  = sum(ys)
    sx2 = sum(x**2 for x in xs)
    sxy = sum(x*y  for x, y in zip(xs, ys))

    m = (n * sxy - sx * sy) / (n * sx2 - sx**2)
    b = (sy - m * sx) / n
    return m, b

import random
random.seed(42)
true_m, true_b = 2.0, 1.0
xs = [i * 0.5 for i in range(25)]
ys = [true_m * x + true_b + random.gauss(0, 1.5) for x in xs]

m_hat, b_hat = least_squares(xs, ys)
print(f"True line:   m={true_m},    b={true_b}")
print(f"Fitted line: m={m_hat:.4f}, b={b_hat:.4f}")
print(f"Close — noise causes small deviations from true values")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Visualizing the fitted line',
              prose: [
                '**R²** (coefficient of determination) answers: what fraction of the variation in y does our line explain? Formula: R² = 1 − SS_res / SS_tot.',
                '## Interpreting R²',
                '- **R² = 1.0** — perfect fit, all variation explained\n- **R² = 0.97** — line explains 97% of variation, only 3% is residual noise\n- **R² = 0.0** — line is no better than predicting ȳ (the mean) for every point\n- **R² > 0.9** — strong fit for noisy real-world data\n- **R² > 0.99** — excellent fit (or suspiciously clean data)',
                '## The two sums',
                '- **SS_tot** = Σ(yᵢ − ȳ)² — total spread of y around its mean (your baseline if you always predict ȳ)\n- **SS_res** = Σ(yᵢ − ŷᵢ)² — remaining spread around the fitted line',
                '**Python:** `sum()` with generator expressions — no intermediate lists, constant memory. `y_mean` is computed once outside the sums.',
              ],
              code: `from opencalc import Figure, BLUE, RED, GREEN, AMBER
import random

random.seed(42)
true_m, true_b = 2.0, 1.0
xs = [i * 0.5 for i in range(25)]
ys = [true_m * x + true_b + random.gauss(0, 1.5) for x in xs]
m_hat, b_hat = least_squares(xs, ys)

def r_squared(xs, ys, m, b):
    """R² — fraction of variance explained by the line. 1 = perfect fit."""
    y_mean = sum(ys) / len(ys)
    ss_tot = sum((y - y_mean)**2 for y in ys)
    ss_res = sum((y - (m*x+b))**2 for x, y in zip(xs, ys))
    return 1 - ss_res / ss_tot

r2 = r_squared(xs, ys, m_hat, b_hat)

fig = Figure(xmin=-0.5, xmax=13, ymin=-4, ymax=28,
             title=f"Least Squares Fit  (R² = {r2:.4f})")
fig.grid().axes()

fig.scatter(xs, ys, color=AMBER, radius=5)
fig.plot(lambda x: true_m*x + true_b,  color=RED,  label='true line',   width=1.5)
fig.plot(lambda x: m_hat*x  + b_hat,   color=BLUE, label='fitted line',  width=2.5)

fig.text([0.5, 26], f"Fitted: y = {m_hat:.3f}x + {b_hat:.3f}", color='blue', size=11, bold=True)
fig.text([0.5, 23], f"True:   y = {true_m}x + {true_b}",       color='red',  size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Prediction and extrapolation',
              prose: 'Prediction is the entire point of building a model: substitute an x value you have not seen before and read off the predicted y. **Interpolation** — predicting within the range of your training data — is generally reliable, because the model has observed behaviour in that region. **Extrapolation** — predicting outside the data range — is an act of faith. The model has no evidence about what happens past x = 12 in this dataset. The linear relationship could continue, plateau, or reverse direction; the model has no way to know. A salary model built on 0–12 years of experience might predict astronomically high salaries at 100 years — nonsense. A physics model might extrapolate beyond a phase transition. The visual design of this plot makes the risk visible: the fitted line is blue and thick within the data range, then switches to red and thinner beyond x = 12, and a grey vertical line (`fig.vline()`) marks the boundary. These are not decorative — they are a communication tool that warns the reader when the model is operating without evidence. Treat extrapolation with scepticism proportional to how far you are from the data.',
              code: `import random
random.seed(42)
true_m, true_b = 2.0, 1.0
xs = [i * 0.5 for i in range(25)]   # data from x=0 to x=12
ys = [true_m * x + true_b + random.gauss(0, 1.5) for x in xs]
m_hat, b_hat = least_squares(xs, ys)

def predict(x, m, b):
    return m * x + b

# Interpolation — within data range
print("Interpolation (within data range):")
for x in [2.5, 5.0, 7.5]:
    print(f"  x={x}  →  ŷ={predict(x, m_hat, b_hat):.3f}")

# Extrapolation — outside data range (careful!)
print("\\nExtrapolation (outside data range — use with caution):")
for x in [15, 20, 50]:
    print(f"  x={x}  →  ŷ={predict(x, m_hat, b_hat):.1f}  (extrapolated)")

from opencalc import Figure, BLUE, AMBER, RED, GRAY
fig = Figure(xmin=-1, xmax=22, ymin=-5, ymax=50,
             title="Prediction: interpolation vs extrapolation")
fig.grid().axes()

# Data range
fig.scatter(xs, ys, color=AMBER, radius=5)

# Fitted line — extended into extrapolation zone
fig.plot(lambda x: m_hat*x + b_hat, xmin=0, xmax=12,   color=BLUE, width=3,
         label='fitted (data range)')
fig.plot(lambda x: m_hat*x + b_hat, xmin=12, xmax=22,  color=RED,  width=2,
         label='extrapolation')

fig.vline(12, color=GRAY)
fig.text([13, 45], "← extrapolation zone", color='red', size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── CHALLENGES ────────────────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Line from two points — plot and annotate',
              difficulty: 'easy',
              prompt: 'Write `line_through(x1, y1, x2, y2)` that returns `(m, b, fn)` — the slope, intercept, and the linear function. Then plot the line through (−2, 1) and (4, 7), marking both points and the y-intercept.',
              code: `from opencalc import Figure, BLUE, RED, AMBER

def line_through(x1, y1, x2, y2):
    """Return (m, b, fn) for the line through the two points."""
    pass

m, b, f = line_through(-2, 1, 4, 7)
print(f"Slope: {m}")
print(f"Y-intercept: {b}")
print(f"f(-2)={f(-2)}, f(4)={f(4)}")

fig = Figure(xmin=-4, xmax=6, ymin=-2, ymax=10,
             title=f"Line through (-2,1) and (4,7)")
fig.grid().axes()

# Your plot here
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'line_through' not in dir():
    res = "ERROR: line_through not defined."
else:
    m, b, f = line_through(-2, 1, 4, 7)
    if abs(m - 1.0) > 1e-9:
        res = f"ERROR: slope should be 1.0, got {m}."
    elif abs(b - 3.0) > 1e-9:
        res = f"ERROR: y-intercept should be 3.0, got {b}."
    elif abs(f(-2) - 1.0) > 1e-9:
        res = f"ERROR: f(-2) should be 1.0, got {f(-2)}."
    elif abs(f(4) - 7.0) > 1e-9:
        res = f"ERROR: f(4) should be 7.0, got {f(4)}."
    else:
        res = f"SUCCESS: line_through gives m={m}, b={b}. y = {m}x + {b}."
res
`,
              hint: 'm = (y2-y1)/(x2-x1), b = y1 - m*x1, fn = lambda x: m*x+b. Return a tuple: return m, b, fn.',
            },
            {
              id: 'c2',
              challengeType: 'fill',
              challengeNumber: 2,
              challengeTitle: 'Compute slope and intercept by hand',
              difficulty: 'easy',
              prompt: 'Fill in the formulas for `manual_least_squares` using the closed-form equations derived in the lesson.',
              starterBlock: `def manual_least_squares(xs, ys):
    n   = len(xs)
    sx  = sum(___)       # Σx
    sy  = sum(___)       # Σy
    sx2 = sum(___)       # Σx²
    sxy = sum(___)       # Σxy
    m = (n * sxy - sx * sy) / (___)
    b = (___ - m * sx) / n
    return m, b

xs = [0, 1, 2, 3, 4]
ys = [1, 3, 5, 7, 9]   # exactly y = 2x + 1
m, b = manual_least_squares(xs, ys)
print(f"m={m}, b={b}")  # should be m=2.0, b=1.0`,
              code: `def manual_least_squares(xs, ys):
    n   = len(xs)
    sx  = sum(___)
    sy  = sum(___)
    sx2 = sum(___)
    sxy = sum(___)
    m = (n * sxy - sx * sy) / (___)
    b = (___ - m * sx) / n
    return m, b

xs = [0, 1, 2, 3, 4]
ys = [1, 3, 5, 7, 9]
m, b = manual_least_squares(xs, ys)
print(f"m={m}, b={b}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'manual_least_squares' not in dir():
    res = "ERROR: manual_least_squares not defined."
else:
    xs = [0,1,2,3,4]; ys = [1,3,5,7,9]
    m, b = manual_least_squares(xs, ys)
    if abs(m - 2.0) > 1e-9:
        res = f"ERROR: m should be 2.0 for y=2x+1 data, got {m}."
    elif abs(b - 1.0) > 1e-9:
        res = f"ERROR: b should be 1.0, got {b}."
    else:
        res = f"SUCCESS: manual_least_squares gives m={m}, b={b} — correct for y=2x+1."
res
`,
              hint: 'sx = sum(xs). sy = sum(ys). sx2 = sum(x**2 for x in xs). sxy = sum(x*y for x,y in zip(xs,ys)). Denominator of m: (n*sx2 - sx**2). Numerator of b: (sy - m*sx).',
            },
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Fit a line to real-world data and visualize residuals',
              difficulty: 'medium',
              prompt: 'The data below represents years of experience (x) vs annual salary in $1000s (y). Fit a least-squares line, compute R², then plot: scatter of data, fitted line, and residual lines (green=above, red=below).',
              code: `from opencalc import Figure, BLUE, RED, GREEN, AMBER

experience = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
salary_k   = [42, 44, 50, 52, 55, 60, 62, 68, 70, 75, 78, 82]

# 1. Fit the line
m, b = least_squares(experience, salary_k)
print(f"Fitted: y = {m:.2f}x + {b:.2f}")
print(f"Interpretation: each year adds \${m*1000:,.0f} in salary")
print(f"Starting salary: \${b*1000:,.0f}")

# 2. Compute R²
r2 = r_squared(experience, salary_k, m, b)
print(f"R² = {r2:.4f}")

# 3. Plot data, line, and residuals
fig = Figure(xmin=0, xmax=13, ymin=35, ymax=90,
             title=f"Salary vs Experience  (R²={r2:.3f})")
fig.grid().axes()

# Your code here: scatter, fitted line, residual lines
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
exp  = [1,2,3,4,5,6,7,8,9,10,11,12]
sal  = [42,44,50,52,55,60,62,68,70,75,78,82]
if 'least_squares' not in dir():
    res = "ERROR: least_squares not defined."
elif 'r_squared' not in dir():
    res = "ERROR: r_squared not defined."
else:
    m, b = least_squares(exp, sal)
    r2   = r_squared(exp, sal, m, b)
    if abs(m - 3.5) > 0.5:
        res = f"ERROR: slope should be ~3.5 $/k per year, got {m:.3f}."
    elif r2 < 0.98:
        res = f"ERROR: R² should be > 0.98 for this data, got {r2:.4f}."
    else:
        res = f"SUCCESS: Fitted m={m:.3f}, b={b:.3f}, R²={r2:.4f}. Strong linear relationship."
res
`,
              hint: 'Reuse least_squares() and r_squared() from the lesson cells. For residual lines: for x, y in zip(experience, salary_k): y_hat = m*x+b; fig.line([x, y_hat], [x, y], color="green" if y>y_hat else "red")',
            },
            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Effect of noise on fit quality',
              difficulty: 'medium',
              prompt: 'Write `noise_experiment(noise_levels)` that, for each noise level σ in a list, generates 30 data points from y = 3x + 2, fits the line, and returns a list of (σ, m_fitted, b_fitted, R²). Plot R² vs noise level as a bar chart.',
              code: `import random
from opencalc import Figure

def noise_experiment(noise_levels, seed=42):
    """
    For each noise level σ, generate 30 points from y=3x+2,
    fit least squares, and return (σ, m, b, R²).
    """
    pass

results = noise_experiment([0.1, 0.5, 1.0, 2.0, 5.0, 10.0])
for sigma, m, b, r2 in results:
    print(f"σ={sigma:5.1f}  m={m:.3f}  b={b:.3f}  R²={r2:.4f}")

# Bar chart of R² vs noise level
fig = Figure(title="R² vs Noise Level — how noise degrades fit quality")
sigmas = [r[0] for r in results]
r2s    = [r[3] for r in results]
fig.bars([str(s) for s in sigmas], r2s, color='blue')
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import random
if 'noise_experiment' not in dir():
    res = "ERROR: noise_experiment not defined."
else:
    results = noise_experiment([0.1, 1.0, 10.0])
    if len(results) != 3:
        res = f"ERROR: should return 3 results, got {len(results)}."
    else:
        r2_low, r2_mid, r2_high = results[0][3], results[1][3], results[2][3]
        if not (r2_low > r2_mid > r2_high):
            res = f"ERROR: R² should decrease as noise increases. Got {r2_low:.3f}, {r2_mid:.3f}, {r2_high:.3f}."
        elif r2_low < 0.99:
            res = f"ERROR: At σ=0.1, R² should be >0.99, got {r2_low:.4f}."
        else:
            res = f"SUCCESS: R² decreases with noise: σ=0.1→{r2_low:.3f}, σ=1→{r2_mid:.3f}, σ=10→{r2_high:.3f}."
res
`,
              hint: 'For each sigma: random.seed(seed); xs=[i*0.5 for i in range(30)]; ys=[3*x+2+random.gauss(0,sigma) for x in xs]; m,b=least_squares(xs,ys); r2=r_squared(xs,ys,m,b). Append (sigma,m,b,r2) to results.',
            },
            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Compound: full modelling workflow',
              difficulty: 'hard',
              prompt: 'A scientist measures the distance (km) a sound travels underwater at different temperatures (°C). Fit a linear model, evaluate it, predict at a new temperature, and visualize everything: scatter + fit + residuals + prediction point.',
              code: `from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE

temp_c   = [5, 10, 15, 20, 25, 30, 35, 40]
speed_ms = [1480, 1490, 1500, 1510, 1521, 1531, 1541, 1552]  # m/s

# 1. Fit the model
m, b = least_squares(temp_c, speed_ms)
r2   = r_squared(temp_c, speed_ms, m, b)
print(f"Model: speed = {m:.2f}·temp + {b:.2f}")
print(f"Interpretation: {m:.2f} m/s per °C increase")
print(f"R² = {r2:.4f}")

# 2. Predict at 50°C (extrapolation)
temp_new = 50
speed_predicted = m * temp_new + b
print(f"\\nPrediction at {temp_new}°C: {speed_predicted:.1f} m/s")

# 3. Plot everything
fig = Figure(xmin=0, xmax=55, ymin=1470, ymax=1580,
             title=f"Speed of Sound vs Temperature  (R²={r2:.4f})")
fig.grid().axes()

# Your code: scatter, fitted line, residual lines, prediction point
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
temps  = [5,10,15,20,25,30,35,40]
speeds = [1480,1490,1500,1510,1521,1531,1541,1552]
if 'least_squares' not in dir():
    res = "ERROR: least_squares not defined."
else:
    m, b   = least_squares(temps, speeds)
    r2     = r_squared(temps, speeds, m, b)
    pred50 = m * 50 + b
    if abs(m - 2.27) > 0.3:
        res = f"ERROR: slope should be ~2.27 m/s per °C, got {m:.3f}."
    elif r2 < 0.999:
        res = f"ERROR: R² should be >0.999 for this data, got {r2:.5f}."
    elif abs(pred50 - 1563) > 5:
        res = f"ERROR: prediction at 50°C should be ~1563 m/s, got {pred50:.1f}."
    else:
        res = f"SUCCESS: m={m:.3f}, R²={r2:.5f}, prediction@50°C={pred50:.1f} m/s."
res
`,
              hint: 'Reuse least_squares, r_squared from lesson cells. Prediction point: fig.point([50, speed_predicted], color=PURPLE, radius=10, label=f"50°C→{speed_predicted:.0f}m/s"). Draw a vline at x=40 to show where extrapolation begins.',
            },
          ],
        },
      },
    ],
  },
}
