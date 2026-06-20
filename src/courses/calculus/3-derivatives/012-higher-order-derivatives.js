export default {
  id: 'ch2-higher-order-derivatives',
  slug: 'higher-order-derivatives',
  chapter: 2,
  order: 9,
  title: 'Higher-Order Derivatives',
  subtitle: 'Derivatives of derivatives — acceleration, concavity, and the language of motion',
  tags: ['higher-order-derivatives', 'second-derivative', 'acceleration', 'concavity', 'notation', 'f-prime-prime', 'jerk', 'nth-derivative'],

  hook: {
    question: 'If the derivative of position is velocity, what is the derivative of velocity?',
    realWorldContext:
      'Acceleration — the rate at which velocity changes. Your car\'s speedometer measures velocity (first derivative of position). ' +
      'When you press the gas pedal, you feel acceleration pushing you into your seat (second derivative). ' +
      'Fighter pilots experience "jerk" — the derivative of acceleration, the third derivative of position — ' +
      'when maneuvers change rapidly. NASA engineers specify maximum jerk tolerances for human spaceflight. ' +
      'In economics, the second derivative of profit describes whether marginal returns are increasing or decreasing. ' +
      'In physics, the equation F = ma is literally a second-order differential equation: F = m·x\'\'.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'The derivative f\'(x) is a new function. Since it\'s a function, we can differentiate it again. ' +
          'The result is the **second derivative** f\'\'(x), which measures how quickly the slope is changing.',
          'If f measures position, then f\' = velocity (how fast position changes) and f\'\' = acceleration (how fast velocity changes). ' +
          'The second derivative is also the mathematical foundation of **concavity** — whether a curve bends upward or downward.',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'intuition',
          title: 'The Physical Chain',
          body: 'Position:      s(t)\n' +
                'Velocity:      s\'(t) = v(t)  — how fast you\'re moving\n' +
                'Acceleration:  s\'\'(t) = v\'(t) = a(t)  — how fast velocity changes\n' +
                'Jerk:          s\'\'\'(t) = a\'(t)  — how fast acceleration changes\n' +
                'Snap/Jounce:   s⁽⁴⁾(t)  — used in some engineering specs\n\n' +
                'Each level tells you something different about the motion.',
        },
      },
      {
        type: 'viz',
        id: 'HigherOrderDerivativesExplorer',
        title: 'Position, Velocity, Acceleration Explorer',
        mathBridge:
          'Given s(t) = t³ − 3t, the velocity is v(t) = 3t² − 3 and acceleration is a(t) = 6t. ' +
          'When a(t) > 0, velocity is increasing (speeding up in positive direction). ' +
          'When a(t) < 0, velocity is decreasing (slowing down or speeding up in negative direction).',
        caption: 'Watch all three graphs simultaneously. Positive acceleration means the velocity curve is rising, which means the position curve is concave up.',
      },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Higher-Order Derivative Notation',
          body: '\\text{First: } f\'(x) = \\frac{df}{dx} = \\frac{d}{dx}f \\\\ \\text{Second: } f\'\'(x) = \\frac{d^2f}{dx^2} = \\frac{d}{dx}\\left(\\frac{df}{dx}\\right) \\\\ \\text{Third: } f\'\'\'(x) = \\frac{d^3f}{dx^3} \\\\ \\text{n-th: } f^{(n)}(x) = \\frac{d^nf}{dx^n} \\qquad (\\text{parentheses avoid confusion with powers: } f^{(4)} \\neq f^4)',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'Why d²f/dx² — What Does the Notation Mean?',
          body: '\\frac{d^2f}{dx^2} means \\frac{d}{dx}\\left(\\frac{df}{dx}\\right) — apply d/dx twice. \\\\ \\text{Think of } \\frac{d}{dx} \\text{ as an operator. Applying it twice gives } \\left(\\frac{d}{dx}\\right)^2 f. \\\\ \\text{The "2" in numerator counts applications; in denominator, } (dx)^2 \\text{ tracks the units: } \\frac{\\text{m/s}}{\\text{s}} = \\text{m/s}^2.',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Computing higher-order derivatives: just differentiate repeatedly.**',
          'There is no new technique — apply all the rules from Chapters 2–4 (chain rule, product rule, etc.) each time. ' +
          'The only challenge is that expressions get more complex with each step.',
          '**Special patterns:**',
          '• f(x) = xⁿ: f⁽ᵏ⁾(x) = n!/(n−k)! · xⁿ⁻ᵏ for k ≤ n; f⁽ⁿ⁺¹⁾(x) = 0 (polynomials vanish after enough derivatives)',
          '• f(x) = eˣ: f⁽ⁿ⁾(x) = eˣ (all derivatives are eˣ — the defining property of e)',
          '• f(x) = sin(x): cycles every 4 derivatives: sin, cos, −sin, −cos, sin, ...',
          '• f(x) = cos(x): cycles every 4: cos, −sin, −cos, sin, cos, ...',
          '• f(x) = ln(x): f\' = 1/x, f\'\' = −1/x², f\'\'\' = 2/x³, f⁽⁴⁾ = −6/x⁴, ..., f⁽ⁿ⁾ = (−1)ⁿ⁻¹(n−1)!/xⁿ',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Second Derivative and Concavity',
          body: 'f\'\'(x) > 0 \\text{ on an interval} \\implies f \\text{ is concave UP (bowl shape, }\\cup\\text{)} \\\\ f\'\'(x) < 0 \\text{ on an interval} \\implies f \\text{ is concave DOWN (dome shape, }\\cap\\text{)} \\\\ f\'\'(c) = 0 \\text{ is required (not sufficient) for an inflection point at } x = c',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Why does f\'\' > 0 mean concave up?** Because concave up means "the slope is increasing" — as x increases, the tangent lines tilt more steeply upward. ' +
          'The slope of the tangent line is f\'(x). f\'\' = (f\')\' measures how quickly f\' changes. ' +
          'If f\'\' > 0, then f\' is increasing → the function is concave up. Clean and logical.',
        ],
      },
    ],
  },

  rigor: {
    prose: [
      'A function is said to be **C^n** (n-times continuously differentiable) if f, f\', f\'\', ..., f⁽ⁿ⁾ all exist and are continuous. ' +
      'C^∞ (smooth) functions have derivatives of all orders. Examples: polynomials, eˣ, sin(x), cos(x).',
      'Not all differentiable functions are twice differentiable. The function f(x) = x|x| has f\'(x) = 2|x|, which is differentiable everywhere (f\'\'(x) = 2 for x > 0, −2 for x < 0 — but f\'\'(0) does not exist as a two-sided limit). ' +
      'So f ∈ C¹ but f ∉ C².',
      '**Newton\'s Second Law** F = ma is a second-order ODE (ordinary differential equation): F(x, x\', t) = m·x\'\'. ' +
      'Higher-order differential equations appear throughout physics and engineering, ' +
      'and their order is the order of the highest derivative present. ' +
      'Learning to compute f\'\'(x) is the first step toward solving these.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The n-th Derivative of sin and cos',
        body: '\\frac{d^n}{dx^n}\\sin(x) = \\sin\\!\\left(x + \\frac{n\\pi}{2}\\right) \\\\ \\frac{d^n}{dx^n}\\cos(x) = \\cos\\!\\left(x + \\frac{n\\pi}{2}\\right) \\\\ \\text{Memorize the cycle: sin, cos, -sin, -cos, sin, ...}',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-polynomial-higher',
      title: 'Higher-Order Derivatives of a Polynomial',
      problem: 'Find f\'(x), f\'\'(x), f\'\'\'(x), and f⁽⁴⁾(x) for f(x) = x⁴ − 3x³ + 2x − 7.',
      steps: [
        {
          expression: 'f\'(x) = 4x^3 - 9x^2 + 2',
          annotation: 'Power rule on each term. The constant −7 vanishes.',
        },
        {
          expression: 'f\'\'(x) = 12x^2 - 18x',
          annotation: 'Differentiate f\'.',
        },
        {
          expression: 'f\'\'\'(x) = 24x - 18',
          annotation: 'Differentiate f\'\'.',
        },
        {
          expression: 'f^{(4)}(x) = 24',
          annotation: 'Differentiate f\'\'\'. Constant.',
        },
        {
          expression: 'f^{(5)}(x) = 0 \\text{ and all higher derivatives are 0.}',
          annotation: 'A degree-4 polynomial vanishes after 5 differentiations. This is always true: f⁽ⁿ⁺¹⁾ = 0 for degree-n polynomials.',
        },
      ],
      conclusion: 'Each differentiation reduces the degree by 1. A degree-4 polynomial has 5 non-trivial higher-order derivatives (f through f⁽⁴⁾), then all subsequent ones are zero.',
    },
    {
      id: 'ex-trig-higher',
      title: 'The n-th Derivative of sin(x)',
      problem: 'Find the 47th derivative of f(x) = sin(x).',
      steps: [
        {
          expression: 'f\'(x) = \\cos x, \\quad f\'\'(x) = -\\sin x, \\quad f\'\'\'(x) = -\\cos x, \\quad f^{(4)}(x) = \\sin x',
          annotation: 'The cycle of 4 repeats.',
        },
        {
          expression: '47 = 4 \\cdot 11 + 3 \\quad \\text{(remainder 3)}',
          annotation: 'Divide 47 by 4. The remainder determines the position in the cycle.',
        },
        {
          expression: '\\text{Remainder 1} \\to \\cos x \\quad \\text{Remainder 2} \\to -\\sin x \\quad \\text{Remainder 3} \\to -\\cos x',
          annotation: '',
        },
        {
          expression: 'f^{(47)}(x) = -\\cos x',
          annotation: 'Remainder 3 → the third step in the cycle (sin → cos → −sin → −cos) is −cos x.',
        },
      ],
      conclusion: 'f⁽⁴⁷⁾(x) = −cos(x). The cycle-of-4 property is unique to sin and cos — it\'s why these functions are solutions to differential equations of the form f\'\' = −f.',
    },
    {
      id: 'ex-implicit-second',
      title: 'Second Derivative via Implicit Differentiation',
      problem: 'Find y\'\' given x² + y² = 25 (a circle of radius 5).',
      steps: [
        {
          expression: '\\frac{d}{dx}(x^2 + y^2) = \\frac{d}{dx}(25)',
          annotation: 'Differentiate both sides implicitly.',
        },
        {
          expression: '2x + 2y \\cdot y\' = 0 \\implies y\' = -\\frac{x}{y}',
          annotation: 'First derivative (already known from implicit differentiation lesson).',
        },
        {
          expression: 'y\'\' = -\\frac{y \\cdot (x)\' - x \\cdot y\'}{y^2} = -\\frac{y - x \\cdot y\'}{y^2}',
          annotation: 'Differentiate y\' = −x/y using the quotient rule.',
        },
        {
          expression: '= -\\frac{y - x(-x/y)}{y^2} = -\\frac{y + x^2/y}{y^2}',
          annotation: 'Substitute y\' = −x/y.',
        },
        {
          expression: '= -\\frac{y^2 + x^2}{y^3} = -\\frac{25}{y^3}',
          annotation: 'Multiply numerator and denominator by y, then use x² + y² = 25.',
        },
      ],
      conclusion: 'y\'\' = −25/y³. This tells us the circle is concave down (y\'\' < 0) on the top half (y > 0) and concave up (y\'\' > 0) on the bottom half (y < 0). Geometrically perfect for a circle.',
    },
  ],

  challenges: [
    {
      id: 'ch2-hod-c1',
      difficulty: 'easy',
      problem: 'Find f⁽¹⁰⁰⁾(x) for f(x) = e^{2x}.',
      hint: 'f\' = 2e^{2x}, f\'\' = 4e^{2x}, f\'\'\' = 8e^{2x}. What is the pattern?',
      walkthrough: [
        { expression: 'f^{(n)}(x) = 2^n e^{2x}', annotation: 'Each differentiation multiplies by 2 (chain rule with inner function 2x).' },
        { expression: 'f^{(100)}(x) = 2^{100} e^{2x}', annotation: '' },
      ],
      answer: '2¹⁰⁰ e^{2x}',
    },
    {
      id: 'ch2-hod-c2',
      difficulty: 'medium',
      problem: 'A particle moves along the x-axis with position s(t) = t³ − 6t² + 9t + 2. Find when the particle is speeding up and slowing down on [0, 4].',
      hint: 'The particle speeds up when velocity and acceleration have the same sign. Find v(t) = s\'(t) and a(t) = s\'\'(t), then analyze their signs.',
      walkthrough: [
        { expression: 'v(t) = s\'(t) = 3t^2 - 12t + 9 = 3(t-1)(t-3)', annotation: 'Zero at t = 1 and t = 3.' },
        { expression: 'a(t) = s\'\'(t) = 6t - 12 = 6(t-2)', annotation: 'Zero at t = 2.' },
        { expression: 't\\in(0,1): v>0,\\;a<0 \\to \\text{slowing down} \\quad t\\in(1,2): v<0,\\;a<0 \\to \\text{speeding up}', annotation: '' },
        { expression: 't\\in(2,3): v<0,\\;a>0 \\to \\text{slowing down} \\quad t\\in(3,4): v>0,\\;a>0 \\to \\text{speeding up}', annotation: '' },
      ],
      answer: 'Speeding up on (1, 2) and (3, 4); slowing down on (0, 1) and (2, 3).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'differentiation-rules', label: 'Prerequisite: Differentiation Rules', context: 'Apply the same rules repeatedly.' },
    { lessonSlug: 'implicit-differentiation', label: 'Related: Implicit Differentiation', context: 'Computing y\'\' implicitly requires substituting y\'.' },
    { lessonSlug: 'curve-sketching', label: 'Next Use: Curve Sketching (Ch. 3)', context: 'f\'\' determines concavity and inflection points.' },
    { lessonSlug: 'taylor-maclaurin', label: 'Next Use: Taylor Series (Ch. 5)', context: 'Taylor series coefficients are f⁽ⁿ⁾(a)/n! — all higher derivatives.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'If position is s(t), what does the second derivative s\'\'(t) represent?',
      options: [
        'Velocity — the rate of change of position',
        'Acceleration — the rate of change of velocity, or equivalently, how fast the velocity is changing',
        'Jerk — the rate at which acceleration changes',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'f\'\'(x) > 0 on an interval. What does this say about the graph of f on that interval?',
      options: [
        'f is increasing on that interval — a positive second derivative means f is going up',
        'f is concave up — the first derivative f\' is increasing, so the slope is getting steeper (the graph curves upward like a bowl)',
        'f has a local minimum on that interval — positive second derivative always indicates a minimum',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What is the nth derivative of sin(x)?',
      options: [
        'It alternates in a 4-cycle: sin(x), cos(x), −sin(x), −cos(x), and then repeats — so the nth derivative depends on n mod 4',
        'It is always ±sin(x) — the derivative of sine cycles only between sine and negative sine',
        'It is (−1)ⁿ sin(x) — the sign alternates with each differentiation regardless of cosine',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The second derivative test says: if f\'(a) = 0 and f\'\'(a) > 0, then f has a local minimum at a. Why does the positive second derivative indicate a minimum (not maximum)?',
      options: [
        'Because f\'\'(a) > 0 means the function is increasing at a, and an increasing function cannot have a maximum',
        'Because f\'\'(a) > 0 means f\' is increasing at a; since f\'(a) = 0 and the slope is increasing, the slope was negative just before a and positive just after — that pattern is exactly a local minimum',
        'Because the second derivative test only applies at minima; for maxima you must use the first derivative test instead',
      ],
      correct: 1,
    },
  ],
}
