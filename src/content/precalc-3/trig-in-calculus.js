export default {
  id: 'ch3-002',
  slug: 'trig-in-calculus',
  chapter: 'precalc-3',
  order: 9,
  title: 'Trig in Calculus: Knowing Which Identity to Reach For',
  subtitle: 'The pattern-matching layer between trig identities and calculus problems',
  tags: ['trig substitution', 'chain rule', 'integration', 'trig derivatives', 'strategy'],
  aliases: 'trig substitution integral sin cos chain rule calculus strategy which identity',

  hook: {
    question: 'You see $\\int \\sqrt{1 - x^2}\\, dx$. What do you do first — and why does $x = \\sin\\theta$ magically work?',
    realWorldContext: 'In signal processing, Fourier transforms decompose any signal into trig components. The integrals that arise are exactly the type covered here. In mechanics, the period of a pendulum involves an elliptic integral that requires trig substitution to approximate. Knowing the pattern lets you see the structure before you compute.',
    previewVisualizationId: 'TrigSubstitutionViz',
  },

  intuition: {
    prose: [
      'Trig shows up in calculus in three distinct situations, each with its own strategy. Recognizing which situation you\'re in is more than half the work.',
      'Situation 1: you\'re differentiating a trig function (possibly composed with something else). This is chain rule territory. The inner function tells you what to multiply by.',
      'Situation 2: you\'re integrating a power of $\\sin$ or $\\cos$. The exponent tells you the strategy: odd power → factor one out and use $u$-sub. Even power → power reduction identity first.',
      'Situation 3: you see $\\sqrt{a^2 - x^2}$, $\\sqrt{a^2 + x^2}$, or $\\sqrt{x^2 - a^2}$ under a radical. This screams trig substitution — the substitution is chosen so the Pythagorean identity eliminates the radical entirely.',
    ],
    callouts: [
      {
        type: 'proof-map',
        title: 'Three trig situations — three different moves',
        body: '\\text{Differentiating trig} \\to \\text{chain rule} \\qquad \\text{Integrating } \\sin^n/\\cos^n \\to \\text{parity strategy} \\qquad \\sqrt{a^2 \\pm x^2} \\to \\text{trig substitution}',
      },
      {
        type: 'insight',
        title: 'Why trig substitution works geometrically',
        body: '\\sqrt{1 - x^2} \\text{ is the height of a point on a unit circle at horizontal position } x. \\text{ Setting } x = \\sin\\theta \\text{ makes } \\sqrt{1-x^2} = \\cos\\theta \\text{ — a leg of the same right triangle.}',
      },
    ],
    visualizations: [
      {
        id: 'TrigSubstitutionViz',
        title: 'Why $x = \\sin\\theta$ Kills the Radical',
        mathBridge: 'The substitution $x = \\sin\\theta$ is not a trick — it is the unit circle. $\\sqrt{1 - x^2}$ is literally $\\cos\\theta$ in the same right triangle.',
        caption: 'Drag $x$ along the circle to see how $\\sqrt{1 - x^2}$ corresponds to $\\cos\\theta$.',
      },
      {
        id: 'VideoEmbed',
        title: 'Trigonometric Cofunctions',
        props: { url: 'https://www.youtube.com/embed/ajOhvRHcry8' },
      },
      {
        id: 'VideoEmbed',
        title: 'Trig Expressions & Finding Trig Functions Given another Trig Ratio',
        props: { url: 'https://www.youtube.com/embed/SvzAtriI_zo' },
      },
      {
        id: 'VideoEmbed',
        title: 'Trigonometric Functions of Any Angle',
        props: { url: 'https://www.youtube.com/embed/cNjzynK5QqE' },
      },
      {
        id: 'VideoEmbed',
        title: 'Right Triangle Trigonometry Part 1: Finding Missing Sides',
        props: { url: 'https://www.youtube.com/embed/pkjuVZUdcvo' },
      },
      {
        id: 'VideoEmbed',
        title: 'Right Triangle Trigonometry Part 2: Solving for Acute Angles',
        props: { url: 'https://www.youtube.com/embed/VmtcrpTRUyI' },
      },
      {
        id: 'ChainRuleCompositionViz',
        title: 'Two Function Machines — Inner and Outer',
        mathBridge: 'Pick any composition. See x flow through inner g then outer f. The chain rule assembles from the two derivatives.',
      },
      {
        id: 'ChainRuleZoomViz',
        title: 'Shrinking Δx — Why Derivatives Multiply',
        mathBridge: 'Shrink Δx to zero. Watch Δy/Δx converge to f\'(g(x))·g\'(x). The proof without a single limit symbol.',
      },
      {
        id: 'ChainRuleRatesViz',
        title: 'Rates Multiplying — Leibniz Notation',
        mathBridge: 'Two analogies: unit conversion chain and gear train. Both show why dy/dx = (dy/du)·(du/dx).',
      },
    ],
  },

  math: {
    prose: [
      'The derivatives of all six trig functions follow from $\\frac{d}{dx}\\sin x = \\cos x$ and the quotient rule. You should be able to derive $\\frac{d}{dx}\\tan x = \\sec^2 x$ on demand — it takes three lines.',
      'For integration strategy with $\\sin^m x\\cos^n x$: if either exponent is odd, save one copy of that function and convert the rest using $\\sin^2 + \\cos^2 = 1$, then $u$-substitute. If both are even, power reduce first.',
      'The trig substitution table is derived from three Pythagorean identities. You are not memorizing three arbitrary substitutions — you are choosing which Pythagorean identity will eliminate the square root.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Trig Derivatives (the six you must know cold)',
        body: '\\frac{d}{dx}\\sin x = \\cos x \\quad \\frac{d}{dx}\\cos x = -\\sin x \\quad \\frac{d}{dx}\\tan x = \\sec^2 x \\\\ \\frac{d}{dx}\\csc x = -\\csc x\\cot x \\quad \\frac{d}{dx}\\sec x = \\sec x\\tan x \\quad \\frac{d}{dx}\\cot x = -\\csc^2 x',
      },
      {
        type: 'theorem',
        title: 'Trig Substitution Table — read from the radical',
        body: '\\sqrt{a^2 - x^2} \\to x = a\\sin\\theta \\quad (\\text{uses } 1 - \\sin^2 = \\cos^2) \\\\ \\sqrt{a^2 + x^2} \\to x = a\\tan\\theta \\quad (\\text{uses } 1 + \\tan^2 = \\sec^2) \\\\ \\sqrt{x^2 - a^2} \\to x = a\\sec\\theta \\quad (\\text{uses } \\sec^2 - 1 = \\tan^2)',
      },
      {
        type: 'insight',
        title: 'Odd-power integration strategy',
        body: '\\int \\sin^5 x\\cos^2 x\\,dx: \\quad \\text{odd power of sin} \\Rightarrow \\text{factor out } \\sin x, \\text{ convert } \\sin^4 = (1-\\cos^2)^2, \\text{ let } u = \\cos x',
      },
      {
        type: 'warning',
        title: 'Don\'t forget $dx$ when substituting',
        body: 'x = a\\sin\\theta \\Rightarrow dx = a\\cos\\theta\\,d\\theta. \\text{ The } dx \\text{ replacement is essential and easy to drop under pressure.}',
      },
    ],
    visualizations: [
      {
        id: 'TrigIntegrationStrategyViz',
        title: 'Integration Strategy Decision Tree',
        mathBridge: 'Interactive flowchart: enter what your integrand looks like, see which strategy applies and why.',
        caption: 'The strategy is determined by the structure of the integrand, not the specific numbers.',
      },
      {
        id: 'ChainRuleLimitBridgeViz',
        title: 'The sin(x³) Proof — Step by Step',
        mathBridge: 'Walks through the exact textbook proof. Each step explained in plain English. Prerequisite drawers for every concept used.',
      },
      {
        id: 'ChainRulePracticeViz',
        title: 'Practice — 10 Forms of the Chain Rule',
        mathBridge: '10 different compositions covering every form you will encounter. Reveal steps one at a time.',
      },
    ],
  },

  rigor: {
    title: 'Full Worked Trig Substitution: $\\int \\sqrt{1 - x^2}\\, dx$',
    prose: [
      'This is the area under a semicircle — it should equal $\\frac{\\pi}{4}$ over $[0,1]$. We\'ll verify that too.',
    ],
    visualizationId: 'TrigSubstitutionViz',
    proofSteps: [
      {
        expression: '\\text{Radical: } \\sqrt{1 - x^2} \\Rightarrow \\text{form } \\sqrt{a^2 - x^2} \\text{ with } a=1 \\Rightarrow \\text{substitute } x = \\sin\\theta',
        annotation: 'Pattern match: $\\sqrt{a^2 - x^2}$ form → use $x = a\\sin\\theta$. This is the only decision you need to make.',
      },
      {
        expression: 'dx = \\cos\\theta\\,d\\theta \\qquad \\sqrt{1 - x^2} = \\sqrt{1 - \\sin^2\\theta} = \\sqrt{\\cos^2\\theta} = \\cos\\theta',
        annotation: 'Compute $dx$ and simplify the radical. The Pythagorean identity $1 - \\sin^2\\theta = \\cos^2\\theta$ kills the square root. This is exactly why we chose this substitution.',
      },
      {
        expression: '\\int \\sqrt{1 - x^2}\\,dx = \\int \\cos\\theta \\cdot \\cos\\theta\\,d\\theta = \\int \\cos^2\\theta\\,d\\theta',
        annotation: 'Substitute everything. The ugly radical is gone — we have a clean trig integral.',
      },
      {
        expression: '\\int \\cos^2\\theta\\,d\\theta = \\int \\frac{1 + \\cos 2\\theta}{2}\\,d\\theta',
        annotation: 'Both exponents are even — apply power reduction to $\\cos^2\\theta$.',
      },
      {
        expression: '= \\frac{\\theta}{2} + \\frac{\\sin 2\\theta}{4} + C',
        annotation: 'Integrate term by term.',
      },
      {
        expression: '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta = 2x\\sqrt{1-x^2}',
        annotation: 'Back-substitute: $\\sin\\theta = x$, $\\cos\\theta = \\sqrt{1-x^2}$, $\\theta = \\arcsin x$.',
      },
      {
        expression: '\\int \\sqrt{1-x^2}\\,dx = \\frac{\\arcsin x}{2} + \\frac{x\\sqrt{1-x^2}}{2} + C',
        annotation: 'Final answer. Evaluate from 0 to 1: $\\frac{\\pi/2}{2} - 0 = \\frac{\\pi}{4}$ — exactly the area of a quarter circle. ✓',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-002-ex1',
      title: 'Chain Rule with Trig: $\\frac{d}{dx}\\sin(x^3)$',
      problem: "\\text{Differentiate } f(x) = \\sin(x^3).",
      steps: [
        {
          expression: "f'(x) = \\cos(\\underbrace{x^3}_{\\text{inner}}) \\cdot \\frac{d}{dx}(x^3)",
          annotation: 'Chain rule: derivative of outer (sin → cos) evaluated at inner, times derivative of inner.',
        },
        {
          expression: "= 3x^2\\cos(x^3)",
          annotation: 'Power rule on the inner. Notice the argument of cos stays $x^3$ — never simplify it away.',
        },
      ],
      conclusion: 'Chain rule with trig: differentiate the trig function (sin→cos, cos→−sin etc.), keep the inner function as the argument, then multiply by the inner derivative.',
    },
    {
      id: 'ch3-002-ex2',
      title: 'Odd Power Strategy: $\\int \\sin^3 x\\, dx$',
      problem: '\\text{Evaluate } \\int \\sin^3 x\\, dx.',
      steps: [
        {
          expression: '\\int \\sin^3 x\\,dx = \\int \\sin^2 x \\cdot \\sin x\\,dx',
          annotation: 'Odd power of sin: factor off one $\\sin x$ to pair with $dx$ for the substitution.',
        },
        {
          expression: '= \\int (1 - \\cos^2 x)\\sin x\\,dx',
          annotation: 'Convert $\\sin^2 x = 1 - \\cos^2 x$. Now let $u = \\cos x$, $du = -\\sin x\\,dx$.',
        },
        {
          expression: '= -\\int (1 - u^2)\\,du = -u + \\frac{u^3}{3} + C',
          annotation: 'Substitute. Clean polynomial integral.',
        },
        {
          expression: '= -\\cos x + \\frac{\\cos^3 x}{3} + C',
          annotation: 'Back-substitute $u = \\cos x$.',
        },
      ],
      conclusion: 'Odd power → peel one off, convert the rest with Pythagorean identity, $u$-substitute. Works every time.',
    },
    {
      id: 'ch3-002-ex3',
      title: 'Trig Sub with $\\sqrt{x^2 + 4}$',
      problem: '\\text{Evaluate } \\int \\frac{dx}{\\sqrt{x^2 + 4}}.',
      steps: [
        {
          expression: '\\sqrt{x^2 + 4} = \\sqrt{4 + x^2} \\Rightarrow \\text{form } \\sqrt{a^2 + x^2},\\ a=2 \\Rightarrow x = 2\\tan\\theta',
          annotation: 'Pattern: $\\sqrt{a^2 + x^2}$ → use $x = a\\tan\\theta$. The identity $1 + \\tan^2 = \\sec^2$ will eliminate the radical.',
        },
        {
          expression: 'dx = 2\\sec^2\\theta\\,d\\theta \\qquad \\sqrt{x^2+4} = \\sqrt{4\\tan^2\\theta + 4} = 2\\sec\\theta',
          annotation: 'Compute $dx$ and simplify the radical using $1 + \\tan^2\\theta = \\sec^2\\theta$.',
        },
        {
          expression: '\\int \\frac{2\\sec^2\\theta\\,d\\theta}{2\\sec\\theta} = \\int \\sec\\theta\\,d\\theta = \\ln|\\sec\\theta + \\tan\\theta| + C',
          annotation: 'Simplify and integrate. $\\int \\sec\\theta\\,d\\theta$ is a standard result.',
        },
        {
          expression: '= \\ln\\left|\\frac{\\sqrt{x^2+4}}{2} + \\frac{x}{2}\\right| + C = \\ln\\bigl|\\sqrt{x^2+4} + x\\bigr| + C',
          annotation: 'Back-substitute: $\\tan\\theta = x/2$ so $\\sec\\theta = \\sqrt{x^2+4}/2$. Absorb the constant $\\ln(1/2)$ into $C$.',
        },
      ],
      conclusion: 'Pattern recognition is everything: see which radical form you have, choose the substitution, and the Pythagorean identity does the rest.',
    },
  ],

  challenges: [
    {
      id: 'ch3-002-ch1',
      difficulty: 'medium',
      problem: "\\text{Differentiate } g(x) = \\tan^2(3x).",
      hint: 'This is a chain rule twice — power rule on the outer square, then chain through tan, then chain through 3x.',
      walkthrough: [
        {
          expression: "g(x) = [\\tan(3x)]^2 \\Rightarrow g'(x) = 2\\tan(3x) \\cdot \\frac{d}{dx}[\\tan(3x)]",
          annotation: 'Power rule on the outer square: bring down the 2, reduce the exponent.',
        },
        {
          expression: '\\frac{d}{dx}[\\tan(3x)] = \\sec^2(3x) \\cdot 3',
          annotation: 'Chain rule again: derivative of tan is $\\sec^2$, times derivative of inner $3x$.',
        },
        {
          expression: "g'(x) = 6\\tan(3x)\\sec^2(3x)",
          annotation: 'Combine. This pattern — trig squared composed with a linear function — appears constantly.',
        },
      ],
      answer: "g'(x) = 6\\tan(3x)\\sec^2(3x)",
    },
    {
      id: 'ch3-002-ch2',
      difficulty: 'hard',
      problem: '\\text{Evaluate } \\int \\sin^2 x \\cos^3 x\\, dx.',
      hint: 'cos has an odd power. Factor one cos off, convert the remaining $\\cos^2$ using Pythagorean identity, let $u = \\sin x$.',
      walkthrough: [
        {
          expression: '\\int \\sin^2 x \\cdot \\cos^2 x \\cdot \\cos x\\, dx',
          annotation: 'Factor off one $\\cos x$ to sit with $dx$.',
        },
        {
          expression: '= \\int \\sin^2 x (1 - \\sin^2 x) \\cos x\\, dx',
          annotation: 'Replace $\\cos^2 x = 1 - \\sin^2 x$.',
        },
        {
          expression: 'u = \\sin x,\\quad du = \\cos x\\,dx \\Rightarrow \\int u^2(1 - u^2)\\,du',
          annotation: 'Let $u = \\sin x$. The $\\cos x\\, dx$ is absorbed as $du$.',
        },
        {
          expression: '= \\int (u^2 - u^4)\\,du = \\frac{u^3}{3} - \\frac{u^5}{5} + C = \\frac{\\sin^3 x}{3} - \\frac{\\sin^5 x}{5} + C',
          annotation: 'Integrate and back-substitute.',
        },
      ],
      answer: '\\dfrac{\\sin^3 x}{3} - \\dfrac{\\sin^5 x}{5} + C',
    },
  ],
}
