export default {
  id: 'ch2-009',
  slug: 'absolute-value-radicals',
  chapter: 2,
  order: 9,
  title: 'Absolute Value Equations and Radical Expressions',
  subtitle: 'Absolute value creates two cases every time — and radicals require domain checks that beginners always miss',
  tags: ['absolute value', 'absolute value equations', 'radicals', 'simplifying radicals', 'extraneous solutions', 'square roots', 'variables in radicals'],
  aliases: 'absolute value equations two cases extraneous solutions radicals simplify square roots variables radical expressions',

  hook: {
    question: 'Solving $|2x - 3| = 7$ gives two answers. Solving $|2x - 3| = |x + 1|$ also gives two answers — but they come from different case combinations. And solving $\\sqrt{x+3} = x - 1$ sometimes gives a solution that, when checked, does not actually work. Why?',
    realWorldContext: 'Absolute value measures distance — always non-negative. In manufacturing quality control, a tolerance specification like $|d - 10.00| \\leq 0.05$ mm means the diameter must be within 0.05 mm of the target. Solving that inequality tells you the acceptable range. Radical expressions appear in distance formulas, RMS calculations in electrical engineering, and standard deviation formulas in statistics.',
    previewVisualizationId: 'SignChartViz',
  },

  intuition: {
    prose: [
      'The absolute value $|a|$ equals $a$ when $a \\geq 0$ and $-a$ when $a < 0$. It is the distance from $a$ to zero on the number line. The equation $|f(x)| = k$ means $f(x) = k$ or $f(x) = -k$ — two cases, always. If $k < 0$, there is no solution because absolute value is never negative.',
      'When both sides have absolute value, $|f(x)| = |g(x)|$, the two cases are $f(x) = g(x)$ or $f(x) = -g(x)$. Solve each separately, check both answers. Extraneous solutions do not appear for absolute value equations (unlike radical equations) — but always verify anyway.',
      'Simplifying radical expressions with variables requires knowing the domain. $\\sqrt{x^2} = |x|$, not $x$ — because for negative $x$, $\\sqrt{x^2} = \\sqrt{(-3)^2} = \\sqrt{9} = 3 = |-3|$, not $-3$. This matters: $\\sqrt{(x-2)^2} = |x-2|$, which equals $x-2$ only when $x \\geq 2$ and $2-x$ when $x < 2$.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Absolute value — the two-case definition',
        body: '|a| = \\begin{cases} a & \\text{if } a \\geq 0 \\\\ -a & \\text{if } a < 0 \\end{cases} \\\\ |f(x)| = k \\Rightarrow f(x) = k \\text{ or } f(x) = -k \\quad (k > 0)',
      },
      {
        type: 'proof-map',
        title: 'Solving absolute value equations',
        body: '1.\\; \\text{Isolate the absolute value expression first.} \\\\ 2.\\; \\text{If RHS} < 0: \\text{no solution.} \\\\ 3.\\; \\text{If RHS} = 0: \\text{one case only.} \\\\ 4.\\; \\text{If RHS} > 0: \\text{set up two equations and solve both.} \\\\ 5.\\; \\text{Check both answers.}',
      },
      {
        type: 'warning',
        title: '$\\sqrt{x^2} = |x|$, not $x$',
        body: '\\sqrt{x^2} = |x| \\quad \\text{always} \\\\ \\sqrt{x^2} = x \\quad \\text{only when } x \\geq 0 \\\\ \\text{Example: } \\sqrt{(-5)^2} = \\sqrt{25} = 5 = |-5| \\neq -5',
      },
      {
        type: 'warning',
        title: 'Extraneous solutions in radical equations',
        body: '\\text{Squaring both sides can introduce false solutions.} \\\\ \\text{Always check answers in the ORIGINAL equation.} \\\\ \\text{Example: } \\sqrt{x} = -2 \\text{ has no solution (LHS} \\geq 0\\text{).} \\\\ \\text{But squaring gives } x = 4, \\text{ which fails the check.}',
      },
    ],
    visualizations: [
      {
        id: 'SignChartViz',
        title: 'Absolute Value as a Sign Chart',
        mathBridge: 'Enter the zeros of the expression inside the absolute value. The sign chart shows where the expression is positive (no change) and where it is negative (flips sign). The absolute value graph reflects negative portions upward.',
        caption: 'Absolute value flips the negative parts of a function to positive.',
      },
    ],
  },

  math: {
    prose: [
      'Simplifying radical expressions with variables follows the same rules as numbers, with one extra requirement: identify the domain first. $\\sqrt{x^2 - 9}$ requires $x^2 \\geq 9$, so $x \\leq -3$ or $x \\geq 3$. Inside the domain, simplification proceeds: $\\sqrt{x^2 - 9}$ does not simplify further unless the expression factors.',
      'For expressions like $\\sqrt{x^2 - 6x + 9} = \\sqrt{(x-3)^2} = |x-3|$. If you know $x \\geq 3$, this equals $x - 3$. If $x < 3$, it equals $3 - x$. Knowing the domain lets you drop the absolute value.',
      'Radical equations — equations with the variable inside a radical — require isolation and squaring. Isolate one radical on one side, square both sides, solve, then check every answer in the original equation. With two radicals, isolate one, square, then isolate the remaining radical and square again.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Simplifying radicals with variables',
        body: '\\sqrt{a^2} = |a| \\qquad \\sqrt[n]{a^n} = |a| \\text{ (}n \\text{ even)} \\qquad \\sqrt[n]{a^n} = a \\text{ (}n \\text{ odd)} \\\\ \\sqrt{a^2 b} = |a|\\sqrt{b} \\qquad \\frac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\frac{a}{b}} \\quad (b > 0)',
      },
      {
        type: 'proof-map',
        title: 'Solving radical equations',
        body: '1.\\; \\text{Isolate one radical term.} \\\\ 2.\\; \\text{Square both sides.} \\\\ 3.\\; \\text{If another radical remains, isolate and square again.} \\\\ 4.\\; \\text{Solve the resulting polynomial equation.} \\\\ 5.\\; \\textbf{Check every answer in the original equation.}',
      },
    ],
  },

  rigor: {
    title: 'Solving $|3x - 2| = |x + 4|$ — the two-absolute-value case',
    visualizationId: 'SignChartViz',
    proofSteps: [
      {
        expression: '|3x-2| = |x+4| \\Rightarrow 3x-2 = x+4 \\quad \\text{or} \\quad 3x-2 = -(x+4)',
        annotation: '$|A| = |B|$ means $A = B$ or $A = -B$. Set up both cases.',
      },
      {
        expression: '\\text{Case 1: } 3x-2 = x+4 \\Rightarrow 2x = 6 \\Rightarrow x = 3',
        annotation: 'Solve the first linear equation.',
      },
      {
        expression: '\\text{Case 2: } 3x-2 = -(x+4) = -x-4 \\Rightarrow 4x = -2 \\Rightarrow x = -\\tfrac{1}{2}',
        annotation: 'Solve the second linear equation.',
      },
      {
        expression: '\\text{Check } x=3: |9-2| = |3+4| \\Rightarrow 7 = 7 \\checkmark',
        annotation: 'Both answers should check — no extraneous solutions for absolute value equations.',
      },
      {
        expression: '\\text{Check } x=-\\tfrac{1}{2}: |{-\\tfrac{3}{2}}-2| = |{-\\tfrac{1}{2}}+4| \\Rightarrow \\tfrac{7}{2} = \\tfrac{7}{2} \\checkmark \\qquad \\blacksquare',
        annotation: 'Both valid. Solutions: $x = -\\frac{1}{2}$ and $x = 3$.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-009-ex1',
      title: 'Absolute value equation — isolate first',
      problem: '\\text{Solve: } 2|3x + 1| - 4 = 10.',
      steps: [
        {
          expression: '2|3x+1| = 14 \\Rightarrow |3x+1| = 7',
          annotation: 'Isolate the absolute value before splitting into cases.',
        },
        {
          expression: '3x+1 = 7 \\Rightarrow x = 2 \\qquad \\text{or} \\qquad 3x+1 = -7 \\Rightarrow x = -\\tfrac{8}{3}',
          annotation: 'Two cases. Solve each.',
        },
      ],
      conclusion: 'Always isolate first. Splitting into cases before isolating is the most common error.',
    },
    {
      id: 'ch2-009-ex2',
      title: 'Simplifying radical expressions with variables',
      problem: '\\text{Simplify: (a) } \\sqrt{50x^3} \\quad \\text{(b) } \\sqrt{\\frac{4x^2}{9y^4}} \\quad (x \\geq 0, y \\neq 0)',
      steps: [
        {
          expression: '\\sqrt{50x^3} = \\sqrt{25 \\cdot 2 \\cdot x^2 \\cdot x} = 5x\\sqrt{2x}',
          annotation: 'Factor out perfect squares: $25x^2$ is a perfect square. Since $x \\geq 0$, $\\sqrt{x^2} = x$ (no absolute value needed).',
        },
        {
          expression: '\\sqrt{\\frac{4x^2}{9y^4}} = \\frac{\\sqrt{4x^2}}{\\sqrt{9y^4}} = \\frac{2x}{3y^2}',
          annotation: '$y^4 = (y^2)^2$ is a perfect square regardless of the sign of $y$.',
        },
      ],
      conclusion: 'Always state domain assumptions before simplifying. Without $x \\geq 0$, the answer to (a) would be $5|x|\\sqrt{2x}$.',
    },
    {
      id: 'ch2-009-ex3',
      title: 'Radical equation with extraneous solution',
      problem: '\\text{Solve: } \\sqrt{x+6} = x.',
      steps: [
        {
          expression: '(\\sqrt{x+6})^2 = x^2 \\Rightarrow x+6 = x^2 \\Rightarrow x^2-x-6=0 \\Rightarrow (x-3)(x+2)=0',
          annotation: 'Square both sides. Solve the quadratic.',
        },
        {
          expression: 'x = 3 \\text{ or } x = -2',
          annotation: 'Two candidates. Must check both.',
        },
        {
          expression: '\\text{Check } x=3: \\sqrt{9} = 3 \\checkmark \\qquad \\text{Check } x=-2: \\sqrt{4} = 2 \\neq -2 \\times',
          annotation: '$x=-2$ fails because $\\sqrt{4} = 2 > 0$ but the right side is $-2 < 0$. Extraneous.',
        },
      ],
      conclusion: 'Squaring introduced the extraneous solution $x=-2$. The only valid solution is $x=3$. This is why checking is mandatory for radical equations.',
    },
  ],

  challenges: [
    {
      id: 'ch2-009-ch1',
      difficulty: 'medium',
      problem: '\\text{Solve: } |x^2 - 4| = 5.',
      hint: 'The expression inside is quadratic. Set up two cases and solve each quadratic.',
      walkthrough: [
        {
          expression: 'x^2-4 = 5 \\Rightarrow x^2=9 \\Rightarrow x = \\pm 3',
          annotation: 'Case 1.',
        },
        {
          expression: 'x^2-4=-5 \\Rightarrow x^2=-1 \\Rightarrow \\text{no real solution}',
          annotation: 'Case 2: $x^2 = -1$ has no real solutions.',
        },
      ],
      answer: 'x = -3 \\text{ or } x = 3',
    },
    {
      id: 'ch2-009-ch2',
      difficulty: 'hard',
      problem: '\\text{Solve: } \\sqrt{x+4} - \\sqrt{x-1} = 1.',
      hint: 'Isolate one radical, square, then isolate and square the remaining radical.',
      walkthrough: [
        {
          expression: '\\sqrt{x+4} = 1 + \\sqrt{x-1}',
          annotation: 'Isolate one radical.',
        },
        {
          expression: 'x+4 = 1 + 2\\sqrt{x-1} + (x-1) \\Rightarrow 4 = 2\\sqrt{x-1} \\Rightarrow \\sqrt{x-1} = 2',
          annotation: 'Square both sides. Simplify — the $x$ terms cancel.',
        },
        {
          expression: 'x-1 = 4 \\Rightarrow x = 5',
          annotation: 'Square again to remove the remaining radical.',
        },
        {
          expression: '\\text{Check: } \\sqrt{9}-\\sqrt{4} = 3-2 = 1 \\checkmark',
          annotation: 'Valid solution.',
        },
      ],
      answer: 'x = 5',
    },
  ],

  calcBridge: {
    teaser: 'Absolute value appears in calculus in the antiderivative $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$ — the absolute value ensures the formula works for negative $x$ too. Radicals appear constantly in arc length formulas, surface area of revolution, and trig substitution. Simplifying $\\sqrt{1-\\sin^2\\theta} = |\\cos\\theta| = \\cos\\theta$ (in the right quadrant) is a step in every trig substitution problem.',
    linkedLessons: ['factoring-every-method', 'trig-in-calculus'],
  },
}
