export default {
  id: 'ch5-series-applications',
  slug: 'series-applications',
  chapter: 5,
  order: 5,
  title: 'Series Applications',
  subtitle: 'From formulas to decisions: approximation, guarantees, and domain modeling',
  tags: ['series', 'taylor', 'approximation', 'error bounds', 'alternating series', 'numerical methods', 'applications'],

  hook: {
    question: 'How many terms do you actually need to approximate a function to exam-level accuracy?',
    realWorldContext:
      'Scientific computing, embedded systems, and simulation software approximate non-polynomial functions with finite truncations and strict error controls. ' +
      'In deep learning, higher-order local models explain optimizer behavior and curvature corrections. In rendering and signal processing, Fourier/Taylor truncations determine quality-vs-cost tradeoffs (JPEG, MP3, denoising filters). In game and robotics simulation, local series models and time-stepping error bounds control stability. In medicine, dose-response models are linearized near operating points; in finance, local volatility approximations rely on expansion terms; in physics, small-angle and perturbation approximations turn impossible equations into solvable ones.',
    previewVisualizationId: 'TaylorApproximation',
  },

  intuition: {
    prose: [
      'A series is useful in the real world only when you can stop after finitely many terms and still trust the answer. That is why error bounds are the central skill, not optional detail.',
      'For alternating series satisfying AST conditions, the first omitted term bounds error. This is a gift: fast, reliable, and easy to compute by hand.',
      'For Taylor approximations, the Lagrange remainder gives a worst-case bound based on an upper bound for the next derivative. This is more general and works even when no alternation exists.',
      'Practical workflow: choose tolerance, choose approximation family, derive an error inequality, solve for smallest n, then compute approximation with that n. This is exactly how numerical libraries choose internal truncation levels.',
      'In exams, students often compute a polynomial correctly but cannot justify accuracy. In applied settings, that missing justification is the difference between a useful result and an unverifiable guess.',
      'A powerful bridge to life applications: local linearization and low-order Taylor models explain why complex systems are often controlled around operating points. Engineers and scientists rarely use full exact models in real-time control loops.',
      'Fourier-series truncation is the sibling idea in frequency space: keep the dominant low-frequency coefficients and drop high-frequency terms to compress or denoise. JPEG and MP3 are practical versions of "finite series with controlled error".',
      'In physically based graphics, illumination integrals are approximated numerically, but many kernels are expanded into low-order basis/series forms first. The workflow is still identical: truncate, bound, validate.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Approximation Checklist',
        body: '1) Write the series and identify center c. 2) Pick truncation degree n. 3) Use the appropriate error theorem (AST or Lagrange). 4) Verify bound <= tolerance. 5) Report both approximation and guarantee.',
      },
      {
        type: 'warning',
        title: 'Approximation Without a Bound Is Incomplete',
        body: 'A decimal answer alone is not enough in rigorous math, engineering, or science. State why your truncation error is small enough.',
      },
      {
        type: 'real-world',
        title: 'Compression Is Series Truncation',
        body: 'Signals are projected onto basis functions. Keeping low-order/high-energy coefficients and discarding the rest is exactly a finite-series approximation with a distortion budget.',
      },
      {
        type: 'real-world',
        title: 'Simulation Uses Local Series Every Step',
        body: 'Time stepping methods (Euler, RK, multistep) are derived from Taylor expansions. Stability and accuracy are controlled by truncation error terms.',
      },
    ],
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
      'Alternating Series Estimation Theorem: for S = sum (-1)^(n+1)b_n with b_n decreasing to 0, the truncation error after N terms satisfies |S-S_N| <= b_{N+1}. This gives immediate digit guarantees.',
      'Taylor Lagrange remainder bound: if f has n+1 derivatives and |f^(n+1)(t)| <= M on interval between c and x, then |R_n(x)| <= M|x-c|^(n+1)/(n+1)!.',
      'Choosing n from tolerance epsilon means solving M|x-c|^(n+1)/(n+1)! <= epsilon. This is often done by trial of factorial values or monotone estimate tables.',
      'For exp, sin, cos at moderate x, factorial growth makes error collapse very quickly; low-degree approximations can already be high precision.',
      'For non-entire functions like ln(1+x), approximation quality strongly depends on distance to expansion center and interval of convergence boundaries.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Alternating Series Error Bound',
        body: '|S-S_N| <= b_{N+1} when alternating-series hypotheses are satisfied.',
      },
      {
        type: 'theorem',
        title: 'Taylor Remainder Bound',
        body: '|R_n(x)| <= M|x-c|^(n+1)/(n+1)! with M >= max |f^(n+1)| on the interval.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Error bounds convert an infinite object into a finite certificate. Formally, they provide a deterministic inequality proving approximation quality before any floating-point computation.',
      'AST proof idea: alternating partial sums squeeze the true value from above and below, and the gap equals at most the next term magnitude.',
      'Taylor bound rigor comes from Taylor\'s theorem with Lagrange remainder. The only nontrivial step is obtaining a valid derivative bound M on the interval.',
      'In numerical analysis, these bounds support stopping criteria, adaptive refinement, and correctness guarantees under constrained computational budgets.',
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
    {
      id: 'ch5-series-app-ex2',
      title: 'How Many Terms for e^1 to 6 Decimal Places?',
      problem: 'Find smallest n so truncating e^x at x=1 gives absolute error below 5e-7.',
      steps: [
        { expression: '|R_n(1)| <= e/(n+1)!', annotation: 'Lagrange remainder with M=e on [0,1].' },
        { expression: 'Need e/(n+1)! < 5\\times10^{-7}', annotation: 'Set tolerance target.' },
        { expression: 'n=8 => e/9! approx 7.49\\times10^{-6} (too large)', annotation: 'Test factorial thresholds.' },
        { expression: 'n=10 => e/11! approx 6.81\\times10^{-8} (works)', annotation: 'First degree meeting tolerance.' },
      ],
      conclusion: 'Degree 10 Taylor polynomial at x=1 guarantees at least 6-decimal-place accuracy.',
    },
    {
      id: 'ch5-series-app-ex3',
      title: 'Alternating Estimate for ln(2)',
      problem: 'Use ln(2)=1-1/2+1/3-1/4+... to find terms needed for error < 0.001.',
      steps: [
        { expression: '|S-S_N| <= 1/(N+1)', annotation: 'AST with b_n=1/n.' },
        { expression: 'Need 1/(N+1) < 0.001 => N+1 > 1000', annotation: 'Solve inequality.' },
        { expression: 'Take N=1000 terms', annotation: 'Guarantees error less than 0.001.' },
      ],
      conclusion: 'Convergence can be provably slow even when guaranteed. Error bounds tell you this upfront.',
    },
    {
      id: 'ch5-series-app-ex4',
      title: 'Small-Angle Physics Approximation',
      problem: 'For theta=0.12 rad, compare sin(theta) and theta as a small-angle model and bound the error.',
      steps: [
        { expression: 'sin(theta)=theta-theta^3/3!+theta^5/5!-...', annotation: 'Maclaurin expansion.' },
        { expression: 'sin(0.12) approx 0.12 - 0.12^3/6 = 0.119712', annotation: 'Cubic-truncated model.' },
        { expression: '|error| <= 0.12^5/120 < 2.5\\times10^{-7}', annotation: 'First omitted term bound for alternating decreasing terms.' },
      ],
      conclusion: 'The small-angle approximation is excellent here and now quantitatively justified.',
    },
    {
      id: 'ch5-series-app-ex5',
      title: 'Backprop Curvature Intuition via 2nd-Order Expansion',
      problem: 'Near a current parameter value w0, approximate a loss L(w) using a second-order Taylor model and interpret the update step.',
      steps: [
        { expression: 'L(w) \approx L(w_0) + L^{\\prime}(w_0)(w-w_0) + \\frac12 L^{\\prime\\prime}(w_0)(w-w_0)^2', annotation: 'Second-order local model around w0.' },
        { expression: '\\text{Minimizer of model: } w^* = w_0 - \\frac{L^{\\prime}(w_0)}{L^{\\prime\\prime}(w_0)}', annotation: 'Set derivative of quadratic model to zero.' },
        { expression: '\\text{If } L^{\\prime\\prime}(w_0) \\text{ is large, step is small; if small, step is larger}', annotation: 'Curvature rescales gradient steps.' },
      ],
      conclusion: 'Gradient descent is first-order. Newton-style updates are second-order Taylor minimizers. Both are series-approximation decisions.',
    },
    {
      id: 'ch5-series-app-ex6',
      title: 'Fourier Truncation and Compression Error',
      problem: 'A signal f is represented by f(x)=\\sum_{n=1}^{\\infty} c_n\\phi_n(x). If you keep only n<=N terms, what controls error?',
      steps: [
        { expression: 'f_N(x)=\\sum_{n=1}^{N} c_n\\phi_n(x)', annotation: 'Compressed representation (finite series).' },
        { expression: '\\|f-f_N\\|_2^2 = \\sum_{n>N} |c_n|^2', annotation: 'Energy of discarded coefficients (Parseval framework).' },
        { expression: '\\text{If high-frequency } |c_n| \\text{ are tiny, truncation error is tiny}', annotation: 'Why natural images/audio compress well.' },
      ],
      conclusion: 'JPEG/MP3 quality tuning is mathematically a choice of N (or threshold) in a convergent basis expansion.',
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
    {
      id: 'ch5-series-app-ch2',
      difficulty: 'hard',
      problem: 'Approximate integral from 0 to 0.5 of e^(-x^2) dx using first four nonzero series terms and bound truncation error.',
      hint: 'Expand e^(-x^2)=1-x^2+x^4/2!-x^6/3!+..., integrate term-by-term.',
      walkthrough: [
        { expression: 'e^{-x^2}=1-x^2+x^4/2-x^6/6+...', annotation: 'Maclaurin in x^2.' },
        { expression: '\\int_0^{0.5} e^{-x^2}dx approx [x-x^3/3+x^5/10-x^7/42]_0^{0.5}', annotation: 'Integrate first four nonzero terms.' },
        { expression: 'error <= \\int_0^{0.5} x^8/24 dx = 0.5^9/216 approx 9.04\\times10^{-6}', annotation: 'Bound with next omitted absolute term integral.' },
      ],
      answer: 'Approximation about 0.46129 with error < 1e-5.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'taylor-maclaurin', label: 'Taylor and Maclaurin Series', context: 'Uses those formulas in exam-style approximation workflows.' },
    { lessonSlug: 'numerical-integration', label: 'Numerical Integration', context: 'Both topics are about approximation with quantified error.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}
