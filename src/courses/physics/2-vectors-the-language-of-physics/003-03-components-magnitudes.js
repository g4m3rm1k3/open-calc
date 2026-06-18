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
    previewVisualizationProps: { type: 'vector-components' },
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
          'A_x = |\\vec{A}|\\cos\\theta,\\quad A_y = |\\vec{A}|\\sin\\theta',
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

  misconceptions: [
    {
      id: 'p1-ch1-003-mis1',
      misconception: `"20° from the vertical" means $\\theta = 20°$ in the component formulas.`,
      why: `Students plug the given angle directly into $A_x = |A|\\cos\\theta$ without converting to the standard reference (counterclockwise from $+x$). A "from vertical" angle is measured from the $y$-axis, not the $x$-axis.`,
      correction: `The component formulas assume $\\theta$ is measured counterclockwise from the positive $x$-axis. "20° from vertical" means $90° - 20° = 70°$ from horizontal. Always draw the vector first and identify the angle from $+x$ before using the formulas.`,
      correctionExample: `"Force of 50 N, 20° from vertical": $\\theta = 70°$ from $+x$. $F_x = 50\\cos70° \\approx 17.1$ N, $F_y = 50\\sin70° \\approx 47.0$ N. (If you used 20°: $F_x = 50\\cos20° \\approx 47$ N — swaps x and y.)`,
    },
    {
      id: 'p1-ch1-003-mis2',
      misconception: `If $A_x = 5$ and $A_y = -5$, the magnitude is $5 - 5 = 0$ (the components cancel).`,
      why: `Students subtract signed components because they "cancel like forces." But components aren't added/subtracted to find magnitude — they're squared and root-summed.`,
      correction: `Magnitude always uses the Pythagorean formula: $|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}$. Squaring removes the sign: $(-5)^2 = 25$. So $|\\vec{A}| = \\sqrt{25+25} = 5\\sqrt{2} \\approx 7.07$, not 0.`,
      correctionExample: `$\\vec{A} = (5, -5)$: the vector points into Quadrant IV (right-downward). Its length is $\\sqrt{50} = 5\\sqrt{2}$ — clearly not zero. The vector points diagonally, it doesn't vanish.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-003-tp1',
      prompt: `In projectile motion, a ball is kicked at speed $v_0$ and launch angle $\\theta$. The horizontal component $v_x = v_0\\cos\\theta$ stays constant throughout the flight (no horizontal force), while the vertical component $v_y = v_0\\sin\\theta$ changes due to gravity. Why does maximizing range require $\\theta = 45°$?`,
      connection: `Range $R = v_x \\cdot t_{flight} = v_0\\cos\\theta \\cdot (2v_0\\sin\\theta/g) = (v_0^2/g)\\sin(2\\theta)$. The sine function peaks at $2\\theta = 90°$, i.e., $\\theta = 45°$. Component decomposition is the essential first step to derive the range formula.`,
    },
    {
      id: 'p1-ch1-003-tp2',
      prompt: `A building inspector measures that a ramp makes an angle of 15° with the horizontal. They need the "rise" (vertical height) and "run" (horizontal distance) of a 10-meter section. How does this use the same decomposition as the physics component formulas?`,
      connection: `Rise $= 10\\sin15° \\approx 2.59$ m; Run $= 10\\cos15° \\approx 9.66$ m. This is exactly $A_y = |\\vec{A}|\\sin\\theta$ and $A_x = |\\vec{A}|\\cos\\theta$ with $|\\vec{A}| = 10$ m and $\\theta = 15°$. Construction, surveying, and architecture all use this same right-triangle decomposition under different names.`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-003-dbg1',
      error: `A student solves: vector 13 m at 315°. They write $A_x = 13\\cos(315°) \\approx 9.19$, $A_y = 13\\sin(315°) \\approx 9.19$. But a check shows $\\sqrt{9.19^2+9.19^2} \\approx 13$, so they accept it.`,
      explanation: `$\\sin(315°) = -\\sin(45°) \\approx -0.707$, so $A_y = 13 \\times (-0.707) \\approx -9.19$ — NEGATIVE. The student made a sign error on $A_y$ but then the magnitude check passed anyway (because squaring removes the sign). A correct sign on $A_y$ is critical for subsequent problems even if the magnitude looks right.`,
      fix: `Always verify the sign of $A_y$ by checking the quadrant: 315° is in Q4 (positive x, negative y). So $A_y$ must be negative: $A_y \\approx -9.19$ m, NOT $+9.19$. The vector points down-right, not up-right.`,
    },
    {
      id: 'p1-ch1-003-dbg2',
      error: `For a Q3 vector with $A_x = -4$, $A_y = -3$, a student computes $\\theta = \\arctan(-3/-4) = \\arctan(0.75) \\approx 36.9°$.`,
      explanation: `$\\arctan(0.75) = 36.9°$ is in Quadrant I. But the vector is in Quadrant III — both components negative. The calculator saw $-3/-4 = +0.75$ (the negatives cancelled) and returned a Q1 angle. Dividing before arctangent loses the individual signs.`,
      fix: `Use $\\text{atan2}(-3, -4)$ to preserve individual signs. It returns $\\approx -143.1°$ (or equivalently $216.9°$), which is correctly in Q3. As a manual check: $\\theta = 180° + \\arctan(3/4) = 180° + 36.9° = 216.9°$.`,
    },
  ],

  mastery: {
    targetLevel: `Decompose any vector into components using $A_x = |A|\\cos\\theta$ and $A_y = |A|\\sin\\theta$; recover magnitude and direction using the Pythagorean formula and atan2; handle non-standard angle references.`,
    checklistItems: [
      `Can compute $A_x$ and $A_y$ from magnitude and standard angle ($\\theta$ from $+x$)`,
      `Can compute magnitude and direction from components, with correct quadrant`,
      `Converts non-standard angles (from vertical, bearings) to the standard reference before using formulas`,
      `Uses atan2 (not arctan) for angles from components — explains why`,
      `Always verifies by round-tripping: $\\sqrt{A_x^2+A_y^2}$ should recover the original magnitude`,
    ],
    commonStruggles: [
      `Plugging "angle from vertical" directly into $\\cos\\theta$ — must convert to "from horizontal" first`,
      `Sign errors on $A_y$ in Q3 and Q4 ($\\sin\\theta$ is negative there)`,
      `Using arctan and getting the wrong quadrant — should use atan2 consistently`,
    ],
    nextSteps: [
      `04-adding-vectors-parallelogram.js — use components to add two vectors`,
      `09-adding-force-vectors.js — apply component decomposition to force analysis`,
      `Physics-1 Ch.3 projectile motion — $v_x$ and $v_y$ are the central tool`,
    ],
  },

  semantics: {
    core: [
      { symbol: `A_x = |\\vec{A}|\\cos\\theta`, meaning: `x-component: how far the vector reaches horizontally; positive = rightward` },
      { symbol: `A_y = |\\vec{A}|\\sin\\theta`, meaning: `y-component: how far the vector reaches vertically; positive = upward` },
      { symbol: `|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}`, meaning: `Magnitude from components: Pythagorean theorem — always non-negative` },
      { symbol: `\\theta = \\text{atan2}(A_y, A_x)`, meaning: `Direction from components: quadrant-safe arctangent, returns angle in $(-180°, 180°]$` },
    ],
    rulesOfThumb: [
      `$\\cos$ gives the x-component (adjacent), $\\sin$ gives the y-component (opposite). SOH-CAH-TOA.`,
      `Always convert angles to "counterclockwise from $+x$" before using the formulas.`,
      `Squaring removes signs — magnitude is ALWAYS positive even with negative components.`,
      `After computing components, verify: $\\sqrt{A_x^2+A_y^2}$ must recover the original magnitude.`,
      `Quadrant guide: Q1(+,+), Q2(−,+), Q3(−,−), Q4(+,−) — check signs before accepting your answer.`,
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Components and Magnitudes in Python',
      cells: [
        {
          cellTitle: 'Forward and inverse: both conversion directions',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# FORWARD: magnitude + angle → components
mag = 20.0      # m/s (ball kicked at 20 m/s)
theta_deg = 35.0
theta = np.radians(theta_deg)   # np.cos/sin require radians

vx = mag * np.cos(theta)   # v_x = |v| cos(theta)
vy = mag * np.sin(theta)   # v_y = |v| sin(theta)
print(f"Forward: {mag} m/s at {theta_deg}°")
print(f"  vx = {vx:.4f} m/s  (horizontal)")
print(f"  vy = {vy:.4f} m/s  (vertical)")

# INVERSE: components → magnitude + angle
mag_check   = np.linalg.norm([vx, vy])           # sqrt(vx^2 + vy^2)
theta_check = np.degrees(np.arctan2(vy, vx))     # atan2(y, x) — quadrant-safe

print(f"\\nInverse round-trip:")
print(f"  |v| = {mag_check:.4f} m/s  (should be {mag})")
print(f"  theta = {theta_check:.4f}°  (should be {theta_deg})")

# Quadrant III test: both components negative
ax, ay = -4.0, -3.0
print(f"\\nQ3 example: ({ax}, {ay})")
print(f"  |a| = {np.linalg.norm([ax, ay]):.2f} m/s²")
print(f"  theta = {np.degrees(np.arctan2(ay, ax)):.1f}°  (should be ~-143.1° / 216.9°)")`,
          prose: [
            `\`np.radians(theta_deg)\` converts degrees to radians — all NumPy trig functions (\`cos\`, \`sin\`) expect radians. The two lines \`vx = mag * np.cos(theta)\` and \`vy = mag * np.sin(theta)\` implement $v_x = |v|\\cos\\theta$ and $v_y = |v|\\sin\\theta$ exactly.`,
            `The inverse direction uses \`np.linalg.norm([vx, vy])\` for $\\sqrt{v_x^2+v_y^2}$ and \`np.arctan2(vy, vx)\` for the angle. The round-trip recovers 20 m/s at 35° — confirming both directions are consistent.`,
            `The Q3 test shows why \`arctan2\` is needed: $(-4, -3)$ gives $\\approx -143.1°$ (same as $216.9°$), correctly in Q3. A naive \`np.arctan(-3/-4) = arctan(0.75) ≈ 36.9°\` would put it in Q1 — completely wrong.`,
          ],
        },
        {
          cellTitle: 'Visualizing the right triangle of components',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

mag, theta_deg = 20.0, 35.0
theta = np.radians(theta_deg)
vx = mag * np.cos(theta)
vy = mag * np.sin(theta)

fig, ax = plt.subplots(figsize=(8, 6))
ax.set_aspect('equal')

# Full vector (blue)
ax.annotate('', xy=(vx, vy), xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='blue', lw=2.5))
ax.text(vx/2 - 1.5, vy/2 + 0.5, f'|v| = {mag} m/s', color='blue', fontsize=12)

