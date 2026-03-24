export default {
  id: "ch0-trig",
  slug: "trig-review",
  chapter: 0,
  order: 2,
  title: "Trigonometry",
  subtitle: "Circles, angles, and the most important functions in calculus",
  tags: [
    "trigonometry",
    "sine",
    "cosine",
    "tangent",
    "unit circle",
    "radians",
    "identities",
    "inverse trig",
  ],

  hook: {
    question: "Why is the height of a point on a Ferris wheel a sine wave?",
    realWorldContext:
      "A Ferris wheel with radius 1 centered at the origin: after rotating by angle θ from the rightmost point, " +
      "your height above the center is exactly sin(θ). Not approximately — exactly. " +
      "Sound waves, light waves, AC electricity, ocean tides, pendulums, spring oscillations — they're all sine waves. " +
      "The trig functions are woven into the fabric of the physical universe, and you'll use them constantly in calculus.",
    previewVisualizationId: "UnitCircle",
  },

  intuition: {
    // blocks format: videos placed inline with the content they illustrate
    blocks: [
      {
        type: "prose",
        paragraphs: [
          "Start with a circle of radius 1 centered at the origin — the **unit circle**. " +
            "Pick any angle θ measured counterclockwise from the positive x-axis. " +
            "The point where the terminal ray hits the circle has coordinates (cos θ, sin θ). Full stop. " +
            "That's the definition. Everything else follows from this.",
          "Think of cos θ as the **horizontal shadow** and sin θ as the **vertical shadow** that the unit-circle point casts.",
        ],
      },
      {
        type: "viz",
        id: "Ch3_MissingAngle",
        title: "Story Mode: The Missing Angle",
        mathBridge:
          "A broken-protractor build problem motivates trig ratios as geometry-to-algebra translations. The story concretizes why $\\sin(\\theta)$ encodes side ratios and how unknowns become solvable equations.",
        caption:
          "Narrative bridge from lengths to angle information before formal trig identities.",
      },
      // Unit circle definition — Calc I overview alongside the full Dennis series unit circle
      {
        type: "viz",
        id: "VideoCarousel",
        title: "The Unit Circle — Trig Ratios & Definitions",
        props: {
          videos: [
            {
              url: "https://www.youtube.com/embed/wwykal6Ms_g",
              title: "Calc I — 0.4.1 Review of Trig Functions",
            },
            {
              url: "https://www.youtube.com/embed/LvMScE93T6I",
              title: "TR-13 — The Trigonometric Ratios",
            },
            {
              url: "https://www.youtube.com/embed/oJgBJfstOOU",
              title: "TR-14 — The Unit Circle",
            },
            {
              url: "https://www.youtube.com/embed/4TFLcKKmfao",
              title: "TR-15 — Common Angle Values",
            },
          ],
        },
      },
      {
        type: "viz",
        id: "UnitCircle",
        props: { animate: false },
        title: "Interactive: Sine & Cosine on the Unit Circle",
        mathBridge:
          "The unit circle defines sine and cosine for every angle: the point at angle $\\theta$ has coordinates $(\\cos\\theta, \\sin\\theta)$. This is not a formula to memorize — it is the definition. The Pythagorean identity $\\sin^2\\theta + \\cos^2\\theta = 1$ follows immediately from $x^2 + y^2 = 1$.",
        caption:
          "Drag the angle slider to watch sin(θ) and cos(θ) trace out as the point moves around the circle.",
      },
      {
        type: "callout",
        type: "prior-knowledge",
        title: "The Pythagorean Theorem",
        body: "In a right triangle with legs a and b and hypotenuse c: a² + b² = c². Applied to the unit circle (hypotenuse = 1), this becomes sin²θ + cos²θ = 1 — the most important trig identity.",
      },
      {
        type: "callout",
        type: "tip",
        title: "Key Values to Memorize",
        body: "sin(0)=0, sin(π/6)=1/2, sin(π/4)=√2/2, sin(π/3)=√3/2, sin(π/2)=1",
      },
      {
        type: "viz",
        id: "UnitCircleMirror",
        title: 'The "Mirror Mode" Unit Circle: Exact Values',
        mathBridge:
          'Stop memorizing 16 separate coordinates. Memorize only the First Quadrant (the "Big Three" families). Angles in other quadrants are just reflections—only the plus/minus signs change based on position.',
        caption:
          "Toggle Mirror Mode to see how every angle in the circle is just an x or y reflection of a Q1 angle.",
      },
      {
        type: "prose",
        paragraphs: [
          "As θ increases from 0 to 2π (one full revolution), the point traces the whole circle. " +
            "cos θ starts at 1, decreases to 0 at π/2, hits −1 at π, returns to 0 at 3π/2, and comes back to 1 at 2π. " +
            "sin θ starts at 0, rises to 1 at π/2, returns to 0 at π, dips to −1 at 3π/2, and comes back to 0 at 2π.",
          "Angles in calculus are measured in **radians**, not degrees. " +
            "2π radians = 360°. One radian is the angle that cuts off an arc equal to the radius. " +
            "Radians make calculus formulas clean (derivatives of sin and cos have no ugly conversion factors).",
        ],
      },
      {
        type: "callout",
        type: "intuition",
        title: "Why Radians?",
        body: "d/dx[sin x] = cos x only when x is in radians. In degrees, you get an ugly factor of π/180.",
      },
      // Graphing trig — Calc I + Dennis graphing series covering same topic
      {
        type: "viz",
        id: "VideoCarousel",
        title: "Graphing Trigonometric Functions",
        props: {
          videos: [
            {
              url: "https://www.youtube.com/embed/dJ2dl9KQ-B0",
              title: "Calc I — 0.4.3 Graphs of Trig Functions",
            },
            {
              url: "https://www.youtube.com/embed/f99P31SAsek",
              title: "TR-18 — Graphing Sine & Cosine",
            },
            {
              url: "https://www.youtube.com/embed/p14y-9xPVgk",
              title: "TR-19 — Graphing Tangent & Cotangent",
            },
            {
              url: "https://www.youtube.com/embed/UZA34UL_mUE",
              title: "TR-20 — Graphing Secant & Cosecant",
            },
          ],
        },
      },
      {
        type: "viz",
        id: "SineUnwrap",
        title: "The Unit Circle Unwraps into the Sine Wave",
        mathBridge:
          'As angle $\\theta$ increases, the $y$-coordinate of the unit-circle point traces $\\sin\\theta$. Plotting that $y$-value against $\\theta$ "unwraps" the circular motion into a wave. This is the geometric reason sine is periodic with period $2\\pi$.',
        caption:
          "The vertical height of the point on the unit circle, plotted against angle, traces the sine curve.",
      },
      {
        type: "prose",
        paragraphs: [
          "Arc-vs-chord intuition that feeds directly into limits: for small angles, the arc length and chord length become almost identical. " +
            "That geometric squeeze is one of the hidden engines behind why $\\sin(x)/x \\to 1$ as $x \\to 0$.",
          "The Pythagorean theorem — a² + b² = c² — underpins all of trigonometry. " +
            "From sin²θ + cos²θ = 1, one identity generates all others.",
        ],
      },
      {
        type: "viz",
        id: "ArcChordLimit",
        title: "Arc vs Chord for Tiny Angles",
        mathBridge:
          "Arc length $= r\\theta$ (radian definition). Chord length $= 2r\\sin(\\theta/2)$. As $\\theta\\to 0$, their ratio $\\to 1$ — the same fact as $\\lim_{u\\to 0}\\frac{\\sin u}{u}=1$.",
        caption:
          "As θ shrinks, arc and chord lengths converge — the geometry behind sin(x)/x → 1.",
      },
      {
        type: "callout",
        type: "misconception",
        title: "sin(a + b) ≠ sin(a) + sin(b)",
        body: "One of the most common algebra errors in calculus. sin(30°+60°)=sin(90°)=1, but sin(30°)+sin(60°)=1.366. The correct expansion is sin(a+b)=sin(a)cos(b)+cos(a)sin(b).",
      },
      {
        type: "callout",
        type: "geometric",
        title: "Similar Triangles Explain Trig Ratios",
        body: "sin, cos, and tan are shape invariants: all right triangles with the same angle are similar, so opposite/hypotenuse stays constant across scale.",
      },
      {
        type: "viz",
        id: "TriangleAreaProof",
        title: "Why Triangle Area = ½ab sin C",
        mathBridge:
          "For a triangle with sides $a$, $b$ and included angle $C$: the height is $h = b\\sin C$, giving Area $= \\frac{1}{2}ab\\sin C$.",
        caption:
          "Watch how two copies of the triangle tile a parallelogram, proving Area = ½ab sin C.",
      },
    ],
  },

  math: {
    blocks: [
      {
        type: "prose",
        paragraphs: [
          "The six trig functions are defined as:",
          "sin θ and cos θ come directly from the unit circle. The rest are ratios:",
        ],
      },
      {
        type: "callout",
        type: "definition",
        title: "The Six Trig Functions",
        body: "\\sin\\theta = y,\\quad \\cos\\theta = x,\\quad \\tan\\theta = \\dfrac{y}{x} \\\\ \\csc\\theta = \\dfrac{1}{y},\\quad \\sec\\theta = \\dfrac{1}{x},\\quad \\cot\\theta = \\dfrac{x}{y} \\\\ \\text{where } (x,y) \\text{ is the point on the unit circle at angle } \\theta",
      },
      // Unit circle setup videos — right after the definitions, all covering same topic
      {
        type: "viz",
        id: "VideoCarousel",
        title: "Setting Up the Unit Circle & All Six Functions",
        props: {
          videos: [
            {
              url: "https://www.youtube.com/embed/j5SoWzBSUmY",
              title: "Unit Circle Part 1 — Reference Angles",
            },
            {
              url: "https://www.youtube.com/embed/FaZ7frx8nd8",
              title: "Unit Circle Part 2 — Exact Values",
            },
            {
              url: "https://www.youtube.com/embed/LNBZ0bP4SHk",
              title: "TR-33Z — All 6 Trig Functions on the Unit Circle",
            },
          ],
        },
      },
      {
        type: "viz",
        id: "UnitCircle",
        props: { showTable: true },
        title: "Unit Circle Reference Table",
      },
      {
        type: "prose",
        paragraphs: [
          "**Degrees ↔ Radians**: multiply by π/180 to convert degrees to radians.",
          "The **Pythagorean Identity** is the most important trig identity — it follows directly from x² + y² = 1:",
          "From the Pythagorean identity, we derive two others by dividing through by cos²θ or sin²θ.",
        ],
      },
      {
        type: "callout",
        type: "theorem",
        title: "Pythagorean Identities",
        body: "\\sin^2\\theta + \\cos^2\\theta = 1 \\\\ 1 + \\tan^2\\theta = \\sec^2\\theta \\\\ 1 + \\cot^2\\theta = \\csc^2\\theta",
      },
      // Pythagorean identities — Kim + Dennis covering same topic
      {
        type: "viz",
        id: "VideoCarousel",
        title: "Pythagorean Identities",
        props: {
          videos: [
            {
              url: "https://www.youtube.com/embed/W6GbAtk08Vo",
              title: "Fundamental Trig Identities — Kim",
            },
            {
              url: "https://www.youtube.com/embed/N-LP9O81yn4",
              title: "TR-33 — Pythagorean Trig Identities",
            },
            {
              url: "https://www.youtube.com/embed/B3JOQxj_MGs",
              title: "TR-34 — Using Pythagorean Identities",
            },
          ],
        },
      },
      {
        type: "prose",
        paragraphs: [
          "The **even/odd identities**: cos(−θ) = cos θ (cosine is even), sin(−θ) = −sin θ (sine is odd).",
          "The **angle addition formulas** are the source of all product-to-sum and double-angle formulas:",
        ],
      },
      {
        type: "callout",
        type: "theorem",
        title: "Angle Addition",
        body: "\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B \\\\ \\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B",
      },
      {
        type: "callout",
        type: "theorem",
        title: "Double Angle (from addition with A = B)",
        body: "\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta \\\\ \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1",
      },
      // Angle addition + double angle — covered in the callouts above, two instructors each
      {
        type: "viz",
        id: "VideoCarousel",
        title: "Angle Addition & Double Angle Identities",
        props: {
          videos: [
            {
              url: "https://www.youtube.com/embed/lw7UJRNJIzc",
              title: "TR-38 — Angle Sum & Difference",
            },
            {
              url: "https://www.youtube.com/embed/YHgjEac9nl4",
              title: "Sum & Difference — Kim (5 examples)",
            },
            {
              url: "https://www.youtube.com/embed/DCr6yqJfYiY",
              title: "TR-40 — Double Angle Identities",
            },
            {
              url: "https://www.youtube.com/embed/4FELR35CovM",
              title: "Double & Half Angle — Kim (9 examples)",
            },
          ],
        },
      },
      {
        type: "callout",
        type: "insight",
        title: "Where These Identities Show Up in Calculus",
        body: "\\textbf{Pythagorean: } \\sin^2+\\cos^2=1 \\text{ — simplifies } \\sec^2x \\text{ derivatives and } \\int\\!\\sin^2 x\\,dx. \\\\ \\textbf{Angle addition: } \\sin(x+h) \\text{ — essential for the limit proof of } \\tfrac{d}{dx}[\\sin x]. \\\\ \\textbf{Double angle: } \\cos^2\\theta = \\tfrac{1+\\cos 2\\theta}{2} \\text{ — power-reducing form used in } \\int\\!\\cos^2 x\\,dx.",
      },
    ],
  },

  rigor: {
    blocks: [
      {
        type: "prose",
        paragraphs: [
          "In analysis, the trig functions can be defined rigorously without reference to geometry, using power series:",
          "These series converge for all real x (the ratio test confirms this). From these definitions, one can prove all trig identities purely algebraically, and prove that the derivatives are d/dx[sin x] = cos x and d/dx[cos x] = −sin x.",
        ],
      },
      {
        type: "callout",
        type: "definition",
        title: "Power Series Definitions",
        body: "\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!} \\\\ \\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\frac{x^6}{6!} + \\cdots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}",
      },
      {
        type: "prose",
        paragraphs: [
          "The Pythagorean theorem itself has over 370 known proofs. The most beautiful is the animated rearrangement proof: four identical right triangles arranged two different ways inside the same (a+b)² square.",
        ],
      },
      {
        type: "callout",
        type: "geometric",
        title: "The Animated Pythagorean Proof",
        body: "Four identical right triangles arranged two ways inside an (a+b)² square: once showing c² in the center, once showing a² and b² side-by-side. Same total area ⟹ c² = a² + b².",
      },
      {
        type: "viz",
        id: "PythagoreanProof",
        title: "Animated Pythagorean Theorem Proof",
        mathBridge:
          "The rearrangement proof: place four identical right triangles inside a square of side $a+b$. Arrangement 1 leaves a tilted square of area $c^2$ in the center. Arrangement 2 leaves two squares of area $a^2$ and $b^2$. Same four triangles removed ⟹ $c^2 = a^2 + b^2$. Applied to the unit circle ($c=1$): $\\cos^2\\theta + \\sin^2\\theta = 1$.",
        caption:
          "Step through the rearrangement proof. Change a and b and watch the proof still hold.",
      },
      {
        type: "viz",
        id: "ImplicitDiffProof",
        title: "Proof: x² + y² = r²  →  dy/dx = −x/y",
        mathBridge:
          "The unit circle $x^2 + y^2 = 1$ is the geometric definition of $\\sin\\theta$ and $\\cos\\theta$. When calculus arrives, implicit differentiation of $x^2 + y^2 = r^2$ gives $dy/dx = -x/y$ — the slope of the circle at every point, perpendicular to the radius.",
        caption:
          "Step through the full implicit differentiation proof. Every step is justified from first principles.",
      },
      // Solving trig equations + inverse trig — both covered in this lesson
      {
        type: "viz",
        id: "VideoCarousel",
        title: "Solving Trig Equations & Inverse Trig Functions",
        props: {
          videos: [
            {
              url: "https://www.youtube.com/embed/SSsu_24dss4",
              title: "Calc I — 0.4.2 Solving Trig Equations",
            },
            {
              url: "https://www.youtube.com/embed/OMOBHc7Ct_Y",
              title: "Calc I — 5.7.1 Inverse Trig Functions",
            },
            {
              url: "https://www.youtube.com/embed/NEoG0esRWFo",
              title: "TR-21 — Domain & Range of Trig Functions",
            },
          ],
        },
      },
      {
        type: "prose",
        paragraphs: [
          "The remarkable identity e^(iθ) = cos θ + i sin θ (Euler's formula) connects trig to the complex exponential — this is used constantly in engineering and physics.",
        ],
      },
      {
        type: "callout",
        type: "theorem",
        title: "Euler's Formula",
        body: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta \\qquad \\Rightarrow \\qquad e^{i\\pi} + 1 = 0",
      },
      {
        type: "viz",
        id: "CircleAreaProof",
        title: "Why the Area of a Circle is πr²",
        mathBridge:
          "Slice the circle into $n$ equal sectors and rearrange them into a near-rectangle. As $n\\to\\infty$: width $\\to \\pi r$, height $\\to r$. Area $= \\pi r^2$. This discrete-to-continuous limit is the same idea as Riemann sums in Chapter 4.",
        caption:
          "Cut the circle into sectors and rearrange them. As sectors → ∞, the shape becomes a rectangle with area πr².",
      },
    ],
  },

  examples: [
    {
      id: "ex-trig-exact",
      title: "Finding Exact Trig Values",
      problem:
        "Find the exact values of all six trig functions at \\theta = 5\\pi/6.",
      steps: [
        {
          expression: "\\theta = \\frac{5\\pi}{6} = 150°",
          annotation: "5π/6 is in the second quadrant (between π/2 and π).",
        },
        {
          expression:
            "\\text{Reference angle: } \\pi - \\frac{5\\pi}{6} = \\frac{\\pi}{6}",
          annotation: "In Q2, reference angle = π − θ.",
        },
        {
          expression:
            "\\text{Unit circle point at } \\frac{\\pi}{6}: \\left(\\frac{\\sqrt{3}}{2}, \\frac{1}{2}\\right)",
          annotation: "Known values for π/6.",
        },
        {
          expression: "\\text{In Q2, x is negative, y is positive}",
          annotation: "Adjust signs for the quadrant.",
        },
        {
          expression:
            "\\cos\\frac{5\\pi}{6} = -\\frac{\\sqrt{3}}{2}, \\quad \\sin\\frac{5\\pi}{6} = \\frac{1}{2}",
          annotation: "",
        },
        {
          expression:
            "\\tan\\frac{5\\pi}{6} = \\frac{\\sin}{\\cos} = \\frac{1/2}{-\\sqrt{3}/2} = -\\frac{1}{\\sqrt{3}} = -\\frac{\\sqrt{3}}{3}",
          annotation: "Rationalize by multiplying by √3/√3.",
        },
        {
          expression:
            "\\csc\\frac{5\\pi}{6} = 2, \\quad \\sec\\frac{5\\pi}{6} = -\\frac{2\\sqrt{3}}{3}, \\quad \\cot\\frac{5\\pi}{6} = -\\sqrt{3}",
          annotation: "Reciprocals.",
        },
      ],
      conclusion:
        "Use: (1) find the quadrant, (2) find the reference angle, (3) look up the reference angle values, (4) apply the correct signs.",
    },
    {
      id: "ex-trig-identity-proof",
      title: "Proving a Trig Identity",
      problem: "Prove: \\dfrac{\\sin^2 x}{1 - \\cos x} = 1 + \\cos x",
      steps: [
        {
          expression: "\\text{LHS} = \\frac{\\sin^2 x}{1 - \\cos x}",
          annotation:
            "Start with the left side. We try to transform it into the right side.",
        },
        {
          expression: "= \\frac{1 - \\cos^2 x}{1 - \\cos x}",
          annotation: "Use the Pythagorean identity: sin²x = 1 − cos²x.",
        },
        {
          expression: "= \\frac{(1-\\cos x)(1+\\cos x)}{1-\\cos x}",
          annotation:
            "Factor the numerator as a difference of squares: 1 − cos²x = (1−cosx)(1+cosx).",
        },
        {
          expression: "= 1 + \\cos x",
          annotation:
            "Cancel (1 − cos x), valid when cos x ≠ 1 (i.e., x ≠ 0, 2π, ...). This equals the RHS. ∎",
        },
      ],
      conclusion:
        "Strategy for proving identities: work on one side only, use known identities, factor, and simplify.",
    },
    {
      id: "ex-solve-trig",
      title: "Solving a Trig Equation",
      problem:
        "Find all solutions to 2\\sin^2 x - \\sin x - 1 = 0 on [0, 2\\pi).",
      steps: [
        {
          expression: "2\\sin^2 x - \\sin x - 1 = 0",
          annotation: "This looks like a quadratic! Let u = sin x.",
        },
        { expression: "2u^2 - u - 1 = 0", annotation: "Quadratic in u." },
        {
          expression: "(2u + 1)(u - 1) = 0",
          annotation:
            "Factor. Check: 2u² − 2u + u − 1 = 2u(u−1) + 1(u−1) = (2u+1)(u−1). ✓",
        },
        {
          expression: "u = -\\tfrac{1}{2} \\quad \\text{or} \\quad u = 1",
          annotation: "Solve each factor.",
        },
        {
          expression:
            "\\sin x = -\\tfrac{1}{2} \\quad \\text{or} \\quad \\sin x = 1",
          annotation: "Replace u with sin x.",
        },
        {
          expression: "\\sin x = 1 \\implies x = \\frac{\\pi}{2}",
          annotation: "sin = 1 only at π/2 on [0, 2π).",
        },
        {
          expression:
            "\\sin x = -\\tfrac{1}{2} \\implies x = \\frac{7\\pi}{6} \\text{ or } x = \\frac{11\\pi}{6}",
          annotation:
            "sin = −1/2 in Q3 and Q4: reference angle π/6, so x = π + π/6 = 7π/6 and x = 2π − π/6 = 11π/6.",
        },
      ],
      conclusion: "Three solutions on [0, 2π): x = π/2, 7π/6, 11π/6.",
    },
  ],

  challenges: [
    {
      id: "ch0-trig-c1",
      difficulty: "medium",
      problem: "Prove the identity: \\tan x + \\cot x = \\sec x \\csc x",
      hint: "Convert everything to sin and cos, then combine fractions.",
      walkthrough: [
        {
          expression:
            "\\tan x + \\cot x = \\frac{\\sin x}{\\cos x} + \\frac{\\cos x}{\\sin x}",
          annotation: "Convert to sin/cos.",
        },
        {
          expression: "= \\frac{\\sin^2 x + \\cos^2 x}{\\sin x \\cos x}",
          annotation: "Combine fractions over common denominator sin x cos x.",
        },
        {
          expression: "= \\frac{1}{\\sin x \\cos x}",
          annotation: "Apply Pythagorean identity: sin²x + cos²x = 1.",
        },
        {
          expression:
            "= \\frac{1}{\\sin x} \\cdot \\frac{1}{\\cos x} = \\csc x \\sec x",
          annotation: "Split the fraction. ∎",
        },
      ],
      answer: "Proved: tan x + cot x = sec x csc x",
    },
    {
      id: "ch0-trig-c2",
      difficulty: "hard",
      problem: "Find all x \\in [0, 2\\pi) such that \\cos(2x) + \\cos(x) = 0.",
      hint: "Use the double angle formula cos(2x) = 2cos²x − 1 to get a quadratic in cos x.",
      walkthrough: [
        { expression: "\\cos(2x) + \\cos(x) = 0", annotation: "" },
        {
          expression: "(2\\cos^2 x - 1) + \\cos x = 0",
          annotation: "Apply double angle: cos(2x) = 2cos²x − 1.",
        },
        {
          expression: "2\\cos^2 x + \\cos x - 1 = 0",
          annotation: "Rearrange.",
        },
        {
          expression: "(2\\cos x - 1)(\\cos x + 1) = 0",
          annotation: "Factor.",
        },
        {
          expression:
            "\\cos x = \\tfrac{1}{2} \\quad \\text{or} \\quad \\cos x = -1",
          annotation: "Solve.",
        },
        {
          expression:
            "\\cos x = \\tfrac{1}{2} \\implies x = \\frac{\\pi}{3}, \\frac{5\\pi}{3}",
          annotation: "cos = 1/2 in Q1 and Q4.",
        },
        {
          expression: "\\cos x = -1 \\implies x = \\pi",
          annotation: "cos = −1 only at π.",
        },
      ],
      answer: "x = π/3, π, 5π/3",
    },
  ],

  crossRefs: [
    {
      lessonSlug: "functions",
      label: "Previous: Functions",
      context: "Trig functions are specific examples of functions.",
    },
    {
      lessonSlug: "exponentials",
      label: "Next: Exponentials & Logs",
      context: "The other essential family of functions for calculus.",
    },
    {
      lessonSlug: "trig-derivatives",
      label: "Future: Derivatives of Trig Functions",
      context: "Chapter 2 — we will differentiate sin and cos.",
    },
  ],

  checkpoints: [
    "read-intuition",
    "read-math",
    "completed-example-1",
    "completed-example-2",
    "solved-challenge",
  ],
};
