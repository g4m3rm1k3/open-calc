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
      'In a right triangle, the six trig ratios are just the six ways to form a fraction from the three side lengths. With sides labelled relative to an acute angle $\\theta$: opposite (opp), adjacent (adj), hypotenuse (hyp), the six ratios are $\\sin = \\text{opp/hyp}$, $\\cos = \\text{adj/hyp}$, $\\tan = \\text{opp/adj}$, and their reciprocals $\\csc = \\text{hyp/opp}$, $\\sec = \\text{hyp/adj}$, $\\cot = \\text{adj/opp}$.',
      'The "co" prefix means complementary. The co-sine of an angle is the sine of its complement: $\\cos\\theta = \\sin(90°-\\theta)$. Similarly $\\cot\\theta = \\tan(90°-\\theta)$ and $\\csc\\theta = \\sec(90°-\\theta)$. This is why co-functions appear in pairs — they share the same values, just on opposite angles of the same right triangle.',
      'These ratios are well-defined because of similar triangles. Every right triangle with a given acute angle $\\theta$ is similar to every other — same angles, just different scale. The ratio opposite/hypotenuse is the same for all of them. That common ratio is exactly what we call $\\sin\\theta$. The ratio does not depend on the size of the triangle.',
    ],
    callouts: [
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
    ],
    visualizations: [
      {
        id: 'TrigRatiosViz',
        title: 'All Six Ratios — One Draggable Triangle',
        mathBridge: 'Drag the angle slider. All six trig ratios update. Watch how the ratio stays constant when you scale the triangle — proving similar triangles underlie everything.',
        caption: 'The ratio is the number. The triangle size is irrelevant.',
      },
      { id: 'VideoCarousel', title: 'Trigonometric Ratios', props: { videos: [
          { url: "", title: 'TR-13 — The Trigonometric Ratios' },
          { url: "", title: 'TR-13Z — How the Co- Functions Got Their Names' },
        ]},
      },
      { id: 'VideoEmbed', title: 'TR-14: The Unit Circle', props: { url: "" } },
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
        type: 'mnemonic',
        title: 'ASTC — which functions are positive in each quadrant',
        body: '\\text{QI: All positive} \\quad \\text{QII: Sin (and csc) positive} \\\\ \\text{QIII: Tan (and cot) positive} \\quad \\text{QIV: Cos (and sec) positive} \\\\ \\text{"All Students Take Calculus" or "Add Sugar To Coffee"}',
      },
    ],
    visualizations: [
      {
        id: 'UnitCircleFullViz',
        title: 'All Six Trig Functions on the Unit Circle',
        mathBridge: 'Drag the angle and see all six values update. The geometric lengths on and around the circle ARE the trig values — not just numbers.',
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
        },
        {
          expression: '\\sin = \\frac{3}{5}, \\; \\cos = \\frac{4}{5}, \\; \\tan = \\frac{3}{4}',
          annotation: 'The three primary ratios.',
        },
        {
          expression: '\\csc = \\frac{5}{3}, \\; \\sec = \\frac{5}{4}, \\; \\cot = \\frac{4}{3}',
          annotation: 'The three reciprocals — flip each primary ratio.',
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
        },
        {
          expression: '\\cos(225°) = -\\cos(45°) = -\\frac{\\sqrt{2}}{2}',
          annotation: 'QIII: cos is negative. Reference angle is $225°-180°=45°$.',
        },
        {
          expression: '\\tan(300°) = -\\tan(60°) = -\\sqrt{3}',
          annotation: 'QIV: tan is negative. Reference angle is $360°-300°=60°$.',
        },
      ],
      conclusion: 'Reference angle method: (1) find which quadrant, (2) find the reference angle (acute angle to the x-axis), (3) apply the ASTC sign rule.',
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
  ],

  calcBridge: {
    teaser: 'The six trig functions and their reciprocal relationships appear throughout calculus. The identity $\\sec^2\\theta = 1 + \\tan^2\\theta$ is used in trig substitution. The co-function identities explain why $\\frac{d}{dx}\\cos x = -\\sin x$ has the negative sign. Understanding which functions are positive in which quadrant is essential for correctly evaluating definite integrals involving trig substitution.',
    linkedLessons: ['trig-identities-deep-dive', 'trig-in-calculus'],
  },
}
