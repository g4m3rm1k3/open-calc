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
        caption: 'Hit "SINGLE BLOCK" and watch the MACROS tab. When the machine jumps into N5000, #1 is changed to 20. But when it returns to Main, #1 will SNAP BACK to its old value of 10. Common variable #100, however, stays changed forever.',
      },
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'scope-1',
              label: '1 — Local (#1–#33): reset on every G65 call',
              code:
                '; Local variables (#1-#33) are created fresh for each G65 call.\n' +
                '; When M99 returns, the caller\'s #1 value is RESTORED.\n' +
                '; Changes to #1 inside the macro are invisible to the caller.\n' +
                '#1 = 99.9                  ; set in main program\n' +
                'G65 P9100 A5.0             ; A→#1 = 5.0 inside macro 9100\n' +
                '; After M99: #1 is 99.9 again (local is restored)\n' +
                'G0 X#1                     ; moves to X99.9, not X5.0\n' +
                'M30\n' +
                '\n' +
                'N9100\n' +
                'G0 X#1                     ; X5.0 inside macro (local context)\n' +
                '#1 = 777                   ; only affects local copy\n' +
                'M99\n',
            },
            {
              id: 'scope-2',
              label: '2 — Common (#100–#199): visible everywhere, cleared at power-off',
              code:
                '; Common variables (#100-#199) are SHARED across all programs.\n' +
                '; A change inside a macro persists back to the caller.\n' +
                '; Use them to return results from macros, or share settings.\n' +
                '#100 = 0                   ; initialize (always do this!)\n' +
                'G65 P9200                  ; call macro — it will set #100\n' +
                '; After M99: #100 holds the value the macro wrote\n' +
                'G0 X#100                   ; move to the macro\'s result\n' +
                'M30\n' +
                '\n' +
                'N9200\n' +
                '#100 = 42.5               ; write result to common variable\n' +
                'M99                        ; caller will see #100 = 42.5\n',
            },
            {
              id: 'scope-3',
              label: '3 — Permanent (#500–#999): survive power-off (calibration data)',
              code:
                '; Permanent variables (#500-#999) are stored in NVRAM.\n' +
                '; They survive a controller power-off.\n' +
                '; Use them for tool calibration data, fixture offsets, shop constants.\n' +
                '; CAUTION: overwriting a permanent variable cannot be undone easily.\n' +
                '; Reading permanent variable (safe — just reads):\n' +
                '#10 = #501                 ; read shop part zero offset from NVRAM\n' +
                'G0 X#10                    ; use the stored value\n' +
                '; Writing permanent variable (destructive — changes persist after power off):\n' +
                '#501 = 25.400              ; overwrite: store new calibration value\n' +
                '; Verify: next power cycle, #501 will STILL be 25.400\n' +
                'M30\n',
            },
          ],
        },
        title: 'Variable Scopes — Local, Common, Permanent',
        caption: 'Cell 1: local variables reset after G65 return — changes in the macro are invisible to the caller. Cell 2: common variables persist — the macro\'s result is visible after M99. Cell 3: permanent variables survive power-off — used for calibration data.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 23 of 31 — Variable Scopes',
        body: 'You know how to assign and use variables. Scope defines VISIBILITY: which variables are private to a subroutine and which are shared with the rest of the machine. This is what prevents macros from interfering with each other.',
      },
      {
        type: 'definition',
        title: '#1–#33 — Local variables (private to each G65 call)',
        body: 'Created fresh each time G65 calls a macro. Initialized from the argument letters (A→#1, B→#2...). Changes are invisible to the calling program. When M99 executes, the local frame is destroyed and the caller\'s local variables are restored.',
      },
      {
        type: 'definition',
        title: '#100–#199 — Common variables (shared, cleared at power-off)',
        body: 'Visible to every program running on the machine. A macro can write a result to #100 and the calling program can read it after M99. Cleared when the controller is powered off. Use for passing results between macros and for shared run-time settings.',
      },
      {
        type: 'definition',
        title: '#500–#999 — Permanent variables (survive power-off)',
        body: 'Stored in NVRAM. Persist through a full controller power cycle. Used for tool calibration data, probe offsets, material database values, and shop-specific constants that must survive overnight. Write with caution — overwriting is destructive.',
      },
      {
        type: 'warning',
        title: 'Global variable pollution: the #1 source of macro bugs',
        body: 'Using a common variable (#100) when you should use a local variable (#1) means any other program that also uses #100 can overwrite your value unexpectedly. In a shop running multiple programs, always use local variables for internal macro calculations. Only use common variables when you intend the result to be shared.',
      },
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
