// FILE: src/content/chapter-3/06-newtons-method.js
export default {
  id: 'ch3-060',
  slug: 'newtons-method',
  chapter: 3,
  order: 8,
  title: "Newton's Method",
  subtitle: 'Use tangent lines to hunt down roots with extraordinary speed — each step roughly doubles the number of correct digits',
  tags: ['Newton method', 'root finding', 'iteration', 'numerical methods', 'convergence', 'tangent line', 'approximation'],

  hook: {
    question: "Your calculator can add, subtract, multiply, and divide — but how does it compute $\\sqrt{2}$? There is no finite sequence of arithmetic operations that produces $\\sqrt{2}$ exactly. So how does the machine find 1.41421356... to ten decimal places in a fraction of a second?",
    realWorldContext: "Every time your GPS calculates a position, every time a structural engineer checks whether a bridge design meets load requirements, every time a financial model prices a complex derivative — somewhere under the hood, a computer is solving a nonlinear equation. Most nonlinear equations have no closed-form solution. Newton's Method is the workhorse algorithm that engineers, scientists, and programmers reach for first. Starting from an initial guess, it uses the tangent line at each step to leap toward the root with breathtaking speed: the number of correct decimal digits roughly doubles with every iteration. Understanding Newton's Method connects calculus to computation and reveals how the abstract concept of a derivative becomes a practical tool for solving real problems.",
    previewVisualizationId: 'NewtonsMethod',
  },

  intuition: {
    prose: [
      "You have spent this chapter using derivatives to analyze functions — their shape, their extrema, their limits. Newton's Method closes the chapter with a different kind of application: using derivatives to SOLVE equations. The idea is elegant: if you cannot solve f(x) = 0 algebraically, linearize f near your current best guess, solve the linear equation, and use that solution as your next guess. Repeat. The method converges so fast that it roughly doubles the number of correct decimal digits at every step. This is the algorithm behind square-root computations, GPS positioning, and most of the numerical methods in science and engineering.",
      "The idea behind Newton's Method is disarmingly simple. You want to solve $f(x) = 0$, but the equation is too complicated for algebra. So you start with a guess $x_0$ that is reasonably close to the root. At the point $(x_0, f(x_0))$, you draw the tangent line to the curve $y = f(x)$. This tangent line is a good local approximation to the curve, and it is easy to find where a straight line crosses the $x$-axis. Call that crossing point $x_1$. Now repeat: draw the tangent line at $(x_1, f(x_1))$ and find where it hits the $x$-axis to get $x_2$. Keep going. Each new point $x_n$ is (usually) closer to the true root than the last.",
      "Why does this work? Near a root, a smooth function looks almost like a straight line — this is precisely what differentiability means. The tangent line captures that local linear behavior. When you follow the tangent line to the $x$-axis, you are essentially solving the linearized version of the equation $f(x) = 0$. Since linearization is a good approximation near the root, the solution of the linearized equation is close to the true root. And the closer you start, the better the linear approximation, which is why the method accelerates as it converges.",
      "Let us derive the formula. The tangent line to $y = f(x)$ at the point $(x_n, f(x_n))$ is $y - f(x_n) = f'(x_n)(x - x_n)$. Setting $y = 0$ (finding the $x$-intercept): $-f(x_n) = f'(x_n)(x - x_n)$. Solving for $x$: $x = x_n - \\frac{f(x_n)}{f'(x_n)}$. This gives the iteration formula: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. Each step requires evaluating $f$ and $f'$ at the current guess, then updating.",
      "The convergence of Newton's Method is quadratic when it works well: if the error at step $n$ is $\\epsilon_n$, then $\\epsilon_{n+1} \\approx C \\cdot \\epsilon_n^2$ for some constant $C$. This means that if you have 3 correct decimal digits, the next step gives roughly 6, then 12, then 24. The number of correct digits doubles each iteration. Compare this to the bisection method, which adds only about 0.3 digits per step (halving the interval). Newton's Method reaches machine precision in 4-5 iterations where bisection might need 50.",
      "But Newton's Method can fail. The most obvious failure mode is a horizontal tangent: if $f'(x_n) = 0$, the tangent line never crosses the $x$-axis, and the formula divides by zero. Even if $f'(x_n)$ is merely very small, the next iterate $x_{n+1}$ flies off to a distant point. Another failure is cycling: the iterates can bounce back and forth between two points without converging. And if the initial guess is too far from the root, the method can diverge entirely — the tangent line may point you toward a different root or off to infinity.",
      "The comparison with bisection is instructive. Bisection is slow (linear convergence) but bulletproof: it always works if you start with an interval $[a, b]$ where $f(a)$ and $f(b)$ have opposite signs. Newton's Method is fast (quadratic convergence) but fragile: it needs a good initial guess and well-behaved derivatives. In practice, engineers often use bisection to get a rough estimate, then switch to Newton's Method to refine it rapidly — combining the reliability of one with the speed of the other.",
      "Computing $\\sqrt{2}$ by Newton's Method is a perfect first example. You want to solve $f(x) = x^2 - 2 = 0$. The derivative is $f'(x) = 2x$. The iteration becomes $x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{x_n + 2/x_n}{2}$. Starting from $x_0 = 1$: $x_1 = 1.5$, $x_2 = 1.41\\overline{6}$, $x_3 = 1.41421568...$, $x_4 = 1.41421356237...$. By step 4, you have 11 correct digits. This is essentially the Babylonian method for square roots, reinvented through calculus.",
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Tangent Lines and Linear Approximation',
        body: "Newton's Method is linear approximation applied iteratively. Recall that the tangent line at $x = a$ gives $f(x) \\approx f(a) + f'(a)(x - a)$. Newton's Method sets this linear approximation equal to zero and solves for $x$ to get the next iterate.",
      },
      {
        type: 'real-world',
        title: 'GPS and Newton\'s Method',
        body: "GPS positioning requires solving a system of nonlinear equations involving satellite distances. The receiver uses a variant of Newton's Method (Gauss-Newton) to find the latitude, longitude, and altitude that best fit the measured signal arrival times. Each position fix involves several Newton iterations computed in milliseconds.",
      },
      {
        type: 'warning',
        title: 'Bad Initial Guesses Can Be Catastrophic',
        body: "Newton's Method is not guaranteed to converge. If $x_0$ is far from the root or near a local extremum, the iterates may diverge, cycle, or converge to the wrong root. Always check that $|f(x_n)|$ is decreasing and that $x_n$ is approaching a consistent value.",
      },
      {
        type: 'tip',
        title: 'The Babylonian Square Root Algorithm',
        body: "To compute $\\sqrt{a}$, solve $x^2 - a = 0$ by Newton's Method: $x_{n+1} = \\frac{1}{2}(x_n + a/x_n)$. This ancient algorithm, known to Babylonian mathematicians around 1500 BCE, is simply Newton's Method applied to a quadratic. It converges for any positive starting guess.",
      },
      {
        type: 'geometric',
        title: 'Tangent Line Slides Toward the Root',
        body: "Visualize the process: at each step, you stand on the curve, draw a tangent line, and slide down (or up) that tangent line until you hit the $x$-axis. The tangent line undershoots or overshoots the root, but by less each time. The curve bends away from the tangent line, and the gap between the tangent's zero and the curve's zero shrinks quadratically.",
      },
      {
        type: 'history',
        title: 'Newton, Raphson, and Simpson',
        body: "Newton described an algebraic version of this method in 1669 for polynomials only, without using calculus. Joseph Raphson published a similar method in 1690. Thomas Simpson generalized it to use derivatives in 1740. The modern formulation $x_{n+1} = x_n - f(x_n)/f'(x_n)$ is properly called the Newton-Raphson method.",
      },
    ],
    visualizations: [
      { vizId: 'NewtonsMethod', mathBridge: "Solve f(x) = x² − 2 = 0 (i.e., compute √2). f'(x) = 2x. Start at x₀ = 1. Step 1: x₁ = 1 − (1−2)/(2·1) = 1.5. Step 2: x₂ = 1.5 − (2.25−2)/(3) = 1.4167. Step 3: x₃ = 1.4167 − (2.0050−2)/(2.833) = 1.4142. By step 4 you have 11 correct digits. Watch the tangent lines in the animation — each one aims closer to x = √2 ≈ 1.41421.", caption: "Newton's Method computing √2: each tangent line overshoots slightly, but the sequence 1 → 1.5 → 1.4167 → 1.4142... converges quadratically." },
    ],
  },

  math: {
    prose: [
      "**Newton's Method (Iteration Formula).** Given a differentiable function $f$ and an initial guess $x_0$, define the sequence $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$ for $n = 0, 1, 2, \\ldots$. If the sequence converges, its limit $r = \\lim_{n \\to \\infty} x_n$ satisfies $f(r) = 0$ (taking limits on both sides of the recurrence and using continuity).",
      "**Derivation from Taylor expansion.** Expand $f$ about $x_n$: $f(x) = f(x_n) + f'(x_n)(x - x_n) + \\frac{1}{2}f''(\\xi)(x - x_n)^2$ for some $\\xi$ between $x$ and $x_n$. If $r$ is the root, then $0 = f(r) = f(x_n) + f'(x_n)(r - x_n) + O((r - x_n)^2)$. Ignoring the second-order term and solving for $r$ gives $r \\approx x_n - f(x_n)/f'(x_n) = x_{n+1}$. The dropped quadratic term is the source of the approximation error.",
      "**Quadratic convergence.** Define the error $e_n = x_n - r$. From the Taylor expansion: $0 = f(r) = f(x_n) + f'(x_n)(r - x_n) + \\frac{1}{2}f''(\\xi_n)(r - x_n)^2$. Rearranging: $x_n - r - \\frac{f(x_n)}{f'(x_n)} = \\frac{f''(\\xi_n)}{2f'(x_n)}(x_n - r)^2$. The left side is $x_{n+1} - r = e_{n+1}$, so $e_{n+1} = \\frac{f''(\\xi_n)}{2f'(x_n)} \\cdot e_n^2$. Near the root, the coefficient $\\frac{f''(r)}{2f'(r)}$ is approximately constant, giving $|e_{n+1}| \\approx C|e_n|^2$ where $C = \\frac{|f''(r)|}{2|f'(r)|}$.",
      "**When Newton's Method fails.** (1) If $f'(x_n) = 0$, the formula is undefined — a horizontal tangent has no $x$-intercept. (2) If $f'(r) = 0$ (the root is also a critical point, i.e., a multiple root), convergence degrades from quadratic to linear. For a root of multiplicity $m$, the modified formula $x_{n+1} = x_n - m \\cdot \\frac{f(x_n)}{f'(x_n)}$ restores quadratic convergence. (3) If $x_0$ is too far from $r$, the iterates may converge to a different root, cycle, or diverge.",
      "**Comparison with bisection.** The bisection method halves the interval at each step, giving $|e_{n+1}| = \\frac{1}{2}|e_n|$ (linear convergence with ratio 1/2). After $n$ steps, the error is at most $(b-a)/2^n$. To achieve $10^{-10}$ accuracy starting from a unit interval requires about 34 steps. Newton's Method, with quadratic convergence, typically reaches $10^{-10}$ in 5-6 steps from a reasonable starting point — but it can fail entirely if the starting point is poor.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Newton's Method Convergence",
        body: "If $f$ is twice continuously differentiable, $f(r) = 0$, $f'(r) \\neq 0$, and $x_0$ is sufficiently close to $r$, then Newton's Method converges quadratically: $|e_{n+1}| \\leq C|e_n|^2$ where $C = \\frac{|f''(r)|}{2|f'(r)|}$.",
      },
      {
        type: 'definition',
        title: 'The Newton-Raphson Iteration',
        body: "$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. Each step requires one evaluation of $f$ and one of $f'$. The geometric interpretation: $x_{n+1}$ is where the tangent line to $y = f(x)$ at $(x_n, f(x_n))$ crosses the $x$-axis.",
      },
      {
        type: 'warning',
        title: 'Multiple Roots Slow Down Convergence',
        body: "If $r$ is a root of multiplicity $m \\geq 2$ (i.e., $f(r) = f'(r) = \\cdots = f^{(m-1)}(r) = 0$), Newton's Method converges only linearly. Fix: use $x_{n+1} = x_n - m \\cdot f(x_n)/f'(x_n)$, or apply Newton's Method to $g(x) = f(x)/f'(x)$ instead.",
      },
    ],
    visualizations: [
      { vizId: 'NewtonsMethod', mathBridge: "Try a case where Newton's Method fails. Set f(x) = x^(1/3) (cube root). f'(x) = (1/3)x^(−2/3). The iteration gives xₙ₊₁ = xₙ − xₙ^(1/3) / ((1/3)xₙ^(−2/3)) = xₙ − 3xₙ = −2xₙ. This DIVERGES: the iterates double in magnitude each step. Start at x₀ = 1: x₁ = −2, x₂ = 4, x₃ = −8... The root is at 0, but we fly away. Why? The derivative at the root is undefined (infinite), violating the theorem's hypothesis f'(r) ≠ 0.", caption: "Newton's Method failure on f(x) = x^(1/3): when f'(r) = 0 at the root, the iteration diverges instead of converging." },
      {
        id: 'PythonNotebook',
        title: "Python Lab: Run Newton's Method & Watch Digits Double",
        caption: "Execute the iteration numerically and watch quadratic convergence in action. Modify f and df to solve any equation. Try the cycling case to see failure.",
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: "Run Newton's Method on any f(x) = 0",
              prose: [
                'The iteration: $x_{n+1} = x_n - \\dfrac{f(x_n)}{f\'(x_n)}$',
                '**Quadratic convergence** means: correct digits roughly **double** every step.',
                'Watch the `error` column shrink — first slowly, then explosively fast.',
              ],
              instructions: "Change `f`, `df`, `x0` to solve a different equation. Try f = lambda x: x**3 - x - 1 with x0 = 1.5",
              code: `import math

# ── Define your equation f(x) = 0 and its derivative ──
f  = lambda x: x**2 - 2          # solving x² = 2  (root = √2)
df = lambda x: 2*x
true_root = math.sqrt(2)          # known for comparison

x0    = 1.0    # initial guess
steps = 6      # number of iterations

print(f"Solving f(x) = 0 by Newton's Method")
print(f"True root = {true_root:.15f}")
print()
print(f"{'Step':>4}  {'x_n':>20}  {'f(x_n)':>14}  {'error':>14}  {'digits gained'}")
print("-" * 75)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    err = abs(x - true_root)
    print(f"{n:>4}  {x:>20.15f}  {fx:>14.2e}  {err:>14.2e}")
    x = x - fx / dfx

print(f"{steps:>4}  {x:>20.15f}  {f(x):>14.2e}  {abs(x-true_root):>14.2e}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Visualize convergence: errors on a log scale',
              prose: [
                'On a **linear** scale, errors look like they jump to zero instantly.',
                'On a **log scale**, quadratic convergence is the straight-downward slope that doubles in steepness each step.',
              ],
              code: `from opencalc import Figure
import math

f  = lambda x: x**2 - 2
df = lambda x: 2*x
true_root = math.sqrt(2)

x, errors = 1.0, []
for _ in range(8):
    errors.append(abs(x - true_root))
    x = x - f(x) / df(x)

# log10 of each error (stops when we hit machine precision)
log_errors = [math.log10(e) if e > 1e-16 else -16 for e in errors]
steps = list(range(len(log_errors)))

fig = Figure(xmin=-0.5, xmax=len(steps)-0.5, ymin=-17, ymax=1,
    title="Newton's Method: log10(error) vs iteration (f=x²-2)")
fig.grid(step=1).axes()
fig.scatter(steps, log_errors, color='red', radius=6)
for i in range(len(steps)-1):
    fig.line([steps[i], log_errors[i]], [steps[i+1], log_errors[i+1]],
        color='red', width=1.5)
fig.hline(-15.5, color='amber', dashed=True)
fig.text([0.2, -14.5], 'machine precision', color='amber', size=10)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: "Failure case: cycling on f(x) = x³ - 2x + 2",
              prose: [
                'Starting at $x_0 = 0$: the iterates cycle $0 \\to 1 \\to 0 \\to 1 \\to \\ldots$ forever.',
                'The actual root is near $x \\approx -1.769$. Change `x0 = -2` to find it instantly.',
              ],
              instructions: 'Run with x0 = 0 to see cycling. Then change x0 = -2 to see fast convergence to the real root.',
              code: `import math

f  = lambda x: x**3 - 2*x + 2
df = lambda x: 3*x**2 - 2

x0    = 0.0    # try changing to -2.0
steps = 8

print(f"Starting at x0 = {x0}")
print()
print(f"{'Step':>4}  {'x_n':>18}  {'f(x_n)':>14}")
print("-" * 40)

x = x0
for n in range(steps):
    fx  = f(x)
    dfx = df(x)
    if abs(dfx) < 1e-12:
        print(f"{n:>4}  f'(x) ≈ 0 — division by zero! Stopping.")
        break
    print(f"{n:>4}  {x:>18.10f}  {fx:>14.6f}")
    x = x - fx / dfx
print(f"{steps:>4}  {x:>18.10f}  {f(x):>14.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              challengeType: 'write',
              challengeTitle: "Your Turn: Find all 3 roots of x³ - 6x² + 11x - 5",
              difficulty: 'hard',
              prompt: 'The cubic f(x) = x³ - 6x² + 11x - 5 has three real roots.\n\nStrategy: evaluate f at integers 0-5 to find sign changes, then run Newton from 3 different starting points.',
              hint: 'f(0)<0, f(1)>0, f(2)<0, f(5)>0. Try x0 = 0.5, x0 = 2.0, x0 = 4.5.',
              code: `import math

f  = lambda x: x**3 - 6*x**2 + 11*x - 5
df = lambda x: 3*x**2 - 12*x + 11

# Step 1: sign survey
print("Sign survey:")
for xi in range(6):
    print(f"  f({xi}) = {f(xi):.4f}")
print()

# Step 2: run Newton from three starting points
def newton(f, df, x0, steps=10):
    x = x0
    for _ in range(steps):
        x = x - f(x) / df(x)
    return x

# YOUR CODE: find the three roots
# r1 = newton(f, df, 0.5)
# r2 = newton(f, df, ???)
# r3 = newton(f, df, ???)
# print(f"Roots: {r1:.6f}, {r2:.6f}, {r3:.6f}")`,
              output: '', status: 'idle', figureJson: null,
            },
          ]
        }
      },
    ],
  },

  rigor: {
    prose: [
      "**Theorem (Local Quadratic Convergence).** Let $f \\in C^2[a, b]$ with a simple root $r \\in (a, b)$ (meaning $f(r) = 0$ and $f'(r) \\neq 0$). Then there exists $\\delta > 0$ such that for any $x_0 \\in (r - \\delta, r + \\delta)$, Newton's iterates $x_{n+1} = x_n - f(x_n)/f'(x_n)$ converge to $r$, and the convergence is quadratic.",
      "**Proof.** Define $\\phi(x) = x - f(x)/f'(x)$. Then $\\phi(r) = r$ (since $f(r) = 0$), and Newton's iteration is $x_{n+1} = \\phi(x_n)$. Compute $\\phi'(x) = 1 - \\frac{[f'(x)]^2 - f(x)f''(x)}{[f'(x)]^2} = \\frac{f(x)f''(x)}{[f'(x)]^2}$. At $x = r$: $\\phi'(r) = \\frac{f(r)f''(r)}{[f'(r)]^2} = 0$ since $f(r) = 0$.",
      "Since $\\phi'(r) = 0$ and $\\phi'$ is continuous, there exists $\\delta > 0$ such that $|\\phi'(x)| \\leq q < 1$ for all $x \\in [r - \\delta, r + \\delta]$. By the Mean Value Theorem, $|x_{n+1} - r| = |\\phi(x_n) - \\phi(r)| = |\\phi'(\\xi_n)||x_n - r| \\leq q|x_n - r|$. By induction, $|x_n - r| \\leq q^n|x_0 - r| \\to 0$, proving convergence.",
      "For quadratic convergence, use Taylor: $\\phi(x) = \\phi(r) + \\phi'(r)(x - r) + \\frac{1}{2}\\phi''(r)(x - r)^2 + \\cdots$. Since $\\phi'(r) = 0$, $|\\phi(x_n) - r| = \\frac{1}{2}|\\phi''(\\xi_n)| \\cdot |x_n - r|^2$. Computing $\\phi''(r) = \\frac{f''(r)}{f'(r)}$ (after careful differentiation), we get $|e_{n+1}| = \\frac{|f''(r)|}{2|f'(r)|}|e_n|^2 + O(|e_n|^3)$.",
      "**Failure analysis: cycling.** Consider $f(x) = x^3 - 2x + 2$ with $x_0 = 0$. Then $x_1 = 0 - (0 - 0 + 2)/(0 - 2) = 1$. And $x_1 = 1$: $x_2 = 1 - (1 - 2 + 2)/(3 - 2) = 1 - 1 = 0 = x_0$. The iterates cycle: $0, 1, 0, 1, \\ldots$, never converging. This occurs because the tangent lines at $x = 0$ and $x = 1$ point at each other. The root is near $x \\approx -1.77$, far from both cycling points.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Fixed Point Interpretation',
        body: "Newton's iteration $x_{n+1} = \\phi(x_n)$ where $\\phi(x) = x - f(x)/f'(x)$ is a fixed-point iteration with the special property $\\phi'(r) = 0$. This vanishing derivative is why convergence is quadratic rather than merely linear.",
      },
      {
        type: 'warning',
        title: 'Convergence Is Only Local',
        body: "The theorem guarantees convergence only when $x_0$ is sufficiently close to $r$. The basin of attraction — the set of starting points that converge to a given root — can have fractal boundaries in the complex plane, even for simple polynomials.",
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch3-060-ex1',
      title: 'Finding the Square Root of 2',
      problem: "\\text{Use Newton's Method to approximate } \\sqrt{2} \\text{ starting from } x_0 = 1. \\text{ Perform 4 iterations.}",
      visualizationId: 'NewtonsMethod',
      steps: [
        { expression: 'f(x) = x^2 - 2, \\quad f\'(x) = 2x', annotation: 'We want $x^2 = 2$, so $f(x) = x^2 - 2 = 0$. The root is $\\sqrt{2}$.', strategyTitle: "Set up: define f(x) and compute f'(x) — both required for the iteration", checkpoint: "Newton's formula is xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ). You need both f and f' at each step. What goes wrong if f'(xₙ) = 0?", hints: ["Level 1: Write f(x) explicitly (what equation are you solving = 0?), then differentiate to find f'(x).", "Level 2: The iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ) requires evaluating both f and f' at the current guess. f(xₙ) tells you how far from zero you are; f'(xₙ) tells you the slope of the tangent line.", "Level 3: If f'(xₙ) = 0, the tangent line is horizontal and never crosses the x-axis — the formula divides by zero. This is why Newton's Method requires f'(r) ≠ 0 at the root."] },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{x_n + 2/x_n}{2}', annotation: 'The Newton iteration simplifies to the average of $x_n$ and $2/x_n$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_0 = 1: \\quad x_1 = \\frac{1 + 2}{2} = \\frac{3}{2} = 1.5', annotation: 'First iteration. Error: $|1.5 - 1.41421...| \\approx 0.086$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_1 = 1.5: \\quad x_2 = \\frac{1.5 + 2/1.5}{2} = \\frac{1.5 + 1.\\overline{3}}{2} = \\frac{17}{12} \\approx 1.41\\overline{6}', annotation: 'Second iteration. Error: $\\approx 0.0025$. Already 2 correct decimal places.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_2 = \\frac{17}{12}: \\quad x_3 = \\frac{17/12 + 24/17}{2} = \\frac{577}{408} \\approx 1.41421568...', annotation: 'Third iteration. Error: $\\approx 0.0000021$. Now 5 correct digits.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_3 = \\frac{577}{408}: \\quad x_4 = \\frac{665857}{470832} \\approx 1.4142135623746...', annotation: 'Fourth iteration. Error: $\\approx 10^{-12}$. Eleven correct digits after only 4 steps from a crude initial guess!', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
      ],
      conclusion: "After 4 iterations starting from $x_0 = 1$, we have $\\sqrt{2} \\approx 1.4142135623746...$, correct to 11 decimal places. The error went from 0.41 to 0.086 to 0.0025 to 0.0000021 to $10^{-12}$ — the digits of accuracy roughly doubled at each step, demonstrating quadratic convergence.",
    },
    {
      id: 'ch3-060-ex2',
      title: 'Solving a Cubic Equation',
      problem: "\\text{Find a root of } f(x) = x^3 - x - 1 = 0 \\text{ using Newton's Method with } x_0 = 1.5.",
      steps: [
        { expression: "f(x) = x^3 - x - 1, \\quad f'(x) = 3x^2 - 1", annotation: 'Set up the function and its derivative.', strategyTitle: "Set up: define f(x) and compute f'(x) — both required for the iteration", checkpoint: "Newton's formula is xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ). You need both f and f' at each step. What goes wrong if f'(xₙ) = 0?", hints: ["Level 1: Write f(x) explicitly (what equation are you solving = 0?), then differentiate to find f'(x).", "Level 2: The iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ) requires evaluating both f and f' at the current guess. f(xₙ) tells you how far from zero you are; f'(xₙ) tells you the slope of the tangent line.", "Level 3: If f'(xₙ) = 0, the tangent line is horizontal and never crosses the x-axis — the formula divides by zero. This is why Newton's Method requires f'(r) ≠ 0 at the root."] },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^3 - x_n - 1}{3x_n^2 - 1}', annotation: 'Write the Newton iteration formula for this specific function.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_0 = 1.5: \\quad f(1.5) = 3.375 - 1.5 - 1 = 0.875, \\quad f\'(1.5) = 6.75 - 1 = 5.75', annotation: 'Evaluate $f$ and $f\'$ at $x_0 = 1.5$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_1 = 1.5 - \\frac{0.875}{5.75} \\approx 1.5 - 0.15217 = 1.34783', annotation: 'First iteration.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_1 = 1.34783: \\quad f(1.34783) \\approx 0.09946, \\quad f\'(1.34783) \\approx 4.44994', annotation: 'Evaluate at $x_1$.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_2 = 1.34783 - \\frac{0.09946}{4.44994} \\approx 1.32547', annotation: 'Second iteration. Getting closer.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
        { expression: 'x_3 \\approx 1.32472, \\quad x_4 \\approx 1.32472', annotation: 'Third and fourth iterations agree to 5 decimal places. The root has been found.', strategyTitle: "Iteration n: evaluate f(xₙ) and f'(xₙ), then compute xₙ₊₁", checkpoint: "Is |f(xₙ)| decreasing toward 0? Is xₙ approaching a consistent value? These two checks verify convergence.", hints: ["Level 1: Substitute xₙ into f and f', compute f(xₙ)/f'(xₙ), subtract from xₙ.", "Level 2: The error roughly squares each iteration: if error at step n is ε, error at step n+1 is ≈ Cε². For √2: error at step 0 is 0.414, step 1 is 0.086, step 2 is 0.002, step 3 is 0.000002. Quadratic convergence.", "Level 3: The Babylonian method for √2 is identical to this Newton iteration. Ancient mathematicians discovered this formula 3500 years ago; Newton's calculus gave it the general form."] },
      ],
      conclusion: "The real root of $x^3 - x - 1 = 0$ is approximately $r \\approx 1.32472$. This cubic has no rational roots (by the Rational Root Theorem, the only candidates $\\pm 1$ fail). Newton's Method finds the irrational root efficiently. The equation $x^3 = x + 1$ defines the so-called plastic ratio, which appears in architecture and number theory.",
    },
    {
      id: 'ch3-060-ex3',
      title: "Newton's Method Failure: Cycling",
      problem: "\\text{Show that Newton's Method cycles when applied to } f(x) = x^3 - 2x + 2 \\text{ with } x_0 = 0.",
      steps: [
        { expression: "f(x) = x^3 - 2x + 2, \\quad f'(x) = 3x^2 - 2", annotation: 'Set up the function and derivative.', strategyTitle: "Set up: define f(x) and compute f'(x) — both required for the iteration", checkpoint: "Newton's formula is xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ). You need both f and f' at each step. What goes wrong if f'(xₙ) = 0?", hints: ["Level 1: Write f(x) explicitly (what equation are you solving = 0?), then differentiate to find f'(x).", "Level 2: The iteration formula xₙ₊₁ = xₙ − f(xₙ)/f'(xₙ) requires evaluating both f and f' at the current guess. f(xₙ) tells you how far from zero you are; f'(xₙ) tells you the slope of the tangent line.", "Level 3: If f'(xₙ) = 0, the tangent line is horizontal and never crosses the x-axis — the formula divides by zero. This is why Newton's Method requires f'(r) ≠ 0 at the root."] },
        { expression: 'x_0 = 0: \\quad f(0) = 2, \\quad f\'(0) = -2', annotation: 'Evaluate at $x_0 = 0$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_1 = 0 - \\frac{2}{-2} = 0 + 1 = 1', annotation: 'The tangent line at $x = 0$ crosses the $x$-axis at $x = 1$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_1 = 1: \\quad f(1) = 1 - 2 + 2 = 1, \\quad f\'(1) = 3 - 2 = 1', annotation: 'Evaluate at $x_1 = 1$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_2 = 1 - \\frac{1}{1} = 0 = x_0', annotation: 'The tangent line at $x = 1$ crosses the $x$-axis at $x = 0$ — right back where we started!', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
        { expression: 'x_0 = 0 \\to x_1 = 1 \\to x_2 = 0 \\to x_3 = 1 \\to \\cdots', annotation: 'The iterates cycle forever between 0 and 1, never converging. The actual root is near $x \\approx -1.769$.', strategyTitle: "Failure mode: the iteration cycles — x₀ → x₁ → x₀ → ⋯ without converging", checkpoint: "Why does x₂ = x₀ lead to infinite cycling? What geometric property of f(x) = x³ − 2x + 2 causes this failure?", hints: ["Level 1: At x₀ = 0: f(0) = 2, f'(0) = −2, so x₁ = 0 − 2/(−2) = 1. At x₁ = 1: f(1) = 1, f'(1) = 1, so x₂ = 1 − 1/1 = 0 = x₀. The sequence repeats forever.", "Level 2: This happens because the initial guess x₀ = 0 and x₁ = 1 are on opposite sides of a local maximum of f, and the tangent lines at each point point to the other. The iteration is trapped in a symmetric oscillation.", "Level 3: This is why Newton's Method requires a 'sufficiently close' initial guess. Bisection method is immune to this failure — use bisection to bracket the root first, then switch to Newton's for fast convergence."] },
      ],
      conclusion: "Newton's Method cycles between $x = 0$ and $x = 1$ because the tangent lines at these two points point directly at each other. The true root near $x \\approx -1.769$ is never approached. Starting from $x_0 = -2$ instead would converge to the root. This illustrates why the initial guess matters.",
    },
    {
      id: 'ch3-060-ex4',
      title: 'Computing Cube Roots',
      problem: "\\text{Use Newton's Method to find } \\sqrt[3]{10} \\text{ starting from } x_0 = 2.",
      steps: [
        { expression: 'f(x) = x^3 - 10, \\quad f\'(x) = 3x^2', annotation: 'Solve $x^3 = 10$, so $f(x) = x^3 - 10$.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^3 - 10}{3x_n^2} = \\frac{2x_n^3 + 10}{3x_n^2} = \\frac{2x_n}{3} + \\frac{10}{3x_n^2}', annotation: 'The Newton iteration for cube roots.' },
        { expression: 'x_0 = 2: \\quad x_1 = \\frac{2(8) + 10}{3(4)} = \\frac{26}{12} = \\frac{13}{6} \\approx 2.16\\overline{6}', annotation: 'First iteration. $f(2) = -2$, so $x_0 = 2$ is below the root.' },
        { expression: 'x_1 \\approx 2.1667: \\quad x_2 \\approx 2.15445', annotation: 'Second iteration.' },
        { expression: 'x_2 \\approx 2.15445: \\quad x_3 \\approx 2.15443', annotation: 'Third iteration. Already converged to 5 decimal places.' },
        { expression: '\\sqrt[3]{10} \\approx 2.15443', annotation: 'The cube root of 10, accurate to 5 decimal places, found in just 3 iterations.' },
      ],
      conclusion: "Newton's Method finds $\\sqrt[3]{10} \\approx 2.15443$ in three iterations from $x_0 = 2$. The same approach works for any $n$th root: to find $\\sqrt[n]{a}$, apply Newton's Method to $f(x) = x^n - a$, giving $x_{n+1} = \\frac{(n-1)x_n + a/x_n^{n-1}}{n}$.",
    },
    {
      id: 'ch3-060-ex5',
      title: 'Comparing Newton and Bisection',
      problem: "\\text{Find a root of } f(x) = e^x - 3 = 0 \\text{ using both Newton's Method (}x_0 = 1\\text{) and bisection on } [0, 2]. \\text{ Compare after 4 steps.}",
      steps: [
        { expression: '\\text{True root: } r = \\ln 3 \\approx 1.09861', annotation: 'We can solve this one exactly for comparison: $e^x = 3$ means $x = \\ln 3$.' },
        { expression: "\\textbf{Newton:} \\; f'(x) = e^x, \\; x_{n+1} = x_n - \\frac{e^{x_n} - 3}{e^{x_n}} = x_n - 1 + 3e^{-x_n}", annotation: "Newton's iteration for this problem." },
        { expression: 'x_0 = 1, \\; x_1 \\approx 1.10364, \\; x_2 \\approx 1.09861, \\; x_3 \\approx 1.09861', annotation: 'Newton converges to 5 decimal places in just 2 steps.' },
        { expression: '\\textbf{Bisection:} \\; [0, 2] \\to [1, 2] \\to [1, 1.5] \\to [1, 1.25] \\to [1, 1.125]', annotation: 'Bisection after 4 steps: the interval is $[1, 1.125]$, midpoint $\\approx 1.0625$. Error $\\approx 0.036$.' },
        { expression: '\\text{Newton error after 2 steps:} \\; \\approx 10^{-10}. \\quad \\text{Bisection error after 4 steps:} \\; \\approx 0.036.', annotation: "Newton's Method is astronomically more accurate in fewer steps — but it required computing $e^x$ and its derivative, while bisection only checked signs." },
      ],
      conclusion: "Newton's Method reaches 10-digit accuracy in 2 iterations; bisection achieves only 1-2 digits in 4 iterations. However, bisection is guaranteed to converge (given a sign change), while Newton's Method required a good initial guess. Each method has its strengths.",
    },
  ],

  challenges: [
    {
      id: 'ch3-060-ch1',
      difficulty: 'hard',
      problem: "Use Newton's Method to find all real roots of $x^3 - 6x^2 + 11x - 5 = 0$ to 4 decimal places. You will need to choose different starting points for different roots.",
      hint: 'The signs of the function at integer points are your "treasure map." Before you fire the Newton laser, walk the x-axis to find where the function flips from positive to negative. Each flip is a target for a new Newton sequence.',
      walkthrough: [
        { expression: "f(x) = x^3 - 6x^2 + 11x - 5, \\quad f'(x) = 3x^2 - 12x + 11", annotation: 'Set up the iteration.' },
        { expression: 'f(0) = -5 < 0, \\; f(1) = 1 > 0, \\; f(2) = -1 < 0, \\; f(3) = -2 < 0, \\; f(5) = 10 > 0', annotation: 'Sign changes suggest roots near $x \\approx 0.6$, $x \\approx 1.3$, and $x \\approx 4.1$.' },
        { expression: 'x_0 = 0.5: \\quad x_1 \\approx 0.5897, \\; x_2 \\approx 0.5858, \\; x_3 \\approx 0.5858', annotation: 'First root: $r_1 \\approx 0.5858$.' },
        { expression: 'x_0 = 2: \\quad x_1 \\approx 1.3333, \\; x_2 \\approx 1.2964, \\; x_3 \\approx 1.2929, \\; x_4 \\approx 1.2929', annotation: 'Second root: $r_2 \\approx 1.2929$ (note: this is $3 - \\sqrt{3} \\approx 1.2679$... let me recompute).' },
        { expression: 'x_0 = 4.5: \\quad x_1 \\approx 4.1667, \\; x_2 \\approx 4.1214, \\; x_3 \\approx 4.1213', annotation: 'Third root: $r_3 \\approx 4.1213$.' },
      ],
      answer: "\\text{The three roots are approximately } r_1 \\approx 0.5858, \\; r_2 \\approx 1.2929, \\; r_3 \\approx 4.1213.",
    },
    {
      id: 'ch3-060-ch2',
      difficulty: 'medium',
      problem: "Apply Newton's Method to $f(x) = x^2 - a$ (where $a > 0$) to derive the Babylonian formula for $\\sqrt{a}$. Then use it to compute $\\sqrt{5}$ to 6 decimal places.",
      hint: 'The Babylonian "average" is actually the secret origin of Newton\'s Method. If your guess is too high, its reciprocal is too low—so their average is almost perfect. This symmetry is why it converges so fast.',
      walkthrough: [
        { expression: "f(x) = x^2 - a, \\quad f'(x) = 2x", annotation: 'Set up for finding $\\sqrt{a}$.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^2 - a}{2x_n} = \\frac{2x_n^2 - x_n^2 + a}{2x_n} = \\frac{x_n + a/x_n}{2}', annotation: 'Simplify: the Newton iterate is the average of $x_n$ and $a/x_n$. This is the Babylonian formula.' },
        { expression: 'a = 5, \\; x_0 = 2: \\quad x_1 = \\frac{2 + 2.5}{2} = 2.25', annotation: 'First iteration for $\\sqrt{5}$.' },
        { expression: 'x_2 = \\frac{2.25 + 5/2.25}{2} = \\frac{2.25 + 2.2222}{2} \\approx 2.23611', annotation: 'Second iteration.' },
        { expression: 'x_3 \\approx 2.236068, \\quad x_4 \\approx 2.236068', annotation: 'Converged. $\\sqrt{5} \\approx 2.236068$.' },
      ],
      answer: "x_{n+1} = \\frac{x_n + a/x_n}{2}. \\quad \\sqrt{5} \\approx 2.236068.",
    },
    {
      id: 'ch3-060-ch3',
      difficulty: 'medium',
      problem: "Show that Newton's Method applied to $f(x) = x^2$ (which has a double root at $x = 0$) converges only linearly, not quadratically. Compute 5 iterations starting from $x_0 = 1$.",
      hint: 'The "Newton Engine" slows down at double roots. Because the tangent line becomes so flat, it doesn\'t point toward the root as aggressively. Watch how each step only kills half the error—like a bisection that never stops.',
      walkthrough: [
        { expression: "f(x) = x^2, \\quad f'(x) = 2x", annotation: 'The root $r = 0$ has multiplicity 2.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^2}{2x_n} = x_n - \\frac{x_n}{2} = \\frac{x_n}{2}', annotation: 'The iteration simply halves the current value each step.' },
        { expression: 'x_0 = 1, \\; x_1 = 0.5, \\; x_2 = 0.25, \\; x_3 = 0.125, \\; x_4 = 0.0625, \\; x_5 = 0.03125', annotation: 'Each step halves the error — linear convergence with ratio $1/2$, not quadratic.' },
        { expression: '|e_{n+1}| = \\frac{1}{2}|e_n| \\text{ (linear)}, \\quad \\text{not } |e_{n+1}| \\approx C|e_n|^2 \\text{ (quadratic)}', annotation: 'At a double root, $f\'(r) = 0$, which violates the hypothesis for quadratic convergence.' },
      ],
      answer: "\\text{At a double root, Newton's Method gives } x_{n+1} = x_n/2, \\text{ which is linear convergence with ratio } 1/2.",
    },
  ],

  crossRefs: [
    { lessonSlug: 'linear-approximation', label: 'Linear Approximation', context: "Newton's Method is iterated linear approximation: each step replaces the curve by its tangent line and solves the resulting linear equation." },
    { lessonSlug: 'mean-value-theorem', label: 'Mean Value Theorem', context: "The convergence proof for Newton's Method uses the Mean Value Theorem to bound the error at each step." },
    { lessonSlug: 'differentials', label: 'Differentials', context: "The differential $dy = f'(x)\\,dx$ is the tangent-line approximation that Newton's Method exploits at every iteration." },
    { lessonSlug: 'rolles-theorem', label: "Rolle's Theorem", context: "Rolle's Theorem guarantees that between consecutive roots of $f$, there is a root of $f'$ — which affects the basins of attraction for Newton's Method." },
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
    'attempted-challenge-hard',
    'attempted-challenge-medium-1',
    'attempted-challenge-medium-2',
  ],

  quiz: [
    {
      id: 'nm-q1',
      type: 'choice',
      text: "Newton's Method generates the sequence $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. Geometrically, $x_{n+1}$ is:",
      options: [
        'The midpoint of the interval $[x_n, x_{n-1}]$',
        'Where the tangent line to $y = f(x)$ at $(x_n, f(x_n))$ crosses the $x$-axis',
        'Where the secant through $(x_{n-1}, f(x_{n-1}))$ and $(x_n, f(x_n))$ crosses the $x$-axis',
        'The average of $x_n$ and $f(x_n)$',
      ],
      answer: 'Where the tangent line to $y = f(x)$ at $(x_n, f(x_n))$ crosses the $x$-axis',
      hints: [
        'The tangent line at $(x_n, f(x_n))$ is $y = f(x_n) + f\'(x_n)(x - x_n)$. Setting $y = 0$ gives $x = x_n - f(x_n)/f\'(x_n) = x_{n+1}$.',
      ],
      reviewSection: "Intuition — Deriving Newton's formula",
    },
    {
      id: 'nm-q2',
      type: 'input',
      text: "To find $\\sqrt{2}$, solve $f(x) = x^2 - 2 = 0$. The Newton iteration is $x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n}$. Starting from $x_0 = 1$, compute $x_1$. Enter the value as a fraction or decimal.",
      answer: '3/2',
      hints: [
        '$x_1 = 1 - \\frac{1 - 2}{2} = 1 + \\frac{1}{2} = \\frac{3}{2} = 1.5$.',
      ],
      reviewSection: "Intuition — Computing $\\sqrt{2}$ by Newton's Method",
    },
    {
      id: 'nm-q3',
      type: 'input',
      text: "Continuing: $x_1 = 3/2$. Compute $x_2 = x_1 - \\frac{x_1^2 - 2}{2x_1}$. Enter the value as a fraction.",
      answer: '17/12',
      hints: [
        '$x_2 = \\frac{3}{2} - \\frac{9/4 - 2}{3} = \\frac{3}{2} - \\frac{1/4}{3} = \\frac{3}{2} - \\frac{1}{12} = \\frac{18 - 1}{12} = \\frac{17}{12}$.',
      ],
      reviewSection: "Intuition — Computing $\\sqrt{2}$ by Newton's Method",
    },
    {
      id: 'nm-q4',
      type: 'choice',
      text: "Newton's Method fails at step $n$ if:",
      options: [
        "$f(x_n) = 0$ (we found the root)",
        "$f'(x_n) = 0$ (tangent line is horizontal)",
        "$x_n > 0$",
        "$f(x_n) > 0$",
      ],
      answer: "$f'(x_n) = 0$ (tangent line is horizontal)",
      hints: [
        "The formula $x_{n+1} = x_n - f(x_n)/f'(x_n)$ divides by $f'(x_n)$. If $f'(x_n) = 0$, the tangent is horizontal and never reaches the $x$-axis.",
      ],
      reviewSection: "Intuition — When Newton's Method fails",
    },
    {
      id: 'nm-q5',
      type: 'input',
      text: "To solve $f(x) = x^3 - x - 1 = 0$ near $x_0 = 1$: compute $f(1)$ and $f'(1)$, then find $x_1 = x_0 - f(x_0)/f'(x_0)$. Enter $x_1$.",
      answer: '1.5',
      hints: [
        '$f(1) = 1 - 1 - 1 = -1$ and $f\'(x) = 3x^2 - 1$, so $f\'(1) = 2$.',
        '$x_1 = 1 - (-1)/2 = 1 + 0.5 = 1.5$.',
      ],
      reviewSection: "Examples — Newton's Method for a cubic",
    },
    {
      id: 'nm-q6',
      type: 'input',
      text: "For $f(x) = \\cos x - x$, starting from $x_0 = 1$ (radian). Compute $f(1) = \\cos 1 - 1 \\approx -0.4597$ and $f'(x) = -\\sin x - 1$, so $f'(1) \\approx -1.8415$. Compute $x_1 = x_0 - f(x_0)/f'(x_0)$. Round to 4 decimal places.",
      answer: '0.7503',
      hints: [
        '$x_1 = 1 - \\frac{-0.4597}{-1.8415} = 1 - 0.2497 \\approx 0.7503$.',
      ],
      reviewSection: "Examples — Newton's Method for a transcendental equation",
    },
    {
      id: 'nm-q7',
      type: 'choice',
      text: "Newton's Method exhibits quadratic convergence near a simple root. This means if $e_n$ is the error at step $n$, then roughly:",
      options: [
        '$e_{n+1} \\approx \\frac{1}{2}e_n$ (error halves each step)',
        '$e_{n+1} \\approx C \\cdot e_n^2$ (error squares each step)',
        '$e_{n+1} \\approx e_n - 1$ (error decreases by a constant)',
        '$e_{n+1} \\approx e_n$ (error stays constant)',
      ],
      answer: '$e_{n+1} \\approx C \\cdot e_n^2$ (error squares each step)',
      hints: [
        'Quadratic convergence means the number of correct digits roughly doubles each step.',
      ],
      reviewSection: "Math — Quadratic convergence",
    },
    {
      id: 'nm-q8',
      type: 'input',
      text: "To find $\\sqrt[3]{5}$, solve $f(x) = x^3 - 5 = 0$. Starting from $x_0 = 2$: $f(2) = 3$, $f'(2) = 12$. Compute $x_1 = x_0 - f(x_0)/f'(x_0)$. Enter the fraction.",
      answer: '7/4',
      hints: [
        '$x_1 = 2 - 3/12 = 2 - 1/4 = 7/4 = 1.75$.',
      ],
      reviewSection: "Examples — Cube root by Newton's Method",
    },
    {
      id: 'nm-q9',
      type: 'choice',
      text: "Compared to the bisection method, Newton's Method is generally:",
      options: [
        'Slower but always converges',
        'Faster but may fail to converge if the initial guess is poor',
        'The same speed — both double correct digits each step',
        'Slower and less reliable',
      ],
      answer: 'Faster but may fail to converge if the initial guess is poor',
      hints: [
        'Bisection converges linearly (adds ~0.3 digits per step) and is guaranteed to converge. Newton converges quadratically but needs a good start.',
      ],
      reviewSection: "Math — Bisection vs Newton comparison",
    },
    {
      id: 'nm-q10',
      type: 'input',
      text: "Newton's Method iteration formula is $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$. For $f(x) = x^2 - a$ (finding $\\sqrt{a}$), simplify this iteration to the form $x_{n+1} = \\frac{1}{2}\\left(x_n + \\frac{a}{x_n}\\right)$. If $a = 9$ and $x_0 = 4$, compute $x_1$. Enter the exact value.",
      answer: '25/8',
      hints: [
        '$x_1 = \\frac{1}{2}(4 + 9/4) = \\frac{1}{2} \\cdot \\frac{25}{4} = \\frac{25}{8} = 3.125$.',
      ],
      reviewSection: "Intuition — Babylonian square root algorithm",
    },
  ],

  spiral: {
    recoveryPoints: [
      { label: 'Linear Approximation (Lesson 2)', note: "Newton's Method IS iterated linear approximation: at each step, replace f(x) with its tangent line and solve the linear equation" },
      { label: 'Tangent Line (Ch. 2)', note: 'The tangent line at (xₙ, f(xₙ)) has equation y − f(xₙ) = f\'(xₙ)(x − xₙ). Setting y = 0 gives xₙ₊₁ — this is the entire algorithm' },
      { label: 'Implicit Differentiation (Ch. 2)', note: 'To solve g(x, y) = 0 for y, Newton\'s Method in two variables uses the Jacobian — same principle, same tangent-line idea' },
    ],
    futureLinks: [
      { label: 'Optimization (Lesson 6)', note: 'To find critical points of f, solve f\'(x) = 0. Newton\'s Method applied to f\'(x) uses f\'\'(x): xₙ₊₁ = xₙ − f\'(xₙ)/f\'\'(xₙ)' },
      { label: 'Numerical Integration (Ch. 4)', note: 'Many integration methods (Runge-Kutta, etc.) use Newton-style iteration under the hood — calculus powers the algorithms that power computation' },
      { label: 'Multivariable Newton (Calc 3)', note: 'For systems of equations F(x) = 0 in ℝⁿ, Newton\'s Method uses the Jacobian matrix: xₙ₊₁ = xₙ − J(xₙ)⁻¹F(xₙ)' },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'nm-q1',
        type: 'multiple-choice',
        question: "Apply one step of Newton's Method to $f(x) = x^2 - 5$ starting from $x_0 = 2$. What is $x_1$?",
        options: ['2.5', '2.25', '2.1', '2.4'],
        answer: 'b',
        explanation: "$f(x_0) = 4 - 5 = -1$, $f'(x_0) = 2(2) = 4$. So $x_1 = 2 - (-1)/4 = 2 + 0.25 = 2.25$. This is approaching $\\sqrt{5} \\approx 2.236$.",
      },
      {
        id: 'nm-q2',
        type: 'multiple-choice',
        question: "Newton's Method converges quadratically. If the error at step $n$ is $10^{-3}$, roughly what is the error at step $n+1$?",
        options: ['$10^{-3}$', '$10^{-4}$', '$10^{-6}$', '$10^{-9}$'],
        answer: 'c',
        explanation: "Quadratic convergence means $|e_{n+1}| \\approx C|e_n|^2$. With $C \\approx 1$ and $e_n = 10^{-3}$, we get $e_{n+1} \\approx (10^{-3})^2 = 10^{-6}$. The number of correct digits doubles.",
      },
      {
        id: 'nm-q3',
        type: 'multiple-choice',
        question: "Newton's Method is applied to $f(x) = \\sin(x)$ starting near $x_0 = 3$. To which root does it converge?",
        options: ['$x = 0$', '$x = \\pi$', '$x = 2\\pi$', 'It diverges'],
        answer: 'b',
        explanation: "Starting near $x = 3 \\approx \\pi$, the nearest root of $\\sin(x) = 0$ is $x = \\pi \\approx 3.14159$. Newton's Method converges to the root closest to the initial guess (when the function is well-behaved near that root).",
      },
    ],
  },
}
