export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'ch1-001',
  slug: 'what-is-a-vector',
  chapter: 1,
  order: 1,
  title: 'What Is a Vector?',
  subtitle: 'The first tool of physics: quantities that carry both size and direction.',
  tags: ['vector', 'scalar', 'magnitude', 'direction', 'arrow notation'],
  aliases: 'vectors intro displacement velocity force directed quantity',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: 'Your GPS says you are 5 miles from home. Is that enough to get you there?',
    realWorldContext:
      'Speed tells you how fast. Velocity tells you fast AND which way. ' +
      'Force tells you how hard AND which direction to push. ' +
      'Almost every interesting quantity in physics needs both a size and a direction — ' +
      'and that is exactly what a vector is.',
    previewVisualizationId: 'VectorArrowIntuition',
  },

  // ── YouTube — series introduction ───────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (1 of 21) What Is A Vector?',
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition', // render alongside the intuition section
    },
    {
      title: 'Physics 1 – Vectors (2 of 21) Vector Notation',
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ─────────────────────────────────────────────────────────
  intuition: {
    prose: [
      'Imagine giving someone directions. Saying "walk 3 blocks" is useless — ' +
        'walk 3 blocks *which way*? To be useful you need to say "walk 3 blocks north". ' +
        'That combination — a size (3 blocks) plus a direction (north) — is a vector.',
      'A **scalar** is just a number with a unit: temperature $72°F$, mass $5\\,kg$, ' +
        'time $10\\,s$. It has size only. A **vector** adds an arrow: ' +
        'displacement $\\vec{d} = 5\\,m\\text{ east}$, velocity $\\vec{v} = 30\\,m/s\\text{ at }45°$, ' +
        'force $\\vec{F} = 20\\,N\\text{ upward}$.',
      'Visually, we draw a vector as an arrow. The **length** of the arrow encodes the magnitude; ' +
        'the **direction** the arrow points encodes the direction. ' +
        'Two arrows that are the same length and point the same way are equal vectors, ' +
        'regardless of where they are drawn on the page.',
      'This last point is powerful: a vector is a pure mathematical object — it has no fixed location. ' +
        'You can slide an arrow anywhere and it remains the same vector. ' +
        'This is called the *free vector* convention and it underpins vector addition.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Vector',
        body: 'A quantity with both magnitude and direction. Written $\\vec{A}$ or in bold $\\mathbf{A}$.',
      },
      {
        type: 'definition',
        title: 'Scalar',
        body: 'A quantity with magnitude only. Examples: mass $m$, time $t$, temperature $T$, speed $v$.',
      },
      {
        type: 'insight',
        title: 'The free-vector rule',
        body:
          'You may translate (slide) a vector arrow anywhere in space without changing the vector. ' +
          'Position does not matter — only length and direction do.',
      },
    ],
    visualizations: [
      {
        // Pillar 1 — Intuition viz
        id: 'VectorArrowIntuition',
        title: 'Drag the arrow — feel magnitude and direction',
        mathBridge:
          'The arrow length represents magnitude $|\\vec{A}|$; ' +
          'the angle it makes with the positive $x$-axis is the direction $\\theta$.',
        caption:
          'Click and drag the arrowhead. Watch magnitude and angle update live. ' +
          'Then drag the tail — notice the vector does not change (free vector rule).',
        props: { interactive: true, showComponents: false },
      },
    ],
  },

  // ── Math ────────────────────────────────────────────────────────────────
  math: {
    prose: [
      'We can describe any 2-D vector $\\vec{A}$ completely in two equivalent ways.',
      '**Magnitude–angle form:** give $|\\vec{A}|$ (a positive number) and $\\theta$ ' +
        '(the angle from the positive $x$-axis, measured counterclockwise). ' +
        'This is the most natural form when you have a physical picture.',
      '**Component form:** resolve $\\vec{A}$ into its horizontal and vertical parts ' +
        'using trigonometry: $A_x = |\\vec{A}|\\cos\\theta$ and $A_y = |\\vec{A}|\\sin\\theta$. ' +
        'Then write $\\vec{A} = A_x\\,\\hat{i} + A_y\\,\\hat{j}$, ' +
        'where $\\hat{i}$ and $\\hat{j}$ are unit vectors pointing along $+x$ and $+y$.',
      'Going the other way — recovering magnitude and angle from components — uses ' +
        'the Pythagorean theorem and the inverse tangent:',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Magnitude from components',
        body: '|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}',
      },
      {
        type: 'theorem',
        title: 'Direction from components',
        body: '\\theta = \\arctan\\!\\left(\\frac{A_y}{A_x}\\right) \\quad (\\text{check quadrant!})',
      },
      {
        type: 'warning',
        title: 'Quadrant trap',
        body:
          'Most calculators return $\\arctan$ in the range $(-90°,\\,90°)$. ' +
          'If $A_x < 0$, add $180°$. If $A_x > 0$ and $A_y < 0$, add $360°$ (or leave negative). ' +
          'Always sketch the vector to confirm the quadrant.',
      },
      {
        type: 'mnemonic',
        title: 'SOH-CAH-TOA stays home',
        body:
          '$\\sin\\theta = A_y/|\\vec{A}|$ (Opposite over Hypotenuse), ' +
          '$\\cos\\theta = A_x/|\\vec{A}|$ (Adjacent over Hypotenuse).',
      },
    ],
    visualizations: [
      {
        // Pillar 4 — Component decomposition
        id: 'VectorComponentDecomposer',
        title: 'From arrow to components — and back',
        mathBridge:
          'Drag the vector. Watch $A_x$, $A_y$, $|\\vec{A}|$, and $\\theta$ update. ' +
          'Toggle "show trig" to see the right triangle that produces the components.',
        caption: 'Every vector hides a right triangle. Components are just the legs.',
        props: { showTrigOverlay: true, showUnitVectors: true },
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      'Formally, a vector is an element of a *vector space* — a mathematical structure ' +
        'that supports two operations: addition of vectors and scalar multiplication. ' +
        'For now, $\\mathbb{R}^2$ (pairs of real numbers) and $\\mathbb{R}^3$ ' +
        '(triples) are all we need.',
      'The notation $\\vec{A} = (A_x,\\, A_y)$ means the ordered pair. ' +
        'Two vectors are equal if and only if every corresponding component is equal: ' +
        '$(A_x, A_y) = (B_x, B_y) \\iff A_x = B_x \\text{ and } A_y = B_y$.',
      'The **zero vector** $\\vec{0} = (0, 0)$ has magnitude zero and, importantly, ' +
        'no defined direction — this is a special case that trips up many students.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Formal equality of vectors',
        body:
          '\\vec{A} = \\vec{B} \\iff A_x = B_x \\text{ and } A_y = B_y ' +
          '\\quad (\\text{position in space is irrelevant})',
      },
      {
        type: 'warning',
        title: 'The zero vector has no direction',
        body:
          '$|\\vec{0}| = 0$ and $\\theta$ is undefined. ' +
          'Writing $\\theta = 0°$ for the zero vector is an error.',
      },
      {
        type: 'insight',
        title: 'Why components beat angles for calculation',
        body:
          'Magnitude–angle form is intuitive but algebraically awkward. ' +
          'Component form reduces every vector operation (addition, dot product, cross product) ' +
          'to ordinary arithmetic. The entire machinery of linear algebra is built on components.',
      },
    ],
    visualizationId: 'VectorEqualityProof',
    proofSteps: [
      {
        title: "Define both vectors",
        expression: "\\vec{A} = (A_x, A_y), \\quad \\vec{B} = (B_x, B_y)",
        annotation: "Write each vector as an ordered pair of components. Position on the page is irrelevant.",
      },
      {
        title: "Assert equality",
        expression: "\\vec{A} = \\vec{B}",
        annotation: "We want to know what 'equal' actually means. Start by assuming it and unpacking the consequences.",
      },
      {
        title: "Expand in basis vectors",
        expression: "A_x\\hat{i} + A_y\\hat{j} = B_x\\hat{i} + B_y\\hat{j}",
        annotation: "Replace each vector with its unit-vector expansion. î and ĵ are the x- and y-direction basis vectors.",
      },
      {
        title: "Collect to zero",
        expression: "(A_x - B_x)\\hat{i} + (A_y - B_y)\\hat{j} = \\vec{0}",
        annotation: "Subtract one side from the other. If the sum is zero, each coefficient must be zero independently.",
      },
      {
        title: "Linear independence",
        expression: "A_x - B_x = 0 \\quad \\text{and} \\quad A_y - B_y = 0",
        annotation: "Because î and ĵ are linearly independent, each coefficient must vanish independently.",
      },
      {
        title: "Conclusion",
        expression: "\\therefore A_x = B_x \\quad \\text{and} \\quad A_y = B_y",
        annotation: "Two vectors are equal if and only if every component matches — regardless of where the arrows are drawn.",
      },
    ],
    title: 'Proof: vector equality is component-by-component',

    // Pillar 2 — Rigor viz (proof-synced)
    visualizations: [
      {
        id: 'VectorEqualityProof',
        title: 'Step through the equality proof',
        mathBridge:
          'Watch the geometric picture update as each algebraic step is applied. ' +
          'Step 4 highlights why linear independence of $\\hat{i}$, $\\hat{j}$ forces each coefficient to zero.',
        caption: 'Geometry and algebra tell the same story — one step at a time.',
      },
    ],
  },

  // ── Examples ────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-001-ex1',
      title: 'Classifying quantities as vector or scalar',
      problem:
        '\\text{Classify each quantity: (a) } 9.8\\,m/s^2 \\text{ downward, (b) } 25\\,°C, ' +
        '\\text{ (c) } 60\\,km/h \\text{ northeast, (d) } 5\\,kg.',
      steps: [
        {
          expression: '\\text{(a) } \\vec{g} = 9.8\\,m/s^2 \\text{ downward} \\Rightarrow \\textbf{vector}',
          annotation:
            'Has a direction (downward). Gravitational acceleration is a vector — ' +
            'at the surface of the Earth it always points toward the centre.',
        },
        {
          expression: '\\text{(b) } T = 25\\,°C \\Rightarrow \\textbf{scalar}',
          annotation: 'Temperature is a pure number — there is no direction associated with being 25 °C.',
        },
        {
          expression: '\\text{(c) } \\vec{v} = 60\\,km/h \\text{ northeast} \\Rightarrow \\textbf{vector}',
          annotation: '"Speed northeast" is velocity — magnitude 60 km/h plus a direction.',
        },
        {
          expression: '\\text{(d) } m = 5\\,kg \\Rightarrow \\textbf{scalar}',
          annotation: 'Mass is a scalar. Weight (the gravitational force on that mass) is a vector.',
        },
      ],
      conclusion: 'If a quantity needs a direction to be fully described, it is a vector; otherwise it is a scalar.',
      visualizations: [
        {
          id: 'VectorArrowIntuition',
          title: 'Vector vs scalar — gallery',
          caption: 'Click each quantity to see whether an arrow appears.',
        },
      ],
    },
    {
      id: 'ch1-001-ex2',
      title: 'Finding components from magnitude and angle',
      problem:
        '\\text{A displacement vector has magnitude } |\\vec{d}| = 8.0\\,m ' +
        '\\text{ at } \\theta = 30° \\text{ above the positive } x\\text{-axis. Find } d_x \\text{ and } d_y.',
      steps: [
        {
          expression: 'd_x = |\\vec{d}|\\cos\\theta = 8.0\\cos 30°',
          annotation: 'The $x$-component is the adjacent side of the right triangle: magnitude × cos(angle).',
        },
        {
          expression: 'd_x = 8.0 \\times \\frac{\\sqrt{3}}{2} = 4\\sqrt{3} \\approx 6.93\\,m',
          annotation: '$\\cos 30° = \\sqrt{3}/2 \\approx 0.866$.',
        },
        {
          expression: 'd_y = |\\vec{d}|\\sin\\theta = 8.0\\sin 30°',
          annotation: 'The $y$-component is the opposite side: magnitude × sin(angle).',
        },
        {
          expression: 'd_y = 8.0 \\times 0.5 = 4.0\\,m',
          annotation: '$\\sin 30° = 0.5$ exactly.',
        },
        {
          expression:
            '\\text{Check: } \\sqrt{d_x^2 + d_y^2} = \\sqrt{(4\\sqrt{3})^2 + 4^2} = \\sqrt{48 + 16} = \\sqrt{64} = 8.0\\,m \\checkmark',
          annotation: 'Reconstruct the magnitude from components — it matches. Always verify.',
        },
      ],
      conclusion:
        'Apply $d_x = |\\vec{d}|\\cos\\theta$ and $d_y = |\\vec{d}|\\sin\\theta$, ' +
        'then check by recovering the magnitude with $\\sqrt{d_x^2+d_y^2}$.',
      visualizations: [
        {
          id: 'VectorComponentDecomposer',
          title: 'Watch $d_x$ and $d_y$ appear',
          caption: 'Set magnitude to 8 and angle to 30° to see exactly what the example is computing.',
          props: { lockedMagnitude: 8.0, lockedAngle: 30 },
        },
      ],
    },
    {
      id: 'ch1-001-ex3',
      title: 'Recovering magnitude and angle from components',
      problem:
        '\\text{A force vector has components } F_x = -3.0\\,N \\text{ and } F_y = 4.0\\,N. ' +
        '\\text{Find } |\\vec{F}| \\text{ and } \\theta.',
      steps: [
        {
          expression: '|\\vec{F}| = \\sqrt{F_x^2 + F_y^2} = \\sqrt{(-3.0)^2 + (4.0)^2}',
          annotation: 'Apply the Pythagorean formula. Note that squaring removes the negative sign.',
        },
        {
          expression: '|\\vec{F}| = \\sqrt{9.0 + 16.0} = \\sqrt{25.0} = 5.0\\,N',
          annotation: 'Magnitude is always positive.',
        },
        {
          expression:
            '\\theta_{\\text{ref}} = \\arctan\\!\\left(\\frac{|F_y|}{|F_x|}\\right) = \\arctan\\!\\left(\\frac{4.0}{3.0}\\right) \\approx 53.1°',
          annotation:
            'Find the reference angle using the absolute values of the components. ' +
            'Then use the signs to place the vector in the correct quadrant.',
        },
        {
          expression:
            'F_x < 0,\\; F_y > 0 \\Rightarrow \\text{Quadrant II} \\Rightarrow \\theta = 180° - 53.1° = 126.9°',
          annotation:
            'The vector points left and up — Quadrant II. Subtract the reference angle from 180°. ' +
            'This is the step a calculator will not do for you automatically.',
        },
      ],
      conclusion:
        '$|\\vec{F}| = 5.0\\,N$ at $\\theta \\approx 127°$ from the positive $x$-axis. ' +
        'Always sketch the vector first to confirm which quadrant correction to apply.',
    },
  ],

  // ── Challenges ──────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-001-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Which of the following is a vector? (a) kinetic energy, (b) momentum, (c) temperature, (d) distance.}',
      hint: 'Ask: does it require a direction to be fully specified?',
      walkthrough: [
        {
          expression: '\\text{(a) KE} = \\tfrac{1}{2}mv^2 \\Rightarrow \\text{scalar (energy is always scalar)}',
          annotation: 'Kinetic energy is a magnitude only.',
        },
        {
          expression: '\\text{(b) } \\vec{p} = m\\vec{v} \\Rightarrow \\textbf{vector}',
          annotation: 'Momentum inherits the direction of velocity.',
        },
        {
          expression: '\\text{(c) Temperature} \\Rightarrow \\text{scalar}',
          annotation: 'No direction.',
        },
        {
          expression: '\\text{(d) Distance} \\Rightarrow \\text{scalar (displacement is the vector version)}',
          annotation: 'Distance is a total path length — a number. Displacement adds direction.',
        },
      ],
      answer: '\\text{(b) momentum is the only vector in the list}',
    },
    {
      id: 'ch1-001-ch2',
      difficulty: 'easy',
      problem:
        '\\text{A velocity vector has } v_x = 5.0\\,m/s \\text{ and } v_y = 5.0\\,m/s. ' +
        '\\text{Find the speed } |\\vec{v}| \\text{ and direction } \\theta.',
      hint: 'Speed is the magnitude: use $\\sqrt{v_x^2+v_y^2}$. Both components are positive — which quadrant?',
      walkthrough: [
        {
          expression: '|\\vec{v}| = \\sqrt{5.0^2 + 5.0^2} = \\sqrt{50} = 5\\sqrt{2} \\approx 7.07\\,m/s',
          annotation: 'Pythagorean theorem on the components.',
        },
        {
          expression: '\\theta = \\arctan(5.0/5.0) = \\arctan(1) = 45°',
          annotation:
            'Both components positive → Quadrant I. $\\arctan(1) = 45°$ needs no quadrant correction here.',
        },
      ],
      answer: '|\\vec{v}| = 5\\sqrt{2}\\,m/s \\approx 7.07\\,m/s \\text{ at } 45°',
    },
    {
      id: 'ch1-001-ch3',
      difficulty: 'medium',
      problem:
        '\\text{Vector } \\vec{A} \\text{ has magnitude } 10 \\text{ at } 210°. ' +
        '\\text{Find its components. Draw the vector and verify the quadrant.}',
      hint:
        '210° = 180° + 30°, so the vector is in Quadrant III. Both components will be negative. ' +
        'Use $A_x = 10\\cos210°$ and $A_y = 10\\sin210°$.',
      walkthrough: [
        {
          expression: 'A_x = 10\\cos210° = 10\\times(-\\tfrac{\\sqrt{3}}{2}) = -5\\sqrt{3} \\approx -8.66',
          annotation: '$\\cos210° = -\\cos30° = -\\sqrt{3}/2$. Negative means pointing left.',
        },
        {
          expression: 'A_y = 10\\sin210° = 10\\times(-\\tfrac{1}{2}) = -5.0',
          annotation: '$\\sin210° = -\\sin30° = -1/2$. Negative means pointing down.',
        },
        {
          expression:
            '\\text{Check: }\\sqrt{(-8.66)^2+(-5.0)^2} = \\sqrt{75+25} = \\sqrt{100} = 10\\checkmark',
          annotation: 'Magnitude checks out. Both components negative confirms Quadrant III.',
        },
      ],
      answer: 'A_x = -5\\sqrt{3}\\,\\approx -8.66,\\quad A_y = -5.0',
    },
    {
      id: 'ch1-001-ch4',
      difficulty: 'hard',
      problem:
        '\\text{Two vectors are given: } \\vec{A} = (3, 4) \\text{ and } \\vec{B} \\text{ has magnitude } 5 ' +
        '\\text{ at } 180°. \\text{ Are } \\vec{A} \\text{ and } \\vec{B} \\text{ equal? Explain using the formal definition.}',
      hint:
        'Convert $\\vec{B}$ to component form first. Then apply the rule: ' +
        'vectors are equal if and only if every component matches.',
      walkthrough: [
        {
          expression: '\\vec{B}: B_x = 5\\cos180° = -5,\\quad B_y = 5\\sin180° = 0',
          annotation: 'Convert magnitude–angle to components.',
        },
        {
          expression: '\\vec{A} = (3,\\,4), \\quad \\vec{B} = (-5,\\,0)',
          annotation: 'Write both in component form side by side.',
        },
        {
          expression: 'A_x = 3 \\neq -5 = B_x',
          annotation: 'The $x$-components differ. That is sufficient to conclude the vectors are not equal.',
        },
        {
          expression: '\\therefore\\; \\vec{A} \\neq \\vec{B}',
          annotation:
            'Vector equality requires every component to match. Even one mismatch is enough to conclude inequality. ' +
            'Note also that $|\\vec{A}| = 5 = |\\vec{B}|$ — equal magnitudes do NOT imply equal vectors.',
        },
      ],
      answer:
        '\\vec{A} \\neq \\vec{B}. \\text{ Equal magnitude is necessary but not sufficient for vector equality.}',
    },
  ],

  // ── Pillar 3 — Pattern-recognition viz (referenced in math section) ─────
  // Registered in VizFrame.jsx as 'VectorPatternSpotter'
  // This viz presents a set of physical scenarios and asks the student
  // to identify which quantities are vectors before revealing the answer.
  patternViz: {
    id: 'VectorPatternSpotter',
    placement: 'math', // render at end of math section
    title: 'Spot the vector — 8 quick rounds',
    mathBridge:
      'Each round shows a physical quantity. Decide: vector or scalar? ' +
      'After you answer, the viz shows the arrow (or absence of one) and explains why.',
    caption:
      'Recognition is a skill. Build it here before the examples so the worked solutions feel obvious.',
    props: {
      rounds: [
        { quantity: '12\\,m/s\\text{ west}', answer: 'vector', reason: 'velocity carries direction' },
        { quantity: '100\\,J', answer: 'scalar', reason: 'energy has no direction' },
        { quantity: '9.8\\,m/s^2\\text{ downward}', answer: 'vector', reason: 'acceleration is a vector' },
        { quantity: '273\\,K', answer: 'scalar', reason: 'temperature is scalar' },
        { quantity: '50\\,N\\text{ at }30°', answer: 'vector', reason: 'force is a vector' },
        { quantity: '3.0\\,kg', answer: 'scalar', reason: 'mass is scalar; weight is vector' },
        { quantity: '\\Delta\\vec{r} = 5\\,m\\text{ north}', answer: 'vector', reason: 'displacement is a vector' },
        { quantity: '60\\,W', answer: 'scalar', reason: 'power is scalar' },
      ],
    },
  },

  // ── Pillar 5 — Recognition/exhaustive-forms viz ──────────────────────────
  // Registered in VizFrame.jsx as 'VectorFormRecogniser'
  recognitionViz: {
    id: 'VectorFormRecogniser',
    placement: 'examples_end',
    title: 'Every disguise a vector wears — recognition drill',
    mathBridge:
      'Vectors appear in many notations. After this drill you should be able to spot them all.',
    caption:
      'Forms covered: arrow notation, bold notation, bracket/component notation, ' +
      'magnitude–angle notation, unit-vector notation, negative vector. ' +
      'Every surface form the concept takes in practice.',
    prerequisiteRecaps: [
      {
        concept: 'Right-triangle trigonometry (SOH-CAH-TOA)',
        summary:
          '$\\sin\\theta = \\text{opp}/\\text{hyp}$, $\\cos\\theta = \\text{adj}/\\text{hyp}$, ' +
          '$\\tan\\theta = \\text{opp}/\\text{adj}$. ' +
          'Used to convert between magnitude–angle and component forms.',
        lessonSlug: null, // prerequisite is pre-course; no internal link
      },
      {
        concept: 'Pythagorean theorem',
        summary: '$c^2 = a^2 + b^2$. Used to find the magnitude of a vector from its components.',
        lessonSlug: null,
      },
    ],
    props: {
      forms: [
        {
          notation: '\\vec{A}',
          label: 'Arrow notation',
          example: '\\vec{F} = 10\\,N\\text{ east}',
        },
        {
          notation: '\\mathbf{A}',
          label: 'Bold notation (textbooks / linear algebra)',
          example: '\\mathbf{v} = 3\\,m/s\\text{ north}',
        },
        {
          notation: '(A_x,\\, A_y)',
          label: 'Component/bracket notation',
          example: '\\vec{d} = (4,\\,-3)\\,m',
        },
        {
          notation: '|\\vec{A}|\\angle\\theta',
          label: 'Magnitude–angle notation',
          example: '|\\vec{v}| = 5\\,m/s\\angle 37°',
        },
        {
          notation: 'A_x\\,\\hat{i} + A_y\\,\\hat{j}',
          label: 'Unit-vector notation',
          example: '\\vec{F} = 3\\hat{i} - 4\\hat{j}\\,N',
        },
        {
          notation: '-\\vec{A}',
          label: 'Negative vector (same magnitude, opposite direction)',
          example: 'If \\vec{A} = (3,4)\\text{ then }-\\vec{A} = (-3,-4)',
        },
      ],
    },
  },
}
