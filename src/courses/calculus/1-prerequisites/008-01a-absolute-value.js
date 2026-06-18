export default {
  id: 'ch0-absolute-value',
  slug: 'absolute-value',
  chapter: 0,
  order: 1,
  title: 'Absolute Value as Distance',
  subtitle: 'The geometry behind |x|, |x − a|, and inequalities',
  tags: ['absolute value', 'distance', 'number line', 'inequalities', 'geometry'],

  hook: {
    question: 'Why is |x − a| < r the same as "x is within distance r of the point a"?',
    realWorldContext:
      'A manufacturing process must keep a steel rod at exactly 100 mm, but tolerances allow ±0.5 mm. ' +
      'A quality inspector writes: "accept if |length − 100| < 0.5." ' +
      'This is not algebra — it is a distance picture. The rod is "close enough to 100" if the distance from its actual length to 100 is smaller than the tolerance. ' +
      'This same language appears everywhere: temperature control, GPS accuracy, measurement uncertainty, and later in calculus in epsilon-delta proofs. ' +
      'Understanding the distance picture first makes the algebra automatic.',
    previewVisualizationId: 'NumberLine',
    previewVisualizationProps: { showIntervals: true, interval: { a: -2, b: 2, leftClosed: false, rightClosed: false, label: '|x| < 2' } },
  },

  intuition: {
    prose: [
      'Absolute value answers one question: **How far is this number from zero?**',

      '|5| = 5 because 5 is five units to the right of zero. |−5| = 5 because −5 is five units to the left of zero. Both are the same distance away.',

      'More generally, |x − a| asks: **How far is x from the point a?** This is the key insight that unlocks the whole topic. Forget the formula for a moment and just think of the picture: mark the point a on the number line, measure the distance to x, and strip away any directional sign. That distance is |x − a|.',

      'This geometric view immediately explains why |x − a| < r is equivalent to "x is within a circle of radius r centered at a." In one dimension, that "circle" is an interval: all points between a − r and a + r.',

      'Watch what happens:',
      '• |x| < 2 means x is within distance 2 of zero, so −2 < x < 2.',
      '• |x − 5| < 3 means x is within distance 3 of the point 5, so 2 < x < 8 (which is 5 − 3 < x < 5 + 3).',
      '• |x − (−1)| < 0.5 means x is within distance 0.5 of the point −1, so −1.5 < x < −0.5.',

      'This pattern works every time. Once you see it as a distance picture, the algebra is just bookkeeping.',

      'What about |x − a| > r? This is the complement: x is **not** close to a. Instead of one interval in the middle, you get two rays on the outside: x < a − r OR x > a + r.',

      'Multiplying by a negative number inside an absolute value is weird at first. But remember: |−x| means "the distance from −x to zero," which is the same as "the distance from x to zero." So |−x| = |x|. More generally, |−5x| = |5| · |−x| = 5|x|. The negative sign gets stripped away by the absolute value, leaving only magnitudes to multiply.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Absolute Value: Formal Definition',
        body: '|x| = x if x ≥ 0, and |x| = −x if x < 0. This removes the sign, keeping only the distance from zero. For any a and r: |x − a| < r ⟺ a − r < x < a + r.',
      },
      {
        type: 'intuition',
        title: 'The Distance Picture',
        body: 'Think of the number line. |x − a| is the distance from x to a. |x − a| < r means "x is less than radius r away from center a." On a number line, that is the interval (a − r, a + r).',
      },
      {
        type: 'tip',
        title: 'Two Inequalities in One',
        body: 'The compound inequality a − r < x < a + r is a shorthand for: (x > a − r) AND (x < a + r). Both conditions must hold. When writing solutions, the interval notation [a − r, a + r] is cleaner.',
      },
      {
        type: 'misconception',
        title: '|x| Does NOT Mean "Make it Positive"',
        body: 'It means "measure the distance to zero." The result is always non-negative (≥ 0), but the operation is geometric, not "make positive." This distinction matters when you have expressions like |−3x|: it becomes 3|x|, not −3x with a positive sign.',
      },
    ],
    visualizations: [
      {
        id: 'NumberLine',
        title: 'Number Line with Distance Intervals',
        caption: 'Drag points to explore |x − a|, |x − a| < r, and |x − a| > r as distance geometry.',
      },
    ],
  },

  math: {
    prose: [
      'From the distance picture, we derive algebraic rules.',

      '**Rule 1: |x − a| < r ⟺ a − r < x < a + r**',
      'This is the centered interval. The distance from x to a is less than r means x is trapped in the interval (a − r, a + r). Both directions work: if you start with the inequality a − r < x < a + r, you can reverse the algebra to get |x − a| < r.',

      '**Rule 2: |x − a| > r ⟺ x < a − r OR x > a + r**',
      'The opposite direction: x is far from a (distance more than r). This gives two separate regions on the number line, not one interval. They are disconnected.',

      '**Rule 3: |x − a| = r ⟺ x = a − r OR x = a + r**',
      'Equality case: x is exactly distance r from a. There are exactly two such points, one on each side.',

      '**Rule 4: |kx| = |k| · |x| for any constant k**',
      'Absolute values split products. This is crucial when solving inequalities involving coefficients. Example: |−3x| = |−3| · |x| = 3|x|.',

      '**Rule 5: |a + b| ≤ |a| + |b|** (Triangle Inequality)',
      'The distance from 0 to (a + b) is no more than the sum of distances from 0 to a and from 0 to b. Equality holds when a and b have the same sign (or one is zero).',

      'From these rules, most absolute value inequalities reduce to compound inequalities or case analysis.',
    ],
    callouts: [
      {
        type: 'key-identity',
        title: 'The Core Equivalences',
        body: 'Memorize these: |x − a| < r ⟺ a − r < x < a + r.  |x − a| > r ⟺ x < a − r OR x > a + r.',
      },
      {
        type: 'technique',
        title: 'Solving |expression| < bound',
        body: '(1) Rewrite as: −bound < expression < bound. (2) Solve both inequalities separately. (3) Combine with AND.',
      },
      {
        type: 'technique',
        title: 'Solving |expression| > bound',
        body: '(1) Split into two cases: expression < −bound OR expression > bound. (2) Solve each separately. (3) Combine with OR.',
      },
      {
        type: 'theorem',
        title: 'Reverse Triangle Inequality',
        body: '||a| - |b|| \\leq |a - b|. \\text{ The difference of distances is at most the distance between points.} \\\\ \\text{Useful in ε–δ proofs when you need a lower bound on } |f(x) - L|.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The formal definition |x| = max(x, −x) captures the absolute value as the larger of the two candidates. ' +
      'In proof writing, this leads to case splits whenever absolute values appear.',

      'For example, to prove |a + b| ≤ |a| + |b|, you check four cases based on the signs of a and b. In each case, the absolute value symbols disappear, revealing a numerical inequality.',

      'In epsilon-delta arguments (later in calculus), absolute values represent distance tolerances. ' +
      'The statement "find δ such that |x − c| < δ implies |f(x) − L| < ε" is really asking: ' +
      '"Find a neighborhood around c (within distance δ) such that f maps it into a neighborhood around L (within distance ε)."',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch0-abs-ex1',
      title: 'Basic Absolute Value — Distance from Zero',
      problem: 'Solve |x| < 3.',
      steps: [
        { expression: '|x| < 3', annotation: 'Distance from x to 0 is less than 3.' },
        { expression: '-3 < x < 3', annotation: 'Translate to interval: x is in (−3, 3).' },
      ],
      conclusion: 'The solution is all x between −3 and 3 (not including the endpoints).',
      visualizationId: 'NumberLine',
      params: {
        showIntervals: true,
        xMin: -5,
        xMax: 5,
        interval: { a: -3, b: 3, leftClosed: false, rightClosed: false, label: '(-3, 3)' },
      },
    },

    {
      id: 'ch0-abs-ex2',
      title: 'Distance from a Point',
      problem: 'Solve |x − 5| < 2.',
      steps: [
        { expression: '|x − 5| < 2', annotation: 'Distance from x to 5 is less than 2.' },
        { expression: '5 - 2 < x < 5 + 2', annotation: 'Centered interval: (a − r, a + r) with a=5, r=2.' },
        { expression: '3 < x < 7', annotation: 'Simplify.' },
      ],
      conclusion: 'x is between 3 and 7. Geometrically: x is within distance 2 of the point 5.',
      visualizationId: 'NumberLine',
      params: {
        showIntervals: true,
        xMin: 0,
        xMax: 10,
        interval: { a: 3, b: 7, leftClosed: false, rightClosed: false, label: '(3, 7)' },
        points: [{ value: 5, label: 'center 5' }],
      },
    },

    {
      id: 'ch0-abs-ex3',
      title: 'The Outer Rays Case',
      problem: 'Solve |x − 2| > 1.',
      steps: [
        { expression: '|x − 2| > 1', annotation: 'Distance from x to 2 is more than 1.' },
        { expression: 'x - 2 < -1  OR  x - 2 > 1', annotation: 'Split into two cases.' },
        { expression: 'x < 1  OR  x > 3', annotation: 'Solve each inequality.' },
      ],
      conclusion: 'x is either less than 1 or greater than 3. Geometrically: x is more than distance 1 away from 2, so it lives in the two rays on either side.',
      visualizationId: 'NumberLine',
      params: {
        xMin: -1,
        xMax: 5,
        rays: [
          { from: 1, direction: 'left', closed: false, label: 'x < 1' },
          { from: 3, direction: 'right', closed: false, label: 'x > 3' },
        ],
        points: [{ value: 2, label: 'center 2' }],
      },
    },

    {
      id: 'ch0-abs-ex4',
      title: 'With a Coefficient',
      problem: 'Solve |3x − 6| < 9.',
      steps: [
        { expression: '|3x - 6| < 9', annotation: 'Factor out the 3 from inside: |3(x − 2)| = 3|x − 2|.' },
        { expression: '3|x - 2| < 9', annotation: 'Use Rule 4.' },
        { expression: '|x - 2| < 3', annotation: 'Divide both sides by 3.' },
        { expression: '2 - 3 < x < 2 + 3', annotation: 'Translate to interval centered at 2 with radius 3.' },
        { expression: '-1 < x < 5', annotation: 'Simplify.' },
      ],
      conclusion: 'The solution is the interval (−1, 5).',
      visualizationId: 'NumberLine',
      params: {
        showIntervals: true,
        xMin: -3,
        xMax: 7,
        interval: { a: -1, b: 5, leftClosed: false, rightClosed: false, label: '(-1, 5)' },
        points: [{ value: 2, label: 'center 2' }],
      },
    },

    {
      id: 'ch0-abs-ex5',
      title: 'Manufacturing Tolerance',
      problem: 'A machine produces bolts that should be 50 mm long, with tolerance ±0.2 mm. Write and solve the absolute value inequality for acceptable lengths.',
      steps: [
        { expression: '|length - 50| \\leq 0.2', annotation: 'Distance from measured length to target is at most tolerance.' },
        { expression: '50 - 0.2 \\leq length \\leq 50 + 0.2', annotation: 'Substitute into the equivalence.' },
        { expression: '49.8 \\leq length \\leq 50.2', annotation: 'Simplify.' },
      ],
      conclusion: 'Accept bolts between 49.8 mm and 50.2 mm. This is a real-world absolute value inequality.',
      visualizationId: 'NumberLine',
      params: {
        showIntervals: true,
        xMin: 49,
        xMax: 51,
        tickStep: 0.2,
        interval: { a: 49.8, b: 50.2, leftClosed: true, rightClosed: true, label: '[49.8, 50.2]' },
        points: [{ value: 50, label: 'target 50' }],
      },
    },

    {
      id: 'ch0-abs-ex6',
      title: 'Nonlinear: |x² − 4| < 5',
      problem: 'Solve $|x^2 - 4| < 5$.',
      steps: [
        {
          expression: '-5 < x^2 - 4 < 5',
          annotation: '$|A| < 5$ means $-5 < A < 5$. Rewrite as a compound double inequality.',
        },
        {
          expression: '-1 < x^2 < 9',
          annotation: 'Add 4 to all three parts.',
        },
        {
          expression: 'x^2 > -1 \\;\\Rightarrow\\; \\text{always true (squares are non-negative)}',
          annotation: 'Left inequality: ignore it — x² is never negative.',
        },
        {
          expression: 'x^2 < 9 \\;\\Rightarrow\\; |x| < 3 \\;\\Rightarrow\\; -3 < x < 3',
          annotation: 'Right inequality: x² < 9 means |x| < 3.',
        },
      ],
      conclusion: 'The solution is $(-3, 3)$. The nonlinear case still reduces to center ± radius once the compound inequality is unpacked.',
    },
  ],

  challenges: [
    {
      id: 'ch0-abs-ch1',
      difficulty: 'medium',
      problem: 'Solve |x + 3| ≤ 5. Hint: rewrite as |x − (−3)| first.',
      hint: 'Treat as distance from x to −3.',
      walkthrough: [
        { expression: '|x - (-3)| \\leq 5', annotation: 'Rewrite |x + 3| as distance from x to −3.' },
        { expression: '-3 - 5 \\leq x \\leq -3 + 5', annotation: 'Apply the equivalence.' },
        { expression: '-8 \\leq x \\leq 2', annotation: 'Simplify.' },
      ],
      answer: '[-8, 2]',
    },

    {
      id: 'ch0-abs-ch2',
      difficulty: 'hard',
      problem: 'Solve 2|x − 1| − 3 > 7.',
      hint: 'Isolate the absolute value first, then translate.',
      walkthrough: [
        { expression: '2|x - 1| - 3 > 7', annotation: 'Start here.' },
        { expression: '2|x - 1| > 10', annotation: 'Add 3 to both sides.' },
        { expression: '|x - 1| > 5', annotation: 'Divide by 2.' },
        { expression: 'x - 1 < -5  OR  x - 1 > 5', annotation: 'Apply outer-rays rule.' },
        { expression: 'x < -4  OR  x > 6', annotation: 'Solve each.' },
      ],
      answer: '(-∞, −4) ∪ (6, ∞)',
    },
  ],

  crossRefs: [
    { lessonSlug: 'real-numbers', label: 'Real Numbers & Intervals', context: 'Absolute value measures distance on the number line.' },
    { lessonSlug: 'epsilon-delta', label: 'Epsilon-Delta Proofs', context: 'Absolute value inequalities like |x − c| < δ encode distance tolerance.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-3', 'completed-example-4', 'solved-challenge'],
}
