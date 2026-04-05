export default {
  id: 'cnc-scopes',
  slug: 'variable-scopes',
  chapter: 'cnc-1',
  order: 23,
  title: 'Variable Scopes',
  subtitle: 'Local, Common, and Permanent Memory',
  tags: ['Local Variables', 'Common Variables', 'Permanent', 'Memory', 'Logic'],

  semantics: {
    core: [
      { symbol: '#1–#33', meaning: 'Local Variables: Temporary memory that is cleared when the program ends (M30) or when returning from a sub (M99).' },
      { symbol: '#100–#199', meaning: 'Common Variables: Shared across ALL programs; cleared when power is turned off.' },
      { symbol: '#500–#999', meaning: 'Permanent Common Variables: Saved in the machine’s memory (hard drive) and persist through power outages.' },
    ],
    rulesOfThumb: [
      'Use Local variables for math INSIDE a macro (the "Calculations").',
      'Use Common variables for "Machine Settings" like Part Diameter or Length.',
      'Use Permanent variables for "Tool Data" or "Calibration Values".',
    ]
  },

  hook: {
    question: 'How do you keep your mathematical variables from accidentally changing your "Global Settings"?',
    realWorldContext:
      'In a busy shop, the same machine might run five different subprograms at once. ' +
      'If every program used the same variables, they would overwrite each other, causing a crash. ' +
      'To prevent this, the machine has **Scopes**. Private data stays private (Local), while shared data is visible to everyone (Common). ' +
      'Understanding this distinction is the hallmark of a professional macro programmer.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: '(SCOPE LAB) \n#1 = 10.0 (MAIN LOCAL #1) \n#100 = 5.0 (MAIN COMMON #100) \nG65 P5000 (CALL SUB) \n \n(SUB: #1 WILL GO BACK TO 10.0 AFTER M99) \n \nN5000 \n#1 = 20.0 \n#100 = 25.0 \nM99'
        },
        title: 'Variable Scope Lab',
        caption: 'Hit "SINGLE BLOCK" and watch the MACROS tab. When the machine jumps into N5000, #1 is changed to 20. But when it returns to Main, #1 will SNAP BACK to its old value of 10. Common variable #100, however, stays changed forever.'
      }
    ],
    prose: [
      'Think of a **Local variable** like a "Work Desk". Every subprogram is given its own clean desk when it starts. It can put papers (#1, #2) on that desk. When the subprogram finishes, the desk is cleared and thrown away. The main program’s desk is still exactly how it was.',

      '**Common variables (#100)** are like a "Bulletin Board". Anyone in the shop can walk up and change a note on the board. If the subprogram changes #100, EVERY other program sees that change immediately. This is how you "Return" a result back from a macro to the main program.',

      '**Permanent variables (#500)** are like a "Library Book". You don’t just write in them temporarily. You write data you want the machine to REMEMBER tomorrow morning after a cold start.',
    ],
  },

  math: {
    prose: [
      'When a G65 call occurs, a new stack frame is pushed onto the machine\'s memory.',
      
      'Fanuc Example: \n Main Sets: `#1 = 5` \n G65 Call $\\rightarrow$ Push Layer \n Sub Sets: `#1 = 10` \n M99 Return $\\rightarrow$ Pop Layer \n Main Value: `#1` is restored to `5`.',
      
      'Permanent variables exist outside this stack and are usually mapped to a Non-Volatile RAM (NVRAM) or a configuration file on the controller hard drive.',
    ],
  },

  rigor: {
    prose: [
      '**Nested Call Scopes**: If Local Level 1 calls Local Level 2, #1 on Level 2 is COMPLETELY separate from #1 on Level 1. This isolation is why you can safely "Nest" subprograms. You don’t need to worry about Level 4 accidentally overwriting Level 2.',
      
      '**Collision Warning**: The number one source of macro bugs is using a Common variable (#100) when a Local variable (#1) should have been used. This "Global Variable Pollution" can lead to unpredictable machine crashes when other programs expect #100 to still have its old value.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-scope-logic',
      title: 'Contrasting Local vs Common',
      problem: 'Analyze what happens to #1 and #101 after the return.',
      code: '#1 = 5 \n#101 = 10 \nG65 P5000 \n(HERE: #1 IS STILL 5, #101 IS NOW 20) \nN5000 \n#1 = 15 \n#101 = 20 \nM99',
      steps: [
        { expression: '#1 = 5', annotation: 'Set in Main.' },
        { expression: '#1 = 15', annotation: 'Changed in Sub (Local Level 2).' },
        { expression: '#101 = 20', annotation: 'Changed in Sub (Global/Common).' },
      ],
      conclusion: 'Common #101 persists because it is for shared communication.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-scope-1',
        type: 'choice',
        text: 'Which variables persist even after the machine is powered off?',
        options: ['#1–#33', '#100–#149', '#500–#999', 'None of them'],
        answer: '#500–#999',
      },
      {
        id: 'cnc-scope-2',
        type: 'input',
        text: 'True or False: If a subprogram changes a Common variable, the main program sees the change? ',
        answer: 'True',
      },
    ]
  },

  mentalModel: [
    'Local = Private Workspace',
    'Common = Shared Message Board',
    'Permanent = Stored Hard Drive',
  ],
}
