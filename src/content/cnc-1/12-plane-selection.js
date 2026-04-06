export default {
  id: 'cnc-plane-selection',
  slug: 'plane-selection',
  chapter: 'cnc-1',
  order: 12,
  title: 'Plane Selection',
  subtitle: 'G17, G18, and G19 — Telling the Controller Where Arcs Live',
  tags: ['G17', 'G18', 'G19', 'plane', 'arc', 'G02', 'G03', 'cutter compensation'],

  semantics: {
    core: [
      { symbol: 'G17', meaning: 'Select the XY plane. Arcs are programmed with I and J. Default for most vertical machining centers.' },
      { symbol: 'G18', meaning: 'Select the ZX plane. Arcs are programmed with I and K. Used for lathe contour arcs and horizontal mill profiling.' },
      { symbol: 'G19', meaning: 'Select the YZ plane. Arcs are programmed with J and K. Less common; used on multi-axis machines.' },
      { symbol: 'I', meaning: 'Arc center offset in the X direction (from arc start to arc center).' },
      { symbol: 'J', meaning: 'Arc center offset in the Y direction (from arc start to arc center).' },
      { symbol: 'K', meaning: 'Arc center offset in the Z direction (from arc start to arc center).' },
    ],
    rulesOfThumb: [
      'Always include G17 in your safe start block for vertical mills. If you forget, a previous program\'s G18 or G19 will still be active — and your arcs will cut in the wrong plane.',
      'The active plane also governs cutter compensation (G41/G42). Change the plane, change the compensation geometry.',
      'On a lathe: G18 (ZX plane) is the default because the spindle is along Z and the profile is in X.',
    ]
  },

  hook: {
    question: 'You program a circular arc (G02 X10 Y10 I5 J0), but the machine cuts a strange helical path instead of a flat circle. What went wrong?',
    realWorldContext:
      'An arc like G02 or G03 is always a 2D circle — it lives in a flat plane. ' +
      'The controller has to know *which* plane that circle is in before it can generate the coordinated axis motion. ' +
      'G17, G18, and G19 are the selector switch. If the wrong plane is active, the same I and J values define a completely different arc — often a dangerous helical dive that can crash the tool or scrap the part. ' +
      'This is why the safe start block always resets the plane explicitly.',
    previewVisualizationId: 'CNCLab',
  },

  intuition: {
    visualizations: [
      {
        id: 'CNCLab',
        props: {
          initialCode:
            '(PLANE SELECTION LAB)\n' +
            '(Compare: same arc command in G17 vs G18)\n' +
            '\n' +
            'G21 G90 G17 G40 G49 G80   (SAFE START - G17 = XY plane)\n' +
            'T1 M06\n' +
            'G43 H1\n' +
            'S1500 M03\n' +
            'G00 X0 Y0 Z5.\n' +
            'G01 Z-2. F80\n' +
            '\n' +
            '(ARC IN XY PLANE - correct for VMC profiling)\n' +
            'G17\n' +
            'G01 X30. F150\n' +
            'G02 X30. Y30. I0 J15.   (half circle in XY)\n' +
            'G01 X0\n' +
            '\n' +
            'G00 Z50.\n' +
            'M05 M30'
        },
        title: 'Plane Selection Lab',
        caption: 'G17 selects the XY plane — the I and J offsets define the arc center in X and Y. Try changing G17 to G18 and observe how the arc geometry changes in the backplot.',
      }
    ],
    prose: [
      '**Why planes exist**: A CNC controller is a 3D machine, but a circle is inherently a 2D shape. To interpolate a circular arc, the controller needs to know which two axes form the circle — it drives those two axes in coordination while the third axis either stays still (flat arc) or moves at constant feed (helical interpolation). The plane code is the instruction that specifies those two axes.',

      '**G17 — XY Plane (the default)**: On a vertical machining center, virtually all profiling and pocketing happens in the XY plane while Z controls depth. G17 is nearly always the correct choice. Arc center offsets are I (in X) and J (in Y). G17 is included in the standard safe start block `G21 G90 G17 G40 G49 G80` precisely because it must be set explicitly.',

      '**G18 — ZX Plane (the lathe default)**: On a lathe, the spindle runs along Z and the part profile is defined in X (diameter). All contour arcs — like turning a radius on a shoulder — live in the ZX plane. Arc center offsets are I (in X) and K (in Z). When writing lathe G-code, G18 is the assumed default, but explicit is always safer.',

      '**G19 — YZ Plane**: The least common selection. Used on horizontal mills for profiling in the YZ face, or on 5-axis machines during special toolpath orientations. Arc center offsets are J (in Y) and K (in Z). You will rarely need this on a standard 3-axis vertical mill.',

      '**Helical interpolation**: Any plane selection supports helical interpolation. In G17, if you command G02 X20 Y0 Z-5 I10 J0, the arc travels in XY *and* descends 5mm in Z simultaneously — a true helix. This is how many ramping toolpaths and thread milling cycles work.',

      '**Cutter compensation follows the plane**: G41/G42 (cutter comp) calculates the offset perpendicular to the tool path. The "perpendicular" direction is defined within the active plane. If you switch planes with comp active, the controller cannot resolve the geometry correctly and will typically alarm out. Always cancel compensation (G40) before switching planes.',
    ],
  },

  math: {
    prose: [
      'An arc center in G17 (XY plane) is defined by the I and J offsets from the arc **start point** to the arc **center**:',
      '$C_x = X_{\\text{start}} + I, \\quad C_y = Y_{\\text{start}} + J$',
      'The radius is then:',
      '$r = \\sqrt{I^2 + J^2}$',
      'The controller verifies that the end point lies on the same circle:',
      '$\\sqrt{(X_{\\text{end}} - C_x)^2 + (Y_{\\text{end}} - C_y)^2} = r$',
      'If it does not (within tolerance), the controller faults with a "radius mismatch" error. This is a common debugging point.',
      'For G18 (ZX plane), the same math applies using I and K instead of I and J. For G19 (YZ plane), it uses J and K.',
    ],
  },

  rigor: {
    prose: [
      '**R-word arcs vs I/J/K arcs**: Most controllers accept `G02 X20 Y0 R10` (radius form) as an alternative to I/J/K. The radius form is convenient for simple cases but has an ambiguity for 180° arcs (which semicircle?) and cannot represent 360° full circles. I/J/K is always unambiguous and is preferred for macro-generated arcs.',

      '**Plane persistence**: The active plane is modal — it stays set until explicitly changed. A shop practice mistake is to write a special program in G18 and then load a standard vertical-mill program afterward without resetting to G17. The machine begins cutting arcs in the ZX plane. Always start every program with the full safe start block.',

      '**Full-circle arcs require I/J/K**: To cut a full 360° circle (start = end point), you *must* use I/J/K form. The R-word form cannot define a full circle because the start and end are the same point, making the radius calculation ambiguous.',
    ],
  },

  examples: [
    {
      id: 'ex-plane-xy-arc',
      title: 'Full-Circle Pocket in G17',
      problem: 'Write a G02 command to cut a full 360° circle centered at X50 Y30, radius 20mm. Tool starts at X70 Y30 (3 o\'clock position on the circle).',
      steps: [
        { expression: 'Center: (50, 30), Start: (70, 30)', annotation: 'Tool is already on the circle at the rightmost point.' },
        { expression: 'I = 50 - 70 = -20, J = 30 - 30 = 0', annotation: 'Offset from start to center, in X and Y.' },
        { expression: 'G17  (select XY plane)', annotation: 'Confirm correct plane is active.' },
        { expression: 'G02 X70. Y30. I-20. J0', annotation: 'Start = End for a full circle. I/J define center offset.' },
      ],
      conclusion: 'The R-word form cannot represent this arc (start = end). Only I/J/K form works for full circles.',
    },
    {
      id: 'ex-plane-lathe-arc',
      title: 'Turning a Radius in G18',
      problem: 'On a lathe (G18 active), turn a convex 10mm radius from diameter X40 Z0 to X60 Z-10. The arc center is at X40 Z-10.',
      steps: [
        { expression: 'Start: X40 Z0, End: X60 Z-10', annotation: 'Start at the shoulder top, end at the bottom of the radius.' },
        { expression: 'Center: X40 Z-10', annotation: 'Computed from the geometry of the tangent blend.' },
        { expression: 'I = 40 - 40 = 0, K = -10 - 0 = -10', annotation: 'Offset from start (X40 Z0) to center (X40 Z-10).' },
        { expression: 'G18 G02 X60. Z-10. I0 K-10. F0.2', annotation: 'G18 plane, clockwise arc (G02) from the lathe operator\'s perspective.' },
      ],
      conclusion: 'In G18, I is the X offset and K is the Z offset. J is not used in this plane.',
    },
  ],

  assessment: {
    questions: [
      {
        id: 'cnc-plane-1',
        type: 'choice',
        text: 'Which plane selection code is standard for vertical machining center profiling and pocketing?',
        options: ['G17 (XY)', 'G18 (ZX)', 'G19 (YZ)', 'G16 (polar)'],
        answer: 'G17 (XY)',
      },
      {
        id: 'cnc-plane-2',
        type: 'choice',
        text: 'In G17, which address words define the arc center offset?',
        options: ['I and J', 'I and K', 'J and K', 'R only'],
        answer: 'I and J',
      },
      {
        id: 'cnc-plane-3',
        type: 'choice',
        text: 'Which plane is default on a CNC lathe?',
        options: ['G17 (XY)', 'G18 (ZX)', 'G19 (YZ)', 'G20 (imperial)'],
        answer: 'G18 (ZX)',
      },
      {
        id: 'cnc-plane-4',
        type: 'choice',
        text: 'A full 360° circular toolpath must use:',
        options: ['R-word form only', 'I/J/K form only', 'Either R or I/J/K', 'G03 only'],
        answer: 'I/J/K form only',
      },
      {
        id: 'cnc-plane-5',
        type: 'choice',
        text: 'You have G18 active and command G02 with I and J values. What happens?',
        options: [
          'The arc is cut correctly in the XY plane',
          'The arc is cut in the ZX plane using I and K — J is ignored',
          'The controller alarms out immediately',
          'The arc is cut as a helix',
        ],
        answer: 'The arc is cut in the ZX plane using I and K — J is ignored',
      },
    ]
  },

  mentalModel: [
    'G17 = XY plane (VMC default). I and J define the arc center.',
    'G18 = ZX plane (lathe default). I and K define the arc center.',
    'G19 = YZ plane (rare). J and K define the arc center.',
    'Wrong plane = wrong arc geometry — always reset in safe start block.',
    'Full 360° circles require I/J/K — R-word form cannot represent them.',
    'Cutter comp (G41/G42) is plane-dependent. Cancel G40 before switching planes.',
  ],
}
