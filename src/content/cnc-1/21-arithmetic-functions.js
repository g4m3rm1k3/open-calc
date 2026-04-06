export default {
  id: 'cnc-arithmetic-functions',
  slug: 'arithmetic-and-functions',
  chapter: 'cnc-1',
  order: 21,
  title: 'Arithmetic & Functions',
  subtitle: 'Fanuc Macro B Math — Building Intelligent Toolpaths from Algebra',
  tags: ['arithmetic', 'functions', 'SIN', 'COS', 'SQRT', 'ROUND', 'FIX', 'FUP', 'ABS', 'ATAN', 'MOD', 'expressions', 'Macro B'],

  semantics: {
    core: [
      { symbol: '[ ]', meaning: 'Expression delimiters: Everything between square brackets is evaluated as a mathematical expression. #1 = [#2 + 3.0 * #3].' },
      { symbol: '+  -  *  /', meaning: 'Basic arithmetic operators: addition, subtraction, multiplication, division. Same precedence rules as standard math.' },
      { symbol: 'SIN[ ]', meaning: 'Sine function. Argument in DEGREES (not radians). SIN[30] = 0.5.' },
      { symbol: 'COS[ ]', meaning: 'Cosine function. Argument in DEGREES. COS[60] = 0.5.' },
      { symbol: 'TAN[ ]', meaning: 'Tangent function. Argument in DEGREES.' },
      { symbol: 'ATAN[ ] / ATAN[y]/[x]', meaning: 'Arctangent. Single-arg form ATAN[y] returns -90 to +90. Two-arg form ATAN[y]/[x] returns 0-360 (full quadrant).' },
      { symbol: 'SQRT[ ]', meaning: 'Square root. SQRT[9] = 3.0.' },
      { symbol: 'ABS[ ]', meaning: 'Absolute value. ABS[-5] = 5.' },
      { symbol: 'ROUND[ ]', meaning: 'Round to nearest integer. ROUND[1.5] = 2, ROUND[1.4] = 1.' },
      { symbol: 'FIX[ ]', meaning: 'Floor (truncate toward zero): FIX[1.9] = 1, FIX[-1.9] = -1.' },
      { symbol: 'FUP[ ]', meaning: 'Ceiling (round away from zero): FUP[1.1] = 2, FUP[-1.1] = -2.' },
      { symbol: 'MOD', meaning: 'Modulo (remainder): [7 MOD 3] = 1.' },
    ],
    rulesOfThumb: [
      'All trig functions in Fanuc Macro B use DEGREES. Python math.sin() uses radians. Never confuse these.',
      'Always wrap expressions in [ ]: #1 = [#2 * 2], not #1 = #2 * 2.',
      'ATAN[y]/[x] (two-argument form) gives the full 0°-360° angle. Use this for angles in polar/Cartesian conversion.',
      'FIX always truncates toward zero — it is NOT the same as floor() for negative numbers.',
    ]
  },

  hook: {
    question: 'If you can compute any mathematical function inside a G-code program, what kind of shapes can you create that pure G01/G02/G03 cannot?',
    realWorldContext:
      'Standard G-code has three motion types: straight lines, circular arcs, and rapids. ' +
      'That is it. To cut an ellipse, a parabola, a spiral, a cam lobe, or any other non-circular curve, ' +
      'you would need to approximate it with thousands of tiny G01 line segments — exactly what CAM software does. ' +
      'But with Fanuc Macro B arithmetic, you can compute ANY point on ANY curve directly on the controller. ' +
      'An ellipse becomes a WHILE loop with SIN and COS. A spiral becomes a loop that increments both angle and radius. ' +
      'This is the mathematical power behind parametric programming.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    visualizations: [
      {
        id: 'PythonNotebook',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Basic Arithmetic — Python ↔ Fanuc',
              prose:
                'Fanuc Macro B arithmetic works inside square brackets `[ ]`. ' +
                'The same order of operations as standard math applies: parentheses (brackets) first, then multiplication/division, then addition/subtraction. ' +
                'Run each line to see the result, then compare with the Fanuc equivalent.',
              code:
                '# Python arithmetic — identical logic to Fanuc Macro B\n' +
                '# Fanuc syntax shown in comments\n' +
                '\n' +
                'x = 5.0          # #100 = 5.0\n' +
                'y = 3.0          # #101 = 3.0\n' +
                '\n' +
                'add  = x + y     # #102 = [#100 + #101]     -> 8.0\n' +
                'sub  = x - y     # #103 = [#100 - #101]     -> 2.0\n' +
                'mul  = x * y     # #104 = [#100 * #101]     -> 15.0\n' +
                'div  = x / y     # #105 = [#100 / #101]     -> 1.666...\n' +
                'prec = round(div, 4)  # Controller stores 4 decimal places\n' +
                '\n' +
                'print(f"add:  {add}   (Fanuc: #102 = [#100 + #101])")\n' +
                'print(f"sub:  {sub}   (Fanuc: #103 = [#100 - #101])")\n' +
                'print(f"mul:  {mul}   (Fanuc: #104 = [#100 * #101])")\n' +
                'print(f"div:  {prec}   (Fanuc: #105 = [#100 / #101])")\n' +
                '\n' +
                '# Order of operations\n' +
                'result = (x + y) * 2   # #106 = [[#100 + #101] * 2]  -> 16.0\n' +
                'print(f"\\n(x+y)*2 = {result}   (Fanuc: #106 = [[#100 + #101] * 2])")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Trigonometry — DEGREES vs RADIANS',
              prose:
                '**Critical difference**: Fanuc Macro B trig functions use **degrees**. Python\'s `math.sin()` uses **radians**. ' +
                'To use Python as pseudocode for Fanuc, you must convert: `math.sin(math.radians(angle))` in Python = `SIN[angle]` in Fanuc. ' +
                '\n\nThis matters enormously for polar-to-Cartesian conversions (bolt circles, cam profiles, etc.).',
              code:
                'import math\n' +
                '\n' +
                '# Fanuc trig: SIN/COS take DEGREES\n' +
                '# Python math.sin/cos take RADIANS\n' +
                '# To match Fanuc, use math.sin(math.radians(angle))\n' +
                '\n' +
                'angle = 30.0\n' +
                '\n' +
                '# Fanuc: #1 = SIN[30]  -> 0.5\n' +
                'fanuc_sin = math.sin(math.radians(angle))\n' +
                'print(f"SIN[{angle}] = {fanuc_sin:.4f}")   # Should be 0.5\n' +
                '\n' +
                '# Fanuc: #2 = COS[60]  -> 0.5\n' +
                'fanuc_cos = math.cos(math.radians(60))\n' +
                'print(f"COS[60] = {fanuc_cos:.4f}")   # Should be 0.5\n' +
                '\n' +
                '# Bolt circle: 4 holes on R=50mm circle\n' +
                'print("\\nBolt circle hole positions (R=50mm, 4 holes):")\n' +
                'R = 50.0\n' +
                'n = 4\n' +
                'for i in range(n):\n' +
                '    deg = 360.0 / n * i\n' +
                '    x = R * math.cos(math.radians(deg))\n' +
                '    y = R * math.sin(math.radians(deg))\n' +
                '    print(f"  {deg:5.1f}°: X={x:7.3f}  Y={y:7.3f}")\n' +
                '    print(f"  Fanuc: #104=[#101*COS[#103]]  #105=[#101*SIN[#103]}")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'Rounding Functions — FIX, FUP, ROUND',
              prose:
                'Fanuc Macro B has three rounding functions with distinct behavior. ' +
                'Understanding the difference is critical when computing array indices, number of passes, or hole counts — ' +
                'any calculation that produces a fractional result that must become an integer.',
              code:
                'import math\n' +
                '\n' +
                '# Rounding functions:\n' +
                '# ROUND  = round to nearest  (Python: round())\n' +
                '# FIX    = truncate toward 0  (Python: math.trunc())\n' +
                '# FUP    = ceiling away from 0 (Python: math.ceil() for positive)\n' +
                '\n' +
                'values = [1.1, 1.5, 1.9, -1.1, -1.5, -1.9]\n' +
                '\n' +
                'print(f"{\'Value\':>8}  {\'ROUND\':>7}  {\'FIX\':>7}  {\'FUP\':>7}")\n' +
                'print("-" * 40)\n' +
                'for v in values:\n' +
                '    r = round(v)           # ROUND[v]\n' +
                '    f = math.trunc(v)      # FIX[v] — truncate toward zero\n' +
                '    u = math.ceil(v) if v >= 0 else math.floor(v)  # FUP[v]\n' +
                '    print(f"{v:>8.1f}  {r:>7}  {f:>7}  {u:>7}")\n' +
                '\n' +
                'print()\n' +
                'print("CNC use case: number of passes for 25mm travel with 8mm steps")\n' +
                'travel, step = 25.0, 8.0\n' +
                'n_passes = math.ceil(travel / step)  # FUP[travel/step]\n' +
                'print(f"  FUP[{travel}/{step}] = {n_passes} passes  (Fanuc: #100 = FUP[25.0/8.0])")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'SQRT, ABS, ATAN — Practical CNC Examples',
              prose:
                'SQRT is used for chord calculations and distance measurements. ' +
                'ABS is used in tolerance checks and absolute-value logic. ' +
                'ATAN (two-argument form) computes angles for tapers, chamfers, and tool orientation.',
              code:
                'import math\n' +
                '\n' +
                '# --- SQRT: Distance between two points ---\n' +
                '# Fanuc: #1 = SQRT[[#100-#102]*[#100-#102] + [#101-#103]*[#101-#103]]\n' +
                'x1, y1 = 0.0, 0.0\n' +
                'x2, y2 = 30.0, 40.0\n' +
                'distance = math.sqrt((x2-x1)**2 + (y2-y1)**2)\n' +
                'print(f"Distance from ({x1},{y1}) to ({x2},{y2}) = {distance:.3f} mm")\n' +
                'print(f"Fanuc: #1 = SQRT[[30*30]+[40*40]] = {distance:.3f}")\n' +
                '\n' +
                '# --- ABS: tolerance check ---\n' +
                '# Fanuc: IF [ABS[#100 - #101] GT 0.05] GOTO 100 (alarm if out of tolerance)\n' +
                'measured = 25.048\n' +
                'nominal  = 25.000\n' +
                'tolerance = 0.05\n' +
                'error = abs(measured - nominal)\n' +
                'print(f"\\nMeasured: {measured}  Nominal: {nominal}  Error: {error:.3f}")\n' +
                'print(f"ABS[{measured}-{nominal}] = {error:.3f}")\n' +
                'if error > tolerance:\n' +
                '    print("OUT OF TOLERANCE → Fanuc: #3000 = 1 (PART OUT OF SPEC)")\n' +
                'else:\n' +
                '    print("Within tolerance ✓")\n' +
                '\n' +
                '# --- ATAN two-argument: taper angle ---\n' +
                '# Fanuc: #1 = ATAN[rise]/[run]\n' +
                'rise = 10.0  # Z travel\n' +
                'run  = 40.0  # X travel\n' +
                'angle_deg = math.degrees(math.atan2(rise, run))  # ATAN[rise]/[run]\n' +
                'print(f"\\nTaper angle: ATAN[{rise}]/[{run}] = {angle_deg:.3f}°")\n' +
                'print(f"Fanuc: #2 = ATAN[{rise}]/[{run}]")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Generating a Complete Bolt Circle in Fanuc Syntax',
              prose:
                'Now we convert the Python bolt-circle logic into actual Fanuc Macro B code. ' +
                'This is the full translation: Python pseudocode → Fanuc G-code. ' +
                'Every line maps directly.',
              code:
                '# Generate the Fanuc Macro B G-code for a bolt circle\n' +
                '# This is the OUTPUT we want — the actual G-code program\n' +
                '\n' +
                'import math\n' +
                '\n' +
                'n_holes = 6      # #100 = 6\n' +
                'radius  = 50.0   # #101 = 50.0\n' +
                'depth   = -15.0  # #102 = -15.0\n' +
                'feedrate = 60    # #103 = 60.0\n' +
                '\n' +
                'print("O1000  (BOLT CIRCLE MACRO)")\n' +
                'print("G21 G90 G17 G40 G49 G80")\n' +
                'print("T1 M06")\n' +
                'print("G43 H1")\n' +
                'print("S1200 M03")\n' +
                'print("M08")\n' +
                'print("#100 = 6.0    (NUMBER OF HOLES)")\n' +
                'print("#101 = 50.0   (BOLT CIRCLE RADIUS MM)")\n' +
                'print("#102 = -15.0  (DRILL DEPTH)")\n' +
                'print("#103 = 60.0   (FEEDRATE)")\n' +
                'print("#104 = 0      (COUNTER)")\n' +
                'print("WHILE [#104 LT #100] DO 1")\n' +
                '\n' +
                'counter = 0\n' +
                'while counter < n_holes:\n' +
                '    angle = 360.0 / n_holes * counter\n' +
                '    x = radius * math.cos(math.radians(angle))\n' +
                '    y = radius * math.sin(math.radians(angle))\n' +
                '    print(f"  #105 = [#101 * COS[360.0 / #100 * #104]]   ({x:+.3f})")\n' +
                '    print(f"  #106 = [#101 * SIN[360.0 / #100 * #104]]   ({y:+.3f})")\n' +
                '    print(f"  G99 G81 X#105 Y#106 Z#102 R2.0 F#103")\n' +
                '    print( "  #104 = [#104 + 1]")\n' +
                '    counter += 1\n' +
                '\n' +
                'print("END 1")\n' +
                'print("G80")\n' +
                'print("M09")\n' +
                'print("M05")\n' +
                'print("G91 G28 Z0")\n' +
                'print("G90 G28 X0 Y0")\n' +
                'print("M30")',
              output: '',
              status: 'idle',
              figureJson: null,
            },
          ]
        },
        title: 'Fanuc Macro B Arithmetic — Python Translation Lab',
        caption: 'Run each cell. The Python code shows the logic; the comments show the exact Fanuc Macro B equivalent. Cell 5 generates a complete, real G-code program for a 6-hole bolt circle using the full macro arithmetic toolkit.',
      },
    ],
    prose: [
      '**Square Brackets Are Required**: In Fanuc Macro B, all expressions must be wrapped in `[ ]`. You cannot write `#1 = #2 + #3` — you must write `#1 = [#2 + #3]`. The brackets tell the interpreter to evaluate the expression rather than treat it as a literal coordinate.',

      '**Nested Brackets**: Brackets can be nested to any depth. `#1 = [[#100 + #101] * SIN[#102]]`. The innermost brackets are evaluated first, exactly like parentheses in algebra.',

      '**The ATAN Two-Argument Form**: The single-argument `ATAN[y]` computes the arctangent and returns a value between -90° and +90°. This is limited because it cannot distinguish between a point in the first quadrant (both positive) and the third quadrant (both negative). The two-argument form `ATAN[y]/[x]` (note: two separate bracket groups with `/` between them) computes the four-quadrant arctangent and returns 0°–360°. Always use the two-argument form when computing angles for positions around a circle.',

      '**Compound Expressions**: Fanuc Macro B evaluates the complete expression on the right side before assigning to the left. All standard operator precedence applies. For complex expressions, use multiple intermediate assignments for readability:\n' +
      '`#200 = [#100 * #100]` (X²)\n' +
      '`#201 = [#101 * #101]` (Y²)\n' +
      '`#202 = SQRT[#200 + #201]` (distance = √(X² + Y²))',
    ],
  },

  math: {
    prose: [
      'Fanuc trig functions use degrees. The conversion to understand:',
      '$\\sin(\\theta_{\\text{deg}}) = \\sin\\left(\\frac{\\pi \\cdot \\theta_{\\text{deg}}}{180}\\right)$',
      'The standard polar-to-Cartesian conversion (used in bolt circles, cam profiles):',
      '$x = R \\cdot \\text{COS}[\\theta], \\quad y = R \\cdot \\text{SIN}[\\theta]$',
      'In Fanuc: `#104 = [#101 * COS[#103]]`, `#105 = [#101 * SIN[#103]]`',
      'The ATAN two-argument form computes:',
      '$\\theta = \\text{ATAN}[y]/[x] = \\arctan\\left(\\frac{y}{x}\\right) \\in [0°, 360°]$',
      'Cutting speed to RPM (in a macro, so speed can change dynamically):',
      '$\\text{#RPM} = \\frac{\\text{#Vc} \\times 1000}{3.14159 \\times \\text{#D}}$',
      'A macro can compute this for any diameter variable and set the spindle speed dynamically: `S#RPM M03`.',
    ],
  },

  rigor: {
    prose: [
      '**Fanuc Float Precision**: Fanuc controllers use single-precision floating point (32-bit IEEE 754), not double-precision like Python. Maximum precision is approximately 6-7 significant digits. For the precision required in machining (±0.001mm), this is more than sufficient. But chaining many operations (computing many trig functions in a loop) can accumulate tiny rounding errors. Keep intermediate calculations simple.',

      '**Undefined Variable Arithmetic**: In Fanuc, an unset variable has the value `#0` (null/undefined). Any arithmetic operation with `#0` returns `#0`. This can silently propagate errors. Always initialize all variables at the top of a macro program.',

      '**MOD Operator**: `[#1 MOD #2]` computes the remainder of #1 divided by #2. Use it for cyclic patterns: `angle = [counter MOD 360]` keeps the angle in the 0-360 range regardless of how many times the loop runs. Available on Fanuc 15 and later; not on all Fanuc 0M variants.',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-taper-angle',
      title: 'Computing a Taper Angle for a Toolpath',
      problem: 'A tapered bore starts at diameter 40mm, ends at diameter 60mm, over a Z depth of 30mm. What angle does the taper make? Write the Fanuc macro variables.',
      steps: [
        { expression: 'Radius change = (60 - 40) / 2 = 10mm in X', annotation: 'The tool moves 10mm in X over 30mm in Z.' },
        { expression: 'Taper angle = ATAN[10]/[30]', annotation: 'Two-argument ATAN for four-quadrant result.' },
        { expression: 'Angle = arctan(10/30) ≈ 18.43°', annotation: 'The taper half-angle from the Z-axis.' },
        { expression: 'Fanuc: #200 = [60.0 - 40.0] / 2', annotation: '#200 = 10.0 (radius change)' },
        { expression: 'Fanuc: #201 = ATAN[#200]/[30.0]', annotation: '#201 = 18.435° (taper half-angle)' },
        { expression: 'Fanuc: #202 = [30.0 * TAN[#201]]', annotation: '#202 = 10.0 (verify: X travel for the Z depth)' },
      ],
      conclusion: 'Using ATAN in Fanuc macros, tapers of any angle can be computed and then used to calculate intermediate X positions at any Z depth — creating a perfectly linear tapered bore.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-arith-1',
        type: 'choice',
        text: 'In Fanuc Macro B, SIN[45] returns what value?',
        options: ['0.707 (sin of 45°)', '0.0 (45 is treated as radians = 2578°)', '1.0', '45.0'],
        answer: '0.707 (sin of 45°)',
      },
      {
        id: 'cnc-arith-2',
        type: 'choice',
        text: 'What does FIX[-1.9] return in Fanuc Macro B?',
        options: ['-2 (rounds away from zero)', '-1 (truncates toward zero)', '1', '2'],
        answer: '-1 (truncates toward zero)',
      },
      {
        id: 'cnc-arith-3',
        type: 'input',
        text: 'To compute #100 = (#200 + #201) * 3.0 in Fanuc Macro B, what is the exact line? (Hint: use [ ] for expressions) ',
        answer: '#100 = [[#200 + #201] * 3.0]',
      },
      {
        id: 'cnc-arith-4',
        type: 'choice',
        text: 'Why is the two-argument ATAN[y]/[x] preferred over single-argument ATAN[y] for computing angles around a circle?',
        options: [
          'It is more accurate',
          'It returns angles in the full 0°-360° range (four-quadrant), not just -90° to +90°',
          'It takes degrees instead of radians',
          'It is faster to compute',
        ],
        answer: 'It returns angles in the full 0°-360° range (four-quadrant), not just -90° to +90°',
      },
    ]
  },

  mentalModel: [
    '[ ] = expression delimiter. All math goes inside brackets.',
    'Fanuc trig = DEGREES. Python math.sin = radians. Convert!',
    'ROUND = nearest. FIX = truncate toward zero. FUP = ceiling away from zero.',
    'ATAN[y]/[x] = four-quadrant arctangent (0-360°). Use this for geometry.',
    'SQRT[ ], ABS[ ], SIN[ ], COS[ ] — all built in, all use degrees.',
  ],
}
