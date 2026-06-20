export default {
  id: 'ch0-inverse-trig-functions',
  slug: 'inverse-trig-functions',
  chapter: 0,
  order: 12,
  title: 'Inverse Trigonometric Functions',
  subtitle: 'Reversing sine, cosine, and tangent — domains, graphs, and exact values',
  tags: ['arcsin', 'arccos', 'arctan', 'inverse-trig', 'domain', 'range', 'exact-values', 'unit-circle'],

  hook: {
    question: 'If sin(θ) = 0.5, what is θ? And why can\'t we just say "the sine of what angle gives 0.5?"',
    realWorldContext:
      'A surveyor measures the ratio of opposite to hypotenuse in a right triangle and gets 0.866. To find the actual angle, ' +
      'they need to "undo" the sine function — that\'s arcsin. GPS systems, robotics, and graphics engines use arctan ' +
      'dozens of times per second to convert (x, y) coordinates into angles. ' +
      'In calculus, arcsin, arccos, and arctan appear as antiderivatives of algebraic expressions — ' +
      'so every integral of the form ∫ 1/√(1−x²) dx is secretly arcsin in disguise. ' +
      'Understanding inverse trig now means you\'ll recognize these patterns immediately when integration arrives.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'The sine function takes an angle and returns a ratio. The **inverse sine** (arcsin) takes a ratio and returns the angle. ' +
          'But here\'s the problem: sin(30°) = 0.5, AND sin(150°) = 0.5, AND sin(390°) = 0.5, ...' +
          'If we want a function (one input → one output), we have to **restrict the domain** of sine so it becomes one-to-one first.',
          'We fix sine to the interval **[−π/2, π/2]** — the right half of the unit circle from bottom to top. ' +
          'On this restricted piece, sine is strictly increasing, so it has an inverse. ' +
          'That inverse is called **arcsin** or sin⁻¹.',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'warning',
          title: 'sin⁻¹(x) ≠ 1/sin(x)',
          body: 'The superscript −1 on inverse trig functions means "inverse function," NOT a reciprocal. ' +
                'sin⁻¹(x) = arcsin(x) is the angle whose sine is x. ' +
                'The reciprocal of sin is written csc(x) = 1/sin(x). These are completely different things.',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'intuition',
          title: 'The Three Restricted Domains',
          body: '• arcsin — restrict sin to [−π/2, π/2] (quadrants IV and I)\n' +
                '• arccos — restrict cos to [0, π] (quadrants I and II)\n' +
                '• arctan — restrict tan to (−π/2, π/2) (quadrants IV and I, open because tan has asymptotes)',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'Inverse Trig Graphs Explorer',
        mathBridge:
          'Each inverse trig function is the reflection of its restricted parent function across the line y = x. ' +
          'arcsin has domain [−1, 1] and range [−π/2, π/2]. ' +
          'arccos has domain [−1, 1] and range [0, π]. ' +
          'arctan has domain (−∞, ∞) and range (−π/2, π/2).',
        caption: 'Toggle between arcsin, arccos, and arctan. Notice how the restricted parent "unfolds" into the inverse.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Why different restrictions for arccos?** We restrict cosine to [0, π] because cosine is strictly decreasing there, making it one-to-one. The range of arccos is therefore [0, π] — angles in quadrants I and II. ' +
          'This means arccos always gives a non-negative output, unlike arcsin which can give negative outputs.',
          '**arctan has a domain of all reals** because tangent defined on (−π/2, π/2) maps to all real numbers (from −∞ to +∞). ' +
          'arctan(x) has two horizontal asymptotes: y = −π/2 as x → −∞, and y = π/2 as x → +∞.',
        ],
      },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'arcsin (inverse sine)',
          body: '\\sin^{-1}(x) = \\arcsin(x) = \\theta \\iff \\sin(\\theta) = x \\text{ and } \\theta \\in \\left[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}\\right] \\\\ \\text{Domain: } [-1,1] \\qquad \\text{Range: } \\left[-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}\\right]',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'arccos (inverse cosine)',
          body: '\\cos^{-1}(x) = \\arccos(x) = \\theta \\iff \\cos(\\theta) = x \\text{ and } \\theta \\in [0,\\pi] \\\\ \\text{Domain: } [-1,1] \\qquad \\text{Range: } [0,\\pi]',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'arctan (inverse tangent)',
          body: '\\tan^{-1}(x) = \\arctan(x) = \\theta \\iff \\tan(\\theta) = x \\text{ and } \\theta \\in \\left(-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}\\right) \\\\ \\text{Domain: } (-\\infty,\\infty) \\qquad \\text{Range: } \\left(-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}\\right)',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Key exact values to memorize** (these come directly from the unit circle):',
          '| x | arcsin(x) | arccos(x) | arctan(x) |',
          '|---|-----------|-----------|-----------|',
          '| −1 | −π/2 | π | — |',
          '| −√3/2 | −π/3 | 5π/6 | — |',
          '| −√2/2 | −π/4 | 3π/4 | — |',
          '| −1/2 | −π/6 | 2π/3 | — |',
          '| 0 | 0 | π/2 | 0 |',
          '| 1/2 | π/6 | π/3 | — |',
          '| √2/2 | π/4 | π/4 | — |',
          '| √3/2 | π/3 | π/6 | — |',
          '| 1 | π/2 | 0 | — |',
          '| √3 | — | — | π/3 |',
          '| 1 | — | — | π/4 |',
          '| 1/√3 | — | — | π/6 |',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'tip',
          title: 'The Complementary Angle Identity',
          body: '\\arcsin(x) + \\arccos(x) = \\dfrac{\\pi}{2} \\text{ for all } x \\in [-1,1] \\\\ \\text{This makes sense geometrically: if } \\sin\\theta = x, \\text{ then } \\cos(\\tfrac{\\pi}{2} - \\theta) = x, \\text{ so the two angles are complementary.}',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Composition identities** — these are used constantly in calculus to simplify expressions:',
          '• sin(arcsin(x)) = x for x ∈ [−1, 1] &nbsp;&nbsp; (obvious — they cancel)',
          '• arcsin(sin(x)) = x ONLY for x ∈ [−π/2, π/2] &nbsp;&nbsp; (NOT for all x!)',
          '• cos(arcsin(x)) = √(1−x²) &nbsp;&nbsp; (use the Pythagorean identity: if sin θ = x, then cos θ = √(1−x²) for θ in Q1/Q4)',
          '• tan(arcsin(x)) = x/√(1−x²)',
          '• sec(arctan(x)) = √(1+x²) &nbsp;&nbsp; (draw the right triangle: opp=x, adj=1, hyp=√(1+x²))',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'The Right-Triangle Method',
          body: 'To evaluate a composition like cos(arcsin(x)):\n' +
                '1. Let θ = arcsin(x), so sin θ = x\n' +
                '2. Draw a right triangle with opposite = x, hypotenuse = 1\n' +
                '3. By Pythagoras: adjacent = √(1 − x²)\n' +
                '4. Read off: cos θ = adjacent/hypotenuse = √(1 − x²)\n' +
                'This triangle method works for ANY composition of trig and inverse trig.',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'Right Triangle Inverse Trig',
        mathBridge: 'Given arcsin(x), arccos(x), or arctan(x), label the sides of the corresponding right triangle and read off any trig ratio.',
        caption: 'Drag the slider to change x. Watch the right triangle update and all six trig values auto-compute.',
      },
    ],
  },

  rigor: {
    prose: [
      'The inverse trig functions are defined by the principle of **restricting the domain** to make a non-injective function injective.',
      'Formally: a function f : A → B has an inverse if and only if f is a bijection. Sine on ℝ is not injective (sin(x) = sin(π − x) for all x), ' +
      'so we restrict to [−π/2, π/2] where sine is strictly increasing — hence injective. ' +
      'On this restricted domain, sine is also surjective onto [−1, 1], making it a bijection, and therefore invertible.',
      'Why [−π/2, π/2] for sine and not [0, π]? Convention: we want the inverse to cover both positive and negative outputs symmetrically about 0. ' +
      'On [0, π], sine is non-negative, which would restrict arcsin to only return non-negative angles — less useful. ' +
      'The restriction [−π/2, π/2] is the accepted standard.',
      '**Differentiability of arcsin**: Using implicit differentiation on y = arcsin(x) (so sin(y) = x):',
      'Differentiating: cos(y) · dy/dx = 1, giving dy/dx = 1/cos(y). ' +
      'Since y ∈ [−π/2, π/2], cos(y) ≥ 0, so cos(y) = √(1 − sin²(y)) = √(1 − x²). ' +
      'Therefore (arcsin)\'(x) = 1/√(1 − x²). This is one of the standard antiderivative forms you will use throughout Calc 2.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Derivatives of Inverse Trig (Preview)',
        body: '\\frac{d}{dx}\\arcsin(x) = \\dfrac{1}{\\sqrt{1-x^2}} \\qquad |x| < 1 \\\\ \\frac{d}{dx}\\arccos(x) = -\\dfrac{1}{\\sqrt{1-x^2}} \\qquad |x| < 1 \\\\ \\frac{d}{dx}\\arctan(x) = \\dfrac{1}{1+x^2}',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-arcsin-exact',
      title: 'Exact Values of Inverse Trig',
      problem: 'Evaluate exactly (in radians): (a) arcsin(−√2/2),\\; (b) arccos(0),\\; (c) arctan(−√3).',
      steps: [
        {
          expression: '\\textbf{(a) } \\arcsin(-\\sqrt{2}/2)',
          annotation: 'Ask: what angle θ in [−π/2, π/2] has sin θ = −√2/2?',
        },
        {
          expression: 'θ = -π/4, \\text{ since } \\sin(-π/4) = -\\sin(π/4) = -\\frac{\\sqrt{2}}{2}\\;\\checkmark',
          annotation: 'Negative angles are in [−π/2, 0], which is within the arcsin range.',
        },
        {
          expression: '\\arcsin(-\\sqrt{2}/2) = -\\dfrac{\\pi}{4}',
          annotation: '',
        },
        {
          expression: '\\textbf{(b) } \\arccos(0)',
          annotation: 'Ask: what angle θ in [0, π] has cos θ = 0?',
        },
        {
          expression: 'θ = π/2, \\text{ since } \\cos(π/2) = 0\\;\\checkmark',
          annotation: 'cos(π/2) = 0. This is the only angle in [0, π] with cos = 0.',
        },
        {
          expression: '\\arccos(0) = \\dfrac{\\pi}{2}',
          annotation: '',
        },
        {
          expression: '\\textbf{(c) } \\arctan(-\\sqrt{3})',
          annotation: 'Ask: what angle θ in (−π/2, π/2) has tan θ = −√3?',
        },
        {
          expression: 'θ = -π/3, \\text{ since } \\tan(-π/3) = -\\tan(π/3) = -\\sqrt{3}\\;\\checkmark',
          annotation: 'tan(π/3) = √3 (from the 30-60-90 triangle), so arctan(−√3) = −π/3.',
        },
        {
          expression: '\\arctan(-\\sqrt{3}) = -\\dfrac{\\pi}{3}',
          annotation: '',
        },
      ],
      conclusion: 'Always work from the unit circle: identify the reference angle first, then apply the correct sign based on the restricted range of the inverse function.',
    },
    {
      id: 'ex-composition-trig',
      title: 'Evaluating Compositions Using the Triangle Method',
      problem: 'Evaluate \\cos\\!\\left(\\arcsin\\!\\left(\\tfrac{3}{5}\\right)\\right) and \\tan\\!\\left(\\arccos\\!\\left(\\tfrac{3}{5}\\right)\\right).',
      steps: [
        {
          expression: '\\textbf{Part 1: } \\cos(\\arcsin(3/5))',
          annotation: 'Let θ = arcsin(3/5), so sin θ = 3/5 and θ ∈ [−π/2, π/2].',
        },
        {
          expression: '\\text{Right triangle: opp} = 3, \\text{ hyp} = 5 \\Rightarrow \\text{adj} = \\sqrt{25-9} = 4',
          annotation: 'Pythagorean theorem: 3² + adj² = 5².',
        },
        {
          expression: '\\cos(\\arcsin(3/5)) = \\frac{\\text{adj}}{\\text{hyp}} = \\frac{4}{5}',
          annotation: 'Since θ is in [−π/2, π/2], cosine is non-negative. ✓',
        },
        {
          expression: '\\textbf{Part 2: } \\tan(\\arccos(3/5))',
          annotation: 'Let φ = arccos(3/5), so cos φ = 3/5 and φ ∈ [0, π].',
        },
        {
          expression: '\\text{Right triangle: adj} = 3, \\text{ hyp} = 5 \\Rightarrow \\text{opp} = 4',
          annotation: 'Same triangle — just labeled differently.',
        },
        {
          expression: '\\tan(\\arccos(3/5)) = \\frac{\\text{opp}}{\\text{adj}} = \\frac{4}{3}',
          annotation: 'φ ∈ [0, π/2] since cos φ > 0, so both sin and tan are positive.',
        },
      ],
      conclusion: 'The right-triangle technique is universal: label the sides from the definition of the inverse trig, apply Pythagoras, then read off the required ratio. No tables or decimals needed.',
    },
    {
      id: 'ex-arcsin-equation',
      title: 'Solving a Trig Equation Using arcsin',
      problem: 'Find ALL solutions to \\sin(2x) = \\frac{\\sqrt{3}}{2} on [0, 2π).',
      steps: [
        {
          expression: '\\sin(2x) = \\frac{\\sqrt{3}}{2}',
          annotation: 'Let u = 2x. As x ∈ [0, 2π), we have u ∈ [0, 4π).',
        },
        {
          expression: 'u = \\arcsin\\!\\left(\\frac{\\sqrt{3}}{2}\\right) = \\frac{\\pi}{3}',
          annotation: 'Principal value from the restricted domain [−π/2, π/2].',
        },
        {
          expression: 'u = \\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}',
          annotation: 'Second solution in [0, 2π): sine is also positive in Q2, and sin(π − θ) = sin θ.',
        },
        {
          expression: 'u = \\frac{\\pi}{3} + 2\\pi = \\frac{7\\pi}{3}, \\quad u = \\frac{2\\pi}{3} + 2\\pi = \\frac{8\\pi}{3}',
          annotation: 'Add 2π to catch solutions in [2π, 4π) since u ∈ [0, 4π).',
        },
        {
          expression: 'x = \\frac{u}{2}: \\quad x = \\frac{\\pi}{6}, \\; \\frac{\\pi}{3}, \\; \\frac{7\\pi}{6}, \\; \\frac{4\\pi}{3}',
          annotation: 'Divide each u value by 2 to get x. All four are in [0, 2π). ✓',
        },
      ],
      conclusion: 'When the argument has a coefficient (here 2x), substitute u = 2x, solve for u in the expanded interval, then divide back. Forgetting to expand the interval is the #1 error here.',
    },
  ],

  challenges: [
    {
      id: 'ch0-itf-c1',
      difficulty: 'easy',
      problem: 'Without a calculator, evaluate \\arcsin\\!\\left(-\\tfrac{1}{2}\\right) + \\arccos\\!\\left(-\\tfrac{1}{2}\\right).',
      hint: 'Use the complementary identity arcsin(x) + arccos(x) = π/2.',
      walkthrough: [
        {
          expression: '\\arcsin(x) + \\arccos(x) = \\frac{\\pi}{2} \\text{ for all } x \\in [-1,1]',
          annotation: 'Apply the identity with x = −1/2.',
        },
        {
          expression: '\\arcsin(-1/2) + \\arccos(-1/2) = \\frac{\\pi}{2}',
          annotation: 'Direct substitution. The identity holds regardless of the sign of x.',
        },
      ],
      answer: 'π/2',
    },
    {
      id: 'ch0-itf-c2',
      difficulty: 'medium',
      problem: 'Simplify \\sin(\\arctan(x)) in terms of x (assume x > 0).',
      hint: 'Draw a right triangle with tan θ = x. What are the three sides?',
      walkthrough: [
        {
          expression: '\\text{Let } \\theta = \\arctan(x), \\text{ so } \\tan\\theta = x',
          annotation: '',
        },
        {
          expression: '\\text{Right triangle: opp} = x, \\text{ adj} = 1, \\text{ hyp} = \\sqrt{1+x^2}',
          annotation: 'Build the triangle from tan θ = opposite/adjacent = x/1.',
        },
        {
          expression: '\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} = \\frac{x}{\\sqrt{1+x^2}}',
          annotation: 'Read off sin from the triangle.',
        },
        {
          expression: '\\sin(\\arctan(x)) = \\dfrac{x}{\\sqrt{1+x^2}}',
          annotation: 'This appears directly as an antiderivative pattern later in Calc 2.',
        },
      ],
      answer: 'x / √(1 + x²)',
    },
    {
      id: 'ch0-itf-c3',
      difficulty: 'hard',
      problem: 'Prove that \\arctan(1/x) = \\pi/2 - \\arctan(x) for x > 0.',
      hint: 'Let α = arctan(x) and β = arctan(1/x). Show α + β = π/2 using tan(α + β).',
      walkthrough: [
        {
          expression: '\\text{Let } \\alpha = \\arctan(x) \\text{ and } \\beta = \\arctan(1/x)',
          annotation: 'Both α, β ∈ (0, π/2) since x > 0.',
        },
        {
          expression: '\\tan(\\alpha + \\beta) = \\frac{\\tan\\alpha + \\tan\\beta}{1 - \\tan\\alpha\\tan\\beta} = \\frac{x + 1/x}{1 - x \\cdot (1/x)}',
          annotation: 'Apply the tangent addition formula.',
        },
        {
          expression: '= \\frac{x + 1/x}{1 - 1} = \\frac{x + 1/x}{0} \\to \\infty',
          annotation: 'The denominator is 0, so the sum has tangent = ∞.',
        },
        {
          expression: '\\tan\\theta = \\infty \\iff \\theta = \\frac{\\pi}{2} \\quad (\\text{in the range } (0, \\pi))',
          annotation: 'Since α + β ∈ (0, π), this forces α + β = π/2.',
        },
        {
          expression: '\\therefore \\arctan(x) + \\arctan(1/x) = \\frac{\\pi}{2} \\implies \\arctan(1/x) = \\frac{\\pi}{2} - \\arctan(x)\\;\\blacksquare',
          annotation: '',
        },
      ],
      answer: 'Proved via the tangent addition formula.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'trig-review', label: 'Prerequisite: Trig Review', context: 'Unit circle and the six trig functions.' },
    { lessonSlug: 'trig-identities', label: 'Related: Trig Identities', context: 'The identities used to simplify inverse trig compositions.' },
    { lessonSlug: 'derivatives-of-inverse-functions', label: 'Next Use: Derivatives of Inverse Functions (Ch. 2)', context: 'arcsin, arccos, arctan derivatives derived here via implicit differentiation.' },
    { lessonSlug: 'trig-substitution', label: 'Next Use: Trig Substitution (Ch. 4)', context: 'Integrals like ∫ 1/√(1−x²) dx = arcsin(x) + C.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Why does arcsin have domain [−1, 1] and range [−π/2, π/2]?',
      options: [
        'Arcsin is restricted to this range arbitrarily, by convention — any range containing a full period would work equally well',
        'Sine outputs values in [−1, 1], so arcsin must accept exactly those inputs; the range [−π/2, π/2] is the restricted domain of sine where it is one-to-one, which is required for the inverse to be a function',
        'The domain [−1, 1] comes from the Pythagorean identity, and the range is determined by π/2 being the smallest positive number where sine equals 1',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What does arctan(1) equal, and why?',
      options: [
        'arctan(1) = π/4, because tan(π/4) = sin(π/4)/cos(π/4) = (√2/2)/(√2/2) = 1, and π/4 is in the range (−π/2, π/2) of arctan',
        'arctan(1) = 1, because the inverse of a function always maps a value to itself when the input equals 1',
        'arctan(1) = π/2, because tangent equals 1 at the boundary of its defined range',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why is sin⁻¹(x) ≠ 1/sin(x)?',
      options: [
        'The superscript −1 on a function denotes the inverse function (undo), not the reciprocal. The reciprocal of sin is written csc(x) = 1/sin(x)',
        'sin⁻¹(x) is defined only for |x| ≤ 1, so it cannot equal 1/sin(x) which is defined everywhere sin ≠ 0',
        'The notation is historically inconsistent — sin⁻¹(x) actually means 1/sin(x) in some older textbooks, but modern calculus redefines it as the inverse function',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is lim(x→∞) arctan(x)?',
      options: [
        '∞ — arctan grows without bound, just more slowly than x itself',
        'π/2 — because tan(θ) → ∞ as θ → π/2 from below, so "undoing" that limit gives arctan(∞) = π/2',
        '1 — because the ratio of large numbers eventually approaches a constant',
      ],
      correct: 1,
    },
  ],
}
