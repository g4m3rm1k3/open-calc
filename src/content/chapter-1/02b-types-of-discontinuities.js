export default {
  id: 'ch1-discontinuities',
  slug: 'types-of-discontinuities',
  chapter: 1,
  order: 2.7,
  title: 'Types of Discontinuities',
  subtitle: 'The four ways a function can fail to be continuous — and why each is different',
  tags: [
    'discontinuity', 'removable discontinuity', 'jump discontinuity', 'infinite discontinuity',
    'oscillating discontinuity', 'hole', 'vertical asymptote', 'piecewise function',
    'classification', 'continuity', 'essential discontinuity', 'types',
  ],

  hook: {
    question: 'A GPS plots your position every second. Between updates, it interpolates smoothly. But if it loses signal and jumps to a new location — that\'s a discontinuity. Can you tell, just by looking at a graph, exactly what went wrong?',
    realWorldContext:
      'Engineers, physicists, and economists encounter discontinuous functions constantly: ' +
      'electrical switches (voltage jumps from 0 to 120V instantly), ' +
      'tax brackets (your marginal rate jumps at income thresholds), ' +
      'fluid mechanics (shock waves create jumps in pressure and density). ' +
      'Knowing the type of discontinuity tells you whether it can be fixed, whether limits exist, ' +
      'and what mathematical tools apply. A "removable" discontinuity is just a missing point — easily patched. ' +
      'A "jump" discontinuity means the function truly has two distinct behaviors. ' +
      'An "infinite" discontinuity signals a vertical asymptote. Each type has different physical meaning.',
    previewVisualizationId: 'HoleVsValue',
  },

  intuition: {
    prose: [
      'Continuity means the graph has no breaks — you can draw it without lifting your pencil. A discontinuity is any break, gap, or bad behavior in the graph. But not all breaks are equal. Mathematicians classify discontinuities into four types based on what the limits are doing.',

      '**Type 1: Removable Discontinuity (a "hole").** The two-sided limit exists — approaching from the left and right gives the same value — but either $f(c)$ is undefined, or $f(c)$ equals something different from the limit. The graph looks like a normal curve with a single point missing or relocated. Example: $f(x) = (x^2 - 4)/(x - 2)$. At $x = 2$: division by zero. But $\\lim_{x \\to 2} f(x) = 4$. The limit exists! If we just define $f(2) = 4$, the function becomes continuous. The discontinuity was "removable" — a hole we can fill.',

      '**Type 2: Jump Discontinuity.** The left-hand limit and right-hand limit both exist but are different. The graph "jumps" from one value to another. Example: $f(x) = 0$ for $x < 0$ and $f(x) = 1$ for $x \\geq 0$. As $x \\to 0^-$, $f(x) \\to 0$. As $x \\to 0^+$, $f(x) \\to 1$. These are different, so the two-sided limit DNE. You cannot remove this discontinuity — the function has fundamentally different behavior on the two sides. Think: a switch that goes from OFF (0) to ON (1) in zero time.',

      '**Type 3: Infinite Discontinuity (vertical asymptote).** At least one one-sided limit is $\\pm \\infty$. The graph shoots off to infinity. Example: $f(x) = 1/x$ at $x = 0$. As $x \\to 0^+$, $f(x) \\to +\\infty$. As $x \\to 0^-$, $f(x) \\to -\\infty$. Neither limit exists as a real number. Vertical asymptotes are infinite discontinuities. In physics: gravitational force $F = Gm_1 m_2/r^2$ has an infinite discontinuity at $r = 0$ — two objects cannot occupy the same point.',

      '**Type 4: Oscillating Discontinuity (essential).** The function oscillates so wildly near the point that no limit exists, even $\\pm\\infty$. The classic example is $f(x) = \\sin(1/x)$ at $x = 0$. As $x \\to 0$, the argument $1/x \\to \\infty$ and $\\sin(1/x)$ oscillates infinitely many times between $-1$ and $+1$, never settling. No limit exists. This is the "worst" kind of discontinuity — no reasonable value can patch it.',

      '**The classification matters for calculus.** Integration: removable discontinuities do not affect integrals (a single point has zero area). Jump discontinuities create a change in the integral\'s value at that point. Infinite discontinuities may create improper integrals that diverge. Differentiation: none of these discontinuous functions are differentiable at the point of discontinuity — differentiability implies continuity.',

      '**Historical note.** Bernhard Riemann (1826–1866) gave the first systematic analysis of discontinuities. He showed that a function with only finitely many jump discontinuities is still integrable in his sense (the Riemann integral). This was revolutionary — before Riemann, most mathematicians thought discontinuous functions were "pathological." Today we know that many important functions (step functions, square waves, probability distributions) are naturally discontinuous.',
    ],
    callouts: [
      {
        type: 'vocabulary',
        title: 'The Four Types at a Glance',
        body: '**Removable**: lim exists, but f(c) ≠ limit (or f undefined). Graph: a hole.\n**Jump**: left and right limits exist but are unequal. Graph: a vertical gap.\n**Infinite**: at least one one-sided limit is ±∞. Graph: vertical asymptote.\n**Oscillating**: no limit exists and it is not infinite. Graph: infinite wiggling.',
      },
      {
        type: 'technique',
        title: 'How to Classify a Discontinuity',
        body: '(1) Check if the limit from the left equals the limit from the right. (2) If yes and it\'s finite → removable. (3) If both one-sided limits are finite but unequal → jump. (4) If either one-sided limit is ±∞ → infinite. (5) If no limit exists for any other reason → oscillating.',
      },
      {
        type: 'misconception',
        title: '"Removable" Does Not Mean the Function Is Continuous',
        body: 'A removable discontinuity means we COULD make the function continuous by defining or redefining f at one point. But the original function is still discontinuous there. We just have an easy fix available.',
      },
      {
        type: 'tip',
        title: 'Jump + Infinite = Essential (Non-Removable)',
        body: 'Both jump and infinite discontinuities are sometimes called "essential" or "non-removable" discontinuities, because no single value of f(c) makes the function continuous. Only removable discontinuities can be fixed by redefining the function at one point.',
      },
      {
        type: 'real-world',
        title: 'Tax Brackets: Jump Discontinuities in Your Life',
        body: 'In many tax systems, the marginal rate changes at income thresholds: you pay 10% up to $10K, 22% from $10K-$40K, etc. The marginal tax rate function has jump discontinuities at each bracket boundary. This is why tax planning exists — behavior near the jump point matters a lot.',
      },
    ],
    visualizations: [
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Arc Length of a Curve ( Smooth Curve ) Calculus 1 BC 5 Examples",
        url: "https://www.youtube.com/embed/ReewypjBiVQ"
      }
    },
    {
      type: "react",
      component: "VideoEmbed",
      params: {
        title: "Second Fundamental Theorem Calculus 1 AB",
        url: "https://www.youtube.com/embed/Ku2d2dPGg2g"
      }
    },
      {
        id: 'VideoEmbed',
        title: "What is an infinite limit?",
        props: { url: "https://www.youtube.com/embed/5hfHbOCeFoU" }
      },
      {
        id: 'HoleVsValue',
        title: 'Removable Discontinuity: Hole vs. Redefined Value',
        caption: 'Compare three scenarios: the function has a hole (undefined), the hole is filled at the wrong height (still discontinuous), and the hole is filled correctly (continuous). Only the last is continuous.',
      },
      {
        id: 'TwoSidedLimit',
        title: 'Jump Discontinuity',
        caption: 'Left and right particles approach from opposite sides but land at different heights — the two-sided limit does not exist.',
      },
      {
        id: 'OscillationViz',
        title: 'Oscillating Discontinuity: sin(1/x)',
        caption: 'As x → 0, sin(1/x) oscillates infinitely rapidly. No limit exists.',
      },
    ],
  },

  math: {
    prose: [
      '**Formal definition of continuity.** $f$ is continuous at $c$ iff (1) $f(c)$ is defined, (2) $\\lim_{x \\to c} f(x)$ exists, and (3) $\\lim_{x \\to c} f(x) = f(c)$. A discontinuity is any failure of (1), (2), or (3).',

      '**Removable discontinuity.** $\\lim_{x \\to c} f(x) = L$ exists (and is finite), but either $f(c) \\neq L$ or $f(c)$ is undefined. The extended function $\\tilde{f}(x) = f(x)$ for $x \\neq c$, $\\tilde{f}(c) = L$ is continuous. Common cause: factor cancellation creates a hole. Example: $f(x) = \\frac{x^2 - 1}{x - 1} = x + 1$ for $x \\neq 1$; hole at $x = 1$.',

      '**Jump discontinuity.** Both one-sided limits exist and are finite: $\\lim_{x \\to c^-} f(x) = L^-$ and $\\lim_{x \\to c^+} f(x) = L^+$, but $L^- \\neq L^+$. The "jump" is $|L^+ - L^-|$. Example: the Heaviside step function $H(x) = 0$ for $x < 0$, $H(x) = 1$ for $x \\geq 0$ has a jump of 1 at $x = 0$.',

      '**Infinite discontinuity.** At least one of $\\lim_{x \\to c^-} f(x)$ or $\\lim_{x \\to c^+} f(x)$ is $+\\infty$ or $-\\infty$. This signals a vertical asymptote. Example: $f(x) = \\tan x$ has infinite discontinuities at $x = \\pi/2 + n\\pi$.',

      '**Oscillating (essential) discontinuity.** $\\lim_{x \\to c} f(x)$ does not exist and is not $\\pm \\infty$. Example: $f(x) = \\sin(1/x)$ at $x = 0$. For any $L$, we can find $x$ arbitrarily close to 0 with $|f(x) - L| > 0.5$, so no limit can exist.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Classification Summary',
        body: '**Removable**: $\\lim_{x\\to c} f(x)$ exists (finite), $f(c) \\neq$ limit or undefined. **Jump**: $\\lim_{x\\to c^-}$ and $\\lim_{x\\to c^+}$ both finite but unequal. **Infinite**: $\\lim_{x\\to c^\\pm} = \\pm\\infty$. **Oscillating**: none of the above.',
      },
      {
        type: 'theorem',
        title: 'Riemann Integrability',
        body: 'A bounded function on $[a,b]$ is Riemann integrable if and only if its set of discontinuities has measure zero. Equivalently: finitely many jump or removable discontinuities are OK for integration; infinitely many in a "dense" set are not.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Why oscillating discontinuities are "worse."** For a removable discontinuity, we can extend the function continuously. For a jump discontinuity, we can integrate over it (the single "gap" has zero width and does not affect the integral). But for oscillating discontinuities like $\\sin(1/x)$ at $x = 0$: the function is bounded but its set of oscillations accumulates at 0, making it Riemann integrable (the discontinuity set $\\{0\\}$ has measure zero) — yet the behavior is chaotic and no simple description of the limit exists.',

      '**Connection to differentiability.** A function that is differentiable at $c$ must be continuous at $c$ (contrapositive: discontinuous $\\Rightarrow$ not differentiable). But continuity does NOT imply differentiability — the absolute value function $|x|$ is continuous everywhere but not differentiable at $x = 0$ (a corner, not a discontinuity). The Weierstrass function is continuous everywhere but differentiable nowhere — an extreme case.',

      '**Lebesgue\'s improvement.** Henri Lebesgue (1902) developed a theory of integration that handles more discontinuities than Riemann\'s. The Lebesgue integral of any bounded function exists as long as the discontinuity set has "Lebesgue measure zero." Roughly: if the set of discontinuities fits inside intervals of total length less than $\\varepsilon$ for any $\\varepsilon > 0$, it is OK. This is why Lebesgue integration is used in advanced probability theory and functional analysis.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Differentiability Implies Continuity',
        body: 'If $f$ is differentiable at $c$, then $f$ is continuous at $c$. Proof: $f(c+h) - f(c) = h \\cdot \\frac{f(c+h)-f(c)}{h} \\to 0 \\cdot f\'(c) = 0$ as $h \\to 0$. So $\\lim_{x\\to c} f(x) = f(c)$.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ch1-disc-ex1',
      title: 'Classify the Discontinuity of a Rational Function',
      problem: 'Classify the discontinuity of $f(x) = \\dfrac{x^2 - 4}{x - 2}$ at $x = 2$.',
      steps: [
        { expression: 'f(2) = \\frac{0}{0} \\text{ (undefined)}.', annotation: 'The function is undefined at x = 2.' },
        { expression: '\\frac{x^2 - 4}{x - 2} = \\frac{(x-2)(x+2)}{x-2} = x+2 \\quad (x \\neq 2)', annotation: 'Factor and cancel for x ≠ 2.' },
        { expression: '\\lim_{x \\to 2} f(x) = \\lim_{x \\to 2} (x+2) = 4', annotation: 'The limit exists and equals 4.' },
        { expression: '\\text{Type: Removable discontinuity (hole at } (2, 4)\\text{)}.', annotation: 'Limit exists but function undefined there. Fix: define f(2) = 4.' },
      ],
      conclusion: 'Removable discontinuity at x = 2. The graph of f is the line y = x+2 with a hole at (2, 4).',
    },
    {
      id: 'ch1-disc-ex2',
      title: 'Classify Discontinuity in a Piecewise Function',
      problem: 'Classify discontinuities of $f(x) = \\begin{cases} x + 1 & x < 1 \\\\ 3 & x = 1 \\\\ x^2 & x > 1 \\end{cases}$',
      steps: [
        { expression: '\\lim_{x \\to 1^-} f(x) = \\lim_{x \\to 1^-} (x+1) = 2', annotation: 'Left-hand limit: approach from x < 1.' },
        { expression: '\\lim_{x \\to 1^+} f(x) = \\lim_{x \\to 1^+} x^2 = 1', annotation: 'Right-hand limit: approach from x > 1.' },
        { expression: 'f(1) = 3', annotation: 'Function value at x = 1.' },
        { expression: 'L^- = 2 \\neq 1 = L^+', annotation: 'Both one-sided limits exist but are unequal.' },
        { expression: '\\text{Type: Jump discontinuity with jump size } |2 - 1| = 1.', annotation: 'The function value 3 is irrelevant to the classification — what matters is the one-sided limits.' },
      ],
      conclusion: 'Jump discontinuity at x = 1. The left limit (2) and right limit (1) are both finite but different. Neither equals f(1) = 3.',
    },
    {
      id: 'ch1-disc-ex3',
      title: 'Classify Infinite Discontinuity',
      problem: 'Classify the discontinuity of $f(x) = \\dfrac{1}{(x-3)^2}$ at $x = 3$.',
      steps: [
        { expression: '\\lim_{x \\to 3^-} \\frac{1}{(x-3)^2}', annotation: 'As x → 3 from the left, (x−3)² → 0⁺, so the fraction → +∞.' },
        { expression: '\\lim_{x \\to 3^+} \\frac{1}{(x-3)^2} = +\\infty', annotation: 'As x → 3 from the right, same: (x−3)² → 0⁺, fraction → +∞.' },
        { expression: '\\text{Type: Infinite discontinuity.}', annotation: 'Both one-sided limits are +∞. This is a vertical asymptote.' },
        { expression: '\\text{Note: Both sides go to } +\\infty \\text{ (not opposite signs).}', annotation: 'Unlike 1/x, the square in the denominator makes both sides positive.' },
      ],
      conclusion: 'Infinite discontinuity (vertical asymptote) at x = 3. Both sides approach +∞, so the graph shoots upward on both sides of x = 3.',
    },
    {
      id: 'ch1-disc-ex4',
      title: 'Identify and Remove a Discontinuity',
      problem: 'Find all discontinuities of $g(x) = \\dfrac{\\sin(x)}{x}$ for $x \\in \\mathbb{R}$, classify them, and extend $g$ to a continuous function.',
      steps: [
        { expression: 'g(0) \\text{ is undefined (division by zero)}.', annotation: 'Potential discontinuity only at x = 0.' },
        { expression: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', annotation: 'The fundamental trig limit (proven geometrically via Squeeze Theorem).' },
        { expression: '\\text{Type: Removable discontinuity at } x = 0.', annotation: 'Limit exists (= 1) but g(0) is undefined.' },
        { expression: '\\tilde{g}(x) = \\begin{cases} \\sin(x)/x & x \\neq 0 \\\\ 1 & x = 0 \\end{cases}', annotation: 'Define ĝ(0) = 1 to fill the hole.' },
        { expression: '\\tilde{g} \\text{ is continuous everywhere.}', annotation: 'This extended function is called the sinc function (unnormalized) and is fundamental in signal processing.' },
      ],
      conclusion: 'One removable discontinuity at x = 0. The sinc function is the continuous extension. It appears everywhere in Fourier analysis and signal processing.',
    },
  ],

  challenges: [
    {
      id: 'ch1-disc-c1',
      difficulty: 'medium',
      problem: 'For what value(s) of $a$ is $f(x) = \\begin{cases} x^2 - 3 & x < 2 \\\\ ax + 1 & x \\geq 2 \\end{cases}$ continuous everywhere?',
      hint: 'For continuity at x = 2, you need the left-hand limit = right-hand limit = f(2). Compute both and solve for a.',
      walkthrough: [
        { expression: '\\lim_{x \\to 2^-} f(x) = (2)^2 - 3 = 4 - 3 = 1', annotation: 'Left-hand limit: use the formula for x < 2.' },
        { expression: '\\lim_{x \\to 2^+} f(x) = a(2) + 1 = 2a + 1', annotation: 'Right-hand limit: use the formula for x ≥ 2.' },
        { expression: 'f(2) = a(2) + 1 = 2a + 1', annotation: 'Function value at x = 2 (since 2 ≥ 2, use the second piece).' },
        { expression: '1 = 2a + 1 \\Rightarrow a = 0', annotation: 'Set left-hand limit = right-hand limit and solve for a.' },
      ],
      answer: 'a = 0. Then f(x) = x² − 3 for x < 2 and f(x) = 1 for x ≥ 2, with both pieces agreeing at x = 2 (value = 1).',
    },
    {
      id: 'ch1-disc-c2',
      difficulty: 'hard',
      problem: 'Prove that $f(x) = \\sin(1/x)$ cannot be extended to a continuous function at $x = 0$ by any definition of $f(0)$.',
      hint: 'Show that for any proposed value L = f(0), you can find x values arbitrarily close to 0 where f(x) is far from L. Use the fact that sin(1/x) = 1 when x = 2/(π + 4kπ) and sin(1/x) = -1 when x = 2/(3π + 4kπ).',
      walkthrough: [
        { expression: '\\text{Suppose } f(0) = L \\text{ for some } L \\in [-1, 1].', annotation: 'Assume for contradiction that some extension works.' },
        { expression: 'x_k = \\frac{2}{\\pi + 4k\\pi} \\to 0 \\text{ as } k \\to \\infty, \\quad \\sin(1/x_k) = 1', annotation: 'These x-values approach 0 but f(x_k) = 1 always.' },
        { expression: 'y_k = \\frac{2}{3\\pi + 4k\\pi} \\to 0 \\text{ as } k \\to \\infty, \\quad \\sin(1/y_k) = -1', annotation: 'These x-values approach 0 but f(y_k) = -1 always.' },
        { expression: '\\text{If } L = 1: |f(y_k) - L| = 2 \\not\\to 0.', annotation: 'f stays at -1 along the y_k sequence, not at L = 1.' },
        { expression: '\\text{If } L = -1: |f(x_k) - L| = 2 \\not\\to 0.', annotation: 'f stays at 1 along the x_k sequence, not at L = -1.' },
        { expression: '\\text{Any other } L: \\text{ both sequences give } |f - L| \\geq 1 > 0.', annotation: 'For any L, at least one of the sequences is distance ≥ 1 from L.' },
        { expression: '\\therefore \\nexists \\lim_{x \\to 0} \\sin(1/x) \\Rightarrow \\text{no continuous extension.}', annotation: 'QED. The oscillating discontinuity cannot be removed by any choice of f(0).' },
      ],
      answer: 'No value of f(0) makes sin(1/x) continuous at 0. The oscillating discontinuity is essential.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'continuity', label: 'Continuity', context: 'This lesson builds directly on the definition of continuity.' },
    { lessonSlug: 'intermediate-value-theorem', label: 'Intermediate Value Theorem', context: 'IVT applies only to continuous functions — discontinuities break it.' },
    { lessonSlug: 'limits-at-infinity', label: 'Limits at Infinity', context: 'Infinite discontinuities and vertical asymptotes connect to horizontal asymptotes.' },
    { lessonSlug: 'improper-integrals', label: 'Improper Integrals', context: 'Infinite discontinuities in the integrand create improper integrals.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge-1'],
}
