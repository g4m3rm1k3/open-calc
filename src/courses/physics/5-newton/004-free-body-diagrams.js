export default {
  id: 'p1-ch4-004',
  slug: 'free-body-diagrams',
  chapter: 'p4',
  order: 3,
  title: 'Free Body Diagrams',
  subtitle: 'The systematic method for identifying forces and setting up Newton\'s Second Law for any object.',
  tags: ['free-body-diagram', 'forces', 'normal-force', 'tension', 'friction', 'dynamics', 'problem-solving'],

  hook: {
    question: 'How do engineers design a bridge without knowing in advance which direction each internal force points?',
    realWorldContext: "Free body diagrams (FBDs) are the universal language of mechanics. Every structural engineer, roboticist, and physicist draws them before writing a single equation. An FBD isolates one object and shows every force acting on it as a labeled vector. Without an FBD, even simple problems become confusing. With one, even complex problems become systematic.",
    previewVisualizationId: 'SVGDiagram',
  },

  intuition: {
    prose: [
      'A free body diagram is a picture of ONE object in isolation, with every external force drawn as an arrow at the point of application (or at the center for simplicity). Internal forces — interactions between parts of the object — are NOT drawn.',
      'The five common forces you will draw in every introductory problem: (1) Weight W = mg, always straight down from the center of mass. (2) Normal force N, perpendicular to any surface the object touches. (3) Tension T, along a rope or cable, always pulling away from the object. (4) Friction f, parallel to the surface, opposing motion (or tendency of motion). (5) Applied force F_app, in whatever direction stated.',
      'After drawing the FBD, choose a coordinate system (usually x right, y up — or tilted to align with the acceleration direction). Project every force onto your axes. Then write ΣFₓ = maₓ and ΣFᵧ = maᵧ. You now have algebra equations that you can solve.',
      "The FBD is not decoration — it IS the physics. Skipping it leads to sign errors, missing forces, and wrong answers. Professional engineers draw FBDs even for problems they've solved hundreds of times.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Free Body Diagram (FBD)',
        body: 'A diagram showing a single isolated object with all external forces drawn as vector arrows, each labeled with its magnitude and direction. Internal forces are omitted.',
      },
      {
        type: 'definition',
        title: 'Normal Force (N)',
        body: 'The contact force exerted by a surface on an object, always perpendicular (normal) to the surface. N is NOT always equal to mg — that is only true on a horizontal surface with no vertical applied forces.',
      },
      {
        type: 'definition',
        title: 'Tension (T)',
        body: 'The pulling force exerted by a rope, cable, or string along its length, directed away from the object (ropes pull, never push). For a massless rope, tension is the same throughout.',
      },
      {
        type: 'insight',
        title: '5-step FBD procedure',
        body: '(1) Isolate the object. (2) Identify all contact and field forces. (3) Draw each as a vector with label. (4) Choose coordinate axes (align with acceleration if possible). (5) Write ΣF = ma for each axis.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'FBD of a block on a horizontal surface being pushed',
        caption: 'Applied force F_app (right), friction f (left), weight W (down), normal N (up). All four forces are drawn as arrows from the center. The FBD makes it clear that only the horizontal forces affect horizontal acceleration.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Hanging mass: two tension forces in balance',
        mathBridge: `A mass hanging from two ropes at different angles has three forces: weight down and two tensions at angles. Setting $\\sum F_x = 0$ and $\\sum F_y = 0$ gives two equations for two unknowns (the tension magnitudes).`,
        caption: 'FBD converts a 2D geometry problem into a system of algebra equations.',
      },
    ],
  },

  math: {
    prose: [
      'Once you have an FBD, the mathematical work is mechanical: resolve each force into x and y components, then sum each component and set equal to maₓ or maᵧ.',
      'For an object on a horizontal surface with a horizontal push F, kinetic friction f_k, mass m, and acceleration a: ΣFₓ = F − f_k = ma (horizontal); ΣFᵧ = N − mg = 0 (vertical, no vertical acceleration). Two equations, solve for a and N.',
      'For a hanging mass in equilibrium on two ropes at angles θ₁ and θ₂: ΣFₓ = T₂cosθ₂ − T₁cosθ₁ = 0; ΣFᵧ = T₁sinθ₁ + T₂sinθ₂ − mg = 0. Two equations, two unknowns T₁ and T₂.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Standard FBD equations for block on horizontal surface',
        body: '\\sum F_x = F_{\\text{app}} - f = ma_x \\qquad \\sum F_y = N - mg = 0 \\quad\\Rightarrow\\quad N = mg',
      },
      {
        type: 'insight',
        title: 'When N ≠ mg',
        body: "Normal force equals mg only for an object on a horizontal surface with no vertical applied forces. If the surface is tilted, if a force pushes vertically, or if the object is accelerating vertically, then N ≠ mg. Always derive N from ΣFᵧ = maᵧ.",
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The FBD method is a systematic application of particle mechanics. The key assumption is that the object can be treated as a point mass — all forces effectively act at one point, and we ignore rotation (torque).',
      'Every force in an FBD is a vector F⃗ with components (Fₓ, Fᵧ). The vector sum ΣF⃗ = Σ(Fₓ, Fᵧ) = (ΣFₓ, ΣFᵧ). By the Second Law, (ΣFₓ, ΣFᵧ) = m(aₓ, aᵧ). This gives two independent scalar equations.',
      'The choice of coordinate axes does not change the physics — only the algebra. Aligning one axis with the acceleration direction zeros out one component equation and simplifies the other. For inclined planes, tilting the axes with the slope is standard and reduces computation.',
      'The FBD is the interface between the physical world and the mathematical model. A correct FBD guarantees a solvable system; an incorrect FBD (wrong forces, wrong directions) gives nonsensical results every time.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'FBD → equations systematically',
        body: '\\sum \\vec{F} = m\\vec{a} \\quad\\Longrightarrow\\quad \\begin{cases} \\sum F_x = m a_x \\\\ \\sum F_y = m a_y \\end{cases}',
      },
    ],
    visualizationId: 'SVGDiagram',
    visualizationProps: { type: 'free-body-diagram' },
    proofSteps: [
      {
        title: 'Identify the system boundary',
        expression: '\\text{Isolate object; everything outside the boundary exerts forces on it}',
        annotation: 'Forces from other objects crossing the boundary are external forces — draw them. Forces within the object are internal — do not draw them.',
      },
      {
        title: 'Enumerate all forces',
        expression: '\\{\\vec{W}, \\vec{N}, \\vec{T}, \\vec{f}, \\vec{F}_{\\text{app}}, \\ldots\\}',
        annotation: 'Go through every type: gravity, normal (each surface), tension (each rope), friction (each surface), applied. Do not invent forces that do not exist.',
      },
      {
        title: 'Assign coordinate axes',
        expression: 'x\\text{-axis: horizontal (or along slope)}, \\quad y\\text{-axis: vertical (or perpendicular to slope)}',
        annotation: 'Choose axes to minimize components that need resolving. Align with acceleration when possible.',
      },
      {
        title: 'Project each force onto axes',
        expression: 'F_x = F\\cos\\theta, \\quad F_y = F\\sin\\theta \\qquad (\\theta = \\text{angle from x-axis})',
        annotation: 'Watch signs — forces opposing the positive direction get a negative sign.',
      },
      {
        title: 'Write and solve Newton\'s Second Law',
        expression: '\\sum F_x = ma_x \\quad \\text{and} \\quad \\sum F_y = ma_y',
        annotation: 'Two equations, solve for the unknowns (often a and N, or two tensions).',
      },
    ],
    title: 'Methodology: From FBD to solved equations',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Step-by-step FBD construction',
        mathBridge: `Each step in the FBD procedure corresponds to a mathematical operation: enumeration → list of vectors; projection → component decomposition; Newton's Law → system of equations; solve → algebra.`,
        caption: `Physics thinking (FBD) converts directly to mathematical equations.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch4-004-ex1',
      title: 'Block on horizontal surface with applied force and friction',
      problem: 'A 10 kg block on a horizontal surface is pushed to the right by F = 50 N. Kinetic friction is f_k = 20 N. Find the acceleration and the normal force. Use g = 10 m/s².',
      steps: [
        {
          expression: '\\text{FBD forces: } F_{\\text{app}} = 50\\,\\text{N (right)}, f_k = 20\\,\\text{N (left)}, W = 100\\,\\text{N (down)}, N = ?\\,(\\text{up})',
          annotation: 'List all four forces before writing equations.',
        },
        {
          expression: '\\sum F_y = N - W = 0 \\quad\\Rightarrow\\quad N = W = mg = 100\\,\\text{N}',
          annotation: 'No vertical acceleration; normal force balances weight.',
        },
        {
          expression: '\\sum F_x = 50 - 20 = 30\\,\\text{N} \\quad\\Rightarrow\\quad a = \\frac{30}{10} = 3\\,\\text{m/s}^2',
          annotation: 'Net horizontal force = 30 N; divide by mass for acceleration.',
        },
      ],
      conclusion: 'Acceleration = 3 m/s² to the right; Normal force = 100 N.',
    },
    {
      id: 'ch4-004-ex2',
      title: 'Hanging mass on two ropes at angles',
      problem: 'A 6 kg traffic light hangs from two ropes: rope 1 makes 53° with the horizontal, rope 2 makes 37° with the horizontal. Find tensions T₁ and T₂. (sin 37° = 0.6, cos 37° = 0.8, sin 53° = 0.8, cos 53° = 0.6.) Use g = 10 m/s².',
      steps: [
        {
          expression: 'W = mg = 6 \\times 10 = 60\\,\\text{N (down)}',
          annotation: 'Weight of the traffic light.',
        },
        {
          expression: '\\sum F_x = T_2 \\cos 37° - T_1 \\cos 53° = 0 \\quad\\Rightarrow\\quad 0.8 T_2 - 0.6 T_1 = 0',
          annotation: 'Horizontal equilibrium: x-components of both tensions must cancel.',
        },
        {
          expression: '\\sum F_y = T_1 \\sin 53° + T_2 \\sin 37° - 60 = 0 \\quad\\Rightarrow\\quad 0.8 T_1 + 0.6 T_2 = 60',
          annotation: 'Vertical equilibrium: upward tension components support the weight.',
        },
        {
          expression: '\\text{From x-equation: } T_1 = \\frac{0.8}{0.6} T_2 = \\frac{4}{3} T_2',
          annotation: 'Express T₁ in terms of T₂.',
        },
        {
          expression: '0.8 \\cdot \\frac{4}{3} T_2 + 0.6 T_2 = 60 \\quad\\Rightarrow\\quad \\frac{3.2 + 1.8}{3} T_2 = \\frac{5}{3} T_2 = 60 \\quad\\Rightarrow\\quad T_2 = 36\\,\\text{N}',
          annotation: 'Substitute and solve for T₂.',
        },
        {
          expression: 'T_1 = \\frac{4}{3}(36) = 48\\,\\text{N}',
          annotation: 'Back-substitute for T₁.',
        },
      ],
      conclusion: 'T₁ = 48 N (steeper rope carries more force), T₂ = 36 N. Verify: 0.8(48) + 0.6(36) = 38.4 + 21.6 = 60 N ✓',
    },
  ],

  challenges: [
    {
      id: 'ch4-004-ch1',
      difficulty: 'easy',
      problem: 'Draw the FBD for a 5 kg block sliding down a frictionless ramp. Identify the TWO forces acting. Write their names, directions, and the axis equations. Use g = 10 m/s².',
      hint: 'On a ramp, only weight and normal force act (frictionless). Normal is perpendicular to the ramp surface, not vertical.',
      walkthrough: [
        {
          expression: '\\text{Forces: Weight } W = 50\\,\\text{N (vertically down)}, \\quad N \\perp \\text{ramp surface}',
          annotation: 'Two forces only on a frictionless ramp: gravity and normal.',
        },
        {
          expression: '\\sum F_{\\perp} = N - mg\\cos\\theta = 0 \\quad\\Rightarrow\\quad N = mg\\cos\\theta',
          annotation: 'Perpendicular to ramp: no acceleration in this direction.',
        },
        {
          expression: '\\sum F_{\\parallel} = mg\\sin\\theta = ma \\quad\\Rightarrow\\quad a = g\\sin\\theta',
          annotation: 'Along ramp: weight component drives acceleration down the slope.',
        },
      ],
      answer: 'Two forces: W (down) and N (perpendicular to slope). N = mg cosθ; a = g sinθ along slope.',
    },
    {
      id: 'ch4-004-ch2',
      difficulty: 'medium',
      problem: 'A 4 kg block is pushed against a vertical wall by a horizontal force of 80 N. The coefficient of static friction between block and wall is μ_s = 0.4. Does the block slide? Find the friction force and normal force. Use g = 10 m/s².',
      hint: 'The normal force here comes from the horizontal push, not from gravity. Draw the FBD carefully.',
      walkthrough: [
        {
          expression: 'N = F_{\\text{push}} = 80\\,\\text{N} \\qquad (\\text{normal to the vertical wall})',
          annotation: 'The wall\'s normal force balances the horizontal push. N ≠ mg here!',
        },
        {
          expression: 'W = mg = 4 \\times 10 = 40\\,\\text{N (down)}',
          annotation: 'Weight pulls the block downward.',
        },
        {
          expression: 'f_{s,\\max} = \\mu_s N = 0.4 \\times 80 = 32\\,\\text{N}',
          annotation: 'Maximum static friction the wall can provide.',
        },
        {
          expression: 'W = 40\\,\\text{N} > f_{s,\\max} = 32\\,\\text{N} \\quad\\Rightarrow\\quad \\text{block slides down}',
          annotation: 'Gravity exceeds maximum friction — the block cannot be held.',
        },
      ],
      answer: 'N = 80 N (horizontal), maximum friction = 32 N. Since weight (40 N) exceeds maximum friction (32 N), the block slides down.',
    },
    {
      id: 'ch4-004-ch3',
      difficulty: 'hard',
      problem: 'A 3 kg block is suspended by two vertical ropes. Then a horizontal rope pulls it to the right so it hangs at 30° from vertical. The left-upper rope is now at angle 30° from vertical. Find: (a) the tension in the diagonal rope, (b) the tension in the horizontal rope. Use g = 10 m/s². (sin 30° = 0.5, cos 30° = 0.866.)',
      hint: 'Draw the FBD with three forces: T₁ (diagonal, upper-left), T₂ (horizontal, right), W (down). Use equilibrium equations.',
      walkthrough: [
        {
          expression: 'W = 3 \\times 10 = 30\\,\\text{N}',
          annotation: 'Weight is 30 N downward.',
        },
        {
          expression: '\\sum F_y = T_1 \\cos 30° - W = 0 \\quad\\Rightarrow\\quad T_1 = \\frac{30}{\\cos 30°} = \\frac{30}{0.866} \\approx 34.6\\,\\text{N}',
          annotation: 'Vertical component of T₁ supports the entire weight.',
        },
        {
          expression: '\\sum F_x = T_1 \\sin 30° - T_2 = 0 \\quad\\Rightarrow\\quad T_2 = 34.6 \\times 0.5 = 17.3\\,\\text{N}',
          annotation: 'Horizontal component of T₁ is balanced by the horizontal tension.',
        },
      ],
      answer: 'Diagonal rope tension T₁ ≈ 34.6 N; horizontal rope tension T₂ ≈ 17.3 N.',
    },
  ],

  python: {
    intro: `Use Python to solve FBD problems systematically: build component tables, solve 2×2 linear systems for tension problems, and visualize force vectors.`,
    cells: [
      {
        id: 'p4-004-py1',
        type: 'code',
        cellTitle: 'FBD solver: block on horizontal surface',
        prose: `Implement the 5-step FBD procedure in code: list forces, decompose into components, sum each axis, solve for unknowns.`,
        code: [
          `import math`,
          ``,
          `def solve_pushed_block(m, F_app, theta_deg, mu_k, g=10):`,
          `    """Block pushed at angle theta below horizontal."""`,
          `    theta = math.radians(theta_deg)`,
          `    Fx = F_app * math.cos(theta)`,
          `    Fy_app = -F_app * math.sin(theta)  # downward component`,
          `    # Vertical equilibrium: N + Fy_app - mg = 0`,
          `    N = m * g - Fy_app`,
          `    f_k = mu_k * N`,
          `    a = (Fx - f_k) / m`,
          `    return {"N": N, "f_k": f_k, "a": a, "Fx": Fx}`,
          ``,
          `# Example from lesson: 10 kg, 50 N push at 30 degrees below horizontal`,
          `result = solve_pushed_block(m=10, F_app=50, theta_deg=30, mu_k=0.25)`,
          `print("=== FBD: Block pushed at 30° below horizontal ===")`,
          `for k, v in result.items():`,
          `    print(f"  {k}: {v:.3f}")`,
          ``,
          `# Verify: N should be 125 N, a ≈ 1.2 m/s^2`,
          `assert abs(result["N"] - 125) < 0.1`,
          `assert abs(result["a"] - 1.205) < 0.05`,
          `print("Verified!")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-004-py2',
        type: 'code',
        cellTitle: 'Solve the two-rope tension problem as a linear system',
        prose: `Two cables support a weight. Writing $\\sum F_x = 0$ and $\\sum F_y = 0$ gives a 2×2 linear system $A\\vec{T} = \\vec{b}$. Solve with numpy.linalg.solve.`,
        code: [
          `import numpy as np`,
          ``,
          `def two_rope_tension(theta1_deg, theta2_deg, W):`,
          `    """`,
          `    T1 at theta1 from horizontal (left side)`,
          `    T2 at theta2 from horizontal (right side)`,
          `    Weight W downward.`,
          `    """`,
          `    t1 = np.radians(theta1_deg)`,
          `    t2 = np.radians(theta2_deg)`,
          `    # sum Fx = 0: -T1 cos(t1) + T2 cos(t2) = 0`,
          `    # sum Fy = 0:  T1 sin(t1) + T2 sin(t2) = W`,
          `    A = np.array([`,
          `        [-np.cos(t1),  np.cos(t2)],`,
          `        [ np.sin(t1),  np.sin(t2)],`,
          `    ])`,
          `    b = np.array([0, W])`,
          `    T = np.linalg.solve(A, b)`,
          `    return T[0], T[1]`,
          ``,
          `# Traffic light: theta1=53, theta2=37, W=60 N`,
          `T1, T2 = two_rope_tension(53, 37, 60)`,
          `print(f"Traffic light (53°/37°, W=60 N):")`,
          `print(f"  T1 = {T1:.2f} N  (expected 48)")`,
          `print(f"  T2 = {T2:.2f} N  (expected 36)")`,
          ``,
          `# Symmetric case: 50/50, W=40 N`,
          `T1s, T2s = two_rope_tension(50, 50, 40)`,
          `print(f"Symmetric cables (50°/50°, W=40 N):")`,
          `print(f"  T1 = T2 = {T1s:.2f} N  (expected ~26.1)")`,
          ``,
          `# Near-horizontal cable: 5 degrees each — very high tension!`,
          `T1h, T2h = two_rope_tension(5, 5, 100)`,
          `print(f"Near-horizontal cables (5°/5°, W=100 N):")`,
          `print(f"  T = {T1h:.1f} N  (much larger than W!)")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-004-py3',
        type: 'code',
        cellTitle: 'Tension vs. cable angle: the dangerous shallow cable',
        prose: `For a symmetric V-cable supporting weight W, tension $T = W/(2\\sin\\theta)$. As $\\theta \\to 0°$, $T \\to \\infty$. Plot this to show why near-horizontal cables are catastrophically dangerous.`,
        code: [
          `import numpy as np`,
          `import matplotlib.pyplot as plt`,
          ``,
          `W = 100  # N`,
          `angles = np.linspace(1, 90, 400)  # degrees, avoid 0`,
          `T = W / (2 * np.sin(np.radians(angles)))`,
          ``,
          `fig, ax = plt.subplots(figsize=(8, 5))`,
          `ax.plot(angles, T, "b-", lw=2.5)`,
          `ax.axhline(W, color="gray", ls="--", alpha=0.7, label="Tension = W (would be if vertical)")`,
          `ax.axhline(W/2, color="orange", ls=":", alpha=0.7, label="T = W/2 (at 90°, vertical)")`,
          `ax.fill_between(angles, T, W, where=(T > W), alpha=0.15, color="red", label="Danger zone (T > W)")`,
          `ax.set_xlim(0, 90); ax.set_ylim(0, min(T.max(), 500))`,
          `ax.set_xlabel("Cable angle θ from horizontal (°)")`,
          `ax.set_ylabel("Tension T (N)")`,
          `ax.set_title(f"T = W/(2 sinθ): tension explodes as cable flattens  (W={W} N)")`,
          `ax.legend()`,
          `ax.grid(True, alpha=0.3)`,
          `plt.tight_layout()`,
          `plt.savefig("cable_tension.png", dpi=120)`,
          `plt.show()`,
          ``,
          `for angle in [5, 10, 30, 45, 60, 90]:`,
          `    t = W / (2 * np.sin(np.radians(angle)))`,
          `    print(f"  theta={angle:2d}°: T = {t:.1f} N")`,
        ].join('\n'),
        output: '',
        status: 'idle',
        figureJson: null,
      },
      {
        id: 'p4-004-py4',
        type: 'code',
        cellTitle: 'Challenge: wall-push block FBD',
        prose: `A block is pressed against a vertical wall by a horizontal force F. The wall provides a normal force (horizontal), and friction (vertical) resists gravity. Complete the solver that determines whether the block slides and what force is needed to keep it in place.`,
        challengeType: 'write',
        challengeNumber: 1,
        challengeTitle: 'Wall-push FBD solver',
        difficulty: 'medium',
        prompt: `Complete wall_block_solver(m, F_push, mu_s, g=10). Return (stays_up, friction_needed, N). The block stays up if the required friction ≤ mu_s × N.`,
        starterBlock: [
          `def wall_block_solver(m, F_push, mu_s, g=10):`,
          `    # Normal force from wall = horizontal push`,
          `    N = ___`,
          `    # Weight must be balanced by friction`,
          `    W = m * g`,
          `    # Maximum static friction available`,
          `    f_max = mu_s * N`,
          `    # Does friction keep it up?`,
          `    stays_up = ___ <= ___`,
          `    return stays_up, W, N`,
          ``,
          `# Test: m=4 kg, F_push=80 N, mu_s=0.4, g=10`,
          `stays, f_needed, N = wall_block_solver(4, 80, 0.4)`,
          `print(f"Stays up: {stays}")`,
          `print(f"Weight (friction needed): {f_needed:.1f} N")`,
          `print(f"Normal force from wall: {N:.1f} N")`,
          `print(f"Max static friction: {0.4*N:.1f} N")`,
        ].join('\n'),
        testCode: [
          `stays, f, N = wall_block_solver(4, 80, 0.4)`,
          `assert not stays, "Block should slide (weight 40 N > f_max 32 N)"`,
          `assert N == 80`,
          `stays2, f2, N2 = wall_block_solver(4, 150, 0.4)`,
          `assert stays2, "Block should stay (weight 40 N < f_max 60 N)"`,
          `print("All tests passed!")`,
        ].join('\n'),
        hint: `N equals F_push (the wall pushes back with the same force you push it). The block stays up if $mg \\le \\mu_s N = \\mu_s F_{push}$.`,
        code: '',
        output: '',
        status: 'idle',
        figureJson: null,
      },
    ],
  },

  quiz: [
    {
      id: 'p1-ch4-004-q1',
      question: `What does a free body diagram show?`,
      options: [
        `All internal forces and external forces on every object in a system`,
        `One isolated object with all external forces drawn as labeled vector arrows`,
        `The trajectory path of the object`,
        `Only the net force on the object`,
      ],
      answer: 1,
      explanation: `A free body diagram isolates a single object and shows every external force acting on it as a vector arrow. Internal forces are omitted. The FBD is the foundation for writing Newton's Second Law equations.`,
    },
    {
      id: 'p1-ch4-004-q2',
      question: `A 10 kg block sits on a horizontal surface. What is the normal force? ($g = 10\\,\\text{m/s}^2$)`,
      options: [
        `$100\\,\\text{N}$ upward`,
        `$10\\,\\text{N}$ upward`,
        `$0\\,\\text{N}$`,
        `Depends on applied force`,
      ],
      answer: 0,
      explanation: `On a horizontal surface with no vertical applied forces: $N = mg = 10 \\times 10 = 100\\,\\text{N}$ upward. This follows from $\\sum F_y = N - mg = 0$.`,
    },
    {
      id: 'p1-ch4-004-q3',
      question: `A rope is attached to a block and pulls it to the right at angle 30° above horizontal. Which direction does the tension vector point on the FBD?`,
      options: [
        `Straight right (horizontal)`,
        `Upward and to the right at 30° above horizontal`,
        `Straight up`,
        `Downward and to the right`,
      ],
      answer: 1,
      explanation: `Tension always acts along the rope, pulling the object toward the attachment point. If the rope makes 30° above horizontal, the tension vector points 30° above horizontal (toward the rope, away from the block).`,
    },
    {
      id: 'p1-ch4-004-q4',
      question: `A 5 kg block is pressed against a vertical wall by a 100 N horizontal force. The normal force from the wall is:`,
      options: [
        `$mg = 50\\,\\text{N}$ (weight)`,
        `$100\\,\\text{N}$ (the horizontal push)`,
        `$110\\,\\text{N}$ (combined)`,
        `0 N (wall doesn't push)`,
      ],
      answer: 1,
      explanation: `The wall's normal force is perpendicular to the wall surface (horizontal, pointing away from wall). It balances the horizontal push: $N = 100\\,\\text{N}$. Here $N \\neq mg$ — the lesson that normal force is NOT always equal to weight.`,
    },
    {
      id: 'p1-ch4-004-q5',
      question: `A 6 kg traffic light hangs from two cables making 53° and 37° with the horizontal. What type of equations do you write to solve for the tensions?`,
      options: [
        `$F = ma$ with non-zero acceleration`,
        `$\\sum F_x = 0$ and $\\sum F_y = 0$ (static equilibrium)`,
        `Only $\\sum F_y = 0$ (tensions are horizontal)`,
        `$F = ma$ for each cable separately`,
      ],
      answer: 1,
      explanation: `The light is in static equilibrium ($a = 0$). Applying $\\sum F_x = 0$ and $\\sum F_y = 0$ gives two equations for two unknown tensions $T_1$ and $T_2$.`,
    },
    {
      id: 'p1-ch4-004-q6',
      question: `Why is the choice of coordinate axes important in an FBD problem?`,
      options: [
        `Wrong axes give wrong physical answers`,
        `Axes aligned with acceleration decouple the equations and minimize algebra`,
        `You must always use horizontal x and vertical y`,
        `The axes change the direction of the forces`,
      ],
      answer: 1,
      explanation: `The physics (and the answer) is the same in any coordinate system. But choosing axes aligned with the acceleration direction makes one component equation trivial (zero acceleration in the perpendicular direction), reducing the algebra significantly.`,
    },
    {
      id: 'p1-ch4-004-q7',
      question: `A block on a frictionless surface is pushed by a 30 N force at 37° above horizontal ($m = 5\\,\\text{kg}$, $\\sin 37° = 0.6$, $\\cos 37° = 0.8$, $g = 10$). What is the normal force?`,
      options: [
        `$50\\,\\text{N}$`,
        `$32\\,\\text{N}$`,
        `$68\\,\\text{N}$`,
        `$18\\,\\text{N}$`,
      ],
      answer: 1,
      explanation: `$F_y = 30\\sin 37° = 18\\,\\text{N}$ (upward). $\\sum F_y = N + 18 - mg = 0 \\Rightarrow N = 50 - 18 = 32\\,\\text{N}$. The upward component of the push reduces the normal force.`,
    },
    {
      id: 'p1-ch4-004-q8',
      question: `A weight hangs from a single vertical cable attached symmetrically at two points. Each side makes 70° with the horizontal. Which formula gives the tension in each side?`,
      options: [
        `$T = W / 2$`,
        `$T = W / (2\\sin 70°)$`,
        `$T = W \\sin 70°$`,
        `$T = W \\cos 70°$`,
      ],
      answer: 1,
      explanation: `By symmetry, $\\sum F_y = 2T\\sin 70° - W = 0 \\Rightarrow T = W/(2\\sin 70°)$. The vertical components of both tensions must together support the weight.`,
    },
    {
      id: 'p1-ch4-004-q9',
      question: `A rope pulls a block at angle $\\theta$ above horizontal. As $\\theta$ increases from 0° to 90°, the normal force:`,
      options: [
        `Increases (rope lifts the block harder)`,
        `Stays constant at $mg$`,
        `Decreases (upward component reduces contact force)`,
        `Depends on friction`,
      ],
      answer: 2,
      explanation: `As the angle increases, the upward component $T\\sin\\theta$ increases, reducing the normal force via $N = mg - T\\sin\\theta$. At $\\theta = 90°$ (vertical pull), $N$ could reach zero if the tension equals the weight.`,
    },
    {
      id: 'p1-ch4-004-q10',
      question: `In a FBD for a block sliding on a rough horizontal surface, how many force vectors are drawn?`,
      options: [
        `One (the applied force)`,
        `Two (applied and friction)`,
        `Three (applied, friction, weight)`,
        `Four (applied, friction, weight, normal)`,
      ],
      answer: 3,
      explanation: `Four forces act: applied force (horizontal), kinetic friction (horizontal, opposing motion), weight (vertical down), and normal force (vertical up). All four must be on the FBD to write correct equations.`,
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'free-body-diagram' }, title: 'Free body diagram method' },
  ],

  misconceptions: [
    {
      id: 'p4-004-m1',
      misconception: 'The acceleration arrow should appear on the free-body diagram as one of the forces.',
      correction: 'Acceleration is NOT a force and does NOT belong on an FBD. An FBD shows only forces — things that act ON the object. Acceleration is the RESULT of all the forces, computed after the FBD is complete using ΣF = ma. Drawing acceleration on the FBD treats a result as a cause.',
      correctionExample: 'A block accelerating right: FBD shows applied force (right), friction (left), gravity (down), normal (up). After drawing these four forces: ΣFx = F_applied − F_friction = ma. The acceleration arrow is computed separately, after the FBD.',
    },
    {
      id: 'p4-004-m2',
      misconception: 'For a block on an incline, the weight arrow should be drawn along the slope.',
      correction: 'Gravity always points straight DOWN toward the Earth, regardless of the surface orientation. On an incline, weight W = mg points vertically downward. You then DECOMPOSE it into components parallel and perpendicular to the slope: W‖ = mg sinθ (down the slope) and W⊥ = mg cosθ (into the slope). But the original force arrow is always vertical.',
      correctionExample: 'Block on 30° incline: weight arrow points straight down. Components: W‖ = mg sin30° = 0.5mg (parallel, down the slope); W⊥ = mg cos30° = 0.87mg (perpendicular, into slope). The component arrows are for calculation, not the force itself.',
    },
  ],

  transferPrompts: [
    {
      id: 'p4-004-t1',
      prompt: `A structural engineer analyzes a beam supported at both ends and carrying a heavy load at the center. To find the support reactions (upward forces at each end), they draw a free-body diagram of the entire beam. What forces go on this FBD? How is the FBD method here the same as the one used in physics — even though engineering uses "equilibrium analysis" language?`,
      connection: 'FBD + ΣF = 0 (statics) is the same as FBD + ΣF = ma (dynamics). When the beam doesn\'t accelerate, you recover the static case. The FBD method is universal.',
    },
    {
      id: 'p4-004-t2',
      prompt: `A skydiver reaches terminal velocity — they stop accelerating and fall at constant speed. Draw the FBD and write the equation ΣF = 0 that describes this state. If the skydiver weighs 800 N, what is the drag force at terminal velocity? What happens to the FBD if they tuck into a ball (increasing speed)?`,
      connection: 'Terminal velocity = equilibrium (ΣF = 0 → a = 0). FBD: gravity (down) = drag (up). When they tuck, drag decreases momentarily → ΣF ≠ 0 → they accelerate until new terminal velocity.',
    },
  ],

  debugging: [
    {
      id: 'p4-004-d1',
      error: `A student draws an FBD for a block being pushed across a rough floor. They include: (1) applied force F (right), (2) friction (left), (3) gravity (down), (4) normal force (up), and (5) "motion" arrow (right). They then write ΣFx = F − friction + motion = ma.`,
      fix: `"Motion" is not a force. Only real forces that act ON the block belong on the FBD. The motion arrow represents velocity, not a force — it cannot be included in ΣF = ma. Remove it.
Correct FBD forces: F (right), f_k (left), W = mg (down), N (up).
Correct equations: ΣFx = F − f_k = ma_x; ΣFy = N − mg = 0.`,
    },
    {
      id: 'p4-004-d2',
      error: `A student drawing an FBD for a ball suspended by two strings (strings at angles) draws three forces: T₁ (along left string), T₂ (along right string), W (down). But they label the angle of T₁ as 40° from horizontal, then write: ΣFy = T₁ sin40° + T₂ sin50° − W = 0. When they solve, the answer is wrong.`,
      fix: `The issue is not the force identification — those three forces are correct. The issue is defining the angles. If T₁ is 40° from horizontal, its y-component is T₁ sin40°. But if the problem stated the angle from VERTICAL, it would be T₁ cos40°. Always draw the angle clearly on the FBD, state whether it's from horizontal or vertical, and verify: for a force near-horizontal, the y-component should be small (sin gives small values for small angles).`,
    },
  ],

  mastery: {
    targetLevel: 'Draw correct free-body diagrams identifying all and only forces acting ON the object; resolve forces into components; set up ΣFx = max and ΣFy = may correctly.',
    checklistItems: [
      'Can draw an FBD with only forces acting ON the chosen object (no velocities, accelerations, or forces on other objects)',
      'Can identify common forces: gravity (mg down), normal (⊥ to surface), tension (along string, away from object), friction (opposing relative motion), applied force',
      'Can decompose tilted forces into x and y components using trigonometry',
      'Can set up two independent equations ΣFx = max and ΣFy = may from an FBD',
    ],
    commonStruggles: [
      'Including acceleration or velocity as a force on the FBD',
      'Drawing weight along the slope (it always points straight down)',
      'Mixing up which angle is θ when decomposing forces on inclined surfaces',
    ],
    nextSteps: 'Lesson p4-005 (Friction) adds the friction force model f = μN to complete the FBD toolkit.',
  },

  semantics: {
    core: [
      { symbol: 'N', meaning: 'Normal force (N): contact force perpendicular to surface, pointing away from surface' },
      { symbol: 'T', meaning: 'Tension (N): force along a string or rope, pulling the object toward the string attachment' },
      { symbol: 'W = mg', meaning: 'Weight (N): gravitational force, always directed straight downward toward Earth' },
      { symbol: '\\sum F_x = ma_x', meaning: 'x-direction Newton\'s 2nd Law: sum all force x-components, set equal to mass × x-acceleration' },
      { symbol: '\\sum F_y = ma_y', meaning: 'y-direction Newton\'s 2nd Law: same for y-components; if no vertical acceleration, ΣFy = 0' },
    ],
    rulesOfThumb: [
      'FBD rule: only forces that ACT on the object. No velocity, acceleration, or forces on other objects.',
      'Weight always points straight DOWN, regardless of surface orientation. Decompose it into components for calculation.',
      'Normal force is always perpendicular to the contact surface, pointing AWAY from the surface (it pushes, not pulls).',
      'Free-body → two equations → solve. Never skip the FBD step for multi-force problems.',
      'Check: number of unknowns ≤ number of equations (usually 2 for 2D). More unknowns → need another constraint.',
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Free Body Diagrams in Python',
      cells: [
        {
          cellTitle: 'Draw an FBD using matplotlib arrows',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

def draw_fbd(forces, title="Free Body Diagram"):
    """Draw an FBD. forces = list of (Fx, Fy, label) tuples."""
    fig, ax = plt.subplots(1, 1, figsize=(6, 6))

    # Draw the object (block)
    block = plt.Rectangle((-0.3, -0.3), 0.6, 0.6, linewidth=2,
                           edgecolor='black', facecolor='lightblue', zorder=5)
    ax.add_patch(block)

    # Draw each force as an arrow
    colors = ['blue', 'red', 'green', 'orange', 'purple']
    for i, (Fx, Fy, label) in enumerate(forces):
        magnitude = np.sqrt(Fx**2 + Fy**2)
        scale = 0.4 / max(magnitude, 0.01)  # normalize to visible length
        ax.annotate('', xy=(Fx*scale, Fy*scale), xytext=(0, 0),
                    arrowprops=dict(arrowstyle='->', color=colors[i % len(colors)],
                                   lw=2.5, mutation_scale=20))
        ax.text(Fx*scale*1.15, Fy*scale*1.15, f'{label}\n({Fx:.0f}N, {Fy:.0f}N)',
                color=colors[i % len(colors)], fontsize=9, ha='center')

    ax.set_xlim(-1.2, 1.2); ax.set_ylim(-1.2, 1.2)
    ax.axhline(0, color='gray', linewidth=0.5); ax.axvline(0, color='gray', linewidth=0.5)
    ax.set_xlabel('x'); ax.set_ylabel('y')
    ax.set_title(title); ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    plt.tight_layout(); plt.show()

# Example: block being pushed on rough surface
# Applied: 30 N right; Friction: 8 N left; Weight: 25 N down; Normal: 25 N up
forces = [(30, 0, 'Applied F'), (-8, 0, 'Friction'), (0, -25, 'Weight'), (0, 25, 'Normal')]
draw_fbd(forces, "Block on rough floor (m=2.5 kg)")

# Check equilibrium
Fx_net = sum(f[0] for f in forces)
Fy_net = sum(f[1] for f in forces)
m = 2.5
print(f"ΣFx = {Fx_net} N  →  ax = {Fx_net/m:.1f} m/s²")
print(f"ΣFy = {Fy_net} N  →  ay = {Fy_net/m:.1f} m/s² (stays on floor)")`,
          prose: [
            'draw_fbd() plots each force as an arrow from the origin. ax.annotate() draws the arrow from (0,0) to the scaled force vector, with the label positioned at the tip. This is exactly what a hand-drawn FBD shows: forces radiating from the center of the object.',
            'The scale = 0.4/max(magnitude, 0.01) normalizes all arrows to roughly equal visual length. In a real FBD, arrow length is proportional to force magnitude — but for clarity in code, we normalize to see all arrows clearly.',
            'The sum at the bottom verifies Newton\'s Second Law: ΣFx = 30−8 = 22 N gives ax = 22/2.5 = 8.8 m/s². ΣFy = 25−25 = 0 N gives ay = 0 (block doesn\'t fly up or fall through the floor).',
          ],
        },
        {
          cellTitle: 'FBD for inclined surface: decompose weight',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

def incline_fbd(theta_deg, mu_k, m=5.0, g=9.8):
    theta = np.radians(theta_deg)
    W = m * g
    # Weight components along and perpendicular to slope
    W_parallel = W * np.sin(theta)     # down the slope
    W_perp = W * np.cos(theta)         # into the slope
    N = W_perp                          # normal force = perpendicular weight
    f_k = mu_k * N                      # kinetic friction (opposing motion = up slope)
    F_net = W_parallel - f_k            # net force down the slope
    a = F_net / m

    print(f"Incline angle: {theta_deg}°, μ_k = {mu_k}, m = {m} kg")
    print(f"  Weight W = {W:.2f} N (vertical)")
    print(f"  W‖ = mg sinθ = {W_parallel:.2f} N  (down slope)")
    print(f"  W⊥ = mg cosθ = {W_perp:.2f} N  (into slope)")
    print(f"  Normal N = W⊥ = {N:.2f} N")
    print(f"  Friction f_k = μN = {f_k:.2f} N  (up slope, opposing motion)")
    print(f"  Net force = {W_parallel:.2f} - {f_k:.2f} = {F_net:.2f} N  (down slope)")
    print(f"  Acceleration = {a:.3f} m/s²")
    return a

# Compare different angles
print("Acceleration on slope for different angles (μ_k = 0.2):")
for angle in [15, 30, 45, 60]:
    a = incline_fbd(angle, 0.2, m=5.0)
    print()`,
          prose: [
            'W_parallel = W * np.sin(theta) and W_perp = W * np.cos(theta) decompose the vertical weight into components. On a θ = 30° slope: W‖ = 0.5×W (half the weight pulls down the slope); W⊥ = 0.87×W (most of weight presses into slope). This is standard incline decomposition.',
            'N = W_perp because ΣF_perp = 0 (block doesn\'t sink into slope or fly off it). This gives N = mg cosθ, which decreases as the slope steepens. Consequently, friction f = μN also decreases on steeper slopes, even though W‖ increases.',
            'The net force = W‖ − f_k shows the competition: steeper slope increases the driving force but reduces friction. At the critical angle where W‖ = f_k: mg sinθ = μmg cosθ → tanθ = μ. Above this angle, the block slides.',
          ],
        },
        {
          cellTitle: 'Connected objects: solve the system',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# Two blocks: A on table (m_A=3 kg), B hanging (m_B=2 kg)
# Connected by massless rope over frictionless pulley
# Find a and T from combined FBD analysis

m_A = 3.0; m_B = 2.0; g = 9.8; mu_k = 0.2

N_A = m_A * g  # normal force on A
f_A = mu_k * N_A  # friction on A (opposing motion → left)

# System equations from FBDs:
# Block A: T - f_A = m_A * a  (horizontal)
# Block B: m_B*g - T = m_B * a  (vertical)
# Add the two equations to eliminate T:
# m_B*g - f_A = (m_A + m_B) * a

a = (m_B * g - f_A) / (m_A + m_B)
T = m_A * a + f_A  # from block A equation

print("Atwood-like: Block A on table, Block B hanging")
print(f"  m_A = {m_A} kg, m_B = {m_B} kg, μ_k = {mu_k}")
print(f"  f_friction = μN_A = {f_A:.2f} N")
print(f"  Acceleration a = (m_B*g - f) / (m_A + m_B) = {a:.3f} m/s²")
print(f"  Tension T = m_A*a + f = {T:.2f} N")
print()
# Verify with block B:
T_verify = m_B * (g - a)
print(f"  Verify T from block B: m_B*(g-a) = {T_verify:.2f} N  {'✓' if abs(T - T_verify) < 0.001 else '✗'}")`,
          prose: [
            'The key move is setting up SEPARATE FBDs for each block, then adding the equations to eliminate T. Block A: T − f_A = m_A×a. Block B: m_B×g − T = m_B×a. Adding: m_B×g − f_A = (m_A + m_B)×a.',
            'This works because the two blocks share the same acceleration magnitude a (connected by inextensible string). The constraint connects the two separate FBDs into one solvable system.',
            'The verification step computes T from the block B equation independently and checks it matches. In exam problems, always verify using the other equation — if they disagree, there\'s an error in the setup.',
          ],
        },
        {
          cellTitle: 'Challenge: three-force FBD equilibrium',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A traffic light (mass m = 25 kg) hangs from two cables.
# Cable 1 makes 30° with the horizontal (left side).
# Cable 2 makes 45° with the horizontal (right side).
# The light is in equilibrium (a = 0).

m = 25.0; g = 9.8
theta1 = np.radians(30)  # cable 1 angle from horizontal
theta2 = np.radians(45)  # cable 2 angle from horizontal
W = m * g                # weight (down)

# TODO:
# 1. Set up ΣFx = 0: -T1*cos(theta1) + T2*cos(theta2) = 0
# 2. Set up ΣFy = 0: T1*sin(theta1) + T2*sin(theta2) - W = 0
# 3. Solve as 2×2 linear system: np.linalg.solve(A, b) where:
#    A = [[−cos30, cos45], [sin30, sin45]]
#    b = [0, W]
# 4. Print T1 and T2 in Newtons
# 5. Verify: compute ΣFx and ΣFy — should both be ≈ 0
`,
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Free Body Diagrams in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'Force decomposition and net force',
          type: 'code',
          language: 'matlab',
          code: `% FBD: compute net force from all forces acting on an object
% Block on rough floor: F_applied=30N, friction=8N, weight=25N, normal=25N
forces = [30, 0; -8, 0; 0, -25; 0, 25];  % each row: [Fx, Fy]
labels = {'Applied', 'Friction', 'Weight', 'Normal'};

Fx_net = sum(forces(:,1));   % sum all x-components
Fy_net = sum(forces(:,2));   % sum all y-components
m = 2.5;  % kg

fprintf('Force analysis:\\n');
for i = 1:size(forces,1)
    fprintf('  %s: Fx=%.0f N, Fy=%.0f N\\n', labels{i}, forces(i,1), forces(i,2));
end
fprintf('Net: SigFx=%.0f N, SigFy=%.0f N\\n', Fx_net, Fy_net);
fprintf('Acceleration: ax=%.2f m/s^2, ay=%.2f m/s^2\\n', Fx_net/m, Fy_net/m);

% Plot force vectors
figure; hold on;
colors = {'b','r','g','m'};
for i = 1:size(forces,1)
    quiver(0, 0, forces(i,1)/30, forces(i,2)/30, 0, 'Color', colors{i}, 'LineWidth', 2, 'MaxHeadSize', 0.5);
    text(forces(i,1)/30*1.2, forces(i,2)/30*1.2, labels{i}, 'Color', colors{i}, 'FontSize', 9);
end
rectangle('Position', [-0.3 -0.3 0.6 0.6], 'FaceColor', [0.7 0.9 1], 'LineWidth', 2);
xlim([-1.5 1.5]); ylim([-1.5 1.5]); grid on; axis equal;
title('FBD: block on rough floor'); xlabel('x'); ylabel('y');`,
          prose: [
            'forces = [30, 0; -8, 0; 0, -25; 0, 25] is a 4×2 matrix where each row is one force [Fx, Fy]. MATLAB\'s sum(forces(:,1)) sums the first column (all x-components); sum(forces(:,2)) sums the second column (all y-components).',
            'The loop prints each force component using forces(i,1) and forces(i,2) — MATLAB uses 1-based indexing. The net force is then used to compute acceleration.',
            'quiver(0, 0, dx, dy, 0) draws an arrow from the origin with the given displacement. The scale factor /30 normalizes all forces to similar arrow lengths for visual clarity.',
          ],
        },
        {
          cellTitle: 'Inclined plane decomposition',
          type: 'code',
          language: 'matlab',
          code: `% Decompose weight on inclined surface
theta_deg = 30; m = 5.0; g = 9.8; mu_k = 0.2;
theta = deg2rad(theta_deg);
W = m * g;

W_par  = W * sin(theta);   % component down the slope
W_perp = W * cos(theta);   % component into slope
N = W_perp;                % normal force
f_k = mu_k * N;            % kinetic friction (up slope)
F_net = W_par - f_k;       % net force down slope
a = F_net / m;

fprintf('Incline: theta=%d deg, mu_k=%.1f, m=%.1f kg\\n', theta_deg, mu_k, m);
fprintf('  W = %.2f N (vertical)\\n', W);
fprintf('  W_par = mg*sin(theta) = %.2f N (down slope)\\n', W_par);
fprintf('  W_perp = mg*cos(theta) = %.2f N (into slope)\\n', W_perp);
fprintf('  N = %.2f N, f_k = %.2f N\\n', N, f_k);
fprintf('  a = (W_par - f_k)/m = %.3f m/s^2\\n', a);

% Plot acceleration vs angle
angles = 0:1:80;
a_vals = (m*g*sin(deg2rad(angles)) - mu_k*m*g*cos(deg2rad(angles))) / m;
figure;
plot(angles, a_vals, 'b-', 'LineWidth', 2);
hold on; yline(0, 'r--', 'a=0 (critical angle)', 'LineWidth', 1.5);
xlabel('Angle (degrees)'); ylabel('Acceleration (m/s^2)');
title(sprintf('Block on slope: a vs angle (mu_k=%.1f)', mu_k)); grid on;
crit_angle = atan(mu_k)*180/pi;
fprintf('Critical angle (tan(theta)=mu): %.1f deg\\n', crit_angle);`,
          prose: [
            'W_par = W * sin(theta) and W_perp = W * cos(theta) perform the decomposition. deg2rad() converts the input angle from degrees to radians for MATLAB\'s trig functions.',
            'The critical angle computation atan(mu_k) uses the condition W_par = f_k → mg sinθ = μmg cosθ → tanθ = μ. Below this angle: friction holds the block. Above: block slides. The plot crosses zero at exactly this angle.',
            'The acceleration array a_vals is computed element-wise for all angles using sin/cos applied to deg2rad(angles) — MATLAB vectorizes this automatically. The curve shows a starts negative (friction holds), crosses zero at the critical angle, then grows positive (block accelerates faster as angle increases).',
          ],
        },
        {
          cellTitle: 'Solve connected object system',
          type: 'code',
          language: 'matlab',
          code: `% Block A on table, Block B hanging — solve for a and T
m_A = 3.0; m_B = 2.0; g = 9.8; mu_k = 0.2;

N_A = m_A * g;
f_A = mu_k * N_A;

% From FBDs: two equations
% T - f_A = m_A * a  (block A)
% m_B*g - T = m_B * a  (block B)
% Matrix form: [m_A, -1; m_B, 1] * [a; T] = [f_A; m_B*g]
A_mat = [m_A, -1; m_B, 1];   % coefficient matrix
b_vec = [f_A; m_B*g];         % right-hand side

x = A_mat \ b_vec;             % solve: x = [a; T]
a = x(1); T = x(2);

fprintf('Block A (%.1f kg) on table (mu=%.1f), Block B (%.1f kg) hanging\\n', m_A, mu_k, m_B);
fprintf('Friction on A: f = %.2f N\\n', f_A);
fprintf('Acceleration: a = %.3f m/s^2\\n', a);
fprintf('Tension: T = %.2f N\\n', T);

% Verify
fprintf('Verify: m_B*g - T = %.2f N  vs  m_B*a = %.2f N\\n', m_B*g-T, m_B*a);`,
          prose: [
            'A_mat \\ b_vec is MATLAB\'s backslash operator for solving a linear system Ax = b. This is more numerically stable than inverting A explicitly. The system is 2×2 with unknowns [a; T].',
            'The two equations come from separate FBDs: for block A (net horizontal force), and for block B (net vertical force). The acceleration constraint a_A = a_B = a (inextensible rope) links them.',
            'The verification check computes m_B×g − T and m_B×a independently — they should be equal (both equal the net force on block B). The backslash solver is exact for 2×2 systems with non-singular A.',
          ],
        },
        {
          cellTitle: 'Challenge: cable equilibrium',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Traffic light hanging from two cables
m = 25; g = 9.8; W = m*g;
theta1 = deg2rad(30);  % cable 1 from horizontal
theta2 = deg2rad(45);  % cable 2 from horizontal

% ΣFx = 0: -T1*cos(theta1) + T2*cos(theta2) = 0
% ΣFy = 0: T1*sin(theta1) + T2*sin(theta2) = W
% Matrix form: A*[T1;T2] = [0; W]

% TODO:
% 1. Build 2x2 matrix A = [-cos(t1), cos(t2); sin(t1), sin(t2)]
% 2. b = [0; W]
% 3. Solve: tensions = A \ b
% 4. Print T1 and T2
% 5. Verify ΣFy = T1*sin(t1) + T2*sin(t2) ≈ W
`,
        },
      ],
    },
  },
};
