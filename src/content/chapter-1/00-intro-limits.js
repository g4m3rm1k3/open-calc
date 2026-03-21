export default {
  id: 'ch1-limits-intro',
  slug: 'introduction',
  chapter: 1,
  order: 0,
  title: 'Introduction to Limits',
  subtitle: 'Getting arbitrarily close without arriving',
  tags: ['limits', 'approaching', 'informal', 'one-sided', 'two-sided', 'DNE', 'indeterminate form', '0/0'],

  hook: {
    question: 'What is the speed of a car at exactly one instant in time?',
    realWorldContext:
      'A speedometer measures average speed: distance divided by time. Over a one-hour drive you might average 60 mph. Over the last 10 minutes you averaged 70 mph. Over the last 1 second you averaged 72 mph. ' +
      'But what is your speed at the precise instant t = 3.00000 seconds? To measure it, you\'d need zero time interval — giving 0 miles / 0 seconds = 0/0, which is undefined. ' +
      'Yet your car\'s speedometer reads a definite value at every instant. Physics tells us instantaneous speed is real. ' +
      'The resolution to this paradox is the concept of a **limit**: we don\'t evaluate at the instant, we ask what value the average speed *approaches* as the time interval shrinks toward zero. ' +
      'This is the central idea of calculus, discovered independently by Newton (who called it a "fluxion") and Leibniz in the 1600s.',
    previewVisualizationId: 'SecantToTangent',
  },

  intuition: {
    prose: [
      'Imagine walking toward a wall, cutting the remaining distance in half each step. You get closer and closer — 1 m, 0.5 m, 0.25 m, 0.125 m — but you never quite touch it. A **limit** describes the value a function approaches as its input gets close to some target value. The key insight: the function does not need to be defined *at* the target — only *near* it.',

      'Consider the function f(x) = (x² − 4)/(x − 2). At x = 2, we get 0/0, which is completely undefined. But watch what happens when x gets close to 2 from either side:',

      '**From the left (x → 2⁻):**  x = 1.9 → f = 3.9,  x = 1.99 → f = 3.99,  x = 1.999 → f = 3.999',
      '**From the right (x → 2⁺):**  x = 2.1 → f = 4.1,  x = 2.01 → f = 4.01,  x = 2.001 → f = 4.001',

      'From both sides, f(x) is approaching 4. We write: lim(x→2) (x²−4)/(x−2) = 4. The limit is 4, even though f(2) is undefined.',

      'Why can we simplify (x²−4)/(x−2)? Because x²−4 = (x+2)(x−2), and for x ≠ 2 we can cancel: (x+2)(x−2)/(x−2) = x+2. At x = 2 this gives 4. The limit captured the "natural" value of this function at the hole.',

      '**The limit is about the journey, not the destination.** Whether f(2) is undefined, or defined but equal to something else — the limit doesn\'t care. It only asks: what value does f(x) approach as x gets close to 2?',

      'There is also the possibility of **one-sided limits**: the function might approach a different value from the left than from the right. If that happens, the two-sided limit does not exist (DNE). Think of a cliff edge: approaching from land gives height H, approaching from sea gives height 0. The "height" limit at the cliff edge DNE.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'You may have seen average speed before',
        body: 'Average speed = distance ÷ time. You calculated this in physics class. The limit is what happens when you let that time interval shrink toward zero — turning "average speed over 1 second" into "speed at one instant." That is exactly what a speedometer reads.',
      },
      {
        type: 'intuition',
        title: 'The Core Idea',
        body: 'lim(x→c) f(x) = L means: f(x) gets arbitrarily close to L whenever x is sufficiently close to c (but x ≠ c). The value of f at c is irrelevant.',
      },
      {
        type: 'tip',
        title: 'Indeterminate Forms',
        body: '0/0, ∞/∞, 0·∞, ∞−∞ are called "indeterminate forms." They do NOT mean the limit is 0 or undefined — they mean we need more work. (x²−4)/(x−2) → 0/0 at x=2, but the limit is 4.',
      },
      {
        type: 'misconception',
        title: 'The Limit is NOT the Function Value',
        body: "lim(x→c) f(x) can exist even when f(c) doesn't. And even when f(c) does exist, the limit can be a DIFFERENT number. The limit only cares about what happens NEAR c, not AT c.",
      },
    ],
    visualizations: [
      {
        id: 'LimitApproach',
        props: { fn: '(x*x - 4)/(x - 2)', targetX: 2, limitVal: 4 },
        title: 'Approaching the Limit',
        caption: 'Watch f(x) = (x²−4)/(x−2) as x approaches 2 from both sides. The hole at x=2 is real, but the limit is 4.',
      },
      {
        id: 'LimitRacingCar',
        title: 'Racing Car Approaching a Hole',
        caption: 'A car drives along the function curve toward the hole at x=2. It gets arbitrarily close but never arrives — yet the limit is clear.',
      },
      {
        id: 'TwoSidedLimit',
        title: 'Left-Hand and Right-Hand Limits',
        caption: 'Two particles approach from opposite sides. When they meet at the same value, the limit exists. When they land at different values — or one diverges — the limit does not exist.',
      },
    ],
  },

  math: {
    prose: [
      'The formal limit notation is: lim(x→c) f(x) = L.',

      '**One-sided limits**: We distinguish approaching from the left versus the right:',
      '• **Left-hand limit**: lim(x→c⁻) f(x) = L₋ means x approaches c while staying strictly less than c (x < c).',
      '• **Right-hand limit**: lim(x→c⁺) f(x) = L₊ means x approaches c while staying strictly greater than c (x > c).',

      'The two-sided limit exists if and only if both one-sided limits exist AND they are equal. Written precisely:',
      'lim(x→c) f(x) = L  ⟺  lim(x→c⁻) f(x) = L = lim(x→c⁺) f(x)',

      'When the one-sided limits are unequal, or when either fails to exist, we say the limit **Does Not Exist (DNE)**.',

      '**Three techniques for evaluating limits** when direct substitution fails (giving 0/0 or similar):',
      '1. **Factoring and canceling**: factor the numerator and/or denominator to cancel the problem term. The most common technique for rational functions.',
      '2. **Rationalizing** (multiplying by conjugate): used when a square root appears in a numerator or denominator.',
      '3. **The squeeze theorem**: used when the function is bounded between two simpler functions that share the same limit.',

      '**Limits at infinity**: lim(x→∞) f(x) = L means f(x) approaches L as x grows without bound. This describes **horizontal asymptotes**. The key technique: for rational functions, divide numerator and denominator by the highest power of x in the denominator.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Two-Sided Limit',
        body: '\\lim_{x \\to c} f(x) = L \\iff \\lim_{x \\to c^-} f(x) = L = \\lim_{x \\to c^+} f(x)',
      },
      {
        type: 'definition',
        title: 'When a Limit DNE',
        body: '\\lim_{x\\to c} f(x) \\text{ DNE if } \\lim_{x\\to c^-} f(x) \\neq \\lim_{x\\to c^+} f(x), \\text{ or if either one-sided limit fails to exist.}',
      },
      {
        type: 'tip',
        title: 'When can I just substitute?',
        body: 'If f is a polynomial, rational function (with nonzero denominator at c), or built from trig/exp/log functions: just substitute x = c. Direct substitution works when the function is continuous at c.',
      },
    ],
    visualizations: [
      {
        id: 'LimitApproach',
        props: { fn: '(x*x - 4)/(x - 2)', targetX: 2, limitVal: 4, showTable: true },
        title: 'Limit vs. Function Value',
        caption: 'The table updates in sync with the graph: both sides approach 4, even though f(2) is undefined.',
      },
      {
        id: 'HoleVsValue',
        title: 'Hole vs. Function Value — Three Cases',
        caption: 'Switch between three scenarios: undefined (hole), redefined (value ≠ limit), and continuous (value = limit). This is the core distinction calculus builds on.',
      },
    ],
  },

  rigor: {
    prose: [
      'The informal idea "f(x) gets close to L as x gets close to c" is made mathematically precise by the **epsilon-delta definition**, developed by Augustin-Louis Cauchy and Karl Weierstrass in the 19th century. Before this definition, calculus was powerful but logically shaky — mathematicians could compute correctly but couldn\'t fully justify why.',

      'The definition uses two small positive numbers:',
      '**ε (epsilon)**: a small tolerance on the *output*. We specify how close f(x) must be to L.',
      '**δ (delta)**: a small tolerance on the *input*. This is what we choose to guarantee the output tolerance.',

      'The game works like this: an adversary picks any ε > 0 (no matter how tiny). You must respond with a δ > 0 such that: whenever x is within δ of c (but x ≠ c), f(x) is within ε of L. If you can always win this game — for every possible ε — then the limit is L.',

      'The condition |x − c| < δ (with x ≠ c, written 0 < |x − c| < δ) translates to "x is within δ of c but not equal to c." The condition |f(x) − L| < ε translates to "f(x) is within ε of L."',

      'Crucially, δ is allowed to depend on ε. For a linear function like f(x) = 2x + 1, if you want |f(x) − 5| < ε near c = 2, you can set δ = ε/2. For nonlinear functions, finding δ requires more algebra — but the definition guarantees one exists whenever the limit truly holds.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Epsilon-Delta Definition of a Limit',
        body: '\\lim_{x \\to c} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 \\text{ such that:} \\\\ 0 < |x - c| < \\delta \\implies |f(x) - L| < \\varepsilon',
      },
      {
        type: 'tip',
        title: 'How to read the definition',
        body: '"For EVERY ε > 0 (no matter how tiny the demanded accuracy), there EXISTS a δ > 0 (some input radius) such that: for ALL x within δ of c (but x ≠ c), f(x) is within ε of L."',
      },
    ],
    visualizations: [
      {
        id: 'EpsilonDelta',
        props: { fn: '2*x + 1', c: 2, L: 5 },
        title: 'Epsilon-Delta in Action',
        caption: 'Drag ε to set the output tolerance. Watch the required δ adjust to guarantee the condition. This is what "the limit is 5" means formally.',
      },
      {
        id: 'OscillationViz',
        title: 'When the Limit Does NOT Exist — sin(1/x) near 0',
        caption: 'Zoom in toward x=0: no matter how close you get, the function keeps oscillating between -1 and 1. No single value L can satisfy the epsilon-delta definition — the limit does not exist.',
      },
    ],
  },

  examples: [
    {
      id: 'ex-limit-direct-sub',
      title: 'When Direct Substitution Works',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 4} \\frac{x^2 - 3x + 1}{x + 2}.',
      steps: [
        { expression: '\\lim_{x \\to 4} \\frac{x^2 - 3x + 1}{x + 2}', annotation: 'Check: is the denominator zero at x = 4? x + 2 = 4 + 2 = 6 ≠ 0. Direct substitution is valid.' },
        { expression: '= \\frac{(4)^2 - 3(4) + 1}{(4) + 2}', annotation: 'Substitute x = 4 everywhere.' },
        { expression: '= \\frac{16 - 12 + 1}{6}', annotation: 'Arithmetic in numerator: 16 − 12 = 4, then 4 + 1 = 5.' },
        { expression: '= \\frac{5}{6}', annotation: '' },
      ],
      conclusion: 'The limit is 5/6. Direct substitution works whenever the denominator is nonzero at the target point — which is exactly the definition of the function being continuous there.',
    },
    {
      id: 'ex-limit-factor',
      title: 'Evaluating a 0/0 Form by Factoring',
      problem: '\\displaystyle\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}',
      steps: [
        { expression: '\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}', annotation: 'Try direct substitution: numerator = 9−9 = 0, denominator = 3−3 = 0. This is the indeterminate form 0/0. We cannot divide by zero — but we can factor.' },
        { expression: '= \\lim_{x \\to 3} \\frac{(x+3)(x-3)}{x-3}', annotation: 'Factor numerator: x²−9 = (x−3)(x+3). Recognize this as a difference of squares: a²−b² = (a−b)(a+b) with a=x, b=3.' },
        { expression: '= \\lim_{x \\to 3} (x + 3)', annotation: 'Cancel (x−3). This cancellation is VALID because in a limit, x → 3 but x ≠ 3, so (x−3) ≠ 0 and we can divide by it.' },
        { expression: '= 3 + 3 = 6', annotation: 'Now substitute x = 3. No problem — the simplified function x+3 is defined there.' },
      ],
      conclusion: 'The limit is 6. The original function has a "hole" at x = 3 (it\'s undefined there), but the limit fills in that hole: the function wants to be 6 at x = 3, even though it isn\'t defined there.',
    },
    {
      id: 'ex-limit-conjugate',
      title: 'Evaluating a 0/0 Form by Rationalizing',
      problem: '\\displaystyle\\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x}',
      steps: [
        { expression: '\\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x}', annotation: 'Direct sub gives 0/0: numerator = √4 − 2 = 0, denominator = 0. Factoring won\'t help here. Strategy: multiply by the conjugate to eliminate the square root.' },
        { expression: '= \\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x} \\cdot \\frac{\\sqrt{x+4} + 2}{\\sqrt{x+4} + 2}', annotation: 'Multiply top and bottom by the conjugate of the numerator: (√(x+4) + 2). This equals 1, so we haven\'t changed the expression.' },
        { expression: '\\text{Numerator: } (\\sqrt{x+4} - 2)(\\sqrt{x+4} + 2) = (\\sqrt{x+4})^2 - 2^2', annotation: 'Difference of squares pattern: (a−b)(a+b) = a²−b² with a = √(x+4), b = 2.' },
        { expression: '= (x+4) - 4 = x', annotation: 'The square root disappears! (√(x+4))² = x+4 and 2² = 4.' },
        { expression: '= \\lim_{x \\to 0} \\frac{x}{x\\,(\\sqrt{x+4} + 2)}', annotation: 'Numerator is now just x.' },
        { expression: '= \\lim_{x \\to 0} \\frac{1}{\\sqrt{x+4} + 2}', annotation: 'Cancel x (valid since x ≠ 0 in the limit).' },
        { expression: '= \\frac{1}{\\sqrt{0+4} + 2} = \\frac{1}{2 + 2} = \\frac{1}{4}', annotation: 'Now substitute x = 0 safely.' },
      ],
      conclusion: 'The limit is 1/4. The conjugate technique is the go-to method whenever you have (√something − constant) or (√something + constant) in the numerator or denominator.',
    },
    {
      id: 'ex-one-sided',
      title: 'One-Sided Limits from a Piecewise Function',
      problem: 'Find both one-sided limits of f(x) = \\begin{cases} x+1 & x < 2 \\\\ 5 & x = 2 \\\\ x^2 - 1 & x > 2 \\end{cases} at x = 2. Does the two-sided limit exist? Is f continuous at x = 2?',
      steps: [
        { expression: '\\lim_{x \\to 2^-} f(x)', annotation: 'Approaching from the left means x < 2, so use the first piece: f(x) = x + 1.' },
        { expression: '= \\lim_{x \\to 2^-} (x+1) = 2 + 1 = 3', annotation: '' },
        { expression: '\\lim_{x \\to 2^+} f(x)', annotation: 'Approaching from the right means x > 2, so use the third piece: f(x) = x² − 1.' },
        { expression: '= \\lim_{x \\to 2^+} (x^2-1) = 4 - 1 = 3', annotation: '' },
        { expression: '\\lim_{x \\to 2^-} f(x) = 3 = \\lim_{x \\to 2^+} f(x)', annotation: 'Both one-sided limits are equal.' },
        { expression: '\\therefore \\lim_{x \\to 2} f(x) = 3', annotation: 'Two-sided limit exists and equals 3.' },
        { expression: 'f(2) = 5 \\quad \\text{(from the middle piece)}', annotation: 'The function value at x = 2 is explicitly defined as 5.' },
        { expression: '\\lim_{x \\to 2} f(x) = 3 \\neq 5 = f(2)', annotation: 'The limit (3) does not equal the function value (5).' },
        { expression: '\\therefore f \\text{ is NOT continuous at } x = 2.', annotation: 'Continuity requires that the limit equals the function value. Here they differ.' },
      ],
      conclusion: 'The limit exists (= 3), but f is not continuous because f(2) = 5 ≠ 3. This is a "removable" discontinuity — redefining f(2) = 3 would make it continuous.',
    },
    {
      id: 'ex-dne',
      title: 'A Limit That Does Not Exist — Jump',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} \\frac{|x|}{x}.',
      steps: [
        { expression: '\\text{Recall: } |x| = \\begin{cases} x & x > 0 \\\\ -x & x < 0 \\end{cases}', annotation: 'The absolute value function has different formulas depending on the sign of x.' },
        { expression: '\\lim_{x \\to 0^-} \\frac{|x|}{x}:', annotation: 'For x < 0 (approaching from the left), |x| = −x.' },
        { expression: '= \\lim_{x \\to 0^-} \\frac{-x}{x} = \\lim_{x \\to 0^-} (-1) = -1', annotation: '−x/x = −1 for all x ≠ 0.' },
        { expression: '\\lim_{x \\to 0^+} \\frac{|x|}{x}:', annotation: 'For x > 0 (approaching from the right), |x| = x.' },
        { expression: '= \\lim_{x \\to 0^+} \\frac{x}{x} = \\lim_{x \\to 0^+} (1) = 1', annotation: 'x/x = 1 for all x ≠ 0.' },
        { expression: '\\lim_{x \\to 0^-} = -1 \\neq 1 = \\lim_{x \\to 0^+}', annotation: 'The two one-sided limits are different.' },
        { expression: '\\therefore \\lim_{x \\to 0} \\frac{|x|}{x} \\text{ DNE}', annotation: 'Since the one-sided limits disagree, the two-sided limit does not exist.' },
      ],
      conclusion: 'This function is the "sign function" — it equals +1 for positive x and −1 for negative x. It has a jump discontinuity at x = 0, which is why the limit fails to exist.',
    },
    {
      id: 'ex-limit-at-infinity',
      title: 'Limit at Infinity — Horizontal Asymptote',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to \\infty} \\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}.',
      steps: [
        { expression: '\\lim_{x \\to \\infty} \\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}', annotation: 'Both numerator and denominator grow without bound — this is the indeterminate form ∞/∞. Strategy: divide every term by the highest power of x in the denominator, which is x².' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{\\dfrac{3x^2}{x^2} - \\dfrac{2x}{x^2} + \\dfrac{1}{x^2}}{\\dfrac{5x^2}{x^2} + \\dfrac{4x}{x^2} - \\dfrac{7}{x^2}}', annotation: 'Divide every term (numerator and denominator) by x².' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{3 - \\dfrac{2}{x} + \\dfrac{1}{x^2}}{5 + \\dfrac{4}{x} - \\dfrac{7}{x^2}}', annotation: 'Simplify each fraction.' },
        { expression: '\\text{As } x \\to \\infty:\\quad \\frac{1}{x} \\to 0, \\quad \\frac{1}{x^2} \\to 0', annotation: 'Terms with x in the denominator vanish as x grows.' },
        { expression: '= \\frac{3 - 0 + 0}{5 + 0 - 0} = \\frac{3}{5}', annotation: '' },
      ],
      conclusion: 'The limit is 3/5. This means the function has a horizontal asymptote at y = 3/5. Quick rule for rational functions: when the degrees are equal, the limit at ±∞ is the ratio of the leading coefficients.',
    },
    {
      id: 'ex-epsilon-delta',
      title: 'An Epsilon-Delta Proof',
      problem: 'Use the epsilon-delta definition to prove that \\displaystyle\\lim_{x \\to 3} (5x - 7) = 8.',
      steps: [
        { expression: '\\text{Claim: } \\lim_{x \\to 3}(5x-7) = 8.', annotation: 'We must prove: for every ε > 0, we can find δ > 0 such that 0 < |x−3| < δ implies |(5x−7) − 8| < ε.' },
        { expression: '\\text{Scratchwork: simplify the output error.}', annotation: 'Before writing the proof, figure out what δ should be.' },
        { expression: '|(5x-7) - 8| = |5x - 15| = 5|x - 3|', annotation: '|5x − 15| = |5(x−3)| = 5|x−3|. The output error is exactly 5 times the input error.' },
        { expression: '\\text{We need } 5|x-3| < \\varepsilon \\iff |x-3| < \\frac{\\varepsilon}{5}', annotation: 'So choosing δ = ε/5 will work.' },
        { expression: '\\textbf{Proof: }\\text{Given } \\varepsilon > 0, \\text{ let } \\delta = \\frac{\\varepsilon}{5}.', annotation: 'This is the start of the formal proof.' },
        { expression: '\\text{Suppose } 0 < |x-3| < \\delta.', annotation: 'Assume x is within δ of 3 but x ≠ 3.' },
        { expression: '\\text{Then: } |(5x-7) - 8| = 5|x-3| < 5\\delta = 5 \\cdot \\frac{\\varepsilon}{5} = \\varepsilon.\\;\\blacksquare', annotation: 'Chain the inequalities: output error = 5 × input error < 5δ = ε. QED.' },
      ],
      conclusion: 'The scratchwork shows you what δ to choose. The formal proof then chains the inequalities to verify the choice works. For any tolerance ε in the output, choosing δ = ε/5 guarantees f(x) lands within ε of 8.',
    },
  ],

  challenges: [
    {
      id: 'ch1-lim-c1',
      difficulty: 'medium',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 1} \\frac{x^3 - 1}{x^2 - 1}.',
      hint: 'Factor both numerator and denominator completely. Sum of cubes: a³−b³ = (a−b)(a²+ab+b²). Difference of squares: a²−b² = (a−b)(a+b).',
      walkthrough: [
        { expression: '\\lim_{x \\to 1} \\frac{x^3-1}{x^2-1}', annotation: 'Direct substitution gives 0/0. Factor both.' },
        { expression: '= \\lim_{x \\to 1} \\frac{(x-1)(x^2+x+1)}{(x-1)(x+1)}', annotation: 'x³−1 = (x−1)(x²+x+1) [sum of cubes]; x²−1 = (x−1)(x+1) [difference of squares].' },
        { expression: '= \\lim_{x \\to 1} \\frac{x^2+x+1}{x+1}', annotation: 'Cancel (x−1), valid since x ≠ 1.' },
        { expression: '= \\frac{1+1+1}{1+1} = \\frac{3}{2}', annotation: 'Substitute x = 1.' },
      ],
      answer: '3/2',
    },
    {
      id: 'ch1-lim-c2',
      difficulty: 'medium',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to \\infty} \\left(\\sqrt{x^2 + x} - x\\right).',
      hint: 'This is ∞ − ∞, an indeterminate form. Rationalize by multiplying by the conjugate: (√(x²+x) + x)/(√(x²+x) + x).',
      walkthrough: [
        { expression: '\\lim_{x \\to \\infty}(\\sqrt{x^2+x} - x)', annotation: '∞ − ∞ is indeterminate. Multiply by the conjugate.' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{(\\sqrt{x^2+x}-x)(\\sqrt{x^2+x}+x)}{\\sqrt{x^2+x}+x}', annotation: '' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{(x^2+x) - x^2}{\\sqrt{x^2+x}+x}', annotation: 'Numerator: (√(x²+x))² − x² = x²+x − x² = x.' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{x}{\\sqrt{x^2+x}+x}', annotation: '' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{x}{x\\sqrt{1+1/x}+x}', annotation: 'Factor x from the denominator: √(x²+x) = x√(1+1/x) for x > 0.' },
        { expression: '= \\lim_{x \\to \\infty} \\frac{1}{\\sqrt{1+1/x}+1}', annotation: 'Cancel x from numerator and denominator.' },
        { expression: '= \\frac{1}{\\sqrt{1+0}+1} = \\frac{1}{2}', annotation: '1/x → 0 as x → ∞.' },
      ],
      answer: '1/2',
    },
    {
      id: 'ch1-lim-c3',
      difficulty: 'hard',
      problem: 'Use the epsilon-delta definition to prove \\displaystyle\\lim_{x \\to 2} x^2 = 4.',
      hint: 'Write |x²−4| = |x−2||x+2|. You need to bound |x+2|. Restrict δ ≤ 1 first (so x ∈ (1,3)), which bounds |x+2| ≤ 5.',
      walkthrough: [
        { expression: '|x^2 - 4| = |(x-2)(x+2)| = |x-2|\\cdot|x+2|', annotation: 'Factor and use the multiplicative property of absolute value.' },
        { expression: '\\text{We need to bound } |x+2|.', annotation: 'It depends on x, so we restrict x to a bounded neighborhood first.' },
        { expression: '\\text{Restrict: assume } \\delta \\leq 1,\\; \\text{so } |x-2|<1 \\implies 1 < x < 3.', annotation: 'With δ ≤ 1, we know x is between 1 and 3.' },
        { expression: '\\text{Then } 3 < x+2 < 5 \\implies |x+2| < 5.', annotation: '' },
        { expression: '\\text{So: } |x^2-4| = |x-2|\\cdot|x+2| < 5|x-2|', annotation: '' },
        { expression: '\\text{We need } 5|x-2| < \\varepsilon \\iff |x-2| < \\varepsilon/5', annotation: '' },
        { expression: '\\text{Choose } \\delta = \\min\\!\\left(1,\\; \\frac{\\varepsilon}{5}\\right)', annotation: 'Take the smaller of 1 (to keep |x+2| < 5) and ε/5 (to make the product small).' },
        { expression: '\\text{Proof: Given } \\varepsilon>0, \\text{ let } \\delta=\\min(1,\\varepsilon/5).', annotation: '' },
        { expression: '\\text{If } 0<|x-2|<\\delta: \\quad |x^2-4| = |x-2||x+2| < \\delta\\cdot 5 \\leq \\frac{\\varepsilon}{5}\\cdot 5 = \\varepsilon.\\;\\blacksquare', annotation: '' },
      ],
      answer: 'Proved via ε-δ with δ = min(1, ε/5)',
    },
  ],

  crossRefs: [
    { lessonSlug: 'functions', label: 'Prerequisite: Functions', context: 'Limits describe behavior of functions near a point.' },
    { lessonSlug: 'limit-laws', label: 'Next: Limit Laws', context: 'Algebraic rules for computing limits without always going back to the definition.' },
    { lessonSlug: 'continuity', label: 'See Also: Continuity', context: 'Continuity is defined using limits.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
