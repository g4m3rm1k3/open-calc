export default {
  id: 'p1-ch3-001',
  slug: 'independence-x-y',
  chapter: 'p3',
  order: 0,
  title: 'Independence of x and y',
  subtitle: 'Horizontal and vertical motions are completely independent — gravity only acts downward.',
  tags: ['projectile-motion', 'independence', 'vector-components', 'kinematics-2d'],

  hook: {
    question: 'If you fire a bullet horizontally and simultaneously drop an identical bullet from the same height, which hits the ground first?',
    realWorldContext: 'Every projectile problem — from a thrown ball to a launched rocket — depends on one key insight: horizontal and vertical motion are governed by completely separate equations. Master this separation and all 2D kinematics becomes two 1D problems you already know.',
    previewVisualizationId: 'IndependenceIntuition',
  },

  intuition: {
    prose: [
      'In 2D projectile motion, the horizontal direction has no force acting on it (ignoring air resistance). This means horizontal velocity is constant — the object coasts sideways at exactly the speed it was given at launch.',
      'Vertically, only gravity acts. The object undergoes free fall exactly as if it had never moved sideways at all. The vertical motion is completely blind to what is happening horizontally.',
      'Time t is the invisible thread that ties both directions together. At every moment, the same t plugs into both the x-equation and the y-equation, letting you locate the object in 2D space.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Horizontal motion (no force)',
        body: 'x = v_{0x}\\,t, \\quad v_x = v_0 \\cos\\theta = \\text{constant}',
      },
      {
        type: 'definition',
        title: 'Vertical motion (free fall)',
        body: 'y = v_{0y}\\,t - \\tfrac{1}{2}g t^2, \\quad v_y = v_0 \\sin\\theta - g t',
      },
      {
        type: 'insight',
        title: 'Time is the shared parameter',
        body: 'Both equations use the same t. Given one piece of information about time, you can find position or velocity in both directions simultaneously.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'projectile-arc' },
        title: 'Parabolic trajectory with velocity components',
        caption: 'At launch, v₀ splits into vₓ (horizontal, constant) and v₀y (vertical, decreasing). The horizontal spacing between equal time-intervals is uniform; the vertical spacing is not — illustrating independence.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Decomposing the launch velocity',
        caption: 'v₀ at angle θ decomposes into v₀x = v₀cosθ (rightward) and v₀y = v₀sinθ (upward). These two components never interact — each evolves independently under its own equation.',
      },
      {
        id: 'IndependenceIntuition',
        title: 'Dropped vs. launched — same fall time',
        mathBridge: 'Compare a horizontally launched projectile with a simultaneously dropped object. Both reach the ground at the same instant because their vertical equations are identical.',
        caption: 'Horizontal velocity has zero effect on the time to fall.',
      },
    ],
  },

  math: {
    prose: [
      'To apply the independence principle, first decompose the initial velocity into components using trigonometry. Then solve the x- and y-equations separately, connecting them only through the shared time variable.',
      'Given launch speed v₀ at angle θ above the horizontal: v₀x = v₀cosθ and v₀y = v₀sinθ. These feed directly into the kinematic equations for each axis.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Full 2D kinematic set',
        body: '\\text{Horizontal: } x = v_0 \\cos\\theta \\cdot t \\quad (a_x = 0) \\\\ \\text{Vertical: } y = v_0 \\sin\\theta \\cdot t - \\tfrac{1}{2}g t^2 \\quad (a_y = -g)',
      },
      {
        type: 'insight',
        title: 'Standard values',
        body: 'Use g = 9.8\\,\\text{m/s}^2 for accuracy or g = 10\\,\\text{m/s}^2 for clean arithmetic in examples.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "The independence of x and y motions follows directly from Newton's Second Law applied in each direction separately.",
      'In the horizontal direction, the net force is zero (no friction, no air resistance in our model). By F = ma, if F_x = 0 then a_x = 0. Integrating twice gives uniform horizontal motion.',
      'In the vertical direction, only gravity acts: F_y = −mg. Therefore a_y = −g. Integrating twice yields the free-fall equations. The two integrations are entirely independent — x-motion never appears in the y-equations and vice versa.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: "Newton's 2nd Law in component form",
        body: '\\sum F_x = m a_x \\quad\\Rightarrow\\quad 0 = m a_x \\quad\\Rightarrow\\quad a_x = 0 \\\\ \\sum F_y = m a_y \\quad\\Rightarrow\\quad -mg = m a_y \\quad\\Rightarrow\\quad a_y = -g',
      },
    ],
    visualizationId: 'IndependenceDerivation',
    proofSteps: [
      {
        title: "Apply Newton's 2nd Law — x direction",
        expression: '\\sum F_x = 0 \\Rightarrow a_x = 0',
        annotation: 'No horizontal force means zero horizontal acceleration.',
      },
      {
        title: 'Integrate acceleration → velocity (x)',
        expression: 'v_x = \\int a_x\\,dt = \\int 0\\,dt = v_{0x} = v_0 \\cos\\theta',
        annotation: 'Constant of integration is the initial horizontal velocity.',
      },
      {
        title: 'Integrate velocity → position (x)',
        expression: 'x = \\int v_x\\,dt = v_{0x}\\,t',
        annotation: 'Horizontal position grows linearly with time.',
      },
      {
        title: "Apply Newton's 2nd Law — y direction",
        expression: '\\sum F_y = -mg \\Rightarrow a_y = -g',
        annotation: 'Only gravity acts vertically; acceleration is −g (up-positive).',
      },
      {
        title: 'Integrate acceleration → velocity (y)',
        expression: 'v_y = \\int (-g)\\,dt = v_{0y} - g t = v_0 \\sin\\theta - g t',
        annotation: 'Vertical velocity decreases linearly due to gravity.',
      },
      {
        title: 'Integrate velocity → position (y)',
        expression: 'y = \\int v_y\\,dt = v_{0y}\\,t - \\tfrac{1}{2}g t^2',
        annotation: 'Vertical position follows a parabolic path — free fall.',
      },
    ],
    title: 'Derivation: Independence from Newton\'s Second Law',
    visualizations: [
      {
        id: 'IndependenceDerivation',
        title: 'Force decomposition proof',
        mathBridge: 'The x and y force equations are decoupled — solving one does not require knowledge of the other. This algebraic separation is exactly what makes the component method so powerful.',
        caption: 'Two separate 1D problems, not one hard 2D problem.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-001-ex1',
      title: 'Components and position from a launch at 37°',
      problem: 'A projectile is launched at v_0 = 25\\,\\text{m/s} at \\theta = 37° above the horizontal. Use \\sin 37° = 0.6,\\;\\cos 37° = 0.8. Find (a) v_{0x} and v_{0y}, and (b) position at t = 2\\,\\text{s}. Use g = 10\\,\\text{m/s}^2.',
      steps: [
        {
          expression: 'v_{0x} = v_0 \\cos 37° = 25 \\times 0.8 = 20\\,\\text{m/s}',
          annotation: 'Horizontal component from decomposition.',
        },
        {
          expression: 'v_{0y} = v_0 \\sin 37° = 25 \\times 0.6 = 15\\,\\text{m/s}',
          annotation: 'Vertical component from decomposition.',
        },
        {
          expression: 'x = v_{0x}\\,t = 20 \\times 2 = 40\\,\\text{m}',
          annotation: 'Horizontal equation: constant velocity, no acceleration.',
        },
        {
          expression: 'y = v_{0y}\\,t - \\tfrac{1}{2}g t^2 = 15(2) - \\tfrac{1}{2}(10)(4) = 30 - 20 = 10\\,\\text{m}',
          annotation: 'Vertical equation: free fall reduces y below the linear trend.',
        },
      ],
      conclusion: 'The launch components are vₓ = 20 m/s and v₀y = 15 m/s. At t = 2 s the projectile is at (40 m, 10 m).',
    },
    {
      id: 'ch3-001-ex2',
      title: 'Horizontal throw — same fall time as a drop',
      problem: 'A ball is thrown horizontally at v_0 = 12\\,\\text{m/s} from a table 1.25\\,\\text{m} high. Use g = 10\\,\\text{m/s}^2. Find the time to hit the floor and the horizontal distance traveled.',
      steps: [
        {
          expression: 'y = -\\tfrac{1}{2}g t^2 \\Rightarrow -1.25 = -\\tfrac{1}{2}(10)t^2',
          annotation: 'Vertical equation with v₀y = 0. Negative y because it falls below launch.',
        },
        {
          expression: 't^2 = \\frac{1.25}{5} = 0.25 \\Rightarrow t = 0.5\\,\\text{s}',
          annotation: 'Same fall time as a ball dropped from rest from 1.25 m.',
        },
        {
          expression: 'x = v_{0x}\\,t = 12 \\times 0.5 = 6\\,\\text{m}',
          annotation: 'Horizontal motion is independent — just v₀x times time.',
        },
      ],
      conclusion: 'The ball hits the floor after 0.5 s at 6 m from the table base. A simultaneously dropped ball would land at the same time, confirming independence.',
    },
  ],

  challenges: [
    {
      id: 'ch3-001-ch1',
      difficulty: 'easy',
      problem: 'A ball is launched at v_0 = 30\\,\\text{m/s} at \\theta = 53°. Use \\sin 53° = 0.8,\\;\\cos 53° = 0.6 and g = 10\\,\\text{m/s}^2. Find v_{0x}, v_{0y}, and the velocity vector at t = 1\\,\\text{s}.',
      hint: 'Find components first, then use vₓ = v₀x (constant) and vy = v₀y − gt.',
      walkthrough: [
        {
          expression: 'v_{0x} = 30 \\times 0.6 = 18\\,\\text{m/s}, \\quad v_{0y} = 30 \\times 0.8 = 24\\,\\text{m/s}',
          annotation: 'Decompose launch velocity.',
        },
        {
          expression: 'v_x = 18\\,\\text{m/s}\\;(\\text{unchanged}), \\quad v_y = 24 - 10(1) = 14\\,\\text{m/s}',
          annotation: 'Horizontal component stays constant; vertical decreases by g each second.',
        },
      ],
      answer: 'At t = 1 s: vₓ = 18 m/s, vy = 14 m/s. The ball is still moving upward.',
    },
    {
      id: 'ch3-001-ch2',
      difficulty: 'medium',
      problem: 'A ball is thrown horizontally from a height of 20\\,\\text{m}. You want it to land 30\\,\\text{m} away. Use g = 10\\,\\text{m/s}^2. What initial speed is required?',
      hint: 'Find the fall time from the height first, then compute the required horizontal speed.',
      walkthrough: [
        {
          expression: '20 = \\tfrac{1}{2}(10)t^2 \\Rightarrow t^2 = 4 \\Rightarrow t = 2\\,\\text{s}',
          annotation: 'Time determined entirely by vertical free fall.',
        },
        {
          expression: 'v_{0x} = \\frac{x}{t} = \\frac{30}{2} = 15\\,\\text{m/s}',
          annotation: 'Required horizontal speed from the horizontal equation.',
        },
      ],
      answer: 'A launch speed of 15 m/s horizontally is required.',
    },
  ],
}
