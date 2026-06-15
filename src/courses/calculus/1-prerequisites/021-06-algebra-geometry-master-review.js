export default {
  id: 'ch5-precalc-review',
  slug: 'algebra-geometry-master-review',
  chapter: 0,
  order: 0,
  title: 'Algebra and Geometry Master Review',
  subtitle: 'Comprehensive toolbox review for limits, derivatives, and related rates',
  tags: ['algebra', 'geometry', 'review', 'factoring', 'absolute value', 'similar triangles', 'radians'],

  hook: {
    question: 'Why do hard calculus problems suddenly become easy when your algebra and geometry moves are automatic?',
    realWorldContext:
      'Most calculus mistakes are not from derivative rules. They come from missing factorization, weak fraction algebra, or not seeing geometric structure in a diagram. ' +
      'This review is intentionally dense: it collects the strongest worked patterns from your review webpages and puts them in one end-of-book toolkit.',
    previewVisualizationId: 'PythagoreanProof',
  },

  intuition: {
    prose: [
      'You can think of this lesson as a command center. When a limit looks stuck, you choose an algebra move: factor, conjugate, common denominator, or special identity. When a related-rates question looks messy, you choose a geometry move: similar triangles, angle sum, or radius-arc relation.',
      'A practical workflow from the algebra page is: diagnose the obstruction first. If direct substitution gives 0/0, do not panic and do not attempt random manipulations. Classify the expression shape and apply the matching move. This keeps your work deliberate, not luck-based.',
      'A practical workflow from the geometry page is: write the invariant relationship before differentiating. If two triangles stay similar through time, lock the ratio first. If a rotating radius sweeps an arc, write s = r theta in radians first. Differentiation should happen after structure is fixed.',
    ],
    callouts: [
      {
        type: 'technique',
        title: 'Algebra Move Selector',
        body: '0/0 polynomial form -> factor and cancel. Radicals in numerator or denominator -> multiply by conjugate. Added fractions -> common denominator first. Quadratic expression around a vertex -> complete the square.',
      },
      {
        type: 'technique',
        title: 'Geometry Move Selector',
        body: 'Changing lengths in a diagram -> search for similar triangles. Circle motion or sectors -> use radians and s = r theta. Triangle angle statements -> angle sum and exterior-angle theorem before any algebra.',
      },
      {
        type: 'warning',
        title: 'Cancel Factors, Not Terms',
        body: 'From the algebra review page: you can cancel (x-2) in [(x-2)(x+3)]/(x-2), but not the x inside (x+3). Cancellation only applies to full multiplicative factors.',
      },
    ],
    visualizations: [
      {
        id: 'PythagoreanProof',
        title: 'Pythagorean Theorem — Interactive Rearrangement',
        caption: 'Manipulate side lengths and watch area pieces rearrange to verify a^2 + b^2 = c^2.',
      },
      {
        id: 'TriangleAreaProof',
        title: 'Triangle Area Proof — Animated',
        caption: 'See why every triangle has area (1/2)bh by geometric decomposition.',
      },
      {
        id: 'SineUnwrap',
        title: 'Radians and Arc Length',
        caption: 'Unwrap the unit circle to connect angle in radians to arc length and rate relations.',
      },
    ],
  },

  math: {
    prose: [
      'Core identities used repeatedly in the source review pages:',
      '1) Difference of squares: a^2 - b^2 = (a-b)(a+b).',
      '2) Conjugate product: (u-v)(u+v) = u^2 - v^2.',
      '3) Absolute value interval: |x-a| < r iff a-r < x < a+r; |x-a| > r iff x < a-r or x > a+r.',
      '4) Similarity scale law: if triangles are similar with scale k, then corresponding lengths scale by k and areas scale by k^2.',
      '5) Radian and arc relation: s = r theta (theta in radians), so d/dt[s] = r dtheta/dt + theta dr/dt.',
      '6) Triangle area identity from geometry review: A = (1/2)bh, valid for any triangle once altitude is correctly identified.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Exterior Angle Theorem',
        body: 'In a triangle, an exterior angle equals the sum of the two remote interior angles.',
      },
      {
        type: 'definition',
        title: 'Pythagorean Theorem',
        body: 'For right triangles: a^2 + b^2 = c^2. In coordinate geometry: distance = sqrt((Delta x)^2 + (Delta y)^2).',
      },
    ],
    visualizations: [
      {
        id: 'CircleAreaProof',
        title: 'Circle Area by Rearranged Sectors',
        caption: 'Visual proof that circle area becomes pi r^2 by sector rearrangement and limiting strips.',
      },
    ],
  },

  rigor: {
    prose: [
      'A recurring proof pattern in the review pages is equivalence chains. To preserve correctness, each line must be reversible or explicitly directional. For example, converting |x-2| < 3 into -3 < x-2 < 3 is an equivalence; bounding |x+1| < 5 from |x-2| < 1 is a one-way implication used strategically.',
      'In geometry arguments, the rigorous step is naming the theorem that justifies each relation: corresponding angles from parallel lines, angle sum 180 degrees, or AA similarity. Avoid jumping from picture intuition straight to ratio equations without theorem tags.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Annotate Every Step Type',
        body: 'Mark each transition as algebraic equivalence, inequality bound, or geometric theorem. This prevents hidden logical jumps in long solutions.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-000-ex1',
      title: 'Compound Fraction Cleanup (from algebra review)',
      problem: 'Simplify \\frac{1}{x+h} - \\frac{1}{x} and factor the result into a form usable for limits.',
      steps: [
        { expression: '\\frac{1}{x+h} - \\frac{1}{x}', annotation: 'Start with common denominator x(x+h).' },
        { expression: '= \\frac{x - (x+h)}{x(x+h)}', annotation: 'Numerator combines as x - x - h.' },
        { expression: '= \\frac{-h}{x(x+h)}', annotation: 'This is the exact canonical form used in derivative difference quotients.' },
      ],
      conclusion: 'The key output is a visible factor h in the numerator, ready to cancel against an outer division by h in limit definitions.',
    },
    {
      id: 'ch5-000-ex2',
      title: 'Factor and Cancel 0/0 Form (from algebra review)',
      problem: 'Compute \\lim_{x\\to 2} \\frac{x^2-4}{x-2}.',
      steps: [
        { expression: '\\frac{x^2-4}{x-2} = \\frac{(x-2)(x+2)}{x-2}', annotation: 'Difference of squares.' },
        { expression: '= x+2 \\quad (x\\neq 2)', annotation: 'Cancel common factor away from the hole.' },
        { expression: '\\lim_{x\\to 2}(x+2)=4', annotation: 'Evaluate simplified expression at the limit point.' },
      ],
      conclusion: 'The function value at x=2 is undefined in the original form, but the limit exists and equals 4.',
    },
    {
      id: 'ch5-000-ex3',
      title: 'Conjugate Move for Radical Difference',
      problem: 'Compute \\lim_{x\\to 0} \\frac{\\sqrt{x+9}-3}{x}.',
      steps: [
        { expression: '\\frac{\\sqrt{x+9}-3}{x}\\cdot\\frac{\\sqrt{x+9}+3}{\\sqrt{x+9}+3}', annotation: 'Multiply by conjugate.' },
        { expression: '= \\frac{x+9-9}{x(\\sqrt{x+9}+3)}', annotation: 'Numerator collapses by difference of squares.' },
        { expression: '= \\frac{1}{\\sqrt{x+9}+3}', annotation: 'Cancel x.' },
        { expression: '\\lim_{x\\to 0} \\frac{1}{\\sqrt{x+9}+3}=\\frac{1}{6}', annotation: 'Direct substitution now works.' },
      ],
      conclusion: 'Conjugation converts radical subtraction into polynomial cancellation.',
    },
    {
      id: 'ch5-000-ex4',
      title: 'Absolute Value Inequality as Interval (from abs-value review)',
      problem: 'Solve |x-2|<3.',
      steps: [
        { expression: '|x-2|<3', annotation: 'Distance interpretation: x is within radius 3 of center 2.' },
        { expression: '-3<x-2<3', annotation: 'Translate absolute inequality to compound inequality.' },
        { expression: '-1<x<5', annotation: 'Add 2 across.' },
      ],
      conclusion: 'Solution set is the interval (-1,5).',
    },
    {
      id: 'ch5-000-ex5',
      title: 'Similar Triangles in a Shadow Setup (from geometry review)',
      problem: 'A lamp is 12 ft tall. A person 6 ft tall stands x ft from the lamp and casts a y ft shadow. Build the relation between x and y.',
      visualizationId: 'RelatedRatesLadder',
      steps: [
        { expression: '\\text{Large triangle height}=12,\\ \text{base}=x+y', annotation: 'Lamp to shadow tip forms the large triangle.' },
        { expression: '\\text{Small triangle height}=6,\\ \text{base}=y', annotation: 'Person to shadow tip forms the small triangle.' },
        { expression: '\\frac{12}{x+y}=\\frac{6}{y}', annotation: 'AA similarity gives ratio of corresponding sides.' },
        { expression: '12y=6(x+y) \\Rightarrow y=x', annotation: 'Simplify to a clean modeling relation.' },
      ],
      conclusion: 'The geometry relation is y=x. In related rates this gives dy/dt=dx/dt immediately after differentiation.',
    },
    {
      id: 'ch5-000-ex6',
      title: 'Triangle Area Proof Pattern (from geometry review)',
      problem: 'Show that any triangle with base b and height h has area A=(1/2)bh.',
      visualizationId: 'TriangleAreaProof',
      steps: [
        { expression: '\\text{Duplicate triangle and reflect across a side}', annotation: 'Two congruent copies form a parallelogram.' },
        { expression: 'A_{\\text{parallelogram}}=bh', annotation: 'Parallelogram area is base times height.' },
        { expression: '2A_{\\text{triangle}}=bh', annotation: 'Original triangle is exactly half of the parallelogram.' },
        { expression: 'A_{\\text{triangle}}=\\frac{1}{2}bh', annotation: 'Divide by 2.' },
      ],
      conclusion: 'This proof supports many integral area setups where the altitude is not drawn initially.',
    },
    {
      id: 'ch5-000-ex7',
      title: 'Radian Relationship for Motion (from geometry review)',
      problem: 'A point moves on a circle of radius 4 with angular speed dtheta/dt=3 rad/s. Find arc-speed ds/dt.',
      visualizationId: 'SineUnwrap',
      steps: [
        { expression: 's=r\\theta', annotation: 'Arc length formula in radians.' },
        { expression: '\\frac{ds}{dt}=r\\frac{d\\theta}{dt}', annotation: 'Radius is constant, so dr/dt=0.' },
        { expression: '\\frac{ds}{dt}=4\\cdot 3=12', annotation: 'Compute speed.' },
      ],
      conclusion: 'Arc-speed is 12 units/s. This is the geometric bridge between angular and linear rates.',
    },
  ],

  challenges: [
    {
      id: 'ch5-000-ch1',
      difficulty: 'medium',
      problem: 'Compute \\lim_{x\\to 1} \\frac{x^3-1}{x-1} using an algebra identity, then interpret the result geometrically as a secant-slope limit.',
      hint: 'Use x^3-1=(x-1)(x^2+x+1).',
      walkthrough: [
        { expression: '\\frac{x^3-1}{x-1}=x^2+x+1 \\ (x\\neq 1)', annotation: 'Factor and cancel.' },
        { expression: '\\lim_{x\\to 1}(x^2+x+1)=3', annotation: 'Direct evaluation.' },
      ],
      answer: '3',
    },
    {
      id: 'ch5-000-ch2',
      difficulty: 'hard',
      problem: 'Use similar triangles to derive a relation for a sliding ladder of fixed length 10 where the foot is x from the wall and top is y high, then differentiate to connect dx/dt and dy/dt.',
      hint: 'Start with x^2+y^2=100.',
      walkthrough: [
        { expression: 'x^2+y^2=100', annotation: 'Right triangle from wall, floor, ladder.' },
        { expression: '2x\\frac{dx}{dt}+2y\\frac{dy}{dt}=0', annotation: 'Differentiate implicitly.' },
        { expression: '\\frac{dy}{dt}=-\\frac{x}{y}\\frac{dx}{dt}', annotation: 'Solve for vertical rate.' },
      ],
      answer: '\\frac{dy}{dt}=-\\frac{x}{y}\\frac{dx}{dt}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'epsilon-delta', label: 'Epsilon-Delta Foundations', context: 'Apply these algebra patterns directly in formal limit proofs.' },
    { lessonSlug: 'related-rates', label: 'Related Rates', context: 'Geometry relations from this review are the setup stage for rates problems.' },
    { lessonSlug: 'curve-sketching', label: 'Curve Sketching', context: 'Algebra cleanup and sign logic reappear in derivative sign charts.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'completed-example-1',
    'completed-example-3',
    'completed-example-5',
    'solved-challenge',
  ],
}
