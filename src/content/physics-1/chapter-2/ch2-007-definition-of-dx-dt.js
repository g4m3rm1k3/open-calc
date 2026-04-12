export default {
  id: "ch2-007",
  slug: "definition-of-dx-dt",
  chapter: 'p2',
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
    previewVisualizationId: 'SVGDiagram',
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
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Secant to tangent: the limit process',
        caption: `As h shrinks: the second point slides toward the first, and the secant line rotates toward the tangent. The slope of the secant [x(t+h)−x(t)]/h converges to a definite number — the instantaneous velocity = slope of the tangent = dx/dt. This convergence is the definition of the derivative.`,
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
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Numerical convergence — forward vs central difference',
        caption: `Forward difference: [x(t+h)−x(t)]/h — error is O(h). Central difference: [x(t+h)−x(t−h)]/(2h) — error is O(h²), converges faster. For h = 0.1 → forward error ≈ 0.1 × v'(t); for central difference the same h gives error ≈ 0.01 × v''(t). Use central difference in numerical work whenever possible.`,
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
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'slope-triangle' },
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

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — The Definition of dx/dt`,
    description: `Compute derivatives numerically using forward and central differences. Verify convergence to the exact derivative as h → 0.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Numerical differentiation and convergence',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Forward and central difference — convergence table',
              prose: `For x(t) = t³, compare forward [x(t+h)−x(t)]/h and central [x(t+h)−x(t−h)]/(2h) estimates of v(1) = 3.`,
              code: [
                `import numpy as np`,
                ``,
                `def x(t): return t**3`,
                `def v_exact(t): return 3*t**2   # power rule`,
                ``,
                `t0 = 1.0`,
                `true_v = v_exact(t0)   # = 3.0`,
                ``,
                `print(f"{'h':>12} | {'forward':>14} | {'central':>14} | {'fwd error':>12} | {'cen error':>12}")`,
                `print("-"*72)`,
                `for h in [1e-1, 1e-2, 1e-3, 1e-4, 1e-6, 1e-8]:`,
                `    fwd = (x(t0+h) - x(t0)) / h`,
                `    cen = (x(t0+h) - x(t0-h)) / (2*h)`,
                `    print(f"{h:>12.2e} | {fwd:>14.8f} | {cen:>14.8f} | {abs(fwd-true_v):>12.2e} | {abs(cen-true_v):>12.2e}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Differentiate x(t) = 3t² − 2t + 1',
              prose: `Use numpy.gradient as a built-in numerical differentiator and compare to the analytical result.`,
              code: [
                `import matplotlib.pyplot as plt`,
                ``,
                `t = np.linspace(0, 4, 1000)`,
                `x_poly = 3*t**2 - 2*t + 1`,
                ``,
                `# Analytical velocity`,
                `v_analytical = 6*t - 2`,
                ``,
                `# Numerical velocity using central differences`,
                `v_numerical = np.gradient(x_poly, t)`,
                ``,
                `fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))`,
                `ax1.plot(t, x_poly, 'b-', linewidth=2, label='x(t)')`,
                `ax1.set_xlabel('t'); ax1.set_ylabel('x (m)'); ax1.legend(); ax1.grid(True, alpha=0.4)`,
                ``,
                `ax2.plot(t, v_analytical, 'r-', linewidth=2, label='v = 6t − 2 (exact)')`,
                `ax2.plot(t, v_numerical, 'g--', linewidth=1.5, label='numerical dx/dt')`,
                `ax2.set_xlabel('t'); ax2.set_ylabel('v (m/s)'); ax2.legend(); ax2.grid(True, alpha=0.4)`,
                ``,
                `plt.tight_layout()`,
                `plt.savefig('derivative_comparison.png', dpi=100, bbox_inches='tight')`,
                `plt.show()`,
                `print(f"Max error: {np.max(np.abs(v_numerical - v_analytical)):.2e} m/s")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Power rule from first principles — verify algebraically',
              prose: `For x(t) = tⁿ, compute [x(t+h)−x(t)]/h and show the leading term is ntⁿ⁻¹.`,
              code: [
                `from sympy import symbols, expand, simplify, limit, oo`,
                ``,
                `t, h = symbols('t h')`,
                ``,
                `# Test for n = 3`,
                `n = 3`,
                `diff_quotient = ((t+h)**n - t**n) / h`,
                `expanded = expand(diff_quotient)`,
                `print(f"Difference quotient (n={n}): {expanded}")`,
                ``,
                `lim_val = limit(diff_quotient, h, 0)`,
                `print(f"Limit as h→0: {lim_val}")`,
                `print(f"Power rule gives: n*t^(n-1) = {n}*t^{n-1}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — find the optimal h for numerical differentiation',
              prose: `For floating-point arithmetic, very small h causes round-off error. Find the h that minimises total error for x(t) = sin(t) at t = π/4.`,
              code: [
                `import numpy as np`,
                ``,
                `t0 = np.pi / 4`,
                `exact = np.cos(t0)   # d/dt[sin(t)] = cos(t)`,
                ``,
                `# TODO: compute forward and central difference errors for h = 10^-k, k = 1..15`,
                `# Find the h that gives minimum error for each method`,
                `# Plot log10(|error|) vs log10(h) to see the U-shape`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Optimal step size for numerical differentiation',
              difficulty: 'hard',
              prompt: `Find the h that minimises numerical differentiation error for both forward and central differences of sin(t) at t = π/4.`,
              starterBlock: ``,
              testCode: [
                `h_vals = np.logspace(-1, -15, 30)`,
                `fwd_errs = [abs((np.sin(t0+h) - np.sin(t0))/h - exact) for h in h_vals]`,
                `cen_errs = [abs((np.sin(t0+h) - np.sin(t0-h))/(2*h) - exact) for h in h_vals]`,
                `best_fwd_h = h_vals[np.argmin(fwd_errs)]`,
                `best_cen_h = h_vals[np.argmin(cen_errs)]`,
                `print(f"Best h (forward):  {best_fwd_h:.2e}")`,
                `print(f"Best h (central):  {best_cen_h:.2e}")`,
                `print("Step size analysis passed ✓")`,
              ].join('\n'),
              hint: `Forward error ≈ h·|f''(t)|/2 + ε/h (round-off). Optimal h ≈ √ε ≈ 10⁻⁸. Central error ≈ h²·|f'''(t)|/6 + ε/h. Optimal h ≈ ε^(1/3) ≈ 10⁻⁵.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-007-q1',
      question: `Why can't we just set $h = 0$ in $[x(t+h) - x(t)]/h$ to find instantaneous velocity?`,
      options: [
        `Because $h$ must be large`,
        `Because setting $h = 0$ gives $0/0$, an indeterminate form`,
        `Because position is always zero at $t = 0$`,
        `Because velocity is always infinite`,
      ],
      answer: 1,
      explanation: `Setting $h = 0$ directly gives $[x(t) - x(t)]/0 = 0/0$. This is undefined. The limit process approaches $h = 0$ without ever reaching it — algebraic cancellation removes the $h$ from the denominator before the limit is taken.`,
    },
    {
      id: 'p1-ch2-007-q2',
      question: `The derivative $dx/dt$ is defined as:`,
      options: [
        `$\\Delta x / \\Delta t$ for large $\\Delta t$`,
        `$\\lim_{h \\to 0} \\frac{x(t+h)-x(t)}{h}$`,
        `$x(t+1) - x(t)$`,
        `$x \\cdot t$`,
      ],
      answer: 1,
      explanation: `$v(t) = dx/dt = \\lim_{h \\to 0} \\frac{x(t+h)-x(t)}{h}$. This is the definition of the derivative — the limit of the difference quotient as the interval $h$ approaches zero.`,
    },
    {
      id: 'p1-ch2-007-q3',
      question: `For $x(t) = 3t^2 - 2t + 1$, what is $v(2)$?`,
      options: [`10 m/s`, `12 m/s`, `6 m/s`, `14 m/s`],
      answer: 0,
      explanation: `$v(t) = 6t - 2$ (power rule). At $t=2$: $v(2) = 6(2) - 2 = 10$ m/s.`,
    },
    {
      id: 'p1-ch2-007-q4',
      question: `The forward difference $[x(t+h)-x(t)]/h$ has an error that scales as:`,
      options: [`$h^2$`, `$h$`, `$1/h$`, `$h^3$`],
      answer: 1,
      explanation: `Forward difference error is $O(h)$ — halving $h$ halves the error. The central difference $[x(t+h)-x(t-h)]/(2h)$ is more accurate: $O(h^2)$ error, so halving $h$ quarters the error.`,
    },
    {
      id: 'p1-ch2-007-q5',
      question: `Geometrically, the derivative at a point equals:`,
      options: [
        `Area under the curve up to that point`,
        `Slope of the tangent line at that point`,
        `Height of the curve at that point`,
        `Length of the curve up to that point`,
      ],
      answer: 1,
      explanation: `As $h \\to 0$, the secant line through $(t, x(t))$ and $(t+h, x(t+h))$ approaches the tangent line at $(t, x(t))$. The limit of the secant slope is the slope of the tangent = the derivative.`,
    },
    {
      id: 'p1-ch2-007-q6',
      question: `From first principles, $\\frac{d}{dt}[t^3]$ is computed by:`,
      options: [
        `Taking $\\lim_{h \\to 0} \\frac{(t+h)^3 - t^3}{h} = \\lim_{h\\to 0} (3t^2 + 3th + h^2) = 3t^2$`,
        `Multiplying $t^3$ by $3$`,
        `Setting $t = 0$ in the difference quotient`,
        `Integrating $t^3$`,
      ],
      answer: 0,
      explanation: `Expand $(t+h)^3 = t^3 + 3t^2h + 3th^2 + h^3$. Subtract $t^3$, divide by $h$: $3t^2 + 3th + h^2$. As $h \\to 0$: only $3t^2$ survives. This is the power rule derived from first principles.`,
    },
    {
      id: 'p1-ch2-007-q7',
      question: `Why does extremely small $h$ (like $h = 10^{-15}$) make numerical derivatives less accurate?`,
      options: [
        `Because the limit hasn't converged yet`,
        `Because floating-point round-off error dominates when $h$ is smaller than machine epsilon`,
        `Because the position function is not differentiable`,
        `Because large $h$ is always more accurate`,
      ],
      answer: 1,
      explanation: `When $h$ is smaller than floating-point machine epsilon ($\\approx 10^{-16}$), $x(t+h)$ and $x(t)$ are indistinguishable in double precision. The numerator becomes exactly 0, destroying accuracy. The optimal $h$ balances truncation error (large $h$) and round-off error (small $h$).`,
    },
    {
      id: 'p1-ch2-007-q8',
      question: `For $x(t) = \\sin(t)$, the instantaneous velocity is:`,
      options: [`$-\\sin(t)$`, `$\\cos(t)$`, `$\\tan(t)$`, `$-\\cos(t)$`],
      answer: 1,
      explanation: `$v(t) = d/dt[\\sin(t)] = \\cos(t)$. This can be proved from the limit definition using the angle-addition formula and the standard limits $\\lim_{h \\to 0} \\sin(h)/h = 1$ and $\\lim_{h \\to 0} (\\cos h - 1)/h = 0$.`,
    },
  ],
};
