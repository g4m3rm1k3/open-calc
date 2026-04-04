export default {
  id: 'cnc-coordinate-systems',
  slug: 'coordinate-systems',
  chapter: 'cnc-1',
  order: 2,
  title: 'Coordinate Systems & Offsets',
  subtitle: 'Machine Zero (G53) vs. Work Zero (G54)',
  tags: ['G53', 'G54', 'offsets', 'probing', 'H-offset'],

  semantics: {
    core: [
      { symbol: 'G53', meaning: 'Machine Coordinate System: Hard-coded absolute zero from the factory sensors.' },
      { symbol: 'G54–G59', meaning: 'Work Coordinate Systems (WCS): User-defined zero points relative to the part.' },
      { symbol: 'G92', meaning: 'Global Coordinate Setting: Shifts all coordinates relative to current position (use with caution!).' },
      { symbol: 'H-Word', meaning: 'Tool Length Offset: Adjusts Z-axis for different tool lengths.' },
    ],
    rulesOfThumb: [
      'The G-code "X0 Y0" in your program is looking at the G54 Work Offset.',
      'A work offset is just a vector shift: G53 = G54_offset + Program_X.',
      'Always home the machine (G28) to re-calibrate G53 after power-up.',
    ]
  },

  hook: {
    question: 'How does the machine know where your part is on the table?',
    realWorldContext:
      'Machines come from the factory with a "Hard Zero" (G53) at the ends of their travel. But your part could be clamped ANYWHERE on the bed. ' +
      'To fix this, you touch a probe to the corner of your part and tell the machine: "This is my new (0,0,0)". This information is stored in the **Work Offset Table (G54)**. ' +
      'Understanding this vector shift is the difference between a perfect part and a catastrophic crash.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(OFFSETS LAB) \nG54 G00 X0 Y0 \nG01 X2.0 F50 \nG55 G00 X0 Y0 \nG01 X2.0 F50'
        },
        title: 'Coordinate Lab',
        caption: 'Look at the "OFFSETS" tab in the control panel. G54 might be at (0,0,0), while G55 is shifted. When you switch between them, the "X0 Y0" command moves to a different physical spot.'
      }
    ],
    prose: [
      'Imagine you have a piece of paper on your desk. The desk\'s corner is (0,0) (Machine Zero, G53). But you want to draw a house on the paper. You don\'t want to calculate everything from the desk corner. You set the **paper\'s corner** as "New Zero" (G54). Now, if you draw a line at X=1 on the paper, the machine automatically adds the Desk-to-Paper distance for you.',

      '**The "G54" Vector**: When the machine executes `G01 X1.0`, it doesn\'t move the motor to position 1.0. It looks at the **Work Offset Table** entry for G54 (say X is +10.0), adds that to the X1.0, and moves the motor to physical position 11.0.',

      '**Tool length (G43)**: This is just an offset for the Z-axis. Every drill or mill has a different length. We touch each one off the part and store its length in the **H-offset** register. G43 tells the machine: "Subtract the length of this tool so the TIP reaches the target Z, not the spindle face".',
    ],
  },

  math: {
    prose: [
      'The controller calculates the final machine position $\\mathbf{P}_{machine}$ using vector addition:',
      '$$\\mathbf{P}_{machine} = \\mathbf{P}_{programmed} + \\mathbf{O}_{work} + \\mathbf{O}_{tool}$$',
      
      'For the X-axis specifically:',
      '$$X_{machine} = X_{prog} + X_{offset}$$',

      'For the Z-axis (with Tool Length $H$):',
      '$$Z_{machine} = Z_{prog} + Z_{wcs} + Z_{tool}$$',

      'This addition happens in real-time for every single point calculated by the motion planner.',
    ],
  },

  rigor: {
    prose: [
      '**G53 is Non-Modal**: A command like `G53 G01 X0` only lasts for that one line. After that, the machine immediately goes back to the active Work Offset (G54).',
      
      '**Dynamic Rotation (G68)**: Advanced machines can rotate the entire coordinate system! If your part is clamped crooked (say at 5 degrees), you can set a G68 coordinate rotation. The controller uses rotation matrix math to transform every X/Y move in your code into the correct slanted path: \n $X\' = X\\cos(\\theta) - Y\\sin(\\theta)$ \n $Y\' = X\\sin(\\theta) + Y\\cos(\\theta)$',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-offsets-calc',
      title: 'Calculating Machine Coordinates',
      problem: 'If G54 is set to X=10.0 and your program says X1.0, where is the motor?',
      code: 'X_{machine} = 1.0 + 10.0',
      steps: [
        { expression: 'X_{prog} = 1.0', annotation: 'Program target.' },
        { expression: 'X_{offset} = 10.0', annotation: 'Machine to Work zero vector.' },
      ],
      conclusion: 'The motor moves to physical machine coordinate 11.0.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-offset-1',
        type: 'choice',
        text: 'Which code refers to the permanent factory home position?',
        options: ['G53', 'G54', 'G90', 'G01'],
        answer: 'G53',
      },
      {
        id: 'cnc-offset-2',
        type: 'input',
        text: 'If G54 is the 1st work offset, what is the code for the 2nd? ',
        answer: 'G55',
      },
    ]
  },

  mentalModel: [
    'G53 = World View',
    'G54 = Local View',
    'Offset = Vector jump',
    'H = Tool Length compensation',
  ],
}
