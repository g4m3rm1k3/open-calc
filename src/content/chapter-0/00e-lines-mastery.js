export default {
  id: 'lines-mastery',
  slug: 'lines-mastery',
  title: 'The Master Line Reference: From Physical Intuition to Derivatives',
  tags: ['algebra', 'foundation', 'lines', 'slope', 'reference', 'calculus-preview'],
  chapter: 0,
  order: 3,

  hook: {
    question: 'How do you define a bridge before it\'s built?',
    realWorldContext: `Almost every problem in Calculus—optimization, linearization, rates of growth—eventually boils down to a line. 
If you can master the construction of a line from any given data (points, slopes, or equations), you have mastered the "Zoom-In" logic of the universe.`,
  },

  mentalModel: [
    'Line = Constant Sensitivity (Delta-y / Delta-x is fixed)',
    'Tangent = The "Best Linear Prediction" of a curve at a point',
    'Normal = The "Orthogonal Path" (90° from Tangent)',
    'Integral = Sum of all tiny vertical Delta-y steps along x'
  ],

  intuition: {
    semantics: {
      core: [
        { symbol: 'm', meaning: 'slope (the fixed rate of change)' },
        { symbol: '(x0, y0)', meaning: 'the anchor point you are at right now' },
        { symbol: '\\Delta y / \\Delta x', meaning: 'rise over run, the first principles of slope' },
        { symbol: 'y - y0 = m(x - x0)', meaning: 'Point-Slope Form: the Calculus-ready line formula' },
      ]
    },

    prose: [
      `This lesson is your permanent reference hub. Whether you are finding the "Normal Line" to a curve or the "Tangent to a Circle," the algebra is always the same: **Find a point, find a slope, and anchor them together.**`,
      `The key insight of Calculus is that for a brief moment, **every smooth function behaves exactly like a line.** This is why lines are the atomic units of complex analysis.`,
    ],

    visualizations: [
      {
        id: 'LineFoundationsLab',
        title: 'The Master Lab: Lines from First Principles',
        caption: 'Toggle between modes to see Parallel, Perpendicular, and Tangent lines. Drag points to observe real-time equation updates.',
        note: 'Graph is interactive, but the formulas and context above guide your understanding.'
      }
    ],
  },

  math: {
    processDefinition: [
      '1. Start with Physical Intuition (Slope as Rate)',
      '2. Define Slope via First Principles (Delta-y / Delta-x)',
      '3. Point-Slope Form: Anchor to a specific point',
      '4. Parallel & Perpendicular logic',
      '5. Geometric Tangents (Circles)',
      '6. Calculus Tangents (Zoom-In Preview)',
      '7. Cumulative Change (Integrals Preview)'
    ],

    callouts: [
      {
        type: 'definition',
        title: '1. Physical Intuition (Slope as Rate)',
        body: 'Slope tells you **how fast the height changes for a given horizontal distance**. Example: a wheelchair ramp with a 1/12 slope gains 1 inch vertically for every 12 inches horizontally.'
      },
      {
        type: 'insight',
        title: '2. From First Principles (Delta-y / Delta-x)',
        body: 'Slope is the **constant speed** of a line. Between any two points, $m = \\frac{\\Delta y}{\\Delta x}$ never changes. This ratio foreshadows derivatives as $\\Delta x \\to 0$.'
      },
      {
        type: 'definition',
        title: '3. Point-Slope Form: The Calculus Choice',
        body: `Most learn $y = mx + b$, but in Calculus we use **$y - y_0 = m(x - x_0)$**. We usually know our exact location ($x_0, y_0$) and velocity ($m = f'(x_0)$). This formula is "Plug-and-Play".`
      },
      {
        type: 'insight',
        title: '4. Parallel & Perpendicular Rules',
        body: `
- **Parallel**: Same slope ($m_1 = m_2$)
- **Perpendicular**: Negative reciprocal ($m_2 = -1 / m_1$)
- **Verification**: $m_1 \\cdot m_2 = -1$ confirms a perfect 90° intersection
`
      },
      {
        type: 'definition',
        title: '5. Tangents to Curve (f\'(x))',
        body: `
To find a tangent line:
1. **Slope**: $m = f'(x_0)$
2. **Point**: $y_0 = f(x_0)$
3. **Build**: $y - y_0 = f'(x_0)(x - x_0)$
`
      },
      {
        type: 'insight',
        title: '6. Tangents to Circle',
        body: 'Unique case: tangent is **perpendicular** to the radius. Knowing the center and touchpoint gives a simple perpendicular slope problem.'
      },
      {
        type: 'tip',
        title: '7. The Integral Connection',
        body: 'Moving along a ramp of slope $m$, total height lost is sum of tiny vertical steps ($\\Delta y = m \\Delta x$). This sum is exactly the **integral** as cumulative change.'
      }
    ]
  },

  rigor: {
    title: 'Formal Proof of Perpendicular Slopes',
    prose: [
      'Two lines are perpendicular iff the product of their slopes is -1. Geometrically, a 90° rotation swaps "rise" and "run" and reverses one direction.'
    ],
    proofSteps: [
      { expression: "L_1: y = m_1x + b", annotation: 'Base line equation' },
      { expression: "L_2: y = (-1/m_1)x + c", annotation: 'Perpendicular candidate' },
      { expression: "m_1 \\cdot (-1/m_1) = -1", annotation: 'Slopes satisfy perpendicularity' },
    ]
  },

  pedagogicalNote: {
    summary: 'Return to this hub whenever you encounter a "Finding the Line" problem in Calculus.',
    callouts: [
      '**Derivatives**: Tangents always follow Point-Slope logic.',
      '**Integrals**: Slope and distance combine to form accumulation areas.'
    ]
  }
};