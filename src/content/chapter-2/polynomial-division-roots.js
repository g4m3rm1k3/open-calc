export default {
  id: 'ch2-008',
  slug: 'polynomial-division-roots',
  chapter: 2,
  order: 10,
  title: 'Polynomial Division, Rational Zeros, and Descartes\' Rule',
  subtitle: 'Long division and synthetic division are the tools; the Rational Zero Theorem and Descartes\' Rule tell you where to look',
  tags: ['polynomial division', 'long division', 'synthetic division', 'remainder theorem', 'factor theorem', 'rational zeros', 'Descartes rule', 'linear factorization'],
  aliases: 'polynomial long division synthetic division remainder theorem factor theorem rational zero theorem Descartes rule of signs roots higher order polynomial',

  hook: {
    question: 'You can factor $x^2 - 5x + 6$ by inspection. But how do you find the roots of $2x^4 - 3x^3 - 8x^2 + 3x + 6$? There is a systematic process — and it starts with knowing which rational numbers are even worth trying.',
    realWorldContext: 'In signal processing and control systems engineering, transfer functions are ratios of polynomials. Finding the roots (poles and zeros) of those polynomials determines system stability. The Rational Zero Theorem and synthetic division are the manual tools for the same problem that numerical methods solve computationally — understanding them gives you the intuition behind root-finding algorithms.',
    previewVisualizationId: 'PolynomialDivisionViz',
  },

  intuition: {
    prose: [
      '**Appendix Tool Lesson — Not Part of the Main Derivative Story:** This lesson is a reference resource, not part of the ten-lesson arc of Chapter 2. You do not need it to understand derivatives. Come here when a calculus problem produces a polynomial that needs to be factored, and you need to find its roots systematically. The core story of Chapter 2 (Lessons 1–10) is complete before you reach this lesson.',

      'Dividing polynomials is identical to dividing integers — same algorithm, just with powers of $x$ instead of powers of 10. Long division of $x^3 + 2x^2 - 5x - 6$ by $(x-2)$ proceeds: how many times does $x$ go into $x^3$? Answer: $x^2$. Multiply, subtract, bring down. Repeat. The result is a quotient and a remainder.',
      'Synthetic division is long division compressed into a row of numbers — it only works when the divisor is linear of the form $(x - c)$. Write only the coefficients of the dividend, write $c$ to the left, and follow the bring-down-multiply-add pattern. It is faster than long division and less error-prone once you know the pattern.',
      'The Remainder Theorem connects division to evaluation: when you divide $f(x)$ by $(x-c)$, the remainder equals $f(c)$. This means synthetic division simultaneously divides the polynomial AND evaluates it at $c$. The Factor Theorem follows: $(x-c)$ is a factor of $f(x)$ if and only if $f(c) = 0$ — i.e., $c$ is a root.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Remainder Theorem and Factor Theorem',
        body: '\\text{Remainder Theorem: dividing } f(x) \\text{ by } (x-c) \\text{ gives remainder } f(c). \\\\ \\text{Factor Theorem: } (x-c) \\text{ is a factor of } f(x) \\iff f(c) = 0.',
      },
      {
        type: 'theorem',
        title: 'Rational Zero Theorem',
        body: '\\text{If } f(x) = a_n x^n + \\cdots + a_0 \\text{ has integer coefficients,} \\\\ \\text{then any rational root } \\frac{p}{q} \\text{ (in lowest terms) satisfies:} \\\\ p \\mid a_0 \\quad \\text{(divides the constant term)} \\\\ q \\mid a_n \\quad \\text{(divides the leading coefficient)}',
      },
      {
        type: 'theorem',
        title: "Descartes' Rule of Signs",
        body: '\\text{Number of positive real roots} \\leq \\text{sign changes in } f(x) \\\\ \\text{Number of negative real roots} \\leq \\text{sign changes in } f(-x) \\\\ \\text{Actual count} = \\text{max possible} - 2k \\text{ for some } k \\geq 0.',
      },
      {
        type: 'proof-map',
        title: 'Strategy for finding all roots of a higher-degree polynomial',
        body: '1.\\; \\text{List possible rational roots via Rational Zero Theorem} \\\\ 2.\\; \\text{Use Descartes\' Rule to narrow down positive/negative roots} \\\\ 3.\\; \\text{Test candidates with synthetic division (stops when remainder = 0)} \\\\ 4.\\; \\text{Factor out found roots, repeat on quotient} \\\\ 5.\\; \\text{Use quadratic formula on any remaining quadratic factor}',
      },
    ],
    visualizations: [
      {
        id: 'PolynomialDivisionViz',
        title: 'Synthetic Division — Step by Step',
        mathBridge: 'Enter a polynomial and a value $c$. Watch synthetic division run step by step, showing the quotient coefficients building and the remainder emerging.',
        caption: 'The remainder is $f(c)$ — if it\'s zero, $c$ is a root and $(x-c)$ is a factor.',
      },
    ],
  },

  math: {
    prose: [
      'The Linear Factorization Theorem guarantees that every degree-$n$ polynomial with complex coefficients factors completely into $n$ linear factors over $\\mathbb{C}$: $f(x) = a_n(x-c_1)(x-c_2)\\cdots(x-c_n)$. Over the reals, complex roots come in conjugate pairs, so the polynomial factors into a product of linear and irreducible quadratic factors.',
      'When a root $c$ appears $k$ times as a factor — $(x-c)^k$ divides $f(x)$ — then $c$ is a root of multiplicity $k$. At a simple root ($k=1$) the graph crosses the $x$-axis. At a double root ($k=2$) it touches and turns back. At a triple root ($k=3$) it crosses but with a flattened inflection.',
      "Descartes' Rule gives an upper bound, not an exact count. $f(x) = x^4 + 1$ has 0 sign changes, so 0 positive real roots. $f(-x) = x^4 + 1$ also has 0 sign changes, so 0 negative real roots. All four roots are complex. The rule told us exactly — but in general it only gives a ceiling.",
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear Factorization Theorem',
        body: 'f(x) = a_n(x-c_1)(x-c_2)\\cdots(x-c_n) \\quad \\text{over } \\mathbb{C} \\\\ \\text{Over } \\mathbb{R}\\text{: linear factors} + \\text{irreducible quadratic factors.} \\\\ \\text{Complex roots always come in conjugate pairs: if } a+bi \\text{ is a root, so is } a-bi.',
      },
      {
        type: 'insight',
        title: 'Root multiplicity from the graph',
        body: 'k=1 \\text{ (simple)}: \\text{graph crosses } x\\text{-axis} \\\\ k=2 \\text{ (double)}: \\text{graph touches, turns back} \\\\ k=3 \\text{ (triple)}: \\text{graph crosses with flat inflection} \\\\ \\text{Sum of all multiplicities} = \\text{degree of polynomial}',
      },
    ],
  },

  rigor: {
    title: 'Finding all roots of $f(x) = 2x^3 - 3x^2 - 8x + 12$',
    visualizationId: 'PolynomialDivisionViz',
    proofSteps: [
      {
        expression: '\\text{Possible rational roots: } \\pm\\frac{p}{q}, \\; p \\mid 12, \\; q \\mid 2',
        annotation: 'Rational Zero Theorem: $p \\in \\{1,2,3,4,6,12\\}$, $q \\in \\{1,2\\}$. Candidates: $\\pm 1, \\pm 2, \\pm 3, \\pm 4, \\pm 6, \\pm 12, \\pm\\frac{1}{2}, \\pm\\frac{3}{2}$.',
      },
      {
        expression: "\\text{Descartes': } f(x)=2x^3-3x^2-8x+12 \\text{ has 2 sign changes} \\Rightarrow \\text{0 or 2 positive roots}",
        annotation: 'Signs: $+,-,-,+$ → changes at positions 1-2 and 3-4. So 0 or 2 positive real roots.',
      },
      {
        expression: 'f(2) = 16 - 12 - 16 + 12 = 0 \\checkmark',
        annotation: 'Test $x=2$ by substitution. Remainder is zero — $x=2$ is a root.',
      },
      {
        expression: '\\text{Synthetic division by } (x-2): \\quad 2x^3-3x^2-8x+12 = (x-2)(2x^2+x-6)',
        annotation: 'Coefficients: $2 | -3 | -8 | 12$, $c=2$. Result: quotient $2x^2+x-6$.',
      },
      {
        expression: '2x^2+x-6 = (2x-3)(x+2) \\Rightarrow x = \\frac{3}{2}, \\; x = -2',
        annotation: 'Factor the remaining quadratic. Two more roots.',
      },
      {
        expression: 'f(x) = 2(x-2)\\left(x-\\tfrac{3}{2}\\right)(x+2) = (x-2)(2x-3)(x+2) \\qquad \\blacksquare',
        annotation: 'Three real roots: $x = -2, \\frac{3}{2}, 2$. Fully factored.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-008-ex1',
      title: 'Long division of polynomials',
      problem: '\\text{Divide } x^3 - 4x^2 + x + 6 \\text{ by } (x-2).',
      steps: [
        {
          expression: 'x^3 \\div x = x^2. \\quad x^2(x-2) = x^3-2x^2. \\quad \\text{Subtract: } -2x^2+x+6',
          annotation: 'First step: divide leading terms, multiply, subtract.',
        },
        {
          expression: '-2x^2 \\div x = -2x. \\quad -2x(x-2) = -2x^2+4x. \\quad \\text{Subtract: } -3x+6',
          annotation: 'Second step: bring down next term, repeat.',
        },
        {
          expression: '-3x \\div x = -3. \\quad -3(x-2) = -3x+6. \\quad \\text{Subtract: remainder } 0',
          annotation: 'Zero remainder — $(x-2)$ divides evenly.',
        },
        {
          expression: 'x^3-4x^2+x+6 = (x-2)(x^2-2x-3) = (x-2)(x-3)(x+1)',
          annotation: 'Factor the quotient. Three roots: $x = -1, 2, 3$.',
        },
      ],
      conclusion: 'Long division works for any divisor. When the remainder is zero, the divisor is a factor and the quotient continues the factoring.',
    },
    {
      id: 'ch2-008-ex2',
      title: 'Synthetic division',
      problem: '\\text{Use synthetic division to divide } 3x^4 - 2x^3 + 0x^2 - x + 5 \\text{ by } (x+1).',
      steps: [
        {
          expression: 'c = -1. \\quad \\text{Coefficients: } 3, -2, 0, -1, 5',
          annotation: 'For $(x+1)$, use $c = -1$. Include 0 for missing $x^2$ term — never skip a degree.',
        },
        {
          expression: '\\begin{array}{r|rrrrr} -1 & 3 & -2 & 0 & -1 & 5 \\\\ & & -3 & 5 & -5 & 6 \\\\ \\hline & 3 & -5 & 5 & -6 & 11 \\end{array}',
          annotation: 'Bring down 3. Multiply $3 \\times (-1)=-3$, add to $-2$ to get $-5$. Continue.',
        },
        {
          expression: '\\text{Quotient: } 3x^3-5x^2+5x-6, \\quad \\text{Remainder: } 11',
          annotation: 'Last number is the remainder. Since $11 \\neq 0$, $(x+1)$ is not a factor. Also: $f(-1) = 11$.',
        },
      ],
      conclusion: 'Synthetic division is faster than long division for linear divisors. The remainder equals $f(c)$ by the Remainder Theorem.',
    },
    {
      id: 'ch2-008-ex3',
      title: "Applying Descartes' Rule",
      problem: 'f(x) = x^5 - 3x^4 + 2x^3 + x - 1. \\text{ How many positive and negative real roots are possible?}',
      steps: [
        {
          expression: 'f(x) = x^5 - 3x^4 + 2x^3 + 0x^2 + x - 1',
          annotation: 'Signs: $+, -, +, +, +, -$ → sign changes at positions 1-2, 2-3, and 5-6. That is 3 changes.',
        },
        {
          expression: '\\text{Positive real roots: 3 or 1 (subtract 2 each time)}',
          annotation: "Descartes' Rule: 3 changes means 3 or 1 positive real roots.",
        },
        {
          expression: 'f(-x) = -x^5 - 3x^4 - 2x^3 + 0x^2 - x - 1',
          annotation: 'Replace $x$ with $-x$: odd powers flip sign.',
        },
        {
          expression: '\\text{Signs: } -, -, -, +, -, - \\Rightarrow \\text{2 sign changes} \\Rightarrow \\text{2 or 0 negative real roots}',
          annotation: 'Changes at positions 3-4 and 4-5. So 2 or 0 negative real roots.',
        },
      ],
      conclusion: "Descartes' Rule predicts (3 or 1) positive and (2 or 0) negative roots. Combined with degree 5, the remaining roots are complex conjugate pairs.",
    },
  ],

  challenges: [
    {
      id: 'ch2-008-ch1',
      difficulty: 'medium',
      problem: '\\text{Find all real zeros of } f(x) = x^4 - 2x^3 - 7x^2 + 8x + 12.',
      hint: 'List rational candidates. Test $x = -1$ first (often easiest). Use synthetic division twice to reduce to a quadratic.',
      walkthrough: [
        {
          expression: 'f(-1) = 1+2-7-8+12 = 0 \\checkmark \\quad \\text{so } (x+1) \\text{ is a factor}',
          annotation: 'Test $x=-1$ quickly by substitution.',
        },
        {
          expression: '\\text{Synthetic division by } (x+1) \\Rightarrow x^3-3x^2-4x+12',
          annotation: 'Reduced to cubic.',
        },
        {
          expression: 'f(3) = 27-27-12+12 = 0 \\checkmark \\Rightarrow (x-3) \\text{ factor}',
          annotation: 'Test $x=3$ on the cubic.',
        },
        {
          expression: '\\text{Synthetic division by } (x-3) \\Rightarrow x^2-4 = (x-2)(x+2)',
          annotation: 'Remaining quadratic factors easily.',
        },
        {
          expression: 'f(x) = (x+1)(x-3)(x-2)(x+2). \\text{ Roots: } x = -2,-1,2,3.',
          annotation: 'Four real roots. Check: sum of roots $= -2-1+2+3=2 = -(-2)/1 = 2$ ✓ (Vieta\'s).',
        },
      ],
      answer: 'x = -2, -1, 2, 3',
    },
    {
      id: 'ch2-008-ch2',
      difficulty: 'hard',
      problem: '\\text{Find a degree-4 polynomial with integer coefficients that has roots } x=2, x=-3, \\text{ and } x=1+2i.',
      hint: 'Complex roots come in conjugate pairs. What is the fourth root?',
      walkthrough: [
        {
          expression: '\\text{Since } 1+2i \\text{ is a root, so is } 1-2i.',
          annotation: 'Conjugate pairs — coefficients are real.',
        },
        {
          expression: '(x-(1+2i))(x-(1-2i)) = (x-1)^2 - (2i)^2 = x^2-2x+1+4 = x^2-2x+5',
          annotation: 'Multiply conjugate pair — always gives an irreducible quadratic.',
        },
        {
          expression: 'f(x) = (x-2)(x+3)(x^2-2x+5)',
          annotation: 'All four factors.',
        },
        {
          expression: '= (x^2+x-6)(x^2-2x+5) = x^4-x^3-x^2+17x-30',
          annotation: 'Expand. Integer coefficients confirmed.',
        },
      ],
      answer: 'f(x) = x^4 - x^3 - x^2 + 17x - 30',
    },
  ],

  calcBridge: {
    teaser: 'Finding roots of polynomials reappears in calculus when solving $f\'(x) = 0$ to find critical points, and when factoring denominators for partial fraction decomposition before integration. The rational zeros theorem and synthetic division are the manual tools for the same problem that numerical methods (Newton\'s method) solve computationally.',
    linkedLessons: ['factoring-every-method', 'rational-expressions-partial-fractions'],
  },
}
