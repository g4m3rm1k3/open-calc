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
        caption: 'Notice how the same logic (drawing a rectangle) is expressed differently. Siemens often uses the equal sign (X=R1), while Fanuc appends the variable directly (X#1).',
      },
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'dialect-1',
              label: '1 — Fanuc Macro B: the most common standard',
              code:
                '; Fanuc Macro B — the dominant dialect in North American shops.\n' +
                '; Variables: #1-#33 local, #100-#199 common, #500-#999 permanent.\n' +
                '; Arithmetic requires square brackets: #1 = [#2 + #3]\n' +
                '; Access in motion: G1 X#1 (no equals sign)\n' +
                '; Conditional: IF [#100 GT 10] GOTO 100\n' +
                '; Loop: WHILE [#100 LT 6] DO1 ... END1\n' +
                '#100 = 40.0               ; width\n' +
                '#101 = 25.0               ; height\n' +
                'G21 G90\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-2 F100\n' +
                'G1 X#100 F300             ; Fanuc: variable used directly in word\n' +
                'G1 Y#101\n' +
                'G1 X0\n' +
                'G1 Y0\n' +
                'G0 Z5\n' +
                'M30\n',
            },
            {
              id: 'dialect-2',
              label: '2 — Siemens comparison: R-parameters, GUD, CYCLE calls',
              code:
                '; SIEMENS SINUMERIK syntax (shown as comments for reference — runs as Fanuc):\n' +
                '; R-parameters: R1=40.0 R2=25.0  (no # prefix)\n' +
                '; Access in motion: G1 X=R1      (equals sign required)\n' +
                '; Arithmetic: R3=R1+R2           (no brackets needed)\n' +
                '; Conditional: IF R1>10 GOTOF LABEL1\n' +
                '; Loop:        WHILE R1<6 DO ... ENDWHILE\n' +
                '; Cycles: CYCLE83(...)           (built-in drilling cycle call)\n' +
                '; Long var names: DEF REAL PART_WIDTH = 40.0\n' +
                '\n' +
                '; Equivalent Fanuc code (this actually runs in the simulator):\n' +
                '#1 = 40.0                 ; same as Siemens R1=40.0\n' +
                '#2 = 25.0                 ; same as R2=25.0\n' +
                'G21 G90\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-2 F100\n' +
                'G1 X#1 F300\n' +
                'G1 Y#2\n' +
                'G1 X0\n' +
                'G1 Y0\n' +
                'G0 Z5\n' +
                'M30\n',
            },
            {
              id: 'dialect-3',
              label: '3 — Okuma OSP: VC variables, WHILE syntax closest to Python',
              code:
                '; OKUMA OSP UserTask syntax (shown as comments — runs as Fanuc):\n' +
                '; Local variables: V1, V2, ..., V32\n' +
                '; Common variables: VC1, VC2, ..., VC200\n' +
                '; Access in motion: G1 X=V1       (equals sign, like Siemens)\n' +
                '; Conditional: IF V1 > 10 THEN GOTO L100 END-IF\n' +
                '; Loop: WHILE VC1 LT 6 ... ENDWHILE  (closest to Python syntax)\n' +
                '; Okuma has no bracket requirement for arithmetic\n' +
                '\n' +
                '; Translation table (same rectangle, three dialects):\n' +
                '; FANUC:   #100 = 40.0 → G1 X#100\n' +
                '; SIEMENS: R100 = 40.0 → G1 X=R100\n' +
                '; OKUMA:   VC100 = 40.0 → G1 X=VC100\n' +
                '; All three are the same register. Different spelling, same concept.\n' +
                '#100 = 40.0\n' +
                'G21 G90\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-2 F100\n' +
                'G1 X#100 F300\n' +
                'G0 Z5\n' +
                'M30\n',
            },
          ],
        },
        title: 'Controller Dialects — Fanuc, Siemens, Okuma',
        caption: 'Cell 1: Fanuc Macro B with square bracket syntax and # prefix. Cell 2: Siemens R-parameter style — X=R1 equals-sign access, no brackets needed. Cell 3: Okuma OSP VC variables — syntax closest to Python. All three express the same geometry.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 27 of 31 — Controller Dialects',
        body: 'You have learned Fanuc Macro B throughout this course. This lesson shows you how to read a Siemens or Okuma program and translate it. The logic is identical — only the spelling changes.',
      },
      {
        type: 'definition',
        title: 'The three major CNC controller families',
        body: 'Fanuc (dominant in North America and Asia — uses # variables, brackets, Macro B syntax). Siemens SINUMERIK (dominant in Europe — uses R parameters, GUD named variables, CYCLE calls). Okuma OSP (known for stability — uses V/VC variables, WHILE/ENDWHILE syntax closest to Python).',
      },
      {
        type: 'definition',
        title: 'Variable naming: the only significant syntax difference',
        body: 'Fanuc: #100 = value, access as X#100. Siemens: R100 = value, access as X=R100. Okuma: VC100 = value, access as X=VC100. All three refer to the same concept — a numbered register that holds a floating-point value. The # vs R vs VC prefix is purely dialect.',
      },
      {
        type: 'insight',
        title: 'Arithmetic brackets differ: Fanuc requires them, others often do not',
        body: 'Fanuc Macro B: #1 = [#2 + #3] — brackets required around every expression. Siemens: R1 = R2 + R3 — no brackets needed. Okuma: V1 = V2 + V3 — same. When translating Fanuc → Siemens, strip the brackets. When translating Siemens → Fanuc, add them.',
      },
      {
        type: 'insight',
        title: 'Read the specific machine manual — options vary',
        body: 'Controller firmware versions, installed options, and machine builder customizations can change which macro features are available on a specific machine. "Fanuc" is not one controller — it is a family with dozens of models. Always check the Programming Manual for the exact machine you are programming.',
      },
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
