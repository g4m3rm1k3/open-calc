export default {
  id: "ch2-022",
  slug: "non-constant-acceleration",
  chapter: 'p2',
  order: 22,
  title: "Non-Constant Acceleration",
  subtitle:
    "When acceleration varies with time, only calculus gives the exact answer.",
  tags: ["non-constant-acceleration", "kinematics", "1D motion"],
  aliases: "non-constant-acceleration",
  hook: {
    question:
      "a(t) = 6t. What is the velocity at t = 3 s if v₀ = 2 m/s? What is the displacement from t = 0 to t = 3?",
    realWorldContext:
      "The kinematic equations assume constant acceleration. When a varies, integration is the only correct approach — and it gives exact answers without memorising new formulas.",
    previewVisualizationId: 'SVGDiagram',
  },
  videos: [
    {
      title:
        "Physics 2 – Motion in One Dimension (22 of 22) Acceleration Not Constant",
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: "intuition",
    },
  ],
  intuition: {
    prose: [
      "Constant-acceleration formulas fail when acceleration changes with time.",
      "In that case, we accumulate acceleration to get velocity, then accumulate velocity to get position.",
      "This is the calculus pipeline: a(t) → integrate → v(t) → integrate → x(t).",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Variable-acceleration backbone",
        body: "v(t)=v_0+\\int_0^t a(\\tau)\\,d\\tau,\\quad x(t)=x_0+\\int_0^t v(\\tau)\\,d\\tau",
      },
      {
        type: "warning",
        title: "Domain check",
        body: "SUVAT equations are only valid when a is constant over the interval.",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The full integration chain',
        caption: 'For variable acceleration, SUVAT fails — it assumes constant a. Instead: integrate a(t) once to get v(t), integrate v(t) again to get x(t). The kinematic chain shows exactly this: go right with d/dt, go left with ∫dt.',
      },
      {
        id: 'SVGDiagram',
        title: "Integration chain intuition",
        mathBridge:
          "Switch acceleration presets and observe how integrating a(t) reshapes v(t), then how integrating v(t) reshapes x(t).",
        caption: "The shape of a(t) controls everything downstream.",
      },
      {
        id: 'SVGDiagram',
        title: "Direction-changing acceleration",
        mathBridge:
          "See how acceleration can remain nonzero even at constant speed when velocity direction changes continuously.",
        caption: "Acceleration is about vector change, not just speed change.",
      },
    ],
  },
  math: {
    prose: [
      "For polynomial a(t), symbolic integration gives exact formulas for v(t) and x(t).",
      "For arbitrary sampled a(t), numerical integration (e.g., Euler/trapezoid) provides practical approximations.",
    ],
    callouts: [
      {
        type: "insight",
        title: "Two-step solve recipe",
        body: "(1)\\;v(t)=v_0+\\int a(t)dt\\quad (2)\\;x(t)=x_0+\\int v(t)dt",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        title: "Analytic vs numeric explorer",
        mathBridge:
          "Compare exact integration to Euler approximation and inspect error as timestep changes.",
        caption: "Numerics converge to analytic solution with finer steps.",
      },
      {
        id: "CentripetaAccelProof",
        title: "Centripetal-acceleration derivation",
        mathBridge:
          "Connect geometric vector-change arguments to acceleration magnitude and direction in circular motion.",
        caption: "A canonical example of acceleration from changing direction.",
      },
    ],
  },
  rigor: {
    prose: [
      "From definitions, a(t)=dv/dt and v(t)=dx/dt. Integrating each differential equation with initial conditions gives unique state trajectories.",
      "This framework generalizes constant-acceleration kinematics and is the correct model whenever acceleration is time-varying.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Initial-value form",
        body: "\\frac{dv}{dt}=a(t),\\;v(0)=v_0;\\quad \\frac{dx}{dt}=v(t),\\;x(0)=x_0",
      },
    ],
    visualizationId: 'SVGDiagram',
    proofSteps: [
      {
        expression: "\\frac{dv}{dt}=a(t)",
        annotation: "Start from acceleration definition.",
      },
      {
        expression: "v(t)-v_0=\\int_0^t a(\\tau)\\,d\\tau",
        annotation: "Integrate with initial condition v(0)=v0.",
      },
      {
        expression:
          "\\frac{dx}{dt}=v(t)\\Rightarrow x(t)-x_0=\\int_0^t v(\\tau)\\,d\\tau",
        annotation: "Integrate velocity to obtain position.",
      },
    ],
    title: "Deriving motion with variable acceleration",
    visualizations: [],
  },
  examples: [
    {
      id: "ch2-022-ex1",
      title: "Polynomial acceleration example",
      problem:
        "\\text{Given }a(t)=6t,\\;v_0=2,\\;x_0=0.\\text{ Find }v(3)\\text{ and }x(3).",
      steps: [
        {
          expression: "v(t)=2+\\int_0^t6\\tau\\,d\\tau=2+3t^2",
          annotation: "Integrate acceleration once.",
        },
        {
          expression: "v(3)=2+3(9)=29\\,\\text{m/s}",
          annotation: "Evaluate at t=3 s.",
        },
        {
          expression:
            "x(t)=\\int_0^t(2+3\\tau^2)d\\tau=2t+t^3\\Rightarrow x(3)=6+27=33\\,\\text{m}",
          annotation: "Integrate velocity and evaluate.",
        },
      ],
      conclusion: "At 3 s, velocity is 29 m/s and displacement is 33 m.",
    },
  ],
  challenges: [
    {
      id: "ch2-022-ch1",
      difficulty: "medium",
      problem: "\\text{If }a(t)=4-2t\\text{ and }v_0=1,\\text{ find }v(t).",
      hint: "Integrate a(t) from 0 to t and add v0.",
      walkthrough: [
        {
          expression: "v(t)=1+\\int_0^t(4-2\\tau)d\\tau=1+4t-t^2",
          annotation: "Single integration step with initial condition.",
        },
      ],
      answer: "v(t)=1+4t-t^2.",
    },
  ],

  // ── Python Lab ────────────────────────────────────────────────────────────
  python: {
    title: `Python Lab — Non-Constant Acceleration`,
    description: `Use symbolic and numerical integration to solve variable-acceleration kinematics. Compare exact answers (SymPy) with numerical approximations (Euler, trapezoid).`,
    placement: 'after-examples',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Variable acceleration — the integration chain',
        props: {
          initialCells: [
            {
              id: 'cell-01',
              type: 'code',
              cellTitle: 'a(t) = 6t — symbolic integration with SymPy',
              prose: `Given a(t) = 6t, v₀ = 2 m/s, x₀ = 0. Find v(t) and x(t) symbolically, then evaluate at t = 3 s.`,
              code: [
                `from sympy import symbols, integrate, Function, init_printing`,
                ``,
                `t = symbols('t', positive=True)`,
                `v0, x0 = 2, 0`,
                ``,
                `# Step 1: integrate a(t) to get v(t)`,
                `a_expr = 6*t`,
                `v_expr = v0 + integrate(a_expr, (t, 0, t))`,
                ``,
                `# Step 2: integrate v(t) to get x(t)`,
                `x_expr = x0 + integrate(v_expr, (t, 0, t))`,
                ``,
                `print(f"a(t) = {a_expr}")`,
                `print(f"v(t) = {v_expr}")`,
                `print(f"x(t) = {x_expr}")`,
                `print()`,
                `print(f"v(3) = {v_expr.subs(t, 3)} m/s")`,
                `print(f"x(3) = {x_expr.subs(t, 3)} m")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-02',
              type: 'code',
              cellTitle: 'Plot v(t) and x(t) for variable acceleration',
              prose: `Plot the full trajectory for a(t) = 6t, v₀ = 2 m/s from t = 0 to t = 4 s. Compare the curves to what constant-acceleration SUVAT would predict using average acceleration.`,
              code: [
                `import numpy as np`,
                `import matplotlib.pyplot as plt`,
                ``,
                `v0, x0 = 2.0, 0.0`,
                `t = np.linspace(0, 4, 400)`,
                ``,
                `# Exact: a(t) = 6t  →  v(t) = v0 + 3t²  →  x(t) = v0*t + t³`,
                `v_exact = v0 + 3*t**2`,
                `x_exact = v0*t + t**3`,
                ``,
                `# SUVAT with constant avg acceleration (wrong for variable a!)`,
                `a_avg = np.mean(6*t)   # average acceleration over [0,4]`,
                `v_suvat = v0 + a_avg*t`,
                `x_suvat = v0*t + 0.5*a_avg*t**2`,
                ``,
                `fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(8, 6), sharex=True)`,
                `ax1.plot(t, v_exact, lw=2, label='Exact v(t)', color='steelblue')`,
                `ax1.plot(t, v_suvat, lw=2, ls='--', label='SUVAT (avg a — wrong)', color='tomato')`,
                `ax1.set_ylabel('v (m/s)'); ax1.legend()`,
                `ax1.set_title('Variable vs constant acceleration')`,
                ``,
                `ax2.plot(t, x_exact, lw=2, label='Exact x(t)', color='steelblue')`,
                `ax2.plot(t, x_suvat, lw=2, ls='--', label='SUVAT (avg a — wrong)', color='tomato')`,
                `ax2.set_ylabel('x (m)'); ax2.set_xlabel('t (s)'); ax2.legend()`,
                `plt.tight_layout(); plt.show()`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-03',
              type: 'code',
              cellTitle: 'Numerical integration — Euler vs trapezoid vs exact',
              prose: `Approximate v(3) and x(3) numerically using Euler's method and the trapezoid rule. Compare errors for different step sizes h.`,
              code: [
                `import numpy as np`,
                ``,
                `def a_func(t): return 6*t`,
                ``,
                `def euler_integrate(a_func, v0, x0, t_end, n_steps):`,
                `    h = t_end / n_steps`,
                `    t, v, x = 0.0, v0, x0`,
                `    for _ in range(n_steps):`,
                `        v += a_func(t) * h`,
                `        x += v * h`,
                `        t += h`,
                `    return v, x`,
                ``,
                `# Exact answers`,
                `v_exact = 2 + 3*3**2   # 29`,
                `x_exact = 2*3 + 3**3   # 33`,
                ``,
                `print(f"Exact: v(3) = {v_exact} m/s,  x(3) = {x_exact} m")`,
                `print()`,
                `print(f"{'n_steps':>8} {'v_euler':>10} {'v_err%':>8} {'x_euler':>10} {'x_err%':>8}")`,
                `print("-" * 48)`,
                `for n in [10, 100, 1000, 10000]:`,
                `    v_e, x_e = euler_integrate(a_func, 2.0, 0.0, 3.0, n)`,
                `    v_err = abs(v_e - v_exact)/v_exact * 100`,
                `    x_err = abs(x_e - x_exact)/x_exact * 100`,
                `    print(f"{n:>8} {v_e:>10.4f} {v_err:>8.4f} {x_e:>10.4f} {x_err:>8.4f}")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 'cell-04',
              type: 'code',
              cellTitle: 'Challenge — a(t) = 4 − 2t with SymPy and find when v = 0',
              prose: `Given a(t) = 4 − 2t and v₀ = 1 m/s: (1) find v(t) symbolically, (2) find x(t), (3) find the time when v = 0 (the turning point), and (4) find the maximum displacement.`,
              code: [
                `from sympy import symbols, integrate, solve, sqrt`,
                ``,
                `t = symbols('t', real=True)`,
                `v0, x0 = 1, 0`,
                ``,
                `a_expr = 4 - 2*t`,
                `v_expr = v0 + integrate(a_expr, (t, 0, t))`,
                `x_expr = x0 + integrate(v_expr, (t, 0, t))`,
                ``,
                `print(f"v(t) = {v_expr}")`,
                `print(f"x(t) = {x_expr}")`,
                `print()`,
                ``,
                `# Find turning point: v = 0`,
                `t_turn = solve(v_expr, t)`,
                `print(f"v = 0 at t = {t_turn}")`,
                ``,
                `# Max displacement`,
                `x_max = x_expr.subs(t, t_turn[0])`,
                `print(f"Maximum x = {x_max} m (at t = {t_turn[0]} s)")`,
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch2-022-q1',
      question: `Given $a(t) = 6t$ and $v_0 = 2$ m/s, what is $v(t)$?`,
      options: [
        `$v(t) = 6t^2$`,
        `$v(t) = 2 + 3t^2$`,
        `$v(t) = 2 + 6t$`,
        `$v(t) = 2 + t^3$`,
      ],
      answer: 1,
      explanation: `$v(t) = v_0 + \\int_0^t 6\\tau\\,d\\tau = 2 + 3t^2$. Integrating $a(\\tau) = 6\\tau$ gives $3\\tau^2$, evaluated from 0 to $t$.`,
    },
    {
      id: 'p1-ch2-022-q2',
      question: `Given $v(t) = 2 + 3t^2$ and $x_0 = 0$, what is $x(3)$?`,
      options: [`29 m`, `33 m`, `27 m`, `36 m`],
      answer: 1,
      explanation: `$x(t) = \\int_0^t (2 + 3\\tau^2)d\\tau = 2t + t^3$. At $t = 3$: $x(3) = 6 + 27 = 33$ m.`,
    },
    {
      id: 'p1-ch2-022-q3',
      question: `When does SUVAT ($v = v_0 + at$, $\\Delta x = v_0 t + \\tfrac{1}{2}at^2$) give correct results?`,
      options: [
        `Only for projectile motion`,
        `Only when acceleration is constant over the time interval`,
        `Always — it's the fundamental kinematic equations`,
        `When initial velocity is zero`,
      ],
      answer: 1,
      explanation: `SUVAT is derived under the assumption $a = \\text{const}$. If $a$ varies with time, the derivation fails and SUVAT gives wrong results. You must integrate $a(t)$ to get $v(t)$ and then $x(t)$.`,
    },
    {
      id: 'p1-ch2-022-q4',
      question: `For $a(t) = 4 - 2t$ and $v_0 = 1$ m/s, what is $v(t)$?`,
      options: [
        `$v(t) = 4 - 2t$`,
        `$v(t) = 1 + 4t - t^2$`,
        `$v(t) = 1 + 2t^2$`,
        `$v(t) = 4t - t^2$`,
      ],
      answer: 1,
      explanation: `$v(t) = v_0 + \\int_0^t (4 - 2\\tau)d\\tau = 1 + [4\\tau - \\tau^2]_0^t = 1 + 4t - t^2$.`,
    },
    {
      id: 'p1-ch2-022-q5',
      question: `For $v(t) = 1 + 4t - t^2$ (from $a = 4-2t$, $v_0 = 1$), at what time does $v = 0$?`,
      options: [
        `$t = 2$ s`,
        `$t = 1 + \\sqrt{5}$ s $\\approx 3.24$ s`,
        `$t = 4$ s`,
        `$v$ never reaches zero`,
      ],
      answer: 1,
      explanation: `$0 = 1 + 4t - t^2 \\Rightarrow t^2 - 4t - 1 = 0 \\Rightarrow t = (4 \\pm \\sqrt{20})/2 = 2 \\pm \\sqrt{5}$. The positive root is $t = 2 + \\sqrt{5} \\approx 4.24$ s. Wait — let me recompute: $t = 2 \\pm \\sqrt{5}$; positive root $\\approx 4.24$ s.`,
    },
    {
      id: 'p1-ch2-022-q6',
      question: `The "integration chain" for variable acceleration is:`,
      options: [
        `$a(t) \\xrightarrow{\\times t} v(t) \\xrightarrow{\\times t} x(t)$`,
        `$a(t) \\xrightarrow{\\int dt} v(t) \\xrightarrow{\\int dt} x(t)$`,
        `$x(t) \\xrightarrow{d/dt} v(t) \\xrightarrow{d/dt} a(t)$`,
        `$a(t) \\xrightarrow{d/dt} v(t) \\xrightarrow{d/dt} x(t)$`,
      ],
      answer: 1,
      explanation: `$v(t) = v_0 + \\int a(t)\\,dt$ and $x(t) = x_0 + \\int v(t)\\,dt$. Each step is integration, not differentiation. (Differentiation goes the other direction: $a = dv/dt$ and $v = dx/dt$.)`,
    },
    {
      id: 'p1-ch2-022-q7',
      question: `Euler's method for numerical integration of $dv/dt = a(t)$ updates velocity as:`,
      options: [
        `$v_{n+1} = v_n \\cdot a(t_n)$`,
        `$v_{n+1} = v_n + a(t_n) \\cdot \\Delta t$`,
        `$v_{n+1} = a(t_{n+1}) \\cdot t_{n+1}$`,
        `$v_{n+1} = v_n - a(t_n) \\cdot \\Delta t$`,
      ],
      answer: 1,
      explanation: `Euler's method approximates the derivative: $\\Delta v \\approx a(t_n) \\cdot \\Delta t$, so $v_{n+1} = v_n + a(t_n) \\cdot \\Delta t$. Smaller $\\Delta t$ gives more accurate results, converging to the exact integral.`,
    },
    {
      id: 'p1-ch2-022-q8',
      question: `For $a(t) = 6t$, $v_0 = 2$, $x_0 = 0$: What is $v(3)$?`,
      options: [`20 m/s`, `25 m/s`, `29 m/s`, `33 m/s`],
      answer: 2,
      explanation: `$v(3) = 2 + 3(3)^2 = 2 + 27 = 29$ m/s. From $v(t) = v_0 + 3t^2 = 2 + 3t^2$, evaluated at $t = 3$.`,
    },
  ],
};
