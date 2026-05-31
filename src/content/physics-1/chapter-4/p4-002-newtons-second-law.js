export default {
  id: 'p1-ch4-002',
  slug: 'newtons-second-law',
  chapter: 'p4',
  order: 1,
  title: "Newton's Second Law: F = ma",
  subtitle: 'Net force equals mass times acceleration — the master equation of classical mechanics.',
  tags: ['newtons-laws', 'force', 'acceleration', 'mass', 'dynamics', 'vectors'],

  hook: {
    question: `A motorcycle and an eighteen-wheeler are both pushed by exactly the same engine force. The motorcycle rockets forward; the truck barely moves. A feather and a steel ball dropped in a vacuum hit the ground at the same time. A rocket burns more fuel in the first second than most cars use in a year, and accelerates at only 1.5 g. How does one equation explain all three of these facts?`,
    realWorldContext: `F = ma is the master equation of classical mechanics. It is not a definition, not a coincidence, and not a simplification — it is the quantitative law that connects the physical world (forces) to the mathematical world (derivatives). Every bridge, every rocket, every car suspension, every satellite orbit, every crash simulation is computed by applying this equation, often millions of times per second in a computer. Newton wrote it down in 1687. Engineers still use it today without modification. Understanding why it works and what each symbol means is the gateway to understanding all of dynamics.`,
    previewVisualizationId: 'ForceBlockSim',
  },

  intuition: {
    prose: [
      `**Where you are in the story.** Newton's First Law established the baseline: when net force is zero, acceleration is zero, and objects maintain constant velocity. But the First Law said nothing about what happens when net force is NOT zero. That is the Second Law's job. It answers the question the First Law deliberately leaves open: if a net force does exist, how much acceleration results? The answer is the most important single equation in all of classical physics.`,

      `**The two-variable experiment that builds intuition.** Imagine a frictionless air hockey table. You push a 1 kg puck with a steady force of 10 N. It accelerates at 10 m/s². Now you swap it for a 2 kg puck and push with the same 10 N. It accelerates at only 5 m/s² — exactly half as much. Swap in a 5 kg puck: 2 m/s². The pattern is unmistakable: double the mass, half the acceleration. The relationship is a = F/m, or equivalently F = ma. Now vary the force instead: push the 1 kg puck with 5 N and it accelerates at 5 m/s². Push with 20 N: 20 m/s². Double the force, double the acceleration. Force drives acceleration; mass resists it. The equation F = ma captures both facts in one compressed statement.`,

      `**What "net" means — and why it's everything.** The F in F = ma is not any single force acting on the object. It is the NET force — the vector sum of every force acting simultaneously. This distinction is critical. A 1000 N engine force and a 900 N friction force give a net force of 100 N. The 2000 kg car accelerates at 100/2000 = 0.05 m/s², not at 1000/2000 = 0.5 m/s². Ignoring any force — even a "small" friction force — gives the wrong answer. This is why free body diagrams (the next lesson) are so important: they are a systematic tool for finding the net force by accounting for every individual force first.`,

      `**Mass and weight are different things.** Mass is the resistance to acceleration — the m in F = ma. It is measured in kilograms. Weight is a force — specifically, the gravitational force on an object near the Earth's surface, W = mg. It is measured in Newtons. Your mass is the same on Earth, on the Moon, and in deep space. Your weight is different in all three places because g is different. On the Moon (g ≈ 1.6 m/s²), you weigh about 1/6 as much as on Earth, but you are no easier to throw horizontally — the same F would give the same horizontal acceleration because your mass is unchanged. This is a distinction that confuses many people because everyday language conflates "heavy" (large weight) with "hard to accelerate" (large mass), but in physics they are different concepts with different units.`,

      `**Force and acceleration are both vectors — direction matters.** F = ma is a vector equation. The acceleration vector points in exactly the same direction as the net force vector. If the net force points northeast, the acceleration points northeast. If the net force points downward, the acceleration points downward — even if the object is currently moving upward (this is the famous "decelerating ball" scenario: gravity pulls down, the ball is thrown up, the net force is down, so the acceleration is down, which decelerates the upward motion and eventually reverses it). In 2D problems, the equation splits into two independent scalar equations: ΣFₓ = maₓ and ΣFᵧ = maᵧ. You apply the Second Law to each component separately.`,

      `**The calculus connection: F = ma is a differential equation.** Acceleration is the second derivative of position: a = d²x/dt². So Newton's Second Law is really F = m·(d²x/dt²). This is a second-order ordinary differential equation — the most important ODE in all of physics. For constant force (the most common case), the solution is immediate: integrate once to get v(t) = v₀ + (F/m)t, and integrate again to get x(t) = x₀ + v₀t + ½(F/m)t². You recognize these as the kinematic equations from Chapter 2. They are not separate laws — they are the consequence of integrating F = ma. Every kinematic equation you ever used was secretly Newton's Second Law in disguise.`,

      `**Why the motorcycle beats the truck.** The engine provides the same force F. The motorcycle has mass m ≈ 250 kg; the loaded truck has mass M ≈ 20,000 kg. Motorcycle acceleration: a_m = F/250. Truck acceleration: a_T = F/20000. The ratio is 80:1. The same force gives 80 times more acceleration to the lighter vehicle. This is why Formula 1 cars (low mass, large engine force) can achieve 5g acceleration: the engine-to-mass ratio is exceptional. It is also why rockets burn so much fuel — fuel is heavy, and the rocket must accelerate its own fuel mass as well as the payload, dramatically reducing the effective force-to-mass ratio at launch.`,
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 9 — From "why" to "how much"',
        body: `**Chapter 4 Lesson 1 (First Law):** Established that net force zero → acceleration zero. Set the baseline.
**This lesson (Second Law):** Answers "how much acceleration?" when net force is not zero. Gives the master equation F = ma.
**Next lesson (Third Law):** Explains where forces come from — every force has a partner.
**After that:** Free body diagrams, friction, inclined planes, pulleys — all built on F = ma.`,
      },
      {
        type: 'definition',
        title: "Newton's Second Law",
        body: `\\vec{F}_{\\text{net}} = m\\vec{a} \\qquad \\text{Three equivalent forms:} \\qquad a = \\dfrac{F_{\\text{net}}}{m} \\qquad m = \\dfrac{F_{\\text{net}}}{a}`,
      },
      {
        type: 'warning',
        title: 'F means NET force — not any single force',
        body: `The F in F = ma is the VECTOR SUM of every force acting on the object simultaneously. Applied forces, friction, gravity, normal force, tension — ALL of them. Sum them as vectors first, then apply F_net = ma. Using only the applied force (and ignoring friction, gravity, etc.) is the most common error in dynamics.`,
      },
      {
        type: 'connection',
        title: 'Calculus: F = ma is a differential equation',
        body: `Since $a = d^2x/dt^2$, Newton's Second Law is $F = m\\,\\frac{d^2x}{dt^2}$. For constant $F$: integrate once → $v(t) = v_0 + at$; integrate again → $x(t) = x_0 + v_0t + \\frac{1}{2}at^2$. Every kinematic equation from Chapter 2 is Newton's Second Law integrated.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Net force on a pushed block',
        caption: 'Applied force F (right), friction f (left). Net force = F − f, pointing right. Acceleration = (F − f)/m, also pointing right. Doubling F (without changing friction) doubles the net force and doubles the acceleration.',
      },
      {
        id: 'ForceBlockSim',
        title: 'Interactive: vary force and mass',
        props: {},
        caption: 'F = ma is not abstract — drag the sliders and watch the numbers.',
      },
    ],
  },

  math: {
    prose: [
      `The standard problem-solving sequence for any F = ma problem: (1) Identify the object whose motion you are analyzing. (2) List every force acting on it. (3) Choose a coordinate system. (4) Resolve each force into components. (5) Write ΣFₓ = maₓ and ΣFᵧ = maᵧ. (6) Solve for the unknown. This sequence works for every dynamics problem from a simple pushed block to a rocket in orbit.`,
      `Component form is essential for 2D problems. The vector equation ΣF = ma splits into two independent scalar equations: ΣFₓ = maₓ and ΣFᵧ = maᵧ. "Independent" means you can solve the x-equation without knowing anything about y, and vice versa. This is why projectile motion decomposes into two separate problems: horizontal (ΣFₓ = 0 → constant velocity) and vertical (ΣFᵧ = −mg → free fall).`,
      `Weight is a force, not a mass. W = mg is the gravitational force on an object near the Earth's surface, where g = 9.8 m/s² ≈ 10 m/s². Mass m is measured in kg; weight W is measured in Newtons. A 70 kg person weighs 686 N on Earth, about 112 N on the Moon (where g ≈ 1.6 m/s²), and 0 N in deep space far from any planet — but their mass is 70 kg everywhere. This distinction matters the moment you leave Earth.`,
      `The force unit Newton is defined by the Second Law: 1 N is the force that gives a 1 kg mass an acceleration of 1 m/s². So [N] = [kg][m/s²] = [kg·m/s²]. Always verify units in your calculations. If your answer for a force comes out in units that aren't Newtons, you made a dimensional error somewhere.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Second Law in component form',
        body: '\\sum F_x = m a_x \\qquad \\sum F_y = m a_y',
      },
      {
        type: 'theorem',
        title: 'Weight formula',
        body: 'W = mg \\qquad (g = 9.8\\,\\text{m/s}^2 \\approx 10\\,\\text{m/s}^2)',
      },
      {
        type: 'insight',
        title: 'Mass vs. weight',
        body: 'Mass (m) is an intrinsic property measured in kg. Weight (W = mg) is a force measured in Newtons — it depends on local gravitational field g. On the Moon, g ≈ 1.6 m/s², so your weight is ~1/6 of Earth weight, but your mass is unchanged.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "Newton's Second Law is F_net = ma. Force is the time rate of change of momentum (p = mv). Since a = dv/dt, we have F = m(dv/dt) = d(mv)/dt = dp/dt for constant mass.",
      "The acceleration a = dv/dt = d²x/dt². Therefore: F = m·(d²x/dt²). Force is proportional to the SECOND DERIVATIVE of position with respect to time. This is a second-order ordinary differential equation — the fundamental equation of dynamics.",
      "For a constant net force F (simplest case), d²x/dt² = F/m = constant. Integrating twice: v(t) = v₀ + (F/m)t and x(t) = x₀ + v₀t + ½(F/m)t². This is exactly the constant-acceleration kinematics you already know — the Second Law generates those kinematic equations.",
      "The deeper calculus connection: F(x,v,t) = m·(d²x/dt²) is the general form. In most Calc 1 problems, F is constant. In more advanced physics, F depends on x (springs), v (damping), or t (time-varying forces) — each giving a different type of differential equation.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Second Law as a differential equation',
        body: 'F_{\\text{net}} = m\\,\\frac{d^2x}{dt^2} \\qquad \\text{(general form — force drives the second derivative of position)}',
      },
      {
        type: 'theorem',
        title: 'Integration for constant force',
        body: '\\frac{d^2x}{dt^2} = \\frac{F}{m} = a \\quad\\Rightarrow\\quad v(t) = v_0 + at \\quad\\Rightarrow\\quad x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2',
      },
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'kinematic-chain' },
    proofSteps: [
      {
        title: 'State the Second Law',
        expression: '\\vec{F}_{\\text{net}} = m\\vec{a}',
        annotation: 'Net force equals mass times acceleration. Both sides are vectors.',
      },
      {
        title: 'Write acceleration as derivative',
        expression: '\\vec{F}_{\\text{net}} = m\\,\\frac{d\\vec{v}}{dt} = m\\,\\frac{d^2\\vec{x}}{dt^2}',
        annotation: 'Force is proportional to the second derivative of position.',
      },
      {
        title: 'Solve for constant force (integrate once)',
        expression: '\\frac{dv}{dt} = \\frac{F}{m} = a \\quad\\Rightarrow\\quad v(t) = v_0 + at',
        annotation: 'Integrate acceleration (constant) to get velocity. Constant of integration = v₀.',
      },
      {
        title: 'Integrate again for position',
        expression: 'x(t) = \\int (v_0 + at)\\,dt = x_0 + v_0 t + \\tfrac{1}{2}at^2',
        annotation: 'The kinematic equations emerge naturally from integrating F = ma twice.',
      },
      {
        title: 'Kinematic equations are consequences of F = ma',
        expression: 'v^2 = v_0^2 + 2a\\Delta x \\quad\\text{(eliminate t between the two equations above)}',
        annotation: 'All five kinematic equations follow from applying calculus to F = ma.',
      },
    ],
    title: "Derivation: Kinematics from Newton's Second Law via integration",
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'From F = ma to kinematic equations via integration',
        mathBridge: `$F = m(d^2x/dt^2)$ is a second-order ODE. Integrating twice with initial conditions $v_0$ and $x_0$ yields the kinematic equations. This is why the kinematic equations work — they are $F = ma$ integrated.`,
        caption: `Every kinematic equation is an integral of Newton's Second Law.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch4-002-ex1',
      title: 'Finding acceleration from net force',
      problem: 'A 3 kg box is pushed to the right with 24 N. Friction acts to the left with 9 N. Find the net force and acceleration.',
      steps: [
        {
          expression: '\\sum F_x = F_{\\text{push}} - F_{\\text{friction}} = 24 - 9 = 15\\,\\text{N (right)}',
          annotation: 'Net force is the vector sum. Subtract opposing forces.',
        },
        {
          expression: 'a = \\frac{\\sum F_x}{m} = \\frac{15\\,\\text{N}}{3\\,\\text{kg}} = 5\\,\\text{m/s}^2 \\;(\\text{right})',
          annotation: 'Divide net force by mass. Acceleration is in the same direction as net force.',
        },
      ],
      conclusion: 'The net force is 15 N to the right; the box accelerates at 5 m/s² to the right.',
    },
    {
      id: 'ch4-002-ex2',
      title: 'Finding the force needed for a given acceleration',
      problem: 'A 1200 kg car needs to accelerate from 0 to 20 m/s in 8 seconds. What constant net force is required? Ignore friction.',
      steps: [
        {
          expression: 'a = \\frac{\\Delta v}{\\Delta t} = \\frac{20 - 0}{8} = 2.5\\,\\text{m/s}^2',
          annotation: 'Find the required acceleration from kinematics.',
        },
        {
          expression: 'F_{\\text{net}} = ma = 1200 \\times 2.5 = 3000\\,\\text{N}',
          annotation: 'Multiply mass by required acceleration.',
        },
      ],
      conclusion: 'The engine must provide a net force of 3000 N (3 kN) forward.',
    },
    {
      id: 'ch4-002-ex3',
      title: 'Two-direction problem: block pushed at an angle',
      problem: 'A 5 kg block on a frictionless horizontal surface is pushed by a 30 N force directed 37° above horizontal. (sin 37° = 0.6, cos 37° = 0.8.) Find the horizontal acceleration and the normal force. Use g = 10 m/s².',
      steps: [
        {
          expression: 'F_x = 30\\cos 37° = 30 \\times 0.8 = 24\\,\\text{N}, \\quad F_y = 30\\sin 37° = 30 \\times 0.6 = 18\\,\\text{N (up)}',
          annotation: 'Decompose the applied force into horizontal and vertical components.',
        },
        {
          expression: '\\sum F_x = 24\\,\\text{N} \\quad\\Rightarrow\\quad a_x = \\frac{24}{5} = 4.8\\,\\text{m/s}^2',
          annotation: 'Horizontal: only the x-component drives horizontal acceleration.',
        },
        {
          expression: '\\sum F_y = 0: \\quad N + 18 - mg = 0 \\quad\\Rightarrow\\quad N = 5(10) - 18 = 32\\,\\text{N}',
          annotation: 'Vertical: no vertical acceleration (stays on surface), so ΣFᵧ = 0.',
        },
      ],
      conclusion: 'Horizontal acceleration = 4.8 m/s²; normal force = 32 N (less than weight because the push has an upward component that partially lifts the block).',
    },
  ],

  challenges: [
    {
      id: 'ch4-002-ch1',
      difficulty: 'easy',
      problem: 'A net force of 45 N acts on a 9 kg object. Find the acceleration. If it starts from rest, how fast is it moving after 4 seconds?',
      hint: 'Use a = F/m first, then the kinematic equation v = v₀ + at.',
      walkthrough: [
        {
          expression: 'a = \\frac{F}{m} = \\frac{45}{9} = 5\\,\\text{m/s}^2',
          annotation: "Divide net force by mass — Newton's Second Law.",
        },
        {
          expression: 'v = v_0 + at = 0 + 5(4) = 20\\,\\text{m/s}',
          annotation: 'Kinematic equation with v₀ = 0 (starts from rest).',
        },
      ],
      answer: 'Acceleration = 5 m/s²; speed after 4 s = 20 m/s.',
    },
    {
      id: 'ch4-002-ch2',
      difficulty: 'medium',
      problem: 'A 4 kg block is pushed right by 20 N and simultaneously pulled left by 8 N. Friction (kinetic) is 4 N opposing motion. Find the acceleration. Is friction in the correct direction?',
      hint: 'First determine the direction of motion (or intended motion), then apply friction opposing that direction.',
      walkthrough: [
        {
          expression: '\\text{Net of applied forces: } 20 - 8 = 12\\,\\text{N (right)}',
          annotation: 'The object tends to move right, so kinetic friction points left.',
        },
        {
          expression: '\\sum F = 12 - 4 = 8\\,\\text{N (right)}',
          annotation: 'Friction is 4 N left, opposing the net applied force direction.',
        },
        {
          expression: 'a = \\frac{8}{4} = 2\\,\\text{m/s}^2 \\;(\\text{right})',
          annotation: 'Divide net force by mass.',
        },
      ],
      answer: 'Net force = 8 N right; acceleration = 2 m/s² to the right. Friction is indeed to the left (opposing motion).',
    },
    {
      id: 'ch4-002-ch3',
      difficulty: 'hard',
      problem: 'A 2 kg object starts at rest and a net force F = 6t N (increasing with time) acts on it from t = 0 to t = 3 s. Find the velocity at t = 3 s by integrating a(t). (This previews calculus-based dynamics.)',
      hint: 'Find a(t) = F(t)/m = 6t/2 = 3t. Then integrate a(t) from 0 to 3 to get Δv.',
      walkthrough: [
        {
          expression: 'a(t) = \\frac{F(t)}{m} = \\frac{6t}{2} = 3t\\,\\text{m/s}^2',
          annotation: 'The force varies with time, so the acceleration also varies with time.',
        },
        {
          expression: 'v(3) = v_0 + \\int_0^3 a(t)\\,dt = 0 + \\int_0^3 3t\\,dt = \\left[\\frac{3t^2}{2}\\right]_0^3 = \\frac{3(9)}{2} = 13.5\\,\\text{m/s}',
          annotation: 'Integrate the time-varying acceleration to find the velocity change.',
        },
      ],
      answer: 'v(3 s) = 13.5 m/s. Note: constant-force kinematic equations would NOT work here — this requires integration because F varies with time.',
    },
  ],

  python: {
    intro: `Use Python to apply F = ma numerically, derive kinematics by integrating a constant force, and explore how time-varying forces require integration instead of SUVAT.`,
    cells: [
      {
        id: 'p4-002-py1',
        type: 'code',
        cellTitle: 'F = ma: solve for each unknown',
        prose: `The three rearrangements of $F = ma$: given any two of force, mass, acceleration, find the third. Build a function table and verify the motorcycle-vs-truck example from the hook.`,
        code: [
          `def fma_solver(F=None, m=None, a=None):`,
          `    if F is None: return m * a, "F = m*a"`,
          `    if m is None: return F / a, "m = F/a"`,
          `    if a is None: return F / m, "a = F/m"`,
          ``,
          `problems = [`,
          `    ("3 kg box, net 15 N", dict(F=15, m=3)),`,
          `    ("1200 kg car needs a=2.5 m/s^2", dict(m=1200, a=2.5)),`,
          `    ("Net 8 N, a=2 m/s^2", dict(F=8, a=2)),`,
          `    ("Motorcycle: same engine (1000 N), m=250 kg", dict(F=1000, m=250)),`,
          `    ("18-wheeler: same engine (1000 N), m=18000 kg", dict(F=1000, m=18000)),`,
          `]`,
          ``,
          `for name, kwargs in problems:`,
          `    result, formula = fma_solver(**kwargs)`,
          `    known = {k: v for k, v in kwargs.items()}`,
          `    print(f"{name}")`,
          `    print(f"  {formula} = {result:.4f}")`,
          `    print()`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-002-py2',
        type: 'code',
        cellTitle: 'Kinematics from integration: constant force',
        prose: `For constant net force F on mass m, integrate $a = F/m$ twice to get $v(t)$ and $x(t)$. Plot both and compare to the SUVAT formulas — they should match exactly.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `# Setup: 3 kg box, net force 15 N, starts from rest`,
          `m, F_net = 3, 15`,
          `a = F_net / m  # = 5 m/s^2`,
          `v0, x0 = 0, 0`,
          ``,
          `t = np.linspace(0, 4, 200)`,
          ``,
          `# Analytical (from integrating F=ma)`,
          `v_analytical = v0 + a * t`,
          `x_analytical = x0 + v0 * t + 0.5 * a * t**2`,
          ``,
          `# Numerical Euler integration (should match)`,
          `dt = 0.01`,
          `t_num, v_num, x_num = [0], [v0], [x0]`,
          `v_cur, x_cur = v0, x0`,
          `for _ in range(int(4/dt)):`,
          `    a_cur = F_net / m`,
          `    v_cur = v_cur + a_cur * dt`,
          `    x_cur = x_cur + v_cur * dt`,
          `    t_num.append(t_num[-1] + dt)`,
          `    v_num.append(v_cur)`,
          `    x_num.append(x_cur)`,
          ``,
          `fig, axes = plt.subplots(1, 2, figsize=(11, 4))`,
          `axes[0].plot(t, v_analytical, "b-", lw=3, label="v(t) = v0 + at (analytic)")`,
          `axes[0].plot(t_num[::10], v_num[::10], "r.", ms=4, label="Euler integration")`,
          `axes[0].set_xlabel("t (s)"); axes[0].set_ylabel("v (m/s)")`,
          `axes[0].set_title("Velocity: linear in t (constant F)")`,
          `axes[0].legend(); axes[0].grid(True, alpha=0.3)`,
          ``,
          `axes[1].plot(t, x_analytical, "b-", lw=3, label="x(t) = x0 + v0*t + ½at² (analytic)")`,
          `axes[1].plot(t_num[::10], x_num[::10], "r.", ms=4, label="Euler integration")`,
          `axes[1].set_xlabel("t (s)"); axes[1].set_ylabel("x (m)")`,
          `axes[1].set_title("Position: quadratic in t (constant F)")`,
          `axes[1].legend(); axes[1].grid(True, alpha=0.3)`,
          ``,
          `plt.tight_layout()`,
          `plt.savefig("fma_kinematics.png", dpi=120)`,
          `plt.show()`,
          `print(f"a = F/m = {F_net}/{m} = {a} m/s^2")`,
          `print(f"v(4) analytical: {v_analytical[-1]:.2f} m/s, Euler: {v_num[-1]:.2f} m/s")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-002-py3',
        type: 'code',
        cellTitle: 'Time-varying force: when SUVAT fails',
        prose: `For a force $F(t) = 6t$ N on a 2 kg object, SUVAT equations don't apply — you must integrate. Compare the correct answer (from integration) against the incorrect SUVAT answer to show the error grows with time.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `m = 2`,
          `v0, x0 = 0, 0`,
          ``,
          `t = np.linspace(0, 3, 300)`,
          ``,
          `# True velocity: integrate a(t) = 6t/2 = 3t`,
          `# v(t) = integral(3t dt) = 3t^2/2`,
          `v_true = 3 * t**2 / 2`,
          `x_true = t**3 / 2`,
          ``,
          `# SUVAT wrong answer: use a(0) = 0 m/s^2 at t=0`,
          `a_wrong = 6 * 0 / m  # F(0)/m = 0`,
          `v_suvat = v0 + a_wrong * t  # = 0 everywhere! Completely wrong`,
          ``,
          `# SUVAT with average a — slightly better but still wrong`,
          `a_avg = 6 * 1.5 / m  # F at midpoint t=1.5`,
          `v_avg = v0 + a_avg * t`,
          ``,
          `fig, axes = plt.subplots(1, 2, figsize=(11, 4))`,
          `axes[0].plot(t, v_true, "b-", lw=2.5, label="True v(t) = 3t²/2 (integration)")`,
          `axes[0].plot(t, v_suvat, "r--", lw=2, label="SUVAT with a(0)=0 — WRONG")`,
          `axes[0].plot(t, v_avg, "g:", lw=2, label="SUVAT with avg a — still wrong")`,
          `axes[0].set_xlabel("t (s)"); axes[0].set_ylabel("v (m/s)")`,
          `axes[0].set_title("F=6t N: variable force, SUVAT fails")`,
          `axes[0].legend(fontsize=8); axes[0].grid(True, alpha=0.3)`,
          ``,
          `error = np.abs(v_avg - v_true)`,
          `axes[1].plot(t, error, "orange", lw=2)`,
          `axes[1].set_xlabel("t (s)"); axes[1].set_ylabel("|error| (m/s)")`,
          `axes[1].set_title("SUVAT error grows over time")`,
          `axes[1].grid(True, alpha=0.3)`,
          ``,
          `plt.tight_layout()`,
          `plt.savefig("varying_force.png", dpi=120)`,
          `plt.show()`,
          `print(f"True v(3) = {v_true[-1]:.2f} m/s")`,
          `print(f"SUVAT avg v(3) = {v_avg[-1]:.2f} m/s  (error = {abs(v_avg[-1]-v_true[-1]):.2f})")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-002-py4',
        type: 'code',
        cellTitle: 'Challenge: find mass from force and position data',
        prose: `If you measure force and position over time, you can recover mass by fitting the equation of motion. Given $x(t)$ measurements and a known constant force, compute acceleration by finite differences and estimate mass.`,
        challengeType: 'write',
        challengeNumber: 1,
        challengeTitle: 'Measure mass from F and x(t) data',
        difficulty: 'medium',
        prompt: `Complete the function estimate_mass(t_data, x_data, F_net). It should estimate acceleration from the position data using finite differences, then return m = F_net / a_estimate.`,
        starterBlock: [
          `import numpy as np`,
          ``,
          `def estimate_mass(t_data, x_data, F_net):`,
          `    # Step 1: velocity by finite differences`,
          `    v = np.gradient(x_data, t_data)`,
          `    # Step 2: acceleration by second finite differences`,
          `    a = np.gradient(___, t_data)   # differentiate v`,
          `    a_mean = np.mean(a)`,
          `    # Step 3: m = F/a`,
          `    m = ___ / ___`,
          `    return m`,
          ``,
          `# Test: 5 kg object under 20 N`,
          `t = np.linspace(0, 3, 100)`,
          `true_a = 20 / 5  # = 4 m/s^2`,
          `x = 0.5 * true_a * t**2 + np.random.normal(0, 0.001, len(t))`,
          `m_est = estimate_mass(t, x, 20)`,
          `print(f"Estimated mass: {m_est:.2f} kg  (true: 5.00 kg)")`,
        ].join('\n'),
        testCode: [
          `t = np.linspace(0, 3, 200)`,
          `true_a = 20 / 5`,
          `x = 0.5 * true_a * t**2`,
          `m_est = estimate_mass(t, x, 20)`,
          `assert abs(m_est - 5.0) < 0.2, f"Mass estimate off: {m_est:.2f}"`,
          `print("Test passed!")`,
        ].join('\n'),
        hint: `Use np.gradient(v, t_data) to differentiate velocity numerically. Then $m = F / \\bar{a}$ where $\\bar{a}$ is the mean acceleration.`,
        code: '',
        output: '',
        status: 'idle',
        figureJson: null,
      },
    ],
  },

  quiz: [
    {
      id: 'p1-ch4-002-q1',
      question: `A 3 kg box experiences a net force of 12 N. What is its acceleration?`,
      options: [
        `$2\\,\\text{m/s}^2$`,
        `$4\\,\\text{m/s}^2$`,
        `$6\\,\\text{m/s}^2$`,
        `$36\\,\\text{m/s}^2$`,
      ],
      answer: 1,
      explanation: `$a = F/m = 12/3 = 4\\,\\text{m/s}^2$.`,
    },
    {
      id: 'p1-ch4-002-q2',
      question: `A 4 kg block is pushed right by 20 N and simultaneously pulled left by 8 N. Friction is 4 N opposing motion. What is the acceleration?`,
      options: [
        `$2\\,\\text{m/s}^2$`,
        `$3\\,\\text{m/s}^2$`,
        `$5\\,\\text{m/s}^2$`,
        `$0.5\\,\\text{m/s}^2$`,
      ],
      answer: 0,
      explanation: `Net force: $20 - 8 - 4 = 8\\,\\text{N}$. $a = 8/4 = 2\\,\\text{m/s}^2$.`,
    },
    {
      id: 'p1-ch4-002-q3',
      question: `A 1200 kg car accelerates from rest to 20 m/s in 8 s. What constant net force is required?`,
      options: [
        `$150\\,\\text{N}$`,
        `$3000\\,\\text{N}$`,
        `$6000\\,\\text{N}$`,
        `$24000\\,\\text{N}$`,
      ],
      answer: 1,
      explanation: `$a = \\Delta v / \\Delta t = 20/8 = 2.5\\,\\text{m/s}^2$. $F = ma = 1200 \\times 2.5 = 3000\\,\\text{N}$.`,
    },
    {
      id: 'p1-ch4-002-q4',
      question: `In Newton's Second Law, $\\vec{F}_{net} = m\\vec{a}$, the "F" refers to:`,
      options: [
        `Any single applied force`,
        `The vector sum of all forces on the object`,
        `The largest force on the object`,
        `Only gravity and normal force`,
      ],
      answer: 1,
      explanation: `$F_{net}$ is the vector sum of ALL forces — applied, friction, gravity, normal, tension, etc. Every force acting on the object must be included.`,
    },
    {
      id: 'p1-ch4-002-q5',
      question: `A 5 kg block on a frictionless surface is pushed by a 30 N force at 37° above horizontal ($\\sin 37° = 0.6$, $\\cos 37° = 0.8$). What is the horizontal acceleration?`,
      options: [
        `$3.6\\,\\text{m/s}^2$`,
        `$4.8\\,\\text{m/s}^2$`,
        `$6.0\\,\\text{m/s}^2$`,
        `$3.0\\,\\text{m/s}^2$`,
      ],
      answer: 1,
      explanation: `$F_x = 30\\cos 37° = 24\\,\\text{N}$. $a_x = F_x/m = 24/5 = 4.8\\,\\text{m/s}^2$. The vertical component doesn't affect horizontal acceleration.`,
    },
    {
      id: 'p1-ch4-002-q6',
      question: `In calculus terms, Newton's Second Law $F = m(d^2x/dt^2)$ is:`,
      options: [
        `An algebraic equation`,
        `A first-order ordinary differential equation`,
        `A second-order ordinary differential equation`,
        `A partial differential equation`,
      ],
      answer: 2,
      explanation: `$F = m\\,d^2x/dt^2$ involves the second derivative of position with respect to time — making it a second-order ODE. Integrating it twice (for constant F) yields the kinematic equations.`,
    },
    {
      id: 'p1-ch4-002-q7',
      question: `A 70 kg person stands on a scale in an elevator accelerating upward at 3 m/s². What does the scale read? ($g = 10\\,\\text{m/s}^2$)`,
      options: [
        `$490\\,\\text{N}$`,
        `$700\\,\\text{N}$`,
        `$910\\,\\text{N}$`,
        `$210\\,\\text{N}$`,
      ],
      answer: 2,
      explanation: `The scale reads the normal force. $\\sum F_y = N - mg = ma \\Rightarrow N = m(g+a) = 70(10+3) = 910\\,\\text{N}$.`,
    },
    {
      id: 'p1-ch4-002-q8',
      question: `A net force $F = 6t\\,\\text{N}$ acts on a 2 kg object. Can you use SUVAT equations to find v at t = 3 s?`,
      options: [
        `Yes — SUVAT works for all forces`,
        `Yes — just use F at t = 3 s`,
        `No — SUVAT requires constant acceleration; this requires integration`,
        `No — Newton's Second Law doesn't apply to time-varying forces`,
      ],
      answer: 2,
      explanation: `SUVAT equations assume constant acceleration. Here $a(t) = F/m = 3t$ varies with time. You must integrate: $v(3) = \\int_0^3 3t\\,dt = [3t^2/2]_0^3 = 13.5\\,\\text{m/s}$.`,
    },
    {
      id: 'p1-ch4-002-q9',
      question: `A 2 kg object starts from rest with net force $F = 6t\\,\\text{N}$. What is its velocity at $t = 3\\,\\text{s}$?`,
      options: [
        `$9\\,\\text{m/s}$`,
        `$13.5\\,\\text{m/s}$`,
        `$27\\,\\text{m/s}$`,
        `$18\\,\\text{m/s}$`,
      ],
      answer: 1,
      explanation: `$a(t) = 6t/2 = 3t$. $v(3) = \\int_0^3 3t\\,dt = [\\frac{3t^2}{2}]_0^3 = 13.5\\,\\text{m/s}$.`,
    },
    {
      id: 'p1-ch4-002-q10',
      question: `Weight and mass are different quantities. Which statement is correct?`,
      options: [
        `Mass and weight are the same — both are measured in kg`,
        `Mass is in kg (intrinsic); weight $W = mg$ is in Newtons (force, location-dependent)`,
        `Weight is the same everywhere in the universe`,
        `Mass depends on gravity; weight does not`,
      ],
      answer: 1,
      explanation: `Mass is an intrinsic scalar property (kg) that doesn't change with location. Weight $W = mg$ is a force (Newtons) that changes with the local gravitational field $g$. On the Moon ($g \\approx 1.6\\,\\text{m/s}^2$), your weight is 1/6 of Earth weight, but your mass is unchanged.`,
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'free-body-diagram' }, title: 'Force diagram: F = ma' },
    { id: 'ForceBlockSim', title: 'Interactive: F = ma', props: {} },
  ],

  misconceptions: [
    {
      id: 'p4-002-m1',
      misconception: 'A larger net force means the object has a larger velocity.',
      correction: 'Net force determines ACCELERATION, not velocity. F_net = ma. An object can have a huge velocity with zero net force (spacecraft coasting) or zero velocity with a huge net force (ball just released from rest). The connection is: force changes velocity, but the instantaneous velocity depends on all prior history, not on the current force.',
      correctionExample: 'Car at 60 mph with engine off, coasting: net force ≈ 0, velocity = 60 mph. Same car from rest with engine on: net force = large, velocity = 0 mph initially. The large-force car has lower velocity at that instant.',
    },
    {
      id: 'p4-002-m2',
      misconception: 'Mass and weight are the same thing.',
      correction: 'Mass (kg) is an intrinsic scalar property — resistance to acceleration, same everywhere in the universe. Weight (N) is a force W = mg that depends on local gravity g. On the Moon (g ≈ 1.6 m/s²), your mass is identical to Earth, but your weight is 1/6. In F = ma, the "m" is mass, not weight.',
      correctionExample: '70 kg person: mass = 70 kg everywhere. Weight on Earth = 70×9.8 = 686 N. Weight on Moon = 70×1.6 = 112 N. In deep space (no gravity): weight ≈ 0 N, mass still 70 kg.',
    },
  ],

  transferPrompts: [
    {
      id: 'p4-002-t1',
      prompt: `An elevator accelerates upward at 2 m/s². A 60 kg person stands on a scale inside. The scale reads "apparent weight." Use ΣF = ma (with both gravity down and normal force up) to find what the scale reads. Then find the reading when the elevator accelerates downward at 2 m/s². What happens to scale reading in free fall?`,
      connection: 'F = ma applied to the person\'s vertical motion: N − mg = ma. The scale reads N, not mg. This is the "apparent weight" concept that connects to weightlessness in orbit (free fall with forward velocity).',
    },
    {
      id: 'p4-002-t2',
      prompt: `A car of mass 1500 kg accelerates from 0 to 27 m/s (≈60 mph) in 9 s. Estimate the average net force required. The engine provides thrust F_engine; road friction and air drag resist. If air drag at highway speed is about 400 N, what is the required engine force during acceleration? How does engine force change as the car approaches top speed (where a → 0)?`,
      connection: 'F = ma: net force = m × a. As a → 0 (constant speed), net force → 0, so engine force must exactly equal all resistive forces — Newton\'s Second Law reduces to the First Law.',
    },
  ],

  debugging: [
    {
      id: 'p4-002-d1',
      error: `A student: "A 5 kg block is pushed with 30 N and friction is 10 N. F = ma, so 30 = 5a, giving a = 6 m/s²."`,
      fix: `The student used only the applied force, not the NET force. Newton\'s Second Law requires the vector sum of ALL forces:
F_net = F_applied − F_friction = 30 − 10 = 20 N
a = F_net / m = 20 / 5 = 4 m/s²
Always compute ΣF first, then apply a = ΣF/m. Using any single force in F = ma gives the wrong answer whenever other forces are present.`,
    },
    {
      id: 'p4-002-d2',
      error: `A student: "A 70 kg person in an elevator accelerating up at 3 m/s² feels a force of F = ma = 70 × 3 = 210 N. So the scale reads 210 N."`,
      fix: `The 210 N is the NET force, not the scale reading. The scale reads the NORMAL force N:
ΣF = N − mg = ma
N = m(g + a) = 70(9.8 + 3) = 70 × 12.8 = 896 N
The scale shows 896 N (the person feels heavier). The 210 N is just the excess above weight. You must account for all forces — gravity is always present.`,
    },
  ],

  mastery: {
    targetLevel: 'Apply F = ma to single objects in multiple dimensions; handle normal, friction, tension, and gravity; integrate for non-constant acceleration.',
    checklistItems: [
      'Can compute F_net = ΣF (vector sum of all forces) before applying a = F_net/m',
      'Can resolve forces into x- and y-components and apply F = ma independently in each direction',
      'Can solve for unknown forces given acceleration (or vice versa)',
      'Can handle weight W = mg vs. mass m — weight is a force, mass is inertia',
      'Can integrate a(t) = F(t)/m for time-varying forces instead of using SUVAT',
    ],
    commonStruggles: [
      'Using only the applied force in F = ma instead of the net force ΣF',
      'Confusing the scale reading (normal force) with weight (mg) in elevator problems',
      'Applying SUVAT when force varies with time — must integrate instead',
    ],
    nextSteps: 'Lesson p4-003 (Newton\'s Third Law) introduces action-reaction pairs that must be tracked when multiple objects interact.',
  },

  semantics: {
    core: [
      { symbol: '\\vec{F}_{\\text{net}} = m\\vec{a}', meaning: 'Newton\'s Second Law: NET force (vector sum of ALL forces) equals mass times acceleration' },
      { symbol: 'a = F_{\\text{net}}/m', meaning: 'Acceleration: net force divided by mass; force and acceleration are in the same direction' },
      { symbol: 'W = mg', meaning: 'Weight (N): gravitational force on mass m in field g; distinct from mass (kg)' },
      { symbol: 'N', meaning: 'Normal force (N): contact force perpendicular to surface; equals mg only on horizontal surfaces with no vertical acceleration' },
      { symbol: '\\sum F_x = ma_x,\\; \\sum F_y = ma_y', meaning: 'Component form: apply F = ma independently in each direction' },
    ],
    rulesOfThumb: [
      'Always find F_NET first; then apply a = F_net/m. Never plug a single force into F = ma directly.',
      'Weight W = mg is a force (Newtons). Mass m is inertia (kg). They are different quantities.',
      'In elevators: scale reads N, not mg. N = m(g ± a) — plus when accelerating up, minus when down.',
      'For time-varying F(t): a(t) = F(t)/m, then integrate for v(t) and x(t). SUVAT requires constant a.',
      'F = ma is a vector equation: direction matters. Forces pointing left subtract from forces pointing right.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: "Newton's Second Law in Python",
      cells: [
        {
          cellTitle: 'F = ma: visualizing the triad',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# F = ma: how the three quantities relate
# Fix one, vary a second, compute the third

m = 5.0  # kg (fixed mass)
F_values = np.linspace(0, 50, 200)
a_from_F = F_values / m   # a = F/m

fig, axes = plt.subplots(1, 3, figsize=(14, 4))

# Plot 1: a vs F (fixed m=5 kg)
axes[0].plot(F_values, a_from_F, 'b-', linewidth=2)
axes[0].set_xlabel('Net Force F (N)'); axes[0].set_ylabel('Acceleration a (m/s²)')
axes[0].set_title(f'a = F/m  (m = {m} kg): linear')
axes[0].grid(True)

# Plot 2: a vs m (fixed F=20 N) — inverse relationship
F_fixed = 20
m_values = np.linspace(0.5, 10, 200)
a_from_m = F_fixed / m_values
axes[1].plot(m_values, a_from_m, 'r-', linewidth=2)
axes[1].set_xlabel('Mass m (kg)'); axes[1].set_ylabel('Acceleration a (m/s²)')
axes[1].set_title(f'a = F/m  (F = {F_fixed} N): inverse')
axes[1].grid(True)

# Plot 3: F needed for constant a across different masses
a_fixed = 3  # m/s²
F_needed = m_values * a_fixed
axes[2].plot(m_values, F_needed, 'g-', linewidth=2)
axes[2].set_xlabel('Mass m (kg)'); axes[2].set_ylabel('Required Force F (N)')
axes[2].set_title(f'F = ma  (a = {a_fixed} m/s²): linear in mass')
axes[2].grid(True)

plt.tight_layout(); plt.show()

print(f"Summary: For m={m} kg:")
for F in [10, 20, 40]:
    print(f"  F = {F} N → a = {F/m:.1f} m/s²")`,
          prose: [
            'a_from_F = F_values / m applies a = F/m element-wise — for each force value, compute the resulting acceleration with fixed mass. The linear relationship shows doubling F doubles a.',
            'a_from_m = F_fixed / m_values shows the inverse relationship: doubling mass halves acceleration for the same force. The hyperbolic curve (1/m shape) reveals why a feather and a bowling ball accelerate differently under the same push.',
            'F_needed = m_values * a_fixed shows F = ma directly: to achieve the same acceleration (3 m/s²) for heavier objects, you need proportionally more force. A 10 kg object needs 30 N; a 5 kg object needs 15 N.',
          ],
        },
        {
          cellTitle: 'Elevator: apparent weight vs true weight',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

m = 70   # kg
g = 9.8  # m/s²
W_true = m * g  # true weight

# Elevator accelerates: up (+), down (-), free fall (-g)
a_values = np.linspace(-g, g, 300)
N_apparent = m * (g + a_values)   # N = m(g + a)

plt.figure(figsize=(8, 5))
plt.plot(a_values, N_apparent, 'b-', linewidth=2)
plt.axhline(W_true, color='k', linestyle='--', label=f'True weight = {W_true:.0f} N')
plt.axhline(0, color='r', linestyle=':', label='Weightless (N = 0)')
plt.xlabel('Elevator acceleration (m/s²)')
plt.ylabel('Scale reading N (N)')
plt.title(f'Apparent weight vs. acceleration  (m = {m} kg)')
plt.legend(); plt.grid(True)

# Mark key points
key_accs = [g, 3, 0, -3, -g]
for a in key_accs:
    N = m * (g + a)
    plt.scatter([a], [N], s=80, color='red', zorder=5)
    plt.annotate(f'a={a:.1f}: N={N:.0f}N', xy=(a, N), xytext=(a-0.5, N+30), fontsize=8)

plt.show()
print(f"True weight: {W_true:.0f} N")
print(f"a = +3 m/s² (up): N = {m*(g+3):.0f} N (heavier)")
print(f"a =  0 m/s²: N = {m*(g+0):.0f} N (normal)")
print(f"a = -3 m/s² (down): N = {m*(g-3):.0f} N (lighter)")
print(f"a = -g (free fall): N = {m*(g-g):.0f} N (weightless)")`,
          prose: [
            'N_apparent = m * (g + a_values) implements ΣF = ma → N − mg = ma → N = m(g + a). When a > 0 (accelerating up), N > mg — you feel heavier. When a < 0 (accelerating down), N < mg — you feel lighter.',
            'The plot crosses W_true (dashed line) at a = 0: this is the "resting in elevator" case where normal force exactly equals weight. The crossing at N = 0 (dotted red) is free fall: no contact force, you\'re weightless even though gravity still acts.',
            'The key insight: the scale doesn\'t measure gravity — it measures the contact force N. At a = −g (free fall), there is no contact force even though gravity (686 N on this person) is still present. Astronauts in orbit are in perpetual free fall — that\'s why they\'re weightless.',
          ],
        },
        {
          cellTitle: 'Variable force integration: F(t) = 6t N',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# F(t) = 6t N acting on m = 2 kg, starting from rest
m = 2.0  # kg
# a(t) = F(t)/m = 3t  (time-varying — SUVAT doesn't apply!)

t = np.linspace(0, 3, 300)
F = 6 * t          # force increases linearly
a = F / m          # a(t) = 3t
v = 1.5 * t**2     # v(t) = ∫a dt = 3t²/2 = 1.5t² (from rest, v(0)=0)
x = 0.5 * t**3     # x(t) = ∫v dt = t³/2 (from x(0)=0)

fig, axes = plt.subplots(3, 1, figsize=(9, 9), sharex=True)
axes[0].plot(t, F, 'r-', linewidth=2); axes[0].set_ylabel('F (N)'); axes[0].set_title('F(t) = 6t: linearly increasing force')
axes[1].plot(t, a, 'b-', linewidth=2); axes[1].set_ylabel('a (m/s²)'); axes[1].set_title('a(t) = F/m = 3t: also linear (NOT constant!)')
axes[2].plot(t, v, 'g-', linewidth=2); axes[2].set_ylabel('v (m/s)'); axes[2].set_xlabel('t (s)'); axes[2].set_title('v(t) = ∫a dt = 1.5t²: quadratic (not SUVAT!)')
for ax in axes: ax.grid(True)
plt.tight_layout(); plt.show()

t_check = 3.0
v_analytical = 1.5 * t_check**2
print(f"At t=3s: F={6*t_check:.0f}N, a={3*t_check:.0f}m/s², v={v_analytical:.1f}m/s")
print(f"SUVAT would give v = a*t = {3*t_check}*3 = {9*t_check:.0f} m/s — WRONG (a is not constant)")`,
          prose: [
            'v = 1.5 * t**2 is the analytical integral of a(t) = 3t: ∫3t dt = 3t²/2. This is a quadratic in time, NOT linear (v ≠ at) because acceleration is itself varying. SUVAT assumes constant a — it would give v = at = 3×3×3 = 27 m/s instead of the correct 13.5 m/s.',
            'x = 0.5 * t**3 is the second integral: ∫(3t²/2) dt = t³/2. A cubic position function — not the parabola you\'d get from constant acceleration.',
            'The three stacked plots show the full chain F → a → v. With F varying, a varies, and v is not simply proportional to t. The correct approach: always integrate when F or a is not constant.',
          ],
        },
        {
          cellTitle: 'Challenge: measure mass from force-acceleration data',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

# Experimental data: known force applied to unknown mass
# From F = ma: m = F/a → fit the slope
np.random.seed(0)
F_applied = np.array([5, 10, 15, 20, 25, 30, 35, 40])  # N
# True mass = 4.2 kg; add noise to simulate real measurement
a_measured = F_applied / 4.2 + np.random.normal(0, 0.15, len(F_applied))

# TODO:
# 1. Plot a_measured vs F_applied with error bars (use std=0.15)
# 2. Fit a line through origin: a = F/m → find m from slope
#    Hint: np.polyfit(F_applied, a_measured, 1) gives [slope, intercept]
#    slope = 1/m, so m_estimated = 1/slope
# 3. Plot the best-fit line overlaid on the data
# 4. Print the estimated mass and compare to the true value (4.2 kg)
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: "Newton's Second Law in MATLAB/Octave",
      cells: [
        {
          cellTitle: 'F = ma relationships',
          type: 'code',
          language: 'matlab',
          code: `% F = ma: three plots showing the relationships
m_fixed = 5; F_fixed = 20; a_fixed = 3;
F_vals = linspace(0, 50, 200);
m_vals = linspace(0.5, 10, 200);

figure;
subplot(1,3,1);
plot(F_vals, F_vals/m_fixed, 'b-', 'LineWidth', 2);
xlabel('F_{net} (N)'); ylabel('a (m/s^2)');
title(sprintf('a = F/m  (m = %d kg)', m_fixed)); grid on;

subplot(1,3,2);
plot(m_vals, F_fixed./m_vals, 'r-', 'LineWidth', 2);
xlabel('m (kg)'); ylabel('a (m/s^2)');
title(sprintf('a = F/m  (F = %d N)', F_fixed)); grid on;

subplot(1,3,3);
plot(m_vals, a_fixed*m_vals, 'g-', 'LineWidth', 2);
xlabel('m (kg)'); ylabel('F = ma (N)');
title(sprintf('F = ma  (a = %d m/s^2)', a_fixed)); grid on;`,
          prose: [
            'F_vals / m_fixed computes a = F/m for a vector of force values with scalar mass. MATLAB broadcasts the scalar m_fixed across the vector. The result is a straight line: doubling F doubles a.',
            'F_fixed ./ m_vals (with ./) divides scalar F by each element of m_vals. The hyperbolic (1/m) shape shows the inverse relationship: heavier objects accelerate less under the same force.',
            'a_fixed * m_vals computes F = ma — how much force you need to achieve fixed acceleration across different masses. Linear in mass: 10 kg needs 3× the force of a 3.3 kg object for the same 3 m/s² acceleration.',
          ],
        },
        {
          cellTitle: 'Elevator apparent weight',
          type: 'code',
          language: 'matlab',
          code: `m = 70; g = 9.8;
W_true = m * g;
a_vals = linspace(-g, g, 300);
N_vals = m * (g + a_vals);  % N = m(g+a)

figure;
plot(a_vals, N_vals, 'b-', 'LineWidth', 2);
hold on;
yline(W_true, 'k--', sprintf('True weight = %.0f N', W_true), 'LineWidth', 1.5);
yline(0, 'r:', 'Weightless', 'LineWidth', 1.5);
xlabel('Acceleration (m/s^2)'); ylabel('Scale reading N (N)');
title(sprintf('Apparent weight: N = m(g+a)  (m=%d kg)', m)); grid on;

% Key points
key_a = [g, 3, 0, -3, -g];
scatter(key_a, m*(g+key_a), 80, 'r', 'filled');
fprintf('\\nScale readings:\\n');
for a = key_a
    fprintf('  a=%+.1f m/s^2: N = %.0f N\\n', a, m*(g+a));
end`,
          prose: [
            'N_vals = m * (g + a_vals) implements N = m(g + a) — the normal force equation from ΣF = N − mg = ma. When a > 0 (accelerating up), N > mg; when a < 0 (accelerating down), N < mg.',
            'yline() draws horizontal reference lines at W_true and 0. The intersection with the curve at a = 0 is the stationary case (N = mg). The intersection with N = 0 line is free fall (a = −g): no contact force even though gravity still acts.',
            'The scatter points mark key elevator states. The print loop shows the exact scale readings: accelerating up at g gives N = 2W (double weight); free fall gives N = 0 (weightless).',
          ],
        },
        {
          cellTitle: 'Variable force: F(t) = 6t',
          type: 'code',
          language: 'matlab',
          code: `% F(t) = 6t N on m = 2 kg — must integrate, SUVAT fails
m = 2;
t = linspace(0, 3, 300);
F = 6 * t;           % F(t) = 6t
a = F / m;           % a(t) = 3t
v = 1.5 * t.^2;      % v(t) = ∫a dt = 3t²/2
x = 0.5 * t.^3;      % x(t) = ∫v dt = t³/2

figure;
subplot(3,1,1); plot(t, F, 'r-', 'LineWidth', 2); ylabel('F (N)');
title('Variable force F(t) = 6t on m = 2 kg'); grid on;
subplot(3,1,2); plot(t, a, 'b-', 'LineWidth', 2); ylabel('a (m/s^2)');
title('a(t) = 3t: NOT constant — SUVAT invalid'); grid on;
subplot(3,1,3); plot(t, v, 'g-', 'LineWidth', 2); ylabel('v (m/s)'); xlabel('t (s)');
title('v(t) = 1.5t^2 (from integration)'); grid on;

fprintf('At t=3s: v_correct=%.1f m/s\\n', 1.5*9);
fprintf('SUVAT gives: v = a*t = 9*3 = %.0f m/s — WRONG!\\n', 9*3);`,
          prose: [
            'v = 1.5 * t.^2 is the analytical integral of a = 3t. The .^2 squares each element of t. This is a parabola in time — v grows quadratically, not linearly, because a itself is increasing.',
            'The three stacked subplots show the chain: F(t) is linear, a(t) = F/m is also linear, but v(t) = ∫a dt is quadratic. Each integration adds one power of t.',
            'The fprintf comparison shows why SUVAT fails: it would predict v = at = 9×3 = 27 m/s, while the correct answer from integration is v = 1.5×9 = 13.5 m/s. SUVAT treats a as constant; here a varies with time.',
          ],
        },
        {
          cellTitle: 'Challenge: measure mass from experimental data',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Measure mass from F vs a data using F = ma → slope = 1/m
rng(0);
F_applied = [5, 10, 15, 20, 25, 30, 35, 40];   % N (known)
a_measured = F_applied / 4.2 + 0.15*randn(1, length(F_applied));  % noisy

% TODO:
% 1. Plot a_measured vs F_applied with scatter()
% 2. Fit: p = polyfit(F_applied, a_measured, 1) → slope = p(1) = 1/m
% 3. m_estimated = 1/p(1)
% 4. Overlay the fit line: plot(F_applied, polyval(p, F_applied))
% 5. Print m_estimated vs true value 4.2 kg
`,
        },
      ],
    },
  },
};
