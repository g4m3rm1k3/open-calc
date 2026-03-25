// FILE: src/content/chapter-5/04-taylor-maclaurin.js
export default {
  id: 'ch5-004',
  slug: 'taylor-maclaurin',
  chapter: 5,
  order: 4,
  title: 'Taylor and Maclaurin Series',
  subtitle: 'The best polynomial approximations to any smooth function — derived from derivatives alone',
  tags: ['Taylor series', 'Maclaurin', 'Taylor polynomial', 'remainder', 'Lagrange', 'e^x series', 'sin series', 'approximation', 'binomial series'],

  hook: {
    question: 'Near $x = 0$, the function $\\sin(x)$ looks almost linear: $\\sin(x) \\approx x$. But how good is this approximation? Can we do better? What if we use $\\sin(x) \\approx x - x^3/6$? Or $x - x^3/6 + x^5/120$? Each polynomial is a better fit. Is there a systematic way to build the "best" polynomial approximation of any degree, for any function?',
    realWorldContext: 'Taylor series are arguably the most important computational tool in applied mathematics. Engineers approximate solutions to differential equations using Taylor expansions. Physicists linearize complex systems by keeping the first few Taylor terms (small-angle approximation $\\sin\\theta \\approx \\theta$, relativistic corrections as Taylor series in $v/c$). Computer chips evaluate transcendental functions ($\\sin$, $\\cos$, $\\exp$, $\\ln$) by computing Taylor polynomials. Modern machine learning uses Taylor-like expansions to analyze neural network behavior.',
    previewVisualizationId: 'TaylorApproximation',
  },

  intuition: {
    prose: [
      'The Taylor series of $f(x)$ centered at $x = c$ is $f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(c)}{n!}(x-c)^n = f(c) + f\'(c)(x-c) + \\frac{f\'\'(c)}{2!}(x-c)^2 + \\frac{f\'\'\'(c)}{3!}(x-c)^3 + \\cdots$. When $c = 0$, this is called the Maclaurin series: $f(x) = \\sum \\frac{f^{(n)}(0)}{n!}x^n$. The idea is simple: match the value, slope, concavity, and all higher derivatives of $f$ at $x = c$, producing the unique polynomial (of each degree) that agrees with $f$ to the highest possible order.',
      'The Taylor polynomial of degree $n$ is $T_n(x) = \\sum_{k=0}^{n}\\frac{f^{(k)}(c)}{k!}(x-c)^k$. It is the best polynomial approximation of degree $n$ near $x = c$ in the sense that $f(x) - T_n(x)$ vanishes to order $n$ at $c$: $\\lim_{x\\to c}\\frac{f(x)-T_n(x)}{(x-c)^n} = 0$. No other polynomial of degree $\\le n$ has this property.',
      'Deriving the Maclaurin series for $e^x$: all derivatives of $e^x$ are $e^x$, so $f^{(n)}(0) = e^0 = 1$ for all $n$. Therefore $e^x = \\sum_{n=0}^{\\infty}x^n/n! = 1 + x + x^2/2! + x^3/3! + \\cdots$. This converges for all $x$ (ratio test: $|x|/(n+1) \\to 0$). Setting $x = 1$: $e = 1 + 1 + 1/2 + 1/6 + 1/24 + \\cdots \\approx 2.71828$.',
      'Deriving the Maclaurin series for $\\sin(x)$: the derivatives cycle: $\\sin, \\cos, -\\sin, -\\cos, \\sin, \\ldots$. At $x = 0$: $0, 1, 0, -1, 0, 1, 0, -1, \\ldots$. Only odd powers survive: $\\sin(x) = x - x^3/3! + x^5/5! - x^7/7! + \\cdots = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{(2n+1)!}$. Similarly, $\\cos(x) = 1 - x^2/2! + x^4/4! - \\cdots = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n}}{(2n)!}$. Both converge for all $x$.',
      'The Lagrange remainder (error term) quantifies how good the $n$-th degree Taylor polynomial is. If $f$ has $n+1$ continuous derivatives on an interval containing $c$ and $x$, then $f(x) = T_n(x) + R_n(x)$ where $R_n(x) = \\frac{f^{(n+1)}(z)}{(n+1)!}(x-c)^{n+1}$ for some $z$ between $c$ and $x$. This looks exactly like the Mean Value Theorem applied to the Taylor context. The remainder tells you: the error is controlled by the $(n+1)$-st derivative and the $(n+1)$-st power of the distance from $c$.',
      'To prove a Taylor series converges to $f(x)$ (not just converges to something), you must show $R_n(x) \\to 0$ as $n \\to \\infty$. For $e^x$: $|R_n(x)| = \\frac{e^{|z|}}{(n+1)!}|x|^{n+1} \\le \\frac{e^{|x|}}{(n+1)!}|x|^{n+1} \\to 0$ since $n!$ grows faster than any exponential. For $\\sin(x)$ and $\\cos(x)$: $|f^{(n+1)}(z)| \\le 1$ always, so $|R_n| \\le |x|^{n+1}/(n+1)! \\to 0$. This proves the Taylor series equals the function everywhere.',
      'The key Maclaurin series to memorize: $e^x = \\sum x^n/n!$ (all $x$). $\\sin(x) = \\sum(-1)^n x^{2n+1}/(2n+1)!$ (all $x$). $\\cos(x) = \\sum(-1)^n x^{2n}/(2n)!$ (all $x$). $1/(1-x) = \\sum x^n$ ($|x|<1$). $\\ln(1+x) = \\sum(-1)^{n+1}x^n/n$ ($-1<x\\le 1$). $(1+x)^k = \\sum\\binom{k}{n}x^n$ ($|x|<1$, any real $k$) — the binomial series, where $\\binom{k}{n} = k(k-1)\\cdots(k-n+1)/n!$.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Taylor Series',
        body: 'The Taylor series of $f$ centered at $c$ is $\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(c)}{n!}(x-c)^n$. The Maclaurin series is the special case $c = 0$. The $n$-th Taylor polynomial $T_n(x)$ is the partial sum up to degree $n$.',
      },
      {
        type: 'theorem',
        title: 'Lagrange Remainder (Taylor\'s Theorem)',
        body: 'If $f^{(n+1)}$ is continuous between $c$ and $x$, then $f(x) = T_n(x) + R_n(x)$ where $R_n(x) = \\frac{f^{(n+1)}(z)}{(n+1)!}(x-c)^{n+1}$ for some $z$ between $c$ and $x$. This gives the error bound $|R_n(x)| \\le \\frac{M}{(n+1)!}|x-c|^{n+1}$ where $M = \\max|f^{(n+1)}|$.',
      },
      {
        type: 'strategy',
        title: 'The Six Series You Must Memorize',
        body: '(1) $e^x = \\sum x^n/n!$, all $x$. (2) $\\sin x = \\sum(-1)^n x^{2n+1}/(2n+1)!$, all $x$. (3) $\\cos x = \\sum(-1)^n x^{2n}/(2n)!$, all $x$. (4) $1/(1-x) = \\sum x^n$, $|x|<1$. (5) $\\ln(1+x) = \\sum(-1)^{n+1}x^n/n$, $(-1,1]$. (6) $(1+x)^k = \\sum\\binom{k}{n}x^n$, $|x|<1$.',
      },
      {
        type: 'warning',
        title: 'Taylor Series May Not Equal the Function',
        body: 'A function can be infinitely differentiable yet have a Taylor series that converges to the wrong value. The classic example: $f(x) = e^{-1/x^2}$ (with $f(0)=0$) has $f^{(n)}(0) = 0$ for all $n$, so its Maclaurin series is $0 + 0 + 0 + \\cdots = 0 \\ne f(x)$ for $x \\ne 0$. You must check $R_n \\to 0$ to confirm equality.',
      },
      {
        type: 'misconception',
        title: 'Taylor Polynomials Are Only Good Near the Center',
        body: 'The approximation $\\sin(x) \\approx x$ is excellent for small $x$ but terrible for $x = 10$. Taylor polynomials are local approximations; accuracy degrades as you move away from $c$. Higher-degree polynomials extend the range of good approximation but never make it global (unless $R = \\infty$, as with $e^x$, $\\sin$, $\\cos$).',
      },
    ],
    visualizationId: 'TaylorApproximation',
    visualizationProps: {},
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Essence of Calculus, Chapter 10: Taylor series",
        props: { url: "" }
      },
      {
        id: 'GraphMorph',
        title: 'Taylor Polynomials Approaching sin(x)',
        caption: 'Watch as $T_1(x) = x$, $T_3(x) = x - x^3/6$, $T_5(x) = x - x^3/6 + x^5/120$, $\\ldots$ progressively better approximate $\\sin(x)$. Each successive polynomial hugs the sine curve over a wider interval.',
      },
      {
        id: 'SeriesConvergenceLab',
        title: 'Truncation and Error Intuition Lab',
        caption: 'Preview how partial sums behave and how error shrinks with more terms before applying the formal Lagrange remainder inequalities.',
      },
    ],
  },

  math: {
    prose: [
      'Taylor\'s Theorem (with Lagrange remainder): suppose $f$ has $n+1$ continuous derivatives on an interval $I$ containing $c$. For any $x \\in I$, $f(x) = \\sum_{k=0}^{n}\\frac{f^{(k)}(c)}{k!}(x-c)^k + \\frac{f^{(n+1)}(z)}{(n+1)!}(x-c)^{n+1}$ for some $z$ between $c$ and $x$. The remainder $R_n(x) = \\frac{f^{(n+1)}(z)}{(n+1)!}(x-c)^{n+1}$ satisfies $|R_n(x)| \\le \\frac{M_{n+1}}{(n+1)!}|x-c|^{n+1}$ where $M_{n+1} = \\max_{t \\in I}|f^{(n+1)}(t)|$.',
      'Derivation of the $e^x$ series: $f(x) = e^x$, $f^{(n)}(x) = e^x$, $f^{(n)}(0) = 1$ for all $n$. Maclaurin series: $e^x = \\sum_{n=0}^{\\infty}x^n/n!$. Remainder: $|R_n(x)| \\le e^{|x|}|x|^{n+1}/(n+1)!$. Since $(n+1)!$ grows much faster than $|x|^{n+1}$ for any fixed $x$, $R_n(x) \\to 0$. The series equals $e^x$ for all $x \\in \\mathbb{R}$.',
      'Derivation of the $\\sin(x)$ series: $f(x)=\\sin x$. $f(0)=0, f\'(0)=1, f\'\'(0)=0, f\'\'\'(0)=-1$, repeating with period $4$. Only odd terms are nonzero: $\\sin(x) = \\sum_{n=0}^{\\infty}\\frac{(-1)^n}{(2n+1)!}x^{2n+1}$. Remainder: $|R_n| \\le |x|^{n+1}/(n+1)! \\to 0$ for all $x$ (since all derivatives of sin are bounded by $1$). The $\\cos$ series is obtained by differentiating: $\\cos(x) = \\sum_{n=0}^{\\infty}\\frac{(-1)^n}{(2n)!}x^{2n}$.',
      'The binomial series: for any real $k$ (not just positive integer), $(1+x)^k = \\sum_{n=0}^{\\infty}\\binom{k}{n}x^n$ where $\\binom{k}{n} = \\frac{k(k-1)(k-2)\\cdots(k-n+1)}{n!}$. Converges for $|x|<1$. When $k$ is a positive integer, the series terminates (finite sum) and we recover the binomial theorem. When $k$ is not an integer (e.g., $k = 1/2$), we get infinite series: $\\sqrt{1+x} = 1 + x/2 - x^2/8 + x^3/16 - \\cdots$.',
      'Using Taylor series to compute limits: $\\lim_{x\\to 0}\\frac{\\sin x - x}{x^3}$. Expand $\\sin x = x - x^3/6 + x^5/120 - \\cdots$. Then $\\sin x - x = -x^3/6 + x^5/120 - \\cdots$, so $\\frac{\\sin x - x}{x^3} = -1/6 + x^2/120 - \\cdots \\to -1/6$. This is often much cleaner than L\'Hopital\'s rule (which would require three applications here).',
      'Using Taylor series to approximate integrals: $\\int_0^1 e^{-x^2}\\,dx$. There is no elementary antiderivative for $e^{-x^2}$. But $e^{-x^2} = \\sum(-1)^n x^{2n}/n!$. Integrate term by term: $\\int_0^1 e^{-x^2}\\,dx = \\sum_{n=0}^{\\infty}\\frac{(-1)^n}{n!(2n+1)}$. This alternating series converges; $5$ terms give $\\approx 0.74682$, accurate to $5$ decimals.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Taylor\'s Theorem with Lagrange Remainder',
        body: '$f(x) = T_n(x) + R_n(x)$ where $R_n(x) = \\frac{f^{(n+1)}(z)}{(n+1)!}(x-c)^{n+1}$ for some $z$ between $c$ and $x$. Error bound: $|R_n(x)| \\le \\frac{M}{(n+1)!}|x-c|^{n+1}$.',
      },
      {
        type: 'theorem',
        title: 'Binomial Series',
        body: 'For any real $k$: $(1+x)^k = \\sum_{n=0}^{\\infty}\\binom{k}{n}x^n$ for $|x|<1$, where $\\binom{k}{n} = \\frac{k(k-1)\\cdots(k-n+1)}{n!}$.',
      },
      {
        type: 'definition',
        title: 'Taylor Polynomial Error Bound',
        body: 'To guarantee $|f(x) - T_n(x)| < \\varepsilon$: find $M = \\max|f^{(n+1)}|$ on the interval, then solve $\\frac{M|x-c|^{n+1}}{(n+1)!} < \\varepsilon$. This tells you which degree $n$ suffices for the desired accuracy.',
      },
    ],
    visualizations: [
      {
        id: 'GraphMorph',
        title: 'Taylor Polynomial Approximations to eˣ',
        caption: 'Successive Taylor polynomials $T_1, T_2, T_3, \\ldots$ for $e^x$. Near $x=0$ they are nearly indistinguishable from $e^x$; further away, higher degrees are needed.',
      },
    ],
  },

  rigor: {
    prose: [
      'Proof of Taylor\'s Theorem (Lagrange form): define $R_n(x) = f(x) - T_n(x)$. Then $R_n(c) = R_n\'(c) = \\cdots = R_n^{(n)}(c) = 0$ (by construction of $T_n$), and $R_n^{(n+1)}(t) = f^{(n+1)}(t)$ for all $t$. Define $G(t) = R_n(t) - \\frac{R_n(x)}{(x-c)^{n+1}}(t-c)^{n+1}$. Then $G(c) = G(x) = 0$. By Rolle\'s theorem applied repeatedly (Generalized Mean Value Theorem), there exists $z$ between $c$ and $x$ with $G^{(n+1)}(z) = 0$. Computing: $G^{(n+1)}(z) = f^{(n+1)}(z) - \\frac{R_n(x)}{(x-c)^{n+1}}(n+1)! = 0$. Solving: $R_n(x) = \\frac{f^{(n+1)}(z)}{(n+1)!}(x-c)^{n+1}$.',
      'The Taylor series of $f$ may converge everywhere yet fail to equal $f$. The standard example: $f(x) = e^{-1/x^2}$ for $x \\ne 0$, $f(0) = 0$. One can show $f^{(n)}(0) = 0$ for all $n$ by induction (each derivative at $0$ involves a limit of $p(1/x)e^{-1/x^2}$ as $x \\to 0$, which equals $0$ by L\'Hopital). So the Maclaurin series is identically $0$, but $f(x) > 0$ for all $x \\ne 0$. The issue: $|f^{(n+1)}|$ grows super-exponentially between $0$ and $x$, so the remainder bound does not go to $0$.',
      'A function whose Taylor series converges to it everywhere is called analytic. All polynomials, $e^x$, $\\sin$, $\\cos$, rational functions (on their domains), and compositions thereof are analytic. Most functions encountered in practice are analytic, but the counterexample above shows this is a genuine condition, not an automatic property of being infinitely differentiable.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Analytic Function',
        body: 'A function $f$ is analytic at $c$ if its Taylor series centered at $c$ converges to $f(x)$ on some open interval around $c$. Equivalently: $R_n(x) \\to 0$ as $n \\to \\infty$ for $x$ near $c$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch5-004-ex1',
      title: 'Maclaurin Series for eˣ',
      problem: '\\text{Derive the Maclaurin series for } e^x \\text{ and verify it converges to } e^x \\text{ for all } x.',
      steps: [
        { expression: 'f^{(n)}(x) = e^x \\implies f^{(n)}(0) = 1 \\text{ for all } n', annotation: 'Every derivative of $e^x$ is $e^x$, evaluated at $0$ gives $1$.' },
        { expression: 'e^x = \\sum_{n=0}^{\\infty}\\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6} + \\cdots', annotation: 'Substitute into the Maclaurin formula: $a_n = f^{(n)}(0)/n! = 1/n!$.' },
        { expression: '|R_n(x)| \\le \\frac{e^{|x|}}{(n+1)!}|x|^{n+1} \\to 0 \\text{ as } n \\to \\infty', annotation: 'The factorial $(n+1)!$ grows faster than any power $|x|^{n+1}$.' },
      ],
      conclusion: '$e^x = \\sum x^n/n!$ for all $x \\in \\mathbb{R}$. Setting $x = 1$: $e = 1 + 1 + 1/2 + 1/6 + 1/24 + \\cdots$.',
    },
    {
      id: 'ch5-004-ex2',
      title: 'Maclaurin Series for sin(x)',
      problem: '\\text{Derive the Maclaurin series for } \\sin(x).',
      steps: [
        { expression: 'f = \\sin x: \\; f(0)=0,\\; f\'(0)=1,\\; f\'\'(0)=0,\\; f\'\'\'(0)=-1, \\ldots', annotation: 'Derivatives at $0$ cycle: $0, 1, 0, -1, 0, 1, 0, -1, \\ldots$' },
        { expression: '\\sin(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots = \\sum_{n=0}^{\\infty}\\frac{(-1)^n x^{2n+1}}{(2n+1)!}', annotation: 'Only odd-degree terms appear (even derivatives are $0$ at $x = 0$).' },
        { expression: '|R_n| \\le \\frac{|x|^{n+1}}{(n+1)!} \\to 0 \\text{ (since } |\\sin^{(k)}| \\le 1\\text{)}', annotation: 'All derivatives of $\\sin$ are bounded by $1$, so the remainder vanishes.' },
      ],
      conclusion: '$\\sin(x) = \\sum(-1)^n x^{2n+1}/(2n+1)!$ for all $x$. Differentiating gives the $\\cos$ series.',
    },
    {
      id: 'ch5-004-ex3',
      title: 'Taylor Series Error Bound',
      problem: '\\text{Use } T_4(x) \\text{ for } e^x \\text{ to approximate } e^{0.1}. \\text{ Bound the error.}',
      steps: [
        { expression: 'T_4(0.1) = 1 + 0.1 + \\frac{0.01}{2} + \\frac{0.001}{6} + \\frac{0.0001}{24} = 1.10517083\\ldots', annotation: 'Compute the degree-$4$ Taylor polynomial at $x = 0.1$.' },
        { expression: '|R_4(0.1)| \\le \\frac{e^{0.1}}{5!}(0.1)^5 \\le \\frac{1.2}{120}(10^{-5}) \\approx 10^{-7}', annotation: 'Use $e^{0.1} < 1.2$ (known bound). Error is less than $10^{-7}$.' },
      ],
      conclusion: '$e^{0.1} \\approx 1.10517$ with error less than $10^{-7}$. The exact value is $e^{0.1} = 1.10517091808\\ldots$. Four terms give seven decimal places of accuracy.',
    },
    {
      id: 'ch5-004-ex4',
      title: 'Computing a Limit via Taylor Series',
      problem: '\\text{Find } \\lim_{x\\to 0}\\frac{1 - \\cos x}{x^2}.',
      steps: [
        { expression: '\\cos x = 1 - \\frac{x^2}{2} + \\frac{x^4}{24} - \\cdots', annotation: 'Maclaurin series for $\\cos x$.' },
        { expression: '1 - \\cos x = \\frac{x^2}{2} - \\frac{x^4}{24} + \\cdots', annotation: 'Subtract from $1$.' },
        { expression: '\\frac{1-\\cos x}{x^2} = \\frac{1}{2} - \\frac{x^2}{24} + \\cdots \\to \\frac{1}{2}', annotation: 'Divide by $x^2$. All remaining terms vanish as $x \\to 0$.' },
      ],
      conclusion: 'The limit is $1/2$. Taylor series make limit computations mechanical — no need for L\'Hopital here.',
    },
    {
      id: 'ch5-004-ex5',
      title: 'Binomial Series: √(1+x)',
      problem: '\\text{Find the Maclaurin series for } \\sqrt{1+x}.',
      steps: [
        { expression: '(1+x)^{1/2} = \\sum_{n=0}^{\\infty}\\binom{1/2}{n}x^n', annotation: 'Binomial series with $k = 1/2$.' },
        { expression: '\\binom{1/2}{0}=1, \\; \\binom{1/2}{1}=\\frac{1}{2}, \\; \\binom{1/2}{2}=\\frac{(1/2)(-1/2)}{2!}=-\\frac{1}{8}', annotation: 'Compute the generalized binomial coefficients.' },
        { expression: '\\binom{1/2}{3} = \\frac{(1/2)(-1/2)(-3/2)}{3!} = \\frac{1}{16}', annotation: 'Each coefficient involves products of $(1/2 - k)$ terms.' },
        { expression: '\\sqrt{1+x} = 1 + \\frac{x}{2} - \\frac{x^2}{8} + \\frac{x^3}{16} - \\cdots, \\quad |x|<1', annotation: 'Radius of convergence is $1$.' },
      ],
      conclusion: '$\\sqrt{1+x} = 1 + x/2 - x^2/8 + x^3/16 - \\cdots$ for $|x|<1$. This extends the binomial theorem to non-integer exponents via infinite series.',
    },
  ],

  challenges: [
    {
      id: 'ch5-004-ch1',
      title: 'Taylor Series Centered at a ≠ 0',
      problem: 'Find the Taylor series for $\\ln(x)$ centered at $c = 1$.',
      hint: '$f^{(n)}(x) = (-1)^{n-1}(n-1)!/x^n$ for $n \\ge 1$.',
      walkthrough: [
        '$f(x) = \\ln x$. $f(1) = 0$. $f\'(x) = 1/x$, $f\'(1) = 1$.',
        '$f\'\'(x) = -1/x^2$, $f\'\'(1) = -1$. $f\'\'\'(x) = 2/x^3$, $f\'\'\'(1) = 2$.',
        '$f^{(n)}(1) = (-1)^{n-1}(n-1)!$ for $n \\ge 1$.',
        '$\\ln x = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}(n-1)!}{n!}(x-1)^n = \\sum_{n=1}^{\\infty}\\frac{(-1)^{n-1}}{n}(x-1)^n$.',
        '$= (x-1) - (x-1)^2/2 + (x-1)^3/3 - \\cdots$, valid for $0 < x \\le 2$.',
      ],
    },
    {
      id: 'ch5-004-ch2',
      title: 'How Many Terms for Given Accuracy?',
      problem: 'How many terms of the Maclaurin series for $\\cos(x)$ are needed to compute $\\cos(1)$ with error less than $10^{-6}$?',
      hint: 'This is an alternating series, so the error is bounded by the first omitted term.',
      walkthrough: [
        '$\\cos(1) = 1 - 1/2! + 1/4! - 1/6! + \\cdots$ (alternating, decreasing terms).',
        'By the AST error bound, the error after $n$ terms is at most $|a_{n+1}| = 1/(2(n+1))!$... more precisely, after keeping terms through $x^{2k}/(2k)!$, error $\\le 1/(2k+2)!$.',
        '$1/8! = 1/40320 \\approx 2.5 \\times 10^{-5}$. Too big.',
        '$1/10! = 1/3628800 \\approx 2.8 \\times 10^{-7} < 10^{-6}$. Sufficient.',
        'Need terms through $x^8/8!$, i.e., $5$ terms: $1 - 1/2 + 1/24 - 1/720 + 1/40320 \\approx 0.540302$.',
      ],
    },
    {
      id: 'ch5-004-ch3',
      title: 'Multiplying Taylor Series',
      problem: 'Find the first four nonzero terms of the Maclaurin series for $e^x \\sin x$.',
      hint: 'Multiply the series for $e^x$ and $\\sin x$ and collect terms by degree.',
      walkthrough: [
        '$e^x = 1 + x + x^2/2 + x^3/6 + \\cdots$',
        '$\\sin x = x - x^3/6 + \\cdots$',
        'Multiply (Cauchy product): degree $1$: $1 \\cdot x = x$. Degree $2$: $x \\cdot x = x^2$. Degree $3$: $x^2/2 \\cdot x + 1 \\cdot (-x^3/6) = x^3/2 - x^3/6 = x^3/3$.',
        'Degree $4$: $x^3/6 \\cdot x + x \\cdot (-x^3/6) = 0$... need $x^2/2 \\cdot 0 + \\cdots$. Actually degree $5$: collecting gives $-x^5/30$.',
        '$e^x \\sin x = x + x^2 + x^3/3 - x^5/30 + \\cdots$',
      ],
    },
  ],

  crossRefs: [
    { lessonSlug: 'power-series', label: 'Power Series', context: 'Taylor series are power series with coefficients from derivatives.' },
    { lessonSlug: 'series-applications', label: 'Series Applications', context: 'Use Taylor tools in physics, computing, probability, and differential equations.' },
    { lessonSlug: 'tangent-problem', label: 'The Tangent Problem', context: 'The degree-1 Taylor polynomial is exactly the tangent-line approximation.' },
    { lessonSlug: 'linear-approximation', label: 'Linear Approximation', context: 'Linearization is the first truncation of the Taylor expansion.' },
  ],

  checkpoints: [
    { id: 'ch5-004-cp1', prompt: 'Write the Maclaurin series for $e^x$, $\\sin x$, and $\\cos x$ from memory.', expectedInsight: '$e^x = \\sum x^n/n!$, $\\sin x = \\sum(-1)^n x^{2n+1}/(2n+1)!$, $\\cos x = \\sum(-1)^n x^{2n}/(2n)!$. All converge for all $x$.' },
    { id: 'ch5-004-cp2', prompt: 'State Taylor\'s Theorem with Lagrange remainder.', expectedInsight: '$f(x) = T_n(x) + R_n(x)$ where $R_n(x) = f^{(n+1)}(z)(x-c)^{n+1}/(n+1)!$ for some $z$ between $c$ and $x$.' },
    { id: 'ch5-004-cp3', prompt: 'How do you prove a Taylor series converges to $f(x)$?', expectedInsight: 'Show $R_n(x) \\to 0$ as $n \\to \\infty$. Typically bound $|f^{(n+1)}(z)|$ and show the resulting expression vanishes (often because $n!$ dominates $|x|^n$).' },
  ],
}
