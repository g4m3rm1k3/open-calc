export default {
  id: "ch1-fundamental-trig-limits",
  slug: "fundamental-trig-limits",
  chapter: 1,
  order: 5,
  title: "Fundamental Trig Limits",
  subtitle: "Deep mastery of lim sin(x)/x = 1 and lim (1-cos x)/x = 0",
  tags: [
    "trig limits",
    "sin x over x",
    "1 minus cos x over x",
    "unit circle proof",
    "squeeze theorem",
    "small-angle approximation",
  ],
  aliases:
    "twin pillars trig calculus deep trig limit proof small angle limits sinx over x one minus cosx over x",

  hook: {
    question:
      "Why are these two limits called the twin pillars of trigonometric calculus?",
    realWorldContext:
      "Because every trig derivative proof rests on them. Without lim(x->0) sin(x)/x = 1 and lim(x->0) (1-cos x)/x = 0, " +
      "you cannot rigorously derive d/dx[sin x] = cos x or d/dx[cos x] = -sin x from first principles. " +
      "In physics, they justify the small-angle model sin(theta) approx theta used in pendulums, waves, robotics, and control systems.",
    previewVisualizationId: "RadianDegreeLimitLab",
  },

  intuition: {
    prose: [
      "These two limits are not random facts to memorize. They are the translation layer between geometry and analysis.",

      "First pillar: lim(x->0) sin(x)/x = 1. This says that for very small angles x (in radians), sin(x) and x are nearly identical. " +
        "In other words, the ratio sin(x)/x gets squeezed to 1 as x shrinks to 0.",

      "Second pillar: lim(x->0) (1-cos x)/x = 0. This says the quantity 1-cos(x) goes to 0 faster than x does. " +
        "So when divided by x, it still collapses to 0.",

      "If you feel lost with these limits, the key is to stop treating them as algebra problems. They are geometry-plus-bounds problems:",
      "1. Build an inequality from unit-circle geometry.",
      "2. Apply the Squeeze Theorem.",
      "3. Reuse the result in limit patterns.",

      "Most exam problems are not the base limits themselves. They are pattern variations like sin(7x)/(3x), (1-cos(5x))/x, (tan x - sin x)/x^3, or compositions. " +
        "Mastering pattern conversion is what makes trig week feel easy.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Radians Only",
        body: "The limit lim(x->0) sin(x)/x = 1 is true only when x is measured in radians. In degrees, the limit is pi/180. Every derivative formula for trig assumes radians.",
      },
      {
        type: "intuition",
        title: "What You Should Remember",
        body: "For tiny x: sin(x) behaves like x, and 1-cos(x) behaves like x^2/2. These two approximations explain nearly every trig-limit simplification near 0.",
      },
      {
        type: "misconception",
        title: "Do Not Plug 0 Immediately",
        body: "For forms like sin(ax)/x or (1-cos x)/x, direct substitution gives 0/0. You must convert to a known pattern before evaluating.",
      },
      {
        type: "warning",
        title: "Limit Blindness Trap",
        body: "Do not apply sin(x)/x=1 unless x -> 0. Example: lim(x->pi) sin(x)/x = 0/pi = 0, not 1.",
      },
    ],
    visualizations: [
            {
        id: "RadianDegreeLimitLab",
        title: "Radians vs Degrees Toggle",
        mathBridge:
          'The limit $\\lim_{x\\to 0}\\frac{\\sin x}{x}=1$ holds only when $x$ is in radians. In degrees, $\\sin(x°) = \\sin(x\\cdot\\frac{\\pi}{180})$, so the limit becomes $\\frac{\\pi}{180}\\approx 0.01745$ — not 1. This is why every calculus derivative formula for trig assumes radians: the "1-to-1" scaling between arc length and angle ($s = r\\theta$) only works in radians.',
        caption:
          "Switch units and watch lim sin(x)/x change from 1 (radians) to π/180 (degrees).",
      },
      {
        id: "AreaSqueezeLab",
        title: "Three-Shape Area Squeeze",
        mathBridge:
          "For $0 < \\theta < \\frac{\\pi}{2}$, compare three areas on the unit circle: the inner triangle (area $= \\frac{1}{2}\\sin\\theta\\cos\\theta$), the circular sector (area $= \\frac{1}{2}\\theta$), and the outer tangent triangle (area $= \\frac{1}{2}\\tan\\theta$). Since inner $\\leq$ sector $\\leq$ outer: $\\cos\\theta \\leq \\frac{\\sin\\theta}{\\theta} \\leq 1$. As $\\theta\\to 0$, both bounds $\\to 1$, so $\\frac{\\sin\\theta}{\\theta}\\to 1$ by the Squeeze Theorem.",
        caption:
          "Drag theta and watch inner triangle ≤ sector ≤ outer triangle lock the proof visually.",
      },
      {
        id: "AlgebraicSqueezeWalkthrough",
        title: "Guided Algebraic Squeeze",
        mathBridge:
          "This steps through the algebra that converts the geometric inequality $\\sin\\theta\\cos\\theta < \\theta < \\tan\\theta$ into the usable form $\\cos\\theta < \\frac{\\sin\\theta}{\\theta} < 1$. Each move is one legal operation: multiply both sides by $2$, divide by $\\sin\\theta$ (positive for small $\\theta > 0$), take reciprocals (which flips inequalities). Following each step shows exactly why the Squeeze Theorem applies and why no step is skipped.",
        caption:
          "Apply one algebra move at a time to see exactly how geometric inequalities become sin(θ)/θ bounds.",
      },
      {
        id: "ArcChordLimit",
        title: "Arc-Chord Comparison Near 0",
        mathBridge:
          "The arc length subtended by angle $\\theta$ on a unit circle is $\\theta$ (by definition of radians). The chord length is $2\\sin(\\theta/2)$. Their ratio is $\\frac{2\\sin(\\theta/2)}{\\theta}$. As $\\theta\\to 0$ this ratio approaches 1 — the same fact as $\\lim_{u\\to 0}\\frac{\\sin u}{u}=1$ with $u=\\theta/2$. Arc and chord become indistinguishable at small scales, which is the geometric heart of why the limit equals 1.",
        caption:
          "As angle x shrinks, arc length and chord length converge — the geometry behind sin(x)/x → 1.",
      },
      {
        id: "SqueezeTheorem",
        title: "Squeeze Mechanism",
        mathBridge:
          "The completed squeeze: $\\cos x \\leq \\frac{\\sin x}{x} \\leq 1$ for $0 < x < \\frac{\\pi}{2}$. Since $\\lim_{x\\to 0}\\cos x = 1$ and $\\lim_{x\\to 0} 1 = 1$, the Squeeze Theorem forces $\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1$. This visualization shows the three-band narrowing: as the horizontal $\\varepsilon$-band tightens, $\\frac{\\sin x}{x}$ has nowhere to go except 1.",
        caption:
          "See how trapping sin(x)/x between cos(x) and 1 forces the limit to be 1.",
      },
      {
        id: "SmallAnglePendulumLab",
        title: "Small-Angle Pendulum Simulator",
        mathBridge:
          "A pendulum's equation of motion is $\\ddot{\\theta} = -\\frac{g}{L}\\sin\\theta$. This is hard to solve exactly because of the $\\sin\\theta$. But when $\\theta$ is small, the limit $\\lim_{\\theta\\to 0}\\frac{\\sin\\theta}{\\theta}=1$ tells us $\\sin\\theta \\approx \\theta$, turning the equation into $\\ddot{\\theta} = -\\frac{g}{L}\\theta$ — a simple oscillator with period $T = 2\\pi\\sqrt{L/g}$. This simulator shows the error that accumulates when you use the approximation at large angles: small angles ($<15°$) match almost perfectly; large angles diverge because $\\sin\\theta$ is no longer close enough to $\\theta$.",
        caption:
          "Compare exact timing vs sin(theta) ≈ theta approximation at small and large angles. The limit lim sin(x)/x = 1 is what makes the small-angle approximation valid.",
      },
      {
        id: "Ch3_4_SineOfAlmostNothing",
        title: "Story Viz — Sine of Almost Nothing",
        caption:
          "Book 3 Chapter 4 story visualization proving lim sin(x)/x = 1 via squeeze ideas.",
      },
    ],
  },

  math: {
    prose: [
      "Core results:",
      "1) lim(x->0) sin(x)/x = 1",
      "2) lim(x->0) (1-cos x)/x = 0",

      "Proof sketch for (1): for 0 < x < pi/2 on the unit circle, area comparison gives",
      "sin x <= x <= tan x.",
      "Rearrange to get",
      "cos x <= sin x / x <= 1.",
      "Now x->0 implies cos x -> 1 and 1 -> 1, so by Squeeze: sin x / x -> 1.",

      "Proof for (2) from (1):",
      "(1-cos x)/x * (1+cos x)/(1+cos x) = sin^2 x / (x(1+cos x))",
      "= (sin x / x) * (sin x / (1+cos x)).",
      "As x->0, first factor -> 1 and second factor -> 0/2 = 0, so product -> 0.",

      "Pattern library (use constantly):",
      "A) lim(x->0) sin(ax)/(bx) = a/b",
      "B) lim(x->0) (1-cos(ax))/x = 0",
      "C) lim(x->0) (1-cos(ax))/x^2 = a^2/2",
      "D) lim(x->0) tan x / x = 1 (since tan x / x = (sin x / x)*(1/cos x)).",
    ],
    callouts: [
      {
        type: "theorem",
        title: "Twin Pillars",
        body: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to 0} \\frac{1-\\cos x}{x} = 0",
      },
      {
        type: "theorem",
        title: "Automatic Third Pillar",
        body: "\\lim_{x\\to0} \\frac{\\tan x}{x}=1 \\quad \\text{because} \\quad \\frac{\\tan x}{x}=\\frac{\\sin x}{x}\\cdot\\frac{1}{\\cos x}, \\; \\cos(0)=1.",
      },
      {
        type: "theorem",
        title: "Most Useful Derived Limit",
        body: "\\lim_{x \\to 0} \\frac{1-\\cos x}{x^2} = \\frac{1}{2}",
      },
      {
        type: "strategy",
        title: "Conversion Workflow",
        body: "Step 1: Identify target pattern (sin u / u) or (1-cos u)/u. Step 2: Multiply/divide constants to create the target exactly. Step 3: Evaluate with known limits and limit laws.",
      },
    ],
    visualizations: [
      {
        id: "LimitApproach",
        props: {
          fn: "Math.sin(x)/x",
          targetX: 0,
          limitVal: 1,
          showTable: true,
        },
        title: "Numerical Convergence of sin(x)/x",
        mathBridge:
          'The table provides numerical evidence for $\\lim_{x\\to 0}\\frac{\\sin x}{x}=1$. At $x=0.1$: $\\frac{\\sin(0.1)}{0.1}=0.9983$. At $x=0.01$: $0.999983$. The values approach 1 from both sides. This numerical pattern matches the geometric proof — it does not replace it, but confirms the result and builds intuition for how fast $\\sin x$ "catches up" to $x$ near zero.',
        caption: "Both one-sided approaches lock onto 1 near x = 0.",
      },
      {
        id: "LimitApproach",
        props: {
          fn: "(1-Math.cos(x))/x",
          targetX: 0,
          limitVal: 0,
          showTable: true,
        },
        title: "Numerical Convergence of (1-cos x)/x",
        mathBridge:
          "The second pillar: $\\lim_{x\\to 0}\\frac{1-\\cos x}{x}=0$. Proved by multiplying by $\\frac{1+\\cos x}{1+\\cos x}$: $\\frac{1-\\cos x}{x}=\\frac{\\sin^2 x}{x(1+\\cos x)}=\\frac{\\sin x}{x}\\cdot\\frac{\\sin x}{1+\\cos x}$. As $x\\to 0$: first factor $\\to 1$, second factor $\\to\\frac{0}{2}=0$. So the product $\\to 0$. The table shows $1-\\cos x$ goes to 0 faster than $x$ itself does.",
        caption:
          "Values collapse to 0 near x = 0. The second pillar is proved using the conjugate trick and the first pillar.",
      },
      {
        id: "CosGapVisualizer",
        title: "Unit-Circle Gap Visualizer for 1−cos(x)",
        mathBridge:
          "On the unit circle, $1-\\cos\\theta$ is the horizontal distance from the point $(\\cos\\theta, \\sin\\theta)$ to the right edge $(1, 0)$. For small $\\theta$, this gap is tiny compared to the arc length $\\theta$. Geometrically: $1-\\cos\\theta \\approx \\theta^2/2$ for small $\\theta$ (from the Taylor series). So $(1-\\cos\\theta)/\\theta \\approx \\theta/2 \\to 0$. The gap shrinks quadratically — much faster than $\\theta$ shrinks linearly.",
        caption:
          "Watch the horizontal gap 1−cos(x) collapse faster than x as the angle shrinks.",
      },
      {
        id: "ConjugateVisualizer",
        title: "Conjugate Trick Visualizer",
        mathBridge:
          "The conjugate trick is the algebraic engine of the second pillar proof. Multiply $\\frac{1-\\cos x}{x}$ by $\\frac{1+\\cos x}{1+\\cos x}$ (equals 1, so value unchanged): $\\frac{(1-\\cos x)(1+\\cos x)}{x(1+\\cos x)} = \\frac{1-\\cos^2 x}{x(1+\\cos x)} = \\frac{\\sin^2 x}{x(1+\\cos x)}$. Now split: $\\frac{\\sin x}{x}\\cdot\\frac{\\sin x}{1+\\cos x}$. Each factor has a known limit. The visualization shows each algebraic step and what it does geometrically.",
        caption:
          "Watch (1−cos x)(1+cos x) = sin²(x) emerge, then split into the two known limit factors.",
      },
    ],
  },

  rigor: {
    title: "Formal Proof: The Area Squeeze",
    visualizationId: "SqueezeTrigGeometric",
    proofSteps: [
      {
        expression:
          "\\frac{1}{2}\\sin x \\cos x < \\frac{1}{2}x < \\frac{1}{2}\\tan x",
        annotation:
          "Compare areas: Inner Triangle < Circular Sector < Outer Tangent Triangle.",
      },
      {
        expression: "\\sin x \\cos x < x < \\frac{\\sin x}{\\cos x}",
        annotation:
          "Simplify by multiplying by 2 and writing tan x as sin x / cos x.",
      },
      {
        expression: "\\cos x < \\frac{x}{\\sin x} < \\frac{1}{\\cos x}",
        annotation:
          "Divide everything by sin x (which is positive for small x > 0).",
      },
      {
        expression: "\\cos x < \\frac{\\sin x}{x} < 1",
        annotation:
          "Take reciprocals (flipping the inequalities) and use cos x < 1.",
      },
      {
        expression:
          "\\lim_{x \\to 0} \\cos x = 1 \\text{ and } \\lim_{x \\to 0} 1 = 1",
        annotation: "Both boundaries approach 1 as the angle vanishes.",
      },
      {
        expression: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
        annotation:
          "By the Squeeze Theorem, the ratio is forced to 1. This is why radians (area = x/2) are essential.",
      },
    ],
    prose: [
      "Why radians are mandatory:",
      "If theta is measured in degrees, then sin(theta deg) = sin(theta*pi/180) in radian form. So",
      "lim(theta->0) sin(theta deg)/theta = lim(theta->0) sin(theta*pi/180)/(theta*pi/180) * (pi/180) = pi/180, not 1.",
      'The geometric proof above relied on the area of a circular sector being precisely x/2. This only holds if x is measured in radians. If we used degrees, the sector area would be (x/360) * pi * r^2, and the limit would pick up a factor of pi/180. Calculus requires radians so that the "scaling" between linear and circular motion is exactly 1-to-1.',
    ],
    callouts: [
      {
        type: "definition",
        title: "Radian Dependence",
        body: "\\lim_{x\\to 0}\\frac{\\sin x}{x}=1 \\text{ iff } x \\text{ is in radians.}",
      },
      {
        type: "tip",
        title: "Error Sense",
        body: "Near 0, replacing sin x by x has relative error about x^2/6, while replacing 1-cos x by x^2/2 has next error scale about x^4/24.",
      },
    ],
  },

  examples: [
    {
      id: "ch1-ftrl-ex1",
      title: "Direct Pattern Scaling",
      problem: "Evaluate lim(x->0) sin(7x)/(3x).",
      steps: [
        {
          expression:
            "\\frac{\\sin(7x)}{3x} = \\frac{7}{3} \\cdot \\frac{\\sin(7x)}{7x}",
          annotation:
            "Multiply by 7/7 style scaling so denominator matches the sine input (7x), unlocking pillar form.",
          hints: [
            "To apply lim sin(u)/u = 1, make the denominator u = 7x.",
            "Multiply numerator and denominator by 7.",
          ],
        },
        {
          expression:
            "\\lim_{x\\to0} \\frac{\\sin(7x)}{3x} = \\frac{7}{3} \\cdot 1",
          annotation:
            "Now the first factor is constant and second is exact pillar lim sin(u)/u.",
          hints: [
            "The limit of a constant times a function is constant times limit.",
            "lim sin(7x)/(7x) = 1.",
          ],
        },
        {
          expression: "= \\frac{7}{3}",
          annotation: "",
          hints: [
            "The standard limit contributes 1, so only the coefficient 7/3 remains.",
            "Multiply 7/3 by 1 to finish the evaluation.",
          ],
        },
      ],
      conclusion: "Answer: 7/3.",
    },
    {
      id: "ch1-ftrl-ex2",
      title: "Second Pillar Usage",
      problem: "Evaluate lim(x->0) (1-cos(5x))/x.",
      steps: [
        {
          expression:
            "\\text{Strategy trigger: at least one recognizable pillar pattern first}",
          annotation:
            "When you see 0/0, do not substitute; first rewrite into known limit blueprints.",
          hints: [
            "Identify the form that matches a known limit.",
            "Rewrite to use lim (1-cos u)/u = 0.",
          ],
        },
        {
          expression:
            "\\frac{1-\\cos(5x)}{x} = 5 \\cdot \\frac{1-\\cos(5x)}{5x}",
          annotation:
            "Dress denominator as 5x so second pillar applies directly.",
          hints: [
            "Multiply numerator and denominator by 5.",
            "Make the denominator 5x to match the argument.",
          ],
        },
        {
          expression: "\\lim_{x\\to0} \\frac{1-\\cos(5x)}{x} = 5 \\cdot 0",
          annotation: "Apply second pillar with u=5x.",
          hints: ["lim (1-cos(5x))/(5x) = 0.", "Constant times 0 is 0."],
        },
        {
          expression: "= 0",
          annotation: "",
          hints: [
            "The second-pillar limit is 0, so the product becomes 5 · 0.",
            "Anything times 0 is 0.",
          ],
        },
      ],
      conclusion: "Answer: 0.",
    },
    {
      id: "ch1-ftrl-ex3",
      title: "High-Frequency Standard Result",
      problem: "Evaluate lim(x->0) (1-cos(5x))/x^2.",
      steps: [
        {
          expression:
            "\\frac{1-\\cos(5x)}{x^2} = 25 \\cdot \\frac{1-\\cos(5x)}{(5x)^2}",
          annotation: "Scale denominator to (u)^2.",
          hints: [
            "Multiply numerator and denominator by 25.",
            "Make denominator (5x)^2.",
          ],
        },
        {
          expression: "\\lim_{u\\to0} \\frac{1-\\cos u}{u^2} = \\frac{1}{2}",
          annotation: "Known derived limit.",
          hints: ["Recall lim (1-cos u)/u^2 = 1/2.", "Substitute u = 5x."],
        },
        {
          expression:
            "\\lim_{x\\to0} \\frac{1-\\cos(5x)}{x^2} = 25 \\cdot \\frac{1}{2} = \\frac{25}{2}",
          annotation: "",
          hints: [
            "Multiply the coefficient 25 by the derived limit 1/2.",
            "The product is 25/2.",
          ],
        },
      ],
      conclusion: "Answer: 25/2.",
    },
    {
      id: "ch1-ftrl-ex4",
      title: "Mixed Identity Build",
      problem: "Evaluate lim(x->0) (tan x - sin x)/x^3.",
      steps: [
        {
          expression: "\\tan x - \\sin x = \\frac{\\sin x}{\\cos x} - \\sin x",
          annotation:
            "Translate to basics: tan is too opaque; rewrite in sin/cos form first.",
          hints: ["Write tan x as sin x / cos x.", "Subtract sin x."],
        },
        {
          expression: "= \\sin x\\left(\\frac{1}{\\cos x}-1\\right)",
          annotation: "Factoring trick exposes a shared sin(x) factor.",
          hints: ["Factor out sin x.", "Common factor is sin x."],
        },
        {
          expression: "= \\sin x\\cdot\\frac{1-\\cos x}{\\cos x}",
          annotation:
            "Common denominator creates the 1-cos(x) blueprint needed for the second pillar chain.",
          hints: ["Combine fractions.", "Get common denominator cos x."],
        },
        {
          expression:
            "\\frac{\\tan x-\\sin x}{x^3}=\\frac{\\sin x}{x}\\cdot\\frac{1-\\cos x}{x^2}\\cdot\\frac{1}{\\cos x}",
          annotation:
            "Split x^3 as x*x^2 so each factor becomes a known limit component.",
          hints: ["Write numerator over x^3.", "Split into product of limits."],
        },
        {
          expression: "\\to 1\\cdot\\frac{1}{2}\\cdot 1=\\frac{1}{2}",
          annotation:
            "First pillar, derived second-pillar limit, then cos continuity at 0.",
          hints: [
            "Apply limits: sin x / x -> 1, (1-cos x)/x^2 -> 1/2, 1/cos x -> 1.",
            "Product is 1/2.",
          ],
        },
      ],
      conclusion: "Answer: 1/2.",
    },
  ],

  challenges: [
    {
      id: "ch1-ftrl-ch1",
      difficulty: "easy",
      problem: "Evaluate lim(x->0) sin(9x)/(2x).",
      hint: "Convert to sin(9x)/(9x).",
      walkthrough: [
        {
          expression:
            "\\frac{\\sin(9x)}{2x} = \\frac{9}{2}\\cdot\\frac{\\sin(9x)}{9x}",
          annotation: "",
          hints: [
            "Multiply numerator and denominator by 9/9 so the denominator becomes 9x.",
            "Then factor out 9/2 to match the standard sin(u)/u form.",
          ],
        },
        {
          expression: "\\to \\frac{9}{2}",
          annotation: "",
          hints: ["Apply lim sin(9x)/(9x) = 1.", "9/2 * 1 = 9/2."],
        },
      ],
      answer: "9/2",
    },
    {
      id: "ch1-ftrl-ch2",
      difficulty: "medium",
      problem: "Evaluate lim(x->0) (1-cos(3x))/x^2.",
      hint: "Use (1-cos u)/u^2 -> 1/2 with u=3x.",
      walkthrough: [
        {
          expression:
            "\\frac{1-\\cos(3x)}{x^2}=9\\cdot\\frac{1-\\cos(3x)}{(3x)^2}",
          annotation: "",
          hints: [
            "Multiply numerator and denominator by 9.",
            "Make denominator (3x)^2.",
          ],
        },
        {
          expression: "\\to 9\\cdot\\frac{1}{2}=\\frac{9}{2}",
          annotation: "",
          hints: ["lim (1-cos u)/u^2 = 1/2 with u=3x.", "9 * 1/2 = 9/2."],
        },
      ],
      answer: "9/2",
    },
    {
      id: "ch1-ftrl-ch3",
      difficulty: "hard",
      problem:
        "Show that lim(x->0) (sin x - x)/x = 0 using only lim sin x / x = 1.",
      hint: "Rewrite as sin x / x - 1.",
      walkthrough: [
        {
          expression: "\\frac{\\sin x - x}{x}=\\frac{\\sin x}{x}-1",
          annotation: "",
          hints: ["Split the fraction.", "Write as (sin x / x) - 1."],
        },
        {
          expression: "\\lim_{x\\to0}\\left(\\frac{\\sin x}{x}-1\\right)=1-1=0",
          annotation: "",
          hints: ["lim (sin x / x) = 1.", "1 - 1 = 0."],
        },
      ],
      answer: "0",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "squeeze-theorem",
      label: "Squeeze Theorem",
      context: "Primary proof tool for the first pillar.",
    },
    {
      lessonSlug: "limit-laws",
      label: "Limit Laws",
      context: "Used for scaling, products, and compositions after conversion.",
    },
    {
      lessonSlug: "trig-derivatives",
      label: "Trig Derivatives",
      context:
        "These limits are prerequisites for derivative proofs of sin and cos.",
    },
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "read-rigor",
    "completed-example-1",
    "completed-example-2",
    "completed-example-3",
    "solved-challenge",
  ],
};
