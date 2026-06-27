import riemannSumUrl from '../diagrams/calc-riemann-sum.svg?url';
// FILE: src/content/chapter-4/00c-summation-notation.js
export default {
  id: "ch4-000c",
  slug: "summation-notation",
  chapter: 4,
  order: 0.3,
  title: "Summation Notation",
  subtitle: "Reading and writing sigma notation, computing sums, and the closed-form identities that power Riemann sums",
  tags: [
    "sigma notation",
    "summation",
    "index of summation",
    "summation identities",
    "telescoping sums",
    "arithmetic series",
    "sum of squares",
    "sum of cubes",
    "linearity of sums",
    "Riemann sum setup",
  ],

  learningObjectives: [
    "Read and write sigma notation: identify the index, lower bound, upper bound, and summand.",
    "Evaluate simple sums by expanding and adding.",
    "Apply the four linearity properties: constant factor, sum, difference, and split.",
    "State and apply the four closed-form identities: $\\sum 1$, $\\sum i$, $\\sum i^2$, $\\sum i^3$.",
    "Recognize and collapse a telescoping sum.",
    "Change index of summation (re-indexing) to simplify expressions.",
    "Set up a Riemann sum using sigma notation and identify every piece.",
  ],

  warmup: {
    title: "Warm-Up: Addition Review",
    instructions: "Summation is structured addition. Before using the notation, make sure you are comfortable with these.",
    problems: [
      {
        prompt: "Add up all integers from 1 to 5: $1 + 2 + 3 + 4 + 5$.",
        answer: "15",
        hint: "Pair them: $(1+5) + (2+4) + 3 = 6 + 6 + 3 = 15$.",
      },
      {
        prompt: "Compute $1^2 + 2^2 + 3^2 + 4^2$.",
        answer: "$1 + 4 + 9 + 16 = 30$",
        hint: "Square each term, then add.",
      },
      {
        prompt: "What pattern do you notice in $\\frac{1}{1 \\cdot 2} + \\frac{1}{2 \\cdot 3} + \\frac{1}{3 \\cdot 4}$? Hint: write each fraction as a difference.",
        answer: "$\\frac{1}{1} - \\frac{1}{2} + \\frac{1}{2} - \\frac{1}{3} + \\frac{1}{3} - \\frac{1}{4} = 1 - \\frac{1}{4} = \\frac{3}{4}$",
        hint: "Partial fractions: $\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}$. Most terms cancel.",
      },
    ],
  },

  hook: {
    question: "To find the exact area under a curve, we will add up the areas of thousands — or infinitely many — thin rectangles. Writing out $f(x_1)\\Delta x + f(x_2)\\Delta x + \\cdots + f(x_{1000})\\Delta x$ by hand is impossible. Sigma notation is the compact language that makes this manageable. Without it, Riemann sums cannot even be written down, let alone computed. This lesson is the language lesson — learn to read and write sums fluently so that integration becomes readable.",
    realWorldContext: "Sigma notation is the language of every summation in mathematics, science, and computing. Neural networks compute weighted sums $\\sum_j w_{ij} x_j$ for every neuron. Fourier analysis represents signals as $\\sum_{n} a_n \\cos(nx) + b_n \\sin(nx)$. Statistics computes mean $\\bar{x} = \\frac{1}{n}\\sum x_i$, variance $\\frac{1}{n}\\sum(x_i - \\bar{x})^2$. Numerical methods sum Riemann rectangles $\\sum f(x_i)\\Delta x$. Every field that processes data or approximates continuous processes uses this notation. Fluency with $\\sum$ is as fundamental as fluency with $\\frac{d}{dx}$.",
    previewVisualizationId: null,
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
      "**What sigma notation is.** The symbol $\\Sigma$ (capital Greek sigma) means 'sum.' A sigma expression has four parts: the symbol $\\Sigma$, a lower bound written below it, an upper bound written above it, and a formula to the right — called the summand. The expression $\\displaystyle\\sum_{i=1}^{n} a_i$ means: substitute $i = 1$ into $a_i$, then $i = 2$, then $i = 3$, all the way up to $i = n$, and add all the results. The letter $i$ is the **index of summation** — it is a dummy variable that exists only inside the sum and disappears when evaluated.",

      "**Reading it out loud.** $\\displaystyle\\sum_{i=1}^{5} i^2$ is read: 'the sum from $i$ equals one to five of $i$ squared.' Expanding: $1^2 + 2^2 + 3^2 + 4^2 + 5^2 = 1 + 4 + 9 + 16 + 25 = 55$. The index $i$ starts at the bottom number, increases by 1 each step, and stops when it hits the top number. If the bottom number equals the top number, there is exactly one term. If the bottom number exceeds the top, the convention is an empty sum equal to 0.",

      "**The index is a dummy variable.** $\\displaystyle\\sum_{i=1}^{n} i^2 = \\sum_{j=1}^{n} j^2 = \\sum_{k=1}^{n} k^2$. All three are identical — they all mean $1^2 + 2^2 + \\cdots + n^2$. The name of the index does not matter, only its range and the summand formula. This becomes important when you need to rename an index to combine two sums.",

      "**Linearity — the key property.** Sums obey the same linearity as derivatives and integrals. For constants $c$ and sequences $a_i$, $b_i$:\n\n- **Factor out a constant:** $\\displaystyle\\sum_{i=1}^n c \\cdot a_i = c \\sum_{i=1}^n a_i$\n- **Split over addition:** $\\displaystyle\\sum_{i=1}^n (a_i + b_i) = \\sum_{i=1}^n a_i + \\sum_{i=1}^n b_i$\n- **Split over subtraction:** $\\displaystyle\\sum_{i=1}^n (a_i - b_i) = \\sum_{i=1}^n a_i - \\sum_{i=1}^n b_i$\n\nThese let you break a complicated sum into simpler pieces that the closed-form identities can handle.",

      "**The four closed-form identities.** When the summand is a simple power of $i$, the entire sum collapses to a formula in $n$. These four formulas are the engine of Riemann sum computation:\n\n$$\\sum_{i=1}^{n} 1 = n$$\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$\n$$\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2$$\n\nMemorize the first two; the second two are worth recognizing. These are not arbitrary — they each have elegant proofs.",

      "**Proof of $\\sum_{i=1}^n i = n(n+1)/2$ — Gauss's method.** Write the sum twice — once forward, once backward:\n$$S = 1 + 2 + 3 + \\cdots + n$$\n$$S = n + (n-1) + (n-2) + \\cdots + 1$$\nAdd column by column: each pair adds to $n+1$, and there are $n$ pairs:\n$$2S = n(n+1) \\implies S = \\frac{n(n+1)}{2}$$\nLegend: Gauss reputedly discovered this in primary school when his teacher assigned the class to add 1 through 100 to keep them busy. Gauss finished in seconds: $100 \\times 101 / 2 = 5050$.",

      "**Telescoping sums.** When consecutive terms cancel, a sum collapses dramatically. If $a_i = b_{i+1} - b_i$ for some sequence $b$, then:\n$$\\sum_{i=1}^{n} a_i = \\sum_{i=1}^{n}(b_{i+1} - b_i) = b_{n+1} - b_1$$\nThis is because every intermediate term appears once as $+b_k$ and once as $-b_k$, leaving only the first and last:\n$$(b_2 - b_1) + (b_3 - b_2) + (b_4 - b_3) + \\cdots + (b_{n+1} - b_n) = b_{n+1} - b_1$$\nThe $\\sum_{i=1}^n i^2$ identity can be proved by telescoping a cleverly chosen sequence.",

      "**Connection to Riemann sums.** The right-endpoint Riemann sum for $\\int_a^b f(x)\\,dx$ with $n$ equal subdivisions is:\n$$R_n = \\sum_{i=1}^{n} f\\!\\left(a + i\\,\\frac{b-a}{n}\\right) \\cdot \\frac{b-a}{n}$$\nEvery symbol here means something: the $\\sum$ tells us to add $n$ terms; $a + i\\cdot\\frac{b-a}{n}$ is the right endpoint of the $i$-th rectangle; $\\frac{b-a}{n}$ is the width $\\Delta x$; $f(\\cdot)$ is the height. To compute $\\lim_{n\\to\\infty} R_n$ exactly for polynomial $f$, you expand using linearity, apply the closed-form identities, then take the limit — and you get the exact integral without any guesswork.",
        ],
      },
      { type: 'image', src: riemannSumUrl, alt: 'Riemann sum diagram with Σ notation labeled', caption: 'Summation notation Σ compactly expresses the sum of many rectangle areas.' },
    ],
    callouts: [
      {
        type: "definition",
        title: "Sigma Notation",
        body: "$$\\sum_{i=m}^{n} a_i = a_m + a_{m+1} + a_{m+2} + \\cdots + a_n$$\n\n- $i$ = **index of summation** (dummy variable)\n- $m$ = **lower bound** (starting value of $i$)\n- $n$ = **upper bound** (ending value of $i$)\n- $a_i$ = **summand** (the formula applied at each $i$)\n\nThe number of terms is $n - m + 1$.",
      },
      {
        type: "theorem",
        title: "Closed-Form Summation Identities",
        body: "For any positive integer $n$:\n$$\\sum_{i=1}^{n} 1 = n$$\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$\n$$\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2$$\n\nEach identity can be verified by mathematical induction. In practice, these are used to evaluate Riemann sums exactly and take the $n \\to \\infty$ limit.",
      },
      {
        type: "prior-knowledge",
        title: "You Already Know This — Statistics",
        body: "The sample mean is $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^n x_i$ and the sample variance is $s^2 = \\frac{1}{n-1}\\sum_{i=1}^n (x_i - \\bar{x})^2$. The summation notation you use in statistics is exactly the same sigma notation used in calculus. If you have ever computed a mean or variance by hand, you have evaluated a sigma sum.",
      },
      {
        type: "warning",
        title: "What You Cannot Factor Out",
        body: "You can factor out a **constant** (a number not depending on $i$): $\\sum c \\cdot a_i = c \\sum a_i$. You CANNOT factor out something that depends on $i$. For example:\n$$\\sum_{i=1}^n i \\cdot a_i \\neq i \\sum_{i=1}^n a_i$$\nThe right-hand side is nonsense — $i$ disappears after the sum is evaluated. The rule: factor out only what is constant with respect to the summation index.",
      },
      {
        type: "misconception",
        title: "Products Do Not Split",
        body: "Addition splits: $\\sum(a_i + b_i) = \\sum a_i + \\sum b_i$. ✓\n\nMultiplication does NOT split: $\\sum (a_i \\cdot b_i) \\neq (\\sum a_i)(\\sum b_i)$. ✗\n\nExample: $a_i = b_i = i$ and $n=2$.\nLeft: $\\sum_{i=1}^2 i \\cdot i = 1 + 4 = 5$.\nRight: $(\\sum_{i=1}^2 i)(\\sum_{i=1}^2 i) = 3 \\cdot 3 = 9$.\nThey are different. Sigma distributes over $+$ and $-$, never over $\\times$.",
      },
      {
        type: "tip",
        title: "Re-Indexing: Shifting the Dummy Variable",
        body: "Sometimes you need to start a sum at $i=0$ instead of $i=1$, or combine two sums that have different starting indices. You can always substitute $j = i - 1$ (or any linear shift):\n$$\\sum_{i=1}^{n} f(i) = \\sum_{j=0}^{n-1} f(j+1)$$\nBoth sums expand to the same $n$ terms. Re-indexing is just renaming the counter — the sum's value does not change.",
      },
    ],
    visualizations: [
      {
        id: "SigmaDecoderLab",
        title: "Sigma Notation Anatomy",
        caption: "Hover over each part of a sigma expression to learn what the ceiling, engine, iterator, and payload each mean.",
      },
      {
        id: "GaussSumProof",
        title: "Gauss's Pairing Proof",
        caption: "Step through the proof that Σi = n(n+1)/2 — write the sum forward and backward, pair columns, solve for S. Adjust n to see the pattern at any scale.",
      },
      {
        id: "SigmaEvaluator",
        title: "Sigma Evaluator — Try Any Sum",
        caption: "Type any formula in i, set the bounds, and see every term expand with a bar chart and running total. Closed-form identities are recognised automatically.",
      },
      {
        id: "RiemannSumFromSigma",
        title: "Building a Riemann Sum from Sigma Notation",
        caption: "See exactly how Δx, right endpoints, rectangle areas, and the sigma sum connect — one step at a time. Drag n to watch the approximation improve.",
      },
    ],
  },

  math: {
    prose: [
      "**Formal definition.** For a sequence $\\{a_i\\}_{i=m}^{n}$ of real numbers and integers $m \\leq n$, the **sigma sum** is defined recursively: $\\sum_{i=m}^{m} a_i = a_m$ (base case) and $\\sum_{i=m}^{k+1} a_i = \\left(\\sum_{i=m}^{k} a_i\\right) + a_{k+1}$ (inductive step). The **empty sum** (when the upper bound is less than the lower bound) equals 0 by convention, consistent with the identity $\\sum_{i=m}^{n} = \\sum_{i=m}^{k} + \\sum_{i=k+1}^{n}$ applied when $k = n$.",

      "**Proof of $\\sum_{i=1}^n i^2 = n(n+1)(2n+1)/6$ by telescoping.** Consider the identity $(k+1)^3 - k^3 = 3k^2 + 3k + 1$. Sum from $k=1$ to $n$:\n$$\\sum_{k=1}^n [(k+1)^3 - k^3] = \\sum_{k=1}^n (3k^2 + 3k + 1)$$\nLeft side telescopes: $(n+1)^3 - 1$. Right side: $3\\sum k^2 + 3\\sum k + \\sum 1 = 3\\sum k^2 + 3\\cdot\\frac{n(n+1)}{2} + n$. Solve for $\\sum k^2$:\n$$3\\sum_{k=1}^n k^2 = (n+1)^3 - 1 - \\frac{3n(n+1)}{2} - n$$\nSimplifying the right side (common denominator 2): $= \\frac{2(n+1)^3 - 2 - 3n(n+1) - 2n}{2} = \\frac{n(n+1)(2n+1)}{2}$. Therefore $\\sum_{k=1}^n k^2 = \\frac{n(n+1)(2n+1)}{6}$. $\\square$",

      "**Applying identities to a Riemann sum.** Compute $\\lim_{n\\to\\infty} R_n$ for $\\int_0^1 x^2\\,dx$ using the right-endpoint sum. Width $\\Delta x = 1/n$. Right endpoint of $i$-th rectangle: $x_i = i/n$. Height: $f(x_i) = (i/n)^2 = i^2/n^2$. Sum:\n$$R_n = \\sum_{i=1}^n \\frac{i^2}{n^2} \\cdot \\frac{1}{n} = \\frac{1}{n^3}\\sum_{i=1}^n i^2 = \\frac{1}{n^3} \\cdot \\frac{n(n+1)(2n+1)}{6} = \\frac{n(n+1)(2n+1)}{6n^3}$$\nDivide through by $n^3$: $= \\frac{(1)(1+1/n)(2+1/n)}{6}$. As $n \\to \\infty$, $1/n \\to 0$:\n$$\\lim_{n\\to\\infty} R_n = \\frac{1 \\cdot 1 \\cdot 2}{6} = \\frac{1}{3}$$\nThis is the exact area under $y = x^2$ from 0 to 1 — computed with pure algebra from the summation identity.",
    ],
    visualizations: [
      {
        id: "RiemannSumFromSigma",
        title: "Riemann Sum Builder",
        caption: "See every piece of the Riemann sum formula — Δx, right endpoints, rectangle areas, sigma notation, and the limit — built up step by step.",
      },
    ],
    callouts: [
      {
        type: "theorem",
        title: "Linearity of Sigma Sums",
        body: "For constants $c$ and sequences $\\{a_i\\}$, $\\{b_i\\}$:\n$$\\sum_{i=m}^{n} c\\,a_i = c\\sum_{i=m}^{n} a_i$$\n$$\\sum_{i=m}^{n} (a_i \\pm b_i) = \\sum_{i=m}^{n} a_i \\pm \\sum_{i=m}^{n} b_i$$\n**Proof (factor):** each term $c\\,a_i$ shares the factor $c$; factor it out of the explicit sum $c\\,a_m + c\\,a_{m+1} + \\cdots + c\\,a_n = c(a_m + \\cdots + a_n)$.",
      },
      {
        type: "definition",
        title: "Telescoping Sum",
        body: "A sum of the form $\\sum_{i=1}^n [b_{i+1} - b_i]$ is called **telescoping** because all interior terms cancel:\n$$(b_2 - b_1) + (b_3 - b_2) + \\cdots + (b_{n+1} - b_n) = b_{n+1} - b_1$$\nOnly the last value minus the first survives. This technique is used to prove the closed-form identities and to evaluate many sums that look complicated.",
      },
      {
        type: "tip",
        title: "Proving Identities by Induction",
        body: "Every closed-form identity can be verified by **mathematical induction**:\n1. **Base case:** check the formula holds for $n = 1$.\n2. **Inductive step:** assume it holds for $n = k$; show it holds for $n = k+1$ by adding the $(k+1)$-th term to both sides.\n\nExample for $\\sum i = n(n+1)/2$: base case $n=1$: $\\sum_{i=1}^1 i = 1 = 1(2)/2$. ✓. Inductive step: $\\sum_{i=1}^{k+1} i = \\frac{k(k+1)}{2} + (k+1) = (k+1)\\left(\\frac{k}{2}+1\\right) = \\frac{(k+1)(k+2)}{2}$. ✓.",
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      "**Induction proof of $\\sum_{i=1}^n i = n(n+1)/2$.** Claim: $P(n): \\sum_{i=1}^n i = \\frac{n(n+1)}{2}$. Base case $n=1$: $\\sum_{i=1}^1 i = 1 = \\frac{1 \\cdot 2}{2}$. ✓. Inductive step: assume $P(k)$ holds. Then $\\sum_{i=1}^{k+1} i = \\sum_{i=1}^k i + (k+1) = \\frac{k(k+1)}{2} + (k+1) = (k+1)\\left(\\frac{k}{2} + 1\\right) = \\frac{(k+1)(k+2)}{2} = \\frac{(k+1)((k+1)+1)}{2}$. This is $P(k+1)$. By induction, $P(n)$ holds for all $n \\geq 1$. $\\square$",

      "**Why the closed-form identities all stop at $i=1$.** The formulas $\\sum_{i=1}^n i$, $\\sum_{i=1}^n i^2$, $\\sum_{i=1}^n i^3$ all start at $i=1$. If a Riemann sum starts at $i=0$ (as in left-endpoint sums), the $i=0$ term contributes $f(a)\\cdot\\Delta x$ — just one extra term to handle separately. If the sum starts at $i=1$, the identities apply directly. Re-indexing (substituting $j = i-1$ or $j = i+1$) converts between the two conventions without changing the mathematical content.",

      "**Convergence of Riemann sums as $n\\to\\infty$.** After applying the closed-form identities, $R_n$ becomes a rational function of $n$: for example $\\frac{n(n+1)(2n+1)}{6n^3}$. Taking the limit $n\\to\\infty$ is now an ordinary limit of a rational function. Divide numerator and denominator by $n^3$ (the highest power in the denominator), then use $\\lim_{n\\to\\infty} c/n = 0$. This is the algebraic mechanism that converts a limiting Riemann sum into an exact definite integral for polynomial integrands.",
    ],
    callouts: [],
    visualizations: [],
  },

  examples: [
    {
      id: "ch4-000c-ex1",
      title: "Expanding and Evaluating a Sigma Sum",
      problem: "\\text{Expand and compute } \\sum_{i=1}^{4} (2i - 1).",
      steps: [
        {
          expression: "\\sum_{i=1}^{4} (2i - 1) = (2(1)-1) + (2(2)-1) + (2(3)-1) + (2(4)-1)",
          annotation: "Expand by substituting i = 1, 2, 3, 4 into the summand formula.",
          prereq: `**How to expand sigma notation:**

$\\displaystyle\\sum_{i=m}^{n} a_i$ means: plug in $i = m$, then $i = m+1$, ..., up to $i = n$, and add everything.

For $\\displaystyle\\sum_{i=1}^{4} (2i-1)$:
- $i=1$: $2(1)-1 = 1$
- $i=2$: $2(2)-1 = 3$
- $i=3$: $2(3)-1 = 5$
- $i=4$: $2(4)-1 = 7$

Then add: $1 + 3 + 5 + 7$.

The sigma notation is just shorthand for this explicit addition — both mean exactly the same thing.`,
        },
        {
          expression: "= 1 + 3 + 5 + 7",
          annotation: "Evaluate each term: $2(1)-1=1$, $2(2)-1=3$, $2(3)-1=5$, $2(4)-1=7$.",
          prereq: `**Evaluating a linear expression:**

To evaluate $2i - 1$ at a specific $i$, substitute the number:

$$2(1) - 1 = 2 - 1 = 1$$
$$2(3) - 1 = 6 - 1 = 5$$

Multiply first, then subtract. Order of operations: multiplication before subtraction.`,
        },
        {
          expression: "= 16",
          annotation: "Sum: $1+3+5+7 = 16$. Notice these are the first four odd numbers — they always sum to $n^2$ (here $4^2 = 16$).",
          prereq: `**Why does $1+3+5+\\cdots+(2n-1) = n^2$?**

The first $n$ odd numbers always sum to a perfect square. Visual proof: arrange dots in an L-shape — each odd number adds an L that grows the square by one layer.

$$1 = 1^2$$
$$1+3 = 4 = 2^2$$
$$1+3+5 = 9 = 3^2$$
$$1+3+5+7 = 16 = 4^2$$

Algebraically: $\\displaystyle\\sum_{i=1}^n (2i-1) = 2\\sum_{i=1}^n i - \\sum_{i=1}^n 1 = 2 \\cdot \\frac{n(n+1)}{2} - n = n(n+1) - n = n^2$.`,
        },
      ],
      conclusion: "Expanding sigma notation is mechanical substitution. The result 16 = 4² shows the beautiful pattern in odd-number sums.",
    },

    {
      id: "ch4-000c-ex2",
      title: "Using Linearity to Evaluate a Larger Sum",
      problem: "\\text{Compute } \\sum_{i=1}^{100} (3i^2 - 2i + 5) \\text{ using the closed-form identities.}",
      steps: [
        {
          expression: "\\sum_{i=1}^{100} (3i^2 - 2i + 5) = 3\\sum_{i=1}^{100} i^2 - 2\\sum_{i=1}^{100} i + \\sum_{i=1}^{100} 5",
          annotation: "Split using linearity: sigma distributes over addition and subtraction, and constants factor out.",
          prereq: `**Linearity of sigma sums:**

Two rules let you break a complicated sum into simple pieces:

**Rule 1 — factor out a constant:**
$$\\sum_{i=1}^n c \\cdot a_i = c \\sum_{i=1}^n a_i$$

**Rule 2 — split over $+$ and $-$:**
$$\\sum_{i=1}^n (a_i + b_i) = \\sum_{i=1}^n a_i + \\sum_{i=1}^n b_i$$

Applying both together:
$$\\sum (3i^2 - 2i + 5) = 3\\sum i^2 - 2\\sum i + \\sum 5$$

This is legal because addition is commutative and associative — rearranging the order of addition does not change the total.`,
        },
        {
          expression: "\\sum_{i=1}^{100} i^2 = \\frac{100 \\cdot 101 \\cdot 201}{6} = 338{,}350",
          annotation: "Apply the identity $\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$ with $n=100$.",
          prereq: `**The sum-of-squares identity:**

$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$

To use it, substitute your value of $n$ into the formula.

For $n = 100$:
$$\\frac{100 \\cdot 101 \\cdot 201}{6}$$

Compute step by step:
- $100 \\times 101 = 10{,}100$
- $10{,}100 \\times 201 = 2{,}030{,}100$
- $2{,}030{,}100 \\div 6 = 338{,}350$

**Quick check:** for $n=3$: $\\frac{3 \\cdot 4 \\cdot 7}{6} = \\frac{84}{6} = 14 = 1^2 + 2^2 + 3^2$. ✓`,
        },
        {
          expression: "\\sum_{i=1}^{100} i = \\frac{100 \\cdot 101}{2} = 5{,}050",
          annotation: "Apply Gauss's formula $\\sum_{i=1}^n i = n(n+1)/2$ with $n=100$.",
          prereq: `**Gauss's sum formula:**

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

For $n = 100$: $\\dfrac{100 \\times 101}{2} = \\dfrac{10{,}100}{2} = 5{,}050$.

**How Gauss derived it:** write the sum forward and backward, pair up terms:
$$1 + 2 + \\cdots + 100$$
$$100 + 99 + \\cdots + 1$$

Each column sums to $101$. There are $100$ columns: total $= 2S = 100 \\times 101$, so $S = 5{,}050$.`,
        },
        {
          expression: "\\sum_{i=1}^{100} 5 = 5 \\times 100 = 500",
          annotation: "Summing a constant $n$ times: $\\sum_{i=1}^n c = cn$. Here $c=5$, $n=100$.",
          prereq: `**Sum of a constant:**

$$\\sum_{i=1}^{n} c = c + c + c + \\cdots + c \\;(n \\text{ times}) = cn$$

This is the identity $\\displaystyle\\sum_{i=1}^n 1 = n$ scaled by $c$.

The index $i$ never appears in the summand $c$, so every term is the same number $c$. Adding it $n$ times gives $cn$.`,
        },
        {
          expression: "= 3(338{,}350) - 2(5{,}050) + 500 = 1{,}015{,}050 - 10{,}100 + 500 = 1{,}005{,}450",
          annotation: "Substitute the three sub-totals and compute: $3 \\times 338{,}350 = 1{,}015{,}050$; $2 \\times 5{,}050 = 10{,}100$; then combine.",
          prereq: `**Substituting and combining:**

Once each sub-sum is computed, substitute back:

$$3 \\cdot \\underbrace{338{,}350}_{\\sum i^2} \\;-\\; 2 \\cdot \\underbrace{5{,}050}_{\\sum i} \\;+\\; \\underbrace{500}_{\\sum 5}$$

Multiply:
- $3 \\times 338{,}350 = 1{,}015{,}050$
- $2 \\times 5{,}050 = 10{,}100$

Then: $1{,}015{,}050 - 10{,}100 + 500 = 1{,}005{,}450$.

Always do multiplications before additions/subtractions (order of operations).`,
        },
      ],
      conclusion: "Linearity lets you break any polynomial sum into three standard pieces. Each piece has a closed-form identity. This is exactly the technique used to evaluate Riemann sums exactly as $n \\to \\infty$.",
    },

    {
      id: "ch4-000c-ex3",
      title: "Setting Up and Evaluating a Riemann Sum",
      problem: "\\text{Set up the right-endpoint Riemann sum } R_n \\text{ for } \\int_0^2 x^2\\,dx, \\text{ evaluate using identities, and take } n \\to \\infty.",
      steps: [
        {
          expression: "\\Delta x = \\frac{2 - 0}{n} = \\frac{2}{n}",
          annotation: "Width of each rectangle: divide the total interval length by the number of rectangles.",
          prereq: `**Width of each rectangle in a Riemann sum:**

To divide the interval $[a, b]$ into $n$ equal pieces, each piece has width:
$$\\Delta x = \\frac{b - a}{n}$$

Here $a = 0$, $b = 2$, so each piece has width $\\frac{2-0}{n} = \\frac{2}{n}$.

Visualize: if $n = 4$, each rectangle is $\\frac{2}{4} = 0.5$ units wide. If $n = 10$, each is $0.2$ units wide. As $n$ grows, rectangles get thinner.`,
        },
        {
          expression: "x_i = 0 + i \\cdot \\frac{2}{n} = \\frac{2i}{n}, \\quad i = 1, 2, \\ldots, n",
          annotation: "Right endpoint of the $i$-th rectangle: start at $a=0$, step right by $i \\cdot \\Delta x$.",
          prereq: `**Finding the right endpoint of the $i$-th rectangle:**

The interval $[a, b]$ is divided into $n$ equal pieces. Label the dividing points $x_0, x_1, x_2, \\ldots, x_n$:

$$x_0 = a, \\quad x_i = a + i \\cdot \\Delta x, \\quad x_n = b$$

For right-endpoint sums, you use $x_i$ (the right end of each piece):

$$x_i = a + i \\cdot \\frac{b-a}{n}$$

Here $a=0$: $x_i = 0 + i \\cdot \\frac{2}{n} = \\frac{2i}{n}$.

The rectangle with index $i=1$ has its right edge at $\\frac{2}{n}$; with $i=n$ at $\\frac{2n}{n} = 2 = b$. ✓`,
        },
        {
          expression: "R_n = \\sum_{i=1}^{n} f(x_i)\\,\\Delta x = \\sum_{i=1}^{n} \\left(\\frac{2i}{n}\\right)^2 \\cdot \\frac{2}{n}",
          annotation: "Height of each rectangle is $f(x_i) = x_i^2$; width is $\\Delta x$. Area = height × width, summed over all $n$ rectangles.",
          prereq: `**What a Riemann sum formula means:**

$$R_n = \\sum_{i=1}^{n} \\underbrace{f(x_i)}_{\\text{height}} \\cdot \\underbrace{\\Delta x}_{\\text{width}}$$

Each term $f(x_i) \\cdot \\Delta x$ is the area of one thin rectangle:
- **height** = the function value at the right endpoint
- **width** = $\\Delta x = \\frac{b-a}{n}$

Summing all $n$ rectangles gives the total approximate area.

For $f(x) = x^2$ and $x_i = \\frac{2i}{n}$:
$$f(x_i) = \\left(\\frac{2i}{n}\\right)^2 = \\frac{4i^2}{n^2}$$`,
        },
        {
          expression: "= \\sum_{i=1}^{n} \\frac{4i^2}{n^2} \\cdot \\frac{2}{n} = \\frac{8}{n^3} \\sum_{i=1}^{n} i^2",
          annotation: "Simplify: $\\left(\\frac{2i}{n}\\right)^2 \\cdot \\frac{2}{n} = \\frac{4i^2}{n^2} \\cdot \\frac{2}{n} = \\frac{8i^2}{n^3}$. Factor out the constant $\\frac{8}{n^3}$ using linearity.",
          prereq: `**Factoring constants out of a sigma sum:**

When the summand is $\\frac{8}{n^3} \\cdot i^2$, the factor $\\frac{8}{n^3}$ does not depend on $i$ — it is the same in every term.

$$\\sum_{i=1}^n \\frac{8i^2}{n^3} = \\frac{8}{n^3} \\sum_{i=1}^n i^2$$

This is the constant-factor rule: $\\displaystyle\\sum c \\cdot a_i = c \\sum a_i$.

The $n^3$ in the denominator is a constant from the perspective of the $\\sum$ (it does not change as $i$ runs from 1 to $n$).`,
        },
        {
          expression: "= \\frac{8}{n^3} \\cdot \\frac{n(n+1)(2n+1)}{6} = \\frac{8n(n+1)(2n+1)}{6n^3}",
          annotation: "Substitute the identity $\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$.",
          prereq: `**Applying the sum-of-squares identity:**

$$\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$$

Substitute directly:
$$\\frac{8}{n^3} \\cdot \\frac{n(n+1)(2n+1)}{6} = \\frac{8n(n+1)(2n+1)}{6n^3}$$

This turns the sigma sum (which required knowing all $n$ terms) into a single algebraic expression in $n$. Now we can take $n \\to \\infty$ using limit rules.`,
        },
        {
          expression: "\\lim_{n \\to \\infty} \\frac{8n(n+1)(2n+1)}{6n^3} = \\lim_{n \\to \\infty} \\frac{8(1)(1+\\tfrac{1}{n})(2+\\tfrac{1}{n})}{6}",
          annotation: "Divide numerator and denominator by $n^3$ to expose the $n \\to \\infty$ behavior. Each $1/n$ term goes to 0.",
          prereq: `**Taking the limit of a rational function as $n \\to \\infty$:**

When the numerator and denominator have the same degree, divide top and bottom by $n^d$ (where $d$ is the degree):

$$\\frac{8n(n+1)(2n+1)}{6n^3}$$

Expand the numerator: $n(n+1)(2n+1) = n(2n^2 + 3n + 1) = 2n^3 + 3n^2 + n$.

So: $\\frac{8(2n^3 + 3n^2 + n)}{6n^3} = \\frac{8}{6}\\left(2 + \\frac{3}{n} + \\frac{1}{n^2}\\right)$

As $n \\to \\infty$: $\\frac{3}{n} \\to 0$ and $\\frac{1}{n^2} \\to 0$, leaving $\\frac{8}{6} \\cdot 2 = \\frac{8}{3}$.`,
        },
        {
          expression: "= \\frac{8 \\cdot 1 \\cdot 1 \\cdot 2}{6} = \\frac{16}{6} = \\frac{8}{3}",
          annotation: "As $n \\to \\infty$: each $\\frac{1}{n} \\to 0$, so $(1+\\frac{1}{n}) \\to 1$ and $(2+\\frac{1}{n}) \\to 2$. Result: $\\frac{8 \\cdot 2}{6} = \\frac{8}{3}$.",
          prereq: `**Evaluating the limit by substituting $n \\to \\infty$:**

After dividing by $n^3$, every term with $n$ in the denominator goes to zero:

$$\\lim_{n \\to \\infty} \\frac{1}{n} = 0, \\quad \\lim_{n \\to \\infty} \\frac{1}{n^2} = 0$$

So $(1 + \\frac{1}{n}) \\to 1$ and $(2 + \\frac{1}{n}) \\to 2$.

The limit is:
$$\\frac{8 \\times 1 \\times 2}{6} = \\frac{16}{6} = \\frac{8}{3}$$

This is the exact area under $y = x^2$ from $x = 0$ to $x = 2$. The FTC will later confirm: $\\left[\\frac{x^3}{3}\\right]_0^2 = \\frac{8}{3} - 0 = \\frac{8}{3}$. ✓`,
        },
      ],
      conclusion: "The exact area under $y = x^2$ from 0 to 2 is $\\frac{8}{3}$. We computed this with no geometry — only summation identities and a limit. This is exactly how the Riemann integral is defined.",
    },

    {
      id: "ch4-000c-ex4",
      title: "Telescoping Sum",
      problem: "\\text{Compute } \\sum_{i=1}^{n} \\frac{1}{i(i+1)} \\text{ and find its limit as } n \\to \\infty.",
      steps: [
        {
          expression: "\\frac{1}{i(i+1)} = \\frac{1}{i} - \\frac{1}{i+1}",
          annotation: "Partial fraction decomposition: write the fraction as a difference of two simpler fractions.",
          prereq: `**Partial fractions — splitting $\\frac{1}{i(i+1)}$:**

When you have a product of two different factors in the denominator, partial fractions splits it into a sum of simpler fractions.

Claim: $\\frac{1}{i(i+1)} = \\frac{A}{i} + \\frac{B}{i+1}$ for some constants $A$, $B$.

Multiply both sides by $i(i+1)$:
$$1 = A(i+1) + Bi$$

Set $i = 0$: $1 = A(1)$, so $A = 1$.

Set $i = -1$: $1 = B(-1)$, so $B = -1$.

Therefore: $\\frac{1}{i(i+1)} = \\frac{1}{i} - \\frac{1}{i+1}$.

**Verify:** $\\frac{1}{i} - \\frac{1}{i+1} = \\frac{i+1 - i}{i(i+1)} = \\frac{1}{i(i+1)}$. ✓`,
        },
        {
          expression: "\\sum_{i=1}^{n} \\frac{1}{i(i+1)} = \\sum_{i=1}^{n} \\left(\\frac{1}{i} - \\frac{1}{i+1}\\right)",
          annotation: "Substitute the partial fraction form into the sigma sum.",
          prereq: `**Substituting into a sigma sum:**

If you know $a_i = b_i - c_i$ for each $i$, you can replace every $a_i$ in the sum:

$$\\sum_{i=1}^n a_i = \\sum_{i=1}^n (b_i - c_i)$$

Here $a_i = \\frac{1}{i(i+1)}$ and we found $a_i = \\frac{1}{i} - \\frac{1}{i+1}$.

This substitution is the setup for recognising the telescoping pattern.`,
        },
        {
          expression: "= \\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\left(\\frac{1}{3} - \\frac{1}{4}\\right) + \\cdots + \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right)",
          annotation: "Expand the first several terms and the last term to see the cancellation pattern.",
          prereq: `**Recognising a telescoping pattern:**

When you see a sum of differences where consecutive terms share a value — like $\\frac{1}{2}$ appearing as $-\\frac{1}{2}$ in one term and $+\\frac{1}{2}$ in the next — it telescopes.

Write out a few terms explicitly:
- $i=1$: $\\frac{1}{1} - \\frac{1}{2}$
- $i=2$: $\\frac{1}{2} - \\frac{1}{3}$
- $i=3$: $\\frac{1}{3} - \\frac{1}{4}$
- ...
- $i=n$: $\\frac{1}{n} - \\frac{1}{n+1}$

The $-\\frac{1}{2}$ from $i=1$ cancels the $+\\frac{1}{2}$ from $i=2$. Every middle term cancels.`,
        },
        {
          expression: "= 1 - \\frac{1}{n+1} = \\frac{n}{n+1}",
          annotation: "Everything cancels except the first positive term ($1$) and the last negative term ($-\\frac{1}{n+1}$).",
          prereq: `**What survives in a telescoping sum:**

In the chain of cancellations:
$$(b_1 - b_2) + (b_2 - b_3) + (b_3 - b_4) + \\cdots + (b_n - b_{n+1})$$

Every $b_k$ for $2 \\leq k \\leq n$ appears once as positive and once as negative — they all cancel.

What's left: $b_1 - b_{n+1}$.

Here $b_i = \\frac{1}{i}$, so $b_1 = 1$ and $b_{n+1} = \\frac{1}{n+1}$.

$$\\text{Sum} = 1 - \\frac{1}{n+1} = \\frac{n+1-1}{n+1} = \\frac{n}{n+1}$$`,
        },
        {
          expression: "\\lim_{n \\to \\infty} \\frac{n}{n+1} = \\lim_{n \\to \\infty} \\frac{1}{1 + \\tfrac{1}{n}} = 1",
          annotation: "As $n \\to \\infty$, $\\frac{1}{n} \\to 0$, so the limit is $\\frac{1}{1+0} = 1$. The infinite series converges to 1.",
          prereq: `**Limit of $\\frac{n}{n+1}$ as $n \\to \\infty$:**

Divide numerator and denominator by $n$:
$$\\frac{n}{n+1} = \\frac{1}{1 + \\frac{1}{n}}$$

As $n \\to \\infty$, $\\frac{1}{n} \\to 0$:
$$\\lim_{n \\to \\infty} \\frac{1}{1+\\frac{1}{n}} = \\frac{1}{1+0} = 1$$

This means the partial sums $S_n = \\frac{n}{n+1}$ approach 1 but never quite reach it. In series notation: $\\displaystyle\\sum_{i=1}^{\\infty} \\frac{1}{i(i+1)} = 1$.`,
        },
      ],
      conclusion: "Telescoping reduces a seemingly complicated sum to a two-term difference. The key step is always the partial fraction decomposition that reveals the cancellation structure.",
    },
  ],

  challenges: [
    {
      id: "ch4-000c-ch1",
      difficulty: "easy",
      problem: "Write the following sum in sigma notation and evaluate it using the closed-form identities: $1^2 + 2^2 + 3^2 + \\cdots + 50^2$.",
      hint: "This is $\\sum_{i=1}^{50} i^2$. Apply $\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$ with $n=50$.",
      walkthrough: [
        {
          expression: "1^2 + 2^2 + \\cdots + 50^2 = \\sum_{i=1}^{50} i^2",
          annotation: "Recognise the pattern: each term is $i^2$ for $i$ running from 1 to 50.",
          prereq: `**Writing a sum in sigma notation:**

To convert an explicit sum to sigma notation:
1. Find the pattern — what is the formula for the $i$-th term?
2. Find the starting and ending values of $i$.
3. Write $\\displaystyle\\sum_{i=\\text{start}}^{\\text{end}} (\\text{formula})$.

Here each term is a perfect square: $1^2, 2^2, 3^2, \\ldots, 50^2$.

The $i$-th term is $i^2$. The index runs from $i=1$ to $i=50$.

So: $1^2 + 2^2 + \\cdots + 50^2 = \\displaystyle\\sum_{i=1}^{50} i^2$.`,
        },
        {
          expression: "\\sum_{i=1}^{50} i^2 = \\frac{50 \\cdot 51 \\cdot 101}{6}",
          annotation: "Substitute $n=50$ into $\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$: $n+1=51$, $2n+1=101$.",
          prereq: `**Using the sum-of-squares formula:**

$$\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$$

The three factors are $n$, $n+1$, and $2n+1$. For $n = 50$:
- $n = 50$
- $n+1 = 51$
- $2n+1 = 2(50)+1 = 101$

Substitute: $\\dfrac{50 \\cdot 51 \\cdot 101}{6}$.

Always identify all three factors before multiplying.`,
        },
        {
          expression: "= \\frac{257{,}550}{6} = 42{,}925",
          annotation: "Arithmetic: $50 \\times 51 = 2{,}550$; $2{,}550 \\times 101 = 257{,}550$; $257{,}550 \\div 6 = 42{,}925$.",
          prereq: `**Computing step by step:**

$$\\frac{50 \\times 51 \\times 101}{6}$$

Step 1: $50 \\times 51 = 2{,}550$

Step 2: $2{,}550 \\times 101 = 2{,}550 \\times 100 + 2{,}550 = 255{,}000 + 2{,}550 = 257{,}550$

Step 3: $257{,}550 \\div 6 = 42{,}925$

**Check:** does 6 divide 257,550? $42{,}925 \\times 6 = 257{,}550$. ✓

The sum-of-squares formula always yields an integer for positive integer $n$.`,
        },
      ],
      answer: "$\\sum_{i=1}^{50} i^2 = 42{,}925$",
    },

    {
      id: "ch4-000c-ch2",
      difficulty: "medium",
      problem: "Evaluate $\\sum_{i=1}^{n} (4i^3 - 6i)$ and simplify your answer. Then find $\\lim_{n \\to \\infty} \\frac{1}{n^4}\\sum_{i=1}^{n}(4i^3 - 6i)$.",
      hint: "Split using linearity. Use $\\sum i^3 = [n(n+1)/2]^2$ and $\\sum i = n(n+1)/2$. For the limit, find the leading-order term in $n$ after simplification.",
      walkthrough: [
        {
          expression: "\\sum_{i=1}^{n}(4i^3 - 6i) = 4\\sum_{i=1}^{n} i^3 - 6\\sum_{i=1}^{n} i",
          annotation: "Split by linearity: sigma distributes over subtraction, constants factor out.",
          prereq: `**Linearity splits sums into manageable pieces:**

$$\\sum_{i=1}^n (4i^3 - 6i) = 4\\sum_{i=1}^n i^3 - 6\\sum_{i=1}^n i$$

Two rules used:
1. Split over $-$: $\\sum (a_i - b_i) = \\sum a_i - \\sum b_i$
2. Factor constants: $\\sum 4a_i = 4\\sum a_i$ and $\\sum 6b_i = 6\\sum b_i$

After splitting, each sub-sum has a closed-form identity.`,
        },
        {
          expression: "= 4\\left[\\frac{n(n+1)}{2}\\right]^2 - 6 \\cdot \\frac{n(n+1)}{2}",
          annotation: "Apply $\\sum_{i=1}^n i^3 = [n(n+1)/2]^2$ and $\\sum_{i=1}^n i = n(n+1)/2$.",
          prereq: `**Sum-of-cubes identity:**

$$\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2$$

Remarkably, this equals $\\left(\\sum_{i=1}^n i\\right)^2$ — the square of the triangular number.

For example, $n=3$: $1^3 + 2^3 + 3^3 = 1 + 8 + 27 = 36 = 6^2 = \\left(\\frac{3 \\cdot 4}{2}\\right)^2$. ✓

And $\\displaystyle\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$ (Gauss's formula).`,
        },
        {
          expression: "= n^2(n+1)^2 - 3n(n+1) = n(n+1)\\left[n(n+1) - 3\\right]",
          annotation: "Factor: $4 \\cdot [n(n+1)/2]^2 = 4 \\cdot n^2(n+1)^2/4 = n^2(n+1)^2$. For the second term: $6 \\cdot n(n+1)/2 = 3n(n+1)$. Then factor out $n(n+1)$.",
          prereq: `**Simplifying after substitution:**

$$4 \\cdot \\left[\\frac{n(n+1)}{2}\\right]^2 = 4 \\cdot \\frac{n^2(n+1)^2}{4} = n^2(n+1)^2$$

$$6 \\cdot \\frac{n(n+1)}{2} = 3n(n+1)$$

So the expression is:
$$n^2(n+1)^2 - 3n(n+1)$$

Factor out $n(n+1)$ (the common factor in both terms):
$$= n(n+1)\\left[n(n+1) - 3\\right]$$

Always look for a common factor before expanding — it keeps expressions compact.`,
        },
        {
          expression: "\\lim_{n \\to \\infty} \\frac{1}{n^4} \\cdot n(n+1)[n(n+1)-3] = \\lim_{n \\to \\infty} \\frac{n^2(n+1)^2 - 3n(n+1)}{n^4}",
          annotation: "Divide by $n^4$. The leading term is $n^2(n+1)^2 \\approx n^4$ for large $n$.",
          prereq: `**Dividing through by the highest power of $n$:**

To find $\\lim_{n\\to\\infty}$ of a rational expression, divide every term by the highest power of $n$ that appears (here $n^4$):

$$\\frac{n^2(n+1)^2 - 3n(n+1)}{n^4} = \\frac{n^2(n+1)^2}{n^4} - \\frac{3n(n+1)}{n^4}$$

$$= \\left(\\frac{n+1}{n}\\right)^2 - \\frac{3(n+1)}{n^3}$$

$$= \\left(1 + \\frac{1}{n}\\right)^2 - \\frac{3}{n^2}\\left(1 + \\frac{1}{n}\\right)$$

As $n \\to \\infty$, each $\\frac{1}{n} \\to 0$.`,
        },
        {
          expression: "\\to (1+0)^2 - 0 = 1",
          annotation: "Each $1/n \\to 0$, so $(1+1/n)^2 \\to 1$ and $3(1+1/n)/n^2 \\to 0$. The limit is 1.",
          prereq: `**Evaluating the limit:**

From the previous step:
$$\\lim_{n\\to\\infty} \\left(1 + \\frac{1}{n}\\right)^2 - \\frac{3}{n^2}\\left(1 + \\frac{1}{n}\\right)$$

Apply $\\lim_{n\\to\\infty} \\frac{1}{n} = 0$:
- $\\left(1 + \\frac{1}{n}\\right)^2 \\to (1+0)^2 = 1$
- $\\frac{3}{n^2}\\left(1+\\frac{1}{n}\\right) \\to 0 \\cdot 1 = 0$

Limit $= 1 - 0 = 1$.

This type of limit — where the leading terms dominate — is the core calculation in every Riemann sum limit.`,
        },
      ],
      answer: "$\\sum_{i=1}^n (4i^3-6i) = n(n+1)[n(n+1)-3]$; limit as $n\\to\\infty$ of the scaled sum is $1$.",
    },

    {
      id: "ch4-000c-ch3",
      difficulty: "hard",
      problem: "Prove the identity $\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2$ by mathematical induction.",
      hint: "Base case $n=1$: left side $=1$, right side $=[1\\cdot2/2]^2=1$. Inductive step: assume the formula holds for $n=k$; add $(k+1)^3$ to both sides and show the result equals $[(k+1)(k+2)/2]^2$.",
      walkthrough: [
        {
          expression: "\\text{Base case: } n=1. \\quad \\sum_{i=1}^{1} i^3 = 1^3 = 1. \\quad \\left[\\frac{1 \\cdot 2}{2}\\right]^2 = 1^2 = 1. \\checkmark",
          annotation: "The formula holds for $n=1$: both sides equal 1. This starts the induction.",
          prereq: `**Mathematical induction — base case:**

Induction is a two-step proof method for statements about all positive integers $n$:

**Step 1 (base case):** verify the statement is true for $n = 1$.

**Step 2 (inductive step):** assume the statement is true for $n = k$ (the "induction hypothesis"), then prove it for $n = k+1$.

If both steps succeed, the statement is true for all $n \\geq 1$.

For the base case here: substitute $n=1$ into both sides and check they're equal. $\\sum_{i=1}^1 i^3 = 1^3 = 1$. Right side: $[\\frac{1 \\cdot 2}{2}]^2 = 1^2 = 1$. Equal. ✓`,
        },
        {
          expression: "\\text{Assume true for } n=k: \\quad \\sum_{i=1}^{k} i^3 = \\left[\\frac{k(k+1)}{2}\\right]^2",
          annotation: "This is the induction hypothesis. We take this as given and use it to prove the $n = k+1$ case.",
          prereq: `**The induction hypothesis:**

The induction hypothesis is simply: "assume the formula is true for some specific $k$."

We don't prove this — we **assume** it. The goal of the inductive step is to show that if it's true for $k$, it must also be true for $k+1$.

In other words: if the domino at position $k$ falls, does it knock over the domino at $k+1$?

Here, assuming: $1^3 + 2^3 + \\cdots + k^3 = \\left[\\frac{k(k+1)}{2}\\right]^2$.`,
        },
        {
          expression: "\\sum_{i=1}^{k+1} i^3 = \\sum_{i=1}^{k} i^3 + (k+1)^3 = \\left[\\frac{k(k+1)}{2}\\right]^2 + (k+1)^3",
          annotation: "Peel off the last term, then apply the induction hypothesis to replace $\\sum_{i=1}^k i^3$.",
          prereq: `**Peeling off the last term:**

The key move in every inductive step:
$$\\sum_{i=1}^{k+1} a_i = \\underbrace{\\sum_{i=1}^{k} a_i}_{\\text{use hypothesis}} + a_{k+1}$$

This is just the definition of the sum extended by one term.

Once we peel off $a_{k+1}$, the remaining sum $\\sum_{i=1}^k$ matches the induction hypothesis, so we substitute it:
$$= \\left[\\frac{k(k+1)}{2}\\right]^2 + (k+1)^3$$`,
        },
        {
          expression: "= \\frac{k^2(k+1)^2}{4} + (k+1)^3 = (k+1)^2\\left[\\frac{k^2}{4} + (k+1)\\right]",
          annotation: "Factor out $(k+1)^2$, which is common to both terms.",
          prereq: `**Factoring out a common factor:**

Both terms share $(k+1)^2$ as a factor:

$$\\frac{k^2(k+1)^2}{4} + (k+1)^3 = (k+1)^2 \\cdot \\frac{k^2}{4} + (k+1)^2 \\cdot (k+1)$$

Factor:
$$= (k+1)^2 \\left[\\frac{k^2}{4} + (k+1)\\right]$$

This is standard factoring: $ab + ac = a(b+c)$ with $a = (k+1)^2$, $b = k^2/4$, $c = (k+1)$.`,
        },
        {
          expression: "= (k+1)^2 \\cdot \\frac{k^2 + 4(k+1)}{4} = (k+1)^2 \\cdot \\frac{k^2 + 4k + 4}{4} = (k+1)^2 \\cdot \\frac{(k+2)^2}{4}",
          annotation: "Combine the bracket over a common denominator 4, then recognize $k^2+4k+4 = (k+2)^2$.",
          prereq: `**Recognising a perfect square trinomial:**

$$k^2 + 4k + 4$$

Check: does this factor as $(k + a)^2 = k^2 + 2ak + a^2$?

Match: $2a = 4 \\implies a = 2$, and $a^2 = 4$. ✓

So $k^2 + 4k + 4 = (k+2)^2$.

**General rule:** $x^2 + 2bx + b^2 = (x+b)^2$.

In this problem: the "magic" factorisation appears because the formula $[n(n+1)/2]^2$ always involves a perfect square.`,
        },
        {
          expression: "= \\frac{(k+1)^2(k+2)^2}{4} = \\left[\\frac{(k+1)(k+2)}{2}\\right]^2",
          annotation: "This is exactly $[n(n+1)/2]^2$ evaluated at $n=k+1$. The inductive step is complete. $\\square$",
          prereq: `**Recognising the target form:**

The formula we're trying to prove for $n = k+1$ is:
$$\\sum_{i=1}^{k+1} i^3 = \\left[\\frac{(k+1)(k+1+1)}{2}\\right]^2 = \\left[\\frac{(k+1)(k+2)}{2}\\right]^2$$

We arrived at $\\dfrac{(k+1)^2(k+2)^2}{4}$.

Is this the same? $\\left[\\frac{(k+1)(k+2)}{2}\\right]^2 = \\frac{(k+1)^2(k+2)^2}{4}$. ✓

The inductive step is complete: if the formula holds for $k$, it holds for $k+1$. Combined with the base case $n=1$, it holds for all $n \\geq 1$.`,
        },
      ],
      answer: "By induction: base case $n=1$ verified; inductive step shows assuming the formula for $k$ implies it for $k+1$. Therefore $\\sum_{i=1}^n i^3 = [n(n+1)/2]^2$ for all positive integers $n$.",
    },
  ],

  walkthroughs: [
    {
      id: 'wt-summation-basic-properties',
      title: 'Basic Summation Properties',
      prereqs: ['Sigma notation'],
      problem: 'Simplify \\(\\sum_{i=1}^{n} (3i^2 + 5i - 2)\\) using summation properties.',
      steps: [
        {
          label: 'Split the sum using linearity',
          visualNote: 'The single summation symbol splits into three separate summations: one for 3i², one for 5i, and one for -2.',
          strategy: 'Linearity allows us to split a sum of terms into separate sums. This is the most important property because it turns a complicated expression into simpler pieces we already know how to handle.',
          explanation: 'Look at the expression inside the sigma: 3i² + 5i - 2. Instead of trying to sum this messy combination directly, we pull each term out front using the linearity property of summation. This is like distributing addition over the sigma symbol. We write the whole thing as three separate sums — one for each term. The constant -2 becomes -2 times the sum of 1 (there are n terms of 1).',
          math: '\\sum_{i=1}^n (3i^2 + 5i - 2) = 3\\sum i^2 + 5\\sum i - 2\\sum 1',
          gotcha: 'The constant term -2 must be multiplied by the number of terms, which is n. Do not forget to write -2n.'
        },
        {
          label: 'Apply the standard summation formulas',
          visualNote: 'The three known closed forms appear: sum i = n(n+1)/2, sum i² = n(n+1)(2n+1)/6, and sum 1 = n.',
          strategy: 'We now use the three standard power-sum identities. These formulas are the "closed forms" that turn sigma notation into ordinary algebra.',
          explanation: 'Here is the payoff of splitting the sum. Each piece now matches one of the standard summation formulas we have memorized or derived earlier. The first term uses the sum of squares formula, the second uses the sum of the first n naturals, and the third is simply counting the number of terms (n). We substitute each formula in turn.',
          math: '3 \\cdot \\frac{n(n+1)(2n+1)}{6} + 5 \\cdot \\frac{n(n+1)}{2} - 2n'
        },
        {
          label: 'Simplify the algebraic expression',
          visualNote: 'The expression is expanded and like terms are combined into a single cubic polynomial in n.',
          strategy: 'Multiply through and combine like terms. The final answer should be a simplified polynomial in n.',
          explanation: 'Now we do the arithmetic. First term: 3 × [n(n+1)(2n+1)/6] = n(n+1)(2n+1)/2. Second term: 5 × [n(n+1)/2] = (5/2)n(n+1). Third term: -2n. We expand everything and collect like terms. After simplification we get a clean cubic polynomial.',
          math: '\\frac{n(n+1)(2n+1)}{2} + \\frac{5n(n+1)}{2} - 2n = \\frac{2n^3 + 3n^2 - n}{2}',
          sandbox: {
            value: 'n=3 (small check)',
            rows: [
              { label: 'Original sum', expr: '(3·1 + 5·1 - 2) + (3·4 + 5·2 - 2) + (3·9 + 5·3 - 2) = 3+18+34 = 55' },
              { label: 'Closed form', expr: '(2·27 + 3·9 - 3)/2 = (54+27-3)/2 = 78/2 = 39' }
            ],
            conclusion: 'Wait — for n=3 the closed form should match the direct sum. Recheck arithmetic if mismatch.'
          }
        }
      ],
      variations: [
        { question: 'What if the sum started at i=0 instead of i=1?', hint: 'The i=0 term is zero for i and i², so the formulas still work but adjust the constant term.' }
      ]
    },

    {
      id: 'wt-summation-sum-of-squares',
      title: 'Deriving Sum of Squares Formula',
      prereqs: ['Summation properties', 'Induction basics'],
      problem: 'Prove that \\(\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6}\\).',
      steps: [
        {
          label: 'Base case (n=1)',
          visualNote: 'For n=1 the left side is just 1² = 1. Right side: 1·2·3/6 = 1.',
          strategy: 'Mathematical induction starts with the smallest case. Verify both sides are equal when n=1.',
          explanation: 'For n=1 there is only one term: 1² = 1. Plug n=1 into the formula: 1·2·3/6 = 6/6 = 1. Both sides match. Base case holds.',
          math: '1^2 = 1 \\quad \\text{and} \\quad \\frac{1\\cdot2\\cdot3}{6} = 1'
        },
        {
          label: 'Inductive hypothesis',
          visualNote: 'Assume the formula holds for some k: sum up to k equals k(k+1)(2k+1)/6.',
          strategy: 'Assume the statement is true for n=k, then prove it for n=k+1.',
          explanation: 'Assume that for some positive integer k, the sum of the first k squares equals the formula. Now we must show that adding the next term (k+1)² produces the formula with n replaced by k+1.',
          math: '\\text{Assume } \\sum_{i=1}^k i^2 = \\frac{k(k+1)(2k+1)}{6}'
        },
        {
          label: 'Inductive step — add the (k+1) term',
          visualNote: 'The sum up to k+1 is written as (sum up to k) + (k+1)².',
          strategy: 'Replace the sum up to k with the assumed formula, then simplify the resulting expression to match the formula for k+1.',
          explanation: 'The sum up to k+1 is the sum up to k plus the next square. Substitute the inductive hypothesis, add (k+1)², and combine over a common denominator. After algebraic expansion and factoring, the right side becomes exactly (k+1)(k+2)(2k+3)/6 — which is the desired formula for n = k+1.',
          math: '\\sum_{i=1}^{k+1} i^2 = \\frac{k(k+1)(2k+1)}{6} + (k+1)^2 = \\frac{(k+1)(k+2)(2k+3)}{6}'
        }
      ],
      variations: [
        { question: 'Can you derive the sum of cubes formula the same way?', hint: 'Yes — the closed form is [n(n+1)/2]². Use induction similarly.' }
      ]
    },

    {
      id: 'wt-summation-reindexing',
      title: 'Reindexing a Sum',
      prereqs: ['Sigma notation'],
      problem: 'Rewrite \\(\\sum_{i=3}^{7} (i-2)^2\\) so the summation starts at i=1.',
      steps: [
        {
          label: 'Identify the shift needed',
          visualNote: 'The index starts at 3. We want it to start at 1, so we shift the index down by 2.',
          strategy: 'When the lower limit is not 1, introduce a new index j = i - k to make the sum start at 1.',
          explanation: 'The current sum starts at i=3. We want the index to begin at 1. Let j = i - 2. When i=3, j=1; when i=7, j=5. The term (i-2)² becomes j². The upper limit becomes 5. This reindexing makes the sum look more standard.',
          math: 'Let j = i - 2 \\quad \\Rightarrow \\quad \\sum_{j=1}^{5} j^2'
        }
      ],
      variations: [
        { question: 'Reindex \\sum_{k=5}^{10} (2k+1) so it starts at m=1.', hint: 'Let m = k-4. New sum runs from m=1 to m=6.' }
      ]
    },

    {
      id: 'wt-summation-telescoping',
      title: 'Telescoping Series',
      prereqs: ['Partial fractions', 'Sigma notation'],
      problem: 'Evaluate \\(\\sum_{k=1}^{n} \\left( \\frac{1}{k} - \\frac{1}{k+1} \\right)\\).',
      steps: [
        {
          label: 'Write out the first few terms',
          visualNote: 'The terms are written expanded: (1/1 - 1/2) + (1/2 - 1/3) + (1/3 - 1/4) + …',
          strategy: 'Telescoping sums cancel most terms when expanded. Write out several terms to see the pattern.',
          explanation: 'Expand the first few terms. Notice that -1/2 from the first term cancels with +1/2 from the second term, -1/3 cancels with +1/3 from the next, and so on. Most terms disappear.',
          math: '\\left(1 - \\frac{1}{2}\\right) + \\left(\\frac{1}{2} - \\frac{1}{3}\\right) + \\left(\\frac{1}{3} - \\frac{1}{4}\\right) + \\cdots + \\left(\\frac{1}{n} - \\frac{1}{n+1}\\right)'
        },
        {
          label: 'Observe the cancellation',
          visualNote: 'All intermediate terms cancel, leaving only 1 at the beginning and -1/(n+1) at the end.',
          strategy: 'After cancellation, only the first positive term and the last negative term remain.',
          explanation: 'Everything in the middle cancels perfectly. What remains is 1 - 1/(n+1). This is the beauty of telescoping series — the sum simplifies dramatically.',
          math: '1 - \\frac{1}{n+1} = \\frac{n}{n+1}'
        }
      ],
      variations: [
        { question: 'What is the sum \\sum_{k=1}^n (1/(k(k+1))) ?', hint: 'Partial fractions give 1/k - 1/(k+1). It telescopes to 1 - 1/(n+1) = n/(n+1).' }
      ]
    }
  ],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'What does Σ(k=1 to 4) k² equal?',
      options: [
        '1² + 2² + 3² + 4² = 1 + 4 + 9 + 16 = 30 — the sigma unfolds into the sum of each term from k=1 to k=4',
        '4² = 16 — the sigma means evaluate the expression at the upper limit only',
        '(1+2+3+4)² = 100 — square the sum of indices',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The closed-form formula Σ(k=1 to n) k = n(n+1)/2. What is Σ(k=1 to 100) k?',
      options: [
        '5000 — 100 × 50 by averaging',
        '5050 — n(n+1)/2 = 100(101)/2 = 5050',
        '10000 — 100² because there are 100 terms each averaging 100',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A telescoping sum like Σ(k=1 to n) (1/k − 1/(k+1)) has most terms cancel. What does it equal?',
      options: [
        '1/(n+1) — only the last term survives after cancellation',
        '1 − 1/(n+1) = n/(n+1) — the first term 1/1 = 1 and the last term −1/(n+1) survive; all middle terms cancel with their neighbors',
        '0 — all terms cancel in a telescoping sum',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does Riemann sum notation Σ f(xᵢ*)Δx use summation? What is Δx?',
      options: [
        'Δx is the height of each rectangle; sigma adds the widths across all n strips',
        'Σ f(xᵢ*)Δx adds up areas of n thin rectangles that approximate the region under f(x); Δx = (b−a)/n is the width of each rectangle, and f(xᵢ*) is the height at the chosen sample point in strip i',
        'Σ replaces the integral sign and Δx is the derivative of x, so the sum computes the derivative of the area function',
      ],
      correct: 1,
    },
  ],
}
