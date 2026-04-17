// FILE: src/content/chapter-4/02-definite-integral.js
export default {
  id: "ch4-002",
  slug: "definite-integral",
  chapter: 4,
  order: 2,
  title: "The Definite Integral",
  subtitle:
    "A single number encoding signed area — properties, geometry, and the average value of a function",
  tags: [
    "definite integral",
    "signed area",
    "properties of integrals",
    "average value",
    "mean value theorem for integrals",
    "linearity",
    "additivity",
    "odd functions",
    "even functions",
  ],

  hook: {
    question:
      "The limit of Riemann sums as n → ∞ gives us a number. For ∫₀¹ x² dx, each Rₙ = (n+1)(2n+1)/(6n²), and as n → ∞ this converges to exactly 1/3. This is the definite integral — not an approximation, but an exact real number. Now: what does the definite integral of ∫₋₁¹ x³ dx equal? Do you need to compute anything? Think about symmetry.",
    realWorldContext:
      'The definite integral as a number appears constantly in physics and engineering. The average temperature in a room over 24 hours is an integral divided by time. The center of mass of an irregular solid is a ratio of two integrals. The probability that a random variable falls in an interval is an integral of the probability density function. In signal processing, the "DC component" of a periodic signal is its average value — an integral over one period. In structural engineering, the bending moment at a point in a beam is the integral of the distributed load. Understanding the definite integral as a number with specific algebraic properties allows these calculations to be systematized.',
    previewVisualizationId: "SignedArea",
  },

  intuition: {
    prose: [
      'The definite integral ∫ₐᵇ f(x) dx is a single real number. It measures signed area: regions where f > 0 contribute positively, regions where f < 0 contribute negatively. The "signed" aspect is essential for physics — velocity can be negative (motion in the opposite direction), and the signed area gives displacement (net change in position), not total distance. Keeping track of signs is not a complication; it is the feature that makes the integral physically meaningful.',
      'Linearity is the most useful property in practice. ∫ₐᵇ [c·f(x) + g(x)] dx = c·∫ₐᵇ f(x) dx + ∫ₐᵇ g(x) dx. This means you can split a complicated integral into simpler pieces. To compute ∫₀² (3x² + 5√x) dx, you can compute ∫₀² 3x² dx and ∫₀² 5√x dx separately and add. Any polynomial, any sum of trigonometric functions, any linear combination of integrable functions can be integrated piece by piece. Linearity is the reason integration is "not that hard" for elementary functions.',
      "The interval additivity property ∫ₐᶜ f = ∫ₐᵇ f + ∫ᵦᶜ f allows you to break the domain of integration anywhere. To compute ∫₋₂⁵ f, split at x = 0: ∫₋₂⁰ f + ∫₀⁵ f. This is powerful when f behaves differently on different sub-intervals (for example, if f has a corner at 0, or changes sign at 0). For |f(x)| dx (total area), split at every zero of f and negate the negative pieces: ∫|f| = ∫₍positive regions₎ f − ∫₍negative regions₎ f.",
      "Symmetry is the most elegant shortcut for computing integrals. For an ODD function — one satisfying f(−x) = −f(x) — the graph is symmetric about the origin. The area above the x-axis on [0, b] is exactly canceled by the equal-and-opposite area below the x-axis on [−b, 0]. Therefore ∫₋ₐᵃ f(x) dx = 0 for any odd function integrated over a symmetric interval. For an EVEN function — f(−x) = f(x), symmetric about the y-axis — the areas on [−a, 0] and [0, a] are equal, so ∫₋ₐᵃ f(x) dx = 2∫₀ᵃ f(x) dx. These shortcuts save enormous computational effort.",
      'The average value of f on [a, b] is defined as f_avg = (1/(b−a)) ∫ₐᵇ f(x) dx. This is the continuous analog of the arithmetic mean (average) of a list of numbers: instead of summing n values and dividing by n, we integrate the function and divide by the interval length. Geometrically, f_avg is the height of the rectangle with base [a, b] that has exactly the same area as the region under f. The rectangle is the "flattened-out" version of f.',
      "The Mean Value Theorem for Integrals guarantees that f_avg is actually attained by f somewhere in (a, b), not just an abstract average. If f is continuous, then there exists at least one point c ∈ (a, b) where f(c) = f_avg. This is deeply intuitive: the continuous function must pass through its average. For f(x) = x² on [0, 3], f_avg = (1/3)∫₀³ x² dx = (1/3)(9) = 3. The equation f(c) = 3 gives c² = 3, so c = √3 ≈ 1.73. The function x² takes the value 3 at x = √3, which is inside (0, 3), exactly as the theorem predicts.",
    ],
    callouts: [
      {
        type: "geometric",
        title: "Signed Area: Positive Above, Negative Below",
        body: "The integral ∫₀^(2π) sin(x) dx = 0, even though the graph of sin(x) is never zero except at 0, π, 2π. The positive area on [0, π] equals 2, and the negative area on [π, 2π] equals −2. They cancel exactly. This is not a coincidence — it reflects the perfect symmetry of sine. The displacement of a particle moving with v(t)=sin(t) over a full period is zero: it returns to its starting position.",
      },
      {
        type: "real-world",
        title: "Average Value in Physics and Engineering",
        body: "The average value formula f_avg = (1/(b−a))∫ₐᵇ f has direct applications: average temperature over a day (used by HVAC systems), average power over a cycle (determines RMS voltage in AC circuits), average velocity over a time interval (used in GPS), average force over a displacement (gives work via W = F_avg × d). In every case, the continuous average replaces the discrete mean, and the definite integral plays the role of the sum.",
      },
      {
        type: "prior-knowledge",
        title: "Symmetry: Odd and Even Functions",
        body: "You already know that polynomial terms xⁿ are odd when n is odd and even when n is even. More generally: sin(x), x³, x⁵ are odd; cos(x), x², x⁴ are even. Sums and products follow rules: (even)×(odd) = odd; (odd)×(odd) = even. Use these to instantly identify integrals that are zero over symmetric intervals without computing anything.",
      },
      {
        type: "warning",
        title: "Average Value ≠ Average of Endpoints",
        body: "The average value of f on [a,b] is (1/(b−a))∫ₐᵇ f dx — NOT (f(a)+f(b))/2. The endpoint average is a crude approximation (the trapezoidal rule with n=1). For f(x)=x² on [0,3]: endpoint average = (0+9)/2 = 4.5. True average = 3. The correct formula integrates the function, capturing its full behavior over the interval.",
      },
      {
        type: "misconception",
        title: "∫ₐᵇ f(x) dx Is a Number, Not a Function",
        body: "The definite integral ∫₀³ x² dx = 9 is a NUMBER (9), not a function of x. The variable x is a 'dummy variable' — ∫₀³ t² dt = ∫₀³ u² du = 9. Do not confuse the definite integral (a number) with the indefinite integral ∫x² dx = x³/3 + C (a family of functions). The definite integral has limits; the indefinite integral does not.",
      },
      {
        type: "history",
        title: "Cavalieri's Method of Indivisibles (1635)",
        body: "Bonaventura Cavalieri imagined a plane region as composed of infinitely many parallel lines — 'indivisibles.' By comparing the indivisibles of two regions line by line, he could prove they had equal areas without computing either area directly. His principle is the ancestor of ∫ₐᵇ [f(x)−g(x)] dx. It was logically incomplete (what IS an indivisible?) but profoundly influential, motivating both Newton and Leibniz.",
      },
    ],
    visualizations: [
      {
        id: "SignedArea",
        title: "Signed Area: Positive and Negative Regions",
        caption:
          "The shaded area above the x-axis is positive (green) and below is negative (red). The definite integral is the net signed area. Drag the endpoints to explore how the integral changes when more positive or negative region is included.",
      },
    ],
  },

  math: {
    prose: [
      "The formal properties of the definite integral follow from the limit-of-Riemann-sums definition. Linearity: for constants c, d and integrable functions f, g on [a, b], ∫ₐᵇ [c·f(x) + d·g(x)] dx = c·∫ₐᵇ f(x) dx + d·∫ₐᵇ g(x) dx. Proof sketch: the Riemann sums for cf + dg are exactly c times the sums for f plus d times the sums for g, and limits preserve linear combinations.",
      "Comparison properties: (1) if f(x) ≥ 0 on [a, b], then ∫ₐᵇ f ≥ 0; (2) if f(x) ≥ g(x) on [a, b], then ∫ₐᵇ f ≥ ∫ₐᵇ g; (3) the absolute value inequality: |∫ₐᵇ f(x) dx| ≤ ∫ₐᵇ |f(x)| dx. Property (3) is the integral analog of the triangle inequality for sums: |Σaᵢ| ≤ Σ|aᵢ|. It is used to bound integrals without computing them: if |f(x)| ≤ M on [a, b], then |∫ₐᵇ f| ≤ M(b−a).",
      "Mean Value Theorem for Integrals: if f is continuous on [a, b], then there exists c ∈ (a, b) such that ∫ₐᵇ f(x) dx = f(c)(b−a). The proof uses the EVT: f attains its minimum m and maximum M on [a, b]. The bound m(b−a) ≤ ∫ₐᵇ f ≤ M(b−a) gives m ≤ (1/(b−a))∫ₐᵇ f ≤ M. By the Intermediate Value Theorem (f is continuous and attains m and M), f must take every value between m and M, including the average value. So there exists c with f(c) = (1/(b−a))∫ₐᵇ f.",
      "Symmetry properties: if f is integrable and odd on [−a, a], then ∫₋ₐᵃ f(x) dx = 0. If f is even, ∫₋ₐᵃ f(x) dx = 2∫₀ᵃ f(x) dx. Proof for the odd case: substitute u = −x in ∫₋ₐ⁰ f(x) dx to get −∫₀ᵃ f(−u)(−du) = −∫₀ᵃ f(u) du = −∫₀ᵃ f (since f is odd). So ∫₋ₐ⁰ f = −∫₀ᵃ f, and ∫₋ₐᵃ f = ∫₋ₐ⁰ f + ∫₀ᵃ f = −∫₀ᵃ f + ∫₀ᵃ f = 0.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Properties of the Definite Integral",
        body: "\\[\\int_a^b [c\\,f(x)+d\\,g(x)]\\,dx = c\\!\\int_a^b\\!f\\,dx + d\\!\\int_a^b\\!g\\,dx \\quad \\text{(linearity)}\\]\n\\[\\int_a^b f = \\int_a^c f + \\int_c^b f \\quad \\text{(interval additivity)}\\]\n\\[\\left|\\int_a^b f(x)\\,dx\\right| \\leq \\int_a^b |f(x)|\\,dx \\quad \\text{(triangle inequality)}\\]",
      },
      {
        type: "definition",
        title: "Average Value of a Function",
        body: "The average value of \\(f\\) on \\([a,b]\\) is\n\\[f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx.\\]\nGeometrically, \\(f_{\\text{avg}}\\) is the height of the rectangle with base \\(b-a\\) that has the same area as the region under \\(f\\).",
      },
      {
        type: "theorem",
        title: "Mean Value Theorem for Integrals",
        body: "If \\(f\\) is continuous on \\([a,b]\\), there exists \\(c \\in (a,b)\\) such that\n\\[\\int_a^b f(x)\\,dx = f(c)(b-a).\\]\nEquivalently, \\(f(c) = f_{\\text{avg}}\\) — a continuous function attains its average value.",
      },
      {
        type: "theorem",
        title: "Symmetry Shortcuts",
        body: "If \\(f\\) is odd \\((f(-x) = -f(x))\\):\n\\[\\int_{-a}^{a} f(x)\\,dx = 0.\\]\nIf \\(f\\) is even \\((f(-x) = f(x))\\):\n\\[\\int_{-a}^{a} f(x)\\,dx = 2\\int_0^a f(x)\\,dx.\\]",
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "The comparison property |∫ₐᵇ f| ≤ ∫ₐᵇ |f| deserves a careful proof, since it is used repeatedly in analysis. For any Riemann sum: |Σf(cᵢ)Δx| ≤ Σ|f(cᵢ)|Δx by the triangle inequality for finite sums. Taking the limit as n → ∞: the left side converges to |∫ₐᵇ f| and the right side to ∫ₐᵇ |f| (assuming both f and |f| are integrable, which follows from f being integrable — since |f| is integrable whenever f is). The inequality is preserved in the limit, giving the result.",
      "The MVT for integrals requires both the Extreme Value Theorem and the Intermediate Value Theorem. The EVT guarantees f attains m = min f and M = max f on [a, b] (requiring continuity + closed bounded interval). The bound m ≤ f_avg ≤ M follows from the comparison property. The IVT guarantees f takes every value between m and M on [a, b] (requiring continuity). Since m ≤ f_avg ≤ M, f must take the value f_avg somewhere — call it c. Thus f(c) = f_avg. The careful reader will note that the IVT gives c in [a, b], not necessarily the open interval (a, b). The strict interior can be guaranteed if f_avg is not equal to m or M (which holds when f is non-constant), by a sharper application of the IVT.",
      "The symmetry properties give a window into the general technique of change of variables for integrals. The substitution u = −x transforms ∫₋ₐ⁰ f(x) dx as follows: when x = −a, u = a; when x = 0, u = 0; dx = −du. So ∫₋ₐ⁰ f(x) dx = ∫ₐ⁰ f(−u)(−du) = ∫₀ᵃ f(−u) du. For an odd function, f(−u) = −f(u), so this equals −∫₀ᵃ f(u) du. Adding ∫₀ᵃ f(u) du gives zero. This is a special case of the general substitution rule for definite integrals: ∫ₐᵇ f(g(x))g′(x) dx = ∫_{g(a)}^{g(b)} f(u) du, valid whenever g is differentiable and f is continuous. This rule (the integral version of the chain rule) is the theoretical basis for the substitution technique in antiderivative computation.",
      "The definite integral over a point ∫ₐᵃ f = 0 deserves a moment's attention. In measure theory, the integral is defined as ∫ f dμ where μ is a measure. For the Lebesgue measure on ℝ, a single point {a} has measure zero, so ∫_{a}^{a} f = 0 regardless of f(a) — even if f has a spike at a. This reflects the fact that a single point contributes nothing to the Riemann integral either: in any Riemann sum, the subinterval containing a can be taken to have arbitrarily small width, and f(a)·Δx → 0. The measure-zero sets play the same role in the Lebesgue theory that single points play here.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Integral Triangle Inequality (Proof Sketch)",
        body: "For any Riemann sum: \\(|\\sum f(c_i)\\Delta x| \\leq \\sum |f(c_i)|\\Delta x\\) by the finite triangle inequality. Taking limits (both sides converge): \\(|\\int_a^b f| \\leq \\int_a^b |f|\\).",
      },
      {
        type: "warning",
        title: "MVT for Integrals ≠ MVT for Derivatives",
        body: "The Mean Value Theorem for Derivatives says f'(c) = (f(b)−f(a))/(b−a) for some c. The Mean Value Theorem for Integrals says f(c) = (1/(b−a))∫ₐᵇ f for some c. These are different statements about different quantities. The integral MVT requires only that f is continuous; the derivative MVT requires f to be differentiable. The Fundamental Theorem of Calculus connects the two in the proof of FTC Part 1.",
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: "ch4-002-ex1",
      title: "∫₀³ (2x+1) dx by Geometry",
      problem:
        "\\text{Compute } \\int_0^3 (2x+1)\\,dx \\text{ using the geometric interpretation (area of a trapezoid).}",
      steps: [
        {
          expression:
            "f(x) = 2x+1 \\text{ is a straight line.} \\quad f(0) = 1, \\quad f(3) = 7",
          annotation:
            "The integrand is linear. The region under the graph from x=0 to x=3 is a trapezoid.",
        },
        {
          expression:
            "\\text{Trapezoid: two parallel sides } f(0)=1 \\text{ and } f(3)=7, \\text{ width (height of trapezoid)} = 3.",
          annotation:
            'The "parallel sides" are the vertical heights at x=0 and x=3; the width is the length of the interval.',
        },
        {
          expression:
            "\\text{Area} = \\frac{1}{2}(\\text{side}_1 + \\text{side}_2) \\times \\text{width} = \\frac{1}{2}(1+7) \\times 3 = \\frac{1}{2}(8)(3) = 12",
          annotation:
            "Trapezoid area formula: average of parallel sides times width.",
        },
        {
          expression: "\\int_0^3 (2x+1)\\,dx = 12",
          annotation:
            "Confirmed: the definite integral equals the geometric area of the trapezoid.",
        },
      ],
      conclusion:
        "∫₀³ (2x+1) dx = 12. For any linear function, the integral equals the trapezoid area — no calculus machinery needed. This confirms our geometric intuition and sets up a check for Lesson 3 (FTC Part 2 will give the same answer: [x²+x]₀³ = 9+3−0 = 12).",
    },
    {
      id: "ch4-002-ex2",
      title: "∫₀² √(4−x²) dx = π Using Geometry",
      problem:
        "\\text{Evaluate } \\int_0^2 \\sqrt{4-x^2}\\,dx \\text{ without computing an antiderivative.}",
      steps: [
        {
          expression:
            "y = \\sqrt{4-x^2} \\Rightarrow y^2 = 4 - x^2 \\Rightarrow x^2 + y^2 = 4",
          annotation:
            "The equation y = √(4−x²) with y ≥ 0 describes the upper semicircle of radius 2 centered at the origin.",
        },
        {
          expression:
            "\\text{The region under } y = \\sqrt{4-x^2} \\text{ from } x=0 \\text{ to } x=2 \\text{ is a quarter-disk of radius } 2.",
          annotation:
            "On [0,2], the curve goes from (0,2) to (2,0), tracing a quarter-circle in the first quadrant.",
        },
        {
          expression:
            "\\text{Area of quarter-disk} = \\frac{1}{4}\\pi r^2 = \\frac{1}{4}\\pi(4) = \\pi",
          annotation: "Area = πr²/4 = 4π/4 = π.",
        },
        {
          expression: "\\int_0^2 \\sqrt{4-x^2}\\,dx = \\pi \\approx 3.14159",
          annotation:
            "The definite integral equals the area of the quarter-disk: exactly π.",
        },
      ],
      conclusion:
        "∫₀²√(4−x²)dx = π. This elegant result requires no antiderivative (the antiderivative of √(4−x²) involves arcsin, which is not yet available). Geometric reasoning gives the exact answer immediately. This illustrates the power of the area interpretation.",
    },
    {
      id: "ch4-002-ex3",
      title: "∫₋₁¹ x³ dx = 0 by Symmetry",
      problem:
        "\\text{Evaluate } \\int_{-1}^{1} x^3\\,dx \\text{ using symmetry, without computing.}",
      steps: [
        {
          expression:
            "f(x) = x^3 \\text{ is an odd function: } f(-x) = (-x)^3 = -x^3 = -f(x)",
          annotation: "Verify odd symmetry: f(−x) = −f(x) for all x.",
        },
        {
          expression:
            "\\text{Odd function on symmetric interval} \\Rightarrow \\int_{-1}^{1} x^3\\,dx = 0",
          annotation:
            "By the symmetry theorem: ∫₋ₐᵃ (odd function) dx = 0. The positive area on [0,1] is exactly canceled by the negative area on [−1,0].",
        },
        {
          expression:
            "\\text{Verification: } \\int_{-1}^{1} x^3\\,dx = \\left[\\frac{x^4}{4}\\right]_{-1}^{1} = \\frac{1}{4} - \\frac{1}{4} = 0",
          annotation:
            "The antiderivative of x³ is x⁴/4. Both endpoints give 1/4, so the difference is 0.",
        },
      ],
      conclusion:
        "∫₋₁¹ x³ dx = 0 by symmetry. No computation required — recognizing the odd function on a symmetric interval gives the answer instantly. This is one of the most powerful time-saving tricks in integral calculus.",
    },
    {
      id: "ch4-002-ex4",
      title: "Using Additivity: Finding ∫₃⁵ f from Partial Information",
      problem:
        "\\text{Given } \\int_0^3 f(x)\\,dx = 5 \\text{ and } \\int_0^5 f(x)\\,dx = 12, \\text{ find } \\int_3^5 f(x)\\,dx.",
      steps: [
        {
          expression: "\\int_0^5 f = \\int_0^3 f + \\int_3^5 f",
          annotation:
            "Interval additivity: the integral from 0 to 5 splits at x=3.",
        },
        {
          expression: "12 = 5 + \\int_3^5 f",
          annotation: "Substitute the known values.",
        },
        {
          expression: "\\int_3^5 f(x)\\,dx = 12 - 5 = 7",
          annotation: "Solve for the unknown integral.",
        },
      ],
      conclusion:
        "∫₃⁵ f = 7. The additivity property lets us extract partial integrals from known combinations — like solving an equation. This technique is essential whenever you only have access to aggregate data.",
    },
    {
      id: "ch4-002-ex5",
      title: "Average Value and the MVT for Integrals",
      problem:
        "\\text{Find the average value of } f(x) = x^2 \\text{ on } [0,3]. \\text{ Then find } c \\in (0,3) \\text{ where } f(c) = f_{\\text{avg}}.",
      steps: [
        {
          expression: "f_{\\text{avg}} = \\frac{1}{3-0}\\int_0^3 x^2\\,dx",
          annotation: "Average value formula: (1/(b−a)) × integral.",
        },
        {
          expression:
            "\\int_0^3 x^2\\,dx = \\left[\\frac{x^3}{3}\\right]_0^3 = \\frac{27}{3} - 0 = 9",
          annotation: "Antiderivative of x² is x³/3. Evaluate at 3 and 0.",
        },
        {
          expression: "f_{\\text{avg}} = \\frac{1}{3} \\cdot 9 = 3",
          annotation: "Average value of x² on [0,3] is 3.",
        },
        {
          expression:
            "f(c) = f_{\\text{avg}} \\Rightarrow c^2 = 3 \\Rightarrow c = \\sqrt{3} \\approx 1.73",
          annotation:
            "Solve f(c) = 3 for c. Since c must be in (0,3), we take the positive root c = √3.",
        },
        {
          expression: "\\sqrt{3} \\in (0,3) \\checkmark",
          annotation:
            "Confirmed: c = √3 ≈ 1.73 is in the open interval (0,3), as the MVT for integrals guarantees.",
        },
      ],
      conclusion:
        "The average value of x² on [0,3] is 3. The function achieves this average at c = √3 ≈ 1.73, which lies inside (0,3) as the Mean Value Theorem for Integrals guarantees.",
    },
    {
      id: "ch4-002-ex6",
      title: "∫₋₂² |x| dx Using Geometry",
      problem:
        "\\text{Evaluate } \\int_{-2}^{2} |x|\\,dx \\text{ using the geometric area interpretation.}",
      steps: [
        {
          expression:
            "|x| = \\begin{cases} -x & x < 0 \\\\ x & x \\geq 0 \\end{cases}",
          annotation:
            'The absolute value function forms a "V" shape with vertex at the origin.',
        },
        {
          expression:
            "\\int_{-2}^{2} |x|\\,dx = \\int_{-2}^{0} (-x)\\,dx + \\int_0^2 x\\,dx",
          annotation:
            "Split at x=0 where the behavior changes. On [−2,0], |x| = −x; on [0,2], |x| = x.",
        },
        {
          expression:
            "\\text{Each piece is a right triangle with base 2 and height 2.}",
          annotation:
            "|x| on [−2,0] is a line from 2 to 0 (height at x=−2 is 2, at x=0 is 0). Same on [0,2].",
        },
        {
          expression:
            "\\int_{-2}^{0} (-x)\\,dx = \\frac{1}{2}(2)(2) = 2 \\quad \\int_0^2 x\\,dx = \\frac{1}{2}(2)(2) = 2",
          annotation: "Each triangle has area ½ × 2 × 2 = 2.",
        },
        {
          expression: "\\int_{-2}^{2} |x|\\,dx = 2 + 2 = 4",
          annotation: "Total area = 4.",
        },
        {
          expression:
            "\\text{Or by even symmetry: } \\int_{-2}^{2} |x|\\,dx = 2\\int_0^2 x\\,dx = 2 \\cdot 2 = 4",
          annotation:
            "Since |x| is even, we can use the symmetry shortcut: double the [0,2] piece.",
        },
      ],
      conclusion:
        '∫₋₂² |x| dx = 4. The absolute value function is even, so we can double the integral over [0,2]. Geometrically, the "V" shape creates two triangles with total area 4.',
    },
    {
      id: "ch4-002-ex7",
      title: "Displacement vs. Distance: Signed vs. Unsigned Integral",
      problem:
        "\\text{A particle moves with } v(t) = \\sin(t). \\text{ Find displacement and total distance over } [0, 2\\pi].",
      visualizationId: "SignedArea",
      steps: [
        {
          expression: "\\text{Displacement} = \\int_0^{2\\pi} \\sin(t)\\,dt",
          annotation: "Displacement is the signed integral of velocity.",
        },
        {
          expression:
            "= [-\\cos(t)]_0^{2\\pi} = -\\cos(2\\pi) + \\cos(0) = -1 + 1 = 0",
          annotation:
            "Antiderivative of sin(t) is −cos(t). Evaluate from 0 to 2π.",
        },
        {
          expression:
            "\\text{The particle returns to its starting point after one full period.}",
          annotation:
            "Displacement = 0 means net change in position is zero — it started and ended at the same place.",
        },
        {
          expression:
            "\\text{Total distance} = \\int_0^{2\\pi} |\\sin(t)|\\,dt",
          annotation:
            "Distance ignores direction — integrate the absolute value.",
        },
        {
          expression:
            "= \\int_0^{\\pi} \\sin(t)\\,dt + \\int_{\\pi}^{2\\pi} (-\\sin(t))\\,dt",
          annotation:
            "sin(t) ≥ 0 on [0,π]; sin(t) ≤ 0 on [π,2π] so |sin| = −sin there. Split at the zero.",
        },
        {
          expression:
            "= [-\\cos(t)]_0^{\\pi} + [\\cos(t)]_{\\pi}^{2\\pi} = (1+1) + (-1-(-1)) = 2 + 2 = 4",
          annotation:
            "First piece: −cos(π)+cos(0) = 1+1=2. Second piece: cos(2π)−cos(π) = 1−(−1)=2.",
        },
        {
          expression:
            "\\text{Displacement} = 0, \\quad \\text{Total distance} = 4.",
          annotation:
            "The particle traveled 4 units total but ended where it started.",
        },
      ],
      conclusion:
        "Displacement = 0 (returns to start) but total distance = 4 (traveled 2 units forward and 2 units back). This distinction is fundamental in physics: displacement is a vector (signed); distance is a scalar (unsigned).",
    },
  ],

  challenges: [
    {
      id: "ch4-002-ch1",
      difficulty: "medium",
      problem:
        "Given ∫₋₃³ f(x) dx = 10 and ∫₋₃³ g(x) dx = 6, evaluate: (a) ∫₋₃³ [2f(x) − 3g(x)] dx. (b) If f is even and ∫₀³ f = 7, what is ∫₋₃⁰ f?",
      hint: "Use linearity for part (a). For part (b), use the even-function symmetry: ∫₋₃³ f = 2∫₀³ f. Then use additivity to find ∫₋₃⁰ f.",
      walkthrough: [
        {
          expression:
            "\\text{(a) } \\int_{-3}^3 [2f-3g]\\,dx = 2\\int_{-3}^3 f - 3\\int_{-3}^3 g = 2(10) - 3(6) = 20 - 18 = 2",
          annotation: "Linearity: pull out constants and split the integral.",
        },
        {
          expression:
            "\\text{(b) } f \\text{ even} \\Rightarrow \\int_{-3}^3 f = 2\\int_0^3 f",
          annotation: "For even f on symmetric interval: ∫₋ₐᵃ f = 2∫₀ᵃ f.",
        },
        {
          expression: "\\int_{-3}^3 f = 2(7) = 14",
          annotation: "Since ∫₀³ f = 7, the full symmetric integral is 14.",
        },
        {
          expression:
            "\\int_{-3}^3 f = \\int_{-3}^0 f + \\int_0^3 f \\Rightarrow 14 = \\int_{-3}^0 f + 7 \\Rightarrow \\int_{-3}^0 f = 7",
          annotation:
            "Split by additivity. Subtract ∫₀³ f = 7 from both sides. By symmetry, ∫₋₃⁰ f = ∫₀³ f = 7, as expected for an even function.",
        },
      ],
      answer: "\\text{(a) } 2 \\qquad \\text{(b) } \\int_{-3}^0 f = 7",
    },
    {
      id: "ch4-002-ch2",
      difficulty: "medium",
      problem:
        "Find the average value of f(x) = sin(x) on [0, π]. Then find all c ∈ (0, π) where f(c) = f_avg.",
      hint: "Compute ∫₀^π sin(x) dx using the antiderivative −cos(x). Divide by the interval length π. Then solve sin(c) = f_avg.",
      walkthrough: [
        {
          expression:
            "\\int_0^{\\pi} \\sin(x)\\,dx = [-\\cos(x)]_0^{\\pi} = -\\cos(\\pi)+\\cos(0) = -(-1)+1 = 2",
          annotation: "Antiderivative of sin is −cos.",
        },
        {
          expression:
            "f_{\\text{avg}} = \\frac{1}{\\pi - 0} \\cdot 2 = \\frac{2}{\\pi} \\approx 0.637",
          annotation: "Average value = integral / interval length = 2/π.",
        },
        {
          expression:
            "\\sin(c) = \\frac{2}{\\pi} \\Rightarrow c = \\arcsin\\!\\left(\\frac{2}{\\pi}\\right) \\approx 0.690 \\text{ or } c = \\pi - \\arcsin\\!\\left(\\frac{2}{\\pi}\\right) \\approx 2.452",
          annotation:
            "On [0,π], sin(c) = 2/π has two solutions (sin is positive throughout). Both c ≈ 0.690 and c ≈ 2.452 are in (0,π).",
        },
      ],
      answer:
        "f_{\\text{avg}} = 2/\\pi \\approx 0.637. \\text{ Achieved at } c \\approx 0.690 \\text{ and } c \\approx 2.452.",
    },
    {
      id: "ch4-002-ch3",
      difficulty: "hard",
      problem:
        "Prove the Mean Value Theorem for Integrals from scratch using only the Extreme Value Theorem and Intermediate Value Theorem. Be explicit about where each theorem is used.",
      hint: "Step 1: EVT gives min m and max M of f on [a,b]. Step 2: Comparison inequalities give m ≤ (1/(b−a))∫ₐᵇf ≤ M. Step 3: IVT gives a point where f equals this average value.",
      walkthrough: [
        {
          expression:
            "\\text{Since } f \\text{ is continuous on } [a,b], \\text{ the EVT guarantees } m = \\min f \\text{ and } M = \\max f \\text{ both exist.}",
          annotation:
            "EVT: continuous function on closed bounded interval attains its extrema.",
        },
        {
          expression: "m \\leq f(x) \\leq M \\text{ for all } x \\in [a,b]",
          annotation: "Definition of min and max.",
        },
        {
          expression: "m(b-a) \\leq \\int_a^b f(x)\\,dx \\leq M(b-a)",
          annotation:
            "Comparison property: integrating an inequality over [a,b] preserves it (and multiplies by width b−a).",
        },
        {
          expression: "m \\leq \\frac{1}{b-a}\\int_a^b f(x)\\,dx \\leq M",
          annotation: "Divide through by (b−a) > 0.",
        },
        {
          expression:
            "\\text{Let } \\mu = \\frac{1}{b-a}\\int_a^b f\\,dx. \\text{ Then } m \\leq \\mu \\leq M.",
          annotation:
            "The average value μ lies between the minimum and maximum of f.",
        },
        {
          expression:
            "f \\text{ is continuous and } m = f(d), M = f(e) \\text{ for some } d, e \\in [a,b]. \\text{ By IVT, } \\exists c \\in [a,b]: f(c) = \\mu.",
          annotation:
            "IVT: a continuous function takes all intermediate values between any two values it attains. Since f(d)=m ≤ μ ≤ M=f(e), there exists c between d and e (hence in [a,b]) with f(c)=μ. ∎",
        },
      ],
      answer:
        "\\text{MVT for Integrals proved: } \\exists c \\in [a,b]: f(c) = \\frac{1}{b-a}\\int_a^b f\\,dx.",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "riemann-sums",
      label: "Riemann Sums",
      context:
        "The definite integral's properties (linearity, comparison) all follow from the limit-of-Riemann-sums definition established in Lesson 1.",
    },
    {
      lessonSlug: "fundamental-theorem",
      label: "Fundamental Theorem of Calculus",
      context:
        "Lesson 3 shows how to COMPUTE definite integrals efficiently using antiderivatives. The properties in this lesson remain the foundation for understanding what we are computing.",
    },
    {
      lessonSlug: "applications",
      label: "Applications of Integration",
      context:
        "Area between curves, net displacement, and average value — all developed in Lesson 5 — rely on the properties and signed-area interpretation built here.",
    },
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "read-rigor",
    "completed-example-1",
    "completed-example-2",
    "completed-example-3",
    "completed-example-4",
    "completed-example-5",
    "completed-example-6",
    "completed-example-7",
    "attempted-challenge-medium-1",
    "attempted-challenge-medium-2",
    "attempted-challenge-hard",
  ],

  walkthroughs: [
    // ─── 1. Basic Polynomial — FTC direct application ───────────────────────
    {
      id: 'wt-defint-basic-poly',
      title: 'Basic Polynomial',
      prereqs: ['Power Rule antiderivative', 'FTC Part 1'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'integral', fn: 'x*x + 2*x', a: 1, b: 3, xMin: 0, xMax: 3.6, label: 'f(x) = x\u00B2 + 2x' },
      problem: 'Evaluate $\\displaystyle\\int_1^3 (x^2 + 2x)\\,dx$.',
      steps: [
        {
          label: 'Identify the antiderivative',
          visualNote: 'The curve $f(x) = x^2 + 2x$ is drawn over $[1,3]$; the shaded region beneath it is the area we are about to measure.',
          strategy: 'Before touching the limits, find $F(x)$ — the function whose derivative is $f(x)$. We do this first because the limits are just plug-in values; the hard work is reversing differentiation.',
          explanation: 'Think about what the definite integral is actually asking. The curve $f(x) = x^2 + 2x$ starts at $f(1) = 3$ and rises to $f(3) = 15$. The shaded region under it — that irregular, curved-bottomed shape — has some exact area. Our job is to find it without counting pixels. The key insight of the Fundamental Theorem is that this area question has a secret algebraic twin: find a function $F(x)$ whose derivative is $f(x)$, evaluate it at both endpoints, and subtract. Differentiation *erases* a power — antidifferentiation *restores* it. The term $x^2$ must have come from $\\frac{x^3}{3}$, because $\\frac{d}{dx}\\frac{x^3}{3} = x^2$. Likewise $2x$ came from $x^2$. We reconstruct both.',
          math: 'F(x) = \\frac{x^3}{3} + x^2',
          gotcha: 'Do NOT add $+C$ at this stage. In a definite integral $C$ cancels: $[F(x)+C]_a^b = F(b)-F(a)$. Writing it just clutters the work.',
          conceptRef: 'Power rule antiderivative: $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}$',
        },
        {
          label: 'Apply the Evaluation Theorem — plug in the limits',
          visualNote: 'Two vertical lines appear at $x=1$ and $x=3$, marking the boundary of the shaded region.',
          strategy: 'FTC says the net signed area equals $F(b) - F(a)$. We always subtract $F(\\text{lower})$ from $F(\\text{upper})$ — order matters for sign.',
          explanation: 'Now comes the payoff. The bracket notation $\\Big[F(x)\\Big]_1^3$ is a compact instruction: evaluate $F$ at the top, evaluate $F$ at the bottom, subtract. That single subtraction collapses what would otherwise be a geometric measurement problem into pure arithmetic — no approximation, no grid counting. This is the moment FTC earns its reputation. We compute $F(3) = 9 + 9 = 18$ and $F(1) = \\frac{1}{3} + 1 = \\frac{4}{3}$, then subtract.',
          math: '\\Big[\\tfrac{x^3}{3} + x^2\\Big]_1^3 = \\Bigl(\\tfrac{27}{3}+9\\Bigr) - \\Bigl(\\tfrac{1}{3}+1\\Bigr)',
          sandbox: {
            value: 'b=3,\\; a=1',
            rows: [
              { label: '$F(3)$', expr: '\\frac{27}{3} + 9 = 9 + 9 = 18' },
              { label: '$F(1)$', expr: '\\frac{1}{3} + 1 = \\frac{4}{3}' },
              { label: '$F(3)-F(1)$', expr: '18 - \\frac{4}{3} = \\frac{54-4}{3} = \\frac{50}{3} \\approx 16.67' },
            ],
            conclusion: 'The exact area under $x^2+2x$ from 1 to 3 is $\\frac{50}{3}$.',
          },
          gotcha: 'Evaluate the upper limit first, then subtract the lower. Reversing gives the wrong sign.',
        },
        {
          label: 'State the result',
          explanation: 'Carry out the subtraction. The answer is a fraction — leave it as $\\frac{50}{3}$ rather than converting to $16.\\overline{6}$. Exact form is always preferred unless a decimal approximation is specifically requested.',
          math: '\\int_1^3(x^2+2x)\\,dx = 18 - \\tfrac{4}{3} = \\frac{50}{3}',
        },
      ],
      variations: [
        { question: 'What if the lower limit were $0$ instead of $1$?', hint: '$F(0) = 0$, so the answer is just $F(3) = 18$. Lower limit of 0 is a free simplification.' },
        { question: 'What changes if the integrand were $x^2 - 2x$?', hint: 'Only $F(x)$ changes to $\\frac{x^3}{3} - x^2$. Re-evaluate — the shaded area shrinks because $f$ dips below zero near $x=1$.' },
      ],
    },

    // ─── 2. Signed Area — net vs total ──────────────────────────────────────
    {
      id: 'wt-defint-signed-area',
      title: 'Signed Area',
      prereqs: ['Definite integral definition', 'Basic antiderivatives'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'signed-area', fn: 'x', a: -1, b: 2, xMin: -1.5, xMax: 2.5, label: 'f(x) = x' },
      problem: 'Evaluate $\\displaystyle\\int_{-1}^{2} x\\,dx$ and interpret both the net signed area and the total (unsigned) area.',
      steps: [
        {
          label: 'Find the antiderivative and apply FTC',
          visualNote: 'The line $f(x)=x$ is drawn over $[-1,2]$. Below the $x$-axis ($-1$ to $0$) the shading is red (negative area); above ($0$ to $2$) it is blue (positive area).',
          strategy: 'Start with the mechanical computation — FTC gives net signed area automatically. Geometric interpretation comes after.',
          explanation: 'Look at the graph before touching any algebra. The function $f(x) = x$ is a line through the origin — it is negative on $[-1, 0]$ and positive on $[0, 2]$. The definite integral sweeps across both regions and counts the negative portion as *subtracted* area. So the number the integral returns is not the total amount of shading you see — it is the net balance after the below-axis piece cancels some of the above-axis piece. With that in mind, the mechanics are straightforward: the antiderivative of $x$ is $\\frac{x^2}{2}$.',
          math: '\\int_{-1}^{2} x\\,dx = \\Big[\\tfrac{x^2}{2}\\Big]_{-1}^{2} = \\tfrac{4}{2} - \\tfrac{1}{2} = \\tfrac{3}{2}',
          sandbox: {
            value: 'b=2,\\; a=-1',
            rows: [
              { label: '$F(2)$', expr: '\\frac{4}{2} = 2' },
              { label: '$F(-1)$', expr: '\\frac{1}{2}' },
              { label: 'Net area', expr: '2 - \\frac{1}{2} = \\frac{3}{2}' },
            ],
            conclusion: 'FTC delivers the net signed area: $\\frac{3}{2}$.',
          },
        },
        {
          label: 'Identify where $f$ crosses zero',
          visualNote: 'A dot appears at $x=0$ — the crossing point that separates negative from positive area.',
          strategy: 'To find total (unsigned) area we must split the integral wherever $f(x)$ changes sign. Otherwise negative contributions cancel positive ones — the integral underreports the geometric area.',
          explanation: 'Here is the surprise hidden in the answer $\\frac{3}{2}$: that is not the geometric area of the shaded region — it is the algebraic balance after the negative section cancelled some of the positive. If you looked at the graph and asked "how much shading is there?", your eye would naturally add both regions together, not subtract. To measure what you actually see, we need to separate the pieces. The function $f(x) = x$ crosses zero at $x = 0$, which lies inside our interval. That zero-crossing is the boundary between the two behaviours, and we must split the integral there.',
          math: '\\text{Total area} = \\int_{-1}^{0}|x|\\,dx + \\int_{0}^{2}|x|\\,dx',
          gotcha: 'On $[-1,0]$, $f(x) < 0$ so $|f(x)| = -f(x) = -x$. You must negate the integrand on negative pieces, not just the limits.',
        },
        {
          label: 'Compute each piece and add',
          explanation: 'On the left piece $[-1,0]$ the integrand is negative, so we negate it to get a positive area contribution: $\\int_{-1}^{0}(-x)\\,dx$. On the right piece $[0,2]$ the integrand is already positive, so $x$ integrates directly. Each piece corresponds to a right triangle — we can verify geometrically: a triangle with base 1 and height 1 has area $\\frac{1}{2}$, and a triangle with base 2 and height 2 has area 2. The integrals confirm both, and adding gives the total geometric area.',
          math: '\\int_{-1}^{0}(-x)\\,dx + \\int_{0}^{2} x\\,dx = \\tfrac{1}{2} + 2 = \\tfrac{5}{2}',
          sandbox: {
            value: 'split at $x=0$',
            rows: [
              { label: 'Left piece $(-x)$', expr: '\\Big[-\\tfrac{x^2}{2}\\Big]_{-1}^{0} = 0 - (-\\tfrac{1}{2}) = \\tfrac{1}{2}' },
              { label: 'Right piece $(x)$', expr: '\\Big[\\tfrac{x^2}{2}\\Big]_{0}^{2} = 2 - 0 = 2' },
              { label: 'Total (geometric)', expr: '\\tfrac{1}{2} + 2 = \\tfrac{5}{2}' },
            ],
            conclusion: 'Net signed area $\\frac{3}{2}$ ≠ total geometric area $\\frac{5}{2}$. The crossing point is the culprit.',
          },
          conceptRef: 'Net vs total area: $\\int_a^b f\\,dx$ counts cancellation; $\\int_a^b |f|\\,dx$ does not.',
        },
      ],
      variations: [
        { question: 'What if we asked for $\\int_{-1}^{2}|x|\\,dx$ directly?', hint: 'That\'s the total area $\\frac{5}{2}$ — the $|\\cdot|$ inside the integral forces the split.' },
        { question: 'What if $f(x) = \\sin x$ on $[0, 2\\pi]$?', hint: 'Net area is 0 (symmetric above/below). Total area is 4. Always split at $\\sin x = 0$, i.e., $x = \\pi$.' },
      ],
    },

    // ─── 3. u-Substitution with Limit Change ────────────────────────────────
    {
      id: 'wt-defint-u-sub',
      title: 'u-Substitution',
      prereqs: ['Indefinite u-substitution', 'Chain rule'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'integral', fn: '2*x*Math.pow(x*x+1,3)', a: 0, b: 2, xMin: -0.2, xMax: 2.3, label: 'f(x) = 2x(x\u00B2+1)\u00B3' },
      problem: 'Evaluate $\\displaystyle\\int_0^2 2x(x^2+1)^3\\,dx$.',
      steps: [
        {
          label: 'Choose $u$ — spot the inside function',
          visualNote: 'The expression $(x^2+1)^3$ is highlighted; $2x$ is its derivative sitting beside it.',
          strategy: 'We look for a composite structure: a function raised to a power with its derivative nearby. Here $u = x^2+1$ because $du = 2x\\,dx$ appears exactly in the integrand — zero algebra tax.',
          explanation: 'Look at the integrand carefully before writing anything down. The factor $(x^2+1)^3$ is a composite — something raised to a power. Sitting right beside it is $2x$, which happens to be *exactly* the derivative of $x^2 + 1$. This is the chain rule\'s fingerprint in reverse. When you see a composite function with its own derivative nearby, that is the substitution announcing itself. We set $u = x^2 + 1$ and compute $du = 2x\\,dx$. The entire factor $2x\\,dx$ in the integrand is now just $du$ — the substitution is perfectly clean, with no leftover constants to compensate for.',
          math: 'u = x^2+1 \\quad\\Rightarrow\\quad du = 2x\\,dx',
          gotcha: 'If the derivative were $3x$ instead of $2x$, you\'d need to force a factor: $du = 2x\\,dx \\Rightarrow x\\,dx = du/2$. Always match exactly.',
          conceptRef: 'u-substitution: reverse chain rule',
        },
        {
          label: 'Change the limits from $x$-values to $u$-values',
          visualNote: 'The $x$-axis labels "0" and "2" transform into "$u=1$" and "$u=5$" on the $u$-axis.',
          strategy: 'We change limits now — not at the end — so we never need to back-substitute. Keeping everything in $u$ is cleaner and avoids the error-prone step of converting $F(u)$ back to $F(x)$ before evaluating.',
          explanation: 'This step separates the definite integral case from the indefinite one. With an indefinite integral, you substitute, integrate in $u$, then back-substitute to $x$. With a definite integral, there is a better path: convert the limits to $u$-values *now*, and you never have to back-substitute at all. The entire computation stays in $u$. Feed each $x$-limit into $u = x^2 + 1$: at $x = 0$ you get $u = 1$, and at $x = 2$ you get $u = 5$. These become the new bounds.',
          math: 'x=0 \\Rightarrow u=1 \\qquad x=2 \\Rightarrow u=5',
        },
        {
          label: 'Rewrite and integrate in $u$',
          explanation: 'With the substitution complete, the integral is a clean power-rule problem. Every $x$ is gone. Every $dx$ is gone. What remains is $\\int_1^5 u^3\\,du$ — one of the most elementary antiderivative forms possible. Apply the power rule, evaluate between the new $u$-limits, and we are done. The formidable-looking original integral has been reduced to a single fraction subtraction.',
          math: '\\int_1^5 u^3\\,du = \\Big[\\tfrac{u^4}{4}\\Big]_1^5',
          sandbox: {
            value: 'u=1$ to $u=5',
            rows: [
              { label: '$F(5)$', expr: '\\frac{625}{4}' },
              { label: '$F(1)$', expr: '\\frac{1}{4}' },
              { label: 'Result', expr: '\\frac{625-1}{4} = \\frac{624}{4} = 156' },
            ],
            conclusion: 'Verify: plug $x=2$ into $(x^2+1)^4/4$ minus at $x=0$: $\\frac{5^4}{4}-\\frac{1^4}{4} = 156\\,\\checkmark$',
          },
          conceptRef: 'Power rule antiderivative after substitution',
        },
      ],
      variations: [
        { question: 'What if the limits were $-1$ to $2$?', hint: '$u(-1) = 2$, $u(2) = 5$. New limits $[2,5]$. Same integrand.' },
        { question: 'What if you forgot to change the limits and back-substituted instead?', hint: 'You\'d get $\\frac{(x^2+1)^4}{4}\\Big|_0^2$ — same answer, but the two-step back-sub is where errors sneak in.' },
      ],
    },

    // ─── 4. Split Interval — piecewise / absolute value ─────────────────────
    {
      id: 'wt-defint-split-interval',
      title: 'Split Interval',
      prereqs: ['Signed area', 'Piecewise functions'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'split-integral', fn: 'Math.abs(x-1)', a: -2, b: 3, split: 1, xMin: -2.5, xMax: 3.5, label: 'f(x) = |x \u2212 1|' },
      problem: 'Evaluate $\\displaystyle\\int_{-2}^{3}|x-1|\\,dx$.',
      steps: [
        {
          label: 'Remove the absolute value — find the split point',
          visualNote: 'The V-shaped graph of $|x-1|$ is drawn. The vertex (the kink) at $x=1$ divides the interval into two pieces.',
          strategy: '$|x-1|$ changes definition at $x=1$. We must split there because the antiderivative formula is different on each side — a single FTC application cannot straddle a sign change.',
          explanation: 'Absolute value functions are piecewise by nature. The expression inside, $x - 1$, equals zero at $x = 1$ — that is the kink point, the vertex of the $V$ shape. To the left of $x = 1$, the expression $x - 1$ is negative, so $|x-1|$ flips its sign: it equals $1 - x$. To the right, $x - 1$ is positive, so $|x-1| = x - 1$ directly. These two branches have different antiderivatives, and a single FTC sweep cannot straddle the kink. We must split the integral at $x = 1$, treating each side separately.',
          math: '\\int_{-2}^{3}|x-1|\\,dx = \\int_{-2}^{1}(1-x)\\,dx + \\int_{1}^{3}(x-1)\\,dx',
        },
        {
          label: 'Evaluate the left piece',
          explanation: 'On the left piece, the integrand is $(1 - x)$, and its antiderivative is $x - \\frac{x^2}{2}$, found term by term. When we evaluate at the lower limit $x = -2$: $F(-2) = -2 - \\frac{4}{2} = -4$. That negative value at the lower limit is not a warning sign — it is just where $F$ happens to sit at $x = -2$. The subtraction $F(1) - F(-2) = \\frac{1}{2} - (-4)$ turns it into a large positive area, as expected: the function $1-x$ is positive and high on the wide stretch $[-2, 1]$.',
          math: '\\Big[x - \\tfrac{x^2}{2}\\Big]_{-2}^{1} = \\Bigl(1-\\tfrac{1}{2}\\Bigr)-\\Bigl(-2-2\\Bigr) = \\tfrac{1}{2}+4 = \\tfrac{9}{2}',
          sandbox: {
            value: 'a=-2,\\; b=1',
            rows: [
              { label: '$F(1)$', expr: '1 - \\frac{1}{2} = \\frac{1}{2}' },
              { label: '$F(-2)$', expr: '-2 - \\frac{4}{2} = -4' },
              { label: 'Left piece', expr: '\\frac{1}{2} - (-4) = \\frac{9}{2}' },
            ],
            conclusion: 'The left triangular region has area $\\frac{9}{2}$.',
          },
        },
        {
          label: 'Evaluate the right piece and sum',
          explanation: 'The right piece is $(x - 1)$, which is zero at $x = 1$ and positive for $x > 1$, so no sign flip is needed here. Its antiderivative is $\\frac{x^2}{2} - x$. This piece represents the right half of the $V$ — a smaller triangle with base 2 and height 2, so area 2. The integrals confirm that cleanly.',
          math: '\\Big[\\tfrac{x^2}{2}-x\\Big]_{1}^{3} = \\Bigl(\\tfrac{9}{2}-3\\Bigr)-\\Bigl(\\tfrac{1}{2}-1\\Bigr) = \\tfrac{3}{2}+\\tfrac{1}{2} = 2',
          gotcha: 'On the right piece $f(x)=x-1 \\geq 0$, so no sign flip needed. Only negate where the original expression is negative.',
          conceptRef: 'Additivity of integrals: $\\int_a^c = \\int_a^b + \\int_b^c$',
        },
        {
          label: 'Add the two pieces',
          explanation: 'Because we handled the sign flip in step 1 — writing $1-x$ instead of $x-1$ on the negative side — both integral values came out positive. We simply add them. This is the total geometric area: what a ruler would measure along the shaded $V$-shaped region, with no cancellation.',
          math: '\\int_{-2}^{3}|x-1|\\,dx = \\tfrac{9}{2} + 2 = \\tfrac{13}{2}',
        },
      ],
      variations: [
        { question: 'What if the integrand were $|x^2 - 1|$?', hint: 'Now find where $x^2-1=0$: $x=\\pm 1$. Three pieces: $[-2,-1]$, $[-1,1]$, $[1,3]$.' },
      ],
    },

    // ─── 5. Trig Functions ───────────────────────────────────────────────────
    {
      id: 'wt-defint-trig',
      title: 'Trig Functions',
      prereqs: ['Trig antiderivatives', 'Special angle values'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'integral', fn: 'Math.sin(x)+Math.cos(x)', a: 0, b: Math.PI/2, xMin: -0.3, xMax: Math.PI/2 + 0.5, label: 'f(x) = sin x + cos x' },
      problem: 'Evaluate $\\displaystyle\\int_0^{\\pi/2}(\\sin x + \\cos x)\\,dx$.',
      steps: [
        {
          label: 'Find the antiderivative term by term',
          visualNote: 'The curve $\\sin x + \\cos x$ oscillates over $[0, \\pi/2]$, staying positive throughout — shading is entirely above the axis.',
          strategy: 'Apply the trig antiderivative table to each term. Remember the sign: $\\int \\sin x\\,dx = -\\cos x$ (not $+\\cos x$). The minus is the most common sign error here.',
          explanation: 'Trig antiderivatives feel backwards at first. When you differentiate $-\\cos x$ you get $\\sin x$ — that minus sign is exactly what makes it work. Many students write $+\\cos x$ by instinct and introduce a sign error that propagates through every trig integral they ever do. Pause and verify: $\\frac{d}{dx}(-\\cos x) = \\sin x\\,\\checkmark$. Once you trust that fact, antidifferentiating $\\sin x + \\cos x$ is just two table lookups: $-\\cos x$ for the $\\sin$ term and $+\\sin x$ for the $\\cos$ term. No chain rule complications because the argument is just $x$.',
          math: 'F(x) = -\\cos x + \\sin x',
          gotcha: '$\\int \\sin x\\,dx = -\\cos x$, NOT $+\\cos x$. Verify: $\\frac{d}{dx}(-\\cos x) = \\sin x\\,\\checkmark$',
          conceptRef: 'Trig antiderivatives: $\\int\\sin = -\\cos$, $\\int\\cos = \\sin$',
        },
        {
          label: 'Evaluate at the limits',
          explanation: 'Now we evaluate at the special angles $\\pi/2$ and $0$ — the angles where the unit circle gives exact values with no calculator needed. At $x = \\pi/2$: cosine is 0 and sine is 1. At $x = 0$: cosine is 1 and sine is 0. Substituting into $F(x) = -\\cos x + \\sin x$: the upper limit gives $F(\\pi/2) = -0 + 1 = 1$, and the lower limit gives $F(0) = -1 + 0 = -1$. Notice that $F(0) = -1$ — a negative number at the lower limit. The subtraction $F(\\pi/2) - F(0) = 1 - (-1) = 2$ turns that negative lower value into an asset, boosting the final result.',
          math: '\\Big[-\\cos x + \\sin x\\Big]_0^{\\pi/2} = (-\\cos\\tfrac{\\pi}{2}+\\sin\\tfrac{\\pi}{2})-(-\\cos 0+\\sin 0)',
          sandbox: {
            value: 'x=\\pi/2$ and $x=0',
            rows: [
              { label: '$F(\\pi/2)$', expr: '-0 + 1 = 1' },
              { label: '$F(0)$', expr: '-1 + 0 = -1' },
              { label: 'Result', expr: '1 - (-1) = 2' },
            ],
            conclusion: 'The area under $\\sin x + \\cos x$ over the first quarter-period is exactly 2.',
          },
        },
      ],
      variations: [
        { question: 'What if the upper limit were $\\pi$ instead of $\\pi/2$?', hint: '$F(\\pi) = -\\cos\\pi + \\sin\\pi = 1 + 0 = 1$. Result: $1-(-1) = 2$. Same answer — the curve dips and rises symmetrically.' },
        { question: 'Evaluate $\\int_0^{\\pi} \\sin x\\,dx$. Geometric meaning?', hint: 'Result is 2. The arch of $\\sin$ over $[0,\\pi]$ has area exactly 2 — a famous benchmark value.' },
      ],
    },

    // ─── 6. Average Value of a Function ─────────────────────────────────────
    {
      id: 'wt-defint-avg-value',
      title: 'Average Value',
      prereqs: ['Definite integral', 'FTC'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'integral', fn: 'x*x', a: 1, b: 4, xMin: 0, xMax: 4.6, showAvg: true, avgValue: 7, label: 'f(x) = x\u00B2' },
      problem: 'Find the average value of $f(x) = x^2$ on $[1,4]$.',
      steps: [
        {
          label: 'Apply the average value formula',
          visualNote: 'The parabola $x^2$ is drawn over $[1,4]$. A horizontal dashed line at height $f_{\\text{avg}}$ is shown — it slices the parabola so the area above equals the area below.',
          strategy: 'The average value formula $\\frac{1}{b-a}\\int_a^b f(x)\\,dx$ is just the integral divided by the width of the interval. Think of it as: if you replaced the curve with a rectangle of the same area, what height would the rectangle have?',
          explanation: 'The average value of a function is the continuous analogue of a class average. For a list of $n$ numbers you sum them and divide by $n$. For a continuous function, you integrate — the continuous version of summing — and divide by the length of the interval $(b - a)$. The result has a clear geometric meaning: it is the height of a rectangle over $[a,b]$ that has exactly the same area as the region under the curve. Look at the graph and imagine flattening the curved region into a flat slab. How tall would that slab be? That is the average value. Here with $a=1$, $b=4$, the formula gives $\\frac{1}{3}\\int_1^4 x^2\\,dx$.',
          math: 'f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx = \\frac{1}{3}\\int_1^4 x^2\\,dx',
          conceptRef: 'Average value: $f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f\\,dx$',
        },
        {
          label: 'Evaluate the integral',
          explanation: 'First we compute the total area under the parabola from $x=1$ to $x=4$. The antiderivative of $x^2$ is $\\frac{x^3}{3}$. Evaluating: $F(4) = \\frac{64}{3}$ and $F(1) = \\frac{1}{3}$, giving $\\frac{63}{3} = 21$. That 21 square units is the raw area — but it is "too big" on its own, because it does not account for how wide the interval is. A narrow interval with the same area would correspond to a much taller average.',
          math: '\\int_1^4 x^2\\,dx = \\Big[\\tfrac{x^3}{3}\\Big]_1^4 = \\tfrac{64}{3} - \\tfrac{1}{3} = 21',
          sandbox: {
            value: 'b=4,\\; a=1',
            rows: [
              { label: '$F(4)$', expr: '\\frac{64}{3}' },
              { label: '$F(1)$', expr: '\\frac{1}{3}' },
              { label: '$\\int_1^4 x^2\\,dx$', expr: '\\frac{63}{3} = 21' },
            ],
            conclusion: 'The area under $x^2$ from 1 to 4 is 21 square units.',
          },
        },
        {
          label: 'Divide by the interval width',
          explanation: 'The interval $[1,4]$ has width $b - a = 3$. Dividing the area 21 by the width 3 gives the average height: 7. This means a flat rectangle of height 7 over $[1,4]$ has exactly the same area as the region under $x^2$. Notice $f(1) = 1$ and $f(4) = 16$, so 7 sits in that range — but it is not the simple midpoint of those values $(\\frac{1+16}{2} = 8.5)$. The parabola spends more of its interval at lower values and rises steeply only at the right end, which pulls the area-weighted average down closer to 7.',
          math: 'f_{\\text{avg}} = \\frac{21}{3} = 7',
          gotcha: 'Do NOT forget to divide by $(b-a)$. Many students compute the integral correctly and forget the $\\frac{1}{b-a}$ factor — they report 21 instead of 7.',
        },
      ],
      variations: [
        { question: 'Find the value $c \\in [1,4]$ where $f(c) = f_{\\text{avg}} = 7$.', hint: '$c^2 = 7 \\Rightarrow c = \\sqrt{7} \\approx 2.65$. This is the Mean Value Theorem for integrals.' },
      ],
    },

    // ─── 7. Area Between Two Curves ─────────────────────────────────────────
    {
      id: 'wt-defint-area-between',
      title: 'Area Between Curves',
      prereqs: ['Definite integral', 'Solving equations for intersections'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'area-between', fn1: 'x+2', fn2: 'x*x', a: -1, b: 2, xMin: -1.6, xMax: 2.6, intersections: [-1, 2], label1: 'f(x) = x+2', label2: 'g(x) = x\u00B2' },
      problem: 'Find the area enclosed between $f(x) = x+2$ and $g(x) = x^2$ from their intersection points.',
      steps: [
        {
          label: 'Find intersection points — the limits of integration',
          visualNote: 'The line $y=x+2$ and the parabola $y=x^2$ are drawn. Two crossing points appear — these become the limits $a$ and $b$.',
          strategy: 'We never guess the limits for area-between problems. Set the curves equal and solve. The intersection points are always the natural limits when finding the enclosed area.',
          explanation: 'Before setting up any integral, we need to know *where* the two curves meet — those crossing points are the natural boundaries of the enclosed region. Looking at the graph, a line and an upward-opening parabola can intersect 0, 1, or 2 times. Here they intersect twice, creating a closed lens-shaped region. To find those points algebraically, set the formulas equal: $x + 2 = x^2$. Rearranging gives $x^2 - x - 2 = 0$, which factors as $(x-2)(x+1) = 0$. The two crossing points are $x = -1$ and $x = 2$, and these become our limits of integration.',
          math: 'x = -1 \\quad\\text{and}\\quad x = 2',
          gotcha: 'Always verify which function is on top by testing a point between the intersections. Here $x=0$: $f(0)=2 > g(0)=0$, so $f$ is on top.',
        },
        {
          label: 'Set up the integral as (top) minus (bottom)',
          visualNote: 'The vertical strip between the two curves is highlighted. Its height is $f(x)-g(x)$.',
          strategy: 'Area between curves is always $\\int[f_{\\text{top}} - f_{\\text{bottom}}]\\,dx$. The sign of this difference is positive on $[-1,2]$ (we just verified). If the curves cross again inside, we\'d need to split.',
          explanation: 'The area between two curves is the accumulated *gap* between them, measured vertically at every $x$. Imagine a very thin vertical strip at some $x$ between $-1$ and $2$ — its height is the distance from the lower curve up to the upper curve. We confirmed with $x = 0$ that the line $f(x) = x+2$ sits above the parabola $g(x) = x^2$ on the whole interior. So the strip height is $f(x) - g(x) = (x+2) - x^2 = -x^2 + x + 2$, and this expression stays positive throughout $[-1,2]$. If this difference ever went negative inside the interval, we would need to split — but it does not.',
          math: 'A = \\int_{-1}^{2}[(x+2)-x^2]\\,dx = \\int_{-1}^{2}(-x^2+x+2)\\,dx',
        },
        {
          label: 'Evaluate the integral',
          explanation: 'The antiderivative of $-x^2 + x + 2$ is found term by term: $-\\frac{x^3}{3} + \\frac{x^2}{2} + 2x$. Evaluating at $x = -1$ requires care — plugging a negative number into a cubic produces a positive value $\\bigl(-\\frac{(-1)^3}{3}\\bigr) = +\\frac{1}{3}$, which surprises many students. Track each term\'s sign independently rather than combining on the fly. The final subtraction $F(2) - F(-1)$ will involve mixed-sign fractions — patience with the arithmetic here is the only thing standing between you and the right answer.',
          math: '\\Big[-\\tfrac{x^3}{3}+\\tfrac{x^2}{2}+2x\\Big]_{-1}^{2}',
          sandbox: {
            value: 'b=2,\\; a=-1',
            rows: [
              { label: '$F(2)$', expr: '-\\frac{8}{3}+2+4 = -\\frac{8}{3}+6 = \\frac{10}{3}' },
              { label: '$F(-1)$', expr: '\\frac{1}{3}+\\frac{1}{2}-2 = \\frac{2+3-12}{6} = -\\frac{7}{6}' },
              { label: 'Area', expr: '\\frac{10}{3}+\\frac{7}{6} = \\frac{20+7}{6} = \\frac{27}{6} = \\frac{9}{2}' },
            ],
            conclusion: 'The enclosed region has area $\\frac{9}{2}$ square units.',
          },
          conceptRef: 'Area between curves: $\\int_a^b[f_{\\text{top}}-f_{\\text{bot}}]\\,dx$',
        },
      ],
      variations: [
        { question: 'What if $g(x) = x$ instead of $x^2$?', hint: 'Solve $x+2=x$ → no solution. The curves never intersect — area is infinite or you need given bounds.' },
        { question: 'What if you integrated with $g - f$ by mistake?', hint: 'You\'d get $-\\frac{9}{2}$. The negative answer is a signal that you put top and bottom backwards — flip the subtraction.' },
      ],
    },

    // ─── 8. FTC Part 2 — derivative of an integral ──────────────────────────
    {
      id: 'wt-defint-ftc2',
      title: 'FTC Part 2',
      prereqs: ['FTC Part 1', 'Chain rule'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'integral', fn: 'Math.sqrt(x*x*x+1)', a: 1, b: 4, xMin: 0, xMax: 4.5, label: 'f(t) = \u221a(t\u00B3+1)' },
      problem: 'Find $\\dfrac{d}{dx}\\displaystyle\\int_1^{x^2} \\sqrt{t^3+1}\\,dt$.',
      steps: [
        {
          label: 'Recognize the FTC Part 2 pattern',
          visualNote: 'The upper limit "$x^2$" is highlighted in red — it is a function of $x$, not a constant. This is what makes it FTC Part 2, not Part 1.',
          strategy: 'FTC Part 2 says: $\\frac{d}{dx}\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\cdot g\'(x)$. The key move is: plug the upper limit into $f$, then multiply by the derivative of the upper limit. No antiderivative is ever computed.',
          explanation: 'At first glance this problem looks harder than it actually is. The integrand $\\sqrt{t^3+1}$ has no elementary antiderivative — you simply cannot write down a closed-form $F(t)$. Yet the problem asks for a *derivative*, not an antiderivative. This is FTC Part 2 at work: differentiation undoes integration, and we never need to find $F(t)$ at all. The formula $\\frac{d}{dx}\\int_a^{g(x)}f(t)\\,dt = f(g(x))\\cdot g\'(x)$ handles everything. The variable $t$ inside the integrand is just a placeholder — a dummy variable that vanishes the moment we evaluate $f$ at the upper limit.',
          math: '\\frac{d}{dx}\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\cdot g\'(x)',
          conceptRef: 'FTC Part 2: differentiation undoes integration (with chain rule for composite upper limit)',
        },
        {
          label: 'Plug the upper limit into $f(t)$',
          visualNote: 'The "$t$" inside $\\sqrt{t^3+1}$ is replaced by "$x^2$."',
          strategy: 'Substitute $t = g(x) = x^2$ into $f(t)$. This is the "evaluate at upper limit" step. It feels mechanical once you see the pattern.',
          explanation: 'The variable $t$ inside the integrand plays the same role as $i$ in a sum $\\sum_i a_i$ — it exists to carry the formula but has no life outside the integral. FTC Part 2 says: evaluate the integrand at the upper limit. Wherever you see $t$, write $g(x) = x^2$. So $\\sqrt{t^3+1}$ becomes $\\sqrt{(x^2)^3 + 1} = \\sqrt{x^6+1}$. This is pure substitution, not differentiation. The derivative comes in the next step, as a separate factor.',
          math: 'f(g(x)) = \\sqrt{(x^2)^3+1} = \\sqrt{x^6+1}',
          gotcha: 'Do NOT differentiate $f(t)$ — you are evaluating it, not differentiating it. The chain rule factor comes next, separately.',
        },
        {
          label: 'Multiply by $g\'(x)$ — the chain rule factor',
          explanation: 'The upper limit $x^2$ is itself a function of $x$, and the chain rule accounts for that growth. Think of $\\int_1^{x^2}f(t)\\,dt$ as a composite: the outer function "accumulates area up to some point" and the inner function is $x^2$. Chain rule says multiply the outer-prime-at-inner by the inner-prime. Outer-prime-at-inner is $f(x^2) = \\sqrt{x^6+1}$ (what we just found). Inner-prime is $(x^2)\' = 2x$. Multiply them together and we have the exact derivative — all without computing a single antiderivative.',
          math: '\\frac{d}{dx}\\int_1^{x^2}\\sqrt{t^3+1}\\,dt = \\sqrt{x^6+1}\\cdot 2x',
          sandbox: {
            value: 'x=1$ (sanity check)',
            rows: [
              { label: 'Upper limit at $x=1$', expr: 'g(1) = 1^2 = 1' },
              { label: 'Integral from 1 to 1', expr: '\\int_1^1 \\sqrt{t^3+1}\\,dt = 0' },
              { label: 'Derivative at $x=1$', expr: '\\sqrt{1+1}\\cdot 2 = 2\\sqrt{2} \\approx 2.83' },
            ],
            conclusion: 'The integral collapses to 0 at $x=1$ but its rate of change there is $2\\sqrt{2}$ — the upper-limit motion drives the growth.',
          },
          gotcha: 'If the upper limit were just $x$ (not $x^2$), the chain rule factor would be 1 and we\'d skip this step.',
        },
      ],
      variations: [
        { question: 'What if the upper limit were $x^3$ instead of $x^2$?', hint: '$g\'(x) = 3x^2$. Answer: $\\sqrt{x^9+1}\\cdot 3x^2$.' },
        { question: 'What if the variable limit were on the bottom instead: $\\int_x^1 \\sqrt{t^3+1}\\,dt$?', hint: 'Flip limits to get $-\\int_1^x \\sqrt{t^3+1}\\,dt$. Chain rule factor is 1, but the answer is negated: $-\\sqrt{x^3+1}$.' },
      ],
    },

    // ─── 9. Comparison Properties — which integral is larger? ───────────────
    {
      id: 'wt-defint-comparison',
      title: 'Comparing Integrals',
      prereqs: ['Definite integral definition', 'Comparison property'],
      svgId: 'WalkthroughViz',
      vizProps: { type: 'comparison', fn1: 'Math.sqrt(1+x*x)', fn2: 'Math.sqrt(1+x)', a: 0, b: 1, xMin: -0.15, xMax: 1.3, label1: 'f(x) = \u221a(1+x\u00B2)', label2: 'g(x) = \u221a(1+x)' },
      problem: 'Compare $f(x) = \\sqrt{1+x^2}$ and $g(x) = \\sqrt{1+x}$ over the interval $[0,1]$. Which integral is larger?',
      steps: [
        {
          label: 'Graph both functions and observe — do not guess',
          visualNote: 'Graphed on a wide window, $f(x)$ appears to sit *above* $g(x)$ everywhere. Zoom into $[0,1]$ and the picture reverses: $g$ creeps above $f$ throughout the interior.',
          strategy: 'Comparison problems are almost always misleading at first glance. The global picture and the local picture over $[0,1]$ tell opposite stories. You must zoom in to the exact interval before drawing any conclusion.',
          explanation: 'Plot both curves on a wide window, say $[-2, 3]$. $f(x) = \\sqrt{1+x^2}$ appears to dominate — its $x^2$ term grows quickly and pulls the curve upward. But zoom into $[0,1]$ and something surprising happens: $g(x) = \\sqrt{1+x}$ is actually *above* $f(x)$ on the interior. The two functions agree at the endpoints $x=0$ (both equal $\\sqrt{1} = 1$) and $x=1$ (both equal $\\sqrt{2}$), but between those points they separate — $g$ takes the inside lane. This reversal is the entire puzzle.',
          gotcha: 'Never conclude which function is larger from a global graph view. Always verify on the specific interval — curves that look ordered on $[-5,5]$ can cross or reverse on $[0,1]$.',
        },
        {
          label: 'Prove the ordering algebraically on $[0,1]$',
          visualNote: 'A thin red strip shows the gap where $g(x) > f(x)$. It is narrow but consistently above zero for all $x \\in (0,1)$.',
          strategy: 'We cannot rely on visual inspection alone — we need an algebraic argument. Show $g(x) \\geq f(x)$ by comparing what is inside each square root. Since $\\sqrt{\\cdot}$ is increasing, comparing the arguments is enough.',
          explanation: 'For $x \\in [0,1]$, compare $1+x$ (inside $g$) versus $1+x^2$ (inside $f$). We ask: is $1+x \\geq 1+x^2$? Subtracting $1$ from both sides: is $x \\geq x^2$? Factor: $x - x^2 = x(1-x)$. On $[0,1]$, both $x \\geq 0$ and $(1-x) \\geq 0$, so the product $x(1-x) \\geq 0$. Therefore $x \\geq x^2$, which means $1+x \\geq 1+x^2$, and since square root is an increasing function, $\\sqrt{1+x} \\geq \\sqrt{1+x^2}$. That is $g(x) \\geq f(x)$ on all of $[0,1]$, with equality only at the endpoints.',
          math: 'x \\in [0,1]: \\quad x(1-x) \\geq 0 \\implies x \\geq x^2 \\implies 1+x \\geq 1+x^2 \\implies g(x) \\geq f(x)',
          sandbox: {
            value: 'x = 0.5',
            rows: [
              { label: '$f(0.5)$', expr: '\\sqrt{1+0.25} = \\sqrt{1.25} \\approx 1.118' },
              { label: '$g(0.5)$', expr: '\\sqrt{1+0.5} = \\sqrt{1.5} \\approx 1.225' },
              { label: 'Difference $g - f$', expr: '1.225 - 1.118 \\approx 0.107 > 0\\;\\checkmark' },
            ],
            conclusion: 'At $x=0.5$, $g$ is about 0.107 above $f$. The gap is small — which is why the global graph view hides it.',
          },
        },
        {
          label: 'Apply the comparison property to the integrals',
          visualNote: 'The shaded area under $g$ (blue) is visibly — though barely — larger than the shaded area under $f$ (red) over $[0,1]$.',
          strategy: 'Once we know $g(x) \\geq f(x)$ pointwise on $[0,1]$, the comparison property of integrals transfers that inequality to the areas automatically. The integral of the larger function is the larger integral.',
          explanation: 'The comparison property states: if $h_1(x) \\leq h_2(x)$ for all $x \\in [a,b]$, then $\\int_a^b h_1(x)\\,dx \\leq \\int_a^b h_2(x)\\,dx$. This is intuitively clear — if every Riemann rectangle for $h_2$ is at least as tall as the corresponding one for $h_1$, the total area for $h_2$ cannot be less. We proved $f(x) \\leq g(x)$ on $[0,1]$, so we conclude directly:',
          math: '\\int_0^1 \\sqrt{1+x^2}\\,dx \\leq \\int_0^1 \\sqrt{1+x}\\,dx',
          conceptRef: 'Comparison property: $f \\leq g$ on $[a,b]$ $\\Rightarrow$ $\\int_a^b f\\,dx \\leq \\int_a^b g\\,dx$',
        },
        {
          label: 'Bound the gap without computing either integral',
          strategy: 'Neither integral has a nice closed form — computing them requires numerical methods or tables. But we can bound *how different* they are using the interval length and the maximum gap.',
          explanation: 'The difference $g(x) - f(x)$ is at most some value $M$ on $[0,1]$. Even without computing $M$ exactly, the comparison property tells us the integrals are ordered. If a problem only asks *which is larger* — not *by how much* — the pointwise comparison is all we need. This is the power of comparison: geometric reasoning beats symbol manipulation when the antiderivative is intractable.',
          math: '\\int_0^1 g\\,dx - \\int_0^1 f\\,dx = \\int_0^1 [g(x)-f(x)]\\,dx > 0',
          gotcha: 'Do not attempt to compute $\\int_0^1 \\sqrt{1+x^2}\\,dx$ by hand — it requires a trig substitution that produces $\\frac{1}{2}[x\\sqrt{1+x^2} + \\ln|x+\\sqrt{1+x^2}|]$, which is correct but far beyond what the comparison question requires.',
        },
      ],
      variations: [
        { question: 'Can you show $\\int_0^1 \\sqrt{1+x^2}\\,dx \\geq 1$ without computing the integral?', hint: 'On $[0,1]$, $\\sqrt{1+x^2} \\geq \\sqrt{1} = 1$. So the integral is at least $1 \\cdot (1-0) = 1$ by the comparison property.' },
        { question: 'Compare $\\int_0^1 x^2\\,dx$ and $\\int_0^1 x^3\\,dx$. Which is larger, and why?', hint: 'On $[0,1]$, $x^2 \\geq x^3$ (since $x \\leq 1$ means $x^2 \\cdot x \\leq x^2$). So $\\int x^2\\,dx \\geq \\int x^3\\,dx$. Verify: $\\frac{1}{3}$ vs $\\frac{1}{4}$. ✓' },
      ],
    },
  ],

  quiz: [
    {
      id: "def-int-q1",
      type: "input",
      text: "Use the property \\(\\int_a^a f(x)\\,dx = 0\\). Evaluate \\(\\int_3^3 (x^5 + \\sin x)\\,dx\\).",
      answer: "0",
      hints: [
        "Any integral with equal limits equals zero, regardless of the integrand.",
      ],
      reviewSection: "Math — Properties of the definite integral",
    },
    {
      id: "def-int-q2",
      type: "choice",
      text: "Which property states \\(\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx\\)?",
      options: [
        "Linearity of the integral",
        "Additivity over intervals",
        "Reversal of limits",
        "Comparison theorem",
      ],
      answer: "Reversal of limits",
      hints: ["Swapping the limits of integration changes the sign."],
      reviewSection: "Math — Properties: reversal of limits",
    },
    {
      id: "def-int-q3",
      type: "input",
      text: "Given \\(\\int_0^5 f(x)\\,dx = 10\\) and \\(\\int_0^5 g(x)\\,dx = 3\\), evaluate \\(\\int_0^5 [2f(x) - g(x)]\\,dx\\).",
      answer: "17",
      hints: ["Use linearity: \\(2\\int f - \\int g\\).", "= 2(10) − 3 = 17."],
      reviewSection: "Math — Linearity",
    },
    {
      id: "def-int-q4",
      type: "input",
      text: "Given \\(\\int_0^5 f(x)\\,dx = 10\\) and \\(\\int_0^3 f(x)\\,dx = 4\\), find \\(\\int_3^5 f(x)\\,dx\\).",
      answer: "6",
      hints: [
        "Additivity: \\(\\int_0^5 = \\int_0^3 + \\int_3^5\\).",
        "10 = 4 + \\(\\int_3^5\\), so \\(\\int_3^5 = 6\\).",
      ],
      reviewSection: "Math — Additivity over intervals",
    },
    {
      id: "def-int-q5",
      type: "choice",
      text: "If \\(f(x) \\leq g(x)\\) for all \\(x\\) in \\([a,b]\\), then which inequality holds?",
      options: [
        "\\(\\int_a^b f\\,dx \\geq \\int_a^b g\\,dx\\)",
        "\\(\\int_a^b f\\,dx \\leq \\int_a^b g\\,dx\\)",
        "\\(\\int_a^b f\\,dx = \\int_a^b g\\,dx\\)",
        "No conclusion can be drawn",
      ],
      answer: "\\(\\int_a^b f\\,dx \\leq \\int_a^b g\\,dx\\)",
      hints: [
        "The comparison (monotonicity) property: larger integrand gives larger integral.",
      ],
      reviewSection: "Math — Comparison theorem",
    },
    {
      id: "def-int-q6",
      type: "input",
      text: "Evaluate \\(\\int_0^4 3\\,dx\\) using the property \\(\\int_a^b c\\,dx = c(b-a)\\).",
      answer: "12",
      hints: ["c = 3, b − a = 4 − 0 = 4."],
      reviewSection: "Math — Integral of a constant",
    },
    {
      id: "def-int-q7",
      type: "input",
      text: "Using geometry, evaluate \\(\\int_0^3 (1 + x)\\,dx\\). The region under \\(y = 1+x\\) on \\([0,3]\\) is a trapezoid.",
      answer: "7.5",
      hints: ["Trapezoid area = ½(f(0)+f(3)) × base = ½(1+4)×3 = 7.5."],
      reviewSection: "Math — Geometric evaluation",
    },
    {
      id: "def-int-q8",
      type: "input",
      text: "Given \\(\\int_1^4 f(x)\\,dx = 7\\), evaluate \\(\\int_4^1 f(x)\\,dx\\).",
      answer: "-7",
      hints: ["Reversing limits negates the integral."],
      reviewSection: "Math — Reversal of limits",
    },
    {
      id: "def-int-q9",
      type: "input",
      text: "Evaluate \\(\\int_0^5 f(x)\\,dx\\) if you know \\(\\int_0^2 f(x)\\,dx = 3\\), \\(\\int_2^4 f(x)\\,dx = 5\\), and \\(\\int_4^5 f(x)\\,dx = -1\\).",
      answer: "7",
      hints: ["Use additivity: total = 3 + 5 + (−1) = 7."],
      reviewSection: "Math — Additivity over intervals",
    },
    {
      id: "def-int-q10",
      type: "choice",
      text: "Which of the following is the correct additivity property of definite integrals?",
      options: [
        "\\(\\int_a^b f + \\int_a^b g = \\int_a^b (f+g)\\)",
        "\\(\\int_a^b f = \\int_a^c f + \\int_b^c f\\)",
        "\\(\\int_a^b f = \\int_a^c f + \\int_c^b f\\) for any \\(c\\)",
        "\\(\\int_a^b f \\cdot g = \\int_a^b f \\cdot \\int_a^b g\\)",
      ],
      answer: "\\(\\int_a^b f = \\int_a^c f + \\int_c^b f\\) for any \\(c\\)",
      hints: ["The interval can be split at any interior point c."],
      reviewSection: "Math — Additivity over intervals",
    },
  ],

  discovery: {
    title:
      "How to Find Exact Area Under a Curve: From Approximation to the Limit",
    persona:
      "I'm a land surveyor in ancient times. I need to measure the area of an irregular field bounded by a curved fence on one side. I can measure rectangles easily, but the curve makes it impossible to use a simple formula. Can I approximate the area? And is there a way to get the exact value?",
    steps: [
      {
        phase: "need",
        title:
          "The problem: irregular boundaries can't be measured with one formula",
        content: `I have a field bounded by:
- Left: a straight edge at x = 0
- Right: a straight edge at x = 2
- Bottom: the x-axis
- Top: a curved fence that follows $y = x$

The shape is a curved triangle. I can measure trapezoids and rectangles easily, but this curved boundary defeats simple formulas.

**The question:** What is the exact area?`,
      },
      {
        phase: "need",
        title: "Approximation 1: Use two rectangles",
        content: `If I divide the field from x = 0 to x = 2 into two equal sections, each of width 1:

**Left rectangles (underestimate):**
- Interval [0, 1]: height = f(0) = 0, area = 0 × 1 = 0
- Interval [1, 2]: height = f(1) = 1, area = 1 × 1 = 1
- Total: 0 + 1 = 1

**Right rectangles (overestimate):**
- Interval [0, 1]: height = f(1) = 1, area = 1 × 1 = 1
- Interval [1, 2]: height = f(2) = 2, area = 2 × 1 = 2
- Total: 1 + 2 = 3

So the true area is **between 1 and 3**.

But that's a huge range! I need a better approximation.`,
      },
      {
        phase: "need",
        title: "Approximation 2: Use four rectangles for better accuracy",
        content: `Now I divide into four equal sections, each of width 0.5:

**Left rectangles:**
- [0, 0.5]: height = 0, area = 0
- [0.5, 1]: height = 0.5, area = 0.5 × 0.5 = 0.25
- [1, 1.5]: height = 1, area = 1 × 0.5 = 0.5
- [1.5, 2]: height = 1.5, area = 1.5 × 0.5 = 0.75
- Total: 0 + 0.25 + 0.5 + 0.75 = 1.5

**Right rectangles:**
- [0, 0.5]: height = 0.5, area = 0.25
- [0.5, 1]: height = 1, area = 0.5
- [1, 1.5]: height = 1.5, area = 0.75
- [1.5, 2]: height = 2, area = 1
- Total: 0.25 + 0.5 + 0.75 + 1 = 2.5

Now: **1.5 < area < 2.5**

Better, but still uncertain. The left estimate was 1.5, the right was 2.5. Average: 1.75.`,
      },
      {
        phase: "discovery",
        title: "Build a table: see the pattern as n increases",
        content: `Let me compute with more and more rectangles. Let n = number of rectangles, and let $L_n$ = left rectangle sum, $R_n$ = right rectangle sum.

| n | Width | $L_n$ | $R_n$ | Average |
|---|---|---|---|---|
| 1 | 2.0 | 0 | 4 | 2.0 |
| 2 | 1.0 | 1 | 3 | 2.0 |
| 4 | 0.5 | 1.5 | 2.5 | 2.0 |
| 8 | 0.25 | 1.75 | 2.25 | 2.0 |
| 16 | 0.125 | 1.875 | 2.125 | 2.0 |
| 100 | 0.02 | 1.98 | 2.02 | 2.0 |
| 1000 | 0.002 | 1.998 | 2.002 | 2.0 |

**The pattern is unmistakable:** As n increases, both $L_n$ and $R_n$ are converging to **2.0**.

Between the under- and over-estimates, the true area appears to be exactly **2**.

But I'm using rectangles—they have straight edges, not curves. The rectangles leave gaps or overhang. As n → ∞, these gaps shrink to nothing, and both approximations converge to the same value.`,
      },
      {
        phase: "discovery",
        title: "Discover what the limit actually is",
        content: `What is special about the number 2?

For $y = x$ on [0, 2], the region is actually a triangle with:
- Base = 2
- Height = f(2) = 2
- Area = ½ × base × height = ½ × 2 × 2 = **2**

So the limiting value of the rectangle sums equals the geometric area of the triangle!

This is not a coincidence. As I use more and more rectangles:
- Left rectangles approach from below
- Right rectangles approach from above
- Both converge to the same limit
- That limit **is** the true area

**The discovery:** The exact area under the curve equals the limit of rectangle sums:

$$\\text{Area} = \\lim_{n \\to \\infty} \\text{(sum of n rectangles)}$$

This is the **definite integral**.`,
      },
      {
        phase: "formalization",
        title: "Define the Riemann sum and the definite integral",
        content: `The formal setup: divide [a, b] into n equal subintervals of width $\\Delta x = \\frac{b-a}{n}$.

In each subinterval $[x_{i-1}, x_i]$, choose a point $x_i^*$ and form a rectangle of height $f(x_i^*)$.

The **Riemann sum** is:

$$R_n = \\sum_{i=1}^{n} f(x_i^*) \\Delta x$$

This is the total area of all n rectangles.

**The actual area** is the limit as rectangles become infinitely thin:

$$\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x$$

This limit is called the **definite integral** of f from a to b.

**Key insight:** The integral exists if this limit is **the same value regardless of which points $x_i^*$ you choose in each subinterval**. For continuous functions (and many others), this is guaranteed.`,
      },
    ],
    resolution: `**The definite integral emerges from the limit of approximations:**

$$\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x$$

**The pathway:**
1. Start with a concrete problem: find exact area
2. Approximate with rectangles (imperfect, but computable)
3. Use more rectangles to get better approximations
4. Observe convergence: the approximations stabilize
5. Recognize that they converge to a single limit
6. Define that limit to be the definite integral

**Why this matters:** The definite integral is not just "area" — it's the precise mathematical answer to "what value does this accumulation process converge to?" For motion, accumulation is displacement. For density, accumulation is total mass. For probability, accumulation is likelihood. The definite integral is the universal language of accumulation.`,
  },

  story: {
    title: "The Problem That Predates Calculus: From Archimedes to Riemann",
    subtitle:
      "How mathematicians solved the impossible problem of finding exact areas under curves, centuries before Newton and Leibniz invented the methods we use.",
    acts: [
      {
        label: "Act I",
        title: "The Impossible Question (Ancient Greece)",
        content: `It is 250 BC. You are a Greek mathematician in Syracuse, Sicily. Your name is Archimedes.

The problem obsesses you: **how do you find the exact area of a curved region?**

You can find the area of any polygon — triangle, rectangle, hexagon — using formulas. But curves defeat you. The circle is the worst: you can inscribe and circumscribe polygons, and their areas bound the circle's area, but you never reach it exactly.

No formula works for curves.

You spend years on this. You fill scroll after scroll with geometry. You develop a technique you call the **Method of Exhaustion**:

1. Inscribe a polygon inside the curve (under-approximation)
2. Circumscribe a polygon outside the curve (over-approximation)
3. Increase the number of sides until the two polygons collapse to the same area

When the inscribed and circumscribed shapes have exactly the same area, the curved region must have that same area too. The curved region is "exhausted" — there's no room left between the approximations.

This method is brilliant but laborious. Archimedes proves that the area of a circle is πr². But each proof takes dozens of pages of careful geometry. There is no general method — each problem requires new ingenuity.

**The fundamental question remains unanswered:** Is there a systematic way to handle all curves — not just circles?`,
      },
      {
        label: "Act II",
        title: "The Reawakening (1600s)",
        content: `1635: Bonaventura Cavalieri has an audacious idea. He imagines a region as composed of infinitely many parallel lines stacked atop each other — "indivisibles."

By comparing the indivisibles of two regions, he can show they have equal areas without computing either area directly. This is revolutionary thinking but logically vague. **What exactly is an indivisible?** A thin sliver? A line with thickness? His method works but feels suspicious to rigorous thinkers.

Still, the seed is planted: perhaps areas can be found by ... *thinking about infinity*. Summing infinitely many infinitesimal pieces.

1670: Isaac Newton reads Cavalieri. He is inspired.

Newton realizes that if you can find a function $F$ such that $F'(x) = f(x)$, then the area under $f$ is $F(b) - F(a)$.

This is magic. From the derivative, you can retrieve the area. The area problem and the rate-of-change problem are inverses of each other.

But Newton doesn't publish. He keeps his methods private, working in the plague years of Cambridge.

1686: Gottfried Leibniz publishes his calculus. He introduces the integral sign ∫ (an elongated S for "sum"), and states the Fundamental Theorem of Calculus.

The world finally has a systematic method for finding areas.

But there is a gap in the logic: **the definitions are vague. No one has rigorously defined what "infinitely many infinitesimal pieces" actually means.** The answer works, but the mathematical foundation is shaky.`,
      },
      {
        label: "Act III",
        title: "The Rigorization (1850s - 1890s)",
        content: `Two hundred years pass. Calculus is applied everywhere — physics, engineering, astronomy — and it works. But mathematicians are growing uncomfortable.

**Cauchy, Bolzano, Weierstrass, and Riemann are asking: can we make this rigorous without infinitesimals?**

Bernhard Riemann attacks the problem head-on. In 1854, he defines the integral precisely using finite mathematics:

1. Divide [a, b] into n subintervals of width $\\Delta x = \\frac{b-a}{n}$.
2. In each subinterval, form a rectangle of height $f(x_i^*)$ for any chosen point $x_i^*$.
3. Sum all rectangles: $\\sum f(x_i^*) \\Delta x$.
4. As $n \\to \\infty$, if this sum converges to a single value (regardless of which points $x_i^*$ you choose), that value is the definite integral.

No infinitesimals. No vague talk about "indivisibles." Just the rigorous limit of a finite process.

**The Riemann integral is born.** It makes precise what physicists and engineers have been using intuitively for two centuries.

For the first time in mathematical history, "area under a curve" has a completely rigorous definition.`,
      },
      {
        label: "Act IV",
        title: "From Intuition to Formalism",
        content: `What Riemann gave us is this: the definite integral is not a mystical object. It is simply **the limit of Riemann sums**.

For $y = x$ on [0, 2]:

$$\\int_0^2 x\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} x_i^* \\Delta x$$

where $\\Delta x = \\frac{2}{n}$ and $x_i^*$ is any point in the $i$-th subinterval.

The limit exists. The value is 2. This is the definite integral — no handwaving, no infinity, just limits and sums.

The power: because the limit is the same **regardless of which points** $x_i^*$ you choose in each interval, you have freedom. You can choose left endpoints, right endpoints, midpoints, or any other points. The limit always converges to the same value.

And through the Fundamental Theorem, you can compute this limit without doing the limit at all: find an antiderivative $F$ and compute $F(b) - F(a)$.

**The ancient dream is finally realized:** a systematic, rigorous method for finding exact areas.`,
      },
      {
        label: "Act V",
        title: "Why This Matters Today",
        content: `Riemann's definition looks simple now, but it was revolutionary. It transformed calculus from a powerful tool with hidden doubts into a rigorous mathematical framework.

Today, when physicists compute the displacement of a moving particle, they use:

$$\\text{displacement} = \\int_0^{10} v(t)\\,dt = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} v(t_i^*) \\Delta t$$

When engineers calculate the center of mass of an irregular object, they use integrals.

When statisticians compute probabilities, they integrate probability density functions.

Every time, beneath the surface, is Riemann's limit of sums. We don't usually compute it that way (antiderivatives are faster), but the conceptual foundation is Riemann's definition.

**The lesson:** Sometimes the shortest path is not the simplest. Archimedes exhausted geometry for two millennia. Newton and Leibniz invented powerful rules. But only when Riemann went back to basics — defining the integral as a limit of sums — did the true foundation emerge.

The deepest mathematics often comes from asking: "What do I really mean by this?" and answering with absolute precision.`,
      },
    ],
    resolution: `**The definite integral journeyed from intuition to rigor:**

- **Ancient times:** Archimedes uses the Method of Exhaustion — ingenious but case-by-case
- **1600s:** Cavalieri and Newton glimpse infinitesimals; Leibniz publishes calculus
- **1850s:** Riemann defines the integral rigorously using limits of sums
- **Today:** Every application of integration rests on Riemann's foundation

**The transforming insight:** The definite integral is not a magic tool or a theoretical abstraction. It is simply **the limit that Riemann sums converge to as rectangles become infinitely thin.**

This definition serves as the foundation for:
- Physics (displacement, work, flux)
- Probability (cumulative distribution functions)
- Engineering (center of mass, moment of inertia)
- Economics (consumer surplus, total revenue)
- Statistics (expected values, confidence intervals)

By understanding where this definition came from — from the solving of an ancient problem using modern rigor — you understand that mathematics is not handed down from the gods. It is built, refined, and perfected by humans asking better and better questions.`,
  },
};
