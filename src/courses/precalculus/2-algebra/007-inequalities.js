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
      '**The Language of Betweenness**: If an equation is a target, an inequality is a Fence. It defines a "Buffer Zone" where a condition holds true. This is the mathematics of "Good Enough"—where we care about being within a certain tolerance rather than hitting a specific point.',
      '**Bounded Truth**: Every inequality partitions the universe into "Valid" and "Invalid" regions. Solving an inequality is not about finding a number; it is about drawing a Map of where the statement survives and where it dies.',
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
      {
        type: 'insight',
        title: 'Linguistic Learner: The Habitat of Betweenness',
        body: '\\text{Equations describe "Stasis." Inequalities describe "Relationship."} \\\\ \\text{Words like "at least," "within," and "at most" are the linguistic keys to the intervals of truth.}',
      },
      {
        type: 'insight',
        title: 'Logical Learner: The Condition of Truth',
        body: '\\text{An inequality is a "Filter."} \\\\ \\text{Every number on the line tries to pass through. Only those that maintain the truth of the statement survive onto the solution map.}',
      },
      {
        type: 'insight',
        title: 'Physical Learner: Fences and Safety Zones',
        body: '\\text{In engineering, a bridge must hold "at least" 10,000kg.} \\\\ \\text{The inequality is the boundary between "Safety" and "Structural Failure." Intervals represent the operating room of the system.}',
      },
      {
        type: 'insight',
        title: 'Visual Learner: The Shaded Terrain',
        body: '\\text{Solving is Shading.} \\\\ \\text{Imagine the number line is a landscape. The inequality is a light source: some regions are in the light (True) and some are in the shadow (False).}',
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
      {
        type: 'theorem',
        title: 'The Triangle Inequality: $|a+b| \\leq |a| + |b|$',
        body: '\\text{Geometrically: the sum of the lengths of two sides of a triangle must exceed the length of the third side.} \\\\ \\text{Algebraically: distances are sub-additive. Equality holds only if } a, b \\text{ have the same sign.}',
      },
      {
        type: 'theorem',
        title: 'The Proof of the Sign-Flip (Reflection)',
        body: '\\text{Let } a < b. \\text{ Multiplying by } -1 \\text{ is a 180° reflection across the origin.} \\\\ \\text{The point that was "Further Right" } (b) \\text{ becomes "Further Left" } (-b). \\\\ \\text{Therefore, } -b < -a \\text{ — the order is reversed.}',
      },
      {
        type: 'insight',
        title: 'Multiplicity Callout: Bounces vs. Crossings',
        body: '\\text{A factor } (x-c)^n \\text{ only causes a sign change if } n \\text{ is ODD.} \\\\ \\text{If } n \\text{ is EVEN, the function "Bounces" off the axis and the sign remains the same on both sides.}',
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
    {
      id: 'ex-inequality-always',
      title: 'Structural Stability: Always True vs. Never True',
      problem: '\\text{Solve: } x^2 + 1 > 0 \\quad \\text{and} \\quad x^2 + 1 < 0.',
      steps: [
        {
          expression: 'x^2 + 1 \\geq 1 > 0 \\text{ for all real } x',
          annotation: 'Step 1: Any real number squared is $\\geq 0$. Adding 1 makes it strictly positive.'
        },
        {
          expression: '\\text{Sol 1: } x \\in (-\\infty, \\infty)',
          annotation: 'Step 2: The first inequality is true for every possible input.'
        },
        {
          expression: '\\text{Sol 2: } \\emptyset',
          annotation: 'Step 3: The second inequality is impossible. There are no real solutions.'
        }
      ],
      conclusion: 'Not all inequalities have range boundaries; some define the entire line or absolutely nothing. Always check the discriminant.'
    },
    {
      id: 'ex-inequality-multi-abs',
      title: 'Case Analysis: Multi-Absolute Value',
      problem: '\\text{Solve: } |x-1| + |x+2| < 5.',
      steps: [
        {
          expression: 'x = 1, -2',
          annotation: 'Step 1: Identify the "Break Points" where the absolute values change behavior.'
        },
        {
          expression: '\\text{Case 1 } (x < -2): \\; -(x-1) - (x+2) < 5 \\implies -2x - 1 < 5 \\implies x > -3',
          annotation: 'Step 2: Solve in interval $(-\\infty, -2)$. Solved region: $(-3, -2)$.'
        },
        {
          expression: '\\text{Case 2 } (-2 \\leq x < 1): \\; -(x-1) + (x+2) < 5 \\implies 3 < 5',
          annotation: 'Step 3: Solve in interval $[-2, 1)$. This statement is always true. Entire interval $[-2, 1)$ is valid.'
        },
        {
          expression: '\\text{Case 3 } (x \\geq 1): \\; (x-1) + (x+2) < 5 \\implies 2x + 1 < 5 \\implies x < 2',
          annotation: 'Step 4: Solve in interval $[1, \\infty)$. Solved region: $[1, 2)$.'
        }
      ],
      conclusion: 'Combining the validated regions gives the final solution interval: $x \\in (-3, 2)$.'
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
    {
      id: 'ch2-007-ch2',
      difficulty: 'harder',
      problem: '\\text{Verify the Triangle Inequality for } a = 3, b = -5. \\text{ Then explain for what numbers } x, y \\text{ the equality } |x+y| = |x| + |y| \\text{ holds true.}',
      hint: 'Calculate $|3 + (-5)|$ and compare it to $|3| + |-5|$. Use common sense on the number line to explain when they sum perfectly.',
      walkthrough: [
        {
          expression: '|3 - 5| = |-2| = 2',
          annotation: 'Step 1: Calculate the distance of the sum.'
        },
        {
          expression: '|3| + |-5| = 3 + 5 = 8',
          annotation: 'Step 2: Calculate the sum of the distances. $2 \\leq 8 \\checkmark$.'
        },
        {
          expression: '|x+y| = |x| + |y| \\iff xy \\geq 0',
          annotation: 'Step 3: Distance "adds up" only if you travel in the same direction. If $x, y$ have the same sign (or are zero), the total distance is the sum of parts.'
        }
      ],
      answer: '2 \\leq 8 \\text{; Equality holds if } x, y \\text{ have the same sign.}'
    }
  ],

  calcBridge: {
    teaser: 'In calculus, you will use sign charts constantly: to find intervals where $f\'(x) > 0$ (increasing) or $f\'(x) < 0$ (decreasing), and where $f\'\'(x) > 0$ (concave up) or $f\'\'(x) < 0$ (concave down). The method is identical — only the function being analysed changes.',
    linkedLessons: ['derivatives-introduction', 'function-behaviour'],
  },
}
