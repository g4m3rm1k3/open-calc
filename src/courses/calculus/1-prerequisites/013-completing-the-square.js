export default {
  id: 'ch0-completing-the-square',
  slug: 'completing-the-square',
  chapter: 0,
  order: 1.4,
  title: 'Completing the Square',
  subtitle: 'The technique that unlocks quadratics, circles, and integration',
  tags: ['completing the square', 'quadratic formula', 'vertex form', 'parabola', 'vertex', 'conic sections', 'integration', 'trig substitution', 'algebra', 'quadratic', 'perfect square trinomial', 'discriminant'],

  hook: {
    question: 'Why does every parabola have exactly one lowest (or highest) point, and how can a simple algebraic trick reveal it instantly?',
    realWorldContext:
      'Completing the square is one of the most versatile techniques in mathematics. It derives the quadratic formula you memorized in algebra. ' +
      'It converts circle equations from expanded form to center-radius form. It reveals the vertex of a parabola, which is the key to ' +
      'optimization problems in physics and economics. In calculus, it appears in integration when you need to handle expressions like ' +
      '$\\int \\frac{dx}{x^2 + 4x + 13}$ by rewriting the denominator as $(x+2)^2 + 9$, enabling a trig substitution.',
    previewVisualizationId: 'FunctionPlotter',
  },

  intuition: {
    prose: [
      'Here is the core idea: any quadratic expression $x^2 + bx + c$ can be rewritten as $(x + h)^2 + k$ for the right values of $h$ and $k$. Why would you want to do this? Because a **perfect square** $(x+h)^2$ is always $\\geq 0$, which immediately tells you the minimum value of the expression is $k$, achieved when $x = -h$.',

      'The technique is called "completing the square" because you are literally completing a partial square. Think of $x^2 + 6x$ geometrically: you have a square of side $x$ (area $x^2$) and a rectangle of dimensions $x \\times 6$ (area $6x$). Split the rectangle into two pieces of $x \\times 3$ and attach them to two sides of the square. You almost have a bigger square of side $(x+3)$, but there is a $3 \\times 3$ corner piece missing. Add it: $x^2 + 6x + 9 = (x+3)^2$.',

      'The algorithm is simple: (1) Start with $x^2 + bx$. (2) Take half the coefficient of $x$: that is $b/2$. (3) Square it: $(b/2)^2$. (4) Add and subtract this value: $x^2 + bx + (b/2)^2 - (b/2)^2 = (x + b/2)^2 - (b/2)^2$. Done.',

      'When the leading coefficient is not 1, factor it out first. For $3x^2 + 12x + 5$: factor out the 3 from the first two terms to get $3(x^2 + 4x) + 5$, then complete the square inside the parentheses: $3(x^2 + 4x + 4 - 4) + 5 = 3(x+2)^2 - 12 + 5 = 3(x+2)^2 - 7$.',

      'This technique derives the **quadratic formula**. Start with $ax^2 + bx + c = 0$. Divide by $a$: $x^2 + \\frac{b}{a}x = -\\frac{c}{a}$. Complete the square: $\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2 - 4ac}{4a^2}$. Take square roots: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. You do not need to memorize the quadratic formula if you can complete the square — you can derive it in 30 seconds.',

      'In calculus, completing the square transforms integrals involving quadratics into standard forms that can be evaluated using inverse trig functions or trig substitution. For example, $\\int \\frac{dx}{x^2 + 6x + 13}$ becomes $\\int \\frac{dx}{(x+3)^2 + 4}$, which is a standard arctangent integral.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'The Geometric Picture',
        body: 'x² + bx is a square (x²) plus a rectangle (bx). Split the rectangle in half, attach to two sides of the square, and you are missing a small corner square of area (b/2)². Adding that corner "completes" the square.',
      },
      {
        type: 'technique',
        title: 'The Three-Step Recipe',
        body: '1. Ensure the x² coefficient is 1 (factor it out if not). 2. Take half the x-coefficient, square it. 3. Add and subtract that value, then factor the perfect square trinomial.',
      },
      {
        type: 'misconception',
        title: 'Do Not Forget to Compensate',
        body: 'When you add (b/2)² inside an expression, you must also subtract it (or account for it) to keep the expression equal. If there is a factor outside, like 3(x² + 4x), adding 4 inside the parentheses actually adds 3 × 4 = 12 to the expression, so you must subtract 12 outside.',
      },
      {
        type: 'tip',
        title: 'Vertex Form Reveals Everything',
        body: 'The form a(x − h)² + k immediately tells you: vertex at (h, k), axis of symmetry x = h, opens up if a > 0 (minimum k), opens down if a < 0 (maximum k).',
      },
    ],
    visualizations: [
      { id: 'FunctionPlotter', title: 'Parabola Vertex Form', caption: 'See how changing h and k in a(x−h)² + k shifts the parabola.' },
    ],
  },

  math: {
    prose: [
      'The general completing the square identity: for any $x^2 + bx + c$, we have $\\displaystyle x^2 + bx + c = \\left(x + \\frac{b}{2}\\right)^2 + c - \\frac{b^2}{4}$. This rewrites any monic quadratic in vertex form.',

      'For a general quadratic $ax^2 + bx + c$ with $a \\neq 0$: $\\displaystyle ax^2 + bx + c = a\\left(x + \\frac{b}{2a}\\right)^2 + c - \\frac{b^2}{4a}$. The vertex of the parabola $y = ax^2 + bx + c$ is at $\\left(-\\frac{b}{2a},\\; c - \\frac{b^2}{4a}\\right)$.',

      'The **discriminant** $\\Delta = b^2 - 4ac$ determines the nature of the roots. If $\\Delta > 0$: two distinct real roots. If $\\Delta = 0$: one repeated real root (the parabola touches the x-axis at its vertex). If $\\Delta < 0$: no real roots (the parabola does not cross the x-axis).',

      'Completing the square converts the general equation of a circle $x^2 + y^2 + Dx + Ey + F = 0$ into standard form. Complete the square in $x$ and $y$ separately: $\\left(x + \\frac{D}{2}\\right)^2 + \\left(y + \\frac{E}{2}\\right)^2 = \\frac{D^2 + E^2}{4} - F$. This is a circle when the right side is positive.',

      'For integration, the key identity is recognizing that $ax^2 + bx + c$ can always be written as $a(x-h)^2 + k$, transforming the integrand into a form involving $(u^2 + p^2)$ or $(u^2 - p^2)$, where $u = x - h$. These lead to inverse trig or logarithmic antiderivatives.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Quadratic Formula (Derived by Completing the Square)',
        body: 'ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      },
      {
        type: 'definition',
        title: 'Vertex Form of a Quadratic',
        body: 'y = a(x - h)^2 + k \\\\ \\text{Vertex: } (h, k) \\quad \\text{Axis of symmetry: } x = h',
      },
      {
        type: 'definition',
        title: 'Discriminant',
        body: '\\Delta = b^2 - 4ac \\\\ \\Delta > 0: \\text{two real roots} \\\\ \\Delta = 0: \\text{one repeated root} \\\\ \\Delta < 0: \\text{no real roots (complex roots)}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'We derive the quadratic formula rigorously. Given $ax^2 + bx + c = 0$ with $a \\neq 0$, divide by $a$: $x^2 + \\frac{b}{a}x + \\frac{c}{a} = 0$. Subtract $\\frac{c}{a}$: $x^2 + \\frac{b}{a}x = -\\frac{c}{a}$.',

      'Complete the square: add $\\left(\\frac{b}{2a}\\right)^2 = \\frac{b^2}{4a^2}$ to both sides: $\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2}{4a^2} - \\frac{c}{a} = \\frac{b^2 - 4ac}{4a^2}$.',

      'If $b^2 - 4ac \\geq 0$, take the square root: $x + \\frac{b}{2a} = \\pm \\frac{\\sqrt{b^2 - 4ac}}{2a}$. Therefore $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$. If $b^2 - 4ac < 0$, no real number squared equals the right side, so there are no real solutions.',

      'The vertex form also provides a clean proof that every quadratic $f(x) = a(x-h)^2 + k$ achieves its extreme value at $x = h$. If $a > 0$, then $(x-h)^2 \\geq 0$ for all $x$, so $f(x) \\geq k$ for all $x$, with equality at $x = h$. If $a < 0$, then $a(x-h)^2 \\leq 0$, so $f(x) \\leq k$, with equality at $x = h$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Extreme Value of a Quadratic',
        body: 'f(x) = a(x-h)^2 + k \\text{ has:} \\\\ \\text{minimum } k \\text{ at } x = h \\text{ if } a > 0 \\\\ \\text{maximum } k \\text{ at } x = h \\text{ if } a < 0',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-basic-cts',
      title: 'Basic Completing the Square',
      problem: 'Rewrite $x^2 + 8x + 3$ in vertex form.',
      steps: [
        { expression: 'x^2 + 8x + 3', annotation: 'The coefficient of x is 8.' },
        { expression: '\\frac{8}{2} = 4, \\quad 4^2 = 16', annotation: 'Half the coefficient, then square it.' },
        { expression: '(x^2 + 8x + 16) + 3 - 16', annotation: 'Add and subtract 16.' },
        { expression: '(x + 4)^2 - 13', annotation: 'Factor the perfect square trinomial.' },
      ],
      conclusion: 'Vertex form: $(x+4)^2 - 13$. The vertex is at $(-4, -13)$ and the minimum value is $-13$.',
    },
    {
      id: 'ex-leading-coeff',
      title: 'Completing the Square with Leading Coefficient',
      problem: 'Write $2x^2 - 12x + 7$ in vertex form.',
      steps: [
        { expression: '2(x^2 - 6x) + 7', annotation: 'Factor 2 from the first two terms.' },
        { expression: '\\frac{-6}{2} = -3, \\quad (-3)^2 = 9', annotation: 'Half the coefficient inside, squared.' },
        { expression: '2(x^2 - 6x + 9 - 9) + 7', annotation: 'Add and subtract 9 inside the parentheses.' },
        { expression: '2(x - 3)^2 - 18 + 7', annotation: 'Factor the perfect square. Note: the −9 inside gets multiplied by 2.' },
        { expression: '2(x - 3)^2 - 11', annotation: 'Simplify.' },
      ],
      conclusion: 'Vertex form: $2(x-3)^2 - 11$. Vertex at $(3, -11)$. Since $a = 2 > 0$, the parabola opens upward with minimum $-11$.',
    },
    {
      id: 'ex-derive-quadratic',
      title: 'Solving by Completing the Square',
      problem: 'Solve $3x^2 + 6x - 1 = 0$ by completing the square.',
      steps: [
        { expression: '3(x^2 + 2x) = 1', annotation: 'Factor out 3 and move constant to the right.' },
        { expression: '3(x^2 + 2x + 1) = 1 + 3', annotation: 'Complete the square inside. Adding 1 inside means adding 3 × 1 = 3 to the right.' },
        { expression: '3(x + 1)^2 = 4', annotation: 'Factor and simplify.' },
        { expression: '(x + 1)^2 = \\frac{4}{3}', annotation: 'Divide by 3.' },
        { expression: 'x + 1 = \\pm \\frac{2}{\\sqrt{3}} = \\pm \\frac{2\\sqrt{3}}{3}', annotation: 'Take square root and rationalize.' },
        { expression: 'x = -1 \\pm \\frac{2\\sqrt{3}}{3}', annotation: 'Subtract 1.' },
      ],
      conclusion: 'The two solutions are $x = -1 + \\frac{2\\sqrt{3}}{3} \\approx 0.155$ and $x = -1 - \\frac{2\\sqrt{3}}{3} \\approx -2.155$.',
    },
    {
      id: 'ex-circle-cts',
      title: 'Identifying a Circle by Completing the Square',
      problem: 'Identify the curve $x^2 + y^2 + 8x - 6y + 16 = 0$.',
      steps: [
        { expression: '(x^2 + 8x) + (y^2 - 6y) = -16', annotation: 'Group and move constant.' },
        { expression: '(x^2 + 8x + 16) + (y^2 - 6y + 9) = -16 + 16 + 9', annotation: 'Complete the square in x (add 16) and y (add 9).' },
        { expression: '(x + 4)^2 + (y - 3)^2 = 9', annotation: 'Factor.' },
        { expression: '\\text{Circle: center } (-4, 3), \\quad r = 3', annotation: 'Read off center and radius.' },
      ],
      conclusion: 'Completing the square in both variables reveals this is a circle with center $(-4, 3)$ and radius 3.',
    },
    {
      id: 'ex-integration-prep',
      title: 'Preparing for Integration',
      problem: 'Rewrite $x^2 + 4x + 13$ in a form suitable for integration.',
      steps: [
        { expression: 'x^2 + 4x + 13', annotation: 'We want the form (x − h)² + k².' },
        { expression: '(x^2 + 4x + 4) + 13 - 4', annotation: 'Complete the square.' },
        { expression: '(x + 2)^2 + 9', annotation: 'Now in the form u² + a² with u = x + 2 and a = 3.' },
        { expression: '\\int \\frac{dx}{x^2 + 4x + 13} = \\int \\frac{du}{u^2 + 9} = \\frac{1}{3}\\arctan\\frac{u}{3} + C', annotation: 'This is a standard arctangent integral.' },
      ],
      conclusion: 'Completing the square transformed an unrecognizable integrand into a standard form: $\\frac{1}{3}\\arctan\\frac{x+2}{3} + C$.',
    },
  ],

  challenges: [
    {
      id: 'ch0-cts-c1',
      difficulty: 'easy',
      problem: 'Rewrite $x^2 - 10x + 7$ in vertex form and state the vertex.',
      hint: 'Half of −10 is −5. Square it: 25. Add and subtract 25.',
      walkthrough: [
        { expression: '(x^2 - 10x + 25) + 7 - 25', annotation: 'Add and subtract 25.' },
        { expression: '(x - 5)^2 - 18', annotation: 'Factor and simplify.' },
      ],
      answer: '$(x-5)^2 - 18$. Vertex: $(5, -18)$.',
    },
    {
      id: 'ch0-cts-c2',
      difficulty: 'medium',
      problem: 'Derive the quadratic formula by completing the square on $ax^2 + bx + c = 0$.',
      hint: 'Divide by a, move c/a to the right side, complete the square using b/(2a), then take the square root.',
      walkthrough: [
        { expression: 'x^2 + \\frac{b}{a}x = -\\frac{c}{a}', annotation: 'Divide by a and rearrange.' },
        { expression: '\\left(x + \\frac{b}{2a}\\right)^2 = \\frac{b^2}{4a^2} - \\frac{c}{a} = \\frac{b^2 - 4ac}{4a^2}', annotation: 'Complete the square.' },
        { expression: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', annotation: 'Take the square root and solve for x.' },
      ],
      answer: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
    },
    {
      id: 'ch0-cts-c3',
      difficulty: 'hard',
      problem: 'Complete the square to show that $x^2 + y^2 - 2x + 4y + 7 = 0$ has no graph (no real solutions).',
      hint: 'Complete the square in both variables and show that the right side is negative.',
      walkthrough: [
        { expression: '(x^2 - 2x + 1) + (y^2 + 4y + 4) = -7 + 1 + 4', annotation: 'Complete the square in x and y.' },
        { expression: '(x - 1)^2 + (y + 2)^2 = -2', annotation: 'The right side is negative.' },
        { expression: '\\text{But } (x-1)^2 \\geq 0 \\text{ and } (y+2)^2 \\geq 0, \\text{ so the left side} \\geq 0.', annotation: 'Sum of squares is always non-negative.' },
        { expression: '0 \\leq (x-1)^2 + (y+2)^2 = -2 \\;\\text{ is impossible.}', annotation: 'Contradiction: no real (x, y) satisfies this equation.' },
      ],
      answer: 'No real solutions exist. The equation represents an imaginary circle (radius² < 0).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'geometry-review', label: 'Coordinate Geometry', context: 'Completing the square converts circle equations from general to standard form.' },
    { lessonSlug: 'conic-sections', label: 'Conic Sections', context: 'Completing the square is essential for identifying and graphing all conic sections.' },
    { lessonSlug: 'functions', label: 'Functions', context: 'Vertex form reveals the minimum/maximum of a quadratic function.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
