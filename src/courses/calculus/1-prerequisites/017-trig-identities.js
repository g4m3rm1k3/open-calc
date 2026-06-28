import trigCircleUrl from '../diagrams/calc-trig-circle.svg?url';
import pythagoreanIdentityUrl from '../diagrams/calc-pythagorean-identity.svg?url';
import doubleAngleUrl from '../diagrams/calc-double-angle.svg?url';
export default {
  id: 'ch0-trig-identities',
  slug: 'trig-identities',
  chapter: 0,
  order: 13,
  title: 'Trigonometric Identities',
  subtitle: 'The algebraic laws of sine and cosine — Pythagorean, sum/difference, double-angle, half-angle',
  tags: ['trig-identities', 'pythagorean', 'sum-difference', 'double-angle', 'half-angle', 'product-to-sum', 'simplification'],

  hook: {
    question: 'Why does cos(2x) have three different formulas, and which one should you use?',
    realWorldContext:
      'Every identity in this lesson appears directly in calculus. ' +
      'sin²x + cos²x = 1 is the foundation of trig substitution in integration. ' +
      'The double-angle formulas cos(2x) = 1 − 2sin²x and cos(2x) = 2cos²x − 1 are the key to integrating sin²x and cos²x. ' +
      'The product-to-sum formulas convert products of sines and cosines — which are hard to integrate — ' +
      'into sums, which integrate trivially. ' +
      'If you do not know these identities cold, you will hit walls in every chapter of calculus that follows.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'An **identity** is an equation that is true for ALL values of the variable in its domain — not just specific solutions. ' +
          '3x + 3 = 3(x + 1) is an identity (true for every x). x² = 4 is an equation with specific solutions (x = ±2).',
          'Trig identities are the "grammar rules" of the language of oscillation. ' +
          'Just as distributive and commutative laws let you rearrange algebra, trig identities let you swap between forms. ' +
          'The key skill isn\'t memorizing them blindly — it\'s knowing which form is useful for a given purpose.',
        ],
      },
      { type: 'image', src: trigCircleUrl, alt: 'Unit circle proving sin²θ + cos²θ = 1 from the Pythagorean theorem', caption: 'Every trig identity follows from the unit-circle definitions; the Pythagorean identity is just the distance formula.' },
      {
        type: 'callout',
        callout: {
          type: 'prior-knowledge',
          title: 'Everything Comes From Two Identities',
          body: 'Almost every trig identity can be derived from just:\n' +
                '1. sin²θ + cos²θ = 1  (Pythagorean identity from the unit circle)\n' +
                '2. cos(A + B) = cos A cos B − sin A sin B  (cosine addition formula — provable from the unit circle)\n' +
                'Everything else — double-angle, half-angle, product-to-sum — follows by substitution and algebra.',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'Pythagorean Identity on the Unit Circle',
        mathBridge: 'For any point (cos θ, sin θ) on the unit circle, the distance to the origin is exactly 1. ' +
                    'By the Pythagorean theorem: cos²θ + sin²θ = 1².',
        caption: 'Drag the angle around the unit circle and watch cos²θ + sin²θ stay locked at 1 — the identity is geometric.',
      },
      { type: 'image', src: pythagoreanIdentityUrl, alt: 'Unit circle diagram and the three Pythagorean identities divided by cos² and sin²', caption: 'Dividing sin²+cos²=1 by cos²θ gives tan²+1=sec²; dividing by sin²θ gives 1+cot²=csc² — three identities from one.' },
      { type: 'image', src: doubleAngleUrl, alt: 'Double angle, half angle, and sum-difference formulas with a calculus integration example', caption: 'The power-reduction identities sin²θ=(1−cos2θ)/2 and cos²θ=(1+cos2θ)/2 are the key tool for integrating even powers of trig functions.' },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'The Three Pythagorean Identities',
          body: '\\sin^2\\theta + \\cos^2\\theta = 1 \\\\ \\tan^2\\theta + 1 = \\sec^2\\theta \\quad (\\text{divide by } \\cos^2\\theta) \\\\ 1 + \\cot^2\\theta = \\csc^2\\theta \\quad (\\text{divide by } \\sin^2\\theta)',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Sum & Difference Formulas',
          body: '\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B \\\\ \\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B \\\\ \\tan(A \\pm B) = \\dfrac{\\tan A \\pm \\tan B}{1 \\mp \\tan A \\tan B}',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Double-Angle Formulas',
          body: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta \\\\ \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1 \\\\ \\tan(2\\theta) = \\dfrac{2\\tan\\theta}{1-\\tan^2\\theta}',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'Why Three Forms for cos(2θ)?',
          body: 'cos(2θ) = cos²θ − sin²θ is the basic form.\n' +
                'Replace sin²θ = 1 − cos²θ → cos(2θ) = 2cos²θ − 1\n' +
                'Replace cos²θ = 1 − sin²θ → cos(2θ) = 1 − 2sin²θ\n' +
                'In calculus: rearrange to get the power-reduction formulas:\n' +
                'sin²θ = (1 − cos 2θ)/2  and  cos²θ = (1 + cos 2θ)/2\n' +
                'These are the key to ∫ sin²x dx and ∫ cos²x dx.',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Half-Angle Formulas',
          body: '\\sin\\frac{\\theta}{2} = \\pm\\sqrt{\\dfrac{1-\\cos\\theta}{2}} \\\\ \\cos\\frac{\\theta}{2} = \\pm\\sqrt{\\dfrac{1+\\cos\\theta}{2}} \\\\ \\tan\\frac{\\theta}{2} = \\dfrac{1-\\cos\\theta}{\\sin\\theta} = \\dfrac{\\sin\\theta}{1+\\cos\\theta} \\\\ (\\text{sign depends on the quadrant of } \\theta/2)',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Product-to-Sum Formulas',
          body: '\\sin A \\cos B = \\tfrac{1}{2}[\\sin(A+B) + \\sin(A-B)] \\\\ \\cos A \\cos B = \\tfrac{1}{2}[\\cos(A-B) + \\cos(A+B)] \\\\ \\sin A \\sin B = \\tfrac{1}{2}[\\cos(A-B) - \\cos(A+B)]',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Even/Odd & Co-function Identities',
          body: '\\sin(-\\theta) = -\\sin\\theta \\quad (\\text{odd}) \\qquad \\cos(-\\theta) = \\cos\\theta \\quad (\\text{even}) \\\\ \\sin(\\tfrac{\\pi}{2}-\\theta) = \\cos\\theta \\qquad \\cos(\\tfrac{\\pi}{2}-\\theta) = \\sin\\theta \\\\ \\tan(\\tfrac{\\pi}{2}-\\theta) = \\cot\\theta \\qquad \\sec(\\tfrac{\\pi}{2}-\\theta) = \\csc\\theta',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'Identity Transformation Lab',
        mathBridge: 'Enter any trig expression and select identities to apply step by step. The lab shows which form is most compact and which is best for integration.',
        caption: 'Try converting cos²x into a form without squared functions — that\'s the power-reduction identity at work.',
      },
    ],
  },

  rigor: {
    prose: [
      '**Proving the sine addition formula** from the unit circle:',
      'Place two unit vectors at angles A and B from the positive x-axis. ' +
      'The angle between them is A − B. The distance between the two tips equals 2sin((A−B)/2)... ' +
      'For the full geometric proof, use the distance formula between (cos A, sin A) and (cos B, sin B) ' +
      'and set it equal to the chord length from the rotation matrix approach.',
      'More elegantly: define f(A) = cos(A − B). Show f satisfies the differential equation f\'\' = −f ' +
      'with f(0) = cos(−B) = cos B and f\'(0) = sin B. This DE has unique solution f(A) = cos B cos A + sin B sin A. ' +
      'This gives cos(A − B) = cos A cos B + sin A sin B. Replace B with −B to get all other formulas. ' +
      '(This method is circular in a calculus course — but it is the most elegant derivation.)',
      '**Proving sin²θ + cos²θ = 1**: The unit circle is DEFINED as x² + y² = 1. ' +
      'The definitions cos θ = x and sin θ = y (the coordinates of the corresponding point) make the identity immediate: (cos θ)² + (sin θ)² = 1.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'The Calculus Payoff: Power-Reduction',
        body: '\\int \\sin^2 x \\, dx: \\text{ Replace } \\sin^2 x = \\frac{1-\\cos 2x}{2} \\\\ = \\frac{1}{2}\\int (1 - \\cos 2x)\\,dx = \\frac{x}{2} - \\frac{\\sin 2x}{4} + C \\\\ \\text{This technique is used in every Calc 2 trig-integral problem.}',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-prove-identity',
      title: 'Proving a Trig Identity',
      problem: 'Prove: \\dfrac{\\sin\\theta}{1 - \\cos\\theta} = \\csc\\theta + \\cot\\theta.',
      steps: [
        {
          expression: '\\text{Strategy: work on the left side only, transform it into the right side.}',
          annotation: 'Never "cross-multiply" or operate on both sides simultaneously when proving identities.',
        },
        {
          expression: '\\frac{\\sin\\theta}{1-\\cos\\theta} \\cdot \\frac{1+\\cos\\theta}{1+\\cos\\theta}',
          annotation: 'Multiply by the conjugate of the denominator.',
        },
        {
          expression: '= \\frac{\\sin\\theta(1+\\cos\\theta)}{1 - \\cos^2\\theta}',
          annotation: 'Denominator: (1 − cos θ)(1 + cos θ) = 1 − cos²θ.',
        },
        {
          expression: '= \\frac{\\sin\\theta(1+\\cos\\theta)}{\\sin^2\\theta}',
          annotation: 'Replace 1 − cos²θ = sin²θ using the Pythagorean identity.',
        },
        {
          expression: '= \\frac{1+\\cos\\theta}{\\sin\\theta}',
          annotation: 'Cancel one factor of sin θ.',
        },
        {
          expression: '= \\frac{1}{\\sin\\theta} + \\frac{\\cos\\theta}{\\sin\\theta} = \\csc\\theta + \\cot\\theta\\;\\checkmark',
          annotation: 'Split the fraction and apply definitions: csc = 1/sin, cot = cos/sin.',
        },
      ],
      conclusion: 'The conjugate-multiply trick (multiplying by 1 + cos θ over itself) is one of the top three strategies for proving trig identities. Always look for a Pythagorean substitution opportunity after multiplying.',
    },
    {
      id: 'ex-double-angle',
      title: 'Using Double-Angle to Find sin(2θ) and cos(2θ)',
      problem: 'Given \\sin\\theta = -\\tfrac{4}{5} and \\theta is in Quadrant III, find \\sin(2\\theta) and \\cos(2\\theta).',
      steps: [
        {
          expression: '\\sin\\theta = -\\frac{4}{5}, \\quad \\theta \\in \\text{QIII}',
          annotation: 'In QIII, both sin and cos are negative.',
        },
        {
          expression: '\\cos\\theta = -\\sqrt{1-\\sin^2\\theta} = -\\sqrt{1-\\frac{16}{25}} = -\\sqrt{\\frac{9}{25}} = -\\frac{3}{5}',
          annotation: 'Use sin²θ + cos²θ = 1. Take the negative root since θ is in QIII.',
        },
        {
          expression: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta = 2 \\cdot\\!\\left(-\\frac{4}{5}\\right)\\!\\left(-\\frac{3}{5}\\right) = \\frac{24}{25}',
          annotation: 'Apply the double-angle formula for sine.',
        },
        {
          expression: '\\cos(2\\theta) = 1 - 2\\sin^2\\theta = 1 - 2\\cdot\\frac{16}{25} = 1 - \\frac{32}{25} = -\\frac{7}{25}',
          annotation: 'Use the power-reduction form: 1 − 2sin²θ. (Check: 2θ is in QIV or QI — cos(2θ) < 0 means 2θ is in QII or QIII.)',
        },
      ],
      conclusion: 'sin(2θ) = 24/25, cos(2θ) = −7/25. Always determine the sign of the missing trig function from the quadrant before applying any identity.',
    },
    {
      id: 'ex-exact-sum',
      title: 'Exact Value via Sum Formula',
      problem: 'Find \\cos(75°) exactly, without a calculator.',
      steps: [
        {
          expression: '75° = 45° + 30°',
          annotation: 'Decompose into angles with known exact values.',
        },
        {
          expression: '\\cos(75°) = \\cos(45° + 30°)',
          annotation: '',
        },
        {
          expression: '= \\cos 45°\\cos 30° - \\sin 45°\\sin 30°',
          annotation: 'Apply the cosine addition formula: cos(A+B) = cos A cos B − sin A sin B.',
        },
        {
          expression: '= \\frac{\\sqrt{2}}{2}\\cdot\\frac{\\sqrt{3}}{2} - \\frac{\\sqrt{2}}{2}\\cdot\\frac{1}{2}',
          annotation: 'Substitute exact values from the unit circle.',
        },
        {
          expression: '= \\frac{\\sqrt{6}}{4} - \\frac{\\sqrt{2}}{4} = \\frac{\\sqrt{6}-\\sqrt{2}}{4}',
          annotation: 'Combine over a common denominator.',
        },
      ],
      conclusion: 'cos(75°) = (√6 − √2)/4 ≈ 0.2588. The sum/difference formulas let you find exact values for any multiple of 15° from the standard 30-45-60-90 angles.',
    },
  ],

  challenges: [
    {
      id: 'ch0-ti-c1',
      difficulty: 'easy',
      problem: 'Given \\tan\\theta = 2 and \\theta \\in (0, \\pi/2), find \\sin(2\\theta) exactly.',
      hint: 'Build the right triangle: if tan θ = 2, then opp = 2, adj = 1, hyp = √5. Then use sin(2θ) = 2 sin θ cos θ.',
      walkthrough: [
        { expression: '\\sin\\theta = \\frac{2}{\\sqrt{5}}, \\quad \\cos\\theta = \\frac{1}{\\sqrt{5}}', annotation: 'From the right triangle with opp=2, adj=1, hyp=√5.' },
        { expression: '\\sin(2\\theta) = 2 \\cdot \\frac{2}{\\sqrt{5}} \\cdot \\frac{1}{\\sqrt{5}} = \\frac{4}{5}', annotation: '' },
      ],
      answer: 'sin(2θ) = 4/5',
    },
    {
      id: 'ch0-ti-c2',
      difficulty: 'medium',
      problem: 'Verify the identity: \\sin^4 x - \\cos^4 x = -\\cos(2x).',
      hint: 'Factor the left side as a difference of squares, then use the Pythagorean identity.',
      walkthrough: [
        { expression: '\\sin^4 x - \\cos^4 x = (\\sin^2 x - \\cos^2 x)(\\sin^2 x + \\cos^2 x)', annotation: 'Difference of squares: a² − b² = (a−b)(a+b).' },
        { expression: '= (\\sin^2 x - \\cos^2 x) \\cdot 1', annotation: 'sin²x + cos²x = 1.' },
        { expression: '= -(\\cos^2 x - \\sin^2 x) = -\\cos(2x)\\;\\checkmark', annotation: 'cos(2x) = cos²x − sin²x.' },
      ],
      answer: 'Identity verified',
    },
    {
      id: 'ch0-ti-c3',
      difficulty: 'hard',
      problem: 'Evaluate \\displaystyle\\int_0^{\\pi} \\sin^2 x \\, dx using the power-reduction identity.',
      hint: 'Replace sin²x = (1 − cos 2x)/2, then integrate term by term.',
      walkthrough: [
        { expression: '\\int_0^{\\pi} \\sin^2 x \\, dx = \\int_0^{\\pi} \\frac{1 - \\cos 2x}{2} \\, dx', annotation: 'Power-reduction: sin²x = (1 − cos 2x)/2.' },
        { expression: '= \\frac{1}{2}\\left[x - \\frac{\\sin 2x}{2}\\right]_0^{\\pi}', annotation: 'Integrate: ∫1 dx = x, ∫cos(2x) dx = sin(2x)/2.' },
        { expression: '= \\frac{1}{2}\\left[(\\pi - \\frac{\\sin 2\\pi}{2}) - (0 - \\frac{\\sin 0}{2})\\right] = \\frac{1}{2} \\cdot \\pi = \\frac{\\pi}{2}', annotation: 'sin(2π) = sin(0) = 0.' },
      ],
      answer: 'π/2',
    },
  ],

  crossRefs: [
    { lessonSlug: 'trig-review', label: 'Prerequisite: Trig Review', context: 'Unit circle and basic trig values.' },
    { lessonSlug: 'inverse-trig-functions', label: 'Related: Inverse Trig Functions', context: 'Inverse trig identities (arcsin + arccos = π/2) use these.' },
    { lessonSlug: 'trig-derivatives', label: 'Next Use: Trig Derivatives (Ch. 2)', context: 'Many derivative simplifications use these identities.' },
    { lessonSlug: 'trig-integrals', label: 'Next Use: Trig Integrals (Ch. 4)', context: 'Power-reduction and product-to-sum are essential for trig integration.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The Pythagorean identity sin²θ + cos²θ = 1 can be rearranged to give 1 + tan²θ = sec²θ. How do you get there?',
      options: [
        'Divide every term by sin²θ to get cot²θ + 1 = csc²θ, then rearrange — you need two steps to reach 1 + tan²θ = sec²θ',
        'Divide every term of sin²θ + cos²θ = 1 by cos²θ to get tan²θ + 1 = sec²θ, since sin²θ/cos²θ = tan²θ and 1/cos²θ = sec²θ',
        'Substitute tan = sin/cos directly into sin²θ + cos²θ and simplify — the sec² term appears as a remainder',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What is cos(2θ) in terms of cos²θ?',
      options: [
        'cos(2θ) = 2cos²θ − 1, derived from the angle addition formula cos(A+B) = cosA·cosB − sinA·sinB with A = B = θ, then using sin²θ = 1 − cos²θ',
        'cos(2θ) = cos²θ − 1, because the "2" in 2θ divides out one power of cos',
        'cos(2θ) = 2cos(θ) − 1, because doubling the angle doubles the cosine and the −1 accounts for the shift',
      ],
      correct: 0,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In trig integration, why is the power-reduction identity cos²θ = (1 + cos2θ)/2 so useful?',
      options: [
        'It converts a squared trig function into a linear trig function, making it directly integrable — ∫cos²θ dθ becomes ∫(1 + cos2θ)/2 dθ, which is straightforward',
        'It cancels the squared term completely so the integrand becomes a constant 1/2',
        'It allows substitution u = cos θ to remove the angle variable entirely',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What is sin(A + B) expanded?',
      options: [
        'sin(A)·sin(B) + cos(A)·cos(B)',
        'sin(A)·cos(B) + cos(A)·sin(B) — each angle contributes a sine and cosine cross term',
        'sin(A)·cos(B) − cos(A)·sin(B)',
      ],
      correct: 1,
    },
  ],
}
