export default {

  // ── Identity ─────────────────────────────────────────────────────────────
  id: 'ch1-003',
  slug: 'components-and-magnitudes',
  chapter: 1,
  order: 3,
  title: 'Components and Magnitudes',
  subtitle: 'How to pull a vector apart — and put it back together.',
  tags: ['components', 'magnitude', 'decomposition', 'Pythagorean theorem', 'trig'],
  aliases: 'vector components finding components horizontal vertical resolve',

  // ── Hook ─────────────────────────────────────────────────────────────────
  hook: {
    question:
      'A ball is kicked at 20 m/s at 35° above the ground. ' +
      'How fast is it moving horizontally? How fast vertically? ' +
      'You cannot answer either question without decomposing the vector.',
    realWorldContext:
      'Every projectile problem, every incline problem, every force analysis in physics ' +
      'begins with the same move: split the vector into horizontal and vertical pieces. ' +
      'Components are the fundamental tool of applied physics.',
    previewVisualizationId: 'ComponentDecomposerLive',
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
      'Picture walking from one corner of a city block to the diagonally opposite corner. ' +
        'You cannot walk diagonally — the buildings are in the way. ' +
        'Instead you walk some distance east, then some distance north. ' +
        'Those two legs — the "east part" and the "north part" — are the *components* of your displacement.',
      'Every vector in 2-D has exactly two components: the amount it reaches along $x$ and ' +
        'the amount it reaches along $y$. The original vector is the hypotenuse; ' +
        'the components are the two legs of a right triangle.',
      'To find the components you need exactly one tool: trigonometry. ' +
        'The angle $\\theta$ (measured from the positive $x$-axis) and the magnitude $|\\vec{A}|$ ' +
        'are all the ingredients you need.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Components of a vector',
        body:
          'For $\\vec{A}$ with magnitude $|\\vec{A}|$ at angle $\\theta$ from $+x$: ' +
          'A_x = |\\vec{A}|\\cos\\theta,\\quad A_y = |\\vec{A}|\\sin\\theta.',
      },
      {
        type: 'insight',
        title: 'The right-triangle picture',
        body:
          'Draw $\\vec{A}$. Drop a perpendicular to the $x$-axis. ' +
          'The hypotenuse is $|\\vec{A}|$, the adjacent leg is $A_x$, the opposite leg is $A_y$. ' +
          'SOH-CAH-TOA does the rest.',
      },
    ],
    visualizations: [
      {
        // Pillar 1
        id: 'ComponentDecomposerLive',
        title: 'Drag the vector — watch the right triangle appear',
        mathBridge:
          'As you drag the arrowhead, the $x$- and $y$-components update live. ' +
          'The right triangle highlights the geometric meaning of $\\cos\\theta$ and $\\sin\\theta$.',
        caption: 'Components are just shadows: $A_x$ is the shadow on the $x$-axis, $A_y$ on the $y$-axis.',
        props: { showRightTriangle: true, showLabels: true },
      },
    ],
  },

  // ── Math ──────────────────────────────────────────────────────────────────
  math: {
    prose: [
      'The two formulas for components come directly from the definitions of sine and cosine. ' +
        'Here is the complete two-way conversion table:',
      'A critical skill is recognising which angle to use. ' +
        'The formulas $A_x = |\\vec{A}|\\cos\\theta$ and $A_y = |\\vec{A}|\\sin\\theta$ ' +
        'assume $\\theta$ is measured **counterclockwise from the positive $x$-axis**. ' +
        'If a problem gives you an angle measured from a different reference (e.g. from the $y$-axis, ' +
        'or "below the horizontal"), convert to the standard angle first.',
      'When recovering the angle from components, always sketch the vector to confirm the quadrant. ' +
        'A calculator\'s $\\arctan$ only covers $(-90°, 90°)$, so you must manually ' +
        'apply quadrant corrections.',
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
          '|\\vec{A}| = \\sqrt{A_x^2 + A_y^2} \\qquad ' +
          '\\theta = \\operatorname{atan2}(A_y,\\, A_x)',
      },
      {
        type: 'definition',
        title: 'atan2 — the quadrant-aware arctangent',
        body:
          '\\operatorname{atan2}(y, x) \\text{ returns the angle in } (-180°, 180°] ' +
          '\\text{ by checking the signs of both arguments. Use this instead of plain } \\arctan ' +
          '\\text{ whenever components can be negative.}',
      },
      {
        type: 'warning',
        title: 'Angle reference point matters',
        body:
          'If a problem states "30° above the horizontal", $\\theta = 30°$ in the standard formulas. ' +
          'If it states "30° from the vertical", $\\theta = 60°$ from the horizontal. ' +
          'Always convert to "from the positive $x$-axis, counterclockwise" before plugging in.',
      },
    ],
    visualizations: [
      {
        // Pillar 4
        id: 'ComponentConversionExplorer',
        title: 'Forward and inverse conversion — two sliders, four numbers',
        mathBridge:
          'Left panel: set $|\\vec{A}|$ and $\\theta$, read off $A_x$ and $A_y$. ' +
          'Right panel: set $A_x$ and $A_y$, read off $|\\vec{A}|$ and $\\theta$. ' +
          'Change one panel and watch the other update.',
        caption: 'Build fluency with both directions of the conversion.',
        props: { showQuadrantHighlight: true },
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The component formulas are consequences of the definitions of sine and cosine on the unit circle. ' +
        'Here we derive them from first principles so the formulas are no longer "things to memorise" ' +
        'but things you could re-derive on the spot.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The unit circle is the bridge',
        body:
          'Place a unit vector at angle $\\theta$. Its tip lands at $(\\cos\\theta, \\sin\\theta)$ by definition. ' +
          'Scaling by $|\\vec{A}|$ gives $(|\\vec{A}|\\cos\\theta,\\; |\\vec{A}|\\sin\\theta)$ — those are the components.',
      },
    ],
    visualizationId: 'ComponentDerivationProof',
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
        id: 'ComponentDerivationProof',
        title: 'Unit circle → component formulas, step by step',
        mathBridge: 'Each proof step is animated on the unit circle. The geometry makes the algebra inevitable.',
        caption: 'Every component formula is just $\\cos$ or $\\sin$ scaled by the magnitude.',
      },
    ],
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-003-ex1',
      title: 'Decomposing a velocity vector',
      problem:
        '\\text{A ball is launched at } |\\vec{v}| = 20\\,m/s \\text{ at } \\theta = 35° ' +
        '\\text{ above the horizontal. Find the horizontal and vertical components.}',
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
          id: 'ComponentDecomposerLive',
          title: 'Set magnitude = 20, angle = 35° and read off the components',
          caption: 'The right triangle makes the result visible.',
          props: { lockedMagnitude: 20, lockedAngle: 35 },
        },
      ],
    },
    {
      id: 'ch1-003-ex2',
      title: 'Angle measured from the y-axis',
      problem:
        '\\text{A force has magnitude } 50\\,N \\text{ at } 20° \\textit{ from the vertical } (y\\text{-axis}). ' +
        '\\text{Find } F_x \\text{ and } F_y.',
      steps: [
        {
          expression: '\\theta_{\\text{from}\\,x} = 90° - 20° = 70°',
          annotation:
            '"20° from vertical" means 20° from the $y$-axis. ' +
            'Convert to the standard angle (from $+x$): $90° - 20° = 70°$.',
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
        '$F_x \\approx 17.1\\,N$, $F_y \\approx 47.0\\,N$. ' +
        'Always convert non-standard angles before applying the formulas.',
    },
    {
      id: 'ch1-003-ex3',
      title: 'Component to magnitude and angle — Quadrant III',
      problem:
        '\\text{An acceleration vector has components } a_x = -4.0\\,m/s^2,\\; a_y = -3.0\\,m/s^2. ' +
        '\\text{Find the magnitude and direction.}',
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
            'Both components negative → Quadrant III. Add 180° to the reference angle. ' +
            'Could also be stated as "36.9° south of west" or "$-143.1°$" depending on convention.',
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
        '\\text{A pilot flies at } 200\\,km/h \\text{ on a bearing of N 30° E ' +
        '(30° east of due north). Find the east and north components of velocity.}',
      hint:
        'Bearing N 30° E means 30° measured from north toward east. ' +
        'North is the $+y$ direction. The angle from the $+x$ (east) axis is $90° - 30° = 60°$.',
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

  // ── Pillar 3 — Pattern recognition ───────────────────────────────────────
  patternViz: {
    id: 'ComponentPatternSpotter',
    placement: 'math',
    title: 'Spot the right formula — 8 scenarios',
    mathBridge:
      'Each scenario gives you an angle reference — identify whether you need $\\cos$ or $\\sin$ ' +
      'for the horizontal component, and whether any angle conversion is needed.',
    caption:
      'The most common error in vector problems is using $\\sin$ when you need $\\cos$ and vice versa. ' +
      'Drill this until it is reflexive.',
    prerequisiteRecaps: [
      {
        concept: 'SOH-CAH-TOA',
        summary:
          '$\\sin = \\text{opp}/\\text{hyp}$, $\\cos = \\text{adj}/\\text{hyp}$. ' +
          'The adjacent side is always the horizontal leg when $\\theta$ is from $+x$.',
        lessonSlug: null,
      },
    ],
    props: {
      rounds: [
        {
          scenario: '|\\vec{v}| = 10\\,m/s\\text{ at }30°\\text{ from }+x',
          question: 'What is $v_x$?',
          answer: '10\\cos30°',
          trap: '10\\sin30°',
        },
        {
          scenario: '|\\vec{F}| = 20\\,N\\text{ at }50°\\text{ above horizontal}',
          question: 'What is $F_y$?',
          answer: '20\\sin50°',
          trap: '20\\cos50°',
        },
        {
          scenario: '|\\vec{d}| = 5\\,m\\text{ at }40°\\text{ from the vertical}',
          question: 'What is $d_x$? (First convert angle.)',
          answer: '5\\cos50°\\text{ (angle from }+x\\text{ is }90°-40°=50°)',
          trap: '5\\cos40°',
        },
        {
          scenario: 'A_x = 6,\\;A_y = 8',
          question: 'What is $|\\vec{A}|$?',
          answer: '\\sqrt{36+64}=10',
          trap: '6+8=14',
        },
      ],
    },
  },

  // ── Pillar 5 — Exhaustive forms ───────────────────────────────────────────
  recognitionViz: {
    id: 'ComponentFormRecogniser',
    placement: 'examples_end',
    title: 'Every form of the component problem — recognition drill',
    mathBridge: 'Vectors appear with different angle conventions. Recognise and handle each.',
    caption:
      'After this drill you should handle any angle specification without hesitation.',
    prerequisiteRecaps: [
      {
        concept: 'Vector notation',
        summary: '$\\vec{A}$, $(A_x, A_y)$, $A_x\\hat{i}+A_y\\hat{j}$ — all the same object.',
        lessonSlug: 'vector-notation',
      },
      {
        concept: 'What is a vector?',
        summary: 'Magnitude and direction.',
        lessonSlug: 'what-is-a-vector',
      },
    ],
    props: {
      forms: [
        {
          form: 'Standard angle from $+x$',
          given: '|\\vec{A}|,\\;\\theta_{+x}',
          horizontal: '|\\vec{A}|\\cos\\theta_{+x}',
          vertical: '|\\vec{A}|\\sin\\theta_{+x}',
          notes: 'The default convention. No conversion needed.',
        },
        {
          form: 'Angle from $+y$ (from vertical / from north)',
          given: '|\\vec{A}|,\\;\\phi_{+y}',
          horizontal: '|\\vec{A}|\\sin\\phi_{+y}',
          vertical: '|\\vec{A}|\\cos\\phi_{+y}',
          notes: 'sin and cos swap because the reference axis has rotated 90°.',
        },
        {
          form: 'Angle below the $+x$-axis (negative $y$-side)',
          given: '|\\vec{A}|,\\;\\alpha\\text{ below }+x',
          horizontal: '|\\vec{A}|\\cos\\alpha',
          vertical: '-|\\vec{A}|\\sin\\alpha',
          notes: '$y$-component is negative because the vector points downward.',
        },
        {
          form: 'Given two components',
          given: 'A_x,\\;A_y',
          horizontal: 'A_x\\text{ (already done)}',
          vertical: 'A_y\\text{ (already done)}',
          notes: 'Use $\\sqrt{A_x^2+A_y^2}$ for magnitude; atan2$(A_y, A_x)$ for angle.',
        },
        {
          form: 'Compass bearing N $\\alpha$° E',
          given: '|\\vec{A}|,\\;\\alpha',
          horizontal: '|\\vec{A}|\\sin\\alpha\\quad(\\text{east component})',
          vertical: '|\\vec{A}|\\cos\\alpha\\quad(\\text{north component})',
          notes: 'Bearing is from north; east = sin, north = cos.',
        },
      ],
    },
  },
}
