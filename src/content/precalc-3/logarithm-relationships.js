export default {
  id: 'ch3-003',
  slug: 'logarithm-relationships',
  chapter: 'precalc-3',
  order: 10,
  title: 'Logarithms: Why $\\ln$ Is Everywhere in Calculus',
  subtitle: 'Log laws from geometry, the natural log as an area, and why $e$ is the right base',
  tags: ['logarithms', 'natural log', 'ln', 'exponentials', 'log laws', 'integration'],
  aliases: 'ln log natural log e exponential log rules calculus integral 1/x',

  hook: {
    question: 'Why does $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$? What does area under a curve have to do with logarithms?',
    realWorldContext: 'The natural log is not just a base-$e$ curiosity. It appears in entropy, information theory, population growth models, RC circuit discharge, radioactive decay, and every integral involving $1/x$ or rational functions. Understanding why $\\ln$ is natural — not just that it is — changes how you recognize when to use it.',
    previewVisualizationId: 'LogAsAreaViz',
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: ['A logarithm answers the question: what exponent do I need? $\\log_b(x) = y$ means $b^y = x$. But this framing hides why logarithms are useful in calculus.'] },
      { type: 'viz', id: 'VideoEmbed', title: 'Logarithm Introduction', props: { url: 'https://www.youtube.com/embed/UpUjJQGSlDY' } },
      { type: 'prose', paragraphs: ['The deeper view: $\\ln(x)$ is defined as the area under the curve $y = 1/t$ from $t=1$ to $t=x$. This is not a coincidence of notation — it is the actual definition that makes $\\frac{d}{dx}\\ln x = \\frac{1}{x}$ obvious rather than mysterious.'] },
      { type: 'callout', callout: { type: 'definition', title: 'The area definition of $\\ln$', body: '\\ln(x) \\overset{\\text{def}}{=} \\int_1^x \\frac{1}{t}\\,dt \\qquad (x > 0)' } },
      { type: 'callout', callout: { type: 'insight', title: 'Why $e$ is the natural base', body: 'e \\text{ is defined as the unique number where } \\int_1^e \\frac{1}{t}\\,dt = 1. \\text{ In other words, the area from 1 to } e \\text{ under } 1/t \\text{ is exactly 1.}' } },
      { type: 'viz', id: 'LogAsAreaViz', title: '$\\ln(x)$ as Area Under $1/t$',
        mathBridge: 'Drag $x$ and watch the shaded area change. The area equals $\\ln(x)$ exactly — this is the definition, not a fact to memorize.',
        caption: "When $x = e \\approx 2.718$, the area is exactly 1. That's what makes $e$ special.",
      },
      { type: 'callout', callout: { type: 'insight', title: 'Why this immediately gives us the derivative', body: '\\frac{d}{dx}\\ln(x) = \\frac{d}{dx}\\int_1^x \\frac{1}{t}\\,dt = \\frac{1}{x} \\qquad \\text{(Fundamental Theorem of Calculus)}' } },
      { type: 'prose', paragraphs: ['This area definition also makes the log laws geometric. $\\ln(ab) = \\ln(a) + \\ln(b)$ because the area from 1 to $ab$ equals the area from 1 to $a$ plus a scaled copy of the area from 1 to $b$.'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Graphing Logarithms',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/GT6AYjgoFco', title: 'Graphing Logarithms' },
          { url: 'https://www.youtube.com/embed/Y-yonLqEdzU', title: 'Graphing Log Functions with Transformations' },
        ]},
      },
    ],
  },

  math: {
    blocks: [
      { type: 'prose', paragraphs: ['The log laws are not rules to memorize separately — they follow from the exponent laws applied to $b^{\\log_b x} = x$. If you know why $b^m \\cdot b^n = b^{m+n}$, you know why $\\log(ab) = \\log a + \\log b$.'] },
      { type: 'callout', callout: { type: 'theorem', title: 'Log Laws — derived, not memorized', body: '\\ln(ab) = \\ln a + \\ln b \\qquad \\ln\\frac{a}{b} = \\ln a - \\ln b \\qquad \\ln(a^r) = r\\ln a' } },
      { type: 'viz', id: 'LogLawsViz', title: 'Log Laws as Area Addition',
        mathBridge: 'See why $\\ln(ab) = \\ln(a) + \\ln(b)$ is an area decomposition, not an algebraic coincidence.',
        caption: 'The area from 1 to $ab$ splits cleanly into two pieces corresponding to $\\ln a$ and $\\ln b$.',
      },
      { type: 'viz', id: 'VideoCarousel', title: 'Log Laws: Expand, Condense & Change of Base',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/e4NAYp1EvzU', title: 'Expanding Logarithms' },
          { url: 'https://www.youtube.com/embed/EmYqoq0-1H0', title: 'Condensing Logarithms' },
          { url: 'https://www.youtube.com/embed/-YdDWWokOqQ', title: 'Change of Base Formula' },
        ]},
      },
      { type: 'callout', callout: { type: 'theorem', title: 'Change of Base', body: '\\log_b(x) = \\frac{\\ln x}{\\ln b} \\qquad \\text{All logs are just scaled versions of } \\ln.' } },
      { type: 'prose', paragraphs: ['In calculus, the chain rule version of $\\frac{d}{dx}\\ln x = \\frac{1}{x}$ is the one you actually use: $\\frac{d}{dx}\\ln(f(x)) = \\frac{f\'(x)}{f(x)}$. This is called logarithmic differentiation and it\'s powerful.'] },
      { type: 'callout', callout: { type: 'theorem', title: 'Calculus with $\\ln$ and $e^x$', body: '\\frac{d}{dx}\\ln x = \\frac{1}{x} \\qquad \\frac{d}{dx}\\ln(f(x)) = \\frac{f\'(x)}{f(x)} \\qquad \\frac{d}{dx}e^x = e^x \\qquad \\int \\frac{1}{x}\\,dx = \\ln|x| + C' } },
      { type: 'prose', paragraphs: ['The integral $\\int \\frac{1}{x}\\,dx = \\ln|x| + C$ is the most important antiderivative after the power rule — but it\'s also the one that has an exception the power rule can\'t handle: $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}$ breaks at $n = -1$. The natural log fills exactly that gap.'] },
      { type: 'callout', callout: { type: 'warning', title: 'The absolute value matters', body: '\\int \\frac{1}{x}\\,dx = \\ln|x| + C, \\text{ not } \\ln(x) + C. \\text{ The domain of } \\ln \\text{ is } x > 0, \\text{ but } 1/x \\text{ is defined for } x < 0 \\text{ too.}' } },
      { type: 'callout', callout: { type: 'insight', title: 'The $n = -1$ gap in the power rule', body: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C \\text{ for } n \\neq -1. \\quad \\text{When } n = -1\\text{: } \\int x^{-1}\\,dx = \\ln|x| + C.' } },
      { type: 'prose', paragraphs: ['Solving logarithmic and exponential equations: isolate the log or exponential, apply the inverse operation, and check for extraneous solutions (log requires positive argument).'] },
      { type: 'viz', id: 'VideoCarousel', title: 'Solving Logarithmic Equations',
        props: { videos: [
          { url: 'https://www.youtube.com/embed/fO06womr41k', title: 'Solving Log Equations Pt 1' },
          { url: 'https://www.youtube.com/embed/NRjfc_u-vyQ', title: 'Solving Log Equations Pt 2' },
          { url: 'https://www.youtube.com/embed/UZS2__IgFuw', title: 'Solving Log Equations Pt 3' },
          { url: 'https://www.youtube.com/embed/KNS75J5XpnE', title: 'Log Equations with Different Bases' },
          { url: 'https://www.youtube.com/embed/Hm2DV0iruJk', title: 'Solving Natural Exponential Equations' },
        ]},
      },
    ],
  },

  rigor: {
    title: 'Proving $\\ln(ab) = \\ln a + \\ln b$ from the area definition',
    prose: [
      'With $\\ln$ defined as area under $1/t$, the log laws become geometric facts. Here we prove the product rule for logs rigorously.',
    ],
    visualizationId: 'LogLawsViz',
    proofSteps: [
      {
        expression: '\\ln(ab) = \\int_1^{ab} \\frac{1}{t}\\,dt',
        annotation: 'By definition of $\\ln$ as area.',
      },
      {
        expression: '= \\int_1^{a} \\frac{1}{t}\\,dt + \\int_a^{ab} \\frac{1}{t}\\,dt',
        annotation: 'Split the integral at $t = a$. Additivity of integrals.',
      },
      {
        expression: '\\int_a^{ab} \\frac{1}{t}\\,dt \\xrightarrow{t = au} \\int_1^{b} \\frac{1}{au} \\cdot a\\,du = \\int_1^b \\frac{1}{u}\\,du = \\ln b',
        annotation: 'Substitute $t = au$, $dt = a\\,du$. The $a$\'s cancel — the integral from $a$ to $ab$ is identical in shape to the integral from 1 to $b$.',
      },
      {
        expression: '\\ln(ab) = \\int_1^a \\frac{1}{t}\\,dt + \\ln b = \\ln a + \\ln b \\qquad \\blacksquare',
        annotation: 'Reassemble. The product rule for logs is really just a substitution inside a definite integral.',
      },
    ],
  },

  examples: [
    {
      id: 'ch3-003-ex1',
      title: 'Logarithmic Differentiation — when the exponent has a variable',
      problem: "\\text{Differentiate } f(x) = x^x.",
      steps: [
        {
          expression: '\\ln(f(x)) = \\ln(x^x) = x\\ln x',
          annotation: 'Take $\\ln$ of both sides. Use $\\ln(a^r) = r\\ln a$ to bring the exponent down. Now it\'s a product, not an exponential — much easier to differentiate.',
        },
        {
          expression: '\\frac{f\'(x)}{f(x)} = \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1',
          annotation: 'Differentiate both sides. Left side uses $\\frac{d}{dx}\\ln(f) = f\'/f$. Right side uses product rule.',
        },
        {
          expression: "f'(x) = f(x)(\\ln x + 1) = x^x(\\ln x + 1)",
          annotation: 'Multiply both sides by $f(x) = x^x$. This technique works for any function where the variable appears in the exponent.',
        },
      ],
      conclusion: 'When the exponent contains the variable, take $\\ln$ of both sides first. This converts the exponential into a product and makes differentiation possible.',
    },
    {
      id: 'ch3-003-ex2',
      title: 'Integrating $\\frac{f\'(x)}{f(x)}$ — recognizing the log form',
      problem: "\\text{Evaluate } \\int \\frac{2x}{x^2 + 1}\\,dx.",
      steps: [
        {
          expression: '\\text{Numerator is } 2x = \\frac{d}{dx}(x^2 + 1)',
          annotation: 'Check: is the numerator the derivative of the denominator? Yes. This is the $\\frac{f\'}{f}$ pattern.',
        },
        {
          expression: 'u = x^2 + 1,\\quad du = 2x\\,dx',
          annotation: 'Let $u$ equal the denominator. The numerator $2x\\,dx$ becomes $du$ exactly.',
        },
        {
          expression: '\\int \\frac{du}{u} = \\ln|u| + C = \\ln|x^2 + 1| + C = \\ln(x^2+1) + C',
          annotation: 'Standard $\\int 1/u\\,du = \\ln|u|$. Since $x^2+1 > 0$ always, we drop the absolute value.',
        },
      ],
      conclusion: 'Any time the numerator is (close to) the derivative of the denominator, $\\ln$ is the antiderivative. Check for this pattern before trying anything else in rational integrals.',
    },
    {
      id: 'ch3-003-ex3',
      title: 'Expanding with log laws before differentiating',
      problem: "\\text{Differentiate } y = \\ln\\!\\left(\\frac{x^3\\sqrt{x+1}}{(2x-1)^4}\\right).",
      steps: [
        {
          expression: 'y = 3\\ln x + \\tfrac{1}{2}\\ln(x+1) - 4\\ln(2x-1)',
          annotation: 'Apply log laws to break apart the single log: product → sum, quotient → difference, power → coefficient. Always do this before differentiating a complex log.',
        },
        {
          expression: "y' = \\frac{3}{x} + \\frac{1}{2} \\cdot \\frac{1}{x+1} - 4 \\cdot \\frac{2}{2x-1}",
          annotation: 'Differentiate term by term. Each term is a simple $\\frac{d}{dx}\\ln(u) = u\'/u$.',
        },
        {
          expression: "y' = \\frac{3}{x} + \\frac{1}{2(x+1)} - \\frac{8}{2x-1}",
          annotation: 'Simplify. Without log expansion, this would have required the quotient rule and product rule on a complex expression.',
        },
      ],
      conclusion: 'Always expand $\\ln$ using log laws before differentiating a product/quotient/power inside a log. It converts one hard problem into several easy ones.',
    },
  ],

  challenges: [
    {
      id: 'ch3-003-ch1',
      difficulty: 'medium',
      problem: "\\text{Differentiate } f(x) = \\ln(\\sin x).",
      hint: 'Chain rule: $\\frac{d}{dx}\\ln(u) = \\frac{u\'}{u}$. What is $u$ here?',
      walkthrough: [
        {
          expression: "f'(x) = \\frac{1}{\\sin x} \\cdot \\cos x",
          annotation: 'Chain rule: outer is $\\ln$ (derivative $1/u$), inner is $\\sin x$ (derivative $\\cos x$).',
        },
        {
          expression: "= \\frac{\\cos x}{\\sin x} = \\cot x",
          annotation: 'Simplify. This result is the antiderivative of $\\cot x$: $\\int \\cot x\\,dx = \\ln|\\sin x| + C$.',
        },
      ],
      answer: "f'(x) = \\cot x",
    },
    {
      id: 'ch3-003-ch2',
      difficulty: 'hard',
      problem: '\\text{Evaluate } \\int_1^e \\frac{(\\ln x)^2}{x}\\, dx.',
      hint: 'Spot the $f\'/f$ or let $u = \\ln x$. What is $du$?',
      walkthrough: [
        {
          expression: 'u = \\ln x,\\quad du = \\frac{1}{x}\\,dx',
          annotation: 'Let $u = \\ln x$. Then $du = (1/x)\\,dx$ — which is exactly what appears in the integrand.',
        },
        {
          expression: 'x=1 \\Rightarrow u=0;\\quad x=e \\Rightarrow u=1 \\qquad \\int_0^1 u^2\\,du',
          annotation: 'Change limits using $u = \\ln x$. Clean power integral.',
        },
        {
          expression: '\\bigl[\\tfrac{u^3}{3}\\bigr]_0^1 = \\frac{1}{3}',
          annotation: 'Evaluate. The original definite integral equals $\\frac{1}{3}$.',
        },
      ],
      answer: '\\dfrac{1}{3}',
    },
  ],
}
