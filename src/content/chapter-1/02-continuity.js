export default {
  id: 'ch1-continuity',
  slug: 'continuity',
  chapter: 1,
  order: 2,
  title: 'Continuity',
  subtitle: 'Functions you can draw without lifting your pencil',
  tags: ['continuity', 'continuous', 'discontinuity', 'removable', 'jump', 'infinite', 'IVT', 'intermediate value theorem'],

  hook: {
    question: 'When you drive from point A to point B, must your speedometer pass through every speed in between?',
    realWorldContext:
      'Yes! If you\'re going 0 mph and then 60 mph, your speed must have been every value between 0 and 60 at some point. ' +
      'This is the **Intermediate Value Theorem** — and it only works because your speed is a continuous function of time. ' +
      'Continuity is the formal way of saying "no sudden jumps" — and it\'s what makes IVT, the Mean Value Theorem, ' +
      'and the Fundamental Theorem of Calculus all work.',
    previewVisualizationId: 'ContinuityViz',
  },

  intuition: {
    prose: [
      'A function is **continuous at a point c** if three things are all true: ' +
      '(1) f(c) is defined, (2) the limit exists at c, and (3) the limit equals f(c).',
      'Intuitively: no holes, no jumps, no vertical asymptotes at x = c.',
      'Continuity is local: a function can be continuous at one point and discontinuous at another. Always ask: continuous where?',
      'There are three types of discontinuity:',
      '**Removable discontinuity** (hole): the limit exists, but either f(c) is undefined or f(c) ≠ limit. Example: f(x) = (x²−1)/(x−1) has a hole at x = 1. Fixable by redefining f(1) = 2.',
      '**Jump discontinuity**: the left and right limits both exist but are different. The function "jumps." Example: the floor function ⌊x⌋ at every integer.',
      '**Infinite discontinuity**: the function blows up (goes to ±∞). Example: 1/x at x = 0.',
      'A fourth common behavior to watch: oscillatory non-limit behavior, such as sin(1/x) near x = 0. The function keeps oscillating and never settles, so continuity fails because the limit does not exist.',
      'Continuity does not mean smoothness. The function |x| is continuous at 0 but has a sharp corner, so it is not differentiable there. Differentiability is a stronger condition than continuity.',
      'A function is **continuous on an interval** if it\'s continuous at every point of that interval. ' +
      'Polynomials, trig functions, and exponentials are continuous everywhere on their domains.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'Pencil Test',
        body: 'A function is continuous on [a,b] if and only if you can draw its graph from (a, f(a)) to (b, f(b)) without lifting your pencil.',
      },
      {
        type: 'misconception',
        title: 'Continuous Does Not Mean Differentiable',
        body: 'f(x)=|x| is continuous at x=0 because both sides approach 0 and f(0)=0. But it is not differentiable there because the left and right slopes are -1 and +1. Continuity allows corners; differentiability does not.',
      },
      {
        type: 'history',
        title: 'Bolzano\'s 1817 Breakthrough',
        body: 'Bernard Bolzano gave one of the first rigorous statements of continuity and the intermediate value principle in 1817, years before Cauchy\'s textbook formalization. His work helped shift calculus from geometric intuition to arithmetic rigor.',
      },
    ],
    visualizationId: 'ContinuityViz',
    visualizationProps: {},
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Limits are simple for continuous functions",
        props: { url: "https://www.youtube.com/embed/0S01H4S8djs" }
      },
      {
        id: 'ContinuityRepairGame',
        title: 'Continuity Repair Game',
        mathBridge: 'A function $f$ is continuous at $c$ iff all three conditions hold: (1) $f(c)$ is defined, (2) $\\lim_{x\\to c}f(x)$ exists, and (3) $\\lim_{x\\to c}f(x) = f(c)$. In this game, the limit already exists (the left and right sides agree) but $f(c)$ is placed at the wrong height — violating condition 3. Dragging the point to match the limit value restores condition 3 and makes the function continuous. This is a removable discontinuity: it can be "repaired" by redefining exactly one point.',
        caption: 'Drag the broken point to match the limit and repair continuity in real time.',
      },
    ],
  },

  math: {
    prose: [
      'The formal definition uses limits.',
      'Continuity is preserved under arithmetic operations: sums, products, quotients (if denominator ≠ 0), and compositions of continuous functions are continuous.',
      'The **Intermediate Value Theorem (IVT)** is one of the most useful theorems in all of calculus:',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Continuity at a Point',
        body: 'f \\text{ is continuous at } c \\iff \\lim_{x \\to c} f(x) = f(c) \\\\ \\text{(requires f(c) defined, limit exists, and they\'re equal)}',
      },
      {
        type: 'theorem',
        title: 'Intermediate Value Theorem (IVT)',
        body: '\\text{If } f \\text{ is continuous on } [a, b] \\text{ and } k \\text{ is any value between } f(a) \\text{ and } f(b), \\\\ \\text{then } \\exists\\, c \\in (a, b) \\text{ such that } f(c) = k.',
      },
    ],
    visualizationId: 'ContinuityViz',
    visualizationProps: { showIVT: true },
  
      visualizations: [
      {
        id: 'VideoEmbed',
        title: "Example: When is a Piecewise Function Continuous?",
        props: { url: "https://www.youtube.com/embed/nzYxGpnllHA" }
      },
      ],
    },

  rigor: {
    prose: [
      'A function is called **uniformly continuous** on an interval if the δ in the ε-δ definition can be chosen to work for all points simultaneously (not just near one point).',
      'The **Extreme Value Theorem**: if f is continuous on a closed interval [a,b], then f attains its maximum and minimum values somewhere on [a,b].',
      'These theorems (IVT, EVT) are consequences of the completeness of ℝ — they fail for rational numbers.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Extreme Value Theorem (EVT)',
        body: 'If f is continuous on [a, b], then \\exists\\, x_{\\min}, x_{\\max} \\in [a,b] such that f(x_{\\min}) \\leq f(x) \\leq f(x_{\\max}) for all x \\in [a,b].',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-check-continuity',
      title: 'Checking Continuity at a Point',
      problem: 'Is f(x) = \\dfrac{x^2 - 4}{x - 2} continuous at x = 2? If not, what type of discontinuity?',
      visualizationId: 'ContinuityViz',
      params: { variant: 'Removable (hole)', hideSelector: true },
      steps: [
        { expression: '\\text{Check (1): Is } f(2) \\text{ defined?}', annotation: 'Substitute x = 2: (4−4)/(2−2) = 0/0. Undefined. ✗' },
        { expression: '\\text{Check (2): Does } \\lim_{x \\to 2} f(x) \\text{ exist?}', annotation: 'Factor and cancel: (x²−4)/(x−2) = (x+2)(x−2)/(x−2) = x+2 for x ≠ 2.' },
        { expression: '\\lim_{x \\to 2} (x+2) = 4', annotation: 'The limit exists and equals 4.' },
        { expression: '\\text{Since f(2) is undefined, f is NOT continuous at x = 2.}', annotation: 'Condition (1) fails.' },
        { expression: '\\text{Type: removable discontinuity (hole at (2, 4)).}', annotation: 'The limit exists — we just have a missing point. Fixable by defining f(2) = 4.' },
      ],
      conclusion: 'Not continuous at x = 2 — removable discontinuity. Define f(2) = 4 to make it continuous.',
    },
    {
      id: 'ex-ivt',
      title: 'Applying the Intermediate Value Theorem',
      problem: 'Show that the equation x^5 - x - 1 = 0 has at least one real root.',
      steps: [
        { expression: 'f(x) = x^5 - x - 1', annotation: 'Define f. It is a polynomial, hence continuous everywhere.' },
        { expression: 'f(1) = 1 - 1 - 1 = -1 < 0', annotation: 'Evaluate at x = 1.' },
        { expression: 'f(2) = 32 - 2 - 1 = 29 > 0', annotation: 'Evaluate at x = 2.' },
        { expression: 'f(1) < 0 < f(2)', annotation: 'f changes sign on [1, 2]. The value 0 is between f(1) and f(2).' },
        { expression: '\\text{By IVT: } \\exists\\, c \\in (1, 2) \\text{ s.t. } f(c) = 0', annotation: 'f is continuous on [1,2] and 0 is between f(1) = −1 and f(2) = 29.' },
      ],
      conclusion: 'The equation has at least one root in (1, 2). IVT guarantees existence — it doesn\'t find the root explicitly.',
    },
    {
      id: 'ex-find-k',
      title: 'Making a Piecewise Function Continuous',
      problem: 'Find k so that f(x) = \\begin{cases} kx^2 - 3 & x \\leq 2 \\\\ x + k & x > 2 \\end{cases} is continuous at x = 2.',
      steps: [
        { expression: '\\lim_{x \\to 2^-} f(x) = k(2)^2 - 3 = 4k - 3', annotation: 'Left-hand limit: use the first piece.' },
        { expression: '\\lim_{x \\to 2^+} f(x) = 2 + k', annotation: 'Right-hand limit: use the second piece.' },
        { expression: 'f(2) = k(2)^2 - 3 = 4k - 3', annotation: 'Function value at x = 2 (use piece defined for x ≤ 2).' },
        { expression: '\\text{For continuity: } 4k - 3 = 2 + k', annotation: 'Set left limit = right limit = f(2).' },
        { expression: '3k = 5 \\implies k = \\frac{5}{3}', annotation: 'Solve for k.' },
      ],
      conclusion: 'k = 5/3 makes the function continuous at x = 2. Check: left limit = 4(5/3)−3 = 20/3−9/3 = 11/3. Right limit = 2 + 5/3 = 11/3. ✓',
    },
    {
      id: 'ex-parachute-velocity',
      title: 'Physics: Is There a Jump in Velocity When a Parachute Opens?',
      problem: 'A skydiver\'s vertical velocity is modeled by v(t)= -50 + 4t for t<8 (free fall before chute deployment) and v(t)= -18 - 2e^{-0.7(t-8)} for t>=8 (after deployment). Is v(t) continuous at t=8?',
      steps: [
        { expression: 'v(8^-) = -50 + 4(8) = -18', annotation: 'Compute the left-hand limit from the pre-deployment model.' },
        { expression: 'v(8^+) = -18 - 2e^{-0.7(0)} = -18 - 2 = -20', annotation: 'Compute the right-hand limit from the post-deployment model.' },
        { expression: 'v(8^-) = -18 \neq -20 = v(8^+)', annotation: 'Left and right limits disagree, so the two-sided limit does not exist.' },
        { expression: '\\therefore v(t) \\text{ is not continuous at } t=8', annotation: 'The model predicts a jump in velocity at deployment.' },
      ],
      conclusion: 'In this model the velocity has a jump discontinuity at deployment time. Real systems usually smooth this transition over a short interval, but piecewise models often include intentional jumps to represent abrupt regime changes.',
    },
    {
      id: 'ex-piecewise-checklist-pass',
      title: 'Piecewise Continuity Checklist — Pass Case',
      problem: 'Check continuity at x=2 for f(x)=x^2-1 (x<2), f(2)=3, f(x)=2x-1 (x>2).',
      visualizationId: 'ContinuityViz',
      params: { variant: 'Continuous', hideSelector: true },
      steps: [
        { expression: 'f(2)=3', annotation: 'Condition 1: value exists.' },
        { expression: '\\lim_{x\\to2^-}(x^2-1)=3', annotation: 'Condition 2a: left limit.' },
        { expression: '\\lim_{x\\to2^+}(2x-1)=3', annotation: 'Condition 2b: right limit.' },
        { expression: '\\lim_{x\\to2}f(x)=3=f(2)', annotation: 'Condition 3: limit equals value.' },
      ],
      conclusion: 'All three conditions pass, so f is continuous at x=2.',
    },
    {
      id: 'ex-piecewise-checklist-fail',
      title: 'Piecewise Continuity Checklist — Fail Case',
      problem: 'Check continuity at x=0 for h(x)=x^2 (x<0), h(x)=x+1 (x>=0).',
      visualizationId: 'ContinuityViz',
      params: { variant: 'Jump', hideSelector: true },
      steps: [
        { expression: 'h(0)=1', annotation: 'Value exists.' },
        { expression: '\\lim_{x\\to0^-}x^2=0', annotation: 'Left limit.' },
        { expression: '\\lim_{x\\to0^+}(x+1)=1', annotation: 'Right limit.' },
        { expression: '0\\neq 1 \\Rightarrow \\lim_{x\\to0}h(x)\\text{ does not exist}', annotation: 'Left and right disagree.' },
      ],
      conclusion: 'h is not continuous at x=0 because the two-sided limit fails.',
    },
    {
      id: 'ex-piecewise-parameter-c',
      title: 'Solve Parameter c for Continuity at a Join',
      problem: 'Find c so f is continuous at x=2: f(x)=cx^2+1 (x<=2), f(x)=x+c (x>2).',
      visualizationId: 'CompositionVisualization',
      steps: [
        { expression: '\\lim_{x\\to2^-}f(x)=4c+1', annotation: 'Left-branch value at the join.' },
        { expression: '\\lim_{x\\to2^+}f(x)=2+c', annotation: 'Right-branch value at the join.' },
        { expression: '4c+1=2+c \\Rightarrow 3c=1 \\Rightarrow c=1/3', annotation: 'Set equal to enforce continuity.' },
      ],
      conclusion: 'c=1/3 is the unique value that removes the join discontinuity.',
    },
  ],

  challenges: [
    {
      id: 'ch1-cont-c1',
      difficulty: 'medium',
      problem: 'Use IVT to prove that every cubic polynomial has at least one real root.',
      hint: 'Consider a cubic p(x) = x³ + bx² + cx + d. What happens to p(x) as x → +∞ and as x → −∞?',
      walkthrough: [
        { expression: 'p(x) = x^3 + bx^2 + cx + d', annotation: 'General cubic (leading coefficient 1, WLOG).' },
        { expression: '\\lim_{x \\to +\\infty} p(x) = +\\infty', annotation: 'x³ dominates as x → +∞.' },
        { expression: '\\lim_{x \\to -\\infty} p(x) = -\\infty', annotation: 'x³ dominates and is negative as x → −∞.' },
        { expression: '\\exists\\; M > 0 \\text{ s.t. } p(M) > 0 \\text{ and } p(-M) < 0', annotation: 'By the limit definition, we can find large enough M.' },
        { expression: 'p \\text{ is a polynomial, hence continuous on } [-M, M]', annotation: '' },
        { expression: 'p(-M) < 0 < p(M) \\implies \\exists\\, c \\in (-M,M) \\text{ s.t. } p(c) = 0', annotation: 'By IVT, p hits 0 somewhere between −M and M. ∎' },
      ],
      answer: 'Proved: every cubic has a real root',
    },
  ],

  crossRefs: [
    { lessonSlug: 'limit-laws', label: 'Previous: Limit Laws', context: 'Continuity is defined using limits.' },
    { lessonSlug: 'epsilon-delta', label: 'Next: Epsilon-Delta', context: 'Make the definition of limit rigorous.' },
    { lessonSlug: 'tangent-problem', label: 'Coming: Derivatives', context: 'Differentiability implies continuity.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
