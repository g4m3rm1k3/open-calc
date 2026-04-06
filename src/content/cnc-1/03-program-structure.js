export default {
  id: 'cnc-program-structure',
  slug: 'program-structure',
  chapter: 'cnc-1',
  order: 3,
  title: 'Program Structure',
  subtitle: 'Blocks, Words, and the Anatomy of G-Code',
  tags: ['block', 'word', 'address', 'O-number', 'N-number', 'comment', 'EOB', 'program format'],

  semantics: {
    core: [
      { symbol: 'Program (O-number)', meaning: 'A complete G-code file, identified by an O-number (e.g. O1234). This is the file name inside the controller.' },
      { symbol: 'Block', meaning: 'One line of G-code. The controller reads and executes one block at a time. Also called a "record" or "line".' },
      { symbol: 'Word', meaning: 'A single address letter + number pair within a block. E.g. X1.5, G01, F20. Each block can contain multiple words.' },
      { symbol: 'Address', meaning: 'The letter part of a word (G, M, X, Y, Z, F, S, T, H, D, R, P, Q, L, N). Tells the controller what type of data follows.' },
      { symbol: 'N-Number', meaning: 'An optional sequence number at the start of a block (e.g. N100). Used for organization, searching, and error reporting. Not required.' },
      { symbol: 'Comment', meaning: 'Text inside parentheses ( ) that the controller ignores. Used for documentation and readability.' },
      { symbol: 'EOB', meaning: 'End Of Block — the invisible line terminator character (LF on modern systems). Signals the end of one block and the start of the next.' },
      { symbol: '%', meaning: 'Program delimiter — appears at the very beginning and end of some G-code files. Used by DNC (drip-feed) systems to mark file boundaries.' },
    ],
    rulesOfThumb: [
      'Each line of G-code is a block. Each block is read and executed completely before the next one starts (except during look-ahead).',
      'Order of words within a block generally does not matter to the controller — G01 X1.0 F20 is the same as F20 X1.0 G01.',
      'Comments cost nothing. Use them generously. The machine ignores them, but the next programmer (or future you) will thank you.',
      'N-numbers are optional but strongly recommended. Use them in increments of 10 (N10, N20...) to leave room for insertions.',
    ]
  },

  hook: {
    question: 'What exactly is a "line" of G-code, and what rules does the controller use to decode it?',
    realWorldContext:
      'A G-code file is a plain text file. Open one in Notepad and you will see rows of letters and numbers. ' +
      'The controller reads this file like reading a recipe: one instruction at a time, top to bottom. ' +
      'Each line (called a **block**) is a collection of **words** (address-number pairs). ' +
      'The controller parses each word — "this is a G-code", "this is an X-coordinate", "this is a feedrate" — ' +
      'and builds a complete motion command from the whole block. ' +
      'Understanding this grammar is what separates someone who can read G-code from someone who can only copy it.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            'O0100                      (PROGRAM NAME / NUMBER)\n' +
            '(=== ANNOTATED EXAMPLE PROGRAM ===)\n' +
            '(Demonstrates all word types in one short program)\n' +
            '\n' +
            'N10  G21 G90 G17           (Units: metric, Absolute, XY plane)\n' +
            'N20  G00 X0 Y0 Z5.0        (Rapid to safe height above work zero)\n' +
            'N30  T1 M06                (Tool 1, execute tool change)\n' +
            'N40  S1500 M03             (Spindle: 1500 RPM, clockwise)\n' +
            'N50  G43 H1 Z5.0           (Activate tool length offset H1)\n' +
            'N60  G00 X10.0 Y10.0       (Rapid to cut start)\n' +
            'N70  G01 Z-3.0 F50.0       (Plunge to depth at 50 mm/min)\n' +
            'N80  X50.0 F200.0          (Cut right at 200 mm/min)\n' +
            'N90  Y40.0                 (Cut up - G01 is modal)\n' +
            'N100 X10.0                 (Cut left - G01 is modal)\n' +
            'N110 Y10.0                 (Cut down - close the square)\n' +
            'N120 G00 Z5.0              (Rapid retract)\n' +
            'N130 M05                   (Spindle stop)\n' +
            'N140 G28 G91 Z0            (Return Z to machine home)\n' +
            'N150 M30                   (End of program, rewind)'
        },
        title: 'Fully Annotated G-Code Program',
        caption: 'Read each line. Every word has a purpose. The N-numbers help you find lines. The comments explain intent. Run the program and watch the toolpath — then look back at the code and trace which lines drew which moves.',
      }
    ],
    prose: [
      '**The Block = The Sentence**: A block is a single complete instruction. The controller reads the entire block, processes all the words in it, then acts. N10 G21 G90 G17 is one block containing three words (G21, G90, G17). They all take effect simultaneously when that block is executed.',

      '**Word Types and What They Do**:\n' +
      '- **G-words** (Preparatory): Define the mode or action type. G00 = rapid, G01 = linear feed, G90 = absolute mode. Can have multiple G-words per block if they are from different modal groups.\n' +
      '- **M-words** (Miscellaneous): Machine functions. M03 = spindle on CW, M06 = tool change, M30 = program end. Usually only one M-word per block.\n' +
      '- **Axis words** (X, Y, Z, A, B, C): The target coordinates for the move.\n' +
      '- **F-word**: Feedrate. The cutting speed in ipm or mm/min.\n' +
      '- **S-word**: Spindle speed in RPM (or surface feet/meters per minute in CSS mode).\n' +
      '- **T-word**: Tool number. Selects which tool from the carousel (e.g., T5).\n' +
      '- **H-word**: Tool length offset register number, used with G43.\n' +
      '- **D-word**: Cutter diameter offset register number, used with G41/G42.\n' +
      '- **R-word**: Radius value for arcs (G02/G03) or the R-plane in canned cycles.\n' +
      '- **P, Q, L-words**: Parameters for canned cycles, subprogram calls (L = repeat count), dwell time.',

      '**The O-Number — Program Identity**: Every Fanuc program starts with an O-number: O0100, O2001, etc. The O-number is the file name inside the controller\'s memory. It can be 1 to 4 digits (1–9999 on Fanuc 0i; up to 8 digits on 30i). When the operator selects a program to run, they search by O-number.',

      '**Comments — Free Documentation**: Anything between parentheses () is a comment. The controller skips it entirely. Use comments to label program sections, explain tool choices, state operation names, or warn about danger zones. There is no penalty for comments — use them freely. Some controllers also use a semicolon (;) as a comment start for the rest of the line.',

      '**Block Order in a Typical Program**:\n' +
      '1. O-number (program name)\n' +
      '2. Setup block: G20/G21, G90, G17 (units, absolute/incremental, plane)\n' +
      '3. Tool call: T-word, M06\n' +
      '4. Spindle start: S-word, M03\n' +
      '5. Tool length offset: G43 H-word\n' +
      '6. Rapid to start: G00 to safe position\n' +
      '7. Cutting moves: G01, G02, G03\n' +
      '8. Retract: G00 Z to safe height\n' +
      '9. Spindle stop: M05\n' +
      '10. Return to home: G28\n' +
      '11. End: M30',
    ],
  },

  math: {
    prose: [
      'A G-code block is parsed left-to-right. The controller uses a formal grammar to decode each word. Conceptually, each block maps to a command tuple:',
      '$\\text{Block} = \\{G_{\\text{motion}},\\; G_{\\text{mode}},\\; X,\\; Y,\\; Z,\\; F,\\; S,\\; T,\\; \\ldots\\}$',
      'Words that are missing in a block are inherited from the **modal state** — the previous active value. This is why N80 can say just X50.0 without repeating G01 F200.0 from N70. The modal state keeps G01 and F50 active.',
      'The controller\'s internal state machine can be written as a transition function:',
      '$\\text{State}_{n+1} = \\text{Update}(\\text{State}_n,\\; \\text{Block}_n)$',
      'Each block potentially changes some subset of the modal state. Words not present in the block leave their modal values unchanged.',
    ],
  },

  rigor: {
    prose: [
      '**Multiple G-Codes per Block**: A block can contain multiple G-codes, but only if they come from different modal groups. You cannot have G00 and G01 in the same block (both are Group 1 — motion). But you can have G00 G90 G21 (motion, distance mode, units — all different groups). The controller executes them all for that block.',

      '**Only One M-Code per Block (Fanuc rule)**: Unlike G-codes, most Fanuc controllers only allow one M-code per block. Some newer Fanuc variants allow two. Check your specific controller manual. Always putting one M-code per block is the safe practice.',

      '**Block Skip — The Slash (/)**: A block starting with a forward slash (/) is a "block skip" or "optional stop" block. If the operator has the Block Skip switch ON, the controller ignores that entire block. This is used for optional moves or debugging: /N100 G01 X5.0 will be skipped when Block Skip is enabled.',

      '**Sequence Numbers Are Not Line Numbers**: N-numbers do not have to be sequential or in order. N10 can come after N500. The controller does not execute blocks in N-number order — it reads them top-to-bottom in the file. N-numbers are only reference labels for GOTO, searching, and error messages.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-parse-block',
      title: 'Parsing a Block',
      problem: 'Parse every word in this block: N80 G01 X25.4 Y12.7 F200.0',
      steps: [
        { expression: 'N80', annotation: 'Sequence number 80. Optional reference label. Does not affect motion.' },
        { expression: 'G01', annotation: 'G-word, Group 1: Activate Linear Interpolation (feed) mode.' },
        { expression: 'X25.4', annotation: 'Axis word: target X = 25.4 (mm in G21 mode = exactly 1.000 inch).' },
        { expression: 'Y12.7', annotation: 'Axis word: target Y = 12.7 mm (= 0.500 inch).' },
        { expression: 'F200.0', annotation: 'F-word: feedrate = 200 mm/min (≈ 7.87 ipm).' },
      ],
      conclusion: 'The controller reads this block as: "Perform a linear interpolation move to X=25.4, Y=12.7 at 200 mm/min." All five words work together to form one complete command.',
    },
    {
      id: 'ex-cnc-program-anatomy',
      title: 'Identifying the Sections of a Program',
      problem: 'Label the function of each line in this short program fragment.',
      code: 'O0200\nG21 G90\nT2 M06\nS2000 M03\nG43 H2\nG00 X0 Y0\nG01 Z-5.0 F50\nM30',
      steps: [
        { expression: 'O0200', annotation: 'Program identification number. This program is stored as "O0200" in the controller.' },
        { expression: 'G21 G90', annotation: 'Setup block. G21 = metric mode. G90 = absolute coordinates. Both take effect immediately.' },
        { expression: 'T2 M06', annotation: 'Tool selection and tool change. T2 = prepare tool #2 in carousel. M06 = execute the physical swap.' },
        { expression: 'S2000 M03', annotation: 'Spindle: 2000 RPM, clockwise (M03). Spindle starts spinning.' },
        { expression: 'G43 H2', annotation: 'Activate tool length offset register H2 for tool #2.' },
        { expression: 'G00 X0 Y0', annotation: 'Rapid position to work zero XY. Z unchanged.' },
        { expression: 'G01 Z-5.0 F50', annotation: 'Plunge to 5mm depth at 50 mm/min feedrate.' },
        { expression: 'M30', annotation: 'Program end. Stop spindle, coolant. Rewind program pointer to the start.' },
      ],
      conclusion: 'Every real program follows this basic pattern: setup → tool → spindle → offsets → position → cut → end.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-struct-1',
        type: 'choice',
        text: 'What is a single line of G-code called?',
        options: ['A word', 'A block', 'An address', 'A program'],
        answer: 'A block',
      },
      {
        id: 'cnc-struct-2',
        type: 'choice',
        text: 'What is the purpose of an N-number (e.g. N100)?',
        options: [
          'It defines the spindle speed',
          'It is a sequence/reference label; it does not control execution order',
          'It selects which tool to use',
          'It sets the feedrate',
        ],
        answer: 'It is a sequence/reference label; it does not control execution order',
      },
      {
        id: 'cnc-struct-3',
        type: 'choice',
        text: 'How does the controller handle text inside parentheses ( ) in G-code?',
        options: [
          'It treats them as a sub-program call',
          'It completely ignores them — they are comments',
          'It uses them to set dwell time',
          'It treats them as axis coordinates',
        ],
        answer: 'It completely ignores them — they are comments',
      },
      {
        id: 'cnc-struct-4',
        type: 'input',
        text: 'What letter identifies a program to the Fanuc controller? (Answer: the letter) ',
        answer: 'O',
      },
      {
        id: 'cnc-struct-5',
        type: 'choice',
        text: 'The block N70 G01 Z-3.0 F50.0 is followed by N80 X50.0. What motion does N80 perform?',
        options: [
          'Rapid move to X50.0 (G00 is assumed)',
          'Feed move to X50.0 at F50.0 (G01 and F50.0 are modal from N70)',
          'Spindle move in X direction',
          'No motion — there is no G-code',
        ],
        answer: 'Feed move to X50.0 at F50.0 (G01 and F50.0 are modal from N70)',
      },
    ]
  },

  mentalModel: [
    'Block = one line = one instruction.',
    'Word = address letter + number (G01, X1.5, F20).',
    'O-number = program filename inside the controller.',
    'N-numbers = optional labels, not execution order.',
    'Comments () = free documentation; machine ignores them.',
    'Missing words = inherited from modal state.',
  ],
}
