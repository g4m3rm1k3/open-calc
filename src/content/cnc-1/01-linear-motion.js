export default {
  id: 'cnc-linear-motion',
  slug: 'linear-interpolation',
  chapter: 'cnc-1',
  order: 9,
  title: 'Linear Interpolation',
  subtitle: 'Rapid (G00) vs. Linear (G01)',
  tags: ['G00', 'G01', 'feedrate', 'modal', 'axes', 'dog-leg', 'interpolation', 'G61', 'G64', 'lookahead'],

  semantics: {
    core: [
      {
        symbol: 'G00',
        meaning:
          'Rapid Motion: Move all axes at the machine\'s maximum speed to a target point. ' +
          'Each axis moves at its own maximum rate independently — the resulting path is NOT a ' +
          'straight line (it is a "dog-leg" or hockey-stick shape). G00 is for air moves only. ' +
          'Never use G00 while the tool is in contact with material.',
      },
      {
        symbol: 'G01',
        meaning:
          'Linear Interpolation: Move the tool in a mathematically straight line at a controlled ' +
          'feedrate. The controller decomposes the total velocity vector into per-axis components ' +
          'so that all axes start and finish simultaneously — guaranteeing a straight path. ' +
          'G01 requires an active feedrate (F word) to be meaningful.',
      },
      {
        symbol: 'F (Feedrate)',
        meaning:
          'The programmed speed of a G01 (or G02/G03) move. Units depend on active mode: ' +
          'G20 = inches per minute (IPM), G21 = millimeters per minute (mm/min). ' +
          'Feedrate is modal — once set, it remains active until changed. ' +
          'F is the magnitude of the total velocity vector, not the speed of any single axis.',
      },
      {
        symbol: 'N (Sequence Number)',
        meaning:
          'An optional line number prefix (e.g. N10, N20) for organizing or searching G-code. ' +
          'N-numbers are not executed — the controller uses them as labels. They do not need to ' +
          'be sequential or contiguous. Many programmers omit them entirely for short programs. ' +
          'They become essential when using GOTO statements in Macro B.',
      },
      {
        symbol: 'Modal Code',
        meaning:
          'A G or M code that, once commanded, remains active for all subsequent blocks until ' +
          'explicitly cancelled by a different code in the same group. G01 is modal — once ' +
          'programmed, subsequent lines with only coordinate words (X, Y, Z) execute as G01 ' +
          'moves at the modal feedrate without re-stating G01. This keeps programs compact.',
      },
      {
        symbol: 'Dog-Leg Path',
        meaning:
          'The non-straight path a G00 rapid move follows when X and Y distances are unequal. ' +
          'Because each axis runs at its own max speed independently, the shorter-travel axis ' +
          'finishes first and stops while the other continues. The result is an L-shape or ' +
          'diagonal-then-straight path — not the straight line the programmer might expect.',
      },
      {
        symbol: 'Lookahead (G64)',
        meaning:
          'A controller mode (default on most machines) where the controller reads several ' +
          'blocks ahead and blends the deceleration of one move into the acceleration of the ' +
          'next. The tool never fully stops at intermediate waypoints, producing smoother ' +
          'surface finish and faster cycle times. Corners are slightly rounded. ' +
          'Contrast with G61 (Exact Stop) where the tool decelerates to zero at each block end.',
      },
    ],
    rulesOfThumb: [
      'G00 is for air moves only. If the tool is touching material, use G01.',
      'G00 does NOT guarantee a straight line — it follows a dog-leg path. Never rely on G00 path shape.',
      'G01 and F are both modal — once set, they stay active until changed. A line with only Y2.0 after G01 X5.0 F20 cuts at 20 ipm.',
      'F is the total vector speed — the controller splits it across axes automatically. You never program per-axis speeds.',
      'Always state F explicitly on or before the first G01 move. A G01 with no active F will alarm on most controllers.',
      'G64 (lookahead/blending) is the default on most machines and is right for most milling. G61 (exact stop) is for corner accuracy at the cost of surface finish.',
      'N-numbers are labels, not line numbers the controller counts. A GOTO N100 jumps to the block labeled N100, not the 100th line.',
    ],
  },

  hook: {
    question:
      'How does a machine coordinate multiple motors to move in a perfectly straight line at a controlled speed?',
    realWorldContext:
      'If you move your hand to grab a coffee cup, your brain coordinates your shoulder, elbow, and wrist ' +
      'simultaneously — each joint moves a different amount, but they all arrive at the same moment. ' +
      'In CNC, the controller does this for the servo motors. To move diagonally — say, 8 inches in X ' +
      'and 5 inches in Y — the X motor must move 8/5 times faster than Y. Both must start and finish at ' +
      'exactly the same instant. This coordinated motion is **Linear Interpolation (G01)**. ' +
      'The controller solves the velocity math in real time, hundreds to thousands of times per second. ' +
      'The alternative — **Rapid (G00)** — simply runs each axis at full speed with no coordination, ' +
      'producing a dog-leg path that is only safe in free air.',
  },

  intuition: {
    visualizations: [
      {
        id: 'LinearInterpolationViz',
        props: {},
        title: 'G00 vs G01 — Interactive Motion Simulator',
        caption:
          'Four tabs: (1) Watch G00\'s dog-leg path vs G01\'s straight line in real time. ' +
          '(2) See the velocity decomposition math — drag angle and feedrate sliders. ' +
          '(3) Step through a program block by block and watch modal state carry over. ' +
          '(4) Compare G61 exact stop vs G64 lookahead at a corner.',
      },
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(RECTANGLE PATH)\n' +
            '(Notice: G01 stays active — you never retype it)\n' +
            '\n' +
            'G20 G90        (Inch mode, absolute positioning)\n' +
            'G00 X0 Y0      (Rapid to origin — dog-leg in air)\n' +
            'G01 X5.0 F50.0 (Cut right 5 inches at 50 ipm — G01 now modal)\n' +
            'Y3.0           (Modal G01 + Modal F50: cut up 3 inches)\n' +
            'X0.0           (Still G01 F50: cut left)\n' +
            'Y0.0           (Still G01 F50: cut down, close rectangle)\n' +
            'G00 Z5.0       (Rapid Z up — G01 cancelled by G00)\n' +
            'M30',
        },
        title: 'Linear Motion Lab — Run the Rectangle',
        caption:
          'Press Run and watch the DRO and backplot. Notice that G01 on line 5 stays active ' +
          'through lines 6–8 — the feed move happens without re-stating G01 each time. ' +
          'This is modal behavior. Try changing one of the middle lines to G00 — ' +
          'watch it jump at rapid speed instead of cutting.',
      },
    ],

    prose: [
      '**G00: The Highway vs G01: The Paintbrush**: Think of G00 as driving a highway — ' +
      'you want to reach the destination as fast as possible and don\'t care about the exact path, ' +
      'only the endpoint. Think of G01 as applying paint to a surface at a controlled stroke speed — ' +
      'every millimeter of path matters, and the speed must be consistent. ' +
      'G00 is for positioning the tool in free air. G01 is for every move where the tool is ' +
      'engaged with the workpiece.',

      '**The Dog-Leg Danger**: This is the most common G00 misconception. Most CNC machines ' +
      'execute G00 by running each axis at its own maximum rapid rate independently — no coordination. ' +
      'If you command G00 X9.0 Y6.0 from position X1.0 Y1.0, the machine moves 8 inches in X ' +
      'and 5 inches in Y. X finishes first (8 in at max X rate), Y finishes later (5 in at max Y rate). ' +
      'The resulting path bends at the corner where X finishes. It is not a straight line. ' +
      'On a well-maintained VMC, the corner may still be several inches away from any obstacle — ' +
      'but if you\'ve programmed tight clearances assuming G00 is a straight line, ' +
      'the tool will crash through your fixture.',

      '**Modal State — CNC Controllers Are Lazy**: Once you command G01, the controller treats ' +
      'every subsequent block as a G01 move until you explicitly command something else ' +
      '(like G00, G02, or G03). This "sticky" behavior is called modal state. It applies to ' +
      'feedrate too — once you program F50, every subsequent G01 runs at 50 ipm until you ' +
      'change it. This keeps programs compact (you don\'t retype G01 F50 on every line) ' +
      'but demands that you always know what mode the controller is in. ' +
      'The most dangerous version of this: forgetting that G83 (a drilling canned cycle) ' +
      'is still active after you\'ve moved to a new position — the controller will try to drill there.',

      '**How the Controller Decomposes Velocity**: When you command G01 X9.0 Y6.0 F50.0, ' +
      'the controller doesn\'t command "X motor at 40 ipm, Y motor at 30 ipm" explicitly. ' +
      'It computes the total distance D = √(8² + 5²) = 9.43 inches, then sets each axis velocity ' +
      'proportionally: Vx = (8/9.43) × 50 = 42.4 ipm, Vy = (5/9.43) × 50 = 26.5 ipm. ' +
      'Both axes start and stop simultaneously — this is what produces the straight line. ' +
      'F is always the total vector speed; you never program individual axis speeds for G01.',

      '**G61 vs G64 — What Happens at Corners**: After every G01 block, the controller has ' +
      'two choices. In G61 (Exact Stop mode), it decelerates to zero, verifies in-position, ' +
      'then accelerates into the next move. You get crisp, accurate corners but the machine ' +
      'stutters — bad for surface finish on contours. In G64 (Lookahead/Continuous mode, ' +
      'the default on most machines), the controller reads several blocks ahead and blends ' +
      'the exit velocity of one move into the entry velocity of the next. The tool never ' +
      'fully stops. Cycle time drops, surface finish improves, but corners are slightly rounded ' +
      '(typically by microns on a well-tuned machine). For most milling, G64 is correct. ' +
      'Use G61 when corner sharpness is a print requirement.',
    ],
  },

  math: {
    prose: [
      'During a G01 move from $(x_1, y_1, z_1)$ to $(x_2, y_2, z_2)$ at feedrate $F$ (in/min or mm/min), ' +
      'the controller decomposes the total velocity vector into per-axis components.',

      'First, the total distance $D$:',
      '$D = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$',

      'Then the time $T$ required for the move:',
      '$T = \\frac{D}{F}$',

      'Per-axis velocities, computed so all axes finish simultaneously:',
      '$V_x = \\frac{x_2 - x_1}{T}, \\quad V_y = \\frac{y_2 - y_1}{T}, \\quad V_z = \\frac{z_2 - z_1}{T}$',

      'Which is identical to:',
      '$V_x = F \\cdot \\frac{x_2 - x_1}{D}, \\quad V_y = F \\cdot \\frac{y_2 - y_1}{D}, \\quad V_z = F \\cdot \\frac{z_2 - z_1}{D}$',

      'The magnitude of the velocity vector equals $F$ at every instant:',
      '$|\\mathbf{V}| = \\sqrt{V_x^2 + V_y^2 + V_z^2} = F$',

      'The controller updates these velocities at every interpolation cycle (typically $\\Delta t = 0.25\\text{–}1$ ms). ' +
      'For a 50 ipm feedrate over a 2-inch move, $T = 2/50 = 0.04$ minutes = 2.4 seconds, ' +
      'meaning the controller executes approximately 2,400 interpolation cycles for that one move.',

      'For comparison, G00 does no velocity coordination — it simply commands each axis to its ' +
      'maximum velocity $V_{max,x}$, $V_{max,y}$, $V_{max,z}$ independently:',
      '$\\text{G00: } \\text{axis moves at } V_{max,i} \\text{ until it reaches target, then stops independently}$',

      'This is why G00 does not produce a straight line when axis distances differ.',
    ],
  },

  rigor: {
    prose: [
      '**G-code Modal Groups**: G-codes are organized into mutually exclusive groups. ' +
      'Only one code from each group can be active at a time. Group 1 (motion modes) includes ' +
      'G00, G01, G02, G03, G33, G80, G81–G89. Commanding any of these cancels the previous ' +
      'Group 1 code. This is why G00 cancels G01 and vice versa. Feedrate (F) is in its own ' +
      'group and is modal independently of motion mode. Knowing the group structure is essential ' +
      'for understanding what happens when you read a program with missing codes.',

      '**Exact Stop Check (G61) vs Cutting Mode (G64) — Machine-Level Detail**: ' +
      'In G64 (lookahead), the controller uses a tolerance zone to decide when a block is ' +
      '"close enough" to done before beginning the next. This tolerance (sometimes called ' +
      '"in-position tolerance" or "corner tolerance") is set in machine parameters — typically ' +
      '0.001–0.01mm. Tighter tolerance = sharper corners = lower speed through corners. ' +
      'Looser tolerance = rounder corners = faster throughput. On Fanuc, this is parameter 1826. ' +
      'On high-speed machining applications (HSM), a separate mode (G05.1 Q1, AI Contour Control ' +
      'on Fanuc) applies advanced look-ahead filtering to enable smooth motion at very high feedrates.',

      '**Jerk and Acceleration — Why F Isn\'t Instantaneous**: The controller cannot ' +
      'instantaneously reach feedrate F — the servo motor has a finite acceleration limit. ' +
      'Most controllers apply an S-curve acceleration profile (or simpler trapezoidal profile) ' +
      'at the start and end of each move. The programmed F is the target velocity at the middle ' +
      'of the move, not at the start. For very short moves (shorter than the distance needed to ' +
      'accelerate and decelerate), the axis never reaches F — the actual peak velocity is lower. ' +
      'This has measurable impact on surface finish when many short moves are chained (as in ' +
      'complex curved surfaces from CAM).',

      '**F Word Interpretation on Lathes**: On a turning center in G98 mode, F is in inches ' +
      'per minute (IPM) or mm/min — same as milling. In G99 mode (the more common lathe default), ' +
      'F is in inches per revolution (IPR) or mm/rev. G99 F0.003 means 0.003" advance per ' +
      'spindle revolution — the actual linear feedrate then varies with RPM. This is usually ' +
      'preferred for turning because it keeps the chip thickness constant regardless of ' +
      'spindle speed changes from G96 (Constant Surface Speed). Mixing up G98 and G99 ' +
      'on a lathe produces either very slow or very fast feeds — another unit mismatch trap.',

      '**Sequence Numbers (N-words) — What They Actually Do**: N-numbers are optional labels, ' +
      'not program counters. The controller executes blocks in file order, not in N-number order. ' +
      'N10, N20, N30 executes in that order; but so does N10, N5, N100 — block 2 runs after block 1 ' +
      'regardless of N values. N-numbers become operationally meaningful in two cases: ' +
      '(1) GOTO/GOSUBs in Macro B that jump to a named N-block; ' +
      '(2) the machine operator\'s "block search" function that lets them restart a program ' +
      'from a specific N-number (useful after a crash or tool change mid-program).',
    ],
  },

  examples: [
    {
      id: 'ex-cnc-modal-rapid',
      title: 'Modal State — Reading an Ambiguous Program',
      problem:
        'Analyze the sequence: N10 G00 X1 Y1, N20 G01 X5 F20, N30 Y2. ' +
        'What motion type and feedrate is active at N30? ' +
        'Where does the tool end up and how fast does it get there?',
      code: 'N10 G00 X1.0 Y1.0\nN20 G01 X5.0 F20.0\nN30 Y2.0',
      steps: [
        {
          expression: 'N10',
          annotation:
            'G00 is commanded. Controller enters rapid motion mode. ' +
            'Machine moves to (1.0, 1.0) at maximum axis speeds. ' +
            'No feedrate needed or used — G00 ignores F. ' +
            'Active modal state after N10: [G00, no active F].',
        },
        {
          expression: 'N20',
          annotation:
            'G01 is commanded — it replaces G00 in modal Group 1. ' +
            'F20.0 is commanded — it becomes the active modal feedrate. ' +
            'Machine moves to (5.0, 1.0) in a straight line at 20 ipm. ' +
            'Active modal state after N20: [G01, F20].',
        },
        {
          expression: 'N30',
          annotation:
            'No motion code on this block — G01 carries over from N20 (modal). ' +
            'No F word on this block — F20 carries over from N20 (modal). ' +
            'Only Y2.0 is new. Machine executes a G01 move from (5.0, 1.0) to (5.0, 2.0) at 20 ipm. ' +
            'Active modal state after N30: [G01, F20] — unchanged.',
        },
      ],
      conclusion:
        'N30 executes as a controlled linear cut at 20 ipm, even though neither G01 nor F20 ' +
        'appear on that line. The modal state is invisible but completely real. ' +
        'When reading a program, you cannot evaluate any line in isolation — you must track ' +
        'all active modal codes from the beginning of the program.',
    },
    {
      id: 'ex-velocity-decomp',
      title: 'Velocity Decomposition — A Diagonal Cut',
      problem:
        'A G01 move commands X9.0 Y6.0 from position X1.0 Y1.0 at F50.0 (inches per minute). ' +
        'What are the X and Y axis velocities? How long does the move take?',
      steps: [
        {
          expression: 'ΔX = 8.0, ΔY = 5.0',
          annotation:
            'Net displacement: X moves 8 inches, Y moves 5 inches.',
        },
        {
          expression: 'D = √(8² + 5²) = √(64 + 25) = √89 ≈ 9.434 in',
          annotation:
            'Total path length — the hypotenuse, not the sum of the sides.',
        },
        {
          expression: 'T = D / F = 9.434 / 50 = 0.1887 min = 11.32 sec',
          annotation:
            'Time for the move at 50 ipm. Both axes must complete their travel in this exact time.',
        },
        {
          expression: 'Vx = 8.0 / 0.1887 = 42.4 ipm',
          annotation:
            'X axis velocity. This is less than F because X is not the only axis moving.',
        },
        {
          expression: 'Vy = 5.0 / 0.1887 = 26.5 ipm',
          annotation:
            'Y axis velocity. Slower than X because Y has less distance to cover in the same time.',
        },
        {
          expression: '√(42.4² + 26.5²) = √(1797.8 + 702.3) = √2500 = 50 ipm ✓',
          annotation:
            'Verification: the vector sum of Vx and Vy equals the programmed F. The math is consistent.',
        },
      ],
      conclusion:
        'The controller never exposes these per-axis velocities in G-code — you only program F. ' +
        'But understanding the decomposition explains why a G01 at F50 moves each axis slower ' +
        'than 50 ipm (unless the move is purely along one axis). It also explains why ' +
        'long diagonal moves and short axis-aligned moves at the same F value feel different ' +
        'to observe: the diagonal move is distributing the total speed across two axes.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-linear-1',
        type: 'choice',
        text: 'Which code should you use when the tool is in contact with the material?',
        options: ['G00', 'G01', 'G04', 'M06'],
        answer: 'G01',
        explanation:
          'G00 moves each axis at its own maximum speed with no coordination — the path is not ' +
          'guaranteed to be straight, and the speed is uncontrolled. G01 coordinates all axes to ' +
          'produce a straight line at the programmed feedrate F. Always use G01 when the tool is ' +
          'engaged with the workpiece.',
      },
      {
        id: 'cnc-linear-2',
        type: 'input',
        text: 'If G01 is active, which letter sets the cutting speed?',
        answer: 'F',
        explanation:
          'F (feedrate) specifies the total vector speed of a G01, G02, or G03 move. ' +
          'Units are IPM in G20 (inch) mode or mm/min in G21 (metric) mode. ' +
          'F is modal — once programmed, it stays active for all subsequent cutting moves ' +
          'until a new F value is programmed.',
      },
      {
        id: 'cnc-linear-3',
        type: 'choice',
        text:
          'A program contains: N10 G01 X5.0 F30 / N20 Y3.0 / N30 X0 F50. ' +
          'At what feedrate does N20 execute?',
        options: ['F0 — no feedrate on the line', 'F30 — carried over from N10', 'F50 — the next feedrate in the program', 'Maximum rapid — no F on the line means G00'],
        answer: 'F30 — carried over from N10',
        explanation:
          'F is modal. F30 was set on N10 and remains active until explicitly changed. ' +
          'N20 has no F word, so F30 carries over. N30 sets a new F50, which becomes modal ' +
          'from that point forward. A missing F word never means "use maximum speed" — that is G00 territory.',
      },
      {
        id: 'cnc-linear-4',
        type: 'choice',
        text:
          'Why does a G00 rapid move follow a dog-leg (bent) path instead of a straight line?',
        options: [
          'The controller deliberately avoids straight lines to prevent collisions',
          'Each axis runs at its own maximum speed independently — the shorter-travel axis finishes first',
          'G00 uses circular interpolation internally',
          'The feedrate F controls the axis ratio, and without F the path is undefined',
        ],
        answer:
          'Each axis runs at its own maximum speed independently — the shorter-travel axis finishes first',
        explanation:
          'G00 coordinates nothing — it simply commands each axis to its maximum rapid rate. ' +
          'The axis with less distance to travel reaches its target sooner and stops while the ' +
          'other axis continues moving. This produces an L-shaped or diagonal-then-straight path, ' +
          'not a straight line. Only G01 (with its velocity decomposition math) guarantees ' +
          'a straight path.',
      },
      {
        id: 'cnc-linear-5',
        type: 'choice',
        text:
          'G01 commands X9.0 Y6.0 F60 from X1.0 Y1.0. ' +
          'The total distance is approximately 9.43 inches. ' +
          'What is the approximate X-axis velocity?',
        options: ['60.0 ipm', '50.9 ipm', '37.9 ipm', '30.0 ipm'],
        answer: '50.9 ipm',
        explanation:
          'Vx = F × (ΔX / D) = 60 × (8.0 / 9.434) = 60 × 0.848 ≈ 50.9 ipm. ' +
          'The X axis moves at 50.9 ipm, the Y axis at 60 × (5/9.434) = 31.8 ipm. ' +
          'The vector sum √(50.9² + 31.8²) ≈ 60 ipm — equal to the programmed feedrate.',
      },
      {
        id: 'cnc-linear-6',
        type: 'choice',
        text:
          'What is the difference between G61 and G64 motion modes?',
        options: [
          'G61 is for milling, G64 is for turning',
          'G61 decelerates to zero at each block end (exact stop); G64 blends moves together for continuous smooth motion',
          'G61 activates closed-loop servo control; G64 uses open-loop stepping',
          'G61 is metric mode; G64 is inch mode',
        ],
        answer:
          'G61 decelerates to zero at each block end (exact stop); G64 blends moves together for continuous smooth motion',
        explanation:
          'G61 (Exact Stop Check) decelerates the tool to zero at the end of every move before ' +
          'starting the next. Corners are sharp but cycle time is slow. G64 (Cutting Mode / Lookahead) ' +
          'reads blocks ahead and blends exit velocity into entry velocity — the tool never fully ' +
          'stops at intermediate waypoints. G64 is the default on most machines and is correct for ' +
          'most milling. G61 is used when corner accuracy is a specific print requirement.',
      },
    ],
  },

  mentalModel: [
    'G00 = Highway speed, any path. G01 = Paintbrush, straight line at controlled speed.',
    'G00 is for air. G01 is for cuts. There are no exceptions.',
    'Dog-leg: G00 moves each axis independently. The path bends where the shorter axis stops.',
    'Modal = sticky. G01 at N10 is still active at N50 if nothing cancelled it.',
    'F is the total vector speed — the controller splits it across axes. You never program per-axis speeds.',
    'G64 (lookahead) = smooth, fast, slightly rounded corners. G64 is the default and right for most jobs.',
    'G61 (exact stop) = crisp corners, stuttering motion. Use only when corner geometry is on the print.',
    'Always track active modal codes from the top of the program — you cannot read a G-code block in isolation.',
  ],
}