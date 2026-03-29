export default {
  id: 'p1-ch4-006',
  slug: 'static-equilibrium',
  chapter: 'p4',
  order: 5,
  title: 'Static Equilibrium',
  subtitle: 'When all forces balance: ΣFₓ = 0 and ΣFᵧ = 0 — the art of solving for unknown forces from geometry.',
  tags: ['statics', 'equilibrium', 'normal-force', 'tension', 'free-body-diagram', 'dynamics'],

  hook: {
    question: 'How does a bridge cable know exactly how much tension to carry — and why does the tension change depending on the cable angle?',
    realWorldContext: 'Static equilibrium is the physics of things that are NOT moving: buildings, bridges, cranes, hanging signs, ladders against walls. Engineers design structures to be in static equilibrium under all expected loads. Every structural analysis starts with ΣF = 0. Mastering statics means mastering the algebra of force balance — a skill used constantly in mechanical and civil engineering.',
    previewVisualizationId: 'StaticsIntuition',
  },

  intuition: {
    prose: [
      'An object in static equilibrium has zero acceleration (a = 0) and zero velocity (at rest). From Newton\'s Second Law: ΣF = ma = m(0) = 0. So ΣF = 0 — every force is balanced by other forces.',
      'In 2D, this means TWO conditions: ΣFₓ = 0 (horizontal forces balance) AND ΣFᵧ = 0 (vertical forces balance). Each condition gives one equation. Two unknowns (like two tension magnitudes) → two equations → solvable.',
      'The key skill: decompose every angled force into x and y components, then apply the two balance equations. The geometry of the angles determines the component values.',
      'Note: Complete statics also requires Στ = 0 (torques balance). We will only address translational equilibrium (force balance) here. Rotational equilibrium (torque balance) comes in a later chapter.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Conditions for static equilibrium (translational)',
        body: '\\sum F_x = 0 \\qquad \\text{AND} \\qquad \\sum F_y = 0',
      },
      {
        type: 'definition',
        title: 'Strategy for statics problems',
        body: '(1) Draw FBD. (2) Decompose all forces into x and y components. (3) Write ΣFₓ = 0 and ΣFᵧ = 0. (4) Solve the system of equations.',
      },
      {
        type: 'insight',
        title: 'Tension increases as angle flattens',
        body: 'A cable supporting a weight at a shallow angle carries MUCH more tension than a vertical cable supporting the same weight. As the angle approaches horizontal (0°), tension approaches infinity. This is why suspension bridge cables are never horizontal.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Sign hanging from two cables at different angles',
        caption: 'Three forces on the sign: weight W down, T₁ at angle θ₁, T₂ at angle θ₂. Setting ΣFₓ = 0 and ΣFᵧ = 0 gives a 2×2 linear system for T₁ and T₂.',
      },
      {
        id: 'StaticsIntuition',
        title: 'How tension depends on cable angle',
        mathBridge: 'For a weight W supported by a symmetric cable at angle θ above horizontal: T = W/(2 sinθ). As θ → 0°, T → ∞. As θ → 90°, T → W/2 (straight vertical, each cable carries half the weight). Shallow cables are very high-tension.',
        caption: 'Cable angle controls tension. Engineers never allow cables to run near-horizontal under load.',
      },
    ],
  },

  math: {
    prose: [
      'For any statics problem, the result is a system of linear equations. In 2D with two unknown forces, you get exactly two equations (ΣFₓ = 0, ΣFᵧ = 0) and two unknowns — a well-determined system.',
      'If a force F acts at angle θ above the positive x-axis: Fₓ = F cosθ (positive = rightward), Fᵧ = F sinθ (positive = upward). Careful with signs — forces pointing left or down contribute negative components.',
      'The system of equations is a 2×2 linear system: aT₁ + bT₂ = c and dT₁ + eT₂ = f (where a,b,c,d,e,f come from the geometry). Solve by substitution or elimination.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'General equilibrium equations',
        body: '\\sum F_x = T_1 \\cos\\theta_1 - T_2 \\cos\\theta_2 + \\ldots = 0 \\\\ \\sum F_y = T_1 \\sin\\theta_1 + T_2 \\sin\\theta_2 - W + \\ldots = 0',
      },
      {
        type: 'insight',
        title: 'Calculus connection',
        body: 'Static equilibrium means v = 0 = constant, so dv/dt = 0, so d²x/dt² = 0. The position function is x(t) = x₀ (constant). The object does not move — it is a trivial solution to the equation of motion m(d²x/dt²) = ΣF = 0.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "Static equilibrium is a special case of Newton's Second Law: ΣF = ma = 0 because a = 0. The two component equations ΣFₓ = 0 and ΣFᵧ = 0 together constitute the full translational equilibrium condition.",
      'Mathematically, the equilibrium equations form a linear system Ax = b where x is the vector of unknown force magnitudes, A is the matrix of direction cosines (from the geometry), and b is the vector of known forces (usually weight components). If A is invertible, there is a unique equilibrium solution.',
      'When the system is underdetermined (more unknowns than equations), the structure is statically indeterminate — cannot be solved from statics alone. When overdetermined, there is generally no solution (the structure fails). Well-designed structures are statically determinate: exactly as many unknowns as equilibrium equations.',
      'Calculus perspective: equilibrium means the position function x(t) is constant. Its derivative dx/dt = v = 0 and its second derivative d²x/dt² = a = 0. Both kinematic quantities are zero. The calculus of statics is trivial — the richness is entirely in the geometry and algebra of force decomposition.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear system form of static equilibrium',
        body: 'A \\vec{T} = \\vec{W} \\quad \\text{where} \\quad A = \\begin{pmatrix} \\cos\\theta_1 & -\\cos\\theta_2 \\\\ \\sin\\theta_1 & \\sin\\theta_2 \\end{pmatrix}, \\quad \\vec{T} = \\begin{pmatrix} T_1 \\\\ T_2 \\end{pmatrix}, \\quad \\vec{W} = \\begin{pmatrix} 0 \\\\ W \\end{pmatrix}',
      },
    ],
    visualizationId: 'StaticsDerivation',
    proofSteps: [
      {
        title: 'Apply Newton\'s Second Law with a = 0',
        expression: '\\sum \\vec{F} = m\\vec{a} = 0 \\quad\\Rightarrow\\quad \\sum \\vec{F} = 0',
        annotation: 'Static object: acceleration is zero, so net force must be zero.',
      },
      {
        title: 'Split into components',
        expression: '\\sum F_x = 0 \\quad\\text{and}\\quad \\sum F_y = 0',
        annotation: 'Zero vector means each component is zero — two independent equations.',
      },
      {
        title: 'Decompose each force',
        expression: 'T_1 \\rightarrow (T_1\\cos\\theta_1,\\, T_1\\sin\\theta_1), \\quad T_2 \\rightarrow (-T_2\\cos\\theta_2,\\, T_2\\sin\\theta_2), \\quad W \\rightarrow (0,\\, -W)',
        annotation: 'Each force contributes its x and y projections to the sum.',
      },
      {
        title: 'Form and solve the system',
        expression: '\\begin{cases} T_1\\cos\\theta_1 - T_2\\cos\\theta_2 = 0 \\\\ T_1\\sin\\theta_1 + T_2\\sin\\theta_2 = W \\end{cases}',
        annotation: 'Two linear equations in two unknowns. Solve by substitution or elimination.',
      },
    ],
    title: 'Derivation: Static equilibrium as a linear system',
    visualizations: [
      {
        id: 'StaticsDerivation',
        title: 'Force balance as a 2×2 linear system',
        mathBridge: 'The geometry of cables converts to direction-cosine coefficients in a matrix equation. Solving the system gives the tension magnitudes. This is the bridge between physics (force balance) and linear algebra (matrix equations).',
        caption: 'Statics is geometry + Newton\'s Law → linear algebra.',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-006-ex1',
      title: 'Sign hanging from two cables at equal angles',
      problem: 'A 40 N sign hangs from two cables, each making 50° with the horizontal. Find the tension in each cable. (sin 50° ≈ 0.766, cos 50° ≈ 0.643.)',
      steps: [
        {
          expression: '\\text{By symmetry: } T_1 = T_2 = T',
          annotation: 'Equal angles → equal tensions. Symmetry simplifies the problem.',
        },
        {
          expression: '\\sum F_x = T\\cos 50° - T\\cos 50° = 0 \\quad\\checkmark',
          annotation: 'Horizontal: the two x-components cancel automatically by symmetry.',
        },
        {
          expression: '\\sum F_y = 2T\\sin 50° - 40 = 0 \\quad\\Rightarrow\\quad T = \\frac{40}{2 \\times 0.766} = \\frac{40}{1.532} \\approx 26.1\\,\\text{N}',
          annotation: 'Two upward components support the weight.',
        },
      ],
      conclusion: 'Each cable carries 26.1 N — more than half the weight (20 N) because the cables are not vertical.',
    },
    {
      id: 'ch4-006-ex2',
      title: 'Ladder against a frictionless wall',
      problem: 'A 5 m, 20 kg ladder leans against a frictionless vertical wall, making 60° with the floor. The floor has friction. Find the normal force from the wall (N_w) and the normal force from the floor (N_f). (Treat as translational equilibrium only; treat the ladder weight as acting at its midpoint.) Use g = 10 m/s². (sin 60° ≈ 0.866, cos 60° = 0.5.)',
      steps: [
        {
          expression: 'W = 20 \\times 10 = 200\\,\\text{N (down at midpoint)}',
          annotation: 'Weight acts at the center of mass (midpoint of ladder).',
        },
        {
          expression: '\\sum F_y = 0: N_f - W = 0 \\quad\\Rightarrow\\quad N_f = 200\\,\\text{N}',
          annotation: 'Vertical: only the floor normal force and weight are vertical. (Wall is frictionless, so no vertical wall force.)',
        },
        {
          expression: '\\sum F_x = 0: N_w - f_{\\text{floor}} = 0 \\quad\\Rightarrow\\quad N_w = f_{\\text{floor}}',
          annotation: 'Horizontal: wall normal force is balanced by floor friction.',
        },
        {
          expression: '\\text{Full solution requires torque balance: } N_w = \\frac{W \\cdot \\frac{L}{2}\\cos 60°}{L \\sin 60°} = \\frac{200 \\times 0.5}{2 \\times 0.866} \\approx 57.7\\,\\text{N}',
          annotation: 'Torque equation (preview): moment arm geometry gives N_w. Full derivation in rotational statics chapter.',
        },
      ],
      conclusion: 'N_f = 200 N (floor supports all weight vertically); N_w = f_floor ≈ 57.7 N (wall pushes horizontally, balanced by floor friction). Note: torque balance is needed for the full solution.',
    },
  ],

  challenges: [
    {
      id: 'ch4-006-ch1',
      difficulty: 'easy',
      problem: 'A 60 N picture frame hangs from a single vertical wire attached at two equal points. The wire makes a V-shape; each side makes 70° with the horizontal. Find the tension in each segment of wire. (sin 70° ≈ 0.940.)',
      hint: 'Two symmetric tension forces, both angled upward. ΣFᵧ = 0.',
      walkthrough: [
        {
          expression: '2T\\sin 70° = 60 \\quad\\Rightarrow\\quad T = \\frac{60}{2 \\times 0.940} = \\frac{60}{1.88} \\approx 31.9\\,\\text{N}',
          annotation: 'Each wire segment carries equal tension by symmetry.',
        },
      ],
      answer: 'T ≈ 31.9 N in each wire segment.',
    },
    {
      id: 'ch4-006-ch2',
      difficulty: 'medium',
      problem: 'A 50 N weight hangs from two unequal cables: cable A makes 45° with the horizontal, cable B is horizontal. Find T_A and T_B. (sin 45° = cos 45° ≈ 0.707.)',
      hint: 'A horizontal cable (B) provides only a horizontal force. Cable A provides both horizontal and vertical components. Use ΣFᵧ = 0 to find T_A first.',
      walkthrough: [
        {
          expression: '\\sum F_y = T_A \\sin 45° - 50 = 0 \\quad\\Rightarrow\\quad T_A = \\frac{50}{0.707} \\approx 70.7\\,\\text{N}',
          annotation: 'Only cable A has a vertical component to support the weight.',
        },
        {
          expression: '\\sum F_x = T_A \\cos 45° - T_B = 0 \\quad\\Rightarrow\\quad T_B = 70.7 \\times 0.707 \\approx 50\\,\\text{N}',
          annotation: 'Horizontal cable B cancels the horizontal component of T_A.',
        },
      ],
      answer: 'T_A ≈ 70.7 N; T_B ≈ 50 N. The horizontal cable carries as much tension as the weight itself.',
    },
    {
      id: 'ch4-006-ch3',
      difficulty: 'hard',
      problem: 'Three cables support a 120 N chandelier: cable 1 (T₁) makes 30° with horizontal on the left, cable 2 (T₂) makes 60° with horizontal on the right, cable 3 (T₃) hangs vertically downward from the junction to the chandelier. Write the full system of equilibrium equations at the junction and solve for T₁, T₂, and T₃. (sin 30° = 0.5, cos 30° = 0.866, sin 60° = 0.866, cos 60° = 0.5.)',
      hint: 'T₃ = W = 120 N directly from ΣFᵧ on the chandelier alone. Then analyze the junction with T₁, T₂, T₃ as forces.',
      walkthrough: [
        {
          expression: 'T_3 = W = 120\\,\\text{N} \\quad\\text{(vertical cable supports chandelier weight)}',
          annotation: 'Apply equilibrium to the chandelier alone: only T₃ (up) and W (down).',
        },
        {
          expression: '\\text{At junction: } \\sum F_y = T_1 \\sin 30° + T_2 \\sin 60° - T_3 = 0 \\quad\\Rightarrow\\quad 0.5 T_1 + 0.866 T_2 = 120',
          annotation: 'Upward components of T₁ and T₂ must support T₃.',
        },
        {
          expression: '\\sum F_x = T_2 \\cos 60° - T_1 \\cos 30° = 0 \\quad\\Rightarrow\\quad 0.5 T_2 = 0.866 T_1 \\quad\\Rightarrow\\quad T_2 = 1.732 T_1',
          annotation: 'Horizontal components of T₁ (left) and T₂ (right) must cancel.',
        },
        {
          expression: '0.5 T_1 + 0.866(1.732 T_1) = 120 \\quad\\Rightarrow\\quad 0.5 T_1 + 1.5 T_1 = 120 \\quad\\Rightarrow\\quad T_1 = 60\\,\\text{N}',
          annotation: 'Substitute and solve.',
        },
        {
          expression: 'T_2 = 1.732 \\times 60 \\approx 103.9\\,\\text{N}, \\quad T_3 = 120\\,\\text{N}',
          annotation: 'Back-substitute for T₂.',
        },
      ],
      answer: 'T₁ = 60 N, T₂ ≈ 103.9 N, T₃ = 120 N. The steeper cable (T₂ at 60°) carries more tension.',
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'free-body-diagram' }, title: 'Static equilibrium: ΣF = 0' },
  ],
}
