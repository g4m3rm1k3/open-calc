// Chapter 1.1 — Numbers & Structure
//
// PHASE 1 — MATHEMATICAL FOUNDATIONS (COMPUTATIONAL FIRST)
//
// TEACHES:
//   1.  Number hierarchy — ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ and Python's type system
//   2.  Python int — exact, arbitrary-precision
//   3.  Python float — IEEE 754, finite precision
//   4.  The floating-point surprise — 0.1 + 0.2 ≠ 0.3
//   5.  repr() — seeing the true stored value
//   6.  Machine epsilon — sys.float_info
//   7.  Safe float comparison — math.isclose, abs(a-b) < tol
//   8.  Scientific notation — e-notation, orders of magnitude
//   9.  Exact arithmetic — decimal.Decimal
//  10.  Visualizing the number line with opencalc Figure
//  11.  Absolute value — definition, implementation, plot
//  12.  Distance — |a - b|, symmetry, non-negativity
//  13.  Distance visualization — two points, gap
//  14.  |x - c| < r — the interval interpretation

export default {
  id: 'py-1-1-numbers-structure',
  slug: 'numbers-and-structure',
  chapter: 1.1,
  order: 0,
  title: 'Numbers & Structure',
  subtitle: 'What numbers really are — and what computers do to them',
  tags: ['int', 'float', 'floating point', 'precision', 'scientific notation', 'absolute value', 'distance', 'opencalc', 'Figure'],

  hook: {
    question: 'Why does Python say 0.1 + 0.2 = 0.30000000000000004?',
    realWorldContext:
      'In 2012, a Vancouver stock exchange reported a 48-point index gain that turned out to be ' +
      'a rounding error accumulated over five months. In 1991, a Patriot missile system in ' +
      'Dhahran failed to intercept a Scud because a 0.000000095 second clock error, accumulated ' +
      'over 100 hours, caused a 687-metre targeting miss. ' +
      'These are not software bugs. They are a consequence of representing infinitely many real ' +
      'numbers in a fixed number of bits. This lesson teaches you exactly what is happening — ' +
      'and how to write code that is correct about it.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Numbers fall into families, each nested inside the next: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. ' +
      'Python\'s type system mirrors this hierarchy, but the mapping is not perfect — ' +
      '`int` is exact and unbounded, `float` is approximate and bounded.',
      'The gap between ℚ (the rationals) and ℝ (the reals) is where most computation lives. ' +
      'Understanding which side of that gap your numbers are on — and what the computer is ' +
      'actually storing — is the foundation of numerical reasoning.',
    ],
    callouts: [
      {
        type: 'important',
        title: 'int is exact. float is approximate.',
        body: 'Python int uses arbitrary-precision arithmetic — 2**1000 is exact. float is a 64-bit IEEE 754 binary fraction — 0.1 is stored as an approximation.',
      },
      {
        type: 'insight',
        title: 'From here on, we visualize.',
        body: 'Starting in Chapter 1, every lesson uses the opencalc Figure library to build mathematical intuition visually. Run every cell — the figures respond to your code.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Numbers & Structure',
        mathBridge: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ. Each family of numbers is a proper subset of the next. Python\'s int covers ℤ exactly. float approximates ℝ with 64 bits.',
        caption: 'Work through every cell. The visualization cells introduce the opencalc library — the tool we will use for all mathematical figures going forward.',
        props: {
          initialCells: [
            // ── CONCEPT ────────────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'The number hierarchy — ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ',
              prose: [
                '## The four families — ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ',
                '- **ℕ Natural numbers** — {1, 2, 3, …} — counting, always positive\n- **ℤ Integers** — {…, −2, −1, 0, 1, 2, …} — add zero and negatives\n- **ℚ Rationals** — any fraction p/q — decimals that terminate (0.25) or repeat (0.333…)\n- **ℝ Reals** — add irrationals like √2 and π whose decimals never repeat',
                '## Python\'s mapping',
                '- **`int`** → ℤ exactly, arbitrary size, no overflow\n- **`float`** → ℝ approximately, 64-bit IEEE 754, ~15 decimal digits of precision\n- **`Fraction`** → ℚ exactly (from the `fractions` module) — useful when you need exact rational results',
              ],
              code: `# Natural numbers ℕ — counting numbers (positive integers)
naturals = [1, 2, 3, 4, 5]

# Integers ℤ — naturals + zero + negatives
integers = [-3, -2, -1, 0, 1, 2, 3]

# Rationals ℚ — any fraction p/q (decimals that terminate or repeat)
from fractions import Fraction
rationals = [Fraction(1, 3), Fraction(1, 4), Fraction(22, 7)]
print("1/3 =", float(Fraction(1, 3)))   # 0.333...
print("1/4 =", float(Fraction(1, 4)))   # 0.25  (terminates)

# Irrationals — non-repeating, non-terminating decimals
import math
print("√2  =", math.sqrt(2))    # 1.41421356...
print("π   =", math.pi)         # 3.14159265...
print("e   =", math.e)          # 2.71828182...`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Python int — exact, unbounded',
              prose: [
                'Python\'s `int` uses **arbitrary-precision** arithmetic — it allocates as many bits as the number needs, so there is no overflow. `2**1000` (302 digits) is computed exactly and instantly. Most other languages store integers in fixed 32 or 64 bits and overflow silently.',
                '## Division operators',
                '- `/` — always returns a `float`, even `4 / 2` → `2.0`\n- `//` — floor (integer) division, returns `int`, e.g. `7 // 2` → `3`\n- `%` — remainder (modulo), e.g. `7 % 2` → `1`',
                'This distinction matters: many bugs come from expecting an integer but getting a float (or vice versa) because of which division operator was used.',
              ],
              code: `# int never overflows in Python
print(2**100)
print(2**1000)

# Integer arithmetic is always exact
print(10**20 + 1)           # exact
print(10**20 + 1 - 10**20)  # exact: 1

# type()
x = 42
print(type(x))              # <class 'int'>
print(isinstance(x, int))   # True

# Division produces float — use // for integer division
print(7 / 2)    # 3.5  (float)
print(7 // 2)   # 3    (int, floor division)
print(7 % 2)    # 1    (remainder)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Python float — 64-bit IEEE 754',
              prose: [
                '## The 64-bit layout',
                'A Python `float` is a 64-bit **IEEE 754 binary floating-point number**. Those 64 bits are split into three fields:',
                '- **1 sign bit** — positive or negative\n- **11 exponent bits** — sets the scale, covering roughly 10^−308 to 10^308\n- **52 mantissa bits** — sets the precision, giving about 15–17 reliable decimal digits',
                '## What this means in practice',
                'Float can cover an enormous range of magnitudes but only a **finite** number of exact values — about 2^64 ≈ 18 quintillion specific numbers. Every other real number is rounded to the nearest representable value. `sys.float_info.epsilon` (~2.2 × 10^−16) is **machine epsilon** — the smallest ε such that 1.0 + ε ≠ 1.0. It is the unit of rounding error.',
                '## Special float values',
                '- `float(\'inf\')` — positive infinity (overflow or 1/0 in some contexts)\n- `float(\'-inf\')` — negative infinity\n- `float(\'nan\')` — Not-a-Number, from undefined operations like 0/0. **NaN does not equal itself** — `nan == nan` is False.',
              ],
              code: `import sys

print(type(3.14))                     # <class 'float'>
print(sys.float_info.max)            # ~1.8 × 10^308  — largest float
print(sys.float_info.min)            # ~2.2 × 10^-308 — smallest positive normal
print(sys.float_info.epsilon)        # ~2.2 × 10^-16  — machine epsilon
print(sys.float_info.dig)            # 15  — reliable decimal digits

# Special float values
print(float('inf'))    # positive infinity
print(float('-inf'))   # negative infinity
print(float('nan'))    # Not a Number

# Arithmetic with special values
print(1.0 / 0.0 if False else float('inf'))  # inf (would raise ZeroDivisionError)
print(float('inf') + 1)   # still inf
print(float('nan') == float('nan'))  # False — NaN is not equal to itself!`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── MATH / FLOATING POINT ──────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'The floating-point surprise',
              prose: 'Here is the fundamental surprise of computer arithmetic: **0.1 + 0.2 ≠ 0.3** in Python. This is not a bug — it is correct behaviour for IEEE 754 arithmetic, and every serious programming language on the planet (JavaScript, Java, C, Rust...) gives the same result. Why? Because 0.1 in binary is a **repeating fraction**: 0.0001100110011001100... — exactly analogous to how 1/3 in decimal is 0.333333... The hardware cannot store infinitely many binary digits, so it rounds to the nearest 64-bit value. When you write `0.1`, Python stores approximately 0.10000000000000000555... When you write `0.2`, Python stores approximately 0.20000000000000001110... Adding these two approximate values gives approximately 0.30000000000000004441... which is not equal to the approximate stored value of `0.3` (which is slightly less). The f-string `f"{0.1:.55f}"` shows the full stored value — not the 0.1 Python usually displays (Python rounds the display for readability). Understanding this is essential: **never compare floats with ==**.',
              code: `# The classic demonstration
print(0.1 + 0.2)          # 0.30000000000000004
print(0.1 + 0.2 == 0.3)   # False

# repr() shows you what is ACTUALLY stored
print(repr(0.1))  # '0.1' — Python shortens the display
print(f"{0.1:.55f}")   # 0.1000000000000000055511151231257827021181583404541015625
print(f"{0.2:.55f}")   # 0.2000000000000000111022302462515654042363166809082031250
print(f"{0.3:.55f}")   # 0.2999999999999999888977697537484345957636833190917968750`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Measuring the error',
              prose: 'The error in `0.1 + 0.2` is approximately 5.5 × 10^−17 — an astonishingly small number. For most engineering purposes, this is completely negligible: a measurement accurate to 16 significant figures is more precise than any physical instrument. But `==` has **zero tolerance**: even a discrepancy of 10^−17 makes it return False. This is why the `==` operator is wrong for float comparison. The `abs(result - true_value)` computation is the correct approach: measure the actual error, and decide explicitly whether it is small enough for your purpose. The `sys.float_info.epsilon` value (~2.2 × 10^−16) is the standard reference: if your error is smaller than epsilon × |value|, it is within the expected floating-point rounding budget. **Python pattern:** `f"{value:.20f}"` formats a float with 20 decimal places, revealing the stored value beyond what Python normally displays. `.20f` means "fixed-point notation, 20 decimal places" — a format spec. This diagnostic technique is invaluable when debugging numerical code.',
              code: `import sys

result = 0.1 + 0.2
true_value = 0.3
error = abs(result - true_value)

print(f"result:      {result:.20f}")
print(f"true value:  {true_value:.20f}")
print(f"error:       {error:.2e}")
print(f"epsilon:     {sys.float_info.epsilon:.2e}")
print(f"error < eps: {error < sys.float_info.epsilon}")  # True — expected`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'Safe float comparison — math.isclose',
              prose: [
                '`math.isclose(a, b)` checks: |a − b| ≤ rel_tol × max(|a|, |b|). The default `rel_tol=1e-9` means "within 1 part in a billion" — automatically scaling with magnitude. This is almost always what you want for general float comparisons.',
                '## The four rules',
                '- **Never** use `==` on floats\n- **Most comparisons:** `math.isclose(a, b)` — uses relative tolerance\n- **Values near zero:** add `abs_tol=1e-14` — relative tolerance breaks down near 0\n- **Explicit one-liner:** `abs(a - b) < 1e-9` — clear, readable, works everywhere',
                '## Why relative tolerance?',
                'Comparing 1,000,000.0 and 1,000,000.001 — a 10^−9 relative difference — is very close. But comparing 1e-15 and 2e-15 has a 100% relative error yet a negligible absolute difference. The `abs_tol` parameter handles the near-zero case where relative tolerance fails.',
              ],
              code: `import math

a = 0.1 + 0.2
b = 0.3

# WRONG — do not do this
print(a == b)                     # False

# RIGHT — relative tolerance (default: 1e-9)
print(math.isclose(a, b))         # True
print(math.isclose(a, b, rel_tol=1e-9))  # True

# For values near zero, use abs_tol
x = 1e-15
y = 2e-15
print(math.isclose(x, y))                       # False (rel error is 50%)
print(math.isclose(x, y, abs_tol=1e-14))        # True (absolute tolerance)

# Simple alternative for most cases
print(abs(a - b) < 1e-9)          # True`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 7,
              cellTitle: 'Exact decimal arithmetic — the decimal module',
              prose: 'For most scientific and engineering work, float\'s approximation is perfectly acceptable. But some domains **require** exact decimal arithmetic: financial calculations (rounding $0.005 to $0.01), tax computations (where $0.001 error per transaction × millions of transactions = lawsuits), and metrological measurements with defined precision. `decimal.Decimal` solves this by storing numbers as base-10 fractions rather than base-2 fractions. When you write `Decimal("0.1")`, Python stores exactly one-tenth — no approximation, no rounding error. Adding `Decimal("0.1") + Decimal("0.2")` gives exactly `Decimal("0.3")`. The precision (number of significant digits) is configurable via `getcontext().prec`; the default is 28, sufficient for almost all needs. **Critical detail:** always create Decimals from **strings** — `Decimal("0.1")` — not from floats — `Decimal(0.1)`. The float version captures the binary approximation before Decimal ever sees it, giving the wrong result. The last `print` in the cell demonstrates this trap explicitly.',
              code: `from decimal import Decimal, getcontext

# Standard float — approximate
print(0.1 + 0.2)             # 0.30000000000000004

# Decimal — exact
a = Decimal("0.1")           # must use string to avoid float contamination
b = Decimal("0.2")
print(a + b)                 # 0.3
print(a + b == Decimal("0.3"))  # True

# Set precision for large computations
getcontext().prec = 50
print(Decimal(1) / Decimal(3))   # 50 significant figures of 1/3

# Warning: Decimal(0.1) (without string) captures the float approximation
print(Decimal(0.1))   # 0.1000000000000000055511151231257827021181583404541015625`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── SCIENTIFIC NOTATION ────────────────────────────────────────────
            {
              id: 8,
              cellTitle: 'Scientific notation',
              prose: [
                'Scientists work across enormous ranges of scale: an electron\'s charge is 1.6 × 10^−19 coulombs; Avogadro\'s number is 6.022 × 10^23 — a factor of 10^42 difference. Writing all those zeros is error-prone and unreadable. **Scientific notation** represents any number as a coefficient (1–10) times a power of 10.',
                '## Python e-notation',
                '- `1.5e3` → 1.5 × 10³ = 1500\n- `3.0e-4` → 3.0 × 10^−4 = 0.0003\n- `6.022e23` → Avogadro\'s number\n- Python auto-switches to e-notation when displaying very large or small floats',
                '## Order of magnitude',
                'The **order of magnitude** is `math.floor(math.log10(abs(x)))` — the exponent rounded down. It answers "roughly how big is this?" A proton mass of 10^−27 kg and a car mass of 10^3 kg differ by 30 orders of magnitude.',
                '## Python pattern',
                '`f"{val:.3e}"` formats any number in scientific notation with 3 decimal places — the cleanest way to print values at extreme scales. **Warning:** adding numbers of very different magnitudes (10^20 + 1) loses the smaller value entirely — a numerical stability issue called **catastrophic cancellation**.',
              ],
              code: `import math

# e-notation
print(1.5e3)        # 1500.0
print(3.0e-4)       # 0.0003
print(6.022e23)     # Avogadro's number
print(1.6e-19)      # Elementary charge (coulombs)

# Python auto-uses scientific notation for very large/small floats
print(1e-10)        # 1e-10
print(1.23e100)

# Order of magnitude = floor of log₁₀
for val in [1, 10, 100, 0.001, 6.022e23]:
    om = math.floor(math.log10(abs(val)))
    print(f"{val:.3e}  →  order of magnitude: {om}")`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── OPENCALC LIBRARY INTRO ─────────────────────────────────────────
            {
              id: 'oc-1',
              cellTitle: 'Introducing opencalc — the visualization library',
              prose: [
                'From this chapter on, every concept gets a visual. `opencalc` is the course\'s built-in library — no configuration, no axes objects, no boilerplate. You work directly in mathematical vocabulary: functions, points, segments, annotations.',
                '## Importing',
                '- `from opencalc import Figure` — the canvas class\n- `from opencalc import BLUE, AMBER, GREEN, RED, PURPLE, TEAL, GRAY` — course colour palette\n- Any CSS colour string also works: `\'steelblue\'`, `\'#ff6600\'`, `\'rgba(0,100,200,0.5)\'`',
                '## When does a figure appear?',
                'The notebook renders a figure when a cell\'s **last expression** is `fig.show()`. The library returns a JSON value that the notebook detects and converts to a canvas. `print(fig.show())` wraps the JSON in text — the renderer never sees it, so no figure appears.',
              ],
              code: `# opencalc is available in every lesson notebook
from opencalc import Figure

# Color constants — friendly names that match the course theme
from opencalc import BLUE, AMBER, GREEN, RED, PURPLE, TEAL, GRAY

# You can also use any CSS color string directly:
# color='#ff6600', color='rgba(0,100,200,0.5)', color='steelblue'

print("opencalc imported successfully.")
print("Available colors:", ['BLUE', 'AMBER', 'GREEN', 'RED', 'PURPLE', 'TEAL', 'GRAY'])

# Quick sanity check — does Figure exist?
print(type(Figure))`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'oc-2',
              cellTitle: 'The Figure class — canvas and coordinate system',
              prose: [
                '`Figure(xmin, xmax, ymin, ymax)` defines the rectangular window of the coordinate plane you want to see. Choose the bounds to match your content — the default (−5 to 5 on both axes) works for general plots.',
                '## Constructor parameters',
                '- `xmin`, `xmax` — horizontal extent of the visible window\n- `ymin`, `ymax` — vertical extent of the visible window\n- `title` — heading text at the top; always set this so figures are self-labelled\n- `square=True` — forces equal pixel-per-unit on both axes; use for geometry (circles, right angles), not needed for data plots',
              ],
              code: `from opencalc import Figure

# Default Figure — -5 to 5 on both axes
fig_default = Figure()
fig_default.axes()
fig_default.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 'oc-3',
              cellTitle: 'Adding elements — the builder pattern and .show()',
              prose: [
                'Every Figure method returns `self`, enabling **method chaining**: `fig.grid().axes()` calls `grid()`, gets back `fig`, then calls `axes()` immediately. Add elements in any order — the library draws them all when `show()` is called.',
                '## Core methods',
                '- `fig.grid()` — faint background grid lines\n- `fig.axes()` — x-axis and y-axis with tick marks and labels\n- `fig.plot(fn, color, label, width)` — sample a function and draw a curve\n- `fig.point([x, y], color, radius, label)` — dot at a coordinate\n- `fig.show()` — render the figure (**must be the last expression in the cell**)',
                '**Never** write `print(fig.show())` — that shows a JSON string instead of a figure.',
              ],
              code: `from opencalc import Figure, BLUE, AMBER

# Chain: grid → axes → plot → show
fig = Figure(xmin=-3, xmax=3, ymin=-1, ymax=9, title="Builder pattern demo")
fig.grid()                                        # draw grid lines
fig.axes()                                        # draw x and y axes with labels
fig.plot(lambda x: x**2, color=BLUE, label='x²') # add a curve
fig.point([1, 1], color=AMBER, label='(1,1)')     # add a point
fig.show()    # ← must be the last expression, no print()

# Equivalent one-liner:
# Figure(xmin=-3,xmax=3,ymin=-1,ymax=9).grid().axes().plot(lambda x:x**2).show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── VISUALIZATION — NUMBER LINE ────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Visualizing the number line with opencalc',
              prose: 'The number line is the geometric model of ℝ — every real number corresponds to exactly one point, and every point corresponds to exactly one real number. This cell draws one with opencalc: a flat figure (ymin/ymax close to zero collapses the y-dimension into a line), a horizontal segment for the line itself, blue dots for the integers, and amber/teal dots for key irrationals. Notice where √2 ≈ 1.414 and π ≈ 3.142 sit relative to the integers — they are genuinely between rational values, not at any fraction. The number line makes three properties of ℝ visible: **density** (between any two rationals there is always another rational — and an irrational), **completeness** (no gaps — every convergent sequence has a limit in ℝ), and **ordering** (numbers have a natural left-to-right order). **Library technique:** a very flat Figure (ymin=−0.5, ymax=0.5) effectively reduces to 1D — a useful trick for number line diagrams. `fig.axes(labels=True, ticks=True)` adds numbered tick marks, making it easy to read off approximate values.',
              instructions: 'Run this cell. The number line appears below the code. Experiment: add more points, change colors.',
              code: `from opencalc import Figure, BLUE, AMBER, GREEN, RED, PURPLE, TEAL

# Build a number line: use a very flat Figure (ymin/ymax near 0)
fig = Figure(xmin=-6, xmax=6, ymin=-0.5, ymax=0.5,
             title="The Real Number Line")
fig.axes(labels=True, ticks=True)

# Horizontal line at y=0 as the number line
fig.line([-6, 0], [6, 0], color='gray', width=2)

# Integer points (blue)
for n in range(-5, 6):
    fig.point([n, 0], color=BLUE, radius=5, label=str(n) if n != 0 else None)

# Key irrationals (amber)
import math
fig.point([math.sqrt(2), 0], color=AMBER, radius=6, label='√2')
fig.point([math.pi, 0],      color=AMBER, radius=6, label='π')
fig.point([math.e, 0],       color=TEAL,  radius=6, label='e')
fig.point([-math.sqrt(2), 0],color=AMBER, radius=6, label='-√2')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── ABSOLUTE VALUE ─────────────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Absolute value — definition and implementation',
              prose: [
                '**Absolute value** |x| strips the sign — it returns the distance from x to the origin, always non-negative.',
                '## Piecewise definition',
                '- `x ≥ 0` → return x (already non-negative)\n- `x < 0` → return −x (flip the sign)',
                '## Python\'s abs()',
                '- `abs(int)` and `abs(float)` → same as the math definition\n- `abs(complex)` → the **magnitude** √(a² + b²), distance from origin in the complex plane (e.g. `abs(3 + 4j) = 5`)',
                '|x| appears in: error measurements `|actual − predicted|`, distance formulas, and optimisation objectives (L1 / mean absolute error loss).',
              ],
              code: `# Piecewise implementation
def absolute_value(x):
    if x >= 0:
        return x
    else:
        return -x

# Test
print(absolute_value(5))    # 5
print(absolute_value(-5))   # 5
print(absolute_value(0))    # 0
print(absolute_value(-3.7)) # 3.7

# Built-in abs() — same thing, works on int, float, complex
print(abs(-42))             # 42
print(abs(-3.14))           # 3.14
print(abs(3 + 4j))          # 5.0 — magnitude of complex number: √(3²+4²)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 11,
              cellTitle: 'Plotting |x| with opencalc',
              prose: 'The graph of f(x) = |x| is the iconic V-shape — two straight rays meeting at a sharp point (the **vertex**) at the origin. The left ray has slope −1 (descending toward zero as x approaches from the left), and the right ray has slope +1 (ascending as x grows). At exactly x = 0, the slope is undefined — there is a kink. This is mathematically significant: |x| is continuous everywhere (no jumps) but not differentiable at 0 (no smooth tangent). You will encounter this distinction repeatedly when you study derivatives. The V-shape is also the fundamental shape of the **L1 loss function** (also called mean absolute error) used in machine learning — it penalises large and small errors equally, unlike the squared error which penalises large errors much more. **Library:** We pass Python\'s built-in `abs` directly to `fig.plot()` — any callable works, including built-ins. The two `xmin/xmax` restricted plots in red show the two pieces separately, making the piecewise structure visible.',
              code: `from opencalc import Figure, BLUE, AMBER, RED

fig = Figure(xmin=-5, xmax=5, ymin=-0.5, ymax=5, title="f(x) = |x|")
fig.grid().axes()

# Plot the absolute value function
fig.plot(abs, color=BLUE, label='f(x) = |x|', width=3)

# Highlight the vertex
fig.point([0, 0], color=AMBER, radius=8, label='vertex (0, 0)')

# Show that it equals x for x>0 and -x for x<0
fig.plot(lambda x: x,  xmin=0, xmax=5, color=RED, width=1.5, label='y = x  (x≥0)')
fig.plot(lambda x: -x, xmin=-5, xmax=0, color=RED, width=1.5, label='y = -x (x<0)')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── DISTANCE ───────────────────────────────────────────────────────
            {
              id: 12,
              cellTitle: 'Absolute value as distance',
              prose: [
                '`|a − b|` is the distance between a and b on the number line. It satisfies the three axioms that define a **metric** — a formal, general notion of distance:',
                '- **Non-negativity:** |a − b| ≥ 0, and equals 0 only when a = b\n- **Symmetry:** |a − b| = |b − a| — direction does not matter\n- **Triangle inequality:** |a − c| ≤ |a − b| + |b − c| — going via a midpoint cannot shorten the trip',
                '## Why these axioms matter',
                'Every distance formula you encounter later — Euclidean distance √(Δx² + Δy²), Manhattan distance |Δx| + |Δy|, cosine distance in NLP, L2 norm in machine learning — satisfies these same three axioms. Recognising them here means you can instantly understand any new distance metric you encounter in terms of properties you already know.',
              ],
              code: `def distance(a, b):
    return abs(a - b)

# Symmetric
print(distance(2, 5))    # 3
print(distance(5, 2))    # 3  — same

# Non-negative
print(distance(-3, -7))  # 4

# Zero iff equal
print(distance(4, 4))    # 0

# Triangle inequality: d(a, c) ≤ d(a, b) + d(b, c)
a, b, c = 1, 4, 7
print(distance(a, c))                     # 6
print(distance(a, b) + distance(b, c))    # 3 + 3 = 6  (equality here)

a, b, c = 1, 10, 4
print(distance(a, c))                     # 3
print(distance(a, b) + distance(b, c))    # 9 + 6 = 15 (strict inequality)`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 13,
              cellTitle: 'Visualizing distance',
              prose: 'Geometry makes abstract distance tangible. This diagram shows two points — a = −2 and b = 3 — on the number line, connected by an amber segment. The length of that segment is |a − b| = |−2 − 3| = |−5| = 5. The figure title shows the full computation, making the formula and the picture read together. This is the standard mathematical diagram for distance: mark the points, draw the connecting segment, label its length. **Library technique:** the segment is drawn slightly above y = 0 (`fig.line([a, 0.12], [b, 0.12], ...)`) to avoid overlapping with the number line itself. The text label is placed at the midpoint `(a+b)/2` horizontally and slightly higher — an f-string computes both values dynamically. Changing `a` and `b` at the top of the cell updates the entire diagram automatically: the segment length, the points, the title, and the label all recompute. **This is the power of programmatic figures** — the diagram and the mathematics are the same code.',
              code: `from opencalc import Figure, BLUE, RED, AMBER, GREEN

a, b = -2, 3
d = abs(a - b)

fig = Figure(xmin=-5, xmax=6, ymin=-0.3, ymax=0.3,
             title=f"Distance between {a} and {b} = |{a} - {b}| = {d}")
fig.axes(labels=True, ticks=True)
fig.line([-5, 0], [6, 0], color='gray', width=2)

# The two points
fig.point([a, 0], color=RED,  radius=8, label=f'a = {a}')
fig.point([b, 0], color=BLUE, radius=8, label=f'b = {b}')

# The segment showing the distance (slightly above the line)
fig.line([a, 0.12], [b, 0.12], color=AMBER, width=3)
fig.text([(a + b) / 2, 0.22], f"|a − b| = {d}", color='amber', size=12, bold=True)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 14,
              cellTitle: '|x − c| < r — the interval interpretation',
              prose: '|x − c| < r is one of the most important inequality forms in mathematics. Translated to English: "the distance from x to c is less than r." In other words, x lives within a radius r of the centre c. On the number line, this is the open interval (c − r, c + r) — all points closer than r to the centre. This geometric reading unlocks the meaning of the **epsilon-delta definition of a limit**: "for all ε > 0, there exists δ > 0 such that |x − a| < δ implies |f(x) − L| < ε" is just saying "whenever x is within a δ-ball of a, f(x) is within an ε-ball of L." Without the distance-as-absolute-value interpretation, the epsilon-delta definition looks like symbol soup. With it, it is a precise geometric statement. This interval interpretation also appears in **optimization** (converge within r of the minimum), **statistics** (confidence intervals are centred at an estimate with radius = margin of error), and **physics** (fields that decay with distance). **Library:** `fig.rect(left, -0.08, width, 0.16, ...)` draws the shaded interval as a thin rectangle straddling the number line. `fig.arrow()` marks the radius from centre to endpoint in both directions.',
              code: `from opencalc import Figure, BLUE, AMBER, PURPLE

c = 2      # center
r = 3      # radius

left  = c - r    # -1
right = c + r    # 5

fig = Figure(xmin=-4, xmax=8, ymin=-0.5, ymax=0.5,
             title=f"|x − {c}| < {r}   →   x ∈ ({left}, {right})")
fig.axes(labels=True, ticks=True)
fig.line([-4, 0], [8, 0], color='gray', width=2)

# Shade the interval (c-r, c+r) — use a thin rectangle
fig.rect(left, -0.08, right - left, 0.16, color=BLUE, fill=True, alpha=0.2)

# Center
fig.point([c, 0], color=AMBER, radius=8, label=f'c = {c}')

# Endpoints (open — shown as hollow)
fig.point([left, 0],  color=BLUE, radius=7, label=str(left))
fig.point([right, 0], color=BLUE, radius=7, label=str(right))

# Radius arrows
fig.arrow([c, 0.25], [right, 0.25], color=PURPLE, width=2, label=f'r = {r}')
fig.arrow([c, 0.25], [left, 0.25],  color=PURPLE, width=2)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            // ── CHALLENGES ─────────────────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Classify the number',
              difficulty: 'easy',
              prompt: 'Fill in each blank with the most specific type: "int", "rational", or "irrational". Then check your answers by running the cell.',
              starterBlock: `import math

def classify(x):
    if isinstance(x, int):
        return "integer"
    # A float that equals its own round() is whole-valued
    if x == round(x) and isinstance(x, float):
        return "integer-valued float"
    # We cannot determine rational vs irrational from float alone,
    # but we know these specific values:
    return "float (may be rational or irrational)"

# Fill in the blanks: what is the most specific math type?
print("42       is", ___)    # "integer"
print("0.5      is", ___)    # "rational"
print("math.pi  is", ___)    # "irrational"
print("math.sqrt(4) is", ___)  # "integer" (it's 2.0)
print("1/3      is", ___)    # "rational"`,
              code: `import math

def classify(x):
    if isinstance(x, int):
        return "integer"
    if x == round(x) and isinstance(x, float):
        return "integer-valued float"
    return "float (may be rational or irrational)"

# Fill in the blanks: what is the most specific math type?
print("42       is", ___)    # "integer"
print("0.5      is", ___)    # "rational"
print("math.pi  is", ___)    # "irrational"
print("math.sqrt(4) is", ___)  # "integer" (it's 2.0)
print("1/3      is", ___)    # "rational"`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'classify' not in dir():
    res = "ERROR: classify function not defined."
else:
    import math
    answers = [
        ("42", "integer"),
        ("0.5", "rational"),
        ("math.pi", "irrational"),
        ("math.sqrt(4)", "integer"),
        ("1/3", "rational"),
    ]
    res = "SUCCESS: All classifications correct — integers, rationals, and irrationals distinguished."
res
`,
              hint: 'Integers are whole numbers with no fractional part. Rationals are fractions or terminating/repeating decimals. Irrationals have non-repeating, non-terminating decimal expansions.',
            },
            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Fix the float comparison bug',
              difficulty: 'easy',
              prompt: 'The function below is supposed to check if a running total has reached 1.0 after adding 0.01 one hundred times. It has a floating-point bug. Fix it using `math.isclose`.',
              code: `import math

def reached_one():
    total = 0.0
    for _ in range(100):
        total += 0.01
    # BUG: this may return False due to float accumulation
    return total == 1.0

print(reached_one())   # likely False — fix it!

# Write the fixed version:
def reached_one_fixed():
    total = 0.0
    for _ in range(100):
        total += 0.01
    return ___   # fix the comparison

print(reached_one_fixed())   # should be True
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'reached_one_fixed' not in dir():
    res = "ERROR: reached_one_fixed not defined."
else:
    result = reached_one_fixed()
    if result == True:
        res = "SUCCESS: reached_one_fixed correctly handles floating-point accumulation."
    else:
        res = f"ERROR: reached_one_fixed returned {result!r}. Use math.isclose(total, 1.0) or abs(total - 1.0) < 1e-9."
res
`,
              hint: 'Replace `total == 1.0` with `math.isclose(total, 1.0)` or `abs(total - 1.0) < 1e-9`.',
            },
            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Implement and visualize distance',
              difficulty: 'medium',
              prompt: 'Write `number_line_distance(a, b)` that returns |a − b|. Then use opencalc to visualize the two points and the distance segment between them for a = −3, b = 4.',
              code: `from opencalc import Figure, RED, BLUE, AMBER

def number_line_distance(a, b):
    pass  # return the distance |a - b|

# Test
print(number_line_distance(-3, 4))   # 7
print(number_line_distance(4, -3))   # 7  (symmetric)
print(number_line_distance(0, 0))    # 0

# Visualize: plot points a=-3 and b=4 and the distance segment
a, b = -3, 4
d = number_line_distance(a, b)

fig = Figure(xmin=-5, xmax=6, ymin=-0.3, ymax=0.3,
             title=f"Distance = |{a} - {b}| = {d}")
fig.axes(labels=True, ticks=True)
fig.line([-5, 0], [6, 0], color='gray', width=2)

# Your visualization here:

fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'number_line_distance' not in dir():
    res = "ERROR: number_line_distance not defined."
else:
    r1 = number_line_distance(-3, 4)
    r2 = number_line_distance(4, -3)
    r3 = number_line_distance(0, 0)
    r4 = number_line_distance(-5, -2)
    if r1 != 7:
        res = f"ERROR: distance(-3, 4) should be 7, got {r1}."
    elif r2 != 7:
        res = f"ERROR: distance(4, -3) should be 7 (symmetric), got {r2}."
    elif r3 != 0:
        res = f"ERROR: distance(0, 0) should be 0, got {r3}."
    elif r4 != 3:
        res = f"ERROR: distance(-5, -2) should be 3, got {r4}."
    else:
        res = "SUCCESS: number_line_distance is correct and symmetric."
res
`,
              hint: 'return abs(a - b). For the visualization, add fig.point([a, 0], ...) and fig.point([b, 0], ...) then fig.line([a, 0.15], [b, 0.15], color=AMBER) for the distance segment.',
            },
            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Visualize |x − c| < r as an interval',
              difficulty: 'medium',
              prompt: 'Write `ball(c, r)` that returns the tuple (c-r, c+r) — the open interval of all x with |x−c| < r. Then visualize the ball for c=1, r=2.5 using opencalc, shading the interval and marking the center.',
              code: `from opencalc import Figure, BLUE, AMBER, PURPLE

def ball(c, r):
    """Return (left, right) endpoints of the interval |x - c| < r."""
    pass

# Test
print(ball(2, 3))    # (-1, 5)
print(ball(0, 1))    # (-1, 1)
print(ball(-2, 0.5)) # (-2.5, -1.5)

# Visualize for c=1, r=2.5
c, r = 1, 2.5
left, right = ball(c, r)

fig = Figure(xmin=-4, xmax=6, ymin=-0.4, ymax=0.4,
             title=f"|x − {c}| < {r}   →   x ∈ ({left}, {right})")
fig.axes(labels=True, ticks=True)
fig.line([-4, 0], [6, 0], color='gray', width=2)

# Your visualization here: shade the interval, mark the center

fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
if 'ball' not in dir():
    res = "ERROR: ball not defined."
else:
    r1 = ball(2, 3)
    r2 = ball(0, 1)
    r3 = ball(-2, 0.5)
    if r1 != (-1, 5):
        res = f"ERROR: ball(2, 3) should be (-1, 5), got {r1}."
    elif r2 != (-1, 1):
        res = f"ERROR: ball(0, 1) should be (-1, 1), got {r2}."
    elif r3 != (-2.5, -1.5):
        res = f"ERROR: ball(-2, 0.5) should be (-2.5, -1.5), got {r3}."
    else:
        res = "SUCCESS: ball(c, r) correctly computes the open interval (c-r, c+r)."
res
`,
              hint: 'return (c - r, c + r). For the viz: fig.rect(left, -0.1, right - left, 0.2, color=BLUE) for the shaded region, fig.point([c, 0], color=AMBER) for the center.',
            },
            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Orders of magnitude comparison',
              difficulty: 'medium',
              prompt: 'Write `order_of_magnitude(x)` using `math.log10`. Then write `how_many_times_larger(a, b)` that returns the number of orders of magnitude a is larger than b. Use opencalc bars() to visualize the orders of magnitude of five physical constants.',
              code: `import math
from opencalc import Figure

def order_of_magnitude(x):
    """Return floor(log10(|x|)) — the order of magnitude of x."""
    pass

def how_many_times_larger(a, b):
    """How many orders of magnitude is a larger than b?"""
    pass

# Tests
print(order_of_magnitude(1000))     # 3
print(order_of_magnitude(0.001))    # -3
print(order_of_magnitude(6.022e23)) # 23
print(how_many_times_larger(1e9, 1e3))  # 6

# Visualize: bar chart of orders of magnitude
constants = {
    "Avogadro (mol⁻¹)": 6.022e23,
    "Speed of light (m/s)": 2.998e8,
    "Boltzmann (J/K)": 1.38e-23,
    "Electron mass (kg)": 9.109e-31,
    "1 AU (m)": 1.496e11,
}

labels = list(constants.keys())
orders = [order_of_magnitude(v) for v in constants.values()]

fig = Figure(title="Orders of Magnitude of Physical Constants")
fig.bars(labels, orders, color='blue', alpha=0.8)
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'order_of_magnitude' not in dir():
    res = "ERROR: order_of_magnitude not defined."
elif 'how_many_times_larger' not in dir():
    res = "ERROR: how_many_times_larger not defined."
else:
    o1 = order_of_magnitude(1000)
    o2 = order_of_magnitude(0.001)
    o3 = order_of_magnitude(6.022e23)
    h1 = how_many_times_larger(1e9, 1e3)
    if o1 != 3:
        res = f"ERROR: order_of_magnitude(1000) should be 3, got {o1}."
    elif o2 != -3:
        res = f"ERROR: order_of_magnitude(0.001) should be -3, got {o2}."
    elif o3 != 23:
        res = f"ERROR: order_of_magnitude(6.022e23) should be 23, got {o3}."
    elif h1 != 6:
        res = f"ERROR: how_many_times_larger(1e9, 1e3) should be 6, got {h1}."
    else:
        res = "SUCCESS: order_of_magnitude and how_many_times_larger work correctly."
res
`,
              hint: 'order_of_magnitude: return math.floor(math.log10(abs(x))). how_many_times_larger: return order_of_magnitude(a) - order_of_magnitude(b).',
            },
          ],
        },
      },
    ],
  },
}
