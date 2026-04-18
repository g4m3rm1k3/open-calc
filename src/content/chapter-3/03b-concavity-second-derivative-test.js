export default {
  id: 'ch3-concavity-second-derivative-test',
  slug: 'concavity-second-derivative-test',
  chapter: 3,
  order: 4,
  title: 'Concavity & The Second Derivative Test',
  subtitle: 'Bowl up or dome down — using f\'\'  to classify extrema and find inflection points',
  tags: ['concavity', 'second-derivative-test', 'inflection-points', 'concave-up', 'concave-down', 'f-double-prime', 'curve-analysis'],

  hook: {
    question: 'Unemployment is falling — is that good news? It depends on whether it\'s falling faster or slower.',
    realWorldContext:
      'If unemployment is falling but falling more slowly each month, the derivative of the unemployment rate is negative (good) ' +
      'but the second derivative is positive (slowing down — less good). ' +
      'Economists call this "disinflation" vs. "deflation." ' +
      'In physics, an object slowing down as it lands is near a minimum of velocity — f\' = 0, f\'\' > 0. ' +
      'The second derivative tells you not just where a quantity is, ' +
      'but whether its CHANGE is itself accelerating or decelerating. ' +
      'It\'s the difference between "recovering" and "recovering faster" — a critical distinction.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Concavity describes the shape of a curve — specifically, which way it "bends."',
          '**Concave up** (∪ shape): the function curves upward. Tangent lines are BELOW the curve. ' +
          'Think of a bowl: water collects in the bottom. The slope (f\') is increasing from left to right.',
          '**Concave down** (∩ shape): the function curves downward. Tangent lines are ABOVE the curve. ' +
          'Think of a hill: the slope (f\') is decreasing from left to right.',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'intuition',
          title: 'f\'\' Controls Concavity',
          body: 'f\'\'(x) > 0  →  f\' is increasing  →  concave UP  (slope tilting more positive)\n' +
                'f\'\'(x) < 0  →  f\' is decreasing  →  concave DOWN  (slope tilting more negative)\n\n' +
                'Memory trick: f\'\' looks like "two frowns → concave down" or think: positive = happy = U-shaped (concave up).',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'Concavity and the Second Derivative',
        mathBridge:
          'Where f\'\' > 0, the curve bends upward. Where f\'\' < 0, it bends downward. ' +
          'Where f\'\' changes sign, there is an inflection point.',
        caption: 'Drag along the curve. The sign of f\'\' controls the concavity in each region. ' +
                 'Yellow region = concave up, blue = concave down.',
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Inflection Point',
          body: 'A point $(c, f(c))$ is an **inflection point** if $f$ is continuous at $c$ AND the concavity changes at $c$ (from up to down, or from down to up).\n\n' +
                'Necessary (but not sufficient) condition: $f\'\'(c) = 0$ or $f\'\'(c)$ DNE.',
        },
      },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Concavity Test',
          body: '\\text{If } f\'\'(x) > 0 \\text{ on } (a,b) \\Rightarrow f \\text{ is concave UP on } (a,b) \\\\ \\text{If } f\'\'(x) < 0 \\text{ on } (a,b) \\Rightarrow f \\text{ is concave DOWN on } (a,b)',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Second Derivative Test',
          body: '\\text{Let } f\'(c) = 0 \\text{ (c is a critical point).} \\\\ f\'\'(c) > 0 \\Rightarrow \\text{local MINIMUM at } c \\text{ (concave up = bowl)} \\\\ f\'\'(c) < 0 \\Rightarrow \\text{local MAXIMUM at } c \\text{ (concave down = dome)} \\\\ f\'\'(c) = 0 \\Rightarrow \\text{INCONCLUSIVE — use the First Derivative Test}',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'Why the Second Derivative Test Makes Sense',
          body: 'At a critical point c (f\'(c) = 0, tangent line is horizontal):\n' +
                '• If f\'\'(c) > 0: the function is concave UP here. A bowl with a horizontal tangent at the bottom must be a LOCAL MIN.\n' +
                '• If f\'\'(c) < 0: concave DOWN. A dome with a horizontal tangent at the top must be a LOCAL MAX.\n' +
                '• If f\'\'(c) = 0: could be an inflection point, or a max/min — more information needed.',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'tip',
          title: 'First vs. Second Derivative Test — When to Use Each',
          body: '**Use the Second Derivative Test when:**\n' +
                '• f\'\' is easy to compute\n' +
                '• f\'\'(c) ≠ 0 at your critical point (gives a definitive answer)\n\n' +
                '**Use the First Derivative Test when:**\n' +
                '• f\'\' is messy or hard to compute\n' +
                '• f\'\'(c) = 0 (SDT is inconclusive)\n' +
                '• You need intervals of increase/decrease anyway (like for curve sketching)\n\n' +
                'Both tests answer the same question: is a critical point a max, min, or neither?',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Procedure for Finding Inflection Points:**',
          '1. Compute f\'\'(x)',
          '2. Find candidates: all x where f\'\'(x) = 0 or f\'\'(x) DNE (and f is continuous there)',
          '3. Test concavity on each side of each candidate',
          '4. If f\'\' changes sign: inflection point. If not: no inflection point.',
          '**Warning**: f\'\'(c) = 0 does NOT automatically mean inflection point. ' +
          'f(x) = x⁴ has f\'\'(0) = 0 but x = 0 is a local minimum (concave up on both sides — no sign change).',
        ],
      },
    ],
  },

  rigor: {
    prose: [
      '**Counterexample to "f\'\'(c) = 0 → inflection point":**',
      'f(x) = x⁴. f\'(x) = 4x³, f\'\'(x) = 12x². f\'\'(0) = 0. ' +
      'But f\'\'(x) = 12x² ≥ 0 for ALL x. Concavity never changes sign. ' +
      'f is concave up everywhere — x = 0 is an absolute minimum, not an inflection point.',
      '**The full SDT proof:** At c with f\'(c) = 0 and f\'\'(c) > 0:',
      'By definition of f\'\'(c): f\'\'(c) = lim(h→0) [f\'(c+h) − f\'(c)] / h = lim(h→0) f\'(c+h) / h (since f\'(c) = 0). ' +
      'If f\'\'(c) > 0, then for small h, f\'(c+h)/h > 0. ' +
      'For h > 0 (right): f\'(c+h) > 0. For h < 0 (left): f\'(c+h) < 0. ' +
      'So f\' changes from − to + at c → local minimum by the First Derivative Test. ■',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Key Summary Table',
        body: '\\begin{array}{cc|cc} f\'(c) & f\'\'(c) & \\text{Conclusion} \\\\ \\hline 0 & > 0 & \\text{Local min} \\\\ 0 & < 0 & \\text{Local max} \\\\ 0 & 0 & \\text{Inconclusive} \\\\ \\neq 0 & \\text{any} & \\text{Not an extremum} \\end{array}',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-concavity-cubic',
      title: 'Concavity and Inflection Points',
      problem: 'Find all intervals where $f(x) = x^4 - 6x^2 + 1$ is concave up/down, and all inflection points.',
      steps: [
        {
          expression: 'f\'(x) = 4x^3 - 12x \\qquad f\'\'(x) = 12x^2 - 12 = 12(x^2-1) = 12(x-1)(x+1)',
          annotation: 'Compute the second derivative and factor.',
        },
        {
          expression: 'f\'\'(x) = 0 \\implies x = \\pm 1',
          annotation: 'Two candidates for inflection points.',
        },
        {
          expression: 'x < -1: \\text{test } x=-2: f\'\'(-2) = 12(4-1) = 36 > 0 \\implies \\text{concave UP}',
          annotation: '',
        },
        {
          expression: '-1 < x < 1: \\text{test } x=0: f\'\'(0) = -12 < 0 \\implies \\text{concave DOWN}',
          annotation: '',
        },
        {
          expression: 'x > 1: \\text{test } x=2: f\'\'(2) = 12(4-1) = 36 > 0 \\implies \\text{concave UP}',
          annotation: '',
        },
        {
          expression: 'f\'\' \\text{ changes sign at } x=-1 \\text{ and } x=1 \\implies \\text{both are inflection points}',
          annotation: '',
        },
        {
          expression: 'f(-1) = 1 - 6 + 1 = -4 \\qquad f(1) = 1 - 6 + 1 = -4',
          annotation: 'Inflection points: (−1, −4) and (1, −4).',
        },
      ],
      conclusion: 'Concave up on (−∞, −1) and (1, ∞). Concave down on (−1, 1). Inflection points at (±1, −4). The function forms a "W" shape with two local minima.',
    },
    {
      id: 'ex-sdt-classify',
      title: 'Using the Second Derivative Test to Classify Critical Points',
      problem: 'Find and classify all critical points of $f(x) = x^3 - 3x + 2$ using the Second Derivative Test.',
      steps: [
        {
          expression: 'f\'(x) = 3x^2 - 3 = 3(x-1)(x+1) = 0 \\implies x = \\pm 1',
          annotation: 'Two critical points.',
        },
        {
          expression: 'f\'\'(x) = 6x',
          annotation: 'Compute the second derivative.',
        },
        {
          expression: 'f\'\'(-1) = 6(-1) = -6 < 0 \\implies \\text{local MAXIMUM at } x = -1',
          annotation: 'Concave down at the critical point → dome → local max.',
        },
        {
          expression: 'f(-1) = (-1)^3 - 3(-1) + 2 = -1 + 3 + 2 = 4',
          annotation: 'Value at the local max.',
        },
        {
          expression: 'f\'\'(1) = 6(1) = 6 > 0 \\implies \\text{local MINIMUM at } x = 1',
          annotation: 'Concave up → bowl → local min.',
        },
        {
          expression: 'f(1) = 1 - 3 + 2 = 0',
          annotation: '',
        },
        {
          expression: '\\text{Local max: } (-1, 4) \\qquad \\text{Local min: } (1, 0)',
          annotation: '',
        },
      ],
      conclusion: 'Local maximum of 4 at x = −1; local minimum of 0 at x = 1. The SDT gave definitive answers here because f\'\'(±1) ≠ 0.',
    },
    {
      id: 'ex-sdt-inconclusive',
      title: 'When the Second Derivative Test Fails',
      problem: 'Apply the Second Derivative Test to $f(x) = x^4$ at $x = 0$. What happens? Then classify correctly.',
      steps: [
        {
          expression: 'f\'(x) = 4x^3 = 0 \\implies x = 0 \\text{ (only critical point)}',
          annotation: '',
        },
        {
          expression: 'f\'\'(x) = 12x^2 \\qquad f\'\'(0) = 0',
          annotation: 'The Second Derivative Test is INCONCLUSIVE.',
        },
        {
          expression: '\\text{Use First Derivative Test: sign of } f\'(x) = 4x^3',
          annotation: '',
        },
        {
          expression: 'x < 0: 4x^3 < 0 \\;(\\downarrow) \\qquad x > 0: 4x^3 > 0 \\;(\\uparrow)',
          annotation: '',
        },
        {
          expression: 'f\' \\text{ changes } - \\to + \\implies \\text{local MINIMUM at } x = 0',
          annotation: 'Fall then rise → valley → local min. (It\'s also the absolute minimum: f(x) ≥ 0 = f(0).)',
        },
      ],
      conclusion: 'When f\'\'(c) = 0, always fall back to the First Derivative Test. Here x = 0 is a local (and absolute) minimum even though f\'\' = 0 there. Concavity is positive on both sides — a "flat bottom" bowl.',
    },
  ],

  challenges: [
    {
      id: 'ch3-sdt-c1',
      difficulty: 'easy',
      problem: 'Find the inflection point(s) of $f(x) = xe^{-x}$.',
      hint: 'Compute f\'\' and find where it changes sign.',
      walkthrough: [
        { expression: 'f\'(x) = e^{-x} - xe^{-x} = e^{-x}(1-x)', annotation: 'Product rule.' },
        { expression: 'f\'\'(x) = -e^{-x}(1-x) + e^{-x}(-1) = e^{-x}(x-2)', annotation: '' },
        { expression: 'f\'\'(x) = 0 \\implies x = 2 \\quad (e^{-x} > 0 \\text{ always})', annotation: '' },
        { expression: 'x < 2: f\'\' < 0 \\;(\\text{concave down}) \\qquad x > 2: f\'\' > 0 \\;(\\text{concave up})', annotation: 'Sign changes → inflection point.' },
        { expression: 'f(2) = 2e^{-2} \\qquad \\text{Inflection point: } (2, 2e^{-2})', annotation: '' },
      ],
      answer: 'Inflection point at (2, 2e⁻²) ≈ (2, 0.27)',
    },
    {
      id: 'ch3-sdt-c2',
      difficulty: 'hard',
      problem: 'Construct a function (with a formula) that has inflection points at $x = 0$ and $x = 2$, a local minimum at $x = 1$, and is continuous everywhere.',
      hint: 'Design f\'\'(x) to change at 0 and 2. Then integrate twice.',
      walkthrough: [
        { expression: '\\text{Want } f\'\'(x) = 0 \\text{ at } x=0,2 \\text{ with sign changes.}', annotation: '' },
        { expression: '\\text{Try: } f\'\'(x) = x(x-2) = x^2-2x', annotation: 'Changes sign at 0 (from − to +) and at 2 (from + to −).' },
        { expression: 'f\'(x) = \\int f\'\'\\,dx = \\frac{x^3}{3} - x^2 + C', annotation: '' },
        { expression: 'f\'(1) = 0 \\text{ (local min)}: \\frac{1}{3}-1+C=0 \\Rightarrow C = \\frac{2}{3}', annotation: '' },
        { expression: 'f\'(x) = \\frac{x^3}{3} - x^2 + \\frac{2}{3}', annotation: '' },
        { expression: 'f(x) = \\frac{x^4}{12} - \\frac{x^3}{3} + \\frac{2x}{3} + D', annotation: 'D can be any constant.' },
      ],
      answer: 'f(x) = x⁴/12 − x³/3 + 2x/3 + D (any D). Inflection at x = 0 and x = 2; local min at x = 1.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'first-derivative-test', label: 'Prerequisite: First Derivative Test', context: 'Understand how signs of f\' determine increase/decrease first.' },
    { lessonSlug: 'higher-order-derivatives', label: 'Prerequisite: Higher-Order Derivatives', context: 'Need to compute f\'\'.' },
    { lessonSlug: 'curve-sketching', label: 'Next: Curve Sketching', context: 'f\'\' analysis (concavity + inflection) is step 4 of full curve sketching.' },
    { lessonSlug: 'optimization', label: 'Applied in: Optimization', context: 'SDT used to confirm minimizers/maximizers.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
