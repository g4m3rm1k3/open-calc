export default {
  id: 'p1-ch2-001',
  slug: 'kinematics-definition',
  chapter: 2,
  order: 1,
  title: 'Motion in One Dimension — Definitions',
  subtitle: 'Position, displacement, velocity, and acceleration: the four quantities that describe all motion.',
  tags: ['kinematics','position','displacement','velocity','acceleration','1D motion'],
  aliases: 'motion definition kinematics one dimension scalar vector position displacement',

  hook: {
    question: 'A car drives 10 km east, then 4 km west. It travelled 14 km — but its displacement is only 6 km. Why does the difference matter?',
    realWorldContext:
      'GPS navigation, rocket guidance, and sports biomechanics all depend on tracking displacement — not distance. ' +
      'Kinematics is the language physicists use to describe motion precisely, without asking why the motion happens.',
    previewVisualizationId: 'KinematicsDefinitionIntuition',
  },

  videos: [
    {
      title: 'Physics 2 – Motion in One Dimension (1 of 22) Definition',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      'Kinematics asks **what** an object does — not **why**. ' +
        'It describes motion using four fundamental quantities: position, displacement, velocity, and acceleration.',
      '**Position** $x$ locates an object on a number line (needs a reference point and a direction for positive). ' +
        '**Displacement** $\\Delta x = x_f - x_i$ measures the net change in position — it is a vector (has sign). ' +
        '**Distance** is the total path length — always positive, always $\\ge |\\Delta x|$.',
      '**Average velocity** $\\bar{v} = \\Delta x / \\Delta t$ is displacement per unit time — a vector. ' +
        '**Average speed** $= \\text{distance} / \\Delta t$ — a scalar, always $\\ge |\\bar{v}|$. ' +
        '**Acceleration** $a = \\Delta v / \\Delta t$ is the rate of change of velocity.',
    ],
    callouts: [
      { type: 'definition', title: 'Displacement', body: '\\Delta x = x_f - x_i \\quad (\\text{vector — has sign})' },
      { type: 'definition', title: 'Average velocity', body: '\\bar{v} = \\frac{\\Delta x}{\\Delta t} = \\frac{x_f - x_i}{t_f - t_i}' },
      { type: 'definition', title: 'Average acceleration', body: '\\bar{a} = \\frac{\\Delta v}{\\Delta t} = \\frac{v_f - v_i}{t_f - t_i}' },
      { type: 'warning', title: 'Distance ≠ |Displacement|', body: 'Distance counts every metre travelled. Displacement counts only the net change. They are equal only if the object never reverses direction.' },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'kinematic-chain' },
        title: 'The kinematic chain',
        caption: 'Position, velocity, and acceleration are linked by differentiation (d/dt) going right and integration (∫ dt) going left.',
      },
      {
        id: 'KinematicsDefinitionIntuition',
        title: 'Drag the object along the number line — watch displacement vs distance diverge',
        mathBridge: 'Displacement = final − initial position. Distance accumulates regardless of direction.',
        caption: 'Reverse direction once and the gap between distance and |displacement| becomes obvious.',
        props: { showBoth: true },
      },
    ],
  },

  math: {
    prose: [
      'In 1D, direction is encoded by sign: positive = right (or up), negative = left (or down). ' +
        'The sign convention must be stated at the start of every problem.',
      'The five kinematic quantities and their SI units:',
    ],
    callouts: [
      { type: 'definition', title: 'Five kinematic quantities', body: 'x\\;(\\text{m}),\\quad \\Delta x\\;(\\text{m}),\\quad v\\;(\\text{m/s}),\\quad a\\;(\\text{m/s}^2),\\quad t\\;(\\text{s})' },
      { type: 'insight', title: 'Instantaneous vs average', body: 'Average velocity = slope of the secant on an x–t graph. Instantaneous velocity = slope of the tangent = dx/dt.' },
      { type: 'mnemonic', title: 'Signs encode direction', body: '+x: right/up/forward. −x: left/down/backward. Always define your positive direction before writing equations.' },
    ],
    visualizations: [
      {
        id: 'KinematicsQuantitiesExplorer',
        title: 'Set position vs time — read off all five quantities',
        mathBridge: 'Drag the start and end points on the x–t graph. All five kinematic quantities update instantly.',
        caption: 'Average velocity = rise/run on the x–t graph.',
      },
    ],
  },

  rigor: {
    prose: [
      'Formally, position is a function $x(t): \\mathbb{R} \\to \\mathbb{R}$. ' +
        'Displacement over $[t_1, t_2]$ is $\\Delta x = x(t_2) - x(t_1)$. ' +
        'Distance is $\\int_{t_1}^{t_2} |\\dot{x}(t)|\\,dt$ — the arc length of the trajectory. ' +
        'These are equal only when $\\dot{x}(t)$ does not change sign on the interval.',
    ],
    callouts: [
      { type: 'definition', title: 'Instantaneous velocity (calculus)', body: 'v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}' },
      { type: 'definition', title: 'Instantaneous acceleration', body: 'a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}' },
      { type: 'insight', title: 'Why derivatives?', body: 'The limit definition captures behaviour at a single instant. Average velocity over a shrinking interval converges to the instantaneous velocity.' },
    ],
    visualizationId: 'KinematicsDerivativeProof',
    proofSteps: [
      { expression: '\\bar{v} = \\frac{x(t+\\Delta t) - x(t)}{\\Delta t}', annotation: 'Average velocity over a small interval Δt starting at time t.' },
      { expression: 'v(t) = \\lim_{\\Delta t \\to 0} \\frac{x(t+\\Delta t) - x(t)}{\\Delta t}', annotation: 'Take the limit as Δt → 0. The secant slope becomes the tangent slope.' },
      { expression: 'v(t) = \\frac{dx}{dt}', annotation: 'This is the derivative of position with respect to time — the definition of instantaneous velocity.' },
      { expression: 'a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}', annotation: 'Apply the same limit to velocity to get acceleration — the second derivative of position.' },
    ],
    title: 'Instantaneous velocity from the limit definition',
    visualizations: [
      {
        id: 'KinematicsDerivativeProof',
        title: 'Secant → tangent as Δt → 0',
        mathBridge: 'Watch the secant line rotate toward the tangent as the interval shrinks.',
        caption: 'The slope of the tangent is the instantaneous velocity.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-001-ex1',
      title: 'Displacement vs distance',
      problem: '\\text{A runner goes 400 m east then 150 m west. Find (a) distance, (b) displacement.}',
      steps: [
        { expression: '\\text{Distance} = 400 + 150 = 550\\,\\text{m}', annotation: 'Total path length — add all segments regardless of direction.' },
        { expression: '\\Delta x = +400 + (-150) = +250\\,\\text{m east}', annotation: 'Displacement — net change, east = positive.' },
      ],
      conclusion: 'Distance 550 m; displacement 250 m east. The runner\'s final position is 250 m east of start.',
    },
    {
      id: 'ch2-001-ex2',
      title: 'Average velocity',
      problem: '\\text{A car moves from } x_i=20\\,\\text{m to }x_f=80\\,\\text{m in }\\Delta t=4\\,\\text{s. Find }\\bar{v}.}',
      steps: [
        { expression: '\\Delta x = 80 - 20 = 60\\,\\text{m}', annotation: 'Displacement.' },
        { expression: '\\bar{v} = \\frac{60}{4} = 15\\,\\text{m/s}', annotation: 'Average velocity = displacement ÷ time.' },
      ],
      conclusion: '$\\bar{v} = 15$ m/s in the positive direction.',
    },
  ],

  challenges: [
    {
      id: 'ch2-001-ch1',
      difficulty: 'easy',
      problem: '\\text{Object moves: +8 m, −3 m, +1 m. Find distance and displacement.}',
      hint: 'Distance sums absolute values. Displacement sums signed values.',
      walkthrough: [
        { expression: '\\text{Distance} = 8+3+1 = 12\\,\\text{m}', annotation: 'Always positive.' },
        { expression: '\\Delta x = 8-3+1 = +6\\,\\text{m}', annotation: 'Signs kept.' },
      ],
      answer: '\\text{Distance}=12\\,\\text{m},\\quad \\Delta x = +6\\,\\text{m}',
    },
    {
      id: 'ch2-001-ch2',
      difficulty: 'medium',
      problem: '\\text{A ball moves from }x=5\\,\\text{m to }x=-3\\,\\text{m in 2 s. Find }\\bar{v}\\text{ and average speed if path length = 10 m.}',
      hint: 'Displacement can be negative; speed cannot.',
      walkthrough: [
        { expression: '\\Delta x = -3 - 5 = -8\\,\\text{m}', annotation: 'Displacement is negative (moved in −x direction).' },
        { expression: '\\bar{v} = -8/2 = -4\\,\\text{m/s}', annotation: 'Negative velocity means moving in −x direction.' },
        { expression: '\\text{avg speed} = 10/2 = 5\\,\\text{m/s}', annotation: 'Speed uses total path length — always positive.' },
      ],
      answer: '\\bar{v} = -4\\,\\text{m/s},\\quad \\text{avg speed} = 5\\,\\text{m/s}',
    },
  ],
}
