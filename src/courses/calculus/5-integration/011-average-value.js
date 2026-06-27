import mvtUrl from '../diagrams/calc-mvt.svg?url';
export default {
  id: 'ch4-average-value',
  slug: 'average-value',
  chapter: 4,
  order: 9,
  title: 'Average Value of a Function',
  subtitle: 'The integral as a generalized average — and the Mean Value Theorem for Integrals',
  tags: ['average-value', 'mvt-integrals', 'definite-integral', 'mean-value', 'applications'],

  hook: {
    question: 'A temperature sensor records a continuous reading all day. What was the "average temperature"?',
    realWorldContext:
      'You could sample the temperature at thousands of moments and average the readings — but that\'s an approximation. ' +
      'The TRUE average of a continuous function over an interval uses the definite integral. ' +
      'This concept appears everywhere: average power in an electrical circuit over a cycle (essential for AC power calculations), ' +
      'average velocity of a moving object (∫ v(t) dt / (b−a) = displacement / time), ' +
      'average drug concentration in the bloodstream during a dosing period, ' +
      'and average pixel brightness in image processing. ' +
      'The integral as an average is not just a textbook curiosity — it\'s a fundamental tool in applied science.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'The average of n numbers is (a₁ + a₂ + ... + aₙ) / n — sum them up and divide by how many there are. ' +
          'For a continuous function on [a, b], there are infinitely many values. ' +
          'How do we "sum" them all? With an integral.',
          'Here\'s the key idea: approximate with n equally-spaced sample points xᵢ, each a distance Δx = (b−a)/n apart. ' +
          'Average of samples ≈ (1/n) Σ f(xᵢ) = (1/(b−a)) Σ f(xᵢ)Δx → (1/(b−a)) ∫ₐᵇ f(x) dx as n → ∞.',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Average Value of a Function',
          body: 'f_{avg} = \\frac{1}{b-a}\\int_a^b f(x)\\,dx',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          'Geometrically: f_avg is the HEIGHT of the rectangle over [a, b] that has the SAME AREA as the region under f(x). ' +
          'The integral gives area; dividing by (b − a) converts area to height.',
        ],
      },
      {
        type: 'viz',
        id: '',
        title: 'Average Value as Rectangle Height',
        mathBridge: 'The shaded region under f(x) has the same area as the rectangle with height f_avg. Drag the interval endpoints to update the average.',
        caption: 'The red horizontal line is f_avg. The rectangle has the same area as the curved region.',
      },
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Mean Value Theorem for Integrals',
          body: 'If $f$ is continuous on $[a,b]$, then there exists $c \\in [a,b]$ such that $f(c) = f_{avg} = \\dfrac{1}{b-a}\\int_a^b f(x)\\,dx$.\n\n' +
                'In other words: the function actually ATTAINS its average value at some point in [a, b].',
        },
      },
      { type: 'image', src: mvtUrl, alt: 'Curve with the average-value horizontal line and equal-area demonstration', caption: 'Average value = (1/(b−a)) ∫f dx — the constant function with the same area over [a, b].' },
    ],
  },

  math: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Average value — complete computation process:**',
          '1. Set up the integral: ∫ₐᵇ f(x)dx',
          '2. Evaluate the definite integral using FTC or a technique',
          '3. Divide by (b − a): f_avg = [integral result] / (b − a)',
          '',
          '**Finding the MVT point c:**',
          'Set f(c) = f_avg and solve for c. There will be at least one solution in [a, b] by MVT. ' +
          'Note: there may be more than one solution.',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'Connection to the Mean Value Theorem for Derivatives',
          body: 'MVT for derivatives: if f is differentiable on (a, b), some c satisfies\n' +
                'f\'(c) = [f(b) − f(a)] / (b − a) = average rate of change\n\n' +
                'MVT for integrals: if f is continuous on [a, b], some c satisfies\n' +
                'f(c) = (1/(b−a)) ∫ₐᵇ f(x)dx = average value\n\n' +
                'Both say "the average must be attained at some actual point."',
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Proof of MVT for Integrals:** Let f be continuous on [a, b]. Define F(x) = ∫ₐˣ f(t)dt. By the Fundamental Theorem of Calculus, F is differentiable with F\'(x) = f(x). ' +
      'By the Mean Value Theorem for derivatives applied to F on [a, b]: there exists c ∈ (a, b) with ' +
      'F\'(c) = [F(b) − F(a)] / (b − a). ' +
      'But F\'(c) = f(c) and F(b) − F(a) = ∫ₐᵇ f(t)dt. ' +
      'Therefore f(c) = (1/(b−a)) ∫ₐᵇ f(t)dt = f_avg. ■',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Average vs. Mean vs. Expected Value',
        body: '\\text{Discrete average: } \\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i \\\\ \\text{Continuous average: } f_{avg} = \\frac{1}{b-a}\\int_a^b f(x)dx \\\\ \\text{Probability expected value: } E[X] = \\int_{-\\infty}^{\\infty} x\\,p(x)\\,dx \\quad (\\text{no } \\frac{1}{b-a} \\text{ because } p \\text{ is a density})',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-avg-poly',
      title: 'Average Value of a Polynomial',
      problem: 'Find the average value of $f(x) = x^2$ on $[1, 4]$, and find a value $c$ where $f(c) = f_{avg}$.',
      steps: [
        {
          expression: 'f_{avg} = \\frac{1}{4-1}\\int_1^4 x^2\\,dx = \\frac{1}{3}\\int_1^4 x^2\\,dx',
          annotation: '',
        },
        {
          expression: '= \\frac{1}{3}\\left[\\frac{x^3}{3}\\right]_1^4 = \\frac{1}{3}\\cdot\\frac{64-1}{3} = \\frac{63}{9} = 7',
          annotation: '',
        },
        {
          expression: '\\textbf{Find } c: f(c) = f_{avg} \\implies c^2 = 7 \\implies c = \\sqrt{7}',
          annotation: 'Take the positive root since c must be in [1, 4].',
        },
        {
          expression: '\\sqrt{7} \\approx 2.646 \\in [1,4]\\;\\checkmark',
          annotation: 'MVT guarantees at least one such c. Here there is exactly one in [1, 4].',
        },
      ],
      conclusion: 'f_avg = 7. The function f(x) = x² attains the value 7 at c = √7 ≈ 2.646. The parabola\'s average height over [1, 4] is equal to its value at x = √7.',
    },
    {
      id: 'ex-avg-velocity',
      title: 'Average Velocity vs. Average Speed',
      problem: 'A particle\'s velocity is $v(t) = t^2 - 4t + 3$ m/s for $t \\in [0, 4]$. Find the average velocity and the average speed.',
      steps: [
        {
          expression: '\\textbf{Average velocity} = \\frac{1}{4-0}\\int_0^4 v(t)\\,dt = \\frac{1}{4}\\int_0^4 (t^2 - 4t + 3)\\,dt',
          annotation: 'Average velocity uses the signed integral of velocity.',
        },
        {
          expression: '= \\frac{1}{4}\\left[\\frac{t^3}{3} - 2t^2 + 3t\\right]_0^4 = \\frac{1}{4}\\left(\\frac{64}{3} - 32 + 12\\right) = \\frac{1}{4}\\cdot\\frac{64-96+36}{3} = \\frac{1}{4}\\cdot\\frac{4}{3} = \\frac{1}{3}',
          annotation: '',
        },
        {
          expression: '\\textbf{Average speed} = \\frac{1}{4}\\int_0^4 |v(t)|\\,dt',
          annotation: 'Speed uses |v(t)| — no cancellation of positive/negative.',
        },
        {
          expression: 'v(t) = (t-1)(t-3) = 0 \\text{ at } t=1,3',
          annotation: 'v > 0 on (0,1), v < 0 on (1,3), v > 0 on (3,4).',
        },
        {
          expression: '\\int_0^4|v|\\,dt = \\int_0^1 v\\,dt - \\int_1^3 v\\,dt + \\int_3^4 v\\,dt',
          annotation: 'Break at sign changes; flip sign where v < 0.',
        },
        {
          expression: '= \\left[\\frac{t^3}{3}-2t^2+3t\\right]_0^1 - \\left[\\cdots\\right]_1^3 + \\left[\\cdots\\right]_3^4 = \\frac{4}{3} + \\frac{4}{3} + \\frac{1}{3} = 3',
          annotation: 'Sum of absolute areas.',
        },
        {
          expression: '\\text{Average speed} = \\frac{3}{4}\\text{ m/s}',
          annotation: '',
        },
      ],
      conclusion: 'Average velocity = 1/3 m/s (displacement/time). Average speed = 3/4 m/s (total distance/time). Speed is always ≥ average velocity because cancellation is not allowed.',
    },
    {
      id: 'ex-avg-trig',
      title: 'Average Value of a Trig Function',
      problem: 'Find the average value of $f(x) = \\sin x$ over one full period $[0, 2\\pi]$ and over the half period $[0, \\pi]$.',
      steps: [
        {
          expression: '\\textbf{Full period: } f_{avg} = \\frac{1}{2\\pi}\\int_0^{2\\pi} \\sin x\\,dx = \\frac{1}{2\\pi}[-\\cos x]_0^{2\\pi}',
          annotation: '',
        },
        {
          expression: '= \\frac{1}{2\\pi}(-\\cos 2\\pi + \\cos 0) = \\frac{1}{2\\pi}(-1+1) = 0',
          annotation: 'The average over a full period of sin is 0 — positive and negative halves cancel. Makes sense geometrically.',
        },
        {
          expression: '\\textbf{Half period: } f_{avg} = \\frac{1}{\\pi}\\int_0^{\\pi}\\sin x\\,dx = \\frac{1}{\\pi}[-\\cos x]_0^{\\pi}',
          annotation: '',
        },
        {
          expression: '= \\frac{1}{\\pi}(1+1) = \\frac{2}{\\pi} \\approx 0.637',
          annotation: '',
        },
      ],
      conclusion: 'Average of sin over a full period = 0 (positive and negative halves cancel). Average over [0, π] = 2/π ≈ 0.637. The half-period average is key in AC power theory: the average value of a rectified sine wave is 2/π.',
    },
  ],

  challenges: [
    {
      id: 'ch4-av-c1',
      difficulty: 'easy',
      problem: 'Find the average value of $f(x) = e^x$ on $[0, 2]$.',
      hint: 'f_avg = (1/2) ∫₀² eˣ dx.',
      walkthrough: [
        { expression: 'f_{avg} = \\frac{1}{2}\\int_0^2 e^x\\,dx = \\frac{1}{2}[e^x]_0^2 = \\frac{e^2 - 1}{2}', annotation: '' },
        { expression: '\\approx \\frac{7.389 - 1}{2} \\approx 3.19', annotation: '' },
      ],
      answer: '(e² − 1)/2 ≈ 3.19',
    },
    {
      id: 'ch4-av-c2',
      difficulty: 'medium',
      problem: 'If the average value of $f(x) = kx^2$ on $[0, 3]$ is 12, find $k$.',
      hint: 'Set up the average value formula, compute the integral in terms of k, and solve.',
      walkthrough: [
        { expression: '\\frac{1}{3}\\int_0^3 kx^2\\,dx = 12', annotation: '' },
        { expression: '\\frac{k}{3}\\cdot\\left[\\frac{x^3}{3}\\right]_0^3 = \\frac{k}{3}\\cdot 9 = 3k = 12', annotation: '' },
        { expression: 'k = 4', annotation: '' },
      ],
      answer: 'k = 4',
    },
  ],

  crossRefs: [
    { lessonSlug: 'definite-integral', label: 'Prerequisite: Definite Integral', context: 'Average value is a definite integral divided by interval length.' },
    { lessonSlug: 'mvt-integrals', label: 'Related: MVT for Integrals', context: 'This lesson includes the MVT for integrals.' },
    { lessonSlug: 'fundamental-theorem', label: 'Prerequisite: Fundamental Theorem', context: 'Used to evaluate the integral in the average value formula.' },
    { lessonSlug: 'applications', label: 'Related: Applications of Integration', context: 'Average value is one of the key application types.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The average value of a continuous function f on [a, b] is f_avg = (1/(b−a)) ∫[a to b] f(x) dx. What does the factor 1/(b−a) do?',
      options: [
        'It converts the area under the curve into a representative single height — the average value is the height of a rectangle with the same width (b−a) and same area as the integral',
        'It normalizes the integral to account for the units of x and makes the average dimensionless',
        'It cancels the (b−a) that appears inside the integral, simplifying the computation',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The Mean Value Theorem for Integrals says: if f is continuous on [a, b], there exists c in (a, b) where f(c) = f_avg. What does this mean geometrically?',
      options: [
        'The average value must be achieved at the midpoint c = (a+b)/2 of the interval',
        'There is at least one point c where the function equals its own average — the horizontal line y = f_avg intersects the graph of f somewhere in the interior',
        'The derivative f\'(c) equals the average rate of change (f(b)−f(a))/(b−a) at some interior point',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'f(x) = x² on [0, 3]. What is the average value?',
      options: [
        '3 — the average of the endpoint values (f(0)+f(3))/2 = (0+9)/2 = 4.5, which rounds to 3',
        '3 — (1/3)∫[0 to 3] x² dx = (1/3)[x³/3] from 0 to 3 = (1/3)(9) = 3',
        '4.5 — integrating x² from 0 to 3 gives 9, and dividing by 2 endpoints gives 4.5',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why is the integral definition of average value (1/(b−a))∫f dx better than just averaging f(a) and f(b)?',
      options: [
        'Averaging endpoints is only valid for linear functions — for nonlinear f, the function\'s values in the interior matter, and the integral weighs every point continuously, not just two endpoints',
        'The integral definition includes the endpoints twice, giving them extra weight that the simple average lacks',
        'The integral formula is better only when f is differentiable; for non-smooth functions both formulas give the same result',
      ],
      correct: 0,
    },
  ],
}
