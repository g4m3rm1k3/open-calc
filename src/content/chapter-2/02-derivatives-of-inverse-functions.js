export default {
  id: 'ch2-002b',
  slug: 'derivatives-of-inverse-functions',
  chapter: 2,
  order: 2,
  title: 'Derivatives of Inverse Functions',
  subtitle: 'General inverse-derivative rule, formal proof, and inverse trig formulas',
  tags: ['inverse functions', 'derivative of inverse', 'arcsin', 'arccos', 'arctan', 'implicit differentiation'],
  aliases: 'section 3.7 derivative of inverse function formal proof inverse trig derivatives arcsin arccos arctan',

  hook: {
    question: 'If a function maps x to y, how do slopes transform when we reverse that mapping and view x as a function of y?',
    realWorldContext:
      'Sensor calibration, coordinate transforms, control systems, and inverse kinematics all rely on inverse mappings. ' +
      'When you reverse a relationship, rates invert too - but at the correct corresponding point. ' +
      'This rule is also the engine behind derivatives of arcsin, arccos, and arctan.',
    previewVisualizationId: 'DualGraphSync',
  },

  intuition: {
    prose: [
      'If y = f(x), then the inverse relation is x = f^(-1)(y). Intuitively, moving forward through f and then backward through f^(-1) cancels out.',
      'On a graph, f and f^(-1) are reflections across y = x. Reflection swaps x and y coordinates, so tangent rise/run becomes run/rise. That is why inverse slopes are reciprocals.',
      'The most common mistake is evaluating at the wrong point. If f(a) = b, then the reciprocal slope relation is between f\'(a) and (f^(-1))\'(b), not at the same x-value.',
      'This general rule plus implicit differentiation gives the inverse trig derivatives cleanly, with domain restrictions built in.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Evaluation Point Matters',
        body: '(f^(-1))\'(x) = 1 / f\'(f^(-1)(x)). You must evaluate f\' at f^(-1)(x), not at x itself.',
      },
      {
        type: 'intuition',
        title: 'Slope Reciprocity',
        body: 'At corresponding points (a, b) and (b, a), slopes multiply to 1: f\'(a) * (f^(-1))\'(b) = 1, provided f\'(a) != 0.',
      },
    ],
    visualizations: [
      {
        id: 'DualGraphSync',
        title: 'Reflection and Reciprocal Slopes',
        caption: 'As a point moves on f, the reflected point on f^(-1) shows reciprocal tangent slope at matching coordinates.',
      },
    ],
  },

  math: {
    prose: [
      'General inverse derivative rule: if f is differentiable and one-to-one near a, with f(a) = b and f\'(a) != 0, then f^(-1) is differentiable near b and',
      '(f^(-1))\'(b) = 1/f\'(a).',
      'Equivalent formula in x-form:',
      '(f^(-1))\'(x) = 1 / f\'(f^(-1)(x)).',
      'Inverse trig derivatives (principal branches):',
      'd/dx[arcsin x] = 1/sqrt(1-x^2),   |x| < 1',
      'd/dx[arccos x] = -1/sqrt(1-x^2),  |x| < 1',
      'd/dx[arctan x] = 1/(1+x^2),       all x',
      'These follow from implicit differentiation plus right-triangle identities.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Inverse Derivative Rule',
        body: "\\frac{d}{dx}[f^{-1}(x)] = \\frac{1}{f'(f^{-1}(x))}",
      },
      {
        type: 'theorem',
        title: 'Inverse Trig Derivatives',
        body: "\\frac{d}{dx}[\\arcsin x]=\\frac{1}{\\sqrt{1-x^2}},\\;\\frac{d}{dx}[\\arccos x]=-\\frac{1}{\\sqrt{1-x^2}},\\;\\frac{d}{dx}[\\arctan x]=\\frac{1}{1+x^2}",
      },
    ],
  },

  rigor: {
    prose: [
      'Formal proof of inverse derivative rule: start from identity f(f^(-1)(x)) = x.',
      'Differentiate both sides with respect to x:',
      'f\'(f^(-1)(x)) * (f^(-1))\'(x) = 1.',
      'Solve for (f^(-1))\'(x):',
      '(f^(-1))\'(x) = 1 / f\'(f^(-1)(x)).',
      'This requires f\'(f^(-1)(x)) != 0.',
      'Formal derivation of arcsin: let y = arcsin x so sin y = x. Differentiate: cos y * dy/dx = 1, hence dy/dx = 1/cos y. From sin y = x and principal range y in [-pi/2, pi/2], cos y = sqrt(1-x^2), giving dy/dx = 1/sqrt(1-x^2).',
      'For arccos: let y = arccos x so cos y = x. Differentiate: -sin y * dy/dx = 1, so dy/dx = -1/sin y = -1/sqrt(1-x^2).',
      'For arctan: let y = arctan x so tan y = x. Differentiate: sec^2 y * dy/dx = 1, so dy/dx = 1/sec^2 y = 1/(1+tan^2 y) = 1/(1+x^2).',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Formal Proof (General Rule)',
        body: 'f(f^(-1)(x))=x => f\'(f^(-1)(x))*(f^(-1))\'(x)=1 => (f^(-1))\'(x)=1/f\'(f^(-1)(x)).',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-002-ex1',
      title: 'Finding the Derivative of an Inverse from a Table',
      problem: '\\text{Given } f(5) = 2 \\text{ and } f\'(5) = 4 \\text{, find } (f^{-1})\'(2).',
      steps: [
        { expression: '(f^{-1})\'(x) = \\frac{1}{f\'(f^{-1}(x))}', annotation: 'Write the theorem for the derivative of an inverse function.' },
        { expression: '(f^{-1})\'(2) = \\frac{1}{f\'(f^{-1}(2))}', annotation: 'Substitute x = 2.' },
        { expression: 'f^{-1}(2) = 5', annotation: 'Since f(5) = 2, it implies f^{-1}(2) = 5.' },
        { expression: '(f^{-1})\'(2) = \\frac{1}{f\'(5)}', annotation: 'Substitute 5 for f^{-1}(2).' },
        { expression: '(f^{-1})\'(2) = \\frac{1}{4}', annotation: 'Substitute the given slope f\'(5) = 4.' },
      ],
      conclusion: 'The slope at y=2 on the original function translates to 1/4 at x=2 on the inverse.',
    },
    {
      id: 'ch2-002-ex2',
      title: 'Differentiating an Inverse Trig Function with the Chain Rule',
      problem: '\\text{Find } y\' \\text{ for } y = \\arctan(e^x).',
      steps: [
        { expression: "\\frac{d}{dx}[\\arctan(u)] = \\frac{1}{1+u^2} \\cdot u'", annotation: 'Write the derivative rule for arctan combined with the Chain Rule.' },
        { expression: "u = e^x \\implies u' = e^x", annotation: 'Identify the inside function as e^x and its derivative.' },
        { expression: "y' = \\frac{1}{1+(e^x)^2} \\cdot e^x", annotation: 'Substitute into the Chain Rule formula.' },
        { expression: "y' = \\frac{e^x}{1+e^{2x}}", annotation: 'Simplify the power using (e^x)^2 = e^{2x}.' },
      ],
      conclusion: 'The Chain Rule works seamlessly with inverse trig functions.',
    },
    {
      id: 'ch2-002-ex3',
      title: 'Derivative of arcsin(sqrt(x))',
      problem: '\\text{Find } y\' \\text{ for } y = \\arcsin(\\sqrt{x}).',
      steps: [
        { expression: "\\frac{d}{dx}[\\arcsin(u)] = \\frac{u'}{\\sqrt{1-u^2}}", annotation: 'Use inverse trig derivative with chain rule.' },
        { expression: "u = \\sqrt{x} = x^{1/2},\\; u' = 1/(2\\sqrt{x})", annotation: 'Differentiate inner function.' },
        { expression: "y' = \\frac{1}{2\\sqrt{x}} \\cdot \\frac{1}{\\sqrt{1-(\\sqrt{x})^2}}", annotation: 'Substitute u and u\'.' },
        { expression: "y' = \\frac{1}{2\\sqrt{x}\\sqrt{1-x}}", annotation: 'Simplify (sqrt(x))^2 = x.' },
      ],
      conclusion: "y' = 1/(2sqrt(x)sqrt(1-x)), valid for 0 < x < 1.",
    },
    {
      id: 'ch2-002-ex4',
      title: 'Derivative of arccos(3x)',
      problem: '\\text{Find } y\' \\text{ for } y = \\arccos(3x).',
      steps: [
        { expression: "\\frac{d}{dx}[\\arccos(u)] = -\\frac{u'}{\\sqrt{1-u^2}}", annotation: 'Use arccos derivative rule.' },
        { expression: "u = 3x,\\; u' = 3", annotation: 'Inner derivative.' },
        { expression: "y' = -\\frac{3}{\\sqrt{1-9x^2}}", annotation: 'Substitute and simplify.' },
      ],
      conclusion: "y' = -3/sqrt(1-9x^2), valid for |x| < 1/3.",
    },
  ],

  challenges: [
    {
      id: 'ch2-002-ch1',
      difficulty: 'easy',
      problem: '\\text{Find } \\frac{d}{dx}[\\arcsin(2x)].',
      hint: 'Use arcsin chain rule with u=2x.',
      walkthrough: [
        { expression: "\\frac{d}{dx}[\\arcsin(u)] = \\frac{u'}{\\sqrt{1-u^2}}", annotation: '' },
        { expression: "u=2x,\\;u'=2", annotation: '' },
        { expression: "y'=\\frac{2}{\\sqrt{1-4x^2}}", annotation: '' },
      ],
      answer: '2/sqrt(1-4x^2)',
    },
    {
      id: 'ch2-002-ch2',
      difficulty: 'medium',
      problem: '\\text{Given } f(2)=5, f\'(2)=-3, \\text{ find } (f^{-1})\'(5).',
      hint: 'Use reciprocal slope at corresponding points.',
      walkthrough: [
        { expression: '(f^(-1))\'(x)=1/f\'(f^(-1)(x))', annotation: '' },
        { expression: 'f^(-1)(5)=2', annotation: 'Because f(2)=5.' },
        { expression: '(f^(-1))\'(5)=1/f\'(2)=1/(-3)=-1/3', annotation: '' },
      ],
      answer: '-1/3',
    },
  ],

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'Chain Rule', context: 'Used in both the formal proof and inverse trig compositions.' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Primary method to derive arcsin/arccos/arctan formulas.' },
    { lessonSlug: 'trig-derivatives', label: 'Trig Derivatives', context: 'Inverse trig results rely on base trig derivative identities.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'solved-challenge',
  ],
}
