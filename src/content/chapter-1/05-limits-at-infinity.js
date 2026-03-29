export default {
  id: 'ch1-limits-at-infinity',
  slug: 'limits-at-infinity',
  chapter: 1,
  order: 6,
  title: 'Limits at Infinity',
  subtitle: 'End behavior, asymptotes, and growth-rate dominance',
  tags: ['limits at infinity', 'horizontal asymptote', 'oblique asymptote', 'end behavior', 'epsilon-N', 'growth rates'],
  aliases: 'limits at infinity horizontal asymptote slant asymptote end behavior rational functions degree dominance growth rate',

  hook: {
    question: 'A rocket\'s altitude increases for a while, levels off, and settles toward a ceiling — even as time keeps growing. A drug concentration in your bloodstream rises, peaks, then decays toward zero. A company\'s market share grows fast early on, then asymptotically approaches some steady-state percentage. In each case the question is the same: what does this quantity settle into as the driving variable grows without bound?',
    realWorldContext: 'Limits at infinity are the mathematical language of long-run behavior. Every signal filter, population model, and feedback control system has a steady-state — an answer to "what happens eventually?" Finding that steady-state is exactly computing a limit at infinity. The techniques in this lesson also produce horizontal and slant asymptotes, which are the scaffolding engineers use to sketch and reason about functions without a computer.',
    previewVisualizationId: 'LimitApproach',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** You have spent this chapter studying limits near a finite point — what does f(x) do as x approaches some number a? The Fundamental Trig Limits lesson pushed that machinery to its limits (literally) by squeezing tricky expressions into known patterns. Now the chapter turns in a different direction: instead of asking what happens as x approaches a finite value, we ask what happens as x grows without bound. This is the other half of the limit story.',

      'The key mental shift is this: a limit at infinity is NOT about plugging in x = ∞. Infinity is not a number, and you cannot substitute it. Instead, lim(x→∞) f(x) = L is a statement about a trend — it says that f(x) gets and stays arbitrarily close to L once x is large enough. The graph of f might wiggle, dip, and spike at small values of x while still having a completely predictable long-run destination.',

      'For rational functions, the intuition is a dominance race. Imagine the numerator and denominator as two competing runners. For large x, the highest-degree term in each one dominates everything else — the lower-degree terms become noise. So the race comes down to just the leading terms: if both runners have the same speed (same degree), they tie and the ratio of their leading coefficients is the result. If the denominator\'s runner is faster (higher degree), it pulls ahead and the ratio collapses to 0. If the numerator\'s runner is faster (higher degree), it pulls ahead and the function grows without bound.',

      'The standard technique is to divide every term by the highest power of x in the denominator. This turns things like 3x² into 3, and things like 2x into 2/x. Every term with any x in the denominator then vanishes as x → ∞ (because 1/xⁿ → 0 for n > 0). What survives is just the ratio of leading coefficients. This "divide by the dominant power" move is the workhorse of every rational limit at infinity.',

      'Horizontal asymptotes are what limits at infinity look like on a graph. If lim(x→∞) f(x) = L, the graph approaches the horizontal line y = L from below or above as you go far right. Crucially, the graph CAN cross a horizontal asymptote — asymptotes describe end behavior, not barriers. A function can oscillate across y = L many times at small x values and still approach L eventually.',

      'When the numerator degree exceeds the denominator degree by exactly 1, there is no horizontal asymptote — but there IS a slant (oblique) asymptote. Polynomial long division reveals it: divide to get f(x) = (linear part) + (remainder)/(denominator). As x → ∞ the remainder fraction vanishes, and the graph hugs the line given by the linear part.',

      'The growth-rate hierarchy is a fact worth memorizing once and using forever: for large x, logarithms grow slowest, then powers of x (like x², x^10), then exponentials (like eˣ, 2ˣ). In race notation: ln(x) ≪ xᵃ ≪ bˣ for any a > 0 and b > 1. This means lim(x→∞) ln(x)/x = 0 (polynomial wins over log), and lim(x→∞) x¹⁰⁰/eˣ = 0 (exponential wins over any polynomial, even x to the hundredth power). These facts come up constantly in later chapters.',

      '**Where this is heading:** Limits at infinity give you horizontal and slant asymptotes — two of the five key features used in curve sketching in Chapter 3. In Chapter 3 you will also meet L\'Hôpital\'s Rule, which handles ∞/∞ and 0/0 indeterminate forms that the degree-comparison technique cannot reach. Everything in this lesson is prerequisite for that tool.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 10 of 13 — Chapter 1: Limits & Continuity',
        body: '**Previous:** Fundamental Trig Limits — the twin pillars lim sin(x)/x = 1 and lim (1−cos x)/x = 0, and pattern scaling.\n**This lesson:** Limits at infinity — end behavior, the dominance race, horizontal and slant asymptotes, and the growth-rate hierarchy.\n**Next:** Limits & Continuity Review — connecting all the tools from this chapter into a unified picture before Chapter 2.',
      },
      {
        type: 'misconception',
        title: 'Infinity Is Not a Number — Never Substitute It',
        body: 'Writing "plug in x = ∞" is meaningless. The notation $\\lim_{x \\to \\infty} f(x) = L$ means: for any tolerance $\\varepsilon > 0$, f(x) stays within $\\varepsilon$ of L once x is large enough. It is a statement about a trend, not a substitution.',
      },
      {
        type: 'insight',
        title: 'The Dominance Race — One Sentence',
        body: '\\text{For large } x\\text{: the highest-degree term wins. Everything else is noise.}',
      },
      {
        type: 'insight',
        title: 'Growth-Rate Hierarchy',
        body: '\\ln x \\ll x^a \\ll b^x \\quad (a > 0,\\; b > 1) \\quad \\text{for large } x',
      },
      {
        type: 'warning',
        title: 'Horizontal Asymptotes Can Be Crossed',
        body: 'A horizontal asymptote $y = L$ is a statement about end behavior, not a wall. The graph of $f$ can cross $y = L$ finitely many times and still have $\\lim_{x \\to \\infty} f(x) = L$.',
      },
    ],
    visualizations: [
      {
        id: 'LimitApproach',
        props: { fn: '(3*x*x - 2*x + 1)/(5*x*x + 4*x - 7)', targetX: 200, limitVal: 0.6 },
        title: 'The Dominance Race in Action',
        mathBridge: 'Before looking at the graph, predict the answer: the numerator has leading term $3x^2$ and the denominator has leading term $5x^2$ — equal degrees, so the limit should be $3/5 = 0.6$. Step 1: Look at the graph near $x = 0$. The function is messy — the lower-degree terms ($-2x+1$ and $4x-7$) are still significant. Step 2: Drag x far to the right (toward 200). Watch the function settle onto the horizontal line $y = 0.6$. The lower-degree terms become completely negligible. Step 3: Notice the function value oscillates slightly around 0.6 for moderate x but locks in tightly for large x. This is the dominance race: once x is big enough, only the leading terms matter.',
        caption: 'Drag x to the right. Lower-degree terms fade; the ratio locks onto 3/5.',
      },
    ],
  },

  math: {
    prose: [
      '**Formal definition (epsilon-N).** We say lim(x→∞) f(x) = L if for every ε > 0 there exists a threshold N such that whenever x > N, |f(x) − L| < ε. The threshold N is the "large enough x" — beyond N, f is permanently within ε of L. This mirrors the epsilon-delta definition for finite limits, with N playing the role of δ.',

      '**The divide-by-dominant-power technique.** For a rational function p(x)/q(x) where q has degree n, divide every term in both numerator and denominator by xⁿ. Every resulting fraction of the form (constant)/xᵏ vanishes as x → ∞. What remains is just the ratio of leading coefficients — or 0 if the numerator has lower degree, or growth without bound if the numerator has higher degree.',

      '**The three degree rules.** These are the results of the divide-by-dominant-power technique applied in each case:',
      '1) deg(p) < deg(q): the numerator vanishes faster, so the limit is 0.',
      '2) deg(p) = deg(q): leading terms dominate equally, so the limit is aₙ/bₙ (ratio of leading coefficients).',
      '3) deg(p) > deg(q): the numerator dominates, and there is no finite limit. Use polynomial long division to find the asymptotic line instead.',

      '**Slant asymptotes via long division.** When deg(p) = deg(q) + 1, divide p(x) by q(x) to write f(x) = mx + b + r(x)/q(x), where r(x) is the remainder (degree lower than q). As x → ∞, r(x)/q(x) → 0, and the graph of f approaches the line y = mx + b.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Limit at Infinity (Epsilon-N)',
        body: '\\lim_{x \\to \\infty} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, N > 0 \\text{ such that } x > N \\implies |f(x)-L| < \\varepsilon',
      },
      {
        type: 'definition',
        title: 'Horizontal Asymptote',
        body: '\\text{If } \\lim_{x \\to \\infty} f(x) = L \\text{ or } \\lim_{x \\to -\\infty} f(x) = L, \\text{ then } y = L \\text{ is a horizontal asymptote.}',
      },
      {
        type: 'theorem',
        title: 'Three Degree Rules for Rational Functions',
        body: '\\frac{p(x)}{q(x)}:\\quad \\deg p < \\deg q \\Rightarrow 0;\\quad \\deg p = \\deg q \\Rightarrow \\frac{a_n}{b_n};\\quad \\deg p > \\deg q \\Rightarrow \\text{no finite limit}',
      },
      {
        type: 'strategy',
        title: 'Rational Limit at Infinity — Decision Workflow',
        body: '\\text{Step 1: Compare degrees of numerator and denominator.} \\\\ \\text{Step 2a (equal): divide top and bottom by } x^n\\text{; take limit.} \\\\ \\text{Step 2b (denom higher): same — numerator vanishes.} \\\\ \\text{Step 2c (num higher): long division to find the asymptotic line.}',
      },
    ],
    visualizations: [
      {
        id: 'LimitApproach',
        props: { fn: '(2*x*x + 3)/(x*x - 1)', targetX: 120, limitVal: 2, showTable: true },
        title: 'Equal-Degree Ratio Rule with Numerical Table',
        mathBridge: 'This visualization shows $\\lim_{x\\to\\infty}(2x^2+3)/(x^2-1)$. Step 1: Before looking at the table, apply the degree rule — equal degrees (both 2), so the limit is the ratio of leading coefficients: $2/1 = 2$. Step 2: Now open the table and read the values at $x = 10, 50, 100$. At $x=10$: $(200+3)/(100-1) = 203/99 \\approx 2.05$. At $x=100$: $(20003)/(9999) \\approx 2.0002$. The values are converging to 2. Step 3: Notice how the $+3$ in the numerator and $-1$ in the denominator become irrelevant — for large $x$, $x^2$ dwarfs both constants. The key lesson: for rational functions, all non-leading terms are noise at infinity.',
        caption: 'Equal degrees: ratio of leading coefficients wins. The table shows how quickly lower-order terms become irrelevant.',
      },
    ],
  },

  rigor: {
    title: 'Why the Degree Rules Work: Formal Derivation',
    prose: [
      'The degree rules are not guesses — they follow directly from two facts: (1) 1/xⁿ → 0 as x → ∞ for any n > 0, and (2) limit laws allow limits to be distributed over sums and products (when individual limits exist).',

      'Take the equal-degree case as the representative proof. Let p(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₀ and q(x) = bₙxⁿ + bₙ₋₁xⁿ⁻¹ + … + b₀ with bₙ ≠ 0. Divide numerator and denominator by xⁿ:',

      'p(x)/q(x) = (aₙ + aₙ₋₁/x + … + a₀/xⁿ) / (bₙ + bₙ₋₁/x + … + b₀/xⁿ).',

      'As x → ∞, each term of the form aₖ/xᵏ → 0. By the sum and quotient limit laws, the numerator → aₙ and denominator → bₙ. So the limit is aₙ/bₙ. The lower-degree case (deg p < deg q) follows identically, except after dividing by xᵐ (where m = deg q), the entire numerator collapses to 0.',

      'Growth-rate comparisons require more tools (L\'Hôpital or series), but the results are: lim(x→∞) ln(x)/xᵃ = 0 for any a > 0, and lim(x→∞) xᵃ/bˣ = 0 for any a and b > 1. These confirm the hierarchy ln(x) ≪ xᵃ ≪ bˣ.',
    ],
    proofSteps: [
      {
        expression: '\\frac{p(x)}{q(x)} = \\frac{a_n x^n + \\cdots + a_0}{b_n x^n + \\cdots + b_0}',
        annotation: 'Start with a rational function of equal degrees n.',
      },
      {
        expression: '= \\frac{a_n + a_{n-1}/x + \\cdots + a_0/x^n}{b_n + b_{n-1}/x + \\cdots + b_0/x^n}',
        annotation: 'Divide every term by xⁿ. This is the key step — it converts a race between growing polynomials into a comparison where only constants survive.',
      },
      {
        expression: '\\lim_{x \\to \\infty} \\frac{a_k}{x^k} = 0 \\quad \\text{for each } k \\geq 1',
        annotation: 'Each fraction with xᵏ in the denominator vanishes. This follows from the basic fact that 1/xᵏ → 0, scaled by the constant aₖ.',
      },
      {
        expression: '\\text{Numerator} \\to a_n, \\quad \\text{Denominator} \\to b_n',
        annotation: 'By the sum limit law, the numerator and denominator each approach their leading coefficient as all the 1/xᵏ terms die out.',
      },
      {
        expression: '\\lim_{x \\to \\infty} \\frac{p(x)}{q(x)} = \\frac{a_n}{b_n}',
        annotation: 'By the quotient limit law (valid since bₙ ≠ 0). The limit is exactly the ratio of leading coefficients.',
      },
    ],
    callouts: [
      {
        type: 'tip',
        title: 'Long Division Before the Limit',
        body: 'When $\\deg p = \\deg q + 1$, do not try to evaluate the limit directly. Perform polynomial long division first to write $f(x) = mx + b + r(x)/q(x)$. Then the remainder term vanishes and the asymptote $y = mx + b$ is immediate.',
      },
      {
        type: 'warning',
        title: 'Sign Traps When x → −∞',
        body: 'When $x \\to -\\infty$ and the function involves odd powers or square roots, the sign of the dominant term matters. For example, $\\sqrt{x^2} = |x| = -x$ when $x < 0$. Always simplify carefully before applying the degree rules to $x \\to -\\infty$ limits.',
      },
    ],
  },

  examples: [
    {
      id: 'ex-inf-rational-equal',
      title: 'Equal Degrees',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to \\infty} \\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}$.',
      steps: [
        {
          expression: '\\lim_{x \\to \\infty} \\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}',
          annotation: 'Equal degrees (2 and 2): expect the limit to be the ratio of leading coefficients.',
          hints: [
            'Compare the degree of the numerator ($x^2$) with the degree of the denominator ($x^2$). They are equal.',
            'Equal degrees → limit equals $a_n / b_n = 3/5$. Verify by dividing through.',
          ],
        },
        {
          expression: '= \\lim_{x \\to \\infty} \\frac{3 - 2/x + 1/x^2}{5 + 4/x - 7/x^2}',
          annotation: 'Divide every term in the numerator and denominator by $x^2$ (the highest power in the denominator). This is the standard move for any rational limit at infinity.',
          hints: [
            'Divide $3x^2$ by $x^2$ to get $3$. Divide $-2x$ by $x^2$ to get $-2/x$.',
            'Every term with $x$ in its denominator approaches 0 as $x \\to \\infty$.',
          ],
        },
        {
          expression: '= \\frac{3 - 0 + 0}{5 + 0 - 0} = \\frac{3}{5}',
          annotation: 'All $1/x$ and $1/x^2$ terms vanish. Only the leading coefficients survive.',
          hints: [
            '$2/x \\to 0$ and $1/x^2 \\to 0$ as $x \\to \\infty$.',
            'Numerator approaches 3, denominator approaches 5.',
          ],
        },
      ],
      conclusion: 'The limit is 3/5, so $y = 3/5$ is a horizontal asymptote as $x \\to +\\infty$.',
    },
    {
      id: 'ex-inf-rational-unequal',
      title: 'Numerator Degree Smaller',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to \\infty} \\frac{7x + 1}{x^2 - 9}$.',
      steps: [
        {
          expression: '\\lim_{x \\to \\infty} \\frac{7x + 1}{x^2 - 9}',
          annotation: 'Degree 1 (numerator) vs degree 2 (denominator). The denominator wins the race — expect limit = 0.',
          hints: [
            'deg(numerator) = 1, deg(denominator) = 2. Since denominator degree is higher, the limit should be 0.',
            'Verify by dividing by $x^2$.',
          ],
        },
        {
          expression: '= \\lim_{x \\to \\infty} \\frac{7/x + 1/x^2}{1 - 9/x^2}',
          annotation: 'Divide numerator and denominator by $x^2$ (the highest power in the denominator).',
          hints: [
            'Divide $7x$ by $x^2$ to get $7/x$. Divide $1$ by $x^2$ to get $1/x^2$.',
            'Divide $x^2$ by $x^2$ to get $1$. Divide $-9$ by $x^2$ to get $-9/x^2$.',
          ],
        },
        {
          expression: '= \\frac{0 + 0}{1 - 0} = 0',
          annotation: 'The entire numerator vanishes; the denominator approaches 1. The function collapses to 0.',
          hints: [
            '$7/x \\to 0$ and $1/x^2 \\to 0$.',
            'The denominator approaches 1 (the $x^2$ terms cancel, leaving just 1 in the denominator).',
          ],
        },
      ],
      conclusion: 'When the denominator degree is larger, the limit is 0. The denominator runner is simply faster.',
    },
    {
      id: 'ex-inf-oblique',
      title: 'Slant Asymptote by Long Division',
      problem: 'Find the end behavior of $\\displaystyle f(x)=\\frac{x^2+3x+1}{x-1}$.',
      steps: [
        {
          expression: '\\deg(\\text{numerator}) = 2 = \\deg(\\text{denominator}) + 1',
          annotation: 'Numerator degree exceeds denominator degree by exactly 1 — this is the signal for a slant asymptote. The limit at infinity is not finite, but the graph approaches a line.',
          hints: [
            'When numerator degree = denominator degree + 1, perform polynomial long division.',
            'Do not try to apply the ratio rule here — it does not apply.',
          ],
        },
        {
          expression: '\\frac{x^2+3x+1}{x-1} = x + 4 + \\frac{5}{x-1}',
          annotation: 'Polynomial long division: $x^2+3x+1 \\div (x-1)$. Quotient is $x+4$, remainder is $5$.',
          hints: [
            '$x^2 \\div x = x$. Multiply: $x(x-1) = x^2 - x$. Subtract: $(x^2+3x+1)-(x^2-x) = 4x+1$.',
            '$4x \\div x = 4$. Multiply: $4(x-1) = 4x-4$. Subtract: $(4x+1)-(4x-4) = 5$. Remainder 5.',
          ],
        },
        {
          expression: '\\lim_{x \\to \\infty} \\frac{5}{x-1} = 0',
          annotation: 'The remainder term $5/(x-1)$ vanishes as $x \\to \\infty$.',
          hints: [
            'The numerator is constant (5) while the denominator grows without bound.',
            '$5/(x-1) \\to 0$ by the basic fact $1/x \\to 0$.',
          ],
        },
        {
          expression: 'f(x) \\sim x + 4 \\text{ as } x \\to \\pm\\infty',
          annotation: 'Once the remainder vanishes, the graph hugs the line $y = x + 4$. This is the slant (oblique) asymptote.',
          hints: [
            'The graph of $f$ gets arbitrarily close to $y = x+4$ for large $|x|$, from either direction.',
          ],
        },
      ],
      conclusion: 'The oblique asymptote is $y = x + 4$. Long division is the only reliable method when deg(numerator) = deg(denominator) + 1.',
    },
    {
      id: 'ex-inf-growth',
      title: 'Exponential vs Polynomial Growth',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to \\infty} \\frac{x^3}{e^x}$.',
      steps: [
        {
          expression: '\\lim_{x \\to \\infty} \\frac{x^3}{e^x}',
          annotation: 'This is not a rational function — the degree rules do not apply directly. Use the growth hierarchy: exponentials dominate every polynomial.',
          hints: [
            'The growth-rate hierarchy says $x^a \\ll b^x$ for any $a > 0$ and $b > 1$.',
            '$e^x$ grows faster than $x^3$ (or $x^{100}$ or any fixed power of $x$).',
          ],
        },
        {
          expression: '= 0',
          annotation: 'Exponentials outrun every polynomial. The denominator $e^x$ grows so much faster than $x^3$ that the ratio collapses to 0. This can be verified with repeated L\'Hôpital\'s Rule in Chapter 3.',
          hints: [
            'Informally: $e^{10} \\approx 22{,}000$ while $10^3 = 1{,}000$. At $x=20$: $e^{20} \\approx 5 \\times 10^8$ while $20^3 = 8{,}000$. The gap keeps widening.',
          ],
        },
      ],
      conclusion: '$e^x$ dominates every power of $x$. The limit is 0. This is a direct application of the growth-rate hierarchy $x^a \\ll e^x$.',
    },
  ],

  challenges: [
    {
      id: 'ch1-inf-c1',
      difficulty: 'medium',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to -\\infty} \\frac{4x^3-1}{2x^3+7x}$.',
      hint: 'Equal degrees (both 3). Divide through by $x^3$. Watch the signs — you are going to $-\\infty$, not $+\\infty$.',
      walkthrough: [
        {
          expression: '\\frac{4x^3-1}{2x^3+7x} = \\frac{4 - 1/x^3}{2 + 7/x^2}',
          annotation: 'Divide every term by $x^3$. The $7x$ term becomes $7x/x^3 = 7/x^2$, not $7/x^3$.',
        },
        {
          expression: '\\lim_{x \\to -\\infty} \\frac{4 - 1/x^3}{2 + 7/x^2} = \\frac{4 - 0}{2 + 0} = \\frac{4}{2} = 2',
          annotation: 'All inverse-power terms vanish regardless of direction (both $1/x^3$ and $1/x^2$ approach 0 as $x \\to -\\infty$). The result is the same as $x \\to +\\infty$.',
        },
      ],
      answer: '2',
    },
    {
      id: 'ch1-inf-c2',
      difficulty: 'hard',
      problem: 'Find the horizontal or slant asymptote of $\\displaystyle f(x)=\\frac{2x^2-5x+3}{x+1}$.',
      hint: 'Numerator degree (2) = denominator degree (1) + 1 — this is the slant asymptote signal. Use long division.',
      walkthrough: [
        {
          expression: '\\deg(2x^2-5x+3) = 2 = \\deg(x+1) + 1 = 2',
          annotation: 'Numerator degree exceeds denominator degree by 1. Long division required.',
        },
        {
          expression: '\\frac{2x^2-5x+3}{x+1} = 2x - 7 + \\frac{10}{x+1}',
          annotation: 'Long division: $2x^2-5x+3 \\div (x+1)$. First term: $2x^2/x = 2x$. Multiply $2x(x+1)=2x^2+2x$. Subtract: $-7x+3$. Next: $-7x/x = -7$. Multiply $-7(x+1) = -7x-7$. Subtract: remainder $10$.',
        },
        {
          expression: '\\lim_{x \\to \\pm\\infty} \\frac{10}{x+1} = 0',
          annotation: 'Remainder term vanishes at both $+\\infty$ and $-\\infty$.',
        },
        {
          expression: 'f(x) \\to 2x - 7 \\text{ as } x \\to \\pm\\infty',
          annotation: 'The graph of $f$ approaches the slant asymptote $y = 2x - 7$ in both directions.',
        },
      ],
      answer: 'Slant asymptote $y = 2x - 7$',
    },
  ],

  crossRefs: [
    {
      lessonSlug: 'fundamental-trig-limits',
      label: 'Previous: Fundamental Trig Limits',
      context: 'Pattern-matching and limit manipulation tools carry directly into evaluating limits at infinity.',
    },
    {
      lessonSlug: 'epsilon-delta',
      label: 'Foundation: Epsilon-Delta',
      context: 'The epsilon-N definition of limits at infinity mirrors the epsilon-delta definition for finite limits.',
    },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: 'lim(x→∞) f(x) = L',
        meaning: 'as x grows without bound, f(x) gets arbitrarily close to L — L is a horizontal asymptote',
      },
      {
        symbol: 'leading term',
        meaning: 'the highest-degree term in a polynomial — it dominates all others for large x and determines the limit',
      },
      {
        symbol: 'horizontal asymptote y = L',
        meaning: 'the line the graph approaches as x → ±∞; the graph CAN cross it, asymptotes are about end behavior not barriers',
      },
      {
        symbol: 'slant (oblique) asymptote y = mx + b',
        meaning: 'a non-horizontal line the graph approaches at infinity; appears when numerator degree = denominator degree + 1',
      },
    ],
    rulesOfThumb: [
      'For rational functions: compare degrees. Same → ratio of leading coefficients. Denom higher → 0. Num higher → no finite limit (use long division).',
      'The universal move: divide numerator and denominator by the highest power of x in the denominator. Every term with x left over vanishes.',
      '1/xⁿ → 0 as x → ∞ for any n > 0. This single fact is the anchor for all limit-at-infinity computations.',
      'Growth hierarchy (memorize once): ln(x) ≪ xᵃ ≪ bˣ for a > 0, b > 1. Exponentials beat polynomials beat logarithms.',
    ],
  },

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'ch1-intro-limits',
        label: 'Introduction to Limits (Ch. 1)',
        note: 'Limits at infinity follow the exact same logic as finite limits — the function is approaching a value — but the "approach" happens along the x-axis toward ±∞ rather than toward a finite point. If the basic limit definition still feels shaky, review it before this lesson.',
      },
      {
        lessonId: 'ch0-polynomial-division',
        label: 'Polynomial Long Division (Ch. 0)',
        note: 'Slant asymptotes require polynomial long division. If dividing polynomials is rusty, review that skill first — the calculus here is simple once the algebra is solid.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'ch3-lhopital',
        label: 'Ch. 3: L\'Hôpital\'s Rule',
        note: 'The ∞/∞ indeterminate form appears often in limits at infinity. L\'Hôpital\'s Rule handles exactly these cases and many others. Everything in this lesson is a prerequisite for that tool.',
      },
      {
        lessonId: 'ch3-curve-sketching',
        label: 'Ch. 3: Curve Sketching',
        note: 'Horizontal and slant asymptotes are two of the five key features in curve sketching. Limits at infinity give you both directly, so this lesson is load-bearing for all of Chapter 3 graphing work.',
      },
    ],
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'linf-assess-1',
        type: 'input',
        text: 'lim(x→∞) (3x²+5) / (x²-2) = ?',
        answer: '3',
        hint: 'Equal degrees. Divide by x²: (3 + 5/x²)/(1 − 2/x²) → 3/1 = 3.',
      },
      {
        id: 'linf-assess-2',
        type: 'choice',
        text: 'lim(x→∞) (x³+1)/(x²+x). The answer is:',
        options: ['1', '0', '+∞', '-∞'],
        answer: '+∞',
        hint: 'Numerator degree (3) > denominator degree (2). The function grows without bound.',
      },
      {
        id: 'linf-assess-3',
        type: 'input',
        text: 'Which growth rate wins for large x: x^10 or e^x?',
        answer: 'e^x',
        hint: 'Growth hierarchy: xᵃ ≪ bˣ — exponentials dominate every polynomial.',
      },
    ],
  },

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    'Large x → 1/xⁿ → 0 (this is the anchor for everything)',
    'Rational limits: compare degrees — same → leading ratio, denom higher → 0, num higher → long division',
    'Horizontal asymptote y=L ⟺ lim(x→±∞) f(x) = L — the graph CAN cross it',
    'Growth hierarchy: ln(x) ≪ xᵃ ≪ eˣ — exponentials always win',
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
    'solved-challenge',
  ],

  quiz: [
    {
      id: 'linf-q1',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to \\infty} \\dfrac{3x^2 - 2x + 1}{5x^2 + 4x - 7}$.',
      answer: '3/5',
      hints: [
        'Divide numerator and denominator by $x^2$ (the highest power in the denominator).',
        'All $1/x$ and $1/x^2$ terms vanish, leaving $3/5$.',
      ],
      reviewSection: 'Examples tab — equal degrees',
    },
    {
      id: 'linf-q2',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to \\infty} \\dfrac{7x + 1}{x^2 - 9}$.',
      answer: '0',
      hints: [
        'Degree of numerator (1) is less than degree of denominator (2).',
        'Divide by $x^2$: numerator goes to 0, denominator goes to 1.',
      ],
      reviewSection: 'Examples tab — numerator degree smaller',
    },
    {
      id: 'linf-q3',
      type: 'choice',
      text: 'For a rational function $p(x)/q(x)$, if $\\deg(p) > \\deg(q)$, then $\\lim_{x \\to \\infty} p(x)/q(x)$ is:',
      options: ['0', 'Ratio of leading coefficients', 'Does not exist as a finite number', '1'],
      answer: 'Does not exist as a finite number',
      hints: ['When the numerator degree exceeds the denominator degree, the function grows without bound.'],
      reviewSection: 'Math tab — three degree rules',
    },
    {
      id: 'linf-q4',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to \\infty} \\dfrac{2x^2 + 3}{x^2 - 1}$.',
      answer: '2',
      hints: [
        'Equal degrees. Divide top and bottom by $x^2$.',
        'Leading coefficients: $2/1 = 2$.',
      ],
      reviewSection: 'Math tab — equal-degree rule',
    },
    {
      id: 'linf-q5',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to -\\infty} \\dfrac{4x^3 - 1}{2x^3 + 7x}$.',
      answer: '2',
      hints: [
        'Equal degrees (both 3). Divide by $x^3$.',
        'Ratio of leading coefficients: $4/2 = 2$.',
      ],
      reviewSection: 'Challenges tab — Challenge 1',
    },
    {
      id: 'linf-q6',
      type: 'choice',
      text: 'A horizontal asymptote $y = L$ means:',
      options: [
        'The function never crosses $y = L$',
        '$\\lim_{x \\to \\infty} f(x) = L$ or $\\lim_{x \\to -\\infty} f(x) = L$',
        'The function is undefined at $y = L$',
        'The function always stays below $y = L$',
      ],
      answer: '$\\lim_{x \\to \\infty} f(x) = L$ or $\\lim_{x \\to -\\infty} f(x) = L$',
      hints: ['A horizontal asymptote describes end behavior — the function can cross it finitely many times.'],
      reviewSection: 'Math tab — horizontal asymptote definition',
    },
    {
      id: 'linf-q7',
      type: 'input',
      text: 'What is $\\lim_{x \\to \\infty} \\dfrac{1}{x^3}$?',
      answer: '0',
      hints: ['As $x \\to \\infty$, $1/x^n \\to 0$ for any $n > 0$.'],
      reviewSection: 'Intuition tab — dominance hierarchy',
    },
    {
      id: 'linf-q8',
      type: 'input',
      text: 'Polynomial long division gives $\\dfrac{x^2 + 3x + 1}{x - 1} = x + 4 + \\dfrac{5}{x-1}$. As $x \\to \\infty$, the remainder term $\\dfrac{5}{x-1} \\to$ ?',
      answer: '0',
      hints: ['The numerator is constant (5) and the denominator grows without bound.'],
      reviewSection: 'Examples tab — slant asymptote by long division',
    },
    {
      id: 'linf-q9',
      type: 'input',
      text: 'Using the long division result $\\dfrac{x^2+3x+1}{x-1} = x + 4 + \\dfrac{5}{x-1}$, what is the oblique (slant) asymptote? Give the slope (the coefficient of $x$).',
      answer: '1',
      hints: ['The asymptote is the line $y = x + 4$; its slope is 1.'],
      reviewSection: 'Examples tab — slant asymptote',
    },
    {
      id: 'linf-q10',
      type: 'choice',
      text: 'In the growth hierarchy for large $x$, which dominates?',
      options: [
        '$\\ln x$ dominates $x^2$',
        '$x^2$ dominates $e^x$',
        '$e^x$ dominates $x^{100}$',
        '$x^{100}$ dominates $e^x$',
      ],
      answer: '$e^x$ dominates $x^{100}$',
      hints: ['Exponentials grow faster than any polynomial for sufficiently large $x$.'],
      reviewSection: 'Intuition tab — growth-rate hierarchy',
    },
  ],
};
