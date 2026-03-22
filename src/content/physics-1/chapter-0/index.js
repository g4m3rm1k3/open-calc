export const CH0_LESSONS = [
  {
    id: 'p0-001',
    slug: 'what-is-physics',
    chapter: 'p0',
    order: 0,
    title: 'What is Physics? (Modeling Reality)',
    subtitle: 'How equations model reality, not reality itself.',
    tags: ['modeling', 'assumptions', 'prediction'],
    hook: {
      question: 'How do we predict the future of a system using math?',
      realWorldContext: 'Engineers, athletes, and pilots all use simplified models that ignore some details to make fast and useful predictions.',
      previewVisualizationId: 'ModelVsReality',
    },
    intuition: {
      prose: [
        'Physics is a model-building language. We intentionally simplify the world so we can compute, explain, and predict.',
        'A model keeps dominant causes and temporarily drops weak effects. Ignoring air resistance or treating an object as a point mass are useful simplifications that create solvable first models.',
        'The purpose of a model is not to be perfectly realistic. The purpose is to preserve the key causal structure so predictions are directionally and numerically useful.',
        'Good physics always asks two follow-up questions: what assumptions did we make, and when do those assumptions stop being valid?',
      ],
      callouts: [
        {
          type: 'insight',
          title: 'Pattern First',
          body: 'Model -> Equation -> Prediction -> Check against reality.',
        },
      ],
      visualizations: [
        {
          id: 'ModelVsReality',
          title: 'Model vs Reality',
          mathBridge: 'Toggling drag changes the governing equation and therefore the predicted trajectory.',
          caption: 'Same initial drop, different assumptions.',
          props: { showAirResistance: false },
        },
      ],
    },
    math: {
      prose: [
        'We define position by the function $x(t)$: input is time $t$ in seconds, output is position $x$ in meters.',
        'If time increases, the model outputs a new position value. The function itself is the rule mapping cause (time) to effect (position).',
        'Variable meaning: $t$ tells when, $x$ tells where. Unit meaning: seconds for $t$, meters for $x$. Behavior meaning: if $x(t)$ grows faster, motion is faster in that interval.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Variable Meaning and Units',
          body: '$t$: time (s), $x$: position (m), $x(t)$: predicted position at time $t$.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-001-ex1',
        title: 'Predicting a Fall with an Ideal Model',
        problem: '\\text{Given } x(t)=5t^2, \\text{ find } x(2).',
        steps: [
          {
            expression: 'x(2)=5(2)^2',
            annotation: 'Substitute the input time $t=2$ s.',
          },
          {
            expression: 'x(2)=20',
            annotation: 'The model predicts 20 meters.',
          },
        ],
        conclusion: 'Predictions are only as good as assumptions.',
      },
    ],
    challenges: [
      {
        id: 'p0-001-ch1',
        difficulty: 'easy',
        problem: '\\text{Name one simplification in an ideal free-fall model.}',
        hint: 'Think about effects the model ignores.',
        answer: 'Ignoring air resistance (or treating the object as a point mass).',
      },
      {
        id: 'p0-001-ch2',
        difficulty: 'medium',
        problem: '\\text{If drag is strong, does } x(t)=5t^2 \\text{ overestimate or underestimate fall distance?}',
        hint: 'Drag slows falling speed.',
        answer: 'It overestimates distance because real motion falls less than the vacuum model.',
      },
    ],
  },
  {
    id: 'p0-002',
    slug: 'units-dimensions-scaling',
    chapter: 'p0',
    order: 1,
    title: 'Units, Dimensions, and Scaling',
    subtitle: 'Every valid equation must be dimensionally consistent.',
    tags: ['units', 'dimensions', 'scaling'],
    hook: {
      question: 'Why is $5\\text{ m} + 10\\text{ s}$ meaningless?',
      realWorldContext: 'Unit mistakes have crashed spacecraft and broken engineering systems. Units are safety checks for thought.',
      previewVisualizationId: 'UnitValidator',
    },
    intuition: {
      prose: [
        'Dimensions are the physical type of a quantity: length [L], mass [M], time [T].',
        'Units are labels (m, kg, s), while dimensions are structure. Different units can represent the same dimension, but incompatible dimensions cannot be added.',
        'If left and right sides of an equation do not match dimensionally, the equation cannot represent reality no matter how neat it looks algebraically.',
        'Dimensional checks are fast sanity tests: they catch conceptual mistakes before you waste time on arithmetic.',
      ],
      visualizations: [
        {
          id: 'UnitValidator',
          title: 'Live Unit Checker',
          mathBridge: 'The visual validates whether dimensions balance in real time.',
          caption: 'Build equations and test dimensional homogeneity.',
        },
      ],
    },
    math: {
      prose: [
        'Velocity has dimensions $[v]=\\frac{L}{T}$ and units m/s. This means larger distance per same time or same distance in less time both increase speed.',
        'Dimensional analysis does not tell you exact constants, but it strongly constrains legal equation forms.',
        'Edge-case interpretation: formulas can be numerically plausible and still physically impossible if units do not balance.',
      ],
      callouts: [
        {
          type: 'theorem',
          title: 'Homogeneity Rule',
          body: '[\\text{LHS}] = [\\text{RHS}]',
        },
      ],
    },
    examples: [
      {
        id: 'p0-002-ex1',
        title: 'Testing a Suspicious Formula',
        problem: '\\text{Check if } d = vt^2 \\text{ is dimensionally valid.}',
        steps: [
          {
            expression: '[d]=[L]',
            annotation: 'Distance must have length dimension.',
          },
          {
            expression: '[vt^2]=\\frac{L}{T}\\cdot T^2 = LT',
            annotation: 'Right side simplifies to $LT$, not $L$.',
          },
          {
            expression: '[L]\\neq[LT]',
            annotation: 'So the formula fails dimensional consistency.',
          },
        ],
        conclusion: 'A formula can look algebraically clean but still be physically impossible.',
      },
    ],
    challenges: [
      {
        id: 'p0-002-ch1',
        difficulty: 'easy',
        problem: '\\text{What are the dimensions of acceleration?}',
        hint: 'Acceleration is change in velocity over time.',
        answer: '$[a]=L/T^2$.',
      },
      {
        id: 'p0-002-ch2',
        difficulty: 'medium',
        problem: '\\text{Why can } x = vt + \\frac{1}{2}at^2 \\text{ be added term-by-term?}',
        hint: 'Check dimensions of both terms.',
        answer: 'Both $vt$ and $at^2$ reduce to length, so addition is valid.',
      },
    ],
  },
  {
    id: 'p0-003',
    slug: 'variables-and-functions',
    chapter: 'p0',
    order: 2,
    title: 'Variables and Functions in Physics',
    subtitle: 'How physical quantities depend on each other.',
    tags: ['functions', 'variables', 'x(t)', 'v(t)', 'a(t)'],
    hook: {
      question: 'What does it mean to say position depends on time?',
      realWorldContext: 'GPS navigation continuously maps time to location, speed, and acceleration.',
      previewVisualizationId: 'FunctionMachine',
    },
    intuition: {
      prose: [
        'Physics uses functions to describe dependence: one quantity changes because another changes.',
        'A function is not just notation. It is a causal contract telling you what output you get for every allowed input.',
        'In early mechanics, time is the universal input and position, velocity, and acceleration are outputs.',
        'When a student says "I know the formula," the deeper question is whether they can explain the dependency graph among variables.',
      ],
      visualizations: [
        {
          id: 'FunctionMachine',
          title: 'Function Machine',
          mathBridge: 'Input slider controls $t$; outputs update as $x(t)$ changes.',
          caption: 'Cause (time) to effect (position).',
        },
      ],
    },
    math: {
      prose: [
        'Core notation: $x(t)$ for position (m), $v(t)$ for velocity (m/s), and $a(t)$ for acceleration (m/s$^2$).',
        'If $t$ increases, these outputs update according to the model rule, which may be linear, curved, periodic, or piecewise.',
        'Interpretation rule: when a function output rises with $t$, that physical quantity is increasing over time.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Independent vs Dependent',
          body: '$t$ is independent. $x, v, a$ are dependent variables in basic kinematics models.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-003-ex1',
        title: 'Reading a Function Value',
        problem: '\\text{If } x(t)=2t+1, \\text{ what is } x(3)?',
        steps: [
          {
            expression: 'x(3)=2(3)+1',
            annotation: 'Insert $t=3$ s into the mapping.',
          },
          {
            expression: 'x(3)=7',
            annotation: 'Output is 7 meters.',
          },
        ],
        conclusion: 'A function is a rule that converts input to physical output.',
      },
    ],
    challenges: [
      {
        id: 'p0-003-ch1',
        difficulty: 'easy',
        problem: '\\text{Which is independent in } x(t): x \\text{ or } t?',
        hint: 'The independent variable is the input.',
        answer: '$t$ is independent.',
      },
      {
        id: 'p0-003-ch2',
        difficulty: 'medium',
        problem: '\\text{If } x(t) \\text{ is in meters and } t \\text{ is in seconds, what are units of slope of } x\\text{-}t \\text{ graph?}',
        hint: 'Slope is output over input.',
        answer: 'm/s, which is velocity.',
      },
    ],
  },
  {
    id: 'p0-004',
    slug: 'average-vs-instantaneous-change',
    chapter: 'p0',
    order: 3,
    title: 'Change: Average vs Instantaneous',
    subtitle: 'From secant slope to tangent slope.',
    tags: ['limits', 'derivative', 'velocity'],
    hook: {
      question: 'Why is average speed not enough for real-time control?',
      realWorldContext: 'Braking systems, autonomous driving, and robotics need instantaneous change, not delayed averages.',
      previewVisualizationId: 'SecantToTangent',
    },
    intuition: {
      prose: [
        'Average velocity over an interval blurs detail. It tells what happened across a chunk of time, not at one moment.',
        'For safety systems and control loops, that blur is often too slow. They require local, immediate change information.',
        'When we zoom into a tiny interval, curved motion starts to look linear. This local linearity motivates instantaneous velocity.',
        'Calculus enters exactly here: it formalizes the zoom process instead of treating it as a hand-wave.',
      ],
      visualizations: [
        {
          id: 'SecantToTangent',
          title: 'Secant to Tangent',
          mathBridge: 'Shrinking $\\Delta t$ moves secant slope toward tangent slope.',
          caption: 'Limit process made visual.',
          props: { functionType: 'parabola' },
        },
      ],
    },
    math: {
      prose: [
        'Average velocity: $v_{avg}=\\frac{\\Delta x}{\\Delta t}$ with units m/s over a finite interval.',
        'Instantaneous velocity: $v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}$. As the time window shrinks, the estimate approaches local slope.',
        'Interpretation: if instantaneous velocity changes sign, direction changes; if magnitude grows, motion becomes faster at that instant.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Interpretation',
          body: '$v>0$ means position increases; larger magnitude means faster position change per second.',
        },
      ],
    },
    rigor: {
      title: 'From Slope Definition to Instantaneous Velocity',
      visualizationId: 'SecantToTangent',
      proofSteps: [
        {
          expression: 'v_{avg}=\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Start with average change over finite interval.',
        },
        {
          expression: 'v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Shrink interval to approach local slope.',
        },
        {
          expression: 'v=\\frac{dx}{dt}',
          annotation: 'Derivative notation for instantaneous velocity.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-004-ex1',
        title: 'Average Velocity on an Interval',
        problem: '\\text{If } x(t)=t^2, \\text{ compute } v_{avg} \\text{ from } t=1 \\text{ to } t=3.',
        steps: [
          {
            expression: 'v_{avg}=\\frac{x(3)-x(1)}{3-1}',
            annotation: 'Use endpoint positions.',
          },
          {
            expression: 'v_{avg}=\\frac{9-1}{2}=4',
            annotation: 'Average velocity is 4 m/s.',
          },
        ],
        conclusion: 'Instantaneous velocity at a specific time may differ from the interval average.',
      },
    ],
    challenges: [
      {
        id: 'p0-004-ch1',
        difficulty: 'easy',
        problem: '\\text{What does shrinking } \\Delta t \\text{ represent physically?}',
        hint: 'Think about zooming in time.',
        answer: 'Looking at motion over smaller and smaller time windows around one instant.',
      },
      {
        id: 'p0-004-ch2',
        difficulty: 'medium',
        problem: '\\text{For } x(t)=t^2, \\text{ estimate } v(2) \\text{ using } \\Delta t=0.1.',
        hint: 'Compute $[x(2.1)-x(2)]/0.1$.',
        answer: 'Approximately 4.1 m/s (close to exact value 4 m/s).',
      },
    ],
  },
  {
    id: 'p0-005',
    slug: 'graphs-as-physical-objects',
    chapter: 'p0',
    order: 4,
    title: 'Graphs as Physical Objects',
    subtitle: 'Slope and area carry physical meaning.',
    tags: ['graphs', 'slope', 'area', 'interpretation'],
    hook: {
      question: 'How can a graph predict motion without seeing the object?',
      realWorldContext: 'Sensor dashboards and telemetry are interpreted through graph shape, slope, and area every second.',
      previewVisualizationId: 'GraphInterpreter',
    },
    intuition: {
      prose: [
        'A graph is a compressed story of motion. Geometry on the graph maps to physics in the world.',
        'On a position-time graph, slope is velocity. On a velocity-time graph, area under the curve is displacement.',
        'This is why graph reading is not optional in physics. It is the bridge between qualitative behavior and quantitative prediction.',
        'Changing shape means changing mechanism: flat regions, sharp bends, and curvature each encode different motion behavior.',
      ],
      visualizations: [
        {
          id: 'GraphInterpreter',
          title: 'Graph Interpreter',
          mathBridge: 'Cursor time changes local slope and accumulated area values in real time.',
          caption: 'Shape to meaning mapping.',
        },
      ],
    },
    math: {
      prose: [
        '$\\frac{dx}{dt}$ gives instantaneous velocity (m/s). Steeper positive slope means larger positive velocity.',
        '$\\int v(t)dt$ accumulates displacement (m). If velocity is zero, area does not grow.',
        'Edge behavior: negative velocity contributes signed negative area, meaning displacement can decrease even while time increases.',
      ],
      callouts: [
        {
          type: 'insight',
          title: 'Edge Case',
          body: 'Flat position graph means slope 0, so velocity 0 even though time continues.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-005-ex1',
        title: 'Flat vs Steep Position Graph',
        problem: '\\text{Interpret two segments: one flat and one steep positive.}',
        steps: [
          {
            expression: '\\text{flat segment} \\Rightarrow \\frac{dx}{dt}=0',
            annotation: 'Object is at rest.',
          },
          {
            expression: '\\text{steep positive segment} \\Rightarrow \\frac{dx}{dt}\\text{ large and positive}',
            annotation: 'Object moves quickly in positive direction.',
          },
        ],
        conclusion: 'Graph steepness directly communicates speed and direction.',
      },
    ],
    challenges: [
      {
        id: 'p0-005-ch1',
        difficulty: 'easy',
        problem: '\\text{If slope on } x\\text{-}t \\text{ graph is negative, what is sign of velocity?}',
        hint: 'Velocity sign follows slope sign.',
        answer: 'Negative velocity.',
      },
      {
        id: 'p0-005-ch2',
        difficulty: 'medium',
        problem: '\\text{Can velocity be zero while acceleration is nonzero?}',
        hint: 'Think of turning points.',
        answer: 'Yes. At a peak, velocity can be 0 while acceleration is still nonzero.',
      },
    ],
  },
  {
    id: 'p0-006',
    slug: 'vectors-vs-scalars',
    chapter: 'p0',
    order: 5,
    title: 'Vectors vs Scalars',
    subtitle: 'Magnitude alone is not enough for motion.',
    tags: ['vectors', 'scalars', 'components'],
    hook: {
      question: 'Can two objects have same speed but different velocity?',
      realWorldContext: 'Air traffic control tracks direction and speed separately because collision risk depends on vector velocity.',
      previewVisualizationId: 'VectorBuilder',
    },
    intuition: {
      prose: [
        'Scalars only tell how much: mass, temperature, speed.',
        'Vectors tell how much and where: displacement, velocity, force. Direction changes the physical outcome.',
        'Two cars can each move at 20 m/s and still approach each other, separate, or travel parallel depending on velocity direction.',
        'Component form turns directional ideas into computable pieces you can add, compare, and resolve.',
      ],
      visualizations: [
        {
          id: 'VectorBuilder',
          title: 'Vector Builder',
          mathBridge: 'Dragging the tip updates $v_x$, $v_y$, magnitude, and angle.',
          caption: 'Components are coordinates of direction-aware motion.',
        },
      ],
    },
    math: {
      prose: [
        'Write velocity vector as $\\vec v=(v_x,v_y)$ with component units m/s.',
        'Increasing $v_x$ shifts motion rightward; increasing $v_y$ shifts motion upward.',
        'Magnitude is $|\\vec v|=\\sqrt{v_x^2+v_y^2}$, but magnitude alone cannot distinguish opposite directions.',
      ],
      callouts: [
        {
          type: 'definition',
          title: 'Speed vs Velocity',
          body: 'Speed is scalar magnitude $|\\vec v|$. Velocity includes direction and components.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-006-ex1',
        title: 'Same Speed, Different Direction',
        problem: '\\text{Compare } \\vec v_1=(3,4) \\text{ and } \\vec v_2=(-3,4).',
        steps: [
          {
            expression: '|\\vec v_1|=|\\vec v_2|=5',
            annotation: 'Same speed by Pythagorean magnitude.',
          },
          {
            expression: '\\vec v_1 \\neq \\vec v_2',
            annotation: 'Different $x$ direction means different velocity vectors.',
          },
        ],
        conclusion: 'Equal speed does not imply equal velocity.',
      },
    ],
    challenges: [
      {
        id: 'p0-006-ch1',
        difficulty: 'easy',
        problem: '\\text{Is temperature a scalar or vector?}',
        hint: 'Does it have direction?',
        answer: 'Scalar.',
      },
      {
        id: 'p0-006-ch2',
        difficulty: 'medium',
        problem: '\\text{If } \\vec v=(0,-6), \\text{ what is direction of motion?}',
        hint: 'Negative $y$ component.',
        answer: 'Straight downward along negative y-axis.',
      },
    ],
  },
  {
    id: 'p0-007',
    slug: 'coordinate-systems-and-frames',
    chapter: 'p0',
    order: 6,
    title: 'Coordinate Systems and Reference Frames',
    subtitle: 'Motion depends on who is observing.',
    tags: ['reference frame', 'relative motion', 'coordinates'],
    hook: {
      question: 'Is an object at rest or moving?',
      realWorldContext: 'A passenger sitting on a train is at rest in train frame and moving in ground frame at the same time.',
      previewVisualizationId: 'FrameSwitcher',
    },
    intuition: {
      prose: [
        'Position is always measured relative to a chosen origin and coordinate axes.',
        'There is no absolute position in classical mechanics; statements about motion need a reference frame.',
        'A passenger can be stationary in the train frame and moving quickly in the ground frame without contradiction.',
        'Frame choice changes coordinate values, not physical events. Physics is in the relations, not a privileged observer.',
      ],
      visualizations: [
        {
          id: 'FrameSwitcher',
          title: 'Train and Ground Frames',
          mathBridge: 'Switching frame changes coordinate values while physical event stays the same.',
          caption: 'Same event, different coordinate descriptions.',
        },
      ],
    },
    math: {
      prose: [
        'Relative velocity in 1D is $v_{A/B}=v_A-v_B$ (all in m/s).',
        'If observer speed increases in the same direction, measured relative speed decreases.',
        'Sign convention matters: swapping observer and object reverses sign, clarifying who is moving relative to whom.',
      ],
      callouts: [
        {
          type: 'insight',
          title: 'No Absolute Rest',
          body: 'Rest and motion are frame-dependent descriptions.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-007-ex1',
        title: 'Walking in a Moving Train',
        problem: '\\text{Train speed is } 20\\,m/s \\text{ right. Passenger walks } 2\\,m/s \\text{ right relative to train. Find passenger speed relative to ground.}',
        steps: [
          {
            expression: 'v_{passenger/ground}=v_{passenger/train}+v_{train/ground}',
            annotation: 'Use frame composition in same direction.',
          },
          {
            expression: 'v_{passenger/ground}=2+20=22\\,m/s',
            annotation: 'Ground observer sees 22 m/s to the right.',
          },
        ],
        conclusion: 'Frame choice changes measured velocity values.',
      },
    ],
    challenges: [
      {
        id: 'p0-007-ch1',
        difficulty: 'easy',
        problem: '\\text{A bag sits on train floor. Is it moving in train frame?}',
        hint: 'Compare bag to train interior.',
        answer: 'No, it is at rest in train frame.',
      },
      {
        id: 'p0-007-ch2',
        difficulty: 'medium',
        problem: '\\text{Can the same object be at rest and moving at once?}',
        hint: 'Different observers.',
        answer: 'Yes, depending on reference frame.',
      },
    ],
  },
  {
    id: 'p0-008',
    slug: 'algebra-vs-calculus-physics',
    chapter: 'p0',
    order: 7,
    title: 'Algebra vs Calculus in Physics',
    subtitle: 'Finite-step reasoning versus local predictive modeling.',
    tags: ['algebra', 'calculus', 'limits', 'derivative'],
    hook: {
      question: 'Why does physics move from average values to derivatives?',
      realWorldContext: 'Real control systems need local predictions each instant, not only block averages over long intervals.',
      previewVisualizationId: 'DiscreteVsContinuous',
    },
    intuition: {
      prose: [
        'Algebra-based physics works with finite chunks: average speed across intervals and piecewise updates.',
        'Those finite chunks are often enough for rough estimates but can hide fast local changes.',
        'Calculus-based physics takes interval size toward zero and models local change continuously, improving prediction and control.',
        'In practice, calculus is the limit of repeated algebraic refinement, not a separate universe.',
      ],
      visualizations: [
        {
          id: 'DiscreteVsContinuous',
          title: 'Stepwise vs Continuous Motion',
          mathBridge: 'Smaller step size makes discrete updates approach continuous curve behavior.',
          caption: 'Finite approximation converges toward calculus model.',
        },
      ],
    },
    math: {
      prose: [
        'Average velocity over interval: $v_{avg}=\\frac{\\Delta x}{\\Delta t}$ (m/s).',
        'Derivative velocity at an instant: $v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}=\\frac{dx}{dt}$.',
        'As $\\Delta t$ gets smaller, approximation error decreases and local predictions become more reliable.',
      ],
      callouts: [
        {
          type: 'proof-map',
          title: 'Derivation Flow',
          body: 'Average ratio -> shrink interval -> limit -> derivative.',
        },
      ],
    },
    rigor: {
      title: 'Average to Instantaneous as a Limit Process',
      visualizationId: 'DiscreteVsContinuous',
      proofSteps: [
        {
          expression: 'v_{avg}=\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Start with finite interval ratio.',
        },
        {
          expression: '\\Delta t \\to 0',
          annotation: 'Refine interval to local neighborhood.',
        },
        {
          expression: 'v=\\lim_{\\Delta t\\to 0}\\frac{\\Delta x}{\\Delta t}',
          annotation: 'Define instantaneous velocity through limit.',
        },
        {
          expression: 'v=\\frac{dx}{dt}',
          annotation: 'Compact derivative notation used throughout physics.',
        },
      ],
    },
    examples: [
      {
        id: 'p0-008-ex1',
        title: 'Discrete Approximation Improves with Smaller Step',
        problem: '\\text{For } x(t)=t^2, \\text{ compare average velocity near } t=2 \\text{ using } \\Delta t=1 \\text{ and } 0.01.',
        steps: [
          {
            expression: '\\Delta t=1: \\frac{x(3)-x(2)}{1}=5',
            annotation: 'Coarse interval gives rough estimate.',
          },
          {
            expression: '\\Delta t=0.01: \\frac{x(2.01)-x(2)}{0.01}=4.01',
            annotation: 'Smaller interval approaches exact instantaneous value 4.',
          },
        ],
        conclusion: 'Calculus emerges as the limit of increasingly fine algebraic approximations.',
      },
    ],
    challenges: [
      {
        id: 'p0-008-ch1',
        difficulty: 'easy',
        problem: '\\text{Which framework is local: algebra averages or calculus derivatives?}',
        hint: 'Local means at an instant.',
        answer: 'Calculus derivatives are local.',
      },
      {
        id: 'p0-008-ch2',
        difficulty: 'medium',
        problem: '\\text{Why does reducing } \\Delta t \\text{ improve predictive accuracy?}',
        hint: 'Think about how quickly slopes can change.',
        answer: 'Smaller intervals better capture local behavior and reduce averaging error.',
      },
    ],
  },
]

const CH0 = {
  title: 'Orientation: Physics Interface',
  number: 'p0',
  slug: 'orientation',
  description: 'Bridge the gap between math syntax and physical reality.',
  lessons: CH0_LESSONS
}

export default CH0
