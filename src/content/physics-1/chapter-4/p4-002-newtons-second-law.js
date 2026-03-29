export default {
  id: 'p1-ch4-002',
  slug: 'newtons-second-law',
  chapter: 'p4',
  order: 1,
  title: "Newton's Second Law: F = ma",
  subtitle: 'Net force equals mass times acceleration — the master equation of classical mechanics.',
  tags: ['newtons-laws', 'force', 'acceleration', 'mass', 'dynamics', 'vectors'],

  hook: {
    question: 'Why does the same engine accelerate a motorcycle much faster than an eighteen-wheeler, even though the engine force is the same?',
    realWorldContext: "F = ma is the central equation of classical mechanics. Every problem in Newtonian dynamics — bridges, rockets, cars, pendulums, satellites — reduces to applying this one law. The Second Law doesn't just say force causes acceleration; it tells you exactly HOW MUCH acceleration for a given force and mass. That quantitative precision is what makes it so powerful.",
    previewVisualizationId: 'SecondLawIntuition',
  },

  intuition: {
    prose: [
      'Push a shopping cart versus push a car with the same force. The cart accelerates dramatically; the car barely moves. Mass resists acceleration — this is the m in F = ma.',
      'Push the same shopping cart gently, then hard. Gentle push = small acceleration; hard push = large acceleration. Force drives acceleration — this is the F in F = ma.',
      'The key word is NET. F_net is the vector sum of ALL forces. A 100 N push with a 60 N friction opposing it gives F_net = 40 N — only 40 N drives the acceleration, not 100.',
      'Both force and acceleration are vectors — they point in the same direction. F_net toward the right → acceleration toward the right. The magnitude of the acceleration is |F_net|/m.',
    ],
    callouts: [
      {
        type: 'definition',
        title: "Newton's Second Law",
        body: '\\vec{F}_{\\text{net}} = m\\vec{a} \\qquad \\text{or equivalently} \\qquad \\sum \\vec{F} = m\\vec{a}',
      },
      {
        type: 'definition',
        title: 'The Newton (unit of force)',
        body: '1\\,\\text{N} = 1\\,\\text{kg}\\cdot\\text{m/s}^2 \\qquad \\text{(force that gives 1 kg an acceleration of 1 m/s}^2\\text{)}',
      },
      {
        type: 'insight',
        title: 'Three algebraic forms',
        body: 'F = ma \\quad\\Rightarrow\\quad a = \\dfrac{F}{m} \\quad\\Rightarrow\\quad m = \\dfrac{F}{a}',
      },
      {
        type: 'insight',
        title: 'Direction matters',
        body: "\\vec{F}_{\\text{net}} and \\vec{a} always point in the same direction. If the net force is upward, the acceleration is upward — even if the object is currently moving downward (like a ball thrown up).",
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Net force on a pushed block',
        caption: 'Applied force F (right), friction f (left). Net force = F − f, pointing right. Acceleration = (F − f)/m, also pointing right. Doubling F (without changing friction) doubles the net force and doubles the acceleration.',
      },
      {
        id: 'ForceBlockSim',
        title: 'Interactive: vary force and mass',
        props: {},
        caption: 'F = ma is not abstract — drag the sliders and watch the numbers.',
      },
    ],
  },

  math: {
    prose: [
      'The Second Law is applied component-by-component. In 2D problems, write ΣFₓ = maₓ and ΣFᵧ = maᵧ separately. Each component equation is independent.',
      'The SI unit of force is the Newton: 1 N = 1 kg·m/s². Verify units: [kg]·[m/s²] = [kg·m/s²] = [N]. Always check unit consistency in every problem.',
      'Weight is a force: W = mg. When you stand on a scale, the scale measures the Normal force (which equals your weight in static equilibrium). Your mass is m; your weight is mg. They have different units (kg vs. N).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Second Law in component form',
        body: '\\sum F_x = m a_x \\qquad \\sum F_y = m a_y',
      },
      {
        type: 'theorem',
        title: 'Weight formula',
        body: 'W = mg \\qquad (g = 9.8\\,\\text{m/s}^2 \\approx 10\\,\\text{m/s}^2)',
      },
      {
        type: 'insight',
        title: 'Mass vs. weight',
        body: 'Mass (m) is an intrinsic property measured in kg. Weight (W = mg) is a force measured in Newtons — it depends on local gravitational field g. On the Moon, g ≈ 1.6 m/s², so your weight is ~1/6 of Earth weight, but your mass is unchanged.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "Newton's Second Law is F_net = ma. Force is the time rate of change of momentum (p = mv). Since a = dv/dt, we have F = m(dv/dt) = d(mv)/dt = dp/dt for constant mass.",
      "The acceleration a = dv/dt = d²x/dt². Therefore: F = m·(d²x/dt²). Force is proportional to the SECOND DERIVATIVE of position with respect to time. This is a second-order ordinary differential equation — the fundamental equation of dynamics.",
      "For a constant net force F (simplest case), d²x/dt² = F/m = constant. Integrating twice: v(t) = v₀ + (F/m)t and x(t) = x₀ + v₀t + ½(F/m)t². This is exactly the constant-acceleration kinematics you already know — the Second Law generates those kinematic equations.",
      "The deeper calculus connection: F(x,v,t) = m·(d²x/dt²) is the general form. In most Calc 1 problems, F is constant. In more advanced physics, F depends on x (springs), v (damping), or t (time-varying forces) — each giving a different type of differential equation.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Second Law as a differential equation',
        body: 'F_{\\text{net}} = m\\,\\frac{d^2x}{dt^2} \\qquad \\text{(general form — force drives the second derivative of position)}',
      },
      {
        type: 'theorem',
        title: 'Integration for constant force',
        body: '\\frac{d^2x}{dt^2} = \\frac{F}{m} = a \\quad\\Rightarrow\\quad v(t) = v_0 + at \\quad\\Rightarrow\\quad x(t) = x_0 + v_0 t + \\tfrac{1}{2}at^2',
      },
    ],
    visualizationId: 'SecondLawDerivation',
    proofSteps: [
      {
        title: 'State the Second Law',
        expression: '\\vec{F}_{\\text{net}} = m\\vec{a}',
        annotation: 'Net force equals mass times acceleration. Both sides are vectors.',
      },
      {
        title: 'Write acceleration as derivative',
        expression: '\\vec{F}_{\\text{net}} = m\\,\\frac{d\\vec{v}}{dt} = m\\,\\frac{d^2\\vec{x}}{dt^2}',
        annotation: 'Force is proportional to the second derivative of position.',
      },
      {
        title: 'Solve for constant force (integrate once)',
        expression: '\\frac{dv}{dt} = \\frac{F}{m} = a \\quad\\Rightarrow\\quad v(t) = v_0 + at',
        annotation: 'Integrate acceleration (constant) to get velocity. Constant of integration = v₀.',
      },
      {
        title: 'Integrate again for position',
        expression: 'x(t) = \\int (v_0 + at)\\,dt = x_0 + v_0 t + \\tfrac{1}{2}at^2',
        annotation: 'The kinematic equations emerge naturally from integrating F = ma twice.',
      },
      {
        title: 'Kinematic equations are consequences of F = ma',
        expression: 'v^2 = v_0^2 + 2a\\Delta x \\quad\\text{(eliminate t between the two equations above)}',
        annotation: 'All five kinematic equations follow from applying calculus to F = ma.',
      },
    ],
    title: "Derivation: Kinematics from Newton's Second Law via integration",
    visualizations: [
      {
        id: 'SecondLawDerivation',
        title: 'From F = ma to kinematic equations via integration',
        mathBridge: 'F = m(d²x/dt²) is a second-order ODE. Integrating twice with initial conditions v₀ and x₀ yields the kinematic equations. This is why the kinematic equations work — they are F = ma integrated.',
        caption: "Every kinematic equation is an integral of Newton's Second Law.",
      },
    ],
  },

  examples: [
    {
      id: 'ch4-002-ex1',
      title: 'Finding acceleration from net force',
      problem: 'A 3 kg box is pushed to the right with 24 N. Friction acts to the left with 9 N. Find the net force and acceleration.',
      steps: [
        {
          expression: '\\sum F_x = F_{\\text{push}} - F_{\\text{friction}} = 24 - 9 = 15\\,\\text{N (right)}',
          annotation: 'Net force is the vector sum. Subtract opposing forces.',
        },
        {
          expression: 'a = \\frac{\\sum F_x}{m} = \\frac{15\\,\\text{N}}{3\\,\\text{kg}} = 5\\,\\text{m/s}^2 \\;(\\text{right})',
          annotation: 'Divide net force by mass. Acceleration is in the same direction as net force.',
        },
      ],
      conclusion: 'The net force is 15 N to the right; the box accelerates at 5 m/s² to the right.',
    },
    {
      id: 'ch4-002-ex2',
      title: 'Finding the force needed for a given acceleration',
      problem: 'A 1200 kg car needs to accelerate from 0 to 20 m/s in 8 seconds. What constant net force is required? Ignore friction.',
      steps: [
        {
          expression: 'a = \\frac{\\Delta v}{\\Delta t} = \\frac{20 - 0}{8} = 2.5\\,\\text{m/s}^2',
          annotation: 'Find the required acceleration from kinematics.',
        },
        {
          expression: 'F_{\\text{net}} = ma = 1200 \\times 2.5 = 3000\\,\\text{N}',
          annotation: 'Multiply mass by required acceleration.',
        },
      ],
      conclusion: 'The engine must provide a net force of 3000 N (3 kN) forward.',
    },
    {
      id: 'ch4-002-ex3',
      title: 'Two-direction problem: block pushed at an angle',
      problem: 'A 5 kg block on a frictionless horizontal surface is pushed by a 30 N force directed 37° above horizontal. (sin 37° = 0.6, cos 37° = 0.8.) Find the horizontal acceleration and the normal force. Use g = 10 m/s².',
      steps: [
        {
          expression: 'F_x = 30\\cos 37° = 30 \\times 0.8 = 24\\,\\text{N}, \\quad F_y = 30\\sin 37° = 30 \\times 0.6 = 18\\,\\text{N (up)}',
          annotation: 'Decompose the applied force into horizontal and vertical components.',
        },
        {
          expression: '\\sum F_x = 24\\,\\text{N} \\quad\\Rightarrow\\quad a_x = \\frac{24}{5} = 4.8\\,\\text{m/s}^2',
          annotation: 'Horizontal: only the x-component drives horizontal acceleration.',
        },
        {
          expression: '\\sum F_y = 0: \\quad N + 18 - mg = 0 \\quad\\Rightarrow\\quad N = 5(10) - 18 = 32\\,\\text{N}',
          annotation: 'Vertical: no vertical acceleration (stays on surface), so ΣFᵧ = 0.',
        },
      ],
      conclusion: 'Horizontal acceleration = 4.8 m/s²; normal force = 32 N (less than weight because the push has an upward component that partially lifts the block).',
    },
  ],

  challenges: [
    {
      id: 'ch4-002-ch1',
      difficulty: 'easy',
      problem: 'A net force of 45 N acts on a 9 kg object. Find the acceleration. If it starts from rest, how fast is it moving after 4 seconds?',
      hint: 'Use a = F/m first, then the kinematic equation v = v₀ + at.',
      walkthrough: [
        {
          expression: 'a = \\frac{F}{m} = \\frac{45}{9} = 5\\,\\text{m/s}^2',
          annotation: "Divide net force by mass — Newton's Second Law.",
        },
        {
          expression: 'v = v_0 + at = 0 + 5(4) = 20\\,\\text{m/s}',
          annotation: 'Kinematic equation with v₀ = 0 (starts from rest).',
        },
      ],
      answer: 'Acceleration = 5 m/s²; speed after 4 s = 20 m/s.',
    },
    {
      id: 'ch4-002-ch2',
      difficulty: 'medium',
      problem: 'A 4 kg block is pushed right by 20 N and simultaneously pulled left by 8 N. Friction (kinetic) is 4 N opposing motion. Find the acceleration. Is friction in the correct direction?',
      hint: 'First determine the direction of motion (or intended motion), then apply friction opposing that direction.',
      walkthrough: [
        {
          expression: '\\text{Net of applied forces: } 20 - 8 = 12\\,\\text{N (right)}',
          annotation: 'The object tends to move right, so kinetic friction points left.',
        },
        {
          expression: '\\sum F = 12 - 4 = 8\\,\\text{N (right)}',
          annotation: 'Friction is 4 N left, opposing the net applied force direction.',
        },
        {
          expression: 'a = \\frac{8}{4} = 2\\,\\text{m/s}^2 \\;(\\text{right})',
          annotation: 'Divide net force by mass.',
        },
      ],
      answer: 'Net force = 8 N right; acceleration = 2 m/s² to the right. Friction is indeed to the left (opposing motion).',
    },
    {
      id: 'ch4-002-ch3',
      difficulty: 'hard',
      problem: 'A 2 kg object starts at rest and a net force F = 6t N (increasing with time) acts on it from t = 0 to t = 3 s. Find the velocity at t = 3 s by integrating a(t). (This previews calculus-based dynamics.)',
      hint: 'Find a(t) = F(t)/m = 6t/2 = 3t. Then integrate a(t) from 0 to 3 to get Δv.',
      walkthrough: [
        {
          expression: 'a(t) = \\frac{F(t)}{m} = \\frac{6t}{2} = 3t\\,\\text{m/s}^2',
          annotation: 'The force varies with time, so the acceleration also varies with time.',
        },
        {
          expression: 'v(3) = v_0 + \\int_0^3 a(t)\\,dt = 0 + \\int_0^3 3t\\,dt = \\left[\\frac{3t^2}{2}\\right]_0^3 = \\frac{3(9)}{2} = 13.5\\,\\text{m/s}',
          annotation: 'Integrate the time-varying acceleration to find the velocity change.',
        },
      ],
      answer: 'v(3 s) = 13.5 m/s. Note: constant-force kinematic equations would NOT work here — this requires integration because F varies with time.',
    },
  ],

  viz: [
    { id: 'SVGDiagram', props: { type: 'free-body-diagram' }, title: 'Force diagram: F = ma' },
    { id: 'ForceBlockSim', title: 'Interactive: F = ma', props: {} },
  ],
}
