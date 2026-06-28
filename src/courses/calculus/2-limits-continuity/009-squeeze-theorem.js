import squeezeUrl from '../diagrams/calc-squeeze.svg?url';
import sinxOverXUrl from '../diagrams/calc-sinx-over-x.svg?url';
import squeezeStepsUrl from '../diagrams/calc-squeeze-steps.svg?url';
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
    blocks: [
      {
        type: 'prose',
        paragraphs: [
      'Picture a hot dog inside a bun. As you carry the bun to your mouth, the hot dog comes along for the ride — it has no choice. It doesn\'t matter if the hot dog is wiggling, spinning, or vibrating inside the bun. If the top and bottom of the bun both arrive at the same destination, the hot dog arrives there too.',

      'Mathematically: suppose g(x) ≤ f(x) ≤ h(x) for all x near c (except possibly at c itself). If both g(x) → L and h(x) → L as x → c, then f(x) → L as well. The function f is "squeezed" between g and h.',

      'The theorem is most powerful when f(x) is too complicated to evaluate directly. Perhaps it oscillates (like sin(1/x)), or has no closed-form simplification. But if you can find simpler functions g and h that bound f from below and above, and both converge to the same limit, you\'re done.',
        ],
      },
      { type: 'image', src: squeezeUrl, alt: 'Three curves converging: g(x) ≤ f(x) ≤ h(x), all meeting at L', caption: 'If f is trapped between g and h, and both bounds share limit L, then f must reach L too.' },
      {
        type: 'prose',
        paragraphs: [

      '**The standard pattern**: if q(x) is bounded (|q(x)| ≤ M for some constant M) and p(x) → 0, then p(x)·q(x) → 0. This is because −M·|p(x)| ≤ p(x)·q(x) ≤ M·|p(x)|, and both bounds → 0. This handles cases like x·sin(1/x), x²·cos(1/x), and √x·sin(1/x).',
        ],
      },
      { type: 'image', src: sinxOverXUrl, alt: 'Geometric proof: area squeeze on unit circle proves sin(θ)/θ → 1', caption: 'The squeeze theorem\'s most famous use: bounding sin(x)/x between 1 and cos(x).' },
      {
        type: 'prose',
        paragraphs: [
      'Harold Jacobs likened this to a child walking between two parents who both turn into a doorway: the child enters the doorway too, no matter how much they zigzag. The key insight is that the child\'s freedom shrinks to zero — the two boundaries converge to the same point, leaving no room for anything else.',
        ],
      },
      { type: 'image', src: squeezeStepsUrl, alt: 'Sandwich visualization with three steps: find bounds, check they share a limit, conclude', caption: 'Three steps: (1) find g and h bounding f, (2) compute their shared limit, (3) conclude f → same limit.' },
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

  story: {
    title: `Archimedes' Trap`,
    subtitle: `When you can't evaluate a limit directly, trap it — squeeze it between two functions you can control, and it has nowhere else to go.`,
    acts: [
      {
        label: 'The Scene',
        title: 'The Man Who Trapped π',
        content: `The year is 250 BC. Archimedes wants to know the area of a circle with radius $r$.

He knows the answer is $\\pi r^2$. But what is $\\pi$, exactly? You cannot compute it by arithmetic. You cannot factor it. You cannot "simplify" it into something nicer. It is an irrational number hiding inside the circle, and there is no formula that spits it out directly.

So Archimedes does something that seems obvious in hindsight: he draws polygons.

He draws a regular hexagon **inside** the circle — all six corners touching the circle. He can compute the hexagon's area exactly: it is $3r^2$. The circle is definitely larger. He draws a regular hexagon **outside** the circle — all six sides tangent to the circle. That area is $2\\sqrt{3} \\, r^2 \\approx 3.46r^2$. The circle is definitely smaller. So:

$$3r^2 < \\pi r^2 < 3.46r^2$$

That is a rough bound. He switches to 96-sided polygons. Now the trap has tight jaws:

$$3.1408r^2 < \\pi r^2 < 3.1429r^2$$

He never "computes" $\\pi$. He squeezes it.

Two thousand years later, Cauchy and Weierstrass would turn this geometric instinct into a theorem. The Squeeze Theorem is Archimedes' method, promoted to limits. The strategy is always the same: when you cannot evaluate something directly, trap it between two things you can evaluate. If both traps close to the same value, the thing in between has nowhere else to go.

The most important application — the one every trig derivative depends on — is proving $\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1$. That limit cannot be proved by substitution, by algebra, or by L'Hôpital's rule. It requires Archimedes' trap. We will build it, step by step.`,
      },
      {
        label: 'Act I',
        title: 'When Direct Evaluation Fails — Bounded vs. Convergent',
        content: `Before we can trap anything, we need to understand why some functions resist direct evaluation.

**The limit laws** — substitution, product, quotient — let you evaluate most limits by plugging in $x = c$ and simplifying. They fail when:

1. The function is **undefined** at $x = c$ (numerator and denominator both zero)
2. The function **oscillates infinitely fast** as $x \\to c$

The second case is the new one. Let's look at it.

---

**$\\sin(1/x)$ near $x = 0$:**

As $x$ shrinks toward 0, the argument $1/x$ explodes:

| $x$ | $1/x$ |
|---|---|
| $0.1$ | $10$ |
| $0.01$ | $100$ |
| $0.001$ | $1{,}000$ |
| $0.0001$ | $10{,}000$ |

And $\\sin$ of a very large number keeps oscillating back and forth between $-1$ and $+1$. The function $\\sin(1/x)$ never settles — it completes infinitely many full cycles as $x \\to 0$. **$\\lim_{x \\to 0} \\sin(1/x)$ does not exist.**

---

**Bounded ≠ convergent.** This is the critical distinction.

- **Bounded** means the function stays inside some fixed interval: $|f(x)| \\leq M$ for all $x$.
- **Convergent** means the function approaches a specific value.

$\\sin(1/x)$ is bounded ($|\\sin(1/x)| \\leq 1$ always) but **not** convergent as $x \\to 0$.

However — and this is the key insight — **a bounded function multiplied by a factor that goes to zero is a different story**. The wildness gets crushed. The factor going to zero is stronger than the oscillation. That is what the Squeeze Theorem captures precisely.

---

**The one bound you need to memorize:**

For every real number $\\theta$ (in any units):

$$|\\sin \\theta| \\leq 1 \\qquad \\text{and} \\qquad |\\cos \\theta| \\leq 1$$

This comes from the unit circle: $\\sin$ and $\\cos$ are coordinates on a circle of radius 1. No coordinate on a unit circle can exceed 1 in absolute value. These two inequalities are the raw material for nearly every Squeeze Theorem argument you will ever write.`,
      },
      {
        label: 'Act II',
        title: 'The Trap — Bounding a Function from Both Sides',
        content: `The core idea is simple: if something is stuck between two walls, and both walls close in on the same point, the thing between them is forced to that point too.

**Setup:** Suppose we can find functions $g(x)$ and $h(x)$ such that:

$$g(x) \\leq f(x) \\leq h(x) \\quad \\text{for all } x \\text{ near } c \\text{ (except possibly at } c)$$

This says $f$ is trapped. It cannot get above $h$ or below $g$. Now suppose both walls converge to the same limit:

$$\\lim_{x \\to c} g(x) = L \\qquad \\text{and} \\qquad \\lim_{x \\to c} h(x) = L$$

Where can $f$ go? It is below $h$, which is heading to $L$. It is above $g$, which is also heading to $L$. As $x \\to c$, the gap between the walls shrinks to zero. There is no room left for $f$ to be anywhere but $L$.

$$\\therefore \\quad \\lim_{x \\to c} f(x) = L$$

---

**First example: $\\lim_{x \\to 0} x \\sin(1/x)$.**

$f(x) = x \\sin(1/x)$ is undefined at $x = 0$, and $\\sin(1/x)$ oscillates wildly. Direct evaluation is impossible.

But we know $|\\sin(1/x)| \\leq 1$. So:

$$-1 \\leq \\sin(1/x) \\leq 1$$

Multiply all three parts by $x$. **Careful**: the direction of the inequalities flips when $x < 0$. The safe move is to use absolute value:

$$|x \\cdot \\sin(1/x)| = |x| \\cdot |\\sin(1/x)| \\leq |x| \\cdot 1 = |x|$$

Which gives us:

$$-|x| \\leq x \\sin(1/x) \\leq |x|$$

The two bounding functions are $g(x) = -|x|$ and $h(x) = |x|$. Both satisfy:

$$\\lim_{x \\to 0}(-|x|) = 0 \\qquad \\text{and} \\qquad \\lim_{x \\to 0} |x| = 0$$

Same limit on both sides. The trap closes. By the Squeeze Theorem:

$$\\lim_{x \\to 0} x \\sin(1/x) = 0$$

The infinitely oscillating $\\sin(1/x)$ was completely irrelevant. The factor $x$ crushed it.

---

**The pattern to recognize** — bounded times vanishing:

If $|q(x)| \\leq M$ for some constant $M$ (the function is bounded), and $\\lim_{x \\to c} p(x) = 0$ (the other factor vanishes), then:

$$\\lim_{x \\to c} p(x) \\cdot q(x) = 0$$

This handles $x^2 \\cos(1/x)$, $\\sqrt{x} \\sin x$, $e^{-x} \\sin x$ (as $x \\to \\infty$), and dozens more. Spot the bounded part, spot the vanishing part, conclude zero.`,
      },
      {
        label: 'Act III',
        title: 'The Central Result — Why $\\lim_{x \\to 0} \\sin(x)/x = 1$ (Geometric Proof)',
        content: `This is the most important limit in trigonometry. Every derivative formula for $\\sin$ and $\\cos$ depends on it. And it cannot be proved by substitution, algebra tricks, or L'Hôpital's rule (using L'Hôpital here would be circular — you need this limit first, before you can differentiate $\\sin$). It requires a geometric squeeze.

We will build the proof from scratch, one piece at a time.

---

**Setup: the unit circle.**

Draw a unit circle (radius = 1) centered at the origin. Fix an angle $x$ with $0 < x < \\pi/2$ (first quadrant). Mark three points:

- $O = (0, 0)$ — the origin
- $A = (1, 0)$ — the right end of the horizontal radius
- $P = (\\cos x,\\, \\sin x)$ — the point on the circle at angle $x$
- $T = (1,\\, \\tan x)$ — where the ray at angle $x$ hits the vertical line $x = 1$

---

**Three regions, nested inside each other:**

**Region 1 — Triangle $OAP$**: the triangle with vertices at $O$, $A$, and $P$.

- Base: $OA = 1$ (the horizontal leg)
- Height: the $y$-coordinate of $P = \\sin x$
- Area: $\\dfrac{1}{2} \\cdot 1 \\cdot \\sin x = \\dfrac{\\sin x}{2}$

**Region 2 — Sector $OAP$**: the pie-slice of the unit circle between angle $0$ and angle $x$.

- A full circle (angle $2\\pi$) has area $\\pi r^2 = \\pi$ (since $r=1$).
- Sector is the fraction $\\dfrac{x}{2\\pi}$ of the full circle.
- Area: $\\dfrac{x}{2\\pi} \\cdot \\pi = \\dfrac{x}{2}$

**Region 3 — Triangle $OAT$**: the larger triangle with vertices at $O$, $A$, and $T = (1, \\tan x)$.

- Base: $OA = 1$
- Height: $\\tan x$
- Area: $\\dfrac{1}{2} \\cdot 1 \\cdot \\tan x = \\dfrac{\\tan x}{2}$

---

**The nesting:** Triangle $OAP$ fits inside the sector. The sector fits inside triangle $OAT$. (You can see this geometrically: $P$ is on the arc, and $T$ is outside the circle.) So:

$$\\frac{\\sin x}{2} \\leq \\frac{x}{2} \\leq \\frac{\\tan x}{2}$$

Multiply through by $\\dfrac{2}{\\sin x}$ (positive since $0 < x < \\pi/2$):

$$1 \\leq \\frac{x}{\\sin x} \\leq \\frac{1}{\\cos x}$$

Take reciprocals — **this flips all inequalities**:

$$\\cos x \\leq \\frac{\\sin x}{x} \\leq 1$$

Now apply the Squeeze Theorem. As $x \\to 0^+$:

- Lower bound: $\\lim_{x \\to 0^+} \\cos x = \\cos 0 = 1$
- Upper bound: $\\lim_{x \\to 0^+} 1 = 1$

Both walls close to $1$. Therefore:

$$\\lim_{x \\to 0^+} \\frac{\\sin x}{x} = 1$$

**Left-hand limit (symmetry):** For $x < 0$, let $x = -t$ where $t > 0$. Then $\\sin(x)/x = \\sin(-t)/(-t) = (-\\sin t)/(-t) = \\sin(t)/t$. Same expression. So the left-hand limit is also $1$.

$$\\boxed{\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1}$$

---

**What this says geometrically**: for very small angles (in radians), the arc length $x$ and the chord $\\sin x$ are nearly equal. The ratio is almost exactly 1. This is why engineers use $\\sin \\theta \\approx \\theta$ for small $\\theta$ — it is not an approximation by choice, it is a theorem.`,
      },
      {
        label: 'Act IV',
        title: 'The Companion Limit — $\\lim_{x \\to 0}(1 - \\cos x)/x = 0$',
        content: `Once we have $\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1$, a second fundamental limit follows from it by algebra. This companion shows up in the derivative of $\\cos x$.

**Compute $\\lim_{x \\to 0} \\dfrac{1 - \\cos x}{x}$.**

Direct substitution: $\\dfrac{1 - \\cos 0}{0} = \\dfrac{0}{0}$. Indeterminate. Cannot simplify by factoring or L'Hôpital (same circularity problem).

**The trick**: multiply numerator and denominator by the conjugate $(1 + \\cos x)$.

$$\\frac{1 - \\cos x}{x} \\cdot \\frac{1 + \\cos x}{1 + \\cos x} = \\frac{(1 - \\cos x)(1 + \\cos x)}{x(1 + \\cos x)} = \\frac{1 - \\cos^2 x}{x(1 + \\cos x)}$$

Apply the Pythagorean identity $\\sin^2 x + \\cos^2 x = 1$, so $1 - \\cos^2 x = \\sin^2 x$:

$$= \\frac{\\sin^2 x}{x(1 + \\cos x)} = \\frac{\\sin x}{x} \\cdot \\frac{\\sin x}{1 + \\cos x}$$

Now take the limit — both factors are separable:

$$\\lim_{x \\to 0} \\frac{\\sin x}{x} \\cdot \\lim_{x \\to 0} \\frac{\\sin x}{1 + \\cos x} = 1 \\cdot \\frac{\\sin 0}{1 + \\cos 0} = 1 \\cdot \\frac{0}{2} = 0$$

$$\\boxed{\\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0}$$

---

**Why these two limits run the show:**

When you compute $\\dfrac{d}{dx}[\\sin x]$ from the limit definition of the derivative:

$$\\frac{d}{dx}[\\sin x] = \\lim_{h \\to 0} \\frac{\\sin(x+h) - \\sin x}{h}$$

Expand $\\sin(x+h)$ with the angle addition formula $\\sin(x+h) = \\sin x \\cos h + \\cos x \\sin h$:

$$= \\lim_{h \\to 0} \\frac{\\sin x \\cos h + \\cos x \\sin h - \\sin x}{h} = \\lim_{h \\to 0} \\left[ \\sin x \\cdot \\frac{\\cos h - 1}{h} + \\cos x \\cdot \\frac{\\sin h}{h} \\right]$$

$$= \\sin x \\cdot \\lim_{h \\to 0} \\frac{\\cos h - 1}{h} + \\cos x \\cdot \\lim_{h \\to 0} \\frac{\\sin h}{h}$$

$$= \\sin x \\cdot 0 + \\cos x \\cdot 1 = \\cos x$$

The two Squeeze Theorem limits — $\\lim \\sin(h)/h = 1$ and $\\lim (1 - \\cos h)/h = 0$ — appear directly. Without them, the derivative of $\\sin$ is unknowable. The entire tower of trig calculus stands on Archimedes' trap.`,
      },
      {
        label: 'Act V',
        title: 'The Formal Theorem — Every Word Earns Its Place',
        content: `Here is the Squeeze Theorem in full formal language, and an ε-δ proof sketch showing why it is logically airtight.

---

**Theorem (Squeeze / Sandwich / Pinching Theorem):**

Suppose $g(x) \\leq f(x) \\leq h(x)$ for all $x$ in some open interval containing $c$, except possibly at $c$ itself. If:

$$\\lim_{x \\to c} g(x) = L \\quad \\text{and} \\quad \\lim_{x \\to c} h(x) = L$$

then $\\lim_{x \\to c} f(x) = L$.

---

**Every clause matters:**

**"$g(x) \\leq f(x) \\leq h(x)$ for all $x$ near $c$"** — the inequalities must hold in a neighborhood of $c$ (not just at isolated points). The function $f$ must be genuinely trapped, not just touching the bounds occasionally.

**"except possibly at $c$ itself"** — same as in the limit definition: we never care what happens at exactly $x = c$. The limit is about approach, not arrival. Both $f$ and the bounds are allowed to be undefined at $c$.

**"the same $L$"** — this is the non-negotiable condition. If $g \\to 2$ and $h \\to 5$, you know $f$'s limit is somewhere between 2 and 5, but you cannot determine it. The theorem only works when both walls meet at a single point.

---

**Proof sketch (using ε-δ):**

We need to show: given any $\\epsilon > 0$, we can find $\\delta > 0$ such that $|f(x) - L| < \\epsilon$ whenever $0 < |x - c| < \\delta$.

Since $g(x) \\to L$: there exists $\\delta_1 > 0$ such that $|g(x) - L| < \\epsilon$ for $0 < |x - c| < \\delta_1$.
That means $L - \\epsilon < g(x) < L + \\epsilon$.

Since $h(x) \\to L$: there exists $\\delta_2 > 0$ with the same guarantee for $h$.

Let $\\delta = \\min(\\delta_1, \\delta_2)$. For any $x$ with $0 < |x - c| < \\delta$:

$$L - \\epsilon < g(x) \\leq f(x) \\leq h(x) < L + \\epsilon$$

The first inequality comes from $g(x) \\to L$. The last from $h(x) \\to L$. The two middle inequalities come from the trap $g \\leq f \\leq h$. Chaining them all:

$$L - \\epsilon < f(x) < L + \\epsilon \\implies |f(x) - L| < \\epsilon \\quad \\square$$

The limits of $g$ and $h$ forced $f$ into the $\\epsilon$-band around $L$ from both sides simultaneously. There was nowhere else for $f$ to go.`,
      },
      {
        label: 'Act VI',
        title: 'The Pattern Library — Recognizing When to Squeeze',
        content: `The Squeeze Theorem is not just for exotic oscillating functions. It is a general strategy: when you cannot evaluate a limit directly, look for bounds.

---

**The main pattern: bounded × vanishing → 0**

If $|q(x)| \\leq M$ (bounded) and $p(x) \\to 0$ (vanishing), then $p(x)q(x) \\to 0$.

Bounds: $-M \\cdot |p(x)| \\leq p(x)q(x) \\leq M \\cdot |p(x)|$. Both go to 0.

| Limit | Bounded part | Vanishing part | Result |
|---|---|---|---|
| $\\lim_{x \\to 0} x \\sin(1/x)$ | $\\|\\sin(1/x)\\| \\leq 1$ | $x \\to 0$ | $0$ |
| $\\lim_{x \\to 0} x^2 \\cos(1/x^2)$ | $\\|\\cos(1/x^2)\\| \\leq 1$ | $x^2 \\to 0$ | $0$ |
| $\\lim_{x \\to 0} \\sqrt{x} \\sin x$ | $\\|\\sin x\\| \\leq 1$ | $\\sqrt{x} \\to 0$ | $0$ |
| $\\lim_{x \\to \\infty} e^{-x} \\sin x$ | $\\|\\sin x\\| \\leq 1$ | $e^{-x} \\to 0$ | $0$ |

---

**The $\\sin x / x$ pattern: ratios near zero**

More generally, any "small-angle" ratio has limit 1:

$$\\lim_{x \\to 0} \\frac{\\sin(kx)}{kx} = 1 \\quad \\text{for any constant } k \\neq 0$$

This means you can rewrite: $\\lim_{x \\to 0} \\dfrac{\\sin(5x)}{x} = \\lim_{x \\to 0} 5 \\cdot \\dfrac{\\sin(5x)}{5x} = 5 \\cdot 1 = 5$.

The trick is always to manufacture the form $\\sin(\\text{something})/(\\text{same something})$ — then the limit is 1.

---

**When squeezing with non-zero limits:**

The theorem is not restricted to limits of 0. Archimedes squeezed $\\pi$ between polygon bounds converging to the same value. The same idea applies in limits: if you can trap $f$ between $g$ and $h$ that both converge to $L$ (any $L$), the conclusion holds.

Example: $\\lim_{x \\to \\infty} \\dfrac{\\sin x}{x}$. Here $|\\sin x| \\leq 1$, so:

$$\\frac{-1}{x} \\leq \\frac{\\sin x}{x} \\leq \\frac{1}{x}$$

Both bounds go to 0. Therefore $\\lim_{x \\to \\infty} \\dfrac{\\sin x}{x} = 0$. Even though $\\sin x$ never converges, dividing by $x$ (which grows without bound) crushes it to zero.`,
      },
    ],
    resolution: `**The Squeeze Theorem:**

If $g(x) \\leq f(x) \\leq h(x)$ near $c$ (except possibly at $c$), and $\\lim_{x \\to c} g(x) = \\lim_{x \\to c} h(x) = L$, then $\\lim_{x \\to c} f(x) = L$.

**The three-step procedure:**

1. **Identify why direct evaluation fails** — substitution gives $0/0$, or the function oscillates (e.g. $\\sin(1/x)$)
2. **Find the bounds** — use $|\\sin \\theta| \\leq 1$, $|\\cos \\theta| \\leq 1$, or geometric area inequalities to write $g(x) \\leq f(x) \\leq h(x)$
3. **Verify the limits agree** — compute $\\lim g$ and $\\lim h$ and confirm they equal the same $L$; conclude $\\lim f = L$

**The two fundamental trig limits** (both proved by the Squeeze Theorem):

$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1 \\qquad \\lim_{x \\to 0} \\frac{1 - \\cos x}{x} = 0$$

**The standard pattern** — bounded × vanishing:

If $|q(x)| \\leq M$ and $p(x) \\to 0$, then $p(x) \\cdot q(x) \\to 0$. Bounds: $-M|p| \\leq pq \\leq M|p|$, both sides go to 0.

**Why it matters:** $\\lim_{x \\to 0} \\dfrac{\\sin x}{x} = 1$ is the reason $\\dfrac{d}{dx}[\\sin x] = \\cos x$ and not something else. The entire tower of trig derivatives and integrals rests on Archimedes' geometric trap from 250 BC.`,
  },

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


  // ─── Semantic Layer ───────────────────────────────────────────────────────
  semantics: {
    "core": [
        {
            "symbol": "g(x) ≤ f(x) ≤ h(x)",
            "meaning": "f is bounded between g and h near the point of interest"
        },
        {
            "symbol": "lim g = lim h = L",
            "meaning": "the two bounding functions both converge to the same value L"
        }
    ],
    "rulesOfThumb": [
        "Trigger: you see |sin|, |cos|, or any bounded oscillating function multiplied by something going to 0.",
        "Write the bound: -1 ≤ sin(anything) ≤ 1. Multiply by the expression going to 0. Squeeze.",
        "Both bounding functions must approach the SAME limit for the Squeeze Theorem to conclude anything."
    ]
},

  // ─── Spiral Learning ─────────────────────────────────────────────────────
  spiral: {
    "recoveryPoints": [
        {
            "lessonId": "ch1-limit-laws",
            "label": "Previous: Limit Laws",
            "note": "The Squeeze Theorem was introduced alongside the Limit Laws. This lesson deepens that tool with more examples and the geometric proof of sin(x)/x."
        }
    ],
    "futureLinks": [
        {
            "lessonId": "ch2-trig-derivatives",
            "label": "Ch. 2: Trig Derivatives",
            "note": "The derivative of sin(x) cannot be computed without the Squeeze Theorem proof that sin(x)/x → 1. You will use this result directly."
        }
    ]
},

  // ─── Assessment ──────────────────────────────────────────────────────────
  assessment: {
    "questions": [
        {
            "id": "sq-assess-1",
            "type": "input",
            "text": "Evaluate lim(x→0) x²·cos(1/x).",
            "answer": "0",
            "hint": "Bound: -x² ≤ x²cos(1/x) ≤ x². Both bounds approach 0. Squeeze Theorem says the middle does too."
        },
        {
            "id": "sq-assess-2",
            "type": "input",
            "text": "What is lim(x→0) sin(x)/x?",
            "answer": "1",
            "hint": "This is the fundamental trig limit proved via the Squeeze Theorem and unit circle geometry."
        }
    ]
},

  // ─── Mental Model Compression ────────────────────────────────────────────
  mentalModel: [
    "Squeeze = pin a wild function between two tame ones with the same limit",
    "Trigger cue: bounded oscillation × vanishing factor",
    "sin(x)/x → 1 as x→0 (proved by squeezing)"
],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'solved-challenge'],

  quiz: [
    {
      id: 'squeeze-q1',
      type: 'choice',
      text: 'The Squeeze Theorem requires which condition on the bounding functions $g$ and $h$?',
      options: [
        '$\\lim g = 0$ and $\\lim h = 0$',
        '$\\lim g = L$ and $\\lim h = L$ (same limit)',
        '$\\lim g < L < \\lim h$',
        '$g$ and $h$ are continuous',
      ],
      answer: '$\\lim g = L$ and $\\lim h = L$ (same limit)',
      hints: ['The "squeezing" only works when both bounding functions converge to the SAME value.'],
      reviewSection: 'Intuition tab — the Squeeze Theorem conditions',
    },
    {
      id: 'squeeze-q2',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 0} x \\sin(1/x)$.',
      answer: '0',
      hints: [
        'Since $|\\sin(1/x)| \\leq 1$, we have $-|x| \\leq x\\sin(1/x) \\leq |x|$.',
        'Both $-|x|$ and $|x|$ approach 0, so by the Squeeze Theorem the limit is 0.',
      ],
      reviewSection: 'Examples tab — squeezing x·sin(1/x)',
    },
    {
      id: 'squeeze-q3',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 0} x^2 \\cos(1/x^2)$.',
      answer: '0',
      hints: [
        '$|\\cos(1/x^2)| \\leq 1$, so $-x^2 \\leq x^2\\cos(1/x^2) \\leq x^2$.',
        'Both bounds go to 0 as $x \\to 0$.',
      ],
      reviewSection: 'Examples tab — squeezing x²·cos(1/x²)',
    },
    {
      id: 'squeeze-q4',
      type: 'input',
      text: 'What is $\\lim_{x \\to 0} \\dfrac{\\sin x}{x}$?',
      answer: '1',
      hints: ['This is the fundamental trig limit proved by the area squeeze on the unit circle.'],
      reviewSection: 'Math tab — the fundamental trig limit',
    },
    {
      id: 'squeeze-q5',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 0} x^2 \\sin(1/x)$.',
      answer: '0',
      hints: [
        '$-x^2 \\leq x^2 \\sin(1/x) \\leq x^2$ since $|\\sin(1/x)| \\leq 1$ and $x^2 \\geq 0$.',
        'Both bounds approach 0.',
      ],
      reviewSection: 'Challenges tab — Challenge 1',
    },
    {
      id: 'squeeze-q6',
      type: 'input',
      text: 'Evaluate $\\lim_{x \\to 0} \\dfrac{\\sin(5x)}{x}$.',
      answer: '5',
      hints: [
        'Write $\\sin(5x)/x = 5 \\cdot \\sin(5x)/(5x)$.',
        'Let $u = 5x$. As $x \\to 0$, $u \\to 0$, and $\\lim_{u \\to 0} \\sin(u)/u = 1$.',
      ],
      reviewSection: 'Challenges tab — Challenge 2',
    },
    {
      id: 'squeeze-q7',
      type: 'choice',
      text: 'The geometric squeeze that proves $\\lim_{x \\to 0} \\sin(x)/x = 1$ establishes the inequality:',
      options: [
        '$\\sin x \\leq \\dfrac{\\sin x}{x} \\leq \\tan x$',
        '$\\cos x \\leq \\dfrac{\\sin x}{x} \\leq 1$',
        '$0 \\leq \\dfrac{\\sin x}{x} \\leq \\cos x$',
        '$\\dfrac{\\sin x}{x} \\leq \\cos x \\leq 1$',
      ],
      answer: '$\\cos x \\leq \\dfrac{\\sin x}{x} \\leq 1$',
      hints: ['After the area comparison: $\\sin x \\leq x \\leq \\tan x$, divide by $\\sin x$ and invert.'],
      reviewSection: 'Math tab — geometric proof of sin(x)/x',
    },
    {
      id: 'squeeze-q8',
      type: 'choice',
      text: 'The "bounded × vanishing" pattern says: if $|q(x)| \\leq M$ and $p(x) \\to 0$ as $x \\to c$, then $p(x) \\cdot q(x) \\to$ ?',
      options: ['$M$', '$1$', '$0$', 'It depends on $q(x)$'],
      answer: '$0$',
      hints: ['$-M|p| \\leq pq \\leq M|p|$ and both bounds approach 0.'],
      reviewSection: 'Math tab — bounded × vanishing pattern',
    },
    {
      id: 'squeeze-q9',
      type: 'input',
      text: 'On the unit circle, the area of the circular sector with angle $x$ (in radians) is $\\frac{1}{2}x$. The area of the inscribed triangle is $\\frac{1}{2}\\sin x$. Since sector ≥ inscribed triangle for $0 < x < \\pi/2$, we get $x \\geq \\sin x$. This means $\\dfrac{\\sin x}{x} \\leq$ what value?',
      answer: '1',
      hints: ['Divide both sides of $x \\geq \\sin x$ by $x > 0$.'],
      reviewSection: 'Math tab — area squeeze for sin(x)/x',
    },
    {
      id: 'squeeze-q10',
      type: 'input',
      text: 'Using the Squeeze Theorem result $\\lim_{x \\to 0} \\sin(x)/x = 1$, evaluate $\\lim_{x \\to 0} \\dfrac{\\sin(3x)}{x}$.',
      answer: '3',
      hints: [
        'Write $\\sin(3x)/x = 3 \\cdot \\sin(3x)/(3x)$.',
        'Apply the fundamental trig limit with $u = 3x$.',
      ],
      reviewSection: 'Math tab — scaling the fundamental trig limit',
    },
  ],

  walkthroughs: [
  {
    id: 'wt-squeeze-basic-poly',
    title: 'Squeeze Theorem — Warmup (Direct Bounding)',
    prereqs: ['Limit laws', 'Inequalities'],
    svgId: 'WalkthroughViz',
    vizProps: { type: 'limit', fn: 'x*Math.sin(x)', a: 0, xMin: -1, xMax: 1, label: 'f(x)=x sin x' },
    problem: 'Evaluate $\\lim_{x\\to 0} x\\sin x$ using the Squeeze Theorem.',
    steps: [
      {
        label: 'Recognize the structure before computing',
        visualNote: 'The oscillating sine wave is trapped between $-1$ and $1$, scaled by $x$.',
        strategy: 'Squeeze only works if you can trap the function between two simpler ones with the same limit.',
        explanation: 'Look at the function before doing anything symbolic. The term $\\sin x$ oscillates between $-1$ and $1$ forever — that is a global fact. Multiplying by $x$ shrinks those oscillations as $x$ approaches 0. The question is: can we turn that intuition into inequalities?',
        math: '-1 \\leq \\sin x \\leq 1',
      },
      {
        label: 'Multiply the inequality correctly',
        visualNote: 'The bounds tilt inward as they are scaled by $x$.',
        strategy: 'Multiply all parts by $x$, but be mindful of sign — near 0, $x$ can be positive or negative.',
        explanation: 'Here is the subtlety: when multiplying inequalities by a variable, the direction can flip if the variable is negative. Instead of splitting cases, we use absolute value to avoid that headache. The clean move is to say $|\\sin x| \\leq 1$, then multiply safely.',
        math: '|x\\sin x| \\leq |x|',
        gotcha: 'Do NOT multiply $-1 \\leq \\sin x \\leq 1$ by $x$ directly without handling sign changes.',
      },
      {
        label: 'Convert into squeeze form',
        visualNote: 'The graph of $x\\sin x$ sits between $- |x|$ and $|x|$.',
        strategy: 'We need explicit lower and upper bounds with the same limit.',
        explanation: 'From $|x\\sin x| \\leq |x|$, we rewrite this as a two-sided inequality: $-|x| \\leq x\\sin x \\leq |x|$. Now we have a proper squeeze: a function trapped between two simpler ones.',
        math: '-|x| \\leq x\\sin x \\leq |x|',
      },
      {
        label: 'Evaluate the outer limits',
        visualNote: 'Both bounding functions collapse to 0 at the origin.',
        strategy: 'If both outer functions approach the same value, the middle must follow.',
        explanation: 'Now comes the key observation: as $x \\to 0$, both $-|x|$ and $|x|$ approach 0. The graph shows both bounds collapsing inward symmetrically. There is nowhere else for $x\\sin x$ to go — it is forced to 0.',
        math: '\\lim_{x\\to 0} -|x| = 0 = \\lim_{x\\to 0} |x|',
      },
      {
        label: 'Conclude via squeeze',
        explanation: 'Because $x\\sin x$ is trapped between two functions that both approach 0, the Squeeze Theorem guarantees that $x\\sin x$ also approaches 0.',
        math: '\\lim_{x\\to 0} x\\sin x = 0',
        conceptRef: 'Squeeze Theorem',
      },
    ],
    variations: [
      {
        question: 'What if the function were $x^2 \\sin x$?',
        hint: 'You would get $|x^2\\sin x| \\leq x^2$, which goes to 0 even faster.',
      },
    ],
  },

  {
    id: 'wt-squeeze-classic',
    title: 'Squeeze Theorem — Classic Trig Limit',
    prereqs: ['Unit circle inequalities', 'Basic trig limits'],
    svgId: 'WalkthroughViz',
    vizProps: { type: 'limit', fn: 'Math.sin(x)/x', a: 0, xMin: -1, xMax: 1, label: 'f(x)=sin x / x' },
    problem: 'Evaluate $\\lim_{x\\to 0} \\frac{\\sin x}{x}$.',
    steps: [
      {
        label: 'Start from geometric truth',
        visualNote: 'Unit circle sectors and triangles illustrate $\\sin x < x < \\tan x$.',
        strategy: 'This limit is not algebraic — it comes from geometry.',
        explanation: 'This is the most famous squeeze theorem example, and it does not start with algebra. It starts with geometry on the unit circle. For small positive angles, the arc length $x$ sits between the sine and tangent values: $\\sin x < x < \\tan x$. This is not obvious unless you see the diagram — it comes from comparing areas of sectors and triangles.',
        math: '\\sin x < x < \\tan x',
      },
      {
        label: 'Normalize the inequality',
        visualNote: 'Everything is divided by $\\sin x$ and $x$ to isolate the ratio.',
        strategy: 'We want $\\sin x / x$ in the middle — so we manipulate the inequality toward that form.',
        explanation: 'We now reshape the inequality to isolate $\\frac{\\sin x}{x}$. Dividing everything carefully gives: $\\cos x \\leq \\frac{\\sin x}{x} \\leq 1$. This is the squeeze form we need.',
        math: '\\cos x \\leq \\frac{\\sin x}{x} \\leq 1',
      },
      {
        label: 'Evaluate the bounds',
        visualNote: 'The cosine curve approaches 1 at 0.',
        strategy: 'Both bounding functions must approach the same value.',
        explanation: 'As $x \\to 0$, $\\cos x \\to 1$ and the constant 1 stays at 1. The two outer functions meet at the same limit.',
        math: '\\lim_{x\\to 0} \\cos x = 1',
      },
      {
        label: 'Apply squeeze',
        explanation: 'Since $\\frac{\\sin x}{x}$ is trapped between two functions both approaching 1, it must also approach 1.',
        math: '\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1',
      },
    ],
    variations: [
      {
        question: 'What about $\\lim_{x\\to 0} \\frac{\\tan x}{x}$?',
        hint: 'Rewrite as $\\frac{\\sin x}{x\\cos x}$ and use the known limits.',
      },
    ],
  },

  {
    id: 'wt-squeeze-hard',
    title: 'Squeeze Theorem — Oscillation vs Growth',
    prereqs: ['Absolute value', 'Limit comparison'],
    svgId: 'WalkthroughViz',
    vizProps: { type: 'limit', fn: 'x*x*Math.cos(1/x)', a: 0, xMin: -1, xMax: 1, label: 'f(x)=x^2 cos(1/x)' },
    problem: 'Evaluate $\\lim_{x\\to 0} x^2\\cos\\left(\\frac{1}{x}\\right)$.',
    steps: [
      {
        label: 'Identify the difficulty',
        visualNote: 'The function oscillates infinitely near 0.',
        strategy: 'When direct substitution fails, look for bounded oscillation.',
        explanation: 'The expression $\\cos(1/x)$ is chaotic near 0 — it oscillates infinitely fast and has no limit. So direct evaluation is impossible. But the key observation is that cosine is always bounded between -1 and 1.',
        math: '-1 \\leq \\cos\\left(\\frac{1}{x}\\right) \\leq 1',
      },
      {
        label: 'Scale the inequality',
        visualNote: 'The oscillation is squeezed by $x^2$ shrinking to 0.',
        strategy: 'Multiply through by $x^2$, which goes to 0.',
        explanation: 'Multiplying by $x^2$ gives $-x^2 \\leq x^2\\cos(1/x) \\leq x^2$. This is the key transformation: the wild oscillation is now trapped inside a shrinking envelope.',
        math: '-x^2 \\leq x^2\\cos\\left(\\frac{1}{x}\\right) \\leq x^2',
      },
      {
        label: 'Evaluate bounds',
        visualNote: 'Both outer curves collapse to the x-axis.',
        strategy: 'Check limits of bounding functions.',
        explanation: 'As $x \\to 0$, both $-x^2$ and $x^2$ approach 0. The oscillation has nowhere to go — it is squeezed into a single value.',
        math: '\\lim_{x\\to 0} x^2 = 0',
      },
      {
        label: 'Conclude',
        explanation: 'Despite the inner chaos of $\\cos(1/x)$, the shrinking factor $x^2$ dominates. The entire expression is forced to 0.',
        math: '\\lim_{x\\to 0} x^2\\cos\\left(\\frac{1}{x}\\right) = 0',
      },
    ],
    variations: [
      {
        question: 'What if the function were $x\\cos(1/x)$?',
        hint: 'Still works — bounded by $|x|$. Limit is 0.',
      },
      {
        question: 'What if it were just $\\cos(1/x)$?',
        hint: 'No squeezing factor → no limit.',
      },
    ],
  },
],
}
