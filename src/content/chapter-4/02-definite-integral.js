// FILE: src/content/chapter-4/02-definite-integral.js
export default {
  id: 'ch4-002',
  slug: 'definite-integral',
  chapter: 4,
  order: 2,
  title: 'The Definite Integral',
  subtitle: 'A single number encoding signed area — properties, geometry, and the average value of a function',
  tags: ['definite integral', 'signed area', 'properties of integrals', 'average value', 'mean value theorem for integrals', 'linearity', 'additivity', 'odd functions', 'even functions'],

  hook: {
    question: 'The limit of Riemann sums as n → ∞ gives us a number. For ∫₀¹ x² dx, each Rₙ = (n+1)(2n+1)/(6n²), and as n → ∞ this converges to exactly 1/3. This is the definite integral — not an approximation, but an exact real number. Now: what does the definite integral of ∫₋₁¹ x³ dx equal? Do you need to compute anything? Think about symmetry.',
    realWorldContext: 'The definite integral as a number appears constantly in physics and engineering. The average temperature in a room over 24 hours is an integral divided by time. The center of mass of an irregular solid is a ratio of two integrals. The probability that a random variable falls in an interval is an integral of the probability density function. In signal processing, the "DC component" of a periodic signal is its average value — an integral over one period. In structural engineering, the bending moment at a point in a beam is the integral of the distributed load. Understanding the definite integral as a number with specific algebraic properties allows these calculations to be systematized.',
    previewVisualizationId: 'SignedArea',
  },

  intuition: {
    prose: [
      'The definite integral ∫ₐᵇ f(x) dx is a single real number. It measures signed area: regions where f > 0 contribute positively, regions where f < 0 contribute negatively. The "signed" aspect is essential for physics — velocity can be negative (motion in the opposite direction), and the signed area gives displacement (net change in position), not total distance. Keeping track of signs is not a complication; it is the feature that makes the integral physically meaningful.',
      'Linearity is the most useful property in practice. ∫ₐᵇ [c·f(x) + g(x)] dx = c·∫ₐᵇ f(x) dx + ∫ₐᵇ g(x) dx. This means you can split a complicated integral into simpler pieces. To compute ∫₀² (3x² + 5√x) dx, you can compute ∫₀² 3x² dx and ∫₀² 5√x dx separately and add. Any polynomial, any sum of trigonometric functions, any linear combination of integrable functions can be integrated piece by piece. Linearity is the reason integration is "not that hard" for elementary functions.',
      'The interval additivity property ∫ₐᶜ f = ∫ₐᵇ f + ∫ᵦᶜ f allows you to break the domain of integration anywhere. To compute ∫₋₂⁵ f, split at x = 0: ∫₋₂⁰ f + ∫₀⁵ f. This is powerful when f behaves differently on different sub-intervals (for example, if f has a corner at 0, or changes sign at 0). For |f(x)| dx (total area), split at every zero of f and negate the negative pieces: ∫|f| = ∫₍positive regions₎ f − ∫₍negative regions₎ f.',
      'Symmetry is the most elegant shortcut for computing integrals. For an ODD function — one satisfying f(−x) = −f(x) — the graph is symmetric about the origin. The area above the x-axis on [0, b] is exactly canceled by the equal-and-opposite area below the x-axis on [−b, 0]. Therefore ∫₋ₐᵃ f(x) dx = 0 for any odd function integrated over a symmetric interval. For an EVEN function — f(−x) = f(x), symmetric about the y-axis — the areas on [−a, 0] and [0, a] are equal, so ∫₋ₐᵃ f(x) dx = 2∫₀ᵃ f(x) dx. These shortcuts save enormous computational effort.',
      'The average value of f on [a, b] is defined as f_avg = (1/(b−a)) ∫ₐᵇ f(x) dx. This is the continuous analog of the arithmetic mean (average) of a list of numbers: instead of summing n values and dividing by n, we integrate the function and divide by the interval length. Geometrically, f_avg is the height of the rectangle with base [a, b] that has exactly the same area as the region under f. The rectangle is the "flattened-out" version of f.',
      'The Mean Value Theorem for Integrals guarantees that f_avg is actually attained by f somewhere in (a, b), not just an abstract average. If f is continuous, then there exists at least one point c ∈ (a, b) where f(c) = f_avg. This is deeply intuitive: the continuous function must pass through its average. For f(x) = x² on [0, 3], f_avg = (1/3)∫₀³ x² dx = (1/3)(9) = 3. The equation f(c) = 3 gives c² = 3, so c = √3 ≈ 1.73. The function x² takes the value 3 at x = √3, which is inside (0, 3), exactly as the theorem predicts.',
    ],
    callouts: [
      {
        type: 'geometric',
        title: 'Signed Area: Positive Above, Negative Below',
        body: 'The integral ∫₀^(2π) sin(x) dx = 0, even though the graph of sin(x) is never zero except at 0, π, 2π. The positive area on [0, π] equals 2, and the negative area on [π, 2π] equals −2. They cancel exactly. This is not a coincidence — it reflects the perfect symmetry of sine. The displacement of a particle moving with v(t)=sin(t) over a full period is zero: it returns to its starting position.',
      },
      {
        type: 'real-world',
        title: 'Average Value in Physics and Engineering',
        body: 'The average value formula f_avg = (1/(b−a))∫ₐᵇ f has direct applications: average temperature over a day (used by HVAC systems), average power over a cycle (determines RMS voltage in AC circuits), average velocity over a time interval (used in GPS), average force over a displacement (gives work via W = F_avg × d). In every case, the continuous average replaces the discrete mean, and the definite integral plays the role of the sum.',
      },
      {
        type: 'prior-knowledge',
        title: 'Symmetry: Odd and Even Functions',
        body: 'You already know that polynomial terms xⁿ are odd when n is odd and even when n is even. More generally: sin(x), x³, x⁵ are odd; cos(x), x², x⁴ are even. Sums and products follow rules: (even)×(odd) = odd; (odd)×(odd) = even. Use these to instantly identify integrals that are zero over symmetric intervals without computing anything.',
      },
      {
        type: 'warning',
        title: 'Average Value ≠ Average of Endpoints',
        body: 'The average value of f on [a,b] is (1/(b−a))∫ₐᵇ f dx — NOT (f(a)+f(b))/2. The endpoint average is a crude approximation (the trapezoidal rule with n=1). For f(x)=x² on [0,3]: endpoint average = (0+9)/2 = 4.5. True average = 3. The correct formula integrates the function, capturing its full behavior over the interval.',
      },
      {
        type: 'misconception',
        title: '∫ₐᵇ f(x) dx Is a Number, Not a Function',
        body: "The definite integral ∫₀³ x² dx = 9 is a NUMBER (9), not a function of x. The variable x is a 'dummy variable' — ∫₀³ t² dt = ∫₀³ u² du = 9. Do not confuse the definite integral (a number) with the indefinite integral ∫x² dx = x³/3 + C (a family of functions). The definite integral has limits; the indefinite integral does not.",
      },
      {
        type: 'history',
        title: "Cavalieri's Method of Indivisibles (1635)",
        body: "Bonaventura Cavalieri imagined a plane region as composed of infinitely many parallel lines — 'indivisibles.' By comparing the indivisibles of two regions line by line, he could prove they had equal areas without computing either area directly. His principle is the ancestor of ∫ₐᵇ [f(x)−g(x)] dx. It was logically incomplete (what IS an indivisible?) but profoundly influential, motivating both Newton and Leibniz.",
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Calculus I - 4.3.2 Evaluating Definite Integrals Without the FTC",
        props: { url: "https://www.youtube.com/embed/yx0xTkdrYK8" }
      },
      {
        id: 'VideoEmbed',
        title: "Calculus I - 4.3.1 Riemann Sums and Definite Integrals Defined",
        props: { url: "https://www.youtube.com/embed/8W3gEuaj_0s" }
      },
    {
        id: 'VideoEmbed',
        title: "Integration involving Inverse Trig Functions",
        props: { url: "https://www.youtube.com/embed/dcGZJojjM-o" }
      },
    {
        id: 'VideoEmbed',
        title: "Base a Derivative & Integration (13 Examples)",
        props: { url: "https://www.youtube.com/embed/XL1SNbJlCfY" }
      },
    {
        id: 'VideoEmbed',
        title: "Review of Basic Integration Rules Calculus 1 AB - 6 Examples",
        props: { url: "https://www.youtube.com/embed/prMmH2aRcKY" }
      },
    {
        id: 'VideoEmbed',
        title: "Integration Involving Inverse Trigonometric Functions Calculus 1 AB 6 Examples",
        props: { url: "https://www.youtube.com/embed/0aDW2wz0G7o" }
      },
    {
        id: 'VideoEmbed',
        title: "Definite Integration with U Substitution Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/qd3qmJ421Tk" }
      },
    {
        id: 'VideoEmbed',
        title: "Indefinite Integration by U Substitution Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/y_ZsPjUdols" }
      },
    {
        id: 'VideoEmbed',
        title: "Definite Integration & Displacement and Total Distance of Linear Motion Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/hQo4hvJbezc" }
      },
    {
        id: 'VideoEmbed',
        title: "Antiderivative & Indefinite Integration 11 Examples Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/0rDbACz81A8" }
      },
      {
        id: 'VideoEmbed',
        title: "The Definite Integral Part III: Evaluating From The Definition",
        props: { url: "https://www.youtube.com/embed/3FmnyO28XXw" }
      },
      {
        id: 'SignedArea',
        title: 'Signed Area: Positive and Negative Regions',
        caption: 'The shaded area above the x-axis is positive (green) and below is negative (red). The definite integral is the net signed area. Drag the endpoints to explore how the integral changes when more positive or negative region is included.',
      },
    ],
  },

  math: {
    prose: [
      'The formal properties of the definite integral follow from the limit-of-Riemann-sums definition. Linearity: for constants c, d and integrable functions f, g on [a, b], ∫ₐᵇ [c·f(x) + d·g(x)] dx = c·∫ₐᵇ f(x) dx + d·∫ₐᵇ g(x) dx. Proof sketch: the Riemann sums for cf + dg are exactly c times the sums for f plus d times the sums for g, and limits preserve linear combinations.',
      'Comparison properties: (1) if f(x) ≥ 0 on [a, b], then ∫ₐᵇ f ≥ 0; (2) if f(x) ≥ g(x) on [a, b], then ∫ₐᵇ f ≥ ∫ₐᵇ g; (3) the absolute value inequality: |∫ₐᵇ f(x) dx| ≤ ∫ₐᵇ |f(x)| dx. Property (3) is the integral analog of the triangle inequality for sums: |Σaᵢ| ≤ Σ|aᵢ|. It is used to bound integrals without computing them: if |f(x)| ≤ M on [a, b], then |∫ₐᵇ f| ≤ M(b−a).',
      'Mean Value Theorem for Integrals: if f is continuous on [a, b], then there exists c ∈ (a, b) such that ∫ₐᵇ f(x) dx = f(c)(b−a). The proof uses the EVT: f attains its minimum m and maximum M on [a, b]. The bound m(b−a) ≤ ∫ₐᵇ f ≤ M(b−a) gives m ≤ (1/(b−a))∫ₐᵇ f ≤ M. By the Intermediate Value Theorem (f is continuous and attains m and M), f must take every value between m and M, including the average value. So there exists c with f(c) = (1/(b−a))∫ₐᵇ f.',
      'Symmetry properties: if f is integrable and odd on [−a, a], then ∫₋ₐᵃ f(x) dx = 0. If f is even, ∫₋ₐᵃ f(x) dx = 2∫₀ᵃ f(x) dx. Proof for the odd case: substitute u = −x in ∫₋ₐ⁰ f(x) dx to get −∫₀ᵃ f(−u)(−du) = −∫₀ᵃ f(u) du = −∫₀ᵃ f (since f is odd). So ∫₋ₐ⁰ f = −∫₀ᵃ f, and ∫₋ₐᵃ f = ∫₋ₐ⁰ f + ∫₀ᵃ f = −∫₀ᵃ f + ∫₀ᵃ f = 0.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Properties of the Definite Integral',
        body: '\\[\\int_a^b [c\\,f(x)+d\\,g(x)]\\,dx = c\\!\\int_a^b\\!f\\,dx + d\\!\\int_a^b\\!g\\,dx \\quad \\text{(linearity)}\\]\n\\[\\int_a^b f = \\int_a^c f + \\int_c^b f \\quad \\text{(interval additivity)}\\]\n\\[\\left|\\int_a^b f(x)\\,dx\\right| \\leq \\int_a^b |f(x)|\\,dx \\quad \\text{(triangle inequality)}\\]',
      },
      {
        type: 'definition',
        title: 'Average Value of a Function',
        body: 'The average value of \\(f\\) on \\([a,b]\\) is\n\\[f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx.\\]\nGeometrically, \\(f_{\\text{avg}}\\) is the height of the rectangle with base \\(b-a\\) that has the same area as the region under \\(f\\).',
      },
      {
        type: 'theorem',
        title: 'Mean Value Theorem for Integrals',
        body: 'If \\(f\\) is continuous on \\([a,b]\\), there exists \\(c \\in (a,b)\\) such that\n\\[\\int_a^b f(x)\\,dx = f(c)(b-a).\\]\nEquivalently, \\(f(c) = f_{\\text{avg}}\\) — a continuous function attains its average value.',
      },
      {
        type: 'theorem',
        title: 'Symmetry Shortcuts',
        body: 'If \\(f\\) is odd \\((f(-x) = -f(x))\\):\n\\[\\int_{-a}^{a} f(x)\\,dx = 0.\\]\nIf \\(f\\) is even \\((f(-x) = f(x))\\):\n\\[\\int_{-a}^{a} f(x)\\,dx = 2\\int_0^a f(x)\\,dx.\\]',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "\"Reverse\" Riemann Sums | Finding the Definite Integral Given a Sum",
        props: { url: "https://www.youtube.com/embed/4vMJwKHMRx0" }
      },],
  },

  rigor: {
    prose: [
      'The comparison property |∫ₐᵇ f| ≤ ∫ₐᵇ |f| deserves a careful proof, since it is used repeatedly in analysis. For any Riemann sum: |Σf(cᵢ)Δx| ≤ Σ|f(cᵢ)|Δx by the triangle inequality for finite sums. Taking the limit as n → ∞: the left side converges to |∫ₐᵇ f| and the right side to ∫ₐᵇ |f| (assuming both f and |f| are integrable, which follows from f being integrable — since |f| is integrable whenever f is). The inequality is preserved in the limit, giving the result.',
      'The MVT for integrals requires both the Extreme Value Theorem and the Intermediate Value Theorem. The EVT guarantees f attains m = min f and M = max f on [a, b] (requiring continuity + closed bounded interval). The bound m ≤ f_avg ≤ M follows from the comparison property. The IVT guarantees f takes every value between m and M on [a, b] (requiring continuity). Since m ≤ f_avg ≤ M, f must take the value f_avg somewhere — call it c. Thus f(c) = f_avg. The careful reader will note that the IVT gives c in [a, b], not necessarily the open interval (a, b). The strict interior can be guaranteed if f_avg is not equal to m or M (which holds when f is non-constant), by a sharper application of the IVT.',
      'The symmetry properties give a window into the general technique of change of variables for integrals. The substitution u = −x transforms ∫₋ₐ⁰ f(x) dx as follows: when x = −a, u = a; when x = 0, u = 0; dx = −du. So ∫₋ₐ⁰ f(x) dx = ∫ₐ⁰ f(−u)(−du) = ∫₀ᵃ f(−u) du. For an odd function, f(−u) = −f(u), so this equals −∫₀ᵃ f(u) du. Adding ∫₀ᵃ f(u) du gives zero. This is a special case of the general substitution rule for definite integrals: ∫ₐᵇ f(g(x))g′(x) dx = ∫_{g(a)}^{g(b)} f(u) du, valid whenever g is differentiable and f is continuous. This rule (the integral version of the chain rule) is the theoretical basis for the substitution technique in antiderivative computation.',
      'The definite integral over a point ∫ₐᵃ f = 0 deserves a moment\'s attention. In measure theory, the integral is defined as ∫ f dμ where μ is a measure. For the Lebesgue measure on ℝ, a single point {a} has measure zero, so ∫_{a}^{a} f = 0 regardless of f(a) — even if f has a spike at a. This reflects the fact that a single point contributes nothing to the Riemann integral either: in any Riemann sum, the subinterval containing a can be taken to have arbitrarily small width, and f(a)·Δx → 0. The measure-zero sets play the same role in the Lebesgue theory that single points play here.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Integral Triangle Inequality (Proof Sketch)',
        body: 'For any Riemann sum: \\(|\\sum f(c_i)\\Delta x| \\leq \\sum |f(c_i)|\\Delta x\\) by the finite triangle inequality. Taking limits (both sides converge): \\(|\\int_a^b f| \\leq \\int_a^b |f|\\).',
      },
      {
        type: 'warning',
        title: 'MVT for Integrals ≠ MVT for Derivatives',
        body: 'The Mean Value Theorem for Derivatives says f\'(c) = (f(b)−f(a))/(b−a) for some c. The Mean Value Theorem for Integrals says f(c) = (1/(b−a))∫ₐᵇ f for some c. These are different statements about different quantities. The integral MVT requires only that f is continuous; the derivative MVT requires f to be differentiable. The Fundamental Theorem of Calculus connects the two in the proof of FTC Part 1.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-002-ex1',
      title: '∫₀³ (2x+1) dx by Geometry',
      problem: '\\text{Compute } \\int_0^3 (2x+1)\\,dx \\text{ using the geometric interpretation (area of a trapezoid).}',
      steps: [
        { expression: 'f(x) = 2x+1 \\text{ is a straight line.} \\quad f(0) = 1, \\quad f(3) = 7', annotation: 'The integrand is linear. The region under the graph from x=0 to x=3 is a trapezoid.' },
        { expression: '\\text{Trapezoid: two parallel sides } f(0)=1 \\text{ and } f(3)=7, \\text{ width (height of trapezoid)} = 3.', annotation: 'The "parallel sides" are the vertical heights at x=0 and x=3; the width is the length of the interval.' },
        { expression: '\\text{Area} = \\frac{1}{2}(\\text{side}_1 + \\text{side}_2) \\times \\text{width} = \\frac{1}{2}(1+7) \\times 3 = \\frac{1}{2}(8)(3) = 12', annotation: 'Trapezoid area formula: average of parallel sides times width.' },
        { expression: '\\int_0^3 (2x+1)\\,dx = 12', annotation: 'Confirmed: the definite integral equals the geometric area of the trapezoid.' },
      ],
      conclusion: '∫₀³ (2x+1) dx = 12. For any linear function, the integral equals the trapezoid area — no calculus machinery needed. This confirms our geometric intuition and sets up a check for Lesson 3 (FTC Part 2 will give the same answer: [x²+x]₀³ = 9+3−0 = 12).',
    },
    {
      id: 'ch4-002-ex2',
      title: '∫₀² √(4−x²) dx = π Using Geometry',
      problem: '\\text{Evaluate } \\int_0^2 \\sqrt{4-x^2}\\,dx \\text{ without computing an antiderivative.}',
      steps: [
        { expression: 'y = \\sqrt{4-x^2} \\Rightarrow y^2 = 4 - x^2 \\Rightarrow x^2 + y^2 = 4', annotation: 'The equation y = √(4−x²) with y ≥ 0 describes the upper semicircle of radius 2 centered at the origin.' },
        { expression: '\\text{The region under } y = \\sqrt{4-x^2} \\text{ from } x=0 \\text{ to } x=2 \\text{ is a quarter-disk of radius } 2.', annotation: 'On [0,2], the curve goes from (0,2) to (2,0), tracing a quarter-circle in the first quadrant.' },
        { expression: '\\text{Area of quarter-disk} = \\frac{1}{4}\\pi r^2 = \\frac{1}{4}\\pi(4) = \\pi', annotation: 'Area = πr²/4 = 4π/4 = π.' },
        { expression: '\\int_0^2 \\sqrt{4-x^2}\\,dx = \\pi \\approx 3.14159', annotation: 'The definite integral equals the area of the quarter-disk: exactly π.' },
      ],
      conclusion: '∫₀²√(4−x²)dx = π. This elegant result requires no antiderivative (the antiderivative of √(4−x²) involves arcsin, which is not yet available). Geometric reasoning gives the exact answer immediately. This illustrates the power of the area interpretation.',
    },
    {
      id: 'ch4-002-ex3',
      title: '∫₋₁¹ x³ dx = 0 by Symmetry',
      problem: '\\text{Evaluate } \\int_{-1}^{1} x^3\\,dx \\text{ using symmetry, without computing.}',
      steps: [
        { expression: 'f(x) = x^3 \\text{ is an odd function: } f(-x) = (-x)^3 = -x^3 = -f(x)', annotation: 'Verify odd symmetry: f(−x) = −f(x) for all x.' },
        { expression: '\\text{Odd function on symmetric interval} \\Rightarrow \\int_{-1}^{1} x^3\\,dx = 0', annotation: 'By the symmetry theorem: ∫₋ₐᵃ (odd function) dx = 0. The positive area on [0,1] is exactly canceled by the negative area on [−1,0].' },
        { expression: '\\text{Verification: } \\int_{-1}^{1} x^3\\,dx = \\left[\\frac{x^4}{4}\\right]_{-1}^{1} = \\frac{1}{4} - \\frac{1}{4} = 0', annotation: 'The antiderivative of x³ is x⁴/4. Both endpoints give 1/4, so the difference is 0.' },
      ],
      conclusion: '∫₋₁¹ x³ dx = 0 by symmetry. No computation required — recognizing the odd function on a symmetric interval gives the answer instantly. This is one of the most powerful time-saving tricks in integral calculus.',
    },
    {
      id: 'ch4-002-ex4',
      title: 'Using Additivity: Finding ∫₃⁵ f from Partial Information',
      problem: '\\text{Given } \\int_0^3 f(x)\\,dx = 5 \\text{ and } \\int_0^5 f(x)\\,dx = 12, \\text{ find } \\int_3^5 f(x)\\,dx.',
      steps: [
        { expression: '\\int_0^5 f = \\int_0^3 f + \\int_3^5 f', annotation: 'Interval additivity: the integral from 0 to 5 splits at x=3.' },
        { expression: '12 = 5 + \\int_3^5 f', annotation: 'Substitute the known values.' },
        { expression: '\\int_3^5 f(x)\\,dx = 12 - 5 = 7', annotation: 'Solve for the unknown integral.' },
      ],
      conclusion: '∫₃⁵ f = 7. The additivity property lets us extract partial integrals from known combinations — like solving an equation. This technique is essential whenever you only have access to aggregate data.',
    },
    {
      id: 'ch4-002-ex5',
      title: 'Average Value and the MVT for Integrals',
      problem: '\\text{Find the average value of } f(x) = x^2 \\text{ on } [0,3]. \\text{ Then find } c \\in (0,3) \\text{ where } f(c) = f_{\\text{avg}}.',
      steps: [
        { expression: 'f_{\\text{avg}} = \\frac{1}{3-0}\\int_0^3 x^2\\,dx', annotation: 'Average value formula: (1/(b−a)) × integral.' },
        { expression: '\\int_0^3 x^2\\,dx = \\left[\\frac{x^3}{3}\\right]_0^3 = \\frac{27}{3} - 0 = 9', annotation: 'Antiderivative of x² is x³/3. Evaluate at 3 and 0.' },
        { expression: 'f_{\\text{avg}} = \\frac{1}{3} \\cdot 9 = 3', annotation: 'Average value of x² on [0,3] is 3.' },
        { expression: 'f(c) = f_{\\text{avg}} \\Rightarrow c^2 = 3 \\Rightarrow c = \\sqrt{3} \\approx 1.73', annotation: 'Solve f(c) = 3 for c. Since c must be in (0,3), we take the positive root c = √3.' },
        { expression: '\\sqrt{3} \\in (0,3) \\checkmark', annotation: 'Confirmed: c = √3 ≈ 1.73 is in the open interval (0,3), as the MVT for integrals guarantees.' },
      ],
      conclusion: 'The average value of x² on [0,3] is 3. The function achieves this average at c = √3 ≈ 1.73, which lies inside (0,3) as the Mean Value Theorem for Integrals guarantees.',
    },
    {
      id: 'ch4-002-ex6',
      title: '∫₋₂² |x| dx Using Geometry',
      problem: '\\text{Evaluate } \\int_{-2}^{2} |x|\\,dx \\text{ using the geometric area interpretation.}',
      steps: [
        { expression: '|x| = \\begin{cases} -x & x < 0 \\\\ x & x \\geq 0 \\end{cases}', annotation: 'The absolute value function forms a "V" shape with vertex at the origin.' },
        { expression: '\\int_{-2}^{2} |x|\\,dx = \\int_{-2}^{0} (-x)\\,dx + \\int_0^2 x\\,dx', annotation: 'Split at x=0 where the behavior changes. On [−2,0], |x| = −x; on [0,2], |x| = x.' },
        { expression: '\\text{Each piece is a right triangle with base 2 and height 2.}', annotation: '|x| on [−2,0] is a line from 2 to 0 (height at x=−2 is 2, at x=0 is 0). Same on [0,2].' },
        { expression: '\\int_{-2}^{0} (-x)\\,dx = \\frac{1}{2}(2)(2) = 2 \\quad \\int_0^2 x\\,dx = \\frac{1}{2}(2)(2) = 2', annotation: 'Each triangle has area ½ × 2 × 2 = 2.' },
        { expression: '\\int_{-2}^{2} |x|\\,dx = 2 + 2 = 4', annotation: 'Total area = 4.' },
        { expression: '\\text{Or by even symmetry: } \\int_{-2}^{2} |x|\\,dx = 2\\int_0^2 x\\,dx = 2 \\cdot 2 = 4', annotation: 'Since |x| is even, we can use the symmetry shortcut: double the [0,2] piece.' },
      ],
      conclusion: '∫₋₂² |x| dx = 4. The absolute value function is even, so we can double the integral over [0,2]. Geometrically, the "V" shape creates two triangles with total area 4.',
    },
    {
      id: 'ch4-002-ex7',
      title: 'Displacement vs. Distance: Signed vs. Unsigned Integral',
      problem: '\\text{A particle moves with } v(t) = \\sin(t). \\text{ Find displacement and total distance over } [0, 2\\pi].',
      visualizationId: 'SignedArea',
      steps: [
        { expression: '\\text{Displacement} = \\int_0^{2\\pi} \\sin(t)\\,dt', annotation: 'Displacement is the signed integral of velocity.' },
        { expression: '= [-\\cos(t)]_0^{2\\pi} = -\\cos(2\\pi) + \\cos(0) = -1 + 1 = 0', annotation: 'Antiderivative of sin(t) is −cos(t). Evaluate from 0 to 2π.' },
        { expression: '\\text{The particle returns to its starting point after one full period.}', annotation: 'Displacement = 0 means net change in position is zero — it started and ended at the same place.' },
        { expression: '\\text{Total distance} = \\int_0^{2\\pi} |\\sin(t)|\\,dt', annotation: 'Distance ignores direction — integrate the absolute value.' },
        { expression: '= \\int_0^{\\pi} \\sin(t)\\,dt + \\int_{\\pi}^{2\\pi} (-\\sin(t))\\,dt', annotation: 'sin(t) ≥ 0 on [0,π]; sin(t) ≤ 0 on [π,2π] so |sin| = −sin there. Split at the zero.' },
        { expression: '= [-\\cos(t)]_0^{\\pi} + [\\cos(t)]_{\\pi}^{2\\pi} = (1+1) + (-1-(-1)) = 2 + 2 = 4', annotation: 'First piece: −cos(π)+cos(0) = 1+1=2. Second piece: cos(2π)−cos(π) = 1−(−1)=2.' },
        { expression: '\\text{Displacement} = 0, \\quad \\text{Total distance} = 4.', annotation: 'The particle traveled 4 units total but ended where it started.' },
      ],
      conclusion: 'Displacement = 0 (returns to start) but total distance = 4 (traveled 2 units forward and 2 units back). This distinction is fundamental in physics: displacement is a vector (signed); distance is a scalar (unsigned).',
    },
  ],

  challenges: [
    {
      id: 'ch4-002-ch1',
      difficulty: 'medium',
      problem: 'Given ∫₋₃³ f(x) dx = 10 and ∫₋₃³ g(x) dx = 6, evaluate: (a) ∫₋₃³ [2f(x) − 3g(x)] dx. (b) If f is even and ∫₀³ f = 7, what is ∫₋₃⁰ f?',
      hint: 'Use linearity for part (a). For part (b), use the even-function symmetry: ∫₋₃³ f = 2∫₀³ f. Then use additivity to find ∫₋₃⁰ f.',
      walkthrough: [
        { expression: '\\text{(a) } \\int_{-3}^3 [2f-3g]\\,dx = 2\\int_{-3}^3 f - 3\\int_{-3}^3 g = 2(10) - 3(6) = 20 - 18 = 2', annotation: 'Linearity: pull out constants and split the integral.' },
        { expression: '\\text{(b) } f \\text{ even} \\Rightarrow \\int_{-3}^3 f = 2\\int_0^3 f', annotation: 'For even f on symmetric interval: ∫₋ₐᵃ f = 2∫₀ᵃ f.' },
        { expression: '\\int_{-3}^3 f = 2(7) = 14', annotation: 'Since ∫₀³ f = 7, the full symmetric integral is 14.' },
        { expression: '\\int_{-3}^3 f = \\int_{-3}^0 f + \\int_0^3 f \\Rightarrow 14 = \\int_{-3}^0 f + 7 \\Rightarrow \\int_{-3}^0 f = 7', annotation: 'Split by additivity. Subtract ∫₀³ f = 7 from both sides. By symmetry, ∫₋₃⁰ f = ∫₀³ f = 7, as expected for an even function.' },
      ],
      answer: '\\text{(a) } 2 \\qquad \\text{(b) } \\int_{-3}^0 f = 7',
    },
    {
      id: 'ch4-002-ch2',
      difficulty: 'medium',
      problem: 'Find the average value of f(x) = sin(x) on [0, π]. Then find all c ∈ (0, π) where f(c) = f_avg.',
      hint: 'Compute ∫₀^π sin(x) dx using the antiderivative −cos(x). Divide by the interval length π. Then solve sin(c) = f_avg.',
      walkthrough: [
        { expression: '\\int_0^{\\pi} \\sin(x)\\,dx = [-\\cos(x)]_0^{\\pi} = -\\cos(\\pi)+\\cos(0) = -(-1)+1 = 2', annotation: 'Antiderivative of sin is −cos.' },
        { expression: 'f_{\\text{avg}} = \\frac{1}{\\pi - 0} \\cdot 2 = \\frac{2}{\\pi} \\approx 0.637', annotation: 'Average value = integral / interval length = 2/π.' },
        { expression: '\\sin(c) = \\frac{2}{\\pi} \\Rightarrow c = \\arcsin\\!\\left(\\frac{2}{\\pi}\\right) \\approx 0.690 \\text{ or } c = \\pi - \\arcsin\\!\\left(\\frac{2}{\\pi}\\right) \\approx 2.452', annotation: 'On [0,π], sin(c) = 2/π has two solutions (sin is positive throughout). Both c ≈ 0.690 and c ≈ 2.452 are in (0,π).' },
      ],
      answer: 'f_{\\text{avg}} = 2/\\pi \\approx 0.637. \\text{ Achieved at } c \\approx 0.690 \\text{ and } c \\approx 2.452.',
    },
    {
      id: 'ch4-002-ch3',
      difficulty: 'hard',
      problem: 'Prove the Mean Value Theorem for Integrals from scratch using only the Extreme Value Theorem and Intermediate Value Theorem. Be explicit about where each theorem is used.',
      hint: 'Step 1: EVT gives min m and max M of f on [a,b]. Step 2: Comparison inequalities give m ≤ (1/(b−a))∫ₐᵇf ≤ M. Step 3: IVT gives a point where f equals this average value.',
      walkthrough: [
        { expression: '\\text{Since } f \\text{ is continuous on } [a,b], \\text{ the EVT guarantees } m = \\min f \\text{ and } M = \\max f \\text{ both exist.}', annotation: 'EVT: continuous function on closed bounded interval attains its extrema.' },
        { expression: 'm \\leq f(x) \\leq M \\text{ for all } x \\in [a,b]', annotation: 'Definition of min and max.' },
        { expression: 'm(b-a) \\leq \\int_a^b f(x)\\,dx \\leq M(b-a)', annotation: 'Comparison property: integrating an inequality over [a,b] preserves it (and multiplies by width b−a).' },
        { expression: 'm \\leq \\frac{1}{b-a}\\int_a^b f(x)\\,dx \\leq M', annotation: 'Divide through by (b−a) > 0.' },
        { expression: '\\text{Let } \\mu = \\frac{1}{b-a}\\int_a^b f\\,dx. \\text{ Then } m \\leq \\mu \\leq M.', annotation: 'The average value μ lies between the minimum and maximum of f.' },
        { expression: 'f \\text{ is continuous and } m = f(d), M = f(e) \\text{ for some } d, e \\in [a,b]. \\text{ By IVT, } \\exists c \\in [a,b]: f(c) = \\mu.', annotation: 'IVT: a continuous function takes all intermediate values between any two values it attains. Since f(d)=m ≤ μ ≤ M=f(e), there exists c between d and e (hence in [a,b]) with f(c)=μ. ∎' },
      ],
      answer: '\\text{MVT for Integrals proved: } \\exists c \\in [a,b]: f(c) = \\frac{1}{b-a}\\int_a^b f\\,dx.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'riemann-sums', label: 'Riemann Sums', context: 'The definite integral\'s properties (linearity, comparison) all follow from the limit-of-Riemann-sums definition established in Lesson 1.' },
    { lessonSlug: 'fundamental-theorem', label: 'Fundamental Theorem of Calculus', context: 'Lesson 3 shows how to COMPUTE definite integrals efficiently using antiderivatives. The properties in this lesson remain the foundation for understanding what we are computing.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'Area between curves, net displacement, and average value — all developed in Lesson 5 — rely on the properties and signed-area interpretation built here.' },
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
    'attempted-challenge-medium-1',
    'attempted-challenge-medium-2',
    'attempted-challenge-hard',
  ],
}
