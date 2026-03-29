export default {
  id: 'ch3-trig-003',
  slug: 'trig-ratios-right-triangles',
  chapter: 'precalc-3',
  order: 3,
  title: 'Trig Ratios: Six Functions From One Triangle',
  subtitle: 'SOH-CAH-TOA is a memory aid, not a definition — here is the real story behind all six trig functions',
  tags: ['trig ratios', 'SOH-CAH-TOA', 'sine', 'cosine', 'tangent', 'cosecant', 'secant', 'cotangent', 'unit circle', 'exact values', '30-45-60'],
  aliases: 'sine cosine tangent SOH CAH TOA six trig functions unit circle 30 45 60 degrees exact values right triangle ratio',

  hook: {
    question: 'Why is it called the co-sine? And what does the "co" mean in co-secant and co-tangent? The naming hides a beautiful symmetry that makes half the unit circle values free once you know the other half.',
    realWorldContext: 'Every GPS location, every 3D rendering, every robot arm position uses trig ratios. In manufacturing, the angle of a machined surface is specified as a trig ratio — not as an angle — because ratios are dimensionless and therefore independent of units. Structural engineers compute forces along and perpendicular to members using sine and cosine decomposition.',
    previewVisualizationId: 'TrigRatiosViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** The previous lesson (Triangle Geometry) established that similar triangles have equal side ratios — and that any two right triangles with the same acute angle are similar. That similarity is the entire reason trig ratios exist: they are the names we give to those locked-in ratios. This lesson fills the gap between "ratios exist" and "here are all six, where they come from, and how they connect."',
      'In a right triangle, the six trig ratios are just the six ways to form a fraction from the three side lengths. With sides labelled relative to an acute angle $\\theta$: opposite (opp), adjacent (adj), hypotenuse (hyp), the six ratios are $\\sin = \\text{opp/hyp}$, $\\cos = \\text{adj/hyp}$, $\\tan = \\text{opp/adj}$, and their reciprocals $\\csc = \\text{hyp/opp}$, $\\sec = \\text{hyp/adj}$, $\\cot = \\text{adj/opp}$.',
      'The "co" prefix means complementary. The co-sine of an angle is the sine of its complement: $\\cos\\theta = \\sin(90°-\\theta)$. Similarly $\\cot\\theta = \\tan(90°-\\theta)$ and $\\csc\\theta = \\sec(90°-\\theta)$. This is why co-functions appear in pairs — they share the same values, just on opposite angles of the same right triangle.',
      'These ratios are well-defined because of similar triangles. Every right triangle with a given acute angle $\\theta$ is similar to every other — same angles, just different scale. The ratio opposite/hypotenuse is the same for all of them. That common ratio is exactly what we call $\\sin\\theta$. The ratio does not depend on the size of the triangle.',
      '**The Grammar of Proportion**: The word "Sine" has a messy history—starting as "Jiva" (bowstring) in Sanskrit, becoming "Jaib" (fold) in Arabic, and being mistranslated into "Sinus" (bay/pocket) in Latin. Regardless of the name, it represents the "Vertical Chord"—the height of a point on the circle.',
      '**The Scale-Free Universe**: Trigonometry is the math of Ratios, and ratios are the only true units in physics. Whether you are measuring the angle of an atom or the angle of a distant galaxy, the Sine of 30° is ALWAYS 0.5. It is a universal constant of shape, independent of size.',
      '**Where this is heading:** Once you have the six trig ratios defined in a right triangle, the next lesson (Graphing Trig Functions) takes those ratio values and plots them as functions of the angle — turning the static triangle picture into dynamic waves. The periodicity, asymptotes, and range of every trig graph follow directly from the definitions and the unit circle you see here.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Precalc-3 arc — Lesson 3 of 11',
        body: '← Triangle Geometry | **Trig Ratios in Right Triangles** | Graphing Trig Functions →',
      },
      {
        type: 'definition',
        title: 'The six trig ratios',
        body: '\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} \\qquad \\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}} \\qquad \\tan\\theta = \\frac{\\text{opp}}{\\text{adj}} \\\\ \\csc\\theta = \\frac{\\text{hyp}}{\\text{opp}} \\qquad \\sec\\theta = \\frac{\\text{hyp}}{\\text{adj}} \\qquad \\cot\\theta = \\frac{\\text{adj}}{\\text{opp}}',
      },
      {
        type: 'insight',
        title: 'Reciprocal pairs — one memory, two facts',
        body: '\\csc = \\frac{1}{\\sin} \\qquad \\sec = \\frac{1}{\\cos} \\qquad \\cot = \\frac{1}{\\tan} \\\\ \\text{Memory: } \\csc/\\sin,\\; \\sec/\\cos \\text{ — the "co" pairs with "co".} \\\\ \\tan = \\frac{\\sin}{\\cos} \\qquad \\cot = \\frac{\\cos}{\\sin}',
      },
      {
        type: 'insight',
        title: 'The co-function symmetry',
        body: '\\sin\\theta = \\cos(90°-\\theta) \\qquad \\cos\\theta = \\sin(90°-\\theta) \\\\ \\tan\\theta = \\cot(90°-\\theta) \\qquad \\sec\\theta = \\csc(90°-\\theta) \\\\ \\text{"co" means complement: the co-function of } \\theta \\text{ is the function of } (90°-\\theta)',
      },
      {
        type: 'insight',
        title: 'Linguistic Learner: The Grammar of Proportion',
        body: '\\text{The "co" in cosine stands for "complementary."} \\\\ \\text{The Sine of an angle is literally the "Fold" or "Chord" of the circle. The Cosine is just the Sine seen from the other corner\'s perspective.}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Scale-Free Universe',
        body: '\\text{Geometry is scale-invariant.} \\\\ \\text{Because a triangle is "Rigid," every angle is locked to a specific ratio of sides. Trigonometry is the catalog of these universal proportions.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: The Clinometer and Shadow',
        body: '\\text{Ancient Egyptians found the height of pyramids by measuring shadows.} \\\\ \\text{The Tangent ratio is the "Shadow Factor"—tell me the angle of the sun, and I will tell you exactly how many times longer your shadow is than your height.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: The Tangent as Slope',
        body: '\\text{Visualize a mountain climb.} \\\\ \\text{The Sine is your vertical gain; the Cosine is your horizontal travel; the Tangent is the "Steepness" of the path.} \\\\ \\tan\\theta \\text{ is the literal slope (rise/run) of the terminal side.}',
      },
    ],
    visualizations: [
      {
        id: 'TrigRatiosViz',
        title: 'All Six Ratios — One Draggable Triangle',
        mathBridge: 'Before interacting, note that all six trig values are displayed alongside a right triangle. Step 1: Drag the angle slider from 0° to 90° and observe how all six ratios change simultaneously. Step 2: Now drag the triangle size slider to make the triangle larger or smaller — notice the ratios do NOT change, proving they depend only on the angle. Step 3: Hover over each ratio to see which sides of the triangle it corresponds to. The key lesson: trig ratios are properties of the angle, not the triangle — this is the similar-triangle argument made visible.',
        caption: 'The ratio is the number. The triangle size is irrelevant.',
      },
      { id: 'VideoCarousel', title: 'Trigonometric Ratios', props: { videos: [
          { url: "", title: 'TR-13 — The Trigonometric Ratios' },
          { url: "", title: 'TR-13Z — How the Co- Functions Got Their Names' },
        ]},
      },
            { id: 'VideoCarousel', title: 'Sine & Cosine of Common Angles', props: { videos: [
          { url: "", title: 'TR-15 — Sine & Cosine of Common Angles' },
          { url: "", title: 'TR-15Z — Proof of Common Values' },
        ]},
      },
    ],
  },

  math: {
    prose: [
      'The exact values for 30°, 45°, and 60° come from two special triangles. The 45-45-90 triangle has legs equal; if each leg is 1, the hypotenuse is $\\sqrt{2}$. The 30-60-90 triangle comes from cutting an equilateral triangle in half; if the hypotenuse is 2, the short leg is 1 and the long leg is $\\sqrt{3}$.',
      'The unit circle ($r=1$) unifies all of this. At angle $\\theta$ measured from the positive $x$-axis, the terminal point is $P = (\\cos\\theta, \\sin\\theta)$. This is because in a unit-radius right triangle, the adjacent side has length $\\cos\\theta$ (by definition of cosine) and the opposite side has length $\\sin\\theta$. The unit circle extends trig to all angles — not just acute ones.',
      'For angles beyond 90°, the right-triangle definition breaks down (you cannot have an obtuse angle in a right triangle). The unit circle definition takes over: $\\sin\\theta$ is always the $y$-coordinate of the terminal point, $\\cos\\theta$ is always the $x$-coordinate, for any angle.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Exact values — the two special triangles',
        body: '\\begin{array}{c|ccc} \\theta & 30° & 45° & 60° \\\\ \\hline \\sin & \\frac{1}{2} & \\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{3}}{2} \\\\ \\cos & \\frac{\\sqrt{3}}{2} & \\frac{\\sqrt{2}}{2} & \\frac{1}{2} \\\\ \\tan & \\frac{1}{\\sqrt{3}} & 1 & \\sqrt{3} \\end{array}',
      },
      {
        type: 'insight',
        title: 'Memory pattern for sin/cos exact values',
        body: '\\sin 0°, 30°, 45°, 60°, 90° = \\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2} \\\\ = 0, \\frac{1}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, 1 \\\\ \\text{Cosine is the same sequence reversed.}',
      },
      {
        type: 'definition',
        title: 'Unit circle definition — extends trig to all angles',
        body: '\\text{Terminal point of angle } \\theta: P = (\\cos\\theta, \\sin\\theta) \\\\ \\tan\\theta = \\frac{y}{x} = \\frac{\\sin\\theta}{\\cos\\theta} \\quad (x \\neq 0) \\\\ \\text{Signs by quadrant: ASTC — All, Sin, Tan, Cos (positive)}',
      },
      {
        type: 'insight',
        title: 'ASTC — which functions are positive in each quadrant',
        body: '\\text{"All Students Take Calculus"} \\quad \\text{QI: All | QII: Sin | QIII: Tan | QIV: Cos} \\\\ \\text{This follows from the }(x,y) \\text{ signs of the unit circle point } (\\cos, \\sin).',
      },
      {
        type: 'theorem',
        title: 'The Unit Circle Projection (Pythagorean Identity)',
        body: '\\text{For any point } (x,y) \\text{ on the unit circle: } x^2 + y^2 = 1^2. \\\\ \\text{Substituting the trig coordinates: } \\cos^2\\theta + \\sin^2\\theta = 1. \\\\ \\text{This is the fundamental constraint of the trigonometric world.}',
      },
      {
        type: 'theorem',
        title: 'The Similarity Necessity',
        body: '\\text{If triangles } T_1, T_2 \\text{ share angle } \\theta, \\text{ they share ALL angles (A-A similarity).} \\\\ \\text{Side ratios are fixed by similarity scale factors. Therefore, any two students solving the same trig problem will find the SAME numerical ratio.}',
      },
    ],
    visualizations: [
      {
        id: 'UnitCircleFullViz',
        title: 'All Six Trig Functions on the Unit Circle',
        mathBridge: 'Before interacting, observe the unit circle with labeled segments for each of the six trig functions. Step 1: Drag the angle point around the circle through all four quadrants. Step 2: Watch the sign of each function change as you cross each axis — confirm the ASTC pattern. Step 3: Pause at 30°, 45°, and 60° and verify the exact values you memorized. The key lesson: the geometric lengths on and around the circle literally ARE the trig values — not just abstract numbers.',
        caption: 'Sin and cos are coordinates. Tan is a segment on the tangent line. Sec is the distance to the tangent point.',
      },
    ],
  },

  rigor: {
    title: 'Proving the exact values for 30° and 60° from an equilateral triangle',
    visualizationId: 'TrigRatiosViz',
    proofSteps: [
      {
        expression: '\\text{Start with an equilateral triangle: all sides} = 2, \\text{ all angles} = 60°.',
        annotation: 'An equilateral triangle has three 60° angles and three equal sides.',
      },
      {
        expression: '\\text{Drop a perpendicular from the apex to the base, bisecting it.}',
        annotation: 'The altitude of an equilateral triangle bisects the base and creates two congruent right triangles.',
      },
      {
        expression: '\\text{Each right triangle has: hypotenuse} = 2, \\text{ short leg} = 1, \\text{ angles} = 30°, 60°, 90°.',
        annotation: 'The base is bisected (giving 1), the hypotenuse is the original side (2), and the angles must be 30-60-90 by the triangle angle sum.',
      },
      {
        expression: '\\text{Long leg} = \\sqrt{2^2 - 1^2} = \\sqrt{3} \\quad \\text{(Pythagorean theorem)}',
        annotation: 'Find the third side.',
      },
      {
        expression: '\\sin 30° = \\frac{1}{2}, \\; \\cos 30° = \\frac{\\sqrt{3}}{2}, \\; \\sin 60° = \\frac{\\sqrt{3}}{2}, \\; \\cos 60° = \\frac{1}{2} \\qquad \\blacksquare',
        annotation: 'Read off the ratios. Note the co-function symmetry: $\\sin 30° = \\cos 60°$ and $\\cos 30° = \\sin 60°$ — complements of each other.',
      },
      {
        expression: '\\text{--- Part II: The Complementary Cofunction Proof ---}',
        annotation: 'Let us prove why $\\sin \\theta = \\cos(90 - \\theta)$ for any right triangle.'
      },
      {
        expression: '\\text{Let } A + B + 90^\\circ = 180^\\circ \\implies B = 90^\\circ - A',
        annotation: 'Step 1: The two acute angles of a right triangle are complementary.'
      },
      {
        expression: '\\sin A = \\frac{\\text{Opposite of } A}{\\text{Hypotenuse}}',
        annotation: 'Step 2: Define Sine for angle A.'
      },
      {
        expression: '\\text{The "Opposite of } A" \\text{ is the "Adjacent of } B"',
        annotation: 'Step 3: Geometry of the shared sides. The side opposite to A is the one next to B.'
      },
      {
        expression: '\\cos B = \\frac{\\text{Adjacent of } B}{\\text{Hypotenuse}} = \\sin A \\qquad \\blacksquare',
        annotation: 'Step 4: Therefore, the Cosine of B is identical to the Sine of A. This is the definition of a Co-function.'
      }
    ],
  },

  examples: [
    {
      id: 'ch3-trig-003-ex1',
      title: 'Finding all six trig ratios from one side ratio',
      problem: '\\text{If } \\sin\\theta = \\frac{3}{5} \\text{ and } \\theta \\text{ is acute, find all six trig ratios.}',
      steps: [
        {
          expression: '\\text{opp} = 3, \\text{ hyp} = 5 \\Rightarrow \\text{adj} = \\sqrt{25-9} = 4',
          annotation: 'Draw the triangle: opposite = 3, hypotenuse = 5. Pythagorean theorem gives the adjacent side. (Recognise 3-4-5!)',
          hint: 'From $\\sin\\theta = \\text{opp}/\\text{hyp} = 3/5$, label the sides. Use the Pythagorean theorem to find the missing side. Recognize 3-4-5 to skip the computation.',
        },
        {
          expression: '\\sin = \\frac{3}{5}, \\; \\cos = \\frac{4}{5}, \\; \\tan = \\frac{3}{4}',
          annotation: 'The three primary ratios.',
          hint: 'Use the definitions: sin = opp/hyp, cos = adj/hyp, tan = opp/adj with the three side lengths you now know.',
        },
        {
          expression: '\\csc = \\frac{5}{3}, \\; \\sec = \\frac{5}{4}, \\; \\cot = \\frac{4}{3}',
          annotation: 'The three reciprocals — flip each primary ratio.',
          hint: 'Each reciprocal is simply the flip of its corresponding primary ratio: csc = 1/sin, sec = 1/cos, cot = 1/tan.',
        },
      ],
      conclusion: 'One trig ratio in a right triangle determines all six. Draw the triangle, find the missing side, read off the ratios.',
    },
    {
      id: 'ch3-trig-003-ex2',
      title: 'Exact values from the unit circle for angles beyond 90°',
      problem: '\\text{Find the exact value of } \\sin(150°), \\cos(225°), \\tan(300°).',
      steps: [
        {
          expression: '\\sin(150°) = \\sin(180°-30°) = \\sin(30°) = \\frac{1}{2}',
          annotation: 'QII: sin is positive. Reference angle is $180°-150°=30°$. Use the known value.',
          hint: 'Find the quadrant (150° is in QII), determine the sign of sine there (positive in QII), compute the reference angle ($180°-150°=30°$), and apply the known exact value.',
        },
        {
          expression: '\\cos(225°) = -\\cos(45°) = -\\frac{\\sqrt{2}}{2}',
          annotation: 'QIII: cos is negative. Reference angle is $225°-180°=45°$.',
          hint: 'Cosine is negative in QIII. The reference angle is $225°-180°=45°$. Apply the negative sign to $\\cos 45°$.',
        },
        {
          expression: '\\tan(300°) = -\\tan(60°) = -\\sqrt{3}',
          annotation: 'QIV: tan is negative. Reference angle is $360°-300°=60°$.',
          hint: 'Tangent is negative in QIV. The reference angle is $360°-300°=60°$. Apply the negative sign to $\\tan 60°$.',
        },
      ],
      conclusion: 'Reference angle method: (1) find which quadrant, (2) find the reference angle (acute angle to the x-axis), (3) apply the ASTC sign rule.',
    },
    {
      id: 'ex-trig-reciprocal-recon',
      title: 'Reciprocal Reconstruction: Working Backwards',
      problem: '\\text{If } \\sec\\theta = \\sqrt{5} \\text{ and } \\sin\\theta < 0, \\text{ find all six trig ratios.}',
      steps: [
        {
          expression: '\\cos\\theta = \\frac{1}{\\sqrt{5}}, \\quad \\theta \\in QIV',
          annotation: 'Step 1: Reciprocal of secant is cosine. Since sec is positive and sin is negative, we must be in Quadrant IV.',
          hint: 'Take the reciprocal of sec to get cos. Determine the quadrant: sec positive means cos positive; sin negative. Only QIV satisfies both conditions.',
        },
        {
          expression: '\\text{adj} = 1, \\text{ hyp} = \\sqrt{5} \\implies \\text{opp} = -\\sqrt{(\\sqrt{5})^2 - 1^2} = -2',
          annotation: 'Step 2: Use Pythagoras to find the opposite side. It MUST be negative because of QIV.',
          hint: 'Set up the right triangle with adj = 1, hyp = $\\sqrt{5}$. Pythagorean theorem gives opp = 2, then apply the negative sign because the point is below the x-axis in QIV.',
        },
        {
          expression: '\\sin\\theta = -\\frac{2}{\\sqrt{5}}, \\quad \\tan\\theta = -2, \\quad \\cot\\theta = -\\frac{1}{2}, \\quad \\csc\\theta = -\\frac{\\sqrt{5}}{2}',
          annotation: 'Step 3: Read off all remaining ratios from the side lengths.',
          hint: 'Use the signed side values: opp = -2, adj = 1, hyp = $\\sqrt{5}$. Apply each definition directly.',
        }
      ],
      conclusion: 'A single reciprocal ratio locks in the entire unit circle possibility. Sign analysis is the final filter.'
    },
    {
      id: 'ex-trig-complement-eq',
      title: 'The Complement Equation: Symmetry in Action',
      problem: '\\text{Solve for } x: \\sin(20^\\circ) = \\cos(x).',
      steps: [
        {
          expression: '\\cos(x) = \\sin(90^\\circ - x)',
          annotation: 'Step 1: Use the co-function identity.',
          hint: 'Recall that $\\cos(x) = \\sin(90° - x)$ — the co-function identity. Rewrite the right side using this.',
        },
        {
          expression: '\\sin(20^\\circ) = \\sin(90^\\circ - x) \\implies 20 = 90 - x',
          annotation: 'Step 2: Equate the arguments.',
          hint: 'Since both sides are now sine of the same expression equated to the same value, the arguments must be equal.',
        },
        {
          expression: 'x = 70^\\circ',
          annotation: 'Step 3: Solve for x.',
          hint: 'Rearrange $20 = 90 - x$ to get $x = 70°$. Verify: $\\cos(70°) = \\sin(20°)$ ✓',
        }
      ],
      conclusion: 'Co-functions are identical once you cross the 45° boundary of the complement.'
    },
  ],

  challenges: [
    {
      id: 'ch3-trig-003-ch1',
      difficulty: 'medium',
      problem: '\\text{If } \\tan\\theta = -\\frac{5}{12} \\text{ and } \\theta \\text{ is in QIV, find } \\sin\\theta \\text{ and } \\cos\\theta.',
      hint: '$\\tan = $ opp/adj. In QIV, sin is negative and cos is positive.',
      walkthrough: [
        {
          expression: '\\text{opp} = 5, \\text{ adj} = 12 \\Rightarrow \\text{hyp} = \\sqrt{25+144} = 13',
          annotation: 'In QIV: opposite is $-5$ (below x-axis), adjacent is $+12$. Hypotenuse is always positive.',
        },
        {
          expression: '\\sin\\theta = -\\frac{5}{13}, \\quad \\cos\\theta = \\frac{12}{13}',
          annotation: 'QIV: sin negative, cos positive. Verify: $(-5/13)/(12/13) = -5/12 = \\tan\\theta$ ✓',
        },
      ],
      answer: '\\sin\\theta = -5/13, \\; \\cos\\theta = 12/13',
    },
    {
      id: 'ch3-trig-003-ch2',
      difficulty: 'hard',
      problem: '\\text{Prove that } \\tan\\theta + \\cot\\theta = \\sec\\theta \\csc\\theta.',
      hint: 'Write everything in terms of sin and cos, then combine fractions.',
      walkthrough: [
        {
          expression: '\\tan\\theta + \\cot\\theta = \\frac{\\sin\\theta}{\\cos\\theta} + \\frac{\\cos\\theta}{\\sin\\theta}',
          annotation: 'Convert to sin and cos.',
        },
        {
          expression: '= \\frac{\\sin^2\\theta + \\cos^2\\theta}{\\sin\\theta\\cos\\theta} = \\frac{1}{\\sin\\theta\\cos\\theta}',
          annotation: 'Common denominator, then Pythagorean identity.',
        },
        {
          expression: '= \\frac{1}{\\sin\\theta} \\cdot \\frac{1}{\\cos\\theta} = \\csc\\theta \\cdot \\sec\\theta \\qquad \\blacksquare',
          annotation: 'Split and recognise the reciprocal definitions.',
        },
      ],
      answer: '\\tan\\theta + \\cot\\theta = \\sec\\theta\\csc\\theta',
    },
    {
      id: 'ch3-trig-003-ch3',
      difficulty: 'harder',
      problem: '\\text{Start with the fundamental identity } \\sin^2\\theta + \\cos^2\\theta = 1. \\text{ Derive the identity relating cotangent and cosecant.}',
      hint: 'Divide the entire identity by $\\sin^2\\theta$.',
      walkthrough: [
        {
          expression: '\\frac{\\sin^2\\theta}{\\sin^2\\theta} + \\frac{\\cos^2\\theta}{\\sin^2\\theta} = \\frac{1}{\\sin^2\\theta}',
          annotation: 'Step 1: Perform the same algebraic operation (division) on every term.'
        },
        {
          expression: '1 + \\left(\\frac{\\cos\\theta}{\\sin\\theta}\\right)^2 = \\left(\\frac{1}{\\sin\\theta}\\right)^2',
          annotation: 'Step 2: Group the squared terms.'
        },
        {
          expression: '1 + \\cot^2\\theta = \\csc^2\\theta \\qquad \\blacksquare',
          annotation: 'Step 3: Recognition. The ratio of cos-to-sin is cotangent; the reciprocal of sin is cosecant.'
        }
      ],
      answer: '1 + \\cot^2\\theta = \\csc^2\\theta'
    }
  ],

  calcBridge: {
    teaser: 'The six trig functions and their reciprocal relationships appear throughout calculus. The identity $\\sec^2\\theta = 1 + \\tan^2\\theta$ is used in trig substitution. The co-function identities explain why $\\frac{d}{dx}\\cos x = -\\sin x$ has the negative sign. Understanding which functions are positive in which quadrant is essential for correctly evaluating definite integrals involving trig substitution.',
    linkedLessons: ['trig-identities-deep-dive', 'trig-in-calculus'],
  },

  crossRefs: [
    { slug: 'triangle-geometry', reason: 'The similar-triangle argument that justifies why trig ratios depend only on the angle is established there.' },
    { slug: 'trig-identities-deep-dive', reason: 'The Pythagorean identity $\\sin^2+\\cos^2=1$ and all derived identities flow from the unit circle definition here.' },
    { slug: 'inverse-trig-functions', reason: 'Inverse trig functions reverse the question asked here: given a ratio, find the angle.' },
  ],

  checkpoints: [
    'Can you write all six trig ratios from memory using opp, adj, hyp?',
    'What does the "co" prefix mean, and how does it relate co-sine to sine?',
    'How do you find the exact value of $\\sin(120°)$ using the reference angle method?',
    'Which trig functions are positive in each of the four quadrants (ASTC)?',
    'If $\\cos\\theta = 3/5$ in QIV, what are the other five trig ratios?',
  ],

  semantics: {
    symbols: [
      { symbol: '\\sin\\theta', meaning: 'Sine of $\\theta$: opposite over hypotenuse in a right triangle' },
      { symbol: '\\cos\\theta', meaning: 'Cosine of $\\theta$: adjacent over hypotenuse' },
      { symbol: '\\tan\\theta', meaning: 'Tangent of $\\theta$: opposite over adjacent; also the slope of the terminal side' },
      { symbol: '\\csc, \\sec, \\cot', meaning: 'Reciprocals of sin, cos, tan respectively' },
    ],
    rulesOfThumb: [
      'SOH-CAH-TOA: Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj.',
      'Co-functions are equal at complementary angles: $\\sin\\theta = \\cos(90°-\\theta)$.',
      'ASTC: All positive in QI, Sin in QII, Tan in QIII, Cos in QIV.',
      'The Pythagorean identity $\\sin^2\\theta+\\cos^2\\theta=1$ is the unit circle equation restated.',
      'Reference angle: find the acute angle to the nearest x-axis, then apply the ASTC sign.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { topic: 'Pythagorean theorem', where: 'Triangle Geometry (Lesson 2)', why: 'Finding the third side from two given sides always uses $a^2+b^2=c^2$.' },
      { topic: 'Fractions and ratios', where: 'Precalc-2 — Algebra', why: 'Trig ratios are fractions; all manipulations reduce to fraction operations.' },
    ],
    futureLinks: [
      { topic: 'Trig graphs', where: 'Graphing Trig Functions (Lesson 4)', why: 'The six ratio values at key angles become the key points on each trig graph.' },
      { topic: 'Trig identities', where: 'Trig Identities (Lesson 7)', why: 'Every identity is either the Pythagorean identity or derives from the angle addition formula, both of which use these six ratios.' },
      { topic: 'Trig substitution in calculus', where: 'Trig in Calculus (Lesson 10)', why: 'Trig substitution exploits the Pythagorean identity to eliminate radicals in integrals.' },
    ],
  },

  assessment: [
    {
      question: 'If $\\sin\\theta = 5/13$ and $\\theta$ is in QI, find $\\cos\\theta$.',
      answer: '$12/13$ (via Pythagoras: $13^2-5^2=144$, so adj $= 12$)',
      difficulty: 'quick-fire',
    },
    {
      question: 'Find the exact value of $\\tan(135°)$.',
      answer: '$-1$ (QIII-reference 45°, tan negative in QII)',
      difficulty: 'quick-fire',
    },
    {
      question: 'Solve: $\\cos(x) = \\sin(55°)$.',
      answer: '$x = 35°$ (co-function identity: $\\cos(35°) = \\sin(55°)$)',
      difficulty: 'quick-fire',
    },
  ],

  mentalModel: [
    'Trig ratios are ratios of sides — they depend only on the angle, not the triangle size.',
    '"co" means complement: $\\cos\\theta = \\sin(90°-\\theta)$ and similarly for cot, csc.',
    'The unit circle is the right triangle with hypotenuse 1: $(x,y) = (\\cos\\theta, \\sin\\theta)$.',
    'ASTC tells you signs; the reference angle tells you magnitudes.',
    'One ratio determines all six: draw the triangle, use Pythagoras, read off everything.',
  ],

  quiz: [
    {
      id: 'q-trig-ratios-1',
      type: 'input',
      text: 'If $\\cos\\theta = 4/5$ and $\\theta$ is acute, find $\\tan\\theta$.',
      answer: '\\frac{3}{4}',
      hints: ['Use the Pythagorean theorem to find the opposite side.', 'opp $= \\sqrt{25-16}=3$, so $\\tan = 3/4$.'],
      reviewSection: 'Examples tab — finding all six trig ratios from one side ratio',
    },
    {
      id: 'q-trig-ratios-2',
      type: 'choice',
      text: 'Which quadrant has tangent positive and cosine negative?',
      options: ['Quadrant III', 'Quadrant I', 'Quadrant II', 'Quadrant IV'],
      answer: 'Quadrant III',
      hints: ['In QIII both sin and cos are negative.', 'Tan = sin/cos = (−)/(−) = positive. Only QIII satisfies this.'],
      reviewSection: 'Math tab — ASTC quadrant signs',
    },
    {
      id: 'q-trig-ratios-3',
      type: 'input',
      text: 'Find the exact value of $\\sin(210°)$.',
      answer: '-\\frac{1}{2}',
      hints: ['Reference angle: $210°-180°=30°$. Quadrant: QIII (sin negative).', '$\\sin(210°) = -\\sin(30°) = -1/2$.'],
      reviewSection: 'Examples tab — exact values from the unit circle',
    },
    {
      id: 'q-trig-ratios-4',
      type: 'choice',
      text: 'What is $\\csc(60°)$?',
      options: ['$\\frac{2\\sqrt{3}}{3}$', '$\\frac{\\sqrt{3}}{2}$', '$2$', '$\\frac{1}{2}$'],
      answer: '$\\frac{2\\sqrt{3}}{3}$',
      hints: ['$\\csc = 1/\\sin$. Find $\\sin(60°)$ first.', '$\\sin(60°) = \\sqrt{3}/2$, so $\\csc(60°) = 2/\\sqrt{3} = 2\\sqrt{3}/3$.'],
      reviewSection: 'Math tab — exact values — the two special triangles',
    },
    {
      id: 'q-trig-ratios-5',
      type: 'input',
      text: 'Solve for $x$: $\\sin(x) = \\cos(28°)$, where $x$ is an acute angle.',
      answer: '62',
      hints: ['Use the co-function identity: $\\cos(x) = \\sin(90°-x)$.', '$\\cos(28°) = \\sin(62°)$, so $x = 62°$.'],
      reviewSection: 'Examples tab — the complement equation',
    },
    {
      id: 'q-trig-ratios-6',
      type: 'input',
      text: 'If $\\tan\\theta = 2$ and $\\theta$ is in QI, find $\\sec\\theta$.',
      answer: '\\sqrt{5}',
      hints: ['Use $\\sec^2\\theta = 1 + \\tan^2\\theta$.', '$\\sec^2\\theta = 1+4=5$, so $\\sec\\theta = \\sqrt{5}$ (positive in QI).'],
      reviewSection: 'Math tab — Pythagorean identity',
    },
    {
      id: 'q-trig-ratios-7',
      type: 'choice',
      text: 'Why does $\\sin 30° = \\cos 60°$?',
      options: [
        'Because they are complementary angles, and sine of one equals cosine of the other.',
        'Because both equal $\\sqrt{3}/2$.',
        'Because both are in the first quadrant.',
        'Because the tangent of 45° equals 1.',
      ],
      answer: 'Because they are complementary angles, and sine of one equals cosine of the other.',
      hints: ['$30° + 60° = 90°$ — they are complementary.', 'The co-function identity states $\\sin\\theta = \\cos(90°-\\theta)$, which directly gives $\\sin 30°=\\cos 60°$.'],
      reviewSection: 'Intuition tab — the co-function symmetry',
    },
    {
      id: 'q-trig-ratios-8',
      type: 'input',
      text: 'If $\\cot\\theta = -7/24$ and $\\cos\\theta > 0$, find $\\sin\\theta$.',
      answer: '-\\frac{24}{25}',
      hints: ['$\\cot < 0$ and $\\cos > 0$ places $\\theta$ in QIV. Find opp and adj from cot.', 'adj = 7, opp = -24 (QIV). hyp $= \\sqrt{49+576}=25$. $\\sin = -24/25$.'],
      reviewSection: 'Examples tab — reciprocal reconstruction',
    },
    {
      id: 'q-trig-ratios-9',
      type: 'choice',
      text: 'The reference angle for $315°$ is:',
      options: ['$45°$', '$135°$', '$60°$', '$30°$'],
      answer: '$45°$',
      hints: ['The reference angle is the acute angle between the terminal side and the nearest x-axis.', '$360°-315°=45°$. The terminal side is in QIV, 45° from the positive x-axis.'],
      reviewSection: 'Math tab — unit circle definition',
    },
    {
      id: 'q-trig-ratios-10',
      type: 'input',
      text: 'Prove using definitions: $\\tan\\theta \\cdot \\cos\\theta = \\sin\\theta$.',
      answer: '\\tan\\theta \\cdot \\cos\\theta = \\frac{\\sin\\theta}{\\cos\\theta} \\cdot \\cos\\theta = \\sin\\theta',
      hints: ['Replace $\\tan\\theta = \\sin\\theta/\\cos\\theta$.', 'The $\\cos\\theta$ cancels, leaving $\\sin\\theta$.'],
      reviewSection: 'Intuition tab — reciprocal pairs',
    },
  ],
}
