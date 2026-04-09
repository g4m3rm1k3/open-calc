export default {
  id: 'cnc-absolute-incremental',
  slug: 'absolute-vs-incremental',
  chapter: 'cnc-1',
  order: 5,
  title: 'Absolute vs Incremental',
  subtitle: 'G90 / G91 — Where Am I Going vs How Far Do I Go?',
  tags: ['G90', 'G91', 'absolute', 'incremental', 'distance mode', 'coordinate mode', 'modal', 'RS-274', 'error propagation'],

  semantics: {
    core: [
      { symbol: 'G90', meaning: 'Absolute Mode: All coordinates are measured from the active Work Zero (the origin). X1.0 always means "go to position 1.0 from zero".' },
      { symbol: 'G91', meaning: 'Incremental Mode: All coordinates are measured from the CURRENT tool position. X1.0 means "move 1.0 from wherever you are now".' },
      { symbol: 'Work Zero', meaning: 'The origin (0,0,0) of the active work coordinate system (G54). Absolute coordinates are measured from here.' },
      { symbol: 'Current Position', meaning: 'Where the tool tip is right now. Incremental moves add to this.' },
      { symbol: 'Modal Group 03', meaning: 'G90 and G91 are modal and belong to the same group (per Fanuc/RS-274). Only one can be active at a time; the last one issued wins.' },
      { symbol: 'Default Mode', meaning: 'Most modern controls (Fanuc, Haas, Siemens) power up or reset to G90 absolute mode, but NEVER assume this — always declare explicitly.' },
    ],
    rulesOfThumb: [
      'G90 (absolute) is the default and safest mode for most CNC work. Use it for all cutting moves.',
      'G91 (incremental) is useful for: G28 home returns, drilling patterns, bolt circles, and situations where relative distance is the natural way to think.',
      'Never leave G91 active at the end of a program. The next program will inherit incremental mode and crash.',
      'In G90: repeating the same coordinate command does nothing (tool is already there). In G91: it moves again each time.',
      'Always declare G90 (and G17/G40/G49/G80) at the very start of every program and after every tool change. This establishes a known safe state.',
      'Power-on, M30, or RESET usually defaults to G90 — but explicit declaration prevents inherited-mode disasters from previous programs.',
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
      'Choosing the right one for each situation — and understanding why errors compound in incremental mode — is essential for safe programming. ' +
      'This distinction has saved (and crashed) more parts than any other modal command in CNC history.',
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
      },
      {
        id: 'ErrorAccumulationLab',
        props: {
          initialCode:
            '(ERROR ACCUMULATION DEMO — same typo, different results)\n' +
            'G21 G90\n' +
            'G00 X0 Y0\n' +
            '(Intended: three +10 mm moves in X)\n' +
            '(--- G90 with typo in second block: X19.9 instead of X20 ---\n' +
            'G01 X10.0 F100\n' +
            'G01 X19.9      (typo!)\n' +
            'G01 X30.0      (corrects itself)\n' +
            '\n' +
            'G00 X0 Y0\n' +
            'G91\n' +
            '(--- G91 with same typo ---\n' +
            'G01 X10.0\n' +
            'G01 X9.9       (typo!)\n' +
            'G01 X10.0      (still off by 0.1)\n' +
            'G90\n' +
            'M30'
        },
        title: 'Error Accumulation Lab',
        caption: 'A single 0.1 mm typo in G91 shifts every subsequent move forever. G90 isolates the error to one block. Run both and watch the final X position.',
      }
    ],
    prose: [
      '**Absolute (G90) — "Where is it?"**: In absolute mode, every coordinate in your program refers to a fixed location in space — measured from Work Zero. X25.4 always means "the point that is 25.4 mm to the right of work zero," no matter where the tool currently is. If you write X25.4 twice in a row, the second command does nothing — the tool is already there.',

      '**Incremental (G91) — "How far?"**: In incremental mode, every coordinate is added to the current tool position. X25.4 means "move 25.4 mm from wherever you are right now." If you write X25.4 twice in a row, the tool moves 25.4 mm, then another 25.4 mm — ending up 50.8 mm from the start. Each command is a *delta* (a change), not a destination.',

      '**When To Use Each**:\n' +
      '- **Use G90 for almost everything**: Tool paths, profiling, pocketing, drilling — whenever you are programming to specific part geometry. Absolute mode prevents error accumulation and is easier to debug.\n' +
      '- **Use G91 for**: Machine home returns (`G28 G91 Z0` — the standard home return idiom), repeating patterns (bolt circles, slot arrays), canned-cycle repeats (`L` or `K` with incremental X/Y), and relative movements where distance is more natural than destination.\n' +
      '- **The classic home return**: `G91 G28 Z0` means "from wherever Z is right now, go to machine home." This is safer than `G90 G28 Z0` because it does not require knowing the current position. `G91 Z0` is a zero-distance incremental move — the starting point for G28.',

      '**Mixing Modes Within a Program**: You can switch between G90 and G91 freely within a program. Many professional programs use G90 for all cutting moves and switch to G91 specifically for the home return or pattern repeats, then switch back. As long as you are deliberate about when each is active (and always reset to G90), mixing is fine and common in production code.',

      '**The Error Accumulation Danger of G91**: In G91, an error in one move shifts all subsequent moves. If you accidentally write X-29.9 instead of X-30.0 (a 0.1 mm typo), the next line starts from the wrong position and is also wrong by 0.1 mm — and this compounds through the entire program. In G90, any single error only affects that one move; the next move returns to the correct absolute position.',

      '**Historical Context**: G90 and G91 trace their roots to the birth of Numerical Control (NC) at MIT in the 1950s, when machinists programmed early machines via punched paper tape. The EIA RS-274 standard (later RS-274-D and the NIST RS274NGC interpreter) formalized these commands in the 1960s–1970s. Incremental mode (G91) was prized in the tape era because shorter coordinate values reduced tape length and punch time for repetitive features like bolt circles. With modern CAD/CAM, memory-rich controls, and simulation software, absolute mode (G90) became the industry standard for readability, debuggability, and safety. Every major control (Fanuc, Haas, Siemens, Heidenhain) still honors this exact behavior today — understanding both lets you read legacy programs and optimize modern ones.',
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

      '**Vector Representation** (modern CNC controllers internally track this):',
      'Let $\\vec{P} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}$ be the current position vector.',
      '**G90**: $\\vec{P}_{n+1} \\leftarrow \\begin{pmatrix} X \\\\ Y \\\\ Z \\end{pmatrix}_{\\text{cmd}}$',
      '**G91**: $\\vec{P}_{n+1} \\leftarrow \\vec{P}_n + \\begin{pmatrix} X \\\\ Y \\\\ Z \\end{pmatrix}_{\\text{cmd}}$',

      '**Error Propagation Example** (0.1 mm typo in the *second* move of three intended +10 mm X steps, starting at X=0):',
      '**G90 sequence**: X10 → X19.9 (one block off) → X30 (self-corrects). Final error = 0 mm.',
      '**G91 sequence**: X10 → X19.9 → X29.9 (error compounds). Final error = −0.1 mm (and every later move stays shifted).',
      'Mathematically in G91: final error $= \\sum_{i=\\text{error block}}^{k} \\epsilon_i$. This is why absolute mode is preferred for complex contours.',
    ],
  },

  rigor: {
    prose: [
      '**G91 and Canned Cycles**: Incremental mode has special behavior inside canned cycle definitions (G81, G83, etc.). The Q (peck increment) and R (return plane) values are always interpreted relative to the current Z — effectively always incremental, even in G90 mode. This is a common source of confusion. Study your controller\'s canned cycle documentation carefully.',

      '**The G90.1 / G91.1 Arc Mode**: On some Fanuc variants, `G90.1` and `G91.1` separately control whether arc center offsets (I, J, K) are absolute or incremental, independent of the main G90/G91 setting. By default, I/J/K are always incremental from the arc start point. This is covered in the Circular Interpolation lesson.',

      '**G91 in Macro Programming**: Inside Fanuc Macro B programs (the advanced programming layer), some macro calls use G91 implicitly. The G65 call (macro call) passes parameters in a context that can affect how the called macro interprets position arguments. Always verify the active mode before executing macro calls.',

      '**Spindle and Feed Behavior**: G90/G91 only affect axis coordinate interpretation. Feedrates, spindle speeds, dwell times, and all other non-axis words are unaffected by this modal switch.',

      '**Controller Defaults & Legacy Programs**: Power-on or M30 usually resets to G90, but older machines or custom macros may not. When loading legacy punched-tape programs, always add an explicit G90 at the top. Subprograms (M98) inherit the calling program\'s mode unless you reset it inside the sub.',

      '**Best Practice in Production**: Every professional shop standard includes a "safety block" at program start: `G90 G17 G40 G49 G80 G21` (or G20). This eliminates 90% of mode-related crashes before they happen.',
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
    {
      id: 'ex-error-accumulation',
      title: 'Error Accumulation Demo (The 0.1 mm Typo That Ruins Everything)',
      problem: 'Start at X=0. Issue three +10 mm X moves. Introduce a 0.1 mm typo in the *second* command only. Compare final position in each mode.',
      steps: [
        { expression: 'G90 (typo: second block X19.9 instead of X20):', annotation: 'Positions: X10 → X19.9 (one isolated error) → X30 (self-corrects). Final error = 0 mm.' },
        { expression: 'G91 (same typo: second block X9.9 instead of X10):', annotation: 'Positions: X10 → X19.9 → X29.9. Final error = −0.1 mm (propagates forever).' },
      ],
      conclusion: 'One tiny typo in incremental mode shifts the entire remaining toolpath. This is why absolute mode is mandatory for production contours and why simulation + verification is non-negotiable.',
    },
    {
      id: 'ex-drill-array',
      title: 'Efficient Drilling Pattern with G91 + Canned Cycle',
      problem: 'Drill 3 holes spaced 20 mm apart along X, starting at absolute X10 Y10 (depth Z−10, R2).',
      steps: [
        { expression: 'G90 G81 X10 Y10 Z-10 R2 F100', annotation: 'Absolute first hole — sets the cycle.' },
        { expression: 'G91 X20 L2', annotation: 'Incremental repeats: move +20 mm in X and drill two more holes (L=loop count).' },
        { expression: 'G80', annotation: 'Cancel canned cycle.' },
        { expression: 'G90', annotation: 'Return to absolute mode (good habit).' },
      ],
      conclusion: 'G91 + L (or K) inside canned cycles is the professional way to program linear arrays or grids. The X/Y values in the repeat line are *always* incremental, even if the overall mode is G90. Clean, compact, and error-resistant.',
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
      {
        id: 'cnc-absrel-6',
        type: 'choice',
        text: 'What happens if you leave the machine in G91 at the end of a program (no final G90)?',
        options: [
          'Nothing — M30 resets everything',
          'The next program will run entirely in incremental mode and almost certainly crash',
          'G91 is automatically canceled on program end',
          'Only affects Z axis',
        ],
        answer: 'The next program will run entirely in incremental mode and almost certainly crash',
      },
      {
        id: 'cnc-absrel-7',
        type: 'input',
        text: 'What is the exact standard safe Z-home return sequence used in 99% of professional programs?',
        answer: 'G91 G28 Z0',
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
    'G90 = GPS fixed address. G91 = turn-by-turn directions (wrong early turn = lost forever).',
    'One typo in G91 is a career-ending crash risk. One typo in G90 is a single scrap feature.',
  ],
}