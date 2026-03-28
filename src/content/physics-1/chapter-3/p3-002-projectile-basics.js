export default {
  id: 'p1-ch3-002',
  slug: 'projectile-basics',
  chapter: 'p3',
  order: 1,
  title: 'Projectile Motion Basics',
  subtitle: 'Two independent kinematic equations trace a parabolic arc through space.',
  tags: ['projectile-motion', 'kinematics-2d', 'parametric-equations', 'parabola'],

  hook: {
    question: 'A soccer player kicks a ball at an angle. What equation describes the exact curve the ball traces through the air?',
    realWorldContext: 'Every ball sport, artillery calculation, and space mission trajectory uses projectile equations. The parabolic arc is nature\'s default path whenever gravity is the only force — understanding its parametric form gives you complete predictive power over where anything will be at any time.',
    previewVisualizationId: 'ProjectileBasicsViz',
  },

  intuition: {
    prose: [
      'A projectile launched at speed v₀ and angle θ follows two simultaneous equations: one for each direction. The x-equation is simply "constant speed sideways," and the y-equation is "free fall upward then down."',
      'Together these parametric equations trace a parabola in the x-y plane. But the shape depends entirely on initial speed and angle — steeper angles make tall, narrow arcs; shallow angles make wide, flat ones.',
      'We use g = 10 m/s² for clean numbers in examples (real value ≈ 9.8 m/s²). The physics is identical — the difference is less than 2%.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Parametric projectile equations',
        body: 'x(t) = v_0 \\cos\\theta \\cdot t \\qquad y(t) = v_0 \\sin\\theta \\cdot t - \\tfrac{1}{2}g t^2',
      },
      {
        type: 'insight',
        title: 'Why parametric?',
        body: 'Both x and y are functions of the same parameter t. You can eliminate t to get y as a function of x — but keeping t makes calculations easier.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'projectile-arc' },
        title: 'Parabolic arc with labeled coordinates',
        caption: 'x grows at constant rate v₀cosθ; y rises then falls under gravity. Together they trace a symmetric parabola (when launched and landing heights match).',
      },
      {
        id: 'ProjectileBasicsViz',
        title: 'Interactive projectile launcher',
        mathBridge: 'Adjust v₀ and θ to explore how the trajectory shape changes. Observe that doubling v₀ quadruples the range, and 45° gives the widest arc for flat ground.',
        caption: 'Every (x, y) point on the arc satisfies both parametric equations simultaneously.',
      },
    ],
  },

  math: {
    prose: [
      'The key skill is applying both equations at the same time t. If you know t, you know everything. If you don\'t know t, use one equation to find it, then substitute into the other.',
      'The trajectory equation y(x) is obtained by eliminating t algebraically. It reveals that the path is a downward-opening parabola in x.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Trajectory equation (parabola)',
        body: 'y = x\\tan\\theta - \\frac{g\\,x^2}{2 v_0^2 \\cos^2\\theta}',
      },
      {
        type: 'insight',
        title: 'Two equations, one unknown',
        body: 'In most projectile problems the only unknown connecting x and y is the time t. Find t from whichever equation is easier, then substitute.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The trajectory equation y(x) is derived by eliminating the time parameter t from the two parametric equations.',
      'Starting from x = v₀cosθ · t, we solve for t and substitute into y(t). The result is a quadratic in x — confirming that every projectile (with gravity only) follows a parabola.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Trajectory derivation result',
        body: 'y(x) = x\\tan\\theta - \\frac{g}{2v_0^2\\cos^2\\theta}\\,x^2 \\quad (\\text{quadratic in }x)',
      },
    ],
    visualizationId: 'TrajectoryDerivation',
    proofSteps: [
      {
        title: 'Start with horizontal equation',
        expression: 'x = v_0 \\cos\\theta \\cdot t',
        annotation: 'Horizontal position as a function of time.',
      },
      {
        title: 'Solve for t',
        expression: 't = \\frac{x}{v_0 \\cos\\theta}',
        annotation: 'Invert the horizontal equation to express t in terms of x.',
      },
      {
        title: 'Substitute into y(t)',
        expression: 'y = v_0 \\sin\\theta \\cdot \\frac{x}{v_0\\cos\\theta} - \\frac{1}{2}g\\left(\\frac{x}{v_0\\cos\\theta}\\right)^2',
        annotation: 'Replace every t with the expression from step 2.',
      },
      {
        title: 'Simplify',
        expression: 'y = x\\tan\\theta - \\frac{g\\,x^2}{2v_0^2\\cos^2\\theta}',
        annotation: 'First term simplifies to x·tanθ; second term is the quadratic correction from gravity.',
      },
    ],
    title: 'Derivation: Trajectory equation by eliminating t',
    visualizations: [
      {
        id: 'TrajectoryDerivation',
        title: 'Parametric to Cartesian path',
        mathBridge: 'The elimination of t converts the time-based description into a spatial curve. The resulting y(x) is a downward parabola whose steepness depends on v₀ and θ.',
        caption: 'All projectile paths are parabolas — this derivation proves it.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-002-ex1',
      title: 'Position at t = 1 s and t = 2 s for a 45° launch',
      problem: 'A ball is launched at v_0 = 20\\,\\text{m/s} at \\theta = 45°. Use \\cos 45° = \\sin 45° = \\frac{\\sqrt{2}}{2} \\approx 0.707 and g = 10\\,\\text{m/s}^2. Find position at t = 1\\,\\text{s} and t = 2\\,\\text{s}.',
      steps: [
        {
          expression: 'v_{0x} = 20 \\times 0.707 \\approx 14.1\\,\\text{m/s}, \\quad v_{0y} = 14.1\\,\\text{m/s}',
          annotation: 'Equal components because θ = 45°.',
        },
        {
          expression: 't=1\\,\\text{s}: \\quad x = 14.1\\,\\text{m}, \\quad y = 14.1(1) - 5(1)^2 = 9.1\\,\\text{m}',
          annotation: 'Plug t = 1 into both equations.',
        },
        {
          expression: 't=2\\,\\text{s}: \\quad x = 14.1(2) = 28.2\\,\\text{m}, \\quad y = 14.1(2) - 5(4) = 8.2\\,\\text{m}',
          annotation: 'At t = 2 the ball is descending — y is lower than at t = 1.',
        },
      ],
      conclusion: 'At t = 1 s: (14.1 m, 9.1 m). At t = 2 s: (28.2 m, 8.2 m). The ball has passed its peak and is coming down.',
    },
    {
      id: 'ch3-002-ex2',
      title: 'Cliff throw — time to hit ground',
      problem: 'A ball is thrown horizontally at v_0 = 10\\,\\text{m/s} from a cliff 80\\,\\text{m} tall. Use g = 10\\,\\text{m/s}^2. Find (a) time to hit ground and (b) horizontal distance from cliff base.',
      steps: [
        {
          expression: 'y = -\\tfrac{1}{2}g t^2 \\Rightarrow -80 = -5t^2 \\Rightarrow t^2 = 16 \\Rightarrow t = 4\\,\\text{s}',
          annotation: 'Vertical equation: horizontal throw means v₀y = 0. Negative y = fall below launch.',
        },
        {
          expression: 'x = v_{0x}\\,t = 10 \\times 4 = 40\\,\\text{m}',
          annotation: 'Horizontal distance using the constant-velocity equation.',
        },
      ],
      conclusion: 'The ball hits the ground after 4 s, landing 40 m from the base of the cliff.',
    },
  ],

  challenges: [
    {
      id: 'ch3-002-ch1',
      difficulty: 'easy',
      problem: 'A ball is launched at v_0 = 25\\,\\text{m/s} and \\theta = 37°. Use \\sin 37° = 0.6,\\;\\cos 37° = 0.8 and g = 10\\,\\text{m/s}^2. Find the position at t = 3\\,\\text{s}.',
      hint: 'Find v₀x and v₀y first, then apply each kinematic equation independently.',
      walkthrough: [
        {
          expression: 'v_{0x} = 25(0.8) = 20\\,\\text{m/s}, \\quad v_{0y} = 25(0.6) = 15\\,\\text{m/s}',
          annotation: 'Decompose the launch velocity.',
        },
        {
          expression: 'x = 20(3) = 60\\,\\text{m}',
          annotation: 'Horizontal: constant velocity.',
        },
        {
          expression: 'y = 15(3) - \\tfrac{1}{2}(10)(9) = 45 - 45 = 0\\,\\text{m}',
          annotation: 'Vertical: the ball is back at launch height — it has just landed!',
        },
      ],
      answer: 'At t = 3 s the ball is at (60 m, 0 m) — it just hit the ground at that instant.',
    },
    {
      id: 'ch3-002-ch2',
      difficulty: 'medium',
      problem: 'A projectile is launched at v_0 = 30\\,\\text{m/s} and \\theta = 30°. Use \\sin 30° = 0.5,\\;\\cos 30° = \\frac{\\sqrt{3}}{2} \\approx 0.866 and g = 10\\,\\text{m/s}^2. At what time does the ball reach y = 11.25\\,\\text{m} on the way up?',
      hint: 'Set y(t) = 11.25 and solve the resulting quadratic. Take the smaller root (on the way up).',
      walkthrough: [
        {
          expression: 'v_{0y} = 30(0.5) = 15\\,\\text{m/s}',
          annotation: 'Vertical component of launch velocity.',
        },
        {
          expression: '11.25 = 15t - 5t^2 \\Rightarrow 5t^2 - 15t + 11.25 = 0 \\Rightarrow t^2 - 3t + 2.25 = 0',
          annotation: 'Set y = 11.25 and rearrange.',
        },
        {
          expression: '(t - 1.5)^2 = 0 \\Rightarrow t = 1.5\\,\\text{s}',
          annotation: 'Perfect square — the ball passes y = 11.25 m exactly once (it is the peak!).',
        },
      ],
      answer: 't = 1.5 s. This turns out to be the peak — the ball reaches y = 11.25 m exactly at maximum height.',
    },
  ],
}
