export default {
  id: 'cnc-modal-groups',
  slug: 'modal-groups',
  chapter: 'cnc-1',
  order: 4,
  title: 'Modal Groups',
  subtitle: 'The Controller\'s State Machine — Sticky Settings That Rule Everything',
  tags: ['modal', 'G-code groups', 'state machine', 'default state', 'non-modal', 'power-on defaults'],

  semantics: {
    core: [
      { symbol: 'Modal Code', meaning: 'A G or M code that stays active indefinitely once called, until another code from the same group cancels it. "Sticky".' },
      { symbol: 'Modal Group', meaning: 'A numbered category of mutually exclusive G-codes. Only one code from each group can be active at a time. Like radio buttons — selecting one deselects the others.' },
      { symbol: 'Non-Modal (One-Shot)', meaning: 'A code that only applies to the block in which it appears, then has no further effect. G04, G10, G28, G30 are non-modal.' },
      { symbol: 'Power-On Default', meaning: 'The modal state the controller starts in when it powers up, set by machine parameters. Typically: G21 (or G20), G90, G94, G17, G40, G49, G80.' },
      { symbol: 'Initialization Block', meaning: 'A block at the start of every program that explicitly sets the modal state to a known safe configuration, regardless of what the machine was doing before.' },
    ],
    rulesOfThumb: [
      'Think of modal groups as columns of radio buttons. Pressing one button in a column turns off the previous one. You can press one button in each column simultaneously.',
      'You can NEVER have two codes from the same modal group active at the same time.',
      'Never trust the controller\'s current modal state. Always set your state explicitly at the start of every program.',
      'Non-modal codes are one-shot — they do their job in one block and disappear.',
    ]
  },

  hook: {
    question: 'Why can you write G01 X5.0, then X3.0 on the next line without repeating G01 — and why is that both powerful and dangerous?',
    realWorldContext:
      'Early NC machines (before CNC) used punched tape. Every character on tape was expensive in both space and time. ' +
      'Engineers designed the system so that once you declared a code, the machine remembered it. ' +
      'G01 on line 1 means every subsequent line is automatically G01 until you say otherwise. ' +
      'This "stickiness" is called **modal behavior**, and it is the core design principle of G-code. ' +
      'It keeps programs shorter and simpler — but it also means forgetting to change a modal code ' +
      'can silently cause a crash many lines later, when a move you thought was rapid turns out to be a cutting move. ' +
      'Understanding modal groups is the key to reading G-code fluently and writing it safely.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(MODAL STATE DEMONSTRATION)\n' +
            '(Watch how modes persist across blocks)\n' +
            '\n' +
            'G21 G90 G17    (SET STATE: metric, absolute, XY plane)\n' +
            '\n' +
            '(--- Group 1: Motion ---)\n' +
            'G00 X0 Y0      (Rapid mode is now active)\n' +
            'X5.0           (STILL rapid — no G01 was written!)\n' +
            'G01 X8.0 F50   (Switch to feed mode)\n' +
            'X10.0          (STILL G01 F50 — both are modal)\n' +
            'Y3.0           (STILL G01 F50 — modal carries forward)\n' +
            '\n' +
            '(--- What happens if we forget modal state? ---)\n' +
            'G00 Z5.0       (Rapid retract — clears G01 from Group 1)\n' +
            'G00 X0 Y0      (Safe rapid return to start)\n' +
            'M30'
        },
        title: 'Modal State Lab',
        caption: 'Trace through the code carefully. After G01 X8.0 F50, notice that X10.0 and Y3.0 are both cutting moves at F50 — even though neither re-states G01. Then G00 switches Group 1 back to rapid. The controller\'s modal state is everything.',
      }
    ],
    prose: [
      '**The Radio Button Analogy**: Imagine a control panel with columns of radio buttons. Each column is a modal group. You can press exactly one button per column — pressing a new button automatically releases the old one. You can press one button in each column at the same time. This is exactly how modal groups work. G00, G01, G02, G03 are all in Group 1 (motion). Only one can be active.',

      '**The Most Important Modal Groups (Fanuc)**:\n' +
      '- **Group 1 — Motion**: G00 (rapid), G01 (linear), G02 (arc CW), G03 (arc CCW). The cutting mode. This is the most critical group.\n' +
      '- **Group 2 — Plane**: G17 (XY), G18 (ZX), G19 (YZ). Controls which plane arcs and canned cycles operate in. Default: G17.\n' +
      '- **Group 3 — Distance Mode**: G90 (absolute), G91 (incremental). Controls how coordinates are interpreted. Default: G90.\n' +
      '- **Group 5 — Feedrate Mode**: G94 (per-minute), G95 (per-revolution). Default: G94.\n' +
      '- **Group 6 — Units**: G20 (inch), G21 (metric). Set by program and machine parameters.\n' +
      '- **Group 7 — Cutter Compensation**: G40 (off), G41 (left comp), G42 (right comp). Default: G40.\n' +
      '- **Group 8 — Tool Length Offset**: G43 (positive offset), G44 (negative), G49 (cancel). Default: G49.\n' +
      '- **Group 10 — Canned Cycle Return**: G98 (return to initial), G99 (return to R-plane). Default: G98.\n' +
      '- **Group 12 — Work Coordinate**: G54, G55, G56, G57, G58, G59. Active work offset. Default: G54.',

      '**Non-Modal Codes — The One-Shot Codes**: Some G-codes are not modal at all. G04 (dwell) only dwells for that one block. G28 (home return) returns home in that block only. G10 (parameter input) sets a value in that block. After execution, they leave no modal state and the previous Group 1 mode resumes.',

      '**Power-On Defaults**: When the machine powers up, it starts in a defined modal state set by machine parameters. On a typical Fanuc machine: G21 or G20 (per parameter), G90, G94, G17, G40, G49, G80 (no canned cycle). This default state may differ between machines and between power cycles. That is why the initialization block at the top of every program is essential.',

      '**The Safe Initialization Block**: Every professional G-code program begins with a line that explicitly sets all critical modal states:',
    ],
  },

  math: {
    prose: [
      'The controller\'s modal state can be formally modeled as a tuple of group states:',
      '$\\text{State} = (G_1, G_2, G_3, G_5, G_6, G_7, G_8, G_{10}, G_{12}, \\ldots)$',
      'where each $G_i$ is the currently active code from modal group $i$. Initially (power-on):',
      '$\\text{State}_0 = (G00, G17, G90, G94, G21, G40, G49, G98, G54, \\ldots)$',
      'When block $k$ is executed, only the groups referenced in that block change:',
      '$G_i^{(k+1)} = \\begin{cases} \\text{new code from block}_k & \\text{if block}_k \\text{ contains a Group } i \\text{ code} \\\\ G_i^{(k)} & \\text{otherwise (modal inheritance)} \\end{cases}$',
      'This is the formal definition of "sticky" modal behavior. Every block is a partial update to the state vector.',
    ],
  },

  rigor: {
    prose: [
      '**Parameter-Controlled Defaults**: On Fanuc 0i/30i, machine parameters (system parameters, bit-level settings) determine the power-on default for G20/G21, and some other groups. Different shops configure these differently. A machine that defaults to G20 will behave differently than one defaulting to G21 if the program does not explicitly set the unit mode. Always program defensively — set your state explicitly.',

      '**G-Code Group Table (Fanuc 0i, partial)**:\n' +
      'Group 1: G00, G01, G02, G03, G33\n' +
      'Group 2: G17, G18, G19\n' +
      'Group 3: G90, G91\n' +
      'Group 4: G22, G23 (stored stroke check)\n' +
      'Group 5: G94, G95\n' +
      'Group 6: G20, G21\n' +
      'Group 7: G40, G41, G42\n' +
      'Group 8: G43, G44, G49\n' +
      'Group 9: G73, G74, G76, G80, G81, G82, G83, G84, G85, G86, G87, G88, G89 (canned cycles)\n' +
      'Group 10: G98, G99\n' +
      'Group 12: G54, G55, G56, G57, G58, G59\n' +
      'Group 13: G61, G64 (exact stop / cutting mode)',

      '**Two G-Codes from the Same Group in One Block**: This is illegal. The controller will generate an alarm. G00 and G01 cannot appear in the same block. G90 and G91 cannot appear in the same block. If you accidentally do this, the controller will alarm out before executing anything.',

      '**G-Code Memory vs Program State**: The modal state persists between programs on some machines if they do not end with a proper reset. A program that ends with G91 (incremental mode) active will leave the controller in incremental mode for the next program. This is a notorious source of crashes when operators load a program expecting G90 (absolute) mode.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-modal-trace',
      title: 'Tracing Modal State Through a Program',
      problem: 'Trace the active modal state after each block. What is the motion mode at N60?',
      code: 'N10 G21 G90 G17\nN20 G00 X0 Y0\nN30 G01 X5.0 F30\nN40 X8.0\nN50 G00 Z5.0\nN60 Y3.0',
      steps: [
        { expression: 'N10: G21, G90, G17', annotation: 'Group 6=G21, Group 3=G90, Group 2=G17. Motion group still unset (controller default G00 on most machines).' },
        { expression: 'N20: G00 active', annotation: 'Group 1 = G00 (rapid). X0 Y0 are target coordinates.' },
        { expression: 'N30: G01 active, F30', annotation: 'Group 1 switches from G00 to G01. Feedrate = 30 mm/min (modal). Move to X5.0.' },
        { expression: 'N40: G01 modal, F30 modal', annotation: 'No G-code in block. Group 1 stays G01. F stays 30. Move to X8.0 as a feed move.' },
        { expression: 'N50: G00 active', annotation: 'Group 1 switches back to G00. Rapid retract in Z. Feedrate is irrelevant for rapids.' },
        { expression: 'N60: G00 still active', annotation: 'No G-code in this block. Group 1 is still G00 from N50. Y3.0 is a RAPID move — not a feed move!' },
      ],
      conclusion: 'N60 performs a RAPID move to Y3.0 — because G00 was set in N50 and never changed. If you expected this to be a feed move (G01), this is a silent error that would cause a crash if the tool were near the part.',
    },
    {
      id: 'ex-cnc-safe-init',
      title: 'Writing a Safe Initialization Block',
      problem: 'Write an initialization block that sets the controller to a known safe state for milling.',
      steps: [
        { expression: 'G21', annotation: 'Group 6: Set metric mode (use G20 for inch programs).' },
        { expression: 'G90', annotation: 'Group 3: Set absolute coordinates.' },
        { expression: 'G17', annotation: 'Group 2: Select XY plane for arcs and canned cycles.' },
        { expression: 'G40', annotation: 'Group 7: Cancel any active cutter compensation.' },
        { expression: 'G49', annotation: 'Group 8: Cancel any active tool length offset.' },
        { expression: 'G80', annotation: 'Group 9: Cancel any active canned cycle.' },
        { expression: 'G94', annotation: 'Group 5: Set per-minute feedrate mode.' },
        { expression: 'Result: G21 G90 G17 G40 G49 G80 G94', annotation: 'All seven can go in one block — each is from a different modal group. This is the standard safe start line.' },
      ],
      conclusion: 'This single block guarantees a known state regardless of what the machine was doing before. This is the first non-comment line of every professional G-code program.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-modal-1',
        type: 'choice',
        text: 'G00 and G01 are in the same modal group. What happens if you write both in one block?',
        options: [
          'The controller executes both sequentially',
          'The controller uses the last one written',
          'The controller triggers an alarm — two codes from the same group cannot be in one block',
          'G00 always takes priority',
        ],
        answer: 'The controller triggers an alarm — two codes from the same group cannot be in one block',
      },
      {
        id: 'cnc-modal-2',
        type: 'choice',
        text: 'After N30 G01 X5.0 F30, the next block is N40 X8.0. What mode does N40 execute in?',
        options: [
          'Rapid (G00) — no G-code means rapid is assumed',
          'Linear feed (G01) at F30 — both are modal from N30',
          'The block does nothing — no G-code was specified',
          'Linear feed (G01) but feedrate is undefined',
        ],
        answer: 'Linear feed (G01) at F30 — both are modal from N30',
      },
      {
        id: 'cnc-modal-3',
        type: 'choice',
        text: 'Which of these is a NON-modal (one-shot) code?',
        options: ['G01', 'G21', 'G04', 'G90'],
        answer: 'G04',
      },
      {
        id: 'cnc-modal-4',
        type: 'choice',
        text: 'What is the purpose of the initialization block at the start of a program?',
        options: [
          'To set the tool number',
          'To guarantee a known modal state regardless of the previous program\'s state',
          'To set the spindle speed',
          'To define the work offset',
        ],
        answer: 'To guarantee a known modal state regardless of the previous program\'s state',
      },
      {
        id: 'cnc-modal-5',
        type: 'input',
        text: 'G90 (absolute mode) and G91 (incremental mode) are in the same modal group. If G90 is active and you command G91, what happens to G90? ',
        answer: 'It is cancelled',
      },
    ]
  },

  mentalModel: [
    'Modal = sticky. Once set, stays set until changed.',
    'Modal group = radio buttons. One active at a time per group.',
    'Non-modal = one-shot. Only affects its own block.',
    'ALWAYS initialize modal state at program start — never trust the current state.',
    'A silent modal error can crash the machine many lines after the mistake.',
  ],
}
