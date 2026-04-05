export default {
  id: 'cnc-linear-motion',
  slug: 'linear-interpolation',
  chapter: 'cnc-1',
  order: 9,
  title: 'Linear Interpolation',
  subtitle: 'Rapid (G00) vs. Linear (G01)',
  tags: ['G00', 'G01', 'feedrate', 'modal', 'axes'],

  semantics: {
    core: [
      { symbol: 'G00', meaning: 'Rapid Motion: Move all axes at the machine\'s maximum speed to a target point.' },
      { symbol: 'G01', meaning: 'Linear Interpolation: Move the tool in a straight line at a controlled speed (Feedrate).' },
      { symbol: 'F (Feed)', meaning: 'Specifies the speed of a G01 move (usually Inches Per Minute or mm/min).' },
      { symbol: 'N (Sequence)', meaning: 'An optional line number for organizing or searching code.' },
    ],
    rulesOfThumb: [
      'G00 is for "In the air" moves only. Never use G00 while cutting material.',
      'A G00 move often follows a "dog-leg" path depending on the servo speeds.',
      'Feedrates (F) are modal—once set, they stay active until changed.',
    ]
  },

  hook: {
    question: 'How does a machine coordinate multiple motors to move in a perfectly straight line at a controlled speed?',
    realWorldContext:
      'If you move your hand to grab a coffee cup, your brain coordinates your shoulder, elbow, and wrist simultaneously. ' +
      'In CNC, the **Motion Planner** does this for the motors. If you want to move 10 inches in X and only 1 inch in Y, the X motor must run 10 times faster than the Y motor. ' +
      'This coordination is called **Linear Interpolation (G01)**.',
   
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(RECTANGLE PATH) \nG00 X0 Y0 \nG01 X5.0 F50.0 \nY3.0 \nX0.0 \nY0.0'
        },
        title: 'Linear Motion Lab',
        caption: 'Watch the DRO and the 3D plot. Notice how X and Y update. The "F" value controls the speed. If you change a line to G00, it ignores the F-value and jumps at max speed.'
      }
    ],
    prose: [
      'Think of your machine as a car. **G00 is the Highway**: You want to get to the destination as fast as possible. You don\'t care about the exact path, just the endpoint. **G01 is the Paintbrush**: You are applying a tool to a surface at a specific speed to ensure a clean finish.',

      '**The Modal Secret**: CNC controllers are lazy. They don\'t want to read things twice. If you say `G01` on line 1, every line after that is assumed to be `G01` until you say `G00`. This is the "Modal State". It keeps programs small and readable.',

      '**Dog-Leg Rapids**: Be careful with G00! Most machines move all axes at their max speed independently. If one axis is shorter, it finishes first. The resulting path is a weird "dog-leg" or hockey-stick shape, NOT a straight line. Only G01 guarantees a straight-line path.',
    ],
  },

  math: {
    prose: [
      'During a G01 move from $(x_1, y_1)$ to $(x_2, y_2)$ at feedrate $F$, the controller decomposes the total velocity into components for each axis.',
      
      'First, it calculates the total distance $D$:',
      '$$D = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$',

      'Next, it calculates the time $T$ required for the move:',
      '$$T = D / F$$',

      'Finally, it sets the velocity for each axis ($V_x, V_y, V_z$):',
      '$$V_x = (x_2 - x_1) / T$$',
      '$$V_y = (y_2 - y_1) / T$$',
      
      'The result is that every point on the path $(x,y,z)$ is reached at the exact same moment across all motors, creating a perfect straight line.',
    ],
  },

  rigor: {
    prose: [
      '**Exact Stop vs. Lookahead**: By default, a machine might stop briefly after every line (G61). However, to keep motion smooth, we use **Lookahead (G64)**. The controller "merges" the end of one move into the start of the next.',
      
      '**Servo Lag**: No motor is perfect. There is always a tiny delay between the command and the motion. The "Following Error" is the distance between where the tool is and where it *should* be. If this error gets too high, the machine triggers an Emergency Stop (E-Stop).',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-modal-rapid',
      title: 'Rapid vs. Feed Logic',
      problem: 'Analyze the sequence: N10 G00 X1 Y1, N20 G01 X5 F20, N30 Y2. What is the state at N30?',
      code: 'N10 G00 X1.0 Y1.0 \nN20 G01 X5.0 F20.0 \nN30 Y2.0',
      steps: [
        { expression: 'N10', annotation: 'Mode: Rapid. Speed: Max. Position: (1,1).' },
        { expression: 'N20', annotation: 'Mode: Linear. Speed: 20 per minute. Position: (5,1).' },
        { expression: 'N30', annotation: 'Mode: Linear (Modal!). Speed: 20 (Modal!). Position: (5,2).' },
      ],
      conclusion: 'The Y-axis move is performed as a controlled G01 cut, even though G01 wasn\'t re-typed.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-linear-1',
        type: 'choice',
        text: 'Which code should you use when the tool is touching the material?',
        options: ['G00', 'G01', 'G04', 'M06'],
        answer: 'G01',
      },
      {
        id: 'cnc-linear-2',
        type: 'input',
        text: 'If G01 is active, which letter represents the speed? ',
        answer: 'F',
      },
    ]
  },

  mentalModel: [
    'G00 = Highway Speed',
    'G01 = Constant Cut',
    'Modal = Sticky Settings',
    'Interpolation = Coordinated axis math',
  ],
}
