export default {
  id: 'derivatives-introduction',
  slug: 'derivatives-introduction',
  title: 'Derivatives: The Slope Machine',
  tags: ['calculus', 'derivatives', 'rate-of-change', 'differentiation'],
  chapter: 2,
  order: 0,

  hook: {
    question: 'How fast is something changing RIGHT NOW — not on average, but at this exact instant?',
    realWorldContext: `In manufacturing, derivatives tell you how fast a machine's output rate is changing — critical for catching drift before defects occur. In physics, velocity is the derivative of position; acceleration is the derivative of velocity. In finance, the "delta" of an option IS a derivative.`,
  },

  intuition: {
    prose: [
      'The derivative is the slope of a curve at a single point — found by taking the limit of secant lines (slopes between two points) as those points get infinitely close together.',
      '**Visual Perspective**: Draw a curve. Pick a point. Draw a line through that point and another nearby point — that\'s a secant line. Now slide the second point closer and closer to the first. The secant line rotates until it becomes a TANGENT line. That tangent\'s slope is the derivative.',
      '**Physical Perspective**: Consider position p(t). Average velocity over an interval is the change in position over change in time. Shrink that interval to zero, and you get instantaneous velocity — the derivative p\'(t). This is literally what a speedometer measures.',
      '**Algebraic Perspective**: The difference quotient (f(x+h)-f(x))/h is the slope of a secant line. Taking the limit as h→0 gives the slope of the tangent. That\'s f\'(x) — the derivative.',
      '**Geometric Perspective**: The derivative tells you: "if I move a tiny bit in x, how much does y change?" f\'(x) = 2 means "for every 1 unit right, y goes up approximately 2 units — right here." It\'s a LOCAL, INSTANTANEOUS rate, different at every point on the curve.'
    ],
    visualizations: [
      {
        id: 'CalculusFoundationsLab',
        title: 'Calculus Foundations: The Semantic Lab',
        caption: 'Before differentiating, we must understand WHAT the symbols mean. Use this lab to decode dependency, motion, and change propagation.',
      },
      {
        id: 'TangentLineViz',
        title: 'Visualizing the Derivative: The Tangent Line',
        caption: 'The derivative at a point is literally the slope of the line that just brushes the curve at that exact location.',
      },
      {
        id: 'DerivativeFromFirstPrinciplesViz',
        title: 'The Limit Definition in Action',
        caption: 'Watch as secant lines transform into the tangent line as the interval h shrinks to zero.',
      },
    ],
  },

  math: {
    prose: [
      'The formal definition of the derivative is the limit of the difference quotient as the interval size h approaches zero.',
      'Common notations for the derivative include Lagrange (f\'(x)), Leibniz (dy/dx), and Newton (ẋ). Each emphasizes a different aspect of the concept — ratio, function, or time-dependency.'
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Formal Definition',
        body: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
      },
      {
        type: 'insight',
        title: 'Derivative Rules Table',
        body: `
- **Power Rule**: $\\frac{d}{dx} x^n = n x^{n-1}$
- **Constant Rule**: $\\frac{d}{dx} c = 0$
- **Product Rule**: $(fg)' = f'g + fg'$
- **Chain Rule**: $(f \\circ g)' = f'(g(x)) \\cdot g\'(x)$
- **Sine/Cosine**: $(\\sin x)' = \\cos x, (\\cos x)' = -\\sin x$
        `
      }
    ]
  },

  rigor: {
    title: 'Deriving the Power Rule from Scratch',

    proofSteps: [
      { expression: 'f(x) = x^2', annotation: 'Start with the simplest non-trivial power: x².' },
      { expression: 'f\'(x) = \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h}', annotation: 'Apply the definition of the derivative.' },
      { expression: '= \\lim_{h \\to 0} \\frac{x^2 + 2xh + h^2 - x^2}{h}', annotation: 'Expand (x+h)².' },
      { expression: '= \\lim_{h \\to 0} \\frac{2xh + h^2}{h}', annotation: 'The x² terms cancel.' },
      { expression: '= \\lim_{h \\to 0} (2x + h)', annotation: 'Factor out h, then cancel it (h≠0 in a limit).' },
      { expression: '= 2x', annotation: 'As h→0, the h term vanishes. Power rule: n·xⁿ⁻¹ = 2x¹. ✓' },
    ],
  },

  examples: [
    {
      id: 'ch2-10-ex1',
      title: 'Chain Rule: Composite Functions',
      problem: 'Differentiate f(x) = sin(x³)',
      steps: [
        { expression: 'f(x) = \\sin(\\underbrace{x^3}_{\\text{inner}})', annotation: 'Identify outer function (sin) and inner (x³).' },
        { expression: 'f\'(x) = \\cos(x^3) \\cdot \\frac{d}{dx}(x^3)', annotation: 'Chain rule: differentiate outer, multiply by derivative of inner.' },
        { expression: '= \\cos(x^3) \\cdot 3x^2', annotation: 'Power rule on the inner function. Done.' },
      ],
    },
    {
      id: 'ch2-10-ex2',
      title: 'Product Rule in Action',
      problem: 'Differentiate f(x) = x² · eˣ',
      steps: [
        { expression: '(fg)\' = f\'g + fg\'', annotation: 'Product rule: two terms, each differentiating one factor.' },
        { expression: 'f = x^2 \\Rightarrow f\' = 2x', annotation: 'Differentiate the first factor.' },
        { expression: 'g = e^x \\Rightarrow g\' = e^x', annotation: 'Differentiate the second factor (eˣ is its own derivative).' },
        { expression: '= 2x \\cdot e^x + x^2 \\cdot e^x = e^x(2x + x^2)', annotation: 'Combine and factor. Final answer.' },
      ],
    },
    {
      id: 'ch2-10-ex3',
      title: 'Implicit Differentiation',
      problem: 'Find dy/dx for x² + y² = 25 (a circle)',
      steps: [
        { expression: '\\frac{d}{dx}(x^2) + \\frac{d}{dx}(y^2) = \\frac{d}{dx}(25)', annotation: 'Differentiate both sides with respect to x.' },
        { expression: '2x + 2y\\frac{dy}{dx} = 0', annotation: 'Chain rule on y² gives 2y·(dy/dx). Right side is 0.' },
        { expression: '\\frac{dy}{dx} = -\\frac{x}{y}', annotation: 'Solve for dy/dx. The slope depends on BOTH x and y.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch2-10-c1',
      difficulty: 'medium',
      problem: 'Find the equation of the tangent line to f(x) = x³ - 2x at x = 2.',
      hint: 'You need two things: the slope (use f\'(2)) and a point (use f(2)).',
      walkthrough: [
        { expression: 'f\'(x) = 3x^2 - 2', annotation: 'Differentiate using power rule.' },
        { expression: 'f\'(2) = 3(4) - 2 = 10', annotation: 'Slope of tangent at x=2 is 10.' },
        { expression: 'f(2) = 8 - 4 = 4', annotation: 'The point is (2, 4).' },
        { expression: 'y - 4 = 10(x - 2) \\Rightarrow y = 10x - 16', annotation: 'Point-slope form → tangent line equation.' },
      ],
      answer: 'y = 10x - 16',
    },
  ],
};
