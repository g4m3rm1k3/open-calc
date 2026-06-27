import concavityUrl from '../diagrams/calc-concavity.svg?url';
export default {
  id: 'ch3-concavity-second-derivative-test',
  slug: 'concavity-second-derivative-test',
  chapter: 3,
  order: 4,
  title: 'Concavity & The Second Derivative Test',
  subtitle: 'Bowl up or dome down — using f\'\'  to classify extrema and find inflection points',
  tags: ['concavity', 'second-derivative-test', 'inflection-points', 'concave-up', 'concave-down', 'f-double-prime', 'curve-analysis'],

  hook: {
    question: 'Unemployment is falling — is that good news? It depends on whether it is falling faster or slower.',
    realWorldContext: 'If unemployment is falling but falling more slowly each month, the unemployment rate has a negative derivative (it is decreasing — good), but a POSITIVE second derivative (the rate of decrease is itself slowing down — less good). In physics, an object landing softly is near the minimum of its velocity — the derivative is zero and the second derivative is positive. The second derivative tells you not just where a quantity is, but whether its rate of change is speeding up or slowing down. It is the difference between recovering and recovering faster.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'We already know: f\'(x) is the slope of f at each point. The sign of f\'(x) tells us whether f is rising or falling.',
          'The second derivative f\'\'(x) is the slope of f\'(x) — it tells us whether the SLOPE ITSELF is increasing or decreasing.',
          '**Concave up (∪ shape)**: the slope is getting MORE positive from left to right. Think of a bowl — as you move right, the sides tilt more steeply upward. Tangent lines are all BELOW the curve.',
          '**Concave down (∩ shape)**: the slope is getting LESS positive (more negative). Think of a hill — as you move right, the sides tilt more steeply downward. Tangent lines are all ABOVE the curve.',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'intuition',
          title: 'f\'\' Controls Concavity — The Connection',
          body: 'f\'\'(x) > 0  →  f\'(x) is increasing  →  slope tilts more upward  →  CONCAVE UP  (∪)\nf\'\'(x) < 0  →  f\'(x) is decreasing  →  slope tilts more downward  →  CONCAVE DOWN  (∩)\n\nMemory: positive second derivative = happy face 😊 = bowl shape (∪).\nNegative second derivative = sad face 🙁 = dome shape (∩).',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'Concavity and the Second Derivative',
        mathBridge: 'Where f\'\' > 0, the curve bends upward. Where f\'\' < 0, it bends downward. The sign of f\'\' is a concavity map for f.',
        caption: 'Yellow = concave up (f\'\' > 0). Blue = concave down (f\'\' < 0). The boundary between regions is an inflection point.',
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Inflection Point',
          body: 'A point $(c, f(c))$ is an **inflection point** if:\n1. $f$ is continuous at $c$, AND\n2. The concavity CHANGES at $c$ (from ∪ to ∩, or from ∩ to ∪)\n\nA necessary condition: $f\'\'(c) = 0$ or $f\'\'(c)$ does not exist.\nBut this is NOT sufficient — $f\'\'(c) = 0$ alone does not guarantee an inflection point.\nYou must verify that the concavity actually changes.',
        },
      },
      { type: 'image', src: concavityUrl, alt: 'Two panels: concave up (f″ > 0) and concave down (f″ < 0)', caption: 'f″ > 0 means the slope is increasing (cup up); f″ < 0 means the slope is decreasing (cup down).' },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Concavity Test',
          body: 'If $f\'\'(x) > 0$ for all $x \\in (a,b)$: $f$ is concave UP on $(a,b)$ \\\\ If $f\'\'(x) < 0$ for all $x \\in (a,b)$: $f$ is concave DOWN on $(a,b)$',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**How to compute f\'\'(x) — you differentiate f\'(x) using the same rules:**',
          '',
          'Here is a complete example. Let f(x) = x³ − 3x.',
          '',
          '**Step 1: Compute f\'(x).**',
          'Power rule (d/dx[xⁿ] = nxⁿ⁻¹ on each term):',
          '  f\'(x) = 3x² − 3',
          '',
          '**Step 2: Compute f\'\'(x) by differentiating f\'(x).**',
          'f\'(x) = 3x² − 3. Apply the power rule again:',
          '  f\'\'(x) = 6x − 0 = 6x',
          '',
          '**Step 3: Analyze the sign of f\'\'(x).**',
          '  f\'\'(x) = 6x > 0 when x > 0  →  concave UP on (0, ∞)',
          '  f\'\'(x) = 6x < 0 when x < 0  →  concave DOWN on (−∞, 0)',
          '  f\'\'(0) = 0 and concavity changes at x = 0  →  inflection point at (0, 0)',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'Computing f\'\' When f\' Involves a Product — Use the Product Rule Again',
          body: 'If f\'(x) is a product (something)·(something else), differentiate it using the product rule: d/dx[u·v] = u\'v + uv\'.\n\nExample: find f\'\'(x) for f(x) = x·sin x\n  f\'(x) = sin x + x·cos x   [product rule: (x)\'·sin x + x·(sin x)\']\n  f\'\'(x) = d/dx[sin x + x cos x]\n         = cos x + (cos x + x·(−sin x))\n         = cos x + cos x − x sin x\n         = 2cos x − x sin x\n\nThe same rules apply every time — just applied to f\'(x) instead of f(x).',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Second Derivative Test (SDT)',
          body: 'Let $c$ be a critical point where $f\'(c) = 0$.\n\n• $f\'\'(c) > 0$: the graph is a **bowl** at $c$ → **local MINIMUM**\n• $f\'\'(c) < 0$: the graph is a **dome** at $c$ → **local MAXIMUM**\n• $f\'\'(c) = 0$: the test is **INCONCLUSIVE** — use the First Derivative Test instead',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'Why the SDT Makes Sense — Visualized',
          body: 'At a critical point c, f\'(c) = 0 — the tangent line is horizontal.\n\nCase f\'\'(c) > 0: the graph bends upward (concave up) at that point.\nA horizontal tangent at the bottom of a bowl = local MINIMUM.\n\nCase f\'\'(c) < 0: the graph bends downward (concave down) at that point.\nA horizontal tangent at the top of a dome = local MAXIMUM.\n\nImagine balancing a ball on the curve: at a local min (bowl), the ball stays. At a local max (dome), it rolls off.',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'tip',
          title: 'SDT vs. FDT — Choose the Right Tool',
          body: 'Use the SDT when:\n• f\'\' is easy to compute (most polynomial and trig functions)\n• f\'\'(c) ≠ 0 at the critical point (gives a definitive answer quickly)\n\nFall back to the FDT when:\n• f\'\' is hard to compute (messy rational or implicit functions)\n• f\'\'(c) = 0 (SDT fails → sign chart is the only reliable tool)\n\nBoth answer the same question, but the SDT is often a faster check.',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Inflection point checklist — always verify the SIGN CHANGE:**',
          '1. Compute f\'\'(x)',
          '2. Solve f\'\'(x) = 0 and find where f\'\'(x) DNE → these are inflection CANDIDATES',
          '3. At each candidate c, test the sign of f\'\' on each side:',
          '   • If f\'\' goes + → −: concavity changes (concave up → down) → inflection point ✓',
          '   • If f\'\' goes − → +: concavity changes (concave down → up) → inflection point ✓',
          '   • If f\'\' keeps the same sign: NOT an inflection point ✗',
          '4. Find the y-coordinate: compute f(c)',
          '',
          '**The counterexample everyone gets wrong:** f(x) = x⁴',
          'f\'(x) = 4x³, f\'\'(x) = 12x². At x = 0: f\'\'(0) = 0.',
          'But 12x² ≥ 0 for ALL x. The sign NEVER changes — f is concave up everywhere.',
          'x = 0 is a local MINIMUM, not an inflection point.',
        ],
      },
    ],
  },

  rigor: {
    prose: [
      '**Full proof of the Second Derivative Test (case f\'\'(c) > 0 → local min):**',
      'Suppose f\'(c) = 0 and f\'\'(c) > 0. By the definition of f\'\'(c):',
      'f\'\'(c) = lim(h→0) [f\'(c+h) − f\'(c)] / h = lim(h→0) f\'(c+h) / h  (since f\'(c) = 0)',
      'Since this limit is f\'\'(c) > 0, for all sufficiently small h:  f\'(c+h)/h > 0.',
      '• For h > 0 (just right of c): f\'(c+h) > 0  →  f is increasing just right of c',
      '• For h < 0 (just left of c):  f\'(c+h) < 0  →  f is decreasing just left of c',
      'So f\' changes from − to + at c → by the First Derivative Test → local minimum. ■',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Summary Table',
        body: '\\begin{array}{c|c|l} f\'(c) & f\'\'(c) & \\text{Conclusion} \\\\ \\hline 0 & > 0 & \\text{Local minimum (bowl)} \\\\ 0 & < 0 & \\text{Local maximum (dome)} \\\\ 0 & 0 & \\text{Inconclusive — use FDT} \\\\ \\neq 0 & \\text{any} & \\text{Not an extremum} \\end{array}',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-concavity-full',
      title: 'Complete Concavity Analysis — Inflection Points Step by Step',
      problem: 'Find all intervals of concavity and all inflection points for f(x) = x⁴ − 6x² + 1.',
      steps: [
        {
          expression: 'f\'(x) = 4x^3 - 12x',
          annotation: 'Power rule on each term: d/dx[x⁴] = 4x³, d/dx[−6x²] = −12x, d/dx[1] = 0.',
        },
        {
          expression: 'f\'\'(x) = 12x^2 - 12',
          annotation: 'Differentiate f\'(x) with the power rule: d/dx[4x³] = 12x², d/dx[−12x] = −12.',
        },
        {
          expression: 'f\'\'(x) = 12(x^2 - 1) = 12(x-1)(x+1)',
          annotation: 'Factor out 12 and then factor the difference of squares: x² − 1 = (x−1)(x+1).',
        },
        {
          expression: 'f\'\'(x) = 0 \\implies x = \\pm 1',
          annotation: '12(x−1)(x+1) = 0 when x = 1 or x = −1. These are the inflection candidates.',
        },
        {
          expression: '\\textbf{Three intervals: } (-\\infty,-1),\\;(-1,1),\\;(1,\\infty)',
          annotation: 'The two candidates split the line into three regions.',
        },
        {
          expression: 'x < -1: \\text{test } x=-2: f\'\'(-2) = 12(4-1) = 36 > 0 \\;\\to\\; \\text{concave UP}',
          annotation: 'Both factors (x−1) and (x+1) are negative at x = −2 → product is positive.',
        },
        {
          expression: '-1 < x < 1: \\text{test } x=0: f\'\'(0) = 12(0-1) = -12 < 0 \\;\\to\\; \\text{concave DOWN}',
          annotation: '(x−1) = −1 < 0, (x+1) = 1 > 0 → product is negative.',
        },
        {
          expression: 'x > 1: \\text{test } x=2: f\'\'(2) = 12(4-1) = 36 > 0 \\;\\to\\; \\text{concave UP}',
          annotation: 'Both factors positive → product positive.',
        },
        {
          expression: 'f\'\' \\text{ changes sign at } x = -1 \\text{ and } x = 1 \\implies \\text{both ARE inflection points}',
          annotation: 'At x = −1: concavity goes UP → DOWN. At x = 1: DOWN → UP. Both confirmed.',
        },
        {
          expression: 'f(-1) = (-1)^4 - 6(-1)^2 + 1 = 1 - 6 + 1 = -4',
          annotation: 'Compute the y-coordinates. (−1)⁴ = 1, (−1)² = 1.',
        },
        {
          expression: 'f(1) = 1 - 6 + 1 = -4',
          annotation: 'By symmetry (f is even), f(1) = f(−1) = −4.',
        },
      ],
      conclusion: 'Concave up on (−∞, −1) and (1, ∞). Concave down on (−1, 1). Inflection points at (−1, −4) and (1, −4). The graph has a "W" shape — two local minima connected by an arch.',
    },
    {
      id: 'ex-sdt-classify',
      title: 'Using the SDT to Classify Critical Points — Full Walkthrough',
      problem: 'Find and classify all critical points of f(x) = x³ − 3x + 2 using the Second Derivative Test.',
      steps: [
        {
          expression: 'f\'(x) = 3x^2 - 3',
          annotation: 'Power rule: d/dx[x³] = 3x², d/dx[−3x] = −3, d/dx[2] = 0.',
        },
        {
          expression: '3x^2 - 3 = 0 \\implies x^2 = 1 \\implies x = \\pm 1',
          annotation: 'Add 3 to both sides, divide by 3, take square root. Two critical points.',
        },
        {
          expression: 'f\'\'(x) = 6x',
          annotation: 'Differentiate f\'(x) = 3x² − 3: d/dx[3x²] = 6x, d/dx[−3] = 0.',
        },
        {
          expression: 'f\'\'(-1) = 6(-1) = -6 < 0',
          annotation: 'Plug x = −1 into f\'\'(x) = 6x. Negative → SDT says local MAXIMUM.',
        },
        {
          expression: 'f(-1) = (-1)^3 - 3(-1) + 2 = -1 + 3 + 2 = 4',
          annotation: 'Find the y-value: compute f at the critical point. Local max at (−1, 4).',
        },
        {
          expression: 'f\'\'(1) = 6(1) = 6 > 0',
          annotation: 'Plug x = 1 into f\'\'(x) = 6x. Positive → SDT says local MINIMUM.',
        },
        {
          expression: 'f(1) = 1 - 3 + 2 = 0',
          annotation: 'Local min at (1, 0).',
        },
      ],
      conclusion: 'Local maximum at (−1, 4) — f\'\' is negative (dome shape). Local minimum at (1, 0) — f\'\' is positive (bowl shape). The SDT worked cleanly here because f\'\'(±1) ≠ 0.',
    },
    {
      id: 'ex-sdt-inconclusive',
      title: 'When the SDT Fails — Falling Back to the Sign Chart',
      problem: 'Classify the critical point of f(x) = x⁴ at x = 0. Show that the SDT fails, then use the FDT.',
      steps: [
        {
          expression: 'f\'(x) = 4x^3',
          annotation: 'Power rule.',
        },
        {
          expression: '4x^3 = 0 \\implies x = 0 \\quad\\text{(only critical point)}',
          annotation: '',
        },
        {
          expression: 'f\'\'(x) = 12x^2',
          annotation: 'Differentiate f\'(x) = 4x³: power rule gives 12x².',
        },
        {
          expression: 'f\'\'(0) = 12(0)^2 = 0',
          annotation: 'SDT is INCONCLUSIVE. f\'\' = 0 at the critical point — the test cannot tell us anything. We need the sign chart.',
        },
        {
          expression: '\\textbf{Sign chart for } f\'(x) = 4x^3:',
          annotation: 'Test the sign of f\'(x) on each side of x = 0.',
        },
        {
          expression: 'x < 0: f\'(x) = 4x^3 < 0 \\;(\\downarrow) \\qquad x > 0: f\'(x) = 4x^3 > 0 \\;(\\uparrow)',
          annotation: 'For x < 0: x³ is negative, so 4x³ < 0. For x > 0: x³ is positive, so 4x³ > 0.',
        },
        {
          expression: 'f\' \\text{ changes } - \\to + \\text{ at } x=0 \\implies \\textbf{local MINIMUM}',
          annotation: 'Falling before c, rising after c → valley → local minimum.',
        },
        {
          expression: 'f(0) = 0^4 = 0 \\implies \\text{local (and absolute) min at } (0, 0)',
          annotation: 'x⁴ ≥ 0 for all x, confirming this is also the global minimum.',
        },
      ],
      conclusion: 'The SDT gave f\'\'(0) = 0 — inconclusive. But the sign chart confirmed x = 0 is a local minimum. When the SDT fails, always reach for the sign chart. The two methods are complementary, not competing.',
    },
  ],

  challenges: [
    {
      id: 'ch3-sdt-c1',
      difficulty: 'easy',
      problem: 'Find the inflection point(s) of f(x) = xe^{−x}.',
      hint: 'Use the product rule to get f\', then the product rule again to get f\'\'. Set f\'\' = 0 and check the sign change.',
      walkthrough: [
        { expression: 'f\'(x) = (x)\'e^{-x} + x(e^{-x})\' = e^{-x} + x(-e^{-x}) = e^{-x}(1-x)', annotation: 'Product rule with u = x, v = e^{−x}. Derivative of e^{−x}: chain rule gives e^{−x}·(−1) = −e^{−x}.' },
        { expression: 'f\'\'(x) = (e^{-x})\'(1-x) + e^{-x}(1-x)\'', annotation: 'Product rule on f\'(x) = e^{−x}(1−x). Now u = e^{−x}, v = (1−x).' },
        { expression: '= (-e^{-x})(1-x) + e^{-x}(-1) = e^{-x}[-(1-x)-1] = e^{-x}(x-2)', annotation: 'Factor out e^{−x}. Simplify: −(1−x)−1 = −1+x−1 = x−2.' },
        { expression: 'f\'\'(x) = 0 \\implies x = 2 \\quad (e^{-x} > 0 \\text{ always})', annotation: 'e^{−x} is never zero, so x − 2 = 0 → x = 2.' },
        { expression: 'x < 2: f\'\' < 0 \\;(\\cap) \\qquad x > 2: f\'\' > 0 \\;(\\cup)', annotation: 'Sign changes → inflection point confirmed.' },
        { expression: 'f(2) = 2e^{-2} \\qquad \\text{Inflection point: }(2,\\;2e^{-2}) \\approx (2,\\;0.27)', annotation: '' },
      ],
      answer: 'Inflection point at (2, 2e⁻²)',
    },
    {
      id: 'ch3-sdt-c2',
      difficulty: 'hard',
      problem: 'Build a function with inflection points at x = 0 and x = 2, and a local minimum at x = 1.',
      hint: 'Design f\'\'(x) so it changes sign at x = 0 and x = 2. Then integrate twice to recover f.',
      walkthrough: [
        { expression: '\\text{Goal: } f\'\' \\text{ changes sign at } 0 \\text{ and } 2.', annotation: '' },
        { expression: '\\text{Try: } f\'\'(x) = x(x-2) = x^2-2x', annotation: 'A parabola that crosses zero at 0 and 2 and changes sign at each. For x < 0: (neg)(neg) > 0. For 0 < x < 2: (pos)(neg) < 0. For x > 2: (pos)(pos) > 0. Concavity changes at both points. ✓' },
        { expression: 'f\'(x) = \\int (x^2 - 2x)\\,dx = \\frac{x^3}{3} - x^2 + C', annotation: 'Integrate term by term using the power rule for integrals: ∫xⁿ dx = xⁿ⁺¹/(n+1).' },
        { expression: 'f\'(1) = 0 \\text{ (want local min at } x=1\\text{)}: \\frac{1}{3} - 1 + C = 0 \\implies C = \\frac{2}{3}', annotation: 'Set f\'(1) = 0 and solve for C.' },
        { expression: 'f(x) = \\int f\'\\,dx = \\frac{x^4}{12} - \\frac{x^3}{3} + \\frac{2x}{3} + D', annotation: 'Integrate again. D is a free constant — any value works.' },
      ],
      answer: 'f(x) = x⁴/12 − x³/3 + 2x/3 + D for any constant D.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'first-derivative-test', label: 'Prerequisite & Fallback: First Derivative Test', context: 'When the SDT gives f\'\'(c) = 0, you MUST use the FDT sign chart.' },
    { lessonSlug: 'higher-order-derivatives', label: 'Prerequisite: Higher-Order Derivatives', context: 'Concavity requires computing f\'\'(x) — the second derivative.' },
    { lessonSlug: 'curve-sketching', label: 'Next: Full Curve Sketching', context: 'Concavity analysis (SDT + inflection points) is step 4 of the complete curve-sketching process.' },
    { lessonSlug: 'optimization', label: 'Applied: Optimization', context: 'The SDT is often the fastest way to confirm a critical point is a minimum in applied problems.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'f\'\'(x) < 0 on an interval. How does the graph of f look there?',
      options: [
        'f is decreasing — a negative second derivative means the function goes down',
        'f is concave down — the slope f\' is decreasing, so the graph curves like an inverted bowl (dome shape)',
        'f is decreasing and concave up — the two signs indicate independent properties that combine',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What is an inflection point?',
      options: [
        'A point where f\'\' = 0 — any zero of the second derivative is automatically an inflection point',
        'A point where the concavity changes — f\'\'  changes sign (positive to negative or vice versa). f\'\'  = 0 is a necessary condition but not sufficient; the sign must actually change',
        'A point where f\' = 0 and f\'\' ≠ 0 — these are the points where the slope is zero but the function curves away',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The Second Derivative Test: f\'(2) = 0 and f\'\'(2) = −5. What can you conclude?',
      options: [
        'f has a local minimum at x = 2 — negative second derivative at a critical point indicates a minimum',
        'f has a local maximum at x = 2 — f\'\'(2) < 0 means the graph is concave down at x = 2, so the critical point is a peak',
        'The test is inconclusive — a zero first derivative with negative second derivative could be either a max or inflection point',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'f\'(0) = 0 and f\'\'(0) = 0. What does the Second Derivative Test conclude?',
      options: [
        'Local minimum — f\'\' = 0 means zero concavity, which is the boundary case of concave up',
        'Inflection point — when f\'\' = 0, the concavity is zero, indicating an inflection point rather than an extremum',
        'The test is inconclusive — f\'\'(0) = 0 means the SDT gives no information; you need to use the First Derivative Test or higher-order derivatives',
      ],
      correct: 2,
    },
  ],
}
