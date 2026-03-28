export default {
  id: 'p1-ch3-005',
  slug: 'projectile-range',
  chapter: 'p3',
  order: 2,
  title: 'Finding the Range',
  subtitle: 'Set y = 0 at landing to derive R = v₀²sin(2θ)/g — maximum at 45°.',
  tags: ['projectile-motion', 'range', 'optimization', 'kinematics-2d'],

  hook: {
    question: 'A javelin thrower wants to maximize distance. Should they throw at 30°, 45°, or 60° — and does it matter which of the other two they choose?',
    realWorldContext: 'Range calculations are essential in sports science, ballistics, and engineering. The elegant sin(2θ) formula reveals a deep symmetry: complementary angles (e.g. 30° and 60°) give identical ranges. Athletes and engineers exploit this to choose the angle that is easier to achieve physically while still hitting the target distance.',
    previewVisualizationId: 'RangeExplorer',
  },

  intuition: {
    prose: [
      'Range R is the horizontal distance from launch to landing, assuming the projectile lands at the same height it was launched from.',
      'There are two moments when y = 0: the launch (t = 0) and the landing. We want the landing time — the non-zero solution. Plug that time back into x(t) to get R.',
      'The formula R = v₀²sin(2θ)/g has a beautiful structure. It is maximized when sin(2θ) = 1, i.e. 2θ = 90°, i.e. θ = 45°. And since sin(2θ) = sin(180° − 2θ), the pairs (θ, 90°−θ) always give the same range.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Range formula',
        body: 'R = \\frac{v_0^2 \\sin 2\\theta}{g}',
      },
      {
        type: 'insight',
        title: 'Maximum range at 45°',
        body: 'R_{\\max} = \\frac{v_0^2}{g} \\quad (\\text{when } \\theta = 45°)',
      },
      {
        type: 'insight',
        title: 'Complementary angles give equal range',
        body: 'R(\\theta) = R(90° - \\theta) \\quad \\text{because } \\sin 2\\theta = \\sin(180° - 2\\theta)',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'projectile-arc' },
        title: 'Range: launch to landing on flat ground',
        caption: 'R is the horizontal distance when y returns to zero. The arc is symmetric about its peak when launch and landing are at the same height.',
      },
      {
        id: 'RangeExplorer',
        title: 'Range vs. launch angle',
        mathBridge: 'Sweep θ from 0° to 90° and plot R(θ). The curve is symmetric about 45°, and pairs like (30°, 60°) land at the same x-coordinate.',
        caption: 'The sin(2θ) formula predicts this symmetry exactly.',
      },
    ],
  },

  math: {
    prose: [
      'The derivation uses the y-equation to find landing time, then substitutes into the x-equation. The double-angle identity 2sinθcosθ = sin(2θ) collapses the answer into its compact form.',
      'When working numerically, it is often easiest to compute vₓ = v₀cosθ and v₀y = v₀sinθ first, then use R = 2vₓv₀y/g — this avoids needing to recall the full formula.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Alternate form: useful for 37°/53° pairs',
        body: 'R = \\frac{2\\,v_{0x}\\,v_{0y}}{g} = \\frac{2\\,v_0\\cos\\theta\\cdot v_0\\sin\\theta}{g} = \\frac{v_0^2\\sin 2\\theta}{g}',
      },
      {
        type: 'warning',
        title: 'Valid only for flat ground',
        body: 'R = v_0^2\\sin(2\\theta)/g applies only when the projectile lands at the same height as launch. For different heights, find landing time from the y-equation directly.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'We derive R by finding the landing time from the vertical equation and substituting into the horizontal equation.',
      'Setting y = 0 gives a factorable quadratic in t. The landing solution is t = 2v₀sinθ/g. Multiplying by vₓ = v₀cosθ and applying the double-angle identity gives the compact range formula.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Range derivation result',
        body: 'R = v_{0x} \\cdot t_{\\text{land}} = v_0\\cos\\theta \\cdot \\frac{2v_0\\sin\\theta}{g} = \\frac{v_0^2 \\cdot 2\\sin\\theta\\cos\\theta}{g} = \\frac{v_0^2\\sin 2\\theta}{g}',
      },
    ],
    visualizationId: 'RangeDerivation',
    proofSteps: [
      {
        title: 'Set y = 0 (landing condition)',
        expression: 'v_{0y}\\,t - \\tfrac{1}{2}g t^2 = 0',
        annotation: 'Projectile is at ground level at both launch and landing.',
      },
      {
        title: 'Factor out t',
        expression: 't\\left(v_{0y} - \\tfrac{1}{2}g t\\right) = 0',
        annotation: 'Two solutions: t = 0 (launch) and the non-zero landing time.',
      },
      {
        title: 'Solve for landing time',
        expression: 't_{\\text{land}} = \\frac{2v_{0y}}{g} = \\frac{2v_0\\sin\\theta}{g}',
        annotation: 'Total flight time is twice the time to reach the peak.',
      },
      {
        title: 'Substitute into x(t)',
        expression: 'R = v_{0x}\\cdot t_{\\text{land}} = v_0\\cos\\theta \\cdot \\frac{2v_0\\sin\\theta}{g}',
        annotation: 'Horizontal position at landing time.',
      },
      {
        title: 'Apply double-angle identity',
        expression: 'R = \\frac{2v_0^2\\sin\\theta\\cos\\theta}{g} = \\frac{v_0^2\\sin 2\\theta}{g}',
        annotation: '2sinθcosθ = sin(2θ). The formula is now in its standard compact form.',
      },
    ],
    title: 'Derivation: Range from the y = 0 landing condition',
    visualizations: [
      {
        id: 'RangeDerivation',
        title: 'Landing time and range geometry',
        mathBridge: 'The flight time t_land = 2v₀y/g is exactly twice the time to reach the peak — confirming the symmetric arc. Multiplying by vₓ gives the total horizontal distance.',
        caption: 'Total flight time = 2 × time to peak. Range = vₓ × total flight time.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-005-ex1',
      title: 'Range at 30° launch',
      problem: 'A ball is launched at v_0 = 30\\,\\text{m/s} at \\theta = 30°. Use g = 10\\,\\text{m/s}^2 and \\sin 60° = \\frac{\\sqrt{3}}{2} \\approx 0.866. Find the range R.',
      steps: [
        {
          expression: 'R = \\frac{v_0^2 \\sin 2\\theta}{g} = \\frac{(30)^2 \\sin 60°}{10}',
          annotation: 'Apply the range formula directly. 2θ = 60°.',
        },
        {
          expression: 'R = \\frac{900 \\times 0.866}{10} = \\frac{779.4}{10} \\approx 77.9\\,\\text{m}',
          annotation: 'This equals 45√3 m exactly.',
        },
      ],
      conclusion: 'The range is R = 45√3 ≈ 77.9 m at θ = 30°.',
    },
    {
      id: 'ch3-005-ex2',
      title: 'Complementary angles give same range',
      problem: 'Verify that \\theta = 60° gives the same range as \\theta = 30° for v_0 = 30\\,\\text{m/s}. Use g = 10\\,\\text{m/s}^2.',
      steps: [
        {
          expression: 'R_{60} = \\frac{(30)^2 \\sin 120°}{10} = \\frac{900 \\times \\sin 60°}{10}',
          annotation: 'sin(2×60°) = sin(120°) = sin(60°) because sin(120°) = sin(180°−120°) = sin(60°).',
        },
        {
          expression: 'R_{60} = \\frac{900 \\times 0.866}{10} \\approx 77.9\\,\\text{m} = R_{30}',
          annotation: 'Identical result. Complementary angles always produce the same range.',
        },
      ],
      conclusion: 'Both θ = 30° and θ = 60° give R ≈ 77.9 m. An archer or athlete can choose the angle that is physically easier without sacrificing range.',
    },
  ],

  challenges: [
    {
      id: 'ch3-005-ch1',
      difficulty: 'medium',
      problem: 'A projectile must hit a target 90\\,\\text{m} away on flat ground. The launch speed is v_0 = 30\\,\\text{m/s}. Use g = 10\\,\\text{m/s}^2. Find the required launch angle(s).',
      hint: 'Set R = 90 in the range formula and solve for sin(2θ). There will be two solutions for θ.',
      walkthrough: [
        {
          expression: '90 = \\frac{(30)^2 \\sin 2\\theta}{10} \\Rightarrow \\sin 2\\theta = \\frac{90 \\times 10}{900} = 1',
          annotation: 'Solve for sin(2θ).',
        },
        {
          expression: '2\\theta = 90° \\Rightarrow \\theta = 45°',
          annotation: 'sin(2θ) = 1 has only one solution in [0°, 90°]. The target is exactly at maximum range.',
        },
      ],
      answer: 'θ = 45° exactly. 90 m is the maximum range for v₀ = 30 m/s, so only one angle achieves it.',
    },
    {
      id: 'ch3-005-ch2',
      difficulty: 'hard',
      problem: 'A ball is launched at v_0 = 20\\,\\text{m/s} and must land 30\\,\\text{m} away. Use g = 10\\,\\text{m/s}^2. Find both possible launch angles.',
      hint: 'Set R = 30, solve for sin(2θ), then find both values of θ using the complementary-angle symmetry.',
      walkthrough: [
        {
          expression: '30 = \\frac{(20)^2 \\sin 2\\theta}{10} \\Rightarrow \\sin 2\\theta = \\frac{300}{400} = 0.75',
          annotation: 'Solve for sin(2θ).',
        },
        {
          expression: '2\\theta = \\arcsin(0.75) \\approx 48.6° \\Rightarrow \\theta_1 \\approx 24.3°',
          annotation: 'First (low) angle solution.',
        },
        {
          expression: '2\\theta = 180° - 48.6° = 131.4° \\Rightarrow \\theta_2 \\approx 65.7°',
          annotation: 'Second (high) angle: complementary to the first since 24.3° + 65.7° = 90°.',
        },
      ],
      answer: 'θ₁ ≈ 24.3° (low trajectory) and θ₂ ≈ 65.7° (high trajectory) both land at 30 m.',
    },
  ],
}
