export default {
  id: "ch1-006",
  slug: "rate-of-change",
  chapter: 1,
  order: 6,
  title: "Rate of Change: From Slope to the Difference Quotient",
  subtitle:
    "Average rate of change is slope in disguise — and the difference quotient is the first step into calculus",
  tags: [
    "rate of change",
    "average rate of change",
    "difference quotient",
    "secant line",
    "slope",
    "interval",
    "calculus preview",
  ],
  aliases:
    "rate of change average rate difference quotient secant line slope interval AROC calculus preview derivative",

  hook: {
    question:
      'The speedometer in a car shows instantaneous speed. But if you drive 120 miles in 2 hours, your average speed was 60 mph — even if you were stopped at a light for 10 minutes. What is the mathematical object that captures "average change," and what happens when the interval shrinks to zero?',
    realWorldContext:
      "In manufacturing, the rate of change of a production metric over a shift tells you how fast output is changing — not just what it is. A CNC machine running slower at the end of a shift than the beginning has a negative rate of change in parts per hour. The difference quotient $\\frac{f(x+h)-f(x)}{h}$ is the precise algebraic formula for this — and it becomes the derivative when $h \\to 0$.",
    previewVisualizationId: "RateOfChangeViz",
  },

  intuition: {
    prose: [
      "The average rate of change of $f$ over an interval $[a, b]$ is the slope of the secant line connecting the two points $(a, f(a))$ and $(b, f(b))$. It answers the question: how much did $f$ change, per unit of $x$? The formula is just the slope formula: $\\frac{f(b) - f(a)}{b - a}$.",
      "The difference quotient rewrites this with a specific notation. Instead of $a$ and $b$, we use $x$ and $x + h$, where $h$ is the horizontal distance between them. So the average rate of change becomes $\\frac{f(x+h) - f(x)}{h}$. This notation is deliberate: it sets up the limit definition of the derivative, where $h \\to 0$.",
      "Visually: the secant line cuts through the curve at two points. As you drag the second point closer to the first (shrinking $h$), the secant line rotates and approaches the tangent line at that point. The average rate of change approaches the instantaneous rate of change. That limiting value is the derivative — the central object of calculus.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Average rate of change",
        body: "AROC = \\frac{f(b) - f(a)}{b - a} = \\frac{\\Delta y}{\\Delta x} \\\\ \\text{This is the slope of the secant line through } (a, f(a)) \\text{ and } (b, f(b)).",
      },
      {
        type: "definition",
        title: "The difference quotient",
        body: "\\frac{f(x+h) - f(x)}{h} \\qquad h \\neq 0 \\\\ \\text{Same as AROC but written to make the limit } h \\to 0 \\text{ natural.}",
      },
      {
        type: "insight",
        title: "Why the difference quotient matters",
        body: "\\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h} = f'(x) \\\\ \\text{The derivative IS the difference quotient in the limit.} \\\\ \\text{Every derivative rule you learn in calculus is built on this.}",
      },
      {
        type: "warning",
        title: "Average vs instantaneous — they are not the same",
        body: "\\text{AROC over } [1, 3] \\text{ for } f(x)=x^2: \\frac{9-1}{3-1} = 4 \\\\ \\text{Instantaneous rate at } x=2: f'(2) = 4 \\quad (\\text{coincidence here!}) \\\\ \\text{For } [1,4]: \\frac{16-1}{4-1} = 5 \\neq f'(2) = 4",
      },
    ],
    visualizations: [
      {
        id: "RateOfChangeViz",
        title: "Secant Line → Tangent Line",
        mathBridge:
          "Drag the second point toward the first. Watch the secant line rotate toward the tangent. The slope readout shows the average rate of change converging to the instantaneous rate.",
        caption:
          "The derivative is what the difference quotient becomes when $h$ reaches zero.",
      },
      {
        id: "Ch3_1_HowFastWasIt",
        title: "Story Viz — How Fast Was It?",
        caption:
          "Book 3 Chapter 1 narrative bridge from average speed to instantaneous rate.",
      },
      {
        id: "Ch3_6_BridgeToCalculus",
        title: "Story Viz — Bridge to Calculus",
        caption:
          "Book 3 Chapter 6 capstone connecting difference quotient limits to derivative definition.",
      },
      {
        id: "Ch4_RampSlope",
        title: "Story Mode: The Ramp That Fought Back",
        mathBridge:
          "Slope as rise/run is developed from a physical ramp design problem and linked to scale-invariance. This directly supports interpreting average rate as secant slope and sets up tangent-slope limits.",
        caption:
          "Narrative reinforcement for why slope is the core rate language before formal derivatives.",
      },
    ],
  },

  math: {
    prose: [
      "To compute the difference quotient for a specific function, substitute $x+h$ for $x$, expand, subtract $f(x)$, then divide by $h$. The goal is always to cancel the $h$ in the denominator — if you cannot cancel it, you have made an algebra error.",
      "The vertical distance between two curves is itself a function of $x$. If $f(x) \\geq g(x)$ on an interval, the vertical distance is $d(x) = f(x) - g(x)$. This function has its own rate of change: $d'(x) = f'(x) - g'(x)$. In integration, this vertical distance function is what you integrate to find area between curves.",
      "Units matter in rate of change problems. If $f(t)$ is position in metres and $t$ is in seconds, then $\\frac{f(b)-f(a)}{b-a}$ has units of metres per second. The difference quotient preserves units: the numerator is in $f$-units and the denominator is in $x$-units, so the result is $f$-units per $x$-unit.",
    ],
    callouts: [
      {
        type: "definition",
        title: "Vertical distance between two curves",
        body: "d(x) = f(x) - g(x) \\quad \\text{when } f(x) \\geq g(x) \\\\ \\text{Always subtract the lower function from the upper function.} \\\\ \\text{Check which is on top at each point — it can switch.}",
      },
      {
        type: "theorem",
        title: "Difference quotient — step by step",
        body: "1.\\; \\text{Write } f(x+h) \\text{ by replacing every } x \\text{ with } (x+h) \\\\ 2.\\; \\text{Expand and simplify the numerator} \\\\ 3.\\; \\text{Subtract } f(x) \\text{ — terms without } h \\text{ must cancel} \\\\ 4.\\; \\text{Factor out } h \\text{ and cancel with denominator}",
      },
    ],
  },

  rigor: {
    title: "Computing the difference quotient for $f(x) = x^2 + 3x$",
    visualizationId: "RateOfChangeViz",
    proofSteps: [
      {
        expression: "f(x+h) = (x+h)^2 + 3(x+h)",
        annotation:
          "Replace every $x$ with $(x+h)$. Do not expand yet — write it out first.",
      },
      {
        expression: "= x^2 + 2xh + h^2 + 3x + 3h",
        annotation:
          "Expand $(x+h)^2 = x^2 + 2xh + h^2$ and distribute the $3$.",
      },
      {
        expression: "f(x+h) - f(x) = (x^2 + 2xh + h^2 + 3x + 3h) - (x^2 + 3x)",
        annotation:
          "Subtract the original function. The $x^2$ and $3x$ terms cancel — they must.",
      },
      {
        expression: "= 2xh + h^2 + 3h = h(2x + h + 3)",
        annotation:
          "Collect and factor out $h$. Every remaining term has an $h$ — if not, check your expansion.",
      },
      {
        expression:
          "\\frac{f(x+h)-f(x)}{h} = \\frac{h(2x+h+3)}{h} = 2x + h + 3",
        annotation:
          "Cancel $h$. Valid because $h \\neq 0$. This is the difference quotient.",
      },
      {
        expression:
          "\\lim_{h \\to 0}(2x+h+3) = 2x+3 = f'(x) \\qquad \\blacksquare",
        annotation:
          "Let $h \\to 0$. The derivative is $2x+3$ — which is what the power rule gives directly.",
      },
    ],
  },

  examples: [
    {
      id: "ch1-006-ex1",
      title: "Average rate of change over an interval",
      problem: "f(x) = x^3 - 2x. \\text{ Find the AROC on } [1, 3].",
      steps: [
        {
          expression: "f(1) = 1 - 2 = -1 \\qquad f(3) = 27 - 6 = 21",
          annotation: "Evaluate at both endpoints.",
        },
        {
          expression: "AROC = \\frac{21 - (-1)}{3 - 1} = \\frac{22}{2} = 11",
          annotation:
            "Slope formula: rise over run. Units: $f$-units per $x$-unit.",
        },
      ],
      conclusion:
        "The function increased by an average of 11 units per unit of $x$ over $[1,3]$. This is the slope of the secant line through $(1,-1)$ and $(3,21)$.",
    },
    {
      id: "ch1-006-ex2",
      title: "The difference quotient for a quadratic",
      problem:
        "\\text{Find and simplify the difference quotient for } f(x) = 3x^2 - x + 2.",
      steps: [
        {
          expression:
            "f(x+h) = 3(x+h)^2 - (x+h) + 2 = 3x^2 + 6xh + 3h^2 - x - h + 2",
          annotation: "Substitute $x+h$ and expand fully.",
        },
        {
          expression: "f(x+h) - f(x) = 6xh + 3h^2 - h",
          annotation:
            "Subtract $f(x) = 3x^2 - x + 2$. The $3x^2$, $-x$, and $+2$ cancel.",
        },
        {
          expression:
            "\\frac{f(x+h)-f(x)}{h} = \\frac{h(6x+3h-1)}{h} = 6x + 3h - 1",
          annotation:
            "Factor $h$ and cancel. As $h \\to 0$, this gives $f'(x) = 6x - 1$.",
        },
      ],
      conclusion:
        "The difference quotient simplifies to $6x + 3h - 1$. Setting $h=0$ gives the derivative $6x-1$, confirming the power rule result.",
    },
    {
      id: "ch1-006-ex3",
      title: "Vertical distance between two curves",
      problem:
        "f(x) = x^2 + 2 \\text{ and } g(x) = x. \\text{ Find the vertical distance function and where it is maximised on } [0,2].",
      steps: [
        {
          expression: "d(x) = f(x) - g(x) = x^2 - x + 2",
          annotation:
            "Subtract the lower function. Check: at $x=0$, $f=2$, $g=0$, $d=2$. ✓",
        },
        {
          expression: "d'(x) = 2x - 1 = 0 \\Rightarrow x = \\tfrac{1}{2}",
          annotation:
            "Find where the rate of change of distance is zero — the critical point.",
        },
        {
          expression:
            "d(0)=2, \\; d(\\tfrac{1}{2})=\\tfrac{7}{4}, \\; d(2)=4 \\Rightarrow \\text{max at } x=2",
          annotation:
            "Check endpoints and critical point. The maximum vertical distance on $[0,2]$ is 4, at $x=2$.",
        },
      ],
      conclusion:
        "The vertical distance between two curves is a function with its own calculus. Finding its maximum and minimum is a standard optimisation problem.",
    },
  ],

  challenges: [
    {
      id: "ch1-006-ch1",
      difficulty: "medium",
      problem:
        "\\text{Find the difference quotient for } f(x) = \\frac{1}{x} \\text{ and simplify completely.}",
      hint: "You will need to find a common denominator in the numerator before cancelling $h$.",
      walkthrough: [
        {
          expression:
            "f(x+h) - f(x) = \\frac{1}{x+h} - \\frac{1}{x} = \\frac{x - (x+h)}{x(x+h)} = \\frac{-h}{x(x+h)}",
          annotation: "Common denominator: $x(x+h)$.",
        },
        {
          expression:
            "\\frac{f(x+h)-f(x)}{h} = \\frac{-h}{x(x+h)} \\cdot \\frac{1}{h} = \\frac{-1}{x(x+h)}",
          annotation: "Divide by $h$ — cancel cleanly.",
        },
        {
          expression:
            "\\lim_{h\\to 0} \\frac{-1}{x(x+h)} = \\frac{-1}{x^2} = f'(x)",
          annotation: "The derivative of $1/x$ is $-1/x^2$, confirmed.",
        },
      ],
      answer: "\\dfrac{-1}{x(x+h)} \\;\\to\\; f'(x) = -\\dfrac{1}{x^2}",
    },
    {
      id: "ch1-006-ch2",
      difficulty: "hard",
      problem:
        "\\text{A ball is thrown upward. Its height is } s(t) = -16t^2 + 64t \\text{ feet. Find the average velocity on } [1,3] \\text{, the instantaneous velocity at } t=1, \\text{ and when the ball stops rising.}",
      hint: "Average velocity = AROC of position. Instantaneous velocity = derivative of position.",
      walkthrough: [
        {
          expression:
            "AROC = \\frac{s(3)-s(1)}{3-1} = \\frac{(-144+192)-(- 16+64)}{2} = \\frac{48-48}{2} = 0",
          annotation:
            "Average velocity is zero — it went up and came back to the same height.",
        },
        {
          expression:
            "s'(t) = -32t + 64 \\Rightarrow s'(1) = -32+64 = 32 \\text{ ft/s}",
          annotation: "Instantaneous velocity at $t=1$: rising at 32 ft/s.",
        },
        {
          expression:
            "s'(t) = 0 \\Rightarrow -32t+64=0 \\Rightarrow t=2 \\text{ s}",
          annotation:
            "The ball stops rising at $t=2$ seconds, when velocity equals zero.",
        },
      ],
      answer:
        "Avg velocity = 0 ft/s; instantaneous at $t=1$ is 32 ft/s; stops rising at $t=2$ s.",
    },
  ],

  calcBridge: {
    teaser:
      "The difference quotient $\\frac{f(x+h)-f(x)}{h}$ is the exact definition of the derivative. Every derivative rule — power rule, product rule, chain rule — is a shortcut derived from this formula. In calculus, the first topic after limits is this limit applied to find derivatives. Understanding the difference quotient deeply means the derivative never feels mysterious.",
    linkedLessons: ["limits-introduction", "function-behaviour"],
  },

  quiz: [
    {
      id: 'roc-q1',
      type: 'input',
      text: 'Compute the average rate of change (AROC) of $f(x) = x^3 - 2x$ on $[1, 3]$.',
      answer: '11',
      hints: [
        '$f(1) = 1 - 2 = -1$ and $f(3) = 27 - 6 = 21$.',
        'AROC $= (21 - (-1))/(3 - 1) = 22/2$.',
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
      text: 'For $f(x) = 3x^2 - x + 2$, compute $f(x+h) - f(x)$ and simplify. The result factors as $h \\cdot (\\text{expression})$. What is the expression (without the factor of $h$)?',
      answer: '6*x + 3*h - 1',
      hints: [
        '$f(x+h) = 3(x+h)^2 - (x+h) + 2 = 3x^2 + 6xh + 3h^2 - x - h + 2$.',
        '$f(x+h) - f(x) = 6xh + 3h^2 - h = h(6x + 3h - 1)$.',
      ],
      reviewSection: 'Examples tab — Example 2: difference quotient for a quadratic',
    },
    {
      id: 'roc-q4',
      type: 'input',
      text: 'For $f(x) = 3x^2 - x + 2$, what is the simplified difference quotient $\\dfrac{f(x+h)-f(x)}{h}$? Enter the expression (e.g. "6*x+3*h-1").',
      answer: '6*x + 3*h - 1',
      hints: [
        'From the previous step: $f(x+h)-f(x) = h(6x+3h-1)$.',
        'Divide by $h$ to get $6x + 3h - 1$.',
      ],
      reviewSection: 'Examples tab — Example 2: difference quotient',
    },
    {
      id: 'roc-q5',
      type: 'input',
      text: 'For $f(x) = x^2 + 3x$, the difference quotient simplifies to $2x + h + 3$. Taking $\\lim_{h \\to 0}$ gives the derivative $f\'(x)$. What is $f\'(x)$? Enter as an expression (e.g. "2*x+3").',
      answer: '2*x + 3',
      hints: ['Let $h \\to 0$ in $2x + h + 3$.'],
      reviewSection: 'Rigor tab — full difference quotient for x² + 3x',
    },
    {
      id: 'roc-q6',
      type: 'choice',
      text: 'Which of the following is the limit definition of the derivative?',
      options: [
        '$f\'(x) = \\dfrac{f(b) - f(a)}{b - a}$',
        '$f\'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}$',
        '$f\'(x) = \\lim_{x \\to 0} \\dfrac{f(x+h) - f(x)}{h}$',
        '$f\'(x) = f(x+h) - f(x)$',
      ],
      answer: '$f\'(x) = \\lim_{h \\to 0} \\dfrac{f(x+h) - f(x)}{h}$',
      hints: ['The derivative is the difference quotient as $h$ shrinks to 0.'],
      reviewSection: 'Intuition tab — the difference quotient and derivative',
    },
    {
      id: 'roc-q7',
      type: 'input',
      text: 'For $f(x) = x^2$, compute the AROC on $[1, 3]$.',
      answer: '4',
      hints: [
        '$f(1) = 1$, $f(3) = 9$.',
        'AROC $= (9 - 1)/(3 - 1) = 8/2 = 4$.',
      ],
      reviewSection: 'Intuition tab — average vs instantaneous rate of change',
    },
    {
      id: 'roc-q8',
      type: 'input',
      text: 'A ball\'s height is $s(t) = -16t^2 + 64t$ ft. Compute the average velocity on $[1, 3]$.',
      answer: '0',
      hints: [
        '$s(1) = -16 + 64 = 48$ ft, $s(3) = -144 + 192 = 48$ ft.',
        'AROC $= (48 - 48)/(3-1) = 0$.',
      ],
      reviewSection: 'Challenges tab — Challenge 2',
    },
    {
      id: 'roc-q9',
      type: 'input',
      text: 'The difference quotient for $f(x) = 1/x$ simplifies to $\\dfrac{-1}{x(x+h)}$. What is $\\lim_{h \\to 0}$ of this expression? Express as a fraction in terms of $x$ (e.g. "-1/x^2").',
      answer: '-1/x^2',
      hints: ['Let $h \\to 0$ in $-1/(x(x+h)) = -1/(x \\cdot x) = -1/x^2$.'],
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
      hints: ['The derivative is the slope of the tangent line — the secant approaches it as $h \\to 0$.'],
      reviewSection: 'Intuition tab — secant to tangent as h→0',
    },
  ],
};
