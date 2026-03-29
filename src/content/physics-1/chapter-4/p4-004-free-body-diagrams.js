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
    previewVisualizationId: 'FBDIntuition',
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
        id: 'FBDIntuition',
        title: 'Hanging mass: two tension forces in balance',
        mathBridge: 'A mass hanging from two ropes at different angles has three forces: weight down and two tensions at angles. The FBD shows all three; setting ΣFₓ = 0 and ΣFᵧ = 0 gives two equations for two unknowns (the tension magnitudes).',
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
    visualizationId: 'FBDMethodology',
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
        id: 'FBDMethodology',
        title: 'Step-by-step FBD construction',
        mathBridge: 'Each step in the FBD procedure corresponds to a mathematical operation: enumeration → list of vectors; projection → component decomposition; Newton\'s Law → system of equations; solve → algebra.',
        caption: 'Physics thinking (FBD) converts directly to mathematical equations.',
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

  viz: [
    { id: 'SVGDiagram', props: { type: 'free-body-diagram' }, title: 'Free body diagram method' },
  ],
}
