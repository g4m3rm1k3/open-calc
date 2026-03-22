export default {
  id: 'ch3-004',
  slug: 'inverse-trig-functions',
  chapter: 'precalc-3',
  order: 6,
  title: 'Inverse Trig Functions: Undoing the Circle',
  subtitle: 'Why domain restriction is not a technicality — it is the only way inverse trig can exist',
  tags: ['inverse trig', 'arcsin', 'arccos', 'arctan', 'domain restriction', 'principal value', 'inverse functions'],
  aliases: 'arcsin arccos arctan inverse sine cosine tangent domain restriction principal value arcsec arccsc arccot',

  hook: {
    question: 'If $\\sin(\\pi/6) = 1/2$, then $\\sin^{-1}(1/2)$ should be $\\pi/6$. But $\\sin(5\\pi/6) = 1/2$ too — and infinitely many other angles. How does $\\sin^{-1}$ give a single answer?',
    realWorldContext: 'Inverse trig functions appear any time you need an angle from a ratio: surveying (finding an angle from measured distances), robotics (computing joint angles from end-effector position), physics (finding launch angles for projectile motion). In calculus, $\\frac{d}{dx}\\arctan x = \\frac{1}{1+x^2}$ is one of the most important antiderivative formulas — it is how integrals like $\\int \\frac{1}{1+x^2}\\,dx$ are solved.',
    previewVisualizationId: 'InverseTrigViz',
  },

  intuition: {
    prose: [
      'The sine function is not one-to-one — it takes the same value at infinitely many angles. $\\sin(\\pi/6) = \\sin(5\\pi/6) = \\sin(13\\pi/6) = \\cdots = 1/2$. A function that is not one-to-one has no inverse — there is no way to say "the angle whose sine is $1/2$" because there are infinitely many.',
      'The solution is domain restriction: we agree to only use a specific portion of the sine curve — the piece from $-\\pi/2$ to $\\pi/2$. On that interval, sine is strictly increasing and therefore one-to-one. The inverse of this restricted function is $\\arcsin$. The output is always in $[-\\pi/2, \\pi/2]$ — the "principal value." No ambiguity.',
      'Each inverse trig function has a different restriction, chosen to cover the full output range while keeping the function one-to-one: $\\arcsin$ uses $[-\\pi/2, \\pi/2]$, $\\arccos$ uses $[0, \\pi]$, $\\arctan$ uses $(-\\pi/2, \\pi/2)$. These choices are conventions — but they are universal conventions, and every calculator uses them.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The three principal inverse trig functions',
        body: '\\arcsin x:\\; [-1,1] \\to [-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}] \\quad \\text{(sin restricted to } [-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]\\text{)} \\\\ \\arccos x:\\; [-1,1] \\to [0, \\pi] \\quad \\text{(cos restricted to } [0,\\pi]\\text{)} \\\\ \\arctan x:\\; \\mathbb{R} \\to (-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}) \\quad \\text{(tan restricted to } (-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2})\\text{)}',
      },
      {
        type: 'warning',
        title: 'The principal value trap',
        body: '\\arcsin(\\sin(5\\pi/6)) \\neq 5\\pi/6 \\\\ \\arcsin(\\sin(5\\pi/6)) = \\arcsin(1/2) = \\pi/6 \\\\ \\text{Because } 5\\pi/6 \\notin [-\\pi/2, \\pi/2]\\text{, arcsin gives the equivalent angle IN the principal range.}',
      },
      {
        type: 'insight',
        title: 'Why arctan has asymptotes but arcsin does not',
        body: '\\arctan x \\to \\pm\\tfrac{\\pi}{2} \\text{ as } x \\to \\pm\\infty \\quad \\text{(tan can take any real input)} \\\\ \\arcsin x \\text{ is only defined for } x \\in [-1, 1] \\quad \\text{(sin output is bounded)} \\\\ \\arccos x \\text{ is only defined for } x \\in [-1, 1] \\quad \\text{(same reason)}',
      },
    ],
    visualizations: [
      {
        id: 'InverseTrigViz',
        title: 'Restricting the Domain to Create an Inverse',
        mathBridge: 'Toggle between sin, cos, tan. See the restriction highlighted, then the inverse function as a reflection over y = x.',
        caption: 'The inverse function is the reflection of the restricted portion — not the whole periodic curve.',
      },
      {
        id: 'VideoEmbed',
        title: 'Evaluating Inverse Trigonometric Functions',
        props: { url: 'https://www.youtube.com/embed/7t_pZGGxMdE' },
      },
      {
        id: 'VideoEmbed',
        title: 'Evaluating Inverse Trigonometric Functions Full Length',
        props: { url: 'https://www.youtube.com/embed/hxjmtDXXCzU' },
      },
    ],
  },

  math: {
    prose: [
      'The derivatives of the inverse trig functions are algebraic — no trig appears in them. This is surprising until you see how they are derived: using implicit differentiation on $y = \\arcsin x$ means differentiating $\\sin y = x$, giving $\\cos y \\cdot y\' = 1$, so $y\' = 1/\\cos y$. Then using the Pythagorean identity $\\cos y = \\sqrt{1 - \\sin^2 y} = \\sqrt{1 - x^2}$, the final result is $\\frac{1}{\\sqrt{1-x^2}}$ — no trig at all.',
      'The key derivatives to know: $\\frac{d}{dx}\\arcsin x = \\frac{1}{\\sqrt{1-x^2}}$, $\\frac{d}{dx}\\arctan x = \\frac{1}{1+x^2}$. These also give the two most important inverse trig antiderivatives, which appear constantly in calculus.',
      'The identity $\\arcsin x + \\arccos x = \\pi/2$ holds for all $x \\in [-1,1]$. Geometrically: in a right triangle, the two acute angles sum to $\\pi/2$, and if one is $\\arcsin x$, the other is $\\arccos x$. This means you only really need to remember $\\arcsin$ and $\\arctan$ — the others follow from complementary angle relationships.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Inverse trig derivatives — all derived via implicit differentiation',
        body: '\\frac{d}{dx}\\arcsin x = \\frac{1}{\\sqrt{1-x^2}} \\qquad \\frac{d}{dx}\\arccos x = \\frac{-1}{\\sqrt{1-x^2}} \\\\ \\frac{d}{dx}\\arctan x = \\frac{1}{1+x^2} \\qquad \\frac{d}{dx}\\text{arcsec}\\, x = \\frac{1}{|x|\\sqrt{x^2-1}}',
      },
      {
        type: 'theorem',
        title: 'The two inverse trig antiderivatives you must know cold',
        body: '\\int \\frac{dx}{\\sqrt{1-x^2}} = \\arcsin x + C \\\\ \\int \\frac{dx}{1+x^2} = \\arctan x + C',
      },
      {
        type: 'theorem',
        title: 'Generalised forms (used in practice)',
        body: '\\int \\frac{dx}{\\sqrt{a^2-x^2}} = \\arcsin\\frac{x}{a} + C \\\\ \\int \\frac{dx}{a^2+x^2} = \\frac{1}{a}\\arctan\\frac{x}{a} + C',
      },
      {
        type: 'insight',
        title: 'Complementary identity',
        body: '\\arcsin x + \\arccos x = \\frac{\\pi}{2} \\quad \\text{for all } x \\in [-1,1] \\\\ \\text{So: } \\frac{d}{dx}\\arccos x = -\\frac{d}{dx}\\arcsin x \\text{ — the derivatives are negatives of each other.}',
      },
    ],
  },

  rigor: {
    title: 'Deriving $\\frac{d}{dx}\\arctan x = \\frac{1}{1+x^2}$ by implicit differentiation',
    visualizationId: 'InverseTrigViz',
    proofSteps: [
      {
        expression: 'y = \\arctan x \\iff \\tan y = x, \\quad y \\in \\bigl(-\\tfrac{\\pi}{2}, \\tfrac{\\pi}{2}\\bigr)',
        annotation: 'Rewrite using the definition of arctan. We will differentiate the simpler form $\\tan y = x$.',
      },
      {
        expression: '\\frac{d}{dx}[\\tan y] = \\frac{d}{dx}[x]',
        annotation: 'Differentiate both sides with respect to $x$.',
      },
      {
        expression: '\\sec^2 y \\cdot \\frac{dy}{dx} = 1',
        annotation: 'Chain rule on the left: derivative of $\\tan y$ is $\\sec^2 y$, times $dy/dx$.',
      },
      {
        expression: '\\frac{dy}{dx} = \\frac{1}{\\sec^2 y} = \\cos^2 y',
        annotation: 'Solve for $dy/dx$.',
      },
      {
        expression: '\\tan y = x \\Rightarrow \\text{right triangle: opposite}=x, \\text{adjacent}=1, \\text{hypotenuse}=\\sqrt{1+x^2}',
        annotation: 'Draw the right triangle corresponding to $\\tan y = x$. The hypotenuse is $\\sqrt{1+x^2}$ by the Pythagorean theorem.',
      },
      {
        expression: '\\cos y = \\frac{1}{\\sqrt{1+x^2}} \\Rightarrow \\cos^2 y = \\frac{1}{1+x^2}',
        annotation: 'Read $\\cos y$ from the triangle: adjacent over hypotenuse.',
      },
      {
        expression: '\\therefore \\quad \\frac{d}{dx}\\arctan x = \\frac{1}{1+x^2} \\qquad \\blacksquare',
        annotation: 'Substitute back. The result is purely algebraic — no trig remains. This is why arctan appears as the antiderivative of $1/(1+x^2)$.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-004-ex1',
      title: 'Evaluating inverse trig exactly',
      problem: '\\text{Find: } (a)\\; \\arcsin\\tfrac{\\sqrt{3}}{2}, \\quad (b)\\; \\arctan(-1), \\quad (c)\\; \\arccos 0.',
      steps: [
        {
          expression: '\\arcsin\\tfrac{\\sqrt{3}}{2} = \\tfrac{\\pi}{3}',
          annotation: '$\\sin(\\pi/3) = \\sqrt{3}/2$ and $\\pi/3 \\in [-\\pi/2, \\pi/2]$ — it is in the principal range.',
        },
        {
          expression: '\\arctan(-1) = -\\tfrac{\\pi}{4}',
          annotation: '$\\tan(-\\pi/4) = -1$ and $-\\pi/4 \\in (-\\pi/2, \\pi/2)$. The negative angle is correct — arctan output is negative for negative inputs.',
        },
        {
          expression: '\\arccos 0 = \\tfrac{\\pi}{2}',
          annotation: '$\\cos(\\pi/2) = 0$ and $\\pi/2 \\in [0, \\pi]$. Note: $\\arcsin 0 = 0$ but $\\arccos 0 = \\pi/2$ — different principal ranges give different answers.',
        },
      ],
      conclusion: 'Always check the principal range. The answer must lie in the correct interval for each inverse function.',
    },
    {
      id: 'ch3-004-ex2',
      title: 'Chain rule with inverse trig',
      problem: "\\text{Differentiate } f(x) = \\arctan(x^2).",
      steps: [
        {
          expression: "f'(x) = \\frac{1}{1+(x^2)^2} \\cdot \\frac{d}{dx}(x^2)",
          annotation: 'Chain rule: derivative of arctan is $1/(1+u^2)$ evaluated at the inner function, times the inner derivative.',
        },
        {
          expression: "= \\frac{1}{1+x^4} \\cdot 2x = \\frac{2x}{1+x^4}",
          annotation: 'Simplify. Note the denominator is $1+x^4$ not $1+x^2$ — the inner function was $x^2$, so it gets squared again.',
        },
      ],
      conclusion: 'Chain rule with inverse trig: apply $1/(1+u^2)$ or $1/\\sqrt{1-u^2}$ at the inner function, then multiply by the inner derivative.',
    },
    {
      id: 'ch3-004-ex3',
      title: 'Inverse trig antiderivative — completing the square first',
      problem: '\\text{Evaluate } \\displaystyle\\int \\frac{dx}{x^2 - 4x + 8}.',
      steps: [
        {
          expression: 'x^2 - 4x + 8 = (x-2)^2 + 4',
          annotation: 'Complete the square on the denominator. This converts it to the arctan standard form $u^2 + a^2$.',
        },
        {
          expression: '\\int \\frac{dx}{(x-2)^2 + 4}',
          annotation: 'Let $u = x-2$, $du = dx$. Then $a^2 = 4$, $a = 2$.',
        },
        {
          expression: '= \\frac{1}{2}\\arctan\\frac{x-2}{2} + C',
          annotation: 'Apply $\\int \\frac{du}{u^2+a^2} = \\frac{1}{a}\\arctan\\frac{u}{a} + C$ with $a=2$.',
        },
      ],
      conclusion: 'Completing the square converts a general quadratic denominator into the arctan standard form. This is the reverse path from the calculus bridge in the quadratics lesson.',
    },
  ],

  challenges: [
    {
      id: 'ch3-004-ch1',
      difficulty: 'medium',
      problem: "\\text{Differentiate } g(x) = x\\arcsin x + \\sqrt{1-x^2}.",
      hint: 'Product rule on the first term, chain rule on the second.',
      walkthrough: [
        {
          expression: "\\frac{d}{dx}[x\\arcsin x] = \\arcsin x + x \\cdot \\frac{1}{\\sqrt{1-x^2}}",
          annotation: 'Product rule: $u\'v + uv\'$ where $u=x$, $v=\\arcsin x$.',
        },
        {
          expression: "\\frac{d}{dx}[\\sqrt{1-x^2}] = \\frac{-x}{\\sqrt{1-x^2}}",
          annotation: 'Chain rule on the square root.',
        },
        {
          expression: "g'(x) = \\arcsin x + \\frac{x}{\\sqrt{1-x^2}} - \\frac{x}{\\sqrt{1-x^2}} = \\arcsin x",
          annotation: 'The two fractional terms cancel exactly. The derivative is simply $\\arcsin x$ — a hint that $x\\arcsin x + \\sqrt{1-x^2}$ is an antiderivative of $\\arcsin x$.',
        },
      ],
      answer: "g'(x) = \\arcsin x",
    },
    {
      id: 'ch3-004-ch2',
      difficulty: 'hard',
      problem: '\\text{Prove: } \\arctan x + \\arctan\\frac{1}{x} = \\frac{\\pi}{2} \\text{ for } x > 0.',
      hint: 'Differentiate the left side — if the derivative is zero, the expression is constant. Then find the constant by evaluating at a specific $x$.',
      walkthrough: [
        {
          expression: "\\frac{d}{dx}\\left[\\arctan x + \\arctan\\frac{1}{x}\\right] = \\frac{1}{1+x^2} + \\frac{1}{1+(1/x)^2} \\cdot \\left(-\\frac{1}{x^2}\\right)",
          annotation: 'Differentiate both terms. Chain rule on the second: derivative of $1/x$ is $-1/x^2$.',
        },
        {
          expression: '= \\frac{1}{1+x^2} + \\frac{x^2}{x^2+1} \\cdot \\left(-\\frac{1}{x^2}\\right) = \\frac{1}{1+x^2} - \\frac{1}{1+x^2} = 0',
          annotation: 'Simplify: $1/(1+(1/x)^2) = x^2/(x^2+1)$. The terms cancel exactly.',
        },
        {
          expression: '\\text{At } x=1: \\arctan 1 + \\arctan 1 = \\frac{\\pi}{4} + \\frac{\\pi}{4} = \\frac{\\pi}{2} \\qquad \\blacksquare',
          annotation: 'Zero derivative means constant. Evaluate at $x=1$ to find the constant is $\\pi/2$. The identity holds for all $x > 0$.',
        },
      ],
      answer: '\\arctan x + \\arctan(1/x) = \\pi/2 \\text{ for } x > 0.',
    },
  ],

  calcBridge: {
    teaser: 'The two integrals $\\int \\frac{dx}{\\sqrt{1-x^2}} = \\arcsin x + C$ and $\\int \\frac{dx}{1+x^2} = \\arctan x + C$ are among the most common antiderivatives in calculus. They appear in trig substitution problems, completing the square problems, and in the integral formulas for the arc length of a circle. You will use them constantly.',
    linkedLessons: ['trig-in-calculus', 'logarithm-relationships'],
  },
}
