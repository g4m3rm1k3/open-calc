export default {
  id: 'cnc-parametric-programming',
  slug: 'parametric-programming',
  chapter: 'cnc-1',
  order: 26,
  title: 'Parametric Programming',
  subtitle: 'Writing One Macro That Machines Any Part',
  tags: [
    'parametric', 'macro', '#variables', 'WHILE', 'bolt circle', 'pocket',
    'SIN', 'COS', 'subroutine', 'M98', 'M99', 'reusable',
  ],

  semantics: {
    core: [
      { symbol: 'Parametric program', meaning: 'A G-code macro where dimensions are stored as variables (#100, #101, …) rather than hard-coded numbers. Changing the variables changes the part — without rewriting the program.' },
      { symbol: '#100–#149 (user common)', meaning: 'Non-volatile common variables available across program calls. Used for part parameters that the operator sets before running.' },
      { symbol: 'M98 P_', meaning: 'Call a subprogram (subroutine). The subroutine performs the parametric operation and returns via M99.' },
      { symbol: 'M99', meaning: 'Return from subprogram back to the calling program. The main program continues from the next block after M98.' },
      { symbol: 'WHILE [cond] DO n / END n', meaning: 'Loop: repeat blocks between DO and END while the condition is true. The standard Macro B loop structure.' },
      { symbol: '#[expr]', meaning: 'Indirect addressing: use the value of an expression as a variable number. #[#100] reads the variable whose number is stored in #100.' },
    ],
    rulesOfThumb: [
      'Put all part parameters at the top of the program as named comments — #100=(RADIUS), #101=(NUM_HOLES). Any operator can read and adjust them without touching the machining logic.',
      'Test every parametric program with simple values first (e.g., 1 hole, small radius). Build confidence before running a full production cycle.',
      'WHILE loops must always increment the counter variable (#100 = #100 + 1). An infinite loop will run until you hit E-Stop — always verify your exit condition.',
    ]
  },

  hook: {
    question: 'You have 50 different bolt circle patterns to machine this week — each with a different number of holes, different radius, and different drill depth. Do you write 50 separate programs, or one?',
    realWorldContext:
      'Parametric programming is the bridge between "I know G-code" and "I am a CNC programmer." ' +
      'A parametric bolt circle macro accepts the number of holes, radius, and depth as input variables. ' +
      'The loop computes each hole position using SIN and COS, drills it, and increments the angle counter. ' +
      'The same 20 lines of macro code handle every bolt circle that will ever exist. ' +
      'This lesson builds that macro from scratch — first as Python pseudocode, then as full Fanuc Macro B. ' +
      'By the end, you will also build a parametric rectangular pocket: another pattern that covers the majority of everyday machining operations with a single reusable program.',
    previewVisualizationId: 'CNCMacroLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCMacroLab',
        props: {
          dialect: 'fanuc',
          watchVars: [100, 101, 102, 103, 104, 105],
          height: 520,
          initialCode:
            '(BOLT CIRCLE MACRO - O0010)\n' +
            '(Parameters - set these before running:)\n' +
            '#100 = 0       (#ANGLE_COUNTER)\n' +
            '#101 = 6       (#NUM_HOLES)\n' +
            '#102 = 40.     (#RADIUS_MM)\n' +
            '#103 = -15.    (#DRILL_DEPTH)\n' +
            '\n' +
            'G21 G90 G17 G40 G49 G80\n' +
            'T2 M06\n' +
            'G43 H2\n' +
            'S2200 M03\n' +
            'M08\n' +
            'G54\n' +
            '\n' +
            'WHILE [#100 LT #101] DO1\n' +
            '  #104 = #100 * 360. / #101       (#ANGLE_DEG)\n' +
            '  #105 = #102 * COS[#104]          (#HOLE_X)\n' +
            '  #106 = #102 * SIN[#104]          (#HOLE_Y)\n' +
            '  G00 X#105 Y#106\n' +
            '  G81 Z#103 R3. F120\n' +
            '  #100 = #100 + 1\n' +
            'END1\n' +
            '\n' +
            'G80\n' +
            'G00 Z50.\n' +
            'M09 M05\n' +
            'M30',
        },
        title: 'Bolt Circle Macro — Step Through',
        caption: 'Press STEP to execute one block at a time. Watch #104 (angle), #105 (X position), and #106 (Y position) update in the watch panel as the loop iterates. After 6 iterations, #100 equals #101 and the WHILE exits. Try EDIT → change #101 to 8 or 12 → SEND to machine.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(BOLT CIRCLE - 8 HOLES, R=40mm)\n' +
            'G21 G90 G17 G40 G49 G80\n' +
            'T2 M06\n' +
            'G43 H2\n' +
            'S2200 M03 M08\n' +
            'G54\n' +
            '#100 = 0\n' +
            '#101 = 8\n' +
            '#102 = 40.\n' +
            '#103 = -15.\n' +
            'WHILE [#100 LT #101] DO1\n' +
            '  #104 = #100 * 360. / #101\n' +
            '  #105 = #102 * COS[#104]\n' +
            '  #106 = #102 * SIN[#104]\n' +
            '  G00 X#105 Y#106\n' +
            '  G81 Z#103 R3. F120\n' +
            '  #100 = #100 + 1\n' +
            'END1\n' +
            'G80\n' +
            'G00 Z50.\n' +
            'M09 M05\n' +
            'M30',
        },
        title: 'Bolt Circle — 3D Backplot',
        caption: 'The full 3D backplot showing the 8-hole bolt circle toolpath. All 8 hole positions are computed from the four parameters — change #101 and #102 and the entire pattern scales.',
      },
      {
        id: 'PythonNotebook',
        props: {
          initialCells: [
            {
              cellTitle: 'Python Pseudocode: Bolt Circle',
              prose:
                'Before writing Macro B, think through the algorithm in Python. ' +
                'The logic is identical — only the syntax changes.',
              code:
                'import math\n' +
                '\n' +
                '# Part parameters\n' +
                'num_holes = 6\n' +
                'radius    = 40.0   # mm\n' +
                'depth     = -15.0  # mm\n' +
                '\n' +
                '# Loop over each hole\n' +
                'for i in range(num_holes):\n' +
                '    angle_deg = i * 360.0 / num_holes\n' +
                '    angle_rad = math.radians(angle_deg)   # Python uses radians!\n' +
                '    x = radius * math.cos(angle_rad)\n' +
                '    y = radius * math.sin(angle_rad)\n' +
                '    print(f"Hole {i+1}: X={x:.3f}  Y={y:.3f}  Z={depth}")\n',
            },
            {
              cellTitle: 'Fanuc Macro B Translation',
              prose:
                'The Python for-loop becomes a WHILE/END1 block. ' +
                'Key difference: Fanuc SIN/COS take **degrees directly** — no radians conversion needed. ' +
                'Python needs `math.radians()`. Macro B does not.',
              code:
                '# Python equivalent of the Macro B WHILE loop:\n' +
                '# #100 = angle counter\n' +
                '# #101 = num_holes\n' +
                '# #102 = radius\n' +
                '# #103 = depth\n' +
                '\n' +
                'num_holes = 6\n' +
                'radius = 40.0\n' +
                'depth = -15.0\n' +
                'i = 0\n' +
                '\n' +
                'while i < num_holes:          # WHILE [#100 LT #101] DO1\n' +
                '    angle = i * 360 / num_holes   # #104 = #100 * 360. / #101\n' +
                '    x = radius * math.cos(math.radians(angle))  # #105 = #102 * COS[#104]\n' +
                '    y = radius * math.sin(math.radians(angle))  # #106 = #102 * SIN[#104]\n' +
                '    print(f"  RAPID X{x:.3f} Y{y:.3f}  DRILL Z{depth}")\n' +
                '    i += 1                        # #100 = #100 + 1\n' +
                '                                  # END1\n' +
                '\n' +
                'import math  # needed for the example above\n',
            },
            {
              cellTitle: 'Challenge: Rectangular Grid Macro',
              prose:
                'Write a Python function `drill_grid(rows, cols, spacing, depth)` that prints ' +
                'G00/G81 drill coordinates for a rectangular grid of holes. ' +
                'This is the Python prototype for a nested WHILE loop in Macro B.',
              code:
                'import math\n' +
                '\n' +
                'def drill_grid(rows, cols, spacing, depth):\n' +
                '    pass  # YOUR CODE HERE\n' +
                '\n' +
                'drill_grid(3, 4, 20.0, -10.0)\n',
            },
          ]
        },
        title: 'Python ↔ Macro B Translation',
        caption: 'Work through the Python version first. The logic is identical — only syntax differs. The critical difference: Python uses radians, Fanuc Macro B SIN/COS use degrees.',
      },
    ],
    prose: [
      '**What "parametric" means**: Hard-coded G-code programs have the part dimensions baked in as literal numbers. `G01 X40.` means exactly 40mm — change the part, rewrite the line. A parametric program replaces literal numbers with variables: `G00 X#105` where `#105 = #102 * COS[#104]`. Change `#102` (the radius), and all the X positions recompute automatically.',

      '**The Bolt Circle Algorithm**: A bolt circle is N equally-spaced holes on a circle of radius R centered at the work zero. For hole number i (starting at 0):\n' +
      '- Angle = i × 360° / N\n' +
      '- X = R × cos(Angle)\n' +
      '- Y = R × sin(Angle)\n\n' +
      'The macro stores these four things as variables and loops over i from 0 to N-1. That is the entire algorithm.',

      '**Building the Macro — Step by Step**:\n\n' +
      '1. **Define parameters** at the top:\n' +
      '   ```\n' +
      '   #100 = 0      (angle counter — starts at 0)\n' +
      '   #101 = 6      (number of holes)\n' +
      '   #102 = 40.    (radius mm)\n' +
      '   #103 = -15.   (drill depth)\n' +
      '   ```\n\n' +
      '2. **Open the WHILE loop**:\n' +
      '   ```\n' +
      '   WHILE [#100 LT #101] DO1\n' +
      '   ```\n' +
      '   This continues while the counter is less than the number of holes.\n\n' +
      '3. **Compute the position**:\n' +
      '   ```\n' +
      '   #104 = #100 * 360. / #101     (angle in degrees)\n' +
      '   #105 = #102 * COS[#104]       (X coordinate)\n' +
      '   #106 = #102 * SIN[#104]       (Y coordinate)\n' +
      '   ```\n\n' +
      '4. **Drill the hole**:\n' +
      '   ```\n' +
      '   G00 X#105 Y#106\n' +
      '   G81 Z#103 R3. F120\n' +
      '   ```\n\n' +
      '5. **Increment and close**:\n' +
      '   ```\n' +
      '   #100 = #100 + 1\n' +
      '   END1\n' +
      '   ```',

      '**Parametric Rectangular Pocket**: The same principle extends to any repeated geometry. A rectangular pocket macro takes width, length, depth, and step-over as parameters. A nested WHILE loop (rows and columns) generates the full zig-zag toolpath. The outer loop advances Y by the step-over amount; the inner loop determines whether X moves in the positive or negative direction (to avoid a rapid return across the pocket — a "boustrophedon" or alternating-direction raster).',

      '**Operator Interface via #500+ Variables**: Common variables #500–#999 survive a power cycle on most Fanuc controls. Some shops put parametric programs entirely in terms of #500+ variables, then display a simple input screen (using G-code display functions or a HMI macro) where the operator just types in diameter, depth, and number of holes. The machining logic never changes.',
    ],
  },

  math: {
    prose: [
      'Bolt circle hole positions use basic polar-to-Cartesian conversion:',
      '$\\theta_i = \\frac{i \\times 360°}{N}, \\quad i = 0, 1, \\ldots, N-1$',
      '$X_i = R \\cos(\\theta_i), \\quad Y_i = R \\sin(\\theta_i)$',
      'For a 6-hole bolt circle at radius R = 40 mm:',
      '| Hole | θ | X | Y |',
      '|------|---|---|---|',
      '| 0 | 0° | 40.000 | 0.000 |',
      '| 1 | 60° | 20.000 | 34.641 |',
      '| 2 | 120° | −20.000 | 34.641 |',
      '| 3 | 180° | −40.000 | 0.000 |',
      '| 4 | 240° | −20.000 | −34.641 |',
      '| 5 | 300° | 20.000 | −34.641 |',
      'A common verification: for 4 holes at 45° start offset, compute θ₀ = 45°, then θ₁ = 135°, etc. The macro handles any starting angle by adding an offset to the formula: θᵢ = θ_start + i × 360°/N.',
      '**Fanuc SIN/COS take degrees**: unlike Python\'s `math.sin()` which requires radians. This is a critical portability difference when translating algorithms.',
    ],
  },

  rigor: {
    prose: [
      '**Variable scope and subroutines**: Local variables #1–#33 are private to each subprogram level. Common variables #100–#999 are shared across all programs and remain after M99 returns. A well-designed parametric subroutine uses #1–#33 for internal temporaries so it does not pollute the calling program\'s variables.',

      '**Precision and rounding**: ROUND, FIX, and FUP can be critical in parametric programs. If `#105 = #102 * COS[#104]` yields 19.99999999 due to floating-point accumulation, and you compare it later with a nominal value of 20.0 using EQ, the comparison fails silently. Use ROUND when exact integer comparisons are needed, and prefer LT/LE over EQ for loop conditions.',

      '**Machine dependency**: The exact WHILE/DO/END syntax is Fanuc Macro B. Siemens uses LOOP/ENDLOOP or IF/GOTOF. Okuma uses similar macro syntax but with VC variables instead of # variables. A parametric program written for one dialect will not run on another without modification. The algorithm is universal; the syntax is not.',

      '**Nested loops**: Fanuc Macro B allows up to 3 levels of nesting (DO1/END1, DO2/END2, DO3/END3). A rectangular pocket requires 2 levels. More complex patterns (e.g., a bolt circle of pocket clusters) require 2 levels and careful variable planning so inner-loop variables do not overwrite outer-loop variables.',
    ],
  },

  examples: [
    {
      id: 'ex-param-boltcircle',
      title: 'Verify Hole 3 of a 6-Hole, R=50mm Bolt Circle',
      problem: 'For hole index i=2 (the third hole) of a 6-hole bolt circle at radius 50mm, compute the programmed X and Y coordinates.',
      steps: [
        { expression: 'θ₂ = 2 × 360° / 6 = 120°', annotation: 'Third hole (index 2) is at 120° from 3 o\'clock.' },
        { expression: 'X = 50 × cos(120°) = 50 × (−0.5) = −25.000', annotation: 'Negative X — left of center.' },
        { expression: 'Y = 50 × sin(120°) = 50 × 0.8660 = 43.301', annotation: 'Upper-left quadrant.' },
        { expression: 'Block: G00 X-25. Y43.301', annotation: 'Verified against the macro output — #105 and #106 should show these values.' },
      ],
      conclusion: 'Watch #104, #105, #106 in the Macro Lab on the third iteration of the loop (when #100=2) to confirm the computed values match.',
    },
    {
      id: 'ex-param-pocket',
      title: 'Parametric Rectangular Pocket — Variable Setup',
      problem: 'Design the parameter list for a rectangular pocket macro that takes width (W), length (L), depth (D), and step-over (S).',
      steps: [
        { expression: '#110 = 60.   (POCKET WIDTH  - X direction)', annotation: 'Full pocket width.' },
        { expression: '#111 = 40.   (POCKET LENGTH - Y direction)', annotation: 'Full pocket length.' },
        { expression: '#112 = -8.   (POCKET DEPTH  - Z final)', annotation: 'Final Z depth (negative).' },
        { expression: '#113 = 4.    (STEP-OVER — must be ≤ tool diameter)', annotation: 'Row spacing for the zig-zag pass.' },
        { expression: '#114 = 0.    (CURRENT Y POSITION — loop variable)', annotation: 'Starts at 0, incremented by #113 each pass.' },
        { expression: 'WHILE [#114 LE #111] DO1 ... #114 = #114 + #113 ... END1', annotation: 'Loop from Y=0 to Y=LENGTH.' },
      ],
      conclusion: 'With 4 parameters (#110–#113) defined by the operator and 1 loop variable (#114) managed internally, the macro machines any rectangular pocket.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-param-1',
        type: 'choice',
        text: 'In the bolt circle macro, what does #104 represent on each loop iteration?',
        options: [
          'The hole index (0, 1, 2, …)',
          'The current hole angle in degrees',
          'The X coordinate of the hole',
          'The remaining number of holes',
        ],
        answer: 'The current hole angle in degrees',
      },
      {
        id: 'cnc-param-2',
        type: 'choice',
        text: 'The WHILE loop exits when:',
        options: [
          '#100 equals zero',
          '#100 is greater than or equal to #101',
          'M30 is reached',
          'G80 cancels the canned cycle',
        ],
        answer: '#100 is greater than or equal to #101',
      },
      {
        id: 'cnc-param-3',
        type: 'choice',
        text: 'In Fanuc Macro B, what argument units does the COS[ ] function expect?',
        options: ['Radians', 'Degrees', 'Gradians', 'Revolutions per minute'],
        answer: 'Degrees',
      },
      {
        id: 'cnc-param-4',
        type: 'input',
        text: 'For a 12-hole bolt circle, what angle (in degrees) separates adjacent holes?',
        answer: '30',
      },
      {
        id: 'cnc-param-5',
        type: 'choice',
        text: 'Which variable range survives a power cycle on Fanuc controls?',
        options: ['#1–#33 (local)', '#100–#199 (common)', '#500–#999 (persistent common)', '#4001–#4022 (modal group)'],
        answer: '#500–#999 (persistent common)',
      },
      {
        id: 'cnc-param-6',
        type: 'choice',
        text: 'What is the maximum nesting depth of WHILE/DO/END loops in Fanuc Macro B?',
        options: ['1 level', '2 levels', '3 levels', 'Unlimited'],
        answer: '3 levels',
      },
    ]
  },

  mentalModel: [
    'Parametric = variables (#) instead of hard-coded numbers. Change variables, change the part.',
    'Bolt circle: θ = i × 360/N, X = R·cos(θ), Y = R·sin(θ). Loop over i.',
    'Fanuc COS/SIN take degrees — Python math.cos/sin take radians.',
    'WHILE [#100 LT #101] DO1 ... #100 = #100 + 1 ... END1 is the Macro B loop pattern.',
    'Parameters go at top as comments: #100=(RADIUS), #101=(NUM_HOLES).',
    '#500–#999 = persistent across power cycle. Use for operator-set parameters.',
    'Max 3 nested DO/END levels. Plan variable names before nested loops.',
  ],
}
