export default {
  id: 'cnc-circular-motion',
  slug: 'circular-interpolation',
  chapter: 'cnc-1',
  order: 11,
  title: 'Circular Interpolation',
  subtitle: 'Curves, Arcs, and Circles (G02/G03)',
  tags: ['G02', 'G03', 'IJK', 'G17', 'arcs'],

  semantics: {
    core: [
      { symbol: 'G02', meaning: 'Clockwise Circular Interpolation.' },
      { symbol: 'G03', meaning: 'Counter-Clockwise Circular Interpolation.' },
      { symbol: 'I, J, K', meaning: 'Incremental distance from the start point to the center of the arc.' },
      { symbol: 'R', meaning: 'The radius of the arc instead of center points.' },
      { symbol: 'G17/18/19', meaning: 'Defines the plane of rotation (XY, ZX, and YZ respectively).' },
    ],
    rulesOfThumb: [
      'G02/G03 are modal! Don\'t forget to switch back to G01 for straight lines.',
      'Always visualize the plane before writing arcs (G17 is the default XY).',
      'The center point (I,J,K) is almost always incremental from the start point.',
    ]
  },

  hook: {
    question: 'How do you tell a machine to draw a perfect circle when the motors only move in straight lines?',
    realWorldContext:
      'Everything in high-precision manufacturing relies on arcs—from the rounded edges of a luxury watch to the complex cooling fins of a jet engine turbine. ' +
      'While a G01 move only cares about Start and End, a Circular move care about **Start, End, and Center**. ' +
      'By pulsing the motors in a sine/cosine relationship, we create a curves with sub-micron accuracy.',

  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(CIRCLE LAB) \nG00 X0 Y0 \nG01 X5.0 \nG03 X7.0 Y2.0 I2.0 J0.0 \nG01 Y5.0 \nG03 X5.0 Y7.0 I-2.0 J0.0'
        },
        title: 'Circular Motion Lab',
        caption: 'See the rounded corner? G03 tells the machine: "Travel from current X5Y0 to X7Y2 by swinging around a center point that is +2 inches away in X (I2.0)".'
      }
    ],
    prose: [
      'Think of a **Compass**. One leg is fixed (the Center Point), and the other draws the arc (the Tool). To define an arc in G-code, you must define where the compass center is.',

      '**I, J, and K are Vectors**: If you are at `X5.0 Y0.0` and the center is at `X7.0 Y0.0`, then the distance from you to the center is `X+2.0`. In G-code, this is `I2.0`. The `I` word is linked to X, `J` is linked to Y, and `K` is linked to Z.',

      '**G17 (The Tabletop)**: Most CNC work is done on the flat bed (XY plane). This is **G17**. If you wanted to cut a circle standing up (like a wheel rolling), you would switch to **G18** (ZX plane) or **G19** (YZ plane).',
    ],
  },

  math: {
    prose: [
      'Circular interpolation uses the radius $R$ to maintain a constant distance from the center $(X_c, Y_c)$.',
      
      'For an arc from $(x_s, y_s)$ to $(x_e, y_e)$ at center $(x_c, y_c)$:',
      '$$R = \\sqrt{(x_s-x_c)^2 + (y_s-y_c)^2}$$',

      'The controller ensures that at every point $(x,y)$ on the path:',
      '$$\\sqrt{(x-x_c)^2 + (y-y_c)^2} = R \\text{ (within tolerance)}$$',

      'The motors must maintain a velocity such that:',
      '$V_x = -V \\cdot \\sin(\\theta)$',
      '$V_y = V \\cdot \\cos(\\theta)$',
      'where $\\theta$ is the current angle of the arc.',
    ],
  },

  rigor: {
    prose: [
      '**Full Circles**: To move a full 360 degrees, the Start and End points are identical. In this case, `I` and `J` must be defined, as a `G02 X0 Y0 R5.0` command would be ambiguous (infinitely many circles pass through one point with a fixed radius).',
      
      '**Arc Tolerance**: If the distance from the Start point to the Center is not EXACTLY the same as the Center to the End point, the machine will trigger an "Invalid Arc" alarm. High-end machines might "blend" the difference, but precision requires perfect math.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-arcs',
      title: 'Clockwise vs. Counter-Clockwise',
      problem: 'Determine the direction of the arc: If we are at X0Y0 and move to X1Y1 with a center at X1Y0.',
      code: 'G02 X1.0 Y1.0 I1.0 J0.0',
      steps: [
        { expression: 'G02', annotation: 'Motion is Clockwise (CW).' },
        { expression: 'I1.0', annotation: 'Center is 1 unit to the RIGHT of the start point.' },
      ],
      conclusion: 'The tool will swing clockwise up to the point (1,1).',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-arc-1',
        type: 'choice',
        text: 'Which plane code is used for standard XY machining?',
        options: ['G17', 'G18', 'G19', 'G20'],
        answer: 'G17',
      },
      {
        id: 'cnc-arc-2',
        type: 'input',
        text: 'If I is the center offset for X, which letter is the offset for Y? ',
        answer: 'J',
      },
    ]
  },

  mentalModel: [
    'IJK = Compass Center',
    'G02 = Clockwise Clock',
    'G03 = Reverse Clock',
    'Planes = Orienting the Compass',
  ],
}
