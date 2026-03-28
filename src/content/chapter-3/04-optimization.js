// FILE: src/content/chapter-3/04-optimization.js
export default {
  id: "ch3-004",
  slug: "optimization",
  chapter: 3,
  order: 4,
  title: "Optimization",
  subtitle:
    "Finding the best — maximum area, minimum cost, optimal angle — using critical points and the Extreme Value Theorem",
  tags: [
    "optimization",
    "extreme value theorem",
    "Fermat's theorem",
    "closed interval method",
    "objective function",
    "constraint",
    "global extrema",
    "applications",
  ],

  hook: {
    question:
      "You have 100 meters of fence. You want to enclose the largest possible rectangular area. How should you cut the fence? Intuition suggests a square — but can you PROVE the square is optimal? And what if you also have a river on one side, so you only need fence on three sides? Does the answer change?",
    realWorldContext:
      "Optimization is one of the core reasons calculus was invented. Newton and Leibniz developed the tools of calculus partly to solve Fermat's optical problem (light takes the path of minimum time) and planetary orbit problems. Today, optimization appears everywhere: machine learning (gradient descent minimizes a loss function by following the negative derivative), economics (firms maximize profit or minimize cost as a function of production level), engineering (minimum-material structural shapes, maximum-range projectile angles), operations research (supply chain optimization), and physics (least-action principles underlie all of classical and quantum mechanics). Every time you ask 'what is the best...', you are solving an optimization problem, and calculus is the universal tool.",
    previewVisualizationId: "OptimizationViz",
  },

  intuition: {
    prose: [
      "All optimization problems share the same mathematical skeleton: identify the quantity you want to maximize or minimize (the objective function), identify the constraint that links your variables, use the constraint to reduce the objective to a single-variable function, then find the critical points of that reduced function and check which gives the global optimum. The geometry varies enormously — from rectangles to cylinders to light rays — but the procedure is always the same. Once you recognize this structure, optimization problems become systematic rather than mysterious.",
      "The Extreme Value Theorem (EVT) is the guarantee that global extrema exist on closed intervals. If f is continuous on [a,b], then f attains both a global maximum and a global minimum on [a,b]. This is a non-trivial theorem — it fails for open intervals (consider f(x) = x on (0,1), which approaches but never attains the values 0 and 1) and for discontinuous functions. The EVT relies on the completeness of the real numbers. For calculus problems, the EVT justifies the closed-interval method: evaluate f at all critical points in (a,b) and at both endpoints a, b; the largest value is the global max and the smallest is the global min.",
      "For open intervals or unbounded domains (which are more common in word problems), you cannot use the endpoint evaluation directly. Instead, you rely on physical reasoning: if the problem guarantees a maximum or minimum exists (physically, there must be some optimal value), and you find only one critical point that is a local min, then it must be the global min. This \"one critical point\" argument is valid for many engineering and economic problems but requires justification. More rigorously: if f is continuous on (a,b), lim_{x→a⁺} f(x) = +∞ (or approaches a limit below the critical value), and lim_{x→b⁻} f(x) = +∞, and there is one critical point with f''> 0, then that critical point gives the global minimum.",
      "The fencing problem illustrates the full procedure. Let x and y be the sides of the rectangle. Constraint: perimeter = 2x + 2y = 100, so x + y = 50. Objective: area A = xy. Substitute y = 50 - x to get A(x) = x(50-x) = 50x - x². Domain: x ∈ (0, 50) (both dimensions must be positive). Derivative: A'(x) = 50 - 2x = 0 gives x = 25. A''(x) = -2 < 0 confirms local (and global) maximum. Optimal dimensions: x = y = 25 m (a square). Maximum area: 625 m². The square emerges from calculus, not from intuition.",
      "With one side against a river, you only need 2x + y = 100 (three sides). Objective: A = xy = x(100 - 2x). A'(x) = 100 - 4x = 0 gives x = 25 m. Then y = 50 m. Area = 1250 m² — twice the area of the four-sided enclosure! The river allows a different optimal shape: 25m × 50m (not a square), because the asymmetry of the constraint breaks the square's optimality.",
      "The hardest part of an optimization problem is usually the setup: translating the word problem into an objective function and constraint. Experienced problem-solvers follow a disciplined procedure: (1) Draw a picture and label all quantities. (2) Identify the objective: what are you maximizing or minimizing? Write it as a formula. (3) Identify the constraint: what relationship must always hold? (4) Solve the constraint for one variable and substitute into the objective. (5) Differentiate and set equal to zero. (6) Verify it is a maximum or minimum (not a saddle point). (7) Answer the original question — report the optimal value AND the optimal input, with units.",
      "The AM-GM inequality (arithmetic mean ≥ geometric mean) provides a non-calculus proof that the square maximizes area for fixed perimeter. For positive x, y: (x+y)/2 ≥ √(xy), with equality iff x = y. So given x + y = 50, we have 50/2 ≥ √(xy), giving 625 ≥ xy, with equality iff x = y = 25. This is the fencing answer without calculus. But calculus generalizes: it solves non-symmetric, non-polynomial constraints where AM-GM cannot help.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "Completing the Square was Optimization",
        body: 'When you maximized A = -x² + 50x in algebra by "completing the square" to get -(x-25)² + 625, you were doing optimization. The vertex of the parabola is the maximum. Calculus replaces completing the square with differentiation — and works for any function, not just quadratics.',
      },
      {
        type: "real-world",
        title: "Machine Learning: Gradient Descent",
        body: "Training a neural network minimizes a loss function L(w) where w is a vector of thousands of parameters. Gradient descent steps in the direction of steepest descent: w_new = w_old - α·(dL/dw). Each step is a linear approximation step toward the minimum. This is calculus optimization running millions of times per second on every AI model training run.",
      },
      {
        type: "geometric",
        title: "Global Max on Closed Interval: Three Candidates",
        body: "The global maximum of a continuous function on [a,b] occurs at one of three types of points: (1) interior critical points where f'= 0, (2) interior critical points where f' is undefined, (3) endpoints a or b. Evaluate f at all three types and compare. Do not assume the critical point with the largest f' is the answer — always check all candidates.",
      },
      {
        type: "warning",
        title: "Verify That Your Critical Point Is the Optimizer",
        body: "Finding a critical point is only part of the problem. You must verify it gives a maximum (or minimum), not a saddle point. Use the second derivative test (f''> 0 → min, f''< 0 → max) or the closed-interval method (compare all candidates). Do not assume \"there is only one critical point, so it must be the answer\" without verifying the boundary behavior.",
      },
      {
        type: "misconception",
        title: "f'(c) = 0 Does NOT Mean c Is an Extremum",
        body: "The converse of Fermat's Theorem is FALSE. f'(c) = 0 only means c is a CANDIDATE for an extremum. Consider f(x) = x³: f'(0) = 0 but x = 0 is neither a max nor a min (it's an inflection point). You MUST use the second derivative test or inspect the sign of f' to determine the nature of each critical point.",
      },
      {
        type: "history",
        title: "Fermat's Principle of Least Time (1662)",
        body: "Pierre de Fermat proved that light travels between two points along the path of minimum time. This gave the first physical derivation of Snell's Law of refraction. Fermat's principle was later generalized to the Principle of Least Action (Maupertuis, Euler, Hamilton), which underlies ALL of classical mechanics, quantum mechanics, and general relativity. Every optimization problem in physics traces back to Fermat.",
      },
    ],
    visualizations: [
                                                                  {
        id: "Ch5_QuadraticShadow",
        title: "Story Mode: The Quadratic Shadow",
        mathBridge:
          "A physical timing question becomes a quadratic target equation, showcasing objective/constraint translation and solution filtering (math-valid vs physically valid). This mirrors optimization setup quality in this chapter.",
        caption:
          "Narrative quadratic modeling problem aligned with optimization thinking.",
      },
      {
        id: "OptimizationViz",
        title: "Open Box Optimization — Interactive",
        caption:
          "Drag the cut-size slider. The 3D box updates in real time and the volume graph shows the optimal cut size. Maximum volume occurs at x ≈ 1.54 inches.",
      },
    ],
  },

  math: {
    prose: [
      "Extreme Value Theorem (formal statement): If f is continuous on a closed, bounded interval [a,b], then f attains its maximum value M and its minimum value m on [a,b] — that is, there exist c, d ∈ [a,b] with f(c) = M and f(d) = m, and m ≤ f(x) ≤ M for all x ∈ [a,b]. The hypotheses — continuous, closed, bounded — are all necessary. The EVT is proved using the Heine-Borel theorem (closed bounded intervals in ℝ are compact) and the maximum principle for continuous functions on compact sets.",
      "Fermat's Theorem (local extrema occur at critical points): If f has a local maximum or minimum at c, and f is differentiable at c, then f'(c) = 0. Proof: suppose f has a local maximum at c. For h > 0 small: [f(c+h) - f(c)]/h ≤ 0 (since f(c+h) ≤ f(c)). Taking h → 0⁺: f'(c) ≤ 0. For h < 0 small: [f(c+h) - f(c)]/h ≥ 0. Taking h → 0⁻: f'(c) ≥ 0. Therefore f'(c) = 0. The proof for local minimum is analogous. Fermat's Theorem says every differentiable local extremum is a critical point, but not every critical point is an extremum — the converse fails.",
      "Closed Interval Method: to find the global extrema of a continuous f on [a,b]: (1) Find all critical points of f in (a,b) — both where f' = 0 and where f' is undefined. (2) Evaluate f at each critical point and at the endpoints a and b. (3) The largest value is the global maximum; the smallest is the global minimum. This method is guaranteed to work by the EVT (global extrema exist) and Fermat's Theorem (differentiable local extrema have f' = 0).",
      "Standard optimization setups: Rectangle of fixed perimeter P: area A = xy, constraint 2x+2y = P. Max area = P²/16 at x = y = P/4 (square). Cylinder of fixed volume V: surface area SA = 2πr² + 2πrh = 2πr² + 2V/r (using h = V/(πr²)). Minimizing: SA' = 4πr - 2V/r² = 0 gives r³ = V/(2π), h = 2r (height = diameter). General: at the minimum surface area, height = diameter for any fixed volume V.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Extreme Value Theorem",
        body: "If f is continuous on [a, b], then f attains both its maximum and minimum values on [a, b].",
      },
      {
        type: "theorem",
        title: "Fermat's Theorem",
        body: "If f has a local extremum at c and f is differentiable at c, then f'(c) = 0.",
      },
      {
        type: "definition",
        title: "Closed Interval Method",
        body: "For continuous f on [a,b]: (1) Find all c ∈ (a,b) with f'(c)=0 or f' undefined. (2) Evaluate f at c and at a, b. (3) Largest = global max; smallest = global min.",
      },
    ],
    visualizations: [
          ],
  },

  rigor: {
    prose: [
      "Proof of the Extreme Value Theorem sketch: we want to show that a continuous function f on [a,b] attains its supremum M = sup{f(x) : x ∈ [a,b]}. First, we show f is bounded above: suppose not. Then for each n, there exists xₙ ∈ [a,b] with f(xₙ) > n. By Bolzano-Weierstrass, {xₙ} has a convergent subsequence xₙₖ → c ∈ [a,b]. By continuity, f(xₙₖ) → f(c), contradicting f(xₙₖ) > nₖ → ∞. So f is bounded and M exists. Now find a sequence yₙ ∈ [a,b] with f(yₙ) → M. By compactness (Bolzano-Weierstrass), yₙₖ → d ∈ [a,b]. By continuity, f(yₙₖ) → f(d), so f(d) = M. The function attains its supremum at d. ∎",
      "Proof of Fermat's Theorem (complete): Suppose f has a local maximum at c and f is differentiable at c. By definition of local maximum, there exists δ > 0 such that f(c+h) ≤ f(c) for all |h| < δ. For 0 < h < δ: [f(c+h) - f(c)]/h ≤ 0/h = 0. The difference quotient is non-positive. By the limit property (limit of non-positive is non-positive): lim_{h→0⁺} [f(c+h)-f(c)]/h ≤ 0, i.e., f'(c) ≤ 0 (the right derivative). For -δ < h < 0: [f(c+h) - f(c)]/h ≥ 0/h = 0 (h is negative and f(c+h) - f(c) ≤ 0, so their ratio ≥ 0). lim_{h→0⁻} [f(c+h)-f(c)]/h ≥ 0, i.e., f'(c) ≥ 0 (left derivative). Since f is differentiable, f'(c) = right derivative = left derivative, so f'(c) ≥ 0 and f'(c) ≤ 0 simultaneously, giving f'(c) = 0. ∎",
      "The closed interval method works because the global maximum must occur somewhere (EVT), and wherever it occurs is either (a) an interior point where f is differentiable (Fermat's Theorem forces f'= 0 there), or (b) an interior point where f is not differentiable, or (c) an endpoint. The closed interval method checks all three cases. This is a complete argument — nothing is missed.",
      "For unbounded domains: suppose we want to minimize f on (0,∞) and f(x) → ∞ as x → 0⁺ and x → ∞. If f is continuous and has exactly one critical point c ∈ (0,∞) with f''(c) > 0, then c gives the global minimum. The argument: since f → ∞ at both \"ends\" and f is continuous, there must be a global minimum in the interior (by a version of EVT on the compactified line). Since f''(c) > 0 gives a local minimum, and it's the only critical point, it must be the global minimum. This is the standard \"physical\" argument used in most engineering optimization problems.",
    ],
    callouts: [
      {
        type: "warning",
        title: "EVT Requires All Three Conditions",
        body: "f(x) = x on (0,1): no max or min (open interval). f(x) = 1/x on [-1,1]: unbounded, no min (discontinuous). f(x) = tan(x) on [-π/2, π/2]: blows up at endpoints (not bounded on closed interval). All three conditions — continuous, closed, bounded — are necessary for the EVT.",
      },
    ],
    visualizations: [
          ],
  },

  examples: [
    {
      id: "ch3-004-ex1",
      title: "Fencing Problem: Maximize Rectangular Area",
      problem:
        "\\text{You have 100 m of fence. Maximize the enclosed rectangular area.}",
      visualizationId: "OptimizationViz",
      steps: [
        {
          expression:
            "\\text{Let } x, y \\text{ be the sides. Constraint: } 2x + 2y = 100 \\Rightarrow x + y = 50.",
          annotation:
            "Draw a rectangle with sides x and y. Write the constraint from the fixed perimeter.",
        },
        {
          expression: "A = xy \\text{ (objective)}",
          annotation: "The area is the objective function.",
        },
        {
          expression: "y = 50 - x \\Rightarrow A(x) = x(50-x) = 50x - x^2",
          annotation: "Substitute the constraint to eliminate y.",
        },
        {
          expression: "A'(x) = 50 - 2x = 0 \\Rightarrow x = 25",
          annotation: "Differentiate and set equal to zero.",
        },
        {
          expression:
            "A''(x) = -2 < 0 \\Rightarrow \\text{local (global) maximum at } x = 25",
          annotation: "Second derivative confirms maximum.",
        },
        {
          expression:
            "y = 50 - 25 = 25, \\quad A = 25 \\times 25 = 625 \\text{ m}^2",
          annotation: "Both sides are 25 m — a square. Maximum area is 625 m².",
        },
      ],
      conclusion:
        "A 25m × 25m square encloses the maximum area of 625 m². The calculus confirms the geometric/algebraic insight: the square is uniquely optimal. Any deviation from equal sides (e.g., 20 × 30) gives A = 600 < 625.",
    },
    {
      id: "ch3-004-ex2",
      title: "Open Box from a Sheet of Cardboard",
      problem:
        "\\text{A 12×8 inch cardboard. Cut square corners of size } x \\text{ and fold. Maximize volume.}",
      steps: [
        {
          expression: "V(x) = (12-2x)(8-2x)x",
          annotation:
            "After cutting corners x × x, the box has dimensions (12-2x) × (8-2x) × x. Domain: x ∈ (0, 4) (need 8-2x > 0).",
        },
        {
          expression:
            "V(x) = x(96 - 24x - 16x + 4x^2) = x(96 - 40x + 4x^2) = 4x^3 - 40x^2 + 96x",
          annotation: "Expand the product.",
        },
        {
          expression: "V'(x) = 12x^2 - 80x + 96 = 4(3x^2 - 20x + 24)",
          annotation: "Differentiate.",
        },
        {
          expression:
            "3x^2 - 20x + 24 = 0 \\Rightarrow x = \\frac{20 \\pm \\sqrt{400 - 288}}{6} = \\frac{20 \\pm \\sqrt{112}}{6} = \\frac{20 \\pm 4\\sqrt{7}}{6} = \\frac{10 \\pm 2\\sqrt{7}}{3}",
          annotation: "Quadratic formula.",
        },
        {
          expression:
            "x = \\frac{10 - 2\\sqrt{7}}{3} \\approx \\frac{10 - 5.292}{3} \\approx \\frac{4.708}{3} \\approx 1.570",
          annotation:
            "The physically valid solution: x ≈ 1.570 in (the other root ≈ 5.097 is outside the domain (0,4)).",
        },
        {
          expression:
            "V(1.570) = (12 - 3.140)(8 - 3.140)(1.570) \\approx (8.860)(4.860)(1.570) \\approx 67.6 \\text{ in}^3",
          annotation: "Maximum volume is approximately 67.6 cubic inches.",
        },
        {
          expression: "V''(x) = 24x - 80 < 0 \\text{ at } x \\approx 1.570",
          annotation:
            "V''(1.570) ≈ 24(1.570) - 80 = 37.68 - 80 = -42.32 < 0. Maximum confirmed.",
        },
      ],
      conclusion:
        "Cutting squares of approximately 1.57 inches from each corner maximizes the box volume at about 67.6 in³. The exact optimal cut is x = (10 - 2√7)/3 inches. Cutting too little wastes height; cutting too much shrinks the base.",
    },
    {
      id: "ch3-004-ex3",
      title: "Minimum Surface Area Tin Can",
      problem:
        "\\text{Find the cylinder of volume } 500 \\text{ cm}^3 \\text{ that uses the minimum surface area.}",
      steps: [
        {
          expression:
            "V = \\pi r^2 h = 500 \\Rightarrow h = \\frac{500}{\\pi r^2}",
          annotation: "Volume constraint: solve for h.",
        },
        {
          expression:
            "SA = 2\\pi r^2 + 2\\pi r h = 2\\pi r^2 + 2\\pi r \\cdot \\frac{500}{\\pi r^2} = 2\\pi r^2 + \\frac{1000}{r}",
          annotation:
            "Surface area = two circles (top/bottom) + lateral area. Substitute h = 500/(πr²).",
        },
        {
          expression: "SA'(r) = 4\\pi r - \\frac{1000}{r^2} = 0",
          annotation: "Differentiate and set equal to zero.",
        },
        {
          expression:
            "4\\pi r = \\frac{1000}{r^2} \\Rightarrow r^3 = \\frac{1000}{4\\pi} = \\frac{250}{\\pi}",
          annotation: "Solve for r³.",
        },
        {
          expression:
            "r = \\left(\\frac{250}{\\pi}\\right)^{1/3} \\approx 4.30 \\text{ cm}",
          annotation: "Optimal radius.",
        },
        {
          expression:
            "h = \\frac{500}{\\pi r^2} = \\frac{500}{\\pi(250/\\pi)^{2/3}} = 2\\left(\\frac{250}{\\pi}\\right)^{1/3} = 2r",
          annotation:
            "The optimal height equals the diameter (h = 2r). This is a remarkable result — the optimal can is as tall as it is wide.",
        },
        {
          expression:
            "SA_{\\min} = 2\\pi r^2 + \\frac{1000}{r} \\approx 2\\pi(18.5) + \\frac{1000}{4.30} \\approx 116.2 + 232.6 \\approx 348.7 \\text{ cm}^2",
          annotation: "Minimum surface area: ≈349 cm².",
        },
      ],
      conclusion:
        "The optimal 500 cm³ can has height = diameter ≈ 8.6 cm, using ≈349 cm² of material. Real soup cans are often taller than their diameter because of manufacturing constraints (top/bottom lids cost more per unit area than the side). The mathematical optimum is a cube-like short cylinder.",
    },
    {
      id: "ch3-004-ex4",
      title: "Nearest Point on a Parabola",
      problem:
        "\\text{Find the point on } y = x^2 \\text{ nearest to } (0, 3).",
      steps: [
        {
          expression: "D^2 = x^2 + (x^2 - 3)^2",
          annotation:
            "Distance squared from (x, x²) to (0,3). We minimize D² (equivalent to minimizing D, and easier).",
        },
        {
          expression: "D^2 = x^2 + x^4 - 6x^2 + 9 = x^4 - 5x^2 + 9",
          annotation: "Expand (x² - 3)² = x⁴ - 6x² + 9, then combine x² terms.",
        },
        {
          expression: "\\frac{d(D^2)}{dx} = 4x^3 - 10x = 2x(2x^2 - 5) = 0",
          annotation: "Differentiate and factor.",
        },
        {
          expression:
            "x = 0 \\quad \\text{or} \\quad x = \\pm\\sqrt{5/2} = \\pm\\frac{\\sqrt{10}}{2}",
          annotation:
            "Three critical points. The solutions ±√(5/2) are the meaningful candidates.",
        },
        {
          expression:
            "D^2(0) = 9, \\quad D^2(\\pm\\sqrt{5/2}) = (5/2)^2 - 5(5/2) + 9 = 25/4 - 25/2 + 9 = 25/4 - 50/4 + 36/4 = 11/4",
          annotation:
            "Evaluate D² at each critical point. D²(0) = 9 (point (0,0), distance 3). D²(±√(5/2)) = 11/4 (smaller!).",
        },
        {
          expression:
            "D_{\\min} = \\sqrt{11/4} = \\frac{\\sqrt{11}}{2} \\approx 1.658",
          annotation: "Minimum distance.",
        },
        {
          expression: "x = \\pm\\sqrt{5/2}, \\quad y = x^2 = 5/2",
          annotation: "Nearest points: (±√(5/2), 5/2) ≈ (±1.581, 2.5).",
        },
      ],
      conclusion:
        "The nearest points to (0,3) on y = x² are (±√(10)/2, 5/2), at distance √11/2 ≈ 1.66. The point (0,0) on the parabola is actually farther from (0,3) than the two optimal points — the parabola curves away from the y-axis faster than the straight-line distance decreases.",
    },
    {
      id: "ch3-004-ex5",
      title: "Snell's Law from Fermat's Principle",
      problem:
        "\\text{A lifeguard at } (0, 3) \\text{ runs at 8 m/s and swims at 2 m/s. Swimmer is at } (4, -2). \\text{ Find the optimal crossing point on the beach (x-axis).}",
      steps: [
        {
          expression:
            "T(x) = \\frac{\\sqrt{x^2 + 9}}{8} + \\frac{\\sqrt{(4-x)^2 + 4}}{2}",
          annotation:
            "Total time = (running distance)/8 + (swimming distance)/2. Running along the beach to point (x,0), then swimming to (4,-2).",
        },
        {
          expression:
            "T'(x) = \\frac{x}{8\\sqrt{x^2+9}} - \\frac{4-x}{2\\sqrt{(4-x)^2+4}} = 0",
          annotation: "Differentiate and set equal to zero.",
        },
        {
          expression:
            "\\frac{x}{8\\sqrt{x^2+9}} = \\frac{4-x}{2\\sqrt{(4-x)^2+4}}",
          annotation: "Rearrange.",
        },
        {
          expression:
            "\\frac{\\sin(\\theta_1)}{v_1} = \\frac{\\sin(\\theta_2)}{v_2}",
          annotation:
            "If θ₁ is the angle the running path makes with the normal to the beach and θ₂ is the angle the swimming path makes: sin(θ₁) = x/√(x²+9) and sin(θ₂) = (4-x)/√((4-x)²+4). The condition T'= 0 becomes sin(θ₁)/8 = sin(θ₂)/2. This is Snell's Law of refraction: sin(θ₁)/v₁ = sin(θ₂)/v₂.",
        },
        {
          expression: "\\text{Solve numerically: } x \\approx 0.5 \\text{ m}",
          annotation:
            "The optimal crossing point is about 0.5 m along the beach. The lifeguard runs mostly to the water's edge quickly, then swims at an angle to the swimmer.",
        },
      ],
      conclusion:
        "Fermat's Principle (light takes the path of minimum time) and Snell's Law of optics are the same calculation: minimizing total travel time across two media. The lifeguard problem is physically identical to a light ray crossing from air to water. Calculus unifies optics, swimming, and running under the same optimization principle.",
    },
    {
      id: "ch3-004-ex6",
      title: "Economic Order Quantity",
      problem:
        "\\text{A store sells 1200 units/year. Each order costs \\$50. Storage costs \\$2/unit/year. Find optimal order quantity.}",
      steps: [
        {
          expression: "\\text{Number of orders per year} = 1200/Q",
          annotation:
            "If Q units are ordered each time, the number of orders per year is 1200/Q.",
        },
        {
          expression: "\\text{Average inventory} = Q/2",
          annotation:
            "Inventory decreases linearly from Q to 0 between orders, so average is Q/2.",
        },
        {
          expression:
            "C(Q) = 50 \\cdot \\frac{1200}{Q} + 2 \\cdot \\frac{Q}{2} = \\frac{60000}{Q} + Q",
          annotation: "Total annual cost = order costs + storage costs.",
        },
        {
          expression:
            "C'(Q) = -\\frac{60000}{Q^2} + 1 = 0 \\Rightarrow Q^2 = 60000 \\Rightarrow Q = \\sqrt{60000} \\approx 245 \\text{ units}",
          annotation: "Set C'= 0 and solve.",
        },
        {
          expression:
            "C''(Q) = \\frac{120000}{Q^3} > 0 \\Rightarrow \\text{minimum}",
          annotation: "C'' > 0 confirms this is a minimum.",
        },
        {
          expression:
            "C(245) = \\frac{60000}{245} + 245 \\approx 244.9 + 244.9 \\approx \\$489.9/\\text{year}",
          annotation:
            "Minimum cost. Note: at the optimum, ordering cost = storage cost (both ≈ $245). This is always true for the EOQ model: C is minimized when the two costs are equal.",
        },
      ],
      conclusion:
        "The optimal order quantity is Q* = √(60000) ≈ 245 units, ordered about 5 times per year. The minimum annual cost is about $490. The general formula Q* = √(2DS/H) (where D = annual demand, S = setup cost, H = holding cost per unit per year) is the famous Economic Order Quantity formula, used in supply chain management worldwide.",
    },
    {
      id: "ch3-004-ex7",
      title: "Maximize the Area of a Norman Window",
      problem:
        "\\text{A Norman window (rectangle with semicircle on top) has perimeter 10 m. Maximize the area.}",
      steps: [
        {
          expression:
            "\\text{Let } r = \\text{radius of semicircle}, h = \\text{height of rectangle.}",
          annotation:
            "The window width = 2r. The rectangle has width 2r and height h. The semicircle has radius r.",
        },
        {
          expression: "\\text{Perimeter} = 2h + 2r + \\pi r = 10",
          annotation:
            "Perimeter consists of: two vertical sides (height h each), the bottom edge (2r), and the semicircle (πr). Note: no top side — the semicircle replaces it.",
        },
        {
          expression:
            "h = \\frac{10 - 2r - \\pi r}{2} = 5 - r - \\frac{\\pi r}{2}",
          annotation: "Solve for h.",
        },
        {
          expression: "A = 2rh + \\frac{\\pi r^2}{2}",
          annotation: "Area = rectangle (2r × h) + semicircle (πr²/2).",
        },
        {
          expression:
            "A(r) = 2r\\left(5 - r - \\frac{\\pi r}{2}\\right) + \\frac{\\pi r^2}{2} = 10r - 2r^2 - \\pi r^2 + \\frac{\\pi r^2}{2}",
          annotation: "Substitute h.",
        },
        {
          expression: "A(r) = 10r - 2r^2 - \\frac{\\pi r^2}{2}",
          annotation: "Simplify: -πr² + πr²/2 = -πr²/2.",
        },
        {
          expression: "A'(r) = 10 - 4r - \\pi r = 10 - r(4 + \\pi) = 0",
          annotation: "Differentiate and set equal to zero.",
        },
        {
          expression:
            "r = \\frac{10}{4 + \\pi} \\approx \\frac{10}{7.14} \\approx 1.40 \\text{ m}",
          annotation: "Optimal radius.",
        },
        {
          expression:
            "h = 5 - r - \\pi r/2 = 5 - r(1 + \\pi/2) \\approx 5 - 1.40(2.571) \\approx 5 - 3.60 \\approx 1.40 \\text{ m}",
          annotation: "Optimal height ≈ 1.40 m. Notice h ≈ r at the optimum.",
        },
      ],
      conclusion:
        "The maximum area Norman window with perimeter 10 m has r ≈ 1.40 m and h ≈ 1.40 m. At the optimum, h = r: the rectangle height equals the semicircle radius. This is a general result for Norman windows — the optimal shape always satisfies h = r.",
    },
    {
      id: "ch3-004-ex8",
      title: "Optimal Launch Angle for Maximum Range (Physics)",
      problem:
        "A projectile is launched from ground level at speed $v_0 = 30$ m/s and angle $\\theta \\in (0°, 90°)$. The horizontal range is $R(\\theta) = \\frac{v_0^2 \\sin(2\\theta)}{g} = \\frac{900 \\sin(2\\theta)}{9.8}$ metres. Find the launch angle that maximises range.",
      visualizationId: "ProjectileMotion",
      steps: [
        {
          expression:
            "R(\\theta) = \\frac{900}{9.8}\\sin(2\\theta) \\approx 91.8 \\sin(2\\theta)",
          annotation:
            "The range formula from projectile kinematics. Note R depends only on sin(2θ) — all the physics is packed into this trig function.",
        },
        {
          expression:
            "R'(\\theta) = 91.8 \\cdot 2\\cos(2\\theta) = 183.6 \\cos(2\\theta)",
          annotation:
            "Differentiate with respect to θ. d/dθ[sin(2θ)] = 2cos(2θ) by the chain rule.",
        },
        {
          expression:
            "R'(\\theta) = 0 \\Rightarrow \\cos(2\\theta) = 0 \\Rightarrow 2\\theta = \\frac{\\pi}{2}",
          annotation:
            "Set derivative = 0. cos(2θ)=0 when 2θ=π/2 (in the interval 0 < 2θ < π).",
        },
        {
          expression: "\\theta^* = \\frac{\\pi}{4} = 45°",
          annotation:
            "45° maximises range. This is the famous result — every cannon ever built was aimed at 45° for maximum distance (ignoring air resistance).",
        },
        {
          expression: "R''(\\theta) = -183.6 \\cdot 2\\sin(2\\theta)",
          annotation: "Second derivative for verification.",
        },
        {
          expression: "R''(45°) = -367.2 \\sin(90°) = -367.2 < 0",
          annotation: "R''(45°) < 0 confirms this is a maximum, not a minimum.",
        },
        {
          expression: "R_{\\max} = 91.8 \\sin(90°) = 91.8 \\text{ m}",
          annotation:
            "Maximum range ≈ 91.8 m. This equals v₀²/g = 900/9.8 — the range formula's prefactor.",
        },
        {
          expression:
            "R(0°) = 91.8\\sin(0°) = 0, \\quad R(90°) = 91.8\\sin(180°) = 0",
          annotation:
            "Boundary check: R=0 at both endpoints. Launching horizontally (0°) or straight up (90°) gives zero range — physically correct!",
        },
      ],
      conclusion:
        "45° gives maximum range of v₀²/g ≈ 91.8 m. The elegant result θ*=45° emerges because we are maximising sin(2θ), which peaks when 2θ=90°. Notice the symmetry: R(θ) = R(90°-θ), so 30° and 60° give the same range — the physics is symmetric about 45°. In reality, air resistance shifts the optimum below 45° (typically 30°-38° for bullets and baseballs), which requires a more complex model.",
    },
  ],

  challenges: [
    {
      id: "ch3-004-ch1",
      difficulty: "hard",
      problem:
        "Prove: (1) Among all rectangles with fixed perimeter P, the square has maximum area. (2) Among all rectangles with fixed area A, the square has minimum perimeter.",
      hint: 'Think of "breaking the symmetry." If x and y differ, you can always nudge them closer together to improve the objective function while keeping the constraint. The calculus confirms that the perfect balance point (x=y) is the only critical point.',
      walkthrough: [
        {
          expression:
            "\\text{Part (1): Fix perimeter } 2x+2y = P, \\text{ maximize } A = xy.",
          annotation: "Set up as in the fencing problem.",
        },
        {
          expression:
            "y = P/2 - x, \\; A = x(P/2-x), \\; A'=P/2 - 2x = 0 \\Rightarrow x = P/4 = y",
          annotation:
            "Critical point: x = y = P/4 (square). A''= -2 < 0: maximum.",
        },
        {
          expression: "A_{\\max} = (P/4)^2 = P^2/16",
          annotation: "Maximum area is P²/16.",
        },
        {
          expression:
            "\\text{Part (2): Fix area } xy = A, \\text{ minimize perimeter } P = 2x + 2y.",
          annotation: "New objective: minimize P.",
        },
        {
          expression:
            "y = A/x, \\; P(x) = 2x + 2A/x, \\; P'= 2 - 2A/x^2 = 0 \\Rightarrow x^2 = A \\Rightarrow x = \\sqrt{A}",
          annotation: "Differentiate P and set to zero.",
        },
        {
          expression:
            "x = \\sqrt{A}, \\; y = A/x = \\sqrt{A} \\Rightarrow x = y \\text{ (square)}",
          annotation: "Optimal shape is again a square.",
        },
        {
          expression: "P''= 4A/x^3 > 0 \\Rightarrow \\text{minimum}",
          annotation: "P'' > 0 confirms minimum perimeter.",
        },
        {
          expression: "P_{\\min} = 4\\sqrt{A}",
          annotation: "Minimum perimeter is 4√A.",
        },
      ],
      answer:
        "In both directions — fixed perimeter maximizes area as a square, fixed area minimizes perimeter as a square. These are dual optimization problems with the same geometric answer. The isoperimetric inequality (circle maximizes area for fixed perimeter among all shapes, not just rectangles) generalizes this result.",
    },
    {
      id: "ch3-004-ch2",
      difficulty: "hard",
      problem:
        "Find the cylinder of maximum volume that can be inscribed in a sphere of radius R.",
      hint: "Use the sphere constraint r² + h² = R², where h is the half-height. Substitute r² = R² - h² into V = 2πh r², then differentiate the resulting one-variable function in h.",
      walkthrough: [
        {
          expression:
            "r^2 + h^2 = R^2 \\text{ (constraint, where } h \\text{ is half the cylinder height)}",
          annotation:
            "The cylinder fits inside the sphere: the top edge of the cylinder is at (r, h) on the sphere surface.",
        },
        {
          expression: "V = \\pi r^2 \\cdot 2h = 2\\pi h(R^2 - h^2)",
          annotation:
            "Volume = π r² × height = π(R² - h²)(2h). Substitute r² = R² - h².",
        },
        {
          expression:
            "V'(h) = 2\\pi(R^2 - h^2) + 2\\pi h(-2h) = 2\\pi(R^2 - 3h^2) = 0",
          annotation: "Differentiate V with respect to h.",
        },
        {
          expression: "R^2 - 3h^2 = 0 \\Rightarrow h = \\frac{R}{\\sqrt{3}}",
          annotation: "Solve: optimal half-height.",
        },
        {
          expression:
            "r^2 = R^2 - h^2 = R^2 - R^2/3 = \\frac{2R^2}{3} \\Rightarrow r = R\\sqrt{\\frac{2}{3}}",
          annotation: "Optimal radius.",
        },
        {
          expression:
            "V_{\\max} = 2\\pi \\cdot \\frac{R}{\\sqrt{3}} \\cdot \\frac{2R^2}{3} = \\frac{4\\pi R^3}{3\\sqrt{3}} = \\frac{4\\pi R^3\\sqrt{3}}{9}",
          annotation: "Maximum volume.",
        },
        {
          expression:
            "\\frac{V_{\\max}}{V_{\\text{sphere}}} = \\frac{4\\pi R^3/(3\\sqrt{3})}{(4/3)\\pi R^3} = \\frac{1}{\\sqrt{3}} \\approx 0.577",
          annotation:
            "The optimal cylinder is about 57.7% of the sphere's volume.",
        },
      ],
      answer:
        "Optimal inscribed cylinder: r = R√(2/3), full height = 2h = 2R/√3 = 2R√3/3. Maximum volume = 4πR³/(3√3). The cylinder uses about 57.7% of the sphere volume.",
    },
    {
      id: "ch3-004-ch3",
      difficulty: "medium",
      problem:
        "A Norman window (rectangle + semicircle on top) has perimeter 10 m. Show the optimal height-to-radius ratio is h = r, where h is the rectangle height and r is the semicircle radius.",
      hint: 'This "h = r" result is a beautiful symmetry. Try writing the area as a function of r, then find the critical radius r*. When you plug r* back into the height equation, the complicated-looking pi terms will perfectly cancel out.',
      walkthrough: [
        {
          expression:
            "A(r) = 10r - 2r^2 - \\frac{\\pi r^2}{2}, \\quad A'(r) = 10 - 4r - \\pi r = 0",
          annotation: "From Example 7, the critical point condition.",
        },
        {
          expression: "r^* = \\frac{10}{4+\\pi}",
          annotation: "Optimal radius.",
        },
        {
          expression:
            "h = 5 - r^* - \\frac{\\pi r^*}{2} = 5 - r^*\\left(1 + \\frac{\\pi}{2}\\right) = 5 - r^* \\cdot \\frac{2+\\pi}{2}",
          annotation: "Substitute r* into the expression for h.",
        },
        {
          expression:
            "5 = r^*(4+\\pi)/2 \\text{ (from } r^* = 10/(4+\\pi)\\text{)}",
          annotation: "Note that from A'= 0: 10 = r*(4+π), so 5 = r*(4+π)/2.",
        },
        {
          expression:
            "h = r^* \\cdot \\frac{4+\\pi}{2} - r^* \\cdot \\frac{2+\\pi}{2} = r^* \\cdot \\frac{(4+\\pi)-(2+\\pi)}{2} = r^* \\cdot \\frac{2}{2} = r^*",
          annotation:
            "Subtract to find h = r*. The optimal Norman window always has rectangle height equal to semicircle radius, regardless of the total perimeter.",
        },
      ],
      answer:
        "At the optimum, h = r* = 10/(4+π). This result (h = r) is independent of the perimeter length — it is a universal property of the optimal Norman window shape.",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "curve-sketching",
      label: "Curve Sketching",
      context:
        "Optimization uses exactly the same tools as curve sketching: critical points, first/second derivative tests. The difference is that optimization focuses on the global optimum, not just local behavior.",
    },
    {
      lessonSlug: "related-rates",
      label: "Related Rates",
      context:
        "Both optimization and related rates require setting up geometric equations. The modeling skills transfer directly.",
    },
    {
      lessonSlug: "mean-value-theorem",
      label: "Mean Value Theorem",
      context:
        "Fermat's theorem (critical points) and the EVT are both consequences of the MVT framework. The proof that differentiable optima have f'= 0 uses the limit definition directly.",
    },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "objective function",
            "meaning": "the quantity you want to maximize or minimize — e.g., area, cost, time"
        },
        {
            "symbol": "constraint",
            "meaning": "the equation that limits your choices — e.g., fixed perimeter, fixed volume"
        },
        {
            "symbol": "critical number",
            "meaning": "where f'= 0 inside the feasible domain — an interior max/min candidate"
        },
        {
            "symbol": "Extreme Value Theorem",
            "meaning": "guarantees a max and min exist when f is continuous on a closed interval"
        }
    ],
    "rulesOfThumb": [
        "5 steps: understand the problem → draw → label variables → write objective + constraint → use constraint to reduce to one variable → differentiate and solve.",
        "Always verify your critical points are actually max/min using the second derivative test or endpoint comparison.",
        "Check endpoints! On a closed interval, the global max/min might be at an endpoint, not a critical point.",
        "If the domain is open or unbounded, use limits at the boundary to confirm the critical point is a global max/min."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch3-curve-sketching",
            "label": "Previous: Curve Sketching",
            "note": "Optimization uses exactly the same critical-point machinery as curve sketching. The difference is that you now have a real-world question attached to the mathematics."
        },
        {
            "lessonId": "ch3-related-rates",
            "label": "Ch. 3: Related Rates",
            "note": "Both related rates and optimization require translating a geometric/physical situation into an equation. That modeling discipline — diagram, label, write constraint — is identical."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch4-applications",
            "label": "Ch. 4: Applications of Integration",
            "note": "Some optimization problems involve integrals (e.g., minimizing arc length, maximizing enclosed area). The same modeling approach applies, but the objective function requires integration."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "opt-assess-1",
            "type": "choice",
            "text": "After finding f'(c) = 0, how do you confirm c is a local maximum?",
            "options": [
                "f(c) > 0",
                "f''(c) < 0",
                "f''(c) > 0",
                "f'(c) > 0 to the left"
            ],
            "answer": "f''(c) < 0",
            "hint": "Second derivative test: f''< 0 → concave down → local max. f''> 0 → concave up → local min."
        },
        {
            "id": "opt-assess-2",
            "type": "choice",
            "text": "On a closed interval [a,b], where can the global maximum occur?",
            "options": [
                "Only at critical points",
                "Only at endpoints",
                "At critical points OR endpoints",
                "Only where f'' = 0"
            ],
            "answer": "At critical points OR endpoints",
            "hint": "The Closed Interval Method: evaluate f at all critical points AND endpoints. The largest value is the global max."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Set up: objective function + constraint → one variable",
    "Solve: differentiate → set to zero → solve for critical point",
    "Verify: second derivative test or endpoint comparison",
    "Check endpoints always on a closed interval"
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
    "attempted-challenge-hard-1",
    "attempted-challenge-hard-2",
    "attempted-challenge-medium",
  ],
};
