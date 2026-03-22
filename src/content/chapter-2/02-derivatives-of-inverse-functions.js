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
        id: 'VideoEmbed',
        title: "Derivative of Inverse Trig Functions via Implicit Differentiation",
        props: { url: "https://www.youtube.com/embed/fnVMT08u6fU" }
      },
      {
        id: 'InverseSlopeReflectionLab',
        title: 'Slope Reciprocity via Reflection',
        mathBridge: 'Reflection across $y = x$ swaps every $(a, b)$ to $(b, a)$. Because the axes are swapped, every rise becomes a run and vice versa — so the slope $\\frac{\\Delta y}{\\Delta x}$ at $(a, b)$ becomes $\\frac{\\Delta x}{\\Delta y} = \\frac{1}{\\text{slope}}$ at $(b, a)$. That is the entire geometric content of $(f^{-1})\'(b) = 1/f\'(a)$. Drag the point to verify the product of slopes is always 1.',
        caption: 'Drag the point on f(x) = x². The mirrored green point on f⁻¹(x) = √x always carries the reciprocal slope. Their product is always 1.',
      },
      {
        id: 'DualGraphSync',
        title: 'Reflection and Reciprocal Slopes (Symbolic View)',
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
    visualizations: [
      {
        id: 'InverseSlopeReflectionLab',
        title: 'The Rule in Action: f(x) = x²',
        mathBridge: 'The theorem says $(f^{-1})\'(x) = 1/f\'(f^{-1}(x))$. Here $f(x) = x^2$, so $f^{-1}(x) = \\sqrt{x}$ and $f\'(x) = 2x$. Therefore $(f^{-1})\'(x) = 1/(2\\sqrt{x})$ — exactly the derivative of $\\sqrt{x}$ by the power rule. The graph makes this formula geometric: reflection swaps axes, and swapping axes flips the fraction $\\Delta y / \\Delta x$ to $\\Delta x / \\Delta y$.',
        caption: 'Verify the formula numerically: move to any a, read f\'(a) = 2a, then check that (f⁻¹)\'(a²) = 1/(2a). Product is always 1.',
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
    visualizations: [
      {
        id: 'ArcTanDerivationLab',
        title: 'arctan Derivative: Full Geometric Proof',
        mathBridge: 'The proof has three moves: (1) rewrite $y = \\arctan x$ as $\\tan y = x$; (2) differentiate implicitly to get $\\sec^2(y)\\cdot dy/dx = 1$; (3) read $\\sec^2(y) = 1 + \\tan^2(y) = 1 + x^2$ from the right triangle. The triangle in the visualization makes step (3) concrete — you can see the hypotenuse $\\sqrt{1+x^2}$ growing as $x$ grows, and $\\cos^2(y) = 1/(1+x^2)$ directly from the adjacent/hypotenuse ratio.',
        caption: 'Drag x and watch the triangle update. Each proof step stays fixed — only the live numerical values change. This is implicit differentiation made visual.',
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
      visualizations: [
        {
          id: 'InverseSlopeReflectionLab',
          title: 'Why the Slope Becomes 1/4',
          mathBridge: 'In the example, $f\'(5) = 4$ and we need $(f^{-1})\'(2)$. The point $(5, 2)$ on $f$ maps to $(2, 5)$ on $f^{-1}$ by reflection across $y = x$. At $(5, 2)$ the slope is 4 (rise 1 per run 0.25). At the reflected point $(2, 5)$ the axes are swapped, so slope = $1/4$. The lab shows the same thing for $f(x) = x^2$: move to $a = \\sqrt{5} \\approx 2.24$ to see slopes 4 and 0.25.',
          caption: 'Set a ≈ 2.24. The blue slope will be ≈ 4.47 (= 2a) and the green slope will be ≈ 0.224 (= 1/(2a)). This is the same reciprocal relationship as in the example.',
        },
      ],
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
      visualizations: [
        {
          id: 'ArcTanDerivationLab',
          title: 'Where 1/(1+u²) Comes From',
          mathBridge: 'The formula $\\frac{d}{dx}[\\arctan u] = \\frac{1}{1+u^2}$ is proved in the lab: implicit differentiation of $\\tan y = u$ gives $\\sec^2(y)\\cdot dy/du = 1$, then the triangle shows $\\sec^2 y = 1 + u^2$. In this example $u = e^x$, so the $1+u^2$ term becomes $1 + e^{2x}$. Set $x \\approx 0$ in the lab (so $u = e^0 = 1$, $x_{\\text{lab}} = 1$) to verify $1/(1+1^2) = 0.5$ for the base arctan derivative before the chain rule multiplies by $u\' = e^x$.',
          caption: 'Drag x in the lab to see how the triangle and the result 1/(1+x²) vary. For ex. 2, substitute u = eˣ into this result and multiply by (eˣ)\'.',
        },
      ],
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
      visualizations: [
        {
          id: 'ArcTanDerivationLab',
          title: 'The arcsin Triangle (same proof structure)',
          mathBridge: 'The arcsin proof is structurally identical to arctan: let $y = \\arcsin x$, so $\\sin y = x$. Implicit differentiation gives $\\cos y \\cdot dy/dx = 1$, hence $dy/dx = 1/\\cos y$. From a unit-circle right triangle with $\\sin y = x$: $\\cos y = \\sqrt{1-x^2}$, giving $dy/dx = 1/\\sqrt{1-x^2}$. The ArcTan lab uses $\\tan y = x$, so the hypotenuse is $\\sqrt{1+x^2}$; for arcsin, the hypotenuse is 1 (unit circle) and the adjacent is $\\sqrt{1-x^2}$ — same two-step logic, different triangle.',
          caption: 'Compare the arctan triangle here with the arcsin triangle: the role of hypotenuse and adjacent swap. Both proofs use the same implicit differentiation + triangle reading strategy.',
        },
      ],
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
      visualizations: [
        {
          id: 'ArcTanDerivationLab',
          title: 'Why the Chain Rule Multiplies in a Factor of 3',
          mathBridge: 'The base formula $\\frac{d}{dx}[\\arccos u] = -1/\\sqrt{1-u^2}$ has $u\' = 3$ here (since $u = 3x$). The chain rule says multiply the outer derivative by $u\'$: $-1/\\sqrt{1-9x^2} \\cdot 3 = -3/\\sqrt{1-9x^2}$. The ArcTan lab shows the same chain-rule structure for arctan — the inner function derivative multiplies the outer. Note also the minus sign: arccos and arcsin are complementary ($\\arcsin x + \\arccos x = \\pi/2$), so their derivatives are negatives of each other.',
          caption: 'The proof structure (implicit diff → triangle reading) is the same for arccos as for arctan. The only differences are which leg is which in the triangle and the sign.',
        },
      ],
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
