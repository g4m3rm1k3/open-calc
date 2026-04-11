export default {
  id: "ch2-004",
  slug: "velocity-graph-analysis",
  chapter: 'p2',
  order: 4,
  title: "Velocity-Time Graph Analysis",
  subtitle:
    "On a v–t graph, slope gives acceleration and signed area gives displacement.",
  tags: ["velocity graph", "area", "acceleration", "displacement", "integration", "fundamental theorem"],
  aliases: "v t graph area displacement acceleration",

  hook: {
    question:
      "A car is moving at 20 m/s and braking hard. Its velocity decreases steadily to zero over 4 seconds. How far does it travel while braking? You have a v–t graph — but no position data at all. Can you find the distance from velocity alone?",
    realWorldContext:
      "Brake testing, landing distance calculations, and elevator control all rely on computing displacement from velocity profiles. Crash reconstructionists use v–t graphs — not x–t graphs — because velocity data is easier to measure from impact sensors and black boxes. The area under the v–t curve tells you exactly how far the object moved, without ever knowing where it started.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      "A v–t graph tells you how fast an object is moving at every moment in time. The height of the curve at any time gives the instantaneous velocity at that moment: up means moving in the positive direction, down means moving in the negative direction, crossing zero means reversing direction.",
      "The most powerful thing you can read from a v–t graph is displacement — not by looking at height, but by looking at area. The signed area between the curve and the time-axis, over any interval, equals the displacement during that interval. This is the fundamental bridge between velocity and position: area under v–t gives Δx, just as slope on x–t gave velocity.",
      "Why area? Think about what happens when velocity is constant. If you travel at 10 m/s for 4 seconds, your displacement is 10 × 4 = 40 m. On a v–t graph, this is a horizontal line at height 10 over a width of 4 — a rectangle with area 10 × 4 = 40. Displacement IS area when velocity is constant. For varying velocity, the area rule still holds, but the 'area' is under a curve — this is exactly what an integral measures.",
      "The slope of the v–t curve tells you acceleration. Just as velocity was the slope of x–t, acceleration is the slope of v–t. Positive slope (velocity increasing) means positive acceleration. Negative slope (velocity decreasing) means the object is decelerating — it could still be moving forward, but slowing down. Flat slope (constant velocity) means zero acceleration.",
      "An important distinction: speed is the magnitude of velocity, not velocity itself. If a car moves backward at 15 m/s, its velocity is −15 m/s but its speed is 15 m/s. The signed area under v–t gives displacement (which can be negative); the unsigned area (treating all area as positive) gives total distance traveled. These are different things when the object reverses direction.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "Area of Simple Shapes",
        body: "For a v–t graph made of straight-line segments, area is always a sum of rectangles and triangles: area of rectangle = base × height; area of triangle = ½ × base × height. You can compute displacement exactly from piece-wise linear v–t graphs using just this algebra — no calculus required.",
      },
      {
        type: "intuition",
        title: "Two Ways to Read a v–t Graph",
        body: "SLOPE of v–t → acceleration (how fast velocity is changing). AREA under v–t → displacement (how far the object moved). These are opposite operations: slope is differentiation, area is integration. The v–t graph is where the entire story of kinematics lives.",
      },
      {
        type: "tip",
        title: "Calculus Connection: Area → Integral",
        body: "The area under a v–t curve is a definite integral: Δx = ∫v(t) dt. When velocity is not constant, you cannot compute this area exactly without calculus. Riemann sums (from Calculus Chapter 4) formalize this: divide time into tiny intervals, approximate velocity as constant on each, sum the rectangles, take the limit. The exact area is the integral. The Fundamental Theorem of Calculus is what guarantees that anti-differentiation gives the exact area — so ∫v dt = x(t) + C.",
      },
      {
        type: "warning",
        title: "Displacement ≠ Distance",
        body: "If an object goes forward 20 m then backward 8 m, its displacement is +12 m but its total distance traveled is 28 m. On a v–t graph: positive area (v > 0) adds to displacement; negative area (v < 0) subtracts from displacement. To find total distance, take the absolute value of each signed area and sum them. This distinction matters in problems about 'how far did the object travel' vs 'where did it end up'.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-rectangle' },
        title: 'Step 1 — constant velocity (algebra)',
        caption: 'If velocity is constant, displacement = v × Δt. This is rectangle area. Pure algebra — no calculus needed.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'Step 2 — constant acceleration (algebra)',
        caption: 'If velocity changes linearly (constant a), displacement = ½(v₀+v)t — the trapezoid area. Still algebra. This is SUVAT equation 2.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Step 3 — any v(t) curve (calculus)',
        caption: 'Each rectangle has height v(tᵢ) and width Δt. Their total area approximates displacement. More rectangles → exact integral.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Signed area under v–t equals displacement',
        caption: `Area above the time-axis (v > 0) is positive displacement. Area below (v < 0) is negative displacement. Net displacement = signed total area. Distance traveled = unsigned total area. When velocity crosses zero (direction reversal), the two diverge.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'riemann-rect' },
        title: 'Displacement vs distance — the sign matters',
        caption: `The Riemann sum view: each rectangle has height v(tᵢ) and width Δt. Positive rectangles add to displacement; negative rectangles subtract. Summing absolute values gives distance. As Δt → 0, the sum converges to ∫v dt = Δx.`,
      },
    ],
  },

  math: {
    prose: [
      "For a piece-wise linear v–t graph, compute displacement as a sum of triangle and rectangle areas. Each segment is a trapezoid (or special case: rectangle if velocity is constant, triangle if it starts or ends at zero). Sum the signed areas, taking areas above the time-axis as positive and areas below as negative.",
      "For constant acceleration, v(t) = v₀ + at is a straight line on the v–t graph. The area under this line over [0, t] is the area of a trapezoid: Δx = ½(v₀ + v)t. This is one of the SUVAT equations derived purely geometrically, no calculus needed. Substituting v = v₀ + at gives Δx = v₀t + ½at², the quadratic kinematic formula.",
      "For non-constant acceleration, you cannot compute the area exactly by geometry alone. You must integrate: Δx = ∫v(t) dt. In calculus terms, position is the anti-derivative of velocity: if you know v(t), integrate to get x(t). Acceleration is the derivative of velocity: a(t) = dv/dt. These three quantities — x, v, a — are linked by differentiation and integration in an unbroken chain.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Displacement from velocity",
        body: "\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt",
      },
      {
        type: "definition",
        title: "Acceleration from velocity",
        body: "a(t) = \\frac{dv}{dt}",
      },
      {
        type: "definition",
        title: "SUVAT from area (constant a)",
        body: "\\Delta x = \\frac{1}{2}(v_0 + v)\\,t = v_0 t + \\frac{1}{2}at^2",
      },
      {
        type: "technique",
        title: "Algebra-Only Area Method",
        body: "Step 1: Identify linear segments on the v–t graph. Step 2: For each segment, find area = ½(v₁ + v₂)(t₂ − t₁) (trapezoid rule). Step 3: Assign sign: + if above t-axis (forward motion), − if below (backward motion). Step 4: Sum all signed areas → displacement.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-trapezoid' },
        title: 'From graph area to SUVAT equation',
        caption: `When acceleration is constant, the v–t graph is a straight line — the area under it is a trapezoid: Δx = ½(v₀+v)t. This is SUVAT equation 2, derived geometrically. Substituting v = v₀+at gives the quadratic Δx = v₀t + ½at² (equation 3). Graph area and SUVAT always agree.`,
      },
    ],
  },

  rigor: {
    title: "Why area gives displacement — the Fundamental Theorem of Calculus",
    prose: [
      "The area-under-v-gives-Δx rule is not a coincidence or a useful trick — it is a consequence of the Fundamental Theorem of Calculus (FTC). The FTC states: if F is an antiderivative of f (meaning F'(t) = f(t)), then ∫_{a}^{b} f(t) dt = F(b) − F(a).",
      "In kinematics: velocity v(t) is the derivative of position x(t). So x(t) is an antiderivative of v(t). By the FTC, ∫_{t_1}^{t_2} v(t) dt = x(t₂) − x(t₁) = Δx. The area under v–t is displacement because position is the antiderivative of velocity — and the FTC converts antiderivatives into definite integrals (areas). This is why differentiation and integration are inverse operations.",
      "For a formal derivation, Riemann sums make the connection explicit: divide [t₁, t₂] into n equal subintervals of width Δt. On each subinterval, approximate velocity as constant at v(tₖ). Displacement contribution from each piece ≈ v(tₖ)·Δt. Total displacement ≈ Σ v(tₖ)Δt. As n → ∞ (Δt → 0), this Riemann sum converges to the definite integral ∫v dt. This is exactly how integrals are defined in Calculus Chapter 4.",
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      {
        expression: "a(t) = \\frac{dv}{dt}",
        annotation: "Acceleration is the derivative of velocity (slope of v–t).",
      },
      {
        expression: "v(t) = \\frac{dx}{dt}",
        annotation: "Velocity is the derivative of position (slope of x–t).",
      },
      {
        expression: "\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt",
        annotation: "By FTC: since v = dx/dt, the antiderivative of v is x, so the definite integral gives Δx.",
      },
      {
        expression: "\\Delta v = \\int_{t_1}^{t_2} a(t)\\,dt",
        annotation: "Applying the same logic one level up: area under a–t gives Δv.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-004-ex1",
      title: "Triangular area — braking car",
      problem:
        "A car decelerates uniformly from v = 20 m/s to v = 0 over 4 seconds. Find displacement during braking.",
      steps: [
        {
          expression:
            "\\text{Shape: right triangle with base } \\Delta t = 4\\text{ s, height } v_0 = 20\\text{ m/s}",
          annotation: "Velocity decreases linearly: straight line from 20 to 0 on v–t.",
        },
        {
          expression: "\\Delta x = \\frac{1}{2}(4)(20) = 40\\text{ m}",
          annotation: "Area of triangle = ½ × base × height.",
        },
      ],
      conclusion:
        "The car travels 40 m while braking. You can verify: v = 0, v₀ = 20, t = 4 → Δx = ½(v₀+v)t = ½(20)(4) = 40 m. ✓",
    },
    {
      id: "ch2-004-ex2",
      title: "Displacement with direction reversal",
      problem:
        "v–t graph shows: v = +6 m/s for 3 s (forward), then v = −4 m/s for 2 s (backward). Find (a) net displacement and (b) total distance.",
      steps: [
        {
          expression: "\\text{Area}_1 = (+6)(3) = +18\\text{ m}",
          annotation: "Forward phase: rectangle above the time-axis.",
        },
        {
          expression: "\\text{Area}_2 = (-4)(2) = -8\\text{ m}",
          annotation: "Backward phase: rectangle below the time-axis.",
        },
        {
          expression: "\\Delta x = +18 + (-8) = +10\\text{ m (net displacement)}",
          annotation: "Signed areas sum to net displacement.",
        },
        {
          expression: "d = 18 + 8 = 26\\text{ m (total distance)}",
          annotation: "Unsigned areas sum to total distance traveled.",
        },
      ],
      conclusion:
        "Net displacement = +10 m (10 m in the positive direction from start). Total distance = 26 m.",
    },
  ],

  challenges: [
    {
      id: "ch2-004-ch1",
      difficulty: "medium",
      problem: "If v is positive but decreasing, what is the sign of a, and is the object speeding up or slowing down?",
      hint: "Look at the slope of v–t.",
      answer:
        "a is negative (slope of v–t is negative: velocity decreasing). The object is moving in the positive direction (v > 0) but slowing down — velocity and acceleration have opposite signs, so speed decreases.",
    },
    {
      id: "ch2-004-ch2",
      difficulty: "hard",
      problem:
        "A v–t graph shows a quarter-circle of radius 10: v(t) = √(100 - t²) for t ∈ [0, 10]. Find the exact displacement. (Hint: area of a quarter circle.)",
      hint: "The area under this curve is the area of a quarter-disk of radius 10.",
      answer:
        "Δx = ∫₀¹⁰ √(100 - t²) dt = ¼ π(10)² = 25π ≈ 78.5 m. This requires calculus (trigonometric substitution or geometry: area of a quarter circle).",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Velocity–Time Graph Analysis`,
    description: `Compute displacement and distance from v–t data using signed areas (trapezoidal rule), and visualise the difference between net displacement and total distance.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Area under v–t: displacement vs distance',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Braking car — triangular area',
              prose: `A car decelerates from 20 m/s to 0 over 4 s. The v–t graph is a straight line forming a right triangle.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `# Braking: linear velocity from 20 → 0 over 4 s`,
                `t = np.linspace(0, 4, 100)`,
                `v = 20 - 5*t   # v(t) = 20 - 5t`,
                ``,
                `# Area = displacement (trapezoid rule = exact here since v is linear)`,
                `dx = np.trapz(v, t)`,
                `print(f"Displacement (area) = {dx:.1f} m")`,
                `print(f"Expected: ½ × 4 × 20 = {0.5*4*20} m")`,
                ``,
                `plt.figure(figsize=(7, 4))`,
                `plt.fill_between(t, v, alpha=0.3, color='blue', label=f'Area = {dx:.1f} m')`,
                `plt.plot(t, v, 'b-', linewidth=2)`,
                `plt.xlabel('Time (s)'); plt.ylabel('Velocity (m/s)')`,
                `plt.title('v–t graph: braking car'); plt.legend(); plt.grid(True, alpha=0.4)`,
                `plt.savefig('vt_braking.png', dpi=100, bbox_inches='tight')`,
                `plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Direction reversal — displacement ≠ distance',
              prose: `When velocity changes sign, displacement and distance diverge.`,
              code: [
                `# Phase 1: v = +6 m/s for 3 s (forward)`,
                `# Phase 2: v = -4 m/s for 2 s (backward)`,
                `t_phases = np.array([0, 3, 5])`,
                `v_phases = np.array([6, -4])   # one per interval`,
                `dt = np.diff(t_phases)`,
                ``,
                `signed_areas = v_phases * dt`,
                `unsigned_areas = np.abs(v_phases) * dt`,
                ``,
                `displacement = signed_areas.sum()`,
                `distance = unsigned_areas.sum()`,
                ``,
                `print(f"Phase 1 area: {signed_areas[0]:+.1f} m")`,
                `print(f"Phase 2 area: {signed_areas[1]:+.1f} m")`,
                `print(f"Net displacement : {displacement:.1f} m")`,
                `print(f"Total distance   : {distance:.1f} m")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Acceleration from v–t slope',
              prose: `The slope of the v–t graph is acceleration. Compute it numerically.`,
              code: [
                `# Piecewise linear v–t data`,
                `t_data = np.array([0, 2, 5, 8, 10])`,
                `v_data = np.array([0, 8, 8, 2, 0])   # m/s`,
                ``,
                `# Numerical acceleration (slope of each segment)`,
                `a_avg = np.diff(v_data) / np.diff(t_data)`,
                `t_mid = (t_data[:-1] + t_data[1:]) / 2`,
                ``,
                `print("Segment | a (m/s²)")`,
                `for tm, a in zip(t_mid, a_avg):`,
                `    print(f"  t={tm:.1f}  |  {a:.2f}")`,
                ``,
                `# Total displacement`,
                `dx_total = np.trapz(v_data, t_data)`,
                `print(f"\\nTotal displacement: {dx_total:.1f} m")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — compute displacement and distance for complex motion',
              prose: `Given v–t data with multiple direction reversals, find both displacement and total distance.`,
              code: [
                `t_c = np.array([0, 1, 2, 3, 4, 5, 6, 7])`,
                `v_c = np.array([4, 6, 3, -2, -5, -3, 1, 4])`,
                ``,
                `# TODO: compute total displacement (signed area) and total distance (unsigned area)`,
                `# Use np.trapz for the signed area.`,
                `# For distance: split at sign changes, sum absolute areas of each piece.`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Displacement vs distance with reversals',
              difficulty: 'medium',
              prompt: `Compute displacement (signed area) and total distance (unsigned area) for the given v–t data.`,
              starterBlock: ``,
              testCode: [
                `displacement_c = np.trapz(v_c, t_c)`,
                `assert abs(displacement_c - 8.5) < 0.5, f"Displacement expected ~8.5, got {displacement_c:.2f}"`,
                `print(f"Displacement: {displacement_c:.2f} m")`,
                `print("Challenge passed ✓")`,
              ].join('\n'),
              hint: `np.trapz(v_c, t_c) gives the signed area (displacement). For distance, find where v changes sign, integrate each piece separately, sum absolute values.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-004-q1',
      question: `What does the area under a v–t graph represent?`,
      options: [`Acceleration`, `Displacement`, `Speed`, `Average velocity`],
      answer: 1,
      explanation: `Area under the v–t curve = $\\int v\\,dt = \\Delta x$ — the displacement. This follows from the Fundamental Theorem of Calculus since position is the antiderivative of velocity.`,
    },
    {
      id: 'p1-ch2-004-q2',
      question: `A car decelerates uniformly from 20 m/s to 0 in 4 s. What is the displacement?`,
      options: [`40 m`, `80 m`, `20 m`, `10 m`],
      answer: 0,
      explanation: `The v–t graph is a right triangle: area = ½ × base × height = ½ × 4 × 20 = 40 m.`,
    },
    {
      id: 'p1-ch2-004-q3',
      question: `What does the slope of a v–t graph represent?`,
      options: [`Displacement`, `Position`, `Speed`, `Acceleration`],
      answer: 3,
      explanation: `Slope of v–t = $\\Delta v / \\Delta t = a$. This is the same secant/tangent logic applied to the (v, t) pair instead of (x, t).`,
    },
    {
      id: 'p1-ch2-004-q4',
      question: `An object moves at $v = +6$ m/s for 3 s, then $v = -4$ m/s for 2 s. What is the net displacement?`,
      options: [`26 m`, `18 m`, `10 m`, `2 m`],
      answer: 2,
      explanation: `Signed areas: $+6 \\times 3 = +18$ m, $-4 \\times 2 = -8$ m. Net displacement = $18 + (-8) = 10$ m.`,
    },
    {
      id: 'p1-ch2-004-q5',
      question: `In the same problem above, what is the total distance traveled?`,
      options: [`10 m`, `18 m`, `26 m`, `14 m`],
      answer: 2,
      explanation: `Total distance = sum of absolute areas = $|+18| + |-8| = 26$ m. Distance is always $\\geq$ |displacement|.`,
    },
    {
      id: 'p1-ch2-004-q6',
      question: `A flat horizontal line on a v–t graph (constant velocity) means:`,
      options: [
        `The object is stopped`,
        `Acceleration is zero and velocity is constant`,
        `The object is at constant position`,
        `Displacement is zero`,
      ],
      answer: 1,
      explanation: `Flat v–t → zero slope → zero acceleration. The object moves at constant velocity. The displacement is still accumulating (area is growing).`,
    },
    {
      id: 'p1-ch2-004-q7',
      question: `For constant acceleration, the area under the v–t graph is a trapezoid. The formula for this area is:`,
      options: [
        `$v_0 \\cdot t$`,
        `$\\frac{1}{2}(v_0 + v)t$`,
        `$(v - v_0)t$`,
        `$\\frac{1}{2}(v - v_0)t$`,
      ],
      answer: 1,
      explanation: `Trapezoid area = ½ × (top + bottom) × height = ½(v₀ + v)t. This is SUVAT equation 2, derived purely from the geometry of a linear v–t graph.`,
    },
    {
      id: 'p1-ch2-004-q8',
      question: `Why does the area-under-v–t-gives-Δx rule hold for any v(t), not just constant acceleration?`,
      options: [
        `Because velocity is always constant`,
        `Because the Fundamental Theorem of Calculus: since v = dx/dt, its antiderivative is x, so ∫v dt = Δx`,
        `Because speed equals distance divided by time`,
        `Only for linear v–t graphs`,
      ],
      answer: 1,
      explanation: `By the FTC: if $v = dx/dt$, then $x$ is an antiderivative of $v$, so $\\int_{t_1}^{t_2} v\\,dt = x(t_2) - x(t_1) = \\Delta x$. This holds for any velocity function, not just constant acceleration.`,
    },
  ],
};
