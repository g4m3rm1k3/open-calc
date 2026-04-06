export default {
  id: 'cnc-units-measurement',
  slug: 'units-and-measurement',
  chapter: 'cnc-1',
  order: 2,
  title: 'Units & Measurement',
  subtitle: 'G20/G21 — Inches, Millimeters, and Why It Matters',
  tags: ['G20', 'G21', 'metric', 'imperial', 'inch', 'millimeter', 'tolerance', 'conversion'],

  semantics: {
    core: [
      { symbol: 'G20', meaning: 'Inch Mode: All programmed coordinates and feedrates are in inches and inches-per-minute (ipm).' },
      { symbol: 'G21', meaning: 'Metric Mode: All programmed coordinates and feedrates are in millimeters and millimeters-per-minute (mm/min).' },
      { symbol: 'IPM', meaning: 'Inches Per Minute — standard feedrate unit in inch mode.' },
      { symbol: 'mm/min', meaning: 'Millimeters Per Minute — standard feedrate unit in metric mode.' },
      { symbol: 'IPR / mm/rev', meaning: 'Inches Per Revolution / mm per Revolution — used in G95 (per-revolution feedrate mode), common on lathes.' },
      { symbol: 'Tolerance', meaning: 'The allowable deviation from the nominal dimension. Typically ±0.001" (0.025 mm) for general machining; ±0.0001" (0.0025 mm) for precision work.' },
    ],
    rulesOfThumb: [
      'G20/G21 must match the machine\'s configured unit mode. A mismatch causes crashes or severely wrong dimensions.',
      'Always put G20 or G21 at the top of every program — never rely on whatever mode the machine happens to be in.',
      '1 inch = 25.4 mm exactly. This is a defined exact relationship, not an approximation.',
      'Metric programs use larger numbers (X25.4 instead of X1.0) — don\'t be surprised by 4-digit feedrates.',
    ]
  },

  hook: {
    question: 'If your program says X1.0 but the machine thinks in millimeters, how far does it actually move?',
    realWorldContext:
      'In 1999, NASA lost the $327 million Mars Climate Orbiter because one engineering team sent thruster data in imperial units ' +
      'while another team expected metric units. The spacecraft burned up in the Martian atmosphere. ' +
      'CNC machines have the same problem. If you load an inch-mode program into a metric machine without the correct G20/G21 header, ' +
      'a command for X1.0 (meaning 1 inch = 25.4 mm) will be executed as X1.0 mm — about 96% short of the intended move. ' +
      'Every dimension, every feedrate, every tolerance — all of it depends on the unit mode being correct.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(UNIT MODE DEMONSTRATION)\n' +
            '(This program runs in inch mode)\n' +
            'G20             (Explicitly set inch mode)\n' +
            'G00 X0 Y0\n' +
            'G01 X1.0 F20.0  (1.000 inch = 25.4 mm)\n' +
            'G01 Y0.5 F20.0  (0.500 inch = 12.7 mm)\n' +
            'G01 X0\n' +
            'G01 Y0\n' +
            'M30\n' +
            '\n' +
            '(Try changing G20 to G21 and see how the)\n' +
            '(path compares — same numbers, MUCH smaller move)'
        },
        title: 'Unit Mode Lab',
        caption: 'Run the program as-is (G20, inch mode). Then change G20 to G21 and run again. The numbers are identical but the physical distances are 25× smaller in G21. This is the unit mismatch problem.',
      }
    ],
    prose: [
      '**Two Worlds, One Language**: The CNC world is split between metric (millimeters) and imperial (inches). Europe, Asia, and most of the global automotive and aerospace industry use metric. Much of the United States — especially job shops — still works in inches. Both systems use the same G-code commands (G01, G00, etc.) but all dimensional values are interpreted according to the active unit mode.',

      '**What G20 and G21 Actually Do**: These codes don\'t move anything. They set a **modal flag** inside the controller that tells it: "interpret all subsequent coordinate values as inches" (G20) or "as millimeters" (G21). Every axis word (X, Y, Z), every feedrate (F), every radius (R), every offset value — all of it is scaled by this flag.',

      '**Feedrates Change Too**: An inch-mode feedrate of F20 means 20 inches per minute. That same number in metric mode (F20 after G21) means 20 mm/min — about 39× slower. Forgetting this is a very common crash scenario. A program with F200 in metric mode feeds at 200 mm/min (reasonable). Load it into an inch machine that interprets F200 as 200 ipm (extremely fast) and you have a problem.',

      '**Metric Machines vs Imperial Machines**: Most modern machines ship configured for one unit system via a machine parameter. The G20/G21 command overrides this temporarily for the current program. On some older machines, G20/G21 is replaced by G70/G71 (check your controller manual — this is the Fanuc 6M/10/11 convention). On all modern Fanuc 0i and later: G20 = inches, G21 = metric.',

      '**The Conversion Factor — Know It Cold**: $1 \\text{ inch} = 25.4 \\text{ mm}$ exactly. This is a legally defined exact relationship since 1959. To convert inches to mm: multiply by 25.4. To convert mm to inches: divide by 25.4. A 0.500 inch drill bit has a 12.7 mm diameter. A 6 mm end mill is 0.2362 inches in diameter.',
    ],
  },

  math: {
    prose: [
      'The fundamental conversion is exact and defined:',
      '$1 \\text{ inch} \\equiv 25.4 \\text{ mm}$',
      'Converting coordinates:',
      '$x_{\\text{mm}} = x_{\\text{in}} \\times 25.4$',
      '$x_{\\text{in}} = \\frac{x_{\\text{mm}}}{25.4}$',
      'Feedrate conversion (both measure distance per unit time):',
      '$F_{\\text{mm/min}} = F_{\\text{ipm}} \\times 25.4$',
      'Tolerance conversion — a general machining tolerance of $\\pm0.001$ inch:',
      '$0.001 \\text{ in} \\times 25.4 = 0.0254 \\text{ mm} \\approx 0.025 \\text{ mm}$',
      'Precision machining tolerance $\\pm0.0001$ inch:',
      '$0.0001 \\text{ in} \\times 25.4 = 0.00254 \\text{ mm} \\approx 0.0025 \\text{ mm}$',
      'CNC controllers store position to **4 decimal places in inches** (0.0001") or **3 decimal places in mm** (0.001 mm). Both represent approximately the same physical resolution.',
    ],
  },

  rigor: {
    prose: [
      '**Decimal Resolution Difference**: In G20 (inch), coordinates are stored to 4 decimal places: X1.2345. In G21 (metric), to 3 decimal places: X31.369. The physical resolution is about the same (~0.001 mm / 0.0001"), but be aware that metric programs look different numerically.',

      '**Tool Offsets Are Also Unit-Dependent**: When you store a tool length offset (H value) in the controller, it is stored in the current unit mode. If you switch unit modes mid-setup, offsets measured in inches will be wrong on a metric machine and vice versa. Most shops keep the controller in one unit mode and never switch unless they have a specific workflow for it.',

      '**G20/G21 is a Modal Group 6 Code**: You cannot have both active at once. Writing G21 cancels G20 and vice versa. This is the modal system in action — a concept we cover thoroughly in the Modal Groups lesson.',

      '**Some CAM Systems Always Output One Unit**: If your CAM system is set to output metric G-code, every program it generates will have G21 at the top. If the shop machine is in inch mode and your operator does not notice the G21, disaster. Always check the first few lines of a G-code file before loading it.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-unit-convert',
      title: 'Converting an Inch Program to Metric',
      problem: 'An inch-mode program has the line: G01 X2.500 Y1.750 F15.0. Convert this to metric (G21).',
      steps: [
        { expression: 'X2.500 in × 25.4 = 63.500 mm', annotation: 'Convert X coordinate.' },
        { expression: 'Y1.750 in × 25.4 = 44.450 mm', annotation: 'Convert Y coordinate.' },
        { expression: 'F15.0 ipm × 25.4 = F381.0 mm/min', annotation: 'Convert feedrate — this is a big number change!' },
        { expression: 'G01 X63.500 Y44.450 F381.0', annotation: 'The metric equivalent line.' },
      ],
      conclusion: 'All coordinates and feedrates must be converted. F15 ipm becomes F381 mm/min — if you forget the feedrate conversion and keep F15 in a G21 program, the machine will feed at 15 mm/min (nearly stopped).',
    },
    {
      id: 'ex-cnc-machine-type',
      title: 'Identifying Metric vs Imperial from a Program',
      problem: 'You receive a G-code file with the line: G01 X25.4 Y12.7 F508.0. Is this likely metric or inch mode?',
      steps: [
        { expression: 'X25.4 in inch mode', annotation: '25.4 inches is a 2-foot-plus move — enormous. Unlikely for a typical part.' },
        { expression: 'X25.4 in metric mode', annotation: '25.4 mm = exactly 1 inch. Typical part feature size. Likely metric.' },
        { expression: 'F508 in inch mode', annotation: '508 inches per minute = extremely fast. Probably not a feedrate.' },
        { expression: 'F508 in metric mode', annotation: '508 mm/min = about 20 ipm. Reasonable feedrate for general milling.' },
        { expression: 'Conclusion: G21 (metric) mode', annotation: '25.4 and 12.7 are multiples of the inch-to-mm factor. F508 = 20 ipm × 25.4. This is a metric program derived from inch dimensions.' },
      ],
      conclusion: 'Learning to "read" coordinate values and feedrates to guess the unit mode is a useful skill. When in doubt, look for G20 or G21 near the top of the file.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-units-1',
        type: 'choice',
        text: 'Which G-code activates millimeter (metric) mode?',
        options: ['G20', 'G21', 'G90', 'G94'],
        answer: 'G21',
      },
      {
        id: 'cnc-units-2',
        type: 'input',
        text: 'Convert 2.0 inches to millimeters. (1 inch = 25.4 mm) ',
        answer: '50.8',
      },
      {
        id: 'cnc-units-3',
        type: 'input',
        text: 'A feedrate of F30 in inch mode (G20) equals how many mm/min in metric mode? ',
        answer: '762',
      },
      {
        id: 'cnc-units-4',
        type: 'choice',
        text: 'You load an inch-mode program (G20, F20 ipm) into a machine running in G21 (metric). What happens to the feedrate?',
        options: [
          'The machine feeds at 508 mm/min (correct conversion)',
          'The machine feeds at 20 mm/min (far too slow — interprets ipm number as mm/min)',
          'The machine triggers an alarm',
          'The controller automatically converts the feedrate',
        ],
        answer: 'The machine feeds at 20 mm/min (far too slow — interprets ipm number as mm/min)',
      },
      {
        id: 'cnc-units-5',
        type: 'choice',
        text: 'What is the best practice for unit modes at the start of any G-code program?',
        options: [
          'Leave it out — the machine remembers the last unit mode',
          'Always explicitly state G20 or G21 at the top of the program',
          'Use G70 for inches and G71 for metric on all Fanuc controllers',
          'Only specify units if you are changing from the previous program',
        ],
        answer: 'Always explicitly state G20 or G21 at the top of the program',
      },
    ]
  },

  mentalModel: [
    'G20 = inch mode. G21 = metric mode.',
    '1 inch = 25.4 mm exactly. Memorize this.',
    'F-values scale too — F20 ipm ≠ F20 mm/min.',
    'Always declare G20 or G21 at program start — never trust the machine\'s current mode.',
    'Metric numbers are larger: X25.4 is X1.0 in inches.',
  ],
}
