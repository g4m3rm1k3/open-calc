export default {
  id: 'cnc-subprograms',
  slug: 'macro-subroutines',
  chapter: 'cnc-1',
  order: 19,
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
        caption: 'Watch the "MACROS" tab. When G65 P1000 A1.0 B2.0 is called, #1 becomes 1.0 and #2 becomes 2.0. The machine jumps to N1000, draws a box of those dimensions, and returns via M99.',
      },
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'sub-1',
              label: '1 — G65 calls a macro; A B C... map to #1 #2 #3',
              code:
                '; G65 P_ = call macro at program number P.\n' +
                '; A=arg1→#1, B=arg2→#2, C=arg3→#3 (and so on through the alphabet)\n' +
                '; The argument values are LOCAL to the subprogram (#1-#33).\n' +
                '; M99 returns execution to the line after the G65 call.\n' +
                '(MAIN PROGRAM)\n' +
                'G21 G90\n' +
                'G65 P9010 A30.0 B20.0      ; call macro 9010, width=30, height=20\n' +
                'G65 P9010 A60.0 B10.0      ; same macro, different dimensions\n' +
                'M30\n' +
                '\n' +
                '(MACRO 9010: cut a rectangle, width=#1, height=#2)\n' +
                'N9010\n' +
                'G0 X0 Y0 Z5\n' +
                'G1 Z-2 F100\n' +
                'G1 X#1 F300               ; cut right by width\n' +
                'G1 Y#2                    ; cut up by height\n' +
                'G1 X0                     ; cut left\n' +
                'G1 Y0                     ; cut back to start\n' +
                'G0 Z5\n' +
                'M99                        ; return to caller\n',
            },
            {
              id: 'sub-2',
              label: '2 — Nesting: macro calling another macro',
              code:
                '; Macros can call other macros up to the controller nesting limit.\n' +
                '; Each call level has its own local variables (#1–#33).\n' +
                '; Use #100+ (common variables) to pass data between nesting levels.\n' +
                '(MAIN)\n' +
                'G21 G90\n' +
                'G65 P9020 A5.0 B3.0        ; outer macro: 5 columns, 3 rows\n' +
                'M30\n' +
                '\n' +
                '(MACRO 9020: drill a grid of holes)\n' +
                'N9020\n' +
                '#100 = 0                   ; column counter (common variable)\n' +
                'WHILE [#100 LT #1] DO1\n' +
                '  #101 = 0                 ; row counter\n' +
                '  WHILE [#101 LT #2] DO2\n' +
                '    G0 X[#100 * 20] Y[#101 * 20]\n' +
                '    G65 P9030              ; call drill sub\n' +
                '    #101 = #101 + 1\n' +
                '  END2\n' +
                '  #100 = #100 + 1\n' +
                'END1\n' +
                'M99\n' +
                '\n' +
                '(MACRO 9030: drill one hole)\n' +
                'N9030\n' +
                'G1 Z-10 F150\n' +
                'G0 Z5\n' +
                'M99\n',
            },
            {
              id: 'sub-3',
              label: '3 — M98 vs G65: when to use each',
              code:
                '; M98 P_ = simple subprogram call (no argument passing)\n' +
                '; G65 P_ = macro call (passes arguments as local variables)\n' +
                '; Use M98 for fixed repeated patterns (part programs)\n' +
                '; Use G65 for parametric operations (vary dimensions per call)\n' +
                '(MAIN)\n' +
                'G21 G90\n' +
                '; M98 example: repeat the same fixed operation at different positions\n' +
                'G0 X0 Y0\n' +
                'M98 P9040                  ; call fixed drill sub\n' +
                'G0 X50 Y0\n' +
                'M98 P9040                  ; same sub, just repositioned\n' +
                '; G65 example: vary the depth per call\n' +
                'G0 X100 Y0\n' +
                'G65 P9050 C5.0             ; C→#3 = 5mm deep\n' +
                'G0 X150 Y0\n' +
                'G65 P9050 C15.0            ; same sub, 15mm deep\n' +
                'M30\n' +
                '\n' +
                'N9040\n' +
                'G1 Z-8 F150 ; fixed depth\n' +
                'G0 Z5\n' +
                'M99\n' +
                '\n' +
                'N9050\n' +
                'G1 Z[-#3] F150             ; depth from argument C\n' +
                'G0 Z5\n' +
                'M99\n',
            },
          ],
        },
        title: 'G65 Macro Subroutines — Call, Pass, Return',
        caption: 'Cell 1: G65 passes arguments as local variables; M99 returns. Cell 2: nested macro calls — outer loop drives inner drill sub. Cell 3: M98 (fixed repeat) vs G65 (parametric) — when to use each.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 19 of 31 — Macro Subroutines',
        body: 'You learned variables (lesson 20) and arithmetic. Subroutines are how you package that logic into a reusable unit. G65 is what transforms a one-off program into a parametric tool that can cut any size rectangle, any bolt circle, any pocket — without rewriting the code.',
      },
      {
        type: 'definition',
        title: 'G65 P_ — Macro Call with Arguments',
        body: 'G65 P[number] calls the macro at that program number and maps letter arguments to local variables: A→#1, B→#2, C→#3, ..., Z→#26. The called macro has its own local variable scope (#1–#33). M99 returns execution to the line after the G65 call.',
      },
      {
        type: 'definition',
        title: 'M98 vs G65',
        body: 'M98 P_ = simple subprogram call. No argument passing. The sub runs with whatever variables already exist. Use for fixed-geometry repeated operations. G65 P_ = macro call with argument passing. Use for parametric operations where dimensions vary per call.',
      },
      {
        type: 'definition',
        title: 'M99 — Return from Subprogram',
        body: 'M99 at the end of a subroutine returns execution to the calling program at the line after the G65 or M98 call. In a main program, M99 causes the program to loop back to the beginning (acts like a continuous cycle start).',
      },
      {
        type: 'warning',
        title: 'Local variables (#1–#33) reset on each G65 call',
        body: 'Every G65 call creates a fresh set of local variables. Any variables you set inside the macro are destroyed when M99 executes. If you need to pass a result back to the calling program, use common variables (#100–#199) rather than local variables.',
      },
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
