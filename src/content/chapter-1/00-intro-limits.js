export default {
  id: 'ch1-limits-intro',
  slug: 'introduction',
  chapter: 1,
  order: 0,
  title: 'Introduction to Limits',
  subtitle: 'Getting arbitrarily close without arriving',
  tags: ['limits', 'approaching', 'informal', 'one-sided', 'two-sided', 'DNE', 'indeterminate form', '0/0'],

  // ─── Semantic Layer: Define every symbol before using it ──────────────────
  semantics: {
    core: [
      { symbol: 'x \\to c', meaning: 'x gets arbitrarily close to c, but never equals c' },
      { symbol: 'L', meaning: 'the limit value — the y-value the function is heading toward' },
      { symbol: 'f(c)', meaning: 'the actual function value at x=c (may or may not exist)' },
      { symbol: '0/0', meaning: 'indeterminate form — not zero, not undefined — "more work needed"' },
      { symbol: '\\varepsilon', meaning: 'epsilon: a tiny output tolerance (how close f(x) is to L)' },
      { symbol: '\\delta', meaning: 'delta: the input radius that guarantees the output stays in tolerance' },
    ],
    rulesOfThumb: [
      'The limit is about the JOURNEY, not the destination. f(c) is irrelevant.',
      'If both sides agree on the same value, the limit exists. If they disagree, it DNE.',
      '0/0 is a signal to do algebra — factor, rationalize, or use conjugates.',
      'Continuity at c is the special case where limit = function value. It is the exception, not the rule.',
    ]
  },

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
      '**You have already met the seed of the limit.** In Chapter 0, you learned that the slope of a line is \u0394y / \u0394x — the ratio of rise to run. That slope is the rate of change averaged over the full run. Now ask: what if the run shrinks? What if \u0394x keeps getting smaller and smaller, never quite reaching zero? The number you are approaching is the limit. This is not a brand new idea — it is the slope idea taken to its extreme.',

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
        title: 'Cancel Factors, Not Terms',
        body: 'You may cancel only common factors, never added/subtracted terms. Example: (x^2-1)/(x-1) simplifies after factoring, but (x+1)/(x-1) does not let you cancel x.',
      },
      {
        type: 'technique',
        title: '0/0 Triage',
        body: 'When substitution gives 0/0, try this order: (1) factor and cancel, (2) multiply by a conjugate, (3) combine to a common denominator, then re-evaluate.',
      },
      {
        type: 'misconception',
        title: 'The Limit is NOT the Function Value',
        body: "lim(x→c) f(x) can exist even when f(c) doesn't. And even when f(c) does exist, the limit can be a DIFFERENT number. The limit only cares about what happens NEAR c, not AT c.",
      },
    ],
    // Alternative explanation — physical/number-line angle
    alternate: {
      prose: [
        'Think of a limit as a **shadow**. Stand at x = 2 and shine a light along the curve from both directions. The shadow the curve casts on the y-axis is the limit — even if the curve has a hole exactly at x = 2 and casts no shadow there.',
        'Another way: imagine a **GPS tracker** on a car driving along the curve y = (x²−4)/(x−2). At x = 1.9, the car is at height 3.9. At x = 1.99, it is at 3.99. At x = 1.999, it is at 3.999. The car\'s GPS predicts it will be at height exactly **4** when it reaches x = 2 — even though there\'s a pothole (hole in the road) at x = 2 and the car briefly loses ground contact.',
        'The limit IS the GPS prediction. It\'s what any reasonable extrapolation of the function\'s behavior tells you the value "should be" near that point.',
        '**Why does this matter?** Because almost every formula in calculus involves a 0/0 or ∞−∞ form at exactly the point we care about. The derivative f\'(a) = lim(h→0) [f(a+h)−f(a)]/h gives 0/0 when h = 0. The limit sidesteps that problem — we ask where the expression is heading, not where it lands.',
      ],
      callouts: [
        {
          type: 'mnemonic',
          title: 'GPS Prediction Rule',
          body: 'The limit is the GPS prediction. The function value is ground truth. A pothole (undefined point or redefined value) does not change the prediction — it just means the car briefly leaves the road.',
        },
      ],
      visualizations: [
        {
          id: 'LimitGeometric',
          title: 'Visual: Both Sides Converge',
          caption: 'Step through the animation. Red approaches from the left, blue from the right — both heading for the same target at y = 4, even though the function is undefined there.',
        },
      ],
    },

    visualizations: [
      {
        id: 'LimitBridgeLab',
        title: 'Limit Bridge Lab — Intuition to Rigor',
        mathBridge: 'This lab makes the limit definition concrete: $\\lim_{x \\to c} f(x) = L$ means you can get $f(x)$ as close to $L$ as you want by keeping $x$ close enough to $c$. The slider controls how close — shrinking $h$ on both sides toward the same target $L$ is exactly what the formal definition requires.',
        caption: 'Control the approach distance h, watch both sides close on the same target, then test your own limit estimate in game mode.',
      },
      {
        id: 'ZenoParadoxViz',
        title: "Zeno's Paradox — Infinite Steps, Finite Sum",
        mathBridge: 'Zeno argued that infinite steps must take infinite time — but calculus says otherwise. Each step here is half the previous: $\\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\cdots$. The limit of this infinite sum is exactly 1. This is the same idea behind every limit: infinitely many approximations converging to one finite value.',
        caption: 'Each bar is half the previous. The total approaches 1 — an infinite process with a finite result. This is a limit.',
      },
      {
        id: 'LimitApproach',
        props: { fn: '(x*x - 4)/(x - 2)', targetX: 2, limitVal: 4 },
        title: 'Approaching the Limit',
        mathBridge: 'The function $f(x) = \\frac{x^2-4}{x-2}$ is undefined at $x=2$ (division by zero). But algebraically, $x^2-4 = (x+2)(x-2)$, so for $x \\neq 2$ we get $f(x) = x+2$. The limit as $x \\to 2$ is therefore $2+2 = 4$ — the value the function is "heading toward," even though it never arrives.',
        caption: 'Watch f(x) = (x²−4)/(x−2) as x approaches 2 from both sides. The hole at x=2 is real, but the limit is 4.',
      },
      {
        id: 'LimitRacingCar',
        title: 'Racing Car Approaching a Hole',
        mathBridge: 'The car represents an input $x$ moving along the number line toward $c = 2$. Its height on the curve is $f(x)$. Even though $f(2)$ is undefined — a pothole — the car\'s trajectory makes clear that $f(x)$ is converging to 4. The limit only depends on the path, not whether the destination exists.',
        caption: 'A car drives along the function curve toward the hole at x=2. It gets arbitrarily close but never arrives — yet the limit is clear.',
      },
      {
        id: 'TwoSidedLimit',
        title: 'Left-Hand and Right-Hand Limits',
        mathBridge: 'A two-sided limit $\\lim_{x \\to c} f(x) = L$ requires both one-sided limits to agree: $\\lim_{x \\to c^-} f(x) = L$ and $\\lim_{x \\to c^+} f(x) = L$. When the particles land at different values, the one-sided limits are unequal and the two-sided limit Does Not Exist (DNE). A jump discontinuity is the most common way this happens.',
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
        mathBridge: 'The table shows numerical evidence for $\\lim_{x \\to 2} \\frac{x^2-4}{x-2} = 4$. Each row is a closer approximation — $x = 1.9, 1.99, 1.999, \\ldots$ from the left and $x = 2.1, 2.01, 2.001, \\ldots$ from the right. Both columns converge to 4. The graph and table tell the same story: the limit is a single agreed-upon value approached from both directions.',
        caption: 'The table updates in sync with the graph: both sides approach 4, even though f(2) is undefined.',
      },
      {
        id: 'HoleVsValue',
        title: 'Hole vs. Function Value — Three Cases',
        mathBridge: 'The limit $\\lim_{x \\to c} f(x)$ and the function value $f(c)$ are independent. Three cases: (1) $f(c)$ undefined — the limit can still exist. (2) $f(c)$ defined but $f(c) \\neq L$ — the limit exists but disagrees with the value. (3) $f(c) = L$ — this is continuity. Only case 3 lets you evaluate a limit by substitution.',
        caption: 'Switch between three scenarios: undefined (hole), redefined (value ≠ limit), and continuous (value = limit). This is the core distinction calculus builds on.',
      },
    ],
  },

  rigor: {
    // Geometric proof steps — synced with LimitGeometric visualization
    proofSteps: [
      {
        expression: 'f(x) = \\frac{x^2 - 4}{x - 2}, \\quad f(2) = \\frac{0}{0} \\text{ (undefined)}',
        annotation: 'The function has a hole at x = 2. We cannot simply plug in x = 2. The graph shows the line y = x + 2 with an open circle (hole) at (2, 4).',
      },
      {
        expression: 'x \\to 2^- \\colon\\; f(x) \\to 4',
        annotation: 'Approach from the LEFT: x = 1.9 → f = 3.9, x = 1.99 → f = 3.99, x = 1.999 → f = 3.999. The red dot slides toward (2, 4).',
      },
      {
        expression: 'x \\to 2^+ \\colon\\; f(x) \\to 4',
        annotation: 'Approach from the RIGHT: x = 2.1 → f = 4.1, x = 2.01 → f = 4.01, x = 2.001 → f = 4.001. The blue dot slides toward (2, 4).',
      },
      {
        expression: '\\lim_{x \\to 2^-} f(x) = 4 = \\lim_{x \\to 2^+} f(x)',
        annotation: 'Both sides converge to the SAME value: 4. When left-hand and right-hand limits agree, the two-sided limit exists. The box around the hole marks the limit value.',
      },
      {
        expression: '\\therefore\\; \\lim_{x \\to 2} f(x) = 4, \\text{ even though } f(2) \\text{ is undefined}',
        annotation: 'The limit is 4. The function value at x = 2 does not exist — but the limit does not care. It only asks what value the function APPROACHES, not what it equals AT the point.',
      },
    ],
    visualizationId: 'LimitGeometric',

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
        id: 'VideoEmbed',
        title: "A Limit Example Combining Multiple Algebraic Tricks",
        props: { url: "" }
      },
      {
        id: 'VideoEmbed',
        title: "Top 4 Algebraic Tricks for Computing Limits",
        props: { url: "" }
      },
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
        { expression: '\\lim_{x \\to 4} \\frac{x^2 - 3x + 1}{x + 2}', annotation: 'Check: is the denominator zero at x = 4? x + 2 = 4 + 2 = 6 ≠ 0. Direct substitution is valid.', hints: ['Substitute x=4 into the denominator first.', 'If denominator ≠ 0, you can substitute directly.'] },
        { expression: '= \\frac{(4)^2 - 3(4) + 1}{(4) + 2}', annotation: 'Substitute x = 4 everywhere.', hints: ['Plug in x=4 into numerator and denominator.', 'Calculate each part separately.'] },
        { expression: '= \\frac{16 - 12 + 1}{6}', annotation: 'Arithmetic in numerator: 16 − 12 = 4, then 4 + 1 = 5.', hints: ['Compute numerator: 16 - 12 = 4, 4 + 1 = 5.', 'Denominator is 6.'] },
        { expression: '= \\frac{5}{6}', annotation: '', hints: ['Divide 5 by 6.', 'The limit is 5/6.'] },
      ],
      conclusion: 'The limit is 5/6. Direct substitution works whenever the denominator is nonzero at the target point — which is exactly the definition of the function being continuous there.',
    },
    {
      id: 'ex-limit-factor',
      title: 'Evaluating a 0/0 Form by Factoring',
      problem: '\\displaystyle\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}',
      steps: [
        { expression: '\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}', annotation: 'Try direct substitution: numerator = 9−9 = 0, denominator = 3−3 = 0. This is the indeterminate form 0/0. We cannot divide by zero — but we can factor.', hints: ['Substitute x=3: numerator 9-9=0, denominator 0.', '0/0 is indeterminate, so factor.'] },
        { expression: '= \\lim_{x \\to 3} \\frac{(x+3)(x-3)}{x-3}', annotation: 'Factor numerator: x²−9 = (x−3)(x+3). Recognize this as a difference of squares: a²−b² = (a−b)(a+b) with a=x, b=3.', hints: ['Factor x²-9 as (x-3)(x+3).', 'This is a difference of squares.'] },
        { expression: '= \\lim_{x \\to 3} (x + 3)', annotation: 'Cancel (x−3). This cancellation is VALID because in a limit, x → 3 but x ≠ 3, so (x−3) ≠ 0 and we can divide by it.', hints: ['Cancel the (x-3) terms.', 'Since x ≠ 3 in the limit, it is okay.'] },
        { expression: '= 3 + 3 = 6', annotation: 'Now substitute x = 3. No problem — the simplified function x+3 is defined there.', hints: ['Substitute x=3 into x+3.', '3 + 3 = 6.'] },
      ],
      conclusion: 'The limit is 6. The original function has a "hole" at x = 3 (it\'s undefined there), but the limit fills in that hole: the function wants to be 6 at x = 3, even though it isn\'t defined there.',
    },
    {
      id: 'ex-limit-conjugate',
      title: 'Evaluating a 0/0 Form by Rationalizing',
      problem: '\\displaystyle\\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x}',
      steps: [
        { expression: '\\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x}', annotation: 'Direct sub gives 0/0: numerator = √4 − 2 = 0, denominator = 0. Factoring won\'t help here. Strategy: multiply by the conjugate to eliminate the square root.', hints: ['Substitute x=0: √4 - 2 = 0, denominator 0.', '0/0, so use conjugate method.'] },
        { expression: '= \\lim_{x \\to 0} \\frac{\\sqrt{x+4} - 2}{x} \\cdot \\frac{\\sqrt{x+4} + 2}{\\sqrt{x+4} + 2}', annotation: 'Multiply top and bottom by the conjugate of the numerator: (√(x+4) + 2). This equals 1, so we haven\'t changed the expression.', hints: ['Multiply by conjugate: √(x+4) + 2.', 'Conjugate of a - b is a + b.'] },
        { expression: '\\text{Numerator: } (\\sqrt{x+4} - 2)(\\sqrt{x+4} + 2) = (\\sqrt{x+4})^2 - 2^2', annotation: 'Difference of squares pattern: (a−b)(a+b) = a²−b² with a = √(x+4), b = 2.', hints: ['Expand using difference of squares.', '(a-b)(a+b) = a² - b².'] },
        { expression: '= (x+4) - 4 = x', annotation: 'The square root disappears! (√(x+4))² = x+4 and 2² = 4.', hints: ['(√(x+4))² = x+4, 4 = 4.', 'x+4 - 4 = x.'] },
        { expression: '= \\lim_{x \\to 0} \\frac{x}{x\\,(\\sqrt{x+4} + 2)}', annotation: 'Numerator is now just x.', hints: ['Numerator simplifies to x.', 'Denominator is x(√(x+4) + 2).'] },
        { expression: '= \\lim_{x \\to 0} \\frac{1}{\\sqrt{x+4} + 2}', annotation: 'Cancel x (valid since x ≠ 0 in the limit).', hints: ['Cancel x from numerator and denominator.', 'Left with 1 over the denominator.'] },
        { expression: '= \\frac{1}{\\sqrt{0+4} + 2} = \\frac{1}{2 + 2} = \\frac{1}{4}', annotation: 'Now substitute x = 0 safely.', hints: ['Substitute x=0: √4 + 2 = 2 + 2 = 4.', '1/4.'] },
      ],
      conclusion: 'The limit is 1/4. The conjugate technique is the go-to method whenever you have (√something − constant) or (√something + constant) in the numerator or denominator.',
    },
    {
      id: 'ex-one-sided',
      title: 'One-Sided Limits from a Piecewise Function',
      problem: 'Find both one-sided limits of f(x) = \\begin{cases} x+1 & x < 2 \\\\ 5 & x = 2 \\\\ x^2 - 1 & x > 2 \\end{cases} at x = 2. Does the two-sided limit exist? Is f continuous at x = 2?',
      steps: [
        { expression: '\\lim_{x \\to 2^-} f(x)', annotation: 'Approaching from the left means x < 2, so use the first piece: f(x) = x + 1.', hints: ['For left limit, use x < 2.', 'First piece: x + 1.'] },
        { expression: '= \\lim_{x \\to 2^-} (x+1) = 2 + 1 = 3', annotation: '', hints: ['Substitute x=2 into x+1.', '2 + 1 = 3.'] },
        { expression: '\\lim_{x \\to 2^+} f(x)', annotation: 'Approaching from the right means x > 2, so use the third piece: f(x) = x² − 1.', hints: ['For right limit, use x > 2.', 'Third piece: x² - 1.'] },
        { expression: '= \\lim_{x \\to 2^+} (x^2-1) = 4 - 1 = 3', annotation: '', hints: ['Substitute x=2 into x²-1.', '4 - 1 = 3.'] },
        { expression: '\\lim_{x \\to 2^-} f(x) = 3 = \\lim_{x \\to 2^+} f(x)', annotation: 'Both one-sided limits are equal.', hints: ['Compare left and right limits.', 'Both are 3.'] },
        { expression: '\\therefore \\lim_{x \\to 2} f(x) = 3', annotation: 'Two-sided limit exists and equals 3.', hints: ['Since left = right, two-sided limit exists.', 'Limit is 3.'] },
        { expression: 'f(2) = 5 \\quad \\text{(from the middle piece)}', annotation: 'The function value at x = 2 is explicitly defined as 5.', hints: ['Check f(2) from the definition.', 'Middle piece at x=2 is 5.'] },
        { expression: '\\lim_{x \\to 2} f(x) = 3 \\neq 5 = f(2)', annotation: 'The limit (3) does not equal the function value (5).', hints: ['Compare limit and function value.', '3 ≠ 5.'] },
        { expression: '\\therefore f \\text{ is NOT continuous at } x = 2.', annotation: 'Continuity requires that the limit equals the function value. Here they differ.', hints: ['For continuity, limit must equal f(c).', 'Here they differ, so not continuous.'] },
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
        { expression: '\\lim_{x \\to \\infty} \\frac{3x^2 - 2x + 1}{5x^2 + 4x - 7}', annotation: 'Both numerator and denominator grow without bound — this is the indeterminate form ∞/∞. Strategy: divide every term by the highest power of x in the denominator, which is x².', hints: ['For rational functions at infinity, divide every term by the highest power of x.', 'Here the highest power is x² because the top and bottom are both quadratic.'] },
        { expression: '= \\lim_{x \\to \\infty} \\frac{\\dfrac{3x^2}{x^2} - \\dfrac{2x}{x^2} + \\dfrac{1}{x^2}}{\\dfrac{5x^2}{x^2} + \\dfrac{4x}{x^2} - \\dfrac{7}{x^2}}', annotation: 'Divide every term (numerator and denominator) by x².', hints: ['Divide each term by x² so the leading powers become constants.', 'This rewrites the ratio in a form where lower-degree terms will vanish.'] },
        { expression: '= \\lim_{x \\to \\infty} \\frac{3 - \\dfrac{2}{x} + \\dfrac{1}{x^2}}{5 + \\dfrac{4}{x} - \\dfrac{7}{x^2}}', annotation: 'Simplify each fraction.', hints: ['Cancel the x² factors in each term.', 'Now the numerator and denominator each have a constant term plus vanishing corrections.'] },
        { expression: '\\text{As } x \\to \\infty:\\quad \\frac{1}{x} \\to 0, \\quad \\frac{1}{x^2} \\to 0', annotation: 'Terms with x in the denominator vanish as x grows.', hints: ['As x grows without bound, 1/x and 1/x² go to 0.', 'Only the constant terms survive in the limit.'] },
        { expression: '= \\frac{3 - 0 + 0}{5 + 0 - 0} = \\frac{3}{5}', annotation: '', hints: ['Replace the vanishing terms with 0.', 'The limit is the ratio of the leading coefficients: 3/5.'] },
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
    {
      id: 'ex-avg-to-instant-velocity',
      title: 'Average Velocity → Instantaneous Velocity (Physics)',
      problem: 'A ball is dropped from rest at a height of 80 ft. Its height (in feet) is $h(t) = 80 - 16t^2$ where $t$ is in seconds. (a) Compute the average velocity over $[1,\\; 1+\\Delta t]$ for $\\Delta t = 1, 0.5, 0.1, 0.01$. (b) What value does the average velocity approach as $\\Delta t \\to 0$? (c) Compute the limit directly.',
      visualizationId: 'ShrinkingInterval',
      steps: [
        { expression: '\\text{Avg velocity} = \\frac{h(1 + \\Delta t) - h(1)}{\\Delta t}', annotation: 'Average velocity = change in height ÷ change in time. This is the difference quotient — the slope of the secant line.', hints: ['Use change in height divided by change in time.', 'This is the secant-line slope over the interval [1, 1 + Δt].'] },
        { expression: 'h(1) = 80 - 16(1)^2 = 64 \\text{ ft}', annotation: 'Height at t=1 second.', hints: ['Substitute t = 1 into h(t).', 'The ball is at 64 ft after 1 second.'] },
        { expression: 'h(1 + \\Delta t) = 80 - 16(1+\\Delta t)^2 = 80 - 16(1 + 2\\Delta t + \\Delta t^2)', annotation: 'Expand (1+Δt)².', hints: ['Expand the square (1 + Δt)^2.', 'Use the binomial expansion 1 + 2Δt + Δt².'] },
        { expression: '= 64 - 32\\Delta t - 16\\Delta t^2', annotation: 'Distribute and simplify: 80 - 16 = 64.', hints: ['Distribute -16 across the parentheses.', 'Combine 80 - 16 to get 64.'] },
        { expression: '\\frac{h(1+\Delta t)-h(1)}{\\Delta t} = \\frac{(64-32\\Delta t - 16\\Delta t^2) - 64}{\\Delta t} = \\frac{-32\\Delta t - 16\\Delta t^2}{\\Delta t}', annotation: 'Subtract h(1)=64 and form the quotient.', hints: ['Subtract the earlier height h(1) from the later height.', 'Put the difference over Δt to form the average velocity.'] },
        { expression: '= \\frac{\\Delta t(-32 - 16\\Delta t)}{\\Delta t} = -32 - 16\\Delta t', annotation: 'Factor Δt from numerator and cancel (valid for Δt ≠ 0).', hints: ['Factor out Δt from the numerator.', 'Cancel Δt because average velocity uses Δt ≠ 0.'] },
        { expression: '\\lim_{\\Delta t \\to 0}(-32 - 16\\Delta t) = -32 \\text{ ft/s}', annotation: 'As Δt → 0, the term −16Δt → 0. The instantaneous velocity at t=1 is exactly −32 ft/s.', hints: ['Let Δt go to 0 so the correction term disappears.', 'The remaining constant is -32 ft/s.'] },
        { expression: '\\Delta t=1:\\;-48,\\quad \\Delta t=0.5:\\;-40,\\quad \\Delta t=0.1:\\;-33.6,\\quad \\Delta t=0.01:\\;-32.16', annotation: 'Numerical check: the average velocities converge to −32 ft/s from above.', hints: ['Plug in several shrinking Δt values to see the trend.', 'The values get closer to -32 as Δt shrinks.'] },
      ],
      conclusion: 'The instantaneous velocity at t=1 is −32 ft/s (the ball is falling at 32 ft/s). The negative sign means the height is decreasing — the ball is moving downward. This is precisely the derivative h\'(1) = −32t|_{t=1} = −32, which we\'ll compute using rules in Chapter 2. The limit is the engine that converts "average over an interval" into "instantaneous at a point."',
    },
  ],

  challenges: [
    {
      id: 'ch1-lim-c1',
      difficulty: 'medium',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 1} \\frac{x^3 - 1}{x^2 - 1}.',
      hint: 'Factor both numerator and denominator completely. Sum of cubes: a³−b³ = (a−b)(a²+ab+b²). Difference of squares: a²−b² = (a−b)(a+b).',
      walkthrough: [
        { expression: '\\lim_{x \\to 1} \\frac{x^3-1}{x^2-1}', annotation: 'Direct substitution gives 0/0. Factor both.', hints: ['Substitute x=1: 1-1=0, 1-1=0.', '0/0, so factor numerator and denominator.'] },
        { expression: '= \\lim_{x \\to 1} \\frac{(x-1)(x^2+x+1)}{(x-1)(x+1)}', annotation: 'x³−1 = (x−1)(x²+x+1) [sum of cubes]; x²−1 = (x−1)(x+1) [difference of squares].', hints: ['Factor x³-1 as (x-1)(x²+x+1).', 'Factor x²-1 as (x-1)(x+1).'] },
        { expression: '= \\lim_{x \\to 1} \\frac{x^2+x+1}{x+1}', annotation: 'Cancel (x−1), valid since x ≠ 1.', hints: ['Cancel (x-1) from numerator and denominator.', 'Left with (x²+x+1)/(x+1).'] },
        { expression: '= \\frac{1+1+1}{1+1} = \\frac{3}{2}', annotation: 'Substitute x = 1.', hints: ['Substitute x=1 into the simplified fraction.', '1+1+1=3, 1+1=2, 3/2.'] },
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

  // ─── Spiral Learning: where we came from, where we are going ─────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'ch0-lines',
        label: 'Last lesson: Lines and Slope (Ch. 0)',
        note: 'You computed slope as \u0394y / \u0394x — rise over run between two points. That ratio IS the difference quotient. The limit is what happens when you let the \u0394x shrink toward zero instead of leaving it fixed. Same formula. One more step.'
      },
      {
        lessonId: 'ch0-functions',
        label: 'Also from Ch. 0: What Is a Function?',
        note: 'You learned that f(x) is a machine: put in x, get out y. The limit asks: as we feed in values of x closer and closer to c, what output does the machine home in on? The machine (the function) is the same — the question is new.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'ch2-derivative-intro',
        label: 'Coming next: The Derivative (Ch. 2)',
        note: 'The derivative is defined as lim(h\u21920) [f(x+h) - f(x)] / h. That is a limit. Every derivative you will ever compute is built on exactly what you learned here. The 0/0 indeterminate form you learn to handle now is the same one you will cancel your way through hundreds of times in Chapter 2.'
      },
      {
        lessonId: 'ch1-continuity',
        label: 'Coming soon: Continuity (Ch. 1)',
        note: 'Continuity at c simply means the limit equals the function value: lim(x\u2192c) f(x) = f(c). That is the special case where the GPS prediction matches the actual destination. You will find continuity surprisingly nuanced.'
      }
    ]
  },

  // ─── Assessment: Mastery Check ────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'lim-assess-1',
        type: 'input',
        text: 'Evaluate: lim(x\u21922) of (x\u00b2 \u2212 4)/(x \u2212 2). Hint: factor the top.',
        answer: '4',
        hint: 'x\u00b2 \u2212 4 = (x+2)(x\u2212 2). Cancel (x\u22122), then substitute x=2 into what remains.'
      },
      {
        id: 'lim-assess-2',
        type: 'input',
        text: 'The left-hand limit is 7 and the right-hand limit is 7. What is lim(x\u2192c) f(x)?',
        answer: '7',
        hint: 'When both sides agree, that shared value IS the two-sided limit.'
      },
      {
        id: 'lim-assess-3',
        type: 'choice',
        text: 'When you get 0/0 from direct substitution, this means:',
        options: ['The limit is zero', 'The limit does not exist', 'More algebraic work is needed — it is indeterminate', 'The function is continuous'],
        answer: 'More algebraic work is needed \u2014 it is indeterminate',
        hint: '0/0 is the indeterminate form. It signals that factoring, conjugates, or another technique is needed.'
      },
      {
        id: 'lim-assess-4',
        type: 'input',
        text: 'In the epsilon-delta definition, which Greek letter controls the OUTPUT tolerance?',
        answer: 'epsilon',
        hint: '\u03b5 (epsilon) is the output tolerance. \u03b4 (delta) is the input radius you choose in response.'
      },
      {
        id: 'lim-assess-5',
        type: 'choice',
        text: 'A slope of \u0394y/\u0394x is the _____ rate of change over an interval. The limit as \u0394x \u2192 0 gives the _____ rate of change.',
        options: [
          'average; instantaneous',
          'instantaneous; average',
          'continuous; discontinuous',
          'marginal; total'
        ],
        answer: 'average; instantaneous',
        hint: 'You computed \u0394y/\u0394x in the Lines lesson (average). As the interval shrinks to zero, it becomes the derivative (instantaneous). That transition is THIS lesson.'
      }
    ]
  },

  // ─── Mental Model Compression ─────────────────────────────────────────────
  mentalModel: [
    'Limit = What the function is heading toward',
    '0/0 = Indeterminate (do more algebra)',
    'DNE = Both sides disagree',
    'Continuity = Limit matches Function Value',
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
