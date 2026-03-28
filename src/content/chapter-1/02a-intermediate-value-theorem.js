export default {
  id: 'ch1-ivt',
  slug: 'intermediate-value-theorem',
  chapter: 1,
  order: 2.5,
  title: 'The Intermediate Value Theorem',
  subtitle: 'You cannot jump over a value without passing through it',
  tags: [
    'IVT', 'intermediate value theorem', 'existence theorem', 'root finding',
    'bisection method', 'continuous function', 'zeros', 'Bolzano', 'fixed point',
    'connectedness', 'existence proof', 'polynomial roots',
  ],

  hook: {
    question: 'You drive from Miami (sea level) to the top of a mountain (3,000 ft). At what exact moment were you at exactly 1,000 ft elevation?',
    realWorldContext:
      'You were definitely at 0 ft and definitely at 3,000 ft. At no point did you teleport — you drove continuously. ' +
      'Therefore you must have passed through every elevation in between, including exactly 1,000 ft. ' +
      'This seems obvious for driving, but the same logic proves something profound in mathematics: ' +
      'every polynomial of odd degree has at least one real root, ' +
      'every equation f(x) = 0 where f is continuous and changes sign must have a solution, ' +
      'and every physical system that changes continuously between two states must pass through every intermediate state. ' +
      'This is the Intermediate Value Theorem — one of the most useful existence theorems in all of mathematics.',
    previewVisualizationId: 'BisectionMethod',
  },

  intuition: {
    prose: [
      '**The core idea is about continuous motion.** If you are walking along a path and you end up higher than where you started, you must have passed through every height in between. You cannot jump. You cannot teleport. You must go through every intermediate value.',

      'Mathematically: if $f$ is continuous on $[a, b]$, and $f(a) = 2$ and $f(b) = 7$, then $f$ must take every value between 2 and 7 somewhere in $(a, b)$. Want to know if $f$ ever equals 5? Yes — guaranteed. Does $f$ equal 3.14159? Yes. Does $f$ equal 6.9999? Yes. Every single value between 2 and 7 is hit at least once.',

      '**The sign-change corollary is the workhorse.** If $f(a) < 0$ and $f(b) > 0$, then somewhere between $a$ and $b$ the function must cross zero. This is how we prove that equations have solutions: evaluate at two points with opposite signs, and the IVT guarantees a root between them. Example: $f(x) = x^3 - x - 1$. We have $f(1) = -1 < 0$ and $f(2) = 5 > 0$. Therefore there is a root between 1 and 2. Done. We haven\'t found it exactly, but we\'ve proved it exists.',

      '**The bisection method turns IVT into an algorithm.** Once you know a root lies between $a$ and $b$, evaluate at the midpoint $m = (a+b)/2$. If $f(m) = 0$, you\'re done. If $f(m)$ has the same sign as $f(a)$, the root is in $[m, b]$. If $f(m)$ has the same sign as $f(b)$, the root is in $[a, m]$. Repeat. Each step cuts the interval in half, so after $n$ steps you\'ve localized the root to within $(b-a)/2^n$ of its true location. This is the oldest root-finding algorithm in existence.',

      '**Why does continuity matter?** Remove it, and the theorem fails immediately. Consider $f(x) = -1$ for $x < 0$ and $f(x) = +1$ for $x \geq 0$. Then $f(-1) = -1$ and $f(1) = +1$, but $f$ never equals 0. The discontinuity at $x = 0$ is the escape hatch that lets the function "jump over" zero. Continuity is not just a technical condition — it is the precise mathematical formalization of "no teleporting."',

      '**The IVT is secretly a theorem about connected sets.** In topology, the IVT says that the continuous image of a connected set is connected. The interval $[a, b]$ is connected (it has no gaps), so its image under $f$ must also be connected (no gaps), which means the image must contain every value between $f(a)$ and $f(b)$. This "big picture" view explains why the theorem is true at a deep level.',

      '**Real-world applications are everywhere.** In economics: if supply exceeds demand at price $p_1$ and is less than demand at price $p_2$, there must be an equilibrium price between them. In engineering: if a beam deflects upward at one end and downward at another under a load, it has a neutral point in between. In medicine: if body temperature was 98.6°F at 8am and 103°F at noon, it passed through every temperature in between — so doctors can say "the fever first reached 101°F sometime between 8am and noon."',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Intermediate Value Theorem (IVT)',
        body: 'If $f$ is continuous on the closed interval $[a, b]$, and $N$ is any number strictly between $f(a)$ and $f(b)$, then there exists at least one $c$ in $(a, b)$ such that $f(c) = N$.',
      },
      {
        type: 'technique',
        title: 'How to Use IVT to Prove a Root Exists',
        body: '(1) Show $f$ is continuous on $[a, b]$ (polynomials, trig, exp, ln are continuous on their domains). (2) Compute $f(a)$ and $f(b)$. (3) Check they have opposite signs. (4) Conclude: $f(c) = 0$ for some $c \in (a, b)$.',
      },
      {
        type: 'intuition',
        title: 'The "No Teleportation" Principle',
        body: 'Continuity means the function has no "jumps" — you cannot get from $f(a)$ to $f(b)$ without passing through every value in between. The IVT is just the formal statement of this physical intuition.',
      },
      {
        type: 'misconception',
        title: 'IVT Proves Existence, Not Uniqueness',
        body: 'The IVT says at least one such $c$ exists. There may be many. For example, $f(x) = \\sin x$ takes every value in $[-1, 1]$ infinitely many times. The IVT only guarantees one — it cannot tell you how many.',
      },
      {
        type: 'tip',
        title: 'Bisection Method for Numerical Root Finding',
        body: 'After IVT guarantees a root in $[a, b]$: (1) Compute $m = (a+b)/2$. (2) Evaluate $f(m)$. (3) If $f(a)$ and $f(m)$ have opposite signs, root is in $[a, m]$; otherwise in $[m, b]$. (4) Repeat. Accuracy doubles each step.',
      },
      {
        type: 'real-world',
        title: 'IVT in Computer Science: Zero-Sum Games',
        body: 'In game theory, the minimax theorem (guaranteeing optimal strategies in two-player games) relies on IVT-like arguments. The Nash equilibrium proof uses Brouwer\'s Fixed Point Theorem, which is a generalization of IVT. These are the mathematical foundations of economics and AI game playing.',
      },
    ],
    visualizationId: 'BisectionMethod',
    visualizationProps: {},
    visualizations: [
                  {
        id: 'ContinuityViz',
        title: 'Continuity and the Intermediate Value Theorem',
        caption: 'A continuous function cannot jump over a horizontal line. Drag the target value $N$ and watch the theorem in action.',
      },
    ],
  },

  math: {
    prose: [
      '**Formal statement.** Let $f: [a,b] \\to \\mathbb{R}$ be continuous. Let $N$ be any real number with $f(a) < N < f(b)$ (or $f(b) < N < f(a)$). Then there exists $c \\in (a, b)$ such that $f(c) = N$.',

      '**The sign-change corollary (most useful form).** If $f$ is continuous on $[a, b]$ and $f(a) \\cdot f(b) < 0$ (they have opposite signs), then there exists $c \\in (a, b)$ with $f(c) = 0$.',

      '**Key applications.** (1) Every polynomial of odd degree has at least one real root. Proof: if $p(x) = a_n x^n + \\ldots + a_0$ with $n$ odd and $a_n > 0$, then $p(x) \\to +\\infty$ as $x \\to +\\infty$ and $p(x) \\to -\\infty$ as $x \\to -\\infty$. So $p(a) < 0$ and $p(b) > 0$ for some $a < b$. By IVT, $p(c) = 0$ for some $c \\in (a, b)$. (2) Fixed Point Theorem: if $f: [0,1] \\to [0,1]$ is continuous, then $f(c) = c$ for some $c$. Proof: let $g(x) = f(x) - x$. Then $g(0) = f(0) \\geq 0$ and $g(1) = f(1) - 1 \\leq 0$. By IVT, $g(c) = 0$, i.e., $f(c) = c$.',

      '**Bisection algorithm.** Input: continuous $f$, interval $[a_0, b_0]$ with $f(a_0)f(b_0) < 0$, tolerance $\\varepsilon > 0$. Set $n = 0$. While $(b_n - a_n)/2 > \\varepsilon$: compute $m_n = (a_n + b_n)/2$; if $f(m_n) = 0$, return $m_n$; if $f(a_n)f(m_n) < 0$, set $a_{n+1} = a_n$, $b_{n+1} = m_n$; else set $a_{n+1} = m_n$, $b_{n+1} = b_n$. Increment $n$. Return $m_n$. Error bound: after $n$ steps, $|c - m_n| \\leq (b_0 - a_0)/2^{n+1}$.',

      '**Comparison with Newton\'s method.** Bisection always converges (linear convergence, halves error each step) but is slow. Newton\'s method converges much faster (quadratic: error squares each step) but can fail if the initial guess is bad or $f\'$ is zero. Bisection is used when stability matters most; Newton\'s method when speed matters.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Fixed Point Theorem (Brouwer, 1-D)',
        body: 'If $f: [a,b] \\to [a,b]$ is continuous, then $f$ has a fixed point: $\\exists c \\in [a,b]$ such that $f(c) = c$. Proof: apply IVT to $g(x) = f(x) - x$.',
      },
      {
        type: 'theorem',
        title: 'Every Odd-Degree Polynomial Has a Real Root',
        body: 'If $p(x)$ is a polynomial of odd degree, then $p(c) = 0$ for some $c \\in \\mathbb{R}$. Proof: use the end behavior $p(x) \\to \\pm\\infty$ as $x \\to \\pm\\infty$ and apply IVT on a sufficiently large interval.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Proof of the IVT.** Assume $f(a) < N < f(b)$ (the case $f(b) < N < f(a)$ is symmetric). Define $S = \\{x \\in [a,b] : f(x) < N\\}$. The set $S$ is nonempty (since $a \\in S$) and bounded above (by $b$). Let $c = \\sup S$ — the least upper bound.',

      'We claim $f(c) = N$. Since $c = \\sup S$, there is a sequence $x_n \\in S$ with $x_n \\to c$. Since $f$ is continuous, $f(x_n) \\to f(c)$. Since $f(x_n) < N$ for all $n$, we get $f(c) \\leq N$. Similarly, if $f(c) < N$, then by continuity there exists $\\delta > 0$ with $f(x) < N$ for all $x \\in (c, c+\\delta)$, contradicting $c = \\sup S$. Therefore $f(c) = N$. Since $f(a) < N$ and $f(b) > N$, we have $a < c < b$, so $c \\in (a, b)$.',

      '**The key step.** This proof uses the Completeness Axiom of the real numbers: every nonempty set bounded above has a least upper bound. This is the foundational property that distinguishes $\\mathbb{R}$ from $\\mathbb{Q}$. The IVT is actually FALSE over the rationals! Consider $f(x) = x^2$ on $[0, 2]$: $f(0) = 0 < 2 < 4 = f(2)$, but there is no rational $c$ with $f(c) = 2$ (since $\\sqrt{2}$ is irrational). So the IVT is a theorem about the completeness of the real number system, not just continuity.',
    ],
    callouts: [
      {
        type: 'key-theorem',
        title: 'Why IVT Fails Over the Rationals',
        body: 'The IVT is fundamentally about the "no gaps" property of the real numbers. Over $\\mathbb{Q}$, $f(x) = x^2$ maps $[0,2] \\cap \\mathbb{Q}$ into $[0,4] \\cap \\mathbb{Q}$, but $\\sqrt{2} \\notin \\mathbb{Q}$ so there is a "gap" where $f(c) = 2$ should be. This shows IVT requires the completeness of $\\mathbb{R}$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch1-ivt-ex1',
      title: 'Show a Root Exists: x³ − x − 1 = 0',
      problem: 'Show that the equation $x^3 - x - 1 = 0$ has at least one real solution in the interval $(1, 2)$.',
      steps: [
        { expression: 'f(x) = x^3 - x - 1', annotation: 'Define f. It is a polynomial, so it is continuous everywhere — no need to verify continuity for polynomials.' },
        { expression: 'f(1) = 1 - 1 - 1 = -1', annotation: 'Evaluate at the left endpoint.' },
        { expression: 'f(2) = 8 - 2 - 1 = 5', annotation: 'Evaluate at the right endpoint.' },
        { expression: 'f(1) = -1 < 0 < 5 = f(2)', annotation: 'The function changes sign. Since 0 is between -1 and 5, and f is continuous on [1,2], the IVT guarantees a root.' },
        { expression: '\\therefore \\exists c \\in (1, 2) \\text{ with } f(c) = 0', annotation: 'The equation x³ − x − 1 = 0 has at least one solution between 1 and 2.' },
      ],
      conclusion: 'The IVT guarantees existence without finding the root. (The actual root is c ≈ 1.3247, called the "plastic constant.")',
    },
    {
      id: 'ch1-ivt-ex2',
      title: 'Two Applications in One Step',
      problem: 'Show that $\\cos x = x$ has a solution in $(0, \\pi/2)$.',
      steps: [
        { expression: 'g(x) = \\cos x - x', annotation: 'Reformulate: we need g(x) = 0. The function g is continuous (difference of continuous functions).' },
        { expression: 'g(0) = \\cos 0 - 0 = 1 - 0 = 1 > 0', annotation: 'At x = 0: cos(0) = 1, so g is positive.' },
        { expression: 'g(\\pi/2) = \\cos(\\pi/2) - \\pi/2 = 0 - \\pi/2 \\approx -1.57 < 0', annotation: 'At x = π/2: cos(π/2) = 0, which is less than π/2 ≈ 1.57.' },
        { expression: 'g(0) > 0 > g(\\pi/2)', annotation: 'g changes sign, so by IVT there exists c ∈ (0, π/2) with g(c) = 0, i.e., cos(c) = c.' },
      ],
      conclusion: 'The fixed point equation cos(x) = x has a solution ≈ 0.7391 (called the Dottie number). This is also a fixed-point theorem application.',
    },
    {
      id: 'ch1-ivt-ex3',
      title: 'Bisection Method: Three Iterations',
      problem: 'Use bisection to localize the root of $f(x) = x^3 - 2$ in $[1, 2]$ to within 0.125.',
      steps: [
        { expression: 'f(1) = -1 < 0, \\quad f(2) = 6 > 0', annotation: 'Root is in [1, 2]. Interval width = 1.' },
        { expression: 'm_1 = 1.5, \\quad f(1.5) = 1.375 > 0', annotation: 'f(1.5) > 0, so root is in [1, 1.5]. Width = 0.5.' },
        { expression: 'm_2 = 1.25, \\quad f(1.25) = -0.047 < 0', annotation: 'f(1.25) < 0, so root is in [1.25, 1.5]. Width = 0.25.' },
        { expression: 'm_3 = 1.375, \\quad f(1.375) = 0.600 > 0', annotation: 'f(1.375) > 0, so root is in [1.25, 1.375]. Width = 0.125.' },
        { expression: '\\therefore c \\approx 1.3125 \\pm 0.0625', annotation: 'After 3 steps, we know the root (which is ∛2 ≈ 1.2599) is in [1.25, 1.375].' },
      ],
      conclusion: '3 bisection steps reduced the interval from width 1 to width 0.125. After n steps, width = 1/2ⁿ. To get 6 decimal places, we need about n = 20 steps.',
    },
    {
      id: 'ch1-ivt-ex4',
      title: 'Fixed Point Theorem Application',
      problem: 'Show that $f(x) = \\frac{1}{x+1}$ has a fixed point in $[0, 1]$ (i.e., $f(c) = c$ for some $c \\in [0,1]$).',
      steps: [
        { expression: 'g(x) = f(x) - x = \\frac{1}{x+1} - x', annotation: 'Define g(x) = f(x) − x. A fixed point of f is a zero of g.' },
        { expression: 'g(0) = \\frac{1}{1} - 0 = 1 > 0', annotation: 'At x = 0: f(0) = 1 > 0.' },
        { expression: 'g(1) = \\frac{1}{2} - 1 = -\\frac{1}{2} < 0', annotation: 'At x = 1: f(1) = 1/2 < 1.' },
        { expression: 'g \\text{ is continuous on } [0,1] \\text{ (denominator } x+1 \\neq 0)', annotation: 'No discontinuities since x+1 ≥ 1 > 0 on [0,1].' },
        { expression: '\\therefore \\exists c \\in (0,1): g(c) = 0 \\Rightarrow f(c) = c', annotation: 'IVT guarantees a fixed point. (c = (√5 − 1)/2 ≈ 0.618, the golden ratio!)' },
      ],
      conclusion: 'The fixed point of f(x) = 1/(x+1) on [0,1] is the golden ratio (√5−1)/2 ≈ 0.618, since φ satisfies 1/(φ+1) = φ ⟺ φ² + φ = 1.',
    },
    {
      id: 'ch1-ivt-ex5',
      title: 'IVT for a Temperature Problem',
      problem: 'A thermometer reads 68°F at noon and 85°F at 6pm. Assuming temperature changed continuously, prove it was exactly 75°F at some point between noon and 6pm.',
      steps: [
        { expression: 'T(t): \\text{temperature at time } t \\text{ (noon} = 0\\text{, 6pm} = 6\\text{)}.', annotation: 'Model temperature as a continuous function of time.' },
        { expression: 'T(0) = 68 \\quad \\text{and} \\quad T(6) = 85', annotation: 'Given values.' },
        { expression: '68 < 75 < 85', annotation: '75 lies strictly between T(0) and T(6).' },
        { expression: 'T \\text{ is continuous (physical temperature changes continuously)}', annotation: 'Continuity assumption: the physical world does not allow temperature to jump instantaneously.' },
        { expression: '\\therefore \\exists t^* \\in (0, 6) \\text{ with } T(t^*) = 75°F', annotation: 'By IVT, the temperature was exactly 75°F at some time between noon and 6pm.' },
      ],
      conclusion: 'The IVT applies to any quantity that changes continuously — temperature, pressure, stock prices (approximately), population size. The theorem formalizes "you have to pass through every intermediate value."',
    },
  ],

  challenges: [
    {
      id: 'ch1-ivt-c1',
      difficulty: 'medium',
      problem: 'Prove that for any continuous function $f: [0,1] \\to [0,1]$, there exists $c \\in [0,1]$ such that $f(c) = c$. (This is the 1D Brouwer Fixed Point Theorem.)',
      hint: 'Define $g(x) = f(x) - x$. Evaluate $g$ at the endpoints of $[0,1]$.',
      walkthrough: [
        { expression: 'g(x) = f(x) - x', annotation: 'Define g. We need to show g has a zero.' },
        { expression: 'g(0) = f(0) - 0 = f(0) \\geq 0', annotation: 'Since f maps [0,1] to [0,1], f(0) ≥ 0.' },
        { expression: 'g(1) = f(1) - 1 \\leq 0', annotation: 'Since f(1) ≤ 1 (f maps [0,1] to [0,1]).' },
        { expression: '\\text{Case 1: } g(0) = 0 \\Rightarrow f(0) = 0 \\checkmark', annotation: 'Fixed point found.' },
        { expression: '\\text{Case 2: } g(1) = 0 \\Rightarrow f(1) = 1 \\checkmark', annotation: 'Fixed point found.' },
        { expression: '\\text{Case 3: } g(0) > 0 > g(1) \\Rightarrow \\exists c \\in (0,1): g(c) = 0', annotation: 'By IVT (g is continuous as a composition/difference of continuous functions).' },
      ],
      answer: 'In all three cases, there exists a fixed point c ∈ [0,1] with f(c) = c. QED.',
    },
    {
      id: 'ch1-ivt-c2',
      difficulty: 'hard',
      problem: 'Show that at any given moment, there exist two antipodal points on Earth\'s equator with exactly the same temperature. (Borsuk-Ulam Theorem in 1D.)',
      hint: 'Let T(θ) be temperature at angle θ on the equator. Consider the function g(θ) = T(θ) - T(θ + π). What is g(0) + g(π)?',
      walkthrough: [
        { expression: 'T(\\theta): \\text{continuous temperature function on the equator.}', annotation: 'θ ranges from 0 to 2π.' },
        { expression: 'g(\\theta) = T(\\theta) - T(\\theta + \\pi)', annotation: 'g measures the temperature difference between antipodal points.' },
        { expression: 'g(0) = T(0) - T(\\pi)', annotation: 'Evaluate at θ = 0.' },
        { expression: 'g(\\pi) = T(\\pi) - T(2\\pi) = T(\\pi) - T(0) = -g(0)', annotation: 'Using T(2π) = T(0) (temperature is periodic, same point).' },
        { expression: 'g(0) \\cdot g(\\pi) = g(0) \\cdot (-g(0)) = -[g(0)]^2 \\leq 0', annotation: 'Either g(0) = 0 (antipodal match at θ=0) or g(0) and g(π) have opposite signs.' },
        { expression: '\\therefore \\exists \\theta^* \\in [0, \\pi]: g(\\theta^*) = 0', annotation: 'By IVT, there is an angle where the temperature difference is zero — antipodal equal temperatures.' },
      ],
      answer: 'By IVT applied to g(θ) = T(θ) − T(θ+π), there always exist antipodal points on the equator with the same temperature. This is the 1D Borsuk-Ulam theorem.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'continuity', label: 'Continuity', context: 'IVT requires continuity — understand what continuity means first.' },
    { lessonSlug: 'introduction', label: 'Introduction to Limits', context: 'Limits underpin the definition of continuity which underpins IVT.' },
    { lessonSlug: 'newtons-method', label: "Newton's Method", context: "Newton's method is a faster root-finding algorithm that also relies on continuity and differentiability." },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-3', 'solved-challenge-1'],

  quiz: [
    {
      id: 'ivt-q1',
      type: 'choice',
      text: 'The Intermediate Value Theorem requires which condition on $f$?',
      options: [
        'f is differentiable on $[a, b]$',
        'f is continuous on $[a, b]$',
        'f is increasing on $[a, b]$',
        'f is bounded on $(a, b)$',
      ],
      answer: 'f is continuous on $[a, b]$',
      hints: ['Think about what prevents the function from "teleporting" over a value.'],
      reviewSection: 'Intuition tab — core IVT conditions',
    },
    {
      id: 'ivt-q2',
      type: 'choice',
      text: 'The IVT guarantees the existence of $c$ in which interval?',
      options: ['$[a, b]$', '$(a, b)$', '$(-\\infty, \\infty)$', '$[a, b)$'],
      answer: '$(a, b)$',
      hints: ['The theorem says $c$ is strictly between $a$ and $b$.'],
      reviewSection: 'Math tab — formal statement of IVT',
    },
    {
      id: 'ivt-q3',
      type: 'input',
      text: 'Let $f(x) = x^3 - x - 1$. Compute $f(1)$.',
      answer: '-1',
      hints: ['Substitute $x = 1$: $1 - 1 - 1$.'],
      reviewSection: 'Examples tab — Example 1: showing a root exists',
    },
    {
      id: 'ivt-q4',
      type: 'input',
      text: 'Let $f(x) = x^3 - x - 1$. Compute $f(2)$.',
      answer: '5',
      hints: ['Substitute $x = 2$: $8 - 2 - 1$.'],
      reviewSection: 'Examples tab — Example 1: showing a root exists',
    },
    {
      id: 'ivt-q5',
      type: 'choice',
      text: 'You know $f(1) = -1$ and $f(2) = 5$ and $f$ is continuous on $[1, 2]$. What does the IVT let you conclude?',
      options: [
        'There is no root in $(1, 2)$',
        'There is exactly one root in $(1, 2)$',
        'There is at least one root in $(1, 2)$',
        'There is a root only at $x = 1.5$',
      ],
      answer: 'There is at least one root in $(1, 2)$',
      hints: ['IVT guarantees existence, not uniqueness.'],
      reviewSection: 'Intuition tab — IVT proves existence, not uniqueness',
    },
    {
      id: 'ivt-q6',
      type: 'input',
      text: 'For the bisection method on $[1, 2]$, what is the midpoint $m_1$?',
      answer: '1.5',
      hints: ['$m = (a + b) / 2$'],
      reviewSection: 'Intuition tab — bisection method',
    },
    {
      id: 'ivt-q7',
      type: 'input',
      text: 'Let $f(x) = x^3 - 2$. We know $f(1) = -1 < 0$ and $f(2) = 6 > 0$. After one bisection step, $m_1 = 1.5$ and $f(1.5) = 1.375 > 0$. The root is now confirmed in the interval $[1, c]$. What is $c$?',
      answer: '1.5',
      hints: ['Since $f(1) < 0$ and $f(1.5) > 0$, the root is in $[1, 1.5]$.'],
      reviewSection: 'Examples tab — Example 3: bisection method',
    },
    {
      id: 'ivt-q8',
      type: 'input',
      text: 'Temperature $T(t)$ is continuous, $T(0) = 68°F$, $T(6) = 85°F$. By IVT, the temperature was exactly $75°F$ at some time $t^*$ in which open interval? Enter the left endpoint.',
      answer: '0',
      hints: ['$t^*$ is strictly between the two given times.'],
      reviewSection: 'Examples tab — Example 5: temperature application',
    },
    {
      id: 'ivt-q9',
      type: 'input',
      text: 'To apply IVT to show $\\cos x = x$ has a solution in $(0, \\pi/2)$, define $g(x) = \\cos x - x$. Compute $g(0)$.',
      answer: '1',
      hints: ['$g(0) = \\cos(0) - 0 = 1 - 0$.'],
      reviewSection: 'Examples tab — Example 2: cos(x) = x',
    },
    {
      id: 'ivt-q10',
      type: 'choice',
      text: 'Why does the IVT fail over the rational numbers $\\mathbb{Q}$?',
      options: [
        'Rational functions are not continuous',
        'The rationals have gaps — they lack the completeness property of $\\mathbb{R}$',
        'The theorem only applies to polynomials',
        'Rational numbers are not ordered',
      ],
      answer: 'The rationals have gaps — they lack the completeness property of $\\mathbb{R}$',
      hints: ['Think about $f(x) = x^2$ trying to reach $\\sqrt{2}$ over the rationals.'],
      reviewSection: 'Rigor tab — why IVT requires completeness of $\\mathbb{R}$',
    },
  ],
}
