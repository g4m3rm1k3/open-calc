// FILE: src/content/chapter-2/04-exp-log-derivatives.js
export default {
  id: 'ch2-004',
  slug: 'exp-log-derivatives',
  chapter: 2,
  order: 4,
  title: 'Derivatives of Exponential and Logarithmic Functions',
  subtitle: 'The function that equals its own derivative G현 and the logarithm that unlocks it',
  tags: ['exponential derivative', 'logarithm derivative', 'natural log', 'e^x', 'ln x', 'logarithmic differentiation', 'a^x'],
  aliases: 'section 3.9 derivative exponential function derivative logarithmic function formal proof e^x ln x logarithmic differentiation',

  hook: {
    question: 'Bacteria in a culture double every hour. A radioactive isotope loses half its mass every 5,730 years. A savings account grows at 5% per year compounded continuously. Why do all three follow the same mathematical pattern, and what does calculus tell us is special about them?',
    realWorldContext: 'Population growth, radioactive decay, cooling and heating, compound interest, the spread of disease, the absorption of drugs in the bloodstream G현 all of these phenomena share one defining property: the rate of change is proportional to the current value. If you have more money, you earn more interest. If you have more bacteria, more bacteria are multiplying. If you have more radioactive atoms, more are decaying. This proportionality law leads directly to exponential functions, and the magical number e = 2.71828... is the one base for which the function literally equals its own derivative. This lesson explores why that is true and how to differentiate every exponential and logarithmic function.',
    previewVisualizationId: 'ExponentialSlopeAtZero',
  },

  intuition: {
    prose: [
      'Let\'s understand e by starting from scratch. Consider the function b^x for different bases b. At x = 0, every such function equals 1 (since b\u2070 = 1). But what is the SLOPE of b^x at x = 0? For b = 2, the slope at 0 is approximately 0.693. For b = 3, the slope at 0 is approximately 1.099. As b increases from 2 to 3, the slope at x = 0 increases from 0.693 to 1.099. Somewhere between 2 and 3, the slope at x = 0 must equal exactly 1. That special base is called e. Numerically, e \u2248 2.71828...',
      'This definition G현 e is the base for which the slope of b^x at x = 0 is exactly 1 G현 has a stunning consequence. It means that for the function e^x, the derivative at x = 0 is exactly 1. But now we can use the law of exponents to compute the derivative at any other point x. We will see that d/dx[e^x] = e^x: the function e^x equals its own derivative everywhere, not just at x = 0.',
      'Why is this remarkable? It means that at every point, the slope of e^x equals its own height. The taller the curve is, the steeper it rises. The curve catches up to its own slope, then the increased slope makes it grow even faster, creating an accelerating feedback loop. This is why exponential growth "explodes" G현 it grows proportional to itself.',
      'Now for the natural logarithm. The natural log ln(x) is defined as the inverse of e^x: if e^y = x, then y = ln(x). Since e^x has derivative e^x, and ln(x) is its inverse function, we can find the derivative of ln(x) using implicit differentiation. Starting from e^y = x, differentiate both sides with respect to x: the right side gives 1, and the left side gives e^y \u00b7 dy/dx (by the chain rule, since y is a function of x). So e^y \u00b7 dy/dx = 1, giving dy/dx = 1/e^y = 1/x (since e^y = x). The derivative of ln(x) is 1/x.',
      'For other bases: if we want to differentiate a^x for any positive base a \u2260 1, we use the conversion a^x = e^(x ln a). This rewrites any exponential in base e, allowing us to use the chain rule: d/dx[e^(x ln a)] = e^(x ln a) \u00b7 ln(a) = a^x \u00b7 ln(a). The natural log of the base appears as a multiplicative factor.',
      'Logarithmic differentiation is a powerful technique that uses logarithms to convert hard differentiation problems into easier ones. The key idea: if y = f(x), take ln of both sides to get ln(y) = ln(f(x)), then differentiate implicitly. This works because the chain rule on the left gives (1/y)\u00b7(dy/dx), and we can solve for dy/dx = y\u00b7(d/dx)[ln(f(x))]. This technique is especially useful for (1) functions where the variable appears in both the base and exponent, like y = x^x, and (2) products of many functions, where logarithms convert multiplication into addition.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'e is Defined by This Slope Condition',
        body: "e \\text{ is the unique number such that } \\lim_{h\\to 0}\\frac{e^h-1}{h} = 1",
      },
      {
        type: 'theorem',
        title: 'The Self-Referential Property',
        body: '\\frac{d}{dx}[e^x] = e^x \\qquad \\text{(the function equals its own derivative)}',
      },
      {
        type: 'insight',
        title: 'Inverse Function Argument',
        body: "e^y = x \\xrightarrow{\\text{diff. both sides}} e^y \\frac{dy}{dx} = 1 \\implies \\frac{dy}{dx} = \\frac{1}{e^y} = \\frac{1}{x}",
      },
    ],
    visualizationId: 'ExponentialSlopeAtZero',
    visualizationProps: {
      showSlopeAtZeroForVariousBases: true,
      highlightBaseE: true,
    },
  },

  math: {
    prose: [
      'We state all four exponential and logarithmic derivative formulas. Each extends to compositions via the chain rule.',
      'The formula d/dx[a^x] = a^x \u00b7 ln(a) shows why e is so special: when a = e, ln(e) = 1, so the formula gives d/dx[e^x] = e^x \u00b7 1 = e^x. For any other base, there is an extra factor of ln(a).',
      'Similarly, d/dx[log_a(x)] = 1/(x ln a). When a = e, ln(e) = 1 and we recover d/dx[ln x] = 1/x.',
      'Logarithmic differentiation is the technique of applying ln to both sides of y = f(x) before differentiating. It works because (1) logarithms convert products to sums and powers to multiples, making the differentiation easier, and (2) the chain rule on ln(y) gives (1/y)(dy/dx), which we solve for dy/dx at the end.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Four Core Formulas',
        body: "\\begin{aligned} \\frac{d}{dx}[e^x] &= e^x \\\\ \\frac{d}{dx}[\\ln x] &= \\frac{1}{x} \\quad (x > 0) \\\\ \\frac{d}{dx}[a^x] &= a^x \\ln a \\\\ \\frac{d}{dx}[\\log_a x] &= \\frac{1}{x \\ln a} \\end{aligned}",
      },
      {
        type: 'theorem',
        title: 'All Four with Chain Rule',
        body: "\\begin{aligned} \\frac{d}{dx}[e^u] &= e^u \\cdot u' \\\\ \\frac{d}{dx}[\\ln u] &= \\frac{u'}{u} \\\\ \\frac{d}{dx}[a^u] &= a^u (\\ln a)\\, u' \\\\ \\frac{d}{dx}[\\log_a u] &= \\frac{u'}{u \\ln a} \\end{aligned}",
      },
      {
        type: 'technique',
        title: 'Logarithmic Differentiation Procedure',
        body: "y = f(x) \\implies \\ln y = \\ln f(x) \\implies \\frac{1}{y}\\frac{dy}{dx} = \\frac{d}{dx}[\\ln f(x)] \\implies \\frac{dy}{dx} = y \\cdot \\frac{d}{dx}[\\ln f(x)]",
      },
    ],
    visualizationId: 'ExponentialSlopeAtZero',
    visualizationProps: {
      showBothFunctions: true,
      showSlopeComparison: true,
    },
  },

  rigor: {
    prose: [
      'PROOF that d/dx[e^x] = e^x: By the limit definition, d/dx[e^x] = lim(h\u21920) [e^(x+h) - e^x] / h. Using the exponent law e^(x+h) = e^x \u00b7 e^h, factor out e^x: = lim(h\u21920) e^x \u00b7 [e^h - 1] / h = e^x \u00b7 lim(h\u21920) (e^h - 1)/h. By the defining property of e (or equivalently, by the definition of e as lim(n\u2192\u221e)(1+1/n)\u207f), the limit lim(h\u21920) (e^h - 1)/h = 1. Therefore d/dx[e^x] = e^x \u00b7 1 = e^x.',
      'PROOF that d/dx[ln x] = 1/x using implicit differentiation: Let y = ln x. By definition of the natural log, this means e^y = x. Differentiate both sides with respect to x: d/dx[e^y] = d/dx[x]. The left side requires the chain rule since y depends on x: d/dx[e^y] = e^y \u00b7 dy/dx. The right side is just 1. So e^y \u00b7 dy/dx = 1, giving dy/dx = 1/e^y. Since e^y = x, this simplifies to dy/dx = 1/x. Therefore d/dx[ln x] = 1/x.',
      'For x < 0, we have d/dx[ln|x|] = 1/x as well (the absolute value does not change the derivative for negative x, since ln|x| = ln(-x) for x < 0, and d/dx[ln(-x)] = (1/(-x))\u00b7(-1) = 1/x).',
      'WHY LOGARITHMIC DIFFERENTIATION WORKS: If y = f(x) and f(x) > 0, then ln(y) = ln(f(x)). Differentiating both sides with respect to x and applying the chain rule on the left: d/dx[ln y] = (1/y)\u00b7(dy/dx) and d/dx[ln(f(x))] = f\'(x)/f(x). Setting equal: (1/y)(dy/dx) = f\'(x)/f(x), so dy/dx = y\u00b7f\'(x)/f(x) = f(x)\u00b7f\'(x)/f(x) = f\'(x). This is consistent but doesn\'t help for simple cases. The technique\'s power comes when f(x) involves products, quotients, and powers, because ln converts these into sums, differences, and multiples, which are much easier to differentiate.',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Proof: d/dx[e^x] = e^x',
        body: "\\frac{d}{dx}[e^x] = \\lim_{h\\to 0}\\frac{e^{x+h}-e^x}{h} = e^x \\lim_{h\\to 0}\\frac{e^h-1}{h} = e^x \\cdot 1 = e^x",
      },
      {
        type: 'proof',
        title: 'Proof: d/dx[ln x] = 1/x via Implicit Differentiation',
        body: "y = \\ln x \\implies e^y = x \\implies e^y \\frac{dy}{dx} = 1 \\implies \\frac{dy}{dx} = \\frac{1}{e^y} = \\frac{1}{x}",
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ch2-004-ex1',
      title: 'Exponential with Chain Rule',
      problem: "f(x) = e^{3x^2}. \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = e^u, \\quad \\text{Inner: } u = 3x^2",
          annotation: 'Identify the composition: the outer function is e^u and the inner is 3x\u00b2.',
        },
        {
          expression: "F'(u) = e^u, \\quad u' = 6x",
          annotation: 'The derivative of e^u is e^u (e^x is its own derivative). The inner derivative of 3x\u00b2 is 6x.',
        },
        {
          expression: "f'(x) = e^{3x^2} \\cdot 6x = 6x\\,e^{3x^2}",
          annotation: 'Chain rule: e^u evaluated at u=3x\u00b2 gives e^(3x\u00b2), times the inner derivative 6x.',
        },
      ],
      conclusion: 'f\'(x) = 6x e^(3x\u00b2). The key here is that the chain rule "brings out" the derivative of the exponent as a multiplicative factor, while e^(3x\u00b2) itself remains unchanged.',
    },
    {
      id: 'ch2-004-ex2',
      title: 'Product Rule with e^x',
      problem: "f(x) = x^2 e^x. \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Let } u = x^2, \\; v = e^x",
          annotation: 'Identify the two factors for the product rule.',
        },
        {
          expression: "u' = 2x, \\quad v' = e^x",
          annotation: 'Differentiate each factor. d/dx[x\u00b2] = 2x, and d/dx[e^x] = e^x (its own derivative).',
        },
        {
          expression: "f'(x) = u'v + uv' = 2x \\cdot e^x + x^2 \\cdot e^x",
          annotation: 'Apply the product rule.',
        },
        {
          expression: "= e^x(2x + x^2) = x e^x(2 + x)",
          annotation: 'Factor out e^x from both terms, then factor out x from the remaining expression.',
        },
      ],
      conclusion: 'f\'(x) = xe^x(x+2). The factored form immediately shows that f\'(x) = 0 when x = 0 or x = -2, the critical points of this function.',
    },
    {
      id: 'ch2-004-ex3',
      title: 'Natural Log with Chain Rule',
      problem: "f(x) = \\ln(x^2+1). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\ln u, \\quad \\text{Inner: } u = x^2 + 1",
          annotation: 'Identify the composition. The outer is the natural log; the inner is x\u00b2+1.',
        },
        {
          expression: "F'(u) = \\frac{1}{u}, \\quad u' = 2x",
          annotation: 'The derivative of ln(u) is 1/u. The inner derivative is 2x.',
        },
        {
          expression: "f'(x) = \\frac{1}{x^2+1} \\cdot 2x = \\frac{2x}{x^2+1}",
          annotation: 'Chain rule: (1/u) evaluated at u=x\u00b2+1 gives 1/(x\u00b2+1), times the inner derivative 2x. This is the "u-prime over u" pattern.',
        },
      ],
      conclusion: 'f\'(x) = 2x/(x\u00b2+1). The chain rule result for ln(g(x)) is always g\'(x)/g(x) G현 this is sometimes called the "logarithmic derivative."',
    },
    {
      id: 'ch2-004-ex4',
      title: 'Quotient Rule with e^x',
      problem: "f(x) = \\frac{e^x}{x^3}. \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Numerator: } N = e^x, \\quad \\text{Denominator: } D = x^3",
          annotation: 'Identify numerator and denominator.',
        },
        {
          expression: "N' = e^x, \\quad D' = 3x^2",
          annotation: 'Differentiate each: d/dx[e^x] = e^x (its own derivative); d/dx[x\u00b3] = 3x\u00b2.',
        },
        {
          expression: "f'(x) = \\frac{N'D - ND'}{D^2} = \\frac{e^x \\cdot x^3 - e^x \\cdot 3x^2}{x^6}",
          annotation: 'Apply the quotient rule.',
        },
        {
          expression: "= \\frac{e^x(x^3 - 3x^2)}{x^6}",
          annotation: 'Factor e^x from the numerator.',
        },
        {
          expression: "= \\frac{e^x \\cdot x^2(x-3)}{x^6} = \\frac{e^x(x-3)}{x^4}",
          annotation: 'Factor x\u00b2 from x\u00b3-3x\u00b2 = x\u00b2(x-3), then cancel x\u00b2/x\u2076 = 1/x\u2074.',
        },
      ],
      conclusion: 'f\'(x) = e^x(x-3)/x\u2074. Setting f\'(x) = 0: e^x \u2260 0 always, and x\u2074 \u2260 0 for x \u2260 0, so the only critical point is x = 3.',
    },
    {
      id: 'ch2-004-ex5',
      title: 'Log of a Trig Function',
      problem: "f(x) = \\ln(\\sin x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\ln u, \\quad \\text{Inner: } u = \\sin x",
          annotation: 'Identify the composition: outer is ln, inner is sin x.',
        },
        {
          expression: "F'(u) = \\frac{1}{u}, \\quad u' = \\cos x",
          annotation: 'Derivative of ln(u) is 1/u; derivative of sin x is cos x.',
        },
        {
          expression: "f'(x) = \\frac{1}{\\sin x} \\cdot \\cos x = \\frac{\\cos x}{\\sin x} = \\cot x",
          annotation: 'Apply the chain rule: u\'/u = cos x / sin x = cot x.',
        },
      ],
      conclusion: 'f\'(x) = cot(x). This elegant result d/dx[ln(sin x)] = cot x appears frequently in integration problems.',
    },
    {
      id: 'ch2-004-ex6',
      title: 'Exponential with a Different Base',
      problem: "f(x) = 5^{2x}. \\text{ Find } f'(x).",
      steps: [
        {
          expression: "f(x) = 5^{2x} = (5^2)^x? \\quad \\text{No G현 use chain rule.}",
          annotation: 'Do not confuse 5^(2x) with (5\u00b2)^x = 25^x. While equal in value, the chain rule approach is cleaner: treat 5^u with u = 2x.',
        },
        {
          expression: "\\text{Outer: } F(u) = 5^u, \\quad \\text{Inner: } u = 2x",
          annotation: 'Identify the composition.',
        },
        {
          expression: "F'(u) = 5^u \\ln 5, \\quad u' = 2",
          annotation: 'Use d/dx[a^u] = a^u \u00b7 ln(a). Here a = 5, so d/du[5^u] = 5^u ln 5. Inner derivative of 2x is 2.',
        },
        {
          expression: "f'(x) = 5^{2x} \\cdot \\ln 5 \\cdot 2 = 2(\\ln 5)\\,5^{2x}",
          annotation: 'Apply chain rule and collect constants.',
        },
      ],
      conclusion: 'f\'(x) = 2(ln 5) 5^(2x). The factor of ln 5 \u2248 1.609 comes from the base being 5, not e. If the base were e, we would get d/dx[e^(2x)] = 2e^(2x), with no extra logarithm factor.',
    },
    {
      id: 'ch2-004-ex7',
      title: 'Logarithmic Differentiation: x^x',
      problem: "y = x^x \\text{ for } x > 0. \\text{ Find } \\frac{dy}{dx} \\text{ using logarithmic differentiation.}",
      steps: [
        {
          expression: "y = x^x",
          annotation: 'This function has x in both the base and the exponent. Neither the power rule (which requires a constant exponent) nor the exponential rule (which requires a constant base) applies directly.',
        },
        {
          expression: "\\ln y = \\ln(x^x) = x \\ln x",
          annotation: 'Take ln of both sides. Use the logarithm power rule: ln(x^x) = x\u00b7ln x.',
        },
        {
          expression: "\\frac{d}{dx}[\\ln y] = \\frac{d}{dx}[x \\ln x]",
          annotation: 'Differentiate both sides with respect to x. The left side requires the chain rule since y is a function of x.',
        },
        {
          expression: "\\frac{1}{y} \\cdot \\frac{dy}{dx} = \\frac{d}{dx}[x \\ln x]",
          annotation: 'The left side: d/dx[ln y] = (1/y)\u00b7(dy/dx) by the chain rule (outer is ln, inner is y(x)).',
        },
        {
          expression: "\\frac{d}{dx}[x \\ln x] = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x} = \\ln x + 1",
          annotation: 'Differentiate x\u00b7ln x using the product rule: (x)\u2019(ln x) + (x)(ln x)\u2019 = 1\u00b7ln x + x\u00b7(1/x) = ln x + 1.',
        },
        {
          expression: "\\frac{1}{y} \\cdot \\frac{dy}{dx} = \\ln x + 1",
          annotation: 'Equate the two results.',
        },
        {
          expression: "\\frac{dy}{dx} = y(\\ln x + 1) = x^x(\\ln x + 1)",
          annotation: 'Multiply both sides by y, then substitute back y = x^x.',
        },
      ],
      conclusion: 'dy/dx = x^x(1 + ln x). At x = e, this is e^e(1 + 1) = 2e^e. At x = 1, dy/dx = 1\u00b7(0 + 1) = 1. Logarithmic differentiation converts the impossible-looking x^x into a manageable calculation.',
    },
    {
      id: 'ch2-004-ex8',
      title: 'Logarithmic Differentiation: Variable Base and Exponent',
      problem: "y = (x^2+1)^{\\sin x}. \\text{ Find } \\frac{dy}{dx} \\text{ using logarithmic differentiation.}",
      steps: [
        {
          expression: "y = (x^2+1)^{\\sin x}",
          annotation: 'Both the base x\u00b2+1 and the exponent sin x are functions of x. This requires logarithmic differentiation.',
        },
        {
          expression: "\\ln y = \\sin x \\cdot \\ln(x^2+1)",
          annotation: 'Take ln of both sides. Use ln(a^b) = b\u00b7ln(a) to bring the exponent down.',
        },
        {
          expression: "\\frac{1}{y}\\frac{dy}{dx} = \\frac{d}{dx}[\\sin x \\cdot \\ln(x^2+1)]",
          annotation: 'Differentiate both sides. Left side is (1/y)(dy/dx) by chain rule.',
        },
        {
          expression: "\\frac{d}{dx}[\\sin x \\cdot \\ln(x^2+1)] = \\cos x \\cdot \\ln(x^2+1) + \\sin x \\cdot \\frac{2x}{x^2+1}",
          annotation: 'Apply the product rule to sin(x)\u00b7ln(x\u00b2+1): (sin x)\u2019\u00b7ln(x\u00b2+1) + sin(x)\u00b7(ln(x\u00b2+1))\u2019. Use d/dx[ln(x\u00b2+1)] = 2x/(x\u00b2+1).',
        },
        {
          expression: "\\frac{1}{y}\\frac{dy}{dx} = \\cos x\\ln(x^2+1) + \\frac{2x\\sin x}{x^2+1}",
          annotation: 'Equate.',
        },
        {
          expression: "\\frac{dy}{dx} = y\\left[\\cos x\\ln(x^2+1) + \\frac{2x\\sin x}{x^2+1}\\right]",
          annotation: 'Multiply both sides by y.',
        },
        {
          expression: "= (x^2+1)^{\\sin x}\\left[\\cos x\\ln(x^2+1) + \\frac{2x\\sin x}{x^2+1}\\right]",
          annotation: 'Substitute y = (x\u00b2+1)^(sin x) back in.',
        },
      ],
      conclusion: 'The derivative is (x\u00b2+1)^(sin x)\u00b7[cos(x)\u00b7ln(x\u00b2+1) + 2x sin(x)/(x\u00b2+1)]. This would have been completely intractable without logarithmic differentiation.',
    },
  ],

  challenges: [
    {
      id: 'ch2-004-ch1',
      difficulty: 'easy',
      problem: '\\text{Differentiate } f(x) = e^{2x} \\ln(3x).',
      hint: 'This is a product of two functions: e^(2x) and ln(3x). Apply the product rule. Use the chain rule on each factor.',
      walkthrough: [
        {
          expression: "\\text{Let } u = e^{2x}, \\; v = \\ln(3x)",
          annotation: 'Identify the two factors.',
        },
        {
          expression: "u' = e^{2x} \\cdot 2 = 2e^{2x}",
          annotation: 'Chain rule on e^(2x): outer is e^u, inner is 2x with derivative 2.',
        },
        {
          expression: "v' = \\frac{1}{3x} \\cdot 3 = \\frac{1}{x}",
          annotation: 'Chain rule on ln(3x): outer is ln u with derivative 1/u, inner is 3x with derivative 3. So (1/(3x))\u00b73 = 1/x.',
        },
        {
          expression: "f'(x) = u'v + uv' = 2e^{2x}\\ln(3x) + e^{2x} \\cdot \\frac{1}{x}",
          annotation: 'Apply product rule.',
        },
        {
          expression: "= e^{2x}\\left(2\\ln(3x) + \\frac{1}{x}\\right)",
          annotation: 'Factor e^(2x) from both terms.',
        },
      ],
      answer: "f'(x) = e^{2x}\\!\\left(2\\ln(3x) + \\dfrac{1}{x}\\right)",
    },
    {
      id: 'ch2-004-ch2',
      difficulty: 'medium',
      problem: '\\text{Find all critical points of } f(x) = x\\,e^{-x}.',
      hint: 'Differentiate using the product rule. Set f\'(x) = 0. Note that e^(-x) > 0 for all real x, so you only need to find where the other factor is 0.',
      walkthrough: [
        {
          expression: "f(x) = x \\cdot e^{-x}",
          annotation: 'Product of x and e^(-x).',
        },
        {
          expression: "f'(x) = 1 \\cdot e^{-x} + x \\cdot (-e^{-x})",
          annotation: 'Product rule: (x)\u2019\u00b7e^(-x) + x\u00b7(e^(-x))\u2019. The derivative of e^(-x) is e^(-x)\u00b7(-1) = -e^(-x) by the chain rule.',
        },
        {
          expression: "= e^{-x} - xe^{-x} = e^{-x}(1-x)",
          annotation: 'Factor out e^(-x) from both terms.',
        },
        {
          expression: "f'(x) = 0 \\implies e^{-x}(1-x) = 0",
          annotation: 'Set f\'(x) = 0.',
        },
        {
          expression: "e^{-x} > 0 \\text{ for all } x \\implies 1-x = 0 \\implies x = 1",
          annotation: 'Since e^(-x) is always positive, only the factor (1-x) can be zero. So x = 1 is the only critical point.',
        },
        {
          expression: "f(1) = 1 \\cdot e^{-1} = \\frac{1}{e}",
          annotation: 'The critical point is at (1, 1/e). Since f\'(x) > 0 for x < 1 and f\'(x) < 0 for x > 1, this is a global maximum.',
        },
      ],
      answer: '\\text{One critical point: } x = 1, \\text{ giving a maximum value of } f(1) = 1/e.',
    },
    {
      id: 'ch2-004-ch3',
      difficulty: 'hard',
      problem: "\\text{Use logarithmic differentiation to find } \\frac{d}{dx}\\left[\\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}\\right].",
      hint: 'Take ln of both sides. Use ln rules to convert the product and quotient into sums and differences. Then differentiate term by term, each term being a constant times ln of something.',
      walkthrough: [
        {
          expression: "y = \\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}",
          annotation: 'Set y equal to the expression. This has products and powers G현 perfect for logarithmic differentiation.',
        },
        {
          expression: "\\ln y = 2\\ln(x+1) + 3\\ln(x^2+1) - 4\\ln(x-1)",
          annotation: 'Take ln of both sides. Use ln(AB) = ln A + ln B, ln(A/B) = ln A - ln B, and ln(A^n) = n ln A to expand.',
        },
        {
          expression: "\\frac{1}{y}\\frac{dy}{dx} = \\frac{d}{dx}\\left[2\\ln(x+1) + 3\\ln(x^2+1) - 4\\ln(x-1)\\right]",
          annotation: 'Differentiate both sides.',
        },
        {
          expression: "\\frac{d}{dx}[2\\ln(x+1)] = 2 \\cdot \\frac{1}{x+1} = \\frac{2}{x+1}",
          annotation: 'Differentiate first term: chain rule gives 2\u00b7(1/(x+1))\u00b71 = 2/(x+1).',
        },
        {
          expression: "\\frac{d}{dx}[3\\ln(x^2+1)] = 3 \\cdot \\frac{2x}{x^2+1} = \\frac{6x}{x^2+1}",
          annotation: 'Differentiate second term: 3\u00b7(1/(x\u00b2+1))\u00b72x = 6x/(x\u00b2+1).',
        },
        {
          expression: "\\frac{d}{dx}[-4\\ln(x-1)] = -4 \\cdot \\frac{1}{x-1} = \\frac{-4}{x-1}",
          annotation: 'Differentiate third term: -4\u00b7(1/(x-1))\u00b71 = -4/(x-1).',
        },
        {
          expression: "\\frac{1}{y}\\frac{dy}{dx} = \\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}",
          annotation: 'Combine all three results.',
        },
        {
          expression: "\\frac{dy}{dx} = y \\left[\\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}\\right]",
          annotation: 'Multiply both sides by y.',
        },
        {
          expression: "= \\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}\\left[\\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}\\right]",
          annotation: 'Substitute y back in.',
        },
      ],
      answer: "\\frac{dy}{dx} = \\frac{(x+1)^2(x^2+1)^3}{(x-1)^4}\\!\\left[\\frac{2}{x+1} + \\frac{6x}{x^2+1} - \\frac{4}{x-1}\\right]",
    },
  ],

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'The Chain Rule', context: 'The chain rule is used constantly with exponential and logarithmic functions: d/dx[e^(g(x))] = e^(g(x))g\'(x).' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Logarithmic differentiation is a special case of implicit differentiation applied to ln(y).' },
    { lessonSlug: 'tangent-problem', label: 'Limit Definition', context: 'The proof of d/dx[e^x] = e^x uses the fundamental limit (e^h-1)/h \u2192 1.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'completed-example-6',
    'completed-example-7',
    'completed-example-8',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
};
