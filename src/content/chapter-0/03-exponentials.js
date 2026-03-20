export default {
  id: 'ch0-exponentials',
  slug: 'exponentials',
  chapter: 0,
  order: 3,
  title: 'Exponentials & Logarithms',
  subtitle: 'Functions that grow (and shrink) at rates proportional to their size',
  tags: ['exponentials', 'logarithms', 'natural log', 'e', 'base', 'growth', 'decay', 'inverse'],

  hook: {
    question: 'If a population doubles every 3 hours, how do you model its size at any time?',
    realWorldContext:
      'Bacteria, compound interest, radioactive decay, epidemics, viral videos — all follow exponential models. ' +
      'The defining feature of exponential growth: the rate of change is proportional to the current value. ' +
      'This property makes the number e = 2.71828… special: e^x is the unique function that equals its own derivative. ' +
      'You\'ll see e appear everywhere in calculus because nature loves it.',
    previewVisualizationId: 'ExponentialGrowth',
  },

  intuition: {
    prose: [
      'Doubling repeatedly: 1 → 2 → 4 → 8 → 16 → … After n doublings you have 2ⁿ. ' +
      'This is exponential growth with base 2. The base determines how fast things grow.',
      'Now consider: is there a base b such that the function b^x grows at exactly the same rate as its own value? ' +
      'Yes — and that base is e ≈ 2.71828. This is why e^x is called the **natural exponential**.',
      'The **logarithm** is the inverse of exponentiation. If b^x = y, then log_b(y) = x. ' +
      'The logarithm asks: "what power do I raise b to in order to get y?"',
      'The **natural logarithm** ln(x) = log_e(x) is the inverse of e^x. ' +
      'If you want to "undo" e^x, apply ln. If you want to "undo" ln(x), apply e^x.',
      'Logarithms turn multiplication into addition, division into subtraction, and powers into multiplication. ' +
      'This made them the primary tool for computation before calculators — and they still appear everywhere in calculus.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'What makes e special?',
        body: 'The function f(x) = e^x is the ONLY function (up to scalar multiples) where f\'(x) = f(x). Its rate of change equals its value.',
      },
    ],
    visualizationId: 'ExponentialGrowth',
    visualizationProps: { base: Math.E },
  },

  math: {
    prose: [
      'The **laws of exponents** (for any base b > 0, b ≠ 1):',
      'The **laws of logarithms** follow directly from the exponent laws:',
      'The **change of base formula** lets you compute any log using ln or log₁₀:',
      'For solving exponential equations, apply ln to both sides. For solving logarithmic equations, exponentiate both sides.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Laws of Exponents',
        body: 'b^x \\cdot b^y = b^{x+y} \\qquad \\dfrac{b^x}{b^y} = b^{x-y} \\qquad (b^x)^y = b^{xy} \\qquad b^0 = 1',
      },
      {
        type: 'theorem',
        title: 'Laws of Logarithms',
        body: '\\ln(xy) = \\ln x + \\ln y \\qquad \\ln\\!\\left(\\dfrac{x}{y}\\right) = \\ln x - \\ln y \\qquad \\ln(x^r) = r\\ln x',
      },
      {
        type: 'definition',
        title: 'Change of Base',
        body: '\\log_b x = \\dfrac{\\ln x}{\\ln b} = \\dfrac{\\log x}{\\log b}',
      },
    ],
    visualizationId: 'ExponentialGrowth',
    visualizationProps: { showLog: true },
  },

  rigor: {
    prose: [
      'The number e can be defined rigorously in several equivalent ways:',
      'The natural logarithm can be defined as an integral: ln(x) = ∫₁ˣ (1/t) dt for x > 0. ' +
      'This definition makes proving its properties (especially the derivative) completely rigorous without circular reasoning.',
      'Compound interest motivates e: if \\$1 is invested at 100% annual interest compounded n times per year, the value after one year is (1 + 1/n)^n. As n → ∞, this approaches e.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Definitions of e',
        body: 'e = \\lim_{n \\to \\infty}\\left(1 + \\frac{1}{n}\\right)^n = \\sum_{n=0}^{\\infty} \\frac{1}{n!} = 1 + 1 + \\frac{1}{2} + \\frac{1}{6} + \\frac{1}{24} + \\cdots',
      },
      {
        type: 'definition',
        title: 'Natural Log as Integral',
        body: '\\ln x = \\int_1^x \\frac{1}{t}\\, dt \\qquad (x > 0)',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-exp-equation',
      title: 'Solving an Exponential Equation',
      problem: 'Solve 3^{2x-1} = 27.',
      steps: [
        { expression: '3^{2x-1} = 27', annotation: 'Write 27 as a power of 3.' },
        { expression: '3^{2x-1} = 3^3', annotation: '27 = 3³.' },
        { expression: '2x - 1 = 3', annotation: 'Since the bases are equal and b > 0, b ≠ 1: the exponents must be equal.' },
        { expression: '2x = 4', annotation: 'Add 1 to both sides.' },
        { expression: 'x = 2', annotation: 'Divide by 2.' },
      ],
      conclusion: 'x = 2. Check: 3^(2·2−1) = 3³ = 27. ✓',
    },
    {
      id: 'ex-exp-ln',
      title: 'Solving with Logarithms',
      problem: 'Solve 5^x = 17 for x.',
      steps: [
        { expression: '5^x = 17', annotation: 'The bases cannot be matched, so take ln of both sides.' },
        { expression: '\\ln(5^x) = \\ln 17', annotation: 'Apply ln to both sides.' },
        { expression: 'x \\ln 5 = \\ln 17', annotation: 'Use the power rule of logs: ln(5^x) = x · ln 5.' },
        { expression: 'x = \\frac{\\ln 17}{\\ln 5}', annotation: 'Divide both sides by ln 5.' },
        { expression: 'x \\approx \\frac{2.8332}{1.6094} \\approx 1.760', annotation: 'Numerical evaluation.' },
      ],
      conclusion: 'x = ln(17)/ln(5) ≈ 1.760. This can also be written log₅(17).',
    },
    {
      id: 'ex-log-equation',
      title: 'Solving a Logarithmic Equation',
      problem: 'Solve \\ln(x+2) + \\ln(x-1) = \\ln(4x).',
      steps: [
        { expression: '\\ln(x+2) + \\ln(x-1) = \\ln(4x)', annotation: 'Use the log product rule on the left.' },
        { expression: '\\ln[(x+2)(x-1)] = \\ln(4x)', annotation: 'Product rule: ln A + ln B = ln(AB).' },
        { expression: '(x+2)(x-1) = 4x', annotation: 'Since ln is one-to-one: if ln(A) = ln(B) then A = B.' },
        { expression: 'x^2 + x - 2 = 4x', annotation: 'Expand the left side.' },
        { expression: 'x^2 - 3x - 2 = 0', annotation: 'Subtract 4x from both sides.' },
        { expression: 'x = \\frac{3 \\pm \\sqrt{9 + 8}}{2} = \\frac{3 \\pm \\sqrt{17}}{2}', annotation: 'Quadratic formula with a=1, b=−3, c=−2.' },
        { expression: 'x = \\frac{3 + \\sqrt{17}}{2} \\approx 3.56', annotation: 'Check domains: we need x+2 > 0, x−1 > 0, 4x > 0. So x > 1. The negative root (≈ −0.56) fails this.' },
      ],
      conclusion: 'One solution: x = (3 + √17)/2 ≈ 3.56. Always check that your solution is in the domain of each logarithm.',
    },
  ],

  challenges: [
    {
      id: 'ch0-exp-c1',
      difficulty: 'medium',
      problem: 'A population P of bacteria starts at 1000 and doubles every 2 hours. Write an equation for P(t) where t is in hours, then find when P = 10{,}000.',
      hint: 'Each 2-hour period multiplies the population by 2. After t hours, there have been t/2 periods.',
      walkthrough: [
        { expression: 'P(t) = 1000 \\cdot 2^{t/2}', annotation: 'After t/2 doublings, multiply initial value by 2^(t/2).' },
        { expression: '10{,}000 = 1000 \\cdot 2^{t/2}', annotation: 'Set P(t) = 10,000.' },
        { expression: '10 = 2^{t/2}', annotation: 'Divide both sides by 1000.' },
        { expression: '\\ln 10 = \\frac{t}{2} \\ln 2', annotation: 'Take ln of both sides, apply power rule.' },
        { expression: 't = \\frac{2 \\ln 10}{\\ln 2} = 2\\log_2 10 \\approx 6.64 \\text{ hours}', annotation: '' },
      ],
      answer: 'P(t) = 1000·2^(t/2); P = 10,000 when t ≈ 6.64 hours',
    },
  ],

  crossRefs: [
    { lessonSlug: 'trig-review', label: 'Previous: Trigonometry', context: 'The other essential function family.' },
    { lessonSlug: 'limits/introduction', label: 'Next: Limits', context: 'Chapter 1 begins — the core concept of calculus.' },
    { lessonSlug: 'derivatives/exp-derivatives', label: 'Future: Derivatives of e^x and ln x', context: 'Why e^x is so special in calculus.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}
