export default {
  id: 'ch0-partial-fractions-intro',
  slug: 'partial-fractions-intro',
  chapter: 0,
  order: 1.5,
  title: 'Partial Fraction Decomposition',
  subtitle: 'Breaking complex fractions into simple pieces',
  tags: ['partial fractions', 'decomposition', 'linear factors', 'repeated factors', 'irreducible quadratic', 'integration', 'rational expressions', 'algebra', 'Heaviside', 'cover-up method', 'long division', 'proper fraction', 'improper fraction'],

  hook: {
    question: 'Why is $\\frac{1}{x(x+1)}$ hard to integrate, but $\\frac{1}{x} - \\frac{1}{x+1}$ is trivial?',
    realWorldContext:
      'Partial fractions turn one complicated fraction into a sum of simpler ones — like exchanging a $20 bill for smaller bills that are easier to spend. ' +
      'In electrical engineering, Laplace transforms use partial fractions to analyze circuit behavior. ' +
      'In control theory, transfer functions are decomposed into partial fractions to determine system stability. ' +
      'In calculus, partial fractions are the key technique for integrating rational functions — without them, many integrals are practically impossible.',
    previewVisualizationId: null,
  },

  intuition: {
    prose: [
      'You already know how to add fractions: $\\frac{1}{x} - \\frac{1}{x+1} = \\frac{(x+1) - x}{x(x+1)} = \\frac{1}{x(x+1)}$. Partial fraction decomposition is the **reverse** of this process. Given the single fraction $\\frac{1}{x(x+1)}$, we want to find that it equals $\\frac{1}{x} - \\frac{1}{x+1}$.',

      'Why bother? Because the simple pieces are easy to work with. In calculus, $\\int \\frac{1}{x(x+1)}\\,dx$ looks hard, but $\\int \\frac{1}{x}\\,dx - \\int \\frac{1}{x+1}\\,dx = \\ln|x| - \\ln|x+1| + C$ is straightforward. Partial fractions decompose the hard problem into easy pieces.',

      'The method depends on the type of factors in the denominator. **Distinct linear factors** like $(x-1)(x+2)(x-3)$ are the simplest case: write $\\frac{A}{x-1} + \\frac{B}{x+2} + \\frac{C}{x-3}$, one constant per factor.',

      '**Repeated linear factors** like $(x-1)^3$ require a term for each power: $\\frac{A}{x-1} + \\frac{B}{(x-1)^2} + \\frac{C}{(x-1)^3}$. Think of it like this: omitting lower powers would leave gaps that cannot be filled.',

      '**Irreducible quadratic factors** (quadratics with no real roots, like $x^2 + 1$) get a linear numerator: $\\frac{Ax + B}{x^2 + 1}$. A constant numerator is not enough because the quadratic factor is degree 2. If the quadratic is repeated, like $(x^2 + 1)^2$, you need: $\\frac{Ax + B}{x^2 + 1} + \\frac{Cx + D}{(x^2 + 1)^2}$.',

      'Before decomposing, always check: is the fraction **proper** (degree of numerator < degree of denominator)? If not, perform polynomial long division first to get a polynomial plus a proper fraction. Then decompose the proper fraction.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'Reverse of Adding Fractions',
        body: 'Adding fractions combines simple pieces into one complex fraction. Partial fractions reverse this: break one complex fraction back into its simple parts.',
      },
      {
        type: 'technique',
        title: 'The Cover-Up (Heaviside) Method',
        body: 'For distinct linear factors: to find the constant over (x − a), "cover up" (x − a) in the original fraction and plug in x = a. For example, for 1/(x(x+1)): cover x, plug in x = 0 → 1/(0+1) = 1, so A = 1. Cover (x+1), plug in x = −1 → 1/(−1) = −1, so B = −1.',
      },
      {
        type: 'misconception',
        title: 'Quadratics Need Linear Numerators',
        body: 'For an irreducible quadratic factor like (x² + 4), the numerator must be (Ax + B), not just A. A single constant is insufficient because the quadratic has degree 2. If you use only A, you cannot match all possible numerators.',
      },
      {
        type: 'tip',
        title: 'Always Check: Proper or Improper?',
        body: 'If the degree of the numerator ≥ degree of the denominator, you MUST do polynomial long division first. Example: (x³ + 1)/(x² − 1) → long divide to get x + (x + 1)/(x² − 1), then decompose the remainder.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      'The **Partial Fraction Decomposition Theorem** states: every proper rational function $\\frac{p(x)}{q(x)}$ (with $\\deg p < \\deg q$ and $q$ factored completely over the reals) can be written uniquely as a sum of partial fractions.',

      'For **distinct linear factors**: if $q(x) = (x - a_1)(x - a_2) \\cdots (x - a_n)$ with all $a_i$ distinct, then $\\displaystyle \\frac{p(x)}{q(x)} = \\frac{A_1}{x - a_1} + \\frac{A_2}{x - a_2} + \\cdots + \\frac{A_n}{x - a_n}$.',

      'For a **repeated linear factor** $(x - a)^m$: include terms $\\displaystyle \\frac{A_1}{x-a} + \\frac{A_2}{(x-a)^2} + \\cdots + \\frac{A_m}{(x-a)^m}$. Each power of $(x-a)$ up to $m$ gets its own term.',

      'For an **irreducible quadratic factor** $(x^2 + bx + c)$ (where $b^2 - 4c < 0$): include a term $\\displaystyle \\frac{Ax + B}{x^2 + bx + c}$. For a repeated irreducible quadratic $(x^2 + bx + c)^m$: include terms for each power with linear numerators.',

      'To find the constants, two main methods: (1) **Multiply both sides** by $q(x)$ and compare coefficients of like powers of $x$ (equating coefficients). (2) **Substitute strategic values** of $x$ — typically the roots of $q(x)$ — to eliminate terms (this includes the cover-up method).',

      'The total number of unknown constants always equals $\\deg(q)$. This is not a coincidence — it ensures the system of equations has a unique solution.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Partial Fraction Decomposition',
        body: '\\text{Every proper rational function } \\frac{p(x)}{q(x)} \\text{ with } \\deg p < \\deg q \\\\ \\text{can be uniquely decomposed into a sum of fractions of the form} \\\\ \\frac{A}{(x-a)^k} \\quad \\text{and} \\quad \\frac{Ax+B}{(x^2+bx+c)^k}',
      },
      {
        type: 'definition',
        title: 'Proper vs. Improper Rational Function',
        body: '\\text{Proper: } \\deg(p) < \\deg(q). \\quad \\text{Ready for decomposition.} \\\\ \\text{Improper: } \\deg(p) \\geq \\deg(q). \\quad \\text{Long divide first.}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The existence and uniqueness of partial fraction decomposition follows from the theory of polynomial rings. Over $\\mathbb{R}$, every polynomial factors into linear and irreducible quadratic factors (by the Fundamental Theorem of Algebra, applied to the complex roots appearing in conjugate pairs).',

      'The key algebraic fact is: if $q(x) = q_1(x) \\cdot q_2(x)$ where $\\gcd(q_1, q_2) = 1$ (coprime), then $\\frac{p}{q}$ can be written as $\\frac{p_1}{q_1} + \\frac{p_2}{q_2}$. This follows from Bezout\'s identity for polynomials: since $\\gcd(q_1, q_2) = 1$, there exist polynomials $s, t$ with $s \\cdot q_1 + t \\cdot q_2 = 1$. Multiplying by $p/q$: $\\frac{p}{q} = \\frac{p \\cdot t}{q_1} + \\frac{p \\cdot s}{q_2}$. Reducing modulo each factor gives the proper partial fractions.',

      'For repeated factors, the decomposition with ascending powers is necessary because the space of polynomials of degree less than $m$ has dimension $m$, matching the $m$ unknown constants in the terms $A_1/(x-a) + \\cdots + A_m/(x-a)^m$.',

      'The count of unknowns always equals $\\deg(q)$: each linear factor $(x-a)^k$ contributes $k$ unknowns, and each quadratic factor $(x^2+bx+c)^k$ contributes $2k$ unknowns. Summing over all factors gives $\\deg(q)$ unknowns, matching the $\\deg(q)$ equations obtained from equating coefficients.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Uniqueness of Decomposition',
        body: '\\text{The partial fraction decomposition of } \\frac{p(x)}{q(x)} \\text{ is unique,} \\\\ \\text{provided } \\deg(p) < \\deg(q) \\text{ and } q \\text{ is fully factored.}',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-distinct-linear',
      title: 'Distinct Linear Factors',
      problem: 'Decompose $\\displaystyle\\frac{5x + 1}{(x - 1)(x + 2)}$.',
      steps: [
        { expression: '\\frac{5x + 1}{(x-1)(x+2)} = \\frac{A}{x-1} + \\frac{B}{x+2}', annotation: 'Set up the decomposition with one constant per factor.' },
        { expression: '5x + 1 = A(x + 2) + B(x - 1)', annotation: 'Multiply both sides by (x−1)(x+2).' },
        { expression: 'x = 1: \\quad 5(1)+1 = A(3) + 0 \\implies 6 = 3A \\implies A = 2', annotation: 'Substitute x = 1 to eliminate B (cover-up method).' },
        { expression: 'x = -2: \\quad 5(-2)+1 = 0 + B(-3) \\implies -9 = -3B \\implies B = 3', annotation: 'Substitute x = −2 to eliminate A.' },
        { expression: '\\frac{5x+1}{(x-1)(x+2)} = \\frac{2}{x-1} + \\frac{3}{x+2}', annotation: 'The decomposition.' },
      ],
      conclusion: 'Check: $\\frac{2}{x-1} + \\frac{3}{x+2} = \\frac{2(x+2) + 3(x-1)}{(x-1)(x+2)} = \\frac{5x+1}{(x-1)(x+2)}$. Verified.',
    },
    {
      id: 'ex-repeated-linear',
      title: 'Repeated Linear Factor',
      problem: 'Decompose $\\displaystyle\\frac{3x + 5}{(x + 1)^2}$.',
      steps: [
        { expression: '\\frac{3x+5}{(x+1)^2} = \\frac{A}{x+1} + \\frac{B}{(x+1)^2}', annotation: 'Repeated factor: need terms for each power.' },
        { expression: '3x + 5 = A(x + 1) + B', annotation: 'Multiply by (x+1)².' },
        { expression: 'x = -1: \\quad 3(-1)+5 = 0 + B \\implies B = 2', annotation: 'Substitute x = −1.' },
        { expression: '\\text{Compare } x \\text{ coefficients: } 3 = A', annotation: 'The coefficient of x on the left is 3, on the right is A.' },
        { expression: '\\frac{3x+5}{(x+1)^2} = \\frac{3}{x+1} + \\frac{2}{(x+1)^2}', annotation: 'The decomposition.' },
      ],
      conclusion: 'For repeated linear factors, substituting the root finds the constant on the highest power, then equating coefficients finds the rest.',
    },
    {
      id: 'ex-irreducible-quadratic',
      title: 'Irreducible Quadratic Factor',
      problem: 'Decompose $\\displaystyle\\frac{2x^2 + 3x + 5}{(x - 1)(x^2 + 4)}$.',
      steps: [
        { expression: '\\frac{2x^2+3x+5}{(x-1)(x^2+4)} = \\frac{A}{x-1} + \\frac{Bx+C}{x^2+4}', annotation: 'Linear factor gets constant numerator; irreducible quadratic gets linear numerator.' },
        { expression: '2x^2+3x+5 = A(x^2+4) + (Bx+C)(x-1)', annotation: 'Multiply by the full denominator.' },
        { expression: 'x = 1: \\quad 2+3+5 = A(5) \\implies 10 = 5A \\implies A = 2', annotation: 'Substitute x = 1 to find A.' },
        { expression: 'x = 0: \\quad 5 = 2(4) + C(-1) \\implies 5 = 8 - C \\implies C = 3', annotation: 'Substitute x = 0 (a convenient value).' },
        { expression: '\\text{Compare } x^2: \\quad 2 = A + B = 2 + B \\implies B = 0', annotation: 'Equate x² coefficients.' },
        { expression: '\\frac{2x^2+3x+5}{(x-1)(x^2+4)} = \\frac{2}{x-1} + \\frac{3}{x^2+4}', annotation: 'The decomposition (B = 0, so the Bx term vanishes).' },
      ],
      conclusion: 'The second fraction $\\frac{3}{x^2+4}$ integrates to $\\frac{3}{2}\\arctan\\frac{x}{2} + C$. This is why partial fractions are essential for integration.',
    },
    {
      id: 'ex-improper',
      title: 'Improper Fraction (Long Division First)',
      problem: 'Decompose $\\displaystyle\\frac{x^3 + 2}{x^2 - 1}$.',
      steps: [
        { expression: '\\deg(x^3+2) = 3 > 2 = \\deg(x^2-1)', annotation: 'This is improper. Must divide first.' },
        { expression: 'x^3 + 2 = (x^2-1)(x) + (x + 2)', annotation: 'Long division: x³ ÷ x² = x, then x(x²−1) = x³−x, remainder (x+2).' },
        { expression: '\\frac{x^3+2}{x^2-1} = x + \\frac{x+2}{x^2-1}', annotation: 'Polynomial part plus proper fraction.' },
        { expression: '\\frac{x+2}{(x-1)(x+1)} = \\frac{A}{x-1} + \\frac{B}{x+1}', annotation: 'Now decompose the proper part.' },
        { expression: 'x=1: A = \\frac{3}{2}. \\quad x=-1: B = \\frac{-1}{-2} = \\frac{1}{2}.', annotation: 'Cover-up method.' },
        { expression: '\\frac{x^3+2}{x^2-1} = x + \\frac{3/2}{x-1} + \\frac{1/2}{x+1}', annotation: 'Complete decomposition.' },
      ],
      conclusion: 'Always check properness first. The polynomial part $x$ integrates trivially; the partial fractions give logarithms.',
    },
  ],

  challenges: [
    {
      id: 'ch0-pf-c1',
      difficulty: 'easy',
      problem: 'Decompose $\\displaystyle\\frac{7}{x(x - 7)}$.',
      hint: 'Use the cover-up method: cover x, plug in x = 0. Cover (x−7), plug in x = 7.',
      walkthrough: [
        { expression: '\\frac{7}{x(x-7)} = \\frac{A}{x} + \\frac{B}{x-7}', annotation: 'Set up.' },
        { expression: 'x = 0: A = \\frac{7}{0-7} = -1', annotation: 'Cover-up.' },
        { expression: 'x = 7: B = \\frac{7}{7} = 1', annotation: 'Cover-up.' },
      ],
      answer: '$\\frac{-1}{x} + \\frac{1}{x-7}$',
    },
    {
      id: 'ch0-pf-c2',
      difficulty: 'medium',
      problem: 'Decompose $\\displaystyle\\frac{x^2 + 1}{x(x-1)^2}$.',
      hint: 'Three unknowns: A/x + B/(x−1) + C/(x−1)². Use substitution for two and coefficient comparison for the third.',
      walkthrough: [
        { expression: 'x^2+1 = A(x-1)^2 + Bx(x-1) + Cx', annotation: 'Multiply by the denominator.' },
        { expression: 'x=0: 1 = A(1) \\implies A = 1', annotation: 'Substitute x = 0.' },
        { expression: 'x=1: 2 = C(1) \\implies C = 2', annotation: 'Substitute x = 1.' },
        { expression: 'x^2 \\text{ coefficient: } 1 = A + B \\implies B = 0', annotation: 'Compare x² coefficients.' },
      ],
      answer: '$\\frac{1}{x} + \\frac{2}{(x-1)^2}$',
    },
    {
      id: 'ch0-pf-c3',
      difficulty: 'hard',
      problem: 'Decompose $\\displaystyle\\frac{x^3 + x + 1}{x^2(x^2 + 1)}$.',
      hint: 'Four unknowns: A/x + B/x² + (Cx+D)/(x²+1). Multiply out and equate coefficients.',
      walkthrough: [
        { expression: 'x^3+x+1 = Ax(x^2+1) + B(x^2+1) + (Cx+D)x^2', annotation: 'Multiply by x²(x²+1).' },
        { expression: 'x = 0: 1 = B(1) \\implies B = 1', annotation: 'Substitute x = 0.' },
        { expression: 'x^3: 1 = A + C', annotation: 'Equate x³ coefficients.' },
        { expression: 'x^2: 0 = B + D = 1 + D \\implies D = -1', annotation: 'Equate x² coefficients.' },
        { expression: 'x^1: 1 = A \\implies A = 1, \\; C = 0', annotation: 'Equate x¹ coefficients.' },
      ],
      answer: '$\\frac{1}{x} + \\frac{1}{x^2} + \\frac{-1}{x^2+1}$',
    },
  ],

  crossRefs: [
    { lessonSlug: 'polynomial-division', label: 'Polynomial Division', context: 'Long division is needed before decomposition when the fraction is improper.' },
    { lessonSlug: 'algebraic-techniques', label: 'Algebraic Techniques', context: 'Factoring the denominator is the critical first step.' },
    { lessonSlug: 'area-accumulation', label: 'Integration', context: 'Partial fractions are the primary technique for integrating rational functions.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
