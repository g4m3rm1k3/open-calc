export default {
  id: 'algebra-tricky-parts',
  slug: 'algebra-tricky-parts',
  title: 'Algebra: The Parts That Trip Everyone Up',
  tags: ['algebra', 'common-mistakes', 'factoring', 'inequalities', 'absolute-value'],
  chapter: 0,
  order: 7,

  hook: {
    question: 'Why do smart people keep making the same algebra mistakes — and how do you stop?',
    context: `Algebra mistakes usually aren't random. They come from a handful of deeply ingrained
      wrong intuitions: thinking (a+b)² = a²+b², forgetting to flip inequality signs, mishandling
      negatives with exponents. This lesson targets the most common traps with direct, memorable fixes.`,
    realWorld: `In programming and engineering, algebraic errors cause silent bugs — calculations
      that look right but produce wrong outputs. A sign error in a PID controller can make a machine
      oscillate instead of stabilize. These "basic" mistakes have real consequences.`,
  },

  intuition: {
    summary: `Most algebra errors come from overapplying simple rules to situations where they don't hold.
      The fix is understanding WHEN each rule works and building a mental "alarm" for when you're in danger.`,
    perspectives: [
      {
        style: 'mistake-focused',
        title: 'The Distributive Trap',
        explanation: `(a + b)² ≠ a² + b². This is the #1 algebra error.
          Why? Because squaring means multiplying the WHOLE thing by itself:
          (a+b)² = (a+b)(a+b). FOIL it: a²+ab+ba+b² = a²+2ab+b².
          The 2ab term is always missing from wrong answers. Visual: (a+b)² is a square
          with side (a+b) — four regions, not two.`,
        visualizationId: 'AlgebraSquareViz',
      },
      {
        style: 'mistake-focused',
        title: 'Inequality Sign Flipping',
        explanation: `Multiply or divide both sides of an inequality by a NEGATIVE number?
          The sign flips. Always. Why? Because -1 < 2, but multiply both by -1: 1 > -2.
          The order reverses. People forget this especially when the negative comes from
          simplifying: -2x < 6 → x > -3 (divided by -2, sign flipped).`,
      },
      {
        style: 'mistake-focused',
        title: 'Absolute Value: Two Cases, Always',
        explanation: `|x| = 5 means x = 5 OR x = -5. Always two cases.
          |x - 3| < 2 means -2 < x-3 < 2, so 1 < x < 5. It's a DISTANCE — x is within 2 of 3.
          |x| = -1 has NO solution. Absolute value can never be negative.`,
      },
      {
        style: 'systematic',
        title: 'Factoring: A Decision Tree',
        explanation: `Step 1: GCF — always pull out common factors first.
          Step 2: Count terms. 2 terms → difference of squares/cubes. 3 terms → trinomial factoring.
          Step 3: Check if it factors further.
          Memorize: a²-b²=(a-b)(a+b). a³-b³=(a-b)(a²+ab+b²). a³+b³=(a+b)(a²-ab+b²).`,
      },
    ],
  },

  math: {
    formalDefinition: `The Fundamental Theorem of Algebra: every polynomial of degree n with complex
      coefficients has exactly n roots (counted with multiplicity) in the complex numbers.`,
    keyIdentities: [
      { name: 'Square of Sum', formula: '(a+b)^2 = a^2 + 2ab + b^2' },
      { name: 'Square of Difference', formula: '(a-b)^2 = a^2 - 2ab + b^2' },
      { name: 'Difference of Squares', formula: 'a^2 - b^2 = (a-b)(a+b)' },
      { name: 'Sum of Cubes', formula: 'a^3 + b^3 = (a+b)(a^2 - ab + b^2)' },
      { name: 'Difference of Cubes', formula: 'a^3 - b^3 = (a-b)(a^2 + ab + b^2)' },
      { name: 'Perfect Cube', formula: '(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3' },
    ],
    inequalityRules: [
      'Adding/subtracting the same value to both sides: direction preserved.',
      'Multiplying/dividing by a POSITIVE value: direction preserved.',
      'Multiplying/dividing by a NEGATIVE value: direction REVERSES.',
      'Taking reciprocals of both sides (same sign): direction reverses.',
    ],
  },

  rigor: {
    visualizationId: 'AlgebraSquareViz',
    title: 'Visual Proof: (a+b)² = a² + 2ab + b²',
    proofSteps: [
      { expression: '(a+b)^2 = (a+b)(a+b)', annotation: 'Squaring means multiplying by itself.' },
      { expression: '\\text{Draw a square with side } (a+b)', annotation: 'Split each side into segments of length a and b.' },
      { expression: '\\text{Four regions: } a \\times a,\\ a \\times b,\\ b \\times a,\\ b \\times b', annotation: 'Top-left: a². Top-right: ab. Bottom-left: ba. Bottom-right: b².' },
      { expression: 'a^2 + ab + ba + b^2 = a^2 + 2ab + b^2', annotation: 'Sum all four regions. The 2ab comes from the two rectangular pieces.' },
    ],
  },

  examples: [
    {
      id: 'ch0-7-ex1',
      title: 'Solving a Quadratic by Factoring',
      problem: 'Solve x² - 5x + 6 = 0',
      steps: [
        { expression: 'x^2 - 5x + 6', annotation: 'Need two numbers that multiply to 6 and add to -5.' },
        { expression: '-2 \\times -3 = 6, \\quad -2 + (-3) = -5', annotation: 'Those numbers are -2 and -3.' },
        { expression: '(x-2)(x-3) = 0', annotation: 'Factor.' },
        { expression: 'x = 2 \\text{ or } x = 3', annotation: 'Zero product property: if AB=0, then A=0 or B=0.' },
      ],
    },
    {
      id: 'ch0-7-ex2',
      title: 'Absolute Value Inequality',
      problem: 'Solve |2x - 1| ≤ 7',
      steps: [
        { expression: '-7 \\leq 2x - 1 \\leq 7', annotation: '|expr| ≤ k means -k ≤ expr ≤ k. Write as compound inequality.' },
        { expression: '-6 \\leq 2x \\leq 8', annotation: 'Add 1 to all three parts.' },
        { expression: '-3 \\leq x \\leq 4', annotation: 'Divide by 2 (positive, no flip). Solution is [-3, 4].' },
      ],
    },
    {
      id: 'ch0-7-ex3',
      title: 'Completing the Square',
      problem: 'Rewrite x² + 6x + 5 in vertex form.',
      steps: [
        { expression: 'x^2 + 6x + \\_ + 5', annotation: 'Identify the coefficient of x: it\'s 6. Half of 6 is 3. 3²=9.' },
        { expression: 'x^2 + 6x + 9 - 9 + 5', annotation: 'Add and subtract 9 (add zero in disguise).' },
        { expression: '(x+3)^2 - 4', annotation: 'The first three terms form a perfect square. Vertex is at (-3, -4).' },
      ],
    },
    {
      id: 'ch0-7-ex4',
      title: 'Rational Expression Simplification',
      problem: 'Simplify (x²-4)/(x²-x-2)',
      steps: [
        { expression: '\\frac{(x-2)(x+2)}{(x-2)(x+1)}', annotation: 'Factor numerator (diff. of squares) and denominator (trinomial).' },
        { expression: '= \\frac{x+2}{x+1} \\quad (x \\neq 2)', annotation: 'Cancel (x-2). Note: x≠2 because that would cause division by zero in the original.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch0-7-c1',
      difficulty: 'medium',
      problem: 'Solve the inequality (x-1)(x+3) > 0',
      hint: 'Find where each factor is zero (the critical points), then test the three resulting intervals.',
      walkthrough: [
        { expression: 'x = 1 \\text{ or } x = -3 \\text{ are critical points}', annotation: 'Each factor is zero at these values — the sign can only change here.' },
        { expression: 'x < -3: (-)(-)=+>0 \\checkmark \\quad -3<x<1: (+)(-)=-<0 \\text{ ✗} \\quad x>1:(+)(+)=+>0 \\checkmark', annotation: 'Test a value in each interval.' },
        { expression: 'x \\in (-\\infty, -3) \\cup (1, \\infty)', annotation: 'Solution is both outer intervals (not including endpoints since strict >).' },
      ],
      answer: 'x ∈ (-∞, -3) ∪ (1, ∞)',
    },
    {
      id: 'ch0-7-c2',
      difficulty: 'easy',
      problem: 'Factor completely: 2x³ - 8x',
      hint: 'Always pull out GCF first.',
      walkthrough: [
        { expression: '2x(x^2 - 4)', annotation: 'GCF is 2x. Factor it out.' },
        { expression: '2x(x-2)(x+2)', annotation: 'x²-4 is a difference of squares. Factor again. This is fully factored.' },
      ],
      answer: '2x(x-2)(x+2)',
    },
  ],
}
