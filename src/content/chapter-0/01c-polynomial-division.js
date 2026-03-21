export default {
  id: 'ch0-polynomial-division',
  slug: 'polynomial-division',
  chapter: 0,
  order: 1.3,
  title: 'Polynomial Division',
  subtitle: 'Long division, synthetic division, and the theorems that connect them',
  tags: ['polynomial division', 'long division', 'synthetic division', 'remainder theorem', 'factor theorem', 'rational root theorem', 'polynomials', 'factoring', 'roots', 'zeros', 'partial fractions', 'algebra', 'division algorithm'],

  hook: {
    question: 'You know that 17 ÷ 5 = 3 remainder 2 — but what does it mean to divide x³ + 2x − 7 by x − 3?',
    realWorldContext:
      'Polynomial division is the engine behind partial fraction decomposition, which you will use extensively in integration. ' +
      'It also powers the Rational Root Theorem used by engineers to find exact solutions of polynomial equations. ' +
      'Computer algebra systems use synthetic division internally to evaluate polynomials efficiently (Horner\'s method), ' +
      'which is critical in signal processing, control theory, and computer graphics.',
    previewVisualizationId: null,
  },

  intuition: {
    prose: [
      'You already know how to do long division with numbers. Dividing 157 by 12: 12 goes into 15 once (remainder 3), bring down the 7, 12 goes into 37 three times (remainder 1). So 157 = 12 × 13 + 1. The same idea works for polynomials — just replace digits with terms.',

      '**Polynomial long division** divides a polynomial $p(x)$ by a divisor $d(x)$ to produce a quotient $q(x)$ and remainder $r(x)$: $p(x) = d(x) \\cdot q(x) + r(x)$, where the degree of $r$ is less than the degree of $d$. This is the **Division Algorithm** for polynomials.',

      'The process: look at the leading term of the dividend, divide by the leading term of the divisor, write that as the next term of the quotient, multiply back, subtract, and repeat. It is exactly long division, just with variables instead of digits.',

      '**Synthetic division** is a shortcut that works when the divisor is linear: $x - c$. Instead of writing out all the variables and powers, you only track the coefficients. It is faster, less error-prone, and reveals a beautiful connection: the remainder of dividing $p(x)$ by $x - c$ is exactly $p(c)$.',

      'That connection is the **Remainder Theorem**: when you divide $p(x)$ by $(x - c)$, the remainder is $p(c)$. Think about it — if $p(x) = (x-c) \\cdot q(x) + r$, then plugging in $x = c$ gives $p(c) = 0 \\cdot q(c) + r = r$. The remainder is just the polynomial evaluated at $c$.',

      'The **Factor Theorem** is the Remainder Theorem\'s immediate corollary: $(x - c)$ is a factor of $p(x)$ if and only if $p(c) = 0$. In other words, $c$ is a root of $p(x)$ precisely when $(x-c)$ divides $p(x)$ evenly (zero remainder).',

      'The **Rational Root Theorem** helps you find candidates for rational roots. If $p(x) = a_n x^n + \\cdots + a_0$ has a rational root $\\frac{p}{q}$ in lowest terms, then $p$ divides $a_0$ (the constant term) and $q$ divides $a_n$ (the leading coefficient). This gives you a finite list of candidates to test using synthetic division.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'Division is Repeated Subtraction',
        body: 'Just as 17 ÷ 5 asks "how many 5s fit into 17?", polynomial division asks "how many copies of d(x) fit into p(x)?" The quotient is the answer; the remainder is what is left over.',
      },
      {
        type: 'tip',
        title: 'Do Not Skip Powers',
        body: 'When setting up long or synthetic division, include placeholders for missing powers. If dividing x³ + 1 by x − 1, write x³ + 0x² + 0x + 1 to keep columns aligned.',
      },
      {
        type: 'misconception',
        title: 'Synthetic Division Only Works for Linear Divisors',
        body: 'Synthetic division works only when dividing by (x − c). For divisors of degree 2 or higher, you must use long division. Also, the divisor must be monic (leading coefficient 1) for standard synthetic division.',
      },
      {
        type: 'technique',
        title: 'Finding Rational Roots Efficiently',
        body: 'List all candidates ±p/q from the Rational Root Theorem. Test them using synthetic division (not by plugging in — synthetic division simultaneously tests and performs the division). Once you find one root, the quotient is a lower-degree polynomial to continue factoring.',
      },
    ],
    visualizations: [],
  },

  math: {
    prose: [
      'The **Division Algorithm** for polynomials: given polynomials $p(x)$ (dividend) and $d(x)$ (divisor, $d \\neq 0$), there exist unique polynomials $q(x)$ (quotient) and $r(x)$ (remainder) such that $p(x) = d(x) \\cdot q(x) + r(x)$ with $\\deg(r) < \\deg(d)$ (or $r = 0$).',

      'For **polynomial long division**, the algorithm is: (1) Divide the leading term of the current dividend by the leading term of $d(x)$. (2) Multiply $d(x)$ by this term. (3) Subtract from the current dividend. (4) Repeat with the new (lower-degree) dividend until the degree drops below $\\deg(d)$.',

      'For **synthetic division** by $(x - c)$, write the coefficients of $p(x)$ in a row. Bring down the first coefficient. Multiply by $c$, add to the next coefficient, repeat. The last number is the remainder; the others are the coefficients of the quotient. This process is equivalent to Horner\'s method for evaluating $p(c)$.',

      '**Remainder Theorem**: If $p(x)$ is divided by $(x - c)$, the remainder is $p(c)$. Proof: write $p(x) = (x-c) q(x) + r$ where $r$ is a constant (degree less than 1). Substitute $x = c$: $p(c) = 0 \\cdot q(c) + r = r$.',

      '**Factor Theorem**: $(x - c)$ is a factor of $p(x)$ if and only if $p(c) = 0$. This follows immediately from the Remainder Theorem: the remainder is zero precisely when $p(c) = 0$.',

      '**Rational Root Theorem**: If the polynomial $p(x) = a_n x^n + a_{n-1}x^{n-1} + \\cdots + a_1 x + a_0$ with integer coefficients has a rational root $\\frac{p}{q}$ in lowest terms, then $p \\mid a_0$ and $q \\mid a_n$. The notation $p \\mid a_0$ means "$p$ divides $a_0$."',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Remainder Theorem',
        body: '\\text{If } p(x) \\text{ is a polynomial and } c \\in \\mathbb{R}, \\text{ then} \\\\ p(x) = (x - c)\\,q(x) + p(c) \\\\ \\text{for some polynomial } q(x).',
      },
      {
        type: 'theorem',
        title: 'Factor Theorem',
        body: '(x - c) \\text{ is a factor of } p(x) \\iff p(c) = 0.',
      },
      {
        type: 'theorem',
        title: 'Rational Root Theorem',
        body: '\\text{If } \\frac{p}{q} \\text{ (lowest terms) is a root of } a_n x^n + \\cdots + a_0 = 0, \\\\ \\text{then } p \\mid a_0 \\text{ and } q \\mid a_n.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The Division Algorithm for polynomials can be proved by strong induction on $\\deg(p)$. Base case: if $\\deg(p) < \\deg(d)$, set $q = 0$ and $r = p$. Inductive step: let $p(x)$ have leading term $a_n x^n$ and $d(x)$ have leading term $b_m x^m$ with $n \\geq m$. Set $t(x) = \\frac{a_n}{b_m} x^{n-m}$. Then $p(x) - t(x) \\cdot d(x)$ has degree less than $n$, so by the inductive hypothesis, $p(x) - t(x) \\cdot d(x) = d(x) \\cdot q_1(x) + r(x)$. Therefore $p(x) = d(x)(t(x) + q_1(x)) + r(x)$.',

      'Uniqueness: suppose $p = d \\cdot q_1 + r_1 = d \\cdot q_2 + r_2$ with $\\deg(r_1), \\deg(r_2) < \\deg(d)$. Then $d(q_1 - q_2) = r_2 - r_1$. The left side has degree $\\geq \\deg(d)$ (if $q_1 \\neq q_2$), but the right side has degree $< \\deg(d)$. Contradiction unless $q_1 = q_2$ and $r_1 = r_2$.',

      'The Rational Root Theorem proof: suppose $p(a/b) = 0$ where $\\gcd(a, b) = 1$. Then $a_n(a/b)^n + \\cdots + a_0 = 0$. Multiply through by $b^n$: $a_n a^n + a_{n-1} a^{n-1} b + \\cdots + a_0 b^n = 0$. Rearranging: $a_n a^n = -b(a_{n-1}a^{n-1} + \\cdots + a_0 b^{n-1})$. Since $b$ divides the right side, $b \\mid a_n a^n$. Since $\\gcd(a, b) = 1$, we get $b \\mid a_n$. Similarly, rearranging the other way gives $a \\mid a_0$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Division Algorithm (Formal)',
        body: '\\text{For polynomials } p(x), d(x) \\text{ with } d \\neq 0, \\text{ there exist unique} \\\\ q(x), r(x) \\text{ such that } p = dq + r \\text{ and } \\deg(r) < \\deg(d).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-long-division',
      title: 'Polynomial Long Division',
      problem: 'Divide $2x^3 + 3x^2 - x + 5$ by $x + 2$.',
      steps: [
        { expression: '\\frac{2x^3}{x} = 2x^2', annotation: 'Divide leading terms to get the first quotient term.' },
        { expression: '2x^2(x + 2) = 2x^3 + 4x^2', annotation: 'Multiply divisor by 2x².' },
        { expression: '(2x^3 + 3x^2) - (2x^3 + 4x^2) = -x^2', annotation: 'Subtract. Bring down the −x.' },
        { expression: '\\frac{-x^2}{x} = -x', annotation: 'Next quotient term.' },
        { expression: '-x(x + 2) = -x^2 - 2x', annotation: 'Multiply.' },
        { expression: '(-x^2 - x) - (-x^2 - 2x) = x', annotation: 'Subtract. Bring down the +5.' },
        { expression: '\\frac{x}{x} = 1, \\quad 1(x+2) = x + 2', annotation: 'Last quotient term.' },
        { expression: '(x + 5) - (x + 2) = 3', annotation: 'Remainder is 3.' },
        { expression: '2x^3 + 3x^2 - x + 5 = (x+2)(2x^2 - x + 1) + 3', annotation: 'Final result: quotient 2x² − x + 1, remainder 3.' },
      ],
      conclusion: 'Check: $(x+2)(2x^2 - x + 1) + 3 = 2x^3 - x^2 + x + 4x^2 - 2x + 2 + 3 = 2x^3 + 3x^2 - x + 5$. Verified.',
    },
    {
      id: 'ex-synthetic-division',
      title: 'Synthetic Division',
      problem: 'Use synthetic division to divide $x^3 - 6x^2 + 11x - 6$ by $x - 2$.',
      steps: [
        { expression: '\\text{Coefficients: } 1, -6, 11, -6. \\quad c = 2.', annotation: 'Set up: list coefficients and the value c from (x − c).' },
        { expression: '\\text{Bring down 1.}', annotation: 'The first coefficient drops straight down.' },
        { expression: '1 \\times 2 = 2. \\quad -6 + 2 = -4.', annotation: 'Multiply by c, add to next coefficient.' },
        { expression: '-4 \\times 2 = -8. \\quad 11 + (-8) = 3.', annotation: 'Repeat.' },
        { expression: '3 \\times 2 = 6. \\quad -6 + 6 = 0.', annotation: 'Remainder is 0.' },
        { expression: 'x^3 - 6x^2 + 11x - 6 = (x-2)(x^2 - 4x + 3)', annotation: 'Quotient coefficients: 1, −4, 3. Zero remainder means (x−2) is a factor.' },
        { expression: '= (x-2)(x-1)(x-3)', annotation: 'Factor the quotient further.' },
      ],
      conclusion: 'Since the remainder is 0, the Factor Theorem confirms that x = 2 is a root. By the Remainder Theorem, p(2) = 0.',
    },
    {
      id: 'ex-rational-root',
      title: 'Finding All Rational Roots',
      problem: 'Find all rational roots of $2x^3 + 3x^2 - 8x + 3 = 0$.',
      steps: [
        { expression: 'a_0 = 3, \\quad a_n = 2', annotation: 'Identify constant term and leading coefficient.' },
        { expression: '\\text{Divisors of 3: } \\pm 1, \\pm 3', annotation: 'Possible values of p.' },
        { expression: '\\text{Divisors of 2: } \\pm 1, \\pm 2', annotation: 'Possible values of q.' },
        { expression: '\\text{Candidates } \\frac{p}{q}: \\pm 1, \\pm 3, \\pm \\frac{1}{2}, \\pm \\frac{3}{2}', annotation: 'All possible rational roots.' },
        { expression: 'p(1) = 2 + 3 - 8 + 3 = 0\\;\\checkmark', annotation: 'Test x = 1: it is a root.' },
        { expression: '\\text{Synthetic division by } (x-1): \\; 2x^3+3x^2-8x+3 = (x-1)(2x^2+5x-3)', annotation: 'Divide out the factor.' },
        { expression: '2x^2 + 5x - 3 = (2x-1)(x+3)', annotation: 'Factor the quotient.' },
        { expression: '\\text{Roots: } x = 1, \\; x = \\frac{1}{2}, \\; x = -3', annotation: 'All three rational roots found.' },
      ],
      conclusion: 'The Rational Root Theorem reduced an infinite search to 8 candidates. Testing and synthetic division found all three roots.',
    },
    {
      id: 'ex-remainder-theorem',
      title: 'Using the Remainder Theorem to Evaluate',
      problem: 'Find the remainder when $p(x) = x^4 - 3x^3 + 2x - 5$ is divided by $(x + 1)$.',
      steps: [
        { expression: '\\text{By the Remainder Theorem, remainder} = p(-1)', annotation: 'Dividing by (x − (−1)), so c = −1.' },
        { expression: 'p(-1) = (-1)^4 - 3(-1)^3 + 2(-1) - 5', annotation: 'Substitute x = −1.' },
        { expression: '= 1 - 3(-1) + (-2) - 5', annotation: 'Compute each power.' },
        { expression: '= 1 + 3 - 2 - 5 = -3', annotation: 'Simplify.' },
      ],
      conclusion: 'The remainder is $-3$. No actual division was needed — the Remainder Theorem lets you evaluate instead.',
    },
  ],

  challenges: [
    {
      id: 'ch0-polydiv-c1',
      difficulty: 'easy',
      problem: 'Use synthetic division to find the quotient and remainder when $x^3 + 5x^2 - 2x + 1$ is divided by $(x - 1)$.',
      hint: 'Set up with coefficients 1, 5, −2, 1 and c = 1. Bring down, multiply, add, repeat.',
      walkthrough: [
        { expression: '\\text{Coefficients: } 1, 5, -2, 1. \\quad c = 1.', annotation: 'Setup.' },
        { expression: '1 \\to 1 \\times 1 = 1 \\to 5+1=6 \\to 6\\times 1=6 \\to -2+6=4 \\to 4\\times 1=4 \\to 1+4=5', annotation: 'Process each coefficient.' },
        { expression: 'q(x) = x^2 + 6x + 4, \\quad r = 5', annotation: 'Read off quotient and remainder.' },
      ],
      answer: 'Quotient: $x^2 + 6x + 4$, Remainder: 5. So $x^3 + 5x^2 - 2x + 1 = (x-1)(x^2+6x+4) + 5$.',
    },
    {
      id: 'ch0-polydiv-c2',
      difficulty: 'medium',
      problem: 'Factor $x^3 - 7x + 6$ completely over the rationals.',
      hint: 'Use the Rational Root Theorem to find candidates (±1, ±2, ±3, ±6), then test them. Once you find one root, divide it out.',
      walkthrough: [
        { expression: 'p(1) = 1 - 7 + 6 = 0\\;\\checkmark', annotation: 'x = 1 is a root.' },
        { expression: 'x^3 - 7x + 6 = (x - 1)(x^2 + x - 6)', annotation: 'Synthetic division by (x − 1).' },
        { expression: 'x^2 + x - 6 = (x + 3)(x - 2)', annotation: 'Factor the quadratic.' },
        { expression: 'x^3 - 7x + 6 = (x - 1)(x + 3)(x - 2)', annotation: 'Complete factorization.' },
      ],
      answer: '$(x-1)(x-2)(x+3)$',
    },
    {
      id: 'ch0-polydiv-c3',
      difficulty: 'hard',
      problem: 'Divide $x^4 + x^3 - 3x^2 + x + 2$ by $x^2 + 2x - 1$ using long division.',
      hint: 'This requires polynomial long division since the divisor is degree 2. The quotient will be degree 2.',
      walkthrough: [
        { expression: '\\frac{x^4}{x^2} = x^2. \\quad x^2(x^2+2x-1) = x^4+2x^3-x^2.', annotation: 'First quotient term.' },
        { expression: '(x^4+x^3-3x^2) - (x^4+2x^3-x^2) = -x^3-2x^2', annotation: 'Subtract and bring down.' },
        { expression: '\\frac{-x^3}{x^2} = -x. \\quad -x(x^2+2x-1) = -x^3-2x^2+x.', annotation: 'Second quotient term.' },
        { expression: '(-x^3-2x^2+x) - (-x^3-2x^2+x) = 0+0+0+2', annotation: 'Subtract. Remainder is 2.' },
        { expression: 'x^4+x^3-3x^2+x+2 = (x^2+2x-1)(x^2-x) + 2', annotation: 'Final answer.' },
      ],
      answer: 'Quotient: $x^2 - x$, Remainder: 2.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'functions', label: 'Functions', context: 'Polynomials are the simplest type of function; division reveals their structure.' },
    { lessonSlug: 'partial-fractions-intro', label: 'Partial Fractions', context: 'Polynomial division is the first step in partial fraction decomposition — divide first if the degree of the numerator exceeds the denominator.' },
    { lessonSlug: 'algebraic-techniques', label: 'Algebraic Techniques', context: 'Factoring and polynomial manipulation are core algebraic skills.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
