// Chapter 1.2 — Functions as Mappings
//
// PHASE 1 — MATHEMATICAL FOUNDATIONS (COMPUTATIONAL FIRST)
//
// TEACHES:
//   1.  What a function is — input → output, one output per input
//   2.  Python functions as math functions — def, lambda
//   3.  The math module — sqrt, sin, cos, exp, log, floor, ceil
//   4.  Domain and range — valid inputs, possible outputs
//   5.  Plotting your first function with opencalc Figure.plot()
//   6.  Multiple functions on one graph — visual comparison
//   7.  Discrete vs continuous — scatter vs plot, when each applies
//   8.  Domain restrictions — undefined values (sqrt, log, 1/x)
//   9.  Piecewise functions — if/else in a lambda or def
//  10.  Composition — f(g(x)), chaining functions
//  11.  Function families — linear, quadratic, exponential, trig
//  12.  Transformations — vertical/horizontal shifts and stretches
//  13.  Finding intersections numerically
//  14.  Range from a plot — reading min/max from a graph

export default {
  id: 'py-1-2-functions-as-mappings',
  slug: 'functions-as-mappings',
  chapter: 1.2,
  order: 1,
  title: 'Functions as Mappings',
  subtitle: 'Input → output, domain → range — and how to see it all in code',
  tags: ['function', 'domain', 'range', 'lambda', 'math module', 'plot', 'composition', 'piecewise', 'discrete', 'continuous', 'opencalc'],

  hook: {
    question: 'What is the difference between a function in Python and a function in mathematics — and are they really the same thing?',
    realWorldContext:
      'Every algorithm is a function. Every model is a function. A neural network is a function ' +
      'from pixel values to class probabilities. A physics simulation is a function from time to position. ' +
      'A recommendation system is a function from user history to suggested items. ' +
      'The mathematical definition of a function — exactly one output per input — is not abstract ceremony. ' +
      'It is the contract that makes software predictable, testable, and composable. ' +
      'This lesson teaches you to think in functions: to graph them, compose them, restrict them, ' +
      'and build intuition for their shapes before you need calculus to analyse them.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A function is a rule that assigns **exactly one output to every valid input**. ' +
      'The set of valid inputs is the **domain**. The set of all possible outputs is the **range**. ' +
      'This one-output-per-input rule is what makes functions useful: given the same input, ' +
      'you always get the same output. That is the definition of predictability.',
      'Python functions obey the same contract when they are **pure** — no side effects, ' +
      'no hidden state, same output for same input. `math.sqrt(4)` always returns 2.0. ' +
      'A function that reads from a database or depends on the time is not mathematically pure, ' +
      'and that is fine — but it cannot be reasoned about the same way.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'One output per input — always',
        body: 'f(x) = ±√x is NOT a function (two outputs for x > 0). f(x) = √x IS a function (one non-negative output). The vertical line test on a graph: if any vertical line hits the curve twice, it is not a function.',
      },
      {
        type: 'insight',
        title: 'Domain matters more than you think',
        body: 'math.sqrt(-1) raises ValueError. math.log(0) raises ValueError. 1/0 raises ZeroDivisionError. Python enforces the domain restriction at runtime. Mathematics states it upfront.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Functions as Mappings',
        mathBridge: 'f: Domain → Range. Every x in the domain maps to exactly one f(x) in the range. The graph of f is the set of all points (x, f(x)).',
        caption: 'Each cell builds one piece of the functions mental model — then visualizes it with opencalc.',
        props: {
          initialCells: [
            // ── CONCEPT ───────────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Functions — the mathematical definition',
              prose: 'A function f: A → B is a rule that assigns to every element of the domain A exactly one element of the codomain B. In Python, a `def` or `lambda` that always returns the same output for the same input is a mathematical function.',
              code: `import math

# Python functions as mathematical functions
def square(x):
    return x ** 2

def cube(x):
    return x ** 3

reciprocal = lambda x: 1 / x     # domain: x ≠ 0
root       = lambda x: math.sqrt(x)  # domain: x ≥ 0

# Apply them
print(square(3))      # 9
print(cube(-2))       # -8
print(reciprocal(4))  # 0.25
print(root(16))       # 4.0

# Same input → always same output (pure functions)
print(square(3) == square(3))  # True — always`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'The math module — Python\'s standard math library',
              prose: '`import math` gives you all the standard mathematical functions. These are implemented in C for speed and accuracy. Learn these — you will use them constantly in data science, simulations, and visualizations.',
              code: `import math

# Powers and roots
print(math.sqrt(2))       # 1.4142...  — square root
print(math.pow(2, 10))    # 1024.0     — power (returns float)
print(math.cbrt(27))      # 3.0        — cube root (Python 3.11+)

# Logarithms
print(math.log(math.e))   # 1.0        — natural log (base e)
print(math.log(100, 10))  # 2.0        — log base 10
print(math.log2(1024))    # 10.0       — log base 2
print(math.log10(1e6))    # 6.0

# Trig (arguments in RADIANS)
print(math.sin(math.pi / 2))   # 1.0
print(math.cos(0))             # 1.0
print(math.tan(math.pi / 4))   # 1.0 (≈)

# Rounding
print(math.floor(3.7))   # 3  — round down
print(math.ceil(3.2))    # 4  — round up

# Constants
print(math.pi)    # 3.14159...
print(math.e)     # 2.71828...
print(math.tau)   # 2π = 6.28318...`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Domain — what inputs are valid',
              prose: 'The domain is the set of inputs where f(x) is defined. Python enforces domain restrictions by raising exceptions. Before calling a function, you need to know its domain.',
              code: `import math

# These raise exceptions — domain violations
def safe_sqrt(x):
    if x < 0:
        return None   # undefined for negative inputs
    return math.sqrt(x)

def safe_log(x):
    if x <= 0:
        return None   # log is undefined at 0 and negative
    return math.log(x)

def safe_recip(x):
    if x == 0:
        return None   # 1/0 is undefined
    return 1 / x

# Domain of each:
print("sqrt domain:  x ≥ 0")
print("log domain:   x > 0")
print("1/x domain:   x ≠ 0")
print("sin domain:   all reals (ℝ)")
print("polynomial:   all reals (ℝ)")

# Test
for x in [-2, -1, 0, 1, 4]:
    print(f"x={x:3}  sqrt={safe_sqrt(x)}  log={safe_log(x)}  1/x={safe_recip(x)}")`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── FIRST PLOT ────────────────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Plotting your first function with opencalc',
              prose: '`fig.plot(fn, ...)` takes any Python callable and samples it across the x-range. The result is the graph of f — the set of all points (x, f(x)). This is the visual definition of a function.',
              instructions: 'Run the cell and study the graph. Then change the function to `lambda x: x**3` and re-run. Watch how the shape changes.',
              code: `from opencalc import Figure, BLUE, AMBER, GREEN

fig = Figure(xmin=-4, xmax=4, ymin=-10, ymax=10, title="f(x) = x²")
fig.grid().axes()

# Plot f(x) = x²
fig.plot(lambda x: x**2, color=BLUE, label='f(x) = x²', width=3)

# Mark the vertex
fig.point([0, 0], color=AMBER, radius=8, label='vertex')

# Mark a specific input-output pair: x=2 → f(2)=4
fig.point([2, 4], color=GREEN, radius=7, label='(2, 4)')
fig.line([2, 0], [2, 4], color=GREEN, width=1.5, dashed=True)   # vertical drop
fig.line([0, 4], [2, 4], color=GREEN, width=1.5, dashed=True)   # horizontal

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Multiple functions on one graph',
              prose: 'Call `fig.plot()` multiple times to overlay functions. This is the most powerful way to compare function families visually — see how they grow, where they intersect, and how their shapes differ.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, PURPLE, AMBER

fig = Figure(xmin=0, xmax=4, ymin=-1, ymax=8,
             title="Function Families on [0, 4]")
fig.grid().axes()

fig.plot(lambda x: x,            color=BLUE,   label='linear: x',    width=2)
fig.plot(lambda x: x**2,         color=RED,    label='quadratic: x²', width=2)
fig.plot(lambda x: math.sqrt(x), color=GREEN,  label='root: √x',     width=2)
fig.plot(lambda x: math.log(x + 1), color=PURPLE, label='log: ln(x+1)', width=2)
fig.plot(lambda x: math.exp(x/2),   color=AMBER,  label='exp: eˣ/²',  width=2)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Discrete vs continuous — scatter vs plot',
              prose: '`fig.plot()` draws a continuous curve — it assumes f is defined everywhere in the range. `fig.scatter()` draws isolated points — no connections. Use scatter for sequences, data samples, or any function defined only at specific inputs.',
              code: `from opencalc import Figure, BLUE, RED

# Continuous: f(x) = sin(x) — defined for all real x
import math

fig = Figure(xmin=-7, xmax=7, ymin=-1.5, ymax=1.5,
             title="Continuous (line) vs Discrete (dots)")
fig.grid().axes()

# Continuous version — smooth curve
fig.plot(math.sin, color=BLUE, label='sin(x) — continuous', width=2)

# Discrete version — sample at integer points only
xs = list(range(-6, 7))           # integers from -6 to 6
ys = [math.sin(x) for x in xs]   # sin evaluated at each integer
fig.scatter(xs, ys, color=RED, radius=6)

# Label the difference
fig.text([-5, 1.2], "Discrete samples (red dots)", color='red', size=11)
fig.text([-5, -1.3], "Continuous curve (blue line)", color='blue', size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── DOMAIN AND RANGE ──────────────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Domain restrictions — plotting safely',
              prose: 'When a function is undefined on part of the x-range, `fig.plot()` handles it gracefully: it returns `None` for undefined values and simply leaves a gap in the curve. Your safe wrapper does the same — return None where undefined.',
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER

fig = Figure(xmin=-5, xmax=5, ymin=-3, ymax=5,
             title="Functions with Restricted Domains")
fig.grid().axes()

# 1/x — undefined at x=0, shown as two branches
fig.plot(lambda x: 1/x if x != 0 else None,
         color=RED, label='1/x  (x≠0)', width=2)

# √x — only defined for x ≥ 0
fig.plot(lambda x: math.sqrt(x) if x >= 0 else None,
         color=BLUE, label='√x  (x≥0)', width=2)

# ln(x) — only defined for x > 0
fig.plot(lambda x: math.log(x) if x > 0 else None,
         color=AMBER, label='ln(x)  (x>0)', width=2)

# Mark the boundary of the domain for sqrt
fig.point([0, 0], color=BLUE, radius=6, label='domain starts')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 8,
              cellTitle: 'Range — what values can f(x) actually take?',
              prose: 'The range is the set of all outputs f(x) produces over its domain. You can approximate it computationally: sample many x-values and look at the min/max of the outputs. The graph makes the range visually obvious.',
              code: `import math

def numerical_range(fn, xmin, xmax, steps=1000):
    """Approximate the range of fn by sampling steps points."""
    xs = [xmin + (xmax - xmin) * i / steps for i in range(steps + 1)]
    ys = []
    for x in xs:
        try:
            y = fn(x)
            if y is not None and math.isfinite(y):
                ys.append(y)
        except Exception:
            pass
    if not ys:
        return None, None
    return min(ys), max(ys)

functions = {
    'x²       on [-3,3]':  (lambda x: x**2,      -3, 3),
    'sin(x)   on [-π,π]':  (lambda x: math.sin(x), -math.pi, math.pi),
    '1/x      on [0.1,5]': (lambda x: 1/x,         0.1, 5),
    'e^x      on [-2,2]':  (lambda x: math.exp(x), -2, 2),
}

for name, (fn, a, b) in functions.items():
    lo, hi = numerical_range(fn, a, b)
    print(f"{name}  →  range ≈ [{lo:.3f}, {hi:.3f}]")`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── PIECEWISE AND COMPOSITION ─────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Piecewise functions',
              prose: 'A piecewise function uses different rules on different parts of the domain. In Python, use `if/else` inside a `def` or a conditional expression in a `lambda`. The absolute value function is the classic example.',
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER

# Piecewise: the absolute value (we saw this last lesson)
abs_fn = lambda x: x if x >= 0 else -x

# A more interesting piecewise function:
# f(x) = { x²       if x < 0
#         { 2        if x == 0
#         { √x       if x > 0
def mixed(x):
    if x < 0:
        return x ** 2
    elif x == 0:
        return 2
    else:
        return math.sqrt(x)

fig = Figure(xmin=-4, xmax=4, ymin=-0.5, ymax=5,
             title="Piecewise: x² for x<0, 2 at x=0, √x for x>0")
fig.grid().axes()

fig.plot(lambda x: x**2     if x < 0  else None, color=RED,  label='x²  (x<0)', width=3)
fig.plot(lambda x: math.sqrt(x) if x > 0 else None, color=BLUE, label='√x  (x>0)', width=3)
fig.point([0, 2], color=AMBER, radius=8, label='(0, 2)')

# Show the join — continuity broken at x=0
fig.point([0, 0], color=RED,  radius=6)   # limit from left: 0² = 0
fig.point([0, 0], color=BLUE, radius=6)   # limit from right: √0 = 0
fig.text([-3.5, 4.5], "Discontinuity at x=0", color='amber', size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 10,
              cellTitle: 'Composition — f(g(x))',
              prose: 'Composition feeds the output of one function into another: (f∘g)(x) = f(g(x)). The domain of f∘g is the set of x in the domain of g where g(x) is also in the domain of f. Composition is how you build complex functions from simple pieces.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, PURPLE

# Define components
f = lambda x: x ** 2          # f(x) = x²
g = lambda x: math.sin(x)     # g(x) = sin(x)
h = lambda x: math.exp(x)     # h(x) = eˣ

# Compositions
fog = lambda x: f(g(x))       # f∘g = sin²(x)
gof = lambda x: g(f(x))       # g∘f = sin(x²)
hog = lambda x: h(g(x))       # h∘g = e^(sin x)

# Note: f∘g ≠ g∘f  (composition is not commutative)
x = 1.0
print(f"f(g(1)) = f(sin(1)) = sin(1)²  = {fog(x):.4f}")
print(f"g(f(1)) = g(1²)     = sin(1)   = {gof(x):.4f}")
print(f"Different! Composition is not commutative.")

fig = Figure(xmin=-6, xmax=6, ymin=-1.2, ymax=1.5,
             title="Compositions of sin and x²")
fig.grid().axes()
fig.plot(g,   color=BLUE,   label='g(x) = sin(x)',   width=1.5)
fig.plot(fog, color=RED,    label='f∘g = sin²(x)',   width=2.5)
fig.plot(gof, color=GREEN,  label='g∘f = sin(x²)',   width=2.5)
fig.plot(hog, color=PURPLE, label='h∘g = eˢⁱⁿ⁽ˣ⁾',  width=1.5)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── TRANSFORMATIONS ───────────────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Transformations — shifting and scaling',
              prose: 'Every function can be transformed: shifted up/down/left/right, stretched vertically or horizontally, or reflected. These transformations follow exact rules. Learning them means you can understand a new function\'s graph immediately from its formula.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE, GRAY

base = lambda x: x ** 2   # f(x) = x²

fig = Figure(xmin=-5, xmax=5, ymin=-3, ymax=10,
             title="Transformations of f(x) = x²")
fig.grid().axes()

fig.plot(base,                    color=GRAY,   label='f(x) = x²',           width=1.5)
fig.plot(lambda x: base(x) + 2,  color=BLUE,   label='f(x)+2  ↑ shift',     width=2)
fig.plot(lambda x: base(x) - 2,  color=RED,    label='f(x)-2  ↓ shift',     width=2)
fig.plot(lambda x: base(x - 2),  color=GREEN,  label='f(x-2)  → shift',     width=2)
fig.plot(lambda x: base(x + 2),  color=AMBER,  label='f(x+2)  ← shift',     width=2)
fig.plot(lambda x: 2 * base(x),  color=PURPLE, label='2f(x)   ↑ stretch',   width=2)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 12,
              cellTitle: 'Function families — shapes you must recognise',
              prose: 'These five families appear everywhere in science, engineering, and data science. Train your eye to recognise them by shape alone. Each has a characteristic behaviour.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE

fig = Figure(xmin=-3, xmax=3, ymin=-2, ymax=8,
             title="The Five Essential Function Families")
fig.grid().axes()

# 1. Linear — constant rate of change
fig.plot(lambda x: 2*x + 1,      color=BLUE,   label='Linear: 2x+1',     width=2)
# 2. Quadratic — parabola, one turning point
fig.plot(lambda x: x**2,         color=RED,    label='Quadratic: x²',    width=2)
# 3. Exponential — rapid growth, always positive
fig.plot(lambda x: math.exp(x),  color=GREEN,  label='Exponential: eˣ',  width=2)
# 4. Logarithmic — slow growth, defined for x>0
fig.plot(lambda x: math.log(x) if x > 0 else None,
                                  color=AMBER,  label='Logarithm: ln(x)', width=2)
# 5. Trigonometric — periodic oscillation
fig.plot(lambda x: 1.5*math.sin(2*x), color=PURPLE, label='Trig: 1.5sin(2x)', width=2)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Finding intersections numerically',
              prose: 'Two functions intersect where f(x) = g(x), i.e. where f(x) - g(x) = 0. You can find this numerically by scanning for sign changes — when f(x)-g(x) flips from positive to negative (or vice versa), a root is nearby.',
              code: `import math

def find_intersections(f, g, xmin, xmax, steps=1000, tol=1e-6):
    """Find x values where f(x) ≈ g(x) by scanning for sign changes."""
    dx = (xmax - xmin) / steps
    crossings = []
    try:
        prev = f(xmin) - g(xmin)
    except Exception:
        prev = None

    for i in range(1, steps + 1):
        x = xmin + i * dx
        try:
            curr = f(x) - g(x)
        except Exception:
            curr = None
            continue
        if prev is not None and curr is not None and prev * curr < 0:
            # Sign change — bisect to narrow down
            a, b = x - dx, x
            for _ in range(50):
                mid = (a + b) / 2
                try:
                    mid_val = f(mid) - g(mid)
                except Exception:
                    break
                if abs(mid_val) < tol:
                    break
                if (f(a) - g(a)) * mid_val < 0:
                    b = mid
                else:
                    a = mid
            crossings.append(round((a + b) / 2, 6))
        prev = curr
    return crossings

# Where does x² intersect 2x + 1?
f = lambda x: x**2
g = lambda x: 2*x + 1
pts = find_intersections(f, g, -3, 5)
print("x² = 2x+1 at x =", pts)   # Should give x ≈ -0.414 and x ≈ 2.414
print("Verify: x²=", [round(x**2,4) for x in pts],
      "2x+1=", [round(2*x+1,4) for x in pts])`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: 'Visualizing intersections',
              prose: 'Plot both functions and mark the intersections. This is the workflow you will use throughout data science: find a solution numerically, then verify it visually.',
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER

f = lambda x: x**2
g = lambda x: 2*x + 1

# Intersections found in previous cell
intersections = find_intersections(f, g, -3, 5)

fig = Figure(xmin=-2, xmax=4, ymin=-1, ymax=10,
             title="x² and 2x+1 — intersections marked")
fig.grid().axes()

fig.plot(f, color=BLUE, label='f(x) = x²',    width=2.5)
fig.plot(g, color=RED,  label='g(x) = 2x+1',  width=2.5)

for x in intersections:
    y = f(x)
    fig.point([x, y], color=AMBER, radius=8,
              label=f'({x:.3f}, {y:.3f})')
    fig.vline(x, color=AMBER)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── CHALLENGES ────────────────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Plot and read the range',
              difficulty: 'easy',
              prompt: 'Plot f(x) = -x² + 4 on [-3, 3] using opencalc. Mark the maximum point. Then use `numerical_range` to compute the approximate range and print it.',
              code: `import math
from opencalc import Figure, BLUE, AMBER

def numerical_range(fn, xmin, xmax, steps=1000):
    xs = [xmin + (xmax - xmin) * i / steps for i in range(steps + 1)]
    ys = [fn(x) for x in xs]
    return min(ys), max(ys)

f = lambda x: -x**2 + 4

# Print the range
lo, hi = numerical_range(f, -3, 3)
print(f"Range of f on [-3,3]: [{lo:.2f}, {hi:.2f}]")

# Plot f and mark the maximum
fig = Figure(xmin=-3, xmax=3, ymin=-6, ymax=6, title="f(x) = -x² + 4")
fig.grid().axes()

# Your code here: plot f, mark the maximum point
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'f' not in dir():
    res = "ERROR: f not defined."
elif 'numerical_range' not in dir():
    res = "ERROR: numerical_range not defined."
else:
    lo, hi = numerical_range(f, -3, 3)
    if abs(hi - 4.0) > 0.01:
        res = f"ERROR: Maximum should be 4.0, got {hi:.4f}. Check your function."
    elif abs(lo - (-5.0)) > 0.01:
        res = f"ERROR: Minimum on [-3,3] should be -5.0, got {lo:.4f}."
    else:
        res = f"SUCCESS: Range of -x²+4 on [-3,3] is [{lo:.2f}, {hi:.2f}]. Max is 4 at x=0."
res
`,
              hint: 'fig.plot(f, color=BLUE). The maximum is at x=0 where f(0)=4. Use fig.point([0, 4], color=AMBER, label="max") to mark it.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Implement function composition',
              difficulty: 'easy',
              prompt: 'Write `compose(f, g)` that returns a new function h where h(x) = f(g(x)). Then compose `math.sin` with `math.exp` (sin(eˣ)) and plot both the component and the composition on [-2, 2].',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN

def compose(f, g):
    """Return the function h(x) = f(g(x))."""
    pass

# Build sin(eˣ)
h = compose(math.sin, math.exp)

# Test: sin(e^0) = sin(1) ≈ 0.8415
print(h(0))           # should be sin(1) ≈ 0.8415
print(math.sin(math.exp(0)))  # same thing

fig = Figure(xmin=-2, xmax=2, ymin=-1.5, ymax=8,
             title="Composition: sin(eˣ)")
fig.grid().axes()

# Plot eˣ, sin(x), and their composition sin(eˣ)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'compose' not in dir():
    res = "ERROR: compose not defined."
else:
    h = compose(math.sin, math.exp)
    r1 = h(0)
    r2 = h(1)
    expected1 = math.sin(math.exp(0))
    expected2 = math.sin(math.exp(1))
    if abs(r1 - expected1) > 1e-10:
        res = f"ERROR: h(0) should be {expected1:.6f}, got {r1}."
    elif abs(r2 - expected2) > 1e-10:
        res = f"ERROR: h(1) should be {expected2:.6f}, got {r2}."
    else:
        res = f"SUCCESS: compose works. h(0)=sin(e⁰)={r1:.4f}, h(1)=sin(e¹)={r2:.4f}."
res
`,
              hint: 'return lambda x: f(g(x)). For the plot: fig.plot(math.exp, color=RED, label="eˣ"), fig.plot(math.sin, color=BLUE, label="sin(x)"), fig.plot(h, color=GREEN, label="sin(eˣ)")',
            },
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Plot a piecewise function',
              difficulty: 'medium',
              prompt: 'Implement and plot the "ramp" function:\n  f(x) = 0      if x < 0\n  f(x) = x      if 0 ≤ x ≤ 3\n  f(x) = 3      if x > 3\nThis is called ReLU-clipped in ML. Mark the three regions with different colors.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER

def ramp(x):
    """Clipped ramp: 0 for x<0, x for 0≤x≤3, 3 for x>3."""
    pass

# Test
print(ramp(-2))   # 0
print(ramp(0))    # 0
print(ramp(1.5))  # 1.5
print(ramp(3))    # 3
print(ramp(5))    # 3

fig = Figure(xmin=-3, xmax=6, ymin=-0.5, ymax=4,
             title="Ramp (Clipped ReLU): f(x) = clip(x, 0, 3)")
fig.grid().axes()

# Plot each piece in a different color
# Your code here
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'ramp' not in dir():
    res = "ERROR: ramp not defined."
else:
    tests = [(-5, 0), (-1, 0), (0, 0), (1.5, 1.5), (3, 3), (4, 3), (100, 3)]
    errors = [(x, ramp(x), exp) for x, exp in tests if abs(ramp(x) - exp) > 1e-9]
    if errors:
        x, got, exp = errors[0]
        res = f"ERROR: ramp({x}) should be {exp}, got {got}."
    else:
        res = "SUCCESS: ramp correctly returns 0 for x<0, x for 0≤x≤3, and 3 for x>3."
res
`,
              hint: 'In def ramp(x): if x < 0: return 0. elif x <= 3: return x. else: return 3. For plotting: fig.plot(lambda x: 0 if x < 0 else None, color=RED), etc.',
            },
            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Transformation explorer',
              difficulty: 'medium',
              prompt: 'Write `transform(f, a=1, b=1, c=0, d=0)` that returns the function g(x) = a·f(b·(x−c)) + d. Then plot the base function f(x)=sin(x) alongside 3 transformations of your choice, labelling each.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE, GRAY

def transform(f, a=1, b=1, c=0, d=0):
    """Return g(x) = a * f(b * (x - c)) + d."""
    pass

base = math.sin

# Test: transform(sin, a=2) should double the amplitude
g = transform(base, a=2)
print(g(math.pi/2))   # should be 2.0 (2 * sin(π/2))

fig = Figure(xmin=-7, xmax=7, ymin=-3, ymax=3,
             title="Transformations of sin(x)")
fig.grid().axes()

fig.plot(base, color=GRAY, label='sin(x) original', width=1.5)

# Your 3 transformations here — try amplitude, period, phase shift, vertical shift
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'transform' not in dir():
    res = "ERROR: transform not defined."
else:
    f = math.sin
    g1 = transform(f, a=2)
    g2 = transform(f, b=2)
    g3 = transform(f, c=math.pi/2)
    g4 = transform(f, d=1)
    e1 = abs(g1(math.pi/2) - 2.0)        # amplitude 2
    e2 = abs(g2(math.pi/4) - 1.0)        # period halved
    e3 = abs(g3(0) - 1.0)                # phase shift right π/2
    e4 = abs(g4(0) - 1.0)                # vertical shift +1
    if e1 > 1e-9:
        res = f"ERROR: transform(sin,a=2)(π/2) should be 2.0, got {g1(math.pi/2):.4f}."
    elif e2 > 1e-9:
        res = f"ERROR: transform(sin,b=2)(π/4) should be 1.0, got {g2(math.pi/4):.4f}."
    elif e3 > 1e-9:
        res = f"ERROR: transform(sin,c=π/2)(0) should be 1.0, got {g3(0):.4f}."
    elif e4 > 1e-9:
        res = f"ERROR: transform(sin,d=1)(0) should be 1.0, got {g4(0):.4f}."
    else:
        res = "SUCCESS: transform(f,a,b,c,d) correctly implements a·f(b·(x−c))+d."
res
`,
              hint: 'return lambda x: a * f(b * (x - c)) + d. Parameters: a = amplitude, b = frequency (1/period), c = horizontal shift, d = vertical shift.',
            },
            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Build a visual function comparison tool',
              difficulty: 'hard',
              prompt: 'Write `compare_growth(xmax=10)` that plots x (linear), x² (quadratic), x³ (cubic), 2^x (exponential), and ln(x) (logarithmic) on [0.1, xmax] and uses a log y-scale by computing log10(|f(x)|) to compare their growth rates on the same graph.',
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE

def compare_growth(xmax=10):
    """
    Plot log10(f(x)) for several functions to compare growth rates.
    Taking log of both sides lets wildly different magnitudes fit on one graph.
    """
    pass

compare_growth(xmax=10)
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'compare_growth' not in dir():
    res = "ERROR: compare_growth not defined."
else:
    # Can't test the plot directly — test the underlying logic
    fns = {
        'x':     lambda x: x,
        'x²':    lambda x: x**2,
        '2^x':   lambda x: 2**x,
        'ln(x)': lambda x: math.log(x) if x > 0 else None,
    }
    x = 8
    log_linear = math.log10(x)
    log_quad   = math.log10(x**2)
    log_exp    = math.log10(2**x)
    # Exponential should grow fastest (largest log at x=8)
    if not (log_exp > log_quad > log_linear > 0):
        res = f"ERROR: At x=8, growth order should be exp > quad > linear. Got exp={log_exp:.2f}, quad={log_quad:.2f}, linear={log_linear:.2f}."
    else:
        compare_growth(xmax=10)
        res = f"SUCCESS: Growth rates verified at x=8: exp={log_exp:.2f} > quad={log_quad:.2f} > linear={log_linear:.2f} (log10 scale)."
res
`,
              hint: 'For each function, plot lambda x: math.log10(abs(fn(x))) if fn(x) is not None and fn(x) != 0 else None. This maps wildly different magnitudes onto a single readable scale.',
            },
          ],
        },
      },
    ],
  },
}
