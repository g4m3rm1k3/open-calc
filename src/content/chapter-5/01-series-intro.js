// FILE: src/content/chapter-5/01-series-intro.js
export default {
  id: 'ch5-001',
  slug: 'series-intro',
  chapter: 5,
  order: 1,
  title: 'Infinite Series',
  subtitle: 'Adding infinitely many numbers — when it makes sense and when it does not',
  tags: ['series', 'infinite series', 'geometric', 'harmonic', 'partial sums', 'telescoping', 'nth term test', 'Zeno'],

  hook: {
    question: 'You stand 1 meter from a wall. You step halfway (1/2 m), then half of the remaining distance (1/4 m), then half again (1/8 m), and so on forever. Do you ever reach the wall? Mathematically: does $1/2 + 1/4 + 1/8 + \\cdots = 1$? Can adding infinitely many positive numbers give a finite answer?',
    realWorldContext: 'Infinite series are everywhere in applied mathematics. The present value of a perpetual bond paying $\\$C$ per year at interest rate $r$ is the geometric series $C/r$. Signal processing decomposes sounds into Fourier series — infinite sums of sines and cosines. Every decimal expansion is a series: $\\pi = 3 + 1/10 + 4/100 + 1/1000 + \\cdots$. Computer graphics engines sum power series to compute trigonometric functions millions of times per second. Understanding which sums converge — and to what — is the gateway to all of Calc 2.',
    previewVisualizationId: 'ConvergenceViz',
  },

  intuition: {
    prose: [
      'An infinite series $\\sum_{n=1}^{\\infty} a_n = a_1 + a_2 + a_3 + \\cdots$ is defined via its partial sums. The $N$-th partial sum is $S_N = a_1 + a_2 + \\cdots + a_N = \\sum_{n=1}^{N} a_n$. We say the series converges to $S$ if $\\lim_{N\\to\\infty} S_N = S$, and we write $\\sum_{n=1}^{\\infty} a_n = S$. If the limit does not exist, the series diverges. So an infinite series is really a sequence — the sequence of partial sums — and all our sequence tools apply.',
      'The geometric series $\\sum_{n=0}^{\\infty} r^n = 1 + r + r^2 + \\cdots$ is the most important series in mathematics. Its partial sum is $S_N = \\frac{1 - r^{N+1}}{1 - r}$ (multiply both sides by $1-r$ and telescopes cancel). If $|r| < 1$, then $r^{N+1} \\to 0$, so $S = 1/(1-r)$. If $|r| \\ge 1$, the series diverges. More generally, $\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}$ for $|r| < 1$. This formula appears in finance (annuities, bond pricing), probability (geometric distributions), and physics (repeated reflections, decay processes).',
      'Zeno\'s paradox is resolved by the geometric series. The distances $1/2, 1/4, 1/8, \\ldots$ form the series $\\sum_{n=1}^{\\infty} (1/2)^n = 1/2 + 1/4 + 1/8 + \\cdots = \\frac{1/2}{1 - 1/2} = 1$. You do reach the wall. The infinitely many steps take infinitely many time intervals that also sum to a finite total. Zeno\'s error was assuming that infinitely many positive durations must sum to infinity — the geometric series shows this is false.',
      'A telescoping series is one where most terms cancel. Example: $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)} = \\sum_{n=1}^{\\infty} \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right)$. The partial sum is $S_N = (1 - 1/2) + (1/2 - 1/3) + \\cdots + (1/N - 1/(N+1)) = 1 - 1/(N+1)$. As $N \\to \\infty$, $S_N \\to 1$. The key is the partial fraction decomposition that reveals the telescoping structure.',
      'The harmonic series $\\sum_{n=1}^{\\infty} 1/n = 1 + 1/2 + 1/3 + 1/4 + \\cdots$ diverges, even though its terms go to zero. This is one of the most important facts in all of calculus. Proof (Oresme, ~1350): group terms: $1 + 1/2 + (1/3+1/4) + (1/5+1/6+1/7+1/8) + \\cdots > 1 + 1/2 + 1/2 + 1/2 + \\cdots = \\infty$. Each group of $2^k$ terms sums to more than $1/2$, so the partial sums grow without bound. The harmonic series diverges incredibly slowly — you need about $e^{23}$ terms (over 10 billion) to exceed a partial sum of $23$ — but diverge it does.',
      'The nth Term Test (Divergence Test) states: if $\\lim_{n\\to\\infty} a_n \\ne 0$ (or does not exist), then $\\sum a_n$ diverges. Contrapositive: if $\\sum a_n$ converges, then $a_n \\to 0$. WARNING: the converse is false! $a_n \\to 0$ does NOT imply $\\sum a_n$ converges. The harmonic series is the classic counterexample: $1/n \\to 0$ but $\\sum 1/n = \\infty$. The nth Term Test can only prove divergence, never convergence.',
      'Series vs. sequence: a sequence $\\{a_n\\}$ is a list of numbers; a series $\\sum a_n$ is the sum of a sequence. The sequence $\\{1/n\\}$ converges (to $0$), but the series $\\sum 1/n$ diverges (to $\\infty$). The sequence $\\{1/n^2\\}$ converges (to $0$) and the series $\\sum 1/n^2$ also converges (to $\\pi^2/6$ — proved by Euler in 1735). Whether a series converges depends on how fast the terms shrink, not merely whether they shrink.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Convergence of an Infinite Series',
        body: '$\\sum_{n=1}^{\\infty} a_n = S$ means $\\lim_{N\\to\\infty} S_N = S$ where $S_N = \\sum_{n=1}^{N} a_n$ is the $N$-th partial sum. If the limit does not exist (finite), the series diverges.',
      },
      {
        type: 'theorem',
        title: 'Geometric Series Formula',
        body: '$\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}$ for $|r| < 1$. Diverges for $|r| \\ge 1$. This is the single most-used series formula in all of mathematics.',
      },
      {
        type: 'warning',
        title: 'The nth Term Test Only Proves Divergence',
        body: 'If $\\lim a_n \\ne 0$, then $\\sum a_n$ diverges. But if $\\lim a_n = 0$, you know NOTHING — the series might converge or diverge. The harmonic series ($a_n = 1/n \\to 0$, series diverges) proves the converse is false. Never write "by the nth term test, the series converges."',
      },
      {
        type: 'misconception',
        title: 'The Harmonic Series Diverges (Despite Terms → 0)',
        body: '$\\sum 1/n = \\infty$. Students often assume that since $1/n \\to 0$, the series should converge. It does not. The terms shrink too slowly. Compare: $\\sum 1/n^2$ converges because $1/n^2$ shrinks fast enough. The boundary between convergence and divergence for $\\sum 1/n^p$ is exactly $p = 1$.',
      },
      {
        type: 'history',
        title: 'Zeno\'s Paradox (5th Century BCE)',
        body: 'Zeno of Elea argued that motion is impossible: to walk from A to B, you must first cover half the distance, then half the remainder, then half again — infinitely many steps. The resolution: $\\sum_{n=1}^{\\infty} (1/2)^n = 1$. The infinite sum is finite. Zeno\'s paradox anticipated the need for a rigorous theory of infinite series by over 2000 years.',
      },
    ],
    visualizationId: 'ConvergenceViz',
    visualizationProps: {},
    visualizations: [
      {
        id: 'FunctionPlotter',
        title: 'Partial Sums of the Geometric and Harmonic Series',
        caption: 'Compare the partial sums $S_N$ of $\\sum (1/2)^n$ (converges rapidly to $1$) and $\\sum 1/n$ (diverges, growing like $\\ln N$). The geometric partial sums level off; the harmonic partial sums keep climbing.',
      },
    ],
  },

  math: {
    prose: [
      'Geometric series derivation: let $S_N = \\sum_{n=0}^{N} ar^n = a + ar + ar^2 + \\cdots + ar^N$. Multiply by $r$: $rS_N = ar + ar^2 + \\cdots + ar^{N+1}$. Subtract: $S_N - rS_N = a - ar^{N+1}$, so $S_N(1-r) = a(1-r^{N+1})$, giving $S_N = \\frac{a(1-r^{N+1})}{1-r}$ for $r \\ne 1$. If $|r| < 1$, then $r^{N+1} \\to 0$, so $\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}$.',
      'Telescoping series: $\\sum_{n=1}^{\\infty}(b_n - b_{n+1})$ has partial sum $S_N = b_1 - b_{N+1}$. Converges if and only if $\\lim b_n$ exists, with sum $b_1 - \\lim_{n\\to\\infty} b_n$. Example: $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)} = \\sum (1/n - 1/(n+1))$. Here $b_n = 1/n$, $\\lim b_n = 0$, so sum $= 1 - 0 = 1$.',
      'Proof that the harmonic series diverges (integral test preview): $\\sum_{n=1}^{N} 1/n > \\int_1^{N+1} \\frac{dx}{x} = \\ln(N+1) \\to \\infty$. This bound follows from the left-endpoint Riemann sum interpretation: each rectangle of height $1/n$ and width $1$ lies above the curve $y = 1/x$ on $[n, n+1]$. So the partial sums grow at least as fast as $\\ln N$.',
      'The nth Term Test: if $\\sum_{n=1}^{\\infty} a_n$ converges to $S$, then $a_n = S_n - S_{n-1} \\to S - S = 0$. Contrapositive: if $a_n \\not\\to 0$, the series diverges. This is the simplest and often first test to apply. Example: $\\sum_{n=1}^{\\infty} \\frac{n}{n+1}$ diverges because $\\frac{n}{n+1} \\to 1 \\ne 0$.',
      'Linearity of convergent series: if $\\sum a_n = A$ and $\\sum b_n = B$, then $\\sum(ca_n + db_n) = cA + dB$. Also, convergence is not affected by adding or removing finitely many terms (though the sum value changes). This means convergence is a "tail property" — it depends only on the behavior of $a_n$ for large $n$.',
      'Present value application: a perpetuity pays $\\$C$ per year forever. At discount rate $r$ per year, the present value of the payment at year $n$ is $C/(1+r)^n$. Total present value: $\\sum_{n=1}^{\\infty} \\frac{C}{(1+r)^n} = \\frac{C/(1+r)}{1 - 1/(1+r)} = \\frac{C}{r}$. A perpetuity paying $\\$100$/year at $5\\%$ is worth $\\$2000$ today.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'nth Term Test (Divergence Test)',
        body: 'If $\\lim_{n\\to\\infty} a_n \\ne 0$ (or does not exist), then $\\sum_{n=1}^{\\infty} a_n$ diverges. The converse is FALSE: $a_n \\to 0$ does not guarantee convergence.',
      },
      {
        type: 'theorem',
        title: 'Telescoping Series',
        body: '$\\sum_{n=1}^{\\infty}(b_n - b_{n+1}) = b_1 - \\lim_{n\\to\\infty} b_n$, provided the limit exists. If $\\lim b_n$ does not exist, the series diverges.',
      },
      {
        type: 'definition',
        title: 'Partial Sum',
        body: 'The $N$-th partial sum of $\\sum a_n$ is $S_N = a_1 + a_2 + \\cdots + a_N$. The series converges if and only if the sequence $\\{S_N\\}$ converges.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The Cauchy criterion for series: $\\sum a_n$ converges if and only if for every $\\varepsilon > 0$ there exists $N$ such that $|a_{m+1} + a_{m+2} + \\cdots + a_n| < \\varepsilon$ for all $n > m > N$. This is the Cauchy criterion for the sequence of partial sums. It is useful because it does not require knowing the limit $S$.',
      'Rearrangement theorem (Riemann): if $\\sum a_n$ is conditionally convergent (converges but $\\sum |a_n|$ diverges), then for any real number $L$ (or $\\pm\\infty$), there exists a rearrangement of the series that converges to $L$. This shocking result means that the sum of a conditionally convergent series depends on the order of summation. Only absolutely convergent series can be freely rearranged.',
      'Convergence of $\\sum a_n$ implies $a_n \\to 0$ (nth Term Test). Proof: $a_n = S_n - S_{n-1}$. If $S_n \\to S$, then $a_n = S_n - S_{n-1} \\to S - S = 0$. The converse fails because $a_n \\to 0$ does not control the rate of decay. The harmonic series shows that $O(1/n)$ decay is not fast enough; $O(1/n^p)$ for $p > 1$ is sufficient (p-series test, next lesson).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Riemann Rearrangement Theorem',
        body: 'If $\\sum a_n$ converges conditionally, its terms can be rearranged to converge to any prescribed value, or to diverge. Absolute convergence is required for rearrangement invariance.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-001-ex1',
      title: 'Geometric Series: Sum of (2/3)^n',
      problem: '\\text{Find } \\sum_{n=0}^{\\infty} \\left(\\frac{2}{3}\\right)^n.',
      steps: [
        { expression: '\\text{This is a geometric series with } a = 1, \\; r = 2/3.', annotation: 'Identify $a$ (first term) and $r$ (common ratio). Here $|r| = 2/3 < 1$, so the series converges.' },
        { expression: '\\sum_{n=0}^{\\infty} \\left(\\frac{2}{3}\\right)^n = \\frac{1}{1 - 2/3} = \\frac{1}{1/3} = 3', annotation: 'Apply the formula $a/(1-r)$.' },
      ],
      conclusion: '$\\sum_{n=0}^{\\infty} (2/3)^n = 3$. The partial sums $1, 5/3, 19/9, \\ldots$ approach $3$.',
    },
    {
      id: 'ch5-001-ex2',
      title: 'Geometric Series Starting at n = 1',
      problem: '\\text{Find } \\sum_{n=1}^{\\infty} \\frac{3}{4^n}.',
      steps: [
        { expression: '\\sum_{n=1}^{\\infty} \\frac{3}{4^n} = 3\\sum_{n=1}^{\\infty}\\left(\\frac{1}{4}\\right)^n = 3\\left[\\sum_{n=0}^{\\infty}\\left(\\frac{1}{4}\\right)^n - 1\\right]', annotation: 'Factor out $3$, adjust the starting index by subtracting the $n=0$ term.' },
        { expression: '= 3\\left[\\frac{1}{1-1/4} - 1\\right] = 3\\left[\\frac{4}{3} - 1\\right] = 3 \\cdot \\frac{1}{3} = 1', annotation: 'Geometric sum with $r=1/4$, then subtract $1$.' },
      ],
      conclusion: '$\\sum_{n=1}^{\\infty} 3/4^n = 1$. Alternatively, use $a = 3/4$ and $r = 1/4$: $\\frac{3/4}{1-1/4} = \\frac{3/4}{3/4} = 1$.',
    },
    {
      id: 'ch5-001-ex3',
      title: 'Telescoping: Σ 1/(n² + n)',
      problem: '\\text{Find } \\sum_{n=1}^{\\infty} \\frac{1}{n^2+n}.',
      steps: [
        { expression: '\\frac{1}{n^2+n} = \\frac{1}{n(n+1)} = \\frac{1}{n} - \\frac{1}{n+1}', annotation: 'Partial fraction decomposition reveals telescoping structure.' },
        { expression: 'S_N = \\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2}-\\frac{1}{3}\\right) + \\cdots + \\left(\\frac{1}{N}-\\frac{1}{N+1}\\right) = 1 - \\frac{1}{N+1}', annotation: 'Adjacent terms cancel, leaving only the first and last.' },
        { expression: '\\lim_{N\\to\\infty} S_N = 1 - 0 = 1', annotation: '$1/(N+1) \\to 0$ as $N \\to \\infty$.' },
      ],
      conclusion: '$\\sum_{n=1}^{\\infty} 1/(n^2+n) = 1$. Telescoping series require recognizing the partial fraction decomposition.',
    },
    {
      id: 'ch5-001-ex4',
      title: 'Divergence by nth Term Test',
      problem: '\\text{Does } \\sum_{n=1}^{\\infty} \\frac{n^2}{2n^2+1} \\text{ converge?}',
      steps: [
        { expression: '\\lim_{n\\to\\infty} \\frac{n^2}{2n^2+1} = \\lim_{n\\to\\infty}\\frac{1}{2+1/n^2} = \\frac{1}{2} \\ne 0', annotation: 'The terms approach $1/2$, not $0$.' },
        { expression: '\\text{By the nth Term Test, the series diverges.}', annotation: 'Since $a_n \\not\\to 0$, the series cannot converge.' },
      ],
      conclusion: 'The series diverges. The nth Term Test is always the first test to check — it is quick and catches many divergent series.',
    },
    {
      id: 'ch5-001-ex5',
      title: 'Present Value of a Perpetuity',
      problem: '\\text{A bond pays } \\$50 \\text{ per year forever. If the annual discount rate is } 4\\%, \\text{ find the present value.}',
      steps: [
        { expression: 'PV = \\sum_{n=1}^{\\infty} \\frac{50}{(1.04)^n} = 50 \\sum_{n=1}^{\\infty}\\left(\\frac{1}{1.04}\\right)^n', annotation: 'Each payment of $\\$50$ at year $n$ has present value $50/(1.04)^n$.' },
        { expression: '= 50 \\cdot \\frac{1/1.04}{1 - 1/1.04} = 50 \\cdot \\frac{1/1.04}{0.04/1.04} = 50 \\cdot \\frac{1}{0.04} = 1250', annotation: 'Geometric series with $r = 1/1.04 < 1$.' },
      ],
      conclusion: 'The present value is $\\$1250$. The general formula: a perpetuity paying $\\$C$/year at rate $r$ has present value $C/r$. This is the geometric series formula applied to finance.',
    },
  ],

  challenges: [
    {
      id: 'ch5-001-ch1',
      title: 'A Non-Obvious Telescoping Series',
      problem: 'Find $\\sum_{n=1}^{\\infty} \\ln\\left(\\frac{n+1}{n}\\right)$.',
      hint: 'Write out the partial sum and use properties of logarithms.',
      walkthrough: [
        '$S_N = \\sum_{n=1}^{N}\\ln\\frac{n+1}{n} = \\sum_{n=1}^{N}[\\ln(n+1)-\\ln(n)]$.',
        'This telescopes: $S_N = \\ln(N+1) - \\ln(1) = \\ln(N+1)$.',
        '$\\lim_{N\\to\\infty} \\ln(N+1) = \\infty$.',
        'The series diverges! Even though each term $\\ln(1+1/n) \\to 0$, the partial sums grow like $\\ln N$. This is essentially the harmonic series in disguise (since $\\ln(1+1/n) \\approx 1/n$).',
      ],
    },
    {
      id: 'ch5-001-ch2',
      title: 'Repeating Decimal as Geometric Series',
      problem: 'Express $0.\\overline{142857}$ as a fraction using geometric series.',
      hint: 'Write $0.142857142857\\ldots = 142857/10^6 + 142857/10^{12} + \\cdots$.',
      walkthrough: [
        '$0.\\overline{142857} = \\frac{142857}{10^6} + \\frac{142857}{10^{12}} + \\frac{142857}{10^{18}} + \\cdots$',
        'Geometric series with $a = 142857/10^6$ and $r = 1/10^6$.',
        '$= \\frac{142857/10^6}{1 - 1/10^6} = \\frac{142857}{999999}$.',
        '$142857 \\times 7 = 999999$, so $142857/999999 = 1/7$.',
        'Every repeating decimal is a rational number, proved by the geometric series formula.',
      ],
    },
    {
      id: 'ch5-001-ch3',
      title: 'Partial Fractions and Double Telescoping',
      problem: 'Find $\\sum_{n=1}^{\\infty} \\frac{1}{n(n+1)(n+2)}$.',
      hint: 'Use partial fractions: $\\frac{1}{n(n+1)(n+2)} = \\frac{1}{2}\\left(\\frac{1}{n(n+1)} - \\frac{1}{(n+1)(n+2)}\\right)$.',
      walkthrough: [
        'Partial fractions: $\\frac{1}{n(n+1)(n+2)} = \\frac{A}{n}+\\frac{B}{n+1}+\\frac{C}{n+2}$. Solving: $A=1/2, B=-1, C=1/2$.',
        'Regroup: $= \\frac{1}{2}\\left(\\frac{1}{n} - \\frac{2}{n+1} + \\frac{1}{n+2}\\right) = \\frac{1}{2}\\left(\\frac{1}{n(n+1)} - \\frac{1}{(n+1)(n+2)}\\right)$.',
        'This telescopes! $S_N = \\frac{1}{2}\\left(\\frac{1}{1\\cdot 2} - \\frac{1}{(N+1)(N+2)}\\right)$.',
        '$\\lim_{N\\to\\infty} S_N = \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$.',
      ],
    },
  ],

  crossRefs: [
    { lessonSlug: 'sequences', label: 'Sequences', context: 'Series are limits of partial sums built from sequence terms.' },
    { lessonSlug: 'convergence-tests', label: 'Convergence Tests', context: 'Use formal tests when geometric or telescoping structure is not obvious.' },
    { lessonSlug: 'power-series', label: 'Power Series', context: 'Power series are infinite sums with variable terms and a convergence interval.' },
  ],

  checkpoints: [
    { id: 'ch5-001-cp1', prompt: 'State the geometric series formula and its condition for convergence.', expectedInsight: '$\\sum_{n=0}^{\\infty} ar^n = a/(1-r)$ when $|r| < 1$. Diverges when $|r| \\ge 1$.' },
    { id: 'ch5-001-cp2', prompt: 'Does the nth Term Test prove convergence or divergence?', expectedInsight: 'Only divergence. If $a_n \\not\\to 0$, the series diverges. But $a_n \\to 0$ does NOT imply convergence (harmonic series is the counterexample).' },
    { id: 'ch5-001-cp3', prompt: 'Why does the harmonic series diverge even though $1/n \\to 0$?', expectedInsight: 'The terms shrink too slowly. Grouping terms in blocks of $2^k$ shows each block sums to at least $1/2$, so the partial sums grow without bound (at least as fast as $\\ln N$).' },
  ],
}
