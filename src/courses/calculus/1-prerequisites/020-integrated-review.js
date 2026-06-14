export default {
  id: 'ch0-integrated-review',
  slug: 'integrated-review',
  chapter: 0,
  order: 4,
  title: 'Integrated Review: Prealgebra to Precalc',
  subtitle: 'A visual systems review connecting algebra, trig, and rates to real-world modeling',
  tags: ['review', 'prealgebra', 'precalc', 'visual learning', 'physics', 'finance', 'engineering', 'modeling'],

  hook: {
    question: 'Can one visual language explain tolerance windows, motion, and compounding growth?',
    realWorldContext:
      'In practice, calculus is a tool built on prealgebra and precalc patterns: interval constraints in engineering tolerances, ' +
      'trig geometry in motion tracking, and exponential models in finance and growth systems. ' +
      'This review unifies those foundations with visual representations so every symbolic step has a geometric meaning.',
    previewVisualizationId: 'FunctionPlotter',
    previewVisualizationProps: {
      fn: 'Math.sin(x) + 0.35*x',
      xMin: -6,
      xMax: 6,
      label: 'One model can combine oscillation and trend'
    },
  },

  intuition: {
    prose: [
      'This review is intentionally visual first. Before formulas, ask three questions: what quantity is changing, what constrains it, and what graph best encodes the constraint.',
      'Prealgebra gives constraint language: intervals, inequalities, and absolute value as distance. If a dimension target is 20 ± 0.1 mm, |x - 20| <= 0.1 is not symbolic decoration; it is a geometric tube around acceptable values.',
      'Precalc gives shape language: lines for constant rates, parabolas for constant acceleration models, exponentials for proportional growth, and trig functions for periodic behavior. Matching scenario to shape is the core modeling step.',
      'A strong workflow is: visualize -> model -> compute -> interpret units. The interpretation step is where many learners skip and lose intuition. Every result must answer: what does this number mean physically or financially?',
      'In a textbook-style sequence, this chapter should end with fluent model recognition and algebraic solving. Calculus enters later as a refinement of these same ideas, not as a replacement for them.',
      'This chapter acts as a bridge: you are not re-memorizing isolated formulas; you are building a reusable map from real systems to mathematical structures.'
    ],
    callouts: [
      {
        type: 'visual-rule',
        title: 'Constraint to Picture',
        body: '|x-a|<r is always a centered interval, and f(x)-g(x) is always vertical gap. Convert symbols to geometry immediately.'
      },
      {
        type: 'real-world',
        title: 'Three Domains, Same Math',
        body: 'Physics uses rates to describe motion, finance uses rates to describe growth, and engineering uses bounds to describe safe operation. The same algebra and function families appear in all three.'
      },
      {
        type: 'tip',
        title: 'Units Are a Model Check',
        body: 'If your input is hours and your output is meters, your model should produce meters/hour for average rate. If units do not transform correctly, the setup is likely wrong.'
      }
    ],
    visualizations: [
      {
        id: 'NumberLine',
        title: 'Distance and Tolerance View',
        caption: 'Absolute value constraints are geometric neighborhoods on the number line.'
      },
      {
        id: 'FunctionPlotter',
        title: 'Shape Recognition View',
        caption: 'Compare line, parabola, sinusoid, and exponential as modeling templates.'
      }
    ]
  },

  math: {
    prose: [
      'Core review identities that power later chapters:',
      '1) Distance/interval equivalence: |x-a|<r <=> a-r < x < a+r.',
      '2) Exponent/log inverse pair: y=b^x <=> x=log_b(y). Use this to solve growth/decay equations.',
      '3) Trig coordinate model: (cos theta, sin theta) on the unit circle.',
      '4) Average rate on an interval: [f(b)-f(a)]/(b-a).',
      'In applied problems, these patterns are enough to build a strong first model before advanced techniques.',
      'When selecting a model family, use behavior tests: constant difference suggests linear, constant second difference suggests quadratic, constant percent change suggests exponential, repeated cycles suggest trig.'
    ],
    callouts: [
      {
        type: 'key-formula',
        title: 'Average Rate Formula',
        body: '\\text{Average rate on } [a,b] = \\dfrac{f(b)-f(a)}{b-a}'
      },
      {
        type: 'technique',
        title: 'Model Selection Heuristic',
        body: 'Linear -> constant slope. Quadratic -> constant acceleration. Exponential -> proportional growth. Trig -> periodic oscillation.'
      }
    ],
    visualizations: [
      {
        id: 'ExponentialGrowth',
        title: 'Growth Pattern View',
        caption: 'Compare how linear and exponential models diverge over time.'
      }
    ]
  },

  rigor: {
    prose: [
      'Rigor is not separate from intuition; it formalizes it. For example, absolute value as distance is made precise by inequalities and interval notation.',
      'A useful proof habit: state domain assumptions explicitly. Many errors in algebraic manipulation come from hidden domain violations (division by zero, log of non-positive quantities, square roots of negatives in real analysis).',
      'In applied modeling, rigor also means validating assumptions: is acceleration truly constant, is growth rate proportional over the full interval, and are tolerance distributions symmetric? A mathematically correct computation can still be a poor model if assumptions are wrong.',
      'Notation discipline matters because it preserves meaning. Distinguish value, rate, and accumulated quantity clearly, and keep units attached during intermediate steps.'
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Domain and Units Checks',
        body: 'Before finalizing any result, verify domain validity and dimensional consistency. This catches many hidden setup mistakes.'
      },
      {
        type: 'theorem',
        title: 'Distance to Interval Equivalence',
        body: '|x-a|<r <=> x in (a-r,a+r). This is the formal bridge from geometric distance to algebraic inequalities.'
      }
    ],
    visualizations: []
  },

  examples: [
    {
      id: 'ch0-review-ex1',
      title: 'Engineering Tolerance Band',
      problem: 'A shaft diameter target is 12.00 mm with tolerance +-0.04 mm. Write the acceptance inequality and interval.',
      visualizationId: 'NumberLine',
      params: {
        showIntervals: true,
        xMin: 11.8,
        xMax: 12.2,
        interval: { a: 11.96, b: 12.04, leftClosed: true, rightClosed: true, label: '[11.96, 12.04]' },
        points: [{ value: 12, label: 'target' }]
      },
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Deviation Function View',
          caption: 'The function d(x)=|x-12| stays below 0.04 only inside the tolerance interval.',
          props: {
            fn: 'Math.abs(x-12)',
            xMin: 11.8,
            xMax: 12.2,
            label: 'd(x)=|x-12|'
          }
        }
      ],
      steps: [
        { expression: '|x-12| \\le 0.04', annotation: 'Distance-from-target statement.' },
        { expression: '12-0.04 \\le x \\le 12+0.04', annotation: 'Convert absolute value bound to centered interval.' },
        { expression: '11.96 \\le x \\le 12.04', annotation: 'Acceptable manufacturing range.' }
      ],
      conclusion: 'Acceptance interval is [11.96, 12.04] mm. The absolute value form and interval form are equivalent constraint languages.'
    },
    {
      id: 'ch0-review-ex2',
      title: 'Physics: Projectile Height Model (Precalc)',
      problem: 'A projectile height model is h(t)=18t-4.9t^2. Find the maximum height and the time it occurs.',
      visualizationId: 'ProjectileMotion',
      params: {
        angle: 60,
        speed: 18
      },
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Height-vs-Time Graph',
          caption: 'The parabola shows the peak as its vertex.',
          props: {
            fn: '18*x - 4.9*x*x',
            xMin: 0,
            xMax: 4,
            label: 'h(t)=18t-4.9t^2'
          }
        }
      ],
      steps: [
        { expression: 'h(t)=18t-4.9t^2=-4.9t^2+18t', annotation: 'Rewrite in standard quadratic form.' },
        { expression: 't_{vertex}=\\frac{-b}{2a}=\\frac{-18}{2(-4.9)}=\\frac{18}{9.8}\\approx1.84', annotation: 'Use vertex formula for the time of maximum height.' },
        { expression: 'h(1.84)\\approx18(1.84)-4.9(1.84)^2\\approx16.53', annotation: 'Substitute back to get max height.' }
      ],
      conclusion: 'Maximum height is about 16.53 m at t≈1.84 s. This stays fully in precalc (quadratics and graph interpretation).'
    },
    {
      id: 'ch0-review-ex3',
      title: 'Finance: Compounded Growth and Log Solve',
      problem: 'An account grows by A(t)=1200e^{0.06t}. Estimate time to double.',
      visualizationId: 'ExponentialGrowth',
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Continuous Growth Curve',
          caption: 'Exponential growth appears linear on a short window and strongly nonlinear on longer horizons.',
          props: {
            fn: '1200*Math.exp(0.06*x)',
            xMin: 0,
            xMax: 15,
            label: 'A(t)=1200e^{0.06t}'
          }
        }
      ],
      steps: [
        { expression: '1200e^{0.06t}=2400', annotation: 'Set output equal to double the initial amount.' },
        { expression: 'e^{0.06t}=2', annotation: 'Divide by 1200.' },
        { expression: '0.06t=\\ln 2', annotation: 'Take natural log of both sides.' },
        { expression: 't=\\frac{\\ln 2}{0.06}\\approx11.55', annotation: 'Doubling time in years.' }
      ],
      conclusion: 'Doubling time is about 11.55 years. Logs convert exponential unknowns into linear equations.'
    },
    {
      id: 'ch0-review-ex4',
      title: 'Engineering: Fill and Drain from Rate Table',
      problem: 'A tank starts at 10 L. Over four 1-minute intervals, net flow rates are +3, +2, -1, -2 L/min. Find final volume.',
      visualizationId: 'WaterTank',
      visualizations: [
        {
          id: 'FunctionPlotter',
          title: 'Rate-By-Interval View',
          caption: 'Use signed rates over equal time steps to compute net change arithmetically.',
          props: {
            fn: '(x<1?3:(x<2?2:(x<3?-1:-2)))',
            xMin: 0,
            xMax: 4,
            label: 'piecewise net flow rate r(t)'
          }
        }
      ],
      steps: [
        { expression: '\\Delta V_1=3\\cdot1=+3,\\;\\Delta V_2=2\\cdot1=+2', annotation: 'First two minutes add 5 liters total.' },
        { expression: '\\Delta V_3=-1\\cdot1=-1,\\;\\Delta V_4=-2\\cdot1=-2', annotation: 'Last two minutes remove 3 liters total.' },
        { expression: 'V_{final}=10+(3+2-1-2)=12', annotation: 'Apply net signed change directly from interval data.' }
      ],
      conclusion: 'Final volume is 12 L. This is the pre-calculus bridge to accumulation thinking using finite intervals.'
    }
  ],

  challenges: [
    {
      id: 'ch0-review-ch1',
      difficulty: 'medium',
      problem: 'A sensor is accurate within +-0.3 units around target 5.5. Write the absolute-value condition and interval, then state whether x=5.1 passes.',
      hint: 'Translate +- tolerance into distance from center.',
      walkthrough: [
        { expression: '|x-5.5| \\le 0.3', annotation: 'Distance form.' },
        { expression: '5.2 \\le x \\le 5.8', annotation: 'Interval form.' },
        { expression: '|5.1-5.5|=0.4>0.3', annotation: '5.1 fails tolerance.' }
      ],
      answer: 'Condition: |x-5.5|<=0.3, interval [5.2,5.8], and x=5.1 is rejected.'
    },
    {
      id: 'ch0-review-ch2',
      difficulty: 'hard',
      problem: 'A growth model is P(t)=P_0\\cdot1.12^t. If P_0=5000, estimate the population after 6 years and compute the doubling time equation.',
      hint: 'Substitute t=6 for prediction, then solve 1.12^t=2 with logarithms for doubling time.',
      walkthrough: [
        { expression: 'P(6)=5000\\cdot1.12^6\\approx5000\\cdot1.9738\\approx9869', annotation: '6-year forecast.' },
        { expression: '1.12^t=2', annotation: 'Doubling-time equation.' },
        { expression: 't=\\frac{\\ln2}{\\ln1.12}\\approx6.12', annotation: 'Use log inversion to solve exponent.' }
      ],
      answer: 'After 6 years: about 9,869. Doubling time: t=ln(2)/ln(1.12)≈6.12 years.'
    }
  ],

  crossRefs: [
    { lessonSlug: 'absolute-value', label: 'Absolute Value as Distance', context: 'Use this when tolerance and interval translations need more practice.' },
    { lessonSlug: 'algebraic-techniques', label: 'Algebraic Techniques', context: 'Factorization and manipulation patterns used in modeling equations.' },
    { lessonSlug: 'functions', label: 'Function Behavior', context: 'Model families and transformations for interpreting real systems.' },
    { lessonSlug: 'exponentials', label: 'Exponentials and Logs', context: 'Growth/decay and inverse solving in finance and natural systems.' },
    { lessonSlug: 'related-rates', label: 'Related Rates', context: 'Next step for coupled physical systems and time-dependent constraints.' },
    { lessonSlug: 'applications', label: 'Applications of Integration', context: 'Extends net-change modeling to work, area-between, and system accumulation.' }
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-medium',
    'attempted-challenge-hard'
  ],
}
