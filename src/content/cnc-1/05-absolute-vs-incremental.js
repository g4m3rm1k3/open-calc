export default {
  id: 'cnc-absolute-incremental',
  slug: 'absolute-vs-incremental',
  chapter: 'cnc-1',
  order: 5,
  title: 'Absolute vs Incremental',
  subtitle: 'G90 / G91 — Where Am I Going vs How Far Do I Go?',
  tags: ['G90', 'G91', 'absolute', 'incremental', 'distance mode', 'coordinate mode'],

  semantics: {
    core: [
      { symbol: 'G90', meaning: 'Absolute Mode: All coordinates are measured from the active Work Zero (the origin). X1.0 always means "go to position 1.0 from zero".' },
      { symbol: 'G91', meaning: 'Incremental Mode: All coordinates are measured from the CURRENT tool position. X1.0 means "move 1.0 from wherever you are now".' },
      { symbol: 'Work Zero', meaning: 'The origin (0,0,0) of the active work coordinate system (G54). Absolute coordinates are measured from here.' },
      { symbol: 'Current Position', meaning: 'Where the tool tip is right now. Incremental moves add to this.' },
    ],
    rulesOfThumb: [
      'G90 (absolute) is the default and safest mode for most CNC work. Use it for all cutting moves.',
      'G91 (incremental) is useful for: G28 home returns, drilling patterns, and situations where relative distance is the natural way to think.',
      'Never leave G91 active at the end of a program. The next program will inherit incremental mode and crash.',
      'In G90: repeating the same coordinate command does nothing (tool is already there). In G91: it moves again each time.',
    ]
  },

  hook: {
    question: 'If I say "move to position 5.0", does that mean 5.0 inches from zero, or 5.0 inches from where you are now?',
    realWorldContext:
      'Imagine giving directions to a new city. You could say: "Drive to 123 Main Street" (absolute — a fixed address). ' +
      'Or you could say: "Drive 3 blocks north from here" (incremental — relative to current position). ' +
      'Both work, but they fail differently. If you\'re already on Main Street, the first direction gets you there reliably. ' +
      'But if you miscount blocks with the second method, every subsequent turn is wrong. ' +
      'G90 (absolute) and G91 (incremental) are the CNC equivalents of these two navigation strategies. ' +
      'Choosing the right one for each situation — and understanding why errors compound in incremental mode — is essential for safe programming.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(ABSOLUTE vs INCREMENTAL COMPARISON)\n' +
            '(Both programs draw the same L-shape)\n' +
            '\n' +
            '(--- ABSOLUTE MODE (G90) ---)\n' +
            '(Every coordinate is from work zero)\n' +
            'G21 G90\n' +
            'G00 X0 Y0\n' +
            'G01 X30.0 F100  (Go TO position 30 from zero)\n' +
            'G01 Y20.0       (Go TO position 20 from zero)\n' +
            'G01 X0          (Go TO position 0 from zero)\n' +
            '\n' +
            'G00 X0 Y0\n' +
            '\n' +
            '(--- INCREMENTAL MODE (G91) ---)\n' +
            '(Every coordinate is added to current position)\n' +
            'G91\n' +
            'G01 X30.0 F100  (Move 30 FROM HERE)\n' +
            'G01 Y20.0       (Move 20 FROM HERE)\n' +
            'G01 X-30.0      (Move -30 FROM HERE - note negative!)\n' +
            '\n' +
            'G90             (ALWAYS switch back to absolute!)\n' +
            'G00 X0 Y0\n' +
            'M30'
        },
        title: 'G90 vs G91 Comparison Lab',
        caption: 'Both sections draw the same L-shape. Notice how G91 uses relative distances (30, 20, -30) while G90 uses absolute positions (30, 20, 0). Also notice: G91 needs a NEGATIVE number to go back left; G90 just says X0. Absolute mode is more readable and less error-prone.',
      }
    ],
    prose: [
      '**Absolute (G90) — "Where is it?"**: In absolute mode, every coordinate in your program refers to a fixed location in space — measured from Work Zero. X25.4 always means "the point that is 25.4 mm to the right of work zero," no matter where the tool currently is. If you write X25.4 twice in a row, the second command does nothing — the tool is already there.',

      '**Incremental (G91) — "How far?"**: In incremental mode, every coordinate is added to the current tool position. X25.4 means "move 25.4 mm from wherever you are right now." If you write X25.4 twice in a row, the tool moves 25.4 mm, then another 25.4 mm — ending up 50.8 mm from the start. Each command is a *delta* (a change), not a destination.',

      '**When To Use Each**:\n' +
      '- **Use G90 for almost everything**: Tool paths, profiling, pocketing, drilling — whenever you are programming to specific part geometry. Absolute mode prevents error accumulation and is easier to debug.\n' +
      '- **Use G91 for**: Machine home returns (`G28 G91 Z0` — the standard home return idiom), repeating patterns (bolt circles, slot arrays), and relative movements where distance is more natural than destination.\n' +
      '- **The classic home return**: `G91 G28 Z0` means "from wherever Z is right now, go to machine home." This is safer than `G90 G28 Z0` because it does not require knowing the current position. `G91 Z0` is a zero-distance incremental move — the starting point for G28.',

      '**Mixing Modes Within a Program**: You can switch between G90 and G91 freely within a program. Many professional programs use G90 for all cutting moves and switch to G91 specifically for the home return, then switch back. As long as you are deliberate about when each is active, mixing is fine.',

      '**The Error Accumulation Danger of G91**: In G91, an error in one move shifts all subsequent moves. If you accidentally write X-29.9 instead of X-30.0 (a 0.1 mm typo), the next line starts from the wrong position and is also wrong by 0.1 mm — and this compounds through the entire program. In G90, any single error only affects that one move; the next move returns to the correct absolute position.',
    ],
  },

  math: {
    prose: [
      'Let $P_n = (x_n, y_n, z_n)$ be the position after block $n$.',
      '**Absolute mode (G90)**: The commanded coordinates ARE the target position.',
      '$P_{n+1} = (X_{\\text{cmd}},\\; Y_{\\text{cmd}},\\; Z_{\\text{cmd}})$',
      '**Incremental mode (G91)**: The commanded coordinates are ADDED to current position.',
      '$P_{n+1} = P_n + (\\Delta X_{\\text{cmd}},\\; \\Delta Y_{\\text{cmd}},\\; \\Delta Z_{\\text{cmd}})$',
      'The same sequence of blocks can produce different toolpaths depending on which mode is active.',
      'In G91, the total displacement after $k$ moves is:',
      '$\\Delta P_{\\text{total}} = \\sum_{i=1}^{k} \\Delta P_i$',
      'An error $\\epsilon$ in any $\\Delta P_i$ shifts all subsequent positions. In G90, errors in one block do not affect subsequent ones.',
    ],
  },

  rigor: {
    prose: [
      '**G91 and Canned Cycles**: Incremental mode has special behavior inside canned cycle definitions (G81, G83, etc.). The Q (peck increment) and R (return plane) values are always interpreted relative to the current Z — effectively always incremental, even in G90 mode. This is a common source of confusion. Study your controller\'s canned cycle documentation carefully.',

      '**The G90.1 / G91.1 Arc Mode**: On some Fanuc variants, `G90.1` and `G91.1` separately control whether arc center offsets (I, J, K) are absolute or incremental, independent of the main G90/G91 setting. By default, I/J/K are always incremental from the arc start point. This is covered in the Circular Interpolation lesson.',

      '**G91 in Macro Programming**: Inside Fanuc Macro B programs (the advanced programming layer), some macro calls use G91 implicitly. The G65 call (macro call) passes parameters in a context that can affect how the called macro interprets position arguments. Always verify the active mode before executing macro calls.',

      '**Spindle and Feed Behavior**: G90/G91 only affect axis coordinate interpretation. Feedrates, spindle speeds, dwell times, and all other non-axis words are unaffected by this modal switch.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-abs-vs-inc',
      title: 'Same Shape, Two Modes',
      problem: 'Write the moves to cut from X0 to X50, then up to Y30, then back to X0, in both G90 and G91.',
      steps: [
        { expression: 'G90 version:', annotation: 'Absolute coordinates — destination from zero.' },
        { expression: 'G01 X50.0 F100', annotation: 'Absolute: go to X=50 from zero. Distance = 50 mm.' },
        { expression: 'G01 Y30.0', annotation: 'Absolute: go to Y=30 from zero. Distance = 30 mm.' },
        { expression: 'G01 X0', annotation: 'Absolute: go to X=0 (return to zero). Distance = 50 mm.' },
        { expression: 'G91 version:', annotation: 'Incremental coordinates — distance from current position.' },
        { expression: 'G01 X50.0 F100', annotation: 'Incremental: move +50 from current X=0. Same result.' },
        { expression: 'G01 Y30.0', annotation: 'Incremental: move +30 from current Y=0. Same result.' },
        { expression: 'G01 X-50.0', annotation: 'Incremental: move -50 from current X=50. Note NEGATIVE sign required. G90 just wrote X0.' },
      ],
      conclusion: 'The G91 version requires a negative X value to return. G90 just says X0 — much more readable and less prone to sign errors.',
    },
    {
      id: 'ex-cnc-home-return',
      title: 'The Standard Home Return Sequence',
      problem: 'Write the correct blocks to safely return Z and then XY to machine home after cutting.',
      steps: [
        { expression: 'G91 G28 Z0', annotation: 'Switch to incremental mode and return Z to machine home. G91 ensures we move from current Z position, not from work zero. Safe — always retracts regardless of Z depth.' },
        { expression: 'G90', annotation: 'Immediately switch back to absolute mode.' },
        { expression: 'G28 X0 Y0', annotation: 'Now in G90, return XY to machine home. Z is already home.' },
      ],
      conclusion: 'This G91 G28 Z0 → G90 sequence is the standard safe home return used in virtually every professional program. The G91 prevents Z from moving down if work zero Z is below machine home.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-absrel-1',
        type: 'choice',
        text: 'The tool is at X=10. In G91 mode, you command X5.0. Where does the tool go?',
        options: [
          'X = 5.0 (absolute position 5)',
          'X = 15.0 (10 + 5 = incremental)',
          'X = 10.0 (no movement)',
          'X = -5.0',
        ],
        answer: 'X = 15.0 (10 + 5 = incremental)',
      },
      {
        id: 'cnc-absrel-2',
        type: 'choice',
        text: 'The tool is at X=10. In G90 mode, you command X5.0. Where does the tool go?',
        options: [
          'X = 5.0 (absolute — goes to that fixed position)',
          'X = 15.0 (adds 5 to current position)',
          'X = 10.0 (no movement)',
          'X = 50.0',
        ],
        answer: 'X = 5.0 (absolute — goes to that fixed position)',
      },
      {
        id: 'cnc-absrel-3',
        type: 'choice',
        text: 'Why is G91 G28 Z0 safer than G90 G28 Z0 for a Z home return?',
        options: [
          'G91 is always faster than G90',
          'G90 G28 Z0 would first move Z to the work-zero position, which could be below the part',
          'G91 cancels tool length offsets automatically',
          'G28 only works in G91 mode',
        ],
        answer: 'G90 G28 Z0 would first move Z to the work-zero position, which could be below the part',
      },
      {
        id: 'cnc-absrel-4',
        type: 'choice',
        text: 'In G91 mode, you command X10.0 three times in a row. Where does the tool end up?',
        options: [
          'X = 10.0 (second and third commands do nothing)',
          'X = 20.0 (only moves twice)',
          'X = 30.0 (three incremental moves of 10 each)',
          'X = 10.0 (incremental from zero)',
        ],
        answer: 'X = 30.0 (three incremental moves of 10 each)',
      },
      {
        id: 'cnc-absrel-5',
        type: 'input',
        text: 'What G-code activates absolute coordinate mode? ',
        answer: 'G90',
      },
    ]
  },

  mentalModel: [
    'G90 = Where? (destination from work zero)',
    'G91 = How far? (distance from current position)',
    'G90 is safer: errors do not compound across blocks.',
    'G91 errors accumulate — each wrong move shifts all following moves.',
    'G91 G28 Z0 = the standard safe home return. Memorize it.',
    'Always return to G90 after any G91 usage.',
  ],
}
