/**
 * LESSON: CIRCULAR INTERPOLATION & CURVILINEAR DYNAMICS
 * An in-depth exploration of G02/G03, the trigonometry of IJK vectors,
 * and the physics of feedrate compensation.
 */

export default {
  id: 'cnc-circular-motion',
  slug: 'circular-interpolation',
  chapter: 'cnc-1',
  order: 11,
  title: 'Circular Interpolation: The Geometry of the Arc',
  subtitle: 'Mastering G02/G03, Trigonometric Centers, and Helical Logic',
  tags: ['G02', 'G03', 'IJK', 'G17', 'arcs', 'kinematics', 'trigonometry'],
  aliases: 'G02 G03 circular interpolation arc clockwise counterclockwise IJK I J K radius R-word G17 G18 G19 plane helical arc full circle',
  timeToComplete: 25,
  coreConcept: 'G02 (CW) and G03 (CCW) move the tool along a circular arc; the center is defined by incremental I/J/K vectors from the start point, or by an R-word for simple arcs. Start and end must be equidistant from the center or the controller alarms.',
  prerequisites: ['cnc-linear-interpolation'],
  nextLesson: 'plane-selection',

  semantics: {
    core: [
      { 
        symbol: 'G02', 
        meaning: 'Clockwise (CW) Circular Interpolation. Commands the machine to follow a circular path ' +
                 'from the current position to a target coordinate at a specified feedrate.' 
      },
      { 
        symbol: 'G03', 
        meaning: 'Counter-Clockwise (CCW) Circular Interpolation. The inverse of G02, used for ' +
                 'climb milling internal pockets or conventional milling outer profiles.' 
      },
      { 
        symbol: 'I', 
        meaning: 'The incremental X-axis vector from the start point to the center of the arc.' 
      },
      { 
        symbol: 'J', 
        meaning: 'The incremental Y-axis vector from the start point to the center of the arc.' 
      },
      { 
        symbol: 'K', 
        meaning: 'The incremental Z-axis vector from the start point to the center of the arc ' +
                 '(used in G18 and G19 planes or for Helical moves).' 
      },
      { 
        symbol: 'R', 
        meaning: 'Radius designation. An alternative to IJK, though limited to arcs < 360 degrees.' 
      },
      { 
        symbol: 'G17 / G18 / G19', 
        meaning: 'Plane Selection. G17 (XY), G18 (ZX), and G19 (YZ). These codes determine which ' +
                 'axes the I, J, and K vectors correspond to.' 
      },
      { 
        symbol: 'Modal', 
        meaning: 'A G-code state that remains active until changed. G02/G03 are modal; if the next ' +
                 'line is a straight move, you MUST command G01 to "cancel" the circular state.' 
      }
    ],
    rulesOfThumb: [
      'IJK points to the CENTER. If you are standing at the start, IJK is the map to where the "compass needle" is stuck.',
      'R-codes are for convenience; IJK is for precision. Use IJK for full 360° circles.',
      'Inner vs. Outer: On internal arcs, the tool tip travels slower than the tool center. Compensation is required.',
      'Check your plane! G17 (XY) is default, but a G18 (ZX) arc can destroy a part if the machine expects a flat move.',
      'Start and End must be equidistant from the center. If the math doesn\'t match (usually > .0001"), the machine alarms.',
            'G02/G03 are modal! Don\'t forget to switch back to G01 for straight lines.',
      'Always visualize the plane before writing arcs (G17 is the default XY).',
      'The center point (I,J,K) is almost always incremental from the start point.',
    ]
  },

  hook: {
    question: 'How does a machine composed of linear lead-screws generate a perfect, sub-micron curve?',
    realWorldContext:
      'In the early days of Numerical Control (1950s), machines could only move in straight lines. ' +
      'To make a curve, programmers had to calculate hundreds of tiny linear "steps"—a process called ' +
      'linear approximation. This resulted in "faceted" parts that looked like low-poly video game models. ' +
      'Modern CNC "Circular Interpolators" solve this by using high-speed trigonometric hardware. ' +
      'By pulsing the X and Y motors in a synchronized sine/cosine relationship, the machine ' +
      'maintains a constant distance from a central point, creating surfaces as smooth as glass. ' +
      'Whether it is the curve of a smartphone case or the aerodynamic profile of a wing, ' +
      'G02 and G03 are the brushes that paint the modern world.',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode: 
            '(ARC EXPLORATION LAB)\n' +
            'G20 G90 G17 (Inch, Absolute, XY Plane)\n' +
            'G00 X0 Y0\n' +
            'G01 X2.0 F20.0 (Move to start of arc)\n' +
            '(A 90-degree CCW Arc)\n' +
            'G03 X3.0 Y1.0 I1.0 J0.0 \n' +
            'G01 Y3.0\n' +
            '(A Full 360-degree CW Circle)\n' +
            'G02 X3.0 Y3.0 I-1.0 J0.0'
        },
        title: 'The Circular Kinematics Lab',
        caption: 'Watch the "Compass" effect. In the first arc, the center is 1.0" to the right (I1.0) of where the tool started. In the full circle, the center is 1.0" to the left (I-1.0).',
      },
      {
        id: 'GcodeNotebook',
        type: 'GcodeNotebook',
        initialProps: {
          dialect: 'fanuc',
          initialCells: [
            {
              id: 'arc-1',
              label: '1 — G02 CW and G03 CCW: same center, opposite direction',
              code:
                '; I and J are the vector FROM the start point TO the center.\n' +
                '; G02 = clockwise.  G03 = counter-clockwise.\n' +
                '; Both arcs below have the same center offset: I=50, J=0.\n' +
                'G21 G90 G17\n' +
                'G0 X0 Y0\n' +
                '; CW semicircle: start (0,0), end (100,0), center at (50,0)\n' +
                'G2 X100 Y0 I50 J0 F300     ; curves DOWN (clockwise in XY)\n' +
                'G0 X0 Y0\n' +
                '; CCW semicircle: same geometry, opposite direction\n' +
                'G3 X100 Y0 I50 J0 F300     ; curves UP (counter-clockwise)\n' +
                'G0 X0 Y0\n' +
                'M30\n',
            },
            {
              id: 'arc-2',
              label: '2 — R-word vs I/J: convenience vs precision',
              code:
                '; R-word is shorthand — just give the radius.\n' +
                '; But R cannot do full 360° circles. Use I/J for those.\n' +
                'G21 G90 G17\n' +
                'G0 X0 Y0\n' +
                '; R-word (simple arcs only):\n' +
                'G2 X60 Y0 R30 F300          ; CW arc radius=30, start (0,0) end (60,0)\n' +
                'G0 X0 Y0\n' +
                '; Same arc with I/J (always works):\n' +
                'G2 X60 Y0 I30 J0 F300       ; center is 30mm right of start point\n' +
                'G0 X0 Y0\n' +
                '; Full 360° circle — R fails here, MUST use I/J:\n' +
                'G0 X50 Y0                   ; move to circle start position\n' +
                'G2 X50 Y0 I-50 J0 F300      ; start=end, center at origin\n' +
                'G0 X0 Y0\n' +
                'M30\n',
            },
            {
              id: 'arc-3',
              label: '3 — Rounded corners: blend G01 into G02',
              code:
                '; Real parts combine straight lines and arcs.\n' +
                '; This cuts a rectangle with 10mm radius rounded corners.\n' +
                '; Each G02 arc blends one wall smoothly into the next.\n' +
                'G21 G90 G17\n' +
                'G0 X10 Y0\n' +
                'G1 Z-2 F150\n' +
                'G1 X70 F300             ; bottom edge\n' +
                'G2 X80 Y10 I0 J10       ; bottom-right corner, center 10mm up\n' +
                'G1 Y50                  ; right edge\n' +
                'G2 X70 Y60 I-10 J0      ; top-right corner, center 10mm left\n' +
                'G1 X10                  ; top edge\n' +
                'G2 X0  Y50 I0  J-10     ; top-left corner, center 10mm down\n' +
                'G1 Y10                  ; left edge\n' +
                'G2 X10 Y0  I10 J0       ; bottom-left corner, center 10mm right\n' +
                'G0 Z5\n' +
                'M30\n',
            },
          ],
        },
        title: 'G02/G03 Arcs — Center, Direction, Corners',
        caption: 'Cell 1: same I/J center, G02 vs G03 — watch the path flip direction. Cell 2: R-word shorthand vs I/J precision, and why R fails on full circles. Cell 3: rounded rectangle — blending G01 straight walls with G02 corner arcs.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 11 of 31 — Curved Motion',
        body: 'Linear motion (lesson 10) covers straight lines. Arcs are the other fundamental path shape. G01/G02/G03 together cover every 2D toolpath in CNC machining.',
      },
      {
        type: 'definition',
        title: 'G02 / G03 — Circular Interpolation',
        body: 'G02 = clockwise arc. G03 = counter-clockwise arc. Direction is defined looking DOWN the active plane axis (in G17/XY plane: clockwise = G02 when looking down Z). Both are modal in group 1, just like G01.',
      },
      {
        type: 'definition',
        title: 'I and J — center vectors from the start point',
        body: 'I = X-distance from arc start to center. J = Y-distance from arc start to center. These are ALWAYS incremental (relative to start), even in G90 absolute mode. If you are at X=20 and the center is at X=35, I = +15.',
      },
      {
        type: 'warning',
        title: 'Start and end must be equidistant from center',
        body: 'The controller checks that Rs (start radius) = Re (end radius) before executing. If they differ by more than the tolerance in machine parameters (typically 0.001mm), the machine alarms: "ARC RADIUS ERROR." Check your I/J math or your start/end coordinates.',
      },
      {
        type: 'warning',
        title: 'R-word cannot program a full 360° circle',
        body: 'When start = end, the R-word is geometrically ambiguous — two circles satisfy any given R through the same point. The controller alarms or does nothing. Use I/J for full circles.',
      },
      {
        type: 'insight',
        title: 'G02/G03 are modal — cancel with G01',
        body: 'After a G02 or G03, the motion mode is still "arc." A subsequent block with only coordinates will try to continue an arc. If you want a straight line next, explicitly write G01.',
      },
    ],
    prose: [
      '### I. The Philosophy of the Arc',
      'If G01 (Linear Interpolation) is a straight path from A to B, G02/G03 is a "constrained" path. ' +
      'Imagine you are holding a 10-foot rope tied to a post. As long as you keep the rope taut, ' +
      'every step you take is a circular arc. In CNC, the "rope" is the **Radius**, and the "post" is the **Center Point (IJK)**.',

      '### II. The IJK Coordinate System',
      '',
      'The biggest hurdle for new programmers is understanding that **I, J, and K are incremental vectors**, ' +
      'regardless of whether you are in Absolute (G90) or Incremental (G91) mode. ' +
      '* **I** is the X-distance from the Start to the Center. ' +
      '* **J** is the Y-distance from the Start to the Center. ' +
      'If you are at `X5.0` and the center of your circle is at `X7.0`, then `I` is `2.0`. ' +
      'Think of it as the instruction: "From where I am right now, where is the center of the circle?"',

      '### III. Directional Logic: CW vs. CCW',
      '',
      'The direction is determined by looking down the axis perpendicular to the plane. ' +
      'In **G17 (XY)**, you are looking down the Z-axis at the table. ' +
      '* **G02** follows the clock (Clockwise). ' +
      '* **G03** fights the clock (Counter-Clockwise). ' +
      '**Pro Tip:** Most "Climb Milling" operations on external profiles use G03, as the tool ' +
      'circles the part in a counter-clockwise direction to keep the chips behind the cutter.',

      '### IV. Plane Selection: The 3D Compass',
      'CNC machines aren\'t limited to drawing circles on the floor (XY). ' +
      '* **G17:** XY Plane. Uses I and J. (Standard Milling) ' +
      '* **G18:** ZX Plane. Uses I and K. (Common in Lathe turning or horizontal milling) ' +
      '* **G19:** YZ Plane. Uses J and K. (Used for side-profiling or 3D surfacing) ' +
      'If you command a G02 while in G18, the machine interprets I and K as the center, ' +
      'allowing you to cut a vertical arc.',
    ],
  },

  math: {
    prose: [
      '### The Trigonometry of Circular Interpolation',
      'The machine’s controller must verify the arc’s validity before the first motor pulse. ' +
      'For a given Start Point $(X_s, Y_s)$, End Point $(X_e, Y_e)$, and Center Point $(X_c, Y_c)$:',
      
      '**1. Calculating the Start Radius ($R_s$):**',
      '$R_s = \\sqrt{(X_c - X_s)^2 + (Y_c - Y_s)^2}$',
      
      '**2. Calculating the End Radius ($R_e$):**',
      '$R_e = \\sqrt{(X_c - X_e)^2 + (Y_c - Y_e)^2}$',
      
      '**3. The Tolerance Constraint:**',
      'For the machine to execute the move, it must satisfy:',
      '$|R_s - R_e| < \\epsilon$',
      'Where $\\epsilon$ is the "Arc Tolerance" parameter (typically $0.0001"$). ' +
      'If the math fails, the machine triggers an "Invalid IJK" or "Arc Radius Difference" alarm.',

      '### The Parametric Motion Profile',
      'During motion, the controller calculates coordinates using sine and cosine functions ' +
      'relative to the current angle $\\theta$:',
      '$X(t) = X_c + R \\cdot \\cos(\\theta(t))$',
      '$Y(t) = Y_c + R \\cdot \\sin(\\theta(t))$',
      'The velocities $V_x$ and $V_y$ are the derivatives of these positions, ' +
      'ensuring the tool tip moves at the constant feedrate $F$.',
    ],
  },

  science: {
    prose: [
      '### Physics of Curved Cutting',
      '**1. Feedrate Compensation on Arcs:**',
      'When a tool moves in a circle, the **Tool Center** and the **Tool Edge** travel different distances. ' +
      'If you are cutting an internal hole, the edge of the tool is traveling a smaller circle ' +
      'than the center of the tool. If you don’t adjust your feedrate, the tool edge will ' +
      'move too fast, causing heat and poor finish.',
      
      '**The Formula for Internal Arcs:**',
      '$F_{adjusted} = F \\cdot \\frac{R_{arc} - R_{tool}}{R_{arc}}$',
      
      '**2. Centripetal Force and Deflection:**',
      'In high-speed machining, the rapid change in direction on a small arc creates ' +
      'centripetal acceleration ($a = v^2 / r$). This creates a force that can "push" the ' +
      'tool away from the intended path. Modern "Look-Ahead" controllers detect small radii ' +
      'and automatically slow down the feedrate to ensure the tool stays on the mathematical curve.',

      '**3. Helical Interpolation:**',
      'By combining G02/G03 with a Z-axis move, the machine creates a **Helix**. ' +
      'This is the physics behind **Thread Milling**. The tool circles (XY) while ' +
      'simultaneously climbing (Z), perfectly tracing the pitch of a screw thread.',
    ],
  },

  rigor: {
    prose: [
      '### The "R" Word vs. IJK Vectors',
      'Most modern controllers accept the `R` command: `G02 X2.0 Y2.0 R1.0`. ' +
      'While simpler to write, it has a logical flaw: **Ambiguity**. ' +
      'Between any two points, there are two possible arcs of the same radius (a small arc and a large "major" arc). ' +
      'In G-code, a positive `R` creates an arc of 180° or less. A negative `-R` creates an arc greater than 180°. ' +
      'Because of this complexity and the fact that `R` cannot define a full 360° circle, ' +
      '**IJK is considered the "Best Practice" for professional CNC programming.**',

      '### Full Circle Logic',
      'To program a full 360° circle, the Start Point and End Point are the same. ' +
      'Example: `G02 X1.0 Y1.0 I1.0 J0.0` ' +
      'Because X and Y haven\'t changed, the machine knows to swing the tool in a complete loop ' +
      'around the center point defined by I and J. If you tried this with `R`, ' +
      'the machine wouldn\'t move at all, as it would see the distance to travel as zero.',
    ],
  },

  examples: [
    {
      id: 'ex-ijk-calc',
      title: 'Calculating IJK from Scratch',
      problem: 'You are at X10.0 Y10.0. You want to cut a 90-degree CCW arc to X15.0 Y15.0. Where is the center, and what is the IJK?',
      steps: [
        { expression: '\\text{Direction} = G03', annotation: 'CCW arc.' },
        { expression: '\\text{Center Point} = (10, 15)', annotation: 'In a 90-deg arc from (10,10) to (15,15), the center must be at X10 Y15.' },
        { expression: 'I = X_{center} - X_{start} = 10 - 10 = 0', annotation: 'The center is 0 units away in X.' },
        { expression: 'J = Y_{center} - Y_{start} = 15 - 10 = 5', annotation: 'The center is 5 units up in Y.' },
        { expression: 'G03 X15.0 Y15.0 I0 J5.0', annotation: 'The final G-code command.' }
      ],
      conclusion: 'The IJK values describe the path from the tool to the center point.'
    },
    {
      id: 'ex-feed-comp',
      title: 'Internal Arc Feedrate Compensation',
      problem: 'You are milling a 2.0" diameter hole with a 0.5" diameter endmill. Your base feedrate is 40 IPM. What is the compensated feedrate?',
      steps: [
        { expression: 'R_{arc} = 1.0"', annotation: 'Radius of the hole.' },
        { expression: 'R_{tool} = 0.25"', annotation: 'Radius of the cutter.' },
        { expression: 'F_{adj} = 40 \\cdot (1.0 - 0.25) / 1.0', annotation: 'Apply the internal compensation formula.' },
        { expression: 'F_{adj} = 40 \\cdot 0.75 = 30\\text{ IPM}', annotation: 'The tool center must slow to 30 IPM to keep the edge at 40 IPM.' }
      ],
      conclusion: 'Without this compensation, the hole would be "over-fed," likely resulting in poor finish and tool chatter.'
    }
  ],

  assessment: {
    questions: [
      {
        id: 'arc-q1',
        type: 'choice',
        text: 'What happens if you try to program a 360-degree circle using the R-word?',
        options: [
          'The machine cuts a perfect circle.',
          'The machine alarms or does nothing because the start and end are the same.',
          'The machine cuts two half-circles.',
          'The machine defaults to IJK.'
        ],
        answer: 'The machine alarms or does nothing because the start and end are the same.'
      },
      {
        id: 'arc-q2',
        type: 'choice',
        text: 'In the G17 plane, which axis does the J vector represent?',
        options: ['X', 'Y', 'Z', 'The Radius'],
        answer: 'Y'
      },
      {
        id: 'arc-q3',
        type: 'input',
        text: 'If you are at X2.0 Y2.0 and the center of your arc is at X2.0 Y5.0, what is the value of J?',
        answer: '3'
      },
      {
        id: 'arc-q4',
        type: 'boolean',
        text: 'IJK vectors are always incremental from the start point of the arc, regardless of G90/G91 mode.',
        answer: true
      },
      {
        id: 'arc-q5',
        type: 'choice',
        text: 'When milling the INSIDE of a circular pocket, how should the feedrate be adjusted?',
        options: [
          'Increased (faster)',
          'Decreased (slower)',
          'Stay the same',
          'Switch to Rapid (G00)'
        ],
        answer: 'Decreased (slower)'
      }
    ]
  },

  mentalModel: [
    'IJK = "The Map to the Center."',
    'G02/G03 = "The Clockwise/Counter-Clockwise Steering Wheel."',
    'G17/18/19 = "Choosing which wall to draw on."',
    'Modal Memory: Once you turn, you keep turning until you go straight (G01).',
    'Arc Tolerance: The machine is a mathematician; your radii must match to the 4th decimal.'
  ]
};