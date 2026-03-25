// FILE: src/content/chapter-5/00-sequences.js
export default {
  id: 'ch5-sequences',
  slug: 'sequences',
  chapter: 5,
  order: 1,
  title: 'Sequences',
  subtitle: 'Ordered lists of numbers approaching a destination — the foundation of everything in Calc 2',
  tags: ['sequence', 'convergence', 'divergence', 'bounded', 'monotone', 'limit', 'recursive'],

  hook: {
    question: 'Start with any number $x_0 > 0$. Repeatedly apply the rule $x_{n+1} = \\frac{1}{2}(x_n + 2/x_n)$. What happens? Try $x_0 = 1$: you get $1, 1.5, 1.4167, 1.4142, \\ldots$ — the sequence is racing toward $\\sqrt{2}$. How does it know where to go, and how can we prove it gets there?',
    realWorldContext: 'Sequences are the computational backbone of modern technology. Every time your phone computes a square root, evaluates $\\sin(x)$, or renders a curve, it uses a convergent sequence of approximations. GPS satellites solve positioning equations via Newton\'s method — a recursive sequence. Financial models price options using sequences of discrete approximations converging to the Black-Scholes formula. Machine learning trains neural networks by gradient descent: a sequence $\\theta_0, \\theta_1, \\theta_2, \\ldots$ of parameter vectors converging (hopefully) to an optimum.',
    previewVisualizationId: 'ConvergenceViz',
  },

  intuition: {
    prose: [
      'A sequence is an ordered list of numbers $a_1, a_2, a_3, \\ldots$ indexed by the positive integers. We write $\\{a_n\\}$ or $\\{a_n\\}_{n=1}^{\\infty}$. Each $a_n$ is called a term. Unlike a set, order and repetition matter: the sequence $1, 1, 1, \\ldots$ is perfectly valid. Think of a sequence as a function $a: \\mathbb{N} \\to \\mathbb{R}$, where $a(n) = a_n$. This viewpoint lets us apply all our calculus tools (limits, L\'Hopital\'s rule, etc.) to sequences by studying the corresponding real-valued function.',
      'The central question about any sequence is: does it converge? We say $\\{a_n\\}$ converges to $L$ (written $\\lim_{n\\to\\infty} a_n = L$ or $a_n \\to L$) if the terms get arbitrarily close to $L$ and stay close. Formally: for every $\\varepsilon > 0$, there exists $N$ such that $|a_n - L| < \\varepsilon$ for all $n > N$. If no such $L$ exists, the sequence diverges. The sequence $a_n = 1/n$ converges to $0$: given any $\\varepsilon > 0$, choose $N > 1/\\varepsilon$ and then $|1/n - 0| = 1/n < \\varepsilon$ for all $n > N$.',
      'Some sequences oscillate: $a_n = (-1)^n$ bounces between $-1$ and $+1$ forever and diverges. But $a_n = (-1)^n/n$ oscillates with decreasing amplitude: $-1, 1/2, -1/3, 1/4, \\ldots$ converges to $0$ because $|(-1)^n/n - 0| = 1/n \\to 0$. The oscillation is damped out by the decay factor $1/n$. This distinction — damped vs. undamped oscillation — is fundamental to understanding alternating series later in the chapter.',
      'A sequence is bounded if there exists $M$ such that $|a_n| \\le M$ for all $n$. It is monotone increasing if $a_{n+1} \\ge a_n$ for all $n$, and monotone decreasing if $a_{n+1} \\le a_n$. The Monotone Convergence Theorem states: every bounded, monotone sequence converges. This is a powerful existence theorem — it guarantees convergence without telling you the limit. For example, the sequence $a_1 = 1$, $a_{n+1} = \\frac{1}{2}(a_n + 2/a_n)$ is decreasing (for $n \\ge 1$) and bounded below by $\\sqrt{2}$, so it converges. Setting $L = \\lim a_n$ and taking limits in the recursion gives $L = \\frac{1}{2}(L + 2/L)$, so $L = \\sqrt{2}$.',
      'The Squeeze Theorem for sequences works just like its function counterpart. If $a_n \\le b_n \\le c_n$ for all $n$ sufficiently large, and $\\lim a_n = \\lim c_n = L$, then $\\lim b_n = L$. Classic application: $\\lim_{n\\to\\infty} \\frac{\\sin(n)}{n} = 0$ because $-1/n \\le \\sin(n)/n \\le 1/n$ and both bounds converge to $0$.',
      'L\'Hopital\'s rule can be applied to sequences indirectly. If $f(x)$ is a continuous function with $\\lim_{x\\to\\infty} f(x) = L$, then $\\lim_{n\\to\\infty} f(n) = L$. So to find $\\lim_{n\\to\\infty} n/e^n$, study $\\lim_{x\\to\\infty} x/e^x$, apply L\'Hopital: $\\lim_{x\\to\\infty} 1/e^x = 0$, so $n/e^n \\to 0$. This bridge from sequences to functions is used constantly.',
      'The most famous sequence limit is $\\lim_{n\\to\\infty} (1 + 1/n)^n = e$. Define $a_n = (1+1/n)^n$. One can show $\\{a_n\\}$ is increasing and bounded above by $3$ (using the binomial theorem), so by the Monotone Convergence Theorem it converges. The limit defines Euler\'s number $e \\approx 2.71828$. This sequence connects compound interest (compounding $n$ times per year at rate $1$) to the exponential function, and it underpins all of continuous growth theory.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Convergence of a Sequence',
        body: '$\\lim_{n\\to\\infty} a_n = L$ means: for every $\\varepsilon > 0$, there exists $N \\in \\mathbb{N}$ such that $n > N \\implies |a_n - L| < \\varepsilon$. The number $L$ is unique if it exists.',
      },
      {
        type: 'theorem',
        title: 'Monotone Convergence Theorem',
        body: 'Every bounded, monotone sequence converges. That is: if $\\{a_n\\}$ is increasing and bounded above, it converges to $\\sup\\{a_n\\}$. If $\\{a_n\\}$ is decreasing and bounded below, it converges to $\\inf\\{a_n\\}$.',
      },
      {
        type: 'strategy',
        title: 'Finding Limits of Recursive Sequences',
        body: 'If $a_{n+1} = f(a_n)$ and you know $\\{a_n\\}$ converges to some $L$, take limits on both sides: $L = f(L)$. Solve for $L$. But first you must prove convergence (usually via Monotone Convergence Theorem). Setting $L = f(L)$ without proving convergence is a common exam error.',
      },
      {
        type: 'warning',
        title: 'Bounded Does Not Imply Convergent',
        body: 'The sequence $(-1)^n$ is bounded ($|a_n| \\le 1$) but diverges because it oscillates. Bounded + monotone implies convergent, but bounded alone does not. Monotone alone also does not: $a_n = n$ is increasing but diverges to $\\infty$.',
      },
      {
        type: 'prior-knowledge',
        title: 'Sequences as Functions',
        body: 'A sequence $\\{a_n\\}$ is really a function $a: \\mathbb{N} \\to \\mathbb{R}$. This lets you use L\'Hopital\'s rule, the Squeeze Theorem, and other limit tools from Calc 1 by extending $a_n = f(n)$ to a continuous function $f(x)$ and studying $\\lim_{x\\to\\infty} f(x)$.',
      },
    ],
    visualizationId: 'SequenceViz',
    visualizationProps: {},
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Sequence Terms Approaching a Limit',
        caption: 'Plot $a_n = 1/n$ as discrete points. As $n$ increases, the points cluster toward $y = 0$. The $\\varepsilon$-band around $L = 0$ eventually captures all terms beyond some index $N$.',
      },
    ],
  },

  math: {
    prose: [
      'Definition: A sequence $\\{a_n\\}_{n=1}^{\\infty}$ converges to $L \\in \\mathbb{R}$ if for every $\\varepsilon > 0$ there exists $N \\in \\mathbb{N}$ such that $n > N \\implies |a_n - L| < \\varepsilon$. We write $\\lim_{n\\to\\infty} a_n = L$. A sequence that does not converge is said to diverge.',
      'Limit laws for sequences: if $\\lim a_n = A$ and $\\lim b_n = B$, then $\\lim(a_n \\pm b_n) = A \\pm B$, $\\lim(a_n \\cdot b_n) = AB$, $\\lim(a_n/b_n) = A/B$ (provided $B \\ne 0$), and $\\lim c \\cdot a_n = cA$. These follow from the corresponding $\\varepsilon$-$N$ proofs. Also: if $f$ is continuous and $\\lim a_n = L$, then $\\lim f(a_n) = f(L)$.',
      'Squeeze Theorem for Sequences: if $a_n \\le b_n \\le c_n$ for all $n \\ge N_0$ and $\\lim a_n = \\lim c_n = L$, then $\\lim b_n = L$. Proof: given $\\varepsilon > 0$, choose $N_1$ so $|a_n - L| < \\varepsilon$ for $n > N_1$ and $N_2$ so $|c_n - L| < \\varepsilon$ for $n > N_2$. For $n > \\max(N_0, N_1, N_2)$: $L - \\varepsilon < a_n \\le b_n \\le c_n < L + \\varepsilon$, so $|b_n - L| < \\varepsilon$.',
      'Monotone Convergence Theorem: if $\\{a_n\\}$ is increasing and bounded above, then $\\lim a_n = \\sup\\{a_n : n \\ge 1\\}$. Proof sketch: let $L = \\sup\\{a_n\\}$. Given $\\varepsilon > 0$, $L - \\varepsilon$ is not an upper bound, so there exists $N$ with $a_N > L - \\varepsilon$. Since $\\{a_n\\}$ is increasing, $a_n \\ge a_N > L - \\varepsilon$ for all $n \\ge N$. Also $a_n \\le L < L + \\varepsilon$. So $|a_n - L| < \\varepsilon$ for $n \\ge N$.',
      'Key example: $a_n = (1+1/n)^n$ converges. To show $\\{a_n\\}$ is increasing, use the AM-GM inequality or logarithmic analysis: $\\ln a_n = n \\ln(1+1/n)$. By expanding $\\ln(1+1/n) = 1/n - 1/(2n^2) + O(1/n^3)$, we get $\\ln a_n = 1 - 1/(2n) + O(1/n^2)$, which is increasing. For the upper bound: by the binomial theorem, $a_n = \\sum_{k=0}^n \\binom{n}{k}(1/n)^k \\le \\sum_{k=0}^n 1/k! \\le 1 + 1 + 1/2 + 1/4 + \\cdots \\le 3$. By MCT, the sequence converges; its limit is $e$.',
      'Recursive sequences: given $a_1 = c$ and $a_{n+1} = f(a_n)$, to find the limit: (1) prove convergence (typically show the sequence is monotone and bounded), (2) take limits: $L = f(L)$, (3) solve for $L$ and check which root is consistent with the bounds. Example: $a_1 = 2$, $a_{n+1} = \\frac{1}{2}(a_n + 3/a_n)$. Show $a_n \\ge \\sqrt{3}$ (by AM-GM: $(a_n + 3/a_n)/2 \\ge \\sqrt{3}$). Show $a_{n+1} \\le a_n$ for $a_n \\ge \\sqrt{3}$. By MCT, the sequence converges. Then $L = (L + 3/L)/2 \\implies 2L = L + 3/L \\implies L^2 = 3 \\implies L = \\sqrt{3}$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Squeeze Theorem for Sequences',
        body: 'If $a_n \\le b_n \\le c_n$ for all $n \\ge N_0$ and $\\lim_{n\\to\\infty} a_n = \\lim_{n\\to\\infty} c_n = L$, then $\\lim_{n\\to\\infty} b_n = L$.',
      },
      {
        type: 'theorem',
        title: 'Continuous Function Theorem',
        body: 'If $\\lim_{n\\to\\infty} a_n = L$ and $f$ is continuous at $L$, then $\\lim_{n\\to\\infty} f(a_n) = f(L)$. This justifies passing limits inside continuous functions: $\\lim \\sqrt{a_n} = \\sqrt{\\lim a_n}$, etc.',
      },
      {
        type: 'definition',
        title: 'Bounded and Monotone',
        body: 'A sequence is bounded above if $\\exists M: a_n \\le M$ for all $n$; bounded below if $\\exists m: a_n \\ge m$ for all $n$; bounded if both. It is increasing if $a_{n+1} \\ge a_n$ for all $n$; decreasing if $a_{n+1} \\le a_n$ for all $n$; monotone if either.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The Monotone Convergence Theorem relies on the completeness axiom of the real numbers: every nonempty set of reals bounded above has a supremum. This axiom distinguishes $\\mathbb{R}$ from $\\mathbb{Q}$. In $\\mathbb{Q}$, the sequence $1, 1.4, 1.41, 1.414, \\ldots$ (decimal approximations to $\\sqrt{2}$) is increasing and bounded above by $2$ but has no rational limit. The MCT fails in $\\mathbb{Q}$. Completeness is the foundational property that makes analysis work.',
      'Uniqueness of the limit: if $a_n \\to L$ and $a_n \\to M$, then $L = M$. Proof: $|L - M| = |L - a_n + a_n - M| \\le |L - a_n| + |a_n - M|$. Given $\\varepsilon > 0$, choose $N$ so both $|a_n - L| < \\varepsilon/2$ and $|a_n - M| < \\varepsilon/2$ for $n > N$. Then $|L - M| < \\varepsilon$ for all $\\varepsilon > 0$, so $L = M$.',
      'A convergent sequence is bounded: if $a_n \\to L$, choose $N$ so $|a_n - L| < 1$ for $n > N$. Then $|a_n| < |L| + 1$ for $n > N$, and $|a_n| \\le \\max(|a_1|, \\ldots, |a_N|, |L|+1)$ for all $n$. The converse fails: bounded does not imply convergent. However, the Bolzano-Weierstrass Theorem states that every bounded sequence has a convergent subsequence.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Bolzano-Weierstrass Theorem',
        body: 'Every bounded sequence in $\\mathbb{R}$ has a convergent subsequence. This is equivalent to the completeness of $\\mathbb{R}$ and is the foundation for compactness arguments in analysis.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-000-ex1',
      title: 'Direct Limit: aₙ = (3n² + 1)/(5n² − 2)',
      problem: '\\text{Find } \\lim_{n \\to \\infty} \\frac{3n^2 + 1}{5n^2 - 2}.',
      steps: [
        { expression: '\\frac{3n^2+1}{5n^2-2} = \\frac{3 + 1/n^2}{5 - 2/n^2}', annotation: 'Divide numerator and denominator by the highest power of $n$ (here $n^2$).' },
        { expression: '\\lim_{n\\to\\infty} \\frac{3+1/n^2}{5-2/n^2} = \\frac{3+0}{5-0} = \\frac{3}{5}', annotation: 'As $n \\to \\infty$, $1/n^2 \\to 0$ and $2/n^2 \\to 0$.' },
      ],
      conclusion: '$\\lim a_n = 3/5$. For rational functions of $n$, the limit equals the ratio of leading coefficients when the degrees match.',
    },
    {
      id: 'ch5-000-ex2',
      title: 'Squeeze Theorem: aₙ = sin(n)/n',
      problem: '\\text{Find } \\lim_{n \\to \\infty} \\frac{\\sin(n)}{n}.',
      steps: [
        { expression: '-1 \\le \\sin(n) \\le 1 \\implies -\\frac{1}{n} \\le \\frac{\\sin(n)}{n} \\le \\frac{1}{n}', annotation: 'Bound $\\sin(n)$ between $-1$ and $1$, then divide by $n > 0$.' },
        { expression: '\\lim_{n\\to\\infty} \\left(-\\frac{1}{n}\\right) = 0 \\quad \\text{and} \\quad \\lim_{n\\to\\infty} \\frac{1}{n} = 0', annotation: 'Both bounding sequences converge to $0$.' },
        { expression: '\\text{By Squeeze Theorem: } \\lim_{n\\to\\infty} \\frac{\\sin(n)}{n} = 0', annotation: 'The oscillating sequence is crushed to $0$ between the two bounds.' },
      ],
      conclusion: '$\\lim \\sin(n)/n = 0$. The Squeeze Theorem handles oscillating sequences that cannot be evaluated directly.',
    },
    {
      id: 'ch5-000-ex3',
      title: 'L\'Hopital via Continuous Extension: aₙ = n·sin(1/n)',
      problem: '\\text{Find } \\lim_{n\\to\\infty} n\\sin(1/n).',
      steps: [
        { expression: '\\text{Let } x = 1/n. \\text{ As } n \\to \\infty, x \\to 0^+.', annotation: 'Substitute to convert a sequence limit to a function limit.' },
        { expression: 'n\\sin(1/n) = \\frac{\\sin(x)}{x} \\quad \\text{where } x = 1/n', annotation: 'Rewrite: $n \\sin(1/n) = \\sin(x)/x$.' },
        { expression: '\\lim_{x\\to 0^+} \\frac{\\sin(x)}{x} = 1', annotation: 'This is the fundamental trig limit from Calc 1.' },
      ],
      conclusion: '$\\lim n\\sin(1/n) = 1$. Converting to a continuous variable lets us use L\'Hopital or known limits.',
    },
    {
      id: 'ch5-000-ex4',
      title: 'Recursive Sequence: Babylonian Square Root Method',
      problem: '\\text{Let } a_1 = 1, \\; a_{n+1} = \\frac{1}{2}\\left(a_n + \\frac{2}{a_n}\\right). \\text{ Prove convergence and find the limit.}',
      steps: [
        { expression: 'a_{n+1} = \\frac{a_n^2 + 2}{2a_n} \\ge \\frac{2\\sqrt{2}\\,a_n}{2a_n} = \\sqrt{2}', annotation: 'By AM-GM: $a_n + 2/a_n \\ge 2\\sqrt{2}$, so $a_{n+1} \\ge \\sqrt{2}$ for all $n \\ge 1$. The sequence is bounded below.' },
        { expression: 'a_{n+1} - a_n = \\frac{2/a_n - a_n}{2} = \\frac{2 - a_n^2}{2a_n} \\le 0 \\text{ when } a_n \\ge \\sqrt{2}', annotation: 'For $n \\ge 1$, $a_n \\ge \\sqrt{2}$ so $a_n^2 \\ge 2$, making $a_{n+1} - a_n \\le 0$. The sequence is decreasing.' },
        { expression: '\\text{By MCT, } \\{a_n\\} \\text{ converges. Let } L = \\lim a_n.', annotation: 'Bounded below + decreasing = convergent.' },
        { expression: 'L = \\frac{1}{2}\\left(L + \\frac{2}{L}\\right) \\implies 2L^2 = L^2 + 2 \\implies L^2 = 2 \\implies L = \\sqrt{2}', annotation: 'Take limits in the recursion. Since $L > 0$, we get $L = \\sqrt{2}$.' },
      ],
      conclusion: 'The sequence converges to $\\sqrt{2}$. This is the Babylonian method (also Newton\'s method applied to $f(x) = x^2 - 2$). It converges quadratically — each iteration roughly doubles the number of correct digits.',
    },
    {
      id: 'ch5-000-ex5',
      title: 'The Sequence (1 + 1/n)^n → e',
      problem: '\\text{Show that } a_n = (1+1/n)^n \\text{ is increasing and bounded, hence convergent.}',
      steps: [
        { expression: '\\ln a_n = n\\ln(1+1/n)', annotation: 'Take the natural log to work with sums instead of products.' },
        { expression: '\\text{Let } f(x) = x\\ln(1+1/x). \\; f\'(x) = \\ln(1+1/x) - \\frac{1}{x+1}', annotation: 'Differentiate to check monotonicity.' },
        { expression: '\\ln(1+1/x) > \\frac{1}{x+1} \\text{ for } x > 0 \\text{ (since } \\ln(1+t) > t/(1+t) \\text{ for } t > 0\\text{)}', annotation: 'This inequality shows $f\'(x) > 0$, so $f$ is increasing, so $a_n$ is increasing.' },
        { expression: 'a_n = \\sum_{k=0}^{n}\\binom{n}{k}\\frac{1}{n^k} \\le \\sum_{k=0}^{n}\\frac{1}{k!} \\le 1 + \\sum_{k=1}^{n}\\frac{1}{2^{k-1}} \\le 3', annotation: 'Binomial expansion + bound $k! \\ge 2^{k-1}$ gives $a_n < 3$.' },
      ],
      conclusion: '$\\{a_n\\}$ is increasing and bounded above by $3$, so by MCT it converges. The limit is $e \\approx 2.71828$. This sequence arises from continuous compounding: investing $\\$1$ at $100\\%$ annual interest compounded $n$ times per year gives $\\$(1+1/n)^n$ after one year.',
    },
  ],

  challenges: [
    {
      id: 'ch5-sequences-ch1',
      difficulty: 'medium',
      problem: 'Let $a_1 = 1$, $a_{n+1} = \\sqrt{2 + a_n}$. Prove that $\\{a_n\\}$ converges and find the limit.',
      hint: 'Show by induction that $a_n < 2$ for all $n$, then show the sequence is increasing by checking $a_{n+1}^2 - a_n^2$.',
      walkthrough: [
        { expression: 'a_1=1<2. \\text{ If } a_n<2, \\text{ then } a_{n+1}=\\sqrt{2+a_n}<\\sqrt{4}=2.', annotation: 'Induction shows the sequence is bounded above by 2.' },
        { expression: 'a_{n+1}^2 - a_n^2 = (2+a_n) - a_n^2 = (2-a_n)(1+a_n) > 0 \\text{ since } 0<a_n<2', annotation: 'So a_{n+1} > a_n: the sequence is increasing.' },
        { expression: '\\text{By MCT, } \\exists L = \\lim a_n. \\text{ Then } L = \\sqrt{2+L}.', annotation: 'Take limits in the recursion.' },
        { expression: 'L^2 = 2+L \\Rightarrow L^2-L-2=0 \\Rightarrow (L-2)(L+1)=0 \\Rightarrow L=2', annotation: 'Since L ≥ 0, L = 2.' },
      ],
      answer: 'L = 2',
    },
    {
      id: 'ch5-sequences-ch2',
      difficulty: 'medium',
      problem: 'Show that $\\displaystyle\\lim_{n\\to\\infty} \\frac{n!}{n^n} = 0$.',
      hint: 'Write n!/nⁿ = (1/n)(2/n)···(n/n). The first factor 1/n → 0 and all others are ≤ 1.',
      walkthrough: [
        { expression: '\\frac{n!}{n^n} = \\prod_{k=1}^{n}\\frac{k}{n}', annotation: 'Write as a product of ratios k/n.' },
        { expression: '0 < \\frac{n!}{n^n} \\leq \\frac{1}{n} \\cdot 1 \\cdot 1 \\cdots 1 = \\frac{1}{n}', annotation: 'The first factor is 1/n; all remaining factors k/n ≤ 1.' },
        { expression: '0 < \\frac{n!}{n^n} \\leq \\frac{1}{n} \\to 0 \\; \\Rightarrow \\; \\lim \\frac{n!}{n^n} = 0 \\;\\blacksquare', annotation: 'Squeeze Theorem.' },
      ],
      answer: '\\lim_{n\\to\\infty} n!/n^n = 0',
    },
    {
      id: 'ch5-sequences-ch3',
      difficulty: 'hard',
      problem: 'Prove: if $\\lim a_n = L$, then $\\displaystyle\\lim_{n\\to\\infty} \\frac{a_1+\\cdots+a_n}{n} = L$ (Cesàro mean).',
      hint: 'Let s_n = (a_1+...+a_n)/n. Split s_n − L into two sums: first N terms (fixed) and remaining (small by hypothesis).',
      walkthrough: [
        { expression: 's_n - L = \\frac{1}{n}\\sum_{k=1}^{N}(a_k-L) + \\frac{1}{n}\\sum_{k=N+1}^{n}(a_k-L)', annotation: 'Split at N where all later terms satisfy |aₖ−L| < ε/2.' },
        { expression: '\\left|\\frac{1}{n}\\sum_{k=1}^{N}(a_k-L)\\right| \\leq \\frac{NC}{n} \\to 0', annotation: 'First sum has N fixed terms. The 1/n factor kills them as n → ∞.' },
        { expression: '\\left|\\frac{1}{n}\\sum_{k=N+1}^{n}(a_k-L)\\right| \\leq \\frac{n-N}{n}\\cdot\\frac{\\varepsilon}{2} < \\frac{\\varepsilon}{2}', annotation: 'Second sum: each term < ε/2 by choice of N.' },
        { expression: '|s_n - L| < \\varepsilon \\text{ for large } n. \\quad \\blacksquare', annotation: 'QED: the Cesàro mean converges to the same limit.' },
      ],
      answer: '\\text{Proved: } \\lim s_n = L.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'introduction', label: 'Limits of Functions', context: 'The continuous analogue of sequence limits — same epsilon-delta spirit.' },
    { lessonSlug: 'squeeze-theorem', label: 'Squeeze Theorem', context: 'Same bounding idea applied to sequences.' },
    { lessonSlug: 'series-intro', label: 'Series', context: 'Sums of sequences — what happens when you add up all the terms.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'attempted-challenge-1',
    'attempted-challenge-2',
  ],
}
