export default {
  id: 'p1-ch3-010',
  slug: 'projectile-height',
  chapter: 'p3',
  order: 3,
  title: 'Finding the Max Height',
  subtitle: 'The peak occurs when vertical velocity is zero — h = v₀y²/(2g).',
  tags: ['projectile-motion', 'maximum-height', 'kinematics-2d', 'optimization'],

  hook: {
    question: 'A firework is launched upward at an angle. At the peak of its arc, what is its speed? What determines how high it goes?',
    realWorldContext: 'Maximum height calculations matter in rocketry, sports (basketball shots, pole vault), and safety engineering. The peak-height formula comes from a single key condition: vertical velocity is zero at the top. Everything else follows from the Ch2 free-fall equations you already know.',
    previewVisualizationId: 'MaxHeightViz',
  },

  intuition: {
    prose: [
      'A projectile rises as long as its vertical velocity is positive and falls once vy goes negative. The exact moment vy = 0 is the peak — the highest point.',
      'At the peak, only the horizontal component remains. The projectile is moving purely sideways for an instant. The vertical component has been completely cancelled by gravity.',
      'The peak height depends only on v₀y — how much vertical speed you put in at launch. A steeper angle or faster launch both give a higher peak.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Condition at maximum height',
        body: 'v_y = 0 \\quad \\text{at } t = t_{\\text{peak}}',
      },
      {
        type: 'definition',
        title: 'Time to peak and max height',
        body: 't_{\\text{peak}} = \\frac{v_{0y}}{g} = \\frac{v_0 \\sin\\theta}{g} \\qquad h_{\\max} = \\frac{v_{0y}^2}{2g} = \\frac{(v_0\\sin\\theta)^2}{2g}',
      },
      {
        type: 'insight',
        title: 'Horizontal position at peak = R/2',
        body: 'x_{\\text{peak}} = v_{0x}\\cdot t_{\\text{peak}} = \\frac{R}{2} \\quad \\text{(for flat-ground launch)}',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'projectile-arc' },
        title: 'Peak of the arc: vy = 0',
        caption: 'At the peak, the vertical velocity arrow shrinks to zero. Only the horizontal component vₓ remains. The height h is measured from launch to this point.',
      },
      {
        id: 'MaxHeightViz',
        title: 'Peak height vs. launch angle and speed',
        mathBridge: 'Vary θ and v₀ to see how h_max changes. Note that h_max depends on v₀sinθ squared — doubling the vertical component quadruples the peak height.',
        caption: 'h_max = v₀y² / (2g). Only vertical speed determines how high it goes.',
      },
    ],
  },

  math: {
    prose: [
      'There are two equivalent methods to find h_max. Method 1: find t_peak from vy = 0, then substitute into y(t). Method 2: use the no-time kinematic equation vy² = v₀y² − 2g·Δy with vy = 0.',
      'Method 2 is often faster when you need only the height and not the time. Method 1 is better when you also need t_peak for other calculations.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Method 1: via time',
        body: 't_{\\text{peak}} = \\frac{v_{0y}}{g} \\quad\\Rightarrow\\quad h = v_{0y}\\cdot\\frac{v_{0y}}{g} - \\frac{1}{2}g\\cdot\\frac{v_{0y}^2}{g^2} = \\frac{v_{0y}^2}{2g}',
      },
      {
        type: 'theorem',
        title: 'Method 2: no-time equation',
        body: 'v_y^2 = v_{0y}^2 - 2g\\,h \\;\\Rightarrow\\; 0 = v_{0y}^2 - 2g\\,h \\;\\Rightarrow\\; h = \\frac{v_{0y}^2}{2g}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The maximum-height formula h = v₀y²/(2g) follows from integrating the vertical equation and applying the condition vy = 0.',
      'We derive it rigorously via Method 1: integrate the vertical acceleration to get vy(t), set vy = 0 to find t_peak, then substitute into y(t). The result confirms the compact formula.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Max height formula',
        body: 'h_{\\max} = \\frac{v_{0y}^2}{2g} = \\frac{(v_0\\sin\\theta)^2}{2g}',
      },
    ],
    visualizationId: 'MaxHeightDerivation',
    proofSteps: [
      {
        title: 'Write vertical velocity equation',
        expression: 'v_y = v_{0y} - g\\,t',
        annotation: 'Standard kinematic equation for vertical velocity under constant acceleration −g.',
      },
      {
        title: 'Apply peak condition: vy = 0',
        expression: '0 = v_{0y} - g\\,t_{\\text{peak}} \\Rightarrow t_{\\text{peak}} = \\frac{v_{0y}}{g}',
        annotation: 'Time to reach maximum height.',
      },
      {
        title: 'Substitute t_peak into y(t)',
        expression: 'h = v_{0y}\\cdot\\frac{v_{0y}}{g} - \\frac{1}{2}g\\left(\\frac{v_{0y}}{g}\\right)^2 = \\frac{v_{0y}^2}{g} - \\frac{v_{0y}^2}{2g}',
        annotation: 'Expand both terms.',
      },
      {
        title: 'Simplify',
        expression: 'h = \\frac{v_{0y}^2}{2g}',
        annotation: 'The two terms combine to give the final compact formula.',
      },
    ],
    title: 'Derivation: Maximum height from vy = 0',
    visualizations: [
      {
        id: 'MaxHeightDerivation',
        title: 'Vertical velocity zeroing at the peak',
        mathBridge: 'The vy(t) graph is a straight line with slope −g, starting at v₀y. It crosses zero at t_peak = v₀y/g. The area under the curve up to that point equals h_max.',
        caption: 'The peak is where the vy line crosses zero — directly giving t_peak, then h.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-010-ex1',
      title: 'Max height and time to peak for a 60° launch',
      problem: 'A ball is launched at v_0 = 20\\,\\text{m/s} at \\theta = 60°. Use \\sin 60° = \\frac{\\sqrt{3}}{2} \\approx 0.866 and g = 10\\,\\text{m/s}^2. Find h_{\\max} and t_{\\text{peak}}.',
      steps: [
        {
          expression: 'v_{0y} = 20\\sin 60° = 20 \\times \\frac{\\sqrt{3}}{2} = 10\\sqrt{3}\\,\\text{m/s} \\approx 17.3\\,\\text{m/s}',
          annotation: 'Vertical component of launch velocity.',
        },
        {
          expression: 't_{\\text{peak}} = \\frac{v_{0y}}{g} = \\frac{10\\sqrt{3}}{10} = \\sqrt{3}\\,\\text{s} \\approx 1.73\\,\\text{s}',
          annotation: 'Time to reach the peak.',
        },
        {
          expression: 'h_{\\max} = \\frac{v_{0y}^2}{2g} = \\frac{(10\\sqrt{3})^2}{2 \\times 10} = \\frac{300}{20} = 15\\,\\text{m}',
          annotation: 'Exact result: 15 m. Confirm: ½g·t_peak² = ½(10)(3) = 15 m ✓',
        },
      ],
      conclusion: 'The ball reaches a maximum height of 15 m at t = √3 ≈ 1.73 s after launch.',
    },
    {
      id: 'ch3-010-ex2',
      title: 'Max height for a 37° launch',
      problem: 'A projectile is launched at v_0 = 25\\,\\text{m/s} at \\theta = 37°. Use \\sin 37° = 0.6 and g = 10\\,\\text{m/s}^2. Find h_{\\max}.',
      steps: [
        {
          expression: 'v_{0y} = 25 \\times 0.6 = 15\\,\\text{m/s}',
          annotation: 'Vertical launch component.',
        },
        {
          expression: 'h_{\\max} = \\frac{(15)^2}{2 \\times 10} = \\frac{225}{20} = 11.25\\,\\text{m}',
          annotation: 'Apply max height formula directly.',
        },
      ],
      conclusion: 'The maximum height is 11.25 m.',
    },
  ],

  challenges: [
    {
      id: 'ch3-010-ch1',
      difficulty: 'medium',
      problem: 'A ball reaches a maximum height of 20\\,\\text{m}. Use g = 10\\,\\text{m/s}^2. Find the vertical component of launch velocity v_{0y}, and the total flight time.',
      hint: 'Use h = v₀y²/(2g) to find v₀y, then use t_total = 2t_peak.',
      walkthrough: [
        {
          expression: '20 = \\frac{v_{0y}^2}{2(10)} \\Rightarrow v_{0y}^2 = 400 \\Rightarrow v_{0y} = 20\\,\\text{m/s}',
          annotation: 'Solve the max height formula for v₀y.',
        },
        {
          expression: 't_{\\text{peak}} = \\frac{20}{10} = 2\\,\\text{s} \\Rightarrow t_{\\text{total}} = 2 \\times 2 = 4\\,\\text{s}',
          annotation: 'Total flight time is twice the time to reach peak.',
        },
      ],
      answer: 'v₀y = 20 m/s and total flight time = 4 s.',
    },
    {
      id: 'ch3-010-ch2',
      difficulty: 'hard',
      problem: 'A ball is launched at v_0 = 50\\,\\text{m/s} at \\theta = 53°. Use \\sin 53° = 0.8,\\;\\cos 53° = 0.6 and g = 10\\,\\text{m/s}^2. Find h_{\\max}, t_{\\text{peak}}, and the range R. Verify that x_{\\text{peak}} = R/2.',
      hint: 'Find v₀y and v₀x from components, then apply the height, time, and range formulas.',
      walkthrough: [
        {
          expression: 'v_{0y} = 50(0.8) = 40\\,\\text{m/s}, \\quad v_{0x} = 50(0.6) = 30\\,\\text{m/s}',
          annotation: 'Decompose launch velocity.',
        },
        {
          expression: 'h_{\\max} = \\frac{40^2}{20} = \\frac{1600}{20} = 80\\,\\text{m}',
          annotation: 'Peak height.',
        },
        {
          expression: 't_{\\text{peak}} = \\frac{40}{10} = 4\\,\\text{s}',
          annotation: 'Time to reach peak.',
        },
        {
          expression: 'R = \\frac{2 \\times 30 \\times 40}{10} = 240\\,\\text{m}',
          annotation: 'Range using R = 2v₀x·v₀y/g.',
        },
        {
          expression: 'x_{\\text{peak}} = v_{0x}\\cdot t_{\\text{peak}} = 30 \\times 4 = 120\\,\\text{m} = \\frac{240}{2} = \\frac{R}{2} \\checkmark',
          annotation: 'The horizontal position at peak is exactly half the total range — confirming arc symmetry.',
        },
      ],
      answer: 'h_max = 80 m, t_peak = 4 s, R = 240 m. At the peak, x = 120 m = R/2 ✓.',
    },
  ],
}
