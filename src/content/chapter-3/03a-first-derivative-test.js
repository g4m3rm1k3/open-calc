export default {
  id: 'ch3-first-derivative-test',
  slug: 'first-derivative-test',
  chapter: 3,
  order: 3,
  title: 'Increasing, Decreasing & The First Derivative Test',
  subtitle: 'Using f\' to read the full story of a function\'s direction — and classify extrema',
  tags: ['increasing', 'decreasing', 'first-derivative-test', 'critical-points', 'local-maximum', 'local-minimum', 'sign-chart', 'monotonicity'],

  hook: {
    question: 'How can you tell where a function is going up or down without plotting every point?',
    realWorldContext:
      'A cardiologist reading an EKG can identify exactly when the heart rate is increasing, when it peaks, ' +
      'and when it falls — without measuring every millisecond. ' +
      'The derivative is your EKG reader for any function. ' +
      'Where f\' > 0: the function is rising. Where f\' < 0: falling. ' +
      'Where f\' changes sign: a peak or valley. ' +
      'This is the First Derivative Test — the first systematic tool for analyzing function behavior ' +
      'and it\'s the foundation of every optimization problem that follows.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'The derivative f\'(x) measures instantaneous rate of change — it\'s the slope of the tangent line at each point. ' +
          'If the slope is positive, the function is climbing. If negative, it\'s falling.',
          '**Sign of f\' controls direction:**',
          '• f\'(x) > 0 on (a, b) — f is INCREASING on that interval (tangent lines tilt upward)',
          '• f\'(x) < 0 on (a, b) — f is DECREASING on that interval (tangent lines tilt downward)',
          '• f\'(x) = 0 at x = c — f has a CRITICAL POINT at c (tangent line is horizontal)',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'intuition',
          title: 'The Sign Chart',
          body: 'A sign chart is a number line showing where f\'(x) is positive (+) or negative (−). ' +
                'It\'s the most efficient way to determine where f is increasing and decreasing:\n\n' +
                '1. Find all critical points (where f\'= 0 or DNE)\n' +
                '2. These points divide the real line into intervals\n' +
                '3. Test one x-value in each interval — plug into f\'\n' +
                '4. Mark + or − for each interval\n' +
                '5. + means increasing, − means decreasing',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'First Derivative Sign Chart',
        mathBridge:
          'The sign of f\'(x) directly tells you whether f(x) is rising (+) or falling (−). ' +
          'When f\' switches from + to −, f has a local maximum. When from − to +, a local minimum.',
        caption: 'Drag the critical points to rearrange the sign chart. Watch how the function shape updates to match.',
      },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Increasing/Decreasing Theorem',
          body: 'If $f\'(x) > 0$ for all $x \\in (a,b)$, then $f$ is strictly increasing on $(a,b)$. \\\\ If $f\'(x) < 0$ for all $x \\in (a,b)$, then $f$ is strictly decreasing on $(a,b)$. \\\\ \\text{(Proof uses the Mean Value Theorem)}',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'First Derivative Test',
          body: '\\text{Let } c \\text{ be a critical point of } f. \\text{ If } f \\text{ is continuous near } c: \\\\ \\textbf{Local max:} \\; f\' \\text{ changes from } + \\text{ to } - \\text{ at } c \\\\ \\textbf{Local min:} \\; f\' \\text{ changes from } - \\text{ to } + \\text{ at } c \\\\ \\textbf{Neither:} \\; f\' \\text{ does not change sign at } c',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**The complete procedure:**',
          '1. Find f\'(x)',
          '2. Find all critical points: solve f\'(x) = 0 and find where f\'(x) DNE',
          '3. Plot these on a number line; they create intervals',
          '4. Pick a test point in each interval; evaluate f\' there',
          '5. Mark + or − on each interval',
          '6. Apply the First Derivative Test at each critical point',
          '7. State intervals of increase/decrease, and identify local max/min',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'misconception',
          title: 'f\'(c) = 0 does NOT mean local extremum',
          body: 'f(x) = x³ has f\'(0) = 0, but x = 0 is NOT a local extremum — it\'s an inflection point. ' +
                'f\' goes from negative (x < 0) ... wait, f\'(x) = 3x² ≥ 0 everywhere! ' +
                'f\' does NOT change sign at x = 0 (it\'s positive on both sides: 3x² > 0 for x ≠ 0). ' +
                'First Derivative Test: f\' goes from + to +, so x = 0 is NEITHER a max nor a min.',
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Proof of Increasing/Decreasing Theorem:** Suppose f\'(x) > 0 on (a, b). Pick any a < x₁ < x₂ < b. ' +
      'By the Mean Value Theorem, there exists c ∈ (x₁, x₂) such that f(x₂) − f(x₁) = f\'(c)(x₂ − x₁). ' +
      'Since f\'(c) > 0 and x₂ − x₁ > 0, we get f(x₂) − f(x₁) > 0, i.e., f(x₁) < f(x₂). ' +
      'Since x₁ < x₂ was arbitrary, f is strictly increasing. ■',
      '**Why the First Derivative Test works:** If f\' changes from + to − at c, then for x just left of c, f is increasing (approaching the max), ' +
      'and for x just right of c, f is decreasing (moving away from the max). ' +
      'So f(c) is larger than all nearby values → local max. The argument for local min is symmetric.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Formal Increasing Definition',
        body: 'f \\text{ is strictly increasing on } (a,b) \\iff \\forall x_1, x_2 \\in (a,b): x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-inc-dec-cubic',
      title: 'Intervals of Increase/Decrease and Local Extrema',
      problem: 'Find where $f(x) = x^3 - 6x^2 + 9x + 1$ is increasing and decreasing, and identify all local extrema.',
      steps: [
        {
          expression: 'f\'(x) = 3x^2 - 12x + 9 = 3(x^2 - 4x + 3) = 3(x-1)(x-3)',
          annotation: 'Factor the derivative.',
        },
        {
          expression: 'f\'(x) = 0 \\implies x = 1 \\text{ or } x = 3',
          annotation: 'Two critical points. f\' exists everywhere (polynomial).',
        },
        {
          expression: '\\textbf{Sign chart: divide number line at } x=1 \\text{ and } x=3',
          annotation: '',
        },
        {
          expression: 'x < 1: \\text{ test } x=0: f\'(0) = 3(−1)(−3) = 9 > 0 \\implies \\text{increasing}',
          annotation: '',
        },
        {
          expression: '1 < x < 3: \\text{ test } x=2: f\'(2) = 3(1)(−1) = -3 < 0 \\implies \\text{decreasing}',
          annotation: '',
        },
        {
          expression: 'x > 3: \\text{ test } x=4: f\'(4) = 3(3)(1) = 9 > 0 \\implies \\text{increasing}',
          annotation: '',
        },
        {
          expression: '\\textbf{First Derivative Test:}',
          annotation: '',
        },
        {
          expression: 'x=1: f\' \\text{ changes } + \\to - \\implies \\text{local MAXIMUM at } x=1,\\; f(1) = 1 - 6 + 9 + 1 = 5',
          annotation: '',
        },
        {
          expression: 'x=3: f\' \\text{ changes } - \\to + \\implies \\text{local MINIMUM at } x=3,\\; f(3) = 27 - 54 + 27 + 1 = 1',
          annotation: '',
        },
      ],
      conclusion: 'Increasing on (−∞, 1) and (3, ∞). Decreasing on (1, 3). Local max at (1, 5). Local min at (3, 1). The function rises, peaks, dips, then rises again — a classic cubic shape.',
    },
    {
      id: 'ex-inc-dec-rational',
      title: 'Increasing/Decreasing for a Rational Function',
      problem: 'Find the intervals of increase and decrease for $f(x) = \\dfrac{x^2}{x^2 - 4}$, and all local extrema.',
      steps: [
        {
          expression: 'f\'(x) = \\frac{2x(x^2-4) - x^2 \\cdot 2x}{(x^2-4)^2} = \\frac{2x^3 - 8x - 2x^3}{(x^2-4)^2} = \\frac{-8x}{(x^2-4)^2}',
          annotation: 'Quotient rule. Simplify the numerator.',
        },
        {
          expression: 'f\'(x) = 0 \\implies x = 0 \\qquad f\'(x) \\text{ DNE: } x = \\pm 2 \\text{ (not in domain!)}',
          annotation: 'x = ±2 make the original f undefined. They are NOT critical points — they\'re outside the domain.',
        },
        {
          expression: '\\text{Intervals: } (-\\infty,-2),\\;(-2,0),\\;(0,2),\\;(2,\\infty)',
          annotation: 'The domain excludes x = ±2, so these split the number line into four parts.',
        },
        {
          expression: 'x=-3: f\'(-3) = \\frac{24}{25} > 0 \\; (\\uparrow) \\qquad x=-1: f\'(-1) = \\frac{8}{9} > 0 \\; (\\uparrow)',
          annotation: 'Increasing on (−∞, −2) and (−2, 0).',
        },
        {
          expression: 'x=1: f\'(1) = \\frac{-8}{9} < 0 \\; (\\downarrow) \\qquad x=3: f\'(3) = \\frac{-24}{25} < 0 \\; (\\downarrow)',
          annotation: 'Decreasing on (0, 2) and (2, ∞).',
        },
        {
          expression: 'x=0: f\' \\text{ changes } + \\to - \\implies \\text{local MAXIMUM at } x=0,\\; f(0) = 0',
          annotation: '',
        },
      ],
      conclusion: 'Increasing on (−∞, −2) and (−2, 0). Decreasing on (0, 2) and (2, ∞). Local maximum at (0, 0). No local minimum (the function has vertical asymptotes at ±2, not extrema).',
    },
  ],

  challenges: [
    {
      id: 'ch3-fdt-c1',
      difficulty: 'easy',
      problem: 'Find the local max and min of $f(x) = x^4 - 4x^3$.',
      hint: 'f\'(x) = 4x³ − 12x² = 4x²(x − 3). Sign chart: what sign does 4x² have?',
      walkthrough: [
        { expression: 'f\'(x) = 4x^3 - 12x^2 = 4x^2(x-3)', annotation: '' },
        { expression: 'f\'(x) = 0 \\implies x = 0 \\text{ or } x = 3', annotation: '' },
        { expression: '4x^2 \\geq 0 \\text{ always}', annotation: '4x² never changes sign! Sign of f\' is controlled by (x−3).' },
        { expression: 'x < 3: 4x^2(x-3) < 0 \\;(\\downarrow) \\qquad x > 3: 4x^2(x-3) > 0 \\;(\\uparrow)', annotation: '' },
        { expression: 'x=0: f\' \\text{ does NOT change sign (stays −)} \\implies \\text{neither max nor min (inflection)}', annotation: '' },
        { expression: 'x=3: f\' \\text{ changes } - \\to + \\implies \\text{local min}, \\; f(3) = 81 - 108 = -27', annotation: '' },
      ],
      answer: 'No extremum at x = 0 (inflection point). Local minimum at x = 3, f(3) = −27.',
    },
    {
      id: 'ch3-fdt-c2',
      difficulty: 'hard',
      problem: 'Prove: if $f\'(x) > 0$ on $(a, b)$ and $f\'(b)$ exists with $f\'(b) = 0$, then $f(b)$ is a local maximum of $f$ on $(a, b]$.',
      hint: 'You know f is increasing on (a, b), so f(b) is larger than all values to its left.',
      walkthrough: [
        { expression: 'f\'(x) > 0 \\text{ on } (a,b) \\implies f \\text{ strictly increasing on } (a,b)', annotation: '' },
        { expression: '\\forall x \\in (a,b): f(x) < f(b)', annotation: 'Since f is increasing and b is the right endpoint.' },
        { expression: '\\text{For } x > b \\text{ near } b: f\'(b) = 0, \\text{ and we would need info about } f\' \\text{ just right of } b.', annotation: 'On (a, b], f(b) is at least a one-sided (left) local maximum.' },
      ],
      answer: 'f(b) ≥ f(x) for all x ∈ (a, b] — it is a local maximum on the interval from the left.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'extreme-value-theorem', label: 'Prerequisite: EVT & Absolute Extrema', context: 'Understand critical points and why they are candidates for extrema.' },
    { lessonSlug: 'mean-value-theorem', label: 'Prerequisite: Mean Value Theorem', context: 'MVT proves the increasing/decreasing theorem.' },
    { lessonSlug: 'concavity-second-derivative-test', label: 'Next: Concavity & Second Derivative Test', context: 'Alternate test for classifying critical points.' },
    { lessonSlug: 'curve-sketching', label: 'Applied in: Curve Sketching', context: 'First derivative analysis is step 3 of curve sketching.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
