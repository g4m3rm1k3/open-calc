export default {
  id: 'cnc-coordinate-systems',
  slug: 'coordinate-systems',
  chapter: 'cnc-1',
  order: 7,
  title: 'Coordinate Systems & Offsets',
  subtitle: 'Machine Zero (G53) vs. Work Zero (G54)',
  tags: ['G53', 'G54', 'offsets', 'probing', 'H-offset'],
  aliases: 'G53 G54 G55 G56 G57 G58 G59 work offset work coordinate system WCS machine coordinate MCS probing touch-off part zero',
  timeToComplete: 20,
  coreConcept: 'Work offsets (G54–G59) store the vector from machine zero to part zero; the controller adds this offset to every coordinate automatically, letting programmers write code in part coordinates without knowing machine position. Setting the work offset correctly at setup time is what makes the program cut the part in the right place.',
  prerequisites: ['cnc-machine-home'],
  nextLesson: 'tool-length-compensation',

  semantics: {
    core: [
      { symbol: 'G53', meaning: 'Machine Coordinate System: Hard-coded absolute zero from the factory sensors.' },
      { symbol: 'G54–G59', meaning: 'Work Coordinate Systems (WCS): User-defined zero points relative to the part.' },
      { symbol: 'G92', meaning: 'Global Coordinate Setting: Shifts all coordinates relative to current position (use with caution!).' },
      { symbol: 'H-Word', meaning: 'Tool Length Offset: Adjusts Z-axis for different tool lengths.' },
    ],
    rulesOfThumb: [
      'The G-code "X0 Y0" in your program is looking at the G54 Work Offset.',
      'A work offset is just a vector shift: G53 = G54_offset + Program_X.',
      'Always home the machine (G28) to re-calibrate G53 after power-up.',
    ]
  },

  hook: {
    question: 'How does the machine know where your part is on the table?',
    realWorldContext:
      'Machines come from the factory with a "Hard Zero" (G53) at the ends of their travel. But your part could be clamped ANYWHERE on the bed. ' +
      'To fix this, you touch a probe to the corner of your part and tell the machine: "This is my new (0,0,0)". This information is stored in the **Work Offset Table (G54)**. ' +
      'Understanding this vector shift is the difference between a perfect part and a catastrophic crash.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(WORK OFFSET COMPARISON)\n' +
            '(G54 and G55 are two different "part zeros" on the same table)\n' +
            '\n' +
            '(--- CUT IN G54 COORDINATE SYSTEM ---)\n' +
            'G21 G90 G54            (activate work offset 1)\n' +
            'G00 X0 Y0              (move to G54 origin — wherever the setup guy put it)\n' +
            'G01 X30 F200\n' +
            'G01 Y20\n' +
            'G01 X0\n' +
            'G01 Y0\n' +
            '\n' +
            '(--- SAME CODE, BUT IN G55 — a different part location ---)\n' +
            'G55                    (switch to work offset 2)\n' +
            'G00 X0 Y0              (same X0 Y0, but physically DIFFERENT spot)\n' +
            'G01 X30 F200\n' +
            'G01 Y20\n' +
            'G01 X0\n' +
            'G01 Y0\n' +
            '\n' +
            'G54                    (restore offset 1)\n' +
            'M30'
        },
        title: 'G54 vs G55 — Same Code, Different Part Location',
        caption: 'Both sections write exactly X0 Y0 — the code is identical. But because the active work offset changes (G54 → G55), the physical location is different. This is the core concept: work offsets let the same program code work on different setups.',
      },
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'wcs-1',
              label: '1 — G53 (machine zero) vs G54 (part zero)',
              code:
                '; G53 = machine coordinate system. Origin = physical home switch.\n' +
                '; G54 = work coordinate system. Origin = where YOU probed your part.\n' +
                '; The machine adds the G54 offset to every coordinate you program.\n' +
                'G21 G90\n' +
                '\n' +
                '; In G54 (default), X0 Y0 = YOUR part corner:\n' +
                'G54\n' +
                'G0 X0 Y0            ; go to part corner\n' +
                'G0 X50 Y30          ; move relative to part\n' +
                '\n' +
                '; G53 is non-modal: moves ONE block in machine coordinates, then returns to G54\n' +
                'G53 G0 X0 Y0        ; go to machine home (usually far from part) — one block only\n' +
                '\n' +
                'G54 G0 X0 Y0        ; back to part corner\n' +
                'M30\n',
            },
            {
              id: 'wcs-2',
              label: '2 — Same G-code, two parts on the table',
              code:
                '; Imagine two vises bolted to the table.\n' +
                '; G54 = first vise location. G55 = second vise location.\n' +
                '; The SAME program code runs for both — only the offset changes.\n' +
                'G21 G90\n' +
                '\n' +
                '; Machine the first part:\n' +
                'G54\n' +
                'G0 X0 Y0\n' +
                'G1 X40 F300\n' +
                'G1 Y25\n' +
                'G1 X0\n' +
                'G1 Y0\n' +
                '\n' +
                '; Machine the IDENTICAL feature on the second part:\n' +
                'G55\n' +
                'G0 X0 Y0            ; same code — different physical location\n' +
                'G1 X40 F300\n' +
                'G1 Y25\n' +
                'G1 X0\n' +
                'G1 Y0\n' +
                '\n' +
                'G54 M30\n',
            },
            {
              id: 'wcs-3',
              label: '3 — G92: the dangerous global shift',
              code:
                '; G92 shifts the entire coordinate system relative to current position.\n' +
                '; It does NOT store the offset per-fixture. It shifts ALL offsets.\n' +
                '; WARNING: G92 is still active after M30 on many controllers.\n' +
                '; Prefer G54-G59 over G92 in all production code.\n' +
                'G21 G90 G54\n' +
                'G0 X20 Y10\n' +
                '\n' +
                '; G92 X0 Y0 would say: "wherever I am now is the new X0 Y0"\n' +
                '; This shifts G54 by -20 in X and -10 in Y globally\n' +
                '; Avoid this — use G54-G59 touch-off instead\n' +
                '\n' +
                '; The CORRECT way to move part zero is through the offset table:\n' +
                '; Set G54 offset in the machine\'s work offset register, not G92.\n' +
                'G0 X0 Y0\n' +
                'M30\n',
            },
          ],
        },
        title: 'Work Offsets — Where Is Your Part Zero?',
        caption: 'Cell 1: G53 (machine) vs G54 (part) — the controller adds the offset automatically. Cell 2: same program runs on two fixtures by switching G54 → G55. Cell 3: why G92 is dangerous and how G54–G59 is the correct alternative.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 7 of 31 — Two Coordinate Realities',
        body: 'Machine home (lesson 6) establishes G53. This lesson explains G54–G59: the offset table that translates machine space into part space. Tool length compensation (lesson 8) adds the Z-axis equivalent.',
      },
      {
        type: 'definition',
        title: 'Work Offset (G54–G59)',
        body: 'A vector stored in the controller\'s offset table that says "machine zero is THIS far from part zero." When you program X50, the controller adds the G54 X-offset to find the physical motor position. You set it once at setup by probing the part corner.',
      },
      {
        type: 'definition',
        title: 'G53 — Machine Coordinate System',
        body: 'Non-modal command that makes ONE block execute in raw machine coordinates, ignoring all work offsets. G53 X0 Y0 moves to physical machine home regardless of which G54–G59 is active. Only that block is affected — the next block returns to the active offset.',
      },
      {
        type: 'insight',
        title: 'The programmer never needs to know table position',
        body: 'You write X0 Y0 to mean "the part corner." The setup operator probes the corner and enters the offset. Your code doesn\'t change between setups — only the number in the offset table changes. This separation of programming from setup is the whole point of work offsets.',
      },
      {
        type: 'warning',
        title: 'G92 shifts ALL offsets and persists after M30',
        body: 'G92 is a global shift that moves the origin of every work offset simultaneously. It is NOT cleared by M30 on many controllers. If someone leaves a G92 active and the next program uses G54, all coordinates will be wrong by the G92 shift. Always use the offset table (G54–G59), never G92 in production code.',
      },
    ],
    prose: [
      'Imagine you have a piece of paper on your desk. The desk\'s corner is machine zero (G53) — set at the factory, never changes. But your part is clamped somewhere in the middle of the table. You don\'t want to measure every coordinate from the far corner of the machine. You probe your part corner and tell the machine "this is my new (0,0,0)" — stored in G54. Now X0 Y0 means your part corner, and the controller silently adds the offset for you.',

      '**The G54 Vector**: When the controller sees `G01 X30.0`, it does not drive the motor to position 30. It looks up the active work offset (say G54 X = +150.0 in machine coordinates), adds 150.0 to 30.0, and drives the motor to 180.0. Every single move. Every single coordinate. This arithmetic happens in the motion planner at interpolation speed — you never see it, but it never stops happening.',

      '**G54 Through G59 — Six Fixtures**: A standard Fanuc controller provides six work offsets (G54–G59). Each stores an independent X/Y/Z (and sometimes A/B/C) offset. You can have six different parts clamped on the table simultaneously and write one program that machines all six by switching G54 → G55 → G56 etc. Extended offsets (G54.1 P1 through P48) give up to 48 fixtures on some controllers.',

      '**Tool Length Compensation (G43)**: The Z axis has an additional offset beyond the work offset — the tool length. A 100mm endmill and a 30mm drill cannot share the same Z coordinate without adjustment. G43 applies the tool length offset stored in the H-register to all Z moves. This is taught in the next lesson (Lesson 8).',
    ],
  },

  math: {
    prose: [
      'The controller calculates the final machine position $\\mathbf{P}_{machine}$ using vector addition:',
      '$\\mathbf{P}_{machine} = \\mathbf{P}_{programmed} + \\mathbf{O}_{work} + \\mathbf{O}_{tool}$',
      
      'For the X-axis specifically:',
      '$X_{machine} = X_{prog} + X_{offset}$',

      'For the Z-axis (with Tool Length $H$):',
      '$Z_{machine} = Z_{prog} + Z_{wcs} + Z_{tool}$',

      'This addition happens in real-time for every single point calculated by the motion planner.',
    ],
  },

  rigor: {
    prose: [
      '**G53 is Non-Modal**: A command like `G53 G01 X0` only lasts for that one line. After that, the machine immediately goes back to the active Work Offset (G54).',
      
      '**Dynamic Rotation (G68)**: Advanced machines can rotate the entire coordinate system! If your part is clamped crooked (say at 5 degrees), you can set a G68 coordinate rotation. The controller uses rotation matrix math to transform every X/Y move in your code into the correct slanted path: \n $X\' = X\\cos(\\theta) - Y\\sin(\\theta)$ \n $Y\' = X\\sin(\\theta) + Y\\cos(\\theta)$',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-offsets-calc',
      title: 'Calculating Machine Coordinates',
      problem: 'If G54 is set to X=10.0 and your program says X1.0, where is the motor?',
      code: 'X_{machine} = 1.0 + 10.0',
      steps: [
        { expression: 'X_{prog} = 1.0', annotation: 'Program target.' },
        { expression: 'X_{offset} = 10.0', annotation: 'Machine to Work zero vector.' },
      ],
      conclusion: 'The motor moves to physical machine coordinate 11.0.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-offset-1',
        type: 'choice',
        text: 'Which code refers to the permanent factory home position?',
        options: ['G53', 'G54', 'G90', 'G01'],
        answer: 'G53',
      },
      {
        id: 'cnc-offset-2',
        type: 'input',
        text: 'If G54 is the 1st work offset, what is the code for the 2nd? ',
        answer: 'G55',
      },
    ]
  },

  mentalModel: [
    'G53 = World View',
    'G54 = Local View',
    'Offset = Vector jump',
    'H = Tool Length compensation',
  ],
}
