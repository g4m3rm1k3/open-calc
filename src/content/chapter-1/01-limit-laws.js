export default {
  id: 'ch1-limit-laws',
  slug: 'limit-laws',
  chapter: 1,
  order: 1,
  title: 'Limit Laws',
  subtitle: 'Algebraic rules so you don\'t need tables every time',
  tags: ['limit laws', 'sum rule', 'product rule', 'quotient rule', 'squeeze theorem', 'sandwich theorem', 'direct substitution', 'sin(x)/x'],

  hook: {
    question: 'Can you compute lim(x→2)(3x² − x + 5) without making a table of values?',
    realWorldContext:
      'Of course — just plug in x = 2 and get 3(4) − 2 + 5 = 15. You already knew this intuitively. The limit laws are the mathematical justification for why direct substitution works for "nice" functions. ' +
      'They also let you break complicated limits into simpler pieces, each of which is easy to compute. ' +
      'And the Squeeze Theorem is the secret weapon for limits like lim(x→0) x·sin(1/x) that completely defy algebraic manipulation — the function oscillates wildly near 0, yet its limit is pinned to 0 by being sandwiched between −x and x.',
    previewVisualizationId: 'LimitApproach',
  },

  intuition: {
    prose: [
      'The limit laws capture an intuitive idea: if two functions are each settling down to their respective limits, then their combinations (sum, product, etc.) should settle to the corresponding combination of those limits.',

      'Think about it physically: if the temperature at location A approaches 20°C and the temperature at location B approaches 30°C, then the average of the two temperatures approaches (20 + 30)/2 = 25°C. No surprise. The Sum Law and Constant Multiple Law say the same thing for limits.',

      'The **Squeeze Theorem** (also called the Sandwich Theorem) is a different kind of tool. Sometimes a function is too complicated to evaluate directly, but you can pin it between two simpler functions that both approach the same value. Like a hot dog in a bun — the hot dog is forced to stay where the bun takes it.',

      'The canonical example: f(x) = x·sin(1/x). As x → 0, sin(1/x) oscillates infinitely rapidly — it doesn\'t have a limit on its own. But |sin(anything)| ≤ 1, so −|x| ≤ x·sin(1/x) ≤ |x|. Both −|x| and |x| approach 0, so x·sin(1/x) is squeezed to 0.',

      'The most important limits in calculus are the two "fundamental trig limits": lim(x→0) sin(x)/x = 1 and lim(x→0) (1−cos x)/x = 0. These cannot be proved by algebra alone — they require the Squeeze Theorem plus a geometric argument about areas on the unit circle. They come up in every derivative of a trig function.',
    ],
    callouts: [
      {
        type: 'intuition',
        title: 'The Squeeze in a picture',
        body: 'g(x) ≤ f(x) ≤ h(x) near c. Both g and h → L. Then f is squeezed: f must also → L.',
      },
      {
        type: 'tip',
        title: 'When to use the Squeeze Theorem',
        body: 'Look for |f(x)| ≤ something simpler. Specifically: if you see sin, cos, or any oscillating/bounded function multiplied by something that → 0, the Squeeze Theorem likely applies.',
      },
    ],
    visualizationId: 'SqueezeTheorem',
    visualizationProps: {},
    visualizations: [
    {
        id: 'VideoEmbed',
        title: "Derivative of Inverse Trigonometric Functions Examples Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/5lhvYhd-9uM" }
      },
    {
        id: 'VideoEmbed',
        title: "Derivative Rules for Inverse Trigonometric Functions Derived Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/zKYsFuKjtyo" }
      },
    {
        id: 'VideoEmbed',
        title: "First Fundamental Theorem of Calculus Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/YWv5v8PppzU" }
      },
    {
        id: 'VideoEmbed',
        title: "Squeeze Theorem for Sequences Sandwich Theorem Calculus 1",
        props: { url: "https://www.youtube.com/embed/M1Yv1f8sAw0" }
      },
    {
        id: 'VideoEmbed',
        title: "Limits of Trig Functions Special Ratios 3 Examples 4k",
        props: { url: "https://www.youtube.com/embed/Q5WixlWNlTQ" }
      },
    {
        id: 'VideoEmbed',
        title: "Why Limits are Important in Calculus",
        props: { url: "https://www.youtube.com/embed/xFu7xdXFfBs" }
      },
      {
        id: 'VideoEmbed',
        title: "Limit Laws | Breaking Up Complicated Limits Into Simpler Ones",
        props: { url: "https://www.youtube.com/embed/dY5T7BcQ2Nc" }
      },
      {
        id: 'LimitBridgeLab',
        title: 'Limit Law Bridge Lab',
        caption: 'Use two-sided approach controls to verify when decomposition rules are safe and when naive substitution fails.',
      },
    ],
  },

  math: {
    prose: [
      'Assume lim(x→c) f(x) = L and lim(x→c) g(x) = M. Then the limit laws say we can compute limits of combinations.',

      '**Direct Substitution Property**: if p(x) is a polynomial, lim(x→c) p(x) = p(c). If r(x) = p(x)/q(x) is a rational function and q(c) ≠ 0, then lim(x→c) r(x) = r(c). This also extends to trig, exponential, and logarithmic functions at points where they are defined.',

      '**The two fundamental trig limits** cannot be derived from the laws above — they require a geometric proof or the definition of the derivative. They are:',
      '• lim(x→0) sin(x)/x = 1',
      '• lim(x→0) (1 − cos x)/x = 0',

      'These appear constantly. A useful technique: whenever you see sin(ax)/x or sin(ax)/(bx), force the pattern sin(u)/u by multiplying and dividing by a:',
      'lim(x→0) sin(5x)/x = lim(x→0) [sin(5x)/(5x)] · 5 = 1 · 5 = 5',

      '**Limits of composite functions**: if lim(x→c) g(x) = M and f is continuous at M, then lim(x→c) f(g(x)) = f(M). This is why lim(x→0) √(x²+1) = √(0+1) = 1 — the square root function is continuous at 1.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Limit Laws',
        body: '\\lim[f \\pm g] = L \\pm M \\\\ \\lim[f \\cdot g] = L \\cdot M \\\\ \\lim[f/g] = L/M \\quad (M \\neq 0) \\\\ \\lim[f^n] = L^n \\quad (n \\in \\mathbb{Z}^+) \\\\ \\lim[k \\cdot f] = k \\cdot L \\\\ \\lim[\\sqrt[n]{f}] = \\sqrt[n]{L} \\quad (\\text{if defined})',
      },
      {
        type: 'theorem',
        title: 'Squeeze Theorem',
        body: '\\text{If } g(x) \\leq f(x) \\leq h(x) \\text{ near } c, \\text{ and} \\\\ \\lim_{x \\to c} g(x) = \\lim_{x \\to c} h(x) = L, \\\\ \\text{then } \\lim_{x \\to c} f(x) = L.',
      },
      {
        type: 'theorem',
        title: 'Two Fundamental Trig Limits',
        body: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0',
      },
    ],
    visualizationId: 'LimitApproach',
    visualizationProps: { fn: 'Math.sin(x)/x', targetX: 0, limitVal: 1, showTable: true },
  
      visualizations: [
      {
        id: 'VideoEmbed',
        title: "Building up to computing limits of rational functions",
        props: { url: "https://www.youtube.com/embed/XDcy_wqWQVs" }
      },
      ],
    },

  rigor: {
    prose: [
      'Each limit law is a provable theorem. The proofs all follow the same template: assume the limits of f and g exist, invoke the definitions to get δ₁ and δ₂ for each, then combine them (usually taking δ = min(δ₁, δ₂)).',

      'The proof of the Sum Law (given below) uses the **triangle inequality** |a + b| ≤ |a| + |b| (play with the interactive geometric proof of this below, or check the Prerequisites inequalities lesson). This is the fundamental tool in analysis — it lets you break one error estimate into the sum of two smaller ones.',

      'The Squeeze Theorem proof is especially clean: if g(x) ≤ f(x) ≤ h(x) and both g and h are within ε of L, then g(x) > L − ε and h(x) < L + ε, which forces L − ε < f(x) < L + ε, i.e., |f(x) − L| < ε.',

      'The proof that lim(x→0) sin(x)/x = 1 uses a geometric argument: comparing the areas of two triangles and a circular sector on the unit circle. This gives the inequality cos(x) < sin(x)/x < 1 for 0 < x < π/2, and the Squeeze Theorem finishes it.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Proof of the Sum Law',
        body: '\\text{Given } \\varepsilon > 0. \\text{ Choose } \\delta_1: |x-c|<\\delta_1 \\Rightarrow |f-L|<\\varepsilon/2. \\\\ \\text{Choose } \\delta_2: |x-c|<\\delta_2 \\Rightarrow |g-M|<\\varepsilon/2. \\\\ \\text{Let } \\delta = \\min(\\delta_1,\\delta_2). \\text{ Then:} \\\\ |(f+g)-(L+M)| \\leq |f-L|+|g-M| < \\tfrac{\\varepsilon}{2}+\\tfrac{\\varepsilon}{2} = \\varepsilon \\;\\blacksquare',
      },
    ],
    visualizationId: 'TriangleInequalityViz',
  },

  examples: [
    {
      id: 'ex-direct-sub',
      title: 'Using Direct Substitution and Limit Laws',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 2} \\frac{3x^2 - x + 1}{x + 5}.',
      steps: [
        { expression: '\\lim_{x \\to 2} \\frac{3x^2-x+1}{x+5}', annotation: 'Check denominator: x + 5 = 7 ≠ 0 at x = 2. Direct substitution is valid.' },
          { expression: '\\lim_{x \\to 2} \\frac{3x^2-x+1}{x+5}', annotation: 'Check denominator: x + 5 = 7 ≠ 0 at x = 2. Direct substitution is valid.', hints: ['First verify the denominator is nonzero at x = 2.', 'Since the denominator is 7, direct substitution is allowed.'] },
        { expression: '= \\frac{3(2)^2 - (2) + 1}{(2)+5}', annotation: 'Substitute x = 2 in both numerator and denominator.', hints: ['Replace every x with 2.', 'Evaluate numerator and denominator separately.'] },
        { expression: '= \\frac{3 \\cdot 4 - 2 + 1}{7} = \\frac{12 - 2 + 1}{7} = \\frac{11}{7}', annotation: '', hints: ['Compute 2^2 = 4, then multiply by 3.', 'Simplify the numerator to 11 and divide by 7.'] },
      ],
      conclusion: '11/7. Since the denominator is nonzero, this is simply function evaluation.',
    },
    {
      id: 'ex-squeeze',
      title: 'The Squeeze Theorem in Action',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} x^2 \\sin\\!\\left(\\frac{1}{x}\\right).',
      steps: [
        { expression: '\\text{Attempt: direct substitution gives } 0 \\cdot \\sin(1/0)', annotation: 'sin(1/x) is undefined at x = 0, and oscillates infinitely rapidly near 0. We cannot substitute or factor.' },
        { expression: '-1 \\leq \\sin\\!\\left(\\frac{1}{x}\\right) \\leq 1 \\quad \\text{for all } x \\neq 0', annotation: 'The sine function is always between −1 and 1, regardless of its argument.' },
        { expression: '-x^2 \\leq x^2 \\sin\\!\\left(\\frac{1}{x}\\right) \\leq x^2', annotation: 'Multiply all three parts by x² ≥ 0. Multiplying by a non-negative number preserves inequalities.' },
        { expression: '\\lim_{x \\to 0}(-x^2) = 0 \\qquad \\lim_{x \\to 0}(x^2) = 0', annotation: 'Both bounding functions approach 0 (direct substitution for polynomials).' },
        { expression: '\\therefore \\lim_{x \\to 0} x^2 \\sin\\!\\left(\\frac{1}{x}\\right) = 0', annotation: 'By the Squeeze Theorem: our function is sandwiched between −x² and x², both → 0, so it is squeezed to 0.' },
      ],
      conclusion: 'The limit is 0. The key was recognizing that the complicated oscillating part (sin(1/x)) is bounded, and the bounding function (x²) controls the overall limit.',
    },
    {
      id: 'ex-sin-over-x',
      title: 'Using the Fundamental Limit sin(x)/x',
      problem: 'Evaluate (a) \\displaystyle\\lim_{x \\to 0} \\frac{\\sin 5x}{x}, \\quad (b) \\lim_{x \\to 0} \\frac{\\sin 3x}{\\sin 7x}.',
      steps: [
        { expression: '\\textbf{(a) } \\lim_{x \\to 0} \\frac{\\sin 5x}{x}', annotation: 'Direct substitution: 0/0. The fundamental limit is sin(u)/u = 1, so we need to create the pattern sin(5x)/(5x).' },
        { expression: '= \\lim_{x \\to 0} \\frac{\\sin 5x}{x} \\cdot \\frac{5}{5}', annotation: 'Multiply and divide by 5 (multiply by 1 = 5/5).' },
        { expression: '= 5 \\cdot \\lim_{x \\to 0} \\frac{\\sin 5x}{5x}', annotation: 'Factor out 5.' },
        { expression: '= 5 \\cdot 1 = 5', annotation: 'Let u = 5x. As x → 0, u → 0. So lim sin(5x)/(5x) = lim sin(u)/u = 1.' },
        { expression: '', annotation: '' },
        { expression: '\\textbf{(b) } \\lim_{x \\to 0} \\frac{\\sin 3x}{\\sin 7x}', annotation: 'Divide top and bottom by x to create two copies of the pattern.' },
        { expression: '= \\lim_{x \\to 0} \\frac{\\sin 3x / x}{\\sin 7x / x}', annotation: 'Divide numerator and denominator by x.' },
        { expression: '= \\lim_{x \\to 0} \\frac{3 \\cdot \\frac{\\sin 3x}{3x}}{7 \\cdot \\frac{\\sin 7x}{7x}}', annotation: 'Factor to create sin(3x)/(3x) and sin(7x)/(7x).' },
        { expression: '= \\frac{3 \\cdot 1}{7 \\cdot 1} = \\frac{3}{7}', annotation: 'Both → 1 as x → 0.' },
      ],
      conclusion: '(a) 5, (b) 3/7. General pattern: lim(x→0) sin(ax)/(bx) = a/b.',
    },
    {
      id: 'ex-cos-limit',
      title: 'Using the Second Fundamental Trig Limit',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}.',
      steps: [
        { expression: '\\lim_{x \\to 0} \\frac{1-\\cos x}{x^2}', annotation: '0/0 form. Strategy: multiply by (1+cos x)/(1+cos x) to use the Pythagorean identity.' },
        { expression: '= \\lim_{x \\to 0} \\frac{(1-\\cos x)(1+\\cos x)}{x^2(1+\\cos x)}', annotation: '' },
        { expression: '= \\lim_{x \\to 0} \\frac{1 - \\cos^2 x}{x^2(1+\\cos x)}', annotation: 'Numerator: (1−cos x)(1+cos x) = 1 − cos²x.' },
        { expression: '= \\lim_{x \\to 0} \\frac{\\sin^2 x}{x^2(1+\\cos x)}', annotation: '1 − cos²x = sin²x (Pythagorean identity).' },
        { expression: '= \\lim_{x \\to 0} \\left(\\frac{\\sin x}{x}\\right)^2 \\cdot \\frac{1}{1+\\cos x}', annotation: 'Split into recognizable pieces.' },
        { expression: '= (1)^2 \\cdot \\frac{1}{1 + 1} = \\frac{1}{2}', annotation: 'sin(x)/x → 1, and cos(0) = 1 by direct substitution.' },
      ],
      conclusion: '1/2. This limit appears when computing d/dx[cos x] from the definition of the derivative.',
    },
    {
      id: 'ex-limit-composite',
      title: 'Limit of a Composite Function',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} \\cos\\!\\left(\\frac{\\sin x}{x}\\right).',
      steps: [
        { expression: '\\lim_{x \\to 0} \\cos\\!\\left(\\frac{\\sin x}{x}\\right)', annotation: 'This is a composition: cos applied to sin(x)/x.', hints: ['Identify the inner limit first.', 'The outer cosine can be handled after the inner limit is known.'] },
        { expression: '\\text{Step 1: find the inner limit.}', annotation: '', hints: ['Focus on sin(x)/x before touching cosine.', 'The inner limit is the key input to the outer function.'] },
        { expression: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', annotation: 'The fundamental trig limit.', hints: ['Use the standard limit lim sin x / x = 1.', 'As x approaches 0, the ratio approaches 1.'] },
        { expression: '\\text{Step 2: apply cos to the inner limit.}', annotation: 'Since cos is continuous everywhere, we can "pass the limit through" the outer function.', hints: ['Cosine is continuous at 1.', 'Apply cos after taking the inner limit.'] },
        { expression: '= \\cos(1)', annotation: '', hints: ['Substitute the inner limit 1 into cosine.', 'The result is cos(1).'] },
        { expression: '\\approx 0.5403', annotation: 'Numerical value for reference.', hints: ['Compute the decimal approximation of cos(1).', 'This is just a calculator check.'] },
      ],
      conclusion: 'cos(1) ≈ 0.5403. Rule: for a continuous outer function, lim f(g(x)) = f(lim g(x)) — you can pull continuous functions out of limits.',
    },
  ],

  challenges: [
    {
      id: 'ch1-laws-c1',
      difficulty: 'medium',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} \\frac{\\tan x}{x}.',
      hint: 'Write tan x = sin x / cos x, then separate into a product of two limits.',
      walkthrough: [
        { expression: '\\lim_{x \\to 0} \\frac{\\tan x}{x} = \\lim_{x \\to 0} \\frac{\\sin x}{x \\cos x}', annotation: '' },
        { expression: '= \\lim_{x \\to 0} \\frac{\\sin x}{x} \\cdot \\lim_{x \\to 0} \\frac{1}{\\cos x}', annotation: 'Product Law — both limits exist.' },
        { expression: '= 1 \\cdot \\frac{1}{\\cos 0} = 1 \\cdot 1 = 1', annotation: '' },
      ],
      answer: '1',
    },
    {
      id: 'ch1-laws-c2',
      difficulty: 'hard',
      problem: 'Prove the Product Law: if \\lim_{x \\to c} f(x) = L and \\lim_{x \\to c} g(x) = M, then \\lim_{x \\to c} f(x)g(x) = LM.',
      hint: 'Write |f·g − LM| = |f·g − Lg + Lg − LM| and use the triangle inequality. You will need to bound |f| near c.',
      walkthrough: [
        { expression: '|f(x)g(x) - LM|', annotation: 'We want to show this is < ε.' },
        { expression: '= |f(x)g(x) - Lg(x) + Lg(x) - LM|', annotation: 'Add and subtract Lg(x) — a standard "add zero" trick.' },
        { expression: '\\leq |f(x)-L|\\cdot|g(x)| + |L|\\cdot|g(x)-M|', annotation: 'Triangle inequality, then factor.' },
        { expression: '\\text{Bound } |g(x)|: \\text{ since } g \\to M, \\exists\\,\\delta_1: |g(x)| < |M|+1.', annotation: 'Near c, g(x) is within 1 of M, so |g| < |M|+1.' },
        { expression: '|f(x)g(x)-LM| < |f(x)-L|\\cdot(|M|+1) + |L|\\cdot|g(x)-M|', annotation: '' },
        { expression: '\\text{Choose } \\delta_2: |f-L|<\\frac{\\varepsilon}{2(|M|+1)}, \\quad \\delta_3: |g-M|<\\frac{\\varepsilon}{2(|L|+1)}', annotation: 'Use ε/2 for each part (with +1 to avoid division by zero when L = 0).' },
        { expression: '\\text{Total: } < \\frac{\\varepsilon}{2}+\\frac{\\varepsilon}{2} = \\varepsilon \\;\\blacksquare', annotation: 'Set δ = min(δ₁, δ₂, δ₃).' },
      ],
      answer: 'Proved via ε-δ with a bounding argument',
    },
  ],

  crossRefs: [
    { lessonSlug: 'inequalities', label: 'Prerequisite: Inequalities', context: 'Understanding the Triangle Inequality is strictly required to prove the limit laws.' },
    { lessonSlug: 'fundamental-trig-limits', label: 'Deep Dive: Fundamental Trig Limits', context: 'If sin(x)/x and (1-cos x)/x feel shaky, use the focused lesson for slower proofs and pattern drills.' },
    { lessonSlug: 'introduction', label: 'Previous: Introduction to Limits', context: 'Informal concept and ε-δ definition.' },
    { lessonSlug: 'continuity', label: 'Next: Continuity', context: 'A function is continuous if its limit equals its value.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
