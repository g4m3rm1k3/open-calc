export default {
  id: 'p1-ch4-005',
  slug: 'friction',
  chapter: 'p4',
  order: 4,
  title: 'Friction: Static and Kinetic',
  subtitle: 'Static friction prevents motion; kinetic friction opposes it. Both depend on the normal force and surface properties.',
  tags: ['friction', 'static-friction', 'kinetic-friction', 'normal-force', 'coefficient-of-friction', 'dynamics'],

  hook: {
    question: "Why is it harder to START sliding a heavy box than to KEEP it sliding once it's already moving?",
    realWorldContext: 'Friction is everywhere: tires gripping roads, brakes stopping cars, bolts staying tight, shoes walking without slipping. Understanding friction allows engineers to design brake systems, prevent structural failures, and analyze machine efficiency. The distinction between static and kinetic friction — and the insight that normal force drives both — unlocks every friction problem in physics.',
    previewVisualizationId: 'ForceBlockSim',
  },

  intuition: {
    prose: [
      "Static friction is the friction force that prevents an object from moving. It adjusts to whatever value is needed to maintain equilibrium, up to a maximum. When you push lightly on a box, static friction matches your push exactly. Push harder, and it matches you harder — until you exceed its maximum.",
      "Kinetic friction acts when the object IS moving. It has a fixed value (not adjustable) equal to μ_k × N. It always opposes the direction of motion.",
      "Always: μ_k < μ_s. It takes more force to START sliding something than to KEEP it sliding. This is why pushing a heavy box over a threshold feels like the resistance suddenly drops — once kinetic friction replaces static, the resisting force decreases.",
      "Both friction forces depend on N (the normal force) through the coefficient of friction μ — a dimensionless number that characterizes the roughness of the surface pair. μ does NOT depend on contact area — a wide flat box and a narrow tall box with the same mass and surface type have the same friction force.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Static friction',
        body: 'f_s \\leq \\mu_s N \\qquad \\text{(prevents motion; automatically adjusts up to maximum \\(\\mu_s N\\))}',
      },
      {
        type: 'definition',
        title: 'Kinetic friction',
        body: 'f_k = \\mu_k N \\qquad \\text{(opposes motion in progress; constant value)}',
      },
      {
        type: 'definition',
        title: 'Coefficient of friction',
        body: '\\mu = \\text{dimensionless number characterizing surface pair}; \\quad \\mu_k < \\mu_s \\text{ always}',
      },
      {
        type: 'insight',
        title: 'Normal force is NOT always mg',
        body: 'On a horizontal surface with no vertical applied forces: N = mg. But on a ramp, N = mg cosθ. If a force pushes the object into the surface or lifts it, N changes. Always derive N from ΣFᵧ = maᵧ.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'FBD: block on surface with friction',
        caption: 'Applied force F_app (right), kinetic friction f_k (left, opposing motion), weight W (down), normal N (up). The friction force is f_k = μ_k N, not μ_k mg unless N = mg.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Static vs kinetic friction: force-vs-applied-force graph',
        mathBridge: `As applied force increases from 0, static friction matches it (slope 1) until $f_{s,max} = \\mu_s N$. Once the object moves, friction drops to $f_k = \\mu_k N$ and stays constant. The drop corresponds to $\\mu_k < \\mu_s$.`,
        caption: 'Friction is not constant — static is variable (up to a maximum); kinetic is fixed.',
      },
      {
        id: 'ForceBlockSim',
        title: 'Interactive: apply force to block with friction',
        props: {},
        caption: 'The threshold between static and kinetic friction is the maximum static friction force.',
      },
    ],
  },

  math: {
    prose: [
      'For a block on a horizontal surface: N = mg, so f_k = μ_k·mg and f_{s,max} = μ_s·mg.',
      'For a block on a ramp at angle θ: N = mg cosθ, so f_k = μ_k·mg cosθ.',
      'To find the minimum force to start sliding: F_min = f_{s,max} = μ_s·N. For horizontal surface: F_min = μ_s·mg.',
      'To find the acceleration of a sliding block: ΣF = F_applied − f_k = F_applied − μ_k·N = ma → a = (F_applied − μ_k·N)/m.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Friction equations on a horizontal surface',
        body: 'N = mg, \\quad f_k = \\mu_k m g, \\quad f_{s,\\max} = \\mu_s m g',
      },
      {
        type: 'theorem',
        title: 'Minimum force to start sliding (horizontal)',
        body: 'F_{\\min} = \\mu_s N = \\mu_s m g',
      },
      {
        type: 'insight',
        title: 'Friction is piecewise',
        body: 'The friction force as a function of applied force is NOT smooth — it has a kink at the onset of motion. Mathematically, friction is a piecewise-defined function: f = F_applied (static regime) or f = μ_k N (kinetic regime). This is important in calculus: friction is not differentiable at the transition point.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "Friction is an emergent macroscopic effect of microscopic contact interactions. At the atomic level, surfaces have asperities (tiny bumps) that interlock; the friction force is the net horizontal component of all those microscopic normal forces.",
      "The empirical Coulomb friction model (f ≤ μN for static, f = μN for kinetic) is not derived from first principles — it is a mathematical model that fits experimental data extremely well over a wide range of conditions. It breaks down at very high speeds, very high pressures, or for lubricated surfaces.",
      "Mathematically, the piecewise nature of friction makes it a non-smooth function. The equation of motion for a block with friction has different forms before and during motion: m(d²x/dt²) = F_app − μ_s N (if |F_app| ≤ μ_s N, then actually d²x/dt² = 0) and m(d²x/dt²) = F_app − μ_k N (when sliding). This piecewise ODE requires careful handling.",
      "The transition between static and kinetic: f_s,max = μ_s N is the threshold. For F_applied < f_s,max: static, a = 0. For F_applied = f_s,max: on the verge of sliding. For F_applied > f_s,max: kinetic friction takes over at f_k = μ_k N < f_s,max.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Piecewise equation of motion with friction',
        body: 'm\\frac{d^2x}{dt^2} = \\begin{cases} 0 & \\text{if } |F_{\\text{app}}| \\leq \\mu_s N \\text{ (static)} \\\\ F_{\\text{app}} - \\mu_k N \\cdot \\text{sgn}(v) & \\text{if sliding} \\end{cases}',
      },
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'free-body-diagram' },
    proofSteps: [
      {
        title: 'Identify the regime',
        expression: '\\text{Ask: is the object moving? If not, is it on the verge of moving?}',
        annotation: "Always determine the motion regime first before choosing which friction formula to use.",
      },
      {
        title: 'Compute normal force from FBD',
        expression: '\\sum F_y = 0 \\;(\\text{if no vertical acceleration}) \\quad\\Rightarrow\\quad N = mg - F_{\\text{vertical applied}}',
        annotation: 'N depends on ALL vertical forces, not just gravity.',
      },
      {
        title: 'Check against maximum static friction',
        expression: 'f_{s,\\max} = \\mu_s N \\quad\\text{compare with required friction force}',
        annotation: 'If required force ≤ f_{s,max}: static equilibrium holds. Otherwise: sliding begins.',
      },
      {
        title: 'Apply kinetic friction if sliding',
        expression: 'f_k = \\mu_k N \\quad\\Rightarrow\\quad \\sum F = F_{\\text{app}} - f_k = ma',
        annotation: 'Kinetic friction is a fixed value; solve for acceleration.',
      },
    ],
    title: 'Derivation: Systematic friction analysis',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Static-to-kinetic transition and piecewise dynamics',
        mathBridge: `The friction force is a piecewise function of applied force. The derivative (slope of f vs F_app) is 1 in the static regime and 0 in the kinetic regime. At the transition, the function is not differentiable — a key calculus subtlety.`,
        caption: 'Real friction requires knowing the motion state before writing the equation of motion.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-005-ex1',
      title: 'Minimum force to start sliding a crate',
      problem: 'A 30 kg crate sits on a floor with μ_s = 0.45 and μ_k = 0.30. (a) What minimum force starts it sliding? (b) Once sliding, what force keeps it moving at constant velocity? Use g = 10 m/s².',
      steps: [
        {
          expression: 'N = mg = 30 \\times 10 = 300\\,\\text{N}',
          annotation: 'Normal force on horizontal surface.',
        },
        {
          expression: '(a)\\; F_{\\min} = \\mu_s N = 0.45 \\times 300 = 135\\,\\text{N}',
          annotation: 'Must exceed maximum static friction to initiate sliding.',
        },
        {
          expression: '(b)\\; f_k = \\mu_k N = 0.30 \\times 300 = 90\\,\\text{N}',
          annotation: 'Once sliding, kinetic friction requires 90 N to maintain constant velocity (zero acceleration).',
        },
      ],
      conclusion: 'Need 135 N to start sliding; only 90 N to maintain constant sliding speed. The 45 N difference is why it "feels easier" once the crate is moving.',
    },
    {
      id: 'ch4-005-ex2',
      title: 'Block pushed with downward-angled force',
      problem: 'A 10 kg block is pushed along the floor by a 50 N force directed 30° below horizontal. μ_k = 0.25. Find the normal force and the acceleration. (sin 30° = 0.5, cos 30° = 0.866.) Use g = 10 m/s².',
      steps: [
        {
          expression: 'F_x = 50\\cos 30° = 43.3\\,\\text{N (forward)}, \\quad F_y = -50\\sin 30° = -25\\,\\text{N (downward)}',
          annotation: 'The push is angled downward, so it adds to the downward forces.',
        },
        {
          expression: '\\sum F_y = 0: N - mg - 25 = 0 \\quad\\Rightarrow\\quad N = 100 + 25 = 125\\,\\text{N}',
          annotation: 'Normal force increases because the downward push component presses the block into the floor.',
        },
        {
          expression: 'f_k = \\mu_k N = 0.25 \\times 125 = 31.25\\,\\text{N}',
          annotation: 'Kinetic friction is larger because N is larger — notice the coupling.',
        },
        {
          expression: 'a = \\frac{F_x - f_k}{m} = \\frac{43.3 - 31.25}{10} = \\frac{12.05}{10} \\approx 1.2\\,\\text{m/s}^2',
          annotation: 'Net horizontal force divided by mass.',
        },
      ],
      conclusion: 'N = 125 N (not mg = 100 N!); a ≈ 1.2 m/s². The angled push increases N, which increases friction — the block accelerates less than if the push were horizontal.',
    },
  ],

  challenges: [
    {
      id: 'ch4-005-ch1',
      difficulty: 'easy',
      problem: 'A 20 kg box on a horizontal floor has μ_s = 0.5 and μ_k = 0.35. A horizontal force of 80 N is applied. Does the box move? If so, find its acceleration. Use g = 10 m/s².',
      hint: 'First compute maximum static friction. Compare to applied force. If it moves, use kinetic friction.',
      walkthrough: [
        {
          expression: 'N = mg = 200\\,\\text{N}, \\quad f_{s,\\max} = 0.5 \\times 200 = 100\\,\\text{N}',
          annotation: 'Maximum static friction is 100 N.',
        },
        {
          expression: 'F_{\\text{app}} = 80\\,\\text{N} < 100\\,\\text{N} = f_{s,\\max} \\quad\\Rightarrow\\quad \\text{Box does NOT move}',
          annotation: 'Applied force is less than maximum static friction.',
        },
        {
          expression: 'f_s = 80\\,\\text{N (exactly matches applied force)}, \\quad a = 0',
          annotation: 'Static friction equals the applied force to maintain equilibrium.',
        },
      ],
      answer: 'The box does not move. Static friction = 80 N (matching the push). Acceleration = 0.',
    },
    {
      id: 'ch4-005-ch2',
      difficulty: 'medium',
      problem: 'A 15 kg sled is pulled across snow by a rope at 20° above horizontal with tension T = 60 N. μ_k = 0.10. Find N, f_k, and the acceleration. Use g = 10 m/s². (sin 20° ≈ 0.34, cos 20° ≈ 0.94.)',
      hint: 'The upward component of T reduces N — which reduces friction. Find N from ΣFᵧ = 0 first.',
      walkthrough: [
        {
          expression: 'T_x = 60\\cos 20° = 56.4\\,\\text{N}, \\quad T_y = 60\\sin 20° = 20.4\\,\\text{N (up)}',
          annotation: 'Decompose tension into horizontal and vertical components.',
        },
        {
          expression: 'N = mg - T_y = 150 - 20.4 = 129.6\\,\\text{N}',
          annotation: 'The upward pull reduces normal force.',
        },
        {
          expression: 'f_k = 0.10 \\times 129.6 = 13.0\\,\\text{N}',
          annotation: 'Reduced N means reduced kinetic friction.',
        },
        {
          expression: 'a = \\frac{T_x - f_k}{m} = \\frac{56.4 - 13.0}{15} = \\frac{43.4}{15} \\approx 2.9\\,\\text{m/s}^2',
          annotation: 'Net force divided by mass.',
        },
      ],
      answer: 'N = 129.6 N, f_k = 13.0 N, a ≈ 2.9 m/s².',
    },
    {
      id: 'ch4-005-ch3',
      difficulty: 'hard',
      problem: 'A 5 kg block is on a 40° ramp. μ_s = 0.6. Will the block slide? If not, what is the friction force? If it does slide and μ_k = 0.4, find the acceleration. (sin 40° ≈ 0.643, cos 40° ≈ 0.766.) Use g = 10 m/s².',
      hint: 'Find N, then maximum static friction, and compare to the component of gravity along the ramp.',
      walkthrough: [
        {
          expression: 'N = mg\\cos 40° = 5 \\times 10 \\times 0.766 = 38.3\\,\\text{N}',
          annotation: 'Normal force perpendicular to ramp.',
        },
        {
          expression: 'W_{\\parallel} = mg\\sin 40° = 5 \\times 10 \\times 0.643 = 32.15\\,\\text{N (down slope)}',
          annotation: 'Gravity component along the slope — this tends to cause sliding.',
        },
        {
          expression: 'f_{s,\\max} = 0.6 \\times 38.3 = 23.0\\,\\text{N}',
          annotation: 'Maximum static friction available.',
        },
        {
          expression: 'W_{\\parallel} = 32.15 > f_{s,\\max} = 23.0 \\quad\\Rightarrow\\quad \\text{Block slides!}',
          annotation: 'Gravity exceeds maximum static friction — sliding occurs.',
        },
        {
          expression: 'f_k = 0.4 \\times 38.3 = 15.32\\,\\text{N (up slope)}',
          annotation: 'Kinetic friction opposes the sliding direction (acts up the slope).',
        },
        {
          expression: 'a = \\frac{W_{\\parallel} - f_k}{m} = \\frac{32.15 - 15.32}{5} = \\frac{16.83}{5} \\approx 3.4\\,\\text{m/s}^2 \\text{ (down slope)}',
          annotation: 'Net force along slope divided by mass.',
        },
      ],
      answer: 'Block slides (W_∥ = 32.15 N > f_{s,max} = 23.0 N). Kinetic friction = 15.32 N. Acceleration ≈ 3.4 m/s² down the slope.',
    },
  ],

  python: {
    intro: `Explore friction computationally: plot the static-to-kinetic transition, simulate a sliding block, and find the minimum force needed for different surface conditions.`,
    cells: [
      {
        id: 'p4-005-py1',
        type: 'code',
        cellTitle: 'The friction curve: static vs kinetic',
        prose: `Plot friction force vs applied force to show the piecewise nature: linear in the static regime (f = F_app), then drops and stays flat in the kinetic regime (f = μ_k N). This is the key visual for understanding why starting friction exceeds sliding friction.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `m, g = 30, 10`,
          `mu_s, mu_k = 0.45, 0.30`,
          `N = m * g  # horizontal surface`,
          `f_s_max = mu_s * N`,
          `f_k = mu_k * N`,
          ``,
          `F_app = np.linspace(0, 200, 500)`,
          `friction = np.where(F_app <= f_s_max, F_app, f_k)`,
          ``,
          `fig, ax = plt.subplots(figsize=(8, 5))`,
          `ax.plot(F_app, friction, "b-", lw=2.5)`,
          `ax.axvline(f_s_max, color="red", ls="--", label=f"f_s_max = {f_s_max:.0f} N (object starts sliding)")`,
          `ax.axhline(f_k, color="green", ls=":", lw=2, label=f"f_k = {f_k:.0f} N (kinetic, constant)")`,
          `ax.annotate("Static regime\\n(f = F_app)", xy=(60, 60), fontsize=10, color="navy")`,
          `ax.annotate("Kinetic regime\\n(f = const)", xy=(150, f_k - 15), fontsize=10, color="darkgreen")`,
          `ax.set_xlabel("Applied force F_app (N)")`,
          `ax.set_ylabel("Friction force f (N)")`,
          `ax.set_title(f"Friction curve: mu_s={mu_s}, mu_k={mu_k}, m={m} kg")`,
          `ax.legend(); ax.grid(True, alpha=0.3)`,
          `plt.tight_layout()`,
          `plt.savefig("friction_curve.png", dpi=120)`,
          `plt.show()`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-005-py2',
        type: 'code',
        cellTitle: 'Simulate a block sliding with kinetic friction',
        prose: `A block is given an initial push and then slides to a stop under kinetic friction. Simulate v(t) and x(t). The deceleration is constant ($a = -\\mu_k g$), so the block follows SUVAT — but only after it starts sliding.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `mu_k, g = 0.35, 10`,
          `v0 = 8   # m/s initial speed`,
          `a = -mu_k * g  # constant deceleration`,
          `t_stop = -v0 / a  # time to stop`,
          ``,
          `t = np.linspace(0, t_stop * 1.2, 300)`,
          `v = np.maximum(0, v0 + a * t)  # clamp at 0`,
          `x = np.where(t <= t_stop, v0*t + 0.5*a*t**2, v0*t_stop + 0.5*a*t_stop**2)`,
          ``,
          `fig, axes = plt.subplots(1, 2, figsize=(11, 4))`,
          `axes[0].plot(t, v, "b-", lw=2.5)`,
          `axes[0].axvline(t_stop, color="r", ls="--", label=f"Stops at t={t_stop:.2f} s")`,
          `axes[0].set_xlabel("t (s)"); axes[0].set_ylabel("v (m/s)")`,
          `axes[0].set_title("Velocity: linear decrease to zero")`,
          `axes[0].legend(); axes[0].grid(True, alpha=0.3)`,
          ``,
          `axes[1].plot(t, x, "g-", lw=2.5)`,
          `axes[1].axvline(t_stop, color="r", ls="--", label=f"Stops after {x[t<=t_stop][-1]:.2f} m")`,
          `axes[1].set_xlabel("t (s)"); axes[1].set_ylabel("x (m)")`,
          `axes[1].set_title("Position: parabola (constant a)")`,
          `axes[1].legend(); axes[1].grid(True, alpha=0.3)`,
          ``,
          `plt.tight_layout()`,
          `plt.savefig("sliding_block.png", dpi=120)`,
          `plt.show()`,
          `print(f"Stopping time: {t_stop:.2f} s, Stopping distance: {v0**2/(2*mu_k*g):.2f} m")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-005-py3',
        type: 'code',
        cellTitle: 'Critical push: minimum force vs. surface and angle',
        prose: `For a block on a ramp, the minimum force to prevent sliding depends on the angle and friction. Compute how $F_{min}$ varies with ramp angle and $\\mu_s$ — and find the critical angle where nothing keeps the block in place.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `m, g = 10, 10`,
          `angles = np.linspace(0, 80, 300)`,
          ``,
          `fig, ax = plt.subplots(figsize=(8, 5))`,
          `for mu_s in [0.2, 0.4, 0.6, 0.8]:`,
          `    # Weight component along slope: mg sinθ`,
          `    # Max static friction: mu_s * mg cosθ`,
          `    # Min force to prevent sliding = mg sinθ - mu_s mg cosθ (if positive)`,
          `    F_min = m * g * (np.sin(np.radians(angles)) - mu_s * np.cos(np.radians(angles)))`,
          `    F_min_clamp = np.maximum(0, F_min)  # if negative, no force needed`,
          `    ax.plot(angles, F_min_clamp, lw=2, label=f'mu_s = {mu_s}')`,
          ``,
          `ax.set_xlabel("Ramp angle (°)")`,
          `ax.set_ylabel("Min force to prevent sliding (N)")`,
          `ax.set_title(f"Minimum restraining force vs. ramp angle (m={m} kg)")`,
          `ax.legend(); ax.grid(True, alpha=0.3)`,
          `plt.tight_layout()`,
          `plt.savefig("ramp_friction.png", dpi=120)`,
          `plt.show()`,
          ``,
          `# Critical angles for each mu_s`,
          `for mu_s in [0.2, 0.4, 0.6, 0.8]:`,
          `    theta_c = np.degrees(np.arctan(mu_s))`,
          `    print(f"  mu_s={mu_s}: critical angle = {theta_c:.1f} deg")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-005-py4',
        type: 'code',
        cellTitle: 'Challenge: find mu_k from braking distance data',
        prose: `A car brakes from 30 m/s to rest in 45 m. From $v^2 = v_0^2 - 2\\mu_k g d$, recover $\\mu_k$. Complete the function and test it.`,
        challengeType: 'write',
        challengeNumber: 1,
        challengeTitle: 'Measure kinetic friction from braking',
        difficulty: 'easy',
        prompt: `Complete find_mu_k(v0, d, g=9.8) that returns the coefficient of kinetic friction given initial speed v0 and braking distance d. Test with v0=30, d=45, g=10.`,
        starterBlock: [
          `def find_mu_k(v0, d, g=9.8):`,
          `    # v^2 = v0^2 - 2*mu_k*g*d  with v=0`,
          `    # 0 = v0^2 - 2*mu_k*g*d`,
          `    mu_k = ___ / ___`,
          `    return mu_k`,
          ``,
          `result = find_mu_k(30, 45, g=10)`,
          `print(f"mu_k = {result:.4f}")`,
          ``,
          `# Verify: decelerating at a = mu_k*g should stop in 45 m`,
          `a = result * 10`,
          `d_check = 30**2 / (2 * a)`,
          `print(f"Check: braking distance = {d_check:.2f} m  (should be 45)")`,
        ].join('\n'),
        testCode: [
          `mu = find_mu_k(30, 45, g=10)`,
          `assert abs(mu - 1.0) < 0.01, f"Expected 1.0, got {mu:.4f}"`,
          `mu2 = find_mu_k(20, 20, g=10)`,
          `assert abs(mu2 - 1.0) < 0.01`,
          `mu3 = find_mu_k(10, 25, g=10)`,
          `assert abs(mu3 - 0.2) < 0.01, f"Expected 0.2, got {mu3:.4f}"`,
          `print("All tests passed!")`,
        ].join('\n'),
        hint: `From $v^2 = v_0^2 - 2\\mu_k g d$ with $v = 0$: $\\mu_k = v_0^2 / (2gd)$.`,
        code: '',
        output: '',
        status: 'idle',
        figureJson: null,
      },
    ],
  },

  quiz: [
    {
      id: 'p1-ch4-005-q1',
      question: `Why does it take more force to START sliding a heavy box than to KEEP it sliding?`,
      options: [
        `Kinetic friction is larger than static friction`,
        `Static friction is larger than kinetic friction ($\\mu_s > \\mu_k$)`,
        `The box gets lighter once it starts moving`,
        `Applied force must overcome inertia separately from friction`,
      ],
      answer: 1,
      explanation: `The coefficient of static friction $\\mu_s$ is always greater than kinetic $\\mu_k$. Maximum static friction $f_{s,max} = \\mu_s N$ exceeds kinetic friction $f_k = \\mu_k N$. Once sliding starts, the friction force drops.`,
    },
    {
      id: 'p1-ch4-005-q2',
      question: `A 20 kg box is on a floor with $\\mu_s = 0.5$, $\\mu_k = 0.35$, $g = 10\\,\\text{m/s}^2$. A horizontal force of 80 N is applied. What happens?`,
      options: [
        `The box slides at 80 N`,
        `The box doesn't move; static friction equals 80 N`,
        `The box doesn't move; static friction equals 100 N`,
        `The box accelerates at 1 m/s²`,
      ],
      answer: 1,
      explanation: `$N = mg = 200\\,\\text{N}$. $f_{s,max} = 0.5 \\times 200 = 100\\,\\text{N}$. Since $F_{app} = 80 < 100 = f_{s,max}$, the box doesn't slide. Static friction adjusts to exactly 80 N to maintain equilibrium.`,
    },
    {
      id: 'p1-ch4-005-q3',
      question: `A 20 kg crate is pushed with a 160 N force on a floor with $\\mu_k = 0.30$, $g = 10\\,\\text{m/s}^2$. What is the acceleration?`,
      options: [
        `$2\\,\\text{m/s}^2$`,
        `$5\\,\\text{m/s}^2$`,
        `$8\\,\\text{m/s}^2$`,
        `$3\\,\\text{m/s}^2$`,
      ],
      answer: 1,
      explanation: `$N = mg = 200\\,\\text{N}$. $f_k = 0.30 \\times 200 = 60\\,\\text{N}$. $a = (160 - 60)/20 = 100/20 = 5\\,\\text{m/s}^2$.`,
    },
    {
      id: 'p1-ch4-005-q4',
      question: `Does friction depend on the contact area between surfaces?`,
      options: [
        `Yes — more area means more friction`,
        `No — friction depends only on normal force and surface type (Coulomb model)`,
        `Yes — less area means more friction (higher pressure)`,
        `It depends on the weight of the object`,
      ],
      answer: 1,
      explanation: `In the Coulomb friction model, $f = \\mu N$ depends only on the normal force and the coefficient $\\mu$, not on contact area. A wide flat box and a narrow tall box with the same mass on the same surface have identical friction force.`,
    },
    {
      id: 'p1-ch4-005-q5',
      question: `A block is pushed at angle $\\theta$ below horizontal. Compared to a horizontal push of the same magnitude, the normal force is:`,
      options: [
        `Smaller (push has upward component)`,
        `Unchanged`,
        `Larger (downward component presses block into floor)`,
        `Equal to mg`,
      ],
      answer: 2,
      explanation: `A downward-angled push adds a downward component to the vertical forces: $N = mg + F\\sin\\theta > mg$. This increases N, which increases kinetic friction — the block accelerates less than with a horizontal push of the same magnitude.`,
    },
    {
      id: 'p1-ch4-005-q6',
      question: `A 15 kg sled is pulled at 20° above horizontal with $T = 60\\,\\text{N}$, $\\mu_k = 0.10$, $g = 10\\,\\text{m/s}^2$ ($\\sin 20° = 0.34$, $\\cos 20° = 0.94$). What is the normal force?`,
      options: [
        `$150\\,\\text{N}$`,
        `$129.6\\,\\text{N}$`,
        `$170.4\\,\\text{N}$`,
        `$120\\,\\text{N}$`,
      ],
      answer: 1,
      explanation: `The upward component of tension reduces N: $N = mg - T\\sin 20° = 150 - 60(0.34) = 150 - 20.4 = 129.6\\,\\text{N}$.`,
    },
    {
      id: 'p1-ch4-005-q7',
      question: `At what critical angle $\\theta_c$ does a block on a ramp just begin to slide if $\\mu_s = 0.7$?`,
      options: [
        `$\\theta_c = \\arccos(0.7) \\approx 45.6°$`,
        `$\\theta_c = \\arctan(0.7) \\approx 35°$`,
        `$\\theta_c = \\arcsin(0.7) \\approx 44.4°$`,
        `$\\theta_c = 0.7 \\times 90° = 63°$`,
      ],
      answer: 1,
      explanation: `Setting $a = 0$: $mg\\sin\\theta_c = \\mu_s mg\\cos\\theta_c \\Rightarrow \\tan\\theta_c = \\mu_s \\Rightarrow \\theta_c = \\arctan(0.7) \\approx 35°$.`,
    },
    {
      id: 'p1-ch4-005-q8',
      question: `Friction is described as a "piecewise function" in calculus. Why?`,
      options: [
        `Because friction changes direction randomly`,
        `Because $f_s$ adjusts continuously up to $f_{s,max}$, then $f_k$ takes a constant value — two different rules depending on motion state`,
        `Because friction is proportional to area`,
        `Because friction requires two separate equations for x and y`,
      ],
      answer: 1,
      explanation: `The friction function has two pieces: $f = F_{app}$ (static, variable) for $F_{app} \\le \\mu_s N$, and $f = \\mu_k N$ (kinetic, constant) when sliding. At the transition point, the function is not differentiable.`,
    },
    {
      id: 'p1-ch4-005-q9',
      question: `A 5 kg block on a 40° ramp has $\\mu_s = 0.6$. ($\\sin 40° \\approx 0.643$, $\\cos 40° \\approx 0.766$, $g = 10$.) Does it slide?`,
      options: [
        `No — $f_{s,max} > W_{\\parallel}$`,
        `Yes — $W_{\\parallel} > f_{s,max}$`,
        `It depends on initial velocity`,
        `Cannot determine without kinetic friction`,
      ],
      answer: 1,
      explanation: `$N = mg\\cos 40° = 38.3\\,\\text{N}$. $f_{s,max} = 0.6 \\times 38.3 = 23.0\\,\\text{N}$. $W_{\\parallel} = mg\\sin 40° = 32.15\\,\\text{N} > 23.0\\,\\text{N}$. The gravity component exceeds maximum friction — the block slides.`,
    },
    {
      id: 'p1-ch4-005-q10',
      question: `A car brakes from 20 m/s to rest in 40 m on a flat road. What is the coefficient of kinetic friction? ($g = 10\\,\\text{m/s}^2$)`,
      options: [
        `$0.25$`,
        `$0.50$`,
        `$1.0$`,
        `$0.75$`,
      ],
      answer: 1,
      explanation: `$v^2 = v_0^2 - 2\\mu_k g d$ with $v = 0$: $\\mu_k = v_0^2/(2gd) = 400/(2 \\times 10 \\times 40) = 400/800 = 0.50$.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch4-005-mis1',
      misconception: 'Kinetic friction gets larger as the object speeds up.',
      why: `Students conflate kinetic friction with air resistance or viscous drag, which DO increase with speed. In the Coulomb model, $f_k = \\mu_k N$ depends only on the normal force — it is completely independent of speed.`,
      correction: `Kinetic friction is constant (for given surfaces and normal force) regardless of how fast the object moves. The block sliding at 1 m/s and at 10 m/s experiences the same $f_k$.`,
      correctionExample: `A 5 kg block ($\\mu_k = 0.4$, $g = 10$) sliding on a horizontal floor has $f_k = 0.4 \\times 50 = 20\\,\\text{N}$ at any speed — whether the block is moving at 2 m/s or 20 m/s.`,
    },
    {
      id: 'p1-ch4-005-mis2',
      misconception: 'Static friction always equals $\\mu_s N$.',
      why: `Students memorize the formula $f_s = \\mu_s N$ without noticing the inequality: $f_s \\le \\mu_s N$. Static friction is a reaction force — it adjusts to whatever value is needed to prevent motion, up to the maximum.`,
      correction: `$\\mu_s N$ is the MAXIMUM static friction, not the actual value. If you push with 40 N and the maximum is 100 N, static friction is exactly 40 N, not 100 N.`,
      correctionExample: `A 20 kg box ($\\mu_s = 0.5$, $N = 200\\,\\text{N}$, $f_{s,max} = 100\\,\\text{N}$). If you push with 60 N, static friction is 60 N — not 100 N. The box stays still and $a = 0$.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch4-005-tp1',
      prompt: `Anti-lock braking systems (ABS) prevent wheel lockup during hard braking. Why does a skidding (locked) wheel stop a car MORE slowly than a wheel on the verge of slipping?`,
      connection: `ABS exploits $\\mu_s > \\mu_k$: a wheel at the verge of slipping uses static friction (larger), while a locked sliding wheel uses kinetic friction (smaller). ABS pulses the brakes to keep wheels in the static regime, maximizing braking force.`,
    },
    {
      id: 'p1-ch4-005-tp2',
      prompt: `Rock climbers apply chalk (magnesium carbonate) to their hands before climbing. How does this relate to the $\\mu_s N$ friction model, and why does chalk help?`,
      connection: `Chalk absorbs sweat, which would lower $\\mu_s$ between skin and rock. By keeping the surface dry, chalk maintains a higher $\\mu_s$ — the maximum static friction $\\mu_s N$ stays large enough to support the climber's weight component along the rock face.`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch4-005-dbg1',
      error: `A student is told a block is already sliding and writes $f_s = \\mu_s N$ to find the friction force. The answer is too high.`,
      explanation: `The block is sliding, so kinetic friction applies — not static. Static friction ($f_s \\le \\mu_s N$) only acts when the object is at rest. Once motion begins, use $f_k = \\mu_k N$, which is smaller since $\\mu_k < \\mu_s$.`,
      fix: `Identify the motion state FIRST. If the object is sliding: $f_k = \\mu_k N$. If stationary (or checking whether it starts): check $f_{s,max} = \\mu_s N$ against the applied force.`,
    },
    {
      id: 'p1-ch4-005-dbg2',
      error: `A block sits on a 30° ramp. A student writes $N = mg$ and computes friction incorrectly.`,
      explanation: `On a ramp, the normal force is perpendicular to the surface, not vertical. The component of gravity perpendicular to the ramp is $mg\\cos\\theta$, so $N = mg\\cos\\theta$. Setting $N = mg$ overestimates friction.`,
      fix: `Always derive N from $\\Sigma F_{\\perp} = 0$ (perpendicular to the surface). On a ramp: $N = mg\\cos\\theta$. So $f_k = \\mu_k mg\\cos\\theta$ — not $\\mu_k mg$.`,
    },
  ],

  mastery: {
    targetLevel: `Apply both static and kinetic friction models: determine whether an object moves, compute acceleration when sliding, find the critical angle for spontaneous sliding, and correctly adjust the normal force when applied forces change it.`,
    checklistItems: [
      `Correctly identify static vs. kinetic regime before choosing a friction formula`,
      `Compute N from $\\Sigma F_y = 0$ including all vertical components (angled pushes, tension)`,
      `Use $f_{s,max} = \\mu_s N$ as a threshold test; compare to the applied force`,
      `Apply $f_k = \\mu_k N$ (constant) once sliding is confirmed`,
      `Derive critical angle: $\\tan\\theta_c = \\mu_s \\Rightarrow \\theta_c = \\arctan(\\mu_s)$`,
      `Recognize friction is independent of contact area and speed (Coulomb model)`,
    ],
    commonStruggles: [
      `Forgetting that N changes when forces are applied at angles (upward pulls reduce N; downward pushes increase it)`,
      `Using $\\mu_s N$ as the actual static friction force rather than the maximum`,
      `Applying kinetic friction formula to a stationary object (or static to a moving one)`,
    ],
    nextSteps: [
      `Inclined planes with friction (p4-007) — combines ramp decomposition with friction thresholds`,
      `Pulley systems (p4-008) — friction on ramps connected by strings, tension modified by friction`,
      `Energy methods (Ch. 6) — work done by friction equals $f_k \\times d$ (thermal energy generated)`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\mu_s`, meaning: `Coefficient of static friction — dimensionless ratio characterizing the maximum static grip between two surfaces` },
      { symbol: `\\mu_k`, meaning: `Coefficient of kinetic friction — always less than $\\mu_s$; characterizes sliding resistance` },
      { symbol: `f_s \\le \\mu_s N`, meaning: `Static friction inequality — adjusts up to maximum; prevents motion` },
      { symbol: `f_k = \\mu_k N`, meaning: `Kinetic friction equation — fixed value that opposes the direction of sliding` },
      { symbol: `N`, meaning: `Normal force — contact force perpendicular to the surface; NOT always $mg$` },
      { symbol: `\\theta_c = \\arctan(\\mu_s)`, meaning: `Critical angle — ramp angle at which gravity just overcomes maximum static friction` },
    ],
    rulesOfThumb: [
      `Always determine the motion state (static or kinetic) before choosing a friction formula`,
      `$\\mu_k < \\mu_s$ always — starting friction exceeds sliding friction`,
      `Friction force is independent of contact area — a wide and narrow block on the same surface have the same $f$`,
      `Normal force equals $mg$ only on a horizontal surface with no other vertical forces`,
      `For ramp problems, compute $N = mg\\cos\\theta$ first, then multiply by $\\mu$`,
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Friction: Static vs Kinetic — Python Lab',
      cells: [
        {
          cellTitle: 'The friction curve: static vs kinetic',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

m, g = 30, 10
mu_s, mu_k = 0.45, 0.30
N = m * g
f_s_max = mu_s * N   # threshold where static gives way to kinetic
f_k = mu_k * N       # constant kinetic value once sliding

F_app = np.linspace(0, 200, 500)
# np.where: in static regime f equals F_app; in kinetic regime f = f_k (constant)
friction = np.where(F_app <= f_s_max, F_app, f_k)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(F_app, friction, 'b-', lw=2.5)
ax.axvline(f_s_max, color='red', ls='--', label=f'f_s_max = {f_s_max:.0f} N (sliding starts)')
ax.axhline(f_k, color='green', ls=':', lw=2, label=f'f_k = {f_k:.0f} N (kinetic, constant)')
ax.annotate('Static regime\\n(f = F_app)', xy=(50, 55), fontsize=10, color='navy')
ax.annotate('Kinetic regime\\n(f = const)', xy=(150, f_k - 16), fontsize=10, color='darkgreen')
ax.set_xlabel('Applied force F_app (N)')
ax.set_ylabel('Friction force f (N)')
ax.set_title(f'Friction curve: mu_s={mu_s}, mu_k={mu_k}, m={m} kg')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.savefig('friction_curve.png', dpi=120); plt.show()`,
          prose: [
            `\`np.where(F_app <= f_s_max, F_app, f_k)\` implements the piecewise Coulomb model: in the static regime the friction exactly cancels the applied force; at the threshold $f_{s,max} = \\mu_s N$ the surface "breaks loose" and friction drops to the fixed kinetic value $f_k = \\mu_k N$.`,
            `The vertical red dashed line marks $f_{s,max} = 135\\,\\text{N}$ — the force you must exceed to initiate sliding. The green dotted line shows $f_k = 90\\,\\text{N}$ that remains once sliding. The 45 N gap between them is why the box "suddenly feels easier" once it starts moving.`,
            `This plot is NOT differentiable at the transition point — friction has a jump discontinuity in its derivative there. This is what makes friction a piecewise function and why it requires careful handling in dynamics simulations.`,
          ],
        },
        {
          cellTitle: 'Sliding block: constant deceleration to a stop',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

mu_k, g = 0.35, 10
v0 = 8          # m/s initial speed
a = -mu_k * g   # constant deceleration from f_k = mu_k * m * g  =>  a = -mu_k * g
t_stop = -v0 / a  # solve v0 + a*t = 0 for t

t = np.linspace(0, t_stop * 1.2, 300)
v = np.maximum(0, v0 + a * t)      # v(t) = v0 + at; clamp at 0 when block stops
# x(t) = v0*t + 0.5*a*t^2 (valid up to t_stop; constant after)
x = np.where(t <= t_stop,
             v0*t + 0.5*a*t**2,
             v0*t_stop + 0.5*a*t_stop**2)

fig, axes = plt.subplots(1, 2, figsize=(11, 4))
axes[0].plot(t, v, 'b-', lw=2.5)
axes[0].axvline(t_stop, color='r', ls='--', label=f'Stops at t={t_stop:.2f} s')
axes[0].set_xlabel('t (s)'); axes[0].set_ylabel('v (m/s)')
axes[0].set_title('Velocity: linear decrease to zero'); axes[0].legend(); axes[0].grid(True, alpha=0.3)

axes[1].plot(t, x, 'g-', lw=2.5)
axes[1].axvline(t_stop, color='r', ls='--', label=f'Stops after {v0**2/(2*mu_k*g):.2f} m')
axes[1].set_xlabel('t (s)'); axes[1].set_ylabel('x (m)')
axes[1].set_title('Position: parabola then flat'); axes[1].legend(); axes[1].grid(True, alpha=0.3)

plt.tight_layout(); plt.savefig('sliding_block.png', dpi=120); plt.show()
print(f'Stopping time: {t_stop:.2f} s,  stopping distance: {v0**2/(2*mu_k*g):.2f} m')`,
          prose: [
            `Since $f_k = \\mu_k N = \\mu_k mg$, Newton's second law gives $ma = -\\mu_k mg \\Rightarrow a = -\\mu_k g$ — a constant deceleration that doesn't depend on mass. This is why a heavy truck and a sports car (same $\\mu_k$) take the same distance to stop if they have the same initial speed.`,
            `The velocity plot is a straight line with slope $a = -\\mu_k g = -3.5\\,\\text{m/s}^2$, and the position is a downward-opening parabola — exactly the SUVAT kinematics from Chapter 2, now with the acceleration determined by friction.`,
            `The stopping distance formula $d = v_0^2 / (2\\mu_k g)$ comes from $v^2 = v_0^2 + 2ad$ with $v = 0$: quadrupling speed requires four times the braking distance. This is why highway speed limits matter.`,
          ],
        },
        {
          cellTitle: 'Critical angle: when does a block slide spontaneously?',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

m, g = 10, 10
angles = np.linspace(0, 80, 300)
theta_rad = np.radians(angles)

fig, ax = plt.subplots(figsize=(8, 5))
for mu_s in [0.2, 0.4, 0.6, 0.8]:
    # Along slope: W_parallel = mg sin(theta)  (drives sliding)
    # Max static friction: f_s_max = mu_s * N = mu_s * mg cos(theta)  (resists sliding)
    # Net tendency = mg sin - mu_s * mg cos; positive means slides
    F_net = m * g * (np.sin(theta_rad) - mu_s * np.cos(theta_rad))
    # Clamp: if net is negative, no force needed — block stays put
    ax.plot(angles, np.maximum(0, F_net), lw=2, label=f'mu_s = {mu_s}')
    theta_c = np.degrees(np.arctan(mu_s))
    ax.axvline(theta_c, ls=':', alpha=0.4)

ax.set_xlabel('Ramp angle (deg)')
ax.set_ylabel('Net sliding tendency (N)')
ax.set_title(f'Block slides spontaneously above critical angle (m={m} kg)')
ax.legend(); ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.savefig('critical_angle.png', dpi=120); plt.show()

for mu_s in [0.2, 0.4, 0.6, 0.8]:
    theta_c = np.degrees(np.arctan(mu_s))
    print(f'  mu_s = {mu_s}:  critical angle = {theta_c:.1f} deg')`,
          prose: [
            `At angle $\\theta$, gravity pulls the block down the slope with $W_\\parallel = mg\\sin\\theta$, while maximum static friction resists with $f_{s,max} = \\mu_s mg\\cos\\theta$. Sliding starts when $W_\\parallel > f_{s,max}$: $mg\\sin\\theta > \\mu_s mg\\cos\\theta \\Rightarrow \\tan\\theta > \\mu_s$.`,
            `The critical angle $\\theta_c = \\arctan(\\mu_s)$ is where the curves leave zero. Above it, even maximum friction can't prevent motion. This is why measuring $\\theta_c$ experimentally (by tilting a surface until the block just slides) gives a direct measurement of $\\mu_s$.`,
            `Notice the lines start rising at different angles depending on $\\mu_s$: rubber on concrete ($\\mu_s \\approx 0.8$) needs a steep 38.7° ramp before it slides; wet ice ($\\mu_s \\approx 0.1$, $\\theta_c \\approx 5.7°$) would slide on nearly any incline.`,
          ],
        },
        {
          cellTitle: 'Challenge: recover mu_k from braking distance data',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `def find_mu_k(v0, d, g=9.8):
    # From v^2 = v0^2 - 2*mu_k*g*d with v=0:
    # 0 = v0^2 - 2*mu_k*g*d  =>  mu_k = v0^2 / (2*g*d)
    mu_k = ___ / ___
    return mu_k

result = find_mu_k(30, 45, g=10)
print(f"mu_k = {result:.4f}")

# Verify: deceleration a = mu_k*g should stop in exactly d meters
a = result * 10
d_check = 30**2 / (2 * a)
print(f"Check: braking distance = {d_check:.2f} m  (should be 45.00)")`,
          prose: [
            `From kinematics $v^2 = v_0^2 - 2\\mu_k g d$ with final speed $v = 0$: rearranging gives $\\mu_k = v_0^2 / (2gd)$. Fill in the two blanks to complete the formula and run the verification check below it.`,
            `This is how automotive engineers measure traction on different road surfaces: drive at known speed, apply brakes, measure stopping distance, and solve for $\\mu_k$. ABS systems are tuned based on exactly this kind of measurement.`,
            `Test with v0=30 m/s, d=45 m, g=10: expected $\\mu_k = 900 / 900 = 1.0$. Also try v0=10 m/s, d=25 m, g=10: $\\mu_k = 100 / 500 = 0.2$ (wet asphalt).`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Friction: Static vs Kinetic — MATLAB/Octave Lab',
      cells: [
        {
          cellTitle: 'The friction curve: static vs kinetic',
          type: 'code',
          language: 'matlab',
          code: `m = 30; g = 10;
mu_s = 0.45; mu_k = 0.30;
N = m * g;
f_s_max = mu_s * N;   % threshold: static gives way to kinetic
f_k = mu_k * N;       % constant kinetic friction once sliding

F_app = linspace(0, 200, 500);
% Piecewise: static regime f = F_app; kinetic regime f = f_k
friction = F_app .* (F_app <= f_s_max) + f_k * (F_app > f_s_max);

figure; plot(F_app, friction, 'b-', 'LineWidth', 2.5); hold on;
xline(f_s_max, 'r--', sprintf('f_{s,max} = %.0f N', f_s_max), 'LineWidth', 1.5);
yline(f_k, 'g:', sprintf('f_k = %.0f N', f_k), 'LineWidth', 2);
xlabel('Applied force F_{app} (N)'); ylabel('Friction force f (N)');
title(sprintf('Friction curve: mu_s=%.2f, mu_k=%.2f, m=%d kg', mu_s, mu_k, m));
legend('Friction', 'f_{s,max}', 'f_k'); grid on;`,
          prose: [
            `In MATLAB/Octave, the piecewise logic uses logical arrays: \`F_app <= f_s_max\` produces a 0/1 array that selects the static piece ($f = F_{app}$) and \`F_app > f_s_max\` selects the kinetic piece ($f = f_k$). This is the same Coulomb model as the Python version.`,
            `The \`xline\` and \`yline\` commands mark the threshold at $f_{s,max} = \\mu_s N = 135\\,\\text{N}$ and the kinetic plateau at $f_k = 90\\,\\text{N}$. The 45 N drop at the transition is the μ_s − μ_k gap.`,
            `The dot operator (\`.*\`) is element-wise multiplication on arrays — essential in MATLAB when multiplying two arrays element by element rather than performing matrix multiplication.`,
          ],
        },
        {
          cellTitle: 'Sliding block: constant deceleration to a stop',
          type: 'code',
          language: 'matlab',
          code: `mu_k = 0.35; g = 10;
v0 = 8;              % m/s initial speed
a = -mu_k * g;       % a = -mu_k*g (constant deceleration)
t_stop = -v0 / a;    % solve v0 + a*t = 0

t = linspace(0, t_stop * 1.2, 300);
v = max(0, v0 + a * t);   % v(t) = v0 + at; clamp at 0
x = zeros(size(t));
for i = 1:length(t)
    if t(i) <= t_stop
        x(i) = v0*t(i) + 0.5*a*t(i)^2;
    else
        x(i) = v0*t_stop + 0.5*a*t_stop^2;
    end
end

figure;
subplot(1,2,1); plot(t, v, 'b-', 'LineWidth', 2.5); hold on;
xline(t_stop, 'r--', sprintf('Stop at t=%.2f s', t_stop));
xlabel('t (s)'); ylabel('v (m/s)'); title('Velocity vs time'); grid on;

subplot(1,2,2); plot(t, x, 'g-', 'LineWidth', 2.5); hold on;
xline(t_stop, 'r--', sprintf('d=%.2f m', v0^2/(2*mu_k*g)));
xlabel('t (s)'); ylabel('x (m)'); title('Position vs time'); grid on;

fprintf('Stopping time: %.2f s,  stopping distance: %.2f m\\n', t_stop, v0^2/(2*mu_k*g));`,
          prose: [
            `The for-loop implements the piecewise position: parabolic while $t \\le t_{stop}$, then flat afterward. In MATLAB, \`max(0, ...)\` clamps velocity to zero once the block stops (kinetic friction cannot reverse direction).`,
            `The deceleration $a = -\\mu_k g = -3.5\\,\\text{m/s}^2$ is constant, so the velocity is linear and position is quadratic — SUVAT equations apply directly. The mass cancels from $ma = -\\mu_k mg$.`,
            `Stopping distance formula: $d = v_0^2 / (2\\mu_k g)$. Try changing \`v0\` to 16 m/s — the stopping distance should be four times larger (16² vs 8² gives factor of 4), confirming the quadratic dependence.`,
          ],
        },
        {
          cellTitle: 'Critical angle for different surface pairs',
          type: 'code',
          language: 'matlab',
          code: `m = 10; g = 10;
angles = linspace(0, 80, 300);
theta_rad = deg2rad(angles);  % MATLAB uses radians in trig functions

figure; hold on;
mu_vals = [0.2, 0.4, 0.6, 0.8];
colors = {'b', 'r', 'g', 'm'};
for i = 1:length(mu_vals)
    mu_s = mu_vals(i);
    % Net sliding tendency = mg sin(theta) - mu_s * mg cos(theta)
    F_net = m * g * (sin(theta_rad) - mu_s * cos(theta_rad));
    F_net_clamped = max(0, F_net);   % negative means block stays
    plot(angles, F_net_clamped, colors{i}, 'LineWidth', 2, ...
         'DisplayName', sprintf('mu_s = %.1f', mu_s));
end

xlabel('Ramp angle (deg)'); ylabel('Net sliding tendency (N)');
title('Block slides spontaneously above critical angle');
legend('Location', 'northwest'); grid on;

fprintf('Critical angles:\\n');
for i = 1:length(mu_vals)
    theta_c = rad2deg(atan(mu_vals(i)));
    fprintf('  mu_s = %.1f:  theta_c = %.1f deg\\n', mu_vals(i), theta_c);
end`,
          prose: [
            `\`deg2rad\` converts the angle array to radians for MATLAB's \`sin\` and \`cos\` functions. The net sliding tendency is $mg(\\sin\\theta - \\mu_s \\cos\\theta)$; \`max(0, ...)\` clamps negative values to zero (block stays put below critical angle).`,
            `\`rad2deg(atan(mu_s))\` computes the critical angle $\\theta_c = \\arctan(\\mu_s)$. This is the angle at which the block is on the verge of sliding — tilting the ramp just past this angle causes spontaneous motion.`,
            `Measuring the critical angle experimentally gives $\\mu_s$ directly: $\\mu_s = \\tan(\\theta_c)$. This is a standard lab technique — simpler than measuring friction forces with sensors.`,
          ],
        },
        {
          cellTitle: 'Challenge: recover mu_k from braking distance data',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `function mu_k = find_mu_k(v0, d, g)
    % From v^2 = v0^2 - 2*mu_k*g*d with v=0:
    %   mu_k = v0^2 / (2*g*d)
    mu_k = ___ / ___;
end

result = find_mu_k(30, 45, 10);
fprintf('mu_k = %.4f\\n', result);

% Verify: braking distance check
a = result * 10;
d_check = 30^2 / (2 * a);
fprintf('Check: braking distance = %.2f m  (should be 45.00)\\n', d_check);`,
          prose: [
            `Fill in the formula $\\mu_k = v_0^2 / (2gd)$ to complete the function. With v0=30, d=45, g=10: $\\mu_k = 900 / 900 = 1.0$ (high-friction surface like dry rubber).`,
            `The verification computes the stopping distance backward from $\\mu_k$ — if the formula is correct, it should return exactly 45 m. This round-trip check is a general debugging technique: compute a quantity, derive the input from it, compare.`,
            `Try calling \`find_mu_k(20, 80, 10)\` — expected $\\mu_k = 400/1600 = 0.25$ (wet road). Notice that a car going twice as fast (20 vs 10 m/s) on the same road needs four times the stopping distance.`,
          ],
        },
      ],
    },
  },

  viz: [
    { id: 'SVGDiagram', props: { type: 'free-body-diagram' }, title: 'Friction force on a block' },
    { id: 'ForceBlockSim', props: {}, title: 'Interactive: static vs. kinetic friction' },
  ],
}
