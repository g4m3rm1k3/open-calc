export default {
  id: 'ch2-alg-007',
  slug: 'inequalities-sign-analysis',
  chapter: 'precalc-2',
  order: 7,
  title: 'Inequalities, Absolute Value & Sign Analysis',
  subtitle: 'The number line is your workspace — and sign charts do the heavy lifting',
  tags: ['inequalities', 'absolute value', 'sign chart', 'interval notation', 'compound inequalities'],
  aliases: 'inequality absolute value sign chart compound inequality interval notation solve number line cases',

  hook: {
    question: 'Solving $x^2 - x - 6 > 0$ is hard to do by algebra alone. A sign chart makes it visual and automatic — and is the same tool you\'ll use in calculus to find where a function is increasing.',
    realWorldContext: 'Domain restrictions in calculus (square roots, logarithms, denominators) are inequality problems. The $\\varepsilon$-$\\delta$ definition of a limit is built from inequalities. Intervals of increase and decrease for a function — central to curve sketching — are found using sign analysis of the derivative.',
  },

  intuition: {
    prose: [
      'An inequality is a comparison, not an equation. Its solution is usually an interval (a range of values) rather than isolated points. The solution lives on the number line — your job is to identify which portions satisfy the inequality.',
      'The sign chart method works for any inequality that can be written as $f(x) > 0$ (or $< 0$, $\\geq 0$, $\\leq 0$): (1) find all zeros and undefined points of $f(x)$ — these are the only places the sign can change; (2) plot them on a number line, dividing it into intervals; (3) test one point in each interval; (4) the sign is constant throughout each interval.',
      'Absolute value inequalities always split into two cases. $|f(x)| < k$ means $-k < f(x) < k$ — a compound inequality. $|f(x)| > k$ means $f(x) > k$ OR $f(x) < -k$ — a disjunction. Drawing the absolute value graph makes this geometrically obvious.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Sign chart procedure',
        body: '\\text{To solve } f(x) > 0: \\\\ 1.\\text{ Find zeros/undefined points of } f. \\\\ 2.\\text{ Mark on number line → creates intervals.} \\\\ 3.\\text{ Test one point per interval.} \\\\ 4.\\text{ Sign is constant throughout each interval.}',
      },
      {
        type: 'theorem',
        title: 'Absolute value inequality rules',
        body: '|f(x)| < k \\iff -k < f(x) < k \\quad (k > 0) \\\\ |f(x)| > k \\iff f(x) > k \\text{ OR } f(x) < -k \\\\ |f(x)| = k \\iff f(x) = k \\text{ OR } f(x) = -k',
      },
      {
        type: 'warning',
        title: 'Multiplying by a negative — the sign flips',
        body: '-2x > 6 \\implies x < -3 \\quad (\\text{dividing by } -2 \\text{ flips} >) \\\\ \\text{When multiplying/dividing both sides by a negative, the inequality reverses.}',
      },
    ],
    visualizations: [
      {
        id: 'SignChartViz',
        title: 'Sign Chart — Visualising Inequality Solutions',
        mathBridge: 'Enter zeros of a factored polynomial and see the sign chart built automatically. Click intervals to see which satisfy $f(x) > 0$.',
        caption: 'The sign only changes at zeros (odd multiplicity) or undefined points. It is constant everywhere else.',
      },
                                              ],
  },

  math: {
    callouts: [
      {
        type: 'definition',
        title: 'Interval notation',
        body: '(a,b): \\text{ open (excludes endpoints)} \\qquad [a,b]: \\text{ closed (includes endpoints)} \\\\ [a,b): \\text{ half-open} \\qquad (-\\infty, a): \\text{ unbounded left} \\\\ \\cup: \\text{ union (OR)} \\qquad \\cap: \\text{ intersection (AND)}',
      },
      {
        type: 'insight',
        title: 'Connecting to calculus: domain of composite functions',
        body: '\\text{Domain of } \\sqrt{f(x)}: \\text{ solve } f(x) \\geq 0 \\text{ using sign chart.} \\\\ \\text{Domain of } \\ln(f(x)): \\text{ solve } f(x) > 0. \\\\ \\text{Domain of } \\frac{1}{f(x)}: \\text{ solve } f(x) \\neq 0.',
      },
    ],
  },

  rigor: {
    title: 'Solving a polynomial inequality: $x^2 - x - 6 > 0$',
    proofSteps: [
      { expression: 'x^2 - x - 6 = (x-3)(x+2)', annotation: 'Factor the left side.' },
      { expression: '\\text{Zeros at } x = 3 \\text{ and } x = -2. \\text{ Three intervals: } (-\\infty,-2),\\; (-2,3),\\; (3,\\infty).', annotation: 'Plot zeros. They divide the number line into three regions.' },
      { expression: 'x=-3: (-)(-) = + > 0 \\checkmark \\quad x=0: (-)(+) = - < 0 \\times \\quad x=4: (+)(+) = + > 0 \\checkmark', annotation: 'Test one value per interval. Signs stay constant within each interval.' },
      { expression: 'x^2-x-6 > 0 \\iff x \\in (-\\infty,-2) \\cup (3,\\infty) \\qquad \\blacksquare', annotation: 'Write solution as union of the intervals where the sign is positive. Strict inequality excludes endpoints.' },
    ],
  },

  examples: [
    {
      id: 'ch2-007-ex1',
      title: 'Absolute value inequality — distance interpretation',
      problem: '\\text{Solve: } |x - 4| \\leq 3.',
      steps: [
        { expression: '-3 \\leq x - 4 \\leq 3', annotation: '$|A| \\leq 3$ means $-3 \\leq A \\leq 3$.' },
        { expression: '1 \\leq x \\leq 7', annotation: 'Add 4 throughout.' },
      ],
      conclusion: 'Geometric interpretation: $x$ is within distance 3 of 4. The solution is the interval $[1,7]$, centred at 4 with radius 3.',
    },
    {
      id: 'ch2-007-ex2',
      title: 'Rational inequality using sign chart',
      problem: '\\text{Solve: } \\dfrac{x+1}{x-2} \\geq 0',
      steps: [
        { expression: '\\text{Critical points: } x = -1 \\text{ (zero)} \\text{ and } x=2 \\text{ (undefined)}', annotation: 'The sign can only change at zeros of numerator or zeros of denominator.' },
        { expression: 'x=-2: \\frac{-}{-}=+\\geq 0 \\checkmark \\quad x=0: \\frac{+}{-}=-<0 \\times \\quad x=3: \\frac{+}{+}=+\\geq 0 \\checkmark', annotation: 'Test each interval.' },
        { expression: 'x \\in (-\\infty, -1] \\cup (2, \\infty)', annotation: 'Include $x=-1$ (zero, fraction equals 0 — satisfies $\\geq 0$). Exclude $x=2$ (undefined).' },
      ],
      conclusion: 'For rational inequalities, always identify BOTH zeros (numerator) and undefined points (denominator). Zeros can be included or excluded based on the inequality sign; undefined points are always excluded.',
    },
  ],

  challenges: [
    {
      id: 'ch2-007-ch1',
      difficulty: 'hard',
      problem: '\\text{Find the domain of } f(x) = \\ln\\!\\left(\\dfrac{x^2-4}{x-1}\\right).',
      hint: 'The argument of $\\ln$ must be strictly positive. Solve $\\frac{x^2-4}{x-1} > 0$ using a sign chart.',
      walkthrough: [
        { expression: 'x^2-4 = (x-2)(x+2)', annotation: 'Factor numerator.' },
        { expression: '\\text{Critical points: } x=-2, 1, 2', annotation: 'Zeros at $\\pm 2$, undefined at $1$.' },
        { expression: '\\text{Signs: } (-\\infty,-2): +/- = - \\;|\\; (-2,1): -/- = + \\;|\\; (1,2): -/- = + \\text{ (wait: check)}', annotation: 'At $x=0$: $(0-2)(0+2)/(0-1) = (-4)/(-1) = 4 > 0$. At $x=1.5$: $(-.5)(3.5)/(0.5) < 0$.' },
        { expression: 'x \\in (-2, 1) \\cup (2, \\infty)', annotation: 'Where the expression is positive. Verify each interval carefully.' },
      ],
      answer: 'x \\in (-2,1) \\cup (2,\\infty)',
    },
  ],

  calcBridge: {
    teaser: 'In calculus, you will use sign charts constantly: to find intervals where $f\'(x) > 0$ (increasing) or $f\'(x) < 0$ (decreasing), and where $f\'\'(x) > 0$ (concave up) or $f\'\'(x) < 0$ (concave down). The method is identical — only the function being analysed changes.',
    linkedLessons: ['derivatives-introduction', 'function-behaviour'],
  },
}
