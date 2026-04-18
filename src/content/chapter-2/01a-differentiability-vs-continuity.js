export default {
  id: 'ch2-differentiability-vs-continuity',
  slug: 'differentiability-vs-continuity',
  chapter: 2,
  order: 1,
  title: 'Differentiability vs. Continuity',
  subtitle: 'Corners, cusps, and vertical tangents — when smoothness breaks down',
  tags: ['differentiability', 'continuity', 'corners', 'cusps', 'vertical-tangent', 'non-differentiable', 'left-derivative', 'right-derivative'],

  hook: {
    question: 'If a function is continuous everywhere, can it still fail to have a derivative somewhere?',
    realWorldContext:
      'Yes — spectacularly. The absolute value function |x| is perfectly continuous at x = 0 ' +
      '(no gap, no jump), but it has a sharp "corner" there. A GPS measures your position continuously, ' +
      'but if you make an instantaneous turn, your velocity (the derivative of position) is undefined at that moment. ' +
      'In machine learning, the ReLU activation function (max(0, x)) has a corner at 0 — and this non-differentiability ' +
      'is surprisingly useful, not a defect. Understanding exactly where and why derivatives fail gives you ' +
      'full control over the tools of calculus.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Continuity means the graph has no breaks — you can draw it without lifting your pen. ' +
          'Differentiability means the graph is SMOOTH — it has a unique, well-defined tangent line at every point. ' +
          'Differentiability is a STRONGER condition than continuity.',
          'The key logical relationships: **Differentiable → Continuous** (if differentiable, then automatically continuous) ' +
          'and its contrapositive **Not continuous → Not differentiable**. ' +
          'But the REVERSE is FALSE: continuous does NOT imply differentiable.',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'The Fundamental Relationship',
          body: 'If $f$ is differentiable at $a$, then $f$ is continuous at $a$.\n\n' +
                'Contrapositive: if $f$ is NOT continuous at $a$, then $f$ is NOT differentiable at $a$.\n\n' +
                'The converse is FALSE: continuous does NOT imply differentiable.',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          'There are exactly three types of points where a continuous function can fail to be differentiable:',
          '**1. Corners**: the left-hand slope and right-hand slope both exist but are unequal. Example: |x| at x = 0.',
          '**2. Cusps**: the slopes approach ±∞ from both sides (function has a sharp "spike"). Example: x^(2/3) at x = 0.',
          '**3. Vertical tangents**: the slope approaches +∞ (or −∞) from both sides — the tangent line exists but is vertical. Example: x^(1/3) at x = 0.',
        ],
      },
      {
        type: 'viz',
        id: '',
        title: 'Non-Differentiable Points Explorer',
        mathBridge:
          'Each function shown has a different type of non-differentiability at x = 0. ' +
          'The zoom-in slider shows that near a corner/cusp/vertical tangent, no matter how close you get, ' +
          'the graph never "looks like a line" — differentiability is exactly the property of "looking linear under zoom."',
        caption: 'Toggle between |x|, x^(2/3), and x^(1/3). Use the zoom slider to see why each fails the "tangent line" test.',
      },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Differentiability — Formal Definition',
          body: 'f \\text{ is differentiable at } a \\iff \\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h} \\text{ exists (as a finite number)} \\\\ f \\text{ is differentiable on an interval} \\iff \\text{differentiable at every interior point} \\\\ \\text{(and one-sided differentiable at endpoints)}',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Left and Right Derivatives',
          body: 'f\'_-(a) = \\lim_{h\\to 0^-}\\frac{f(a+h)-f(a)}{h} \\quad (\\text{left derivative}) \\\\ f\'_+(a) = \\lim_{h\\to 0^+}\\frac{f(a+h)-f(a)}{h} \\quad (\\text{right derivative}) \\\\ f \\text{ is differentiable at } a \\iff f\'_-(a) = f\'_+(a) \\text{ (both finite and equal)}',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Proof that differentiability implies continuity:**',
          'If f\'(a) exists, then f(a+h) − f(a) = [f(a+h) − f(a)]/h · h',
          'As h → 0: the first factor approaches f\'(a) (finite) and the second factor h → 0.',
          'So lim(h→0) [f(a+h) − f(a)] = f\'(a) · 0 = 0',
          'Therefore lim(h→0) f(a+h) = f(a), which means f is continuous at a. ■',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'example',
          title: 'Checking |x| at x = 0',
          body: 'f\'_-(0) = \\lim_{h\\to 0^-}\\frac{|h|- 0}{h} = \\lim_{h\\to 0^-}\\frac{-h}{h} = -1 \\\\ f\'_+(0) = \\lim_{h\\to 0^+}\\frac{|h|}{h} = \\lim_{h\\to 0^+}\\frac{h}{h} = 1 \\\\ f\'_-(0) = -1 \\neq 1 = f\'_+(0) \\implies \\text{NOT differentiable at 0 (corner)}',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**How to check differentiability at a suspicious point a:**',
          '1. First verify f is continuous at a (if not continuous → not differentiable, done)',
          '2. Compute the left derivative: lim(h→0⁻) [f(a+h) − f(a)] / h',
          '3. Compute the right derivative: lim(h→0⁺) [f(a+h) − f(a)] / h',
          '4. If both exist and are equal → differentiable. Otherwise → not differentiable.',
          '5. Identify the type: corner (both finite, unequal), cusp (one or both = ∞ with opposite signs), vertical tangent (both = +∞ or both = −∞).',
        ],
      },
    ],
  },

  rigor: {
    prose: [
      '**Weierstrass\'s Monster**: In 1872, Karl Weierstrass shocked the mathematical world by constructing ' +
      'a function that is continuous EVERYWHERE but differentiable NOWHERE. ' +
      'W(x) = Σ aⁿ cos(bⁿπx) where 0 < a < 1, b is a positive odd integer, and ab > 1 + 3π/2. ' +
      'This pathological function looks like an infinitely jagged coastline at every scale. ' +
      'Before Weierstrass, mathematicians informally assumed continuous functions were "usually" differentiable. ' +
      'The Weierstrass function demolished this intuition and forced a rigorous treatment of these concepts.',
      '**Rademacher\'s theorem** (1919) partially rescues the intuition: any Lipschitz continuous function ' +
      '(a function where |f(x) − f(y)| ≤ K|x − y|) is differentiable ALMOST EVERYWHERE ' +
      '(except on a set of measure zero). For functions typically encountered in calculus, ' +
      'non-differentiable points form at most a finite (or countable) set.',
    ],
    callouts: [
      {
        type: 'tip',
        title: 'The Hierarchy of Smoothness',
        body: 'C⁰ (continuous) ⊃ C¹ (continuously differentiable) ⊃ C² (twice differentiable) ⊃ · · · ⊃ C^∞ (smooth) ⊃ C^ω (analytic) \\\\ \\text{Each class is strictly smaller. Most calculus functions live in } C^\\infty.',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-corner-check',
      title: 'Checking Differentiability at a Corner',
      problem: 'Determine whether $f(x) = |x - 2|$ is differentiable at $x = 2$.',
      steps: [
        {
          expression: 'f(x) = \\begin{cases} -(x-2) & x < 2 \\\\ x-2 & x \\geq 2 \\end{cases}',
          annotation: 'Rewrite |x−2| as a piecewise function.',
        },
        {
          expression: 'f\'_-(2) = \\lim_{h\\to 0^-}\\frac{f(2+h)-f(2)}{h} = \\lim_{h\\to 0^-}\\frac{|h|}{h} = \\lim_{h\\to 0^-}\\frac{-h}{h} = -1',
          annotation: 'For h < 0: |h| = −h.',
        },
        {
          expression: 'f\'_+(2) = \\lim_{h\\to 0^+}\\frac{f(2+h)-f(2)}{h} = \\lim_{h\\to 0^+}\\frac{h}{h} = 1',
          annotation: 'For h > 0: |h| = h.',
        },
        {
          expression: 'f\'_-(2) = -1 \\neq 1 = f\'_+(2)',
          annotation: '',
        },
        {
          expression: '\\therefore f \\text{ is NOT differentiable at } x = 2 \\text{ (corner point)}',
          annotation: 'The function is continuous at x = 2, but has a sharp corner. No unique tangent line exists.',
        },
      ],
      conclusion: 'f(x) = |x − 2| is continuous everywhere but not differentiable at x = 2. The graph turns sharply at (2, 0) — no single tangent line can touch it there.',
    },
    {
      id: 'ex-cusp-check',
      title: 'Identifying a Cusp',
      problem: 'Show that $f(x) = x^{2/3}$ is continuous but not differentiable at $x = 0$, and identify the type of non-differentiability.',
      steps: [
        {
          expression: '\\lim_{x\\to 0}x^{2/3} = 0 = f(0)\\;\\Rightarrow\\; \\text{continuous at } 0\\;\\checkmark',
          annotation: '',
        },
        {
          expression: 'f\'(0) = \\lim_{h\\to 0}\\frac{h^{2/3} - 0}{h} = \\lim_{h\\to 0}h^{-1/3} = \\lim_{h\\to 0}\\frac{1}{h^{1/3}}',
          annotation: 'Set up the derivative limit.',
        },
        {
          expression: 'h \\to 0^+: \\frac{1}{h^{1/3}} \\to +\\infty \\qquad h \\to 0^-: \\frac{1}{h^{1/3}} \\to -\\infty',
          annotation: 'For h < 0: h^(1/3) < 0, so 1/h^(1/3) → −∞.',
        },
        {
          expression: '\\text{Left derivative} = -\\infty,\\; \\text{right derivative} = +\\infty \\Rightarrow \\text{cusp}',
          annotation: 'The slopes blow up to ±∞ from opposite sides. The tangent line is "vertical" but flips sign.',
        },
      ],
      conclusion: 'x^(2/3) has a cusp at x = 0. It is the classic cusp shape: the function comes in steeply from below on both sides and meets at a sharp point. Not differentiable despite being continuous.',
    },
    {
      id: 'ex-piecewise-differentiable',
      title: 'Testing Differentiability of a Piecewise Function',
      problem: `For $f(x) = \\begin{cases} x^2 & x \\leq 1 \\\\ 2x - 1 & x > 1 \\end{cases}$, is $f$ differentiable at $x = 1$?`,
      steps: [
        {
          expression: '\\textbf{Step 1: Check continuity.}',
          annotation: '',
        },
        {
          expression: '\\lim_{x\\to 1^-} x^2 = 1 \\qquad \\lim_{x\\to 1^+}(2x-1) = 1 \\qquad f(1) = 1^2 = 1',
          annotation: 'All three agree → continuous at x = 1. ✓',
        },
        {
          expression: '\\textbf{Step 2: Check left and right derivatives.}',
          annotation: '',
        },
        {
          expression: 'f\'_-(1) = \\lim_{h\\to 0^-}\\frac{(1+h)^2 - 1}{h} = \\lim_{h\\to 0^-}\\frac{2h + h^2}{h} = \\lim_{h\\to 0^-}(2+h) = 2',
          annotation: 'Use the top piece (x² for x ≤ 1) near x = 1.',
        },
        {
          expression: 'f\'_+(1) = \\lim_{h\\to 0^+}\\frac{(2(1+h)-1) - 1}{h} = \\lim_{h\\to 0^+}\\frac{2h}{h} = 2',
          annotation: 'Use the bottom piece (2x−1 for x > 1) near x = 1.',
        },
        {
          expression: 'f\'_-(1) = 2 = f\'_+(1) \\implies f \\text{ IS differentiable at } x=1, \\; f\'(1) = 2',
          annotation: 'Both one-sided derivatives are equal → smooth join at x = 1.',
        },
      ],
      conclusion: 'Even though f is piecewise, it is differentiable at x = 1 because the formulas connect with the same slope (2) on both sides. The "join" at x = 1 is smooth — no corner.',
    },
  ],

  challenges: [
    {
      id: 'ch2-dvc-c1',
      difficulty: 'easy',
      problem: 'Is $f(x) = \\sqrt[3]{x}$ differentiable at $x = 0$? Classify the type of non-differentiability.',
      hint: 'Compute lim(h→0) [h^(1/3) / h] = lim(h→0) h^(−2/3). What happens?',
      walkthrough: [
        { expression: 'f\'(0) = \\lim_{h\\to 0}\\frac{h^{1/3}}{h} = \\lim_{h\\to 0} h^{-2/3} = \\lim_{h\\to 0}\\frac{1}{h^{2/3}}', annotation: '' },
        { expression: 'h^{2/3} > 0 \\text{ for all } h \\neq 0, \\text{ and } h^{2/3} \\to 0 \\Rightarrow f\'(0) = +\\infty', annotation: 'Both one-sided limits → +∞ (same sign).' },
        { expression: '\\text{Vertical tangent at } x = 0 \\text{ (tangent line is the y-axis)}', annotation: '' },
      ],
      answer: 'Vertical tangent at x = 0 — not differentiable, but the slope goes to +∞ from both sides (unlike a cusp).',
    },
    {
      id: 'ch2-dvc-c2',
      difficulty: 'medium',
      problem: `For what values of $a$ and $b$ is $f(x) = \\begin{cases} ax + b & x \\leq 1 \\\\ x^2 + 2x & x > 1 \\end{cases}$ differentiable at $x = 1$?`,
      hint: 'You need two conditions: f(1⁻) = f(1⁺) (continuity) and f\'₋(1) = f\'₊(1) (equal slopes).',
      walkthrough: [
        { expression: '\\text{Continuity: } a(1)+b = 1^2+2(1) = 3 \\Rightarrow a + b = 3', annotation: '' },
        { expression: '\\text{Left derivative: } f\'_-(1) = a \\quad (\\text{derivative of } ax+b \\text{ is } a)', annotation: '' },
        { expression: '\\text{Right derivative: } f\'_+(1) = \\lim_{x\\to 1^+}(2x+2) = 4', annotation: '' },
        { expression: 'a = 4 \\implies b = 3 - 4 = -1', annotation: '' },
      ],
      answer: 'a = 4, b = −1',
    },
  ],

  crossRefs: [
    { lessonSlug: 'continuity', label: 'Prerequisite: Continuity (Ch. 1)', context: 'Differentiability implies continuity; understand continuity first.' },
    { lessonSlug: 'tangent-problem', label: 'Prerequisite: Tangent Problem', context: 'Derivative defined as limit of difference quotient.' },
    { lessonSlug: 'reading-derivatives', label: 'Related: Reading Derivatives', context: 'Identifying corners/cusps from graphs of f and f\'.' },
    { lessonSlug: 'rolles-theorem', label: 'Next Use: Rolle\'s Theorem (Ch. 3)', context: 'Requires differentiability on an open interval.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
