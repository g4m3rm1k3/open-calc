export default {
  id: "ch2-006",
  slug: "linked-motion-graphs",
  chapter: 'p2',
  order: 6,
  title: "Linking x(t), v(t), and a(t)",
  subtitle:
    "One motion, three graphs. Differentiate downward, integrate upward — and never lose the thread.",
  tags: ["triple graph", "derivative chain", "integral chain", "kinematics", "differentiation", "integration"],
  aliases: "x v a relationship triple graphs position velocity acceleration linked",

  hook: {
    question:
      "An engineering team has three screens: one showing x(t), one showing v(t), and one showing a(t) for the same rocket launch. Suddenly, x(t) shows a brief pause in climb. What must v(t) and a(t) look like at that moment? Can you predict the shape of all three screens from just one of them?",
    realWorldContext:
      "Flight computers, robotics trajectory planners, and biomechanics labs routinely transform between these three representations. A physical therapist analyzing a patient's gait reads x(t) from motion capture, then computes v(t) and a(t) numerically to detect muscle force abnormalities. A rocket guidance system compares commanded a(t) against measured a(t) from an accelerometer, then integrates twice to estimate x(t). Understanding the three-graph chain — and how to move up and down it — is the core skill that connects physics to calculus.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      "Position, velocity, and acceleration are not three separate things — they are one motion described three different ways. Every physical trajectory generates all three graphs simultaneously. If you know any one of them completely (plus initial conditions), you can reconstruct the other two exactly. The chain is: x(t) → differentiate → v(t) → differentiate → a(t), and in reverse: a(t) → integrate → v(t) → integrate → x(t).",
      "Reading the chain downward (differentiation): the slope of x(t) at each moment is v(t) at that moment. When the x-graph climbs steeply, the v-graph is large and positive. When x peaks (flat tangent), v = 0. When x descends, v is negative. Apply the same logic one more time: the slope of v(t) is a(t). When v is increasing (v-graph climbs), a is positive. When v peaks, a = 0. When v decreases, a is negative.",
      "Reading the chain upward (integration): the area under a(t) from t₁ to t₂ gives the change in velocity Δv. The area under v(t) from t₁ to t₂ gives the displacement Δx. This is the FTC in physics clothing — and it runs in the opposite direction from differentiation. To reconstruct x(t) from a(t), you need two pieces of information that the a-graph cannot provide: the initial position x₀ and the initial velocity v₀. These are the 'constants of integration' from calculus.",
      "The key mental skill is reading features across all three graphs for the same instant: a flat spot on x (local maximum or minimum) corresponds to a zero crossing on v and a specific sign of a. An inflection point on x (where x changes concavity) corresponds to a local extremum on v and a zero crossing on a. These correspondences let you check consistency: if the graphs disagree, one of them is wrong.",
      "Why does this matter for physics? Because different measurement tools access different levels of the chain. Accelerometers measure a(t) directly. Position sensors (GPS, encoders) measure x(t) directly. Velocity sensors exist but are less common. By knowing the chain, you can always convert measured data to whatever representation you need — and detect errors when measured x doesn't match twice-integrated measured a.",
    ],
    callouts: [
      {
        type: "intuition",
        title: "Feature Translation Table",
        body: "x has a peak or trough → v = 0 at that moment. x has an inflection point → v has a peak or trough → a = 0. x has constant slope → v is constant → a = 0. x has increasing slope (curving up) → v is positive → a is positive. Memorize this table: it's the core of graph reading.",
      },
      {
        type: "tip",
        title: "Calculus Connection: This IS Differential Calculus",
        body: "The derivative chain v = dx/dt, a = dv/dt = d²x/dt² is the core application of Calculus Chapter 2. The integral chain Δx = ∫v dt, Δv = ∫a dt is the core application of Calculus Chapter 4 (Integration). Kinematics is not just 'using calculus' — it IS calculus, applied to motion. Every chain-rule, every FTC, every integration-by-parts problem you will ever see in physics begins from this three-graph structure.",
      },
      {
        type: "prior-knowledge",
        title: "Initial Conditions Are Needed for Integration",
        body: "Differentiation is unique: given x(t), there is exactly one v(t) and one a(t). Integration is not: given a(t), there are infinitely many v(t) functions (differing by a constant C₁). Given v(t), there are infinitely many x(t) functions (differing by C₂). Initial conditions x₀ and v₀ pin down these constants. Without them, you know the shape but not where the motion starts.",
      },
      {
        type: "misconception",
        title: "The Graphs Are NOT Independent",
        body: "Students sometimes draw x, v, and a graphs that are mutually inconsistent — for example, drawing a v-graph with a peak where the x-graph has no inflection point. This is mathematically impossible. The three graphs are as coupled as cause and effect: they are different representations of the same function. Always check that slope of x matches the value of v, and slope of v matches the value of a.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The x → v → a chain',
        caption: 'Each arrow is a derivative; each reverse arrow is an integral. The entire kinematics course lives in this one diagram.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'xt-vt-graphs' },
        title: 'x–v–a: one motion, three synchronized views',
        caption: `Peaks on x–t → zero crossing on v–t. Inflection points on x–t → peaks/troughs on v–t → zero on a–t. Steep x → large v. Constant x-slope → constant v → zero a. Use this feature-translation table to read any of the three graphs from the other two.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Parameter-driven consistency check',
        caption: `For x₀ = 5, v₀ = 2, a = 3: x(t) = 5 + 2t + 1.5t², v(t) = 2 + 3t, a(t) = 3. At any time t, the slope of the parabola (x–t) equals the height of the line (v–t), and the slope of the line equals the height of the constant (a–t). The three graphs cannot contradict each other.`,
      },
    ],
  },

  math: {
    prose: [
      "The formal chain uses derivatives and antiderivatives. Going down: v(t) = dx/dt (instantaneous velocity is the time-derivative of position); a(t) = dv/dt = d²x/dt² (acceleration is the first derivative of velocity, or equivalently the second derivative of position).",
      "Going up: given a(t) and initial conditions, find v(t) = v₀ + ∫₀ᵗ a(t') dt' by integrating once; find x(t) = x₀ + ∫₀ᵗ v(t') dt' by integrating again. The notation v₀ = v(0) and x₀ = x(0) is standard for the initial values at t = 0.",
      "For constant acceleration, the integrals close in algebra (no calculus needed for the computation, though calculus proves why the formulas are correct): v(t) = v₀ + at and x(t) = x₀ + v₀t + ½at². These are the SUVAT equations — they're what you get from integrating the constant-a graph twice and applying initial conditions.",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Derivative chain (going down)",
        body: "v(t) = \\frac{dx}{dt}, \\qquad a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}",
      },
      {
        type: "theorem",
        title: "Integral chain (going up)",
        body: "v(t) = v_0 + \\int_0^t a(t')\\,dt', \\qquad x(t) = x_0 + \\int_0^t v(t')\\,dt'",
      },
      {
        type: "definition",
        title: "SUVAT (constant acceleration only)",
        body: "v = v_0 + at, \\quad x = x_0 + v_0 t + \\tfrac{1}{2}at^2, \\quad v^2 = v_0^2 + 2a\\,\\Delta x",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'Choosing the right operation',
        caption: `Going from x to v: differentiate (d/dt). From v to a: differentiate again. Going from a to v: integrate (add initial condition v₀). From v to x: integrate again (add x₀). Identify your starting point and destination in the chain, then choose differentiation or integration accordingly.`,
      },
    ],
  },

  rigor: {
    title: "Why the chain works — FTC applied twice",
    prose: [
      "The chain is a direct consequence of the Fundamental Theorem of Calculus (FTC) applied twice. First application: since v = dx/dt (v is the derivative of x), the FTC says ∫_{t₁}^{t₂} v(t) dt = x(t₂) − x(t₁) = Δx. So 'area under v–t gives Δx' is the FTC.",
      "Second application: since a = dv/dt (a is the derivative of v), the FTC gives ∫_{t₁}^{t₂} a(t) dt = v(t₂) − v(t₁) = Δv. These two FTC statements are the entire mathematical foundation of kinematic graph reading.",
      "The uniqueness of the reconstruction (given initial conditions) follows from the uniqueness theorem for antiderivatives: if two functions have the same derivative everywhere, they differ by at most a constant. So there is exactly one velocity function consistent with a given acceleration function AND a given v₀.",
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      {
        expression: "v(t) = \\frac{dx}{dt}",
        annotation: "Velocity is defined as the time-derivative of position.",
      },
      {
        expression: "a(t) = \\frac{dv}{dt} = \\frac{d^2 x}{dt^2}",
        annotation: "Acceleration is the derivative of velocity — or the second derivative of position.",
      },
      {
        expression: "\\Delta x = \\int_{t_1}^{t_2} v(t)\\,dt \\quad \\text{(by FTC)}",
        annotation: "Since v = dx/dt, integrate v to recover displacement. FTC: antiderivative of v is x.",
      },
      {
        expression: "\\Delta v = \\int_{t_1}^{t_2} a(t)\\,dt \\quad \\text{(by FTC)}",
        annotation: "Since a = dv/dt, integrate a to recover velocity change.",
      },
      {
        expression: "x(t) = x_0 + \\int_0^t v\\,dt, \\quad v(t) = v_0 + \\int_0^t a\\,dt",
        annotation: "Full reconstruction using both integrals with initial conditions.",
      },
    ],
  },

  examples: [
    {
      id: "ch2-006-ex1",
      title: "Reconstruct position from constant acceleration",
      problem:
        "An object starts at x₀ = 5 m with v₀ = 2 m/s and constant acceleration a = 3 m/s². Find v(t) and x(t), then find x and v at t = 4 s.",
      steps: [
        {
          expression: "v(t) = v_0 + at = 2 + 3t",
          annotation: "Integrate constant acceleration with initial velocity.",
        },
        {
          expression: "x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2 = 5 + 2t + 1.5t^2",
          annotation: "Integrate velocity with initial position.",
        },
        {
          expression: "v(4) = 2 + 3(4) = 14 \\text{ m/s}",
          annotation: "Evaluate v at t = 4.",
        },
        {
          expression: "x(4) = 5 + 2(4) + 1.5(16) = 5 + 8 + 24 = 37 \\text{ m}",
          annotation: "Evaluate x at t = 4.",
        },
      ],
      conclusion:
        "At t = 4 s: v = 14 m/s, x = 37 m. Both follow directly by integrating down from the given constant acceleration.",
    },
    {
      id: "ch2-006-ex2",
      title: "Read from x(t) — find v and a",
      problem:
        "An object's position is x(t) = 4t³ − 12t² + 9t. Find v(t) and a(t). When is the object stopped? When is it accelerating positively?",
      steps: [
        {
          expression: "v(t) = \\frac{dx}{dt} = 12t^2 - 24t + 9",
          annotation: "Differentiate x(t) using the power rule.",
        },
        {
          expression: "a(t) = \\frac{dv}{dt} = 24t - 24",
          annotation: "Differentiate v(t).",
        },
        {
          expression: "v = 0: \\quad 12t^2 - 24t + 9 = 0 \\Rightarrow t = \\frac{24 \\pm \\sqrt{576-432}}{24} = \\frac{24 \\pm 12}{24}",
          annotation: "Quadratic formula. Object stops at these two times.",
        },
        {
          expression: "t = \\tfrac{1}{2} \\text{ s and } t = \\tfrac{3}{2} \\text{ s}",
          annotation: "Two stops: once on the way out, once on the way back.",
        },
        {
          expression: "a > 0 \\text{ when } 24t - 24 > 0 \\Rightarrow t > 1 \\text{ s}",
          annotation: "Positively accelerating after t = 1 s.",
        },
      ],
      conclusion:
        "Object stops at t = 0.5 s and t = 1.5 s. It accelerates positively for all t > 1 s. The three graphs are fully determined by the one formula x(t) — differentiate to read everything.",
    },
  ],

  challenges: [
    {
      id: "ch2-006-ch1",
      difficulty: "medium",
      problem: "If x(t) is a straight line (linear), what must v(t) and a(t) look like?",
      hint: "Differentiate a linear function twice.",
      answer:
        "v(t) = slope of x(t) = constant. a(t) = derivative of a constant = 0. Linear x means constant velocity and zero acceleration.",
    },
    {
      id: "ch2-006-ch2",
      difficulty: "hard",
      problem:
        "You are given only a(t) = sin(t) with v(0) = 0 and x(0) = 0. Find x(t). At what times does the object return to x = 0?",
      hint: "Integrate twice. Use the initial conditions to find the constants.",
      answer:
        "v(t) = ∫sin(t)dt = −cos(t) + C₁. With v(0) = 0: −cos(0) + C₁ = 0 → C₁ = 1 → v(t) = 1 − cos(t). Then x(t) = ∫(1−cos t)dt = t − sin(t) + C₂. With x(0) = 0: C₂ = 0 → x(t) = t − sin(t). The object never returns to x = 0 for t > 0 since t − sin(t) > 0 for all t > 0 (can verify: f = t − sin t, f' = 1 − cos t ≥ 0 with equality only at t = 2πk, so f is monotonically non-decreasing).",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Linking x(t), v(t), and a(t)`,
    description: `Use numerical differentiation and integration to move up and down the kinematic chain. Verify that slope-of-x equals v and area-under-a equals Δv.`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The kinematic chain in Python',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'From x(t) down to v(t) and a(t)',
              prose: `Given x(t) = 4t³ − 12t² + 9t, differentiate symbolically and numerically.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `t = np.linspace(0, 3, 1000)`,
                ``,
                `# Analytical`,
                `x = 4*t**3 - 12*t**2 + 9*t`,
                `v = 12*t**2 - 24*t + 9   # dx/dt`,
                `a = 24*t - 24             # dv/dt`,
                ``,
                `fig, axes = plt.subplots(3, 1, figsize=(8, 9), sharex=True)`,
                `for ax, y, lbl, col in zip(axes, [x, v, a], ['x (m)', 'v (m/s)', 'a (m/s²)'], ['b','r','g']):`,
                `    ax.plot(t, y, color=col, linewidth=2)`,
                `    ax.axhline(0, color='k', linewidth=0.8, linestyle='--')`,
                `    ax.set_ylabel(lbl); ax.grid(True, alpha=0.4)`,
                `axes[-1].set_xlabel('Time (s)')`,
                `fig.suptitle('x–v–a chain: x = 4t³ − 12t² + 9t', fontsize=13)`,
                `plt.tight_layout()`,
                `plt.savefig('xva_chain.png', dpi=100, bbox_inches='tight')`,
                `plt.show()`,
                ``,
                `# Find stops (v = 0)`,
                `zero_crossings = t[np.where(np.diff(np.sign(v)))[0]]`,
                `print(f"Object stops near t = {zero_crossings.round(2)} s")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Reconstruct v and x from a (integration)',
              prose: `Given a(t) = 3 m/s², v₀ = 2 m/s, x₀ = 5 m — integrate upward.`,
              code: [
                `dt = 0.001`,
                `t2 = np.arange(0, 5, dt)`,
                `a_const = 3.0`,
                ``,
                `# Cumulative integration (Euler method)`,
                `v2 = np.zeros_like(t2)`,
                `x2 = np.zeros_like(t2)`,
                `v2[0] = 2.0   # v₀`,
                `x2[0] = 5.0   # x₀`,
                ``,
                `for i in range(1, len(t2)):`,
                `    v2[i] = v2[i-1] + a_const * dt`,
                `    x2[i] = x2[i-1] + v2[i-1] * dt`,
                ``,
                `# Analytical check`,
                `v_exact = 2 + 3*t2`,
                `x_exact = 5 + 2*t2 + 1.5*t2**2`,
                `print(f"Max v error: {np.max(np.abs(v2 - v_exact)):.6f}")`,
                `print(f"Max x error: {np.max(np.abs(x2 - x_exact)):.4f}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Consistency check — does slope of x match v?',
              prose: `Numerically differentiate x and compare to v.`,
              code: [
                `# Numerical derivative of x (central differences)`,
                `v_numerical = np.gradient(x2, t2)`,
                ``,
                `max_err = np.max(np.abs(v_numerical - v2))`,
                `print(f"Max difference between numerical dx/dt and integrated v: {max_err:.6f} m/s")`,
                `print("Graphs are consistent ✓")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — reconstruct x(t) from noisy a(t) data',
              prose: `Given accelerometer data (with noise), integrate twice to estimate position.`,
              code: [
                `np.random.seed(42)`,
                `t_noisy = np.linspace(0, 5, 500)`,
                `a_true = 3.0 * np.ones_like(t_noisy)   # true: constant 3 m/s²`,
                `a_noisy = a_true + np.random.normal(0, 0.5, len(t_noisy))  # sensor noise`,
                ``,
                `# TODO: integrate a_noisy twice (using np.cumsum or np.trapz)`,
                `# with v0=2, x0=5 to recover v_est and x_est`,
                `# Plot x_est vs x_exact = 5 + 2t + 1.5t² and measure the error`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Integrate noisy accelerometer data',
              difficulty: 'hard',
              prompt: `Integrate the noisy acceleration data twice to estimate position. Compare to the exact solution.`,
              starterBlock: ``,
              testCode: [
                `dt_noisy = t_noisy[1] - t_noisy[0]`,
                `v_est = 2.0 + np.cumsum(a_noisy) * dt_noisy`,
                `x_est = 5.0 + np.cumsum(v_est) * dt_noisy`,
                `x_exact2 = 5 + 2*t_noisy + 1.5*t_noisy**2`,
                `rms_err = np.sqrt(np.mean((x_est - x_exact2)**2))`,
                `print(f"RMS position error: {rms_err:.2f} m")`,
                `print("Integration from noisy data tested ✓")`,
              ].join('\n'),
              hint: `v_est = v0 + cumsum(a_noisy) * dt. x_est = x0 + cumsum(v_est) * dt. Noise in a accumulates when you integrate — small errors in a can become large errors in x over time.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-006-q1',
      question: `If $x(t)$ has a local maximum (peak), what must $v(t)$ equal at that instant?`,
      options: [`Maximum value`, `0`, `Same as acceleration`, `Negative`],
      answer: 1,
      explanation: `At a peak of $x$, the tangent is horizontal → slope = 0 → $v = dx/dt = 0$. The object is momentarily stopped at the peak.`,
    },
    {
      id: 'p1-ch2-006-q2',
      question: `An inflection point on $x(t)$ corresponds to what feature on $v(t)$?`,
      options: [`A zero crossing`, `A local maximum or minimum`, `A constant segment`, `A discontinuity`],
      answer: 1,
      explanation: `At an inflection point of $x$, the concavity changes — meaning $v'(t) = a(t) = 0$ at that point. Zero acceleration at the inflection point means $v$ has a local extremum there.`,
    },
    {
      id: 'p1-ch2-006-q3',
      question: `To reconstruct $v(t)$ from $a(t)$, you need:`,
      options: [
        `Only the acceleration function`,
        `The acceleration function plus initial velocity $v_0$`,
        `The position function`,
        `No additional information`,
      ],
      answer: 1,
      explanation: `Integration adds a constant: $v(t) = v_0 + \\int a\\,dt$. Without $v_0$, you know the shape of $v(t)$ but not its vertical position. The initial condition pins down the constant.`,
    },
    {
      id: 'p1-ch2-006-q4',
      question: `For $x(t) = 4t^3 - 12t^2 + 9t$, when is $v = 0$?`,
      options: [`$t = 0$ only`, `$t = 0.5$ s and $t = 1.5$ s`, `$t = 1$ s only`, `Never`],
      answer: 1,
      explanation: `$v = 12t^2 - 24t + 9 = 0$. Quadratic formula: $t = (24 \\pm \\sqrt{576 - 432})/24 = (24 \\pm 12)/24$, giving $t = 0.5$ s and $t = 1.5$ s.`,
    },
    {
      id: 'p1-ch2-006-q5',
      question: `Which pair of operations moves you down and then back up the kinematic chain?`,
      options: [
        `Integrate then differentiate`,
        `Multiply then divide`,
        `Differentiate then integrate`,
        `Add then subtract`,
      ],
      answer: 2,
      explanation: `Differentiating $x$ gives $v$; integrating $v$ gives $x$ back (plus a constant). These are inverse operations by the FTC. Similarly: differentiate $v$ to get $a$; integrate $a$ to get $v$.`,
    },
    {
      id: 'p1-ch2-006-q6',
      question: `A straight-line (constant slope) $x(t)$ graph implies:`,
      options: [
        `Constant acceleration`,
        `Zero velocity`,
        `Constant velocity and zero acceleration`,
        `Variable acceleration`,
      ],
      answer: 2,
      explanation: `Constant slope = constant first derivative = constant $v$. Derivative of a constant is zero, so $a = 0$. This is uniform motion.`,
    },
    {
      id: 'p1-ch2-006-q7',
      question: `"Area under v–t gives Δx" and "slope of x–t gives v" are consequences of:`,
      options: [
        `SUVAT equations`,
        `The Fundamental Theorem of Calculus`,
        `Newton's second law`,
        `The Pythagorean theorem`,
      ],
      answer: 1,
      explanation: `Both follow directly from the FTC: since $v = dx/dt$, position is the antiderivative of velocity, so $\\int v\\,dt = \\Delta x$. The FTC is the bridge between derivatives and integrals.`,
    },
    {
      id: 'p1-ch2-006-q8',
      question: `For $a(t) = \\sin(t)$ with $v(0) = 0$ and $x(0) = 0$, what is $v(t)$?`,
      options: [
        `$\\cos(t)$`,
        `$-\\cos(t)$`,
        `$1 - \\cos(t)$`,
        `$\\sin(t)$`,
      ],
      answer: 2,
      explanation: `$v(t) = v_0 + \\int_0^t \\sin(t')\\,dt' = 0 + [-\\cos(t')]_0^t = -\\cos(t) + 1 = 1 - \\cos(t)$.`,
    },
  ],
};
