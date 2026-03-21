export default {
  id: 'ch0-real-numbers',
  slug: 'real-numbers',
  chapter: 0,
  order: 0,
  title: 'Real Numbers & the Number Line',
  subtitle: 'The universe calculus lives in',
  tags: ['real numbers', 'number line', 'integers', 'rationals', 'irrationals', 'inequalities', 'absolute value', 'intervals'],

  hook: {
    question: 'Can you ever write down the exact length of the diagonal of a unit square?',
    realWorldContext:
      'A square with side length 1 has a diagonal of length √2 ≈ 1.41421356… — but that decimal never terminates or repeats. ' +
      'The ancient Greeks discovered this and were horrified. Their entire philosophy of mathematics was built on the idea that ' +
      'all lengths could be expressed as fractions (ratios of whole numbers). ' +
      'They called numbers that couldn\'t be expressed as fractions "irrational" — literally meaning "without ratio." ' +
      'One legend says the mathematician Hippasus was drowned at sea for revealing this discovery. ' +
      'Today we know the irrational numbers are everywhere on the number line — in fact, in a precise sense, there are ' +
      'infinitely more irrational numbers than rational ones. Calculus lives in this complete, gapless world of real numbers.',
    previewVisualizationId: 'NumberLine',
  },

  intuition: {
    prose: [
      'Imagine a perfectly straight ruler stretching infinitely in both directions. Every single point on that ruler corresponds to exactly one real number, and every real number corresponds to exactly one point. No gaps, no overlaps. This is the **real number line**, and it is the stage on which all of calculus plays out.',

      'The real numbers are built up in layers — like Russian nesting dolls, each family of numbers fitting inside the next.',

      '**Natural numbers ℕ = {1, 2, 3, 4, …}** — the counting numbers. These are the numbers you used first as a child. Note: some books include 0, some don\'t. For calculus, it rarely matters.',

      '**Integers ℤ = {…, −3, −2, −1, 0, 1, 2, 3, …}** — extend the naturals by including zero and negatives. The ℤ comes from the German word "Zahlen" meaning "numbers." You can add and subtract freely within ℤ.',

      '**Rational numbers ℚ = {p/q : p, q ∈ ℤ, q ≠ 0}** — all fractions. These include 1/2, −3/7, 5 (which equals 5/1), and 0.333… (which equals 1/3). The key test: a decimal is rational if and only if it terminates (like 0.25 = 1/4) or eventually repeats in a cycle (like 0.142857142857… = 1/7). The ℚ comes from "quotient."',

      '**Irrational numbers** — the rest. Numbers like √2, √3, π, e, and ∛5 whose decimal expansions never terminate and never settle into a repeating pattern. Between any two rational numbers there is an irrational, and between any two irrationals there is a rational — they interleave everywhere, infinitely densely.',

      '**Real numbers ℝ = ℚ ∪ irrationals** — everything. The real line has no "holes." This is the key property that separates ℝ from ℚ and makes calculus possible: every infinite decimal that seems like it "should" converge to something actually does converge to a real number.',

      'Why does this matter for calculus? Because limits, derivatives, and integrals all depend on the idea of numbers getting arbitrarily close together. If the number line had holes (like ℚ does), limits might "fall through" those holes and fail to exist. The completeness of ℝ is what prevents this.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'You Already Know These Numbers',
        body: 'You count with natural numbers (1, 2, 3…), use negative numbers for temperatures and debts, use fractions for recipes and measurements, and use decimals for money. Real numbers are simply ALL of these — plus the "weird" ones like √2 and π — unified on a single, gapless number line.',
      },
      {
        type: 'intuition',
        title: 'The nesting hierarchy',
        body: 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ — each set is a proper subset of the next. Integers include naturals, rationals include integers, reals include everything.',
      },
      {
        type: 'tip',
        title: 'How to test if a decimal is rational',
        body: 'Terminating: 0.75 = 3/4. Repeating: 0.̄3 = 1/3. Neither (irrational): 0.10100100010000… (no pattern). If you cannot write it as p/q for integers p, q, it is irrational.',
      },
      {
        type: 'misconception',
        title: '√2 is NOT "approximately 1.414"',
        body: '√2 is an exact number — it is the precise length of the diagonal of a unit square. Writing 1.414 is an approximation. The real number √2 has infinitely many non-repeating decimals, but it is just as "real" as the number 3.',
      },
    ],
    visualizationId: 'NumberLine',
    visualizationProps: { showSets: true },
  },

  math: {
    prose: [
      'We describe subsets of the real line using **interval notation**. An interval is a connected set of real numbers — no gaps. There are four types, distinguished by whether the endpoints are included.',

      '**Open interval (a, b)** = {x ∈ ℝ : a < x < b}. Endpoints NOT included. Draw with open circles on the number line. Think of "open" as "the door is open — the endpoints escaped."',

      '**Closed interval [a, b]** = {x ∈ ℝ : a ≤ x ≤ b}. Both endpoints included. Draw with filled circles. Think of "closed" as "the door is shut — the endpoints are trapped inside."',

      '**Half-open intervals**: [a, b) includes a but not b; (a, b] includes b but not a.',

      '**Infinite intervals**: (a, ∞) means all x > a; (−∞, b] means all x ≤ b; (−∞, ∞) = ℝ. We always use parentheses next to ∞ because infinity is not a number — you can never "include" it.',

      'The **absolute value** |x| captures the idea of distance. It strips away the sign, keeping only the magnitude. This is why |x| ≥ 0 always. The absolute value satisfies the crucial **triangle inequality** |a + b| ≤ |a| + |b|, which you will use constantly in epsilon-delta proofs.',

      'Solving an absolute value inequality requires careful case analysis because the absolute value function behaves differently for positive and negative inputs:',
      '• |A| < c (for c > 0) means −c < A < c (a single interval)',
      '• |A| > c (for c > 0) means A > c OR A < −c (two separate rays)',
      '• |A| = c means A = c or A = −c (two solutions)',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Absolute Value',
        body: '|x| = \\begin{cases} x & \\text{if } x \\geq 0 \\\\ -x & \\text{if } x < 0 \\end{cases}',
      },
      {
        type: 'definition',
        title: 'Distance on the Number Line',
        body: '\\text{Distance between } a \\text{ and } b = |a - b| = |b - a|',
      },
      {
        type: 'theorem',
        title: 'Absolute Value as a Distance',
        body: '|x - c| < r \\iff x \\in (c - r,\\; c + r) \\\\ \\text{(all points within distance } r \\text{ of } c \\text{)}',
      },
    ],
    visualizationId: 'NumberLine',
    visualizationProps: { showIntervals: true },
  },

  rigor: {
    prose: [
      'The property that distinguishes ℝ from ℚ is called the **Completeness Axiom** (also called the Least Upper Bound Property). It is not a theorem — it is an axiom, a foundational assumption we take as the definition of the real numbers.',

      'First, some vocabulary: a set S is **bounded above** if there exists some number M with x ≤ M for all x ∈ S. We call M an **upper bound**. The **supremum** (least upper bound, written sup S) is the smallest upper bound — the tightest ceiling.',

      'For example, S = {x : x² < 2} = (−√2, √2). The number 5 is an upper bound. So is 2. So is 1.5. But the smallest upper bound is √2 itself. Is √2 in ℚ? No. So if we were working in ℚ, this set would have no supremum in ℚ — the "tightest ceiling" falls through a hole.',

      'The Completeness Axiom says this never happens in ℝ: every non-empty set bounded above has a supremum that is itself a real number.',

      'This is the engine behind the Intermediate Value Theorem, the Extreme Value Theorem, and ultimately the existence of definite integrals. Without completeness, the derivative might not equal zero at a local maximum (because the maximum might fall through a hole). Every major theorem in calculus depends on this axiom.',

      'A consequence: every **Cauchy sequence** (a sequence where terms get arbitrarily close to each other) converges to a real number. In ℚ, the sequence 1, 1.4, 1.41, 1.414, 1.4142, … is Cauchy but has no rational limit. In ℝ, it converges to √2.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Completeness Axiom (Least Upper Bound Property)',
        body: '\\text{Every non-empty subset } S \\subset \\mathbb{R} \\text{ that is bounded above} \\\\ \\text{has a supremum } \\sup S \\in \\mathbb{R}.',
      },
      {
        type: 'definition',
        title: 'Supremum and Infimum',
        body: '\\sup S = \\text{least upper bound of } S \\\\ \\inf S = \\text{greatest lower bound of } S \\\\ \\text{(infimum requires: }S\\text{ bounded below)}',
      },
      {
        type: 'tip',
        title: 'sup vs max',
        body: 'sup S always exists (in ℝ, if S is bounded above). max S exists only if the supremum is actually achieved by some element of S. Example: sup(0,1) = 1 but max(0,1) does not exist (1 ∉ (0,1)).',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-interval-notation',
      title: 'Writing Sets in Interval Notation',
      problem: 'Write the solution set of -3 < x \\leq 5 in interval notation, then describe it in words and draw it.',
      steps: [
        { expression: '-3 < x \\leq 5', annotation: 'Read the inequality carefully: x is STRICTLY greater than −3 (open left endpoint) and LESS THAN OR EQUAL TO 5 (closed right endpoint).' },
        { expression: '(-3,\\; 5]', annotation: 'Parenthesis at −3: not included. Bracket at 5: included. Always write left endpoint first.' },
        { expression: '\\text{In words: all real numbers greater than } -3 \\text{ and at most } 5.', annotation: '' },
        { expression: '\\text{On a number line: open circle at } -3, \\text{ filled circle at } 5, \\text{ shaded between.}', annotation: '' },
      ],
      conclusion: 'The interval (−3, 5] has length 5 − (−3) = 8. It contains infinitely many real numbers, including irrationals like √5 ≈ 2.236.',
    },
    {
      id: 'ex-absolute-value-equation',
      title: 'Solving an Absolute Value Equation',
      problem: 'Solve |2x - 3| = 7. Interpret geometrically.',
      steps: [
        { expression: '|2x - 3| = 7', annotation: '|A| = 7 means A = 7 or A = −7. There are always at most two solutions.' },
        { expression: '\\textbf{Case 1:}\\quad 2x - 3 = 7', annotation: '' },
        { expression: '2x = 7 + 3 = 10', annotation: 'Add 3 to both sides.' },
        { expression: 'x = 5', annotation: 'Divide both sides by 2.' },
        { expression: '\\textbf{Case 2:}\\quad 2x - 3 = -7', annotation: '' },
        { expression: '2x = -7 + 3 = -4', annotation: 'Add 3 to both sides.' },
        { expression: 'x = -2', annotation: 'Divide both sides by 2.' },
        { expression: '\\textbf{Check Case 1:}\\quad |2(5)-3| = |10-3| = |7| = 7\\;\\checkmark', annotation: '' },
        { expression: '\\textbf{Check Case 2:}\\quad |2(-2)-3| = |-4-3| = |-7| = 7\\;\\checkmark', annotation: '' },
      ],
      conclusion: 'Two solutions: x = 5 and x = −2. Geometrically: |2x−3| = 7 means the distance from the point (2x−3) to 0 is 7, i.e., 2x−3 is 7 units from the origin on the number line.',
    },
    {
      id: 'ex-absolute-value-inequality',
      title: 'Absolute Value Inequality — "Less Than" Case',
      problem: 'Solve |x - 4| < 3 and express the solution as an interval. Interpret as a distance.',
      steps: [
        { expression: '|x - 4| < 3', annotation: 'Geometric reading: the distance from x to 4 is less than 3. So x is within 3 units of 4.' },
        { expression: '-3 < x - 4 < 3', annotation: 'Algebraic rule: |A| < c (c > 0) becomes −c < A < c.' },
        { expression: '-3 + 4 < x < 3 + 4', annotation: 'Add 4 to all three parts of the compound inequality.' },
        { expression: '1 < x < 7', annotation: 'Simplify.' },
        { expression: 'x \\in (1,\\; 7)', annotation: 'Interval notation. Both endpoints open.' },
        { expression: '\\text{Check endpoints: } |1 - 4| = 3 \\not< 3, \\quad |7-4| = 3 \\not< 3', annotation: 'Confirms 1 and 7 are correctly excluded.' },
        { expression: '\\text{Check interior: } |4 - 4| = 0 < 3\\;\\checkmark', annotation: 'The center x = 4 satisfies the inequality.' },
      ],
      conclusion: 'Solution: (1, 7). Geometrically, this is all points on the number line within distance 3 of x = 4. Center 4, radius 3 → interval (4−3, 4+3) = (1, 7).',
    },
    {
      id: 'ex-abs-inequality-greater',
      title: 'Absolute Value Inequality — "Greater Than" Case',
      problem: 'Solve |3x + 1| \\geq 4 and write the solution as a union of intervals.',
      steps: [
        { expression: '|3x + 1| \\geq 4', annotation: '|A| ≥ c means A ≥ c OR A ≤ −c. This gives two separate pieces, not a single interval.' },
        { expression: '\\textbf{Case 1:}\\quad 3x + 1 \\geq 4', annotation: '' },
        { expression: '3x \\geq 4 - 1 = 3', annotation: 'Subtract 1 from both sides.' },
        { expression: 'x \\geq 1', annotation: 'Divide by 3 (positive — direction unchanged).' },
        { expression: '\\textbf{Case 2:}\\quad 3x + 1 \\leq -4', annotation: '' },
        { expression: '3x \\leq -4 - 1 = -5', annotation: 'Subtract 1.' },
        { expression: 'x \\leq -\\tfrac{5}{3}', annotation: 'Divide by 3.' },
        { expression: 'x \\in \\left(-\\infty,\\, -\\tfrac{5}{3}\\right] \\cup [1, +\\infty)', annotation: 'Combine both cases with the union symbol ∪. Both endpoints are closed (≥ and ≤).' },
      ],
      conclusion: 'The solution is two rays pointing outward: everything far enough from the "center" of the expression. Notice this is the complement of the open interval (−5/3, 1), which would be the solution to |3x+1| < 4.',
    },
    {
      id: 'ex-nested-absolute',
      title: 'Inequality Involving Absolute Value and Fractions',
      problem: 'Solve \\dfrac{|x+2|}{3} \\leq 1.',
      steps: [
        { expression: '\\frac{|x+2|}{3} \\leq 1', annotation: 'Isolate the absolute value expression first.' },
        { expression: '|x+2| \\leq 3', annotation: 'Multiply both sides by 3 (positive, so direction unchanged).' },
        { expression: '-3 \\leq x+2 \\leq 3', annotation: 'Apply the rule: |A| ≤ c becomes −c ≤ A ≤ c.' },
        { expression: '-3 - 2 \\leq x \\leq 3 - 2', annotation: 'Subtract 2 from all three parts.' },
        { expression: '-5 \\leq x \\leq 1', annotation: 'Simplify.' },
        { expression: 'x \\in [-5,\\, 1]', annotation: 'Both endpoints included (≤).' },
      ],
      conclusion: 'Solution: [−5, 1]. Rule: always isolate the absolute value before applying the case analysis.',
    },
    {
      id: 'ex-find-supremum',
      title: 'Finding a Supremum',
      problem: 'Let S = \\left\\{\\dfrac{n}{n+1} : n \\in \\mathbb{N}\\right\\} = \\left\\{\\tfrac{1}{2}, \\tfrac{2}{3}, \\tfrac{3}{4}, \\tfrac{4}{5}, \\ldots\\right\\}. Find \\sup S.',
      steps: [
        { expression: 'a_n = \\frac{n}{n+1} = 1 - \\frac{1}{n+1}', annotation: 'Rewrite by dividing: n/(n+1) = (n+1−1)/(n+1) = 1 − 1/(n+1). This form is easier to analyze.' },
        { expression: '\\text{As } n \\to \\infty: \\quad \\frac{1}{n+1} \\to 0 \\implies a_n \\to 1', annotation: 'The terms get closer and closer to 1.' },
        { expression: 'a_n < 1 \\text{ for all } n \\in \\mathbb{N}', annotation: 'Since 1/(n+1) > 0 for all finite n, we always have a_n = 1 − (positive) < 1. So 1 is an upper bound.' },
        { expression: '\\text{Is there a smaller upper bound? Suppose } M < 1.', annotation: 'We want to show 1 is the LEAST upper bound.' },
        { expression: '\\text{Need } n \\text{ s.t. } \\frac{n}{n+1} > M \\iff \\frac{1}{n+1} < 1-M \\iff n+1 > \\frac{1}{1-M}', annotation: 'Solve for which n makes a_n exceed M.' },
        { expression: '\\text{By the Archimedean property, such } n \\text{ exists.}', annotation: 'We can always find a large enough natural number. So M is NOT an upper bound.' },
        { expression: '\\therefore \\sup S = 1', annotation: 'No smaller upper bound works, so 1 is the supremum. Note: 1 ∉ S, so max S does not exist.' },
      ],
      conclusion: 'sup S = 1, but max S is undefined because 1 is never actually achieved. This is a clean example of why sup and max are different concepts.',
    },
  ],

  challenges: [
    {
      id: 'ch0-c1',
      difficulty: 'easy',
      problem: 'Solve |5 - 2x| \\leq 3 and express the solution set as an interval.',
      hint: 'Rewrite as −3 ≤ 5 − 2x ≤ 3. When you divide by −2, the inequality signs flip. Be careful!',
      walkthrough: [
        { expression: '|5 - 2x| \\leq 3', annotation: '' },
        { expression: '-3 \\leq 5 - 2x \\leq 3', annotation: '|A| ≤ c becomes −c ≤ A ≤ c.' },
        { expression: '-3 - 5 \\leq -2x \\leq 3 - 5', annotation: 'Subtract 5 from all three parts.' },
        { expression: '-8 \\leq -2x \\leq -2', annotation: 'Simplify.' },
        { expression: '\\frac{-8}{-2} \\geq x \\geq \\frac{-2}{-2}', annotation: 'Divide all parts by −2. FLIP both inequalities (dividing by negative).' },
        { expression: '4 \\geq x \\geq 1', annotation: 'Simplify.' },
        { expression: '1 \\leq x \\leq 4 \\implies x \\in [1, 4]', annotation: 'Rewrite in standard left-to-right order.' },
      ],
      answer: '[1, 4]',
    },
    {
      id: 'ch0-c2',
      difficulty: 'medium',
      problem: 'Prove the triangle inequality: |a + b| \\leq |a| + |b| for all a, b \\in \\mathbb{R}.',
      hint: 'Square both sides. Since both sides are non-negative, |a+b| ≤ |a|+|b| is equivalent to |a+b|² ≤ (|a|+|b|)². Use the fact that any number is ≤ its absolute value.',
      walkthrough: [
        { expression: '\\text{Since both sides are} \\geq 0:\\;\\; |a+b| \\leq |a|+|b| \\iff |a+b|^2 \\leq (|a|+|b|)^2', annotation: 'Squaring is valid here because both sides are non-negative.' },
        { expression: '|a+b|^2 = (a+b)^2 = a^2 + 2ab + b^2', annotation: 'Expand left side.' },
        { expression: '(|a|+|b|)^2 = a^2 + 2|a||b| + b^2', annotation: 'Expand right side (|a|² = a², |b|² = b²).' },
        { expression: '\\text{Need to show: } a^2 + 2ab + b^2 \\leq a^2 + 2|a||b| + b^2', annotation: '' },
        { expression: '\\iff 2ab \\leq 2|a||b| \\iff ab \\leq |ab|', annotation: 'Simplify (cancel a² + b² from both sides, divide by 2).' },
        { expression: '\\text{Key fact: for any real number } c, \\;\\; c \\leq |c|.', annotation: 'If c ≥ 0: c = |c|, so c ≤ |c|. If c < 0: c < 0 ≤ |c|, so c ≤ |c|. Both cases verified.' },
        { expression: '\\therefore\\; ab \\leq |ab| \\;\\checkmark \\implies |a+b|^2 \\leq (|a|+|b|)^2 \\implies |a+b| \\leq |a|+|b| \\;\\blacksquare', annotation: '' },
      ],
      answer: 'Proved: |a + b| ≤ |a| + |b|',
    },
    {
      id: 'ch0-c3',
      difficulty: 'hard',
      problem: 'Solve the compound inequality |x - 1| + |x + 1| = 4.',
      hint: 'The expression |x−1| + |x+1| represents the sum of distances from x to 1 and from x to −1. Split into three cases based on the critical points x = −1 and x = 1.',
      walkthrough: [
        { expression: '\\text{Critical points: } x = 1 \\text{ and } x = -1.', annotation: 'These are where the expressions inside the absolute values change sign. They divide the number line into three regions.' },
        { expression: '\\textbf{Case 1: } x < -1', annotation: 'Here x−1 < 0 and x+1 < 0.' },
        { expression: '|x-1| + |x+1| = -(x-1) + -(x+1) = -x+1-x-1 = -2x', annotation: 'Remove absolute values using the sign of each expression in this region.' },
        { expression: '-2x = 4 \\implies x = -2', annotation: 'Solve. Check: −2 < −1 ✓. So x = −2 is a solution.' },
        { expression: '\\textbf{Case 2: } -1 \\leq x \\leq 1', annotation: 'Here x−1 ≤ 0 and x+1 ≥ 0.' },
        { expression: '|x-1| + |x+1| = -(x-1) + (x+1) = -x+1+x+1 = 2', annotation: 'The sum simplifies to the constant 2.' },
        { expression: '2 = 4\\;?\\quad \\text{Never true.}', annotation: 'No solutions in [−1, 1].' },
        { expression: '\\textbf{Case 3: } x > 1', annotation: 'Here x−1 > 0 and x+1 > 0.' },
        { expression: '|x-1|+|x+1| = (x-1)+(x+1) = 2x', annotation: '' },
        { expression: '2x = 4 \\implies x = 2', annotation: 'Check: 2 > 1 ✓. So x = 2 is a solution.' },
        { expression: '\\text{Solution set: } \\{-2, 2\\}', annotation: '' },
      ],
      answer: 'x = −2 and x = 2',
    },
  ],

  crossRefs: [
    { lessonSlug: 'functions', label: 'Next: Functions', context: 'Functions map real numbers to real numbers — they are the main objects of calculus.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
