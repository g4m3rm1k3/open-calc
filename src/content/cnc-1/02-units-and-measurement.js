/**
 * LESSON: UNITS & MEASUREMENT (G20/G21)
 * A deep-dive into the dual-world of CNC machining: Inches and Millimeters.
 * Historical context: The 1959 International Yard and Pound Agreement.
 * Estimated Length: ~600 Lines.
 */

export default {
  id: 'cnc-units-measurement',
  slug: 'units-and-measurement',
  chapter: 'cnc-1',
  order: 2,
  title: 'Units & Measurement: The Language of Precision',
  subtitle: 'G20/G21 — From the Mars Orbiter to the Sub-Micron Chip',
  tags: ['G20', 'G21', 'metric', 'imperial', 'inch', 'millimeter', 'tolerance', 'conversion', 'kinematics'],

  semantics: {
    core: [
      { 
        symbol: 'G20', 
        meaning: 'Imperial/Inch Mode. Interprets all linear coordinate words (X, Y, Z, U, V, W, I, J, K, R) ' +
                 'as inches. Feedrates (F) are interpreted as Inches Per Minute (IPM) or Inches Per Revolution (IPR).' 
      },
      { 
        symbol: 'G21', 
        meaning: 'Metric/Millimeter Mode. Interprets all linear coordinate words as millimeters. ' +
                 'Feedrates (F) are interpreted as Millimeters Per Minute (mm/min) or mm Per Revolution (mm/rev).' 
      },
      { 
        symbol: 'Modal Group 6', 
        meaning: 'The G-code category containing G20 and G21. Only one can be active at any time; ' +
                 'calling one automatically cancels the other.' 
      },
      { 
        symbol: '25.4', 
        meaning: 'The Exact Constant. By international law, 1 inch is defined as exactly 25.4 millimeters. ' +
                 'There is no rounding error in this conversion.' 
      },
      { 
        symbol: 'IPM (Inches Per Minute)', 
        meaning: 'The velocity of the tool tip in Imperial mode. Common machining feedrates range from 0.5 to 300 IPM.' 
      },
      { 
        symbol: 'mm/min', 
        meaning: 'The velocity of the tool tip in Metric mode. Equivalent to IPM × 25.4. ' +
                 'Common machining feedrates range from 12 to 7500 mm/min.' 
      },
      { 
        symbol: 'Machine Parameter', 
        meaning: 'The "Native" unit system of the machine controller. While G20/G21 overrides the program ' +
                 'units, the machine’s internal "brain" (and often its offsets) stays in its native parameter mode.' 
      }
    ],
    rulesOfThumb: [
      'The "Safety Header" Rule: Always place G20 or G21 in the first two lines of your program. Never assume.',
      'Unit Mismatch = Disaster: If you run an inch program in metric mode, the machine moves 1/25th the intended distance. If you run a metric program in inch mode, it moves 25x further (and will likely crash instantly).',
      'Offsets Follow the Mode: On many older Fanuc controls, your tool offsets must be entered in the system\'s native units, even if the program uses the other G-code.',
      'Scale your Feedrates: When converting from G20 to G21, remember that F10.0 becomes F254.0. If you forget, the machine will move like a snail.',
    ]
  },

  hook: {
    question: 'How did a simple unit conversion error cost NASA $327 million and destroy a spacecraft?',
    realWorldContext:
      'In September 1999, the Mars Climate Orbiter approached the Red Planet. One engineering team at Lockheed Martin ' +
      'calculated the thruster performance in Imperial units (Pound-seconds), while the navigation team at NASA ' +
      'expected Metric units (Newton-seconds). The software failed to convert. The orbiter dipped too low into the ' +
      'atmosphere and burned up. ' +
      'This same catastrophe happens in CNC machine shops every day. A machinist loads a program written for a metric ' +
      'machine into an imperial one, or forgets a G20/G21 header. The result is a "Scrapped" part at best, and a ' +
      'shattered spindle at worst. In the world of CNC, units are not just a preference; they are a binding contract ' +
      'between the programmer and the iron.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(THE UNIT MISMATCH EXPERIMENT)\n' +
            'G20 (Set to Inches)\n' +
            'G00 X0 Y0\n' +
            'G01 X1.0 F30.0 (Move 1.0 Inch)\n' +
            'G01 Y1.0 \n' +
            'G00 X0 Y0\n\n' +
            '(NOW, CHANGE G20 TO G21 AND RE-RUN)\n' +
            '(Notice the tiny square in the corner?)\n' +
            '(That is the same "1.0" interpreted as 1mm)'
        },
        title: 'Visualizing the 25.4x Difference',
        caption: 'Watch how the machine interprets the number "1.0" depending on the active unit mode. ' +
                 'In G20, it is a significant move. In G21, it is almost invisible.'
      }
    ],
    prose: [
      '### I. The Great Divide: A Tale of Two Systems',
      'The manufacturing world is physically split. North America remains largely anchored to the **Imperial System** ' +
      '(inches, feet, pounds), a legacy of the British Industrial Revolution. The rest of the globe, and nearly all ' +
      'modern high-tech industries (automotive, electronics, medical), operates on the **International System of Units (SI)**, ' +
      'specifically millimeters.',
      
      'In CNC, this creates a "Bilingual" requirement. A modern CNC controller is perfectly happy in either world, ' +
      'but it requires a specific command to tell it which language we are speaking today. ' +
      '* **G20** tells the machine: "Every number you see is an Inch." ' +
      '* **G21** tells the machine: "Every number you see is a Millimeter."',

      '### II. The 1959 Legal Pivot: Why 25.4 is Perfect',
      'Historically, the "Inch" varied slightly between the US and the UK. To solve this, the **1959 International ' +
      'Yard and Pound Agreement** defined the inch as exactly **25.4 millimeters**. ' +
      '**Scientific Fact:** This is not an approximation. It is an "Absolute Definition." ' +
      'When you convert an inch program to metric, you aren\'t losing precision through rounding; you are ' +
      'performing a perfect mathematical mapping. This is why CNC controllers can toggle between them ' +
      'without "drifting" off target.',

      '### III. The Invisible Trap: Feedrate Inversion',
      'While coordinate moves are obvious, **Feedrates (F-words)** are the silent killers. ' +
      'Imagine you are cutting aluminum at 20 Inches Per Minute (G20 F20.0). ' +
      'If you accidentally switch to G21 without updating the F-word, the machine now moves at 20 Millimeters Per Minute. ' +
      '**The Result:** The tool is moving so slowly that it creates "Friction Rubbing" instead of "Cutting." This ' +
      'generates massive heat, melts the aluminum to the tool, and snaps the cutter in seconds.',
      
      'Conversely, a metric feedrate of F500 (500 mm/min) is a slow crawl. But if interpreted as G20 F500 (500 IPM), ' +
      'the machine will scream across the table at its maximum velocity, likely resulting in a violent collision.',

      '### IV. Modal Logic and the Power-On State',
      'G20 and G21 are **Modal Group 6** codes. "Modal" means the machine remembers the setting until it is ' +
      'explicitly told otherwise. ' +
      '**The Danger:** If the previous machinist ran a metric job and left the machine in G21 mode, and you ' +
      'load your inch program without a G20 header, the machine will run your code as metric. ' +
      'This is why the **"Safety Line"** at the start of a program usually looks like this: `G20 G17 G40 G80 G90`. ' +
      'It "resets" the machine’s brain to a known state before the first move.',
    ],
  },

  math: {
    prose: [
      '### The Mathematical Transformation',
      'When a controller receives a G20/G21 command, it applies a scalar transformation to the entire ' +
      'coordinate system. Let $C_{native}$ be the internal machine unit (usually stored in microns or tenths of a thou).',
      
      '**Conversion Formulas:**',
      '$ \text{Target (mm)} = \text{Target (inch)} \times 25.4 $',
      '$ \text{Target (inch)} = \text{Target (mm)} / 25.4 $',

      '### Precision and Significant Digits',
      'CNC controllers have a "Least Input Increment." ' +
      '* In **Imperial (G20)**, this is typically **0.0001"** (one ten-thousandth of an inch). ' +
      '* In **Metric (G21)**, this is typically **0.001mm** (one micron).',

      '**Comparing the Resolution:**',
      '$ 0.0001 \text{ inch} = 0.00254 \text{ mm} $',
      '$ 0.001 \text{ mm} = 0.000039 \text{ inch} $',
      
      'Notice that 1 micron ($0.001\text{mm}$) is actually more precise than "one tenth" ($0.0001\text{"}$). ' +
      'For this reason, ultra-precision aerospace and medical parts are almost exclusively programmed in **Metric**, ' +
      'as the "Grid" of the machine is finer, allowing for tighter mathematical rounding during complex 3D surfacing.',

      '### Feedrate Math',
      'If you need to maintain a specific "Chip Load" (the thickness of the slice of metal each tooth takes), ' +
      'you must convert the feedrate perfectly:',
      '$ F_{mm} = F_{in} \times 25.4 $',
      'Failure to maintain this ratio changes the physics of the cut, affecting tool life and surface finish.'
    ],
  },

  science: {
    prose: [
      '### Thermodynamics and Measurement',
      'The choice of units doesn\'t change physics, but it affects how we perceive it. ' +
      '**Coefficient of Thermal Expansion (CTE):** Machine tools are made of steel and cast iron. ' +
      'In Imperial units, steel expands at roughly $0.0000065$ inches per inch per degree Fahrenheit. ' +
      'In Metric, this is expressed as $11.7$ microns per meter per degree Celsius.',
      
      'When working to high precision, machinists must "soak" the part to a standard temperature ' +
      '($20^\circ\text{C}$ or $68^\circ\text{F}$). A unit error in the measurement of the part ' +
      'compared to the unit error in the measurement of the machine leads to "Stack-up Errors."',

      '### Encoder Resolution',
      'The "Eyes" of the machine are the optical encoders. They count pulses as the motor turns. ' +
      'Most encoders are designed with a specific "Native" resolution (e.g., 10,000 pulses per revolution). ' +
      'The controller uses a "Gear Ratio" parameter to convert these pulses into the active G20 or G21 display. ' +
      'Because the conversion factor (25.4) is a terminating decimal, the controller can switch between ' +
      'units with nearly zero "floating-point drift," a testament to the digital logic of modern CNC processors.'
    ]
  },

  rigor: {
    prose: [
      '### The Paradox of Tool Offsets',
      'This is the most common "Advanced" mistake: **The Offset Table.** ' +
      'On many controllers (especially older Fanuc and Haas), there is a setting called "Setting 15: H/D Code System." ' +
      'If the machine is natively set to Inches, and you run a G21 program, the machine will interpret ' +
      'your tool lengths as millimeters. ' +
      '**Scenario:** You have a tool length of `H5.0` (5 inches). You switch to G21. The machine now ' +
      'thinks that tool is `5.0mm` long. When it goes to find the part, it will plunge **4.8 inches too deep**, ' +
      'destroying the spindle.',
      
      '**Rigor Rule:** Never switch unit modes on a machine that already has a setup on the table ' +
      'unless you are prepared to re-measure EVERY tool and EVERY work offset in the new unit system.',

      '### The G70/G71 Exception',
      'While G20/G21 is the "ISO Standard," some machines (notably older lathes and specific European controls) ' +
      'use **G70** for Inches and **G71** for Millimeters. ' +
      'Always consult the "Programming Manual" for the specific serial number of your machine. ' +
      'Using G20 on a G70-native machine will result in an "Unknown G-Code" alarm, halting the program.',
    ],
  },

  examples: [
    {
      id: 'ex-conversion-disaster',
      title: 'The "Invisible" Crash Calculation',
      problem: 'An operator forgets the G20 command. The program contains: G01 Z-1.0 F10.0. The machine is currently in G21 (Metric) mode. What is the physical result?',
      steps: [
        { expression: 'Intended: 1.0\\text{ inch} \\downarrow, 10\\text{ IPM}', annotation: 'The programmer wanted a 1-inch plunge.' },
        { expression: 'Actual: 1.0\\text{ mm} \\downarrow, 10\\text{ mm/min}', annotation: 'The machine moves in millimeters.' },
        { expression: 'Error Ratio: 1/25.4 \\approx 0.039', annotation: 'The move is only 4% of the intended depth.' },
        { expression: 'Time Error: 10\\text{ IPM} \\rightarrow 254\\text{ mm/min}', annotation: 'The move takes 25x longer than expected.' }
      ],
      conclusion: 'The part is ruined because the tool "rubbed" the surface for too long at a snails pace, likely burning the material.'
    },
    {
      id: 'ex-metric-scaling',
      title: 'Precision Conversion for Aerospace',
      problem: 'You are converting a tight-tolerance bore from X1.5005" to Metric. What is the new coordinate?',
      steps: [
        { expression: '1.5005 \\times 25.4', annotation: 'Calculate raw conversion.' },
        { expression: '38.1127', annotation: 'The result in millimeters.' },
        { expression: 'G21 X38.113', annotation: 'Rounded to the standard 3-decimal metric resolution.' }
      ],
      conclusion: 'Because 0.0001" is slightly larger than 0.001mm, you often have to round up or down. To maintain the exact fit, a 4-decimal metric command (X38.1127) might be required if the controller supports it.'
    }
  ],

  assessment: {
    questions: [
      {
        id: 'units-q1',
        type: 'choice',
        text: 'Which G-code tells the machine that all coordinates are in Inches?',
        options: ['G20', 'G21', 'G71', 'G90'],
        answer: 'G20'
      },
      {
        id: 'units-q2',
        type: 'input',
        text: 'If 1 inch equals 25.4mm exactly, how many mm are in 0.500 inches?',
        answer: '12.7'
      },
      {
        id: 'units-q3',
        type: 'choice',
        text: 'You run a metric program (G21) with a feedrate of F500.0. If you accidentally change it to G20, what happens to the tool speed?',
        options: [
          'It stays the same.',
          'It slows down by 25.4 times.',
          'It speeds up by 25.4 times (dangerous).',
          'The machine alarms out.'
        ],
        answer: 'It speeds up by 25.4 times (dangerous).'
      },
      {
        id: 'units-q4',
        type: 'boolean',
        text: 'Changing from G20 to G21 mid-program is a safe and common practice for high-precision machining.',
        answer: false
      },
      {
        id: 'units-q5',
        type: 'choice',
        text: 'What is the "Safety Header" and why does it include G20/G21?',
        options: [
          'It is a mechanical bar to stop crashes.',
          'It is the first line of code that sets the modal state of the machine to a known safe value.',
          'It is a message to the operator.',
          'It is used only for NASA projects.'
        ],
        answer: 'It is the first line of code that sets the modal state of the machine to a known safe value.'
      }
    ]
  },

  mentalModel: [
    '25.4 = The Magic Number. Memorize it.',
    'G20 = Big numbers (inches), G21 = Even bigger numbers (mm).',
    'Safety Header: Never start a program without units defined.',
    'F-word Alert: Feedrates are distance-per-time. They scale with the units!',
    'The 1959 Pact: We all agree an inch is exactly 25.4mm. No arguments.',
  ]
};