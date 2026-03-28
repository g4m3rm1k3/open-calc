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

  mentalModel: [
    'Derivative = slope = rate = sensitivity',
    'It answers: “If x changes slightly, what happens to f(x)?”',
    'It is a LOCAL property — depends on position'
  ],

  triggers: [
    {
      prompt: 'Rate, speed, change',
      recall: 'Derivative'
    },
    {
      prompt: 'Tangent line',
      recall: 'Derivative at a point'
    },
    {
      prompt: 'Small change approximation',
      recall: "f(x+h) ≈ f(x) + f'(x)h"
    }
  ],

  intuition: {
    semantics: {
      core: [
        { symbol: 'x', meaning: 'independent variable (input you control)' },
        { symbol: 'f(x)', meaning: 'output produced by the system at input x' },
        { symbol: 'h', meaning: 'a small change in x (probe distance)' },
        { symbol: 'f(x+h)', meaning: 'output after a small shift in input' },
        { symbol: 'f(x+h) - f(x)', meaning: 'change in output' },
        { symbol: 'h \\to 0', meaning: 'we are zooming in infinitely close' },
        { symbol: "f'(x)", meaning: 'instantaneous rate of change at x' },
      ],
      rulesOfThumb: [
        'f(x) is NOT multiplication — it is a machine mapping input → output',
        'The derivative is NOT a fraction, but dy/dx behaves like one algebraically',
        'h is never zero — it approaches zero',
        'The derivative is local: it only cares about behavior near x',
      ]
    },

    prose: [
      'The derivative is the slope of a curve at a single point. We find it by taking the limit of "secant lines" (slopes between two points) as those points get infinitely close together.',
      'This single number represents the **sensitivity** of the system: if I nudge the input by 1 unit, how many units does the output jump?',
    ],

    perspectives: [
      { type: 'geometric', statement: 'Slope of tangent line at x' },
      { type: 'physical', statement: 'Instantaneous velocity' },
      { type: 'algebraic', statement: 'Limit of difference quotient' },
      { type: 'computational', statement: "Local linear approximation: f(x+h) ≈ f(x) + f'(x)h" }
    ],
    bridge: "All four perspectives describe the SAME quantity — f'(x)",

    localLinearity: {
      statement: 'Near a point, every smooth function behaves like a line',
      formula: "f(x+h) \\approx f(x) + f'(x)h",
      meaning: 'The derivative is the best linear predictor of change'
    },

    visualizations: [
      {
        id: 'LineFoundationsLab',
        title: 'Foundations of Lines: Slope, Form, and Flow',
        caption: 'Before calculus, we must master the line. Experience how Δy/Δx creates a constant rate of change and how equations are just constraints on a path.',
      },
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
      {
        id: 'PositionVelocityAcceleration',
        title: 'Position, Velocity & Acceleration — The Derivative Chain',
        mathBridge: 'See position, velocity, and acceleration graphs side by side. Drag the position curve and watch both derivative graphs update in real time. The derivative chain v = x\', a = v\' is the physical backbone of Chapter 2.',
        caption: 'Every derivative in Chapter 2 is a rate of change. This viz shows the full semantic meaning of that chain.',
      },
      {
        id: 'ChainRuleCompositionViz',
        title: 'Two Function Machines — Inner and Outer',
        mathBridge: 'Pick any composition. See x flow through inner g then outer f. The chain rule assembles from the two derivatives.',
      },
      {
        id: 'ImplicitCurveExplorer',
        title: 'Implicit Differentiation — The Moving Tangent',
        mathBridge: 'Explore curves defined implicitly (circles, lemniscates). Watch how the tangent line at any point is found by differentiating both sides and solving for dy/dx.',
        caption: 'When you cannot solve for y, implicit differentiation finds the slope anyway.',
      },
    ],

    failureModes: [
      {
        case: 'Corner',
        example: '|x| \\text{ at } x=0',
        reason: 'left slope ≠ right slope'
      },
      {
        case: 'Vertical tangent',
        example: 'x^{1/3} \\text{ at } x=0',
        reason: 'slope → ∞'
      },
      {
        case: 'Discontinuity',
        example: '\\text{jump functions}',
        reason: 'no limit exists'
      }
    ]
  },

  math: {
    processDefinition: [
      'Pick a point x',
      'Move a small amount h → compute slope between x and x+h',
      'Shrink h toward 0',
      'Watch the slope stabilize → that value is the derivative'
    ],
    prose: [
      'Common notations for the derivative include Lagrange (f\'(x)), Leibniz (dy/dx), and Newton (ẋ). Each emphasizes a different aspect of the concept.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Formal Definition',
        body: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"
      },
      {
        type: 'insight',
        title: 'Common Derivative Rules',
        body: `
- **Power Rule**: $\\frac{d}{dx} x^n = n x^{n-1}$
- **Constant Rule**: $\\frac{d}{dx} c = 0$
- **Product Rule**: $(fg)' = f'g + fg'$
- **Chain Rule**: $(f \\circ g)' = f'(g(x)) \\cdot g'(x)$
        `
      }
    ]
  },

  rigor: {
    title: 'Deriving the Power Rule (x²) from First Principles',
    prose: [
       'We cancel h in the steps below because we are calculating a limit as h approaches zero, meaning h is specifically **not** zero during the algebraic simplification.'
    ],
    proofSteps: [
      { 
        expression: "f'(x) = \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h}", 
        annotation: 'Definition of derivative' 
      },
      { 
        expression: "= \\lim_{h \\to 0} \\frac{x^2 + 2xh + h^2 - x^2}{h}", 
        annotation: 'Algebraic expansion' 
      },
      { 
        expression: "= \\lim_{h \\to 0} \\frac{2xh + h^2}{h}", 
        annotation: 'Cancellation' 
      },
      { 
        expression: "= \\lim_{h \\to 0} (2x + h)", 
        annotation: 'Factor and simplify (valid for h ≠ 0)' 
      },
      { 
        expression: "= 2x", 
        annotation: 'Limit as h → 0' 
      }
    ],
  },

  examples: [
    {
      id: 'ch2-10-ex1',
      title: 'Power Rule and Linearity',
      problem: 'Find the derivative of f(x) = 5x³ + 2',
      steps: [
        { expression: "f'(x) = \\frac{d}{dx}(5x^3) + \\frac{d}{dx}(2)", annotation: 'Derivatives are linear: diff term-by-term.' },
        { expression: "= 5 \\cdot (3x^2) + 0", annotation: 'Power rule: 5 is a constant, x³ becomes 3x².' },
        { expression: "= 15x^2", annotation: 'Simplify. The constant 2 vanished because it doesn\'t change.' },
      ],
    },
    {
      id: 'ch2-10-ex2',
      title: 'The "Right Now" Velocity',
      problem: 'A ball falls $s(t) = 4.9t^2$. Find its velocity at exactly $t=2$.',
      steps: [
        { expression: "v(t) = s'(t) = \\frac{d}{dt}(4.9t^2)", annotation: 'Velocity is the derivative of position.' },
        { expression: "v(t) = 4.9 \\cdot (2t) = 9.8t", annotation: 'Power rule on t².' },
        { expression: "v(2) = 9.8(2) = 19.6 \\text{ m/s}", annotation: 'Evaluate at the specific instant t=2.' },
      ],
    }
  ],

  challenges: [
    {
      id: 'ch2-10-c1',
      difficulty: 'medium',
      problem: 'Find the equation of the tangent line to f(x) = x³ - 2x at x = 2.',
      hint: 'You need two things: the slope (use f\'(2)) and a point (use f(2)).',
      walkthrough: [
        { expression: "f'(x) = 3x^2 - 2", annotation: 'Differentiate using power rule.' },
        { expression: "f'(2) = 3(4) - 2 = 10", annotation: 'Slope of tangent at x=2 is 10.' },
        { expression: "f(2) = 8 - 4 = 4", annotation: 'The point is (2, 4).' },
        { expression: "y - 4 = 10(x - 2) \\Rightarrow y = 10x - 16", annotation: 'Point-slope form → tangent line equation.' },
      ],
      answer: 'y = 10x - 16',
    },
  ],
};
