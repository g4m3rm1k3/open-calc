export default {
  id: 'derivatives-introduction',
  slug: 'derivatives-introduction',
  title: 'Derivatives: The Slope Machine',
  subtitle: 'What a derivative is, why it exists, and the four ways to think about it',
  tags: ['calculus', 'derivatives', 'rate-of-change', 'differentiation', 'tangent line', 'instantaneous velocity', 'local linearity'],
  chapter: 2,
  order: 0,

  hook: {
    question: "Your car's speedometer reads 62 mph. But speed = distance \u00f7 time \u2014 and at a single instant you travel zero distance in zero time. That's 0/0, which is undefined. So how can your speed be 62 mph at a single moment?",
    realWorldContext: 'This is not a trick question — it is the paradox that Newton and Leibniz independently solved in the 1670s, and their solution is called the derivative. Every speedometer, every radar gun, every physics simulation, every machine-learning gradient computation, every economic "marginal" analysis uses the derivative. It is the mathematical language of instantaneous change, and it is the central idea of this entire chapter.',
    previewVisualizationId: 'TangentLineViz',
  },

  mentalModel: [
    'Derivative = slope = rate of change = sensitivity',
    '"If x shifts slightly, how much does f(x) shift?"',
    'It is LOCAL — depends on where you are, not the whole function'
  ],

  triggers: [
    { prompt: 'Instantaneous rate, speed right now, slope at a point', recall: "Derivative f'(x)" },
    { prompt: 'Tangent line, zoomed-in curve', recall: 'Derivative at a point = slope of tangent' },
    { prompt: 'Small change approximation', recall: "f(x+h) ≈ f(x) + f'(x)·h" },
    { prompt: 'Marginal cost, growth rate, velocity', recall: 'These are all derivatives in different domains' },
  ],

  // ─── SPIRAL LEARNING ──────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        label: 'Slope of a Line (Chapter 0)',
        note: 'The derivative is the slope formula Δy/Δx taken to an extreme — as Δx → 0. If slope feels fuzzy, revisit Chapter 0 before continuing.',
      },
      {
        label: 'Limits (Chapter 1)',
        note: 'The derivative is defined as a limit. Chapter 1 taught you exactly what limits mean and how to compute them. Everything here builds on that.',
      },
    ],
    futureLinks: [
      {
        label: 'Limit Definition (Next Lesson)',
        note: 'This lesson gives you intuition. The next lesson builds the rigorous definition using the difference quotient.',
      },
      {
        label: 'Differentiation Rules (Lesson 3)',
        note: 'Once you have the definition, Lesson 3 gives you shortcuts — the power, product, and quotient rules — so you almost never compute limits again.',
      },
    ],
  },

  intuition: {
    semantics: {
      core: [
        { symbol: 'x', meaning: 'the input — the variable you control or observe' },
        { symbol: 'f(x)', meaning: 'the output — what the system produces at input x' },
        { symbol: 'h', meaning: 'a tiny change in x (probe distance; h ≠ 0, but approaches 0)' },
        { symbol: 'f(x+h) - f(x)', meaning: 'the resulting change in output (the "rise")' },
        { symbol: '[f(x+h)-f(x)]/h', meaning: 'slope of the secant line = average rate of change over the interval' },
        { symbol: 'h \\to 0', meaning: 'we shrink the interval to zero — this is what turns "average" into "instantaneous"' },
        { symbol: "f'(x)", meaning: "the derivative at x — the instantaneous rate of change — the slope of the tangent line" },
      ],
      rulesOfThumb: [
        'f(x) is NOT multiplication — it is a function machine: put in x, get out f(x)',
        'The derivative is NOT the difference quotient — it is the LIMIT of the difference quotient',
        'h never equals zero — it approaches zero. That distinction is everything.',
        'The derivative is local: f\'(2) only cares about f near x = 2, not anywhere else',
        'dy/dx is not literally a fraction — it is a limit — but it behaves like one algebraically',
      ]
    },

    prose: [
      // ── I. The Paradox ──────────────────────────────────────────────────────
      '**The Problem: Speed at a Single Instant**',
      'Imagine a car trip. You drive 120 miles in 2 hours — your average speed is 60 mph. That calculation is easy: distance divided by time, a single fraction. But now think about your speedometer at exactly 2:17:43 PM. It says 72 mph. How? At a single instant, you travel no distance in no time. The formula gives 0/0 — an undefined quantity. Yet 72 mph is a completely meaningful, measurable, physical number. How can that be?',
      'The same paradox appears everywhere: the instantaneous growth rate of a population, the exact slope of a curve at a point, the rate at which a drug concentration is dropping at a specific moment. We want to talk about rates "right now," but every formula for rate requires an interval of time or distance. Calculus — specifically, the derivative — resolves this paradox with mathematical precision.',

      // ── II. Average vs. Instantaneous ──────────────────────────────────────
      '**Step 1: Start with Average Rate of Change**',
      'Before solving the paradox, let\'s be precise about the simpler quantity: average rate of change. If f(t) gives your position at time t, the average velocity from t = a to t = b is: [f(b) - f(a)] / (b - a). This is Δy/Δx — the slope of the straight line connecting the two points (a, f(a)) and (b, f(b)) on the graph. That straight line is called a **secant line** (from the Latin "secare" — to cut; it cuts across the curve at two points).',
      'Everything starts here. The secant line slope is measurable, concrete, and computable. The question is: what happens to that slope as b gets closer and closer to a?',

      // ── III. The Limit Process ──────────────────────────────────────────────
      '**Step 2: Shrink the Interval Toward Zero**',
      'Watch what happens as we take smaller and smaller time intervals. Suppose f(t) = t² (think of a freely falling object where t is time and t² is proportional to distance fallen). At t = 2, let\'s compute the average velocity from t = 2 to t = 2 + h for shrinking values of h: h = 1 gives [f(3) - f(2)]/1 = [9 - 4]/1 = 5. h = 0.1 gives [f(2.1) - f(2)]/0.1 = [4.41 - 4]/0.1 = 4.1. h = 0.01 gives [f(2.01) - f(2)]/0.01 = [4.0401 - 4]/0.01 = 4.01. h = 0.001 gives 4.001. The numbers are converging — they approach 4 as h approaches 0.',
      'This is the derivative! The derivative of f(t) = t² at t = 2 is 4. We never divided by zero — we watched the ratio approach a limit as h approached zero. The limit resolved the paradox: we don\'t evaluate at h = 0 (that would be 0/0). We ask what the ratio *approaches* as h gets arbitrarily small. Those are completely different questions.',

      // ── IV. The Geometric Picture ───────────────────────────────────────────
      '**The Geometry: Secant Lines Rotating into the Tangent Line**',
      'Geometrically, here is what is happening. Each secant line through (2, f(2)) and (2+h, f(2+h)) has slope [f(2+h) - f(2)]/h. As h shrinks, the second point slides along the curve toward (2, 4). The secant line rotates. In the limit, it becomes a line that touches the curve at exactly one point — it just brushes the curve — and has the same slope as the curve at that point. This is the **tangent line**. The derivative at a point is the slope of the tangent line at that point.',
      '**This is not abstract.** Zoom in on any smooth curve near a point with a microscope. Zoom in far enough and the curve stops looking curved — it looks like a straight line. That straight line is the tangent line. Its slope is the derivative. Mathematicians call this property **local linearity**: every differentiable function looks linear when you zoom in close enough.',

      // ── V. The Four Perspectives ────────────────────────────────────────────
      '**Four Ways to See the Same Thing**',
      'The derivative has four equivalent interpretations. Master all four, because different problems call for different lenses: (1) **Geometric**: the slope of the tangent line to the graph of f at the point (x, f(x)). (2) **Physical**: the instantaneous velocity — if f(t) is position, f\'(t) is how fast position is changing at time t. (3) **Algebraic**: the limit of the difference quotient [f(x+h) - f(x)] / h as h → 0. (4) **Computational**: the best linear approximation to f near x — meaning f(x+h) ≈ f(x) + f\'(x)·h for small h. All four describe the same object. The visualization below the Perspective Synchronization Block lets you switch between them.',

      // ── VI. Sensitivity and Local Linearity ─────────────────────────────────
      '**The Sensitivity Interpretation — the Most Useful One**',
      'The most powerful practical interpretation of the derivative is as a **sensitivity**: f\'(x) tells you how much f(x) responds to a tiny change in x. If f\'(2) = 5, it means that near x = 2, a change of +0.01 in x produces a change of approximately +0.05 in f(x) — it amplifies the change by a factor of 5. If f\'(2) = -3, a change of +0.01 in x produces a change of approximately -0.03 in f(x) — it reverses and amplifies. This sensitivity interpretation is the key to understanding the chain rule (sensitivities multiply), the product rule, and every application in optimization, physics, and economics.',
      'The formal statement of this sensitivity is the **local linearity formula**: f(x + h) ≈ f(x) + f\'(x) · h for small h. This says: the function near x looks like the line f(x) + (slope) · h. The derivative is the slope of that local line. The error in this approximation shrinks faster than h does — it is "better than linear" as a model of f near x.',

      // ── VII. Three Concrete Domains ─────────────────────────────────────────
      '**The Derivative Appears Everywhere**',
      'The same mathematical object — the limit of a ratio — describes completely different physical phenomena: In **kinematics**: if s(t) is position at time t, then v(t) = s\'(t) is instantaneous velocity, and a(t) = v\'(t) = s\'\'(t) is acceleration. In **economics**: if C(x) is the cost to produce x units, then C\'(x) is the marginal cost — the additional cost of producing one more unit. Economists design entire pricing strategies around marginal cost. In **biology/medicine**: if P(t) is a population (or drug concentration) at time t, then P\'(t) is the growth rate (or absorption rate) — negative when the population shrinks. In each case, the derivative answers: "How fast is this quantity changing right now?"',

      // ── VIII. Prior Knowledge Connection ───────────────────────────────────
      '**Connecting to What You Already Know**',
      'You have both ingredients. From Chapter 0: you know slope = Δy/Δx = rise/run, and you can compute it for any two points. From Chapter 1: you know how to take limits — what a function approaches as its input gets close to a value. The derivative is *exactly* the limit of the slope formula: lim[h→0] [f(x+h) - f(x)] / h. You already know both halves. This lesson puts them together.',

      // ── IX. Notation ────────────────────────────────────────────────────────
      '**Notation — Multiple Names for the Same Thing**',
      'Mathematicians write the derivative in several equivalent ways. If y = f(x), all of the following mean the same thing: f\'(x) (Lagrange notation — compact, good for algebra), dy/dx (Leibniz notation — looks like a fraction, excellent for chain rule and related rates), d/dx[f(x)] (operator notation — emphasizes that d/dx is an operation applied to f), and ẏ (Newton\'s dot notation — used in physics for time derivatives). Leibniz notation dy/dx is particularly powerful because it behaves algebraically like a fraction in many situations (it is not literally a fraction — it is a limit — but the chain rule makes it look like one). You will use all four notations in this course; learn to recognize each.',

      // ── X. When Derivatives Don't Exist ─────────────────────────────────────
      '**Not Every Function Has a Derivative Everywhere**',
      'The derivative requires the limit [f(x+h)-f(x)]/h to exist as h→0. Three things can make that limit fail: (1) A **corner** or **cusp** — like |x| at x=0 — where the slope from the left and from the right are different numbers, so the limit doesn\'t exist. (2) A **vertical tangent** — like x^(1/3) at x=0 — where the slope grows without bound (slope → ∞). (3) A **discontinuity** — at a jump or break in the graph, there is no well-defined tangent line. The failure modes table at the bottom of this section lists these cases explicitly.',

      // ── XI. How to Use the Visualizations ───────────────────────────────────
      '**How to Use the Visualizations Below**',
      'Work through the four interactive visualizations in order. First, LineFoundationsLab refreshes slope — run your mouse along the line and watch Δy/Δx stay constant. Second, CalculusFoundationsLab decodes the notation — every symbol in the derivative formula is mapped to a concrete meaning before you see the formula. Third, TangentLineViz shows the geometric derivative — drag the point along the curve and watch the tangent slope change. Fourth, DerivativeFromFirstPrinciplesViz is the key animation — drag h toward zero and watch the secant line rotate into the tangent line. That rotation IS the limit definition. Finally, PositionVelocityAcceleration shows the derivative chain in physics — three graphs live, connected by differentiation.',
    ],

    perspectives: [
      { type: 'geometric', statement: 'Slope of the tangent line to the graph at the point (x, f(x))' },
      { type: 'physical', statement: 'Instantaneous velocity — how fast position changes at one moment' },
      { type: 'algebraic', statement: "Limit of the difference quotient: lim[h→0] [f(x+h)-f(x)]/h" },
      { type: 'computational', statement: "Local linear approximation: f(x+h) ≈ f(x) + f'(x)·h for small h" },
    ],
    bridge: "All four perspectives define the same quantity — f'(x). Understanding all four makes you fluent, not just capable.",

    localLinearity: {
      statement: 'Zoom in on any smooth curve far enough and it looks like a straight line',
      formula: "f(x+h) \\approx f(x) + f'(x)h \\quad \\text{for small } h",
      meaning: "The derivative f'(x) is the slope of that local line — the best linear predictor of change near x",
    },

    visualizations: [
      {
        id: 'LineFoundationsLab',
        title: 'Step 1 — Foundations: What is Slope?',
        mathBridge: 'The derivative will be the slope formula taken to an extreme. Start here to make sure slope = Δy/Δx is solid. Move the two points on the line. Notice: the slope stays constant (that is what makes a line a line). The derivative will generalize this to curves, where slope changes at every point.',
        caption: 'Prerequisite check: drag the two points and confirm that slope = rise/run = (y₂−y₁)/(x₂−x₁) no matter where you place them. A constant slope is the defining property of a line.',
      },
      {
        id: 'CalculusFoundationsLab',
        title: 'Step 2 — Decoding the Symbols Before They Appear',
        mathBridge: 'The derivative formula is f\'(x) = lim[h→0] [f(x+h) - f(x)] / h. Every symbol in that formula has a concrete meaning. This lab lets you set specific values of x and h and see exactly what f(x), f(x+h), and f(x+h)-f(x) mean geometrically. Do this BEFORE you encounter the formal definition — it will make the formula feel obvious, not mysterious.',
        caption: 'Pick a function and a point x. Set h to a value like 0.5. The lab shows you f(x), f(x+h), and the difference — these are the rise and run of the secant line.',
      },
      {
        id: 'TangentLineViz',
        title: 'Step 3 — The Geometric Derivative: Tangent Lines',
        mathBridge: 'Every point on a smooth curve has a tangent line — the line that just brushes the curve there with the same slope. Move the orange point along the curve. Watch the tangent line rotate. The slope of that tangent line at each position is exactly f\'(x) at that x. Where the function is steep, f\'(x) is large. Where the function is flat, f\'(x) ≈ 0. Where the function peaks or valleys, the tangent is horizontal: f\'(x) = 0.',
        caption: 'Drag the point. At a local maximum the tangent is horizontal (slope = 0). At a steep rise it is steep (slope > 0). At a steep fall it is steep the other way (slope < 0). Read the slope value displayed.',
      },
      {
        id: 'DerivativeFromFirstPrinciplesViz',
        title: 'Step 4 — The Limit in Action: Secant Becoming Tangent',
        mathBridge: 'This is the core animation of Chapter 2. Two points sit on the curve — one fixed at x=a, one movable at x=a+h. The secant line connects them. As you drag h toward zero, the movable point slides toward the fixed point. The secant line rotates. At h=0 it would be 0/0 — undefined. But BEFORE h reaches zero, the slope settles into a specific value. That limiting value is the derivative f\'(a). Watch the slope readout as h shrinks from 1 to 0.5 to 0.1 to 0.01.',
        caption: 'Drag h from large to small. The secant slope stabilizes to a definite number — that is f\'(a). The paradox is resolved: we never divide by zero; we take the limit as we approach zero.',
      },
      {
        id: 'PositionVelocityAcceleration',
        title: 'Step 5 — The Derivative Chain: Position → Velocity → Acceleration',
        mathBridge: 'If s(t) is position, then v(t) = s\'(t) is velocity, and a(t) = v\'(t) = s\'\'(t) is acceleration. Each lower graph is the derivative of the one above. Notice: where the position graph is rising steeply, the velocity graph is large and positive. Where position peaks, velocity = 0 (the derivative of a local maximum is zero). Where position is concave up (curving upward), acceleration is positive. Every relationship you see here will be proved rigorously in the lessons ahead.',
        caption: 'Watch all three graphs update simultaneously. Click and drag the position curve to reshape it. This physical picture — not just algebra — is what differentiation means.',
      },
    ],

    callouts: [
      {
        type: 'sequencing',
        title: 'Chapter 2 Road Map — The Full Journey',
        body: `**Act 1 — The Question (Lessons 1–2)**
• Lesson 1 (you are here): Four perspectives, the paradox, and what a derivative IS
• Lesson 2: The rigorous limit definition — difference quotient → derivative

**Act 2 — The Toolkit (Lessons 3–5)**
• Lesson 3: Power, product, quotient rules — shortcuts proven from limits
• Lesson 4: The chain rule — most important rule in all of calculus
• Lesson 5: Product + chain trap drill — the #1 mistake, fixed immediately

**Act 3 — Special Functions (Lessons 6–8)**
• Lesson 6: Trig derivatives — why the slope of sin is cos
• Lesson 7: Exponential and log derivatives — e^x equals its own derivative
• Lesson 8: Inverse function derivatives — arcsin, arctan formulas

**Act 4 — Synthesis (Lessons 9–10)**
• Lesson 9: Implicit differentiation — when y can't be solved for
• Lesson 10: Reading f, f', f'' from graphs — the visual language`,
      },
      {
        type: 'prior-knowledge',
        title: 'You Already Have Both Ingredients',
        body: 'The derivative = limit of a slope formula. You know slope from Chapter 0: Δy/Δx. You know limits from Chapter 1: what expressions approach as variables get close to a value. This lesson snaps those two together. Nothing new is required — just synthesis.',
      },
      {
        type: 'real-world',
        title: 'The Same Math in Four Domains',
        body: '**Physics**: s(t) = position → s\'(t) = velocity → s\'\'(t) = acceleration. **Economics**: C(x) = cost → C\'(x) = marginal cost (cost of one more unit). **Biology**: P(t) = population → P\'(t) = growth rate. **Machine Learning**: L(w) = loss → ∂L/∂w = gradient (used in every neural network update). Same limit, four completely different worlds.',
      },
      {
        type: 'misconception',
        title: 'The Three Most Common Beginner Mistakes',
        body: '1. **Confusing the derivative with the difference quotient**: The difference quotient [f(x+h)-f(x)]/h is the slope of the SECANT line. The derivative is the LIMIT of that, and is the slope of the TANGENT line.\n2. **Thinking dy/dx is a fraction**: It looks like one and behaves like one in many situations, but it is defined as a limit. Treating it as a literal fraction leads to errors.\n3. **Forgetting the derivative is a function**: f\'(x) is not just a number — it is a new function that gives you the slope at EVERY point x.',
      },
    ],

    failureModes: [
      {
        case: 'Corner or cusp',
        example: '|x| \\text{ at } x=0',
        reason: 'Left-side slope is −1, right-side slope is +1 — the limit of the difference quotient does not exist because the left and right limits disagree',
      },
      {
        case: 'Vertical tangent',
        example: 'x^{1/3} \\text{ at } x=0',
        reason: 'The tangent line is vertical — slope → ∞ — so the derivative is undefined at that point',
      },
      {
        case: 'Discontinuity (jump)',
        example: '\\text{floor}(x) \\text{ at integer } x',
        reason: 'No tangent line can be drawn at a break — the limit of the difference quotient does not exist',
      },
      {
        case: 'Oscillation',
        example: 'x^2 \\sin(1/x) \\text{ at } x=0',
        reason: 'The difference quotient oscillates without settling to a limit (derivative exists here but demonstrates the general fragility)',
      },
    ],
  },

  math: {
    processDefinition: [
      'Fix a point x on the function',
      'Choose a second point a distance h away: compute [f(x+h) - f(x)] / h — this is the secant slope',
      'Shrink h toward 0 (but never let h = 0)',
      'Watch the secant slope stabilize to a specific number',
      'That limiting number is f\'(x) — the derivative at x',
    ],
    prose: [
      'We are now ready to state the formal definition. There are two closely related versions: the derivative at a specific point a (a number), and the derivative function f\'(x) (a new function of x).',
      '**Definition at a point**: The derivative of f at x = a is the number f\'(a) = lim[h→0] [f(a+h) - f(a)] / h, provided this limit exists and is finite. If the limit exists, we say f is **differentiable** at a.',
      '**Derivative function**: By letting a vary, we get the derivative function f\'(x) = lim[h→0] [f(x+h) - f(x)] / h. For each x where f is differentiable, f\'(x) gives the slope of f at that x. The derivative function encodes the slope of f at every point simultaneously.',
      '**All common notations mean the same thing**: If y = f(x), then f\'(x) = y\' = dy/dx = d/dx[f(x)] = Df(x) = ẏ (in physics). Leibniz notation dy/dx is powerful in chain rule and integration. Lagrange notation f\'(x) is compact for algebra. Newton\'s ẏ appears in physics textbooks.',
      '**Higher derivatives**: Differentiating once gives f\'(x). Differentiating f\'(x) gives f\'\'(x) — the second derivative. Then f\'\'\'(x), and so on. In Leibniz notation: d²y/dx², d³y/dx³. Second derivative measures the rate of change of the rate of change — geometrically, it measures concavity (whether the curve bends up or down).',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Formal Limit Definition',
        body: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\qquad \\text{(provided the limit exists)}",
      },
      {
        type: 'definition',
        title: 'Five Equivalent Notations',
        body: "f'(x) = y' = \\frac{dy}{dx} = \\frac{d}{dx}[f(x)] = Df(x) \\qquad \\text{(all mean the same thing)}",
      },
      {
        type: 'theorem',
        title: 'Differentiability Implies Continuity',
        body: 'If f is differentiable at x = a, then f is continuous at x = a. The converse is FALSE — continuous does not imply differentiable (corners are continuous but not differentiable).',
      },
      {
        type: 'insight',
        title: 'Preview: The Rules You Will Prove in Lessons 3–4',
        body: `After the limit definition is established, the following shortcuts are proved from it:
- **Power Rule**: $\\frac{d}{dx}[x^n] = nx^{n-1}$ (for any real $n$)
- **Sum Rule**: $\\frac{d}{dx}[f+g] = f' + g'$
- **Product Rule**: $\\frac{d}{dx}[fg] = f'g + fg'$
- **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x))\\cdot g'(x)$

These are theorems — proved once from the limit definition, used forever.`,
      },
      {
        type: 'misconception',
        title: 'dy/dx is NOT Literally a Fraction',
        body: "dy/dx looks like a fraction and behaves like one in the chain rule and separable differential equations, but it is defined as a limit. You cannot 'cancel' the dx in general. The notation is brilliantly suggestive — Leibniz designed it that way — but it is notation, not arithmetic.",
      },
    ],
  },

  rigor: {
    title: 'Proving the Power Rule for f(x) = x² from First Principles',
    prose: [
      'We use nothing except the limit definition. The key step is expanding (x+h)² algebraically, then canceling the h in numerator and denominator. We are allowed to cancel h because in the limit process, h approaches zero but is never equal to zero — canceling is legal for h ≠ 0.',
      'After canceling, we get a polynomial in h that is defined at h = 0. Taking the limit is then just substituting h = 0. This is the prototype for computing all power rule derivatives from first principles.',
    ],
    proofSteps: [
      {
        expression: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} = \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h}",
        annotation: 'Apply the definition: substitute f(x) = x² into the difference quotient',
      },
      {
        expression: "= \\lim_{h \\to 0} \\frac{x^2 + 2xh + h^2 - x^2}{h}",
        annotation: 'Expand (x+h)² = x² + 2xh + h² using the binomial square formula',
      },
      {
        expression: "= \\lim_{h \\to 0} \\frac{2xh + h^2}{h}",
        annotation: 'The x² terms cancel: x² − x² = 0. We are left with terms containing h',
      },
      {
        expression: "= \\lim_{h \\to 0} \\frac{h(2x + h)}{h}",
        annotation: 'Factor h from the numerator',
      },
      {
        expression: "= \\lim_{h \\to 0} (2x + h)",
        annotation: 'Cancel h from numerator and denominator — VALID because h ≠ 0 in the limit process',
      },
      {
        expression: "= 2x + 0 = 2x",
        annotation: 'Substitute h = 0 in the limit. Result: the derivative of x² is 2x at every point x',
      },
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why This Generalizes to xⁿ',
        body: 'For f(x) = xⁿ, expanding (x+h)ⁿ by the binomial theorem gives xⁿ + nxⁿ⁻¹h + (terms with h²). After subtracting xⁿ, dividing by h, and taking h→0, only the nxⁿ⁻¹ term survives. This proves the power rule: d/dx[xⁿ] = nxⁿ⁻¹ for any integer n. (The extension to all real n uses logarithmic differentiation, proved in Lesson 7.)',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-10-ex1',
      title: 'Computing a Derivative from the Definition',
      problem: 'Use the limit definition to find f\'(x) for f(x) = 3x + 5.',
      steps: [
        { expression: "f'(x) = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h} = \\lim_{h\\to 0}\\frac{[3(x+h)+5]-[3x+5]}{h}", annotation: 'Write out the definition with f(x) = 3x + 5 substituted' },
        { expression: "= \\lim_{h\\to 0}\\frac{3x+3h+5-3x-5}{h}", annotation: 'Expand the numerator' },
        { expression: "= \\lim_{h\\to 0}\\frac{3h}{h}", annotation: 'The 3x and 5 terms cancel' },
        { expression: "= \\lim_{h\\to 0} 3 = 3", annotation: 'Cancel h, then substitute h=0. Result: the derivative of a line is its slope — no surprise.' },
      ],
      conclusion: 'The derivative of a linear function is its slope constant. This confirms the rule: d/dx[mx + b] = m.',
    },
    {
      id: 'ch2-10-ex2',
      title: 'Velocity from a Position Function',
      problem: 'A ball is thrown upward with position s(t) = -4.9t² + 20t meters. Find its instantaneous velocity at t = 1 second. Is it still rising or already falling?',
      steps: [
        { expression: "v(t) = s'(t) = \\frac{d}{dt}[-4.9t^2 + 20t]", annotation: 'Velocity is the derivative of position' },
        { expression: "= -4.9 \\cdot 2t + 20 \\cdot 1 = -9.8t + 20", annotation: 'Power rule on each term: d/dt[t²] = 2t, d/dt[t] = 1' },
        { expression: "v(1) = -9.8(1) + 20 = 10.2 \\text{ m/s}", annotation: 'Evaluate at t = 1' },
      ],
      conclusion: 'At t = 1 s, the ball is moving upward at 10.2 m/s (positive means upward). The ball reaches its peak when v = 0: −9.8t + 20 = 0 → t ≈ 2.04 s. After that, v < 0 and the ball falls.',
    },
    {
      id: 'ch2-10-ex3',
      title: 'Marginal Cost in Economics',
      problem: 'A factory\'s cost to produce x items is C(x) = 0.01x² + 5x + 200 dollars. What is the marginal cost at x = 100 items? What does it mean?',
      steps: [
        { expression: "C'(x) = \\frac{d}{dx}[0.01x^2 + 5x + 200]", annotation: 'Marginal cost = derivative of total cost' },
        { expression: "= 0.01(2x) + 5 + 0 = 0.02x + 5", annotation: 'Power rule on each term' },
        { expression: "C'(100) = 0.02(100) + 5 = 2 + 5 = 7 \\text{ dollars/item}", annotation: 'Evaluate at x = 100' },
      ],
      conclusion: 'At 100 items, producing one more item costs approximately $7. Notice the actual cost of going from 100 to 101 items is C(101) - C(100) = (0.01·10201 + 505 + 200) - (0.01·10000 + 500 + 200) = $7.01 — the derivative predicted $7, which is accurate to within 1 cent. This is local linearity in action.',
    },
  ],

  challenges: [
    {
      id: 'ch2-10-c1',
      difficulty: 'medium',
      problem: 'Using the limit definition, prove that the derivative of f(x) = x³ is f\'(x) = 3x². (Hint: expand (x+h)³ and cancel h.)',
      hint: '(x+h)³ = x³ + 3x²h + 3xh² + h³. After subtracting x³ and dividing by h, you get 3x² + 3xh + h². Take the limit.',
      walkthrough: [
        { expression: "\\frac{(x+h)^3 - x^3}{h} = \\frac{x^3 + 3x^2h + 3xh^2 + h^3 - x^3}{h}", annotation: 'Expand (x+h)³ using the cube expansion' },
        { expression: "= \\frac{3x^2h + 3xh^2 + h^3}{h}", annotation: 'Cancel x³ terms' },
        { expression: "= 3x^2 + 3xh + h^2", annotation: 'Cancel h from every term (valid since h ≠ 0)' },
        { expression: "\\lim_{h\\to 0}(3x^2 + 3xh + h^2) = 3x^2", annotation: 'Substitute h = 0. The 3xh and h² terms vanish.' },
      ],
      answer: "f'(x) = 3x²",
    },
    {
      id: 'ch2-10-c2',
      difficulty: 'medium',
      problem: 'The tangent line to f(x) = x² at the point (3, 9) passes through what y-intercept? Write the equation of the tangent line.',
      hint: "Find the slope using f'(3), then use point-slope form with the point (3, 9).",
      walkthrough: [
        { expression: "f'(x) = 2x \\implies f'(3) = 6", annotation: "Derivative gives slope at x=3" },
        { expression: "y - 9 = 6(x - 3)", annotation: "Point-slope form: slope 6, point (3,9)" },
        { expression: "y = 6x - 18 + 9 = 6x - 9", annotation: "Simplify to slope-intercept form" },
      ],
      answer: "y = 6x − 9 (y-intercept is −9)",
    },
  ],

  assessment: {
    questions: [
      {
        id: 'ch2-intro-q1',
        text: 'The derivative f\'(x) is defined as the limit of the ___ as h → 0.',
        type: 'choice',
        options: ['tangent line', 'difference quotient', 'average rate of change formula', 'secant slope at x=0'],
        answer: 'difference quotient',
        hint: 'The difference quotient is [f(x+h) - f(x)] / h — the slope of the secant line. The derivative is what this approaches.',
      },
      {
        id: 'ch2-intro-q2',
        text: 'If f\'(2) = 5, this means that near x = 2, a small increase of h in x produces an approximate change in f(x) of ___.',
        type: 'choice',
        options: ['5', '5h', '2h', 'h/5'],
        answer: '5h',
        hint: 'The local linearity formula: f(x+h) ≈ f(x) + f\'(x)·h. So the change is f\'(x)·h = 5h.',
      },
      {
        id: 'ch2-intro-q3',
        text: 'At a local maximum of f, the derivative f\' equals ___.',
        type: 'choice',
        options: ['∞', '−1', '0', 'undefined'],
        answer: '0',
        hint: 'At a peak, the tangent line is horizontal (flat). Slope = 0. So f\'(x) = 0 at every local maximum.',
      },
    ],
  },
};
