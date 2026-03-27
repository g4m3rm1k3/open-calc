export default {
  id: "limits-and-continuity",
  slug: "limits-and-continuity",
  title: "Limits & Continuity",
  tags: ["calculus", "limits", "continuity", "foundations"],
  chapter: 1,
  order: 10,

  hook: {
    question:
      "What happens to a function as you get infinitely close to a point — but never quite reach it?",
    context: `Imagine driving toward a wall. You're 10 meters away, then 5, then 2.5, then 1.25...
      You never hit it, but we can still ask: what VALUE are you approaching?
      Limits let us talk rigorously about "infinitely close" — the foundation of all of calculus.`,
    realWorld: `Engineers use limits to model stress on a bridge as load approaches a breaking point.
      Physicists use them to define instantaneous velocity. Even your phone's GPS uses limit-based
      calculus to estimate your position between signal pings.`,
  },

  intuition: {
    summary: `A limit describes the value a function APPROACHES as input approaches some point.
      It doesn't matter what happens AT that point — only what happens around it.`,
    perspectives: [
      {
        style: "visual",
        explanation: `Picture a graph of f(x) = (x²-1)/(x-1). At x=1, you'd divide by zero — there's a HOLE.
          But zoom in on either side: the function approaches y=2 from the left AND the right.
          The limit is 2, even though f(1) is undefined.`,
        visualizationId: "LimitApproachViz",
      },
      {
        style: "numerical",
        explanation: `Plug in values of x closer and closer to 1:
          x=0.9 → f=1.9, x=0.99 → f=1.99, x=0.999 → f=1.999...
          From the other side: x=1.1 → f=2.1, x=1.01 → f=2.01...
          Both sides converge to 2. That convergence IS the limit.`,
        table: [
          { x: "0.9", fx: "1.9" },
          { x: "0.99", fx: "1.99" },
          { x: "0.999", fx: "1.999" },
          { x: "1.001", fx: "2.001" },
          { x: "1.01", fx: "2.01" },
          { x: "1.1", fx: "2.1" },
        ],
      },
      {
        style: "algebraic",
        explanation: `Factor the numerator: (x²-1) = (x-1)(x+1).
          So f(x) = (x-1)(x+1)/(x-1) = x+1 when x ≠ 1.
          As x→1, x+1 → 2. The algebra confirms the limit.`,
      },
      {
        style: "intuitive",
        explanation: `Think of a limit as a PREDICTION. If you covered up the point x=1 and asked
          "based on the pattern, what should f(1) be?" — the answer is the limit.
          Continuity means the function actually keeps its promise.`,
      },
    ],
  },

  math: {
    formalDefinition: `We say lim_{x→a} f(x) = L if for every ε > 0, there exists δ > 0 such that:
      0 < |x - a| < δ  ⟹  |f(x) - L| < ε`,
    notation: "\\lim_{x \\to a} f(x) = L",
    keyRules: [
      {
        name: "Sum Rule",
        formula: "\\lim_{x \\to a} [f(x) + g(x)] = \\lim f + \\lim g",
      },
      {
        name: "Product Rule",
        formula: "\\lim_{x \\to a} [f(x) \\cdot g(x)] = \\lim f \\cdot \\lim g",
      },
      {
        name: "Quotient Rule",
        formula:
          "\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{\\lim f}{\\lim g}, \\quad \\lim g \\neq 0",
      },
      {
        name: "Squeeze Theorem",
        formula:
          "g(x) \\leq f(x) \\leq h(x) \\text{ and } \\lim g = \\lim h = L \\Rightarrow \\lim f = L",
      },
    ],
    continuityDefinition: `f is continuous at a if: (1) f(a) is defined, (2) lim_{x→a} f(x) exists, (3) they're equal.`,

    visualizations: [
      {
        id: "VideoEmbed",
        title:
          "Continuity On an Interval Open & Closed Intervals & 1 Sided Limits Calculus 1 AB",
        props: { url: "" },
      },
      {
        id: "VideoEmbed",
        title: "CALCULUS SPEEDRUN || Limits || Episode 1",
        props: { url: "" },
      },
    ],
  },

  rigor: {
    visualizationId: "EpsilonDeltaViz",
    title: "The ε-δ Definition Animated",
    proofSteps: [
      {
        expression: "\\lim_{x \\to 1} (2x + 1) = 3",
        annotation: "Claim: the limit is 3. We must PROVE it using ε-δ.",
      },
      {
        expression: "|f(x) - L| = |(2x+1) - 3| = |2x - 2| = 2|x-1|",
        annotation: "Simplify |f(x) - L|. We need this < ε.",
      },
      {
        expression:
          "2|x - 1| < \\varepsilon \\iff |x-1| < \\frac{\\varepsilon}{2}",
        annotation: "So if we choose δ = ε/2, we're done.",
      },
      {
        expression: "\\text{Choose } \\delta = \\frac{\\varepsilon}{2}",
        annotation: "For ANY ε > 0, this δ works. The limit is proven.",
      },
    ],
  },

  examples: [
    {
      id: "ch1-10-ex1",
      title: "Factoring to Remove a Hole",
      problem: "Evaluate lim_{x→3} (x²-9)/(x-3)",
      steps: [
        {
          expression: "\\frac{x^2 - 9}{x - 3}",
          annotation: "Direct substitution gives 0/0 — indeterminate form.",
        },
        {
          expression: "= \\frac{(x-3)(x+3)}{x-3}",
          annotation: "Factor the numerator using difference of squares.",
        },
        {
          expression: "= x + 3 \\quad (x \\neq 3)",
          annotation: "Cancel the (x-3) terms. Valid since x≠3 in a limit.",
        },
        {
          expression: "\\lim_{x \\to 3} (x+3) = 6",
          annotation: "Now substitute x=3 directly. Limit is 6.",
        },
      ],
    },
    {
      id: "ch1-10-ex2",
      title: "One-Sided Limits and Jumps",
      problem: "Analyze lim_{x→0} |x|/x",
      steps: [
        {
          expression:
            "\\text{Left: } \\lim_{x \\to 0^-} \\frac{|x|}{x} = \\frac{-x}{x} = -1",
          annotation: "For x < 0, |x| = -x. Limit from the left is -1.",
        },
        {
          expression:
            "\\text{Right: } \\lim_{x \\to 0^+} \\frac{|x|}{x} = \\frac{x}{x} = 1",
          annotation: "For x > 0, |x| = x. Limit from the right is +1.",
        },
        {
          expression: "-1 \\neq 1 \\implies \\text{limit DNE}",
          annotation: "Left ≠ Right, so the two-sided limit does NOT exist.",
        },
      ],
    },
    {
      id: "ch1-10-ex3",
      title: "The Classic Squeeze: sin(x)/x",
      problem: "Show lim_{x→0} sin(x)/x = 1",
      steps: [
        {
          expression:
            "\\cos x \\leq \\frac{\\sin x}{x} \\leq 1 \\quad (x \\text{ near } 0)",
          annotation: "Geometric proof gives this squeeze inequality.",
        },
        {
          expression:
            "\\lim_{x \\to 0} \\cos x = 1, \\quad \\lim_{x \\to 0} 1 = 1",
          annotation: "Both outer functions approach 1.",
        },
        {
          expression: "\\therefore \\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
          annotation: "By the Squeeze Theorem, the middle must too.",
        },
      ],
    },
  ],

  challenges: [
    {
      id: "ch1-10-c1",
      difficulty: "medium",
      problem: "Find lim_{x→2} (x³-8)/(x-2)",
      hint: "Factor x³-8 as a difference of cubes: a³-b³ = (a-b)(a²+ab+b²)",
      walkthrough: [
        {
          expression: "x^3 - 8 = (x-2)(x^2+2x+4)",
          annotation: "Difference of cubes factoring.",
        },
        {
          expression: "\\lim_{x \\to 2} (x^2 + 2x + 4)",
          annotation: "Cancel (x-2), then substitute.",
        },
        { expression: "= 4 + 4 + 4 = 12", annotation: "The limit is 12." },
      ],
      answer: "12",
    },
    {
      id: "ch1-10-c2",
      difficulty: "medium",
      problem: "Is f(x) = {x² for x<1, 2x-1 for x≥1} continuous at x=1?",
      hint: "Check all three conditions: f(1) defined, limit exists, and they match.",
      walkthrough: [
        {
          expression: "f(1) = 2(1) - 1 = 1",
          annotation: "f(1) is defined and equals 1.",
        },
        {
          expression:
            "\\lim_{x \\to 1^-} x^2 = 1, \\quad \\lim_{x \\to 1^+}(2x-1) = 1",
          annotation: "Both one-sided limits equal 1.",
        },
        {
          expression: "\\lim = f(1) = 1 \\implies \\text{continuous}",
          annotation: "All three conditions met. Continuous at x=1.",
        },
      ],
      answer: "Yes, f is continuous at x=1.",
    },
  ],
};