# x-component (red, horizontal)
ax.annotate('', xy=(vx, 0), xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='red', lw=2))
ax.text(vx/2, -1.5, f'vx = {vx:.1f} m/s', color='red', ha='center', fontsize=11)

# y-component (green, vertical)
ax.annotate('', xy=(vx, vy), xytext=(vx, 0),
            arrowprops=dict(arrowstyle='->', color='green', lw=2))
ax.text(vx + 0.5, vy/2, f'vy = {vy:.1f} m/s', color='green', fontsize=11)

# Right angle marker at (vx, 0)
sq = 0.6
ax.add_patch(plt.Polygon([[vx, 0], [vx-sq, 0], [vx-sq, sq], [vx, sq]],
                         fill=False, edgecolor='k', lw=1))

# Angle arc
t = np.linspace(0, theta, 30)
ax.plot(2.5*np.cos(t), 2.5*np.sin(t), 'k-', lw=1)
ax.text(3.0, 1.0, f'θ = {theta_deg}°', fontsize=10)

ax.set_xlim(-1, 22); ax.set_ylim(-3, 16)
ax.axhline(0, color='k', lw=0.7); ax.axvline(0, color='k', lw=0.7)
ax.set_xlabel('Horizontal (m/s)'); ax.set_ylabel('Vertical (m/s)')
ax.set_title('Vector = right triangle: hypotenuse is the vector, legs are components')
ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.savefig('component_triangle.png', dpi=120); plt.show()`,
          prose: [
            `The three arrows draw the right triangle: blue (hypotenuse = full vector), red (horizontal leg = $v_x = |v|\\cos\\theta$), green (vertical leg = $v_y = |v|\\sin\\theta$). The small square at $(v_x, 0)$ marks the right angle — confirming the triangle is right-angled.`,
            `The angle arc connects 0° to $\\theta = 35°$ along a circle of radius 2.5. This is the visual proof that $\\theta$ is measured counterclockwise from the $+x$ axis (horizontal). The horizontal and vertical legs are literally the "shadow" of the vector on each axis.`,
            `Try changing \`theta_deg\` to 150°, 210°, or 315° and re-run. You'll see the triangle flip into different quadrants, and $v_x$ or $v_y$ will become negative — matching the quadrant rules.`,
          ],
        },
        {
          cellTitle: 'Non-standard angles: bearings and "from vertical"',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# Problem 1: bearing "N 30° E" (30° east of due north)
# North = +y, East = +x.
# Bearing is measured FROM north TOWARD east.
# Standard angle (from +x/east): theta = 90 - bearing
speed_plane = 200.0
bearing = 30.0
theta_from_east = 90.0 - bearing  # = 60°

v_east  = speed_plane * np.cos(np.radians(theta_from_east))
v_north = speed_plane * np.sin(np.radians(theta_from_east))
print(f"Plane bearing N{bearing}°E at {speed_plane} km/h:")
print(f"  v_east  = {v_east:.2f} km/h")
print(f"  v_north = {v_north:.2f} km/h")
print(f"  Check:   {np.linalg.norm([v_east, v_north]):.2f} km/h")

# Problem 2: "50 N at 20° from the vertical"
# "From vertical" = from y-axis. Convert to from x-axis:
# theta_from_x = 90 - 20 = 70°
F_mag = 50.0
angle_from_vertical = 20.0
theta_from_x = 90.0 - angle_from_vertical  # = 70°

Fx = F_mag * np.cos(np.radians(theta_from_x))
Fy = F_mag * np.sin(np.radians(theta_from_x))
print(f"\\nForce {F_mag} N at {angle_from_vertical}° from vertical:")
print(f"  Fx = {Fx:.2f} N  (small — mostly vertical)")
print(f"  Fy = {Fy:.2f} N  (large — mostly along y)")
print(f"  Check: {np.linalg.norm([Fx, Fy]):.2f} N")`,
          prose: [
            `Bearings are measured clockwise from north, but physics uses counterclockwise from east. The conversion \`theta_from_east = 90 - bearing\` bridges them. For N30°E: $90° - 30° = 60°$ from east. Then standard $v_x = v\\cos(60°)$, $v_y = v\\sin(60°)$ applies.`,
            `"From vertical" is the complement of "from horizontal": $\\theta_{+x} = 90° - \\theta_{vertical}$. With 20° from vertical, the force is mostly vertical ($F_y \\approx 47$ N) and only slightly horizontal ($F_x \\approx 17$ N) — which makes intuitive sense.`,
            `The pattern is always the same: identify the non-standard angle, convert it to "counterclockwise from $+x$", then apply $A_x = |A|\\cos\\theta$ and $A_y = |A|\\sin\\theta$. The formulas never change; only the angle-conversion step varies.`,
          ],
        },
        {
          cellTitle: 'Challenge: decompose a vector and verify the quadrant',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A displacement vector has magnitude 13 m at 315° (Quadrant IV: right and downward)
# 1. Compute Ax and Ay
# 2. Verify the magnitude round-trips to 13 m
# 3. Confirm the signs match Quadrant IV (Ax > 0, Ay < 0)

mag_A = 13.0
theta_A_deg = 315.0

Ax = ___   # mag_A * np.cos(np.radians(theta_A_deg))
Ay = ___   # mag_A * np.sin(np.radians(theta_A_deg))

print(f"Ax = {Ax:.4f} m")
print(f"Ay = {Ay:.4f} m  (should be NEGATIVE for Q4)")
print(f"|A| check = {np.linalg.norm([Ax, Ay]):.4f} m  (should be 13.0)")
print(f"Quadrant IV confirmed: Ax > 0 = {Ax > 0}, Ay < 0 = {Ay < 0}")`,
          prose: [
            `Fill in: \`Ax = mag_A * np.cos(np.radians(theta_A_deg))\` and \`Ay = mag_A * np.sin(np.radians(theta_A_deg))\`. Expected: $A_x \\approx +9.19$, $A_y \\approx -9.19$.`,
            `Q4 check: $315° = 360° - 45°$, so the vector points to the right ($A_x > 0$) and downward ($A_y < 0$). The $\\sin(315°) \\approx -0.707$ gives a negative $A_y$ automatically — no manual sign manipulation needed.`,
            `The magnitude check $\\sqrt{A_x^2 + A_y^2} = \\sqrt{9.19^2 + 9.19^2} = \\sqrt{169} = 13$ must hold. Note: even though $A_y$ is negative, squaring it gives $+84.47 \\approx 9.19^2$ — magnitudes are always positive.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Components and Magnitudes in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'Forward and inverse: both conversion directions',
          type: 'code',
          language: 'matlab',
          code: `% FORWARD: magnitude + angle → components
mag = 20.0;         % m/s
theta_deg = 35.0;
theta = deg2rad(theta_deg);   % cos/sin require radians

vx = mag * cos(theta);   % v_x = |v| cos(theta)
vy = mag * sin(theta);   % v_y = |v| sin(theta)
fprintf('Forward: %.0f m/s at %.0f deg\\n', mag, theta_deg);
fprintf('  vx = %.4f m/s  (horizontal)\\n', vx);
fprintf('  vy = %.4f m/s  (vertical)\\n', vy);

% INVERSE: components → magnitude + angle
mag_check   = norm([vx, vy]);                 % sqrt(vx^2 + vy^2)
theta_check = rad2deg(atan2(vy, vx));         % atan2(y, x) — quadrant-safe

fprintf('\\nInverse round-trip:\\n');
fprintf('  |v| = %.4f m/s  (should be %.1f)\\n', mag_check, mag);
fprintf('  theta = %.4f deg  (should be %.1f)\\n', theta_check, theta_deg);

% Quadrant III test: both components negative
ax = -4.0; ay = -3.0;
fprintf('\\nQ3 example: (%g, %g)\\n', ax, ay);
fprintf('  |a| = %.2f m/s^2\\n', norm([ax, ay]));
fprintf('  theta = %.1f deg  (Q3 should be around -143 or 217)\\n', rad2deg(atan2(ay, ax)));`,
          prose: [
            `\`deg2rad(theta_deg)\` converts degrees to radians for MATLAB's \`cos\` and \`sin\`. The two formulas \`vx = mag * cos(theta)\` and \`vy = mag * sin(theta)\` are identical in form to the Python version — same physics, same math.`,
            `The inverse uses \`norm([vx, vy])\` for magnitude and \`atan2(vy, vx)\` for direction. In MATLAB/Octave, \`atan2(y, x)\` takes y first, just like Python's \`arctan2\`. The round-trip should recover 20 m/s at 35° exactly.`,
            `The Q3 test: \`atan2(-3, -4)\` returns $\\approx -2.498$ rad $\\approx -143.1°$ — correctly in Q3. MATLAB's \`atan\` (single-argument) would return \`atan(0.75) = 0.6435\` rad $= 36.9°$ — Q1, which is wrong.`,
          ],
        },
        {
          cellTitle: 'Visualizing the right triangle of components',
          type: 'code',
          language: 'matlab',
          code: `mag = 20.0; theta_deg = 35.0;
theta = deg2rad(theta_deg);
vx = mag * cos(theta);
vy = mag * sin(theta);

figure; hold on; axis equal;
xlim([-1, 22]); ylim([-3, 16]);

% Full vector (blue)
quiver(0, 0, vx, vy, 'b', 'LineWidth', 2.5, 'MaxHeadSize', 0.3, 'DisplayName', sprintf('|v|=%.0f', mag));

% x-component (red)
quiver(0, 0, vx, 0, 'r', 'LineWidth', 2, 'MaxHeadSize', 0.3, 'DisplayName', sprintf('vx=%.1f', vx));

% y-component (green), starting at end of x-component
quiver(vx, 0, 0, vy, 'g', 'LineWidth', 2, 'MaxHeadSize', 0.3, 'DisplayName', sprintf('vy=%.1f', vy));

% Right angle marker at (vx, 0)
sq = 0.6;
patch([vx, vx-sq, vx-sq, vx], [0, 0, sq, sq], 'w', 'EdgeColor', 'k', 'LineWidth', 1);

% Angle arc
t = linspace(0, theta, 30);
plot(2.5*cos(t), 2.5*sin(t), 'k-', 'LineWidth', 1);
text(3.2, 1.0, sprintf('\\theta = %.0f\\circ', theta_deg), 'FontSize', 10);

xline(0, 'k-', 'LineWidth', 0.7); yline(0, 'k-', 'LineWidth', 0.7);
xlabel('Horizontal (m/s)'); ylabel('Vertical (m/s)');
title('Component right triangle: hypotenuse = vector, legs = components');
legend('Location', 'northwest'); grid on;`,
          prose: [
            `Three \`quiver\` calls draw the hypotenuse (blue, full vector), horizontal leg (red, x-component), and vertical leg (green, y-component). The \`patch\` command draws the right-angle box at the corner where the two legs meet.`,
            `The parametric angle arc \`plot(2.5*cos(t), 2.5*sin(t))\` draws a circular arc from 0 to $\\theta$ — marking the angle between the $+x$ axis and the vector. The radius 2.5 is chosen to be clearly visible without overlapping.`,
            `Try changing \`theta_deg\` to 150° or 210°. The triangle will flip: with 150°, $v_x < 0$ (horizontal leg goes left); with 210°, both $v_x < 0$ and $v_y < 0$ (triangle in Q3). The same formulas handle all quadrants.`,
          ],
        },
        {
          cellTitle: 'Non-standard angles: bearings and "from vertical"',
          type: 'code',
          language: 'matlab',
          code: `% Problem 1: bearing N 30° E (30° east of due north)
% North = +y, East = +x. bearing measured FROM north TOWARD east.
% Convert: theta_from_east = 90 - bearing
speed_plane = 200.0;   % km/h
bearing = 30.0;
theta_from_east = 90.0 - bearing;  % = 60 deg

v_east  = speed_plane * cos(deg2rad(theta_from_east));
v_north = speed_plane * sin(deg2rad(theta_from_east));
fprintf('Plane bearing N%.0fE at %.0f km/h:\\n', bearing, speed_plane);
fprintf('  v_east  = %.2f km/h\\n', v_east);
fprintf('  v_north = %.2f km/h\\n', v_north);
fprintf('  Check:   %.2f km/h\\n', norm([v_east, v_north]));

% Problem 2: "50 N at 20° from the vertical"
% "From vertical" = from y-axis. theta_from_x = 90 - angle_from_vertical
F_mag = 50.0;
angle_from_vertical = 20.0;
theta_from_x = 90.0 - angle_from_vertical;  % = 70 deg

Fx = F_mag * cos(deg2rad(theta_from_x));
Fy = F_mag * sin(deg2rad(theta_from_x));
fprintf('\\nForce %.0f N at %.0f deg from vertical:\\n', F_mag, angle_from_vertical);
fprintf('  Fx = %.2f N  (small — mostly vertical force)\\n', Fx);
fprintf('  Fy = %.2f N  (large — mostly along y)\\n', Fy);
fprintf('  Check: %.2f N\\n', norm([Fx, Fy]));`,
          prose: [
            `The bearing conversion \`theta_from_east = 90 - bearing\` works because compass bearings run clockwise from north, while physics angles run counterclockwise from east. These two systems are complementary (add to 90°).`,
            `The "from vertical" conversion: \`theta_from_x = 90 - angle_from_vertical\`. Think of it geometrically: if you rotate 20° away from the vertical (y-axis) toward horizontal, you end up 70° from horizontal (x-axis).`,
            `Both conversions follow the same logic: identify which reference axis the given angle is measured from, then use $\\theta_{from-x} = 90° - \\theta_{from-y}$. After conversion, $A_x = |A|\\cos\\theta_{from-x}$ and $A_y = |A|\\sin\\theta_{from-x}$ apply unchanged.`,
          ],
        },
        {
          cellTitle: 'Challenge: decompose a Q4 vector and verify signs',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Displacement vector: 13 m at 315° (Quadrant IV: right and downward)
mag_A = 13.0;
theta_A_deg = 315.0;

Ax = ___;   % mag_A * cos(deg2rad(theta_A_deg))
Ay = ___;   % mag_A * sin(deg2rad(theta_A_deg))

fprintf('Ax = %.4f m\\n', Ax);
fprintf('Ay = %.4f m  (should be NEGATIVE for Q4)\\n', Ay);
fprintf('|A| check = %.4f m  (should be 13.0)\\n', norm([Ax, Ay]));
fprintf('Q4 confirmed: Ax > 0 = %d, Ay < 0 = %d\\n', Ax > 0, Ay < 0);`,
          prose: [
            `Fill in: \`Ax = mag_A * cos(deg2rad(theta_A_deg))\` and \`Ay = mag_A * sin(deg2rad(theta_A_deg))\`. \`deg2rad\` converts 315° to radians. Expected: $A_x \\approx +9.19$, $A_y \\approx -9.19$.`,
            `$\\sin(315°) = -\\sin(45°) \\approx -0.707$, so $A_y < 0$ automatically from the formula. Q4 (positive x, negative y) is confirmed without any manual sign adjustments — the trig functions handle the signs.`,
            `The magnitude check \`norm([Ax, Ay]) = sqrt(9.19^2 + 9.19^2) = 13.0\` verifies correctness. In MATLAB, \`Ax > 0\` returns 1 (true) and \`Ay < 0\` returns 1 (true) — both confirming Q4.`,
          ],
        },
      ],
    },
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-003-q1',
      type: 'choice',
      question: `A vector has magnitude 10 at $\\theta = 30°$ from $+x$. What is $A_x$?`,
      options: [`$5$`, `$5\\sqrt{3}$`, `$10$`, `$10\\sqrt{3}$`],
      answer: `$5\\sqrt{3}$`,
      hints: [`$A_x = |A|\\cos\\theta = 10\\cos30°$.`, `$\\cos30° = \\sqrt{3}/2$, so $A_x = 5\\sqrt{3} \\approx 8.66$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-003-q2',
      type: 'choice',
      question: `A vector has magnitude 10 at $\\theta = 30°$ from $+x$. What is $A_y$?`,
      options: [`$5$`, `$5\\sqrt{3}$`, `$10$`, `$10\\sqrt{2}$`],
      answer: `$5$`,
      hints: [`$A_y = |A|\\sin\\theta = 10\\sin30°$.`, `$\\sin30° = 1/2$, so $A_y = 5$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-003-q3',
      type: 'choice',
      question: `A vector has $A_x = 6$ and $A_y = 8$. What is its magnitude?`,
      options: [`$14$`, `$10$`, `$\\sqrt{28}$`, `$100$`],
      answer: `$10$`,
      hints: [`$|A| = \\sqrt{A_x^2+A_y^2}$.`, `$\\sqrt{36+64} = \\sqrt{100} = 10$. The 6-8-10 triangle (double of 3-4-5).`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-003-q4',
      type: 'choice',
      question: `A force is "50 N, 20° from the vertical." What is $\\theta$ measured from the $+x$-axis?`,
      options: [`$20°$`, `$70°$`, `$160°$`, `$110°$`],
      answer: `$70°$`,
      hints: [`"From vertical" means from the $y$-axis.`, `Convert: $\\theta_{+x} = 90° - 20° = 70°$. A nearly-vertical force corresponds to a large angle from horizontal.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-003-q5',
      type: 'choice',
      question: `$A_x = -3$ and $A_y = -4$. Which quadrant is $\\vec{A}$ in?`,
      options: [`Quadrant I`, `Quadrant II`, `Quadrant III`, `Quadrant IV`],
      answer: `Quadrant III`,
      hints: [`Both components negative: the vector points left (−x) AND down (−y).`, `Q3 is the down-left quadrant: negative x, negative y.`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-003-q6',
      type: 'choice',
      question: `Why use $\\text{atan2}(A_y, A_x)$ instead of $\\arctan(A_y/A_x)$?`,
      options: [
        `atan2 is faster to compute`,
        `arctan only returns angles in $(-90°, 90°)$; atan2 handles all four quadrants`,
        `atan2 works in 3D only`,
        `They are identical for all inputs`,
      ],
      answer: `arctan only returns angles in $(-90°, 90°)$; atan2 handles all four quadrants`,
      hints: [`Dividing $A_y/A_x$ loses sign information when both are negative (Q3) or when $A_x < 0$ (Q2 vs Q3).`, `\`atan2\` uses BOTH signs separately to return the angle in $(-180°, 180°]$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-003-q7',
      type: 'choice',
      question: `A vector has $A_x = 0$ and $A_y = -5$. What is its direction?`,
      options: [`$90°$`, `$0°$`, `$270°$ (or $-90°$)`, `$180°$`],
      answer: `$270°$ (or $-90°$)`,
      hints: [`Zero x-component, negative y: the vector points straight downward.`, `$\\text{atan2}(-5, 0) = -90°$, equivalent to $270°$ measured CCW from $+x$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-003-q8',
      type: 'choice',
      question: `The identity $\\cos^2\\theta + \\sin^2\\theta = 1$ proves which fact about vector components?`,
      options: [
        `$A_x$ always equals $A_y$`,
        `$\\sqrt{A_x^2 + A_y^2} = |\\vec{A}|$ — the magnitude formula is self-consistent`,
        `Components are always positive`,
        `You can add components without considering angle`,
      ],
      answer: `$\\sqrt{A_x^2 + A_y^2} = |\\vec{A}|$ — the magnitude formula is self-consistent`,
      hints: [`$A_x^2 + A_y^2 = |A|^2\\cos^2\\theta + |A|^2\\sin^2\\theta = |A|^2(\\cos^2\\theta+\\sin^2\\theta)$.`, `Since $\\cos^2+\\sin^2=1$, the sum equals $|A|^2$, confirming the magnitude formula.`],
      reviewSection: 'rigor',
    },
    {
      id: 'p1-ch1-003-q9',
      type: 'choice',
      question: `A pilot flies on bearing N 45° E. The standard physics angle (CCW from east) is:`,
      options: [`$45°$`, `$135°$`, `$45°$`, `$315°$`],
      answer: `$45°$`,
      hints: [`Bearing N 45° E means 45° east of north.`, `Convert: $\\theta_{from-east} = 90° - 45° = 45°$. Northeast is 45° CCW from east — same in both systems.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-003-q10',
      type: 'choice',
      question: `$\\vec{A} = (7, -7)$. What is its direction angle (from $+x$)?`,
      options: [`$-45°$ (or $315°$)`, `$45°$`, `$135°$`, `$225°$`],
      answer: `$-45°$ (or $315°$)`,
      hints: [`$A_x > 0$ and $A_y < 0$ puts the vector in Quadrant IV.`, `$\\text{atan2}(-7, 7) = -45°$. Q4 angles are negative (or equivalently $360° - 45° = 315°$).`],
      reviewSection: 'math',
    },
  ],
}
