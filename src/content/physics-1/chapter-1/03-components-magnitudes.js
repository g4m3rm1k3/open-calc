export default {

  // ── Identity ─────────────────────────────────────────────────────────────
  id: 'p1-ch1-003',
  slug: 'components-and-magnitudes',
  chapter: 'p1',
  order: 3,
  title: 'Components and Magnitudes',
  subtitle: 'How to pull a vector apart — and put it back together.',
  tags: ['components', 'magnitude', 'decomposition', 'Pythagorean theorem', 'trig'],
  aliases: 'vector components finding components horizontal vertical resolve',

  // ── Hook ─────────────────────────────────────────────────────────────────
  hook: {
    question: `A ball is kicked at 20 m/s at 35° above the ground. How fast is it moving horizontally? How fast vertically? You cannot answer either question without decomposing the vector.`,
    realWorldContext: `Every projectile problem, every incline problem, every force analysis in physics begins with the same move: split the vector into horizontal and vertical pieces. Components are the fundamental tool of applied physics.`,
    previewVisualizationId: 'SVGDiagram',
  },

  // ── YouTube ───────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (3 of 21) Components and Magnitudes of a Vector',
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (4 of 21) Finding the Components of a Vector',
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ─────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      'Picture walking from one corner of a city block to the diagonally opposite corner. You cannot walk diagonally — the buildings are in the way. Instead you walk some distance east, then some distance north. Those two legs — the "east part" and the "north part" — are the *components* of your displacement.',
      'Every vector in 2-D has exactly two components: the amount it reaches along $x$ and the amount it reaches along $y$. The original vector is the hypotenuse; the components are the two legs of a right triangle.',
      'To find the components you need exactly one tool: trigonometry. The angle $\\theta$ (measured from the positive $x$-axis) and the magnitude $|\\vec{A}|$ are all the ingredients you need.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Components of a vector',
        body:
          'For $\\vec{A}$ with magnitude $|\\vec{A}|$ at angle $\\theta$ from $+x$: A_x = |\\vec{A}|\\cos\\theta,\\quad A_y = |\\vec{A}|\\sin\\theta.',
      },
      {
        type: 'insight',
        title: 'The right-triangle picture',
        body:
          'Draw $\\vec{A}$. Drop a perpendicular to the $x$-axis. The hypotenuse is $|\\vec{A}|$, the adjacent leg is $A_x$, the opposite leg is $A_y$. SOH-CAH-TOA does the rest.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'The right-triangle picture',
        caption: 'A vector at angle θ is the hypotenuse. Aₓ = |A|cosθ is the adjacent leg; Ay = |A|sinθ is the opposite leg. SOH-CAH-TOA gives you both components directly.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Drag the vector — watch the right triangle appear',
        caption: `Components are just shadows: $A_x$ is the shadow on the $x$-axis, $A_y$ on the $y$-axis. Drag the arrowhead and watch how $\\cos\\theta$ and $\\sin\\theta$ scale with magnitude.`,
        props: { showRightTriangle: true, showLabels: true },
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  math: {
    prose: [
      'The two formulas for components come directly from the definitions of sine and cosine. Here is the complete two-way conversion table:',
      'A critical skill is recognising which angle to use. The formulas $A_x = |\\vec{A}|\\cos\\theta$ and $A_y = |\\vec{A}|\\sin\\theta$ assume $\\theta$ is measured **counterclockwise from the positive $x$-axis**. If a problem gives you an angle measured from a different reference (e.g. from the $y$-axis, or "below the horizontal"), convert to the standard angle first.',
      'When recovering the angle from components, always sketch the vector to confirm the quadrant. A calculator\'s $\\arctan$ only covers $(-90°, 90°)$, so you must manually apply quadrant corrections.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Forward: magnitude + angle → components',
        body: 'A_x = |\\vec{A}|\\cos\\theta \\qquad A_y = |\\vec{A}|\\sin\\theta',
      },
      {
        type: 'theorem',
        title: 'Inverse: components → magnitude + angle',
        body:
          '|\\vec{A}| = \\sqrt{A_x^2 + A_y^2} \\qquad \\theta = \\operatorname{atan2}(A_y,\\, A_x)',
      },
      {
        type: 'definition',
        title: 'atan2 — the quadrant-aware arctangent',
        body:
          '\\operatorname{atan2}(y, x) \\text{ returns the angle in } (-180°, 180°] \\text{ by checking the signs of both arguments. Use this instead of plain } \\arctan \\text{ whenever components can be negative.}',
      },
      {
        type: 'warning',
        title: 'Angle reference point matters',
        body:
          'If a problem states "30° above the horizontal", $\\theta = 30°$ in the standard formulas. If it states "30° from the vertical", $\\theta = 60°$ from the horizontal. Always convert to "from the positive $x$-axis, counterclockwise" before plugging in.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Forward and inverse conversion',
        caption: `Left: given $|\\vec{A}|$ and $\\theta$, find $A_x = |\\vec{A}|\\cos\\theta$ and $A_y = |\\vec{A}|\\sin\\theta$. Right: given $A_x$ and $A_y$, find $|\\vec{A}| = \\sqrt{A_x^2+A_y^2}$ and $\\theta = \\text{atan2}(A_y, A_x)$. The diagram shows both conversions simultaneously.`,
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The component formulas are consequences of the definitions of sine and cosine on the unit circle. Here we derive them from first principles so the formulas are no longer "things to memorise" but things you could re-derive on the spot.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The unit circle is the bridge',
        body:
          'Place a unit vector at angle $\\theta$. Its tip lands at $(\\cos\\theta, \\sin\\theta)$ by definition. Scaling by $|\\vec{A}|$ gives $(|\\vec{A}|\\cos\\theta,\\; |\\vec{A}|\\sin\\theta)$ — those are the components.',
      },
    ],
    proofSteps: [
      {
        expression: '\\vec{A} = (\\text{cos}\\theta, \\text{sin}\\theta) \\quad \\text{where } |\\vec{A}|=1',
        annotation: 'Place a unit vector at angle $\\theta$. Its tip lands on the unit circle at $(\\cos\\theta, \\sin\\theta)$.',
      },
      {
        expression: '\\hat{A} = (\\cos\\theta,\\;\\sin\\theta)',
        annotation: 'This is the unit-circle definition of sine and cosine: x-reach is $\\cos\\theta$, y-reach is $\\sin\\theta$.',
      },
      {
        expression: '\\vec{A} = |\\vec{A}|\\hat{A} = |\\vec{A}|(\\cos\\theta,\\;\\sin\\theta)',
        annotation: 'Any vector equals its magnitude times its unit vector. Multiply the unit vector by $|\\vec{A}|$.',
      },
      {
        expression: 'A_x = |\\vec{A}|\\cos\\theta, \\qquad A_y = |\\vec{A}|\\sin\\theta',
        annotation: 'Read off the components. These are the fundamental conversion formulas — derived, not memorised.',
      },
      {
        expression: 'A_x^2 + A_y^2 = |\\vec{A}|^2\\cos^2\\theta + |\\vec{A}|^2\\sin^2\\theta = |\\vec{A}|^2(\\cos^2\\theta+\\sin^2\\theta) = |\\vec{A}|^2',
        annotation: 'The Pythagorean identity $\\cos^2\\theta + \\sin^2\\theta = 1$ confirms the magnitude is consistent. This also proves $|\\vec{A}| = \\sqrt{A_x^2+A_y^2}$.',
      },
    ],
    title: 'Derivation: component formulas from the unit circle',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'slope-triangle' },
        title: 'Unit circle → component formulas',
        caption: `Place a unit vector at angle $\\theta$. Its tip lands at $(\\cos\\theta, \\sin\\theta)$. Scale by $|\\vec{A}|$: the components follow directly. Every component formula is just $\\cos$ or $\\sin$ scaled by the magnitude.`,
      },
    ],
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-003-ex1',
      title: 'Decomposing a velocity vector',
      problem:
        '\\text{A ball is launched at } |\\vec{v}| = 20\\,m/s \\text{ at } \\theta = 35° \\text{ above the horizontal. Find the horizontal and vertical components.}',
      steps: [
        {
          expression: 'v_x = |\\vec{v}|\\cos\\theta = 20\\cos35°',
          annotation: 'Horizontal = magnitude × cos(angle).',
        },
        {
          expression: 'v_x = 20 \\times 0.8192 \\approx 16.4\\,m/s',
          annotation: '$\\cos35° \\approx 0.8192$. This is the speed the ball moves horizontally.',
        },
        {
          expression: 'v_y = |\\vec{v}|\\sin\\theta = 20\\sin35°',
          annotation: 'Vertical = magnitude × sin(angle).',
        },
        {
          expression: 'v_y = 20 \\times 0.5736 \\approx 11.5\\,m/s',
          annotation: '$\\sin35° \\approx 0.5736$. This is the initial upward speed.',
        },
        {
          expression: '\\text{Check: }\\sqrt{16.4^2 + 11.5^2} = \\sqrt{268.96 + 132.25} = \\sqrt{401.2} \\approx 20.0\\,m/s\\checkmark',
          annotation: 'Recovering the magnitude confirms correctness.',
        },
      ],
      conclusion: '$v_x \\approx 16.4\\,m/s$ (horizontal), $v_y \\approx 11.5\\,m/s$ (vertical).',
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'vector-components' },
          title: 'magnitude = 20, angle = 35° — right triangle visible',
          caption: `The right triangle shows $v_x = 20\\cos35° \\approx 16.4$ m/s and $v_y = 20\\sin35° \\approx 11.5$ m/s.`,
        },
      ],
    },
    {
      id: 'ch1-003-ex2',
      title: 'Angle measured from the y-axis',
      problem:
        '\\text{A force has magnitude } 50\\,N \\text{ at } 20° \\textit{ from the vertical } (y\\text{-axis}). \\text{Find } F_x \\text{ and } F_y.',
      steps: [
        {
          expression: '\\theta_{\\text{from}\\,x} = 90° - 20° = 70°',
          annotation:
            '"20° from vertical" means 20° from the $y$-axis. Convert to the standard angle (from $+x$): $90° - 20° = 70°$.',
        },
        {
          expression: 'F_x = 50\\cos70° \\approx 50 \\times 0.342 = 17.1\\,N',
          annotation: 'Use the converted angle.',
        },
        {
          expression: 'F_y = 50\\sin70° \\approx 50 \\times 0.940 = 47.0\\,N',
          annotation: 'Large $y$-component makes sense — the vector is mostly vertical.',
        },
      ],
      conclusion:
        '$F_x \\approx 17.1\\,N$, $F_y \\approx 47.0\\,N$. Always convert non-standard angles before applying the formulas.',
    },
    {
      id: 'ch1-003-ex3',
      title: 'Component to magnitude and angle — Quadrant III',
      problem:
        '\\text{An acceleration vector has components } a_x = -4.0\\,m/s^2,\\; a_y = -3.0\\,m/s^2. \\text{Find the magnitude and direction.}',
      steps: [
        {
          expression: '|\\vec{a}| = \\sqrt{(-4)^2 + (-3)^2} = \\sqrt{16+9} = \\sqrt{25} = 5.0\\,m/s^2',
          annotation: 'The 3-4-5 Pythagorean triple.',
        },
        {
          expression: '\\theta_{\\text{ref}} = \\arctan\\!\\left(\\frac{3}{4}\\right) \\approx 36.9°',
          annotation: 'Reference angle using absolute values.',
        },
        {
          expression:
            'a_x < 0\\;\\text{and}\\;a_y < 0 \\Rightarrow \\text{Quadrant III} \\Rightarrow \\theta = 180° + 36.9° = 216.9°',
          annotation:
            'Both components negative → Quadrant III. Add 180° to the reference angle. Could also be stated as "36.9° south of west" or "$-143.1°$" depending on convention.',
        },
      ],
      conclusion: '$|\\vec{a}| = 5.0\\,m/s^2$ at $\\theta \\approx 217°$ from the positive $x$-axis.',
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-003-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Find the components of a displacement of } 15\\,m \\text{ at } 60°\\text{ above the }+x\\text{-axis.}',
      hint: '$d_x = 15\\cos60°$, $d_y = 15\\sin60°$. Recall $\\cos60° = 0.5$, $\\sin60° = \\sqrt{3}/2$.',
      walkthrough: [
        {
          expression: 'd_x = 15\\cos60° = 15 \\times 0.5 = 7.5\\,m',
          annotation: 'Exact value: $\\cos60° = 1/2$.',
        },
        {
          expression: 'd_y = 15\\sin60° = 15 \\times \\frac{\\sqrt{3}}{2} = \\frac{15\\sqrt{3}}{2} \\approx 12.99\\,m',
          annotation: 'Exact value: $\\sin60° = \\sqrt{3}/2$.',
        },
      ],
      answer: 'd_x = 7.5\\,m,\\quad d_y = \\tfrac{15\\sqrt{3}}{2}\\,m \\approx 13.0\\,m',
    },
    {
      id: 'ch1-003-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A vector has } A_x = 7.0 \\text{ and } A_y = -7.0. \\text{ Find } |\\vec{A}| \\text{ and } \\theta.',
      hint: 'With equal magnitudes and opposite-sign components, what angle do you expect?',
      walkthrough: [
        {
          expression: '|\\vec{A}| = \\sqrt{7^2 + 7^2} = 7\\sqrt{2} \\approx 9.9',
          annotation: 'Both components equal in magnitude.',
        },
        {
          expression: '\\theta_{\\text{ref}} = \\arctan(7/7) = \\arctan(1) = 45°',
          annotation: 'Reference angle is 45°.',
        },
        {
          expression:
            'A_x > 0,\\;A_y < 0 \\Rightarrow \\text{Quadrant IV} \\Rightarrow \\theta = 360° - 45° = 315°',
          annotation: 'Or equivalently $-45°$.',
        },
      ],
      answer: '|\\vec{A}| = 7\\sqrt{2},\\quad \\theta = 315°\\;(-45°)',
    },
    {
      id: 'ch1-003-ch3',
      difficulty: 'hard',
      problem:
        '\\text{A pilot flies at } 200\\,km/h \\text{ on a bearing of N 30° E (30° east of due north). Find the east and north components of velocity.}',
      hint:
        'Bearing N 30° E means 30° measured from north toward east. North is the $+y$ direction. The angle from the $+x$ (east) axis is $90° - 30° = 60°$.',
      walkthrough: [
        {
          expression: '\\theta_{\\text{from east}} = 90° - 30° = 60°',
          annotation: 'Convert bearing to standard angle measured from east ($+x$).',
        },
        {
          expression: 'v_{\\text{east}} = 200\\cos60° = 200 \\times 0.5 = 100\\,km/h',
          annotation: 'East is the $x$-component.',
        },
        {
          expression: 'v_{\\text{north}} = 200\\sin60° = 200 \\times \\frac{\\sqrt{3}}{2} = 100\\sqrt{3} \\approx 173\\,km/h',
          annotation: 'North is the $y$-component.',
        },
        {
          expression:
            '\\text{Check: }\\sqrt{100^2+(100\\sqrt{3})^2} = \\sqrt{10000+30000} = \\sqrt{40000} = 200\\,km/h\\checkmark',
          annotation: 'Magnitude recovered correctly.',
        },
      ],
      answer: 'v_{\\text{east}} = 100\\,km/h,\\quad v_{\\text{north}} = 100\\sqrt{3} \\approx 173\\,km/h',
    },
  ],

  // ── Python Notebook ──────────────────────────────────────────────────────
  python: {
    title: 'Components and Magnitudes in Python',
    description: `NumPy makes vector decomposition and reconstruction one-liners. We will go both ways: magnitude+angle → components, and components → magnitude+angle.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Component Lab — decompose and reconstruct vectors',
        caption: 'Run each cell to see the full round-trip conversion.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1 · Forward: magnitude + angle → components',
              prose: `Given $|\\vec{v}| = 20$ m/s at $\\theta = 35°$ above the horizontal, find $v_x$ and $v_y$.\n\n$v_x = |\\vec{v}|\\cos\\theta$,  $v_y = |\\vec{v}|\\sin\\theta$`,
              code: [
                'import numpy as np',
                '',
                'mag = 20.0      # m/s',
                'theta_deg = 35.0',
                'theta = np.radians(theta_deg)',
                '',
                'vx = mag * np.cos(theta)',
                'vy = mag * np.sin(theta)',
                '',
                'print(f"v_x = {vx:.4f} m/s  (horizontal)")',
                'print(f"v_y = {vy:.4f} m/s  (vertical)")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '2 · Inverse: components → magnitude + angle',
              prose: `Given $v_x = 16.383$ m/s and $v_y = 11.472$ m/s, recover the original magnitude and angle.\n\n$|\\vec{v}| = \\sqrt{v_x^2 + v_y^2}$,  $\\theta = \\text{atan2}(v_y, v_x)$`,
              code: [
                '# Use vx and vy from the previous cell',
                'mag_check = np.linalg.norm([vx, vy])',
                'theta_check = np.degrees(np.arctan2(vy, vx))',
                '',
                'print(f"|v| = {mag_check:.4f} m/s   (should be 20.0)")',
                'print(f"θ   = {theta_check:.4f}°    (should be 35.0)")',
                '',
                '# atan2 handles all four quadrants correctly',
                'print("\\nQuadrant test — vector pointing into Q3:")',
                'ax, ay = -4.0, -3.0',
                'print(f"  |a| = {np.linalg.norm([ax, ay]):.1f}")',
                'print(f"  θ   = {np.degrees(np.arctan2(ay, ax)):.1f}°  (should be ~-143.1° or ~216.9°)")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '3 · Bearing to east/north components',
              prose: `A pilot flies at 200 km/h on bearing N 30° E (30° east of due north).\n\nNorth is $+y$, East is $+x$. The angle from east ($+x$) is $90° - 30° = 60°$.`,
              code: [
                'speed = 200.0   # km/h',
                'bearing = 30.0  # degrees east of north',
                '',
                '# Convert bearing to standard angle from +x (east)',
                'theta_from_east = 90.0 - bearing',
                '',
                'v_east  = speed * np.cos(np.radians(theta_from_east))',
                'v_north = speed * np.sin(np.radians(theta_from_east))',
                '',
                'print(f"East component:  {v_east:.2f} km/h")',
                'print(f"North component: {v_north:.2f} km/h")',
                'print(f"Check magnitude: {np.linalg.norm([v_east, v_north]):.2f} km/h")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: '4 · Challenge: four-quadrant problem',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Components of a Quadrant-IV vector',
              difficulty: 'medium',
              prompt: `A vector has magnitude 13 and points at 315° from $+x$ (Quadrant IV — right and downward). Find $A_x$ and $A_y$, then verify the magnitude round-trips.`,
              starterBlock: [
                'mag_A = ___',
                'theta_A = np.radians(___)',
                'Ax = mag_A * np.___(___)    # cos or sin?',
                'Ay = mag_A * np.___(___)    # cos or sin?',
                'print(f"Ax={Ax:.4f}, Ay={Ay:.4f}")',
                'print(f"|A| check = {np.linalg.norm([Ax, Ay]):.4f}")',
              ].join('\n'),
              code: [
                'mag_A = 13.0',
                'theta_A = np.radians(315.0)',
                'Ax = mag_A * np.cos(theta_A)',
                'Ay = mag_A * np.sin(theta_A)',
                'print(f"Ax = {Ax:.4f}")',
                'print(f"Ay = {Ay:.4f}")',
                'print(f"|A| check = {np.linalg.norm([Ax, Ay]):.4f}  (should be 13)")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "Ax" in dir(), "Define Ax"',
                'assert "Ay" in dir(), "Define Ay"',
                'assert np.isclose(Ax, 13*np.cos(np.radians(315)), atol=0.01), f"Ax wrong, got {Ax:.4f}"',
                'assert np.isclose(Ay, 13*np.sin(np.radians(315)), atol=0.01), f"Ay wrong, got {Ay:.4f}"',
                '"SUCCESS: Ax ≈ 9.192, Ay ≈ -9.192. Quadrant IV: positive x, negative y."',
              ].join('\n'),
              hint: `theta_A = np.radians(315.0). Ax = 13*np.cos(theta_A) ≈ 9.19. Ay = 13*np.sin(theta_A) ≈ -9.19. Quadrant IV has positive x, negative y.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-003-q1',
      question: `A vector has magnitude 10 at $\\theta = 30°$ from $+x$. What is $A_x$?`,
      options: [`$5$`, `$5\\sqrt{3}$`, `$10$`, `$10\\sqrt{3}$`],
      answer: 1,
      explanation: `$A_x = 10\\cos30° = 10 \\times \\frac{\\sqrt{3}}{2} = 5\\sqrt{3} \\approx 8.66$.`,
    },
    {
      id: 'p1-ch1-003-q2',
      question: `A vector has magnitude 10 at $\\theta = 30°$ from $+x$. What is $A_y$?`,
      options: [`$5$`, `$5\\sqrt{3}$`, `$10$`, `$10\\sqrt{2}$`],
      answer: 0,
      explanation: `$A_y = 10\\sin30° = 10 \\times 0.5 = 5$.`,
    },
    {
      id: 'p1-ch1-003-q3',
      question: `A vector has $A_x = 6$ and $A_y = 8$. What is its magnitude?`,
      options: [`$14$`, `$10$`, `$\\sqrt{28}$`, `$100$`],
      answer: 1,
      explanation: `$|\\vec{A}| = \\sqrt{6^2 + 8^2} = \\sqrt{36+64} = \\sqrt{100} = 10$.`,
    },
    {
      id: 'p1-ch1-003-q4',
      question: `A force is described as "50 N, 20° from the vertical." What is $\\theta$ measured from the $+x$-axis?`,
      options: [`$20°$`, `$70°$`, `$160°$`, `$110°$`],
      answer: 1,
      explanation: `"From the vertical" means from the $y$-axis. Convert: $\\theta_{+x} = 90° - 20° = 70°$.`,
    },
    {
      id: 'p1-ch1-003-q5',
      question: `$A_x = -3$ and $A_y = -4$. Which quadrant is $\\vec{A}$ in?`,
      options: [`Quadrant I`, `Quadrant II`, `Quadrant III`, `Quadrant IV`],
      answer: 2,
      explanation: `Both components negative means the vector points into Quadrant III (down-left).`,
    },
    {
      id: 'p1-ch1-003-q6',
      question: `Why should you use $\\text{atan2}(A_y, A_x)$ instead of $\\arctan(A_y/A_x)$ when finding angles?`,
      options: [
        `atan2 is faster to compute`,
        `arctan only returns angles in $(-90°, 90°)$; atan2 gives the correct quadrant`,
        `atan2 works in 3-D only`,
        `They are identical`,
      ],
      answer: 1,
      explanation: `$\\arctan$ cannot distinguish Quadrant I from III, or II from IV. atan2 uses the signs of both components to return the correct angle in $(-180°, 180°]$.`,
    },
    {
      id: 'p1-ch1-003-q7',
      question: `A vector has $A_x = 0$ and $A_y = -5$. What is its direction?`,
      options: [`$90°$`, `$0°$`, `$270°$ (or $-90°$)`, `$180°$`],
      answer: 2,
      explanation: `Zero $x$-component, negative $y$ means the vector points straight down: $270°$ (or $-90°$) from $+x$.`,
    },
    {
      id: 'p1-ch1-003-q8',
      question: `The Pythagorean identity $\\cos^2\\theta + \\sin^2\\theta = 1$ guarantees which fact about components?`,
      options: [
        `$A_x$ always equals $A_y$`,
        `$\\sqrt{A_x^2 + A_y^2} = |\\vec{A}|$ — the magnitude formula is consistent`,
        `Components are always positive`,
        `You can add components without considering angle`,
      ],
      answer: 1,
      explanation: `$A_x^2 + A_y^2 = |\\vec{A}|^2(\\cos^2\\theta + \\sin^2\\theta) = |\\vec{A}|^2$. The identity proves the magnitude formula.`,
    },
  ],
}
