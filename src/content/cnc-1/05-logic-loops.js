export default {
  id: 'cnc-logic-loops',
  slug: 'logic-and-loops',
  chapter: 'cnc-1',
  order: 4,
  title: 'Programmatic Control',
  subtitle: 'IF, GOTO, and WHILE Loops',
  tags: ['logic', 'WHILE', 'GOTO', 'IF', 'Roughing'],

  semantics: {
    core: [
      { symbol: 'WHILE [cond] DO n', meaning: 'The machine repeats the code between DO and END as long as the condition is true.' },
      { symbol: 'IF [cond] GOTO n', meaning: 'The machine jumps to a specific line number (N) if the condition is met.' },
      { symbol: 'GOTO n', meaning: 'An unconditional jump to line N.' },
      { symbol: 'EQ, NE, LT, GT, LE, GE', meaning: 'Comparison operators: Equal, Not Equal, Less Than, Greater Than, etc.' },
    ],
    rulesOfThumb: [
      'Infinite loops are dangerous! Always make sure your counter increments: #100 = #100 + 1.',
      'Control blocks should be clean and readable. Use comments to explain your jumps.',
      'Most machines limit you to 3 levels of nested loops.',
    ]
  },

  hook: {
    question: 'How do you make a program that automatically repeats itself until the part is finished?',
    realWorldContext:
      'Imagine you are roughing a block of steel. You need to take 10 passes, each 0.1 inches deep. ' +
      'Instead of typing the same toolpath 10 times, you write it once inside a **WHILE loop**. ' +
      'You tell the machine: "While the current depth is less than 1 inch, go 0.1 deeper and repeat." ' +
      'This is how complex adaptive machining is done.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(LOOP ROUGHING) \n#100 = 0 (COUNT) \n \nWHILE [#100 LT 5] DO 1 \n  G01 X5.0 F50 \n  Y[#100 + 1] \n  X0 \n  #100 = #100 + 1 \nEND 1'
        },
        title: 'Logic & Loop Lab',
        caption: 'Hit "AUTO" and watch the tool. The machine repeats the rectangle path, but each time the counter (#100) increases, the Y-position changes. The WHILE loop automates the repetition.'
      }
    ],
    prose: [
      'A standard G-code program is a "Straight Line". It starts at the top and goes to the bottom. **Logic** turns it into a "Tree". It can branch (IF) or circle back (WHILE).',

      '**The "N" Number is a Signpost**: When you say `GOTO 100`, the interpreter stops what it\'s doing and scans the entire file until it finds a line starting with `N100`. Then it starts reading again from there.',

      '**Conditions are the Gatekeeper**: Macros use brackets `[ ]` for conditions. `[#100 EQ 5]` is a question: "Does the value in pocket #100 equal 5?". If Yes, the gate opens; if No, it stays shut. This allows the machine to make its own decisions based on sensor data (probing) or math.',
    ],
  },

  math: {
    prose: [
      'Logic uses boolean algebra (True/False).',
      
      'Comparisons: \n `LT` = < \n `LE` = ≤ \n `GT` = > \n `GE` = ≥ \n `EQ` = = \n `NE` = ≠',

      'Boolean Logic: \n You can combine questions using `AND`, `OR`, and `XOR`. \n `IF [[#1 EQ 5] AND [#2 LT 10]] GOTO 100` \n (Only jump if #1 is 5 AND #2 is less than 10).',
    ],
  },

  rigor: {
    prose: [
      '**Nested Loops**: You can put a loop inside a loop! This is perfect for 3D surfaces (one loop for X, one loop for Y). However, each `DO 1` must have a matching `END 1`. If you use `DO 2` inside `DO 1`, you must use `END 2` before you reach `END 1`.',
      
      '**Infinite Loop Protection**: On a real machine, an infinite loop would never stop until the user hits the RESET button. Always ensure your "Exit Condition" will eventually be met.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-while-loop',
      title: 'A Basic Loop Counter',
      problem: 'Write a loop that counts to 3 and stops.',
      code: '#1 = 1 \nWHILE [#1 LE 3] DO 1 \n  #1 = #1 + 1 \nEND 1',
      steps: [
        { expression: '#1 = 1', annotation: 'Start at 1.' },
        { expression: '#1 LE 3', annotation: 'Repeat as long as #1 is 3 or less.' },
        { expression: '#1 = #1 + 1', annotation: 'Increment so we eventually stop.' },
      ],
      conclusion: 'The code inside will execute exactly 3 times.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-logic-1',
        type: 'choice',
        text: 'Which operator stands for "Greater Than or Equal to"?',
        options: ['GT', 'GE', 'LE', 'EQ'],
        answer: 'GE',
      },
      {
        id: 'cnc-logic-2',
        type: 'input',
        text: 'What is the matching command for WHILE? ',
        answer: 'END',
      },
    ]
  },

  mentalModel: [
    'IF = The Fork in the road',
    'WHILE = The Roundabout',
    'N = The Signpost',
    'EQ/NE/LT = The Gatekeeper',
  ],
}
