export default {
  id: 'cnc-machine-axes',
  slug: 'machine-axes',
  chapter: 'cnc-1',
  order: 1,
  title: 'Machine Axes',
  subtitle: 'The Cartesian Grid That Rules the Machine',
  tags: ['axes', 'X Y Z', 'A B C', 'right-hand rule', 'mill', 'lathe', 'coordinate system'],

  semantics: {
    core: [
      { symbol: 'X', meaning: 'Left–right axis (on a VMC: table moves left/right, or spindle moves left/right depending on machine design).' },
      { symbol: 'Y', meaning: 'Front–back axis (in/out from the operator on a VMC).' },
      { symbol: 'Z', meaning: 'Up–down axis: the spindle axis. Positive Z moves the tool away from the part (up on a VMC).' },
      { symbol: 'A', meaning: 'Rotary axis around the X-axis (tilting in the Y–Z plane).' },
      { symbol: 'B', meaning: 'Rotary axis around the Y-axis (tilting in the X–Z plane).' },
      { symbol: 'C', meaning: 'Rotary axis around the Z-axis (rotation in the X–Y plane, like a rotary table or live tooling on a lathe).' },
      { symbol: 'Machine Zero', meaning: 'The fixed hardware home position, defined by physical limit switches. G53 coordinates reference this point.' },
      { symbol: 'Work Zero', meaning: 'The user-defined origin for a specific part setup, stored in work offsets (G54–G59).' },
    ],
    rulesOfThumb: [
      'Z is always the spindle axis. Positive Z always moves the tool away from the part — safety direction.',
      'Right-hand rule: point your right thumb along an axis, your fingers curl in the positive rotation direction for that rotary axis.',
      'On a VMC, the table moves, not the spindle, in X and Y. But in G-code we always program the tool position, not the table position.',
    ]
  },

  hook: {
    question: 'When you type X1.0 in a G-code program, which direction does the machine move — and how does it know?',
    realWorldContext:
      'A CNC machine is a 3D Cartesian robot. Every point in the working volume of the machine is described by a set of signed numbers: X, Y, and Z coordinates. ' +
      'The machine\'s controller maintains a running position register — a live readout called the **DRO (Digital Readout)** — showing exactly where the tool tip is at all times. ' +
      'When you command X1.0, you are telling the controller: "move until the X register reads 1.0000". ' +
      'Understanding the axis convention for your machine type is the first requirement for writing any G-code correctly.',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(AXIS EXPLORATION LAB)\n' +
            '(Move one axis at a time. Watch the DRO.)\n' +
            '\n' +
            'G00 X0 Y0 Z0     (Return to work zero)\n' +
            'G01 X3.0 F50     (Move in +X direction only)\n' +
            'G00 X0           (Return X to zero)\n' +
            'G01 Y2.0 F50     (Move in +Y direction only)\n' +
            'G00 Y0           (Return Y to zero)\n' +
            'G01 Z-1.0 F25    (Plunge: move in -Z direction)\n' +
            'G00 Z0           (Retract: move in +Z direction)'
        },
        title: 'Axis Motion Lab',
        caption: 'Run each move and watch the 3D backplot and the DRO values. Notice Z-1.0 goes DOWN (toward the part) while Z0 returns UP. Positive Z is always the safe direction.',
      }
    ],
    prose: [
      '**The Cartesian System**: CNC machines use the same X/Y/Z coordinate system you learned in math class. The origin (0, 0, 0) is a reference point. Positive X is typically to the right, positive Y is typically away from the operator (back of the machine), and positive Z is up — away from the part. Every move in G-code is just a command to reach a new coordinate.',

      '**Mill vs Lathe Axes**:\n' +
      'On a **Vertical Machining Center (VMC)**, X and Y control the table position (left/right, in/out), and Z controls the spindle height. In G-code, we always program the *tool* position — so even though the *table* moves, G-code says X3.0 to mean "the tool should be 3.0 inches to the right of work zero".\n' +
      'On a **CNC Lathe**, there are only two primary axes: **Z** (along the spindle centerline, left/right) and **X** (diameter direction, in/out from the spindle centerline). The X-axis on a lathe uses a *diameter convention* — X2.0 means the part diameter is 2.0 inches, not the radius.',

      '**The Right-Hand Rule for Rotary Axes**: Point your right thumb in the positive direction of a linear axis. Your fingers curl in the positive rotation direction for the corresponding rotary axis. Thumb along +X → fingers curl in +A direction. This is standardized across all CNC machines — A rotates around X, B around Y, C around Z.',

      '**Machine Zero vs Work Zero**: The machine has a hardware home position called **Machine Zero** (or Machine Reference, G53). This is defined by physical limit switches and never changes — it is a fixed property of the machine. Your *part*, however, can be clamped anywhere on the table. You define **Work Zero** (G54) relative to your part. All your G-code programs reference Work Zero, not Machine Zero. The controller automatically adds the offset between them.',

      '**The DRO (Digital Readout)**: Every CNC machine has a live position display. It shows the current position in one of three modes: Machine Coordinates (G53), Work Coordinates (relative to the active G54), or Distance-to-Go. Learning to read the DRO instantly is a fundamental shop skill — it tells you exactly where the tool is at any moment.',
    ],
  },

  math: {
    prose: [
      'The machine stores position as a vector in 3D space:',
      '$$\\mathbf{P} = (x, y, z)$$',
      'A displacement (motion) is also a vector:',
      '$$\\Delta\\mathbf{P} = (x_2 - x_1,\\; y_2 - y_1,\\; z_2 - z_1)$$',
      'The total distance traveled during a linear move is the Euclidean norm of this vector:',
      '$$D = \\|\\Delta\\mathbf{P}\\| = \\sqrt{(\\Delta x)^2 + (\\Delta y)^2 + (\\Delta z)^2}$$',
      'The controller uses this distance to calculate how long the move will take at a given feedrate $F$:',
      '$$T = \\frac{D}{F}$$',
      'Every axis velocity is then computed so all axes arrive at the target simultaneously:',
      '$$V_x = \\frac{\\Delta x}{T}, \\quad V_y = \\frac{\\Delta y}{T}, \\quad V_z = \\frac{\\Delta z}{T}$$',
      'This is the mathematical core of **linear interpolation** — coordinated multi-axis motion along a straight line.',
    ],
  },

  rigor: {
    prose: [
      '**Axis Labeling by Machine Builder**: The EIA/ISO standard defines axis conventions, but individual machine builders sometimes deviate — especially for non-standard configurations like gantry mills, horizontal machining centers, or Swiss-type lathes. Always consult the machine\'s maintenance manual to verify axis orientation before running a new machine for the first time.',

      '**Table-Moves vs Spindle-Moves**: On most VMCs, X and Y are table axes (the table moves, the spindle is fixed in X/Y). Some machines invert this (spindle moves in X, table moves in Y). The G-code convention always programs the *relative position of the tool with respect to the part*, so the direction of actual motor motion may be reversed internally. The controller handles this — you program tool position, it figures out which motor to move.',

      '**Rotary Axis Conventions on Lathes**: Live tooling on a lathe adds a C-axis (spindle rotation at a controlled angle). Some lathes also add a Y-axis for off-center features. Multi-tasking machines (mill-turn or turn-mill) combine all axes of a mill and lathe in one machine.',

      '**Travel Limits**: Every axis has a software and hardware travel limit. If you command a position beyond the limit, the controller triggers an overtravel alarm and stops. Software limits are set in parameters. Hardware limits are physical switches. Always understand the travel envelope before running an unfamiliar program.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-axis-move',
      title: 'Reading the DRO After a Diagonal Move',
      problem: 'The tool starts at X0 Y0 Z0. You command G01 X4.0 Y3.0. What does the DRO show after the move, and how far did the tool travel?',
      steps: [
        { expression: 'Start: (0, 0, 0)', annotation: 'DRO reads X0.0000, Y0.0000, Z0.0000.' },
        { expression: 'Command: G01 X4.0 Y3.0', annotation: 'Target: X=4.0, Y=3.0, Z unchanged at 0.' },
        { expression: 'D = √(4² + 3²) = √(16 + 9) = √25', annotation: 'This is a classic 3-4-5 right triangle.' },
        { expression: 'D = 5.0 inches', annotation: 'The tool moved 5.0 inches diagonally.' },
        { expression: 'DRO after: X4.0000, Y3.0000, Z0.0000', annotation: 'Controller confirms position.' },
      ],
      conclusion: 'The DRO always shows target coordinates, not the distance traveled. The actual distance requires the Pythagorean theorem.',
    },
    {
      id: 'ex-cnc-lathe-axis',
      title: 'Lathe X-Axis: Diameter Convention',
      problem: 'A lathe part has a 2.0-inch diameter section. What is the X-axis command to position the tool at that diameter?',
      steps: [
        { expression: 'Diameter = 2.0 inches', annotation: 'The finished part dimension.' },
        { expression: 'Lathe X uses diameter convention', annotation: 'X = diameter, not radius.' },
        { expression: 'G01 X2.0', annotation: 'This commands the tool to the 2.0-inch diameter position.' },
        { expression: 'Radius = 1.0 inch', annotation: 'The actual distance from spindle centerline to tool tip is 1.0 inch, but we write 2.0.' },
      ],
      conclusion: 'Always use the diameter value for X on a lathe. This matches the way machinists measure and inspect parts.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-axes-1',
        type: 'choice',
        text: 'On a vertical machining center (VMC), which axis is the spindle axis?',
        options: ['X', 'Y', 'Z', 'A'],
        answer: 'Z',
      },
      {
        id: 'cnc-axes-2',
        type: 'choice',
        text: 'Positive Z always moves the tool in which direction?',
        options: [
          'Toward the part (plunge)',
          'Away from the part (retract)',
          'To the right',
          'Away from the operator',
        ],
        answer: 'Away from the part (retract)',
      },
      {
        id: 'cnc-axes-3',
        type: 'choice',
        text: 'On a CNC lathe, X2.0 means the part has a diameter of:',
        options: ['1.0 inch', '2.0 inches', '4.0 inches', '0.5 inch'],
        answer: '2.0 inches',
      },
      {
        id: 'cnc-axes-4',
        type: 'choice',
        text: 'Which rotary axis rotates around the Z-axis?',
        options: ['A', 'B', 'C', 'D'],
        answer: 'C',
      },
      {
        id: 'cnc-axes-5',
        type: 'input',
        text: 'A tool moves from X0 Y0 to X3.0 Y4.0. What is the total distance traveled (in units)? ',
        answer: '5',
      },
    ]
  },

  mentalModel: [
    'Z = spindle axis. Positive Z = safe (up, away from part).',
    'X/Y = table axes on a VMC. Program tool position, not table position.',
    'Right-hand rule: A=around X, B=around Y, C=around Z.',
    'Machine Zero (G53) = factory fixed. Work Zero (G54) = your part.',
    'DRO = where the tool is RIGHT NOW.',
    'Lathe X = diameter, not radius.',
  ],
}
