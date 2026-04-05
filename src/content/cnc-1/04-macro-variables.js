export default {
  id: 'cnc-variables',
  slug: 'macro-variables',
  chapter: 'cnc-1',
  order: 20,
  title: 'CNC Variables (The # System)',
  subtitle: 'Parametric Geometry with #, R and V',
  tags: ['Macro B', '# variables', 'R-variables', 'UserTask', 'VC'],

  semantics: {
    core: [
      { symbol: '#1–#33', meaning: 'Local Variables: Private to the current sub-program.' },
      { symbol: '#100–#199', meaning: 'Common Variables: Shared by all programs; reset on power-down.' },
      { symbol: '#500–#999', meaning: 'Permanent Common Variables: Saved to the hard drive for next time.' },
      { symbol: 'R[0–999]', meaning: 'Siemens Arithmetic Registers (e.g. R50 = 1.0).' },
      { symbol: 'VC[1–999]', meaning: 'Okuma UserTask Common Variables.' },
    ],
    rulesOfThumb: [
      'Think of #100 like a named box. You put a value in, and can retrieve it any time.',
      'Always start your macros by "defining" your inputs: #100 = 1.5 (DIAMETER).',
      'If you don\'t define it, most machines treat an empty variable as "0".',
    ]
  },

  hook: {
    question: 'How do you tell the machine to cut 100 different-sized holes with a single file?',
    realWorldContext:
      'Machines often perform repetitive tasks on parts with slight differences. ' +
      'Instead of writing 100 separate programs, we write one **Parametric Macro**. ' +
      'Imagine your code says: `#100 = 1.5 (Diameter)`. The rest of the program uses `#100` everywhere. ' +
      'To change your part, you only change that ONE number. This is the difference between a "Dead Script" and "Intelligent Software".',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(PARAMETRIC RECTANGLE) \n#100 = 3.0 (WIDTH) \n#101 = 2.0 (HEIGHT) \n#102 = 1.0 (START X) \n \nG00 X#102 Y0 \nG01 Y#101 F25 \nX[#102 + #100] \nY0 \nX#102'
        },
        title: 'Variable Logic Lab',
        caption: 'Look at the "MACROS" tab on the control panel. When the program runs, you\'ll see #100 and #101 light up. Try changing #100 from 3.0 to 1.0 and hit Run.'
      }
    ],
    prose: [
      'A variable is just a "Named Pocket". Instead of hard-coding X1.5, we use a placeholder: `X#100`. The machine looks into pocket #100, sees what\'s inside, and uses it.',

      '**Arithmetic on the fly**: Because the controller is a computer, it can do math! We can calculate a chamfer size, a tapered bore, or a spiral on the fly using standard equations: `X[#500 * COS[#501]]`. This is the secret to cutting complex aerospace surfaces that would require millions of lines of standard G-code otherwise.',

      '**Dialects**: Just like programming languages, CNC controllers have different syntax. Fanuc uses `#`. Siemens uses `R`. Okuma uses `V` or `VC`. But the logic is exactly the same: **Name, Assign, Retrieve**.',
    ],
  },

  math: {
    prose: [
      'Standard CNC controllers support basic arithmetic ( +, -, *, / ) and advanced trigonometry.',
      
      '**Order of Operations**: Just like algebra, multiplications and parentheses come first. \n `#1 = [10.0 + 5.0] * 2.0` (Result is 30.0)',

      '**Built-in Trig**: \n `#101 = SIN[30]` (Result is 0.5) \n `#102 = ATAN[1.0]` (Result is 45.0)',

      '**Rounding**: \n `#1 = ROUND[1.5]` (Result is 2.0) \n `#1 = FIX[1.9]` (Result is 1.0, rounds down) \n `#1 = FUP[1.1]` (Result is 2.0, rounds up)',
    ],
  },

  rigor: {
    prose: [
      '**Local Variables (#1–#33)**: These are special. They are "Called" by a sub-program (G65). When the sub-program ends (M99), their values are totally erased. This prevents interference with other programs.',
      
      '**System Variables (#5000+)**: These are the "Machine Telemetry". You don\'t just put numbers here; you *read* them to see where the physical tool is. \n `#5021` = Current X Machine Position \n `#3001` = Milliseconds since last start',

      '**Warning**: Writing to certain system variables can permanently change machine offsets. Never "experiment" with variables above #2000 on a real machine without checking the manual!',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-macro-square',
      title: 'A Simple Square Generator',
      problem: 'Write a program to cut a rectangle of any size starting from X0 Y0.',
      code: '#1 = 5.0 (W) \n#2 = 3.0 (H) \nG01 X#1 \nY#2 \nX0 \nY0',
      steps: [
        { expression: '#1 = 5.0', annotation: 'Define width.' },
        { expression: 'X#1', annotation: 'Move to the defined target width.' },
      ],
      conclusion: 'By changing #1 and #2, this same code can cut any size rectangle.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-var-1',
        type: 'choice',
        text: 'In Fanuc, which range specifies Local variables?',
        options: ['#1–#33', '#100–#199', '#500–#599', '#5000+'],
        answer: '#1–#33',
      },
      {
        id: 'cnc-var-2',
        type: 'input',
        text: 'If #100 = 5 and #101 = 10, what is the value of [#100 + #101]? ',
        answer: '15',
      },
    ]
  },

  mentalModel: [
    '# = Memory Location',
    '[ ] = Mathematical Operation',
    'Local = Personal / Private',
    'Common = Shared / Global',
  ],
}
