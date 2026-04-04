export default {
  id: 'cnc-subprograms',
  slug: 'macro-subroutines',
  chapter: 'cnc-1',
  order: 5,
  title: 'Macro Subroutine Calling',
  subtitle: 'The G65 Command & Argument Passing',
  tags: ['G65', 'subprogram', 'arguments', 'modular', 'reusable'],

  semantics: {
    core: [
      { symbol: 'G65 Pn', meaning: 'Macro Call: Jumps to program number N and passes any subsequent letters as arguments.' },
      { symbol: 'M99', meaning: 'Subprogram Return: Jumps back to the calling program at the very next line.' },
      { symbol: 'A, B, C...', meaning: 'Arguments: Letters used as input values for the subprogram (A maps to #1, B to #2, etc.).' },
    ],
    rulesOfThumb: [
      'G65 is "Parametric"—you can pass data in. M98 is a simple jump with no data.',
      'A Maps to #1, B to #2, C to #3... skipping G, L, N, O, P, Q, R by Fanuc standards.',
      'Use subprograms for features you cut often (e.g. circles, pockets, bolt-patterns).',
    ]
  },

  hook: {
    question: 'How do you create a "Black Box" function in G-code?',
    realWorldContext:
      'In standard software, we write a function once and call it multiple times. ' +
      'In CNC, **G65** is that function call. Imagine writing a perfect "Bolt Hole" pattern once. ' +
      'Whenever you need 5 holes, you just type `G65 P1000 H5.0`. The machine handles the math internally. ' +
      'This makes your main programs short, clean, and professional.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(MAIN PROGRAM) \nG65 P1000 A1.0 B2.0 (CALL SUB 1000) \nG65 P1000 A3.0 B4.0 (CALL SUB 1000) \nM30 \n \n(SUB 1000: DRAW BOX) \nN1000 \nG01 X#1 Y0 F25 \nY#2 \nX0 \nY0 \nM99'
        },
        title: 'G65 Subroutine Lab',
        caption: 'Watch the "MACROS" tab. When G65 P1000 A1.0 B2.0 is called, #1 becomes 1.0 and #2 becomes 2.0. The machine jumps to N1000, draws a box of those dimensions, and returns via M99.'
      }
    ],
    prose: [
      'Think of a **Subprogram** as a recipe inside a cookbook. Your main program is the "Daily Menu". Instead of writing the whole recipe for bread Every Day, you just write: "Make bread using recipe #1000".',

      '**Argument Passing**: Unlike a standard M98 jump, **G65** allows you to send data. In the lab above, `A1.0` is the data. The machine takes that "1.0", looks up the letter `A` in its internal table, and creates a local variable `#1`. Now the subprogram can use `#1` as its width.',

      '**The "N" Number Target**: The `P` word (e.g. `P1000`) is the address. It tells the machine: "Go find the block that starts with N1000". This allows you to store your macros at the end of your main file or in a completely separate file on the controller hard drive.',
    ],
  },

  math: {
    prose: [
      'The Fanuc Argument Mapping table is consistent across most controllers:',
      '| Letter | Variable |',
      '| :--- | :--- |',
      '| A | #1 |',
      '| B | #2 |',
      '| C | #3 |',
      '| I | #4 |',
      '| J | #5 |',
      '| K | #6 |',
      '| D | #7 |',
      '| E | #8 |',
      '| F | #9 |',
      '| H | #11 |',
      
      'Notice that `G`, `L`, `N`, `O`, `P` are skipped because they have special G-code meanings.',
    ],
  },

  rigor: {
    prose: [
      '**Variable Scope Isolation**: This is critical. When you use G65, the machine creates a **New Local Level**. If the Main program has `#1 = 10` and the Subprogram sets `#1 = 5`, when the machine returns to Main, `#1` will correctly go back to `10`. Local variables are protected from side-effects.',
      
      '**Nesting Limits**: You can call a subprogram from inside another subprogram! Most modern controllers allow you to "nest" up to 4 or 8 levels deep. Beyond that, the machine will alarm out with a "Call Stack Overflow".',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-subcall',
      title: 'Parametric Bolt Circle Call',
      problem: 'Analyze this call: G65 P2000 A5.0 H8.',
      code: 'G65 P2000 A5.0 H8',
      steps: [
        { expression: 'P2000', annotation: 'Target subprogram is N2000.' },
        { expression: 'A5.0', annotation: 'Radius (#1) is set to 5.0.' },
        { expression: 'H8', annotation: 'Number of holes (#11) is set to 8.' },
      ],
      conclusion: 'The subprogram will run its internal math using these specific inputs.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-sub-1',
        type: 'choice',
        text: 'Which letter maps to variable #1 in a G65 call?',
        options: ['A', 'B', 'P', 'X'],
        answer: 'A',
      },
      {
        id: 'cnc-sub-2',
        type: 'input',
        text: 'What is the command to return from a subprogram? ',
        answer: 'M99',
      },
    ]
  },

  mentalModel: [
    'G65 = The Function Call',
    'Letters = The Inputs',
    'M99 = The Return Home',
    'Local = Private Memory',
  ],
}
