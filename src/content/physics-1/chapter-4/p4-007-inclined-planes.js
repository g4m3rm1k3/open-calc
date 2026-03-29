export default {
  id: 'p1-ch4-007',
  slug: 'inclined-planes',
  chapter: 'p4',
  order: 6,
  title: 'Inclined Planes',
  subtitle: 'Tilt the coordinate axes, decompose weight, and every ramp problem becomes a clean application of F = ma.',
  tags: ['inclined-plane', 'ramp', 'force-decomposition', 'friction', 'normal-force', 'dynamics'],

  hook: {
    question: 'Why does a steeper ramp accelerate a sliding box more — and at exactly what angle does the box start sliding on its own?',
    realWorldContext: 'Inclined planes are the master example of force decomposition in physics. Every ramp, ski slope, conveyor belt, and hillside road is an inclined plane problem. The key technique — tilting your coordinate axes to align with the acceleration — reduces a 2D problem to two independent 1D problems. Master this and you can solve any ramp problem in three steps.',
    previewVisualizationId: 'InclinedPlaneSim',
  },

  intuition: {
    prose: [
      "The standard (horizontal/vertical) coordinate system is not the most efficient for ramp problems. Instead, tilt your axes so that x points along the slope (in the direction of motion) and y points perpendicular to the slope. Now the normal force is purely in the y-direction and the acceleration is purely in the x-direction.",
      "In the tilted system, the weight W = mg (straight down) has two components: W_∥ = mg sinθ (along the slope, pointing down the ramp — the component that causes sliding) and W_⊥ = mg cosθ (perpendicular to slope, into the surface — the component that determines normal force).",
      "The normal force N balances W_⊥: N = mg cosθ. Note this is LESS than mg on a ramp — the normal force decreases as the angle increases. At θ = 90° (vertical wall), N = 0 (no contact force).",
      "Friction on the ramp: f = μN = μmg cosθ (if the object slides). Net force along the slope: F_net = mg sinθ − μmg cosθ = mg(sinθ − μcosθ). Divide by m: a = g(sinθ − μcosθ). This elegant formula contains all the physics.",
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Weight components in tilted coordinates',
        body: 'W_{\\parallel} = mg\\sin\\theta \\;(\\text{down slope}), \\qquad W_{\\perp} = mg\\cos\\theta \\;(\\text{into surface})',
      },
      {
        type: 'definition',
        title: 'Normal force on ramp',
        body: 'N = mg\\cos\\theta \\qquad (\\text{perpendicular to slope; less than mg for any } \\theta > 0)',
      },
      {
        type: 'theorem',
        title: 'Acceleration on ramp with friction',
        body: 'a = g(\\sin\\theta - \\mu_k \\cos\\theta) \\qquad (\\text{if } \\sin\\theta > \\mu_s\\cos\\theta)',
      },
      {
        type: 'theorem',
        title: 'Critical angle for sliding',
        body: '\\theta_c = \\arctan(\\mu_s) \\qquad \\text{(block slides if } \\theta > \\theta_c\\text{)}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'inclined-plane' },
        title: 'Tilted coordinate system on an inclined plane',
        caption: 'Weight W (straight down) decomposes into W_∥ = mg sinθ (along slope) and W_⊥ = mg cosθ (perpendicular to slope). Normal N = W_⊥. Net force along slope = W_∥ − friction.',
      },
      {
        id: 'InclinedPlaneSim',
        title: 'Interactive: vary angle and friction coefficient',
        props: {},
        caption: 'a = g(sinθ − μ cosθ): adjust θ and μ, find the critical angle where a = 0.',
      },
    ],
  },

  math: {
    prose: [
      'Setup for any inclined plane problem: (1) Define x-axis along the slope (positive = up the slope or down, choose consistently), y-axis perpendicular to slope. (2) Decompose weight: W_x = −mg sinθ (down slope), W_y = −mg cosθ (into slope). (3) Normal: N_y = +mg cosθ. (4) Friction: ±μN along slope (opposes motion). (5) Write ΣFₓ = ma and ΣFᵧ = 0.',
      'The perpendicular equation ΣFᵧ = 0 always gives N = mg cosθ immediately. Substitute into the parallel equation ΣFₓ = ma to find a.',
      'For a block sliding DOWN: a = g sinθ − μ_k g cosθ = g(sinθ − μ_k cosθ). For a block pushed UP the ramp, friction now acts downward along the slope: a = −g sinθ − μ_k g cosθ (decelerating).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Full equation of motion along slope',
        body: 'ma = mg\\sin\\theta - \\mu_k mg\\cos\\theta \\quad\\Rightarrow\\quad a = g(\\sin\\theta - \\mu_k \\cos\\theta)',
      },
      {
        type: 'insight',
        title: 'Derivation of critical angle',
        body: 'Set a = 0: \\; 0 = g(\\sin\\theta_c - \\mu_s \\cos\\theta_c) \\quad\\Rightarrow\\quad \\sin\\theta_c = \\mu_s \\cos\\theta_c \\quad\\Rightarrow\\quad \\tan\\theta_c = \\mu_s \\quad\\Rightarrow\\quad \\theta_c = \\arctan(\\mu_s)',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "The inclined plane is a perfect demonstration that the choice of coordinate system is a mathematical tool, not a physical law. Physics doesn't care which axes you choose — Newton's Second Law holds in any inertial frame and any orientation.",
      "In standard axes (x horizontal, y vertical): weight = (0, −mg), Normal = (N sinθ, N cosθ), friction = (−f cosθ, f sinθ) for a block sliding down. Setting ΣF = ma gives two coupled equations. Solving them is more work but gives the same answer.",
      "In tilted axes (x along slope, y perpendicular): weight = (−mg sinθ, −mg cosθ), Normal = (0, N), friction = (f, 0). The two equations decouple completely: N = mg cosθ from the y-equation, and ma = mg sinθ − f from the x-equation. This is why tilted axes are preferred.",
      "Calculus connection: the equation a = g(sinθ − μcosθ) is a constant (for given θ and μ). This means d²x/dt² = a = constant, giving the standard kinematic equations: v(t) = v₀ + at and x(t) = x₀ + v₀t + ½at². Ramp problems with constant slope are constant-acceleration problems.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Tilted axis decoupling',
        body: '\\text{y-axis (⊥ slope): } N - mg\\cos\\theta = 0 \\quad\\Rightarrow\\quad N = mg\\cos\\theta \\\\ \\text{x-axis (∥ slope): } mg\\sin\\theta - \\mu_k N = ma \\quad\\Rightarrow\\quad a = g(\\sin\\theta - \\mu_k\\cos\\theta)',
      },
    ],
    visualizationId: 'InclinedPlaneDerivation',
    proofSteps: [
      {
        title: 'Define tilted coordinate axes',
        expression: 'x: \\text{ along slope (positive down slope)}, \\quad y: \\text{ perpendicular to slope (positive away from surface)}',
        annotation: 'Choose axes to align with the direction of acceleration.',
      },
      {
        title: 'Decompose weight into tilted components',
        expression: 'W_x = mg\\sin\\theta\\;(\\text{down slope}), \\quad W_y = -mg\\cos\\theta\\;(\\text{into surface})',
        annotation: 'Trigonometry: angle between weight and slope-normal is θ.',
      },
      {
        title: 'Write y-equation (no acceleration perpendicular to slope)',
        expression: 'N - mg\\cos\\theta = 0 \\quad\\Rightarrow\\quad N = mg\\cos\\theta',
        annotation: 'Block stays on surface → no acceleration in y-direction.',
      },
      {
        title: 'Write x-equation (acceleration along slope)',
        expression: 'mg\\sin\\theta - f_k = ma, \\quad f_k = \\mu_k N = \\mu_k mg\\cos\\theta',
        annotation: 'Net force along slope equals mass times acceleration along slope.',
      },
      {
        title: 'Solve for acceleration',
        expression: 'a = g\\sin\\theta - \\mu_k g\\cos\\theta = g(\\sin\\theta - \\mu_k\\cos\\theta)',
        annotation: 'Cancel m from both sides. Result depends only on g, θ, and μ — NOT on mass.',
      },
      {
        title: 'Derive critical angle',
        expression: 'a = 0 \\Rightarrow \\sin\\theta_c = \\mu_s\\cos\\theta_c \\Rightarrow \\tan\\theta_c = \\mu_s \\Rightarrow \\theta_c = \\arctan(\\mu_s)',
        annotation: 'Set acceleration to zero; use static friction at its maximum value.',
      },
    ],
    title: 'Derivation: Acceleration and critical angle on an inclined plane',
    visualizations: [
      {
        id: 'InclinedPlaneDerivation',
        title: 'Weight decomposition and axis tilting',
        mathBridge: 'The key trigonometric identity: the angle between the vertical (weight direction) and the surface normal equals the slope angle θ. Therefore W_∥ = mg sinθ and W_⊥ = mg cosθ. This is the geometric heart of all inclined plane problems.',
        caption: 'Tilted axes → decoupled equations → a = g(sinθ − μ cosθ).',
      },
    ],
  },

  examples: [
    {
      id: 'ch4-007-ex1',
      title: 'Block sliding down a ramp with friction',
      problem: 'A 8 kg block slides down a 30° ramp with μ_k = 0.20. Find: (a) the normal force, (b) the friction force, (c) the acceleration, (d) the speed after sliding 5 m from rest. Use g = 10 m/s². (sin 30° = 0.5, cos 30° = 0.866.)',
      steps: [
        {
          expression: 'N = mg\\cos 30° = 8 \\times 10 \\times 0.866 = 69.3\\,\\text{N}',
          annotation: 'Normal force is perpendicular to slope — not equal to mg.',
        },
        {
          expression: 'f_k = \\mu_k N = 0.20 \\times 69.3 = 13.9\\,\\text{N}',
          annotation: 'Kinetic friction opposes sliding (acts up the slope).',
        },
        {
          expression: 'a = g(\\sin 30° - \\mu_k \\cos 30°) = 10(0.5 - 0.20 \\times 0.866) = 10(0.5 - 0.173) = 3.27\\,\\text{m/s}^2',
          annotation: 'Acceleration along the slope (downward).',
        },
        {
          expression: 'v^2 = v_0^2 + 2a\\Delta x = 0 + 2(3.27)(5) = 32.7 \\quad\\Rightarrow\\quad v = \\sqrt{32.7} \\approx 5.72\\,\\text{m/s}',
          annotation: 'Kinematic equation for constant acceleration over displacement 5 m.',
        },
      ],
      conclusion: 'N = 69.3 N, f_k = 13.9 N, a = 3.27 m/s² down the slope, speed after 5 m = 5.72 m/s.',
    },
    {
      id: 'ch4-007-ex2',
      title: 'Finding the critical angle',
      problem: 'A rubber block is placed on a wooden ramp. μ_s = 0.70. At what angle will the block begin to slide? What is the acceleration just after it begins sliding if μ_k = 0.50? Use g = 10 m/s².',
      steps: [
        {
          expression: '\\theta_c = \\arctan(\\mu_s) = \\arctan(0.70) \\approx 35°',
          annotation: 'Critical angle: tan θ_c = μ_s. Rubber on wood is quite rough — steeper threshold.',
        },
        {
          expression: 'a = g(\\sin 35° - \\mu_k \\cos 35°) = 10(0.574 - 0.50 \\times 0.819) = 10(0.574 - 0.410) = 1.64\\,\\text{m/s}^2',
          annotation: 'At θ = 35°, using kinetic friction after sliding begins.',
        },
      ],
      conclusion: 'The block starts sliding at θ_c ≈ 35°. Just after sliding, it accelerates at 1.64 m/s² down the slope.',
    },
  ],

  challenges: [
    {
      id: 'ch4-007-ch1',
      difficulty: 'easy',
      problem: 'A frictionless ramp makes 25° with the horizontal. A 4 kg block starts from rest at the top. Find: (a) the normal force, (b) the acceleration, (c) speed after traveling 3 m. Use g = 10 m/s². (sin 25° ≈ 0.423, cos 25° ≈ 0.906.)',
      hint: 'No friction → friction force = 0. Use a = g sinθ.',
      walkthrough: [
        {
          expression: 'N = mg\\cos 25° = 4 \\times 10 \\times 0.906 = 36.2\\,\\text{N}',
          annotation: 'Normal force on frictionless ramp.',
        },
        {
          expression: 'a = g\\sin 25° = 10 \\times 0.423 = 4.23\\,\\text{m/s}^2',
          annotation: 'No friction term — full weight component along slope drives acceleration.',
        },
        {
          expression: 'v^2 = 2a\\Delta x = 2(4.23)(3) = 25.4 \\quad\\Rightarrow\\quad v \\approx 5.04\\,\\text{m/s}',
          annotation: 'v² = v₀² + 2aΔx with v₀ = 0.',
        },
      ],
      answer: 'N = 36.2 N, a = 4.23 m/s², v ≈ 5.04 m/s after 3 m.',
    },
    {
      id: 'ch4-007-ch2',
      difficulty: 'medium',
      problem: 'A block on a 40° ramp with μ_s = 0.55 and μ_k = 0.40 is given an initial push up the ramp at 6 m/s. (a) Does the block slide down on its own after stopping? (b) Find the acceleration while moving up and the deceleration distance. Use g = 10 m/s². (sin 40° ≈ 0.643, cos 40° ≈ 0.766.)',
      hint: 'While moving UP, friction acts DOWN the slope (opposing upward motion). Check if θ > arctan(μ_s) to determine if it slides back.',
      walkthrough: [
        {
          expression: '\\theta_c = \\arctan(0.55) \\approx 28.8° < 40° \\quad\\Rightarrow\\quad \\text{Block slides back after stopping}',
          annotation: 'The ramp is steeper than the critical angle, so gravity overcomes static friction.',
        },
        {
          expression: 'a_{\\text{up}} = -(g\\sin 40° + \\mu_k g\\cos 40°) = -10(0.643 + 0.40 \\times 0.766) = -10(0.643 + 0.306) = -9.49\\,\\text{m/s}^2',
          annotation: 'Going up: both gravity component and friction act DOWN (deceleration).',
        },
        {
          expression: 'v^2 = v_0^2 + 2a\\Delta x \\Rightarrow 0 = 36 + 2(-9.49)d \\Rightarrow d = \\frac{36}{18.98} \\approx 1.90\\,\\text{m}',
          annotation: 'Distance traveled up the ramp before stopping.',
        },
      ],
      answer: 'Yes, it slides back (θ = 40° > θ_c ≈ 28.8°). Deceleration while going up = 9.49 m/s². Stops after 1.90 m.',
    },
    {
      id: 'ch4-007-ch3',
      difficulty: 'hard',
      problem: 'A 6 kg block on a 35° ramp is connected by a rope over a frictionless pulley at the top to a hanging 4 kg mass. μ_k = 0.20 for the ramp. Does the ramp block slide up or down? Find its acceleration and the rope tension. Use g = 10 m/s². (sin 35° ≈ 0.574, cos 35° ≈ 0.819.)',
      hint: 'First determine which direction the system moves (compare driving forces). Then write F=ma for each mass separately and solve simultaneously.',
      walkthrough: [
        {
          expression: 'N = m_1 g\\cos 35° = 6 \\times 10 \\times 0.819 = 49.1\\,\\text{N}; \\quad f_k = 0.20 \\times 49.1 = 9.82\\,\\text{N}',
          annotation: 'Normal force and kinetic friction for the block on the ramp.',
        },
        {
          expression: 'W_1^{\\parallel} = m_1 g\\sin 35° = 6 \\times 10 \\times 0.574 = 34.4\\,\\text{N (down slope)}',
          annotation: 'Gravity component of ramp block along slope.',
        },
        {
          expression: 'W_2 = m_2 g = 4 \\times 10 = 40\\,\\text{N (down)}',
          annotation: 'Weight of hanging mass.',
        },
        {
          expression: '40 > 34.4 + 9.82 = 44.2? \\;\\text{No: } 40 < 44.2 \\quad\\Rightarrow\\quad \\text{Try: hanging mass goes DOWN}',
          annotation: "Hanging mass pulls the ramp block UP. Check if W₂ > W₁_parallel + friction. 40 N vs 34.4 + 9.82 = 44.2 N — hanging mass can't lift the block. Try the other direction.",
        },
        {
          expression: '\\text{Check: block slides DOWN, hanging mass goes UP.}\\; W_1^{\\parallel} = 34.4 > W_2 - f_k = 40 - 9.82? \\;34.4 > 30.2\\;\\checkmark',
          annotation: 'The ramp block slides down, pulling the hanging mass up.',
        },
        {
          expression: '(m_1 + m_2)a = m_1 g\\sin 35° - f_k - m_2 g = 34.4 - 9.82 - 40 = -15.4\\,\\text{N}',
          annotation: 'Wait — this is negative, meaning block actually does NOT slide down. System is in static equilibrium!',
        },
        {
          expression: '\\text{Static check: } |W_1^{\\parallel} - W_2| = |34.4 - 40| = 5.6\\,\\text{N} < f_{s,\\max} \\approx \\mu_s N \\approx 0.25 \\times 49.1 = 12.3\\,\\text{N}',
          annotation: 'The net driving force (5.6 N) is less than maximum static friction — the system is in static equilibrium, a = 0.',
        },
      ],
      answer: "The system is in static equilibrium — a = 0. The net tendency (5.6 N) is less than maximum static friction. Tension T = m₂g = 40 N (hanging mass in equilibrium). This illustrates why checking static equilibrium FIRST is essential.",
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'inclined-plane' }, title: 'Force decomposition on a slope' },
    { id: 'InclinedPlaneSim', props: {}, title: 'Interactive: angle, mass, and friction' },
  ],
}
