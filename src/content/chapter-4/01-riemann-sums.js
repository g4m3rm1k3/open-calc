// FILE: src/content/chapter-4/01-riemann-sums.js
export default {
  id: 'ch4-001',
  slug: 'riemann-sums',
  chapter: 4,
  order: 1,
  title: 'Riemann Sums',
  subtitle: 'Approximating area with rectangles — and taking the limit to get the exact integral',
  tags: ['Riemann sums', 'left sum', 'right sum', 'midpoint rule', 'trapezoidal rule', 'partition', 'limit of sums', 'definite integral definition', 'numerical integration'],

  hook: {
    question: 'We want the exact area under y = x² from x = 0 to x = 1. Geometry gives us rectangles and triangles, but no formula for curved regions. However, we CAN approximate the area with as many thin rectangles as we like — and if we understand how the approximation improves as rectangles get thinner, we can find the exact area by taking a limit. Compute L₄ and R₄ for this integral. The true answer is 1/3. How close do you get with just 4 rectangles?',
    realWorldContext: 'Riemann sums are not just a theoretical stepping stone — they are the practical workhorse of numerical integration. In scientific computing, integrals that cannot be computed symbolically are evaluated numerically: meteorological models integrate weather equations over grid cells (each cell is a Riemann rectangle in space); MRI scanners compute integrals over thousands of voxels; finite-element analysis in civil engineering computes structural loads as sums over small elements. The key insight in all of these is that any sufficiently smooth function is well approximated by a piecewise-constant or piecewise-linear function on a fine enough mesh.',
    previewVisualizationId: 'RiemannSum',
  },

  intuition: {
    prose: [
      'The idea is transparent: divide the interval [a, b] into n equal subintervals, each of width Δx = (b−a)/n. On each subinterval, approximate the function by a horizontal line — its value at some representative point in the subinterval. The area of the resulting thin rectangle is f(representative point) × Δx. Sum all the rectangles. This is a Riemann sum.',
      'There are three natural choices for the representative point in each subinterval. The left endpoint rule uses the left end of each subinterval: Lₙ = [f(x₀) + f(x₁) + ··· + f(xₙ₋₁)]·Δx. The right endpoint rule uses the right end: Rₙ = [f(x₁) + f(x₂) + ··· + f(xₙ)]·Δx. The midpoint rule uses the midpoint x̄ᵢ = (xᵢ₋₁+xᵢ)/2: Mₙ = [f(x̄₁) + f(x̄₂) + ··· + f(x̄ₙ)]·Δx. For an increasing function, the left sum underestimates (the rectangles all fall short of the curve) and the right sum overestimates (the rectangles all poke above the curve). The midpoint rule is typically the most accurate of the three for smooth functions.',
      'As n grows, all three methods converge to the same limit — provided f is integrable (which all continuous functions are). With n = 4 rectangles, L₄ and R₄ for ∫₀¹ x² dx are 0.21875 and 0.46875 respectively. The true answer is 1/3 ≈ 0.3333. With n = 100 rectangles, Rₙ ≈ 0.3383 — much closer. With n = 1000, Rₙ ≈ 0.3343. The error decreases proportionally to 1/n, so doubling n halves the error.',
      'The trapezoidal rule Tₙ = (Lₙ + Rₙ)/2 is the average of the left and right sums. Geometrically, it replaces rectangles with trapezoids — connecting f(xᵢ₋₁) and f(xᵢ) with a straight line across each subinterval. The trapezoid area on [xᵢ₋₁, xᵢ] is ½(f(xᵢ₋₁)+f(xᵢ))·Δx. For T₄ on ∫₀¹ x² dx: T₄ = (0.21875 + 0.46875)/2 = 0.34375. This is already much closer to 1/3 than either L₄ or R₄ alone, because the trapezoidal error is proportional to 1/n², not 1/n.',
      'For a concrete calculation of L₄ on ∫₀¹ x² dx: the four subintervals are [0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1]. Left endpoints: 0, 0.25, 0.5, 0.75. Function values: 0, 0.0625, 0.25, 0.5625. Sum = 0.875. Multiply by Δx = 0.25: L₄ = 0.21875. For R₄, right endpoints: 0.25, 0.5, 0.75, 1. Function values: 0.0625, 0.25, 0.5625, 1. Sum = 1.875. Multiply by 0.25: R₄ = 0.46875. Average: 0.34375. The true area 1/3 ≈ 0.3333 is sandwiched between L₄ and R₄, as expected for an increasing function.',
      'An important conceptual point: the definition of the definite integral does not require equal-width subintervals. The general Riemann sum allows arbitrary partitions a = x₀ < x₁ < ··· < xₙ = b and arbitrary representative points cᵢ ∈ [xᵢ₋₁, xᵢ]. The integral is defined as the limit of Riemann sums as the mesh size (width of the widest subinterval) approaches zero, provided this limit exists and is the same for all choices of partitions and representative points. For continuous functions — and even for bounded functions with only finitely many discontinuities — this limit always exists. This robustness is what makes the Riemann integral so useful in practice.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Summation Notation Review',
        body: 'Riemann sums use sigma notation: \\(\\sum_{i=1}^n a_i = a_1 + a_2 + \\cdots + a_n\\). Key formulas: \\(\\sum_{i=1}^n i = n(n+1)/2\\), \\(\\sum_{i=1}^n i^2 = n(n+1)(2n+1)/6\\), \\(\\sum_{i=1}^n c = nc\\). These are used when computing Riemann sums in closed form to derive exact limits.',
      },
      {
        type: 'geometric',
        title: 'Overestimates and Underestimates',
        body: 'For an INCREASING function on [a, b]: the LEFT sum Lₙ underestimates (each rectangle\'s height is the function value at the left — too short) and the RIGHT sum Rₙ overestimates (each height is at the right — too tall). For a DECREASING function, the inequalities reverse. For a function that both increases and decreases, neither sum is guaranteed to over- or underestimate globally. The true integral is always between Lₙ and Rₙ for monotone functions.',
      },
      {
        type: 'real-world',
        title: 'Discrete Data: Numerical Integration in Practice',
        body: 'Scientists rarely have a closed-form formula for the function they are integrating. Instead, they measure values at discrete time points: velocity from a sensor every 0.1 seconds, temperature every hour. The trapezoidal rule directly converts such a data table into an approximate integral: sum up ½(f(tᵢ₋₁)+f(tᵢ))×Δt for each adjacent pair. This is how accelerometers in phones compute distance traveled, and how power meters compute energy consumed.',
      },
      {
        type: 'misconception',
        title: 'A Riemann Sum Is an Approximation, Not the Integral',
        body: "R₁₀ = 0.385 for ∫₀¹ x² dx does NOT mean the integral is 0.385. The Riemann sum is an APPROXIMATION that converges to the integral as n → ∞. The integral is the LIMIT: exactly 1/3. Students sometimes confuse a computed Riemann sum (a specific number for finite n) with the definite integral (the infinite limit). They are different objects.",
      },
      {
        type: 'history',
        title: "Bernhard Riemann's 1854 Thesis",
        body: "Georg Friedrich Bernhard Riemann (1826–1866) formalized the idea of integration in his habilitation thesis of 1854 — the same document where he introduced Riemann surfaces and the Riemann Hypothesis. Before Riemann, integration was an informal procedure. He asked: for which functions does the 'sum of rectangles' limit exist? His answer (Riemann integrability) remained the standard for 50 years until Lebesgue generalized it in 1902.",
      },
    ],
    visualizations: [
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Definite Integrals Defined w. Riemann Limit of Sums Example Calculus 1 AB",
        url: "https://www.youtube.com/embed/TmYELyzIMxg"
      }
    },
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Riemann Sum Defined w/ 2 Limit of Sums Examples Calculus 1",
        url: "https://www.youtube.com/embed/F6XC5_qbXls"
      }
    },
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Estimating Area with Rectangles & Riemann Limit of Sums Definition of Area Calculus 1 AB",
        url: "https://www.youtube.com/embed/7FTtayaQKqY"
      }
    },
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Definition of Area Riemann Sum Limit of Sums Part 2 of 2 Calculus 1",
        url: "https://www.youtube.com/embed/DchlORZxHSU"
      }
    },
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Estimating Area with Riemann Sums Finite Rectangles Calculus 1 AB",
        url: "https://www.youtube.com/embed/KHECo7XsrOk"
      }
    },
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Riemann Sum and Definite Integral Introduction",
        url: "https://www.youtube.com/embed/9elpcdrdYtI"
      }
    },
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Summation Notation (Sigma)",
        url: "https://www.youtube.com/embed/WVfiBnzM3vQ"
      }
    },
      {
        id: 'VideoEmbed',
        title: "The Definite Integral Part I: Approximating Areas with rectangles",
        props: { url: "https://www.youtube.com/embed/kS4DSZqH9Fk" }
      },
      {
        id: 'RiemannSum',
        title: 'Left, Right, and Midpoint Riemann Sums',
        caption: 'Drag the slider to increase n, the number of rectangles. Observe how the left sum (red, underestimating), right sum (blue, overestimating), and midpoint sum (green, most accurate) all converge to the true area as n → ∞. Toggle between sum types to compare their accuracy.',
      },
    ],
  },

  math: {
    prose: [
      'Let f be a function defined on [a, b]. A partition of [a, b] is a finite sequence a = x₀ < x₁ < x₂ < ··· < xₙ = b. For a uniform partition of n equal subintervals, Δx = (b−a)/n and xᵢ = a + i·Δx for i = 0, 1, …, n. The left Riemann sum, right Riemann sum, and midpoint Riemann sum are respectively: Lₙ = Σᵢ₌₀ⁿ⁻¹ f(xᵢ)·Δx, Rₙ = Σᵢ₌₁ⁿ f(xᵢ)·Δx, Mₙ = Σᵢ₌₁ⁿ f(x̄ᵢ)·Δx where x̄ᵢ = (xᵢ₋₁+xᵢ)/2 is the midpoint.',
      'The definite integral is defined as the common limit of all Riemann sums (when the limit exists): ∫ₐᵇ f(x) dx = lim_{n→∞} Rₙ = lim_{n→∞} Lₙ = lim_{n→∞} Mₙ. More precisely, using general (non-uniform) partitions: ∫ₐᵇ f(x) dx = lim_{‖P‖→0} Σ f(cᵢ)(xᵢ−xᵢ₋₁), where ‖P‖ = max(xᵢ−xᵢ₋₁) is the mesh size of the partition and cᵢ ∈ [xᵢ₋₁, xᵢ] is any representative point. A function f is called Riemann integrable if this limit exists and is independent of the choice of partitions and representative points.',
      'For ∫₀¹ x² dx, we can compute Rₙ exactly using the sum formula Σᵢ₌₁ⁿ i² = n(n+1)(2n+1)/6. With xᵢ = i/n and Δx = 1/n: Rₙ = Σᵢ₌₁ⁿ (i/n)²·(1/n) = (1/n³)Σᵢ₌₁ⁿ i² = (1/n³)·n(n+1)(2n+1)/6 = (n+1)(2n+1)/(6n²). As n → ∞: (n+1)(2n+1)/(6n²) = (2n²+3n+1)/(6n²) → 2/6 = 1/3. So ∫₀¹ x² dx = 1/3 exactly.',
      'The error analysis for the trapezoidal rule is instructive. For a function f with bounded second derivative |f\'\'| ≤ M on [a, b], the trapezoidal rule error satisfies |Tₙ − ∫ₐᵇ f| ≤ M(b−a)³/(12n²). The error decreases as 1/n², which is faster than the 1/n rate for the left and right sums. For ∫₀¹ x² dx, f\'\'= 2, so error ≤ 2×1/(12n²) = 1/(6n²). With n = 10: error ≤ 1/600 ≈ 0.00167. Actual error: T₁₀ = 0.335 − 1/3 ≈ 0.00167. The bound is tight.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Riemann Sum (Formal)',
        body: 'For a uniform partition of \\([a,b]\\) into \\(n\\) subintervals with \\(\\Delta x = (b-a)/n\\), the \\textbf{general Riemann sum} with sample points \\(c_i \\in [x_{i-1}, x_i]\\) is\n\\[S_n = \\sum_{i=1}^n f(c_i)\\,\\Delta x.\\]\nLeft: \\(c_i = x_{i-1}\\). Right: \\(c_i = x_i\\). Midpoint: \\(c_i = (x_{i-1}+x_i)/2\\).',
      },
      {
        type: 'definition',
        title: 'The Definite Integral as a Limit',
        body: '\\[\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(c_i)\\,\\Delta x\\]\nprovided this limit exists and is the same for all choices of \\(c_i \\in [x_{i-1}, x_i]\\). All continuous functions are Riemann integrable.',
      },
      {
        type: 'theorem',
        title: 'Trapezoidal Rule',
        body: '\\[T_n = \\frac{L_n + R_n}{2} = \\frac{\\Delta x}{2}\\bigl[f(x_0) + 2f(x_1) + 2f(x_2) + \\cdots + 2f(x_{n-1}) + f(x_n)\\bigr].\\]\nFor \\(f\\) with \\(|f\'\'| \\leq M\\): error \\(\\leq M(b-a)^3/(12n^2)\\).',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "The Definite Integral Part II: Using Summation Notation to Define the Definite Integral",
        props: { url: "https://www.youtube.com/embed/_q7Rx_Xa0ig" }
      },],
  },

  rigor: {
    prose: [
      'The formal definition of Riemann integrability requires that the limit of Riemann sums be independent of the choice of partition and sample points. This is a demanding condition. It is equivalent to requiring that, for every ε > 0, there exists δ > 0 such that for any partition P with mesh ‖P‖ < δ and any choice of sample points, |Sₙ − I| < ε (where I is the proposed integral). Functions satisfying this are called Darboux integrable, and the Darboux integral (defined via upper and lower sums) is equivalent to the Riemann integral for bounded functions.',
      'The class of Riemann integrable functions on [a, b] is larger than one might expect. Every continuous function is integrable (this follows from uniform continuity on closed bounded intervals). Every bounded monotone function is integrable, even if it has countably many discontinuities. Every bounded function with finitely many discontinuities is integrable. Remarkably, a bounded function is Riemann integrable if and only if its set of discontinuities has Lebesgue measure zero (Lebesgue\'s criterion). This means that even highly irregular functions can be integrated, as long as they are "discontinuous only on a negligible set."',
      'Not all functions are Riemann integrable. The classic example is the Dirichlet function: D(x) = 1 if x is rational, D(x) = 0 if x is irrational. This function is discontinuous everywhere on [0,1]. For any partition, every subinterval contains both rationals and irrationals, so the upper Darboux sum is always 1 and the lower Darboux sum is always 0. The upper and lower sums never agree, so D is not Riemann integrable. The Lebesgue integral, a more powerful theory, can integrate D: ∫₀¹ D dx = 0 (because the rationals form a set of measure zero, and D = 0 almost everywhere).',
      'The connection between Riemann sums and the definite integral is made rigorous by the following theorem: if f is continuous on [a, b], then for any sequence of partitions Pₙ with ‖Pₙ‖ → 0 and any choice of sample points cᵢ ∈ [xᵢ₋₁, xᵢ], the Riemann sums converge to ∫ₐᵇ f(x) dx. The proof uses the uniform continuity of f on [a, b] (from the Heine-Cantor theorem): given ε > 0, choose δ such that |f(u) − f(v)| < ε/(b−a) whenever |u−v| < δ. Then for any two Riemann sums with the same partition and mesh < δ, their values differ by less than ε. From this, one shows the limit exists and equals the Darboux integral.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Continuous Functions Are Riemann Integrable',
        body: 'If f is continuous on [a, b], then f is Riemann integrable on [a, b]. The proof uses the uniform continuity of f (guaranteed by the Heine-Cantor theorem for continuous functions on compact sets) to show that upper and lower Darboux sums converge to the same limit.',
      },
      {
        type: 'warning',
        title: 'Integrability Does Not Require Continuity',
        body: 'Riemann sums converge for many discontinuous functions. A bounded function with finitely many jump discontinuities is always Riemann integrable. However, unbounded functions (like 1/x near x = 0) are NOT Riemann integrable on intervals containing 0 — they require "improper integrals," which are limits of integrals on subintervals that avoid the singularity.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch4-001-ex1',
      title: 'L₄, R₄, M₄ for ∫₀¹ x² dx',
      problem: '\\text{Compute } L_4, R_4, M_4 \\text{ for } \\int_0^1 x^2\\,dx. \\text{ Compare to the exact value } 1/3.',
      visualizationId: 'RiemannSum',
      steps: [
        { expression: '\\Delta x = \\frac{1-0}{4} = 0.25, \\quad x_i = 0, 0.25, 0.5, 0.75, 1', annotation: 'Partition [0,1] into 4 equal subintervals. Width = 0.25. Endpoints at 0, 0.25, 0.5, 0.75, 1.' },
        { expression: 'L_4 = (f(0) + f(0.25) + f(0.5) + f(0.75)) \\cdot 0.25', annotation: 'Left sum uses the LEFT endpoint of each subinterval: x₀=0, x₁=0.25, x₂=0.5, x₃=0.75.' },
        { expression: '= (0 + 0.0625 + 0.25 + 0.5625) \\cdot 0.25 = 0.875 \\cdot 0.25 = 0.21875', annotation: 'f(0)=0, f(0.25)=0.0625, f(0.5)=0.25, f(0.75)=0.5625. Sum = 0.875. Multiply by Δx=0.25.' },
        { expression: 'R_4 = (f(0.25) + f(0.5) + f(0.75) + f(1)) \\cdot 0.25', annotation: 'Right sum uses the RIGHT endpoint of each subinterval: 0.25, 0.5, 0.75, 1.' },
        { expression: '= (0.0625 + 0.25 + 0.5625 + 1) \\cdot 0.25 = 1.875 \\cdot 0.25 = 0.46875', annotation: 'f(1)=1. Sum = 1.875. Multiply by 0.25. Since x² is increasing, R₄ overestimates.' },
        { expression: 'M_4 = (f(0.125) + f(0.375) + f(0.625) + f(0.875)) \\cdot 0.25', annotation: 'Midpoints: 0.125, 0.375, 0.625, 0.875.' },
        { expression: '= (0.015625 + 0.140625 + 0.390625 + 0.765625) \\cdot 0.25 = 1.3125 \\cdot 0.25 = 0.328125', annotation: 'Midpoint sum is between L₄ and R₄ and closer to the true value.' },
        { expression: 'L_4 = 0.21875 < M_4 = 0.328125 < \\tfrac{1}{3} \\approx 0.3333 < R_4 = 0.46875', annotation: 'All three bracket the true value 1/3. The midpoint rule is the most accurate here.' },
      ],
      conclusion: 'With just 4 rectangles: L₄=0.219 (underestimates by 31%), R₄=0.469 (overestimates by 41%), M₄=0.328 (error <2%). The midpoint rule is far more efficient than left/right for smooth functions.',
    },
    {
      id: 'ch4-001-ex2',
      title: 'L₃, R₃ for ∫₁³ (1/x) dx',
      problem: '\\text{Compute } L_3 \\text{ and } R_3 \\text{ for } \\int_1^3 \\frac{1}{x}\\,dx. \\text{ Compare to the exact value } \\ln 3 \\approx 1.099.',
      steps: [
        { expression: '\\Delta x = \\frac{3-1}{3} = \\frac{2}{3}, \\quad x_i = 1,\\, \\frac{5}{3},\\, \\frac{7}{3},\\, 3', annotation: 'Partition [1,3] into 3 equal subintervals. Width = 2/3. Endpoints at 1, 5/3, 7/3, 3.' },
        { expression: 'L_3 = \\left(f(1) + f\\!\\left(\\tfrac{5}{3}\\right) + f\\!\\left(\\tfrac{7}{3}\\right)\\right) \\cdot \\frac{2}{3} = \\left(1 + \\frac{3}{5} + \\frac{3}{7}\\right) \\cdot \\frac{2}{3}', annotation: 'f(x) = 1/x. f(1)=1, f(5/3)=3/5=0.6, f(7/3)=3/7≈0.4286.' },
        { expression: '= \\left(\\frac{105 + 63 + 45}{105}\\right) \\cdot \\frac{2}{3} = \\frac{213}{105} \\cdot \\frac{2}{3} = \\frac{426}{315} = \\frac{142}{105} \\approx 1.352', annotation: 'Common denominator 105: 1=105/105, 3/5=63/105, 3/7=45/105. Sum = 213/105. Multiply by 2/3.' },
        { expression: 'R_3 = \\left(f\\!\\left(\\tfrac{5}{3}\\right) + f\\!\\left(\\tfrac{7}{3}\\right) + f(3)\\right) \\cdot \\frac{2}{3} = \\left(\\frac{3}{5} + \\frac{3}{7} + \\frac{1}{3}\\right) \\cdot \\frac{2}{3}', annotation: 'Right endpoints: 5/3, 7/3, 3.' },
        { expression: '= \\left(\\frac{63 + 45 + 35}{105}\\right) \\cdot \\frac{2}{3} = \\frac{143}{105} \\cdot \\frac{2}{3} = \\frac{286}{315} \\approx 0.908', annotation: 'f(3)=1/3=35/105. Sum=143/105. Multiply by 2/3.' },
        { expression: 'L_3 \\approx 1.352 > \\ln 3 \\approx 1.099 > R_3 \\approx 0.908', annotation: '1/x is decreasing on [1,3], so L₃ overestimates and R₃ underestimates. The true value is sandwiched.' },
      ],
      conclusion: 'L₃≈1.352 (overestimates by 23%) and R₃≈0.908 (underestimates by 17%). The average T₃=(1.352+0.908)/2=1.130 is already much closer. With 30 rectangles both sums would be within 2.5%.',
    },
    {
      id: 'ch4-001-ex3',
      title: 'Trapezoidal Rule T₄ for ∫₀¹ x² dx',
      problem: '\\text{Compute the trapezoidal approximation } T_4 \\text{ for } \\int_0^1 x^2\\,dx \\text{ and compare its accuracy to } L_4 \\text{ and } R_4.',
      steps: [
        { expression: 'T_4 = \\frac{L_4 + R_4}{2} = \\frac{0.21875 + 0.46875}{2} = \\frac{0.6875}{2} = 0.34375', annotation: 'The trapezoidal rule is exactly the average of the left and right sums (using the same partition).' },
        { expression: '\\text{Error of } L_4: |0.21875 - 1/3| \\approx 0.115 \\quad \\text{(about } 34\\% \\text{ off)}', annotation: 'The left sum is far from the true value 1/3 ≈ 0.3333.' },
        { expression: '\\text{Error of } R_4: |0.46875 - 1/3| \\approx 0.135 \\quad \\text{(about } 41\\% \\text{ off)}', annotation: 'The right sum is even farther.' },
        { expression: '\\text{Error of } T_4: |0.34375 - 1/3| \\approx 0.010 \\quad \\text{(about } 3\\% \\text{ off)}', annotation: 'The trapezoidal rule is 10–13 times more accurate than the one-sided sums, with the same number of function evaluations.' },
        { expression: '\\text{Trapezoidal formula: } T_4 = \\frac{\\Delta x}{2}[f(x_0) + 2f(x_1) + 2f(x_2) + 2f(x_3) + f(x_4)]', annotation: 'Written out explicitly with endpoints doubled (except the first and last): T₄ = (0.25/2)[0 + 2(0.0625) + 2(0.25) + 2(0.5625) + 1] = (0.125)[2.75] = 0.34375. Consistent.' },
      ],
      conclusion: 'T₄=0.34375 has error ≈0.010 vs. L₄ error ≈0.115. The trapezoidal rule achieves O(1/n²) accuracy, making it roughly n times more efficient than left/right sums for the same n.',
    },
    {
      id: 'ch4-001-ex4',
      title: 'Riemann Sum from a Table (Discrete Data)',
      problem: '\\text{A car\'s velocity (m/s) is recorded every second: } t = 0,1,2,3,4 \\Rightarrow v = 0, 5, 9, 11, 12. \\text{ Use the trapezoidal rule to estimate } \\int_0^4 v\\,dt.',
      steps: [
        { expression: '\\Delta t = 1 \\text{ s}, \\quad n = 4 \\text{ intervals}', annotation: 'The data points are equally spaced at Δt = 1 second. No formula — we apply the trapezoidal rule directly.' },
        { expression: 'T_4 = \\frac{\\Delta t}{2}[v(0) + 2v(1) + 2v(2) + 2v(3) + v(4)]', annotation: 'Trapezoidal rule: endpoints get weight 1, interior points get weight 2.' },
        { expression: '= \\frac{1}{2}[0 + 2(5) + 2(9) + 2(11) + 12]', annotation: 'Substitute: v(0)=0, v(1)=5, v(2)=9, v(3)=11, v(4)=12.' },
        { expression: '= \\frac{1}{2}[0 + 10 + 18 + 22 + 12] = \\frac{1}{2}(62) = 31 \\text{ m}', annotation: 'Sum = 62. Multiply by ½. The car traveled approximately 31 metres.' },
      ],
      conclusion: 'The car traveled approximately 31 metres in 4 seconds. When only discrete data is available, the trapezoidal rule is the most natural approach: it assumes the velocity varies linearly between measurements, which is reasonable if measurements are frequent.',
    },
    {
      id: 'ch4-001-ex5',
      title: 'Exact Limit: ∫₀¹ x² dx = 1/3 from Rₙ',
      problem: '\\text{Using } R_n \\text{ and the formula } \\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}, \\text{ prove that } \\int_0^1 x^2\\,dx = \\frac{1}{3}.',
      steps: [
        { expression: '\\Delta x = \\frac{1}{n}, \\quad x_i = \\frac{i}{n}', annotation: 'Uniform partition of [0,1] into n subintervals. Right endpoint of i-th interval is i/n.' },
        { expression: 'R_n = \\sum_{i=1}^n f\\!\\left(\\frac{i}{n}\\right) \\cdot \\frac{1}{n} = \\sum_{i=1}^n \\left(\\frac{i}{n}\\right)^2 \\cdot \\frac{1}{n} = \\frac{1}{n^3} \\sum_{i=1}^n i^2', annotation: 'f(x)=x², so f(i/n)=(i/n)². Factor out 1/n³.' },
        { expression: '= \\frac{1}{n^3} \\cdot \\frac{n(n+1)(2n+1)}{6} = \\frac{(n+1)(2n+1)}{6n^2}', annotation: 'Apply the sum formula. Simplify: n/n³ = 1/n².' },
        { expression: '= \\frac{2n^2 + 3n + 1}{6n^2} = \\frac{1}{3} + \\frac{1}{2n} + \\frac{1}{6n^2}', annotation: 'Expand numerator and split into fractions over 6n².' },
        { expression: '\\lim_{n \\to \\infty} R_n = \\lim_{n \\to \\infty}\\!\\left(\\frac{1}{3} + \\frac{1}{2n} + \\frac{1}{6n^2}\\right) = \\frac{1}{3}', annotation: 'As n → ∞, the terms 1/(2n) and 1/(6n²) both → 0. The limit is exactly 1/3.' },
      ],
      conclusion: '∫₀¹ x² dx = 1/3, proved rigorously from the definition as a limit of Riemann sums. The error of Rₙ is (1/2n)+(1/6n²) ≈ 1/(2n), confirming the O(1/n) error rate for the right-endpoint rule.',
    },
    {
      id: 'ch4-001-ex6',
      title: 'Error Analysis: How Many Rectangles for 1% Accuracy?',
      problem: '\\text{For } f(x) = x^2 \\text{ on } [0,1], \\text{ the error of } R_n \\text{ is } \\approx 1/(2n). \\text{ Find n so that } |R_n - 1/3| < 0.001.',
      steps: [
        { expression: '|R_n - 1/3| = \\frac{1}{2n} + \\frac{1}{6n^2} < \\frac{1}{n}', annotation: 'From the previous example: error ≈ 1/(2n) for large n. We use the cruder bound 1/n to simplify.' },
        { expression: '\\frac{1}{2n} < 0.001 \\Rightarrow n > \\frac{1}{0.002} = 500', annotation: 'Using the leading term 1/(2n): need n > 500 for the error to fall below 0.001.' },
        { expression: 'R_{500} = \\frac{(501)(1001)}{6 \\times 500^2} = \\frac{501501}{1500000} \\approx 0.33433', annotation: 'Compute R₅₀₀ using the exact formula. 501×1001 = 501501.' },
        { expression: '|R_{500} - 1/3| = |0.33433 - 0.33333| = 0.00100', annotation: 'Error is exactly 0.001 at n=500. Confirmed.' },
        { expression: '\\text{Trapezoidal: } |T_n - 1/3| \\leq \\frac{M(b-a)^3}{12n^2} = \\frac{2}{12n^2} = \\frac{1}{6n^2}', annotation: 'With the trapezoidal rule, error ≤ 1/(6n²). For error < 0.001: n > √(1000/6) ≈ 12.9. So n = 13 suffices!' },
      ],
      conclusion: 'Left/right sums need n = 500 for 0.1% accuracy. The trapezoidal rule achieves the same accuracy with just n = 13 — a 38× improvement. Higher-order methods (Simpson\'s rule, Gaussian quadrature) push this even further, enabling high accuracy with very few function evaluations.',
    },
  ],

  challenges: [
    {
      id: 'ch4-001-ch1',
      difficulty: 'easy',
      problem: 'Compute L₄ and R₄ for ∫₀² (x² + 1) dx. Identify which sum overestimates and which underestimates, and why.',
      hint: 'f(x) = x²+1 is increasing on [0,2]. Δx = 0.5. Left endpoints: 0, 0.5, 1, 1.5. Right endpoints: 0.5, 1, 1.5, 2.',
      walkthrough: [
        { expression: '\\Delta x = 0.5, \\quad f(x) = x^2 + 1', annotation: 'Uniform partition of [0,2] into 4 subintervals.' },
        { expression: 'L_4 = [f(0)+f(0.5)+f(1)+f(1.5)] \\cdot 0.5 = [1+1.25+2+3.25] \\cdot 0.5 = 7.5 \\cdot 0.5 = 3.75', annotation: 'f(0)=1, f(0.5)=1.25, f(1)=2, f(1.5)=3.25. Sum=7.5.' },
        { expression: 'R_4 = [f(0.5)+f(1)+f(1.5)+f(2)] \\cdot 0.5 = [1.25+2+3.25+5] \\cdot 0.5 = 11.5 \\cdot 0.5 = 5.75', annotation: 'f(2)=5. Sum=11.5.' },
        { expression: '\\text{True value: } \\int_0^2(x^2+1)\\,dx = \\left[\\tfrac{x^3}{3}+x\\right]_0^2 = \\tfrac{8}{3}+2 = \\tfrac{14}{3} \\approx 4.667', annotation: 'Exact value for comparison.' },
        { expression: 'L_4 = 3.75 < 14/3 \\approx 4.667 < R_4 = 5.75', annotation: 'f is increasing, so L₄ underestimates and R₄ overestimates, as expected.' },
      ],
      answer: 'L_4 = 3.75 \\text{ (underestimate)},\\quad R_4 = 5.75 \\text{ (overestimate)}',
    },
    {
      id: 'ch4-001-ch2',
      difficulty: 'medium',
      problem: 'Using sigma notation, derive a closed-form expression for Rₙ for ∫₀² x³ dx, and compute the exact limit to verify that ∫₀² x³ dx = 4. Use the sum formula Σᵢ₌₁ⁿ i³ = [n(n+1)/2]².',
      hint: 'With Δx = 2/n and xᵢ = 2i/n, Rₙ = Σ(2i/n)³·(2/n). Factor constants outside the sum. Apply the sum formula. Then take n → ∞.',
      walkthrough: [
        { expression: '\\Delta x = \\frac{2}{n}, \\quad x_i = \\frac{2i}{n}', annotation: 'Partition [0,2] uniformly.' },
        { expression: 'R_n = \\sum_{i=1}^n \\left(\\frac{2i}{n}\\right)^3 \\cdot \\frac{2}{n} = \\frac{16}{n^4} \\sum_{i=1}^n i^3', annotation: 'Factor: (2i/n)³·(2/n) = 8i³/n³·2/n = 16i³/n⁴.' },
        { expression: '= \\frac{16}{n^4} \\cdot \\left[\\frac{n(n+1)}{2}\\right]^2 = \\frac{16}{n^4} \\cdot \\frac{n^2(n+1)^2}{4} = \\frac{4(n+1)^2}{n^2}', annotation: 'Apply the sum formula.' },
        { expression: '\\lim_{n\\to\\infty} \\frac{4(n+1)^2}{n^2} = \\lim_{n\\to\\infty} 4\\left(1 + \\frac{1}{n}\\right)^2 = 4 \\cdot 1 = 4', annotation: 'As n→∞, (1+1/n)² → 1.' },
      ],
      answer: '\\displaystyle\\int_0^2 x^3\\,dx = 4',
    },
    {
      id: 'ch4-001-ch3',
      difficulty: 'hard',
      problem: 'Prove the following: for a function f that is increasing and continuous on [a, b], the error |Rₙ − ∫ₐᵇ f| satisfies |Rₙ − ∫ₐᵇ f| ≤ [f(b) − f(a)](b−a)/n. Interpret this formula: the error depends on the "total rise" of f and the interval width, but decreases like 1/n.',
      hint: 'On each subinterval [xᵢ₋₁, xᵢ], the right rectangle overestimates by the area of a thin "sliver" at the top: the sliver has width Δx and height at most f(xᵢ)−f(xᵢ₋₁). Sum all slivers.',
      walkthrough: [
        { expression: '\\text{On } [x_{i-1}, x_i]: \\; \\int_{x_{i-1}}^{x_i} f\\,dx \\leq f(x_i)\\,\\Delta x \\leq f(x_i)\\,\\Delta x', annotation: 'Since f is increasing, f(x) ≤ f(xᵢ) for all x in [xᵢ₋₁, xᵢ]. The right rectangle area is an overestimate.' },
        { expression: '0 \\leq f(x_i)\\,\\Delta x - \\int_{x_{i-1}}^{x_i} f\\,dx \\leq (f(x_i) - f(x_{i-1}))\\,\\Delta x', annotation: 'Upper bound on error per subinterval: max minus min of f times width. The "sliver" above the curve has area ≤ (f(xᵢ)−f(xᵢ₋₁))Δx.' },
        { expression: '|R_n - \\int_a^b f| \\leq \\sum_{i=1}^n (f(x_i)-f(x_{i-1}))\\,\\Delta x = \\Delta x \\cdot \\sum_{i=1}^n (f(x_i)-f(x_{i-1}))', annotation: 'Sum all sub-errors. The total error is bounded by Δx times the telescoping sum.' },
        { expression: '\\sum_{i=1}^n (f(x_i) - f(x_{i-1})) = f(x_n) - f(x_0) = f(b) - f(a)', annotation: 'Telescoping sum: all intermediate terms cancel. Total rise = f(b)−f(a).' },
        { expression: '|R_n - \\int_a^b f| \\leq (f(b)-f(a)) \\cdot \\Delta x = \\frac{(f(b)-f(a))(b-a)}{n}', annotation: 'Substitute Δx = (b−a)/n. This is the error bound.' },
      ],
      answer: '|R_n - \\int_a^b f| \\leq \\dfrac{(f(b)-f(a))(b-a)}{n}. \\text{ Error } \\to 0 \\text{ as } n \\to \\infty.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'area-accumulation', label: 'Area and Accumulation', context: 'Lesson 0 introduced integrals informally as area. This lesson provides the precise definition as a limit of Riemann sums.' },
    { lessonSlug: 'definite-integral', label: 'The Definite Integral', context: 'Lesson 2 develops the properties of the definite integral and computes it by geometry rather than Riemann sums.' },
    { lessonSlug: 'fundamental-theorem', label: 'Fundamental Theorem of Calculus', context: 'The FTC replaces Riemann sum limits with antiderivative evaluation — making exact computation of most integrals far more practical.' },
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
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
