// FILE: src/content/chapter-4/12-numerical-integration.js
export default {
  id: 'ch4-012',
  slug: 'numerical-integration',
  chapter: 4,
  order: 12,
  title: 'Numerical Integration',
  subtitle: 'Approximating definite integrals when antiderivatives do not exist — midpoint, trapezoidal, and Simpson\'s rules',
  tags: ['numerical integration', 'trapezoid', 'Simpson', 'midpoint', 'error bounds', 'approximation', 'quadrature'],

  hook: {
    question: 'How do you compute ∫₀¹ e^(−x²) dx? This function has no elementary antiderivative — no combination of polynomials, trig functions, exponentials, and logarithms will give you an answer. Yet the integral exists (it is about 0.7468). Numerical integration provides systematic methods to approximate any definite integral to arbitrary precision, complete with guaranteed error bounds.',
    realWorldContext: 'Numerical integration is one of the most widely used computational techniques in science and engineering. Weather prediction models integrate atmospheric equations at millions of grid points. Finite element analysis (used in bridge design, aircraft engineering, and crash simulations) is fundamentally numerical integration over complex domains. Monte Carlo integration computes high-dimensional integrals in finance (option pricing), physics (particle scattering), and machine learning (Bayesian inference). Modern graphics/path tracing evaluates the rendering equation by sampling and averaging illumination integrals over light directions. GPS satellites compute orbital integrals numerically. Every spreadsheet "SUM" over a column of measured data is a crude numerical integral.',
    previewVisualizationId: 'RiemannSum',
  },

  intuition: {
    prose: [
      'Numerical integration goes back to the original idea of Riemann sums: approximate the area under a curve by summing the areas of simple shapes. The question is not WHETHER we can approximate (we always can), but HOW ACCURATELY and HOW EFFICIENTLY. Different methods use different shapes — rectangles, trapezoids, parabolic arcs — and achieve different levels of accuracy for the same number of function evaluations.',
      'The midpoint rule uses rectangles whose height is the function value at the midpoint of each subinterval. If you divide $[a,b]$ into $n$ equal subintervals of width $h = (b-a)/n$, the midpoint rule gives $M_n = h\\sum_{i=1}^{n} f(\\bar{x}_i)$, where $\\bar{x}_i = a + (i-1/2)h$ is the midpoint of the $i$-th subinterval. Geometrically, each rectangle touches the curve at the center, which tends to balance overestimates and underestimates.',
      'The trapezoidal rule replaces each rectangle with a trapezoid: connect the function values at the left and right endpoints with a straight line. The area of each trapezoid is $h \\cdot [f(x_i) + f(x_{i+1})]/2$. Summing: $T_n = h[f(x_0)/2 + f(x_1) + f(x_2) + \\cdots + f(x_{n-1}) + f(x_n)/2]$. The first and last function values get half weight; all interior points get full weight. The trapezoidal rule is exact for linear functions.',
      'Simpson\'s rule is the star of numerical integration. Instead of fitting a straight line through two points, it fits a parabola through three consecutive points. Over two subintervals $[x_{i-1}, x_{i+1}]$, the area under the parabola is $(h/3)[f(x_{i-1}) + 4f(x_i) + f(x_{i+1})]$. Summing over all pairs (requiring $n$ to be even): $S_n = (h/3)[f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + \\cdots + 4f(x_{n-1}) + f(x_n)]$. The coefficients alternate: 1, 4, 2, 4, 2, ..., 4, 1.',
      'The error bounds reveal why Simpson\'s rule is so powerful. Midpoint rule: $|E_M| \\leq (b-a)^3/(24n^2) \\cdot \\max|f\'\'|$. Trapezoidal rule: $|E_T| \\leq (b-a)^3/(12n^2) \\cdot \\max|f\'\'|$. Both have errors that shrink like $1/n^2$ — doubling $n$ cuts the error by a factor of 4. Simpson\'s rule: $|E_S| \\leq (b-a)^5/(180n^4) \\cdot \\max|f^{(4)}|$. The error shrinks like $1/n^4$ — doubling $n$ cuts the error by a factor of 16! Simpson\'s rule with just $n = 10$ often gives 8+ digits of accuracy.',
      'An important relationship: Simpson\'s rule is a weighted average of the midpoint and trapezoidal rules: $S_{2n} = (2M_n + T_n)/3$. This means you can compute $M_n$ and $T_n$ and combine them to get $S_{2n}$ for free, effectively tripling your accuracy without additional function evaluations.',
      'When do you NEED numerical methods? (1) The integrand has no elementary antiderivative: $e^{-x^2}$, $\\sin(x)/x$, $\\sqrt{1+x^4}$. (2) The function is given by data (measured temperatures, experimental readings) rather than a formula — you cannot find an antiderivative of a table. (3) The antiderivative exists but is too complicated to evaluate reliably (some partial fraction or trig sub results). In all these cases, numerical integration gives the answer directly.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Which Method to Use',
        body: 'For quick hand calculations: Trapezoidal rule (simple formula, easy to remember).\nFor high accuracy with few points: Simpson\'s rule (error ∝ 1/n⁴).\nFor data from experiments: Trapezoidal rule (only needs function values at endpoints).\nFor computer implementations: Adaptive Simpson\'s (automatically chooses n to meet a target accuracy).',
      },
      {
        type: 'warning',
        title: 'Simpson\'s Rule Requires Even n',
        body: 'Simpson\'s rule fits parabolas through groups of THREE points, spanning TWO subintervals. This requires n (the number of subintervals) to be EVEN. If you use odd n, the formula does not apply. Always check: is n even?',
      },
      {
        type: 'prior-knowledge',
        title: 'Riemann Sums Are the Foundation',
        body: 'All numerical integration methods are refinements of Riemann sums. Left Riemann sums use the left endpoint; right sums use the right; midpoint sums use the center. The trapezoidal rule averages left and right. Simpson\'s rule goes further by fitting curves. Each refinement reduces the error for smooth functions.',
      },
      {
        type: 'real-world',
        title: 'Numerical Integration in Engineering Software',
        body: 'MATLAB\'s "integral" function, Python\'s scipy.integrate.quad, and Wolfram Alpha all use adaptive numerical integration internally. They start with a coarse grid, estimate the error, and refine only where needed. The underlying method is usually Gauss-Kronrod quadrature — a sophisticated descendant of Simpson\'s rule that achieves machine precision (15-16 digits) in milliseconds.',
      },
      {
        type: 'real-world',
        title: 'Path Tracing = Monte Carlo Integration',
        body: 'Photorealistic rendering evaluates integrals of incoming light over a hemisphere. More samples reduce variance like 1/sqrt(N), so numerical integration quality directly controls image noise and render time.',
      },
      {
        type: 'misconception',
        title: 'More Points Is Not Always Better',
        body: 'In theory, increasing n always reduces the error. In practice (on a computer), round-off errors from floating-point arithmetic eventually dominate. For n beyond a few thousand, the accumulated round-off can exceed the approximation error. The optimal n balances approximation error (decreasing) against round-off error (increasing).',
      },
    ],
    visualizations: [
      {
        id: 'RiemannSum',
        title: 'Comparing Numerical Methods',
        caption: 'Compare how midpoint rectangles, trapezoids, and Simpson\'s parabolic arcs approximate the area under a curve. As n increases, all methods converge to the true integral, but Simpson\'s rule converges dramatically faster.',
      },
    ],
  },

  math: {
    prose: [
      'Setup: let $f$ be continuous on $[a,b]$, $h = (b-a)/n$, $x_i = a + ih$ for $i = 0, 1, \\ldots, n$, and $\\bar{x}_i = (x_{i-1}+x_i)/2$ for midpoints.',
      'Midpoint rule: $M_n = h\\sum_{i=1}^{n} f(\\bar{x}_i)$. Error bound: $|E_M| \\leq \\frac{(b-a)^3}{24n^2}\\max_{[a,b]}|f\'\'(x)|$. The midpoint rule is exact for polynomials of degree $\\leq 1$ (and, due to cancellation, also exact for degree 2 over symmetric intervals).',
      'Trapezoidal rule: $T_n = \\frac{h}{2}[f(x_0) + 2f(x_1) + 2f(x_2) + \\cdots + 2f(x_{n-1}) + f(x_n)]$. Error bound: $|E_T| \\leq \\frac{(b-a)^3}{12n^2}\\max_{[a,b]}|f\'\'(x)|$. Note that $|E_T| \\leq 2|E_M|$ — the midpoint rule is typically twice as accurate as the trapezoidal rule for the same $n$.',
      'Simpson\'s rule ($n$ even): $S_n = \\frac{h}{3}[f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + 2f(x_4) + \\cdots + 4f(x_{n-1}) + f(x_n)]$. Error bound: $|E_S| \\leq \\frac{(b-a)^5}{180n^4}\\max_{[a,b]}|f^{(4)}(x)|$. Simpson\'s rule is exact for polynomials of degree $\\leq 3$ (the parabola fitting gives exactness for cubics as well, by a symmetry argument).',
      'Richardson extrapolation and the $S = (2M + T)/3$ identity: since $T_n$ and $M_n$ both have $O(h^2)$ errors but with different signs ($E_T \\approx ch^2$, $E_M \\approx -ch^2/2$), the combination $(2M_n + T_n)/3$ cancels the $h^2$ error term, leaving an $O(h^4)$ error — which is exactly Simpson\'s rule with $2n$ points.',
      'To determine $n$ for a desired accuracy $\\epsilon$: (1) Find $\\max|f\'\'|$ (for midpoint/trapezoidal) or $\\max|f^{(4)}|$ (for Simpson\'s). (2) Set the error bound $\\leq \\epsilon$ and solve for $n$. For Simpson\'s: $n^4 \\geq (b-a)^5 M_4 / (180\\epsilon)$ where $M_4 = \\max|f^{(4)}|$, so $n \\geq [(b-a)^5 M_4/(180\\epsilon)]^{1/4}$. Round up to the next even integer.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Error Bounds Summary',
        body: 'Midpoint: \\(|E_M| \\leq \\frac{(b-a)^3}{24n^2}M_2\\) where \\(M_2 = \\max|f\'\'|\\)\nTrapezoidal: \\(|E_T| \\leq \\frac{(b-a)^3}{12n^2}M_2\\)\nSimpson\'s: \\(|E_S| \\leq \\frac{(b-a)^5}{180n^4}M_4\\) where \\(M_4 = \\max|f^{(4)}|\\)',
      },
      {
        type: 'definition',
        title: 'Simpson\'s Rule Formula',
        body: '\\[S_n = \\frac{h}{3}[f(x_0)+4f(x_1)+2f(x_2)+4f(x_3)+\\cdots+4f(x_{n-1})+f(x_n)]\\]\nCoefficients: 1, 4, 2, 4, 2, ..., 4, 1. Requires \\(n\\) even.',
      },
      {
        type: 'strategy',
        title: 'Choosing n for Target Accuracy',
        body: 'For Simpson\'s rule with error \\(\\leq \\epsilon\\): \\(n \\geq \\left[\\frac{(b-a)^5 M_4}{180\\epsilon}\\right]^{1/4}\\), rounded up to the next even integer. For trapezoidal: \\(n \\geq \\left[\\frac{(b-a)^3 M_2}{12\\epsilon}\\right]^{1/2}\\).',
      },
    ],
    visualizations: [
      {
        id: 'RiemannSum',
        title: 'Interactive Numerical Integration',
        caption: 'Adjust n to see how quickly each method converges. The error display shows the actual error for each method. Notice: Simpson\'s error decreases 16× when n doubles, while the others decrease only 4×.',
      },
    ],
  },

  rigor: {
    prose: [
      'The trapezoidal rule error bound is derived from Taylor expansion. On each subinterval $[x_i, x_{i+1}]$, expand $f(x)$ around the midpoint $\\bar{x}_i = (x_i+x_{i+1})/2$: $f(x) = f(\\bar{x}_i) + f\'(\\bar{x}_i)(x-\\bar{x}_i) + \\frac{1}{2}f\'\'(c_x)(x-\\bar{x}_i)^2$. The trapezoid approximation on this interval is $h[f(x_i)+f(x_{i+1})]/2$. The error on this interval is $\\int_{x_i}^{x_{i+1}}f(x)\\,dx - h[f(x_i)+f(x_{i+1})]/2 = -h^3 f\'\'(c_i)/12$ for some $c_i \\in [x_i, x_{i+1}]$. Summing over all $n$ subintervals: $E_T = -\\sum_{i=0}^{n-1} h^3 f\'\'(c_i)/12 = -nh^3 f\'\'(\\bar{c})/12 = -(b-a)h^2 f\'\'(\\bar{c})/12$, using the intermediate value theorem to replace the sum of $f\'\'(c_i)$ by $nf\'\'(\\bar{c})$.',
      'The midpoint rule error is derived similarly. The local error on $[x_i, x_{i+1}]$ is $h^3 f\'\'(c_i)/24$, giving $E_M = (b-a)h^2 f\'\'(\\bar{c})/24$. Note the OPPOSITE sign compared to the trapezoidal error — the midpoint rule overshoots where the trapezoidal undershoots (for concave-up functions), and vice versa. This is why their weighted average $(2M+T)/3$ achieves cancellation.',
      'Simpson\'s rule error requires the fourth derivative. The local error of Simpson\'s rule on $[x_{i-1}, x_{i+1}]$ (a double interval of width $2h$) is $-(2h)^5 f^{(4)}(c_i)/(2880)$. Summing over $n/2$ double intervals gives $E_S = -(b-a)h^4 f^{(4)}(\\bar{c})/180$. The key fact is that Simpson\'s rule is exact not just for quadratics but for cubics — the $f\'\'\'$ error term vanishes by symmetry of the parabolic fit. This extra order of exactness is "free" and gives Simpson\'s its remarkable efficiency.',
      'Exactness for cubics (proof sketch): on a symmetric interval $[-h, h]$, the Simpson approximation for $f(x) = x^3$ gives $(h/3)[(-h)^3 + 4(0)^3 + h^3] = (h/3)(-h^3+h^3) = 0$. The exact integral $\\int_{-h}^{h} x^3\\,dx = 0$ by symmetry. So the error is zero. Since Simpson\'s rule is exact for polynomials of degree $\\leq 2$ (by construction) and exact for degree 3 (by this symmetry argument), its leading error term involves $f^{(4)}$ rather than $f^{(3)}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Simpson\'s Rule Is Exact for Cubics',
        body: 'Even though Simpson\'s rule fits parabolas (degree 2), it integrates cubics (degree 3) exactly. This is because the cubic error term vanishes by symmetry of the fitting interval. The leading error is therefore proportional to \\(f^{(4)}\\) and \\(h^4\\), not \\(f^{(3)}\\) and \\(h^3\\).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-012-ex1',
      title: 'Trapezoidal Rule: ∫₀¹ e^(−x²) dx with n = 4',
      problem: '\\text{Approximate } \\int_0^1 e^{-x^2}\\,dx \\text{ using the trapezoidal rule with } n = 4.',
      steps: [
        { expression: 'h = (1-0)/4 = 0.25, \\quad x_i = 0, 0.25, 0.5, 0.75, 1', annotation: 'Set up the partition.' },
        { expression: 'f(x_i): f(0)=1, \\; f(0.25)=e^{-0.0625}\\approx 0.9394, \\; f(0.5)=e^{-0.25}\\approx 0.7788', annotation: 'Evaluate f at grid points.' },
        { expression: 'f(0.75) = e^{-0.5625} \\approx 0.5698, \\quad f(1) = e^{-1} \\approx 0.3679', annotation: 'Remaining function values.' },
        { expression: 'T_4 = \\frac{0.25}{2}[f(0)+2f(0.25)+2f(0.5)+2f(0.75)+f(1)]', annotation: 'Trapezoidal formula: endpoints get weight 1, interior points get weight 2.' },
        { expression: '= 0.125[1+2(0.9394)+2(0.7788)+2(0.5698)+0.3679]', annotation: 'Substitute values.' },
        { expression: '= 0.125[1+1.8788+1.5576+1.1396+0.3679] = 0.125 \\times 5.9439 \\approx 0.7430', annotation: 'Sum and multiply.' },
      ],
      conclusion: 'T₄ ≈ 0.7430. The true value is about 0.7468, so the error is about 0.0038. Not bad for just 5 function evaluations!',
    },
    {
      id: 'ch4-012-ex2',
      title: 'Simpson\'s Rule: ∫₀¹ e^(−x²) dx with n = 4',
      problem: '\\text{Approximate } \\int_0^1 e^{-x^2}\\,dx \\text{ using Simpson\'s rule with } n = 4.',
      steps: [
        { expression: 'h = 0.25, \\text{ same grid as Example 1}', annotation: 'Same partition, same function values.' },
        { expression: 'S_4 = \\frac{h}{3}[f(x_0)+4f(x_1)+2f(x_2)+4f(x_3)+f(x_4)]', annotation: 'Simpson\'s coefficients: 1, 4, 2, 4, 1.' },
        { expression: '= \\frac{0.25}{3}[1+4(0.9394)+2(0.7788)+4(0.5698)+0.3679]', annotation: 'Substitute.' },
        { expression: '= \\frac{0.25}{3}[1+3.7576+1.5576+2.2792+0.3679]', annotation: 'Multiply coefficients.' },
        { expression: '= \\frac{0.25}{3}\\times 8.9623 = \\frac{2.2406}{3} \\approx 0.7469', annotation: 'Sum and compute.' },
      ],
      conclusion: 'S₄ ≈ 0.7469. The true value is 0.7468..., so the error is about 0.0001 — roughly 40 times more accurate than T₄ with the same data points!',
    },
    {
      id: 'ch4-012-ex3',
      title: 'From Experimental Data',
      problem: '\\text{A vehicle\'s speed (m/s) is measured every 2 seconds: } v(0)=0, v(2)=5, v(4)=9, v(6)=11, v(8)=10, v(10)=8. \\text{ Estimate distance traveled.}',
      steps: [
        { expression: 'n = 5 \\text{ subintervals}, \\; h = 2 \\text{ s}', annotation: 'Five intervals of width 2.' },
        { expression: 'T_5 = \\frac{2}{2}[0+2(5)+2(9)+2(11)+2(10)+8]', annotation: 'Trapezoidal rule (works with odd n, unlike Simpson\'s).' },
        { expression: '= 1[0+10+18+22+20+8] = 78 \\text{ m}', annotation: 'Sum up.' },
        { expression: '\\text{Note: } n=5 \\text{ is odd, so Simpson\'s rule is not directly applicable.}', annotation: 'We cannot use Simpson\'s with 5 subintervals. We could use it on the first 4 intervals (n=4) and the trapezoidal rule on the last.' },
      ],
      conclusion: 'Distance ≈ 78 m using the trapezoidal rule. With data (not a formula), the trapezoidal rule is the standard method.',
    },
    {
      id: 'ch4-012-ex4',
      title: 'Error Bound: How Many Points for 6-Digit Accuracy?',
      problem: '\\text{How large must } n \\text{ be for Simpson\'s rule to approximate } \\int_0^1 e^{-x^2}dx \\text{ with error} \\leq 10^{-6}?',
      steps: [
        { expression: 'f(x) = e^{-x^2}. \\text{ Need } \\max_{[0,1]}|f^{(4)}(x)|.', annotation: 'Simpson\'s error uses the 4th derivative.' },
        { expression: 'f\'(x) = -2xe^{-x^2},\\; f\'\'(x) = (4x^2-2)e^{-x^2}', annotation: 'Compute derivatives.' },
        { expression: 'f^{(4)}(x) = (16x^4-48x^2+12)e^{-x^2}', annotation: 'Fourth derivative (tedious but doable).' },
        { expression: '\\max_{[0,1]}|f^{(4)}(x)| \\leq 12 \\quad (\\text{occurs at } x=0: f^{(4)}(0) = 12)', annotation: 'Check: |f⁴(0)| = 12, and the function decreases as x increases. Use M₄ = 12.' },
        { expression: '\\frac{(1-0)^5 \\cdot 12}{180 n^4} \\leq 10^{-6} \\Rightarrow n^4 \\geq \\frac{12}{180 \\times 10^{-6}} = \\frac{12}{1.8\\times 10^{-4}} \\approx 66667', annotation: 'Set error bound ≤ 10⁻⁶ and solve for n.' },
        { expression: 'n \\geq 66667^{1/4} \\approx 16.1 \\Rightarrow n = 18 \\text{ (next even integer)}', annotation: 'Round up to next even n.' },
      ],
      conclusion: 'n = 18 subintervals (19 function evaluations) give 6-digit accuracy with Simpson\'s rule. The trapezoidal rule would need n ≈ 816 for the same accuracy.',
    },
    {
      id: 'ch4-012-ex5',
      title: 'Midpoint Rule: ∫₁³ 1/x dx with n = 4',
      problem: '\\text{Approximate } \\int_1^3 \\frac{1}{x}\\,dx \\text{ using the midpoint rule with } n = 4. \\text{ Compare with the exact value } \\ln 3 \\approx 1.0986.',
      steps: [
        { expression: 'h = (3-1)/4 = 0.5, \\quad \\bar{x}_i = 1.25, 1.75, 2.25, 2.75', annotation: 'Midpoints of each subinterval.' },
        { expression: 'M_4 = 0.5[f(1.25)+f(1.75)+f(2.25)+f(2.75)]', annotation: 'Midpoint rule formula.' },
        { expression: '= 0.5[0.8000+0.5714+0.4444+0.3636]', annotation: 'f(x) = 1/x.' },
        { expression: '= 0.5 \\times 2.1794 = 1.0897', annotation: 'Sum and multiply.' },
        { expression: '|E_M| = |1.0986-1.0897| = 0.0089', annotation: 'Error compared to ln 3.' },
      ],
      conclusion: 'M₄ ≈ 1.0897 with error 0.0089. The midpoint rule is slightly more accurate than the trapezoidal rule for the same n (T₄ ≈ 1.1167, error 0.0181).',
    },
  ],

  challenges: [
    {
      id: 'ch4-012-ch1',
      difficulty: 'easy',
      problem: 'Use the trapezoidal rule with n = 4 to approximate ∫₀² x² dx. Compare with the exact value 8/3.',
      hint: 'h = 0.5. Grid points: 0, 0.5, 1, 1.5, 2. Function values: 0, 0.25, 1, 2.25, 4.',
      walkthrough: [
        { expression: 'T_4 = \\frac{0.5}{2}[0+2(0.25)+2(1)+2(2.25)+4] = 0.25[0+0.5+2+4.5+4]', annotation: 'Apply trapezoidal formula.' },
        { expression: '= 0.25 \\times 11 = 2.75', annotation: 'Sum.' },
        { expression: '\\text{Exact: } \\int_0^2 x^2\\,dx = [x^3/3]_0^2 = 8/3 \\approx 2.6667', annotation: 'Compare.' },
        { expression: '\\text{Error: } |2.75-2.6667| = 0.0833', annotation: 'About 3% error.' },
      ],
      answer: 'T_4 = 2.75, \\text{ exact} = 8/3 \\approx 2.6667, \\text{ error} \\approx 0.083',
    },
    {
      id: 'ch4-012-ch2',
      difficulty: 'medium',
      problem: 'Use Simpson\'s rule with n = 2 to approximate ∫₀^π sin(x) dx. Show that the result is exact for this function. Explain why.',
      hint: 'n = 2 means 3 points: 0, π/2, π. Simpson\'s: (h/3)[f(0)+4f(π/2)+f(π)]. The exact value is 2.',
      walkthrough: [
        { expression: 'h = \\pi/2. \\; S_2 = \\frac{\\pi/2}{3}[\\sin 0+4\\sin(\\pi/2)+\\sin \\pi]', annotation: 'Three points: 0, π/2, π.' },
        { expression: '= \\frac{\\pi}{6}[0+4(1)+0] = \\frac{4\\pi}{6} = \\frac{2\\pi}{3} \\approx 2.094', annotation: 'Compute.' },
        { expression: '\\text{Exact: } \\int_0^\\pi \\sin x\\,dx = [-\\cos x]_0^\\pi = 1+1 = 2', annotation: 'The exact value.' },
        { expression: '\\text{Error: } |2.094-2| = 0.094. \\text{ NOT exact — sin is not a polynomial of degree} \\leq 3!', annotation: 'Simpson\'s is exact for cubics, but sin(x) is not a polynomial. Close but not exact.' },
      ],
      answer: 'S_2 = 2\\pi/3 \\approx 2.094. \\text{ Not exact (sin x is not a cubic polynomial). Error} \\approx 0.094.',
    },
    {
      id: 'ch4-012-ch3',
      difficulty: 'hard',
      problem: 'Prove that the trapezoidal rule is exact for linear functions f(x) = mx + b, and that Simpson\'s rule is exact for cubic polynomials f(x) = ax³ + bx² + cx + d. (For the Simpson\'s case, it suffices to show exactness for f(x) = x³ on [−h, h].)',
      hint: 'For the trapezoidal rule: compute both the exact integral and the trapezoidal approximation of mx+b over [x_i, x_{i+1}] and show they agree. For Simpson\'s on x³: compute (h/3)[f(−h)+4f(0)+f(h)] and ∫_{−h}^{h} x³ dx separately.',
      walkthrough: [
        { expression: '\\text{Trap for } f(x)=mx+b \\text{ on } [x_i, x_{i+1}]:', annotation: 'Single subinterval.' },
        { expression: '\\text{Exact: } \\int_{x_i}^{x_{i+1}}(mx+b)dx = [mx^2/2+bx]_{x_i}^{x_{i+1}} = m(x_{i+1}^2-x_i^2)/2+b\\cdot h', annotation: 'Direct integration.' },
        { expression: '\\text{Trap: } \\frac{h}{2}[f(x_i)+f(x_{i+1})] = \\frac{h}{2}[(mx_i+b)+(mx_{i+1}+b)] = \\frac{h}{2}[m(x_i+x_{i+1})+2b]', annotation: 'Trapezoidal approximation.' },
        { expression: 'm(x_{i+1}^2-x_i^2)/2 = m(x_{i+1}+x_i)(x_{i+1}-x_i)/2 = mh(x_i+x_{i+1})/2', annotation: 'Factor the difference of squares. Both expressions equal mh(x_i+x_{i+1})/2 + bh. ✓' },
        { expression: '\\text{Simpson for } f(x)=x^3 \\text{ on } [-h,h]:', annotation: 'Three points: −h, 0, h.' },
        { expression: '\\frac{h}{3}[(-h)^3+4(0)^3+h^3] = \\frac{h}{3}(-h^3+h^3) = 0', annotation: 'Simpson\'s approximation.' },
        { expression: '\\int_{-h}^{h}x^3\\,dx = 0 \\text{ (odd function on symmetric interval).}', annotation: 'Exact integral. Both are zero. ✓ Exact for cubics.' },
      ],
      answer: '\\text{Trapezoidal: exact for degree } \\leq 1. \\text{ Simpson: exact for degree } \\leq 3.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'area-accumulation', label: 'Area and Accumulation', context: 'Riemann sums from Lesson 0 are the conceptual foundation of all numerical integration methods.' },
    { lessonSlug: 'indefinite-integrals', label: 'Indefinite Integrals', context: 'Numerical methods are used when the antiderivative table from Lesson 4 does not cover the integrand.' },
    { lessonSlug: 'improper-integrals', label: 'Improper Integrals', context: 'Numerical methods can approximate improper integrals by truncating the infinite domain and estimating the tail.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'Many real-world applications require numerical integration because the integrands come from measured data, not formulas.' },
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
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
