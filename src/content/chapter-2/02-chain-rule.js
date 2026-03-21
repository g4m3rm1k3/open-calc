// FILE: src/content/chapter-2/02-chain-rule.js
export default {
  id: 'ch2-002',
  slug: 'chain-rule',
  chapter: 2,
  order: 2,
  title: 'The Chain Rule — Differentiating Compositions',
  subtitle: 'How to differentiate a function inside another function — the most widely used rule in all of calculus',
  tags: ['chain rule', 'composite functions', 'composition', 'outside-inside', 'Leibniz form', 'triple composition'],
  aliases: 'section 3.6 chain rule derivation formal proof leibniz notation dy du times du dx chain and power product quotient composite three layers',

  hook: {
    question: 'A balloon is being inflated so that its radius grows at a rate of 2 centimeters per second (r(t) = 2t). The volume of a sphere is V = (4/3)\u03c0r\u00b3. At the moment when t = 3 seconds, how fast is the volume increasing? Volume depends on radius, radius depends on time — so how do we find dV/dt?',
    realWorldContext: 'This is the fundamental challenge of all real-world calculus: quantities rarely depend directly on the variable we care about. Temperature depends on altitude, and altitude depends on time as an airplane climbs. A company\'s profit depends on price, and optimal price depends on consumer demand, which depends on the economy. Stress in a beam depends on deflection, which depends on load. In modern AI, a loss function depends on output, output depends on hidden layers, and hidden layers depend on millions of weights; computing each gradient is repeated chain rule (backpropagation). In every case, we have a chain of dependencies, and computing the overall rate of change requires the chain rule. It is not an exaggeration to say the chain rule is used more than any other single rule in applied calculus.',
    previewVisualizationId: 'ChainRuleMicroscope',
  },

  intuition: {
    prose: [
      'Sequencing map: first derivatives are built from limits, then power/product/quotient rules are proved, and only then does the chain rule appear. The chain rule is layered on those earlier results.',
      'Let\'s build intuition for composition before worrying about differentiation. The expression f(g(x)) means: first apply g to x, get an intermediate result, then apply f to that intermediate result. For example, if g(x) = x\u00b2 + 1 and f(u) = \u221au, then f(g(x)) = \u221a(x\u00b2+1). The function g acts "on the inside" and f acts "on the outside." To evaluate at x = 3: first g(3) = 10, then f(10) = \u221a10. This two-step process is composition.',
      'Now think about rates. If u = g(x) changes by a certain rate as x changes, and y = f(u) changes at a certain rate as u changes, then what is the rate of change of y with respect to x? The answer is found by multiplying the rates: if u increases 3 times as fast as x, and y increases 4 times as fast as u, then y increases 12 times as fast as x. Rates along a chain multiply.',
      'The gear analogy makes this precise. Suppose gear A meshes with gear B, and gear B meshes with gear C. If gear A turns 3 times for every revolution of gear B (dA/dB = 3), and gear B turns 2 times for every revolution of gear C (dB/dC = 2), then gear A turns 6 times for every revolution of gear C: dA/dC = (dA/dB)\u00b7(dB/dC) = 3\u00b72 = 6. The rates multiply along the chain. This is the chain rule in its essence.',
      'In Leibniz notation, the chain rule is dy/dx = (dy/du)\u00b7(du/dx). If you squint, it looks like the du terms "cancel" — and while this is not literally true (dy/du and du/dx are limits, not fractions), it serves as a perfect mnemonic and is essentially justified by the fact that in the limit, these ratio quantities do behave multiplicatively.',
      'There is a beautifully practical way to execute the chain rule called the "outside-inside" method. To differentiate f(g(x)): (1) Differentiate the outside function f, evaluated at the inside g(x), leaving the inside completely unchanged. (2) Multiply by the derivative of the inside g\'(x). In symbols: d/dx[f(g(x))] = f\'(g(x)) \u00b7 g\'(x). The key is to NOT differentiate the inside first — leave it intact and only differentiate the outer wrapper.',
      'Let\'s see this with a concrete example: d/dx[(3x\u00b2-1)\u2075]. The outside function is u\u2075 (raise to the fifth), and the inside is u = 3x\u00b2-1. Differentiate the outside: the derivative of u\u2075 is 5u\u2074, evaluated at u = 3x\u00b2-1, giving 5(3x\u00b2-1)\u2074. Multiply by the derivative of the inside: d/dx[3x\u00b2-1] = 6x. Final answer: 5(3x\u00b2-1)\u2074 \u00b7 6x = 30x(3x\u00b2-1)\u2074. This two-step process — differentiate outer (keep inner), multiply by derivative of inner — is all there is to the chain rule.',
      'A note on identifying the outer and inner functions: look for the "last operation" that would be performed if you were evaluating the function at a specific number. For \u221a(x\u00b2+1), the last operation is taking a square root, so the outer function is u^(1/2) and the inner is x\u00b2+1. For sin(5x\u00b3), the last operation is taking the sine, so outer is sin(u) and inner is 5x\u00b3.',
      'The chain rule extends to triple and longer compositions. For y = f(g(h(x))), the derivative is f\'(g(h(x))) \u00b7 g\'(h(x)) \u00b7 h\'(x). Differentiate the outermost layer first, then the next, and so on, each time multiplying by the derivative of the layer below. This is like peeling an onion, one layer at a time.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Prerequisite Reminder',
        body: 'Product and quotient rules are proved in the previous lesson. This lesson builds on those results and shows how composition adds the extra inner-derivative factor.',
      },
      {
        type: 'insight',
        title: 'The Outside-Inside Method',
        body: "\\frac{d}{dx}[f(g(x))] = \\underbrace{f'(g(x))}_{\\text{differentiate outside, keep inside}} \\cdot \\underbrace{g'(x)}_{\\text{times derivative of inside}}",
      },
      {
        type: 'insight',
        title: 'Rates Multiply Along a Chain',
        body: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}",
      },
      {
        type: 'example',
        title: 'Balloon Volume Example',
        body: 'V = \\tfrac{4}{3}\\pi r^3,\\; r = 2t \\implies \\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt} = 4\\pi r^2 \\cdot 2 = 8\\pi r^2 = 8\\pi(2t)^2 = 32\\pi t^2',
      },
      {
        type: 'real-world',
        title: 'Backpropagation Is Chain Rule at Scale',
        body: '\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial a_2}\\cdot\\frac{\\partial a_2}{\\partial z_2}\\cdot\\frac{\\partial z_2}{\\partial a_1}\\cdot\\frac{\\partial a_1}{\\partial z_1}\\cdot\\frac{\\partial z_1}{\\partial w_1}\\;\\;\\text{(one weight in a deep net)}',
      },
    ],
    visualizations: [
      {
        id: 'ChainRulePeeler',
        title: 'Peel the Onion',
        caption: 'The chain rule differentiates strictly from the outside in. Click the outer layers to peel them away and automatically multiply by the inner derivatives.',
      },
    ],
  },

  math: {
    prose: [
      'There are two equivalent forms of the chain rule. The Lagrange/function-composition form names the outer and inner functions explicitly and is cleaner for algebraic manipulation. The Leibniz form uses dy/du and du/dx and is more intuitive for applied problems involving rates.',
      'An approachable derivation idea: if \u0394u \approx g\'(x)\u0394x and \u0394y \approx f\'(u)\u0394u, then \u0394y \approx f\'(u)g\'(x)\u0394x. Dividing by \u0394x and taking the limiting view gives dy/dx = f\'(g(x))g\'(x).',
      'The chain rule combined with the power rule gives one of the most common differentiation formulas in all of calculus: d/dx[u\u207f] = nu\u207f\u207b\u00b9\u00b7u\', where u = g(x) is any differentiable function. This formula applies whenever you have "something to a power" — the power rule applies to the outer function, and the chain rule contributes the u\' factor.',
      'The extended chain rule for triple compositions states that for y = f(g(h(x))), the derivative is f\'(g(h(x))) \u00b7 g\'(h(x)) \u00b7 h\'(x). The pattern is clear: differentiate each layer from outside to inside, evaluate each outer derivative at everything inside it, and multiply all the factors together.',
      'Identifying the outer and inner functions correctly is a skill that develops with practice. The best approach is to always ask: "What is the last thing done to x if I evaluate this at a number?" That last operation is the outer function. Everything that comes before is the inner function.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Chain Rule (Composition Form)',
        body: "(f \\circ g)'(x) = f'(g(x)) \\cdot g'(x)",
      },
      {
        type: 'theorem',
        title: 'Chain Rule (Leibniz Form)',
        body: '\\text{If } y = f(u) \\text{ and } u = g(x), \\text{ then } \\dfrac{dy}{dx} = \\dfrac{dy}{du} \\cdot \\dfrac{du}{dx}',
      },
      {
        type: 'theorem',
        title: 'Generalized Power Rule',
        body: "\\frac{d}{dx}[u^n] = n\\,u^{n-1}\\cdot u', \\quad u = g(x)",
      },
      {
        type: 'theorem',
        title: 'Triple Composition (Extended Chain Rule)',
        body: "\\frac{d}{dx}[f(g(h(x)))] = f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)",
      },
    ],
    visualizations: [
      {
        id: 'ChainRuleMicroscope',
        title: 'Microscope Mode: The Visual Derivation',
        caption: 'As you zoom in on any differentiable curve, it becomes perfectly straight. The chain rule simply proves that feeding one line into another multiplies their slopes: m_total = m1 × m2.',
      },
    ],
  },

  rigor: {
    prose: [
      'The most natural "proof" of the chain rule goes like this: form the difference quotient for (f\u2218g) at x, multiply top and bottom by g(x+h) - g(x), and "cancel" to get [f(g(x+h)) - f(g(x))] / [g(x+h)-g(x)] times [g(x+h)-g(x)] / h. As h \u2192 0, the first factor approaches f\'(g(x)) and the second approaches g\'(x), giving the product f\'(g(x))\u00b7g\'(x). This argument has a fatal flaw: we divided by g(x+h) - g(x), but this quantity might equal zero for infinitely many values of h near 0 (even if g\'(x) \u2260 0), making the division illegal.',
      'A simple example of this flaw: take g(x) = x\u00b2sin(1/x) for x \u2260 0 and g(0) = 0. Then g\'(0) = 0, but g(h) = 0 for h = 1/(n\u03c0) for any integer n \u2260 0, which are values of h arbitrarily close to 0 where g(h) - g(0) = 0. If we divide by g(x+h) - g(x) in the naive proof at x = 0, we are dividing by zero for these special values of h.',
      'The correct proof uses the following approach. Define an auxiliary function \u03a6(k) = [f(g(x)+k) - f(g(x))] / k for k \u2260 0, and \u03a6(0) = f\'(g(x)). Because f is differentiable at g(x), we have lim(k\u21920) \u03a6(k) = f\'(g(x)) = \u03a6(0), so \u03a6 is continuous at 0. Now write: f(g(x+h)) - f(g(x)) = \u03a6(g(x+h)-g(x)) \u00b7 [g(x+h)-g(x)]. This is valid because when g(x+h)-g(x) \u2260 0, it follows the definition of \u03a6 with k = g(x+h)-g(x), and when g(x+h)-g(x) = 0, both sides are 0. Dividing by h: [f(g(x+h))-f(g(x))]/h = \u03a6(g(x+h)-g(x)) \u00b7 [g(x+h)-g(x)]/h. As h\u21920: \u03a6(g(x+h)-g(x)) \u2192 \u03a6(0) = f\'(g(x)) (because g is continuous, g(x+h)-g(x)\u21920, and \u03a6 is continuous at 0); [g(x+h)-g(x)]/h \u2192 g\'(x). The product of the limits is f\'(g(x))\u00b7g\'(x). This completes the rigorous proof.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'The Naive Proof Has a Flaw',
        body: "\\text{Multiplying and dividing by } g(x+h)-g(x) \\text{ is invalid} \\\\ \\text{when } g(x+h) - g(x) = 0, \\text{ which can happen for } h \\neq 0.",
      },
      {
        type: 'proof',
        title: 'Correct Proof Sketch',
        body: "\\Phi(k) = \\begin{cases} \\dfrac{f(g(x)+k)-f(g(x))}{k} & k\\neq 0 \\\\ f'(g(x)) & k=0 \\end{cases} \\implies (f\\circ g)'(x) = \\lim_{h\\to 0} \\Phi(g(x+h)-g(x))\\cdot\\frac{g(x+h)-g(x)}{h} = f'(g(x))\\cdot g'(x)",
      },
      {
        type: 'insight',
        title: 'Leibniz Form in Related Rates',
        body: "\\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt}, \\quad \\frac{dA}{dt} = \\frac{dA}{d\\theta}\\cdot\\frac{d\\theta}{dt}. \\text{ Intermediate-rate factors multiply along dependency chains.}",
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ch2-002-ex0',
      title: 'Why Chain Rule Works (Check by Expansion)',
      problem: 'Differentiate f(x) = (x^2+1)^3 two ways: (1) expand first, (2) use chain rule. Verify both match.',
      steps: [
        {
          expression: '(x^2+1)^3 = x^6 + 3x^4 + 3x^2 + 1',
          annotation: 'Method 1: expand using the binomial identity.',
        },
        {
          expression: 'f\'(x)=6x^5+12x^3+6x',
          annotation: 'Differentiate the expanded polynomial term by term.',
        },
        {
          expression: '\\text{Method 2: let } u=x^2+1,\\;f=u^3',
          annotation: 'Set up outer and inner layers for chain rule.',
        },
        {
          expression: 'f\'(x)=3u^2\\cdot u\'=3(x^2+1)^2\\cdot2x=6x(x^2+1)^2',
          annotation: 'Apply outer derivative times inner derivative.',
        },
        {
          expression: '6x(x^2+1)^2=6x(x^4+2x^2+1)=6x^5+12x^3+6x',
          annotation: 'Expand to confirm exact agreement with Method 1.',
        },
      ],
      conclusion: 'Both methods agree exactly. Chain rule is the compact form of algebra you would otherwise repeatedly expand.',
    },
    {
      id: 'ch2-002-ex1',
      title: 'Chain Rule with Power Function',
      problem: 'f(x) = (3x^2 - 1)^5. \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "\\text{Outer function: } F(u) = u^5 \\quad \\text{Inner function: } u = g(x) = 3x^2 - 1",
          annotation: 'Identify the outer and inner functions. The outer function is "raise to the fifth power" and the inner is 3x\u00b2-1.',
        },
        {
          expression: "F'(u) = 5u^4, \\quad g'(x) = 6x",
          annotation: 'Differentiate the outer function (power rule: bring down 5, reduce exponent to 4) and differentiate the inner function separately.',
        },
        {
          expression: "f'(x) = F'(g(x)) \\cdot g'(x) = 5(3x^2-1)^4 \\cdot 6x",
          annotation: 'Apply the chain rule: differentiate the outer function (giving 5u\u2074) evaluated at the inner function (replacing u with 3x\u00b2-1), then multiply by the derivative of the inner function.',
        },
        {
          expression: "= 30x(3x^2-1)^4",
          annotation: 'Multiply the constants 5 and 6 together: 5\u00b76 = 30. The (3x\u00b2-1)\u2074 factor remains as is.',
        },
      ],
      conclusion: 'f\'(x) = 30x(3x\u00b2-1)\u2074. The chain rule contributed the factor of 6x (the derivative of the inner function), which is what distinguishes this from just differentiating u\u2075.',
    },
    {
      id: 'ch2-002-ex2',
      title: 'Chain Rule with Square Root',
      problem: 'f(x) = \\sqrt{x^2+1}. \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "f(x) = (x^2+1)^{1/2}",
          annotation: 'Rewrite the square root as a power of 1/2 to clearly see the power function structure.',
        },
        {
          expression: "\\text{Outer: } F(u) = u^{1/2}, \\quad \\text{Inner: } u = x^2 + 1",
          annotation: 'Identify the outer function as the square root (or equivalently the 1/2 power) and the inner function as x\u00b2+1.',
        },
        {
          expression: "F'(u) = \\frac{1}{2}u^{-1/2} = \\frac{1}{2\\sqrt{u}}, \\quad g'(x) = 2x",
          annotation: 'Differentiate outer (power rule with n=1/2) and inner separately.',
        },
        {
          expression: "f'(x) = \\frac{1}{2}(x^2+1)^{-1/2} \\cdot 2x",
          annotation: 'Chain rule: F\'(g(x)) \u00b7 g\'(x). Replace u with x\u00b2+1 in the outer derivative, then multiply by 2x.',
        },
        {
          expression: "= \\frac{2x}{2(x^2+1)^{1/2}} = \\frac{x}{\\sqrt{x^2+1}}",
          annotation: 'Simplify: the factor of 2 in the numerator cancels with the 2 from the power rule denominator. Rewrite the negative power as a square root.',
        },
      ],
      conclusion: 'f\'(x) = x/\u221a(x\u00b2+1). Note that the derivative is 0 at x = 0 (horizontal tangent at the bottom of the U-shaped curve) and grows toward \u00b11 as x \u2192 \u00b1\u221e.',
    },
    {
      id: 'ch2-002-ex3',
      title: 'Chain Rule with Sine',
      problem: 'f(x) = \\sin(5x^3). \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\sin(u), \\quad \\text{Inner: } u = 5x^3",
          annotation: 'The outer function is the sine function and the inner function is 5x\u00b3.',
        },
        {
          expression: "F'(u) = \\cos(u), \\quad g'(x) = 15x^2",
          annotation: 'The derivative of sine is cosine (covered in the trig derivatives lesson). The derivative of the inner function 5x\u00b3 is 15x\u00b2 by the power and constant multiple rules.',
        },
        {
          expression: "f'(x) = \\cos(5x^3) \\cdot 15x^2",
          annotation: 'Apply the chain rule: differentiate the outer function (giving cos(u)), evaluated at the inner (replacing u with 5x\u00b3), then multiply by the inner derivative 15x\u00b2.',
        },
        {
          expression: "= 15x^2 \\cos(5x^3)",
          annotation: 'Rewrite with the constant factor first for standard form.',
        },
      ],
      conclusion: 'f\'(x) = 15x\u00b2 cos(5x\u00b3). This illustrates the general pattern: d/dx[sin(g(x))] = cos(g(x))\u00b7g\'(x). The argument of cosine is the same as the argument of sine was.',
    },
    {
      id: 'ch2-002-ex4',
      title: 'Chain Rule with Exponential (Preview)',
      problem: "f(x) = e^{x^2}. \\text{ Find } f'(x). \\text{ (Use the fact that } \\frac{d}{du}[e^u] = e^u.)",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = e^u, \\quad \\text{Inner: } u = x^2",
          annotation: 'The outer function is e to the power u, and the inner function is x\u00b2.',
        },
        {
          expression: "F'(u) = e^u, \\quad g'(x) = 2x",
          annotation: 'The key property of e^u is that it equals its own derivative (proved in the exponential derivatives lesson). The inner derivative is 2x.',
        },
        {
          expression: "f'(x) = e^{x^2} \\cdot 2x",
          annotation: 'Apply the chain rule: the outer derivative e^u evaluated at u = x\u00b2 gives e^(x\u00b2), times the inner derivative 2x.',
        },
        {
          expression: "= 2x\\,e^{x^2}",
          annotation: 'Rewrite with the constant factor first.',
        },
      ],
      conclusion: 'f\'(x) = 2xe^(x\u00b2). The function e^(x\u00b2) grows enormously fast but its derivative is not just itself — the chain rule contributes the factor of 2x from the exponent.',
    },
    {
      id: 'ch2-002-ex5',
      title: 'Chain Rule: Do Not Confuse (sin x)\u2074 with sin(x\u2074)',
      problem: 'f(x) = (\\sin x)^4. \\text{ Find } f\'(x). \\text{ Also note why this is different from } \\sin(x^4).',
      steps: [
        {
          expression: "\\text{Outer: } F(u) = u^4, \\quad \\text{Inner: } u = \\sin x",
          annotation: 'In (sin x)\u2074, the outer function is "raise to the fourth power" and the inner function is sin x. The entire sine is being raised to a power.',
        },
        {
          expression: "F'(u) = 4u^3, \\quad g'(x) = \\cos x",
          annotation: 'Differentiate outer: 4u\u00b3. Differentiate inner: d/dx[sin x] = cos x.',
        },
        {
          expression: "f'(x) = 4(\\sin x)^3 \\cdot \\cos x",
          annotation: 'Chain rule result. This is often written as 4 sin\u00b3(x) cos(x).',
        },
        {
          expression: "\\text{Compare: } \\frac{d}{dx}[\\sin(x^4)] = \\cos(x^4) \\cdot 4x^3",
          annotation: 'For sin(x\u2074), the outer function is sine and the inner is x\u2074. The derivative of sine is cosine evaluated at x\u2074, times the inner derivative 4x\u00b3. These are completely different functions.',
        },
      ],
      conclusion: 'f\'(x) = 4(sin x)\u00b3 cos x = 4 sin\u00b3(x) cos(x). The position of the exponent completely changes the meaning: (sin x)\u2074 means sin^4(x) [sine, then power], while sin(x\u2074) means the sine of x\u2074 [power, then sine].',
    },
    {
      id: 'ch2-002-ex6',
      title: 'Triple Composition',
      problem: 'f(x) = \\sin^4(x^2). \\text{ Find } f\'(x). \\text{ (This is } (\\sin(x^2))^4.)',
      steps: [
        {
          expression: "f(x) = [\\sin(x^2)]^4",
          annotation: 'Rewrite explicitly to show the structure: we are raising sin(x\u00b2) to the fourth power. This is a triple composition: the outermost is u\u2074, the middle is sin, the innermost is x\u00b2.',
        },
        {
          expression: "\\text{Layer 1 (outermost): } F(u) = u^4",
          annotation: 'The outermost function is the fourth power.',
        },
        {
          expression: "\\text{Layer 2 (middle): } G(v) = \\sin(v)",
          annotation: 'The middle function is the sine function.',
        },
        {
          expression: "\\text{Layer 3 (innermost): } H(x) = x^2",
          annotation: 'The innermost function is x\u00b2.',
        },
        {
          expression: "F'(u) = 4u^3, \\quad G'(v) = \\cos(v), \\quad H'(x) = 2x",
          annotation: 'Differentiate each layer independently.',
        },
        {
          expression: "f'(x) = F'(G(H(x))) \\cdot G'(H(x)) \\cdot H'(x)",
          annotation: 'Apply the extended chain rule: outer derivative (evaluated all the way at the inside) times middle derivative (evaluated at innermost) times innermost derivative.',
        },
        {
          expression: "= 4[\\sin(x^2)]^3 \\cdot \\cos(x^2) \\cdot 2x",
          annotation: 'Substitute: F\'(G(H(x))) = 4[sin(x\u00b2)]\u00b3, G\'(H(x)) = cos(x\u00b2), H\'(x) = 2x.',
        },
        {
          expression: "= 8x\\sin^3(x^2)\\cos(x^2)",
          annotation: 'Collect constants: 4\u00b72x = 8x. Write in standard form.',
        },
      ],
      conclusion: 'f\'(x) = 8x sin\u00b3(x\u00b2) cos(x\u00b2). Triple compositions peel away one layer at a time, each contributing its own derivative as a multiplicative factor.',
    },
    {
      id: 'ch2-002-ex7',
      title: 'Leibniz Form of Chain Rule',
      problem: 'If y = u^5 \\text{ and } u = 3x^2 - 1, \\text{ find } dy/dx \\text{ using Leibniz form.}',
      steps: [
        {
          expression: "\\frac{dy}{du} = 5u^4",
          annotation: 'Differentiate y = u\u2075 with respect to u, treating u as the independent variable.',
        },
        {
          expression: "\\frac{du}{dx} = 6x",
          annotation: 'Differentiate u = 3x\u00b2 - 1 with respect to x.',
        },
        {
          expression: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} = 5u^4 \\cdot 6x",
          annotation: 'Multiply the two rates together per the chain rule in Leibniz form. The du "terms" appear to cancel like fractions, though this is a notational convenience, not literal cancellation.',
        },
        {
          expression: "= 30x \\cdot u^4 = 30x(3x^2-1)^4",
          annotation: 'Substitute back u = 3x\u00b2-1 to express everything in terms of x. The final answer must be in terms of the original variable x.',
        },
      ],
      conclusion: 'This gives the same answer as the composition form: dy/dx = 30x(3x\u00b2-1)\u2074. The Leibniz form is particularly clear for related rates problems where the intermediate variable u has physical meaning.',
    },
    {
      id: 'ch2-002-ex8',
      title: 'Chain Rule Combined with Quotient Rule',
      problem: 'f(x) = \\dfrac{(x^2+1)^{3/2}}{x+1}. \\text{ Find } f\'(x).',
      steps: [
        {
          expression: "f(x) = \\frac{N(x)}{D(x)} \\text{ where } N(x) = (x^2+1)^{3/2}, \\; D(x) = x+1",
          annotation: 'Identify the numerator and denominator. The numerator requires the chain rule; the denominator is simple.',
        },
        {
          expression: "N'(x) = \\frac{3}{2}(x^2+1)^{1/2} \\cdot 2x = 3x(x^2+1)^{1/2} = \\frac{3x}{\\sqrt{x^2+1}} \\cdot (x^2+1)",
          annotation: 'Differentiate the numerator using the chain rule: outer is u^(3/2) giving (3/2)u^(1/2), inner is x\u00b2+1 giving 2x. Simplify: (3/2)\u00b72x = 3x.',
        },
        {
          expression: "N'(x) = 3x(x^2+1)^{1/2}",
          annotation: 'The derivative of the numerator is 3x\u221a(x\u00b2+1).',
        },
        {
          expression: "D'(x) = 1",
          annotation: 'The derivative of the denominator x+1 is simply 1.',
        },
        {
          expression: "f'(x) = \\frac{N'(x)D(x) - N(x)D'(x)}{[D(x)]^2}",
          annotation: 'Apply the quotient rule formula.',
        },
        {
          expression: "= \\frac{3x(x^2+1)^{1/2}(x+1) - (x^2+1)^{3/2}(1)}{(x+1)^2}",
          annotation: 'Substitute N, N\', D, D\' into the quotient rule.',
        },
        {
          expression: "= \\frac{(x^2+1)^{1/2}\\left[3x(x+1) - (x^2+1)\\right]}{(x+1)^2}",
          annotation: '{{algebra:factoring-fractional-powers|Factor out the lowest exponent (1/2)}} from both terms in the numerator.',
        },
        {
          expression: "= \\frac{(x^2+1)^{1/2}(3x^2 + 3x - x^2 - 1)}{(x+1)^2}",
          annotation: 'Expand inside the brackets: 3x(x+1) = 3x\u00b2+3x, then subtract x\u00b2+1.',
        },
        {
          expression: "= \\frac{\\sqrt{x^2+1}\\,(2x^2 + 3x - 1)}{(x+1)^2}",
          annotation: 'Combine like terms in the numerator: 3x\u00b2-x\u00b2=2x\u00b2. Rewrite (x\u00b2+1)^(1/2) as \u221a(x\u00b2+1).',
        },
      ],
      conclusion: 'f\'(x) = \u221a(x\u00b2+1) \u00b7 (2x\u00b2+3x-1) / (x+1)\u00b2. Factoring out the common (x\u00b2+1)^(1/2) factor from the quotient rule numerator is a key simplification technique.',
    },
    {
      id: 'ch2-002-ex9',
      title: 'Mini Backprop Chain (Single Neuron)',
      problem: 'Let y = \\sigma(z), z = wx+b, L = \\tfrac12(y-t)^2. Find dL/dw.',
      steps: [
        {
          expression: '\\frac{dL}{dy} = y-t',
          annotation: 'Differentiate the squared loss with respect to output y.',
        },
        {
          expression: '\\frac{dy}{dz} = \\sigma(z)(1-\\sigma(z)) = y(1-y)',
          annotation: 'Derivative of sigmoid activation.',
        },
        {
          expression: '\\frac{dz}{dw} = x',
          annotation: 'For z = wx+b, derivative with respect to w is x.',
        },
        {
          expression: '\\frac{dL}{dw} = \\frac{dL}{dy}\\cdot\\frac{dy}{dz}\\cdot\\frac{dz}{dw} = (y-t)\\,y(1-y)\\,x',
          annotation: 'Multiply local derivatives along the computation graph.',
        },
      ],
      conclusion: 'This local product is exactly the pattern repeated layer-by-layer in deep learning backpropagation.',
    },
    {
      id: 'ch2-002-ex10',
      title: 'Hook Problem: Balloon Volume Rate',
      problem: 'A sphere has radius r(t)=2t. With V=\\frac{4}{3}\\pi r^3, find dV/dt at t=3.',
      steps: [
        {
          expression: "V=\\frac{4}{3}\\pi r^3,\\quad r=2t",
          annotation: 'Volume depends on radius, and radius depends on time.',
        },
        {
          expression: "\\frac{dV}{dr}=4\\pi r^2,\\quad \\frac{dr}{dt}=2",
          annotation: 'Differentiate each stage with respect to its own variable.',
        },
        {
          expression: "\\frac{dV}{dt}=\\frac{dV}{dr}\\cdot\\frac{dr}{dt}=4\\pi r^2\\cdot 2=8\\pi r^2",
          annotation: 'Apply Leibniz chain form for related rates.',
        },
        {
          expression: "t=3 \\Rightarrow r=2(3)=6",
          annotation: 'Evaluate the intermediate quantity first.',
        },
        {
          expression: "\\left.\\frac{dV}{dt}\\right|_{t=3}=8\\pi(6)^2=288\\pi",
          annotation: 'Substitute r=6 into the rate formula.',
        },
      ],
      conclusion: 'At t=3, volume is increasing at 288\\pi cubic units per time unit.',
    },
  ],

  challenges: [
    {
      id: 'ch2-002-ch1',
      difficulty: 'easy',
      problem: '\\text{Differentiate } f(x) = (2x+1)^{10}.',
      hint: 'Identify the outer function as u^10 and the inner function as 2x+1.',
      walkthrough: [
        {
          expression: "\\text{Outer: } F(u) = u^{10},\\quad \\text{Inner: } u = 2x+1",
          annotation: 'Identify the composition structure.',
        },
        {
          expression: "F'(u) = 10u^9, \\quad u' = 2",
          annotation: 'Differentiate each piece.',
        },
        {
          expression: "f'(x) = 10(2x+1)^9 \\cdot 2 = 20(2x+1)^9",
          annotation: 'Apply the chain rule and simplify.',
        },
      ],
      answer: "f'(x) = 20(2x+1)^9",
    },
    {
      id: 'ch2-002-ch2',
      difficulty: 'medium',
      problem: '\\text{Differentiate } f(x) = \\sqrt{\\dfrac{x^2+1}{x-1}}.',
      hint: 'Write as ((x\u00b2+1)/(x-1))^(1/2). The outer function is u^(1/2) and the inner function is the quotient (x\u00b2+1)/(x-1), which requires the quotient rule to differentiate.',
      walkthrough: [
        {
          expression: "f(x) = \\left(\\frac{x^2+1}{x-1}\\right)^{1/2}",
          annotation: 'Rewrite the square root as a power.',
        },
        {
          expression: "\\text{Let } u = \\frac{x^2+1}{x-1}, \\text{ so } f = u^{1/2}",
          annotation: 'Define the inner function as the quotient.',
        },
        {
          expression: "\\frac{df}{du} = \\frac{1}{2}u^{-1/2} = \\frac{1}{2\\sqrt{u}}",
          annotation: 'Differentiate the outer square root.',
        },
        {
          expression: "\\frac{du}{dx} = \\frac{2x(x-1) - (x^2+1)(1)}{(x-1)^2} = \\frac{2x^2-2x-x^2-1}{(x-1)^2} = \\frac{x^2-2x-1}{(x-1)^2}",
          annotation: 'Apply the quotient rule to u = (x\u00b2+1)/(x-1).',
        },
        {
          expression: "f'(x) = \\frac{1}{2} \\cdot \\left(\\frac{x^2+1}{x-1}\\right)^{-1/2} \\cdot \\frac{x^2-2x-1}{(x-1)^2}",
          annotation: 'Combine via chain rule.',
        },
        {
          expression: "= \\frac{x^2-2x-1}{2(x-1)^2} \\cdot \\sqrt{\\frac{x-1}{x^2+1}} = \\frac{x^2-2x-1}{2(x-1)^{3/2}\\sqrt{x^2+1}}",
          annotation: 'Simplify u^(-1/2) = \u221a((x-1)/(x\u00b2+1)) and combine with the denominator.',
        },
      ],
      answer: "f'(x) = \\dfrac{x^2-2x-1}{2(x-1)^{3/2}\\sqrt{x^2+1}}",
    },
    {
      id: 'ch2-002-ch3',
      difficulty: 'hard',
      problem: "\\text{If } f \\text{ is differentiable and } g(x) = [f(x^2+1)]^2, \\text{ find } g'(x) \\text{ in terms of } f \\text{ and } f'.",
      hint: 'This is a triple composition: the outermost is squaring, the middle is f, the innermost is x\u00b2+1. Apply the extended chain rule.',
      walkthrough: [
        {
          expression: "g(x) = [f(x^2+1)]^2",
          annotation: 'Recognize this as a composition of three layers: outermost is u\u00b2, middle is f, innermost is x\u00b2+1.',
        },
        {
          expression: "\\text{Outer: } H(u) = u^2, \\quad \\text{Middle: } f(v) \\text{ (given)}, \\quad \\text{Inner: } v = x^2+1",
          annotation: 'Name each layer.',
        },
        {
          expression: "H'(u) = 2u, \\quad f'(v) \\text{ (given)}, \\quad v' = 2x",
          annotation: 'Differentiate each layer.',
        },
        {
          expression: "g'(x) = H'(f(x^2+1)) \\cdot f'(x^2+1) \\cdot (x^2+1)'",
          annotation: 'Apply the extended chain rule: outer derivative evaluated at middle-of-inner, times middle derivative evaluated at inner, times inner derivative.',
        },
        {
          expression: "= 2[f(x^2+1)] \\cdot f'(x^2+1) \\cdot 2x",
          annotation: 'Substitute: H\'(f(x\u00b2+1)) = 2f(x\u00b2+1), the middle derivative at x\u00b2+1 is f\'(x\u00b2+1), inner derivative is 2x.',
        },
        {
          expression: "= 4x\\,f(x^2+1)\\,f'(x^2+1)",
          annotation: 'Collect constants: 2\u00b72x = 4x.',
        },
      ],
      answer: "g'(x) = 4x\\,f(x^2+1)\\,f'(x^2+1)",
    },
  ],

  crossRefs: [
    { lessonSlug: 'differentiation-rules', label: 'Power, Product, Quotient Rules', context: 'The chain rule is combined with these rules constantly. The generalized power rule is chain rule plus power rule.' },
    { lessonSlug: 'trig-derivatives', label: 'Trig Derivatives', context: 'All trig derivative formulas extend to compositions via the chain rule: d/dx[sin(u)] = cos(u)u\'.' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Implicit differentiation is the chain rule applied to expressions in y where y = y(x).' },
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
    'completed-example-9',
    'completed-example-10',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
};
