// FILE: src/content/chapter-5/02-convergence-tests.js
export default {
  id: 'ch5-002',
  slug: 'convergence-tests',
  chapter: 5,
  order: 2,
  title: 'Convergence Tests',
  subtitle: 'The complete toolkit for deciding whether an infinite series converges — the #1 Calc 2 exam topic',
  tags: ['convergence test', 'integral test', 'p-series', 'comparison', 'limit comparison', 'alternating', 'ratio test', 'root test', 'absolute convergence'],

  hook: {
    question: 'You face $\\sum_{n=1}^{\\infty} \\frac{n^2}{3^n}$ on an exam. The terms go to $0$, so the nth term test is useless. It is not geometric, not telescoping, and you cannot compute the partial sums. How do you decide? You need a convergence test — a theorem that compares your series to something simpler. By the end of this lesson, you will have eight tests and a strategy for choosing the right one every time.',
    realWorldContext: 'Convergence tests are the central computational skill of Calc 2 and appear on every exam. In applied mathematics, they determine whether numerical approximations are reliable: does a Fourier series converge to the function it represents? Does a perturbation expansion in quantum mechanics converge? In numerical computing, the ratio test determines how fast a power series converges, which dictates how many terms a computer needs for a given accuracy. The comparison tests are used in probability theory to determine whether expected values exist.',
    previewVisualizationId: null,
  },

  intuition: {
    prose: [
      'The Integral Test bridges series and integrals. If $f(x)$ is positive, continuous, and decreasing for $x \\ge 1$, and $a_n = f(n)$, then $\\sum_{n=1}^{\\infty} a_n$ and $\\int_1^{\\infty} f(x)\\,dx$ either both converge or both diverge. The idea: the sum $\\sum a_n$ is trapped between the left and right Riemann sums of $\\int f(x)\\,dx$. Since $f$ is decreasing, $\\int_1^{N+1} f(x)\\,dx \\le \\sum_{n=1}^{N} f(n) \\le f(1) + \\int_1^{N} f(x)\\,dx$. So the sum and integral have the same convergence behavior.',
      'The p-series test is the most important consequence of the integral test. $\\sum_{n=1}^{\\infty} 1/n^p$ converges if $p > 1$ and diverges if $p \\le 1$. Proof via integral test: $\\int_1^{\\infty} x^{-p}\\,dx = \\frac{x^{1-p}}{1-p}\\Big|_1^{\\infty}$. For $p > 1$, the exponent $1-p < 0$, so $x^{1-p} \\to 0$; integral converges. For $p < 1$, $x^{1-p} \\to \\infty$; integral diverges. For $p = 1$: harmonic series, diverges. The p-series is the yardstick against which all other series are measured.',
      'The Comparison Test (Direct Comparison): if $0 \\le a_n \\le b_n$ for all $n$, then (a) if $\\sum b_n$ converges, so does $\\sum a_n$, and (b) if $\\sum a_n$ diverges, so does $\\sum b_n$. Think of it as: a series smaller than a convergent series must converge; a series larger than a divergent series must diverge. The challenge is finding the right comparison series — usually a geometric series or p-series.',
      'The Limit Comparison Test is often easier than direct comparison. If $a_n, b_n > 0$ and $\\lim_{n\\to\\infty} a_n/b_n = L$ where $0 < L < \\infty$, then $\\sum a_n$ and $\\sum b_n$ either both converge or both diverge. The idea: for large $n$, $a_n \\approx L \\cdot b_n$, so the series behave identically. Use this when direct inequalities are hard to establish but the asymptotic behavior is clear. Typical: compare $\\sum \\frac{n}{n^3+1}$ to $\\sum 1/n^2$ (limit of ratio is $1$, both converge).',
      'The Alternating Series Test (Leibniz Test): if $\\{b_n\\}$ is decreasing, $b_n > 0$, and $b_n \\to 0$, then $\\sum_{n=1}^{\\infty}(-1)^{n+1}b_n$ converges. The partial sums oscillate with decreasing amplitude, squeezing toward the limit. Moreover, the error after $N$ terms is at most $b_{N+1}$ — the alternating series estimation theorem. Example: $\\sum (-1)^{n+1}/n = \\ln 2$ (conditionally convergent — converges but $\\sum 1/n$ diverges).',
      'Absolute vs. conditional convergence: $\\sum a_n$ converges absolutely if $\\sum |a_n|$ converges. If $\\sum a_n$ converges but $\\sum |a_n|$ diverges, the convergence is conditional. Key fact: absolute convergence implies convergence (since $|S_M - S_N| \\le \\sum_{n=N+1}^{M}|a_n|$), but not conversely. Absolutely convergent series can be rearranged freely; conditionally convergent series cannot (Riemann rearrangement theorem).',
      'The Ratio Test: let $L = \\lim_{n\\to\\infty} |a_{n+1}/a_n|$. If $L < 1$, the series converges absolutely. If $L > 1$ (or $L = \\infty$), it diverges. If $L = 1$, the test is inconclusive. The ratio test is ideal for series involving factorials, exponentials, or products. It detects "geometric-like" behavior: when the ratio of successive terms approaches a constant $r < 1$, the series behaves like a geometric series. Example: $\\sum n!/n^n$ — ratio $= (n/(n+1))^n \\cdot 1/(n+1) \\to e^{-1}/\\infty = 0 < 1$, converges.',
      'The Root Test: let $L = \\lim_{n\\to\\infty} |a_n|^{1/n}$. If $L < 1$, converges absolutely. If $L > 1$, diverges. If $L = 1$, inconclusive. The root test is stronger than the ratio test in theory (whenever ratio test gives an answer, root test gives the same; root test can sometimes decide when ratio test cannot). In practice, use the root test when $a_n$ has the form $(\\text{something})^n$. Example: $\\sum (n/(2n+1))^n$ — root $= n/(2n+1) \\to 1/2 < 1$, converges.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Which Test to Use: The Decision Flowchart',
        body: '(1) First: nth Term Test. If $a_n \\not\\to 0$, STOP — diverges. (2) Geometric series? Use the formula directly. (3) p-series? $\\sum 1/n^p$: converges iff $p>1$. (4) Alternating? Use AST if $|a_n|$ is decreasing to $0$. (5) Factorials or $n!$? Ratio test. (6) nth powers like $(\\cdot)^n$? Root test (or ratio). (7) Rational function of $n$? Limit comparison with p-series. (8) Can you bound $a_n$ against a known series? Direct comparison. (9) $f(n)$ with an elementary antiderivative? Integral test. (10) If all else fails, try limit comparison with your best guess for the dominant behavior.',
      },
      {
        type: 'warning',
        title: 'Ratio and Root Tests Are Inconclusive at L = 1',
        body: 'When the ratio or root test gives $L = 1$, the test says NOTHING. Both $\\sum 1/n$ (diverges) and $\\sum 1/n^2$ (converges) give $L = 1$ with both tests. You must use another test. This happens frequently with p-series and rational functions of $n$ — for those, use direct/limit comparison with a p-series instead.',
      },
      {
        type: 'theorem',
        title: 'Absolute Convergence Implies Convergence',
        body: 'If $\\sum |a_n|$ converges, then $\\sum a_n$ converges. The converse is false: $\\sum (-1)^{n+1}/n = \\ln 2$ converges, but $\\sum 1/n = \\infty$. This is conditional convergence.',
      },
      {
        type: 'misconception',
        title: 'The Comparison Test Requires the Right Direction',
        body: 'To prove convergence, you need $a_n \\le b_n$ where $\\sum b_n$ converges (bigger series converges $\\implies$ smaller one does too). To prove divergence, you need $a_n \\ge b_n$ where $\\sum b_n$ diverges. Comparing a series to something BIGGER that diverges proves nothing. Comparing to something SMALLER that converges proves nothing.',
      },
      {
        type: 'definition',
        title: 'Alternating Series Estimation Theorem',
        body: 'If $\\sum (-1)^{n+1}b_n$ satisfies the AST conditions, the error from using the $N$-term partial sum is $|S - S_N| \\le b_{N+1}$. The first omitted term bounds the error. This makes alternating series easy to approximate numerically.',
      },
    ],
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Integral Test: Comparing Series to Integrals',
        caption: 'The rectangles (heights $a_n = f(n)$) are compared to the area under $f(x)$. Left sum overestimates the integral; right sum underestimates. The series and integral converge or diverge together.',
      },
    ],
  },

  math: {
    prose: [
      'Integral Test: let $f$ be positive, continuous, and decreasing on $[1, \\infty)$, with $a_n = f(n)$. Then $\\sum_{n=1}^{\\infty} a_n$ converges if and only if $\\int_1^{\\infty} f(x)\\,dx$ converges. Moreover, $\\int_1^{\\infty} f(x)\\,dx \\le \\sum_{n=1}^{\\infty} a_n \\le a_1 + \\int_1^{\\infty} f(x)\\,dx$. The integral test also gives remainder estimates: $\\int_{N+1}^{\\infty} f(x)\\,dx \\le R_N = \\sum_{n=N+1}^{\\infty}a_n \\le \\int_N^{\\infty}f(x)\\,dx$.',
      'p-Series Test: $\\sum_{n=1}^{\\infty} \\frac{1}{n^p}$ converges if $p > 1$, diverges if $p \\le 1$. Proof: apply the integral test with $f(x) = x^{-p}$. For $p \\ne 1$: $\\int_1^{\\infty} x^{-p}\\,dx = \\lim_{b\\to\\infty}\\frac{x^{1-p}}{1-p}\\Big|_1^b$. This converges iff $1-p < 0$, i.e., $p > 1$. For $p = 1$: $\\int_1^{\\infty} 1/x\\,dx = \\ln x \\Big|_1^{\\infty} = \\infty$. Diverges.',
      'Direct Comparison Test: suppose $0 \\le a_n \\le b_n$ for all $n \\ge N_0$. (a) If $\\sum b_n$ converges, then $\\sum a_n$ converges. (b) If $\\sum a_n$ diverges, then $\\sum b_n$ diverges. Proof of (a): the partial sums $S_N = \\sum_{n=1}^{N}a_n$ are increasing (since $a_n \\ge 0$) and bounded above by $\\sum_{n=1}^{N}b_n \\le \\sum_{n=1}^{\\infty}b_n$. By the Monotone Convergence Theorem, $\\{S_N\\}$ converges.',
      'Limit Comparison Test: let $a_n, b_n > 0$ and $L = \\lim_{n\\to\\infty} a_n/b_n$. (i) If $0 < L < \\infty$, then $\\sum a_n$ and $\\sum b_n$ both converge or both diverge. (ii) If $L = 0$ and $\\sum b_n$ converges, then $\\sum a_n$ converges. (iii) If $L = \\infty$ and $\\sum b_n$ diverges, then $\\sum a_n$ diverges. Proof of (i): for $\\varepsilon = L/2 > 0$, $\\exists N$ such that $n > N \\implies L/2 < a_n/b_n < 3L/2$, so $(L/2)b_n < a_n < (3L/2)b_n$. Apply direct comparison in both directions.',
      'Alternating Series Test (Leibniz): if $b_n > 0$, $\\{b_n\\}$ is decreasing, and $\\lim b_n = 0$, then $\\sum_{n=1}^{\\infty}(-1)^{n+1}b_n$ converges. Proof: the even partial sums $S_{2N} = (b_1-b_2)+(b_3-b_4)+\\cdots+(b_{2N-1}-b_{2N})$ form an increasing sequence (each parenthesized pair is positive). Also $S_{2N} = b_1-(b_2-b_3)-(b_4-b_5)-\\cdots-b_{2N} \\le b_1$, so $S_{2N}$ is bounded above. By MCT, $S_{2N} \\to S$. The odd sums $S_{2N+1} = S_{2N}+b_{2N+1} \\to S+0 = S$. Both subsequences converge to $S$, so $S_n \\to S$.',
      'Ratio Test: let $L = \\lim_{n\\to\\infty}|a_{n+1}/a_n|$. If $L < 1$: choose $r$ with $L < r < 1$. For large $n$, $|a_{n+1}| < r|a_n|$, so $|a_n| < Cr^n$ for some $C$. By comparison with $\\sum Cr^n$ (geometric), $\\sum |a_n|$ converges. If $L > 1$: $|a_n| \\to \\infty$ eventually, so $a_n \\not\\to 0$; diverges by nth Term Test.',
      'Root Test: let $L = \\lim_{n\\to\\infty}|a_n|^{1/n}$. If $L < 1$: choose $r$ with $L < r < 1$. For large $n$, $|a_n| < r^n$. Converges by comparison with geometric series. If $L > 1$: $|a_n| > 1$ for infinitely many $n$, so $a_n \\not\\to 0$; diverges. The root test is at least as strong as the ratio test: whenever the ratio test is conclusive, the root test gives the same answer.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Integral Test',
        body: 'If $f$ is positive, continuous, and decreasing on $[1,\\infty)$ with $a_n = f(n)$, then $\\sum_{n=1}^{\\infty} a_n$ and $\\int_1^{\\infty} f(x)\\,dx$ both converge or both diverge.',
      },
      {
        type: 'theorem',
        title: 'Ratio Test',
        body: 'Let $L = \\lim_{n\\to\\infty}\\left|\\frac{a_{n+1}}{a_n}\\right|$. If $L < 1$: converges absolutely. If $L > 1$ or $L=\\infty$: diverges. If $L = 1$: inconclusive.',
      },
      {
        type: 'theorem',
        title: 'Alternating Series Test (Leibniz)',
        body: 'If $b_n > 0$, $b_n$ is decreasing, and $\\lim b_n = 0$, then $\\sum(-1)^{n+1}b_n$ converges. Error bound: $|S - S_N| \\le b_{N+1}$.',
      },
      {
        type: 'theorem',
        title: 'p-Series Test',
        body: '$\\sum_{n=1}^{\\infty} \\frac{1}{n^p}$ converges if $p > 1$ and diverges if $p \\le 1$. The boundary case $p = 1$ is the harmonic series (diverges).',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The integral test proof in detail: since $f$ is decreasing, $f(n+1) \\le f(x) \\le f(n)$ for $x \\in [n, n+1]$. Integrating: $f(n+1) \\le \\int_n^{n+1}f(x)\\,dx \\le f(n)$. Summing from $n=1$ to $N$: $\\sum_{n=2}^{N+1}f(n) \\le \\int_1^{N+1}f(x)\\,dx \\le \\sum_{n=1}^{N}f(n)$. If the integral converges, $\\sum_{n=2}^{\\infty}f(n) \\le \\int_1^{\\infty}f(x)\\,dx < \\infty$, so the series converges. If the integral diverges, $\\sum_{n=1}^{N}f(n) \\ge \\int_1^{N+1}f(x)\\,dx \\to \\infty$, so the series diverges.',
      'Conditional convergence is a subtle phenomenon. The alternating harmonic series $\\sum(-1)^{n+1}/n = 1 - 1/2 + 1/3 - 1/4 + \\cdots = \\ln 2$. But by Riemann\'s rearrangement theorem, there exists a permutation of the same terms that sums to any desired value, or diverges. This is possible because the positive terms $\\sum 1/(2n-1)$ and negative terms $\\sum -1/(2n)$ both diverge, allowing arbitrary manipulation. Absolute convergence prevents this: if $\\sum |a_n| < \\infty$, every rearrangement converges to the same sum.',
      'A comparison of test strengths: Root $\\ge$ Ratio $\\ge$ nth Term (in the sense that root test is conclusive whenever ratio test is, which is conclusive whenever nth term test is). However, the integral test, comparison tests, and alternating series test are independent — they handle cases where ratio/root give $L=1$. No single test handles all series; mastery requires knowing all tests and choosing wisely.',
      'The ratio and root tests are inconclusive for any series $\\sum a_n$ where $a_n$ is a rational function of $n$, because $|a_{n+1}/a_n| \\to 1$ and $|a_n|^{1/n} \\to 1$ for all polynomial/rational expressions. For such series, always use comparison or limit comparison with a p-series. The ratio test is designed for "exponential-type" series (those involving $r^n$, $n!$, $n^n$) where the ratio gives a clean answer.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'When Each Test Fails',
        body: 'Ratio/Root fail (give $L=1$) for all p-series and rational functions of $n$. Use limit comparison instead. The AST only applies to alternating series. The integral test requires an integrable $f$ — some $a_n$ do not come from nice functions. No single test is universal.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-002-ex1',
      title: 'Ratio Test: Σ n²/3ⁿ',
      problem: '\\text{Determine whether } \\sum_{n=1}^{\\infty} \\frac{n^2}{3^n} \\text{ converges or diverges.}',
      steps: [
        { expression: '\\frac{a_{n+1}}{a_n} = \\frac{(n+1)^2/3^{n+1}}{n^2/3^n} = \\frac{(n+1)^2}{n^2} \\cdot \\frac{1}{3}', annotation: 'Compute the ratio of consecutive terms.' },
        { expression: 'L = \\lim_{n\\to\\infty} \\frac{(n+1)^2}{3n^2} = \\frac{1}{3}', annotation: '$(n+1)^2/n^2 \\to 1$, so the ratio approaches $1/3$.' },
        { expression: 'L = 1/3 < 1 \\implies \\text{converges absolutely by Ratio Test.}', annotation: 'The $3^n$ in the denominator dominates $n^2$ in the numerator.' },
      ],
      conclusion: 'Converges by Ratio Test. The exponential $3^n$ grows much faster than the polynomial $n^2$, driving the ratio below $1$.',
    },
    {
      id: 'ch5-002-ex2',
      title: 'Limit Comparison: Σ n/(n³ + 1)',
      problem: '\\text{Determine whether } \\sum_{n=1}^{\\infty} \\frac{n}{n^3+1} \\text{ converges or diverges.}',
      steps: [
        { expression: '\\frac{n}{n^3+1} \\approx \\frac{n}{n^3} = \\frac{1}{n^2} \\text{ for large } n', annotation: 'Identify the dominant behavior: for large $n$, the $+1$ is negligible.' },
        { expression: '\\text{Compare with } b_n = 1/n^2. \\; \\lim_{n\\to\\infty} \\frac{a_n}{b_n} = \\lim \\frac{n/(n^3+1)}{1/n^2} = \\lim \\frac{n^3}{n^3+1} = 1', annotation: 'The limit is $1$, which is finite and positive.' },
        { expression: '\\sum 1/n^2 \\text{ converges (p-series, } p=2>1\\text{). By LCT, } \\sum \\frac{n}{n^3+1} \\text{ converges.}', annotation: 'Both series share the same convergence behavior.' },
      ],
      conclusion: 'Converges by Limit Comparison with $\\sum 1/n^2$. This is the standard approach for rational functions of $n$.',
    },
    {
      id: 'ch5-002-ex3',
      title: 'Alternating Series: Σ (-1)ⁿ⁺¹/√n',
      problem: '\\text{Determine whether } \\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{\\sqrt{n}} \\text{ converges. Absolutely or conditionally?}',
      steps: [
        { expression: 'b_n = 1/\\sqrt{n}. \\; b_n > 0, \\; b_{n+1} < b_n, \\; \\lim b_n = 0.', annotation: 'Check all three conditions of the AST: positive, decreasing, limit zero. All satisfied.' },
        { expression: '\\text{By AST, } \\sum (-1)^{n+1}/\\sqrt{n} \\text{ converges.}', annotation: 'The alternating series test guarantees convergence.' },
        { expression: '\\sum |a_n| = \\sum 1/\\sqrt{n} = \\sum 1/n^{1/2}. \\; p = 1/2 \\le 1 \\implies \\text{diverges.}', annotation: 'Check absolute convergence: the p-series with $p = 1/2$ diverges.' },
        { expression: '\\text{Conclusion: conditionally convergent.}', annotation: 'Converges, but not absolutely.' },
      ],
      conclusion: 'The series converges conditionally. The alternation is essential — without the sign changes, the series would diverge.',
    },
    {
      id: 'ch5-002-ex4',
      title: 'Integral Test: Σ 1/(n ln²n)',
      problem: '\\text{Determine whether } \\sum_{n=2}^{\\infty} \\frac{1}{n(\\ln n)^2} \\text{ converges.}',
      steps: [
        { expression: 'f(x) = \\frac{1}{x(\\ln x)^2} \\text{ is positive, continuous, and decreasing for } x \\ge 2.', annotation: 'Verify the hypotheses of the integral test.' },
        { expression: '\\int_2^{\\infty} \\frac{dx}{x(\\ln x)^2}. \\; \\text{Let } u = \\ln x, \\; du = dx/x.', annotation: 'Substitution transforms the integral.' },
        { expression: '= \\int_{\\ln 2}^{\\infty} u^{-2}\\,du = \\left[-\\frac{1}{u}\\right]_{\\ln 2}^{\\infty} = 0 + \\frac{1}{\\ln 2} = \\frac{1}{\\ln 2}', annotation: 'The integral converges (finite value).' },
        { expression: '\\text{By the Integral Test, } \\sum_{n=2}^{\\infty} \\frac{1}{n(\\ln n)^2} \\text{ converges.}', annotation: 'Integral converges implies series converges.' },
      ],
      conclusion: 'Converges by the Integral Test. Note: ratio and root tests would give $L = 1$ (inconclusive) here.',
    },
    {
      id: 'ch5-002-ex5',
      title: 'Root Test: Σ (2n/(3n+1))ⁿ',
      problem: '\\text{Determine whether } \\sum_{n=1}^{\\infty} \\left(\\frac{2n}{3n+1}\\right)^n \\text{ converges.}',
      steps: [
        { expression: '|a_n|^{1/n} = \\frac{2n}{3n+1}', annotation: 'The $n$-th root removes the $n$-th power.' },
        { expression: 'L = \\lim_{n\\to\\infty} \\frac{2n}{3n+1} = \\frac{2}{3}', annotation: 'Standard rational function limit.' },
        { expression: 'L = 2/3 < 1 \\implies \\text{converges absolutely by Root Test.}', annotation: 'The root test is ideal when $a_n$ has the form $(\\text{expression})^n$.' },
      ],
      conclusion: 'Converges by Root Test. The root test is the natural choice whenever the entire expression is raised to the $n$-th power.',
    },
  ],

  challenges: [
    {
      id: 'ch5-002-ch1',
      title: 'Choose the Right Test',
      problem: 'For each series, identify the best test and determine convergence: (a) $\\sum n!/10^n$ (b) $\\sum (-1)^n n/(n^2+1)$ (c) $\\sum 1/(n\\ln n)$.',
      hint: '(a) Factorials suggest ratio test. (b) Alternating, check AST. (c) Integral test with $u = \\ln x$.',
      walkthrough: [
        '(a) Ratio: $|a_{n+1}/a_n| = (n+1)/10 \\to \\infty > 1$. Diverges. Factorials grow faster than exponentials.',
        '(b) $b_n = n/(n^2+1)$, decreasing for large $n$, $\\lim b_n = 0$. AST applies: converges. Check absolute: $n/(n^2+1) \\sim 1/n$, $\\sum 1/n$ diverges. Conditionally convergent.',
        '(c) $f(x) = 1/(x\\ln x)$, positive/decreasing for $x \\ge 2$. $\\int_2^{\\infty} dx/(x\\ln x) = [\\ln(\\ln x)]_2^{\\infty} = \\infty$. Diverges by integral test. Compare: $\\sum 1/(n(\\ln n)^2)$ converges but $\\sum 1/(n\\ln n)$ diverges — the extra $\\ln n$ in the denominator makes the difference.',
      ],
    },
    {
      id: 'ch5-002-ch2',
      title: 'Tricky Comparison',
      problem: 'Determine convergence of $\\sum_{n=2}^{\\infty} \\frac{1}{n^2 - n}$.',
      hint: 'Try partial fractions or comparison with a p-series.',
      walkthrough: [
        '$\\frac{1}{n^2-n} = \\frac{1}{n(n-1)} = \\frac{1}{n-1} - \\frac{1}{n}$ (partial fractions).',
        'Telescoping: $S_N = 1 - 1/N \\to 1$. Converges to $1$.',
        'Alternatively: $1/(n^2-n) < 2/n^2$ for $n \\ge 2$ (since $n^2-n > n^2/2$). $\\sum 2/n^2$ converges (p-series $p=2$), so $\\sum 1/(n^2-n)$ converges by comparison.',
        'Both methods work; telescoping gives the exact sum.',
      ],
    },
    {
      id: 'ch5-002-ch3',
      title: 'Ratio Test Boundary Case',
      problem: 'Show that the ratio test is inconclusive for $\\sum 1/n^2$ and for $\\sum 1/n$, even though one converges and one diverges.',
      hint: 'Compute the ratio $a_{n+1}/a_n$ for each and show both limits equal $1$.',
      walkthrough: [
        'For $\\sum 1/n^2$: $a_{n+1}/a_n = n^2/(n+1)^2 = (n/(n+1))^2 \\to 1$.',
        'For $\\sum 1/n$: $a_{n+1}/a_n = n/(n+1) \\to 1$.',
        'Both give $L = 1$: ratio test is inconclusive for both.',
        'Yet $\\sum 1/n^2 = \\pi^2/6$ (converges) and $\\sum 1/n = \\infty$ (diverges).',
        'Lesson: the ratio test cannot distinguish polynomial decay rates. Use comparison or integral test for such series.',
      ],
    },
  ],

  crossRefs: [
    { lessonId: 'ch5-001', text: 'Series fundamentals — geometric, telescoping, nth term test' },
    { lessonId: 'ch5-003', text: 'Power series — convergence tests determine the radius of convergence' },
    { lessonId: 'ch4-005', text: 'Improper integrals — the integral test connects series to integrals' },
  ],

  checkpoints: [
    { id: 'ch5-002-cp1', prompt: 'State the p-series test.', expectedInsight: '$\\sum 1/n^p$ converges if $p > 1$, diverges if $p \\le 1$.' },
    { id: 'ch5-002-cp2', prompt: 'When should you use the ratio test vs. limit comparison?', expectedInsight: 'Ratio test for series with factorials, exponentials, or $n^n$. Limit comparison for rational functions of $n$ (where ratio test gives $L=1$).' },
    { id: 'ch5-002-cp3', prompt: 'What is the difference between absolute and conditional convergence?', expectedInsight: 'Absolute: $\\sum |a_n|$ converges. Conditional: $\\sum a_n$ converges but $\\sum |a_n|$ diverges. Absolute convergence is stronger and allows rearrangement.' },
    { id: 'ch5-002-cp4', prompt: 'State the Alternating Series Estimation Theorem.', expectedInsight: 'For a convergent alternating series satisfying AST conditions, the error after $N$ terms is at most $b_{N+1}$ (the first omitted term).' },
  ],
}
