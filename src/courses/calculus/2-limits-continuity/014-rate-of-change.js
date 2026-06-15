export default {
  id: 'ch1-006',
  slug: 'rate-of-change',
  chapter: 1,
  order: 6,
  title: 'Rate of Change: From Slope to the Difference Quotient',
  subtitle: 'Average rate of change is slope in disguise — and the difference quotient is the first step into calculus',
  tags: ['rate of change', 'average rate of change', 'difference quotient', 'secant line', 'slope', 'interval', 'calculus preview'],
  aliases: 'rate of change average rate difference quotient secant line slope interval AROC calculus preview derivative',

  hook: {
    question: 'The speedometer in a car shows instantaneous speed. But if you drive 120 miles in 2 hours, your average speed was 60 mph — even if you were stopped at a light for 10 minutes. What is the mathematical object that captures "average change," and what happens when the interval shrinks to zero?',
    realWorldContext: 'In manufacturing, the rate of change of a production metric over a shift tells you how fast output is changing — not just what it is. A CNC machine running slower at the end of a shift than the beginning has a negative rate of change in parts per hour. The difference quotient $\\frac{f(x+h)-f(x)}{h}$ is the precise algebraic formula for this — and it becomes the derivative when $h \\to 0$.',
    previewVisualizationId: 'RateOfChangeViz',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** Chapter 1 has been entirely about limits — what functions approach near a point, how to prove those claims rigorously, how to handle trig and infinity. This lesson is the chapter\'s pivot. It takes everything you know about limits and aims it at a specific, concrete question: how fast is a function changing at a single instant? The answer to that question is the derivative — and this lesson builds exactly the machinery to define it.',

      'Start with something familiar: slope. The slope of a straight line is the same everywhere — rise over run, $\\Delta y / \\Delta x$. For a curve, slope changes at every point, so "the slope of the curve" only makes sense at a specific point. The first step toward that idea is the simpler question: what is the average rate of change over an interval?',

      'The average rate of change of $f$ over $[a, b]$ is the slope of the secant line — the straight line connecting the two points $(a, f(a))$ and $(b, f(b))$ on the curve. The formula is just the slope formula: $\\frac{f(b)-f(a)}{b-a}$. It answers: how much did $f$ change, per unit of $x$, between $a$ and $b$? Notice this is a global measurement — it says nothing about what happened in the middle of the interval.',

      'The difference quotient rewrites average rate of change with notation built for taking a limit. Instead of two endpoints $a$ and $b$, use $x$ and $x+h$, where $h$ is the gap between them. The average rate of change becomes $\\frac{f(x+h)-f(x)}{h}$. This is the same formula — just written to make $h \\to 0$ natural.',

      'Visually, here is what happens as $h$ shrinks. The secant line connects two points on the curve. As you slide the second point toward the first (letting $h \\to 0$), the secant line rotates. In the limit, it settles into a unique position: the tangent line at that point. The slope of that tangent line is the derivative — the instantaneous rate of change. The derivative IS the difference quotient when $h$ reaches zero.',

      '**Where this is heading:** The next lesson is function modeling — applying these ideas to build equations from real situations. Then Chapter 2 takes the limit definition of the derivative and derives every differentiation rule from it. The difference quotient you work with in this lesson is the formula Chapter 2 starts from. Every power rule, product rule, and chain rule derivation is a limit of this formula applied to a specific type of function.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 12 of 13 — Chapter 1: Limits & Continuity',
        body: '**Previous:** Limits & Continuity Review — all Chapter 1 tools synthesized.\n**This lesson:** Rate of change and the difference quotient — the algebraic bridge from limits to derivatives.\n**Next:** Modeling with Functions — building equations from real-world situations before Chapter 2 begins.',
      },
      {
        type: 'definition',
        title: 'Average Rate of Change (AROC)',
        body: 'AROC = \\frac{f(b) - f(a)}{b - a} = \\frac{\\Delta y}{\\Delta x} \\\\ \\text{This is the slope of the secant line through } (a, f(a)) \\text{ and } (b, f(b)).',
      },
      {
        type: 'definition',
        title: 'The Difference Quotient',
        body: '\\frac{f(x+h) - f(x)}{h} \\qquad h \\neq 0 \\\\ \\text{Same as AROC but written to make the limit } h \\to 0 \\text{ natural.}',
      },
      {
        type: 'insight',
        title: 'The Derivative Is the Difference Quotient in the Limit',
        body: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h} \\\\ \\text{Every derivative rule in Chapter 2 is a shortcut derived from this single formula.}",
      },
      {
        type: 'warning',
        title: 'Average ≠ Instantaneous',
        body: '\\text{AROC over } [1, 3] \\text{ for } f(x)=x^2: \\frac{9-1}{3-1} = 4 \\\\ \\text{Instantaneous at } x=2: f\'(2) = 4 \\quad (\\text{coincidence here!}) \\\\ \\text{AROC over } [1,4]: \\frac{16-1}{4-1} = 5 \\neq f\'(2) = 4',
      },
    ],
    visualizations: [
      {
        id: 'RateOfChangeViz',
        title: 'Secant Line → Tangent Line',
        mathBridge: 'Step 1: Set $f(x) = x^2$ and observe the secant line through two points with $h = 2$. Read the slope — that is the AROC over the interval. Step 2: Shrink $h$ to 1, then 0.5, then 0.1. Watch the secant line rotate toward the tangent. The slope readout is the difference quotient converging to $f\'(x)$. Step 3: Now set $h = 0.001$. The secant and tangent are visually identical, and the slope matches the derivative closely. The key lesson: the derivative is the number the difference quotient approaches — not the difference quotient itself (which requires $h \\neq 0$), but its limit as $h \\to 0$.',
        caption: 'Shrink h. The secant slope converges to the derivative — the instantaneous rate of change.',
      },
      {
        id: 'Ch3_1_HowFastWasIt',
        title: 'Story Viz — How Fast Was It?',
        mathBridge: 'This narrative bridge shows how average speed over progressively shorter time intervals converges to instantaneous speed. Use it to reinforce the geometric picture: AROC is the slope of a chord, and instantaneous rate is the slope of the curve at a point.',
        caption: 'Average speed over shrinking intervals — the story behind the difference quotient.',
      },
      {
        id: 'Ch3_6_BridgeToCalculus',
        title: 'Story Viz — Bridge to Calculus',
        mathBridge: 'This capstone visualization connects the three ideas of this lesson: (1) slope of a secant = AROC = difference quotient, (2) the limit as $h \\to 0$ is the tangent slope = instantaneous rate = derivative, (3) the derivative is a function that gives the slope of $f$ at every point. Step through the animation — each frame is one conceptual transition.',
        caption: 'Three ideas connected: secant → tangent → derivative as a function.',
      },
      {
        id: 'Ch4_RampSlope',
        title: 'Story Mode: The Ramp That Fought Back',
        mathBridge: 'Slope as rise/run is developed here from a physical ramp design problem. Use this as a warm-up if slope-as-rate-of-change feels abstract — the ramp makes it concrete before we generalize to curves.',
        caption: 'Slope as a physical design constraint — why rise/run is the natural rate language.',
      },
    ],
  },

  math: {
    prose: [
      '**Computing the difference quotient.** The mechanical process has four steps: (1) write $f(x+h)$ by replacing every $x$ in the formula with $(x+h)$, (2) expand fully, (3) subtract $f(x)$ — every term without an $h$ must cancel, leaving only terms that contain $h$, (4) factor out $h$ from the numerator and cancel with the denominator. If you cannot cancel, you have an algebra error.',

      '**Units.** If $f(t)$ is position in metres and $t$ is in seconds, then $\\frac{f(b)-f(a)}{b-a}$ is in metres per second. The difference quotient preserves units: numerator is in $f$-units, denominator is in $x$-units, result is $f$-units per $x$-unit. This unit consistency is a built-in check — if your units are wrong, your setup is wrong.',

      '**Vertical distance between curves.** The vertical distance between $f$ and $g$ (when $f \\geq g$) is the function $d(x) = f(x) - g(x)$. This distance function has its own rate of change: $d\'(x) = f\'(x) - g\'(x)$. Finding where $d$ is maximized or minimized is a standard optimization problem that appears in area-between-curves problems in Chapter 4.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Difference Quotient — Four-Step Process',
        body: '1.\\; \\text{Write } f(x+h) \\text{ — replace every } x \\text{ with } (x+h) \\\\ 2.\\; \\text{Expand fully (distribute everything)} \\\\ 3.\\; \\text{Subtract } f(x) \\text{ — constant terms must cancel} \\\\ 4.\\; \\text{Factor } h \\text{ from numerator and cancel with denominator}',
      },
      {
        type: 'definition',
        title: 'Vertical Distance Between Two Curves',
        body: 'd(x) = f(x) - g(x) \\quad \\text{when } f(x) \\geq g(x) \\\\ \\text{Subtract lower from upper. Check which is on top — it can switch across an interval.}',
      },
      {
        type: 'warning',
        title: 'The h in the Denominator Must Cancel',
        body: '\\text{After subtracting } f(x)\\text{, every remaining term has a factor of } h. \\\\ \\text{Factor out } h \\text{ and cancel. If you cannot cancel } h\\text{, there is an algebra error — find it.}',
      },
    ],
    visualizations: [
      {
        id: 'RateOfChangeViz',
        props: { showDifferenceQuotient: true },
        title: 'Difference Quotient Algebra Walkthrough',
        mathBridge: 'Use this for a side-by-side view: the geometric picture (secant line) on the left, the algebraic computation (difference quotient steps) on the right. For each step in the algebra, the visualization highlights the corresponding geometric change. Step 1: $f(x+h)$ is the $y$-coordinate of the second point. Step 2: $f(x+h)-f(x)$ is the rise. Step 3: dividing by $h$ gives the slope of the secant. Step 4: as $h \\to 0$, the slope converges.',
        caption: 'Geometry and algebra in sync — each algebraic step has a geometric meaning.',
      },
    ],
  },

  rigor: {
    title: 'Full Difference Quotient: $f(x) = x^2 + 3x$',
    visualizationId: 'RateOfChangeViz',
    prose: [
      'This proof demonstrates the complete difference quotient process for a quadratic. Every step is shown explicitly — this is the template for any polynomial or rational function.',
      'Notice the critical structure: after subtracting $f(x)$, every surviving term contains $h$. Factoring out $h$ and cancelling with the denominator is always the path to the simplified form. Taking $h \\to 0$ then gives the derivative — a result you can verify with the power rule.',
    ],
    proofSteps: [
      {
        expression: 'f(x+h) = (x+h)^2 + 3(x+h)',
        annotation: 'Step 1: Replace every $x$ with $(x+h)$. Write it out before expanding — this prevents sign errors.',
      },
      {
        expression: '= x^2 + 2xh + h^2 + 3x + 3h',
        annotation: 'Step 2: Expand $(x+h)^2 = x^2 + 2xh + h^2$ and distribute the 3. No collecting yet.',
      },
      {
        expression: 'f(x+h) - f(x) = (x^2 + 2xh + h^2 + 3x + 3h) - (x^2 + 3x)',
        annotation: 'Step 3: Subtract $f(x) = x^2 + 3x$. Write the subtraction explicitly before simplifying.',
      },
      {
        expression: '= 2xh + h^2 + 3h = h(2x + h + 3)',
        annotation: 'The $x^2$ and $3x$ cancel — they must. Every remaining term has $h$. Factor it out.',
      },
      {
        expression: '\\frac{f(x+h)-f(x)}{h} = \\frac{h(2x+h+3)}{h} = 2x + h + 3',
        annotation: 'Step 4: Cancel $h$. Valid since $h \\neq 0$ in the difference quotient.',
      },
      {
        expression: "\\lim_{h \\to 0}(2x+h+3) = 2x+3 = f'(x) \\qquad \\blacksquare",
        annotation: 'Let $h \\to 0$. The derivative $f\'(x) = 2x+3$ — which matches the power rule: $d/dx[x^2+3x] = 2x+3$.',
      },
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Power Rule Is This Limit, Pre-Computed',
        body: "\\frac{d}{dx}[x^n] = nx^{n-1} \\text{ is proved by applying the difference quotient to } x^n \\text{ and taking the limit.} \\\\ \\text{Every derivative shortcut in Chapter 2 is this process run once for a family of functions.}",
      },
    ],
  },

  examples: [
    {
      id: 'ch1-006-ex1',
      title: 'Average Rate of Change Over an Interval',
      problem: '$f(x) = x^3 - 2x$. Find the AROC on $[1, 3]$.',
      steps: [
        {
          expression: 'f(1) = 1 - 2 = -1 \\qquad f(3) = 27 - 6 = 21',
          annotation: 'Evaluate at both endpoints first.',
          hints: [
            '$f(1) = (1)^3 - 2(1) = 1 - 2 = -1$.',
            '$f(3) = (3)^3 - 2(3) = 27 - 6 = 21$.',
          ],
        },
        {
          expression: 'AROC = \\frac{f(3) - f(1)}{3 - 1} = \\frac{21 - (-1)}{2} = \\frac{22}{2} = 11',
          annotation: 'Rise over run: $\\Delta f / \\Delta x$. The function averaged an increase of 11 units per unit of $x$ over this interval.',
          hints: [
            'AROC = $(f(b) - f(a))/(b - a)$.',
            '$(21 - (-1)) / (3 - 1) = 22/2 = 11$.',
          ],
        },
      ],
      conclusion: 'The average rate of change is 11 — this is the slope of the secant line through $(1, -1)$ and $(3, 21)$.',
    },
    {
      id: 'ch1-006-ex2',
      title: 'The Difference Quotient for a Quadratic',
      problem: 'Find and simplify the difference quotient for $f(x) = 3x^2 - x + 2$.',
      steps: [
        {
          expression: 'f(x+h) = 3(x+h)^2 - (x+h) + 2 = 3x^2 + 6xh + 3h^2 - x - h + 2',
          annotation: 'Replace $x$ with $(x+h)$ and expand. Expand $(x+h)^2 = x^2 + 2xh + h^2$ then multiply by 3.',
          hints: [
            'Replace every $x$: $f(x+h) = 3(x+h)^2 - (x+h) + 2$.',
            '$(x+h)^2 = x^2 + 2xh + h^2$, so $3(x+h)^2 = 3x^2 + 6xh + 3h^2$.',
          ],
        },
        {
          expression: 'f(x+h) - f(x) = 6xh + 3h^2 - h',
          annotation: 'Subtract $f(x) = 3x^2 - x + 2$. The $3x^2$, $-x$, and $+2$ all cancel. Every surviving term has $h$.',
          hints: [
            'Subtract: $(3x^2 + 6xh + 3h^2 - x - h + 2) - (3x^2 - x + 2)$.',
            '$3x^2$ cancels with $-3x^2$; $-x$ cancels with $+x$; $+2$ cancels with $-2$. Left: $6xh + 3h^2 - h$.',
          ],
        },
        {
          expression: '\\frac{f(x+h)-f(x)}{h} = \\frac{h(6x+3h-1)}{h} = 6x + 3h - 1',
          annotation: 'Factor $h$ from the numerator and cancel. As $h \\to 0$, this gives $f\'(x) = 6x - 1$.',
          hints: [
            'Factor: $6xh + 3h^2 - h = h(6x + 3h - 1)$.',
            'Cancel $h$ (valid since $h \\neq 0$). Result: $6x + 3h - 1$.',
          ],
        },
      ],
      conclusion: 'The difference quotient is $6x + 3h - 1$. Setting $h = 0$ gives $f\'(x) = 6x - 1$ — the power rule result for this function.',
    },
    {
      id: 'ch1-006-ex3',
      title: 'Vertical Distance Between Two Curves',
      problem: '$f(x) = x^2 + 2$ and $g(x) = x$. Find the vertical distance function and where it is maximized on $[0, 2]$.',
      steps: [
        {
          expression: 'd(x) = f(x) - g(x) = x^2 - x + 2',
          annotation: 'Subtract the lower function. Check at $x = 0$: $f(0) = 2$, $g(0) = 0$, $d(0) = 2$. ✓',
          hints: [
            '$d(x) = (x^2 + 2) - x = x^2 - x + 2$.',
            'Verify: at $x = 1$, $f(1) = 3$, $g(1) = 1$, $d(1) = 2$. ✓',
          ],
        },
        {
          expression: "d'(x) = 2x - 1 = 0 \\implies x = \\tfrac{1}{2}",
          annotation: 'Find where the rate of change of distance is zero — a critical point inside the interval.',
          hints: [
            'Differentiate $d(x) = x^2 - x + 2$: $d\'(x) = 2x - 1$.',
            'Set equal to zero: $2x - 1 = 0 \\Rightarrow x = 1/2$.',
          ],
        },
        {
          expression: 'd(0) = 2, \\quad d\\!\\left(\\tfrac{1}{2}\\right) = \\tfrac{7}{4}, \\quad d(2) = 4',
          annotation: 'Check both endpoints and the critical point. Maximum is at $x = 2$ with $d = 4$.',
          hints: [
            '$d(1/2) = (1/4) - (1/2) + 2 = 7/4$.',
            '$d(2) = 4 - 2 + 2 = 4$.',
            'Compare: $2, 7/4, 4$. Maximum is 4 at $x = 2$.',
          ],
        },
      ],
      conclusion: 'The vertical distance between these curves is $d(x) = x^2 - x + 2$, maximized at $x = 2$ with a value of 4 on $[0, 2]$.',
    },
  ],

  challenges: [
    {
      id: 'ch1-006-ch1',
      difficulty: 'medium',
      problem: 'Find the difference quotient for $f(x) = \\dfrac{1}{x}$ and simplify completely.',
      hint: 'Find a common denominator for $f(x+h) - f(x)$ before dividing by $h$.',
      walkthrough: [
        {
          expression: 'f(x+h) - f(x) = \\frac{1}{x+h} - \\frac{1}{x} = \\frac{x - (x+h)}{x(x+h)} = \\frac{-h}{x(x+h)}',
          annotation: 'Common denominator is $x(x+h)$. The numerator simplifies to $x - x - h = -h$.',
        },
        {
          expression: '\\frac{f(x+h)-f(x)}{h} = \\frac{-h}{x(x+h)} \\cdot \\frac{1}{h} = \\frac{-1}{x(x+h)}',
          annotation: 'Divide by $h$: multiply by $1/h$. The $h$ in the numerator cancels.',
        },
        {
          expression: "\\lim_{h \\to 0} \\frac{-1}{x(x+h)} = \\frac{-1}{x^2} = f'(x)",
          annotation: 'Let $h \\to 0$: $x(x+h) \\to x \\cdot x = x^2$. The derivative of $1/x$ is $-1/x^2$, confirmed.',
        },
      ],
      answer: '\\dfrac{-1}{x(x+h)} \\;\\xrightarrow{h\\to 0}\\; f\'(x) = -\\dfrac{1}{x^2}',
    },
    {
      id: 'ch1-006-ch2',
      difficulty: 'hard',
      problem: 'A ball is thrown upward. Its height is $s(t) = -16t^2 + 64t$ feet. Find (a) the average velocity on $[1, 3]$, (b) the instantaneous velocity at $t = 1$, and (c) when the ball stops rising.',
      hint: 'Average velocity = AROC of position. Instantaneous velocity = derivative of position. The ball stops rising when velocity = 0.',
      walkthrough: [
        {
          expression: 'AROC = \\frac{s(3)-s(1)}{3-1} = \\frac{(-144+192)-(- 16+64)}{2} = \\frac{48-48}{2} = 0',
          annotation: '$s(3) = -16(9)+64(3) = -144+192 = 48$. $s(1) = -16+64 = 48$. Average velocity is zero — the ball returned to the same height.',
        },
        {
          expression: "s'(t) = -32t + 64 \\implies s'(1) = -32+64 = 32 \\text{ ft/s}",
          annotation: 'Differentiate $s(t)$ with the power rule. At $t=1$: $s\'(1) = 32$ ft/s upward.',
        },
        {
          expression: "s'(t) = 0 \\implies -32t+64=0 \\implies t=2 \\text{ s}",
          annotation: 'The ball stops rising when instantaneous velocity = 0, at $t = 2$ seconds.',
        },
      ],
      answer: '(a) $0$ ft/s; (b) $32$ ft/s at $t=1$; (c) stops rising at $t=2$ s',
    },
  ],

  crossRefs: [
    {
      lessonSlug: 'limits-and-continuity',
      label: 'Previous: Limits & Continuity Review',
      context: 'The limit machinery of Chapter 1 is exactly what makes lim(h→0) of the difference quotient well-defined.',
    },
    {
      lessonSlug: 'intro-limits',
      label: 'Foundation: Introduction to Limits',
      context: 'The limit definition of the derivative uses the same limit concept introduced at the start of Chapter 1.',
    },
  ],


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: 'AROC = (f(b)−f(a))/(b−a)',
        meaning: 'average rate of change over [a,b] — the slope of the secant line through the two endpoints',
      },
      {
        symbol: '(f(x+h)−f(x))/h',
        meaning: 'the difference quotient — average rate of change rewritten to make the limit h→0 natural',
      },
      {
        symbol: "f'(x) = lim(h→0) (f(x+h)−f(x))/h",
        meaning: 'the derivative — the instantaneous rate of change, defined as the limit of the difference quotient',
      },
      {
        symbol: 'secant line',
        meaning: 'the line through two points on the curve — its slope is the AROC; as the points merge, it becomes the tangent',
      },
    ],
    rulesOfThumb: [
      'AROC = slope of secant. Derivative = slope of tangent. They are the same formula, different scale.',
      'Difference quotient steps: substitute x+h, expand, subtract f(x), factor h, cancel h.',
      'After subtracting f(x), every remaining term must contain h. If not, find the algebra error.',
      'Units check: numerator in f-units, denominator in x-units. Result is a rate (f-units per x-unit).',
    ],
  },

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'ch0-lines',
        label: 'Lines and Slope (Ch. 0)',
        note: 'The difference quotient is the slope formula $\\Delta y / \\Delta x$ with $\\Delta x = h$. If slope of a line feels shaky, review it before this lesson — the difference quotient is that exact calculation applied to a curve.',
      },
      {
        lessonId: 'ch1-intro-limits',
        label: 'Introduction to Limits (Ch. 1)',
        note: 'The derivative is defined as a limit of the difference quotient. If limits feel uncertain, the definition of the derivative will be hard to interpret. Review the limit intro before studying what h→0 means here.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'ch2-tangent-problem',
        label: 'Ch. 2: The Tangent Problem',
        note: 'Chapter 2 opens by computing the difference quotient for specific functions and taking h→0. This lesson is the direct prerequisite — everything there starts from this formula.',
      },
      {
        lessonId: 'ch2-differentiation-rules',
        label: 'Ch. 2: Differentiation Rules',
        note: 'Every differentiation rule (power, product, quotient, chain) is derived by applying the difference quotient to a family of functions. The rules are shortcuts — but they are shortcuts for this formula.',
      },
    ],
  },

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'roc-assess-1',
        type: 'input',
        text: 'AROC of f(x)=x²−2x on [1,4] = ?',
        answer: '3',
        hint: 'f(1)=−1, f(4)=8. AROC = (8−(−1))/(4−1) = 9/3 = 3.',
      },
      {
        id: 'roc-assess-2',
        type: 'input',
        text: 'Difference quotient for f(x)=2x²: simplified form?',
        answer: '4*x + 2*h',
        hint: 'f(x+h)=2(x+h)²=2x²+4xh+2h². Subtract 2x²: 4xh+2h²=h(4x+2h). Divide by h: 4x+2h.',
      },
      {
        id: 'roc-assess-3',
        type: 'choice',
        text: 'What does the secant line become as h→0?',
        options: ['A horizontal line', 'The tangent line', 'A vertical line', 'The x-axis'],
        answer: 'The tangent line',
        hint: 'As the two points merge, the secant rotates into the tangent — whose slope is the derivative.',
      },
    ],
  },

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    'AROC = secant slope = (f(b)−f(a))/(b−a)',
    'Difference quotient = AROC with h as the gap',
    'Derivative = lim(h→0) of the difference quotient = tangent slope',
    'DQ steps: substitute, expand, subtract, factor h, cancel h',
    'After subtracting f(x), every term must have h — no h means algebra error',
  ],

  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
    'solved-challenge',
  ],

  quiz: [
    {
      id: 'roc-q1',
      type: 'input',
      text: 'Compute the average rate of change (AROC) of $f(x) = x^3 - 2x$ on $[1, 3]$.',
      answer: '11',
      hints: [
        '$f(1) = 1 - 2 = -1$ and $f(3) = 27 - 6 = 21$.',
        'AROC $= (21 - (-1))/(3 - 1) = 22/2 = 11$.',
      ],
      reviewSection: 'Examples tab — Example 1: AROC over an interval',
    },
    {
      id: 'roc-q2',
      type: 'choice',
      text: 'The average rate of change of $f$ on $[a, b]$ equals the slope of which line?',
      options: [
        'The tangent line at $x = a$',
        'The tangent line at $x = b$',
        'The secant line through $(a, f(a))$ and $(b, f(b))$',
        'The horizontal line $y = f(a)$',
      ],
      answer: 'The secant line through $(a, f(a))$ and $(b, f(b))$',
      hints: ['AROC = rise/run = $(f(b)-f(a))/(b-a)$, which is the slope of the secant line.'],
      reviewSection: 'Intuition tab — AROC as secant slope',
    },
    {
      id: 'roc-q3',
      type: 'input',
      text: 'For $f(x) = 3x^2 - x + 2$, the numerator $f(x+h)-f(x)$ factors as $h \\cdot (\\text{expression})$. What is the expression (without the factor of $h$)?',
      answer: '6*x + 3*h - 1',
      hints: [
        '$f(x+h) - f(x) = 6xh + 3h^2 - h$.',
        'Factor out $h$: $h(6x + 3h - 1)$.',
      ],
      reviewSection: 'Examples tab — Example 2: difference quotient for a quadratic',
    },
    {
      id: 'roc-q4',
      type: 'input',
      text: 'For $f(x) = 3x^2 - x + 2$, what is the simplified difference quotient $\\dfrac{f(x+h)-f(x)}{h}$?',
      answer: '6*x + 3*h - 1',
      hints: [
        'Numerator $= h(6x+3h-1)$. Cancel $h$.',
        'Result: $6x + 3h - 1$.',
      ],
      reviewSection: 'Examples tab — Example 2: difference quotient',
    },
    {
      id: 'roc-q5',
      type: 'input',
      text: 'For $f(x) = x^2 + 3x$, the difference quotient simplifies to $2x + h + 3$. What is $f\'(x) = \\lim_{h \\to 0}(2x+h+3)$?',
      answer: '2*x + 3',
      hints: ['Let $h \\to 0$ in $2x + h + 3$: the $h$ term disappears.'],
      reviewSection: 'Rigor tab — full difference quotient for x² + 3x',
    },
    {
      id: 'roc-q6',
      type: 'choice',
      text: 'Which is the correct limit definition of the derivative?',
      options: [
        "$f'(x) = \\dfrac{f(b) - f(a)}{b - a}$",
        "$f'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}$",
        "$f'(x) = \\lim_{x \\to 0} \\dfrac{f(x+h) - f(x)}{h}$",
        "$f'(x) = f(x+h) - f(x)$",
      ],
      answer: "$f'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}$",
      hints: ['The derivative is the limit as $h \\to 0$ — not as $x \\to 0$.'],
      reviewSection: 'Intuition tab — the derivative is the difference quotient in the limit',
    },
    {
      id: 'roc-q7',
      type: 'input',
      text: 'Compute the AROC of $f(x) = x^2$ on $[1, 3]$.',
      answer: '4',
      hints: [
        '$f(1) = 1$, $f(3) = 9$.',
        'AROC $= (9 - 1)/(3 - 1) = 8/2 = 4$.',
      ],
      reviewSection: 'Intuition tab — average vs instantaneous rate',
    },
    {
      id: 'roc-q8',
      type: 'input',
      text: 'A ball\'s height is $s(t) = -16t^2 + 64t$ ft. What is the average velocity on $[1, 3]$?',
      answer: '0',
      hints: [
        '$s(1) = -16 + 64 = 48$ ft, $s(3) = -144 + 192 = 48$ ft.',
        'AROC $= (48 - 48)/(3-1) = 0$ ft/s.',
      ],
      reviewSection: 'Challenges tab — Challenge 2',
    },
    {
      id: 'roc-q9',
      type: 'input',
      text: 'The difference quotient for $f(x) = 1/x$ simplifies to $\\dfrac{-1}{x(x+h)}$. What is $\\lim_{h \\to 0}$ of this?',
      answer: '-1/x^2',
      hints: ['Let $h \\to 0$: $x(x+h) \\to x^2$. Result: $-1/x^2$.'],
      reviewSection: 'Challenges tab — Challenge 1: difference quotient for 1/x',
    },
    {
      id: 'roc-q10',
      type: 'choice',
      text: 'As $h \\to 0$, the secant line through $(x, f(x))$ and $(x+h, f(x+h))$ approaches:',
      options: [
        'The horizontal line through $(x, f(x))$',
        'The tangent line at $x$',
        'The $x$-axis',
        'A vertical line at $x$',
      ],
      answer: 'The tangent line at $x$',
      hints: ['The derivative is the slope of the tangent line — the secant rotates toward it as $h \\to 0$.'],
      reviewSection: 'Intuition tab — secant to tangent as h→0',
    },
  ],
};
