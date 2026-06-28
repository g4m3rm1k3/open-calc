import oneSidedUrl from '../diagrams/calc-one-sided.svg?url';
import oneSidedDneUrl from '../diagrams/calc-one-sided-dne.svg?url';
import oneSidedComparisonUrl from '../diagrams/calc-one-sided-comparison.svg?url';
export default {
  id: 'ch1-one-sided-limits',
  slug: 'one-sided-limits',
  chapter: 1,
  order: 1,
  title: 'One-Sided Limits',
  subtitle: 'Approaching from the left vs. the right — when direction matters',
  tags: ['one-sided-limits', 'left-hand-limit', 'right-hand-limit', 'jump-discontinuity', 'limits', 'piecewise'],

  hook: {
    question: 'Can a function approach two different values at the same point, depending on which direction you come from?',
    realWorldContext:
      'Absolutely — and it happens all the time. A light switch has two states: 0 (off) and 1 (on). ' +
      'As you approach the moment of flipping from the "was off" side, you get 0. ' +
      'From the "now on" side, you get 1. The limit from the left ≠ limit from the right. ' +
      'In economics, a tax bracket creates a similar "jump" — cross the income threshold in one direction and your marginal rate jumps instantly. ' +
      'One-sided limits are the tool that lets us describe these directional approaches precisely, ' +
      'and they are also the key to understanding exactly what kinds of discontinuities exist.',
    previewVisualizationId: '',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'When we write lim(x→a) f(x) = L, we require f(x) to approach L from BOTH sides of a. ' +
          'But sometimes the function approaches different values depending on direction — or approaches a value from one side but not the other.',
          'We need two new tools: the **left-hand limit** (approaching from values smaller than a) and the **right-hand limit** (approaching from values larger than a).',
        ],
      },
      { type: 'image', src: oneSidedUrl, alt: 'Two panels: limits agree (two-sided limit exists) vs. jump discontinuity', caption: 'The two-sided limit exists only when the left-hand and right-hand limits both exist and are equal.' },
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Left-Hand and Right-Hand Limit Notation',
          body: '\\lim_{x \\to a^-} f(x) \\quad \\text{"the limit as } x \\text{ approaches } a \\text{ from the LEFT (below)"} \\\\ \\lim_{x \\to a^+} f(x) \\quad \\text{"the limit as } x \\text{ approaches } a \\text{ from the RIGHT (above)"}',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          'The superscript − means "from below" (x < a, getting closer to a). ' +
          'The superscript + means "from above" (x > a, getting closer to a). ' +
          'Neither includes the point x = a itself.',
          'Think of approaching a cliff: from the left you see the top, from the right you might see the canyon floor. ' +
          'The "cliff" is the point a, and the two one-sided limits describe what you see from each direction.',
        ],
      },
      { type: 'image', src: oneSidedComparisonUrl, alt: 'Side-by-side comparison of left-hand limit notation (x→a⁻) and right-hand limit notation (x→a⁺)', caption: 'The superscript − means approaching from below (x < a); superscript + means from above (x > a).' },
      {
        type: 'viz',
        id: '',
        title: 'One-Sided Limits Explorer',
        mathBridge:
          'The slider controls which piecewise function is shown. Drag x toward the break point from each side ' +
          'and read the function values. Notice when the left-hand and right-hand limits agree vs. disagree.',
        caption: 'Approach the break point from the left (−) and from the right (+). The two arrows show each one-sided limit.',
      },
      {
        type: 'callout',
        callout: {
          type: 'insight',
          title: 'The Connection to the Two-Sided Limit',
          body: 'lim(x→a) f(x) = L  ⟺  both lim(x→a⁻) f(x) = L  AND  lim(x→a⁺) f(x) = L\n\n' +
                'The two-sided limit exists if and only if both one-sided limits exist AND are equal to each other.',
        },
      },
      { type: 'image', src: oneSidedDneUrl, alt: 'Jump discontinuity and oscillation showing the two cases where a limit DNE', caption: 'A limit does not exist when left ≠ right (jump) or when one side oscillates without settling.' },
    ],
  },

  math: {
    blocks: [
      {
        type: 'callout',
        callout: {
          type: 'definition',
          title: 'Formal Definition of One-Sided Limits',
          body: '\\lim_{x\\to a^-} f(x) = L \\iff \\forall\\,\\varepsilon>0,\\;\\exists\\,\\delta>0: \\; a-\\delta < x < a \\Rightarrow |f(x)-L|<\\varepsilon \\\\ \\lim_{x\\to a^+} f(x) = L \\iff \\forall\\,\\varepsilon>0,\\;\\exists\\,\\delta>0: \\; a < x < a+\\delta \\Rightarrow |f(x)-L|<\\varepsilon',
        },
      },
      {
        type: 'callout',
        callout: {
          type: 'theorem',
          title: 'Two-Sided Limit Existence Theorem',
          body: '\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = L \\text{ and } \\lim_{x \\to a^+} f(x) = L',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Where one-sided limits appear naturally:**',
          '1. **Piecewise functions**: different formulas on each side of a breakpoint',
          '2. **Absolute value** |x|: at x = 0, the left slope is −1 and right slope is +1 (important for |x|/x)',
          '3. **Step functions**: the floor function ⌊x⌋ has jump discontinuities at every integer',
          '4. **Functions with vertical asymptotes**: one or both one-sided limits may be ±∞',
          '5. **Square roots at endpoints**: √x at x = 0 only has a right-hand limit',
        ],
      },
      {
        type: 'callout',
        callout: {
          type: 'misconception',
          title: 'Common Confusion: lim x→a f(x) vs. f(a)',
          body: 'The limit describes what f(x) APPROACHES as x → a. The value f(a) is what f EQUALS AT a. ' +
                'These can be different! A function can have a limit at a point where it is not defined ' +
                '(like f(x) = sin(x)/x at x = 0), or be defined but have a different limit (removable discontinuity).',
        },
      },
      {
        type: 'prose',
        paragraphs: [
          '**Step-by-step approach for piecewise limits:**',
          '1. Determine which "piece" applies to the left of a (x → a⁻)',
          '2. Evaluate the limit of that piece as x → a',
          '3. Determine which "piece" applies to the right of a (x → a⁺)',
          '4. Evaluate the limit of that piece as x → a',
          '5. Compare: if left = right, the two-sided limit exists and equals that value; otherwise it does not exist (DNE)',
        ],
      },
    ],
  },

  rigor: {
    prose: [
      'One-sided limits are the foundation for the precise definition of the **derivative**. ' +
      'The derivative at a point is defined as lim(h→0) [f(a+h) − f(a)] / h. ' +
      'This is a two-sided limit. But sometimes the left-hand derivative and right-hand derivative exist and are unequal, ' +
      'creating a "corner" — a point where the function has no unique tangent line.',
      'Left derivative: f\'₋(a) = lim(h→0⁻) [f(a+h) − f(a)] / h',
      'Right derivative: f\'₊(a) = lim(h→0⁺) [f(a+h) − f(a)] / h',
      'f is differentiable at a ⟺ f\'₋(a) = f\'₊(a). This connects one-sided limits directly to differentiability — a theme revisited in Chapter 2.',
      'One-sided limits also underpin the definition of **continuity from the left** and **continuity from the right**, ' +
      'which matters for functions defined on closed intervals: a function on [a, b] only needs to be right-continuous at a ' +
      'and left-continuous at b.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'One-Sided Continuity',
        body: 'f \\text{ is continuous from the right at } a \\iff \\lim_{x \\to a^+} f(x) = f(a) \\\\ f \\text{ is continuous from the left at } a \\iff \\lim_{x \\to a^-} f(x) = f(a)',
      },
    ],
    visualizationId: null,
  },

  examples: [
    {
      id: 'ex-piecewise-one-sided',
      title: 'One-Sided Limits of a Piecewise Function',
      problem: `Let $f(x) = \\begin{cases} x^2 + 1 & x < 2 \\\\ 3 & x = 2 \\\\ 2x - 1 & x > 2 \\end{cases}$. Find $\\lim_{x\\to 2^-} f(x)$, $\\lim_{x\\to 2^+} f(x)$, and $\\lim_{x\\to 2} f(x)$.`,
      steps: [
        {
          expression: '\\lim_{x \\to 2^-} f(x)',
          annotation: 'From the left (x < 2): use the formula x² + 1.',
        },
        {
          expression: '= \\lim_{x \\to 2^-}(x^2 + 1) = 2^2 + 1 = 5',
          annotation: 'Plugging in x = 2 into the left-side formula (x² + 1 is continuous everywhere).',
        },
        {
          expression: '\\lim_{x \\to 2^+} f(x)',
          annotation: 'From the right (x > 2): use the formula 2x − 1.',
        },
        {
          expression: '= \\lim_{x \\to 2^+}(2x - 1) = 2(2) - 1 = 3',
          annotation: '',
        },
        {
          expression: '\\lim_{x \\to 2^-} f(x) = 5 \\neq 3 = \\lim_{x \\to 2^+} f(x)',
          annotation: 'The two one-sided limits disagree.',
        },
        {
          expression: '\\therefore \\lim_{x \\to 2} f(x) \\text{ does NOT exist (DNE)}',
          annotation: 'A two-sided limit requires both one-sided limits to exist AND be equal.',
        },
        {
          expression: 'f(2) = 3 \\quad (\\text{the function IS defined at } x=2)',
          annotation: 'Note: the function has a defined value at x = 2, but the limit does not exist. This is a jump discontinuity.',
        },
      ],
      conclusion: 'The left-hand limit is 5, the right-hand limit is 3, and the two-sided limit does not exist. The function value f(2) = 3 matches the right-hand limit, so f is left-continuous but NOT right-continuous (nor two-sided continuous) at x = 2.',
    },
    {
      id: 'ex-absolute-value',
      title: 'One-Sided Limits and Absolute Value',
      problem: 'Find $\\displaystyle\\lim_{x\\to 0^-}\\frac{|x|}{x}$ and $\\displaystyle\\lim_{x\\to 0^+}\\frac{|x|}{x}$.',
      steps: [
        {
          expression: '\\text{Recall: } |x| = \\begin{cases} -x & x < 0 \\\\ x & x > 0 \\end{cases}',
          annotation: 'The absolute value is piecewise by definition.',
        },
        {
          expression: '\\lim_{x \\to 0^-} \\frac{|x|}{x} = \\lim_{x \\to 0^-} \\frac{-x}{x}',
          annotation: 'For x < 0: |x| = −x.',
        },
        {
          expression: '= \\lim_{x \\to 0^-} (-1) = -1',
          annotation: 'Simplify: −x/x = −1 for all x ≠ 0.',
        },
        {
          expression: '\\lim_{x \\to 0^+} \\frac{|x|}{x} = \\lim_{x \\to 0^+} \\frac{x}{x}',
          annotation: 'For x > 0: |x| = x.',
        },
        {
          expression: '= \\lim_{x \\to 0^+} (1) = 1',
          annotation: 'Simplify: x/x = 1 for all x ≠ 0.',
        },
        {
          expression: '\\lim_{x \\to 0} \\frac{|x|}{x} \\text{ does NOT exist}',
          annotation: 'Left limit (−1) ≠ right limit (1).',
        },
      ],
      conclusion: 'The function |x|/x equals −1 for x < 0 and +1 for x > 0. It has a jump discontinuity at 0 with a jump of size 2. This function is the "signum" or sign function, written sgn(x).',
    },
    {
      id: 'ex-finding-constant',
      title: 'Making a Limit Exist — Choosing a Constant',
      problem: `For what value of $c$ does $\\lim_{x\\to 3} f(x)$ exist, where $f(x) = \\begin{cases} cx^2 - 1 & x < 3 \\\\ 2x + c & x \\geq 3 \\end{cases}$?`,
      steps: [
        {
          expression: '\\lim_{x \\to 3^-} f(x) = \\lim_{x \\to 3^-}(cx^2 - 1) = c(9) - 1 = 9c - 1',
          annotation: 'From the left, use the top piece.',
        },
        {
          expression: '\\lim_{x \\to 3^+} f(x) = \\lim_{x \\to 3^+}(2x + c) = 6 + c',
          annotation: 'From the right, use the bottom piece.',
        },
        {
          expression: '\\text{For the limit to exist: } 9c - 1 = 6 + c',
          annotation: 'Set the two one-sided limits equal.',
        },
        {
          expression: '8c = 7 \\implies c = \\frac{7}{8}',
          annotation: 'Solve for c.',
        },
        {
          expression: '\\text{Check: } \\lim_{x\\to 3^-} = 9\\cdot\\frac{7}{8}-1 = \\frac{63}{8}-\\frac{8}{8} = \\frac{55}{8}',
          annotation: '',
        },
        {
          expression: '\\lim_{x\\to 3^+} = 6 + \\frac{7}{8} = \\frac{55}{8}\\;\\checkmark',
          annotation: 'Both sides give 55/8 when c = 7/8.',
        },
      ],
      conclusion: 'c = 7/8. The limit exists (and equals 55/8) only when c forces both one-sided limits to agree. This technique is common in continuity problems: "for what value of c is f continuous at x = a?"',
    },
  ],

  challenges: [
    {
      id: 'ch1-osl-c1',
      difficulty: 'easy',
      problem: 'Evaluate $\\displaystyle\\lim_{x \\to 1^-}\\lfloor x \\rfloor$ and $\\displaystyle\\lim_{x \\to 1^+}\\lfloor x \\rfloor$, where $\\lfloor x \\rfloor$ is the floor (greatest integer) function.',
      hint: 'The floor function ⌊x⌋ equals n for n ≤ x < n+1. Check which value it takes near x = 1 from each side.',
      walkthrough: [
        { expression: 'x \\to 1^-: \\text{ values like } 0.9, 0.99, 0.999 \\Rightarrow \\lfloor x \\rfloor = 0', annotation: '' },
        { expression: 'x \\to 1^+: \\text{ values like } 1.1, 1.01, 1.001 \\Rightarrow \\lfloor x \\rfloor = 1', annotation: '' },
        { expression: '\\lim_{x\\to 1^-}\\lfloor x\\rfloor = 0, \\quad \\lim_{x\\to 1^+}\\lfloor x\\rfloor = 1', annotation: 'Different one-sided limits → jump discontinuity at every integer.' },
      ],
      answer: 'Left-hand limit = 0, right-hand limit = 1, two-sided limit DNE',
    },
    {
      id: 'ch1-osl-c2',
      difficulty: 'medium',
      problem: 'Find all values of $x$ where $\\displaystyle\\lim_{x\\to a}\\frac{x^2-4}{|x-2|}$ fails to exist.',
      hint: 'Factor x²−4 and simplify each one-sided limit separately.',
      walkthrough: [
        { expression: 'x^2-4 = (x-2)(x+2)', annotation: '' },
        { expression: '\\frac{(x-2)(x+2)}{|x-2|}', annotation: 'For x > 2: |x−2| = x−2, so this = x+2 → 4 from the right.' },
        { expression: 'x \\to 2^-: |x-2| = -(x-2), \\text{ so } \\frac{(x-2)(x+2)}{-(x-2)} = -(x+2) \\to -4', annotation: '' },
        { expression: '\\lim_{x\\to 2^-} = -4 \\neq 4 = \\lim_{x\\to 2^+}', annotation: 'Limit DNE at x = 2.' },
      ],
      answer: 'The limit DNE at x = 2 (left limit = −4, right limit = 4).',
    },
  ],

  crossRefs: [
    { lessonSlug: 'introduction', label: 'Prerequisite: Intro to Limits', context: 'Two-sided limits and informal definition.' },
    { lessonSlug: 'continuity', label: 'Next: Continuity', context: 'A function is continuous at a iff its two-sided limit equals its value there.' },
    { lessonSlug: 'epsilon-delta', label: 'Related: Epsilon-Delta', context: 'One-sided limits have analogous one-sided epsilon-delta definitions.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The left-hand limit lim(x→a⁻) f(x) and right-hand limit lim(x→a⁺) f(x) both exist but are not equal. What does this tell you about lim(x→a) f(x)?',
      options: [
        'The two-sided limit equals the average of the left and right limits',
        'The two-sided limit does not exist — for the two-sided limit to exist, the left and right limits must be equal',
        'The two-sided limit equals the larger of the two one-sided limits',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'f(x) = |x|/x is defined for x ≠ 0. What are lim(x→0⁻) f(x) and lim(x→0⁺) f(x)?',
      options: [
        'Both equal 0 — the absolute value makes the function zero at the origin',
        'Left limit = −1, right limit = +1 — for x < 0, |x|/x = −x/x = −1; for x > 0, |x|/x = x/x = 1',
        'Left limit = +1, right limit = −1 — positive values come from the left side',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'At a jump discontinuity, a function f has lim(x→3⁻) f(x) = 2 and lim(x→3⁺) f(x) = 5. What is f(3)?',
      options: [
        'f(3) must be 3.5 — the average of the two one-sided limits fills in the gap',
        'f(3) can be any value — the two one-sided limits determine the behavior approaching x = 3, but they say nothing about the function\'s actual value AT x = 3',
        'f(3) is undefined — a function cannot be defined at a jump discontinuity',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why are one-sided limits needed when studying piecewise functions like f(x) = {x+1 for x < 2, x²−1 for x ≥ 2}?',
      options: [
        'Piecewise functions are not continuous, so ordinary limits do not exist and must be replaced by one-sided limits throughout',
        'The behavior of the function changes at the boundary x = 2 — each piece applies on a different side, so the left limit uses x+1 and the right limit uses x²−1; checking whether they match tells you if the two-sided limit exists',
        'One-sided limits are only needed when the function value at the boundary is undefined',
      ],
      correct: 1,
    },
  ],
}
