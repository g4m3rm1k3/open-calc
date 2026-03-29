export default {
  id: 'p1-ch5-001',
  slug: 'work-definition',
  chapter: 'p5',
  order: 1,
  title: 'Work: Force in the Direction of Motion',
  subtitle: 'Not all effort counts — only the force that actually moves something.',
  tags: ['work', 'force', 'displacement', 'dot product', 'energy transfer', 'joule'],

  hook: {
    question: 'A weightlifter holds a 100 kg barbell perfectly still above their head for 3 minutes — arms shaking, muscles burning. According to physics, exactly how much work have they done on the barbell? Make a genuine guess before reading on.',
    realWorldContext:
      'Your intuitive sense of "effort" and physics "work" are deliberately different things. ' +
      'Physics work measures one specific thing: energy transferred into an object\'s motion or position change. ' +
      'When that transfer is zero, the work is zero — regardless of how hard you tried. ' +
      'This is not pedantic. It is the key to understanding where energy goes in every engine, every machine, and every biological system.',
    previewVisualizationId: 'WorkDotProductViz',
  },

  intuition: {
    prose: [
      '**The answer that surprises everyone:** The weightlifter has done exactly zero joules of work on the barbell. ' +
        'The barbell didn\'t move — displacement is zero — so no energy was transferred to its motion or position. ' +
        'The muscles burned ATP (biological energy), but that energy became heat and muscle tension, not mechanical work on the barbell. ' +
        'Biology and physics measure "work" differently on purpose.',

      '**Push a concrete wall.** You push with maximum force. The wall doesn\'t move. Displacement: zero. Work done on the wall: zero. ' +
        'Exhausting yourself without moving something is not work in physics. This forces the question: what exactly *is* work?',

      '**The contradiction that builds the model:** If a horse pulls a cart along a flat road, work is done. If the same horse stands motionless in harness, no work is done. ' +
        'If a roller coaster car rolls along a horizontal track, gravity (pointing down) does no work — because gravity is perpendicular to the motion. ' +
        'The pattern emerging: work requires both force AND displacement, and only the force component *in the direction of motion* counts.',

      '**Building the rule:** We need a formula capturing: (1) more force → more work, (2) more displacement → more work, ' +
        '(3) force aligned with motion → maximum work, (4) force perpendicular → zero work. ' +
        'There is exactly one product of two vectors that behaves this way: the **dot product**. ' +
        'Math doesn\'t impose this — physics demands it, and the dot product is the compression that satisfies all four conditions at once.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 6 — Chapter 5: Work & Energy',
        body:
          '**Chapter 4 established:** Forces cause acceleration (\\(F = ma\\)). Every force has a magnitude and direction.\n' +
          '**This chapter asks:** What happens when forces act through distances? What is "energy" and where does it come from?\n' +
          '**This lesson:** Work is the transfer mechanism — force acting through displacement. No displacement, no work.\n' +
          '**Next lesson:** Kinetic energy — the energy of motion — and how net work equals its change.',
      },
      {
        type: 'definition',
        title: 'Work (conceptual)',
        body:
          'Work is done on an object when a net force has a component in the direction of displacement. ' +
          'Force without displacement = no work. Displacement without force = no work. Perpendicular force = no work.',
      },
      {
        type: 'warning',
        title: 'Physics work ≠ everyday effort',
        body:
          'Holding a barbell still, pushing a wall, carrying a box horizontally at constant height — all are zero work in physics. ' +
          'Biology burns energy in all three cases. Physics tracks energy transferred into mechanical motion or position change only.',
      },
      {
        type: 'connection',
        title: 'Calculus connection: work = dot product = projection',
        body:
          '\\(W = \\vec{F}\\cdot\\vec{d} = |\\vec{F}||\\vec{d}|\\cos\\theta\\). ' +
          'The cosine factor is the projection of \\(\\vec{F}\\) onto \\(\\vec{d}\\) — extracting only the aligned component. ' +
          'For variable forces: \\(W = \\int F(x)\\,dx\\) — the area under the force-position graph. Calculus generalizes the formula from constant to any force.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'work-force-angle' },
        title: 'Work depends on the angle between force and displacement',
        caption:
          'θ = 0°: force fully aligned with motion → W = Fd (maximum). ' +
          'θ = 90°: force perpendicular → W = 0 (no work). ' +
          'θ = 180°: force opposes motion → W = −Fd (negative work, removing energy). ' +
          'The cosine function encodes all three cases in one formula.',
      },
      {
        id: 'WorkDotProductViz',
        title: 'Drag the force angle — watch work change',
        mathBridge:
          'Adjust θ from 0° to 180°. Watch W = Fd cos θ update. ' +
          'Notice: at 90°, the projection of force onto displacement vanishes completely — the force steers but doesn\'t accelerate.',
        caption: 'The "shadow" of force onto displacement is what does the work.',
        props: { interactive: true },
      },
    ],
  },

  math: {
    prose: [
      'For a **constant force** \\(\\vec{F}\\) acting through displacement \\(\\vec{d}\\):',
      '\\(W = \\vec{F}\\cdot\\vec{d} = Fd\\cos\\theta\\), where \\(\\theta\\) is the angle between force and displacement.',
      'For a **variable force** \\(F(x)\\) that changes as position changes, we sum infinitesimal work contributions:',
      '\\(W = \\int_{x_i}^{x_f} F(x)\\,dx\\) — this is the area under the force-vs-position graph.',
      'Units: \\([W] = \\text{N}\\cdot\\text{m} = \\text{J}\\) (joule). ' +
        'One joule is the work done by one newton acting through one metre in the direction of motion.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Work — constant force',
        body: 'W = \\vec{F}\\cdot\\vec{d} = Fd\\cos\\theta \\qquad [\\text{SI: J = N·m}]',
      },
      {
        type: 'theorem',
        title: 'Work — variable force',
        body: 'W = \\int_{x_i}^{x_f} F(x)\\,dx = \\text{signed area under the }F\\text{-}x\\text{ graph}',
      },
      {
        type: 'mnemonic',
        title: 'Sign of work',
        body:
          '\\(W > 0\\): force aids displacement — energy added to object.\\\\' +
          '\\(W = 0\\): force perpendicular — steers but doesn\'t speed up or slow down.\\\\' +
          '\\(W < 0\\): force opposes displacement — energy removed (e.g. friction, braking).',
      },
      {
        type: 'insight',
        title: 'Work-Energy Theorem (coming next lesson)',
        body:
          '\\(W_{\\text{net}} = \\Delta KE = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2\\). ' +
          'Net work done on an object equals the change in its kinetic energy. ' +
          'This theorem ties together force, displacement, and speed — we prove it in Lesson 2.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Area under F(x) = work done',
        mathBridge:
          'For a spring: F(x) = kx. Drag the endpoint — watch \\(W = \\int_0^x kx\\,dx = \\tfrac{1}{2}kx^2\\) update. ' +
          'The triangular area equals the stored spring energy. Integral = visible area = work.',
        caption: 'The integral ∫F dx is not an abstraction — it is the area you can see and measure.',
        props: { expression: '200*x', variable: 'x', xMin: 0, xMax: 0.3, showArea: true },
      },
    ],
  },

  rigor: {
    title: 'Deriving W = Fd cos θ from vector components',
    prose: [
      'We derive the cosine factor from the dot product definition — no hand-waving required.',
    ],
    proofSteps: [
      {
        expression: '\\vec{F} = F_x\\hat{i} + F_y\\hat{j}, \\quad \\vec{d} = d\\hat{i} \\quad (\\text{displacement along }x)',
        annotation: 'Place displacement along the x-axis. Force has components in both directions.',
      },
      {
        expression: 'W = \\vec{F}\\cdot\\vec{d} = F_x \\cdot d + F_y \\cdot 0 = F_x d',
        annotation: 'Dot product: multiply matching components, sum. Only the x-component of force contributes.',
      },
      {
        expression: 'F_x = |\\vec{F}|\\cos\\theta',
        annotation: 'The x-component of force is F cos θ, where θ is the angle between F and d.',
      },
      {
        expression: 'W = |\\vec{F}|\\cos\\theta \\cdot d = Fd\\cos\\theta',
        annotation: 'Substituting: the familiar formula. Cosine naturally emerges from component projection.',
      },
      {
        expression: '\\theta=0°\\Rightarrow W=Fd \\quad \\theta=90°\\Rightarrow W=0 \\quad \\theta=180°\\Rightarrow W=-Fd',
        annotation: 'Three key cases follow from cos 0°=1, cos 90°=0, cos 180°=−1. All physically correct.',
      },
    ],
  },

  examples: [
    {
      id: 'ch5-001-ex1',
      title: 'Pushing a box — all four forces analyzed',
      problem:
        '\\text{A person pushes a 20 kg box with a horizontal 80 N force through 5 m. ' +
        'Friction = 30 N backward. Find work by each force and net work.}',
      steps: [
        {
          expression: 'W_{\\text{push}} = 80 \\times 5 \\times \\cos 0° = 400\\,\\text{J}',
          annotation: 'Push is parallel to displacement (θ = 0°). Maximum work.',
        },
        {
          expression: 'W_{\\text{friction}} = 30 \\times 5 \\times \\cos 180° = -150\\,\\text{J}',
          annotation: 'Friction opposes motion (θ = 180°). Always negative work when opposing displacement.',
        },
        {
          expression: 'W_{\\text{gravity}} = W_{\\text{normal}} = 0',
          annotation: 'Both are vertical; displacement is horizontal. θ = 90°. No work done.',
        },
        {
          expression: 'W_{\\text{net}} = 400 + (-150) = 250\\,\\text{J}',
          annotation: 'Net work = algebraic sum. By the Work-Energy Theorem: the box gained 250 J of kinetic energy.',
        },
      ],
      conclusion: 'Net work 250 J → box sped up by 250 J of kinetic energy gain.',
    },
    {
      id: 'ch5-001-ex2',
      title: 'Variable spring force — integration',
      problem: 'A spring (k = 200 N/m) is compressed 0.10 m. Find work done on the spring.',
      steps: [
        {
          expression: 'F(x) = kx = 200x',
          annotation: 'Hooke\'s Law: force increases linearly with compression.',
        },
        {
          expression: 'W = \\int_0^{0.10} 200x\\,dx = \\left[100x^2\\right]_0^{0.10}',
          annotation: 'Integrate the variable force.',
        },
        {
          expression: 'W = 100(0.01) - 0 = 1.0\\,\\text{J}',
          annotation: 'Also: area of triangle = ½ × base × height = ½ × 0.1 × 20 = 1 J. Same answer geometrically.',
        },
      ],
      conclusion: 'W = 1.0 J stored as elastic potential energy. The triangular area = ½kx².',
    },
  ],

  challenges: [
    {
      id: 'ch5-001-ch1',
      difficulty: 'easy',
      problem:
        '\\text{A satellite moves in a circular orbit. Earth\'s gravity always points toward the centre, ' +
        'perpendicular to the velocity. How much work does gravity do per complete orbit?}',
      hint: 'What is θ between gravity and displacement at every instant?',
      walkthrough: [
        {
          expression: '\\theta = 90° \\text{ at every point on the circular orbit}',
          annotation: 'Centripetal force is always perpendicular to velocity for circular motion.',
        },
        {
          expression: 'W = Fd\\cos 90° = 0 \\text{ at every instant}',
          annotation: 'Zero work each instant → zero work per orbit.',
        },
      ],
      answer: 'Zero. Gravity changes the satellite\'s direction but not its speed.',
    },
    {
      id: 'ch5-001-ch2',
      difficulty: 'medium',
      problem:
        '\\text{Force } \\vec{F} = (3\\hat{i} + 4\\hat{j})\\,\\text{N acts on an object displaced } ' +
        '\\vec{d} = (5\\hat{i} - 2\\hat{j})\\,\\text{m. Find the work done.}',
      hint: 'W = F⃗·d⃗ = FₓDₓ + FᵧDᵧ. Multiply components and add.',
      walkthrough: [
        {
          expression: 'W = F_x d_x + F_y d_y = (3)(5) + (4)(-2)',
          annotation: 'Dot product in component form.',
        },
        {
          expression: 'W = 15 - 8 = 7\\,\\text{J}',
          annotation: 'The y-force partially opposes y-displacement, reducing total work.',
        },
      ],
      answer: 'W = 7 J.',
    },
    {
      id: 'ch5-001-ch3',
      difficulty: 'hard',
      problem:
        '\\text{Force } F(x) = 6x^2 - 2x \\text{ (N) acts as a particle moves from } x = 1\\text{ m to }x = 3\\text{ m. Find work.}',
      hint: 'Integrate: W = ∫₁³ (6x² − 2x) dx.',
      walkthrough: [
        {
          expression: 'W = \\int_1^3 (6x^2 - 2x)\\,dx = \\left[2x^3 - x^2\\right]_1^3',
          annotation: 'Power rule: antiderivative of 6x² is 2x³; antiderivative of 2x is x².',
        },
        {
          expression: 'W = (54 - 9) - (2 - 1) = 45 - 1 = 44\\,\\text{J}',
          annotation: 'Evaluate at upper and lower limits and subtract.',
        },
      ],
      answer: 'W = 44 J.',
    },
  ],
}
