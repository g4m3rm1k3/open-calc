export default {
  id: 'ch1-epsilon-delta',
  slug: 'epsilon-delta',
  chapter: 1,
  order: 3,
  title: 'The Epsilon-Delta Definition',
  subtitle: 'Making "close to" mathematically airtight',
  tags: ['epsilon-delta', 'ε-δ', 'formal definition', 'proof technique', 'Cauchy', 'Weierstrass', 'rigor'],

  hook: {
    question: 'How do you prove something gets "infinitely close" to a value — without ever using infinity?',
    realWorldContext:
      'For 150 years after Newton and Leibniz, calculus worked. Engineers built bridges, astronomers predicted eclipses, and physicists derived the laws of motion — all using limits, derivatives, and integrals. ' +
      'But nobody could explain *why* it worked. The philosopher George Berkeley mocked the foundations: Newton\'s "infinitesimals" were "the ghosts of departed quantities." ' +
      'Was calculus built on mysticism? In the 1820s, Augustin-Louis Cauchy finally gave limits a precise definition: instead of vague talk about "approaching," he described a concrete game you can play with two numbers, ε and δ. ' +
      'Karl Weierstrass later polished the idea into the form we use today. The ε-δ definition didn\'t change a single computation — every answer Newton got was still correct — but it gave calculus an unshakable logical foundation. ' +
      'It\'s the mathematical equivalent of building codes: the bridge already stood, but now we can *prove* it won\'t collapse.',
    previewVisualizationId: 'EpsilonDelta',
  },

  intuition: {
    prose: [
      'Imagine you\'re playing a game against a skeptic. You claim that lim(x→3) (2x+1) = 7. The skeptic doesn\'t believe you. So you agree on rules:',

      '**Round 1**: The skeptic says "I bet f(x) isn\'t always within 0.5 of 7." You respond: "Keep x within 0.25 of 3, and I guarantee |f(x) − 7| < 0.5." You\'re right: if |x−3| < 0.25, then |2x+1−7| = 2|x−3| < 2(0.25) = 0.5. ✓',

      '**Round 2**: The skeptic tightens: "Within 0.01 of 7." You respond: "Keep x within 0.005 of 3." Check: 2(0.005) = 0.01. ✓',

      '**Round 3**: "Within 0.0001 of 7." You: "Within 0.00005 of 3." Check: 2(0.00005) = 0.0001. ✓',

      'The skeptic can pick ANY positive number ε (the output tolerance), no matter how tiny. You must respond with a δ (the input tolerance) that guarantees every x within δ of 3 has f(x) within ε of 7. If you can ALWAYS win — for EVERY possible ε — then the limit is truly 7.',

      'For this linear function, the winning strategy is simple: set δ = ε/2. For other functions, finding δ is harder — that\'s where the algebra comes in. But the game is always the same.',

      'The beautiful thing about this definition: it never mentions infinity, it never mentions "approaching," and it never mentions motion or time. It replaces all of those fuzzy ideas with a single, airtight logical statement about numbers. This is what mathematician Morris Kline called "the arithmetization of analysis" — rebuilding all of calculus on nothing more than the properties of real numbers.',
    ],
    callouts: [
      {
        type: 'prior-knowledge',
        title: 'Absolute Value as Distance',
        body: '|a − b| is the distance between a and b on the number line. So |x − 3| < 0.5 means "x is within 0.5 of 3," and |f(x) − 7| < ε means "f(x) is within ε of 7." The entire ε-δ definition is stated in the language of distances.',
      },
      {
        type: 'intuition',
        title: 'The ε-δ Game in One Sentence',
        body: '"No matter how tight the accuracy demand (ε), I can always find a neighborhood (δ) where the function stays within tolerance." If you can always win, the limit exists.',
      },
      {
        type: 'history',
        title: 'Berkeley\'s Challenge and Cauchy\'s Answer (1734 → 1821)',
        body: 'In 1734, Bishop George Berkeley published "The Analyst," attacking Newton\'s calculus. He asked: what is a fluxion? Is dx a positive quantity, or zero? If positive, the results are approximate; if zero, division by it is illegal. For nearly a century, no mathematician had a satisfying response. In 1821, Cauchy\'s "Cours d\'Analyse" finally answered: limits are defined by inequalities (ε and δ), not by mystical infinitesimals. Weierstrass later removed Cauchy\'s remaining appeals to intuition, giving us the purely algebraic definition used today.',
      },
      {
        type: 'real-world',
        title: 'Engineering Tolerances Are ε-δ Problems',
        body: 'A machinist needs a bolt diameter within ±0.01 mm of 10 mm (ε = 0.01). The lathe\'s input parameter is feed rate, which must be set within some tolerance δ of the nominal value. Finding δ from ε — "how precisely must I control the input to guarantee the output tolerance?" — is exactly an ε-δ problem. Every manufacturing spec, every quality control threshold, every sensor calibration is an ε-δ argument in disguise.',
      },
    ],
    visualizations: [
      {
        id: 'EpsilonDelta',
        props: { fn: '2*x + 1', c: 3, L: 7 },
        title: 'The ε-δ Game — Interactive',
        mathBridge: 'The horizontal yellow band has half-width $\\varepsilon$ (output tolerance). The vertical blue band has half-width $\\delta$ (input tolerance). The definition $\\lim_{x \\to 3}(2x+1)=7$ says: for ANY $\\varepsilon$ you choose, there EXISTS a $\\delta$ such that whenever $x$ is inside the blue band, $f(x)$ is inside the yellow band. For this linear function, $f(x)-7 = 2(x-3)$, so setting $\\delta = \\varepsilon/2$ always works.',
        caption: 'Drag ε to set the output tolerance (horizontal band around L=7). Watch δ adjust to ensure f(x) stays within the band. For this linear function, δ = ε/2 always works.',
      },
    ],
  },

  math: {
    prose: [
      'The formal definition replaces "f(x) approaches L" with a precise inequality statement. No motion, no time, no infinity — just numbers.',

      'The key symbols: ∀ means "for all" (or "for every"), ∃ means "there exists" (at least one), and ⟹ means "implies" (if ... then ...). The definition reads:',

      'lim(x→c) f(x) = L if and only if: for every ε > 0, there exists δ > 0 such that whenever 0 < |x − c| < δ, we have |f(x) − L| < ε.',

      'The condition 0 < |x − c| means x ≠ c — we explicitly exclude the point c itself. The limit only cares about what happens NEAR c, not AT c. This is why limits can exist at holes, jumps, and even undefined points.',

      'The **order of quantifiers matters critically**: first ∀ε, then ∃δ. This means δ is allowed to depend on ε (and it usually does — smaller ε generally requires smaller δ). If the order were reversed (∃δ such that ∀ε...), a single δ would need to work for every ε simultaneously, which is almost never possible.',

      '**One-sided ε-δ definitions**: For the left-hand limit lim(x→c⁻) f(x) = L, replace 0 < |x−c| < δ with c−δ < x < c (x approaches from below only). For the right-hand limit, use c < x < c+δ.',

      '**How to construct an ε-δ proof** — the two-phase strategy:',
      'PHASE 1 (Scratch work): Start from |f(x) − L| and simplify algebraically. Express it in terms of |x − c|. Find what δ needs to be (in terms of ε).',
      'PHASE 2 (Formal proof): "Given ε > 0, let δ = [your expression]. Suppose 0 < |x−c| < δ. Then... [chain of inequalities]... < ε. ∎"',
      'The scratch work is where you figure out the answer. The formal proof is where you verify it. Students get confused because textbooks only show Phase 2 — the polished proof — hiding the discovery process.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The Epsilon-Delta Definition of a Limit',
        body: '\\lim_{x \\to c} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 \\text{ such that:} \\\\ 0 < |x - c| < \\delta \\implies |f(x) - L| < \\varepsilon',
      },
      {
        type: 'misconception',
        title: 'δ Depends on ε — Not the Other Way Around',
        body: 'The skeptic picks ε first. Then you choose δ. Your δ is allowed to be a function of ε: δ(ε) = ε/2, or δ(ε) = min(1, ε/5), etc. A common student mistake is trying to find ε from δ, or assuming δ must be independent of ε. Neither is correct. The quantifier order ∀ε ∃δ makes this clear.',
      },
      {
        type: 'tip',
        title: 'The min(1, ...) Trick',
        body: 'For nonlinear functions, |f(x)−L| often factors into |x−c| · g(x), where g(x) varies with x. To bound g(x), restrict δ ≤ 1 first (so x stays in a small interval around c). Within that interval, find an upper bound M for |g(x)|. Then set δ = min(1, ε/M). This two-step strategy handles every polynomial and rational function limit.',
      },
      {
        type: 'definition',
        title: 'Absolute Value as an Interval',
        body: '|x-a| < \delta \iff a-\delta < x < a+\delta. This translation is often the fastest way to bound expressions in ε-δ proofs.',
      },
      {
        type: 'technique',
        title: 'Inequality Chain Checklist',
        body: 'In proofs, justify each inequality step: factor, apply |uv|=|u||v|, bound variable factors on a local interval, then choose \delta from the final bound.',
      },
      {
        type: 'technique',
        title: 'Reverse-Engineer Delta from Epsilon',
        body: 'Start from the target |f(x)-L|<\\varepsilon and work backward to a condition of the form |x-c|<(...). Then in the forward proof, define \\delta as that expression (often with min(1,...)) and replay the chain in the correct direction.',
      },
    ],
    visualizations: [
      {
        id: 'EpsilonDelta',
        props: { fn: 'x*x', c: 2, L: 4 },
        title: 'ε-δ for f(x) = x² at c = 2',
        mathBridge: 'For $f(x)=x^2$ at $c=2$: $|f(x)-4| = |x^2-4| = |x-2||x+2|$. Near $c=2$, if $\\delta \\leq 1$ then $x \\in (1,3)$ so $|x+2| < 5$. Therefore $|x^2-4| < 5|x-2| < 5\\delta$. Setting $\\delta = \\min(1,\\, \\varepsilon/5)$ guarantees $|x^2-4| < \\varepsilon$. Notice: $\\delta$ is no longer simply $\\varepsilon/k$ — it uses the min-of-1 trick because the function is nonlinear.',
        caption: 'A nonlinear function: notice that δ is no longer simply ε/k. For x², the relationship between ε and δ depends on the neighborhood around c=2. Watch how δ must shrink faster than ε.',
      },
    ],
  },

  rigor: {
    prose: [
      'Let us prove the Sum Law using ε-δ, to see how these proofs work at the foundational level.',

      'CLAIM: If lim(x→c) f(x) = L and lim(x→c) g(x) = M, then lim(x→c) [f(x)+g(x)] = L+M.',

      'PROOF: Given ε > 0. We need |(f(x)+g(x)) − (L+M)| < ε.',

      'By the triangle inequality: |(f+g) − (L+M)| = |(f−L) + (g−M)| ≤ |f−L| + |g−M|.',

      'So if we can make each term less than ε/2, the sum will be less than ε.',

      'Since lim f = L: ∃δ₁ > 0 such that 0 < |x−c| < δ₁ ⟹ |f(x)−L| < ε/2.',
      'Since lim g = M: ∃δ₂ > 0 such that 0 < |x−c| < δ₂ ⟹ |g(x)−M| < ε/2.',

      'Let δ = min(δ₁, δ₂). Then 0 < |x−c| < δ implies BOTH conditions hold simultaneously:',
      '|(f+g) − (L+M)| ≤ |f−L| + |g−M| < ε/2 + ε/2 = ε. ∎',

      'This proof illustrates several key techniques: (1) the {{algebra:triangle-inequality|triangle inequality}} |a+b| ≤ |a|+|b| to safely split error accumulation; (2) the **ε/2 trick** — budget half the absolute tolerance for each term; (3) **taking the minimum** of multiple δ values so all local conditions explicitly hold simultaneously. These three tools govern nearly every ε-δ proof.',

      'Historically, this level of rigor was developed because of actual mathematical crises. In the 1800s, mathematicians discovered continuous functions that are nowhere differentiable (Weierstrass, 1872), convergent series of continuous functions with discontinuous limits (Cauchy got this wrong!), and space-filling curves (Peano, 1890). These "pathological" examples showed that geometric intuition could not be trusted — only rigorous definitions could prevent errors.',
    ],
    callouts: [
      {
        type: 'history',
        title: 'Weierstrass\'s Monster (1872)',
        body: 'Karl Weierstrass constructed a function that is continuous everywhere but differentiable nowhere — a curve so jagged it has no tangent line at any point. This shocked the mathematical world: how could something continuous be so chaotic? The example proved that rigorous definitions (not pictures) were essential. The function is f(x) = Σ aⁿ cos(bⁿπx), with 0 < a < 1 and b an odd integer with ab > 1+3π/2.',
      },
      {
        type: 'definition',
        title: 'ε-δ for One-Sided Limits',
        body: '\\lim_{x \\to c^+} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 \\text{ s.t. } 0 < x - c < \\delta \\implies |f(x) - L| < \\varepsilon \\\\ \\lim_{x \\to c^-} f(x) = L \\iff \\forall\\, \\varepsilon > 0,\\; \\exists\\, \\delta > 0 \\text{ s.t. } 0 < c - x < \\delta \\implies |f(x) - L| < \\varepsilon',
      },
    ],
    visualizations: [
      {
        id: 'EpsilonDelta',
        props: { fn: '(x*x - 1)/(x - 1)', c: 1, L: 2 },
        title: 'ε-δ at a Removable Discontinuity',
        caption: 'f(x) = (x²−1)/(x−1) = x+1 for x ≠ 1. The function has a hole at x=1, but the ε-δ definition only checks x ≠ c. The limit is 2 — verified by the ε-δ condition.',
      },
      {
        id: 'TriangleInequalityViz',
        title: 'Geometric Proof: The Triangle Inequality',
        caption: 'Play with values a and b to dynamically prove why |a + b| ≤ |a| + |b|. This simple 1D collapse is the exact mechanism preventing error accumulation in Calculus.',
      },
    ],
  },

  examples: [
    {
      id: 'ex-ed-linear',
      title: 'ε-δ Proof for a Linear Function (Scratchwork + Proof)',
      problem: 'Prove using ε-δ that \\displaystyle\\lim_{x \\to 4} (3x - 5) = 7.',
      steps: [
        { expression: '\\textbf{Phase 1 — Scratch work:}', annotation: 'Figure out what δ should be before writing the formal proof.' },
        { expression: '|(3x-5) - 7| = |3x - 12| = 3|x - 4|', annotation: 'Simplify the output error. It factors as 3 times the input error.' },
        { expression: '\\text{Need: } 3|x-4| < \\varepsilon \\iff |x-4| < \\frac{\\varepsilon}{3}', annotation: 'So δ = ε/3 should work. Now write the formal proof.' },
        { expression: '\\textbf{Phase 2 — Formal proof:}', annotation: '' },
        { expression: '\\text{Given } \\varepsilon > 0. \\text{ Let } \\delta = \\frac{\\varepsilon}{3}.', annotation: 'State your choice of δ upfront.' },
        { expression: '\\text{Suppose } 0 < |x-4| < \\delta.', annotation: 'Assume x is within δ of 4 (but x ≠ 4).' },
        { expression: '|(3x-5) - 7| = 3|x-4| < 3\\delta = 3 \\cdot \\frac{\\varepsilon}{3} = \\varepsilon.\\;\\blacksquare', annotation: 'The chain: output error = 3·(input error) < 3·δ = 3·(ε/3) = ε.' },
      ],
      conclusion: 'For linear functions f(x) = mx + b with m ≠ 0, δ = ε/|m| always works. The proof is essentially one line: |f(x)−L| = |m|·|x−c| < |m|·δ = ε. The scaling factor is the slope.',
    },
    {
      id: 'ex-ed-quadratic',
      title: 'ε-δ Proof for a Quadratic (The min Trick)',
      problem: 'Prove that \\displaystyle\\lim_{x \\to 3} x^2 = 9.',
      steps: [
        { expression: '|x^2 - 9| = |x-3|\\cdot|x+3|', annotation: 'Factor the output error using the difference of squares.' },
        { expression: '\\text{Problem: } |x+3| \\text{ is not a constant — it depends on } x.', annotation: 'Unlike the linear case, we can\'t immediately solve for δ.' },
        { expression: '\\text{Trick: restrict } \\delta \\leq 1, \\text{ so } |x-3| < 1 \\implies 2 < x < 4.', annotation: 'By keeping x within 1 of 3, we bound the variable factor.' },
        { expression: '\\text{Then } 5 < x+3 < 7, \\text{ so } |x+3| < 7.', annotation: 'Now |x+3| has a constant upper bound on this interval.' },
        { expression: '|x^2-9| = |x-3|\\cdot|x+3| < 7|x-3|', annotation: 'Substitute the bound.' },
        { expression: '\\text{Need: } 7|x-3| < \\varepsilon \\iff |x-3| < \\varepsilon/7.', annotation: '' },
        { expression: '\\text{Choose } \\delta = \\min\\!\\left(1,\\; \\frac{\\varepsilon}{7}\\right).', annotation: 'The min ensures BOTH conditions: δ ≤ 1 (so the bound holds) AND δ ≤ ε/7 (so the product is small).' },
        { expression: '\\textbf{Proof: } \\text{Given } \\varepsilon > 0, \\text{ let } \\delta = \\min(1, \\varepsilon/7).', annotation: '' },
        { expression: '\\text{If } 0 < |x-3| < \\delta:\\quad |x^2-9| = |x-3||x+3| < \\delta \\cdot 7 \\leq \\frac{\\varepsilon}{7} \\cdot 7 = \\varepsilon.\\;\\blacksquare', annotation: '' },
      ],
      conclusion: 'The min(1, ε/7) trick is the standard technique for nonlinear ε-δ proofs: restrict δ once to bound variable factors, then solve. This method works for any polynomial — the only change is the specific bound M for the variable factor.',
    },
    {
      id: 'ex-ed-rational',
      title: 'ε-δ Proof for 1/x (Bounding Away from Zero)',
      problem: 'Prove that \\displaystyle\\lim_{x \\to 2} \\frac{1}{x} = \\frac{1}{2}.',
      steps: [
        { expression: '\\left|\\frac{1}{x} - \\frac{1}{2}\\right| = \\left|\\frac{2-x}{2x}\\right| = \\frac{|x-2|}{2|x|}', annotation: 'Combine fractions and simplify. The output error involves 1/|x|, which blows up near 0.' },
        { expression: '\\text{Restrict: } \\delta \\leq 1, \\text{ so } |x-2| < 1 \\implies 1 < x < 3.', annotation: 'This keeps x away from 0, preventing 1/|x| from exploding.' },
        { expression: '\\text{Then } |x| > 1, \\text{ so } \\frac{1}{|x|} < 1.', annotation: 'On (1,3), the factor 1/|x| is bounded by 1.' },
        { expression: '\\frac{|x-2|}{2|x|} < \\frac{|x-2|}{2 \\cdot 1} = \\frac{|x-2|}{2}', annotation: '' },
        { expression: '\\text{Need: } \\frac{|x-2|}{2} < \\varepsilon \\iff |x-2| < 2\\varepsilon.', annotation: '' },
        { expression: '\\text{Choose } \\delta = \\min(1, 2\\varepsilon).', annotation: '' },
        { expression: '\\textbf{Proof: } \\text{Given } \\varepsilon > 0, \\delta = \\min(1, 2\\varepsilon). \\text{ If } 0 < |x-2| < \\delta:', annotation: '' },
        { expression: '\\left|\\frac{1}{x}-\\frac{1}{2}\\right| = \\frac{|x-2|}{2|x|} < \\frac{\\delta}{2} \\leq \\frac{2\\varepsilon}{2} = \\varepsilon.\\;\\blacksquare', annotation: '' },
      ],
      conclusion: 'For rational functions, the extra challenge is keeping the denominator away from zero. The first restriction (δ ≤ 1) solves this. Once you have a lower bound on |x|, the rest follows the same pattern.',
    },
    {
      id: 'ex-ed-disprove',
      title: 'Using ε-δ to Prove a Limit Does NOT Exist',
      problem: 'Prove that \\displaystyle\\lim_{x \\to 0} \\sin\\!\\left(\\frac{1}{x}\\right) does not exist.',
      steps: [
        { expression: '\\text{Suppose for contradiction: } \\lim_{x \\to 0} \\sin(1/x) = L \\text{ for some } L.', annotation: 'Try to derive a contradiction from the ε-δ definition.' },
        { expression: '\\text{Take } \\varepsilon = \\frac{1}{2}. \\text{ Then } \\exists\\, \\delta > 0 \\text{ s.t. } 0 < |x| < \\delta \\implies |\\sin(1/x) - L| < \\frac{1}{2}.', annotation: 'If the limit existed, we could satisfy this tolerance.' },
        { expression: '\\text{Choose } x_1 = \\frac{1}{2n\\pi + \\pi/2} \\text{ (so } \\sin(1/x_1) = 1\\text{)}', annotation: 'For large enough n, x₁ is within δ of 0.' },
        { expression: '\\text{Choose } x_2 = \\frac{1}{2n\\pi - \\pi/2} \\text{ (so } \\sin(1/x_2) = -1\\text{)}', annotation: 'x₂ is also within δ of 0 (for large n).' },
        { expression: '|\\sin(1/x_1) - L| < 1/2 \\implies |1 - L| < 1/2 \\implies L > 1/2', annotation: 'From the ε-δ condition applied to x₁.' },
        { expression: '|\\sin(1/x_2) - L| < 1/2 \\implies |-1 - L| < 1/2 \\implies L < -1/2', annotation: 'From the ε-δ condition applied to x₂.' },
        { expression: 'L > 1/2 \\text{ AND } L < -1/2 \\quad \\Rightarrow\\!\\Leftarrow', annotation: 'Contradiction. No single L can be within 1/2 of both 1 and −1.' },
      ],
      conclusion: 'The function oscillates between −1 and +1 infinitely often near x=0, so no single value L can satisfy the ε-δ condition. This is the formal version of "the function has no settling point." The key technique: finding two sequences approaching 0 whose function values disagree by more than 2ε.',
    },
    {
      id: 'ex-ed-absolute-value',
      title: 'Physics: Precision Measurement as an ε-δ Problem',
      problem: 'A thermometer measures temperature T(x) = 100 + 0.3x − 0.01x² degrees Celsius, where x is the sensor voltage in millivolts. To guarantee the temperature reading is within ε = 0.5°C of the true value T(10) = 102°C, how precisely must the voltage be controlled?',
      steps: [
        { expression: '|T(x) - 102| = |100 + 0.3x - 0.01x^2 - 102|', annotation: 'The output error: how far is the reading from the true value?' },
        { expression: '= |-0.01x^2 + 0.3x - 2|', annotation: 'Simplify.' },
        { expression: '= 0.01|x^2 - 30x + 200| = 0.01|(x-10)(x-20)|', annotation: 'Factor: x²−30x+200 = (x−10)(x−20).' },
        { expression: '= 0.01|x-10|\\cdot|x-20|', annotation: 'The error is proportional to |x−10| (the input deviation).' },
        { expression: '\\text{Restrict: } |x-10| < 1, \\text{ so } 9 < x < 11.', annotation: 'Bound the variable factor |x−20|.' },
        { expression: '\\text{Then } |x-20| \\in (9, 11), \\text{ so } |x-20| < 11.', annotation: '' },
        { expression: '|T(x)-102| < 0.01 \\cdot |x-10| \\cdot 11 = 0.11|x-10|', annotation: '' },
        { expression: '\\text{Need: } 0.11|x-10| < 0.5 \\implies |x-10| < 4.55', annotation: '' },
        { expression: '\\delta = \\min(1, 4.55) = 1 \\text{ mV}', annotation: 'The restriction δ ≤ 1 is the binding constraint.' },
      ],
      conclusion: 'The voltage must be controlled within ±1 mV of 10 mV to guarantee the temperature reading is within ±0.5°C. This is a real engineering ε-δ problem: given an output tolerance, find the required input precision. Every calibration procedure in science and manufacturing follows this pattern.',
    },
    {
      id: 'ex-ed-graph-delta',
      title: 'Graph-First ε-δ Extraction (From the Calc Problem Lab)',
      problem: 'For f(x)=\\sqrt{x+1} at a=3 and L=2, find a valid δ when ε=0.5 using the graph-box method.',
      visualizationId: 'EpsilonDelta',
      params: {
        fn: 'Math.sqrt(x+1)',
        c: 3,
        L: 2,
        getDelta: 'Math.min(3 - (Math.pow(2-e, 2) - 1), (Math.pow(2+e, 2) - 1) - 3)',
      },
      steps: [
        { expression: 'L\\pm\\varepsilon: \\ y=2\\pm0.5 \\Rightarrow y=2.5,\\ 1.5', annotation: 'Draw horizontal bounds of the epsilon-strip.' },
        { expression: '\\sqrt{x+1}=2.5 \\Rightarrow x=5.25, \\quad \\sqrt{x+1}=1.5 \\Rightarrow x=1.25', annotation: 'Read/solve x exit points where graph meets strip boundaries.' },
        { expression: '|5.25-3|=2.25,\\quad |1.25-3|=1.75', annotation: 'Measure both horizontal distances from a.' },
        { expression: '\\delta=\\min(2.25,1.75)=1.75', annotation: 'Take the smaller side so both directions stay in-band.' },
      ],
      conclusion: 'The graph method and formal definition agree: choosing δ=1.75 guarantees |f(x)-2|<0.5 whenever 0<|x-3|<δ.',
    },
    {
      id: 'ex-ed-proof-workflow',
      title: 'Scratch-Then-Formal Workflow (From the Calc Problem Lab)',
      problem: 'Prove with full workflow that lim_{x->2} x^2 = 4.',
      steps: [
        { expression: '\\textbf{Scratch: } |x^2-4|=|x-2||x+2|', annotation: 'Start by isolating the controllable factor |x-2|.' },
        { expression: '|x-2|<1 \\Rightarrow 1<x<3 \\Rightarrow |x+2|<5', annotation: 'Local cage to bound the uncontrolled factor.' },
        { expression: '|x^2-4|<5|x-2|', annotation: 'Now only one controllable factor remains.' },
        { expression: '\\delta=\\min(1,\\varepsilon/5)', annotation: 'One part keeps the cage valid, one part hits epsilon.' },
        { expression: '0<|x-2|<\\delta \\Rightarrow |x^2-4|<5\\delta\\le 5(\\varepsilon/5)=\\varepsilon', annotation: 'Formal proof chain.' },
      ],
      conclusion: 'This two-phase pattern is the stable template for nearly every nonlinear ε-δ proof.',
    },
  ],

  challenges: [
    {
      id: 'ch1-ed-c1',
      difficulty: 'easy',
      problem: 'Use ε-δ to prove \\displaystyle\\lim_{x \\to 5} (4x + 1) = 21.',
      hint: 'Compute |f(x) − 21| = |4x+1−21| = |4x−20| = 4|x−5|. Choose δ = ε/4.',
      walkthrough: [
        { expression: '|(4x+1) - 21| = |4x-20| = 4|x-5|', annotation: 'Output error = 4 × input error.' },
        { expression: '\\text{Need: } 4|x-5| < \\varepsilon \\iff |x-5| < \\varepsilon/4', annotation: '' },
        { expression: '\\text{Let } \\delta = \\varepsilon/4. \\text{ Then } |(4x+1)-21| = 4|x-5| < 4\\delta = \\varepsilon.\\;\\blacksquare', annotation: '' },
      ],
      answer: 'δ = ε/4',
    },
    {
      id: 'ch1-ed-c2',
      difficulty: 'medium',
      problem: 'Prove \\displaystyle\\lim_{x \\to 1} (x^2 + 2x) = 3 using ε-δ.',
      hint: '|x²+2x−3| = |(x−1)(x+3)|. Restrict δ ≤ 1 so |x+3| < 5.',
      walkthrough: [
        { expression: '|x^2+2x-3| = |(x-1)(x+3)| = |x-1||x+3|', annotation: '' },
        { expression: '\\delta \\leq 1 \\implies 0 < x < 2 \\implies 3 < x+3 < 5 \\implies |x+3| < 5', annotation: '' },
        { expression: '|x^2+2x-3| < 5|x-1|. \\text{ Need: } 5|x-1| < \\varepsilon \\iff |x-1| < \\varepsilon/5', annotation: '' },
        { expression: '\\delta = \\min(1, \\varepsilon/5).\\;\\blacksquare', annotation: '' },
      ],
      answer: 'δ = min(1, ε/5)',
    },
    {
      id: 'ch1-ed-c3',
      difficulty: 'hard',
      problem: 'Prove \\displaystyle\\lim_{x \\to 4} \\sqrt{x} = 2 using ε-δ.',
      hint: '|√x − 2| = |x−4|/(√x + 2). Since √x + 2 ≥ 2, we get |√x−2| ≤ |x−4|/2. So δ = 2ε works.',
      walkthrough: [
        { expression: '|\\sqrt{x} - 2| = \\frac{|\\sqrt{x}-2||\\sqrt{x}+2|}{|\\sqrt{x}+2|} = \\frac{|x-4|}{\\sqrt{x}+2}', annotation: 'Rationalize by multiplying and dividing by the conjugate √x + 2.' },
        { expression: '\\sqrt{x}+2 \\geq 0+2 = 2 \\quad \\text{(for } x \\geq 0\\text{)}', annotation: 'The denominator is at LEAST 2, so the fraction is at MOST |x−4|/2.' },
        { expression: '|\\sqrt{x}-2| \\leq \\frac{|x-4|}{2}', annotation: 'No min trick needed! The bound works for all x ≥ 0.' },
        { expression: '\\text{Need: } \\frac{|x-4|}{2} < \\varepsilon \\iff |x-4| < 2\\varepsilon', annotation: '' },
        { expression: '\\delta = 2\\varepsilon. \\text{ Then } |\\sqrt{x}-2| \\leq \\frac{|x-4|}{2} < \\frac{2\\varepsilon}{2} = \\varepsilon.\\;\\blacksquare', annotation: '' },
      ],
      answer: 'δ = 2ε',
    },
  ],

  crossRefs: [
    { lessonSlug: 'inequalities', label: 'Prerequisite: Properties of Inequalities', context: 'Epsilon-Delta proofs rely entirely on chaining inequalities safely, especially utilizing the Triangle Inequality.' },
    { lessonSlug: 'introduction', label: 'Previous: Intro to Limits', context: 'The informal definition of a limit — the ε-δ definition makes it rigorous.' },
    { lessonSlug: 'continuity', label: 'See Also: Continuity', context: 'Continuity at c means lim f(x) = f(c) — which is an ε-δ statement.' },
    { lessonSlug: 'squeeze-theorem', label: 'Next: Squeeze Theorem', context: 'The Squeeze Theorem is proved using ε-δ — it is a consequence of this definition.' },
  ],

  checkpoints: ['read-intuition', 'read-math', 'read-rigor', 'completed-example-1', 'completed-example-2', 'completed-example-3', 'solved-challenge'],
}
