// FILE: src/content/chapter-3/01-linear-approximation.js
export default {
  id: 'ch3-001',
  slug: 'linear-approximation',
  chapter: 3,
  order: 2,
  title: 'Linear Approximation & Differentials',
  subtitle: 'Zoom in on any smooth curve far enough and it becomes a straight line — and that line is enormously useful',
  tags: ['linear approximation', 'linearization', 'differentials', 'tangent line', 'error analysis', 'Taylor polynomial', 'sensitivity'],

  hook: {
    question: 'Without a calculator, estimate √26 accurate to three decimal places. Then estimate your own error — how far off might you be? Mathematicians before computers needed to compute square roots, cube roots, and trigonometric values with high precision for navigation, astronomy, and engineering. How did they do it?',
    realWorldContext: 'Linear approximation — replacing a curve with its tangent line near a point — is one of the most practically powerful ideas in all of calculus. Engineers use it constantly to simplify nonlinear systems into tractable linear ones, a process called linearization. Every GPS calculation on your phone, every airplane autopilot control law, every finite-element simulation in mechanical engineering, and every control system in industrial manufacturing relies on linearization under the hood. The idea is simple but profound: zoom in on any smooth differentiable curve far enough, and it becomes indistinguishable from a straight line. This property — that smooth curves look flat when zoomed in — is precisely what differentiability means geometrically, and it is what makes linear approximation so accurate near the base point.',
    previewVisualizationId: 'LinearApproximation',
  },

  intuition: {
    prose: [
      "The Mean Value Theorem proved that instantaneous and average rates must agree somewhere. Now we flip the idea into a practical tool: if we know f(a) and f'(a), we can approximate f(x) for x near a. This is linear approximation — the tangent line used as a calculator. NASA used linear approximation to compute trajectories in the 1960s. Your calculator uses it internally for sin, cos, exp, and ln. Engineers use it constantly for 'small signal analysis.' The idea sounds simple, but it is one of the most used tools in applied mathematics.",
      'Start with the central geometric fact: if you zoom into a differentiable function f at a point x = a, the curve eventually becomes indistinguishable from a straight line — the tangent line. This is not just a visual trick; it is the precise meaning of differentiability. A function is differentiable at a if and only if it "looks linear" at infinitely high magnification at a. The tangent line L(x) = f(a) + f\'(a)(x - a) is the unique line that matches both the function value and the slope of f at the point (a, f(a)). Because the curve and the tangent line agree in both value and direction at x = a, they stay close to each other for x near a.',
      'Think of it as replacing f with its tangent line locally. The linearization (also called the linear approximation) of f at x = a is L(x) = f(a) + f\'(a)(x - a). When you use L(x) as a surrogate for f(x) near a, you are making an approximation error f(x) - L(x). By Taylor\'s theorem, this error is approximately f\'\'(a)(x-a)²/2 — it grows like the square of the distance from a. This means the error is O((x-a)²): if you halve the distance from a, you quarter the error. For x very close to a, the linear approximation is astonishingly accurate.',
      'To estimate √26 without a calculator, choose a nearby perfect square: a = 25, f(x) = √x, f(a) = 5. Compute f\'(x) = 1/(2√x), so f\'(25) = 1/10. The linearization is L(x) = 5 + (1/10)(x - 25). At x = 26: L(26) = 5 + (1/10)(1) = 5.1. The actual value is √26 ≈ 5.0990..., so the error is about 0.001 — less than two parts in ten thousand. For √24: L(24) = 5 + (1/10)(-1) = 4.9. Actual: √24 ≈ 4.899... Error ≈ 0.001. The linear approximation is symmetric and equally accurate on both sides.',
      'Error analysis is built into the linear approximation framework through differentials. If y = f(x), the differential dy is defined as dy = f\'(x)·dx. Here dx represents a small change in x (not necessarily infinitesimal — just small), and dy is the corresponding change in y along the TANGENT LINE. This is different from Δy, the actual change in f: Δy = f(x + dx) - f(x). The linear approximation says Δy ≈ dy, with error Δy - dy = f\'\'(a)(dx)²/2 + higher-order terms. Engineers use dy to estimate how errors in measurements propagate to errors in computed quantities.',
      'The differential formalism provides a powerful tool for sensitivity analysis. If you measure a physical quantity x with absolute error ±δx, the resulting error in f(x) is approximately |f\'(x)|·δx. The relative error in f(x) is approximately |f\'(x)/f(x)|·δx = |(d/dx)[ln f(x)]|·δx. For the volume of a sphere, V = (4/3)πr³, the relative error is 3·(δr/r) — a 1% error in radius measurement produces about a 3% error in calculated volume. This factor of 3 comes directly from the power in the formula, and the linear approximation makes it quantitative.',
      'The linearizations of the standard functions at x = 0 are the most important special cases. Near x = 0: sin(x) ≈ x (since sin(0) = 0 and cos(0) = 1). cos(x) ≈ 1 (since cos(0) = 1 and -sin(0) = 0). e^x ≈ 1 + x (since e^0 = 1 and e^0 = 1). ln(1+x) ≈ x (since ln(1) = 0 and 1/(1+0) = 1). (1+x)^n ≈ 1 + nx (by the binomial theorem / chain rule). These approximations are valid for |x| << 1 and appear constantly in physics, engineering, and probability. The simple pendulum formula T = 2π√(L/g) relies on sin(θ) ≈ θ — the small-angle approximation.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'This is the Point-Slope Tangent Line',
        body: 'Linear approximation L(x) = f(a) + f\'(a)(x - a) is exactly the point-slope equation of the tangent line at (a, f(a)). You have been writing y - y₁ = m(x - x₁) since algebra class. Here y₁ = f(a), x₁ = a, and m = f\'(a). The only new idea is using the tangent line as a surrogate for the curve — "zooming in until the curve is a line."',
      },
      {
        type: 'real-world',
        title: 'Linearization in Physics: The Simple Pendulum',
        body: 'A pendulum of length L obeys the nonlinear ODE θ\'\' + (g/L)sin(θ) = 0, which has no closed-form solution. The small-angle approximation sin(θ) ≈ θ linearizes it to θ\'\' + (g/L)θ = 0 — simple harmonic motion with period T = 2π√(L/g). This formula, derived from linear approximation, is accurate to better than 0.5% for amplitudes under 10°. All clocks with pendulums rely on it.',
      },
      {
        type: 'geometric',
        title: 'Zooming In Makes the Curve Linear',
        body: 'Differentiability means the curve has a unique tangent direction at each point. Zooming in at a differentiable point replaces the curve with its tangent line — they become indistinguishable. This is WHY the derivative is the slope of the tangent line. Non-differentiable points (corners, cusps) resist this: no matter how much you zoom in on |x| at x = 0, the corner remains.',
      },
      {
        type: 'warning',
        title: 'Only Works Near the Base Point a',
        body: 'The approximation f(x) ≈ f(a) + f\'(a)(x - a) is excellent for x near a and degrades rapidly as x moves away from a. For example, sin(x) ≈ x is accurate to 1% for |x| < 0.24 radians (≈14°) but has 50% error at x = π/2. Never use a linear approximation far from its base point without checking the error bound from Taylor\'s theorem.',
      },
      {
        type: 'misconception',
        title: 'dy ≠ Δy — The Differential Is an Approximation',
        body: "The differential dy = f'(x)·dx gives the change along the TANGENT LINE, not the actual change in f. The actual change Δy = f(x+dx) - f(x) differs from dy by approximately f''(x)(dx)²/2. For small dx this difference is negligible, but for large dx it can be enormous. Never confuse the differential (linear approximation) with the true change.",
      },
      {
        type: 'history',
        title: 'Napier and the Age of Computation',
        body: "Before calculators, navigators and astronomers needed to compute sin, cos, √, and log to many decimal places. John Napier (1614) invented logarithms partly to turn multiplication into addition. But for other functions, linearization was the primary tool: sin(31°) = sin(30° + 1°) ≈ sin(30°) + cos(30°)·(π/180). These calculations guided ships across oceans.",
      },
    ],
    visualizations: [
      {
        id: "DerivativesRatesOfChange",
        title: "Derivatives as Rates of Change",
        caption: "Linear approximation of √x at a = 25: the tangent line gives excellent estimates near the base point, degrading farther away.",
        mathBridge: "Set the function to f(x) = √x and the base point to a = 25. The tangent line at a = 25 has slope f'(25) = 1/(2√25) = 1/10. So L(x) = 5 + (x − 25)/10. Try x = 26: L(26) = 5.1. Actual: √26 ≈ 5.099. Error: 0.001. Now try x = 30: L(30) = 5.5. Actual: √30 ≈ 5.477. Error: 0.023. Notice how error grows as you move away from the base point.",
      },
      {
        id: 'LinearApproximation',
        title: 'Zoom In Until the Curve Becomes a Line',
        caption: 'Increase the zoom level to see the curve and its tangent line converge. At high zoom, they are indistinguishable — that is what differentiability means geometrically.',
      },
      {
        id: 'PythonNotebook',
        title: 'Python Lab: Build the Linearization',
        caption: 'Run the cells below to plot f(x) = √x and its tangent line L(x) at a = 25. Then modify the base point or the function and re-run to see how the approximation changes.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'What is Linear Approximation?',
              prose: [
                'Linear approximation replaces a curve with its **tangent line** near a chosen base point $a$:',
                '$$L(x) = f(a) + f\'(a)(x - a)$$',
                'The key insight: near $a$, the tangent line and the curve are so close that the difference is negligible.',
                '## How to use this notebook',
                '- Press **▶ Run** (or Shift+Enter) to execute a cell.',
                '- The `opencalc` library is pre-loaded — use `Figure()` to draw plots.',
                '- Change the base point `a` or the function `f` below and re-run to explore.',
              ],
              code: `# opencalc is already imported — let's verify.
from opencalc import Figure
import math

print("opencalc ready! Python", __import__('sys').version.split()[0])`,
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Plot f(x) = √x and its linearization at a = 25',
              prose: [
                'We define $f(x) = \\sqrt{x}$, compute $f\'(25) = \\tfrac{1}{10}$, then plot:',
                '- The **curve** $f(x)$ in blue',
                '- The **tangent line** $L(x) = 5 + \\tfrac{1}{10}(x-25)$ in amber',
                '- The **base point** $(25, 5)$ as a dot',
              ],
              instructions: 'Try changing `a = 25` to `a = 9` or `a = 100` and pressing Run again. Watch how the tangent line shifts.',
              code: `from opencalc import Figure
import math

# ── Configuration (try changing these!) ──────────────────────
f   = math.sqrt          # function
df  = lambda x: 1 / (2 * math.sqrt(x))   # derivative
a   = 25                 # base point
window = 10              # how wide (+/-) to show

# ── Derived values ────────────────────────────────────────────
fa  = f(a)
dfa = df(a)
L   = lambda x: fa + dfa * (x - a)   # linearization
error_at = lambda x: abs(f(x) - L(x))

print(f"f({a})  = {fa}")
print(f"f'({a}) = {dfa:.6f}")
print(f"L(x)   = {fa} + {dfa:.4f} * (x - {a})")
print(f"Spot checks:")
for x in [a - 3, a - 1, a, a + 1, a + 3, a + 5]:
    print(f"  x = {x:6.1f}  |  f(x) = {f(x):.6f}  |  L(x) = {L(x):.6f}  |  error = {error_at(x):.6f}")

# ── Plot ─────────────────────────────────────────────────────
fig = Figure(
    xmin = a - window, xmax = a + window,
    ymin = f(max(1, a - window)) - 1,
    ymax = f(a + window) + 1,
    title = f"Linear Approximation of √x at a = {a}"
)
fig.grid().axes()
fig.plot(f,  color='blue',  label='f(x) = √x',      width=2.5)
fig.plot(L,  color='amber', label=f'L(x) (tangent)', width=2, dashed=False)
fig.point([a, fa], color='green', label=f'({a}, {fa})', radius=7)
fig.show()`,
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Error grows with distance from a',
              prose: [
                'The error $|f(x) - L(x)|$ is approximately $\\tfrac{f\'\'(a)}{2}(x-a)^2$ — **quadratic** in the distance.',
                'This means: halve the distance from $a$ → quarter the error.',
              ],
              instructions: 'Run this cell, then try changing `a` and `f` to a different function (e.g. `f = math.sin`, `df = math.cos`) to see how the error profile changes.',
              code: `from opencalc import Figure
import math

f   = math.sqrt
df  = lambda x: 1 / (2 * math.sqrt(x))
a   = 25

fa  = f(a)
dfa = df(a)
L   = lambda x: fa + dfa * (x - a)
error = lambda x: abs(f(x) - L(x))

# Plot the error curve
xs  = [a + i * 0.1 for i in range(-60, 61)]

fig = Figure(
    xmin = a - 7, xmax = a + 7,
    ymin = -0.01, ymax = 0.6,
    title = "Approximation Error |f(x) - L(x)|"
)
fig.grid(step=1).axes()
fig.plot(error, xmin=max(0.01, a-6), xmax=a+6, color='red', label='|error|', width=2.5)
fig.vline(a, color='amber')
fig.text([a + 0.3, 0.04], f'a = {a}', color='amber', size=11)
fig.show()`,
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              challengeType: 'write',
              challengeTitle: 'Your Turn: Linearize e^x at a = 0',
              difficulty: 'easy',
              prompt: 'The standard linearization of e^x at a = 0 is L(x) = 1 + x.\n\nComplete the code below to (1) print L(0.2) and the actual e^0.2, and (2) plot both curves from x = -1 to x = 1.',
              hint: 'f = math.exp, df = math.exp, a = 0. Then f(a)=1, f\'(a)=1, so L(x) = 1 + x. Use fig.plot() twice — once for f and once for L.',
              code: `from opencalc import Figure
import math

# ── Fill in the blanks ────────────────────────────────────────
f   = math.exp
df  = math.exp
a   = 0

fa  = f(a)
dfa = df(a)
L   = lambda x: fa + dfa * (x - a)  # L(x) = 1 + x

# 1. Print the comparison
print(f"L(0.2)       = {L(0.2):.6f}")
print(f"e^0.2 actual = {f(0.2):.6f}")
print(f"Error        = {abs(f(0.2) - L(0.2)):.6f}")

# 2. Plot — add your plot() calls below
fig = Figure(xmin=-1, xmax=1, ymin=0, ymax=3, title="Linearization of e^x at a=0")
fig.grid().axes()
# YOUR CODE HERE: plot f and L, add the base point dot

fig.show()`,
              output: '',
              status: 'idle',
              figureJson: null,
            },
          ]
        }
      },
    ],
  },

  math: {
    prose: [
      'The formal definition: the linearization of f at x = a is L(x) = f(a) + f\'(a)(x - a). We say f(x) ≈ L(x) for x near a. The approximation is exact at x = a (since L(a) = f(a)) and has the correct slope there (since L\'(a) = f\'(a)). No other linear function matches both simultaneously — the linearization is the unique best linear approximation to f near a.',
      'Differentials formalize the linearization algebraically. If y = f(x), define the differential dy = f\'(x)·dx, where dx is any real number (the "change in x"). Then dy is the corresponding change in y along the tangent line. The actual change in y is Δy = f(x + dx) - f(x). The linear approximation says Δy ≈ dy, with error Δy - dy = f\'\'(x)(dx)²/2 + O((dx)³). In Leibniz notation, df = f\'(x)·dx — this is the definition of the differential df, and it makes Leibniz\'s notation dy/dx = f\'(x) look like a ratio (dy divided by dx) even though it is defined as a limit.',
      'Taylor\'s theorem provides the error bound: |f(x) - L(x)| ≤ M|x-a|²/2, where M = max_{t ∈ [a,x]} |f\'\'(t)|. This bound shows the error is quadratic in the distance |x-a|. The bound is tight in general: if f\'\'(a) ≠ 0, then f(x) - L(x) ≈ f\'\'(a)(x-a)²/2 near a. To achieve error less than ε in the approximation, we need |x-a| < √(2ε/M).',
      'Relative error vs. absolute error: the absolute error in using L(x) for f(x) is |f(x) - L(x)|. The relative error is |f(x) - L(x)| / |f(x)|. For many engineering applications, relative error matters more — a 1% error in a large quantity may be acceptable, while a 1% error in a safety-critical small quantity may not be. The differential formalism handles both: absolute error ≈ |dy| = |f\'(x)|·|dx|, relative error ≈ |dy/y| = |f\'(x)/f(x)|·|dx|.',
      'The standard linearizations at x = 0 (where f(0) = 0 or 1 as appropriate): sin(x) ≈ x, cos(x) ≈ 1, tan(x) ≈ x, e^x ≈ 1+x, ln(1+x) ≈ x, (1+x)^n ≈ 1+nx, √(1+x) ≈ 1+x/2, 1/(1+x) ≈ 1-x. These follow from the general formula L(x) = f(0) + f\'(0)·x with the appropriate f and f\'. These approximations form the foundation of perturbation theory in physics — they allow analysts to solve nonlinear problems by treating deviations from a reference state as small.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Linearization of f at a',
        body: 'L(x) = f(a) + f\'(a)(x - a)',
      },
      {
        type: 'definition',
        title: 'Differential',
        body: '\\text{If } y = f(x), \\text{ the differential is } dy = f\'(x)\\,dx.',
        extra: 'The differential dy is the change in y along the tangent line when x changes by dx. The actual change Δy ≈ dy, with error O((dx)²).',
      },
      {
        type: 'theorem',
        title: 'Error Bound (from Taylor\'s Theorem)',
        body: '|f(x) - L(x)| \\leq \\frac{M}{2}(x-a)^2, \\quad M = \\max_{t \\in [a,x]}|f\'\'(t)|',
      },
      {
        type: 'definition',
        title: 'Standard Linearizations at x = 0',
        body: '\\sin(x) \\approx x, \\quad \\cos(x) \\approx 1, \\quad e^x \\approx 1+x \\\\ \\ln(1+x) \\approx x, \\quad (1+x)^n \\approx 1+nx, \\quad \\sqrt{1+x} \\approx 1 + \\tfrac{x}{2}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The precise statement of differentiability in terms of linear approximation: f is differentiable at a if and only if there exists a number m (the derivative f\'(a)) such that f(x) = f(a) + m(x-a) + ε(x)(x-a), where ε(x) → 0 as x → a. This is an alternative (and equivalent) definition of the derivative. The function ε(x) measures the "error per unit distance from a" in the linear approximation — saying ε(x) → 0 means the linear approximation is asymptotically exact near a, not just approximately correct.',
      'Proof that the tangent line is the unique best linear approximation: suppose two lines L₁(x) = f(a) + m₁(x-a) and L₂(x) = f(a) + m₂(x-a) both satisfy lim_{x→a} [f(x) - Lᵢ(x)]/(x-a) = 0. Then lim_{x→a} [L₁(x) - L₂(x)]/(x-a) = lim (m₁-m₂) = m₁ - m₂ = 0, so m₁ = m₂. There is only one value of the slope m for which the error is o(x-a), and that value is f\'(a). This justifies calling L the "best" linear approximation.',
      'Taylor\'s theorem (first-order version with Lagrange remainder): if f is twice differentiable on [a, x], then f(x) = f(a) + f\'(a)(x-a) + f\'\'(c)(x-a)²/2 for some c strictly between a and x. The term f\'\'(c)(x-a)²/2 is called the Lagrange remainder. It shows the error is not just O((x-a)²) in order — it equals (x-a)²/2 times the second derivative at some interior point c. This is the quantitative error bound that engineers use to certify approximations.',
      'The connection to complex analysis: a function of a complex variable is differentiable (in the complex sense, i.e., holomorphic) if and only if it is locally linear in the complex sense — C-linear, not just R-linear. This is a much stronger condition than real differentiability and implies that the function is automatically infinitely differentiable and equals its Taylor series everywhere in its domain. The simple real idea of linear approximation extends to the foundations of complex function theory.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Differentiability via Linear Approximation',
        body: 'f \\text{ is differentiable at } a \\iff f(x) = f(a) + f\'(a)(x-a) + \\varepsilon(x)(x-a) \\text{ where } \\varepsilon(x) \\to 0 \\text{ as } x \\to a.',
      },
      {
        type: 'theorem',
        title: 'Taylor\'s Theorem — First Order',
        body: 'If f is twice differentiable on [a, x], then \\exists\\, c \\in (a, x):\n\\[f(x) = f(a) + f\'(a)(x-a) + \\frac{f\'\'(c)}{2}(x-a)^2\\]',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch3-001-ex1',
      title: 'Linearize √x at a = 25',
      problem: '\\text{Find the linearization of } f(x) = \\sqrt{x} \\text{ at } a = 25. \\text{ Estimate } \\sqrt{26}, \\sqrt{24}, \\text{ and } \\sqrt{25.1}.',
      visualizationId: 'LinearApproximation',
      steps: [
        { expression: 'f(x) = \\sqrt{x}, \\quad f(25) = 5', annotation: 'Evaluate the function at the base point a = 25.', hints: ['Choose the "nice" point closest to your target.', 'The square root of 25 is exactly 5.'] },
        { expression: "f'(x) = \\frac{1}{2\\sqrt{x}}, \\quad f'(25) = \\frac{1}{10}", annotation: 'Compute the derivative and evaluate at a = 25.', hints: ['The derivative of x^(1/2) is (1/2)x^(-1/2).', 'Plug in x = 25 to get the slope of the tangent line.'] },
        { expression: 'L(x) = 5 + \\frac{1}{10}(x - 25)', annotation: 'Write the linearization L(x) = f(a) + f\'(a)(x-a).', hints: ['Assemble the point-slope form: y = y_0 + m(x - x_0).', 'Here x_0 is 25 and y_0 is 5.'] },
        { expression: 'L(26) = 5 + \\frac{1}{10}(1) = 5.1 \\quad (\\text{actual: } \\sqrt{26} \\approx 5.0990)', annotation: 'Estimate √26. Error ≈ 0.001.', hints: ['Plug in x = 26.', 'The difference (x - 25) is exactly 1.'] },
        { expression: 'L(24) = 5 + \\frac{1}{10}(-1) = 4.9 \\quad (\\text{actual: } \\sqrt{24} \\approx 4.8990)', annotation: 'Estimate √24. Error ≈ 0.001.', hints: ['Plug in x = 24.', 'The displacement is -1.'] },
        { expression: 'L(25.1) = 5 + \\frac{1}{10}(0.1) = 5.01 \\quad (\\text{actual: } \\sqrt{25.1} \\approx 5.0100)', annotation: 'Estimate √25.1. Error < 0.0001 — much better for smaller displacement.', hints: ['For x = 25.1, the (x - 25) term is 0.1.'] },
      ],
      conclusion: 'The linearization L(x) = 5 + (x-25)/10 estimates square roots near 25 with error less than 0.001 for x within 1 unit of 25. Farther from a = 25, the error grows: L(29) = 5.4, but √29 ≈ 5.385 — now the error is 0.015. The quadratic error bound |error| ≤ M(x-25)²/2 with M = max|f\'\'| = max|{-1/(4x^{3/2})}| ≈ 1/500 at x near 25 gives bound (1/500)(4)/2 = 0.004 for x = 29 — a conservative but valid bound.',
    },
    {
      id: 'ch3-001-ex2',
      title: 'Linearize sin(x) at a = 0',
      problem: '\\text{Find the linearization of } f(x) = \\sin(x) \\text{ at } a = 0. \\text{ Estimate } \\sin(0.1) \\text{ and } \\sin(\\pi/2 + 0.1).',
      steps: [
        { expression: 'f(0) = \\sin(0) = 0, \\quad f\'(0) = \\cos(0) = 1', annotation: 'Evaluate f and f\' at a = 0.', hints: ['Evaluate the function and its derivative at the origin.', 'Recall that sin(0)=0 and cos(0)=1.'] },
        { expression: 'L(x) = 0 + 1 \\cdot (x - 0) = x', annotation: 'The linearization of sin(x) at 0 is simply L(x) = x. This is the famous "small-angle approximation."', hints: ['The tangent line at the origin has slope 1.', 'Near zero, sin(x) is approximately just x.'] },
        { expression: '\\sin(0.1) \\approx L(0.1) = 0.1 \\quad (\\text{actual: } 0.09983...)', annotation: 'Estimate sin(0.1). Error ≈ 0.00017 — excellent for 0.1 radians (≈5.7°).', hints: ['Substitute x = 0.1 into your linear model.'] },
        { expression: '\\text{For } \\sin(\\pi/2 + 0.1), \\text{ use } a = \\pi/2', annotation: 'Choose a base point closer to π/2 + 0.1 for better accuracy.', hints: ['The approximation at 0 is no longer valid far away.', 'Pick the nearest "easy" trig point, which is π/2.'] },
        { expression: 'f(\\pi/2) = 1, \\quad f\'(\\pi/2) = \\cos(\\pi/2) = 0', annotation: 'Evaluate at the new base point a = π/2.', hints: ['Compute the value and slope at the peak of the sine wave.'] },
        { expression: 'L(x) = 1 + 0 \\cdot (x - \\pi/2) = 1', annotation: 'The linearization at a = π/2 is just the constant 1.', hints: ['The tangent line is horizontal at the peak (π/2, 1).'] },
        { expression: '\\sin(\\pi/2 + 0.1) \\approx 1 \\quad (\\text{actual: } \\cos(0.1) \\approx 0.99500)', annotation: 'Estimate: 1. Actual: ≈ 0.995. Error ≈ 0.005. The zero-slope tangent is less accurate here.', hints: ['Even with slope 0, the height 1 is still a decent estimate for points very close by.'] },
      ],
      conclusion: 'sin(x) ≈ x near 0 (small-angle approximation). Near π/2, sin(x) ≈ 1 (the function is at a maximum with zero derivative). The accuracy of the linear approximation depends both on the distance from a and the magnitude of f\'\' at the base point — at a maximum, f\'\' = -1, so the quadratic correction is significant even for small displacements.',
    },
    {
      id: 'ch3-001-ex3',
      title: 'Linearize e^x at a = 0',
      problem: '\\text{Find the linearization of } e^x \\text{ at } a = 0. \\text{ Estimate } e^{0.2} \\text{ and } e^{0.01}.',
      steps: [
        { expression: 'f(x) = e^x, \\quad f(0) = 1, \\quad f\'(0) = e^0 = 1', annotation: 'The exponential function equals its own derivative everywhere. At a = 0: f(0) = 1 and f\'(0) = 1.', hints: ['Calculate the value and slope of e^x at the origin.', 'Recall that e^0 = 1.'] },
        { expression: 'L(x) = 1 + x', annotation: 'Linearization of e^x at 0 is L(x) = 1 + x. This is one of the most important approximations in mathematics.', hints: ['Apply the formula L(x) = f(0) + f\'(0)x.'] },
        { expression: 'e^{0.2} \\approx 1 + 0.2 = 1.2 \\quad (\\text{actual: } e^{0.2} \\approx 1.2214)', annotation: 'Estimate e^0.2. Error ≈ 0.021 (1.7% relative error). Decent for x = 0.2.', hints: ['Substitute x = 0.2.'] },
        { expression: 'e^{0.01} \\approx 1 + 0.01 = 1.01 \\quad (\\text{actual: } e^{0.01} \\approx 1.01005)', annotation: 'Estimate e^0.01. Error ≈ 0.00005 (0.005% relative error). Excellent for x = 0.01.', hints: ['Substitute x = 0.01.'] },
      ],
      conclusion: 'e^x ≈ 1 + x for small x is the cornerstone of many calculations in finance, physics, and statistics. The relative error is approximately x²/2 (from the quadratic term e^x ≈ 1 + x + x²/2 + ...), so the approximation 1 + x improves rapidly as x → 0.',
    },
    {
      id: 'ch3-001-ex4',
      title: 'Differentials: Comparing Δy and dy',
      problem: '\\text{Let } y = x^3 - 2x + 1. \\text{ Find } dy \\text{ when } x = 2 \\text{ and } dx = 0.1. \\text{ Compute the exact } \\Delta y \\text{ and compare.}',
      steps: [
        { expression: "y' = 3x^2 - 2", annotation: 'Differentiate y with respect to x.', hints: ['Power rule for x³ and -2x.'] },
        { expression: "y'(2) = 3(4) - 2 = 10", annotation: 'Evaluate the derivative at x = 2.', hints: ['Find the local slope.'] },
        { expression: 'dy = y\'(2) \\cdot dx = 10 \\cdot 0.1 = 1.0', annotation: 'The differential dy = f\'(x)·dx gives the change along the tangent line.', hints: ['Calculate dy = f\'(x)dx.', 'This is the "predicted" change if the curve were a line.'] },
        { expression: 'y(2) = 8 - 4 + 1 = 5', annotation: 'Current function value at x = 2.', hints: ['Evaluate the original function at x = 2.'] },
        { expression: 'y(2.1) = (2.1)^3 - 2(2.1) + 1 = 9.261 - 4.2 + 1 = 6.061', annotation: 'Exact function value at x = 2.1.', hints: ['Evaluate the original function at x = 2.1.', 'This is the "actual" final position.'] },
        { expression: '\\Delta y = y(2.1) - y(2) = 6.061 - 5 = 1.061', annotation: 'The actual change in y.', hints: ['Subtract the initial value from the final value.'] },
        { expression: '\\text{Error} = \\Delta y - dy = 1.061 - 1.0 = 0.061', annotation: 'The differential underestimates the actual change. The error is (dx)² times f\'\'(x)/2 ≈ 6·(0.1)²/2 = 0.03 (slightly off because we\'re not exactly at x=2 for the second derivative).', hints: ['Compare the actual change with the linear prediction.', 'The error is the difference between the curve and the tangent.'] },
      ],
      conclusion: 'The differential dy = 1.0 approximates the actual Δy = 1.061 with error 0.061. The relative error is about 5.8% — noticeable because dx = 0.1 is not very small and f\'\'(x) = 6x is large (= 12 at x = 2). For dx = 0.01, the error would be about 0.006 (squared factor) — much smaller.',
    },
    {
      id: 'ch3-001-ex5',
      title: 'Error Propagation: Volume of a Sphere',
      problem: '\\text{A sphere\'s radius is measured as } r = 10 \\text{ cm with error } \\pm 0.05 \\text{ cm. Estimate the error in the calculated volume.}',
      steps: [
        { expression: 'V = \\frac{4}{3}\\pi r^3', annotation: 'Volume of a sphere.', hints: ['Standard volume formula.'] },
        { expression: '\\frac{dV}{dr} = 4\\pi r^2', annotation: 'Derivative of V with respect to r (surface area).', hints: ['Power rule for r³.'] },
        { expression: 'dV = 4\\pi r^2 \\cdot dr', annotation: 'The differential dV gives the approximate error in V due to error dr in r.', hints: ['Rewrite in differential form: dV = V\'(r)dr.'] },
        { expression: 'dV \\approx 4\\pi(10)^2(\\pm 0.05) = \\pm 4\\pi(100)(0.05) = \\pm 20\\pi \\approx \\pm 62.8 \\text{ cm}^3', annotation: 'Substitute r = 10 and dr = ±0.05.', hints: ['Plug in the nominal radius and the measurement error.'] },
        { expression: '\\text{Relative error} = \\frac{|dV|}{V} = \\frac{20\\pi}{\\frac{4}{3}\\pi(1000)} = \\frac{20}{\\frac{4000}{3}} = \\frac{60}{4000} = 1.5\\%', annotation: 'The relative error in V is 3 times the relative error in r (0.5%). This factor of 3 comes from the exponent 3 in V = (4/3)πr³.', hints: ['Divide the error by the total volume.', 'Observe how original percentage error scales.'] },
      ],
      conclusion: 'A 0.5% error in radius (0.05 cm out of 10 cm) produces approximately a 1.5% error in volume — exactly 3× the relative radius error, as expected from the differential of r³. This factor-of-exponent rule generalizes: if V = r^n, then dV/V = n·(dr/r).',
    },
    {
      id: 'ch3-001-ex6',
      title: 'Linearize ln(x) at a = 1',
      problem: '\\text{Find the linearization of } f(x) = \\ln(x) \\text{ at } a = 1. \\text{ Estimate } \\ln(1.1) \\text{ and } \\ln(0.9).',
      steps: [
        { expression: 'f(1) = \\ln(1) = 0, \\quad f\'(x) = \\frac{1}{x}, \\quad f\'(1) = 1', annotation: 'Evaluate at a = 1.', hints: ['Evaluate ln(1).', 'Differentiate ln(x) and evaluate at 1.'] },
        { expression: 'L(x) = 0 + 1 \\cdot (x - 1) = x - 1', annotation: 'Linearization: L(x) = x - 1. Equivalently, ln(x) ≈ x - 1 near x = 1, or ln(1+u) ≈ u near u = 0.', hints: ['Simplify the tangent line equation.'] },
        { expression: '\\ln(1.1) \\approx L(1.1) = 0.1 \\quad (\\text{actual: } 0.09531...)', annotation: 'Estimate ln(1.1). Error ≈ 0.0047 — about 5% relative error.', hints: ['Substitute x = 1.1.'] },
        { expression: '\\ln(0.9) \\approx L(0.9) = -0.1 \\quad (\\text{actual: } -0.10536...)', annotation: 'Estimate ln(0.9). Error ≈ 0.005 — about 5% relative error.', hints: ['Substitute x = 0.9.'] },
      ],
      conclusion: 'ln(x) ≈ x - 1 near x = 1 (equivalently, ln(1+u) ≈ u for small u). The approximation has about 5% error for u = ±0.1. The error is ln(1+u) - u = -u²/2 + u³/3 - ... ≈ -u²/2 for small u, so for u = 0.1 the error is about -0.005 — the linear approximation overestimates |ln(0.9)| and underestimates ln(1.1).',
    },
    {
      id: 'ch3-001-ex7',
      title: 'Error in sin(30°) from a 2° Angle Error',
      problem: '\\text{A 30° angle is measured with error } \\pm 2°. \\text{ Estimate the error in sin(30°). Convert to radians first.}',
      steps: [
        { expression: '30° = \\frac{\\pi}{6} \\text{ rad}, \\quad 2° = \\frac{\\pi}{90} \\text{ rad} \\approx 0.03491 \\text{ rad}', annotation: 'Convert to radians. Calculus must be done in radians — the derivative formulas for trig functions only hold in radian measure.', hints: ['Always convert to radians for calculus.', 'Multiply by π/180.'] },
        { expression: 'f(\\theta) = \\sin(\\theta), \\quad f\'(\\theta) = \\cos(\\theta)', annotation: 'The relevant derivative.', hints: ['Identify the function and its derivative.'] },
        { expression: 'd(\\sin\\theta) = \\cos(\\theta)\\,d\\theta', annotation: 'Write the differential.', hints: ['dy = f\'(x)dx.'] },
        { expression: '\\text{Error} \\approx |\\cos(\\pi/6)| \\cdot (\\pi/90) = \\frac{\\sqrt{3}}{2} \\cdot \\frac{\\pi}{90} \\approx 0.8660 \\cdot 0.03491 \\approx \\pm 0.03023', annotation: 'Substitute θ = π/6 and dθ = π/90.', hints: ['Plug in the radian values.'] },
        { expression: '\\text{Relative error} = \\frac{0.03023}{\\sin(\\pi/6)} = \\frac{0.03023}{0.5} \\approx 6.05\\%', annotation: 'A 2° error (6.67% relative error in angle) produces about 6% relative error in the sine value.', hints: ['Divide the predicted error by the actual value (0.5).'] },
      ],
      conclusion: 'A 2° error in measuring a 30° angle produces about ±0.030 error in sin(30°), a 6% relative error. The factor cos(π/6) ≈ 0.866 moderates the error — if the angle were near 0°, cos(θ) ≈ 1 and the error in sin(θ) would equal the error in θ in radians. Near 90°, cos(θ) ≈ 0 and the error in sin(θ) is negligible — the function is nearly flat.',
    },
  ],

  challenges: [
    {
      id: 'ch3-001-ch1',
      difficulty: 'medium',
      problem: 'Use linearization to estimate (1.001)^{1000}. [Hint: use (1+x)^n ≈ 1+nx near x = 0 with x = 0.001, n = 1000.]',
      hint: 'The linearization of (1+x)^n at x = 0 is 1 + nx. With x = 0.001 and n = 1000, this gives 1 + 1000·0.001 = 2. But is this a good approximation? Think about what (1 + 1/n)^n converges to as n → ∞.',
      walkthrough: [
        { expression: 'f(x) = (1+x)^{1000}, \\quad f\'(x) = 1000(1+x)^{999}', annotation: 'Identify f and compute f\'.', hints: ['The function is a power of (1+x).', 'Use the power rule and chain rule.'] },
        { expression: 'L(x) = f(0) + f\'(0) \\cdot x = 1 + 1000x', annotation: 'Linearization at a = 0: f(0) = 1, f\'(0) = 1000.', hints: ['Evaluate f(0) and f\'(0).'] },
        { expression: '(1.001)^{1000} \\approx L(0.001) = 1 + 1000(0.001) = 1 + 1 = 2', annotation: 'Apply the linearization with x = 0.001.', hints: ['Substitute x = 0.001.'] },
        { expression: '\\text{Actual value: } (1.001)^{1000} = e^{1000\\ln(1.001)} \\approx e^{1000 \\cdot 0.0009995} \\approx e^{0.9995} \\approx 2.7169', annotation: 'The actual value is about 2.717 — close to e! The linear approximation gave 2, which is off by ~27%. This is a case where the linear approximation is not very accurate: x = 0.001 is small, but the EXPONENT 1000 amplifies the error.', hints: ['Compare your estimate with a calculator or the property of e.'] },
        { expression: '(1 + 1/n)^n \\to e \\text{ as } n \\to \\infty', annotation: 'This is the definition of e. With n = 1000, (1+1/1000)^1000 ≈ e^1 = 2.718... The linear approximation misses this because it only captures the first-order term; (1+x)^n for large n requires higher-order terms.', hints: ['Recall the limit definition of e.'] },
      ],
      answer: 'Linear approximation gives 2; actual value ≈ 2.717. The linear approximation is poor here because the correction terms (of order x² = 0.000001) are amplified by the large exponent (1000). The problem illustrates the limit of validity of first-order approximations when n is large.',
    },
    {
      id: 'ch3-001-ch2',
      difficulty: 'hard',
      problem: 'Prove: if f is differentiable at a, then f is continuous at a. Use the linear approximation definition of differentiability.',
      hint: 'Write f(x) = f(a) + f\'(a)(x-a) + ε(x)(x-a) where ε(x) → 0 as x → a. Then take the limit of f(x) as x → a.',
      walkthrough: [
        { expression: 'f(x) = f(a) + f\'(a)(x-a) + \\varepsilon(x)(x-a) \\text{ where } \\varepsilon(x) \\to 0 \\text{ as } x \\to a', annotation: 'This is the definition of differentiability at a: the error in the linear approximation goes to 0 faster than |x-a|.', hints: ['The "error term" ε is defined to shrink to zero.'] },
        { expression: '\\lim_{x \\to a} f(x) = \\lim_{x \\to a} \\left[f(a) + f\'(a)(x-a) + \\varepsilon(x)(x-a)\\right]', annotation: 'Take the limit of both sides as x → a.', hints: ['We want to show this limit equals f(a).'] },
        { expression: '= f(a) + f\'(a) \\cdot \\lim_{x \\to a}(x-a) + \\lim_{x \\to a}[\\varepsilon(x)(x-a)]', annotation: 'Split the limit (using limit laws, valid since each piece converges).', hints: ['Apply limit theorems for sums and products.'] },
        { expression: '\\lim_{x \\to a}(x-a) = 0', annotation: 'The factor (x-a) → 0 as x → a.', hints: ['Simple substitution.'] },
        { expression: '\\left|\\varepsilon(x)(x-a)\\right| \\leq |\\varepsilon(x)| \\cdot |x-a| \\to 0 \\cdot 0 = 0', annotation: 'Since ε(x) → 0 and (x-a) → 0, their product → 0.', hints: ['Both factors of the last term go to zero.'] },
        { expression: '\\therefore \\lim_{x \\to a} f(x) = f(a) + 0 + 0 = f(a)', annotation: 'The limit equals f(a) — precisely the definition of continuity at a.', hints: ['Conclusion: the function is smooth enough to be continuous.'] },
      ],
      answer: 'If f is differentiable at a, then f(x) = f(a) + f\'(a)(x-a) + ε(x)(x-a) with ε(x) → 0. Taking x → a, both (x-a) → 0 and ε(x)(x-a) → 0, so f(x) → f(a). Therefore f is continuous at a. ∎',
    },
    {
      id: 'ch3-001-ch3',
      difficulty: 'medium',
      problem: 'The period of a pendulum is T = 2π√(L/g). If L is measured as 1 m with error ±1 cm, find the approximate error in T. Take g = 9.8 m/s².',
      hint: 'Compute dT/dL and multiply by dL = 0.01 m.',
      walkthrough: [
        { expression: 'T = 2\\pi\\sqrt{\\frac{L}{g}} = \\frac{2\\pi}{\\sqrt{g}} \\cdot L^{1/2}', annotation: 'Write T as a function of L (g is fixed).', hints: ['Treat T as being dependent only on L.'] },
        { expression: '\\frac{dT}{dL} = \\frac{2\\pi}{\\sqrt{g}} \\cdot \\frac{1}{2\\sqrt{L}} = \\frac{\\pi}{\\sqrt{gL}}', annotation: 'Differentiate T with respect to L.', hints: ['Power rule for L^(1/2).'] },
        { expression: 'dT = \\frac{\\pi}{\\sqrt{gL}} \\cdot dL', annotation: 'Write the differential.', hints: ['dT = T\'(L)dL.'] },
        { expression: 'T(1) = 2\\pi\\sqrt{1/9.8} \\approx 2\\pi(0.3194) \\approx 2.007 \\text{ s}', annotation: 'Compute the nominal period at L = 1 m.', hints: ['Calculate the "centered" period value.'] },
        { expression: 'dT = \\frac{\\pi}{\\sqrt{9.8 \\cdot 1}} \\cdot (\\pm 0.01) = \\frac{\\pi}{\\sqrt{9.8}} \\cdot 0.01 \\approx \\frac{3.1416}{3.130} \\cdot 0.01 \\approx \\pm 0.01004 \\text{ s}', annotation: 'Substitute L = 1, g = 9.8, dL = ±0.01.', hints: ['Substitute measurement and error.'] },
        { expression: '\\text{Relative error} = \\frac{|dT|}{T} \\approx \\frac{0.01004}{2.007} \\approx 0.5\\%', annotation: 'The relative error in T equals half the relative error in L (because T ∝ L^{1/2}: the exponent 1/2 scales the relative error).', hints: ['Observe the scaling: 1% error in L becomes 0.5% in T.'] },
      ],
      answer: 'dT ≈ ±0.010 s. The 1% relative error in L (1 cm out of 1 m) produces about 0.5% relative error in T — half as much, because T depends on √L. Precise: relative error in T = (1/2)·(relative error in L).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'tangent-problem', label: 'The Derivative', context: 'The linearization IS the tangent line. Understanding the derivative as slope of the tangent line is essential for this lesson.' },
    { lessonSlug: 'curve-sketching', label: 'Curve Sketching', context: 'Linear approximation gives local information about the function; curve sketching uses first and second derivatives for global information.' },
    { lessonSlug: 'lhopital', label: "L'Hôpital's Rule", context: "L'Hôpital's rule can be understood as a consequence of linear approximation: f(x)/g(x) ≈ f'(c)(x-c)/[g'(c)(x-c)] = f'(c)/g'(c) near a zero of both f and g." },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "L(x) = f(a) + f'(a)(x-a)",
            "meaning": "the linearization — the tangent line at x=a used as an approximation to f near a"
        },
        {
            "symbol": "Δy ≈ f'(x)·Δx",
            "meaning": "the differential approximation: output change ≈ derivative × input change"
        },
        {
            "symbol": "error",
            "meaning": "the difference between the true value f(x) and the linear approximation L(x) — grows as (x-a)²"
        }
    ],
    "rulesOfThumb": [
        "The approximation is most accurate when x is close to a. Quality degrades as |x-a| increases.",
        "Differentials df = f'(x)dx are the infinitesimal version of the same idea.",
        "In physics and engineering, linear approximation is used constantly to simplify nonlinear equations."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { label: 'Tangent Line (Ch. 2)', note: 'Linear approximation IS the tangent line repackaged as a practical tool: L(x) = f(a) + f\'(a)(x − a)' },
      { label: 'Differentiability (Ch. 2)', note: 'The approximation only works because differentiability means the function looks like its tangent line locally' },
      { label: 'Mean Value Theorem (Lesson 1)', note: 'MVT lets us bound the approximation error: |f(x) − L(x)| ≤ M/2 · (x − a)² where M = max|f\'\'| on [a, x]' },
    ],
    futureLinks: [
      { label: 'Differentials (Lesson 3)', note: 'Differentials are linear approximation written in dy/dx form: dy = f\'(a)dx. Same idea, different notation, used in engineering' },
      { label: 'Related Rates (Lesson 4)', note: 'Many related-rates problems use linear approximation to estimate how one rate affects another for small changes' },
      { label: 'Taylor Series (Ch. 5)', note: 'Linear approximation is the degree-1 Taylor polynomial. Chapter 5 extends this to any degree for better accuracy' },
    ],
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "la-assess-1",
            "type": "input",
            "text": "Find the linearization of f(x) = √x at a = 4.",
            "answer": "L(x) = 2 + (1/4)(x-4)",
            "hint": "f(4)=2, f'(x)=1/(2√x), f'(4)=1/4. L(x) = 2 + (1/4)(x-4)."
        },
        {
            "id": "la-assess-2",
            "type": "input",
            "text": "Use linear approximation to estimate √4.1.",
            "answer": "2.025",
            "hint": "L(4.1) = 2 + (1/4)(4.1-4) = 2 + 0.025 = 2.025."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Linearization = tangent line used as an approximating function",
    "L(x) = f(a) + f'(a)(x-a)",
    "df = f'(x)dx (differential form)",
    "Error grows like (x-a)² — good near a, poor far away"
],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'completed-example-6',
    'completed-example-7',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
    'attempted-challenge-medium-2',
  ],

  quiz: [
    {
      id: 'la-q1',
      type: 'input',
      text: 'Write the linearization formula: $L(x) = f(a) + f\'(a)(x - a)$. For $f(x) = \\sqrt{x}$ at $a = 25$, compute $f\'(25)$. Enter the value.',
      answer: '1/10',
      hints: [
        '$f(x) = x^{1/2}$, so $f\'(x) = \\frac{1}{2}x^{-1/2} = \\frac{1}{2\\sqrt{x}}$.',
        'At $x = 25$: $f\'(25) = \\frac{1}{2\\cdot 5} = \\frac{1}{10}$.',
      ],
      reviewSection: 'Intuition — Estimating $\\sqrt{26}$',
    },
    {
      id: 'la-q2',
      type: 'input',
      text: 'Using $f(x) = \\sqrt{x}$, $a = 25$, $f(25) = 5$, $f\'(25) = 1/10$: the linearization is $L(x) = 5 + \\frac{1}{10}(x-25)$. Use it to approximate $\\sqrt{26}$. Enter the decimal value.',
      answer: '5.1',
      hints: [
        'Substitute $x = 26$: $L(26) = 5 + \\frac{1}{10}(1) = 5.1$.',
      ],
      reviewSection: 'Intuition — Estimating $\\sqrt{26}$',
    },
    {
      id: 'la-q3',
      type: 'input',
      text: 'Use linear approximation for $f(x) = x^{1/3}$ at $a = 8$ to approximate $\\sqrt[3]{8.06}$. First find $f\'(8)$, then compute $L(8.06)$. Enter the approximation.',
      answer: '2.005',
      hints: [
        '$f\'(x) = \\frac{1}{3}x^{-2/3}$, so $f\'(8) = \\frac{1}{3 \\cdot 4} = \\frac{1}{12}$.',
        '$L(8.06) = 2 + \\frac{1}{12}(0.06) = 2 + 0.005 = 2.005$.',
      ],
      reviewSection: 'Examples — Cube root approximation',
    },
    {
      id: 'la-q4',
      type: 'input',
      text: 'Find the linearization of $f(x) = e^x$ at $a = 0$. Use it to approximate $e^{0.1}$. Enter the approximation.',
      answer: '1.1',
      hints: [
        '$f(0) = 1$, $f\'(0) = 1$, so $L(x) = 1 + x$.',
        '$L(0.1) = 1 + 0.1 = 1.1$.',
      ],
      reviewSection: 'Intuition — Standard linearizations at $x = 0$',
    },
    {
      id: 'la-q5',
      type: 'input',
      text: 'For $f(x) = \\sin x$ near $a = 0$, the linearization is $L(x) = x$ (since $\\sin 0 = 0$ and $\\cos 0 = 1$). Use this to approximate $\\sin(0.05)$. Enter the value.',
      answer: '0.05',
      hints: [
        '$L(0.05) = 0.05$ — just substitute directly into $L(x) = x$.',
      ],
      reviewSection: 'Intuition — Standard linearizations at $x = 0$',
    },
    {
      id: 'la-q6',
      type: 'choice',
      text: 'The differential $dy$ and the actual change $\\Delta y$ satisfy which relationship for small $dx$?',
      options: [
        '$dy = \\Delta y$ exactly, always',
        '$dy \\approx \\Delta y$; they differ by approximately $\\frac{1}{2}f\'\'(x)(dx)^2$',
        '$dy > \\Delta y$ always',
        '$dy = 0$ when $dx$ is small',
      ],
      answer: '$dy \\approx \\Delta y$; they differ by approximately $\\frac{1}{2}f\'\'(x)(dx)^2$',
      hints: [
        '$dy = f\'(x)\\,dx$ is the change along the tangent line; $\\Delta y$ is the actual change in $f$.',
        'The error is $\\Delta y - dy \\approx \\frac{1}{2}f\'\'(x)(dx)^2$ by Taylor\'s theorem.',
      ],
      reviewSection: 'Intuition — $dy \\ne \\Delta y$',
    },
    {
      id: 'la-q7',
      type: 'input',
      text: 'For $y = x^3$, compute the differential $dy$ at $x = 2$ with $dx = 0.01$.',
      answer: '0.12',
      hints: [
        '$dy = f\'(x)\\,dx = 3x^2\\,dx$.',
        'At $x=2$, $dx=0.01$: $dy = 3(4)(0.01) = 0.12$.',
      ],
      reviewSection: 'Math — The differential $dy = f\'(x)\\,dx$',
    },
    {
      id: 'la-q8',
      type: 'choice',
      text: 'The linearization $L(x) = f(a) + f\'(a)(x-a)$ is geometrically the same as which of these?',
      options: [
        'The secant line through $(a, f(a))$ and $(a+1, f(a+1))$',
        'The tangent line to $f$ at the point $(a, f(a))$',
        'The horizontal line $y = f(a)$',
        'The normal line to $f$ at $x = a$',
      ],
      answer: 'The tangent line to $f$ at the point $(a, f(a))$',
      hints: [
        'Point-slope form of the tangent line at $(a, f(a))$ with slope $f\'(a)$: $y - f(a) = f\'(a)(x-a)$, i.e. $y = f(a) + f\'(a)(x-a) = L(x)$.',
      ],
      reviewSection: 'Intuition — This is the point-slope tangent line',
    },
    {
      id: 'la-q9',
      type: 'input',
      text: 'The volume of a sphere is $V = \\frac{4}{3}\\pi r^3$. Use the differential $dV = 4\\pi r^2\\,dr$ to estimate the change in volume when $r = 3$ cm increases by $dr = 0.02$ cm. Enter the approximate change in cm³.',
      answer: '0.72*pi',
      hints: [
        '$dV = 4\\pi(3)^2(0.02) = 4\\pi(9)(0.02) = 0.72\\pi$.',
      ],
      reviewSection: 'Intuition — Error analysis with differentials',
    },
    {
      id: 'la-q10',
      type: 'input',
      text: 'For $f(x) = \\ln x$ at $a = 1$, find $f\'(1)$ and write $L(x)$. Use $L(x)$ to approximate $\\ln(1.2)$. Enter the approximation.',
      answer: '0.2',
      hints: [
        '$f\'(x) = 1/x$, so $f\'(1) = 1$. Then $L(x) = 0 + 1\\cdot(x-1) = x-1$.',
        '$L(1.2) = 1.2 - 1 = 0.2$.',
      ],
      reviewSection: 'Intuition — Standard linearizations at $x = 0$',
    },
  ],
}
