export default {
  id: 'cnc-program-format',
  slug: 'program-format',
  chapter: 'cnc-1',
  order: 18,
  title: 'Program Format & Safety',
  subtitle: 'The Safe Start Block, M-Code Endings, and the Golden Rules of CNC Programming',
  tags: ['safe start', 'M00', 'M01', 'M02', 'M30', 'program start', 'program end', 'initialization', 'golden rules'],

  semantics: {
    core: [
      { symbol: 'Safe Start Block', meaning: 'The first executable line(s) of a program that establish a known, safe modal state. E.g.: G21 G90 G17 G40 G49 G80 G94.' },
      { symbol: 'M00', meaning: 'Program Stop: Unconditional stop. Spindle stops, coolant off, machine waits. Operator must press Cycle Start to continue. Used for inspection, manual operations mid-program.' },
      { symbol: 'M01', meaning: 'Optional Stop: Like M00, but only active when the Optional Stop switch on the control panel is ON. Used for setup and inspection pauses that can be bypassed in production.' },
      { symbol: 'M02', meaning: 'Program End: Ends the program. On most modern controls, equivalent to M30. Does NOT rewind the program pointer on some older machines.' },
      { symbol: 'M30', meaning: 'Program End and Rewind: Ends the program AND rewinds the pointer to the beginning for the next run. The preferred program end command.' },
      { symbol: 'M99', meaning: 'End Subroutine / Return: In a main program context, M99 can cause the program to loop (repeat from the beginning). In subprograms (M98), it returns to the calling program.' },
    ],
    rulesOfThumb: [
      'Every program starts with an O-number and a safe start block. No exceptions.',
      'M30 is preferred over M02 — it rewinds the program for the next cycle.',
      'M00 stops everything and waits. M01 only stops if the switch is on. Know which you need.',
      'Never end a program with the spindle running or coolant on. M05 and M09 before M30.',
    ]
  },

  hook: {
    question: 'What is the minimum structure a CNC program must have to be safe — and what happens if you leave parts out?',
    realWorldContext:
      'A CNC program without a safe start block is like a car without seatbelts — it might work fine every time, until it doesn\'t. ' +
      'The problem: the machine\'s modal state from the PREVIOUS program affects your program. ' +
      'If the previous program ended with G91 (incremental mode) active, and your program assumes G90 (absolute), ' +
      'the first move of your program goes in the completely wrong direction. ' +
      'A properly structured program declares its intent at the top, cleans up at the bottom, and handles mid-program pauses explicitly. ' +
      'This structure is universal — from the smallest job shop to the largest aerospace production cell.',
    previewVisualizationId: 'ScienceNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'ScienceNotebook',
        props: {
          lesson: {
            title: 'Complete Program Structure',
            cells: [
              {
                type: 'js',
                title: 'Complete Program Template — Annotated',
                html: `<div id="prog" style="font-family:monospace;font-size:13px;line-height:1.7;padding:16px;max-width:760px;margin:0 auto;overflow-x:auto"></div>`,
                css: `body{margin:0;background:#0f172a;color:#e2e8f0;padding:8px}
.sec{margin:12px 0 4px;color:#fbbf24;font-size:11px;text-transform:uppercase;letter-spacing:0.1em}
.line{display:flex;gap:0;padding:1px 0}
.ln{color:#475569;min-width:40px;text-align:right;padding-right:12px;user-select:none}
.code{color:#e2e8f0;white-space:pre}
.cmt{color:#475569}
.hl-green .code{color:#4ade80}
.hl-blue .code{color:#38bdf8}
.hl-amber .code{color:#fbbf24}
.hl-red .code{color:#f87171}
.hl-purple .code{color:#a78bfa}
.tooltip{display:none;position:absolute;background:#1e293b;border:1px solid #334155;border-radius:6px;padding:8px 12px;font-size:12px;color:#94a3b8;max-width:300px;z-index:10}
.line:hover .tooltip{display:block}`,
                startCode: `
const sections = [
  { label:'① PROGRAM IDENTITY', lines: [
    { n:'1', code:'O0500', cmt:'                     (Program Number — the filename on the controller)', hl:'hl-amber' },
  ]},
  { label:'② SAFE START BLOCK', lines: [
    { n:'5', code:'N10  G21 G90 G17 G40 G49 G80 G94', cmt:' (Metric|Abs|XY plane|No comp|No TLO|No cycle|Per-min)', hl:'hl-green' },
  ]},
  { label:'③ TOOL SETUP', lines: [
    { n:'', code:'N20  G00 Z50.0',   cmt:'                     (Safe Z height before tool change)', hl:'' },
    { n:'', code:'N30  T1 M06',       cmt:'                     (Select tool 1, execute tool change)', hl:'' },
    { n:'', code:'N40  G43 H1',       cmt:'                     (Activate tool length offset #1)', hl:'hl-blue' },
  ]},
  { label:'④ SPINDLE & COOLANT START', lines: [
    { n:'', code:'N50  S2500 M03',    cmt:'                     (2500 RPM, clockwise)', hl:'' },
    { n:'', code:'N60  M08',          cmt:'                     (Flood coolant ON)', hl:'' },
  ]},
  { label:'⑤ POSITIONING', lines: [
    { n:'', code:'N70  G00 X0 Y0',    cmt:'                     (Rapid to start position)', hl:'' },
    { n:'', code:'N80  G00 Z2.0',     cmt:'                     (Rapid to clearance height)', hl:'' },
  ]},
  { label:'⑥ CUTTING OPERATIONS', lines: [
    { n:'', code:'N90  G01 Z-5.0 F50',cmt:'                     (Plunge to depth)', hl:'' },
    { n:'', code:'N100 G01 X60.0 F200',cmt:'                    (Cut)', hl:'' },
    { n:'', code:'     ...',           cmt:'                     (More cutting moves)', hl:'' },
  ]},
  { label:'⑦ OPTIONAL INSPECTION STOP (if needed)', lines: [
    { n:'', code:'N200 M01',           cmt:'                     (Optional stop for inspection)', hl:'hl-purple' },
  ]},
  { label:'⑧ SAFE END SEQUENCE', lines: [
    { n:'', code:'N900 G00 Z50.0',    cmt:'                     (Retract from work)', hl:'' },
    { n:'', code:'N910 M09',           cmt:'                     (Coolant OFF)', hl:'hl-red' },
    { n:'', code:'N920 M05',           cmt:'                     (Spindle OFF)', hl:'hl-red' },
    { n:'', code:'N930 G91 G28 Z0',   cmt:'                     (Home Z)', hl:'' },
    { n:'', code:'N940 G90 G28 X0 Y0',cmt:'                     (Home XY)', hl:'' },
    { n:'', code:'N950 M30',           cmt:'                     (Program end + rewind)', hl:'hl-amber' },
  ]},
];

const prog = document.getElementById('prog');
sections.forEach(sec => {
  const label = document.createElement('div');
  label.className = 'sec';
  label.textContent = sec.label;
  prog.appendChild(label);
  sec.lines.forEach(l => {
    const div = document.createElement('div');
    div.className = 'line ' + (l.hl||'');
    div.innerHTML = '<span class="ln">' + (l.n||'') + '</span>' +
      '<span class="code">' + l.code + '</span>' +
      '<span class="cmt">' + l.cmt + '</span>';
    prog.appendChild(div);
  });
});
`
              },
              {
                type: 'challenge',
                title: 'Safe Start Block Question',
                html: '<div></div>',
                css: '',
                startCode: '',
                options: [
                  { label: 'A', text: 'G21 G90 G17 G40 G49 G80 G94' },
                  { label: 'B', text: 'G01 F100 M03 S2000' },
                  { label: 'C', text: 'T1 M06' },
                  { label: 'D', text: 'G53 X0 Y0 Z0' },
                ],
                check: (sel) => sel === 'A',
              }
            ]
          }
        },
        title: 'Complete Program Structure',
        caption: 'This is the standard 8-section structure of any professional CNC program. The colored sections are the most critical: green = safe start (must be first), red = safe end (must stop spindle/coolant before M30), amber = program identity and program end.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            'O0500                         (COMPLETE PROGRAM EXAMPLE)\n' +
            '(=== A complete mill program demonstrating all sections ===)\n' +
            '\n' +
            'N10  G21 G90 G17 G40 G49 G80  (SAFE START BLOCK)\n' +
            '\n' +
            'N20  G00 Z50.0                 (Safe height)\n' +
            'N30  T1 M06                    (Tool 1: 12mm end mill)\n' +
            'N40  G43 H1                    (Tool length offset)\n' +
            'N50  S2500 M03                 (2500 RPM CW)\n' +
            'N60  M08                       (Flood coolant on)\n' +
            '\n' +
            'N70  G00 X10.0 Y10.0           (Rapid to start)\n' +
            'N80  G00 Z2.0\n' +
            'N90  G01 Z-5.0 F50             (Plunge at 50 mm/min)\n' +
            'N100 G01 X60.0 F200            (Cut at 200 mm/min)\n' +
            'N110 G01 Y40.0\n' +
            'N120 G01 X10.0\n' +
            'N130 G01 Y10.0                 (Close profile)\n' +
            '\n' +
            'N900 G00 Z50.0                 (SAFE END)\n' +
            'N910 M09                       (Coolant off)\n' +
            'N920 M05                       (Spindle off)\n' +
            'N930 G91 G28 Z0                (Home Z)\n' +
            'N940 G90 G28 X0 Y0             (Home XY)\n' +
            'N950 M30                       (End + rewind)'
        },
        title: 'Complete Program Lab',
        caption: 'This is a complete, professional-format CNC program. Run it from start to finish. Every section has a purpose. This is the template you will use for every program you write.',
      }
    ],
    prose: [
      '**The 8-Section Program Template**: Every CNC program, from the simplest drill to the most complex 5-axis toolpath, follows the same basic structure. The sections are: (1) O-number, (2) Safe start block, (3) Tool setup, (4) Spindle & coolant, (5) Rapid positioning, (6) Cutting operations, (7) Optional stops, (8) Safe end sequence. Skip any section and you create a potential crash or quality problem.',

      '**The Safe Start Block — Why It\'s Non-Negotiable**: Machine controllers retain modal state between programs. The previous program might have left G91 active, or G41 (cutter compensation) active, or a canned cycle active (G81). If your program starts without resetting these, the first move can go in the wrong direction, the wrong mode, or the wrong position. The safe start block `G21 G90 G17 G40 G49 G80 G94` cancels all of these at once. It takes one line and costs nothing. Always include it.',

      '**M00 vs M01 — Mandatory vs Optional Stop**:\n' +
      '- `M00` stops no matter what. Use it when a human intervention is absolutely required (tool breakage check, probe measurement, part flip).\n' +
      '- `M01` only stops if the operator has the Optional Stop switch ON. Use it for inspection points during setup and first-article verification. In production, the switch is OFF and M01 is ignored — no cycle time penalty.',

      '**M02 vs M30**: Both end the program. M30 also rewinds the program pointer to the beginning, so the next Cycle Start immediately re-runs the program. M02 may or may not rewind depending on the controller version. Use M30 as the standard. Some DNC (drip-feed) setups use M02 with specific behavior — but unless you know your system does something special with M02, prefer M30.',

      '**N-Number Jump Rule**: Use N-numbers in increments of 10 (N10, N20, N30). Use N900+ for the end sequence so you can always jump to end using `GOTO 900` from anywhere in a macro. Leave room (N200, N300, N400) for future operations between the start and end.',
    ],
  },

  math: {
    prose: [
      'The program structure is not mathematical, but the safe start block represents a formal initialization of a state machine:',
      '$$\\text{State}_{\\text{init}} = \\{G21, G90, G17, G40, G49, G80, G94\\}$$',
      'This is a deterministic initial state that overrides any previous modal state. The subsequent blocks of the program compute position trajectories within this known initial state, making the program\'s behavior predictable regardless of what ran before it.',
    ],
  },

  rigor: {
    prose: [
      '**DNC (Drip-Feed) Programs**: In shops that cannot store entire programs in the controller memory (very large programs, many variants), programs are streamed from a PC to the controller line-by-line via serial port or Ethernet. This is called DNC or drip-feed. These systems often use the % delimiter at the start and end of the file as a program boundary marker. The O-number and M30 are still required, but the % sign tells the DNC system where the file begins and ends.',

      '**Subprogram End**: M99 at the end of a subprogram returns to the calling program at the line after the M98 call. However, M99 in a MAIN program (not called via M98) causes the program to loop back to the beginning and re-run continuously. This is used for pallet changers and automation cells where the same cycle repeats. Use it intentionally — an accidental M99 in a main program is a source of confusion.',

      '**Block Skip at End of Program**: Some programmers put a block-skip (`/`) before M30 or before the home return moves, so that in certain modes these can be bypassed. This is a niche practice — understand why before using it.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-bad-start',
      title: 'What Goes Wrong Without a Safe Start Block',
      problem: 'The previous program ended with G91 active. The new program starts without a safe start block and commands G00 X10.0 Y5.0. Where does the tool go if it was at X=50, Y=30?',
      steps: [
        { expression: 'G91 is still active from previous program', annotation: 'Modal state was not reset. The new program inherits it.' },
        { expression: 'G00 X10.0 Y5.0 in G91 mode', annotation: 'In incremental mode: X moves +10 from current, Y moves +5 from current.' },
        { expression: 'Actual position: X=60, Y=35', annotation: 'NOT at X=10, Y=5 as the programmer intended.' },
        { expression: 'Error: 50mm in X, 30mm in Y', annotation: 'The tool went to the wrong place — possibly into a fixture or the part.' },
      ],
      conclusion: 'This crash could have been prevented with a single line: G21 G90 G17 G40 G49 G80 G94 at the start of the new program.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-format-1',
        type: 'choice',
        text: 'What is the purpose of the safe start block?',
        options: [
          'It makes the machine move to the home position',
          'It establishes a known modal state regardless of what the previous program left active',
          'It loads the tool offsets',
          'It sets the spindle speed',
        ],
        answer: 'It establishes a known modal state regardless of what the previous program left active',
      },
      {
        id: 'cnc-format-2',
        type: 'choice',
        text: 'What is the difference between M00 and M01?',
        options: [
          'M00 stops the spindle; M01 stops the feedrate',
          'M00 always stops; M01 only stops if the Optional Stop switch is ON',
          'M00 ends the program; M01 pauses it temporarily',
          'They are identical on all Fanuc controllers',
        ],
        answer: 'M00 always stops; M01 only stops if the Optional Stop switch is ON',
      },
      {
        id: 'cnc-format-3',
        type: 'choice',
        text: 'Why is M30 preferred over M02 for program end?',
        options: [
          'M30 also rewinds the program pointer to the start for the next cycle',
          'M30 is faster than M02',
          'M02 does not stop the spindle',
          'M30 also turns off the machine',
        ],
        answer: 'M30 also rewinds the program pointer to the start for the next cycle',
      },
      {
        id: 'cnc-format-4',
        type: 'input',
        text: 'Name the 7 G-codes in a complete safe start block (space separated, any order): ',
        answer: 'G21 G90 G17 G40 G49 G80 G94',
      },
    ]
  },

  mentalModel: [
    'Safe start block = first thing in every program. Always.',
    'G21 G90 G17 G40 G49 G80 G94 = the 7 words of a safe init.',
    'M00 = always stops. M01 = optional stop (switch-controlled).',
    'M30 = end + rewind. Preferred over M02.',
    'Safe end: retract → coolant off → spindle off → home → M30.',
    'N900+ for end section. Easy GOTO target from macros.',
  ],
}
