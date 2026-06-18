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
      },
      {
        id: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'vars-1',
              label: '1 — Assign & Recall',
              code: '; Assign variables then use them in coordinates\nG21 G90 G54\n#100 = 50.0   (width)\n#101 = 30.0   (height)\n#102 = 0.0    (start X)\n\nG0 X#102 Y0 Z5\nG1 Z-1 F300\nG1 X[#102 + #100] F200  ; use expression in coordinate\nG1 Y#101\nG1 X#102\nG1 Y0\nG0 Z5\nM30\n',
            },
            {
              id: 'vars-2',
              label: '2 — Arithmetic',
              code: '; Arithmetic in variables — change #100 and watch results adapt\nG21 G90 G54\n#100 = 40.0        (base length)\n#101 = #100 / 2    (half-width = 20.0)\n#102 = #100 * 1.5  (1.5x width = 60.0)\n\nG0 X0 Y0 Z5\nG1 Z-1 F300\nG1 X#101 F200       ; cut to half-width\nG1 X#100            ; cut to full width\nG1 X#102            ; cut to 1.5x width\nG0 Z5\nM30\n',
            },
            {
              id: 'vars-3',
              label: '3 — Trig (bolt circle preview)',
              code: '; Calculate X/Y using SIN/COS — one step of a bolt circle\nG21 G90 G54\n#100 = 25.0   (radius)\n#101 = 45.0   (angle, degrees)\n\n#110 = #100 * COS[#101]   ; X = 17.678\n#111 = #100 * SIN[#101]   ; Y = 17.678\n\nG0 X0 Y0 Z5\nG1 Z-2 F300\nG1 X#110 Y#111 F200   ; move to calculated position\nG0 Z5\nM30\n',
            },
          ],
        },
        title: 'Macro Variables — Interactive Notebook',
        caption: 'Edit cells and run. Watch the Variables tab to see #100, #101, etc. update in real time. Start with cell 1 (Run ↑), then add cells 2 and 3 to see arithmetic and trig in action.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 20 of 31 — Macro Variables',
        body: 'Until now, every coordinate in your programs has been a fixed number. Variables break that constraint. With variables, one program can cut any pocket size, any bolt circle radius, any taper angle — without rewriting the code.',
      },
      {
        type: 'definition',
        title: 'Variable — a named storage register',
        body: 'A variable is a numbered register that holds a value. Writing #100 = 25.0 stores 25.0. Using #100 in a motion word (G1 X#100) reads from that register at runtime. The machine does not care whether you wrote 25.0 or #100 — it sees the same number.',
      },
      {
        type: 'definition',
        title: 'Variable scopes: local, common, permanent',
        body: 'Fanuc: #1–#33 = local (reset on each G65 call), #100–#199 = common (shared across all programs, cleared at power-off), #500–#999 = permanent (survive power-off, used for fixture offsets and shop constants). Siemens uses R variables. Okuma uses VC variables. Same concept, different syntax.',
      },
      {
        type: 'insight',
        title: 'Variables make programs parametric',
        body: 'A parametric program is one where dimensions come from variable inputs rather than fixed coordinates. One program can drill any hole pattern by changing a few variable assignments at the top. This is the foundation of every custom macro cycle in production CNC.',
      },
      {
        type: 'warning',
        title: '#0 is null — uninitialized variables cause undefined behavior',
        body: 'On Fanuc, a variable that has never been assigned has the value #0 (null/undefined). Using a null variable in a motion word (G1 X#100 when #100 = null) causes an alarm or unpredictable motion. Always initialize variables before using them.',
      },
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
