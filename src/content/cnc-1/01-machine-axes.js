/**
 * LESSON: THE CARTESIAN ARCHITECTURE OF CNC
 * * This file contains a deep-dive exploration of machine axes, 
 * blending historical context, physics, and vector mathematics.
 * Estimated Length: ~650 Lines.
 */

export default {
  id: 'cnc-machine-axes-masterclass',
  slug: 'machine-axes-kinematics',
  chapter: 'cnc-1',
  order: 1,
  title: 'The Cartesian Grid That Rules the World',
  subtitle: 'Spatial Kinematics, Historical Origins, and the Mathematical Control of Motion',
  tags: [
    'axes', 'X Y Z', 'A B C', 'right-hand rule', 'kinematics', 
    'Cartesian geometry', 'linear interpolation', 'rotary motion', 
    'work offsets', 'spindle orientation', 'vector math'
  ],

  semantics: {
    core: [
      { 
        symbol: 'X', 
        meaning: 'Primary horizontal axis. On a VMC, it is the longitudinal travel of the table. ' +
                 'Physically, it represents the longest travel distance in the horizontal plane.' 
      },
      { 
        symbol: 'Y', 
        meaning: 'Secondary horizontal axis. On a VMC, it is the cross-travel (front-to-back). ' +
                 'In the Cartesian plane, it is orthogonal (90°) to X.' 
      },
      { 
        symbol: 'Z', 
        meaning: 'The Spindle Axis. Crucially, Z is defined by the rotation of the tool or part. ' +
                 'Positive Z always increases the distance between the tool and the workpiece holder.' 
      },
      { 
        symbol: 'A', 
        meaning: 'Rotary motion around the X-axis. Used in 4th and 5th axis machining to "tilt" the part.' 
      },
      { 
        symbol: 'B', 
        meaning: 'Rotary motion around the Y-axis. Common on Horizontal Machining Centers (HMCs) for tombstone rotation.' 
      },
      { 
        symbol: 'C', 
        meaning: 'Rotary motion around the Z-axis. On lathes, this is the spindle index; on mills, it is the rotary table.' 
      },
      { 
        symbol: 'U, V, W', 
        meaning: 'Secondary linear axes parallel to X, Y, and Z. Often used in Swiss-turning or large-scale boring mills.' 
      },
      { 
        symbol: 'G53', 
        meaning: 'Machine Coordinate System (MCS). The "Absolute Zero" defined by hardware limit switches. Non-volatile.' 
      },
      { 
        symbol: 'G54-G59', 
        meaning: 'Work Coordinate Systems (WCS). The "Relative Zero" or local origin established for a specific setup.' 
      }
    ],
    rulesOfThumb: [
      'The "Z-Priority" Rule: Always retract Z to a safe height before moving X or Y. Failure to do so results in a "Rapid Collision."',
      'The "Right-Hand Rule": Your thumb is the linear axis; your fingers curl in the direction of positive rotation.',
      'The "Programmer’s Illusion": Always program as if the tool is moving, even if the machine actually moves the table. The part is static in your mind.',
      'Positive Z is ALWAYS the direction that prevents a crash. When in doubt, go Z+.'
    ]
  },

  hook: {
    question: 'Why do we call it "The Cartesian Grid," and why did its invention in 1637 eventually lead to the 5-axis aerospace parts of today?',
    realWorldContext:
      'Imagine a fly hovering in a room. To describe its exact location, you need three numbers: how far from the left wall (X), how far from the back wall (Y), and how high from the floor (Z). ' +
      'In 1637, René Descartes revolutionized the world by merging algebra and geometry, allowing us to describe any physical point as a numerical coordinate. ' +
      'Every CNC machine on Earth is a direct descendant of this logic. Whether it is a tiny desktop router or a 50-ton gantry mill, the machine is simply a robot that moves a tool to a set of Cartesian coordinates. ' +
      'But there is a twist: machines don\'t always move the way you think. On many mills, when you program X+1.0, the heavy metal table actually slides to the LEFT so that the tool stays to the RIGHT relative to the part. ' +
      'Mastering this "relative motion" is the difference between a master machinist and a button-pusher.',
    previewVisualizationId: 'CNCAxesExplorer',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCAxesExplorer',
        props: { height: 500, showRotary: true, showSecondary: true, initialAxis: 'Z' },
        title: 'The Kinematic Universe',
        caption: 'Explore the interplay between linear and rotary axes. Note how A, B, and C rotations are inextricably tied to their linear counterparts X, Y, and Z.'
      }
    ],
    prose: [
      '### I. The Philosophical Foundation: René Descartes and the Grid',
      'Before the 17th century, geometry was a matter of drawing shapes, and algebra was a matter of solving for "x." ' +
      'René Descartes bridged this gap by creating the **Coordinate Plane**. This allowed us to treat "space" as "data." ' +
      'In CNC machining, we treat the work envelope as a "Numerical Vacuum." We don\'t just move a tool; we navigate a mathematical field. ' +
      'The machine uses **Optical Encoders** or **Resolvers** to count pulses, ensuring that when we say "X2.5," the physical motor turns exactly enough times to move the ball screw by that precise distance.',

      '### II. The Z-Axis: The Spindle’s Sovereignty',
      '',
      'In the ISO standard (ISO 841), the **Z-axis** is always the axis of rotation for the spindle. ' +
      'On a **Vertical Machining Center (VMC)**, this means Z is vertical. ' +
      'On a **Horizontal Machining Center (HMC)**, Z is horizontal, pointing away from the column. ' +
      '**Scientific Fact**: We define Z+ as the direction that increases the distance between the tool and the workpiece. ' +
      'This is a safety protocol embedded in the DNA of manufacturing. If a program is going wrong, the operator’s instinct is to "Rapid Z Up." ' +
      'Because Z+ is always away from the part, this motion almost always saves the machine from a catastrophic crash.',

      '### III. The Paradox of Table Motion',
      'One of the hardest concepts for beginners to grasp is that **the tool often doesn’t move—the part does.** ' +
      'On a standard Haas VF-2 or Bridgeport mill, the spindle moves up and down (Z), but the table moves left/right (X) and forward/backward (Y). ' +
      '**Logical Rule**: We always program from the perspective of the **Tool**. ' +
      'If you want to cut a slot 2 inches to the right, you program `G1 X2.0`. Internally, the machine’s controller calculates: "To make the tool appear 2 inches to the right of the part origin, I must move the table 2 inches to the LEFT." ' +
      'The machine handles the inversion; you handle the geometry.',

      '### IV. Rotary Kinematics and the Right-Hand Rule',
      'Standard CNCs have 3 axes (X, Y, Z). Advanced machines add A, B, and C. ' +
      '* **A** rotates around **X**. ' +
      '* **B** rotates around **Y**. ' +
      '* **C** rotates around **Z**. ' +
      'To determine the "Positive" direction of rotation, we use the **Right-Hand Rule**. ' +
      'Imagine grabbing the X-axis with your right hand, your thumb pointing toward X+. Your fingers will curl in the direction of **A+**. ' +
      'This consistency is vital for multi-axis CAM (Computer-Aided Manufacturing) software to generate correct toolpaths for 5-axis impellers or turbine blades.',

      '### V. Machine Zero vs. Work Zero: The Two Realities',
      'Every CNC machine exists in two simultaneous universes: ' +
      '1. **The Physical Universe (G53):** This is the "Machine Home." It is defined by physical limit switches. When the machine "Homes" at startup, it is finding its absolute physical origin. You generally NEVER program in G53 coordinates because they change depending on where the table is. ' +
      '2. **The Part Universe (G54-G59):** This is the "Work Offset." You pick a corner of your raw material or the center of a bore and tell the machine: "This is (0,0,0) for my program." ' +
      'The **DRO (Digital Readout)** is your window into these universes. It shows the distance from the tool tip to your Work Zero.',
    ],
  },

  math: {
    prose: [
      '### The Mathematics of Movement',
      'The machine controller treats every motion command as a vector calculation. When you command a diagonal move:',
      '$\\vec{P_{start}} = (X_0, Y_0, Z_0) \\rightarrow \\vec{P_{end}} = (X_1, Y_1, Z_1) $',
      'The displacement vector is:',
      '$ \\\\Delta\\vec{P} = \\\\begin{bmatrix} X_1 - X_0 \\\\ Y_1 - Y_0 \\\\ Z_1 - Z_0 \\\\end{bmatrix} $',
      'The controller must solve for the **Euclidean Distance** ($D$) to apply the correct feedrate:',
      '$ D = \sqrt{(X_1 - X_0)^2 + (Y_1 - Y_0)^2 + (Z_1 - Z_0)^2} $',
      
      '### Linear Interpolation Logic',
      'If you set a feedrate of $F=50$ inches per minute (IPM), the controller must calculate the velocity for each individual motor ($V_x, V_y, V_z$) so that they all start and stop at the exact same millisecond, tracing a perfectly straight line.',
      'The time ($T$) for the move is $T = D / F$. The velocity for each axis is then:',
      '$ V_x = \\frac{\\Delta X}{T}, \\quad V_y = \\frac{\Delta Y}{T}, \\quad V_z = \\frac{\\Delta Z}{T} $',
      'This is why, on a diagonal move, the individual axes move slower than the commanded feedrate, but the *resultant vector* is exactly $F$.',

      '### Rotational Surface Speed',
      'For rotary axes (A, B, C), the math becomes more complex. Since $V = \\omega \\cdot r$ (where $\\omega$ is angular velocity and $r$ is radius), a rotation of 10 degrees per minute at a 1-inch radius is much slower than at a 10-inch radius. ' +
      'Modern controllers use **TCP (Tool Center Point Control)** to dynamically adjust linear speed while the rotary axes are turning, maintaining a constant "Surface Feedrate" at the tool tip.'
    ],
  },

  science: {
    prose: [
      '### Physics of CNC Motion',
      '**1. Inertia and Acceleration (G00 vs G01):** ' +
      'CNC axes are heavy. A typical machine table may weigh 500+ lbs. To move this from 0 to 1,000 inches per minute (Rapid) requires massive torque. ' +
      'Controllers use "S-Curve Acceleration" to ramp the velocity up and down, preventing "Jerking" which would leave marks on the part finish or damage the ball screws.',
      
      '**2. Thermal Expansion:** ' +
      'As the machine runs, friction in the ball screws generates heat. Steel expands at approximately $6.5 \times 10^{-6}$ inches per inch per degree Fahrenheit. ' +
      'Over a 20-inch travel, a $10^\circ F$ rise in temperature can cause a dimensional error of over $0.001"$. ' +
      'High-end machines use liquid-cooled ball screws and thermal sensors to "offset" the coordinate system in real-time as the machine warms up.',

      '**3. The Feedback Loop:** ' +
      'Most CNCs are "Closed-Loop" systems. The controller sends a signal to the **Servo Motor**, and an **Encoder** sends a signal back. ' +
      'If the controller says "Move 1.0000" but the encoder only sees "0.9998," the controller will increase the current to the motor to bridge that 0.0002" gap. ' +
      'If the gap (following error) becomes too large, the machine triggers a "Servo Alarm" and stops to prevent a bad part.'
    ]
  },

  rigor: {
    prose: [
      '### Advanced Axis Configurations',
      '**The Lathe Paradox (X-Axis Diameter vs Radius):** ' +
      'In turning, the X-axis controls the diameter of the part. However, the tool only moves along the radius. ' +
      'In G-code, we almost always use **Diameter Programming**. If you want a 2-inch shaft, you program `X2.0`, even though the tool only moved 1 inch from the center. ' +
      'This is a logical abstraction to match the blueprinted dimensions.',

      '**Singularity in 5-Axis Machining:** ' +
      'When two rotary axes align (e.g., the A-axis tilts 90 degrees and becomes parallel with the C-axis), the math behind the motion becomes "undefined." ' +
      'This is known as a **Kinematic Singularity**. Advanced CAM post-processors must calculate "flip-around" moves to avoid these zones where the machine would effectively have to move at infinite speed to maintain the tool path.',

      '**Right-Handed vs Left-Handed Coordinate Systems:** ' +
      'While 99% of CNCs are Right-Handed, some specialized older machines or custom robots use Left-Handed systems. ' +
      'Always verify the "Tick Direction" on the handwheel before moving an unfamiliar machine. ' +
      'Clockwise is generally positive, but machine specific parameters can invert this.'
    ],
  },

  examples: [
    {
      id: 'ex-3d-distance',
      title: 'Calculating 3D Tool Path Distance',
      problem: 'A tool moves from X1 Y1 Z1 to X4 Y5 Z1. What is the distance, and which axis moves the most?',
      steps: [
        { expression: '\\Delta X = 4 - 1 = 3', annotation: 'X-axis travel distance.' },
        { expression: '\\Delta Y = 5 - 1 = 4', annotation: 'Y-axis travel distance.' },
        { expression: '\\Delta Z = 1 - 1 = 0', annotation: 'No vertical movement.' },
        { expression: 'D = \\sqrt{3^2 + 4^2 + 0^2} = \\sqrt{9 + 16} = 5.0', annotation: 'Pythagorean result.' }
      ],
      conclusion: 'Even though we moved 3 inches in X and 4 inches in Y, the tool traveled a total of 5 inches. The Y-axis servo motor will have the highest velocity during this move.'
    },
    {
      id: 'ex-lathe-offset',
      title: 'Lathe Diameter Logic',
      problem: 'You are turning a 50mm diameter bar. You want to take a 2mm deep cut (on one side). What is your new X coordinate?',
      steps: [
        { expression: 'Current Diameter = 50mm', annotation: 'Starting point.' },
        { expression: 'Depth of Cut (Radial) = 2mm', annotation: 'Material removed from one side.' },
        { expression: 'Total Diameter Reduction = 2mm \\times 2 = 4mm', annotation: 'Because we are removing 2mm from the "top" and "bottom" of the circle.' },
        { expression: 'Target X = 50 - 4 = 46mm', annotation: 'The X command in the G-code.' }
      ],
      conclusion: 'On a lathe, a radial move is doubled in the G-code command because it represents the diameter change.'
    },    {
      id: 'ex-cnc-axis-move',
      title: 'Reading the DRO After a Diagonal Move',
      problem: 'The tool starts at X0 Y0 Z0. You command G01 X4.0 Y3.0. What does the DRO show after the move, and how far did the tool travel?',
      steps: [
        { expression: 'Start: (0, 0, 0)', annotation: 'DRO reads X0.0000, Y0.0000, Z0.0000.' },
        { expression: 'Command: G01 X4.0 Y3.0', annotation: 'Target: X=4.0, Y=3.0, Z unchanged at 0.' },
        { expression: 'D = √(4² + 3²) = √(16 + 9) = √25', annotation: 'This is a classic 3-4-5 right triangle.' },
        { expression: 'D = 5.0 inches', annotation: 'The tool moved 5.0 inches diagonally.' },
        { expression: 'DRO after: X4.0000, Y3.0000, Z0.0000', annotation: 'Controller confirms position.' },
      ],
      conclusion: 'The DRO always shows target coordinates, not the distance traveled. The actual distance requires the Pythagorean theorem.',
    },
    {
      id: 'ex-cnc-lathe-axis',
      title: 'Lathe X-Axis: Diameter Convention',
      problem: 'A lathe part has a 2.0-inch diameter section. What is the X-axis command to position the tool at that diameter?',
      steps: [
        { expression: 'Diameter = 2.0 inches', annotation: 'The finished part dimension.' },
        { expression: 'Lathe X uses diameter convention', annotation: 'X = diameter, not radius.' },
        { expression: 'G01 X2.0', annotation: 'This commands the tool to the 2.0-inch diameter position.' },
        { expression: 'Radius = 1.0 inch', annotation: 'The actual distance from spindle centerline to tool tip is 1.0 inch, but we write 2.0.' },
      ],
      conclusion: 'Always use the diameter value for X on a lathe. This matches the way machinists measure and inspect parts.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'q1',
        type: 'choice',
        text: 'According to ISO standards, which axis is always associated with the spindle rotation?',
        options: ['X', 'Y', 'Z', 'U'],
        answer: 'Z'
      },
      {
        id: 'q2',
        type: 'choice',
        text: 'In a "Table-Move" VMC, if you program G1 X5.0, which way does the table physically move?',
        options: [
          'To the right (+X)',
          'To the left (-X)',
          'Up (+Z)',
          'Toward the operator (+Y)'
        ],
        answer: 'To the left (-X)'
      },
      {
        id: 'q3',
        type: 'input',
        text: 'Using the Right-Hand Rule, if your thumb points in the +Y direction, your fingers curl in the positive direction of which rotary axis?',
        answer: 'B'
      },
      {
        id: 'q4',
        type: 'boolean',
        text: 'Thermal expansion can be ignored in CNC machining because the machines are made of heavy cast iron.',
        answer: false
      },
      {
        id: 'q5',
        type: 'choice',
        text: 'Which coordinate system is "fixed" to the machine hardware and cannot be moved by the operator?',
        options: ['G54', 'G55', 'G53', 'G91'],
        answer: 'G53'
      },
          {
        id: 'cnc-axes-1',
        type: 'choice',
        text: 'On a vertical machining center (VMC), which axis is the spindle axis?',
        options: ['X', 'Y', 'Z', 'A'],
        answer: 'Z',
      },
      {
        id: 'cnc-axes-2',
        type: 'choice',
        text: 'Positive Z always moves the tool in which direction?',
        options: [
          'Toward the part (plunge)',
          'Away from the part (retract)',
          'To the right',
          'Away from the operator',
        ],
        answer: 'Away from the part (retract)',
      },
      {
        id: 'cnc-axes-3',
        type: 'choice',
        text: 'On a CNC lathe, X2.0 means the part has a diameter of:',
        options: ['1.0 inch', '2.0 inches', '4.0 inches', '0.5 inch'],
        answer: '2.0 inches',
      },
      {
        id: 'cnc-axes-4',
        type: 'choice',
        text: 'Which rotary axis rotates around the Z-axis?',
        options: ['A', 'B', 'C', 'D'],
        answer: 'C',
      },
      {
        id: 'cnc-axes-5',
        type: 'input',
        text: 'A tool moves from X0 Y0 to X3.0 Y4.0. What is the total distance traveled (in units)? ',
        answer: '5',
      },
    ]
  },

  mentalModel: [
    'The "Z-Safety" Anchor: Z+ is always away from the part.',
    'Tool-Centric Perspective: Program the tool, let the controller move the iron.',
    'Alphabetical Pairing: A->X, B->Y, C->Z.',
    'The Cartesian Vacuum: Every point is just a set of three numbers (X,Y,Z).',
    'Diameter vs Radius: Lathes speak in diameters; Mills speak in absolute positions.',
        'Z = spindle axis. Positive Z = safe (up, away from part).',
    'X/Y = table axes on a VMC. Program tool position, not table position.',
    'Right-hand rule: A=around X, B=around Y, C=around Z.',
    'Machine Zero (G53) = factory fixed. Work Zero (G54) = your part.',
    'DRO = where the tool is RIGHT NOW.',
    'Lathe X = diameter, not radius.',
  ]
};