export default {
  id: 'cnc-dialects',
  slug: 'controller-dialects',
  chapter: 'cnc-1',
  order: 27,
  title: 'Controller Dialects',
  subtitle: 'Fanuc vs. Siemens vs. Okuma',
  tags: ['Macro B', 'R-Parameters', 'UserTask', 'THINC', 'SINUMERIK'],

  semantics: {
    core: [
      { dialect: 'Fanuc / Haas', symbol: '#100 = 1.0', note: 'Standard Macro B syntax.' },
      { dialect: 'Siemens SINUMERIK', symbol: 'R100 = 1.0', note: 'Uses R-parameters for arithmetic.' },
      { dialect: 'Okuma UserTask', symbol: 'V1 = 1.0', note: 'Commonly uses V-variables (V1-V200) or VC (Common).' },
    ],
    rulesOfThumb: [
      'Fanuc is the "C" of the CNC world—terse, powerful, and industry-standard.',
      'Siemens is like "Python"—readable commands like `POCKET2` and `REPEAT`.',
      'Okuma THINC is extremely rigorous—variables are named and structured.',
    ]
  },

  hook: {
    question: 'How do you take a macro developed for a Fanuc mill and run it on a Siemens or Okuma lathe?',
    realWorldContext:
      'In a modern factory, you will likely have a mix of machines. ' +
      'A shop might have 10 Fanucs, 2 Siemens, and 5 Okumas. ' +
      'A master macro programmer doesn\'t just learn one system; they learn the **Underlying Logic** so they can translate between them. ' +
      'While the symbols change (# vs R vs V), the motion planner and the math remain identical.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(SIEMENS STYLE) \nR1 = 5.0 (WIDTH) \nR2 = 3.0 (HEIGHT) \n \nG01 X=R1 Y=0 F100 \nY=R2 \nX=0 \nY=0 \n \n(FANUC STYLE) \n#1 = 5.0 \n#2 = 3.0 \n \nG01 X#1 Y0 F100 \nY#2 \nX0 \nY0'
        },
        title: 'Multi-Style Lab',
        caption: 'Notice how the same logic (drawing a rectangle) is expressed differently. Siemens often uses the equal sign (X=R1), while Fanuc appends the variable directly (X#1).'
      }
    ],
    prose: [
      'Think of dialects as **Slang**. In one part of the world, a "fizzy drink" is "Soda". In another, it’s "Pop". But it’s the same drink. Similarly, #100 and R100 are just local names for a piece of memory.',

      '**Siemens (High-Level)**: Siemens controllers are designed to feel more like modern computer programming. They allow for long variable names (`PART_LENGTH = 100.0`) and have built-in "Cycles" for common operations like drilling or milling.',

      '**Okuma (Reliability)**: Okuma UserTask is known for its incredible stability and tight integration with the machine hardware. It uses `V` for local variables and `VC` for common variables. For example, `VC1 = 10.5` sets a globally shared value.',
    ],
  },

  math: {
    prose: [
      '**Variable Mapping Matrix**: \n' +
      '| Feature | Fanuc | Siemens | Okuma | \n' +
      '| :--- | :--- | :--- | :--- | \n' +
      '| Local Var | #1 - #33 | R0 - R99 | V1 - V32 | \n' +
      '| Common Var | #100 - #199 | R100 - R499 | VC1 - VC200 | \n' +
      '| Permanent | #500 - #999 | GUD / LUD | VMS1 - VMS200 | \n' +
      '| Assignment | #1 = 10 | R1 = 10 | V1 = 10 | \n' +
      '| Access | X#1 | X=R1 | X=V1 |'
    ],
  },

  rigor: {
    prose: [
      '**Syntax nuances**: Fanuc requires brackets for math `[#1 + #2]`. Siemens and Okuma often allow bare math `(R1+R2)`. ' +
      'Always refer to the machine’s specific Programming Manual, as "Option Boards" on the machine can change which macro features are enabled.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-translation',
      title: 'Translating Incremental Logic',
      problem: 'Translate "Move X by variable width" to all three dialects.',
      code: 'Fanuc: G01 U#1 \nSiemens: G01 X=IC(R1) \nOkuma: G01 X=V1 (with G91 active)',
      steps: [
        { expression: 'U#1', annotation: 'Fanuc U-word is Incremental X.' },
        { expression: 'IC(R1)', annotation: 'Siemens IC() function is Incremental.' },
      ],
      conclusion: 'The implementation changes, but the goal (Incremental X move) is identical.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-dial-1',
        type: 'choice',
        text: 'Which controller uses R-parameters for intermediate calculations?',
        options: ['Fanuc', 'Siemens', 'Okuma', 'Fadal'],
        answer: 'Siemens',
      },
      {
        id: 'cnc-dial-2',
        type: 'input',
        text: 'In Okuma, what does VC stand for? ',
        answer: 'Common Variable',
      },
    ]
  },

  mentalModel: [
    '# = Fanuc ID/Tag',
    'R = Siemens Register',
    'V = Okuma Variable',
    'X=R1 = Siemens Target Assignment',
    'X#1 = Fanuc Target Access',
  ],
}
