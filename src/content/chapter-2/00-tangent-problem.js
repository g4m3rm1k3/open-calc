// FILE: src/content/chapter-2/00-tangent-problem.js
export default {
  id: 'ch2-000',
  slug: 'tangent-problem',
  chapter: 2,
  order: 0,
  title: 'The Derivative — From Average to Instantaneous Change',
  subtitle: 'How a single limiting process unlocks the instantaneous rate of change of any function',
  tags: ['derivative', 'limit definition', 'difference quotient', 'tangent line', 'instantaneous rate of change', 'differentiability', 'notation'],

  grapher: {
    mode: 'pro',
    label: 'Explore the Derivative',
    functions: [
      { expr: 'x^2', type: 'explicit', color: '#6366f1', label: 'f(x) = x²' },
      { expr: '2*x', type: 'explicit', color: '#ec4899', label: "f'(x) = 2x" },
    ],
    sliders: [
      { name: 'a', min: -3, max: 3, value: 1 },
    ],
    replace: true,
  },

  hook: {
    question: 'Your GPS app tells you that your current speed is 62 mph. But speed is distance divided by time — if the measurement takes zero time, you travel zero distance. Zero divided by zero is undefined. So how can your speed be anything at all at a single instant?',
    realWorldContext: 'Every speedometer, every radar gun, every GPS velocity readout faces this paradox. We want to know how fast something is changing right now, not averaged over an interval. Yet the very formula for rate of change — distance over time — seems to require an interval of nonzero length. The derivative is the mathematical resolution of this paradox. It is the tool that makes instantaneous change not only meaningful but computable, and it is arguably the central idea of all of calculus.',
    previewVisualizationId: 'SecantToTangent',
  },

  intuition: {
    prose: [
      'Start with something we already understand: average rate of change. If you drive 120 miles in 2 hours, your average speed is 60 mph. If a population grows from 1,000 to 1,500 individuals over 5 years, the average growth rate is 100 individuals per year. In each case, we compute (change in output) divided by (change in input). This is the slope of the line connecting two points on the graph — called a secant line.',
      'Formally, the average rate of change of a function f over the interval from x = a to x = a + h is the slope of the secant line through the points (a, f(a)) and (a+h, f(a+h)). We write this as [f(a+h) - f(a)] / h. This expression has a name: the difference quotient. It is the single most important formula in differential calculus.',
      'Now ask: what happens as h gets smaller and smaller? The second point (a+h, f(a+h)) slides along the curve toward (a, f(a)). The secant line that once crossed the curve at two distinct points begins to rotate. In the limit, as h approaches 0, the secant line approaches a unique limiting position — the tangent line. The slope of that tangent line is the derivative.',
      'Here is why we cannot simply plug in h = 0 directly. At h = 0, the difference quotient becomes [f(a) - f(a)] / 0 = 0/0, which is the indeterminate form from Chapter 1. This is not a number — it is a failure of division. But taking the LIMIT as h approaches 0 is something entirely different from evaluating AT h = 0. The limit asks: what value does the expression approach as h gets arbitrarily close to 0? That question has a perfectly well-defined, finite answer for most functions.',
      'Think about what the difference quotient measures geometrically. The numerator f(a+h) - f(a) is the vertical rise from one point to the other. The denominator h is the horizontal run. So the ratio is rise over run — the slope of the secant line. As h shrinks, the two points get closer and closer together, but the slope of the line between them settles into a limiting value. That limiting slope is the derivative.',
      'The derivative tells us two things simultaneously, and they are really the same thing: (1) it is the slope of the curve at the point x = a, meaning the slope of the tangent line to the graph there, and (2) it is the instantaneous rate of change of the function at x = a. If f(t) is position, the derivative is instantaneous velocity. If f(x) is a population, the derivative is the instantaneous growth rate. If f(x) is profit as a function of units sold, the derivative is marginal profit.',
      'Mathematicians have invented several notations for the derivative, each with its own strengths. If y = f(x), then the derivative can be written as f\'(x) (read "f prime of x", due to Lagrange), or as dy/dx (Leibniz notation, emphasizing the ratio of infinitesimal changes), or as d/dx[f(x)] (operator notation), or as Df(x) (operator notation due to Euler), or even as y\u0307 (Newton\'s dot notation, used in physics for time derivatives). All of these mean exactly the same thing: the limit of the difference quotient. Leibniz notation dy/dx is especially useful when doing related rates and chain rule problems, because it behaves somewhat like a fraction (though it is not exactly one). Lagrange notation f\'(x) is compact and convenient for most algebraic work.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'You may have computed average speed before',
        body: 'Average speed = Δposition / Δtime = (x(t+h) - x(t)) / h. This is exactly the difference quotient! The derivative is what you get when you take h → 0, turning average speed into instantaneous speed. Your speedometer computes a limit thousands of times per second.',
      },
      {
        type: 'real-world',
        title: 'Three interpretations of the same derivative',
        body: 'If s(t) is position: s′(t) is velocity (instantaneous speed). If C(x) is cost of producing x units: C′(x) is marginal cost (cost of one more unit). If P(t) is population: P′(t) is the growth rate (people per year at that moment). Same math, three different worlds.',
      },
      {
        type: 'definition',
        title: 'The Difference Quotient',
        body: '\\dfrac{f(a+h) - f(a)}{h}',
      },
      {
        type: 'intuition',
        title: 'The Core Idea',
        body: 'The derivative is NOT the difference quotient. The derivative is the LIMIT of the difference quotient as h → 0. The difference quotient is the slope of a secant line; the derivative is the slope of the tangent line.',
      },
      {
        type: 'definition',
        title: 'Five Equivalent Notations',
        body: "f'(x) = \\frac{dy}{dx} = \\frac{d}{dx}[f(x)] = Df(x) = \\dot{y}",
      },
      {
        type: 'misconception',
        title: 'dy/dx is NOT a Fraction',
        body: "Leibniz notation dy/dx LOOKS like a fraction and often BEHAVES like one (especially in the chain rule), but it is defined as a LIMIT, not a ratio. You cannot, in general, 'cancel' the dx. The notation is brilliantly suggestive, but it is notation — not algebra.",
      },
      {
        type: 'history',
        title: 'Newton vs. Leibniz: The Calculus Priority Dispute',
        body: "Newton developed calculus in the 1660s using 'fluxions' (rates of change). Leibniz independently developed it in the 1670s-80s using infinitesimals. The resulting priority dispute was one of the bitterest in the history of science. Today, we use Leibniz's notation (dy/dx) because it is more versatile, but Newton's dot notation (ẏ) survives in physics.",
      },
    ],
    visualizations: [
    {
        id: 'VideoEmbed',
        title: "Graphical Comparison Function to its 1st and 2nd Derivative Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/QpIBzZe3Tts" }
      },
    {
        id: 'VideoEmbed',
        title: "Horizontal Tangent Lines and Differentiation Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/KFD7aei4bSg" }
      },
    {
        id: 'VideoEmbed',
        title: "Tangent Line of Curve Parallel to A Line Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/5PZH6YdERVM" }
      },
    {
        id: 'VideoEmbed',
        title: "Tangent Line Through Point not on Curve   4K",
        props: { url: "https://www.youtube.com/embed/s_aPRYImcng" }
      },
    {
        id: 'VideoEmbed',
        title: "Tangent Line Parallel to a Given Line Calculus Derivative 4K",
        props: { url: "https://www.youtube.com/embed/P4aNHLfpPyQ" }
      },
    {
        id: 'VideoEmbed',
        title: "Tangent Line and Normal Line in Calculus   4K",
        props: { url: "https://www.youtube.com/embed/tQStuKWRkSs" }
      },
    {
        id: 'VideoEmbed',
        title: "Instantaneous Velocity and Speed of Linear Motion Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/moAkbw2lGYc" }
      },
    {
        id: 'VideoEmbed',
        title: "Basic Differentiation Rules Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/Jnqe2_jt8Ac" }
      },
    {
        id: 'VideoEmbed',
        title: "Graphical Comparison of Function vs Derivative Graphs Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/vZ73BtywN3c" }
      },
    {
        id: 'VideoEmbed',
        title: "Why there is no Derivative at a Sharp Bend 4k",
        props: { url: "https://www.youtube.com/embed/jXRgZUQN1l8" }
      },
    {
        id: 'VideoEmbed',
        title: "Definition of Derivative and Vertical Tangent Line Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/GRPEi9WBo9k" }
      },
    {
        id: 'VideoEmbed',
        title: "Slope of Tangent Line Derivative at a Point Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/MNk7RnyU0mk" }
      },
    {
        id: 'VideoEmbed',
        title: "Definition of a Derivative & Alternative Form at a Point 4k",
        props: { url: "https://www.youtube.com/embed/_peU024gicM" }
      },
    {
        id: 'VideoEmbed',
        title: "Definition of Derivative & Tangent Line Problems Calculus 1 AB",
        props: { url: "https://www.youtube.com/embed/eWxo7O506G8" }
      },
      {
        id: 'VideoEmbed',
        title: "Definition of the Derivative  | Part I",
        props: { url: "https://www.youtube.com/embed/hp046sLvQpM" }
      },
      {
        id: 'SecantToTangent',
        title: 'Secant Line → Tangent Line',
        mathBridge: 'The secant line through $(a, f(a))$ and $(a+h, f(a+h))$ has slope $\\frac{f(a+h)-f(a)}{h}$ — the difference quotient. As $h \\to 0$, the second point slides toward the first and the secant rotates into the tangent line. The derivative $f\'(a)$ is the limiting slope of that rotation.',
        caption: 'Drag h toward 0. The secant slope converges to the derivative — the tangent slope.',
      },
      {
        id: 'PositionVelocityAcceleration',
        title: 'Position, Velocity, and Acceleration — Live',
        mathBridge: 'If $s(t)$ is position, then $v(t) = s\'(t) = \\frac{ds}{dt}$ is velocity, and $a(t) = v\'(t) = s\'\'(t)$ is acceleration. Each graph is the derivative of the one above it. When the position curve bends upward, the velocity is positive; when position peaks, velocity is zero — because the tangent slope at a maximum is zero.',
        caption: 'Watch the car move and see all three graphs update in real time. Velocity is the derivative of position; acceleration is the derivative of velocity.',
      },
      {
        id: 'LimitBridgeLab',
        title: 'Instantaneous Change Bridge Lab',
        mathBridge: 'Average rate of change over $[a, a+h]$ is $\\frac{f(a+h)-f(a)}{h}$. Instantaneous rate is $\\lim_{h \\to 0} \\frac{f(a+h)-f(a)}{h}$. This lab makes that transition visible: as $h$ shrinks, the "average" calculation becomes indistinguishable from the derivative.',
        caption: 'Practice shrinking a two-point measurement into a single-point slope using an interactive approach slider.',
      },
    ],
  },

  math: {
    prose: [
      'We are now ready to state the formal definition. There are two closely related versions: the derivative at a specific point a, and the derivative as a function of x.',
      'The derivative of f at the specific point x = a is the number f\'(a) defined by the limit of the difference quotient as h approaches 0. If this limit exists (is a finite real number), we say f is differentiable at a. The notation f\'(a) emphasizes that the derivative at a point is a single number — the slope at that point.',
      'The derivative function f\'(x) is obtained by letting a vary. Instead of computing the slope at one specific point, we compute it at every point where the limit exists. The result is a new function whose output at any x is the slope of the original function at that x.',
      'There is an alternative but equivalent form of the derivative at a point a, using x directly as the variable that approaches a: the limit as x approaches a of [f(x) - f(a)] / (x - a). This form is sometimes cleaner algebraically — you can factor (x - a) out of the numerator.',
      'Once we know the derivative f\'(a), we can write the equation of the tangent line to the graph of f at the point (a, f(a)). The tangent line passes through (a, f(a)) with slope f\'(a), so its equation is y - f(a) = f\'(a)(x - a). This is simply the point-slope form of a line.',
      'We also define one-sided derivatives, called the left-hand derivative and the right-hand derivative. The left-hand derivative at a is the limit of the difference quotient as h approaches 0 from the negative side (h → 0⁻). The right-hand derivative is the limit as h → 0⁺. The derivative f\'(a) exists if and only if both one-sided derivatives exist and are equal. One-sided derivatives are essential for analyzing functions defined by cases or functions with corners.',
      'A function is called differentiable on an open interval (c, d) if it is differentiable at every point in that interval. It is differentiable on a closed interval [c, d] if it is differentiable on the open interior (c, d) and both one-sided derivatives exist at the endpoints.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Derivative at a Point',
        body: "f'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}",
      },
      {
        type: 'definition',
        title: 'Derivative as a Function',
        body: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
      },
      {
        type: 'definition',
        title: 'Alternative Form (Point Version)',
        body: "f'(a) = \\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a}",
      },
      {
        type: 'definition',
        title: 'Tangent Line at (a, f(a))',
        body: 'y - f(a) = f\'(a)(x - a)',
      },
      {
        type: 'definition',
        title: 'One-Sided Derivatives',
        body: "f'_-(a) = \\lim_{h \\to 0^-} \\frac{f(a+h)-f(a)}{h}, \\quad f'_+(a) = \\lim_{h \\to 0^+} \\frac{f(a+h)-f(a)}{h}",
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "Applying the Definition of the Derivative to 1/x",
        props: { url: "https://www.youtube.com/embed/JgVUjIt5Fa0" }
      },
      {
        id: 'TangentLineConstructor',
        props: { showPointSlope: true, showDifferenceQuotientLabels: true },
        title: 'Secant → Tangent: Limit of Difference Quotient',
        mathBridge: 'The labels show the rise $f(a+h)-f(a)$ and run $h$ directly on the graph. Their ratio is the difference quotient $\\frac{\\Delta y}{\\Delta x}$. Watch the labeled slope value update in real time as $h \\to 0$ — that converging number is the derivative $f\'(a)$ at that point.',
        caption: 'Drag h toward 0. The secant line approaches the tangent line — and the slope approaches the derivative.',
      },
      {
        id: 'DerivativeBuilder',
        title: 'Build the Derivative Graph',
        mathBridge: 'At each point $x$, the derivative $f\'(x)$ is a number — the slope of $f$ there. Collecting those slopes across all $x$ values produces a new function $f\'(x)$. Where $f$ rises steeply, $f\'$ is large and positive. Where $f$ has a peak, $f\'$ is zero. Where $f$ falls, $f\'$ is negative. This is what it means for $f\'$ to be a function.',
        caption: 'Drag the slider across f(x). The green dots you leave behind trace out f\'(x). Toggle "Show f\'(x)" to check your work. This is what the derivative function really means.',
      },
    ],
  },

  rigor: {
    prose: [
      'There is a profound relationship between differentiability and continuity. Intuitively, if a function has a well-defined tangent slope at a point, it cannot have a jump or hole there — a broken function cannot have a smooth tangent. This is made precise by an important theorem.',
      'THEOREM (Differentiability Implies Continuity): If f is differentiable at a, then f is continuous at a.',
      'PROOF: We want to show that the limit of f(x) as x approaches a equals f(a), or equivalently that the limit of [f(x) - f(a)] as x approaches a is 0. We write f(x) - f(a) = [f(x) - f(a)] / (x - a) times (x - a). The first factor, [f(x)-f(a)]/(x-a), approaches f\'(a) as x → a (by the alternative definition of the derivative). The second factor, (x - a), approaches 0. By the product law for limits, the product approaches f\'(a) · 0 = 0. Therefore f(x) - f(a) → 0, which means f(x) → f(a). This proves continuity.',
      'The converse of this theorem is FALSE. A function can be continuous at a point without being differentiable there. The classic example is f(x) = |x| at x = 0. This function is continuous everywhere — there are no jumps or holes. But it has a "corner" at x = 0 where the graph changes direction sharply, and at that corner the derivative does not exist.',
      'PROOF that |x| is not differentiable at 0: We compute the left and right derivatives. From the right (h → 0⁺): [|0+h| - |0|] / h = |h|/h = h/h = 1, so the right-hand derivative is 1. From the left (h → 0⁻): [|0+h| - |0|] / h = |h|/h = (-h)/h = -1, so the left-hand derivative is -1. Since 1 ≠ -1, the two-sided limit does not exist, and f is not differentiable at 0.',
      'There are exactly three geometric ways a function can fail to be differentiable at a point, even while remaining continuous there. First: a corner, where the left and right derivatives both exist but are unequal (example: |x| at 0). Second: a cusp, where one or both one-sided derivatives are infinite but with opposite signs, causing the curve to come to a sharp pointed tip (example: x^(2/3) at 0 — the tangent line becomes vertical). Third: a vertical tangent, where the difference quotient grows without bound as h → 0, meaning the tangent line would be vertical (example: x^(1/3) at 0). In all three cases, the function is continuous but the limit of the difference quotient fails to be a finite real number.',
      'A function can also fail to be differentiable at a point of discontinuity, of course — but that failure is less subtle, since differentiability requires continuity.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Differentiability Implies Continuity',
        body: '\\text{If } f \\text{ is differentiable at } a, \\text{ then } f \\text{ is continuous at } a.',
      },
      {
        type: 'warning',
        title: 'The Converse is False',
        body: 'f(x) = |x| \\text{ is continuous at } 0 \\text{ but } f\'(0) \\text{ does not exist.}',
      },
      {
        type: 'insight',
        title: 'Three Ways to Fail Differentiability',
        body: '\\text{(1) Corner: } f\'_-(a) \\neq f\'_+(a) \\\\ \\text{(2) Cusp: one-sided derivatives are } \\pm\\infty \\\\ \\text{(3) Vertical tangent: } \\left|\\frac{f(a+h)-f(a)}{h}\\right| \\to \\infty',
      },
    ],
    visualizations: [
      {
        id: 'VideoEmbed',
        title: "The derivative of a constant and of x^2  from the definition",
        props: { url: "https://www.youtube.com/embed/cvP_t27nUMY" }
      },
      {
        id: 'VideoEmbed',
        title: "Definition of Derivative Example: f(x) = x + 1/(x+1)",
        props: { url: "https://www.youtube.com/embed/pi5VtjU0B3s" }
      },
      {
        id: 'AbsoluteValueDiffViz',
        title: 'The Corner: Why |x| Fails at x = 0',
        mathBridge: 'The rigor section proves this algebraically: $(|0+h| - 0)/h = |h|/h$, which equals $+1$ when $h > 0$ and $-1$ when $h < 0$. The visualization makes the algebra geometric — both secant lines are shown simultaneously. No matter how small $h$ gets, the green (right) secant locks at slope $+1$ and the red (left) at slope $-1$. That immovable mismatch is exactly what the limit calculation says. Compare this to the smooth $x^2$ example where both secants converge to the same slope as $h \\to 0$.',
        caption: 'Slide h all the way to 0 — the slopes never converge. The corner means two incompatible tangent slopes fight for the same point.',
      },
    ],
  },

  examples: [
    {
      id: 'ch2-000-ex1',
      title: 'Derivative of x\u00b2 from the Definition',
      problem: '\\text{Let } f(x) = x^2. \\text{ Use the limit definition to find } f\'(x). \\text{ Then find the slope at } x=3 \\text{ and the equation of the tangent line at } (3, 9).',
      steps: [
        {
          expression: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
          annotation: 'Write the limit definition of the derivative. We want to find the slope of the tangent to y = x\u00b2 at a general point x.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{(x+h)^2 - x^2}{h}",
          annotation: 'Substitute f(x+h) = (x+h)\u00b2 and f(x) = x\u00b2 into the definition.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{x^2 + 2xh + h^2 - x^2}{h}",
          annotation: 'Expand (x+h)\u00b2 using the binomial formula (a+b)\u00b2 = a\u00b2 + 2ab + b\u00b2. This is the key algebraic step.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{2xh + h^2}{h}",
          annotation: 'The x\u00b2 terms cancel: x\u00b2 - x\u00b2 = 0. We now have a polynomial in h in the numerator, which allows us to factor.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{h(2x + h)}{h}",
          annotation: 'Factor h out of the numerator. This is the crucial factoring step that cancels the problematic h in the denominator.',
        },
        {
          expression: "= \\lim_{h \\to 0} (2x + h)",
          annotation: 'Cancel the common factor of h. This is valid because in a limit as h \u2192 0, we require h \u2260 0, so division by h is legal.',
        },
        {
          expression: "= 2x + 0 = 2x",
          annotation: 'Now we can safely substitute h = 0, since the indeterminate form 0/0 has been resolved by the algebraic simplification. The derivative is 2x.',
        },
        {
          expression: "f'(3) = 2(3) = 6",
          annotation: 'To find the slope at x = 3, substitute x = 3 into the derivative function f\'(x) = 2x.',
        },
        {
          expression: "y - 9 = 6(x - 3)",
          annotation: 'Use point-slope form of a line: y - y\u2080 = m(x - x\u2080), with the point (3, 9) and slope m = 6.',
        },
        {
          expression: "y = 6x - 18 + 9 = 6x - 9",
          annotation: 'Distribute the 6 and simplify to get the slope-intercept form of the tangent line.',
        },
      ],
      conclusion: 'The derivative of x\u00b2 is 2x. At x = 3, the curve has slope 6, and the tangent line is y = 6x - 9. Notice the pattern: the exponent 2 came down as a coefficient, and the new exponent is 2 - 1 = 1. This is a preview of the power rule.',
    },
    {
      id: 'ch2-000-ex2',
      title: 'Derivative of x\u00b3 from the Definition',
      problem: '\\text{Let } f(x) = x^3. \\text{ Use the limit definition to find } f\'(x).',
      steps: [
        {
          expression: "f'(x) = \\lim_{h \\to 0} \\frac{(x+h)^3 - x^3}{h}",
          annotation: 'Write the difference quotient. We need to expand (x+h)\u00b3, which requires the full binomial expansion.',
        },
        {
          expression: "(x+h)^3 = x^3 + 3x^2h + 3xh^2 + h^3",
          annotation: 'Expand (x+h)\u00b3 using the binomial theorem or repeated multiplication: (x+h)\u00b3 = (x+h)(x+h)(x+h). Each term is identified: the leading x\u00b3, three terms with one factor of h (giving 3x\u00b2h), three terms with two factors of h (giving 3xh\u00b2), and one term with three factors of h (giving h\u00b3).',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{x^3 + 3x^2 h + 3xh^2 + h^3 - x^3}{h}",
          annotation: 'Substitute the expanded form of (x+h)\u00b3 into the difference quotient.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{3x^2 h + 3xh^2 + h^3}{h}",
          annotation: 'Cancel x\u00b3 - x\u00b3 = 0 in the numerator. We are left with only terms containing h.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{h(3x^2 + 3xh + h^2)}{h}",
          annotation: 'Factor out h from every term in the numerator. This is possible because every remaining term has at least one factor of h.',
        },
        {
          expression: "= \\lim_{h \\to 0} (3x^2 + 3xh + h^2)",
          annotation: 'Cancel the common h. Now the expression is a polynomial in h with no division, so we can directly substitute h = 0.',
        },
        {
          expression: "= 3x^2 + 3x(0) + (0)^2 = 3x^2",
          annotation: 'Substitute h = 0. The terms containing h vanish, leaving only 3x\u00b2.',
        },
      ],
      conclusion: 'The derivative of x\u00b3 is 3x\u00b2. The exponent 3 dropped down as a coefficient, and the new exponent is 3 - 1 = 2. The pattern x\u00b2 \u2192 2x and x\u00b3 \u2192 3x\u00b2 strongly suggests the general power rule: d/dx[x\u207f] = nx\u207f\u207b\u00b9.',
    },
    {
      id: 'ch2-000-ex3',
      title: 'Derivative of \u221ax from the Definition',
      problem: 'f(x) = \\sqrt{x}. \\text{ Use the limit definition to find } f\'(x) \\text{ for } x > 0.',
      steps: [
        {
          expression: "f'(x) = \\lim_{h \\to 0} \\frac{\\sqrt{x+h} - \\sqrt{x}}{h}",
          annotation: 'Set up the difference quotient. The numerator is the difference of two square roots, which creates an indeterminate form 0/0 as h \u2192 0.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{\\sqrt{x+h} - \\sqrt{x}}{h} \\cdot \\frac{\\sqrt{x+h} + \\sqrt{x}}{\\sqrt{x+h} + \\sqrt{x}}",
          annotation: 'Multiply the numerator and denominator by the conjugate of the numerator: \u221a(x+h) + \u221ax. This is the key technique for dealing with square root differences. Multiplying by the conjugate uses the identity (a - b)(a + b) = a\u00b2 - b\u00b2.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{(\\sqrt{x+h})^2 - (\\sqrt{x})^2}{h(\\sqrt{x+h} + \\sqrt{x})}",
          annotation: 'Apply the difference of squares identity to the numerator. The conjugate multiplication eliminates the square roots in the numerator.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{(x + h) - x}{h(\\sqrt{x+h} + \\sqrt{x})}",
          annotation: 'Simplify the numerator: (\u221a(x+h))\u00b2 = x+h and (\u221ax)\u00b2 = x.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{h}{h(\\sqrt{x+h} + \\sqrt{x})}",
          annotation: 'Simplify (x + h) - x = h in the numerator. We now have h in both numerator and denominator.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{1}{\\sqrt{x+h} + \\sqrt{x}}",
          annotation: 'Cancel the common factor of h (valid since h \u2260 0 in the limit). The indeterminate form has been resolved.',
        },
        {
          expression: "= \\frac{1}{\\sqrt{x + 0} + \\sqrt{x}} = \\frac{1}{\\sqrt{x} + \\sqrt{x}} = \\frac{1}{2\\sqrt{x}}",
          annotation: 'Now we can substitute h = 0 safely, since there is no longer any division by h. The result is 1/(2\u221ax).',
        },
      ],
      conclusion: 'The derivative of \u221ax = x^(1/2) is 1/(2\u221ax) = (1/2)x^(-1/2). This again follows the power rule pattern: the exponent 1/2 came down as a coefficient, and the new exponent is 1/2 - 1 = -1/2.',
    },
    {
      id: 'ch2-000-ex4',
      title: 'Derivative of 1/x from the Definition',
      problem: 'f(x) = \\dfrac{1}{x}. \\text{ Use the limit definition to find } f\'(x) \\text{ for } x \\neq 0.',
      steps: [
        {
          expression: "f'(x) = \\lim_{h \\to 0} \\frac{\\dfrac{1}{x+h} - \\dfrac{1}{x}}{h}",
          annotation: 'Write the difference quotient. We have a compound fraction (a fraction within a fraction), which we need to simplify.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{1}{h} \\left( \\frac{1}{x+h} - \\frac{1}{x} \\right)",
          annotation: 'Rewrite the compound fraction by pulling 1/h out front. Now we need to combine the two fractions in the parentheses.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{1}{h} \\cdot \\frac{x - (x+h)}{x(x+h)}",
          annotation: 'Combine the fractions with a common denominator of x(x+h): the first fraction becomes x/[x(x+h)] and the second becomes (x+h)/[x(x+h)]. Subtract numerators.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{1}{h} \\cdot \\frac{x - x - h}{x(x+h)}",
          annotation: 'Distribute the negative sign in the numerator: x - (x + h) = x - x - h = -h.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{1}{h} \\cdot \\frac{-h}{x(x+h)}",
          annotation: 'Simplify: x - x - h = -h.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{-h}{h \\cdot x(x+h)}",
          annotation: 'Combine into a single fraction.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{-1}{x(x+h)}",
          annotation: 'Cancel the common factor of h (valid since h \u2260 0 in the limit). The -h/h cancels to give -1.',
        },
        {
          expression: "= \\frac{-1}{x(x + 0)} = \\frac{-1}{x^2}",
          annotation: 'Substitute h = 0. The denominator becomes x\u00b7x = x\u00b2.',
        },
      ],
      conclusion: 'The derivative of 1/x = x^(-1) is -1/x\u00b2 = -x^(-2). Once again, the power rule pattern: exponent -1 comes down as coefficient, new exponent is -1 - 1 = -2.',
    },
    {
      id: 'ch2-000-ex5',
      title: 'Derivative of a Linear Function',
      problem: 'f(x) = 3x + 5. \\text{ Use the limit definition to find } f\'(x) \\text{ and verify it equals the slope.}',
      steps: [
        {
          expression: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
          annotation: 'Write the limit definition.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{[3(x+h)+5] - [3x+5]}{h}",
          annotation: 'Substitute f(x+h) = 3(x+h) + 5 and f(x) = 3x + 5.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{3x + 3h + 5 - 3x - 5}{h}",
          annotation: 'Distribute the 3 and expand the brackets.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{3h}{h}",
          annotation: 'Simplify: 3x - 3x = 0 and 5 - 5 = 0, leaving only 3h in the numerator.',
        },
        {
          expression: "= \\lim_{h \\to 0} 3 = 3",
          annotation: 'Cancel h/h = 1. The resulting expression is the constant 3, which equals 3 regardless of how h approaches 0.',
        },
      ],
      conclusion: 'The derivative of 3x + 5 is 3, which is exactly the slope of the line. This makes perfect sense: a straight line has a constant slope at every point, so its derivative (the instantaneous slope) is that same constant everywhere. The +5 intercept term disappeared because it shifts the line up and down but does not affect its steepness.',
    },
    {
      id: 'ch2-000-ex6',
      title: 'Is |x| Differentiable at x = 0?',
      problem: '\\text{Determine whether } f(x) = |x| \\text{ is differentiable at } x = 0 \\text{ by computing the left and right derivatives.}',
      steps: [
        {
          expression: "f'_+(0) = \\lim_{h \\to 0^+} \\frac{|0 + h| - |0|}{h} = \\lim_{h \\to 0^+} \\frac{|h|}{h}",
          annotation: 'Set up the right-hand derivative: h approaches 0 from the positive side, meaning h > 0 throughout.',
        },
        {
          expression: "= \\lim_{h \\to 0^+} \\frac{h}{h} = \\lim_{h \\to 0^+} 1 = 1",
          annotation: 'When h > 0, |h| = h, so |h|/h = h/h = 1. The right-hand derivative is 1.',
        },
        {
          expression: "f'_-(0) = \\lim_{h \\to 0^-} \\frac{|0 + h| - |0|}{h} = \\lim_{h \\to 0^-} \\frac{|h|}{h}",
          annotation: 'Set up the left-hand derivative: h approaches 0 from the negative side, meaning h < 0 throughout.',
        },
        {
          expression: "= \\lim_{h \\to 0^-} \\frac{-h}{h} = \\lim_{h \\to 0^-} (-1) = -1",
          annotation: 'When h < 0, |h| = -h (the negative of h, which is positive), so |h|/h = -h/h = -1. The left-hand derivative is -1.',
        },
        {
          expression: "f'_+(0) = 1 \\neq -1 = f'_-(0)",
          annotation: 'The right-hand derivative (1) and left-hand derivative (-1) are not equal.',
        },
        {
          expression: "\\therefore \\lim_{h \\to 0} \\frac{|h|}{h} \\text{ does not exist}",
          annotation: 'Since the one-sided limits are different, the two-sided limit does not exist. Therefore f\'(0) does not exist.',
        },
      ],
      conclusion: 'f(x) = |x| is NOT differentiable at x = 0. The graph has a sharp corner there — the slope jumps from -1 (for x < 0) to +1 (for x > 0) with no smooth transition. There is no single well-defined tangent line at the origin. This is the canonical example of a function that is continuous but not differentiable.',
      visualizations: [
        {
          id: 'AbsoluteValueDiffViz',
          title: 'See the Calculation on the Graph',
          mathBridge: 'Each step in the worked example corresponds to something visible here. Step 1–2: the green secant from $(0,0)$ to $(+h, h)$ — its slope $h/h = 1$ is the right-hand derivative. Step 3–4: the red secant to $(-h, h)$ — its slope $-h/(-h)$ ... wait, we divide by $h$ (not $-h$): $|-h|/(-h) = h/(-h) = -1$. That is the left-hand difference quotient with $h < 0$. Slide $h$ all the way down to confirm both secants are frozen at their respective slopes regardless of how close $h$ gets to 0.',
          caption: 'The two secants never converge — they are locked at +1 and −1 forever. That is why the limit does not exist and f is not differentiable at 0.',
        },
      ],
    },
    {
      id: 'ch2-000-ex7',
      title: 'Instantaneous Velocity from the Definition',
      problem: '\\text{A particle\'s position is given by } s(t) = 4t^2 + 3t \\text{ (in meters, t in seconds). Find its instantaneous velocity at } t = 2.',
      steps: [
        {
          expression: "v(t) = s'(t) = \\lim_{h \\to 0} \\frac{s(t+h) - s(t)}{h}",
          annotation: 'Instantaneous velocity is the derivative of position with respect to time. Set up the difference quotient.',
        },
        {
          expression: "s(t+h) = 4(t+h)^2 + 3(t+h)",
          annotation: 'Compute s(t+h) by replacing t with t+h in the position formula.',
        },
        {
          expression: "= 4(t^2 + 2th + h^2) + 3t + 3h",
          annotation: 'Expand (t+h)\u00b2 = t\u00b2 + 2th + h\u00b2 and distribute the 4 and 3.',
        },
        {
          expression: "= 4t^2 + 8th + 4h^2 + 3t + 3h",
          annotation: 'Distribute to get the fully expanded form of s(t+h).',
        },
        {
          expression: "s(t+h) - s(t) = (4t^2 + 8th + 4h^2 + 3t + 3h) - (4t^2 + 3t)",
          annotation: 'Form the difference s(t+h) - s(t) by subtracting the original position.',
        },
        {
          expression: "= 8th + 4h^2 + 3h",
          annotation: 'Simplify: 4t\u00b2 - 4t\u00b2 = 0 and 3t - 3t = 0. Only the h-containing terms remain.',
        },
        {
          expression: "\\frac{s(t+h)-s(t)}{h} = \\frac{8th + 4h^2 + 3h}{h}",
          annotation: 'Divide by h to form the difference quotient.',
        },
        {
          expression: "= \\frac{h(8t + 4h + 3)}{h} = 8t + 4h + 3",
          annotation: 'Factor h from the numerator and cancel with the denominator h.',
        },
        {
          expression: "v(t) = \\lim_{h \\to 0} (8t + 4h + 3) = 8t + 3",
          annotation: 'Take the limit as h \u2192 0. The term 4h vanishes, leaving the instantaneous velocity function v(t) = 8t + 3.',
        },
        {
          expression: "v(2) = 8(2) + 3 = 16 + 3 = 19 \\text{ m/s}",
          annotation: 'Substitute t = 2 to find the instantaneous velocity at t = 2 seconds. The particle is moving at exactly 19 meters per second at that moment.',
        },
      ],
      conclusion: 'The instantaneous velocity at t = 2 is 19 m/s. The general velocity function v(t) = 8t + 3 shows that the particle is accelerating — its speed increases linearly with time. For comparison, the average velocity over [1, 3] would be [s(3)-s(1)]/(3-1) = [45 - 7]/2 = 19 m/s. This agreement is not a coincidence — the midpoint of [1, 3] is t = 2, and for a quadratic position function (uniform acceleration), the average velocity over any interval equals the instantaneous velocity at the midpoint.',
    },
    {
      id: 'ch2-000-ex8',
      title: 'Galileo\'s Falling Ball: Derivative from First Principles (Physics)',
      problem: 'Galileo showed that objects fall with position $y(t) = \\frac{1}{2}g t^2$ (measured downward from rest), where $g \\approx 9.8$ m/s². Use the limit definition to find the velocity $v(t) = y\'(t)$, then evaluate at $t = 3$ s. Interpret the result.',
      visualizationId: 'ProjectileMotion',
      steps: [
        { expression: "v(t) = \\lim_{h \\to 0} \\frac{y(t+h) - y(t)}{h}", annotation: 'The velocity at time t is the derivative of position — defined as the limit of average velocities.' },
        { expression: "y(t+h) = \\frac{1}{2}g(t+h)^2 = \\frac{g}{2}(t^2 + 2th + h^2)", annotation: 'Expand (t+h)².' },
        { expression: "y(t+h) - y(t) = \\frac{g}{2}(t^2 + 2th + h^2) - \\frac{g}{2}t^2 = \\frac{g}{2}(2th + h^2)", annotation: 'Subtract y(t). The t² terms cancel.' },
        { expression: "\\frac{y(t+h)-y(t)}{h} = \\frac{\\frac{g}{2}h(2t+h)}{h} = \\frac{g}{2}(2t+h)", annotation: 'Divide by h (cancel for h ≠ 0).' },
        { expression: "v(t) = \\lim_{h \\to 0} \\frac{g}{2}(2t + h) = \\frac{g}{2}(2t) = gt", annotation: 'Take the limit: h → 0 eliminates the h term.' },
        { expression: "v(t) = gt", annotation: 'The velocity increases linearly with time — uniform acceleration.' },
        { expression: "v(3) = 9.8 \\times 3 = 29.4 \\text{ m/s}", annotation: 'At t=3 s, the ball is falling at 29.4 m/s ≈ 106 km/h.' },
      ],
      conclusion: 'The velocity v(t) = gt says: velocity grows linearly with time, at rate g = 9.8 m/s per second. This is uniform (constant) acceleration. In the limit definition, the key step is canceling h to remove the 0/0 indeterminate form — identical algebra to the tangent line problem. Galileo discovered this law experimentally in 1604; Newton\'s calculus gave it a mathematical foundation 60 years later.',
    },
  ],

  challenges: [
    {
      id: 'ch2-000-ch1',
      difficulty: 'easy',
      problem: 'Use the limit definition of the derivative to find the equation of the tangent line to f(x) = 2x^2 - 3x at x = 1.',
      hint: 'First find f\'(x) using the definition, then evaluate at x = 1 to get the slope. Use f(1) for the y-coordinate of the point.',
      walkthrough: [
        {
          expression: "f'(x) = \\lim_{h \\to 0} \\frac{[2(x+h)^2 - 3(x+h)] - [2x^2 - 3x]}{h}",
          annotation: 'Set up the difference quotient for f(x) = 2x\u00b2 - 3x.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{2(x^2+2xh+h^2) - 3x - 3h - 2x^2 + 3x}{h}",
          annotation: 'Expand (x+h)\u00b2 = x\u00b2+2xh+h\u00b2 and distribute the 2 and -3.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{2x^2 + 4xh + 2h^2 - 3x - 3h - 2x^2 + 3x}{h}",
          annotation: 'Distribute fully.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{4xh + 2h^2 - 3h}{h}",
          annotation: 'Cancel: 2x\u00b2 - 2x\u00b2 = 0 and -3x + 3x = 0.',
        },
        {
          expression: "= \\lim_{h \\to 0} (4x + 2h - 3) = 4x - 3",
          annotation: 'Factor h and cancel, then let h \u2192 0.',
        },
        {
          expression: "f'(1) = 4(1) - 3 = 1, \\quad f(1) = 2(1)^2 - 3(1) = -1",
          annotation: 'Evaluate slope f\'(1) = 1 and y-coordinate f(1) = -1.',
        },
        {
          expression: "y - (-1) = 1 \\cdot (x - 1) \\implies y = x - 2",
          annotation: 'Use point-slope form with point (1, -1) and slope 1.',
        },
      ],
      answer: 'y = x - 2',
    },
    {
      id: 'ch2-000-ch2',
      difficulty: 'medium',
      problem: 'Prove from the limit definition that \\dfrac{d}{dx}[x^4] = 4x^3. You will need the expansion (x+h)^4 = x^4 + 4x^3h + 6x^2h^2 + 4xh^3 + h^4.',
      hint: 'Expand (x+h)^4 using the given binomial expansion, subtract x^4, divide by h, then let h\u21920. Identify which terms survive after h\u21920.',
      walkthrough: [
        {
          expression: "\\frac{d}{dx}[x^4] = \\lim_{h \\to 0} \\frac{(x+h)^4 - x^4}{h}",
          annotation: 'Apply the limit definition.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{(x^4 + 4x^3 h + 6x^2 h^2 + 4xh^3 + h^4) - x^4}{h}",
          annotation: 'Substitute the binomial expansion of (x+h)^4.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{4x^3 h + 6x^2 h^2 + 4xh^3 + h^4}{h}",
          annotation: 'Cancel x^4 - x^4 = 0.',
        },
        {
          expression: "= \\lim_{h \\to 0} (4x^3 + 6x^2 h + 4xh^2 + h^3)",
          annotation: 'Divide every term in the numerator by h. Every term had at least one factor of h.',
        },
        {
          expression: "= 4x^3 + 0 + 0 + 0 = 4x^3",
          annotation: 'Let h \u2192 0. Every term containing h vanishes. Only 4x\u00b3 survives.',
        },
      ],
      answer: '\\dfrac{d}{dx}[x^4] = 4x^3',
    },
    {
      id: 'ch2-000-ch3',
      difficulty: 'hard',
      problem: 'Let f(x) = x\\sin(1/x) for x \\neq 0 and f(0) = 0. Prove that f is differentiable at x = 0 by evaluating the limit definition directly. Use the Squeeze Theorem.',
      hint: 'Set up the difference quotient at a = 0. You will have [f(h) - f(0)] / h = h\u00b7sin(1/h) / h = sin(1/h). But sin(1/h) oscillates wildly — think about what bounds sin always satisfies, then squeeze.',
      walkthrough: [
        {
          expression: "f'(0) = \\lim_{h \\to 0} \\frac{f(0+h) - f(0)}{h} = \\lim_{h \\to 0} \\frac{f(h) - 0}{h}",
          annotation: 'Write the derivative at x = 0 using f(0) = 0.',
        },
        {
          expression: "= \\lim_{h \\to 0} \\frac{h \\sin(1/h)}{h}",
          annotation: 'Substitute f(h) = h\u00b7sin(1/h) (valid for h \u2260 0, which is exactly what the limit requires).',
        },
        {
          expression: "= \\lim_{h \\to 0} \\sin\\left(\\frac{1}{h}\\right)",
          annotation: 'Cancel h/h. Now we have the limit of sin(1/h) as h \u2192 0. This limit does NOT exist in the ordinary sense — sin(1/h) oscillates infinitely often near h = 0.',
        },
        {
          expression: "-1 \\leq \\sin\\left(\\frac{1}{h}\\right) \\leq 1 \\quad \\text{for all } h \\neq 0",
          annotation: 'Wait — we made an error above. We should NOT have canceled so quickly. Let us restart from the difference quotient before canceling.',
        },
        {
          expression: "\\frac{f(h) - f(0)}{h} = \\frac{h \\sin(1/h)}{h} = \\sin(1/h)? \\quad \\text{Hmm — but this limit does not exist!}",
          annotation: 'This seems to show f is NOT differentiable at 0. But wait — go back to the un-canceled form: f(h)/h = sin(1/h). Indeed this has no limit. So... is f differentiable?',
        },
        {
          expression: "\\text{Reconsider: } \\frac{f(h)}{h} = \\frac{h\\sin(1/h)}{h} = \\sin(1/h)",
          annotation: 'The cancellation is correct. The issue is that sin(1/h) does NOT have a limit as h\u21920. Therefore f\'(0) does not exist for f(x) = x\u00b7sin(1/x). This function is actually NOT differentiable at 0.',
        },
        {
          expression: "\\text{Compare with } g(x) = x^2 \\sin(1/x),\\; g(0)=0",
          annotation: 'The function x\u00b7sin(1/x) is NOT differentiable at 0. The differentiable version requires the extra factor of x. With g(x) = x\u00b2\u00b7sin(1/x), the difference quotient becomes h\u00b7sin(1/h), which DOES go to 0 by the Squeeze Theorem.',
        },
        {
          expression: "g'(0) = \\lim_{h\\to 0} \\frac{h^2 \\sin(1/h)}{h} = \\lim_{h\\to 0} h\\sin(1/h)",
          annotation: 'For g(x) = x\u00b2 sin(1/x), the difference quotient reduces to h\u00b7sin(1/h).',
        },
        {
          expression: "-|h| \\leq h\\sin(1/h) \\leq |h|",
          annotation: 'Since |sin(1/h)| \u2264 1 for all h \u2260 0, we have |h\u00b7sin(1/h)| \u2264 |h|, giving the squeeze inequality.',
        },
        {
          expression: "\\lim_{h\\to 0}(-|h|) = 0 \\leq \\lim_{h\\to 0} h\\sin(1/h) \\leq \\lim_{h\\to 0}|h| = 0",
          annotation: 'Both bounding functions approach 0 as h \u2192 0. By the Squeeze Theorem, the middle term also approaches 0.',
        },
        {
          expression: "\\therefore g'(0) = 0",
          annotation: 'The Squeeze Theorem gives g\'(0) = 0. So g(x) = x\u00b2\u00b7sin(1/x) IS differentiable at 0, with derivative 0.',
        },
      ],
      answer: "f(x) = x\\sin(1/x) \\text{ is NOT differentiable at } 0. \\text{ The correct differentiable version is } g(x) = x^2\\sin(1/x),\\text{ for which } g'(0) = 0 \\text{ by the Squeeze Theorem.}",
    },
    {
      id: 'ch2-000-ch4',
      difficulty: 'hard',
      problem: 'Let $f(x) = \\begin{cases} x^2 & x \\leq 1 \\\\ 2x - 1 & x > 1 \\end{cases}$. Is $f$ differentiable at $x = 1$? Compute both one-sided difference quotients.',
      hint: 'Compute the left-hand and right-hand limits of [f(1+h)−f(1)]/h separately. For h<0, use the x² branch; for h>0, use the 2x−1 branch. Check if they agree.',
      walkthrough: [
        { expression: 'f(1) = 1^2 = 1', annotation: 'At x=1 we use the left branch: f(1)=1.' },
        { expression: 'f\'_-(1) = \\lim_{h \\to 0^-}\\frac{(1+h)^2 - 1}{h} = \\lim_{h \\to 0^-}\\frac{1+2h+h^2-1}{h} = \\lim_{h \\to 0^-}(2+h) = 2', annotation: 'For h<0, 1+h<1 so use the x² branch. Factor and cancel h.' },
        { expression: 'f\'_+(1) = \\lim_{h \\to 0^+}\\frac{[2(1+h)-1] - 1}{h} = \\lim_{h \\to 0^+}\\frac{2h}{h} = 2', annotation: 'For h>0, 1+h>1 so use the 2x−1 branch. f(1+h)=2(1+h)−1=1+2h.' },
        { expression: 'f\'_-(1) = 2 = f\'_+(1)', annotation: 'Both one-sided derivatives agree.' },
        { expression: 'f\'(1) = 2', annotation: 'Since the one-sided limits match, f is differentiable at x=1 with derivative 2.' },
      ],
      answer: "f is differentiable at x=1 with f'(1)=2. Both pieces meet smoothly: the parabola's slope at x=1 is 2x|_{x=1}=2, which matches the linear piece's slope of 2.",
    },
  ],

  crossRefs: [
    { lessonSlug: 'continuity', label: 'Limits and Continuity', context: 'The derivative is defined as a limit; the limit laws and squeeze theorem are essential tools.' },
    { lessonSlug: 'differentiation-rules', label: 'Differentiation Rules', context: 'The limit definition motivates and proves the power rule and other shortcuts.' },
    { lessonSlug: 'linear-approximation', label: 'Linear Approximation', context: 'The tangent line at a point is the best linear approximation to the function near that point.' },
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'completed-example-5',
    'completed-example-6',
    'completed-example-7',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],
};
