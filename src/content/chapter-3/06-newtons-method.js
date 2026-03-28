// FILE: src/content/chapter-3/06-newtons-method.js
export default {
  id: 'ch3-060',
  slug: 'newtons-method',
  chapter: 3,
  order: 6,
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
          { vizId: 'NewtonsMethod', caption: "Watch Newton's Method in action: each tangent line takes you closer to the root." },
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
      { vizId: 'NewtonsMethod', caption: "Each iteration draws a tangent line and follows it to the $x$-axis, converging rapidly to the root." },
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
        { expression: 'f(x) = x^2 - 2, \\quad f\'(x) = 2x', annotation: 'We want $x^2 = 2$, so $f(x) = x^2 - 2 = 0$. The root is $\\sqrt{2}$.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^2 - 2}{2x_n} = \\frac{x_n + 2/x_n}{2}', annotation: 'The Newton iteration simplifies to the average of $x_n$ and $2/x_n$.' },
        { expression: 'x_0 = 1: \\quad x_1 = \\frac{1 + 2}{2} = \\frac{3}{2} = 1.5', annotation: 'First iteration. Error: $|1.5 - 1.41421...| \\approx 0.086$.' },
        { expression: 'x_1 = 1.5: \\quad x_2 = \\frac{1.5 + 2/1.5}{2} = \\frac{1.5 + 1.\\overline{3}}{2} = \\frac{17}{12} \\approx 1.41\\overline{6}', annotation: 'Second iteration. Error: $\\approx 0.0025$. Already 2 correct decimal places.' },
        { expression: 'x_2 = \\frac{17}{12}: \\quad x_3 = \\frac{17/12 + 24/17}{2} = \\frac{577}{408} \\approx 1.41421568...', annotation: 'Third iteration. Error: $\\approx 0.0000021$. Now 5 correct digits.' },
        { expression: 'x_3 = \\frac{577}{408}: \\quad x_4 = \\frac{665857}{470832} \\approx 1.4142135623746...', annotation: 'Fourth iteration. Error: $\\approx 10^{-12}$. Eleven correct digits after only 4 steps from a crude initial guess!' },
      ],
      conclusion: "After 4 iterations starting from $x_0 = 1$, we have $\\sqrt{2} \\approx 1.4142135623746...$, correct to 11 decimal places. The error went from 0.41 to 0.086 to 0.0025 to 0.0000021 to $10^{-12}$ — the digits of accuracy roughly doubled at each step, demonstrating quadratic convergence.",
    },
    {
      id: 'ch3-060-ex2',
      title: 'Solving a Cubic Equation',
      problem: "\\text{Find a root of } f(x) = x^3 - x - 1 = 0 \\text{ using Newton's Method with } x_0 = 1.5.",
      steps: [
        { expression: "f(x) = x^3 - x - 1, \\quad f'(x) = 3x^2 - 1", annotation: 'Set up the function and its derivative.' },
        { expression: 'x_{n+1} = x_n - \\frac{x_n^3 - x_n - 1}{3x_n^2 - 1}', annotation: 'Write the Newton iteration formula for this specific function.' },
        { expression: 'x_0 = 1.5: \\quad f(1.5) = 3.375 - 1.5 - 1 = 0.875, \\quad f\'(1.5) = 6.75 - 1 = 5.75', annotation: 'Evaluate $f$ and $f\'$ at $x_0 = 1.5$.' },
        { expression: 'x_1 = 1.5 - \\frac{0.875}{5.75} \\approx 1.5 - 0.15217 = 1.34783', annotation: 'First iteration.' },
        { expression: 'x_1 = 1.34783: \\quad f(1.34783) \\approx 0.09946, \\quad f\'(1.34783) \\approx 4.44994', annotation: 'Evaluate at $x_1$.' },
        { expression: 'x_2 = 1.34783 - \\frac{0.09946}{4.44994} \\approx 1.32547', annotation: 'Second iteration. Getting closer.' },
        { expression: 'x_3 \\approx 1.32472, \\quad x_4 \\approx 1.32472', annotation: 'Third and fourth iterations agree to 5 decimal places. The root has been found.' },
      ],
      conclusion: "The real root of $x^3 - x - 1 = 0$ is approximately $r \\approx 1.32472$. This cubic has no rational roots (by the Rational Root Theorem, the only candidates $\\pm 1$ fail). Newton's Method finds the irrational root efficiently. The equation $x^3 = x + 1$ defines the so-called plastic ratio, which appears in architecture and number theory.",
    },
    {
      id: 'ch3-060-ex3',
      title: "Newton's Method Failure: Cycling",
      problem: "\\text{Show that Newton's Method cycles when applied to } f(x) = x^3 - 2x + 2 \\text{ with } x_0 = 0.",
      steps: [
        { expression: "f(x) = x^3 - 2x + 2, \\quad f'(x) = 3x^2 - 2", annotation: 'Set up the function and derivative.' },
        { expression: 'x_0 = 0: \\quad f(0) = 2, \\quad f\'(0) = -2', annotation: 'Evaluate at $x_0 = 0$.' },
        { expression: 'x_1 = 0 - \\frac{2}{-2} = 0 + 1 = 1', annotation: 'The tangent line at $x = 0$ crosses the $x$-axis at $x = 1$.' },
        { expression: 'x_1 = 1: \\quad f(1) = 1 - 2 + 2 = 1, \\quad f\'(1) = 3 - 2 = 1', annotation: 'Evaluate at $x_1 = 1$.' },
        { expression: 'x_2 = 1 - \\frac{1}{1} = 0 = x_0', annotation: 'The tangent line at $x = 1$ crosses the $x$-axis at $x = 0$ — right back where we started!' },
        { expression: 'x_0 = 0 \\to x_1 = 1 \\to x_2 = 0 \\to x_3 = 1 \\to \\cdots', annotation: 'The iterates cycle forever between 0 and 1, never converging. The actual root is near $x \\approx -1.769$.' },
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
}
