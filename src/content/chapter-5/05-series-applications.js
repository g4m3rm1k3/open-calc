export default {
  id: 'ch5-series-applications',
  slug: 'series-applications',
  chapter: 5,
  order: 5,
  title: 'Series Applications',
  subtitle: 'Approximation, error bounds, and real-world modeling',
  tags: ['series', 'taylor', 'approximation', 'error bounds', 'applications'],

  hook: {
    question: 'How many terms do you actually need to approximate a function to exam-level accuracy?',
    realWorldContext:
      'Scientific computing approximates non-polynomial functions with finite Taylor truncations and strict error controls.',
    previewVisualizationId: 'TaylorApproximation',
  },

  intuition: {
    prose: [
      'Series become practical when paired with error bounds.',
      'For alternating series that satisfy AST conditions, first omitted term bounds the error.',
      'For Taylor polynomials, Lagrange remainder gives a general worst-case bound.',
    ],
    callouts: [],
    visualizations: [
      {
        id: 'TaylorApproximation',
        title: 'Approximation vs Error',
        caption: 'See approximation improve as degree increases and compare actual vs predicted error.',
      },
    ],
  },

  math: {
    prose: [
      'Alternating series error: |S - S_N| <= b_{N+1}.',
      'Taylor remainder: |R_n(x)| <= M|x-c|^(n+1)/(n+1)! where M bounds |f^(n+1)|.',
      'Practical workflow: choose tolerance, derive bound inequality, solve for n.',
    ],
    callouts: [],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Error bounds convert infinite processes into finite guarantees.',
      'In numerical workflows, this is what turns symbolic formulas into dependable computation.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-series-app-ex1',
      title: 'Approximate sin(0.3)',
      problem: 'Approximate sin(0.3) with Maclaurin terms up to x^5 and estimate error.',
      steps: [
        { expression: 'sin x approx x - x^3/3! + x^5/5!', annotation: 'Use degree-5 polynomial.' },
        { expression: 'sin(0.3) approx 0.3 - 0.027/6 + 0.00243/120 = 0.29552', annotation: 'Compute value.' },
        { expression: '|R_5| <= 0.3^7/7! < 5e-8', annotation: 'Next-term style bound works since derivatives are bounded by 1.' },
      ],
      conclusion: 'High precision with only three nonzero terms.',
    },
  ],

  challenges: [
    {
      id: 'ch5-series-app-ch1',
      difficulty: 'medium',
      problem: 'Find smallest n so truncating e^x at x=1 gives error below 1e-4.',
      hint: 'Use remainder bound for e^x at c=0 with M=e on [0,1].',
      walkthrough: [
        { expression: '|R_n(1)| <= e/(n+1)! < 1e-4', annotation: 'Solve inequality by testing factorial values.' },
      ],
      answer: 'n = 7 works (8! = 40320).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'taylor-maclaurin', label: 'Taylor and Maclaurin Series', context: 'Uses those formulas in exam-style approximation workflows.' },
    { lessonSlug: 'numerical-integration', label: 'Numerical Integration', context: 'Both topics are about approximation with quantified error.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}
