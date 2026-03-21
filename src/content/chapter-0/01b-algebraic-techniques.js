export default {
  id: 'ch0-algebraic-techniques',
  slug: 'algebraic-techniques',
  chapter: 0,
  order: 2,
  title: 'Algebraic Techniques for Limits',
  subtitle: 'Factoring, conjugates, and completing the square — the moves that solve indeterminate forms',
  tags: ['algebra', 'factoring', 'conjugate', 'completing the square', 'limits'],

  hook: {
    question: 'Why does (x² − 4)/(x − 2) simplify to x + 2, and how does that help us compute the limit as x → 2?',
    realWorldContext:
      'Many limit problems give 0/0 when you substitute directly. This is not a dead end—it is a signal that algebraic manipulation is hiding a simpler form. ' +
      'The same techniques—factoring, multiplying by a conjugate, completing the square—appear throughout calculus: ' +
      'solving 0/0 indeterminate forms in limits, finding critical points, and simplifying expressions before integration. ' +
      'Master these patterns now and calculus becomes a toolkit you already know how to use.',
    previewVisualizationId: 'FunctionPlotter',
    previewVisualizationProps: {
      fn: '(x*x - 4)/(x - 2)',
      xMin: -1,
      xMax: 5,
      label: 'Limit with a removable hole: (x^2-4)/(x-2)',
    },
  },

  intuition: {
    prose: [
      'When you substitute x = 2 into (x² − 4)/(x − 2), you get 0/0, which is undefined. ' +
      'But this does not mean the limit does not exist—it means the limit is hiding behind a common factor that cancels away.',

      'The intuition is always the same: **find and remove the obstacle (the common factor) that makes direct substitution fail.** ' +
      'Once the obstacle is gone, you can substitute and compute the limit.',

      'There are four main obstacle-removal techniques:',

      '**Technique 1: Factor and Cancel**  ' +
      'If both numerator and denominator have a common factor (like (x − 2)), factor it out and cancel. ' +
      'Example: (x² − 4)/(x − 2) = (x − 2)(x + 2)/(x − 2) = x + 2 (for x ≠ 2). Now substitute.',

      '**Technique 2: Multiply by a Conjugate**  ' +
      'When you see √A − √B, multiply top and bottom by √A + √B. ' +
      'The product (√A − √B)(√A + √B) = A − B, clearing the radicals and often creating a factorable form. ' +
      'This is pure pattern recognition: √A − √B signals "use the conjugate."',
      '**Technique 2b: Cube-Root Conjugate Pattern**  ' +
      'When you see ∛A − ∛B, the matching factor is (∛A² + ∛(AB) + ∛B²) because ' +
      '(u-v)(u²+uv+v²)=u³-v³. This is the cube-root analog of the square-root conjugate and appears in harder limit problems.',

      '**Technique 3: Find a Common Denominator**  ' +
      'Expressions like (1/(x + h) − 1/x) have fractions in the numerator. ' +
      'Combine them over a common denominator, simplify, and the result often factors.',

      '**Technique 4: Complete the Square**  ' +
      'For quadratic expressions, completing the square converts x² + bx + c into (x + b/2)² − (b/2)² + c, ' +
      'making the structure visible and sometimes allowing factorization or substitution.',

      'The key insight: **none of these techniques is magic.** Each one transforms the expression into a form where the common obstacle (the removable singularity) is visible and can be cancelled.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Indeterminate 0/0 Signals a Common Factor',
        body: 'If lim(x → a) f(x)/g(x) gives 0/0, then (x − a) divides both f(x) and g(x). Find the factorization and cancel (x − a). The limit is then lim(x → a) [remainder after cancelling].',
      },
      {
        type: 'tip',
        title: 'Recognize the Pattern',
        body: 'x² − a² = (x − a)(x + a). x³ − a³ = (x − a)(x² + ax + a²). These appear constantly. Memorize difference of squares, sum/difference of cubes, and perfect square trinomials.',
      },
      {
        type: 'technique',
        title: 'The Conjugate Signal',
        body: 'If you see √A ± √B in numerator or denominator, immediately think: multiply by the conjugate. Example: (√(x+1) − 2)/(x − 3) → multiply by (√(x+1) + 2)/(√(x+1) + 2).',
      },
      {
        type: 'technique',
        title: 'Cube-Root Conjugate Signal',
        body: 'For ∛A − ∛B use u=∛A, v=∛B, then multiply by (u²+uv+v²). This converts cube roots to A−B so common factors can cancel.',
      },
      {
        type: 'technique',
        title: 'Decision Tree for 0/0 Forms',
        body: 'Polynomial form? Factor. Has √ or ∛? Conjugate or special identity. Has 1/(x+h) form? Common denominator. Quadratic expression hidden? Complete the square.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Removable-Hole Visualization',
        caption: 'A graph of (x^2-4)/(x-2) shows the hole at x=2 that algebraic cancellation removes for limit evaluation.',
        props: {
          fn: '(x*x - 4)/(x - 2)',
          xMin: -1,
          xMax: 5,
          label: 'f(x) = (x^2 - 4)/(x - 2)',
        },
      },
    ],
  },

  math: {
    prose: [
      '**Difference of Squares: a² − b² = (a − b)(a + b)**',
      'Proof: expand (a − b)(a + b) = a² + ab − ab − b² = a² − b².',
      'Application: x² − 4 = (x − 2)(x + 2). Apply this whenever you see x² − (constant).',

      '**Difference of Cubes: a³ − b³ = (a − b)(a² + ab + b²)**',
      'Proof: expand the right side carefully to verify.',
      'Application: x³ − 8 = (x − 2)(x² + 2x + 4). When solving lim(x → 2) (x³ − 8)/(x − 2), the (x − 2) cancels, leaving x² + 2x + 4.',

      '**Sum of Cubes: a³ + b³ = (a + b)(a² − ab + b²)**',
      'Note the sign flip in the middle term compared to difference of cubes.',
      'Application: x³ + 27 = (x + 3)(x² − 3x + 9).',

      '**Perfect Square Trinomial: a² + 2ab + b² = (a + b)²**',
      'Also: a² − 2ab + b² = (a − b)².',

      '**Completing the Square: x² + bx = (x + b/2)² − (b/2)²**',
      'Geometric proof: x² + bx is an x-by-x square plus an x-by-b rectangle. ' +
      'Cut the rectangle into two b/2-by-x pieces. Rearrange to form a (x + b/2)-by-(x + b/2) square with a corner (b/2)-by-(b/2) missing. ' +
      'Hence x² + bx = (x + b/2)² − (b/2)².',

      '**Conjugate Rule: (√A − √B)(√A + √B) = A − B**',
      'Proof: expand (√A − √B)(√A + √B) = √A · √A + √A · √B − √B · √A − √B · √B = A − B.',
      'Why it works: the radicals vanish, replaced by the contents under the radicals.',
    ],
    callouts: [
      {
        type: 'key-identity',
        title: 'Must-Memorize Factorizations',
        body: 'a² − b² = (a + b)(a − b). a³ − b³ = (a − b)(a² + ab + b²). a³ + b³ = (a + b)(a² − ab + b²).',
      },
      {
        type: 'technique',
        title: 'General Strategy for 0/0 Polynomial Forms',
        body: '(1) Factor numerator completely. (2) Factor denominator completely. (3) Cancel all common factors. (4) Substitute. If the substitution still gives 0/0, repeat.',
      },
      {
        type: 'technique',
        title: 'Radical Elimination by Conjugate',
        body: '(1) Identify √A − √B or √A + √B. (2) Multiply numerator and denominator by the conjugate. (3) Simplify the product (√A − √B)(√A + √B) = A − B. (4) Factor and cancel.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'When we cancel a common factor (x − a) from numerator and denominator, we are asserting that f(x)/g(x) and the simplified form are **equal for all x ≠ a**. ' +
      'The functions have the same limit as x → a even though they differ at x = a itself.',

      'In epsilon-delta language: the cancellation removes the "obstruction" at a, so the (simplified) function becomes continuous-looking, and we compute its value at a to find the limit.',

      'In formal proofs, cite the factorization explicitly: "Factor the numerator as (x − 2)(x + 2)" so the reader can verify the algebra.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch0-alg-ex1',
      title: 'Factor and Cancel — Difference of Squares',
      problem: 'Compute \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}.',
      steps: [
        { expression: '\\frac{x^2 - 4}{x - 2}', annotation: 'Direct substitution: 0/0. Not helpful.' },
        { expression: '\\frac{(x-2)(x+2)}{x - 2}', annotation: 'Factor numerator using {{algebra:difference-of-squares|difference of squares}}.' },
        { expression: 'x + 2 \\quad (x \\neq 2)', annotation: 'Cancel (x − 2). The functions are equal everywhere except at x = 2.' },
        { expression: '\\lim_{x \\to 2} (x + 2) = 4', annotation: 'The simplified function has no obstacle at x = 2. Direct substitution works.' },
      ],
      conclusion: 'The limit is 4. Geometrically: the original function has a removable hole at x = 2; after canceling, the hole is filled.',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: '(x*x - 4)/(x - 2)',
        xMin: 0,
        xMax: 4,
        label: 'f(x) = (x^2 - 4)/(x - 2)',
      },
    },

    {
      id: 'ch0-alg-ex2',
      title: 'Conjugate Trick — Radical in Numerator',
      problem: 'Compute \\lim_{x \\to 0} \\frac{\\sqrt{x + 4} - 2}{x}.',
      steps: [
        { expression: '\\frac{\\sqrt{x+4} - 2}{x}', annotation: 'Substitute x = 0: (√4 − 2)/0 = 0/0.' },
        { expression: '\\frac{\\sqrt{x+4} - 2}{x} \\cdot \\frac{\\sqrt{x+4} + 2}{\\sqrt{x+4} + 2}', annotation: 'Multiply by conjugate.' },
        { expression: '\\frac{(\\sqrt{x+4})^2 - 2^2}{x(\\sqrt{x+4} + 2)}', annotation: 'Numerator: (A − B)(A + B) = A² − B².' },
        { expression: '\\frac{x + 4 - 4}{x(\\sqrt{x+4} + 2)}', annotation: 'Simplify.' },
        { expression: '\\frac{x}{x(\\sqrt{x+4} + 2)}', annotation: 'Cancel x.' },
        { expression: '\\frac{1}{\\sqrt{x+4} + 2}', annotation: 'For x ≠ 0.' },
        { expression: '\\lim_{x \\to 0} \\frac{1}{\\sqrt{x+4} + 2} = \\frac{1}{\\sqrt{4} + 2} = \\frac{1}{4}', annotation: 'Direct substitution now works.' },
      ],
      conclusion: 'The limit is 1/4. The conjugate cleared the radical, revealing x as a common factor to cancel.',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: '(Math.sqrt(x + 4) - 2)/x',
        xMin: -3.5,
        xMax: 3,
        label: 'f(x) = (sqrt(x+4)-2)/x',
      },
    },

    {
      id: 'ch0-alg-ex3',
      title: 'Common Denominator — Compound Fraction',
      problem: 'Compute \\lim_{h \\to 0} \\frac{\\frac{1}{2+h} - \\frac{1}{2}}{h}.',
      steps: [
        { expression: '\\frac{\\frac{1}{2+h} - \\frac{1}{2}}{h}', annotation: 'Directly substituting h = 0 gives 0/0. Simplify the numerator first.' },
        { expression: '\\frac{1}{2+h} - \\frac{1}{2} = \\frac{2 - (2+h)}{(2+h) \\cdot 2}', annotation: 'Find common denominator.' },
        { expression: '= \\frac{-h}{2(2+h)}', annotation: 'Simplify numerator.' },
        { expression: '\\frac{\\frac{-h}{2(2+h)}}{h} = \\frac{-h}{h \\cdot 2(2+h)}', annotation: 'Divide by h.' },
        { expression: '= \\frac{-1}{2(2+h)} \\quad (h \\neq 0)', annotation: 'Cancel h.' },
        { expression: '\\lim_{h \\to 0} \\frac{-1}{2(2+h)} = \\frac{-1}{2 \\cdot 2} = -\\frac{1}{4}', annotation: 'Direct substitution.' },
      ],
      conclusion: 'The limit is −1/4. This is the pattern for the derivative of 1/x by first principles.',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: '((1/(2 + x)) - (1/2))/x',
        xMin: -1.8,
        xMax: 1.8,
        label: 'f(h) = (1/(2+h) - 1/2)/h',
      },
    },

    {
      id: 'ch0-alg-ex4',
      title: 'Completing the Square — Vertex Form',
      problem: 'Rewrite x² − 6x + 5 in the form (x − h)² + k.',
      steps: [
        { expression: 'x^2 - 6x + 5', annotation: 'Start here. Identify b = −6.' },
        { expression: 'x^2 - 6x = (x - 3)^2 - 9', annotation: 'Complete the square on the first two terms. (x − 3)² = x² − 6x + 9, so x² − 6x = (x − 3)² − 9.' },
        { expression: '(x - 3)^2 - 9 + 5', annotation: 'Add back the constant term.' },
        { expression: '(x - 3)^2 - 4', annotation: 'Simplify.' },
      ],
      conclusion: 'The vertex form is (x − 3)² − 4. The vertex is at (3, −4). The geometric picture: the parabola is shifted 3 units right and 4 units down.',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: 'x*x - 6*x + 5',
        xMin: -1,
        xMax: 7,
        label: 'y = x^2 - 6x + 5',
      },
    },

    {
      id: 'ch0-alg-ex5',
      title: 'Factor Cubic Using Difference of Cubes',
      problem: 'Factor x³ − 8, then compute \\lim_{x \\to 2} \\frac{x^3 - 8}{x^2 - 4}.',
      steps: [
        { expression: 'x^3 - 8 = x^3 - 2^3', annotation: 'Recognize as a {{algebra:difference-of-cubes|difference of cubes}}.' },
        { expression: '= (x - 2)(x^2 + 2x + 4)', annotation: 'Apply a³ − b³ = (a − b)(a² + ab + b²).' },
        { expression: 'x^2 - 4 = (x - 2)(x + 2)', annotation: 'Factor the denominator as difference of squares.' },
        { expression: '\\frac{(x-2)(x^2+2x+4)}{(x-2)(x+2)}', annotation: 'Rewrite the original fraction.' },
        { expression: '= \\frac{x^2 + 2x + 4}{x + 2} \\quad (x \\neq 2)', annotation: 'Cancel (x − 2).' },
        { expression: '\\lim_{x \\to 2} \\frac{x^2 + 2x + 4}{x + 2} = \\frac{4 + 4 + 4}{2 + 2} = \\frac{12}{4} = 3', annotation: 'Direct substitution.' },
      ],
      conclusion: 'The limit is 3. Both numerator and denominator had (x − 2) as a factor; canceling it removed the singularity.',
      visualizationId: 'FunctionPlotter',
      params: {
        fn: '(x*x*x - 8)/(x*x - 4)',
        xMin: -1,
        xMax: 5,
        label: 'f(x) = (x^3 - 8)/(x^2 - 4)',
      },
    },
    {
      id: 'ch0-alg-ex6',
      title: 'Cube-Root Conjugate Limit',
      problem: 'Compute \\lim_{x \\to 8} \\frac{\\sqrt[3]{x} - 2}{x - 8}.',
      steps: [
        { expression: '\\frac{\\sqrt[3]{x} - 2}{x - 8}', annotation: 'Direct substitution gives 0/0.' },
        { expression: '\\frac{\\sqrt[3]{x} - 2}{x - 8} \\cdot \\frac{(\\sqrt[3]{x})^2 + 2\\sqrt[3]{x} + 4}{(\\sqrt[3]{x})^2 + 2\\sqrt[3]{x} + 4}', annotation: 'Use (u-v)(u²+uv+v²)=u³-v³ with u=∛x, v=2.' },
        { expression: '= \\frac{x - 8}{(x-8)\\left((\\sqrt[3]{x})^2 + 2\\sqrt[3]{x} + 4\\right)}', annotation: 'Numerator collapses to u³-v³ = x-8.' },
        { expression: '= \\frac{1}{(\\sqrt[3]{x})^2 + 2\\sqrt[3]{x} + 4}', annotation: 'Cancel x-8 for x ≠ 8.' },
        { expression: '\\lim_{x \\to 8} = \\frac{1}{4 + 4 + 4} = \\frac{1}{12}', annotation: 'Now substitute x=8, so ∛x=2.' },
      ],
      conclusion: 'The limit is 1/12. This is the exact cube-root analog of the square-root conjugate trick.',
    },
  ],

  challenges: [
    {
      id: 'ch0-alg-ch1',
      difficulty: 'medium',
      problem: 'Compute \\lim_{x \\to 3} \\frac{x^2 - 9}{x^2 - 3x}.',
      hint: 'Factor both numerator and denominator, then identify and cancel the common factor.',
      walkthrough: [
        { expression: '\\frac{x^2 - 9}{x^2 - 3x} = \\frac{(x-3)(x+3)}{x(x-3)}', annotation: 'Factor: difference of squares in numerator, factor out x in denominator.' },
        { expression: '= \\frac{x+3}{x} \\quad (x \\neq 3)', annotation: 'Cancel (x − 3).' },
        { expression: '\\lim_{x \\to 3} \\frac{x+3}{x} = \\frac{6}{3} = 2', annotation: 'Direct substitution.' },
      ],
      answer: '2',
    },

    {
      id: 'ch0-alg-ch2',
      difficulty: 'hard',
      problem: 'Compute \\lim_{x \\to 1} \\frac{\\sqrt{5x - 1} - 2}{x - 1}.',
      hint: 'Multiply by the conjugate \\frac{\\sqrt{5x-1} + 2}{\\sqrt{5x-1} + 2}.',
      walkthrough: [
        { expression: '\\frac{\\sqrt{5x-1} - 2}{x - 1} \\cdot \\frac{\\sqrt{5x-1} + 2}{\\sqrt{5x-1} + 2}', annotation: 'Multiply by conjugate.' },
        { expression: '= \\frac{(5x-1) - 4}{(x-1)(\\sqrt{5x-1} + 2)}', annotation: 'Numerator: (A − B)(A + B) = A² − B².' },
        { expression: '= \\frac{5x - 5}{(x-1)(\\sqrt{5x-1} + 2)}', annotation: 'Simplify.' },
        { expression: '= \\frac{5(x-1)}{(x-1)(\\sqrt{5x-1} + 2)}', annotation: 'Factor out 5 in the numerator.' },
        { expression: '= \\frac{5}{\\sqrt{5x-1} + 2} \\quad (x \\neq 1)', annotation: 'Cancel (x − 1).' },
        { expression: '\\lim_{x \\to 1} \\frac{5}{\\sqrt{5 \\cdot 1 - 1} + 2} = \\frac{5}{\\sqrt{4} + 2} = \\frac{5}{4}', annotation: 'Direct substitution.' },
      ],
      answer: '\\frac{5}{4}',
    },
  ],

  crossRefs: [
    { lessonSlug: 'introduction', label: 'Limits Introduction', context: 'These algebraic moves are essential for resolving 0/0 indeterminate forms.' },
    { lessonSlug: 'differentiation-rules', label: 'Differentiation Rules', context: 'The product rule, quotient rule, and chain rule proofs use these same algebraic techniques.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'completed-example-3', 'solved-challenge'],
}
