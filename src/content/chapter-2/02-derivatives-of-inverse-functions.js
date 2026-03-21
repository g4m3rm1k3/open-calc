export default {
  id: 'ch2-002b',
  slug: 'derivatives-of-inverse-functions',
  chapter: 2,
  order: 2,
  title: 'Derivatives of Inverse Functions',
  subtitle: 'The Geometry of Reversing Time — and Unlocking Inverse Trig',
  tags: ['inverse functions', 'geometry', 'derivative of inverse', 'arcsin', 'arccos', 'arctan'],

  hook: {
    question: "If you know how fast a rocket's height changes with time ($dh/dt$), how do you find out how fast time changes with respect to height ($dt/dh$)? You take the reciprocal. But evaluating it correctly requires understanding the geometry of reflection. This also unlocks the derivatives of $\\arcsin$, $\\arccos$, and $\\arctan$, which are essential for integrals later.",
    realWorldContext: "The geometry of reflection relates the inverse of any function to the original function.",
    previewVisualizationId: 'DualGraphSync',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'The "Runner\'s Analogy": If you run 5 miles per hour, then it takes you $1/5$ of an hour to run a mile. The rate of the inverse process is just the reciprocal of the original rate.',
        ]
      },
      {
        type: 'callout',
        title: 'The Trap',
        body: "The slope of the inverse is the reciprocal, BUT you have to evaluate it at the y-value of the original function.",
        type: 'warning'
      }
    ],
    visualizations: [
      {
        id: 'DualGraphSync',
        title: 'The See-Saw of Slopes',
        caption: 'The slope on the red inverse curve is exactly $1/m$ where $m$ is the slope on the original blue curve.',
      }
    ]
  },

  math: {
    blocks: [
      {
        type: 'callout',
        title: 'Formal Theorem',
        body: "\\frac{d}{dx}[f^{-1}(x)] = \\frac{1}{f'(f^{-1}(x))}",
        type: 'theorem'
      },
      {
        type: 'callout',
        title: 'The "Big Three" Inverse Trig Derivatives',
        body: "\\frac{d}{dx}[\\arcsin(x)] = \\frac{1}{\\sqrt{1-x^2}} \\quad \\quad \\frac{d}{dx}[\\arctan(x)] = \\frac{1}{1+x^2} \\quad \\quad \\frac{d}{dx}[\\arccos(x)] = \\frac{-1}{\\sqrt{1-x^2}}",
        type: 'theorem'
      }
    ]
  },

  rigor: {
    blocks: [
      {
        type: 'stepthrough',
        title: 'Deriving $\\arcsin$ using Implicit Differentiation',
        steps: [
          { expression: "y = \\arcsin(x)", annotation: "Step 1: Let $y = \\arcsin(x)$." },
          { expression: "\\sin(y) = x", annotation: "Step 2: Rewrite as $\\sin(y) = x$." },
          { expression: "\\cos(y) \\cdot \\frac{dy}{dx} = 1", annotation: "Step 3: Take derivative of both sides." },
          { expression: "\\frac{dy}{dx} = \\frac{1}{\\cos(y)}", annotation: "Step 4: Isolate $dy/dx$ by dividing by $\\cos(y)$." },
          { expression: "\\frac{dy}{dx} = \\frac{1}{\\sqrt{1-x^2}}", annotation: "Step 5: Use the {{algebra:PythagIdentity|Pythagorean Identity}} to convert $\\cos(y)$ into $\\sqrt{1-x^2}$." }
        ]
      }
    ]
  },

  examples: [
    {
      id: 'ch2-002-ex1',
      title: 'Finding the Derivative of an Inverse from a Table',
      problem: "\\text{Given } f(5) = 2 \\text{ and } f'(5) = 4 \\text{, find } (f^{-1})'(2).",
      steps: [
        { expression: "(f^{-1})'(x) = \\frac{1}{f'(f^{-1}(x))}", annotation: "Write the theorem for the derivative of an inverse function." },
        { expression: "(f^{-1})'(2) = \\frac{1}{f'(f^{-1}(2))}", annotation: "Substitute $x = 2$." },
        { expression: "f^{-1}(2) = 5", annotation: "Since $f(5) = 2$, it implies $f^{-1}(2) = 5$." },
        { expression: "(f^{-1})'(2) = \\frac{1}{f'(5)}", annotation: "Substitute $5$ for $f^{-1}(2)$." },
        { expression: "(f^{-1})'(2) = \\frac{1}{4}", annotation: "Substitute the given slope $f'(5) = 4$." }
      ],
      conclusion: 'The slope at $y=2$ on the original function translates to $1/4$ at $x=2$ on the inverse.'
    },
    {
      id: 'ch2-002-ex2',
      title: 'Differentiating an Inverse Trig Function with the Chain Rule',
      problem: "\\text{Find } y' \\text{ for } y = \\arctan(e^x).",
      steps: [
        { expression: "\\frac{d}{dx}[\\arctan(u)] = \\frac{1}{1+u^2} \\cdot u'", annotation: "Write the derivative rule for $\\arctan$ combined with the Chain Rule." },
        { expression: "u = e^x \\implies u' = e^x", annotation: "Identify the inside function as $e^x$ and its derivative." },
        { expression: "y' = \\frac{1}{1+(e^x)^2} \\cdot e^x", annotation: "Substitute into the Chain Rule formula." },
        { expression: "y' = \\frac{e^x}{1+e^{2x}}", annotation: "Simplify the power using $(e^x)^2 = e^{2x}$." }
      ],
      conclusion: 'The Chain Rule works seamlessly with inverse trig functions.'
    }
  ],
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
  ],
};
