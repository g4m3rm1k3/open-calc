export default {
  id: "ch2-005",
  slug: "acceleration-graph-analysis",
  chapter: 'p2',
  order: 5,
  title: "Acceleration-Time Graph Analysis",
  subtitle: "Use a–t graphs to predict how velocity — and therefore position — evolves over time.",
  tags: ["acceleration graph", "delta v", "kinematics", "integration chain", "jerk"],
  aliases: "a t graph change in velocity acceleration kinematics",

  hook: {
    question:
      "An elevator's control system receives an acceleration command: +2 m/s² for 3 s, then 0 m/s² for 4 s, then −3 m/s² until it stops. You have the a–t graph. Can you figure out the complete velocity and position history — and how long the whole ride takes?",
    realWorldContext:
      "Rocket guidance, aircraft autopilots, and prosthetic limb controllers all operate on acceleration commands rather than position targets. The controller specifies an a–t profile; integrating it gives the velocity profile; integrating again gives position. This is how GPS receivers and inertial navigation systems reconstruct position from accelerometer data — a process called dead reckoning. The accuracy of navigation depends directly on how well you can integrate an a–t signal.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      "An a–t graph tells you how rapidly velocity is changing at every moment. Just as a v–t graph told you about position changes, the a–t graph tells you about velocity changes. The height of the curve gives acceleration at that instant: positive means velocity is increasing, negative means velocity is decreasing, zero means constant velocity.",
      "The area under an a–t graph gives the change in velocity. This is the same 'area gives change' rule as in the v–t lesson — applied one level up the differentiation chain. If acceleration is +2 m/s² for 3 seconds, the area is 2 × 3 = 6, so velocity increases by 6 m/s. The shape of the curve tells you the story of how quickly velocity is changing; the area tells you by how much.",
      "You can read the three-level kinematic chain directly from a–t graphs: differentiation goes downhill (slope of x–t gives v; slope of v–t gives a), and integration goes uphill (area under a–t gives Δv; area under v–t gives Δx). The a–t graph is at the top of the chain — it contains all the information needed to reconstruct the entire motion, as long as you know where the object started (initial position and velocity).",
      "Constant acceleration is the special case where a–t is a flat horizontal line. In this case, the area is just a rectangle (a × Δt = Δv), and the resulting v–t graph is a straight line. This is the world of SUVAT: all five kinematic equations come from integrating constant-acceleration a–t graphs twice. Once acceleration varies, SUVAT breaks down and you need calculus.",
      "Jerk is the rate of change of acceleration — the slope of the a–t graph. It matters more than you might expect: elevator designers minimize jerk (not just acceleration) because humans feel sudden changes in acceleration as discomfort. Smooth rides have gentle a–t slopes. An a–t graph with sudden jumps (high jerk) causes the lurching feeling in old elevators.",
    ],
    callouts: [
      {
        type: "prior-knowledge",
        title: "The Kinematic Chain",
        body: "position x(t) → differentiate → velocity v(t) → differentiate → acceleration a(t). Going the other way: integrate a(t) → velocity change Δv; integrate v(t) → displacement Δx. The a–t graph sits at the top of this chain. Calculus is what makes the chain exact; geometry (area of shapes) gives you the algebra-level approximation.",
      },
      {
        type: "intuition",
        title: "Piece-by-Piece Reconstruction",
        body: "Starting from an a–t graph, reconstruct velocity step by step: pick a starting velocity v₀, add each area segment to get the running velocity. Then reconstruct position from the resulting v–t graph. This is dead reckoning — used in navigation, robotics, and spaceflight. The only inputs needed are the initial conditions (x₀, v₀) and the a–t profile.",
      },
      {
        type: "tip",
        title: "Calculus Connection: Double Integration",
        body: "If you know a(t) as a function, you can recover v(t) and x(t) by integrating twice: v(t) = v₀ + ∫a(t) dt, then x(t) = x₀ + ∫v(t) dt. This is exactly what solving an ordinary differential equation means: a = d²x/dt² is a second-order ODE, and finding x(t) is solving it. Calculus Chapter 4 (Integration) develops the tools; for simple cases, SUVAT equations are already the solution.",
      },
      {
        type: "misconception",
        title: "Constant a ≠ Constant v",
        body: "A flat (constant) a–t graph does NOT mean constant velocity — it means velocity changes at a constant rate. If a = −9.8 m/s², velocity decreases by 9.8 m/s every second. Only if a = 0 is velocity constant. This is the most common confusion in reading a–t graphs.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-rectangle' },
        title: 'Algebra: Δv = a·Δt (constant acceleration)',
        caption: 'For constant acceleration, Δv = a·Δt — exactly the same rectangle-area logic as Δx = v·Δt. Integrate a once to get v, integrate v once to get x. Two steps, both with the same algebraic idea.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'algebra-rectangle' },
        title: 'Area under a–t gives Δv',
        caption: `For constant acceleration, the a–t graph is a flat horizontal line. The area under it is a rectangle: Δv = a·Δt. Positive area → velocity increases. Negative area → velocity decreases. Accumulate areas across segments to track the running velocity.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'x–v–a all three graphs simultaneously',
        caption: `The three graphs are linked by calculus: slope of x–t = value of v–t; slope of v–t = value of a–t. Going the other direction: area under a–t = change in v–t; area under v–t = change in x–t. A sudden jump in a–t (high jerk) appears as a sharp corner in v–t and a cusp in x–t.`,
      },
    ],
  },

  math: {
    prose: [
      "For any a–t graph, the change in velocity over [t₁, t₂] equals the signed area under the curve over that interval: Δv = ∫_{t₁}^{t₂} a(t) dt. For piece-wise constant or linear acceleration, this area is computed geometrically (rectangles and triangles). If you know v₀ and the area, you know the final velocity: v(t₂) = v₀ + Δv.",
      "For constant acceleration a, the area is simply a·Δt, giving v = v₀ + aΔt. This is the first SUVAT equation. Substituting this into the v–t area formula (Δx = ∫v dt) and integrating gives the second SUVAT equation: x = x₀ + v₀t + ½at². Both equations follow by integrating the constant-a a–t graph twice.",
      "For variable acceleration a(t), you must integrate analytically: first to get v(t) = v₀ + ∫a(t)dt, then to get x(t) = x₀ + ∫v(t)dt. In general physics problems, a(t) might be sinusoidal (oscillating systems), exponential (drag-limited motion), or defined piecewise (engine thrust profiles).",
    ],
    callouts: [
      {
        type: "definition",
        title: "Velocity update from acceleration",
        body: "v(t) = v_0 + \\int_0^t a(t')\\,dt'",
      },
      {
        type: "definition",
        title: "Constant acceleration: area rule",
        body: "\\Delta v = a\\,\\Delta t \\quad \\Longrightarrow \\quad v = v_0 + a\\,t",
      },
      {
        type: "definition",
        title: "SUVAT via double integration",
        body: "x(t) = x_0 + v_0 t + \\tfrac{1}{2}a t^2",
      },
      {
        type: "technique",
        title: "Step-by-Step Reconstruction from a–t",
        body: "1. Identify a–t segments (constant or linear pieces). 2. For each segment, compute area (rectangle or triangle) → get Δv. 3. Add Δv to running v to get final velocity for that segment. 4. Use the resulting v–t to compute Δx (area under v–t). 5. Add Δx to running x. Repeat for each segment.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Formulas from integration of acceleration',
        caption: `For constant a: integrate once → v = v₀ + at (SUVAT eq. 1). Integrate again → x = x₀ + v₀t + ½at² (SUVAT eq. 3). For variable a(t): v(t) = v₀ + ∫a dt, x(t) = x₀ + ∫v dt. Numerically, each step is an area under the graph of the function above.`,
      },
    ],
  },

  rigor: {
    title: "Deriving Δv from a–t — and SUVAT from double integration",
    prose: [
      "The area-under-a-gives-Δv rule is the FTC applied to the (v, a) pair: since a = dv/dt, by the FTC, ∫_{t₁}^{t₂} a(t)dt = v(t₂) − v(t₁) = Δv. Applying the same argument one level down: since v = dx/dt, ∫_{t₁}^{t₂} v(t)dt = x(t₂) − x(t₁) = Δx.",
      "For constant acceleration a, the double integration produces SUVAT exactly: v(t) = v₀ + at (integrate a), then x(t) = x₀ + ∫(v₀ + at)dt = x₀ + v₀t + ½at² (integrate v). The kinematic equations are not empirical rules — they are antiderivatives of the constant-acceleration definition. Every SUVAT equation is a theorem in calculus.",
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'kinematic-chain' },
    proofSteps: [
      {
        expression: "a(t) = \\frac{dv}{dt}",
        annotation: "Definition: acceleration is the derivative of velocity.",
      },
      {
        expression: "\\int_{t_1}^{t_2} a(t)\\,dt = v(t_2) - v(t_1) = \\Delta v",
        annotation: "FTC applied: area under a–t gives Δv.",
      },
      {
        expression: "v(t) = v_0 + \\int_0^t a\\,dt' = v_0 + at \\quad (\\text{constant }a)",
        annotation: "First integration: gives the v–t equation.",
      },
      {
        expression: "x(t) = x_0 + \\int_0^t v\\,dt' = x_0 + v_0 t + \\tfrac{1}{2}at^2",
        annotation: "Second integration: gives the x–t equation (SUVAT).",
      },
    ],
  },

  examples: [
    {
      id: "ch2-005-ex1",
      title: "Constant acceleration — velocity update",
      problem:
        "An object starts at v₀ = 3 m/s. It experiences a constant acceleration of a = −1.5 m/s² for 4 seconds. Find its final velocity.",
      steps: [
        {
          expression: "\\Delta v = a \\cdot \\Delta t = (-1.5)(4) = -6 \\text{ m/s}",
          annotation: "Area under the constant a–t graph is a rectangle.",
        },
        {
          expression: "v = v_0 + \\Delta v = 3 + (-6) = -3 \\text{ m/s}",
          annotation: "Final velocity: started positive, ended negative (reversed direction).",
        },
      ],
      conclusion:
        "Final velocity is −3 m/s. The object slowed, stopped, and reversed. You can confirm: v crosses zero at t = 3/1.5 = 2 s.",
    },
    {
      id: "ch2-005-ex2",
      title: "Piece-wise acceleration — reconstruct v(t)",
      problem:
        "An object starts at rest. a–t graph: a = +4 m/s² for t ∈ [0, 3], then a = 0 for t ∈ [3, 5], then a = −2 m/s² for t ∈ [5, 9]. Find v at t = 9.",
      steps: [
        {
          expression: "\\Delta v_1 = (4)(3) = +12 \\text{ m/s} \\Rightarrow v(3) = 12 \\text{ m/s}",
          annotation: "Phase 1: accelerating. Rectangle area = 12.",
        },
        {
          expression: "\\Delta v_2 = (0)(2) = 0 \\Rightarrow v(5) = 12 \\text{ m/s}",
          annotation: "Phase 2: constant velocity. No area, velocity unchanged.",
        },
        {
          expression: "\\Delta v_3 = (-2)(4) = -8 \\text{ m/s} \\Rightarrow v(9) = 12 - 8 = 4 \\text{ m/s}",
          annotation: "Phase 3: decelerating. Rectangle area = −8.",
        },
      ],
      conclusion:
        "Final velocity at t = 9 is 4 m/s. The object is still moving forward, but slower than its peak speed.",
    },
  ],

  challenges: [
    {
      id: "ch2-005-ch1",
      difficulty: "medium",
      problem: "Can acceleration be zero while velocity is nonzero?",
      hint: "Think about what zero acceleration means on a v–t graph.",
      answer:
        "Yes — zero acceleration means the slope of v–t is zero, i.e., velocity is constant and nonzero. Cruise control: constant 60 mph, zero acceleration. Acceleration measures change in velocity, not velocity itself.",
    },
    {
      id: "ch2-005-ch2",
      difficulty: "hard",
      problem:
        "An object starts from rest at x = 0. Its acceleration is a(t) = 6t m/s² (increasing linearly). Find v(t) and x(t) analytically, then find x at t = 4 s.",
      hint: "Integrate a(t) to get v(t), then integrate again to get x(t).",
      answer:
        "v(t) = ∫6t dt = 3t² + C₁. With v(0) = 0: v(t) = 3t². Then x(t) = ∫3t² dt = t³ + C₂. With x(0) = 0: x(t) = t³. At t = 4: x = 64 m. Note: this is NOT solvable with SUVAT because a is not constant.",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Acceleration–Time Graph Analysis`,
    description: `Integrate an a–t profile step by step to reconstruct velocity and position. Handle piecewise and variable acceleration.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Reconstructing motion from acceleration',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'Piecewise constant acceleration — step by step',
              prose: `Elevator problem: a = +2 m/s² for 3 s, then 0 for 4 s, then −3 m/s² until stop.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `# Phase durations and accelerations`,
                `phases = [(3, 2.0), (4, 0.0), (2, -3.0)]  # (duration, accel)`,
                ``,
                `v0 = 0.0`,
                `t_running, v_running, a_running = [0], [v0], [phases[0][1]]`,
                ``,
                `t_now = 0`,
                `v_now = v0`,
                `for dur, a in phases:`,
                `    t_end = t_now + dur`,
                `    v_end = v_now + a * dur`,
                `    t_running.append(t_end)`,
                `    v_running.append(v_end)`,
                `    a_running.append(a)`,
                `    print(f"Phase a={a:+.1f}: t {t_now}→{t_end}, Δv={a*dur:+.1f}, v={v_end:.1f} m/s")`,
                `    t_now = t_end; v_now = v_end`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Visualising a–t, v–t, and x–t together',
              prose: `Plot all three graphs for the elevator profile.`,
              code: [
                `t_arr = np.linspace(0, 9, 1000)`,
                ``,
                `def a_func(t):`,
                `    if t <= 3:   return 2.0`,
                `    elif t <= 7: return 0.0`,
                `    else:        return -3.0`,
                ``,
                `a_arr = np.array([a_func(ti) for ti in t_arr])`,
                `v_arr = np.cumsum(a_arr) * (t_arr[1] - t_arr[0])   # numerical integral`,
                `x_arr = np.cumsum(v_arr) * (t_arr[1] - t_arr[0])`,
                ``,
                `fig, axes = plt.subplots(3, 1, figsize=(8, 9), sharex=True)`,
                `for ax, y, lbl, col in zip(axes, [x_arr, v_arr, a_arr],`,
                `                            ['x (m)', 'v (m/s)', 'a (m/s²)'], ['b','r','g']):`,
                `    ax.plot(t_arr, y, color=col, linewidth=2)`,
                `    ax.set_ylabel(lbl); ax.grid(True, alpha=0.4); ax.axhline(0, color='k', lw=0.8)`,
                `axes[2].set_xlabel('Time (s)')`,
                `fig.suptitle('Elevator: x–v–a graphs', fontsize=13)`,
                `plt.tight_layout()`,
                `plt.savefig('elevator_xva.png', dpi=100, bbox_inches='tight')`,
                `plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Variable acceleration — double integration',
              prose: `For a(t) = 6t (non-constant), SUVAT fails. Use scipy.integrate.`,
              code: [
                `from scipy.integrate import quad`,
                ``,
                `# a(t) = 6t, v(0) = 0, x(0) = 0`,
                `def a_var(t): return 6*t`,
                ``,
                `def v_var(t):`,
                `    integral, _ = quad(a_var, 0, t)`,
                `    return integral   # v = ∫₀ᵗ 6t dt = 3t²`,
                ``,
                `# Check`,
                `t_test = np.array([0, 1, 2, 3, 4])`,
                `v_exact = 3 * t_test**2   # analytical`,
                `v_numerical = np.array([v_var(t) for t in t_test])`,
                ``,
                `print("t  |  v (analytical)  |  v (numerical)")`,
                `for t, va, vn in zip(t_test, v_exact, v_numerical):`,
                `    print(f"{t}  |  {va:.2f}              |  {vn:.2f}")`,
                ``,
                `# Position at t=4`,
                `x_at_4 = quad(v_var, 0, 4)[0]`,
                `print(f"\\nx(4) = {x_at_4:.1f} m  (analytical: {4**3} m)")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — reconstruct full motion from a(t) = sin(t)',
              prose: `Given a(t) = sin(t) with v(0) = 0 and x(0) = 0, find v(π), x(π), and x(2π).`,
              code: [
                `from scipy.integrate import quad`,
                `import numpy as np`,
                ``,
                `def a_sin(t): return np.sin(t)`,
                ``,
                `# TODO: compute v(t) = v0 + ∫₀ᵗ a(t) dt`,
                `# Then compute x(t) = x0 + ∫₀ᵗ v(t) dt`,
                `# Report v(π), x(π), x(2π)`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Sinusoidal acceleration',
              difficulty: 'hard',
              prompt: `Compute v(π), x(π), and x(2π) for a(t) = sin(t) with zero initial conditions.`,
              starterBlock: ``,
              testCode: [
                `v_pi = quad(a_sin, 0, np.pi)[0]`,
                `assert abs(v_pi - 2.0) < 0.01, f"v(π) should be 2.0, got {v_pi:.4f}"`,
                `print(f"v(π) = {v_pi:.4f} m/s  ✓")`,
                `print("Sinusoidal integration passed ✓")`,
              ].join('\n'),
              hint: `v(π) = ∫₀^π sin(t) dt = [-cos(t)]₀^π = -cos(π) + cos(0) = 1 + 1 = 2. Use quad for x(π) and x(2π).`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-005-q1',
      question: `What does the area under an a–t graph represent?`,
      options: [`Displacement`, `Speed`, `Change in velocity (Δv)`, `Position`],
      answer: 2,
      explanation: `Area under a–t = $\\int a\\,dt = \\Delta v$. This is the FTC applied to the (v, a) pair, since $a = dv/dt$.`,
    },
    {
      id: 'p1-ch2-005-q2',
      question: `An object starts at $v_0 = 3$ m/s and experiences $a = -1.5$ m/s² for 4 s. What is the final velocity?`,
      options: [`9 m/s`, `−3 m/s`, `−9 m/s`, `4.5 m/s`],
      answer: 1,
      explanation: `$\\Delta v = a \\cdot \\Delta t = -1.5 \\times 4 = -6$ m/s. $v_f = 3 + (-6) = -3$ m/s. The object reversed direction.`,
    },
    {
      id: 'p1-ch2-005-q3',
      question: `A flat (horizontal) a–t graph at some non-zero value means:`,
      options: [
        `Constant velocity`,
        `Constant acceleration (velocity changes at a steady rate)`,
        `Object is stopped`,
        `Position is constant`,
      ],
      answer: 1,
      explanation: `Constant non-zero a–t → velocity changes at a constant rate → linear v–t graph → SUVAT applies. The object is NOT at constant velocity.`,
    },
    {
      id: 'p1-ch2-005-q4',
      question: `Starting from an a–t graph, what two things do you need in addition to reconstruct position $x(t)$?`,
      options: [
        `Final velocity and final position`,
        `Initial velocity $v_0$ and initial position $x_0$`,
        `The average acceleration and total time`,
        `Nothing — a–t alone is sufficient`,
      ],
      answer: 1,
      explanation: `Integration adds a constant. You need $v_0$ to pin down $v(t)$, and $x_0$ to pin down $x(t)$. These are the initial conditions required to solve the second-order ODE $\\ddot{x} = a(t)$.`,
    },
    {
      id: 'p1-ch2-005-q5',
      question: `For $a(t) = 6t$, which method gives the correct $x(t)$?`,
      options: [
        `SUVAT equation 3`,
        `Double integration: $v = \\int a\\,dt$, then $x = \\int v\\,dt$`,
        `Reading the slope of the a–t graph`,
        `Multiplying $a$ by $t^2$`,
      ],
      answer: 1,
      explanation: `SUVAT requires constant acceleration. For variable $a(t)$, you must integrate: first $v(t) = v_0 + \\int a\\,dt = 3t^2$, then $x(t) = x_0 + \\int v\\,dt = t^3$.`,
    },
    {
      id: 'p1-ch2-005-q6',
      question: `"Jerk" in physics refers to:`,
      options: [`Acceleration in the downward direction`, `Rate of change of acceleration (slope of a–t)`, `Very high speed`, `Negative velocity`],
      answer: 1,
      explanation: `Jerk = $da/dt$ = slope of the a–t graph. High jerk = sudden change in acceleration = the lurching feeling in a poorly designed elevator or car.`,
    },
    {
      id: 'p1-ch2-005-q7',
      question: `An object starts from rest. $a = +4$ m/s² for 3 s, then $a = 0$ for 2 s, then $a = -2$ m/s² for 4 s. What is $v$ at the end?`,
      options: [`4 m/s`, `12 m/s`, `16 m/s`, `8 m/s`],
      answer: 0,
      explanation: `$\\Delta v_1 = 4 \\times 3 = +12$ → $v = 12$. $\\Delta v_2 = 0$ → $v = 12$. $\\Delta v_3 = -2 \\times 4 = -8$ → $v = 4$ m/s.`,
    },
    {
      id: 'p1-ch2-005-q8',
      question: `Which statement about the kinematic chain is correct?`,
      options: [
        `Differentiating position gives acceleration`,
        `Integrating acceleration gives displacement, integrating displacement gives position`,
        `Differentiating position gives velocity; differentiating velocity gives acceleration`,
        `Integrating position gives velocity`,
      ],
      answer: 2,
      explanation: `The chain: $x \\xrightarrow{d/dt} v \\xrightarrow{d/dt} a$ (differentiation going right) and $a \\xrightarrow{\\int dt} \\Delta v \\xrightarrow{\\int dt} \\Delta x$ (integration going left).`,
    },
  ],
};
