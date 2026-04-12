export default {
  id: "ch2-003",
  slug: "position-graph-analysis",
  chapter: 'p2',
  order: 3,
  title: "Position-Time Graph Analysis",
  subtitle: "Read motion directly from the shape and slope of an x–t graph.",
  tags: ["position graph", "slope", "kinematics", "velocity", "instantaneous rate of change"],
  aliases: "x t graph slope velocity position graph",

  hook: {
    question:
      "Two cars pass through the same intersection at the same moment. One is cruising at 30 mph; the other is slamming on the brakes from 60 mph. At that instant, they share the same position — but their x–t graphs look completely different. How?",
    realWorldContext:
      "GPS navigation apps, traffic analytics systems, and sports tracking all start with raw position-time data. Interpreting the shape and slope of that data tells you everything about how an object is moving — without ever measuring speed directly. Police radar guns, stadium timing systems, and autonomous vehicle sensors all convert position data into velocity by reading graph slopes in real time.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      "An x–t graph is the story of where an object is at every moment in time. The horizontal axis is time; the vertical axis is position. A single dot on the graph tells you one fact: 'at this time, the object was at this location.' The entire curve tells you the whole journey.",
      "You can read motion directly from the shape of the curve — before doing any algebra at all. A flat horizontal line means the object is stopped: position never changes. A straight diagonal line means the object is moving at constant speed: equal position changes in equal time intervals, like a car on cruise control. A curve that bends upward means the object is speeding up; a curve that flattens out means it is slowing down. The shape is the story.",
      "The slope of the x–t curve at any moment tells you velocity. Steep positive slope means fast forward motion. Gentle positive slope means slow forward motion. Zero slope (flat tangent) means momentarily stopped. Negative slope means moving backward — position is decreasing. This is the key translation: steepness of curve = speed, sign of slope = direction.",
      "Two objects can be at the same position at the same time but have completely different slopes at that point — meaning different velocities. This is why your two cars in the hook have different graphs even though they cross the same intersection simultaneously: one has a gentle, nearly constant slope; the other has a steep slope that is rapidly decreasing as the brakes take effect.",
      "Over any time interval, you can estimate velocity by drawing the secant line — the straight line connecting two points on the curve. The slope of that secant line gives the average velocity over that interval. This is pure algebra: rise over run, Δx/Δt. No calculus needed. The finer you make the interval, the better this estimate becomes.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "Slope from Algebra: Δy/Δx",
        body: "The slope of any line through two points (t₁, x₁) and (t₂, x₂) is Δx/Δt = (x₂ - x₁)/(t₂ - t₁). This is rise over run with position on the y-axis and time on the x-axis. Reading a motion graph is applying this formula to real-world data.",
      },
      {
        type: "intuition",
        title: "Three Shapes, Three Stories",
        body: "Flat line → stopped. Straight diagonal → constant velocity (uniform motion). Curve (concave up) → speeding up (acceleration is positive). Curve (concave down) → slowing down (acceleration is negative). You can identify all four situations from graph shape alone, before calculating a single number.",
      },
      {
        type: "tip",
        title: "Calculus Connection: Slope → Derivative",
        body: "The slope of the secant line (average velocity) becomes the slope of the tangent line (instantaneous velocity) as the interval Δt → 0. This limit is exactly the derivative dx/dt. The same idea is developed rigorously in Calculus Chapter 2 (The Derivative), where the speedometer paradox — how can speed exist at a single instant? — is fully resolved using the limit definition.",
      },
      {
        type: "misconception",
        title: "x–t Slope Is NOT the Shape of the Path",
        body: "A steep x–t graph does not mean the object moved steeply through space. It means the object moved quickly through space. A ball thrown horizontally has a curved path in 2D space, but its x-coordinate vs time is a straight line (constant horizontal velocity). Always remember: x–t graphs plot position against time, not trajectory through space.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-avg-velocity' },
        title: 'Average velocity — algebra only',
        caption: 'Pick any two points on the x–t curve. Divide the rise (Δx) by the run (Δt). That ratio is the average velocity over that interval. No calculus — just subtraction and division.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Secant slope → tangent slope',
        caption: 'As Δt shrinks, the secant (dashed, average) rotates onto the tangent (solid, instantaneous). The limiting slope is dx/dt = velocity.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Slope on x–t gives velocity',
        caption: `Shape describes motion; slope quantifies it. A flat line → zero velocity (stopped). A straight diagonal → constant velocity. A concave-up curve → speeding up (positive acceleration). A concave-down curve → slowing down. Steep slope = high speed; negative slope = moving backward.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'Four motion scenarios on x–t',
        caption: `Compare: (1) rest — flat line; (2) constant velocity — straight diagonal; (3) reversal — peak then decreasing; (4) acceleration — parabola curving away from the axis. The v–t graph below is the derivative of the x–t graph above — watch how slope at each instant becomes height in the panel below.`,
      },
    ],
  },

  math: {
    prose: [
      "The average velocity over any time interval [t₁, t₂] is the secant slope on the x–t graph: the ratio of the change in position to the change in time. You compute it algebraically — read two coordinates off the graph, subtract, divide. Units are always meters per second (m/s) if position is in meters and time in seconds.",
      "To find average velocity: locate two points (t₁, x(t₁)) and (t₂, x(t₂)) on the graph, then apply the secant formula. Notice that if position decreases (x₂ < x₁), the slope is negative and velocity is negative — the object is moving in the negative direction.",
      "Instantaneous velocity at a single moment t is the slope of the tangent line to the x–t curve at that point. You cannot compute it exactly from a graph by eye — you can only estimate it by drawing as small a secant as possible. The exact value requires taking a limit (see Rigor section below). In problems, instantaneous velocity is found analytically by differentiating the position function: v(t) = dx/dt.",
      "For a position function x(t) = x₀ + v₀t + ½at² (constant acceleration), the slope at time t is exactly v(t) = v₀ + at. The x–t graph is a parabola; its slope changes linearly with time.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Average velocity (secant slope)",
        body: "\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x(t_2) - x(t_1)}{t_2 - t_1}",
      },
      {
        type: "definition",
        title: "Instantaneous velocity (tangent slope)",
        body: "v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}",
      },
      {
        type: "technique",
        title: "Slope Signs Tell Direction",
        body: "Positive slope (x increasing) → moving in +x direction. Negative slope (x decreasing) → moving in −x direction. Zero slope → momentarily stopped. The magnitude of the slope tells you speed; the sign tells you direction.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Translating graph features to equations',
        caption: `For a parabolic x(t) = x₀ + v₀t + ½at², the slope at any point is v(t) = v₀ + at — a linear function. At a peak (v=0), the tangent is horizontal. At a crossing point (x=0), the tangent has slope equal to the current velocity. Graph reading and algebra always agree.`,
      },
    ],
  },

  rigor: {
    title: "Why slope equals velocity — the calculus",
    prose: [
      "The claim that 'slope of x–t equals velocity' is not just a geometric analogy — it is a theorem. Average velocity over [t, t+Δt] is exactly the secant slope Δx/Δt. Instantaneous velocity is the limit of these secant slopes as Δt shrinks to zero. That limit is the derivative dx/dt by definition. So velocity is not 'like' a derivative — it literally IS the derivative of position with respect to time.",
      "This is why calculus was invented. Newton wanted to define velocity at an instant — a quantity that Zeno's paradoxes seemed to make impossible. The answer was the limit definition of the derivative. Every speedometer, GPS, and physics simulation computes velocity as dx/dt, whether using calculus analytically or numerical differentiation computationally.",
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'xt-vt-graphs' },
    proofSteps: [
      {
        expression: "\\bar{v} = \\frac{x(t+\\Delta t) - x(t)}{\\Delta t}",
        annotation: "Average velocity = secant slope on x–t over interval [t, t+Δt].",
      },
      {
        expression: "v(t) = \\lim_{\\Delta t \\to 0} \\frac{x(t + \\Delta t) - x(t)}{\\Delta t}",
        annotation: "Shrink the interval to zero — this is the derivative limit definition.",
      },
      {
        expression: "v(t) = \\frac{dx}{dt}",
        annotation: "Instantaneous velocity is the derivative of position. Slope of tangent on x–t.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-003-ex1",
      title: "Read average velocity from two graph points",
      problem:
        "A car's x–t data shows x(2) = 4 m and x(6) = 20 m. Find its average velocity over [2, 6].",
      steps: [
        {
          expression: "\\bar{v} = \\frac{x(6) - x(2)}{6 - 2} = \\frac{20 - 4}{4} = \\frac{16}{4}",
          annotation: "Apply the secant slope formula: Δx/Δt.",
        },
        {
          expression: "\\bar{v} = 4 \\text{ m/s}",
          annotation: "The car moved 16 m in 4 s, averaging 4 m/s.",
        },
      ],
      conclusion:
        "Average velocity is 4 m/s. This is the slope of the secant line between the two graph points.",
    },
    {
      id: "ch2-003-ex2",
      title: "Identify motion from graph shape",
      problem:
        "An x–t graph shows: (A) flat line from t=0 to t=3, (B) increasing straight line from t=3 to t=7, (C) decreasing curve from t=7 to t=10. Describe the motion.",
      steps: [
        {
          expression: "v = 0 \\text{ on } [0, 3]",
          annotation: "(A) Flat line → zero slope → object is stopped.",
        },
        {
          expression: "v > 0,\\ \\text{constant on } [3, 7]",
          annotation: "(B) Straight diagonal → constant slope → constant positive velocity.",
        },
        {
          expression: "v < 0,\\ \\text{decreasing magnitude on } [7, 10]",
          annotation: "(C) Decreasing curve → negative but increasing slope → moving backward, slowing down.",
        },
      ],
      conclusion:
        "Stopped → constant forward motion → decelerating backward motion. Three shapes, three stories.",
    },
  ],

  challenges: [
    {
      id: "ch2-003-ch1",
      difficulty: "medium",
      problem: "Can velocity be zero while position is nonzero?",
      hint: "Think about a flat tangent on x–t — at what position does it occur?",
      answer:
        "Yes. v = 0 means the slope is zero at that instant (flat tangent). The object is momentarily stopped, but it can be anywhere on the x-axis — position being nonzero is unrelated to velocity being zero.",
    },
    {
      id: "ch2-003-ch2",
      difficulty: "hard",
      problem:
        "An x–t graph is a perfect parabola: x(t) = 2t². What is the instantaneous velocity at t = 3, and how does it compare to the average velocity over [2, 4]?",
      hint: "Use derivative for instantaneous; use Δx/Δt for average.",
      answer:
        "Instantaneous: v(3) = dx/dt = 4t|_{t=3} = 12 m/s. Average over [2,4]: Δx/Δt = (2·16 - 2·4)/(4-2) = (32-8)/2 = 12 m/s. They match! This is not a coincidence — for uniform acceleration (quadratic x(t)), the average velocity over a symmetric interval equals the instantaneous velocity at the midpoint (MVT).",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Position–Time Graph Analysis`,
    description: `Read velocities from x–t data using numerical differentiation, plot secant vs tangent slopes, and identify motion phases.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Slopes and motion from x(t) data',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Average velocity from two data points',
              prose: `The secant slope Δx/Δt gives average velocity over any interval.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `# x–t data for a car`,
                `t = np.array([0, 1, 2, 3, 4, 5, 6])   # seconds`,
                `x = np.array([0, 3, 8, 15, 20, 22, 22])  # metres`,
                ``,
                `# Average velocity between each consecutive pair of points`,
                `v_avg = np.diff(x) / np.diff(t)`,
                `t_mid = (t[:-1] + t[1:]) / 2   # midpoints for plotting`,
                ``,
                `print("t_mid (s) | avg velocity (m/s)")`,
                `for tm, v in zip(t_mid, v_avg):`,
                `    print(f"  {tm:.1f}     |  {v:.1f}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Plotting x–t and v–t together',
              prose: `The v–t graph is the derivative (slope) of the x–t graph.`,
              code: [
                `fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)`,
                ``,
                `ax1.plot(t, x, 'b-o', linewidth=2, markersize=6)`,
                `ax1.set_ylabel('Position (m)')`,
                `ax1.set_title('Position–time graph')`,
                `ax1.grid(True, alpha=0.4)`,
                ``,
                `ax2.step(t_mid, v_avg, where='mid', color='red', linewidth=2)`,
                `ax2.axhline(0, color='k', linewidth=0.8, linestyle='--')`,
                `ax2.set_ylabel('Velocity (m/s)')`,
                `ax2.set_xlabel('Time (s)')`,
                `ax2.set_title('Velocity–time graph (numerical derivative)')`,
                `ax2.grid(True, alpha=0.4)`,
                ``,
                `plt.tight_layout()`,
                `plt.savefig('xt_vt_graphs.png', dpi=100, bbox_inches='tight')`,
                `plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Parabolic motion — secant converges to tangent',
              prose: `For x(t) = 2t², watch the secant slope approach the true derivative as Δt shrinks.`,
              code: [
                `def x_func(t): return 2*t**2`,
                ``,
                `t0 = 3.0`,
                `true_v = 4 * t0   # v = dx/dt = 4t`,
                ``,
                `print(f"True instantaneous velocity at t={t0}: {true_v} m/s\\n")`,
                `print("Δt         | secant slope | error")`,
                `for dt in [1.0, 0.5, 0.1, 0.01, 0.001]:`,
                `    secant = (x_func(t0 + dt) - x_func(t0)) / dt`,
                `    print(f"{dt:.4f}      | {secant:.6f}  | {abs(secant - true_v):.6f}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — classify motion phases',
              prose: `Given x–t data, identify each segment as: stopped, constant velocity, accelerating, or decelerating.`,
              code: [
                `t2 = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8])`,
                `x2 = np.array([5, 5, 5, 8, 11, 14, 16, 15, 13])`,
                ``,
                `# TODO: compute velocities for each interval`,
                `# classify each as: 'stopped', 'constant', 'accel', 'decel'`,
                `# Print: interval [t_a, t_b] | v | phase`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Classify motion phases',
              difficulty: 'medium',
              prompt: `Compute velocities and classify each segment.`,
              starterBlock: ``,
              testCode: [
                `v2 = np.diff(x2) / np.diff(t2)`,
                `assert np.isclose(v2[0], 0), "First interval: stopped"`,
                `assert v2[2] > 0, "Third interval: moving forward"`,
                `assert v2[6] < 0, "Seventh interval: moving backward"`,
                `print("Phase classification tests passed ✓")`,
              ].join('\n'),
              hint: `v = np.diff(x2)/np.diff(t2). Use abs(v) < 0.1 for stopped. Compare consecutive v values to find acceleration direction.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-003-q1',
      question: `A flat horizontal line on an x–t graph means the object is:`,
      options: [`Moving at constant velocity`, `Accelerating`, `Stopped (at rest)`, `Moving backward`],
      answer: 2,
      explanation: `Flat line → zero slope → zero velocity. Position isn't changing, so the object is stopped.`,
    },
    {
      id: 'p1-ch2-003-q2',
      question: `What does a negative slope on an x–t graph indicate?`,
      options: [`Decelerating`, `Moving in the negative direction`, `At a negative position`, `At rest`],
      answer: 1,
      explanation: `Negative slope means position is decreasing — the object moves in the −x direction. Sign of slope = direction; magnitude of slope = speed.`,
    },
    {
      id: 'p1-ch2-003-q3',
      question: `$x(2) = 4$ m and $x(6) = 20$ m. What is the average velocity over $[2, 6]$?`,
      options: [`2 m/s`, `4 m/s`, `8 m/s`, `16 m/s`],
      answer: 1,
      explanation: `$\\bar{v} = \\Delta x / \\Delta t = (20-4)/(6-2) = 16/4 = 4$ m/s. This is the secant slope.`,
    },
    {
      id: 'p1-ch2-003-q4',
      question: `A concave-upward (bowl-shaped) x–t curve indicates:`,
      options: [`Decelerating`, `Moving backward`, `Speeding up (positive acceleration)`, `Stopped`],
      answer: 2,
      explanation: `Concave up → increasing slope → increasing velocity → positive acceleration. Concave down → decreasing slope → decreasing velocity → deceleration.`,
    },
    {
      id: 'p1-ch2-003-q5',
      question: `Instantaneous velocity equals:`,
      options: [
        `Area under the x–t curve`,
        `Secant slope over a large interval`,
        `Slope of the tangent line at that instant`,
        `y-intercept of the curve`,
      ],
      answer: 2,
      explanation: `Instantaneous velocity = slope of the tangent = $\\lim_{\\Delta t \\to 0} \\Delta x / \\Delta t = dx/dt$.`,
    },
    {
      id: 'p1-ch2-003-q6',
      question: `Can two objects have the same position but different velocities at the same instant?`,
      options: [
        `No — same position means same velocity`,
        `Yes — same position just means the curves cross, not that slopes are equal`,
        `Only if one is accelerating`,
        `Only in 2D`,
      ],
      answer: 1,
      explanation: `When two x–t curves cross, positions are equal but slopes (velocities) can differ completely — as with the two cars in the hook.`,
    },
    {
      id: 'p1-ch2-003-q7',
      question: `For $x(t) = 2t^2$, instantaneous velocity at $t = 3$ s is:`,
      options: [`6 m/s`, `12 m/s`, `18 m/s`, `9 m/s`],
      answer: 1,
      explanation: `$v(t) = dx/dt = 4t$. At $t=3$: $v = 12$ m/s.`,
    },
    {
      id: 'p1-ch2-003-q8',
      question: `The slope of the secant line on an x–t graph represents:`,
      options: [`Instantaneous velocity`, `Average velocity over that interval`, `Average acceleration`, `Distance travelled`],
      answer: 1,
      explanation: `Secant slope = $\\Delta x / \\Delta t$ = average velocity over the interval. As the interval shrinks, it converges to instantaneous velocity.`,
    },
  ],
};
