export default {
  id: 'ch0-inequalities',
  slug: 'inequalities',
  chapter: 0,
  order: 0.3,
  title: 'Inequalities & Interval Notation',
  subtitle: 'The toolkit for epsilon-delta and optimization',
  tags: ['inequalities', 'linear inequalities', 'polynomial inequalities', 'rational inequalities', 'sign chart', 'sign analysis', 'absolute value', 'interval notation', 'number line', 'critical points', 'test points', 'epsilon-delta', 'quadratic inequalities'],

  hook: {
    question: 'When an engineer designs a bridge to hold "at least 10,000 kg," how do they express that mathematically?',
    realWorldContext:
      'Inequalities are everywhere in the real world. Speed limits say v ≤ 65. Drug dosages must satisfy min ≤ d ≤ max. ' +
      'Financial models require rates to stay within bounds. In calculus, the entire theory of limits rests on ' +
      'epsilon-delta inequalities: |f(x) − L| < ε whenever |x − a| < δ. If you cannot manipulate inequalities fluently, ' +
      'epsilon-delta proofs will feel impossible. This lesson builds that fluency.',
    previewVisualizationId: 'NumberLine',
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['An **inequality** is a statement that one quantity is less than, greater than, or not equal to another. Where equations give you exact answers (often a single number), inequalities give you **ranges** — entire intervals of numbers that satisfy a condition.'] },
      { type: 'callout', callout: { type: 'intuition', title: 'Inequalities Describe Regions', body: 'An equation like x² = 4 gives discrete points (x = ±2). An inequality like x² < 4 gives a whole region: the interval (−2, 2). Inequalities describe WHERE something is true on the number line.' } },
      { type: 'prose', paragraphs: ['The simplest inequalities are **linear**: $2x + 3 > 7$ solves the same way as an equation, with one critical rule — **if you multiply or divide both sides by a negative number, you must flip the inequality sign**. This is the single most common source of errors in algebra. Why does it flip? Because multiplying by −1 reverses the order of the number line: 3 > 2 but −3 < −2.'] },
      { type: 'viz', id: 'NumberLine', title: 'Number Line Visualization', caption: 'Visualize solution sets as intervals on the number line.' },
      { type: 'prose', paragraphs: ['**Polynomial inequalities** like $x^2 - 4x + 3 > 0$ require a different strategy. You cannot just "solve for x" because the expression changes sign at different points. The strategy is: (1) factor, (2) find the **critical points** (zeros of each factor), (3) make a **sign chart** showing the sign of each factor in each interval, (4) combine to determine where the product is positive or negative.', 'The sign chart method is like a detective investigation. You mark the critical points on a number line, dividing it into intervals. In each interval, every factor has a constant sign (positive or negative). Multiply the signs together to get the sign of the whole expression. It is systematic and works every time.'] },
      { type: 'callout', callout: { type: 'technique', title: 'The Sign Chart Method', body: '1. Move everything to one side (compare to 0). 2. Factor completely. 3. Find all zeros and undefined points. 4. Mark them on a number line. 5. Test the sign of each factor in each interval. 6. Multiply signs to get the overall sign.' } },
      { type: 'viz', id: 'VideoEmbed', title: 'Polynomial Inequalities', props: { url: "" } },
      { type: 'prose', paragraphs: ['**Rational inequalities** like $\\frac{x+1}{x-2} \\leq 0$ use the same sign chart method, but with an extra caution: you must never multiply both sides by an expression that could be zero or negative (since you do not know its sign). Instead, move everything to one side, get a common denominator, and apply sign analysis. Also, exclude values where the denominator is zero — these are never in the solution set.'] },
      { type: 'callout', callout: { type: 'misconception', title: 'Never Multiply by an Unknown-Sign Expression', body: 'When solving (x+1)/(x−2) ≤ 0, do NOT multiply both sides by (x−2). You do not know if (x−2) is positive or negative, so you do not know whether to flip the sign. Instead, use a sign chart.' } },
      { type: 'viz', id: 'VideoEmbed', title: 'Rational Inequalities', props: { url: "" } },
      { type: 'prose', paragraphs: ['**Absolute value inequalities** connect to distance on the number line. $|x - a| < r$ means "x is within distance r of a," which gives the interval $(a-r, a+r)$. $|x - a| > r$ means "x is more than distance r from a," giving two rays: $(-\\infty, a-r) \\cup (a+r, \\infty)$. Master this geometric interpretation and absolute value inequalities become intuitive.'] },
      { type: 'callout', callout: { type: 'tip', title: 'Open vs. Closed at Critical Points', body: 'For strict inequalities (< or >), critical points are excluded (open circles). For non-strict (≤ or ≥), zeros of the numerator are included (filled circles), but zeros of the denominator are ALWAYS excluded.' } },
    ],
  },

  math: {
    prose: [
      'For a **linear inequality** $ax + b > 0$ with $a \\neq 0$: if $a > 0$, then $x > -b/a$; if $a < 0$, then $x < -b/a$ (the inequality flips). The solution is always a single ray.',

      'For a **quadratic inequality** $ax^2 + bx + c > 0$, factor (if possible) or use the discriminant. If the quadratic has two real roots $r_1 < r_2$, then: for $a > 0$, the parabola opens up, so $ax^2 + bx + c > 0$ on $(-\\infty, r_1) \\cup (r_2, \\infty)$ and $ax^2 + bx + c < 0$ on $(r_1, r_2)$.',

      'More generally, for any **polynomial inequality** $p(x) > 0$, factor $p(x) = a(x - r_1)^{m_1}(x - r_2)^{m_2} \\cdots (x - r_k)^{m_k}$. The sign of $p(x)$ can only change at the roots $r_i$. At a root of **odd multiplicity**, the sign changes; at a root of **even multiplicity**, the sign does not change (the graph touches but does not cross the x-axis).',

      'For a **rational inequality** $\\displaystyle\\frac{p(x)}{q(x)} > 0$, the critical points are the zeros of $p(x)$ (where the expression equals zero) and the zeros of $q(x)$ (where the expression is undefined). Apply the sign chart method to each factor separately, then determine the sign of the overall fraction in each interval.',

      'Key **properties of inequalities**: (1) Adding the same quantity to both sides preserves the direction. (2) Multiplying both sides by a positive number preserves the direction. (3) Multiplying by a negative number reverses the direction. (4) If $0 < a < b$, then $\\frac{1}{b} < \\frac{1}{a}$ — taking reciprocals of positive quantities reverses the inequality.',

      'The **triangle inequality** $|a + b| \\leq |a| + |b|$ and its reverse $|a - b| \\geq ||a| - |b||$ are used constantly in epsilon-delta proofs to bound expressions. These allow you to "break apart" or "combine" absolute values when estimating.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sign Change at Roots',
        body: '\\text{If } p(x) = a(x-r)^m \\cdot q(x) \\text{ where } q(r) \\neq 0: \\\\ m \\text{ odd} \\Rightarrow p(x) \\text{ changes sign at } x = r \\\\ m \\text{ even} \\Rightarrow p(x) \\text{ does not change sign at } x = r',
      },
      {
        type: 'definition',
        title: 'Absolute Value Inequalities',
        body: '|A| < c \\;(c > 0) \\iff -c < A < c \\\\ |A| > c \\;(c > 0) \\iff A > c \\text{ or } A < -c \\\\ |A| \\leq c \\iff -c \\leq A \\leq c \\\\ |A| \\geq c \\iff A \\geq c \\text{ or } A \\leq -c',
      },
      {
        type: 'theorem',
        title: 'Reciprocal Reversal',
        body: '\\text{If } 0 < a < b, \\text{ then } \\frac{1}{b} < \\frac{1}{a}. \\\\ \\text{Taking reciprocals of positive numbers reverses the inequality.}',
      },
    ],
    visualizations: [
      {
        id: 'TriangleInequalityViz',
        title: 'The Triangle Inequality in 1D',
        caption: 'Play with this geometric proof to see why adding numbers before absolute value is always less than or equal to adding them after.',
      },
    ],
  },

  rigor: {
    prose: [
      'The sign chart method is rigorous because of the **Intermediate Value Theorem** (applied to continuous functions): a continuous function can only change sign by passing through zero. Since polynomials are continuous, the sign of $p(x)$ is constant on each interval between consecutive roots. Testing one point per interval is therefore sufficient.',

      'For rational functions $r(x) = p(x)/q(x)$, the function is continuous on each interval between roots of $p$ and $q$. A sign change can occur at zeros of $p$ (where $r(x) = 0$) or at zeros of $q$ (where $r(x)$ is undefined — vertical asymptotes). The sign chart accounts for both.',

      'The property that multiplying by a negative number reverses inequality follows from the ordered field axioms of $\\mathbb{R}$. If $a < b$ and $c < 0$, then $a - b < 0$ and $c < 0$, so $(a-b) \\cdot c > 0$ (product of two negatives is positive), giving $ac - bc > 0$, hence $ac > bc$.',

      'A common rigorous technique: to show $|f(x) - L| < \\varepsilon$, we often need to bound $|f(x) - L|$ above by a simpler expression using the triangle inequality and then solve the simpler inequality for $\\delta$. This requires comfortable manipulation of chains of inequalities, which is why this lesson is critical preparation for Chapter 1.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Inequality Reversal Under Negation',
        body: '\\text{If } a < b \\text{ and } c < 0, \\text{ then } ac > bc. \\\\ \\text{Proof: } a < b \\Rightarrow a - b < 0. \\text{ Product of two negatives:} \\\\ (a-b) \\cdot c > 0 \\Rightarrow ac > bc.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-linear-ineq',
      title: 'Solving a Linear Inequality',
      problem: 'Solve $5 - 3x \\geq 2$ and graph the solution.',
      steps: [
        { expression: '5 - 3x \\geq 2', annotation: 'Start with the inequality.' },
        { expression: '-3x \\geq 2 - 5 = -3', annotation: 'Subtract 5 from both sides.' },
        { expression: 'x \\leq \\frac{-3}{-3} = 1', annotation: 'Divide by −3 and FLIP the inequality sign.' },
        { expression: 'x \\in (-\\infty, 1]', annotation: 'Solution in interval notation. Bracket at 1 because ≤.' },
      ],
      conclusion: 'The solution is all real numbers less than or equal to 1. The key step was flipping the inequality when dividing by −3.',
    },
    {
      id: 'ex-quadratic-ineq',
      title: 'Quadratic Inequality with Sign Chart',
      problem: 'Solve $x^2 - 5x + 6 < 0$.',
      steps: [
        { expression: 'x^2 - 5x + 6 = (x-2)(x-3)', annotation: 'Factor the quadratic.' },
        { expression: '\\text{Critical points: } x = 2 \\text{ and } x = 3', annotation: 'Set each factor equal to zero.' },
        { expression: '\\text{Intervals: } (-\\infty, 2), \\; (2, 3), \\; (3, \\infty)', annotation: 'The critical points divide the number line into three intervals.' },
        { expression: '\\text{Test } x = 0: (0-2)(0-3) = (-2)(-3) = +6 > 0', annotation: 'Interval (−∞, 2): both factors negative, product positive.' },
        { expression: '\\text{Test } x = 2.5: (0.5)(-0.5) = -0.25 < 0', annotation: 'Interval (2, 3): first factor positive, second negative, product negative.' },
        { expression: '\\text{Test } x = 4: (2)(1) = 2 > 0', annotation: 'Interval (3, ∞): both factors positive, product positive.' },
        { expression: 'x \\in (2, 3)', annotation: 'The product is negative only on (2, 3). Endpoints excluded because strict inequality.' },
      ],
      conclusion: 'The parabola $y = x^2 - 5x + 6$ opens upward and is below the x-axis between its roots. The solution (2, 3) is the interval where the parabola is negative.',
    },
    {
      id: 'ex-rational-ineq',
      title: 'Rational Inequality',
      problem: 'Solve $\\displaystyle\\frac{x+1}{x-3} \\leq 0$.',
      steps: [
        { expression: '\\frac{x+1}{x-3} \\leq 0', annotation: 'Already in the form "expression ≤ 0." Do NOT multiply by (x−3).' },
        { expression: '\\text{Numerator zero: } x = -1. \\quad \\text{Denominator zero: } x = 3.', annotation: 'Find all critical points.' },
        { expression: '\\text{Intervals: } (-\\infty, -1), \\; (-1, 3), \\; (3, \\infty)', annotation: 'Three intervals to test.' },
        { expression: '\\text{Test } x = -2: \\frac{-1}{-5} = +\\frac{1}{5} > 0', annotation: 'Both factors negative, so positive.' },
        { expression: '\\text{Test } x = 0: \\frac{1}{-3} = -\\frac{1}{3} < 0', annotation: 'Numerator positive, denominator negative, so negative.' },
        { expression: '\\text{Test } x = 4: \\frac{5}{1} = 5 > 0', annotation: 'Both positive, so positive.' },
        { expression: 'x \\in [-1, 3)', annotation: 'Include x = −1 (where expression = 0, and ≤ allows 0). Exclude x = 3 (denominator zero).' },
      ],
      conclusion: 'The solution is [−1, 3). The key subtlety: x = −1 is included (makes the expression equal zero) but x = 3 is excluded (makes it undefined).',
    },
    {
      id: 'ex-polynomial-ineq',
      title: 'Higher-Degree Polynomial Inequality',
      problem: 'Solve $x^3 - 4x \\geq 0$.',
      steps: [
        { expression: 'x^3 - 4x = x(x^2 - 4) = x(x-2)(x+2)', annotation: 'Factor completely.' },
        { expression: '\\text{Critical points: } x = -2, \\; 0, \\; 2', annotation: 'Zeros of each factor.' },
        { expression: '\\text{Test } x = -3: (-3)(-5)(-1) = -15 < 0', annotation: 'Three negative factors: negative.' },
        { expression: '\\text{Test } x = -1: (-1)(-3)(1) = 3 > 0', annotation: 'Two negative, one positive: positive.' },
        { expression: '\\text{Test } x = 1: (1)(-1)(3) = -3 < 0', annotation: 'One negative: negative.' },
        { expression: '\\text{Test } x = 3: (3)(1)(5) = 15 > 0', annotation: 'All positive: positive.' },
        { expression: 'x \\in [-2, 0] \\cup [2, \\infty)', annotation: 'Non-strict inequality, so include the critical points.' },
      ],
      conclusion: 'The solution is $[-2, 0] \\cup [2, \\infty)$. With three factors, the sign alternates across the four intervals (starting negative on the far left since the leading coefficient is positive and the degree is odd).',
    },
  ],

  challenges: [
    {
      id: 'ch0-ineq-c1',
      difficulty: 'easy',
      problem: 'Solve $|2x - 1| < 5$ and write the solution in interval notation.',
      hint: 'Use the rule |A| < c ⟺ −c < A < c.',
      walkthrough: [
        { expression: '-5 < 2x - 1 < 5', annotation: 'Apply the absolute value inequality rule.' },
        { expression: '-4 < 2x < 6', annotation: 'Add 1 to all three parts.' },
        { expression: '-2 < x < 3', annotation: 'Divide by 2.' },
      ],
      answer: 'x ∈ (−2, 3)',
    },
    {
      id: 'ch0-ineq-c2',
      difficulty: 'medium',
      problem: 'Solve $\\displaystyle\\frac{x^2 - 1}{x + 3} > 0$.',
      hint: 'Factor the numerator as (x−1)(x+1). Critical points: x = −3, −1, 1. Make a sign chart with four intervals.',
      walkthrough: [
        { expression: '\\frac{(x-1)(x+1)}{x+3} > 0', annotation: 'Factor numerator.' },
        { expression: '\\text{Critical points: } x = -3, -1, 1', annotation: 'Zeros and undefined points.' },
        { expression: '\\text{Test } x=-4: \\frac{(-5)(-3)}{-1} = -15 < 0', annotation: 'Interval (−∞, −3).' },
        { expression: '\\text{Test } x=-2: \\frac{(-3)(-1)}{1} = 3 > 0', annotation: 'Interval (−3, −1).' },
        { expression: '\\text{Test } x=0: \\frac{(-1)(1)}{3} = -\\frac{1}{3} < 0', annotation: 'Interval (−1, 1).' },
        { expression: '\\text{Test } x=2: \\frac{(1)(3)}{5} = \\frac{3}{5} > 0', annotation: 'Interval (1, ∞).' },
      ],
      answer: 'x ∈ (−3, −1) ∪ (1, ∞). Strict inequality, so endpoints excluded; x = −3 always excluded.',
    },
    {
      id: 'ch0-ineq-c3',
      difficulty: 'hard',
      problem: 'Solve $|x^2 - 4| \\leq 3x$.',
      hint: 'Note that the right side 3x must be non-negative, so x ≥ 0. Then |x² − 4| ≤ 3x becomes −3x ≤ x² − 4 ≤ 3x. Solve the two inequalities separately and intersect.',
      walkthrough: [
        { expression: '\\text{Require } 3x \\geq 0 \\Rightarrow x \\geq 0', annotation: 'Absolute value is non-negative, so the right side must be too.' },
        { expression: 'x^2 - 4 \\leq 3x \\iff x^2 - 3x - 4 \\leq 0 \\iff (x-4)(x+1) \\leq 0', annotation: 'Right half of the compound inequality.' },
        { expression: '\\Rightarrow x \\in [-1, 4]', annotation: 'Between the roots.' },
        { expression: 'x^2 - 4 \\geq -3x \\iff x^2 + 3x - 4 \\geq 0 \\iff (x+4)(x-1) \\geq 0', annotation: 'Left half.' },
        { expression: '\\Rightarrow x \\in (-\\infty, -4] \\cup [1, \\infty)', annotation: 'Outside the roots.' },
        { expression: '\\text{Intersect all three: } x \\geq 0,\\; x \\in [-1,4],\\; x \\in (-\\infty,-4]\\cup[1,\\infty)', annotation: 'Take the overlap of all conditions.' },
        { expression: 'x \\in [1, 4]', annotation: 'Final answer.' },
      ],
      answer: 'x ∈ [1, 4]',
    },
  ],

  crossRefs: [
    { lessonSlug: 'real-numbers', label: 'Real Numbers', context: 'Inequalities describe subsets of the real line using interval notation.' },
    { lessonSlug: 'sets-and-logic', label: 'Sets & Logic', context: 'Solution sets of inequalities are sets, and combining inequalities uses AND/OR logic.' },
    { lessonSlug: 'epsilon-delta', label: 'Epsilon-Delta', context: 'The epsilon-delta definition of limit is built entirely on inequalities involving absolute values.' },
    { lessonSlug: 'absolute-value', label: 'Absolute Value', context: 'Absolute value inequalities are a special but important case covered in depth here.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
