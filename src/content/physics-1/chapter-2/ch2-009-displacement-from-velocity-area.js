export default {
  id: "ch2-009",
  slug: "displacement-from-velocity-area",
  chapter: 'p2',
  order: 9,
  title: "Displacement from Velocity Area",
  subtitle:
    "Why the area under a v–t curve gives exact displacement — the Fundamental Theorem of Calculus in physics.",
  tags: ["integration", "velocity", "area", "Riemann sum", "FTC", "fundamental theorem", "displacement"],
  aliases: "area under velocity graph integration displacement riemann sums fundamental theorem",

  hook: {
    question:
      "A car's velocity sensor records v(t) = 10 + 2t m/s (speeding up steadily). After 5 seconds, how far has the car traveled? You cannot use Δx = v·Δt directly because v is changing. What do you do?",
    realWorldContext:
      "Inertial navigation systems (INS) in aircraft, submarines, and spacecraft have no GPS signal — they rely entirely on onboard accelerometers. The accelerometers measure acceleration, which is integrated to get velocity, which is integrated again to get position. This double integration has been computing aircraft positions since before GPS existed. The accuracy of long-range flight depends on how precisely you can integrate a noisy sensor signal — the mathematical foundation is the definite integral, derived from the area-under-the-curve principle in this lesson.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      "When velocity is constant, displacement is trivial: Δx = v·Δt. On a v–t graph, this is the area of a rectangle (width = Δt, height = v). This works perfectly for constant velocity — but what about varying velocity?",
      "The key idea: divide the time interval into many small pieces, so small that velocity barely changes within each piece. Treat velocity as approximately constant on each piece, compute Δx ≈ v(tᵢ)·Δt for each, and add them all up. This gives an approximation to total displacement as a sum of rectangle areas. The more pieces you use, the better the approximation. In the limit of infinitely many, infinitely thin pieces, the approximation becomes exact — and the exact value is the definite integral.",
      "This is a Riemann sum: Δx ≈ Σᵢ v(tᵢ)·Δt. As the number of pieces n → ∞ (and Δt → 0), the Riemann sum converges to ∫v(t) dt. The area under the v–t curve IS the displacement, not approximately but exactly, because that area is defined as the limit of Riemann sums.",
      "The sign of area matters: when v > 0 (curve above t-axis), the object moves in the positive direction and area adds to displacement. When v < 0 (curve below t-axis), the object moves backward and area subtracts from displacement. Net displacement is the signed area. Total distance traveled is the unsigned area (take absolute value of each signed strip before summing).",
      "This lesson is where integration meets physics. If you are taking calculus simultaneously, you are learning the definite integral as an abstract area-under-a-curve. This lesson shows you the physical content of that integral: it is displacement. Every integral you compute in calculus has a potential physical meaning as area, displacement, volume, or accumulated quantity — velocity integration is just the clearest, most visceral example.",
    ],
    callouts: [
      {
        type: "intuition",
        title: "From Constant to Varying: The Riemann Sum Idea",
        body: "Constant v → Δx = v·Δt (rectangle area). Varying v → divide time into n pieces → v ≈ constant on each piece → Δxᵢ ≈ v(tᵢ)·Δt → sum: Δx ≈ Σ v(tᵢ)Δt. As n → ∞ (Δt → 0): Σ v(tᵢ)Δt → ∫v(t) dt = exact displacement. The rectangle sum IS the integral — in the limit.",
      },
      {
        type: "tip",
        title: "Calculus Connection: This IS the Definite Integral",
        body: "The Riemann sum Σ v(tᵢ)Δt converging to ∫v(t) dt is exactly how the definite integral is defined in Calculus Chapter 4. The area-under-a-curve interpretation in calculus IS displacement in kinematics. The Fundamental Theorem of Calculus (FTC) then says: since v = dx/dt, we have ∫v dt = x(t₂) − x(t₁) = Δx — the area equals the change in position, not because of physics, but because of the mathematical structure of derivatives and integrals being inverse operations.",
      },
      {
        type: "prior-knowledge",
        title: "Triangle and Trapezoid Areas (Algebra-Only Case)",
        body: "For piece-wise linear v–t graphs (including constant acceleration), you can compute exact displacement using geometry alone — no calculus: rectangle area = base × height; triangle area = ½ × base × height; trapezoid area = ½(top + bottom) × height. This is the algebraic approach. Calculus becomes necessary only when v(t) is nonlinear (curved) and you cannot compute the area by simple geometry.",
      },
      {
        type: "warning",
        title: "Displacement ≠ Total Distance",
        body: "Signed area (above axis +, below axis −) gives net displacement. Unsigned area (all positive) gives total distance traveled. If a car goes 30 m forward then 10 m backward, displacement = +20 m but distance = 40 m. Always identify which quantity the problem asks for before computing.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'Algebra works for constant acceleration',
        caption: 'When v(t) is a straight line, the area under it is exactly a trapezoid: ½(v₀+v)t. No calculus needed. Calculus becomes necessary only when v(t) is curved.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Calculus handles any v(t) curve',
        caption: 'Rectangles of height v(tᵢ) and width Δt accumulate displacement. In the limit Δt → 0 this sum IS the definite integral.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Riemann sum converges to exact integral',
        caption: `Increase the number of rectangles: each has height v(tᵢ) and width Δt. As n → ∞ (Δt → 0), the sum Σ v(tᵢ)Δt converges to the exact ∫v dt = displacement. The error in using n rectangles is approximately proportional to 1/n for left/right Riemann sums.`,
      },
    ],
  },

  math: {
    prose: [
      "For constant velocity: Δx = v·Δt (rectangle area — algebra only).",
      "For constant acceleration (linear v–t): use the trapezoid area = ½(v₀ + v)·Δt. This gives the SUVAT formula Δx = ½(v₀ + v)t. Alternatively, Δx = v₀t + ½at² (substituting v = v₀ + at). Both are exact for constant acceleration — derived by geometry, no calculus needed.",
      "For arbitrary v(t): Δx = ∫_{t₁}^{t₂} v(t) dt. Evaluate by finding an antiderivative V(t) (a function with V'(t) = v(t)) and computing V(t₂) − V(t₁). This is the FTC. For v(t) = 10 + 2t: antiderivative is V(t) = 10t + t². Displacement from 0 to 5 s: V(5) − V(0) = (50 + 25) − 0 = 75 m.",
      "For v(t) with direction reversal, split the integral at the zero-crossing. If v changes sign at t = tₛ, compute ∫_{t₁}^{tₛ} v dt + ∫_{tₛ}^{t₂} v dt separately. The first integral gives the forward displacement, the second gives the backward displacement. Their sum is net displacement; the sum of their absolute values is total distance.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Displacement integral",
        body: "\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt = V(t_2) - V(t_1) \\quad \\text{where } V'(t) = v(t)",
      },
      {
        type: "definition",
        title: "Constant-acceleration trapezoid rule (algebra)",
        body: "\\Delta x = \\frac{1}{2}(v_0 + v)\\,\\Delta t = v_0 t + \\frac{1}{2}at^2",
      },
      {
        type: "definition",
        title: "Total distance (vs displacement)",
        body: "\\text{Distance} = \\int_{t_1}^{t_2} |v(t)|\\,dt \\geq |\\Delta x|",
      },
      {
        type: "technique",
        title: "Finding Antiderivatives for Common v(t)",
        body: "\\int t^n\\,dt = \\frac{t^{n+1}}{n+1} + C, \\quad \\int \\sin(t)\\,dt = -\\cos(t)+C, \\quad \\int e^t\\,dt = e^t+C",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Signed area: displacement vs distance',
        caption: `Areas above the t-axis (v > 0) add to displacement. Areas below (v < 0) subtract. Net displacement = signed sum. Total distance = unsigned sum. When velocity reverses sign, the two diverge. Split the integral at zero-crossings of v to compute total distance.`,
      },
    ],
  },

  rigor: {
    title: "Area = displacement: the FTC in kinematic language",
    prose: [
      "The statement 'area under v–t gives displacement' is not a physical observation — it is a mathematical theorem. It follows directly from the Fundamental Theorem of Calculus (FTC Part 2).",
      "Statement: if v(t) is continuous on [t₁, t₂] and x(t) is any antiderivative of v(t) (meaning dx/dt = v(t)), then ∫_{t₁}^{t₂} v(t) dt = x(t₂) − x(t₁).",
      "Proof: v = dx/dt by definition of velocity. So x IS an antiderivative of v. By FTC Part 2, the definite integral of v over [t₁, t₂] equals [antiderivative evaluated at t₂] − [antiderivative evaluated at t₁] = x(t₂) − x(t₁) = Δx.",
      "The FTC Part 1 gives the inverse direction: if A(t) = ∫_{t₀}^{t} v(τ) dτ (accumulated area from t₀ to t), then dA/dt = v(t). The rate of change of accumulated displacement is velocity. This is obvious physically: the 'area counter' grows at rate v(t) at each moment, exactly as expected.",
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      {
        expression: "v(t) = \\frac{dx}{dt}",
        annotation: "Velocity is defined as the time-derivative of position.",
      },
      {
        expression: "\\therefore\\ x(t) \\text{ is an antiderivative of } v(t)",
        annotation: "x satisfies d/dt[x] = v, which is the definition of antiderivative.",
      },
      {
        expression: "\\int_{t_1}^{t_2} v(t)\\,dt = x(t_2) - x(t_1) \\qquad \\text{(FTC Part 2)}",
        annotation: "The definite integral of the derivative of x gives the net change in x.",
      },
      {
        expression: "x(t_2) - x(t_1) = \\Delta x",
        annotation: "Net change in position IS displacement. QED.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-009-ex1",
      title: "Piecewise constant velocity — algebra only",
      problem:
        "An object moves: v = +4 m/s for 3 s, then v = −2 m/s for 2 s. Find (a) net displacement, (b) total distance.",
      steps: [
        {
          expression: "\\Delta x_1 = v_1 \\cdot \\Delta t_1 = (+4)(3) = +12 \\text{ m}",
          annotation: "Rectangle area, above axis: forward motion.",
        },
        {
          expression: "\\Delta x_2 = v_2 \\cdot \\Delta t_2 = (-2)(2) = -4 \\text{ m}",
          annotation: "Rectangle area, below axis: backward motion.",
        },
        {
          expression: "\\Delta x_{net} = +12 + (-4) = +8 \\text{ m}",
          annotation: "Signed areas sum to net displacement.",
        },
        {
          expression: "d = |+12| + |-4| = 16 \\text{ m}",
          annotation: "Unsigned areas sum to total distance.",
        },
      ],
      conclusion:
        "Net displacement: +8 m. Total distance: 16 m. The object ends up 8 m from start but traveled a total path of 16 m.",
    },
    {
      id: "ch2-009-ex2",
      title: "Nonlinear velocity — calculus required",
      problem:
        "v(t) = 10 + 2t m/s. Find displacement from t = 0 to t = 5 s.",
      steps: [
        {
          expression: "\\Delta x = \\int_0^5 (10 + 2t)\\,dt",
          annotation: "Set up the definite integral — cannot use geometry (v–t is linear but we need area under a non-horizontal line).",
        },
        {
          expression: "= \\left[10t + t^2\\right]_0^5",
          annotation: "Antiderivative: ∫(10 + 2t)dt = 10t + t² (power rule).",
        },
        {
          expression: "= (10(5) + 5^2) - (0) = 50 + 25 = 75 \\text{ m}",
          annotation: "Evaluate at limits and subtract.",
        },
      ],
      conclusion:
        "The car travels 75 m in 5 seconds. You can verify: average velocity = (v(0) + v(5))/2 = (10 + 20)/2 = 15 m/s; distance = 15 × 5 = 75 m ✓ (trapezoid area = ½(10+20)(5) = 75 ✓).",
    },
  ],

  challenges: [
    {
      id: "ch2-009-ch1",
      difficulty: "medium",
      problem:
        "Can total distance exceed |net displacement| on the same v–t graph? Give a concrete example.",
      hint: "Think about what happens when the velocity crosses zero (direction reversal).",
      answer:
        "Yes. Example: v = +5 m/s for 2 s, then v = −5 m/s for 2 s. Net displacement = 0 m (the object returns to start). Total distance = 10 + 10 = 20 m. On the v–t graph, the positive area and negative area cancel for displacement but add for distance.",
    },
    {
      id: "ch2-009-ch2",
      difficulty: "hard",
      problem:
        "v(t) = t² − 4t + 3 m/s. Find (a) when the object is stopped, (b) net displacement from t = 0 to t = 3, (c) total distance traveled from t = 0 to t = 3.",
      hint: "Factor v(t) to find zero crossings. Split the integral at those points for distance.",
      answer:
        "v(t) = (t−1)(t−3). Stopped at t = 1 and t = 3. (a) t = 1 s and t = 3 s. (b) Δx = ∫₀³ (t²−4t+3) dt = [t³/3 − 2t² + 3t]₀³ = (9−18+9) − 0 = 0 m. (c) v > 0 on [0,1], v < 0 on [1,3]. Forward: ∫₀¹(t²−4t+3)dt = [t³/3−2t²+3t]₀¹ = 1/3−2+3 = 4/3 m. Backward: |∫₁³ (t²−4t+3)dt| = |[t³/3−2t²+3t]₁³| = |0 − 4/3| = 4/3 m. Total distance = 4/3 + 4/3 = 8/3 ≈ 2.67 m.",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Displacement from Velocity Area`,
    description: `Use scipy.integrate to compute exact displacement from v(t), compute Riemann sums and compare to the exact integral, and handle direction reversals.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Area under v(t): from Riemann sums to exact integrals',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Exact integral: v(t) = 10 + 2t',
              prose: `Compute displacement from t=0 to t=5 using scipy.integrate.quad and verify with the antiderivative.`,
              code: [
                `from scipy.integrate import quad`,
                `import numpy as np`,
                ``,
                `def v(t): return 10 + 2*t`,
                ``,
                `# Exact integral`,
                `dx, err = quad(v, 0, 5)`,
                `print(f"Displacement = {dx:.4f} m  (error < {err:.2e})")`,
                ``,
                `# Verify with antiderivative V(t) = 10t + t²`,
                `V = lambda t: 10*t + t**2`,
                `dx_antideriv = V(5) - V(0)`,
                `print(f"Antiderivative: V(5) - V(0) = {dx_antideriv} m")`,
                `print(f"Both agree: {np.isclose(dx, dx_antideriv)}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Riemann sum convergence',
              prose: `Show that the Riemann sum approaches the exact answer as n → ∞.`,
              code: [
                `import matplotlib.pyplot as plt`,
                ``,
                `exact = 75.0   # ∫₀⁵ (10+2t) dt = 75`,
                ``,
                `ns = [2, 5, 10, 50, 100, 500]`,
                `errors = []`,
                `for n in ns:`,
                `    t_arr = np.linspace(0, 5, n+1)`,
                `    dt = t_arr[1] - t_arr[0]`,
                `    riemann = sum(v(t_arr[i]) * dt for i in range(n))   # left Riemann`,
                `    errors.append(abs(riemann - exact))`,
                ``,
                `plt.loglog(ns, errors, 'bo-', linewidth=2)`,
                `plt.xlabel('Number of rectangles (n)')`,
                `plt.ylabel('|Error| (m)')`,
                `plt.title('Riemann sum convergence')`,
                `plt.grid(True, which='both', alpha=0.4)`,
                `plt.savefig('riemann_convergence.png', dpi=100, bbox_inches='tight')`,
                `plt.show()`,
                `print(f"Error at n=500: {errors[-1]:.4f} m")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Direction reversal: displacement vs distance',
              prose: `For v(t) = t² − 4t + 3, find net displacement and total distance over [0, 3].`,
              code: [
                `from scipy.integrate import quad`,
                ``,
                `def v2(t): return t**2 - 4*t + 3`,
                ``,
                `# Net displacement (signed integral)`,
                `dx_net, _ = quad(v2, 0, 3)`,
                `print(f"Net displacement: {dx_net:.6f} m  (expected: 0)")`,
                ``,
                `# Total distance: split at zero crossings t=1 and t=3`,
                `d1, _ = quad(v2, 0, 1)   # v > 0 here`,
                `d2, _ = quad(v2, 1, 3)   # v < 0 here`,
                `total_dist = abs(d1) + abs(d2)`,
                `print(f"Total distance : {total_dist:.4f} m  (expected: {8/3:.4f})")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — find zero crossings and compute total distance',
              prose: `For v(t) = sin(2t), find all zero crossings on [0, 2π] and compute total distance.`,
              code: [
                `from scipy.integrate import quad`,
                `from scipy.optimize import brentq`,
                `import numpy as np`,
                ``,
                `def v3(t): return np.sin(2*t)`,
                ``,
                `# TODO: find all zero crossings on [0, 2π]`,
                `# Then sum |∫ v3 dt| over each sub-interval`,
                `# Expected total distance: 4 m (4 quarter-cycles of unit amplitude)`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Total distance for sinusoidal velocity',
              difficulty: 'hard',
              prompt: `Find all zero crossings of v(t) = sin(2t) on [0, 2π] and sum the absolute areas of each piece.`,
              starterBlock: ``,
              testCode: [
                `crossings = [0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi]`,
                `total = sum(abs(quad(v3, crossings[i], crossings[i+1])[0]) for i in range(len(crossings)-1))`,
                `assert abs(total - 4.0) < 0.01, f"Expected 4.0, got {total:.4f}"`,
                `print(f"Total distance: {total:.4f} m  ✓")`,
              ].join('\n'),
              hint: `Zero crossings of sin(2t) on [0, 2π]: t = 0, π/2, π, 3π/2, 2π. The integral of |sin(2t)| over each half-period equals 1. Four half-periods × 1 = 4.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-009-q1',
      question: `A Riemann sum $\\sum_i v(t_i)\\Delta t$ represents:`,
      options: [
        `The exact derivative of v(t)`,
        `An approximation to displacement that improves as $\\Delta t \\to 0$`,
        `The average velocity`,
        `The acceleration`,
      ],
      answer: 1,
      explanation: `Each term $v(t_i)\\Delta t$ is the area of one rectangle. Their sum approximates the total area under v–t = displacement. As $n \\to \\infty$ (Δt → 0), the Riemann sum converges to the exact integral $\\int v\\,dt$.`,
    },
    {
      id: 'p1-ch2-009-q2',
      question: `For v(t) = 10 + 2t, displacement from t = 0 to t = 5 s is:`,
      options: [`50 m`, `75 m`, `100 m`, `25 m`],
      answer: 1,
      explanation: `$\\Delta x = \\int_0^5 (10+2t)\\,dt = [10t+t^2]_0^5 = (50+25) - 0 = 75$ m.`,
    },
    {
      id: 'p1-ch2-009-q3',
      question: `For v(t) = +5 m/s for 2 s, then −5 m/s for 2 s, the net displacement is:`,
      options: [`20 m`, `0 m`, `10 m`, `−10 m`],
      answer: 1,
      explanation: `Signed areas: $+5(2) + (-5)(2) = 10 - 10 = 0$ m. The object returns to its start position.`,
    },
    {
      id: 'p1-ch2-009-q4',
      question: `For the same problem (v = +5 for 2 s, then −5 for 2 s), what is the total distance traveled?`,
      options: [`0 m`, `10 m`, `20 m`, `5 m`],
      answer: 2,
      explanation: `Total distance = sum of absolute areas = $|10| + |-10| = 20$ m. The object moved 10 m forward then 10 m backward.`,
    },
    {
      id: 'p1-ch2-009-q5',
      question: `The formula $\\Delta x = \\int_{t_1}^{t_2} v\\,dt = V(t_2) - V(t_1)$ (where $V'=v$) is a statement of:`,
      options: [
        `Newton's second law`,
        `The SUVAT equations`,
        `The Fundamental Theorem of Calculus`,
        `The work–energy theorem`,
      ],
      answer: 2,
      explanation: `This is FTC Part 2: the definite integral of a function equals the antiderivative evaluated at the limits. Since $v = dx/dt$, position $x$ is an antiderivative of $v$, and the area under $v$ gives $\\Delta x$.`,
    },
    {
      id: 'p1-ch2-009-q6',
      question: `To find total distance (not displacement) when v changes sign, you should:`,
      options: [
        `Integrate v normally over the whole interval`,
        `Split the integral at each zero crossing of v and sum the absolute values of each piece`,
        `Take the absolute value of the whole integral`,
        `Multiply displacement by 2`,
      ],
      answer: 1,
      explanation: `Splitting at zero crossings separates forward and backward phases. The absolute value of each piece gives distance for that phase. Sum them for total distance. $|\\int v\\,dt|$ gives something different from $\\int|v|\\,dt$ when v changes sign.`,
    },
    {
      id: 'p1-ch2-009-q7',
      question: `For constant velocity $v_0$, displacement over time $t$ is:`,
      options: [
        `$v_0^2 t$`,
        `$v_0 t$ (rectangle area on v–t graph)`,
        `$\\tfrac{1}{2}v_0 t$`,
        `$v_0 / t$`,
      ],
      answer: 1,
      explanation: `The v–t graph is a horizontal line at height $v_0$. The area of the rectangle = base × height = $t \\times v_0$. This is both the geometric and algebraic answer.`,
    },
    {
      id: 'p1-ch2-009-q8',
      question: `For piece-wise linear v(t) (constant acceleration), displacement can be computed:`,
      options: [
        `Only with calculus`,
        `Using geometry alone (trapezoid/triangle areas)`,
        `Only using SUVAT equations`,
        `It cannot be computed exactly`,
      ],
      answer: 1,
      explanation: `When v(t) is a straight line, the area is a trapezoid (or triangle): $\\Delta x = \\tfrac{1}{2}(v_0+v)t$. Calculus gives the same answer but is not required — pure geometry suffices for piece-wise linear v(t).`,
    },
  ],
};
