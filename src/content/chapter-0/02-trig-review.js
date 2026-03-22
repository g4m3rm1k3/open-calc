export default {
  id: 'ch0-trig',
  slug: 'trig-review',
  chapter: 0,
  order: 2,
  title: 'Trigonometry',
  subtitle: 'Circles, angles, and the most important functions in calculus',
  tags: ['trigonometry', 'sine', 'cosine', 'tangent', 'unit circle', 'radians', 'identities', 'inverse trig'],

  hook: {
    question: 'Why is the height of a point on a Ferris wheel a sine wave?',
    realWorldContext:
      'A Ferris wheel with radius 1 centered at the origin: after rotating by angle θ from the rightmost point, ' +
      'your height above the center is exactly sin(θ). Not approximately — exactly. ' +
      'Sound waves, light waves, AC electricity, ocean tides, pendulums, spring oscillations — they\'re all sine waves. ' +
      'The trig functions are woven into the fabric of the physical universe, and you\'ll use them constantly in calculus.',
    previewVisualizationId: 'UnitCircle',
  },

  intuition: {
    prose: [
      'Start with a circle of radius 1 centered at the origin — the **unit circle**. ' +
      'Pick any angle θ measured counterclockwise from the positive x-axis. ' +
      'The point where the terminal ray hits the circle has coordinates (cos θ, sin θ). Full stop. ' +
      'That\'s the definition. Everything else follows from this.',
      'Think of cos θ as the **horizontal shadow** and sin θ as the **vertical shadow** that the unit-circle point casts.',
      'As θ increases from 0 to 2π (one full revolution), the point traces the whole circle. ' +
      'cos θ starts at 1, decreases to 0 at π/2, hits −1 at π, returns to 0 at 3π/2, and comes back to 1 at 2π. ' +
      'sin θ starts at 0, rises to 1 at π/2, returns to 0 at π, dips to −1 at 3π/2, and comes back to 0 at 2π.',
      'Angles in calculus are measured in **radians**, not degrees. ' +
      '2π radians = 360°. One radian is the angle that cuts off an arc equal to the radius. ' +
      'Radians make calculus formulas clean (derivatives of sin and cos have no ugly conversion factors). ' +
      'Even deeper: radian measure is literally a length ratio, $\theta = s/r$. It is geometry and analysis fused together.',
      'Arc-vs-chord intuition that feeds directly into limits: for small angles, the arc length and chord length become almost identical. ' +
      'That geometric squeeze is one of the hidden engines behind why $\sin(x)/x \to 1$ as $x \to 0$.',
      'The Pythagorean theorem — a² + b² = c² — underpins all of trigonometry. ' +
      'The unit circle equation is x² + y² = 1, which is just Pythagoras applied to a right triangle with hypotenuse 1. ' +
      'From this, sin²θ + cos²θ = 1 follows immediately. That one identity generates all others.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'The Pythagorean Theorem',
        body: 'In a right triangle with legs a and b and hypotenuse c: a² + b² = c². You may have proved this using areas of squares drawn on each side, or using similar triangles. In trigonometry, applied to the unit circle (hypotenuse = 1), this becomes sin²θ + cos²θ = 1 — the most important trig identity.',
      },
      {
        type: 'intuition',
        title: 'Why Radians?',
        body: 'd/dx[sin x] = cos x only when x is in radians. In degrees, you get an ugly factor of π/180.',
      },
      {
        type: 'tip',
        title: 'Key Values to Memorize',
        body: 'sin(0)=0, sin(π/6)=1/2, sin(π/4)=√2/2, sin(π/3)=√3/2, sin(π/2)=1',
      },
      {
        type: 'misconception',
        title: 'sin(a + b) ≠ sin(a) + sin(b)',
        body: "This is one of the most common algebra errors in calculus. sin(30° + 60°) = sin(90°) = 1, but sin(30°) + sin(60°) = 0.5 + 0.866 = 1.366. The correct expansion is sin(a+b) = sin(a)cos(b) + cos(a)sin(b).",
      },
      {
        type: 'geometric',
        title: 'Similar Triangles Explain Trig Ratios',
        body: 'sin, cos, and tan are shape invariants: all right triangles with the same angle are similar, so opposite/hypotenuse and opposite/adjacent stay constant across scale.',
      },
      {
        type: 'geometric',
        title: 'Inscribed Angle Theorem (Circle Geometry Core)',
        body: 'An inscribed angle subtending an arc has half the measure of the central angle subtending the same arc. This theorem is a backbone fact for circle proofs and later appears in geometric derivations of trig limits and periodic phenomena.',
      },
    ],
    visualizations: [
      {
        id: 'UnitCircle',
        props: { animate: false },
        title: 'Interactive Unit Circle',
        mathBridge: 'The unit circle defines sine and cosine for every angle: the point at angle $\\theta$ has coordinates $(\\cos\\theta, \\sin\\theta)$. This is not a formula to memorize — it is the definition. The Pythagorean identity $\\sin^2\\theta + \\cos^2\\theta = 1$ follows immediately from $x^2 + y^2 = 1$ (the unit circle equation). Every trig identity can be derived from this single picture.',
        caption: 'Drag the angle slider to watch sin(θ) and cos(θ) trace out as the point moves around the circle.',
      },
      {
        id: 'SineUnwrap',
        title: 'The Unit Circle Unwraps into the Sine Wave',
        mathBridge: 'As angle $\\theta$ increases, the $y$-coordinate of the unit-circle point traces $\\sin\\theta$. Plotting that $y$-value against $\\theta$ "unwraps" the circular motion into a wave. This is the geometric reason sine is periodic with period $2\\pi$: one full revolution of the circle ($\\theta$ increases by $2\\pi$) returns the point to its starting position, so $\\sin(\\theta + 2\\pi) = \\sin\\theta$ for all $\\theta$.',
        caption: 'The vertical height of the point on the unit circle, plotted against angle, traces the sine curve.',
      },
      {
        id: 'ArcChordLimit',
        title: 'Arc vs Chord for Tiny Angles',
        mathBridge: 'Arc length $= r\\theta$ (radian definition). Chord length $= 2r\\sin(\\theta/2)$. Their ratio: $\\frac{\\text{chord}}{\\text{arc}} = \\frac{2\\sin(\\theta/2)}{\\theta} = \\frac{\\sin(\\theta/2)}{\\theta/2}$. As $\\theta\\to 0$ this ratio $\\to 1$, the same fact as $\\lim_{u\\to 0}\\frac{\\sin u}{u}=1$. At small angles, arc and chord are interchangeable — this geometric fact reappears every time you prove a trig limit or derive a trig derivative.',
        caption: 'As θ shrinks, arc and chord lengths converge — the geometry behind sin(x)/x → 1.',
      },
      {
        id: 'TriangleAreaProof',
        title: 'Why Triangle Area = ½ab sin C',
        mathBridge: 'For a triangle with sides $a$, $b$ and included angle $C$: the height from one vertex to the opposite side is $h = b\\sin C$. Area $= \\frac{1}{2}\\cdot\\text{base}\\cdot\\text{height} = \\frac{1}{2}a\\cdot b\\sin C$. This formula connects triangle geometry directly to sine, and it is the starting point for the Law of Sines ($\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}$) and the trig area integral $\\int_0^{2\\pi}\\frac{1}{2}r^2\\,d\\theta$.',
        caption: 'Watch how two copies of the triangle tile a parallelogram, proving Area = ½ab sin C.',
      },
    ],
  },

  math: {
    prose: [
      'The six trig functions are defined as:',
      'sin θ and cos θ come directly from the unit circle. The rest are ratios:',
      '**Degrees ↔ Radians**: multiply by π/180 to convert degrees to radians.',
      'The **Pythagorean Identity** is the most important trig identity — it follows directly from the unit circle equation x² + y² = 1:',
      'From the Pythagorean identity, we derive two others by dividing through by cos²θ or sin²θ.',
      'The **even/odd identities**: cos(−θ) = cos θ (cosine is even), sin(−θ) = −sin θ (sine is odd).',
      'The **angle addition formulas** are the source of all product-to-sum and double-angle formulas:',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Six Trig Functions',
        body: '\\sin\\theta = y,\\quad \\cos\\theta = x,\\quad \\tan\\theta = \\dfrac{y}{x} \\\\ \\csc\\theta = \\dfrac{1}{y},\\quad \\sec\\theta = \\dfrac{1}{x},\\quad \\cot\\theta = \\dfrac{x}{y} \\\\ \\text{where } (x,y) \\text{ is the point on the unit circle at angle } \\theta',
      },
      {
        type: 'theorem',
        title: 'Pythagorean Identities',
        body: '\\sin^2\\theta + \\cos^2\\theta = 1 \\\\ 1 + \\tan^2\\theta = \\sec^2\\theta \\\\ 1 + \\cot^2\\theta = \\csc^2\\theta',
      },
      {
        type: 'theorem',
        title: 'Angle Addition',
        body: '\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B \\\\ \\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B',
      },
      {
        type: 'theorem',
        title: 'Double Angle (from addition with A = B)',
        body: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta \\\\ \\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta = 1 - 2\\sin^2\\theta = 2\\cos^2\\theta - 1',
      },
    ],
    visualizationId: 'UnitCircle',
    visualizationProps: { showTable: true },
  },

  rigor: {
    prose: [
      'In analysis, the trig functions can be defined rigorously without reference to geometry, using power series:',
      'These series converge for all real x (the ratio test confirms this). ' +
      'From these definitions, one can prove all trig identities purely algebraically, ' +
      'and prove that the derivatives are d/dx[sin x] = cos x and d/dx[cos x] = −sin x.',
      'The Pythagorean theorem itself has over 370 known proofs. ' +
      'The most beautiful is the animated rearrangement proof: take four identical right triangles and arrange them two different ways inside the same (a+b)² square. ' +
      'In one arrangement, the remaining area is the tilted c² square. ' +
      'In the other, it is the two squares a² and b². ' +
      'Since the four triangles are identical in both arrangements, the remaining areas must be equal: c² = a² + b².',
      'The remarkable identity e^(iθ) = cos θ + i sin θ (Euler\'s formula) connects trig to the complex exponential — ' +
      'this is used constantly in engineering and physics.',
    ],
    callouts: [
      {
        type: 'geometric',
        title: 'The Animated Pythagorean Proof',
        body: 'Four identical right triangles arranged two ways inside an (a+b)² square: once showing c² in the center, once showing a² and b² side-by-side. Same total area ⟹ c² = a² + b².',
      },
      {
        type: 'definition',
        title: 'Power Series Definitions',
        body: '\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!} \\\\ \\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\frac{x^6}{6!} + \\cdots = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}',
      },
      {
        type: 'theorem',
        title: "Euler's Formula",
        body: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta \\qquad \\Rightarrow \\qquad e^{i\\pi} + 1 = 0',
      },
    ],
    visualizations: [
      {
        id: 'PythagoreanProof',
        title: 'Animated Pythagorean Theorem Proof',
        mathBridge: 'The rearrangement proof: place four identical right triangles (legs $a$, $b$; hypotenuse $c$) inside a square of side $a+b$. Arrangement 1 leaves a tilted square of area $c^2$ in the center. Arrangement 2 leaves two squares of area $a^2$ and $b^2$. Both arrangements have the same four triangles removed from the same total area, so $c^2 = a^2 + b^2$. Applied to the unit circle ($c=1$): $\\cos^2\\theta + \\sin^2\\theta = 1$ — the Pythagorean identity.',
        caption: 'Step through the rearrangement proof. Change a and b and watch the proof still hold.',
      },
      {
        id: 'CircleAreaProof',
        title: 'Why the Area of a Circle is πr²',
        mathBridge: 'Slice the circle into $n$ equal sectors and rearrange them alternating up/down into a near-rectangle. As $n\\to\\infty$: the width approaches half the circumference $= \\pi r$, the height approaches the radius $r$. Area of rectangle $= \\pi r \\cdot r = \\pi r^2$. This is a discrete approximation becoming exact in the limit — precisely the idea behind Riemann sums and integration that appears in Chapter 4.',
        caption: 'Cut the circle into sectors and rearrange them. As the number of sectors → ∞, the shape becomes a rectangle with area πr².',
      },
    ],
  },

  examples: [
    {
      id: 'ex-trig-exact',
      title: 'Finding Exact Trig Values',
      problem: 'Find the exact values of all six trig functions at \\theta = 5\\pi/6.',
      steps: [
        { expression: '\\theta = \\frac{5\\pi}{6} = 150°', annotation: '5π/6 is in the second quadrant (between π/2 and π).' },
        { expression: '\\text{Reference angle: } \\pi - \\frac{5\\pi}{6} = \\frac{\\pi}{6}', annotation: 'In Q2, reference angle = π − θ.' },
        { expression: '\\text{Unit circle point at } \\frac{\\pi}{6}: \\left(\\frac{\\sqrt{3}}{2}, \\frac{1}{2}\\right)', annotation: 'Known values for π/6.' },
        { expression: '\\text{In Q2, x is negative, y is positive}', annotation: 'Adjust signs for the quadrant.' },
        { expression: '\\cos\\frac{5\\pi}{6} = -\\frac{\\sqrt{3}}{2}, \\quad \\sin\\frac{5\\pi}{6} = \\frac{1}{2}', annotation: '' },
        { expression: '\\tan\\frac{5\\pi}{6} = \\frac{\\sin}{\\cos} = \\frac{1/2}{-\\sqrt{3}/2} = -\\frac{1}{\\sqrt{3}} = -\\frac{\\sqrt{3}}{3}', annotation: 'Rationalize by multiplying by √3/√3.' },
        { expression: '\\csc\\frac{5\\pi}{6} = 2, \\quad \\sec\\frac{5\\pi}{6} = -\\frac{2\\sqrt{3}}{3}, \\quad \\cot\\frac{5\\pi}{6} = -\\sqrt{3}', annotation: 'Reciprocals.' },
      ],
      conclusion: 'Use: (1) find the quadrant, (2) find the reference angle, (3) look up the reference angle values, (4) apply the correct signs.',
    },
    {
      id: 'ex-trig-identity-proof',
      title: 'Proving a Trig Identity',
      problem: 'Prove: \\dfrac{\\sin^2 x}{1 - \\cos x} = 1 + \\cos x',
      steps: [
        { expression: '\\text{LHS} = \\frac{\\sin^2 x}{1 - \\cos x}', annotation: 'Start with the left side. We try to transform it into the right side.' },
        { expression: '= \\frac{1 - \\cos^2 x}{1 - \\cos x}', annotation: 'Use the Pythagorean identity: sin²x = 1 − cos²x.' },
        { expression: '= \\frac{(1-\\cos x)(1+\\cos x)}{1-\\cos x}', annotation: 'Factor the numerator as a difference of squares: 1 − cos²x = (1−cosx)(1+cosx).' },
        { expression: '= 1 + \\cos x', annotation: 'Cancel (1 − cos x), valid when cos x ≠ 1 (i.e., x ≠ 0, 2π, ...). This equals the RHS. ∎' },
      ],
      conclusion: 'Strategy for proving identities: work on one side only, use known identities, factor, and simplify.',
    },
    {
      id: 'ex-solve-trig',
      title: 'Solving a Trig Equation',
      problem: 'Find all solutions to 2\\sin^2 x - \\sin x - 1 = 0 on [0, 2\\pi).',
      steps: [
        { expression: '2\\sin^2 x - \\sin x - 1 = 0', annotation: 'This looks like a quadratic! Let u = sin x.' },
        { expression: '2u^2 - u - 1 = 0', annotation: 'Quadratic in u.' },
        { expression: '(2u + 1)(u - 1) = 0', annotation: 'Factor. Check: 2u² − 2u + u − 1 = 2u(u−1) + 1(u−1) = (2u+1)(u−1). ✓' },
        { expression: 'u = -\\tfrac{1}{2} \\quad \\text{or} \\quad u = 1', annotation: 'Solve each factor.' },
        { expression: '\\sin x = -\\tfrac{1}{2} \\quad \\text{or} \\quad \\sin x = 1', annotation: 'Replace u with sin x.' },
        { expression: '\\sin x = 1 \\implies x = \\frac{\\pi}{2}', annotation: 'sin = 1 only at π/2 on [0, 2π).' },
        { expression: '\\sin x = -\\tfrac{1}{2} \\implies x = \\frac{7\\pi}{6} \\text{ or } x = \\frac{11\\pi}{6}', annotation: 'sin = −1/2 in Q3 and Q4: reference angle π/6, so x = π + π/6 = 7π/6 and x = 2π − π/6 = 11π/6.' },
      ],
      conclusion: 'Three solutions on [0, 2π): x = π/2, 7π/6, 11π/6.',
    },
  ],

  challenges: [
    {
      id: 'ch0-trig-c1',
      difficulty: 'medium',
      problem: 'Prove the identity: \\tan x + \\cot x = \\sec x \\csc x',
      hint: 'Convert everything to sin and cos, then combine fractions.',
      walkthrough: [
        { expression: '\\tan x + \\cot x = \\frac{\\sin x}{\\cos x} + \\frac{\\cos x}{\\sin x}', annotation: 'Convert to sin/cos.' },
        { expression: '= \\frac{\\sin^2 x + \\cos^2 x}{\\sin x \\cos x}', annotation: 'Combine fractions over common denominator sin x cos x.' },
        { expression: '= \\frac{1}{\\sin x \\cos x}', annotation: 'Apply Pythagorean identity: sin²x + cos²x = 1.' },
        { expression: '= \\frac{1}{\\sin x} \\cdot \\frac{1}{\\cos x} = \\csc x \\sec x', annotation: 'Split the fraction. ∎' },
      ],
      answer: 'Proved: tan x + cot x = sec x csc x',
    },
    {
      id: 'ch0-trig-c2',
      difficulty: 'hard',
      problem: 'Find all x \\in [0, 2\\pi) such that \\cos(2x) + \\cos(x) = 0.',
      hint: 'Use the double angle formula cos(2x) = 2cos²x − 1 to get a quadratic in cos x.',
      walkthrough: [
        { expression: '\\cos(2x) + \\cos(x) = 0', annotation: '' },
        { expression: '(2\\cos^2 x - 1) + \\cos x = 0', annotation: 'Apply double angle: cos(2x) = 2cos²x − 1.' },
        { expression: '2\\cos^2 x + \\cos x - 1 = 0', annotation: 'Rearrange.' },
        { expression: '(2\\cos x - 1)(\\cos x + 1) = 0', annotation: 'Factor.' },
        { expression: '\\cos x = \\tfrac{1}{2} \\quad \\text{or} \\quad \\cos x = -1', annotation: 'Solve.' },
        { expression: '\\cos x = \\tfrac{1}{2} \\implies x = \\frac{\\pi}{3}, \\frac{5\\pi}{3}', annotation: 'cos = 1/2 in Q1 and Q4.' },
        { expression: '\\cos x = -1 \\implies x = \\pi', annotation: 'cos = −1 only at π.' },
      ],
      answer: 'x = π/3, π, 5π/3',
    },
  ],

  crossRefs: [
    { lessonSlug: 'functions', label: 'Previous: Functions', context: 'Trig functions are specific examples of functions.' },
    { lessonSlug: 'exponentials', label: 'Next: Exponentials & Logs', context: 'The other essential family of functions for calculus.' },
    { lessonSlug: 'trig-derivatives', label: 'Future: Derivatives of Trig Functions', context: 'Chapter 2 — we will differentiate sin and cos.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
