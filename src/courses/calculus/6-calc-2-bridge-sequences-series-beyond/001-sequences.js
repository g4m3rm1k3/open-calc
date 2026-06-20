// FILE: src/content/chapter-5/00-sequences.js
export default {
  id: 'ch5-sequences',
  slug: 'sequences',
  chapter: 5,
  order: 1,
  title: 'Sequences',
  subtitle: 'Ordered lists of numbers with a destination — the foundation of every limit, series, and integral approximation in Calc 2',
  tags: ['sequence', 'convergence', 'divergence', 'bounded', 'monotone', 'limit', 'recursive'],

  hook: {
    question: 'Stand one metre from a wall. Step halfway. Now step halfway again. And again. After $n$ steps you are $1/2^n$ metres from the wall — you never actually reach it, but you get arbitrarily close. That shrinking list of distances $1/2, 1/4, 1/8, \\ldots$ is a sequence converging to $0$. Sequences let us describe motion toward a destination that may never be fully reached — and that turns out to describe almost everything in advanced mathematics.',
    realWorldContext: 'Every time your phone computes a square root, evaluates a sine, or renders a curve, it runs a convergent sequence of approximations. GPS satellites solve positioning equations via Newton\'s method — a recursive sequence. Compression algorithms (JPEG, MP3) build on Fourier series, which are limits of sequence partial sums. Even the number $e = 2.718\\ldots$ is defined as the limit of the sequence $(1+1/n)^n$.',
    previewVisualizationId: 'SequenceExplorer',
  },

  intuition: {
    prose: [
      `**What is a sequence?** A sequence is an ordered, infinite list of real numbers: $a_1, a_2, a_3, \\ldots$ We write it $\\{a_n\\}$ or $\\{a_n\\}_{n=1}^{\\infty}$. Each $a_n$ is called a **term**. Three key points: (1) order matters — $1, 2, 3, \\ldots$ and $3, 1, 2, \\ldots$ are different sequences; (2) repetition is allowed — $1, 1, 1, \\ldots$ is a valid sequence; (3) a sequence is just a function $a:\\mathbb{N}\\to\\mathbb{R}$, so $a_n = a(n)$. That last point is powerful: it lets us reuse every limit tool from Calc 1 on sequences.`,

      `**What does "convergence" mean — intuitively?** A sequence converges to $L$ if the terms get closer and closer to $L$ and *stay* close. Picture a thermometer reading a cooling object: each reading is closer to room temperature than the last, and once the readings are within half a degree of room temperature they never leave that window again. The window can be made as narrow as you like — that "any window, however narrow" idea is exactly the formal definition. A sequence that does NOT settle at any single value is said to **diverge**.`,

      `**Three ways a sequence can diverge.** (1) *Blow up:* $a_n = n$ grows without bound — the terms fly off to $+\\infty$. (2) *Oscillate undamped:* $a_n = (-1)^n$ flips between $-1$ and $+1$ forever, never settling. (3) *Oscillate damped but to multiple values:* much rarer, but possible. The difference between (2) and convergence to $0$ is subtle: compare $(-1)^n$ (diverges) with $(-1)^n/n$ (converges to $0$). In the second case the oscillation gets smaller and smaller until it vanishes in the limit.`,

      `**The Squeeze Theorem — trapping a sequence.** If you can sandwich a sequence $b_n$ between two sequences $a_n \\le b_n \\le c_n$ that both converge to the same limit $L$, then $b_n$ must converge to $L$ too. Classic example: $\\sin(n)$ bounces between $-1$ and $1$ chaotically, so $-1/n \\le \\sin(n)/n \\le 1/n$. Both $\\pm 1/n \\to 0$, so $\\sin(n)/n \\to 0$ — even though $\\sin(n)$ itself never settles. The squeeze is your go-to tool whenever a sequence contains a function (sine, cosine, exponential) that you can bound.`,

      `**L'Hôpital via continuous extension.** A sequence is just a function sampled at integer inputs. If $a_n = f(n)$ for some continuous function $f(x)$, then $\\lim_{n\\to\\infty} a_n = \\lim_{x\\to\\infty} f(x)$. That second limit is a regular Calc 1 limit — you can use L'Hôpital, factoring, conjugates, everything. Example: $a_n = n/e^n$. Study $\\lim_{x\\to\\infty} x/e^x$. It's $\\infty/\\infty$, so L'Hôpital gives $\\lim 1/e^x = 0$. Done.`,

      `**Monotone Convergence Theorem — existence without a formula.** Sometimes you can prove a sequence converges without ever finding the limit. The theorem says: if a sequence is (a) monotone (always going in one direction) and (b) bounded (never escaping a finite interval), then it must converge. The intuition: a sequence moving in one direction inside a bounded box has no choice but to converge to the wall it's approaching. This is the existence theorem behind recursive sequences — you prove convergence first, then *set* $L = f(L)$ and solve.`,

      `**Recursive sequences — finding the limit.** Many real sequences are defined by a rule $a_{n+1} = f(a_n)$. To find the limit: step 1, prove the sequence converges (Monotone Convergence Theorem — show it's monotone and bounded). Step 2, take limits on both sides of the recursion: since $a_{n+1} \\to L$ and $a_n \\to L$, the rule becomes $L = f(L)$. Step 3, solve for $L$. Warning: step 2 is only valid *after* step 1. If you skip the proof of convergence, you might "solve" for a limit that doesn't exist.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Convergence of a Sequence',
        body: 'We say $\\lim_{n\\to\\infty} a_n = L$ if: for every $\\varepsilon > 0$, there exists $N \\in \\mathbb{N}$ such that $n > N \\implies |a_n - L| < \\varepsilon$. In plain English: no matter how small a window you draw around $L$, all but finitely many terms land inside it.',
      },
      {
        type: 'theorem',
        title: 'Monotone Convergence Theorem (MCT)',
        body: 'Every bounded, monotone sequence converges. Specifically: if $\\{a_n\\}$ is increasing ($a_{n+1} \\ge a_n$) and bounded above ($a_n \\le M$ for all $n$), it converges to $\\sup\\{a_n\\}$. Similarly for decreasing + bounded below.',
      },
      {
        type: 'warning',
        title: 'Bounded ≠ Convergent',
        body: '$(-1)^n$ is bounded ($|a_n| \\le 1$) but diverges — it oscillates. You need BOTH bounded AND monotone to guarantee convergence. Monotone alone also fails: $a_n = n$ is increasing but diverges to $\\infty$.',
      },
      {
        type: 'strategy',
        title: 'Toolkit for Finding Sequence Limits',
        body: '**Direct:** divide by highest power of $n$ (for rational expressions). **L\'Hôpital:** write $a_n = f(n)$ and use $\\lim_{x\\to\\infty} f(x)$. **Squeeze:** bound with $\\pm g(n) \\to 0$. **Continuous function:** if $a_n \\to L$ and $f$ is continuous, then $f(a_n) \\to f(L)$. **MCT:** if monotone + bounded, it converges — then set $L = f(L)$.',
      },
      {
        type: 'warning',
        title: 'Never Set L = f(L) Before Proving Convergence',
        body: 'If you write $L = f(L)$ without first proving the sequence converges, you may find a number that looks like a limit but isn\'t one. Always prove convergence (usually by MCT) before solving the fixed-point equation.',
      },
    ],
    visualizations: [
      {
        id: 'SequenceExplorer',
        title: 'Sequence Explorer — Plot Any Sequence',
        caption: 'Type any formula for $a_n$ using $n$. The plot shows whether the terms settle toward a limit (convergent) or wander off (divergent). Toggle the $\\varepsilon$-band to see the formal definition of convergence in action: pick any $\\varepsilon$ and find the first $N$ after which all terms land inside the band.',
      },
      {
        id: 'SequenceViz',
        title: 'Sequence Visualizer',
        caption: 'An alternative visualization for sequences, focusing on their behavior as $n$ increases.',
      },
    ],
  },

  math: {
    prose: [
      `**Formal definition.** $\\{a_n\\}$ converges to $L$ if for every $\\varepsilon > 0$ there exists $N \\in \\mathbb{N}$ such that $n > N \\implies |a_n - L| < \\varepsilon$. The key logical structure: the $\\forall \\varepsilon$ comes first (you name the tolerance), then you must produce the $N$ that works. Limits are unique: if $a_n \\to L$ and $a_n \\to M$, then $|L-M| < \\varepsilon$ for all $\\varepsilon > 0$, forcing $L = M$.`,

      `**Limit laws.** If $\\lim a_n = A$ and $\\lim b_n = B$, then: $\\lim(a_n \\pm b_n) = A \\pm B$; $\\lim(a_n \\cdot b_n) = AB$; $\\lim(a_n/b_n) = A/B$ (if $B \\ne 0$); $\\lim c\\,a_n = cA$. Also: if $f$ is continuous at $L$ and $a_n \\to L$, then $f(a_n) \\to f(L)$ (the Continuous Function Theorem).`,

      `**Squeeze Theorem.** If $a_n \\le b_n \\le c_n$ for all $n \\ge N_0$ and $\\lim a_n = \\lim c_n = L$, then $\\lim b_n = L$. Proof: given $\\varepsilon > 0$, choose $N_1, N_2$ so $|a_n - L| < \\varepsilon$ and $|c_n - L| < \\varepsilon$ for $n > N_1, N_2$. For $n > \\max(N_0, N_1, N_2)$: $L - \\varepsilon < a_n \\le b_n \\le c_n < L + \\varepsilon$, so $|b_n - L| < \\varepsilon$. $\\square$`,

      `**Monotone Convergence Theorem.** If $\\{a_n\\}$ is increasing and bounded above, let $L = \\sup\\{a_n\\}$. Given $\\varepsilon > 0$, $L - \\varepsilon$ is not an upper bound, so $\\exists N$ with $a_N > L - \\varepsilon$. Since the sequence increases, $a_n \\ge a_N > L - \\varepsilon$ for all $n \\ge N$. Also $a_n \\le L < L + \\varepsilon$. So $|a_n - L| < \\varepsilon$ for $n \\ge N$. $\\square$ The theorem depends on the completeness of $\\mathbb{R}$: every nonempty set bounded above has a supremum. This fails in $\\mathbb{Q}$.`,

      `**The sequence $(1+1/n)^n \\to e$.** Let $a_n = (1+1/n)^n$. Increasing: write $\\ln a_n = n\\ln(1+1/n)$; the function $f(x) = x\\ln(1+1/x)$ has $f'(x) > 0$ for $x > 0$, so $a_n$ increases. Bounded: by the binomial theorem, $a_n \\le \\sum_{k=0}^n 1/k! \\le 3$. By MCT, $a_n$ converges; its limit is defined to be $e \\approx 2.71828$.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Squeeze Theorem for Sequences',
        body: 'If $a_n \\le b_n \\le c_n$ for all large $n$ and $\\lim a_n = \\lim c_n = L$, then $\\lim b_n = L$.',
      },
      {
        type: 'theorem',
        title: 'Continuous Function Theorem',
        body: 'If $\\lim_{n\\to\\infty} a_n = L$ and $f$ is continuous at $L$, then $\\lim_{n\\to\\infty} f(a_n) = f(L)$. This lets you pull limits inside continuous functions: $\\lim\\sqrt{a_n} = \\sqrt{\\lim a_n}$, etc.',
      },
      {
        type: 'definition',
        title: 'Bounded and Monotone',
        body: '**Bounded above:** $\\exists M: a_n \\le M$ for all $n$. **Bounded below:** $\\exists m: a_n \\ge m$ for all $n$. **Bounded:** both. **Increasing:** $a_{n+1} \\ge a_n$. **Decreasing:** $a_{n+1} \\le a_n$. **Monotone:** either increasing or decreasing.',
      },
    ],
    visualizations: [
      {
        id: 'SequenceExplorer',
        title: 'Explore the formal ε–N definition',
        caption: 'Set $\\varepsilon$ using the slider and observe how the $\\varepsilon$-band captures all terms beyond a certain $N$. This is the formal definition of convergence made visible.',
      },
    ],
  },

  rigor: {
    prose: [
      `The Monotone Convergence Theorem rests on the **completeness axiom** of $\\mathbb{R}$: every nonempty subset of $\\mathbb{R}$ that is bounded above has a least upper bound (supremum) in $\\mathbb{R}$. This is what distinguishes $\\mathbb{R}$ from $\\mathbb{Q}$. The sequence $1, 1.4, 1.41, 1.414, \\ldots$ (decimal truncations of $\\sqrt{2}$) is increasing and bounded above by $2$ in $\\mathbb{Q}$, yet has no rational limit. Completeness is why analysis works.`,

      `**Uniqueness of the limit.** If $a_n \\to L$ and $a_n \\to M$, then for any $\\varepsilon > 0$, choose $N$ so $|a_n - L| < \\varepsilon/2$ and $|a_n - M| < \\varepsilon/2$ for $n > N$. Then $|L - M| \\le |L - a_n| + |a_n - M| < \\varepsilon$. Since $\\varepsilon$ is arbitrary, $|L - M| = 0$, so $L = M$. $\\square$`,

      `**Convergent implies bounded.** If $a_n \\to L$, choose $N$ so $|a_n - L| < 1$ for $n > N$. Then $|a_n| < |L| + 1$ for all $n > N$. Set $M = \\max(|a_1|, \\ldots, |a_N|, |L|+1)$. Then $|a_n| \\le M$ for all $n$. The converse fails ($(-1)^n$ is bounded but diverges), but the **Bolzano-Weierstrass Theorem** gives a partial converse: every bounded sequence has a convergent subsequence.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Bolzano-Weierstrass Theorem',
        body: 'Every bounded sequence in $\\mathbb{R}$ has a convergent subsequence. This follows from completeness and is the foundation for compactness arguments in real analysis.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-000-ex1',
      title: 'Rational Sequence: aₙ = (3n² + 1)/(5n² − 2)',
      problem: '\\text{Find } \\displaystyle\\lim_{n \\to \\infty} \\frac{3n^2 + 1}{5n^2 - 2}.',
      steps: [
        {
          expression: '\\frac{3n^2+1}{5n^2-2} = \\frac{n^2(3 + 1/n^2)}{n^2(5 - 2/n^2)} = \\frac{3 + 1/n^2}{5 - 2/n^2}',
          annotation: 'Divide every term by $n^2$ — the highest power of $n$ in the expression.',
          prereq: `**Why divide by the highest power?** When $n$ is very large, the $n^2$ terms completely dominate the constants. Dividing by $n^2$ converts the expression into a form where the large terms become $1$ and the small terms become $1/n^2 \\to 0$. This is the standard technique for rational sequences (and rational functions) — always divide numerator and denominator by the highest power of $n$ that appears anywhere in the fraction.`,
        },
        {
          expression: '\\lim_{n\\to\\infty} \\frac{3+1/n^2}{5-2/n^2} = \\frac{3+0}{5-0} = \\frac{3}{5}',
          annotation: 'As $n \\to \\infty$, $1/n^2 \\to 0$. Apply the limit law: limit of a quotient = quotient of limits (denominator is $5 \\ne 0$).',
          prereq: `**Why does $1/n^2 \\to 0$?** Because $n^2$ grows without bound as $n \\to \\infty$, so $1/n^2$ shrinks to zero. More precisely: given any $\\varepsilon > 0$, choose $N > 1/\\sqrt{\\varepsilon}$; then for $n > N$, $1/n^2 < 1/N^2 < \\varepsilon$.

**The limit law used:** If $\\lim a_n = A$ and $\\lim b_n = B$ with $B \\ne 0$, then $\\lim(a_n / b_n) = A/B$. Here $A = 3+0 = 3$ and $B = 5-0 = 5$.`,
        },
      ],
      conclusion: '$\\lim a_n = 3/5$. For any rational function of $n$ where the numerator and denominator have the same degree, the limit equals the ratio of leading coefficients.',
    },

    {
      id: 'ch5-000-ex2',
      title: 'Squeeze Theorem: aₙ = sin(n)/n',
      problem: '\\text{Find } \\displaystyle\\lim_{n \\to \\infty} \\frac{\\sin(n)}{n}.',
      steps: [
        {
          expression: '-1 \\le \\sin(n) \\le 1 \\quad \\text{for all } n',
          annotation: 'The sine function is always between $-1$ and $1$, regardless of the input.',
          prereq: `**Why is $|\\sin(n)| \\le 1$ always true?** Sine is defined as the $y$-coordinate on the unit circle (a circle of radius 1). Since the circle has radius 1, the $y$-coordinate can never exceed $1$ or go below $-1$. This is the fundamental bound on sine and cosine, and it holds for every real number input — including non-integer values of $n$.`,
        },
        {
          expression: '-\\frac{1}{n} \\le \\frac{\\sin(n)}{n} \\le \\frac{1}{n} \\quad \\text{(divide by } n > 0\\text{)}',
          annotation: 'Divide the inequality $-1 \\le \\sin(n) \\le 1$ through by $n$ (which is positive, so the direction doesn\'t flip).',
          prereq: `**Dividing an inequality.** If $a \\le b$ and $c > 0$, then $a/c \\le b/c$. Dividing a two-sided inequality $-1 \\le \\sin(n) \\le 1$ by $n > 0$ gives $-1/n \\le \\sin(n)/n \\le 1/n$. If we divided by a negative number, both inequality signs would reverse — but $n$ is always positive here.`,
        },
        {
          expression: '\\lim_{n\\to\\infty}\\left(-\\frac{1}{n}\\right) = 0 \\quad \\text{and} \\quad \\lim_{n\\to\\infty}\\frac{1}{n} = 0',
          annotation: 'Both bounding sequences converge to $0$.',
          prereq: `**$1/n \\to 0$:** As $n$ grows without bound, $1/n$ shrinks to zero. This is arguably the single most fundamental sequence limit in calculus. Proof: given $\\varepsilon > 0$, choose $N > 1/\\varepsilon$; then for $n > N$, $|1/n - 0| = 1/n < 1/N < \\varepsilon$.`,
        },
        {
          expression: '\\text{By the Squeeze Theorem: } \\lim_{n\\to\\infty} \\frac{\\sin(n)}{n} = 0',
          annotation: 'Since $-1/n \\le \\sin(n)/n \\le 1/n$ and both bounds converge to $0$, the sequence in the middle must also converge to $0$.',
          prereq: `**The Squeeze Theorem:** If $a_n \\le b_n \\le c_n$ for all $n \\ge N_0$, and $\\lim a_n = \\lim c_n = L$, then $\\lim b_n = L$. Intuition: $b_n$ is trapped between two walls that both close in on $L$, so $b_n$ must end up at $L$ too. The key requirement is that BOTH outer sequences go to the SAME limit $L$.`,
        },
      ],
      conclusion: '$\\lim \\sin(n)/n = 0$. The Squeeze Theorem is your main tool when a sequence involves a bounded oscillating function (like $\\sin$ or $\\cos$) multiplied by something that shrinks to zero.',
    },

    {
      id: 'ch5-000-ex3',
      title: 'L\'Hôpital via Substitution: aₙ = n · sin(1/n)',
      problem: '\\text{Find } \\displaystyle\\lim_{n\\to\\infty} n\\sin\\!\\left(\\frac{1}{n}\\right).',
      steps: [
        {
          expression: '\\text{Let } x = \\tfrac{1}{n}. \\text{ As } n \\to \\infty,\\; x \\to 0^+.',
          annotation: 'Substitute $x = 1/n$ to convert the sequence limit into a function limit as $x \\to 0^+$.',
          prereq: `**Why substitute $x = 1/n$?** The expression $n\\sin(1/n)$ has $1/n$ going to $0$ as $n \\to \\infty$. If we set $x = 1/n$, the expression becomes $\\sin(x)/x$ as $x \\to 0^+$ — a familiar limit form. This technique works whenever the sequence $a_n = f(n)$ has a continuous counterpart $f(x)$: since $f$ is continuous, $\\lim_{n\\to\\infty} f(n) = \\lim_{x\\to\\infty} f(x)$.`,
        },
        {
          expression: 'n\\sin\\!\\left(\\frac{1}{n}\\right) = \\frac{\\sin(x)}{x} \\quad \\text{where } x = \\tfrac{1}{n}',
          annotation: 'Rewrite: $n \\cdot \\sin(1/n) = \\sin(x)/x$ where $x = 1/n$.',
          prereq: `**The algebraic rewrite.** $n \\cdot \\sin(1/n)$. Replace $n$ with $1/x$: that gives $(1/x) \\cdot \\sin(x) = \\sin(x)/x$. This $\\sin(x)/x$ form is extremely common and has a known limit at $0$.`,
        },
        {
          expression: '\\lim_{x\\to 0^+} \\frac{\\sin(x)}{x} = 1',
          annotation: 'This is the fundamental trigonometric limit from Calc 1. Therefore $\\lim_{n\\to\\infty} n\\sin(1/n) = 1$.',
          prereq: `**Why does $\\sin(x)/x \\to 1$ as $x \\to 0$?** For small angles, $\\sin(x) \\approx x$ (the sine of a small angle nearly equals the angle itself, in radians). More precisely, a geometric proof using the unit circle shows $\\cos(x) < \\sin(x)/x < 1$ for $0 < x < \\pi/2$, and $\\cos(x) \\to 1$ as $x \\to 0$, so by the Squeeze Theorem $\\sin(x)/x \\to 1$. This limit is sometimes called the "sinc" limit and appears constantly in Fourier analysis.`,
        },
      ],
      conclusion: '$\\lim_{n\\to\\infty} n\\sin(1/n) = 1$. When a sequence has a recognizable continuous form, substituting $x = 1/n$ (or $x = n$) and taking a function limit is often the cleanest approach.',
    },

    {
      id: 'ch5-000-ex4',
      title: 'Recursive Sequence: Babylonian Square Root Method',
      problem: '\\text{Let } a_1 = 1,\\; a_{n+1} = \\tfrac{1}{2}\\!\\left(a_n + \\dfrac{2}{a_n}\\right).\\text{ Prove convergence and find the limit.}',
      steps: [
        {
          expression: 'a_{n+1} \\ge \\sqrt{2} \\text{ for all } n \\ge 1',
          annotation: 'By the AM-GM inequality: $(a_n + 2/a_n)/2 \\ge \\sqrt{a_n \\cdot (2/a_n)} = \\sqrt{2}$. So $a_{n+1} \\ge \\sqrt{2}$ — the sequence is bounded below.',
          prereq: `**AM-GM inequality.** For any two positive numbers $p$ and $q$: the **arithmetic mean** $(p+q)/2$ is always $\\ge$ the **geometric mean** $\\sqrt{pq}$. In symbols: $(p+q)/2 \\ge \\sqrt{pq}$, with equality when $p = q$. Here $p = a_n$ and $q = 2/a_n$, so $\\sqrt{pq} = \\sqrt{a_n \\cdot 2/a_n} = \\sqrt{2}$.

**Proof of AM-GM:** $(\\sqrt{p} - \\sqrt{q})^2 \\ge 0$ expands to $p - 2\\sqrt{pq} + q \\ge 0$, giving $(p+q)/2 \\ge \\sqrt{pq}$.`,
        },
        {
          expression: 'a_{n+1} - a_n = \\frac{2 - a_n^2}{2a_n} \\le 0 \\quad \\text{for } a_n \\ge \\sqrt{2}',
          annotation: 'Since $a_n \\ge \\sqrt{2}$, we have $a_n^2 \\ge 2$, so the numerator $2 - a_n^2 \\le 0$. The sequence is decreasing for $n \\ge 1$.',
          prereq: `**Showing a sequence is decreasing.** To prove $a_{n+1} \\le a_n$, compute $a_{n+1} - a_n$ and show it is $\\le 0$. Here: $a_{n+1} - a_n = \\frac{1}{2}(a_n + 2/a_n) - a_n = \\frac{a_n + 2/a_n - 2a_n}{2} = \\frac{2/a_n - a_n}{2} = \\frac{2 - a_n^2}{2a_n}$. Since $a_n > 0$ and $a_n^2 \\ge 2$, the fraction is $\\le 0$.`,
        },
        {
          expression: '\\text{Decreasing + bounded below} \\Rightarrow \\text{convergent by MCT. Let } L = \\lim_{n\\to\\infty} a_n.',
          annotation: 'The Monotone Convergence Theorem guarantees existence of the limit. Now we can safely solve for it.',
          prereq: `**Why MCT applies here.** The MCT for decreasing sequences says: if $a_{n+1} \\le a_n$ (decreasing) and $a_n \\ge m$ for all $n$ (bounded below), then $\\lim a_n$ exists and equals $\\inf\\{a_n\\}$. We just proved both conditions: decreasing for $n \\ge 1$ and bounded below by $\\sqrt{2}$.`,
        },
        {
          expression: 'L = \\tfrac{1}{2}\\!\\left(L + \\frac{2}{L}\\right) \\Rightarrow 2L^2 = L^2 + 2 \\Rightarrow L = \\sqrt{2}',
          annotation: 'As $n \\to \\infty$, $a_{n+1} \\to L$ and $a_n \\to L$. Substitute into the recursion and solve. Since $L \\ge \\sqrt{2} > 0$, take the positive root.',
          prereq: `**Taking limits in a recursion.** If $a_{n+1} = f(a_n)$ and $a_n \\to L$ (already proven), then $a_{n+1} \\to L$ as well (since $a_{n+1}$ is just the sequence shifted by one index). If $f$ is continuous, we get $L = f(L)$. Here $f(x) = (x + 2/x)/2$ is continuous for $x > 0$, so $L = (L + 2/L)/2$. Multiply both sides by $2L$: $2L^2 = L^2 + 2$, so $L^2 = 2$, giving $L = \\sqrt{2}$ (taking the positive root since $L \\ge \\sqrt{2} > 0$).`,
        },
      ],
      conclusion: 'The sequence converges to $\\sqrt{2}$. This is the Babylonian method, also Newton\'s method applied to $f(x) = x^2 - 2$. It converges quadratically — each step roughly doubles the number of correct decimal digits.',
    },
  ],

  challenges: [
    {
      id: 'ch5-sequences-ch1',
      difficulty: 'medium',
      problem: 'Let $a_1 = 1$, $a_{n+1} = \\sqrt{2 + a_n}$. Prove that $\\{a_n\\}$ converges and find the limit.',
      hint: 'Show by induction that $a_n < 2$ for all $n$ (bounded above), then show $a_{n+1}^2 > a_n^2$ to get increasing. Then use MCT and set $L = \\sqrt{2+L}$.',
      walkthrough: [
        {
          expression: 'a_1 = 1 < 2. \\quad \\text{If } a_n < 2,\\text{ then } a_{n+1} = \\sqrt{2 + a_n} < \\sqrt{2+2} = \\sqrt{4} = 2.',
          annotation: 'By induction, $a_n < 2$ for all $n \\ge 1$. The sequence is bounded above by $2$.',
          prereq: `**Mathematical induction — how it works.** To prove a statement $P(n)$ holds for all $n \\ge 1$: (1) **Base case:** verify $P(1)$ directly. (2) **Inductive step:** assume $P(k)$ is true (the "inductive hypothesis"), then prove $P(k+1)$ follows. Here $P(n)$ is "$a_n < 2$". Base: $a_1 = 1 < 2$. Inductive step: if $a_n < 2$, then $a_{n+1} = \\sqrt{2 + a_n} < \\sqrt{2 + 2} = 2$.`,
        },
        {
          expression: 'a_{n+1}^2 - a_n^2 = (2+a_n) - a_n^2 = (2-a_n)(1+a_n)',
          annotation: 'Since $0 < a_n < 2$, both factors $(2-a_n) > 0$ and $(1+a_n) > 0$, so $a_{n+1}^2 > a_n^2$. Since all terms are positive, $a_{n+1} > a_n$: the sequence is increasing.',
          prereq: `**Why compare squares?** Both $a_n$ and $a_{n+1}$ are positive (they're square roots), so $a_{n+1} > a_n \\iff a_{n+1}^2 > a_n^2$. Computing $a_{n+1}^2 - a_n^2$ is often easier than $a_{n+1} - a_n$ directly. Here $a_{n+1}^2 = (\\sqrt{2+a_n})^2 = 2 + a_n$.`,
        },
        {
          expression: '\\text{Increasing + bounded above} \\Rightarrow \\text{MCT applies.}\\; \\exists\\, L = \\lim_{n\\to\\infty} a_n.',
          annotation: 'Both conditions of the Monotone Convergence Theorem are satisfied. The limit exists.',
          prereq: `**Recap of MCT.** MCT (Monotone Convergence Theorem): if $\\{a_n\\}$ is increasing ($a_{n+1} \\ge a_n$) AND bounded above (there exists $M$ with $a_n \\le M$ for all $n$), then $\\lim_{n\\to\\infty} a_n$ exists and equals $\\sup\\{a_n\\}$. We proved increasing in step 2 and bounded above by $2$ in step 1.`,
        },
        {
          expression: 'L = \\sqrt{2+L} \\Rightarrow L^2 = 2+L \\Rightarrow L^2 - L - 2 = 0 \\Rightarrow (L-2)(L+1) = 0 \\Rightarrow L = 2.',
          annotation: 'Take limits in the recursion: $L = \\sqrt{2+L}$. Square both sides and factor. Since $L \\ge 0$, reject $L = -1$.',
          prereq: `**Solving a quadratic by factoring.** $L^2 - L - 2 = 0$. Find two numbers that multiply to $-2$ and add to $-1$: those are $-2$ and $+1$. So $L^2 - L - 2 = (L-2)(L+1) = 0$, giving $L = 2$ or $L = -1$. Since the sequence consists of square roots (all positive), $L \\ge 0$, so $L = 2$.`,
        },
      ],
      answer: 'L = 2',
    },

    {
      id: 'ch5-sequences-ch2',
      difficulty: 'medium',
      problem: 'Show that $\\displaystyle\\lim_{n\\to\\infty} \\frac{n!}{n^n} = 0$.',
      hint: 'Write $n!/n^n$ as a product $(1/n)(2/n)(3/n)\\cdots(n/n)$. The first factor is $1/n \\to 0$; every other factor is $\\le 1$.',
      walkthrough: [
        {
          expression: '\\frac{n!}{n^n} = \\frac{1 \\cdot 2 \\cdot 3 \\cdots n}{n \\cdot n \\cdot n \\cdots n} = \\frac{1}{n} \\cdot \\frac{2}{n} \\cdot \\frac{3}{n} \\cdots \\frac{n}{n}',
          annotation: 'Write $n!$ as $1 \\cdot 2 \\cdots n$ and $n^n$ as $n$ multiplied by itself $n$ times, then pair up each factor.',
          prereq: `**Factorial notation.** $n! = 1 \\cdot 2 \\cdot 3 \\cdots n$ (read "$n$ factorial") is the product of all positive integers up to $n$. Examples: $3! = 6$, $4! = 24$, $5! = 120$. Meanwhile $n^n = n \\cdot n \\cdot n \\cdots n$ ($n$ times). Writing $n!/n^n$ as a product of fractions $k/n$ for $k = 1, 2, \\ldots, n$ separates out the key factor.`,
        },
        {
          expression: '0 < \\frac{n!}{n^n} \\le \\frac{1}{n} \\cdot 1 \\cdot 1 \\cdots 1 = \\frac{1}{n}',
          annotation: 'Each factor $k/n \\le 1$ since $k \\le n$. The first factor is exactly $1/n$. So the whole product is at most $1/n$.',
          prereq: `**Bounding a product.** If $0 < f_k \\le 1$ for $k = 2, 3, \\ldots, n$, then $f_1 \\cdot f_2 \\cdots f_n \\le f_1 \\cdot 1 \\cdot 1 \\cdots 1 = f_1$. Here each fraction $k/n \\le 1$ because $k \\le n$. The first fraction $1/n$ gives the tightest upper bound.`,
        },
        {
          expression: '0 < \\frac{n!}{n^n} \\le \\frac{1}{n} \\to 0 \\quad \\Rightarrow \\quad \\lim_{n\\to\\infty}\\frac{n!}{n^n} = 0 \\;\\blacksquare',
          annotation: 'Apply the Squeeze Theorem: $0 \\le n!/n^n \\le 1/n$, and both $0$ and $1/n$ converge to $0$.',
          prereq: `**Squeeze with $0$.** When you want to prove a sequence of positive terms converges to $0$, the Squeeze Theorem simplifies: you just need $0 \\le a_n \\le b_n$ where $b_n \\to 0$. The lower bound $0$ is trivially constant (limit $= 0$). Here $b_n = 1/n \\to 0$ does the job.`,
        },
      ],
      answer: '\\lim_{n\\to\\infty} n!/n^n = 0',
    },

    {
      id: 'ch5-sequences-ch3',
      difficulty: 'hard',
      problem: 'Prove: if $\\lim_{n\\to\\infty} a_n = L$, then the Cesàro mean $s_n = \\dfrac{a_1 + a_2 + \\cdots + a_n}{n}$ also satisfies $\\lim_{n\\to\\infty} s_n = L$.',
      hint: 'Split the sum $\\sum(a_k - L)$ at some index $N$. The first $N$ terms contribute $O(1/n) \\to 0$. The remaining $n - N$ terms are each small by hypothesis.',
      walkthrough: [
        {
          expression: 's_n - L = \\frac{1}{n}\\sum_{k=1}^{n}(a_k - L) = \\frac{1}{n}\\sum_{k=1}^{N}(a_k - L) + \\frac{1}{n}\\sum_{k=N+1}^{n}(a_k - L)',
          annotation: 'Write $s_n - L = (1/n)\\sum(a_k - L)$ and split at index $N$ (to be chosen).',
          prereq: `**Why rewrite $s_n - L$ this way?** Since $L = L \\cdot n/n = (1/n) \\cdot nL = (1/n)\\sum_{k=1}^n L$, we get $s_n - L = (1/n)\\sum_{k=1}^n (a_k - L)$. Splitting at $N$ separates the "old" terms (which might be far from $L$, but there are only $N$ of them) from the "recent" terms (which are close to $L$ by hypothesis). This split-and-bound technique appears constantly in analysis proofs.`,
        },
        {
          expression: '\\text{Choose } N \\text{ so } |a_k - L| < \\varepsilon/2 \\text{ for all } k > N.\\;\\text{Let } C = \\sum_{k=1}^{N}|a_k-L|.',
          annotation: 'Since $a_n \\to L$, such $N$ exists (definition of convergence). $C$ is a fixed finite number (finitely many terms).',
          prereq: `**Using the definition of convergence.** $a_n \\to L$ means: for every $\\varepsilon > 0$, $\\exists N$ such that $n > N \\Rightarrow |a_n - L| < \\varepsilon$. Here we choose the threshold $\\varepsilon/2$ (using half of our target error, to have room for two estimates to add up). The number $C = \\sum_{k=1}^N |a_k - L|$ is a sum of finitely many fixed constants — it does not depend on $n$.`,
        },
        {
          expression: '\\left|\\frac{1}{n}\\sum_{k=1}^{N}(a_k-L)\\right| \\le \\frac{C}{n} \\to 0 \\quad \\text{as } n \\to \\infty',
          annotation: 'The first sum has a fixed numerator $C$; dividing by $n$ sends it to $0$.',
          prereq: `**A fixed numerator divided by $n$ goes to $0$.** If $C$ is a constant (not depending on $n$), then $C/n \\to 0$ as $n \\to \\infty$. This is the key reason the "old terms" don't matter in the long run: even if they were enormous, spreading their total over $n$ slots produces an average that vanishes.`,
        },
        {
          expression: '\\left|\\frac{1}{n}\\sum_{k=N+1}^{n}(a_k-L)\\right| \\le \\frac{1}{n}\\cdot(n-N)\\cdot\\frac{\\varepsilon}{2} < \\frac{\\varepsilon}{2}',
          annotation: 'Each of the $n-N$ "recent" terms satisfies $|a_k - L| < \\varepsilon/2$. So the whole sum is at most $(n-N)\\varepsilon/2 < n\\varepsilon/2$, giving $< \\varepsilon/2$ after dividing by $n$.',
          prereq: `**Bounding a sum of small terms.** If each of $m$ terms satisfies $|x_k| < B$, then $|\\sum x_k| \\le \\sum|x_k| < mB$ (triangle inequality). Here $m = n - N$ and $B = \\varepsilon/2$, giving bound $(n-N)\\varepsilon/2$. Dividing by $n$: $(n-N)/(n) \\cdot \\varepsilon/2 < 1 \\cdot \\varepsilon/2 = \\varepsilon/2$.`,
        },
        {
          expression: '|s_n - L| < \\frac{C}{n} + \\frac{\\varepsilon}{2} < \\varepsilon \\quad \\text{for all large } n. \\quad \\blacksquare',
          annotation: 'Choose $n$ large enough that $C/n < \\varepsilon/2$. Then $|s_n - L| < \\varepsilon/2 + \\varepsilon/2 = \\varepsilon$.',
          prereq: `**Combining two small errors.** Both parts of the split are now $< \\varepsilon/2$. Adding them: $|s_n - L| \\le |\\text{part 1}| + |\\text{part 2}| < \\varepsilon/2 + \\varepsilon/2 = \\varepsilon$. The final step: choose $n > 2C/\\varepsilon$ to ensure $C/n < \\varepsilon/2$. This "halving trick" (using $\\varepsilon/2$ for each piece so they sum to $\\varepsilon$) is one of the most common techniques in $\\varepsilon$-$N$ proofs.`,
        },
      ],
      answer: '\\text{Proved: } \\lim_{n\\to\\infty} s_n = L.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'introduction', label: 'Limits of Functions', context: 'The continuous analogue of sequence limits — same epsilon-delta spirit.' },
    { lessonSlug: 'summation-notation', label: 'Summation Notation', context: 'Series are sums of sequence terms — you need sigma notation to write them.' },
    { lessonSlug: 'series-intro', label: 'Series', context: 'Sums of infinitely many sequence terms — what happens when you add up $a_1 + a_2 + a_3 + \\cdots$.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-1',
    'attempted-challenge-2',
    'attempted-challenge-3',
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The sequence aₙ = (−1)ⁿ oscillates between −1 and +1 forever. What is lim(n→∞) aₙ?',
      options: [
        '0 — the average of −1 and +1 is 0, so the limit must be 0',
        'The limit does not exist — a sequence converges only if its terms get and stay close to a single value; aₙ keeps switching between −1 and +1 and never settles',
        '1 — the last term for any finite n determines the limit',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The Monotone Convergence Theorem says every monotone bounded sequence converges. Why must it be bounded?',
      options: [
        'Bounded is required so that the sequence does not have gaps — unbounded sequences always have missing values',
        'Without an upper bound, an increasing sequence can grow to +∞ and never settle on a finite limit — the bound provides the "ceiling" that forces the sequence to converge rather than diverge',
        'The theorem requires bounded only for decreasing sequences; increasing sequences always converge regardless of bounds',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'aₙ = n/(n+1). As n grows very large, what behavior do you expect, and why?',
      options: [
        'aₙ → ∞ — the numerator n grows larger every step, so the sequence diverges',
        'aₙ → 1 — divide numerator and denominator by n: n/(n+1) = 1/(1 + 1/n), and 1/n → 0 as n → ∞, so the limit is 1/1 = 1',
        'aₙ → 1/2 — halfway between 0 and 1 is the natural limit for a fraction approaching a boundary',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Sequences and series are related but different concepts. What is the key distinction?',
      options: [
        'A sequence lists terms a₁, a₂, a₃, … in order; a series is the sum a₁+a₂+a₃+⋯ = Σaₙ. A series converges if the sequence of partial sums Sₙ = a₁+⋯+aₙ converges to a finite limit',
        'A sequence must have a limit, while a series can diverge — the distinction is about convergence requirements',
        'Sequences contain only real numbers; series can contain complex terms and require different convergence criteria',
      ],
      correct: 0,
    },
  ],
}
