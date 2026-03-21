// FILE: src/content/chapter-5/03-power-series.js
export default {
  id: 'ch5-003',
  slug: 'power-series',
  chapter: 5,
  order: 3,
  title: 'Power Series',
  subtitle: 'Infinite polynomials that represent functions — the key to Taylor series and beyond',
  tags: ['power series', 'radius of convergence', 'interval of convergence', 'term by term', 'representation'],

  hook: {
    question: 'You know that $1 + x + x^2 + x^3 + \\cdots = 1/(1-x)$ for $|x| < 1$. What if you differentiate both sides? You get $1 + 2x + 3x^2 + \\cdots = 1/(1-x)^2$. Integrate both sides? $x + x^2/2 + x^3/3 + \\cdots = -\\ln(1-x)$. Is this legitimate — can you really differentiate and integrate infinite series term by term? And for which values of $x$ does this work?',
    realWorldContext: 'Power series are the bridge between abstract functions and computation. When your calculator evaluates $\\sin(0.5)$, it computes a polynomial approximation derived from a power series. Physics uses power series to solve differential equations that have no closed-form solution (Bessel functions, Airy functions, Legendre polynomials). In signal processing, the Z-transform represents discrete signals as power series, enabling filter design. Machine learning uses Taylor expansions to linearize loss functions for optimization.',
    previewVisualizationId: null,
  },

  intuition: {
    prose: [
      'A power series centered at $c$ is an expression $\\sum_{n=0}^{\\infty} a_n(x-c)^n = a_0 + a_1(x-c) + a_2(x-c)^2 + \\cdots$. It is an "infinite polynomial" whose convergence depends on $x$. At $x = c$, every power series converges (all terms vanish except $a_0$). The question is: for which other $x$ does it converge?',
      'The remarkable fact is that every power series has a radius of convergence $R \\ge 0$ (possibly $\\infty$) such that the series converges absolutely for $|x - c| < R$ and diverges for $|x - c| > R$. The convergence region is a symmetric interval centered at $c$. At the endpoints $x = c \\pm R$, anything can happen — the series may converge or diverge at each endpoint independently. So the interval of convergence is one of $(c-R, c+R)$, $[c-R, c+R)$, $(c-R, c+R]$, or $[c-R, c+R]$.',
      'Finding $R$ is usually done with the Ratio Test applied to the power series. For $\\sum a_n(x-c)^n$: $\\left|\\frac{a_{n+1}(x-c)^{n+1}}{a_n(x-c)^n}\\right| = \\left|\\frac{a_{n+1}}{a_n}\\right||x-c| \\to L|x-c|$ where $L = \\lim|a_{n+1}/a_n|$. The series converges when $L|x-c| < 1$, i.e., $|x-c| < 1/L = R$. So $R = \\lim|a_n/a_{n+1}|$ (or $R = 1/\\limsup|a_n|^{1/n}$ via the Root Test).',
      'Endpoint checking is a separate step that requires individual convergence tests (p-series, alternating series, etc.). Example: $\\sum_{n=1}^{\\infty} x^n/n$ has $R = 1$ (ratio test). At $x = 1$: $\\sum 1/n$ (harmonic, diverges). At $x = -1$: $\\sum (-1)^n/n$ (alternating harmonic, converges by AST). So the interval of convergence is $[-1, 1)$.',
      'The most powerful property of power series is term-by-term differentiation and integration. If $f(x) = \\sum_{n=0}^{\\infty} a_n(x-c)^n$ for $|x-c| < R$, then: $f\'(x) = \\sum_{n=1}^{\\infty} na_n(x-c)^{n-1}$ and $\\int f(x)\\,dx = C + \\sum_{n=0}^{\\infty} \\frac{a_n}{n+1}(x-c)^{n+1}$, both with the same radius of convergence $R$. This is incredibly useful: you can generate new power series from known ones by calculus operations.',
      'Building a power series library from $1/(1-x) = \\sum_{n=0}^{\\infty} x^n$: (1) Replace $x$ by $-x$: $1/(1+x) = \\sum(-1)^n x^n$. (2) Integrate: $\\ln(1+x) = \\sum_{n=0}^{\\infty}(-1)^n x^{n+1}/(n+1) = x - x^2/2 + x^3/3 - \\cdots$. (3) Replace $x$ by $x^2$ in $1/(1+x)$: $1/(1+x^2) = \\sum(-1)^n x^{2n}$. (4) Integrate: $\\arctan(x) = \\sum_{n=0}^{\\infty}(-1)^n x^{2n+1}/(2n+1)$. Set $x = 1$: $\\pi/4 = 1 - 1/3 + 1/5 - 1/7 + \\cdots$ (Leibniz formula for $\\pi$).',
      'Representing functions as power series means expressing $f(x)$ in the form $\\sum a_n x^n$. Not every function has a power series representation (it must be infinitely differentiable and its Taylor series must converge to it). But for those that do, the representation is unique: $a_n = f^{(n)}(c)/n!$. This uniqueness is extremely useful for finding coefficients — you can use any valid method (substitution, differentiation, integration, algebraic manipulation) and the result is guaranteed to be the Taylor series.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Radius and Interval of Convergence',
        body: 'For $\\sum a_n(x-c)^n$, the radius of convergence $R$ is the number such that the series converges absolutely for $|x-c| < R$ and diverges for $|x-c| > R$. The interval of convergence includes $(c-R, c+R)$ plus whichever endpoints give convergence.',
      },
      {
        type: 'theorem',
        title: 'Term-by-Term Differentiation and Integration',
        body: 'If $f(x) = \\sum a_n(x-c)^n$ with radius $R > 0$, then $f\'(x) = \\sum na_n(x-c)^{n-1}$ and $\\int f(x)\\,dx = C + \\sum \\frac{a_n}{n+1}(x-c)^{n+1}$, both valid for $|x-c| < R$. The radius does not change (though endpoint behavior may).',
      },
      {
        type: 'strategy',
        title: 'Finding the Interval of Convergence: 3 Steps',
        body: '(1) Use the Ratio or Root Test to find $R$. Set $L|x-c| < 1$ and solve for $|x-c| < R$. (2) Test the left endpoint $x = c - R$ by plugging in and applying series convergence tests. (3) Test the right endpoint $x = c + R$ similarly. Report the interval with brackets/parentheses accordingly.',
      },
      {
        type: 'warning',
        title: 'Endpoints Must Be Checked Separately',
        body: 'The Ratio/Root Test is inconclusive at $|x-c| = R$ (gives $L = 1$). You must substitute each endpoint into the series and test convergence with other methods (p-series, AST, nth term, etc.). The two endpoints can behave differently.',
      },
    ],
    visualizations: [
      {
        id: 'GraphMorph',
        title: 'Partial Sums of a Power Series Approaching the Function',
        caption: 'Watch the polynomial partial sums $S_N(x) = \\sum_{n=0}^{N}a_n x^n$ approach $f(x) = 1/(1-x)$ as $N$ increases. Inside the radius of convergence ($|x|<1$), the fit improves everywhere. Outside ($|x|>1$), the partial sums diverge wildly.',
      },
    ],
  },

  math: {
    prose: [
      'Theorem (Radius of Convergence): for any power series $\\sum a_n(x-c)^n$, there exists $R \\in [0, \\infty]$ such that the series converges absolutely for $|x-c| < R$ and diverges for $|x-c| > R$. If $\\lim|a_{n+1}/a_n|$ exists, then $R = \\lim|a_n/a_{n+1}|$. More generally, $1/R = \\limsup_{n\\to\\infty}|a_n|^{1/n}$ (Hadamard formula).',
      'Example: $\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}$. Ratio: $|a_{n+1}/a_n| = |x|/(n+1) \\to 0$ for all $x$. So $R = \\infty$; the series converges for all $x \\in \\mathbb{R}$. This series equals $e^x$.',
      'Example: $\\sum_{n=1}^{\\infty} \\frac{(x-2)^n}{n\\cdot 3^n}$. Here $a_n = 1/(n\\cdot 3^n)$. Ratio: $|a_{n+1}/a_n| = \\frac{n}{(n+1)} \\cdot \\frac{1}{3} \\to 1/3$. So $R = 3$. Center $c = 2$, interval $(2-3, 2+3) = (-1, 5)$. At $x = 5$: $\\sum 1/n$ (harmonic, diverges). At $x = -1$: $\\sum (-1)^n/n$ (alternating harmonic, converges). Interval: $[-1, 5)$.',
      'Term-by-term differentiation proof sketch: the key result is that if $\\sum a_n x^n$ has radius $R$, then $\\sum na_n x^{n-1}$ also has radius $R$. This follows because $\\limsup|na_n|^{1/n} = \\limsup|a_n|^{1/n}$ (since $n^{1/n} \\to 1$). The harder part — that the derivative of the sum equals the sum of the derivatives — requires uniform convergence on compact subsets of $(-R, R)$, which power series automatically satisfy.',
      'Uniqueness of power series representations: if $\\sum a_n(x-c)^n = \\sum b_n(x-c)^n$ for all $x$ in an open interval containing $c$, then $a_n = b_n$ for all $n$. Proof: setting $x = c$ gives $a_0 = b_0$. Differentiating and setting $x = c$ gives $a_1 = b_1$. Differentiating $k$ times and setting $x = c$ gives $k!a_k = k!b_k$, so $a_k = b_k$. This means any method that produces a valid power series for $f$ automatically produces the Taylor series.',
      'Important power series representations (all centered at $0$): $\\frac{1}{1-x} = \\sum_{n=0}^{\\infty}x^n$ for $|x|<1$. $e^x = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!}$ for all $x$. $\\ln(1+x) = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}x^n}{n}$ for $-1 < x \\le 1$. $\\arctan(x) = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{2n+1}$ for $|x| \\le 1$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Hadamard Formula for the Radius of Convergence',
        body: '$\\frac{1}{R} = \\limsup_{n\\to\\infty} |a_n|^{1/n}$. This always gives the correct $R$, even when $\\lim|a_{n+1}/a_n|$ does not exist.',
      },
      {
        type: 'theorem',
        title: 'Uniqueness of Power Series',
        body: 'If $f(x) = \\sum a_n(x-c)^n$ on an open interval around $c$, then $a_n = f^{(n)}(c)/n!$. The power series representation is unique.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      'The proof that every power series has a radius of convergence uses the Root Test. Define $\\alpha = \\limsup|a_n|^{1/n}$ and $R = 1/\\alpha$. For $|x-c| < R$: choose $r$ with $|x-c| < r < R$. Then $|a_n(x-c)^n|^{1/n} = |a_n|^{1/n}|x-c| \\to \\alpha|x-c| < \\alpha R = 1$. So $\\limsup|a_n(x-c)^n|^{1/n} < 1$, and the series converges absolutely by the Root Test. For $|x-c| > R$: $\\limsup|a_n(x-c)^n|^{1/n} = \\alpha|x-c| > 1$, so $|a_n(x-c)^n| > 1$ for infinitely many $n$, and the series diverges.',
      'Uniform convergence of power series on compact subsets: if $\\sum a_n(x-c)^n$ has radius $R$ and $0 < r < R$, then the series converges uniformly on $[c-r, c+r]$. Proof: $|a_n(x-c)^n| \\le |a_n|r^n$ on $[c-r,c+r]$, and $\\sum|a_n|r^n$ converges (since $r < R$). By the Weierstrass M-test, the convergence is uniform. This uniform convergence justifies term-by-term differentiation and integration.',
      'Abel\'s theorem: if $\\sum a_n$ converges (i.e., the power series $\\sum a_n x^n$ converges at $x = 1$), then $\\lim_{x\\to 1^-}\\sum a_n x^n = \\sum a_n$. This continuity from the left at the endpoint is used to establish identities like $\\ln 2 = 1 - 1/2 + 1/3 - 1/4 + \\cdots$ (set $x = 1$ in $\\ln(1+x) = \\sum(-1)^{n+1}x^n/n$).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Abel\'s Theorem',
        body: 'If $\\sum_{n=0}^{\\infty}a_n$ converges to $S$, then $\\lim_{x\\to 1^-}\\sum_{n=0}^{\\infty}a_n x^n = S$. Power series are continuous at convergent endpoints (from the interior).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-003-ex1',
      title: 'Radius and Interval: Σ xⁿ/n²',
      problem: '\\text{Find the interval of convergence of } \\sum_{n=1}^{\\infty} \\frac{x^n}{n^2}.',
      steps: [
        { expression: '\\left|\\frac{a_{n+1}}{a_n}\\right| = \\frac{n^2}{(n+1)^2}|x| \\to |x|', annotation: 'Ratio test gives $L = |x|$. Converges when $|x| < 1$, so $R = 1$.' },
        { expression: 'x = 1: \\sum 1/n^2 \\text{ converges (p-series, } p=2\\text{).}', annotation: 'Right endpoint: convergent p-series.' },
        { expression: 'x = -1: \\sum (-1)^n/n^2 \\text{ converges absolutely.}', annotation: 'Left endpoint: $\\sum 1/n^2$ converges, so absolute convergence.' },
      ],
      conclusion: 'Interval of convergence: $[-1, 1]$. Both endpoints give convergent series.',
    },
    {
      id: 'ch5-003-ex2',
      title: 'Building from 1/(1-x): Power Series for ln(1+x)',
      problem: '\\text{Derive the power series for } \\ln(1+x) \\text{ from the geometric series.}',
      steps: [
        { expression: '\\frac{1}{1+x} = \\frac{1}{1-(-x)} = \\sum_{n=0}^{\\infty}(-x)^n = \\sum_{n=0}^{\\infty}(-1)^n x^n, \\quad |x|<1', annotation: 'Replace $x$ by $-x$ in the geometric series.' },
        { expression: '\\int_0^x \\frac{dt}{1+t} = \\int_0^x \\sum_{n=0}^{\\infty}(-1)^n t^n\\,dt = \\sum_{n=0}^{\\infty}(-1)^n \\frac{x^{n+1}}{n+1}', annotation: 'Integrate both sides term by term (valid for $|x|<1$).' },
        { expression: '\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + \\cdots = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}x^n}{n}', annotation: 'Left side is $\\ln(1+x)$. Reindex the right side.' },
      ],
      conclusion: '$\\ln(1+x) = \\sum_{n=1}^{\\infty}(-1)^{n+1}x^n/n$ for $-1 < x \\le 1$. Setting $x=1$: $\\ln 2 = 1 - 1/2 + 1/3 - 1/4 + \\cdots$ (by Abel\'s theorem).',
    },
    {
      id: 'ch5-003-ex3',
      title: 'Power Series for arctan(x)',
      problem: '\\text{Find the power series for } \\arctan(x).',
      steps: [
        { expression: '\\frac{1}{1+x^2} = \\sum_{n=0}^{\\infty}(-1)^n x^{2n}, \\quad |x|<1', annotation: 'Replace $x$ by $x^2$ in $1/(1+x) = \\sum(-1)^n x^n$, then replace $x$ by $x^2$.' },
        { expression: '\\arctan(x) = \\int_0^x \\frac{dt}{1+t^2} = \\sum_{n=0}^{\\infty}(-1)^n \\frac{x^{2n+1}}{2n+1}', annotation: 'Integrate term by term.' },
        { expression: '= x - \\frac{x^3}{3} + \\frac{x^5}{5} - \\frac{x^7}{7} + \\cdots', annotation: 'The Leibniz-Gregory series. Valid for $|x| \\le 1$.' },
      ],
      conclusion: '$\\arctan(x) = \\sum(-1)^n x^{2n+1}/(2n+1)$ for $|x| \\le 1$. At $x = 1$: $\\pi/4 = 1 - 1/3 + 1/5 - 1/7 + \\cdots$.',
    },
    {
      id: 'ch5-003-ex4',
      title: 'Radius of Convergence: Σ n! xⁿ',
      problem: '\\text{Find the radius of convergence of } \\sum_{n=0}^{\\infty} n!\\,x^n.',
      steps: [
        { expression: '\\left|\\frac{a_{n+1}}{a_n}\\right| = (n+1)|x| \\to \\infty \\text{ for any } x \\ne 0', annotation: 'The ratio grows without bound.' },
        { expression: 'R = 0. \\text{ The series converges only at } x = 0.', annotation: 'The factorial coefficients grow too fast for any nonzero $x$.' },
      ],
      conclusion: '$R = 0$. This series has the smallest possible radius. The factorial growth of $n!$ overwhelms any power $x^n$ for $x \\ne 0$.',
    },
    {
      id: 'ch5-003-ex5',
      title: 'Differentiation: Series for 1/(1-x)²',
      problem: '\\text{Find a power series for } \\frac{1}{(1-x)^2}.',
      steps: [
        { expression: '\\frac{d}{dx}\\left[\\frac{1}{1-x}\\right] = \\frac{1}{(1-x)^2}', annotation: 'Differentiate $1/(1-x)$ to get $1/(1-x)^2$.' },
        { expression: '\\frac{d}{dx}\\sum_{n=0}^{\\infty}x^n = \\sum_{n=1}^{\\infty}nx^{n-1} = \\sum_{n=0}^{\\infty}(n+1)x^n', annotation: 'Differentiate the geometric series term by term.' },
        { expression: '\\frac{1}{(1-x)^2} = \\sum_{n=0}^{\\infty}(n+1)x^n = 1 + 2x + 3x^2 + 4x^3 + \\cdots, \\quad |x|<1', annotation: 'Same radius $R = 1$.' },
      ],
      conclusion: '$1/(1-x)^2 = \\sum(n+1)x^n$ for $|x|<1$. Term-by-term differentiation generates new series from known ones.',
    },
  ],

  challenges: [
    {
      id: 'ch5-003-ch1',
      title: 'Series with Tricky Endpoints',
      problem: 'Find the interval of convergence of $\\sum_{n=1}^{\\infty} \\frac{(-1)^n(x+1)^n}{n\\cdot 4^n}$.',
      hint: 'Center $c = -1$, find $R$ by ratio test, then check $x = -5$ and $x = 3$.',
      walkthrough: [
        'Ratio: $|a_{n+1}/a_n| = \\frac{n}{n+1}\\cdot\\frac{|x+1|}{4} \\to |x+1|/4$. Converges when $|x+1| < 4$, so $R = 4$.',
        'Interval: $(-5, 3)$. Check endpoints.',
        '$x = 3$: $\\sum \\frac{(-1)^n 4^n}{n\\cdot 4^n} = \\sum \\frac{(-1)^n}{n}$. Alternating harmonic: converges.',
        '$x = -5$: $\\sum \\frac{(-1)^n(-4)^n}{n\\cdot 4^n} = \\sum \\frac{(-1)^n(-1)^n}{n} = \\sum \\frac{1}{n}$. Harmonic: diverges.',
        'Interval of convergence: $(-5, 3]$.',
      ],
    },
    {
      id: 'ch5-003-ch2',
      title: 'Power Series for a New Function',
      problem: 'Find a power series representation for $f(x) = x/(1+x^2)^2$ centered at $0$.',
      hint: 'Start from $1/(1+x^2) = \\sum(-1)^n x^{2n}$, differentiate, and adjust.',
      walkthrough: [
        '$1/(1+x^2) = \\sum_{n=0}^{\\infty}(-1)^n x^{2n}$.',
        'Differentiate: $-2x/(1+x^2)^2 = \\sum_{n=1}^{\\infty}(-1)^n 2n\\,x^{2n-1}$.',
        'So $x/(1+x^2)^2 = -\\frac{1}{2}\\sum_{n=1}^{\\infty}(-1)^n 2n\\,x^{2n-1} = \\sum_{n=1}^{\\infty}(-1)^{n+1}n\\,x^{2n-1}$.',
        '$= x - 2x^3 + 3x^5 - 4x^7 + \\cdots$ for $|x| < 1$.',
      ],
    },
  ],

  crossRefs: [
    { lessonId: 'ch5-002', text: 'Convergence tests — used to find the radius and check endpoints' },
    { lessonId: 'ch5-004', text: 'Taylor and Maclaurin series — the connection between power series and derivatives' },
    { lessonId: 'ch5-001', text: 'Geometric series — the foundation from which many power series are built' },
  ],

  checkpoints: [
    { id: 'ch5-003-cp1', prompt: 'How do you find the radius of convergence?', expectedInsight: 'Apply the Ratio Test: $R = \\lim|a_n/a_{n+1}|$, or Root Test: $1/R = \\limsup|a_n|^{1/n}$. Then check endpoints separately.' },
    { id: 'ch5-003-cp2', prompt: 'Can you differentiate a power series term by term?', expectedInsight: 'Yes, within the open interval of convergence. The radius $R$ stays the same, but endpoint behavior may change.' },
    { id: 'ch5-003-cp3', prompt: 'How do you represent $\\ln(1+x)$ as a power series?', expectedInsight: 'Start from $1/(1+x) = \\sum(-1)^n x^n$ and integrate: $\\ln(1+x) = \\sum(-1)^{n+1}x^n/n$ for $-1 < x \\le 1$.' },
  ],
}
