// Math-1 Chapter 1.1 — Numbers & Structure
// Schema: calc-style (hook / intuition / math / rigor / examples / challenges)
// Visualizations: NumberLine, FunctionPlotter, PythonNotebook
// This is the REFERENCE / STANDALONE version of the Chapter 1.1 content.
// The notebook-first version lives in python-1/ch1-1.js.

export default {
  id: 'math1-1-numbers-structure',
  slug: 'numbers-and-structure',
  chapter: 1.1,
  order: 0,
  title: 'Numbers & Structure',
  subtitle: 'Integers, reals, precision, and the geometry of absolute value',
  tags: ['integers', 'reals', 'floating point', 'scientific notation', 'absolute value', 'distance', 'precision'],

  hook: {
    question: 'Why does 0.1 + 0.2 not equal 0.3 in Python — and what does that tell us about numbers?',
    realWorldContext:
      'Open a Python terminal and type `0.1 + 0.2`. You get `0.30000000000000004`. ' +
      'This is not a bug. It is a window into the gap between the mathematical real numbers ' +
      'and the numbers a computer can actually represent. Every programming language, ' +
      'every calculator, every piece of financial software that has ever lost money due to ' +
      '"rounding errors" is wrestling with the same problem: the real number line is continuous, ' +
      'but memory is finite. Understanding what numbers ARE — and what makes them different — ' +
      'is the foundation of both mathematics and reliable computation.',
    previewVisualizationId: 'NumberLine',
    previewVisualizationProps: { showSets: true },
  },

  intuition: {
    prose: [
      'Numbers come in families, each a proper subset of the next. Understanding which family a number belongs to determines what operations are safe, what precision is possible, and how a computer will store it.',

      '**Natural numbers ℕ = {1, 2, 3, …}** are the counting numbers. Finite, discrete, and always positive. A computer stores these exactly — there is no approximation involved in representing the integer 7.',

      '**Integers ℤ = {…, −2, −1, 0, 1, 2, …}** add zero and the negatives. Python\'s `int` type stores integers exactly with arbitrary precision — there is no integer overflow in Python. `2**1000` gives you a thousand-digit integer without complaint.',

      '**Rational numbers ℚ** are all fractions p/q where p and q are integers and q ≠ 0. Their decimal expansions either terminate (1/4 = 0.25) or eventually repeat (1/3 = 0.333…). The number 0.1 is rational — it equals 1/10 exactly. But 1/10 in binary is 0.0001100110011… — a repeating pattern that never ends. This is the root of the floating point problem.',

      '**Irrational numbers** are those that cannot be written as any fraction. Their decimal expansions go on forever without repeating: √2 = 1.41421356…, π = 3.14159265…, e = 2.71828182…. These numbers are perfectly real (they correspond to exact geometric measurements) but they cannot be stored exactly in any finite representation.',

      '**Real numbers ℝ** are the union of all the above. They fill the number line completely — no gaps. This completeness is what makes calculus work: every sequence that "should" converge actually does. But it also means most real numbers cannot be named with finitely many symbols, let alone stored in a computer.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The hierarchy: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ',
        body: 'Every natural number is an integer. Every integer is rational (n = n/1). Every rational is real. But not every real is rational — in fact, in a precise sense, "almost all" real numbers are irrational.',
      },
      {
        type: 'important',
        title: 'Integers are exact; decimals are approximate',
        body: 'A computer stores 7 as exactly 7. But 0.1 stored as a floating-point number is 0.1000000000000000055511151231257827021181583404541015625 — the closest 64-bit binary fraction to 1/10. Close, but not equal.',
      },
      {
        type: 'tip',
        title: 'How to test if a number is rational',
        body: 'Does the decimal terminate? (1/4 = 0.25 ✓) Does it eventually repeat? (1/6 = 0.16666… ✓) If neither — it\'s irrational. √2: 1.41421356… no pattern. π: 3.14159265… no pattern.',
      },
    ],
    visualizationId: 'NumberLine',
    visualizationProps: { showSets: true },
  },

  math: {
    prose: [
      '**Scientific notation** expresses any number as a × 10ⁿ where 1 ≤ |a| < 10 and n is an integer. It solves two problems at once: representing very large numbers (the mass of the sun is 1.989 × 10³⁰ kg, not 1,989,000,000,000,000,000,000,000,000,000 kg) and communicating precision (writing 3.00 × 10³ signals three significant figures; writing 3000 is ambiguous).',

      'The exponent n tells you the **order of magnitude** — a rough sense of scale. Increasing n by 1 multiplies the value by 10. The distance from Earth to the Moon is ~3.84 × 10⁸ m. The diameter of a hydrogen atom is ~1.06 × 10⁻¹⁰ m. Their ratio is ~3.62 × 10¹⁸ — about 3.6 quintillion hydrogen atoms laid side by side would span the Earth-Moon distance.',

      'The **absolute value** |x| measures how far x is from zero — its distance on the number line, with sign stripped away. The piecewise definition makes this precise: |x| = x when x is already non-negative (no sign to strip), and |x| = −x when x is negative (negating a negative gives a positive). Key properties follow immediately from this geometric interpretation.',

      'The most important use of absolute value is **measuring distance**: the distance between two real numbers a and b is |a − b|. This is symmetric (|a − b| = |b − a|), always non-negative, and zero only when a = b. The inequality |x − c| < r then says: "x is within distance r of c" — a ball of radius r centered at c on the number line.',

      'The **triangle inequality** |a + b| ≤ |a| + |b| says that the distance from the origin to a + b is at most the sum of the distances to a and to b. Think of it as the triangle rule: a straight line is shorter than a detour via any third point. This inequality appears throughout analysis, especially in ε-δ proofs.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Absolute Value',
        body: '|x| = \\begin{cases} x & \\text{if } x \\geq 0 \\\\ -x & \\text{if } x < 0 \\end{cases}',
      },
      {
        type: 'theorem',
        title: 'Distance and Ball Interpretation',
        body: '|a - b| = \\text{distance between } a \\text{ and } b \\\\ |x - c| < r \\iff x \\in (c-r,\\; c+r)',
      },
      {
        type: 'theorem',
        title: 'Triangle Inequality',
        body: '|a + b| \\leq |a| + |b| \\quad \\text{for all } a, b \\in \\mathbb{R}',
      },
      {
        type: 'tip',
        title: 'Scientific notation in Python',
        body: 'Write 3.0e8 for 3.0 × 10⁸, or 1.06e-10 for 1.06 × 10⁻¹⁰. Python displays large floats in scientific notation automatically when appropriate.',
      },
    ],
    visualizationId: 'FunctionPlotter',
    visualizationProps: {
      fn: 'Math.abs(x)',
      label: 'f(x) = |x|',
      xMin: -5,
      xMax: 5,
    },
  },

  rigor: {
    prose: [
      'Computers represent real numbers using the **IEEE 754 floating-point standard**. A 64-bit float (Python\'s `float`) stores a number in three parts: 1 sign bit, 11 exponent bits, and 52 mantissa (significand) bits. The mantissa is a binary fraction of the form 1.b₁b₂…b₅₂ × 2ᵉ.',

      'The problem: most decimal fractions are not exact in binary. The number 0.1 in decimal is the infinite repeating binary fraction 0.000110011001100110011… — like 1/3 in decimal, it has no finite representation. The hardware stores the closest 64-bit approximation, which differs from the true value by about 5.5 × 10⁻¹⁸. Add two such approximations and the errors accumulate.',

      '**Machine epsilon** (ε_machine ≈ 2.22 × 10⁻¹⁶ for 64-bit floats) is the smallest floating-point number ε such that 1.0 + ε ≠ 1.0. It quantifies the relative error in any floating-point computation. The correct way to compare two floats is not `a == b` but `abs(a - b) < tolerance` where `tolerance` is chosen relative to the scale of the numbers.',

      'This is not a flaw in Python or your computer. It is a fundamental consequence of representing infinitely many real numbers in finitely many bits. Every numerical analyst, physicist, and financial engineer must understand this. The discipline of **numerical analysis** studies how errors propagate through computations and how to design algorithms that stay accurate.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Never compare floats with ==',
        body: 'Instead of `a == b`, use `abs(a - b) < 1e-9` (or `math.isclose(a, b)`). The == test for floats almost never means what you intend.',
      },
      {
        type: 'definition',
        title: 'Machine Epsilon',
        body: '\\varepsilon_{\\text{mach}} = \\min\\{\\varepsilon > 0 : \\text{fl}(1 + \\varepsilon) \\neq 1\\} \\approx 2.22 \\times 10^{-16} \\text{ (64-bit)}',
      },
      {
        type: 'insight',
        title: 'Integers in Python are exact',
        body: 'Python\'s `int` type uses arbitrary-precision arithmetic — it allocates as many bits as needed. `2**1000` is computed exactly. The floating-point precision issue applies only to `float`. For exact decimal arithmetic, use the `decimal` module.',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'math1-1-ex-sci-notation',
      title: 'Converting To and From Scientific Notation',
      problem: 'Express (a) 0.000047 and (b) 312,000,000 in scientific notation. Then evaluate (c) (4.0 \\times 10^3) \\times (2.5 \\times 10^{-7}).',
      steps: [
        { expression: '0.000047 = 4.7 \\times 10^{-5}', annotation: 'Move the decimal right until you have one non-zero digit before it. Moved 5 places right → exponent is −5.', hints: ['Count how many places you move the decimal point to the right.', 'Moving right means a negative exponent.'] },
        { expression: '312{,}000{,}000 = 3.12 \\times 10^8', annotation: 'Move the decimal left 8 places to get 3.12. Moved left → positive exponent.', hints: ['Count decimal places moved to the left.', 'Moving left means a positive exponent.'] },
        { expression: '(4.0 \\times 10^3)(2.5 \\times 10^{-7}) = (4.0 \\times 2.5) \\times 10^{3+(-7)}', annotation: 'Multiply the significands; add the exponents (product rule for powers of 10).', hints: ['Group the significands and the powers of 10 separately.', 'Exponents add when multiplying same base.'] },
        { expression: '= 10.0 \\times 10^{-4} = 1.0 \\times 10^{-3}', annotation: '10.0 is not in standard form (must have 1 ≤ a < 10), so rewrite 10.0 = 1.0 × 10¹ and add 1 to the exponent.', hints: ['10.0 × 10⁻⁴ = 1.0 × 10¹ × 10⁻⁴ = 1.0 × 10⁻³.', 'Always adjust so the significand is in [1, 10).'] },
      ],
      conclusion: 'Answers: (a) 4.7 × 10⁻⁵, (b) 3.12 × 10⁸, (c) 1.0 × 10⁻³. The exponent tells you the order of magnitude — roughly, how many digits the number has.',
    },
    {
      id: 'math1-1-ex-distance',
      title: 'Distance on the Number Line',
      problem: 'Find (a) the distance between −3 and 5, (b) all x with |x − 2| \\leq 4, (c) all x with |2x + 1| > 5.',
      steps: [
        { expression: '|{-3} - 5| = |{-8}| = 8', annotation: '(a) Distance = |a − b|. Subtract in either order: |5 − (−3)| = |8| = 8 as well.', hints: ['Distance is always non-negative.', 'The order of subtraction does not matter.'] },
        { expression: '|x - 2| \\leq 4 \\iff -4 \\leq x - 2 \\leq 4', annotation: '(b) The rule: |A| ≤ c becomes −c ≤ A ≤ c.', hints: ['|A| ≤ c means the expression A is within c of 0.', 'Write as a compound inequality.'] },
        { expression: '-4 + 2 \\leq x \\leq 4 + 2 \\implies x \\in [-2,\\, 6]', annotation: 'Add 2 throughout.', hints: ['Add 2 to all three parts.'] },
        { expression: '|2x + 1| > 5 \\iff 2x + 1 > 5 \\text{ or } 2x + 1 < -5', annotation: '(c) |A| > c gives two separate inequalities.', hints: ['Split into two cases.'] },
        { expression: 'x > 2 \\text{ or } x < -3 \\implies x \\in (-\\infty,\\,-3) \\cup (2,\\,+\\infty)', annotation: 'Solve each case. Union of two open rays.', hints: ['Case 1: 2x > 4. Case 2: 2x < −6.'] },
      ],
      conclusion: 'Distance on the number line always uses absolute value. |x − c| < r is a "ball" of radius r centered at c; |x − c| > r is everything outside.',
    },
  ],

  challenges: [
    {
      id: 'math1-1-c1',
      difficulty: 'easy',
      problem: 'Solve |3x - 6| = 9. State both solutions and verify each one.',
      hint: '|A| = 9 gives A = 9 or A = −9. Solve each linear equation separately.',
      answer: 'x = 5 or x = −1.',
    },
    {
      id: 'math1-1-c2',
      difficulty: 'easy',
      problem: 'Write 0.00000602 and 9,460,000,000,000 in scientific notation. What is their product?',
      hint: 'For the product: multiply the significands and add the exponents.',
      answer: '6.02 × 10⁻⁶ and 9.46 × 10¹². Product ≈ 5.695 × 10⁷.',
    },
    {
      id: 'math1-1-c3',
      difficulty: 'medium',
      problem: 'Solve |x + 3| \\leq |x - 1| geometrically.',
      hint: 'The midpoint of −3 and 1 is −1. Points left of −1 are closer to −3.',
      answer: 'x ∈ (−∞, −1].',
    },
    {
      id: 'math1-1-c4',
      difficulty: 'medium',
      problem: 'A programmer accumulates 0.01 a total of 100 times and checks if the result equals 1.0. Does the check pass? Fix it.',
      hint: 'Try sum(0.01 for _ in range(100)). Use math.isclose() for the fix.',
      answer: 'total ≈ 0.9999999999999999. Fix: math.isclose(total, 1.0) or abs(total - 1.0) < 1e-9.',
    },
    {
      id: 'math1-1-c5',
      difficulty: 'hard',
      problem: 'Prove the triangle inequality |a + b| ≤ |a| + |b| by case analysis on the signs of a and b.',
      hint: 'Four cases: both positive, both negative, mixed sign × 2.',
      answer: 'Case a,b ≥ 0: |a+b| = a+b = |a|+|b|. Case a,b < 0: |a+b| = −(a+b) = |a|+|b|. Mixed: WLOG a ≥ 0 > b. If a+b ≥ 0: a+b ≤ a+(−b). If a+b < 0: −a−b ≤ a+(−b). QED.',
    },
  ],
}
