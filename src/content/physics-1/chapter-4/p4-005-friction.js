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
    previewVisualizationId: 'FrictionIntuition',
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
        id: 'FrictionIntuition',
        title: 'Static vs kinetic friction: force-vs-applied-force graph',
        mathBridge: "As applied force increases from 0, static friction matches it (line with slope 1) until the maximum f_{s,max} = μ_s N. Once the object moves, friction drops to f_k = μ_k N and stays constant. The 'drop' when motion begins corresponds to μ_k < μ_s.",
        caption: 'Friction is not constant — static friction is variable (up to a maximum); kinetic friction is fixed.',
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
    visualizationId: 'FrictionDerivation',
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
        id: 'FrictionDerivation',
        title: 'Static-to-kinetic transition and piecewise dynamics',
        mathBridge: 'The friction force is a piecewise function of applied force. The derivative (slope of f vs F_app) is 1 in the static regime and 0 in the kinetic regime. At the transition, the function is not differentiable — a key calculus subtlety in physics.',
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

  viz: [
    { id: 'SVGDiagram', props: { type: 'free-body-diagram' }, title: 'Friction force on a block' },
    { id: 'ForceBlockSim', props: {}, title: 'Interactive: static vs. kinetic friction' },
  ],
}
