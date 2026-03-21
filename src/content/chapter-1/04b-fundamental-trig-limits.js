export default {
  id: 'ch1-fundamental-trig-limits',
  slug: 'fundamental-trig-limits',
  chapter: 1,
  order: 5,
  title: 'Fundamental Trig Limits',
  subtitle: 'Deep mastery of lim sin(x)/x = 1 and lim (1-cos x)/x = 0',
  tags: ['trig limits', 'sin x over x', '1 minus cos x over x', 'unit circle proof', 'squeeze theorem', 'small-angle approximation'],
  aliases: 'twin pillars trig calculus deep trig limit proof small angle limits sinx over x one minus cosx over x',

  hook: {
    question: 'Why are these two limits called the twin pillars of trigonometric calculus?',
    realWorldContext:
      'Because every trig derivative proof rests on them. Without lim(x->0) sin(x)/x = 1 and lim(x->0) (1-cos x)/x = 0, ' +
      'you cannot rigorously derive d/dx[sin x] = cos x or d/dx[cos x] = -sin x from first principles. ' +
      'In physics, they justify the small-angle model sin(theta) approx theta used in pendulums, waves, robotics, and control systems.',
    previewVisualizationId: 'RadianDegreeLimitLab',
  },

  intuition: {
    prose: [
      'These two limits are not random facts to memorize. They are the translation layer between geometry and analysis.',

      'First pillar: lim(x->0) sin(x)/x = 1. This says that for very small angles x (in radians), sin(x) and x are nearly identical. ' +
      'In other words, the ratio sin(x)/x gets squeezed to 1 as x shrinks to 0.',

      'Second pillar: lim(x->0) (1-cos x)/x = 0. This says the quantity 1-cos(x) goes to 0 faster than x does. ' +
      'So when divided by x, it still collapses to 0.',

      'If you feel lost with these limits, the key is to stop treating them as algebra problems. They are geometry-plus-bounds problems:',
      '1. Build an inequality from unit-circle geometry.',
      '2. Apply the Squeeze Theorem.',
      '3. Reuse the result in limit patterns.',

      'Most exam problems are not the base limits themselves. They are pattern variations like sin(7x)/(3x), (1-cos(5x))/x, (tan x - sin x)/x^3, or compositions. ' +
      'Mastering pattern conversion is what makes trig week feel easy.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Radians Only',
        body: 'The limit lim(x->0) sin(x)/x = 1 is true only when x is measured in radians. In degrees, the limit is pi/180. Every derivative formula for trig assumes radians.',
      },
      {
        type: 'intuition',
        title: 'What You Should Remember',
        body: 'For tiny x: sin(x) behaves like x, and 1-cos(x) behaves like x^2/2. These two approximations explain nearly every trig-limit simplification near 0.',
      },
      {
        type: 'misconception',
        title: 'Do Not Plug 0 Immediately',
        body: 'For forms like sin(ax)/x or (1-cos x)/x, direct substitution gives 0/0. You must convert to a known pattern before evaluating.',
      },
    ],
    visualizations: [
      {
        id: 'RadianDegreeLimitLab',
        title: 'Radians vs Degrees Toggle',
        caption: 'Switch units and watch lim sin(x)/x change from 1 (radians) to pi/180 (degrees).',
      },
      {
        id: 'AreaSqueezeLab',
        title: 'Three-Shape Area Squeeze',
        caption: 'Drag theta and watch inner triangle <= sector <= outer triangle lock the proof visually.',
      },
      {
        id: 'ArcChordLimit',
        title: 'Arc-Chord Comparison Near 0',
        caption: 'As angle x shrinks, arc length and chord-based trig expressions collapse together, explaining why sin(x)/x tends to 1.',
      },
      {
        id: 'SqueezeTheorem',
        title: 'Squeeze Mechanism',
        caption: 'See how trapping sin(x)/x between cos(x) and 1 forces the limit to be 1.',
      },
      {
        id: 'SmallAnglePendulumLab',
        title: 'Small-Angle Pendulum Simulator',
        caption: 'Compare exact timing vs sin(theta) ~ theta approximation at small and large angles.',
      },
    ],
  },

  math: {
    prose: [
      'Core results:',
      '1) lim(x->0) sin(x)/x = 1',
      '2) lim(x->0) (1-cos x)/x = 0',

      'Proof sketch for (1): for 0 < x < pi/2 on the unit circle, area comparison gives',
      'sin x <= x <= tan x.',
      'Rearrange to get',
      'cos x <= sin x / x <= 1.',
      'Now x->0 implies cos x -> 1 and 1 -> 1, so by Squeeze: sin x / x -> 1.',

      'Proof for (2) from (1):',
      '(1-cos x)/x * (1+cos x)/(1+cos x) = sin^2 x / (x(1+cos x))',
      '= (sin x / x) * (sin x / (1+cos x)).',
      'As x->0, first factor -> 1 and second factor -> 0/2 = 0, so product -> 0.',

      'Pattern library (use constantly):',
      'A) lim(x->0) sin(ax)/(bx) = a/b',
      'B) lim(x->0) (1-cos(ax))/x = 0',
      'C) lim(x->0) (1-cos(ax))/x^2 = a^2/2',
      'D) lim(x->0) tan x / x = 1 (since tan x / x = (sin x / x)*(1/cos x)).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Twin Pillars',
        body: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to 0} \\frac{1-\\cos x}{x} = 0',
      },
      {
        type: 'theorem',
        title: 'Most Useful Derived Limit',
        body: '\\lim_{x \\to 0} \\frac{1-\\cos x}{x^2} = \\frac{1}{2}',
      },
      {
        type: 'strategy',
        title: 'Conversion Workflow',
        body: 'Step 1: Identify target pattern (sin u / u) or (1-cos u)/u. Step 2: Multiply/divide constants to create the target exactly. Step 3: Evaluate with known limits and limit laws.',
      },
    ],
    visualizations: [
      {
        id: 'LimitApproach',
        props: { fn: 'Math.sin(x)/x', targetX: 0, limitVal: 1, showTable: true },
        title: 'Numerical Convergence of sin(x)/x',
        caption: 'Both one-sided approaches lock onto 1 near x=0.',
      },
      {
        id: 'LimitApproach',
        props: { fn: '(1-Math.cos(x))/x', targetX: 0, limitVal: 0, showTable: true },
        title: 'Numerical Convergence of (1-cos x)/x',
        caption: 'Values collapse to 0 near x=0 after pattern simplification logic.',
      },
      {
        id: 'CosGapVisualizer',
        title: 'Unit-Circle Gap Visualizer for 1-cos(x)',
        caption: 'See the horizontal gap 1-cos(x) collapse faster than x as x approaches 0.',
      },
    ],
  },

  rigor: {
    prose: [
      'Why radians are mandatory:',
      'If theta is measured in degrees, then sin(theta deg) = sin(theta*pi/180) in radian form. So',
      'lim(theta->0) sin(theta deg)/theta = lim(theta->0) sin(theta*pi/180)/(theta*pi/180) * (pi/180) = pi/180, not 1.',

      'This is why calculus defines trig derivatives in radian measure. Radians make the geometry-to-limit normalization exact.',

      'Small-angle asymptotics (optional but powerful):',
      'sin x = x - x^3/6 + O(x^5),',
      'cos x = 1 - x^2/2 + O(x^4).',
      'From these, sin x / x = 1 - x^2/6 + O(x^4) and (1-cos x)/x = x/2 + O(x^3) -> 0.',

      'These expansions are not required to prove the pillars, but they explain error size and why approximations work so well in engineering.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Radian Dependence',
        body: '\\lim_{x\\to 0}\\frac{\\sin x}{x}=1 \\text{ iff } x \\text{ is in radians.}',
      },
      {
        type: 'tip',
        title: 'Error Sense',
        body: 'Near 0, replacing sin x by x has relative error about x^2/6, while replacing 1-cos x by x^2/2 has next error scale about x^4/24.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch1-ftrl-ex1',
      title: 'Direct Pattern Scaling',
      problem: 'Evaluate lim(x->0) sin(7x)/(3x).',
      steps: [
        { expression: '\\frac{\\sin(7x)}{3x} = \\frac{7}{3} \\cdot \\frac{\\sin(7x)}{7x}', annotation: 'Create sin(u)/u exactly.' },
        { expression: '\\lim_{x\\to0} \\frac{\\sin(7x)}{3x} = \\frac{7}{3} \\cdot 1', annotation: 'Use lim sin(u)/u = 1.' },
        { expression: '= \\frac{7}{3}', annotation: '' },
      ],
      conclusion: 'Answer: 7/3.',
    },
    {
      id: 'ch1-ftrl-ex2',
      title: 'Second Pillar Usage',
      problem: 'Evaluate lim(x->0) (1-cos(5x))/x.',
      steps: [
        { expression: '\\frac{1-\\cos(5x)}{x} = 5 \\cdot \\frac{1-\\cos(5x)}{5x}', annotation: 'Match the (1-cos u)/u pattern.' },
        { expression: '\\lim_{x\\to0} \\frac{1-\\cos(5x)}{x} = 5 \\cdot 0', annotation: 'Use second pillar.' },
        { expression: '= 0', annotation: '' },
      ],
      conclusion: 'Answer: 0.',
    },
    {
      id: 'ch1-ftrl-ex3',
      title: 'High-Frequency Standard Result',
      problem: 'Evaluate lim(x->0) (1-cos(5x))/x^2.',
      steps: [
        { expression: '\\frac{1-\\cos(5x)}{x^2} = 25 \\cdot \\frac{1-\\cos(5x)}{(5x)^2}', annotation: 'Scale denominator to (u)^2.' },
        { expression: '\\lim_{u\\to0} \\frac{1-\\cos u}{u^2} = \\frac{1}{2}', annotation: 'Known derived limit.' },
        { expression: '\\lim_{x\\to0} \\frac{1-\\cos(5x)}{x^2} = 25 \\cdot \\frac{1}{2} = \\frac{25}{2}', annotation: '' },
      ],
      conclusion: 'Answer: 25/2.',
    },
    {
      id: 'ch1-ftrl-ex4',
      title: 'Mixed Identity Build',
      problem: 'Evaluate lim(x->0) (tan x - sin x)/x^3.',
      steps: [
        { expression: '\\tan x - \\sin x = \\sin x(1/\\cos x - 1) = \\sin x(1-\\cos x)/\\cos x', annotation: 'Factor and rewrite.' },
        { expression: '\\frac{\\tan x-\\sin x}{x^3} = \\frac{\\sin x}{x} \\cdot \\frac{1-\\cos x}{x^2} \\cdot \\frac{1}{\\cos x}', annotation: 'Split into three limits.' },
        { expression: '\\to 1 \\cdot \\frac{1}{2} \\cdot 1 = \\frac{1}{2}', annotation: 'Apply pillar + derived limit + continuity of cos.' },
      ],
      conclusion: 'Answer: 1/2.',
    },
  ],

  challenges: [
    {
      id: 'ch1-ftrl-ch1',
      difficulty: 'easy',
      problem: 'Evaluate lim(x->0) sin(9x)/(2x).',
      hint: 'Convert to sin(9x)/(9x).',
      walkthrough: [
        { expression: '\\frac{\\sin(9x)}{2x} = \\frac{9}{2}\\cdot\\frac{\\sin(9x)}{9x}', annotation: '' },
        { expression: '\\to \\frac{9}{2}', annotation: '' },
      ],
      answer: '9/2',
    },
    {
      id: 'ch1-ftrl-ch2',
      difficulty: 'medium',
      problem: 'Evaluate lim(x->0) (1-cos(3x))/x^2.',
      hint: 'Use (1-cos u)/u^2 -> 1/2 with u=3x.',
      walkthrough: [
        { expression: '\\frac{1-\\cos(3x)}{x^2}=9\\cdot\\frac{1-\\cos(3x)}{(3x)^2}', annotation: '' },
        { expression: '\\to 9\\cdot\\frac{1}{2}=\\frac{9}{2}', annotation: '' },
      ],
      answer: '9/2',
    },
    {
      id: 'ch1-ftrl-ch3',
      difficulty: 'hard',
      problem: 'Show that lim(x->0) (sin x - x)/x = 0 using only lim sin x / x = 1.',
      hint: 'Rewrite as sin x / x - 1.',
      walkthrough: [
        { expression: '\\frac{\\sin x - x}{x}=\\frac{\\sin x}{x}-1', annotation: '' },
        { expression: '\\lim_{x\\to0}\\left(\\frac{\\sin x}{x}-1\\right)=1-1=0', annotation: '' },
      ],
      answer: '0',
    },
  ],

  crossRefs: [
    { lessonSlug: 'squeeze-theorem', label: 'Squeeze Theorem', context: 'Primary proof tool for the first pillar.' },
    { lessonSlug: 'limit-laws', label: 'Limit Laws', context: 'Used for scaling, products, and compositions after conversion.' },
    { lessonSlug: 'trig-derivatives', label: 'Trig Derivatives', context: 'These limits are prerequisites for derivative proofs of sin and cos.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
