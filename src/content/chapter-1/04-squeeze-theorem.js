export default {
  id: 'ch1-squeeze-theorem',
  slug: 'squeeze-theorem',
  chapter: 1,
  order: 5,
  title: 'The Squeeze Theorem',
  subtitle: 'Trapping a wild function between two tame ones',
  tags: ['squeeze theorem', 'sandwich theorem', 'pinching theorem', 'sin(x)/x', 'bounded oscillation', 'comparison'],

  hook: {
    question: 'How can a function that oscillates infinitely fast still have a limit?',
    realWorldContext:
      'Consider f(x) = x·sin(1/x). As x → 0, the sin(1/x) part oscillates infinitely rapidly between −1 and +1 — it has no limit on its own. ' +
      'Yet f(x) = x·sin(1/x) is squeezed between −|x| and +|x|, both of which approach 0. Like a ball bouncing wildly inside a tunnel that narrows to a point, ' +
      'the function is forced to converge to 0 regardless of its oscillations. ' +
      'This is the **Squeeze Theorem** (also called the Sandwich or Pinching Theorem): if you can trap a function between two others that share the same limit, the trapped function must converge to that limit too. ' +
      'The most important application in all of calculus is proving that lim(x→0) sin(x)/x = 1 — a fact that underlies every derivative formula for trigonometric functions. ' +
      'Archimedes used a similar strategy 2,200 years ago: he bounded the area of a circle between inscribed and circumscribed polygons, squeezing closer and closer to πr².',
    previewVisualizationId: 'SqueezeTheorem',
  },

  intuition: {
    prose: [
      'Picture a hot dog inside a bun. As you carry the bun to your mouth, the hot dog comes along for the ride — it has no choice. It doesn\'t matter if the hot dog is wiggling, spinning, or vibrating inside the bun. If the top and bottom of the bun both arrive at the same destination, the hot dog arrives there too.',

      'Mathematically: suppose g(x) ≤ f(x) ≤ h(x) for all x near c (except possibly at c itself). If both g(x) → L and h(x) → L as x → c, then f(x) → L as well. The function f is "squeezed" between g and h.',

      'The theorem is most powerful when f(x) is too complicated to evaluate directly. Perhaps it oscillates (like sin(1/x)), or has no closed-form simplification. But if you can find simpler functions g and h that bound f from below and above, and both converge to the same limit, you\'re done.',

      '**The standard pattern**: if q(x) is bounded (|q(x)| ≤ M for some constant M) and p(x) → 0, then p(x)·q(x) → 0. This is because −M·|p(x)| ≤ p(x)·q(x) ≤ M·|p(x)|, and both bounds → 0. This handles cases like x·sin(1/x), x²·cos(1/x), and √x·sin(1/x).',

      'Harold Jacobs likened this to a child walking between two parents who both turn into a doorway: the child enters the doorway too, no matter how much they zigzag. The key insight is that the child\'s freedom shrinks to zero — the two boundaries converge to the same point, leaving no room for anything else.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Bounded Functions (from Precalculus)',
        body: '−1 ≤ sin(θ) ≤ 1 and −1 ≤ cos(θ) ≤ 1 for ALL θ. These are the bounds you\'ll use most often. Also: |sin(θ)| ≤ 1, |cos(θ)| ≤ 1. Any time you see sin or cos multiplied by something going to 0, the Squeeze Theorem likely applies.',
      },
      {
        type: 'intuition',
        title: 'The Squeeze Theorem in One Line',
        body: 'If g(x) ≤ f(x) ≤ h(x) near c, and lim g = lim h = L, then lim f = L. The function f has nowhere to go except L.',
      },
      {
        type: 'history',
        title: 'Archimedes\' Method of Exhaustion (250 BC)',
        body: 'Archimedes computed the area of a circle by inscribing and circumscribing regular polygons. A hexagon (6 sides) gives a crude bound: 3r² < πr² < 2√3·r². A 96-gon gives 3.1408r² < πr² < 3.1429r². As the number of sides increases, both bounds approach πr², squeezing the circle\'s area to exactly πr². This IS the Squeeze Theorem, 2,000 years before it was formalized.',
      },
      {
        type: 'misconception',
        title: 'The Two Bounds Must Have the SAME Limit',
        body: 'The Squeeze Theorem requires lim g = lim h = L (the SAME value). If the lower bound → 2 and the upper bound → 5, you know f\'s limit is between 2 and 5, but you can\'t determine it exactly. The squeezing only works when the bounds converge to a single point.',
      },
      {
        type: 'geometric',
        title: 'Arc-Chord Squeeze Behind sin(x)/x',
        body: 'For small central angle x, the chord length and arc length become nearly equal. Combined with unit-circle area inequalities, this geometric squeeze drives cos(x) ≤ sin(x)/x ≤ 1 and therefore lim sin(x)/x = 1.',
      },
      {
        type: 'real-world',
        title: 'GPS Accuracy: Squeezing Position',
        body: 'A GPS receiver computes position from satellite signals. Each satellite gives a range estimate with error bounds: you\'re between 100.2 km and 100.8 km from satellite A. With more satellites, the bounds tighten: 100.45 to 100.55, then 100.49 to 100.51. As the upper and lower bounds converge, your position is squeezed to a point. This is triangulation viewed as a Squeeze Theorem application.',
      },
    ],
    visualizations: [
      {
        id: 'SqueezeTheorem',
        props: {},
        title: 'The Squeeze in Action',
        mathBridge: 'Here $f(x) = x\\sin(1/x)$. Since $|\\sin(\\theta)| \\leq 1$ for all $\\theta$, we have $-|x| \\leq x\\sin(1/x) \\leq |x|$. Both bounds $g(x)=-|x|$ and $h(x)=|x|$ satisfy $\\lim_{x\\to 0}g(x)=0$ and $\\lim_{x\\to 0}h(x)=0$. By the Squeeze Theorem: $\\lim_{x\\to 0} x\\sin(1/x)=0$, even though $\\sin(1/x)$ has no limit at all.',
        caption: 'The red function oscillates wildly, but it\'s trapped between the green upper and blue lower bounds. As x → 0, both bounds → 0, so the red function must also → 0. Watch the ε-band narrow to nothing.',
      },
    ],
  },

  math: {
    prose: [
      'The formal statement uses the concepts from the ε-δ lesson:',

      '**Squeeze Theorem**: Suppose g(x) ≤ f(x) ≤ h(x) for all x in some open interval containing c (except possibly at c itself). If lim(x→c) g(x) = L and lim(x→c) h(x) = L, then lim(x→c) f(x) = L.',

      '**Proof using ε-δ**: Given ε > 0. Since lim g(x) = L, ∃δ₁: 0 < |x−c| < δ₁ ⟹ |g(x)−L| < ε, which means L−ε < g(x) < L+ε. Since lim h(x) = L, ∃δ₂: 0 < |x−c| < δ₂ ⟹ L−ε < h(x) < L+ε. Let δ = min(δ₁, δ₂). Then for 0 < |x−c| < δ: L−ε < g(x) ≤ f(x) ≤ h(x) < L+ε, so |f(x)−L| < ε. ∎',

      'This proof is elegant: the squeeze hypothesis g ≤ f ≤ h, combined with g and h being within ε of L, forces f to be within ε of L. No information about f itself is needed — the bounds do all the work.',

      '**The most important limit in calculus**: lim(x→0) sin(x)/x = 1. This cannot be proved by algebra alone (you cannot cancel the x). It requires a geometric argument:',

      'On the unit circle with angle 0 < x < π/2: the area of the inscribed triangle is (1/2)sin(x). The area of the circular sector is (1/2)x. The area of the circumscribed triangle is (1/2)tan(x). Since the inscribed triangle fits inside the sector, which fits inside the circumscribed triangle:',
      '(1/2)sin(x) ≤ (1/2)x ≤ (1/2)tan(x)',

      'Dividing by (1/2)sin(x) > 0: 1 ≤ x/sin(x) ≤ 1/cos(x). Inverting (and flipping inequalities): cos(x) ≤ sin(x)/x ≤ 1.',

      'As x → 0⁺: cos(x) → 1 and 1 → 1. By the Squeeze Theorem: sin(x)/x → 1. Since sin(x)/x is an even function [sin(−x)/(−x) = sin(x)/x], the limit from the left also equals 1. ∎',

      'This one result unlocks every trig derivative: d/dx[sin x] = cos x, d/dx[cos x] = −sin x, and all the rest follow from it.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Squeeze Theorem',
        body: '\\text{If } g(x) \\leq f(x) \\leq h(x) \\text{ near } c, \\text{ and } \\lim_{x \\to c} g(x) = L = \\lim_{x \\to c} h(x), \\\\ \\text{then } \\lim_{x \\to c} f(x) = L.',
      },
      {
        type: 'theorem',
        title: 'The Fundamental Trig Limit',
        body: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\text{(proved by squeezing: } \\cos x \\leq \\frac{\\sin x}{x} \\leq 1 \\text{)}',
      },
      {
        type: 'tip',
        title: 'The "Bounded × Vanishing" Pattern',
        body: 'If |q(x)| ≤ M (bounded) and p(x) → 0 (vanishing), then p(x)·q(x) → 0. Proof: −M|p| ≤ pq ≤ M|p|, both bounds → 0. This one pattern handles most Squeeze Theorem problems: x·sin(1/x), x²·cos(πx), e^(−1/x²)·sin(1/x), etc.',
      },
    ],
    visualizations: [
      {
        id: 'SqueezeTheorem',
        props: { showTrigProof: true },
        title: 'The sin(x)/x Geometric Proof',
        caption: 'Drag the angle x on the unit circle. The inscribed triangle (area = sin x/2), the sector (area = x/2), and the circumscribed triangle (area = tan x/2) establish: cos x ≤ sin(x)/x ≤ 1. As x → 0, both bounds → 1.',
      },
      {
        id: 'ArcChordLimit',
        title: 'Micro-Geometry View: Arc vs Chord',
        caption: 'This zoomed view complements the area proof: as x → 0, chord/arc → 1, reinforcing why small-angle trig ratios settle to 1.',
      },
    ],
  },

  rigor: {
    prose: [
      'The second fundamental trig limit follows from the first:',

      'lim(x→0) (1 − cos x)/x = 0.',

      'Proof: Multiply numerator and denominator by (1 + cos x):',
      '(1−cos x)/x · (1+cos x)/(1+cos x) = (1−cos²x)/[x(1+cos x)] = sin²x/[x(1+cos x)]',
      '= [sin(x)/x] · [sin(x)/(1+cos x)]',

      'As x → 0: sin(x)/x → 1 (by the first fundamental limit), and sin(x)/(1+cos x) → 0/2 = 0.',

      'Product: 1 · 0 = 0. ∎',

      'These two limits — lim sin(x)/x = 1 and lim (1−cos x)/x = 0 — are the twin pillars of trigonometric calculus. Every trig derivative proof requires them. They connect geometry (areas on the unit circle) to algebra (limit computations) through the Squeeze Theorem. This is a beautiful example of what Harold Jacobs called "mathematics as a seamless whole" — geometry and analysis working together.',

      'Historically, the sin(x)/x limit appears implicitly in Euler\'s work on infinite series (1748) and was made rigorous by Cauchy (1821). The geometric proof via areas on the unit circle is attributed to several mathematicians; it became standard in calculus textbooks by the late 19th century.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Two Fundamental Trig Limits',
        body: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\text{and} \\qquad \\lim_{x \\to 0} \\frac{1-\\cos x}{x} = 0',
      },
      {
        type: 'history',
        title: 'Euler\'s Hidden Use of sin(x)/x (1748)',
        body: 'In "Introductio in analysin infinitorum" (1748), Leonhard Euler derived the infinite product formula sin(x) = x(1−x²/π²)(1−x²/4π²)(1−x²/9π²)... — which implicitly assumes lim sin(x)/x = 1 (since dividing both sides by x and setting x=0 gives 1 = 1·1·1·...). He used this to solve the Basel problem: Σ1/n² = π²/6. The sin(x)/x limit is quietly woven into some of mathematics\' greatest results.',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-squeeze-basic',
      title: 'Squeezing x·sin(1/x) to 0',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} x\\sin\\!\\left(\\frac{1}{x}\\right).',
      steps: [
        { expression: '|\\sin(1/x)| \\leq 1 \\quad \\text{for all } x \\neq 0', annotation: 'The sine function is bounded between −1 and 1, always. This is the key observation.' },
        { expression: '-|x| \\leq x\\sin(1/x) \\leq |x|', annotation: 'Multiply the bound by |x|: since |sin(1/x)| ≤ 1, the product is between −|x| and |x|.' },
        { expression: '\\lim_{x \\to 0}(-|x|) = 0 \\quad \\text{and} \\quad \\lim_{x \\to 0}|x| = 0', annotation: 'Both bounds approach 0 as x → 0.' },
        { expression: '\\text{By the Squeeze Theorem: } \\lim_{x \\to 0} x\\sin(1/x) = 0', annotation: 'The function is trapped between two bounds that both converge to 0.' },
      ],
      conclusion: 'Even though sin(1/x) oscillates infinitely rapidly as x → 0, the factor x shrinks the oscillation amplitude to zero. The Squeeze Theorem captures this precisely: "bounded times vanishing equals vanishing."',
    },
    {
      id: 'ex-squeeze-quadratic',
      title: 'Squeezing x²·cos(1/x²) to 0',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} x^2\\cos\\!\\left(\\frac{1}{x^2}\\right).',
      steps: [
        { expression: '|\\cos(1/x^2)| \\leq 1 \\quad \\text{for all } x \\neq 0', annotation: 'Cosine is bounded, just like sine.' },
        { expression: '-x^2 \\leq x^2\\cos(1/x^2) \\leq x^2', annotation: 'Since |cos(1/x²)| ≤ 1 and x² ≥ 0.' },
        { expression: '\\lim_{x \\to 0}(-x^2) = 0 = \\lim_{x \\to 0} x^2', annotation: '' },
        { expression: '\\text{Squeeze: } \\lim_{x \\to 0} x^2\\cos(1/x^2) = 0', annotation: '' },
      ],
      conclusion: 'The quadratic x² damps the oscillation even faster than x does. In general, x^n · (bounded function) → 0 for any n > 0.',
    },
    {
      id: 'ex-sin-over-x',
      title: 'The Most Important Limit: sin(x)/x → 1 (Full Geometric Proof)',
      problem: 'Prove that \\displaystyle\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1.',
      steps: [
        { expression: '\\text{Consider a unit circle with central angle } 0 < x < \\pi/2.', annotation: 'We\'ll compare three areas: inscribed triangle, circular sector, and circumscribed triangle.' },
        { expression: '\\text{Area of inscribed triangle} = \\frac{1}{2}\\sin x', annotation: 'Base = 1 (radius), height = sin(x). Triangle fits inside the sector.' },
        { expression: '\\text{Area of sector} = \\frac{1}{2}x', annotation: 'A fraction x/(2π) of the full circle area π(1)² = π, so area = x/2.' },
        { expression: '\\text{Area of circumscribed triangle} = \\frac{1}{2}\\tan x', annotation: 'Base = 1, height = tan(x). The sector fits inside this larger triangle.' },
        { expression: '\\frac{1}{2}\\sin x \\leq \\frac{1}{2}x \\leq \\frac{1}{2}\\tan x', annotation: 'The three regions are nested: inscribed ⊆ sector ⊆ circumscribed.' },
        { expression: '\\sin x \\leq x \\leq \\tan x = \\frac{\\sin x}{\\cos x}', annotation: 'Multiply through by 2. Use tan x = sin x / cos x.' },
        { expression: '1 \\leq \\frac{x}{\\sin x} \\leq \\frac{1}{\\cos x}', annotation: 'Divide everything by sin x (positive for 0 < x < π/2).' },
        { expression: '\\cos x \\leq \\frac{\\sin x}{x} \\leq 1', annotation: 'Invert all three expressions (flipping the inequality direction).' },
        { expression: '\\lim_{x \\to 0^+} \\cos x = 1 \\quad \\text{and} \\quad \\lim_{x \\to 0^+} 1 = 1', annotation: 'Both bounds approach 1 from the same side.' },
        { expression: '\\text{By Squeeze: } \\lim_{x \\to 0^+} \\frac{\\sin x}{x} = 1', annotation: '' },
        { expression: '\\frac{\\sin(-x)}{-x} = \\frac{-\\sin x}{-x} = \\frac{\\sin x}{x} \\implies \\lim_{x \\to 0^-} \\frac{\\sin x}{x} = 1', annotation: 'sin(x)/x is an even function, so the left-hand limit equals the right-hand limit.' },
      ],
      conclusion: 'lim(x→0) sin(x)/x = 1. This is arguably the most important limit in calculus. Every derivative of a trig function traces back to it: the proof that d/dx[sin x] = cos x uses this limit in its last step. Without the Squeeze Theorem, we couldn\'t prove it — and without it, we couldn\'t do trig calculus.',
    },
    {
      id: 'ex-squeeze-engineering',
      title: 'Physics: Small-Angle Pendulum (the sin θ ≈ θ Approximation)',
      problem: 'A simple pendulum of length L satisfies the exact equation of motion d²θ/dt² = −(g/L)sin(θ). For small angles, physicists replace sin(θ) with θ. Use the Squeeze Theorem to justify this approximation and estimate the error.',
      steps: [
        { expression: '\\cos\\theta \\leq \\frac{\\sin\\theta}{\\theta} \\leq 1 \\quad \\text{for } 0 < \\theta < \\pi/2', annotation: 'This is the inequality we just proved.' },
        { expression: '\\theta\\cos\\theta \\leq \\sin\\theta \\leq \\theta', annotation: 'Multiply through by θ > 0.' },
        { expression: '\\text{For } \\theta = 10° = 0.1745 \\text{ rad: } \\sin(0.1745) = 0.17365', annotation: 'Compute exact and approximate values.' },
        { expression: '\\text{Small-angle approximation: } \\sin\\theta \\approx \\theta = 0.1745', annotation: 'The approximation sin θ ≈ θ gives 0.1745.' },
        { expression: '\\text{Error: } |0.1745 - 0.17365| = 0.00085 \\approx 0.5\\%', annotation: 'Less than 1% error at 10°!' },
        { expression: '\\text{At } \\theta = 30° = 0.5236 \\text{ rad: error} \\approx 4.7\\%', annotation: 'The approximation worsens for larger angles.' },
        { expression: '\\sin\\theta \\approx \\theta \\implies \\frac{d^2\\theta}{dt^2} \\approx -\\frac{g}{L}\\theta', annotation: 'Replace sin θ with θ in the pendulum equation.' },
        { expression: '\\text{Solution: } \\theta(t) = \\theta_0 \\cos\\!\\left(\\sqrt{g/L}\\;t\\right)', annotation: 'Simple harmonic motion with period T = 2π√(L/g).' },
      ],
      conclusion: 'The Squeeze Theorem justifies the physics approximation sin θ ≈ θ for small θ: since cos θ ≤ sin(θ)/θ ≤ 1 and cos θ → 1, the ratio sin(θ)/θ → 1, meaning sin θ and θ become indistinguishable for small angles. The resulting pendulum formula T = 2π√(L/g) is one of the most famous results in physics — and it rests entirely on the Squeeze Theorem.',
    },
  ],

  challenges: [
    {
      id: 'ch1-sq-c1',
      difficulty: 'easy',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} x^2\\sin\\!\\left(\\frac{1}{x}\\right).',
      hint: '−x² ≤ x²sin(1/x) ≤ x². Both bounds → 0.',
      walkthrough: [
        { expression: '-x^2 \\leq x^2\\sin(1/x) \\leq x^2', annotation: 'Since |sin(1/x)| ≤ 1 and x² ≥ 0.' },
        { expression: '\\lim_{x \\to 0}(-x^2) = 0 = \\lim_{x \\to 0} x^2', annotation: '' },
        { expression: '\\text{Squeeze: limit} = 0', annotation: '' },
      ],
      answer: '0',
    },
    {
      id: 'ch1-sq-c2',
      difficulty: 'medium',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}.',
      hint: 'Write sin(5x)/x = 5 · sin(5x)/(5x). Let u = 5x.',
      walkthrough: [
        { expression: '\\frac{\\sin(5x)}{x} = 5 \\cdot \\frac{\\sin(5x)}{5x}', annotation: 'Force the sin(u)/u pattern by multiplying and dividing by 5.' },
        { expression: '\\text{Let } u = 5x. \\text{ As } x \\to 0, u \\to 0.', annotation: '' },
        { expression: '5 \\cdot \\lim_{u \\to 0} \\frac{\\sin u}{u} = 5 \\cdot 1 = 5', annotation: 'Apply the fundamental trig limit.' },
      ],
      answer: '5',
    },
    {
      id: 'ch1-sq-c3',
      difficulty: 'hard',
      problem: 'Evaluate \\displaystyle\\lim_{x \\to 0} \\frac{\\tan x - \\sin x}{x^3}.',
      hint: 'Write tan x − sin x = sin x(1/cos x − 1) = sin x · (1 − cos x)/cos x. Then use (sin x/x) · (1−cos x)/x² · (1/cos x) and the identity (1−cos x)/x² → 1/2.',
      walkthrough: [
        { expression: '\\tan x - \\sin x = \\sin x \\left(\\frac{1}{\\cos x} - 1\\right) = \\frac{\\sin x(1-\\cos x)}{\\cos x}', annotation: 'Factor sin x.' },
        { expression: '\\frac{\\tan x - \\sin x}{x^3} = \\frac{\\sin x}{x} \\cdot \\frac{1-\\cos x}{x^2} \\cdot \\frac{1}{\\cos x}', annotation: 'Split into three factors.' },
        { expression: '\\lim \\frac{\\sin x}{x} = 1', annotation: 'Fundamental trig limit.' },
        { expression: '\\lim \\frac{1-\\cos x}{x^2} = \\frac{1}{2}', annotation: 'This follows from (1−cos x)/x² = [1−cos x]/x · 1/x, using the conjugate trick or L\'Hôpital.' },
        { expression: '\\lim \\frac{1}{\\cos x} = 1', annotation: 'cos(0) = 1.' },
        { expression: '\\text{Product: } 1 \\cdot \\frac{1}{2} \\cdot 1 = \\frac{1}{2}', annotation: '' },
      ],
      answer: '1/2',
    },
  ],

  crossRefs: [
    { lessonSlug: 'epsilon-delta', label: 'Previous: ε-δ Definition', context: 'The Squeeze Theorem is proved using the ε-δ definition.' },
    { lessonSlug: 'fundamental-trig-limits', label: 'Deep Dive: Fundamental Trig Limits', context: 'Use the dedicated lesson for a slower, pattern-first study track of the two trig pillars.' },
    { lessonSlug: 'limit-laws', label: 'See Also: Limit Laws', context: 'The Squeeze Theorem is used alongside the limit laws for computation.' },
    { lessonSlug: 'limits-at-infinity', label: 'Next: Limits at Infinity', context: 'The Squeeze Theorem also applies to limits as x → ∞.' },
    { lessonSlug: 'trig-derivatives', label: 'Essential For: Trig Derivatives', context: 'The proof that d/dx[sin x] = cos x uses lim sin(x)/x = 1.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],
}
