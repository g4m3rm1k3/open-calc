export default {
  id: 'ch0-exponentials',
  slug: 'exponentials',
  chapter: 0,
  order: 3,
  title: 'Exponentials & Logarithms',
  subtitle: 'Functions that grow (and shrink) at rates proportional to their size',
  tags: ['exponentials', 'logarithms', 'natural log', 'e', 'base', 'growth', 'decay', 'inverse', 'compound interest'],

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
      'You already understand exponential growth — you just might not know it yet. If someone offered you a choice between $1,000,000 today or a penny that doubles every day for 30 days, which would you choose? The penny starts laughably small: 1¢, 2¢, 4¢, 8¢… After 10 days you have only $5.12. After 20 days, $5,242.88. But after 30 days? $5,368,709.12 — over five million dollars. That is the power of exponential growth: it starts slow and then explodes.',
      'Doubling repeatedly: 1 → 2 → 4 → 8 → 16 → … After n doublings you have 2ⁿ. This is exponential growth with base 2. The base determines how fast things grow. Base 3 would give you 1 → 3 → 9 → 27 → 81 (faster), while base 1.1 gives you 1 → 1.1 → 1.21 → 1.331 (slower but still exponential).',
      'Here is the key idea that makes exponential functions special: **the rate of growth is proportional to the current size**. A colony of 1,000 bacteria doubling means 1,000 new bacteria. A colony of 1,000,000 doubling means 1,000,000 new bacteria. The bigger it is, the faster it grows. This is fundamentally different from linear growth (adding the same amount each time) or quadratic growth (adding an increasing but predictable amount).',
      'Now consider: is there a base b such that the function b^x grows at exactly the same rate as its own value? Yes — and that base is e ≈ 2.71828. This is why e^x is called the **natural exponential**. It is the one exponential function where the derivative equals the function itself. In calculus, this makes e^x far easier to work with than 2^x or 10^x.',
      'The **logarithm** is the inverse of exponentiation. If b^x = y, then log_b(y) = x. The logarithm asks: "what power do I raise b to in order to get y?" For example, log₂(8) = 3 because 2³ = 8. And log₁₀(1000) = 3 because 10³ = 1000.',
      'The **natural logarithm** ln(x) = log_e(x) is the inverse of e^x. If you want to "undo" e^x, apply ln. If you want to "undo" ln(x), apply e^x. These two functions are perfect mirrors: ln(e^x) = x and e^(ln x) = x.',
      'Logarithms turn multiplication into addition, division into subtraction, and powers into multiplication. This made them the primary tool for computation before calculators — and they still appear everywhere in calculus, physics, information theory, and music (decibels and pitch intervals are logarithmic).',
      'Exponential **decay** is just growth with a negative exponent: e^(-x) shrinks as x increases. Radioactive half-lives, cooling objects, and drug concentration in the bloodstream all follow exponential decay. If something has a half-life of T hours, after t hours you have (1/2)^(t/T) of the original — which is the same as e^(-t·ln2/T).',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'You Already Know This',
        body: 'You\'ve used exponents since grade school: 2³ = 8, 10² = 100. An exponential FUNCTION just lets the exponent vary: f(x) = 2^x asks "what is 2 raised to the x power?" for any x, not just whole numbers.',
      },
      {
        type: 'insight',
        title: 'What makes e special?',
        body: 'The function f(x) = e^x is the ONLY function (up to scalar multiples) where f\'(x) = f(x). Its rate of change equals its value.',
      },
      {
        type: 'misconception',
        title: 'e^(a+b) ≠ e^a + e^b',
        body: "\\text{WRONG: } e^{a+b} = e^a + e^b. \\quad \\text{RIGHT: } e^{a+b} = e^a \\cdot e^b. \\quad \\text{Exponents ADD inside, but factors MULTIPLY outside.}",
      },
      {
        type: 'real-world',
        title: 'The Rule of 72',
        body: 'At r% annual interest, your money doubles in approximately 72/r years. At 6%, doubling takes about 12 years. This rule works because ln(2) ≈ 0.693 ≈ 72/100 when adjusted for percentage.',
      },
    ],
    visualizations: [
      {
        id: 'ExponentialGrowth',
        props: { base: Math.E },
        title: 'Exponential Growth: Adjust the Base',
        caption: 'Drag the slider to change the base. Notice how base > 1 gives growth, base = 1 is constant, and 0 < base < 1 gives decay. The natural base e ≈ 2.718 is highlighted.',
      },
      {
        id: 'ExponentialSlopeAtZero',
        title: 'Why e? The Slope at x = 0',
        caption: 'For f(x) = bˣ, the slope at x = 0 equals ln(b). When b = e, the slope is exactly 1 — meaning f\'(0) = f(0). This is what makes e "natural."',
      },
    ],
  },

  math: {
    prose: [
      'The **laws of exponents** (for any base b > 0, b ≠ 1):',
      'The **laws of logarithms** follow directly from the exponent laws. Each log law is just an exponent law rewritten in logarithmic form:',
      'The **change of base formula** lets you compute any log using ln or log₁₀: $\\log_b x = \\frac{\\ln x}{\\ln b}$. This is essential when your calculator only has ln and log₁₀ buttons.',
      'For solving exponential equations, apply ln to both sides. For solving logarithmic equations, exponentiate both sides. The key principle: **ln and e^x are inverse operations**, just like addition and subtraction.',
      'The **domain** of ln(x) is x > 0 (you cannot take the logarithm of zero or a negative number). The **range** of ln(x) is all real numbers. The **domain** of e^x is all real numbers, and its **range** is (0, ∞) — exponentials are always positive.',
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
      {
        type: 'misconception',
        title: 'ln(a + b) ≠ ln(a) + ln(b)',
        body: "\\text{WRONG: } \\ln(a + b) = \\ln a + \\ln b. \\quad \\text{RIGHT: } \\ln(ab) = \\ln a + \\ln b. \\quad \\text{Log of a PRODUCT splits, not a sum.}",
      },
    ],
    visualizationId: 'ExponentialGrowth',
    visualizationProps: { showLog: true },
  },

  rigor: {
    prose: [
      'The number e can be defined rigorously in several equivalent ways. We present the three most important:',
      'The **limit definition**: $e = \\lim_{n \\to \\infty}(1 + 1/n)^n$. This comes from compound interest: if $1 is invested at 100% annual interest compounded n times per year, the balance after one year is $(1 + 1/n)^n$. As n → ∞ (continuous compounding), this approaches e.',
      'The **series definition**: $e = \\sum_{n=0}^{\\infty} 1/n! = 1 + 1 + 1/2 + 1/6 + 1/24 + \\cdots$ This series converges extremely fast — just 10 terms gives e accurate to 7 decimal places.',
      'The **integral definition of ln**: $\\ln(x) = \\int_1^x (1/t)\\, dt$ for x > 0. This definition makes proving logarithm properties completely rigorous without circular reasoning. We then define e as the unique number satisfying ln(e) = 1.',
      'The fact that these three definitions all give the same number (e ≈ 2.71828182845904…) is a theorem that requires proof. The equivalence is usually shown in a first course in real analysis.',
      'An important fact: e is **irrational** (proved by Euler in 1737) and **transcendental** (proved by Hermite in 1873). This means e cannot be expressed as a fraction or as a root of any polynomial with integer coefficients.',
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
      {
        type: 'history',
        title: 'The Discovery of e',
        body: "Jacob Bernoulli discovered e in 1683 while studying compound interest. Euler named it 'e' around 1731 and computed its value to 18 decimal places. The letter e likely stands for 'exponential' — not for Euler, despite the common myth.",
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
    {
      id: 'ex-compound-interest',
      title: 'Compound Interest',
      problem: '\\text{If } \\$5{,}000 \\text{ is invested at 8\\% annual interest compounded quarterly, what is the balance after 6 years?}',
      steps: [
        { expression: 'A = P\\left(1 + \\frac{r}{n}\\right)^{nt}', annotation: 'The compound interest formula: P = principal, r = annual rate, n = compounds per year, t = years.' },
        { expression: 'A = 5000\\left(1 + \\frac{0.08}{4}\\right)^{4 \\cdot 6}', annotation: 'Substitute: P = 5000, r = 0.08, n = 4 (quarterly), t = 6.' },
        { expression: '= 5000(1 + 0.02)^{24}', annotation: '0.08/4 = 0.02 and 4×6 = 24 compounding periods.' },
        { expression: '= 5000(1.02)^{24}', annotation: '' },
        { expression: '= 5000 \\times 1.60844 \\approx 8042.19', annotation: '(1.02)^24 ≈ 1.60844.' },
      ],
      conclusion: 'The balance after 6 years is approximately $8,042.19. Compare to simple interest: 5000 + 5000(0.08)(6) = $7,400 — compounding earned an extra $642.19.',
    },
    {
      id: 'ex-half-life',
      title: 'Radioactive Half-Life',
      problem: '\\text{Carbon-14 has a half-life of 5730 years. If a fossil has 35\\% of its original C-14, how old is it?}',
      steps: [
        { expression: 'N(t) = N_0 \\cdot \\left(\\frac{1}{2}\\right)^{t/5730}', annotation: 'Half-life formula: after t years, the fraction remaining is (1/2)^(t/5730).' },
        { expression: '0.35 = \\left(\\frac{1}{2}\\right)^{t/5730}', annotation: '35% remaining means N(t)/N₀ = 0.35.' },
        { expression: '\\ln(0.35) = \\frac{t}{5730} \\ln\\left(\\frac{1}{2}\\right)', annotation: 'Take ln of both sides, apply the power rule.' },
        { expression: 't = 5730 \\cdot \\frac{\\ln(0.35)}{\\ln(0.5)}', annotation: 'Solve for t.' },
        { expression: 't = 5730 \\cdot \\frac{-1.0498}{-0.6931} \\approx 8679 \\text{ years}', annotation: 'Evaluate: ln(0.35) ≈ −1.0498, ln(0.5) ≈ −0.6931.' },
      ],
      conclusion: 'The fossil is approximately 8,679 years old. This is how archaeologists date ancient organic materials.',
    },
    {
      id: 'ex-graph-transformations',
      title: 'Graph Transformations of Exponentials',
      problem: '\\text{Describe the transformations: } f(x) = -2 \\cdot 3^{x-1} + 4.',
      steps: [
        { expression: 'y = 3^x', annotation: 'Start with the parent function: exponential with base 3.' },
        { expression: 'y = 3^{x-1}', annotation: 'Horizontal shift RIGHT by 1 unit (x − 1 inside the exponent).' },
        { expression: 'y = 2 \\cdot 3^{x-1}', annotation: 'Vertical stretch by factor 2 (multiply by 2).' },
        { expression: 'y = -2 \\cdot 3^{x-1}', annotation: 'Reflect across the x-axis (multiply by −1). The function now DECREASES.' },
        { expression: 'y = -2 \\cdot 3^{x-1} + 4', annotation: 'Vertical shift UP by 4. The horizontal asymptote moves from y = 0 to y = 4.' },
      ],
      conclusion: 'The graph is a reflected, stretched exponential shifted right 1 and up 4. The horizontal asymptote is y = 4, and the graph approaches it from above as x → ∞.',
    },
    {
      id: 'ex-log-properties',
      title: 'Using Log Properties to Simplify',
      problem: '\\text{Simplify: } \\ln(e^3) + 2\\ln(5) - \\ln(25).',
      steps: [
        { expression: '\\ln(e^3) + 2\\ln(5) - \\ln(25)', annotation: 'Apply log rules one at a time.' },
        { expression: '= 3 + 2\\ln(5) - \\ln(25)', annotation: 'ln(eⁿ) = n, so ln(e³) = 3.' },
        { expression: '= 3 + \\ln(5^2) - \\ln(25)', annotation: 'Power rule: 2ln(5) = ln(5²).' },
        { expression: '= 3 + \\ln(25) - \\ln(25)', annotation: '5² = 25.' },
        { expression: '= 3', annotation: 'The ln(25) terms cancel.' },
      ],
      conclusion: 'The expression simplifies to exactly 3. Logarithm properties often lead to dramatic simplifications — always look for cancellations.',
    },
  ],

  challenges: [
    {
      id: 'ch0-exp-c0',
      difficulty: 'easy',
      problem: '\\text{Evaluate without a calculator: } \\log_2(32), \\quad \\log_3(81), \\quad \\ln(e^5).',
      hint: 'For log_b(x), ask: "b to what power gives x?" For ln(e^n), remember ln and e^x are inverses.',
      walkthrough: [
        { expression: '\\log_2(32) = \\log_2(2^5) = 5', annotation: '2⁵ = 32, so log₂(32) = 5.' },
        { expression: '\\log_3(81) = \\log_3(3^4) = 4', annotation: '3⁴ = 81, so log₃(81) = 4.' },
        { expression: '\\ln(e^5) = 5', annotation: 'ln and e^x are inverses: ln(e^n) = n for any n.' },
      ],
      answer: '\\log_2(32) = 5, \\quad \\log_3(81) = 4, \\quad \\ln(e^5) = 5',
    },
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
    {
      id: 'ch0-exp-c2',
      difficulty: 'hard',
      problem: '\\text{Use the compound interest formula to show that } \\lim_{n \\to \\infty}\\left(1+\\frac{1}{n}\\right)^n \\text{ is at least 2 and at most 3, using the binomial theorem.}',
      hint: 'Expand $(1+1/n)^n$ using the binomial theorem. Show each term is at most 1/k! and use the geometric series bound.',
      walkthrough: [
        { expression: '\\left(1+\\frac{1}{n}\\right)^n = \\sum_{k=0}^{n} \\binom{n}{k} \\frac{1}{n^k}', annotation: 'Expand using the binomial theorem.' },
        { expression: '= 1 + 1 + \\frac{n(n-1)}{2!n^2} + \\frac{n(n-1)(n-2)}{3!n^3} + \\cdots', annotation: 'Write out the first few terms.' },
        { expression: '\\text{Each factor } \\frac{n-j}{n} \\leq 1, \\text{ so } \\binom{n}{k}\\frac{1}{n^k} \\leq \\frac{1}{k!}', annotation: 'The binomial coefficient over n^k is bounded above by 1/k!.' },
        { expression: '\\text{Lower bound: } (1+1/n)^n \\geq 1 + 1 = 2', annotation: 'Just the first two terms of the expansion give at least 2.' },
        { expression: '\\text{Upper bound: } \\sum_{k=0}^{n} \\frac{1}{k!} \\leq 1 + 1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\cdots = 3', annotation: 'Since k! ≥ 2^(k−1) for k ≥ 1, the sum is bounded by 1 + a geometric series summing to 2.' },
      ],
      answer: '2 \\leq \\left(1+\\frac{1}{n}\\right)^n \\leq 3 \\text{ for all } n \\geq 1. \\text{ The limit } e \\approx 2.718 \\text{ lies between these bounds.}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'trig-review', label: 'Previous: Trigonometry', context: 'The other essential function family.' },
    { lessonSlug: 'introduction', label: 'Next: Limits', context: 'Chapter 1 begins — the core concept of calculus.' },
    { lessonSlug: 'exp-log-derivatives', label: 'Future: Derivatives of e^x and ln x', context: 'Why e^x is so special in calculus.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'completed-example-6',
    'completed-example-7',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
}
