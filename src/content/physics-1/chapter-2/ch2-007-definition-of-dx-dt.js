export default {
  id: "ch2-007",
  slug: "definition-of-dx-dt",
  chapter: 2,
  order: 7,
  title: "Definition of dx/dt — Instantaneous Velocity",
  subtitle:
    "How physicists forced mathematicians to invent calculus: the problem of velocity at a single instant.",
  tags: ["derivative", "limit", "instantaneous velocity", "difference quotient", "calculus", "kinematics", "dx/dt"],
  aliases: "definition-of-dx-dt instantaneous velocity limit derivative",

  hook: {
    question:
      "Your car speedometer reads 60 mph right now. But speed = distance/time. If we measure over zero time, the car travels zero distance — so speed = 0/0, which is undefined. How can you have a speed at an instant if it takes time to measure speed?",
    realWorldContext:
      "This is not just a philosophical puzzle — it is the exact paradox that Newton and Leibniz solved when they invented calculus in the 1660s-70s. Every speedometer, radar gun, GPS velocity readout, and physics simulation in the world answers this question millions of times per second. The answer is the derivative: the limit of the average speed as the measurement interval shrinks to zero. Understanding this limit is understanding why calculus exists.",
    previewVisualizationId: "DerivativeLimitIntuition",
  },

  videos: [
    {
      title:
        "Physics 2 – Motion in One Dimension (7 of 22) Definition of dx/dt",
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],

  intuition: {
    prose: [
      "The key problem: velocity measures how position changes over time. The formula is Δx/Δt — change in position divided by change in time. But this formula gives average velocity over a time interval. What does it mean to ask for velocity at a single instant — a moment with no duration? Setting Δt = 0 gives 0/0, which is meaningless. Yet physically, your speedometer clearly displays a number. How?",
      "The resolution: instead of measuring over zero time (impossible), measure over a very small time interval and see what the measurement approaches. Pick a moment t. Measure position: x(t). Wait a small time h. Measure position again: x(t+h). Compute average velocity: [x(t+h) − x(t)]/h. Now repeat with a smaller h. And smaller again. If these average velocities converge to a definite number as h → 0, that number IS the instantaneous velocity at time t. This convergence is the limit.",
      "Think of it this way: a 'snapshot' of motion does not contain velocity information. But if you take two snapshots extremely close together in time, you can estimate velocity from the small displacement between them. The closer together the snapshots, the more accurate the estimate. In the mathematical limit where the gap vanishes, the estimate becomes exact. This is why calculus was needed — Zeno's paradoxes had convinced ancient Greeks that instantaneous motion was conceptually incoherent, but the limit concept resolves the paradox rigorously.",
      "Geometrically, average velocity is the slope of the secant line through (t, x(t)) and (t+h, x(t+h)) on the position-time graph. As h → 0, the second point slides toward the first, and the secant line rotates into the tangent line at (t, x(t)). The slope of the tangent line is the instantaneous velocity. The derivative IS the tangent slope — that is its geometric definition.",
      "This lesson is the calculus bridge. If you have already taken calculus, you know the limit definition of the derivative. This lesson shows you that definition in its original physical context — the problem it was invented to solve. If you haven't taken calculus yet, this lesson IS calculus: you are learning the derivative at the same time physicists first learned it, through velocity.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Average velocity (starting point)",
        body: "\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x(t+h) - x(t)}{h} \\qquad (h \\neq 0)",
      },
      {
        type: "theorem",
        title: "Instantaneous velocity (the derivative)",
        body: "v(t) = \\lim_{h \\to 0} \\frac{x(t+h) - x(t)}{h} = \\frac{dx}{dt}",
      },
      {
        type: "tip",
        title: "This IS Calculus Chapter 2",
        body: "The formula above is the definition of the derivative from calculus. In calculus, it's written as f'(x) = lim_{h→0} [f(x+h)−f(x)]/h. In physics, f is the position function x(t) and the independent variable is t instead of x. The math is identical — only the variable names differ. See Calculus Ch2 (The Derivative) for the full algebraic machinery, proof that differentiability implies continuity, and every differentiation rule.",
      },
      {
        type: "intuition",
        title: "Secant → Tangent is the Whole Story",
        body: "Secant slope = average velocity (over finite interval h). As h → 0: secant rotates → tangent. Tangent slope = instantaneous velocity. The derivative is nothing more — and nothing less — than this limiting process.",
      },
      {
        type: "misconception",
        title: "You CANNOT Just Set h = 0",
        body: "Plugging h = 0 directly into [x(t+h)−x(t)]/h gives [x(t)−x(t)]/0 = 0/0. This is an indeterminate form — it doesn't have a value. The limit process is NOT the same as substitution at h = 0. You must first simplify the expression algebraically so the h in the denominator cancels, and THEN take the limit. This algebraic simplification is what differentiation rules automate.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'The slope triangle',
        caption: 'Δx/Δt is the rise-over-run of the secant. As Δt → 0 the secant becomes the tangent — that limiting ratio is the derivative.',
      },
      {
        id: "DerivativeLimitIntuition",
        title: "Secant to tangent transition",
        mathBridge:
          "Drag the second point closer to t and watch the secant slope converge to the tangent slope. The converging number is the instantaneous velocity.",
        caption:
          "The limit process turns average rate into instantaneous rate.",
      },
    ],
  },

  math: {
    prose: [
      "To compute the instantaneous velocity analytically, you apply differentiation rules to x(t). For polynomials: d/dt[tⁿ] = ntⁿ⁻¹ (power rule). For a sum: differentiate term by term. For a product: product rule. For a composition (chain rule). In practice, this means you never need to evaluate the limit directly after learning the rules — the rules automate the limit for common function types.",
      "Numerical estimation: if x(t) is only known at discrete time samples (as in sensor data), approximate v(t) using the central difference formula: v(t) ≈ [x(t+h) − x(t−h)]/(2h) for small h. This is more accurate than the one-sided difference quotient and converges as h², not h. It is the formula used in every numerical physics simulation and data processing pipeline.",
      "For x(t) = x₀ + v₀t + ½at² (constant acceleration), the derivative is v(t) = v₀ + at. The power rule applied term by term: d/dt[x₀] = 0, d/dt[v₀t] = v₀, d/dt[½at²] = at. This is why v = v₀ + at is the kinematic velocity formula — it IS the derivative of the position formula.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Difference quotient (explicit form)",
        body: "\\frac{x(t+h)-x(t)}{h} \\xrightarrow{h\\to 0} v(t) = \\frac{dx}{dt}",
      },
      {
        type: "technique",
        title: "Power Rule for Polynomials (most common case)",
        body: "\\frac{d}{dt}\\left(c t^n\\right) = cn\\,t^{n-1} \\qquad (c\\text{ = constant})",
      },
      {
        type: "technique",
        title: "Central Difference (Numerical Estimation)",
        body: "v(t) \\approx \\frac{x(t+h) - x(t-h)}{2h} \\qquad \\text{(error } \\sim h^2\\text{)}",
      },
      {
        type: "warning",
        title: "Numerical Caution for h",
        body: "If h is too large, the secant poorly approximates the tangent. If h is too small in floating-point arithmetic, round-off error dominates. The sweet spot is typically h ≈ √(machine epsilon) ≈ 10⁻⁸ for double-precision calculations.",
      },
    ],
    visualizations: [
      {
        id: "DerivativeLimitExplorer",
        title: "Numerical convergence table",
        mathBridge:
          "Compare secant estimates for h = 1, 0.5, 0.1, 0.01 and see convergence toward dx/dt. The central difference column shows faster convergence.",
        caption: "Convergence quality is the evidence for the limit.",
      },
    ],
  },

  rigor: {
    title: "Instantaneous velocity is the derivative — formal statement",
    prose: [
      "Let x(t) be a position function. We say x is differentiable at t if the limit lim_{h→0} [x(t+h)−x(t)]/h exists as a finite real number. When this limit exists, it is called the derivative x'(t) = dx/dt, and we define the instantaneous velocity v(t) = x'(t).",
      "The definition requires one-sided limits to agree: lim_{h→0⁺} and lim_{h→0⁻} must both equal the same value. If they disagree, the derivative does not exist at that point — physically this corresponds to a sudden jump in velocity, which is impossible for a massive object (infinite force) but possible as an idealization (billiard-ball collisions).",
      "For x(t) = tⁿ, the derivative is directly computable from the definition using the binomial theorem: [x(t+h)−x(t)]/h = [(t+h)ⁿ − tⁿ]/h = ntⁿ⁻¹ + terms in h. As h → 0, only the first term survives, giving x'(t) = ntⁿ⁻¹. This is the power rule, proved from first principles. Differentiation rules (product, chain, quotient) are all theorems derived from this limit definition.",
    ],
    visualizationId: "KinematicsDerivativeProof",
    proofSteps: [
      {
        expression:
          "\\bar{v}(t,h) = \\frac{x(t+h)-x(t)}{h}",
        annotation: "Average velocity over finite interval [t, t+h]. This is the secant slope.",
      },
      {
        expression: "v(t) = \\lim_{h \\to 0} \\frac{x(t+h)-x(t)}{h}",
        annotation: "Instantaneous velocity: the limit as h → 0. Exists when the secant slope converges.",
      },
      {
        expression: "v(t) = x'(t) = \\frac{dx}{dt}",
        annotation: "This limit IS the derivative. Three notations for the same object.",
      },
      {
        expression: "\\text{Example: }x(t)=t^2 \\Rightarrow \\frac{(t+h)^2-t^2}{h}=\\frac{2th+h^2}{h}=2t+h\\to 2t",
        annotation: "Direct computation using algebra — the h cancels before h→0.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-007-ex1",
      title: "Find velocity by differentiating",
      problem:
        "Given x(t) = 3t² − 2t + 1 (meters), find the velocity function v(t) and the instantaneous velocity at t = 2 s.",
      steps: [
        {
          expression: "v(t) = \\frac{dx}{dt} = \\frac{d}{dt}[3t^2 - 2t + 1]",
          annotation: "Differentiate each term using the power rule.",
        },
        {
          expression: "v(t) = 6t - 2",
          annotation: "Result: the velocity is a linear function of time (constant acceleration).",
        },
        {
          expression: "v(2) = 6(2) - 2 = 10 \\text{ m/s}",
          annotation: "Evaluate at t = 2 s.",
        },
      ],
      conclusion:
        "Instantaneous velocity at t = 2 s is 10 m/s. The position function is quadratic (constant acceleration); its derivative is linear (constant-rate velocity change).",
    },
    {
      id: "ch2-007-ex2",
      title: "Limit from first principles",
      problem:
        "Compute v(t) for x(t) = t³ directly from the limit definition (without using the power rule).",
      steps: [
        {
          expression: "\\frac{x(t+h)-x(t)}{h} = \\frac{(t+h)^3 - t^3}{h}",
          annotation: "Set up the difference quotient.",
        },
        {
          expression: "= \\frac{t^3 + 3t^2h + 3th^2 + h^3 - t^3}{h}",
          annotation: "Expand (t+h)³ using the binomial theorem.",
        },
        {
          expression: "= \\frac{3t^2h + 3th^2 + h^3}{h} = 3t^2 + 3th + h^2",
          annotation: "Cancel h from numerator and denominator (h ≠ 0).",
        },
        {
          expression: "v(t) = \\lim_{h\\to 0}(3t^2 + 3th + h^2) = 3t^2",
          annotation: "Take the limit: the h terms vanish, leaving 3t².",
        },
      ],
      conclusion:
        "v(t) = 3t². This confirms the power rule: d/dt[t³] = 3t². The algebraic cancellation before taking the limit is the essential step.",
    },
  ],

  challenges: [
    {
      id: "ch2-007-ch1",
      difficulty: "medium",
      problem:
        "Given x(t) = t³, estimate v(1) numerically using h = 0.1 and compare with the exact answer.",
      hint: "Use the forward difference [x(1+h)−x(1)]/h, then compute the exact derivative.",
      walkthrough: [
        {
          expression: "\\frac{x(1.1)-x(1)}{0.1}=\\frac{1.331-1}{0.1}=3.31",
          annotation: "Forward difference estimate with h = 0.1.",
        },
        {
          expression: "v(t)=3t^2\\Rightarrow v(1)=3",
          annotation: "Exact instantaneous velocity by power rule.",
        },
      ],
      answer:
        "Estimate: 3.31. Exact: 3.0. Error ≈ 0.31, which is approximately 0.1 × 3 (because forward-difference error is O(h)). With h = 0.01, the estimate would be 3.0301, giving error 0.0301 ≈ 0.01 × 3.",
    },
    {
      id: "ch2-007-ch2",
      difficulty: "hard",
      problem:
        "An object's position is x(t) = sin(t). Find v(t) from the limit definition. (Hint: you will need sin(a+b) = sin(a)cos(b) + cos(a)sin(b), and the limits lim_{h→0} sin(h)/h = 1, lim_{h→0} [cos(h)−1]/h = 0.)",
      hint: "Expand sin(t+h) using the angle addition formula, then group terms.",
      answer:
        "v(t) = d/dt[sin(t)] = cos(t). Derivation: [sin(t+h)−sin(t)]/h = [sin(t)cos(h)+cos(t)sin(h)−sin(t)]/h = sin(t)·[cos(h)−1]/h + cos(t)·sin(h)/h → sin(t)·0 + cos(t)·1 = cos(t).",
    },
  ],
};
