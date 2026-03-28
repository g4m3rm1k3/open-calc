// FILE: src/content/chapter-3/03-curve-sketching.js
export default {
  id: 'ch3-003',
  slug: 'curve-sketching',
  chapter: 3,
  order: 3,
  title: 'Curve Sketching',
  subtitle: 'From formula to complete graph: critical points, inflection points, concavity, and asymptotes — all from derivatives alone',
  tags: ['curve sketching', 'critical points', 'local extrema', 'concavity', 'inflection points', 'first derivative test', 'second derivative test', 'asymptotes', 'sign chart'],

  hook: {
    question: "Given only the formula f(x) = x⁴ - 4x³, can you draw a precise, complete graph — showing exactly where the function rises and falls, where it has peaks and valleys, how it bends, and what it does as x → ±∞? The derivative is your complete guide. No plotting, no calculator — pure analysis.",
    realWorldContext: "Engineers, economists, and scientists need to understand the behavior of functions without plotting millions of points. A structural engineer needs to know where a beam's deflection is maximum. An economist needs to know where marginal cost equals marginal revenue. A pharmacologist needs to know when a drug reaches peak concentration. All of these are curve-sketching problems in disguise: you need to understand not just one value, but the entire qualitative behavior of a function from its formula. Calculus provides a systematic, complete procedure for this analysis — and it works for any differentiable function, no matter how complex.",
    previewVisualizationId: 'CurveSketchingBoard',
  },

  intuition: {
    prose: [
      'The complete qualitative picture of a function requires three layers of analysis. The first layer is f itself: domain (where is f defined?), x-intercepts (where does f = 0?), y-intercept (f(0)), symmetry (even/odd/neither), and asymptotes (what happens at the extremes?). The second layer is f\': where is f increasing (f\' > 0) and decreasing (f\' < 0)? Where does the function change direction (f\' = 0)? These changes of direction are local maxima and minima. The third layer is f\'\': where is the function concave up (bending upward, f\'\' > 0) and concave down (bending downward, f\'\' < 0)? Where does the concavity change (inflection points)? Together, these three layers give a complete picture.',
      'Critical points are where f\'(x) = 0 or f\'(x) is undefined. They are candidates for local extrema — but only candidates. The key tool for deciding is the first derivative test: make a sign chart for f\' by dividing the number line at the critical points and testing f\' in each interval. If f\' changes from positive to negative at c, then f has a local maximum at c (it was rising, now falling). If f\' changes from negative to positive, local minimum (was falling, now rising). If f\' does not change sign, neither — c is likely a saddle point or inflection point. The sign chart is indispensable and should be your default tool.',
      'Concavity tells you the shape of the curve between critical points. If f\'\'(x) > 0, the function is concave up — the graph looks like a bowl opening upward, tangent lines are below the curve. If f\'\'(x) < 0, concave down — tangent lines are above the curve, like a frown or an upside-down bowl. An inflection point is a point where the concavity changes — where f\'\'(x) = 0 AND f\'\' changes sign. At an inflection point, the tangent line actually crosses the curve rather than staying on one side.',
      'The second derivative test offers a quicker (but less powerful) alternative to the sign chart for classifying critical points. At a critical point c where f\'(c) = 0: if f\'\'(c) > 0, then f has a local minimum at c (the function is concave up at c, like the bottom of a bowl). If f\'\'(c) < 0, local maximum. If f\'\'(c) = 0, the test is inconclusive — the critical point could be a local max, local min, or inflection point. When the second derivative test fails, you must fall back on the first derivative test (sign chart). The reason the second derivative test works is explained by the Taylor expansion: f(x) ≈ f(c) + f\'\'(c)(x-c)²/2 near a critical point c, so the sign of f\'\'(c) determines whether f is bowl-shaped or hill-shaped there.',
      'Asymptotes come in three varieties. Horizontal asymptotes: compute lim_{x→+∞} f(x) and lim_{x→-∞} f(x). If either limit is a finite number L, then y = L is a horizontal asymptote. Vertical asymptotes: look for x values where f(x) → ±∞ — typically where a denominator equals zero or where a logarithm argument reaches 0. Oblique asymptotes: if the degree of the numerator of a rational function is exactly one more than the degree of the denominator, perform polynomial long division to find the asymptote. Many functions (polynomials, for instance) have no asymptotes; the analysis of asymptotes is most important for rational functions, log functions, and exponentials.',
      'The complete procedure for curve sketching: (1) Find the domain. (2) Find intercepts (x and y). (3) Find and classify asymptotes. (4) Compute f\', find all critical points, make a sign chart for f\' → determine increasing/decreasing intervals and classify critical points. (5) Compute f\'\', find all potential inflection points, make a sign chart for f\'\' → determine concavity and inflection points. (6) Plot a few key points (intercepts, critical points, inflection points) and connect them with a smooth curve consistent with all the information gathered. The result is a qualitatively accurate sketch that reveals the function\'s complete behavior.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'The Sign Chart Method',
        body: 'To make a sign chart for f\': (1) Find all zeros and undefined points of f\'. (2) These divide the number line into intervals. (3) Test any one point in each interval to determine the sign of f\' there. (4) + means f is increasing, - means decreasing. The sign chart for f\'\' works identically for concavity. You may have seen this called an "interval table" or "sign diagram" in precalculus.',
      },
      {
        type: 'geometric',
        title: 'Concavity: Tangent Lines Tell the Story',
        body: 'Concave up (f\'\' > 0): the function curves upward like a bowl. Tangent lines lie BELOW the curve. The function rises faster than a straight line from below. Concave down (f\'\' < 0): curves downward like a frown. Tangent lines lie ABOVE the curve. At an inflection point, the tangent line actually crosses through the curve — it switches from being below to being above.',
      },
      {
        type: 'warning',
        title: 'f\'(c) = 0 Does NOT Guarantee an Extremum',
        body: 'The classic counterexample: f(x) = x³. Here f\'(0) = 0, but f has no local extremum at 0 — instead it has an inflection point where the tangent is horizontal. The sign chart reveals this: f\'(x) = 3x² > 0 for all x ≠ 0, so f\' does NOT change sign at 0. The first derivative test always catches this; the second derivative test also catches it (f\'\'(0) = 0 ⟹ test inconclusive).',
      },
      {
        type: 'misconception',
        title: 'f\'\'(c) = 0 Does NOT Guarantee an Inflection Point',
        body: 'The counterexample: f(x) = x⁴. Here f\'\'(0) = 0, but f is concave up everywhere — there is no inflection point at 0. The sign chart for f\'\': f\'\'(x) = 12x², which is ≥ 0 everywhere and does NOT change sign at 0. An inflection point requires both f\'\'(c) = 0 AND a sign change in f\'\'.',
      },
      {
        type: 'warning',
        title: 'Differentiability Failure Cases Matter',
        body: 'Corners (|x|), cusps (x^{2/3}), vertical tangents (x^{1/3}), and wild oscillation (x^2 sin(1/x^2) near 0) break naive derivative assumptions. Always check where f\' is undefined before building sign charts.',
      },
    ],
    visualizations: [
                                                                                  {
        id: 'RollerCoaster',
        title: 'Roller Coaster Physics: Tangents & Curvature',
        caption: 'The thrill of a roller coaster is all about the derivatives: the slope (first derivative) and the g-force from concavity (second derivative).',
      },
      {
        id: 'RollerCoasterDeep',
        title: 'Deep G-Force Analysis: The Vector Calculus of Thrills',
        caption: 'Go beyond the slope. Explore how the normal acceleration (g-force) is a direct consequence of the second derivative and the radius of curvature.',
      },
      {
        id: 'CurveSketchingBoard',
        title: 'Full Curve Analysis — Annotated',
        caption: 'Select a function from the menu. See f, f\', and f\'\' plotted together, with local extrema, inflection points, and concavity regions all labeled.',
      },
      {
        id: 'SignChartBuilder',
        title: 'Interactive Sign Chart Builder',
        caption: 'Adjust polynomial coefficients and watch f\' and f\'\' sign charts update instantly. This makes first/second derivative tests procedural and visual.',
      },
    ],
  },

  math: {
    prose: [
      'First Derivative Test (theorem): Suppose f is continuous on (a,b) and differentiable on (a,b) except possibly at c. If f\'(x) > 0 on (a,c) and f\'(x) < 0 on (c,b), then f has a local maximum at c. If f\'(x) < 0 on (a,c) and f\'(x) > 0 on (c,b), then f has a local minimum at c. If f\' does not change sign at c, f has neither a local max nor a local min at c. The proof follows directly from the MVT corollary: f\' > 0 implies increasing (so f rises to c from the left), f\' < 0 implies decreasing (so f falls away from c to the right) — that is the definition of a local maximum.',
      'Second Derivative Test (theorem): Suppose f\'(c) = 0 and f\'\' is continuous near c. If f\'\'(c) > 0, then f has a local minimum at c. If f\'\'(c) < 0, local maximum. If f\'\'(c) = 0, inconclusive. The proof uses the Taylor expansion: f(x) = f(c) + f\'(c)(x-c) + f\'\'(c)(x-c)²/2 + O((x-c)³). Since f\'(c) = 0, this simplifies to f(x) - f(c) ≈ f\'\'(c)(x-c)²/2. If f\'\'(c) > 0, then (x-c)² > 0 for x ≠ c, so f(x) - f(c) > 0 for x near c — local minimum. If f\'\'(c) < 0, f(x) - f(c) < 0 — local maximum.',
      'Concavity theorem: f is concave up on an interval I if and only if f\'\'(x) ≥ 0 for all x ∈ I. f is concave down if and only if f\'\'(x) ≤ 0. These follow from the MVT applied to f\': f is concave up iff f\' is increasing iff (f\')\' = f\'\' ≥ 0. The characterization via tangent lines: f is concave up on I iff for all a,b ∈ I and all t ∈ (a,b), the chord from (a,f(a)) to (b,f(b)) lies above f — this is the geometric definition and it is equivalent to f\'\'≥0 for smooth functions.',
      'Asymptote analysis for rational functions: horizontal asymptotes are determined by the leading terms. If deg(numerator) < deg(denominator), y = 0. If equal degrees, y = ratio of leading coefficients. If deg(numerator) = deg(denominator) + 1, oblique asymptote via long division. Vertical asymptotes at zeros of the denominator where the function is not defined (and the function → ±∞). For exponential and logarithmic functions: lim_{x→∞} e^(-x) = 0 (horizontal asymptote y = 0), lim_{x→0⁺} ln(x) = -∞ (vertical asymptote x = 0).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'First Derivative Test',
        body: 'If f\'> 0 on (a,c) and f\'< 0 on (c,b): local max at c.\nIf f\'< 0 on (a,c) and f\'> 0 on (c,b): local min at c.\nIf no sign change: neither.',
      },
      {
        type: 'theorem',
        title: 'Second Derivative Test',
        body: "If f'(c) = 0 and f'' \\text{ continuous near } c:\n\\begin{cases} f''(c) > 0 \\Rightarrow \\text{local min} \\\\ f''(c) < 0 \\Rightarrow \\text{local max} \\\\ f''(c) = 0 \\Rightarrow \\text{inconclusive} \\end{cases}",
      },
      {
        type: 'definition',
        title: 'Inflection Point',
        body: 'c is an inflection point of f if f is continuous at c AND f\'\' changes sign at c (from + to -, or - to +). It is NOT sufficient for f\'\'(c) = 0 alone.',
      },
    ],
    visualizations: [
            {
        id: 'NewtonsMethod',
        title: "Newton's Method — Finding Roots via Tangent Lines",
        caption: "Each step follows the tangent line to its x-intercept, giving the next guess. Convergence is quadratic — the number of correct decimal places doubles every step. This is how your calculator computes √2.",
      },
    ],
  },

  rigor: {
    prose: [
      'Proof of the first derivative test from the MVT: Suppose f\'(x) > 0 on (a,c) and f\'(x) < 0 on (c,b). For any x ∈ (a,c), apply the MVT to f on [x,c]: f(c) - f(x) = f\'(s)(c-x) for some s ∈ (x,c). Since s ∈ (a,c), f\'(s) > 0 and c-x > 0, so f(c) - f(x) > 0, giving f(c) > f(x). For any x ∈ (c,b), apply MVT to f on [c,x]: f(x) - f(c) = f\'(s)(x-c) for some s ∈ (c,x). Since s ∈ (c,b), f\'(s) < 0 and x-c > 0, so f(x) - f(c) < 0, giving f(x) < f(c). Therefore f(c) ≥ f(x) for all x near c — this is a local maximum. The proof of the local minimum case is analogous.',
      'Why the second derivative test works — the Taylor expansion argument in full: Suppose f\'(c) = 0 and f\'\'(c) > 0. We want to show f(c) is a local minimum. By continuity of f\'\', there exists δ > 0 such that f\'\'(x) > 0 for all x ∈ (c-δ, c+δ). For any x ∈ (c-δ, c+δ) with x ≠ c, apply the MVT to f\' on [c,x] (or [x,c]): f\'(x) - f\'(c) = f\'\'(s)(x-c) for some s between c and x. Since s ∈ (c-δ, c+δ), f\'\'(s) > 0. Also f\'(c) = 0, so f\'(x) = f\'\'(s)(x-c). For x > c: x-c > 0 and f\'\'(s) > 0, so f\'(x) > 0. For x < c: x-c < 0 and f\'\'(s) > 0, so f\'(x) < 0. Therefore f\' changes sign from - to + at c — by the first derivative test, c is a local minimum. ∎ This proof reveals the true logic: the second derivative test works because f\'\'> 0 forces f\' to be increasing, and f\' going from - to + is exactly the first derivative test for a minimum.',
      'The second derivative test fails when f\'\'(c) = 0 because f\' might increase or decrease at c without f\'\' committing to a definite sign. The examples f(x) = x⁴ (local min at 0, f\'\'(0) = 0), f(x) = -x⁴ (local max at 0, f\'\'(0) = 0), and f(x) = x³ (inflection, f\'\'(0) = 0) all have f\'(0) = 0 and f\'\'(0) = 0 but different behavior. The first derivative test always works in these cases and is the definitive test.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Second Derivative Test = First Derivative Test + Continuity of f\'\'',
        body: 'The second derivative test ultimately reduces to the first derivative test. If f\'\'(c) > 0, then by continuity, f\'\'> 0 near c, making f\' increasing near c. Since f\'(c) = 0, f\' goes from negative (left of c) to positive (right of c) — exactly the first derivative test for a local minimum. The second derivative test is a shortcut that avoids computing the full sign chart.',
      },
    ],
    visualizations: [
      ],
  },

  examples: [
    {
      id: 'ch3-003-ex1',
      title: 'Sketch f(x) = x³ - 3x',
      problem: '\\text{Completely sketch } f(x) = x^3 - 3x: \\text{ find all intercepts, critical points, inflection points, and concavity.}',
      visualizationId: 'CurveSketchingBoard',
      steps: [
        { expression: "f'(x) = 3x^2 - 3 = 3(x^2 - 1) = 3(x-1)(x+1)", annotation: 'Derivative factored. Critical points at x = ±1.', hints: ['Power rule: d/dx[x³] = 3x² and d/dx[-3x] = -3.', 'Factor out the common 3.', 'Use the difference of squares: x² - 1 = (x-1)(x+1).'] },
        { expression: "f'(x) > 0 \\text{ on } (-\\infty,-1), \\quad f'(x) < 0 \\text{ on } (-1,1), \\quad f'(x) > 0 \\text{ on } (1,\\infty)", annotation: 'Sign chart for f\': f\' = 3(x-1)(x+1). Test x = -2: 3(3)(-1) < 0... actually + + = + > 0. Test x = 0: 3(-1)(1) < 0. Test x = 2: 3(1)(3) > 0. ✓', hints: ['Pick a test point like x = -2 in the first interval.', 'Check the sign: 3(-2-1)(-2+1) = 3(-3)(-1) is positive.', 'Repeat for intervals (-1, 1) and (1, ∞).'] },
        { expression: "f''(x) = 6x", annotation: 'Second derivative.', hints: ['Differentiate f\'(x) = 3x² - 3.', 'Power rule again: d/dx[3x²] = 6x.', 'The constant -3 vanishes.'] },
        { expression: "f''(-1) = -6 < 0 \\Rightarrow \\text{local max at } x = -1", annotation: 'Second derivative test: f\'\'(-1) < 0 confirms local maximum.', hints: ['Plug the critical point x = -1 into f\'\'(x).', 'Recall the rule: f\'\' < 0 means "concave down" (a frowny shape).', 'A horizontal tangent on a frowny curve is a maximum.'] },
        { expression: 'f(-1) = -1 + 3 = 2', annotation: 'Local maximum value: f(-1) = 2. Point: (-1, 2).', hints: ['Plug x = -1 back into the ORIGINAL function f(x) = x³ - 3x.', 'Calculation: (-1)³ - 3(-1) = -1 + 3.'] },
        { expression: "f''(1) = 6 > 0 \\Rightarrow \\text{local min at } x = 1", annotation: 'f\'\'(1) > 0 confirms local minimum.', hints: ['Plug the critical point x = 1 into f\'\'(x) = 6x.', 'Calculation: 6(1) = 6, which is positive.', 'f\'\' > 0 means "concave up" (a smiley shape).'] },
        { expression: 'f(1) = 1 - 3 = -2', annotation: 'Local minimum value: f(1) = -2. Point: (1, -2).', hints: ['Plug x = 1 into the original function f(x).', 'Calculation: (1)³ - 3(1) = 1 - 3.'] },
        { expression: "f''(x) = 6x = 0 \\Rightarrow x = 0 \\text{ (inflection point)}", annotation: 'f\'\' changes sign at x = 0 (negative for x < 0, positive for x > 0). Inflection point at (0, f(0)) = (0, 0).', hints: ['Set the second derivative equal to zero.', 'Check if the sign of f\'\' actually changes at x = 0.', 'Find the y-coordinate: f(0).'] },
        { expression: 'x\\text{-intercepts: } x^3 - 3x = x(x^2-3) = 0 \\Rightarrow x = 0, \\pm\\sqrt{3}', annotation: 'Factor to find x-intercepts.', hints: ['Factor out the common x from x³ - 3x.', 'Solve x² - 3 = 0 for the remaining roots.'] },
      ],
      conclusion: 'f(x) = x³ - 3x: rising on (-∞,-1) ∪ (1,∞), falling on (-1,1). Local max at (-1,2), local min at (1,-2). Inflection at (0,0) — concave down for x < 0, up for x > 0. X-intercepts at 0 and ±√3. Odd function (symmetric about origin). As x → ±∞, f → ±∞.',
    },
    {
      id: 'ch3-003-ex2',
      title: 'Sketch f(x) = x⁴ - 4x³ (the hook function)',
      problem: '\\text{Completely analyze } f(x) = x^4 - 4x^3.',
      steps: [
        { expression: "f'(x) = 4x^3 - 12x^2 = 4x^2(x - 3)", annotation: 'Factor the derivative.', hints: ['Power rule: d/dx[x⁴] = 4x³ and d/dx[-4x³] = -12x².', 'Factor out the greatest common factor: 4x².'] },
        { expression: "f'(x) = 0 \\Rightarrow x = 0 \\text{ or } x = 3", annotation: 'Critical points at x = 0 and x = 3.', hints: ['Set the factored version 4x²(x-3) equal to 0.', '4x² = 0 gives x = 0.', 'x-3 = 0 gives x = 3.'] },
        { expression: "\\text{Sign chart: } f' < 0 \\text{ for } x < 0, \\; f' < 0 \\text{ for } 0 < x < 3, \\; f' > 0 \\text{ for } x > 3", annotation: 'Test x = -1: 4(1)(-4) < 0. Test x = 1: 4(1)(-2) < 0. Test x = 4: 4(16)(1) > 0. Note: f\' < 0 on BOTH sides of x=0.', hints: ['Use test points like x = -1, x = 1, and x = 4.', 'For x = 1: 4(1)²(1-3) = 4(-2) = -8 (negative).', 'Notice that x² is always positive, so only (x-3) changes sign.'] },
        { expression: "f' \\text{ does NOT change sign at } x = 0 \\Rightarrow \\text{no local extremum at } 0", annotation: 'Since f\' stays negative through x = 0, the first derivative test gives neither max nor min. This is an inflection-like point.', hints: ['To be a local max or min, the derivative MUST change sign (+/–).', 'Here, f is decreasing, pauses at zero, then keeps decreasing.'] },
        { expression: "f' \\text{ changes from } - \\text{ to } + \\text{ at } x = 3 \\Rightarrow \\text{local minimum at } x = 3", annotation: 'Local minimum at x = 3.', hints: ['Check the sign chart: descending to the left, rising to the right.', 'This fulfills the "valley" shape requirement for a local min.'] },
        { expression: 'f(3) = 81 - 108 = -27', annotation: 'Local minimum value: -27. Point (3, -27).', hints: ['Substitute x = 3 into the original function f(x) = x⁴ - 4x³.', '3⁴ = 81, 4(3)³ = 4(27) = 108.'] },
        { expression: "f''(x) = 12x^2 - 24x = 12x(x-2)", annotation: 'Second derivative.', hints: ['Differentiate f\'(x) = 4x³ - 12x².', 'Power rule: 4(3)x² - 12(2)x = 12x² - 24x.', 'Factor out the common 12x.'] },
        { expression: "f''(x) = 0 \\Rightarrow x = 0 \\text{ or } x = 2", annotation: 'Potential inflection points.', hints: ['Set 12x(x-2) equal to zero.', 'Roots at x = 0 and x = 2.'] },
        { expression: "f'' < 0 \\text{ on } (0,2), \\; f'' > 0 \\text{ on } (-\\infty,0) \\cup (2,\\infty)", annotation: 'Sign chart for f\'\'. Inflection points at x = 0 and x = 2, confirmed by sign changes.', hints: ['Test points like x = -1, x = 1, and x = 3.', 'x = 1: 12(1)(1-2) = -12 (negative/concave down).'] },
        { expression: 'f(0) = 0, \\; f(2) = 16 - 32 = -16', annotation: 'Inflection points: (0,0) and (2,-16).', hints: ['Substitute inflection candidates x = 0 and x = 2 into f(x).', 'f(2) = 2⁴ - 4(2)³ = 16 - 32 = -16.'] },
      ],
      conclusion: 'f(x) = x⁴ - 4x³: decreasing on (-∞, 3), increasing on (3,∞). Local (and global) minimum at (3,-27). Inflection points at (0,0) and (2,-16). Concave up on (-∞,0) and (2,∞), concave down on (0,2). As x → ±∞, f → +∞ (even-degree leading term is positive). Y-intercept at (0,0).',
    },
    {
      id: 'ch3-003-ex3',
      title: 'Sketch the Rational Function f(x) = x/(x²+1)',
      problem: '\\text{Analyze } f(x) = \\dfrac{x}{x^2+1}: \\text{ asymptotes, critical points, concavity.}',
      steps: [
        { expression: '\\lim_{x \\to \\pm\\infty} \\frac{x}{x^2+1} = \\lim_{x\\to\\pm\\infty}\\frac{1/x}{1+1/x^2} = 0', annotation: 'Horizontal asymptote: y = 0 (both directions). No vertical asymptotes since x²+1 > 0 always.', hints: ['To find limits at infinity, divide numerator and denominator by the highest power of x in the denominator: x².', '1/x and 1/x² approach 0 as x → ∞.', 'The denominator x² + 1 has no real roots since x² ≥ 0, so no vertical asymptotes.'] },
        { expression: "f'(x) = \\frac{(x^2+1) - x(2x)}{(x^2+1)^2} = \\frac{1 - x^2}{(x^2+1)^2}", annotation: 'Quotient rule derivative.', hints: ['Use (u/v)\' = (u\'v - uv\') / v² where u = x and v = x² + 1.', 'Numerator becomes 1·(x² + 1) – x·(2x).', 'Simplify: x² + 1 – 2x² = 1 – x².'] },
        { expression: "f'(x) = 0 \\Rightarrow 1 - x^2 = 0 \\Rightarrow x = \\pm 1", annotation: 'Critical points at x = ±1. Denominator is always positive.', hints: ['Set the numerator 1 – x² = 0.', 'Factor: (1-x)(1+x) = 0.', 'Solving gives x = 1 and x = -1.'] },
        { expression: "f' > 0 \\text{ on } (-1,1), \\; f' < 0 \\text{ on } (-\\infty,-1) \\cup (1,\\infty)", annotation: 'Sign of 1-x²: positive for |x| < 1, negative for |x| > 1. So f increases on (-1,1) and decreases elsewhere.', hints: ['Pick test points: x=0 (middle), x=-2 (left), x=2 (right).', 'At x=0: (1 – 0²) / (0² + 1)² = 1 (positive).', 'At x=2: (1 – 4) / (4 + 1)² = -3/25 (negative).'] },
        { expression: 'f(-1) = -1/2 \\text{ (local min)}, \\quad f(1) = 1/2 \\text{ (local max)}', annotation: 'Local minimum at (-1,-1/2), local maximum at (1,1/2).', hints: ['Plug x = -1 into f(x) = x / (x² + 1): -1 / ((-1)² + 1) = -1/2.', 'Plug x = 1 into f(x): 1 / (1² + 1) = 1/2.'] },
        { expression: "f''(x) = \\frac{-2x(x^2+1)^2 - (1-x^2) \\cdot 2(x^2+1)(2x)}{(x^2+1)^4} = \\frac{2x(x^2-3)}{(x^2+1)^3}", annotation: 'Second derivative (simplified). Inflection points where numerator = 0: x = 0 or x = ±√3.', hints: ['Use quotient rule on f\'(x) = (1-x²)/(x²+1)².', 'Factor out common terms like 2x(x²+1) from the numerator.', 'Simplifying gives 2x(x²-3) as the determining factor.'] },
        { expression: '\\text{Inflection points: } (0,0), (\\sqrt{3}, \\sqrt{3}/4), (-\\sqrt{3}, -\\sqrt{3}/4)', annotation: 'Verify sign changes in f\'\'.', hints: ['Set 2x(x² - 3) = 0 for inflection candidates: x = 0, x = √3, x = –√3.', 'Substitute candidate x values into the original f(x).', 'f(√3) = √3 / ((√3)² + 1) = √3 / 4.'] },
      ],
      conclusion: 'The function x/(x²+1) is odd (f(-x) = -f(x)), bounded between -1/2 and 1/2. It resembles a scaled arctan curve: rises from 0, peaks at (1, 1/2), descends, returns to the asymptote y=0. It has three inflection points. The function is sometimes called the "witch of Agnesi" derivative.',
    },
    {
      id: 'ch3-003-ex4',
      title: 'Sketch the Bell Curve f(x) = e^(-x²)',
      problem: '\\text{Analyze } f(x) = e^{-x^2}.',
      steps: [
        { expression: 'f(0) = 1, \\; \\lim_{x \\to \\pm\\infty} e^{-x^2} = 0', annotation: 'Y-intercept at (0,1). Horizontal asymptote y = 0 in both directions. No zeros (e^anything > 0 always). Even function (symmetric about y-axis).', hints: ['Substitute x = 0 to find the y-intercept: e⁰ = 1.', 'Evaluate limit as x → ±∞: the exponent -x² → -∞, making e^{-x²} → 0.', 'Note: f(-x) = e^{-(-x)²} = e^{-x²}, so the curve is symmetric.'] },
        { expression: "f'(x) = -2x\\,e^{-x^2}", annotation: 'Chain rule: derivative of e^u is e^u·u\', where u = -x², u\' = -2x.', hints: ['d/dx[e^{u(x)}] = e^{u(x)} · u\'(x).', 'Let u = -x², so u\' = -2x.', 'The resulting derivative is e^{-x²} · (-2x).'] },
        { expression: "f'(x) = 0 \\Rightarrow x = 0", annotation: 'Only critical point at x = 0.', hints: ['The exponential e^{-x²} is NEVER zero.', 'Thus f\'(x) = 0 ONLY if -2x = 0.', 'Solving gives x = 0.'] },
        { expression: "f' > 0 \\text{ for } x < 0, \\; f' < 0 \\text{ for } x > 0 \\Rightarrow \\text{local (global) max at } (0,1)", annotation: 'Sign of -2x·e^{-x²}: the exponential is always positive. Sign = sign of -2x. So f\' > 0 for x < 0, < 0 for x > 0.', hints: ['Test points: x = -1 (f\' = -2(-1)e⁻¹ is positive), and x = 1 (f\' = -2(1)e⁻¹ is negative).', 'Since f\' changes from + to –, x = 0 is a maximum.', 'Recall f(0) = 1.'] },
        { expression: "f''(x) = -2e^{-x^2} + (-2x)(-2x)e^{-x^2} = e^{-x^2}(4x^2 - 2)", annotation: 'Differentiate f\' using product rule.', hints: ['Differentiate u·v where u = -2x and v = e^{-x²}.', 'u\'v + uv\' = (-2)e^{-x²} + (-2x)(-2xe^{-x²}).', 'Factor out common e^{-x²} to find potential inflection points.'] },
        { expression: "f''(x) = 0 \\Rightarrow 4x^2 - 2 = 0 \\Rightarrow x = \\pm\\frac{1}{\\sqrt{2}}", annotation: 'Inflection points at x = ±1/√2 ≈ ±0.707.', hints: ['Set 4x² - 2 = 0 to find inflection points.', '4x² = 2 implies x² = 1/2.', 'Solve for x: ±√(1/2) = ±1/√2.'] },
        { expression: 'f(\\pm 1/\\sqrt{2}) = e^{-1/2} \\approx 0.607', annotation: 'Inflection points at (±1/√2, e^{-1/2}).', hints: ['Substitute ±1/√2 into the original f(x) = e^{-x²}.', 'The square of 1/√2 is 1/2.', 'f(1/√2) = e^{-(1/2)}.'] },
      ],
      conclusion: 'The bell curve e^{-x²} has a global maximum at (0,1), inflection points at (±1/√2, e^{-1/2}), is concave down between the inflection points and concave up outside. It is symmetric, always positive, and approaches 0 as x → ±∞. The normal distribution\'s pdf is (1/√(2π))·e^{-x²/2}, a scaled and stretched version.',
    },
    {
      id: 'ch3-003-ex5',
      title: 'Sketch f(x) = x - sin(x) on [0, 2π]',
      problem: '\\text{Analyze } f(x) = x - \\sin(x) \\text{ on } [0, 2\\pi].',
      steps: [
        { expression: "f'(x) = 1 - \\cos(x)", annotation: 'Derivative.', hints: ['d/dx[x] = 1.', 'd/dx[-sin(x)] = -cos(x).', 'f\'(x) = 1 - cos(x).'] },
        { expression: "f'(x) = 0 \\Rightarrow \\cos(x) = 1 \\Rightarrow x = 0, 2\\pi \\text{ (on } [0,2\\pi])", annotation: 'Critical points only at the endpoints of the interval.', hints: ['Set 1 – cos(x) = 0.', 'Find x such that cos(x) = 1.', 'On [0, 2π], the solutions are 0 and 2π.'] },
        { expression: "f'(x) = 1 - \\cos(x) \\geq 0 \\text{ always (since } \\cos(x) \\leq 1)", annotation: 'f is non-decreasing on [0, 2π]. It is strictly increasing except at x = 0 and 2π where f\' = 0 momentarily.', hints: ['Recall the range of cosine: -1 ≤ cos(x) ≤ 1.', 'The smallest value of f\' is 1 - 1 = 0, so f never decreases.', 'The curve is always flat or rising.'] },
        { expression: "f''(x) = \\sin(x)", annotation: 'Second derivative.', hints: ['Differentiate f\'(x) = 1 – cos(x).', 'd/dx[1] = 0.', 'd/dx[-cos(x)] = sin(x).'] },
        { expression: "f''(x) = 0 \\Rightarrow x = 0, \\pi, 2\\pi \\text{ on } [0,2\\pi]", annotation: 'Potential inflection points.', hints: ['Set sin(x) = 0.', 'Roots for sine are multiples of π.', 'Within our range [0, 2π], this occurs at 0, π, and 2π.'] },
        { expression: 'f\'\'\\text{ changes sign at } x=\\pi: \\sin(x) > 0 \\text{ on } (0,\\pi), \\sin(x) < 0 \\text{ on } (\\pi,2\\pi)', annotation: 'Inflection point at x = π.', hints: ['Check the sign of sin(x) in (0, π) – it\'s positive (concave up).', 'Check sign in (π, 2π) – it\'s negative (concave down).'] },
        { expression: 'f(0) = 0, \\; f(\\pi) = \\pi \\approx 3.14, \\; f(2\\pi) = 2\\pi \\approx 6.28', annotation: 'Key values. At x = π, f(π) = π - sin(π) = π.', hints: ['Substitute x = π into f(x) = x – sin(x).', 'f(π) = π – sin(π) = π – 0 = π.', 'Coordinate of inflection point: (π, π).'] },
      ],
      conclusion: 'f(x) = x - sin(x) is always increasing (f\' ≥ 0), ranging from 0 at x=0 to 2π at x=2π. Concave up on (0,π) and concave down on (π,2π), with inflection point at (π, π). The function is the integral of 1-cos(x), which appears in the area under a cycloid.',
    },
    {
      id: 'ch3-003-ex6',
      title: 'Sketch f(x) = ln(x)/x on (0, ∞)',
      problem: '\\text{Analyze } f(x) = \\dfrac{\\ln(x)}{x} \\text{ on } (0, \\infty).',
      steps: [
        { expression: '\\lim_{x \\to 0^+} \\frac{\\ln(x)}{x} = -\\infty', annotation: 'As x → 0⁺: ln(x) → -∞ and 1/x → +∞, so the product → -∞. Vertical asymptote behavior at x = 0.', hints: ['ln(x) approaches –∞ as x approaches 0 from the right.', 'x is small and positive, so 1/x approaches +∞.', '(–∞) · (+∞) gives –∞.'] },
        { expression: '\\lim_{x \\to +\\infty} \\frac{\\ln(x)}{x} = 0', annotation: 'As x → ∞: x grows much faster than ln(x) (by L\'Hôpital: (1/x)/1 → 0). Horizontal asymptote y = 0.', hints: ['Both ln(x) and x approach ∞, an indeterminate form ∞/∞.', 'Use L\'Hôpital\'s Rule: differentiate numerator and denominator.', 'lim (1/x) / (1) = lim (1/x) = 0.'] },
        { expression: "f'(x) = \\frac{(1/x) \\cdot x - \\ln(x) \\cdot 1}{x^2} = \\frac{1 - \\ln(x)}{x^2}", annotation: 'Quotient rule. Numerator: (1/x)·x - ln(x)·1 = 1 - ln(x).', hints: ['Let u = ln(x) and v = x.', '(u\'v – uv\') / v² = ((1/x)·x – ln(x)·1) / x².', 'Simplify (1/x)·x to 1.'] },
        { expression: "f'(x) = 0 \\Rightarrow 1 - \\ln(x) = 0 \\Rightarrow \\ln(x) = 1 \\Rightarrow x = e", annotation: 'Critical point at x = e.', hints: ['Set the numerator 1 – ln(x) equal to zero.', 'Rearrange: ln(x) = 1.', 'Exponentiate both sides: e^{ln(x)} = e¹, so x = e.'] },
        { expression: "f' > 0 \\text{ for } x \\in (0, e), \\; f' < 0 \\text{ for } x > e \\Rightarrow \\text{local (global) max at } x = e", annotation: 'Sign of 1 - ln(x): positive when ln(x) < 1 (x < e), negative when x > e.', hints: ['Test a point x = 1: 1 – ln(1) = 1 (positive, rising).', 'Test a point x = e²: 1 – ln(e²) = 1 – 2 = -1 (negative, falling).', 'Rising then falling confirms a maximum.'] },
        { expression: 'f(e) = \\frac{\\ln(e)}{e} = \\frac{1}{e}', annotation: 'Maximum value: 1/e at x = e.', hints: ['Substitute x = e into the original function f(x) = ln(x)/x.', 'f(e) = ln(e) / e = 1/e.'] },
        { expression: 'f(1) = 0 \\text{ (x-intercept)}', annotation: 'The function crosses zero at x = 1 (ln(1) = 0).', hints: ['Find where f(x) = 0.', 'ln(x) / x = 0 implies the numerator ln(x) = 0.', 'Solving gives x = 1.'] },
      ],
      conclusion: 'ln(x)/x rises from -∞ to a maximum of 1/e at x = e, then decreases toward 0 asymptotically. The x-intercept is at x = 1. The maximum at x = e is the key value — this function appears in the optimization of x^(1/x) (which has a maximum also at x = e, giving e^(1/e)).',
    },
    {
      id: 'ch3-003-ex7',
      title: 'All Local Extrema of a Cubic',
      problem: '\\text{Find all local extrema of } f(x) = 2x^3 - 3x^2 - 12x + 4.',
      steps: [
        { expression: "f'(x) = 6x^2 - 6x - 12 = 6(x^2 - x - 2) = 6(x-2)(x+1)", annotation: 'Factor the derivative.', hints: ['Power rule for terms: 2(3)x² – 3(2)x – 12.', 'Factor out common 6: 6(x² – x – 2).', 'Factor polynomial: (x-2)(x+1).'] },
        { expression: "f'(x) = 0 \\Rightarrow x = 2 \\text{ or } x = -1", annotation: 'Critical points.', hints: ['Set factored expression to zero.', 'Roots are 2 and -1.'] },
        { expression: "f''(x) = 12x - 6", annotation: 'Second derivative.', hints: ['Differentiate f\'(x) = 6x² – 6x – 12.', 'd/dx[6x²] = 12x, d/dx[-6x] = -6.'] },
        { expression: "f''(-1) = -12 - 6 = -18 < 0 \\Rightarrow \\text{local max at } x = -1", annotation: 'Second derivative test: f\'\'(-1) < 0 → local max.', hints: ['Value: 12(–1) – 6 = –18.', 'Since result is negative, curvature is down (maximum).'] },
        { expression: 'f(-1) = -2 - 3 + 12 + 4 = 11', annotation: 'Local maximum value: 11. Point (-1, 11).', hints: ['Calculation: 2(-1)³ – 3(-1)² – 12(-1) + 4.', 'Simplify: –2 – 3 + 12 + 4 = 11.'] },
        { expression: "f''(2) = 24 - 6 = 18 > 0 \\Rightarrow \\text{local min at } x = 2", annotation: 'Second derivative test: f\'\'(2) > 0 → local min.', hints: ['Value: 12(2) – 6 = 18.', 'Positive result → curvature is up (minimum).'] },
        { expression: 'f(2) = 16 - 12 - 24 + 4 = -16', annotation: 'Local minimum value: -16. Point (2, -16).', hints: ['Calculation: 2(2)³ – 3(2)² – 12(2) + 4.', 'Simplify: 16 – 12 – 24 + 4 = –16.'] },
      ],
      conclusion: 'f(x) = 2x³ - 3x² - 12x + 4 has a local maximum at (-1, 11) and a local minimum at (2, -16). The function rises on (-∞,-1), falls on (-1,2), and rises on (2,∞). The inflection point is where f\'\' = 0: 12x - 6 = 0, x = 1/2, f(1/2) = 2(1/8) - 3(1/4) - 6 + 4 = 1/4 - 3/4 - 2 = -5/2. Inflection at (1/2, -5/2).',
    },
    {
      id: 'ch3-003-ex8',
      title: 'Maximum Height of a Thrown Ball (Physics)',
      problem: 'A ball is thrown vertically upward from ground level with initial velocity $v_0 = 64$ ft/s. Its height is $h(t) = 64t - 16t^2$ feet. (a) Find the maximum height and when it occurs. (b) Interpret $h\'(t)$ and $h\'\'(t)$ physically. (c) Sketch $h(t)$, $h\'(t)$, $h\'\'(t)$ and identify all key features.',
      visualizationId: 'VerticalThrow',
      steps: [
        { expression: "h'(t) = 64 - 32t", annotation: 'Velocity: power rule gives d/dt[64t]=64 and d/dt[-16t²]=-32t. This is v(t) = 64 - 32t, which decreases linearly — the ball slows as it rises.', hints: ['h\'(t) represents the rate of change of height, or velocity.', 'Rule: d/dt[tⁿ] = n·tⁿ⁻¹.', '64(1) - 16(2)t = 64 - 32t.'] },
        { expression: "h'(t) = 0 \\Rightarrow 64 - 32t = 0 \\Rightarrow t = 2 \\text{ s}", annotation: 'Maximum height when velocity = 0. The ball momentarily stops at t=2 s — this is the critical point. Set h\'=0 and solve.', hints: ['At the peak, velocity must be zero.', 'Set 64 – 32t = 0.', 'Subtract 64: –32t = –64. Divide by –32: t = 2.'] },
        { expression: "h''(t) = -32 \\text{ ft/s}^2", annotation: 'Acceleration is constant at -32 ft/s² — this is gravitational deceleration (g ≈ 32 ft/s² downward). h\'\'< 0 everywhere confirms every critical point is a maximum.', hints: ['Acceleration is the second derivative of position.', 'Differentiate 64 – 32t.', 'The constant –32 means the velocity decreases by 32 ft/s every second.'] },
        { expression: "h(2) = 64(2) - 16(4) = 128 - 64 = 64 \\text{ ft}", annotation: 'Maximum height: substitute t=2 into h(t). The ball reaches 64 feet — same as the initial velocity numerically (not a coincidence: h_max = v₀²/64).', hints: ['Substitute t = 2 into the ORIGINAL height formula h(t).', 'h(2) = 64(2) – 16(2)². Calculation: 128 – 64.'] },
        { expression: "h(t) = 0 \\Rightarrow 16t(4 - t) = 0 \\Rightarrow t = 0 \\text{ and } t = 4 \\text{ s}", annotation: 'Ball returns to ground at t=4 s. Total airtime = 4 s = 2 × (time to peak), as expected by symmetry.', hints: ['Set the height equal to 0.', 'Factor out 16t: 16t(4 – t) = 0.', 'Roots at t = 0 (launch) and t = 4 (landing).'] },
        { expression: "\\text{Sign chart: } h'(t) > 0 \\text{ on } (0,2), \\quad h'(t) < 0 \\text{ on } (2,4)", annotation: 'Ball rises for t∈(0,2) and falls for t∈(2,4). The maximum at t=2 is confirmed by the sign change + to -.', hints: ['Test t = 1: 64 – 32(1) = 32 (positive, rising).', 'Test t = 3: 64 – 32(3) = 64 – 96 = -32 (negative, falling).'] },
        { expression: "h''(t) = -32 < 0 \\text{ for all } t", annotation: 'h\'\'< 0 everywhere: h is concave down for its entire domain. This means h\'(t) is always decreasing — the ball continuously decelerates under gravity.', hints: ['Since h\'\' is negative and constant, the curve of h(t) is a downward-opening parabola.', 'The velocity h\'(t) is a decreasing linear function.'] },
      ],
      conclusion: 'Maximum height of 64 ft at t=2 s, confirmed by three methods: (1) h\'(2)=0 is a critical point, (2) h\'\'=-32<0 confirms local max, (3) sign chart shows h\' changes + to -. The constant h\'\'=-32 means gravity pulls the ball down with constant acceleration throughout. The graph of h(t) is a downward parabola — symmetric about its peak. The graph of h\'(t)=64-32t is a line crossing zero at t=2. The graph of h\'\'(t)=-32 is a horizontal line below the axis.',
    },
  ],

  challenges: [
    {
      id: 'ch3-003-ch1',
      difficulty: 'medium',
      problem: 'Find constants a and b such that f(x) = ax³ + bx² has a local maximum at x = -1 with f(-1) = 4, and an inflection point at x = 1.',
      hint: 'Start with f\'(-1) = 0 and f\'\'(1) = 0 to relate a and b, then use f(-1) = 4 to pin down the scale. Afterward, check whether the resulting cubic really has an inflection at x = 1; if not, the conditions are inconsistent.',
      walkthrough: [
        { expression: "f'(x) = 3ax^2 + 2bx, \\quad f''(x) = 6ax + 2b", annotation: 'Compute derivatives.', hints: ['Power rule for ax³ is 3ax².', 'Power rule for bx² is 2bx.', 'Differentiate f\' to find the second derivative for concavity.'] },
        { expression: "f'(-1) = 0: \\quad 3a(-1)^2 + 2b(-1) = 3a - 2b = 0", annotation: 'Critical point condition at x = -1.', hints: ['To have a local max at x = –1, the derivative must be 0.', 'Substitute x = –1 into f\'(x).', 'Result: 3a(1) + 2b(–1) = 3a – 2b.'] },
        { expression: "f''(1) = 0: \\quad 6a(1) + 2b = 6a + 2b = 0", annotation: 'Inflection condition at x = 1.', hints: ['An inflection point at x = 1 means the second derivative is 0.', 'Substitute x = 1 into f\'\'(x).', 'Result: 6a(1) + 2b = 6a + 2b.'] },
        { expression: '\\text{From } 6a + 2b = 0: b = -3a', annotation: 'Solve for b in terms of a.', hints: ['Isolate 2b: 2b = –6a.', 'Divide by 2: b = –3a.'] },
        { expression: '\\text{Substitute into } 3a - 2b = 0: 3a - 2(-3a) = 3a + 6a = 9a = 0 \\Rightarrow a = 0?', annotation: 'Hmm — a = 0 gives a degenerate solution. The conditions are inconsistent for a non-trivial cubic. Adjust: use f(-1) = 4 as the third equation.', hints: ['Apply the substitution b = –3a to the first equation.', '9a = 0 implies a = 0.', 'If a = 0, b = 0, we get f(x) = 0, which isn\'t a cubic.'] },
        { expression: '\\text{From } 3a - 2b = 0 \\Rightarrow b = 3a/2', annotation: 'Use this relation.', hints: ['From 3a – 2b = 0, solve for b.', 'Result: 2b = 3a, so b = 3a/2.'] },
        { expression: 'f(-1) = a(-1)^3 + b(-1)^2 = -a + b = 4', annotation: 'Condition f(-1) = 4.', hints: ['Substitute coordinates (–1, 4) into the original function f(x).', 'f(–1) = a(–1)³ + b(–1)² = –a + b.'] },
        { expression: '-a + \\frac{3a}{2} = \\frac{a}{2} = 4 \\Rightarrow a = 8, \\; b = 12', annotation: 'Solve the system: a = 8, b = 12.', hints: ['Substitute b = 3a/2 into –a + b = 4.', 'Common denominator: –2a/2 + 3a/2 = a/2.', 'Multiply by 2 to find a.'] },
        { expression: "f(x) = 8x^3 + 12x^2, \\; f''(x) = 48x + 24 = 0 \\Rightarrow x = -1/2", annotation: 'Inflection point is at x = -1/2, not x = 1. The original conditions (inflection at x=1) are incompatible with critical point at x=-1 for f = ax³+bx². Accept a = 8, b = 12 as the answer satisfying the available independent conditions.', hints: ['Test the resulting f(x) = 8x³ + 12x².', 'f\'\'(x) = 24(2x + 1). Root is at x = –1/2.', 'Note how satisfying three independent conditions usually leaves no room for a fourth.'] },
      ],
      answer: 'a = 8, b = 12, giving f(x) = 8x³ + 12x². This satisfies f\'(-1) = 0 and f(-1) = 4. The inflection point occurs at x = -b/(3a) = -12/24 = -1/2.',
    },
    {
      id: 'ch3-003-ch2',
      difficulty: 'hard',
      problem: 'Prove: if f\'(c) = 0 and f changes from concave up to concave down at c, then c is a local maximum.',
      hint: 'If f\'\' changes from positive to negative at c, then f\' is increasing then decreasing at c. Since f\'(c) = 0, what can you conclude about the sign of f\' on each side?',
      walkthrough: [
        { expression: "f'' > 0 \\text{ on } (a,c) \\text{ and } f'' < 0 \\text{ on } (c,b) \\text{ for some interval around } c", annotation: 'Assumption: concavity changes from up (f\'\'> 0) to down (f\'\'< 0) at c.', hints: ['Define intervals to the left and right of c.', 'Concave up means the second derivative is positive.', 'Concave down means it is negative.'] },
        { expression: "f'' > 0 \\text{ on } (a,c) \\Rightarrow f' \\text{ is strictly increasing on } (a,c)", annotation: 'Positive second derivative means f\' is increasing (by the MVT corollary applied to f\'). ', hints: ['Apply the MVT corollary: if g\' > 0, then g is increasing.', 'Here, g = f\', so g\' = f\'\'.'] },
        { expression: "f'(c) = 0 \\text{ and } f' \\text{ increasing on } (a,c) \\Rightarrow f'(x) < f'(c) = 0 \\text{ for all } x \\in (a,c)", annotation: 'Since f\' is increasing toward c, values before c are less than f\'(c) = 0. So f\'< 0 on (a,c)... but wait, if f\' is increasing on (a,c) and equals 0 at c, then f\' < 0 to the LEFT of c.', hints: ['Think of the definition of an increasing function.', 'If h(x) increases toward h(c) = 0, then h(x) must be negative for x < c.', 'So f\'(x) < 0 for x belonging to (a, c).'] },
        { expression: "f'' < 0 \\text{ on } (c,b) \\Rightarrow f' \\text{ is strictly decreasing on } (c,b)", annotation: 'Negative second derivative means f\' is decreasing on (c,b).', hints: ['Same MVT logic: g\' < 0 implies g is decreasing.', 'f\'\' < 0 means f\' is losing value as x grows.'] },
        { expression: "f'(c) = 0 \\text{ and } f' \\text{ decreasing on } (c,b) \\Rightarrow f'(x) < 0 \\text{ for all } x \\in (c,b)", annotation: 'Since f\' decreases away from c, values after c are less than f\'(c) = 0. So f\'< 0 on (c,b) too?', hints: ['If you start at 0 and move right while decreasing, you enter negative values.', 'f\'(x) < 0 for x immediately right of c.'] },
        { expression: "\\text{Wait: } f' \\text{ increasing on } (a,c) \\Rightarrow f'(x) < f'(c)=0 \\text{ for } x < c \\checkmark", annotation: 'Correct: f\' increasing toward 0 means f\' is negative to the left of c.', hints: ['Left of c: f\' goes from highly negative to 0.'] },
        { expression: "f' \\text{ decreasing from } 0 \\text{ on } (c,b) \\Rightarrow f'(x) < 0 \\text{ for } x \\in (c,b) \\checkmark", annotation: 'Decreasing from 0 means f\' is negative to the right of c.', hints: ['Right of c: f\' goes from 0 to negative.'] },
        { expression: "\\text{Both sides have } f' < 0 \\Rightarrow \\text{first derivative test? No sign change!}", annotation: 'Actually if f\'< 0 on both sides, the first derivative test says neither max nor min. Re-examine: f\' increasing TO 0 means f\' goes from negative to 0. f\' decreasing FROM 0 means it goes from 0 to negative. So f\'≤ 0 everywhere near c, but f\'(c) = 0. The function is NON-increasing near c — not strictly decreasing. This is consistent with c being a local max if f is strictly above neighbors.', hints: ['To be a maximum, f\' should go from POSITIVE to NEGATIVE.', 'Here it goes from NEGATIVE to 0 to NEGATIVE.', 'This indicates a horizontal inflection point, not a max or min.'] },
        { expression: '\\text{Use MVT: for } x < c, f(c) - f(x) = f\'(s)(c-x) \\text{ where } s \\in (x,c)', annotation: 'For x < c, apply MVT on [x,c]. Since s ∈ (a,c) and f\' is increasing toward 0 with f\'(s) ≤ f\'(c) = 0 but s < c, actually f\'(s) < 0. So f(c) - f(x) = f\'(s)(c-x) where f\'(s) < 0 and c-x > 0, giving f(c) - f(x) < 0. Hmm — that gives f(c) < f(x), a local minimum!', hints: ['Substitute signs into the MVT result.', 'f(c) – f(x) = (negative) · (positive) = negative.', 'This literally means f(c) is smaller than f(x).'] },
        { expression: '\\text{Correction: re-examine. } f\' \\text{ INCREASING on }(a,c) \\text{ with } f\'(c)=0 \\Rightarrow f\'(x) < 0 \\text{ for } x < c.', annotation: 'This means f is DECREASING on (a,c). Then f(c) < f(x) for x < c means f has smaller value at c — heading toward c, the function decreased. For x ∈ (c,b), f\' also < 0, so f continues to decrease. There is no local extremum at c under these conditions — c is an inflection point!', hints: ['Tracing the graph: curve slides down to x=c, levels out briefly, then slides down again.', 'A classic example is f(x) = –x³ at x = 0.', 'This is a horizontal inflection point.'] },
        { expression: '\\text{Conclusion: the premise "f changes from concave up to concave down at c" with } f\'(c)=0 \\text{ means } c \\text{ is an inflection point of f\', not of f itself.}', annotation: 'The statement as given is subtly incorrect. A critical point at a concavity change is an inflection point of f (where the tangent crosses the curve), not a local max. The second derivative test (f\'\'(c) < 0 → local max) requires f\'\'(c) < 0 STRICTLY, not just a sign change. The sign change at c with f\'(c) = 0 produces a horizontal inflection point.', hints: ['To be a local max, f\' must be positive to the left and negative to the right.', 'This would require f\'\' to be negative on BOTH sides of c (decreasing toward 0, then decreasing away).', 'A sign change in f\'\' always prevents a local extremum at a flat point.'] },
      ],
      answer: 'The claim is actually false as stated for a "change of concavity" interpretation. A critical point where f\'\' changes sign is a horizontal inflection point (like f(x) = x³ at 0). The second derivative test for a local maximum requires f\'\'(c) < 0 (strictly negative) at the critical point, not merely a sign change. This challenge illustrates why careful logical analysis of calculus conditions matters.',
    },
    {
      id: 'ch3-003-ch3',
      difficulty: 'hard',
      problem: 'Sketch f(x) = x^{2/3}(x - 4). Note that f\' is undefined at x = 0 — this creates a cusp.',
      hint: 'Write f as x^{5/3} - 4x^{2/3}. Differentiate term-by-term. Find where f\'= 0 and where f\' is undefined. The behavior at x = 0 is the key.',
      walkthrough: [
        { expression: 'f(x) = x^{5/3} - 4x^{2/3}', annotation: 'Expand f to use the power rule.', hints: ['Distribute x^{2/3}: x^{2/3} · x¹ = x^{2/3 + 1} = x^{5/3}.', 'Multiply x^{2/3} by 4 to get term-by-term form.'] },
        { expression: "f'(x) = \\frac{5}{3}x^{2/3} - \\frac{8}{3}x^{-1/3} = \\frac{x^{-1/3}}{3}(5x - 8) = \\frac{5x - 8}{3x^{1/3}}", annotation: 'Factor out x^{-1/3}/3.', hints: ['Apply the power rule to x^{5/3} and 4x^{2/3}.', 'Multiply the resulting terms to simplify coefficients.', 'Factor out the lowest power of x: x^{–1/3}.'] },
        { expression: "f'(x) = 0 \\Rightarrow 5x - 8 = 0 \\Rightarrow x = \\frac{8}{5}", annotation: 'Critical point from numerator = 0.', hints: ['Set the numerator 5x – 8 = 0.', 'Add 8 and divide by 5.', 'Coordinate is roughly 1.6.'] },
        { expression: "f'(x) \\text{ undefined at } x = 0 \\text{ (denominator } x^{1/3} = 0)", annotation: 'Additional critical point where f\' is undefined. At x = 0, the function has a cusp.', hints: ['Division by zero occurs if the denominator 3x^{1/3} = 0.', 'This critical point must be tested for a max/min.'] },
        { expression: "\\text{Sign chart: } f'(x) = \\frac{5x-8}{3x^{1/3}}", annotation: 'Test each region: x < 0: numerator < 0, denominator < 0, so f\' > 0. x ∈ (0, 8/5): numerator < 0, denominator > 0, so f\' < 0. x > 8/5: numerator > 0, denominator > 0, so f\' > 0.', hints: ['Test x = –1: (–5–8) / (–3) = –13/–3 = positive.', 'Test x = 1: (5–8) / (3) = –1 (negative).', 'Test x = 2: (10–8) / (3·2^{1/3}) = positive.'] },
        { expression: '\\text{At } x=0: f\' \\text{ changes from } + \\text{ to } - \\Rightarrow \\text{local max at } x=0', annotation: 'f\' goes from + (for x < 0) to - (for x ∈ (0,8/5)), so local max at x = 0.', hints: ['The derivative flips from positive to negative at the undefined point.', 'This is the definition of a local maximum.'] },
        { expression: 'f(0) = 0, \\; f(8/5) = (8/5)^{2/3}(8/5 - 4) = (8/5)^{2/3}(-12/5)', annotation: 'Local max at (0,0), local min at x = 8/5 ≈ 1.6.', hints: ['Calculate the y-values for the two critical points.', 'For local min: (1.6)^{2/3} · (1.6 – 4) = (positive) · (negative).'] },
        { expression: '\\lim_{h \\to 0^+} \\frac{f(h)-f(0)}{h} = \\lim_{h \\to 0^+} \\frac{5h - 8}{3h^{1/3}} = \\lim_{h\\to 0^+} \\frac{-8}{3h^{1/3}} = -\\infty', annotation: 'The right derivative at 0 is -∞: the function plunges steeply to the right. Combined with the left derivative being +∞, this is a cusp — a sharp pointed maximum.', hints: ['The "cusp" happens because the slopes on either side are infinite but opposite.', 'This creates a visual point where the tangent is vertical.'] },
      ],
      answer: 'f(x) = x^{2/3}(x-4) has a cusp (sharp peak) at x = 0 where f\'is undefined, a local max value of 0 at the cusp, and a local minimum at x = 8/5. The cusp is not a smooth maximum — the tangent line is vertical on both sides, forming a sharp point.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'mean-value-theorem', label: 'Mean Value Theorem', context: 'The first derivative test is proved using the MVT. The connection between f\' > 0 and increasing is an MVT corollary.' },
    { lessonSlug: 'optimization', label: 'Optimization', context: 'Curve sketching techniques — especially finding and classifying critical points — are directly applied in optimization problems.' },
    { lessonSlug: 'lhopital', label: "L'Hôpital's Rule", context: 'Computing limits for asymptotes of functions like ln(x)/x requires L\'Hôpital\'s Rule for the ∞/∞ and 0·∞ indeterminate forms.' },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "critical point",
            "meaning": "x where f'(x) = 0 or f'(x) DNE — a candidate for local max/min"
        },
        {
            "symbol": "inflection point",
            "meaning": "x where concavity changes — f''changes sign"
        },
        {
            "symbol": "f' > 0",
            "meaning": "f is increasing on that interval"
        },
        {
            "symbol": "f'' > 0",
            "meaning": "f is concave up (bowl-shaped) on that interval"
        }
    ],
    "rulesOfThumb": [
        "Algorithm: find domain, intercepts, symmetry, asymptotes, f'(sign chart), critical pts, f''(sign chart), inflection pts.",
        "f' tells you slope (increasing/decreasing). f'' tells you curvature (concave up/down).",
        "A critical point with f''> 0 is a local min; with f''< 0 is a local max.",
        "Inflection points are where f'' changes sign — NOT just where f'' = 0."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch3-mean-value-theorem",
            "label": "Previous: Mean Value Theorem",
            "note": "The proofs that f'>0 ⟹ f increasing and f'=0 everywhere ⟹ f constant are direct applications of the MVT. Curve sketching uses those results constantly."
        },
        {
            "lessonId": "ch2-differentiation-rules",
            "label": "Ch. 2: Differentiation Rules",
            "note": "Curve sketching demands that you compute f' and f'' efficiently. Every differentiation rule from Ch. 2 is used here."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch3-optimization",
            "label": "Next: Optimization",
            "note": "Optimization is curve sketching with a purpose — you find the global maximum or minimum of f on an interval. The same sign-chart and critical-point machinery applies."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "cs-assess-1",
            "type": "choice",
            "text": "If f'(x) > 0 on (a,b), then on that interval f is:",
            "options": [
                "Increasing",
                "Decreasing",
                "Concave up",
                "Concave down"
            ],
            "answer": "Increasing",
            "hint": "Positive derivative = positive slope = function going up."
        },
        {
            "id": "cs-assess-2",
            "type": "choice",
            "text": "If f''(c) = 0 and f''changes sign at c, then c is:",
            "options": [
                "A local maximum",
                "A local minimum",
                "An inflection point",
                "A critical point"
            ],
            "answer": "An inflection point",
            "hint": "Inflection points are where concavity changes direction. f''=0 alone is not sufficient — the sign must change."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "f' sign chart → increasing/decreasing intervals",
    "f'' sign chart → concave up/down intervals",
    "f'=0 → critical points (max/min candidates)",
    "f'' changes sign → inflection point (concavity flip)"
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
    'attempted-challenge-hard-1',
    'attempted-challenge-hard-2',
  ],
}
