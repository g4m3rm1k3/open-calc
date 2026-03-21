// FILE: src/content/chapter-2/03-trig-derivatives.js
export default {
  id: 'ch2-003',
  slug: 'trig-derivatives',
  chapter: 2,
  order: 3,
  title: 'Derivatives of Trigonometric Functions',
  subtitle: 'Why the slope of the sine curve is cosine GÇö and deriving all six trig derivatives',
  tags: ['sine derivative', 'cosine derivative', 'tangent derivative', 'trigonometric functions', 'trig limits', 'chain rule with trig'],
  aliases: 'section 3.5 derivatives trig functions formal proof sin cos tan cot sec csc limit definition derivative',

  hook: {
    question: 'A point moves around the unit circle at constant angular speed. Its y-coordinate is y = sin(\u03b8). When \u03b8 = 0, the point is at (1, 0) and is moving straight upward GÇö the y-coordinate is increasing as fast as it can. When \u03b8 = \u03c0/2, the point is at (0, 1), at the very top, momentarily moving horizontally GÇö the y-coordinate is not changing at all. When \u03b8 = \u03c0, the point is at (-1, 0) and is moving straight downward. These rates of change GÇö 1, 0, and -1 GÇö are exactly the values of cos(0), cos(\u03c0/2), and cos(\u03c0). Is it a coincidence that the rate of change of sine is cosine?',
    realWorldContext: 'Periodic phenomena dominate science and engineering: alternating current in electrical circuits, vibrations in mechanical systems, sound waves, ocean tides, the positions of planets. All of these are modeled using sine and cosine. To analyze how these quantities change GÇö how quickly a current switches direction, how rapidly a spring approaches equilibrium, how fast a tide is rising GÇö we need derivatives of trigonometric functions. The fact that d/dx[sin x] = cos x is not just elegant mathematics; it is the foundation of all oscillation and wave analysis.',
    previewVisualizationId: 'TrigDerivativeSync',
  },

  intuition: {
    prose: [
      'Imagine tracing around the unit circle as the angle \u03b8 increases from 0. The y-coordinate follows the sine function. Let\'s watch what happens to the SLOPE of the sine curve as \u03b8 varies.',
      'At \u03b8 = 0: the point (1, 0) is moving straight upward (tangent to the circle is vertical here). The y-coordinate is increasing at maximum rate. The slope of sin(\u03b8) at this point is 1. And cos(0) = 1. They agree.',
      'At \u03b8 = \u03c0/2: the point (0, 1) is at the very top of the circle, moving horizontally (leftward). The y-coordinate has just reached its peak and is about to decrease GÇö its rate of change is 0. The slope of sin(\u03b8) is 0. And cos(\u03c0/2) = 0. They agree.',
      'At \u03b8 = \u03c0: the point (-1, 0) is moving straight downward. The y-coordinate is decreasing at maximum rate. The slope is -1. And cos(\u03c0) = -1. They agree.',
      'At \u03b8 = 3\u03c0/2: the point (0, -1) is at the bottom of the circle, momentarily moving horizontally (rightward). The y-coordinate is at its minimum and about to increase GÇö rate of change is 0. And cos(3\u03c0/2) = 0. They agree.',
      'The pattern is unmistakable: the rate of change of the sine function at every angle equals the value of the cosine function at that angle. This is not a coincidence GÇö it is a theorem. The derivative of sin(\u03b8) is cos(\u03b8).',
      'There is also a beautiful geometric argument using the tangent to the unit circle. At the point (cos\u03b8, sin\u03b8) on the unit circle, the radius vector points in the direction (cos\u03b8, sin\u03b8). The tangent to the circle at this point is perpendicular to the radius, so it points in the direction (-sin\u03b8, cos\u03b8). This tangent direction has a "slope" component in the y-direction equal to cos\u03b8, confirming that dy/d\u03b8 = cos\u03b8.',
      'Now why does d/dx[cos x] = -sin x have a minus sign? At x = 0, cosine is at its maximum (value 1) and is about to decrease GÇö its rate of change is negative. Specifically, cos(0) = 1 is decreasing and -sin(0) = 0... wait, that\'s 0, not negative. But at x = \u03c0/4, the cosine is decreasing. Let\'s check: the slope of cos(x) at x = \u03c0/4 should be negative, and indeed -sin(\u03c0/4) = -\u221a2/2 < 0. More precisely: at x = 0, the cosine reaches its maximum, so its derivative is 0 there. For x slightly positive, cosine begins to decrease, so d/dx[cos x] should be negative. And -sin(x) is negative for x \u2208 (0, \u03c0), which matches.',
      'The minus sign in d/dx[cos x] = -sin x reflects the fact that cosine is always decreasing when sine is positive (between 0 and \u03c0) and increasing when sine is negative (between \u03c0 and 2\u03c0).',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Geometric Intuition: Unit Circle',
        body: '\\text{At } \\theta: \\text{ slope of } \\sin\\theta = \\cos\\theta \\text{ (rate of rise = cosine component of velocity)}',
      },
      {
        type: 'insight',
        title: 'The "co-" Functions All Have Minus Signs',
        body: "\\frac{d}{dx}[\\cos x] = -\\sin x, \\quad \\frac{d}{dx}[\\csc x] = -\\csc x\\cot x, \\quad \\frac{d}{dx}[\\cot x] = -\\csc^2 x",
      },
    ],
    visualizations: [
      {
        id: 'TrigDerivativeSync',
        title: 'The "Moving Point" Deep Sync',
        caption: 'Watch the velocity vector on the circle. When ++=0, the ball is traveling 100% vertically (arrow points straight up, vertical velocity = 1). Because vertical velocity is 1, the slope of the Sine curve is 1, and the value of the Cosine curve is 1. All three panels confirm the exact same truth.',
      },
      {
        id: 'SpringOscillation',
        title: 'Simple Harmonic Motion GÇö Derivatives in Action',
        caption: 'Position x(t)=A-+cos(-ët), velocity v(t)=GêÆA-ë-+sin(-ët), acceleration a(t)=GêÆA-ë-¦-+cos(-ët). Each graph is the derivative of the one above. This is why sin and cos are their own derivatives (up to sign).',
      },
      {
        id: 'DerivativeCycleClock',
        title: 'The Higher-Order Derivative Clock',
        caption: 'Click "d/dx GåÆ" to take successive derivatives. Every 4 steps returns to sin(x). Use the Instant Calculator to find the 43rd GÇö or 1000th GÇö derivative in one step.',
      },
      {
        id: 'TangentExplosion',
        title: 'Why tan(x) Explodes GÇö Quotient Rule Intuition',
        caption: 'Drag the slider toward x = -Ç/2. Watch the red cos(x) shrink toward zero while the blue sin(x) stays near 1. The purple tan(x) must explode because you\'re dividing by nearly nothing.',
      },
    ],
  },

  math: {
    prose: [
      'We state all six trigonometric derivative formulas. The first two (sine and cosine) are proved from the limit definition. The other four are derived using the quotient rule, since tan, csc, sec, and cot are all rational combinations of sine and cosine.',
      'Once we have d/dx[sin x] and d/dx[cos x], the quotient rule handles everything else. Recall that tan x = sin x / cos x, csc x = 1/sin x, sec x = 1/cos x, and cot x = cos x / sin x.',
      'The memory device for the four derived formulas: all three "co-" functions (cosine, cosecant, cotangent) have negative derivatives. The remaining three (sine, tangent, secant) have positive derivatives. Within each pair: sine and cosine swap (but cosine gets a minus sign), tangent becomes sec\u00b2, cotangent becomes -csc\u00b2, and secant and cosecant follow their own symmetric patterns.',
      'Every one of these formulas extends to compositions via the chain rule. For any differentiable function u = g(x): d/dx[sin(u)] = cos(u)\u00b7u\', d/dx[cos(u)] = -sin(u)\u00b7u\', d/dx[tan(u)] = sec\u00b2(u)\u00b7u\', and so on. These extended forms are the versions used in 90% of calculations.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Six Trig Derivatives',
        body: "\\begin{aligned} \\frac{d}{dx}[\\sin x] &= \\cos x \\\\ \\frac{d}{dx}[\\cos x] &= -\\sin x \\\\ \\frac{d}{dx}[\\tan x] &= \\sec^2 x \\\\ \\frac{d}{dx}[\\csc x] &= -\\csc x\\cot x \\\\ \\frac{d}{dx}[\\sec x] &= \\sec x\\tan x \\\\ \\frac{d}{dx}[\\cot x] &= -\\csc^2 x \\end{aligned}",
      },
      {
        type: 'theorem',
        title: 'Six Trig Derivatives with Chain Rule',
        body: "\\begin{aligned} \\frac{d}{dx}[\\sin u] &= \\cos u \\cdot u' \\\\ \\frac{d}{dx}[\\cos u] &= -\\sin u \\cdot u' \\\\ \\frac{d}{dx}[\\tan u] &= \\sec^2 u \\cdot u' \\end{aligned}",
      },
      {
        type: 'derivation',
        title: 'Deriving d/dx[tan x] via Quotient Rule',
        body: "\\frac{d}{dx}\\left[\\frac{\\sin x}{\\cos x}\\right] = \\frac{\\cos x \\cdot \\cos x - \\sin x \\cdot (-\\sin x)}{\\cos^2 x} = \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x",
      },
      {
        type: 'derivation',
        title: 'Deriving d/dx[csc x] via Quotient Rule',
        body: "\\frac{d}{dx}\\left[\\frac{1}{\\sin x}\\right] = \\frac{0 \\cdot \\sin x - 1 \\cdot \\cos x}{\\sin^2 x} = \\frac{-\\cos x}{\\sin^2 x} = -\\frac{1}{\\sin x}\\cdot\\frac{\\cos x}{\\sin x} = -\\csc x\\cot x",
      },
      {
        type: 'derivation',
        title: 'Deriving d/dx[cot x] via Quotient Rule',
        body: "\\frac{d}{dx}\\left[\\frac{\\cos x}{\\sin x}\\right] = \\frac{-\\sin x \\cdot \\sin x - \\cos x \\cdot \\cos x}{\\sin^2 x} = \\frac{-(\\sin^2 x + \\cos^2 x)}{\\sin^2 x} = \\frac{-1}{\\sin^2 x} = -\\csc^2 x",
      },
    ],
    visualizationId: 'TrigDerivativeSync',
    visualizationProps: {},
  },

  rigor: {
    prose: [
      'We now prove d/dx[sin x] = cos x rigorously from the limit definition. This proof depends on two fundamental trigonometric limits, which we state but do not re-derive here (they were established in the limits chapter): lim(h\u21920) sin(h)/h = 1 and lim(h\u21920) (1 - cos h)/h = 0.',
      'PROOF that d/dx[sin x] = cos x: Using the limit definition, d/dx[sin x] = lim(h\u21920) [sin(x+h) - sin(x)] / h. Apply the sine addition formula: sin(x+h) = sin(x)cos(h) + cos(x)sin(h). So the numerator becomes: sin(x)cos(h) + cos(x)sin(h) - sin(x) = sin(x)[cos(h) - 1] + cos(x)sin(h). Dividing by h: sin(x) \u00b7 [cos(h)-1]/h + cos(x) \u00b7 sin(h)/h.',
      'As h \u2192 0: the first term has sin(x) (a constant with respect to h) times [cos(h)-1]/h. Rearranging, [cos(h)-1]/h = -(1-cos h)/h \u2192 -0 = 0. The second term has cos(x) (constant) times sin(h)/h \u2192 1. Therefore the entire expression approaches sin(x)\u00b70 + cos(x)\u00b71 = cos(x). This completes the proof.',
      'PROOF that d/dx[cos x] = -sin x: Using the limit definition with the cosine addition formula cos(x+h) = cos(x)cos(h) - sin(x)sin(h): [cos(x+h)-cos(x)]/h = cos(x)\u00b7[cos(h)-1]/h - sin(x)\u00b7sin(h)/h. As h\u21920, the first term approaches cos(x)\u00b70 = 0 and the second approaches sin(x)\u00b71 = sin(x). So d/dx[cos x] = -sin(x). The minus sign comes from the minus sign in the cosine addition formula.',
      'The two key limits sin(h)/h \u2192 1 and (1-cos h)/h \u2192 0 as h \u2192 0 are the real engine of these proofs. The first was established geometrically by the squeeze theorem (the arc length h is squeezed between sin h and tan h for small h > 0). The second follows from the first via the identity (1-cos h)/h = sin\u00b2(h) / [h(1+cos h)] = [sin(h)/h] \u00b7 [sin(h)/(1+cos h)] \u2192 1\u00b70/2 = 0.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Fundamental Trig Limits',
        body: '\\lim_{h\\to 0}\\frac{\\sin h}{h} = 1 \\qquad \\lim_{h\\to 0}\\frac{1-\\cos h}{h} = 0',
      },
      {
        type: 'proof',
        title: 'Proof: d/dx[sin x] = cos x',
        body: "\\frac{d}{dx}[\\sin x] = \\lim_{h\\to 0}\\frac{\\sin(x+h)-\\sin x}{h} = \\lim_{h\\to 0}\\left[\\sin x\\cdot\\frac{\\cos h - 1}{h} + \\cos x \\cdot\\frac{\\sin h}{h}\\right] = \\sin x\\cdot 0 + \\cos x\\cdot 1 = \\cos x",
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ch2-003-ex1',
      title: 'Sine with Chain Rule',
      problem: "f(x) = \\sin(3x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\sin(u), \\quad \\text{Inner: } u = 3x",
          annotation: 'Identify the composition. The outer function is sine; the inner is 3x.',
        },
        {
          expression: "F'(u) = \\cos(u), \\quad u' = 3",
          annotation: 'Derivative of sine is cosine; derivative of the inner function 3x is 3.',
        },
        {
          expression: "f'(x) = \\cos(3x) \\cdot 3 = 3\\cos(3x)",
          annotation: 'Apply chain rule: outer derivative (cosine, evaluated at inner) times inner derivative (3). The argument of cosine is the same as the original argument of sine.',
        },
      ],
      conclusion: 'f\'(x) = 3cos(3x). The chain rule "multiplies in" the factor of 3 from the inner function. Without the chain rule, the answer would be cos(3x) GÇö missing the crucial factor of 3.',
    },
    {
      id: 'ch2-003-ex2',
      title: 'Product Rule with Cosine',
      problem: "f(x) = x^2 \\cos(x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Identify: } u(x) = x^2, \\quad v(x) = \\cos x",
          annotation: 'This is a product of two functions. Assign the first factor and second factor for the product rule.',
        },
        {
          expression: "u'(x) = 2x, \\quad v'(x) = -\\sin x",
          annotation: 'Differentiate each factor separately. d/dx[x\u00b2] = 2x by the power rule; d/dx[cos x] = -sin x.',
        },
        {
          expression: "f'(x) = u'v + uv' = (2x)(\\cos x) + (x^2)(-\\sin x)",
          annotation: 'Apply the product rule: (first)(second)\' + (first)\'(second).',
        },
        {
          expression: "= 2x\\cos x - x^2 \\sin x",
          annotation: 'Simplify by writing the two terms separately. This is the fully simplified form.',
        },
        {
          expression: "= x(2\\cos x - x\\sin x)",
          annotation: 'Optionally factor out x from both terms. This factored form can be useful for finding zeros.',
        },
      ],
      conclusion: 'f\'(x) = 2x cos(x) - x\u00b2 sin(x). The product rule gives two terms: the first represents the rate of change from the x\u00b2 factor, and the second from the cos(x) factor.',
    },
    {
      id: 'ch2-003-ex3',
      title: 'Tangent with Chain Rule',
      problem: "f(x) = \\tan(x^2+1). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\tan u, \\quad \\text{Inner: } u = x^2 + 1",
          annotation: 'Identify the composition. The outer function is tangent; the inner is x\u00b2+1.',
        },
        {
          expression: "F'(u) = \\sec^2 u, \\quad u' = 2x",
          annotation: 'The derivative of tan(u) is sec\u00b2(u). The inner derivative is 2x.',
        },
        {
          expression: "f'(x) = \\sec^2(x^2+1) \\cdot 2x = 2x\\sec^2(x^2+1)",
          annotation: 'Apply chain rule: outer derivative (sec\u00b2, evaluated at x\u00b2+1) times inner derivative (2x).',
        },
      ],
      conclusion: 'f\'(x) = 2x sec\u00b2(x\u00b2+1). The derivative of tangent is always sec\u00b2, and when the argument is a function of x, the chain rule contributes the derivative of that argument.',
    },
    {
      id: 'ch2-003-ex4',
      title: 'Power of Sine GÇö Chain Rule',
      problem: "f(x) = \\sin^2(x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "f(x) = (\\sin x)^2",
          annotation: 'Rewrite sin\u00b2(x) explicitly as (sin x)\u00b2 to make the composition structure clear. The outer function is squaring; the inner is sine.',
        },
        {
          expression: "\\text{Outer: } F(u) = u^2, \\quad \\text{Inner: } u = \\sin x",
          annotation: 'Identify the layers.',
        },
        {
          expression: "F'(u) = 2u, \\quad u' = \\cos x",
          annotation: 'Differentiate each layer.',
        },
        {
          expression: "f'(x) = 2\\sin x \\cdot \\cos x",
          annotation: 'Chain rule: 2u evaluated at u = sin x gives 2 sin x, times the inner derivative cos x.',
        },
        {
          expression: "= \\sin(2x)",
          annotation: 'Apply the double angle identity: 2 sin(x) cos(x) = sin(2x). This is a nice simplification, though both forms are correct.',
        },
      ],
      conclusion: 'f\'(x) = 2 sin(x) cos(x) = sin(2x). The double angle identity provides a beautiful simplification here.',
    },
    {
      id: 'ch2-003-ex5',
      title: 'Composition of Two Trig Functions',
      problem: "f(x) = \\cos(\\sin x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Outer: } F(u) = \\cos u, \\quad \\text{Inner: } u = \\sin x",
          annotation: 'Both outer and inner functions are trigonometric. The outer is cosine (acting on the result of sine) and the inner is sine.',
        },
        {
          expression: "F'(u) = -\\sin u, \\quad u' = \\cos x",
          annotation: 'Differentiate each layer: derivative of cosine is negative sine; derivative of sin x is cos x.',
        },
        {
          expression: "f'(x) = -\\sin(\\sin x) \\cdot \\cos x",
          annotation: 'Apply chain rule: outer derivative -sin(u) evaluated at u = sin x gives -sin(sin x), times the inner derivative cos x.',
        },
      ],
      conclusion: 'f\'(x) = -cos(x) sin(sin x). Note that the argument of the outermost sine is sin(x), not x GÇö we evaluate the outer derivative at the inner function, preserving the inner function completely.',
    },
    {
      id: 'ch2-003-ex6',
      title: 'Product Rule with Chain Rule: Secant Times Tangent',
      problem: "f(x) = \\sec(5x)\\cdot\\tan(5x). \\text{ Find } f'(x).",
      steps: [
        {
          expression: "\\text{Let } u(x) = \\sec(5x), \\quad v(x) = \\tan(5x)",
          annotation: 'This is a product of two functions, each requiring the chain rule.',
        },
        {
          expression: "u'(x) = \\sec(5x)\\tan(5x) \\cdot 5 = 5\\sec(5x)\\tan(5x)",
          annotation: 'Differentiate sec(5x) using the chain rule: d/dx[sec u] = sec u tan u times u\'. Here u = 5x and u\' = 5.',
        },
        {
          expression: "v'(x) = \\sec^2(5x) \\cdot 5 = 5\\sec^2(5x)",
          annotation: 'Differentiate tan(5x) using the chain rule: d/dx[tan u] = sec\u00b2 u times u\'. Here u = 5x and u\' = 5.',
        },
        {
          expression: "f'(x) = u'v + uv' = [5\\sec(5x)\\tan(5x)]\\cdot\\tan(5x) + \\sec(5x)\\cdot[5\\sec^2(5x)]",
          annotation: 'Apply the product rule.',
        },
        {
          expression: "= 5\\sec(5x)\\tan^2(5x) + 5\\sec^3(5x)",
          annotation: 'Expand: tan(5x) \u00b7 tan(5x) = tan\u00b2(5x) and sec(5x) \u00b7 sec\u00b2(5x) = sec\u00b3(5x).',
        },
        {
          expression: "= 5\\sec(5x)[\\tan^2(5x) + \\sec^2(5x)]",
          annotation: 'Factor out 5 sec(5x) from both terms.',
        },
      ],
      conclusion: 'f\'(x) = 5 sec(5x)[tan\u00b2(5x) + sec\u00b2(5x)]. This can be further simplified using the identity tan\u00b2(x) + 1 = sec\u00b2(x), giving tan\u00b2+sec\u00b2 = sec\u00b2-1+sec\u00b2 = 2sec\u00b2-1.',
    },
    {
      id: 'ch2-003-ex7',
      title: 'Quotient Rule with Sine',
      problem: "f(x) = \\frac{1+\\sin x}{1-\\sin x}. \\text{ Find } f'(x) \\text{ and simplify.}",
      steps: [
        {
          expression: "\\text{Numerator: } N = 1+\\sin x, \\quad \\text{Denominator: } D = 1-\\sin x",
          annotation: 'Identify numerator and denominator for the quotient rule.',
        },
        {
          expression: "N' = \\cos x, \\quad D' = -\\cos x",
          annotation: 'Differentiate numerator: d/dx[1+sin x] = cos x. Differentiate denominator: d/dx[1-sin x] = -cos x.',
        },
        {
          expression: "f'(x) = \\frac{N'D - ND'}{D^2} = \\frac{\\cos x(1-\\sin x) - (1+\\sin x)(-\\cos x)}{(1-\\sin x)^2}",
          annotation: 'Apply the quotient rule.',
        },
        {
          expression: "= \\frac{\\cos x(1-\\sin x) + \\cos x(1+\\sin x)}{(1-\\sin x)^2}",
          annotation: 'Distribute the negative sign on the second term: -(1+sin x)(-cos x) = +cos x(1+sin x).',
        },
        {
          expression: "= \\frac{\\cos x[(1-\\sin x) + (1+\\sin x)]}{(1-\\sin x)^2}",
          annotation: 'Factor cos x from both terms in the numerator.',
        },
        {
          expression: "= \\frac{\\cos x \\cdot 2}{(1-\\sin x)^2} = \\frac{2\\cos x}{(1-\\sin x)^2}",
          annotation: 'Simplify inside the brackets: (1-sin x)+(1+sin x) = 2. The sin x terms cancel.',
        },
      ],
      conclusion: 'f\'(x) = 2cos(x) / (1-sin x)\u00b2. The simplification of the numerator was made possible by factoring out cos x.',
    },
    {
      id: 'ch2-003-ex8',
      title: 'Tangent Line to Sine Curve',
      problem: "\\text{Find the equation of the tangent line to } f(x) = \\sin x \\text{ at } x = \\pi/3.",
      steps: [
        {
          expression: "f'(x) = \\cos x",
          annotation: 'The derivative of sin x is cos x GÇö no chain rule needed since the argument is just x.',
        },
        {
          expression: "f'(\\pi/3) = \\cos(\\pi/3) = \\frac{1}{2}",
          annotation: 'Evaluate the derivative at x = \u03c0/3. From the unit circle, cos(\u03c0/3) = 1/2.',
        },
        {
          expression: "f(\\pi/3) = \\sin(\\pi/3) = \\frac{\\sqrt{3}}{2}",
          annotation: 'Find the y-coordinate of the tangent point. From the unit circle, sin(\u03c0/3) = \u221a3/2.',
        },
        {
          expression: "y - \\frac{\\sqrt{3}}{2} = \\frac{1}{2}\\left(x - \\frac{\\pi}{3}\\right)",
          annotation: 'Write in point-slope form with point (\u03c0/3, \u221a3/2) and slope 1/2.',
        },
        {
          expression: "y = \\frac{1}{2}x - \\frac{\\pi}{6} + \\frac{\\sqrt{3}}{2}",
          annotation: 'Distribute 1/2 across (x - \u03c0/3) = x - \u03c0/3, giving (1/2)x - \u03c0/6, then add \u221a3/2.',
        },
      ],
      conclusion: 'The tangent line is y = (1/2)x + (\u221a3/2 - \u03c0/6). At x = \u03c0/3 \u2248 1.047, the sine curve has slope exactly 1/2 GÇö the curve is rising gently as it approaches its peak at x = \u03c0/2.',
    },
  ],

  challenges: [
    {
      id: 'ch2-003-ch1',
      difficulty: 'easy',
      problem: '\\text{Differentiate } f(x) = 3\\cos x - 4\\sin x.',
      hint: 'Apply the derivative rules for sine and cosine term by term. Use the constant multiple rule.',
      walkthrough: [
        {
          expression: "f'(x) = 3 \\cdot \\frac{d}{dx}[\\cos x] - 4 \\cdot \\frac{d}{dx}[\\sin x]",
          annotation: 'Apply the sum rule and constant multiple rule.',
        },
        {
          expression: "= 3(-\\sin x) - 4(\\cos x)",
          annotation: 'Use d/dx[cos x] = -sin x and d/dx[sin x] = cos x.',
        },
        {
          expression: "= -3\\sin x - 4\\cos x",
          annotation: 'Final simplified form.',
        },
      ],
      answer: "f'(x) = -3\\sin x - 4\\cos x",
    },
    {
      id: 'ch2-003-ch2',
      difficulty: 'medium',
      problem: 'Prove from the quotient rule that \\dfrac{d}{dx}[\\sec x] = \\sec x \\tan x.',
      hint: 'Write sec x = 1/cos x and apply the quotient rule with numerator 1 and denominator cos x.',
      walkthrough: [
        {
          expression: "\\sec x = \\frac{1}{\\cos x}",
          annotation: 'Write secant in terms of cosine.',
        },
        {
          expression: "\\frac{d}{dx}\\left[\\frac{1}{\\cos x}\\right] = \\frac{0 \\cdot \\cos x - 1 \\cdot (-\\sin x)}{\\cos^2 x}",
          annotation: 'Apply the quotient rule: numerator is (N\'D - ND\'). N = 1, N\' = 0, D = cos x, D\' = -sin x.',
        },
        {
          expression: "= \\frac{\\sin x}{\\cos^2 x}",
          annotation: 'Simplify numerator: 0\u00b7cos x = 0 and -1\u00b7(-sin x) = sin x.',
        },
        {
          expression: "= \\frac{\\sin x}{\\cos x} \\cdot \\frac{1}{\\cos x} = \\tan x \\cdot \\sec x",
          annotation: 'Split the fraction: sin x / cos x = tan x and 1/cos x = sec x.',
        },
        {
          expression: "= \\sec x \\tan x \\quad \\blacksquare",
          annotation: 'Rewrite in standard order.',
        },
      ],
      answer: '\\dfrac{d}{dx}[\\sec x] = \\sec x \\tan x',
    },
    {
      id: 'ch2-003-ch3',
      difficulty: 'hard',
      problem: '\\text{Find all } x \\in [0, 2\\pi] \\text{ where } f(x) = 2\\sin x - \\sin(2x) \\text{ has a horizontal tangent line.}',
      hint: 'Set f\'(x) = 0. You will need the chain rule for sin(2x). Then use the identity sin(2x) = 2sin(x)cos(x) or factor the resulting equation. There are 4 solutions in [0, 2\u03c0].',
      walkthrough: [
        {
          expression: "f'(x) = 2\\cos x - \\frac{d}{dx}[\\sin(2x)]",
          annotation: 'Differentiate term by term.',
        },
        {
          expression: "\\frac{d}{dx}[\\sin(2x)] = \\cos(2x) \\cdot 2 = 2\\cos(2x)",
          annotation: 'Apply the chain rule to sin(2x): outer derivative is cosine, inner is 2x with derivative 2.',
        },
        {
          expression: "f'(x) = 2\\cos x - 2\\cos(2x)",
          annotation: 'Combine the derivatives.',
        },
        {
          expression: "f'(x) = 0 \\implies 2\\cos x - 2\\cos(2x) = 0 \\implies \\cos x = \\cos(2x)",
          annotation: 'Set equal to zero and divide by 2.',
        },
        {
          expression: "\\cos(2x) = 2\\cos^2 x - 1",
          annotation: 'Use the double angle identity to express cos(2x) in terms of cos(x).',
        },
        {
          expression: "\\cos x = 2\\cos^2 x - 1 \\implies 2\\cos^2 x - \\cos x - 1 = 0",
          annotation: 'Substitute and rearrange into a quadratic in cos x.',
        },
        {
          expression: "(2\\cos x + 1)(\\cos x - 1) = 0",
          annotation: 'Factor the quadratic: check that (2u+1)(u-1) = 2u\u00b2-u-1. G£ô',
        },
        {
          expression: "\\cos x = -\\frac{1}{2} \\quad \\text{or} \\quad \\cos x = 1",
          annotation: 'Set each factor equal to zero.',
        },
        {
          expression: "\\cos x = 1 \\implies x = 0 \\text{ (and } 2\\pi \\text{, but that\'s the endpoint)}",
          annotation: 'In [0, 2\u03c0], cos x = 1 at x = 0 (and at 2\u03c0 = 0 again at the boundary).',
        },
        {
          expression: "\\cos x = -\\tfrac{1}{2} \\implies x = \\frac{2\\pi}{3} \\text{ or } x = \\frac{4\\pi}{3}",
          annotation: 'In [0, 2\u03c0], cos x = -1/2 at x = 2\u03c0/3 (second quadrant, reference angle \u03c0/3) and x = 4\u03c0/3 (third quadrant).',
        },
        {
          expression: "x \\in \\left\\{0,\\; \\frac{2\\pi}{3},\\; \\frac{4\\pi}{3}\\right\\} \\text{ on } [0,2\\pi]",
          annotation: 'Collect all solutions. (x = 2\u03c0 is the same point as x = 0 on the circle, included if the interval is closed.)',
        },
      ],
      answer: 'x = 0,\\; \\dfrac{2\\pi}{3},\\; \\dfrac{4\\pi}{3} \\; (\\text{and } 2\\pi \\text{ if counted})',
    },
  ],

  crossRefs: [
    { lessonSlug: 'chain-rule', label: 'The Chain Rule', context: 'Every trig derivative formula extends to compositions via the chain rule. Most applied trig differentiation involves the chain rule.' },
    { lessonSlug: 'tangent-problem', label: 'Limit Definition', context: 'The proof of d/dx[sin x] = cos x uses the limit definition and the fundamental trig limits.' },
    { lessonSlug: 'implicit-differentiation', label: 'Implicit Differentiation', context: 'Trig functions appear frequently in implicit equations; their derivatives are used in implicit differentiation.' },
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
