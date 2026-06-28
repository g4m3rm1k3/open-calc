import curveExtremaUrl from '../diagrams/calc-curve-extrema.svg?url';
import evtAbsoluteUrl from '../diagrams/calc-evt-absolute.svg?url';
import closedIntervalMethodUrl from '../diagrams/calc-closed-interval-method.svg?url';
export default {
  id: 'ch3-extreme-value-theorem',
  slug: 'extreme-value-theorem',
  chapter: 3,
  order: 0,
  title: 'Extreme Value Theorem & Absolute Extrema',
  subtitle: 'Guaranteed maxima and minima — and how to find every candidate',
  tags: ['extreme-value-theorem', 'absolute-maximum', 'absolute-minimum', 'local-extrema', 'critical-points', 'closed-interval', 'candidates-test'],

  hook: {
    question: 'Can you always guarantee a function has a maximum value on an interval?',
    realWorldContext:
      'Not always — but the Extreme Value Theorem tells you exactly WHEN you can. ' +
      'An airline must find the flight paths that minimize fuel cost (absolute minimum). ' +
      'A structural engineer must ensure a bridge\'s deflection never exceeds a maximum — ' +
      'the Extreme Value Theorem guarantees this maximum exists if the function is continuous on a closed interval. ' +
      'Without this guarantee, optimization is impossible: you can\'t minimize what might not have a minimum. ' +
      'EVT is the mathematical license that makes all of Chapter 3\'s optimization problems solvable.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Imagine walking along a mountain trail that starts and ends at trailheads (closed interval). ' +
          'If the trail is continuous (no teleportation), you MUST reach a highest point and a lowest point at some moment. ' +
          'That\'s the EVT: a continuous function on a closed interval [a, b] MUST attain an absolute maximum and an absolute minimum.',
          'What can go wrong if one condition fails?',
          '**Not closed**: f(x) = 1/x on (0, 1) — approaches ∞ near 0, never attains it.',
          '**Not continuous**: a jump discontinuity lets the function "skip over" its potential maximum.',
          'Both conditions — **closed** and **continuous** — are required.',
        ],
      },
      { type: 'image', src: curveExtremaUrl, alt: 'Cubic curve with local max and min labeled', caption: 'On a closed interval, a continuous function always attains an absolute max and an absolute min.' },
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Extreme Value Theorem (EVT)',
          body: 'If $f$ is continuous on a closed interval $[a, b]$, then $f$ attains an absolute maximum $M$ and an absolute minimum $m$ on $[a, b]$.\n\n' +
                'That is, there exist $c, d \\in [a, b]$ such that $f(d) \\leq f(x) \\leq f(c)$ for all $x \\in [a, b]$.',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'Where Can Absolute Extrema Occur?',
          body: 'On [a, b], the absolute maximum and minimum must occur at one of these CANDIDATES:\n' +
                '1. **Critical points** inside (a, b): points where f\'(x) = 0 or f\'(x) does not exist\n' +
                '2. **Endpoints**: x = a or x = b\n\n' +
                'The Closed Interval Method: evaluate f at all candidates, compare, biggest = max, smallest = min.',
        },
      },
      {
        type: 'viz',
        id: '',
        title: 'Absolute Extrema Finder',
        mathBridge:
          'A function\'s absolute maximum and minimum on [a, b] must occur at critical points or endpoints. ' +
          'The value at each candidate is computed and the largest/smallest is highlighted.',
        caption: 'Adjust the function and interval. All candidates (endpoints + critical points) are marked. The absolute max and min are colored red and blue.',
      },
      { type: 'image', src: evtAbsoluteUrl, alt: 'Curve on closed interval with absolute max and local extrema labeled', caption: 'EVT guarantees an absolute max and min exist — but there may also be local extrema that are not the global ones.' },
      { type: 'image', src: closedIntervalMethodUrl, alt: 'Three-step method for finding absolute extrema on a closed interval', caption: 'Closed Interval Method: find critical points inside, evaluate at critical points and both endpoints, compare values.' },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Absolute (Global) vs. Local (Relative) Extrema',
          body: '\\textbf{Absolute maximum:} f(c) \\geq f(x) \\text{ for ALL } x \\in [a,b] \\\\ \\textbf{Absolute minimum:} f(d) \\leq f(x) \\text{ for ALL } x \\in [a,b] \\\\ \\textbf{Local maximum:} f(c) \\geq f(x) \\text{ for } x \\text{ near } c \\text{ (just in a neighborhood)} \\\\ \\textbf{Local minimum:} f(d) \\leq f(x) \\text{ for } x \\text{ near } d',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Critical Point',
          body: 'A point $c$ in the domain of $f$ is a **critical point** (or critical number) if:\n' +
                '$f\'(c) = 0$ \\quad OR \\quad $f\'(c)$ does not exist\n\n' +
                'Fermat\'s Theorem: if $f$ has a local extremum at an interior point $c$ of $[a,b]$, then $c$ is a critical point.',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'tip',
          title: 'The Closed Interval Method (4 Steps)',
          body: '1. Verify f is continuous on [a, b] (EVT guarantees extrema exist)\n' +
                '2. Find all critical points of f in (a, b): solve f\'(x) = 0 and find where f\'(x) DNE\n' +
                '3. Evaluate f at all critical points AND at the two endpoints a and b\n' +
                '4. The largest value is the absolute maximum; the smallest is the absolute minimum',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'misconception',
          title: 'Critical Point ≠ Local Extremum',
          body: 'Not every critical point is a local maximum or minimum. ' +
                'Example: f(x) = x³ at x = 0 has f\'(0) = 0, but x = 0 is an INFLECTION POINT, not a local extremum. ' +
                'Fermat\'s theorem is one-directional: local extremum → critical point. ' +
                'The converse fails. You must test further (1st or 2nd derivative test) to classify.',
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Proof sketch of EVT** (Bolzano-Weierstrass approach):',
      'Let f : [a, b] → ℝ be continuous. We claim f is bounded above.',
      'Suppose not. Then for each n ∈ ℕ, there exists xₙ ∈ [a, b] with f(xₙ) > n. ' +
      'The sequence (xₙ) is bounded (since a ≤ xₙ ≤ b), so by Bolzano-Weierstrass it has a convergent subsequence (xₙₖ) → c ∈ [a, b]. ' +
      'By continuity: f(c) = lim f(xₙₖ) = ∞, contradiction. So f is bounded above.',
      'Similarly f is bounded below. The supremum M = sup{f(x) : x ∈ [a, b]} exists. ' +
      'Again by Bolzano-Weierstrass and continuity, M is attained by some point in [a, b]. ■',
      'The EVT fails without the closed interval condition (the sup may not be attained) ' +
      'or without continuity (the function may jump over its supremum).',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Fermat\'s Theorem — Precise Statement',
        body: 'If $f$ has a local maximum or minimum at an interior point $c \\in (a,b)$, and $f\'(c)$ exists, then $f\'(c) = 0$. \\\\ \\text{Contrapositive: if } f\'(c) \\neq 0, \\text{ then } c \\text{ is not a local extremum (f is increasing or decreasing at } c\\text{).}',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-cim-polynomial',
      title: 'Absolute Extrema on a Closed Interval',
      problem: 'Find the absolute maximum and minimum of $f(x) = 2x^3 - 3x^2 - 12x + 4$ on $[-2, 3]$.',
      steps: [
        {
          expression: 'f\'(x) = 6x^2 - 6x - 12 = 6(x^2 - x - 2) = 6(x-2)(x+1)',
          annotation: 'Find and factor the derivative.',
        },
        {
          expression: 'f\'(x) = 0 \\implies x = 2 \\text{ or } x = -1',
          annotation: 'Both critical points are in (−2, 3). ✓',
        },
        {
          expression: 'f\'(x) \\text{ exists everywhere (polynomial). No additional critical points.}',
          annotation: '',
        },
        {
          expression: '\\textbf{Evaluate at candidates: } x = -2, -1, 2, 3',
          annotation: '',
        },
        {
          expression: 'f(-2) = 2(-8) - 3(4) - 12(-2) + 4 = -16 - 12 + 24 + 4 = 0',
          annotation: '',
        },
        {
          expression: 'f(-1) = 2(-1) - 3(1) - 12(-1) + 4 = -2 - 3 + 12 + 4 = 11',
          annotation: '',
        },
        {
          expression: 'f(2) = 2(8) - 3(4) - 12(2) + 4 = 16 - 12 - 24 + 4 = -16',
          annotation: '',
        },
        {
          expression: 'f(3) = 2(27) - 3(9) - 12(3) + 4 = 54 - 27 - 36 + 4 = -5',
          annotation: '',
        },
        {
          expression: '\\text{Absolute max: } f(-1) = 11 \\qquad \\text{Absolute min: } f(2) = -16',
          annotation: 'Compare all four values: {0, 11, −16, −5}. Largest = 11, smallest = −16.',
        },
      ],
      conclusion: 'Absolute maximum of 11 at x = −1; absolute minimum of −16 at x = 2. Note that x = −2 and x = 3 (endpoints) are candidates but did not give the extrema here.',
    },
    {
      id: 'ex-cim-trig',
      title: 'Absolute Extrema of a Trig Function',
      problem: 'Find the absolute max and min of $f(x) = \\sin x + \\cos x$ on $[0, 2\\pi]$.',
      steps: [
        {
          expression: 'f\'(x) = \\cos x - \\sin x = 0 \\implies \\cos x = \\sin x \\implies \\tan x = 1',
          annotation: '',
        },
        {
          expression: 'x = \\frac{\\pi}{4}, \\;\\frac{5\\pi}{4} \\quad \\text{(in } [0, 2\\pi]\\text{)}',
          annotation: 'tan x = 1 in Q1 at π/4 and in Q3 at 5π/4.',
        },
        {
          expression: 'f(0) = 0 + 1 = 1 \\qquad f(\\pi/4) = \\frac{\\sqrt{2}}{2} + \\frac{\\sqrt{2}}{2} = \\sqrt{2}',
          annotation: '',
        },
        {
          expression: 'f(5\\pi/4) = -\\frac{\\sqrt{2}}{2} - \\frac{\\sqrt{2}}{2} = -\\sqrt{2} \\qquad f(2\\pi) = 0 + 1 = 1',
          annotation: '',
        },
        {
          expression: '\\text{Absolute max: } \\sqrt{2} \\text{ at } x = \\pi/4 \\qquad \\text{Absolute min: } -\\sqrt{2} \\text{ at } x = 5\\pi/4',
          annotation: 'Values: {1, √2, −√2, 1}. Largest = √2, smallest = −√2.',
        },
      ],
      conclusion: 'Absolute max = √2 ≈ 1.414 at x = π/4; absolute min = −√2 at x = 5π/4. Note: f(0) = f(2π) = 1, illustrating that endpoints don\'t always give extrema.',
    },
  ],

  challenges: [
    {
      id: 'ch3-evt-c1',
      difficulty: 'easy',
      problem: 'Find the absolute max of $f(x) = x^2 - 4x + 3$ on $[0, 5]$.',
      hint: 'f\'(x) = 2x − 4. Set equal to zero, then evaluate f at all candidates.',
      walkthrough: [
        { expression: 'f\'(x) = 2x - 4 = 0 \\implies x = 2', annotation: '' },
        { expression: 'f(0) = 3, \\quad f(2) = 4 - 8 + 3 = -1, \\quad f(5) = 25 - 20 + 3 = 8', annotation: '' },
        { expression: '\\text{Absolute max: } f(5) = 8 \\qquad \\text{Absolute min: } f(2) = -1', annotation: '' },
      ],
      answer: 'Absolute max = 8 at x = 5; absolute min = −1 at x = 2 (the vertex).',
    },
    {
      id: 'ch3-evt-c2',
      difficulty: 'medium',
      problem: 'Give an example of: (a) a function with no absolute maximum on (0, 1), and (b) a function defined on [0, 1] with no absolute maximum. What EVT conditions fail in each case?',
      hint: 'For (a): try f(x) = x. For (b): introduce a discontinuity.',
      walkthrough: [
        { expression: '(a)\\;f(x) = x \\text{ on } (0,1): \\text{ approaches 1 but never reaches it.}', annotation: 'Interval is NOT closed — EVT does not apply. No absolute maximum.' },
        { expression: '(b)\\;g(x) = \\begin{cases}x & 0 \\leq x < 1 \\\\ 0 & x=1\\end{cases}: \\text{ approaches 1 but jumps to 0.}', annotation: 'f is NOT continuous on [0,1] — EVT does not apply. No absolute maximum.' },
      ],
      answer: '(a) open interval; (b) discontinuity at x = 1 — both violate EVT conditions.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'continuity', label: 'Prerequisite: Continuity (Ch. 1)', context: 'EVT requires continuity on a closed interval.' },
    { lessonSlug: 'rolles-theorem', label: 'Related: Rolle\'s Theorem', context: 'Rolle\'s Theorem also requires closed interval and continuity.' },
    { lessonSlug: 'first-derivative-test', label: 'Next: First Derivative Test', context: 'Classifies critical points as local max/min/neither.' },
    { lessonSlug: 'optimization', label: 'Applied: Optimization', context: 'EVT guarantees the existence of the optimal solution.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The Extreme Value Theorem (EVT) guarantees absolute max and min exist under two conditions. What are they?',
      options: [
        'The function must be differentiable and defined on an open interval',
        'The function must be continuous on a closed bounded interval [a, b] — continuous means no gaps or jumps, and closed+bounded means the endpoints are included and the interval does not extend to infinity',
        'The function must have at least one critical point in the interior of the interval',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'To find the absolute maximum of a continuous function on [a, b], you evaluate at all critical points in (a, b) and at the endpoints a and b. Why include the endpoints?',
      options: [
        'The endpoints are always the location of the absolute max and min — interior points can only be local extrema',
        'The absolute extreme might occur at an endpoint, not at a critical point — critical points are where f\' = 0 or f\' is undefined in the interior; the endpoints have no derivative constraint and must be checked separately',
        'Including endpoints is optional — EVT guarantees the max is always at a critical point',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'f(x) = x² on (0, 1) — open interval. Does the absolute minimum exist?',
      options: [
        'Yes — f approaches 0 as x → 0 and the minimum value is 0',
        'No — on the open interval (0, 1), x = 0 is not in the domain; f(x) = x² gets arbitrarily close to 0 but never reaches it, so no minimum is achieved. EVT does not apply to open intervals',
        'Yes — by EVT, any continuous function on any interval has extreme values',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does the EVT guarantee matter for optimization problems like "minimize cost subject to constraints"?',
      options: [
        'Without EVT, you would have to check infinitely many candidate points and could never confirm you found the global minimum',
        'EVT tells you the optimal solution EXISTS before you calculate it — if the cost function is continuous on a closed bounded feasible region, you know a minimum cost is achievable (not just approached asymptotically), so the search for it is not futile',
        'EVT provides the formula for computing the minimum directly from the endpoints',
      ],
      correct: 1,
    },
  ],
}
