import cornerCuspUrl from '../diagrams/calc-corner-cusp.svg?url';
import continuityUrl from '../diagrams/calc-continuity.svg?url';
export default {
  id: 'ch2-differentiability-vs-continuity',
  slug: 'differentiability-vs-continuity',
  chapter: 2,
  order: 3,
  title: 'Differentiability vs. Continuity',
  subtitle: 'Corners, cusps, and vertical tangents — why a smooth graph is not always enough',
  tags: ['differentiability', 'continuity', 'corners', 'cusps', 'vertical-tangent', 'non-differentiable', 'one-sided-derivatives', 'piecewise'],

  hook: {
    question: 'The absolute value function |x| has no gap, no jump, and no hole at x = 0. It passes every continuity test. So why does calculus fail there — and what does that failure look like?',
    realWorldContext: 'Continuity and differentiability are not the same thing, and the difference matters enormously in applied mathematics. A GPS records your position as a continuous signal — no teleportation — but if you make a sharp, instantaneous turn, your velocity (the derivative of position) is undefined at that exact moment. In structural engineering, a beam deflects continuously under load, but if the deflection curve has a corner, the moment diagram (its derivative) has a jump — and engineers must account for this exactly at that joint. In machine learning, the ReLU activation function max(0, x) has a corner at x = 0 and is not differentiable there; this turns out to be computationally useful because it allows gradients to run cleanly on one side while completely blocking them on the other.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
      '**What differentiability means geometrically:** A function is differentiable at a point if the graph looks like a straight line when you zoom in close enough. This is the "local linearity" interpretation. Every differentiable function, no matter how curved it is globally, becomes indistinguishable from its tangent line at a microscopic scale.',

      '**What can go wrong.** There are exactly three ways a continuous function can fail to be differentiable at a point, and each has a distinctive shape:',

      '**1. A corner.** The function arrives with one slope from the left and departs with a different slope to the right. Both one-sided slopes exist and are finite — they just disagree. Classic example: f(x) = |x| at x = 0. Zoom in as far as you like; the corner stays. From the left, slope = −1. From the right, slope = +1. No tangent line captures both at once.',
        ],
      },
      { type: 'image', src: cornerCuspUrl, alt: 'Corner (|x|) and cusp (x^(2/3)) where the derivative does not exist', caption: 'A function is differentiable at a iff the graph looks like a straight line when zoomed in.' },
      {
        type: 'prose',
        paragraphs: [

      '**2. A cusp.** The two one-sided slopes blow up to opposite infinities: one goes to +∞ and the other to −∞. The graph spikes to a sharp point. Classic example: f(x) = x^(2/3) at x = 0. The curve comes in increasingly steeply from both sides, but the direction of steepness flips.',

      '**3. A vertical tangent.** Both one-sided slopes blow up to the same infinity (both +∞ or both −∞). The tangent line exists in the limit but is vertical — a vertical line is not the graph of a function, so it cannot be a well-defined derivative. Classic example: f(x) = x^(1/3) at x = 0.',

      '**The hierarchy of smoothness.** These two properties are not symmetric — one is strictly stronger than the other. Every differentiable function is automatically continuous, but not every continuous function is differentiable. The proof is short and elegant, and we give it in the Rigor section below.',
        ],
      },
      { type: 'image', src: continuityUrl, alt: 'Discontinuity types — all discontinuities also prevent differentiability', caption: 'Differentiable ⟹ continuous, but continuous does not imply differentiable.' },
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Fundamental Implication',
        body: 'f \\text{ differentiable at } a \\implies f \\text{ continuous at } a\n\n\\textbf{Contrapositive (equally valid):} f \\text{ not continuous at } a \\implies f \\text{ not differentiable at } a\n\n\\textbf{The converse is FALSE:} f \\text{ continuous at } a \\not\\!\\!\\implies f \\text{ differentiable at } a\n\n\\text{Counterexample: } f(x) = |x| \\text{ is continuous at } 0 \\text{ but not differentiable at } 0.',
      },
      {
        type: 'definition',
        title: 'One-Sided Derivatives',
        body: 'f\'_-(a) = \\lim_{h \\to 0^-} \\frac{f(a+h) - f(a)}{h} \\quad \\text{(left-hand derivative: approach } a \\text{ from } x < a\\text{)}\n\nf\'_+(a) = \\lim_{h \\to 0^+} \\frac{f(a+h) - f(a)}{h} \\quad \\text{(right-hand derivative: approach } a \\text{ from } x > a\\text{)}\n\nf \\text{ is differentiable at } a \\iff f\'_-(a) = f\'_+(a) \\iff \\text{both are finite and equal}',
      },
      {
        type: 'insight',
        title: 'Classification by One-Sided Derivatives',
        body: '\\textbf{Corner:} \\quad f\'_-(a) \\text{ and } f\'_+(a) \\text{ both exist (finite) but } f\'_-(a) \\neq f\'_+(a)\n\\textbf{Cusp:} \\quad f\'_-(a) \\to +\\infty \\text{ and } f\'_+(a) \\to -\\infty \\text{ (or vice versa)}\n\\textbf{Vertical tangent:} \\quad f\'_-(a) \\to +\\infty \\text{ and } f\'_+(a) \\to +\\infty \\text{ (same sign)}',
      },
    ],
    visualizations: [
      {
        id: '',
        title: 'Corners, Cusps, and Vertical Tangents',
        mathBridge: 'Use the zoom slider to magnify each function at x = 0. A differentiable function straightens into its tangent line under infinite zoom. These three functions never do: the corner stays sharp, the cusp stays spiked, and the vertical tangent stays vertical. The zoom test is the geometric definition of differentiability.',
        caption: 'Toggle between |x|, x^(2/3), and x^(1/3). Zoom into x = 0. A differentiable point looks like a straight line under zoom; these never do.',
      },
    ],
  },

  math: {
    prose: [
      '**The starting point: what the derivative limit actually says.** The derivative of f at a is defined as:\n\n  f\'(a) = lim(h → 0) [f(a+h) − f(a)] / h\n\nFor this limit to exist as a finite number, the left-hand and right-hand limits of the difference quotient must both exist and be equal. This is exactly what one-sided derivatives measure — and their equality (or lack of it) is the precise condition for differentiability.',

      '**Working with absolute value: the key rewriting step.** Any expression involving |expression| must first be written as a piecewise function before you can compute one-sided limits. This is not optional — it is the only way to determine which formula applies on each side.',

      '**Full worked example: is f(x) = |x| differentiable at x = 0?**\n\nStep 1. Rewrite as piecewise:\n  |x| = x   for x ≥ 0\n  |x| = −x  for x < 0\n\nStep 2. Left derivative (h → 0 with h < 0, so (0+h) = h < 0):\n  f\'_−(0) = lim(h → 0⁻) [|0+h| − |0|] / h\n           = lim(h → 0⁻) [|h|] / h\n           = lim(h → 0⁻) [−h] / h   (since h < 0, |h| = −h)\n           = lim(h → 0⁻) −1\n           = −1\n\nStep 3. Right derivative (h > 0, so |h| = h):\n  f\'_+(0) = lim(h → 0⁺) [|h|] / h\n           = lim(h → 0⁺) h / h\n           = lim(h → 0⁺) 1\n           = 1\n\nStep 4. Compare: −1 ≠ 1. The one-sided derivatives disagree.\n  Conclusion: f is NOT differentiable at x = 0. This is a CORNER.',

      '**Procedure for any piecewise function:**\n\n1. Verify continuity first. Compute left limit, right limit, and f(a). If any disagree, stop — no differentiability possible.\n2. For the left derivative, use the formula valid on the LEFT side of a (x < a).\n3. For the right derivative, use the formula valid on the RIGHT side of a (x > a).\n4. If both one-sided derivatives are finite and equal: differentiable, and f\'(a) = their common value.\n5. If both are finite but unequal: CORNER.\n6. If they blow up to opposite infinities: CUSP.\n7. If they both blow up to the same infinity: VERTICAL TANGENT.',
    ],
    callouts: [
      {
        type: 'proof-map',
        title: 'Why One-Sided Limits Determine Everything',
        body: 'The two-sided limit lim(h→0) [f(a+h)−f(a)]/h exists if and only if the left-hand and right-hand limits both exist and are equal (by the Two-Sided Limit Theorem from Chapter 1). Each one-sided limit of the difference quotient is exactly one of the one-sided derivatives. So differentiability at a point is completely equivalent to the agreement of the two one-sided derivatives.',
      },
      {
        type: 'theorem',
        title: 'Differentiability Condition',
        body: 'f \\text{ is differentiable at } a \\iff \\lim_{h \\to 0^-}\\frac{f(a+h)-f(a)}{h} = \\lim_{h \\to 0^+}\\frac{f(a+h)-f(a)}{h} = L \\in \\mathbb{R}\n\n(\\text{Both limits must be finite and equal to the same real number } L.)\n\n\\text{When they are: } f\'(a) = L.',
      },
      {
        type: 'misconception',
        title: 'f\'(a) = 0 Does Not Mean a Corner',
        body: 'A horizontal tangent (f\'(a) = 0) is NOT a failure of differentiability — it is a perfectly valid derivative. The function is differentiable and the tangent slope happens to be zero.\n\nA corner occurs when f\'(a) does NOT EXIST because the left and right slopes disagree.\n\nThese are completely different situations. f(x) = x² has f\'(0) = 0 and IS differentiable at 0. f(x) = |x| has no derivative at 0 and IS NOT differentiable at 0.',
      },
    ],
    visualizationId: '',
  },

  rigor: {
    prose: [
      '**Theorem: Differentiability Implies Continuity.** We prove this carefully because the proof reveals exactly why differentiability is the stronger condition.',

      'Suppose f is differentiable at a, meaning f\'(a) = lim(h→0) [f(a+h)−f(a)]/h exists as a finite number L.',

      'We want to show f is continuous at a, meaning lim(h→0) f(a+h) = f(a), i.e., lim(h→0) [f(a+h)−f(a)] = 0.',

      'Write the telescoping identity:\n  f(a+h) − f(a) = [f(a+h)−f(a)] / h  ×  h',

      'Take the limit as h → 0:\n  lim(h→0) [f(a+h)−f(a)] = lim(h→0){[f(a+h)−f(a)]/h} × lim(h→0){h}\n                         = L × 0\n                         = 0  ■',

      'The key step: we used the Product Limit Law (limit of a product = product of limits), valid because both individual limits exist. The first factor converges to L = f\'(a) by assumption; the second factor is just h → 0.',

      '**Why the converse fails.** The above proof works because h appears explicitly as a factor. The limit of [f(a+h)−f(a)]/h equals L only if the numerator [f(a+h)−f(a)] goes to zero at EXACTLY the right RATE — proportional to h. Continuity only requires [f(a+h)−f(a)] → 0, but says nothing about the rate. A corner gives a numerator that goes to zero too slowly: from the left it is proportional to −h and from the right proportional to +h — both go to zero, maintaining continuity, but the proportionality constants disagree, ruining differentiability.',

      '**The Weierstrass function (1872).** Karl Weierstrass constructed a function that is continuous everywhere but differentiable nowhere — W(x) = Σ aⁿ cos(bⁿπx) for carefully chosen constants a and b. Before this, mathematicians assumed continuous functions were "usually" differentiable except possibly at isolated points. Weierstrass demolished this intuition. His function is C⁰ (continuous) but not in any Cⁿ for n ≥ 1. It looks like an infinitely jagged coastline at every scale.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Smoothness Classes',
        body: 'C^0 = \\text{continuous everywhere}\nC^1 = \\text{continuously differentiable (} f\' \\text{ exists and is continuous)}\nC^n = \\text{n times continuously differentiable}\nC^\\infty = \\text{infinitely differentiable (all orders)}\n\n\\text{The chain of inclusions: } C^\\infty \\subset \\cdots \\subset C^2 \\subset C^1 \\subset C^0\n\n\\text{Polynomials, } e^x\\text{, } \\sin x\\text{, } \\cos x \\text{ are all } C^\\infty.\nf(x) = |x| \\text{ is } C^0 \\text{ but not } C^1 \\text{ (corner at } x=0\\text{)}.',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-corner-abs',
      title: 'Corner — Testing |x − 2| at x = 2',
      problem: 'Determine whether $f(x) = |x-2|$ is differentiable at $x = 2$. If not, classify the failure.',
      steps: [
        {
          expression: 'f(x) = \\begin{cases} -(x-2) & x < 2 \\\\ x - 2 & x \\geq 2 \\end{cases}',
          annotation: 'Always rewrite absolute value as piecewise first. The rule: |u| = u when u ≥ 0, |u| = −u when u < 0. Substituting u = x − 2: it is negative when x < 2 and non-negative when x ≥ 2.',
        },
        {
          expression: '\\lim_{x \\to 2^-}(-(x-2)) = 0, \\quad \\lim_{x \\to 2^+}(x-2) = 0, \\quad f(2) = 0',
          annotation: 'Continuity check: both one-sided limits equal 0 and f(2) = 0. All three agree — f is continuous at x = 2. We can proceed to check differentiability.',
        },
        {
          expression: 'f\'_-(2) = \\lim_{h \\to 0^-} \\frac{f(2+h) - f(2)}{h} = \\lim_{h \\to 0^-} \\frac{-(2+h-2) - 0}{h} = \\lim_{h \\to 0^-} \\frac{-h}{h} = -1',
          annotation: 'For h < 0: (2+h) < 2, so f(2+h) uses the left piece: f(2+h) = −((2+h)−2) = −h. Substitute into the difference quotient and simplify.',
        },
        {
          expression: 'f\'_+(2) = \\lim_{h \\to 0^+} \\frac{f(2+h) - f(2)}{h} = \\lim_{h \\to 0^+} \\frac{(2+h-2) - 0}{h} = \\lim_{h \\to 0^+} \\frac{h}{h} = 1',
          annotation: 'For h > 0: (2+h) > 2, so f(2+h) uses the right piece: f(2+h) = (2+h)−2 = h.',
        },
        {
          expression: 'f\'_-(2) = -1 \\neq 1 = f\'_+(2)',
          annotation: 'The one-sided derivatives are finite but disagree.',
        },
        {
          expression: '\\therefore f \\text{ is NOT differentiable at } x = 2 \\text{ — CORNER (slopes } -1 \\text{ and } +1\\text{)}',
          annotation: 'Both sides give finite slopes, but they point in different directions. No single tangent line fits both. The graph makes a sharp V at (2, 0).',
        },
      ],
      conclusion: '|x − 2| is continuous everywhere but has a corner at x = 2. From the left the slope is −1, from the right it is +1. This is the defining signature of a corner: finite but unequal one-sided derivatives.',
    },
    {
      id: 'ex-cusp',
      title: 'Cusp — The Spike of x^(2/3) at x = 0',
      problem: 'Show that $f(x) = x^{2/3}$ is continuous but not differentiable at $x = 0$, and identify the type.',
      steps: [
        {
          expression: '\\lim_{x \\to 0} x^{2/3} = 0^{2/3} = 0 = f(0)',
          annotation: 'Writing x^{2/3} = (x^{1/3})², the cube root is defined for all real x and the square makes it non-negative. As x → 0. the value goes to 0 = f(0). Continuous. ✓',
        },
        {
          expression: '\\frac{f(0+h) - f(0)}{h} = \\frac{h^{2/3} - 0}{h} = h^{2/3-1} = h^{-1/3} = \\frac{1}{h^{1/3}}',
          annotation: 'Set up the difference quotient. Simplify the index: 2/3 − 1 = −1/3.',
        },
        {
          expression: 'h \\to 0^+: \\frac{1}{h^{1/3}} \\to +\\infty \\qquad (h^{1/3} > 0 \\text{ and } \\to 0)',
          annotation: 'For positive h, the cube root is positive and approaches 0, so 1/h^{1/3} → +∞.',
        },
        {
          expression: 'h \\to 0^-: \\frac{1}{h^{1/3}} \\to -\\infty \\qquad (h^{1/3} < 0 \\text{ for } h < 0)',
          annotation: 'For negative h, the cube root is negative (cube roots preserve sign), so 1/h^{1/3} → −∞.',
        },
        {
          expression: 'f\'_+(0) = +\\infty, \\quad f\'_-(0) = -\\infty \\implies \\textbf{CUSP}',
          annotation: 'The slopes blow up to opposite infinities. The graph rises infinitely steeply from both sides but with opposite signs — a sharp spike.',
        },
      ],
      conclusion: 'x^{2/3} is continuous at 0 but has a cusp there. The visual signature: the curve spikes to a sharp point, and zooming in only makes it more extreme, not smoother.',
    },
    {
      id: 'ex-piecewise-smooth',
      title: 'Smooth Piecewise Join — When the Pieces Agree',
      problem: 'Is $f(x) = \\begin{cases} x^2 & x \\leq 1 \\\\ 2x-1 & x > 1 \\end{cases}$ differentiable at $x = 1$?',
      steps: [
        {
          expression: '\\lim_{x \\to 1^-} x^2 = 1, \\quad \\lim_{x \\to 1^+}(2x-1) = 1, \\quad f(1) = 1^2 = 1',
          annotation: 'Continuity: left limit uses x² piece, right limit uses 2x−1 piece, f(1) uses the piece where x ≤ 1. All three equal 1. Continuous ✓.',
        },
        {
          expression: 'f\'_-(1) = \\lim_{h \\to 0^-} \\frac{(1+h)^2 - 1}{h} = \\lim_{h \\to 0^-} \\frac{1+2h+h^2-1}{h} = \\lim_{h \\to 0^-} (2+h) = 2',
          annotation: 'For h < 0: (1+h) ≤ 1, so use x² piece. f(1+h) = (1+h)². Expand: (1+h)²−1 = 2h+h². Factor h from numerator and cancel.',
        },
        {
          expression: 'f\'_+(1) = \\lim_{h \\to 0^+} \\frac{(2(1+h)-1) - 1}{h} = \\lim_{h \\to 0^+} \\frac{1+2h-1}{h} = \\lim_{h \\to 0^+} \\frac{2h}{h} = 2',
          annotation: 'For h > 0: use 2x−1 piece. f(1+h) = 2(1+h)−1 = 1+2h. Subtract f(1) = 1 to get 2h. Divide by h.',
        },
        {
          expression: 'f\'_-(1) = 2 = f\'_+(1) \\implies f\'(1) = 2 \\quad \\textbf{Differentiable!}',
          annotation: 'Both one-sided derivatives equal 2. The join is smooth — no corner.',
        },
      ],
      conclusion: 'Even though f is piecewise-defined, both pieces deliver the same slope (2) at x = 1. The graph has no corner — the parabola and the line are tangent to each other at (1, 1), joining smoothly.',
    },
  ],

  challenges: [
    {
      id: 'ch2-dvc-c1',
      difficulty: 'easy',
      problem: 'Classify f(x) = x^{1/3} at x = 0. Is it differentiable? If not, what type?',
      hint: 'Set up lim(h→0) h^{1/3}/h = lim(h→0) h^{−2/3}. Note: h^{2/3} = (h^{1/3})² is always ≥ 0 regardless of the sign of h. What does that tell you about h^{−2/3} from both sides?',
      walkthrough: [
        { expression: '\\frac{h^{1/3}}{h} = h^{1/3-1} = h^{-2/3} = \\frac{1}{h^{2/3}}', annotation: 'Simplify the difference quotient. Note h^{2/3} = (h^{1/3})² is always positive for h ≠ 0.' },
        { expression: 'h \\to 0^+: \\frac{1}{h^{2/3}} \\to +\\infty', annotation: '' },
        { expression: 'h \\to 0^-: \\frac{1}{h^{2/3}} \\to +\\infty \\quad (\\text{since } h^{2/3} > 0 \\text{ even when } h < 0)', annotation: 'Both one-sided limits go to +∞ with the SAME sign.' },
        { expression: '\\text{VERTICAL TANGENT at } x=0 \\text{ (not differentiable)}', annotation: 'Unlike the cusp where opposite infinities appear, here both slopes go to the same infinity — a vertical tangent. The tangent line is the y-axis.' },
      ],
      answer: 'Vertical tangent at x = 0. Not differentiable. Both one-sided slopes → +∞.',
    },
    {
      id: 'ch2-dvc-c2',
      difficulty: 'medium',
      problem: 'For what values of a and b is $f(x) = \\begin{cases} ax+b & x \\leq 1 \\\\ x^2+2x & x > 1 \\end{cases}$ differentiable at x = 1?',
      hint: 'Differentiability requires two conditions simultaneously: (1) the two-sided limit of f equals f(1) (continuity), giving one equation in a and b; and (2) the one-sided derivatives agree, giving a second equation. Solve the 2×2 system.',
      walkthrough: [
        { expression: '\\textbf{Condition 1 (continuity):}\\quad a(1)+b = \\lim_{x \\to 1^+}(x^2+2x) = 3', annotation: 'Left piece at x=1: a+b. Right limit of x²+2x: 1+2=3. Set equal: a+b=3.' },
        { expression: '\\textbf{Condition 2 (equal slopes):}\\quad f\'_-(1) = a, \\quad f\'_+(1) = \\lim_{x \\to 1^+}(2x+2) = 4', annotation: 'Left derivative of ax+b is a (constant slope). Right derivative of x²+2x is 2x+2; evaluate at x→1⁺ to get 4.' },
        { expression: 'a = 4 \\quad \\text{(from Condition 2)}', annotation: '' },
        { expression: 'b = 3 - a = 3 - 4 = -1 \\quad \\text{(from Condition 1)}', annotation: '' },
      ],
      answer: 'a = 4, b = −1. At these values the pieces join smoothly with slope 4 at x = 1.',
    },
  ],

  crossRefs: [
    { lessonSlug: 'continuity', label: 'Prerequisite: Continuity', context: 'You must verify continuity before checking differentiability — a non-continuous function cannot be differentiable.' },
    { lessonSlug: 'one-sided-limits', label: 'Prerequisite: One-Sided Limits', context: 'Left and right derivatives are one-sided limits of the difference quotient. You need to be fluent with them.' },
    { lessonSlug: 'differentiation-rules', label: 'Next: Differentiation Rules', context: 'Once you know a function is differentiable, these rules let you compute the derivative without going back to limits every time.' },
    { lessonSlug: 'higher-order-derivatives', label: 'Later: Higher-Order Derivatives', context: 'Each higher derivative requires differentiability of the previous one. A corner in f means f\' does not exist, so f\'\' cannot exist at that point either.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'f(x) = |x| is continuous at x = 0 but not differentiable there. Why not?',
      options: [
        'The function value f(0) = 0 is not in the domain of the derivative formula',
        'The left-hand derivative (slope approaching from x < 0 is −1) and right-hand derivative (slope from x > 0 is +1) are not equal — the two sides give a corner, so the limit defining f\'(0) does not exist',
        'Absolute value functions are never differentiable because they contain a condition',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A function is differentiable at x = a. What does this guarantee about continuity at x = a?',
      options: [
        'Nothing — differentiability and continuity are completely independent properties',
        'Differentiability implies continuity: if f\'(a) exists, then f must be continuous at a (but not vice versa)',
        'Continuity implies differentiability: if f is continuous at a, then f\'(a) must exist',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Which of these creates a point where a function is NOT differentiable?',
      options: [
        'A smooth bump — a point where the function has a large but finite value with smooth curves approaching it from both sides',
        'A corner (like |x| at 0), a cusp (like x^(2/3) at 0), or a vertical tangent (like x^(1/3) at 0) — all three cause the derivative limit to either not exist or be infinite',
        'Any local maximum or minimum — the derivative is zero there, which counts as undefined',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does a vertical tangent make a function non-differentiable at that point?',
      options: [
        'Vertical lines have undefined slope — the derivative is the slope of the tangent line, so if the tangent is vertical, the derivative limit is +∞ or −∞ (not a finite real number)',
        'Vertical tangents only occur at endpoints, and endpoints are always excluded from the domain',
        'The chain rule fails at vertical tangents because the inner function\'s derivative is zero there',
      ],
      correct: 0,
    },
  ],
}
