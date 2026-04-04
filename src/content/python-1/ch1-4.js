// Chapter 1.4 — Exponentials & Logarithms
//
// PHASE 1 — MATHEMATICAL FOUNDATIONS (COMPUTATIONAL FIRST)
//
// TEACHES:
//   1.  What makes a relationship exponential — constant ratio, not constant difference
//   2.  The natural base e — where it comes from (compound interest limit)
//   3.  Exponential growth — y = a·eˣ, population and finance models
//   4.  Exponential decay — y = a·e^(−kt), half-life
//   5.  opencalc: fig.bars() — discrete comparisons
//   6.  Exponential vs polynomial growth — visual and numerical comparison
//   7.  Logarithms — the inverse of exponentiation
//   8.  Properties of logarithms — product, quotient, power rules
//   9.  ln vs log10 vs log2 — which base to use and why
//  10.  Solving exponential equations with logarithms
//  11.  Half-life and doubling time — derived formulas
//  12.  Log linearization — turning y = ae^(kx) into a straight line
//  13.  Fitting exponential data — scatter + linearized least squares
//  14.  Semi-log plot — exponential looks linear on a log-scale axis

export default {
  id: 'py-1-4-exponentials-logarithms',
  slug: 'exponentials-and-logarithms',
  chapter: 1.4,
  order: 3,
  title: 'Exponentials & Logarithms',
  subtitle: 'The functions of growth, decay, and the scales that make them visible',
  tags: ['exponential', 'logarithm', 'base e', 'growth', 'decay', 'half-life', 'ln', 'log', 'linearization', 'opencalc'],

  hook: {
    question: 'A population that doubles every 10 years will surpass a linear model by a factor of a thousand within a century — how do you detect, model, and predict exponential behaviour from raw data?',
    realWorldContext:
      'Exponential functions describe the most important dynamics in nature and technology: ' +
      'bacterial growth, radioactive decay, compound interest, viral spread, Moore\'s law, ' +
      'and the activation functions inside every neural network. ' +
      'Logarithms are the inverse — they compress exponential scale into something linear and readable. ' +
      'pH, decibels, the Richter scale, and bit-depth are all logarithmic. ' +
      'This lesson teaches you to recognise exponential behaviour in data, ' +
      'model it with code, and use logarithms to solve for unknowns analytically.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A linear relationship adds a constant amount per step. ' +
      'An exponential relationship **multiplies** by a constant factor per step. ' +
      'That single distinction — add vs multiply — produces completely different long-term behaviour.',
      'The key number is **e ≈ 2.71828** — the base of the natural exponential. ' +
      'It emerges from continuous compounding: if you compound 100% annual interest ' +
      'infinitely often, after one year you have exactly e times your starting amount. ' +
      'The logarithm is the inverse: log_b(x) asks "what power of b gives x?"',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Exponential function',
        body: 'f(x) = a \\cdot e^{kx} \\quad \\text{where } a \\text{ is the initial value, } k \\text{ is the growth rate}',
      },
      {
        type: 'insight',
        title: 'Constant ratio = exponential',
        body: 'Compute consecutive ratios y_{n+1}/y_n. If they are all the same constant, the relationship is exponential — regardless of what the x-axis represents.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Exponentials & Logarithms',
        mathBridge: 'f(x) = a·eᵏˣ. log undoes exp: ln(eˣ) = x. Every cell builds toward fitting an exponential curve to real data.',
        caption: 'Work through every cell. The semi-log plot at the end will make exponential data look like a straight line.',
        props: {
          initialCells: [

            // ── CONCEPT ───────────────────────────────────────────────────────
            {
              id: 1,
              cellTitle: 'What makes a relationship exponential',
              prose: [
                'The difference between linear and exponential growth is **add vs multiply**. A linear sequence adds the same constant each step (Δy is constant). An exponential sequence multiplies by the same constant each step (y_{n+1}/y_n is constant). The ratio test is the fastest way to identify exponential behaviour in a dataset.',
                '## Ratio test',
                '- Compute consecutive ratios: r = y[i] / y[i−1]\n- If all ratios are the same constant → **exponential**\n- If all differences are the same constant → **linear**\n- If neither → something else (quadratic, log, etc.)',
                '## Why the ratio matters',
                'A ratio of 2 means "doubles each step." A ratio of 0.5 means "halves each step" (decay). The ratio completely determines the long-term behaviour — a ratio just slightly above 1 still produces runaway growth given enough steps.',
              ],
              code: `# Is this relationship linear or exponential?
linear_y     = [2, 4, 6, 8, 10, 12]     # adds 2 each step
exponential_y = [2, 4, 8, 16, 32, 64]   # multiplies by 2 each step

print("Linear — differences (should be constant):")
diffs = [exponential_y[i] - exponential_y[i-1] for i in range(1, 6)]
print(diffs)   # [2, 4, 8, 16, 32] — NOT constant

print("\\nExponential — ratios (should be constant):")
ratios = [exponential_y[i] / exponential_y[i-1] for i in range(1, 6)]
print(ratios)  # [2.0, 2.0, 2.0, 2.0, 2.0] — constant!

# Real-world test: is this data exponential?
mystery_y = [3, 6.3, 13.23, 27.78, 58.34]
ratios = [mystery_y[i] / mystery_y[i-1] for i in range(1, len(mystery_y))]
print("\\nMystery data ratios:", [round(r, 3) for r in ratios])
# Approximately 2.1 each time → exponential with base ≈ 2.1`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 2,
              cellTitle: 'The natural base e — where it comes from',
              prose: [
                'The number **e ≈ 2.71828** is not arbitrary — it emerges naturally from continuous compounding. If you invest $1 at 100% annual interest compounded n times per year, after one year you have (1 + 1/n)ⁿ dollars. As n → ∞ (continuous compounding), this limit is exactly e.',
                '## How e appears',
                '- **Continuous compounding:** A(t) = P·eʳᵗ where r is the annual rate\n- **Population growth:** N(t) = N₀·eᵏᵗ where k is the per-capita growth rate\n- **Natural decay:** N(t) = N₀·e^(−kt) where k > 0\n- **Calculus:** d/dx[eˣ] = eˣ — the only function that is its own derivative',
                'That last property — being its own derivative — is why e appears everywhere in differential equations and therefore in every physical law involving rates of change.',
              ],
              code: `import math

# The limit definition: e = lim_{n→∞} (1 + 1/n)^n
print("Approaching e through compound interest:")
for n in [1, 10, 100, 1_000, 1_000_000]:
    approx = (1 + 1/n) ** n
    print(f"  n={n:>10,}   (1+1/n)^n = {approx:.8f}")

print(f"\\nmath.e           = {math.e:.10f}")
print(f"math.exp(1)      = {math.exp(1):.10f}")  # same thing

# e is its own derivative: d/dx e^x = e^x
# Verify numerically: slope at x=1 should equal e^1
x = 1.0
h = 1e-8
numerical_deriv = (math.exp(x + h) - math.exp(x)) / h
print(f"\\ne^1              = {math.exp(1):.8f}")
print(f"d/dx e^x at x=1  = {numerical_deriv:.8f}")
print(f"Match: {math.isclose(math.exp(1), numerical_deriv, rel_tol=1e-6)}")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 3,
              cellTitle: 'Exponential growth — y = a·eᵏˣ',
              prose: [
                'The **general exponential growth model** is y = a·eᵏˣ. Here a is the **initial value** (y when x = 0) and k > 0 is the **growth rate** — the fraction by which the quantity grows per unit of x. Larger k means faster growth. If x is time in years and k = 0.07, the quantity grows at 7% per year — the classic rule of 72 says it doubles every 72/7 ≈ 10 years.',
                '## Parameters',
                '- **a** — initial value at x = 0: `f(0) = a·e⁰ = a`\n- **k > 0** — growth rate: larger k → steeper curve, faster growth\n- **k < 0** — decay rate: the curve falls toward zero instead\n- **a < 0** — reflection: grows negatively (rare in physical models)',
                '**Python:** `math.exp(k * x)` evaluates eᵏˣ. Wrapping this in a factory function `exp_growth(a, k)` that returns a lambda makes it easy to create and compare multiple exponential models.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE

def exp_growth(a, k):
    """Return f(x) = a * e^(kx)."""
    return lambda x: a * math.exp(k * x)

# Three growth rates — same starting point
slow   = exp_growth(a=100, k=0.05)   # 5% per year
medium = exp_growth(a=100, k=0.10)   # 10% per year
fast   = exp_growth(a=100, k=0.20)   # 20% per year

# Values at t = 0, 5, 10, 20 years
for t in [0, 5, 10, 20]:
    print(f"t={t:2}yr  slow={slow(t):8.1f}  medium={medium(t):8.1f}  fast={fast(t):9.1f}")

fig = Figure(xmin=0, xmax=20, ymin=0, ymax=1400,
             title="Exponential Growth — same start, different rates")
fig.grid().axes()

fig.plot(slow,   color=BLUE,   label='k=0.05 (5%/yr)',  width=2.5)
fig.plot(medium, color=AMBER,  label='k=0.10 (10%/yr)', width=2.5)
fig.plot(fast,   color=RED,    label='k=0.20 (20%/yr)', width=2.5)
fig.point([0, 100], color=GREEN, radius=8, label='start a=100')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 4,
              cellTitle: 'Exponential decay — half-life',
              prose: [
                'Exponential **decay** uses the same formula with k < 0: y = a·e^(−kt) where k > 0 and the negative sign is written explicitly. The quantity shrinks toward zero but never reaches it — an asymptote at y = 0. The **half-life** T½ is the time for the quantity to halve: solve a/2 = a·e^(−k·T½) → T½ = ln(2)/k ≈ 0.693/k.',
                '## Half-life formula',
                '- **T½ = ln(2) / k** — given the decay rate k\n- **k = ln(2) / T½** — given the half-life\n- **y(t) = a · (½)^(t/T½)** — equivalent form using powers of ½',
                '## Common examples',
                '- Carbon-14: T½ = 5,730 years → k ≈ 0.000121 per year\n- Drug clearance: T½ ≈ hours (depends on drug)\n- Capacitor discharge: T½ = RC·ln(2)\n- Noise reduction in averaging: each doubling of samples halves the noise',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, AMBER, GREEN

def exp_decay(a, half_life):
    """Return f(t) = a * e^(-kt) using half-life T½.
    k is derived automatically: k = ln(2) / T½."""
    k = math.log(2) / half_life
    return lambda t: a * math.exp(-k * t), k

# Carbon-14 dating
C14_initial = 1000.0      # arbitrary units
C14_halflife = 5730       # years
C14_decay, k_C14 = exp_decay(C14_initial, C14_halflife)

print(f"Carbon-14:  T½ = {C14_halflife} years,  k = {k_C14:.6f}/year")
for t in [0, 5730, 11460, 17190, 57300]:
    remaining = C14_decay(t)
    print(f"  t={t:6} yr  → {remaining:.1f} units ({remaining/C14_initial*100:.1f}%)")

# Drug clearance (much faster)
drug_initial = 500    # mg
drug_halflife = 4     # hours
drug_decay, k_drug = exp_decay(drug_initial, drug_halflife)

fig = Figure(xmin=0, xmax=24, ymin=0, ymax=550,
             title="Drug Clearance — T½ = 4 hours")
fig.grid().axes()
fig.plot(lambda t: drug_decay(t), color=BLUE, label='drug concentration (mg)', width=3)

# Mark each half-life
for i in range(1, 5):
    t = i * drug_halflife
    y = drug_decay(t)
    fig.point([t, y], color=AMBER, radius=6, label=f'T½×{i}: {y:.0f}mg')

fig.hline(250, color='gray')
fig.text([13, 270], "half of 500 mg", color='gray', size=11)

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── OPENCALC: fig.bars() ──────────────────────────────────────────
            {
              id: 'oc-bars',
              cellTitle: 'opencalc: fig.bars() — comparing discrete values',
              prose: [
                '`fig.bars(labels, values)` draws a bar chart from a list of category labels and a list of numeric values. Use it when you want to compare discrete quantities side by side — not a continuous function.',
                '## Parameters',
                '- `labels` — list of strings, one per bar (x-axis categories)\n- `values` — list of numbers, one per bar (bar heights)\n- `color` — bar fill colour (default blue)\n- `alpha` — transparency 0–1 (default 0.8)',
                '## When to use bars vs plot',
                '- `fig.bars()` → comparing **discrete categories** (years, groups, scenarios)\n- `fig.plot()` → drawing a **continuous function** over an interval\n- `fig.scatter()` → showing **observed data points** without implying continuity',
              ],
              code: `from opencalc import Figure, BLUE, AMBER, GREEN, RED

# Comparing function values at x=10
import math

x = 10
values = {
    'linear x':   x,
    'x²':         x**2,
    'x³':         x**3,
    'eˣ':         math.exp(x),
    '2ˣ':         2**x,
}

# fig.bars(labels, values, color, alpha)
labels = list(values.keys())
heights = [values[k] for k in labels]

fig = Figure(title=f"Function values at x = {x}")
fig.bars(labels, heights, color=BLUE, alpha=0.85)
fig.show()

# Note: eˣ and 2ˣ at x=10 are enormous (22026 and 1024)
# compared to polynomial values (10, 100, 1000)
print("Values at x=10:")
for k, v in values.items():
    print(f"  {k:12s} = {v:,.0f}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── EXPONENTIAL VS POLYNOMIAL ─────────────────────────────────────
            {
              id: 5,
              cellTitle: 'Exponential vs polynomial growth',
              prose: [
                'Given enough x, **every exponential beats every polynomial** — no matter the coefficients. A million times x³ will eventually fall behind eˣ. This is not intuitive, but the ratio eˣ / xⁿ → ∞ as x → ∞ for any fixed n. The crossover point depends on the specific functions, but the long-run winner is always the exponential.',
                '## Why this matters in practice',
                '- **Algorithm complexity:** O(2ⁿ) algorithms become infeasible far sooner than O(n³) ones\n- **Population dynamics:** exponential growth models eventually require limits (resource constraints)\n- **Compound interest:** even modest interest rates dominate simple (linear) interest over decades\n- **Machine learning:** exponential learning rate schedules vs polynomial decay behave very differently over training steps',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, PURPLE, GRAY

fig = Figure(xmin=0, xmax=8, ymin=0, ymax=3000,
             title="Exponential vs Polynomial — exponential always wins eventually")
fig.grid().axes()

fig.plot(lambda x: x,            color=GRAY,   label='x  (linear)',      width=1.5)
fig.plot(lambda x: x**2,         color=BLUE,   label='x²  (quadratic)',  width=2)
fig.plot(lambda x: x**3,         color=PURPLE, label='x³  (cubic)',      width=2)
fig.plot(lambda x: math.exp(x),  color=RED,    label='eˣ  (exponential)', width=3)
fig.plot(lambda x: 2**x,         color=AMBER,  label='2ˣ  (exponential)', width=2)

# Mark the crossover where eˣ overtakes x³
fig.vline(4.5, color='gray')
fig.text([4.6, 2800], "← eˣ pulls ahead", color='red', size=11)

fig.show()

# Numerical comparison at various x
print(f"{'x':>4}  {'x³':>10}  {'eˣ':>12}  {'ratio eˣ/x³':>12}")
for x in [2, 5, 8, 10, 15]:
    poly = x**3
    expo = math.exp(x)
    print(f"{x:>4}  {poly:>10,.0f}  {expo:>12,.0f}  {expo/poly:>12.1f}×")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── LOGARITHMS ────────────────────────────────────────────────────
            {
              id: 6,
              cellTitle: 'Logarithms — the inverse of exponentiation',
              prose: [
                'The **logarithm** base b of x is the power you must raise b to in order to get x: log_b(x) = y means bʸ = x. It is the function that undoes exponentiation, just as division undoes multiplication. If eˣ = 7, then x = ln(7) — the natural log "unpeels" the exponential.',
                '## The three common bases',
                '- **ln(x)** — natural log, base e. Used in calculus, physics, continuous growth models\n- **log₁₀(x)** — common log, base 10. pH, decibels, Richter scale, order of magnitude\n- **log₂(x)** — binary log, base 2. Bits, information theory, binary search, algorithm complexity',
                '## Python',
                '- `math.log(x)` → ln(x) (natural log)\n- `math.log10(x)` → log₁₀(x)\n- `math.log2(x)` → log₂(x)\n- `math.log(x, base)` → log_base(x) for any base',
                'All logarithms are proportional: log_b(x) = ln(x) / ln(b). You can convert between bases by dividing.',
              ],
              code: `import math

# Logarithm as the inverse of exponentiation
x = 7.0
print(f"e^ln(7)    = {math.exp(math.log(x)):.6f}   (should be 7)")
print(f"10^log10(100) = {10 ** math.log10(100):.6f} (should be 100)")
print(f"2^log2(32) = {2 ** math.log2(32):.6f}   (should be 32)")

# Base conversion: log_b(x) = ln(x) / ln(b)
x = 1000
print(f"\\nlog₁₀(1000) = {math.log10(x)}")
print(f"ln(1000)/ln(10) = {math.log(x) / math.log(10):.6f}")   # same

# Reading log values intuitively
print("\\nlog₁₀ gives order of magnitude:")
for val in [1, 10, 100, 1_000, 1_000_000, 1e12]:
    print(f"  log₁₀({val:.0e}) = {math.log10(val):.0f}")

print("\\nlog₂ gives number of bits:")
for val in [1, 2, 4, 8, 256, 65536]:
    print(f"  log₂({val:6}) = {math.log2(val):.0f} bits")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 7,
              cellTitle: 'Properties of logarithms',
              prose: [
                'The three log properties let you simplify complex expressions — they are also the key to linearising exponential data. They follow directly from the exponent rules (aˣ · aʸ = aˣ⁺ʸ, etc.), but applied in reverse.',
                '## The three rules',
                '- **Product rule:** ln(a · b) = ln(a) + ln(b) — log of a product is the sum of logs\n- **Quotient rule:** ln(a / b) = ln(a) − ln(b) — log of a quotient is the difference\n- **Power rule:** ln(aⁿ) = n · ln(a) — log of a power brings the exponent down as a factor',
                '## Why they matter computationally',
                'Very large products overflow float: `1e300 * 1e200` is `inf`. But `math.log(1e300) + math.log(1e200)` = 690.8 + 460.5 = 1151.3 — perfectly computable. The log-sum-exp trick in machine learning uses exactly this to avoid numerical overflow in softmax computations.',
              ],
              code: `import math

a, b, n = 12.0, 5.0, 3.0

# Product rule: ln(ab) = ln(a) + ln(b)
lhs = math.log(a * b)
rhs = math.log(a) + math.log(b)
print(f"ln({a}×{b}) = ln({a}) + ln({b})")
print(f"  {lhs:.6f} = {rhs:.6f}  ✓ match: {math.isclose(lhs, rhs)}")

# Quotient rule: ln(a/b) = ln(a) - ln(b)
lhs = math.log(a / b)
rhs = math.log(a) - math.log(b)
print(f"\\nln({a}/{b}) = ln({a}) - ln({b})")
print(f"  {lhs:.6f} = {rhs:.6f}  ✓ match: {math.isclose(lhs, rhs)}")

# Power rule: ln(aⁿ) = n·ln(a)
lhs = math.log(a ** n)
rhs = n * math.log(a)
print(f"\\nln({a}^{n:.0f}) = {n:.0f}·ln({a})")
print(f"  {lhs:.6f} = {rhs:.6f}  ✓ match: {math.isclose(lhs, rhs)}")

# Practical use: avoiding overflow
import math
huge_product_log = math.log(1e300) + math.log(1e200)   # safe
print(f"\\nlog of 1e300 × 1e200 = {huge_product_log:.2f}  (no overflow)")
print(f"Direct product: {1e300 * 1e200}")                # inf`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 8,
              cellTitle: 'Visualizing logarithms — compressing scale',
              prose: [
                'The graph of ln(x) reveals its key features: it is only defined for x > 0, passes through (1, 0) — because ln(1) = 0 — grows without bound but extremely slowly, and has a vertical asymptote at x = 0. It is the mirror image of eˣ reflected across the line y = x.',
                '## Shape signatures to recognise',
                '- Passes through **(1, 0)** for any base — because b⁰ = 1\n- **Vertical asymptote** at x = 0 — approaches −∞\n- Grows **without limit** but very slowly — ln(1,000,000) ≈ 13.8\n- **Concave down** — rate of growth decreases (diminishing returns)',
                '**Library:** Three log curves on one figure lets you see how the base changes the steepness. ln(x) (base e) grows slowest, log₂(x) (base 2) grows fastest — the larger the base, the flatter the curve.',
              ],
              code: `import math
from opencalc import Figure, BLUE, RED, GREEN, AMBER, GRAY

fig = Figure(xmin=-0.5, xmax=10, ymin=-3, ymax=4,
             title="Logarithm families — inverses of their exponential bases")
fig.grid().axes()

# Three log bases
fig.plot(lambda x: math.log(x)    if x > 0 else None, color=BLUE,  label='ln(x)  base e',    width=2.5)
fig.plot(lambda x: math.log10(x)  if x > 0 else None, color=RED,   label='log₁₀(x) base 10', width=2.5)
fig.plot(lambda x: math.log2(x)   if x > 0 else None, color=GREEN, label='log₂(x) base 2',   width=2.5)

# Show the y=x line and eˣ to illustrate reflection symmetry
fig.plot(lambda x: x,             color=GRAY,  label='y = x',        width=1, dashed=True)
fig.plot(lambda x: math.exp(x) if math.exp(x) < 4 else None,
                                  color=AMBER, label='eˣ (mirror)',   width=1.5)

# Key points
fig.point([1, 0], color=BLUE, radius=7, label='ln(1)=0')
fig.point([math.e, 1], color=BLUE, radius=7, label='ln(e)=1')

fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── SOLVING + APPLICATIONS ────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Solving exponential equations with logarithms',
              prose: [
                'To solve for x in an exponential equation, apply a logarithm to both sides and use the power rule to bring x down as a factor. The general strategy: isolate the exponential, take ln of both sides, use ln(eˣ) = x or the power rule.',
                '## General solving pattern',
                '- `a · eᵏˣ = y` → `eᵏˣ = y/a` → `kx = ln(y/a)` → **`x = ln(y/a) / k`**\n- `A · bˣ = y` → `bˣ = y/A` → `x·ln(b) = ln(y/A)` → **`x = ln(y/A) / ln(b)`**',
                '**Python pattern:** Once you have the formula, write a one-line function that encodes it. The code below solves four common problems — time to reach a target, time to decay to a threshold, required rate for a target — each with a single clean formula.',
              ],
              code: `import math

# 1. When does a population reach a target?
# N(t) = N0 * e^(kt)  →  t = ln(target/N0) / k
def time_to_reach(N0, k, target):
    """Time for N0*e^(kt) to reach target."""
    return math.log(target / N0) / k

N0, k = 100, 0.07   # 100 organisms, 7% growth rate
print("Population growth (k=7%/yr, start=100):")
for target in [200, 500, 1000, 10000]:
    t = time_to_reach(N0, k, target)
    print(f"  Reach {target:>6}: t = {t:.2f} years")

# 2. When does decay fall below a threshold?
# y(t) = a * e^(-kt)  →  t = ln(a/threshold) / k
def time_to_decay(a, k, threshold):
    """Time for a*e^(-kt) to drop to threshold."""
    return math.log(a / threshold) / k

drug_dose = 500   # mg
k_drug = math.log(2) / 4   # half-life = 4 hours
print("\\nDrug clearance (T½=4hr, dose=500mg):")
for threshold in [250, 100, 50, 10, 1]:
    t = time_to_decay(drug_dose, k_drug, threshold)
    print(f"  Below {threshold:>3} mg: t = {t:.2f} hours")

# 3. Required rate to double in d years
# 2 = e^(k*d)  →  k = ln(2)/d
def rate_to_double(years):
    return math.log(2) / years

print("\\nRequired growth rate to double:")
for d in [5, 10, 20, 30]:
    k = rate_to_double(d)
    print(f"  In {d:2} years: k = {k:.4f} ({k*100:.2f}%/yr)")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 10,
              cellTitle: 'Half-life and doubling time',
              prose: [
                'Two derived quantities give you an intuitive handle on any exponential process without needing to work with e directly.',
                '## Doubling time T₂ (growth, k > 0)',
                '- **Formula:** T₂ = ln(2) / k ≈ 0.693 / k\n- **Rule of 72:** T₂ ≈ 72 / (k × 100) — quick mental estimate for percentage rates\n- Example: k = 0.07 (7%/yr) → T₂ ≈ 72/7 ≈ 10.3 years',
                '## Half-life T½ (decay, k > 0)',
                '- **Formula:** T½ = ln(2) / k ≈ 0.693 / k — same formula, different interpretation\n- After n half-lives: y = a · (½)ⁿ\n- After 10 half-lives: less than 0.1% of the original remains',
                'Both are just ln(2)/k — the time it takes the exponent to change by ±ln(2) ≈ ±0.693.',
              ],
              code: `import math
from opencalc import Figure, BLUE, AMBER, RED, GREEN

ln2 = math.log(2)

# Doubling time: T2 = ln(2) / k
print("Doubling time (growth k > 0):")
print(f"{'Rate k':>10}  {'k%/yr':>8}  {'T₂ exact':>10}  {'Rule of 72':>12}")
for k in [0.01, 0.05, 0.07, 0.10, 0.20]:
    T2 = ln2 / k
    rule72 = 72 / (k * 100)
    print(f"{k:>10.2f}  {k*100:>7.0f}%  {T2:>10.2f} yr  {rule72:>10.1f} yr")

# Half-life: T_half = ln(2) / k  (same formula!)
print("\\nHalf-life (decay k > 0 in y = a*e^(-kt)):")
examples = [
    ("Carbon-14",  0.000121),
    ("Drug (fast)", math.log(2)/4),
    ("Polonium-210", math.log(2)/138.4),
]
for name, k in examples:
    T_half = ln2 / k
    print(f"  {name:20s}: T½ = {T_half:.2f}")

# Visualize: show original, T½, 2T½, 3T½ as fraction remaining
fig = Figure(xmin=0, xmax=5, ymin=0, ymax=1.1,
             title="Fraction remaining after n half-lives")
fig.grid().axes()
fig.plot(lambda n: (0.5)**n, color=BLUE, label='(½)ⁿ', width=3)
for n in range(6):
    y = 0.5**n
    fig.point([n, y], color=AMBER, radius=6, label=f'n={n}: {y:.4f}')
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── FITTING EXPONENTIAL DATA ──────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Log linearization — turning exponential data linear',
              prose: [
                'If y = a·eᵏˣ, take the natural log of both sides: **ln(y) = ln(a) + k·x**. This is a linear equation in x with slope k and intercept ln(a). So: plot ln(y) vs x — if the result is a straight line, the original data is exponential. Fit a line to the transformed data, recover k (the slope) and a (= eⁱⁿᵗᵉʳᶜᵉᵖᵗ).',
                '## The linearization steps',
                '1. Take `ln(y)` for every data point\n2. Run **linear least squares** on `(x, ln_y)` to get slope `k` and intercept `b`\n3. Recover `a = math.exp(b)` — the initial value\n4. Your exponential model is `y = a · math.exp(k · x)`',
                '## Why not just fit eᵏˣ directly?',
                'Linear least squares has a closed-form solution (no iteration). Fitting exponentials directly requires iterative optimisation (like gradient descent) with no guarantee of finding the global minimum. Linearisation via log gives you the exact analytic answer in one pass.',
              ],
              code: `import math

def fit_exponential(xs, ys):
    """
    Fit y = a * exp(k * x) using log linearization.

    Steps:
      1. Transform: ln_y = ln(y) for each y
      2. Fit line to (x, ln_y) using least squares → slope=k, intercept=ln(a)
      3. Recover a = exp(intercept)

    Returns (a, k, fit_fn)
    """
    # Step 1: log-transform the y values
    ln_ys = [math.log(y) for y in ys]

    # Step 2: linear least squares on (x, ln_y)
    n   = len(xs)
    sx  = sum(xs)
    sy  = sum(ln_ys)
    sx2 = sum(x**2 for x in xs)
    sxy = sum(x * ly for x, ly in zip(xs, ln_ys))

    k = (n * sxy - sx * sy) / (n * sx2 - sx**2)
    ln_a = (sy - k * sx) / n

    # Step 3: recover a
    a = math.exp(ln_a)

    fit_fn = lambda x: a * math.exp(k * x)
    return a, k, fit_fn

# Test: generate data from y = 50 * e^(0.15x) + small noise
import random
random.seed(42)
true_a, true_k = 50.0, 0.15
xs = [i * 0.5 for i in range(20)]
ys = [true_a * math.exp(true_k * x) * (1 + random.gauss(0, 0.03)) for x in xs]

a_hat, k_hat, f_hat = fit_exponential(xs, ys)

print(f"True model:   a = {true_a:.2f},  k = {true_k:.4f}")
print(f"Fitted model: a = {a_hat:.2f},  k = {k_hat:.4f}")
print(f"Close: a={math.isclose(a_hat, true_a, rel_tol=0.05)}, k={math.isclose(k_hat, true_k, rel_tol=0.05)}")`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 12,
              cellTitle: 'Visualizing the exponential fit',
              prose: [
                'Plot the raw data, the fitted exponential curve, and the linearised data together. The linearised plot (ln_y vs x) should look like a straight line if the exponential model is appropriate — a curved linearised plot means the exponential assumption is wrong.',
                '**R² on the log-transformed data** measures how well the exponential model fits: a high R² in log-space means the exponential explains most of the variation. But note: R² in log-space is not the same as R² in the original scale — outlier large values contribute less when log-transformed.',
              ],
              code: `import math, random
from opencalc import Figure, BLUE, RED, AMBER, GREEN

random.seed(42)
true_a, true_k = 50.0, 0.15
xs = [i * 0.5 for i in range(20)]
ys = [true_a * math.exp(true_k * x) * (1 + random.gauss(0, 0.03)) for x in xs]

a_hat, k_hat, f_hat = fit_exponential(xs, ys)

# R² in log-space
ln_ys = [math.log(y) for y in ys]
ln_mean = sum(ln_ys) / len(ln_ys)
ss_tot = sum((ly - ln_mean)**2 for ly in ln_ys)
ss_res = sum((ly - math.log(f_hat(x)))**2 for x, ly in zip(xs, ln_ys))
r2_log = 1 - ss_res / ss_tot

# Plot 1: raw data + exponential fit
fig1 = Figure(xmin=-0.5, xmax=10.5, ymin=0, ymax=400,
              title=f"Exponential fit: a={a_hat:.1f}, k={k_hat:.4f}  (R²_log={r2_log:.4f})")
fig1.grid().axes()
fig1.scatter(xs, ys, color=AMBER, radius=5)
fig1.plot(f_hat,
          color=BLUE, label=f'fit: {a_hat:.1f}·e^({k_hat:.3f}x)', width=3)
fig1.plot(lambda x: true_a * math.exp(true_k * x),
          color=RED,  label='true model', width=1.5)
fig1.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            {
              id: 13,
              cellTitle: 'Semi-log plot — exponential becomes linear',
              prose: [
                'A **semi-log plot** puts a logarithmic scale on the y-axis. Exponential curves — which curve upward on a linear scale — become straight lines on a semi-log plot. This is a powerful diagnostic: if your data looks linear on a semi-log plot, the underlying relationship is exponential.',
                '## Reading a semi-log plot',
                '- **Straight line** → exponential growth or decay\n- **Slope of the line** = k, the exponential growth rate\n- **Upward slope** → growth (k > 0)\n- **Downward slope** → decay (k < 0)\n- **Curved line** → not purely exponential (might be power law, logistic, etc.)',
                'We simulate this in opencalc by plotting ln(y) vs x — the manual version of a semi-log plot. The slope of that line is k and the y-intercept is ln(a).',
              ],
              code: `import math, random
from opencalc import Figure, BLUE, RED, AMBER, GREEN

random.seed(42)
true_a, true_k = 50.0, 0.15
xs = [i * 0.5 for i in range(20)]
ys = [true_a * math.exp(true_k * x) * (1 + random.gauss(0, 0.03)) for x in xs]

a_hat, k_hat, f_hat = fit_exponential(xs, ys)
ln_ys = [math.log(y) for y in ys]

# Semi-log: plot ln(y) vs x
# On a true log-axis, this would look linear — here we plot ln(y) directly
fig = Figure(xmin=-0.5, xmax=10.5, ymin=3, ymax=7,
             title="Semi-log plot: ln(y) vs x — exponential becomes a straight line")
fig.grid().axes()

# The data in log-space
fig.scatter(xs, ln_ys, color=AMBER, radius=5)

# The fitted line in log-space: ln(y) = ln(a) + k*x
ln_a_hat = math.log(a_hat)
fig.plot(lambda x: ln_a_hat + k_hat * x,
         color=BLUE, label=f'slope k={k_hat:.4f}', width=3)

# Annotate the slope
fig.arrow([1, ln_a_hat + k_hat * 1],
          [6, ln_a_hat + k_hat * 6],
          color=RED, width=2, label='rise/run = k')
fig.text([6.5, ln_a_hat + k_hat * 4], f"slope = {k_hat:.4f}", color='red', size=11, bold=True)

fig.show()

print("If data is straight on a semi-log plot → the original relationship is exponential")
print(f"Slope of log-space line = k = {k_hat:.4f}")
print(f"Y-intercept = ln(a) = {ln_a_hat:.4f}  →  a = e^{ln_a_hat:.4f} = {math.exp(ln_a_hat):.2f}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGES ────────────────────────────────────────────────────
            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Log properties — fill in the blanks',
              difficulty: 'easy',
              prompt: 'Fill in the expressions using the three logarithm properties: product rule, quotient rule, and power rule. Each blank should produce the correct numerical answer.',
              starterBlock: `import math

# Product rule: ln(a * b) = ln(a) + ln(b)
a, b = 4.0, 3.0
result1 = ___ + ___              # fill in using math.log
print(f"ln(12) = {math.log(12):.6f}")
print(f"filled = {result1:.6f}")

# Quotient rule: ln(a / b) = ln(a) - ln(b)
result2 = ___ - ___
print(f"\\nln(4/3) = {math.log(4/3):.6f}")
print(f"filled  = {result2:.6f}")

# Power rule: ln(a^n) = n * ln(a)
n = 5
result3 = ___ * ___
print(f"\\nln(4^5) = {math.log(4**5):.6f}")
print(f"filled  = {result3:.6f}")`,
              code: `import math

a, b = 4.0, 3.0
result1 = ___ + ___
print(f"ln(12) = {math.log(12):.6f}")
print(f"filled = {result1:.6f}")

result2 = ___ - ___
print(f"\\nln(4/3) = {math.log(4/3):.6f}")
print(f"filled  = {result2:.6f}")

n = 5
result3 = ___ * ___
print(f"\\nln(4^5) = {math.log(4**5):.6f}")
print(f"filled  = {result3:.6f}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
a, b, n = 4.0, 3.0, 5
r1 = math.log(a) + math.log(b)
r2 = math.log(a) - math.log(b)
r3 = n * math.log(a)
if not (math.isclose(r1, math.log(12), rel_tol=1e-9)):
    res = f"ERROR: product rule: expected {math.log(12):.6f}, got {r1:.6f}."
elif not (math.isclose(r2, math.log(4/3), rel_tol=1e-9)):
    res = f"ERROR: quotient rule: expected {math.log(4/3):.6f}, got {r2:.6f}."
elif not (math.isclose(r3, math.log(4**5), rel_tol=1e-9)):
    res = f"ERROR: power rule: expected {math.log(4**5):.6f}, got {r3:.6f}."
else:
    res = f"SUCCESS: all three log properties correct — product={r1:.4f}, quotient={r2:.4f}, power={r3:.4f}."
res
`,
              hint: 'Product: math.log(a) + math.log(b). Quotient: math.log(a) - math.log(b). Power: n * math.log(a). All using math.log() which is the natural log (base e).',
            },

            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Compound interest — time to target',
              difficulty: 'easy',
              prompt: 'Write `compound_interest(principal, rate, target)` that returns the number of years to grow from `principal` to `target` at a continuous annual rate `rate` (e.g. 0.07 for 7%). Then answer: how long to double at 5%? To triple at 10%? Also plot the growth curve with the target marked.',
              code: `import math
from opencalc import Figure, BLUE, AMBER, RED

def compound_interest(principal, rate, target):
    """
    Return years t such that principal * e^(rate*t) = target.
    Use the log formula: t = ln(target / principal) / rate
    """
    pass

# Test cases
print(f"Double at 5%/yr:   {compound_interest(1000, 0.05, 2000):.2f} years")
print(f"Triple at 10%/yr:  {compound_interest(1000, 0.10, 3000):.2f} years")
print(f"10x at 7%/yr:      {compound_interest(1000, 0.07, 10000):.2f} years")

# Plot: $1000 at 7% growing to $10000
principal, rate, target = 1000, 0.07, 10000
t_target = compound_interest(principal, rate, target)

fig = Figure(xmin=0, xmax=t_target + 5, ymin=0, ymax=target * 1.1,
             title=f"Compound interest: reach target at t={t_target:.1f} yr")
fig.grid().axes()
fig.plot(lambda t: principal * math.exp(rate * t), color=BLUE,
         label=f'{principal} * e^({rate}t)', width=3)
fig.point([t_target, target], color=AMBER, radius=8, label=f'target ({t_target:.1f}yr)')
fig.hline(target, color='gray')
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'compound_interest' not in dir():
    res = "ERROR: compound_interest not defined."
else:
    t1 = compound_interest(1000, 0.05, 2000)
    t2 = compound_interest(1000, 0.10, 3000)
    if t1 is None:
        res = "ERROR: function returned None — fill in the formula."
    elif abs(t1 - math.log(2)/0.05) > 0.01:
        res = f"ERROR: double at 5% should be {math.log(2)/0.05:.4f} yr, got {t1:.4f}."
    elif abs(t2 - math.log(3)/0.10) > 0.01:
        res = f"ERROR: triple at 10% should be {math.log(3)/0.10:.4f} yr, got {t2:.4f}."
    else:
        res = f"SUCCESS: compound_interest correct — double@5%={t1:.2f}yr, triple@10%={t2:.2f}yr."
res
`,
              hint: 'From P·e^(r·t) = target, divide both sides by P: e^(r·t) = target/P. Apply ln: r·t = ln(target/P). Divide by r: t = math.log(target / principal) / rate.',
            },

            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Detect and fit exponential data',
              difficulty: 'medium',
              prompt: 'The data below may or may not be exponential. Write `is_exponential(ys, tol=0.05)` that returns True if consecutive ratios are all within `tol` of each other. If it is exponential, fit it using `fit_exponential()` and plot the scatter + fitted curve.',
              code: `import math
from opencalc import Figure, BLUE, AMBER, RED, GREEN

def is_exponential(ys, tol=0.05):
    """Return True if consecutive ratios y[i]/y[i-1] are all within tol of their mean."""
    pass

# Dataset 1 — exponential?
xs1 = [0, 1, 2, 3, 4, 5, 6]
ys1 = [3.1, 6.3, 12.5, 25.3, 50.1, 101.2, 203.7]

# Dataset 2 — exponential?
xs2 = [0, 1, 2, 3, 4, 5, 6]
ys2 = [1, 4, 9, 16, 25, 36, 49]   # quadratic

print("Dataset 1 exponential?", is_exponential(ys1))
print("Dataset 2 exponential?", is_exponential(ys2))

# If dataset 1 is exponential, fit and plot it
if is_exponential(ys1):
    a, k, f = fit_exponential(xs1, ys1)
    print(f"Fit: a={a:.2f}, k={k:.4f}")
    fig = Figure(xmin=-0.5, xmax=7, ymin=0, ymax=250,
                 title=f"Exponential fit: {a:.1f} * e^({k:.3f}x)")
    fig.grid().axes()
    fig.scatter(xs1, ys1, color=AMBER, radius=6)
    fig.plot(f, color=BLUE, label='fitted curve', width=3)
    fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'is_exponential' not in dir():
    res = "ERROR: is_exponential not defined."
else:
    ys_exp  = [3.1, 6.3, 12.5, 25.3, 50.1, 101.2, 203.7]
    ys_quad = [1, 4, 9, 16, 25, 36, 49]
    r1 = is_exponential(ys_exp)
    r2 = is_exponential(ys_quad)
    if r1 is None:
        res = "ERROR: function returned None — add the ratio check logic."
    elif not r1:
        res = f"ERROR: dataset 1 IS exponential (ratios ≈ 2.03), but got False."
    elif r2:
        res = f"ERROR: dataset 2 is quadratic, NOT exponential, but got True."
    else:
        res = f"SUCCESS: is_exponential correctly identifies exponential ({r1}) vs quadratic ({r2})."
res
`,
              hint: 'Compute ratios = [ys[i]/ys[i-1] for i in range(1, len(ys))]. Find mean_ratio = sum(ratios)/len(ratios). Return all(abs(r - mean_ratio)/mean_ratio < tol for r in ratios).',
            },

            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Radioactive decay — carbon dating',
              difficulty: 'medium',
              prompt: 'Carbon-14 has a half-life of 5,730 years. An archaeologist finds an organic sample with 23% of its original C-14 remaining. Write `carbon_date(fraction_remaining)` that returns the age of the sample. Then plot the C-14 decay curve and mark the sample\'s age.',
              code: `import math
from opencalc import Figure, BLUE, AMBER, RED, GRAY

C14_HALFLIFE = 5730   # years

def carbon_date(fraction_remaining):
    """
    Return the age in years given the fraction of C-14 still present.
    Model: fraction = e^(-k*t)  where k = ln(2) / T½
    Solve for t: t = -ln(fraction) / k
    """
    pass

# Test
print(f"100% remaining → {carbon_date(1.0):.0f} years (should be 0)")
print(f"50% remaining  → {carbon_date(0.5):.0f} years (should be 5730, one T½)")
print(f"25% remaining  → {carbon_date(0.25):.0f} years (should be 11460, two T½)")
print(f"23% remaining  → {carbon_date(0.23):.0f} years")

# Plot the decay curve and mark the sample
fraction_sample = 0.23
age = carbon_date(fraction_sample)

k = math.log(2) / C14_HALFLIFE
fig = Figure(xmin=0, xmax=25000, ymin=0, ymax=1.05,
             title=f"Carbon-14 decay — sample age: {age:.0f} years")
fig.grid().axes()
fig.plot(lambda t: math.exp(-k * t), color=BLUE,
         label='C-14 fraction remaining', width=3)
fig.point([age, fraction_sample], color=AMBER, radius=8,
          label=f'sample: {fraction_sample*100:.0f}% at {age:.0f}yr')
fig.hline(fraction_sample, color='gray')
fig.vline(age, color='gray')
fig.show()
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math
if 'carbon_date' not in dir():
    res = "ERROR: carbon_date not defined."
else:
    C14_HALFLIFE = 5730
    t0   = carbon_date(1.0)
    t_half = carbon_date(0.5)
    t_quarter = carbon_date(0.25)
    t_sample = carbon_date(0.23)
    if t0 is None:
        res = "ERROR: function returned None — add the formula."
    elif abs(t0) > 1:
        res = f"ERROR: 100% remaining should give 0 years, got {t0:.1f}."
    elif abs(t_half - 5730) > 5:
        res = f"ERROR: 50% remaining should give 5730 years, got {t_half:.0f}."
    elif abs(t_quarter - 11460) > 10:
        res = f"ERROR: 25% remaining should give 11460 years, got {t_quarter:.0f}."
    elif not (12000 < t_sample < 13000):
        res = f"ERROR: 23% remaining should give ~12350 years, got {t_sample:.0f}."
    else:
        res = f"SUCCESS: carbon_date correct — T½={t_half:.0f}yr, sample={t_sample:.0f}yr."
res
`,
              hint: 'k = math.log(2) / C14_HALFLIFE. From fraction = e^(-k*t), apply ln: ln(fraction) = -k*t. Solve: t = -math.log(fraction_remaining) / k.',
            },

            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Compound: full exponential modelling workflow',
              difficulty: 'hard',
              prompt: 'A biologist measures bacterial colony size (cells) at hourly intervals. Detect whether growth is exponential, fit the model, estimate the doubling time, predict the population at t=24, and produce a complete annotated plot with the fitted curve, the true data, and the prediction point.',
              code: `import math, random
from opencalc import Figure, BLUE, AMBER, RED, GREEN, PURPLE

random.seed(7)
# True model: N(t) = 500 * e^(0.35 * t)
true_a, true_k = 500, 0.35
times  = list(range(0, 13))                # hours 0–12
counts = [true_a * math.exp(true_k * t) * (1 + random.gauss(0, 0.04))
          for t in times]

# 1. Detect exponential
print("Is exponential?", is_exponential(counts, tol=0.08))

# 2. Fit the model
a, k, f = fit_exponential(times, counts)
print(f"Fitted: a={a:.1f} cells,  k={k:.4f}/hr")

# 3. Doubling time
T2 = math.log(2) / k
print(f"Doubling time: {T2:.2f} hours")

# 4. Predict at t=24
pred_24 = f(24)
print(f"Predicted at t=24hr: {pred_24:,.0f} cells")

# 5. Full annotated plot
fig = Figure(xmin=-0.5, xmax=26, ymin=0, ymax=pred_24 * 1.1,
             title=f"Bacterial Growth  T₂={T2:.1f}hr  prediction@24hr={pred_24:,.0f}")
fig.grid().axes()

# Your code: scatter, fitted line (0–12), extrapolation (12–24), prediction point
`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import math, random
random.seed(7)
true_a, true_k = 500, 0.35
times  = list(range(0, 13))
counts = [true_a * math.exp(true_k * t) * (1 + random.gauss(0, 0.04)) for t in times]
if 'fit_exponential' not in dir():
    res = "ERROR: fit_exponential not defined (run earlier cells first)."
elif 'is_exponential' not in dir():
    res = "ERROR: is_exponential not defined."
else:
    a, k, f = fit_exponential(times, counts)
    T2 = math.log(2) / k
    pred_24 = f(24)
    if abs(k - true_k) > 0.05:
        res = f"ERROR: k should be ~{true_k}, got {k:.4f}."
    elif abs(T2 - math.log(2)/true_k) > 0.5:
        res = f"ERROR: doubling time should be ~{math.log(2)/true_k:.2f}hr, got {T2:.2f}."
    elif not (1_000_000 < pred_24 < 10_000_000):
        res = f"ERROR: prediction at t=24 should be ~3M cells, got {pred_24:,.0f}."
    else:
        res = f"SUCCESS: k={k:.4f}, T₂={T2:.2f}hr, prediction@24hr={pred_24:,.0f} cells."
res
`,
              hint: 'Use fit_exponential(times, counts) for the fit. T2 = math.log(2) / k. Extrapolation line: fig.plot(f, xmin=12, xmax=24, color=RED). Prediction point: fig.point([24, pred_24], color=PURPLE). Add fig.vline(12) to mark where extrapolation begins.',
            },
          ],
        },
      },
    ],
  },
}
