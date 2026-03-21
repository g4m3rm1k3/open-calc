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
      'In deep learning, higher-order local models explain optimizer behavior and curvature corrections. In rendering and signal processing, Fourier/Taylor truncations determine quality-vs-cost tradeoffs (JPEG, MP3, denoising filters). ' +
      'In game and robotics simulation, local series models and time-stepping error bounds control stability. In medicine, dose-response models are linearized near operating points; in finance, local volatility approximations rely on expansion terms.',
    previewVisualizationId: 'TaylorApproximation',
  },

  intuition: {
    prose: [
      'A series is useful in the real world only when you can stop after finitely many terms and still trust the answer. That is why error bounds are the central skill, not optional detail.',
      'For alternating series satisfying AST conditions, the first omitted term bounds the error. This is a gift: fast, reliable, and easy to compute by hand.',
      'For Taylor approximations, the Lagrange remainder gives a worst-case bound based on an upper bound for the next derivative. This is more general and works even when no alternation exists.',
      'Practical workflow: choose a tolerance, choose an approximation family, derive an error inequality, solve for the smallest $n$, then compute the approximation with that $n$. This is exactly how numerical libraries choose internal truncation levels.',
      'In exams, students often compute a polynomial correctly but cannot justify accuracy. In applied settings, that missing justification is the difference between a useful result and an unverifiable guess.',
      'A powerful bridge to life applications: local linearization and low-order Taylor models explain why complex systems are often controlled around operating points. Engineers and scientists rarely use full exact models in real-time control loops.',
      'Fourier-series truncation is the sibling idea in frequency space: keep the dominant low-frequency coefficients and drop high-frequency terms to compress or denoise. JPEG and MP3 are practical versions of "finite series with controlled error".',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Approximation Checklist',
        body: '1) Write the series and identify center $c$. 2) Pick truncation degree $n$. 3) Use the appropriate error theorem (AST or Lagrange). 4) Verify bound $\\le$ tolerance. 5) Report both approximation and guarantee.',
      },
      {
        type: 'warning',
        title: 'Approximation Without a Bound Is Incomplete',
        body: 'A decimal answer alone is not enough in rigorous math, engineering, or science. State exactly why your truncation error is demonstrably small enough.',
      },
      {
        type: 'real-world',
        title: 'Compression Is Series Truncation',
        body: 'Signals are projected onto basis functions. Keeping low-order/high-energy coefficients and discarding the rest is exactly a finite-series approximation with a mathematical distortion budget.',
      },
      {
        type: 'real-world',
        title: 'Simulation Uses Local Series Every Step',
        body: 'Time stepping methods (Euler, Runge-Kutta) are derived entirely from Taylor expansions. Stability and physical accuracy are explicitly controlled by bounding the truncation error terms.',
      },
    ],
    visualizations: [
      {
        id: 'TaylorApproximation',
        title: 'Approximation vs Error',
        caption: 'See the approximation improve as the degree increases, and compare the actual error against the theoretical predicted error bound.',
      },
      {
        id: 'FourierSeries',
        title: 'Fourier Series and Data Compression',
        caption: 'Computer Scientists compress signals (like JPEG/MP3 data) by storing only the lowest-frequency terms. See how truncating the series creates an error ripple (Gibbs phenomenon).',
      },
    ],
  },

  math: {
    prose: [
      'Alternating Series Estimation Theorem: for $S = \\sum (-1)^{n+1}b_n$ with $b_n$ decreasing to 0, the truncation error after $N$ terms satisfies $|S - S_N| \\le b_{N+1}$. This gives immediate concrete digit guarantees.',
      'Taylor Lagrange Remainder Bound: if $f$ has $n+1$ derivatives and $|f^{(n+1)}(t)| \\le M$ on the interval between $c$ and $x$, then $|R_n(x)| \\le \\frac{M|x-c|^{n+1}}{(n+1)!}$.',
      'Choosing $n$ from a tolerance $\\epsilon$ means solving $\\frac{M|x-c|^{n+1}}{(n+1)!} \\le \\epsilon$. This is often done by trial of factorial values or monotone estimate tables.',
      'For $e^x$, $\\sin x$, $\\cos x$ at moderate $x$, factorial growth in the denominator makes the error collapse extremely quickly; even low-degree approximations can be high precision.',
      'For non-entire functions like $\\ln(1+x)$, approximation quality strongly depends on the distance to the expansion center and the interval of convergence boundaries.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Alternating Series Error Bound',
        body: '|S - S_N| \\le b_{N+1} \\quad \\text{when alternating-series hypotheses are satisfied.}',
      },
      {
        type: 'theorem',
        title: 'Taylor Remainder Bound',
        body: '|R_n(x)| \\le \\frac{M|x-c|^{n+1}}{(n+1)!} \\quad \\text{with } M \\ge \\max |f^{(n+1)}(t)| \\text{ on the interval.}',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'Error bounds geometrically convert an infinite object into a finite certificate. Formally, they provide a deterministic inequality proving approximation quality prior to any floating-point computation.',
      'AST proof intuition: alternating partial sums continuously squeeze the true value from above and below; the gap size at step $N$ is exactly the magnitude of the next step $b_{N+1}$.',
      'Taylor bound rigor comes directly from Taylor\'s theorem with the Lagrange remainder. The only nontrivial analytical step is obtaining a valid upper bound $M$ for the $(n+1)$-th derivative on the interval.',
      'In numerical analysis, these bounds support stopping criteria during iterative algorithms, adaptive refinement of meshes, and strict correctness guarantees under constrained computational budgets.',
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-series-app-ex1',
      title: 'Approximate sin(0.3)',
      problem: '\\text{Approximate } \\sin(0.3) \\text{ with Maclaurin terms up to } x^5 \\text{ and estimate the error.}',
      steps: [
        { expression: '\\sin x \\approx x - \\frac{x^3}{3!} + \\frac{x^5}{5!}', annotation: 'Use the degree-5 Taylor polynomial.' },
        { expression: '\\sin(0.3) \\approx 0.3 - \\frac{0.027}{6} + \\frac{0.00243}{120} = 0.29552', annotation: 'Compute the value.' },
        { expression: '|R_5| \\le \\frac{0.3^7}{7!} < 5 \\times 10^{-8}', annotation: 'The next term in the alternating series binds the error (since derivatives are bounded by 1).' },
      ],
      conclusion: 'High precision is achieved with only three nonzero terms. The error is guaranteed to be less than 50 parts per billion.',
    },
    {
      id: 'ch5-series-app-ex2',
      title: 'How Many Terms for e^1 to 6 Decimal Places?',
      problem: '\\text{Find the smallest } n \\text{ so truncating } e^x \\text{ at } x=1 \\text{ gives an absolute error below } 5 \\times 10^{-7}.',
      steps: [
        { expression: '|R_n(1)| \\le \\frac{e}{(n+1)!}', annotation: 'Lagrange remainder bound. Over [0,1], the max of the (n+1)-th derivative of e^x is e^1 = e.' },
        { expression: '\\frac{e}{(n+1)!} < 5 \\times 10^{-7}', annotation: 'Set the tolerance target.' },
        { expression: 'n=8 \\implies \\frac{e}{9!} \\approx 7.49 \\times 10^{-6}', annotation: 'Test factorial thresholds; too large.' },
        { expression: 'n=10 \\implies \\frac{e}{11!} \\approx 6.81 \\times 10^{-8}', annotation: 'First degree meeting the strict tolerance condition.' },
      ],
      conclusion: 'A degree-10 Taylor polynomial at x=1 guarantees at least 6-decimal-place accuracy. This is how calculators establish their internal truncation rules.',
    },
    {
      id: 'ch5-series-app-ex3',
      title: 'Alternating Estimate for ln(2)',
      problem: '\\text{Use } \\ln(2) = 1 - \\frac{1}{2} + \\frac{1}{3} - \\frac{1}{4} + \\dots \\text{ to find the number of terms needed for error } < 0.001.',
      steps: [
        { expression: '|S - S_N| \\le b_{N+1} = \\frac{1}{N+1}', annotation: 'Apply the Alternating Series Test bound with b_{N+1} = 1/(N+1).' },
        { expression: '\\frac{1}{N+1} < 0.001 \\implies N+1 > 1000', annotation: 'Solve the strict inequality.' },
        { expression: 'N = 1000 \\text{ terms}', annotation: 'You must add 1000 components to guarantee the error is under 0.001.' },
      ],
      conclusion: 'Convergence can be mathematically guaranteed but practically useless (too slow). Error bounds tell you this upfront before you waste computing cycles.',
    },
    {
      id: 'ch5-series-app-ex4',
      title: 'Small-Angle Physics Approximation',
      problem: '\\text{For } \\theta=0.12 \\text{ rad, compare } \\sin(\\theta) \\text{ and } \\theta \\text{ as a small-angle model, bounding the error.}',
      steps: [
        { expression: '\\sin(\\theta) = \\theta - \\frac{\\theta^3}{3!} + \\frac{\\theta^5}{5!} - \\dots', annotation: 'Maclaurin expansion for sine.' },
        { expression: '\\sin(0.12) \\approx 0.12 - \\frac{0.12^3}{6} = 0.119712', annotation: 'Cubic-truncated model.' },
        { expression: '|\\text{error}| \\le \\frac{0.12^5}{120} < 2.5 \\times 10^{-7}', annotation: 'First omitted term limits the maximum possible error for decreasing alternating terms.' },
      ],
      conclusion: 'The small-angle approximation is excellent here and, crucially, is now quantitatively justified rather than just hand-waved.',
    },
    {
      id: 'ch5-series-app-ex5',
      title: 'Backprop Curvature Intuition via 2nd-Order Expansion',
      problem: '\\text{Near a current network weight } w_0\\text{, approximate a loss function } L(w) \\text{ using a 2nd-order Taylor model.}',
      steps: [
        { expression: 'L(w) \\approx L(w_0) + L\'(w_0)(w-w_0) + \\frac{1}{2}L\'\'(w_0)(w-w_0)^2', annotation: 'Second-order local Taylor model centered precisely around w_0.' },
        { expression: '\\text{Minimizer: } w^* = w_0 - \\frac{L\'(w_0)}{L\'\'(w_0)}', annotation: 'Take the derivative of the quadratic model with respect to w and set to zero.' },
        { expression: '\\text{If } L\'\'(w_0) \\text{ is huge, the step is small. If flat, the step is vast.}', annotation: 'Curvature explicitly rescales the gradient steps.' },
      ],
      conclusion: 'Standard Gradient Descent is a 1st-order series approximation. Newton-style updates are 2nd-order Taylor minimizers. Deep learning architectures are fundamentally series-approximation engines.',
    },
    {
      id: 'ch5-series-app-ex6',
      title: 'Fourier Truncation and Compression Error',
      problem: '\\text{A signal } f \\text{ is represented by } f(x) = \\sum_{n=1}^{\\infty} c_n\\phi_n(x)\\text{. If you keep only } n \\le N \\text{ terms, what controls error?}',
      steps: [
        { expression: 'f_N(x) = \\sum_{n=1}^{N} c_n\\phi_n(x)', annotation: 'Compressed representation (finite truncated series).' },
        { expression: '\\|f - f_N\\|_2^2 = \\sum_{n>N} |c_n|^2', annotation: 'Energy of discarded coefficients (Parseval framework).' },
        { expression: '\\text{If high-frequency } |c_n| \\text{ are tiny, truncation error is imperceptible.}', annotation: 'This mathematics explains why natural images and audio compress so successfully.' },
      ],
      conclusion: 'JPEG and MP3 compression "quality" settings are mathematically nothing more than selecting a threshold N in a convergent series expansion.',
    },
  ],

  challenges: [
    {
      id: 'ch5-series-app-ch1',
      difficulty: 'medium',
      problem: '\\text{Find the smallest } n \\text{ so truncating } e^x \\text{ at } x=1 \\text{ gives an error below } 1 \\times 10^{-4}.',
      hint: 'Use the Lagrange remainder bound for e^x at c=0 with M=e evaluated on [0,1].',
      walkthrough: [
        { expression: '|R_n(1)| \\le \\frac{e}{(n+1)!} < 10^{-4}', annotation: 'Set up the inequality and evaluate factorial denominators until satisfied.' },
      ],
      answer: 'n = 7 \\text{ suffices } (8! = 40320).',
    },
    {
      id: 'ch5-series-app-ch2',
      difficulty: 'hard',
      problem: '\\text{Approximate } \\int_0^{0.5} e^{-x^2}\\,dx \\text{ using the first four nonzero series terms, and rigorously bound the truncation error.}',
      hint: 'Expand e^(-x^2) using the Maclaurin series for e^x, then integrate term-by-term. The bounds come from AST.',
      walkthrough: [
        { expression: 'e^{-x^2} = 1 - x^2 + \\frac{x^4}{2} - \\frac{x^6}{6} + \\dots', annotation: 'Maclaurin expansion mapped with -x^2.' },
        { expression: '\\int_0^{0.5} e^{-x^2}\\,dx \\approx \\left[ x - \\frac{x^3}{3} + \\frac{x^5}{10} - \\frac{x^7}{42} \\right]_0^{0.5}', annotation: 'Integrate the first four nonzero terms.' },
        { expression: '|\\text{Error}| \\le \\int_0^{0.5} \\frac{x^8}{24}\\,dx = \\frac{0.5^9}{216} \\approx 9.04 \\times 10^{-6}', annotation: 'Bound with the integral of the next absolute term omitted.' },
      ],
      answer: '\\text{Value} \\approx 0.46129 \\text{ with } |\\text{Error}| < 10^{-5}.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'taylor-maclaurin', label: 'Taylor and Maclaurin Series', context: 'Establishes the foundational formulas utilized in these exam-style approximation workflows.' },
    { lessonSlug: 'numerical-integration', label: 'Numerical Integration', context: 'Both topics are ultimately about deterministic approximation with mathematically quantified error.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'solved-challenge'],
}
