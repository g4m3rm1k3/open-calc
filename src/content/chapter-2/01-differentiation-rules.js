// FILE: src/content/chapter-2/01-differentiation-rules.js
export default {
  id: 'ch2-001',
  slug: 'differentiation-rules',
  chapter: 2,
  order: 1,
  title: 'Differentiation Rules — Power, Product, Quotient',
  subtitle: 'Shortcuts that transform hours of limit-computing into seconds of pattern-matching',
  tags: ['power rule', 'product rule', 'quotient rule', 'differentiation rules', 'constant rule', 'sum rule', 'polynomial derivatives'],

  hook: {
    question: 'To find d/dx[x\u00b9\u2070\u2070] from the limit definition, you would need to expand (x+h)\u00b9\u2070\u2070 — a binomial with 101 terms — then cancel, divide, and take a limit. That would take an entire page of algebra. Using the power rule, it takes three seconds: just write 100x\u2099\u2079. What makes this shortcut valid, and can we trust it?',
    realWorldContext: 'Differentiation rules are not magic tricks — each one is a theorem with a rigorous proof from the limit definition. Once proved, they can be applied instantly to any function in their domain. Engineers, physicists, and economists differentiate hundreds of functions per day, and they would be completely paralyzed if every derivative required a limit computation from scratch. The rules in this lesson are the workhorses of all applied calculus. Understanding not just how to use them but why they are true gives you the confidence to know when they apply and how to extend them.',
    previewVisualizationId: 'PowerRulePattern',
  },

  intuition: {
    prose: [
      'Look at the pattern from the previous lesson: the derivative of x\u00b9 is 1, the derivative of x\u00b2 is 2x, the derivative of x\u00b3 is 3x\u00b2, and the derivative of x\u2074 is 4x\u00b3. In every case, the exponent "drops down" to become the coefficient, and the exponent decreases by one. This pattern is the power rule, and it holds for every real number exponent — not just positive integers.',
      'Before diving into formulas, let us address a common misconception about the product rule. Students sometimes guess that the derivative of a product f(x)\u00b7g(x) should be f\'(x)\u00b7g\'(x) — just differentiate each factor. This guess is WRONG. A simple counterexample: take f(x) = x and g(x) = x. Then f(x)\u00b7g(x) = x\u00b2, whose derivative is 2x. But f\'(x)\u00b7g\'(x) = 1\u00b71 = 1. Since 2x \u2260 1 (except at x = 1/2), the naive guess fails. The actual product rule is more subtle.',
      'Why does the product rule have the form it does? Think of f(x)\u00b7g(x) as the area of a rectangle with side lengths f(x) and g(x). When x changes by a small amount h, both f and g change: f changes by approximately f\'(x)\u00b7h and g changes by approximately g\'(x)\u00b7h. The change in the area is the change in the rectangle. The new rectangle has area (f + \u0394f)(g + \u0394g) = fg + f\u00b7\u0394g + g\u00b7\u0394f + \u0394f\u00b7\u0394g. The total change in area is f\u00b7\u0394g + g\u00b7\u0394f + \u0394f\u00b7\u0394g. When we divide by h and let h\u21920, the \u0394f\u00b7\u0394g term (which is proportional to h\u00b2) becomes negligible, and we are left with f\u00b7g\'(x) + g\u00b7f\'(x). That is the product rule.',
      'The quotient rule can be remembered with the mnemonic: "low d-high minus high d-low, over low squared." Here "high" is the numerator and "low" is the denominator. So if h(x) = f(x)/g(x), then h\'(x) = [g(x)\u00b7f\'(x) - f(x)\u00b7g\'(x)] / [g(x)]\u00b2. The order matters: it is not symmetric like the product rule. Notice the minus sign in the numerator — this makes the quotient rule impossible to guess from the product rule without proof.',
      'Why does the quotient rule have a minus sign? Think of f/g: if the denominator g increases, the ratio f/g decreases. So an increase in g contributes negatively to the rate of change of the ratio. This negative contribution is captured by the minus sign in front of f(x)\u00b7g\'(x).',
      'The sum and difference rules say that differentiation is linear: you can differentiate term by term. This follows directly from the linearity of limits. The constant multiple rule follows similarly. These two rules together mean: to differentiate a polynomial, just differentiate each term independently.',
      'Second and higher derivatives are just what you get by differentiating again. If f\'(x) is the derivative of f, then f\'\'(x) is the derivative of f\', called the second derivative. It measures the rate of change of the rate of change — geometrically, it measures concavity. The notation f\'\'(x) = d\u00b2y/dx\u00b2 (read "d two y d x squared") looks like a fraction raised to a power but is actually a separate operator applied twice.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Product Rule is NOT (fg)\u2019 = f\u2019g\u2019',
        body: "\\text{Counterexample: } \\frac{d}{dx}[x \\cdot x] = \\frac{d}{dx}[x^2] = 2x, \\text{ but } \\frac{d}{dx}[x] \\cdot \\frac{d}{dx}[x] = 1 \\cdot 1 = 1 \\neq 2x",
      },
      {
        type: 'insight',
        title: 'Rectangle Area Intuition for Product Rule',
        body: "\\Delta(fg) \\approx f \\cdot \\Delta g + g \\cdot \\Delta f \\quad \\Rightarrow \\quad (fg)' = f'g + fg'",
      },
      {
        type: 'mnemonic',
        title: 'Quotient Rule Mnemonic',
        body: "\\left(\\frac{f}{g}\\right)' = \\frac{\\text{lo}\\cdot d(\\text{hi}) - \\text{hi}\\cdot d(\\text{lo})}{(\\text{lo})^2} = \\frac{g f' - f g'}{g^2}",
      },
    ],
    visualizations: [
      {
        id: 'PowerRulePattern',
        title: 'Power Rule Pattern',
        caption: 'Adjust n to see how f(x) = xⁿ and its derivative nxⁿ⁻¹ relate. Notice the degree drops by exactly 1 each time.',
      },
      {
        id: 'ProductRuleRectangle',
        title: 'Why the Product Rule Works — The Rectangle Proof',
        caption: 'f(x)·g(x) is the area of a rectangle. When x changes, the area grows by f·Δg + g·Δf + a tiny corner (Δf·Δg). As Δx→0, the corner vanishes, giving (fg)\' = f\'g + fg\'.',
      },
      {
        id: 'ProjectileMotion',
        title: 'Projectile Motion — Derivatives in Physics',
        caption: 'Adjust the launch angle and speed. The height function h(t) = v·sin(θ)·t − ½gt² is a polynomial — differentiate it to find max height and landing time.',
      },
      {
        id: 'SlopeField',
        title: 'Slope Field — The Derivative as a Function',
        caption: 'The derivative is not just a number at one point — it defines a slope at EVERY point. This slope field shows tiny line segments colored by the derivative value.',
      },
    ],
  },

  math: {
    prose: [
      'We now state all five differentiation rules precisely. Each is a theorem — a mathematical fact that can be proved and that holds without exception wherever the functions involved are differentiable.',
      'The constant rule says the derivative of any constant function is zero. This makes geometric sense: a constant function is a horizontal line with slope 0 everywhere.',
      'The power rule is the most-used rule in calculus: d/dx[x\u207f] = nx\u207f\u207b\u00b9. This holds for any real number n — positive, negative, fractional, or irrational. For the moment we prove it for positive integers; the general case follows from logarithmic differentiation or the generalized binomial theorem.',
      'The constant multiple rule lets constants pass through the derivative. If c is a constant, d/dx[cf(x)] = c\u00b7f\'(x). This follows because constants can be factored out of limits.',
      'The sum/difference rules say d/dx[f(x) \u00b1 g(x)] = f\'(x) \u00b1 g\'(x). Derivatives of sums and differences are computed term by term.',
      'The product rule: d/dx[f(x)\u00b7g(x)] = f\'(x)\u00b7g(x) + f(x)\u00b7g\'(x). In words: the derivative of a product is (derivative of first)(second) plus (first)(derivative of second).',
      'The quotient rule: if g(x) \u2260 0, then d/dx[f(x)/g(x)] = [f\'(x)\u00b7g(x) - f(x)\u00b7g\'(x)] / [g(x)]\u00b2.',
      'Higher-order derivatives are defined by repeated differentiation. The second derivative is f\'\'(x) = d/dx[f\'(x)], the third derivative is f\'\'\'(x) = d/dx[f\'\'(x)], and so on. For the nth derivative we write f\u1d3c\u207f\u207d(x) or d\u207fy/dx\u207f.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Constant Rule',
        body: '\\frac{d}{dx}[c] = 0',
      },
      {
        type: 'theorem',
        title: 'Power Rule',
        body: '\\frac{d}{dx}[x^n] = nx^{n-1} \\quad \\text{for any real } n',
      },
      {
        type: 'theorem',
        title: 'Constant Multiple Rule',
        body: '\\frac{d}{dx}[c \\cdot f(x)] = c \\cdot f\'(x)',
      },
      {
        type: 'theorem',
        title: 'Sum / Difference Rule',
        body: '\\frac{d}{dx}[f(x) \\pm g(x)] = f\'(x) \\pm g\'(x)',
      },
      {
        type: 'theorem',
        title: 'Product Rule',
        body: '\\frac{d}{dx}[f(x) \\cdot g(x)] = f\'(x)\\,g(x) + f(x)\\,g\'(x)',
      },
      {
        type: 'theorem',
        title: 'Quotient Rule',
        body: '\\frac{d}{dx}\\!\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f\'(x)\\,g(x) - f(x)\\,g\'(x)}{[g(x)]^2}',
      },
      {
        type: 'definition',
        title: 'Higher-Order Derivatives',
        body: "f''(x) = \\frac{d^2y}{dx^2}, \\quad f'''(x) = \\frac{d^3y}{dx^3}, \\quad f^{(n)}(x) = \\frac{d^ny}{dx^n}",
      },
    ],
    visualizationId: 'DifferentiationRulesDemo',
    visualizationProps: {
      showAllRules: true,
      interactiveRule: 'power',
    },
  },

  rigor: {
    prose: [
      'We prove three of the six rules rigorously from the limit definition. The others follow as corollaries.',
      'PROOF OF THE POWER RULE (for positive integers n): We use the algebraic factoring identity: a\u207f - b\u207f = (a - b)(a\u207f\u207b\u00b9 + a\u207f\u207b\u00b2b + a\u207f\u207b\u00b3b\u00b2 + ... + b\u207f\u207b\u00b9), which has n terms in the second factor. Using the alternative form of the derivative definition with x approaching a: d/dx[x\u207f] = lim(x\u2192a) [x\u207f - a\u207f]/(x - a). By the factoring identity, (x\u207f - a\u207f)/(x - a) = x\u207f\u207b\u00b9 + x\u207f\u207b\u00b2a + x\u207f\u207b\u00b3a\u00b2 + ... + a\u207f\u207b\u00b9. This sum has exactly n terms. As x \u2192 a, each term approaches a\u207f\u207b\u00b9. There are n such terms, so the total limit is n\u00b7a\u207f\u207b\u00b9. Replacing a with x gives d/dx[x\u207f] = nx\u207f\u207b\u00b9.',
      'Alternatively, using the binomial theorem: (x+h)\u207f = x\u207f + nx\u207f\u207b\u00b9h + C(n,2)x\u207f\u207b\u00b2h\u00b2 + ... + h\u207f. When we form the difference quotient [(x+h)\u207f - x\u207f]/h, the x\u207f terms cancel, and every remaining term in the numerator has at least one factor of h. After dividing by h, every term still has at least one factor of h EXCEPT the first term, which gives nx\u207f\u207b\u00b9. All higher-order terms vanish as h \u2192 0.',
      'PROOF OF THE PRODUCT RULE: Let p(x) = f(x)\u00b7g(x). The difference quotient for p is [f(x+h)g(x+h) - f(x)g(x)] / h. This is not yet in a usable form. The key algebraic trick is to add and subtract f(x+h)g(x) in the numerator: [f(x+h)g(x+h) - f(x+h)g(x) + f(x+h)g(x) - f(x)g(x)] / h. Regroup: f(x+h)\u00b7[g(x+h)-g(x)]/h + g(x)\u00b7[f(x+h)-f(x)]/h. As h \u2192 0: the first factor f(x+h) approaches f(x) (because f is differentiable, hence continuous); [g(x+h)-g(x)]/h approaches g\'(x); g(x) is constant with respect to h; [f(x+h)-f(x)]/h approaches f\'(x). By the product limit law, the result is f(x)\u00b7g\'(x) + g(x)\u00b7f\'(x). This is the product rule.',
      'PROOF OF THE QUOTIENT RULE: Write f/g = f\u00b7(1/g) and apply the product rule. We need d/dx[1/g(x)]. By the chain rule (or directly from the definition): d/dx[1/g] = -g\'(x)/[g(x)]\u00b2. Then d/dx[f/g] = f\u00b7(-g\'/g\u00b2) + (1/g)\u00b7f\' = -fg\'/g\u00b2 + f\'g/g\u00b2 = (f\'g - fg\')/g\u00b2. This is the quotient rule. (Note: the chain rule is introduced in the next lesson; one can also prove the quotient rule directly from the definition using the algebraic trick of combining fractions, similar to the 1/x derivative in the previous lesson.)',
    ],
    callouts: [
      {
        type: 'proof',
        title: 'Power Rule via Binomial Theorem',
        body: "\\frac{(x+h)^n - x^n}{h} = \\frac{nx^{n-1}h + \\binom{n}{2}x^{n-2}h^2 + \\cdots + h^n}{h} = nx^{n-1} + \\binom{n}{2}x^{n-2}h + \\cdots \\xrightarrow{h\\to 0} nx^{n-1}",
      },
      {
        type: 'proof',
        title: 'Product Rule — The Key Trick',
        body: '\\frac{f(x+h)g(x+h) - f(x)g(x)}{h} = f(x+h)\\cdot\\frac{g(x+h)-g(x)}{h} + g(x)\\cdot\\frac{f(x+h)-f(x)}{h}',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ch2-001-ex1',
      title: 'Differentiating a Polynomial',
      problem: '\\text{Find } f\'(x) \\text{ for } f(x) = 5x^4 - 3x^3 + 7x^2 - 2x + 9.',
      steps: [
        {
          expression: "f'(x) = \\frac{d}{dx}[5x^4] - \\frac{d}{dx}[3x^3] + \\frac{d}{dx}[7x^2] - \\frac{d}{dx}[2x] + \\frac{d}{dx}[9]",
          annotation: 'Apply the sum and difference rules to differentiate term by term. Each term can be handled independently.',
        },
        {
          expression: "= 5 \\cdot \\frac{d}{dx}[x^4] - 3 \\cdot \\frac{d}{dx}[x^3] + 7 \\cdot \\frac{d}{dx}[x^2] - 2 \\cdot \\frac{d}{dx}[x] + \\frac{d}{dx}[9]",
          annotation: 'Apply the constant multiple rule to pull the numeric coefficients outside each derivative.',
        },
        {
          expression: "= 5 \\cdot 4x^3 - 3 \\cdot 3x^2 + 7 \\cdot 2x - 2 \\cdot 1 + 0",
          annotation: 'Apply the power rule to each power of x: d/dx[x\u2074]=4x\u00b3, d/dx[x\u00b3]=3x\u00b2, d/dx[x\u00b2]=2x, d/dx[x]=1. The constant 9 has derivative 0.',
        },
        {
          expression: "= 20x^3 - 9x^2 + 14x - 2",
          annotation: 'Multiply each coefficient: 5\u00b74=20, 3\u00b73=9, 7\u00b72=14, 2\u00b71=2. The derivative is fully simplified.',
        },
      ],
      conclusion: 'f\'(x) = 20x\u00b3 - 9x\u00b2 + 14x - 2. Notice that the degree dropped by 1 (from 4 to 3) and the constant term vanished — this always happens when differentiating a polynomial.',
    },
    {
      id: 'ch2-001-ex2',
      title: 'Negative and Fractional Exponents',
      problem: '\\text{Find } f\'(x) \\text{ for } f(x) = x^{-3} + x^{1/2} + x^{3/2}.',
      steps: [
        {
          expression: "f(x) = x^{-3} + x^{1/2} + x^{3/2}",
          annotation: 'The function is already written in power form, so the power rule applies directly to each term. No rewriting needed.',
        },
        {
          expression: "f'(x) = \\frac{d}{dx}[x^{-3}] + \\frac{d}{dx}[x^{1/2}] + \\frac{d}{dx}[x^{3/2}]",
          annotation: 'Apply the sum rule: differentiate term by term.',
        },
        {
          expression: "\\frac{d}{dx}[x^{-3}] = (-3)x^{-3-1} = -3x^{-4}",
          annotation: 'Apply the power rule with n = -3: bring down the exponent as a coefficient, then subtract 1 from the exponent. -3 - 1 = -4.',
        },
        {
          expression: "\\frac{d}{dx}[x^{1/2}] = \\frac{1}{2}x^{1/2 - 1} = \\frac{1}{2}x^{-1/2}",
          annotation: 'Apply the power rule with n = 1/2: the new exponent is 1/2 - 1 = -1/2.',
        },
        {
          expression: "\\frac{d}{dx}[x^{3/2}] = \\frac{3}{2}x^{3/2 - 1} = \\frac{3}{2}x^{1/2}",
          annotation: 'Apply the power rule with n = 3/2: the new exponent is 3/2 - 1 = 1/2.',
        },
        {
          expression: "f'(x) = -3x^{-4} + \\frac{1}{2}x^{-1/2} + \\frac{3}{2}x^{1/2}",
          annotation: 'Collect all three derivatives.',
        },
        {
          expression: "= -\\frac{3}{x^4} + \\frac{1}{2\\sqrt{x}} + \\frac{3\\sqrt{x}}{2}",
          annotation: 'Optionally rewrite using radical and fraction notation: x^(-4) = 1/x\u2074, x^(-1/2) = 1/\u221ax, x^(1/2) = \u221ax.',
        },
      ],
      conclusion: 'The power rule applies equally well to negative and fractional exponents. The key is to write the function in the form x\u207f before differentiating.',
    },
    {
      id: 'ch2-001-ex3',
      title: 'Product Rule: Two Methods',
      problem: '\\text{Find } g\'(x) \\text{ for } g(x) = (x^2+3)(2x^4-x+5). \\text{ Use both the product rule and by expanding first, then verify both methods give the same answer.}',
      steps: [
        {
          expression: "\\textbf{Method 1: Product Rule}",
          annotation: 'Identify f(x) = x\u00b2 + 3 and h(x) = 2x\u2074 - x + 5 as the two factors.',
        },
        {
          expression: "f(x) = x^2 + 3 \\implies f'(x) = 2x",
          annotation: 'Differentiate the first factor using the power and sum rules.',
        },
        {
          expression: "h(x) = 2x^4 - x + 5 \\implies h'(x) = 8x^3 - 1",
          annotation: 'Differentiate the second factor: d/dx[2x\u2074] = 8x\u00b3, d/dx[-x] = -1, d/dx[5] = 0.',
        },
        {
          expression: "g'(x) = f'(x) \\cdot h(x) + f(x) \\cdot h'(x)",
          annotation: 'Apply the product rule: (first)\'(second) + (first)(second)\'.',
        },
        {
          expression: "= (2x)(2x^4 - x + 5) + (x^2 + 3)(8x^3 - 1)",
          annotation: 'Substitute f\'(x) = 2x, h(x) = 2x\u2074-x+5, f(x) = x\u00b2+3, h\'(x) = 8x\u00b3-1.',
        },
        {
          expression: "= (4x^5 - 2x^2 + 10x) + (8x^5 - x^2 + 24x^3 - 3)",
          annotation: 'Expand each product by distributing: 2x\u00b7(2x\u2074-x+5) = 4x\u2075-2x\u00b2+10x, and (x\u00b2+3)(8x\u00b3-1) = 8x\u2075-x\u00b2+24x\u00b3-3.',
        },
        {
          expression: "= 12x^5 + 24x^3 - 3x^2 + 10x - 3",
          annotation: 'Combine like terms: 4x\u2075+8x\u2075=12x\u2075, 24x\u00b3 alone, -2x\u00b2-x\u00b2=-3x\u00b2, 10x alone, -3 alone.',
        },
        {
          expression: "\\textbf{Method 2: Expand First}",
          annotation: 'Multiply out the original expression, then differentiate the resulting polynomial.',
        },
        {
          expression: "g(x) = (x^2+3)(2x^4-x+5) = 2x^6 - x^3 + 5x^2 + 6x^4 - 3x + 15",
          annotation: 'Expand by distributing x\u00b2 across 2x\u2074-x+5 (giving 2x\u2076-x\u00b3+5x\u00b2) and distributing 3 across 2x\u2074-x+5 (giving 6x\u2074-3x+15).',
        },
        {
          expression: "= 2x^6 + 6x^4 - x^3 + 5x^2 - 3x + 15",
          annotation: 'Rewrite in standard decreasing-degree form.',
        },
        {
          expression: "g'(x) = 12x^5 + 24x^3 - 3x^2 + 10x - 3",
          annotation: 'Differentiate term by term using the power rule: d/dx[2x\u2076]=12x\u2075, d/dx[6x\u2074]=24x\u00b3, d/dx[-x\u00b3]=-3x\u00b2, d/dx[5x\u00b2]=10x, d/dx[-3x]=-3, d/dx[15]=0.',
        },
        {
          expression: "\\textbf{Both methods give: } g'(x) = 12x^5 + 24x^3 - 3x^2 + 10x - 3 \\checkmark",
          annotation: 'The two answers agree, confirming the product rule is correct. For more complicated factors where expanding is impractical, the product rule is far more efficient.',
        },
      ],
      conclusion: 'When the factors are easy to multiply out, expanding first is fine. But when factors are complicated (like (x\u00b2+1)(e^x sin x)), the product rule is the only practical approach. Both methods always yield the same answer.',
    },
    {
      id: 'ch2-001-ex4',
      title: 'Quotient Rule',
      problem: '\\text{Find } h\'(x) \\text{ for } h(x) = \\dfrac{x^2+1}{x-3}.',
      steps: [
        {
          expression: "f(x) = x^2 + 1, \\quad g(x) = x - 3",
          annotation: 'Identify the numerator as f(x) and the denominator as g(x) for use in the quotient rule formula.',
        },
        {
          expression: "f'(x) = 2x, \\quad g'(x) = 1",
          annotation: 'Differentiate numerator and denominator separately. d/dx[x\u00b2+1] = 2x, d/dx[x-3] = 1.',
        },
        {
          expression: "h'(x) = \\frac{f'(x)\\,g(x) - f(x)\\,g'(x)}{[g(x)]^2}",
          annotation: 'Write the quotient rule formula: (numerator prime)(denominator) minus (numerator)(denominator prime), all over (denominator) squared.',
        },
        {
          expression: "= \\frac{(2x)(x-3) - (x^2+1)(1)}{(x-3)^2}",
          annotation: 'Substitute the expressions for f, f\', g, g\' into the quotient rule.',
        },
        {
          expression: "= \\frac{2x^2 - 6x - x^2 - 1}{(x-3)^2}",
          annotation: 'Expand the numerator: (2x)(x-3) = 2x\u00b2-6x, and (x\u00b2+1)(1) = x\u00b2+1. Distribute the minus sign.',
        },
        {
          expression: "= \\frac{x^2 - 6x - 1}{(x-3)^2}",
          annotation: 'Combine like terms in the numerator: 2x\u00b2 - x\u00b2 = x\u00b2. The denominator stays factored as (x-3)\u00b2.',
        },
      ],
      conclusion: 'h\'(x) = (x\u00b2 - 6x - 1) / (x-3)\u00b2. Note that the quotient rule answer is undefined at x = 3, which makes sense — the original function h(x) has a vertical asymptote there.',
    },
    {
      id: 'ch2-001-ex5',
      title: 'Finding Horizontal Tangent Lines',
      problem: '\\text{Find all values of } x \\text{ where } f(x) = x^3 - 3x \\text{ has a horizontal tangent line.}',
      steps: [
        {
          expression: "f'(x) = \\frac{d}{dx}[x^3 - 3x] = 3x^2 - 3",
          annotation: 'Differentiate using the power and difference rules. A horizontal tangent occurs where the slope is 0, i.e., where f\'(x) = 0.',
        },
        {
          expression: "f'(x) = 0 \\implies 3x^2 - 3 = 0",
          annotation: 'Set the derivative equal to 0, since a horizontal tangent line has slope 0.',
        },
        {
          expression: "3x^2 = 3",
          annotation: 'Add 3 to both sides.',
        },
        {
          expression: "x^2 = 1",
          annotation: 'Divide both sides by 3.',
        },
        {
          expression: "x = \\pm 1",
          annotation: 'Take the square root of both sides. There are two solutions.',
        },
        {
          expression: "f(1) = 1 - 3 = -2, \\quad f(-1) = -1 + 3 = 2",
          annotation: 'Evaluate f at each critical point to find the y-coordinates of the tangent points.',
        },
      ],
      conclusion: 'The function has horizontal tangents at (1, -2) and (-1, 2). These are the local minimum and local maximum of the cubic curve. Setting f\'(x) = 0 and solving is the fundamental technique for finding local extrema.',
    },
    {
      id: 'ch2-001-ex6',
      title: 'Higher-Order Derivatives',
      problem: '\\text{For } f(x) = x^4 - 6x^2 + 1, \\text{ find } f\'\'(x) \\text{ and } f\'\'\'(x).',
      steps: [
        {
          expression: "f(x) = x^4 - 6x^2 + 1",
          annotation: 'Start with the original function.',
        },
        {
          expression: "f'(x) = 4x^3 - 12x",
          annotation: 'Differentiate once: d/dx[x\u2074]=4x\u00b3, d/dx[-6x\u00b2]=-12x, d/dx[1]=0.',
        },
        {
          expression: "f''(x) = \\frac{d}{dx}[4x^3 - 12x] = 12x^2 - 12",
          annotation: 'Differentiate again to get the second derivative: d/dx[4x\u00b3]=12x\u00b2, d/dx[-12x]=-12.',
        },
        {
          expression: "f'''(x) = \\frac{d}{dx}[12x^2 - 12] = 24x",
          annotation: 'Differentiate a third time: d/dx[12x\u00b2]=24x, d/dx[-12]=0.',
        },
      ],
      conclusion: 'f\'\'(x) = 12x\u00b2 - 12 tells us about concavity (where the function curves up or down). f\'\'(x) > 0 when x\u00b2 > 1, i.e., when |x| > 1 (concave up). f\'\'\'(x) = 24x tells us how the concavity is changing.',
    },
    {
      id: 'ch2-001-ex7',
      title: 'Tangent Line Using Quotient Rule',
      problem: '\\text{Find the equation of the tangent line to } y = \\dfrac{3x^2-1}{x+2} \\text{ at } x = 1.',
      steps: [
        {
          expression: "f(x) = 3x^2 - 1, \\quad g(x) = x + 2",
          annotation: 'Identify numerator and denominator.',
        },
        {
          expression: "f'(x) = 6x, \\quad g'(x) = 1",
          annotation: 'Differentiate numerator and denominator.',
        },
        {
          expression: "y' = \\frac{6x(x+2) - (3x^2-1)(1)}{(x+2)^2}",
          annotation: 'Apply the quotient rule.',
        },
        {
          expression: "= \\frac{6x^2 + 12x - 3x^2 + 1}{(x+2)^2} = \\frac{3x^2 + 12x + 1}{(x+2)^2}",
          annotation: 'Expand the numerator: 6x(x+2) = 6x\u00b2+12x, and -(3x\u00b2-1) = -3x\u00b2+1. Combine: 6x\u00b2-3x\u00b2=3x\u00b2.',
        },
        {
          expression: "y'\\big|_{x=1} = \\frac{3(1)^2 + 12(1) + 1}{(1+2)^2} = \\frac{3 + 12 + 1}{9} = \\frac{16}{9}",
          annotation: 'Evaluate the derivative at x = 1 to get the slope of the tangent line.',
        },
        {
          expression: "y\\big|_{x=1} = \\frac{3(1)^2 - 1}{1 + 2} = \\frac{2}{3}",
          annotation: 'Evaluate the original function at x = 1 to find the y-coordinate of the tangent point.',
        },
        {
          expression: "y - \\frac{2}{3} = \\frac{16}{9}(x - 1)",
          annotation: 'Write the tangent line in point-slope form using point (1, 2/3) and slope 16/9.',
        },
        {
          expression: "y = \\frac{16}{9}x - \\frac{16}{9} + \\frac{6}{9} = \\frac{16}{9}x - \\frac{10}{9}",
          annotation: 'Simplify: convert 2/3 = 6/9, then -16/9 + 6/9 = -10/9.',
        },
      ],
      conclusion: 'The tangent line is y = (16/9)x - 10/9 at the point (1, 2/3).',
    },
    {
      id: 'ch2-001-ex8',
      title: 'Product Rule on a Square',
      problem: '\\text{Differentiate } f(x) = (x^2+1)^2 \\text{ using the product rule (treat as } (x^2+1)(x^2+1)\\text{), then verify by expanding first.}',
      steps: [
        {
          expression: "\\textbf{Method 1: Product Rule}",
          annotation: 'Write f(x) = u(x)\u00b7u(x) where u(x) = x\u00b2 + 1.',
        },
        {
          expression: "u(x) = x^2 + 1, \\quad u'(x) = 2x",
          annotation: 'Identify the repeated factor and differentiate it.',
        },
        {
          expression: "f'(x) = u'(x) \\cdot u(x) + u(x) \\cdot u'(x) = 2u(x) \\cdot u'(x)",
          annotation: 'Apply the product rule. Since both factors are the same, both terms in the product rule are identical, giving 2\u00b7u(x)\u00b7u\'(x).',
        },
        {
          expression: "= 2(x^2+1)(2x) = 4x(x^2+1)",
          annotation: 'Substitute u(x) = x\u00b2+1 and u\'(x) = 2x.',
        },
        {
          expression: "= 4x^3 + 4x",
          annotation: 'Expand for the standard polynomial form.',
        },
        {
          expression: "\\textbf{Method 2: Expand First}",
          annotation: 'Expand (x\u00b2+1)\u00b2 = x\u2074 + 2x\u00b2 + 1, then differentiate.',
        },
        {
          expression: "(x^2+1)^2 = x^4 + 2x^2 + 1",
          annotation: 'Expand using (a+b)\u00b2 = a\u00b2+2ab+b\u00b2 with a=x\u00b2 and b=1.',
        },
        {
          expression: "f'(x) = 4x^3 + 4x \\checkmark",
          annotation: 'Differentiate: d/dx[x\u2074]=4x\u00b3, d/dx[2x\u00b2]=4x, d/dx[1]=0. Same answer as Method 1.',
        },
      ],
      conclusion: 'Both methods agree: f\'(x) = 4x\u00b3 + 4x = 4x(x\u00b2+1). Note that 2u\u00b7u\' = 2(x\u00b2+1)\u00b72x is actually a preview of the chain rule result d/dx[u\u207f] = nu\u207f\u207b\u00b9u\'.',
    },
    {
      id: 'ch2-001-ex9',
      title: 'Complete Kinematics: Position, Velocity, Acceleration (Physics)',
      problem: 'A particle moves along a line with position $x(t) = 2t^3 - 9t^2 + 12t$ metres, $t \\geq 0$. (a) Find velocity $v(t) = x\'(t)$ and acceleration $a(t) = x\'\'(t)$. (b) When is the particle at rest? (c) When is it moving right vs left? (d) When is it speeding up vs slowing down?',
      visualizationId: 'PositionVelocityAcceleration',
      steps: [
        { expression: "v(t) = x'(t) = 6t^2 - 18t + 12", annotation: 'Power rule: d/dt[2t\u00b3]=6t\u00b2, d/dt[-9t\u00b2]=-18t, d/dt[12t]=12.' },
        { expression: "a(t) = v'(t) = x''(t) = 12t - 18", annotation: 'Differentiate v(t) again: d/dt[6t\u00b2]=12t, d/dt[-18t]=-18.' },
        { expression: "v(t) = 0: \\quad 6(t^2 - 3t + 2) = 6(t-1)(t-2) = 0", annotation: 'Factor to find when velocity is zero. Set v=0 and factor the quadratic.' },
        { expression: "t = 1 \\text{ s and } t = 2 \\text{ s}", annotation: 'The particle momentarily stops at t=1 and t=2 — the turning points in its motion.' },
        { expression: "v > 0 \\text{ on } (0,1) \\cup (2,\\infty); \\quad v < 0 \\text{ on } (1,2)", annotation: 'Sign chart: v = 6(t-1)(t-2) is positive when both factors agree in sign. Moving right for t<1 and t>2; moving left for 1<t<2.' },
        { expression: "a(t) = 0 \\Rightarrow t = 1.5 \\text{ s}", annotation: 'Acceleration changes sign at t=1.5 s. This is the inflection point of the position curve.' },
        { expression: "\\text{Speeding up: } v \\text{ and } a \\text{ same sign} \\Rightarrow t \\in (1, 1.5) \\cup (2, \\infty)", annotation: 'On (1,1.5): v<0 and a<0 (both negative \u2192 speeding up leftward). On (2,\u221e): v>0 and a>0 \u2192 speeding up rightward. On (0,1) and (1.5,2): v and a have opposite signs \u2192 slowing down.' },
      ],
      conclusion: 'The particle moves right on (0,1), reverses at t=1, moves left on (1,2), reverses again at t=2, then moves right forever. The acceleration changes sign at t=1.5 s (inflection point). This example demonstrates the full kinematic stack: differentiation once gives velocity, twice gives acceleration. The physics tells you what the math means: where f\'=0 is a physical rest; where f\' and f\'\' agree in sign is where the object speeds up.',
    },
  ],

  challenges: [
    {
      id: 'ch2-001-ch1',
      difficulty: 'easy',
      problem: 'Find the equation of the tangent line to y = \\dfrac{x^2+3}{x-1} \\text{ at } x = 2.',
      hint: 'Use the quotient rule to find y\'. Evaluate at x = 2 to get the slope. Then find y(2) for the point.',
      walkthrough: [
        {
          expression: "y' = \\frac{2x(x-1) - (x^2+3)(1)}{(x-1)^2}",
          annotation: 'Apply the quotient rule with numerator x\u00b2+3 and denominator x-1.',
        },
        {
          expression: "= \\frac{2x^2 - 2x - x^2 - 3}{(x-1)^2} = \\frac{x^2 - 2x - 3}{(x-1)^2}",
          annotation: 'Expand and combine: 2x\u00b2-x\u00b2=x\u00b2 and -2x stays.',
        },
        {
          expression: "y'(2) = \\frac{4 - 4 - 3}{(1)^2} = \\frac{-3}{1} = -3",
          annotation: 'Substitute x = 2.',
        },
        {
          expression: "y(2) = \\frac{4+3}{2-1} = 7",
          annotation: 'Find the y-coordinate of the tangent point.',
        },
        {
          expression: "y - 7 = -3(x-2) \\implies y = -3x + 13",
          annotation: 'Point-slope form with (2, 7) and slope -3.',
        },
      ],
      answer: 'y = -3x + 13',
    },
    {
      id: 'ch2-001-ch2',
      difficulty: 'medium',
      problem: 'Find all points on f(x) = x^3 - 6x^2 + 9x + 2 where (a) the tangent is horizontal (parallel to y = 3, i.e., slope 0) and (b) the tangent is parallel to y = 3x (slope 3).',
      hint: 'Find f\'(x), then set f\'(x) = 0 for part (a) and f\'(x) = 3 for part (b). Solve each quadratic equation.',
      walkthrough: [
        {
          expression: "f'(x) = 3x^2 - 12x + 9",
          annotation: 'Differentiate using the power rule on each term.',
        },
        {
          expression: "\\text{(a) } f'(x) = 0: \\quad 3x^2 - 12x + 9 = 0 \\implies x^2 - 4x + 3 = 0",
          annotation: 'Set f\'(x) = 0 and divide by 3.',
        },
        {
          expression: "(x-1)(x-3) = 0 \\implies x = 1 \\text{ or } x = 3",
          annotation: 'Factor the quadratic.',
        },
        {
          expression: "f(1) = 1-6+9+2 = 6, \\quad f(3) = 27-54+27+2 = 2",
          annotation: 'Find y-coordinates.',
        },
        {
          expression: "\\text{Horizontal tangents at } (1,6) \\text{ and } (3,2)",
          annotation: 'These are the local max and min of the cubic.',
        },
        {
          expression: "\\text{(b) } f'(x) = 3: \\quad 3x^2 - 12x + 9 = 3 \\implies 3x^2 - 12x + 6 = 0 \\implies x^2 - 4x + 2 = 0",
          annotation: 'Set f\'(x) = 3 (the slope we want to match).',
        },
        {
          expression: "x = \\frac{4 \\pm \\sqrt{16-8}}{2} = \\frac{4 \\pm 2\\sqrt{2}}{2} = 2 \\pm \\sqrt{2}",
          annotation: 'Use the quadratic formula: x = [4 \u00b1 \u221a(16-8)]/2 = [4 \u00b1 2\u221a2]/2.',
        },
      ],
      answer: '\\text{(a) Horizontal tangents at } (1,6) \\text{ and } (3,2). \\quad \\text{(b) Slope-3 tangents at } x = 2\\pm\\sqrt{2}.',
    },
    {
      id: 'ch2-001-ch3',
      difficulty: 'hard',
      problem: "If f and g are differentiable at x, define h(x) = f(x) \\cdot g(x). Use the limit definition of h'(x) to derive the product rule. Do not assume the product rule — prove it.",
      hint: 'Write the difference quotient for h. Add and subtract f(x+k)g(x) in the numerator to create two separate fractions, each of which you can recognize as a difference quotient for f or g.',
      walkthrough: [
        {
          expression: "h'(x) = \\lim_{k \\to 0} \\frac{h(x+k) - h(x)}{k} = \\lim_{k \\to 0} \\frac{f(x+k)g(x+k) - f(x)g(x)}{k}",
          annotation: 'Write the definition of h\'(x) and substitute h(x) = f(x)g(x).',
        },
        {
          expression: "= \\lim_{k \\to 0} \\frac{f(x+k)g(x+k) - f(x+k)g(x) + f(x+k)g(x) - f(x)g(x)}{k}",
          annotation: 'Add and subtract f(x+k)g(x) in the numerator. This clever insertion creates two groups, each factorable.',
        },
        {
          expression: "= \\lim_{k \\to 0} \\left[ f(x+k) \\cdot \\frac{g(x+k) - g(x)}{k} + g(x) \\cdot \\frac{f(x+k) - f(x)}{k} \\right]",
          annotation: 'Factor: the first two terms share f(x+k) and the last two terms share g(x).',
        },
        {
          expression: "= \\lim_{k \\to 0} f(x+k) \\cdot \\lim_{k \\to 0} \\frac{g(x+k)-g(x)}{k} + g(x) \\cdot \\lim_{k \\to 0} \\frac{f(x+k)-f(x)}{k}",
          annotation: 'Apply the product and sum limit laws. We can split the limit because all pieces have existing limits.',
        },
        {
          expression: "= f(x) \\cdot g'(x) + g(x) \\cdot f'(x)",
          annotation: 'Evaluate each limit: lim f(x+k) = f(x) because f is differentiable (hence continuous); the second limit is g\'(x) by definition; the last is f\'(x) by definition.',
        },
        {
          expression: "(fg)' = f'g + fg' \\quad \\blacksquare",
          annotation: 'This is the product rule. The key step was the algebraic trick of adding and subtracting f(x+k)g(x) — the technique of "adding zero in a useful form."',
        },
      ],
      answer: "(f\\cdot g)' = f'g + fg'",
    },
  ],

  crossRefs: [
    { lessonSlug: 'tangent-problem', label: 'Limit Definition of the Derivative', context: 'The differentiation rules are all proved using the limit definition from this lesson.' },
    { lessonSlug: 'chain-rule', label: 'The Chain Rule', context: 'The chain rule combines with the power rule to differentiate composite functions.' },
    { lessonSlug: 'exp-log-derivatives', label: 'Exponential and Log Derivatives', context: 'The product and quotient rules appear constantly when differentiating products/quotients involving e^x and ln x.' },
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
